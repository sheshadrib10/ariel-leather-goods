"use client";

import React, { useState } from "react";
import {
  Search,
  ShoppingBag,
  User,
  Heart,
  Menu,
  X,
  Sparkles,
  ChevronRight,
  Shield,
  Truck,
  SlidersHorizontal,
  Compass,
  ArrowRight,
  Store,
} from "lucide-react";

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
  onOpenMonogramStudio?: () => void;
  onOpenWhyAriel?: () => void;
}

export const NAV_CATEGORIES = [
  { id: "all", label: "All Creations", count: 16, desc: "The complete artisanal collection" },
  { id: "wallet", label: "Wallets & Bifolds", count: 4, desc: "Bifolds, coat wallets & money clips" },
  { id: "bag", label: "Bags & Briefcases", count: 5, desc: "Sarto briefcases, duffles & messengers" },
  { id: "belt", label: "Dress Belts", count: 1, desc: "Reversible Italian full-grain leather" },
  { id: "card_holder", label: "Card Sleeves", count: 2, desc: "Ultra-slim 4mm RFID pocket holders" },
  { id: "accessory", label: "Accessories & Folios", count: 4, desc: "Watch rolls, travel folios & valet trays" },
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
  onOpenMonogramStudio,
  onOpenWhyAriel,
}: HeaderProps) {
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

  const handleCategoryClick = (catId: string) => {
    onSelectCategory(catId);
    setIsMobileMenuOpen(false);
  };

  const handleScrollToSection = (sectionId: string) => {
    setIsMobileMenuOpen(false);
    const elem = document.getElementById(sectionId);
    if (elem) {
      elem.scrollIntoView({ behavior: "smooth" });
    }
  };

  return (
    <>
      <header className="sticky top-0 z-40 bg-ariel-cream/95 backdrop-blur-md border-b border-ariel-tan/20 transition-all">
        {/* Top Announcement Bar - Ultra-compact on mobile to minimize screen real estate */}
        <div className="bg-ariel-espresso text-ariel-sand/90 py-1 sm:py-1.5 px-3 sm:px-4 tracking-wider sm:tracking-widest uppercase font-medium border-b border-white/5">
          <div className="container mx-auto max-w-7xl flex items-center justify-between text-[9px] sm:text-[10px]">
            <div className="flex items-center gap-1.5 truncate">
              <span className="w-1.5 h-1.5 rounded-full bg-ariel-gold shrink-0 animate-pulse"></span>
              <span className="hidden sm:inline">COMPLIMENTARY SINGAPORE COURIER OVER S$150 &bull; DESIGNED IN SG &bull; CRAFTED IN ITALY</span>
              <span className="sm:hidden font-semibold truncate">Free SG Courier &bull; Handcrafted Leather</span>
            </div>

            <div className="hidden md:flex items-center gap-5 text-ariel-sand/70 text-[9.5px]">
              <span>DESIGNED IN SINGAPORE</span>
              <span>&bull;</span>
              <span>CRAFTED IN ITALY</span>
              <span>&bull;</span>
              <span>LIFETIME STITCHING WARRANTY</span>
            </div>

            <div className="flex items-center gap-1.5 sm:gap-2.5 shrink-0 ml-2">
              <button
                onClick={onToggleCurrency}
                className="text-ariel-gold hover:text-white transition-colors text-[8.5px] sm:text-[9.5px] font-bold tracking-wider border border-ariel-gold/30 px-1.5 py-0.5 rounded bg-ariel-gold/5"
                title="Toggle Currency"
              >
                {currency} (S$)
              </button>
              <a
                href="/admin"
                className="hidden sm:inline-flex text-ariel-gold hover:text-white transition-colors text-[9.5px] font-bold tracking-widest border border-ariel-gold/40 px-2 py-0.5 rounded items-center gap-1 bg-ariel-gold/10 hover:bg-ariel-gold/20"
                title="Merchant Atelier Cockpit (Singapore)"
              >
                <span>Seller Portal</span>
              </a>
            </div>
          </div>
        </div>

        {/* Main Brand Navigation Bar */}
        <div className="container mx-auto max-w-7xl px-4 py-3.5 sm:py-4 flex items-center justify-between gap-2">
          {/* Mobile Hamburger Menu Button */}
          <div className="lg:hidden flex items-center">
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="p-2 -ml-2 rounded-xl text-ariel-espresso hover:bg-ariel-sand/80 transition-colors flex items-center gap-1.5"
              aria-label="Open full category navigation"
            >
              <Menu className="w-6 h-6 text-ariel-espresso" />
              <span className="text-[11px] font-bold uppercase tracking-wider text-ariel-saddle hidden xs:inline">
                Menu
              </span>
            </button>
          </div>

          {/* Brand Logo & Origin */}
          <div className="flex-1 lg:flex-initial flex items-center justify-center lg:justify-start">
            <a href="/" className="inline-flex items-center gap-3 group text-left">
              {/* Handcrafted Luxury Artisan Crest Logo */}
              <div className="w-10 h-10 sm:w-11 sm:h-11 rounded-2xl bg-gradient-to-br from-[#1C1613] via-[#2A1F1A] to-[#120E0C] border border-[#C5A059]/60 shadow-md flex items-center justify-center relative overflow-hidden group-hover:border-[#C5A059] group-hover:scale-105 transition-all">
                <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C5A059]/30 via-transparent to-transparent opacity-80" />
                <svg
                  className="w-6 h-6 text-[#C5A059] relative z-10"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.6"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M4 8l3 3 5-6 5 6 3-3v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
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
                    SINGAPORE
                  </span>
                </div>
                <span className="text-[8.5px] sm:text-[9.5px] tracking-[0.32em] text-ariel-saddle font-bold uppercase block mt-1">
                  LEATHER GOODS &bull; ATELIER
                </span>
              </div>
            </a>
          </div>

          {/* Center Desktop Navigation */}
          <nav className="hidden lg:flex items-center gap-7 text-xs font-semibold uppercase tracking-widest text-ariel-espresso/80">
            {NAV_CATEGORIES.map((link) => (
              <button
                key={link.id}
                onClick={() => handleCategoryClick(link.id)}
                className={`pb-1 transition-colors relative hover:text-ariel-saddle ${
                  activeCategory === link.id
                    ? "text-ariel-espresso font-bold border-b-2 border-ariel-espresso"
                    : ""
                }`}
              >
                {link.label}
              </button>
            ))}
          </nav>

          {/* Right Action Icons (Concierge Search, Account, Wishlist, Bag) */}
          <div className="flex items-center justify-end gap-1 sm:gap-3">
            {/* Search Trigger */}
            <button
              onClick={onOpenSearch}
              className="flex items-center gap-1.5 p-2 rounded-full hover:bg-ariel-sand/80 text-ariel-espresso transition-colors"
              title="Search creations"
            >
              <Search className="w-4 h-4 text-ariel-cognac" />
              <span className="hidden xl:inline text-xs font-semibold tracking-wider uppercase text-ariel-cognac">
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
              <span className="hidden xl:inline text-xs font-semibold tracking-wider uppercase text-ariel-cognac">
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
              aria-label="Open Shopping Bag"
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

        {/* Mobile Category Navigation Strip with Visual Scroll Hint */}
        <div className="lg:hidden relative border-t border-ariel-tan/15 bg-ariel-cream/70">
          <div className="px-4 py-2 overflow-x-auto flex items-center gap-2 text-[11px] font-semibold uppercase tracking-wider scrollbar-none no-scrollbar">
            {/* All Categories Drawer Trigger Chip */}
            <button
              onClick={() => setIsMobileMenuOpen(true)}
              className="px-2.5 py-1 rounded-full bg-ariel-espresso text-ariel-gold text-[10.5px] font-bold flex items-center gap-1 shrink-0 shadow-2xs hover:bg-ariel-cognac"
            >
              <Menu className="w-3 h-3" />
              <span>All ({NAV_CATEGORIES.length})</span>
            </button>

            {NAV_CATEGORIES.map((link) => (
              <button
                key={link.id}
                onClick={() => handleCategoryClick(link.id)}
                className={`px-3 py-1 rounded-full whitespace-nowrap transition-colors shrink-0 ${
                  activeCategory === link.id
                    ? "bg-ariel-espresso text-ariel-sand font-bold shadow-2xs"
                    : "bg-ariel-sand/50 text-ariel-espresso/80 hover:bg-ariel-sand"
                }`}
              >
                {link.label}
              </button>
            ))}
          </div>

          {/* Right fade gradient indicating more horizontal content */}
          <div className="pointer-events-none absolute right-0 top-0 bottom-0 w-8 bg-gradient-to-l from-ariel-cream via-ariel-cream/80 to-transparent flex items-center justify-end pr-1 text-ariel-saddle/60">
            <ChevronRight className="w-3.5 h-3.5" />
          </div>
        </div>
      </header>

      {/* Luxury Mobile Slide-out Drawer Menu */}
      {isMobileMenuOpen && (
        <div className="fixed inset-0 z-50 lg:hidden flex">
          {/* Backdrop */}
          <div
            className="fixed inset-0 bg-black/60 backdrop-blur-sm transition-opacity"
            onClick={() => setIsMobileMenuOpen(false)}
          />

          {/* Drawer Content */}
          <div className="relative w-full max-w-xs sm:max-w-sm bg-ariel-cream h-full shadow-2xl flex flex-col z-10 border-r border-ariel-tan/30 overflow-y-auto">
            {/* Drawer Header */}
            <div className="p-4 sm:p-5 border-b border-ariel-tan/20 flex items-center justify-between bg-ariel-sand/30">
              <div className="flex items-center gap-2.5">
                <div className="w-9 h-9 rounded-xl bg-ariel-espresso flex items-center justify-center text-ariel-gold border border-ariel-gold/40">
                  <span className="font-serif font-black text-sm">A</span>
                </div>
                <div>
                  <h3 className="font-serif font-bold text-base text-ariel-espresso uppercase tracking-widest">
                    ARIEL
                  </h3>
                  <p className="text-[9px] uppercase tracking-wider text-ariel-saddle font-semibold">
                    Singapore Atelier &bull; Firenze
                  </p>
                </div>
              </div>

              <button
                onClick={() => setIsMobileMenuOpen(false)}
                className="w-8 h-8 rounded-full bg-white/80 hover:bg-white text-ariel-espresso flex items-center justify-center border border-ariel-tan/30"
                aria-label="Close navigation menu"
              >
                <X className="w-4 h-4" />
              </button>
            </div>

            {/* Search Quick Action inside Drawer */}
            <div className="p-4 border-b border-ariel-tan/15 bg-white/40">
              <button
                onClick={() => {
                  setIsMobileMenuOpen(false);
                  onOpenSearch();
                }}
                className="w-full flex items-center gap-2.5 px-3.5 py-2.5 bg-white border border-ariel-tan/30 rounded-xl text-xs text-ariel-cognac/80 shadow-2xs hover:border-ariel-amber text-left"
              >
                <Search className="w-4 h-4 text-ariel-amber" />
                <span className="text-gray-500 font-medium">Search creations or gift finder...</span>
              </button>
            </div>

            {/* Product Category Sections */}
            <div className="p-4 space-y-1 flex-1">
              <div className="flex items-center justify-between px-2 pb-2">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ariel-saddle">
                  Collections & Categories
                </span>
                <span className="text-[10px] text-gray-500 font-semibold">16 Creations</span>
              </div>

              {NAV_CATEGORIES.map((cat) => (
                <button
                  key={cat.id}
                  onClick={() => handleCategoryClick(cat.id)}
                  className={`w-full text-left p-3 rounded-2xl transition-all flex items-center justify-between group ${
                    activeCategory === cat.id
                      ? "bg-ariel-espresso text-ariel-sand shadow-sm"
                      : "hover:bg-ariel-sand/60 text-ariel-espresso"
                  }`}
                >
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold uppercase tracking-wider">
                        {cat.label}
                      </span>
                      <span
                        className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                          activeCategory === cat.id
                            ? "bg-ariel-gold text-ariel-espresso"
                            : "bg-ariel-sand text-ariel-cognac"
                        }`}
                      >
                        {cat.count}
                      </span>
                    </div>
                    <p
                      className={`text-[11px] mt-0.5 ${
                        activeCategory === cat.id ? "text-ariel-sand/80" : "text-gray-500"
                      }`}
                    >
                      {cat.desc}
                    </p>
                  </div>
                  <ChevronRight
                    className={`w-4 h-4 transition-transform group-hover:translate-x-1 ${
                      activeCategory === cat.id ? "text-ariel-gold" : "text-ariel-tan"
                    }`}
                  />
                </button>
              ))}

              {/* Atelier Featured Sections */}
              <div className="pt-4 border-t border-ariel-tan/20 mt-4 space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-[0.2em] text-ariel-saddle block px-2 pb-1">
                  Atelier Services & Story
                </span>

                <button
                  onClick={() => handleScrollToSection("monogram-section")}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-ariel-sand/60 text-ariel-espresso flex items-center justify-between text-xs font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                    <span>Interactive Monogram Studio</span>
                  </span>
                  <span className="text-[10px] text-amber-800 bg-amber-100 px-2 py-0.5 rounded-full font-bold">
                    Free
                  </span>
                </button>

                <button
                  onClick={() => handleScrollToSection("why-ariel-section")}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-ariel-sand/60 text-ariel-espresso flex items-center justify-between text-xs font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Shield className="w-3.5 h-3.5 text-ariel-cognac" />
                    <span>The Ariel Difference (5 Pillars)</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-ariel-tan" />
                </button>

                <button
                  onClick={() => handleScrollToSection("reviews-section")}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-ariel-sand/60 text-ariel-espresso flex items-center justify-between text-xs font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-ariel-cognac" />
                    <span>Verified Patron Reviews</span>
                  </span>
                  <span className="text-[10px] text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full font-bold">
                    ★ 4.9
                  </span>
                </button>

                <button
                  onClick={() => handleScrollToSection("heritage-section")}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-ariel-sand/60 text-ariel-espresso flex items-center justify-between text-xs font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <Compass className="w-3.5 h-3.5 text-ariel-cognac" />
                    <span>Craftsmanship & Provenance</span>
                  </span>
                  <ChevronRight className="w-3.5 h-3.5 text-ariel-tan" />
                </button>
              </div>

              {/* Shopper Account & Actions */}
              <div className="pt-3 border-t border-ariel-tan/20 mt-3 space-y-1">
                <button
                  onClick={() => {
                    setIsMobileMenuOpen(false);
                    onOpenAccount();
                  }}
                  className="w-full text-left p-2.5 rounded-xl hover:bg-ariel-sand/60 text-ariel-espresso flex items-center justify-between text-xs font-semibold"
                >
                  <span className="flex items-center gap-2">
                    <User className="w-3.5 h-3.5 text-ariel-cognac" />
                    <span>My Account & Orders</span>
                  </span>
                  {wishlistCount > 0 && (
                    <span className="text-[10px] bg-ariel-saddle text-white px-2 py-0.5 rounded-full font-bold">
                      {wishlistCount} Saved
                    </span>
                  )}
                </button>

                <a
                  href="/admin"
                  className="w-full text-left p-2.5 rounded-xl hover:bg-amber-100/60 text-amber-950 flex items-center justify-between text-xs font-semibold border border-amber-300/40 bg-amber-50/50"
                >
                  <span className="flex items-center gap-2">
                    <Store className="w-3.5 h-3.5 text-amber-700" />
                    <span>Uncle&apos;s Seller Portal (Cockpit)</span>
                  </span>
                  <span className="text-[10px] uppercase tracking-wider text-amber-800 font-bold">
                    Admin
                  </span>
                </a>
              </div>
            </div>

            {/* Drawer Footer */}
            <div className="p-4 bg-ariel-espresso text-ariel-sand text-[11px] border-t border-ariel-tan/20 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Singapore Delivery:</span>
                <span className="font-semibold text-ariel-gold">Free over S$150</span>
              </div>
              <div className="flex items-center justify-between">
                <span className="text-gray-400">Currency:</span>
                <button
                  onClick={() => {
                    onToggleCurrency();
                  }}
                  className="text-ariel-gold font-bold underline"
                >
                  {currency} (S$)
                </button>
              </div>
              <p className="text-[10px] text-gray-400 pt-1 border-t border-white/10">
                Designed in Singapore &bull; Crafted in Italy
              </p>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
