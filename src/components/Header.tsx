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
            <button
              onClick={onOpenTechSpecs}
              className="text-gray-400 hover:text-ariel-gold transition-colors text-[10px] tracking-wider hidden sm:inline"
              title="View Amazon Bedrock Architecture Blueprint"
            >
              Tech Specs
            </button>
          </div>
        </div>
      </div>

      {/* Main Luxury Brand Navigation */}
      <div className="container mx-auto max-w-7xl px-4 py-4 sm:py-5 flex items-center justify-between">
        {/* Brand Logo & Origin */}
        <div className="flex-1 flex items-center">
          <a href="/" className="inline-block group text-left">
            <h1 className="font-serif text-2xl sm:text-3xl font-bold tracking-[0.3em] text-ariel-espresso group-hover:text-ariel-saddle transition-colors uppercase">
              ARIEL
            </h1>
            <p className="text-[9px] sm:text-[10px] tracking-[0.4em] text-ariel-saddle font-semibold uppercase -mt-0.5">
              LEATHER GOODS &bull; FIRENZE &bull; SINGAPORE
            </p>
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
    </header>
  );
}
