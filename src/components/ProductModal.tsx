"use client";

import React, { useState } from "react";
import { X, Star, Shield, Check, Plus, Gift, Compass } from "lucide-react";
import { RankedProduct } from "@/lib/search-engine";

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

  if (!product) return null;

  const currentImg = selectedImg || product.image_url;
  const price = currency === "SGD" ? `S$${product.price_sgd}` : `$${product.price_usd}`;

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
        <button
          onClick={onClose}
          className="absolute top-4 right-4 z-20 text-ariel-espresso bg-white/80 hover:bg-white p-2 rounded-full shadow-md transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Left Column: Image Gallery & Silhouette Discovery */}
        <div className="w-full md:w-1/2 p-6 bg-ariel-sand/30 flex flex-col justify-between">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-inner bg-white border border-ariel-tan/20 relative">
            <img
              src={currentImg}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-3 left-3 bg-ariel-espresso/90 text-ariel-sand px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
              {product.leather_type}
            </div>

            {/* Live Monogram Stamp Overlay Preview */}
            {enableMonogram && monogramText.trim() && (
              <div className="absolute bottom-4 right-4 bg-ariel-espresso/90 border border-ariel-gold/50 px-3 py-1.5 rounded-lg shadow-lg">
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

          {/* Gallery Thumbnails */}
          {product.gallery_images && product.gallery_images.length > 1 && (
            <div className="flex gap-2 mt-4">
              {product.gallery_images.map((img, i) => (
                <button
                  key={i}
                  onClick={() => setSelectedImg(img)}
                  className={`w-14 h-14 rounded-lg overflow-hidden border-2 transition-all ${
                    currentImg === img ? "border-ariel-amber shadow-md" : "border-transparent opacity-70 hover:opacity-100"
                  }`}
                >
                  <img src={img} alt="Thumb" className="w-full h-full object-cover" />
                </button>
              ))}
            </div>
          )}

          {/* Similar Discovery Trigger */}
          <div className="mt-4 pt-4 border-t border-ariel-tan/20">
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
          </div>
        </div>

        {/* Right Column: Craftsmanship & Customization */}
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

            {/* Price */}
            <div className="flex items-baseline gap-3 mb-4">
              <span className="text-2xl font-serif font-bold text-ariel-cognac">
                {price}
              </span>
              <span className="text-xs text-gray-400">
                {currency === "SGD" ? `(≈ USD $${product.price_usd})` : `(≈ SGD S$${product.price_sgd})`}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                In Stock &bull; Singapore Courier
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Complimentary Bespoke Monogramming Customizer */}
            <div className="bg-white p-4 rounded-2xl border border-ariel-tan/30 mb-4 space-y-3">
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

            {/* Artisanal Provenance */}
            <div className="bg-ariel-sand/40 p-3 rounded-xl border border-ariel-tan/20 mb-4 text-xs">
              <h4 className="font-bold text-ariel-cognac uppercase tracking-wider text-[11px] mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-ariel-amber" />
                Artisanal Provenance & Specifications
              </h4>
              <p className="text-gray-600 leading-normal mb-2">
                {product.craftsmanship_notes}
              </p>
              <div className="grid grid-cols-2 gap-2 text-[11px] text-gray-500">
                <div><span>Leather: </span><b className="text-ariel-espresso">{product.material}</b></div>
                <div><span>Hardware: </span><b className="text-ariel-espresso">{product.hardware}</b></div>
                <div><span>Dimensions: </span><b className="text-ariel-espresso">{product.dimensions}</b></div>
                <div><span>Weight: </span><b className="text-ariel-espresso">{product.weight_grams} g</b></div>
              </div>
            </div>
          </div>

          {/* Add to Bag Action */}
          <div className="pt-4 border-t border-ariel-tan/20">
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
