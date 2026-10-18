import type { Metadata } from "next";
import { Vazirmatn } from "next/font/google";
import "./globals.css";

const vazirmatn = Vazirmatn({
  subsets: ["arabic", "latin"],
  variable: "--font-vazirmatn",
  display: "swap",
});

export const metadata: Metadata = {
  title: "دارومپ (DaruMap) | سامانه آنلاین پیدا کردن داروخانه‌ها و سفارش دارو",
  description: "سامانه جستجوی هوشمند دارو در داروخانه‌های نزدیک، ارسال نسخه و مدیریت یادآورهای دارویی با پشتیبانی از قیمت به تومان",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="fa" dir="rtl" className={`${vazirmatn.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col font-sans bg-gray-50 text-gray-900">
        {children}
      </body>
    </html>
  );
}
