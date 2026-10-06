"use client";

import React, { useState } from "react";
import { Search, Sparkles, SlidersHorizontal, ArrowRight, CornerDownLeft, Image as ImageIcon } from "lucide-react";

interface SearchHeroProps {
  currentQuery: string;
  searchMode: "auto" | "conventional" | "ai";
  onSearch: (query: string, mode?: "auto" | "conventional" | "ai") => void;
  onSelectSampleQuery: (query: string) => void;
  onOpenVisualSearch: () => void;
  isLoading: boolean;
}

const SAMPLE_QUERIES = [
  {
    label: "Dad's Everyday Gift (< S$200)",
    query: "I need a premium-looking leather gift for my dad, around S$200, preferably something he can use every day.",
    badge: "Nova AI Intent",
  },
  {
    label: "Business Travel Brown Wallet",
    query: "Elegant brown wallet for business travel",
    badge: "Semantic 1024-D",
  },
  {
    label: "Full-Grain Italian Bags",
    query: "Show me Italian full-grain bags in dark brown",
    badge: "Hybrid Match",
  },
  {
    label: "Slim RFID Card Sleeve (< S$100)",
    query: "Slim minimalist card holder RFID under S$100",
    badge: "Filter + Vector",
  },
  {
    label: "Conventional 'wallet'",
    query: "wallet",
    badge: "Fast Index Path",
  },
];

export function SearchHero({
  currentQuery,
  searchMode,
  onSearch,
  onSelectSampleQuery,
  onOpenVisualSearch,
  isLoading,
}: SearchHeroProps) {
  const [inputVal, setInputVal] = useState(currentQuery);
  const [selectedMode, setSelectedMode] = useState<"auto" | "conventional" | "ai">(searchMode);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearch(inputVal, selectedMode);
  };

  return (
    <div className="relative pt-8 pb-10 sm:py-12 px-4 bg-gradient-to-b from-ariel-sand/40 via-ariel-cream to-ariel-cream border-b border-ariel-tan/20">
      <div className="container mx-auto max-w-4xl text-center">
        {/* Brand Kicker */}
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ariel-sand/80 border border-ariel-tan/30 text-[11px] font-semibold text-ariel-cognac mb-4 tracking-wider uppercase">
          <Sparkles className="w-3.5 h-3.5 text-ariel-amber" />
          <span>Amazon Bedrock Hybrid Search Architecture</span>
        </div>

        {/* Hero Title */}
        <h2 className="font-serif text-3xl sm:text-5xl font-bold tracking-tight text-ariel-espresso mb-3">
          Artisanal Craft. Semantic Discovery.
        </h2>
        <p className="text-sm sm:text-base text-ariel-saddle/90 max-w-2xl mx-auto mb-8 font-normal leading-relaxed">
          Search with plain natural language. Amazon Nova Micro extracts your intent,
          while Bedrock embeddings and pgvector rank the finest Tuscan leather creations.
        </p>

        {/* Search Console */}
        <form
          onSubmit={handleSubmit}
          className="relative max-w-3xl mx-auto shadow-xl rounded-2xl bg-white border border-ariel-tan/40 p-2 sm:p-2.5 transition-all focus-within:ring-2 focus-within:ring-ariel-amber focus-within:border-transparent"
        >
          <div className="flex items-center gap-2">
            <div className="pl-3 text-ariel-saddle/60">
              <Search className="w-5 h-5" />
            </div>

            <input
              type="text"
              value={inputVal}
              onChange={(e) => setInputVal(e.target.value)}
              placeholder='e.g., "I need a premium-looking leather gift for my dad, around S$200, everyday carry"'
              className="w-full text-sm sm:text-base text-ariel-espresso placeholder-gray-400 bg-transparent py-2.5 px-2 focus:outline-none"
            />

            {/* Visual Search Button */}
            <button
              type="button"
              onClick={onOpenVisualSearch}
              className="hidden sm:flex items-center gap-1.5 px-3 py-2 rounded-xl text-xs font-semibold text-ariel-cognac bg-ariel-sand/50 hover:bg-ariel-sand transition-colors shrink-0"
              title="Multimodal visual search"
            >
              <ImageIcon className="w-4 h-4 text-ariel-amber" />
              <span>Image</span>
            </button>

            {/* Submit Action */}
            <button
              type="submit"
              disabled={isLoading}
              className="flex items-center gap-2 px-5 py-3 rounded-xl bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand text-xs sm:text-sm font-semibold tracking-wider uppercase transition-all shadow-md shrink-0 disabled:opacity-50"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-ariel-sand border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Search</span>
                  <ArrowRight className="w-4 h-4" />
                </>
              )}
            </button>
          </div>

          {/* Mode Switcher Tabs */}
          <div className="mt-2 pt-2 border-t border-gray-100 flex items-center justify-between px-2 text-xs">
            <div className="flex items-center gap-2 text-gray-500 font-medium text-[11px]">
              <span className="hidden sm:inline">Search Path:</span>
              <div className="inline-flex rounded-lg bg-ariel-sand/60 p-0.5 border border-ariel-tan/20">
                <button
                  type="button"
                  onClick={() => setSelectedMode("auto")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    selectedMode === "auto"
                      ? "bg-white text-ariel-espresso shadow-sm"
                      : "text-ariel-cognac/70 hover:text-ariel-espresso"
                  }`}
                >
                  ⚡ Auto Hybrid
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode("ai")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    selectedMode === "ai"
                      ? "bg-white text-ariel-espresso shadow-sm"
                      : "text-ariel-cognac/70 hover:text-ariel-espresso"
                  }`}
                >
                  🧠 Bedrock AI Intent
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedMode("conventional")}
                  className={`px-2.5 py-1 rounded-md text-[11px] font-semibold transition-all ${
                    selectedMode === "conventional"
                      ? "bg-white text-ariel-espresso shadow-sm"
                      : "text-ariel-cognac/70 hover:text-ariel-espresso"
                  }`}
                >
                  🔍 Conventional
                </button>
              </div>
            </div>

            <div className="text-[11px] text-ariel-saddle hidden md:block">
              {selectedMode === "auto" && "Auto-routes simple keywords vs natural language AI"}
              {selectedMode === "ai" && "Forces Nova Micro intent extraction & pgvector ranking"}
              {selectedMode === "conventional" && "Fast keyword index path (sub-millisecond)"}
            </div>
          </div>
        </form>

        {/* Interactive Query Chips */}
        <div className="mt-6 flex flex-wrap items-center justify-center gap-2">
          <span className="text-xs text-ariel-saddle font-semibold mr-1">Try Prompts:</span>
          {SAMPLE_QUERIES.map((sample, idx) => (
            <button
              key={idx}
              onClick={() => {
                setInputVal(sample.query);
                onSelectSampleQuery(sample.query);
              }}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/90 hover:bg-white border border-ariel-tan/30 hover:border-ariel-amber text-xs text-ariel-espresso shadow-sm transition-all hover:scale-105 group"
            >
              <span>{sample.label}</span>
              <span className="text-[9px] px-1.5 py-0.5 rounded bg-ariel-sand text-ariel-cognac font-bold uppercase tracking-wider group-hover:bg-ariel-amber group-hover:text-white transition-colors">
                {sample.badge}
              </span>
            </button>
          ))}
        </div>
      </div>
    </div>
  );
}
