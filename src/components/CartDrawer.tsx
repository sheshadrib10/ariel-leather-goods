"use client";

import React, { useState } from "react";
import { X, Trash2, ArrowRight, ShieldCheck, Gift } from "lucide-react";
import { RankedProduct } from "@/lib/search-engine";

export interface CartItem {
  product: RankedProduct;
  quantity: number;
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
  const [checkedOut, setCheckedOut] = useState(false);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    const unitPrice = currency === "SGD" ? item.product.price_sgd : item.product.price_usd;
    return acc + unitPrice * item.quantity;
  }, 0);

  const shipping = subtotal > 150 ? 0 : 15;
  const total = subtotal + (items.length > 0 ? shipping : 0);

  const handleCheckout = () => {
    setCheckedOut(true);
    setTimeout(() => {
      setCheckedOut(false);
      onClose();
    }, 2500);
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/50 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-md bg-ariel-cream h-full shadow-2xl flex flex-col justify-between border-l border-ariel-tan/40 animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-5 border-b border-ariel-tan/20 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-ariel-espresso tracking-wide uppercase">
              Shopping Bag
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

        {/* Items List */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {items.length === 0 ? (
            <div className="text-center py-16 text-gray-400">
              <p className="font-serif text-base text-gray-600 mb-2">Your shopping bag is empty</p>
              <p className="text-xs">Explore our artisanal collection or use Bedrock semantic search to find the ideal piece.</p>
            </div>
          ) : (
            items.map((item) => {
              const itemPrice = currency === "SGD" ? item.product.price_sgd : item.product.price_usd;
              return (
                <div
                  key={item.product.id}
                  className="bg-white p-3.5 rounded-2xl border border-ariel-tan/30 flex gap-3 shadow-sm"
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
          {items.length > 0 && (
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

        {/* Drawer Footer / Checkout */}
        {items.length > 0 && (
          <div className="p-5 border-t border-ariel-tan/30 bg-white/70 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{currency === "SGD" ? "S$" : "$"}{subtotal}</span>
              </div>
              <div className="flex justify-between text-gray-600">
                <span>Express Insured Shipping</span>
                <span>{shipping === 0 ? "Complimentary" : `${currency === "SGD" ? "S$" : "$"}${shipping}`}</span>
              </div>
              <div className="flex justify-between text-sm font-serif font-bold text-ariel-espresso pt-2 border-t border-gray-100">
                <span>Estimated Total</span>
                <span>{currency === "SGD" ? "S$" : "$"}{total}</span>
              </div>
            </div>

            <button
              onClick={handleCheckout}
              disabled={checkedOut}
              className={`w-full py-3.5 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                checkedOut
                  ? "bg-emerald-600 text-white"
                  : "bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand"
              }`}
            >
              {checkedOut ? (
                <span>Order Placed! Thank you for choosing Ariel.</span>
              ) : (
                <>
                  <span>Proceed to Checkout</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>

            <div className="flex items-center justify-center gap-2 text-[10px] text-gray-400">
              <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
              <span>Complimentary 30-Day Returns • Lifetime Craftsmanship Guarantee</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
