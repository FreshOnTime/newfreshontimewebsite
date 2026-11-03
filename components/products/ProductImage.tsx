"use client";

import Image from "next/image";
import { ImageOff } from "lucide-react";
import { useState } from "react";

interface ProductImageProps {
  src: string;
  alt: string;
  priority?: boolean;
  sizes?: string;
  variant?: "card" | "detail";
}

const FALLBACK_IMAGE = "/placeholder.svg";

function isUsableImageSource(src: string) {
  return (
    (src.startsWith("/") && !src.startsWith("//")) ||
    /^https?:\/\//i.test(src) ||
    /^data:image\/(?:png|jpeg|webp|avif);base64,/i.test(src)
  );
}

/**
 * A real product image when supplied, or a restrained fallback when the
 * catalogue has no photo or a remote photo fails to load.
 *
 * Never substitute another product's photograph: that could misrepresent
 * the exact item on sale.
 */
export default function ProductImage({
  src,
  alt,
  priority = false,
  sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw",
  variant = "card",
}: ProductImageProps) {
  const normalizedSrc = src.trim();
  const [failedSrc, setFailedSrc] = useState<string | null>(null);
  const hasPhoto =
    normalizedSrc !== "" &&
    normalizedSrc !== FALLBACK_IMAGE &&
    isUsableImageSource(normalizedSrc) &&
    failedSrc !== normalizedSrc;

  const isDetail = variant === "detail";

  return (
    <div className="relative flex h-full w-full items-center justify-center overflow-hidden bg-[#efeee6]">
      {hasPhoto ? (
        <Image
          src={normalizedSrc}
          alt={alt}
          fill
          priority={priority}
          sizes={sizes}
          onError={() => setFailedSrc(normalizedSrc)}
          className={isDetail ? "object-contain p-5 sm:p-8" : "object-contain p-2 sm:p-3"}
        />
      ) : (
        <div
          role="img"
          aria-label={`Product photograph unavailable for ${alt}`}
          className="flex h-full w-full flex-col items-center justify-center px-4 text-center text-brand-green-deep/60"
        >
          <div className={`flex items-center justify-center rounded-full border border-brand-green-deep/15 bg-brand-cream/65 ${isDetail ? "mb-5 h-20 w-20" : "mb-2 h-12 w-12"}`}>
            <ImageOff className={isDetail ? "h-9 w-9" : "h-5 w-5"} aria-hidden="true" />
          </div>
          <span className={`font-semibold ${isDetail ? "text-base sm:text-lg" : "text-[11px] sm:text-xs"}`}>
            Photo coming soon
          </span>
          {isDetail && (
            <p className="mt-2 max-w-56 text-sm font-normal leading-6 text-brand-green-deep/55">
              This product does not have a photo available yet.
            </p>
          )}
        </div>
      )}
    </div>
  );
}
