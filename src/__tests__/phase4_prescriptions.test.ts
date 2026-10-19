import { describe, it, expect } from "vitest";
import { validateFileMetadata } from "@/lib/storage";
import { NextRequest } from "next/server";
import { GET } from "@/app/api/prescriptions/[fileId]/route";
import { createSessionToken } from "@/lib/auth";

describe("Phase 4 — Prescription File Upload & Validation Rules", () => {
  it("allows valid image formats (JPEG, PNG, WEBP) and PDF within size limits", () => {
    const validJpg = validateFileMetadata("rx.jpg", "image/jpeg", 2 * 1024 * 1024);
    expect(validJpg.valid).toBe(true);

    const validPng = validateFileMetadata("prescription.png", "image/png", 1 * 1024 * 1024);
    expect(validPng.valid).toBe(true);

    const validPdf = validateFileMetadata("doc.pdf", "application/pdf", 3 * 1024 * 1024);
    expect(validPdf.valid).toBe(true);
  });

  it("rejects files exceeding 5MB limit", () => {
    const oversized = validateFileMetadata("rx.jpg", "image/jpeg", 6 * 1024 * 1024);
    expect(oversized.valid).toBe(false);
    expect(oversized.error).toContain("حجم فایل باید بین ۱ بایت تا ۵ مگابایت باشد");
  });

  it("rejects unallowed file extensions or executable files", () => {
    const exe = validateFileMetadata("malware.exe", "application/x-msdownload", 100);
    expect(exe.valid).toBe(false);
    expect(exe.error).toContain("فرمت فایل مجاز نیست");

    const txt = validateFileMetadata("notes.txt", "text/plain", 500);
    expect(txt.valid).toBe(false);
  });

  it("rejects zero-byte files", () => {
    const empty = validateFileMetadata("rx.jpg", "image/jpeg", 0);
    expect(empty.valid).toBe(false);
  });

  it("enforces authentication and safe path traversal checks on prescription download route", async () => {
    // 1. Path traversal attempt -> 400
    const traversalReq = new NextRequest("http://localhost:3000/api/prescriptions/../etc/passwd");
    const traversalRes = await GET(traversalReq, { params: Promise.resolve({ fileId: "../etc/passwd" }) });
    expect(traversalRes.status).toBe(400);

    // 2. Unauthenticated request -> 401
    const unauthReq = new NextRequest("http://localhost:3000/api/prescriptions/some-uuid.jpg");
    const unauthRes = await GET(unauthReq, { params: Promise.resolve({ fileId: "some-uuid.jpg" }) });
    expect(unauthRes.status).toBe(401);

    // 3. Authenticated request for non-existent file -> 404
    const validToken = createSessionToken({ id: "user-1", email: "test@example.com", role: "CUSTOMER" });
    const authReq = new NextRequest("http://localhost:3000/api/prescriptions/non-existent.jpg", {
      headers: { authorization: `Bearer ${validToken}` },
    });
    const authRes = await GET(authReq, { params: Promise.resolve({ fileId: "non-existent.jpg" }) });
    expect(authRes.status).toBe(404);
  });
});
