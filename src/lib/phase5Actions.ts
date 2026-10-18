"use server";

import { prisma } from "@/lib/db";
import {
  joinLoyaltyProgram,
  getCustomerLoyaltyStatus,
  awardLoyaltyPointsForOrder,
} from "@/lib/loyalty";

import {
  createMedicationReminder,
  getUserMedicationReminders,
  toggleReminderStatus,
  deleteReminderForUser,
  recordDoseOccurrence,
  dispatchDueRemindersService,
} from "@/lib/reminders";

export async function joinLoyaltyProgramAction(userId: string) {
  try {
    const membership = await joinLoyaltyProgram(userId);
    return { success: true, membership };
  } catch (err: any) {
    return { success: false, error: err.message || "خطا در عضویت در باشگاه مشتریان" };
  }
}

export async function getLoyaltyStatusAction(userId: string) {
  try {
    const status = await getCustomerLoyaltyStatus(userId);
    return { success: true, status };
  } catch (err: any) {
    return { success: false, error: err.message || "خطا در دریافت وضعیت باشگاه مشتریان" };
  }
}

export async function awardOrderLoyaltyPointsAction(userId: string, orderId: string) {
  try {
    const result = await awardLoyaltyPointsForOrder(userId, orderId);
    return { success: true, result };
  } catch (err: any) {
    return { success: false, error: err.message || "خطا در ثبت امتیاز سفارش" };
  }
}

export async function createReminderAction(
  userId: string,
  medicineName: string,
  dosage: string,
  timeOfDay: string
) {
  try {
    const reminder = await createMedicationReminder({
      userId,
      medicineName,
      dosage,
      timeOfDay,
    });
    return { success: true, reminder };
  } catch (err: any) {
    return { success: false, error: err.message || "خطا در ایجاد یادآور دارویی" };
  }
}

export async function getRemindersAction(userId: string) {
  try {
    const reminders = await getUserMedicationReminders(userId);
    return { success: true, reminders };
  } catch (err: any) {
    return { success: false, reminders: [], error: "خطا در دریافت لیست یادآورها" };
  }
}

export async function toggleReminderStatusAction(
  reminderId: string,
  userId: string,
  isActive: boolean
) {
  try {
    const reminder = await toggleReminderStatus(reminderId, userId, isActive);
    return { success: true, reminder };
  } catch (err: any) {
    return { success: false, error: err.message || "خطا در تغییر وضعیت یادآور" };
  }
}

export async function deleteReminderAction(reminderId: string, userId: string) {
  try {
    await deleteReminderForUser(reminderId, userId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "خطا در حذف یادآور" };
  }
}

export async function recordDoseAction(
  userId: string,
  reminderId: string,
  action: "TAKEN" | "SKIPPED",
  scheduledTime: string
) {
  try {
    const result = await recordDoseOccurrence({
      userId,
      reminderId,
      action,
      scheduledTime,
    });
    return { success: true, result };
  } catch (err: any) {
    return { success: false, error: err.message || "خطا در ثبت وضعیت مصرف دارو" };
  }
}

export async function processScheduledRemindersAction(currentTimeHHMM?: string) {
  try {
    const res = await dispatchDueRemindersService(currentTimeHHMM);
    return { success: true, dispatchedCount: res.dispatchedCount, targetTime: res.targetTime };
  } catch (err: any) {
    return { success: false, error: err.message || "خطا در پردازش ارسال یادآورها" };
  }
}
