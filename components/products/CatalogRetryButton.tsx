"use client";

import { useTransition } from "react";
import { useRouter } from "next/navigation";

export default function CatalogRetryButton() {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  return <button type="button" disabled={pending} onClick={() => startTransition(() => router.refresh())} className="mt-6 inline-flex min-h-11 rounded-lg bg-primary px-6 py-3 text-sm font-semibold text-accent-foreground transition-colors hover:bg-primary/85 disabled:opacity-50">{pending ? "Loading market…" : "Try again"}</button>;
}
