import { Button } from '@/components/ui/button';
export function QueueFeedback({ loading, error, retry }: { loading: boolean; error: string; retry: () => void }) {
  if (loading) return <p role="status" className="py-8 text-muted-foreground">Loading…</p>;
  if (!error) return null;
  return <div role="alert" className="rounded-lg border border-destructive/30 p-5"><p>{error}</p><Button variant="outline" onClick={retry} className="mt-3">Try again</Button></div>;
}
export function QueuePager({ page, pages, change }: { page: number; pages: number; change: (page: number) => void }) {
  return <nav aria-label="List pages" className="flex flex-wrap items-center justify-between gap-3"><Button variant="outline" disabled={page<=1} onClick={() => change(page-1)}>Previous</Button><p className="text-sm">Page {page} of {pages}</p><Button variant="outline" disabled={page>=pages} onClick={() => change(page+1)}>Next</Button></nav>;
}
