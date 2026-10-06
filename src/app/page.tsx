"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { SearchHero } from "@/components/SearchHero";
import { AiReasoningPanel } from "@/components/AiReasoningPanel";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { CartDrawer, CartItem } from "@/components/CartDrawer";
import { BedrockStatusModal } from "@/components/BedrockStatusModal";
import { VisualSearchModal } from "@/components/VisualSearchModal";
import { RankedProduct, SearchResult } from "@/lib/search-engine";
import { SlidersHorizontal, ArrowUpDown, Sparkles, Compass, Shield } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Creations" },
  { id: "wallet", label: "Bifolds & Wallets" },
  { id: "bag", label: "Bags & Briefcases" },
  { id: "belt", label: "Dress Belts" },
  { id: "card_holder", label: "Card Sleeves" },
  { id: "accessory", label: "Accessories & Folios" },
];

export default function HomePage() {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [currentQuery, setCurrentQuery] = useState("");
  const [searchMode, setSearchMode] = useState<"auto" | "conventional" | "ai">("auto");
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"recommended" | "price-asc" | "price-desc" | "popularity">("recommended");
  const [currency, setCurrency] = useState<"SGD" | "USD">("SGD");

  // Modals & Drawers state
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isBedrockModalOpen, setIsBedrockModalOpen] = useState(false);
  const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RankedProduct | null>(null);

  // Initial Load & Search
  const performSearch = async (
    q: string,
    mode: "auto" | "conventional" | "ai" = "auto",
    cat: string = activeCategory
  ) => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (q) params.set("q", q);
      params.set("mode", mode);
      if (cat !== "all") params.set("category", cat);

      const res = await fetch(`/api/search?${params.toString()}`);
      const data = await res.json();
      setSearchResult(data);
      setCurrentQuery(q);
      setSearchMode(mode);
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch("");
  }, []);

  const handleCategoryChange = (catId: string) => {
    setActiveCategory(catId);
    performSearch(currentQuery, searchMode, catId);
  };

  const handleFindSimilar = async (product: RankedProduct) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/similar?id=${product.id}`);
      const data = await res.json();
      if (data.similar_products) {
        setSearchResult({
          search_mode: "MULTIMODAL_SIMILAR",
          query: `Similar to: ${product.title}`,
          intent: null,
          execution_steps: {
            step_1_intent: {
              status: "completed",
              description: `Extracted visual features & silhouette from reference product ID ${product.id}`,
            },
            step_2_sql_filters: {
              status: "completed",
              applied_filters: ["Excluded self reference", "in_stock = true"],
              filtered_out_count: 1,
            },
            step_3_semantic_search: {
              status: "completed",
              vector_provider: "Nova Multimodal / 1024-D Vector Space",
              phrase_embedded: product.title,
              dimensions: 1024,
            },
            step_4_ranking: {
              status: "completed",
              formula: "Cosine distance vector similarity to reference embedding",
              weights: {
                semantic: "40%",
                exact_filters: "30%",
                popularity: "15%",
                inventory: "10%",
                margin: "5%",
              },
            },
          },
          products: data.similar_products,
          total_matches: data.similar_products.length,
          latency_ms: 18,
        });
      }
    } catch (err) {
      console.error("Similar search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleExecuteVisualSearch = (imageTitle: string, modifier: string) => {
    const combined = `${imageTitle} ${modifier}`;
    performSearch(combined, "ai");
  };

  const handleAddToCart = (product: RankedProduct) => {
    setCartItems((prev) => {
      const existing = prev.find((item) => item.product.id === product.id);
      if (existing) {
        return prev.map((item) =>
          item.product.id === product.id ? { ...item, quantity: item.quantity + 1 } : item
        );
      }
      return [...prev, { product, quantity: 1 }];
    });
  };

  const handleUpdateQuantity = (productId: number, qty: number) => {
    setCartItems((prev) =>
      prev.map((item) => (item.product.id === productId ? { ...item, quantity: qty } : item))
    );
  };

  const handleRemoveItem = (productId: number) => {
    setCartItems((prev) => prev.filter((item) => item.product.id !== productId));
  };

  // Sort Products
  let displayProducts = searchResult ? [...searchResult.products] : [];
  if (sortBy === "price-asc") {
    displayProducts.sort((a, b) => a.price_sgd - b.price_sgd);
  } else if (sortBy === "price-desc") {
    displayProducts.sort((a, b) => b.price_sgd - a.price_sgd);
  } else if (sortBy === "popularity") {
    displayProducts.sort((a, b) => b.popularity_score - a.popularity_score);
  }

  const totalCartCount = cartItems.reduce((acc, item) => acc + item.quantity, 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-ariel-cream">
      {/* Navigation Header */}
      <Header
        cartCount={totalCartCount}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenBedrockModal={() => setIsBedrockModalOpen(true)}
        currency={currency}
        onToggleCurrency={() => setCurrency((c) => (c === "SGD" ? "USD" : "SGD"))}
      />

      {/* Main Search Hero with Bedrock Intent Switcher */}
      <SearchHero
        currentQuery={currentQuery}
        searchMode={searchMode}
        onSearch={(q, mode) => performSearch(q, mode)}
        onSelectSampleQuery={(q) => performSearch(q, "auto")}
        onOpenVisualSearch={() => setIsVisualModalOpen(true)}
        isLoading={loading}
      />

      {/* Real-time AI Reasoning Panel (Step 1-4 Trace) */}
      <AiReasoningPanel searchResult={searchResult} />

      {/* Catalog & Filter Section */}
      <main className="container mx-auto px-4 max-w-7xl flex-1 pb-16">
        {/* Controls Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-4 mb-6 border-b border-ariel-tan/20">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleCategoryChange(cat.id)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
                  activeCategory === cat.id
                    ? "bg-ariel-espresso text-ariel-sand shadow-sm"
                    : "text-ariel-cognac/80 hover:text-ariel-espresso hover:bg-ariel-sand/60"
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs text-ariel-cognac font-medium self-end sm:self-auto">
            <ArrowUpDown className="w-3.5 h-3.5 text-ariel-amber" />
            <span>Sort:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white border border-ariel-tan/30 rounded-lg px-2.5 py-1 text-xs font-semibold text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
            >
              <option value="recommended">Bedrock AI Relevance</option>
              <option value="popularity">Most Coveted (Popularity)</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Results Counter */}
        <div className="flex items-center justify-between mb-6">
          <p className="text-xs text-ariel-saddle font-semibold uppercase tracking-wider">
            Showing {displayProducts.length} Artisanal Creations
          </p>
          {searchResult?.search_mode && (
            <span className="text-[11px] text-gray-500 font-mono">
              Scoring: 40% Semantic &bull; 30% Filter &bull; 15% Pop &bull; 10% Stock &bull; 5% Margin
            </span>
          )}
        </div>

        {/* Products Grid */}
        {loading ? (
          <div className="text-center py-20">
            <div className="w-10 h-10 border-3 border-ariel-amber border-t-transparent rounded-full animate-spin mx-auto mb-4" />
            <p className="font-serif text-lg text-ariel-espresso">Consulting Amazon Bedrock Models...</p>
            <p className="text-xs text-ariel-saddle mt-1">Extracting intent and computing 1024-D pgvector similarities</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/70 rounded-2xl border border-ariel-tan/30 p-8">
            <p className="font-serif text-xl text-ariel-espresso mb-2">No creations matched this specific combination</p>
            <p className="text-xs text-gray-500 max-w-md mx-auto mb-6">
              Try refining your query, broadening your budget range, or clearing attribute constraints.
            </p>
            <button
              onClick={() => performSearch("")}
              className="px-6 py-2.5 bg-ariel-espresso text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider"
            >
              Reset to Full Catalogue
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
            {displayProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                currency={currency}
                onQuickView={(p) => setSelectedProduct(p)}
                onAddToCart={(p) => handleAddToCart(p)}
                onFindSimilar={(p) => handleFindSimilar(p)}
              />
            ))}
          </div>
        )}
      </main>

      {/* Brand Footer */}
      <footer className="bg-ariel-espresso text-ariel-sand/80 py-12 px-4 border-t border-ariel-saddle/30 mt-auto">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-8 text-xs">
          <div>
            <h4 className="font-serif text-base text-ariel-gold tracking-[0.2em] font-bold uppercase mb-2">
              ARIEL
            </h4>
            <p className="text-gray-400 leading-relaxed mb-4">
              Handcrafted in Florence & certified Tuscan tanneries. Artisanal heritage elevated by Amazon Bedrock artificial intelligence.
            </p>
            <div className="flex items-center gap-2 text-emerald-400 font-mono text-[11px]">
              <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
              <span>Bedrock Nova Micro + pgvector Live</span>
            </div>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Atelier Collections</h5>
            <ul className="space-y-2 text-gray-400">
              <li>Full-Grain Bifolds & Coat Wallets</li>
              <li>Executive Bridle Leather Briefcases</li>
              <li>Horween Chromexcel Weekend Duffles</li>
              <li>Reversible Sarto Dress Belts</li>
              <li>Triple Watch Rolls & Valet Trays</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Architecture & Stack</h5>
            <ul className="space-y-2 text-gray-400">
              <li>Amazon Bedrock (Nova Micro / Lite)</li>
              <li>Titan Text Embeddings V2 ($0.02 / 1M)</li>
              <li>PostgreSQL 17 + pgvector (1024-D)</li>
              <li>Next.js 14 App Router + Tailwind</li>
              <li>Dual Path Query Router (Index & Semantic)</li>
            </ul>
          </div>

          <div>
            <h5 className="font-bold text-white uppercase tracking-wider mb-3">Guarantees</h5>
            <p className="text-gray-400 mb-2">
              Every creation includes lifetime stitching repair warranty, certified vegetable-tanned provenance card, and rigid gift presentation.
            </p>
            <p className="text-ariel-gold text-[11px] font-semibold mt-4">
              &copy; {new Date().getFullYear()} Ariel Leather Goods. All rights reserved.
            </p>
          </div>
        </div>
      </footer>

      {/* Modals & Slide-outs */}
      <ProductModal
        product={selectedProduct}
        currency={currency}
        onClose={() => setSelectedProduct(null)}
        onAddToCart={(p) => handleAddToCart(p)}
        onFindSimilar={(p) => handleFindSimilar(p)}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        currency={currency}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
      />

      <BedrockStatusModal
        isOpen={isBedrockModalOpen}
        onClose={() => setIsBedrockModalOpen(false)}
      />

      <VisualSearchModal
        isOpen={isVisualModalOpen}
        onClose={() => setIsVisualModalOpen(false)}
        onExecuteVisualSearch={handleExecuteVisualSearch}
      />
    </div>
  );
}
