'use client';

import { useEffect, useRef, useState } from "react";
import { usePathname, useRouter } from "next/navigation";
import { ShoppingBag, Loader2, Sparkles } from "lucide-react";
import { toast } from "sonner";
import { apiFetch } from "@/lib/api/client";
import { useAuth } from "@/contexts/AuthContext";
import { useBag } from "@/contexts/BagContext";

interface RecipeAddToBagProps {
  slug: string;
  availableIngredientCount: number;
}

export default function RecipeAddToBag({ slug, availableIngredientCount }: RecipeAddToBagProps) {
  const [isAdding, setIsAdding] = useState(false);
  const viewRecorded = useRef(false);
  const { user } = useAuth();
  const { currentBag, fetchBags } = useBag();
  const router = useRouter();
  const pathname = usePathname();

  useEffect(() => {
    if (viewRecorded.current) return;
    viewRecorded.current = true;
    void fetch("/api/taste/events", {
      method: "POST",
      credentials: "include",
      keepalive: true,
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        eventType: "recipe_viewed",
        entityType: "recipe",
        entityId: slug,
        surface: "recipe_detail",
      }),
    }).catch(() => undefined);
  }, [slug]);

  const addRecipe = async () => {
    if (!user) {
      router.push(`/auth/login?redirect=${encodeURIComponent(pathname || `/recipes/${slug}`)}`);
      return;
    }

    setIsAdding(true);
    try {
      const response = await apiFetch(`/api/recipes/${encodeURIComponent(slug)}/add-to-bag`, {
        method: "POST",
        body: JSON.stringify({ bagId: currentBag?.id }),
      });
      const data = await response.json();
      if (!response.ok || !data.success) {
        throw new Error(data.error || "Could not add this recipe to your basket");
      }

      await fetchBags();
      const added = Array.isArray(data.added) ? data.added : [];
      const skipped = Array.isArray(data.skipped) ? data.skipped : [];
      const substitutions = added.filter((item: { substituted?: boolean }) => item.substituted).length;

      if (added.length > 0) {
        toast.success(
          `${added.length} ingredient${added.length === 1 ? "" : "s"} added to your FreshPick basket${substitutions ? ` · ${substitutions} smart substitute${substitutions === 1 ? "" : "s"}` : ""}.`
        );
      }
      if (skipped.length > 0) {
        toast.warning(
          `${skipped.length} ingredient${skipped.length === 1 ? " was" : "s were"} unavailable and skipped.`
        );
      }
      if (added.length === 0 && skipped.length === 0) {
        toast.info("There are no purchasable ingredients in this recipe yet.");
      }
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Could not add this recipe to your basket");
    } finally {
      setIsAdding(false);
    }
  };

  return (
    <button
      type="button"
      onClick={addRecipe}
      disabled={isAdding || availableIngredientCount === 0}
      className="group inline-flex min-h-14 w-full items-center justify-center gap-3 rounded-full bg-emerald-950 px-7 text-[11px] font-bold uppercase tracking-[0.16em] text-white transition-all hover:-translate-y-0.5 hover:bg-emerald-900 disabled:cursor-not-allowed disabled:opacity-50 sm:w-auto"
    >
      {isAdding ? <Loader2 className="h-4 w-4 animate-spin" /> : <ShoppingBag className="h-4 w-4" />}
      {isAdding ? "Building your basket" : "Add the whole meal"}
      {!isAdding && <Sparkles className="h-3.5 w-3.5 text-emerald-200 transition-transform group-hover:rotate-12" />}
    </button>
  );
}
