/**
 * Logic and constraints for Orders in Daroomap.
 * Crucial constraint: Each order belongs to EXACTLY ONE pharmacy.
 */

export interface CartItemInput {
  medicineId: string;
  medicineNameFa: string;
  pharmacyId: string;
  pharmacyName: string;
  unitPriceToman: number;
  quantity: number;
}

export interface ValidateCartResult {
  isValid: boolean;
  pharmacyId?: string;
  pharmacyName?: string;
  totalToman: number;
  error?: string;
}

export function validateAndCalculateCart(items: CartItemInput[]): ValidateCartResult {
  if (!items || items.length === 0) {
    return {
      isValid: false,
      totalToman: 0,
      error: "سبد خرید خالی است",
    };
  }

  const primaryPharmacyId = items[0].pharmacyId;
  const primaryPharmacyName = items[0].pharmacyName;

  for (const item of items) {
    if (item.pharmacyId !== primaryPharmacyId) {
      return {
        isValid: false,
        totalToman: 0,
        error: "امکان ثبت سفارش از چند داروخانه در یک سبد خرید وجود ندارد. لطفاً فقط از یک داروخانه انتخاب نمایید.",
      };
    }
    if (item.quantity <= 0) {
      return {
        isValid: false,
        totalToman: 0,
        error: "تعداد آیتم باید بیشتر از صفر باشد.",
      };
    }
  }

  const totalToman = items.reduce(
    (sum, item) => sum + item.unitPriceToman * item.quantity,
    0
  );

  return {
    isValid: true,
    pharmacyId: primaryPharmacyId,
    pharmacyName: primaryPharmacyName,
    totalToman,
  };
}
