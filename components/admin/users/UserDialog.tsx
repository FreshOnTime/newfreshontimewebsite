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
  lastName?: string | null;
  email?: string | null;
  phoneNumber?: string | null;
  role: string;
  isBanned?: boolean;
  isEmailVerified?: boolean;
};

const emptyUser: IUser = {
  firstName: '',
  lastName: '',
  email: '',
  phoneNumber: '',
  role: 'customer',
  isBanned: false,
  isEmailVerified: false,
};

export function UserDialog({
  open,
  onOpenChange,
  user,
  onSave,
  readOnly,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  user?: Partial<IUser>;
  onSave: () => void;
  readOnly?: boolean;
}) {
  const [form, setForm] = useState<IUser>(emptyUser);
  const [password, setPassword] = useState('');
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setPassword('');
    if (!user) {
      setForm(emptyUser);
      return;
    }

    setForm({
      firstName: user.firstName ?? '',
      lastName: user.lastName ?? '',
      email: user.email ?? '',
      phoneNumber: user.phoneNumber ?? '',
      role: user.role ?? 'customer',
      isBanned: user.isBanned ?? false,
      isEmailVerified: user.isEmailVerified ?? false,
      _id: user._id,
      userId: user.userId,
    });
  }, [user, open]);

  const roles = useMemo(
    () => [
      'customer',
      'supplier',
      'admin',
      'manager',
      'delivery_staff',
      'customer_support',
      'marketing_specialist',
      'order_processor',
      'inventory_manager',
    ],
    []
  );

  const submit = async () => {
    if (readOnly) {
      onOpenChange(false);
      return;
    }

    if (!form.firstName.trim()) {
      toast.error('First name is required');
      return;
    }
    if (!form.email?.trim() && !form.phoneNumber?.trim()) {
      toast.error('Add an email address or phone number');
      return;
    }
    if (!form._id && password.length < 8) {
      toast.error('New users need a password of at least 8 characters');
      return;
    }
    if (password && password.length < 8) {
      toast.error('Password must be at least 8 characters');
      return;
    }

    setSaving(true);
    try {
      const payload = {
        firstName: form.firstName.trim(),
        lastName: form.lastName?.trim() || '',
        email: form.email?.trim() || null,
        phoneNumber: form.phoneNumber?.trim() || null,
        role: form.role,
        isBanned: !!form.isBanned,
        isEmailVerified: !!form.isEmailVerified,
        ...(password ? { password } : {}),
      };

      const res = await fetch(form._id ? `/api/admin/users/${form._id}` : '/api/admin/users', {
        method: form._id ? 'PATCH' : 'POST',
        headers: { 'Content-Type': 'application/json' },
        credentials: 'include',
        body: JSON.stringify(payload),
      });

      const response = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(response.error || 'Unable to save user');

      toast.success(form._id ? 'User updated' : 'User created');
      onSave();
    } catch (error) {
      console.error(error);
      toast.error(error instanceof Error ? error.message : 'Failed to save user');
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl">
        <DialogHeader>
          <DialogTitle>{readOnly ? 'View user' : form._id ? 'Edit user' : 'Add user'}</DialogTitle>
        </DialogHeader>

        {form._id && (
          <p className="break-all text-sm text-muted-foreground">
            Account ID: <span className="select-all">{form._id}</span>
          </p>
        )}

        <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
          <div>
            <Label htmlFor="admin-user-first-name">First name</Label>
            <Input
              id="admin-user-first-name"
              value={form.firstName}
              onChange={(e) => setForm({ ...form, firstName: e.target.value })}
              disabled={!!readOnly}
            />
          </div>
          <div>
            <Label htmlFor="admin-user-last-name">Last name</Label>
            <Input
              id="admin-user-last-name"
              value={form.lastName ?? ''}
              onChange={(e) => setForm({ ...form, lastName: e.target.value })}
              disabled={!!readOnly}
            />
          </div>
          <div>
            <Label htmlFor="admin-user-email">Email</Label>
            <Input
              id="admin-user-email"
              type="email"
              value={form.email ?? ''}
              onChange={(e) => setForm({ ...form, email: e.target.value })}
              disabled={!!readOnly}
            />
          </div>
          <div>
            <Label htmlFor="admin-user-phone">Phone number</Label>
            <Input
              id="admin-user-phone"
              value={form.phoneNumber ?? ''}
              onChange={(e) => setForm({ ...form, phoneNumber: e.target.value })}
              disabled={!!readOnly}
            />
          </div>
          <div>
            <Label htmlFor="admin-user-role">Role</Label>
            <select
              id="admin-user-role"
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              value={form.role}
              disabled={!!readOnly}
              onChange={(e) => setForm({ ...form, role: e.target.value })}
            >
              {roles.map((role) => (
                <option key={role} value={role}>
                  {role.replaceAll('_', ' ')}
                </option>
              ))}
            </select>
          </div>

          {!readOnly && (
            <div>
              <Label htmlFor="admin-user-password">{form._id ? 'New password' : 'Password'}</Label>
              <Input
                id="admin-user-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder={form._id ? 'Leave blank to keep current password' : 'Minimum 8 characters'}
              />
            </div>
          )}

          <div className="flex items-center gap-5 md:col-span-2">
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.isEmailVerified}
                disabled={!!readOnly}
                onChange={(e) => setForm({ ...form, isEmailVerified: e.target.checked })}
              />
              Email verified
            </label>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={!!form.isBanned}
                disabled={!!readOnly}
                onChange={(e) => setForm({ ...form, isBanned: e.target.checked })}
              />
              Banned
            </label>
          </div>
        </div>

        {!readOnly && (
          <p className="text-xs text-muted-foreground">
            Changing a password signs that user out of existing refresh-token sessions. Accounts with related orders may be banned instead of deleted.
          </p>
        )}

        <DialogFooter>
          <Button variant="outline" onClick={() => onOpenChange(false)}>
            Close
          </Button>
          {!readOnly && (
            <Button onClick={submit} disabled={saving}>
              {saving ? 'Saving...' : form._id ? 'Save changes' : 'Create user'}
            </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
