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
        setToastMessage("موقعیت جغرافیایی شما با موفقیت دریافت گردید.");
        setTimeout(() => setToastMessage(null), 3000);
      },
      () => {
        setIsLocating(false);
        setToastMessage("دریافت موقعیت با خطا مواجه شد یا اجازه مرورگر داده نشد.");
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
          "خطای محدودیت اتمیک: امکان افزودن دارو از داروخانه دیگر در یک سفارش وجود ندارد."
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

      setToastMessage(`داروی «${item.medicineNameFa}» به سبد خرید افزوده شد.`);
      setTimeout(() => setToastMessage(null), 3000);
    } catch {
      setToastMessage("خطا در افزودن به سبد خرید");
      setTimeout(() => setToastMessage(null), 3000);
    }
  };

  return (
    <div className="space-y-6">
      {toastMessage && (
        <div className="bg-teal-900 text-teal-100 px-4 py-3 rounded-2xl shadow-md border border-teal-700 text-xs font-bold transition-all">
          {toastMessage}
        </div>
      )}

      {/* Search Filter Controls Bar */}
      <div className="bg-white p-5 sm:p-6 rounded-2xl border border-slate-200/80 shadow-xs space-y-4">
        <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
          <div className="relative w-full md:w-1/2">
            <input
              type="text"
              placeholder="نام داروی فارسی، انگلیسی یا نام داروخانه..."
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              className="w-full pl-4 pr-10 py-3 rounded-xl border border-slate-200 focus:outline-none focus:ring-2 focus:ring-teal-700 focus:border-teal-700 text-xs font-medium text-slate-900 placeholder:text-slate-400 bg-slate-50/50"
            />
            <span className="absolute right-3.5 top-3.5 text-slate-400 text-sm">🔍</span>
          </div>

          <div className="flex flex-wrap items-center gap-3 w-full md:w-auto">
            <button
              onClick={handleRequestLocation}
              disabled={isLocating}
              className={`px-4 py-2.5 rounded-xl text-xs font-bold transition flex items-center gap-2 border ${
                coords
                  ? "bg-teal-50 text-teal-900 border-teal-200"
                  : "bg-slate-50 text-slate-700 border-slate-200 hover:bg-slate-100"
              }`}
            >
              <span>📍</span>
              <span>{isLocating ? "در حال دریافت..." : coords ? "موقعیت جغرافیایی فعال" : "موقعیت من"}</span>
            </button>

            <input
              type="text"
              placeholder="فیلتر شهر (مثلا: تهران)"
              value={city}
              onChange={(e) => setCity(e.target.value)}
              className="px-3.5 py-2.5 rounded-xl border border-slate-200 text-xs w-36 focus:ring-2 focus:ring-teal-700 focus:border-teal-700 text-slate-900 bg-slate-50/50"
            />
          </div>
        </div>

        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 pt-3 border-t border-slate-100 text-xs">
          <label className="inline-flex items-center cursor-pointer font-semibold text-slate-700">
            <input
              type="checkbox"
              checked={onlyInStock}
              onChange={(e) => setOnlyInStock(e.target.checked)}
              className="rounded text-teal-800 focus:ring-teal-700 h-4 w-4 ml-2 border-slate-300"
            />
            فقط داروهای موجود در انبار
          </label>

          <div className="flex items-center gap-2">
            <span className="text-slate-500 font-medium">مرتب‌سازی:</span>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as any)}
              className="px-3 py-1.5 rounded-lg border border-slate-200 bg-white text-xs font-bold text-slate-800 focus:ring-2 focus:ring-teal-700"
            >
              <option value="name">نام دارو</option>
              <option value="price">قیمت (کمتر به بیشتر)</option>
              {coords && <option value="distance">نزدیک‌ترین فاصله جغرافیایی</option>}
            </select>
          </div>
        </div>
      </div>

      {/* Results Inventory Grid */}
      {isLoading ? (
        <div className="bg-white p-12 text-center rounded-2xl border border-slate-200/80">
          <p className="text-slate-500 font-medium text-xs">در حال دريافت اطلاعات زنده انبار داروخانه‌ها...</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
          {items.map((item) => (
            <div
              key={item.inventoryId}
              className="daroomap-card p-5 flex flex-col justify-between space-y-4"
            >
              <div className="space-y-3">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="text-base font-extrabold text-slate-900">{item.medicineNameFa}</h3>
                    {item.medicineNameEn && (
                      <p className="text-[11px] text-slate-400 font-mono mt-0.5">{item.medicineNameEn}</p>
                    )}
                  </div>
                  {item.requiresRecipe ? (
                    <span className="bg-amber-50 text-amber-800 border border-amber-200/60 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                      نیازمند نسخه
                    </span>
                  ) : (
                    <span className="bg-teal-50 text-teal-800 border border-teal-200/60 text-[11px] px-2.5 py-0.5 rounded-full font-bold">
                      بدون نسخه
                    </span>
                  )}
                </div>

                <div className="pt-2 border-t border-slate-100 space-y-1">
                  <div className="flex justify-between items-center text-xs">
                    <Link
                      href={`/pharmacy/${item.pharmacyId}`}
                      className="font-bold text-teal-800 hover:underline"
                    >
                      🏥 {item.pharmacyName}
                    </Link>
                    {item.distanceKm !== undefined && (
                      <span className="bg-slate-100 text-slate-700 text-[10px] px-2 py-0.5 rounded-md font-extrabold">
                        📍 {item.distanceKm} کیلومتر
                      </span>
                    )}
                  </div>
                  <p className="text-[11px] text-slate-500 truncate">📍 {item.pharmacyAddress}</p>
                </div>
              </div>

              <div className="pt-3 border-t border-slate-100 flex items-center justify-between">
                <div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-slate-400">قیمت:</span>
                    <span className="text-base font-black text-slate-900">
                      {formatToman(item.priceToman)}
                    </span>
                  </div>
                  <span
                    className={`daroomap-badge text-[10px] mt-1 ${
                      item.freshnessStatus === "AVAILABLE"
                        ? "daroomap-badge-available"
                        : item.freshnessStatus === "STALE"
                        ? "daroomap-badge-stale"
                        : "daroomap-badge-unavailable"
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
                  className={`px-4 py-2 rounded-xl text-xs font-bold transition shadow-2xs ${
                    item.freshnessStatus !== "UNAVAILABLE" && item.stock > 0
                      ? "bg-teal-800 hover:bg-teal-900 text-white active:scale-95"
                      : "bg-slate-100 text-slate-400 cursor-not-allowed"
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
            <div className="col-span-full bg-white p-12 text-center rounded-2xl border border-slate-200/80">
              <p className="text-slate-500 font-medium text-xs">دارویی با این مشخصات در انبار داروخانه‌ها یافت نشد.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
