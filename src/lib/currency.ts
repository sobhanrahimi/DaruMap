/**
 * Utility functions for currency handling in Daroomap.
 * All internal application monetary values in Daroomap are denominated in TOMAN.
 * RIAL conversion occurs exclusively at the payment gateway integration layer.
 */

export function formatToman(amountInToman: number, usePersianDigits = true): string {
  if (isNaN(amountInToman) || amountInToman < 0) {
    return "۰ تومان";
  }

  const formatted = amountInToman.toLocaleString("en-US");

  if (!usePersianDigits) {
    return `${formatted} تومان`;
  }

  const persianDigits = ["۰", "۱", "۲", "۳", "۴", "۵", "۶", "۷", "۸", "۹"];
  const persianFormatted = formatted.replace(/\d/g, (d) => persianDigits[parseInt(d, 10)]);

  return `${persianFormatted} تومان`;
}

export function convertTomanToRial(toman: number): number {
  if (toman < 0) throw new Error("Amount in Toman cannot be negative");
  return toman * 10;
}

export function convertRialToToman(rial: number): number {
  if (rial < 0) throw new Error("Amount in Rial cannot be negative");
  return Math.floor(rial / 10);
}
