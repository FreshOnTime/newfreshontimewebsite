'use client';

import { useEffect, useRef } from "react";
import type { TasteEventType } from "@/lib/tasteGraph/contracts";

type Scalar = string | number | boolean | null;

interface TasteEventBeaconProps {
  eventType: TasteEventType;
  entityType?: "recipe" | "collection" | "product" | "maker" | "search" | "subscription" | "discovery_theme";
  entityId?: string;
  surface?: string;
  query?: string;
  metadata?: Record<string, Scalar>;
}

export default function TasteEventBeacon(props: TasteEventBeaconProps) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    void fetch("/api/taste/events", {
      method: "POST",
      credentials: "include",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(props),
    }).catch(() => undefined);
  }, [props]);

  return null;
}
