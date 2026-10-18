import { describe, it, expect } from "vitest";
import { validateAndCalculateCart, CartItemInput } from "@/lib/order";

describe("Order Constraints Logic", () => {
  it("rejects empty cart", () => {
    const result = validateAndCalculateCart([]);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("سبد خرید خالی است");
  });

  it("validates valid cart with single pharmacy", () => {
    const cart: CartItemInput[] = [
      {
        medicineId: "med-1",
        medicineNameFa: "استامینوفن",
        pharmacyId: "pharm-1",
        pharmacyName: "داروخانه سلامی",
        unitPriceToman: 25000,
        quantity: 2,
      },
      {
        medicineId: "med-2",
        medicineNameFa: "آموکسی‌سیلین",
        pharmacyId: "pharm-1",
        pharmacyName: "داروخانه سلامی",
        unitPriceToman: 48000,
        quantity: 1,
      },
    ];

    const result = validateAndCalculateCart(cart);
    expect(result.isValid).toBe(true);
    expect(result.pharmacyId).toBe("pharm-1");
    expect(result.pharmacyName).toBe("داروخانه سلامی");
    expect(result.totalToman).toBe(25000 * 2 + 48000 * 1);
  });

  it("enforces single pharmacy constraint per order", () => {
    const invalidCart: CartItemInput[] = [
      {
        medicineId: "med-1",
        medicineNameFa: "استامینوفن",
        pharmacyId: "pharm-1",
        pharmacyName: "داروخانه سلامی",
        unitPriceToman: 25000,
        quantity: 1,
      },
      {
        medicineId: "med-3",
        medicineNameFa: "شربت دیفن هیدرامین",
        pharmacyId: "pharm-2",
        pharmacyName: "داروخانه رازی",
        unitPriceToman: 32000,
        quantity: 1,
      },
    ];

    const result = validateAndCalculateCart(invalidCart);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("امکان ثبت سفارش از چند داروخانه در یک سبد خرید وجود ندارد");
  });

  it("rejects zero or negative quantities", () => {
    const invalidCart: CartItemInput[] = [
      {
        medicineId: "med-1",
        medicineNameFa: "استامینوفن",
        pharmacyId: "pharm-1",
        pharmacyName: "داروخانه سلامی",
        unitPriceToman: 25000,
        quantity: 0,
      },
    ];

    const result = validateAndCalculateCart(invalidCart);
    expect(result.isValid).toBe(false);
    expect(result.error).toContain("تعداد آیتم باید بیشتر از صفر باشد");
  });
});
