import { CustomerSignupForm } from '@/components/auth/CustomerSignupForm';

export default async function CustomerSignupPage({ searchParams }: { searchParams: Promise<{ redirect?: string; callbackUrl?: string }> }) {
  const query = await searchParams;
  return <CustomerSignupForm requestedDestination={query.redirect || query.callbackUrl} />;
}
