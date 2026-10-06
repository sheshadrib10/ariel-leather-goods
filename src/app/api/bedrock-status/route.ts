import { NextResponse } from "next/server";
import { checkBedrockStatus } from "@/lib/bedrock-service";
import { testDbConnection } from "@/lib/db";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function GET() {
  try {
    const [bedrock, db] = await Promise.all([
      checkBedrockStatus(),
      testDbConnection(),
    ]);

    return NextResponse.json({
      bedrock,
      database: db,
      pricing: {
        titan_text_v2_rate: "$0.02 per 1,000,000 input tokens",
        sample_catalogue_cost: "5,000 products × 300 tokens = ~1.5M tokens ≈ $0.03 one-time",
        nova_micro_input: "$0.000035 per 1,000 tokens",
        nova_micro_output: "$0.000140 per 1,000 tokens",
        average_query_intent_cost: "~$0.000005 per customer search",
      },
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}
