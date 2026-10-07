"use client";

import React, { useState, useEffect } from "react";
import { Header, NAV_CATEGORIES } from "@/components/Header";
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
import { WhyArielSection } from "@/components/WhyArielSection";
import { InteractiveMonogramStudio } from "@/components/InteractiveMonogramStudio";
import { CustomerReviewsSection } from "@/components/CustomerReviewsSection";
import { RankedProduct, SearchResult } from "@/lib/search-engine";
import { PRODUCTS_CATALOG } from "@/lib/catalog-data";
import { MEDUSA_REGIONS } from "@/lib/medusa/store";
import { MedusaRegion } from "@/lib/medusa/types";
import { useAuth } from "@/lib/auth-context";
import { ArrowUpDown, Sparkles, Filter, ChevronRight, Star, Flame, ArrowRight, ShieldCheck } from "lucide-react";

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

  const { logSearchQuery } = useAuth();

  // Baseline ranked catalog generator ensuring products NEVER disappear or render empty on landing
  const getCatalogFallback = (categoryFilter: string = activeCategory): RankedProduct[] => {
    let prods = PRODUCTS_CATALOG;
    if (categoryFilter !== "all") {
      prods = prods.filter((p) => p.category === categoryFilter);
    }
    return prods.map((p) => ({
      ...p,
      ranking_breakdown: {
        final_score: p.popularity_score / 100,
        semantic_score: 0.92,
        filter_match_score: 1.0,
        popularity_score: p.popularity_score / 100,
        inventory_score: Math.min(1, p.inventory_count / 30),
        margin_score: p.margin_rate / 100,
        match_reasons: [`Artisanal Florentine leather: ${p.leather_type}`, `In stock (${p.inventory_count} units)`],
      },
    }));
  };

  // Search API execution with resilient instant fallback
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
      if (!res.ok) {
        throw new Error(`Search endpoint returned ${res.status}`);
      }
      const data = await res.json();

      if (!data.products || data.products.length === 0) {
        // If query was empty, don't show empty results — show category fallback
        if (!q.trim()) {
          const fallbackProds = getCatalogFallback(cat);
          setSearchResult({
            search_mode: "CONVENTIONAL_KEYWORD",
            query: "",
            intent: null,
            execution_steps: {
              step_1_intent: { status: "skipped", description: "Direct catalogue browse" },
              step_2_sql_filters: { status: "completed", applied_filters: ["In stock = true"], filtered_out_count: 0 },
              step_3_semantic_search: { status: "skipped", vector_provider: "Edge Index", phrase_embedded: "", dimensions: 1024 },
              step_4_ranking: { status: "completed", formula: "Catalogue popularity", weights: { semantic: "40%", exact_filters: "30%", popularity: "15%", inventory: "10%", margin: "5%" } },
            },
            products: fallbackProds,
            total_matches: fallbackProds.length,
            latency_ms: 1,
          });
          return;
        }
      }

      // Merge custom creations or updates published from Uncle's Admin Cockpit
      if (typeof window !== "undefined") {
        const saved = localStorage.getItem("ariel_admin_products_v2");
        if (saved && data.products) {
          try {
            const customProds = JSON.parse(saved);
            const updatedProducts = data.products.map((p: RankedProduct) => {
              const customMatch = customProds.find((cp: any) => cp.id === p.id);
              return customMatch ? { ...p, ...customMatch } : p;
            });
            customProds.forEach((cp: any) => {
              if (!updatedProducts.some((p: RankedProduct) => p.id === cp.id)) {
                if (cat === "all" || cp.category === cat) {
                  updatedProducts.unshift({
                    ...cp,
                    relevance_score: 0.99,
                    highlights: [cp.leather_type, `${cp.colour} Patina`],
                    why_recommended: "Newly published bespoke creation from the Florentine Atelier.",
                  } as RankedProduct);
                }
              }
            });
            data.products = updatedProducts;
            data.total_matches = updatedProducts.length;
          } catch (e) {
            console.warn("Failed merging custom products:", e);
          }
        }
      }

      setSearchResult(data);
      if (q.trim()) {
        logSearchQuery(q.trim(), data.products?.length || 0, mode);
      }
    } catch (err) {
      console.warn("Search API network notice, using local catalogue:", err);
      const fallbackProds = getCatalogFallback(cat);
      setSearchResult({
        search_mode: "CONVENTIONAL_KEYWORD",
        query: q,
        intent: null,
        execution_steps: {
          step_1_intent: { status: "skipped", description: "Direct catalogue browse" },
          step_2_sql_filters: { status: "completed", applied_filters: ["In stock = true"], filtered_out_count: 0 },
          step_3_semantic_search: { status: "skipped", vector_provider: "Edge Index", phrase_embedded: "", dimensions: 1024 },
          step_4_ranking: { status: "completed", formula: "Catalogue popularity", weights: { semantic: "40%", exact_filters: "30%", popularity: "15%", inventory: "10%", margin: "5%" } },
        },
        products: fallbackProds,
        total_matches: fallbackProds.length,
        latency_ms: 1,
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    performSearch("", "conventional", "all");
  }, []);

  const handleSelectCategory = (catId: string) => {
    setActiveCategory(catId);
    performSearch(searchResult?.query || "", "conventional", catId);
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

  // Safe product resolution: always default to static catalog if searchResult is still resolving
  let displayProducts =
    searchResult && searchResult.products && searchResult.products.length > 0
      ? [...searchResult.products]
      : getCatalogFallback(activeCategory);

  // Sorting
  if (sortBy === "price-asc") {
    displayProducts.sort((a, b) => a.price_sgd - b.price_sgd);
  } else if (sortBy === "price-desc") {
    displayProducts.sort((a, b) => b.price_sgd - a.price_sgd);
  } else if (sortBy === "popularity") {
    displayProducts.sort((a, b) => b.popularity_score - a.popularity_score);
  }

  // Curated Bestsellers for the immediate above-the-fold showcase
  const bestsellers = getCatalogFallback("all")
    .filter((p) => [1, 4, 6, 3].includes(p.id))
    .slice(0, 4);

  const totalCartCount = cartItems.reduce((acc, it) => acc + it.quantity, 0);

  return (
    <div className="flex-1 flex flex-col min-h-screen bg-ariel-cream text-ariel-espresso">
      {/* 1. Luxury Header Navigation (with Mobile Hamburger Drawer) */}
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

      {/* 3. Refined Editorial Lookbook Hero */}
      <EditorialHero
        onExploreCreations={() => {
          const el = document.getElementById("catalog-section");
          if (el) el.scrollIntoView({ behavior: "smooth" });
        }}
        onOpenConciergeSearch={() => setIsConciergeSearchOpen(true)}
      />

      {/* 4. Instant Bestsellers Showcase (Product -> Product -> Product immediately) */}
      <section className="py-12 sm:py-16 bg-white border-b border-ariel-tan/20">
        <div className="container mx-auto max-w-7xl px-4">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 mb-8">
            <div className="space-y-1">
              <div className="inline-flex items-center gap-1.5 text-[10px] font-bold tracking-[0.25em] uppercase text-ariel-saddle">
                <Flame className="w-3.5 h-3.5 text-amber-600" />
                <span>Most Coveted Creations</span>
              </div>
              <h2 className="font-serif text-2xl sm:text-3xl font-bold text-ariel-espresso">
                The Atelier Bestsellers
              </h2>
              <p className="text-xs sm:text-sm text-gray-500">
                Crafted in Florence, hot-stamped in Singapore. Our signature icons.
              </p>
            </div>

            <button
              onClick={() => {
                const el = document.getElementById("catalog-section");
                if (el) el.scrollIntoView({ behavior: "smooth" });
              }}
              className="text-xs font-bold uppercase tracking-wider text-ariel-saddle hover:text-ariel-espresso flex items-center gap-1 transition-colors self-start sm:self-auto"
            >
              <span>View All 16 Creations</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </button>
          </div>

          {/* 4-Card Bestseller Grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {bestsellers.map((prod) => (
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
        </div>
      </section>

      {/* 5. The Ariel Difference (5 Visual Pillars) */}
      <WhyArielSection />

      {/* 6. Interactive Monogram Studio ("Personalise Your Piece") */}
      <InteractiveMonogramStudio
        onSelectProductWithMonogram={(product, monogram) => {
          handleAddToCartWithMonogram(product, monogram);
        }}
      />

      {/* 7. Main Atelier Collection Catalog */}
      <main id="catalog-section" className="container mx-auto max-w-7xl px-4 py-14 sm:py-20 flex-1">
        {/* Section Title & Philosophy */}
        <div className="text-center max-w-2xl mx-auto mb-10 space-y-2">
          <span className="text-[10px] font-bold tracking-[0.3em] uppercase text-ariel-saddle">
            Complete Collection
          </span>
          <h2 className="font-serif text-3xl sm:text-4xl font-bold text-ariel-espresso">
            Handcrafted Masterpieces
          </h2>
          <p className="text-xs sm:text-sm text-gray-500 font-normal">
            Full-grain Tuscan hides, double-needle saddle stitching, and solid brass hallmarks.
            Every piece is eligible for complimentary bespoke hot-stamping and Singapore courier delivery.
          </p>
        </div>

        {/* Filter Tabs & Sorting Bar */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 py-3 mb-8 border-b border-ariel-tan/20">
          {/* Category Tabs */}
          <div className="flex items-center gap-1.5 overflow-x-auto pb-1 max-w-full no-scrollbar">
            {NAV_CATEGORIES.map((cat) => (
              <button
                key={cat.id}
                onClick={() => handleSelectCategory(cat.id)}
                className={`px-4 py-2 rounded-full text-xs font-semibold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  activeCategory === cat.id
                    ? "bg-ariel-espresso text-ariel-sand shadow-sm"
                    : "text-ariel-cognac/80 hover:text-ariel-espresso hover:bg-ariel-sand/60"
                }`}
              >
                <span>{cat.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-bold ${
                    activeCategory === cat.id
                      ? "bg-ariel-gold text-ariel-espresso"
                      : "bg-ariel-sand/70 text-ariel-cognac"
                  }`}
                >
                  {cat.count}
                </span>
              </button>
            ))}
          </div>

          {/* Sort Selector */}
          <div className="flex items-center gap-2 text-xs text-ariel-cognac font-medium self-end sm:self-auto shrink-0">
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
              onClick={() => performSearch("", "conventional", "all")}
              className="text-[11px] font-bold uppercase tracking-wider text-ariel-saddle hover:underline"
            >
              Clear &amp; View All
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
          <div className="text-center py-16 bg-white/70 rounded-3xl border border-ariel-tan/30 p-8 space-y-3 max-w-lg mx-auto">
            <p className="font-serif text-xl text-ariel-espresso">No creations match this specific search</p>
            <p className="text-xs text-gray-500">
              Try adjusting your search criteria or explore our complete handcrafted catalog below.
            </p>
            <button
              onClick={() => {
                setActiveCategory("all");
                performSearch("", "conventional", "all");
              }}
              className="mt-2 px-6 py-2.5 bg-ariel-espresso text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-widest hover:bg-ariel-cognac transition-colors"
            >
              View All 16 Creations
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

      {/* 8. Customer Reviews & Testimonials */}
      <CustomerReviewsSection />

      {/* 9. Heritage & Provenance Section */}
      <HeritageSection />

      {/* 10. Luxury Footer */}
      <footer className="bg-ariel-espresso text-ariel-sand/80 py-16 px-4 border-t border-ariel-saddle/30">
        <div className="container mx-auto max-w-7xl grid grid-cols-1 md:grid-cols-4 gap-10 text-xs">
          <div className="space-y-3">
            <h4 className="font-serif text-lg text-ariel-gold tracking-[0.25em] font-bold uppercase">
              ARIEL
            </h4>
            <p className="text-gray-400 leading-relaxed text-[11px]">
              Artisanal luxury leather goods crafted with timeless Florentine heritage. Designed in Singapore, crafted in Italy.
            </p>
            <div className="pt-2 text-gray-400 space-y-1 text-[11px]">
              <p>Singapore Atelier: 10 Bayfront Avenue, Marina Bay Sands #01-42</p>
              <p>Client Services: +65 6789 0123 &bull; Singapore Hub</p>
            </div>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-widest text-[11px]">Customer Atelier</h5>
            <ul className="space-y-2 text-gray-400 text-[11px]">
              <li>
                <button onClick={() => setIsAccountOpen(true)} className="hover:text-white transition-colors">
                  My Account &amp; Orders
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
              <li>Complimentary Courier in Singapore (Orders S$150+)</li>
              <li>HitPay PayNow SGQR &amp; Credit Card Settlement</li>
              <li>EasyParcel Same-Day Island-Wide Logistics</li>
              <li>
                <button onClick={() => setIsRegionModalOpen(true)} className="text-ariel-gold hover:underline">
                  Destination: {selectedRegion.name} ({selectedRegion.currency_code})
                </button>
              </li>
            </ul>
          </div>

          <div className="space-y-3">
            <h5 className="font-bold text-white uppercase tracking-widest text-[11px]">Atelier Club &amp; Tech</h5>
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
          &copy; {new Date().getFullYear()} Ariel Leather Goods. All rights reserved. &bull; Designed in Singapore, Handcrafted in Italy.
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
