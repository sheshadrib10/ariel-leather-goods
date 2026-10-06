"use client";

import React from "react";
import { X, Globe, Check } from "lucide-react";
import { MEDUSA_REGIONS } from "@/lib/medusa/store";
import { MedusaRegion } from "@/lib/medusa/types";

interface RegionSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
  selectedRegion: MedusaRegion;
  onSelectRegion: (region: MedusaRegion) => void;
}

export function RegionSelectorModal({
  isOpen,
  onClose,
  selectedRegion,
  onSelectRegion,
}: RegionSelectorModalProps) {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-ariel-cream border border-ariel-tan/40 rounded-3xl w-full max-w-md shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-ariel-espresso p-1.5 rounded-full hover:bg-ariel-sand transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-ariel-espresso text-ariel-gold flex items-center justify-center">
            <Globe className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl font-bold text-ariel-espresso">
              Select Destination & Currency
            </h3>
            <p className="text-xs text-ariel-saddle font-medium">
              Medusa Multi-Region & Tax Engine
            </p>
          </div>
        </div>

        <div className="space-y-3">
          {MEDUSA_REGIONS.map((reg) => (
            <div
              key={reg.id}
              onClick={() => {
                onSelectRegion(reg);
                onClose();
              }}
              className={`cursor-pointer p-4 rounded-2xl border transition-all flex items-center justify-between ${
                selectedRegion.id === reg.id
                  ? "bg-white border-ariel-amber ring-2 ring-ariel-amber/20 shadow-sm"
                  : "bg-white/70 border-ariel-tan/30 hover:bg-white"
              }`}
            >
              <div>
                <h4 className="font-bold text-ariel-espresso text-sm">{reg.name}</h4>
                <p className="text-xs text-gray-500">
                  Currency: {reg.currency_code} ({reg.currency_symbol}) &bull;{" "}
                  {reg.tax_rate > 0 ? `${(reg.tax_rate * 100).toFixed(0)}% Tax Included` : "Duty Calculated"}
                </p>
              </div>
              {selectedRegion.id === reg.id && (
                <div className="w-6 h-6 rounded-full bg-ariel-espresso text-ariel-sand flex items-center justify-center">
                  <Check className="w-4 h-4 text-ariel-gold" />
                </div>
              )}
            </div>
          ))}
        </div>

        <p className="text-[11px] text-gray-400 text-center mt-6">
          Pricing, customs duty, and complimentary courier fulfillment adapt dynamically to your delivery destination.
        </p>
      </div>
    </div>
  );
}

