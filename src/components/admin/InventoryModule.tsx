"use client";

import React, { useState, useEffect } from "react";
import {
  Layers,
  Package,
  Plus,
  Minus,
  AlertTriangle,
  CheckCircle,
  Truck,
  RotateCcw,
  Search,
  Download,
  Filter,
  ArrowRightLeft,
  Calendar,
  X,
  Sparkles,
  MapPin,
  Clock,
  Archive,
  DollarSign,
  TrendingUp,
  FileText,
  ShieldCheck,
  Edit,
  Eye,
} from "lucide-react";
import { Product } from "@/lib/catalog-data";
import {
  MedusaInventoryItem,
  MedusaStockLocation,
  MedusaStockMovement,
} from "@/lib/medusa/types";
import {
  DEFAULT_STOCK_LOCATIONS,
  generateInitialInventory,
  INITIAL_STOCK_MOVEMENTS,
} from "@/lib/medusa/inventory-store";

interface InventoryModuleProps {
  products: Product[];
  onUpdateProducts: (updated: Product[]) => void;
}

export function InventoryModule({ products, onUpdateProducts }: InventoryModuleProps) {
  // Inventory state
  const [inventoryItems, setInventoryItems] = useState<MedusaInventoryItem[]>([]);
  const [movements, setMovements] = useState<MedusaStockMovement[]>([]);
  const [locations] = useState<MedusaStockLocation[]>(DEFAULT_STOCK_LOCATIONS);

  // Filters & Search
  const [searchQuery, setSearchQuery] = useState("");
  const [statusFilter, setStatusFilter] = useState<"all" | "low" | "out" | "instock">("all");
  const [selectedLocationId, setSelectedLocationId] = useState<string>("all");
  const [activeSubTab, setActiveSubTab] = useState<"items" | "ledger">("items");

  // Modals state
  const [adjustModalItem, setAdjustModalItem] = useState<MedusaInventoryItem | null>(null);
  const [adjustForm, setAdjustForm] = useState({
    type: "AUDIT_ADJUSTMENT" as MedusaStockMovement["type"],
    delta: 1,
    mode: "delta" as "delta" | "absolute",
    absoluteCount: 10,
    locationId: "loc_mbs",
    notes: "Manual physical stock reconciliation by Uncle Ariel",
  });

  const [isConsignmentModalOpen, setIsConsignmentModalOpen] = useState(false);
  const [consignmentForm, setConsignmentForm] = useState({
    consignmentCode: `FLR-SIN-2026-${Math.floor(100 + Math.random() * 900)}`,
    destinationLocationId: "loc_jurong",
    targetMode: "low_stock" as "low_stock" | "single",
    singleItemId: "",
    unitsPerItem: 5,
    notes: "Tuscan Vachetta and English Bridle air-freight shipment from Florence workshop",
  });

  const [isTransferModalOpen, setIsTransferModalOpen] = useState(false);
  const [transferForm, setTransferForm] = useState({
    itemId: "",
    fromLocationId: "loc_jurong",
    toLocationId: "loc_mbs",
    quantity: 2,
    notes: "Boutique showcase replenishment from central vault",
  });

  // Load from localStorage or initialize
  useEffect(() => {
    try {
      const savedItems = localStorage.getItem("ariel_admin_inventory_items_v2");
      if (savedItems) {
        setInventoryItems(JSON.parse(savedItems));
      } else {
        const initial = generateInitialInventory(products);
        setInventoryItems(initial);
        localStorage.setItem("ariel_admin_inventory_items_v2", JSON.stringify(initial));
      }

      const savedMovements = localStorage.getItem("ariel_inventory_movements_v2");
      if (savedMovements) {
        setMovements(JSON.parse(savedMovements));
      } else {
        setMovements(INITIAL_STOCK_MOVEMENTS);
        localStorage.setItem("ariel_inventory_movements_v2", JSON.stringify(INITIAL_STOCK_MOVEMENTS));
      }
    } catch (e) {
      console.warn("Failed loading inventory storage:", e);
      setInventoryItems(generateInitialInventory(products));
      setMovements(INITIAL_STOCK_MOVEMENTS);
    }
  }, [products]);

  // Save changes helper
  const persistInventory = (
    newItems: MedusaInventoryItem[],
    newMovements: MedusaStockMovement[]
  ) => {
    setInventoryItems(newItems);
    setMovements(newMovements);
    localStorage.setItem("ariel_admin_inventory_items_v2", JSON.stringify(newItems));
    localStorage.setItem("ariel_inventory_movements_v2", JSON.stringify(newMovements));

    // Also synchronize live products catalog
    const updatedProducts = products.map((p) => {
      const invMatch = newItems.find((it) => it.product_id === p.id);
      if (invMatch) {
        return {
          ...p,
          inventory_count: invMatch.stocked_quantity,
          in_stock: invMatch.stocked_quantity > 0,
        };
      }
      return p;
    });

    onUpdateProducts(updatedProducts);
  };

  // Quick 1-Click Increment / Decrement
  const handleQuickAdjust = (item: MedusaInventoryItem, delta: number) => {
    const newStock = Math.max(0, item.stocked_quantity + delta);
    if (newStock === item.stocked_quantity) return;

    const loc = locations[0]; // Default to MBS Flagship for quick table clicks
    const updatedLevels = item.location_levels.map((lvl) => {
      if (lvl.location_id === loc.id) {
        return { ...lvl, stocked_quantity: Math.max(0, lvl.stocked_quantity + delta) };
      }
      return lvl;
    });

    const updatedItem: MedusaInventoryItem = {
      ...item,
      stocked_quantity: newStock,
      available_quantity: Math.max(0, newStock - item.reserved_quantity),
      location_levels: updatedLevels,
    };

    const newItems = inventoryItems.map((it) => (it.id === item.id ? updatedItem : it));

    const newMovement: MedusaStockMovement = {
      id: `sm_${Date.now()}`,
      inventory_item_id: item.id,
      sku: item.sku,
      product_title: item.title,
      type: delta > 0 ? "RECEIPT" : "AUDIT_ADJUSTMENT",
      quantity_delta: delta,
      previous_stock: item.stocked_quantity,
      new_stock: newStock,
      location_id: loc.id,
      location_name: loc.name,
      actor: "Uncle Ariel (Master Craftsman)",
      notes: delta > 0 ? "1-Click stock receipt adjustment" : "1-Click manual stock write-down",
      created_at: new Date().toISOString(),
    };

    persistInventory(newItems, [newMovement, ...movements]);
  };

  // Detailed Modal Stock Adjustment
  const handleConfirmAdjust = (e: React.FormEvent) => {
    e.preventDefault();
    if (!adjustModalItem) return;

    const targetLoc = locations.find((l) => l.id === adjustForm.locationId) || locations[0];
    let newStock = adjustModalItem.stocked_quantity;
    let delta = adjustForm.delta;

    if (adjustForm.mode === "absolute") {
      newStock = Math.max(0, adjustForm.absoluteCount);
      delta = newStock - adjustModalItem.stocked_quantity;
    } else {
      newStock = Math.max(0, adjustModalItem.stocked_quantity + delta);
    }

    const updatedLevels = adjustModalItem.location_levels.map((lvl) => {
      if (lvl.location_id === targetLoc.id) {
        return {
          ...lvl,
          stocked_quantity: Math.max(0, lvl.stocked_quantity + delta),
        };
      }
      return lvl;
    });

    const updatedItem: MedusaInventoryItem = {
      ...adjustModalItem,
      stocked_quantity: newStock,
      available_quantity: Math.max(0, newStock - adjustModalItem.reserved_quantity),
      location_levels: updatedLevels,
    };

    const newItems = inventoryItems.map((it) => (it.id === adjustModalItem.id ? updatedItem : it));

    const newMovement: MedusaStockMovement = {
      id: `sm_${Date.now()}`,
      inventory_item_id: adjustModalItem.id,
      sku: adjustModalItem.sku,
      product_title: adjustModalItem.title,
      type: adjustForm.type,
      quantity_delta: delta,
      previous_stock: adjustModalItem.stocked_quantity,
      new_stock: newStock,
      location_id: targetLoc.id,
      location_name: targetLoc.name,
      actor: "Uncle Ariel (Master Craftsman)",
      notes: adjustForm.notes || "Stock reconciliation by Uncle Ariel",
      created_at: new Date().toISOString(),
    };

    persistInventory(newItems, [newMovement, ...movements]);
    setAdjustModalItem(null);
  };

  // Receive Consignment from Florence Modal
  const handleReceiveConsignment = (e: React.FormEvent) => {
    e.preventDefault();
    const destLoc = locations.find((l) => l.id === consignmentForm.destinationLocationId) || locations[1];
    const newMovements: MedusaStockMovement[] = [];
    let updatedItems = [...inventoryItems];

    if (consignmentForm.targetMode === "low_stock") {
      // Restock all low or zero stock items by unitsPerItem
      updatedItems = updatedItems.map((item) => {
        if (item.stocked_quantity <= item.low_stock_threshold) {
          const delta = consignmentForm.unitsPerItem;
          const newStock = item.stocked_quantity + delta;

          newMovements.push({
            id: `sm_${Date.now()}_${item.id}`,
            inventory_item_id: item.id,
            sku: item.sku,
            product_title: item.title,
            type: "RECEIPT",
            quantity_delta: delta,
            previous_stock: item.stocked_quantity,
            new_stock: newStock,
            location_id: destLoc.id,
            location_name: destLoc.name,
            actor: "Uncle Ariel (Master Craftsman)",
            notes: `Consignment ${consignmentForm.consignmentCode} from Florence workshop: ${consignmentForm.notes}`,
            created_at: new Date().toISOString(),
          });

          const updatedLevels = item.location_levels.map((lvl) => {
            if (lvl.location_id === destLoc.id) {
              return { ...lvl, stocked_quantity: lvl.stocked_quantity + delta };
            }
            return lvl;
          });

          return {
            ...item,
            stocked_quantity: newStock,
            available_quantity: Math.max(0, newStock - item.reserved_quantity),
            location_levels: updatedLevels,
          };
        }
        return item;
      });
    } else if (consignmentForm.singleItemId) {
      // Restock specific single item
      const item = updatedItems.find((it) => it.id === consignmentForm.singleItemId);
      if (item) {
        const delta = consignmentForm.unitsPerItem;
        const newStock = item.stocked_quantity + delta;

        newMovements.push({
          id: `sm_${Date.now()}_${item.id}`,
          inventory_item_id: item.id,
          sku: item.sku,
          product_title: item.title,
          type: "RECEIPT",
          quantity_delta: delta,
          previous_stock: item.stocked_quantity,
          new_stock: newStock,
          location_id: destLoc.id,
          location_name: destLoc.name,
          actor: "Uncle Ariel (Master Craftsman)",
          notes: `Consignment ${consignmentForm.consignmentCode} from Florence workshop: ${consignmentForm.notes}`,
          created_at: new Date().toISOString(),
        });

        const updatedLevels = item.location_levels.map((lvl) => {
          if (lvl.location_id === destLoc.id) {
            return { ...lvl, stocked_quantity: lvl.stocked_quantity + delta };
          }
          return lvl;
        });

        updatedItems = updatedItems.map((it) =>
          it.id === item.id
            ? {
                ...it,
                stocked_quantity: newStock,
                available_quantity: Math.max(0, newStock - it.reserved_quantity),
                location_levels: updatedLevels,
              }
            : it
        );
      }
    }

    persistInventory(updatedItems, [...newMovements, ...movements]);
    setIsConsignmentModalOpen(false);
  };

  // Inter-Location Stock Transfer
  const handleExecuteTransfer = (e: React.FormEvent) => {
    e.preventDefault();
    const item = inventoryItems.find((it) => it.id === transferForm.itemId);
    if (!item) return;

    const fromLoc = locations.find((l) => l.id === transferForm.fromLocationId) || locations[1];
    const toLoc = locations.find((l) => l.id === transferForm.toLocationId) || locations[0];
    const qty = Math.min(item.stocked_quantity, Math.max(1, transferForm.quantity));

    const updatedLevels = item.location_levels.map((lvl) => {
      if (lvl.location_id === fromLoc.id) {
        return { ...lvl, stocked_quantity: Math.max(0, lvl.stocked_quantity - qty) };
      }
      if (lvl.location_id === toLoc.id) {
        return { ...lvl, stocked_quantity: lvl.stocked_quantity + qty };
      }
      return lvl;
    });

    const updatedItem: MedusaInventoryItem = {
      ...item,
      location_levels: updatedLevels,
    };

    const newItems = inventoryItems.map((it) => (it.id === item.id ? updatedItem : it));

    const transferMovement: MedusaStockMovement = {
      id: `sm_${Date.now()}`,
      inventory_item_id: item.id,
      sku: item.sku,
      product_title: item.title,
      type: "TRANSFER",
      quantity_delta: qty,
      previous_stock: item.stocked_quantity,
      new_stock: item.stocked_quantity,
      location_id: toLoc.id,
      location_name: `${fromLoc.code} ➔ ${toLoc.code}`,
      actor: "Uncle Ariel (Master Craftsman)",
      notes: `Transferred ${qty} units from ${fromLoc.name} to ${toLoc.name}: ${transferForm.notes}`,
      created_at: new Date().toISOString(),
    };

    persistInventory(newItems, [transferMovement, ...movements]);
    setIsTransferModalOpen(false);
  };

  // Export Inventory Ledger
  const handleExportInventory = (format: "csv" | "json") => {
    if (format === "json") {
      const data = {
        generated_at: new Date().toISOString(),
        company: "Ariel Leather Goods Pte. Ltd.",
        uen: "202619482M",
        gst_reg: "M90382710X",
        items: inventoryItems,
        recent_movements: movements,
      };
      const blob = new Blob([JSON.stringify(data, null, 2)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ariel_inventory_ledger_${new Date().toISOString().slice(0, 10)}.json`;
      a.click();
      URL.revokeObjectURL(url);
    } else {
      let csv = "SKU,Title,Category,Stocked Qty,Reserved Qty,Available Qty,Unit Retail (SGD),Unit Cost (SGD),Total Retail Valuation (SGD),Stock Status\n";
      inventoryItems.forEach((it) => {
        const status =
          it.stocked_quantity === 0
            ? "OUT_OF_STOCK"
            : it.stocked_quantity <= it.low_stock_threshold
            ? "LOW_STOCK"
            : "IN_STOCK";
        const valuation = (it.stocked_quantity * it.unit_retail_sgd).toFixed(2);
        csv += `"${it.sku}","${it.title}","${it.category}",${it.stocked_quantity},${it.reserved_quantity},${it.available_quantity},${it.unit_retail_sgd},${it.unit_cost_sgd},${valuation},"${status}"\n`;
      });
      const blob = new Blob([csv], { type: "text/csv" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `ariel_inventory_ledger_${new Date().toISOString().slice(0, 10)}.csv`;
      a.click();
      URL.revokeObjectURL(url);
    }
  };

  // KPIs
  const totalUnits = inventoryItems.reduce((acc, it) => acc + it.stocked_quantity, 0);
  const totalRetailValuation = inventoryItems.reduce(
    (acc, it) => acc + it.stocked_quantity * it.unit_retail_sgd,
    0
  );
  const totalCostValuation = inventoryItems.reduce(
    (acc, it) => acc + it.stocked_quantity * it.unit_cost_sgd,
    0
  );
  const lowStockCount = inventoryItems.filter(
    (it) => it.stocked_quantity > 0 && it.stocked_quantity <= it.low_stock_threshold
  ).length;
  const outOfStockCount = inventoryItems.filter((it) => it.stocked_quantity === 0).length;

  // Filtered Items
  const filteredItems = inventoryItems.filter((it) => {
    // Search query
    const matchesSearch =
      !searchQuery ||
      it.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.sku.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.leather_type.toLowerCase().includes(searchQuery.toLowerCase()) ||
      it.colour.toLowerCase().includes(searchQuery.toLowerCase());

    // Status filter
    let matchesStatus = true;
    if (statusFilter === "low") {
      matchesStatus = it.stocked_quantity > 0 && it.stocked_quantity <= it.low_stock_threshold;
    } else if (statusFilter === "out") {
      matchesStatus = it.stocked_quantity === 0;
    } else if (statusFilter === "instock") {
      matchesStatus = it.stocked_quantity > it.low_stock_threshold;
    }

    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      {/* Top Banner & Action Buttons */}
      <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 sm:p-6 flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <div className="flex items-center gap-2 mb-1">
            <span className="p-1.5 rounded-lg bg-amber-500/10 text-amber-400 border border-amber-500/20">
              <Layers className="w-4 h-4" />
            </span>
            <span className="text-[10px] font-bold tracking-widest text-amber-400 uppercase">
              Medusa Multi-Location Inventory Module
            </span>
          </div>
          <h2 className="font-serif text-xl sm:text-2xl font-bold text-stone-100">
            Artisanal Stock & Consignment Vault
          </h2>
          <p className="text-xs text-stone-400 max-w-xl">
            Track certified Tuscan hides, frontline MBS showcases, Jurong central fulfillment depot,
            and incoming air-freight consignments from Florence.
          </p>
        </div>

        {/* Global Action Toolbar */}
        <div className="flex flex-wrap items-center gap-2.5">
          <button
            onClick={() => setIsConsignmentModalOpen(true)}
            className="px-3.5 py-2 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
          >
            <Truck className="w-3.5 h-3.5" />
            <span>Receive Florence Consignment</span>
          </button>

          <button
            onClick={() => setIsTransferModalOpen(true)}
            className="px-3.5 py-2 bg-stone-900 hover:bg-stone-800 text-stone-200 border border-stone-700 rounded-xl text-xs font-semibold tracking-wider transition-all flex items-center gap-1.5"
          >
            <ArrowRightLeft className="w-3.5 h-3.5 text-amber-400" />
            <span>Location Transfer</span>
          </button>

          <div className="relative inline-block text-left">
            <button
              onClick={() => handleExportInventory("csv")}
              className="px-3 py-2 bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white border border-stone-800 rounded-xl text-xs font-semibold transition-all flex items-center gap-1.5"
              title="Download stock valuation ledger for IRAS audit"
            >
              <Download className="w-3.5 h-3.5 text-amber-400" />
              <span>Export CSV</span>
            </button>
          </div>
        </div>
      </div>

      {/* KPI Cards Strip */}
      <div className="grid grid-cols-2 lg:grid-cols-5 gap-3.5">
        <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl">
          <span className="text-stone-400 text-[10px] uppercase tracking-wider block font-bold">
            Total Handcrafted Units
          </span>
          <span className="text-2xl font-bold font-serif text-amber-400 block mt-1">
            {totalUnits}
          </span>
          <span className="text-[10px] text-stone-500">Across 3 Singapore hubs</span>
        </div>

        <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl">
          <span className="text-stone-400 text-[10px] uppercase tracking-wider block font-bold">
            Retail Asset Valuation
          </span>
          <span className="text-2xl font-bold font-serif text-stone-100 block mt-1">
            S${totalRetailValuation.toLocaleString()}
          </span>
          <span className="text-[10px] text-stone-500">Retail price (incl. 9% GST)</span>
        </div>

        <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl">
          <span className="text-stone-400 text-[10px] uppercase tracking-wider block font-bold">
            Workshop Leather Cost Basis
          </span>
          <span className="text-2xl font-bold font-serif text-emerald-400 block mt-1">
            S${totalCostValuation.toLocaleString()}
          </span>
          <span className="text-[10px] text-stone-500">Artisan production cost</span>
        </div>

        <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl">
          <span className="text-stone-400 text-[10px] uppercase tracking-wider block font-bold">
            Low Stock Alerts (&le; 3)
          </span>
          <span
            className={`text-2xl font-bold font-serif block mt-1 ${
              lowStockCount > 0 ? "text-amber-400" : "text-stone-400"
            }`}
          >
            {lowStockCount}
          </span>
          <span className="text-[10px] text-stone-500">Requires Florence replenishment</span>
        </div>

        <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl">
          <span className="text-stone-400 text-[10px] uppercase tracking-wider block font-bold">
            Depleted / Out of Stock
          </span>
          <span
            className={`text-2xl font-bold font-serif block mt-1 ${
              outOfStockCount > 0 ? "text-rose-400" : "text-stone-400"
            }`}
          >
            {outOfStockCount}
          </span>
          <span className="text-[10px] text-stone-500">0 units on hand</span>
        </div>
      </div>

      {/* Stock Locations Strip */}
      <div className="p-4 bg-stone-950 border border-stone-800 rounded-2xl">
        <div className="flex items-center justify-between mb-3">
          <span className="text-[10px] font-bold text-stone-400 uppercase tracking-widest flex items-center gap-1.5">
            <MapPin className="w-3.5 h-3.5 text-amber-400" />
            <span>Singapore Multi-Location Fulfillment Hubs</span>
          </span>
          <span className="text-[10px] text-stone-500">Medusa Inventory Locations API v2</span>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          {locations.map((loc) => {
            const unitsInLoc = inventoryItems.reduce((acc, it) => {
              const match = it.location_levels.find((lvl) => lvl.location_id === loc.id);
              return acc + (match?.stocked_quantity || 0);
            }, 0);

            return (
              <div
                key={loc.id}
                className="p-3 bg-stone-900 border border-stone-800 rounded-xl space-y-1 hover:border-stone-700 transition-colors"
              >
                <div className="flex items-center justify-between">
                  <span className="text-xs font-bold text-stone-200">{loc.name}</span>
                  <span className="text-[9.5px] font-mono px-1.5 py-0.5 rounded bg-stone-800 text-amber-400">
                    {loc.code}
                  </span>
                </div>
                <p className="text-[10.5px] text-stone-400 truncate">{loc.address}</p>
                <div className="pt-1.5 border-t border-stone-800 flex items-center justify-between text-[11px]">
                  <span className="text-stone-400">Stocked:</span>
                  <span className="font-bold font-mono text-amber-400">{unitsInLoc} units</span>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* Sub Tabs: Inventory Items vs Movement History */}
      <div className="flex items-center justify-between border-b border-stone-800 pb-2">
        <div className="flex gap-2">
          <button
            onClick={() => setActiveSubTab("items")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeSubTab === "items"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            }`}
          >
            <Archive className="w-3.5 h-3.5" />
            <span>Stocked Creations ({filteredItems.length})</span>
          </button>

          <button
            onClick={() => setActiveSubTab("ledger")}
            className={`px-4 py-2 rounded-xl text-xs font-bold uppercase tracking-wider transition-all flex items-center gap-2 ${
              activeSubTab === "ledger"
                ? "bg-amber-500/15 text-amber-400 border border-amber-500/30"
                : "text-stone-400 hover:text-stone-200 hover:bg-stone-900"
            }`}
          >
            <FileText className="w-3.5 h-3.5" />
            <span>Stock Movements Ledger ({movements.length})</span>
          </button>
        </div>
      </div>

      {/* SUBTAB 1: INVENTORY ITEMS TABLE */}
      {activeSubTab === "items" && (
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4">
          {/* Search & Filter Controls */}
          <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
            <div className="relative flex-1 max-w-md">
              <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search SKU, creation title, leather type, color..."
                className="w-full bg-stone-900 border border-stone-800 rounded-xl pl-9 pr-3 py-2 text-xs text-stone-100 placeholder-stone-500 focus:outline-none focus:border-amber-400"
              />
            </div>

            {/* Status Pills */}
            <div className="flex items-center gap-1.5 overflow-x-auto pb-1 sm:pb-0">
              {[
                { id: "all", label: "All Items", count: inventoryItems.length },
                { id: "low", label: "Low Stock (≤ 3)", count: lowStockCount },
                { id: "out", label: "Out of Stock (0)", count: outOfStockCount },
                { id: "instock", label: "Well Stocked", count: inventoryItems.length - lowStockCount - outOfStockCount },
              ].map((pill) => (
                <button
                  key={pill.id}
                  onClick={() => setStatusFilter(pill.id as any)}
                  className={`px-3 py-1.5 rounded-xl text-[10px] font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
                    statusFilter === pill.id
                      ? "bg-amber-500 text-stone-950 font-extrabold"
                      : "bg-stone-900 text-stone-400 hover:text-stone-200"
                  }`}
                >
                  {pill.label} ({pill.count})
                </button>
              ))}
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-[10px] uppercase tracking-wider text-stone-400">
                  <th className="pb-3 font-semibold">SKU & Creation</th>
                  <th className="pb-3 font-semibold">Leather & Color</th>
                  <th className="pb-3 font-semibold">Location Levels</th>
                  <th className="pb-3 font-semibold text-center">Status</th>
                  <th className="pb-3 font-semibold text-center">On Hand</th>
                  <th className="pb-3 font-semibold text-center">Available</th>
                  <th className="pb-3 font-semibold">Unit Retail / Valuation</th>
                  <th className="pb-3 font-semibold text-right">Uncle Ariel Quick Adjust</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-900">
                {filteredItems.map((item) => {
                  const isOutOfStock = item.stocked_quantity === 0;
                  const isLowStock = !isOutOfStock && item.stocked_quantity <= item.low_stock_threshold;
                  const totalValuation = (item.stocked_quantity * item.unit_retail_sgd).toFixed(2);

                  return (
                    <tr key={item.id} className="hover:bg-stone-900/50 transition-colors">
                      {/* SKU & Title */}
                      <td className="py-3.5 pr-3">
                        <span className="font-mono text-[10.5px] text-amber-400 block font-bold">
                          {item.sku}
                        </span>
                        <span className="font-medium text-stone-200 block text-xs">
                          {item.title}
                        </span>
                        <span className="text-[10px] text-stone-500 uppercase tracking-wider">
                          {item.category}
                        </span>
                      </td>

                      {/* Leather Type & Color */}
                      <td className="py-3.5 pr-3 text-stone-300">
                        <span className="block text-xs">{item.leather_type}</span>
                        <span className="text-[10.5px] text-stone-500 block">{item.colour} Patina</span>
                      </td>

                      {/* Multi-Location Levels */}
                      <td className="py-3.5 pr-3">
                        <div className="space-y-0.5 text-[10.5px] font-mono">
                          {item.location_levels.map((lvl) => (
                            <div key={lvl.location_id} className="flex items-center justify-between gap-3 text-stone-400">
                              <span className="text-[9.5px]">
                                {lvl.location_id === "loc_mbs"
                                  ? "MBS Salon"
                                  : lvl.location_id === "loc_jurong"
                                  ? "Jurong Vault"
                                  : "Sentosa VIP"}
                                :
                              </span>
                              <span className="font-semibold text-stone-200">{lvl.stocked_quantity}</span>
                            </div>
                          ))}
                        </div>
                      </td>

                      {/* Status */}
                      <td className="py-3.5 px-2 text-center">
                        {isOutOfStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-rose-950/80 text-rose-300 border border-rose-800">
                            <AlertTriangle className="w-2.5 h-2.5" />
                            <span>Out of Stock</span>
                          </span>
                        ) : isLowStock ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-amber-950/80 text-amber-300 border border-amber-800 animate-pulse">
                            <Clock className="w-2.5 h-2.5" />
                            <span>Low (&le; {item.low_stock_threshold})</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[9px] font-bold uppercase tracking-wider bg-emerald-950/80 text-emerald-300 border border-emerald-800">
                            <CheckCircle className="w-2.5 h-2.5" />
                            <span>Healthy</span>
                          </span>
                        )}
                      </td>

                      {/* Stocked On Hand */}
                      <td className="py-3.5 px-2 text-center">
                        <span className="font-mono text-sm font-bold text-stone-100">
                          {item.stocked_quantity}
                        </span>
                        <span className="text-[9.5px] text-stone-500 block">units</span>
                      </td>

                      {/* Available to Sell */}
                      <td className="py-3.5 px-2 text-center">
                        <span className="font-mono text-xs font-semibold text-amber-300">
                          {item.available_quantity}
                        </span>
                        {item.reserved_quantity > 0 && (
                          <span className="text-[9px] text-stone-500 block">
                            ({item.reserved_quantity} rsvd)
                          </span>
                        )}
                      </td>

                      {/* Unit Price & Valuation */}
                      <td className="py-3.5 pr-3">
                        <span className="font-medium text-stone-200 block">
                          S${item.unit_retail_sgd}
                        </span>
                        <span className="text-[10px] text-emerald-400 block font-mono">
                          Total: S${totalValuation}
                        </span>
                      </td>

                      {/* Actions */}
                      <td className="py-3.5 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          <button
                            onClick={() => handleQuickAdjust(item, -1)}
                            disabled={item.stocked_quantity === 0}
                            className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 disabled:opacity-30 text-stone-300 hover:text-white flex items-center justify-center border border-stone-800 transition-colors"
                            title="Decrement stock by 1 unit"
                          >
                            <Minus className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => handleQuickAdjust(item, 1)}
                            className="w-7 h-7 rounded-lg bg-stone-900 hover:bg-stone-800 text-stone-300 hover:text-white flex items-center justify-center border border-stone-800 transition-colors"
                            title="Increment stock by 1 unit"
                          >
                            <Plus className="w-3 h-3" />
                          </button>

                          <button
                            onClick={() => {
                              setAdjustModalItem(item);
                              setAdjustForm({
                                type: "AUDIT_ADJUSTMENT",
                                delta: 1,
                                mode: "delta",
                                absoluteCount: item.stocked_quantity,
                                locationId: "loc_mbs",
                                notes: "Physical inventory audit reconciliation by Uncle Ariel",
                              });
                            }}
                            className="px-2.5 py-1.5 rounded-lg bg-amber-500/10 hover:bg-amber-500/20 text-amber-400 border border-amber-500/30 text-[10.5px] font-bold uppercase tracking-wider flex items-center gap-1 transition-colors"
                          >
                            <Edit className="w-3 h-3" />
                            <span>Adjust</span>
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* SUBTAB 2: STOCK MOVEMENTS LEDGER */}
      {activeSubTab === "ledger" && (
        <div className="bg-stone-950 border border-stone-800 rounded-2xl p-5 space-y-4">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="font-serif text-lg font-bold text-stone-100">
                Stock Movements & Audit Trail
              </h3>
              <p className="text-xs text-stone-400">
                Immutable chronological log of Florence shipments, boutique reconciliations, and dispatches.
              </p>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full text-left text-xs">
              <thead>
                <tr className="border-b border-stone-800 text-[10px] uppercase tracking-wider text-stone-400">
                  <th className="pb-3 font-semibold">Timestamp</th>
                  <th className="pb-3 font-semibold">Movement Type</th>
                  <th className="pb-3 font-semibold">SKU & Creation</th>
                  <th className="pb-3 font-semibold text-center">Change</th>
                  <th className="pb-3 font-semibold text-center">Previous ➔ New</th>
                  <th className="pb-3 font-semibold">Hub Location</th>
                  <th className="pb-3 font-semibold">Craftsman / Operator</th>
                  <th className="pb-3 font-semibold">Consignment / Audit Notes</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-900">
                {movements.map((m) => {
                  const isPositive = m.quantity_delta > 0;
                  return (
                    <tr key={m.id} className="hover:bg-stone-900/50 transition-colors">
                      <td className="py-3.5 pr-3 font-mono text-[11px] text-stone-400">
                        {new Date(m.created_at).toLocaleString("en-SG", {
                          dateStyle: "medium",
                          timeStyle: "short",
                        })}
                      </td>

                      <td className="py-3.5 pr-3">
                        <span
                          className={`px-2 py-0.5 rounded text-[9.5px] font-bold tracking-wider uppercase font-mono ${
                            m.type === "RECEIPT"
                              ? "bg-emerald-950 text-emerald-300 border border-emerald-800"
                              : m.type === "DISPATCH"
                              ? "bg-blue-950 text-blue-300 border border-blue-800"
                              : m.type === "TRANSFER"
                              ? "bg-purple-950 text-purple-300 border border-purple-800"
                              : m.type === "DAMAGE"
                              ? "bg-rose-950 text-rose-300 border border-rose-800"
                              : "bg-amber-950 text-amber-300 border border-amber-800"
                          }`}
                        >
                          {m.type}
                        </span>
                      </td>

                      <td className="py-3.5 pr-3">
                        <span className="font-mono text-amber-400 text-[10px] block font-bold">
                          {m.sku}
                        </span>
                        <span className="text-stone-200 font-medium">{m.product_title}</span>
                      </td>

                      <td className="py-3.5 px-2 text-center font-mono font-bold">
                        <span className={isPositive ? "text-emerald-400" : "text-rose-400"}>
                          {isPositive ? `+${m.quantity_delta}` : m.quantity_delta}
                        </span>
                      </td>

                      <td className="py-3.5 px-2 text-center font-mono text-[11px] text-stone-300">
                        {m.previous_stock} ➔ <span className="font-bold text-white">{m.new_stock}</span>
                      </td>

                      <td className="py-3.5 pr-3 text-stone-300 text-[11px]">
                        {m.location_name}
                      </td>

                      <td className="py-3.5 pr-3 text-stone-400 text-[11px]">
                        {m.actor}
                      </td>

                      <td className="py-3.5 pr-3 text-stone-300 max-w-xs text-[11px]">
                        {m.notes}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 1: ADJUST STOCK & LOG MOVEMENT                     */}
      {/* ======================================================== */}
      {adjustModalItem && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-stone-950 border border-stone-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setAdjustModalItem(null)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400">
                Medusa Stock Level Adjustment
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-100 mt-1">
                {adjustModalItem.title}
              </h3>
              <p className="text-xs text-stone-400 font-mono mt-0.5">
                SKU: {adjustModalItem.sku} &bull; Currently On Hand: {adjustModalItem.stocked_quantity} units
              </p>
            </div>

            <form onSubmit={handleConfirmAdjust} className="space-y-4">
              {/* Adjustment Mode */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setAdjustForm({ ...adjustForm, mode: "delta" })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                    adjustForm.mode === "delta"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-stone-900 text-stone-400 border-stone-800"
                  }`}
                >
                  Adjust Delta (+ / -)
                </button>
                <button
                  type="button"
                  onClick={() => setAdjustForm({ ...adjustForm, mode: "absolute" })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                    adjustForm.mode === "absolute"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-stone-900 text-stone-400 border-stone-800"
                  }`}
                >
                  Set Exact Count
                </button>
              </div>

              {adjustForm.mode === "delta" ? (
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Quantity Delta (Positive or Negative)
                  </label>
                  <input
                    type="number"
                    value={adjustForm.delta}
                    onChange={(e) =>
                      setAdjustForm({ ...adjustForm, delta: parseInt(e.target.value) || 0 })
                    }
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-400"
                    placeholder="e.g. 5 or -2"
                  />
                  <p className="text-[10px] text-stone-500 mt-1">
                    New total will be:{" "}
                    <span className="font-bold text-amber-400">
                      {Math.max(0, adjustModalItem.stocked_quantity + adjustForm.delta)} units
                    </span>
                  </p>
                </div>
              ) : (
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Exact Physical Stock Count
                  </label>
                  <input
                    type="number"
                    min="0"
                    value={adjustForm.absoluteCount}
                    onChange={(e) =>
                      setAdjustForm({
                        ...adjustForm,
                        absoluteCount: Math.max(0, parseInt(e.target.value) || 0),
                      })
                    }
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-400"
                  />
                </div>
              )}

              {/* Location */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Stock Location
                </label>
                <select
                  value={adjustForm.locationId}
                  onChange={(e) => setAdjustForm({ ...adjustForm, locationId: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Movement Reason */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Movement Reason / Type
                </label>
                <select
                  value={adjustForm.type}
                  onChange={(e) =>
                    setAdjustForm({ ...adjustForm, type: e.target.value as any })
                  }
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="AUDIT_ADJUSTMENT">Boutique Physical Count Audit Reconciliation</option>
                  <option value="RECEIPT">Consignment Restock from Florence Tannery</option>
                  <option value="DAMAGE">Defective Leather Grain / Quality Inspection Blemish</option>
                  <option value="RETURN_RESTOCK">Customer 14-Day Return Inspected & Restocked</option>
                  <option value="DISPATCH">Manual VIP Salon Handover Dispatch</option>
                </select>
              </div>

              {/* Craftsman Notes */}
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Craftsman Audit Notes
                </label>
                <textarea
                  value={adjustForm.notes}
                  onChange={(e) => setAdjustForm({ ...adjustForm, notes: e.target.value })}
                  rows={2}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                  placeholder="Reason for adjustment, consignment reference, shelf audit..."
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setAdjustModalItem(null)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
                >
                  <CheckCircle className="w-3.5 h-3.5" />
                  <span>Update Stock & Log Movement</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 2: RECEIVE CONSIGNMENT FROM FLORENCE               */}
      {/* ======================================================== */}
      {isConsignmentModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-stone-950 border border-stone-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsConsignmentModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1">
                <Truck className="w-3.5 h-3.5" />
                <span>Florentine Workshop Air-Freight Restock</span>
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-100 mt-1">
                Receive Leather Consignment
              </h3>
              <p className="text-xs text-stone-400">
                Log arrival of vegetable-tanned hides and handcrafted creations direct from Florence, Italy.
              </p>
            </div>

            <form onSubmit={handleReceiveConsignment} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Air Waybill / Consignment Reference
                </label>
                <input
                  type="text"
                  required
                  value={consignmentForm.consignmentCode}
                  onChange={(e) =>
                    setConsignmentForm({ ...consignmentForm, consignmentCode: e.target.value })
                  }
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Destination Hub
                </label>
                <select
                  value={consignmentForm.destinationLocationId}
                  onChange={(e) =>
                    setConsignmentForm({
                      ...consignmentForm,
                      destinationLocationId: e.target.value,
                    })
                  }
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                >
                  {locations.map((loc) => (
                    <option key={loc.id} value={loc.id}>
                      {loc.name} ({loc.code})
                    </option>
                  ))}
                </select>
              </div>

              {/* Target Mode */}
              <div className="grid grid-cols-2 gap-2">
                <button
                  type="button"
                  onClick={() => setConsignmentForm({ ...consignmentForm, targetMode: "low_stock" })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                    consignmentForm.targetMode === "low_stock"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-stone-900 text-stone-400 border-stone-800"
                  }`}
                >
                  Restock All Low Stock (&le; 3)
                </button>
                <button
                  type="button"
                  onClick={() => setConsignmentForm({ ...consignmentForm, targetMode: "single" })}
                  className={`py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider border ${
                    consignmentForm.targetMode === "single"
                      ? "bg-amber-500/20 text-amber-400 border-amber-500/40"
                      : "bg-stone-900 text-stone-400 border-stone-800"
                  }`}
                >
                  Restock Single Creation
                </button>
              </div>

              {consignmentForm.targetMode === "single" && (
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Select Creation
                  </label>
                  <select
                    value={consignmentForm.singleItemId}
                    onChange={(e) =>
                      setConsignmentForm({ ...consignmentForm, singleItemId: e.target.value })
                    }
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                  >
                    <option value="">-- Choose creation --</option>
                    {inventoryItems.map((it) => (
                      <option key={it.id} value={it.id}>
                        {it.title} ({it.sku}) - {it.stocked_quantity} on hand
                      </option>
                    ))}
                  </select>
                </div>
              )}

              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Units per Item in this Consignment
                </label>
                <input
                  type="number"
                  min="1"
                  max="50"
                  value={consignmentForm.unitsPerItem}
                  onChange={(e) =>
                    setConsignmentForm({
                      ...consignmentForm,
                      unitsPerItem: parseInt(e.target.value) || 1,
                    })
                  }
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Logistics & Quality Notes
                </label>
                <textarea
                  value={consignmentForm.notes}
                  onChange={(e) =>
                    setConsignmentForm({ ...consignmentForm, notes: e.target.value })
                  }
                  rows={2}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsConsignmentModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  className="px-5 py-2.5 bg-gradient-to-r from-amber-600 to-amber-500 hover:from-amber-500 hover:to-amber-400 text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
                >
                  <Truck className="w-3.5 h-3.5" />
                  <span>Receive & Restock Vault</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      {/* ======================================================== */}
      {/* MODAL 3: INTER-LOCATION STOCK TRANSFER                   */}
      {/* ======================================================== */}
      {isTransferModalOpen && (
        <div className="fixed inset-0 z-50 overflow-y-auto bg-black/80 backdrop-blur-sm flex items-center justify-center p-4">
          <div className="relative w-full max-w-lg bg-stone-950 border border-stone-800 rounded-2xl p-6 shadow-2xl space-y-5 animate-in fade-in zoom-in-95">
            <button
              onClick={() => setIsTransferModalOpen(false)}
              className="absolute top-4 right-4 text-stone-400 hover:text-white p-1 rounded-lg"
            >
              <X className="w-5 h-5" />
            </button>

            <div>
              <span className="text-[10px] font-bold uppercase tracking-widest text-amber-400 flex items-center gap-1">
                <ArrowRightLeft className="w-3.5 h-3.5" />
                <span>Inter-Hub Stock Rebalancing</span>
              </span>
              <h3 className="font-serif text-xl font-bold text-stone-100 mt-1">
                Transfer Stock Between Hubs
              </h3>
              <p className="text-xs text-stone-400">
                Move handcrafted units from Jurong Central Vault to the MBS Flagship showcase or Sentosa Concierge locker.
              </p>
            </div>

            <form onSubmit={handleExecuteTransfer} className="space-y-4">
              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Select Creation to Transfer
                </label>
                <select
                  required
                  value={transferForm.itemId}
                  onChange={(e) => setTransferForm({ ...transferForm, itemId: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                >
                  <option value="">-- Choose creation --</option>
                  {inventoryItems.map((it) => (
                    <option key={it.id} value={it.id}>
                      {it.title} ({it.sku}) - Total: {it.stocked_quantity} units
                    </option>
                  ))}
                </select>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Source Hub (From)
                  </label>
                  <select
                    value={transferForm.fromLocationId}
                    onChange={(e) =>
                      setTransferForm({ ...transferForm, fromLocationId: e.target.value })
                    }
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                    Target Hub (To)
                  </label>
                  <select
                    value={transferForm.toLocationId}
                    onChange={(e) =>
                      setTransferForm({ ...transferForm, toLocationId: e.target.value })
                    }
                    className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                  >
                    {locations.map((loc) => (
                      <option key={loc.id} value={loc.id}>
                        {loc.name}
                      </option>
                    ))}
                  </select>
                </div>
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Units to Transfer
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={transferForm.quantity}
                  onChange={(e) =>
                    setTransferForm({
                      ...transferForm,
                      quantity: Math.max(1, parseInt(e.target.value) || 1),
                    })
                  }
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 font-mono text-sm focus:outline-none focus:border-amber-400"
                />
              </div>

              <div>
                <label className="block text-[11px] font-bold text-stone-300 uppercase tracking-wider mb-1.5">
                  Internal Transfer Notes
                </label>
                <input
                  type="text"
                  value={transferForm.notes}
                  onChange={(e) => setTransferForm({ ...transferForm, notes: e.target.value })}
                  className="w-full bg-stone-900 border border-stone-800 rounded-xl px-3 py-2 text-stone-100 text-xs focus:outline-none focus:border-amber-400"
                  placeholder="e.g. Replenishment for weekend Marina Bay Sands footfall"
                />
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setIsTransferModalOpen(false)}
                  className="px-4 py-2 rounded-xl text-stone-400 hover:text-white text-xs font-semibold"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={!transferForm.itemId || transferForm.fromLocationId === transferForm.toLocationId}
                  className="px-5 py-2.5 bg-amber-500 hover:bg-amber-400 disabled:opacity-40 text-stone-950 rounded-xl text-xs font-bold uppercase tracking-wider transition-all shadow-md flex items-center gap-1.5"
                >
                  <ArrowRightLeft className="w-3.5 h-3.5" />
                  <span>Execute Transfer</span>
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

