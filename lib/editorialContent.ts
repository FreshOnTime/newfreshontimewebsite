export function slugifyEditorial(value: string): string {
  return value.trim().toLowerCase().replace(/[^a-z0-9\s-]/g, '').replace(/\s+/g, '-').replace(/-+/g, '-').replace(/^-|-$/g, '');
}

export function normalizeFeaturedImage(value: unknown): { url: string; alt?: string } | undefined {
  if (!value || typeof value !== 'object' || Array.isArray(value)) return undefined;
  const candidate = value as { url?: unknown; alt?: unknown };
  if (typeof candidate.url !== 'string' || !candidate.url.trim()) return undefined;
  return { url: candidate.url, alt: typeof candidate.alt === 'string' && candidate.alt.trim() ? candidate.alt : undefined };
}
