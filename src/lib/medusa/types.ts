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
  product_id: number;
  title: string;
  variant_title: string;
  thumbnail: string;
  unit_price: number;
  quantity: number;
  total: number;
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
  created_at: string;
}
