import { CustomerSignupForm } from '@/components/auth/CustomerSignupForm';

export default function CustomerSignupPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <CustomerSignupForm />
      </div>
    </main>
  );
}
