"use client";

import React, { useState, useEffect } from "react";
import { X, User, Package, Heart, MapPin, Sparkles, LogOut, Check, ArrowRight, ShieldCheck } from "lucide-react";
import { RankedProduct } from "@/lib/search-engine";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: RankedProduct[];
  onRemoveFromWishlist: (productId: number) => void;
  onAddToCart: (product: RankedProduct) => void;
}

interface UserProfile {
  name: string;
  email: string;
  phone: string;
  address: string;
  postalCode: string;
  monogramInitials: string;
  monogramFoil: "gold" | "blind" | "silver";
}

export function AccountModal({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onAddToCart,
}: AccountModalProps) {
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist" | "monogram">("profile");
  const [isLoggedIn, setIsLoggedIn] = useState(true);
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");

  // Mock User State
  const [profile, setProfile] = useState<UserProfile>({
    name: "Somnath B.",
    email: "somnath@arielleather.com",
    phone: "+65 9123 4567",
    address: "24 Orchard Boulevard, #18-02",
    postalCode: "248648",
    monogramInitials: "SB",
    monogramFoil: "gold",
  });

  const [savedSuccess, setSavedSuccess] = useState(false);

  // Mock past orders
  const orders = [
    {
      id: "AR-84920",
      date: "04 Oct 2026",
      items: "The Medici Bifold Wallet (Espresso Brown)",
      monogram: "SB (Gold Foil)",
      total: "S$129",
      status: "Delivered to Singapore",
      tracking: "SG-POST-89410284",
    },
    {
      id: "AR-81204",
      date: "18 Aug 2026",
      items: "The Aurelius Reversible Dress Belt",
      monogram: "None",
      total: "S$119",
      status: "Delivered to Singapore",
      tracking: "SG-POST-77192834",
    },
  ];

  if (!isOpen) return null;

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2000);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-fadeIn">
      <div className="bg-ariel-cream border border-ariel-tan/40 rounded-3xl w-full max-w-2xl max-h-[90vh] overflow-y-auto shadow-2xl p-6 sm:p-8 relative">
        <button
          onClick={onClose}
          className="absolute top-5 right-5 text-gray-400 hover:text-ariel-espresso p-1.5 rounded-full hover:bg-ariel-sand transition-colors"
        >
          <X className="w-5 h-5" />
        </button>

        {/* Modal Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-ariel-espresso text-ariel-gold flex items-center justify-center">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-ariel-espresso">
              Atelier Shopper Portal
            </h3>
            <p className="text-xs text-ariel-saddle font-medium">
              Ariel Leather Goods Singapore &bull; Member Account
            </p>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="flex border-b border-ariel-tan/20 mb-6 gap-2 sm:gap-4 overflow-x-auto text-xs font-semibold uppercase tracking-wider">
          <button
            onClick={() => setActiveTab("profile")}
            className={`pb-3 px-1 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "profile"
                ? "border-ariel-amber text-ariel-espresso"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            My Details
          </button>
          <button
            onClick={() => setActiveTab("orders")}
            className={`pb-3 px-1 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "orders"
                ? "border-ariel-amber text-ariel-espresso"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            Orders ({orders.length})
          </button>
          <button
            onClick={() => setActiveTab("wishlist")}
            className={`pb-3 px-1 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "wishlist"
                ? "border-ariel-amber text-ariel-espresso"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            Wishlist ({wishlist.length})
          </button>
          <button
            onClick={() => setActiveTab("monogram")}
            className={`pb-3 px-1 border-b-2 transition-all whitespace-nowrap ${
              activeTab === "monogram"
                ? "border-ariel-amber text-ariel-espresso"
                : "border-transparent text-gray-400 hover:text-gray-700"
            }`}
          >
            Bespoke Monogram
          </button>
        </div>

        {/* Tab Content 1: Profile & Singapore Address */}
        {activeTab === "profile" && (
          <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  value={profile.name}
                  onChange={(e) => setProfile({ ...profile, name: e.target.value })}
                  className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Email Address
                </label>
                <input
                  type="email"
                  value={profile.email}
                  onChange={(e) => setProfile({ ...profile, email: e.target.value })}
                  className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Singapore Mobile (+65)
                </label>
                <input
                  type="tel"
                  value={profile.phone}
                  onChange={(e) => setProfile({ ...profile, phone: e.target.value })}
                  className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Postal Code (Singapore)
                </label>
                <input
                  type="text"
                  value={profile.postalCode}
                  onChange={(e) => setProfile({ ...profile, postalCode: e.target.value })}
                  className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                />
              </div>
            </div>

            <div>
              <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                Singapore Delivery Address & Unit No.
              </label>
              <input
                type="text"
                value={profile.address}
                onChange={(e) => setProfile({ ...profile, address: e.target.value })}
                className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
              />
            </div>

            <div className="bg-ariel-sand/50 p-3 rounded-xl border border-ariel-tan/20 flex items-center justify-between">
              <div className="flex items-center gap-2 text-gray-600">
                <ShieldCheck className="w-4 h-4 text-emerald-600" />
                <span>Atelier VIP Tier &bull; Complimentary Courier across Singapore</span>
              </div>
              <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                Active Member
              </span>
            </div>

            <div className="pt-2 flex justify-end items-center gap-3">
              {savedSuccess && (
                <span className="text-emerald-600 font-semibold flex items-center gap-1">
                  <Check className="w-3.5 h-3.5" /> Details saved
                </span>
              )}
              <button
                type="submit"
                className="px-6 py-2.5 bg-ariel-espresso text-ariel-sand rounded-xl font-bold uppercase tracking-wider hover:bg-ariel-saddle transition-colors shadow-sm"
              >
                Save Details
              </button>
            </div>
          </form>
        )}

        {/* Tab Content 2: Order History */}
        {activeTab === "orders" && (
          <div className="space-y-3 text-xs">
            {orders.map((ord) => (
              <div key={ord.id} className="bg-white p-4 rounded-2xl border border-ariel-tan/30 shadow-sm space-y-2">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <span className="font-serif font-bold text-sm text-ariel-espresso">{ord.id}</span>
                  <span className="text-[10px] font-bold px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 uppercase tracking-wider">
                    {ord.status}
                  </span>
                </div>
                <div className="flex items-center justify-between text-gray-600">
                  <span>{ord.items}</span>
                  <span className="font-serif font-bold text-ariel-espresso">{ord.total}</span>
                </div>
                <div className="text-[11px] text-gray-400 flex items-center justify-between pt-1">
                  <span>Monogram: {ord.monogram}</span>
                  <span>Date: {ord.date} &bull; Tracking: {ord.tracking}</span>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* Tab Content 3: Wishlist */}
        {activeTab === "wishlist" && (
          <div className="space-y-3 text-xs">
            {wishlist.length === 0 ? (
              <div className="text-center py-12 text-gray-400">
                <Heart className="w-8 h-8 text-ariel-tan mx-auto mb-2" />
                <p className="font-serif text-base text-gray-600">Your curated wishlist is empty</p>
                <p className="text-xs">Save creations while browsing by tapping the heart icon.</p>
              </div>
            ) : (
              wishlist.map((item) => (
                <div
                  key={item.id}
                  className="bg-white p-3 rounded-2xl border border-ariel-tan/30 flex items-center justify-between gap-3 shadow-sm"
                >
                  <div className="flex items-center gap-3">
                    <img
                      src={item.image_url}
                      alt={item.title}
                      className="w-14 h-14 rounded-xl object-cover shrink-0"
                    />
                    <div>
                      <h4 className="font-bold text-ariel-espresso">{item.title}</h4>
                      <p className="text-[11px] text-gray-500">{item.leather_type} &bull; S${item.price_sgd}</p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => onAddToCart(item)}
                      className="px-3 py-1.5 bg-ariel-espresso text-ariel-sand rounded-xl text-[11px] font-bold uppercase tracking-wider hover:bg-ariel-saddle transition-colors"
                    >
                      Add to Bag
                    </button>
                    <button
                      onClick={() => onRemoveFromWishlist(item.id)}
                      className="p-1.5 text-gray-400 hover:text-red-500 transition-colors"
                    >
                      <X className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>
        )}

        {/* Tab Content 4: Monogram Preferences */}
        {activeTab === "monogram" && (
          <div className="space-y-4 text-xs">
            <div className="bg-white p-5 rounded-2xl border border-ariel-tan/30 text-center space-y-3">
              <span className="text-[10px] font-bold text-ariel-saddle uppercase tracking-widest block">
                Complimentary Hot-Stamping Preview
              </span>

              {/* Visual Monogram Badge */}
              <div className="w-24 h-24 mx-auto rounded-2xl bg-ariel-espresso flex items-center justify-center border-2 border-ariel-gold shadow-lg">
                <span
                  className={`font-serif text-2xl font-bold tracking-[0.2em] ${
                    profile.monogramFoil === "gold"
                      ? "text-ariel-gold drop-shadow"
                      : profile.monogramFoil === "silver"
                      ? "text-gray-200 drop-shadow"
                      : "text-amber-950 font-black opacity-80"
                  }`}
                >
                  {profile.monogramInitials || "SB"}
                </span>
              </div>

              <div className="max-w-xs mx-auto">
                <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                  Default Initials (Max 3 Characters)
                </label>
                <input
                  type="text"
                  maxLength={3}
                  value={profile.monogramInitials}
                  onChange={(e) => setProfile({ ...profile, monogramInitials: e.target.value.toUpperCase() })}
                  className="w-full text-center font-serif text-base uppercase bg-ariel-sand/30 border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                />
              </div>

              <div className="flex justify-center gap-2 pt-1">
                {(["gold", "blind", "silver"] as const).map((foil) => (
                  <button
                    key={foil}
                    onClick={() => setProfile({ ...profile, monogramFoil: foil })}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold uppercase tracking-wider transition-all ${
                      profile.monogramFoil === foil
                        ? "bg-ariel-espresso text-ariel-gold border border-ariel-gold"
                        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
                    }`}
                  >
                    {foil === "blind" ? "Blind Deboss" : `${foil} Foil`}
                  </button>
                ))}
              </div>
            </div>

            <p className="text-[11px] text-gray-500 leading-relaxed text-center">
              Our master artisans hot-stamp each creation by hand in Florence or at our Singapore boutique using vintage brass typefaces.
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
