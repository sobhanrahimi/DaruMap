"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Header() {
  const [cartCount, setCartCount] = useState(0);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  useEffect(() => {
    const updateCartCount = () => {
      try {
        const cartStr = localStorage.getItem("daroomap_cart");
        if (cartStr) {
          const cart = JSON.parse(cartStr);
          const totalQty = (cart.items || []).reduce(
            (acc: number, item: { quantity: number }) => acc + item.quantity,
            0
          );
          setCartCount(totalQty);
        } else {
          setCartCount(0);
        }
      } catch {
        setCartCount(0);
      }
    };

    updateCartCount();
    window.addEventListener("cartUpdated", updateCartCount);
    return () => window.removeEventListener("cartUpdated", updateCartCount);
  }, []);

  return (
    <header className="bg-white/90 backdrop-blur-md border-b border-slate-200/80 sticky top-0 z-50 shadow-xs">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-18 flex items-center justify-between">
        {/* Brand / Logo */}
        <div className="flex items-center space-x-8 space-x-reverse">
          <Link href="/" className="flex items-center gap-3 group">
            <div className="w-10 h-10 bg-teal-800 text-white rounded-xl flex items-center justify-center font-black text-2xl shadow-sm group-hover:bg-teal-900 transition-colors">
              د
            </div>
            <div className="flex flex-col">
              <span className="font-black text-2xl text-teal-950 tracking-tight leading-none">
                دارومپ
              </span>
              <span className="text-[10px] text-teal-700 font-bold tracking-wider mt-1">
                DaruMap Platform
              </span>
            </div>
          </Link>

          {/* Navigation Links */}
          <nav className="hidden lg:flex items-center space-x-6 space-x-reverse text-sm font-medium text-slate-700">
            <Link href="/" className="hover:text-teal-800 transition-colors py-1">
              جستجوی دارو
            </Link>
            <Link href="/pharmacies" className="hover:text-teal-800 transition-colors py-1">
              داروخانه‌ها
            </Link>
            <Link href="/dashboard/customer" className="hover:text-teal-800 transition-colors py-1">
              پنل کاربر
            </Link>
            <Link href="/dashboard/pharmacy" className="hover:text-teal-800 transition-colors py-1">
              پنل داروخانه
            </Link>
            <Link href="/dashboard/admin" className="hover:text-teal-800 transition-colors py-1">
              مدیریت سیستم
            </Link>
          </nav>
        </div>

        {/* Right CTA Actions */}
        <div className="flex items-center gap-3">
          <Link
            href="/auth/signin"
            className="text-xs sm:text-sm font-semibold text-slate-700 hover:text-teal-800 px-3.5 py-2 rounded-lg hover:bg-slate-100 transition-all"
          >
            ورود / ثبت‌نام
          </Link>

          <Link
            href="/checkout"
            className="relative bg-teal-800 hover:bg-teal-900 text-white px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-sm active:scale-[0.98]"
          >
            <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 11V7a4 4 0 00-8 0v4M5 9h14l1 12H4L5 9z" />
            </svg>
            <span>سبد خرید</span>
            {cartCount > 0 && (
              <span className="bg-teal-100 text-teal-900 text-xs rounded-full px-2 py-0.5 font-extrabold">
                {cartCount}
              </span>
            )}
          </Link>

          {/* Mobile Menu Toggle Button */}
          <button
            onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            className="lg:hidden p-2 rounded-lg text-slate-600 hover:bg-slate-100 focus:outline-none"
            aria-label="منوی موبایل"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              {mobileMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              )}
            </svg>
          </button>
        </div>
      </div>

      {/* Mobile Drawer Navigation */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-t border-slate-200 bg-white px-4 pt-3 pb-5 space-y-2 shadow-lg">
          <Link
            href="/"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-800"
          >
            جستجوی دارو
          </Link>
          <Link
            href="/pharmacies"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-800"
          >
            داروخانه‌ها
          </Link>
          <Link
            href="/dashboard/customer"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-800"
          >
            پنل کاربر
          </Link>
          <Link
            href="/dashboard/pharmacy"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-800"
          >
            پنل داروخانه
          </Link>
          <Link
            href="/dashboard/admin"
            onClick={() => setMobileMenuOpen(false)}
            className="block px-3 py-2 rounded-lg text-sm font-medium text-slate-700 hover:bg-slate-50 hover:text-teal-800"
          >
            مدیریت سیستم
          </Link>
        </div>
      )}
    </header>
  );
}

export function Footer() {
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-slate-900 text-slate-300 mt-auto border-t border-slate-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 py-12 sm:px-6 lg:px-8 space-y-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 border-b border-slate-800 pb-8">
          <div className="space-y-3 md:col-span-2">
            <div className="flex items-center gap-3">
              <span className="w-8 h-8 bg-teal-600 text-white rounded-lg flex items-center justify-center font-black text-lg">
                د
              </span>
              <span className="font-black text-xl text-white">دارومپ (DaruMap)</span>
            </div>
            <p className="text-slate-400 text-xs leading-relaxed max-w-md">
              پلتفرم جامع کشوری برای یافتن داروهای کمیاب، استعلام موجودی انبار داروخانه‌های نزدیک، ارسال نسخه و انتخاب بیمه با چیدمان راست‌به‌چپ (RTL) و فونت فارسی وزیرمتن.
            </p>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">دسترسی سریع</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/" className="hover:text-teal-400 transition-colors">جستجوی هوشمند دارو</Link></li>
              <li><Link href="/pharmacies" className="hover:text-teal-400 transition-colors">لیست داروخانه‌های عضو</Link></li>
              <li><Link href="/dashboard/customer" className="hover:text-teal-400 transition-colors">پیگیری سفارش و نسخه</Link></li>
            </ul>
          </div>

          <div>
            <h4 className="text-xs font-bold text-slate-200 uppercase tracking-wider mb-3">برای داروخانه‌ها</h4>
            <ul className="space-y-2 text-xs text-slate-400">
              <li><Link href="/auth/signup" className="hover:text-teal-400 transition-colors">ثبت درخواست عضویت</Link></li>
              <li><Link href="/dashboard/pharmacy" className="hover:text-teal-400 transition-colors">مدیریت موجودی انبار</Link></li>
            </ul>
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© {year} دارومپ. تمامی حقوق برای پلتفرم محفوظ است.</p>
          <div className="flex gap-6">
            <span className="hover:text-slate-400 cursor-pointer">حریم خصوصی</span>
            <span className="hover:text-slate-400 cursor-pointer">قوانین و مقررات</span>
            <span className="hover:text-slate-400 cursor-pointer">پشتیبانی</span>
          </div>
        </div>
      </div>
    </footer>
  );
}
