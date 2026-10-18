"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import { formatToman } from "@/lib/currency";
import { searchMedicinesAction } from "@/lib/searchActions";
import { MedicineSearchResult } from "@/lib/search";

export type SearchResultItem = MedicineSearchResult;

export function MedicineSearch({ initialItems }: { initialItems: MedicineSearchResult[] }) {
  const [items, setItems] = useState<MedicineSearchResult[]>(initialItems);
  const [query, setQuery] = useState("");
  const [city, setCity] = useState("");
  const [onlyInStock, setOnlyInStock] = useState(false);
  const [sortBy, setSortBy] = useState<"distance" | "price" | "name">("name");
  const [coords, setCoords] = useState<{ latitude: number; longitude: number } | null>(null);
  const [isLocating, setIsLocating] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [toastMessage, setToastMessage] = useState<string | null>(null);

  // Request browser geolocation permission
  const handleRequestLocation = () => {
    if (!navigator.geolocation) {
      setToastMessage("مرورگر شما از قابلیت موقعیت‌یابی پشتیبانی نمی‌کند.");
      setTimeout(() => setToastMessage(null), 3000);
      return;
    }

    setIsLocating(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        setIsLocating(false);
        setCoords({
          latitude: pos.coords.latitude,
          longitude: pos.coords.longitude,
        });
        setSortBy("distance");
        setToastMessage("موقعیت شما با موفقیت دریافت شد.");
        setTimeout(() => setToastMessage(null), 3000);
      },
      (err) => {
        setIsLocating(false);
        setToastMessage("دریافت موقعیت با خطا مواجه شد یا رد گردید.");
        setTimeout(() => setToastMessage(null), 3000);
      }
    );
  };

  // Trigger search on options change
  useEffect(() => {
    const doSearch = async () => {
      setIsLoading(true);
      const res = await searchMedicinesAction({
        query,
        city: city || undefined,
        onlyInStock,
        sortBy,
        latitude: coords?.latitude,
        longitude: coords?.longitude,
      });

      setIsLoading(false);
      if (res.success) {
        setItems(res.items);
      }
    };

    const timer = setTimeout(() => {
      doSearch();
    }, 300);

    return () => clearTimeout(timer);
  }, [query, city, onlyInStock, sortBy, coords]);

  const handleAddToCart = (item: MedicineSearchResult) => {
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

      {/* Search & Location Bar */}
      <div className="bg-white p-6 rounded-2xl shadow-sm border border-gray-100 space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="نام داروی فارسی، انگلیسی یا نام داروخانه..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-gray-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 text-sm"
            />
            <span className="absolute left-3 top-3.5 text-gray-400">🔍</span>
          </div>

          {/* Location button & city filter */}
          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleRequestLocation}
              disabled={isLocating}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                coords
                  ? "bg-emerald-50 text-emerald-700 border-emerald-200"
                  : "bg-gray-50 text-gray-700 border-gray-200 hover:bg-gray-100"
              }`}
            >
              📍 {isLocating ? "در حال دریافت..." : coords ? "موقعیت فعال" : "استفاده از موقعیت من"}
            </button>

            <input
              type="text"
              placeholder="فیلتر شهر (مثلا: تهران)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3 py-2.5 rounded-xl border border-gray-200 text-xs w-36 focus:ring-2 focus:ring-emerald-500"
            />
          </div>
        </div>

        {/* Options & Sorting */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-gray-50 text-xs">
          <label className="inline-flex items-center cursor-pointer font-medium text-gray-700">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded text-emerald-600 focus:ring-emerald-500 h-4 w-4 ml-2"
            />
            فقط داروهای موجود در انبار
          </label>

          <div className="flex items-center gap-2">
            <span className="text-gray-500 font-semibold">مرتب‌سازی:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="p-2 rounded-lg border border-gray-200 bg-white text-xs font-semibold text-gray-700 focus:ring-2 focus:ring-emerald-500"
            >
              <option value="name">نام دارو</option>
              <option value="price">قیمت (کمتر به بیشتر)</option>
              {coords && <option value="distance">نزدیک‌ترین فاصله جغرافیایی</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Results Section */}
      {isLoading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-gray-100">
          <p className="text-gray-500 font-medium">در حال دريافت اطلاعات انبار داروخانه‌ها...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {items.map((item) => (
            <div
              key={item.inventoryId}
              className="bg-white p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition flex flex-col justify-between space-y-4"
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

                <div className="mt-3 pt-3 border-t border-gray-50 space-y-1">
                  <div className="flex justify-between items-center">
                    <p className="text-sm font-semibold text-emerald-700">
                      <Link href={`/pharmacy/${item.pharmacyId}`} className="hover:underline">
                        🏥 {item.pharmacyName}
                      </Link>
                    </p>
                    {item.distanceKm !== undefined && (
                      <span className="bg-blue-50 text-blue-700 text-xs px-2 py-0.5 rounded-md font-bold">
                        📍 {item.distanceKm} کیلومتر
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-gray-500">📍 {item.pharmacyAddress}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-gray-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-2">
                    <span className="text-xs text-gray-400">قیمت:</span>
                    <span className="text-base font-extrabold text-gray-900">
                      {formatToman(item.priceToman)}
                    </span>
                  </div>
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded font-bold inline-block mt-1 ${
                      item.freshnessStatus === "AVAILABLE"
                        ? "bg-emerald-100 text-emerald-800"
                        : item.freshnessStatus === "STALE"
                        ? "bg-amber-100 text-amber-800"
                        : "bg-rose-100 text-rose-800"
                    }`}
                  >
                    {item.freshnessStatus === "AVAILABLE"
                      ? "موجود و به‌روز"
                      : item.freshnessStatus === "STALE"
                      ? "نیازمند استعلام تلفنی"
                      : "ناموجود"}
                  </span>
                </div>

                <button
                  onClick={() => handleAddToCart(item)}
                  disabled={item.freshnessStatus === "UNAVAILABLE" || item.stock <= 0}
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-sm ${
                    item.freshnessStatus !== "UNAVAILABLE" && item.stock > 0
                      ? "bg-emerald-600 hover:bg-emerald-700 text-white"
                      : "bg-gray-100 text-gray-400 cursor-not-allowed"
                  }`}
                >
                  {item.freshnessStatus !== "UNAVAILABLE" && item.stock > 0
                    ? "افزودن به سبد"
                    : "ناموجود"}
                </button>
              </div>
            </div>
          ))}

          {items.length === 0 && (
            <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-gray-100">
              <p className="text-gray-500 font-medium">دارویی با این مشخصات در انبار داروخانه‌ها یافت نشد.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
