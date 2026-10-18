import { describe, it, expect } from "vitest";
import { filterInventory, InventoryRecord } from "@/lib/inventory";

describe("Medicine Inventory Logic", () => {
  const sampleInventory: InventoryRecord[] = [
    {
      id: "inv-1",
      medicineId: "med-1",
      medicineNameFa: "استامینوفن ۵۰۰",
      medicineNameEn: "Acetaminophen 500mg",
      genericName: "Acetaminophen",
      pharmacyId: "pharm-1",
      pharmacyName: "داروخانه دکتر سلامی",
      pharmacyAddress: "ونک",
      pharmacyPhone: "021-12345678",
      priceToman: 25000,
      stock: 10,
      isAvailable: true,
    },
    {
      id: "inv-2",
      medicineId: "med-2",
      medicineNameFa: "آموکسی سیلین ۵۰۰",
      medicineNameEn: "Amoxicillin 500mg",
      genericName: "Amoxicillin",
      pharmacyId: "pharm-2",
      pharmacyName: "داروخانه مرکزی رازی",
      pharmacyAddress: "انقلاب",
      pharmacyPhone: "021-87654321",
      priceToman: 48000,
      stock: 0,
      isAvailable: false,
    },
  ];

  it("filters inventory by Persian medicine name", () => {
    const results = filterInventory(sampleInventory, "استامینوفن");
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("inv-1");
  });

  it("filters inventory by English medicine name", () => {
    const results = filterInventory(sampleInventory, "Amoxicillin");
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("inv-2");
  });

  it("filters inventory by pharmacy name", () => {
    const results = filterInventory(sampleInventory, "سلامی");
    expect(results.length).toBe(1);
    expect(results[0].pharmacyId).toBe("pharm-1");
  });

  it("filters by availability / in-stock status", () => {
    const results = filterInventory(sampleInventory, "", true);
    expect(results.length).toBe(1);
    expect(results[0].id).toBe("inv-1");
  });
});
