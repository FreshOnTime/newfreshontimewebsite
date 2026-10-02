'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowRight, ChevronRight, Plus, ShoppingBag, Trash2 } from 'lucide-react';
import { useBag } from '@/contexts/BagContext';
import { useAuth } from '@/contexts/AuthContext';
import BagItemRow from '@/components/cart/BagItemRow';
import { toast } from 'sonner';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Button } from '@/components/ui/button';

const money = (value: number) => value.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function BagsPage() {
  const { bags, loading, updating, error, createBag, deleteBag, fetchBags } = useBag();
  const { user, loading: authLoading } = useAuth();
  const [showCreate, setShowCreate] = useState(false);
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [creating, setCreating] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<{ id: string; name: string } | null>(null);
  const [deleting, setDeleting] = useState(false);

  const create = async () => {
    if (creating || !name.trim()) return;
    setCreating(true);
    try {
      await createBag(name.trim(), description.trim());
      toast.success('Your new bag is ready');
      setShowCreate(false);
      setName('');
      setDescription('');
    } catch { toast.error('Could not create your bag. Please try again.'); }
    finally { setCreating(false); }
  };
  const removeBag = async () => {
    if (!deleteTarget || deleting) return;
    setDeleting(true);
    try {
      await deleteBag(deleteTarget.id);
      setDeleteTarget(null);
      toast.success('Bag deleted');
    } catch { toast.error('Could not delete this bag. Please try again.'); }
    finally { setDeleting(false); }
  };

  if (authLoading || (loading && bags.length === 0 && !creating)) {
    return <div role="status" className="mx-auto max-w-7xl px-5 py-14 md:px-8"><h1 className="text-3xl font-medium text-brand-green">Your shopping bags</h1><p className="mt-4 text-sm text-muted-foreground">Loading your bags…</p><div aria-hidden="true" className="mt-8 grid gap-6 md:grid-cols-2">{[0, 1].map((key) => <div key={key} className="h-64 animate-pulse rounded-xl bg-secondary motion-reduce:animate-none" />)}</div></div>;
  }

  if (!user) {
    return <section className="mx-auto max-w-lg px-5 py-16 text-center"><ShoppingBag strokeWidth={1.5} aria-hidden="true" className="mx-auto h-9 w-9 text-brand-green" /><h1 className="mt-6 text-3xl font-medium tracking-tight text-brand-green">Your groceries, organised.</h1><p className="mt-4 text-sm leading-7 text-muted-foreground">Sign in to save shopping bags and pick up where you left off.</p><Link href="/auth/login?redirect=%2Fbags" className="mt-7 inline-flex min-h-11 items-center rounded-lg bg-brand-amber px-6 py-3 text-sm font-semibold text-accent-foreground hover:bg-brand-amber/85">Sign in to view your bags</Link><Link href="/products" className="mt-4 flex min-h-11 items-center justify-center text-sm text-brand-green hover:underline">Continue shopping</Link></section>;
  }

  return (
    <>
      <div className="bg-background">
        <div className="mx-auto max-w-7xl px-5 py-6 md:px-8">
          <nav aria-label="Breadcrumb" className="flex items-center gap-2 text-xs text-muted-foreground"><Link href="/" className="inline-flex min-h-9 items-center hover:text-brand-green">Home</Link><ChevronRight aria-hidden="true" className="h-3 w-3" /><span aria-current="page">Shopping bags</span></nav>
          <div className="mt-5 flex flex-col justify-between gap-5 border-b border-border pb-8 sm:flex-row sm:items-end">
            <div><h1 className="text-3xl font-medium tracking-tight text-brand-green md:text-4xl">Your shopping bags</h1><p className="mt-3 max-w-lg text-sm leading-7 text-muted-foreground">A place for this week’s groceries, everyday essentials, and your next meal.</p></div>
            <Button disabled={loading || updating} onClick={() => setShowCreate(true)} className="h-11 rounded-lg bg-brand-amber px-5 text-sm font-semibold hover:bg-brand-amber/85"><Plus strokeWidth={1.75} aria-hidden="true" /> New bag</Button>
          </div>
        </div>
        <div className="mx-auto max-w-7xl px-5 pb-12 pt-2 md:px-8 md:pb-16">
          {error && <div role="alert" className="mb-6 flex flex-wrap items-center justify-between gap-3 rounded-lg border border-destructive/20 px-4 py-3 text-sm"><p className="text-destructive">We couldn’t complete that request. Please try again.</p><button type="button" disabled={loading || updating} onClick={() => fetchBags()} className="min-h-11 font-medium text-brand-green underline underline-offset-4 disabled:opacity-50">Reload bags</button></div>}
          {bags.length === 0 ? (
            <section className="py-12 text-center">
              <div className="mx-auto flex h-16 w-16 items-center justify-center rounded-full bg-secondary text-brand-green"><ShoppingBag strokeWidth={1.5} aria-hidden="true" className="h-7 w-7" /></div>
              <h2 className="mt-6 text-2xl font-medium tracking-tight text-brand-green">{error ? 'Your bags are temporarily unavailable.' : 'Start with a fresh bag.'}</h2>
              <p className="mx-auto mt-3 max-w-sm text-sm leading-7 text-muted-foreground">{error ? 'Reload your bags to continue shopping.' : 'Give your bag a name, then fill it with your favourites from the market.'}</p>
              <Button disabled={loading} onClick={() => error ? fetchBags() : setShowCreate(true)} className="mt-6 h-11 rounded-lg bg-brand-amber px-6 text-sm hover:bg-brand-amber/85">{error ? 'Try again' : 'Create your first bag'}</Button>
            </section>
          ) : (
            <div className="grid items-start gap-6 lg:grid-cols-2">
              {bags.map((bag) => {
                const total = bag.items.reduce((sum, item) => sum + item.product.price * item.quantity, 0);
                const available = bag.items.every((item) => item.quantity <= item.product.stock);
                const checkout = bag.items.length > 0 && available && !loading && !updating;
                return <article key={bag.id} className="rounded-xl border border-border bg-background px-5 sm:px-6">
                  <div className="flex items-start justify-between gap-4 border-b border-border py-5">
                    <div className="min-w-0"><Link href={'/bags/' + encodeURIComponent(bag.id)}><h2 className="break-words text-xl font-medium tracking-tight text-brand-green hover:underline">{bag.name}</h2></Link><p className="mt-2 text-xs text-muted-foreground">{bag.items.length} {bag.items.length === 1 ? 'product' : 'products'}</p>{bag.description && <p className="mt-2 line-clamp-2 text-sm leading-6 text-muted-foreground">{bag.description}</p>}</div>
                    <button type="button" disabled={loading || updating} aria-label={'Delete ' + bag.name} onClick={() => setDeleteTarget({ id: bag.id, name: bag.name })} className="flex h-11 w-11 shrink-0 items-center justify-center rounded-lg text-muted-foreground hover:bg-secondary hover:text-destructive disabled:opacity-30"><Trash2 strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" /></button>
                  </div>
                  {bag.items.length ? <div className="divide-y divide-border">{bag.items.slice(0, 3).map((item) => <BagItemRow key={item.product.id} bagId={bag.id} item={item} compact />)}</div> : <div className="py-10 text-center"><p className="text-sm text-muted-foreground">Your bag is ready to fill.</p><Link href="/products" className="mt-3 inline-flex min-h-11 items-center gap-2 text-sm font-medium text-brand-green hover:underline">Shop the market <ArrowRight strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" /></Link></div>}
                  {bag.items.length > 3 && <Link href={'/bags/' + encodeURIComponent(bag.id)} className="inline-flex min-h-11 items-center text-sm text-brand-green hover:underline">View all {bag.items.length} products</Link>}
                  {bag.tags.length > 0 && <div className="mb-4 flex flex-wrap gap-2">{bag.tags.map((tag) => <span key={tag} className="rounded-full bg-secondary px-3 py-1 text-xs text-brand-green">{tag}</span>)}</div>}
                  <div className="border-t border-border py-5">
                    {!available && <p className="mb-4 text-xs text-destructive">Update unavailable items before checking out.</p>}
                    <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-center"><div><p className="text-xs text-muted-foreground">Items total</p><p className="mt-1 text-xl font-semibold tabular-nums">Rs. {money(total)}</p></div>{checkout ? <Link href={{ pathname: '/checkout', query: { bagId: bag.id } }} className="inline-flex min-h-11 items-center justify-center gap-2 rounded-lg bg-brand-amber px-5 py-3 text-sm font-semibold text-accent-foreground hover:bg-brand-amber/85">Checkout bag <ArrowRight strokeWidth={1.75} aria-hidden="true" className="h-4 w-4" /></Link> : <button disabled className="min-h-11 rounded-lg bg-secondary px-5 text-sm text-muted-foreground">Checkout bag</button>}</div>
                    <Link href={'/bags/' + encodeURIComponent(bag.id)} className="mt-3 inline-flex min-h-11 items-center text-sm text-brand-green hover:underline">View and edit bag</Link>
                  </div>
                </article>;
              })}
            </div>
          )}
        </div>
      </div>

      <Dialog open={showCreate} onOpenChange={(open) => { if (!creating) setShowCreate(open); }}>
        <DialogContent className="max-w-[calc(100vw-32px)] rounded-xl sm:max-w-[460px]">
          <form onSubmit={(event) => { event.preventDefault(); create(); }}>
            <DialogHeader><DialogTitle className="text-2xl font-medium text-brand-green">Create a shopping bag</DialogTitle><DialogDescription>Name it for the way you shop.</DialogDescription></DialogHeader>
            <div className="space-y-4 py-6"><div className="space-y-2"><Label htmlFor="bag-name">Bag name</Label><Input autoFocus id="bag-name" required maxLength={120} disabled={creating} value={name} onChange={(event) => setName(event.target.value)} placeholder="Weekly groceries" /></div><div className="space-y-2"><Label htmlFor="bag-description">Note <span className="text-muted-foreground">(optional)</span></Label><Input id="bag-description" maxLength={300} disabled={creating} value={description} onChange={(event) => setDescription(event.target.value)} placeholder="Anything you’d like to remember" /></div></div>
            <DialogFooter className="gap-2"><Button type="button" variant="outline" disabled={creating} className="h-11 border text-sm normal-case" onClick={() => setShowCreate(false)}>Cancel</Button><Button type="submit" disabled={creating || !name.trim()} className="h-11 bg-brand-amber text-sm hover:bg-brand-amber/85">{creating ? 'Creating…' : 'Create bag'}</Button></DialogFooter>
          </form>
        </DialogContent>
      </Dialog>
      <AlertDialog open={Boolean(deleteTarget)} onOpenChange={(open) => { if (!open && !deleting) setDeleteTarget(null); }}>
        <AlertDialogContent className="max-w-[calc(100vw-32px)] rounded-xl sm:max-w-md">
          <AlertDialogHeader><AlertDialogTitle className="font-medium text-brand-green">Delete this bag?</AlertDialogTitle><AlertDialogDescription>“{deleteTarget?.name}” and its saved items will be removed from your bags.</AlertDialogDescription></AlertDialogHeader>
          <AlertDialogFooter className="gap-2"><AlertDialogCancel disabled={deleting} className="h-11 border text-sm normal-case">Keep bag</AlertDialogCancel><AlertDialogAction disabled={deleting} onClick={(event) => { event.preventDefault(); removeBag(); }} className="h-11 bg-brand-green text-sm text-primary-foreground hover:bg-brand-green/90">{deleting ? 'Deleting…' : 'Delete bag'}</AlertDialogAction></AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}
