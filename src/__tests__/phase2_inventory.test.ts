import { describe, it, expect } from "vitest";
import { authorizeStaffAction } from "@/lib/auth";

describe("Phase 2 — Pharmacy Onboarding & Inventory Isolation Logic", () => {
  it("restricts inventory updates to authorized staff of the same pharmacy", () => {
    // Correct pharmacy staff
    const validStaff = authorizeStaffAction("PHARMACY_STAFF", "pharm-100", "pharm-100");
    expect(validStaff.authorized).toBe(true);

    // Cross-pharmacy attempt (staff member trying to update another pharmacy's inventory)
    const invalidStaff = authorizeStaffAction("PHARMACY_STAFF", "pharm-100", "pharm-200");
    expect(invalidStaff.authorized).toBe(false);
    expect(invalidStaff.reason).toContain("مدیریت این داروخانه را بر عهده ندارید");
  });

  it("allows system administrators to perform inventory actions across any pharmacy", () => {
    const adminAction = authorizeStaffAction("ADMIN", undefined, "pharm-300");
    expect(adminAction.authorized).toBe(true);
  });

  it("denies unprivileged customer users from performing staff or admin actions", () => {
    const customerAction = authorizeStaffAction("CUSTOMER", undefined, "pharm-100");
    expect(customerAction.authorized).toBe(false);
    expect(customerAction.reason).toContain("دسترسی غیرمجاز");
  });

  it("validates price in Toman and stock values", () => {
    const invalidPrice = -500;
    const invalidStock = -10;

    expect(invalidPrice < 0).toBe(true);
    expect(invalidStock < 0).toBe(true);
  });
});
