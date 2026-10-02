export interface JournalSummary {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  featuredImage?: { url: string; alt?: string } | null;
  category?: string | null;
  publishedAt?: string | null;
}

export interface JournalPage {
  blogs: (Omit<JournalSummary, 'id'> & { _id: string })[];
  pagination: { page: number; limit: number; total: number; pages: number };
}
