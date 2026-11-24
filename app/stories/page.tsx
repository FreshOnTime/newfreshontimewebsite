import Link from 'next/link';
import Image from 'next/image';
import prisma from '@/lib/prisma';
import { publicMakerWhere } from '@/lib/makers';

export const dynamic = 'force-dynamic';
export const metadata = { title: 'Food stories' };

export default async function Stories({ searchParams }: { searchParams: Promise<{ page?: string }> }) {
  const page = Math.max(1, Math.min(10000, Number.parseInt((await searchParams).page || '1') || 1));
  const rows = await prisma.blog.findMany({ where: { published: true, isDeleted: false, supplier: publicMakerWhere }, skip: (page - 1) * 20, take: 21, orderBy: [{ publishedAt: 'desc' }, { id: 'asc' }],
    select: { id: true, title: true, excerpt: true, slug: true, supplier: { select: { name: true, makerHandle: true } } } });
  return <div className="editorial-wrap py-10 md:py-16">
    <header className="grid overflow-hidden rounded-xl bg-brand-cream md:grid-cols-2"><div className="self-center p-8 md:p-12"><h1 className="maker-headline">Kitchen stories.</h1><p className="mt-5 max-w-md">Recipes, growing notes and the people behind the food, in their own words.</p></div>
    <Image src="/images/editorial/pepper-mortar.webp" width={800} height={480} alt="Spices and a mortar in the kitchen" className="h-56 w-full object-cover md:h-80"/></header>
    <div className="my-8 grid gap-5 md:grid-cols-2">{rows.slice(0,20).map(row => <Link key={row.id} href={`/makers/${row.supplier?.makerHandle}/stories/${row.slug}`} className="border-b border-border py-5"><p className="text-sm text-muted-foreground">{row.supplier?.name}</p><h2 className="mt-2 text-3xl">{row.title}</h2><p className="mt-2">{row.excerpt}</p></Link>)}</div>
    {!rows.length && <p className="mb-6">No maker stories on this page yet. <Link className="underline" href="/makers">Explore the makers</Link>.</p>}
    <nav className="flex flex-wrap gap-6 text-sm underline">{page > 1 && <Link href={`/stories?page=${page-1}`}>Previous</Link>}{rows.length > 20 && <Link href={`/stories?page=${page+1}`}>Next</Link>}<Link href="/blog">FreshPick editorial archive</Link></nav>
  </div>;
}
