import { MedusaRegion, MedusaDiscount, MedusaCart, MedusaOrder } from "./types";

export const MEDUSA_REGIONS: MedusaRegion[] = [
  {
    id: "reg_sg",
    name: "Singapore (Domestic)",
    currency_code: "SGD",
    currency_symbol: "S$",
    tax_rate: 0.09, // 9% Singapore GST
    tax_code: "SG_GST",
    countries: ["SG"],
    payment_providers: ["paynow", "stripe", "grabpay", "applepay"],
    shipping_options: [
      {
        id: "so_sg_same_day",
        name: "Singapore White-Glove Courier (Same-Day Delivery)",
        price: 0, // Free if subtotal >= 150
        currency_code: "SGD",
        estimated_delivery: "Today by 7:00 PM (Orders before 2 PM)",
        is_default: true,
      },
      {
        id: "so_sg_mbs_pickup",
        name: "Boutique Collection at Marina Bay Sands Salon",
        price: 0,
        currency_code: "SGD",
        estimated_delivery: "Ready within 2 hours at MBS #01-42",
      },
      {
        id: "so_sg_standard",
        name: "SingPost Registered Tracked Parcel",
        price: 8,
        currency_code: "SGD",
        estimated_delivery: "1-2 Business Days",
      },
    ],
  },
  {
    id: "reg_us",
    name: "United States & Canada",
    currency_code: "USD",
    currency_symbol: "$",
    tax_rate: 0.0,
    tax_code: "US_SALES_TAX",
    countries: ["US", "CA"],
    payment_providers: ["stripe", "applepay", "paypal"],
    shipping_options: [
      {
        id: "so_us_dhl",
        name: "DHL Express International Priority",
        price: 25,
        currency_code: "USD",
        estimated_delivery: "2-3 Business Days",
        is_default: true,
      },
    ],
  },
  {
    id: "reg_eu",
    name: "European Union & United Kingdom",
    currency_code: "EUR",
    currency_symbol: "€",
    tax_rate: 0.20,
    tax_code: "EU_VAT",
    countries: ["IT", "FR", "DE", "GB", "ES", "CH"],
    payment_providers: ["stripe", "klarna", "applepay"],
    shipping_options: [
      {
        id: "so_eu_dhl",
        name: "DHL Express Direct to Europe",
        price: 22,
        currency_code: "EUR",
        estimated_delivery: "2-4 Business Days",
        is_default: true,
      },
    ],
  },
];

export const VALID_DISCOUNTS: MedusaDiscount[] = [
  {
    code: "ARIEL10",
    type: "percentage",
    value: 10,
    min_subtotal: 50,
    description: "10% privilege on all handcrafted creations",
  },
  {
    code: "SINGAPORE25",
    type: "fixed_amount",
    value: 25,
    min_subtotal: 150,
    description: "S$25 voucher for domestic Singapore orders above S$150",
  },
  {
    code: "VIPFIRST",
    type: "fixed_amount",
    value: 20,
    min_subtotal: 100,
    description: "S$20 welcome voucher for first-time collectors",
  },
];

// Initial mock orders in Medusa Order Repository
export const INITIAL_ORDERS: MedusaOrder[] = [
  {
    id: "order_01HX892019",
    display_id: 1042,
    cart_id: "cart_01HX892000",
    customer_email: "somnath@arielleather.com",
    shipping_address: {
      first_name: "Somnath",
      last_name: "B.",
      phone: "+65 9123 4567",
      address_1: "24 Orchard Boulevard, #18-02",
      postal_code: "248648",
      city: "Singapore",
      country_code: "SG",
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
        metadata: {
          monogram_text: "SB",
          monogram_foil: "gold",
          gift_packaging: true,
        },
      },
    ],
    subtotal: 129,
    shipping_total: 0,
    discount_total: 12.9,
    tax_total: 10.45,
    total: 116.1,
    currency_code: "SGD",
    status: "delivered",
    fulfillment_status: "shipped",
    payment_status: "captured",
    tracking_number: "SG-EXP-94021482",
    created_at: "2026-10-04T10:14:00Z",
  },
];

/**
 * Recalculates Medusa Cart totals adhering to region taxes, discounts, and shipping rules
 */
export function recalculateCart(
  cart: MedusaCart,
  region: MedusaRegion,
  discountCode?: string,
  shippingOptionId?: string
): MedusaCart {
  const subtotal = cart.items.reduce((acc, it) => acc + it.unit_price * it.quantity, 0);

  // Discount
  let discount: MedusaDiscount | undefined = cart.discount;
  if (discountCode !== undefined) {
    discount = VALID_DISCOUNTS.find((d) => d.code.toUpperCase() === discountCode.toUpperCase());
  }

  let discount_total = 0;
  if (discount && subtotal >= discount.min_subtotal) {
    if (discount.type === "percentage") {
      discount_total = Number(((subtotal * discount.value) / 100).toFixed(2));
    } else {
      discount_total = Math.min(subtotal, discount.value);
    }
  }

  // Shipping
  const selectedShipping =
    region.shipping_options.find((s) => s.id === shippingOptionId) ||
    cart.shipping_method ||
    region.shipping_options[0];

  let shipping_total = selectedShipping.price;
  // Free shipping promo over S$150 for domestic Singapore
  if (region.id === "reg_sg" && subtotal >= 150 && selectedShipping.id === "so_sg_same_day") {
    shipping_total = 0;
  }

  // Tax (Included or Calculated)
  const taxableAmount = Math.max(0, subtotal - discount_total);
  const tax_total = Number((taxableAmount * region.tax_rate).toFixed(2));

  const total = Number((taxableAmount + shipping_total).toFixed(2));

  return {
    ...cart,
    region_id: region.id,
    currency_code: region.currency_code,
    shipping_method: selectedShipping,
    discount,
    subtotal,
    discount_total,
    shipping_total,
    tax_total,
    total,
  };
}
