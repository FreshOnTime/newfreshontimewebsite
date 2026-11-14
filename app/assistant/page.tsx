'use client';

import { FormEvent, useState } from 'react';
import Link from 'next/link';
import { ArrowRight, Loader2, ShoppingBasket } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { useBag } from '@/contexts/BagContext';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { AccountLoading, AccountPage, AccountState, accountButton, accountSecondaryButton } from '@/components/account/AccountPage';

type SuggestedItem = {
  productId: string;
  sku: string;
  name: string;
  quantity: number;
  unitPrice: number;
  lineTotal: number;
};
type Quote = { subtotal: number; shipping: number; tax: number; total: number; fingerprint: string };
type Proposal = {
  items: SuggestedItem[];
  quote: Quote | null;
  budgetLkr: number;
  message: string;
  mode: 'catalogue-guided';
};

const money = (amount: number) =>
  amount.toLocaleString('en-LK', { minimumFractionDigits: 2, maximumFractionDigits: 2 });

export default function ShoppingAssistantPage() {
  const { user, loading: authLoading } = useAuth();
  const { fetchBags } = useBag();
  const [query, setQuery] = useState('');
  const [budget, setBudget] = useState('3500');
  const [maxItems, setMaxItems] = useState('6');
  const [proposal, setProposal] = useState<Proposal | null>(null);
  const [approvalKey, setApprovalKey] = useState<string | null>(null);
  const [savedBagId, setSavedBagId] = useState<string | null>(null);
  const [planning, setPlanning] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const plan = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (planning || saving) return;
    setPlanning(true);
    setProposal(null);
    setSavedBagId(null);
    setApprovalKey(null);
    setError(null);
    try {
      const response = await authenticatedApiFetch('/api/assistant/plan', {
        method: 'POST',
        cache: 'no-store',
        body: JSON.stringify({
          query: query.trim(),
          budgetLkr: Number(budget),
          maxItems: Number(maxItems),
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.success) throw new Error(body.error || 'Could not plan your bag.');
      setProposal(body.data as Proposal);
      setApprovalKey(crypto.randomUUID());
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not plan your bag.');
    } finally {
      setPlanning(false);
    }
  };

  const approve = async () => {
    if (!proposal?.quote || !proposal.items.length || !approvalKey || saving) return;
    setSaving(true);
    setError(null);
    try {
      // This is a separate, customer-initiated approval action. The server
      // independently checks checkout price, stock, budget and idempotency.
      const response = await authenticatedApiFetch('/api/assistant/confirm', {
        method: 'POST',
        body: JSON.stringify({
          items: proposal.items.map(({ productId, quantity }) => ({ productId, quantity })),
          quoteFingerprint: proposal.quote.fingerprint,
          budgetLkr: proposal.budgetLkr,
          idempotencyKey: approvalKey,
        }),
      });
      const body = await response.json();
      if (!response.ok || !body.success || !body.data?._id) {
        throw new Error(body.error || 'Could not save your bag. Please try again.');
      }
      setSavedBagId(body.data._id);
      await fetchBags();
    } catch (cause) {
      setError(cause instanceof Error ? cause.message : 'Could not save your bag.');
    } finally {
      setSaving(false);
    }
  };

  return (
    <AccountPage
      title="Shopping assistant"
      description="Build a practical grocery bag from real FreshPick products, within your budget."
      action={<Link href="/bags" className={accountSecondaryButton}>Your saved bags</Link>}
    >
      {authLoading ? <AccountLoading label="Loading your account…" /> : !user ? (
        <AccountState title="Plan your next grocery bag" description="Sign in to preview recommendations and save a bag when you're happy with the items."
          action={<Link href="/auth/login?redirect=%2Fassistant" className={accountButton}>Sign in to start</Link>} />
      ) : (
        <div className="grid gap-8 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.05fr)] lg:items-start">
          <section className="rounded-xl border border-border p-5 sm:p-7" aria-labelledby="assistant-form-title">
            <div className="mb-5 flex items-center gap-3">
              <ShoppingBasket className="h-6 w-6 text-brand-green" aria-hidden="true" />
              <h2 id="assistant-form-title" className="text-xl font-normal text-brand-green">What do you need?</h2>
            </div>
            <form onSubmit={(event) => void plan(event)} className="space-y-5">
              <div>
                <label htmlFor="assistant-request" className="mb-2 block text-sm font-medium">Your shopping request</label>
                <textarea
                  id="assistant-request" required minLength={3} maxLength={300} rows={4}
                  value={query} onChange={(event) => setQuery(event.target.value)}
                  placeholder="Example: Tomatoes, rice, lentils and bananas for this week"
                  className="w-full rounded-lg border border-border bg-background px-4 py-3 text-sm leading-6 focus-visible:outline focus-visible:outline-2 focus-visible:outline-brand-green"
                />
                <p className="mt-2 text-xs text-muted-foreground">
                  This pilot matches the words you enter to in-stock products. It does not yet understand recipes or verify dietary restrictions.
                </p>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label htmlFor="assistant-budget" className="mb-2 block text-sm font-medium">Maximum total (LKR)</label>
                  <input id="assistant-budget" type="number" min={10} max={500000} step="1" required
                    value={budget} onChange={(event) => setBudget(event.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm" />
                </div>
                <div>
                  <label htmlFor="assistant-max" className="mb-2 block text-sm font-medium">Maximum products</label>
                  <select id="assistant-max" value={maxItems} onChange={(event) => setMaxItems(event.target.value)}
                    className="h-11 w-full rounded-lg border border-border bg-background px-3 text-sm">
                    {[3, 4, 5, 6, 7, 8, 9, 10].map((number) => <option key={number} value={number}>{number}</option>)}
                  </select>
                </div>
              </div>
              <button type="submit" disabled={planning || saving || !query.trim()} className={accountButton}>
                {planning && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
                {planning ? 'Checking the market…' : 'Create my draft bag'}
              </button>
            </form>
            <p className="mt-6 text-xs leading-6 text-muted-foreground">
              Suggestions are catalogue-guided, not AI-generated. Only current product records are used.
              Delivery is included in the estimate, but prices and availability are checked again before saving and at checkout.
            </p>
          </section>

          <section aria-live="polite" className="rounded-xl border border-border p-5 sm:p-7">
            <h2 className="text-xl font-normal text-brand-green">Your suggested bag</h2>
            {error && <p role="alert" className="mt-4 rounded-lg border border-red-300/50 px-4 py-3 text-sm text-red-700">{error}</p>}
            {savedBagId ? (
              <div className="mt-6 space-y-4">
                <p className="text-sm leading-7">Your reviewed bag has been saved. No order has been placed.</p>
                <Link className={accountButton} href={`/bags/${encodeURIComponent(savedBagId)}`}>
                  Review saved bag <ArrowRight className="h-4 w-4" aria-hidden="true" />
                </Link>
              </div>
            ) : !proposal ? (
              <p className="mt-5 text-sm leading-7 text-muted-foreground">
                Your suggestions will appear here after you describe what you need.
              </p>
            ) : proposal.items.length === 0 || !proposal.quote ? (
              <div className="mt-5 space-y-3">
                <p className="text-sm leading-7 text-muted-foreground">{proposal.message}</p>
                <Link href="/products" className={accountSecondaryButton}>Browse products instead</Link>
              </div>
            ) : (
              <>
                <p className="mt-3 text-sm leading-6 text-muted-foreground">{proposal.message}</p>
                <ul className="mt-6 divide-y divide-border">
                  {proposal.items.map((item) => (
                    <li key={item.productId} className="flex items-start justify-between gap-4 py-4">
                      <div>
                        <Link href={`/products/${encodeURIComponent(item.sku || item.productId)}`}
                          className="text-sm font-medium text-brand-green hover:underline">{item.name}</Link>
                        <p className="mt-1 text-xs text-muted-foreground">Quantity {item.quantity} · Rs. {money(item.unitPrice)} each</p>
                      </div>
                      <span className="shrink-0 text-sm font-medium">Rs. {money(item.lineTotal)}</span>
                    </li>
                  ))}
                </ul>
                <div className="space-y-2 border-t border-border pt-4 text-sm">
                  <div className="flex justify-between"><span>Products</span><span>Rs. {money(proposal.quote.subtotal)}</span></div>
                  <div className="flex justify-between"><span>Estimated delivery</span><span>Rs. {money(proposal.quote.shipping)}</span></div>
                  <div className="flex justify-between font-semibold text-brand-green"><span>Estimated total</span><span>Rs. {money(proposal.quote.total)}</span></div>
                  <div className="flex justify-between text-xs text-muted-foreground"><span>Your budget</span><span>Rs. {money(proposal.budgetLkr)}</span></div>
                </div>
                <button type="button" onClick={() => void approve()} disabled={saving || planning} className={`${accountButton} mt-6`}>
                  {saving && <Loader2 aria-hidden="true" className="h-4 w-4 animate-spin" />}
                  {saving ? 'Checking and saving…' : 'Approve and save this bag'}
                </button>
                <p className="mt-4 text-xs leading-6 text-muted-foreground">
                  Saving creates a shopping bag only. It does not reserve stock or place a COD order.
                  Review the latest amounts and delivery eligibility at checkout.
                </p>
              </>
            )}
          </section>
        </div>
      )}
    </AccountPage>
  );
}
