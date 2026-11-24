import { CustomerSignupForm } from '@/components/auth/CustomerSignupForm';

export default async function CustomerSignupPage({ searchParams }: { searchParams: Promise<{ redirect?: string; callbackUrl?: string }> }) {
  const query = await searchParams;
  return <CustomerSignupForm managed={process.env.FRESHPICK_SUPABASE_AUTH === 'true'} requestedDestination={query.redirect || query.callbackUrl} />;
}
