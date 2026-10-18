import { Header, Footer } from "@/components/layout";

export default function PharmacyDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm flex justify-between items-center">
          <div>
            <h1 className="text-2xl font-black text-gray-900">داشبورد مدیریت داروخانه</h1>
            <p className="text-xs text-gray-500 mt-1">
              مدیریت انبار دارویی، به‌روزرسانی موجودی و بررسی سفارشات دریافتی
            </p>
          </div>
          <span className="bg-amber-50 text-amber-800 text-xs px-3 py-1.5 rounded-full font-bold">
            وضعیت تایید: تایید شده
          </span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h2 className="font-bold text-gray-800 text-base">🏥 اطلاعات داروخانه</h2>
            <div className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-50">
              <p><span className="font-semibold text-gray-700">نام:</span> داروخانه دکتر سلامی</p>
              <p><span className="font-semibold text-gray-700">شماره مجوز:</span> PH-100234</p>
              <p><span className="font-semibold text-gray-700">شهر:</span> تهران</p>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h2 className="font-bold text-gray-800 text-base">📦 مدیریت انبار دارویی</h2>
            <div className="text-xs text-gray-600 space-y-2 pt-2 border-t border-gray-50">
              <p>تعداد اقلام موجود: ۲۴ عنوان دارو</p>
              <button className="bg-emerald-600 text-white font-bold px-3 py-1.5 rounded-lg hover:bg-emerald-700 transition">
                + افزودن داروی جدید به انبار
              </button>
            </div>
          </div>

          <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
            <h2 className="font-bold text-gray-800 text-base">🛍️ سفارشات جدید</h2>
            <div className="text-xs text-gray-500 pt-2 border-t border-gray-50">
              <p>سفارش جدیدی برای پردازش وجود ندارد.</p>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
