"use client";

import React, { useState } from "react";
import { Heart, Plus, Check, Eye, Compass, Star } from "lucide-react";
import { RankedProduct } from "@/lib/search-engine";

interface ProductCardProps {
  product: RankedProduct;
  currency: "SGD" | "USD";
  onQuickView: (product: RankedProduct) => void;
  onAddToCart: (product: RankedProduct) => void;
  onFindSimilar: (product: RankedProduct) => void;
  isWishlisted: boolean;
  onToggleWishlist: (product: RankedProduct) => void;
}

export function ProductCard({
  product,
  currency,
  onQuickView,
  onAddToCart,
  onFindSimilar,
  isWishlisted,
  onToggleWishlist,
}: ProductCardProps) {
  const [added, setAdded] = useState(false);

  const price = currency === "SGD" ? `S$${product.price_sgd}` : `$${product.price_usd}`;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const handleWishlist = (e: React.MouseEvent) => {
    e.stopPropagation();
    onToggleWishlist(product);
  };

  return (
    <div
      onClick={() => onQuickView(product)}
      className="group cursor-pointer flex flex-col justify-between bg-white rounded-2xl border border-ariel-tan/20 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300"
    >
      {/* Product Imagery */}
      <div className="relative aspect-[4/3] bg-ariel-sand/30 overflow-hidden">
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10">
          <span className="px-2.5 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase bg-ariel-espresso/90 text-ariel-sand backdrop-blur-sm shadow-xs">
            {product.leather_type}
          </span>
        </div>

        {/* Wishlist Heart Button */}
        <button
          onClick={handleWishlist}
          className="absolute top-3 right-3 z-10 w-8 h-8 rounded-full bg-white/90 hover:bg-white text-ariel-espresso flex items-center justify-center shadow-md transition-all hover:scale-110"
          title={isWishlisted ? "Remove from wishlist" : "Add to wishlist"}
        >
          <Heart
            className={`w-4 h-4 transition-colors ${
              isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-gray-600"
            }`}
          />
        </button>

        {/* Hover Quick Actions */}
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
          <span className="px-4 py-2 bg-white/95 text-ariel-espresso rounded-xl text-xs font-bold tracking-wider uppercase shadow-lg flex items-center gap-1.5 backdrop-blur-xs">
            <Eye className="w-3.5 h-3.5 text-ariel-amber" />
            <span>Quick View</span>
          </span>
        </div>
      </div>

      {/* Product Information */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Color */}
          <div className="flex items-center justify-between text-[11px] text-ariel-saddle/80 font-medium tracking-wider uppercase mb-1">
            <span>{product.category} &bull; {product.colour}</span>
            <span className="text-[10px] text-gray-400 font-semibold tracking-normal">
              {product.rating} &starf;
            </span>
          </div>

          {/* Title */}
          <h3 className="font-serif text-base sm:text-lg font-bold text-ariel-espresso group-hover:text-ariel-saddle transition-colors line-clamp-1 mb-1">
            {product.title}
          </h3>

          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed mb-3">
            {product.description}
          </p>

          {/* Complimentary Monogramming Feature Tag */}
          <div className="flex items-center gap-2 mb-3">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/60 font-semibold">
              Complimentary Monogram
            </span>
            <span className="text-[10px] text-gray-400">
              Singapore Stock
            </span>
          </div>
        </div>

        {/* Price & Add to Bag Row */}
        <div className="pt-3 border-t border-ariel-tan/20 flex items-center justify-between">
          <div>
            <span className="font-serif text-base sm:text-lg font-bold text-ariel-espresso">
              {price}
            </span>
            <span className="block text-[10px] text-gray-400 font-medium">
              {currency === "SGD" ? `≈ USD $${product.price_usd}` : `≈ SGD S$${product.price_sgd}`}
            </span>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFindSimilar(product);
              }}
              className="p-2 text-gray-400 hover:text-ariel-espresso rounded-lg hover:bg-ariel-sand transition-colors"
              title="Show creations with matching silhouette or leather patina"
            >
              <Compass className="w-4 h-4 text-ariel-amber" />
            </button>

            <button
              onClick={handleAdd}
              disabled={!product.in_stock}
              className={`px-3.5 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-1 shadow-xs ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand"
              }`}
            >
              {added ? (
                <>
                  <Check className="w-3.5 h-3.5" />
                  <span>Added</span>
                </>
              ) : (
                <>
                  <Plus className="w-3.5 h-3.5" />
                  <span>Add</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
