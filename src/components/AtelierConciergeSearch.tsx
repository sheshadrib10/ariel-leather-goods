"use client";

import React, { useState } from "react";
import { Search, Sparkles, X, ArrowRight, Compass, Check } from "lucide-react";
import { SearchResult } from "@/lib/search-engine";

interface AtelierConciergeSearchProps {
  isOpen: boolean;
  onClose: () => void;
  onSearch: (query: string, mode?: "auto" | "conventional" | "ai") => void;
  searchResult: SearchResult | null;
  isLoading: boolean;
  onOpenVisualSearch: () => void;
}

const CONCIERGE_PROMPTS = [
  {
    label: "Everyday Gift for Dad (< S$200)",
    prompt: "I need a premium-looking leather gift for my dad, around S$200, preferably something he can use every day.",
  },
  {
    label: "Elegant Brown Wallet for Travel",
    prompt: "Elegant brown wallet for business travel",
  },
  {
    label: "Full-Grain Italian Bags",
    prompt: "Show me Italian full-grain bags in dark brown",
  },
  {
    label: "Slim RFID Card Sleeves (< S$100)",
    prompt: "Slim minimalist card holder RFID under S$100",
  },
  {
    label: "Bifolds & Classic Wallets",
    prompt: "wallet",
  },
];

export function AtelierConciergeSearch({
  isOpen,
  onClose,
  onSearch,
  searchResult,
  isLoading,
  onOpenVisualSearch,
}: AtelierConciergeSearchProps) {
  const [query, setQuery] = useState("");
  const [showUnderstoodDetails, setShowUnderstoodDetails] = useState(false);
  const inputRef = React.useRef<HTMLInputElement | null>(null);

  // Autofocus input and handle Escape key dismiss
  React.useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 50);
      const originalOverflow = document.body.style.overflow;
      document.body.style.overflow = "hidden";

      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === "Escape") onClose();
      };
      window.addEventListener("keydown", handleKeyDown);

      return () => {
        document.body.style.overflow = originalOverflow;
        window.removeEventListener("keydown", handleKeyDown);
      };
    }
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (query.trim()) {
      onSearch(query, "auto");
      onClose();
      const el = document.getElementById("catalog-section");
      if (el) el.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handlePromptSelect = (promptText: string) => {
    setQuery(promptText);
    onSearch(promptText, "auto");
    onClose();
    const el = document.getElementById("catalog-section");
    if (el) el.scrollIntoView({ behavior: "smooth" });
  };

  const intent = searchResult?.intent;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-black/60 backdrop-blur-sm animate-fadeIn flex items-start justify-center pt-16 sm:pt-24 pb-12 px-4">
      {/* Background click to dismiss */}
      <div className="fixed inset-0 -z-10" onClick={onClose} aria-hidden="true" />

      {/* Main Search Dialog Container */}
      <div className="relative w-full max-w-3xl bg-white rounded-3xl shadow-2xl border border-ariel-tan/40 p-6 sm:p-8 animate-in fade-in zoom-in-95 duration-200">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-ariel-espresso p-2 rounded-full hover:bg-ariel-sand transition-colors"
          title="Close search modal"
        >
          <X className="w-5 h-5" />
        </button>

        <div className="text-center mb-5">
          <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-widest uppercase text-ariel-saddle bg-ariel-sand/60 px-3 py-1 rounded-full mb-2">
            <Sparkles className="w-3.5 h-3.5 text-ariel-amber" />
            <span>Atelier Discovery Concierge</span>
          </div>
          <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ariel-espresso">
            What creation may we curate for you today?
          </h3>
          <p className="text-xs sm:text-sm text-gray-500 max-w-md mx-auto mt-1">
            Search naturally by recipient, budget, occasion, or leather patina.
          </p>
        </div>

        {/* Search Bar */}
        <form onSubmit={handleSubmit} className="relative max-w-2xl mx-auto mb-4">
          <div className="flex items-center gap-2 bg-ariel-sand/40 border border-ariel-tan/40 rounded-2xl p-2.5 focus-within:ring-2 focus-within:ring-ariel-amber focus-within:bg-white transition-all shadow-sm">
            <div className="pl-3 text-ariel-cognac">
              <Search className="w-5 h-5" />
            </div>

            <input
              ref={inputRef}
              type="text"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="e.g. 'I need a premium-looking leather gift for my dad, around S$200'..."
              className="w-full bg-transparent text-xs sm:text-sm text-ariel-espresso placeholder-gray-400 px-2 py-1.5 focus:outline-none font-medium"
            />

            <button
              type="button"
              onClick={onOpenVisualSearch}
              className="hidden sm:flex items-center gap-1.5 text-[11px] font-bold uppercase tracking-wider text-ariel-cognac bg-white px-3 py-2 rounded-xl border border-ariel-tan/30 hover:bg-ariel-sand transition-colors shrink-0 shadow-2xs"
              title="Search by image or visual silhouette"
            >
              <Compass className="w-3.5 h-3.5 text-ariel-amber" />
              <span>Image</span>
            </button>

            <button
              type="submit"
              disabled={isLoading}
              className="px-5 py-2.5 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider transition-all shrink-0 flex items-center gap-1.5 disabled:opacity-50 shadow-sm"
            >
              {isLoading ? (
                <div className="w-4 h-4 border-2 border-ariel-sand border-t-transparent rounded-full animate-spin" />
              ) : (
                <>
                  <span>Find</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </>
              )}
            </button>
          </div>
        </form>

        {/* Suggested Prompts */}
        <div className="flex flex-wrap items-center justify-center gap-2 text-xs">
          <span className="text-[11px] text-gray-400 font-semibold">Inspirations:</span>
          {CONCIERGE_PROMPTS.map((p, i) => (
            <button
              key={i}
              type="button"
              onClick={() => handlePromptSelect(p.prompt)}
              className="px-3 py-1.5 rounded-full bg-white hover:bg-ariel-sand border border-ariel-tan/30 text-[11px] text-ariel-espresso font-medium transition-all shadow-2xs hover:border-ariel-amber"
            >
              {p.label}
            </button>
          ))}
        </div>

        {/* Subtle Curation Summary (Quiet Luxury presentation of AI insights) */}
        {searchResult && searchResult.query && (
          <div className="mt-5 pt-4 border-t border-gray-100 flex flex-col sm:flex-row items-center justify-between text-xs gap-2">
            <div className="flex items-center gap-2 text-ariel-cognac font-medium">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>
                Showing {searchResult.total_matches} creations curated for: &ldquo;<span className="font-bold">{searchResult.query}</span>&rdquo;
              </span>
            </div>

            {intent && (
              <div className="flex items-center gap-3">
                <button
                  type="button"
                  onClick={() => setShowUnderstoodDetails(!showUnderstoodDetails)}
                  className="text-[11px] text-ariel-saddle hover:underline font-semibold"
                >
                  {showUnderstoodDetails ? "Hide curation parameters" : "View curation parameters"}
                </button>
              </div>
            )}
          </div>
        )}

        {/* Discreet Understood Criteria drawer */}
        {showUnderstoodDetails && intent && (
          <div className="mt-3 p-3 bg-ariel-sand/40 rounded-xl border border-ariel-tan/20 grid grid-cols-2 sm:grid-cols-4 gap-2 text-[11px]">
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Category</span>
              <span className="font-semibold text-ariel-espresso">{intent.category.join(", ") || "All"}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Budget Filter</span>
              <span className="font-semibold text-ariel-espresso">{intent.max_price ? `Under S$${intent.max_price}` : "Flexible"}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Recipient</span>
              <span className="font-semibold text-ariel-espresso">{intent.recipient || "Personal"}</span>
            </div>
            <div>
              <span className="text-gray-400 block text-[10px] uppercase font-bold">Occasion / Use</span>
              <span className="font-semibold text-ariel-espresso">{intent.use_case || intent.occasion || "Everyday Carry"}</span>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
