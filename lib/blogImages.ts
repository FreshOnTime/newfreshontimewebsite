export const BLOG_IMAGE_FALLBACK = '/images/editorial/market-crates.webp';

export function blogImageSource(value: unknown): string {
  if (typeof value !== 'string' || !value.trim()) return BLOG_IMAGE_FALLBACK;
  const src = value.trim();
  if (src.startsWith('/') && !src.startsWith('//') && !src.includes('\\')) return src;
  try {
    const url = new URL(src);
    return url.protocol === 'https:' && !url.username && !url.password ? url.href : BLOG_IMAGE_FALLBACK;
  } catch { return BLOG_IMAGE_FALLBACK; }
}

export function normalizeBlogImage(value: unknown) {
  const object = value && typeof value === 'object' && !Array.isArray(value) ? value as Record<string, unknown> : null;
  return { url: blogImageSource(typeof value === 'string' ? value : object?.url), alt: typeof object?.alt === 'string' ? object.alt : '' };
}
