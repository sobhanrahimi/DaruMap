/**
 * Helper functions for medicine inventory search and filtering.
 */

export interface InventoryRecord {
  id: string;
  medicineId: string;
  medicineNameFa: string;
  medicineNameEn?: string;
  genericName?: string;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyPhone: string;
  priceToman: number;
  stock: number;
  isAvailable: boolean;
}

export function filterInventory(
  inventory: InventoryRecord[],
  query: string,
  onlyInStock = false
): InventoryRecord[] {
  if (!query && !onlyInStock) return inventory;

  const trimmedQuery = query.trim().toLowerCase();

  return inventory.filter((item) => {
    if (onlyInStock && (!item.isAvailable || item.stock <= 0)) {
      return false;
    }

    if (!trimmedQuery) return true;

    const matchesNameFa = item.medicineNameFa.toLowerCase().includes(trimmedQuery);
    const matchesNameEn = item.medicineNameEn?.toLowerCase().includes(trimmedQuery) ?? false;
    const matchesGeneric = item.genericName?.toLowerCase().includes(trimmedQuery) ?? false;
    const matchesPharmacy = item.pharmacyName.toLowerCase().includes(trimmedQuery);

    return matchesNameFa || matchesNameEn || matchesGeneric || matchesPharmacy;
  });
}
