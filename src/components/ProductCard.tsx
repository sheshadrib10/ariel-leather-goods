"use client";

import React, { useState } from "react";
import { Star, Sparkles, Eye, Plus, Check, Compass, Layers } from "lucide-react";
import { RankedProduct } from "@/lib/search-engine";

interface ProductCardProps {
  product: RankedProduct;
  currency: "SGD" | "USD";
  onQuickView: (product: RankedProduct) => void;
  onAddToCart: (product: RankedProduct) => void;
  onFindSimilar: (product: RankedProduct) => void;
}

export function ProductCard({
  product,
  currency,
  onQuickView,
  onAddToCart,
  onFindSimilar,
}: ProductCardProps) {
  const [added, setAdded] = useState(false);
  const [showScoreModal, setShowScoreModal] = useState(false);

  const price = currency === "SGD" ? `S$${product.price_sgd}` : `$${product.price_usd}`;
  const breakdown = product.ranking_breakdown;

  const handleAdd = (e: React.MouseEvent) => {
    e.stopPropagation();
    onAddToCart(product);
    setAdded(true);
    setTimeout(() => setAdded(false), 1600);
  };

  const isLowStock = product.inventory_count <= 12;

  return (
    <div className="group luxury-card bg-white rounded-2xl border border-ariel-tan/30 overflow-hidden flex flex-col justify-between shadow-sm hover:border-ariel-amber/50 relative">
      {/* Product Image Area */}
      <div className="relative aspect-[4/3] bg-ariel-sand/30 overflow-hidden cursor-pointer" onClick={() => onQuickView(product)}>
        <img
          src={product.image_url}
          alt={product.title}
          className="w-full h-full object-cover object-center group-hover:scale-105 transition-transform duration-700 ease-out"
          loading="lazy"
        />

        {/* Top Badges */}
        <div className="absolute top-3 left-3 flex flex-col gap-1.5 z-10">
          <span className="px-2.5 py-1 rounded-md text-[10px] font-bold tracking-wider uppercase bg-ariel-espresso/90 text-ariel-goldLight backdrop-blur-sm shadow-sm">
            {product.leather_type}
          </span>
          {isLowStock && (
            <span className="px-2 py-0.5 rounded text-[9px] font-bold tracking-wider uppercase bg-amber-100 text-amber-900 border border-amber-300 shadow-sm">
              Only {product.inventory_count} left
            </span>
          )}
        </div>

        {/* AI Score Badge (if search breakdown present) */}
        {breakdown && (
          <div className="absolute top-3 right-3 z-10">
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowScoreModal(!showScoreModal);
              }}
              className="px-2.5 py-1 rounded-full text-[10px] font-bold tracking-wider bg-white/95 text-ariel-cognac border border-ariel-amber/40 shadow-md flex items-center gap-1 hover:bg-ariel-amber hover:text-white transition-colors"
              title="Click to view AI ranking breakdown"
            >
              <Sparkles className="w-3 h-3 text-ariel-amber group-hover:text-white" />
              <span>{(breakdown.final_score * 100).toFixed(0)}% Match</span>
            </button>
          </div>
        )}

        {/* Hover Quick Actions Overlay */}
        <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-2 p-4">
          <button
            onClick={(e) => {
              e.stopPropagation();
              onQuickView(product);
            }}
            className="p-2.5 bg-white text-ariel-espresso rounded-full shadow-lg hover:bg-ariel-espresso hover:text-white transition-all transform hover:scale-110"
            title="Quick View Details"
          >
            <Eye className="w-4 h-4" />
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              onFindSimilar(product);
            }}
            className="p-2.5 bg-white text-ariel-espresso rounded-full shadow-lg hover:bg-ariel-espresso hover:text-white transition-all transform hover:scale-110"
            title="Find Semantically Similar (Multimodal Vector Search)"
          >
            <Compass className="w-4 h-4 text-ariel-amber" />
          </button>
        </div>
      </div>

      {/* Product Content */}
      <div className="p-4 sm:p-5 flex-1 flex flex-col justify-between">
        <div>
          {/* Category & Color */}
          <div className="flex items-center justify-between text-[11px] text-ariel-saddle font-semibold uppercase tracking-wider mb-1">
            <span>{product.category} • {product.colour}</span>
            <div className="flex items-center gap-1 text-amber-500">
              <Star className="w-3 h-3 fill-current" />
              <span className="text-gray-700 font-bold">{product.rating}</span>
            </div>
          </div>

          {/* Product Title */}
          <h3
            onClick={() => onQuickView(product)}
            className="font-serif text-base sm:text-lg font-bold text-ariel-espresso hover:text-ariel-saddle transition-colors cursor-pointer line-clamp-1"
          >
            {product.title}
          </h3>

          <p className="text-xs text-gray-500 line-clamp-2 mt-1 mb-3">
            {product.description}
          </p>

          {/* Tags */}
          <div className="flex flex-wrap gap-1 mb-4">
            {product.features.slice(0, 2).map((feat, i) => (
              <span key={i} className="text-[10px] px-2 py-0.5 rounded bg-ariel-sand/60 text-ariel-cognac font-medium">
                {feat}
              </span>
            ))}
          </div>
        </div>

        {/* Price & Action Row */}
        <div className="pt-3 border-t border-ariel-tan/20 flex items-center justify-between">
          <div>
            <div className="text-base sm:text-lg font-serif font-bold text-ariel-espresso">
              {price}
            </div>
            <div className="text-[10px] text-gray-400 font-medium">
              {currency === "SGD" ? `≈ USD $${product.price_usd}` : `≈ SGD S$${product.price_sgd}`}
            </div>
          </div>

          <div className="flex items-center gap-1.5">
            <button
              onClick={(e) => {
                e.stopPropagation();
                onFindSimilar(product);
              }}
              className="p-2 text-xs font-semibold text-ariel-saddle hover:text-ariel-espresso rounded-lg hover:bg-ariel-sand/60 transition-colors"
              title="Show me products like this"
            >
              <Compass className="w-4 h-4 text-ariel-amber" />
            </button>

            <button
              onClick={handleAdd}
              disabled={!product.in_stock}
              className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold uppercase tracking-wider transition-all ${
                added
                  ? "bg-emerald-600 text-white"
                  : "bg-ariel-espresso text-ariel-sand hover:bg-ariel-cognac"
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

      {/* Floating Detailed AI Match Explainer */}
      {showScoreModal && breakdown && (
        <div className="absolute inset-x-2 bottom-2 bg-ariel-espresso text-ariel-sand p-4 rounded-xl shadow-2xl z-20 border border-ariel-gold/40 text-xs animate-fadeIn">
          <div className="flex items-center justify-between mb-2">
            <span className="font-bold text-ariel-gold flex items-center gap-1 text-[11px] uppercase tracking-wider">
              <Sparkles className="w-3 h-3" />
              Bedrock Scoring Breakdown
            </span>
            <button
              onClick={() => setShowScoreModal(false)}
              className="text-gray-400 hover:text-white text-xs px-1"
            >
              &times;
            </button>
          </div>
          <div className="space-y-1 font-mono text-[10px]">
            <div className="flex justify-between">
              <span>Semantic Similarity (40%):</span>
              <span className="text-ariel-gold font-bold">{(breakdown.semantic_score * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Exact Filter Match (30%):</span>
              <span className="text-ariel-gold font-bold">{(breakdown.filter_match_score * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Popularity (15%):</span>
              <span>{(breakdown.popularity_score * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Inventory Weight (10%):</span>
              <span>{(breakdown.inventory_score * 100).toFixed(1)}%</span>
            </div>
            <div className="flex justify-between">
              <span>Margin Rule (5%):</span>
              <span>{(breakdown.margin_score * 100).toFixed(1)}%</span>
            </div>
          </div>
          <div className="mt-2 pt-2 border-t border-white/10 text-[10px] text-gray-300">
            {breakdown.match_reasons.slice(0, 2).map((r, i) => (
              <div key={i}>&bull; {r}</div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
