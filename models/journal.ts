export interface JournalSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: { url: string; alt?: string } | null;
  category?: string | null;
  publishedAt?: string | null;
}
