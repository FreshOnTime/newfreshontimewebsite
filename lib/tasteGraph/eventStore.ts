import "server-only";

import { Prisma } from "@prisma/client";
import type { NextRequest } from "next/server";
import prisma from "@/lib/prisma";
import {
  TASTE_EVENT_SCHEMA_VERSION,
  tasteEventSchema,
  tastePreferenceSchema,
  type TasteEventInput,
  type TastePreferenceSnapshot,
} from "@/lib/tasteGraph/contracts";

const FOOD_INTENT_RESOURCE = "food_intent";
const FOOD_PREFERENCES_RESOURCE = "food_preferences";

function requestMeta(request?: NextRequest) {
  return {
    ip: request?.headers.get("x-forwarded-for") || request?.headers.get("x-real-ip") || "unknown",
    userAgent: request?.headers.get("user-agent") || "unknown",
  };
}

export async function recordTasteEvent(input: {
  userId?: string | null;
  sessionId: string;
  event: TasteEventInput;
  request?: NextRequest;
}) {
  const event = tasteEventSchema.parse(input.event);
  const envelope = {
    schemaVersion: TASTE_EVENT_SCHEMA_VERSION,
    sessionId: input.sessionId,
    entityType: event.entityType || null,
    entityId: event.entityId || null,
    surface: event.surface || null,
    query: event.query || null,
    metadata: event.metadata,
  };
  const meta = requestMeta(input.request);

  return prisma.auditLog.create({
    data: {
      userId: input.userId || null,
      action: event.eventType,
      resourceType: FOOD_INTENT_RESOURCE,
      resourceId: event.entityId || null,
      after: envelope as Prisma.InputJsonValue,
      ip: meta.ip,
      userAgent: meta.userAgent,
    },
    select: { id: true, timestamp: true },
  });
}

export async function saveTastePreferences(input: {
  userId: string;
  preferences: TastePreferenceSnapshot;
  request?: NextRequest;
}) {
  const preferences = tastePreferenceSchema.parse(input.preferences);
  const meta = requestMeta(input.request);

  await prisma.auditLog.create({
    data: {
      userId: input.userId,
      action: "preferences_updated",
      resourceType: FOOD_PREFERENCES_RESOURCE,
      resourceId: input.userId,
      after: { schemaVersion: 1, ...preferences } as Prisma.InputJsonValue,
      ip: meta.ip,
      userAgent: meta.userAgent,
    },
  });
  return preferences;
}

function normalizePreferenceSnapshot(value: Prisma.JsonValue | null): TastePreferenceSnapshot | null {
  if (!value || typeof value !== "object" || Array.isArray(value)) return null;
  const candidate = { ...(value as Record<string, unknown>) };
  delete candidate.schemaVersion;
  const parsed = tastePreferenceSchema.safeParse(candidate);
  return parsed.success ? parsed.data : null;
}

export async function getTastePreferences(userId: string): Promise<TastePreferenceSnapshot> {
  const latest = await prisma.auditLog.findFirst({
    where: { userId, resourceType: FOOD_PREFERENCES_RESOURCE },
    select: { after: true },
    orderBy: { timestamp: "desc" },
  });
  return normalizePreferenceSnapshot(latest?.after || null) || tastePreferenceSchema.parse({});
}

export async function clearTasteGraphForUser(userId: string) {
  const result = await prisma.auditLog.deleteMany({
    where: {
      userId,
      resourceType: { in: [FOOD_INTENT_RESOURCE, FOOD_PREFERENCES_RESOURCE] },
    },
  });
  return result.count;
}

export type StoredTasteEvent = {
  eventType: string;
  entityType?: string;
  entityId?: string;
  surface?: string;
  query?: string;
  metadata: Record<string, string | number | boolean | null>;
  timestamp: Date;
};

export async function getRecentTasteEvents(userId: string, days = 90, limit = 500): Promise<StoredTasteEvent[]> {
  const since = new Date(Date.now() - Math.max(days, 1) * 24 * 60 * 60 * 1000);
  const rows = await prisma.auditLog.findMany({
    where: { userId, resourceType: FOOD_INTENT_RESOURCE, timestamp: { gte: since } },
    select: { action: true, after: true, timestamp: true },
    orderBy: { timestamp: "desc" },
    take: Math.min(Math.max(limit, 1), 1000),
  });

  return rows.flatMap((row) => {
    if (!row.after || typeof row.after !== "object" || Array.isArray(row.after)) return [];
    const value = row.after as Record<string, unknown>;
    const metadata = value.metadata && typeof value.metadata === "object" && !Array.isArray(value.metadata)
      ? value.metadata as Record<string, string | number | boolean | null>
      : {};
    return [{
      eventType: row.action,
      entityType: typeof value.entityType === "string" ? value.entityType : undefined,
      entityId: typeof value.entityId === "string" ? value.entityId : undefined,
      surface: typeof value.surface === "string" ? value.surface : undefined,
      query: typeof value.query === "string" ? value.query : undefined,
      metadata,
      timestamp: row.timestamp,
    }];
  });
}
