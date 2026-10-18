"use client";

import { useState } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";

export default function SignInPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [submitted, setSubmitted] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 flex items-center justify-center py-12 px-4 sm:px-6 lg:px-8">
        <div className="max-w-md w-full bg-white p-8 rounded-3xl shadow-sm border border-gray-100 space-y-6">
          <div className="text-center space-y-2">
            <span className="w-12 h-12 bg-emerald-600 text-white rounded-2xl flex items-center justify-center font-bold text-2xl mx-auto">
              د
            </span>
            <h1 className="text-2xl font-black text-gray-900">ورود به دارومپ</h1>
            <p className="text-xs text-gray-500">
              وارد حساب کاربری مشتری، پرسنل داروخانه یا مدیر سیستم شوید
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-center space-y-3">
              <p className="font-bold text-sm">ورود موفقیت‌آمیز بود!</p>
              <Link
                href="/dashboard/customer"
                className="inline-block bg-emerald-600 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition"
              >
                ورود به پنل کاربری
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  ایمیل یا شماره همراه
                </label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com یا 09123456789"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  کلمه عبور
                </label>
                <input
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md"
              >
                ورود به حساب
              </button>
            </form>
          )}

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
            حساب کاربری ندارید؟{" "}
            <Link href="/auth/signup" className="text-emerald-700 font-bold hover:underline">
              ثبت‌نام کنید
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
