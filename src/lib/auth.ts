/**
 * PharmacyStaff authority & authorization helper.
 * PharmacyStaff is the authoritative model granting staff access to a specific pharmacy.
 */

export interface StaffMember {
  id: string;
  userId: string;
  pharmacyId: string;
  role: string;
}

export function canManagePharmacy(
  staffRecord: StaffMember | null | undefined,
  targetPharmacyId: string
): boolean {
  if (!staffRecord) return false;
  return staffRecord.pharmacyId === targetPharmacyId;
}

export function authorizeStaffAction(
  userRole: string,
  staffPharmacyId: string | undefined,
  targetPharmacyId: string
): { authorized: boolean; reason?: string } {
  if (userRole === "ADMIN") {
    return { authorized: true };
  }

  if (userRole === "PHARMACY_STAFF") {
    if (staffPharmacyId === targetPharmacyId) {
      return { authorized: true };
    }
    return {
      authorized: false,
      reason: "شما مدیریت این داروخانه را بر عهده ندارید.",
    };
  }

  return {
    authorized: false,
    reason: "دسترسی غیرمجاز. فقط پرسنل داروخانه یا مدیر سیستم دسترسی دارند.",
  };
}
