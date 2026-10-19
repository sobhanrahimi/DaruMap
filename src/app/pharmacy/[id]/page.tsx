import { Header, Footer } from "@/components/layout";
import { MedicineSearch } from "@/components/MedicineSearch";
import { prisma } from "@/lib/db";
import { calculateFreshnessStatus, MedicineSearchResult } from "@/lib/search";
import { notFound } from "next/navigation";

export default async function PharmacyDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;

  let pharmacy: any = null;

  try {
    pharmacy = await prisma.pharmacy.findUnique({
      where: { id },
      include: {
        inventory: {
          include: {
            medicine: true,
          },
        },
      },
    });
  } catch {
    pharmacy = null;
  }

  if (!pharmacy) {
    notFound();
  }

  const items: MedicineSearchResult[] = pharmacy.inventory
    .filter((inv: any) => inv.medicine !== null)
    .map((inv: any) => ({
      inventoryId: inv.id,
      medicineId: inv.medicine!.id,
      medicineNameFa: inv.medicine!.nameFa,
      medicineNameEn: inv.medicine!.nameEn || undefined,
      genericName: inv.medicine!.genericName || undefined,
      requiresRecipe: inv.medicine!.requiresRecipe,
      pharmacyId: pharmacy.id,
      pharmacyName: pharmacy.name,
      pharmacyAddress: pharmacy.address,
      pharmacyCity: pharmacy.city,
      pharmacyPhone: pharmacy.phone,
      pharmacyIsVerified: pharmacy.isVerified,
      priceToman: inv.priceToman,
      stock: inv.stock,
      freshnessStatus: calculateFreshnessStatus(inv.updatedAt, inv.stock, inv.isAvailable),
      lastInventoryUpdate: inv.updatedAt.toISOString(),
    }));

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div className="space-y-1">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🏥</span>
                <h1 className="text-2xl sm:text-3xl font-black text-slate-900">
                  {pharmacy.name}
                </h1>
                {pharmacy.isVerified && (
                  <span className="bg-emerald-50 text-emerald-800 border border-emerald-200 text-xs px-2.5 py-0.5 rounded-full font-bold">
                    ✓ تاییدشده
                  </span>
                )}
              </div>
              <p className="text-xs text-slate-500">📍 {pharmacy.city} — {pharmacy.address}</p>
            </div>

            <div className="bg-teal-50 border border-teal-200/80 px-4 py-2.5 rounded-xl text-teal-900 text-xs font-bold flex items-center gap-2">
              <span>📞</span>
              <span>شماره تماس: {pharmacy.phone}</span>
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-black text-slate-900">
            داروهای موجود در انبار {pharmacy.name}
          </h2>
          <MedicineSearch initialItems={items} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
