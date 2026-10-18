"use client";

import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/layout";
import { formatToman } from "@/lib/currency";
import { validateAndCalculateCart, CartItemInput } from "@/lib/order";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItemInput[]>([]);
  const [address, setAddress] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [orderError, setOrderError] = useState<string | null>(null);

  useEffect(() => {
    try {
      const cartStr = localStorage.getItem("daroomap_cart");
      if (cartStr) {
        const cart = JSON.parse(cartStr);
        setItems(cart.items || []);
      }
    } catch {
      setItems([]);
    }
  }, []);

  const cartValidation = validateAndCalculateCart(items);

  const handleQuantityChange = (inventoryId: string, newQty: number) => {
    if (newQty <= 0) {
      handleRemoveItem(inventoryId);
      return;
    }
    const updated = items.map((item: any) =>
      item.inventoryId === inventoryId ? { ...item, quantity: newQty } : item
    );
    setItems(updated);
    localStorage.setItem("daroomap_cart", JSON.stringify({ items: updated }));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleRemoveItem = (inventoryId: string) => {
    const updated = items.filter((item: any) => item.inventoryId !== inventoryId);
    setItems(updated);
    localStorage.setItem("daroomap_cart", JSON.stringify({ items: updated }));
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handleClearCart = () => {
    setItems([]);
    localStorage.removeItem("daroomap_cart");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  const handlePlaceOrder = () => {
    if (!cartValidation.isValid) {
      setOrderError(cartValidation.error || "خطا در بررسی سبد خرید");
      return;
    }

    if (!address.trim()) {
      setOrderError("لطفاً آدرس تحویل سفارش را وارد نمایید.");
      return;
    }

    setOrderPlaced(true);
    setOrderError(null);
    localStorage.removeItem("daroomap_cart");
    window.dispatchEvent(new Event("cartUpdated"));
  };

  return (
    <div className="min-h-screen flex flex-col bg-gray-50">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-black text-gray-900">تسویه حساب و ثبت سفارش</h1>

        {orderPlaced ? (
          <div className="bg-white p-8 rounded-3xl border border-emerald-100 text-center space-y-4 shadow-sm">
            <div className="w-16 h-16 bg-emerald-100 text-emerald-600 rounded-full flex items-center justify-center text-3xl mx-auto font-bold">
              ✓
            </div>
            <h2 className="text-2xl font-extrabold text-emerald-800">
              سفارش شما با موفقیت ثبت گردید!
            </h2>
            <p className="text-gray-600 text-sm">
              سفارش شما به داروخانه ارسال شد و پس از بررسی و آماده‌سازی، جهت تحویل پردازش خواهد شد.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-gray-100 space-y-4 shadow-sm">
            <p className="text-gray-500 font-medium">سبد خرید شما در حال حاضر خالی است.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {!cartValidation.isValid && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-sm font-semibold">
                  ⚠️ {cartValidation.error}
                </div>
              )}

              {orderError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-sm font-semibold">
                  ⚠️ {orderError}
                </div>
              )}

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-3">
                  <h2 className="font-bold text-gray-800">
                    داروهای انتخاب‌شده از داروخانه:{" "}
                    <span className="text-emerald-700">{cartValidation.pharmacyName}</span>
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-xs text-rose-600 hover:underline font-semibold"
                  >
                    پاک کردن سبد
                  </button>
                </div>

                <div className="divide-y divide-gray-100">
                  {items.map((item: any) => (
                    <div
                      key={item.inventoryId}
                      className="py-4 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-bold text-gray-900 text-sm">
                          {item.medicineNameFa}
                        </h3>
                        <p className="text-xs text-gray-500 mt-1">
                          قیمت واحد: {formatToman(item.unitPriceToman)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-gray-200 rounded-lg">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.inventoryId, item.quantity - 1)
                            }
                            className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 rounded-r-lg font-bold"
                          >
                            -
                          </button>
                          <span className="px-3 text-sm font-bold text-gray-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.inventoryId, item.quantity + 1)
                            }
                            className="px-2.5 py-1 text-gray-600 hover:bg-gray-100 rounded-l-lg font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.inventoryId)}
                          className="text-xs text-rose-500 hover:text-rose-700"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm space-y-3">
                <h2 className="font-bold text-gray-800 text-sm">آدرس تحویل سفارش</h2>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="آدرس دقیق تحویل گیرنده را وارد نمایید..."
                  className="w-full p-3 rounded-xl border border-gray-200 focus:ring-2 focus:ring-emerald-500 focus:border-transparent text-sm"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-gray-100 shadow-sm h-fit space-y-4">
              <h2 className="font-bold text-gray-900 border-b border-gray-100 pb-3">
                خلاصه فاکتور
              </h2>

              <div className="flex justify-between items-center text-sm text-gray-600">
                <span>تعداد اقلام:</span>
                <span className="font-bold text-gray-800">
                  {items.reduce((sum, item) => sum + item.quantity, 0)} عدد
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-gray-100 pt-3">
                <span className="font-bold text-gray-900">مبلغ قابل پرداخت:</span>
                <span className="text-lg font-black text-emerald-700">
                  {formatToman(cartValidation.totalToman)}
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!cartValidation.isValid}
                className={`w-full py-3 rounded-xl font-bold text-white transition shadow-md text-sm ${
                  cartValidation.isValid
                    ? "bg-emerald-600 hover:bg-emerald-700"
                    : "bg-gray-300 cursor-not-allowed"
                }`}
              >
                تایید و ثبت نهایی سفارش
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
