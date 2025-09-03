"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import { Product } from "@/models/product";
import { ProductCard } from "@/components/products/ProductCard";

export default function ProductCarousel({
  title,
  products,
  autoplay = true,
  autoplayInterval = 4500,
  loop = true,
  showDots = true,
  keyboard = true,
  draggable = true,
}: {
  title: string;
  products: Product[];
  autoplay?: boolean;
  autoplayInterval?: number;
  loop?: boolean;
  showDots?: boolean;
  keyboard?: boolean;
  draggable?: boolean;
}) {
  const ref = useRef<HTMLDivElement | null>(null);
  const wrapperRef = useRef<HTMLDivElement | null>(null);
  const isJumpingRef = useRef(false);
  const setWidthRef = useRef(0);
  const intervalRef = useRef<number | null>(null);

  const [atStart, setAtStart] = useState(true);
  const [atEnd, setAtEnd] = useState(false);
  const [pageCount, setPageCount] = useState(1);
  const [activePage, setActivePage] = useState(0);

  // Duplicate items for seamless looping
  const renderedProducts = useMemo(() => {
    if (!loop) return products;
    return [...products, ...products, ...products];
  }, [loop, products]);

  const updateScrollState = useCallback(() => {
    const el = ref.current;
    if (!el) return;
    const { scrollLeft, scrollWidth, clientWidth } = el;

    // Measure set width for looped carousels (3 sets)
    const setWidth = loop ? scrollWidth / 3 : scrollWidth;
    setWidthRef.current = setWidth;

    // cards per view & dots/page calc
    const firstChild = el.firstElementChild as HTMLElement | null;
    const gapPx = parseFloat(getComputedStyle(el).columnGap || "20");
    if (firstChild) {
      const cardW = firstChild.getBoundingClientRect().width;
      const cpv = Math.max(1, Math.floor((clientWidth + gapPx) / (cardW + gapPx)));
      setPageCount(Math.max(1, Math.ceil(products.length / cpv)));

      // Active page calculation normalized within the middle set when looping
      const normalized = loop ? Math.max(0, Math.min(scrollLeft - setWidth, setWidth)) : scrollLeft;
      const ratio = setWidth > clientWidth ? normalized / (setWidth - clientWidth) : 0;
  const page = Math.round(ratio * (Math.max(1, Math.ceil(products.length / cpv)) - 1));
  setActivePage(Math.max(0, Math.min(page, Math.max(1, Math.ceil(products.length / cpv)) - 1)));
    }

    if (!loop) {
      setAtStart(scrollLeft <= 2);
      setAtEnd(scrollLeft + clientWidth >= scrollWidth - 2);
    } else {
      setAtStart(false);
      setAtEnd(false);
    }
  }, [loop, products.length]);

  useEffect(() => {
    updateScrollState();
    const el = ref.current;
    if (!el) return;
    const handler = () => updateScrollState();
    el.addEventListener("scroll", handler, { passive: true });
    // Resize observer keeps measurements fresh on breakpoints
    const ro = new ResizeObserver(() => updateScrollState());
    ro.observe(el);

    return () => {
      el.removeEventListener("scroll", handler);
      ro.disconnect();
    };
  }, [updateScrollState]);

  // Initialize middle set position for looped carousel
  useEffect(() => {
    const el = ref.current;
    if (!el || !loop) return;
    // Wait next frame to ensure scrollWidth is ready
    const id = requestAnimationFrame(() => {
      const setWidth = el.scrollWidth / 3;
      setWidthRef.current = setWidth;
      el.scrollLeft = setWidth;
      updateScrollState();
    });
    return () => cancelAnimationFrame(id);
  }, [loop, renderedProducts.length, updateScrollState]);

  // Seamless loop jump when crossing boundaries
  useEffect(() => {
    if (!loop) return;
    const el = ref.current;
    if (!el) return;
    const onScroll = () => {
      if (!loop) return;
      const setWidth = setWidthRef.current || el.scrollWidth / 3;
      if (setWidth <= 0) return;
      if (isJumpingRef.current) return;
      const { scrollLeft } = el;
      const threshold = 40; // px
      if (scrollLeft < setWidth + threshold && scrollLeft < setWidth * 0.1) {
        // Jump forward by one set
        isJumpingRef.current = true;
        el.scrollTo({ left: scrollLeft + setWidth, behavior: "auto" });
        isJumpingRef.current = false;
      } else if (scrollLeft > setWidth * 2 - threshold && scrollLeft > setWidth * 1.9) {
        // Jump backward by one set
        isJumpingRef.current = true;
        el.scrollTo({ left: scrollLeft - setWidth, behavior: "auto" });
        isJumpingRef.current = false;
      }
    };
    el.addEventListener("scroll", onScroll, { passive: true });
    return () => el.removeEventListener("scroll", onScroll);
  }, [loop]);

  const scroll = (dir: -1 | 1) => {
    const el = ref.current;
    if (!el) return;
    el.scrollBy({ left: dir * Math.round(el.clientWidth * 0.9), behavior: "smooth" });
  };

  // Autoplay
  useEffect(() => {
    const el = ref.current;
    if (!el || !autoplay) return;

    const start = () => {
      if (intervalRef.current) return;
      intervalRef.current = window.setInterval(() => {
        if (document.hidden) return; // pause when tab hidden
        // If user is interacting (hover/focus/drag), skip
        if (wrapperRef.current?.matches(":hover, :focus-within")) return;
        el.scrollBy({ left: Math.round(el.clientWidth * 0.9), behavior: "smooth" });
      }, Math.max(2000, autoplayInterval));
    };
    const stop = () => {
      if (intervalRef.current) {
        window.clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };

    start();
    return () => stop();
  }, [autoplay, autoplayInterval]);

  // Keyboard navigation
  useEffect(() => {
    if (!keyboard) return;
    const wrap = wrapperRef.current;
    if (!wrap) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowLeft") {
        e.preventDefault();
        scroll(-1);
      } else if (e.key === "ArrowRight") {
        e.preventDefault();
        scroll(1);
      }
    };
    wrap.addEventListener("keydown", onKey);
    return () => wrap.removeEventListener("keydown", onKey);
  }, [keyboard]);

  // Drag to scroll (desktop)
  useEffect(() => {
    if (!draggable) return;
    const el = ref.current;
    if (!el) return;
    let isDown = false;
    let startX = 0;
    let startScroll = 0;
    const onDown = (e: PointerEvent) => {
      // Only primary button
      if (e.button !== 0) return;
      isDown = true;
      startX = e.clientX;
      startScroll = el.scrollLeft;
      (e.target as HTMLElement).setPointerCapture?.(e.pointerId);
      el.classList.add("cursor-grabbing");
    };
    const onMove = (e: PointerEvent) => {
      if (!isDown) return;
      const dx = e.clientX - startX;
      el.scrollLeft = startScroll - dx;
    };
    const onUp = (e: PointerEvent) => {
      isDown = false;
      el.classList.remove("cursor-grabbing");
      (e.target as HTMLElement).releasePointerCapture?.(e.pointerId);
    };
    el.addEventListener("pointerdown", onDown);
    el.addEventListener("pointermove", onMove);
    window.addEventListener("pointerup", onUp);
    return () => {
      el.removeEventListener("pointerdown", onDown);
      el.removeEventListener("pointermove", onMove);
      window.removeEventListener("pointerup", onUp);
    };
  }, [draggable]);

  return (
    <section className="bg-white">
      <div className="container mx-auto px-4 py-10">
        <div className="flex items-center justify-between mb-5">
          <h3 className="font-bold text-2xl tracking-tight text-gray-900">{title}</h3>
          <div className="hidden sm:flex gap-2">
            <button
              aria-label="Previous"
              onClick={() => scroll(-1)}
              disabled={atStart}
              className={`p-2 rounded-full border backdrop-blur bg-white/70 shadow-sm hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              aria-label="Next"
              onClick={() => scroll(1)}
              disabled={atEnd}
              className={`p-2 rounded-full border backdrop-blur bg-white/70 shadow-sm hover:bg-white disabled:opacity-40 disabled:cursor-not-allowed`}
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>
        </div>

        <div
          className="relative"
          ref={wrapperRef}
          role="region"
          aria-roledescription="carousel"
          aria-label={title}
          tabIndex={0}
        >
          {/* Edge fade gradients */}
          <div className="pointer-events-none absolute left-0 top-0 h-full w-8 bg-gradient-to-r from-white to-transparent" />
          <div className="pointer-events-none absolute right-0 top-0 h-full w-8 bg-gradient-to-l from-white to-transparent" />

          <div
            ref={ref}
            className="flex gap-5 overflow-x-auto no-scrollbar snap-x scroll-px-4 px-1 cursor-grab"
            aria-live={autoplay ? "polite" : undefined}
          >
            {renderedProducts.map((p, idx) => (
              <div key={`${p.sku}-${idx}`} className="snap-start">
                <div className="w-[220px] sm:w-[240px] md:w-[260px] transition-transform duration-300 hover:scale-[1.02]">
                  <ProductCard
                    sku={p.sku}
                    name={p.name}
                    image={p.image.url}
                    discountPercentage={p.discountPercentage || 0}
                    baseMeasurementQuantity={p.baseMeasurementQuantity}
                    pricePerBaseQuantity={p.pricePerBaseQuantity}
                    measurementType={p.measurementUnit}
                    isDiscreteItem={p.isSoldAsUnit}
                  />
                </div>
              </div>
            ))}
          </div>

          {/* Floating controls on small screens */}
          <div className="sm:hidden">
            <button
              aria-label="Previous"
              onClick={() => scroll(-1)}
              disabled={atStart}
              className="absolute left-2 top-1/2 -translate-y-1/2 p-2 rounded-full border bg-white/80 backdrop-blur shadow disabled:opacity-40"
            >
              <ChevronLeft className="w-5 h-5" />
            </button>
            <button
              aria-label="Next"
              onClick={() => scroll(1)}
              disabled={atEnd}
              className="absolute right-2 top-1/2 -translate-y-1/2 p-2 rounded-full border bg-white/80 backdrop-blur shadow disabled:opacity-40"
            >
              <ChevronRight className="w-5 h-5" />
            </button>
          </div>

          {/* Dots */}
          {showDots && pageCount > 1 && (
            <div className="mt-6 flex items-center justify-center gap-2">
              {Array.from({ length: pageCount }).map((_, i) => (
                <button
                  key={i}
                  aria-label={`Go to slide ${i + 1}`}
                  className={`h-2.5 rounded-full transition-all ${
                    i === activePage ? "w-6 bg-green-600" : "w-2.5 bg-gray-300 hover:bg-gray-400"
                  }`}
                  onClick={() => {
                    const el = ref.current;
                    const setW = setWidthRef.current || (el ? el.scrollWidth / (loop ? 3 : 1) : 0);
                    if (!el || setW === 0) return;
                    const ratio = pageCount > 1 ? i / (pageCount - 1) : 0;
                    const target = (loop ? setW : 0) + ratio * (setW - el.clientWidth);
                    el.scrollTo({ left: Math.max(0, Math.min(target, el.scrollWidth)), behavior: "smooth" });
                  }}
                />
              ))}
            </div>
          )}
        </div>
      </div>
    </section>
  );
}
