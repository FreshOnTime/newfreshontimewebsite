import { redirect } from 'next/navigation';
import { SupplierSignupForm } from '@/components/auth/SupplierSignupForm';

export default async function SupplierSignupPage({ searchParams }: { searchParams: Promise<{ catalogue?: string }> }) {
  if ((await searchParams).catalogue !== '1') redirect('/supply');
  return <SupplierSignupForm />;
}
