"use client";

import React from "react";
import { Shield, Sparkles, Truck, Wrench, Gem, CheckCircle2 } from "lucide-react";

export const ARIEL_PILLARS = [
  {
    icon: Gem,
    title: "Full-Grain Italian Leather",
    subtitle: "Tanned to Age Gracefully",
    description: "Every piece is cut from certified full-grain Italian calfskin and Vachetta hides. We never use corrected or bonded leather. Your piece develops a rich, golden patina with daily carry.",
    badge: "100% Full-Grain",
  },
  {
    icon: Sparkles,
    title: "Meticulous Hand-Finishing",
    subtitle: "Waxed Edges & Solid Brass",
    description: "Every edge is beveled, sealed, and burnished by hand with beeswax. Assembled using double-needle saddle stitching and solid antique brass hardware designed for structural permanence.",
    badge: "Hand-Burnished",
  },
  {
    icon: Shield,
    title: "Complimentary Personalisation",
    subtitle: "24k Gold, Silver or Blind Deboss",
    description: "Bespoke hot-stamping is included with eligible creations. Custom letterpress monogramming struck individually using heated brass type in our Singapore atelier.",
    badge: "Free Monogram",
  },
  {
    icon: Truck,
    title: "Singapore Same-Day Dispatch",
    subtitle: "Island-Wide Courier Delivery",
    description: "All orders dispatch directly from our local Singapore distribution hub. Complimentary white-glove delivery on orders over S$150, with live tracking via EasyParcel and Lalamove.",
    badge: "Local Fulfillment",
  },
  {
    icon: Wrench,
    title: "Lifetime Stitching Care",
    subtitle: "Repair & Conditioning Support",
    description: "We stand behind the structural integrity of every stitch. In the unlikely event that threading ever loosens, our Singapore craftsman atelier provides complimentary stitching repair.",
    badge: "Lifetime Support",
  },
];

export function WhyArielSection() {
  return (
    <section id="why-ariel-section" className="py-16 sm:py-24 bg-white border-t border-b border-ariel-tan/20">
      <div className="container mx-auto max-w-7xl px-4">
        {/* Section Header */}
        <div className="text-center max-w-2xl mx-auto mb-14 space-y-3">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-ariel-saddle">
            The Ariel Promise
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ariel-espresso">
            The Ariel Difference
          </h2>
          <p className="text-xs sm:text-sm text-gray-600 leading-relaxed max-w-xl mx-auto">
            We believe luxury is defined by honest materials, rigorous handcraft, and transparent local service rather than manufactured mystique.
          </p>
        </div>

        {/* 5-Pillar Visual Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8">
          {ARIEL_PILLARS.slice(0, 3).map((pillar, idx) => (
            <div
              key={pillar.title}
              className="bg-ariel-sand/30 rounded-3xl p-6 sm:p-8 border border-ariel-tan/30 hover:border-amber-600/50 hover:shadow-md transition-all space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-ariel-espresso flex items-center justify-center text-ariel-gold shadow-sm">
                    <pillar.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white text-ariel-saddle border border-ariel-tan/40">
                    {pillar.badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-ariel-espresso">
                    {pillar.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-ariel-cognac mt-0.5">
                    {pillar.subtitle}
                  </p>
                </div>
                <p className="text-xs text-gray-600 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-2 border-t border-ariel-tan/20 flex items-center gap-1.5 text-[11px] text-emerald-800 font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600 shrink-0" />
                <span>Verified Atelier Standard</span>
              </div>
            </div>
          ))}
        </div>

        {/* Bottom 2 Pillars (Wide Highlight Cards) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 sm:gap-8 mt-6 sm:mt-8">
          {ARIEL_PILLARS.slice(3, 5).map((pillar) => (
            <div
              key={pillar.title}
              className="bg-ariel-espresso text-ariel-sand rounded-3xl p-6 sm:p-8 border border-ariel-saddle/40 shadow-lg space-y-4 flex flex-col justify-between"
            >
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <div className="w-12 h-12 rounded-2xl bg-ariel-gold flex items-center justify-center text-ariel-espresso shadow-sm">
                    <pillar.icon className="w-6 h-6" />
                  </div>
                  <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 rounded-full bg-white/10 text-ariel-gold border border-white/20">
                    {pillar.badge}
                  </span>
                </div>
                <div>
                  <h3 className="font-serif text-lg font-bold text-white">
                    {pillar.title}
                  </h3>
                  <p className="text-[11px] font-semibold text-ariel-gold mt-0.5">
                    {pillar.subtitle}
                  </p>
                </div>
                <p className="text-xs text-stone-300 leading-relaxed">
                  {pillar.description}
                </p>
              </div>

              <div className="pt-2 border-t border-white/10 flex items-center gap-1.5 text-[11px] text-ariel-sand font-medium">
                <CheckCircle2 className="w-3.5 h-3.5 text-ariel-gold shrink-0" />
                <span>Singapore Customer Service Guarantee</span>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
