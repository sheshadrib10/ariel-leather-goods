import { NextRequest, NextResponse } from "next/server";
import { executeSimilarSearch } from "@/lib/search-engine";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET(req: NextRequest) {
  try {
    const { searchParams } = new URL(req.url);
    const id = Number(searchParams.get("id"));

    if (!id || isNaN(id)) {
      return NextResponse.json({ error: "Missing product id" }, { status: 400 });
    }

    const similar = await executeSimilarSearch(id);
    return NextResponse.json({
      reference_id: id,
      similar_products: similar,
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
