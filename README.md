# دارومپ (DaruMap) — سامانه کشوری استعلام و سفارش آنلاین دارو

**دارومپ (DaruMap)** یک پلتفرم کشوری برای یافتن داروهای کمیاب، استعلام انبار داروخانه‌ها، ارسال امن نسخه و انتخاب بیمه پایه، یادآورهای دارویی، باشگاه مشتریان، مشاهده قیمت‌ها به تومان و ثبت سفارش آنلاین با پشتیبانی کامل از چیدمان **راست‌به‌چپ (RTL)** و فونت فارسی **وزیرمتن** می‌باشد.

---

## 📌 وضعیت لینک GitHub Pages و راهنمای پیش‌نمایش (GitHub Pages vs. Live App)

> **توجه مهم درباره لینک GitHub Pages:**
> آدرس GitHub Pages این مخزن به صورت پیش‌فرض توسط سیستم GitHub Pages برای **نمایش مستندات پروژه (فایل README.md)** پیکربندی شده است.
>
> به دلیل بهره‌گیری اپلیکیشن **DaruMap** از معماری کامل Next.js App Router، سرور Node.js، پایگاه داده PostgreSQL / Prisma ORM، توابع اکشن سمت سرور (Server Actions) و پردازش امن نسخه‌ها، **این برنامه امکان اجرا به صورت وب‌سایت استاتیک در GitHub Pages را ندارد**.

---

## 💻 راهنمای سریع پیش‌نمایش و بررسی رابط کاربری (Local UI Preview Guide)

برای مشاهده و تست کامل رابط کاربری، صفحات کاربر، پنل داروخانه و مدیریت، مراحل زیر را در محیط محلی (Local) دنبال کنید:

### ۱. پیش‌نیازها و نصب وابستگی‌ها
```bash
npm install
npx prisma generate
```

### ۲. تنظیم متغیرهای محیطی آزمایشی
فایل `.env` را ایجاد کرده یا متغیرهای نمونه زیر را قرار دهید (نیاز به ساخت دیتابیس خارجی برای مرور UI اولیه نیست):
```env
DATABASE_URL="postgresql://user:password@localhost:5432/daroomap_db"
NEXTAUTH_SECRET="preview-secret-key-12345"
NEXTAUTH_URL="http://localhost:3000"
NODE_ENV="development"
```

### ۳. اجرا در حالت توسعه (Development Mode)
```bash
npm run dev
```

پس از اجرای دستور فوق، مرورگر خود را باز کرده و به آدرس زیر مراجعه فرمایید:
👉 **`http://localhost:3000`**

#### مسیرهای اصلی جهت بررسی UI:
* **صفحه اصلی و جستجوی هوشمند دارو:** `http://localhost:3000`
* **لیست داروخانه‌ها:** `http://localhost:3000/pharmacies`
* **جزئیات داروخانه:** `http://localhost:3000/pharmacy/ph-1`
* **پنل مشتری (سفارشات و یادآورها):** `http://localhost:3000/dashboard/customer`
* **پنل مدیریت داروخانه:** `http://localhost:3000/dashboard/pharmacy`
* **پنل مدیریت کل سیستم (Admin):** `http://localhost:3000/dashboard/admin`
* **سبد خرید و نهایی‌سازی سفارش:** `http://localhost:3000/checkout`

---

## 📊 ماتریس مقایسه و ارزیابی سازگاری ابری (Iran-Based Cloud Provider Audit)

ارزیابی زیرساختی برنامه دارومپ بر روی دو ارائه‌دهنده ابری مطرح در ایران (**ساکو ابر / Sakoocloud** و **وب‌لاینز / Weblines Cloud**):

| نیاز زیرساختی برنامه (Requirements) | ساکو ابر (Sakoocloud) | وب‌لاینز (Weblines Cloud - VPS / Hosting) | وضعیت تأیید (Status) |
| :--- | :--- | :--- | :--- |
| **محیط اجرایی Node.js 20+ / Docker** | پشتیبانی کامل از Dockerfile و Image | پشتیبانی روی Linux VPS / cPanel Node Manager | **CONFIRMED** |
| **دیتابیس PostgreSQL** | دیتابیس مدیریت‌شده (Managed PostgreSQL) | نصب روی VPS یا سرویس دیتابیس ابری | **CONFIRMED** |
| **پشتیبان‌گیری خودکار دیتابیس (Backups)** | نیازمند استعلام سیاست نگهداری و بازیابی | فایل‌های پشتیبان روزانه/هفتگی سرور | **UNKNOWN** (نیازمند استعلام از Sakoo) |
| **فایل سیستم پایدار برای نسخه‌ها (Volume)** | اتصال Volume پایدار (PVC / Persistent Volume) | دیسک سخت سرور مجازی خارج از `public_html` | **CONFIRMED** |
| **زمان‌بندی یادآورهای دارویی (Cron Worker)** | سرویس Cron اجرایی یا فراخوانی Webhook | Cron Job سیستم‌عامل لینوکس / cPanel | **CONFIRMED** |
| **گواهی امنیتی SSL و دامنه اختصاصی** | SSL رایگان Let's Encrypt و اتصال دامنه `.ir` | SSL رایگان AutoSSL و اتصال دامنه `.ir` | **CONFIRMED** |
| **اتصال به مخزن خصوصی GitHub** | Integration مستقیم یا Registry | اتصال از طریق SSH / Git Version Control | **CONFIRMED** |

---

## 🔒 اصول ایمنی و ایزوله‌سازی محیط استیجینگ (Staging Safety Protocols)

1. **دیتابیس کاملاً ایزوله:** عدم استفاده از دیتابیس عملیاتی (Production) و اجرای دستورات مایگریشن روی پایگاه‌داده تست.
2. **داده‌های آزمایشی سنتتیک (Synthetic Data):** استفاده منحصر به فرد از داده‌های فرضی برای کاربران، داروها و سفارشات.
3. **پزشکی و نسخه‌های غیرواقعی:** عدم بارگذاری تصاویر نسخ واقعی بیماران در محیط استیجینگ.
4. **درگاه پرداخت شبیه‌سازی‌شده:** عدم اتصال به درگاه‌های واقعی شتاب؛ استفاده از قیمت‌های فرضی به تومان.
5. **ارسال نکرده اعلان‌های بیرونی:** عدم ارسال پیامک واقعی یا ایمیل به مشتریان در فاز تست.
6. **محرمانه بودن متغیرها:** عدم ثبت کلیدها و پسوردهای واقعی در Git.

---

## 🛠 دستورات ساخت، مایگریشن و اجرا (Build, Migration & Start Commands)

### ۱. مایگریشن دیتابیس در استیجینگ
برای اعمال تغییرات اسکیما روی دیتابیس PostgreSQL استیجینگ بدون از دست رفتن داده‌ها:
```bash
npx prisma migrate deploy
```

### ۲. ساخت نسخه اجرایی Production / Staging
```bash
npm run build
```

### ۳. اجرای برنامه
```bash
npm start
```

### ۴. ساخت و اجرای کانتینر Docker
```bash
docker build -t daroomap:staging .
docker run -d -p 3000:3000 --env-file .env -v daroomap_prescriptions:/app/uploads/prescriptions daroomap:staging
```

---

## 📄 مجوز
تمامی حقوق متعلق به پلتفرم دارومپ می‌باشد.
