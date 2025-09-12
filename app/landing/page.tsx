import Link from 'next/link';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';

export default function LandingPage() {
  return (
    <main className="min-h-screen flex items-center justify-center p-6">
      <div className="w-full max-w-4xl">
        <Card>
          <CardHeader>
            <CardTitle>Welcome to Fresh Pick</CardTitle>
            <CardDescription>Sell or buy fresh produce and goods from local suppliers.</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div className="p-6 border rounded-md text-center">
                <h3 className="text-2xl font-semibold mb-2">Register as a Customer</h3>
                <p className="text-sm text-gray-600 mb-4">Create an account to start shopping and manage your orders.</p>
                <Link href="/auth/signup" className="inline-block bg-blue-600 text-white px-4 py-2 rounded">Sign up as Customer</Link>
              </div>
              <div className="p-6 border rounded-md text-center">
                <h3 className="text-2xl font-semibold mb-2">Register as a Supplier</h3>
                <p className="text-sm text-gray-600 mb-4">Join as a supplier to list your products and manage inventory.</p>
                <Link href="/auth/supplier-signup" className="inline-block bg-green-600 text-white px-4 py-2 rounded">Sign up as Supplier</Link>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </main>
  );
}
