"use server";

import { prisma } from "@/lib/db";
import { validateAndCalculateCart, CartItemInput } from "@/lib/order";

export interface CreateOrderResult {
  success: boolean;
  orderId?: string;
  error?: string;
}

export async function createOrderAction(
  items: CartItemInput[],
  deliveryAddress: string,
  userId?: string
): Promise<CreateOrderResult> {
  if (!items || items.length === 0) {
    return { success: false, error: "سبد خرید خالی است" };
  }

  if (!deliveryAddress || !deliveryAddress.trim()) {
    return { success: false, error: "آدرس تحویل الزامی است" };
  }

  const primaryPharmacyId = items[0].pharmacyId;
  for (const item of items) {
    if (item.pharmacyId !== primaryPharmacyId) {
      return {
        success: false,
        error: "امکان ثبت سفارش از چند داروخانه در یک سبد خرید وجود ندارد.",
      };
    }
    if (!item.quantity || item.quantity <= 0) {
      return {
        success: false,
        error: "تعداد قلم‌های درخواستی باید بیشتر از صفر باشد.",
      };
    }
  }

  try {
    // Execute inventory verification and order creation inside an atomic transaction
    return await prisma.$transaction(async (tx) => {
      const inventoryIds = items.map((item) => item.medicineId);
      const dbInventories = await tx.pharmacyInventory.findMany({
        where: {
          pharmacyId: primaryPharmacyId,
          medicineId: { in: inventoryIds },
        },
        include: { medicine: true },
      });

      const inventoryMap = new Map(dbInventories.map((inv) => [inv.medicineId, inv]));

      let calculatedTotalToman = 0;
      const verifiedOrderItems = [];

      for (const item of items) {
        const dbInv = inventoryMap.get(item.medicineId);
        if (!dbInv || !dbInv.isAvailable || dbInv.stock < item.quantity) {
          throw new Error(`داروی ${item.medicineNameFa} در انبار داروخانه موجود یا کافی نیست.`);
        }

        // Authoritative price check
        const unitPriceToman = dbInv.priceToman;
        calculatedTotalToman += unitPriceToman * item.quantity;

        verifiedOrderItems.push({
          medicineId: item.medicineId,
          quantity: item.quantity,
          unitPriceToman,
        });

        // Decrement stock atomically
        await tx.pharmacyInventory.update({
          where: { id: dbInv.id },
          data: {
            stock: dbInv.stock - item.quantity,
            isAvailable: dbInv.stock - item.quantity > 0,
          },
        });
      }

      let targetUserId = userId;
      if (!targetUserId) {
        const defaultUser = await tx.user.findFirst({
          where: { role: "CUSTOMER" },
        });
        if (defaultUser) {
          targetUserId = defaultUser.id;
        } else {
          const createdUser = await tx.user.create({
            data: {
              email: "guest@daroomap.ir",
              name: "کاربر مهمان",
              role: "CUSTOMER",
            },
          });
          targetUserId = createdUser.id;
        }
      }

      const order = await tx.order.create({
        data: {
          userId: targetUserId,
          pharmacyId: primaryPharmacyId,
          totalToman: calculatedTotalToman,
          status: "PENDING",
          deliveryAddress: deliveryAddress.trim(),
          items: {
            create: verifiedOrderItems,
          },
        },
      });

      return {
        success: true,
        orderId: order.id,
      };
    });
  } catch (err: any) {
    console.error("Order creation transaction failed:", err);
    return {
      success: false,
      error: err.message || "خطا در ثبت سفارش در دیتابیس",
    };
  }
}

// ==========================================
// Phase 2: Pharmacy Onboarding & Verification
// ==========================================

export interface RegisterPharmacyInput {
  name: string;
  licenseNo: string;
  address: string;
  city: string;
  phone: string;
  latitude: number;
  longitude: number;
  documentUrl?: string;
}

export async function registerPharmacyAction(input: RegisterPharmacyInput) {
  if (!input.name || !input.licenseNo || !input.phone || !input.address) {
    return { success: false, error: "اطلاعات الزامی داروخانه تکمیل نشده است." };
  }

  try {
    const existing = await prisma.pharmacy.findUnique({
      where: { licenseNo: input.licenseNo },
    });
    if (existing) {
      return { success: false, error: "داروخانه‌ای با این شماره پروانه قبلاً ثبت شده است." };
    }

    const pharmacy = await prisma.pharmacy.create({
      data: {
        name: input.name,
        licenseNo: input.licenseNo,
        address: input.address,
        city: input.city,
        phone: input.phone,
        latitude: input.latitude,
        longitude: input.longitude,
        isVerified: false, // Must be reviewed by Admin
        verifications: {
          create: {
            status: "PENDING",
            documentUrl: input.documentUrl || null,
          },
        },
      },
    });

    return { success: true, pharmacyId: pharmacy.id };
  } catch (err: any) {
    console.error("Pharmacy registration failed:", err);
    return { success: false, error: "خطا در ثبت درخواست داروخانه" };
  }
}

export async function approvePharmacyAction(pharmacyId: string, adminUserId: string) {
  try {
    const adminUser = await prisma.user.findUnique({ where: { id: adminUserId } });
    if (!adminUser || adminUser.role !== "ADMIN") {
      return { success: false, error: "دسترسی غیرمجاز. فقط مدیر سیستم امکان تایید داروخانه را دارد." };
    }

    const updatedPharmacy = await prisma.pharmacy.update({
      where: { id: pharmacyId },
      data: {
        isVerified: true,
        verifications: {
          updateMany: {
            where: { pharmacyId, status: "PENDING" },
            data: { status: "APPROVED", reviewedBy: adminUserId },
          },
        },
      },
    });

    return { success: true, isVerified: updatedPharmacy.isVerified };
  } catch (err: any) {
    console.error("Pharmacy approval failed:", err);
    return { success: false, error: "خطا در تایید داروخانه" };
  }
}

// ==========================================
// Phase 2: Medicine & Product Catalog Management
// ==========================================

export async function createMedicineCatalogAction(data: {
  nameFa: string;
  nameEn?: string;
  genericName?: string;
  description?: string;
  requiresRecipe?: boolean;
  category?: string;
}) {
  if (!data.nameFa) {
    return { success: false, error: "نام فارسی دارو الزامی است." };
  }

  try {
    const medicine = await prisma.medicine.create({
      data: {
        nameFa: data.nameFa,
        nameEn: data.nameEn,
        genericName: data.genericName,
        description: data.description,
        requiresRecipe: data.requiresRecipe ?? false,
        category: data.category,
      },
    });
    return { success: true, medicineId: medicine.id };
  } catch (err: any) {
    console.error("Medicine creation failed:", err);
    return { success: false, error: "خطا در ثبت داروی جدید در کاتالوگ" };
  }
}

export async function createProductCategoryAction(data: { name: string; description?: string }) {
  if (!data.name) {
    return { success: false, error: "نام دسته‌بندی الزامی است." };
  }

  try {
    const category = await prisma.productCategory.create({
      data: {
        name: data.name,
        description: data.description,
      },
    });
    return { success: true, categoryId: category.id };
  } catch (err: any) {
    console.error("Category creation failed:", err);
    return { success: false, error: "خطا در ثبت دسته‌بندی محصولات" };
  }
}

// ==========================================
// Phase 2: Pharmacy Inventory Record Management
// ==========================================

export async function upsertPharmacyInventoryAction(data: {
  userId: string;
  targetPharmacyId: string;
  medicineId: string;
  priceToman: number;
  stock: number;
  isAvailable?: boolean;
}) {
  if (data.priceToman < 0 || data.stock < 0) {
    return { success: false, error: "قیمت به تومان و تعداد موجودی نباید منفی باشند." };
  }

  try {
    const user = await prisma.user.findUnique({ where: { id: data.userId } });
    if (!user) {
      return { success: false, error: "کاربر یافت نشد." };
    }

    if (user.role !== "ADMIN") {
      const membership = await prisma.pharmacyMembership.findFirst({
        where: {
          userId: data.userId,
          pharmacyId: data.targetPharmacyId,
          isApproved: true,
        },
      });

      if (!membership) {
        return { success: false, error: "شما دسترسی مجاز برای تغییر انبار این داروخانه را ندارید." };
      }
    }

    const existing = await prisma.pharmacyInventory.findFirst({
      where: {
        pharmacyId: data.targetPharmacyId,
        medicineId: data.medicineId,
      },
    });

    if (existing) {
      const updated = await prisma.pharmacyInventory.update({
        where: { id: existing.id },
        data: {
          priceToman: data.priceToman,
          stock: data.stock,
          isAvailable: data.isAvailable ?? data.stock > 0,
          updatedAt: new Date(),
        },
      });
      return { success: true, inventoryId: updated.id, updated: true };
    } else {
      const created = await prisma.pharmacyInventory.create({
        data: {
          pharmacyId: data.targetPharmacyId,
          medicineId: data.medicineId,
          priceToman: data.priceToman,
          stock: data.stock,
          isAvailable: data.isAvailable ?? data.stock > 0,
        },
      });
      return { success: true, inventoryId: created.id, updated: false };
    }
  } catch (err: any) {
    console.error("Inventory update failed:", err);
    return { success: false, error: "خطا در به‌روزرسانی انبار داروخانه" };
  }
}
