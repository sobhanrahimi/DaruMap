import { prisma } from "@/lib/db";

export interface LoyaltyPointsRuleConfig {
  tomanPerPoint: number; // e.g. 10,000 Toman = 1 Point
  silverTierThreshold: number; // e.g. 500 points
  goldTierThreshold: number; // e.g. 1500 points
}

export const DEFAULT_LOYALTY_RULES: LoyaltyPointsRuleConfig = {
  tomanPerPoint: 10000,
  silverTierThreshold: 500,
  goldTierThreshold: 1500,
};

/**
 * Calculates tier status based on point balance.
 */
export function calculateLoyaltyTier(
  points: number,
  rules: LoyaltyPointsRuleConfig = DEFAULT_LOYALTY_RULES
): "BRONZE" | "SILVER" | "GOLD" {
  if (points >= rules.goldTierThreshold) return "GOLD";
  if (points >= rules.silverTierThreshold) return "SILVER";
  return "BRONZE";
}

/**
 * Ensures customer joins loyalty program without duplicate records.
 */
export async function joinLoyaltyProgram(userId: string) {
  if (!userId) throw new Error("شناسه کاربر الزامی است.");

  // Get or create customer profile
  let profile = await prisma.customerProfile.findUnique({
    where: { userId },
  });

  if (!profile) {
    profile = await prisma.customerProfile.create({
      data: { userId },
    });
  }

  // Idempotent check for loyalty membership
  const existingMembership = await prisma.loyaltyMembership.findUnique({
    where: { customerProfileId: profile.id },
  });

  if (existingMembership) {
    return existingMembership;
  }

  return await prisma.loyaltyMembership.create({
    data: {
      customerProfileId: profile.id,
      points: 0,
      tier: "BRONZE",
    },
  });
}

/**
 * Returns loyalty membership details for customer with ownership check.
 */
export async function getCustomerLoyaltyStatus(userId: string) {
  const profile = await prisma.customerProfile.findUnique({
    where: { userId },
    include: {
      loyaltyMembership: true,
    },
  });

  if (!profile || !profile.loyaltyMembership) {
    return null;
  }

  return profile.loyaltyMembership;
}

/**
 * Award loyalty points for completed eligible order with idempotency protection.
 */
export async function awardLoyaltyPointsForOrder(
  userId: string,
  orderId: string,
  rules: LoyaltyPointsRuleConfig = DEFAULT_LOYALTY_RULES
) {
  return await prisma.$transaction(async (tx) => {
    // Look up order and verify status
    const order = await tx.order.findUnique({
      where: { id: orderId },
    });

    if (!order || order.userId !== userId) {
      throw new Error("سفارش یافت نشد یا غیرمجاز است.");
    }

    if (order.status !== "CONFIRMED" && order.status !== "DELIVERED") {
      throw new Error("امتیاز فقط برای سفارشات تاییدشده یا تحویل‌شده اعطا می‌شود.");
    }

    // Check if points were already awarded for this order in AuditLog
    const existingAward = await tx.auditLog.findFirst({
      where: {
        userId,
        action: "LOYALTY_POINTS_AWARDED",
        details: { contains: orderId },
      },
    });

    if (existingAward) {
      return { awarded: false, reason: "امتیاز این سفارش قبلاً اعطا شده است." };
    }

    // Ensure customer has loyalty membership
    let profile = await tx.customerProfile.findUnique({
      where: { userId },
      include: { loyaltyMembership: true },
    });

    if (!profile) {
      profile = await tx.customerProfile.create({
        data: { userId },
        include: { loyaltyMembership: true },
      });
    }

    let membership = profile.loyaltyMembership;
    if (!membership) {
      membership = await tx.loyaltyMembership.create({
        data: {
          customerProfileId: profile.id,
          points: 0,
          tier: "BRONZE",
        },
      });
    }

    const pointsToAward = Math.floor(order.totalToman / rules.tomanPerPoint);
    if (pointsToAward <= 0) {
      return { awarded: false, pointsAwarded: 0, reason: "مبلغ سفارش کمتر از حداقل آستانه اعطای امتیاز است." };
    }

    const updatedPoints = membership.points + pointsToAward;
    const newTier = calculateLoyaltyTier(updatedPoints, rules);

    const updatedMembership = await tx.loyaltyMembership.update({
      where: { id: membership.id },
      data: {
        points: updatedPoints,
        tier: newTier,
      },
    });

    // Record immutable audit log entry for points award
    await tx.auditLog.create({
      data: {
        userId,
        action: "LOYALTY_POINTS_AWARDED",
        details: `Order:${orderId}|Points:${pointsToAward}|TotalToman:${order.totalToman}`,
      },
    });

    return {
      awarded: true,
      pointsAwarded: pointsToAward,
      newTotalPoints: updatedMembership.points,
      tier: updatedMembership.tier,
    };
  });
}
