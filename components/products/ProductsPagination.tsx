"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type ProductsPaginationProps = {
  page: number;
  limit: number;
  currentCount: number;
  hasPrev?: boolean;
  hasNext?: boolean;
};

export default function ProductsPagination({
  page,
  limit,
  currentCount,
  hasPrev = false,
  hasNext = false,
}: ProductsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const safeLimit = Math.max(1, limit || 1);
  const currentPage = Math.max(1, page);

  const gotoPage = (target: number) => {
    if (target === currentPage || target < 1) return;
    const sp = new URLSearchParams(params.toString());
    if (target <= 1) {
      sp.delete("page");
    } else {
      sp.set("page", String(target));
    }
    const search = sp.toString();
    const url = search ? `${pathname}?${search}` : pathname;
    router.push(url);
  };

  const start = currentCount === 0 ? 0 : (currentPage - 1) * safeLimit + 1;
  const end = currentCount === 0 ? 0 : start + currentCount - 1;

  return (
    <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-muted-foreground">
        {currentCount > 0 ? `Showing products ${start}-${end}` : "No products on this page"}
      </p>

      {(hasPrev || hasNext) && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => gotoPage(currentPage - 1)}
            disabled={!hasPrev}
          >
            Previous
          </Button>

          <span className="px-3 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Page {currentPage}</span>

          <Button
            variant="outline"
            size="sm"
            onClick={() => gotoPage(currentPage + 1)}
            disabled={!hasNext}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
