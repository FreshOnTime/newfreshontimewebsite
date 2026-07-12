import Image from "next/image";

function ProductImage({ src, alt, priority = false }: { src: string; alt: string; priority?: boolean }) {
  if (!src) {
    return (
      <div className="relative aspect-square overflow-hidden bg-zinc-50">
        <Image
          src="https://images.unsplash.com/photo-1588964895597-a2dd25035548?q=80&w=2574&auto=format&fit=crop"
          alt="Fresh product"
          fill
          priority={priority}
          loading={priority ? "eager" : "lazy"}
          className="object-cover transition-transform duration-700 hover:scale-110 opacity-90 grayscale-[0.2] hover:grayscale-0"
          sizes="(max-width: 768px) 100vw, (max-width: 1400px) 50vw, 300px"
        />
      </div>
    );
  }

  return (
    <div className="relative h-full w-full overflow-hidden bg-[#eeebe4]">
      <Image
        src={src}
        alt={alt}
        fill
        priority={priority}
        className="object-cover transition-transform duration-1000 ease-out hover:scale-105"
        // Product cards are below the hero. Eager-loading every product image
        // was creating dozens of competing downloads on the first page view.
        loading={priority ? "eager" : "lazy"}
        sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, (max-width: 1536px) 25vw, 20vw"
      />
    </div>
  );
}

export default ProductImage;
