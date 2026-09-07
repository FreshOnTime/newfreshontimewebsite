import { NextRequest, NextResponse } from "next/server";
import { requireAdmin } from "@/lib/auth";
import { getOperationsIntelligence } from "@/lib/intelligence/operations";

export const dynamic = "force-dynamic";

export const GET = requireAdmin(async (_request: NextRequest) => {
  try {
    const data = await getOperationsIntelligence();
    return NextResponse.json({ success: true, data }, { headers: { "Cache-Control": "private, no-store" } });
  } catch (error) {
    console.error("[Admin Intelligence] Failed to build operations intelligence:", error);
    return NextResponse.json({ error: "Failed to build operations intelligence" }, { status: 500 });
  }
});
