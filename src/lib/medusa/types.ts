/**
 * Medusa eCommerce Core Types for Ariel Leather Goods
 */

export interface MedusaRegion {
  id: string;
  name: string;
  currency_code: string;
  currency_symbol: string;
  tax_rate: number; // percentage
  tax_code: string;
  countries: string[];
  payment_providers: string[];
  shipping_options: MedusaShippingOption[];
}

export interface MedusaShippingOption {
  id: string;
  name: string;
  price: number;
  currency_code: string;
  estimated_delivery: string;
  is_default?: boolean;
}

export interface MedusaDiscount {
  code: string;
  type: "percentage" | "fixed_amount";
  value: number; // 10 = 10% or 25 = $25
  min_subtotal: number;
  description: string;
}

export interface MedusaLineItem {
  id: string;
  product_id?: number;
  title: string;
  variant_title?: string;
  thumbnail?: string;
  unit_price: number;
  quantity: number;
  total: number;
  monogram?: {
    text: string;
    foil: string;
  };
  metadata?: {
    monogram_text?: string;
    monogram_foil?: string;
    gift_packaging?: boolean;
  };
}

export interface MedusaAddress {
  first_name: string;
  last_name: string;
  phone: string;
  address_1: string;
  address_2?: string;
  postal_code: string;
  city: string;
  province?: string;
  country_code: string;
}

export interface MedusaCart {
  id: string;
  region_id: string;
  currency_code: string;
  items: MedusaLineItem[];
  shipping_address?: MedusaAddress;
  shipping_method?: MedusaShippingOption;
  discount?: MedusaDiscount;
  subtotal: number;
  discount_total: number;
  shipping_total: number;
  tax_total: number;
  total: number;
  payment_session?: {
    provider_id: "paynow" | "stripe" | "applepay" | "grabpay";
    status: "pending" | "authorized";
    qr_code?: string;
  };
}

export interface MedusaOrder {
  id: string;
  display_id: number;
  cart_id: string;
  customer_email: string;
  shipping_address: MedusaAddress;
  items: MedusaLineItem[];
  subtotal: number;
  shipping_total: number;
  discount_total: number;
  tax_total: number;
  total: number;
  currency_code: string;
  status: "pending" | "processing" | "shipped" | "delivered";
  fulfillment_status: "not_fulfilled" | "fulfilled" | "shipped";
  payment_status: "awaiting" | "captured";
  tracking_number?: string;
  easyparcel_awb?: string;
  easyparcel_courier?: string; // "Lalamove" | "Ninja Van" | "J&T Express" | "SingPost"
  hitpay_reference?: string;
  hitpay_payment_id?: string;
  payment_provider?: "hitpay_paynow" | "hitpay_card" | "hitpay_applepay" | "hitpay_grabpay";
  refund_status?: "none" | "partial" | "refunded";
  refund_amount?: number;
  refunds?: MedusaRefund[];
  created_at: string;
}

export interface MedusaRefund {
  id: string;
  order_id: string;
  amount: number;
  currency_code: string;
  reason: string;
  hitpay_refund_reference: string;
  status: "completed" | "processing";
  restocked: boolean;
  created_at: string;
}

export interface CustomerSearchLog {
  id: string;
  query: string;
  mode: "auto" | "conventional" | "ai" | "visual";
  results_count: number;
  timestamp: string;
}

export interface CustomerPdpaRecord {
  consent_given: boolean;
  consent_timestamp: string;
  purpose: string[]; // ["order_fulfillment", "marketing", "personalization"]
  marketing_email_opt_in: boolean;
  marketing_phone_opt_in: boolean; // Singapore DNC compliance
  dsar_export_count: number;
  last_dsar_export?: string;
  erasure_status: "active" | "requested" | "anonymized";
  erasure_timestamp?: string;
}

export interface MedusaReturn {
  id: string;
  order_id: string;
  display_id: number;
  reason: string;
  status: "requested" | "pickup_scheduled" | "received" | "inspected" | "refunded";
  return_method: "easyparcel_pickup" | "mbs_salon_dropoff";
  items: {
    title: string;
    quantity: number;
  }[];
  tracking_number?: string;
  refund_amount: number;
  notes?: string;
  created_at: string;
}

export interface MedusaCustomer {
  id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  has_password?: boolean;
  password_hash?: string;
  reset_token?: string;
  reset_token_expiry?: string;
  provider: "email" | "google" | "facebook";
  avatar_url?: string;
  shipping_addresses: MedusaAddress[];
  billing_address?: MedusaAddress;
  monogram_initials: string;
  monogram_foil: "gold" | "blind" | "silver";
  orders_count: number;
  lifetime_spend_sgd: number;
  notes?: string;
  tags: string[]; // ["VIP", "Frequent Collector", "Bespoke"]
  pdpa: CustomerPdpaRecord;
  search_history: CustomerSearchLog[];
  refunds: MedusaRefund[];
  created_at: string;
  updated_at: string;
}

export interface ProductReview {
  id: string;
  product_id: number;
  product_slug: string;
  author_name: string;
  author_email?: string;
  author_location: string;
  rating: number; // 1 to 5
  title: string;
  content: string;
  verified_purchase: boolean;
  monogram_ordered?: string;
  created_at: string;
  merchant_reply?: {
    author: string;
    content: string;
    created_at: string;
  };
}

export interface MedusaStockLocation {
  id: string;
  name: string;
  code: string;
  address: string;
  type: "boutique" | "central_vault" | "concierge_hub";
}

export interface MedusaInventoryItem {
  id: string;
  product_id: number;
  sku: string;
  title: string;
  category: string;
  leather_type: string;
  colour: string;
  stocked_quantity: number;
  reserved_quantity: number;
  available_quantity: number;
  low_stock_threshold: number;
  unit_cost_sgd: number;
  unit_retail_sgd: number;
  location_levels: Array<{
    location_id: string;
    location_name: string;
    stocked_quantity: number;
    reserved_quantity: number;
  }>;
}

export interface MedusaStockMovement {
  id: string;
  inventory_item_id: string;
  sku: string;
  product_title: string;
  type: "RECEIPT" | "DISPATCH" | "RETURN_RESTOCK" | "DAMAGE" | "TRANSFER" | "AUDIT_ADJUSTMENT";
  quantity_delta: number;
  previous_stock: number;
  new_stock: number;
  location_id: string;
  location_name: string;
  actor: string;
  notes: string;
  created_at: string;
}

