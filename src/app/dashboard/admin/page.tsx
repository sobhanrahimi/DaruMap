import { Header, Footer } from "@/components/layout";

export default function AdminDashboardPage() {
  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        {/* Header Profile Summary */}
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
          <div className="space-y-1">
            <div className="flex items-center gap-2">
              <span className="text-xl">⚙️</span>
              <h1 className="text-2xl font-black text-slate-900">پنل مدیریت کل سیستم (System Admin)</h1>
            </div>
            <p className="text-xs text-slate-500">
              احراز و تایید مدارک داروخانه‌ها، مدیریت کاتالوگ داروها، سازمان‌های بیمه پایه و پایش لاگ‌های امنیتی
            </p>
          </div>
          <span className="bg-purple-50 text-purple-900 border border-purple-200 text-xs px-3.5 py-1.5 rounded-full font-bold">
            سطح دسترسی: مدیر ارشد سیستم
          </span>
        </div>

        {/* Metric Cards Grid */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          <div className="daroomap-card p-6 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xs">🏥 احراز داروخانه‌ها</h2>
              <span className="w-2 h-2 rounded-full bg-amber-500 animate-pulse" />
            </div>
            <p className="text-2xl font-black text-teal-800">۲ درخواست</p>
            <p className="text-[11px] text-slate-400">نیازمند بررسی مدرک و تایید رسمی</p>
          </div>

          <div className="daroomap-card p-6 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xs">💊 کاتالوگ دارویی</h2>
              <span className="text-xs">📚</span>
            </div>
            <p className="text-2xl font-black text-teal-800">۱,۴۵۰ عنوان</p>
            <p className="text-[11px] text-slate-400">داروهای ژنریک و تجاری ثبت‌شده</p>
          </div>

          <div className="daroomap-card p-6 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xs">🛡️ ارائه‌دهندگان بیمه</h2>
              <span className="text-xs">📜</span>
            </div>
            <p className="text-2xl font-black text-teal-800">۴ سازمان</p>
            <p className="text-[11px] text-slate-400">تأمین اجتماعی، سلامت، نیروهای مسلح</p>
          </div>

          <div className="daroomap-card p-6 space-y-2">
            <div className="flex items-center justify-between">
              <h2 className="font-bold text-slate-800 text-xs">🔍 لاگ‌های امنیتی Audit</h2>
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
            </div>
            <p className="text-2xl font-black text-teal-800">فعال</p>
            <p className="text-[11px] text-slate-400">ثبت اتمیک تمام عملیات‌های حساس</p>
          </div>
        </div>

        {/* Pending Approval Section */}
        <div className="daroomap-card p-6 space-y-4">
          <h2 className="font-bold text-slate-900 text-sm flex items-center gap-2 border-b border-slate-100 pb-3">
            <span>⏳</span>
            <span>درخواست‌های معوق عضویت داروخانه</span>
          </h2>

          <div className="divide-y divide-slate-100 text-xs">
            <div className="py-3 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3">
              <div>
                <h3 className="font-bold text-slate-900">داروخانه دکتر راد (تهران)</h3>
                <p className="text-slate-500 text-[11px] mt-0.5">شماره پروانه: PH-990812 | ثبت‌شده در ۲ ساعت پیش</p>
              </div>
              <div className="flex gap-2">
                <button className="bg-emerald-700 hover:bg-emerald-800 text-white font-bold px-3.5 py-1.5 rounded-lg transition">
                  تایید رسمی
                </button>
                <button className="bg-slate-100 hover:bg-slate-200 text-slate-700 font-bold px-3.5 py-1.5 rounded-lg transition">
                  رد درخواست
                </button>
              </div>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
