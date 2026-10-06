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
  Printer,
  FileText,
  Clock,
  Info,
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

  // Singapore EasyParcel Delivery Tiers
  // courier_whiteglove = Lalamove Same-Day 4hr (S$15 standard, free over S$150)
  // courier_express = Ninja Van / J&T Express 1-2 days (S$6 standard, free over S$150)
  // singpost_registered = SingPost 2-3 days (S$4 standard, free over S$150)
  // mbs_pickup = Marina Bay Sands Boutique Salon (#01-42) (S$0 always)
  const [shippingTier, setShippingTier] = useState<
    "courier_whiteglove" | "courier_express" | "singpost_registered" | "mbs_pickup"
  >("courier_whiteglove");

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

  const rawSubtotal = items.reduce((acc, item) => {
    const unitPrice = currency === "SGD" ? item.product.price_sgd : item.product.price_usd;
    return acc + unitPrice * item.quantity;
  }, 0);

  // Calculate discounts
  let discountAmount = 0;
  if (appliedDiscount) {
    if (appliedDiscount.type === "percentage") {
      discountAmount = Math.round((rawSubtotal * appliedDiscount.value) / 100);
    } else {
      discountAmount = appliedDiscount.value;
    }
  }

  const discountedItemsTotal = Math.max(0, rawSubtotal - discountAmount);

  // Singapore Free Delivery Threshold (S$150)
  const freeDeliveryThreshold = 150;
  const isComplimentaryDelivery = discountedItemsTotal >= freeDeliveryThreshold;
  const amountToFreeDelivery = Math.max(0, freeDeliveryThreshold - discountedItemsTotal);

  // Standard shipping fee table (in SGD)
  const deliveryRates: Record<typeof shippingTier, number> = {
    courier_whiteglove: 15,
    courier_express: 6,
    singpost_registered: 4,
    mbs_pickup: 0,
  };

  const deliveryFee =
    shippingTier === "mbs_pickup" ? 0 : isComplimentaryDelivery ? 0 : deliveryRates[shippingTier];

  // Total payable in selected currency
  const totalPayable = discountedItemsTotal + (items.length > 0 ? deliveryFee : 0);

  // Singapore 9% IRAS GST Itemization (Statutory standard rate)
  // Singapore retail prices to consumers are GST-inclusive:
  // Taxable Base = Total / 1.09, GST (9%) = Total - Taxable Base
  const gstRate = 0.09;
  const taxableBase = totalPayable / (1 + gstRate);
  const gstAmount = totalPayable - taxableBase;

  const handleApplyPromo = async (e: React.FormEvent) => {
    e.preventDefault();
    setDiscountError("");
    if (!promoCode.trim()) return;

    try {
      const res = await fetch("/api/medusa/discounts", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ code: promoCode.trim(), subtotal: rawSubtotal }),
      });
      const data = await res.json();
      if (data.valid) {
        setAppliedDiscount({
          code: data.discount.code,
          type: data.discount.type,
          value: data.discount.value,
          description: data.discount.description,
        });
        setPromoCode("");
      } else {
        setDiscountError(data.message || "Invalid privilege code.");
      }
    } catch {
      setDiscountError("Could not validate privilege code.");
    }
  };

  const handlePlaceOrder = async (e: React.FormEvent) => {
    e.preventDefault();
    if (shippingForm.paymentMethod === "paynow" && !payNowConfirmed) {
      alert("Please confirm the PayNow SGQR payment verification checkbox before completing checkout.");
      return;
    }

    setIsSubmitting(true);
    try {
      const courierName =
        shippingTier === "courier_whiteglove"
          ? "EasyParcel White-Glove (Lalamove Same-Day)"
          : shippingTier === "courier_express"
          ? "EasyParcel Express (Ninja Van / J&T)"
          : shippingTier === "singpost_registered"
          ? "SingPost Registered"
          : "MBS Boutique Salon Pickup (#01-42)";

      const hitpayProvider =
        shippingForm.paymentMethod === "paynow"
          ? "hitpay_paynow"
          : shippingForm.paymentMethod === "card"
          ? "hitpay_card"
          : "hitpay_applepay";

      const orderPayload = {
        cart_id: `cart_${Date.now()}`,
        email: shippingForm.email || currentUser?.email || "patron@arielleather.com",
        currency_code: currency,
        subtotal: rawSubtotal,
        discount_total: discountAmount,
        shipping_total: deliveryFee,
        tax_total: Number(gstAmount.toFixed(2)),
        total: totalPayable,
        shipping_address: {
          first_name: shippingForm.name.split(" ")[0] || "Valued",
          last_name: shippingForm.name.split(" ").slice(1).join(" ") || "Patron",
          phone: shippingForm.phone,
          address_1:
            shippingTier === "mbs_pickup"
              ? "Marina Bay Sands Boutique Salon, 10 Bayfront Ave, #01-42"
              : `${shippingForm.address}${shippingForm.unitNumber ? ` ${shippingForm.unitNumber}` : ""}`,
          postal_code: shippingTier === "mbs_pickup" ? "018956" : shippingForm.postalCode,
          city: "Singapore",
          country_code: "SG",
        },
        items: items.map((i, idx) => ({
          id: `item_${idx}_${Date.now()}`,
          product_id: i.product.id,
          title: i.product.title,
          variant_title: `${i.product.colour} / ${i.product.leather_type}`,
          thumbnail: i.product.image_url,
          unit_price: currency === "SGD" ? i.product.price_sgd : i.product.price_usd,
          quantity: i.quantity,
          total: (currency === "SGD" ? i.product.price_sgd : i.product.price_usd) * i.quantity,
          metadata: {
            monogram_text: i.monogram?.text,
            monogram_foil: i.monogram?.foil,
            gift_packaging: giftWrap,
          },
        })),
        shipping_tier: shippingTier,
        courier_name: courierName,
        payment_method: hitpayProvider,
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
              {confirmedOrder ? "Tax Invoice & Confirmation" : isCheckingOut ? "Bespoke Singapore Checkout" : "Shopping Bag"}
            </h3>
            <p className="text-xs text-ariel-saddle font-medium">
              {confirmedOrder
                ? "IRAS Registered • Ariel Leather Goods Pte Ltd (UEN: 202619482M)"
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

        {/* Singapore Free Courier Progress (When not in checkout & not confirmed) */}
        {!isCheckingOut && !confirmedOrder && items.length > 0 && (
          <div className="px-5 py-3 bg-ariel-sand/50 border-b border-ariel-tan/20 text-xs">
            <div className="flex items-center justify-between font-semibold mb-1">
              <span className="flex items-center gap-1.5 text-ariel-cognac">
                <Truck className="w-3.5 h-3.5 text-ariel-amber" />
                Singapore White-Glove Courier Delivery
              </span>
              <span className="text-ariel-espresso">
                {isComplimentaryDelivery ? (
                  <span className="text-emerald-800 font-bold">Complimentary (S$150+ unlocked)</span>
                ) : (
                  <span>Add S${amountToFreeDelivery} for Free Delivery</span>
                )}
              </span>
            </div>
            <div className="w-full bg-gray-200 h-1.5 rounded-full overflow-hidden">
              <div
                className="bg-ariel-amber h-full transition-all duration-500 rounded-full"
                style={{ width: `${Math.min(100, (discountedItemsTotal / freeDeliveryThreshold) * 100)}%` }}
              />
            </div>
          </div>
        )}

        {/* Main Content Area */}
        <div className="p-5 overflow-y-auto flex-1 space-y-4">
          {confirmedOrder ? (
            /* OFFICIAL SINGAPORE TAX INVOICE & ORDER CONFIRMATION */
            <div className="py-2 space-y-5 text-left text-xs">
              <div className="text-center pb-3 border-b border-gray-200">
                <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto mb-2 shadow-xs">
                  <Check className="w-8 h-8" />
                </div>
                <h4 className="font-serif text-xl font-bold text-ariel-espresso">Commission Confirmed</h4>
                <p className="text-[11px] text-gray-500">
                  Official Singapore Tax Invoice generated &bull; Payment Captured via HitPay
                </p>
              </div>

              {/* Tax Invoice Box */}
              <div className="bg-white p-5 rounded-2xl border border-ariel-tan/40 shadow-xs space-y-4">
                <div className="flex justify-between items-start pb-3 border-b border-gray-100">
                  <div>
                    <span className="font-serif text-sm font-bold text-ariel-espresso tracking-wider uppercase block">
                      ARIEL LEATHER GOODS PTE LTD
                    </span>
                    <span className="text-[10px] text-gray-500 block">Marina Bay Sands #01-42, Singapore 018956</span>
                    <span className="text-[10px] text-gray-500 font-mono block">
                      UEN: 202619482M &bull; GST Reg: M90382710X
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-[9px] uppercase font-bold tracking-widest px-2 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200">
                      TAX INVOICE
                    </span>
                    <span className="block font-mono text-xs font-bold text-ariel-espresso mt-1">
                      #{confirmedOrder.display_id}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      {new Date(confirmedOrder.created_at).toLocaleDateString("en-SG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Dispatch & Delivery Details */}
                <div className="grid grid-cols-2 gap-3 text-[11px] py-1">
                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Patron & Address</span>
                    <span className="font-semibold text-gray-800 block">
                      {confirmedOrder.shipping_address.first_name} {confirmedOrder.shipping_address.last_name}
                    </span>
                    <span className="text-gray-600 block">{confirmedOrder.shipping_address.address_1}</span>
                    <span className="text-gray-500 block">{confirmedOrder.shipping_address.phone}</span>
                  </div>

                  <div>
                    <span className="text-[10px] uppercase font-bold text-gray-400 block">Logistics & Courier</span>
                    <span className="font-semibold text-ariel-espresso block">
                      {confirmedOrder.easyparcel_courier || "EasyParcel Dispatch"}
                    </span>
                    <span className="font-mono text-emerald-700 block">
                      AWB: {confirmedOrder.easyparcel_awb || confirmedOrder.tracking_number}
                    </span>
                    <span className="text-[10px] text-gray-400 block">
                      HitPay Ref: {confirmedOrder.hitpay_reference || "HITPAY-SG-LIVE"}
                    </span>
                  </div>
                </div>

                {/* Line Items Table */}
                <div className="pt-2 border-t border-gray-100">
                  <table className="w-full text-[11px]">
                    <thead>
                      <tr className="text-[9px] uppercase tracking-wider text-gray-400 border-b border-gray-100 pb-1">
                        <th className="text-left font-semibold py-1">Creation</th>
                        <th className="text-center font-semibold py-1">Qty</th>
                        <th className="text-right font-semibold py-1">Amount</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-gray-50">
                      {confirmedOrder.items.map((item, idx) => (
                        <tr key={idx} className="py-1.5">
                          <td className="py-1.5 pr-2">
                            <span className="font-semibold text-gray-800 block">{item.title}</span>
                            {item.metadata?.monogram_text && (
                              <span className="text-[9px] text-amber-700 font-mono">
                                Monogram: [{item.metadata.monogram_text}] ({item.metadata.monogram_foil} foil)
                              </span>
                            )}
                          </td>
                          <td className="py-1.5 text-center text-gray-600">{item.quantity}</td>
                          <td className="py-1.5 text-right font-mono font-medium text-gray-800">
                            S${item.total.toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>

                {/* Statutory Tax & Delivery Itemization */}
                <div className="pt-3 border-t border-gray-200 space-y-1.5 text-[11px]">
                  <div className="flex justify-between text-gray-600">
                    <span>Taxable Items Subtotal (Net pre-tax)</span>
                    <span className="font-mono">S${(taxableBase - (deliveryFee / 1.09)).toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-gray-600">
                    <span>EasyParcel Dispatch / Delivery</span>
                    <span className="font-mono font-semibold">
                      {confirmedOrder.shipping_total === 0 ? "Complimentary (S$0.00)" : `S$${confirmedOrder.shipping_total.toFixed(2)}`}
                    </span>
                  </div>

                  <div className="flex justify-between text-emerald-800 font-medium bg-emerald-50/70 p-1.5 rounded-lg">
                    <span>Singapore 9% IRAS GST (Reg: 202619482M)</span>
                    <span className="font-mono font-bold">S${gstAmount.toFixed(2)}</span>
                  </div>

                  <div className="flex justify-between text-sm font-serif font-bold text-ariel-espresso pt-2 border-t border-gray-200">
                    <span>Total Amount Paid (SGD)</span>
                    <span className="font-mono">S${confirmedOrder.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-2">
                <button
                  type="button"
                  onClick={() => window.print()}
                  className="flex-1 py-2.5 rounded-xl border border-gray-300 bg-white hover:bg-gray-50 text-gray-700 font-bold uppercase tracking-wider text-[11px] flex items-center justify-center gap-1.5 shadow-xs transition-colors"
                >
                  <Printer className="w-3.5 h-3.5 text-gray-500" />
                  <span>Print Tax Invoice</span>
                </button>

                <button
                  type="button"
                  onClick={() => {
                    setConfirmedOrder(null);
                    setIsCheckingOut(false);
                    onClose();
                  }}
                  className="flex-1 py-2.5 rounded-xl bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand font-bold uppercase tracking-wider text-[11px] text-center shadow-xs transition-colors"
                >
                  <span>Return to Atelier</span>
                </button>
              </div>
            </div>
          ) : isCheckingOut ? (
            /* BESPOKE CHECKOUT FORM */
            <form id="checkout-form" onSubmit={handlePlaceOrder} className="space-y-5 text-xs">
              {/* Delivery Address Section */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-ariel-tan/20">
                  <h4 className="font-bold text-ariel-espresso uppercase tracking-wider text-[11px]">
                    1. Singapore Delivery Destination
                  </h4>
                  <span className="text-[10px] text-gray-500">Singapore Residential & Office</span>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Recipient Name *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingForm.name}
                      onChange={(e) => setShippingForm({ ...shippingForm, name: e.target.value })}
                      placeholder="e.g. Alexander Tan"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={shippingForm.email}
                      onChange={(e) => setShippingForm({ ...shippingForm, email: e.target.value })}
                      placeholder="alexander@atelier.sg"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Singapore Mobile (+65) *
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
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      6-Digit Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={shippingForm.postalCode}
                      onChange={(e) => setShippingForm({ ...shippingForm, postalCode: e.target.value })}
                      placeholder="018980"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Street Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={shippingForm.address}
                      onChange={(e) => setShippingForm({ ...shippingForm, address: e.target.value })}
                      placeholder="18 Marina Boulevard"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                  <div>
                    <label className="block text-[10px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Unit
                    </label>
                    <input
                      type="text"
                      value={shippingForm.unitNumber}
                      onChange={(e) => setShippingForm({ ...shippingForm, unitNumber: e.target.value })}
                      placeholder="#22-08"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                </div>
              </div>

              {/* EasyParcel Singapore Delivery Tiers Selection */}
              <div className="space-y-2">
                <div className="flex items-center justify-between pb-1 border-b border-ariel-tan/20">
                  <h4 className="font-bold text-ariel-espresso uppercase tracking-wider text-[11px]">
                    2. EasyParcel Logistics & Delivery Option
                  </h4>
                  <span className="text-[10px] text-amber-900 bg-amber-50 px-2 py-0.5 rounded font-semibold border border-amber-200">
                    Live Rates
                  </span>
                </div>

                <div className="space-y-2">
                  {/* Tier 1: Lalamove Same Day */}
                  <label
                    onClick={() => setShippingTier("courier_whiteglove")}
                    className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      shippingTier === "courier_whiteglove"
                        ? "bg-ariel-espresso text-ariel-sand border-ariel-espresso shadow-xs"
                        : "bg-white border-ariel-tan/30 text-gray-700 hover:border-ariel-amber"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Truck className="w-4 h-4 text-ariel-amber shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs block">EasyParcel White-Glove (Lalamove Same-Day)</span>
                        <span className="text-[10px] opacity-80 block">
                          Direct 4-hour door-to-door temperature-controlled courier across Singapore
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-bold text-xs">
                        {isComplimentaryDelivery ? (
                          <span className="text-emerald-400 font-bold uppercase text-[10px]">Free</span>
                        ) : (
                          "S$15.00"
                        )}
                      </span>
                    </div>
                  </label>

                  {/* Tier 2: Ninja Van / J&T Express */}
                  <label
                    onClick={() => setShippingTier("courier_express")}
                    className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      shippingTier === "courier_express"
                        ? "bg-ariel-espresso text-ariel-sand border-ariel-espresso shadow-xs"
                        : "bg-white border-ariel-tan/30 text-gray-700 hover:border-ariel-amber"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Truck className="w-4 h-4 text-ariel-amber shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs block">EasyParcel Express (Ninja Van / J&T)</span>
                        <span className="text-[10px] opacity-80 block">
                          Next-business-day tracked courier dispatch
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-bold text-xs">
                        {isComplimentaryDelivery ? (
                          <span className="text-emerald-400 font-bold uppercase text-[10px]">Free</span>
                        ) : (
                          "S$6.00"
                        )}
                      </span>
                    </div>
                  </label>

                  {/* Tier 3: SingPost Registered */}
                  <label
                    onClick={() => setShippingTier("singpost_registered")}
                    className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      shippingTier === "singpost_registered"
                        ? "bg-ariel-espresso text-ariel-sand border-ariel-espresso shadow-xs"
                        : "bg-white border-ariel-tan/30 text-gray-700 hover:border-ariel-amber"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <FileText className="w-4 h-4 text-ariel-amber shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs block">SingPost Registered Parcel</span>
                        <span className="text-[10px] opacity-80 block">2-3 working days standard tracked</span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="font-bold text-xs">
                        {isComplimentaryDelivery ? (
                          <span className="text-emerald-400 font-bold uppercase text-[10px]">Free</span>
                        ) : (
                          "S$4.00"
                        )}
                      </span>
                    </div>
                  </label>

                  {/* Tier 4: MBS Boutique Pickup */}
                  <label
                    onClick={() => setShippingTier("mbs_pickup")}
                    className={`flex items-start justify-between p-3 rounded-xl border cursor-pointer transition-all ${
                      shippingTier === "mbs_pickup"
                        ? "bg-ariel-espresso text-ariel-sand border-ariel-espresso shadow-xs"
                        : "bg-white border-ariel-tan/30 text-gray-700 hover:border-ariel-amber"
                    }`}
                  >
                    <div className="flex items-start gap-2.5">
                      <Building className="w-4 h-4 text-ariel-amber shrink-0 mt-0.5" />
                      <div>
                        <span className="font-bold text-xs block">Marina Bay Sands Boutique Salon Pickup</span>
                        <span className="text-[10px] opacity-80 block">
                          Collect in person at The Shoppes at MBS #01-42 (Ready in 2h)
                        </span>
                      </div>
                    </div>
                    <div className="text-right shrink-0 ml-2">
                      <span className="text-emerald-600 font-bold uppercase text-[10px]">Free</span>
                    </div>
                  </label>
                </div>
              </div>

              {/* Payment Method - HitPay Singapore */}
              <div className="space-y-3">
                <div className="flex items-center justify-between pb-1 border-b border-ariel-tan/20">
                  <h4 className="font-bold text-ariel-espresso uppercase tracking-wider text-[11px]">
                    3. Singapore Payment Gateway
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
                        : "bg-white border-gray-200 text-gray-600 hover:border-ariel-amber"
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
                        : "bg-white border-gray-200 text-gray-600 hover:border-ariel-amber"
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
                        : "bg-white border-gray-200 text-gray-600 hover:border-ariel-amber"
                    }`}
                  >
                    <Smartphone className="w-4 h-4" />
                    <span>Apple / GrabPay</span>
                  </button>
                </div>

                {/* HitPay PayNow SGQR Screen */}
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
                      <p className="text-gray-500 font-mono">
                        Amount: S${totalPayable.toFixed(2)} (incl. 9% GST) &bull; Ref: SG-{Date.now().toString().slice(-6)}
                      </p>
                    </div>
                    <label className="flex items-center justify-center gap-2 text-[11px] text-emerald-800 font-medium cursor-pointer">
                      <input
                        type="checkbox"
                        checked={payNowConfirmed}
                        onChange={(e) => setPayNowConfirmed(e.target.checked)}
                        className="rounded accent-emerald-600"
                      />
                      <span>I confirm I have scanned the PayNow transfer in Singapore</span>
                    </label>
                  </div>
                )}

                {/* HitPay Credit Card Screen */}
                {shippingForm.paymentMethod === "card" && (
                  <div className="p-4 bg-white border border-ariel-tan/40 rounded-2xl space-y-3">
                    <div>
                      <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">
                        Card Number (Visa / Mastercard / Amex)
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
                        <label className="block text-[10px] font-bold text-gray-600 uppercase mb-1">CVV / CVV2</label>
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

                {/* Apple Pay Screen */}
                {shippingForm.paymentMethod === "applepay" && (
                  <div className="p-4 bg-black text-white rounded-2xl text-center space-y-1">
                    <Smartphone className="w-6 h-6 mx-auto mb-1 text-white" />
                    <p className="font-bold text-xs">Touch ID / Face ID Enabled via HitPay</p>
                    <p className="text-[10px] text-gray-400">
                      Singapore card will be charged S${totalPayable.toFixed(2)} (incl. 9% GST)
                    </p>
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
              <div className="space-y-3">
                {items.map((item) => (
                  <div
                    key={item.product.id}
                    className="p-3 bg-white rounded-2xl border border-ariel-tan/30 flex gap-3 items-center shadow-2xs"
                  >
                    <img
                      src={item.product.image_url}
                      alt={item.product.title}
                      className="w-16 h-16 object-cover rounded-xl border border-gray-100 shrink-0"
                    />

                    <div className="flex-1 min-w-0">
                      <div className="flex justify-between items-start">
                        <h4 className="font-serif text-sm font-bold text-ariel-espresso truncate">
                          {item.product.title}
                        </h4>
                        <button
                          onClick={() => onRemoveItem(item.product.id)}
                          className="text-gray-400 hover:text-red-600 transition-colors p-1"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                        </button>
                      </div>

                      <p className="text-[11px] text-gray-500 truncate">
                        {item.product.colour} &bull; {item.product.leather_type}
                      </p>

                      {item.monogram && (
                        <span className="inline-block text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200/60 px-1.5 py-0.5 rounded mt-0.5">
                          Monogram: [{item.monogram.text}] ({item.monogram.foil})
                        </span>
                      )}

                      <div className="flex justify-between items-center mt-2">
                        <div className="flex items-center border border-gray-200 rounded-lg overflow-hidden bg-gray-50">
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity - 1)}
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200"
                          >
                            -
                          </button>
                          <span className="px-2 text-xs font-semibold">{item.quantity}</span>
                          <button
                            onClick={() => onUpdateQuantity(item.product.id, item.quantity + 1)}
                            className="px-2 py-0.5 text-xs text-gray-600 hover:bg-gray-200"
                          >
                            +
                          </button>
                        </div>

                        <span className="font-serif font-bold text-sm text-ariel-espresso">
                          {currency === "SGD" ? "S$" : "$"}
                          {(currency === "SGD" ? item.product.price_sgd : item.product.price_usd) * item.quantity}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>

              {/* Privilege Code Input */}
              <div className="bg-white p-3.5 rounded-2xl border border-ariel-tan/30 space-y-2">
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

        {/* Drawer Footer with Prominent Singapore Tax & Delivery Itemization */}
        {items.length > 0 && !confirmedOrder && (
          <div className="p-5 border-t border-ariel-tan/30 bg-white/95 space-y-3">
            <div className="space-y-1.5 text-xs">
              <div className="flex justify-between text-gray-600">
                <span>Creations Subtotal</span>
                <span>
                  {currency === "SGD" ? "S$" : "$"}
                  {rawSubtotal.toFixed(2)}
                </span>
              </div>

              {appliedDiscount && (
                <div className="flex justify-between text-emerald-800 font-semibold">
                  <span>Privilege ({appliedDiscount.code})</span>
                  <span>
                    -{currency === "SGD" ? "S$" : "$"}
                    {discountAmount.toFixed(2)}
                  </span>
                </div>
              )}

              {/* Delivery Charge Line Item */}
              <div className="flex justify-between text-gray-600">
                <span className="flex items-center gap-1">
                  <span>EasyParcel Singapore Delivery</span>
                  <span className="text-[9.5px] text-gray-400">
                    ({shippingTier === "mbs_pickup" ? "MBS Pickup" : shippingTier === "courier_whiteglove" ? "Same-Day" : "Express"})
                  </span>
                </span>
                <span className="font-medium">
                  {deliveryFee === 0 ? (
                    <span className="text-emerald-700 font-bold uppercase text-[10px] bg-emerald-50 px-1.5 py-0.5 rounded border border-emerald-200">
                      Complimentary (S$0.00)
                    </span>
                  ) : (
                    `${currency === "SGD" ? "S$" : "$"}${deliveryFee.toFixed(2)}`
                  )}
                </span>
              </div>

              {/* Singapore 9% IRAS GST Itemization */}
              <div className="flex justify-between text-emerald-800 font-medium bg-emerald-50/70 px-2 py-1.5 rounded-lg border border-emerald-200/50">
                <span className="flex items-center gap-1">
                  <Info className="w-3.5 h-3.5 text-emerald-700" />
                  <span>Singapore 9% IRAS GST (Included)</span>
                </span>
                <span className="font-mono font-bold">
                  {currency === "SGD" ? "S$" : "$"}
                  {gstAmount.toFixed(2)}
                </span>
              </div>

              {/* Total Payable */}
              <div className="flex justify-between text-base font-serif font-bold text-ariel-espresso pt-2 border-t border-gray-200">
                <span>Total Amount Payable (SGD)</span>
                <span className="text-amber-900 font-mono">
                  {currency === "SGD" ? "S$" : "$"}
                  {totalPayable.toFixed(2)}
                </span>
              </div>

              {/* Singapore Tax Notice */}
              <p className="text-[9.5px] text-gray-400 text-center pt-0.5">
                Prices in Singapore Dollars &bull; 9% GST calculated pursuant to IRAS statutory rules (UEN: 202619482M)
              </p>
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
                    <span>Confirm & Pay {currency === "SGD" ? "S$" : "$"}{totalPayable.toFixed(2)}</span>
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
