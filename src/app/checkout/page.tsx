"use client";

import { useEffect, useState } from "react";
import { Header, Footer } from "@/components/layout";
import { formatToman } from "@/lib/currency";
import { validateAndCalculateCart, CartItemInput } from "@/lib/order";
import { createOrderAction } from "@/lib/actions";

export default function CheckoutPage() {
  const [items, setItems] = useState<CartItemInput[]>([]);
  const [address, setAddress] = useState("");
  const [orderPlaced, setOrderPlaced] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
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

  const handlePlaceOrder = async () => {
    if (!cartValidation.isValid) {
      setOrderError(cartValidation.error || "خطا در بررسی سبد خرید");
      return;
    }

    if (!address.trim()) {
      setOrderError("لطفاً آدرس تحویل سفارش را وارد نمایید.");
      return;
    }

    setIsSubmitting(true);
    setOrderError(null);

    const result = await createOrderAction(items, address);

    setIsSubmitting(false);

    if (result.success) {
      setOrderPlaced(true);
      localStorage.removeItem("daroomap_cart");
      window.dispatchEvent(new Event("cartUpdated"));
    } else {
      setOrderError(result.error || "ثبت سفارش با خطا مواجه شد.");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-slate-50 text-slate-800 font-sans">
      <Header />
      <main className="flex-1 max-w-4xl w-full mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6">
        <h1 className="text-2xl font-black text-slate-900">تسویه حساب و ثبت سفارش تک‌داروخانه‌ای</h1>

        {orderPlaced ? (
          <div className="bg-white p-8 sm:p-10 rounded-3xl border border-teal-200/80 text-center space-y-4 shadow-xs">
            <div className="w-16 h-16 bg-teal-100 text-teal-800 rounded-full flex items-center justify-center text-3xl mx-auto font-black">
              ✓
            </div>
            <h2 className="text-2xl font-black text-teal-900">
              سفارش شما با موفقیت در دیتابیس ثبت گردید!
            </h2>
            <p className="text-slate-600 text-xs leading-relaxed max-w-lg mx-auto">
              سفارش شما به صورت اتمیک به داروخانه ارسال شد و پس از بررسی و آماده‌سازی، جهت تحویل پردازش خواهد شد.
            </p>
          </div>
        ) : items.length === 0 ? (
          <div className="bg-white p-12 text-center rounded-3xl border border-slate-200/80 space-y-3 shadow-xs">
            <p className="text-slate-500 font-medium text-xs">سبد خرید شما در حال حاضر خالی است.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 space-y-4">
              {!cartValidation.isValid && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 p-4 rounded-2xl text-xs font-bold">
                  ⚠️ {cartValidation.error}
                </div>
              )}

              {orderError && (
                <div className="bg-amber-50 border border-amber-200 text-amber-800 p-4 rounded-2xl text-xs font-bold">
                  ⚠️ {orderError}
                </div>
              )}

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-4">
                <div className="flex justify-between items-center border-b border-slate-100 pb-3">
                  <h2 className="font-bold text-slate-800 text-xs sm:text-sm">
                    داروخانه مبدأ:{" "}
                    <span className="text-teal-800 font-extrabold">{cartValidation.pharmacyName}</span>
                  </h2>
                  <button
                    onClick={handleClearCart}
                    className="text-xs text-rose-600 hover:underline font-bold"
                  >
                    پاک کردن سبد
                  </button>
                </div>

                <div className="divide-y divide-slate-100">
                  {items.map((item: any) => (
                    <div
                      key={item.inventoryId}
                      className="py-3.5 flex justify-between items-center"
                    >
                      <div>
                        <h3 className="font-bold text-slate-900 text-xs sm:text-sm">
                          {item.medicineNameFa}
                        </h3>
                        <p className="text-[11px] text-slate-500 mt-1">
                          قیمت واحد: {formatToman(item.unitPriceToman)}
                        </p>
                      </div>

                      <div className="flex items-center gap-3">
                        <div className="flex items-center border border-slate-200 rounded-lg">
                          <button
                            onClick={() =>
                              handleQuantityChange(item.inventoryId, item.quantity - 1)
                            }
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-r-lg font-bold"
                          >
                            -
                          </button>
                          <span className="px-3 text-xs font-bold text-slate-800">
                            {item.quantity}
                          </span>
                          <button
                            onClick={() =>
                              handleQuantityChange(item.inventoryId, item.quantity + 1)
                            }
                            className="px-2.5 py-1 text-slate-600 hover:bg-slate-100 rounded-l-lg font-bold"
                          >
                            +
                          </button>
                        </div>

                        <button
                          onClick={() => handleRemoveItem(item.inventoryId)}
                          className="text-xs text-rose-500 hover:text-rose-700 font-medium"
                        >
                          حذف
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs space-y-3">
                <h2 className="font-bold text-slate-900 text-xs sm:text-sm">آدرس دقیق تحویل سفارش</h2>
                <textarea
                  rows={3}
                  value={address}
                  onChange={(e) => setAddress(e.target.value)}
                  placeholder="آدرس کامل تحویل‌گیرنده را وارد نمایید..."
                  className="w-full p-3 rounded-xl border border-slate-200 focus:ring-2 focus:ring-teal-700 text-xs font-medium text-slate-900"
                />
              </div>
            </div>

            <div className="bg-white p-6 rounded-3xl border border-slate-200/80 shadow-xs h-fit space-y-4">
              <h2 className="font-black text-slate-900 border-b border-slate-100 pb-3 text-sm">
                خلاصه فاکتور
              </h2>

              <div className="flex justify-between items-center text-xs text-slate-600">
                <span>تعداد اقلام:</span>
                <span className="font-bold text-slate-800">
                  {items.reduce((sum, item) => sum + item.quantity, 0)} عدد
                </span>
              </div>

              <div className="flex justify-between items-center border-t border-slate-100 pt-3">
                <span className="font-bold text-slate-900 text-xs">مبلغ قابل پرداخت به تومان:</span>
                <span className="text-base font-black text-teal-800">
                  {formatToman(cartValidation.totalToman)}
                </span>
              </div>

              <button
                onClick={handlePlaceOrder}
                disabled={!cartValidation.isValid || isSubmitting}
                className={`w-full py-3 rounded-xl font-bold text-white transition shadow-2xs text-xs ${
                  cartValidation.isValid && !isSubmitting
                    ? "bg-teal-800 hover:bg-teal-900 active:scale-98"
                    : "bg-slate-200 text-slate-400 cursor-not-allowed"
                }`}
              >
                {isSubmitting ? "در حال ثبت سفارش..." : "تایید و ثبت نهایی سفارش"}
              </button>
            </div>
          </div>
        )}
      </main>
      <Footer />
    </div>
  );
}
