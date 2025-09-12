import { SupplierSignupForm } from '@/components/auth/SupplierSignupForm';

export default function SupplierSignupFromPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-3xl">
        <SupplierSignupForm />
      </div>
    </main>
  );
}
