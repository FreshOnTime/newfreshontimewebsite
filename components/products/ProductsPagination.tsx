"use client";

import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";
import { ArrowLeft, ArrowRight } from "lucide-react";

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
    <nav aria-label="Product pagination" className="flex flex-col items-center gap-4 sm:flex-row sm:justify-between">
      <p className="text-sm text-muted-foreground">
        {currentCount > 0 ? `Showing products ${start}-${end}` : "No products on this page"}
      </p>

      {(hasPrev || hasNext) && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            className="h-11 border text-sm font-medium normal-case tracking-normal hover:border-brand-green hover:bg-secondary hover:text-brand-green"
            onClick={() => gotoPage(currentPage - 1)}
            disabled={!hasPrev}
          >
            <ArrowLeft strokeWidth={1.75} aria-hidden="true" className="mr-1 h-4 w-4" /> Previous
          </Button>

          <span aria-current="page" className="px-2 text-sm text-muted-foreground">Page {currentPage}</span>

          <Button
            variant="outline"
            size="sm"
            className="h-11 border text-sm font-medium normal-case tracking-normal hover:border-brand-green hover:bg-secondary hover:text-brand-green"
            onClick={() => gotoPage(currentPage + 1)}
            disabled={!hasNext}
          >
            Next <ArrowRight strokeWidth={1.75} aria-hidden="true" className="ml-1 h-4 w-4" />
          </Button>
        </div>
      )}
    </nav>
  );
}
