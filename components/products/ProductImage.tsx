import Image from "next/image";

function ProductImage({ src, alt }: { src: string; alt: string }) {
  if (!src) {
    return (
      <div className="relative aspect-square overflow-hidden bg-zinc-50">
        <Image
          src="https://images.unsplash.com/photo-1588964895597-a2dd25035548?q=80&w=2574&auto=format&fit=crop"
          alt="Fresh product"
          fill
          className="object-cover transition-transform duration-700 hover:scale-110 opacity-90 grayscale-[0.2] hover:grayscale-0"
          sizes="(max-width: 768px) 100vw, (max-width: 1400px) 50vw, 300px"
        />
      </div>
    );
  }

  return (
    <div className="relative aspect-square md:aspect-[4/5] overflow-hidden bg-zinc-100">
      <Image
        src={src}
        alt={alt}
        fill
        className="object-cover transition-transform duration-1000 ease-out hover:scale-105"
        sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 600px"
        priority
      />
    </div>
  );
}

export default ProductImage;
