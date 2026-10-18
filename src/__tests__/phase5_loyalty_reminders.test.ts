import { describe, it, expect } from "vitest";
import { calculateLoyaltyTier, DEFAULT_LOYALTY_RULES } from "@/lib/loyalty";

describe("Phase 5 — Customer Loyalty Program Rules", () => {
  it("calculates correct tier thresholds (Bronze, Silver, Gold)", () => {
    expect(calculateLoyaltyTier(0)).toBe("BRONZE");
    expect(calculateLoyaltyTier(499)).toBe("BRONZE");
    expect(calculateLoyaltyTier(500)).toBe("SILVER");
    expect(calculateLoyaltyTier(1499)).toBe("SILVER");
    expect(calculateLoyaltyTier(1500)).toBe("GOLD");
    expect(calculateLoyaltyTier(3000)).toBe("GOLD");
  });

  it("calculates expected points per order amount in Toman", () => {
    const orderTotal1 = 50000; // 50,000 Toman / 10,000 = 5 points
    const points1 = Math.floor(orderTotal1 / DEFAULT_LOYALTY_RULES.tomanPerPoint);
    expect(points1).toBe(5);

    const orderTotal2 = 8000; // Less than 10,000 Toman = 0 points
    const points2 = Math.floor(orderTotal2 / DEFAULT_LOYALTY_RULES.tomanPerPoint);
    expect(points2).toBe(0);
  });
});

describe("Phase 5 — Medication Reminders & Time Validation Rules", () => {
  it("validates 24-hour HH:MM time format", () => {
    const timeRegex = /^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/;

    expect(timeRegex.test("08:00")).toBe(true);
    expect(timeRegex.test("14:30")).toBe(true);
    expect(timeRegex.test("23:59")).toBe(true);
    expect(timeRegex.test("25:00")).toBe(false);
    expect(timeRegex.test("8:60")).toBe(false);
    expect(timeRegex.test("invalid")).toBe(false);
  });
});
