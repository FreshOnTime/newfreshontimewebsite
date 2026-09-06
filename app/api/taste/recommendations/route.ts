import { NextRequest, NextResponse } from "next/server";
import { optionalAuth, type AuthenticatedRequest } from "@/lib/middleware/auth";
import { getTasteRecommendations } from "@/lib/tasteGraph/recommendations";

export const GET = optionalAuth(async (request: AuthenticatedRequest) => {
  try {
    const rawLimit = Number(request.nextUrl.searchParams.get("limit") || 6);
    const limit = Number.isFinite(rawLimit) ? Math.min(Math.max(Math.trunc(rawLimit), 1), 12) : 6;
    const userId = request.user?._id || request.user?.userId || null;
    const recommendations = await getTasteRecommendations(userId, limit);
    return NextResponse.json(recommendations, {
      headers: { "Cache-Control": "private, no-store" },
    });
  } catch (error) {
    console.error("Taste Graph recommendations error:", error);
    return NextResponse.json({ error: "Failed to build recommendations" }, { status: 500 });
  }
});
