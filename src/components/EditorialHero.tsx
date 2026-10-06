"use client";

import React from "react";
import { ArrowDown, Sparkles, Shield, Gift, Truck } from "lucide-react";

interface EditorialHeroProps {
  onExploreCreations: () => void;
  onOpenConciergeSearch: () => void;
}

export function EditorialHero({
  onExploreCreations,
  onOpenConciergeSearch,
}: EditorialHeroProps) {
  return (
    <section className="relative bg-ariel-sand/30 border-b border-ariel-tan/20 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-r from-ariel-cream via-transparent to-ariel-sand/40 pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 py-16 sm:py-24 grid grid-cols-1 lg:grid-cols-12 gap-12 items-center relative z-10">
        {/* Left Column: Editorial Headline & Copy */}
        <div className="lg:col-span-7 space-y-6 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ariel-sand border border-ariel-tan/40 text-[11px] font-bold text-ariel-cognac tracking-widest uppercase">
            <span>Florentine Provenance &bull; Singapore Flagship</span>
          </div>

          <h2 className="font-serif text-4xl sm:text-6xl font-bold tracking-tight text-ariel-espresso leading-[1.1]">
            Quiet Luxury. <br />
            Florentine Artistry.
          </h2>

          <p className="text-base sm:text-lg text-gray-600 max-w-xl mx-auto lg:mx-0 font-normal leading-relaxed">
            Handcrafted from certified Tuscan vegetable-tanned hides and English bridle leathers.
            Curated for discerning journeys from Marina Bay to the Tuscan hills.
          </p>

          <div className="pt-2 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-4">
            <button
              onClick={onExploreCreations}
              className="w-full sm:w-auto px-8 py-4 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Explore The Collection</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenConciergeSearch}
              className="w-full sm:w-auto px-7 py-4 bg-white/90 hover:bg-white text-ariel-espresso border border-ariel-tan/40 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-sm flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-ariel-amber group-hover:scale-110 transition-transform" />
              <span>Ask Atelier Concierge</span>
            </button>
          </div>

          {/* Pillars of the Maison */}
          <div className="pt-8 grid grid-cols-3 gap-4 border-t border-ariel-tan/20 text-center lg:text-left">
            <div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-ariel-espresso">100%</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Tuscan Full-Grain</p>
            </div>
            <div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-ariel-espresso">Same-Day</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Singapore Courier</p>
            </div>
            <div>
              <p className="font-serif text-xl sm:text-2xl font-bold text-ariel-espresso">Bespoke</p>
              <p className="text-[11px] text-gray-500 uppercase tracking-wider font-semibold">Hot-Stamping Foil</p>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Visual Feature Product */}
        <div className="lg:col-span-5 relative">
          <div className="relative aspect-[4/5] rounded-3xl overflow-hidden shadow-2xl border border-ariel-tan/30 bg-white">
            <img
              src="https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1000&q=85"
              alt="The Sarto Executive Leather Briefcase in Dark Espresso"
              className="w-full h-full object-cover object-center"
            />
            {/* Subtle Overlay Card */}
            <div className="absolute inset-x-4 bottom-4 p-4 rounded-2xl bg-white/95 backdrop-blur-md border border-ariel-tan/30 shadow-lg flex items-center justify-between">
              <div>
                <span className="text-[9px] font-bold text-ariel-saddle uppercase tracking-widest block">
                  Artisanal Highlight
                </span>
                <h4 className="font-serif font-bold text-sm text-ariel-espresso">
                  The Sarto Executive Briefcase
                </h4>
                <p className="text-[11px] text-gray-500">English Bridle Full-Grain &bull; S$580</p>
              </div>
              <button
                onClick={onExploreCreations}
                className="px-3.5 py-2 bg-ariel-espresso text-ariel-sand rounded-xl text-[10px] font-bold uppercase tracking-wider hover:bg-ariel-saddle transition-colors"
              >
                Discover
              </button>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
