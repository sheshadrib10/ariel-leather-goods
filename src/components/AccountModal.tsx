"use client";

import React, { useState } from "react";
import {
  X,
  User,
  Package,
  Heart,
  MapPin,
  Sparkles,
  LogOut,
  Check,
  ArrowRight,
  ShieldCheck,
  Lock,
  Mail,
  Phone,
  Compass,
} from "lucide-react";
import { RankedProduct } from "@/lib/search-engine";
import { useAuth } from "@/lib/auth-context";

interface AccountModalProps {
  isOpen: boolean;
  onClose: () => void;
  wishlist: RankedProduct[];
  onRemoveFromWishlist: (productId: number) => void;
  onAddToCart: (product: RankedProduct) => void;
}

export function AccountModal({
  isOpen,
  onClose,
  wishlist,
  onRemoveFromWishlist,
  onAddToCart,
}: AccountModalProps) {
  const {
    currentUser,
    isLoggedIn,
    login,
    signup,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    updateProfile,
  } = useAuth();
  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist" | "monogram">("profile");

  // Sign in / Sign up form state
  const [authMode, setAuthMode] = useState<"signin" | "signup">("signin");
  const [signinEmail, setSigninEmail] = useState("");
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    phone: "+65 ",
    address: "",
    unitNumber: "",
    postalCode: "",
  });
  const [authError, setAuthError] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);

  // Editable profile state when logged in
  const [editProfile, setEditProfile] = useState({
    name: currentUser?.name || "",
    phone: currentUser?.phone || "",
    address: currentUser?.address || "",
    unitNumber: currentUser?.unitNumber || "",
    postalCode: currentUser?.postalCode || "",
    monogramInitials: currentUser?.monogramInitials || "AL",
    monogramFoil: currentUser?.monogramFoil || "gold",
  });

  // Sync edit profile when currentUser changes
  React.useEffect(() => {
    if (currentUser) {
      setEditProfile({
        name: currentUser.name,
        phone: currentUser.phone,
        address: currentUser.address,
        unitNumber: currentUser.unitNumber,
        postalCode: currentUser.postalCode,
        monogramInitials: currentUser.monogramInitials,
        monogramFoil: currentUser.monogramFoil,
      });
    }
  }, [currentUser]);

  if (!isOpen) return null;

  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!signinEmail.trim()) {
      setAuthError("Please enter your email address.");
      return;
    }
    const res = await login(signinEmail);
    if (!res.success) {
      setAuthError(res.message);
    }
  };

  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    if (!signupForm.name.trim() || !signupForm.email.trim()) {
      setAuthError("Please provide your name and email.");
      return;
    }
    const res = await signup(signupForm);
    if (!res.success) {
      setAuthError(res.message);
    }
  };

  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editProfile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
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

        {/* Header */}
        <div className="flex items-center gap-3 mb-6">
          <div className="w-10 h-10 rounded-xl bg-ariel-espresso text-ariel-gold flex items-center justify-center shadow-xs">
            <User className="w-5 h-5" />
          </div>
          <div>
            <h3 className="font-serif text-xl sm:text-2xl font-bold text-ariel-espresso">
              {isLoggedIn ? "Atelier Member Portal" : "Join the Ariel Atelier"}
            </h3>
            <p className="text-xs text-ariel-saddle font-medium">
              Ariel Leather Goods Singapore &bull; Complimentary Hot-Stamping & White-Glove Dispatch
            </p>
          </div>
        </div>

        {/* NON-LOGGED IN: Sign In or Register */}
        {!isLoggedIn ? (
          <div className="space-y-6">
            <div className="flex border-b border-ariel-tan/20 gap-4 text-xs font-semibold uppercase tracking-wider">
              <button
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError("");
                }}
                className={`pb-3 px-1 border-b-2 transition-all ${
                  authMode === "signin"
                    ? "border-ariel-amber text-ariel-espresso"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                Sign In to Account
              </button>
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                }}
                className={`pb-3 px-1 border-b-2 transition-all ${
                  authMode === "signup"
                    ? "border-ariel-amber text-ariel-espresso"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                Create New Member Account
              </button>
            </div>

            {/* Social SSO Authentication Options */}
            <div className="space-y-2.5">
              <button
                type="button"
                onClick={async () => {
                  await loginWithGoogle("sheshadri.lacawnche@gmail.com");
                }}
                className="w-full py-2.5 px-4 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 flex items-center justify-center gap-3 transition-colors shadow-2xs hover:border-gray-400"
              >
                <svg className="w-4 h-4 shrink-0" viewBox="0 0 24 24">
                  <path
                    fill="#4285F4"
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                  />
                  <path
                    fill="#34A853"
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                  />
                  <path
                    fill="#FBBC05"
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.06H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.94l2.85-2.22.81-.63z"
                  />
                  <path
                    fill="#EA4335"
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.06l3.66 2.84c.87-2.6 3.3-4.52 6.16-4.52z"
                  />
                </svg>
                <span>Continue with Google (Gmail)</span>
              </button>

              <button
                type="button"
                onClick={async () => {
                  await loginWithFacebook();
                }}
                className="w-full py-2.5 px-4 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-3 transition-colors shadow-2xs"
              >
                <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                  <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                </svg>
                <span>Continue with Facebook</span>
              </button>
            </div>

            <div className="relative flex items-center justify-center">
              <div className="border-t border-ariel-tan/30 w-full" />
              <span className="bg-ariel-cream px-3 text-[10px] uppercase font-bold tracking-widest text-gray-400 shrink-0">
                Or with Atelier Email
              </span>
              <div className="border-t border-ariel-tan/30 w-full" />
            </div>

            {authMode === "signin" ? (
              <form onSubmit={handleSignIn} className="space-y-4 text-xs">
                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Email Address
                  </label>
                  <div className="relative">
                    <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-3" />
                    <input
                      type="email"
                      value={signinEmail}
                      onChange={(e) => setSigninEmail(e.target.value)}
                      placeholder="e.g. client@singapore.com"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl pl-9 pr-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                      required
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Sign In</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>

                <div className="pt-2 text-center">
                  <button
                    type="button"
                    onClick={() => {
                      setSigninEmail("alexander.tan@atelier.sg");
                      login("alexander.tan@atelier.sg");
                    }}
                    className="text-[11px] text-ariel-saddle hover:underline font-semibold"
                  >
                    Demo 1-Click: Sign in as Alexander Tan (Singapore VIP Patron)
                  </button>
                </div>
              </form>
            ) : (
              <form onSubmit={handleSignUp} className="space-y-4 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Full Name *
                    </label>
                    <input
                      type="text"
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      placeholder="e.g. Somnath Banerjee"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      placeholder="e.g. somnath@example.com"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Singapore Mobile (+65)
                    </label>
                    <input
                      type="tel"
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      placeholder="+65 9123 4567"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Singapore Postal Code (6 Digits)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={signupForm.postalCode}
                      onChange={(e) => setSignupForm({ ...signupForm, postalCode: e.target.value })}
                      placeholder="e.g. 248648"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Street Address & Unit Number
                  </label>
                  <input
                    type="text"
                    value={signupForm.address}
                    onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })}
                    placeholder="e.g. 24 Orchard Boulevard, #18-02"
                    className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                  />
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm flex items-center justify-center gap-2"
                >
                  <span>Create Atelier Account</span>
                  <ArrowRight className="w-3.5 h-3.5" />
                </button>
              </form>
            )}
          </div>
        ) : (
          /* LOGGED IN VIEW */
          <div className="space-y-6">
            {/* User Greeting & Status Banner */}
            <div className="p-3.5 bg-ariel-sand/60 border border-ariel-tan/30 rounded-2xl flex items-center justify-between">
              <div>
                <span className="text-[10px] uppercase font-bold tracking-widest text-ariel-saddle block">
                  Atelier Patron &bull; Singapore Flagship
                </span>
                <span className="font-serif font-bold text-ariel-espresso text-sm sm:text-base">
                  {currentUser?.name}
                </span>
                <span className="text-gray-500 text-[11px] block">{currentUser?.email}</span>
              </div>
              <button
                onClick={logout}
                className="px-3 py-1.5 bg-white border border-ariel-tan/40 hover:bg-red-50 hover:border-red-200 text-gray-600 hover:text-red-700 rounded-xl text-[11px] font-semibold transition-colors flex items-center gap-1.5"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Tab Navigation */}
            <div className="flex border-b border-ariel-tan/20 gap-2 sm:gap-4 overflow-x-auto text-xs font-semibold uppercase tracking-wider">
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
                Orders ({currentUser?.orders.length || 0})
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

            {/* Tab 1: Profile & Delivery Address */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                {savedSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Your Singapore delivery details have been updated.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Full Name
                    </label>
                    <input
                      type="text"
                      value={editProfile.name}
                      onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Singapore Mobile (+65)
                    </label>
                    <input
                      type="tel"
                      value={editProfile.phone}
                      onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Postal Code (Singapore)
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={editProfile.postalCode}
                      onChange={(e) => setEditProfile({ ...editProfile, postalCode: e.target.value })}
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                      Unit Number
                    </label>
                    <input
                      type="text"
                      value={editProfile.unitNumber}
                      onChange={(e) => setEditProfile({ ...editProfile, unitNumber: e.target.value })}
                      placeholder="#18-02"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-gray-600 uppercase tracking-wider mb-1">
                    Street Address
                  </label>
                  <input
                    type="text"
                    value={editProfile.address}
                    onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                    className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3.5 py-2.5 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                  />
                </div>

                <button
                  type="submit"
                  className="px-6 py-2.5 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-sm"
                >
                  Save Profile Details
                </button>
              </form>
            )}

            {/* Tab 2: Orders */}
            {activeTab === "orders" && (
              <div className="space-y-3">
                {currentUser?.orders && currentUser.orders.length > 0 ? (
                  currentUser.orders.map((ord) => (
                    <div
                      key={ord.id}
                      className="p-4 bg-white border border-ariel-tan/30 rounded-2xl space-y-2 hover:border-ariel-amber transition-colors shadow-2xs"
                    >
                      <div className="flex items-center justify-between text-xs">
                        <span className="font-mono font-bold text-ariel-cognac">
                          Order #{ord.display_id || ord.id}
                        </span>
                        <span className="px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                          {ord.status}
                        </span>
                      </div>

                      <div className="text-xs text-ariel-espresso">
                        {ord.items.map((it, idx) => (
                          <div key={idx} className="font-serif font-semibold">
                            {it.title} &times; {it.quantity}
                            {it.monogram?.text && (
                              <span className="text-[11px] text-ariel-saddle font-sans font-normal ml-2">
                                [Hot-Stamped: {it.monogram.text} ({it.monogram.foil})]
                              </span>
                            )}
                          </div>
                        ))}
                      </div>

                      <div className="flex items-center justify-between text-[11px] text-gray-500 pt-2 border-t border-gray-100">
                        <span>Courier: {ord.tracking_number}</span>
                        <span className="font-bold text-ariel-espresso">Total: S${ord.total}</span>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400 text-xs">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No orders placed yet.</p>
                    <p className="text-[11px]">Your bespoke commissions will appear here upon checkout.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 3: Wishlist */}
            {activeTab === "wishlist" && (
              <div className="space-y-3">
                {wishlist.length > 0 ? (
                  wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="p-3.5 bg-white border border-ariel-tan/30 rounded-2xl flex items-center justify-between gap-3 text-xs"
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={item.image_url}
                          alt={item.title}
                          className="w-12 h-12 object-cover rounded-xl border border-ariel-tan/20"
                        />
                        <div>
                          <p className="font-serif font-bold text-ariel-espresso">{item.title}</p>
                          <p className="text-gray-500 text-[11px]">S${item.price_sgd}</p>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAddToCart(item)}
                          className="px-3 py-1.5 bg-ariel-espresso text-ariel-sand rounded-xl text-[10px] font-bold uppercase tracking-wider"
                        >
                          Add to Bag
                        </button>
                        <button
                          onClick={() => onRemoveFromWishlist(item.id)}
                          className="p-1.5 text-gray-400 hover:text-red-600 rounded-lg"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-10 text-gray-400 text-xs">
                    <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Your wishlist is empty.</p>
                  </div>
                )}
              </div>
            )}

            {/* Tab 4: Bespoke Monogram */}
            {activeTab === "monogram" && (
              <div className="p-4 bg-white border border-ariel-tan/30 rounded-2xl space-y-4 text-xs">
                <div>
                  <h4 className="font-serif font-bold text-sm text-ariel-espresso">
                    Default Bespoke Initials
                  </h4>
                  <p className="text-gray-500 text-[11px]">
                    Pre-applied to all eligible leather creations during checkout.
                  </p>
                </div>

                <div className="flex items-center gap-4">
                  <input
                    type="text"
                    maxLength={3}
                    value={editProfile.monogramInitials}
                    onChange={(e) =>
                      setEditProfile({ ...editProfile, monogramInitials: e.target.value.toUpperCase() })
                    }
                    className="w-24 text-center font-serif text-lg font-bold bg-ariel-sand/30 border border-ariel-tan/40 rounded-xl py-2 uppercase"
                  />

                  <div className="flex gap-2">
                    {(["gold", "blind", "silver"] as const).map((foil) => (
                      <button
                        key={foil}
                        type="button"
                        onClick={() => setEditProfile({ ...editProfile, monogramFoil: foil })}
                        className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider border ${
                          editProfile.monogramFoil === foil
                            ? "bg-ariel-espresso text-ariel-sand border-ariel-espresso"
                            : "bg-white text-gray-600 border-ariel-tan/30"
                        }`}
                      >
                        {foil === "gold" ? "24k Gold Foil" : foil === "blind" ? "Blind Deboss" : "Silver Foil"}
                      </button>
                    ))}
                  </div>
                </div>

                <button
                  type="button"
                  onClick={handleSaveProfile}
                  className="px-5 py-2 bg-ariel-espresso text-ariel-sand rounded-xl text-[11px] font-bold uppercase tracking-wider"
                >
                  Save Monogram Preference
                </button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
