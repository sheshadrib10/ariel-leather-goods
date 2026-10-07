"use client";

import React, { useState } from "react";
import { Sparkles, Check, ArrowRight, ShieldCheck, ShoppingBag } from "lucide-react";
import { RankedProduct } from "@/lib/search-engine";
import { PRODUCTS_CATALOG } from "@/lib/catalog-data";

interface InteractiveMonogramStudioProps {
  onSelectProductWithMonogram: (product: RankedProduct, monogram: { text: string; foil: string }) => void;
}

const LEATHER_SWATCHES = [
  { id: "espresso", label: "Espresso Brown", bgClass: "bg-[#2A1F1A]", textClass: "text-[#C5A059]", border: "border-[#4A3728]" },
  { id: "cognac", label: "Cognac Tan", bgClass: "bg-[#8B4513]", textClass: "text-[#F5D77F]", border: "border-[#A0522D]" },
  { id: "black", label: "Onyx Black", bgClass: "bg-[#18181B]", textClass: "text-[#D4AF37]", border: "border-stone-700" },
  { id: "burgundy", label: "Oxblood Burgundy", bgClass: "bg-[#4A1521]", textClass: "text-[#E6C280]", border: "border-[#682030]" },
];

const FOIL_STYLES = [
  {
    id: "gold",
    label: "24k Gold Foil",
    desc: "Heated brass foil with brilliant metallic reflection",
    previewClass: "text-[#D4AF37] drop-shadow-[0_1px_2px_rgba(212,175,55,0.7)]",
    foilBg: "bg-gradient-to-r from-[#BF953F] via-[#FCF6BA] to-[#B38728]",
  },
  {
    id: "silver",
    label: "Fine Silver",
    desc: "Refined cool metallic platinum sheen",
    previewClass: "text-[#E0E0E0] drop-shadow-[0_1px_2px_rgba(224,224,224,0.7)]",
    foilBg: "bg-gradient-to-r from-[#D0D0D0] via-[#FFFFFF] to-[#A0A0A0]",
  },
  {
    id: "blind",
    label: "Blind Deboss",
    desc: "Subtle heated deep-relief impression without foil",
    previewClass: "text-black/50 [text-shadow:_0_1px_1px_rgba(255,255,255,0.2),_0_-1px_1px_rgba(0,0,0,0.8)] font-serif font-black",
    foilBg: "bg-stone-600",
  },
];

export function InteractiveMonogramStudio({ onSelectProductWithMonogram }: InteractiveMonogramStudioProps) {
  const [initials, setInitials] = useState("A R");
  const [selectedFoil, setSelectedFoil] = useState<"gold" | "silver" | "blind">("gold");
  const [selectedLeather, setSelectedLeather] = useState("espresso");
  const [selectedProductId, setSelectedProductId] = useState<number>(1); // Default to Medici Bifold

  const activeFoil = FOIL_STYLES.find((f) => f.id === selectedFoil) || FOIL_STYLES[0];
  const activeLeather = LEATHER_SWATCHES.find((s) => s.id === selectedLeather) || LEATHER_SWATCHES[0];

  // Candidates for pairing
  const candidateProducts = PRODUCTS_CATALOG.filter((p) => [1, 2, 3, 6, 9].includes(p.id));
  const activeProduct = PRODUCTS_CATALOG.find((p) => p.id === selectedProductId) || candidateProducts[0];

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value.toUpperCase().replace(/[^A-Z\s.]/g, "").slice(0, 5);
    setInitials(val);
  };

  const handleAddCommission = () => {
    const textToApply = initials.trim() || "A R";
    const rankedProd = {
      ...activeProduct,
      ranking_breakdown: {
        final_score: 1.0,
        semantic_score: 1.0,
        filter_match_score: 1.0,
        popularity_score: activeProduct.popularity_score / 100,
        inventory_score: 1.0,
        margin_score: activeProduct.margin_rate / 100,
        match_reasons: ["Personalised Monogram Studio creation"],
      },
    } as RankedProduct;

    onSelectProductWithMonogram(rankedProd, {
      text: textToApply,
      foil: selectedFoil,
    });
  };

  return (
    <section id="monogram-section" className="py-16 sm:py-20 bg-ariel-sand/35 border-t border-b border-ariel-tan/25">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Header */}
        <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
          <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-amber-100/80 text-amber-900 border border-amber-300 text-[10px] font-bold tracking-widest uppercase mb-1">
            <Sparkles className="w-3 h-3 text-amber-700" />
            <span>Complimentary Bespoke Hot-Stamping</span>
          </div>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ariel-espresso">
            Personalise Your Piece
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 max-w-xl mx-auto">
            Test your initials in 24k gold, silver, or traditional blind deboss. Each monogram is individually struck by hand in our Singapore atelier using heated brass type.
          </p>
        </div>

        {/* Studio Workspace */}
        <div className="bg-white rounded-3xl border border-ariel-tan/30 shadow-xl overflow-hidden grid grid-cols-1 lg:grid-cols-12 gap-0">
          {/* Left Column: Interactive Controls (lg:col-span-6) */}
          <div className="p-6 sm:p-10 lg:col-span-6 space-y-6 flex flex-col justify-between">
            <div className="space-y-6">
              {/* 1. Enter Initials */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ariel-espresso mb-2">
                  1. Enter Initials (Up to 3 Letters)
                </label>
                <div className="flex gap-2 items-center">
                  <input
                    type="text"
                    value={initials}
                    onChange={handleInputChange}
                    placeholder="E.G. A R"
                    maxLength={5}
                    className="w-full sm:w-64 bg-ariel-sand/30 border-2 border-ariel-tan/40 rounded-2xl px-4 py-3 text-lg font-serif font-bold text-ariel-espresso tracking-[0.25em] uppercase text-center focus:outline-none focus:border-amber-600 transition-colors"
                  />
                  <div className="flex gap-1.5">
                    {["A R", "S B", "M K", "J D"].map((preset) => (
                      <button
                        key={preset}
                        onClick={() => setInitials(preset)}
                        className="px-2.5 py-1.5 rounded-lg border border-ariel-tan/40 text-[11px] font-serif font-bold text-ariel-saddle hover:bg-ariel-sand transition-colors"
                      >
                        {preset}
                      </button>
                    ))}
                  </div>
                </div>
              </div>

              {/* 2. Select Foil Style */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ariel-espresso mb-2">
                  2. Choose Hot-Stamping Finish
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
                  {FOIL_STYLES.map((f) => (
                    <button
                      key={f.id}
                      onClick={() => setSelectedFoil(f.id as any)}
                      className={`p-3.5 rounded-2xl border text-left transition-all relative ${
                        selectedFoil === f.id
                          ? "border-amber-700 bg-amber-50/60 ring-1 ring-amber-700"
                          : "border-ariel-tan/30 hover:border-ariel-tan bg-white"
                      }`}
                    >
                      <div className="flex items-center gap-2 mb-1">
                        <span className={`w-3.5 h-3.5 rounded-full ${f.foilBg} border border-black/20 shrink-0`} />
                        <span className="text-xs font-bold text-ariel-espresso">{f.label}</span>
                      </div>
                      <p className="text-[10.5px] text-gray-500 leading-tight">{f.desc}</p>
                      {selectedFoil === f.id && (
                        <Check className="w-3.5 h-3.5 text-amber-700 absolute top-3 right-3" />
                      )}
                    </button>
                  ))}
                </div>
              </div>

              {/* 3. Choose Leather Canvas */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ariel-espresso mb-2">
                  3. Select Leather Color Swatch
                </label>
                <div className="flex flex-wrap gap-3">
                  {LEATHER_SWATCHES.map((swatch) => (
                    <button
                      key={swatch.id}
                      onClick={() => setSelectedLeather(swatch.id)}
                      className={`px-3 py-2 rounded-xl border flex items-center gap-2 transition-all ${
                        selectedLeather === swatch.id
                          ? "border-amber-700 bg-amber-50/50 shadow-xs"
                          : "border-ariel-tan/30 hover:border-ariel-tan"
                      }`}
                    >
                      <span className={`w-4 h-4 rounded-full ${swatch.bgClass} border border-white shadow-2xs`} />
                      <span className="text-xs font-medium text-ariel-espresso">{swatch.label}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* 4. Select Product to Apply to */}
              <div>
                <label className="block text-xs font-bold uppercase tracking-wider text-ariel-espresso mb-2">
                  4. Apply to Creation
                </label>
                <select
                  value={selectedProductId}
                  onChange={(e) => setSelectedProductId(Number(e.target.value))}
                  className="w-full bg-ariel-sand/20 border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-xs font-semibold text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-amber-600"
                >
                  {candidateProducts.map((p) => (
                    <option key={p.id} value={p.id}>
                      {p.title} &bull; S${p.price_sgd} ({p.leather_type})
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* CTA Button */}
            <div className="pt-4 border-t border-ariel-tan/20 flex flex-col sm:flex-row items-center gap-3">
              <button
                onClick={handleAddCommission}
                className="w-full sm:w-auto flex-1 px-6 py-3.5 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-widest transition-all shadow-md flex items-center justify-center gap-2"
              >
                <ShoppingBag className="w-4 h-4 text-ariel-gold" />
                <span>
                  Commission {activeProduct.title} (S${activeProduct.price_sgd})
                </span>
              </button>
              <div className="text-[11px] text-gray-500 flex items-center gap-1.5 shrink-0">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Free Monogram Included</span>
              </div>
            </div>
          </div>

          {/* Right Column: Live High-Fidelity Leather Swatch Preview (lg:col-span-6) */}
          <div className="lg:col-span-6 bg-stone-900 p-6 sm:p-10 flex flex-col items-center justify-center relative overflow-hidden">
            {/* Background Texture Ambient Glow */}
            <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-amber-900/20 via-black to-black opacity-90 pointer-events-none" />

            {/* Leather Piece Card */}
            <div
              className={`w-full max-w-md aspect-[4/3] rounded-3xl ${activeLeather.bgClass} ${activeLeather.border} border-2 shadow-2xl relative flex flex-col items-center justify-between p-8 text-center transition-all duration-500 overflow-hidden group`}
            >
              {/* Hand-Stitched Perimeter Accent */}
              <div className="absolute inset-3 border border-dashed border-[#D4AF37]/30 rounded-2xl pointer-events-none" />

              {/* Top Atelier Crest Emboss */}
              <div className="relative z-10 flex items-center gap-1.5 opacity-60">
                <span className="text-[9px] font-serif tracking-[0.3em] uppercase text-white/80">
                  ARIEL &bull; FIRENZE &bull; SINGAPORE
                </span>
              </div>

              {/* Center Monogram Display with Dynamic Foil Texture */}
              <div className="relative z-10 py-6 my-auto">
                <div
                  className={`font-serif text-5xl sm:text-6xl font-black tracking-[0.22em] transition-all duration-300 ${activeFoil.previewClass}`}
                >
                  {initials.trim() || "A R"}
                </div>
                <div className="mt-2 text-[10px] tracking-[0.3em] uppercase text-white/50 font-sans">
                  {activeFoil.label} &bull; Hand Stamped
                </div>
              </div>

              {/* Bottom Leather Grain Note */}
              <div className="relative z-10 flex items-center justify-between w-full text-[9px] tracking-wider uppercase text-white/50 border-t border-white/10 pt-2 px-1">
                <span>100% Full-Grain Tuscan Leather</span>
                <span className="text-amber-400/80 font-bold">Heirloom Grade</span>
              </div>
            </div>

            {/* Live Specs Tag below preview */}
            <div className="mt-6 flex items-center gap-3 text-stone-300 text-xs text-center">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>
                Selected: <strong className="text-white">{activeProduct.title}</strong> in{" "}
                <strong className="text-amber-300">{activeLeather.label}</strong> with{" "}
                <strong className="text-white">{activeFoil.label}</strong>
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
