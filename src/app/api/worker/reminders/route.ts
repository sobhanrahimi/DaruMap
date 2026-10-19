import { NextRequest, NextResponse } from "next/server";
import { dispatchDueRemindersService } from "@/lib/reminders";

export async function POST(req: NextRequest) {
  const expectedSecret = process.env.CRON_SECRET_KEY;

  if (!expectedSecret) {
    return NextResponse.json(
      { error: "کلید احراز هویت سرویس‌دهنده پیکربندی نشده است." },
      { status: 500 }
    );
  }

  const authHeader = req.headers.get("authorization");
  if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
    return NextResponse.json(
      { error: "دسترسی غیرمجاز. کلید احراز هویت سرویس‌دهنده نامعتبر است." },
      { status: 401 }
    );
  }

  try {
    const body = await req.json().catch(() => ({}));
    const customTime = typeof body?.targetTime === "string" ? body.targetTime : undefined;

    const result = await dispatchDueRemindersService(customTime);
    return NextResponse.json({
      success: true,
      dispatchedCount: result.dispatchedCount,
      targetTime: result.targetTime,
    });
  } catch {
    return NextResponse.json(
      { error: "خطا در پردازش یادآورهای دارویی." },
      { status: 500 }
    );
  }
}

export async function GET() {
  return NextResponse.json(
    { error: "متد غیرمجاز است. فقط درخواست POST پشتیبانی می‌شود." },
    { status: 405 }
  );
}

export async function PUT() {
  return NextResponse.json(
    { error: "متد غیرمجاز است. فقط درخواست POST پشتیبانی می‌شود." },
    { status: 405 }
  );
}

export async function DELETE() {
  return NextResponse.json(
    { error: "متد غیرمجاز است. فقط درخواست POST پشتیبانی می‌شود." },
    { status: 405 }
  );
}
