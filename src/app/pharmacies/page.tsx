import { Header, Footer } from "@/components/layout";
import { prisma } from "@/lib/db";
import Link from "next/link";

export default async function PharmaciesPage() {
  let pharmacies: any[] = [];

  try {
    pharmacies = await prisma.pharmacy.findMany({
      include: {
        _count: {
          select: { inventory: true },
        },
      },
      orderBy: { name: "asc" },
    });
  } catch {
    pharmacies = [];
  }

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="space-y-2">
          <div className="inline-flex items-center gap-2 bg-teal-50 px-3 py-1 rounded-full text-xs font-bold text-teal-800 border border-teal-200/60">
            🏥 شبکه داروخانه‌های تاییدشده
          </div>
          <h1 className="text-3xl font-black text-slate-900">لیست داروخانه‌های فعال پلتفرم</h1>
          <p className="text-xs text-slate-500">
            داروخانه‌های تاییدشده با پروانه رسمی وزارت بهداشت و موجودی انبار به‌روز به تومان
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {pharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              className="daroomap-card p-6 flex flex-col justify-between space-y-5"
            >
              <div className="space-y-3">
                <div className="flex items-start justify-between">
                  <div className="w-10 h-10 bg-teal-50 text-teal-800 rounded-xl flex items-center justify-center font-bold text-lg">
                    🏥
                  </div>
                  {pharmacy.isVerified ? (
                    <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      ✓ تاییدشده رسمی
                    </span>
                  ) : (
                    <span className="bg-amber-50 text-amber-800 border border-amber-200 text-[10px] px-2.5 py-0.5 rounded-full font-bold">
                      در حال احراز
                    </span>
                  )}
                </div>

                <div>
                  <h2 className="text-lg font-bold text-slate-900">{pharmacy.name}</h2>
                  <p className="text-xs text-slate-500 mt-1">شماره پروانه: {pharmacy.licenseNo}</p>
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1.5 text-xs text-slate-600">
                  <p className="flex items-center gap-1.5">
                    <span>📍</span>
                    <span>{pharmacy.city} — {pharmacy.address}</span>
                  </p>
                  <p className="flex items-center gap-1.5">
                    <span>📞</span>
                    <span>{pharmacy.phone}</span>
                  </p>
                </div>

                <div className="pt-2">
                  <span className="bg-slate-100 text-slate-700 text-xs px-3 py-1 rounded-lg font-bold inline-block">
                    📦 {pharmacy._count.inventory} عنوان داروی ثبت‌شده
                  </span>
                </div>
              </div>

              <div className="pt-4 border-t border-slate-100">
                <Link
                  href={`/pharmacy/${pharmacy.id}`}
                  className="block text-center bg-teal-800 hover:bg-teal-900 text-white font-bold text-xs py-2.5 rounded-xl transition shadow-2xs"
                >
                  مشاهده داروخانه و استعلام انبار
                </Link>
              </div>
            </div>
          ))}

          {pharmacies.length === 0 && (
            <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200/80 text-slate-500 font-medium text-xs">
              در حال حاضر داروخانه‌ای ثبت نشده است.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
