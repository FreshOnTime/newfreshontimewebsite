import Image from 'next/image';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { fieldNotes, notePath } from '@/lib/fieldNotes';
import { pageMetadata } from '@/lib/seo';
import { ReadingShelf } from '@/components/makers/Edition';
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
  return <><article className="lux-reading-article">
    <header className="fp-article-head editorial-wrap"><div>
      <Link className="fp-kicker" href="/stories">The journal / {note.category}</Link>
      <h1>{note.title}</h1><p>{note.excerpt}</p>
      <div className="fp-byline"><span>FreshPick editorial · {Math.max(1, Math.ceil(note.sections.map(([, body]) => body).join(" ").trim().split(/\s+/).length / 220))} min read</span><SavePick href={notePath(note)} title={note.title} kind="Field note" /></div>
    </div><div className="fp-image"><Image src={note.image} alt={note.alt} fill priority sizes="(max-width:700px) 95vw, 49vw"/></div></header>
    <div className="fp-article-body lux-reading-body">{note.sections.map(([heading, body]) => <section key={heading}><h2>{heading}</h2><p>{body}</p></section>)}
      <Link className="maker-button" href={`/makers?kind=${encodeURIComponent(note.kind)}`}>Explore {note.kind.toLowerCase()}</Link>
    </div>
  </article><ReadingShelf exclude={slug}/></>;
}
