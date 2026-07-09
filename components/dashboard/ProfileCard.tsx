'use client';

import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { useAuth } from '@/contexts/AuthContext';

export function ProfileCard() {
  const { user } = useAuth();

  const rows: { label: string; value?: string }[] = [
    { label: 'Name', value: [user?.firstName, user?.lastName].filter(Boolean).join(' ') },
    { label: 'Email', value: user?.email },
    { label: 'Phone', value: user?.phoneNumber },
    { label: 'Role', value: user?.role },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Profile Information</CardTitle>
      </CardHeader>
      <CardContent className="divide-y divide-gray-100">
        {rows.map(({ label, value }) => (
          <div key={label} className="flex flex-col gap-1 py-3 sm:flex-row sm:items-center sm:gap-4">
            <span className="w-28 shrink-0 text-sm font-semibold text-gray-500">{label}</span>
            <span className="text-sm text-gray-900">{value || '—'}</span>
          </div>
        ))}
      </CardContent>
    </Card>
  );
}
