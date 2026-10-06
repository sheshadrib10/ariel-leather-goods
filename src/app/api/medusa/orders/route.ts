import { NextRequest, NextResponse } from "next/server";
import { INITIAL_ORDERS } from "@/lib/medusa/store";
import { MedusaOrder } from "@/lib/medusa/types";

export const dynamic = "force-dynamic";
export const runtime = "edge";

// In-memory orders store
let ordersDb: MedusaOrder[] = [...INITIAL_ORDERS];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const orderId = searchParams.get("id");
  const email = searchParams.get("email");

  if (orderId) {
    const order = ordersDb.find(
      (o) => o.id.toLowerCase() === orderId.toLowerCase() || String(o.display_id) === orderId
    );
    if (!order) return NextResponse.json({ error: "Order not found" }, { status: 404 });
    return NextResponse.json({ order });
  }

  if (email) {
    const list = ordersDb.filter((o) => o.customer_email.toLowerCase() === email.toLowerCase());
    return NextResponse.json({ orders: list });
  }

  return NextResponse.json({ orders: ordersDb });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newDisplayId = 1000 + ordersDb.length + 1;
    const newOrder: MedusaOrder = {
      id: `order_${Date.now()}`,
      display_id: newDisplayId,
      cart_id: body.cart_id || `cart_${Date.now()}`,
      customer_email: body.email || "client@arielleather.com",
      shipping_address: body.shipping_address,
      items: body.items || [],
      subtotal: body.subtotal || 0,
      shipping_total: body.shipping_total || 0,
      discount_total: body.discount_total || 0,
      tax_total: body.tax_total || 0,
      total: body.total || 0,
      currency_code: body.currency_code || "SGD",
      status: "processing",
      fulfillment_status: "fulfilled",
      payment_status: "captured",
      tracking_number: `SG-EXP-${Math.floor(100000 + Math.random() * 900000)}`,
      created_at: new Date().toISOString(),
    };

    ordersDb.unshift(newOrder);

    return NextResponse.json({
      order: newOrder,
      message: "Order placed successfully through Medusa checkout engine.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
