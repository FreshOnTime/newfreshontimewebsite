"use client";

import dynamic from "next/dynamic";
import { useEffect, useRef, useState } from "react";

const ProductCardActions = dynamic(() => import("./ProductCardActions"), {
  ssr: false,
  loading: () => <div className="h-12 w-full" aria-hidden="true" />,
});

interface DeferredProductCardActionsProps {
  id: string;
  sku: string;
  name: string;
  image: string;
  price: number;
}

/**
 * Product grids often contain dozens of cards. Loading bag, wishlist, router,
 * and toast behavior for every card at first paint delays the usable catalog.
 * Reserve the button space, then load that behavior only as a card approaches
 * the viewport.
 */
export default function DeferredProductCardActions(props: DeferredProductCardActionsProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [shouldLoad, setShouldLoad] = useState(false);

  useEffect(() => {
    const element = containerRef.current;
    if (!element || shouldLoad) return;

    if (!("IntersectionObserver" in window)) {
      setShouldLoad(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry.isIntersecting) return;
        setShouldLoad(true);
        observer.disconnect();
      },
      { rootMargin: "300px" }
    );
    observer.observe(element);
    return () => observer.disconnect();
  }, [shouldLoad]);

  return (
    <div ref={containerRef} className="h-12 w-full">
      {shouldLoad ? <ProductCardActions {...props} /> : <div className="h-12 w-full" aria-hidden="true" />}
    </div>
  );
}
