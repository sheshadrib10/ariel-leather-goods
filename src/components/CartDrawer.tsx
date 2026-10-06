"use client";

import React, { useState } from "react";
import { X, Trash2, ArrowRight, ShieldCheck, Gift, Check, CreditCard, Truck } from "lucide-react";
import { RankedProduct } from "@/lib/search-engine";

export interface CartItem {
  product: RankedProduct;
  quantity: number;
  monogram?: {
    text: string;
    foil: string;
  };
}

interface CartDrawerProps {
  isOpen: boolean;
  items: CartItem[];
  currency: "SGD" | "USD";
  onClose: () => void;
  onUpdateQuantity: (productId: number, qty: number) => void;
  onRemoveItem: (productId: number) => void;
}

export function CartDrawer({
  isOpen,
  items,
  currency,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
}: CartDrawerProps) {
  const [giftWrap, setGiftWrap] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [orderComplete, setOrderComplete] = useState(false);

  // Singapore Checkout Form
  const [shippingForm, setShippingForm] = useState({
    name: "Somnath B.",
    phone: "+65 9123 4567",
    postalCode: "248648",
    address: "24 Orchard Boulevard, #18-02",
    paymentMethod: "paynow",
  });

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    const unitPrice = currency === "SGD" ? item.product.price_sgd : item.product.price_usd;
    return acc + unitPrice * item.quantity;
  }, 0);

  const freeShippingThreshold = 150;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shipping = subtotal >= freeShippingThreshold ? 0 : 15;
  const total = subtotal + (items.length > 0 ? shipping : 0);

  const handlePlaceOrder = (e: React.FormEvent) => {
    e.preventDefault();
    setOrderComplete(true);
    setTimeout(() => {
      setOrderComplete(false);
      setIsCheckingOut(false);
      onClose();
    }, 3000);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-ariel-cream h-full shadow-2xl flex flex-col justify-between border-l border-ariel-tan/40 animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-5 border-b border-ariel-tan/20 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-ariel-espresso tracking-wide uppercase">
              {isCheckingOut ? "Bespoke Checkout" : "Shopping Bag"}
            </h3>
            <p className="text-xs text-ariel-saddle font-medium">
              {items.length} {items.length === 1 ? "creation" : "creations"} selected
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-ariel-espresso rounded-full hover:bg-ariel-sand transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Singapore Free Courier Progress */}
        {!isCheckingOut && items.length > 0 && (
          <div className="px-5 py-3 bg-ariel-sand/50 border-b border-ariel-tan/20 text-xs">
            <div className="flex items-center justify-between font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-ariel-cognac">
                <Truck className="w-3.5 h-3.5 text-ariel-amber" />
                Singapore White-Glove Courier
              </span>
              <span className="text-ariel-espresso">
                {amountToFreeShipping === 0 ? "Complimentary" : `Add S$${amountToFreeShipping}`}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-ariel-amber h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (subtotal / freeShippingThreshold) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {orderComplete ? (
            <div className="text-center py-20 space-y-4">
              <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-8 h-8" />
              </div>
              <h4 className="font-serif text-2xl font-bold text-ariel-espresso">Order Confirmed</h4>
              <p className="text-xs text-gray-600 max-w-xs mx-auto leading-relaxed">
                Thank you, Somnath. Your bespoke order has been assigned to our master craftsmen and courier dispatch in Singapore.
              </p>
              <div className="bg-white p-3 rounded-xl border border-gray-100 text-xs font-mono text-gray-500 max-w-xs mx-auto">
                Tracking: SG-EXP-992144
              </div>
            </div>
          ) : isCheckingOut ? (
            /* Checkout Form */
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-4 text-xs">
              <h4 className="font-bold text-ariel-espresso uppercase tracking-wider text-[11px] pb-1 border-b border-gray-200">
                Singapore Delivery Address
              </h4>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Recipient Name
                </label>
                <input
                  type="text"
                  required
                  value={shippingForm.name}
                  onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                  className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso"
                />
              </div>

              <div className="grid grid-cols-2 gap-2">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Mobile (+65)
                  </label>
                  <input
                    type="tel"
                    required
                    value={shippingForm.phone}
                    onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                    className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso"
                  />
                </div>
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Postal Code
                  </label>
                  <input
                    type="text"
                    required
                    value={shippingForm.postalCode}
                    onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                    className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Street & Unit Number
                </label>
                <input
                  type="text"
                  required
                  value={shippingForm.address}
                  onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                  className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso"
                />
              </div>

              <h4 className="font-bold text-ariel-espresso uppercase tracking-wider text-[11px] pt-3 pb-1 border-b border-gray-200">
                Payment Method (Singapore)
              </h4>

              <div className="grid grid-cols-3 gap-2">
                {[
                  { id: "paynow", label: "PayNow QR" },
                  { id: "card", label: "Credit Card" },
                  { id: "applepay", label: "Apple Pay" },
                ].map((pm) => (
                  <button
                    type="button"
                    key={pm.id}
                    onClick={() => setShippingForm({ ...shippingForm, paymentMethod: pm.id })}
                    className={`py-2 px-1 text-center font-bold text-[11px] rounded-xl border transition-all ${
                      shippingForm.paymentMethod === pm.id
                        ? "bg-ariel-espresso text-ariel-sand border-ariel-espresso shadow-xs"
                        : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    {pm.label}
                  </button>
                ))}
              </div>

              <button
                type="button"
                onClick={() => setIsCheckingOut(false)}
                className="text-xs text-ariel-saddle font-semibold hover:underline block pt-2"
              >
                &larr; Return to Shopping Bag
              </button>
            </form>
          ) : items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="font-serif text-base text-gray-600 mb-2">Your shopping bag is empty</p>
              <p className="text-xs">Explore our artisanal collection or ask our Atelier Concierge.</p>
            </div>
          ) : (
            /* Items List */
            items.map((item) => {
              const itemPrice = currency === "SGD" ? item.product.price_sgd : item.product.price_usd;
              return (
                <div
                  key={item.product.id}
                  className="bg-white p-3.5 rounded-2xl border border-ariel-tan/30 flex gap-3 shadow-xs"
                >
                  <img
                    src={item.product.image_url}
                    alt={item.product.title}
                    className="w-20 h-20 rounded-xl object-cover shrink-0"
                  />
                  <div className="flex-1 flex flex-col justify-between text-xs">
                    <div>
                      <div className="flex items-start justify-between">
                        <h4 className="font-bold text-ariel-espresso line-clamp-1">{item.product.title}</h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-gray-400 hover:text-red-500 transition-colors"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>
                      <p className="text-[11px] text-ariel-saddle">{item.product.leather_type}</p>
                      {item.monogram && (
                        <span className="inline-block mt-0.5 text-[10px] px-2 py-0.2 rounded bg-amber-50 text-amber-900 border border-amber-200 font-serif font-bold uppercase">
                          Monogram: {item.monogram.text} ({item.monogram.foil})
                        </span>
                      )}
                    </div>

                    <div className="flex items-center justify-between pt-2">
                      <div className="flex items-center border border-gray-200 rounded-lg">
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, Math.max(1, item.quantity - 1))}
                          className="px-2 py-0.5 text-gray-600 hover:bg-gray-100"
                        >
                          -
                        </button>
                        <span className="px-2 font-bold">{item.quantity}</span>
                        <button
                          onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                          className="px-2 py-0.5 text-gray-600 hover:bg-gray-100"
                        >
                          +
                        </button>
                      </div>
                      <span className="font-serif font-bold text-sm text-ariel-espresso">
                        {currency === "SGD" ? "S$" : "$"}{itemPrice * item.quantity}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })
          )}

          {/* Complimentary Gift Box option */}
          {!isCheckingOut && items.length > 0 && (
            <div className="bg-amber-50/70 border border-amber-200/80 p-3 rounded-xl flex items-center justify-between text-xs text-amber-900">
              <div className="flex items-center gap-2">
                <Gift className="w-4 h-4 text-amber-700" />
                <span>Complimentary Bespoke Gift Box & Ribbon</span>
              </div>
              <input
                type="checkbox"
                checked={giftWrap}
                onChange={(e) => setGiftWrap(e.target.checked)}
                className="rounded accent-ariel-amber"
              />
            </div>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && !orderComplete && (
          <div className="p-5 border-t border-ariel-tan/30 bg-white/70 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{currency === "SGD" ? "S$" : "$"}{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Singapore Express Courier</span>
                <span>{shipping === 0 ? "Complimentary" : `${currency === "SGD" ? "S$" : "$"}${shipping}`}</span>
              </div>
              <div className="flex justify-between text-sm font-serif font-bold text-ariel-espresso pt-2 border-t border-gray-100">
                <span>Estimated Total</span>
                <span>{currency === "SGD" ? "S$" : "$"}{total}</span>
              </div>
            </div>

            {isCheckingOut ? (
              <button
                type="submit"
                form="checkout-form"
                className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Authorize & Complete Order &bull; {currency === "SGD" ? "S$" : "$"}{total}</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            ) : (
              <button
                onClick={() => setIsCheckingOut(true)}
                className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand transition-all shadow-md flex items-center justify-center gap-2"
              >
                <span>Proceed to Checkout</span>
                <ArrowRight className="w-4 h-4" />
              </button>
            )}

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Complimentary 30-Day Returns &bull; Lifetime Craftsmanship Guarantee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
