'use client';
import Image from 'next/image';
import { useState } from 'react';
import { BLOG_IMAGE_FALLBACK, blogImageSource } from '@/lib/blogImages';

export default function BlogImage({ src, alt, sizes, priority = false, contain = false }: {
  src?: string; alt: string; sizes: string; priority?: boolean; contain?: boolean;
}) {
  const safeSource = blogImageSource(src);
  const [failedSource, setFailedSource] = useState<string | null>(null);
  const current = failedSource === safeSource ? BLOG_IMAGE_FALLBACK : safeSource;
  return <Image src={current} alt={current === BLOG_IMAGE_FALLBACK && current !== safeSource ? 'Vegetables at a market' : alt}
    fill sizes={sizes} priority={priority} className={contain ? 'object-contain' : 'object-cover'}
    unoptimized={current.startsWith('https://')}
    onError={() => { if (current !== BLOG_IMAGE_FALLBACK) setFailedSource(safeSource); }} />;
}
