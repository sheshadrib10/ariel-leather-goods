"use client";

import React, { useState, useEffect } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import {
  Heart,
  ShoppingBag,
  ArrowRight,
  ShieldCheck,
  Truck,
  Building,
  Sparkles,
  Star,
  Check,
  Compass,
  ChevronRight,
  Share2,
  Clock,
  Info,
  Gift,
  ArrowLeft,
  MessageSquare,
  CheckCircle2,
  User,
  PenLine,
  X,
} from "lucide-react";
import { Header } from "@/components/Header";
import { CartDrawer, CartItem } from "@/components/CartDrawer";
import { AccountModal } from "@/components/AccountModal";
import { PRODUCTS_CATALOG, Product, getProductBySlug, getComplementaryProducts } from "@/lib/catalog-data";
import { RankedProduct } from "@/lib/search-engine";
import { useAuth } from "@/lib/auth-context";
import { getReviewsForProduct, addReviewToProduct } from "@/lib/reviews-data";
import { ProductReview } from "@/lib/medusa/types";
import { ShareButtons } from "@/components/ShareButtons";

export const runtime = "edge";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { logSearchQuery } = useAuth();

  // Find product
  const [product, setProduct] = useState<Product | null>(null);
  const [activeImage, setActiveImage] = useState<string>("");
  const [selectedFoil, setSelectedFoil] = useState<"gold" | "blind" | "silver">("gold");
  const [monogramText, setMonogramText] = useState<string>("");
  const [enableMonogram, setEnableMonogram] = useState<boolean>(true);
  const [quantity, setQuantity] = useState<number>(1);
  const [currency, setCurrency] = useState<"SGD" | "USD">("SGD");
  const [isWishlisted, setIsWishlisted] = useState<boolean>(false);
  const [addedNotice, setAddedNotice] = useState<boolean>(false);

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<RankedProduct[]>([]);

  // Complementary recommendations
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  // Reviews state
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState(false);
  const [newReviewForm, setNewReviewForm] = useState({
    rating: 5,
    title: "",
    content: "",
    author_name: "",
    author_location: "Singapore",
    monogram_ordered: "",
  });
  const [reviewSubmitSuccess, setReviewSubmitSuccess] = useState(false);

  useEffect(() => {
    if (!slug) return;
    let catalog = PRODUCTS_CATALOG;
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("ariel_admin_products_v2");
      if (saved) {
        try {
          catalog = JSON.parse(saved);
        } catch (e) {}
      }
    }
    const found =
      catalog.find((p) => p.slug === slug || p.slug.toLowerCase() === slug.toLowerCase() || p.id === Number(slug)) ||
      getProductBySlug(slug) ||
      PRODUCTS_CATALOG.find((p) => p.id === Number(slug));

    if (found) {
      setProduct(found);
      setActiveImage(found.image_url);
      setRecommendations(getComplementaryProducts(found, 4));
      // Load real verified patron reviews
      const prodReviews = getReviewsForProduct(found.id, found.slug);
      setReviews(prodReviews);
      // Log view to customer journey
      logSearchQuery(`Viewed product: ${found.title}`, 1, "auto");
    }
  }, [slug]);

  const handleReviewSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!product || !newReviewForm.content.trim()) return;
    const created = addReviewToProduct({
      product_id: product.id,
      product_slug: product.slug,
      author_name: newReviewForm.author_name.trim() || "Verified Patron",
      author_location: newReviewForm.author_location.trim() || "Singapore",
      rating: newReviewForm.rating,
      title: newReviewForm.title.trim() || "Artisanal Perfection",
      content: newReviewForm.content.trim(),
      verified_purchase: true,
      monogram_ordered:
        newReviewForm.monogram_ordered.trim() ||
        (enableMonogram && monogramText ? `${monogramText} (${selectedFoil})` : undefined),
    });
    setReviews((prev) => [created, ...prev]);
    setReviewSubmitSuccess(true);
    setTimeout(() => {
      setReviewSubmitSuccess(false);
      setIsWriteReviewOpen(false);
      setNewReviewForm({
        rating: 5,
        title: "",
        content: "",
        author_name: "",
        author_location: "Singapore",
        monogram_ordered: "",
      });
    }, 1200);
  };

  if (!product) {
    return (
      <div className="min-h-screen bg-ariel-cream flex flex-col justify-between">
        <Header
          cartCount={cartItems.length}
          wishlistCount={wishlist.length}
          onOpenCart={() => setIsCartOpen(true)}
          onOpenAccount={() => setIsAccountOpen(true)}
          onOpenSearch={() => router.push("/")}
          onOpenTechSpecs={() => {}}
          currency={currency}
          onToggleCurrency={() => setCurrency((c) => (c === "SGD" ? "USD" : "SGD"))}
          activeCategory="all"
          onSelectCategory={() => router.push("/")}
        />
        <div className="container mx-auto px-4 py-32 text-center">
          <h2 className="font-serif text-3xl font-bold text-ariel-espresso mb-4">Masterpiece Not Found</h2>
          <p className="text-gray-600 mb-6">The requested leather creation does not exist or has been archived.</p>
          <Link
            href="/"
            className="px-6 py-3 bg-ariel-espresso text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider hover:bg-ariel-cognac transition-colors inline-flex items-center gap-2"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Return to Atelier Lookbook</span>
          </Link>
        </div>
      </div>
    );
  }

  // Price calculation
  const price = currency === "SGD" ? `S$${product.price_sgd}` : `$${product.price_usd}`;
  const subtotalPrice = (currency === "SGD" ? product.price_sgd : product.price_usd) * quantity;

  // Add to cart
  const handleAddToCart = (directCheckout: boolean = false) => {
    const newItem: CartItem = {
      product: product as unknown as RankedProduct,
      quantity,
      monogram:
        enableMonogram && monogramText.trim()
          ? { text: monogramText.trim().toUpperCase(), foil: selectedFoil }
          : undefined,
    };

    setCartItems((prev) => {
      const idx = prev.findIndex((i) => i.product.id === product.id);
      if (idx !== -1) {
        const copy = [...prev];
        copy[idx].quantity += quantity;
        return copy;
      }
      return [...prev, newItem];
    });

    setAddedNotice(true);
    setTimeout(() => setAddedNotice(false), 2000);
    setIsCartOpen(true);
  };

  const handleToggleWishlist = () => {
    setIsWishlisted(!isWishlisted);
    if (!isWishlisted) {
      setWishlist((prev) => [...prev, product as unknown as RankedProduct]);
    } else {
      setWishlist((prev) => prev.filter((p) => p.id !== product.id));
    }
  };

  const galleryList = product.gallery_images && product.gallery_images.length > 0
    ? product.gallery_images
    : [product.image_url];

  return (
    <div className="min-h-screen bg-ariel-cream flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Top Header */}
      <Header
        cartCount={cartItems.length}
        wishlistCount={wishlist.length}
        onOpenCart={() => setIsCartOpen(true)}
        onOpenAccount={() => setIsAccountOpen(true)}
        onOpenSearch={() => router.push("/")}
        onOpenTechSpecs={() => {}}
        currency={currency}
        onToggleCurrency={() => setCurrency((c) => (c === "SGD" ? "USD" : "SGD"))}
        activeCategory={product.category}
        onSelectCategory={() => router.push("/")}
      />

      {/* Breadcrumb Navigation */}
      <div className="bg-white/60 border-b border-ariel-tan/20 py-2.5 px-4 text-xs text-gray-500">
        <div className="container mx-auto max-w-7xl flex items-center gap-2">
          <Link href="/" className="hover:text-ariel-espresso transition-colors">
            Atelier Home
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <Link href="/" className="capitalize hover:text-ariel-espresso transition-colors">
            {product.category}s
          </Link>
          <ChevronRight className="w-3.5 h-3.5 text-gray-400" />
          <span className="font-semibold text-ariel-espresso truncate">{product.title}</span>
        </div>
      </div>

      {/* Main Product Showcase */}
      <main className="container mx-auto max-w-7xl px-4 py-8 sm:py-12 flex-1">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-12">
          {/* LEFT COLUMN: MULTI-IMAGE GALLERY (7 cols) */}
          <div className="lg:col-span-7 space-y-4">
            {/* Main Stage Image with Monogram Visualizer Overlay */}
            <div className="relative aspect-[4/3] rounded-3xl overflow-hidden bg-white border border-ariel-tan/40 shadow-md group">
              <img
                src={activeImage}
                alt={product.title}
                className="w-full h-full object-cover object-center transition-all duration-700"
              />

              {/* Provenance Badges */}
              <div className="absolute top-4 left-4 flex flex-col gap-1.5 z-10">
                <span className="px-3 py-1 rounded-full text-[10px] font-bold tracking-widest uppercase bg-ariel-espresso/90 text-ariel-sand backdrop-blur-xs shadow-xs">
                  {product.leather_type}
                </span>
                <span className="px-2.5 py-0.5 rounded-full text-[9px] font-bold tracking-wider uppercase bg-amber-50/90 text-amber-900 border border-amber-200 backdrop-blur-xs shadow-xs">
                  Florentine Guild Certified
                </span>
              </div>

              {/* Action Buttons: Share & Wishlist */}
              <div className="absolute top-4 right-4 z-10 flex items-center gap-2">
                <ShareButtons product={product} variant="icon" className="w-10 h-10" />
                <button
                  onClick={handleToggleWishlist}
                  className="w-10 h-10 rounded-full bg-white/90 hover:bg-white text-ariel-espresso flex items-center justify-center shadow-md transition-all hover:scale-110"
                  title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
                >
                  <Heart
                    className={`w-5 h-5 transition-colors ${
                      isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-gray-600"
                    }`}
                  />
                </button>
              </div>

              {/* Live Bespoke Hot-Stamping Monogram Visualizer Overlay */}
              {enableMonogram && monogramText.trim() && (
                <div className="absolute bottom-6 right-6 z-10 pointer-events-none transition-all animate-fadeIn">
                  <div className="bg-black/60 backdrop-blur-md px-3.5 py-1.5 rounded-xl border border-white/20 shadow-xl flex items-center gap-2">
                    <span className="text-[9px] uppercase tracking-widest text-gray-300 font-semibold">
                      Hot-Stamped
                    </span>
                    <span
                      className={`font-serif text-lg font-bold tracking-[0.25em] ${
                        selectedFoil === "gold"
                          ? "text-[#F5D061] drop-shadow-[0_2px_4px_rgba(245,208,97,0.5)]"
                          : selectedFoil === "silver"
                          ? "text-[#E0E6ED] drop-shadow-[0_2px_4px_rgba(224,230,237,0.5)]"
                          : "text-stone-300 drop-shadow-[inset_0_1px_2px_rgba(0,0,0,0.8)]"
                      }`}
                    >
                      {monogramText.toUpperCase()}
                    </span>
                  </div>
                </div>
              )}
            </div>

            {/* Thumbnail Gallery Carousel */}
            <div className="flex gap-3 overflow-x-auto pb-2">
              {galleryList.map((img, idx) => (
                <button
                  key={idx}
                  onClick={() => setActiveImage(img)}
                  className={`w-20 h-20 rounded-2xl overflow-hidden border-2 transition-all shrink-0 ${
                    activeImage === img
                      ? "border-ariel-amber shadow-md scale-102"
                      : "border-ariel-tan/40 opacity-70 hover:opacity-100 hover:border-ariel-tan"
                  }`}
                >
                  <img src={img} alt={`Angle ${idx + 1}`} className="w-full h-full object-cover" />
                </button>
              ))}
            </div>

            {/* Craftsmanship Guarantee Strip */}
            <div className="grid grid-cols-3 gap-3 pt-3">
              <div className="p-3 bg-white rounded-2xl border border-ariel-tan/30 text-center space-y-1">
                <ShieldCheck className="w-4 h-4 mx-auto text-emerald-600" />
                <span className="font-bold text-[11px] text-gray-800 block">Lifetime Guarantee</span>
                <span className="text-[10px] text-gray-500 block">Double-saddle Serafil stitching</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-ariel-tan/30 text-center space-y-1">
                <Truck className="w-4 h-4 mx-auto text-ariel-amber" />
                <span className="font-bold text-[11px] text-gray-800 block">EasyParcel Same-Day</span>
                <span className="text-[10px] text-gray-500 block">Singapore white-glove direct</span>
              </div>
              <div className="p-3 bg-white rounded-2xl border border-ariel-tan/30 text-center space-y-1">
                <Building className="w-4 h-4 mx-auto text-ariel-cognac" />
                <span className="font-bold text-[11px] text-gray-800 block">MBS Boutique Salon</span>
                <span className="text-[10px] text-gray-500 block">Ready in 2h (#01-42)</span>
              </div>
            </div>
          </div>

          {/* RIGHT COLUMN: PRODUCT SPECIFICATIONS & BESPOKE CUSTOMIZATION (5 cols) */}
          <div className="lg:col-span-5 space-y-6">
            <div>
              {/* Category, Colour & Rating */}
              <div className="flex items-center justify-between text-xs font-semibold text-ariel-saddle uppercase tracking-wider mb-2">
                <span>{product.category} &bull; {product.colour}</span>
                <div className="flex items-center gap-1 text-amber-500">
                  <Star className="w-3.5 h-3.5 fill-current" />
                  <span className="text-gray-800 font-bold">{product.rating}</span>
                  <span className="text-gray-400">({product.review_count} verified reviews)</span>
                </div>
              </div>

              {/* Title */}
              <h1 className="font-serif text-3xl sm:text-4xl font-bold text-ariel-espresso tracking-tight mb-3">
                {product.title}
              </h1>

              {/* Price & Singapore 9% GST Badge */}
              <div className="space-y-2 pb-4 border-b border-ariel-tan/20">
                <div className="flex items-baseline gap-3">
                  <span className="font-serif text-3xl font-bold text-ariel-cognac">{price}</span>
                  <span className="text-xs text-gray-400 font-mono">
                    {currency === "SGD" ? `(≈ USD $${product.price_usd})` : `(≈ SGD S$${product.price_sgd})`}
                  </span>
                  <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    {product.in_stock ? "In Stock • Singapore Salon" : "Made to Order"}
                  </span>
                </div>

                {/* Regulatory Tax & Delivery Badges */}
                <div className="flex flex-wrap items-center gap-2 text-[10.5px]">
                  <span className="text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Info className="w-3 h-3 text-emerald-600" />
                    <span>Inclusive of 9% Singapore GST (Reg: 202619482M)</span>
                  </span>
                  <span className="text-amber-800 font-semibold bg-amber-50 border border-amber-200 px-2.5 py-0.5 rounded-full flex items-center gap-1">
                    <Truck className="w-3 h-3 text-amber-600" />
                    <span>Complimentary EasyParcel Delivery on S$150+</span>
                  </span>
                </div>
              </div>

              {/* Storytelling Narrative Description */}
              <p className="text-sm text-gray-700 leading-relaxed pt-4 pb-2">
                {product.description}
              </p>
              <p className="text-xs text-gray-500 italic pb-4 border-b border-ariel-tan/20">
                &ldquo;{product.craftsmanship_notes}&rdquo;
              </p>
            </div>

            {/* Bespoke Hot-Stamping Customizer Card */}
            <div className="bg-white p-5 rounded-2xl border border-ariel-tan/30 space-y-3.5 shadow-2xs">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <Gift className="w-4 h-4 text-ariel-amber" />
                  <span className="font-bold text-xs uppercase tracking-wider text-ariel-espresso">
                    Complimentary Hot-Stamping Monogram
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
                <div className="space-y-3 pt-2 border-t border-gray-100 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                      Initials (Max 3 Characters)
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={monogramText}
                      onChange={(e) => setMonogramText(e.target.value.toUpperCase())}
                      placeholder="e.g. SB"
                      className="w-full bg-ariel-sand/30 border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso font-mono font-bold text-sm tracking-widest uppercase focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                      Foil Finish
                    </label>
                    <div className="grid grid-cols-3 gap-2">
                      {[
                        { id: "gold", label: "Tuscan 24k Gold", color: "bg-[#F5D061]" },
                        { id: "blind", label: "Blind Deboss", color: "bg-stone-700" },
                        { id: "silver", label: "Florentine Silver", color: "bg-[#E0E6ED]" },
                      ].map((foil) => (
                        <button
                          key={foil.id}
                          type="button"
                          onClick={() => setSelectedFoil(foil.id as any)}
                          className={`p-2 rounded-xl border text-[11px] font-semibold flex items-center justify-center gap-1.5 transition-all ${
                            selectedFoil === foil.id
                              ? "border-ariel-espresso bg-ariel-espresso text-ariel-sand shadow-xs"
                              : "border-gray-200 bg-white text-gray-700 hover:border-gray-400"
                          }`}
                        >
                          <span className={`w-2.5 h-2.5 rounded-full ${foil.color}`} />
                          <span>{foil.label}</span>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            {/* Quantity & CTA Buttons */}
            <div className="space-y-3 pt-2">
              <div className="flex gap-3 items-center">
                <div className="flex items-center border border-gray-300 rounded-xl overflow-hidden bg-white shrink-0">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100"
                  >
                    -
                  </button>
                  <span className="px-3 text-xs font-bold font-mono">{quantity}</span>
                  <button
                    onClick={() => setQuantity(quantity + 1)}
                    className="px-3 py-2.5 text-xs text-gray-600 hover:bg-gray-100"
                  >
                    +
                  </button>
                </div>

                <button
                  onClick={() => handleAddToCart(false)}
                  className="flex-1 py-3.5 px-6 rounded-xl bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
                >
                  <ShoppingBag className="w-4 h-4 text-ariel-amber" />
                  <span>Add to Shopping Bag • {currency === "SGD" ? "S$" : "$"}{subtotalPrice}</span>
                </button>
              </div>

              {/* Direct HitPay Checkout Button */}
              <button
                onClick={() => {
                  handleAddToCart(true);
                }}
                className="w-full py-3 px-6 rounded-xl bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold text-xs uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2"
              >
                <span>Instant Checkout (HitPay PayNow SGQR)</span>
                <ArrowRight className="w-4 h-4" />
              </button>

              {/* Social & Private Comms Share Strip */}
              <div className="pt-2 flex items-center justify-between text-xs">
                <span className="text-[11px] text-gray-500 font-semibold">Share creation:</span>
                <ShareButtons product={product} variant="inline" />
              </div>
            </div>

            {/* Technical Specifications Accordion */}
            <div className="bg-white p-5 rounded-2xl border border-ariel-tan/30 space-y-3 text-xs">
              <h4 className="font-bold text-ariel-espresso uppercase tracking-wider text-[11px] pb-2 border-b border-gray-100">
                Atelier Specifications & Craftsmanship
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-2.5 text-xs text-gray-600">
                <div className="flex items-start gap-2">
                  <span className="text-[11px] font-medium text-gray-400 shrink-0 min-w-[72px]">Leather:</span>
                  <span className="font-semibold text-gray-800 flex-1 leading-snug">{product.material}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[11px] font-medium text-gray-400 shrink-0 min-w-[72px]">Hardware:</span>
                  <span className="font-semibold text-gray-800 flex-1 leading-snug">{product.hardware}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[11px] font-medium text-gray-400 shrink-0 min-w-[72px]">Dimensions:</span>
                  <span className="font-semibold text-gray-800 font-mono text-[11px] flex-1 leading-snug">{product.dimensions}</span>
                </div>
                <div className="flex items-start gap-2">
                  <span className="text-[11px] font-medium text-gray-400 shrink-0 min-w-[72px]">Weight:</span>
                  <span className="font-semibold text-gray-800 font-mono text-[11px] flex-1 leading-snug">{product.weight_grams} grams</span>
                </div>
              </div>

              <div className="pt-2.5 border-t border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-2">Key Features</span>
                <ul className="space-y-1.5 text-gray-600">
                  {product.features.map((feat, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="w-1.5 h-1.5 rounded-full bg-ariel-amber shrink-0 mt-1.5" />
                      <span className="flex-1 leading-relaxed">{feat}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </div>

        {/* RECOMMENDATION SECTION: "YOU MAY ALSO LIKE / COMPLETE THE SET" */}
        {recommendations.length > 0 && (
          <section className="mt-16 pt-12 border-t border-ariel-tan/30">
            <div className="flex items-center justify-between mb-8">
              <div>
                <span className="text-[11px] uppercase tracking-widest text-ariel-cognac font-bold block mb-1">
                  Atelier Curation
                </span>
                <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ariel-espresso">
                  Complete Your Bespoke Collection
                </h3>
              </div>
              <Link
                href="/"
                className="text-xs uppercase tracking-wider font-bold text-ariel-cognac hover:underline flex items-center gap-1"
              >
                <span>View Full Lookbook</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
              {recommendations.map((rec) => (
                <Link
                  key={rec.id}
                  href={`/products/${rec.slug}`}
                  className="group bg-white rounded-2xl border border-ariel-tan/20 overflow-hidden shadow-xs hover:shadow-lg transition-all flex flex-col justify-between"
                >
                  <div className="aspect-[4/3] bg-ariel-sand/20 overflow-hidden relative">
                    <img
                      src={rec.image_url}
                      alt={rec.title}
                      className="w-full h-full object-cover group-hover:scale-104 transition-transform duration-500"
                    />
                    <span className="absolute top-2.5 left-2.5 text-[9px] uppercase font-bold px-2 py-0.5 rounded bg-ariel-espresso text-ariel-sand">
                      {rec.category}
                    </span>
                  </div>

                  <div className="p-4 flex-1 flex flex-col justify-between">
                    <div>
                      <h4 className="font-serif text-sm font-bold text-ariel-espresso group-hover:text-ariel-saddle transition-colors line-clamp-1 mb-1">
                        {rec.title}
                      </h4>
                      <p className="text-[11px] text-gray-500 line-clamp-1">{rec.leather_type}</p>
                    </div>

                    <div className="pt-3 border-t border-gray-100 flex items-center justify-between mt-3">
                      <div>
                        <span className="font-serif font-bold text-sm text-ariel-espresso">
                          {currency === "SGD" ? `S$${rec.price_sgd}` : `$${rec.price_usd}`}
                        </span>
                        <span className="block text-[9px] text-emerald-800">Incl. 9% GST</span>
                      </div>
                      <span className="text-xs text-ariel-amber font-semibold group-hover:translate-x-1 transition-transform">
                        Explore &rarr;
                      </span>
                    </div>
                  </div>
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* VERIFIED PATRON REVIEWS & RATINGS SECTION */}
        <section className="mt-16 pt-12 border-t border-ariel-tan/30">
          <div className="flex flex-col md:flex-row md:items-end justify-between mb-8 gap-4">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-ariel-cognac font-bold block mb-1">
                Patron Impressions & Provenance
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ariel-espresso">
                Verified Singapore Patron Reviews
              </h3>
              <p className="text-xs text-gray-600 mt-1">
                Unvarnished feedback from collectors across Marina Bay, Nassim Road, and Sentosa Cove.
              </p>
            </div>

            <button
              onClick={() => setIsWriteReviewOpen(true)}
              className="px-5 py-2.5 rounded-xl bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand text-xs font-bold uppercase tracking-wider transition-all shadow-xs flex items-center justify-center gap-2 self-start md:self-auto shrink-0"
            >
              <PenLine className="w-3.5 h-3.5 text-ariel-amber" />
              <span>Write a Patron Review</span>
            </button>
          </div>

          {/* Rating Summary & Breakdown Strip */}
          <div className="bg-white rounded-3xl border border-ariel-tan/30 p-6 mb-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-2xs">
            {/* Score Block */}
            <div className="md:col-span-4 text-center md:text-left md:border-r border-gray-100 md:pr-6">
              <div className="flex items-baseline justify-center md:justify-start gap-2">
                <span className="font-serif text-4xl sm:text-5xl font-bold text-ariel-espresso">
                  {reviews.length > 0
                    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / reviews.length).toFixed(1)
                    : product.rating.toFixed(1)}
                </span>
                <span className="text-sm text-gray-400 font-semibold">/ 5.0</span>
              </div>
              <div className="flex items-center justify-center md:justify-start gap-1 my-2 text-amber-500">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-4 h-4 ${
                      star <= Math.round(reviews.length > 0 ? reviews.reduce((a, b) => a + b.rating, 0) / reviews.length : product.rating)
                        ? "fill-amber-400 text-amber-400"
                        : "fill-stone-200 text-stone-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">
                Based on <b className="text-gray-800">{reviews.length}</b> verified commissions
              </p>
            </div>

            {/* Rating Breakdown Bars */}
            <div className="md:col-span-8 space-y-1.5 text-xs">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter((r) => r.rating === stars).length;
                const pct = reviews.length > 0 ? (count / reviews.length) * 100 : stars === 5 ? 85 : stars === 4 ? 15 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="w-12 text-[11px] font-semibold text-gray-500 shrink-0 flex items-center gap-1">
                      <span>{stars}</span>
                      <Star className="w-3 h-3 fill-amber-400 text-amber-400" />
                    </span>
                    <div className="flex-1 bg-stone-100 h-2 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-500 h-full rounded-full transition-all duration-500"
                        style={{ width: `${pct}%` }}
                      />
                    </div>
                    <span className="w-10 text-right text-[10.5px] font-mono text-gray-400 shrink-0">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Reviews Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="bg-white rounded-3xl border border-ariel-tan/30 p-6 flex flex-col justify-between shadow-2xs space-y-4"
              >
                <div>
                  {/* Top Bar: Stars & Verified Badge */}
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center gap-1 text-amber-500">
                      {[1, 2, 3, 4, 5].map((s) => (
                        <Star
                          key={s}
                          className={`w-3.5 h-3.5 ${
                            s <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                    <div className="flex items-center gap-1.5 text-[10px] text-emerald-800 font-bold bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                      <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                      <span>Verified Singapore Patron</span>
                    </div>
                  </div>

                  {/* Title & Monogram Specification */}
                  <h4 className="font-serif text-base font-bold text-ariel-espresso mb-1">
                    {rev.title}
                  </h4>

                  {rev.monogram_ordered && (
                    <div className="mb-2">
                      <span className="text-[10px] font-mono bg-amber-50 text-amber-900 border border-amber-200 px-2 py-0.5 rounded-full font-semibold">
                        Hot-Stamped: {rev.monogram_ordered}
                      </span>
                    </div>
                  )}

                  {/* Review Text */}
                  <p className="text-xs text-gray-700 leading-relaxed italic">
                    &ldquo;{rev.content}&rdquo;
                  </p>
                </div>

                {/* Footer: Author & Merchant Reply */}
                <div className="space-y-3 pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between text-xs">
                    <div>
                      <span className="font-bold text-gray-900 block">{rev.author_name}</span>
                      <span className="text-[10.5px] text-gray-500">{rev.author_location}</span>
                    </div>
                    <span className="text-[10px] text-gray-400 font-mono">
                      {new Date(rev.created_at).toLocaleDateString("en-SG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>

                  {/* Merchant Reply from Master Craftsman Ariel */}
                  {rev.merchant_reply && (
                    <div className="p-3 bg-ariel-sand/30 rounded-2xl border border-ariel-tan/40 text-xs space-y-1">
                      <div className="flex items-center justify-between text-[10.5px]">
                        <span className="font-serif font-bold text-ariel-espresso flex items-center gap-1.5">
                          <span className="w-2 h-2 rounded-full bg-amber-600" />
                          <span>{rev.merchant_reply.author} (Atelier Reply)</span>
                        </span>
                        <span className="text-[9.5px] text-gray-400">
                          {new Date(rev.merchant_reply.created_at).toLocaleDateString("en-SG", {
                            day: "numeric",
                            month: "short",
                          })}
                        </span>
                      </div>
                      <p className="text-[11px] text-gray-700 leading-normal italic pl-3.5 border-l-2 border-ariel-amber/60">
                        {rev.merchant_reply.content}
                      </p>
                    </div>
                  )}
                </div>
              </div>
            ))}
          </div>

          {/* Interactive "Write a Patron Review" Modal */}
          {isWriteReviewOpen && (
            <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-xs animate-fadeIn">
              <div className="bg-white rounded-3xl max-w-lg w-full p-6 sm:p-8 border border-ariel-tan/40 shadow-2xl relative space-y-5">
                <button
                  onClick={() => setIsWriteReviewOpen(false)}
                  className="absolute top-5 right-5 text-gray-400 hover:text-gray-600 p-1 rounded-full hover:bg-gray-100 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>

                <div className="border-b border-gray-100 pb-3">
                  <span className="text-[10px] uppercase font-bold tracking-widest text-ariel-cognac block">
                    Atelier Feedback
                  </span>
                  <h3 className="font-serif text-xl font-bold text-ariel-espresso">
                    Submit a Patron Review
                  </h3>
                  <p className="text-xs text-gray-500 mt-0.5">
                    For &ldquo;{product.title}&rdquo; &bull; Singapore Flagship
                  </p>
                </div>

                {reviewSubmitSuccess ? (
                  <div className="py-8 text-center space-y-2">
                    <div className="w-12 h-12 rounded-full bg-emerald-100 text-emerald-800 flex items-center justify-center mx-auto">
                      <Check className="w-6 h-6" />
                    </div>
                    <h4 className="font-serif font-bold text-lg text-ariel-espresso">Grazie Mille!</h4>
                    <p className="text-xs text-gray-600">
                      Your testimonial has been recorded and will appear on the atelier registry.
                    </p>
                  </div>
                ) : (
                  <form onSubmit={handleReviewSubmit} className="space-y-4 text-xs">
                    {/* Star Rating Picker */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                        Overall Rating *
                      </label>
                      <div className="flex items-center gap-2">
                        {[1, 2, 3, 4, 5].map((star) => (
                          <button
                            key={star}
                            type="button"
                            onClick={() => setNewReviewForm({ ...newReviewForm, rating: star })}
                            className="p-1 text-amber-500 hover:scale-125 transition-transform"
                          >
                            <Star
                              className={`w-6 h-6 ${
                                star <= newReviewForm.rating
                                  ? "fill-amber-400 text-amber-400"
                                  : "fill-stone-200 text-stone-200"
                              }`}
                            />
                          </button>
                        ))}
                        <span className="ml-2 font-bold text-gray-700">{newReviewForm.rating} Stars</span>
                      </div>
                    </div>

                    {/* Review Title */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                        Review Headline *
                      </label>
                      <input
                        type="text"
                        required
                        value={newReviewForm.title}
                        onChange={(e) => setNewReviewForm({ ...newReviewForm, title: e.target.value })}
                        placeholder="e.g. Masterful calfskin with impeccable edge paint"
                        className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                      />
                    </div>

                    {/* Review Content */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                        Detailed Impressions *
                      </label>
                      <textarea
                        required
                        rows={3}
                        value={newReviewForm.content}
                        onChange={(e) => setNewReviewForm({ ...newReviewForm, content: e.target.value })}
                        placeholder="Share your thoughts on the leather hand-feel, daily usability, stitching, or packaging..."
                        className="w-full bg-stone-50 border border-gray-200 rounded-xl p-3 text-gray-800 focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                      />
                    </div>

                    {/* Name & Location Grid */}
                    <div className="grid grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                          Patron Name *
                        </label>
                        <input
                          type="text"
                          required
                          value={newReviewForm.author_name}
                          onChange={(e) => setNewReviewForm({ ...newReviewForm, author_name: e.target.value })}
                          placeholder="e.g. Marcus N."
                          className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                        />
                      </div>
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                          Location (Singapore)
                        </label>
                        <input
                          type="text"
                          value={newReviewForm.author_location}
                          onChange={(e) =>
                            setNewReviewForm({ ...newReviewForm, author_location: e.target.value })
                          }
                          placeholder="e.g. Marina Bay, Singapore"
                          className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                        />
                      </div>
                    </div>

                    {/* Optional Monogram */}
                    <div>
                      <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                        Hot-Stamped Monogram (Optional)
                      </label>
                      <input
                        type="text"
                        value={newReviewForm.monogram_ordered}
                        onChange={(e) =>
                          setNewReviewForm({ ...newReviewForm, monogram_ordered: e.target.value })
                        }
                        placeholder="e.g. MN (24k Gold)"
                        className="w-full bg-stone-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-800 focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                      />
                    </div>

                    {/* Submit Button */}
                    <div className="pt-2 flex justify-end gap-2">
                      <button
                        type="button"
                        onClick={() => setIsWriteReviewOpen(false)}
                        className="px-4 py-2.5 rounded-xl text-gray-600 hover:bg-gray-100 font-semibold"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-6 py-2.5 rounded-xl bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand font-bold uppercase tracking-wider shadow-md transition-all flex items-center gap-1.5"
                      >
                        <Check className="w-4 h-4 text-ariel-amber" />
                        <span>Publish Review</span>
                      </button>
                    </div>
                  </form>
                )}
              </div>
            </div>
          )}
        </section>
      </main>

      {/* Cart Drawer */}
      <CartDrawer
        isOpen={isCartOpen}
        items={cartItems}
        currency={currency}
        onClose={() => setIsCartOpen(false)}
        onUpdateQuantity={(id, qty) => {
          if (qty <= 0) {
            setCartItems((prev) => prev.filter((i) => i.product.id !== id));
          } else {
            setCartItems((prev) =>
              prev.map((i) => (i.product.id === id ? { ...i, quantity: qty } : i))
            );
          }
        }}
        onRemoveItem={(id) => setCartItems((prev) => prev.filter((i) => i.product.id !== id))}
        onClearCart={() => setCartItems([])}
      />

      {/* Account Modal */}
      <AccountModal
        isOpen={isAccountOpen}
        onClose={() => setIsAccountOpen(false)}
        wishlist={wishlist}
        onRemoveFromWishlist={(id) => setWishlist((prev) => prev.filter((p) => p.id !== id))}
        onAddToCart={(p) => {
          setCartItems((prev) => [...prev, { product: p, quantity: 1 }]);
          setIsCartOpen(true);
        }}
      />
    </div>
  );
}
