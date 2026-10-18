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
  const validation = validateAndCalculateCart(items);
  if (!validation.isValid || !validation.pharmacyId) {
    return {
      success: false,
      error: validation.error || "سبد خرید نامعتبر است",
    };
  }

  if (!deliveryAddress || !deliveryAddress.trim()) {
    return {
      success: false,
      error: "آدرس تحویل الزامی است",
    };
  }

  try {
    // If no userId is provided, look up or create a default customer for demo orders
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
            email: "guest@daroomap.ir",
            name: "کاربر مهمان",
            role: "CUSTOMER",
          },
        });
        targetUserId = createdUser.id;
      }
    }

    const order = await prisma.order.create({
      data: {
        userId: targetUserId,
        pharmacyId: validation.pharmacyId,
        totalToman: validation.totalToman,
        status: "PENDING",
        deliveryAddress: deliveryAddress.trim(),
        items: {
          create: items.map((item) => ({
            medicineId: item.medicineId,
            quantity: item.quantity,
            unitPriceToman: item.unitPriceToman,
          })),
        },
      },
    });

    return {
      success: true,
      orderId: order.id,
    };
  } catch (err: any) {
    console.error("Order creation failed:", err);
    return {
      success: false,
      error: "خطا در ثبت سفارش در دیتابیس",
    };
  }
}
