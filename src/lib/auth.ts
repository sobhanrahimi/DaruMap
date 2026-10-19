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
  exp?: number; // Expiration epoch timestamp in seconds
}

const SESSION_SECRET = process.env.NEXTAUTH_SECRET || "daroomap-staging-session-secret-key-change-this";
const DEFAULT_SESSION_DURATION_SECONDS = 7 * 24 * 3600; // 7 days

/**
 * Creates a signed server-side session token with expiration.
 */
export function createSessionToken(
  user: Omit<SessionUser, "exp"> & { exp?: number },
  expiresInSeconds: number = DEFAULT_SESSION_DURATION_SECONDS
): string {
  const nowInSeconds = Math.floor(Date.now() / 1000);
  const sessionData: SessionUser = {
    ...user,
    exp: user.exp || nowInSeconds + expiresInSeconds,
  };

  const payload = Buffer.from(JSON.stringify(sessionData)).toString("base64url");
  const signature = crypto
    .createHmac("sha256", SESSION_SECRET)
    .update(payload)
    .digest("base64url");

  return `${payload}.${signature}`;
}

/**
 * Verifies a signed server-side session token with HMAC-SHA256 signature and expiration checks.
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

    const sessionUser = JSON.parse(
      Buffer.from(payload, "base64url").toString("utf-8")
    ) as SessionUser;

    // Check expiration timestamp
    if (sessionUser.exp) {
      const nowInSeconds = Math.floor(Date.now() / 1000);
      if (nowInSeconds > sessionUser.exp) {
        return null; // Expired session token
      }
    }

    return sessionUser;
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
