import { prisma } from "@/lib/db";

export interface CreateReminderInput {
  userId: string;
  medicineName: string;
  dosage: string; // e.g. "۱ عدد قرص"
  timeOfDay: string; // e.g. "08:00" or "14:30" (24h format)
}

export interface DoseActionInput {
  userId: string;
  reminderId: string;
  action: "TAKEN" | "SKIPPED";
  scheduledTime: string; // ISO String date or time label
}

/**
 * Creates a medication reminder with server-side ownership isolation.
 */
export async function createMedicationReminder(input: CreateReminderInput) {
  if (!input.userId || !input.medicineName || !input.dosage || !input.timeOfDay) {
    throw new Error("تکمیل تمام فیلدهای نام دارو، دوز و زمان یادآور الزامی است.");
  }

  // Validate time format HH:MM
  const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;
  if (!timeRegex.test(input.timeOfDay.trim())) {
    throw new Error("فرمت زمان یادآور باید به صورت HH:MM باشد (مانند 08:00 یا 20:30).");
  }

  return await prisma.medicationReminder.create({
    data: {
      userId: input.userId,
      medicineName: input.medicineName.trim(),
      dosage: input.dosage.trim(),
      timeOfDay: input.timeOfDay.trim(),
      isActive: true,
    },
  });
}

/**
 * Retrieves all reminders for authenticated user.
 */
export async function getUserMedicationReminders(userId: string) {
  if (!userId) return [];

  return await prisma.medicationReminder.findMany({
    where: { userId },
    orderBy: { createdAt: "desc" },
  });
}

/**
 * Toggles active/paused status of reminder with strict ownership check.
 */
export async function toggleReminderStatus(reminderId: string, userId: string, isActive: boolean) {
  const reminder = await prisma.medicationReminder.findUnique({
    where: { id: reminderId },
  });

  if (!reminder || reminder.userId !== userId) {
    throw new Error("یادآور دارویی یافت نشد یا غیرمجاز است.");
  }

  return await prisma.medicationReminder.update({
    where: { id: reminderId },
    data: { isActive },
  });
}

/**
 * Deletes a reminder with strict ownership check.
 */
export async function deleteReminderForUser(reminderId: string, userId: string) {
  const reminder = await prisma.medicationReminder.findUnique({
    where: { id: reminderId },
  });

  if (!reminder || reminder.userId !== userId) {
    throw new Error("یادآور دارویی یافت نشد یا غیرمجاز است.");
  }

  await prisma.medicationReminder.delete({
    where: { id: reminderId },
  });

  return true;
}

/**
 * Dose occurrence tracking (taken or skipped) with idempotency protection.
 */
export async function recordDoseOccurrence(input: DoseActionInput) {
  const reminder = await prisma.medicationReminder.findUnique({
    where: { id: input.reminderId },
  });

  if (!reminder || reminder.userId !== input.userId) {
    throw new Error("یادآور دارویی یافت نشد یا شما مالک این یادآور نیستید.");
  }

  const actionKey = `DOSE_ACTION:${input.reminderId}:${input.scheduledTime}:${input.action}`;

  // Idempotency check in AuditLog using atomic transaction
  try {
    return await prisma.$transaction(async (tx) => {
      const existingLog = await tx.auditLog.findFirst({
        where: {
          userId: input.userId,
          action: actionKey,
        },
      });

      if (existingLog) {
        return { recorded: false, reason: "مصرف این نوبت قبلاً ثبت گردیده است." };
      }

      await tx.auditLog.create({
        data: {
          userId: input.userId,
          action: actionKey,
          details: `Medicine:${reminder.medicineName}|Dosage:${reminder.dosage}|Time:${input.scheduledTime}|Status:${input.action}`,
        },
      });

      return { recorded: true, action: input.action, medicineName: reminder.medicineName };
    });
  } catch (err: unknown) {
    const isP2002 = typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002";
    if (isP2002) {
      return { recorded: false, reason: "مصرف این نوبت قبلاً ثبت گردیده است." };
    }
    throw err;
  }
}

/**
 * Persistent Server-Side Background Worker Service for Due Reminders
 * Dispatches in-app notifications with atomic idempotency transactions and DB-level unique constraint handling.
 */
export async function dispatchDueRemindersService(currentTimeHHMM?: string) {
  const now = new Date();
  const hours = String(now.getHours()).padStart(2, "0");
  const minutes = String(now.getMinutes()).padStart(2, "0");
  const targetTime = currentTimeHHMM || `${hours}:${minutes}`;

  // Query active reminders matching current time
  const dueReminders = await prisma.medicationReminder.findMany({
    where: {
      isActive: true,
      timeOfDay: targetTime,
    },
    include: {
      user: true,
    },
  });

  let dispatchedCount = 0;

  for (const reminder of dueReminders) {
    const todayStr = now.toISOString().split("T")[0];
    const dispatchKey = `NOTIFICATION_DISPATCH:${reminder.id}:${todayStr}:${targetTime}`;

    try {
      await prisma.$transaction(async (tx) => {
        const existingDispatch = await tx.auditLog.findFirst({
          where: {
            userId: reminder.userId,
            action: dispatchKey,
          },
        });

        if (!existingDispatch) {
          // Record dispatch audit log lock first
          await tx.auditLog.create({
            data: {
              userId: reminder.userId,
              action: dispatchKey,
              details: `Dispatched reminder ${reminder.id} to user ${reminder.userId}`,
            },
          });

          // Create persistent in-app notification
          await tx.notification.create({
            data: {
              userId: reminder.userId,
              title: "⏰ زمان مصرف دارو",
              message: `زمان مصرف داروی ${reminder.medicineName} (مقدار: ${reminder.dosage}) فرا رسیده است.`,
              isRead: false,
            },
          });

          dispatchedCount++;
        }
      });
    } catch (err: unknown) {
      // P2002 is Prisma's Unique Constraint Violation error code
      const isP2002 = typeof err === "object" && err !== null && "code" in err && (err as { code?: string }).code === "P2002";
      if (isP2002) {
        // Concurrency collision caught gracefully at DB engine level
        continue;
      }
      throw err;
    }
  }

  return { dispatchedCount, targetTime };
}
