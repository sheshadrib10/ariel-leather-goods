"use client";

import React, { useState, useEffect } from "react";
import {
  X,
  Trash2,
  ArrowRight,
  ShieldCheck,
  Gift,
  Check,
  CreditCard,
  Truck,
  QrCode,
  Tag,
  Building,
  Smartphone,
  Lock,
} from "lucide-react";
import { RankedProduct } from "@/lib/search-engine";
import { useAuth } from "@/lib/auth-context";
import { MedusaOrder } from "@/lib/medusa/types";

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
  onClearCart?: () => void;
}

export function CartDrawer({
  isOpen,
  items,
  currency,
  onClose,
  onUpdateQuantity,
  onRemoveItem,
  onClearCart,
}: CartDrawerProps) {
  const { currentUser, addOrderToAccount } = useAuth();
  const [giftWrap, setGiftWrap] = useState(true);
  const [isCheckingOut, setIsCheckingOut] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [confirmedOrder, setConfirmedOrder] = useState<MedusaOrder | null>(null);

  // Promo Code State
  const [promoCode, setPromoCode] = useState("");
  const [appliedDiscount, setAppliedDiscount] = useState<{
    code: string;
    type: "percentage" | "fixed";
    value: number;
    description: string;
  } | null>(null);
  const [discountError, setDiscountError] = useState("");

  // Singapore Delivery & Shipping Form
  const [shippingMethod, setShippingMethod] = useState<"courier" | "mbs_pickup" | "singpost">("courier");
  const [shippingForm, setShippingForm] = useState({
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    phone: currentUser?.phone || "+65 ",
    postalCode: currentUser?.postalCode || "",
    address: currentUser?.address || "",
    unitNumber: currentUser?.unitNumber || "",
    paymentMethod: "paynow" as "paynow" | "card" | "applepay",
  });

  // Credit Card Simulation state
  const [cardForm, setCardForm] = useState({
    cardNumber: "4532 •••• •••• 8821",
    expiry: "12/28",
    cvv: "888",
    nameOnCard: currentUser?.name || "VIP PATRON",
  });

  // PayNow state
  const [payNowConfirmed, setPayNowConfirmed] = useState(false);

  useEffect(() => {
    if (currentUser) {
      setShippingForm((prev) => ({
        ...prev,
        name: prev.name || currentUser.name,
        email: prev.email || currentUser.email,
        phone: prev.phone === "+65 " ? currentUser.phone : prev.phone,
        postalCode: prev.postalCode || currentUser.postalCode,
        address: prev.address || currentUser.address,
        unitNumber: prev.unitNumber || currentUser.unitNumber,
      }));
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const subtotal = items.reduce((acc, item) => {
    const unitPrice = currency === "SGD" ? item.product.price_sgd : item.product.price_usd;
    return acc + unitPrice * item.quantity;
  }, 0);

  // Calculate discounts
  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === "percentage") {
      discountAmount = Math.round((subtotal * appliedDiscount.value) / 100);
    } else {
      discountAmount = appliedDiscount.value;
    }
  }

  const freeShippingThreshold = 150;
  const amountToFreeShipping = Math.max(0, freeShippingThreshold - subtotal);
  const shippingFee =
    shippingMethod === "mbs_pickup" ? 0 : subtotal >= freeShippingThreshold || shippingMethod === "courier" ? 0 : 8;

  const finalTotal = Math.max(0, subtotal - discountAmount + (items.length > 0 ? shippingFee : 0));

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setDiscountError("");
    if (!promoCode.trim()) return;

    try {
      const res = await fetch("/api/medusa/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), subtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedDiscount(data.discount);
        setPromoCode("");
      } else {
        setDiscountError(data.message || "Invalid promotion code");
      }
    } catch {
      setDiscountError("Could not apply privilege code");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);

    try {
      const orderPayload = {
        email: shippingForm.email || "client@arielleather.com",
        cart_id: `cart_${Date.now()}`,
        shipping_address: {
          first_name: shippingForm.name.split(" ")[0] || "Ariel",
          last_name: shippingForm.name.split(" ").slice(1).join(" ") || "Client",
          address_1: `${shippingForm.address} ${shippingForm.unitNumber}`.trim(),
          city: "Singapore",
          postal_code: shippingForm.postalCode || "018956",
          country_code: "SG",
          phone: shippingForm.phone,
        },
        items: items.map((it) => ({
          id: `item_${it.product.id}`,
          title: it.product.title,
          quantity: it.quantity,
          unit_price: currency === "SGD" ? it.product.price_sgd : it.product.price_usd,
          total: (currency === "SGD" ? it.product.price_sgd : it.product.price_usd) * it.quantity,
          monogram: it.monogram,
        })),
        subtotal,
        shipping_total: shippingFee,
        discount_total: discountAmount,
        tax_total: Number((finalTotal * 0.09).toFixed(2)),
        total: finalTotal,
        currency_code: currency,
      };

      const res = await fetch("/api/medusa/orders", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(orderPayload),
      });

      const data = await res.json();
      if (data.order) {
        setConfirmedOrder(data.order);
        addOrderToAccount(data.order);
        if (onClearCart) onClearCart();
      }
    } catch (err) {
      console.error("Order placement failed:", err);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex justify-end bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="w-full max-w-lg bg-ariel-cream h-full shadow-2xl flex flex-col justify-between border-l border-ariel-tan/40 animate-slideLeft">
        {/* Drawer Header */}
        <div className="p-5 border-b border-ariel-tan/20 flex items-center justify-between">
          <div>
            <h3 className="font-serif text-lg font-bold text-ariel-espresso tracking-wide uppercase">
              {confirmedOrder ? "Order Confirmed" : isCheckingOut ? "Bespoke Checkout" : "Shopping Bag"}
            </h3>
            <p className="text-xs text-ariel-saddle font-medium">
              {confirmedOrder
                ? "Dispatched from Singapore Flagship Atelier"
                : `${items.length} ${items.length === 1 ? "creation" : "creations"} in your bag`}
            </p>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 text-gray-500 hover:text-ariel-espresso rounded-full hover:bg-ariel-sand transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Singapore Free Courier Progress (When not in checkout) */}
        {!isCheckingOut && !confirmedOrder && items.length > 0 && (
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

        {/* Main Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {confirmedOrder ? (
            /* ORDER CONFIRMATION VIEW */
            <div className="py-6 space-y-6 text-center">
              <div className="w-16 h-16 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-sm">
                <Check className="w-9 h-9" />
              </div>

              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-700 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full">
                  Payment Captured &bull; Commission Accepted
                </span>
                <h4 className="font-serif text-2xl font-bold text-ariel-espresso mt-3">
                  Thank You, {shippingForm.name.split(" ")[0]}
                </h4>
                <p className="text-xs text-gray-600 mt-1">
                  Your bespoke creation has entered final inspection and dispatch.
                </p>
              </div>

              <div className="bg-white p-4 rounded-2xl border border-ariel-tan/30 text-xs text-left space-y-2">
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-500">Order Reference</span>
                  <span className="font-mono text-ariel-espresso">#{confirmedOrder.display_id}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-500">Courier Tracking</span>
                  <span className="font-mono text-ariel-amber">{confirmedOrder.tracking_number}</span>
                </div>
                <div className="flex justify-between font-semibold">
                  <span className="text-gray-500">Delivery Address</span>
                  <span className="text-ariel-espresso text-right max-w-[200px] truncate">
                    {confirmedOrder.shipping_address.address_1}, Singapore
                  </span>
                </div>
                <div className="flex justify-between font-semibold pt-2 border-t border-gray-100">
                  <span className="text-gray-500">Total Charged</span>
                  <span className="font-serif font-bold text-ariel-espresso text-sm">
                    {currency === "SGD" ? "S$" : "$"}{confirmedOrder.total}
                  </span>
                </div>
              </div>

              <div className="p-3 bg-amber-50/60 border border-amber-200/60 rounded-xl text-[11px] text-amber-900 text-left">
                <p className="font-semibold mb-0.5">Singapore Dispatch Schedule:</p>
                <p className="text-gray-600">
                  White-glove delivery scheduled for today by 7:00 PM. A tracking SMS has been transmitted to {shippingForm.phone}.
                </p>
              </div>

              <button
                onClick={() => {
                  setConfirmedOrder(null);
                  setIsCheckingOut(false);
                  onClose();
                }}
                className="w-full py-3 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
              >
                Return to Atelier Collection
              </button>
            </div>
          ) : isCheckingOut ? (
            /* CHECKOUT FORM VIEW */
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-5 text-xs">
              {/* Delivery Details */}
              <div className="space-y-3">
                <h4 className="font-bold text-ariel-espresso uppercase tracking-wider text-[11px] pb-1 border-b border-ariel-tan/20">
                  1. Singapore Recipient & Delivery
                </h4>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingForm.name}
                      onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                      placeholder="e.g. Somnath B."
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                      placeholder="client@singapore.com"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Mobile (+65) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={shippingForm.phone}
                      onChange={(e) => setShippingForm({ ...shippingForm, phone: e.target.value })}
                      placeholder="+65 9123 4567"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Singapore Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={shippingForm.postalCode}
                      onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                      placeholder="248648"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                      placeholder="24 Orchard Boulevard"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={shippingForm.unitNumber}
                      onChange={(e) => setShippingForm({ ...shippingForm, unitNumber: e.target.value })}
                      placeholder="#18-02"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                </div>
              </div>

              {/* Shipping Method - EasyParcel Singapore */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-ariel-tan/20">
                  <h4 className="font-bold text-ariel-espresso uppercase tracking-wider text-[11px]">
                    2. EasyParcel Singapore Dispatch
                  </h4>
                  <span className="text-[10px] text-amber-800 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200">
                    EasyParcel Aggregated Logistics
                  </span>
                </div>

                <div className="grid grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setShippingMethod("courier")}
                    className={`p-2.5 rounded-xl border text-left text-[11px] transition-all ${
                      shippingMethod === "courier"
                        ? "bg-ariel-espresso text-ariel-sand border-ariel-espresso shadow-xs"
                        : "bg-white border-ariel-tan/30 text-gray-700"
                    }`}
                  >
                    <span className="font-bold block flex items-center gap-1">
                      <Truck className="w-3.5 h-3.5 text-ariel-amber" />
                      EasyParcel Same-Day
                    </span>
                    <span className="text-[10px] opacity-80">Lalamove White-Glove (S$0)</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingMethod("mbs_pickup")}
                    className={`p-2.5 rounded-xl border text-left text-[11px] transition-all ${
                      shippingMethod === "mbs_pickup"
                        ? "bg-ariel-espresso text-ariel-sand border-ariel-espresso shadow-xs"
                        : "bg-white border-ariel-tan/30 text-gray-700"
                    }`}
                  >
                    <span className="font-bold block flex items-center gap-1">
                      <Building className="w-3.5 h-3.5 text-ariel-amber" />
                      MBS Boutique Salon
                    </span>
                    <span className="text-[10px] opacity-80">Ready in 2h (#01-42)</span>
                  </button>
                </div>
              </div>

              {/* Payment Method - HitPay Singapore */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-ariel-tan/20">
                  <h4 className="font-bold text-ariel-espresso uppercase tracking-wider text-[11px]">
                    3. Singapore Payment
                  </h4>
                  <span className="text-[10px] text-emerald-800 bg-emerald-50 px-2 py-0.5 rounded font-semibold border border-emerald-200 flex items-center gap-1">
                    <ShieldCheck className="w-3 h-3 text-emerald-600" />
                    Powered by HitPay Singapore
                  </span>
                </div>

                <div className="grid grid-cols-3 gap-2">
                  <button
                    type="button"
                    onClick={() => setShippingForm({ ...shippingForm, paymentMethod: "paynow" })}
                    className={`py-2 px-1 text-center font-bold text-[11px] rounded-xl border transition-all flex flex-col items-center gap-1 ${
                      shippingForm.paymentMethod === "paynow"
                        ? "bg-ariel-espresso text-ariel-sand border-ariel-espresso shadow-xs"
                        : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    <QrCode className="w-4 h-4" />
                    <span>HitPay PayNow</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingForm({ ...shippingForm, paymentMethod: "card" })}
                    className={`py-2 px-1 text-center font-bold text-[11px] rounded-xl border transition-all flex flex-col items-center gap-1 ${
                      shippingForm.paymentMethod === "card"
                        ? "bg-ariel-espresso text-ariel-sand border-ariel-espresso shadow-xs"
                        : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    <CreditCard className="w-4 h-4" />
                    <span>HitPay Card</span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setShippingForm({ ...shippingForm, paymentMethod: "applepay" })}
                    className={`py-2 px-1 text-center font-bold text-[11px] rounded-xl border transition-all flex flex-col items-center gap-1 ${
                      shippingForm.paymentMethod === "applepay"
                        ? "bg-ariel-espresso text-ariel-sand border-ariel-espresso shadow-xs"
                        : "bg-white border-gray-200 text-gray-600"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Apple / GrabPay</span>
                  </button>
                </div>

                {/* PayNow Screen */}
                {shippingForm.paymentMethod === "paynow" && (
                  <div className="p-4 bg-white border border-ariel-tan/40 rounded-2xl text-center space-y-3">
                    <div className="inline-block p-2 bg-gray-50 border border-gray-200 rounded-xl">
                      <div className="w-36 h-36 bg-ariel-sand/30 border-2 border-ariel-espresso rounded-lg flex flex-col items-center justify-center p-2 mx-auto">
                        <QrCode className="w-16 h-16 text-ariel-espresso" />
                        <span className="text-[9px] font-mono font-bold text-ariel-espresso mt-1">
                          UEN: 202619482M
                        </span>
                        <span className="text-[8px] text-gray-500 font-sans">Ariel Leather Goods Pte Ltd</span>
                      </div>
                    </div>
                    <div className="text-[11px] text-gray-600 space-y-0.5">
                      <p className="font-semibold text-ariel-espresso">Scan with OCBC, DBS PayLah!, UOB, or GrabPay</p>
                      <p className="text-gray-500 font-mono">Amount: S${finalTotal}.00 &bull; Ref: SG-{Date.now().toString().slice(-6)}</p>
                    </div>
                    <label className="flex items-center justify-center gap-2 text-[11px] text-emerald-800 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payNowConfirmed}
                        onChange={(e) => setPayNowConfirmed(e.target.checked)}
                        className="rounded accent-emerald-600"
                      />
                      <span>I have scanned / simulated the PayNow transfer</span>
                    </label>
                  </div>
                )}

                {/* Credit Card Inputs */}
                {shippingForm.paymentMethod === "card" && (
                  <div className="p-4 bg-white border border-ariel-tan/40 rounded-2xl space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                        Card Number
                      </label>
                      <div className="relative">
                        <CreditCard className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                        <input
                          type="text"
                          value={cardForm.cardNumber}
                          onChange={(e) => setCardForm({ ...cardForm, cardNumber: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-xl pl-9 pr-3 py-2 font-mono text-xs"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-2">
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">Expiry</label>
                        <input
                          type="text"
                          value={cardForm.expiry}
                          onChange={(e) => setCardForm({ ...cardForm, expiry: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 font-mono text-xs"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">CVV</label>
                        <input
                          type="password"
                          maxLength={4}
                          value={cardForm.cvv}
                          onChange={(e) => setCardForm({ ...cardForm, cvv: e.target.value })}
                          className="w-full bg-white border border-gray-200 rounded-xl px-3 py-2 font-mono text-xs"
                        />
                      </div>
                    </div>
                  </div>
                )}

                {/* Apple Pay View */}
                {shippingForm.paymentMethod === "applepay" && (
                  <div className="p-4 bg-black text-white rounded-2xl text-center space-y-1">
                    <Smartphone className="w-6 h-6 mx-auto mb-1 text-white" />
                    <p className="font-bold text-xs">Touch ID / Face ID Enabled</p>
                    <p className="text-[10px] text-gray-400">Singapore card on file will be charged S${finalTotal}</p>
                  </div>
                )}
              </div>

              <button
                type="button"
                onClick={() => setIsCheckingOut(false)}
                className="text-xs text-ariel-saddle font-semibold hover:underline block pt-1"
              >
                &larr; Return to Shopping Bag
              </button>
            </form>
          ) : items.length === 0 ? (
            /* EMPTY BAG VIEW */
            <div className="text-center py-20 text-gray-400">
              <p className="font-serif text-base text-gray-600 mb-2">Your shopping bag is empty</p>
              <p className="text-xs">Explore our artisanal collection or consult our Atelier Concierge.</p>
            </div>
          ) : (
            /* BAG ITEMS VIEW */
            <>
              {items.map((item) => {
                const itemPrice = currency === "SGD" ? item.product.price_sgd : item.product.price_usd;
                return (
                  <div
                    key={item.product.id}
                    className="bg-white p-3.5 rounded-2xl border border-ariel-tan/30 flex gap-3 shadow-xs"
                  >
                    <img
                      src={item.product.image_url}
                      alt={item.product.title}
                      className="w-20 h-20 rounded-xl object-cover shrink-0 border border-ariel-tan/20"
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
                          <span className="inline-block mt-0.5 text-[10px] px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200 font-serif font-bold uppercase">
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
              })}

              {/* Promo Code Input */}
              <div className="bg-white p-3 rounded-2xl border border-ariel-tan/30 space-y-2">
                <form onSubmit={handleApplyPromo} className="flex gap-2">
                  <div className="relative flex-1">
                    <Tag className="w-3.5 h-3.5 text-gray-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={promoCode}
                      onChange={(e) => setPromoCode(e.target.value.toUpperCase())}
                      placeholder="Privilege code (e.g. ARIEL10)"
                      className="w-full bg-ariel-sand/30 border border-ariel-tan/40 rounded-xl pl-8 pr-3 py-1.5 text-xs text-ariel-espresso uppercase placeholder-gray-400 focus:outline-none"
                    />
                  </div>
                  <button
                    type="submit"
                    className="px-3 py-1.5 bg-ariel-espresso text-ariel-sand text-[11px] font-bold uppercase tracking-wider rounded-xl hover:bg-ariel-cognac transition-colors"
                  >
                    Apply
                  </button>
                </form>

                {appliedDiscount && (
                  <div className="text-[11px] text-emerald-800 flex items-center justify-between font-semibold pt-1">
                    <span>Privilege Applied: {appliedDiscount.description}</span>
                    <button
                      onClick={() => setAppliedDiscount(null)}
                      className="text-red-600 hover:underline text-[10px]"
                    >
                      Remove
                    </button>
                  </div>
                )}
                {discountError && <p className="text-[10px] text-red-600">{discountError}</p>}
              </div>

              {/* Complimentary Gift Box option */}
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
            </>
          )}
        </div>

        {/* Drawer Footer */}
        {items.length > 0 && !confirmedOrder && (
          <div className="p-5 border-t border-ariel-tan/30 bg-white/70 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Subtotal</span>
                <span>{currency === "SGD" ? "S$" : "$"}{subtotal}</span>
              </div>

              {appliedDiscount && (
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Privilege ({appliedDiscount.code})</span>
                  <span>-{currency === "SGD" ? "S$" : "$"}{discountAmount}</span>
                </div>
              )}

              <div className="flex justify-between text-gray-600">
                <span>Singapore Courier Delivery</span>
                <span>{shippingFee === 0 ? "Complimentary" : `${currency === "SGD" ? "S$" : "$"}${shippingFee}`}</span>
              </div>

              <div className="flex justify-between text-sm font-serif font-bold text-ariel-espresso pt-2 border-t border-gray-100">
                <span>Estimated Total (incl. 9% GST)</span>
                <span>{currency === "SGD" ? "S$" : "$"}{finalTotal}</span>
              </div>
            </div>

            {isCheckingOut ? (
              <button
                type="submit"
                form="checkout-form"
                disabled={isSubmitting}
                className="w-full py-4 rounded-xl font-bold text-xs uppercase tracking-wider bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand transition-all shadow-md flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {isSubmitting ? (
                  <div className="w-4 h-4 border-2 border-ariel-sand border-t-transparent rounded-full animate-spin" />
                ) : (
                  <>
                    <span>Confirm & Pay {currency === "SGD" ? "S$" : "$"}{finalTotal}</span>
                    <ArrowRight className="w-4 h-4" />
                  </>
                )}
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
