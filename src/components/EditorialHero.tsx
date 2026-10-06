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

      <div className="container mx-auto max-w-7xl px-4 py-8 sm:py-12 lg:py-14 grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-10 items-center relative z-10">
        {/* Left Column: Brand Story & Concierge (Reduced real estate: lg:col-span-5) */}
        <div className="lg:col-span-5 space-y-5 text-center lg:text-left">
          <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-ariel-sand border border-ariel-tan/40 text-[11px] font-bold text-ariel-cognac tracking-widest uppercase">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-600 animate-pulse" />
            <span>Florentine Provenance &bull; MBS #01-42 Flagship</span>
          </div>

          <h2 className="font-serif text-3xl sm:text-4xl lg:text-5xl font-bold tracking-tight text-ariel-espresso leading-[1.12]">
            Quiet Luxury. <br />
            Florentine Artistry.
          </h2>

          <p className="text-sm sm:text-base text-gray-600 max-w-lg mx-auto lg:mx-0 font-normal leading-relaxed">
            Handcrafted from certified Tuscan vegetable-tanned hides and English bridle leathers.
            Curated for discerning patrons across Marina Bay, Nassim Road, and Sentosa Cove.
          </p>

          {/* Action Buttons */}
          <div className="pt-1 flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3">
            <button
              onClick={onExploreCreations}
              className="w-full sm:w-auto px-6 py-3.5 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-md flex items-center justify-center gap-2"
            >
              <span>Explore Lookbook</span>
              <ArrowDown className="w-4 h-4" />
            </button>

            <button
              onClick={onOpenConciergeSearch}
              className="w-full sm:w-auto px-5 py-3.5 bg-white/90 hover:bg-white text-ariel-espresso border border-ariel-tan/40 rounded-xl text-xs font-bold tracking-widest uppercase transition-all shadow-xs flex items-center justify-center gap-2 group"
            >
              <Sparkles className="w-4 h-4 text-ariel-amber group-hover:scale-110 transition-transform" />
              <span>Atelier Concierge</span>
            </button>
          </div>

          {/* Pillars of the Maison */}
          <div className="pt-5 grid grid-cols-3 gap-3 border-t border-ariel-tan/20 text-center lg:text-left">
            <div>
              <p className="font-serif text-lg sm:text-xl font-bold text-ariel-espresso">100%</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">Tuscan Full-Grain</p>
            </div>
            <div>
              <p className="font-serif text-lg sm:text-xl font-bold text-ariel-espresso">Same-Day</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">EasyParcel Courier</p>
            </div>
            <div>
              <p className="font-serif text-lg sm:text-xl font-bold text-ariel-espresso">Bespoke</p>
              <p className="text-[10px] text-gray-500 uppercase tracking-wider font-semibold">24k Gold Monogram</p>
            </div>
          </div>
        </div>

        {/* Right Column: Hero Dynamic Collections & Promotions Slideshow (Expanded: lg:col-span-7) */}
        <div
          className="lg:col-span-7 relative"
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
                {/* Cinematic Vignette Gradient */}
                <div className="absolute inset-0 bg-gradient-to-t from-stone-950/90 via-stone-950/30 to-stone-950/20" />
              </div>
            ))}

            {/* Top Bar: Promotion Badge & Slideshow Counter */}
            <div className="absolute top-4 inset-x-4 flex items-center justify-between z-10">
              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-[10px] font-bold tracking-wider uppercase border backdrop-blur-md shadow-md flex items-center gap-1.5 ${active.tagColor}`}
                >
                  <Flame className="w-3 h-3 text-amber-400" />
                  <span>{active.tag}</span>
                </span>
                {active.promoCode && (
                  <span className="hidden sm:inline-flex px-2.5 py-1 rounded-full text-[9.5px] font-mono font-bold uppercase tracking-wider bg-black/60 text-amber-300 border border-amber-500/40 backdrop-blur-md">
                    Code: {active.promoCode}
                  </span>
                )}
              </div>

              {/* Pause/Live Indicator */}
              <div className="px-2.5 py-1 rounded-full bg-black/50 backdrop-blur-md text-stone-300 text-[10px] font-mono border border-white/10 flex items-center gap-1.5">
                <span className={`w-1.5 h-1.5 rounded-full ${isPaused ? "bg-amber-400" : "bg-emerald-400 animate-pulse"}`} />
                <span>{currentSlide + 1} / {HERO_SLIDES.length}</span>
              </div>
            </div>

            {/* Left / Right Navigation Arrow Buttons */}
            <button
              onClick={handlePrev}
              className="absolute left-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 backdrop-blur-sm border border-white/20 hover:scale-105"
              title="Previous slide"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              onClick={handleNext}
              className="absolute right-3 top-1/2 -translate-y-1/2 z-20 w-10 h-10 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition-all opacity-80 group-hover:opacity-100 backdrop-blur-sm border border-white/20 hover:scale-105"
              title="Next slide"
            >
              <ChevronRight className="w-5 h-5" />
            </button>

            {/* Bottom Shelf: Promotion Narrative & CTA Button */}
            <div className="absolute inset-x-4 bottom-4 p-4 sm:p-5 rounded-2xl bg-black/65 backdrop-blur-md border border-white/15 shadow-2xl z-10 flex flex-col sm:flex-row sm:items-end justify-between gap-3">
              <div className="space-y-1 max-w-md">
                <span className="text-[10px] font-bold text-amber-400 uppercase tracking-widest block">
                  {active.collection}
                </span>
                <h3 className="font-serif font-bold text-base sm:text-lg text-white leading-tight">
                  {active.title}
                </h3>
                <p className="text-xs text-stone-300 line-clamp-1 leading-normal">
                  {active.promoText}
                </p>
                <span className="text-[10px] font-medium text-emerald-400 block pt-0.5">
                  {active.priceNote}
                </span>
              </div>

              <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 shrink-0">
                <button
                  onClick={onExploreCreations}
                  className="w-full sm:w-auto px-4 py-2.5 bg-[#C5A059] hover:bg-[#b08e4c] text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-1.5 shrink-0"
                >
                  <span>{active.ctaText}</span>
                  <ArrowRight className="w-3.5 h-3.5" />
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
      </div>
    </section>
  );
}
