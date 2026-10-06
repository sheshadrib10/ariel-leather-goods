import { NextRequest, NextResponse } from "next/server";
import { VALID_DISCOUNTS } from "@/lib/medusa/store";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const { code, subtotal } = await req.json();
    if (!code) {
      return NextResponse.json({ error: "Missing promotion code" }, { status: 400 });
    }

    const discount = VALID_DISCOUNTS.find((d) => d.code.toUpperCase() === code.trim().toUpperCase());
    if (!discount) {
      return NextResponse.json({ valid: false, message: "Promotion code is invalid or expired" }, { status: 404 });
    }

    if (subtotal && subtotal < discount.min_subtotal) {
      return NextResponse.json({
        valid: false,
        message: `Minimum order of S$${discount.min_subtotal} required for code ${discount.code}`,
      }, { status: 400 });
    }

    return NextResponse.json({
      valid: true,
      discount,
      message: `Privilege applied: ${discount.description}`,
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
