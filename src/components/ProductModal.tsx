"use client";

import React, { useState } from "react";
import { X, Star, Shield, Check, Plus, Package, Sparkles, Compass } from "lucide-react";
import { RankedProduct } from "@/lib/search-engine";

interface ProductModalProps {
  product: RankedProduct | null;
  currency: "SGD" | "USD";
  onClose: () => void;
  onAddToCart: (product: RankedProduct) => void;
  onFindSimilar: (product: RankedProduct) => void;
}

export function ProductModal({
  product,
  currency,
  onClose,
  onAddToCart,
  onFindSimilar,
}: ProductModalProps) {
  const [selectedImg, setSelectedImg] = useState<string | null>(null);
  const [added, setAdded] = useState(false);

  if (!product) return null;

  const currentImg = selectedImg || product.image_url;
  const price = currency === "SGD" ? `S$${product.price_sgd}` : `$${product.price_usd}`;

  const handleAdd = () => {
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
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

        {/* Left Column: Image Gallery */}
        <div className="w-full md:w-1/2 p-6 bg-ariel-sand/30 flex flex-col justify-between">
          <div className="aspect-square rounded-2xl overflow-hidden shadow-inner bg-white border border-ariel-tan/20 relative">
            <img
              src={currentImg}
              alt={product.title}
              className="w-full h-full object-cover object-center"
            />
            <div className="absolute top-3 left-3 bg-ariel-espresso/90 text-ariel-goldLight px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider">
              {product.leather_type}
            </div>
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

          {/* Multimodal Quick Search button */}
          <div className="mt-4 pt-4 border-t border-ariel-tan/20">
            <button
              onClick={() => {
                onClose();
                onFindSimilar(product);
              }}
              className="w-full py-2.5 px-4 rounded-xl border border-ariel-amber/50 bg-white/80 hover:bg-white text-ariel-cognac text-xs font-bold uppercase tracking-wider flex items-center justify-center gap-2 shadow-sm transition-all"
            >
              <Compass className="w-4 h-4 text-ariel-amber" />
              <span>Find Semantically Similar Products</span>
            </button>
          </div>
        </div>

        {/* Right Column: Craftsmanship & Specs */}
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
              <span className="text-xs text-gray-500">
                {currency === "SGD" ? `(≈ USD $${product.price_usd})` : `(≈ SGD S$${product.price_sgd})`}
              </span>
              <span className="px-2 py-0.5 rounded text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                In Stock ({product.inventory_count} Available)
              </span>
            </div>

            {/* Description */}
            <p className="text-sm text-gray-600 leading-relaxed mb-4">
              {product.description}
            </p>

            {/* Craftsmanship Note */}
            <div className="bg-white/80 p-3.5 rounded-xl border border-ariel-tan/30 mb-4 text-xs text-ariel-espresso">
              <h4 className="font-bold text-ariel-cognac uppercase tracking-wider text-[11px] mb-1 flex items-center gap-1.5">
                <Shield className="w-3.5 h-3.5 text-ariel-amber" />
                Artisanal Hallmarks
              </h4>
              <p className="text-gray-600 leading-normal">
                {product.craftsmanship_notes}
              </p>
            </div>

            {/* Specifications Grid */}
            <div className="grid grid-cols-2 gap-2 text-xs mb-4 bg-ariel-sand/40 p-3 rounded-xl border border-ariel-tan/20">
              <div>
                <span className="text-gray-500 text-[11px]">Leather:</span>
                <p className="font-semibold text-ariel-espresso">{product.material}</p>
              </div>
              <div>
                <span className="text-gray-500 text-[11px]">Hardware:</span>
                <p className="font-semibold text-ariel-espresso">{product.hardware || "None"}</p>
              </div>
              <div>
                <span className="text-gray-500 text-[11px]">Dimensions:</span>
                <p className="font-semibold text-ariel-espresso">{product.dimensions}</p>
              </div>
              <div>
                <span className="text-gray-500 text-[11px]">Weight:</span>
                <p className="font-semibold text-ariel-espresso">{product.weight_grams} g</p>
              </div>
            </div>

            {/* Features Bullet List */}
            <div className="space-y-1 mb-6">
              <span className="text-[11px] font-bold text-ariel-saddle uppercase tracking-wider block mb-1">
                Distinguishing Features:
              </span>
              {product.features.map((feat, idx) => (
                <div key={idx} className="flex items-center gap-2 text-xs text-gray-700">
                  <Check className="w-3.5 h-3.5 text-ariel-amber shrink-0" />
                  <span>{feat}</span>
                </div>
              ))}
            </div>
          </div>

          {/* Add to Bag Action */}
          <div className="pt-4 border-t border-ariel-tan/20 flex gap-3">
            <button
              onClick={handleAdd}
              className={`w-full py-3.5 px-6 rounded-xl text-xs sm:text-sm font-bold uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2 ${
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
                  <span>Add to Bag &bull; {price}</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
