'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
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
  const router = useRouter();
  const { signup } = useAuth();

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
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            companyName: formData.companyName,
            contactName: formData.contactName,
            address: formData.registrationAddress,
            email: formData.email,
            phone: formData.phoneNumber
          })
        });
      } catch (e) {
        // Non-blocking: supplier creation can be completed later in admin
        console.error('Supplier profile creation failed', e);
      }

      router.push('/dashboard');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Card className="w-full max-w-2xl mx-auto">
      <CardHeader>
        <CardTitle>Supplier Sign Up</CardTitle>
        <CardDescription>Create a supplier account to list products</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="companyName">Company Name *</Label>
            <Input id="companyName" value={formData.companyName} onChange={(e) => handleInputChange('companyName', e.target.value)} required />
          </div>

          <div className="space-y-2">
            <Label htmlFor="contactName">Contact Person *</Label>
            <Input id="contactName" value={formData.contactName} onChange={(e) => handleInputChange('contactName', e.target.value)} required />
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="email">Email</Label>
              <Input id="email" type="email" value={formData.email} onChange={(e) => handleInputChange('email', e.target.value)} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="phone">Phone *</Label>
              <Input id="phone" value={formData.phoneNumber} onChange={(e) => handleInputChange('phoneNumber', e.target.value)} required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="password">Password *</Label>
              <Input id="password" type="password" value={formData.password} onChange={(e) => handleInputChange('password', e.target.value)} required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirmPassword">Confirm Password *</Label>
              <Input id="confirmPassword" type="password" value={formData.confirmPassword} onChange={(e) => handleInputChange('confirmPassword', e.target.value)} required />
            </div>
          </div>

          <div className="border-t pt-4">
            <h3 className="text-lg font-medium mb-3">Business Address</h3>
            <div className="space-y-4">
              <div className="space-y-2">
                <Label>Address Line 1 *</Label>
                <Input value={formData.registrationAddress.addressLine1} onChange={(e) => handleAddressChange('addressLine1', e.target.value)} required />
              </div>
              <div className="space-y-2">
                <Label>City *</Label>
                <Input value={formData.registrationAddress.city} onChange={(e) => handleAddressChange('city', e.target.value)} required />
              </div>
            </div>
          </div>

          <div className="space-y-2">
            <Label>Product List (CSV of SKUs or names)</Label>
            <p className="text-sm text-muted-foreground">You can add products later from your dashboard. No need to provide them now.</p>
          </div>

          <Button type="submit" disabled={isLoading} className="w-full">{isLoading ? 'Registering…' : 'Register as Supplier'}</Button>
        </form>
      </CardContent>
    </Card>
  );
}
