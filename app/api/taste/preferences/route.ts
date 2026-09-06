import { NextResponse } from "next/server";
import { withAuth, type AuthenticatedRequest } from "@/lib/middleware/auth";
import { tastePreferencePatchSchema, tastePreferenceSchema } from "@/lib/tasteGraph/contracts";
import { clearTasteGraphForUser, getTastePreferences, saveTastePreferences } from "@/lib/tasteGraph/eventStore";

const SESSION_COOKIE = "fp_taste_session";

function userId(request: AuthenticatedRequest) {
  return request.user?._id || request.user?.userId || "";
}

export const GET = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const id = userId(request);
    const preferences = await getTastePreferences(id);
    return NextResponse.json({ preferences });
  } catch (error) {
    console.error("Get Taste Graph preferences error:", error);
    return NextResponse.json({ error: "Failed to load personalization preferences" }, { status: 500 });
  }
});

export const PATCH = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const id = userId(request);
    const patch = tastePreferencePatchSchema.parse(await request.json());
    const current = await getTastePreferences(id);
    const preferences = tastePreferenceSchema.parse({ ...current, ...patch });
    const saved = await saveTastePreferences({ userId: id, preferences, request });
    return NextResponse.json({ success: true, preferences: saved });
  } catch (error) {
    console.error("Update Taste Graph preferences error:", error);
    return NextResponse.json({ error: "Invalid personalization preferences" }, { status: 400 });
  }
});

export const DELETE = withAuth(async (request: AuthenticatedRequest) => {
  try {
    const id = userId(request);
    const deletedEvents = await clearTasteGraphForUser(id);
    const response = NextResponse.json({ success: true, deletedEvents });
    response.cookies.set(SESSION_COOKIE, "", { httpOnly: true, path: "/", maxAge: 0 });
    return response;
  } catch (error) {
    console.error("Delete Taste Graph data error:", error);
    return NextResponse.json({ error: "Failed to clear personalization data" }, { status: 500 });
  }
});
