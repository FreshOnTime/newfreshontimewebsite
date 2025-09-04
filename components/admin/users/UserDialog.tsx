'use client';

import { useEffect, useMemo, useState } from 'react';
import { Dialog, DialogContent, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { toast } from 'sonner';

type IUser = {
  _id?: string;
  userId?: string;
  firstName: string;
  lastName?: string;
  email?: string;
  phoneNumber: string;
  role: string;
  isBanned?: boolean;
  isEmailVerified?: boolean;
  registrationAddress: {
    recipientName: string;
    streetAddress: string;
    streetAddress2?: string;
    town: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
    phoneNumber: string;
    type: 'Home' | 'Business' | 'School' | 'Other';
  };
};

export function UserDialog({ open, onOpenChange, user, onSave, readOnly }: { open: boolean; onOpenChange: (v: boolean) => void; user?: Partial<IUser>; onSave: () => void; readOnly?: boolean; }) {
  const [form, setForm] = useState<IUser>({
    firstName: '',
    lastName: '',
    email: '',
    phoneNumber: '',
    role: 'customer',
    isBanned: false,
    isEmailVerified: false,
    registrationAddress: {
      recipientName: '',
      streetAddress: '',
      streetAddress2: '',
      town: '',
      city: '',
      state: '',
      postalCode: '',
      countryCode: 'LK',
      phoneNumber: '',
      type: 'Home',
    }
  });
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    if (user) setForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? '',
      role: user.role ?? 'customer',
      isBanned: user.isBanned ?? false,
      isEmailVerified: user.isEmailVerified ?? false,
      registrationAddress: user.registrationAddress ?? form.registrationAddress,
      _id: user._id,
      userId: user.userId,
    });
    else setForm((f) => ({ ...f, firstName: '', lastName: '', email: '', phoneNumber: '' }));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user, open]);

  const roles = useMemo(() => [
    'customer', 'admin', 'manager', 'delivery_staff', 'customer_support', 'marketing_specialist', 'order_processor', 'inventory_manager'
  ], []);

  const submit = async () => {
    if (readOnly) return onOpenChange(false);
    setSaving(true);
    try {
      const payload = { ...form };
      const res = await fetch(form._id ? `/api/admin/users/${form._id}` : '/api/admin/users', {
        method: form._id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });
      if (!res.ok) throw new Error('Save failed');
      toast.success('User saved');
      onSave();
    } catch (e) {
      console.error(e);
      toast.error('Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl">
        <DialogHeader>
          <DialogTitle>{readOnly ? 'View User' : form._id ? 'Edit User' : 'Add User'}</DialogTitle>
        </DialogHeader>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div>
            <Label>First name</Label>
            <Input value={form.firstName} onChange={(e) => setForm({ ...form, firstName: e.target.value })} disabled={!!readOnly} />
          </div>
          <div>
            <Label>Last name</Label>
            <Input value={form.lastName} onChange={(e) => setForm({ ...form, lastName: e.target.value })} disabled={!!readOnly} />
          </div>
          <div>
            <Label>Email</Label>
            <Input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} disabled={!!readOnly} />
          </div>
          <div>
            <Label>Phone number</Label>
            <Input value={form.phoneNumber} onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })} disabled={!!readOnly} />
          </div>
          <div>
            <Label>Role</Label>
            <select className="border rounded-md px-3 py-2 w-full" value={form.role} disabled={!!readOnly}
              onChange={(e) => setForm({ ...form, role: e.target.value })}>
              {roles.map(r => <option key={r} value={r}>{r}</option>)}
            </select>
          </div>
          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.isEmailVerified} disabled={!!readOnly}
                onChange={(e) => setForm({ ...form, isEmailVerified: e.target.checked })} />
              Email verified
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input type="checkbox" checked={!!form.isBanned} disabled={!!readOnly}
                onChange={(e) => setForm({ ...form, isBanned: e.target.checked })} />
              Banned
            </label>
          </div>

          <div className="md:col-span-2 pt-2">
            <h4 className="font-medium mb-2">Registration address</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              <div>
                <Label>Recipient name</Label>
                <Input value={form.registrationAddress.recipientName}
                  onChange={(e) => setForm({ ...form, registrationAddress: { ...form.registrationAddress, recipientName: e.target.value } })}
                  disabled={!!readOnly} />
              </div>
              <div>
                <Label>Phone</Label>
                <Input value={form.registrationAddress.phoneNumber}
                  onChange={(e) => setForm({ ...form, registrationAddress: { ...form.registrationAddress, phoneNumber: e.target.value } })}
                  disabled={!!readOnly} />
              </div>
              <div className="md:col-span-2">
                <Label>Street</Label>
                <Input value={form.registrationAddress.streetAddress}
                  onChange={(e) => setForm({ ...form, registrationAddress: { ...form.registrationAddress, streetAddress: e.target.value } })}
                  disabled={!!readOnly} />
              </div>
              <div>
                <Label>Town</Label>
                <Input value={form.registrationAddress.town}
                  onChange={(e) => setForm({ ...form, registrationAddress: { ...form.registrationAddress, town: e.target.value } })}
                  disabled={!!readOnly} />
              </div>
              <div>
                <Label>City</Label>
                <Input value={form.registrationAddress.city}
                  onChange={(e) => setForm({ ...form, registrationAddress: { ...form.registrationAddress, city: e.target.value } })}
                  disabled={!!readOnly} />
              </div>
              <div>
                <Label>State</Label>
                <Input value={form.registrationAddress.state}
                  onChange={(e) => setForm({ ...form, registrationAddress: { ...form.registrationAddress, state: e.target.value } })}
                  disabled={!!readOnly} />
              </div>
              <div>
                <Label>Postal code</Label>
                <Input value={form.registrationAddress.postalCode}
                  onChange={(e) => setForm({ ...form, registrationAddress: { ...form.registrationAddress, postalCode: e.target.value } })}
                  disabled={!!readOnly} />
              </div>
              <div>
                <Label>Country</Label>
                <Input value={form.registrationAddress.countryCode}
                  onChange={(e) => setForm({ ...form, registrationAddress: { ...form.registrationAddress, countryCode: e.target.value.toUpperCase().slice(0,2) } })}
                  disabled={!!readOnly} />
              </div>
              <div>
                <Label>Type</Label>
                <select className="border rounded-md px-3 py-2 w-full" value={form.registrationAddress.type}
                  disabled={!!readOnly}
                  onChange={(e) => setForm({ ...form, registrationAddress: { ...form.registrationAddress, type: e.target.value as 'Home' | 'Business' | 'School' | 'Other' } })}>
                  <option>Home</option>
                  <option>Business</option>
                  <option>School</option>
                  <option>Other</option>
                </select>
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>Close</Button>
          {!readOnly && (
            <Button onClick={submit} disabled={saving}>{form._id ? 'Save changes' : 'Create user'}</Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
