import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fieldNotes, notePath } from '@/lib/fieldNotes';
import { pageMetadata } from '@/lib/seo';
import { GuideShelf } from '@/components/discovery/Editorial';
import { SavePick } from '@/components/makers/SavedPicks';

type Props = { params: Promise<{ slug: string }> };
export const generateStaticParams = () => fieldNotes.map(({ slug }) => ({ slug }));
export async function generateMetadata({ params }: Props) {
  const { slug } = await params;
  const note = fieldNotes.find(n => n.slug === slug);
  return note ? pageMetadata({ path: notePath(note), title: note.title, description: note.excerpt, type: 'article', image: note.image }) : {};
}
export default async function FieldNotePage({ params }: Props) {
  const { slug } = await params;
  const note = fieldNotes.find(n => n.slug === slug);
  if (!note) notFound();
  return <div className="fp26-shell"><article>
    <header className="fp26-article-title"><Link className="fp26-label" href="/stories">Journal / {note.category}</Link><h1>{note.title}</h1><p className="fp26-deck">{note.excerpt}</p><div className="fp26-byline"><span>FreshPick editorial · {Math.max(1,Math.ceil(note.sections.map(([,body])=>body).join(' ').trim().split(/\s+/).length/220))} min read</span><SavePick href={notePath(note)} title={note.title} kind="Field note"/></div></header>
    <div className="fp26-article-photo"><Image src={note.image} alt={note.alt} fill priority sizes="(max-width:760px) 100vw, 1040px"/></div>
    <div className="fp26-reading">{note.sections.map(([heading,body])=><section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}<div className="mt-8"><Link className="fp26-action" href={("destination" in note&&typeof note.destination==="string")?note.destination:`/makers?kind=${encodeURIComponent(note.kind)}`}>Continue exploring</Link></div></div>
  </article><GuideShelf slugs={fieldNotes.filter(n=>n.slug!==slug).slice(0,2).map(n=>n.slug)} heading="Keep reading" compact/></div>;
}