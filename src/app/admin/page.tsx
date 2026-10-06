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
} from "lucide-react";
import { PRODUCTS_CATALOG, Product } from "@/lib/catalog-data";
import { INITIAL_ORDERS, VALID_DISCOUNTS } from "@/lib/medusa/store";
import { MedusaOrder, MedusaDiscount } from "@/lib/medusa/types";

export default function AdminPortalPage() {
  const [activeTab, setActiveTab] = useState<"orders" | "catalog" | "discounts" | "customers" | "settings">("orders");

  // Merchant login state
  const [isMerchantAuthenticated, setIsMerchantAuthenticated] = useState(true);
  const [merchantEmail, setMerchantEmail] = useState("uncle.ariel@arielleather.com");

  // Orders State (combining INITIAL_ORDERS and any orders in localStorage)
  const [orders, setOrders] = useState<MedusaOrder[]>([]);
  const [selectedOrder, setSelectedOrder] = useState<MedusaOrder | null>(null);
  const [orderFilter, setOrderFilter] = useState<string>("all");

  // Catalog State
  const [products, setProducts] = useState<Product[]>([...PRODUCTS_CATALOG]);
  const [editingProductId, setEditingProductId] = useState<number | null>(null);
  const [editPrice, setEditPrice] = useState<number>(0);
  const [isAddProductOpen, setIsAddProductOpen] = useState(false);
  const [newProduct, setNewProduct] = useState({
    title: "",
    category: "wallet",
    price_sgd: 150,
    leather_type: "Italian Full-Grain Vachetta",
    colour: "Espresso Brown",
    image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
    description: "Handcrafted in Florence with double-saddle stitching.",
  });

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

  // Load orders and custom catalog on mount
  useEffect(() => {
    try {
      // 1. Load orders from API & localStorage
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

      // 2. Load custom products if any
      const savedProducts = localStorage.getItem("ariel_admin_products_v1");
      if (savedProducts) {
        setProducts(JSON.parse(savedProducts));
      }
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

  // Update Product Price
  const handleSavePrice = (productId: number) => {
    const updated = products.map((p) => (p.id === productId ? { ...p, price_sgd: editPrice } : p));
    setProducts(updated);
    localStorage.setItem("ariel_admin_products_v1", JSON.stringify(updated));
    setEditingProductId(null);
  };

  // Toggle in-stock
  const handleToggleStock = (productId: number) => {
    const updated = products.map((p) => (p.id === productId ? { ...p, in_stock: !p.in_stock } : p));
    setProducts(updated);
    localStorage.setItem("ariel_admin_products_v1", JSON.stringify(updated));
  };

  // Add Product
  const handleAddProduct = (e: React.FormEvent) => {
    e.preventDefault();
    const created: Product = {
      id: Date.now(),
      title: newProduct.title,
      slug: newProduct.title.toLowerCase().replace(/\s+/g, "-"),
      category: newProduct.category as "wallet" | "bag" | "belt" | "card_holder" | "accessory",
      subcategory: "Masterpiece",
      price_sgd: Number(newProduct.price_sgd),
      price_usd: Math.round(Number(newProduct.price_sgd) * 0.75),
      material: "Full-grain leather",
      leather_type: newProduct.leather_type,
      colour: newProduct.colour,
      colour_family: "brown",
      hardware: "Solid Brass",
      style_tags: ["bespoke", "luxury", "handmade"],
      recipient_tags: ["executive", "patron"],
      use_cases: ["formal", "business"],
      features: ["Hand-burnished edges", "Saddle stitching"],
      dimensions: "Standard Atelier Cut",
      weight_grams: 180,
      in_stock: true,
      inventory_count: 8,
      popularity_score: 95,
      margin_rate: 0.65,
      rating: 5.0,
      review_count: 1,
      image_url: newProduct.image_url,
      gallery_images: [newProduct.image_url],
      description: newProduct.description,
      craftsmanship_notes: "Crafted in Florence; quality checked at MBS Singapore.",
      embedding: new Array(1024).fill(0.03),
    };

    const updated = [created, ...products];
    setProducts(updated);
    localStorage.setItem("ariel_admin_products_v1", JSON.stringify(updated));
    setIsAddProductOpen(false);
    setNewProduct({
      title: "",
      category: "wallet",
      price_sgd: 150,
      leather_type: "Italian Full-Grain Vachetta",
      colour: "Espresso Brown",
      image_url: "https://images.unsplash.com/photo-1627123424574-724758594e93?auto=format&fit=crop&w=600&q=80",
      description: "Handcrafted in Florence with double-saddle stitching.",
    });
  };

  // Add Discount
  const handleAddDiscount = (e: React.FormEvent) => {
    e.preventDefault();
    const created: MedusaDiscount = {
      code: newDiscount.code.trim().toUpperCase(),
      type: newDiscount.type,
      value: Number(newDiscount.value),
      min_subtotal: Number(newDiscount.min_subtotal),
      description: newDiscount.description || `${newDiscount.value}% off for patrons`,
    };
    setDiscounts([created, ...discounts]);
    setIsAddDiscountOpen(false);
  };

  // Filtered orders
  const filteredOrders =
    orderFilter === "all" ? orders : orders.filter((o) => o.status.toLowerCase() === orderFilter.toLowerCase());

  // Metrics
  const totalRevenue = orders.reduce((acc, o) => acc + (o.total || 0), 0);
  const activeOrdersCount = orders.filter((o) => o.status !== "delivered").length;

  return (
    <div className="min-h-screen bg-stone-900 text-stone-100 flex flex-col font-sans selection:bg-amber-600 selection:text-white">
      {/* Top Merchant Navigation Bar */}
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

          <div>
            <div className="flex items-center gap-2">
              <span className="font-serif text-lg font-bold tracking-widest text-amber-400 uppercase">
                ARIEL ATELIER
              </span>
              <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-amber-950 text-amber-300 border border-amber-800">
                Medusa Merchant Cockpit
              </span>
            </div>
            <p className="text-[11px] text-stone-400">Singapore Flagship Hub &bull; Marina Bay Sands #01-42</p>
          </div>
        </div>

        <div className="flex items-center gap-4 text-xs">
          <div className="text-right hidden sm:block">
            <span className="block font-semibold text-stone-200">Master Craftsman Admin</span>
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
            Medusa Commerce Engine
          </div>

          {[
            { id: "orders", label: "Orders & Fulfillment", icon: Package, badge: activeOrdersCount },
            { id: "catalog", label: "Creations & Inventory", icon: ShoppingBag, badge: products.length },
            { id: "discounts", label: "Privileges & Promo", icon: Tag, badge: discounts.length },
            { id: "customers", label: "Patron Directory", icon: Users, badge: "VIP" },
            { id: "settings", label: "Singapore Atelier Hub", icon: MapPin },
          ].map((item) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setActiveTab(item.id as any)}
                className={`w-full flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-semibold transition-all ${
                  isActive
                    ? "bg-amber-900/40 text-amber-300 border border-amber-700/50"
                    : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
                }`}
              >
                <div className="flex items-center gap-3">
                  <Icon className={`w-4 h-4 ${isActive ? "text-amber-400" : "text-stone-500"}`} />
                  <span>{item.label}</span>
                </div>
                {item.badge !== undefined && (
                  <span
                    className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                      isActive ? "bg-amber-400 text-stone-950" : "bg-stone-800 text-stone-400"
                    }`}
                  >
                    {item.badge}
                  </span>
                )}
              </button>
            );
          })}

          <div className="pt-6 px-3">
            <div className="p-3 bg-stone-900/70 border border-stone-800 rounded-xl space-y-1 text-[11px] text-stone-400">
              <span className="font-bold text-stone-300 block">Singapore Dispatch Status</span>
              <p className="text-[10px] text-emerald-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
                Same-Day White-Glove Active
              </p>
              <p className="text-[10px] text-stone-500">MBS Boutique &bull; Cutoff 2:00 PM</p>
            </div>
          </div>
        </aside>

        {/* Content Pane */}
        <main className="flex-1 p-6 lg:p-8 space-y-6 overflow-y-auto">
          {/* Executive Overview KPI Strip */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4">
            <div className="bg-stone-950 border border-stone-800 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Total Gross Sales</span>
              <p className="font-serif text-2xl font-bold text-amber-400">
                S${totalRevenue.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </p>
              <p className="text-[11px] text-emerald-400 font-medium">+18.4% this week &bull; Singapore GST included</p>
            </div>

            <div className="bg-stone-950 border border-stone-800 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Commissions & Orders</span>
              <p className="font-serif text-2xl font-bold text-stone-100">{orders.length} Placed</p>
              <p className="text-[11px] text-amber-300 font-medium">{activeOrdersCount} pending dispatch</p>
            </div>

            <div className="bg-stone-950 border border-stone-800 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Active Atelier Creations</span>
              <p className="font-serif text-2xl font-bold text-stone-100">{products.length} Items</p>
              <p className="text-[11px] text-stone-400">Tuscan full-grain leather certified</p>
            </div>

            <div className="bg-stone-950 border border-stone-800 p-5 rounded-2xl space-y-1">
              <span className="text-[10px] font-bold uppercase tracking-wider text-stone-400">Average Commission</span>
              <p className="font-serif text-2xl font-bold text-stone-100">
                S${orders.length ? Math.round(totalRevenue / orders.length) : 185}
              </p>
              <p className="text-[11px] text-stone-400">Complimentary 24k gold monogramming</p>
            </div>
          </div>

          {/* TAB 1: ORDERS MODULE */}
          {activeTab === "orders" && (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-100">Client Orders & White-Glove Dispatch</h3>
                  <p className="text-xs text-stone-400">
                    Live orders placed through the storefront with hot-stamping customization and Singapore addresses.
                  </p>
                </div>

                {/* Filter buttons */}
                <div className="flex gap-1.5 bg-stone-900 p-1 rounded-xl text-xs">
                  {["all", "processing", "shipped", "delivered"].map((st) => (
                    <button
                      key={st}
                      onClick={() => setOrderFilter(st)}
                      className={`px-3 py-1.5 rounded-lg font-semibold capitalize transition-all ${
                        orderFilter === st
                          ? "bg-amber-600 text-white shadow-xs"
                          : "text-stone-400 hover:text-stone-200"
                      }`}
                    >
                      {st}
                    </button>
                  ))}
                </div>
              </div>

              {/* Orders Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-900 text-stone-400 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Order Ref</th>
                      <th className="p-3.5">Client & Address</th>
                      <th className="p-3.5">Creations & Monogram</th>
                      <th className="p-3.5">Total</th>
                      <th className="p-3.5">Status</th>
                      <th className="p-3.5 rounded-r-xl">Fulfillment Action</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900">
                    {filteredOrders.map((ord) => (
                      <tr key={ord.id} className="hover:bg-stone-900/40 transition-colors">
                        <td className="p-3.5 font-mono font-bold text-amber-400">
                          #{ord.display_id || ord.id.slice(-6)}
                          <span className="block text-[10px] text-stone-500 font-sans font-normal">
                            {new Date(ord.created_at).toLocaleDateString()}
                          </span>
                        </td>

                        <td className="p-3.5">
                          <span className="font-semibold text-stone-100 block">
                            {ord.shipping_address?.first_name} {ord.shipping_address?.last_name}
                          </span>
                          <span className="text-stone-400 text-[11px] block">{ord.customer_email}</span>
                          <span className="text-stone-500 text-[10px] block">
                            {ord.shipping_address?.address_1}, Singapore {ord.shipping_address?.postal_code}
                          </span>
                        </td>

                        <td className="p-3.5 space-y-1">
                          {ord.items.map((it, idx) => (
                            <div key={idx} className="text-[11px]">
                              <span className="font-semibold text-stone-200">
                                {it.title} &times; {it.quantity}
                              </span>
                              {it.monogram?.text && (
                                <span className="block text-[10px] text-amber-400 font-medium">
                                  ★ Bespoke Foil: &ldquo;{it.monogram.text}&rdquo; ({it.monogram.foil})
                                </span>
                              )}
                            </div>
                          ))}
                        </td>

                        <td className="p-3.5 font-serif font-bold text-stone-100">S${ord.total}</td>

                        <td className="p-3.5">
                          <span
                            className={`px-2.5 py-1 rounded-full text-[10px] font-bold uppercase tracking-wider inline-block mb-1 ${
                              ord.status === "delivered"
                                ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                                : ord.status === "shipped"
                                ? "bg-sky-950 text-sky-300 border border-sky-800"
                                : "bg-amber-950 text-amber-300 border border-amber-800"
                            }`}
                          >
                            {ord.status}
                          </span>
                          <span className="block text-[9px] text-emerald-400 font-mono">
                            HitPay SG: SETTLED
                          </span>
                          <span className="block text-[9px] text-stone-500 font-mono">
                            EasyParcel AWB: EP-{ord.display_id || "88921"}
                          </span>
                        </td>

                        <td className="p-3.5 space-y-1.5">
                          <div className="flex items-center gap-2">
                            {ord.status === "processing" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, "shipped")}
                                className="px-3 py-1 bg-amber-600 hover:bg-amber-500 text-stone-950 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors flex items-center gap-1"
                              >
                                <Truck className="w-3 h-3" />
                                <span>Dispatch EasyParcel</span>
                              </button>
                            )}
                            {ord.status === "shipped" && (
                              <button
                                onClick={() => handleUpdateOrderStatus(ord.id, "delivered")}
                                className="px-3 py-1 bg-emerald-600 hover:bg-emerald-500 text-stone-950 rounded-lg text-[10px] font-bold uppercase tracking-wider transition-colors"
                              >
                                Mark Delivered
                              </button>
                            )}
                            {ord.status === "delivered" && (
                              <span className="text-[11px] text-stone-500 flex items-center gap-1">
                                <CheckCircle className="w-3.5 h-3.5 text-emerald-500" />
                                Fulfilled
                              </span>
                            )}
                          </div>
                          <button
                            type="button"
                            onClick={() =>
                              alert(
                                `EasyParcel Airway Bill (AWB) for Order #${
                                  ord.display_id || ord.id
                                }:\n\nCourier: Lalamove / Ninja Van Same-Day Direct\nSender: Ariel Leather Goods (MBS #01-42)\nRecipient: ${
                                  ord.shipping_address?.first_name
                                } ${ord.shipping_address?.last_name}\nAddress: ${
                                  ord.shipping_address?.address_1
                                }, Singapore ${ord.shipping_address?.postal_code}\nHitPay Ref: HITPAY-SG-${Date.now().toString().slice(-6)}\n\n[PRINTING THERMAL SHIPPING LABEL]`
                              )
                            }
                            className="text-[9px] text-stone-400 hover:text-amber-300 underline block"
                          >
                            Print EasyParcel AWB Label
                          </button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 2: CREATIONS & INVENTORY MODULE */}
          {activeTab === "catalog" && (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 pb-4 border-b border-stone-800">
                <div>
                  <h3 className="font-serif text-xl font-bold text-stone-100">Creations & Stock Control</h3>
                  <p className="text-xs text-stone-400">
                    Real-time catalog pricing and availability across Singapore Marina Bay Sands and Changi Logistics.
                  </p>
                </div>

                <button
                  onClick={() => setIsAddProductOpen(true)}
                  className="px-4 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors"
                >
                  <Plus className="w-4 h-4" />
                  <span>Add New Creation</span>
                </button>
              </div>

              {/* Products Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-left text-xs text-stone-300">
                  <thead className="bg-stone-900 text-stone-400 uppercase text-[10px] tracking-wider font-bold">
                    <tr>
                      <th className="p-3.5 rounded-l-xl">Creation</th>
                      <th className="p-3.5">Category</th>
                      <th className="p-3.5">Leather & Origin</th>
                      <th className="p-3.5">Price (SGD)</th>
                      <th className="p-3.5">MBS Stock</th>
                      <th className="p-3.5 rounded-r-xl">Status & Edit</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-stone-900">
                    {products.map((prod) => (
                      <tr key={prod.id} className="hover:bg-stone-900/40 transition-colors">
                        <td className="p-3.5">
                          <div className="flex items-center gap-3">
                            <img
                              src={prod.image_url}
                              alt={prod.title}
                              className="w-12 h-12 rounded-xl object-cover border border-stone-800"
                            />
                            <div>
                              <span className="font-serif font-bold text-stone-100 block">{prod.title}</span>
                              <span className="text-stone-500 text-[10px] font-mono">{prod.slug}</span>
                            </div>
                          </div>
                        </td>

                        <td className="p-3.5 capitalize">{prod.category}</td>
                        <td className="p-3.5 text-stone-400">{prod.leather_type}</td>

                        <td className="p-3.5">
                          {editingProductId === prod.id ? (
                            <div className="flex items-center gap-2">
                              <input
                                type="number"
                                value={editPrice}
                                onChange={(e) => setEditPrice(Number(e.target.value))}
                                className="w-20 bg-stone-900 border border-amber-500 rounded-lg px-2 py-1 text-xs text-amber-300"
                              />
                              <button
                                onClick={() => handleSavePrice(prod.id)}
                                className="px-2 py-1 bg-amber-500 text-stone-950 font-bold rounded-lg text-[10px]"
                              >
                                Save
                              </button>
                            </div>
                          ) : (
                            <div className="flex items-center gap-2 font-serif font-bold text-amber-300">
                              <span>S${prod.price_sgd}</span>
                              <button
                                onClick={() => {
                                  setEditingProductId(prod.id);
                                  setEditPrice(prod.price_sgd);
                                }}
                                className="text-stone-500 hover:text-amber-400 p-1"
                              >
                                <Edit className="w-3 h-3" />
                              </button>
                            </div>
                          )}
                        </td>

                        <td className="p-3.5">
                          <span className="font-semibold text-stone-200">{prod.inventory_count} in salon</span>
                        </td>

                        <td className="p-3.5">
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
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </div>
          )}

          {/* TAB 3: DISCOUNTS MODULE */}
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

          {/* TAB 4: CUSTOMERS CRM MODULE */}
          {activeTab === "customers" && (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-5">
              <div className="pb-4 border-b border-stone-800">
                <h3 className="font-serif text-xl font-bold text-stone-100">Patron CRM & Collector Profiles</h3>
                <p className="text-xs text-stone-400">
                  Customers registered through Google Gmail, Facebook SSO, or direct Atelier signups.
                </p>
              </div>

              <div className="space-y-3">
                {[
                  {
                    name: "Alexander Tan",
                    email: "alexander.tan@atelier.sg",
                    phone: "+65 9821 5432",
                    provider: "Google (Gmail)",
                    ordersCount: 2,
                    totalSpend: "S$488.00",
                    monogram: "AT (24k Gold)",
                  },
                  {
                    name: "Somnath B.",
                    email: "sheshadri.lacawnche@gmail.com",
                    phone: "+65 9123 4567",
                    provider: "Google (Gmail)",
                    ordersCount: 1,
                    totalSpend: "S$129.00",
                    monogram: "SB (24k Gold)",
                  },
                  {
                    name: "Claire Dupont",
                    email: "claire.dupont@singapore.com",
                    phone: "+65 9654 3210",
                    provider: "Facebook",
                    ordersCount: 1,
                    totalSpend: "S$229.00",
                    monogram: "CD (Blind Deboss)",
                  },
                ].map((patron, i) => (
                  <div
                    key={i}
                    className="p-4 bg-stone-900 border border-stone-800 rounded-2xl flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 text-xs"
                  >
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-bold text-stone-100 text-sm">{patron.name}</span>
                        <span className="text-[9px] px-2 py-0.5 rounded bg-stone-800 text-stone-400 font-semibold">
                          Via {patron.provider}
                        </span>
                      </div>
                      <span className="text-stone-400 text-[11px] block">{patron.email} &bull; {patron.phone}</span>
                    </div>

                    <div className="flex items-center gap-6 text-right">
                      <div>
                        <span className="text-stone-500 text-[10px] uppercase font-bold block">Hot-Stamping</span>
                        <span className="font-mono text-amber-400 font-semibold">{patron.monogram}</span>
                      </div>
                      <div>
                        <span className="text-stone-500 text-[10px] uppercase font-bold block">Lifetime Spend</span>
                        <span className="font-serif font-bold text-stone-100">{patron.totalSpend}</span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: SINGAPORE ATELIER SETTINGS */}
          {activeTab === "settings" && (
            <div className="bg-stone-950 border border-stone-800 rounded-2xl p-6 space-y-5 text-xs">
              <div className="pb-4 border-b border-stone-800">
                <h3 className="font-serif text-xl font-bold text-stone-100">Singapore Flagship Configuration</h3>
                <p className="text-stone-400 text-xs">Boutique location details, tax compliance, and courier SLA.</p>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
                  <span className="font-bold text-stone-200 uppercase text-[10px] tracking-wider block">
                    Flagship Boutique
                  </span>
                  <p className="text-stone-300 font-semibold">Ariel Leather Goods Flagship Salon</p>
                  <p className="text-stone-400">Marina Bay Sands #01-42, 10 Bayfront Ave, Singapore 018956</p>
                  <p className="text-stone-500">UEN: 202619482M</p>
                </div>

                <div className="p-4 bg-stone-900 border border-stone-800 rounded-2xl space-y-2">
                  <span className="font-bold text-stone-200 uppercase text-[10px] tracking-wider block">
                    Singapore GST Compliance
                  </span>
                  <p className="text-emerald-400 font-semibold">9.0% IRAS Goods and Services Tax</p>
                  <p className="text-stone-400">Included dynamically in checkout totals and merchant invoices.</p>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Add Product Modal */}
      {isAddProductOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-lg p-6 space-y-4 text-xs">
            <h4 className="font-serif text-xl font-bold text-stone-100">Commission New Masterpiece</h4>
            <form onSubmit={handleAddProduct} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Creation Title</label>
                <input
                  type="text"
                  required
                  value={newProduct.title}
                  onChange={(e) => setNewProduct({ ...newProduct, title: e.target.value })}
                  placeholder="e.g. The Palazzo Duffle Bag"
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Category</label>
                  <select
                    value={newProduct.category}
                    onChange={(e) => setNewProduct({ ...newProduct, category: e.target.value })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                  >
                    <option value="wallet">Wallet</option>
                    <option value="bag">Bag</option>
                    <option value="belt">Belt</option>
                    <option value="card_holder">Card Holder</option>
                    <option value="accessory">Accessory</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Price (SGD)</label>
                  <input
                    type="number"
                    required
                    value={newProduct.price_sgd}
                    onChange={(e) => setNewProduct({ ...newProduct, price_sgd: Number(e.target.value) })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Leather Description</label>
                <input
                  type="text"
                  value={newProduct.leather_type}
                  onChange={(e) => setNewProduct({ ...newProduct, leather_type: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                />
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Photograph Image URL</label>
                <input
                  type="url"
                  value={newProduct.image_url}
                  onChange={(e) => setNewProduct({ ...newProduct, image_url: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddProductOpen(false)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-400 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold uppercase rounded-xl"
                >
                  Publish to Storefront
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* Add Discount Modal */}
      {isAddDiscountOpen && (
        <div className="fixed inset-0 z-50 bg-black/75 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="bg-stone-950 border border-stone-800 rounded-3xl w-full max-w-md p-6 space-y-4 text-xs">
            <h4 className="font-serif text-xl font-bold text-stone-100">Create Privilege Code</h4>
            <form onSubmit={handleAddDiscount} className="space-y-3">
              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Coupon Code</label>
                <input
                  type="text"
                  required
                  placeholder="e.g. SINGAPORE30"
                  value={newDiscount.code}
                  onChange={(e) => setNewDiscount({ ...newDiscount, code: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 uppercase"
                />
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Type</label>
                  <select
                    value={newDiscount.type}
                    onChange={(e) => setNewDiscount({ ...newDiscount, type: e.target.value as any })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                  >
                    <option value="percentage">Percentage (%)</option>
                    <option value="fixed_amount">Fixed Amount (S$)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Value</label>
                  <input
                    type="number"
                    required
                    value={newDiscount.value}
                    onChange={(e) => setNewDiscount({ ...newDiscount, value: Number(e.target.value) })}
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                  />
                </div>
              </div>

              <div>
                <label className="block text-[10px] uppercase font-bold text-stone-400 mb-1">Min Subtotal (SGD)</label>
                <input
                  type="number"
                  value={newDiscount.min_subtotal}
                  onChange={(e) => setNewDiscount({ ...newDiscount, min_subtotal: Number(e.target.value) })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100"
                />
              </div>

              <div className="flex justify-end gap-2 pt-3">
                <button
                  type="button"
                  onClick={() => setIsAddDiscountOpen(false)}
                  className="px-4 py-2 bg-stone-900 hover:bg-stone-800 text-stone-400 rounded-xl"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2 bg-amber-500 hover:bg-amber-400 text-stone-950 font-bold uppercase rounded-xl"
                >
                  Save Code
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}
