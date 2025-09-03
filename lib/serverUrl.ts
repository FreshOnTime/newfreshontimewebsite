export function getBaseUrl(): string {
  // Prefer explicit API URL if provided (must include protocol)
  const explicit = process.env.NEXT_PUBLIC_API_URL;
  if (explicit && /^https?:\/\//i.test(explicit)) {
    return explicit.replace(/\/$/, '');
  }

  // Netlify runtime: URL contains full https domain for the current site
  const netlifyUrl = process.env.URL || process.env.DEPLOY_PRIME_URL || process.env.DEPLOY_URL;
  if (process.env.NETLIFY && netlifyUrl && /^https?:\/\//i.test(netlifyUrl)) {
    return netlifyUrl.replace(/\/$/, '');
  }

  // Vercel environment provides VERCEL_URL without protocol
  const vercel = process.env.VERCEL_URL;
  if (vercel) {
    return `https://${vercel}`;
  }

  // Generic site URL override for other hosts
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL;
  if (siteUrl && /^https?:\/\//i.test(siteUrl)) {
    return siteUrl.replace(/\/$/, '');
  }

  // Fallback to localhost in dev
  const host = process.env.HOST || 'localhost';
  const port = process.env.PORT || '3000';
  return `http://${host}:${port}`;
}

export function withBase(path: string): string {
  const base = getBaseUrl();
  return `${base}${path.startsWith('/') ? path : `/${path}`}`;
}
