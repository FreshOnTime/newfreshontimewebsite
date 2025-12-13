'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import type { ServerError } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';

export function SupplierSignupForm() {
  const [formData, setFormData] = useState({
    companyName: '',
    contactName: '',
    email: '',
    phoneNumber: '',
    password: '',
    confirmPassword: '',
    registrationAddress: {
      addressLine1: '',
      addressLine2: '',
      city: '',
      province: '',
      postalCode: '',
      country: 'Sri Lanka'
    }
  });

  const [isLoading, setIsLoading] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const [fieldErrors, setFieldErrors] = useState<Record<string, string[]> | null>(null);
  const router = useRouter();
  const { signup, refreshAuth } = useAuth();

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const handleAddressChange = (field: string, value: string) => {
    setFormData(prev => ({
      ...prev,
      registrationAddress: { ...prev.registrationAddress, [field]: value }
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (formData.password !== formData.confirmPassword) {
      alert('Passwords do not match');
      return;
    }

    // Reuse signup API for creating user account; supplier-specific data will be sent to supplier API after account created
    try {
      setIsLoading(true);
      setServerError(null);
      setFieldErrors(null);
      const signupData = {
        firstName: formData.contactName,
        lastName: undefined,
        email: formData.email || undefined,
        phoneNumber: formData.phoneNumber,
        password: formData.password,
        registrationAddress: formData.registrationAddress
      };

      await signup(signupData);

      // After signup, call supplier API to create supplier profile
      try {
        await fetch('/api/suppliers/register', {
          method: 'POST',
          credentials: 'include',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: formData.companyName,
            contactName: formData.contactName,
            address: formData.registrationAddress,
            email: formData.email,
            phone: formData.phoneNumber
          })
        });
        // Refresh auth so navbar and user role are updated
        try {
          await refreshAuth();
        } catch (refreshErr) {
          console.warn('Failed to refresh auth after supplier register', refreshErr);
        }
      } catch (e) {
        // Non-blocking: supplier creation can be completed later in admin
        console.error('Supplier profile creation failed', e);
      }
      router.push('/dashboard');
    } catch (e) {
      console.error('Supplier signup failed', e);
      if (e && typeof e === 'object') {
        const err = e as ServerError;
        if (err.fieldErrors) setFieldErrors(err.fieldErrors);
        if (err.message) setServerError(err.message || null);
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="w-full min-h-screen grid lg:grid-cols-2 bg-white dark:bg-zinc-900">
      {/* Left Side - Visual */}
      <div className="relative hidden lg:block h-full bg-zinc-900 sticky top-0 h-screen">
        <div className="absolute inset-0 bg-[url('/bgs/landing-page-bg-1.jpg')] bg-cover bg-center opacity-60 mix-blend-overlay"></div>
        <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/40 to-transparent"></div>
        <div className="relative h-full flex flex-col justify-end p-16 text-white">
          <h2 className="text-5xl font-serif font-bold mb-6">
            Partner with <span className="text-amber-400">Fresh On Time</span>
          </h2>
          <p className="text-zinc-300 text-xl leading-relaxed max-w-md">
            Join our network of trusted suppliers. Reach thousands of customers and grow your business with our dedicated support.
          </p>
        </div>
      </div>

      {/* Right Side - Form */}
      <div className="flex flex-col justify-center p-8 md:p-12 lg:p-16 w-full max-w-2xl mx-auto">
        <div className="mb-8 text-center lg:text-left">
          <h1 className="text-3xl font-bold text-zinc-900 dark:text-white mb-2">Supplier Registration</h1>
          <p className="text-zinc-500 dark:text-zinc-400">Enter your business details to apply.</p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="space-y-2">
            <Label htmlFor="companyName" className="text-zinc-700 dark:text-zinc-300">Company Name *</Label>
            <Input id="companyName" value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} required className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-emerald-500 rounded-xl" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName" className="text-zinc-700 dark:text-zinc-300">Contact Person *</Label>
            <Input id="contactName" value={formData.contactName} onChange={(e) => handleInputChange('contactName', e.target.value)} required className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-emerald-500 rounded-xl" />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-zinc-700 dark:text-zinc-300">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-emerald-500 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone" className="text-zinc-700 dark:text-zinc-300">Phone *</Label>
              <Input id="phone" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} required className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-emerald-500 rounded-xl" />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password" className="text-zinc-700 dark:text-zinc-300">Password *</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-emerald-500 rounded-xl" />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword" className="text-zinc-700 dark:text-zinc-300">Confirm Password *</Label>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} required className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-emerald-500 rounded-xl" />
            </div>
          </div>

          <div className="pt-4 border-t border-zinc-100 dark:border-zinc-800">
            <h3 className="text-lg font-medium text-zinc-900 dark:text-white mb-4">Business Address</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label className="text-zinc-700 dark:text-zinc-300">Address Line 1 *</Label>
                <Input value={formData.registrationAddress.addressLine1} onChange={(e) => handleAddressChange('addressLine1', e.target.value)} required className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-emerald-500 rounded-xl" />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-zinc-700 dark:text-zinc-300">City *</Label>
                  <Input value={formData.registrationAddress.city} onChange={(e) => handleAddressChange('city', e.target.value)} required className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-emerald-500 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label className="text-zinc-700 dark:text-zinc-300">Province *</Label>
                  <Input value={formData.registrationAddress.province} onChange={(e) => handleAddressChange('province', e.target.value)} required className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-emerald-500 rounded-xl" />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-zinc-700 dark:text-zinc-300">Postal Code *</Label>
                <Input value={formData.registrationAddress.postalCode} onChange={(e) => handleAddressChange('postalCode', e.target.value)} required className="bg-zinc-50 dark:bg-zinc-800 border-zinc-200 dark:border-zinc-700 focus:ring-emerald-500 rounded-xl" />
              </div>
            </div>
          </div>

          <div className="space-y-2 pt-4">
            <Label className="text-zinc-700 dark:text-zinc-300">Product List (CSV of SKUs or names)</Label>
            <textarea
              className="w-full min-h-[80px] p-3 rounded-xl bg-zinc-50 dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 focus:ring-emerald-500 text-sm"
              placeholder="E.g. Bananas, Apples, Milk..."
            />
            <p className="text-xs text-zinc-500">You can add products later from your dashboard.</p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full h-12 text-lg bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl shadow-lg shadow-emerald-600/20 transition-all hover:scale-[1.02]">
            {isLoading ? 'Processing...' : 'Submit Application'}
          </Button>

          {serverError && <p className="text-sm text-red-600 text-center bg-red-50 p-3 rounded-lg">{serverError}</p>}
          {fieldErrors && Object.keys(fieldErrors).map((k) => (
            <div key={k} className="text-sm text-red-600 text-center">
              {k}: {fieldErrors[k]?.join(', ')}
            </div>
          ))}
        </form>
      </div>
    </div>
  );
}
