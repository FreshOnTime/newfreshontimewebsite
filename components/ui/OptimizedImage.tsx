"use client";

import Image, { ImageProps } from "next/image";
import { useState } from "react";

interface OptimizedImageProps extends Omit<ImageProps, "onError"> {
    fallbackSrc?: string;
}

export default function OptimizedImage({
    src,
    alt,
    fallbackSrc = "/placeholder.svg",
    className = "",
    ...props
}: OptimizedImageProps) {
    const [imgSrc, setImgSrc] = useState(src);
    const [isLoading, setIsLoading] = useState(true);

    return (
        <div className={`relative overflow-hidden ${className}`}>
            {isLoading && (
                <div className="absolute inset-0 bg-zinc-100 animate-pulse" />
            )}
            <Image
                {...props}
                src={imgSrc}
                alt={alt}
                className={`transition-opacity duration-300 ${isLoading ? "opacity-0" : "opacity-100"
                    } ${className}`}
                onLoad={() => setIsLoading(false)}
                onError={() => {
                    setImgSrc(fallbackSrc);
                    setIsLoading(false);
                }}
                placeholder="blur"
                blurDataURL="data:image/svg+xml;base64,PHN2ZyB3aWR0aD0iMzIwIiBoZWlnaHQ9IjMyMCIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj48cmVjdCB3aWR0aD0iMTAwJSIgaGVpZ2h0PSIxMDAlIiBmaWxsPSIjZjRmNGY1Ii8+PC9zdmc+"
            />
        </div>
    );
}
