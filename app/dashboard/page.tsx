'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Loader2 } from 'lucide-react';
import { useAuth } from '@/contexts/AuthContext';
import { DashboardSidebar } from '@/components/dashboard/DashboardSidebar';
import { DashboardHeader } from '@/components/dashboard/DashboardHeader';
import { ProfileCard } from '@/components/dashboard/ProfileCard';
import SupplierDashboard from '@/components/supplier/SupplierDashboard';
import CustomerDashboard from '@/components/customer/CustomerDashboard';
import UploadProducts from '@/components/supplier/UploadProducts';
import MessageList from '@/components/supplier/MessageList';

const SECTION_LABELS: Record<string, string> = {
  overview: 'Overview',
  products: 'Products',
  messages: 'Messages',
  profile: 'Profile',
};

export default function DashboardPage() {
  const { user, loading } = useAuth();
  const router = useRouter();
  const [section, setSection] = useState('overview');

  useEffect(() => {
    if (loading) return;
    if (!user) {
      router.replace('/auth/login?redirect=/dashboard');
      return;
    }
    if (user.role === 'admin') router.replace('/admin');
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-background">
        <div className="flex items-center gap-3 text-sm text-muted-foreground"><Loader2 className="h-4 w-4 animate-spin" /> Loading your FreshPick workspace…</div>
      </div>
    );
  }

  if (!user || user.role === 'admin') return null;

  const isSupplier = user.role === 'supplier';
  const title = isSupplier ? 'Supplier workspace' : 'Your account';
  const heading = section === 'overview'
    ? isSupplier ? 'Overview' : `Welcome back, ${user.firstName || 'there'}.`
    : SECTION_LABELS[section] ?? 'Overview';
  const description = section === 'overview'
    ? isSupplier
      ? 'Manage your products, stock and recent sales.'
      : 'Find your recent orders, saved bags and upcoming deliveries.'
    : undefined;

  const renderSection = () => {
    if (isSupplier) {
      switch (section) {
        case 'products': return <UploadProducts />;
        case 'messages': return <MessageList />;
        case 'profile': return <ProfileCard />;
        default: return <SupplierDashboard />;
      }
    }
    if (section === 'profile') return <ProfileCard />;
    return <CustomerDashboard />;
  };

  return (
    <div className="min-h-screen bg-background text-foreground">
      <DashboardSidebar role={user.role} active={section} onSelect={setSection} title={title} />
      <div className="lg:pl-64">
        <DashboardHeader title={title} />
        <div className="px-5 py-8 md:px-7 md:py-10 lg:px-10 lg:py-6">
          <div className="mx-auto max-w-7xl space-y-8">
            <header className="border-b border-border pb-6">
              <p className="text-xs font-bold normal-case text-brand-green">{isSupplier ? 'Partner operations' : 'Account home'}</p>
              <h1 className="mt-3 font-serif text-3xl font-normal leading-tight text-brand-green md:text-4xl">{heading}</h1>
              {description && <p className="mt-4 max-w-2xl text-sm font-normal leading-7 text-muted-foreground">{description}</p>}
            </header>
            {renderSection()}
          </div>
        </div>
      </div>
    </div>
  );
}
