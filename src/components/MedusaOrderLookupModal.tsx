"use client";

import React, { useState } from "react";
import { X, Search, Package, CheckCircle2, Clock, Truck, Shield, AlertCircle } from "lucide-react";
import { MedusaOrder } from "@/lib/medusa/types";

interface MedusaOrderLookupModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export function MedusaOrderLookupModal({ isOpen, onClose }: MedusaOrderLookupModalProps) {
  const [orderQuery, setOrderQuery] = useState("1042");
  const [loading, setLoading] = useState(false);
  const [order, setOrder] = useState<MedusaOrder | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [rmaSuccess, setRmaSuccess] = useState<string | null>(null);

  if (!isOpen) return null;

  const handleLookup = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!orderQuery.trim()) return;

    setLoading(true);
    setError(null);
    setRmaSuccess(null);

    try {
      const res = await fetch(`/api/medusa/orders?id=${encodeURIComponent(orderQuery.trim())}`);
      const data = await res.json();
      if (res.ok && data.order) {
        setOrder(data.order);
      } else {
        setError("Order reference not found. Try '1042' to view our sample Singapore order.");
      }
    } catch (err: any) {
      setError(err.message || "Failed to retrieve order");
    } finally {
      setLoading(false);
    }
  };

  const handleRequestRepair = async () => {
    if (!order) return;
    try {
      const res = await fetch("/api/medusa/returns", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          order_id: order.id,
          service_type: "repair",
          email: order.customer_email,
        }),
      });
      const data = await res.json();
      setRmaSuccess(data.message);
    } catch {
      setRmaSuccess("Repair request booked. Our concierge will contact you.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-ariel-cream border border-ariel-tan/40 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-ariel-espresso p-1.5 rounded-full hover:bg-ariel-sand transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-ariel-espresso text-ariel-gold flex items-center justify-center">
            <Package className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-ariel-espresso">
              Track Order & Atelier Services
            </h3>
            <p className="text-xs text-ariel-saddle font-medium">
              Medusa Order Fulfillment & Lifetime Stitching Guarantee
            </p>
          </div>
        </div>

        {/* Lookup Search Bar */}
        <form onSubmit={handleLookup} className="flex gap-2 mb-6">
          <input
            type="text"
            value={orderQuery}
            onChange={(e) => setOrderQuery(e.target.value)}
            placeholder="Enter Order ID (e.g. 1042)..."
            className="w-full bg-white border border-ariel-tan/40 rounded-xl px-4 py-3 text-xs sm:text-sm text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
          />
          <button
            type="submit"
            disabled={loading}
            className="px-5 py-3 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider shrink-0 transition-all flex items-center gap-1.5"
          >
            <Search className="w-4 h-4" />
            <span>Track</span>
          </button>
        </form>

        {error && (
          <div className="p-3 bg-red-50 border border-red-200 rounded-xl text-xs text-red-700 flex items-center gap-2 mb-4">
            <AlertCircle className="w-4 h-4 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Order Details View */}
        {order && (
          <div className="space-y-4 text-xs">
            <div className="bg-white p-5 rounded-2xl border border-ariel-tan/30 shadow-xs space-y-3">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider block">
                    Order Reference
                  </span>
                  <span className="font-serif text-base font-bold text-ariel-espresso">
                    #{order.display_id} &bull; {order.id}
                  </span>
                </div>
                <span className="px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-100 text-emerald-800">
                  {order.status}
                </span>
              </div>

              {/* Delivery Destination */}
              <div className="grid grid-cols-2 gap-3 text-gray-600">
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Delivery Address</span>
                  <span className="font-semibold text-ariel-espresso block">{order.shipping_address.address_1}</span>
                  <span className="text-gray-500">Singapore {order.shipping_address.postal_code}</span>
                </div>
                <div>
                  <span className="text-[10px] text-gray-400 uppercase font-bold block">Fulfillment Tracking</span>
                  <span className="font-mono font-bold text-ariel-cognac block">{order.tracking_number}</span>
                  <span className="text-gray-500">Singapore Express Courier</span>
                </div>
              </div>

              {/* Items List */}
              <div className="pt-2 border-t border-gray-100 space-y-2">
                <span className="text-[10px] text-gray-400 uppercase font-bold block">Purchased Creations</span>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex items-center justify-between bg-ariel-sand/30 p-2.5 rounded-xl">
                    <div className="flex items-center gap-2.5">
                      <img src={item.thumbnail} alt={item.title} className="w-10 h-10 rounded-lg object-cover" />
                      <div>
                        <p className="font-bold text-ariel-espresso">{item.title}</p>
                        <p className="text-[10px] text-gray-500">{item.variant_title}</p>
                      </div>
                    </div>
                    <span className="font-serif font-bold text-ariel-espresso">S${item.total}</span>
                  </div>
                ))}
              </div>

              {/* Cost Summary with Singapore GST */}
              <div className="pt-2 border-t border-gray-100 space-y-1 text-gray-500">
                <div className="flex justify-between">
                  <span>Subtotal</span>
                  <span>S${order.subtotal}</span>
                </div>
                <div className="flex justify-between text-emerald-700">
                  <span>Privilege Discount</span>
                  <span>-S${order.discount_total}</span>
                </div>
                <div className="flex justify-between">
                  <span>Singapore GST (9% included)</span>
                  <span>S${order.tax_total}</span>
                </div>
                <div className="flex justify-between font-serif font-bold text-sm text-ariel-espresso pt-1 border-t border-gray-100">
                  <span>Total Paid</span>
                  <span>S${order.total}</span>
                </div>
              </div>
            </div>

            {/* Medusa RMA / Repair action */}
            {rmaSuccess ? (
              <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl text-emerald-800 text-xs flex items-center gap-2">
                <CheckCircle2 className="w-4 h-4 text-emerald-600 shrink-0" />
                <span>{rmaSuccess}</span>
              </div>
            ) : (
              <div className="bg-amber-50/70 p-4 rounded-2xl border border-amber-200/80 flex items-center justify-between">
                <div>
                  <h5 className="font-bold text-amber-950 uppercase text-[11px]">
                    Lifetime Stitching & Repair Warranty
                  </h5>
                  <p className="text-gray-600 text-[11px]">
                    Complimentary maintenance by master artisans throughout the lifetime of your creation.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleRequestRepair}
                  className="px-3.5 py-2 bg-amber-900 text-white rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-black transition-colors shrink-0"
                >
                  Book Service
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
