import guides from '@/content/blog/guides.json';

// Versioned editorial content. Edit here rather than in the database blog editor.
export const editorialGuides = guides;
export const guidePath = (slug: string) => `/blog/guides/${encodeURIComponent(slug)}`;
export const findEditorialGuide = (slug: string) => editorialGuides.find(guide => guide.slug === slug);
