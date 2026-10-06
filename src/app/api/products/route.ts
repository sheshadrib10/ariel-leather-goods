import { NextRequest, NextResponse } from "next/server";
import { PRODUCTS_CATALOG } from "@/lib/catalog-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const category = searchParams.get("category");
    const id = searchParams.get("id");
    const slug = searchParams.get("slug");

    if (id) {
      const prod = PRODUCTS_CATALOG.find((p) => p.id === Number(id));
      if (!prod) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      return NextResponse.json(prod);
    }

    if (slug) {
      const prod = PRODUCTS_CATALOG.find((p) => p.slug === slug);
      if (!prod) return NextResponse.json({ error: "Product not found" }, { status: 404 });
      return NextResponse.json(prod);
    }

    let list = PRODUCTS_CATALOG;
    if (category) {
      list = list.filter((p) => p.category === category);
    }

    return NextResponse.json({
      products: list,
      total: list.length,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
