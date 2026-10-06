import { Product } from "@/lib/catalog-data";
import { MedusaInventoryItem, MedusaStockLocation, MedusaStockMovement } from "./types";

export const DEFAULT_STOCK_LOCATIONS: MedusaStockLocation[] = [
  {
    id: "loc_mbs",
    name: "Marina Bay Sands Flagship Salon (#01-42)",
    code: "MBS-SALON",
    address: "10 Bayfront Ave, The Shoppes at Marina Bay Sands #01-42, Singapore 018956",
    type: "boutique",
  },
  {
    id: "loc_jurong",
    name: "Jurong Logistics Atelier Hub",
    code: "JURONG-HUB",
    address: "21 Jurong Port Rd, Climate-Controlled Leather Vault, Singapore 619098",
    type: "central_vault",
  },
  {
    id: "loc_sentosa",
    name: "Sentosa Cove VIP Concierge Locker",
    code: "SENTOSA-VIP",
    address: "1 Cove Way, Sentosa Cove Marina Clubhouse, Singapore 098307",
    type: "concierge_hub",
  },
];

export function generateInitialInventory(products: Product[]): MedusaInventoryItem[] {
  return products.map((prod) => {
    const total = prod.inventory_count || 12;
    const reserved = Math.min(2, Math.floor(total * 0.1));
    const mbsCount = Math.max(1, Math.floor(total * 0.35));
    const sentosaCount = Math.max(0, Math.floor(total * 0.1));
    const jurongCount = Math.max(0, total - mbsCount - sentosaCount);

    const costSgd = Math.round(prod.price_sgd * 0.36);
    const skuCode = `ARIEL-${prod.category.toUpperCase().slice(0, 3)}-${String(prod.id).padStart(3, "0")}`;

    return {
      id: `inv_item_${prod.id}`,
      product_id: prod.id,
      sku: skuCode,
      title: prod.title,
      category: prod.category,
      leather_type: prod.leather_type || "Italian Full-Grain Leather",
      colour: prod.colour || "Espresso Brown",
      stocked_quantity: total,
      reserved_quantity: reserved,
      available_quantity: Math.max(0, total - reserved),
      low_stock_threshold: 3,
      unit_cost_sgd: costSgd,
      unit_retail_sgd: prod.price_sgd,
      location_levels: [
        {
          location_id: "loc_mbs",
          location_name: "Marina Bay Sands Flagship Salon",
          stocked_quantity: mbsCount,
          reserved_quantity: 1,
        },
        {
          location_id: "loc_jurong",
          location_name: "Jurong Logistics Atelier Hub",
          stocked_quantity: jurongCount,
          reserved_quantity: reserved > 1 ? reserved - 1 : 0,
        },
        {
          location_id: "loc_sentosa",
          location_name: "Sentosa Cove VIP Concierge Locker",
          stocked_quantity: sentosaCount,
          reserved_quantity: 0,
        },
      ],
    };
  });
}

export const INITIAL_STOCK_MOVEMENTS: MedusaStockMovement[] = [
  {
    id: "sm_001",
    inventory_item_id: "inv_item_1",
    sku: "ARIEL-WAL-001",
    product_title: "The Medici Bifold Wallet",
    type: "RECEIPT",
    quantity_delta: 20,
    previous_stock: 18,
    new_stock: 38,
    location_id: "loc_jurong",
    location_name: "Jurong Logistics Atelier Hub",
    actor: "Uncle Ariel (Master Craftsman)",
    notes: "Consignment received from Florence Tannery via SQ355 Malpensa (Air Waybill: AWB-FLR-91823)",
    created_at: "2026-10-06T14:30:00Z",
  },
  {
    id: "sm_002",
    inventory_item_id: "inv_item_1",
    sku: "ARIEL-WAL-001",
    product_title: "The Medici Bifold Wallet",
    type: "TRANSFER",
    quantity_delta: 5,
    previous_stock: 5,
    new_stock: 10,
    location_id: "loc_mbs",
    location_name: "Marina Bay Sands Flagship Salon",
    actor: "Uncle Ariel (Master Craftsman)",
    notes: "Restocked MBS Flagship display showcases from Jurong Central Vault",
    created_at: "2026-10-06T16:15:00Z",
  },
  {
    id: "sm_003",
    inventory_item_id: "inv_item_4",
    sku: "ARIEL-BAG-004",
    product_title: "The Sarto Executive Briefcase",
    type: "DISPATCH",
    quantity_delta: -1,
    previous_stock: 6,
    new_stock: 5,
    location_id: "loc_jurong",
    location_name: "Jurong Logistics Atelier Hub",
    actor: "EasyParcel White-Glove Courier",
    notes: "Dispatched order #1002 to patron Alexander Tan (MBS-VIP hot-stamping verified)",
    created_at: "2026-10-06T17:45:00Z",
  },
  {
    id: "sm_004",
    inventory_item_id: "inv_item_2",
    sku: "ARIEL-ACC-002",
    product_title: "The Heritage Travel Folio",
    type: "AUDIT_ADJUSTMENT",
    quantity_delta: 2,
    previous_stock: 8,
    new_stock: 10,
    location_id: "loc_mbs",
    location_name: "Marina Bay Sands Flagship Salon",
    actor: "Uncle Ariel (Master Craftsman)",
    notes: "Quarterly stocktaking audit reconciliation at MBS Boutique showcase",
    created_at: "2026-10-06T18:20:00Z",
  },
];

