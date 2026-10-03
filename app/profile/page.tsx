'use client';

import { useEffect, useState, useId } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { ArrowRight, Check, Edit3, Loader2, Mail, MapPin, Phone, Save, UserRound, X } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { AccountPage, accountSecondaryButton } from '@/components/account/AccountPage';

const inputClass = 'h-11 rounded-lg border-border bg-background px-4 shadow-none focus-visible:ring-primary/20';

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
      <div className="min-h-0 bg-background px-5 py-12">
        <div className="mx-auto flex max-w-6xl items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading your account…</div>
      </div>
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
      if (!isEditing || isSaving) return;
      setIsSaving(true);
      setError(null);
      setMessage(null);

      const response = await authenticatedApiFetch('/api/profile', {
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

  return (
    <AccountPage title="Account details" description="Your contact information and delivery address." action={<Link href={dashboardHref} className={accountSecondaryButton}>Account home <ArrowRight className="h-4 w-4" /></Link>}>
        <div className="grid gap-6 lg:grid-cols-[1.25fr_0.75fr]">
          <form onSubmit={(event) => { event.preventDefault(); void handleSave(); }} className="rounded-lg border border-border bg-background p-6 md:p-8">
            <div className="flex flex-wrap items-start justify-between gap-5 border-b border-border pb-6">
              <div>
                <p className="text-xs font-bold normal-case text-brand-green">Personal details</p>
                <h2 className="mt-2 text-xl font-normal text-brand-green">Personal information</h2>
              </div>
              {!isEditing ? (
                <button type="button" onClick={() => { setIsEditing(true); setMessage(null); setError(null); }} className="inline-flex items-center gap-2 rounded-full border border-border px-4 py-2 text-xs font-semibold text-foreground transition-colors hover:border-border hover:text-brand-green"><Edit3 className="h-3.5 w-3.5" /> Edit details</button>
              ) : (
                <div className="flex gap-2">
                  <button type="button" onClick={handleCancel} disabled={isSaving} className="inline-flex items-center gap-2 rounded-md border border-border px-4 py-2 text-xs font-semibold text-muted-foreground"><X className="h-3.5 w-3.5" /> Cancel</button>
                  <button type="submit" disabled={isSaving} className="inline-flex items-center gap-2 rounded-md bg-brand-leaf px-4 py-2 text-xs font-semibold text-brand-ink hover:bg-brand-leaf/85 disabled:opacity-50">{isSaving ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <Save className="h-3.5 w-3.5" />} Save</button>
                </div>
              )}
            </div>

            {message && <div role="status" className="mt-5 flex items-center gap-2 rounded-lg border border-border bg-secondary px-4 py-3 text-sm text-brand-green"><Check className="h-4 w-4" /> {message}</div>}
            {error && <div role="alert" className="mt-5 rounded-lg border border-rose-200 bg-rose-50 px-4 py-3 text-sm text-rose-700">{error}</div>}

            <fieldset disabled={isSaving} className="mt-7 grid gap-6 md:grid-cols-2">
              <ProfileField label="First name" icon={UserRound} editing={isEditing} value={editedUser.firstName} display={user.firstName} onChange={(value) => setEditedUser((current) => ({ ...current, firstName: value }))} />
              <ProfileField label="Last name" icon={UserRound} editing={isEditing} value={editedUser.lastName} display={user.lastName || 'Not added'} onChange={(value) => setEditedUser((current) => ({ ...current, lastName: value }))} />
              <ProfileField label="Email" icon={Mail} editing={isEditing} value={editedUser.email} display={user.email || 'Not added'} type="email" onChange={(value) => setEditedUser((current) => ({ ...current, email: value }))} />
              <ProfileField label="Phone" icon={Phone} editing={isEditing} value={editedUser.phoneNumber} display={user.phoneNumber || 'Not added'} onChange={(value) => setEditedUser((current) => ({ ...current, phoneNumber: value }))} />
            </fieldset>
          </form>

          <aside className="space-y-6">
            <section className="rounded-lg border border-border bg-background p-6">
              <p className="text-xs font-bold normal-case text-brand-green">Delivery</p>
              <h2 className="mt-2 text-lg font-normal text-brand-green">Registration address</h2>
              {address ? (
                <div className="mt-5 flex gap-3 text-sm font-normal leading-6 text-muted-foreground">
                  <MapPin className="mt-1 h-4 w-4 shrink-0 text-brand-green" />
                  <p>{[address.streetAddress, address.streetAddress2, address.town, address.city, address.state, address.postalCode].filter(Boolean).join(', ')}</p>
                </div>
              ) : (
                <p className="mt-5 text-sm font-normal leading-6 text-muted-foreground">Add your delivery address at checkout.</p>
              )}
            </section>

            <section className="rounded-lg bg-background p-6 text-foreground">
              <p className="text-xs font-bold normal-case text-brand-green">Account status</p>
              <div className="mt-5 space-y-4">
                <StatusRow label="Email" value={user.email ? (status.isEmailVerified ? 'Verified' : 'Verification pending') : 'Not added'} verified={Boolean(status.isEmailVerified)} />
                <StatusRow label="Phone" value={user.phoneNumber ? (status.isPhoneVerified ? 'Verified' : 'Verification pending') : 'Not added'} verified={Boolean(status.isPhoneVerified)} />
                <StatusRow label="Account" value={role.replace(/_/g, ' ')} verified />
              </div>
            </section>

            <section className="grid gap-2 sm:grid-cols-3 lg:grid-cols-1">
              <AccountLink href="/for-you" title="For You" copy="Personal picks and repeat reminders" />
              <AccountLink href="/orders" title="Orders" copy="Track and revisit your purchases" />
              <AccountLink href="/profile/messages" title="Messages" copy="Read updates from the FreshPick team" />
              <AccountLink href="/profile/notifications" title="Notifications" copy="Read FreshPick announcements and account updates" />
              <AccountLink href="/bags" title="Shopping bags" copy="Continue a saved or active bag" />
            </section>
          </aside>
        </div>
    </AccountPage>
  );
}

function ProfileField({ label, icon: Icon, editing, value, display, type = 'text', onChange }: { label: string; icon: typeof UserRound; editing: boolean; value: string; display: string; type?: string; onChange: (value: string) => void }) {
  const id = useId();
  return (
    <div>
      <Label htmlFor={id} className="flex items-center gap-2 text-xs font-semibold normal-case text-muted-foreground"><Icon className="h-3.5 w-3.5" /> {label}</Label>
      {editing ? <Input id={id} type={type} value={value} onChange={(event) => onChange(event.target.value)} className={`mt-2 ${inputClass} `} /> : <p className="mt-3 text-base text-foreground">{display}</p>}
    </div>
  );
}

function StatusRow({ label, value, verified }: { label: string; value: string; verified: boolean }) {
  return <div className="flex items-center justify-between gap-4 border-b border-border pb-4 last:border-0 last:pb-0"><span className="text-sm text-muted-foreground">{label}</span><span className={`text-xs font-medium capitalize ${verified ? 'text-brand-green' : 'text-muted-foreground'} `}>{value}</span></div>;
}

function AccountLink({ href, title, copy }: { href: string; title: string; copy: string }) {
  return <Link href={href} className="group rounded-lg border border-border bg-background p-4 transition-colors hover:border-border"><div className="flex items-center justify-between gap-3"><span className="text-sm font-semibold text-foreground">{title}</span><ArrowRight className="h-4 w-4 text-muted-foreground group-hover:text-brand-green" /></div><p className="mt-1 text-xs font-normal leading-5 text-muted-foreground">{copy}</p></Link>;
}
