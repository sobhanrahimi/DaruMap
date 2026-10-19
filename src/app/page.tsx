import { Header, Footer } from "@/components/layout";
import { MedicineSearch } from "@/components/MedicineSearch";
import { searchMedicinesService, MedicineSearchResult } from "@/lib/search";
import Link from "next/link";

export default async function HomePage() {
  let searchItems: MedicineSearchResult[] = [];

  try {
    const res = await searchMedicinesService({ page: 1, limit: 20 });
    searchItems = res.items;
  } catch {
    searchItems = [];
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Header />

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-12">
        {/* Healthcare Hero Section */}
        <section className="bg-gradient-to-br from-teal-900 via-teal-800 to-emerald-900 text-white rounded-3xl p-8 sm:p-12 shadow-md relative overflow-hidden">
          <div className="absolute -left-12 -top-12 w-64 h-64 bg-teal-500/10 rounded-full blur-3xl pointer-events-none" />
          <div className="relative z-10 max-w-3xl space-y-4">
            <div className="inline-flex items-center gap-2 bg-teal-700/50 backdrop-blur-xs px-3.5 py-1.5 rounded-full text-xs font-bold text-teal-200 border border-teal-600/30">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>پلتفرم کشوری استعلام هوشمند داروخانه‌ها</span>
            </div>
            <h1 className="text-3xl sm:text-5xl font-black leading-tight tracking-tight">
              جستجو و سفارش آنلاین دارو از نزدیک‌ترین داروخانه‌ها
            </h1>
            <p className="text-teal-100 text-sm sm:text-base leading-relaxed max-w-2xl font-normal">
              دارومپ سامانه هوشمند یافتن داروهای کمیاب، مشاهده موجودی انبار داروخانه‌های تاییدشده، ارسال امن نسخه و سفارش آنلاین با محاسبه دقیق قیمت به تومان می‌باشد.
            </p>
          </div>
        </section>

        {/* Value Proposition Feature Grid */}
        <section className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
          <div className="daroomap-card p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-lg">
              📍
            </div>
            <h3 className="font-bold text-slate-900 text-base">جستجوی مبتنی بر موقعیت</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              محاسبه فاصله دقیق بر حسب کیلومتر و یافتن نزدیک‌ترین داروخانه فعال.
            </p>
          </div>

          <div className="daroomap-card p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-lg">
              🏥
            </div>
            <h3 className="font-bold text-slate-900 text-base">سفارش تک‌داروخانه‌ای</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              تضمین ارسال اتمیک و محاسبه خودکار قیمت شفاف به تومان در سبد خرید.
            </p>
          </div>

          <div className="daroomap-card p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-lg">
              📄
            </div>
            <h3 className="font-bold text-slate-900 text-base">ارسال امن نسخه</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              بارگذاری تصویر/PDF نسخه در ذخیره‌ساز خصوصی با تایید بیمه پایه.
            </p>
          </div>

          <div className="daroomap-card p-5 space-y-2">
            <div className="w-10 h-10 rounded-xl bg-teal-50 text-teal-800 flex items-center justify-center font-bold text-lg">
              ⏰
            </div>
            <h3 className="font-bold text-slate-900 text-base">یادآور هوشمند دارو</h3>
            <p className="text-xs text-slate-500 leading-relaxed">
              تنظیم برنامه مصرف دقیق و ثبت دوزهای مصرف‌شده در پنل کاربر.
            </p>
          </div>
        </section>

        {/* Medicine Search Section */}
        <section className="space-y-5">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
            <div>
              <h2 className="text-2xl font-black text-slate-900">لیست داروخانه‌ها و داروهای موجود</h2>
              <p className="text-xs text-slate-500 mt-1">
                جستجوی زنده بر اساس نام داروی فارسی، انگلیسی یا نام داروخانه
              </p>
            </div>
            <Link
              href="/pharmacies"
              className="text-xs font-bold text-teal-800 hover:text-teal-900 flex items-center gap-1"
            >
              <span>مشاهده تمام داروخانه‌ها</span>
              <span>←</span>
            </Link>
          </div>

          <MedicineSearch initialItems={searchItems} />
        </section>

        {/* How DaruMap Works Workflow */}
        <section className="bg-white rounded-3xl p-8 border border-slate-200/80 shadow-xs space-y-6">
          <div className="text-center max-w-xl mx-auto space-y-2">
            <h2 className="text-2xl font-bold text-slate-900">چگونه در دارومپ سفارش دهیم؟</h2>
            <p className="text-xs text-slate-500">مراحل ساده دریافت دارو از نزدیک‌ترین داروخانه تاییدشده</p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-4">
            <div className="text-center space-y-3 p-4">
              <div className="w-12 h-12 bg-teal-800 text-white font-extrabold rounded-2xl flex items-center justify-center mx-auto text-lg shadow-sm">
                ۱
              </div>
              <h3 className="font-bold text-slate-900 text-sm">جستجو یا ارسال نسخه</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                نام داروی مورد نظر را جستجو کنید یا تصویر نسخه پزشک خود را بارگذاری نمایید.
              </p>
            </div>

            <div className="text-center space-y-3 p-4">
              <div className="w-12 h-12 bg-teal-800 text-white font-extrabold rounded-2xl flex items-center justify-center mx-auto text-lg shadow-sm">
                ۲
              </div>
              <h3 className="font-bold text-slate-900 text-sm">انتخاب داروخانه و قیمت</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                نزدیک‌ترین داروخانه دارنده دارو با قیمت مشخص به تومان را انتخاب نمایید.
              </p>
            </div>

            <div className="text-center space-y-3 p-4">
              <div className="w-12 h-12 bg-teal-800 text-white font-extrabold rounded-2xl flex items-center justify-center mx-auto text-lg shadow-sm">
                ۳
              </div>
              <h3 className="font-bold text-slate-900 text-sm">ثبت سفارش و تحویل</h3>
              <p className="text-xs text-slate-500 leading-relaxed">
                سفارش خود را به صورت اتمیک ثبت کرده و دارو را تحویل بگیرید.
              </p>
            </div>
          </div>
        </section>

        {/* Pharmacy Onboarding Call To Action */}
        <section className="bg-slate-900 text-white rounded-3xl p-8 sm:p-10 flex flex-col md:flex-row items-center justify-between gap-6 shadow-sm">
          <div className="space-y-2 text-center md:text-right">
            <h3 className="text-xl font-black text-white">آیا داروساز یا مدیر داروخانه هستید؟</h3>
            <p className="text-xs text-slate-400 max-w-xl">
              با ثبت نام در سامانه دارومپ، انبار دارویی خود را مدیریت کرده و به هزاران متقاضی دارو در شهر خود متصل شوید.
            </p>
          </div>
          <Link
            href="/auth/signup"
            className="bg-teal-600 hover:bg-teal-500 text-white px-6 py-3 rounded-xl font-bold text-xs transition shadow-sm whitespace-nowrap"
          >
            ثبت‌نام و عضویت داروخانه
          </Link>
        </section>
      </main>

      <Footer />
    </div>
  );
}
