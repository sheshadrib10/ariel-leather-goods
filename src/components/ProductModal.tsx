"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import {
  X,
  Star,
  Shield,
  Check,
  Plus,
  Gift,
  Compass,
  ArrowRight,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { RankedProduct } from "@/lib/search-engine";
import { ShareButtons } from "./ShareButtons";

interface ProductModalProps {
  product: RankedProduct | null;
  currency: "SGD" | "USD";
  onClose: () => void;
  onAddToCartWithMonogram: (product: RankedProduct, monogram?: { text: string; foil: string }) => void;
  onFindSimilar: (product: RankedProduct) => void;
}

export function ProductModal({
  product,
  currency,
  onClose,
  onAddToCartWithMonogram,
  onFindSimilar,
}: ProductModalProps) {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [monogramText, setMonogramText] = useState("");
  const [monogramFoil, setMonogramFoil] = useState<"gold" | "blind" | "silver">("gold");
  const [enableMonogram, setEnableMonogram] = useState(false);
  const [added, setAdded] = useState(false);

  // Reset selected image when product changes
  useEffect(() => {
    if (product) {
      setSelectedImg(product.image_url);
    }
  }, [product?.id]);

  if (!product) return null;

  // Guarantee multiple gallery images for every product
  const fallbackAngles = [
    "https://images.unsplash.com/photo-1559563458-527698bf5295?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1549465220-1a8b9238cd48?auto=format&fit=crop&w=800&q=80",
    "https://images.unsplash.com/photo-1563245372-f21724e3856d?auto=format&fit=crop&w=800&q=80",
  ];

  const galleryList =
    product.gallery_images && product.gallery_images.length > 1
      ? product.gallery_images
      : [product.image_url, ...fallbackAngles];

  const currentImg = selectedImg || product.image_url;
  const currentIdx = galleryList.indexOf(currentImg) !== -1 ? galleryList.indexOf(currentImg) : 0;
  const price = currency === "SGD" ? `S$${product.price_sgd}` : `$${product.price_usd}`;

  const handlePrevImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    const prev = (currentIdx - 1 + galleryList.length) % galleryList.length;
    setSelectedImg(galleryList[prev]);
  };

  const handleNextImg = (e: React.MouseEvent) => {
    e.stopPropagation();
    const next = (currentIdx + 1) % galleryList.length;
    setSelectedImg(galleryList[next]);
  };

  const handleAdd = () => {
    onAddToCartWithMonogram(
      product,
      enableMonogram && monogramText.trim()
        ? { text: monogramText.trim().toUpperCase(), foil: monogramFoil }
        : undefined
    );
    setAdded(true);
    setTimeout(() => {
      setAdded(false);
      onClose();
    }, 1200);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-ariel-cream border border-ariel-tan/40 rounded-3xl w-full max-w-4xl max-h-[92vh] overflow-y-auto shadow-2xl relative flex flex-col md:flex-row overflow-hidden">
        {/* Top Control Bar: Share & Close */}
        <div className="absolute top-4 right-4 z-30 flex items-center gap-2">
          <ShareButtons product={product} variant="icon" />
          <button
            onClick={onClose}
            className="w-9 h-9 rounded-full bg-white/90 hover:bg-white text-ariel-espresso flex items-center justify-center shadow-md transition-all hover:scale-110"
            title="Close modal"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Left Column: Image Gallery, Multi-Angle Thumbnails & Silhouette Discovery */}
        <div className="w-full md:w-1/2 p-6 bg-ariel-sand/30 flex flex-col justify-between">
          <div>
            {/* Main Stage Image with Carousel Chevrons & Monogram Overlay */}
            <div className="aspect-square rounded-2xl overflow-hidden shadow-inner bg-white border border-ariel-tan/20 relative group">
              <img
                src={currentImg}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-all duration-300"
              />

              {/* Leather Provenance Tag */}
              <div className="absolute top-3 left-3 bg-ariel-espresso/90 text-ariel-sand px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider z-10 backdrop-blur-xs shadow-xs">
                {product.leather_type}
              </div>

              {/* Navigation Chevrons */}
              {galleryList.length > 1 && (
                <>
                  <button
                    type="button"
                    onClick={handlePrevImg}
                    className="absolute left-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition-all z-20 backdrop-blur-xs opacity-75 group-hover:opacity-100"
                    title="Previous angle"
                  >
                    <ChevronLeft className="w-4 h-4" />
                  </button>
                  <button
                    type="button"
                    onClick={handleNextImg}
                    className="absolute right-2.5 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/40 hover:bg-black/75 text-white flex items-center justify-center transition-all z-20 backdrop-blur-xs opacity-75 group-hover:opacity-100"
                    title="Next angle"
                  >
                    <ChevronRight className="w-4 h-4" />
                  </button>

                  {/* Angle Counter */}
                  <div className="absolute bottom-3 left-3 bg-black/55 text-white text-[10px] px-2.5 py-0.5 rounded-full font-mono backdrop-blur-xs z-10">
                    {currentIdx + 1} / {galleryList.length}
                  </div>
                </>
              )}

              {/* Live Monogram Stamp Overlay Preview */}
              {enableMonogram && monogramText.trim() && (
                <div className="absolute bottom-3 right-3 bg-ariel-espresso/90 border border-ariel-gold/50 px-3 py-1.5 rounded-lg shadow-lg z-10">
                  <span
                    className={`font-serif text-sm font-bold tracking-[0.2em] uppercase ${
                      monogramFoil === "gold"
                        ? "text-ariel-gold drop-shadow"
                        : monogramFoil === "silver"
                        ? "text-gray-200 drop-shadow"
                        : "text-amber-950 font-black"
                    }`}
                  >
                    {monogramText.toUpperCase()}
                  </span>
                </div>
              )}
            </div>

            {/* Gallery Thumbnails Strip (Always present with multiple perspectives) */}
            <div className="flex gap-2.5 mt-3.5 overflow-x-auto pb-1">
              {galleryList.map((img, i) => (
                <button
                  key={i}
                  type="button"
                  onClick={() => setSelectedImg(img)}
                  className={`w-14 h-14 sm:w-16 sm:h-16 rounded-xl overflow-hidden border-2 transition-all shrink-0 ${
                    currentImg === img
                      ? "border-ariel-amber ring-2 ring-ariel-amber/40 shadow-md scale-102"
                      : "border-ariel-tan/30 opacity-70 hover:opacity-100 hover:border-ariel-tan"
                  }`}
                  title={`View angle ${i + 1}`}
                >
                  <img src={img} alt={`Angle ${i + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          </div>

          {/* Similar Discovery Trigger & Full Product Page Link */}
          <div className="mt-4 pt-3.5 border-t border-ariel-tan/20 space-y-2">
            <button
              onClick={() => {
                onClose();
                onFindSimilar(product);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-ariel-tan/40 bg-white/80 hover:bg-white text-ariel-cognac text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-xs transition-all"
            >
              <Compass className="w-4 h-4 text-ariel-amber" />
              <span>Discover Creations with Matching Silhouette</span>
            </button>

            <Link
              href={`/products/${product.slug}`}
              onClick={onClose}
              className="w-full py-2 px-3 rounded-xl border border-transparent hover:border-ariel-tan/40 bg-white/50 hover:bg-white text-ariel-espresso text-xs font-semibold flex items-center justify-center gap-1.5 transition-all text-center"
            >
              <span>Explore Dedicated Page & Patron Reviews</span>
              <ArrowRight className="w-3.5 h-3.5 text-ariel-amber" />
            </Link>
          </div>
        </div>

        {/* Right Column: Craftsmanship, Customization & Specifications */}
        <div className="w-full md:w-1/2 p-6 sm:p-8 flex flex-col justify-between">
          <div>
            {/* Category & Rating */}
            <div className="flex items-center justify-between text-xs font-semibold text-ariel-saddle uppercase tracking-wider mb-2">
              <span>{product.category} &bull; {product.colour}</span>
              <div className="flex items-center gap-1 text-amber-500">
                <Star className="w-3.5 h-3.5 fill-current" />
                <span className="text-gray-800 font-bold">{product.rating}</span>
                <span className="text-gray-400">({product.review_count} reviews)</span>
              </div>
            </div>

            {/* Title */}
            <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ariel-espresso mb-2">
              {product.title}
            </h2>

            {/* Price & Singapore GST */}
            <div className="space-y-1.5 mb-4">
              <div className="flex items-baseline gap-3">
                <span className="text-2xl font-serif font-bold text-ariel-cognac">
                  {price}
                </span>
                <span className="text-xs text-gray-400">
                  {currency === "SGD" ? `(≈ USD $${product.price_usd})` : `(≈ SGD S$${product.price_sgd})`}
                </span>
                <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                  In Stock &bull; Singapore Dispatch
                </span>
              </div>
              <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
                <span className="text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                  Inclusive of 9% Singapore GST (Reg: 202619482M)
                </span>
                <span className="text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2 py-0.5 rounded-full">
                  Complimentary EasyParcel Delivery on S$150+
                </span>
              </div>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Complimentary Bespoke Monogramming Customizer */}
            <div className="bg-white p-4 rounded-2xl border border-ariel-tan/30 mb-4 space-y-3 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-ariel-amber" />
                  <span className="font-bold text-xs uppercase tracking-wider text-ariel-espresso">
                    Complimentary Monogramming
                  </span>
                </div>
                <input
                  type="checkbox"
                  checked={enableMonogram}
                  onChange={(e) => setEnableMonogram(e.target.checked)}
                  className="rounded accent-ariel-amber cursor-pointer"
                />
              </div>

              {enableMonogram && (
                <div className="pt-2 border-t border-gray-100 space-y-2">
                  <div className="flex gap-2">
                    <input
                      type="text"
                      maxLength={3}
                      value={monogramText}
                      onChange={(e) => setMonogramText(e.target.value.toUpperCase())}
                      placeholder="INITIALS (e.g. SB)"
                      className="w-1/2 text-center font-serif uppercase tracking-widest text-xs border border-ariel-tan/40 rounded-xl px-3 py-2 bg-ariel-sand/20"
                    />
                    <div className="w-1/2 flex gap-1">
                      {(["gold", "blind", "silver"] as const).map((foil) => (
                        <button
                          key={foil}
                          onClick={() => setMonogramFoil(foil)}
                          className={`flex-1 py-1 text-[10px] font-bold uppercase rounded-lg border transition-all ${
                            monogramFoil === foil
                              ? "bg-ariel-espresso text-ariel-sand border-ariel-espresso"
                              : "border-gray-200 text-gray-600 hover:bg-gray-50"
                          }`}
                        >
                          {foil === "blind" ? "Blind" : foil}
                        </button>
                      ))}
                    </div>
                  </div>
                  <p className="text-[10px] text-gray-400">
                    Hand-stamped in Florence with brass letterpress typefaces.
                  </p>
                </div>
              )}
            </div>

            {/* Artisanal Provenance & Specifications with Strict Columnar Alignment */}
            <div className="bg-ariel-sand/40 p-3.5 rounded-xl border border-ariel-tan/20 mb-4 text-xs">
              <h4 className="font-bold text-ariel-cognac uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-ariel-amber" />
                Artisanal Provenance & Specifications
              </h4>
              <p className="text-gray-600 leading-normal mb-2.5">
                {product.craftsmanship_notes}
              </p>
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-4 gap-y-2 text-[11px] pt-1.5 border-t border-ariel-tan/20">
                <div className="flex items-start gap-1.5">
                  <span className="text-gray-500 font-medium shrink-0 min-w-[70px]">Leather:</span>
                  <span className="font-semibold text-ariel-espresso flex-1 leading-snug">
                    {product.material}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-gray-500 font-medium shrink-0 min-w-[70px]">Hardware:</span>
                  <span className="font-semibold text-ariel-espresso flex-1 leading-snug">
                    {product.hardware}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-gray-500 font-medium shrink-0 min-w-[70px]">Dimensions:</span>
                  <span className="font-semibold text-ariel-espresso flex-1 leading-snug font-mono text-[10.5px]">
                    {product.dimensions}
                  </span>
                </div>
                <div className="flex items-start gap-1.5">
                  <span className="text-gray-500 font-medium shrink-0 min-w-[70px]">Weight:</span>
                  <span className="font-semibold text-ariel-espresso flex-1 leading-snug font-mono text-[10.5px]">
                    {product.weight_grams} g
                  </span>
                </div>
              </div>
            </div>

            {/* Social Share Strip */}
            <div className="flex items-center justify-between pb-3 text-xs">
              <span className="text-[11px] text-gray-500 font-semibold">Share creation:</span>
              <ShareButtons product={product} variant="inline" />
            </div>
          </div>

          {/* Add to Bag Action */}
          <div className="pt-3 border-t border-ariel-tan/20">
            <button
              onClick={handleAdd}
              className={`w-full py-4 px-6 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-4 h-4" />
                  <span>Added to Shopping Bag</span>
                </>
              ) : (
                <>
                  <Plus className="w-4 h-4" />
                  <span>Add to Shopping Bag &bull; {price}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
