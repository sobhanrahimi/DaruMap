# دارومپ (DaruMap) — راهنمای کامل آماده‌سازی انتشار استیجینگ (Staging Deployment Guide)

**دارومپ (DaruMap)** یک پلتفرم کشوری برای یافتن داروهای کمیاب، استعلام انبار داروخانه‌ها، ارسال امن نسخه و انتخاب بیمه پایه، یادآورهای دارویی، باشگاه مشتریان، مشاهده قیمت‌ها به تومان و ثبت سفارش آنلاین با پشتیبانی کامل از چیدمان **راست‌به‌چپ (RTL)** و فونت فارسی **وزیرمتن** می‌باشد.

---

## 🚀 راهنمای آماده‌سازی و استقرار در محیط استیجینگ (Staging Deployment Steps)

### ۱. تنظیم متغیرهای محیطی
یک فایل `.env` در سرور استیجینگ بر اساس `.env.example` ایجاد کرده و مقادیر زیر را تنظیم کنید:
```bash
DATABASE_URL="postgresql://staging_user:staging_pass@localhost:5432/daroomap_staging?schema=public"
NODE_ENV="staging"
NEXT_PUBLIC_APP_URL="https://staging.daroomap.ir"
NEXTAUTH_SECRET="your-staging-secret-key"
NEXTAUTH_URL="https://staging.daroomap.ir"
PRESCRIPTION_STORAGE_PATH="/var/data/daroomap/prescriptions"
CRON_SECRET_KEY="your-staging-cron-secret"
```

### ۲. نصب وابستگی‌ها و بیلد برنامه
```bash
npm install
npx prisma generate
npx prisma db push
npm run build
```

### ۳. تنظیم و اجرای Cron Job یادآورهای دارویی
برای اجرای منظم پردازشگر پس‌زمینه ارسال یادآورها، یک Cron Job دقیقه به دقیقه در سرور تنظیم کنید:
```bash
* * * * * curl -X POST https://staging.daroomap.ir/api/worker/reminders -H "Authorization: Bearer your-staging-cron-secret"
```

---

## 📋 چک‌لیست تست دود دودی استیجینگ (Staging Smoke-Test Checklist)

1. **احراز هویت و دسترسی‌ها:** ثبت‌نام و ورود کاربر مشتری و پرسنل داروخانه و بررسی عدم امکان دسترسی بین‌داروخانه‌ای.
2. **آنبوردینگ داروخانه:** ثبت درخواست داروخانه جدید و تایید آن توسط ادمین سیستم.
3. **جستجو و فاصله جغرافیایی:** جستجوی دارو با فیلتر شهر و دریافت موقعیت جغرافیایی مرورگر.
4. **ثبت سفارش اتمیک:** افزودن دارو به سبد خرید، بررسی قیمت به تومان و ثبت سفارش در تراکنش دیتابیس.
5. **ارسال نسخه و بیمه:** بارگذاری فایل تصویر/PDF نسخه (کمتر از ۵ مگابایت) و انتخاب ارائه‌دهنده بیمه پایه.
6. **امتیازات باشگاه مشتریان:** تایید سفارش و بررسی اعطای یکباره امتیازات بدون امکان اعطای تکراری.
7. **یادآور دارو و اعلان‌ها:** تنظیم یادآور، ثبت وضعیت مصرف (Taken/Skipped) و دریافت اعلان درون‌برنامه‌ای.

---

## 🧪 اجرای تست‌ها و ساخت نسخه تولیدی

### اجرای تست‌های واحد (Vitest)
```bash
npm test
```

### ساخت نسخه Production
```bash
npm run build
```

---

## 📄 مجوز
تمامی حقوق متعلق به پلتفرم دارومپ می‌باشد.
