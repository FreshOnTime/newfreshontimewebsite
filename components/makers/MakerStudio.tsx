'use client';

import { useEffect, useState, type FormEvent } from 'react';
import Link from 'next/link';
import LiveStudio from './LiveStudio';
import SpecialtyPicker from './SpecialtyPicker';
import ArticleEditor from './ArticleEditor';
import {businessSetup,businessPresentation} from '@/lib/businessPresentation';
import {businessArticleTopics} from '@/lib/businessSpecialties';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { fulfilmentOptions, makerImageSrc, makerItemPath, makerKinds, formatMakerDate } from '@/lib/makers';

import {businessTypes,businessTypeLabels,isVenueOnly,type BusinessType} from '@/lib/businessTypes';

type Profile = {
  businessType?:BusinessType;businessSpecialties?:string[];businessWebsite?:string|null;businessInstagram?:string|null;
  makerHandle: string | null; makerBio: string | null; makerTown: string | null;
  makerWhatsApp: string | null; makerFulfilment: string | null; makerPublished: boolean;
};
type CatalogueItem = { id: string; name: string; description: string | null; price: string | null; image: string | null };
type Item = CatalogueItem & {
  slug: string; kind: string; madeToOrder: boolean; published: boolean;
  batches: { id: string; readyAt: string; cutoff: string; soldOut: boolean }[];
};
type Story = {
  id: string; slug: string; title: string; excerpt: string; content: string; category?:string|null;
  published: boolean; makerItems: { itemId: string }[];
};
type Studio = { supplier: Profile; items: Item[]; stories: Story[]; catalogue: CatalogueItem[] };
const fields = 'block min-h-11 w-full rounded-md border border-border bg-background px-3 py-2 text-sm font-normal';
const label = 'grid gap-1.5 text-sm font-semibold';
const primary = 'inline-flex min-h-11 items-center rounded-lg bg-brand-green px-4 text-sm font-semibold text-white disabled:opacity-50';
const plain = 'text-sm font-semibold text-brand-green underline disabled:opacity-50';
const panel = 'space-y-4 rounded-xl border border-border bg-background p-5 md:p-6';
const heading = 'font-serif text-2xl text-brand-green';

async function readStudio(signal?: AbortSignal): Promise<Studio> {
  const response = await authenticatedApiFetch('/api/suppliers/maker', { signal, cache: 'no-store' });
  const data = await response.json();
  if (!response.ok) throw new Error(data.error || 'Unable to load your business studio.');
  return data;
}

export default function MakerStudio() {
  const [studio, setStudio] = useState<Studio>();
  const [notice, setNotice] = useState<{ text: string; error?: boolean }>();
  const [busy, setBusy] = useState(false);
  const [itemEdit, setItemEdit] = useState('');
  const [copyId, setCopyId] = useState('');
  const [tab,setTab] = useState('Profile');
  const [storyEdit, setStoryEdit] = useState('');
  const [editorVersion,setEditorVersion]=useState(0);

  useEffect(() => {
    const controller = new AbortController();
    readStudio(controller.signal).then(setStudio).catch(error => {
      if (!controller.signal.aborted) setNotice({ text: error.message, error: true });
    });
    return () => controller.abort();
  }, []);

  async function save(build: () => object | Promise<object>, message: string, onSaved?: () => void) {
    setBusy(true);
    setNotice(undefined);
    try {
      const body = await build();
      const response = await authenticatedApiFetch('/api/suppliers/maker', {
        method: 'POST', body: JSON.stringify(body),
      });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || 'Unable to save your changes.');
      onSaved?.();
      try {
        setStudio(await readStudio());
        setNotice({ text: message });
      } catch {
        setNotice({ text: 'Saved. Refresh the dashboard to see your changes.' });
      }
    } catch (error) {
      setNotice({ text: error instanceof Error ? error.message : 'Unable to save your changes.', error: true });
    } finally {
      setBusy(false);
    }
  }

  if (!studio) return <p role={notice?.error ? 'alert' : 'status'} className="text-sm text-muted-foreground">{notice?.text || 'Loading business studio…'}</p>;

  const { supplier, items, catalogue, stories } = studio;
  const venue=isVenueOnly(supplier.businessType);
  const item = items.find(entry => entry.id === itemEdit);
  const copy = catalogue.find(entry => entry.id === copyId);
  const story = stories.find(entry => entry.id === storyEdit);
  const source = item || copy;
  const sourceImage = makerImageSrc(source?.image ?? null);
  const openItems = items.filter(entry => entry.published);
  const profilePath = `/makers/${supplier.makerHandle}`;
  const publicStories=stories.filter(entry=>entry.published).length;
  const setup=businessSetup(supplier,openItems.length,publicStories);
  const completed=setup.filter(step=>step.complete).length;
  const presentation=businessPresentation(supplier.businessType);

  function submitProfile(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    void save(() => ({
      action: 'profile', businessType:form.get('businessType'),businessSpecialties:form.getAll('businessSpecialties'),website:form.get('website'),instagram:form.get('instagram'), handle: form.get('handle'), bio: form.get('bio'), town: form.get('town'),
      phone: form.get('phone'), fulfilment: form.get('fulfilment'), published: form.has('published'),
    }), 'Business profile and specialities saved.');
  }

  function submitItem(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    void save(async () => {
      let image = form.has('removeImage') ? null : sourceImage || null;
      const file = form.get('photo');
      if (file instanceof File && file.size) {
        const upload = new FormData();
        upload.set('image', file);
        const response = await authenticatedApiFetch('/api/upload/images/products', { method: 'POST', body: upload });
        const result = await response.json();
        if (!response.ok) throw new Error(result.error || 'Unable to upload your photo.');
        image = result.data.url;
      }
      return {
        action: 'item', id: item?.id, name: form.get('name'), description: form.get('description'),
        kind: form.get('kind'), price: form.get('price') ? Number(form.get('price')) : null, image,
        madeToOrder: form.has('madeToOrder'), published: form.has('published'),
      };
    }, 'Item saved.', () => { element.reset(); setItemEdit(''); setCopyId(''); });
  }

  function submitBatch(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    void save(() => ({
      action: 'batch', itemId: form.get('itemId'), note: form.get('note'), price: Number(form.get('price')),
      cutoff: form.get('cutoff'), readyAt: form.get('readyAt'),
    }), 'Batch saved.', () => element.reset());
  }

  function submitStory(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const element = event.currentTarget;
    const form = new FormData(element);
    void save(() => ({
      action: 'story', id: story?.id, category:form.get('category')||null, title: form.get('title'), excerpt: form.get('excerpt'),
      content: form.get('content'), itemIds: form.getAll('itemIds'), published: form.has('published'),
    }), 'Story saved.', () => { element.reset(); setStoryEdit(''); setEditorVersion(v=>v+1); });
  }

  return <div className="fp-studio space-y-5" aria-busy={busy}>
    {notice && <p role={notice.error ? 'alert' : 'status'} className={`sticky top-4 z-10 rounded-lg border bg-background p-3 text-sm ${notice.error ? 'border-red-300 text-red-700' : 'border-border text-brand-green'}`}>{notice.text}</p>}
    <section className="fp-studio-overview rounded-xl bg-[#173e2b] text-white p-5 sm:p-7" aria-labelledby="studio-overview-title"><div className="flex flex-wrap items-start justify-between gap-4"><div className="min-w-0"><p className="text-xs font-semibold uppercase tracking-widest text-[#b9e98c]">Your business on FreshPick</p><h2 id="studio-overview-title" className="mt-2 font-serif text-3xl">Build a page worth discovering.</h2><p className="mt-2 text-sm text-[#e0e9df]">{supplier.makerPublished?"Your profile is published. Keep your information and offerings current.":"Your profile is private until you publish it."}</p></div>{supplier.makerPublished&&supplier.makerHandle&&<Link href={profilePath} className="inline-flex min-h-11 items-center rounded-md bg-[#b9e98c] px-4 text-sm font-semibold text-[#173e2b]">View public page</Link>}</div><div className="mt-5"><p className="text-sm font-semibold">{completed} of {setup.length} setup steps complete</p><progress aria-label="Business page setup progress" value={completed} max={setup.length} className="mt-2 h-2 w-full accent-[#b9e98c]"/><ul className="mt-4 grid gap-2 sm:grid-cols-2">{setup.map(step=><li key={step.key} className="flex items-center gap-2 text-sm"><span aria-hidden="true" className={step.complete?"text-[#b9e98c]":"text-white/70"}>{step.complete?"✓":"○"}</span>{step.label}<span className="sr-only"> — {step.complete?"Complete":"Not completed"}</span></li>)}</ul><p className="mt-3 text-xs text-[#e0e9df]">These are recommendations, not mandatory publishing requirements.</p></div></section>
    <div className="fp-studio-counts" aria-label="Studio totals">{[[openItems.length, venue?"Published menu items":"Published products"], ...(!venue?[[items.reduce((sum, item) => sum + item.batches.length, 0), "Batches"]]:[]), [publicStories, "Published articles"]].map(([count, label]) => <div key={label}><strong>{count}</strong><span>{label}</span></div>)}</div>
    {supplier.makerHandle && <nav aria-label="Publishing tools" className="flex flex-wrap gap-2">{(venue?['Profile','Items','Stories','Live']:['Profile','Items','Batches','Stories','Live']).map(name => <button type="button" key={name} onClick={() => setTab(name)} aria-pressed={tab === name} className={tab === name ? 'maker-button' : 'min-h-11 border-b border-border px-5 text-sm'}>{name==="Items"?presentation.navigation:name==="Stories"?"Articles":name}</button>)}</nav>}
    {tab==='Live'&&<LiveStudio/>}
    <section hidden={tab !== 'Profile'} className={panel}>
      <div className="flex flex-wrap items-center justify-between gap-3">
        <h2 className={heading}>Public profile</h2>
        {supplier.makerPublished && <Link href={profilePath} className={plain}>View your page</Link>}
      </div>
      <form onSubmit={submitProfile} className="grid gap-4 md:grid-cols-2">
        <label className={label}>Business type<select name="businessType" className={fields} defaultValue={supplier.businessType||"maker"}>{businessTypes.map(t=><option value={t} key={t}>{businessTypeLabels[t]}</option>)}</select></label>
        <div className="md:col-span-2"><SpecialtyPicker initial={supplier.businessSpecialties}/></div>
        <label className={label}>Public handle
          <input name="handle" className={fields} defaultValue={supplier.makerHandle || ''} readOnly={!!supplier.makerHandle}
            required pattern="[a-z0-9]+(?:-[a-z0-9]+)*" minLength={3} maxLength={50} placeholder="your-business-name" />
          <span className="text-xs font-normal text-muted-foreground">Lowercase letters, numbers and hyphens. Your handle becomes part of your permanent URL.</span>
        </label>
        <label className={label}>Town
          <input name="town" className={fields} defaultValue={supplier.makerTown || ''} required minLength={2} maxLength={100} />
        </label>
        <label className={label}>Public WhatsApp number
          <input type="tel" name="phone" className={fields} defaultValue={supplier.makerWhatsApp || ''} required maxLength={32} />
          <span className="text-xs font-normal text-muted-foreground">Customers will see this number when they open WhatsApp.</span>
        </label>
        <label className={label}>How customers visit or enquire
          <select name="fulfilment" className={fields} defaultValue={supplier.makerFulfilment || 'Pickup'}>
            {fulfilmentOptions.map(option => <option key={option}>{option}</option>)}
          </select>
        </label>
        <label className={label}>Official website (optional)<input type="url" name="website" className={fields} defaultValue={supplier.businessWebsite||""} placeholder="https://"/></label>
        <label className={label}>Instagram profile (optional)<input type="url" name="instagram" className={fields} defaultValue={supplier.businessInstagram||""} placeholder="https://www.instagram.com/…"/></label>
        <label className={`${label} md:col-span-2`}>About your business
          <textarea name="bio" className={fields} rows={3} defaultValue={supplier.makerBio || ''} maxLength={1200} />
        </label>
        <label className="flex items-center gap-2 text-sm md:col-span-2">
          <input name="published" type="checkbox" defaultChecked={supplier.makerPublished} /> Make my profile, published offerings and articles public
        </label>
        <div><button disabled={busy} className={primary}>Save profile</button></div>
      </form>
    </section>

    {supplier.makerHandle && <>
      <section hidden={tab !== 'Items'} className={panel}>
        <h2 className={heading}>{item ? 'Edit offering' : venue?'Add a menu item':'Add a product'}</h2>
        {!item && catalogue.length > 0 && <label className={label}>Start from your catalogue
          <select className={fields} value={copyId} onChange={event => setCopyId(event.target.value)}>
            <option value="">Create from scratch</option>
            {catalogue.map(product => <option key={product.id} value={product.id}>{product.name}</option>)}
          </select>
          <span className="text-xs font-normal text-muted-foreground">Copies the product details into a maker listing you can edit here.</span>
        </label>}
        <form key={item?.id || copy?.id || 'new-item'} onSubmit={submitItem} className="grid gap-4 md:grid-cols-2">
          <label className={label}>Item name<input name="name" className={fields} defaultValue={source?.name || ''} required minLength={2} maxLength={120} /></label>
          <label className={label}>Category
            <select name="kind" className={fields} defaultValue={item?.kind || 'Bakery'}>{makerKinds.map(kind => <option key={kind}>{kind}</option>)}</select>
          </label>
          <label className={`${label} md:col-span-2`}>Description<textarea name="description" className={fields} defaultValue={source?.description || ''} rows={3} required minLength={2} maxLength={2000} /></label>
          <label className={label}>Price (LKR, optional)
            <input name="price" type="number" min="0.01" step="0.01" max="9999999999.99" className={fields} defaultValue={source?.price && Number(source.price) > 0 ? source.price : ''} />
          </label>
          <label className={label}>Photo<input name="photo" type="file" accept="image/jpeg,image/png,image/webp,image/avif" className={fields} /></label>
          {sourceImage && <label className="flex items-center gap-2 text-sm md:col-span-2"><input name="removeImage" type="checkbox" /> Remove current photo</label>}
          <label className="flex items-center gap-2 text-sm"><input name="madeToOrder" type="checkbox" defaultChecked={item?.madeToOrder ?? false} /> Accept enquiries any time (made to order)</label>
          <label className="flex items-center gap-2 text-sm"><input name="published" type="checkbox" defaultChecked={item?.published ?? true} /> Publish item</label>
          <div className="flex items-center gap-4 md:col-span-2">
            <button disabled={busy} className={primary}>Save item</button>
            {item && <button type="button" disabled={busy} onClick={() => setItemEdit('')} className={plain}>Cancel edit</button>}
          </div>
        </form>
        {items.map(entry => <div key={entry.id} className="flex flex-wrap items-center justify-between gap-3 border-t border-border pt-3 text-sm">
          <span>{entry.name} · {entry.published ? 'Published' : 'Hidden'}</span>
          <div className="flex gap-4">
            {entry.published && supplier.makerPublished && <Link href={makerItemPath(supplier.makerHandle, entry.slug)} className={plain}>View</Link>}
            <button type="button" disabled={busy} onClick={() => { setItemEdit(entry.id); setCopyId(''); }} className={plain}>Edit<span className="sr-only"> {entry.name}</span></button>
          </div>
        </div>)}
      </section>

      <section hidden={tab !== 'Batches'} className={panel}>
        <h2 className={heading}>Post a batch</h2>
        {openItems.length === 0 ? <p className="text-sm text-muted-foreground">Publish an item to open preorders for a batch.</p> :
          <form onSubmit={submitBatch} className="grid gap-4 md:grid-cols-2">
            <label className={label}>Item<select name="itemId" className={fields}>{openItems.map(entry => <option key={entry.id} value={entry.id}>{entry.name}</option>)}</select></label>
            <label className={label}>Batch price (LKR)<input name="price" type="number" min="0.01" step="0.01" max="9999999999.99" className={fields} required /></label>
            <label className={label}>Preorder cutoff (Sri Lanka time)<input name="cutoff" type="datetime-local" className={fields} required /></label>
            <label className={label}>Ready at (Sri Lanka time)<input name="readyAt" type="datetime-local" className={fields} required /></label>
            <label className={`${label} md:col-span-2`}>Batch note<textarea name="note" className={fields} rows={2} maxLength={500} placeholder="e.g. Pickup from our Nawala kitchen" /></label>
            <div><button disabled={busy} className={primary}>Post batch</button></div>
          </form>}
        {items.flatMap(entry => entry.batches.map(batch => <div key={batch.id} className="flex flex-wrap justify-between gap-3 border-t border-border pt-3 text-sm">
          <span>{entry.name} · {formatMakerDate(batch.readyAt)} · {batch.soldOut ? 'Sold out' : entry.published ? 'Open' : 'Item hidden'}</span>
          <button type="button" disabled={busy} className={plain}
            onClick={() => void save(() => ({ action: 'batch-status', id: batch.id, soldOut: !batch.soldOut }), 'Batch availability updated.')}>
            {batch.soldOut ? 'Reopen batch' : 'Mark sold out'}
          </button>
        </div>))}
      </section>

      <section hidden={tab !== 'Stories'} className={panel}>
        <h2 className={heading}>{story ? 'Edit article' : 'Write an article'}</h2>
        <form key={(story?.id || 'new-story')+':'+editorVersion} onSubmit={submitStory} className="grid gap-4">
          <label className={label}>Title<input name="title" className={fields} defaultValue={story?.title || ''} required minLength={3} maxLength={150} /></label>
          <label className={label}>Article topic<select name="category" className={fields} defaultValue={story?.category&&businessArticleTopics.some(t=>t===story.category)?story.category:""}><option value="">Choose a topic (optional)</option>{businessArticleTopics.map(t=><option key={t}>{t}</option>)}</select></label>
          <label className={label}>Short summary<textarea name="excerpt" className={fields} rows={2} defaultValue={story?.excerpt || ''} required minLength={3} maxLength={300} /></label>
          <ArticleEditor initial={story?.content||""} fieldClass={fields}/>
          {items.length > 0 && <fieldset className="space-y-2">
            <legend className="mb-2 text-sm font-semibold">Link up to 10 offerings (optional)</legend>
            {items.map(entry => <label key={entry.id} className="flex items-center gap-2 text-sm">
              <input name="itemIds" type="checkbox" value={entry.id} defaultChecked={story?.makerItems.some(tag => tag.itemId === entry.id)} /> {entry.name}{!entry.published && ' (hidden item)'}
            </label>)}
          </fieldset>}
          <label className="flex items-center gap-2 text-sm"><input name="published" type="checkbox" defaultChecked={story?.published ?? false} /> Publish article in the journal</label>
          <div className="flex items-center gap-4">
            <button disabled={busy} className={primary}>Save article</button>
            {story && <button type="button" disabled={busy} onClick={() => setStoryEdit('')} className={plain}>Cancel edit</button>}
          </div>
        </form>
        {stories.map(entry => <div key={entry.id} className="flex flex-wrap justify-between gap-3 border-t border-border pt-3 text-sm">
          <span>{entry.title}{entry.category?' · '+entry.category:''} · {entry.published ? 'Published' : 'Draft'}</span>
          <div className="flex gap-4">
            {entry.published && supplier.makerPublished && <Link href={`${profilePath}/stories/${entry.slug}`} className={plain}>View</Link>}
            <button type="button" disabled={busy} onClick={() => setStoryEdit(entry.id)} className={plain}>Edit<span className="sr-only"> {entry.title}</span></button>
          </div>
        </div>)}
      </section>
    </>}
  </div>;
}
