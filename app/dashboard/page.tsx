'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
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
      router.replace('/auth/login');
      return;
    }
    if (user.role === 'admin') {
      router.replace('/admin');
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-700" />
      </div>
    );
  }

  if (!user || user.role === 'admin') {
    return null; // Redirecting
  }

  const isSupplier = user.role === 'supplier';
  const title = isSupplier ? 'Supplier Dashboard' : 'My Account';

  const heading =
    section === 'overview'
      ? isSupplier
        ? 'Overview'
        : `Welcome back, ${user.firstName || 'there'}`
      : SECTION_LABELS[section] ?? 'Overview';

  const description =
    section === 'overview'
      ? isSupplier
        ? 'A snapshot of your catalog, stock, and recent uploads.'
        : "Here's an overview of your orders, deliveries, and saved items."
      : undefined;

  const renderSection = () => {
    if (isSupplier) {
      switch (section) {
        case 'products':
          return <UploadProducts />;
        case 'messages':
          return <MessageList />;
        case 'profile':
          return <ProfileCard />;
        default:
          return <SupplierDashboard />;
      }
    }
    // Customer
    switch (section) {
      case 'profile':
        return <ProfileCard />;
      default:
        return <CustomerDashboard />;
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <DashboardSidebar role={user.role} active={section} onSelect={setSection} title={title} />
      <div className="lg:pl-64">
        <DashboardHeader title={title} />
        <main className="p-6">
          <div className="space-y-6">
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-gray-900">{heading}</h1>
              {description && <p className="text-sm text-muted-foreground">{description}</p>}
            </div>
            {renderSection()}
          </div>
        </main>
      </div>
    </div>
  );
}
