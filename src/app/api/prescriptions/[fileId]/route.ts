import { NextRequest, NextResponse } from "next/server";
import path from "path";
import fs from "fs";
import { getStorageDirectory } from "@/lib/storage";
import { prisma } from "@/lib/db";
import { verifySessionToken } from "@/lib/auth";

export async function GET(
  req: NextRequest,
  { params }: { params: Promise<{ fileId: string }> }
) {
  const { fileId } = await params;

  if (!fileId || fileId.includes("..") || fileId.includes("/") || fileId.includes("\\")) {
    return NextResponse.json(
      { error: "شناسه فایل نامعتبر است." },
      { status: 400 }
    );
  }

  // Cryptographic session token verification (from HTTP-only cookie or Authorization header)
  const authCookie = req.cookies.get("daroomap_session")?.value;
  const authHeader = req.headers.get("authorization")?.replace(/^Bearer\s+/i, "");
  const sessionUser = verifySessionToken(authCookie || authHeader);

  if (!sessionUser) {
    return NextResponse.json(
      { error: "دسترسی غیرمجاز. لطفا ابتدا وارد حساب کاربری خود شوید." },
      { status: 401 }
    );
  }

  try {
    // Look up prescription record in database
    const prescription = await prisma.prescription.findFirst({
      where: { imageUrl: fileId },
    });

    if (!prescription) {
      return NextResponse.json(
        { error: "نسخه یافت نشد." },
        { status: 404 }
      );
    }

    // Strict ownership enforcement: Only prescription owner or ADMIN role allowed
    if (sessionUser.id !== prescription.userId && sessionUser.role !== "ADMIN") {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز. شما اجازه مشاهده این نسخه پزشکی را ندارید." },
        { status: 403 }
      );
    }
  } catch {
    return NextResponse.json(
      { error: "نسخه یافت نشد یا دسترسی به پایگاه‌داده امکان‌پذیر نیست." },
      { status: 404 }
    );
  }

  const storageDir = getStorageDirectory();
  const filePath = path.join(storageDir, fileId);

  if (!filePath.startsWith(storageDir) || !fs.existsSync(filePath)) {
    return NextResponse.json(
      { error: "فایل نسخه در سرور یافت نشد." },
      { status: 404 }
    );
  }

  const fileBuffer = fs.readFileSync(filePath);
  const ext = path.extname(fileId).toLowerCase();

  let contentType = "application/octet-stream";
  if (ext === ".jpg" || ext === ".jpeg") contentType = "image/jpeg";
  else if (ext === ".png") contentType = "image/png";
  else if (ext === ".webp") contentType = "image/webp";
  else if (ext === ".pdf") contentType = "application/pdf";

  return new NextResponse(fileBuffer, {
    status: 200,
    headers: {
      "Content-Type": contentType,
      "Cache-Control": "private, max-age=3600",
    },
  });
}
