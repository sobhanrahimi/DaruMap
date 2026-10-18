"use client";

import { useState } from "react";
import Link from "next/link";
import { formatToman } from "@/lib/currency";

export interface SearchResultItem {
  inventoryId: string;
  medicineId: string;
  medicineNameFa: string;
  medicineNameEn?: string;
  genericName?: string;
  requiresRecipe: boolean;
  pharmacyId: string;
  pharmacyName: string;
  pharmacyAddress: string;
  pharmacyPhone: string;
  priceToman: number;
  stock: number;
  isAvailable: boolean;
}

export function MedicineSearch({ initialItems }: { initialItems: SearchResultItem[] }) {
  const [query, setQuery] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  const filteredItems = initialItems.filter((item) => {
    if (onlyInStock && (!item.isAvailable || item.stock <= 0)) {
      return false;
    }
    if (!query.trim()) return true;

    const q = query.trim().toLowerCase();
    return (
      item.medicineNameFa.toLowerCase().includes(q) ||
      (item.medicineNameEn && item.medicineNameEn.toLowerCase().includes(q)) ||
      (item.genericName && item.genericName.toLowerCase().includes(q)) ||
      item.pharmacyName.toLowerCase().includes(q)
    );
  });

  const handleAddToCart = (item: SearchResultItem) => {
    try {
      const cartStr = localStorage.getItem("daroomap_cart");
      let cartItems: any[] = [];
      let currentPharmacyId: string | null = null;

      if (cartStr) {
        const cart = JSON.parse(cartStr);
        cartItems = cart.items || [];
        if (cartItems.length > 0) {
          currentPharmacyId = cartItems[0].pharmacyId;
        }
      }

      if (currentPharmacyId && currentPharmacyId !== item.pharmacyId) {
        setToastMessage(
          "امکان اضافه کردن دارو از داروخانه دیگر وجود ندارد. هر سفارش فقط مربوط به یک داروخانه است."
        );
        setTimeout(() => setToastMessage(null), 4000);
        return;
      }

      const existingIndex = cartItems.findIndex((ci) => ci.inventoryId === item.inventoryId);
      if (existingIndex > -1) {
        cartItems[existingIndex].quantity += 1;
      } else {
        cartItems.push({
          inventoryId: item.inventoryId,
          medicineId: item.medicineId,
          medicineNameFa: item.medicineNameFa,
          pharmacyId: item.pharmacyId,
          pharmacyName: item.pharmacyName,
          unitPriceToman: item.priceToman,
          quantity: 1,
        });
      }

      localStorage.setItem("daroomap_cart", JSON.stringify({ items: cartItems }));
      window.dispatchEvent(new Event("cartUpdated"));

      setToastMessage(`آیتم "${item.medicineNameFa}" به سبد خرید اضافه شد.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      setToastMessage("خطا در افزودن به سبد خرید");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="bg-emerald-800 text-white p-4 rounded-xl shadow-lg border border-emerald-600 font-medium text-sm transition-all animate-bounce">
          {toastMessage}
        </div>
      )}

      {/* Search Input Box */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 flex flex-col md:flex-row gap-4 items-center justify-between">
        <div className="relative w-full md:w-2/3">
          <input
            type="text"
            placeholder="نام داروی فارسی، انگلیسی یا نام داروخانه..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
          />
          <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
        </div>

        <div className="flex items-center gap-2">
          <label className="inline-flex items-center cursor-pointer text-sm font-medium text-gray-700">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 ml-2"
            />
            فقط داروهای موجود
          </label>
        </div>
      </div>

      {/* Search Results List */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {filteredItems.map((item) => (
          <div
            key={item.inventoryId}
            className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between"
          >
            <div>
              <div className="flex justify-between items-start mb-2">
                <div>
                  <h3 className="text-lg font-bold text-gray-900">{item.medicineNameFa}</h3>
                  {item.medicineNameEn && (
                    <p className="text-xs text-gray-400 font-mono mt-0.5">{item.medicineNameEn}</p>
                  )}
                </div>
                {item.requiresRecipe ? (
                  <span className="bg-amber-50 text-amber-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    نیازمند نسخه
                  </span>
                ) : (
                  <span className="bg-emerald-50 text-emerald-700 text-xs px-2.5 py-1 rounded-full font-medium">
                    بدون نسخه
                  </span>
                )}
              </div>

              <div className="mt-4 pt-3 border-t border-gray-50 space-y-1">
                <p className="text-sm font-semibold text-emerald-700">
                  <Link href={`/pharmacy/${item.pharmacyId}`} className="hover:underline">
                    🏥 {item.pharmacyName}
                  </Link>
                </p>
                <p className="text-xs text-gray-500">📍 {item.pharmacyAddress}</p>
              </div>
            </div>

            <div className="mt-5 pt-4 border-t border-gray-100 flex items-center justify-between">
              <div>
                <span className="text-xs text-gray-400 block">قیمت:</span>
                <span className="text-base font-extrabold text-gray-900">
                  {formatToman(item.priceToman)}
                </span>
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={!item.isAvailable || item.stock <= 0}
                  className={`px-4 py-2 rounded-xl text-sm font-semibold transition shadow-sm ${
                    item.isAvailable && item.stock > 0
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {item.isAvailable && item.stock > 0 ? "افزودن به سبد" : "ناموجود"}
                </button>
              </div>
            </div>
          </div>
        ))}

        {filteredItems.length === 0 && (
          <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-100">
            <p className="text-gray-500 font-medium">دارویی با این مشخصات یافت نشد.</p>
          </div>
        )}
      </div>
    </div>
  );
}
