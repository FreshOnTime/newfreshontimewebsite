"use client";

import { useMemo } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { Button } from "@/components/ui/button";

type ProductsPaginationProps = {
  page: number;
  limit: number;
  total: number;
  currentCount: number;
  totalPages?: number;
  hasPrev?: boolean;
  hasNext?: boolean;
};

const clampPage = (value: number, min: number, max: number) => {
  if (Number.isNaN(value)) return min;
  return Math.max(min, Math.min(max, value));
};

const createPageRange = (current: number, total: number) => {
  if (total <= 1) return [1];
  const delta = 2;
  const pages: Array<number | "ellipsis"> = [];
  const start = Math.max(1, current - delta);
  const end = Math.min(total, current + delta);

  if (start > 1) {
    pages.push(1);
    if (start > 2) pages.push("ellipsis");
  }

  for (let page = start; page <= end; page += 1) {
    pages.push(page);
  }

  if (end < total) {
    if (end < total - 1) pages.push("ellipsis");
    pages.push(total);
  }

  return pages;
};

export default function ProductsPagination({
  page,
  limit,
  total,
  currentCount,
  totalPages: totalPagesProp,
  hasPrev,
  hasNext,
}: ProductsPaginationProps) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();

  const safeLimit = Math.max(1, limit || 1);
  const computedTotalPages = total > 0 ? Math.max(1, Math.ceil(total / safeLimit)) : 1;
  const totalPages = totalPagesProp && totalPagesProp > 0 ? totalPagesProp : computedTotalPages;
  const currentPage = total > 0 ? clampPage(page, 1, totalPages) : 1;

  const gotoPage = (target: number) => {
    if (target === currentPage || target < 1 || target > totalPages) return;
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

  const { start, end } = useMemo(() => {
    if (total === 0) {
      return { start: 0, end: 0 };
    }
    const first = (currentPage - 1) * safeLimit + 1;
    return {
      start: first,
      end: Math.min(total, first + currentCount - 1),
    };
  }, [currentPage, currentCount, safeLimit, total]);

  if (total === 0) {
    return null;
  }

  const pages = createPageRange(currentPage, totalPages);
  const showControls = totalPages > 1;
  const prevDisabled = typeof hasPrev === "boolean" ? !hasPrev : currentPage <= 1;
  const nextDisabled = typeof hasNext === "boolean" ? !hasNext : currentPage >= totalPages;

  return (
    <div className="mt-8 flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
      <p className="text-sm text-muted-foreground">
        Showing {start}-{end} of {total} products
      </p>

      {showControls && (
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => gotoPage(currentPage - 1)}
            disabled={prevDisabled}
          >
            Previous
          </Button>

          {pages.map((entry, index) => {
            if (entry === "ellipsis") {
              return (
                <span key={`ellipsis-${index}`} className="px-2 text-sm text-muted-foreground">
                  …
                </span>
              );
            }
            const isActive = entry === currentPage;
            return (
              <Button
                key={entry}
                variant={isActive ? "default" : "outline"}
                size="sm"
                onClick={() => gotoPage(entry)}
                aria-current={isActive ? "page" : undefined}
              >
                {entry}
              </Button>
            );
          })}

          <Button
            variant="outline"
            size="sm"
            onClick={() => gotoPage(currentPage + 1)}
            disabled={nextDisabled}
          >
            Next
          </Button>
        </div>
      )}
    </div>
  );
}
