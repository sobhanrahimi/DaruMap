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
    });
  } catch {
    pharmacies = [];
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-black text-gray-900">لیست داروخانه‌های فعال</h1>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          {pharmacies.map((pharmacy) => (
            <div
              key={pharmacy.id}
              className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm flex flex-col justify-between"
            >
              <div>
                <h2 className="text-xl font-bold text-gray-900">🏥 {pharmacy.name}</h2>
                <p className="text-gray-600 text-sm mt-2">📍 {pharmacy.address}</p>
                <p className="text-gray-500 text-xs mt-1">📞 {pharmacy.phone}</p>
                <div className="mt-4">
                  <span className="bg-emerald-50 text-emerald-700 text-xs px-3 py-1.5 rounded-full font-semibold">
                    {pharmacy._count.inventory} عنوان داروی ثبت‌شده
                  </span>
                </div>
              </div>

              <div className="mt-6 pt-4 border-t border-gray-100">
                <Link
                  href={`/pharmacy/${pharmacy.id}`}
                  className="block text-center bg-emerald-600 hover:bg-emerald-700 text-white font-semibold text-sm py-2.5 rounded-xl transition shadow-sm"
                >
                  مشاهده داروخانه و داروها
                </Link>
              </div>
            </div>
          ))}

          {pharmacies.length === 0 && (
            <div className="col-span-full bg-white p-12 text-center rounded-3xl border border-gray-100 text-gray-500 font-medium">
              در حال حاضر داروخانه‌ای ثبت نشده است.
            </div>
          )}
        </div>
      </main>
      <Footer />
    </div>
  );
}
