"use client";

import React from "react";
import { Sparkles, ShoppingBag, Database, ShieldCheck } from "lucide-react";

interface HeaderProps {
  cartCount: number;
  onOpenCart: () => void;
  onOpenBedrockModal: () => void;
  currency: "SGD" | "USD";
  onToggleCurrency: () => void;
}

export function Header({
  cartCount,
  onOpenCart,
  onOpenBedrockModal,
  currency,
  onToggleCurrency,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-ariel-cream/95 backdrop-blur-md border-b border-ariel-tan/20">
      {/* Top Announcement Bar */}
      <div className="bg-ariel-espresso text-ariel-sand text-xs py-1.5 px-4 tracking-wider flex items-center justify-between">
        <div className="container mx-auto flex items-center justify-between text-[11px] font-medium">
          <div className="flex items-center gap-2">
            <span className="inline-block w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse"></span>
            <span>AMAZON BEDROCK LIVE: NOVA MICRO INTENT + PGVECTOR 1024-D</span>
          </div>
          <div className="hidden sm:flex items-center gap-4 text-ariel-tan">
            <span>COMPLIMENTARY SHIPPING OVER S$150</span>
            <span>•</span>
            <span>HAND-BURNISHED FULL-GRAIN LEATHER</span>
          </div>
          <button
            onClick={onToggleCurrency}
            className="text-ariel-gold hover:text-white transition-colors uppercase tracking-widest text-[10px] font-semibold border border-ariel-gold/30 px-2 py-0.5 rounded"
          >
            CURRENCY: {currency} (S$)
          </button>
        </div>
      </div>

      {/* Main Navigation Bar */}
      <div className="container mx-auto px-4 py-3 sm:py-4 flex items-center justify-between">
        {/* Left Actions: Bedrock Architecture Status */}
        <div className="flex items-center gap-2">
          <button
            onClick={onOpenBedrockModal}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-full bg-ariel-sand/70 hover:bg-ariel-sand border border-ariel-tan/30 text-xs font-medium text-ariel-cognac transition-all hover:scale-105"
            title="Inspect Bedrock & pgvector architecture"
          >
            <Sparkles className="w-3.5 h-3.5 text-ariel-amber" />
            <span className="hidden md:inline">Bedrock AI Stack</span>
            <span className="px-1.5 py-0.2 text-[10px] bg-emerald-100 text-emerald-800 font-bold rounded-full">
              Active
            </span>
          </button>
        </div>

        {/* Brand Center Title */}
        <div className="text-center">
          <a href="/" className="inline-block group">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.25em] text-ariel-espresso group-hover:text-ariel-saddle transition-colors uppercase">
              ARIEL
            </h1>
            <p className="text-[9px] sm:text-[10px] tracking-[0.35em] text-ariel-saddle font-semibold uppercase -mt-0.5">
              LEATHER GOODS • EST. 2026
            </p>
          </a>
        </div>

        {/* Right Actions: Shopping Bag */}
        <div className="flex items-center gap-3">
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 p-2 rounded-full hover:bg-ariel-sand/80 text-ariel-espresso transition-colors"
            aria-label="View shopping bag"
          >
            <ShoppingBag className="w-5 h-5 text-ariel-cognac" />
            <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase text-ariel-cognac">
              Bag
            </span>
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-ariel-saddle text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center animate-bounce">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
