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
} from "lucide-react";
import { PRODUCTS_CATALOG, Product } from "@/lib/catalog-data";
import { INITIAL_ORDERS, VALID_DISCOUNTS } from "@/lib/medusa/store";
import { MedusaOrder, MedusaDiscount, MedusaRefund } from "@/lib/medusa/types";
import { useAuth, UserAccount } from "@/lib/auth-context";

export default function AdminPortalPage() {
  const { getAllUsers, adminIssueRefund, adminUpdateNotes, adminDeleteUserPdpa } = useAuth();

  const [activeTab, setActiveTab] = useState<"orders" | "catalog" | "discounts" | "customers" | "settings">("orders");

  // Merchant login state
  const [merchantEmail] = useState("uncle.ariel@arielleather.com");

  // Orders State
  const [orders, setOrders] = useState<MedusaOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<MedusaOrder | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("all");
  const [awbOrder, setAwbOrder] = useState<MedusaOrder | null>(null);

  // Catalog State
  const [products, setProducts] = useState<Product[]>([...PRODUCTS_CATALOG]);
  const [catalogSearch, setCatalogSearch] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState<Product | null>(null);

  const [newProductForm, setNewProductForm] = useState({
    title: "",
    sku: "",
    category: "wallet" as "wallet" | "bag" | "belt" | "card_holder" | "accessory",
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
    description: "Handcrafted in Florence with double-saddle stitching.",
    features: "RFID Protection, 8 Card Slots, 2 Bill Slots",
    monogrammable: true,
  });

  // Customers CRM State
  const [customers, setCustomers] = useState<UserAccount[]>([]);
  const [selectedCustomer, setSelectedCustomer] = useState<UserAccount | null>(null);
  const [customerDossierTab, setCustomerDossierTab] = useState<"pdpa" | "orders" | "payments" | "refunds" | "searches">("pdpa");
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

  // Discounts State
  const [discounts, setDiscounts] = useState<MedusaDiscount[]>([...VALID_DISCOUNTS]);
  const [isAddDiscountOpen, setIsAddDiscountOpen] = useState(false);
  const [newDiscount, setNewDiscount] = useState({
    code: "",
    type: "percentage" as "percentage" | "fixed_amount",
    value: 15,
    min_subtotal: 100,
    description: "",
  });

  // Load orders, products, and customers on mount
  useEffect(() => {
    try {
      // 1. Load orders
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

      // 2. Load products
      const savedProducts = localStorage.getItem("ariel_admin_products_v2");
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }

      // 3. Load customers
      const loadedUsers = getAllUsers();
      setCustomers(loadedUsers);
    } catch (e) {
      console.warn("Admin load failed:", e);
    }
  }, []);

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
    const created: Product = {
      id: Date.now(),
      title: newProductForm.title.trim(),
      slug: newProductForm.title.toLowerCase().replace(/\s+/g, "-"),
      category: newProductForm.category,
      subcategory: "Masterpiece",
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
      image_url: newProductForm.image_url,
      gallery_images: [newProductForm.image_url],
      description: newProductForm.description,
      craftsmanship_notes: "Handcrafted in Florence; inspected at MBS Singapore salon.",
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
      // Reload customers
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

  // Filtered orders & products
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

  // Financial Metrics with Singapore 9% GST itemization
  const grossRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const netSales = grossRevenue / 1.09;
  const gstCollected = grossRevenue - netSales;
  const shippingDisbursed = orders.reduce((acc, o) => acc + (o.shipping_total || 0), 0);
  const activeOrdersCount = orders.filter((o) => o.status !== "delivered").length;

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
              <svg className="w-5 h-5 text-[#C5A059] relative z-10" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
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
            <span className="text-stone-400 text-[11px]">{merchantEmail}</span>
          </div>
          <div className="w-9 h-9 rounded-full bg-amber-700/30 border border-amber-500/40 text-amber-400 flex items-center justify-center font-serif font-bold text-sm">
            SG
          </div>
        </div>
      </header>

      {/* Main Merchant Workspace */}
      <div className="flex-1 flex flex-col lg:flex-row">
        {/* Sidebar Nav */}
        <aside className="w-full lg:w-64 bg-stone-950 border-r border-stone-800 p-4 space-y-1 shrink-0">
          <div className="px-3 py-2 text-[10px] font-bold uppercase tracking-widest text-stone-500">
            Medusa Commerce Suite
          </div>

          {[
            { id: "orders", label: "Orders & Fulfillment", icon: Package, badge: activeOrdersCount },
            { id: "catalog", label: "Masterpiece Listings", icon: ShoppingBag, badge: products.length },
            { id: "customers", label: "Patron CRM & PDPA", icon: Users, badge: customers.length },
            { id: "discounts", label: "Privilege Codes", icon: Tag, badge: discounts.length },
            { id: "settings", label: "Singapore Flagship & GST", icon: MapPin },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-amber-500/15 text-amber-400 border border-amber-500/30 font-bold"
                    : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <Icon className="w-4 h-4" />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span className="px-2 py-0.5 rounded-full text-[10px] font-bold bg-stone-800 text-stone-300">
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 px-3">
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
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Gross Revenue (SGD)
              </span>
              <div className="font-serif text-2xl font-bold text-amber-400">S${grossRevenue.toFixed(2)}</div>
              <span className="text-[10px] text-stone-500 mt-1 block">Live captured via HitPay</span>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400 block mb-1">
                Net Sales (Pre-Tax)
              </span>
              <div className="font-serif text-2xl font-bold text-stone-200">S${netSales.toFixed(2)}</div>
              <span className="text-[10px] text-stone-500 mt-1 block">Taxable base (IRAS)</span>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-400 block mb-1">
                Singapore 9% GST
              </span>
              <div className="font-serif text-2xl font-bold text-emerald-400">S${gstCollected.toFixed(2)}</div>
              <span className="text-[10px] text-stone-500 mt-1 block">IRAS tax liability</span>
            </div>

            <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl">
              <span className="text-[10px] font-bold uppercase tracking-wider text-amber-300 block mb-1">
                EasyParcel Dispatch
              </span>
              <div className="font-serif text-2xl font-bold text-amber-300">
                {shippingDisbursed === 0 ? "Complimentary" : `S$${shippingDisbursed.toFixed(2)}`}
              </div>
              <span className="text-[10px] text-stone-500 mt-1 block">Logistics disbursement</span>
            </div>
          </div>

          {/* TAB 1: ORDERS & FULFILLMENT */}
          {activeTab === "orders" && (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-100">Orders & White-Glove Fulfillment</h3>
                  <p className="text-xs text-stone-400">
                    EasyParcel thermal shipping labels, HitPay settlement, and monogram specs.
                  </p>
                </div>

                <div className="flex items-center gap-2">
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

                        <td className="py-4 pr-3 font-serif font-bold text-stone-100">S${order.total.toFixed(2)}</td>

                        <td className="py-4 text-right space-x-2">
                          <button
                            onClick={() => setAwbOrder(order)}
                            className="px-2.5 py-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-200 text-[10px] font-bold uppercase tracking-wider transition-colors inline-flex items-center gap-1"
                          >
                            <Printer className="w-3 h-3 text-amber-400" />
                            <span>AWB</span>
                          </button>

                          <select
                            value={order.status}
                            onChange={(e) => handleUpdateOrderStatus(order.id, e.target.value as any)}
                            className="bg-stone-900 border border-stone-800 rounded-lg px-2 py-1 text-[10px] font-bold text-stone-200 uppercase tracking-wider"
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

          {/* TAB 2: MASTERPIECE LISTINGS & INVENTORY MANAGEMENT */}
          {activeTab === "catalog" && (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-100">Masterpiece Listings & Stock Control</h3>
                  <p className="text-xs text-stone-400">
                    Create new creations, modify SGD/USD pricing, adjust stock, and duplicate variants.
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
                              <span className="font-bold text-stone-200 block">{prod.title}</span>
                              <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                                {prod.category} &bull; {prod.colour}
                              </span>
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

                        <td className="py-3.5 text-right space-x-1.5">
                          <button
                            onClick={() => setEditingProduct(prod)}
                            className="p-1.5 rounded-lg bg-stone-800 hover:bg-stone-700 text-stone-300 transition-colors"
                            title="Edit Listing Specs"
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

          {/* TAB 3: PATRON CRM & SINGAPORE PDPA AUDIT */}
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

          {/* TAB 4: DISCOUNTS MODULE */}
          {activeTab === "discounts" && (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-100">Privilege Codes & Marketing Vouchers</h3>
                  <p className="text-xs text-stone-400">
                    Manage boutique discounts and welcome codes recognized during online checkout.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddDiscountOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Create Privilege Code</span>
                </button>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {discounts.map((d) => (
                  <div key={d.code} className="p-5 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
                    <div className="flex items-center justify-between">
                      <span className="font-mono text-base font-bold text-amber-400 tracking-wider">{d.code}</span>
                      <span className="text-[10px] px-2 py-0.5 rounded-full bg-stone-800 text-stone-300 font-bold uppercase">
                        {d.type === "percentage" ? `${d.value}% OFF` : `S$${d.value} OFF`}
                      </span>
                    </div>
                    <p className="text-xs text-stone-300">{d.description}</p>
                    <p className="text-[10px] text-stone-500">Min. order: S${d.min_subtotal}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SINGAPORE ATELIER HUB & GST CONFIG */}
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

      {/* PATRON DEEP-DIVE DOSSIER DRAWER (Uncle's CRM Drill-Down) */}
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
                  {/* PDPA Compliance Badge & Actions */}
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

                  {/* Singapore Address & Delivery Destination */}
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

                  {/* Uncle's Private Atelier Notes */}
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
                            <span className="font-serif font-bold text-stone-100 block mt-1">S${o.total.toFixed(2)}</span>
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
                          <span className="font-mono text-amber-400">AWB: {o.easyparcel_awb || o.tracking_number}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-500 text-center py-8">No orders placed by this customer yet.</p>
                  )}
                </div>
              )}

              {/* DOSSIER TAB 3: REFUNDS & HITPAY ENGINE */}
              {customerDossierTab === "refunds" && (
                <div className="space-y-4">
                  {/* Issue Refund Form */}
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
                            value={refundForm.amount || ""}
                            onChange={(e) => setRefundForm({ ...refundForm, amount: Number(e.target.value) })}
                            placeholder="e.g. 129.00"
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200"
                          />
                        </div>

                        <div>
                          <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Reason</label>
                          <select
                            value={refundForm.reason}
                            onChange={(e) => setRefundForm({ ...refundForm, reason: e.target.value })}
                            className="w-full bg-stone-950 border border-stone-800 rounded-xl px-3 py-2 text-stone-200"
                          >
                            <option value="14-Day Boutique Return">14-Day Boutique Return</option>
                            <option value="Customer Sizing Exchange">Customer Sizing Exchange</option>
                            <option value="Defective Stitching/Hardware">Defective Stitching/Hardware</option>
                            <option value="Damaged in Shipping">Damaged in Shipping</option>
                            <option value="Customer Goodwill">Customer Goodwill</option>
                          </select>
                        </div>
                      </div>

                      <button
                        type="submit"
                        className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl font-bold uppercase tracking-wider text-xs transition-colors shadow-xs"
                      >
                        Process HitPay SGQR Refund
                      </button>
                    </form>
                  </div>

                  {/* Past Refunds */}
                  <div className="space-y-2">
                    <span className="font-bold text-stone-400 uppercase text-[10px] tracking-wider block">
                      Past Refund Transactions
                    </span>
                    {selectedCustomer.refunds && selectedCustomer.refunds.length > 0 ? (
                      selectedCustomer.refunds.map((ref) => (
                        <div key={ref.id} className="p-3 bg-stone-900 border border-stone-800 rounded-xl space-y-1">
                          <div className="flex justify-between">
                            <span className="font-mono text-amber-400 font-bold">{ref.hitpay_refund_reference}</span>
                            <span className="font-serif font-bold text-red-400">-S${ref.amount.toFixed(2)}</span>
                          </div>
                          <p className="text-[11px] text-stone-300">Reason: {ref.reason}</p>
                          <span className="text-[10px] text-stone-500 block">
                            {new Date(ref.created_at).toLocaleDateString("en-SG")}
                          </span>
                        </div>
                      ))
                    ) : (
                      <p className="text-stone-500 text-center py-4">No refunds issued for this customer.</p>
                    )}
                  </div>
                </div>
              )}

              {/* DOSSIER TAB 4: CUSTOMER SEARCH INTENT & JOURNEY */}
              {customerDossierTab === "searches" && (
                <div className="space-y-3">
                  <div className="p-3 bg-stone-900 border border-stone-800 rounded-xl space-y-1">
                    <span className="font-bold text-stone-300 text-xs block">Search Intelligence & Curation Intent</span>
                    <p className="text-stone-400 text-[11px]">
                      Queries performed by this patron on the storefront concierge. Use these insights for bespoke
                      consultation and private showings.
                    </p>
                  </div>

                  {selectedCustomer.searchHistory && selectedCustomer.searchHistory.length > 0 ? (
                    selectedCustomer.searchHistory.map((s) => (
                      <div key={s.id} className="p-3 bg-stone-900 border border-stone-800 rounded-xl space-y-1">
                        <div className="flex justify-between items-start">
                          <span className="font-semibold text-stone-200 text-xs">&ldquo;{s.query}&rdquo;</span>
                          <span className="text-[10px] font-mono text-amber-400 uppercase bg-stone-800 px-1.5 py-0.5 rounded">
                            {s.mode}
                          </span>
                        </div>
                        <div className="flex justify-between text-[10px] text-stone-500">
                          <span>{s.results_count} creations curated</span>
                          <span>{new Date(s.timestamp).toLocaleString("en-SG")}</span>
                        </div>
                      </div>
                    ))
                  ) : (
                    <p className="text-stone-500 text-center py-8">No search history recorded yet.</p>
                  )}
                </div>
              )}
            </div>
          </div>
        </div>
      )}

      {/* MODAL: CREATE NEW LISTING */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-xl max-h-[90vh] overflow-y-auto p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <h4 className="font-serif text-xl font-bold text-stone-100">Commission New Masterpiece Listing</h4>
              <button onClick={() => setIsAddProductOpen(false)} className="text-stone-400 hover:text-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleCreateProduct} className="space-y-3.5">
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Creation Title *</label>
                  <input
                    type="text"
                    required
                    value={newProductForm.title}
                    onChange={(e) => setNewProductForm({ ...newProductForm, title: e.target.value })}
                    placeholder="e.g. The Palazzo Duffle Bag"
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
                    <option value="wallet">Wallet</option>
                    <option value="bag">Bag</option>
                    <option value="belt">Belt</option>
                    <option value="card_holder">Card Holder</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Price (SGD) *</label>
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
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Price (USD)</label>
                  <input
                    type="number"
                    value={newProductForm.price_usd}
                    onChange={(e) => setNewProductForm({ ...newProductForm, price_usd: Number(e.target.value) })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono"
                  />
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Initial Stock *</label>
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
                    placeholder="e.g. French Box Calf"
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

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Image URL</label>
                <input
                  type="url"
                  required
                  value={newProductForm.image_url}
                  onChange={(e) => setNewProductForm({ ...newProductForm, image_url: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs"
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

      {/* MODAL: EDIT LISTING */}
      {editingProduct && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-lg p-6 space-y-4 text-xs shadow-2xl">
            <div className="flex justify-between items-center pb-2 border-b border-stone-800">
              <h4 className="font-serif text-xl font-bold text-stone-100">Edit {editingProduct.title}</h4>
              <button onClick={() => setEditingProduct(null)} className="text-stone-400 hover:text-stone-100">
                <X className="w-5 h-5" />
              </button>
            </div>

            <form onSubmit={handleSaveEditedProduct} className="space-y-3.5">
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Creation Title</label>
                <input
                  type="text"
                  value={editingProduct.title}
                  onChange={(e) => setEditingProduct({ ...editingProduct, title: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Price (SGD)</label>
                  <input
                    type="number"
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
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Stock Count</label>
                  <input
                    type="number"
                    value={editingProduct.inventory_count}
                    onChange={(e) =>
                      setEditingProduct({ ...editingProduct, inventory_count: Number(e.target.value) })
                    }
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Leather Type</label>
                <input
                  type="text"
                  value={editingProduct.leather_type}
                  onChange={(e) => setEditingProduct({ ...editingProduct, leather_type: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                />
              </div>

              <button
                type="submit"
                className="w-full py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold uppercase tracking-wider rounded-xl text-xs transition-colors"
              >
                Save Listing Updates
              </button>
            </form>
          </div>
        </div>
      )}

      {/* MODAL: PRINT EASYPARCEL THERMAL AWB SHIPPING LABEL */}
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
              className="w-full py-2.5 bg-stone-900 hover:bg-stone-800 text-white rounded-xl font-bold uppercase tracking-wider text-xs flex items-center justify-center gap-2"
            >
              <Printer className="w-4 h-4 text-amber-400" />
              <span>Print AWB Thermal Label</span>
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
