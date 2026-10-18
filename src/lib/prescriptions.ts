import { prisma } from "@/lib/db";
import { deletePrivateFile } from "@/lib/storage";

export interface PrescriptionInput {
  userId: string;
  fileId: string;
  notes?: string;
  insuranceProviderId?: string;
}

export interface PrescriptionItemInput {
  prescriptionId: string;
  medicineName: string;
  quantity?: number;
}

export interface OCRResult {
  status: "PENDING_OCR" | "EXTRACTED_UNVERIFIED" | "UNSUPPORTED";
  extractedText?: string;
  extractedMedicines?: { name: string; quantity: number }[];
  message: string;
}

/**
 * Seeds or returns standard Iranian insurance providers
 */
export async function seedInsuranceProviders() {
  const defaultProviders = [
    { name: "تأمین اجتماعی", code: "TAMIN", description: "سازمان تأمین اجتماعی کشور" },
    { name: "بیمه سلامت", code: "SALAMAT", description: "سازمان بیمه سلامت ایران" },
    { name: "نیروهای مسلح", code: "ARMED_FORCES", description: "بیمه خدمات درمانی نیروهای مسلح" },
    { name: "خدمات درمانی", code: "KHADAMAT", description: "بیمه خدمات درمانی" },
    { name: "سایر", code: "OTHER", description: "سایر بیمه‌های تکمیلی یا اختصاصی" },
  ];

  for (const provider of defaultProviders) {
    await prisma.insuranceProvider.upsert({
      where: { code: provider.code },
      update: {},
      create: provider,
    });
  }

  return await prisma.insuranceProvider.findMany({
    orderBy: { name: "asc" },
  });
}

/**
 * Customer Prescription Management Services
 * Enforces strict user ownership isolation.
 */
export async function createPrescriptionRecord(input: PrescriptionInput) {
  if (!input.userId || !input.fileId) {
    throw new Error("شناسه کاربر و شناسه فایل نسخه الزامی است.");
  }

  // Update customer profile insurance if provided
  if (input.insuranceProviderId) {
    const profile = await prisma.customerProfile.findUnique({
      where: { userId: input.userId },
    });
    if (profile) {
      await prisma.customerProfile.update({
        where: { id: profile.id },
        data: { insuranceProviderId: input.insuranceProviderId },
      });
    } else {
      await prisma.customerProfile.create({
        data: {
          userId: input.userId,
          insuranceProviderId: input.insuranceProviderId,
        },
      });
    }
  }

  const prescription = await prisma.prescription.create({
    data: {
      userId: input.userId,
      imageUrl: input.fileId, // Private storage file ID
      notes: input.notes,
      status: "PENDING", // Initial state
    },
    include: {
      items: true,
      user: {
        select: {
          id: true,
          name: true,
          email: true,
        },
      },
    },
  });

  return prescription;
}

export async function getUserPrescriptions(userId: string) {
  if (!userId) return [];

  return await prisma.prescription.findMany({
    where: { userId },
    include: {
      items: true,
    },
    orderBy: { createdAt: "desc" },
  });
}

export async function getPrescriptionByIdForUser(prescriptionId: string, userId: string) {
  const prescription = await prisma.prescription.findUnique({
    where: { id: prescriptionId },
    include: {
      items: true,
    },
  });

  // Strict ownership enforcement
  if (!prescription || prescription.userId !== userId) {
    return null;
  }

  return prescription;
}

export async function deletePrescriptionForUser(prescriptionId: string, userId: string) {
  const prescription = await getPrescriptionByIdForUser(prescriptionId, userId);
  if (!prescription) {
    throw new Error("نسخه یافت نشد یا دسترسی غیرمجاز است.");
  }

  // Clean up private file from filesystem
  deletePrivateFile(prescription.imageUrl);

  await prisma.prescription.delete({
    where: { id: prescriptionId },
  });

  return true;
}

/**
 * Manual Prescription Medicine Entry with Catalog Search Verification
 */
export async function addManualMedicineToPrescription(
  userId: string,
  input: PrescriptionItemInput
) {
  const prescription = await getPrescriptionByIdForUser(input.prescriptionId, userId);
  if (!prescription) {
    throw new Error("نسخه یافت نشد یا شما مالک این نسخه نیستید.");
  }

  if (!input.medicineName || !input.medicineName.trim()) {
    throw new Error("نام داروی درخواستی الزامی است.");
  }

  const trimmedName = input.medicineName.trim();

  // Check if medicine exists in catalog
  const catalogMatch = await prisma.medicine.findFirst({
    where: {
      OR: [
        { nameFa: { contains: trimmedName } },
        { nameEn: { contains: trimmedName } },
        { genericName: { contains: trimmedName } },
      ],
    },
  });

  const item = await prisma.prescriptionItem.create({
    data: {
      prescriptionId: input.prescriptionId,
      medicineName: trimmedName,
      quantity: input.quantity && input.quantity > 0 ? input.quantity : 1,
    },
  });

  return {
    item,
    inCatalog: catalogMatch !== null,
    catalogMedicineId: catalogMatch?.id,
  };
}

/**
 * OCR-Ready Interface Abstraction
 */
export async function processPrescriptionOCR(
  prescriptionId: string,
  userId: string
): Promise<OCRResult> {
  const prescription = await getPrescriptionByIdForUser(prescriptionId, userId);
  if (!prescription) {
    throw new Error("نسخه یافت نشد.");
  }

  // Phase 4 OCR abstraction return state
  return {
    status: "UNSUPPORTED",
    message: "سرویس استخراج خودکار متن نسخه (OCR) در حال حاضر در فاز توسعه قرار دارد و می‌توانید داروها را به صورت دستی وارد نمایید.",
  };
}
