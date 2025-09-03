"use client";

import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Filter } from "lucide-react";
import ProductsFilterBar from "./ProductsFilterBar";
import { useState } from "react";

export default function ProductsFiltersAside() {
  const [open, setOpen] = useState(false);
  return (
    <>
      {/* Mobile: filter button that opens a side panel */}
      <div className="mb-4 md:hidden">
        <Dialog open={open} onOpenChange={setOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="gap-2">
              <Filter className="h-4 w-4" /> Filters
            </Button>
          </DialogTrigger>
          <DialogContent className="left-0 top-0 right-auto h-dvh w-[85vw] sm:w-[400px] max-w-none translate-x-0 translate-y-0 rounded-none p-0 md:hidden">
            <div className="h-full overflow-y-auto p-4">
              <DialogTitle className="mb-2">Filters</DialogTitle>
              <ProductsFilterBar />
            </div>
          </DialogContent>
        </Dialog>
      </div>

      {/* Desktop: sticky side panel */}
      <aside className="hidden md:block">
        <div className="sticky top-24 h-[calc(100dvh-6rem)] overflow-y-auto pr-2">
          <ProductsFilterBar />
        </div>
      </aside>
    </>
  );
}
