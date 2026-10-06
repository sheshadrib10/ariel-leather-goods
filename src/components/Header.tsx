"use client";

import React from "react";
import { Search, ShoppingBag, User, Heart, Compass, Sparkles } from "lucide-react";

interface HeaderProps {
  cartCount: number;
  wishlistCount: number;
  onOpenCart: () => void;
  onOpenAccount: () => void;
  onOpenSearch: () => void;
  onOpenTechSpecs: () => void;
  currency: "SGD" | "USD";
  onToggleCurrency: () => void;
  activeCategory: string;
  onSelectCategory: (catId: string) => void;
}

const NAV_LINKS = [
  { id: "all", label: "All Creations" },
  { id: "wallet", label: "Wallets & Bifolds" },
  { id: "bag", label: "Bags & Briefcases" },
  { id: "belt", label: "Dress Belts" },
  { id: "card_holder", label: "Card Sleeves" },
  { id: "accessory", label: "Accessories" },
];

export function Header({
  cartCount,
  wishlistCount,
  onOpenCart,
  onOpenAccount,
  onOpenSearch,
  onOpenTechSpecs,
  currency,
  onToggleCurrency,
  activeCategory,
  onSelectCategory,
}: HeaderProps) {
  return (
    <header className="sticky top-0 z-40 bg-ariel-cream/95 backdrop-blur-md border-b border-ariel-tan/20 transition-all">
      {/* Top Luxury Announcement Bar */}
      <div className="bg-ariel-espresso text-ariel-sand/90 text-xs py-2 px-4 tracking-widest uppercase font-medium">
        <div className="container mx-auto max-w-7xl flex items-center justify-between text-[11px]">
          <div className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 rounded-full bg-ariel-gold animate-pulse"></span>
            <span>COMPLIMENTARY SAME-DAY COURIER IN SINGAPORE</span>
          </div>

          <div className="hidden md:flex items-center gap-6 text-ariel-sand/70 text-[10px]">
            <span>10 BAYFRONT AVE, MARINA BAY SANDS &bull; ONLINE ATELIER</span>
            <span>&bull;</span>
            <span>CERTIFIED TUSCAN VEGETABLE-TANNED</span>
          </div>

          <div className="flex items-center gap-3">
            <button
              onClick={onToggleCurrency}
              className="text-ariel-gold hover:text-white transition-colors text-[10px] font-bold tracking-widest border border-ariel-gold/30 px-2 py-0.5 rounded"
            >
              {currency} (S$)
            </button>
            <a
              href="/admin"
              className="text-ariel-gold hover:text-white transition-colors text-[10px] font-bold tracking-widest border border-ariel-gold/40 px-2.5 py-0.5 rounded flex items-center gap-1 bg-ariel-gold/10 hover:bg-ariel-gold/20"
              title="Medusa Merchant Atelier Cockpit (Singapore Flagship)"
            >
              <span>Seller Portal</span>
            </a>
          </div>
        </div>
      </div>

      {/* Main Luxury Brand Navigation */}
      <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-5 flex items-center justify-between">
        {/* Brand Logo & Origin */}
        <div className="flex-1 flex items-center">
          <a href="/" className="inline-flex items-center gap-3 group text-left">
            {/* Handcrafted Luxury Artisan Crest Logo */}
            <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#1C1613] via-[#2A1F1A] to-[#120E0C] border border-[#C5A059]/60 shadow-md flex items-center justify-center relative overflow-hidden group-hover:border-[#C5A059] group-hover:scale-105 transition-all">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C5A059]/30 via-transparent to-transparent opacity-80" />
              <svg className="w-6 h-6 text-[#C5A059] relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
                {/* Crown / Artisan Guild Crest */}
                <path d="M4 8l3 3 5-6 5 6 3-3v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
                {/* Interlocking Monogram A */}
                <path d="M9 18l3-7 3 7" strokeWidth="1.8" />
                <path d="M10.2 15h3.6" strokeWidth="1.8" />
              </svg>
            </div>

            <div className="text-left">
              <div className="flex items-center gap-2">
                <span className="font-serif text-xl sm:text-2xl font-extrabold tracking-[0.24em] text-ariel-espresso group-hover:text-ariel-saddle transition-colors uppercase leading-none">
                  ARIEL
                </span>
                <span className="text-[8.5px] uppercase font-bold tracking-widest px-1.5 py-0.5 rounded bg-amber-50 text-amber-900 border border-amber-200/80 hidden sm:inline-block">
                  MBS &bull; SG
                </span>
              </div>
              <span className="text-[8.5px] sm:text-[9.5px] tracking-[0.32em] text-ariel-saddle font-bold uppercase block mt-1">
                LEATHER GOODS &bull; FIRENZE
              </span>
            </div>
          </a>
        </div>

        {/* Center Desktop Navigation */}
        <nav className="hidden lg:flex items-center gap-8 text-xs font-semibold uppercase tracking-widest text-ariel-espresso/80">
          {NAV_LINKS.map((link) => (
            <button
              key={link.id}
              onClick={() => onSelectCategory(link.id)}
              className={`pb-1 transition-colors relative hover:text-ariel-saddle ${
                activeCategory === link.id ? "text-ariel-espresso font-bold border-b border-ariel-espresso" : ""
              }`}
            >
              {link.label}
            </button>
          ))}
        </nav>

        {/* Right Action Icons (Concierge Search, Account, Wishlist, Bag) */}
        <div className="flex-1 flex items-center justify-end gap-2 sm:gap-4">
          {/* Atelier Concierge Search Trigger */}
          <button
            onClick={onOpenSearch}
            className="flex items-center gap-2 p-2 rounded-full hover:bg-ariel-sand/80 text-ariel-espresso transition-colors"
            title="Search creations or consult Atelier Concierge"
          >
            <Search className="w-4 h-4 text-ariel-cognac" />
            <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase text-ariel-cognac">
              Search
            </span>
          </button>

          {/* Account Portal Trigger */}
          <button
            onClick={onOpenAccount}
            className="flex items-center gap-1.5 p-2 rounded-full hover:bg-ariel-sand/80 text-ariel-espresso transition-colors"
            title="Shopper Account & Orders"
          >
            <User className="w-4 h-4 text-ariel-cognac" />
            <span className="hidden sm:inline text-xs font-semibold tracking-wider uppercase text-ariel-cognac">
              Account
            </span>
          </button>

          {/* Wishlist */}
          <button
            onClick={onOpenAccount}
            className="relative p-2 rounded-full hover:bg-ariel-sand/80 text-ariel-espresso transition-colors"
            title="Saved Wishlist"
          >
            <Heart className="w-4 h-4 text-ariel-cognac" />
            {wishlistCount > 0 && (
              <span className="absolute -top-1 -right-1 bg-ariel-saddle text-white text-[9px] font-bold w-4 h-4 rounded-full flex items-center justify-center">
                {wishlistCount}
              </span>
            )}
          </button>

          {/* Shopping Bag Drawer Trigger */}
          <button
            onClick={onOpenCart}
            className="relative flex items-center gap-2 p-2 sm:px-3 sm:py-2 rounded-full bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand transition-all shadow-sm"
          >
            <ShoppingBag className="w-4 h-4 text-ariel-gold" />
            <span className="hidden sm:inline text-xs font-bold tracking-widest uppercase">
              Bag
            </span>
            {cartCount > 0 && (
              <span className="bg-ariel-gold text-ariel-espresso text-[10px] font-black w-4 h-4 rounded-full flex items-center justify-center">
                {cartCount}
              </span>
            )}
          </button>
        </div>
      </div>

      {/* Mobile Category Navigation Strip */}
      <div className="lg:hidden px-4 pb-2.5 overflow-x-auto flex gap-2 text-[11px] font-semibold uppercase tracking-wider border-t border-ariel-tan/15 pt-2 bg-ariel-cream/60">
        {NAV_LINKS.map((link) => (
          <button
            key={link.id}
            onClick={() => onSelectCategory(link.id)}
            className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors shrink-0 ${
              activeCategory === link.id
                ? "bg-ariel-espresso text-ariel-sand font-bold shadow-2xs"
                : "bg-ariel-sand/40 text-ariel-espresso/80 hover:bg-ariel-sand"
            }`}
          >
            {link.label}
          </button>
        ))}
      </div>
    </header>
  );
}
