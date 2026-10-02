import type { Metadata } from 'next';
import { absoluteUrl, SITE_NAME_LONG } from '@/lib/config/site';

/** Keep editorial text inside its JSON-LD script element. */
export function serializeJsonLd(value: unknown): string {
  return JSON.stringify(value).replace(/</g, '\\u003c').replace(/>/g, '\\u003e').replace(/&/g, '\\u0026');
}

export const privateMetadata: Metadata = {
  robots: { index: false, follow: false, googleBot: { index: false, follow: false } },
};

export function pageMetadata({ title, description, path, image, type = 'website' }: {
  title: string; description: string; path: string; image?: string; type?: 'website' | 'article';
}): Metadata {
  const fullTitle = /fresh\s?pick/i.test(title) ? title : `${title} | FreshPick`;
  const url = absoluteUrl(path);
  const imageUrl = absoluteUrl(image || '/opengraph-image');
  return {
    title: { absolute: fullTitle }, description,
    alternates: { canonical: url },
    openGraph: { title: fullTitle, description, url, type, siteName: SITE_NAME_LONG, locale: 'en_LK', images: [{ url: imageUrl, alt: title }] },
    twitter: { card: 'summary_large_image', title: fullTitle, description, images: [imageUrl] },
  };
}

export function catalogueMetadata(path: string, title: string, description: string, query: Record<string, string | string[] | undefined>): Metadata {
  const page = Number(query.page);
  const validPage = Number.isInteger(page) && page > 1 && page <= 100000 ? page : 1;
  const filtered = ['search', 'categoryId', 'supplierId', 'minPrice', 'maxPrice', 'inStock', 'tags', 'sort', 'limit'].some(key => query[key] !== undefined);
  return {
    ...pageMetadata({ path: !filtered && validPage > 1 ? `${path}?page=${validPage}` : path, title: !filtered && validPage > 1 ? `${title} — page ${validPage}` : title, description }),
    ...(filtered ? { robots: { index: false, follow: true, googleBot: { index: false, follow: true } } } : {}),
  };
}
