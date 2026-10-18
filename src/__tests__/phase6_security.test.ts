import { describe, it, expect } from "vitest";
import { validateFileMetadata } from "@/lib/storage";
import { validateCoordinates } from "@/lib/location";
import { authorizeStaffAction } from "@/lib/auth";

describe("Phase 6 — Full System Security & Access Audit", () => {
  it("rejects path traversal attempts and invalid file types in storage manager", () => {
    const maliciousExt = validateFileMetadata("../../../etc/passwd", "image/jpeg", 1024);
    expect(maliciousExt.valid).toBe(false);

    const oversizedFile = validateFileMetadata("rx.jpg", "image/jpeg", 10 * 1024 * 1024);
    expect(oversizedFile.valid).toBe(false);
  });

  it("validates coordinate boundaries to prevent out-of-bounds geographic queries", () => {
    expect(validateCoordinates(35.7592, 51.4056)).toBe(true);
    expect(validateCoordinates(91.0, 51.4056)).toBe(false);
    expect(validateCoordinates(35.7592, 181.0)).toBe(false);
  });

  it("enforces strict server-side authorization checks for pharmacy staff and admin roles", () => {
    // Admin access
    expect(authorizeStaffAction("ADMIN", undefined, "pharm-1").authorized).toBe(true);

    // Matching pharmacy staff access
    expect(authorizeStaffAction("PHARMACY_STAFF", "pharm-1", "pharm-1").authorized).toBe(true);

    // Cross-pharmacy access denial
    const crossAccess = authorizeStaffAction("PHARMACY_STAFF", "pharm-1", "pharm-2");
    expect(crossAccess.authorized).toBe(false);
    expect(crossAccess.reason).toContain("مدیریت این داروخانه را بر عهده ندارید");

    // Regular customer access denial
    const customerAccess = authorizeStaffAction("CUSTOMER", undefined, "pharm-1");
    expect(customerAccess.authorized).toBe(false);
    expect(customerAccess.reason).toContain("دسترسی غیرمجاز");
  });
});
