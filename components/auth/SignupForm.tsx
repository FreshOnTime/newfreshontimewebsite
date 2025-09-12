'use client';

// ...existing code... (no imports from card needed for selector UI)
import Link from 'next/link';

export function SignupForm() {
  return (
    <div className="w-full max-w-2xl mx-auto">
      <div className="bg-gradient-to-r from-white to-slate-50 dark:from-slate-800 dark:to-slate-900 rounded-xl shadow-lg p-8">
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Create an account</h2>
            <p className="text-sm text-muted-foreground">Choose the account type to get started — you can switch later.</p>
          </div>
        
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <Link href="/auth/signup/customer" className="block">
            <button className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-lg shadow hover:scale-[1.01] transition">Sign up as Customer</button>
          </Link>

          <Link href="/auth/signup/supplier" className="block">
            <button className="w-full bg-gradient-to-r from-green-600 to-green-500 text-white py-4 rounded-lg shadow hover:scale-[1.01] transition">Sign up as Supplier</button>
          </Link>
        </div>

        <div className="mt-8 grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-center">
            <h4 className="font-semibold">Fast delivery</h4>
            <p className="text-sm text-muted-foreground">Fresh groceries delivered to your door within hours.</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-center">
            <h4 className="font-semibold">Trusted suppliers</h4>
            <p className="text-sm text-muted-foreground">We vet suppliers to ensure quality and reliability.</p>
          </div>
          <div className="p-4 bg-white dark:bg-slate-800 rounded-lg shadow-sm text-center">
            <h4 className="font-semibold">Easy returns</h4>
            <p className="text-sm text-muted-foreground">Hassle-free returns and refunds when needed.</p>
          </div>
        </div>

        <div className="text-center text-sm mt-6">
          Already have an account?{' '}
          <Link href="/auth/login" className="text-green-600 hover:underline">Login</Link>
        </div>
      </div>
    </div>
  );
}
