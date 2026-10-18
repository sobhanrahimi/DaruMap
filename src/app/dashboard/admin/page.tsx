import { Header, Footer } from "@/components/layout";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900">پنل مدیریت کل سیستم (Admin)</h1>
            <p className="text-xs text-gray-500 mt-1">
              تایید درخواست‌های داروخانه، کاتالوگ دارویی، سازمان‌های بیمه و لاگ‌های امنیتی
            </p>
          </div>
          <span className="bg-purple-50 text-purple-800 text-xs px-3 py-1.5 rounded-full font-bold">
            نقش: مدیر سیستم
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
            <h2 className="font-bold text-gray-800 text-sm">🏥 احراز داروخانه‌ها</h2>
            <p className="text-2xl font-black text-emerald-600">۲ درخواست</p>
            <p className="text-xs text-gray-400">نیازمند بررسی مدرک و تایید</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
            <h2 className="font-bold text-gray-800 text-sm">💊 کاتالوگ دارویی</h2>
            <p className="text-2xl font-black text-emerald-600">۱,۴۵۰ عنوان</p>
            <p className="text-xs text-gray-400">داروهای ژنریک و تجاری</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
            <h2 className="font-bold text-gray-800 text-sm">🛡️ سازمان‌های بیمه</h2>
            <p className="text-2xl font-black text-emerald-600">۴ سازمان</p>
            <p className="text-xs text-gray-400">تامین اجتماعی، سلامت و ...</p>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-2">
            <h2 className="font-bold text-gray-800 text-sm">🔍 لاگ‌های سیستم</h2>
            <p className="text-2xl font-black text-emerald-600">فعال</p>
            <p className="text-xs text-gray-400">ثبت تمام عملیات‌های حساس</p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
