import Image from "next/image";

function ProductImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  if (!src) {
    return (
      <div className="relative aspect-square overflow-hidden bg-background">
        <Image
          src="/placeholder.svg"
          alt="Product image unavailable"
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="object-contain p-12 opacity-55"
          sizes="(max-width: 768px) 100vw, (max-width: 1400px) 50vw, 300px"
        />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-contain p-3"
        loading={priority ? "eager" : "lazy"}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
      />
    </div>
  );
}

export default ProductImage;
