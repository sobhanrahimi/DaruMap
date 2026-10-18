"use server";

import { prisma } from "@/lib/db";
import { storePrivateFileBuffer } from "@/lib/storage";
import {
  createPrescriptionRecord,
  getUserPrescriptions,
  deletePrescriptionForUser,
  addManualMedicineToPrescription,
  processPrescriptionOCR,
  seedInsuranceProviders,
} from "@/lib/prescriptions";

export async function uploadPrescriptionAction(formData: FormData, userId?: string) {
  try {
    const file = formData.get("file") as File | null;
    const notes = (formData.get("notes") as string) || undefined;
    const insuranceProviderId = (formData.get("insuranceProviderId") as string) || undefined;

    if (!file || file.size === 0) {
      return { success: false, error: "لطفاً تصویر یا فایل نسخه را انتخاب کنید." };
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const stored = storePrivateFileBuffer(buffer, file.name, file.type);

    let targetUserId = userId;
    if (!targetUserId) {
      const defaultUser = await prisma.user.findFirst({
        where: { role: "CUSTOMER" },
      });
      if (defaultUser) {
        targetUserId = defaultUser.id;
      } else {
        const createdUser = await prisma.user.create({
          data: {
            email: "customer@daroomap.ir",
            name: "مشتری نمونه",
            role: "CUSTOMER",
          },
        });
        targetUserId = createdUser.id;
      }
    }

    const record = await createPrescriptionRecord({
      userId: targetUserId,
      fileId: stored.fileId,
      notes,
      insuranceProviderId,
    });

    return {
      success: true,
      prescriptionId: record.id,
      fileId: stored.fileId,
      status: record.status,
    };
  } catch (err: any) {
    console.error("Prescription upload error:", err);
    return {
      success: false,
      error: err.message || "خطا در بارگذاری نسخه.",
    };
  }
}

export async function getCustomerPrescriptionsAction(userId: string) {
  try {
    const prescriptions = await getUserPrescriptions(userId);
    return { success: true, prescriptions };
  } catch (err: any) {
    return { success: false, prescriptions: [], error: "خطا در دریافت لیست نسخه‌ها" };
  }
}

export async function deletePrescriptionAction(prescriptionId: string, userId: string) {
  try {
    await deletePrescriptionForUser(prescriptionId, userId);
    return { success: true };
  } catch (err: any) {
    return { success: false, error: err.message || "خطا در حذف نسخه" };
  }
}

export async function addPrescriptionItemAction(
  prescriptionId: string,
  userId: string,
  medicineName: string,
  quantity = 1
) {
  try {
    const res = await addManualMedicineToPrescription(userId, {
      prescriptionId,
      medicineName,
      quantity,
    });
    return {
      success: true,
      item: res.item,
      inCatalog: res.inCatalog,
    };
  } catch (err: any) {
    return { success: false, error: err.message || "خطا در افزودن داروی جدید به نسخه" };
  }
}

export async function getInsuranceProvidersAction() {
  try {
    const providers = await seedInsuranceProviders();
    return { success: true, providers };
  } catch (err: any) {
    return { success: false, providers: [], error: "خطا در دریافت لیست بیمه‌ها" };
  }
}

export async function requestPrescriptionOCRAction(prescriptionId: string, userId: string) {
  try {
    const result = await processPrescriptionOCR(prescriptionId, userId);
    return { success: true, result };
  } catch (err: any) {
    return { success: false, error: err.message || "خطا در استخراج متن نسخه" };
  }
}
