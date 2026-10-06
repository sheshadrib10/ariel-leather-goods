"use client";

import React, { useState, useEffect } from "react";
import { Header } from "@/components/Header";
import { EditorialHero } from "@/components/EditorialHero";
import { AtelierConciergeSearch } from "@/components/AtelierConciergeSearch";
import { ProductCard } from "@/components/ProductCard";
import { ProductModal } from "@/components/ProductModal";
import { CartDrawer, CartItem } from "@/components/CartDrawer";
import { AccountModal } from "@/components/AccountModal";
import { MedusaOrderLookupModal } from "@/components/MedusaOrderLookupModal";
import { RegionSelectorModal } from "@/components/RegionSelectorModal";
import { TechnicalSpecsModal } from "@/components/TechnicalSpecsModal";
import { VisualSearchModal } from "@/components/VisualSearchModal";
import { HeritageSection } from "@/components/HeritageSection";
import { RankedProduct, SearchResult } from "@/lib/search-engine";
import { MEDUSA_REGIONS } from "@/lib/medusa/store";
import { MedusaRegion } from "@/lib/medusa/types";
import { ArrowUpDown, Sparkles, Filter, ChevronRight } from "lucide-react";

const CATEGORIES = [
  { id: "all", label: "All Creations" },
  { id: "wallet", label: "Wallets & Bifolds" },
  { id: "bag", label: "Bags & Briefcases" },
  { id: "belt", label: "Dress Belts" },
  { id: "card_holder", label: "Card Sleeves" },
  { id: "accessory", label: "Accessories & Folios" },
];

export default function HomePage() {
  const [searchResult, setSearchResult] = useState<SearchResult | null>(null);
  const [loading, setLoading] = useState(false);
  const [activeCategory, setActiveCategory] = useState("all");
  const [sortBy, setSortBy] = useState<"recommended" | "price-asc" | "price-desc" | "popularity">("recommended");

  // Medusa Region & Currency State
  const [selectedRegion, setSelectedRegion] = useState<MedusaRegion>(MEDUSA_REGIONS[0]);

  // Modals & Panels State
  const [isConciergeSearchOpen, setIsConciergeSearchOpen] = useState(false);
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [isOrderLookupOpen, setIsOrderLookupOpen] = useState(false);
  const [isRegionModalOpen, setIsRegionModalOpen] = useState(false);
  const [isTechSpecsOpen, setIsTechSpecsOpen] = useState(false);
  const [isVisualModalOpen, setIsVisualModalOpen] = useState(false);
  const [selectedProduct, setSelectedProduct] = useState<RankedProduct | null>(null);

  // Shopper Cart & Wishlist State
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<RankedProduct[]>([]);

  // Search API execution
  const performSearch = async (
    q: string = "",
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
    } catch (err) {
      console.error("Search failed:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch("");
  }, []);

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    performSearch(searchResult?.query || "", "auto", catId);
    const catalogElem = document.getElementById("catalog-section");
    if (catalogElem) {
      catalogElem.scrollIntoView({ behavior: "smooth" });
    }
  };

  const handleFindSimilar = async (product: RankedProduct) => {
    setLoading(true);
    try {
      const res = await fetch(`/api/similar?id=${product.id}`);
      const data = await res.json();
      if (data.similar_products) {
        setSearchResult({
          search_mode: "MULTIMODAL_SIMILAR",
          query: `Similar silhouette & patina: ${product.title}`,
          intent: null,
          execution_steps: {
            step_1_intent: { status: "completed", description: `Reference product: ${product.title}` },
            step_2_sql_filters: { status: "completed", applied_filters: ["In stock = true"], filtered_out_count: 1 },
            step_3_semantic_search: { status: "completed", vector_provider: "Atelier Bespoke Silhouette Engine", phrase_embedded: product.title, dimensions: 1024 },
            step_4_ranking: { status: "completed", formula: "Cosine vector similarity", weights: { semantic: "40%", exact_filters: "30%", popularity: "15%", inventory: "10%", margin: "5%" } }
          },
          products: data.similar_products,
          total_matches: data.similar_products.length,
          latency_ms: 15,
        });
        const catalogElem = document.getElementById("catalog-section");
        if (catalogElem) catalogElem.scrollIntoView({ behavior: "smooth" });
      }
    } catch (err) {
      console.error("Similar lookup failed:", err);
    } finally {
      setLoading(false);
    }
  };

  const handleAddToCartWithMonogram = (
    product: RankedProduct,
    monogram?: { text: string; foil: string }
  ) => {
    setCartItems((prev) => {
      const existing = prev.find(
        (it) => it.product.id === product.id && it.monogram?.text === monogram?.text && it.monogram?.foil === monogram?.foil
      );
      if (existing) {
        return prev.map((it) => (it === existing ? { ...it, quantity: it.quantity + 1 } : it));
      }
      return [...prev, { product, quantity: 1, monogram }];
    });
    setIsCartOpen(true);
  };

  const handleToggleWishlist = (product: RankedProduct) => {
    setWishlist((prev) => {
      const exists = prev.some((p) => p.id === product.id);
      if (exists) {
        return prev.filter((p) => p.id !== product.id);
      }
      return [...prev, product];
    });
  };

  const handleUpdateCartQuantity = (productId: number, qty: number) => {
    setCartItems((prev) =>
      prev.map((it) => (it.product.id === productId ? { ...it, quantity: qty } : it))
    );
  };

  const handleRemoveCartItem = (productId: number) => {
    setCartItems((prev) => prev.filter((it) => it.product.id !== productId));
  };

  // Sorting
  let displayProducts = searchResult ? [...searchResult.products] : [];
  if (sortBy === "price-asc") {
    displayProducts.sort((a, b) => a.price_sgd - b.price_sgd);
  } else if (sortBy === "price-desc") {
    displayProducts.sort((a, b) => b.price_sgd - a.price_sgd);
  } else if (sortBy === "popularity") {
    displayProducts.sort((a, b) => b.popularity_score - a.popularity_score);
  }

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-ariel-cream text-ariel-espresso">
      {/* 1. Luxury Header Navigation */}
      <Header
        cartCount={totalCartCount}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenSearch={() => setIsConciergeSearchOpen(true)}
        onOpenTechSpecs={() => setIsTechSpecsOpen(true)}
        currency={selectedRegion.currency_code === "SGD" ? "SGD" : "USD"}
        onToggleCurrency={() => setIsRegionModalOpen(true)}
        activeCategory={activeCategory}
        onSelectCategory={handleSelectCategory}
      />

      {/* 2. Atelier Concierge Search Overlay Drawer */}
      <AtelierConciergeSearch
        isOpen={isConciergeSearchOpen}
        onClose={() => setIsConciergeSearchOpen(false)}
        onSearch={(q, mode) => performSearch(q, mode)}
        searchResult={searchResult}
        isLoading={loading}
        onOpenVisualSearch={() => {
          setIsConciergeSearchOpen(false);
          setIsVisualModalOpen(true);
        }}
      />

      {/* 3. Editorial Luxury Lookbook Hero */}
      <EditorialHero
        onExploreCreations={() => {
          const el = document.getElementById("catalog-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        onOpenConciergeSearch={() => setIsConciergeSearchOpen(true)}
      />

      {/* 4. Main Catalog Section */}
      <main id="catalog-section" className="container mx-auto max-w-7xl px-4 py-12 sm:py-16 flex-1">
        {/* Section Title & Philosophy */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-ariel-saddle">
            The Atelier Collection
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ariel-espresso">
            Handcrafted Masterpieces
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-normal">
            Certified Tuscan hides, double-needle saddle stitching, and solid brass hallmarks.
            Every piece is eligible for complimentary bespoke hot-stamping.
          </p>
        </div>

        {/* Filter Tabs & Sorting Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 mb-8 border-b border-ariel-tan/20">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full">
            {CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all ${
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
            <span>Sort by:</span>
            <select
              value={sortBy}
              onChange={(e: any) => setSortBy(e.target.value)}
              className="bg-white border border-ariel-tan/30 rounded-xl px-3 py-1.5 text-xs font-semibold text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber cursor-pointer"
            >
              <option value="recommended">Curated Relevance</option>
              <option value="popularity">Most Coveted</option>
              <option value="price-asc">Price: Low to High</option>
              <option value="price-desc">Price: High to Low</option>
            </select>
          </div>
        </div>

        {/* Curation Notification Badge (If query active) */}
        {searchResult?.query && (
          <div className="mb-6 bg-ariel-sand/50 border border-ariel-tan/30 rounded-2xl p-4 flex items-center justify-between">
            <div className="text-xs text-ariel-espresso">
              <span>Showing results for: </span>
              <strong className="font-serif">&ldquo;{searchResult.query}&rdquo;</strong>
              <span className="text-gray-500 ml-2">({displayProducts.length} creations)</span>
            </div>
            <button
              onClick={() => performSearch("")}
              className="text-[11px] font-bold uppercase tracking-wider text-ariel-saddle hover:underline"
            >
              Clear & View All
            </button>
          </div>
        )}

        {/* Product Cards Grid */}
        {loading ? (
          <div className="text-center py-24 space-y-3">
            <div className="w-10 h-10 border-2 border-ariel-amber border-t-transparent rounded-full animate-spin mx-auto" />
            <p className="font-serif text-lg text-ariel-espresso">Consulting the Atelier Catalogue...</p>
            <p className="text-xs text-gray-400">Curating the finest leather creations for your request</p>
          </div>
        ) : displayProducts.length === 0 ? (
          <div className="text-center py-20 bg-white/70 rounded-3xl border border-ariel-tan/30 p-8 space-y-3">
            <p className="font-serif text-xl text-ariel-espresso">No creations currently match these criteria</p>
            <p className="text-xs text-gray-500 max-w-sm mx-auto">
              Our master craftsmen are continuously producing bespoke batches. Try adjusting your search query or budget.
            </p>
            <button
              onClick={() => performSearch("")}
              className="mt-2 px-6 py-2.5 bg-ariel-espresso text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-widest"
            >
              View Full Collection
            </button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6 sm:gap-8">
            {displayProducts.map((prod) => (
              <ProductCard
                key={prod.id}
                product={prod}
                currency={selectedRegion.currency_code === "SGD" ? "SGD" : "USD"}
                onQuickView={(p) => setSelectedProduct(p)}
                onAddToCart={(p) => handleAddToCartWithMonogram(p)}
                onFindSimilar={(p) => handleFindSimilar(p)}
                isWishlisted={wishlist.some((w) => w.id === prod.id)}
                onToggleWishlist={handleToggleWishlist}
              />
            ))}
          </div>
        )}
      </main>

      {/* 5. Heritage & Provenance Section */}
      <HeritageSection />

      {/* 6. Luxury Footer */}
      <footer className="bg-ariel-espresso text-ariel-sand/80 py-16 px-4 border-t border-ariel-saddle/30">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-10 text-xs">
          <div className="space-y-3">
            <h4 className="font-serif text-lg text-ariel-gold tracking-[0.25em] font-bold uppercase">
              ARIEL
            </h4>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Artisanal luxury leather goods crafted with timeless Florentine heritage. Curated for the modern executive.
            </p>
            <div className="pt-2 text-gray-400 space-y-1 text-[11px]">
              <p>Singapore Flagship: Marina Bay Sands #01-42</p>
              <p>Client Services: +65 6789 0123 &bull; Singapore Hub</p>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-widest text-[11px]">Customer Atelier</h5>
            <ul className="space-y-2 text-gray-400 text-[11px]">
              <li>
                <button onClick={() => setIsAccountOpen(true)} className="hover:text-white transition-colors">
                  My Account & Orders
                </button>
              </li>
              <li>
                <button onClick={() => setIsOrderLookupOpen(true)} className="hover:text-white transition-colors">
                  Track Singapore Courier Delivery
                </button>
              </li>
              <li>
                <button onClick={() => setIsOrderLookupOpen(true)} className="hover:text-white transition-colors">
                  Lifetime Stitching Repair Service
                </button>
              </li>
              <li>
                <button onClick={() => setIsAccountOpen(true)} className="hover:text-white transition-colors">
                  Saved Wishlist ({wishlist.length})
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-widest text-[11px]">Bespoke Services</h5>
            <ul className="space-y-2 text-gray-400 text-[11px]">
              <li>Complimentary 24k Gold Foil Monogramming</li>
              <li>Complimentary Same-Day Courier (Singapore)</li>
              <li>Consorzio Vera Pelle Italiana Certified</li>
              <li>30-Day White-Glove Returns</li>
              <li>
                <button onClick={() => setIsRegionModalOpen(true)} className="text-ariel-gold hover:underline">
                  Destination: {selectedRegion.name} ({selectedRegion.currency_code})
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-widest text-[11px]">Atelier Club & Tech</h5>
            <p className="text-gray-400 text-[11px]">
              Receive private previews of limited-run cordovan and Tuscan vachetta batches.
            </p>
            <div className="flex gap-2">
              <input
                type="email"
                placeholder="Enter email..."
                className="w-full bg-white/10 border border-white/20 rounded-xl px-3 py-2 text-xs text-white placeholder-gray-400 focus:outline-none"
              />
              <button className="px-4 py-2 bg-ariel-gold text-ariel-espresso font-bold uppercase rounded-xl text-[10px] tracking-wider shrink-0">
                Join
              </button>
            </div>
            <div className="pt-2 space-y-1">
              <a
                href="/admin"
                className="text-[11px] text-ariel-gold hover:underline font-semibold block"
              >
                &rarr; Seller Portal &bull; Merchant Cockpit (Singapore)
              </a>
              <button
                onClick={() => setIsTechSpecsOpen(true)}
                className="text-[10px] text-gray-500 hover:text-ariel-gold transition-colors flex items-center gap-1"
              >
                <Sparkles className="w-3 h-3 text-ariel-gold" />
                <span>Atelier Architecture Blueprint</span>
              </button>
            </div>
          </div>
        </div>

        <div className="container mx-auto max-w-7xl pt-10 mt-10 border-t border-white/10 text-center text-gray-500 text-[10px]">
          &copy; {new Date().getFullYear()} Ariel Leather Goods Pte. Ltd. (UEN: 202619482M). All rights reserved.
        </div>
      </footer>

      {/* Modals & Portals */}
      <ProductModal
        product={selectedProduct}
        currency={selectedRegion.currency_code === "SGD" ? "SGD" : "USD"}
        onClose={() => setSelectedProduct(null)}
        onAddToCartWithMonogram={handleAddToCartWithMonogram}
        onFindSimilar={handleFindSimilar}
      />

      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        currency={selectedRegion.currency_code === "SGD" ? "SGD" : "USD"}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={handleUpdateCartQuantity}
        onRemoveItem={handleRemoveCartItem}
      />

      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={(id) => setWishlist((prev) => prev.filter((p) => p.id !== id))}
        onAddToCart={(p) => handleAddToCartWithMonogram(p)}
      />

      <MedusaOrderLookupModal
        isOpen={isOrderLookupOpen}
        onClose={() => setIsOrderLookupOpen(false)}
      />

      <RegionSelectorModal
        isOpen={isRegionModalOpen}
        onClose={() => setIsRegionModalOpen(false)}
        selectedRegion={selectedRegion}
        onSelectRegion={(r) => setSelectedRegion(r)}
      />

      <TechnicalSpecsModal
        isOpen={isTechSpecsOpen}
        onClose={() => setIsTechSpecsOpen(false)}
      />

      <VisualSearchModal
        isOpen={isVisualModalOpen}
        onClose={() => setIsVisualModalOpen(false)}
        onExecuteVisualSearch={(title, mod) => performSearch(`${title} ${mod}`, "ai")}
      />
    </div>
  );
}
