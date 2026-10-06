import { NextRequest, NextResponse } from "next/server";
import { executeHybridSearch } from "@/lib/search-engine";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const query = searchParams.get("q") || "";
    const mode = (searchParams.get("mode") as "auto" | "conventional" | "ai") || "auto";
    const category = searchParams.get("category") || undefined;
    const maxPrice = searchParams.get("max_price") ? Number(searchParams.get("max_price")) : undefined;
    const limit = searchParams.get("limit") ? Number(searchParams.get("limit")) : 12;

    const result = await executeHybridSearch({
      query,
      mode,
      categoryFilter: category,
      maxPriceFilter: maxPrice,
      limit,
    });

    return NextResponse.json(result);
  } catch (error: any) {
    console.error("[Search API Error]", error);
    return NextResponse.json(
      { error: "Search failed", details: error.message },
      { status: 500 }
    );
  }
}
