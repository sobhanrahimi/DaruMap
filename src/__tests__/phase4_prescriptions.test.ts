import { describe, it, expect } from "vitest";
import { validateFileMetadata } from "@/lib/storage";

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
});
