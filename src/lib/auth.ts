import crypto from "crypto";

export interface StaffMember {
  id: string;
  userId: string;
  pharmacyId: string;
  role: string;
}

export interface SessionUser {
  id: string;
  email: string;
  role: string;
  pharmacyId?: string;
}

const SESSION_SECRET = process.env.NEXTAUTH_SECRET || "daroomap-staging-session-secret-key-change-this";

/**
 * Creates a signed server-side session token.
 */
export function createSessionToken(user: SessionUser): string {
  const payload = Buffer.from(JSON.stringify(user)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");
  return `${payload}.${signature}`;
}

/**
 * Verifies a signed server-side session token with HMAC-SHA256 signature check.
 */
export function verifySessionToken(token: string | null | undefined): SessionUser | null {
  if (!token) return null;
  const parts = token.split(".");
  if (parts.length !== 2) return null;

  const [payload, signature] = parts;
  try {
    const expectedSignature = crypto
      .createHmac("sha256", SESSION_SECRET)
      .update(payload)
      .digest("base64url");

    if (signature.length !== expectedSignature.length) {
      return null;
    }

    const sigBuffer = Buffer.from(signature);
    const expBuffer = Buffer.from(expectedSignature);

    if (!crypto.timingSafeEqual(sigBuffer, expBuffer)) {
      return null;
    }

    return JSON.parse(Buffer.from(payload, "base64url").toString("utf-8")) as SessionUser;
  } catch {
    return null;
  }
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
