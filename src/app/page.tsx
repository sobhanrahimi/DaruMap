import { Header, Footer } from "@/components/layout";
import { MedicineSearch, SearchResultItem } from "@/components/MedicineSearch";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  let searchItems: SearchResultItem[] = [];

  try {
    const inventories = await prisma.pharmacyInventory.findMany({
      include: {
        medicine: true,
        pharmacy: true,
      },
    });

    searchItems = inventories
      .filter((inv) => inv.medicine !== null)
      .map((inv) => ({
        inventoryId: inv.id,
        medicineId: inv.medicine!.id,
        medicineNameFa: inv.medicine!.nameFa,
        medicineNameEn: inv.medicine!.nameEn || undefined,
        genericName: inv.medicine!.genericName || undefined,
        requiresRecipe: inv.medicine!.requiresRecipe,
        pharmacyId: inv.pharmacy.id,
        pharmacyName: inv.pharmacy.name,
        pharmacyAddress: inv.pharmacy.address,
        pharmacyPhone: inv.pharmacy.phone,
        priceToman: inv.priceToman,
        stock: inv.stock,
        isAvailable: inv.isAvailable,
      }));
  } catch {
    searchItems = [];
  }

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <section className="bg-emerald-800 text-white p-8 sm:p-10 rounded-3xl shadow-lg relative overflow-hidden">
          <div className="relative z-10 max-w-2xl">
            <h1 className="text-3xl sm:text-4xl font-extrabold leading-tight mb-4">
              جستجو و سفارش آنلاین دارو از نزدیک‌ترین داروخانه‌ها
            </h1>
            <p className="text-emerald-100 text-base sm:text-lg mb-2">
              دارومپ پلتفرم جامع کشوری برای یافتن داروهای کمیاب، مشاهده قیمت به تومان و ثبت سفارش مستقیم از یک داروخانه انتخاب شده است.
            </p>
          </div>
        </section>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">لیست داروخانه‌ها و داروهای موجود</h2>
          <MedicineSearch initialItems={searchItems} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
