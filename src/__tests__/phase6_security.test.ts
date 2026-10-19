import { describe, it, expect, beforeEach, afterEach } from "vitest";
import { validateFileMetadata } from "@/lib/storage";
import { validateCoordinates } from "@/lib/location";
import { authorizeStaffAction } from "@/lib/auth";
import { NextRequest } from "next/server";
import { POST, GET, PUT, DELETE } from "@/app/api/worker/reminders/route";

describe("Phase 6 — Full System Security & Access Audit", () => {
  const originalEnv = process.env.CRON_SECRET_KEY;

  beforeEach(() => {
    process.env.CRON_SECRET_KEY = "test-cron-secret-123";
  });

  afterEach(() => {
    process.env.CRON_SECRET_KEY = originalEnv;
  });

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

  it("enforces Bearer token authentication and method constraints on worker endpoint", async () => {
    // 1. Missing Authorization header -> 401
    const unauthReq = new NextRequest("http://localhost:3000/api/worker/reminders", {
      method: "POST",
    });
    const unauthRes = await POST(unauthReq);
    expect(unauthRes.status).toBe(401);
    const unauthBody = await unauthRes.json();
    expect(unauthBody.error).toContain("غیرمجاز");

    // 2. Invalid Bearer token -> 401
    const invalidReq = new NextRequest("http://localhost:3000/api/worker/reminders", {
      method: "POST",
      headers: { authorization: "Bearer wrong-secret" },
    });
    const invalidRes = await POST(invalidReq);
    expect(invalidRes.status).toBe(401);

    // 3. Unconfigured CRON_SECRET_KEY in env -> 500
    delete process.env.CRON_SECRET_KEY;
    const noKeyReq = new NextRequest("http://localhost:3000/api/worker/reminders", {
      method: "POST",
      headers: { authorization: "Bearer test-cron-secret-123" },
    });
    const noKeyRes = await POST(noKeyReq);
    expect(noKeyRes.status).toBe(500);
    process.env.CRON_SECRET_KEY = "test-cron-secret-123";

    // 4. Disallowed HTTP methods -> 405 Method Not Allowed
    const getRes = await GET();
    expect(getRes.status).toBe(405);

    const putRes = await PUT();
    expect(putRes.status).toBe(405);

    const deleteRes = await DELETE();
    expect(deleteRes.status).toBe(405);
  });
});
