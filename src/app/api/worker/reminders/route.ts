import { NextRequest, NextResponse } from "next/server";
import { dispatchDueRemindersService } from "@/lib/reminders";

export async function POST(req: NextRequest) {
  const authHeader = req.headers.get("authorization");
  const expectedSecret = process.env.CRON_SECRET_KEY;

  if (expectedSecret) {
    if (!authHeader || authHeader !== `Bearer ${expectedSecret}`) {
      return NextResponse.json(
        { error: "دسترسی غیرمجاز. کلید احراز هویت سرویس‌دهنده نامعتبر است." },
        { status: 401 }
      );
    }
  }

  try {
    const body = await req.json().catch(() => ({}));
    const customTime = body.targetTime as string | undefined;

    const result = await dispatchDueRemindersService(customTime);
    return NextResponse.json({
      success: true,
      dispatchedCount: result.dispatchedCount,
      targetTime: result.targetTime,
    });
  } catch (error: unknown) {
    const errorMessage = error instanceof Error ? error.message : "خطا در پردازش یادآورهای دارویی.";
    return NextResponse.json(
      { error: errorMessage },
      { status: 500 }
    );
  }
}
