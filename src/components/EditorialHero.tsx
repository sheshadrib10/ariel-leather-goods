"use client";

import React, { useState, useEffect } from "react";
import {
  ArrowDown,
  Sparkles,
  ChevronLeft,
  ChevronRight,
  Gift,
  Truck,
  ShieldCheck,
  Tag,
  ArrowRight,
  Flame,
} from "lucide-react";

interface EditorialHeroProps {
  onExploreCreations: () => void;
  onOpenConciergeSearch: () => void;
}

interface HeroSlide {
  id: string;
  tag: string;
  tagColor: string;
  title: string;
  collection: string;
  promoText: string;
  promoCode?: string;
  priceNote: string;
  image: string;
  ctaText: string;
}

const HERO_SLIDES: HeroSlide[] = [
  {
    id: "slide_executive",
    tag: "SINGAPORE FLAGSHIP EXCLUSIVE",
    tagColor: "bg-amber-950/80 text-amber-300 border-amber-600/40",
    title: "The Sarto Executive English Bridle Briefcase",
    collection: "Bespoke Portfolios & Briefcases",
    promoText: "Complimentary 24k Gold Hot-Stamping & EasyParcel White-Glove Same-Day Delivery",
    promoCode: "MBS-VIP",
    priceNote: "S$580 • Incl. 9% SG GST (Reg: 202619482M)",
    image: "https://images.unsplash.com/photo-1548036328-c9fa89d128fa?auto=format&fit=crop&w=1400&q=85",
    ctaText: "Commission Masterpiece",
  },
  {
    id: "slide_wallets",
    tag: "AUTUMN PATINA PRIVILEGE • 10% OFF",
    tagColor: "bg-emerald-950/80 text-emerald-300 border-emerald-600/40",
    title: "Medici Bifolds & Tuscan Travel Folios",
    collection: "Small Leather Goods & Heirlooms",
    promoText: "10% Privilege on your first commission with Code ATELIER10 + Complimentary Monogramming",
    promoCode: "ATELIER10",
    priceNote: "From S$145 • Certified Tuscan Vachetta Cowhide",
    image: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=1400&q=85",
    ctaText: "Explore Wallets & Folios",
  },
  {
    id: "slide_travel",
    tag: "WHITE-GLOVE LOGISTICS INCLUDED",
    tagColor: "bg-stone-900/90 text-stone-200 border-stone-700",
    title: "Riviera 48-Hour Duffle & Saffiano Watch Rolls",
    collection: "Grand Tourer Travel Collection",
    promoText: "Complimentary White-Glove Courier across Singapore & Sentosa on orders S$150+",
    promoCode: "FREE-DISPATCH",
    priceNote: "From S$165 • Weather-Resistant Horween Chromexcel",
    image: "https://images.unsplash.com/photo-1553062407-98eeb64c6a62?auto=format&fit=crop&w=1400&q=85",
    ctaText: "Explore Travel Line",
  },
  {
    id: "slide_hitpay",
    tag: "HITPAY PAYNOW SGQR PRIVILEGE",
    tagColor: "bg-red-950/80 text-rose-300 border-rose-600/40",
    title: "Artisan AirTag Cases & Valet Charging Trays",
    collection: "Singapore Tech & Daily Carry",
    promoText: "Instant PayNow SGQR Checkout with Zero Surcharge & EasyParcel Express Dispatch",
    promoCode: "HITPAY10",
    priceNote: "From S$49 • Instant QR Confirmation",
    image: "https://images.unsplash.com/photo-1584917865442-de89df76afd3?auto=format&fit=crop&w=1400&q=85",
    ctaText: "Shop Daily Carry Specials",
  },
];

export function EditorialHero({
  onExploreCreations,
  onOpenConciergeSearch,
}: EditorialHeroProps) {
  const [currentSlide, setCurrentSlide] = useState(0);
  const [isPaused, setIsPaused] = useState(false);

  // Auto-advance slideshow every 5 seconds unless hovered
  useEffect(() => {
    if (isPaused) return;
    const interval = setInterval(() => {
      setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
    }, 5000);
    return () => clearInterval(interval);
  }, [isPaused]);

  const active = HERO_SLIDES[currentSlide];

  const handlePrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev - 1 + HERO_SLIDES.length) % HERO_SLIDES.length);
  };

  const handleNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentSlide((prev) => (prev + 1) % HERO_SLIDES.length);
  };

  return (
    <section className="relative bg-ariel-sand/30 border-b border-ariel-tan/20 overflow-hidden">
      {/* Background Ambience */}
      <div className="absolute inset-0 bg-gradient-to-r from-ariel-cream via-transparent to-ariel-sand/40 pointer-events-none" />

      <div className="container mx-auto max-w-7xl px-4 py-5 sm:py-8 lg:py-12 grid grid-cols-1 lg:grid-cols-12 gap-6 lg:gap-10 items-center relative z-10">
        {/* Left Column on Desktop / Top on Mobile: Hero Dynamic Collections & Promotions Slideshow */}
        <div
          className="lg:col-span-7 relative order-1"
          onMouseEnter={() => setIsPaused(true)}
          onMouseLeave={() => setIsPaused(false)}
        >
          {/* Main Slideshow Stage Card */}
          <div className="relative aspect-[16/10] sm:aspect-[16/9] lg:aspect-[16/10] rounded-3xl overflow-hidden shadow-2xl border border-ariel-tan/40 bg-stone-900 group">
            {/* Background Image with Smooth Crossfade Transition */}
            {HERO_SLIDES.map((slide, idx) => (
              <div
                key={slide.id}
                className={`absolute inset-0 transition-opacity duration-700 ease-in-out ${
                  idx === currentSlide ? "opacity-100 z-0 scale-100" : "opacity-0 pointer-events-none scale-105"
                } transition-transform duration-1000`}
              >
                <img
                  src={slide.image}
                  alt={slide.title}
                  className="w-full h-full object-cover object-center"
                />
                {/* Subtle Bottom Vignette (transparent, keeps artisanal photo luminous) */}
                <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-black/10 pointer-events-none" />
              </div>
            ))}

            {/* Top Bar: Promotion Badge & Slideshow Counter */}
            <div className="absolute top-3 inset-x-3 sm:top-4 sm:inset-x-4 flex items-center justify-between z-10 pointer-events-none">
              <div className="flex items-center gap-2 pointer-events-auto">
                <span
                  className={`px-2.5 py-0.5 sm:px-3 sm:py-1 rounded-full text-[9px] sm:text-[10px] font-bold tracking-wider uppercase border backdrop-blur-xs shadow-sm flex items-center gap-1.5 ${active.tagColor}`}
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>{active.tag}</span>
                </span>
                {active.promoCode && (
                  <span className="hidden sm:inline-flex px-2 py-0.5 rounded-full text-[9px] font-mono font-bold uppercase tracking-wider bg-black/40 text-amber-300 border border-amber-500/30 backdrop-blur-xs">
                    Code: {active.promoCode}
                  </span>
                )}
              </div>

              {/* Pause/Live Indicator */}
              <div className="px-2 py-0.5 rounded-full bg-black/30 backdrop-blur-xs text-stone-300 text-[9.5px] font-mono border border-white/10 flex items-center gap-1.5 pointer-events-auto">
                <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
                <span>{currentSlide + 1} / {HERO_SLIDES.length}</span>
              </div>
            </div>

            {/* Left / Right Navigation Arrow Buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/30 hover:bg-black/65 text-white flex items-center justify-center transition-all opacity-70 group-hover:opacity-100 backdrop-blur-xs border border-white/20 hover:scale-105"
              title="Previous slide"
            >
              <ChevronLeft className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-2.5 top-1/2 -translate-y-1/2 z-20 w-8 h-8 sm:w-9 sm:h-9 rounded-full bg-black/30 hover:bg-black/65 text-white flex items-center justify-center transition-all opacity-70 group-hover:opacity-100 backdrop-blur-xs border border-white/20 hover:scale-105"
              title="Next slide"
            >
              <ChevronRight className="w-4 h-4 sm:w-5 sm:h-5" />
            </button>

            {/* Compact, Transparent Bottom Corner Floating Shelf */}
            <div className="absolute left-3 right-3 sm:right-auto sm:left-4 bottom-3 sm:bottom-4 max-w-sm sm:max-w-md p-2.5 sm:p-3 rounded-xl bg-black/30 backdrop-blur-xs border border-white/15 shadow-xl z-10">
              <div className="flex items-center justify-between gap-2 mb-0.5">
                <span className="text-[9px] font-bold text-amber-300/90 uppercase tracking-widest truncate">
                  {active.collection}
                </span>
                <span className="text-[9.5px] font-medium text-emerald-300/90 shrink-0">
                  {active.priceNote.split("•")[0]?.trim()}
                </span>
              </div>

              <h3 className="font-serif font-bold text-xs sm:text-sm text-white leading-snug drop-shadow-sm truncate">
                {active.title}
              </h3>

              <div className="mt-1.5 pt-1.5 border-t border-white/10 flex items-center justify-between gap-2.5">
                <p className="text-[10px] text-stone-200/90 truncate max-w-[200px] sm:max-w-[260px]">
                  {active.promoText}
                </p>
                <button
                  onClick={onExploreCreations}
                  className="px-2.5 py-1 bg-[#C5A059]/90 hover:bg-[#C5A059] text-stone-950 rounded-lg text-[9.5px] sm:text-[10px] font-bold uppercase tracking-wider transition-all shadow-xs flex items-center gap-1 shrink-0"
                >
                  <span>{active.ctaText}</span>
                  <ArrowRight className="w-3 h-3" />
                </button>
              </div>
            </div>
          </div>

          {/* Bottom Dot Indicators with Progress Highlight */}
          <div className="flex items-center justify-center gap-2 mt-3.5">
            {HERO_SLIDES.map((slide, idx) => (
              <button
                key={slide.id}
                onClick={() => setCurrentSlide(idx)}
                className={`transition-all rounded-full ${
                  idx === currentSlide
                    ? "w-8 h-2 bg-amber-600 shadow-sm"
                    : "w-2 h-2 bg-ariel-tan/40 hover:bg-ariel-tan"
                }`}
                title={`Go to ${slide.title}`}
              />
            ))}
          </div>
        </div>

        {/* Right Column on Desktop / Below on Mobile: Brand Story & Concierge */}
        <div className="lg:col-span-5 space-y-4 sm:space-y-5 text-center lg:text-left order-2">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ariel-sand border border-ariel-tan/40 text-[11px] font-bold text-ariel-cognac tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Singapore Atelier &bull; Handcrafted in Italy</span>
          </div>

          <h1 className="font-serif text-2xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ariel-espresso leading-[1.12]">
            Italian Leather. <br />
            Made for a Lifetime.
          </h1>

          <p className="text-xs sm:text-base text-gray-600 max-w-lg mx-auto lg:mx-0 font-normal leading-relaxed">
            Handcrafted leather goods in full-grain Tuscan hides, finished for modern Singapore.
            Each edge burnished by hand with natural waxes, double-needle saddle stitched, and eligible for complimentary bespoke hot-stamping.
          </p>

          {/* Action Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-2.5 sm:gap-3">
            <button
              onClick={onExploreCreations}
              className="w-full sm:w-auto px-6 py-3 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Shop Leather Goods</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={() => {
                const el = document.getElementById("monogram-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="w-full sm:w-auto px-5 py-3 bg-amber-100/70 hover:bg-amber-100 text-amber-950 border border-amber-300 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-xs flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-amber-700 group-hover:scale-110 transition-transform" />
              <span>Personalise a Piece</span>
            </button>

            <button
              onClick={onOpenConciergeSearch}
              className="w-full sm:w-auto px-4 py-3 bg-white/90 hover:bg-white text-ariel-espresso border border-ariel-tan/40 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-xs flex items-center justify-center gap-1.5"
              title="Concierge Search"
            >
              <span>Concierge</span>
            </button>
          </div>

          {/* Pillars of the Maison */}
          <div className="pt-4 sm:pt-5 grid grid-cols-3 gap-2 sm:gap-3 border-t border-ariel-tan/20 text-center lg:text-left">
            <div>
              <p className="font-serif text-base sm:text-xl font-bold text-ariel-espresso">100%</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Tuscan Full-Grain</p>
            </div>
            <div>
              <p className="font-serif text-base sm:text-xl font-bold text-ariel-espresso">Same-Day</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">EasyParcel Courier</p>
            </div>
            <div>
              <p className="font-serif text-base sm:text-xl font-bold text-ariel-espresso">Bespoke</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">24k Gold Monogram</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
