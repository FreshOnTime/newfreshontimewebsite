import { SignupForm } from '@/components/auth/SignupForm';

export default async function SignupPage({ searchParams }: { searchParams: Promise<{ redirect?: string; callbackUrl?: string }> }) {
  const query = await searchParams;
  return <SignupForm requestedDestination={query.redirect || query.callbackUrl} />;
}
