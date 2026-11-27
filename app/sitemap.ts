import { fieldNotes, notePath } from '@/lib/fieldNotes';
import type { MetadataRoute } from 'next';
import prisma from '@/lib/prisma';
import { publicProspectWhere } from '@/lib/discovery';
import { makerDestinations } from '@/lib/makerDestinations';
import { makerItemPath, publicMakerWhere } from '@/lib/makers';
import { absoluteUrl } from '@/lib/config/site';
import { publishedJournalWhere } from '@/lib/journalService';
import { editorialGuides, guidePath } from '@/lib/editorialGuides';

export const dynamic = 'force-dynamic';
export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const [makers, items, stories, journal, managedGuides, prospects] = await Promise.all([
    prisma.supplier.findMany({ where: publicMakerWhere, select: { makerHandle:true } }),
    prisma.makerItem.findMany({ where:{published:true, supplier:publicMakerWhere}, select:{slug:true,supplier:{select:{makerHandle:true}}} }),
    prisma.blog.findMany({ where:{published:true,isDeleted:false,supplier:publicMakerWhere}, select:{slug:true,supplier:{select:{makerHandle:true}}} }),
    prisma.blog.findMany({ where:publishedJournalWhere, select:{slug:true} }),
    prisma.blog.findMany({ where:{slug:{in:editorialGuides.map(g=>g.slug)}}, select:{slug:true} }),
    prisma.discoveryProspect.findMany({where:publicProspectWhere,select:{id:true}}),
  ]);
  const managed = new Set(managedGuides.map(row=>row.slug));
  const paths = [...fieldNotes.map(notePath), ...makerDestinations.map(([path])=>path), ...makers.map(m=>`/makers/${m.makerHandle}`), ...prospects.map(p=>`/places/${encodeURIComponent(p.id)}`),
    ...items.map(i=>makerItemPath(i.supplier.makerHandle,i.slug)), ...stories.map(s=>`/makers/${s.supplier?.makerHandle}/stories/${s.slug}`),
    ...journal.map(j=>`/blog/${encodeURIComponent(j.slug)}`), ...editorialGuides.filter(g=>!managed.has(g.slug)).map(g => guidePath(g.slug))];
  return [...new Set(paths)].map(path=>({url:absoluteUrl(path)}));
}
