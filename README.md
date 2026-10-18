# دارومپ (DaruMap) — راهنمای ارزیابی زیرساخت و استقرار استیجینگ (Staging Deployment & Cloud Audit Guide)

**دارومپ (DaruMap)** یک پلتفرم کشوری برای یافتن داروهای کمیاب، استعلام انبار داروخانه‌ها، ارسال امن نسخه و انتخاب بیمه پایه، یادآورهای دارویی، باشگاه مشتریان، مشاهده قیمت‌ها به تومان و ثبت سفارش آنلاین با پشتیبانی کامل از چیدمان **راست‌به‌چپ (RTL)** و فونت فارسی **وزیرمتن** می‌باشد.

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

### ۱. نصب وابستگی‌ها و تولید کلاینت پریزما
```bash
npm install
npx prisma generate
```

### ۲. مایگریشن دیتابیس در استیجینگ
برای اعمال تغییرات اسکیما روی دیتابیس PostgreSQL استیجینگ بدون از دست رفتن داده‌ها:
```bash
npx prisma migrate deploy
```
*نکته:* برای دیتابیس‌های آزمایشی اولیه‌می‌توان از دستور `npx prisma db push` استفاده نمود.

### ۳. ساخت نسخه اجرایی Production / Staging
```bash
npm run build
```

### ۴. اجرای برنامه
```bash
npm start
```

### ۵. ساخت و اجرای کانتینر Docker
```bash
docker build -t daroomap:staging .
docker run -d -p 3000:3000 --env-file .env -v daroomap_prescriptions:/app/uploads/prescriptions daroomap:staging
```

---

## 🔑 متغیرهای محیطی مورد نیاز (Environment Variables)

نام متغیرهای محیطی مورد نیاز در فایل `.env`:
* `DATABASE_URL`: آدرس اتصال به دیتابیس PostgreSQL استیجینگ.
* `NODE_ENV`: مقدار `staging` یا `production`.
* `NEXT_PUBLIC_APP_URL`: آدرس دامنه استیجینگ (مانند `https://staging.daroomap.ir`).
* `NEXTAUTH_SECRET`: کلید رمزنگاری توکن‌های احراز هویت.
* `NEXTAUTH_URL`: آدرس پایه احراز هویت.
* `PRESCRIPTION_STORAGE_PATH`: مسیر دایرکتوری پایدار برای ذخیره‌سازی نسخه‌ها (مانند `/app/uploads/prescriptions`).
* `CRON_SECRET_KEY`: کلید امنیتی احراز هویت درخواست‌های سرویس‌دهنده زمان‌بندی یادآورها.

---

## ⏰ تنظیم پردازشگر پس‌زمینه یادآورها (Reminder Worker Setup)

پردازشگر یادآورهای دارویی از طریق نقطه پایانی `POST /api/worker/reminders` اجرا می‌گردد.
در سرور استیجینگ می‌توانید یک Cron Job دقیقه به دقیقه جهت فراخوانی این آدرس تنظیم نمایید:
```bash
* * * * * curl -X POST https://staging.daroomap.ir/api/worker/reminders -H "Authorization: Bearer YOUR_CRON_SECRET_KEY" -H "Content-Type: application/json"
```

---

## 📄 مجوز
تمامی حقوق متعلق به پلتفرم دارومپ می‌باشد.
