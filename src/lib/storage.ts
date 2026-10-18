import fs from "fs";
import path from "path";
import crypto from "crypto";

export interface StoredFile {
  fileId: string;
  originalName: string;
  mimeType: string;
  sizeBytes: number;
  storedPath: string;
}

const ALLOWED_MIME_TYPES = new Set([
  "image/jpeg",
  "image/png",
  "image/webp",
  "application/pdf",
]);

const ALLOWED_EXTENSIONS = new Set([".jpg", ".jpeg", ".png", ".webp", ".pdf"]);
const MAX_FILE_SIZE_BYTES = 5 * 1024 * 1024; // 5 MB

export function validateFileMetadata(
  filename: string,
  mimeType: string,
  sizeBytes: number
): { valid: boolean; error?: string } {
  if (sizeBytes <= 0 || sizeBytes > MAX_FILE_SIZE_BYTES) {
    return {
      valid: false,
      error: "حجم فایل باید بین ۱ بایت تا ۵ مگابایت باشد.",
    };
  }

  const ext = path.extname(filename).toLowerCase();
  if (!ALLOWED_EXTENSIONS.has(ext)) {
    return {
      valid: false,
      error: "فرمت فایل مجاز نیست. فقط تصویر (JPEG, PNG, WEBP) و PDF پشتیبانی می‌شوند.",
    };
  }

  if (!ALLOWED_MIME_TYPES.has(mimeType)) {
    return {
      valid: false,
      error: "نوع محتوای فایل (MIME type) نامعتبر است.",
    };
  }

  return { valid: true };
}

export function getStorageDirectory(): string {
  const customPath = process.env.PRESCRIPTION_STORAGE_PATH;
  const storageDir = customPath
    ? path.resolve(customPath)
    : path.resolve(process.cwd(), "uploads", "prescriptions");

  if (!fs.existsSync(storageDir)) {
    fs.mkdirSync(storageDir, { recursive: true });
  }

  return storageDir;
}

export function storePrivateFileBuffer(
  buffer: Buffer,
  originalFilename: string,
  mimeType: string
): StoredFile {
  const validation = validateFileMetadata(originalFilename, mimeType, buffer.length);
  if (!validation.valid) {
    throw new Error(validation.error || "فایل غیرمجاز است.");
  }

  const storageDir = getStorageDirectory();
  const ext = path.extname(originalFilename).toLowerCase();

  // Path traversal protection & safe unique server identifier
  const safeFileId = `${crypto.randomUUID()}${ext}`;
  const targetPath = path.join(storageDir, safeFileId);

  // Prevent path traversal outside storage directory
  if (!targetPath.startsWith(storageDir)) {
    throw new Error("تلاش غیرمجاز برای تغییر مسیر فایل.");
  }

  fs.writeFileSync(targetPath, buffer);

  return {
    fileId: safeFileId,
    originalName: path.basename(originalFilename),
    mimeType,
    sizeBytes: buffer.length,
    storedPath: targetPath,
  };
}

export function deletePrivateFile(fileId: string): boolean {
  if (!fileId || fileId.includes("..") || fileId.includes("/") || fileId.includes("\\")) {
    return false;
  }

  const storageDir = getStorageDirectory();
  const targetPath = path.join(storageDir, fileId);

  if (fs.existsSync(targetPath)) {
    fs.unlinkSync(targetPath);
    return true;
  }

  return false;
}
