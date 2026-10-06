"use client";

import React, { useState } from "react";
import { X, RotateCcw, Truck, Building, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { MedusaOrder, MedusaReturn } from "@/lib/medusa/types";
import { useAuth } from "@/lib/auth-context";

interface CustomerReturnModalProps {
  order: MedusaOrder | null;
  onClose: () => void;
  onReturnSubmitted?: (returnRecord: MedusaReturn) => void;
}

export function CustomerReturnModal({
  order,
  onClose,
  onReturnSubmitted,
}: CustomerReturnModalProps) {
  const { requestOrderReturn } = useAuth();

  const [reason, setReason] = useState("Patina & Leather Grain Preference");
  const [returnMethod, setReturnMethod] = useState<"easyparcel_pickup" | "mbs_salon_dropoff">(
    "easyparcel_pickup"
  );
  const [notes, setNotes] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [createdReturn, setCreatedReturn] = useState<MedusaReturn | null>(null);

  if (!order) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      const res = await requestOrderReturn(order.id, reason, returnMethod, notes);
      if (res.success && res.returnRecord) {
        setCreatedReturn(res.returnRecord);
        if (onReturnSubmitted) onReturnSubmitted(res.returnRecord);
      } else {
        alert(res.message);
      }
    } catch (e: any) {
      alert("Return request failed: " + e.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-ariel-tan/40 shadow-2xl relative text-stone-900 space-y-5 text-xs">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {createdReturn ? (
          /* Confirmation Screen */
          <div className="py-4 space-y-4 text-center">
            <div className="w-14 h-14 bg-emerald-100 text-emerald-800 rounded-full flex items-center justify-center mx-auto shadow-xs">
              <Check className="w-8 h-8" />
            </div>
            <div>
              <span className="text-[10px] uppercase font-bold tracking-widest text-emerald-800 bg-emerald-50 border border-emerald-200 px-3 py-1 rounded-full inline-block mb-2">
                Return Authorization Confirmed
              </span>
              <h3 className="font-serif text-2xl font-bold text-ariel-espresso">
                RMA-SG-{createdReturn.display_id}
              </h3>
              <p className="text-gray-500 mt-1">
                Your commission return for Order #{order.display_id} has been registered in the Medusa RMA ledger.
              </p>
            </div>

            <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100 text-left space-y-2 text-[11.5px]">
              <div className="flex justify-between font-semibold">
                <span>Return Logistics:</span>
                <span className="text-amber-800 capitalize">
                  {createdReturn.return_method === "easyparcel_pickup"
                    ? "EasyParcel White-Glove Pickup"
                    : "MBS Flagship Salon Drop-Off"}
                </span>
              </div>
              {createdReturn.tracking_number && (
                <div className="flex justify-between font-mono">
                  <span>Return AWB:</span>
                  <span className="font-bold text-gray-800">{createdReturn.tracking_number}</span>
                </div>
              )}
              <div className="flex justify-between">
                <span>Refundable Amount:</span>
                <span className="font-bold text-gray-900">S${createdReturn.refund_amount.toFixed(2)} SGD</span>
              </div>
              <p className="text-[10px] text-gray-400 pt-1 border-t border-gray-200">
                Refunds are disbursed via HitPay PayNow SGQR directly to your issuing account upon atelier inspection.
              </p>
            </div>

            <button
              onClick={onClose}
              className="w-full py-3 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-md"
            >
              Return to Orders
            </button>
          </div>
        ) : (
          /* Return Request Form */
          <>
            <div className="border-b border-gray-100 pb-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-ariel-cognac block">
                Medusa 14-Day Boutique Returns
              </span>
              <h3 className="font-serif text-xl font-bold text-ariel-espresso">
                Request Return or Exchange
              </h3>
              <p className="text-gray-500 text-[11px] mt-0.5">
                Commission #{order.display_id} &bull; Total: S${order.total.toFixed(2)}
              </p>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              {/* Return Reason */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                  Reason for Return *
                </label>
                <select
                  value={reason}
                  onChange={(e) => setReason(e.target.value)}
                  className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                >
                  <option value="Patina & Leather Grain Preference">
                    Patina & Leather Grain Preference
                  </option>
                  <option value="Silhouette / Size Mismatch">Silhouette / Size Mismatch</option>
                  <option value="Exchange for Alternative Creation">
                    Exchange for Alternative Creation
                  </option>
                  <option value="Gift Exchange">Gift Exchange</option>
                  <option value="Defective Stitching or Hardware">
                    Defective Stitching or Hardware
                  </option>
                  <option value="Other">Other</option>
                </select>
              </div>

              {/* Return Logistics Method */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                  Select Return Method *
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                  <button
                    type="button"
                    onClick={() => setReturnMethod("easyparcel_pickup")}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      returnMethod === "easyparcel_pickup"
                        ? "border-amber-600 bg-amber-50/70 text-amber-950 font-semibold"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Truck className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-bold text-xs">EasyParcel Pickup</span>
                    </div>
                    <span className="text-[10px] text-gray-500">
                      Courier picks up from your Singapore address.
                    </span>
                  </button>

                  <button
                    type="button"
                    onClick={() => setReturnMethod("mbs_salon_dropoff")}
                    className={`p-3 rounded-xl border text-left flex flex-col justify-between transition-all ${
                      returnMethod === "mbs_salon_dropoff"
                        ? "border-amber-600 bg-amber-50/70 text-amber-950 font-semibold"
                        : "border-gray-200 hover:border-gray-300 text-gray-700"
                    }`}
                  >
                    <div className="flex items-center gap-1.5 mb-1">
                      <Building className="w-4 h-4 text-amber-600 shrink-0" />
                      <span className="font-bold text-xs">MBS Salon Drop-off</span>
                    </div>
                    <span className="text-[10px] text-gray-500">
                      Bring to Marina Bay Sands #01-42.
                    </span>
                  </button>
                </div>
              </div>

              {/* Items in this return */}
              <div className="p-3 bg-gray-50 rounded-xl space-y-1">
                <span className="text-[10px] uppercase font-bold text-gray-400 block">
                  Items to Return ({order.items.length})
                </span>
                {order.items.map((item, idx) => (
                  <div key={idx} className="flex justify-between text-[11px] text-gray-700">
                    <span>
                      {item.title} &times; {item.quantity}
                    </span>
                    <span className="font-mono">S${item.total.toFixed(2)}</span>
                  </div>
                ))}
              </div>

              {/* Notes */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                  Additional Notes (Optional)
                </label>
                <textarea
                  rows={2}
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Tell our atelier concierge any specific preferences or exchange requests..."
                  className="w-full bg-stone-50 border border-gray-200 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                />
              </div>

              {/* Submit Button */}
              <div className="pt-2 flex justify-end gap-2">
                <button
                  type="button"
                  onClick={onClose}
                  className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isSubmitting}
                  className="px-6 py-2.5 rounded-xl bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
                >
                  <RotateCcw className="w-3.5 h-3.5 text-ariel-amber" />
                  <span>{isSubmitting ? "Generating RMA..." : "Authorize Return"}</span>
                </button>
              </div>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
