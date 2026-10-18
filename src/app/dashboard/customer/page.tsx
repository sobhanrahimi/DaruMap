import { Header, Footer } from "@/components/layout";
import Link from "next/link";

export default function CustomerDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900">پنل کاربر / بیمار</h1>
            <p className="text-xs text-gray-500 mt-1">
              مدیریت نسخه‌ها، یادآورهای مصرف دارو و امتیازات باشگاه مشتریان
            </p>
          </div>
          <span className="bg-emerald-50 text-emerald-800 text-xs px-3 py-1.5 rounded-full font-bold">
            سطح کاربری: مشتری
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Profile & Insurance */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
              👤 اطلاعات کاربری و بیمه
            </h2>
            <div className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-50">
              <p><span className="font-semibold text-gray-700">نام:</span> کاربر نمونه دارومپ</p>
              <p><span className="font-semibold text-gray-700">بیمه پایه:</span> تامین اجتماعی</p>
              <p><span className="font-semibold text-gray-700">شماره ملی:</span> ۱۲۳۴۵۶۷۸۹۰</p>
            </div>
          </div>

          {/* Prescriptions */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
              📋 نسخه‌های من
            </h2>
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-50 space-y-2">
              <p>در حال حاضر نسخه‌ای ثبت نشده است.</p>
              <button className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition">
                + ارسال نسخه جدید
              </button>
            </div>
          </div>

          {/* Reminders & Loyalty */}
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h2 className="font-bold text-gray-800 text-base flex items-center gap-2">
              ⏰ یادآور دارویی و باشگاه مشتریان
            </h2>
            <div className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-50">
              <p><span className="font-semibold text-gray-700">امتیاز باشگاه:</span> ۱5۰ امتیاز (برنز)</p>
              <p><span className="font-semibold text-gray-700">یادآور فعال:</span> استامینوفن (هر ۸ ساعت)</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
