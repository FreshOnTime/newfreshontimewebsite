"use client";

import { useEffect, useState } from "react";
import { scheduleIdleTask } from "@/lib/utils/idleCallback";
import HomeCarousel from "./HomeCarousel";

interface DeferredHomeCarouselProps {
  images: string[];
}

// The carousel sits below the hero and does not affect a first-time visitor's
// ability to navigate or shop. Mount it after the browser has had time to paint
// the page, avoiding its event handlers and image request during the critical
// loading window.
export default function DeferredHomeCarousel({ images }: DeferredHomeCarouselProps) {
  const [isReady, setIsReady] = useState(false);

  useEffect(() => {
    const task = scheduleIdleTask(() => setIsReady(true), {
      timeout: 2500,
      fallbackDelayMs: 2500,
    });
    return () => task.cancel();
  }, []);

  if (!isReady) {
    return <div aria-hidden="true" className="h-8 bg-gray-50/50 md:h-12" />;
  }

  return <HomeCarousel images={images} />;
}
