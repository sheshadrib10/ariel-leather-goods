"use client";

import React, { useState, useEffect } from "react";
import {
  Package,
  ShoppingBag,
  DollarSign,
  Users,
  Tag,
  Truck,
  Plus,
  CheckCircle,
  Clock,
  ChevronRight,
  Search,
  ExternalLink,
  ShieldCheck,
  Edit,
  MapPin,
  Sparkles,
  ArrowLeft,
  RefreshCw,
  Printer,
  X,
  FileText,
  AlertTriangle,
  Download,
  Trash2,
  Copy,
  CreditCard,
  QrCode,
  Smartphone,
  Eye,
  Info,
  Layers,
  Archive,
  BarChart3,
  TrendingUp,
  Upload,
  Lock,
  LogOut,
  Key,
  Image as ImageIcon,
  Check,
  Star,
  RotateCcw,
} from "lucide-react";
import { PRODUCTS_CATALOG, Product } from "@/lib/catalog-data";
import { INITIAL_ORDERS, VALID_DISCOUNTS } from "@/lib/medusa/store";
import { MedusaOrder, MedusaDiscount, MedusaRefund } from "@/lib/medusa/types";
import { useAuth, UserAccount } from "@/lib/auth-context";
import { SingaporeTaxInvoiceModal } from "@/components/SingaporeTaxInvoiceModal";

export const runtime = "edge";

interface AnalyticsTimeframeData {
  label: string;
  comparisonLabel: string;
  grossRevenue: number;
  revenueGrowthPct: number;
  netRevenue: number;
  gstCollected: number;
  totalOrders: number;
  ordersGrowthPct: number;
  aov: number;
  conversionRatePct: number;
  retentionRatePct: number;
  rmaRatePct: number;
  payNowSharePct: number;
  cardSharePct: number;
  parcelsDispatched: number;
  chartBars: Array<{ period: string; revenue: number; orders: number }>;
}

const ANALYTICS_DATA: Record<"daily" | "weekly" | "monthly" | "yearly", AnalyticsTimeframeData> = {
  daily: {
    label: "Today (Last 24 Hours)",
    comparisonLabel: "vs yesterday",
    grossRevenue: 1840,
    revenueGrowthPct: 14.2,
    netRevenue: 1688.07,
    gstCollected: 151.93,
    totalOrders: 8,
    ordersGrowthPct: 33.3,
    aov: 230,
    conversionRatePct: 5.4,
    retentionRatePct: 44.0,
    rmaRatePct: 0.0,
    payNowSharePct: 75,
    cardSharePct: 25,
    parcelsDispatched: 6,
    chartBars: [
      { period: "00:00 - 04:00", revenue: 0, orders: 0 },
      { period: "04:00 - 08:00", revenue: 189, orders: 1 },
      { period: "08:00 - 12:00", revenue: 420, orders: 2 },
      { period: "12:00 - 16:00", revenue: 680, orders: 3 },
      { period: "16:00 - 20:00", revenue: 360, orders: 1 },
      { period: "20:00 - 24:00", revenue: 191, orders: 1 },
    ],
  },
  weekly: {
    label: "This Week (Last 7 Days)",
    comparisonLabel: "vs prior 7 days",
    grossRevenue: 12450,
    revenueGrowthPct: 18.5,
    netRevenue: 11422.02,
    gstCollected: 1027.98,
    totalOrders: 46,
    ordersGrowthPct: 21.0,
    aov: 270.65,
    conversionRatePct: 4.8,
    retentionRatePct: 38.5,
    rmaRatePct: 1.2,
    payNowSharePct: 68,
    cardSharePct: 32,
    parcelsDispatched: 42,
    chartBars: [
      { period: "Mon", revenue: 1420, orders: 5 },
      { period: "Tue", revenue: 1680, orders: 6 },
      { period: "Wed", revenue: 1510, orders: 6 },
      { period: "Thu", revenue: 1840, orders: 7 },
      { period: "Fri", revenue: 2280, orders: 9 },
      { period: "Sat", revenue: 2120, orders: 8 },
      { period: "Sun", revenue: 1600, orders: 5 },
    ],
  },
  monthly: {
    label: "This Month (Last 30 Days)",
    comparisonLabel: "vs prior 30 days",
    grossRevenue: 58920,
    revenueGrowthPct: 22.4,
    netRevenue: 54055.05,
    gstCollected: 4864.95,
    totalOrders: 218,
    ordersGrowthPct: 18.4,
    aov: 270.28,
    conversionRatePct: 4.9,
    retentionRatePct: 36.2,
    rmaRatePct: 1.4,
    payNowSharePct: 71,
    cardSharePct: 29,
    parcelsDispatched: 198,
    chartBars: [
      { period: "Week 1", revenue: 13200, orders: 48 },
      { period: "Week 2", revenue: 14850, orders: 54 },
      { period: "Week 3", revenue: 15100, orders: 56 },
      { period: "Week 4", revenue: 15770, orders: 60 },
    ],
  },
  yearly: {
    label: "Year 2026 (YTD)",
    comparisonLabel: "vs prior year 2025",
    grossRevenue: 412800,
    revenueGrowthPct: 34.1,
    netRevenue: 378715.6,
    gstCollected: 34084.4,
    totalOrders: 1520,
    ordersGrowthPct: 30.5,
    aov: 271.58,
    conversionRatePct: 4.7,
    retentionRatePct: 39.1,
    rmaRatePct: 1.3,
    payNowSharePct: 69,
    cardSharePct: 31,
    parcelsDispatched: 1410,
    chartBars: [
      { period: "Jan", revenue: 34200, orders: 125 },
      { period: "Feb", revenue: 38500, orders: 140 },
      { period: "Mar", revenue: 41000, orders: 150 },
      { period: "Apr", revenue: 39800, orders: 145 },
      { period: "May", revenue: 42400, orders: 155 },
      { period: "Jun", revenue: 44100, orders: 162 },
      { period: "Jul", revenue: 43800, orders: 160 },
      { period: "Aug", revenue: 46200, orders: 170 },
      { period: "Sep", revenue: 48500, orders: 178 },
      { period: "Oct", revenue: 34300, orders: 135 },
    ],
  },
};

export default function AdminPortalPage() {
  const { getAllUsers, adminIssueRefund, adminUpdateNotes, adminDeleteUserPdpa } = useAuth();

  // Navigation state
  const [activeTab, setActiveTab] = useState<
    "orders" | "catalog" | "analytics" | "discounts" | "customers" | "settings"
  >("orders");

  // Merchant Security Gate & Authentication State
  const [isMerchantAuthenticated, setIsMerchantAuthenticated] = useState<boolean>(false);
  const [merchantEmailInput, setMerchantEmailInput] = useState("uncle.ariel@arielleather.com");
  const [merchantPasswordInput, setMerchantPasswordInput] = useState("");
  const [merchantAuthError, setMerchantAuthError] = useState("");

  // Orders State
  const [orders, setOrders] = useState<MedusaOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<MedusaOrder | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [awbOrder, setAwbOrder] = useState<MedusaOrder | null>(null);
  const [invoiceModalOrder, setInvoiceModalOrder] = useState<MedusaOrder | null>(null);

  // Catalog State
  const [products, setProducts] = useState<Product[]>([...PRODUCTS_CATALOG]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  // New Product Form with Device Upload & Multi-Image Gallery
  const [newProductForm, setNewProductForm] = useState({
    title: "",
    sku: "",
    category: "wallet" as "wallet" | "bag" | "belt" | "card_holder" | "accessory",
    subcategory: "Masterpiece",
    price_sgd: 150,
    price_usd: 110,
    leather_type: "Italian Full-Grain Vachetta",
    colour: "Espresso Brown",
    colour_family: "brown" as "brown" | "black" | "tan" | "burgundy" | "navy",
    hardware: "Solid Brass & Gold Foil Crest",
    dimensions: "11.5 cm x 9.5 cm x 1.5 cm",
    weight_grams: 180,
    inventory_count: 10,
    image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
    gallery_images: [
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
    ] as string[],
    description: "Handcrafted in Florence with double-saddle stitching.",
    craftsmanship_notes: "Handcrafted in Florence; inspected at MBS Singapore salon.",
    features: "RFID Protection, 8 Card Slots, 2 Bill Slots",
    monogrammable: true,
  });
  const [newProductUrlInput, setNewProductUrlInput] = useState("");
  const [editProductUrlInput, setEditProductUrlInput] = useState("");

  // Customers CRM State
  const [customers, setCustomers] = useState<UserAccount[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<UserAccount | null>(null);
  const [customerDossierTab, setCustomerDossierTab] = useState<
    "pdpa" | "orders" | "payments" | "refunds" | "searches"
  >("pdpa");
  const [customerSearchQuery, setCustomerSearchQuery] = useState("");

  // Customer Notes & Refunds Form
  const [patronNotesInput, setPatronNotesInput] = useState("");
  const [refundForm, setRefundForm] = useState({
    orderId: "",
    amount: 0,
    reason: "14-Day Boutique Return",
    restock: true,
  });
  const [refundNotice, setRefundNotice] = useState<string | null>(null);

  // Privilege Codes / Discounts State
  const [discounts, setDiscounts] = useState<MedusaDiscount[]>([]);
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false);
  const [editingDiscount, setEditingDiscount] = useState<MedusaDiscount | null>(null);
  const [newDiscount, setNewDiscount] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed_amount",
    value: 15,
    min_subtotal: 100,
    description: "",
  });

  // Analytics Timeframe
  const [analyticsTimeframe, setAnalyticsTimeframe] = useState<"daily" | "weekly" | "monthly" | "yearly">("weekly");

  // Load state on mount
  useEffect(() => {
    try {
      // 1. Check merchant session
      const session = localStorage.getItem("ariel_merchant_session");
      if (session === "authenticated_uncle_ariel") {
        setIsMerchantAuthenticated(true);
      }

      // 2. Load orders
      fetch("/api/medusa/orders")
        .then((res) => res.json())
        .then((data) => {
          if (data.orders && data.orders.length > 0) {
            setOrders(data.orders);
          } else {
            setOrders(INITIAL_ORDERS);
          }
        })
        .catch(() => setOrders(INITIAL_ORDERS));

      // 3. Load products
      const savedProducts = localStorage.getItem("ariel_admin_products_v2");
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }

      // 4. Load discounts
      const savedDiscounts = localStorage.getItem("ariel_admin_discounts_v2");
      if (savedDiscounts) {
        try {
          setDiscounts(JSON.parse(savedDiscounts));
        } catch {
          setDiscounts(VALID_DISCOUNTS);
        }
      } else {
        setDiscounts(VALID_DISCOUNTS);
        localStorage.setItem("ariel_admin_discounts_v2", JSON.stringify(VALID_DISCOUNTS));
      }

      // 5. Load customers
      const loadedUsers = getAllUsers();
      setCustomers(loadedUsers);
    } catch (e) {
      console.warn("Admin initialization warning:", e);
    }
  }, []);

  // Merchant Login Handler
  const handleMerchantLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setMerchantAuthError("");
    const email = merchantEmailInput.trim().toLowerCase();
    const pass = merchantPasswordInput.trim();

    if (
      (email === "uncle.ariel@arielleather.com" ||
        email === "concierge@arielleather.com" ||
        email === "admin@arielleather.com") &&
      (pass === "ArielMBS2026!" || pass === "Password123!" || pass === "admin123" || pass === "Ariel2026")
    ) {
      setIsMerchantAuthenticated(true);
      localStorage.setItem("ariel_merchant_session", "authenticated_uncle_ariel");
      setMerchantPasswordInput("");
    } else {
      setMerchantAuthError("Invalid master passkey or email. Please verify merchant credentials.");
    }
  };

  // 1-Click Instant Demo Login for Uncle Ariel
  const handle1ClickUncleLogin = () => {
    setMerchantEmailInput("uncle.ariel@arielleather.com");
    setMerchantPasswordInput("ArielMBS2026!");
    setIsMerchantAuthenticated(true);
    localStorage.setItem("ariel_merchant_session", "authenticated_uncle_ariel");
  };

  // Merchant Logout Handler
  const handleMerchantLogout = () => {
    localStorage.removeItem("ariel_merchant_session");
    setIsMerchantAuthenticated(false);
    setMerchantPasswordInput("");
  };

  // Device File Upload Handler (FileReader -> base64 Data URL)
  const handleFileUpload = (e: React.ChangeEvent<HTMLInputElement>, isEditing: boolean = false) => {
    const files = e.target.files;
    if (!files || files.length === 0) return;

    Array.from(files).forEach((file) => {
      const reader = new FileReader();
      reader.onload = (uploadEvt) => {
        const dataUrl = uploadEvt.target?.result as string;
        if (dataUrl) {
          if (isEditing && editingProduct) {
            const curGallery = editingProduct.gallery_images || [editingProduct.image_url];
            const updatedGallery = [...curGallery, dataUrl];
            setEditingProduct({
              ...editingProduct,
              gallery_images: updatedGallery,
              image_url: editingProduct.image_url || dataUrl,
            });
          } else {
            setNewProductForm((prev) => {
              const updatedGallery = [...prev.gallery_images, dataUrl];
              return {
                ...prev,
                gallery_images: updatedGallery,
                image_url: prev.image_url ? prev.image_url : dataUrl,
              };
            });
          }
        }
      };
      reader.readAsDataURL(file);
    });
    // Reset file input value
    e.target.value = "";
  };

  // Add Image URL to Gallery
  const handleAddImageUrl = (isEditing: boolean = false) => {
    if (isEditing && editingProduct && editProductUrlInput.trim()) {
      const url = editProductUrlInput.trim();
      const curGallery = editingProduct.gallery_images || [editingProduct.image_url];
      setEditingProduct({
        ...editingProduct,
        gallery_images: [...curGallery, url],
      });
      setEditProductUrlInput("");
    } else if (!isEditing && newProductUrlInput.trim()) {
      const url = newProductUrlInput.trim();
      setNewProductForm((prev) => ({
        ...prev,
        gallery_images: [...prev.gallery_images, url],
      }));
      setNewProductUrlInput("");
    }
  };

  // Remove Gallery Image
  const handleRemoveGalleryImage = (index: number, isEditing: boolean = false) => {
    if (isEditing && editingProduct) {
      const curGallery = [...(editingProduct.gallery_images || [editingProduct.image_url])];
      curGallery.splice(index, 1);
      const newCover = curGallery[0] || editingProduct.image_url;
      setEditingProduct({
        ...editingProduct,
        gallery_images: curGallery,
        image_url: newCover,
      });
    } else {
      setNewProductForm((prev) => {
        const curGallery = [...prev.gallery_images];
        curGallery.splice(index, 1);
        const newCover = curGallery[0] || prev.image_url;
        return {
          ...prev,
          gallery_images: curGallery,
          image_url: newCover,
        };
      });
    }
  };

  // Set Cover Image
  const handleSetCoverImage = (url: string, isEditing: boolean = false) => {
    if (isEditing && editingProduct) {
      setEditingProduct({
        ...editingProduct,
        image_url: url,
      });
    } else {
      setNewProductForm((prev) => ({
        ...prev,
        image_url: url,
      }));
    }
  };

  // Update order status
  const handleUpdateOrderStatus = async (
    orderId: string,
    newStatus: "pending" | "processing" | "shipped" | "delivered"
  ) => {
    const updated = orders.map((o) => (o.id === orderId ? { ...o, status: newStatus } : o));
    setOrders(updated);
    if (selectedOrder && selectedOrder.id === orderId) {
      setSelectedOrder({ ...selectedOrder, status: newStatus });
    }
  };

  // Add Product
  const handleCreateProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const primaryImg =
      newProductForm.image_url ||
      newProductForm.gallery_images[0] ||
      "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80";

    const created: Product = {
      id: Date.now(),
      title: newProductForm.title.trim(),
      slug: newProductForm.title.toLowerCase().replace(/[^a-z0-9]+/g, "-"),
      category: newProductForm.category,
      subcategory: newProductForm.subcategory || "Masterpiece",
      price_sgd: Number(newProductForm.price_sgd),
      price_usd: Number(newProductForm.price_usd),
      material: "Full-Grain Leather",
      leather_type: newProductForm.leather_type,
      colour: newProductForm.colour,
      colour_family: newProductForm.colour_family,
      hardware: newProductForm.hardware,
      style_tags: ["bespoke", "luxury", "handmade"],
      recipient_tags: ["patron", "executive"],
      use_cases: ["formal", "business"],
      features: newProductForm.features.split(",").map((f) => f.trim()),
      dimensions: newProductForm.dimensions,
      weight_grams: Number(newProductForm.weight_grams),
      in_stock: true,
      inventory_count: Number(newProductForm.inventory_count),
      popularity_score: 95,
      margin_rate: 0.68,
      rating: 5.0,
      review_count: 1,
      image_url: primaryImg,
      gallery_images: newProductForm.gallery_images.length > 0 ? newProductForm.gallery_images : [primaryImg],
      description: newProductForm.description,
      craftsmanship_notes: newProductForm.craftsmanship_notes,
      embedding: new Array(1024).fill(0.03),
    };

    const updated = [created, ...products];
    setProducts(updated);
    localStorage.setItem("ariel_admin_products_v2", JSON.stringify(updated));
    setIsAddProductOpen(false);
  };

  // Save Edited Product
  const handleSaveEditedProduct = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingProduct) return;
    const updated = products.map((p) => (p.id === editingProduct.id ? editingProduct : p));
    setProducts(updated);
    localStorage.setItem("ariel_admin_products_v2", JSON.stringify(updated));
    setEditingProduct(null);
  };

  // Duplicate Product
  const handleDuplicateProduct = (prod: Product) => {
    const cloned: Product = {
      ...prod,
      id: Date.now(),
      title: `${prod.title} (Clone)`,
      slug: `${prod.slug}-clone-${Date.now().toString().slice(-4)}`,
    };
    const updated = [cloned, ...products];
    setProducts(updated);
    localStorage.setItem("ariel_admin_products_v2", JSON.stringify(updated));
  };

  // Delete Product
  const handleDeleteProduct = (productId: number) => {
    if (confirm("Are you sure you want to remove this creation from the catalog?")) {
      const updated = products.filter((p) => p.id !== productId);
      setProducts(updated);
      localStorage.setItem("ariel_admin_products_v2", JSON.stringify(updated));
    }
  };

  // Toggle in-stock
  const handleToggleStock = (productId: number) => {
    const updated = products.map((p) => (p.id === productId ? { ...p, in_stock: !p.in_stock } : p));
    setProducts(updated);
    localStorage.setItem("ariel_admin_products_v2", JSON.stringify(updated));
  };

  // Create Privilege Code
  const handleCreateDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!newDiscount.code.trim()) return;
    const created: MedusaDiscount = {
      code: newDiscount.code.trim().toUpperCase(),
      type: newDiscount.type,
      value: Number(newDiscount.value),
      min_subtotal: Number(newDiscount.min_subtotal),
      description:
        newDiscount.description.trim() ||
        `${newDiscount.value}${newDiscount.type === "percentage" ? "%" : " SGD"} boutique privilege voucher`,
    };

    const updated = [created, ...discounts.filter((d) => d.code !== created.code)];
    setDiscounts(updated);
    localStorage.setItem("ariel_admin_discounts_v2", JSON.stringify(updated));
    setIsAddDiscountOpen(false);
    setNewDiscount({
      code: "",
      type: "percentage",
      value: 15,
      min_subtotal: 100,
      description: "",
    });
  };

  // Save Edited Privilege Code
  const handleSaveEditedDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    if (!editingDiscount) return;
    const updated = discounts.map((d) => (d.code === editingDiscount.code ? editingDiscount : d));
    setDiscounts(updated);
    localStorage.setItem("ariel_admin_discounts_v2", JSON.stringify(updated));
    setEditingDiscount(null);
  };

  // Delete Privilege Code
  const handleDeleteDiscount = (code: string) => {
    if (confirm(`Are you sure you want to retire privilege voucher [${code}]?`)) {
      const updated = discounts.filter((d) => d.code !== code);
      setDiscounts(updated);
      localStorage.setItem("ariel_admin_discounts_v2", JSON.stringify(updated));
    }
  };

  // Save Patron Private Notes
  const handleSavePatronNotes = () => {
    if (!selectedCustomer) return;
    adminUpdateNotes(selectedCustomer.id, patronNotesInput);
    const updated = customers.map((c) =>
      c.id === selectedCustomer.id ? { ...c, notes: patronNotesInput } : c
    );
    setCustomers(updated);
    setSelectedCustomer({ ...selectedCustomer, notes: patronNotesInput });
    alert("Patron private notes updated.");
  };

  // Issue HitPay Refund
  const handleProcessRefund = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedCustomer || !refundForm.orderId || refundForm.amount <= 0) return;

    const res = await adminIssueRefund(
      selectedCustomer.id,
      refundForm.orderId,
      refundForm.amount,
      refundForm.reason
    );

    if (res.success && res.refund) {
      setRefundNotice(res.message);
      const fresh = getAllUsers();
      setCustomers(fresh);
      const updatedCust = fresh.find((c) => c.id === selectedCustomer.id);
      if (updatedCust) setSelectedCustomer(updatedCust);
    } else {
      alert(res.message);
    }
  };

  // Export Customer PDPA DSAR Bundle
  const handleExportCustomerPdpa = (cust: UserAccount) => {
    const bundle = {
      _legal_authority: "Singapore Personal Data Protection Act 2012 (PDPA)",
      export_timestamp: new Date().toISOString(),
      patron_id: cust.id,
      name: cust.name,
      email: cust.email,
      phone: cust.phone,
      address: `${cust.address} ${cust.unitNumber}, Singapore ${cust.postalCode}`,
      pdpa_consent: cust.pdpa,
      orders_record: cust.orders,
      refunds_record: cust.refunds,
      search_activity: cust.searchHistory,
      merchant_notes: cust.notes,
    };

    const blob = new Blob([JSON.stringify(bundle, null, 2)], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `ariel_pdpa_dsar_${cust.id}_${new Date().toISOString().slice(0, 10)}.json`;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  // Admin Process PDPA Erasure
  const handleAdminErasure = async (cust: UserAccount) => {
    if (
      confirm(
        `Are you sure you wish to process PDPA Erasure for ${cust.name}? Personal identifiers will be permanently anonymized while retaining tax invoices for IRAS 5-year compliance.`
      )
    ) {
      await adminDeleteUserPdpa(cust.id);
      const fresh = getAllUsers();
      setCustomers(fresh);
      setSelectedCustomer(null);
      alert("Patron data anonymized under Singapore PDPA.");
    }
  };

  // Export Analytics CSV/JSON
  const handleExportAnalytics = (format: "csv" | "json") => {
    const data = ANALYTICS_DATA[analyticsTimeframe];
    if (format === "json") {
      const blob = new Blob([JSON.stringify({ timeframe: analyticsTimeframe, ...data }, null, 2)], {
        type: "application/json",
      });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ariel_analytics_${analyticsTimeframe}_2026.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      let csv = "Period,Gross Revenue (SGD),Orders,AOV (SGD)\n";
      data.chartBars.forEach((bar) => {
        const aov = bar.orders > 0 ? (bar.revenue / bar.orders).toFixed(2) : "0.00";
        csv += `"${bar.period}",${bar.revenue},${bar.orders},${aov}\n`;
      });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ariel_analytics_${analyticsTimeframe}_2026.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // Filters
  const filteredOrders =
    orderFilter === "all" ? orders : orders.filter((o) => o.status.toLowerCase() === orderFilter.toLowerCase());

  const filteredProducts = products.filter((p) => {
    const matchesCat = categoryFilter === "all" || p.category === categoryFilter;
    const matchesQuery =
      !catalogSearch ||
      p.title.toLowerCase().includes(catalogSearch.toLowerCase()) ||
      p.leather_type.toLowerCase().includes(catalogSearch.toLowerCase());
    return matchesCat && matchesQuery;
  });

  const filteredCustomers = customers.filter((c) => {
    if (!customerSearchQuery) return true;
    const q = customerSearchQuery.toLowerCase();
    return (
      c.name.toLowerCase().includes(q) ||
      c.email.toLowerCase().includes(q) ||
      c.phone.includes(q) ||
      c.postalCode.includes(q)
    );
  });

  // Top metric numbers
  const grossRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const netSales = grossRevenue / 1.09;
  const gstCollected = grossRevenue - netSales;
  const activeOrdersCount = orders.filter((o) => o.status !== "delivered").length;

  // ==========================================
  // UNAUTHENTICATED: MERCHANT SECURITY GATE
  // ==========================================
  if (!isMerchantAuthenticated) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-[#120F0D] via-[#1B1512] to-[#0A0807] text-stone-100 flex flex-col justify-center items-center p-4 selection:bg-amber-600 selection:text-white">
        <div className="w-full max-w-md bg-stone-950/90 border border-stone-800 rounded-3xl p-6 sm:p-8 shadow-2xl relative backdrop-blur-md space-y-6">
          {/* Brand Crest */}
          <div className="text-center space-y-2">
            <div className="w-14 h-14 rounded-2xl bg-gradient-to-br from-[#1C1613] via-[#2A1F1A] to-[#120E0C] border border-[#C5A059]/60 shadow-lg flex items-center justify-center mx-auto relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C5A059]/30 via-transparent to-transparent opacity-80" />
              <svg
                className="w-7 h-7 text-[#C5A059] relative z-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 8l3 3 5-6 5 6 3-3v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
                <path d="M9 18l3-7 3 7" strokeWidth="1.8" />
                <path d="M10.2 15h3.6" strokeWidth="1.8" />
              </svg>
            </div>

            <h2 className="font-serif text-2xl font-bold tracking-widest text-amber-400 uppercase pt-2">
              ARIEL LEATHER GOODS
            </h2>
            <div className="flex items-center justify-center gap-2">
              <span className="text-[10px] uppercase font-bold tracking-widest px-2.5 py-0.5 rounded-full bg-amber-950/80 text-amber-300 border border-amber-800">
                Single-Merchant Master Terminal
              </span>
            </div>
            <p className="text-xs text-stone-400 pt-1">
              Marina Bay Sands Flagship #01-42 &bull; Restricted Merchant Access
            </p>
          </div>

          {/* Quick 1-Click Demo Login Button for Uncle Ariel */}
          <div className="p-4 bg-gradient-to-r from-amber-950/50 via-stone-900 to-amber-950/50 border border-amber-500/40 rounded-2xl space-y-2">
            <div className="flex items-center justify-between text-xs">
              <span className="font-bold text-amber-300 flex items-center gap-1.5">
                <Sparkles className="w-4 h-4 text-amber-400" />
                <span>1-Click Uncle Ariel Access</span>
              </span>
              <span className="text-[9px] bg-amber-900/60 text-amber-200 px-2 py-0.5 rounded font-mono">
                Master Craftsman
              </span>
            </div>
            <p className="text-[11px] text-stone-400 leading-relaxed">
              Instant login for testing all merchant capabilities, PDPA records, HitPay refunds, and Medusa analytics.
            </p>
            <button
              type="button"
              onClick={handle1ClickUncleLogin}
              className="w-full py-2.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold text-xs uppercase tracking-wider transition-all shadow-md flex items-center justify-center gap-2"
            >
              <Key className="w-3.5 h-3.5" />
              <span>Sign In as Uncle Ariel (Master Key)</span>
            </button>
          </div>

          <div className="flex items-center gap-3 text-stone-600 text-[10px] uppercase tracking-wider font-semibold">
            <div className="flex-1 h-px bg-stone-800" />
            <span>or enter merchant passkey</span>
            <div className="flex-1 h-px bg-stone-800" />
          </div>

          {/* Error Notice */}
          {merchantAuthError && (
            <div className="p-3 bg-red-950/80 border border-red-800 text-red-200 rounded-xl text-xs flex items-center gap-2">
              <AlertTriangle className="w-4 h-4 text-red-400 shrink-0" />
              <span>{merchantAuthError}</span>
            </div>
          )}

          {/* Manual Merchant Credentials Form */}
          <form onSubmit={handleMerchantLogin} className="space-y-3.5 text-xs">
            <div>
              <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                Merchant Email Address
              </label>
              <div className="relative">
                <input
                  type="email"
                  required
                  value={merchantEmailInput}
                  onChange={(e) => setMerchantEmailInput(e.target.value)}
                  placeholder="uncle.ariel@arielleather.com"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <div>
              <div className="flex justify-between items-center mb-1">
                <label className="text-[10px] uppercase font-bold text-stone-400">
                  Master Security Passkey / Password
                </label>
                <span className="text-[9px] text-stone-500 font-mono">Default: ArielMBS2026!</span>
              </div>
              <div className="relative">
                <input
                  type="password"
                  required
                  value={merchantPasswordInput}
                  onChange={(e) => setMerchantPasswordInput(e.target.value)}
                  placeholder="••••••••••••"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 focus:outline-none focus:border-amber-400"
                />
              </div>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-stone-800 hover:bg-stone-700 text-stone-200 hover:text-white rounded-xl font-bold uppercase tracking-wider text-xs transition-colors flex items-center justify-center gap-2"
            >
              <Lock className="w-3.5 h-3.5 text-amber-400" />
              <span>Authenticate Merchant Cockpit</span>
            </button>
          </form>

          {/* Compliance Footnote */}
          <div className="pt-2 border-t border-stone-900 text-center text-[10px] text-stone-500 space-y-1">
            <p>Singapore PDPA 2012 Certified Access &bull; IRAS 5-Year GST Statutory Compliance</p>
            <p className="font-mono text-stone-600">UEN: 202619482M &bull; GST Reg: M90382710X</p>
          </div>
        </div>

        <div className="mt-4">
          <a
            href="/"
            className="text-xs text-stone-500 hover:text-amber-400 flex items-center gap-1.5 transition-colors"
          >
            <ArrowLeft className="w-3.5 h-3.5" />
            <span>Return to Boutique Storefront</span>
          </a>
        </div>
      </div>
    );
  }

  // ==========================================
  // AUTHENTICATED: MERCHANT MASTER COCKPIT
  // ==========================================
  const currentAnalytics = ANALYTICS_DATA[analyticsTimeframe];
  const maxBarRevenue = Math.max(...currentAnalytics.chartBars.map((b) => b.revenue), 1);

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Top Merchant Navigation Bar with Ariel Brand Emblem */}
      <header className="bg-stone-950 border-b border-stone-800 px-6 py-4 sticky top-0 z-30 flex items-center justify-between">
        <div className="flex items-center gap-4">
          <a
            href="/"
            className="flex items-center gap-2 text-stone-400 hover:text-amber-400 text-xs uppercase tracking-widest font-semibold transition-colors"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Storefront</span>
          </a>

          <div className="h-4 w-px bg-stone-800" />

          {/* Ariel Brand & Logo at Left Top Corner */}
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-[#1C1613] via-[#2A1F1A] to-[#120E0C] border border-[#C5A059]/60 shadow-md flex items-center justify-center relative overflow-hidden">
              <div className="absolute inset-0 bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-[#C5A059]/30 via-transparent to-transparent opacity-80" />
              <svg
                className="w-5 h-5 text-[#C5A059] relative z-10"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="1.6"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M4 8l3 3 5-6 5 6 3-3v10a2 2 0 0 1-2 2H6a2 2 0 0 1-2-2V8z" />
                <path d="M9 18l3-7 3 7" strokeWidth="1.8" />
                <path d="M10.2 15h3.6" strokeWidth="1.8" />
              </svg>
            </div>

            <div>
              <div className="flex items-center gap-2">
                <span className="font-serif text-lg font-bold tracking-widest text-amber-400 uppercase">
                  ARIEL LEATHER GOODS
                </span>
                <span className="text-[9px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                  Single-Merchant Cockpit
                </span>
              </div>
              <p className="text-[10px] text-stone-400">
                Singapore Flagship Hub &bull; Marina Bay Sands #01-42 &bull; UEN: 202619482M
              </p>
            </div>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right hidden sm:block">
            <span className="block font-semibold text-stone-200">Uncle Ariel (Master Craftsman)</span>
            <span className="text-stone-400 text-[11px]">uncle.ariel@arielleather.com</span>
          </div>

          <button
            onClick={handleMerchantLogout}
            className="px-3 py-1.5 rounded-xl border border-stone-800 hover:bg-stone-800 hover:border-stone-700 text-stone-300 hover:text-white text-xs font-semibold flex items-center gap-1.5 transition-colors shadow-2xs"
            title="Lock Terminal / Sign Out"
          >
            <LogOut className="w-3.5 h-3.5 text-amber-400" />
            <span className="hidden sm:inline">Sign Out</span>
          </button>
        </div>
      </header>

      {/* Main Merchant Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar Nav (Mobile Horizontal Tab Bar & Desktop Vertical Aside) */}
        <aside className="w-full lg:w-64 bg-stone-950 border-b lg:border-b-0 lg:border-r border-stone-800 p-2.5 sm:p-3 lg:p-4 shrink-0">
          <div className="hidden lg:block px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-500">
            Medusa Commerce Suite
          </div>

          <div className="flex lg:flex-col gap-1.5 overflow-x-auto lg:overflow-x-visible pb-1 lg:pb-0">
            {[
              { id: "orders", label: "Orders", fullLabel: "Orders & Fulfillment", icon: Package, badge: activeOrdersCount },
              { id: "analytics", label: "Analytics", fullLabel: "Medusa Analytics (D/W/M/Y)", icon: BarChart3 },
              { id: "catalog", label: "Listings", fullLabel: "Masterpiece Listings", icon: ShoppingBag, badge: products.length },
              { id: "customers", label: "Patrons", fullLabel: "Patron CRM & PDPA", icon: Users, badge: customers.length },
              { id: "discounts", label: "Vouchers", fullLabel: "Privilege Codes", icon: Tag, badge: discounts.length },
              { id: "settings", label: "Settings", fullLabel: "Singapore Flagship & GST", icon: MapPin },
            ].map((item) => {
              const Icon = item.icon;
              const isActive = activeTab === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id as any)}
                  className={`flex items-center justify-between px-3 py-2 lg:px-3.5 lg:py-2.5 rounded-xl text-xs font-semibold whitespace-nowrap shrink-0 transition-all ${
                    isActive
                      ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
                      : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
                  }`}
                >
                  <div className="flex items-center gap-2">
                    <Icon className="w-4 h-4 text-amber-400/80" />
                    <span className="lg:hidden">{item.label}</span>
                    <span className="hidden lg:inline">{item.fullLabel}</span>
                  </div>
                  {item.badge !== undefined && (
                    <span className="ml-2 px-1.5 py-0.5 rounded-full text-[9px] font-bold bg-stone-800 text-stone-300">
                      {item.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="hidden lg:block pt-6 px-3">
            <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl space-y-1.5 text-[11px]">
              <span className="font-bold text-stone-300 uppercase text-[9px] tracking-wider block">
                Singapore Compliance
              </span>
              <p className="text-stone-400 text-[10px]">9% GST IRAS Included</p>
              <p className="text-stone-400 text-[10px]">PDPA 2012 DSAR Hub</p>
              <p className="text-stone-400 text-[10px]">HitPay SGQR & EasyParcel</p>
            </div>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-6 space-y-6 overflow-x-hidden">
          {/* Executive Financial KPI Strip with GST & Logistics Breakdown */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl">
              <span className="text-stone-400 text-[10px] uppercase tracking-wider block font-bold">
                Gross Merchandise Value
              </span>
              <span className="text-xl font-bold font-serif text-amber-400 block mt-1">
                S${grossRevenue.toFixed(2)}
              </span>
              <span className="text-[10px] text-stone-500 font-mono">Inclusive of 9% GST</span>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl">
              <span className="text-stone-400 text-[10px] uppercase tracking-wider block font-bold">
                IRAS 9% GST Accrued
              </span>
              <span className="text-xl font-bold font-serif text-emerald-400 block mt-1">
                S${gstCollected.toFixed(2)}
              </span>
              <span className="text-[10px] text-emerald-500/80 font-mono">Tax Reg: M90382710X</span>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl">
              <span className="text-stone-400 text-[10px] uppercase tracking-wider block font-bold">
                Net Atelier Revenue
              </span>
              <span className="text-xl font-bold font-serif text-stone-100 block mt-1">
                S${netSales.toFixed(2)}
              </span>
              <span className="text-[10px] text-stone-500 font-mono">Base before tax</span>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl">
              <span className="text-stone-400 text-[10px] uppercase tracking-wider block font-bold">
                Active Commissions
              </span>
              <span className="text-xl font-bold font-serif text-stone-100 block mt-1">
                {activeOrdersCount}
              </span>
              <span className="text-[10px] text-stone-500 font-mono">Fulfillment pending</span>
            </div>
          </div>

          {/* ========================================================= */}
          {/* TAB 1: ORDERS & FULFILLMENT                               */}
          {/* ========================================================= */}
          {activeTab === "orders" && (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-100">Client Commissions & Dispatch</h3>
                  <p className="text-xs text-stone-400">
                    Live Medusa order pipeline with HitPay SGQR settlement and EasyParcel logistics.
                  </p>
                </div>

                {/* Filter Pills */}
                <div className="flex gap-2">
                  {["all", "processing", "shipped", "delivered"].map((f) => (
                    <button
                      key={f}
                      onClick={() => setOrderFilter(f)}
                      className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider transition-colors ${
                        orderFilter === f
                          ? "bg-amber-500 text-stone-950 font-extrabold"
                          : "bg-stone-900 text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      {f}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-[10px] uppercase tracking-wider text-stone-400">
                      <th className="pb-3 font-semibold">Order</th>
                      <th className="pb-3 font-semibold">Patron</th>
                      <th className="pb-3 font-semibold">Creations & Monogram</th>
                      <th className="pb-3 font-semibold">HitPay Reference</th>
                      <th className="pb-3 font-semibold">EasyParcel Status</th>
                      <th className="pb-3 font-semibold">Amount</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900">
                    {filteredOrders.map((order) => (
                      <tr key={order.id} className="hover:bg-stone-900/50 transition-colors">
                        <td className="py-4 pr-3 font-mono font-bold text-amber-400">#{order.display_id}</td>

                        <td className="py-4 pr-3">
                          <span className="font-semibold text-stone-200 block">
                            {order.shipping_address.first_name} {order.shipping_address.last_name}
                          </span>
                          <span className="text-[11px] text-stone-400 block">{order.customer_email}</span>
                          <span className="text-[10px] text-stone-500 block">{order.shipping_address.address_1}</span>
                        </td>

                        <td className="py-4 pr-3 max-w-[220px]">
                          {order.items.map((item, idx) => (
                            <div key={idx} className="mb-1">
                              <span className="text-stone-300 font-medium">{item.title}</span>
                              {item.metadata?.monogram_text && (
                                <span className="block text-[10px] font-mono text-amber-400 font-bold">
                                  Monogram: [{item.metadata.monogram_text}] ({item.metadata.monogram_foil} foil)
                                </span>
                              )}
                            </div>
                          ))}
                        </td>

                        <td className="py-4 pr-3">
                          <span className="font-mono text-[11px] text-stone-300 block">
                            {order.hitpay_reference || "HITPAY-SG-91823"}
                          </span>
                          <span className="text-[10px] text-emerald-400 uppercase font-semibold">
                            {order.payment_provider || "hitpay_paynow"}
                          </span>
                        </td>

                        <td className="py-4 pr-3">
                          <span className="font-mono text-[11px] text-amber-400 block">
                            {order.easyparcel_awb || order.tracking_number}
                          </span>
                          <span className="text-[10px] text-stone-400 block">
                            {order.easyparcel_courier || "EasyParcel Dispatch"}
                          </span>
                        </td>

                        <td className="py-4 pr-3 font-serif font-bold text-stone-100">
                          S${order.total.toFixed(2)}
                        </td>

                        <td className="py-4 text-right space-x-1.5 whitespace-nowrap">
                          {/* Official Tax Invoice Button */}
                          <button
                            onClick={() => setInvoiceModalOrder(order)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1 shadow-2xs"
                            title="View Official Singapore Tax Invoice (IRAS 9% GST)"
                          >
                            <FileText className="w-3 h-3 text-emerald-400" />
                            <span>Invoice</span>
                          </button>

                          {/* Print Thermal AWB Button */}
                          <button
                            onClick={() => setAwbOrder(order)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1 shadow-2xs"
                          >
                            <Printer className="w-3 h-3 text-amber-400" />
                            <span>AWB</span>
                          </button>

                          {/* Order Status Select */}
                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                            className="bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-[10px] font-bold text-stone-200 uppercase tracking-wider focus:outline-none"
                          >
                            <option value="processing">Processing</option>
                            <option value="shipped">Shipped</option>
                            <option value="delivered">Delivered</option>
                          </select>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 2: MEDUSA ANALYTICS (DAILY / WEEKLY / MONTHLY / YEARLY)*/}
          {/* ========================================================= */}
          {activeTab === "analytics" && (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-6">
              {/* Header Strip with Period Toggles & Export */}
              <div className="flex flex-col lg:flex-row items-start lg:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <div className="flex items-center gap-2">
                    <BarChart3 className="w-5 h-5 text-amber-400" />
                    <h3 className="font-serif text-xl font-bold text-stone-100">
                      Medusa Commerce Analytics Suite
                    </h3>
                  </div>
                  <p className="text-xs text-stone-400 mt-0.5">
                    Multi-horizon financial telemetry &bull; {currentAnalytics.label} ({currentAnalytics.comparisonLabel})
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  {/* Timeframe Toggle Buttons */}
                  <div className="flex p-1 bg-stone-900 rounded-xl border border-stone-800 text-[11px] font-bold uppercase tracking-wider">
                    {(["daily", "weekly", "monthly", "yearly"] as const).map((tf) => (
                      <button
                        key={tf}
                        onClick={() => setAnalyticsTimeframe(tf)}
                        className={`px-3 py-1.5 rounded-lg transition-all ${
                          analyticsTimeframe === tf
                            ? "bg-amber-500 text-stone-950 font-extrabold shadow-sm"
                            : "text-stone-400 hover:text-stone-200"
                        }`}
                      >
                        {tf === "daily"
                          ? "Daily (24h)"
                          : tf === "weekly"
                          ? "Weekly (7d)"
                          : tf === "monthly"
                          ? "Monthly (30d)"
                          : "Yearly (YTD)"}
                      </button>
                    ))}
                  </div>

                  {/* Export Options */}
                  <div className="flex gap-1.5">
                    <button
                      onClick={() => handleExportAnalytics("csv")}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Download IRAS Audit CSV"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>CSV</span>
                    </button>
                    <button
                      onClick={() => handleExportAnalytics("json")}
                      className="px-3 py-1.5 bg-stone-900 hover:bg-stone-800 border border-stone-800 text-stone-200 rounded-xl text-xs font-semibold flex items-center gap-1.5 transition-colors"
                      title="Download Full JSON Telemetry"
                    >
                      <Download className="w-3.5 h-3.5 text-amber-400" />
                      <span>JSON</span>
                    </button>
                  </div>
                </div>
              </div>

              {/* Medusa Metric Cards Grid */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-2xl space-y-1">
                  <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">
                    Gross Revenue (SGD)
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-serif font-bold text-amber-400">
                      S${currentAnalytics.grossRevenue.toLocaleString()}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      +{currentAnalytics.revenueGrowthPct}%
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500">{currentAnalytics.comparisonLabel}</span>
                </div>

                <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-2xl space-y-1">
                  <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">
                    Singapore 9% GST
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-serif font-bold text-emerald-400">
                      S${currentAnalytics.gstCollected.toLocaleString()}
                    </span>
                    <span className="text-[9.5px] text-stone-400 font-mono">IRAS Accrual</span>
                  </div>
                  <span className="text-[10px] text-stone-500">
                    Net: S${currentAnalytics.netRevenue.toLocaleString()}
                  </span>
                </div>

                <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-2xl space-y-1">
                  <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">
                    Commissions Placed
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-serif font-bold text-stone-100">
                      {currentAnalytics.totalOrders}
                    </span>
                    <span className="text-[10px] text-emerald-400 font-bold">
                      +{currentAnalytics.ordersGrowthPct}%
                    </span>
                  </div>
                  <span className="text-[10px] text-stone-500">
                    AOV: S${currentAnalytics.aov.toFixed(2)}
                  </span>
                </div>

                <div className="p-4 bg-stone-900/80 border border-stone-800 rounded-2xl space-y-1">
                  <span className="text-stone-400 text-[10px] uppercase font-bold tracking-wider block">
                    Logistics Dispatches
                  </span>
                  <div className="flex items-baseline justify-between">
                    <span className="text-xl font-serif font-bold text-stone-100">
                      {currentAnalytics.parcelsDispatched}
                    </span>
                    <span className="text-[10px] text-amber-400 font-mono">EasyParcel</span>
                  </div>
                  <span className="text-[10px] text-stone-500">AWB Courier Dispatch</span>
                </div>
              </div>

              {/* Time-Series Interactive Trend Chart */}
              <div className="p-5 bg-stone-900/60 border border-stone-800 rounded-2xl space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h4 className="font-bold text-sm text-stone-200">Revenue & Volume Trajectory</h4>
                    <p className="text-[11px] text-stone-400">
                      Chronological performance across {currentAnalytics.label.toLowerCase()}
                    </p>
                  </div>
                  <div className="flex items-center gap-3 text-[11px]">
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-amber-500 rounded" />
                      <span className="text-stone-300">Gross Sales (SGD)</span>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <div className="w-3 h-3 bg-stone-600 rounded" />
                      <span className="text-stone-400">Order Units</span>
                    </div>
                  </div>
                </div>

                {/* Bar Graph Visualizer */}
                <div className="pt-4 pb-2">
                  <div className="h-44 flex items-end gap-2 sm:gap-4 border-b border-stone-800 pb-2">
                    {currentAnalytics.chartBars.map((bar, idx) => {
                      const heightPct = Math.max(10, Math.round((bar.revenue / maxBarRevenue) * 100));
                      return (
                        <div key={idx} className="flex-1 flex flex-col items-center gap-1 group relative">
                          {/* Tooltip on hover */}
                          <div className="absolute -top-10 opacity-0 group-hover:opacity-100 transition-opacity bg-stone-950 border border-stone-700 px-2 py-1 rounded text-[10px] font-mono pointer-events-none z-10 whitespace-nowrap shadow-lg">
                            S${bar.revenue.toLocaleString()} &bull; {bar.orders} orders
                          </div>

                          {/* Bar Graphic */}
                          <div
                            style={{ height: `${heightPct}%` }}
                            className="w-full bg-gradient-to-t from-amber-600/70 to-amber-400 rounded-t-lg transition-all group-hover:from-amber-500 group-hover:to-amber-300 shadow-xs"
                          />
                          {/* X-axis Label */}
                          <span className="text-[10px] font-mono text-stone-400 truncate max-w-full text-center">
                            {bar.period}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                </div>
              </div>

              {/* Advanced Medusa Metrics Grid */}
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                {/* HitPay Settlement Breakdown */}
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
                  <span className="font-bold text-stone-300 uppercase text-[10px] tracking-wider block">
                    HitPay Payment Mix
                  </span>
                  <div className="space-y-2">
                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-stone-300">PayNow SGQR (Zero-Fee)</span>
                        <span className="font-bold text-emerald-400">{currentAnalytics.payNowSharePct}%</span>
                      </div>
                      <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${currentAnalytics.payNowSharePct}%` }}
                          className="h-full bg-emerald-500 rounded-full"
                        />
                      </div>
                    </div>

                    <div>
                      <div className="flex justify-between text-[11px] mb-1">
                        <span className="text-stone-300">Credit / Debit Cards</span>
                        <span className="font-bold text-amber-400">{currentAnalytics.cardSharePct}%</span>
                      </div>
                      <div className="h-2 bg-stone-800 rounded-full overflow-hidden">
                        <div
                          style={{ width: `${currentAnalytics.cardSharePct}%` }}
                          className="h-full bg-amber-500 rounded-full"
                        />
                      </div>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500">Settled via HitPay Singapore gateway.</p>
                </div>

                {/* Conversion & Patron Loyalty */}
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
                  <span className="font-bold text-stone-300 uppercase text-[10px] tracking-wider block">
                    Patron Retention & Loyalty
                  </span>
                  <div className="grid grid-cols-2 gap-2 text-center">
                    <div className="p-2.5 bg-stone-950 rounded-xl">
                      <span className="text-lg font-bold text-amber-400 block font-serif">
                        {currentAnalytics.retentionRatePct}%
                      </span>
                      <span className="text-[9.5px] text-stone-400">Repeat Patrons</span>
                    </div>
                    <div className="p-2.5 bg-stone-950 rounded-xl">
                      <span className="text-lg font-bold text-stone-200 block font-serif">
                        {currentAnalytics.conversionRatePct}%
                      </span>
                      <span className="text-[9.5px] text-stone-400">Cart Conversion</span>
                    </div>
                  </div>
                  <p className="text-[10px] text-stone-500">64% of orders choose bespoke hot-stamping.</p>
                </div>

                {/* Return RMA & Quality Assurance */}
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
                  <span className="font-bold text-stone-300 uppercase text-[10px] tracking-wider block">
                    Medusa RMA Quality Audit
                  </span>
                  <div className="flex items-center justify-between p-2.5 bg-stone-950 rounded-xl">
                    <div>
                      <span className="text-lg font-bold text-emerald-400 block font-serif">
                        {currentAnalytics.rmaRatePct}%
                      </span>
                      <span className="text-[9.5px] text-stone-400">Return Rate (RMA)</span>
                    </div>
                    <span className="text-[9px] uppercase font-bold bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded">
                      Florentine Standard
                    </span>
                  </div>
                  <p className="text-[10px] text-stone-500">Industry benchmark: 4.2% luxury return rate.</p>
                </div>
              </div>

              {/* Top Performing Masterpieces Ledger */}
              <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
                <span className="font-bold text-stone-200 uppercase text-[10px] tracking-wider block">
                  Top Performing Masterpiece Creations
                </span>
                <div className="overflow-x-auto">
                  <table className="w-full text-left text-xs">
                    <thead>
                      <tr className="border-b border-stone-800 text-[10px] uppercase text-stone-500">
                        <th className="pb-2">Rank</th>
                        <th className="pb-2">Artisanal Creation</th>
                        <th className="pb-2">Category</th>
                        <th className="pb-2 text-center">Units Sold</th>
                        <th className="pb-2 text-right">Revenue (SGD)</th>
                        <th className="pb-2 text-right">Gross Margin</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-800/60">
                      {products.slice(0, 5).map((p, idx) => (
                        <tr key={p.id} className="py-2">
                          <td className="py-2.5 font-bold font-mono text-amber-400">#{idx + 1}</td>
                          <td className="py-2.5 flex items-center gap-2">
                            <img src={p.image_url} alt="" className="w-8 h-8 rounded-lg object-cover" />
                            <div>
                              <span className="font-bold text-stone-200 block">{p.title}</span>
                              <span className="text-[10px] text-stone-400">{p.leather_type}</span>
                            </div>
                          </td>
                          <td className="py-2.5 uppercase text-[10px] text-stone-400">{p.category}</td>
                          <td className="py-2.5 text-center font-mono font-bold text-stone-300">
                            {Math.round((5 - idx) * 12 + 8)}
                          </td>
                          <td className="py-2.5 text-right font-serif font-bold text-amber-400">
                            S${(p.price_sgd * Math.round((5 - idx) * 12 + 8)).toLocaleString()}
                          </td>
                          <td className="py-2.5 text-right font-mono text-emerald-400 font-bold">
                            {(p.margin_rate * 100).toFixed(0)}%
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 3: MASTERPIECE LISTINGS & INVENTORY MANAGEMENT        */}
          {/* ========================================================= */}
          {activeTab === "catalog" && (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-100">Masterpiece Listings & Stock Control</h3>
                  <p className="text-xs text-stone-400">
                    Create new creations, upload device pictures, adjust SGD/USD pricing, and edit existing listings.
                  </p>
                </div>

                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                    <input
                      type="text"
                      value={catalogSearch}
                      onChange={(e) => setCatalogSearch(e.target.value)}
                      placeholder="Search creations or leather..."
                      className="bg-stone-900 border border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none"
                    />
                  </div>

                  <button
                    onClick={() => setIsAddProductOpen(true)}
                    className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs shrink-0"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Create New Listing</span>
                  </button>
                </div>
              </div>

              {/* Category Filter Pills */}
              <div className="flex gap-2 overflow-x-auto pb-1 text-[10px] font-bold uppercase tracking-wider">
                {["all", "wallet", "bag", "belt", "card_holder", "accessory"].map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setCategoryFilter(cat)}
                    className={`px-3 py-1.5 rounded-xl transition-colors ${
                      categoryFilter === cat
                        ? "bg-amber-500/20 text-amber-400 border border-amber-500/40"
                        : "bg-stone-900 text-stone-400 hover:text-stone-200"
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>

              {/* Product Grid / Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs">
                  <thead>
                    <tr className="border-b border-stone-800 text-[10px] uppercase tracking-wider text-stone-400">
                      <th className="pb-3 font-semibold">Creation</th>
                      <th className="pb-3 font-semibold">Leather & Details</th>
                      <th className="pb-3 font-semibold">Price (SGD / USD)</th>
                      <th className="pb-3 font-semibold">Stock (MBS Salon)</th>
                      <th className="pb-3 font-semibold">Status</th>
                      <th className="pb-3 font-semibold text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900">
                    {filteredProducts.map((prod) => (
                      <tr key={prod.id} className="hover:bg-stone-900/50 transition-colors">
                        <td className="py-3.5 pr-3">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image_url}
                              alt={prod.title}
                              className="w-12 h-12 rounded-xl object-cover border border-stone-800 shrink-0"
                            />
                            <div>
                              <a
                                href={`/products/${prod.slug}`}
                                target="_blank"
                                rel="noreferrer"
                                className="font-bold text-stone-200 hover:text-amber-400 flex items-center gap-1 transition-colors"
                              >
                                <span>{prod.title}</span>
                                <ExternalLink className="w-3 h-3 text-stone-500" />
                              </a>
                              <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                                {prod.category} &bull; {prod.colour}
                              </span>
                              {prod.gallery_images && prod.gallery_images.length > 1 && (
                                <span className="block text-[9.5px] text-amber-500/80 font-mono">
                                  {prod.gallery_images.length} pictures
                                </span>
                              )}
                            </div>
                          </div>
                        </td>

                        <td className="py-3.5 pr-3">
                          <span className="text-stone-300 block">{prod.leather_type}</span>
                          <span className="text-[10px] text-stone-500 block">{prod.hardware}</span>
                        </td>

                        <td className="py-3.5 pr-3">
                          <div className="font-serif font-bold text-stone-100 text-sm">
                            S${prod.price_sgd}{" "}
                            <span className="text-[10px] text-stone-500 font-sans font-normal">
                              (${prod.price_usd})
                            </span>
                          </div>
                          <span className="text-[9.5px] text-emerald-400">Incl. 9% GST</span>
                        </td>

                        <td className="py-3.5 pr-3">
                          <span className="font-semibold text-stone-200 block">{prod.inventory_count} in salon</span>
                          <span className="text-[10px] text-stone-500">MBS Flagship Stock</span>
                        </td>

                        <td className="py-3.5 pr-3">
                          <button
                            onClick={() => handleToggleStock(prod.id)}
                            className={`px-3 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider ${
                              prod.in_stock
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : "bg-red-950 text-red-300 border border-red-800"
                            }`}
                          >
                            {prod.in_stock ? "In Stock" : "Sold Out"}
                          </button>
                        </td>

                        <td className="py-3.5 text-right space-x-1.5 whitespace-nowrap">
                          <button
                            onClick={() => setEditingProduct(prod)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 hover:text-amber-400 transition-colors"
                            title="Edit Listing Specs & Pictures"
                          >
                            <Edit className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDuplicateProduct(prod)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                            title="Duplicate Listing"
                          >
                            <Copy className="w-3.5 h-3.5" />
                          </button>

                          <button
                            onClick={() => handleDeleteProduct(prod.id)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-red-900/60 text-stone-300 hover:text-red-300 transition-colors"
                            title="Remove Listing"
                          >
                            <Trash2 className="w-3.5 h-3.5" />
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 4: PATRON CRM & SINGAPORE PDPA AUDIT                  */}
          {/* ========================================================= */}
          {activeTab === "customers" && (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-100">Patron Directory & Singapore PDPA Hub</h3>
                  <p className="text-xs text-stone-400">
                    Inspect individual patrons, orders, payments, refunds, search history, and PDPA consent.
                  </p>
                </div>

                <div className="relative">
                  <Search className="w-3.5 h-3.5 text-stone-400 absolute left-3 top-2.5" />
                  <input
                    type="text"
                    value={customerSearchQuery}
                    onChange={(e) => setCustomerSearchQuery(e.target.value)}
                    placeholder="Search name, email, postal code..."
                    className="bg-stone-900 border border-stone-800 rounded-xl pl-8 pr-3 py-1.5 text-xs text-stone-100 placeholder-stone-500 focus:outline-none"
                  />
                </div>
              </div>

              {/* Customers List */}
              <div className="space-y-3">
                {filteredCustomers.map((cust) => {
                  const spend = cust.orders.reduce((acc, o) => acc + (o.total || 0), 0);
                  return (
                    <div
                      key={cust.id}
                      onClick={() => {
                        setSelectedCustomer(cust);
                        setPatronNotesInput(cust.notes || "");
                        setRefundNotice(null);
                      }}
                      className="p-4 bg-stone-900 border border-stone-800 hover:border-amber-500/50 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs cursor-pointer transition-all hover:bg-stone-900/80"
                    >
                      <div className="flex items-center gap-3">
                        <div className="w-10 h-10 rounded-full bg-stone-800 border border-stone-700 flex items-center justify-center font-serif font-bold text-amber-400">
                          {cust.name.slice(0, 2).toUpperCase()}
                        </div>
                        <div>
                          <div className="flex items-center gap-2">
                            <span className="font-bold text-stone-100 text-sm">{cust.name}</span>
                            <span className="text-[9px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 font-semibold uppercase">
                              Via {cust.provider}
                            </span>
                            {cust.pdpa?.consent_given && (
                              <span className="text-[9px] px-1.5 py-0.5 rounded bg-emerald-950 text-emerald-300 border border-emerald-800 font-semibold">
                                PDPA Active
                              </span>
                            )}
                          </div>
                          <span className="text-stone-400 text-[11px] block">
                            {cust.email} &bull; {cust.phone} &bull; Singapore {cust.postalCode}
                          </span>
                        </div>
                      </div>

                      <div className="flex items-center gap-6 text-right">
                        <div>
                          <span className="text-stone-500 text-[10px] uppercase font-bold block">Hot-Stamping</span>
                          <span className="font-mono text-amber-400 font-semibold">
                            [{cust.monogramInitials}] ({cust.monogramFoil})
                          </span>
                        </div>
                        <div>
                          <span className="text-stone-500 text-[10px] uppercase font-bold block">Lifetime Spend</span>
                          <span className="font-serif font-bold text-stone-100 text-sm">
                            S${spend > 0 ? spend.toFixed(2) : "0.00"}
                          </span>
                        </div>
                        <div className="flex items-center gap-1 text-amber-400 font-bold text-xs">
                          <span>Inspect Dossier</span>
                          <ChevronRight className="w-4 h-4" />
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 5: PRIVILEGE CODES & MARKETING VOUCHERS               */}
          {/* ========================================================= */}
          {activeTab === "discounts" && (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-100">Privilege Codes & Marketing Vouchers</h3>
                  <p className="text-xs text-stone-400">
                    Manage boutique discounts, welcome codes, and VIP incentives recognized in checkout.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddDiscountOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors shadow-xs"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Privilege Code</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {discounts.map((d) => (
                  <div key={d.code} className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-bold text-amber-400 tracking-wider">{d.code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-bold uppercase">
                        {d.type === "percentage" ? `${d.value}% OFF` : `S$${d.value} OFF`}
                      </span>
                    </div>
                    <p className="text-xs text-stone-300">{d.description}</p>
                    <p className="text-[10px] text-stone-500">Min. order: S${d.min_subtotal}</p>

                    <div className="flex items-center gap-2 pt-2 border-t border-stone-800">
                      <button
                        type="button"
                        onClick={() => setEditingDiscount(d)}
                        className="flex-1 py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                      >
                        <Edit className="w-3 h-3 text-amber-400" />
                        <span>Edit Code</span>
                      </button>
                      <button
                        type="button"
                        onClick={() => handleDeleteDiscount(d.code)}
                        className="py-1.5 px-3 rounded-lg bg-stone-800 hover:bg-red-950 text-stone-400 hover:text-red-300 text-[10px] font-semibold flex items-center justify-center gap-1 transition-colors"
                        title="Delete Privilege Code"
                      >
                        <Trash2 className="w-3 h-3" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* ========================================================= */}
          {/* TAB 6: SINGAPORE FLAGSHIP & GST CONFIG                    */}
          {/* ========================================================= */}
          {activeTab === "settings" && (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-5 text-xs">
              <div className="pb-4 border-b border-stone-800">
                <h3 className="font-serif text-xl font-bold text-stone-100">Singapore Flagship Configuration</h3>
                <p className="text-stone-400 text-xs">IRAS 9% GST tax rules, EasyParcel API routing, and salon dispatch.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
                  <span className="font-bold text-stone-200 uppercase text-[10px] tracking-wider block">
                    Flagship Boutique Salon
                  </span>
                  <p className="text-stone-300 font-semibold">Ariel Leather Goods Flagship Salon</p>
                  <p className="text-stone-400">Marina Bay Sands #01-42, 10 Bayfront Ave, Singapore 018956</p>
                  <p className="text-stone-500 font-mono">UEN: 202619482M</p>
                </div>

                <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
                  <span className="font-bold text-emerald-400 uppercase text-[10px] tracking-wider block">
                    Singapore IRAS GST Compliance
                  </span>
                  <p className="text-emerald-300 font-semibold">9.0% IRAS Goods and Services Tax</p>
                  <p className="text-stone-400">Tax Invoice Registered: M90382710X</p>
                  <p className="text-stone-500">Statutory 5-year invoice retention enabled.</p>
                </div>

                <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
                  <span className="font-bold text-amber-400 uppercase text-[10px] tracking-wider block">
                    HitPay & EasyParcel Live
                  </span>
                  <p className="text-amber-300 font-semibold">PayNow SGQR & White-Glove Courier</p>
                  <p className="text-stone-400">EasyParcel API: api.easyparcel.sg</p>
                  <p className="text-stone-500">HitPay SG Webhook active on Edge</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* ========================================================= */}
      {/* PATRON DEEP-DIVE DOSSIER DRAWER (Uncle's CRM Drill-Down)  */}
      {/* ========================================================= */}
      {selectedCustomer && (
        <div className="fixed inset-0 z-50 flex justify-end bg-black/70 backdrop-blur-sm animate-fadeIn">
          <div className="w-full max-w-2xl bg-stone-950 border-l border-stone-800 h-full shadow-2xl flex flex-col justify-between animate-slideLeft text-xs">
            {/* Header */}
            <div className="p-5 border-b border-stone-800 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <div className="w-11 h-11 rounded-full bg-amber-600/30 border border-amber-500/50 flex items-center justify-center font-serif font-bold text-amber-400 text-base">
                  {selectedCustomer.name.slice(0, 2).toUpperCase()}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h3 className="font-serif text-lg font-bold text-stone-100">{selectedCustomer.name}</h3>
                    <span className="text-[9px] uppercase px-2 py-0.5 rounded bg-stone-800 text-stone-300 font-bold">
                      {selectedCustomer.provider}
                    </span>
                  </div>
                  <p className="text-[11px] text-stone-400">
                    {selectedCustomer.email} &bull; {selectedCustomer.phone}
                  </p>
                </div>
              </div>

              <button
                onClick={() => setSelectedCustomer(null)}
                className="p-1.5 text-stone-400 hover:text-stone-100 rounded-full hover:bg-stone-900 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Dossier Tabs */}
            <div className="flex border-b border-stone-800 px-5 gap-4 text-[11px] font-bold uppercase tracking-wider overflow-x-auto bg-stone-900/40">
              {[
                { id: "pdpa", label: "Profile & PDPA" },
                { id: "orders", label: `Orders (${selectedCustomer.orders?.length || 0})` },
                { id: "refunds", label: `Refunds & HitPay (${selectedCustomer.refunds?.length || 0})` },
                { id: "searches", label: `Searches (${selectedCustomer.searchHistory?.length || 0})` },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setCustomerDossierTab(tab.id as any)}
                  className={`py-3 border-b-2 transition-all ${
                    customerDossierTab === tab.id
                      ? "border-amber-400 text-amber-400 font-bold"
                      : "border-transparent text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {tab.label}
                </button>
              ))}
            </div>

            {/* Dossier Body */}
            <div className="p-6 overflow-y-auto flex-1 space-y-5">
              {/* DOSSIER TAB 1: PROFILE & SINGAPORE PDPA */}
              {customerDossierTab === "pdpa" && (
                <div className="space-y-4">
                  <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
                    <div className="flex items-center justify-between pb-2 border-b border-stone-800">
                      <div className="flex items-center gap-2">
                        <ShieldCheck className="w-4 h-4 text-emerald-400" />
                        <span className="font-bold text-stone-200 text-xs">Singapore PDPA Consent & DSAR Record</span>
                      </div>
                      <span className="text-[10px] bg-emerald-950 text-emerald-300 border border-emerald-800 px-2 py-0.5 rounded-full font-bold">
                        Lawful Consent Logged
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-3 text-[11px] text-stone-400">
                      <div>
                        <span className="block text-stone-500 uppercase text-[9px] font-bold">Consent Timestamp</span>
                        <span className="font-mono text-stone-300">
                          {selectedCustomer.pdpa?.consent_timestamp
                            ? new Date(selectedCustomer.pdpa.consent_timestamp).toLocaleString("en-SG")
                            : "Verified"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-stone-500 uppercase text-[9px] font-bold">Singapore DNC Registry</span>
                        <span className="text-stone-300">
                          {selectedCustomer.pdpa?.marketing_phone_opt_in ? "SMS Opt-in" : "Strict DNC No-Call"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-stone-500 uppercase text-[9px] font-bold">Marketing Email</span>
                        <span className="text-stone-300">
                          {selectedCustomer.pdpa?.marketing_email_opt_in ? "Subscribed" : "Unsubscribed"}
                        </span>
                      </div>
                      <div>
                        <span className="block text-stone-500 uppercase text-[9px] font-bold">DSAR Exports Count</span>
                        <span className="font-mono text-stone-300">
                          {selectedCustomer.pdpa?.dsar_export_count || 0} times
                        </span>
                      </div>
                    </div>

                    <div className="flex gap-2 pt-2 border-t border-stone-800">
                      <button
                        onClick={() => handleExportCustomerPdpa(selectedCustomer)}
                        className="flex-1 py-2 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-colors"
                      >
                        <Download className="w-3.5 h-3.5 text-amber-400" />
                        <span>Export PDPA Bundle (DSAR)</span>
                      </button>

                      <button
                        onClick={() => handleAdminErasure(selectedCustomer)}
                        className="py-2 px-3 bg-red-950/80 hover:bg-red-900 text-red-200 border border-red-800 rounded-xl text-xs font-bold transition-colors"
                      >
                        Process PDPA Erasure
                      </button>
                    </div>
                  </div>

                  {/* Singapore Address */}
                  <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
                    <span className="font-bold text-stone-300 uppercase text-[10px] tracking-wider block">
                      Singapore Delivery Destination
                    </span>
                    <p className="text-stone-200 font-semibold">
                      {selectedCustomer.address} {selectedCustomer.unitNumber}
                    </p>
                    <p className="text-stone-400 font-mono">Singapore {selectedCustomer.postalCode}</p>
                    <p className="text-amber-400 font-mono text-[11px]">
                      Default Monogram: [{selectedCustomer.monogramInitials}] ({selectedCustomer.monogramFoil} foil)
                    </p>
                  </div>

                  {/* Uncle's Private Notes */}
                  <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
                    <span className="font-bold text-stone-300 uppercase text-[10px] tracking-wider block">
                      Uncle&apos;s Private Atelier Notes (Internal Merchant CRM)
                    </span>
                    <textarea
                      rows={3}
                      value={patronNotesInput}
                      onChange={(e) => setPatronNotesInput(e.target.value)}
                      placeholder="e.g. VIP Collector. Prefers French Box Calf in Cognac. Gifting for spouse..."
                      className="w-full bg-stone-950 border border-stone-800 rounded-xl p-2.5 text-xs text-stone-200 focus:outline-none focus:border-amber-400"
                    />
                    <button
                      onClick={handleSavePatronNotes}
                      className="py-1.5 px-4 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold uppercase tracking-wider rounded-xl text-[10px] transition-colors"
                    >
                      Save Private Notes
                    </button>
                  </div>
                </div>
              )}

              {/* DOSSIER TAB 2: CUSTOMER ORDERS */}
              {customerDossierTab === "orders" && (
                <div className="space-y-3">
                  {selectedCustomer.orders && selectedCustomer.orders.length > 0 ? (
                    selectedCustomer.orders.map((o) => (
                      <div key={o.id} className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
                        <div className="flex justify-between items-start">
                          <div>
                            <span className="font-mono font-bold text-amber-400 text-sm">#{o.display_id}</span>
                            <span className="text-[10px] text-stone-500 block">
                              {new Date(o.created_at).toLocaleDateString("en-SG")}
                            </span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] px-2 py-0.5 rounded-full font-bold uppercase bg-stone-800 text-stone-300">
                              {o.status}
                            </span>
                            <span className="font-serif font-bold text-stone-100 block mt-1">
                              S${o.total.toFixed(2)}
                            </span>
                          </div>
                        </div>

                        <div className="space-y-1.5 pt-2 border-t border-stone-800">
                          {o.items.map((i, idx) => (
                            <div key={idx} className="flex justify-between text-stone-300">
                              <span>
                                {i.title} &times; {i.quantity}
                              </span>
                              <span className="font-mono">S${i.total.toFixed(2)}</span>
                            </div>
                          ))}
                        </div>

                        <div className="flex justify-between items-center pt-2 border-t border-stone-800 text-[10px] text-stone-400">
                          <span>Courier: {o.easyparcel_courier || "EasyParcel"}</span>
                          <button
                            type="button"
                            onClick={() => setInvoiceModalOrder(o)}
                            className="text-amber-400 hover:underline font-semibold"
                          >
                            View Tax Invoice &rarr;
                          </button>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-500 text-center py-8">No orders placed by this customer yet.</p>
                  )}
                </div>
              )}

              {/* DOSSIER TAB 3: REFUNDS & HITPAY */}
              {customerDossierTab === "refunds" && (
                <div className="space-y-4">
                  <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
                    <span className="font-bold text-stone-200 uppercase text-[10px] tracking-wider block">
                      Issue HitPay Singapore Refund
                    </span>

                    {refundNotice && (
                      <div className="p-2.5 bg-emerald-950 border border-emerald-800 text-emerald-300 rounded-xl text-xs">
                        {refundNotice}
                      </div>
                    )}

                    <form onSubmit={handleProcessRefund} className="space-y-3">
                      <div>
                        <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                          Select Customer Order
                        </label>
                        <select
                          required
                          value={refundForm.orderId}
                          onChange={(e) => setRefundForm({ ...refundForm, orderId: e.target.value })}
                          className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200"
                        >
                          <option value="">-- Select Order --</option>
                          {selectedCustomer.orders.map((o) => (
                            <option key={o.id} value={o.id}>
                              #{o.display_id} - S${o.total.toFixed(2)} ({o.status})
                            </option>
                          ))}
                        </select>
                      </div>

                      <div className="grid grid-cols-2 gap-3">
                        <div>
                          <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                            Refund Amount (S$)
                          </label>
                          <input
                            type="number"
                            required
                            step="0.01"
                            value={refundForm.amount}
                            onChange={(e) => setRefundForm({ ...refundForm, amount: Number(e.target.value) })}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200 font-mono"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                            Return Reason
                          </label>
                          <input
                            type="text"
                            value={refundForm.reason}
                            onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200"
                          />
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2 bg-red-800 hover:bg-red-700 text-white rounded-xl text-xs font-bold uppercase tracking-wider transition-colors"
                      >
                        Disburse Refund via HitPay
                      </button>
                    </form>
                  </div>
                </div>
              )}

              {/* DOSSIER TAB 4: SEARCHES */}
              {customerDossierTab === "searches" && (
                <div className="space-y-3">
                  {selectedCustomer.searchHistory && selectedCustomer.searchHistory.length > 0 ? (
                    selectedCustomer.searchHistory.map((s) => (
                      <div key={s.id} className="p-3 bg-stone-900 border border-stone-800 rounded-xl flex justify-between items-center">
                        <div>
                          <span className="font-semibold text-stone-200 block">&ldquo;{s.query}&rdquo;</span>
                          <span className="text-[10px] text-stone-500">{new Date(s.timestamp).toLocaleString("en-SG")}</span>
                        </div>
                        <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-stone-800 text-amber-400 uppercase">
                          {s.mode} mode
                        </span>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-500 text-center py-8">No search telemetry recorded.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE NEW MASTERPIECE LISTING                     */}
      {/* ========================================================= */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-7 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <h4 className="font-serif text-xl font-bold text-stone-100">Create New Masterpiece Listing</h4>
              <button onClick={() => setIsAddProductOpen(false)} className="text-stone-400 hover:text-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Creation Title *</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.title}
                    onChange={(e) => setNewProductForm({ ...newProductForm, title: e.target.value })}
                    placeholder="e.g. The Borghese Double-Saddle Briefcase"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Category *</label>
                  <select
                    value={newProductForm.category}
                    onChange={(e) => setNewProductForm({ ...newProductForm, category: e.target.value as any })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                  >
                    <option value="wallet">Wallets & Bifolds</option>
                    <option value="bag">Bags & Briefcases</option>
                    <option value="belt">Dress Belts</option>
                    <option value="card_holder">Card Sleeves</option>
                    <option value="accessory">Accessories & Folios</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Price SGD *</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.price_sgd}
                    onChange={(e) =>
                      setNewProductForm({
                        ...newProductForm,
                        price_sgd: Number(e.target.value),
                        price_usd: Math.round(Number(e.target.value) * 0.75),
                      })
                    }
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Price USD</label>
                  <input
                    type="number"
                    value={newProductForm.price_usd}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price_usd: Number(e.target.value) })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">MBS Salon Stock *</label>
                  <input
                    type="number"
                    required
                    value={newProductForm.inventory_count}
                    onChange={(e) => setNewProductForm({ ...newProductForm, inventory_count: Number(e.target.value) })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Leather Type</label>
                  <input
                    type="text"
                    value={newProductForm.leather_type}
                    onChange={(e) => setNewProductForm({ ...newProductForm, leather_type: e.target.value })}
                    placeholder="e.g. Italian Full-Grain Vachetta"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Colour & Patina</label>
                  <input
                    type="text"
                    value={newProductForm.colour}
                    onChange={(e) => setNewProductForm({ ...newProductForm, colour: e.target.value })}
                    placeholder="e.g. Cognac Amber"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Hardware / Accents</label>
                  <input
                    type="text"
                    value={newProductForm.hardware}
                    onChange={(e) => setNewProductForm({ ...newProductForm, hardware: e.target.value })}
                    placeholder="Solid Brass & 24K Gold Foil"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Dimensions</label>
                  <input
                    type="text"
                    value={newProductForm.dimensions}
                    onChange={(e) => setNewProductForm({ ...newProductForm, dimensions: e.target.value })}
                    placeholder="11.5 cm x 9.5 cm x 1.5 cm"
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>
              </div>

              {/* Multi-Image Device Upload & URL Management */}
              <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-200 uppercase text-[10px] tracking-wider block">
                    Product Imagery (Multiple Angles & Device Upload)
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {newProductForm.gallery_images.length} uploaded
                  </span>
                </div>

                {/* Upload from Device Button */}
                <div className="flex items-center gap-2">
                  <label className="flex-1 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl cursor-pointer text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Pictures from Device (Multiple)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, false)}
                      className="hidden"
                    />
                  </label>
                </div>

                {/* Add Image by URL */}
                <div className="flex gap-2">
                  <input
                    type="url"
                    value={newProductUrlInput}
                    onChange={(e) => setNewProductUrlInput(e.target.value)}
                    placeholder="Or paste image URL (Unsplash, CDN, etc.)..."
                    className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-stone-100 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImageUrl(false)}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold text-xs"
                  >
                    Add URL
                  </button>
                </div>

                {/* Gallery Thumbnails Strip */}
                {newProductForm.gallery_images.length > 0 && (
                  <div className="grid grid-cols-4 sm:grid-cols-6 gap-2 pt-1">
                    {newProductForm.gallery_images.map((img, idx) => {
                      const isCover = newProductForm.image_url === img;
                      return (
                        <div
                          key={idx}
                          className={`relative aspect-square rounded-xl overflow-hidden border ${
                            isCover ? "border-amber-400 ring-2 ring-amber-400/40" : "border-stone-800"
                          } group`}
                        >
                          <img src={img} alt="" className="w-full h-full object-cover" />
                          {isCover && (
                            <span className="absolute top-1 left-1 bg-amber-500 text-stone-950 text-[8px] font-bold uppercase px-1 rounded">
                              Cover
                            </span>
                          )}
                          <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-1 transition-opacity">
                            {!isCover && (
                              <button
                                type="button"
                                onClick={() => handleSetCoverImage(img, false)}
                                className="text-[8px] text-amber-300 hover:underline uppercase font-bold"
                              >
                                Set Cover
                              </button>
                            )}
                            <button
                              type="button"
                              onClick={() => handleRemoveGalleryImage(idx, false)}
                              className="text-red-400 hover:text-red-300 p-0.5"
                            >
                              <X className="w-3.5 h-3.5" />
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Features (Comma-separated)</label>
                <input
                  type="text"
                  value={newProductForm.features}
                  onChange={(e) => setNewProductForm({ ...newProductForm, features: e.target.value })}
                  placeholder="RFID Protection, 8 Card Slots, Hand-Polished Edges"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={newProductForm.description}
                  onChange={(e) => setNewProductForm({ ...newProductForm, description: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-3 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-md"
              >
                Publish Masterpiece to Storefront
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT PRESENT LISTING                               */}
      {/* ========================================================= */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4 overflow-y-auto">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-xl max-h-[92vh] overflow-y-auto p-6 sm:p-7 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <div>
                <h4 className="font-serif text-xl font-bold text-stone-100">Edit {editingProduct.title}</h4>
                <p className="text-[10px] text-stone-400 font-mono">Slug: /products/{editingProduct.slug}</p>
              </div>
              <button onClick={() => setEditingProduct(null)} className="text-stone-400 hover:text-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedProduct} className="space-y-4">
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Creation Title</label>
                <input
                  type="text"
                  required
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                />
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Price (SGD)</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.price_sgd}
                    onChange={(e) =>
                      setEditingProduct({
                        ...editingProduct,
                        price_sgd: Number(e.target.value),
                        price_usd: Math.round(Number(e.target.value) * 0.75),
                      })
                    }
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    value={editingProduct.price_usd}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, price_usd: Number(e.target.value) })
                    }
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Stock Count</label>
                  <input
                    type="number"
                    required
                    value={editingProduct.inventory_count}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, inventory_count: Number(e.target.value) })
                    }
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Leather Type</label>
                  <input
                    type="text"
                    value={editingProduct.leather_type}
                    onChange={(e) => setEditingProduct({ ...editingProduct, leather_type: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Colour & Patina</label>
                  <input
                    type="text"
                    value={editingProduct.colour}
                    onChange={(e) => setEditingProduct({ ...editingProduct, colour: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>
              </div>

              {/* Multi-Image Device Upload & Gallery in Edit */}
              <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-3">
                <div className="flex justify-between items-center">
                  <span className="font-bold text-stone-200 uppercase text-[10px] tracking-wider block">
                    Product Gallery Images
                  </span>
                  <span className="text-[10px] text-amber-400 font-mono">
                    {(editingProduct.gallery_images || [editingProduct.image_url]).length} pictures
                  </span>
                </div>

                <div className="flex items-center gap-2">
                  <label className="flex-1 py-2 px-3 bg-stone-800 hover:bg-stone-700 text-stone-200 border border-stone-700 rounded-xl cursor-pointer text-xs font-semibold flex items-center justify-center gap-2 transition-colors">
                    <Upload className="w-3.5 h-3.5 text-amber-400" />
                    <span>Upload Pictures from Device (Multiple)</span>
                    <input
                      type="file"
                      multiple
                      accept="image/*"
                      onChange={(e) => handleFileUpload(e, true)}
                      className="hidden"
                    />
                  </label>
                </div>

                <div className="flex gap-2">
                  <input
                    type="url"
                    value={editProductUrlInput}
                    onChange={(e) => setEditProductUrlInput(e.target.value)}
                    placeholder="Or paste additional image URL..."
                    className="flex-1 bg-stone-950 border border-stone-800 rounded-xl px-3 py-1.5 text-stone-100 text-xs focus:outline-none"
                  />
                  <button
                    type="button"
                    onClick={() => handleAddImageUrl(true)}
                    className="px-3 py-1.5 bg-stone-800 hover:bg-stone-700 text-stone-200 rounded-xl font-bold text-xs"
                  >
                    Add URL
                  </button>
                </div>

                {/* Thumbnails */}
                {((editingProduct.gallery_images && editingProduct.gallery_images.length > 0)
                  ? editingProduct.gallery_images
                  : [editingProduct.image_url]
                ).map((img, idx) => {
                  const isCover = editingProduct.image_url === img;
                  return (
                    <div
                      key={idx}
                      className={`inline-block mr-2 mb-2 relative w-16 h-16 rounded-xl overflow-hidden border ${
                        isCover ? "border-amber-400 ring-2 ring-amber-400/40" : "border-stone-800"
                      } group`}
                    >
                      <img src={img} alt="" className="w-full h-full object-cover" />
                      {isCover && (
                        <span className="absolute top-0.5 left-0.5 bg-amber-500 text-stone-950 text-[7px] font-bold uppercase px-1 rounded">
                          Cover
                        </span>
                      )}
                      <div className="absolute inset-0 bg-black/60 opacity-0 group-hover:opacity-100 flex flex-col items-center justify-center gap-0.5 transition-opacity">
                        {!isCover && (
                          <button
                            type="button"
                            onClick={() => handleSetCoverImage(img, true)}
                            className="text-[7.5px] text-amber-300 uppercase font-bold"
                          >
                            Cover
                          </button>
                        )}
                        <button
                          type="button"
                          onClick={() => handleRemoveGalleryImage(idx, true)}
                          className="text-red-400 p-0.5"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Description</label>
                <textarea
                  rows={2}
                  value={editingProduct.description}
                  onChange={(e) => setEditingProduct({ ...editingProduct, description: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold uppercase tracking-wider rounded-xl text-xs transition-colors shadow-md"
              >
                Save Listing Updates
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: CREATE PRIVILEGE CODE                              */}
      {/* ========================================================= */}
      {isAddDiscountOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <h4 className="font-serif text-xl font-bold text-stone-100">Create Privilege Code</h4>
              <button onClick={() => setIsAddDiscountOpen(false)} className="text-stone-400 hover:text-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateDiscount} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                  Voucher Code * (Auto-Uppercase)
                </label>
                <input
                  type="text"
                  required
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value.toUpperCase() })}
                  placeholder="e.g. VIP20 or MBSCOLLECTOR"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 font-mono font-bold text-amber-400 text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                    Privilege Type
                  </label>
                  <select
                    value={newDiscount.type}
                    onChange={(e) =>
                      setNewDiscount({ ...newDiscount, type: e.target.value as "percentage" | "fixed_amount" })
                    }
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="fixed_amount">Fixed Amount (S$ OFF)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                    Value {newDiscount.type === "percentage" ? "(%)" : "(SGD)"} *
                  </label>
                  <input
                    type="number"
                    required
                    min={1}
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount({ ...newDiscount, value: Number(e.target.value) })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 font-mono text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                  Minimum Order Subtotal (SGD)
                </label>
                <input
                  type="number"
                  min={0}
                  value={newDiscount.min_subtotal}
                  onChange={(e) => setNewDiscount({ ...newDiscount, min_subtotal: Number(e.target.value) })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 font-mono text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Description</label>
                <input
                  type="text"
                  value={newDiscount.description}
                  onChange={(e) => setNewDiscount({ ...newDiscount, description: e.target.value })}
                  placeholder="e.g. 20% privilege voucher for VIP patrons"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold uppercase tracking-wider rounded-xl text-xs transition-colors shadow-md"
              >
                Publish Privilege Code
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: EDIT PRIVILEGE CODE                                */}
      {/* ========================================================= */}
      {editingDiscount && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <h4 className="font-serif text-xl font-bold text-stone-100">Edit Voucher [{editingDiscount.code}]</h4>
              <button onClick={() => setEditingDiscount(null)} className="text-stone-400 hover:text-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedDiscount} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Type</label>
                  <select
                    value={editingDiscount.type}
                    onChange={(e) =>
                      setEditingDiscount({
                        ...editingDiscount,
                        type: e.target.value as "percentage" | "fixed_amount",
                      })
                    }
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                  >
                    <option value="percentage">Percentage (% OFF)</option>
                    <option value="fixed_amount">Fixed Amount (S$ OFF)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={editingDiscount.value}
                    onChange={(e) => setEditingDiscount({ ...editingDiscount, value: Number(e.target.value) })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 font-mono text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">
                  Min. Subtotal (SGD)
                </label>
                <input
                  type="number"
                  value={editingDiscount.min_subtotal}
                  onChange={(e) =>
                    setEditingDiscount({ ...editingDiscount, min_subtotal: Number(e.target.value) })
                  }
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 font-mono text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Description</label>
                <input
                  type="text"
                  value={editingDiscount.description}
                  onChange={(e) => setEditingDiscount({ ...editingDiscount, description: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold uppercase tracking-wider rounded-xl text-xs transition-colors shadow-md"
              >
                Save Voucher Changes
              </button>
            </form>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: PRINT EASYPARCEL THERMAL AWB SHIPPING LABEL        */}
      {/* ========================================================= */}
      {awbOrder && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-white text-stone-950 rounded-2xl w-full max-w-md p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-gray-200">
              <span className="font-bold uppercase tracking-wider text-gray-500 text-[10px]">
                EasyParcel Singapore Consignment Manifest
              </span>
              <button onClick={() => setAwbOrder(null)} className="text-gray-400 hover:text-gray-900">
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Simulated 4x6 Thermal AWB Label */}
            <div className="border-2 border-dashed border-gray-400 p-4 rounded-xl space-y-3 font-mono">
              <div className="flex justify-between items-start pb-2 border-b border-gray-300">
                <div>
                  <span className="font-bold text-sm block">EASYPARCEL SG</span>
                  <span className="text-[10px] text-gray-600 block">
                    {awbOrder.easyparcel_courier || "WHITE-GLOVE SAME-DAY"}
                  </span>
                </div>
                <div className="text-right">
                  <span className="font-bold text-xs block">POSTAL: {awbOrder.shipping_address.postal_code}</span>
                  <span className="text-[10px] text-gray-500">MBS ROUTE #01</span>
                </div>
              </div>

              <div className="text-center py-2 bg-gray-100 rounded">
                <div className="font-bold text-base tracking-widest">
                  {awbOrder.easyparcel_awb || awbOrder.tracking_number}
                </div>
                <div className="text-[9px] text-gray-500 mt-0.5">||| |||| ||||| |||| |||||| |||| |||||</div>
              </div>

              <div className="grid grid-cols-2 gap-2 text-[10px] pt-1 border-t border-gray-300">
                <div>
                  <span className="font-bold text-gray-500 block">SHIPPER:</span>
                  <span>Ariel Leather Goods</span>
                  <span className="block">MBS #01-42, SG 018956</span>
                </div>
                <div>
                  <span className="font-bold text-gray-500 block">CONSIGNEE:</span>
                  <span>
                    {awbOrder.shipping_address.first_name} {awbOrder.shipping_address.last_name}
                  </span>
                  <span className="block">{awbOrder.shipping_address.address_1}</span>
                  <span className="block">{awbOrder.shipping_address.phone}</span>
                </div>
              </div>
            </div>

            <button
              onClick={() => window.print()}
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2 shadow-sm"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print AWB Thermal Label</span>
            </button>
          </div>
        </div>
      )}

      {/* ========================================================= */}
      {/* MODAL: OFFICIAL SINGAPORE TAX INVOICE (IRAS 9% GST)       */}
      {/* ========================================================= */}
      {invoiceModalOrder && (
        <SingaporeTaxInvoiceModal
          order={invoiceModalOrder}
          onClose={() => setInvoiceModalOrder(null)}
        />
      )}
    </div>
  );
}
