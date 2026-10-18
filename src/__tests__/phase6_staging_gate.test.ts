import { describe, it, expect } from "vitest";
import { validateAndCalculateCart, CartItemInput } from "@/lib/order";
import { formatToman, convertTomanToRial, convertRialToToman } from "@/lib/currency";

describe("Phase 6 Staging Gate — Order Integrity & Currency Constraints", () => {
  it("rejects carts attempting to combine items from multiple pharmacies", () => {
    const multiPharmacyCart: CartItemInput[] = [
      {
        medicineId: "med-1",
        medicineNameFa: "استامینوفن",
        pharmacyId: "pharmacy-1",
        pharmacyName: "داروخانه دکتر سلامی",
        unitPriceToman: 25000,
        quantity: 1,
      },
      {
        medicineId: "med-2",
        medicineNameFa: "آموکسی‌سیلین",
        pharmacyId: "pharmacy-2",
        pharmacyName: "داروخانه مرکزی رازی",
        unitPriceToman: 48000,
        quantity: 1,
      },
    ];

    const result = validateAndCalculateCart(multiPharmacyCart);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("امکان ثبت سفارش از چند داروخانه در یک سبد خرید وجود ندارد");
  });

  it("rejects zero or negative quantities to prevent price tampering", () => {
    const zeroQuantityCart: CartItemInput[] = [
      {
        medicineId: "med-1",
        medicineNameFa: "استامینوفن",
        pharmacyId: "pharmacy-1",
        pharmacyName: "داروخانه دکتر سلامی",
        unitPriceToman: 25000,
        quantity: 0,
      },
    ];

    const result = validateAndCalculateCart(zeroQuantityCart);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("تعداد آیتم باید بیشتر از صفر باشد");
  });

  it("calculates accurate cart total in Toman", () => {
    const validCart: CartItemInput[] = [
      {
        medicineId: "med-1",
        medicineNameFa: "استامینوفن ۵۰۰",
        pharmacyId: "pharmacy-1",
        pharmacyName: "داروخانه دکتر سلامی",
        unitPriceToman: 25000,
        quantity: 2,
      },
      {
        medicineId: "med-2",
        medicineNameFa: "آموکسی‌سیلین ۵۰۰",
        pharmacyId: "pharmacy-1",
        pharmacyName: "داروخانه دکتر سلامی",
        unitPriceToman: 48000,
        quantity: 1,
      },
    ];

    const result = validateAndCalculateCart(validCart);
    expect(result.isValid).toBe(true);
    expect(result.totalToman).toBe(98000);
    expect(formatToman(result.totalToman)).toBe("۹۸,۰۰۰ تومان");
  });

  it("converts Toman to Rial exclusively for payment gateway integration layer", () => {
    expect(convertTomanToRial(98000)).toBe(980000);
    expect(convertRialToToman(980000)).toBe(98000);
  });
});
