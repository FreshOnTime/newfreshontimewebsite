'use client';

import { useAuth } from '@/contexts/AuthContext';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader } from '@/components/ui/card';

export default function AdminAccessPage() {
  const { user, loading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!loading) {
      if (!user) {
        router.push('/auth/login');
      } else if (user.role === 'admin') {
        // Automatically redirect admin users to admin dashboard
        router.push('/admin');
      }
    }
  }, [user, loading, router]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="font-serif text-3xl font-normal text-brand-green">Admin Access</h1>
          </CardHeader>
          <CardContent>
            <p className="mb-4">Please login to access the admin dashboard.</p>
            <Button onClick={() => router.push('/auth/login')} className="w-full">
              Login
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (user.role !== 'admin') {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <h1 className="font-serif text-3xl font-normal text-brand-green">Access Denied</h1>
          </CardHeader>
          <CardContent>
            <p className="mb-4">You don&apos;t have admin privileges.</p>
            <p className="text-sm text-muted-foreground mb-4">Current role: {user.role}</p>
            <Button onClick={() => router.push('/dashboard')} className="w-full">
              Go to Dashboard
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  // This should redirect automatically, but just in case
  return (
    <div className="min-h-screen flex items-center justify-center">
      <Card className="w-full max-w-md">
        <CardHeader>
          <h1 className="font-serif text-3xl font-normal text-brand-green">Admin Access</h1>
        </CardHeader>
        <CardContent>
          <p className="mb-4">Redirecting to admin dashboard...</p>
          <Button onClick={() => router.push('/admin')} className="w-full">
            Go to Admin Dashboard
          </Button>
        </CardContent>
      </Card>
    </div>
  );
}
