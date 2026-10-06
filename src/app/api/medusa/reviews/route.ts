import { NextRequest, NextResponse } from "next/server";
import { INITIAL_REVIEWS } from "@/lib/reviews-data";
import { ProductReview } from "@/lib/medusa/types";

export const dynamic = "force-dynamic";
export const runtime = "edge";

let reviewsStore: ProductReview[] = [...INITIAL_REVIEWS];

export async function GET(req: NextRequest) {
  const { searchParams } = new URL(req.url);
  const productId = searchParams.get("product_id");
  const slug = searchParams.get("slug");

  if (productId) {
    const filtered = reviewsStore.filter((r) => r.product_id === Number(productId));
    return NextResponse.json({ reviews: filtered, count: filtered.length });
  }

  if (slug) {
    const filtered = reviewsStore.filter((r) => r.product_slug.toLowerCase() === slug.toLowerCase());
    return NextResponse.json({ reviews: filtered, count: filtered.length });
  }

  return NextResponse.json({ reviews: reviewsStore, count: reviewsStore.length });
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const newReview: ProductReview = {
      id: `rev_${Date.now()}`,
      product_id: Number(body.product_id),
      product_slug: body.product_slug || "medici-bifold-wallet-espresso",
      author_name: body.author_name?.trim() || "Verified Patron",
      author_email: body.author_email?.trim() || "",
      author_location: body.author_location?.trim() || "Singapore",
      rating: Math.min(5, Math.max(1, Number(body.rating) || 5)),
      title: body.title?.trim() || "Exceptional Craftsmanship",
      content: body.content?.trim() || "Superb leather quality and immaculate stitching.",
      verified_purchase: true,
      monogram_ordered: body.monogram_ordered || undefined,
      created_at: new Date().toISOString(),
    };

    reviewsStore.unshift(newReview);

    return NextResponse.json({
      success: true,
      review: newReview,
      message: "Thank you for your patronage. Your review has been recorded.",
    });
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }
}
