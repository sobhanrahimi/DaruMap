import { Header, Footer } from "@/components/layout";

export default function PharmacyDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Profile Summary */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">🏥</span>
              <h1 className="text-2xl font-black text-slate-900">داشبورد عملیاتی پرسنل داروخانه</h1>
            </div>
            <p className="text-xs text-slate-500">
              مدیریت زنده انبار دارویی، به‌روزرسانی موجودی و قیمت به تومان، و پردازش سفارشات مشتریان
            </p>
          </div>
          <span className="bg-emerald-50 text-emerald-800 border border-emerald-200/80 text-xs px-3.5 py-1.5 rounded-full font-bold flex items-center gap-1.5">
            <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
            <span>وضعیت: تاییدشده و فعال</span>
          </span>
        </div>

        {/* Dashboard Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Pharmacy Profile */}
          <div className="daroomap-card p-6 space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>🏥</span>
              <span>مشخصات رسمی داروخانه</span>
            </h2>

            <div className="text-xs text-slate-600 space-y-2.5 pt-3 border-t border-slate-100">
              <div className="flex justify-between">
                <span className="text-slate-400">نام داروخانه:</span>
                <span className="font-bold text-slate-800">داروخانه دکتر سلامی</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">شماره پروانه رسمی:</span>
                <span className="font-mono font-bold text-slate-800">PH-100234</span>
              </div>
              <div className="flex justify-between">
                <span className="text-slate-400">شهر و آدرس:</span>
                <span className="font-bold text-slate-800">تهران، خیابان ولیعصر</span>
              </div>
            </div>
          </div>

          {/* Inventory Summary */}
          <div className="daroomap-card p-6 space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>📦</span>
              <span>وضعیت انبار دارویی</span>
            </h2>

            <div className="text-xs text-slate-600 space-y-3 pt-3 border-t border-slate-100">
              <div className="flex justify-between items-center">
                <span className="text-slate-400">تعداد اقلام ثبت‌شده:</span>
                <span className="font-extrabold text-teal-800 text-sm">۲۴ عنوان دارو</span>
              </div>
              <button className="w-full bg-teal-800 hover:bg-teal-900 text-white font-bold py-2.5 px-4 rounded-xl text-xs transition shadow-2xs">
                + مدیریت و به‌روزرسانی انبار
              </button>
            </div>
          </div>

          {/* Incoming Orders */}
          <div className="daroomap-card p-6 space-y-4">
            <h2 className="font-bold text-slate-900 text-base flex items-center gap-2">
              <span>🛍️</span>
              <span>سفارشات جدید دریافتی</span>
            </h2>

            <div className="text-xs text-slate-500 pt-3 border-t border-slate-100 space-y-2">
              <p>سفارش جدیدی منتظر پردازش نیست.</p>
              <div className="bg-slate-50 p-3 rounded-xl border border-slate-100 text-[11px] text-slate-600 leading-relaxed">
                💡 سفارشات مشتریان بلافاصله پس از ثبت اتمیک در این بخش نمایش داده می‌شوند.
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
