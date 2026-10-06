import { NextRequest, NextResponse } from "next/server";

export const dynamic = "force-dynamic";
export const runtime = "edge";

export async function POST(req: NextRequest) {
  try {
    const { order_id, reason, service_type, email } = await req.json();

    const rmaNumber = `RMA-SG-${Math.floor(10000 + Math.random() * 90000)}`;

    return NextResponse.json({
      success: true,
      rma_number: rmaNumber,
      message: `Your ${service_type === "repair" ? "Lifetime Stitching Repair" : "Return Request"} has been registered. Complimentary pickup in Singapore scheduled.`,
      instructions: "Our white-glove courier will collect your creation in its original dustbag.",
    });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 500 });
  }
}

