"use client";

import React, { useState, useEffect } from "react";
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
  Download,
  AlertTriangle,
  KeyRound,
  FileText,
  Clock,
  Eye,
  RefreshCw,
  Bell,
  RotateCcw,
} from "lucide-react";
import { RankedProduct } from "@/lib/search-engine";
import { useAuth } from "@/lib/auth-context";
import { MedusaOrder } from "@/lib/medusa/types";
import { SingaporeTaxInvoiceModal } from "@/components/SingaporeTaxInvoiceModal";
import { CustomerReturnModal } from "@/components/CustomerReturnModal";

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
    forgotPassword,
    resetPassword,
    loginWithGoogle,
    loginWithFacebook,
    logout,
    updateProfile,
    exportPdpaData,
    updatePdpaConsent,
    requestPdpaErasure,
  } = useAuth();

  const [activeTab, setActiveTab] = useState<"profile" | "orders" | "wishlist" | "privacy">("profile");

  // Auth Modes: "signin" | "signup" | "forgot_password" | "reset_verification"
  const [authMode, setAuthMode] = useState<"signin" | "signup" | "forgot_password" | "reset_verification">("signin");
  const [signinEmail, setSigninEmail] = useState("");
  const [signinPassword, setSigninPassword] = useState("");

  // Sign up Form with PDPA compliance
  const [signupForm, setSignupForm] = useState({
    name: "",
    email: "",
    password: "",
    phone: "+65 ",
    address: "",
    unitNumber: "",
    postalCode: "",
    pdpaConsent: false,
    marketingOptIn: false,
    marketingPhoneOptIn: false,
  });

  // Forgot / Reset Password state
  const [resetEmail, setResetEmail] = useState("");
  const [resetCodeInput, setResetCodeInput] = useState("");
  const [newPasswordInput, setNewPasswordInput] = useState("");
  const [confirmPasswordInput, setConfirmPasswordInput] = useState("");
  const [simulatedPinNotice, setSimulatedPinNotice] = useState<string | null>(null);

  const [authError, setAuthError] = useState("");
  const [authSuccess, setAuthSuccess] = useState("");
  const [savedSuccess, setSavedSuccess] = useState(false);
  const [erasureConfirmOpen, setErasureConfirmOpen] = useState(false);
  const [selectedInvoiceOrder, setSelectedInvoiceOrder] = useState<MedusaOrder | null>(null);
  const [selectedReturnOrder, setSelectedReturnOrder] = useState<MedusaOrder | null>(null);

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
  useEffect(() => {
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

  // Sign In
  const handleSignIn = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    if (!signinEmail.trim()) {
      setAuthError("Please enter your email address.");
      return;
    }
    const res = await login(signinEmail, signinPassword);
    if (!res.success) {
      setAuthError(res.message);
    }
  };

  // Sign Up with PDPA Consent Check
  const handleSignUp = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    if (!signupForm.name.trim() || !signupForm.email.trim()) {
      setAuthError("Please provide your full name and email.");
      return;
    }
    if (!signupForm.pdpaConsent) {
      setAuthError("Singapore PDPA consent is required to register an account.");
      return;
    }
    const res = await signup(signupForm);
    if (!res.success) {
      setAuthError(res.message);
    }
  };

  // Forgot Password Request
  const handleForgotPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    if (!resetEmail.trim()) {
      setAuthError("Please enter the email address registered with your account.");
      return;
    }
    const res = await forgotPassword(resetEmail);
    if (res.success && res.resetCode) {
      setSimulatedPinNotice(res.resetCode);
      setAuthSuccess(res.message);
      setAuthMode("reset_verification");
    } else {
      setAuthError(res.message);
    }
  };

  // Reset Password Verification
  const handleResetPassword = async (e: React.FormEvent) => {
    e.preventDefault();
    setAuthError("");
    setAuthSuccess("");
    if (!resetCodeInput.trim()) {
      setAuthError("Please enter the 6-digit Atelier Security PIN.");
      return;
    }
    if (!newPasswordInput || newPasswordInput !== confirmPasswordInput) {
      setAuthError("Passwords do not match or are blank.");
      return;
    }
    const res = await resetPassword(resetEmail, resetCodeInput, newPasswordInput);
    if (res.success) {
      setAuthSuccess(res.message);
      setSimulatedPinNotice(null);
      setTimeout(() => {
        setAuthMode("signin");
      }, 1500);
    } else {
      setAuthError(res.message);
    }
  };

  // Save profile updates
  const handleSaveProfile = (e: React.FormEvent) => {
    e.preventDefault();
    updateProfile(editProfile);
    setSavedSuccess(true);
    setTimeout(() => setSavedSuccess(false), 2500);
  };

  // Export PDPA DSAR Bundle
  const handleDownloadPdpaBundle = () => {
    const { jsonString, filename } = exportPdpaData();
    const blob = new Blob([jsonString], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Request Right to Erasure
  const handleConfirmErasure = async () => {
    const res = await requestPdpaErasure();
    setErasureConfirmOpen(false);
    if (res.success) {
      alert(res.message);
      onClose();
    }
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
              {isLoggedIn ? "Atelier Member Cockpit" : "Join the Ariel Atelier"}
            </h3>
            <p className="text-xs text-ariel-saddle font-medium">
              Ariel Leather Goods Singapore &bull; Singapore PDPA Compliant &bull; Bespoke Monograms
            </p>
          </div>
        </div>

        {/* NON-LOGGED IN FLOWS */}
        {!isLoggedIn ? (
          <div className="space-y-6">
            {/* Top Navigation Tabs */}
            <div className="flex border-b border-ariel-tan/20 gap-4 text-xs font-semibold uppercase tracking-wider">
              <button
                onClick={() => {
                  setAuthMode("signin");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className={`pb-3 px-1 border-b-2 transition-all ${
                  authMode === "signin"
                    ? "border-ariel-amber text-ariel-espresso"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                Sign In
              </button>
              <button
                onClick={() => {
                  setAuthMode("signup");
                  setAuthError("");
                  setAuthSuccess("");
                }}
                className={`pb-3 px-1 border-b-2 transition-all ${
                  authMode === "signup"
                    ? "border-ariel-amber text-ariel-espresso"
                    : "border-transparent text-gray-400 hover:text-gray-700"
                }`}
              >
                Create Account (PDPA)
              </button>
              {authMode === "forgot_password" && (
                <span className="pb-3 px-1 border-b-2 border-ariel-amber text-ariel-espresso">
                  Password Reset
                </span>
              )}
            </div>

            {/* Error or Success Notice */}
            {authError && (
              <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 shrink-0 text-red-600" />
                <span>{authError}</span>
              </div>
            )}
            {authSuccess && (
              <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl text-xs flex items-center gap-2">
                <Check className="w-4 h-4 shrink-0 text-emerald-600" />
                <span>{authSuccess}</span>
              </div>
            )}

            {/* MODE 1: SIGN IN */}
            {authMode === "signin" && (
              <div className="space-y-4">
                {/* 1-Click Social SSO Options */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                  <button
                    type="button"
                    onClick={async () => {
                      await loginWithGoogle("sheshadri.lacawnche@gmail.com");
                    }}
                    className="py-2.5 px-3 bg-white hover:bg-gray-50 border border-gray-300 rounded-xl text-xs font-semibold text-gray-700 flex items-center justify-center gap-2.5 transition-colors shadow-2xs hover:border-gray-400"
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
                    <span>Google (Gmail) SSO</span>
                  </button>

                  <button
                    type="button"
                    onClick={async () => {
                      await loginWithFacebook();
                    }}
                    className="py-2.5 px-3 bg-[#1877F2] hover:bg-[#166fe5] text-white rounded-xl text-xs font-semibold flex items-center justify-center gap-2.5 transition-colors shadow-2xs"
                  >
                    <svg className="w-4 h-4 fill-current shrink-0" viewBox="0 0 24 24">
                      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
                    </svg>
                    <span>Facebook SSO</span>
                  </button>
                </div>

                {/* 1-Click Demo Patron Accounts for testing */}
                <div className="p-3.5 bg-amber-50/70 border border-amber-200/80 rounded-2xl space-y-2">
                  <div className="flex items-center justify-between">
                    <span className="text-[10px] uppercase font-bold tracking-wider text-amber-900 flex items-center gap-1.5">
                      <Sparkles className="w-3.5 h-3.5 text-amber-600" />
                      <span>1-Click Demo Patron Accounts</span>
                    </span>
                    <span className="text-[9px] bg-amber-200/70 text-amber-900 font-mono px-2 py-0.5 rounded">
                      Instant Access
                    </span>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    <button
                      type="button"
                      onClick={async () => {
                        setSigninEmail("alexander.tan@atelier.sg");
                        setSigninPassword("Password123!");
                        await login("alexander.tan@atelier.sg", "Password123!");
                      }}
                      className="p-2.5 bg-white hover:bg-amber-100/50 border border-amber-300 rounded-xl text-left transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-xs text-gray-900 block">Alexander Tan</span>
                        <span className="text-[10px] text-gray-500 font-mono">alexander.tan@atelier.sg</span>
                        <span className="text-[9px] text-amber-800 font-medium block mt-0.5">VIP Patron &bull; Nassim Rd &bull; [AT]</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-700 shrink-0" />
                    </button>

                    <button
                      type="button"
                      onClick={async () => {
                        setSigninEmail("sheshadri.lacawnche@gmail.com");
                        setSigninPassword("Password123!");
                        await login("sheshadri.lacawnche@gmail.com", "Password123!");
                      }}
                      className="p-2.5 bg-white hover:bg-amber-100/50 border border-amber-300 rounded-xl text-left transition-colors flex items-center justify-between"
                    >
                      <div>
                        <span className="font-bold text-xs text-gray-900 block">Somnath B.</span>
                        <span className="text-[10px] text-gray-500 font-mono">sheshadri.lacawnche@gmail.com</span>
                        <span className="text-[9px] text-amber-800 font-medium block mt-0.5">MBS Resident &bull; [SB]</span>
                      </div>
                      <ArrowRight className="w-4 h-4 text-amber-700 shrink-0" />
                    </button>
                  </div>
                </div>

                <div className="flex items-center gap-3 my-2 text-gray-400 text-[11px] uppercase tracking-wider font-semibold">
                  <div className="flex-1 h-px bg-ariel-tan/30" />
                  <span>or email & password</span>
                  <div className="flex-1 h-px bg-ariel-tan/30" />
                </div>

                <form onSubmit={handleSignIn} className="space-y-3.5 text-xs">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                      Email Address
                    </label>
                    <div className="relative">
                      <Mail className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="email"
                        required
                        value={signinEmail}
                        onChange={(e) => setSigninEmail(e.target.value)}
                        placeholder="e.g. alexander.tan@atelier.sg"
                        className="w-full bg-white border border-ariel-tan/40 rounded-xl pl-9 pr-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                      />
                    </div>
                  </div>

                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="text-[10px] uppercase font-bold text-gray-600">Password</label>
                      <button
                        type="button"
                        onClick={() => {
                          setResetEmail(signinEmail);
                          setAuthMode("forgot_password");
                          setAuthError("");
                          setAuthSuccess("");
                        }}
                        className="text-[10px] text-ariel-cognac hover:underline font-semibold"
                      >
                        Forgot Password?
                      </button>
                    </div>
                    <div className="relative">
                      <Lock className="w-4 h-4 text-gray-400 absolute left-3 top-2.5" />
                      <input
                        type="password"
                        value={signinPassword}
                        onChange={(e) => setSigninPassword(e.target.value)}
                        placeholder="••••••••••••"
                        className="w-full bg-white border border-ariel-tan/40 rounded-xl pl-9 pr-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                      />
                    </div>
                  </div>

                  <button
                    type="submit"
                    className="w-full py-3 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
                  >
                    <span>Sign In to Atelier</span>
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </form>
              </div>
            )}

            {/* MODE 2: SIGN UP WITH MANDATORY SINGAPORE PDPA CONSENT */}
            {authMode === "signup" && (
              <form onSubmit={handleSignUp} className="space-y-3.5 text-xs">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">Full Name *</label>
                    <input
                      type="text"
                      required
                      value={signupForm.name}
                      onChange={(e) => setSignupForm({ ...signupForm, name: e.target.value })}
                      placeholder="e.g. Rachel Lim"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={signupForm.email}
                      onChange={(e) => setSignupForm({ ...signupForm, email: e.target.value })}
                      placeholder="rachel.lim@gmail.com"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">Password *</label>
                    <input
                      type="password"
                      required
                      value={signupForm.password}
                      onChange={(e) => setSignupForm({ ...signupForm, password: e.target.value })}
                      placeholder="At least 8 characters"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                      Singapore Mobile (+65) *
                    </label>
                    <input
                      type="tel"
                      required
                      value={signupForm.phone}
                      onChange={(e) => setSignupForm({ ...signupForm, phone: e.target.value })}
                      placeholder="+65 9123 4567"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                      Delivery Address *
                    </label>
                    <input
                      type="text"
                      required
                      value={signupForm.address}
                      onChange={(e) => setSignupForm({ ...signupForm, address: e.target.value })}
                      placeholder="18 Marina Boulevard"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                      Postal Code *
                    </label>
                    <input
                      type="text"
                      required
                      maxLength={6}
                      value={signupForm.postalCode}
                      onChange={(e) => setSignupForm({ ...signupForm, postalCode: e.target.value })}
                      placeholder="018980"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                </div>

                {/* Singapore PDPA Mandatory & Optional Consent Checkboxes */}
                <div className="bg-amber-50/70 border border-amber-200/80 p-3.5 rounded-2xl space-y-2 text-[11px]">
                  <label className="flex items-start gap-2.5 cursor-pointer text-gray-700">
                    <input
                      type="checkbox"
                      required
                      checked={signupForm.pdpaConsent}
                      onChange={(e) => setSignupForm({ ...signupForm, pdpaConsent: e.target.checked })}
                      className="mt-0.5 rounded accent-ariel-amber"
                    />
                    <span>
                      <strong className="text-gray-900">Singapore PDPA Consent (Mandatory):</strong> I consent to the
                      collection, processing, and disclosure of my personal data under the Singapore Personal Data
                      Protection Act 2012 (PDPA) for order dispatch, hot-stamped customization, and account management.
                    </span>
                  </label>

                  <label className="flex items-start gap-2.5 cursor-pointer text-gray-600 pt-1 border-t border-amber-200/40">
                    <input
                      type="checkbox"
                      checked={signupForm.marketingOptIn}
                      onChange={(e) =>
                        setSignupForm({
                          ...signupForm,
                          marketingOptIn: e.target.checked,
                          marketingPhoneOptIn: e.target.checked,
                        })
                      }
                      className="mt-0.5 rounded accent-ariel-amber"
                    />
                    <span>
                      <strong>Private Salon Invitations (Optional):</strong> Keep me informed of bespoke leather
                      creations, MBS salon events, and promotions via Email and SMS (Singapore DNC Registry compliant).
                    </span>
                  </label>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md flex items-center justify-center gap-2"
                >
                  <span>Complete PDPA Registration</span>
                  <ArrowRight className="w-4 h-4" />
                </button>
              </form>
            )}

            {/* MODE 3: FORGOT PASSWORD FLOW */}
            {authMode === "forgot_password" && (
              <form onSubmit={handleForgotPassword} className="space-y-4 text-xs">
                <div className="p-4 bg-white border border-ariel-tan/40 rounded-2xl space-y-2">
                  <div className="flex items-center gap-2 text-ariel-espresso font-semibold">
                    <KeyRound className="w-4 h-4 text-ariel-amber" />
                    <span>Reset Your Atelier Password</span>
                  </div>
                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    Enter the email registered with your account. We will issue a secure 6-digit Atelier PIN to verify
                    your identity.
                  </p>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                    Registered Email Address
                  </label>
                  <input
                    type="email"
                    required
                    value={resetEmail}
                    onChange={(e) => setResetEmail(e.target.value)}
                    placeholder="e.g. alexander.tan@atelier.sg"
                    className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                  />
                </div>

                <div className="flex gap-2">
                  <button
                    type="button"
                    onClick={() => setAuthMode("signin")}
                    className="flex-1 py-2.5 rounded-xl border border-gray-300 text-gray-600 font-semibold"
                  >
                    Back to Sign In
                  </button>
                  <button
                    type="submit"
                    className="flex-1 py-2.5 rounded-xl bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand font-bold uppercase tracking-wider shadow-xs"
                  >
                    Send Reset PIN
                  </button>
                </div>
              </form>
            )}

            {/* MODE 4: RESET VERIFICATION & PIN INPUT */}
            {authMode === "reset_verification" && (
              <form onSubmit={handleResetPassword} className="space-y-4 text-xs">
                {simulatedPinNotice && (
                  <div className="p-3 bg-amber-50 border border-amber-300 text-amber-900 rounded-xl text-xs flex items-center justify-between">
                    <div>
                      <span className="font-bold block">Security Reset PIN Sent:</span>
                      <span className="font-mono text-sm font-bold text-amber-800">{simulatedPinNotice}</span>
                    </div>
                    <span className="text-[10px] bg-amber-200 px-2 py-0.5 rounded font-mono">15m expiry</span>
                  </div>
                )}

                <div>
                  <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                    6-Digit Atelier Security PIN *
                  </label>
                  <input
                    type="text"
                    required
                    value={resetCodeInput}
                    onChange={(e) => setResetCodeInput(e.target.value.toUpperCase())}
                    placeholder="e.g. AL-849201"
                    className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 font-mono text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                  />
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                      New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={newPasswordInput}
                      onChange={(e) => setNewPasswordInput(e.target.value)}
                      placeholder="At least 8 chars"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                      Confirm New Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={confirmPasswordInput}
                      onChange={(e) => setConfirmPasswordInput(e.target.value)}
                      placeholder="Re-type password"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso focus:outline-none focus:ring-1 focus:ring-ariel-amber"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full py-3 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-md"
                >
                  Confirm & Update Password
                </button>
              </form>
            )}
          </div>
        ) : (
          /* LOGGED IN MEMBER DASHBOARD */
          <div className="space-y-6">
            {/* Patron Profile Summary Banner */}
            <div className="p-4 bg-white rounded-2xl border border-ariel-tan/30 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                {currentUser?.avatarUrl ? (
                  <img src={currentUser.avatarUrl} alt="Avatar" className="w-12 h-12 rounded-full object-cover" />
                ) : (
                  <div className="w-12 h-12 rounded-full bg-ariel-espresso text-ariel-sand flex items-center justify-center font-serif font-bold text-base">
                    {currentUser?.name.slice(0, 2).toUpperCase()}
                  </div>
                )}
                <div>
                  <h4 className="font-serif text-base font-bold text-ariel-espresso">{currentUser?.name}</h4>
                  <p className="text-xs text-gray-500">
                    {currentUser?.email} &bull; Member via {currentUser?.provider}
                  </p>
                  <span className="inline-block mt-1 text-[10px] font-mono text-amber-800 bg-amber-50 border border-amber-200 px-2 py-0.5 rounded">
                    Monogram: [{currentUser?.monogramInitials}] ({currentUser?.monogramFoil} foil)
                  </span>
                </div>
              </div>

              <button
                onClick={logout}
                className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-600 text-xs font-medium flex items-center gap-1.5 self-end sm:self-auto transition-colors"
              >
                <LogOut className="w-3.5 h-3.5" />
                <span>Sign Out</span>
              </button>
            </div>

            {/* Navigation Tabs */}
            <div className="flex border-b border-ariel-tan/20 gap-2 sm:gap-4 text-xs font-semibold uppercase tracking-wider overflow-x-auto">
              {[
                { id: "profile", label: "Delivery Profile", icon: MapPin },
                { id: "orders", label: `Orders (${currentUser?.orders.length || 0})`, icon: Package },
                { id: "wishlist", label: `Wishlist (${wishlist.length})`, icon: Heart },
                { id: "privacy", label: "Singapore PDPA Hub", icon: ShieldCheck },
              ].map((tab) => {
                const Icon = tab.icon;
                const isActive = activeTab === tab.id;
                return (
                  <button
                    key={tab.id}
                    onClick={() => setActiveTab(tab.id as any)}
                    className={`pb-3 px-1 border-b-2 transition-all flex items-center gap-1.5 shrink-0 ${
                      isActive
                        ? "border-ariel-amber text-ariel-espresso font-bold"
                        : "border-transparent text-gray-400 hover:text-gray-700"
                    }`}
                  >
                    <Icon className="w-3.5 h-3.5" />
                    <span>{tab.label}</span>
                  </button>
                );
              })}
            </div>

            {/* TAB 1: DELIVERY & MONOGRAM PROFILE */}
            {activeTab === "profile" && (
              <form onSubmit={handleSaveProfile} className="space-y-4 text-xs">
                {savedSuccess && (
                  <div className="p-3 bg-emerald-50 border border-emerald-200 text-emerald-800 rounded-xl flex items-center gap-2">
                    <Check className="w-4 h-4 text-emerald-600" />
                    <span>Atelier profile and shipping address updated.</span>
                  </div>
                )}

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">Full Name</label>
                    <input
                      type="text"
                      value={editProfile.name}
                      onChange={(e) => setEditProfile({ ...editProfile, name: e.target.value })}
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">Singapore Mobile</label>
                    <input
                      type="tel"
                      value={editProfile.phone}
                      onChange={(e) => setEditProfile({ ...editProfile, phone: e.target.value })}
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-3 gap-3">
                  <div className="col-span-2">
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                      Street Address
                    </label>
                    <input
                      type="text"
                      value={editProfile.address}
                      onChange={(e) => setEditProfile({ ...editProfile, address: e.target.value })}
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">Unit</label>
                    <input
                      type="text"
                      value={editProfile.unitNumber}
                      onChange={(e) => setEditProfile({ ...editProfile, unitNumber: e.target.value })}
                      placeholder="#18-02"
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso"
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                      Singapore Postal Code
                    </label>
                    <input
                      type="text"
                      maxLength={6}
                      value={editProfile.postalCode}
                      onChange={(e) => setEditProfile({ ...editProfile, postalCode: e.target.value })}
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso font-mono"
                    />
                  </div>

                  <div>
                    <label className="block text-[10px] uppercase font-bold text-gray-600 mb-1">
                      Bespoke Monogram Initials
                    </label>
                    <input
                      type="text"
                      maxLength={3}
                      value={editProfile.monogramInitials}
                      onChange={(e) => setEditProfile({ ...editProfile, monogramInitials: e.target.value.toUpperCase() })}
                      className="w-full bg-white border border-ariel-tan/40 rounded-xl px-3 py-2 text-ariel-espresso font-mono"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  className="py-2.5 px-5 bg-ariel-espresso hover:bg-ariel-cognac text-ariel-sand rounded-xl text-xs font-bold uppercase tracking-wider transition-colors shadow-xs"
                >
                  Save Profile Details
                </button>
              </form>
            )}

            {/* TAB 2: ORDER HISTORY & TAX INVOICES */}
            {activeTab === "orders" && (
              <div className="space-y-4 text-xs">
                {currentUser?.orders && currentUser.orders.length > 0 ? (
                  currentUser.orders.map((order) => (
                    <div
                      key={order.id}
                      className="p-4 bg-white rounded-2xl border border-ariel-tan/30 space-y-3 shadow-2xs"
                    >
                      <div className="flex justify-between items-start pb-2 border-b border-gray-100">
                        <div>
                          <span className="font-mono font-bold text-ariel-espresso">#{order.display_id}</span>
                          <span className="text-[10px] text-gray-400 block">
                            {new Date(order.created_at).toLocaleDateString("en-SG", {
                              day: "numeric",
                              month: "short",
                              year: "numeric",
                            })}
                          </span>
                        </div>
                        <div className="text-right">
                          <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase tracking-wider bg-emerald-50 text-emerald-800 border border-emerald-200">
                            {order.status}
                          </span>
                          <span className="font-serif font-bold text-ariel-espresso block mt-1">
                            S${order.total.toFixed(2)}
                          </span>
                        </div>
                      </div>

                      {/* Items */}
                      <div className="space-y-2">
                        {order.items.map((item, idx) => (
                          <div key={idx} className="flex items-center justify-between">
                            <span className="text-gray-700">
                              {item.title} &times; {item.quantity}
                            </span>
                            <span className="font-mono text-gray-500">S${item.total.toFixed(2)}</span>
                          </div>
                        ))}
                      </div>

                      {/* Logistics Tracking */}
                      <div className="pt-2 border-t border-gray-100 flex justify-between items-center text-[11px] text-gray-500">
                        <span>Courier: {order.easyparcel_courier || "EasyParcel White-Glove"}</span>
                        <span className="font-mono text-amber-800">
                          AWB: {order.easyparcel_awb || order.tracking_number}
                        </span>
                      </div>

                      {/* Action Controls: Singapore Tax Invoice & Returns */}
                      <div className="pt-2.5 border-t border-gray-100 flex flex-wrap items-center justify-between gap-2">
                        <button
                          type="button"
                          onClick={() => setSelectedInvoiceOrder(order)}
                          className="px-3 py-1.5 rounded-xl border border-ariel-tan/40 hover:bg-ariel-sand/40 text-ariel-espresso font-semibold text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <FileText className="w-3.5 h-3.5 text-ariel-amber" />
                          <span>Official Tax Invoice (IRAS 9% GST)</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => setSelectedReturnOrder(order)}
                          className="px-3 py-1.5 rounded-xl border border-gray-200 hover:bg-gray-50 text-gray-700 font-semibold text-[11px] flex items-center gap-1.5 transition-colors shadow-2xs"
                        >
                          <RotateCcw className="w-3.5 h-3.5 text-gray-500" />
                          <span>Request Return / RMA</span>
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Package className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>No commissions placed yet.</p>
                  </div>
                )}

                {/* Medusa RMA Returns & Exchanges Ledger */}
                {currentUser?.returns && currentUser.returns.length > 0 && (
                  <div className="pt-4 border-t border-ariel-tan/20 space-y-3">
                    <div className="flex items-center gap-2">
                      <RotateCcw className="w-4 h-4 text-ariel-amber" />
                      <h5 className="font-serif font-bold text-sm text-ariel-espresso">
                        Medusa Returns & Exchanges (RMA Ledger)
                      </h5>
                    </div>
                    <div className="space-y-2.5">
                      {currentUser.returns.map((ret) => (
                        <div
                          key={ret.id}
                          className="p-3.5 bg-white border border-ariel-tan/30 rounded-2xl space-y-2 text-[11px] shadow-2xs"
                        >
                          <div className="flex justify-between items-start">
                            <div>
                              <span className="font-mono font-bold text-ariel-espresso">RMA-SG-{ret.display_id}</span>
                              <span className="text-[10px] text-gray-500 block">
                                Order #{ret.order_id.slice(-6)} &bull; {new Date(ret.created_at).toLocaleDateString("en-SG")}
                              </span>
                            </div>
                            <span className="px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-amber-50 text-amber-800 border border-amber-200">
                              {ret.status}
                            </span>
                          </div>
                          <div className="flex justify-between text-gray-600">
                            <span>Reason: {ret.reason}</span>
                            <span className="font-bold text-gray-900 font-mono">Refund: S${ret.refund_amount.toFixed(2)} SGD</span>
                          </div>
                          <div className="flex justify-between text-[10px] text-gray-500 pt-1.5 border-t border-gray-100">
                            <span className="capitalize">
                              Logistics: {ret.return_method === "easyparcel_pickup" ? "EasyParcel White-Glove Pickup" : "MBS Flagship Salon Drop-off"}
                            </span>
                            {ret.tracking_number && (
                              <span className="font-mono text-amber-800">Return AWB: {ret.tracking_number}</span>
                            )}
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            )}

            {/* TAB 3: WISHLIST */}
            {activeTab === "wishlist" && (
              <div className="space-y-3 text-xs">
                {wishlist.length > 0 ? (
                  wishlist.map((item) => (
                    <div
                      key={item.id}
                      className="p-3 bg-white rounded-2xl border border-ariel-tan/30 flex items-center justify-between gap-3 shadow-2xs"
                    >
                      <div className="flex items-center gap-3">
                        <img src={item.image_url} alt={item.title} className="w-12 h-12 object-cover rounded-xl" />
                        <div>
                          <h5 className="font-serif font-bold text-ariel-espresso">{item.title}</h5>
                          <span className="font-serif font-bold text-xs text-amber-900">S${item.price_sgd}</span>
                        </div>
                      </div>

                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => onAddToCart(item)}
                          className="px-3 py-1.5 bg-ariel-espresso text-ariel-sand text-[10px] font-bold uppercase rounded-xl hover:bg-ariel-cognac transition-colors"
                        >
                          Add to Bag
                        </button>
                        <button
                          onClick={() => onRemoveFromWishlist(item.id)}
                          className="text-gray-400 hover:text-red-600 p-1"
                        >
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="text-center py-12 text-gray-400">
                    <Heart className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p>Your wishlist is currently empty.</p>
                  </div>
                )}
              </div>
            )}

            {/* TAB 4: SINGAPORE PDPA & PRIVACY RIGHTS HUB */}
            {activeTab === "privacy" && (
              <div className="space-y-5 text-xs">
                <div className="p-4 bg-white rounded-2xl border border-ariel-tan/30 space-y-3">
                  <div className="flex items-center justify-between pb-2 border-b border-gray-100">
                    <div className="flex items-center gap-2">
                      <ShieldCheck className="w-4 h-4 text-emerald-600" />
                      <span className="font-bold text-gray-800">Singapore PDPA Compliance Status</span>
                    </div>
                    <span className="text-[10px] bg-emerald-50 text-emerald-800 border border-emerald-200 px-2 py-0.5 rounded-full font-semibold">
                      Consent Logged
                    </span>
                  </div>

                  <p className="text-gray-600 text-[11px] leading-relaxed">
                    Under the Personal Data Protection Act 2012 (PDPA) of Singapore, you have full statutory rights to
                    access, correct, export, and withdraw consent for your personal data.
                  </p>

                  <div className="grid grid-cols-2 gap-2 text-[10px] text-gray-500 bg-gray-50 p-2.5 rounded-xl">
                    <div>
                      <span>Consent Timestamp:</span>
                      <span className="font-mono block text-gray-700">
                        {currentUser?.pdpa?.consent_timestamp
                          ? new Date(currentUser.pdpa.consent_timestamp).toLocaleString("en-SG")
                          : "Verified"}
                      </span>
                    </div>
                    <div>
                      <span>DSAR Exports Count:</span>
                      <span className="font-mono block text-gray-700">
                        {currentUser?.pdpa?.dsar_export_count || 0} times
                      </span>
                    </div>
                  </div>
                </div>

                {/* 1-Click PDPA Data Subject Access Request (DSAR) Export */}
                <div className="p-4 bg-white rounded-2xl border border-ariel-tan/30 space-y-2">
                  <div className="flex items-center justify-between">
                    <div>
                      <h5 className="font-bold text-gray-800">Download Personal Data Bundle (DSAR)</h5>
                      <p className="text-gray-500 text-[11px]">
                        Export complete JSON packet of your identity, address, orders, searches, and consent logs.
                      </p>
                    </div>
                    <button
                      type="button"
                      onClick={handleDownloadPdpaBundle}
                      className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-100 rounded-xl text-xs font-bold flex items-center gap-1.5 transition-colors shrink-0"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>Export JSON</span>
                    </button>
                  </div>
                </div>

                {/* Marketing & DNC Registry Preferences */}
                <div className="p-4 bg-white rounded-2xl border border-ariel-tan/30 space-y-3">
                  <h5 className="font-bold text-gray-800">Communications & Singapore DNC Registry</h5>
                  <div className="space-y-2 text-[11px]">
                    <label className="flex items-center justify-between cursor-pointer">
                      <span className="text-gray-700">Bespoke Collection & Showcase Emails</span>
                      <input
                        type="checkbox"
                        checked={currentUser?.pdpa?.marketing_email_opt_in || false}
                        onChange={(e) => updatePdpaConsent({ marketingEmail: e.target.checked })}
                        className="rounded accent-ariel-amber"
                      />
                    </label>

                    <label className="flex items-center justify-between cursor-pointer pt-2 border-t border-gray-100">
                      <span className="text-gray-700">VIP Phone / SMS Previews (Singapore DNC)</span>
                      <input
                        type="checkbox"
                        checked={currentUser?.pdpa?.marketing_phone_opt_in || false}
                        onChange={(e) => updatePdpaConsent({ marketingPhone: e.target.checked })}
                        className="rounded accent-ariel-amber"
                      />
                    </label>
                  </div>
                </div>

                {/* Right to Erasure / Forget Me */}
                <div className="p-4 bg-red-50/60 border border-red-200/80 rounded-2xl space-y-2">
                  <h5 className="font-bold text-red-900">Right to Erasure (Withdraw Consent)</h5>
                  <p className="text-red-700 text-[11px] leading-relaxed">
                    Permanently delete and anonymize your personal identifiers. Statutory IRAS accounting invoices are
                    anonymized and preserved for statutory tax audit purposes.
                  </p>
                  <button
                    type="button"
                    onClick={() => setErasureConfirmOpen(true)}
                    className="py-1.5 px-3 bg-red-700 hover:bg-red-800 text-white rounded-xl text-[11px] font-bold uppercase tracking-wider transition-colors"
                  >
                    Request Account Erasure
                  </button>
                </div>

                {/* Erasure Modal */}
                {erasureConfirmOpen && (
                  <div className="fixed inset-0 z-60 bg-black/70 flex items-center justify-center p-4">
                    <div className="bg-white rounded-2xl max-w-sm p-5 space-y-3 text-xs shadow-2xl">
                      <h4 className="font-bold text-gray-900 text-sm">Confirm PDPA Erasure</h4>
                      <p className="text-gray-600 text-[11px]">
                        Are you sure you wish to withdraw consent and erase your profile? All personal records,
                        monogram preferences, and saved addresses will be purged.
                      </p>
                      <div className="flex gap-2 pt-2">
                        <button
                          onClick={() => setErasureConfirmOpen(false)}
                          className="flex-1 py-2 border rounded-xl text-gray-600"
                        >
                          Cancel
                        </button>
                        <button
                          onClick={handleConfirmErasure}
                          className="flex-1 py-2 bg-red-700 text-white rounded-xl font-bold"
                        >
                          Erase My Data
                        </button>
                      </div>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>

      {/* Official Singapore Tax Invoice Modal */}
      {selectedInvoiceOrder && (
        <SingaporeTaxInvoiceModal
          order={selectedInvoiceOrder}
          onClose={() => setSelectedInvoiceOrder(null)}
        />
      )}

      {/* Medusa Boutique RMA Return Request Modal */}
      {selectedReturnOrder && (
        <CustomerReturnModal
          order={selectedReturnOrder}
          onClose={() => setSelectedReturnOrder(null)}
        />
      )}
    </div>
  );
}
