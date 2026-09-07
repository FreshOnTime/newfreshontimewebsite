'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Edit3, Loader2, Mail, MapPin, Phone, Save, UserRound, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

const inputClass = 'h-12 rounded-xl border-zinc-200 bg-white px-4 shadow-none focus-visible:ring-emerald-700/20';

export default function ProfilePage() {
  const { user, loading, refreshAuth } = useAuth();
  const router = useRouter();
  const [isEditing, setIsEditing] = useState(false);
  const [isSaving, setIsSaving] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [editedUser, setEditedUser] = useState({ firstName: '', lastName: '', email: '', phoneNumber: '' });

  useEffect(() => {
    if (!loading && !user) router.push('/auth/login?redirect=/profile');
    if (user) {
      setEditedUser({
        firstName: user.firstName || '',
        lastName: user.lastName || '',
        email: user.email || '',
        phoneNumber: user.phoneNumber || '',
      });
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <main className="min-h-[70vh] bg-[#f4f5f1] px-5 py-32">
        <div className="mx-auto flex max-w-6xl items-center gap-3 text-sm text-zinc-500"><Loader2 className="h-4 w-4 animate-spin" /> Loading your account…</div>
      </main>
    );
  }

  if (!user) return null;

  const role = typeof user.role === 'string' && user.role ? user.role.toLowerCase() : 'customer';
  const dashboardHref = role === 'admin' ? '/admin' : '/dashboard';
  const status = user as typeof user & { isEmailVerified?: boolean; isPhoneVerified?: boolean };
  const address = user.registrationAddress;

  const resetForm = () => {
    setEditedUser({
      firstName: user.firstName || '',
      lastName: user.lastName || '',
      email: user.email || '',
      phoneNumber: user.phoneNumber || '',
    });
    setError(null);
    setMessage(null);
  };

  const handleCancel = () => {
    resetForm();
    setIsEditing(false);
  };

  const handleSave = async () => {
    try {
      setIsSaving(true);
      setError(null);
      setMessage(null);

      const response = await fetch('/api/profile', {
        method: 'PATCH',
        credentials: 'include',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(editedUser),
      });
      const body = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(body.error || 'Unable to update profile');

      await refreshAuth();
      setMessage('Your account details were updated.');
      setIsEditing(false);
    } catch (saveError) {
      setError(saveError instanceof Error ? saveError.message : 'Unable to update profile');
    } finally {
      setIsSaving(false);
    }
  };

  const initials = [user.firstName, user.lastName].filter(Boolean).slice(0, 2).map((part) => part?.[0]).join('').toUpperCase();

  return (
    <main className="min-h-screen bg-[#f4f5f1] pb-24 text-zinc-950">
      <section className="border-b border-zinc-200 bg-[#0b1710] px-5 pb-14 pt-28 text-white md:px-8 md:pb-16 md:pt-32">
        <div className="mx-auto grid max-w-6xl gap-8 lg:grid-cols-[1fr_auto] lg:items-end">
          <div className="flex items-start gap-5">
            <div className="flex h-16 w-16 shrink-0 items-center justify-center rounded-full bg-white/10 font-serif text-xl text-emerald-100 ring-1 ring-white/10 md:h-20 md:w-20 md:text-2xl">{initials || 'FP'}</div>
            <div>
              <span className="text-[9px] font-bold uppercase tracking-[0.22em] text-emerald-200">Your FreshPick</span>
              <h1 className="mt-3 font-serif text-5xl font-normal leading-none tracking-[-0.03em] md:text-6xl">{user.firstName}{user.lastName ? ` ${user.lastName}` : ''}</h1>
              <p className="mt-4 max-w-xl text-sm font-light leading-6 text-white/55">Keep the details FreshPick uses for account communication and checkout up to date.</p>
            </div>
          </div>
          <Link href={dashboardHref} className="inline-flex h-11 w-fit items-center gap-2 rounded-full border border-white/15 bg-white/[0.06] px-5 text-sm font-medium text-white/80 transition-colors hover:bg-white/10 hover:text-white">
            Account home <ArrowRight className="h-4 w-4" />
          </Link>
        </div>
      </section>

      <div className="mx-auto max-w-6xl px-5 pt-10 md:px-8 md:pt-14">
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <section className="rounded-[1.75rem] border border-zinc-200 bg-white p-6 shadow-[0_18px_60px_rgba(15,23,42,0.04)] md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5 border-b border-zinc-100 pb-6">
              <div>
                <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">Personal details</p>
                <h2 className="mt-2 font-serif text-3xl font-normal text-zinc-950">The essentials.</h2>
              </div>
              {!isEditing ? (
                <button onClick={() => { setIsEditing(true); setMessage(null); setError(null); }} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-700 transition-colors hover:border-emerald-300 hover:text-emerald-800"><Edit3 className="h-3.5 w-3.5" /> Edit details</button>
              ) : (
                <div className="flex gap-2">
                  <button onClick={handleCancel} disabled={isSaving} className="inline-flex items-center gap-2 rounded-full border border-zinc-200 px-4 py-2 text-xs font-semibold text-zinc-600"><X className="h-3.5 w-3.5" /> Cancel</button>
                  <button onClick={handleSave} disabled={isSaving} className="inline-flex items-center gap-2 rounded-full bg-zinc-950 px-4 py-2 text-xs font-semibold text-white hover:bg-emerald-950 disabled:opacity-50">{isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save</button>
                </div>
              )}
            </div>

            {message && <div className="mt-5 flex items-center gap-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-800"><Check className="h-4 w-4" /> {message}</div>}
            {error && <div className="mt-5 rounded-xl border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <div className="mt-7 grid gap-6 md:grid-cols-2">
              <ProfileField label="First name" icon={UserRound} editing={isEditing} value={editedUser.firstName} display={user.firstName} onChange={(value) => setEditedUser((current) => ({ ...current, firstName: value }))} />
              <ProfileField label="Last name" icon={UserRound} editing={isEditing} value={editedUser.lastName} display={user.lastName || 'Not added'} onChange={(value) => setEditedUser((current) => ({ ...current, lastName: value }))} />
              <ProfileField label="Email" icon={Mail} editing={isEditing} value={editedUser.email} display={user.email || 'Not added'} type="email" onChange={(value) => setEditedUser((current) => ({ ...current, email: value }))} />
              <ProfileField label="Phone" icon={Phone} editing={isEditing} value={editedUser.phoneNumber} display={user.phoneNumber || 'Not added'} onChange={(value) => setEditedUser((current) => ({ ...current, phoneNumber: value }))} />
            </div>
          </section>

          <aside className="space-y-6">
            <section className="rounded-[1.75rem] border border-zinc-200 bg-white p-6">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-700">Delivery home</p>
              <h2 className="mt-2 font-serif text-2xl font-normal">Registration address</h2>
              {address ? (
                <div className="mt-5 flex gap-3 text-sm font-light leading-6 text-zinc-500">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-emerald-700" />
                  <p>{[address.streetAddress, address.streetAddress2, address.town, address.city, address.state, address.postalCode].filter(Boolean).join(', ')}</p>
                </div>
              ) : (
                <p className="mt-5 text-sm font-light leading-6 text-zinc-500">No registration address is attached to this account yet. Checkout will ask for a delivery address when needed.</p>
              )}
            </section>

            <section className="rounded-[1.75rem] bg-[#0b1710] p-6 text-white">
              <p className="text-[9px] font-bold uppercase tracking-[0.2em] text-emerald-200">Account status</p>
              <div className="mt-5 space-y-4">
                <StatusRow label="Email" value={user.email ? (status.isEmailVerified ? 'Verified' : 'Verification pending') : 'Not added'} verified={Boolean(status.isEmailVerified)} />
                <StatusRow label="Phone" value={user.phoneNumber ? (status.isPhoneVerified ? 'Verified' : 'Verification pending') : 'Not added'} verified={Boolean(status.isPhoneVerified)} />
                <StatusRow label="Account" value={role.replace(/_/g, ' ')} verified />
              </div>
            </section>

            <section className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <AccountLink href="/for-you" title="For You" copy="Personal picks and repeat reminders" />
              <AccountLink href="/orders" title="Orders" copy="Track and revisit your purchases" />
              <AccountLink href="/bags" title="Shopping bags" copy="Continue a saved or active bag" />
            </section>
          </aside>
        </div>
      </div>
    </main>
  );
}

function ProfileField({ label, icon: Icon, editing, value, display, type = 'text', onChange }: { label: string; icon: typeof UserRound; editing: boolean; value: string; display: string; type?: string; onChange: (value: string) => void }) {
  return (
    <div>
      <Label className="flex items-center gap-2 text-xs font-semibold uppercase tracking-[0.12em] text-zinc-400"><Icon className="h-3.5 w-3.5" /> {label}</Label>
      {editing ? <Input type={type} value={value} onChange={(event) => onChange(event.target.value)} className={`mt-2 ${inputClass}`} /> : <p className="mt-3 text-base text-zinc-900">{display}</p>}
    </div>
  );
}

function StatusRow({ label, value, verified }: { label: string; value: string; verified: boolean }) {
  return <div className="flex items-center justify-between gap-4 border-b border-white/10 pb-4 last:border-0 last:pb-0"><span className="text-sm text-white/45">{label}</span><span className={`text-xs font-medium capitalize ${verified ? 'text-emerald-200' : 'text-white/60'}`}>{value}</span></div>;
}

function AccountLink({ href, title, copy }: { href: string; title: string; copy: string }) {
  return <Link href={href} className="group rounded-[1.25rem] border border-zinc-200 bg-white p-4 transition-colors hover:border-emerald-300"><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-zinc-900">{title}</span><ArrowRight className="h-4 w-4 text-zinc-300 group-hover:text-emerald-700" /></div><p className="mt-1 text-xs font-light leading-5 text-zinc-400">{copy}</p></Link>;
}
