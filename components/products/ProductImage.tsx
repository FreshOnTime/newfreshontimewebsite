import Image from "next/image";

function ProductImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  if (!src) {
    return (
      <div className="relative aspect-square overflow-hidden bg-zinc-50">
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
    <div className="relative h-full w-full overflow-hidden bg-[#f4f4f5]">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover transition-transform duration-1000 ease-out hover:scale-105"
        loading={priority ? "eager" : "lazy"}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
      />
    </div>
  );
}

export default ProductImage;
