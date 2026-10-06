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
  Plus,
  X,
  ThumbsUp,
  UserCheck,
} from "lucide-react";
import { Header } from "@/components/Header";
import { CartDrawer, CartItem } from "@/components/CartDrawer";
import { AccountModal } from "@/components/AccountModal";
import { PRODUCTS_CATALOG, Product, getProductBySlug, getComplementaryProducts } from "@/lib/catalog-data";
import { RankedProduct } from "@/lib/search-engine";
import { useAuth } from "@/lib/auth-context";
import { getReviewsForProduct, addReviewToProduct, INITIAL_REVIEWS } from "@/lib/reviews-data";
import { ProductReview } from "@/lib/medusa/types";

export const runtime = "edge";

export default function ProductDetailPage() {
  const params = useParams();
  const router = useRouter();
  const slug = params?.slug as string;
  const { currentUser, logSearchQuery } = useAuth();

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

  // Reviews State
  const [reviews, setReviews] = useState<ProductReview[]>([]);
  const [isWriteReviewOpen, setIsWriteReviewOpen] = useState<boolean>(false);
  const [reviewSubmittedNotice, setReviewSubmittedNotice] = useState<string | null>(null);
  const [newReviewForm, setNewReviewForm] = useState({
    rating: 5,
    title: "",
    content: "",
    name: currentUser?.name || "",
    email: currentUser?.email || "",
    location: "Marina Bay, Singapore",
  });

  // Modals state
  const [isCartOpen, setIsCartOpen] = useState(false);
  const [isAccountOpen, setIsAccountOpen] = useState(false);
  const [cartItems, setCartItems] = useState<CartItem[]>([]);
  const [wishlist, setWishlist] = useState<RankedProduct[]>([]);

  // Complementary recommendations
  const [recommendations, setRecommendations] = useState<Product[]>([]);

  useEffect(() => {
    if (!slug) return;
    const found = getProductBySlug(slug) || PRODUCTS_CATALOG.find((p) => p.id === Number(slug));
    if (found) {
      setProduct(found);
      setActiveImage(found.image_url);
      setRecommendations(getComplementaryProducts(found, 4));

      // Load reviews
      const productReviews = getReviewsForProduct(found.id, found.slug);
      setReviews(productReviews.length > 0 ? productReviews : INITIAL_REVIEWS.slice(0, 3));

      // Log view to customer journey
      logSearchQuery(`Viewed product: ${found.title}`, 1, "auto");
    }
  }, [slug]);

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

  // Submit Review Form
  const handleSubmitReview = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newReviewForm.title.trim() || !newReviewForm.content.trim()) return;

    const created = addReviewToProduct({
      product_id: product.id,
      product_slug: product.slug,
      author_name: newReviewForm.name.trim() || currentUser?.name || "Verified Patron",
      author_email: newReviewForm.email.trim() || currentUser?.email || "",
      author_location: newReviewForm.location.trim() || "Singapore",
      rating: newReviewForm.rating,
      title: newReviewForm.title.trim(),
      content: newReviewForm.content.trim(),
      verified_purchase: true,
      monogram_ordered: enableMonogram && monogramText ? `${monogramText} (${selectedFoil})` : undefined,
    });

    setReviews([created, ...reviews]);
    setIsWriteReviewOpen(false);
    setReviewSubmittedNotice("Thank you for your review. Your feedback has been published.");
    setTimeout(() => setReviewSubmittedNotice(null), 5000);
    setNewReviewForm({
      rating: 5,
      title: "",
      content: "",
      name: currentUser?.name || "",
      email: currentUser?.email || "",
      location: "Marina Bay, Singapore",
    });
  };

  const galleryList = product.gallery_images && product.gallery_images.length > 0
    ? product.gallery_images
    : [product.image_url];

  // Ratings statistics
  const totalReviewsCount = reviews.length;
  const avgRating = totalReviewsCount > 0
    ? (reviews.reduce((acc, r) => acc + r.rating, 0) / totalReviewsCount).toFixed(1)
    : product.rating.toFixed(1);

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

              {/* Wishlist Button */}
              <button
                onClick={handleToggleWishlist}
                className="absolute top-4 right-4 z-10 w-10 h-10 rounded-full bg-white/90 hover:bg-white text-ariel-espresso flex items-center justify-center shadow-md transition-all hover:scale-110"
                title={isWishlisted ? "Remove from wishlist" : "Save to wishlist"}
              >
                <Heart
                  className={`w-5 h-5 transition-colors ${
                    isWishlisted ? "fill-red-500 text-red-500" : "text-gray-400 hover:text-gray-600"
                  }`}
                />
              </button>

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
              {/* Category, Colour & 5-Star Rating Link */}
              <div className="flex items-center justify-between text-xs font-semibold text-ariel-saddle uppercase tracking-wider mb-2">
                <span>{product.category} &bull; {product.colour}</span>
                <a
                  href="#reviews"
                  className="flex items-center gap-1.5 hover:text-ariel-espresso transition-colors group"
                >
                  <div className="flex items-center text-amber-500">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={`w-3.5 h-3.5 ${
                          star <= Math.round(Number(avgRating))
                            ? "fill-amber-400 text-amber-400"
                            : "fill-stone-200 text-stone-200"
                        }`}
                      />
                    ))}
                  </div>
                  <span className="text-gray-900 font-bold">{avgRating}</span>
                  <span className="text-gray-500 font-normal">({totalReviewsCount} reviews)</span>
                </a>
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
            </div>

            {/* Technical Specifications Accordion */}
            <div className="bg-white p-5 rounded-2xl border border-ariel-tan/30 space-y-3 text-xs">
              <h4 className="font-bold text-ariel-espresso uppercase tracking-wider text-[11px] pb-2 border-b border-gray-100">
                Atelier Specifications & Craftsmanship
              </h4>

              <div className="grid grid-cols-2 gap-3 text-gray-600">
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Leather Provenance</span>
                  <span className="font-semibold text-gray-800">{product.material}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Hardware</span>
                  <span className="font-semibold text-gray-800">{product.hardware}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Dimensions</span>
                  <span className="font-semibold text-gray-800 font-mono">{product.dimensions}</span>
                </div>
                <div>
                  <span className="text-[10px] uppercase font-bold text-gray-400 block">Weight</span>
                  <span className="font-semibold text-gray-800 font-mono">{product.weight_grams} grams</span>
                </div>
              </div>

              <div className="pt-2 border-t border-gray-100">
                <span className="text-[10px] uppercase font-bold text-gray-400 block mb-1">Key Features</span>
                <ul className="list-disc list-inside space-y-0.5 text-gray-600">
                  {product.features.map((feat, i) => (
                    <li key={i}>{feat}</li>
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

        {/* FULL CUSTOMER REVIEWS & RATINGS MODULE */}
        <section id="reviews" className="mt-16 pt-12 border-t border-ariel-tan/30 scroll-mt-20">
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 mb-8">
            <div>
              <span className="text-[11px] uppercase tracking-widest text-ariel-cognac font-bold block mb-1">
                Verified Feedback
              </span>
              <h3 className="font-serif text-2xl sm:text-3xl font-bold text-ariel-espresso">
                Patron Reviews & Ratings
              </h3>
            </div>

            <button
              onClick={() => setIsWriteReviewOpen(true)}
              className="px-4 py-2.5 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-2 transition-colors shadow-xs"
            >
              <Plus className="w-4 h-4 text-ariel-amber" />
              <span>Write a Patron Review</span>
            </button>
          </div>

          {/* Submission Notice */}
          {reviewSubmittedNotice && (
            <div className="p-4 bg-emerald-50 border border-emerald-200 text-emerald-900 rounded-2xl text-xs mb-6 flex items-center gap-2 animate-fadeIn">
              <Check className="w-4 h-4 text-emerald-600 shrink-0" />
              <span>{reviewSubmittedNotice}</span>
            </div>
          )}

          {/* Review Score Summary Box */}
          <div className="bg-white rounded-3xl border border-ariel-tan/30 p-6 sm:p-8 mb-8 grid grid-cols-1 md:grid-cols-12 gap-6 items-center shadow-xs">
            <div className="md:col-span-4 text-center md:border-r md:border-gray-100 pr-0 md:pr-6">
              <div className="font-serif text-5xl font-bold text-ariel-espresso mb-2">{avgRating}</div>
              <div className="flex justify-center text-amber-500 mb-1.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={`w-5 h-5 ${
                      star <= Math.round(Number(avgRating))
                        ? "fill-amber-400 text-amber-400"
                        : "fill-stone-200 text-stone-200"
                    }`}
                  />
                ))}
              </div>
              <p className="text-xs text-gray-500">Based on {totalReviewsCount} verified commissions</p>
              <span className="inline-block mt-2 text-[10px] font-bold text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full">
                100% Verified Singapore Patrons
              </span>
            </div>

            <div className="md:col-span-8 space-y-2 text-xs">
              {[5, 4, 3, 2, 1].map((stars) => {
                const count = reviews.filter((r) => r.rating === stars).length;
                const percentage = totalReviewsCount > 0 ? (count / totalReviewsCount) * 100 : 0;
                return (
                  <div key={stars} className="flex items-center gap-3">
                    <span className="w-12 text-gray-600 font-semibold">{stars} Stars</span>
                    <div className="flex-1 bg-gray-100 h-2.5 rounded-full overflow-hidden">
                      <div
                        className="bg-amber-400 h-full rounded-full transition-all"
                        style={{ width: `${percentage}%` }}
                      />
                    </div>
                    <span className="w-8 text-right text-gray-400 font-mono text-[11px]">{count}</span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Individual Reviews List */}
          <div className="space-y-4">
            {reviews.map((rev) => (
              <div
                key={rev.id}
                className="p-6 bg-white rounded-3xl border border-ariel-tan/30 space-y-3.5 shadow-2xs text-xs"
              >
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-stone-900 text-amber-400 flex items-center justify-center font-serif font-bold text-sm">
                      {rev.author_name.slice(0, 2).toUpperCase()}
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-gray-900 text-sm">{rev.author_name}</span>
                        {rev.verified_purchase && (
                          <span className="text-[10px] text-emerald-800 bg-emerald-50 border border-emerald-200 px-2 py-0.5 rounded-full font-bold flex items-center gap-1">
                            <UserCheck className="w-3 h-3" />
                            Verified Patron
                          </span>
                        )}
                      </div>
                      <span className="text-[11px] text-gray-500 block">{rev.author_location}</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:items-end">
                    <div className="flex text-amber-500">
                      {[1, 2, 3, 4, 5].map((star) => (
                        <Star
                          key={star}
                          className={`w-3.5 h-3.5 ${
                            star <= rev.rating ? "fill-amber-400 text-amber-400" : "fill-stone-200 text-stone-200"
                          }`}
                        />
                      ))}
                    </div>
                    <span className="text-[10px] text-gray-400 mt-0.5">
                      {new Date(rev.created_at).toLocaleDateString("en-SG", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })}
                    </span>
                  </div>
                </div>

                {/* Monogram tag if present */}
                {rev.monogram_ordered && (
                  <span className="inline-block text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200/80 px-2 py-0.5 rounded">
                    Commissioned Monogram: [{rev.monogram_ordered}]
                  </span>
                )}

                <div>
                  <h4 className="font-serif font-bold text-gray-900 text-sm mb-1">{rev.title}</h4>
                  <p className="text-gray-700 leading-relaxed">{rev.content}</p>
                </div>

                {/* Official Merchant Reply from Uncle Ariel */}
                {rev.merchant_reply && (
                  <div className="p-4 bg-amber-50/60 border-l-2 border-ariel-amber rounded-r-2xl space-y-1 text-xs text-amber-950 mt-3">
                    <div className="flex items-center justify-between">
                      <span className="font-bold uppercase tracking-wider text-[10px] text-amber-900">
                        Response from {rev.merchant_reply.author}
                      </span>
                      <span className="text-[10px] text-amber-800/70">
                        {new Date(rev.merchant_reply.created_at).toLocaleDateString("en-SG")}
                      </span>
                    </div>
                    <p className="text-gray-700 italic">{rev.merchant_reply.content}</p>
                  </div>
                )}
              </div>
            ))}
          </div>
        </section>
      </main>

      {/* MODAL: SUBMIT PATRON REVIEW */}
      {isWriteReviewOpen && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-sm flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-3xl border border-gray-200 w-full max-w-lg p-6 sm:p-8 space-y-5 text-xs shadow-2xl relative">
            <button
              onClick={() => setIsWriteReviewOpen(false)}
              className="absolute top-5 right-5 text-gray-400 hover:text-gray-700 p-1 rounded-full"
            >
              <X className="w-5 h-5" />
            </button>

            <div className="border-b border-gray-100 pb-3">
              <span className="text-[10px] uppercase font-bold tracking-widest text-ariel-cognac block mb-1">
                Atelier Feedback
              </span>
              <h4 className="font-serif text-xl font-bold text-ariel-espresso">
                Review: {product.title}
              </h4>
              <p className="text-gray-500 text-[11px]">
                Share your experience on leather hand-feel, patina development, or white-glove delivery.
              </p>
            </div>

            <form onSubmit={handleSubmitReview} className="space-y-4">
              {/* Star Rating Selector */}
              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">Overall Rating *</label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setNewReviewForm({ ...newReviewForm, rating: star })}
                      className="p-1 text-amber-500 hover:scale-110 transition-transform"
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
                  <span className="font-bold text-gray-800 ml-2 text-sm">{newReviewForm.rating} of 5 Stars</span>
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">Review Headline *</label>
                <input
                  type="text"
                  required
                  value={newReviewForm.title}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, title: e.target.value })}
                  placeholder="e.g. Florentine calfskin is extraordinary"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-ariel-amber"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">Detailed Review *</label>
                <textarea
                  required
                  rows={3}
                  value={newReviewForm.content}
                  onChange={(e) => setNewReviewForm({ ...newReviewForm, content: e.target.value })}
                  placeholder="Describe your impressions of the leather thickness, saddle stitching, hot-stamped monogram, and everyday carry..."
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl p-3 text-gray-900 focus:outline-none focus:border-ariel-amber"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">Your Name *</label>
                  <input
                    type="text"
                    required
                    value={newReviewForm.name}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, name: e.target.value })}
                    placeholder="e.g. Keith W."
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-ariel-amber"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">Location *</label>
                  <input
                    type="text"
                    required
                    value={newReviewForm.location}
                    onChange={(e) => setNewReviewForm({ ...newReviewForm, location: e.target.value })}
                    placeholder="e.g. Marina Bay, Singapore"
                    className="w-full bg-gray-50 border border-gray-200 rounded-xl px-3 py-2 text-gray-900 focus:outline-none focus:border-ariel-amber"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-md"
              >
                Submit Verified Patron Review
              </button>
            </form>
          </div>
        </div>
      )}

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
