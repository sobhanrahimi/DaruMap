import { describe, it, expect } from "vitest";
import { formatToman, convertTomanToRial, convertRialToToman } from "@/lib/currency";

describe("Currency Utility Functions (TOMAN)", () => {
  it("formats numbers in Toman with Persian digits and comma separators", () => {
    expect(formatToman(25000)).toBe("۲۵,۰۰۰ تومان");
    expect(formatToman(1000000)).toBe("۱,۰۰۰,۰۰۰ تومان");
    expect(formatToman(0)).toBe("۰ تومان");
  });

  it("formats numbers in Toman with English digits when specified", () => {
    expect(formatToman(25000, false)).toBe("25,000 تومان");
  });

  it("handles negative or invalid numbers gracefully", () => {
    expect(formatToman(-100)).toBe("۰ تومان");
    expect(formatToman(NaN)).toBe("۰ تومان");
  });

  it("converts Toman to Rial for payment gateway integration layer", () => {
    expect(convertTomanToRial(5000)).toBe(50000);
    expect(convertTomanToRial(0)).toBe(0);
    expect(() => convertTomanToRial(-100)).toThrow("Amount in Toman cannot be negative");
  });

  it("converts Rial to Toman from payment gateway response", () => {
    expect(convertRialToToman(50000)).toBe(5000);
    expect(convertRialToToman(15)).toBe(1);
    expect(() => convertRialToToman(-50)).toThrow("Amount in Rial cannot be negative");
  });
});
