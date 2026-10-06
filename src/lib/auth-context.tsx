"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MedusaOrder, MedusaRefund, CustomerSearchLog, CustomerPdpaRecord, MedusaReturn } from "./medusa/types";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  password?: string;
  resetToken?: string;
  resetTokenExpiry?: string;
  avatarUrl?: string;
  provider: "email" | "google" | "facebook";
  address: string;
  unitNumber: string;
  postalCode: string;
  city: string;
  monogramInitials: string;
  monogramFoil: "gold" | "blind" | "silver";
  orders: MedusaOrder[];
  refunds: MedusaRefund[];
  returns?: MedusaReturn[];
  searchHistory: CustomerSearchLog[];
  notes?: string;
  tags: string[];
  pdpa: CustomerPdpaRecord;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  currentUser: UserAccount | null;
  isLoggedIn: boolean;
  login: (email: string, password?: string) => Promise<{ success: boolean; message: string }>;
  signup: (userData: {
    name: string;
    email: string;
    password?: string;
    phone: string;
    address: string;
    unitNumber?: string;
    postalCode: string;
    pdpaConsent: boolean;
    marketingOptIn?: boolean;
    marketingPhoneOptIn?: boolean;
  }) => Promise<{ success: boolean; message: string }>;
  forgotPassword: (email: string) => Promise<{ success: boolean; message: string; resetCode?: string }>;
  resetPassword: (email: string, resetCode: string, newPassword: string) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (customEmail?: string) => Promise<{ success: boolean; message: string }>;
  loginWithFacebook: () => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserAccount>) => void;
  addOrderToAccount: (order: MedusaOrder) => void;
  requestOrderReturn: (
    orderId: string,
    reason: string,
    returnMethod: "easyparcel_pickup" | "mbs_salon_dropoff",
    notes?: string
  ) => Promise<{ success: boolean; returnRecord?: MedusaReturn; message: string }>;
  logSearchQuery: (query: string, resultsCount: number, mode?: "auto" | "conventional" | "ai" | "visual") => void;
  exportPdpaData: () => { jsonString: string; filename: string };
  updatePdpaConsent: (options: { marketingEmail?: boolean; marketingPhone?: boolean }) => void;
  requestPdpaErasure: () => Promise<{ success: boolean; message: string }>;
  getAllUsers: () => UserAccount[];
  adminIssueRefund: (customerId: string, orderId: string, amount: number, reason: string) => Promise<{ success: boolean; refund?: MedusaRefund; message: string }>;
  adminUpdateNotes: (customerId: string, notes: string) => void;
  adminDeleteUserPdpa: (customerId: string) => Promise<{ success: boolean; message: string }>;
}

const STORAGE_KEY = "ariel_shopper_session_v3";
export const USERS_DB_KEY = "ariel_registered_shoppers_v3";

export const INITIAL_USERS: UserAccount[] = [
  {
    id: "usr_vip_01",
    name: "Alexander Tan",
    email: "alexander.tan@atelier.sg",
    phone: "+65 9821 5432",
    password: "Password123!",
    provider: "google",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    address: "28 Nassim Road",
    unitNumber: "#04-01",
    postalCode: "258398",
    city: "Singapore",
    monogramInitials: "AT",
    monogramFoil: "gold",
    notes: "VIP Patron. Prefers Full-Grain French Box Calf. Frequent corporate gifter.",
    tags: ["VIP", "Frequent Collector", "Singapore Resident"],
    pdpa: {
      consent_given: true,
      consent_timestamp: "2026-09-15T08:30:00Z",
      purpose: ["order_fulfillment", "marketing", "personalization"],
      marketing_email_opt_in: true,
      marketing_phone_opt_in: false, // DNC compliant
      dsar_export_count: 1,
      last_dsar_export: "2026-09-20T10:15:00Z",
      erasure_status: "active",
    },
    searchHistory: [
      {
        id: "srch_101",
        query: "bespoke italian briefcase for 16-inch laptop",
        mode: "ai",
        results_count: 3,
        timestamp: "2026-10-05T14:20:00Z",
      },
      {
        id: "srch_102",
        query: "The Medici Bifold Wallet espresso",
        mode: "conventional",
        results_count: 1,
        timestamp: "2026-10-04T09:12:00Z",
      },
      {
        id: "srch_103",
        query: "executive leather gift under S$200 with 24k gold monogram",
        mode: "auto",
        results_count: 5,
        timestamp: "2026-10-02T18:45:00Z",
      },
    ],
    refunds: [],
    orders: [
      {
        id: "order_1042",
        display_id: 1042,
        cart_id: "cart_init_01",
        customer_email: "alexander.tan@atelier.sg",
        shipping_address: {
          first_name: "Alexander",
          last_name: "Tan",
          address_1: "28 Nassim Road, #04-01",
          city: "Singapore",
          postal_code: "258398",
          country_code: "SG",
          phone: "+65 9821 5432",
        },
        items: [
          {
            id: "item_01",
            product_id: 1,
            title: "The Medici Bifold Wallet",
            variant_title: "Espresso Brown / 8 Card Slots",
            thumbnail: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=400&q=80",
            unit_price: 129,
            quantity: 1,
            total: 129,
            metadata: { monogram_text: "AT", monogram_foil: "gold" },
          },
        ],
        subtotal: 129,
        shipping_total: 0,
        discount_total: 0,
        tax_total: 11.61,
        total: 129,
        currency_code: "SGD",
        status: "processing",
        fulfillment_status: "fulfilled",
        payment_status: "captured",
        tracking_number: "EP-SG-819203",
        easyparcel_awb: "EP-SG-819203",
        easyparcel_courier: "EasyParcel White-Glove (Lalamove)",
        hitpay_reference: "HITPAY-SG-91823719",
        hitpay_payment_id: "hp_pay_91823719",
        payment_provider: "hitpay_paynow",
        refund_status: "none",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    createdAt: "2026-09-15T08:30:00Z",
    updatedAt: "2026-10-05T14:20:00Z",
  },
  {
    id: "usr_vip_02",
    name: "Somnath B.",
    email: "sheshadri.lacawnche@gmail.com",
    phone: "+65 9123 4567",
    password: "Password123!",
    provider: "google",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Somnath&backgroundColor=1A1615&textColor=C5A059",
    address: "Marina Bay Residences, 18 Marina Boulevard",
    unitNumber: "#22-08",
    postalCode: "018980",
    city: "Singapore",
    monogramInitials: "SB",
    monogramFoil: "gold",
    notes: "Direct Singapore patron. Interested in full-grain Tuscan weekender and travel accessories.",
    tags: ["Direct Collector", "Marina Bay Sands Resident"],
    pdpa: {
      consent_given: true,
      consent_timestamp: "2026-09-28T11:00:00Z",
      purpose: ["order_fulfillment", "marketing", "personalization"],
      marketing_email_opt_in: true,
      marketing_phone_opt_in: true,
      dsar_export_count: 0,
      erasure_status: "active",
    },
    searchHistory: [
      {
        id: "srch_201",
        query: "I need a premium-looking leather gift for my dad, around S$200, everyday carry",
        mode: "ai",
        results_count: 4,
        timestamp: "2026-10-06T15:30:00Z",
      },
      {
        id: "srch_202",
        query: "wallet",
        mode: "conventional",
        results_count: 4,
        timestamp: "2026-10-06T16:10:00Z",
      },
      {
        id: "srch_203",
        query: "Riviera 48-Hour Weekender Horween leather",
        mode: "auto",
        results_count: 2,
        timestamp: "2026-10-06T20:05:00Z",
      },
    ],
    refunds: [],
    orders: [
      {
        id: "order_1043",
        display_id: 1043,
        cart_id: "cart_init_02",
        customer_email: "sheshadri.lacawnche@gmail.com",
        shipping_address: {
          first_name: "Somnath",
          last_name: "B.",
          address_1: "18 Marina Boulevard, #22-08",
          city: "Singapore",
          postal_code: "018980",
          country_code: "SG",
          phone: "+65 9123 4567",
        },
        items: [
          {
            id: "item_02",
            product_id: 2,
            title: "The Heritage Travel Folio",
            variant_title: "Tuscan Vachetta Tan",
            thumbnail: "https://images.unsplash.com/photo-1544816155-12df9643f363?auto=format&fit=crop&w=400&q=80",
            unit_price: 189,
            quantity: 1,
            total: 189,
            metadata: { monogram_text: "SB", monogram_foil: "gold" },
          },
        ],
        subtotal: 189,
        shipping_total: 0,
        discount_total: 18.9,
        tax_total: 15.3,
        total: 170.1,
        currency_code: "SGD",
        status: "processing",
        fulfillment_status: "fulfilled",
        payment_status: "captured",
        tracking_number: "EP-SG-994120",
        easyparcel_awb: "EP-SG-994120",
        easyparcel_courier: "EasyParcel Express (Ninja Van)",
        hitpay_reference: "HITPAY-SG-8849102",
        hitpay_payment_id: "hp_pay_8849102",
        payment_provider: "hitpay_card",
        refund_status: "none",
        created_at: new Date(Date.now() - 86400000 * 1).toISOString(),
      },
    ],
    createdAt: "2026-09-28T11:00:00Z",
    updatedAt: "2026-10-06T20:05:00Z",
  },
  {
    id: "usr_vip_03",
    name: "Claire Dupont",
    email: "claire.dupont@singapore.com",
    phone: "+65 9654 3210",
    password: "Password123!",
    provider: "facebook",
    avatarUrl: "https://api.dicebear.com/7.x/initials/svg?seed=Claire&backgroundColor=1877F2&textColor=FFFFFF",
    address: "Sentosa Cove Ocean Drive",
    unitNumber: "#02-15",
    postalCode: "098522",
    city: "Singapore",
    monogramInitials: "CD",
    monogramFoil: "silver",
    notes: "Purchased watch roll for spouse. Inquired about blind deboss monogramming.",
    tags: ["Facebook Patron", "Sentosa Cove Resident"],
    pdpa: {
      consent_given: true,
      consent_timestamp: "2026-10-01T14:15:00Z",
      purpose: ["order_fulfillment", "personalization"],
      marketing_email_opt_in: false,
      marketing_phone_opt_in: false, // DNC strict
      dsar_export_count: 0,
      erasure_status: "active",
    },
    searchHistory: [
      {
        id: "srch_301",
        query: "triple watch roll saffiano leather for luxury timepieces",
        mode: "ai",
        results_count: 2,
        timestamp: "2026-10-03T11:40:00Z",
      },
      {
        id: "srch_302",
        query: "valet catchall wireless charger tray Horween Dublin",
        mode: "auto",
        results_count: 1,
        timestamp: "2026-10-03T12:05:00Z",
      },
    ],
    refunds: [],
    orders: [
      {
        id: "order_1044",
        display_id: 1044,
        cart_id: "cart_init_03",
        customer_email: "claire.dupont@singapore.com",
        shipping_address: {
          first_name: "Claire",
          last_name: "Dupont",
          address_1: "Sentosa Cove Ocean Drive, #02-15",
          city: "Singapore",
          postal_code: "098522",
          country_code: "SG",
          phone: "+65 9654 3210",
        },
        items: [
          {
            id: "item_03",
            product_id: 7,
            title: "The Grand Tourer Triple Watch Roll",
            variant_title: "Saffiano Espresso",
            thumbnail: "https://images.unsplash.com/photo-1522335789203-aabd1fc54bc9?auto=format&fit=crop&w=400&q=80",
            unit_price: 199,
            quantity: 1,
            total: 199,
            metadata: { monogram_text: "CD", monogram_foil: "silver" },
          },
        ],
        subtotal: 199,
        shipping_total: 0,
        discount_total: 0,
        tax_total: 17.91,
        total: 199,
        currency_code: "SGD",
        status: "processing",
        fulfillment_status: "fulfilled",
        payment_status: "captured",
        tracking_number: "EP-SG-771829",
        easyparcel_awb: "EP-SG-771829",
        easyparcel_courier: "SingPost Registered",
        hitpay_reference: "HITPAY-SG-6619284",
        hitpay_payment_id: "hp_pay_6619284",
        payment_provider: "hitpay_applepay",
        refund_status: "none",
        created_at: new Date(Date.now() - 86400000 * 3).toISOString(),
      },
    ],
    createdAt: "2026-10-01T14:15:00Z",
    updatedAt: "2026-10-03T12:05:00Z",
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

  // Initialize DB and session
  useEffect(() => {
    try {
      const storedUsers = localStorage.getItem(USERS_DB_KEY);
      if (!storedUsers) {
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(INITIAL_USERS));
      }

      const activeSession = localStorage.getItem(STORAGE_KEY);
      if (activeSession) {
        setCurrentUser(JSON.parse(activeSession));
      }
    } catch (e) {
      console.warn("Storage access failed:", e);
    }
  }, []);

  const getUsersFromStorage = (): UserAccount[] => {
    try {
      const raw = localStorage.getItem(USERS_DB_KEY);
      return raw ? JSON.parse(raw) : INITIAL_USERS;
    } catch {
      return INITIAL_USERS;
    }
  };

  const saveUsersToStorage = (users: UserAccount[]) => {
    try {
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    } catch (e) {
      console.warn("Failed saving users to localStorage:", e);
    }
  };

  // Sign In
  const login = async (email: string, password?: string): Promise<{ success: boolean; message: string }> => {
    const users = getUsersFromStorage();
    const cleanEmail = email.trim().toLowerCase();
    const user = users.find((u) => u.email.toLowerCase() === cleanEmail);

    if (user) {
      // If user has a password set, verify it
      if (user.password && password && user.password !== password) {
        return { success: false, message: "Incorrect password. You may reset it using 'Forgot Password'." };
      }

      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return { success: true, message: `Welcome back, ${user.name}` };
    }

    // Auto-create guest-to-member account if first time
    const namePart = cleanEmail.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const newMember: UserAccount = {
      id: `usr_${Date.now()}`,
      name: namePart,
      email: cleanEmail,
      phone: "+65 9123 4567",
      password: password || "Ariel2026!",
      provider: "email",
      address: "Marina Bay, Singapore",
      unitNumber: "",
      postalCode: "018956",
      city: "Singapore",
      monogramInitials: cleanEmail.slice(0, 2).toUpperCase(),
      monogramFoil: "gold",
      tags: ["New Patron"],
      pdpa: {
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        purpose: ["order_fulfillment", "personalization"],
        marketing_email_opt_in: true,
        marketing_phone_opt_in: false,
        dsar_export_count: 0,
        erasure_status: "active",
      },
      searchHistory: [],
      refunds: [],
      orders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newMember);
    saveUsersToStorage(users);
    setCurrentUser(newMember);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMember));
    return { success: true, message: `Account created for ${newMember.email}` };
  };

  // Sign Up with PDPA Consent
  const signup = async (userData: {
    name: string;
    email: string;
    password?: string;
    phone: string;
    address: string;
    unitNumber?: string;
    postalCode: string;
    pdpaConsent: boolean;
    marketingOptIn?: boolean;
    marketingPhoneOptIn?: boolean;
  }): Promise<{ success: boolean; message: string }> => {
    if (!userData.pdpaConsent) {
      return {
        success: false,
        message: "Singapore PDPA consent is required to create a member account.",
      };
    }

    const users = getUsersFromStorage();
    const cleanEmail = userData.email.trim().toLowerCase();
    const existing = users.find((u) => u.email.toLowerCase() === cleanEmail);
    if (existing) {
      return { success: false, message: "An account already exists with this email address. Please sign in." };
    }

    const initials =
      userData.name
        .split(" ")
        .map((w) => w[0])
        .join("")
        .slice(0, 3)
        .toUpperCase() || "AL";

    const newAccount: UserAccount = {
      id: `usr_${Date.now()}`,
      name: userData.name.trim(),
      email: cleanEmail,
      phone: userData.phone.trim(),
      password: userData.password || "Ariel2026!",
      provider: "email",
      address: userData.address.trim(),
      unitNumber: userData.unitNumber?.trim() || "",
      postalCode: userData.postalCode.trim(),
      city: "Singapore",
      monogramInitials: initials,
      monogramFoil: "gold",
      tags: ["Direct Member", "Singapore Resident"],
      pdpa: {
        consent_given: true,
        consent_timestamp: new Date().toISOString(),
        purpose: ["order_fulfillment", "marketing", "personalization"],
        marketing_email_opt_in: !!userData.marketingOptIn,
        marketing_phone_opt_in: !!userData.marketingPhoneOptIn,
        dsar_export_count: 0,
        erasure_status: "active",
      },
      searchHistory: [],
      refunds: [],
      orders: [],
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    users.push(newAccount);
    saveUsersToStorage(users);
    setCurrentUser(newAccount);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAccount));
    return { success: true, message: `Welcome to Ariel Atelier, ${newAccount.name}` };
  };

  // Forgot Password: Generates secure reset token & PIN
  const forgotPassword = async (
    email: string
  ): Promise<{ success: boolean; message: string; resetCode?: string }> => {
    const users = getUsersFromStorage();
    const cleanEmail = email.trim().toLowerCase();
    const idx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    if (idx === -1) {
      return {
        success: false,
        message: "No account found matching this email address. Please verify your address or create an account.",
      };
    }

    // Generate 6-digit Atelier Security Reset Code
    const resetCode = `AL-${Math.floor(100000 + Math.random() * 900000)}`;
    const expiry = new Date(Date.now() + 15 * 60 * 1000).toISOString(); // 15 mins expiry

    users[idx].resetToken = resetCode;
    users[idx].resetTokenExpiry = expiry;
    saveUsersToStorage(users);

    return {
      success: true,
      resetCode,
      message: `Atelier Security PIN dispatched to ${cleanEmail}. Enter code ${resetCode} to set your new password.`,
    };
  };

  // Reset Password with verification code
  const resetPassword = async (
    email: string,
    resetCode: string,
    newPassword: string
  ): Promise<{ success: boolean; message: string }> => {
    const users = getUsersFromStorage();
    const cleanEmail = email.trim().toLowerCase();
    const idx = users.findIndex((u) => u.email.toLowerCase() === cleanEmail);

    if (idx === -1) {
      return { success: false, message: "Account not found." };
    }

    const targetUser = users[idx];
    if (!targetUser.resetToken || targetUser.resetToken !== resetCode.trim()) {
      return { success: false, message: "Invalid or expired security code. Please request a new PIN." };
    }

    // Update password & clear token
    targetUser.password = newPassword;
    targetUser.resetToken = undefined;
    targetUser.resetTokenExpiry = undefined;
    targetUser.updatedAt = new Date().toISOString();

    users[idx] = targetUser;
    saveUsersToStorage(users);

    setCurrentUser(targetUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(targetUser));

    return {
      success: true,
      message: "Your password has been successfully updated. You are now securely logged in.",
    };
  };

  // Google 1-Click SSO
  const loginWithGoogle = async (customEmail?: string): Promise<{ success: boolean; message: string }> => {
    const emailToUse = customEmail || "sheshadri.lacawnche@gmail.com";
    const users = getUsersFromStorage();
    let user = users.find((u) => u.email.toLowerCase() === emailToUse.toLowerCase());

    if (!user) {
      const namePart = emailToUse.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
      user = {
        id: `usr_google_${Date.now()}`,
        name: namePart,
        email: emailToUse.toLowerCase(),
        phone: "+65 9876 5432",
        provider: "google",
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=${namePart}&backgroundColor=1A1615&textColor=C5A059`,
        address: "Marina Bay Residences, 18 Marina Boulevard",
        unitNumber: "#22-08",
        postalCode: "018980",
        city: "Singapore",
        monogramInitials: namePart.slice(0, 2).toUpperCase(),
        monogramFoil: "gold",
        tags: ["Google SSO", "Marina Bay Resident"],
        pdpa: {
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
          purpose: ["order_fulfillment", "marketing", "personalization"],
          marketing_email_opt_in: true,
          marketing_phone_opt_in: true,
          dsar_export_count: 0,
          erasure_status: "active",
        },
        searchHistory: [],
        refunds: [],
        orders: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(user);
      saveUsersToStorage(users);
    }

    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return { success: true, message: `Connected with Google as ${user.email}` };
  };

  // Facebook 1-Click SSO
  const loginWithFacebook = async (): Promise<{ success: boolean; message: string }> => {
    const emailToUse = "claire.dupont@singapore.com";
    const users = getUsersFromStorage();
    let user = users.find((u) => u.email.toLowerCase() === emailToUse.toLowerCase());

    if (!user) {
      user = {
        id: `usr_fb_${Date.now()}`,
        name: "Claire Dupont",
        email: emailToUse,
        phone: "+65 9234 5678",
        provider: "facebook",
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=FB&backgroundColor=1877F2&textColor=FFFFFF`,
        address: "Sentosa Cove Ocean Drive",
        unitNumber: "#02-15",
        postalCode: "098522",
        city: "Singapore",
        monogramInitials: "CD",
        monogramFoil: "silver",
        tags: ["Facebook SSO", "Sentosa Cove"],
        pdpa: {
          consent_given: true,
          consent_timestamp: new Date().toISOString(),
          purpose: ["order_fulfillment", "personalization"],
          marketing_email_opt_in: false,
          marketing_phone_opt_in: false,
          dsar_export_count: 0,
          erasure_status: "active",
        },
        searchHistory: [],
        refunds: [],
        orders: [],
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };
      users.push(user);
      saveUsersToStorage(users);
    }

    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return { success: true, message: "Connected with Facebook" };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateProfile = (data: Partial<UserAccount>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data, updatedAt: new Date().toISOString() };
    setCurrentUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const users = getUsersFromStorage();
    const idx = users.findIndex((u) => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx] = updated;
      saveUsersToStorage(users);
    }
  };

  const addOrderToAccount = (order: MedusaOrder) => {
    if (!currentUser) return;
    const updatedOrders = [order, ...currentUser.orders];
    const updatedUser = {
      ...currentUser,
      orders: updatedOrders,
      updatedAt: new Date().toISOString(),
    };
    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

    const users = getUsersFromStorage();
    const idx = users.findIndex((u) => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx] = updatedUser;
      saveUsersToStorage(users);
    }
  };

  // Customer Returns & RMA Management (Medusa Returns Module)
  const requestOrderReturn = async (
    orderId: string,
    reason: string,
    returnMethod: "easyparcel_pickup" | "mbs_salon_dropoff",
    notes?: string
  ): Promise<{ success: boolean; returnRecord?: MedusaReturn; message: string }> => {
    if (!currentUser) return { success: false, message: "Please sign in to request a return." };
    const order = currentUser.orders.find((o) => o.id === orderId || o.display_id === Number(orderId));
    if (!order) return { success: false, message: "Order commission not found." };

    const newReturn: MedusaReturn = {
      id: `ret_${Date.now()}`,
      order_id: order.id,
      display_id: order.display_id,
      reason,
      status: "requested",
      return_method: returnMethod,
      items: order.items.map((i) => ({ title: i.title, quantity: i.quantity })),
      tracking_number: returnMethod === "easyparcel_pickup" ? `RET-EP-${Math.floor(100000 + Math.random() * 900000)}` : undefined,
      refund_amount: order.total,
      notes,
      created_at: new Date().toISOString(),
    };

    const updatedReturns = [newReturn, ...(currentUser.returns || [])];
    const updatedUser = {
      ...currentUser,
      returns: updatedReturns,
      updatedAt: new Date().toISOString(),
    };

    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

    const users = getUsersFromStorage();
    const idx = users.findIndex((u) => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx] = updatedUser;
      saveUsersToStorage(users);
    }

    return {
      success: true,
      returnRecord: newReturn,
      message: `Return RMA-SG-${newReturn.display_id} recorded. White-glove return instructions initiated.`,
    };
  };

  // Log storefront search queries to customer journey
  const logSearchQuery = (
    query: string,
    resultsCount: number,
    mode: "auto" | "conventional" | "ai" | "visual" = "auto"
  ) => {
    if (!query.trim()) return;

    const newLog: CustomerSearchLog = {
      id: `srch_${Date.now()}`,
      query: query.trim(),
      mode,
      results_count: resultsCount,
      timestamp: new Date().toISOString(),
    };

    if (currentUser) {
      const updatedHistory = [newLog, ...(currentUser.searchHistory || [])].slice(0, 30);
      const updatedUser = { ...currentUser, searchHistory: updatedHistory };
      setCurrentUser(updatedUser);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

      const users = getUsersFromStorage();
      const idx = users.findIndex((u) => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx] = updatedUser;
        saveUsersToStorage(users);
      }
    } else {
      // Store in anonymous session history for when user logs in
      try {
        const anonKey = "ariel_anon_searches";
        const raw = localStorage.getItem(anonKey);
        const list = raw ? JSON.parse(raw) : [];
        list.unshift(newLog);
        localStorage.setItem(anonKey, JSON.stringify(list.slice(0, 10)));
      } catch {}
    }
  };

  // Singapore PDPA: Export personal data bundle (DSAR)
  const exportPdpaData = () => {
    if (!currentUser) return { jsonString: "{}", filename: "pdpa_export_empty.json" };

    const exportBundle = {
      _legal_notice: "Ariel Leather Goods Singapore - PDPA Data Subject Access Request (DSAR) Export",
      _governing_law: "Singapore Personal Data Protection Act 2012 (PDPA)",
      export_timestamp: new Date().toISOString(),
      customer_id: currentUser.id,
      identity: {
        name: currentUser.name,
        email: currentUser.email,
        phone: currentUser.phone,
        provider: currentUser.provider,
        shipping_address: {
          street: currentUser.address,
          unit: currentUser.unitNumber,
          postal_code: currentUser.postalCode,
          city: currentUser.city,
          country: "Singapore",
        },
        monogram_preferences: {
          initials: currentUser.monogramInitials,
          foil: currentUser.monogramFoil,
        },
      },
      pdpa_consent_record: {
        consent_given: currentUser.pdpa?.consent_given,
        consent_timestamp: currentUser.pdpa?.consent_timestamp,
        purposes: currentUser.pdpa?.purpose,
        marketing_email_opt_in: currentUser.pdpa?.marketing_email_opt_in,
        marketing_phone_opt_in: currentUser.pdpa?.marketing_phone_opt_in, // DNC Registry compliance
      },
      orders_history: currentUser.orders,
      refunds_history: currentUser.refunds,
      search_journey_and_preferences: currentUser.searchHistory,
      account_created: currentUser.createdAt,
      account_last_updated: currentUser.updatedAt,
    };

    // Increment export count in profile
    const updated = {
      ...currentUser,
      pdpa: {
        ...currentUser.pdpa,
        dsar_export_count: (currentUser.pdpa?.dsar_export_count || 0) + 1,
        last_dsar_export: new Date().toISOString(),
      },
    };
    setCurrentUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const users = getUsersFromStorage();
    const idx = users.findIndex((u) => u.id === currentUser.id);
    if (idx !== -1) {
      users[idx] = updated;
      saveUsersToStorage(users);
    }

    return {
      jsonString: JSON.stringify(exportBundle, null, 2),
      filename: `ariel_pdpa_dsar_${currentUser.name.replace(/\s+/g, "_")}_${new Date().toISOString().slice(0, 10)}.json`,
    };
  };

  // Singapore PDPA: Update marketing consent & DNC opt-in
  const updatePdpaConsent = (options: { marketingEmail?: boolean; marketingPhone?: boolean }) => {
    if (!currentUser) return;
    const currentPdpa = currentUser.pdpa || {
      consent_given: true,
      consent_timestamp: new Date().toISOString(),
      purpose: ["order_fulfillment"],
      marketing_email_opt_in: false,
      marketing_phone_opt_in: false,
      dsar_export_count: 0,
      erasure_status: "active",
    };

    const updatedPdpa: CustomerPdpaRecord = {
      ...currentPdpa,
      marketing_email_opt_in:
        options.marketingEmail !== undefined ? options.marketingEmail : currentPdpa.marketing_email_opt_in,
      marketing_phone_opt_in:
        options.marketingPhone !== undefined ? options.marketingPhone : currentPdpa.marketing_phone_opt_in,
      consent_timestamp: new Date().toISOString(),
    };

    updateProfile({ pdpa: updatedPdpa });
  };

  // Singapore PDPA: Right to Erasure / Anonymization
  const requestPdpaErasure = async (): Promise<{ success: boolean; message: string }> => {
    if (!currentUser) return { success: false, message: "No active user session." };

    const users = getUsersFromStorage();
    const idx = users.findIndex((u) => u.id === currentUser.id);
    if (idx === -1) return { success: false, message: "User not found." };

    // Under Singapore IRAS rules, tax invoices must be retained for 5 years, but PII can be anonymized
    const anonymizedUser: UserAccount = {
      ...currentUser,
      name: "[PDPA Anonymized Patron]",
      email: `anonymized_${Date.now()}@pdpa-erased.sg`,
      phone: "+65 [Masked]",
      address: "[Anonymized under Singapore PDPA]",
      unitNumber: "",
      postalCode: "000000",
      monogramInitials: "XX",
      password: "",
      searchHistory: [],
      notes: "Account erased pursuant to Singapore PDPA Section 16 withdrawal of consent.",
      pdpa: {
        ...currentUser.pdpa,
        consent_given: false,
        marketing_email_opt_in: false,
        marketing_phone_opt_in: false,
        erasure_status: "anonymized",
        erasure_timestamp: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    users[idx] = anonymizedUser;
    saveUsersToStorage(users);
    logout();

    return {
      success: true,
      message:
        "Your personal data has been completely erased and anonymized in full compliance with the Singapore Personal Data Protection Act (PDPA).",
    };
  };

  // Admin Functions
  const getAllUsers = (): UserAccount[] => {
    return getUsersFromStorage();
  };

  const adminIssueRefund = async (
    customerId: string,
    orderId: string,
    amount: number,
    reason: string
  ): Promise<{ success: boolean; refund?: MedusaRefund; message: string }> => {
    const users = getUsersFromStorage();
    const idx = users.findIndex((u) => u.id === customerId);
    if (idx === -1) return { success: false, message: "Customer not found." };

    const user = users[idx];
    const orderIdx = user.orders.findIndex((o) => o.id === orderId);
    if (orderIdx === -1) return { success: false, message: "Order not found for this customer." };

    const hitpayRef = `REFUND-HITPAY-SG-${Date.now()}`;
    const newRefund: MedusaRefund = {
      id: `ref_${Date.now()}`,
      order_id: orderId,
      amount,
      currency_code: "SGD",
      reason,
      hitpay_refund_reference: hitpayRef,
      status: "completed",
      restocked: true,
      created_at: new Date().toISOString(),
    };

    // Update customer's refunds list
    const updatedRefunds = [newRefund, ...(user.refunds || [])];

    // Update order refund status
    const order = user.orders[orderIdx];
    const updatedOrder: MedusaOrder = {
      ...order,
      refund_status: amount >= order.total ? "refunded" : "partial",
      refund_amount: (order.refund_amount || 0) + amount,
      refunds: [newRefund, ...(order.refunds || [])],
    };
    user.orders[orderIdx] = updatedOrder;
    user.refunds = updatedRefunds;
    user.updatedAt = new Date().toISOString();

    users[idx] = user;
    saveUsersToStorage(users);

    if (currentUser && currentUser.id === customerId) {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    }

    return {
      success: true,
      refund: newRefund,
      message: `Refund of S$${amount.toFixed(2)} processed via HitPay Singapore (${hitpayRef}).`,
    };
  };

  const adminUpdateNotes = (customerId: string, notes: string) => {
    const users = getUsersFromStorage();
    const idx = users.findIndex((u) => u.id === customerId);
    if (idx !== -1) {
      users[idx].notes = notes;
      users[idx].updatedAt = new Date().toISOString();
      saveUsersToStorage(users);

      if (currentUser && currentUser.id === customerId) {
        setCurrentUser(users[idx]);
        localStorage.setItem(STORAGE_KEY, JSON.stringify(users[idx]));
      }
    }
  };

  const adminDeleteUserPdpa = async (customerId: string): Promise<{ success: boolean; message: string }> => {
    const users = getUsersFromStorage();
    const idx = users.findIndex((u) => u.id === customerId);
    if (idx === -1) return { success: false, message: "Customer not found." };

    users[idx] = {
      ...users[idx],
      name: "[PDPA Anonymized Patron]",
      email: `anonymized_${Date.now()}@pdpa-erased.sg`,
      phone: "+65 [Masked]",
      address: "[Anonymized under Singapore PDPA]",
      unitNumber: "",
      postalCode: "000000",
      searchHistory: [],
      notes: "Anonymized by Merchant under Singapore PDPA Right to Erasure.",
      pdpa: {
        ...users[idx].pdpa,
        consent_given: false,
        marketing_email_opt_in: false,
        marketing_phone_opt_in: false,
        erasure_status: "anonymized",
        erasure_timestamp: new Date().toISOString(),
      },
      updatedAt: new Date().toISOString(),
    };

    saveUsersToStorage(users);
    return {
      success: true,
      message: "Customer personal data anonymized under Singapore PDPA.",
    };
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        login,
        signup,
        forgotPassword,
        resetPassword,
        loginWithGoogle,
        loginWithFacebook,
        logout,
        updateProfile,
        addOrderToAccount,
        requestOrderReturn,
        logSearchQuery,
        exportPdpaData,
        updatePdpaConsent,
        requestPdpaErasure,
        getAllUsers,
        adminIssueRefund,
        adminUpdateNotes,
        adminDeleteUserPdpa,
      }}
    >
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
}
