"use client";

import React, { useState } from "react";
import Link from "next/link";
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
    <div className="group flex flex-col h-full bg-white rounded-2xl border border-ariel-tan/20 overflow-hidden shadow-xs hover:shadow-lg transition-all duration-300">
      {/* Product Imagery */}
      <div className="relative aspect-[4/3] w-full bg-ariel-sand/30 overflow-hidden shrink-0">
        <Link href={`/products/${product.slug}`} className="block w-full h-full">
          <img
            src={product.image_url}
            alt={product.title}
            className="w-full h-full object-cover object-center group-hover:scale-104 transition-transform duration-700 ease-out"
            loading="lazy"
          />
        </Link>

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1 z-10 pointer-events-none">
          <span className="px-2.5 py-1 rounded-md text-[9px] font-bold tracking-widest uppercase bg-ariel-espresso/90 text-ariel-sand backdrop-blur-xs shadow-xs">
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
        <div className="absolute inset-0 bg-black/15 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4 pointer-events-none">
          <button
            onClick={() => onQuickView(product)}
            className="pointer-events-auto px-4 py-2 bg-white/95 hover:bg-white text-ariel-espresso rounded-xl text-xs font-bold tracking-wider uppercase shadow-lg flex items-center gap-1.5 backdrop-blur-xs transition-transform hover:scale-105"
          >
            <Eye className="w-3.5 h-3.5 text-ariel-amber" />
            <span>Quick View</span>
          </button>
        </div>
      </div>

      {/* Product Information Body with Strict Alignment */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        {/* Top Information Block */}
        <div className="flex-1 flex flex-col">
          {/* Row 1: Category & 5-Star Patron Rating */}
          <div className="flex items-center justify-between text-[11px] text-ariel-saddle/80 font-medium tracking-wider uppercase h-5 mb-1.5">
            <span className="truncate max-w-[130px] sm:max-w-[150px]">
              {product.category} &bull; {product.colour}
            </span>
            <div className="flex items-center gap-1 shrink-0">
              <div className="flex items-center text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-3 h-3 ${
                      star <= Math.round(product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-stone-200 text-stone-200"
                    }`}
                  />
                ))}
              </div>
              <span className="text-[10px] text-gray-800 font-bold ml-0.5">{product.rating.toFixed(1)}</span>
              <span className="text-[9.5px] text-gray-400 font-medium">({product.review_count})</span>
            </div>
          </div>

          {/* Row 2: Title */}
          <Link
            href={`/products/${product.slug}`}
            className="block font-serif text-base font-bold text-ariel-espresso hover:text-ariel-saddle transition-colors truncate h-6 mb-1.5 leading-snug"
            title={product.title}
          >
            {product.title}
          </Link>

          {/* Row 3: Description (Fixed 2 lines height) */}
          <p className="text-xs text-gray-500 line-clamp-2 leading-relaxed h-10 mb-3 overflow-hidden">
            {product.description}
          </p>

          {/* Row 4: Complimentary Monogramming Badge Row */}
          <div className="flex items-center gap-2 h-6 mb-3 shrink-0">
            <span className="text-[10px] px-2 py-0.5 rounded-full bg-amber-50 text-amber-900 border border-amber-200/60 font-semibold truncate">
              Complimentary Monogram
            </span>
            <span className="text-[10px] text-gray-400 shrink-0">
              Singapore Stock
            </span>
          </div>
        </div>

        {/* Bottom Block: Price & Actions with Baseline Lock */}
        <div className="pt-3 border-t border-ariel-tan/20 flex items-end justify-between min-h-[4rem] shrink-0">
          {/* Left: Pricing & Singapore Tax Notice */}
          <div className="flex flex-col justify-end">
            <span className="font-serif text-base sm:text-lg font-bold text-ariel-espresso leading-none mb-1">
              {price}
            </span>
            <span className="text-[9.5px] text-emerald-800 font-semibold leading-tight block">
              Incl. 9% SG GST &bull; EasyParcel SG
            </span>
            <span className="text-[9.5px] text-gray-400 font-medium leading-tight block">
              {currency === "SGD" ? `≈ USD $${product.price_usd}` : `≈ SGD S$${product.price_sgd}`}
            </span>
          </div>

          {/* Right: Actions */}
          <div className="flex items-center gap-1.5 shrink-0 self-end">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFindSimilar(product);
              }}
              className="h-8 w-8 text-gray-400 hover:text-ariel-espresso rounded-xl hover:bg-ariel-sand transition-colors flex items-center justify-center shrink-0 border border-transparent hover:border-ariel-tan/30"
              title="Show creations with matching silhouette or leather patina"
            >
              <Compass className="w-4 h-4 text-ariel-amber" />
            </button>

            <button
              onClick={handleAdd}
              disabled={!product.in_stock}
              className={`h-8 px-3.5 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center justify-center gap-1 shadow-xs shrink-0 ${
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
