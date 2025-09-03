import Image from "next/image";

function ProductImage({ src, alt }: { src: string; alt: string }) {
  return (
    <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100">
      <Image
        src={src || "/placeholder.svg"}
        alt={alt}
        fill
        className="object-cover transition-transform duration-500 hover:scale-110"
        sizes="(max-width: 768px) 100vw, (max-width: 1400px) 50vw, 300px"
        priority
      />
    </div>
  );
}

export default ProductImage;
