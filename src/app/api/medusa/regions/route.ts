import { NextResponse } from "next/server";
import { MEDUSA_REGIONS } from "@/lib/medusa/store";

export const dynamic = "force-dynamic";

export async function GET() {
  return NextResponse.json({
    regions: MEDUSA_REGIONS,
    default_region: "reg_sg",
  });
}
