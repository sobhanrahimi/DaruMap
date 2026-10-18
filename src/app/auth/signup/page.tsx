"use client";

import { useState } from "react";
import Link from "next/link";
import { Header, Footer } from "@/components/layout";

export default function SignUpPage() {
  const [role, setRole] = useState<"CUSTOMER" | "PHARMACY_STAFF">("CUSTOMER");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [pharmacyName, setPharmacyName] = useState("");
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
            <h1 className="text-2xl font-black text-gray-900">ثبت‌نام در دارومپ</h1>
            <p className="text-xs text-gray-500">
              ایجاد حساب کاربری جدید برای مشتریان یا درخواست ثبت داروخانه
            </p>
          </div>

          {submitted ? (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-4 rounded-2xl text-center space-y-3">
              <p className="font-bold text-sm">درخواست ثبت‌نام شما ارسال شد!</p>
              {role === "PHARMACY_STAFF" ? (
                <p className="text-xs text-emerald-700">
                  درخواست عضویت داروخانه شما پس از بررسی و تایید مدیر سیستم فعال خواهد شد.
                </p>
              ) : (
                <p className="text-xs text-emerald-700">
                  حساب کاربری شما فعال شد. اکنون می‌توانید وارد شوید.
                </p>
              )}
              <Link
                href="/auth/signin"
                className="inline-block bg-emerald-600 text-white text-xs px-4 py-2 rounded-xl font-bold hover:bg-emerald-700 transition"
              >
                ورود به حساب
              </Link>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  نوع حساب کاربری
                </label>
                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setRole("CUSTOMER")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      role === "CUSTOMER"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    مشتری / بیمار
                  </button>
                  <button
                    type="button"
                    onClick={() => setRole("PHARMACY_STAFF")}
                    className={`py-2 px-3 text-xs font-bold rounded-xl border transition ${
                      role === "PHARMACY_STAFF"
                        ? "bg-emerald-600 text-white border-emerald-600"
                        : "bg-gray-50 text-gray-700 border-gray-200"
                    }`}
                  >
                    نماینده داروخانه
                  </button>
                </div>
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">
                  نام و نام خانوادگی
                </label>
                <input
                  type="text"
                  required
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="مثال: علی حسینی"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              <div>
                <label className="block text-xs font-bold text-gray-700 mb-1">ایمیل</label>
                <input
                  type="email"
                  required
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="example@mail.com"
                  className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                />
              </div>

              {role === "PHARMACY_STAFF" && (
                <div>
                  <label className="block text-xs font-bold text-gray-700 mb-1">
                    نام داروخانه
                  </label>
                  <input
                    type="text"
                    required
                    value={pharmacyName}
                    onChange={(e) => setPharmacyName(e.target.value)}
                    placeholder="مثال: داروخانه دکتر سلامی"
                    className="w-full p-3 rounded-xl border border-gray-200 text-sm focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  />
                </div>
              )}

              <button
                type="submit"
                className="w-full py-3 bg-emerald-600 hover:bg-emerald-700 text-white font-bold text-sm rounded-xl transition shadow-md"
              >
                ثبت‌نام و تکمیل
              </button>
            </form>
          )}

          <div className="text-center text-xs text-gray-500 pt-2 border-t border-gray-100">
            قبلاً ثبت‌نام کرده‌اید؟{" "}
            <Link href="/auth/signin" className="text-emerald-700 font-bold hover:underline">
              وارد شوید
            </Link>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  );
}
