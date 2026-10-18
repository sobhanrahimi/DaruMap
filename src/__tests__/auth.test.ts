import { describe, it, expect } from "vitest";
import { canManagePharmacy, authorizeStaffAction } from "@/lib/auth";

describe("PharmacyStaff Authority Verification", () => {
  it("verifies staff management authority using PharmacyStaff record", () => {
    const staff = {
      id: "staff-1",
      userId: "user-1",
      pharmacyId: "pharm-100",
      role: "STAFF",
    };

    expect(canManagePharmacy(staff, "pharm-100")).toBe(true);
    expect(canManagePharmacy(staff, "pharm-200")).toBe(false);
    expect(canManagePharmacy(null, "pharm-100")).toBe(false);
  });

  it("authorizes ADMIN actions across any pharmacy", () => {
    const result = authorizeStaffAction("ADMIN", undefined, "pharm-100");
    expect(result.authorized).toBe(true);
  });

  it("authorizes PHARMACY_STAFF action only for their assigned pharmacy", () => {
    const valid = authorizeStaffAction("PHARMACY_STAFF", "pharm-100", "pharm-100");
    expect(valid.authorized).toBe(true);

    const invalid = authorizeStaffAction("PHARMACY_STAFF", "pharm-100", "pharm-200");
    expect(invalid.authorized).toBe(false);
    expect(invalid.reason).toContain("مدیریت این داروخانه را بر عهده ندارید");
  });

  it("rejects regular users", () => {
    const result = authorizeStaffAction("USER", undefined, "pharm-100");
    expect(result.authorized).toBe(false);
    expect(result.reason).toContain("دسترسی غیرمجاز");
  });
});
