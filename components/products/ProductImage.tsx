import Image from "next/image";

function ProductImage({ src, alt, priority = false, sizes = "(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw" }: { src: string; alt: string; priority?: boolean; sizes?: string }) {
  if (!src) {
    return (
      <div className="relative h-full w-full overflow-hidden bg-secondary/60">
        <Image
          src="/placeholder.svg"
          alt="Product image unavailable"
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="object-contain mix-blend-multiply p-12 opacity-55"
          sizes={sizes}
        />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-secondary/60">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className={src.startsWith("/images/home/") ? "object-cover" : "object-contain mix-blend-multiply p-3"}
        loading={priority ? "eager" : "lazy"}
        sizes={sizes}
      />
    </div>
  );
}

export default ProductImage;
