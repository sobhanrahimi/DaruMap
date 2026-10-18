"use client";

import Link from "next/link";
import { useState, useEffect } from "react";

export function Header() {
  const [cartCount, setCartCount] = useState(0);

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
    <header className="bg-white border-b border-gray-200 sticky top-0 z-50 shadow-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between">
        <div className="flex items-center space-x-6 space-x-reverse">
          <Link href="/" className="flex items-center gap-2">
            <span className="w-10 h-10 bg-emerald-600 text-white rounded-xl flex items-center justify-center font-bold text-2xl shadow-md">
              د
            </span>
            <span className="font-black text-2xl text-emerald-800 tracking-tight">
              دارومپ
            </span>
          </Link>
          <nav className="hidden md:flex items-center space-x-5 space-x-reverse text-sm font-semibold text-gray-700">
            <Link href="/" className="hover:text-emerald-600 transition">
              جستجوی دارو
            </Link>
            <Link href="/pharmacies" className="hover:text-emerald-600 transition">
              داروخانه‌ها
            </Link>
            <Link href="/dashboard/customer" className="hover:text-emerald-600 transition">
              پنل کاربر
            </Link>
            <Link href="/dashboard/pharmacy" className="hover:text-emerald-600 transition">
              پنل داروخانه
            </Link>
            <Link href="/dashboard/admin" className="hover:text-emerald-600 transition">
              مدیریت
            </Link>
          </nav>
        </div>

        <div className="flex items-center space-x-3 space-x-reverse">
          <Link
            href="/auth/signin"
            className="text-xs sm:text-sm font-semibold text-gray-700 hover:text-emerald-600 px-3 py-2 transition"
          >
            ورود / ثبت‌نام
          </Link>

          <Link
            href="/checkout"
            className="relative bg-emerald-600 hover:bg-emerald-700 text-white px-4 py-2 rounded-xl text-xs sm:text-sm font-bold flex items-center gap-2 transition shadow-sm"
          >
            <span>سبد خرید</span>
            {cartCount > 0 && (
              <span className="bg-white text-emerald-700 text-xs rounded-full w-5 h-5 flex items-center justify-center font-bold">
                {cartCount}
              </span>
            )}
          </Link>
        </div>
      </div>
    </header>
  );
}

export function Footer() {
  const [year, setYear] = useState(2026);

  useEffect(() => {
    setYear(new Date().getFullYear());
  }, []);

  return (
    <footer className="bg-gray-900 text-gray-300 mt-auto border-t border-gray-800 text-sm">
      <div className="max-w-7xl mx-auto px-4 py-10 sm:px-6 lg:px-8 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-center border-b border-gray-800 pb-6 gap-4">
          <div className="flex items-center gap-2">
            <span className="w-8 h-8 bg-emerald-600 text-white rounded-lg flex items-center justify-center font-bold text-lg">
              د
            </span>
            <span className="font-extrabold text-xl text-white">دارومپ (DaruMap)</span>
          </div>
          <p className="text-gray-400 text-xs max-w-xl text-center md:text-right leading-relaxed">
            سامانه هوشمند کشوری پیدا کردن داروخانه‌های دارای ذخیره دارویی، ارسال دیجیتال نسخه، بیمه و یادآورهای دارویی.
          </p>
        </div>

        <div className="text-center sm:flex sm:justify-between sm:items-center text-xs text-gray-400">
          <p>© {year} دارومپ. تمامی حقوق برای پلتفرم محفوظ است.</p>
          <div className="flex justify-center gap-4 mt-3 sm:mt-0">
            <Link href="/pharmacies" className="hover:text-emerald-400">داروخانه‌های عضو</Link>
            <Link href="/auth/signup" className="hover:text-emerald-400">ثبت‌نام داروخانه</Link>
          </div>
        </div>
      </div>
    </footer>
  );
}
