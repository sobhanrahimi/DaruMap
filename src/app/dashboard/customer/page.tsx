import { Header, Footer } from "@/components/layout";
import Link from "next/link";

export default function CustomerDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Profile Summary */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">👤</span>
              <h1 className="text-2xl font-black text-slate-900">پنل کاربر / بیمار</h1>
            </div>
            <p className="text-xs text-slate-500">
              مدیریت نسخه‌ها، ثبت یادآورهای مصرف دارو و مشاهده امتیازات باشگاه مشتریان
            </p>
          </div>
          <span className="bg-teal-50 text-teal-800 border border-teal-200/80 text-xs px-3.5 py-1.5 rounded-full font-bold">
            سطح کاربری: مشتری فعال
          </span>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile & Insurance */}
          <div className="daroomap-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>📋</span>
                <span>اطلاعات کاربر و بیمه</span>
              </h2>
              <span className="text-[10px] bg-emerald-50 text-emerald-800 px-2 py-0.5 rounded font-bold">
                تاییدشده
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">نام و نام خانوادگی:</span>
                <span className="font-bold text-slate-800">کاربر نمونه دارومپ</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">بیمه پایه:</span>
                <span className="font-bold text-slate-800">تأمین اجتماعی</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">کد ملی:</span>
                <span className="font-mono font-bold text-slate-800">۱۲۳۴۵۶۷۸۹۰</span>
              </div>
            </div>
          </div>

          {/* Prescriptions Upload Section */}
          <div className="daroomap-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>📄</span>
                <span>نسخه‌های من</span>
              </h2>
              <span className="text-[10px] bg-slate-100 text-slate-600 px-2 py-0.5 rounded font-bold">
                حداکثر ۵ مگابایت
              </span>
            </div>

            <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 space-y-3">
              <p className="leading-relaxed">
                تصویر یا PDF نسخه خود (فرمت JPEG, PNG, PDF) را جهت بررسی داروخانه ارسال نمایید.
              </p>
              <Link
                href="/"
                className="inline-block bg-teal-800 hover:bg-teal-900 text-white font-bold px-4 py-2.5 rounded-xl transition shadow-2xs text-xs"
              >
                + ارسال نسخه جدید
              </Link>
            </div>
          </div>

          {/* Reminders & Loyalty */}
          <div className="daroomap-card p-6 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
                <span>⏰</span>
                <span>یادآور و باشگاه مشتریان</span>
              </h2>
              <span className="text-[10px] bg-amber-50 text-amber-800 border border-amber-200 px-2 py-0.5 rounded font-bold">
                سطح برنز
              </span>
            </div>

            <div className="text-xs text-slate-600 space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">امتیاز باشگاه:</span>
                <span className="font-extrabold text-teal-800">۱۵۰ امتیاز</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">یادآور فعال:</span>
                <span className="font-bold text-slate-800">استامینوفن (هر ۸ ساعت)</span>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
