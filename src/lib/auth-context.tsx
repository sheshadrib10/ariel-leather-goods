"use client";

import React, { createContext, useContext, useState, useEffect } from "react";
import { MedusaOrder } from "./medusa/types";

export interface UserAccount {
  id: string;
  name: string;
  email: string;
  phone: string;
  avatarUrl?: string;
  provider: "email" | "google" | "facebook";
  address: string;
  unitNumber: string;
  postalCode: string;
  city: string;
  monogramInitials: string;
  monogramFoil: "gold" | "blind" | "silver";
  orders: MedusaOrder[];
  createdAt: string;
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
  }) => Promise<{ success: boolean; message: string }>;
  loginWithGoogle: (customEmail?: string) => Promise<{ success: boolean; message: string }>;
  loginWithFacebook: () => Promise<{ success: boolean; message: string }>;
  logout: () => void;
  updateProfile: (data: Partial<UserAccount>) => void;
  addOrderToAccount: (order: MedusaOrder) => void;
}

const STORAGE_KEY = "ariel_shopper_session_v2";
const USERS_DB_KEY = "ariel_registered_shoppers_v2";

const INITIAL_USERS: UserAccount[] = [
  {
    id: "usr_vip_01",
    name: "Alexander Tan",
    email: "alexander.tan@atelier.sg",
    phone: "+65 9821 5432",
    provider: "google",
    avatarUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&w=150&q=80",
    address: "28 Nassim Road",
    unitNumber: "#04-01",
    postalCode: "258398",
    city: "Singapore",
    monogramInitials: "AT",
    monogramFoil: "gold",
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
        tracking_number: "SG-EXP-918273",
        created_at: new Date(Date.now() - 86400000 * 2).toISOString(),
      },
    ],
    createdAt: "2026-09-15T08:30:00Z",
  },
];

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export function AuthProvider({ children }: { children: React.ReactNode }) {
  const [currentUser, setCurrentUser] = useState<UserAccount | null>(null);

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

  const login = async (email: string): Promise<{ success: boolean; message: string }> => {
    const rawUsers = localStorage.getItem(USERS_DB_KEY);
    const users: UserAccount[] = rawUsers ? JSON.parse(rawUsers) : INITIAL_USERS;

    const user = users.find((u) => u.email.toLowerCase() === email.trim().toLowerCase());
    if (user) {
      setCurrentUser(user);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
      return { success: true, message: `Welcome back, ${user.name}` };
    }

    // Auto-create guest-to-member account if not registered yet
    const namePart = email.split("@")[0].replace(/[._]/g, " ").replace(/\b\w/g, (c) => c.toUpperCase());
    const newMember: UserAccount = {
      id: `usr_${Date.now()}`,
      name: namePart,
      email: email.trim().toLowerCase(),
      phone: "+65 9123 4567",
      provider: "email",
      address: "Singapore",
      unitNumber: "",
      postalCode: "018956",
      city: "Singapore",
      monogramInitials: email.slice(0, 2).toUpperCase(),
      monogramFoil: "gold",
      orders: [],
      createdAt: new Date().toISOString(),
    };

    users.push(newMember);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    setCurrentUser(newMember);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newMember));
    return { success: true, message: `Account created for ${newMember.email}` };
  };

  const loginWithGoogle = async (customEmail?: string): Promise<{ success: boolean; message: string }> => {
    const emailToUse = customEmail || "sheshadri.lacawnche@gmail.com";
    const rawUsers = localStorage.getItem(USERS_DB_KEY);
    const users: UserAccount[] = rawUsers ? JSON.parse(rawUsers) : INITIAL_USERS;

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
        orders: [],
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    }

    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return { success: true, message: `Connected with Google as ${user.email}` };
  };

  const loginWithFacebook = async (): Promise<{ success: boolean; message: string }> => {
    const emailToUse = "shopper.facebook@arielleather.com";
    const rawUsers = localStorage.getItem(USERS_DB_KEY);
    const users: UserAccount[] = rawUsers ? JSON.parse(rawUsers) : INITIAL_USERS;

    let user = users.find((u) => u.email.toLowerCase() === emailToUse.toLowerCase());
    if (!user) {
      user = {
        id: `usr_fb_${Date.now()}`,
        name: "Ariel FB Collector",
        email: emailToUse,
        phone: "+65 9234 5678",
        provider: "facebook",
        avatarUrl: `https://api.dicebear.com/7.x/initials/svg?seed=FB&backgroundColor=1877F2&textColor=FFFFFF`,
        address: "Sentosa Cove Ocean Drive",
        unitNumber: "#02-15",
        postalCode: "098522",
        city: "Singapore",
        monogramInitials: "AF",
        monogramFoil: "silver",
        orders: [],
        createdAt: new Date().toISOString(),
      };
      users.push(user);
      localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    }

    setCurrentUser(user);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(user));
    return { success: true, message: "Connected with Facebook" };
  };

  const signup = async (userData: {
    name: string;
    email: string;
    phone: string;
    address: string;
    unitNumber?: string;
    postalCode: string;
  }): Promise<{ success: boolean; message: string }> => {
    const rawUsers = localStorage.getItem(USERS_DB_KEY);
    const users: UserAccount[] = rawUsers ? JSON.parse(rawUsers) : INITIAL_USERS;

    const existing = users.find((u) => u.email.toLowerCase() === userData.email.trim().toLowerCase());
    if (existing) {
      return { success: false, message: "An account already exists with this email address. Please sign in." };
    }

    const initials = userData.name
      .split(" ")
      .map((w) => w[0])
      .join("")
      .slice(0, 3)
      .toUpperCase() || "AL";

    const newAccount: UserAccount = {
      id: `usr_${Date.now()}`,
      name: userData.name.trim(),
      email: userData.email.trim().toLowerCase(),
      phone: userData.phone.trim(),
      provider: "email",
      address: userData.address.trim(),
      unitNumber: userData.unitNumber?.trim() || "",
      postalCode: userData.postalCode.trim(),
      city: "Singapore",
      monogramInitials: initials,
      monogramFoil: "gold",
      orders: [],
      createdAt: new Date().toISOString(),
    };

    users.push(newAccount);
    localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
    setCurrentUser(newAccount);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(newAccount));
    return { success: true, message: `Welcome to Ariel Atelier, ${newAccount.name}` };
  };

  const logout = () => {
    setCurrentUser(null);
    localStorage.removeItem(STORAGE_KEY);
  };

  const updateProfile = (data: Partial<UserAccount>) => {
    if (!currentUser) return;
    const updated = { ...currentUser, ...data };
    setCurrentUser(updated);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updated));

    const rawUsers = localStorage.getItem(USERS_DB_KEY);
    if (rawUsers) {
      const users: UserAccount[] = JSON.parse(rawUsers);
      const idx = users.findIndex((u) => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx] = updated;
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      }
    }
  };

  const addOrderToAccount = (order: MedusaOrder) => {
    if (!currentUser) return;
    const updatedOrders = [order, ...currentUser.orders];
    const updatedUser = { ...currentUser, orders: updatedOrders };
    setCurrentUser(updatedUser);
    localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedUser));

    const rawUsers = localStorage.getItem(USERS_DB_KEY);
    if (rawUsers) {
      const users: UserAccount[] = JSON.parse(rawUsers);
      const idx = users.findIndex((u) => u.id === currentUser.id);
      if (idx !== -1) {
        users[idx] = updatedUser;
        localStorage.setItem(USERS_DB_KEY, JSON.stringify(users));
      }
    }
  };

  return (
    <AuthContext.Provider
      value={{
        currentUser,
        isLoggedIn: !!currentUser,
        login,
        signup,
        loginWithGoogle,
        loginWithFacebook,
        logout,
        updateProfile,
        addOrderToAccount,
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
