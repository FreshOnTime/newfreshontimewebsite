export default function Loading() {
  return <div role="status" aria-label="Loading your bags" className="mx-auto max-w-7xl px-5 py-14 md:px-8"><div aria-hidden="true" className="h-9 w-2/3 max-w-sm animate-pulse rounded-lg bg-muted motion-reduce:animate-none" /><div aria-hidden="true" className="mt-8 grid gap-6 md:grid-cols-2">{[0, 1].map((key) => <div key={key} className="h-64 animate-pulse rounded-lg bg-secondary motion-reduce:animate-none" />)}</div></div>;
}
