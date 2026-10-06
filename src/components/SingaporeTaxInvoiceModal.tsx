"use client";

import React from "react";
import { X, Printer, Download, Check, ShieldCheck, Truck, CreditCard } from "lucide-react";
import { MedusaOrder } from "@/lib/medusa/types";

interface SingaporeTaxInvoiceModalProps {
  order: MedusaOrder | null;
  onClose: () => void;
}

export function SingaporeTaxInvoiceModal({ order, onClose }: SingaporeTaxInvoiceModalProps) {
  if (!order) return null;

  // 9% Singapore GST Calculation
  // Singapore retail prices to consumers are GST-inclusive:
  // Taxable Base = Total / 1.09, GST (9%) = Total - Taxable Base
  const gstRate = 0.09;
  const deliveryTotal = order.shipping_total || 0;
  const taxableBase = (order.total - deliveryTotal) / (1 + gstRate);
  const gstAmount = (order.total - deliveryTotal) - taxableBase;

  const handleDownloadJson = () => {
    const invoiceData = {
      _legal_authority: "Inland Revenue Authority of Singapore (IRAS) GST Act",
      invoice_number: `INV-SG-${order.display_id}`,
      issue_date: order.created_at,
      merchant: {
        legal_name: "ARIEL LEATHER GOODS PTE LTD",
        boutique_address: "Marina Bay Sands #01-42, 10 Bayfront Ave, Singapore 018956",
        uen: "202619482M",
        gst_registration_number: "M90382710X",
      },
      customer: {
        name: `${order.shipping_address.first_name} ${order.shipping_address.last_name}`,
        phone: order.shipping_address.phone,
        address: order.shipping_address.address_1,
        postal_code: order.shipping_address.postal_code,
        country: "Singapore",
      },
      items: order.items,
      financials: {
        currency: "SGD",
        taxable_base_sgd: Number(taxableBase.toFixed(2)),
        iras_gst_9pct_sgd: Number(gstAmount.toFixed(2)),
        shipping_fee_sgd: deliveryTotal,
        total_payable_sgd: order.total,
      },
      payment_gateway: {
        provider: "HitPay Payment Solutions (Singapore)",
        transaction_id: order.hitpay_reference || `HITPAY-SGQR-${order.display_id}`,
        payment_status: order.payment_status || "captured",
      },
      logistics: {
        provider: "EasyParcel Singapore White-Glove Dispatch",
        awb: order.easyparcel_awb || order.tracking_number,
        courier: order.easyparcel_courier || "Same-Day Courier",
      },
    };

    const blob = new Blob([JSON.stringify(invoiceData, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = `ariel_tax_invoice_INV-SG-${order.display_id}.json`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm animate-fadeIn">
      <div className="bg-white rounded-3xl max-w-2xl w-full max-h-[92vh] overflow-y-auto shadow-2xl relative text-stone-900 border border-ariel-tan/40 flex flex-col">
        {/* Top Action Bar (hidden in print) */}
        <div className="p-4 sm:p-5 border-b border-gray-100 flex items-center justify-between print:hidden">
          <div className="flex items-center gap-2">
            <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-1 rounded-full bg-amber-50 text-amber-900 border border-amber-200">
              Official Singapore Tax Invoice
            </span>
            <span className="font-mono text-xs font-bold text-gray-500">
              #INV-SG-{order.display_id}
            </span>
          </div>

          <div className="flex items-center gap-2">
            <button
              onClick={() => window.print()}
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Print Tax Invoice"
            >
              <Printer className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">Print</span>
            </button>

            <button
              onClick={handleDownloadJson}
              className="px-3.5 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-bold text-xs flex items-center gap-1.5 transition-colors shadow-2xs"
              title="Download IRAS Invoice JSON"
            >
              <Download className="w-3.5 h-3.5 text-gray-500" />
              <span className="hidden sm:inline">JSON</span>
            </button>

            <button
              onClick={onClose}
              className="p-1.5 text-gray-400 hover:text-gray-900 rounded-full hover:bg-gray-100 transition-colors ml-1"
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Printable Official Invoice Body */}
        <div className="p-6 sm:p-8 space-y-6 text-xs flex-1">
          {/* Header Strip: Merchant Legal Details */}
          <div className="flex flex-col sm:flex-row justify-between items-start pb-5 border-b border-gray-200 gap-4">
            <div>
              <div className="flex items-center gap-2 mb-1">
                <span className="font-serif text-lg font-bold tracking-wider text-ariel-espresso uppercase">
                  ARIEL LEATHER GOODS PTE LTD
                </span>
              </div>
              <p className="text-[11px] text-gray-500 leading-tight">
                Marina Bay Sands #01-42, 10 Bayfront Avenue, Singapore 018956
              </p>
              <p className="text-[11px] text-gray-600 font-mono mt-1">
                UEN: <b>202619482M</b> &bull; GST Reg No: <b>M90382710X</b>
              </p>
            </div>

            <div className="text-left sm:text-right space-y-1">
              <span className="text-xs uppercase font-serif font-black tracking-widest px-3 py-1 rounded bg-stone-900 text-stone-100 inline-block">
                TAX INVOICE
              </span>
              <p className="font-mono text-sm font-bold text-gray-900 mt-1">
                INV-SG-{order.display_id}
              </p>
              <p className="text-[10px] text-gray-500">
                Date: {new Date(order.created_at).toLocaleDateString("en-SG", {
                  day: "numeric",
                  month: "short",
                  year: "numeric",
                  hour: "2-digit",
                  minute: "2-digit",
                })}
              </p>
            </div>
          </div>

          {/* Customer & Logistics Details Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 py-1">
            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                Bill To & Deliver To
              </span>
              <p className="font-bold text-gray-900 text-sm">
                {order.shipping_address.first_name} {order.shipping_address.last_name}
              </p>
              <p className="text-gray-600">{order.shipping_address.address_1}</p>
              <p className="text-gray-500">Singapore {order.shipping_address.postal_code}</p>
              <p className="text-gray-500 font-mono">{order.shipping_address.phone}</p>
            </div>

            <div className="p-3.5 bg-gray-50 rounded-2xl border border-gray-100 space-y-1">
              <span className="text-[10px] uppercase font-bold text-gray-400 block tracking-wider">
                Fulfillment & Settlement
              </span>
              <div className="flex items-center gap-1.5 text-emerald-800 font-bold">
                <Check className="w-3.5 h-3.5 text-emerald-600" />
                <span>HitPay Singapore Captured (PayNow SGQR)</span>
              </div>
              <p className="text-gray-500 font-mono text-[10.5px]">
                Ref: {order.hitpay_reference || `HITPAY-SGQR-${order.display_id}`}
              </p>
              <div className="pt-1 text-gray-600 flex items-center gap-1.5">
                <Truck className="w-3.5 h-3.5 text-ariel-amber" />
                <span>{order.easyparcel_courier || "EasyParcel White-Glove"}</span>
              </div>
              <p className="text-gray-500 font-mono text-[10.5px]">
                AWB: {order.easyparcel_awb || order.tracking_number}
              </p>
            </div>
          </div>

          {/* Itemized Products Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className="border-b border-gray-200 text-gray-500 uppercase tracking-wider text-[10px]">
                  <th className="py-2 font-bold">Artisanal Creation</th>
                  <th className="py-2 text-center font-bold">Qty</th>
                  <th className="py-2 text-right font-bold">Unit Price</th>
                  <th className="py-2 text-right font-bold">Total (SGD)</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {order.items.map((item, idx) => (
                  <tr key={idx} className="py-2">
                    <td className="py-2.5 pr-2">
                      <span className="font-bold text-gray-900 block">{item.title}</span>
                      {item.monogram?.text && (
                        <span className="text-[10px] font-mono text-amber-800 block">
                          Bespoke Monogram: [{item.monogram.text}] &bull; {item.monogram.foil} foil
                        </span>
                      )}
                      {item.metadata?.monogram_text && !item.monogram && (
                        <span className="text-[10px] font-mono text-amber-800 block">
                          Bespoke Monogram: [{item.metadata.monogram_text}] &bull; {item.metadata.monogram_foil} foil
                        </span>
                      )}
                    </td>
                    <td className="py-2.5 text-center text-gray-700 font-mono">{item.quantity}</td>
                    <td className="py-2.5 text-right text-gray-600 font-mono">
                      S${(item.total / item.quantity).toFixed(2)}
                    </td>
                    <td className="py-2.5 text-right font-bold text-gray-900 font-mono">
                      S${item.total.toFixed(2)}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* IRAS Statutory Financial Breakdown */}
          <div className="pt-4 border-t border-gray-200 space-y-2 text-xs">
            <div className="flex justify-between text-gray-600">
              <span>Taxable Base (Net amount excluding GST)</span>
              <span className="font-mono">S${taxableBase.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-emerald-800 font-semibold">
              <span className="flex items-center gap-1">
                <ShieldCheck className="w-3.5 h-3.5 text-emerald-600" />
                <span>Singapore GST (9.0% Standard Rate)</span>
              </span>
              <span className="font-mono">S${gstAmount.toFixed(2)}</span>
            </div>

            <div className="flex justify-between text-gray-600">
              <span>EasyParcel White-Glove Logistics & Courier</span>
              <span className="font-mono">
                {deliveryTotal === 0 ? "Complimentary (S$0.00)" : `S$${deliveryTotal.toFixed(2)}`}
              </span>
            </div>

            <div className="pt-2 border-t border-gray-300 flex justify-between items-baseline text-base font-bold text-ariel-espresso">
              <span className="font-serif">Total Payable (SGD)</span>
              <span className="font-serif text-lg text-ariel-cognac font-bold font-mono">
                S${order.total.toFixed(2)}
              </span>
            </div>
          </div>

          {/* Statutory IRAS GST Compliance Footnote */}
          <div className="pt-4 border-t border-gray-100 text-[10px] text-gray-400 space-y-1">
            <p>
              This tax invoice is issued pursuant to Section 41 of the Singapore Goods and Services Tax Act (Cap. 117A).
              All prices shown in SGD. IRAS 5-Year Statutory Audit Retention applies.
            </p>
            <p>
              Ariel Leather Goods Flagship Boutique &bull; Marina Bay Sands #01-42, Singapore 018956 &bull; concierge@arielleather.com
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
