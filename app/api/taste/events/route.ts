import { NextResponse } from "next/server";
import { optionalAuth, type AuthenticatedRequest } from "@/lib/middleware/auth";
import { tasteEventSchema } from "@/lib/tasteGraph/contracts";
import { recordTasteEvent } from "@/lib/tasteGraph/eventStore";

const SESSION_COOKIE = "fp_taste_session";
const SESSION_MAX_AGE = 60 * 60 * 24 * 30;
const blockedMetadataKeys = new Set([
  "email",
  "phone",
  "phoneNumber",
  "address",
  "streetAddress",
  "password",
  "token",
  "medical",
  "health",
]);

function hasBlockedMetadata(metadata: Record<string, unknown>) {
  return Object.keys(metadata).some((key) => blockedMetadataKeys.has(key));
}

export const POST = optionalAuth(async (request: AuthenticatedRequest) => {
  try {
    const event = tasteEventSchema.parse(await request.json());
    if (hasBlockedMetadata(event.metadata)) {
      return NextResponse.json({ error: "Sensitive personal data is not accepted in Taste Graph event metadata" }, { status: 400 });
    }

    const existingSessionId = request.cookies.get(SESSION_COOKIE)?.value;
    const sessionId = existingSessionId || crypto.randomUUID();
    await recordTasteEvent({
      userId: request.user?._id || request.user?.userId || null,
      sessionId,
      event,
      request,
    });

    const response = NextResponse.json({ success: true });
    if (!existingSessionId) {
      response.cookies.set(SESSION_COOKIE, sessionId, {
        httpOnly: true,
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
        path: "/",
        maxAge: SESSION_MAX_AGE,
      });
    }
    return response;
  } catch (error) {
    console.error("Taste Graph event ingestion error:", error);
    return NextResponse.json({ error: "Invalid Taste Graph event" }, { status: 400 });
  }
});
