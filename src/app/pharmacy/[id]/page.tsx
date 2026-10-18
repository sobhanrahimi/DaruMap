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
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8">
        <div className="bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-4">
          <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
            <div>
              <h1 className="text-2xl sm:text-3xl font-black text-gray-900">
                🏥 {pharmacy.name}
              </h1>
              <p className="text-gray-600 text-sm mt-2">📍 {pharmacy.address}</p>
            </div>
            <div className="bg-emerald-50 px-4 py-2 rounded-2xl text-emerald-800 text-sm font-semibold">
              📞 تلفن: {pharmacy.phone}
            </div>
          </div>
        </div>

        <section className="space-y-4">
          <h2 className="text-xl font-bold text-gray-900">
            داروهای موجود در {pharmacy.name}
          </h2>
          <MedicineSearch initialItems={items} />
        </section>
      </main>
      <Footer />
    </div>
  );
}
