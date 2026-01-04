'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogDescription } from '@/components/ui/dialog';
import { toast } from 'sonner';
import { Plus, MapPin, Edit2, Trash2, Home, Briefcase, GraduationCap, MoreHorizontal } from 'lucide-react';
import { Textarea } from '@/components/ui/textarea';

interface Address {
    _id: string;
    recipientName: string;
    streetAddress: string;
    streetAddress2?: string;
    town: string;
    city: string;
    state: string;
    postalCode: string;
    countryCode: string;
    phoneNumber: string;
    type: 'Home' | 'Business' | 'School' | 'Other';
}

export default function AddressesPage() {
    const { user, loading: authLoading } = useAuth();
    const router = useRouter();
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [isDialogOpen, setIsDialogOpen] = useState(false);
    const [editingAddress, setEditingAddress] = useState<Address | null>(null);
    const [formData, setFormData] = useState<Partial<Address>>({
        recipientName: '',
        streetAddress: '',
        streetAddress2: '',
        town: '',
        city: '',
        state: '',
        postalCode: '',
        countryCode: 'LK',
        phoneNumber: '',
        type: 'Home',
    });

    useEffect(() => {
        if (!authLoading && !user) {
            router.push('/auth/login');
            return;
        }
        if (user) {
            fetchAddresses();
        }
    }, [user, authLoading, router]);

    const fetchAddresses = async () => {
        setLoading(true);
        try {
            const res = await fetch('/api/profile/addresses');
            if (res.ok) {
                const data = await res.json();
                setAddresses(data.addresses || []);
            }
        } catch (error) {
            console.error('Error fetching addresses:', error);
            toast.error('Failed to load addresses');
        } finally {
            setLoading(false);
        }
    };

    const handleOpenDialog = (address?: Address) => {
        if (address) {
            setEditingAddress(address);
            setFormData(address);
        } else {
            setEditingAddress(null);
            setFormData({
                recipientName: user?.firstName ? `${user.firstName} ${user.lastName || ''}`.trim() : '',
                streetAddress: '',
                streetAddress2: '',
                town: '',
                city: '',
                state: '',
                postalCode: '',
                countryCode: 'LK',
                phoneNumber: user?.phoneNumber || '',
                type: 'Home',
            });
        }
        setIsDialogOpen(true);
    };

    const handleSave = async () => {
        try {
            // Basic validation
            if (!formData.recipientName || !formData.streetAddress || !formData.city || !formData.phoneNumber) {
                toast.error('Please fill in all required fields');
                return;
            }

            const url = editingAddress
                ? `/api/profile/addresses/${editingAddress._id}`
                : '/api/profile/addresses';

            const method = editingAddress ? 'PUT' : 'POST';

            const res = await fetch(url, {
                method,
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(formData),
            });

            if (!res.ok) {
                const error = await res.json();
                throw new Error(error.error || 'Failed to save address');
            }

            toast.success(editingAddress ? 'Address updated' : 'Address added');
            setIsDialogOpen(false);
            fetchAddresses();
        } catch (error) {
            toast.error(error instanceof Error ? error.message : 'Failed to save address');
        }
    };

    const handleDelete = async (id: string) => {
        if (!confirm("Are you sure you want to delete this address?")) return;
        try {
            const res = await fetch(`/api/profile/addresses/${id}`, {
                method: 'DELETE',
            });

            if (!res.ok) throw new Error('Failed to delete address');

            toast.success('Address deleted');
            fetchAddresses();
        } catch (error) {
            toast.error('Failed to delete address');
        }
    };

    const getTypeIcon = (type: string) => {
        switch (type) {
            case 'Home': return <Home className="w-4 h-4" />;
            case 'Business': return <Briefcase className="w-4 h-4" />;
            case 'School': return <GraduationCap className="w-4 h-4" />;
            default: return <MapPin className="w-4 h-4" />;
        }
    };

    if (authLoading || loading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-emerald-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="flex items-center justify-between mb-8">
                    <div>
                        <h1 className="text-3xl font-bold text-gray-900">My Addresses</h1>
                        <p className="mt-2 text-gray-600">Manage your delivery locations</p>
                    </div>
                    <Button onClick={() => handleOpenDialog()} className="bg-emerald-600 hover:bg-emerald-700">
                        <Plus className="w-4 h-4 mr-2" />
                        Add New Address
                    </Button>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {addresses.map((address) => (
                        <Card key={address._id} className="relative group hover:shadow-md transition-shadow">
                            <CardHeader className="flex flex-row items-start justify-between pb-2">
                                <div className="flex items-center gap-2">
                                    <span className="p-2 bg-emerald-50 rounded-full text-emerald-600">
                                        {getTypeIcon(address.type)}
                                    </span>
                                    <span className="font-semibold text-gray-900">{address.type}</span>
                                </div>
                                <div className="flex gap-2">
                                    <Button variant="ghost" size="icon" onClick={() => handleOpenDialog(address)}>
                                        <Edit2 className="w-4 h-4 text-gray-500" />
                                    </Button>
                                    <Button variant="ghost" size="icon" className="text-red-500 hover:text-red-700 hover:bg-red-50" onClick={() => handleDelete(address._id)}>
                                        <Trash2 className="w-4 h-4" />
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent>
                                <div className="text-sm text-gray-600 space-y-1">
                                    <p className="font-medium text-gray-900">{address.recipientName}</p>
                                    <p>{address.streetAddress}</p>
                                    {address.streetAddress2 && <p>{address.streetAddress2}</p>}
                                    <p>{address.city}, {address.town} {address.postalCode}</p>
                                    <p>{address.state}, {address.countryCode}</p>
                                    <p className="pt-2 flex items-center gap-2 text-gray-500">
                                        <span className="text-xs font-semibold uppercase tracking-wider">Phone:</span>
                                        {address.phoneNumber}
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    ))}

                    {addresses.length === 0 && (
                        <div className="col-span-full flex flex-col items-center justify-center p-12 bg-white rounded-lg border border-dashed border-gray-300">
                            <MapPin className="w-12 h-12 text-gray-300 mb-4" />
                            <h3 className="text-lg font-medium text-gray-900">No addresses found</h3>
                            <p className="text-gray-500 mb-4">Add your delivery address to get started.</p>
                            <Button onClick={() => handleOpenDialog()} variant="outline">
                                Add Address
                            </Button>
                        </div>
                    )}
                </div>

                <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
                    <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
                        <DialogHeader>
                            <DialogTitle>{editingAddress ? 'Edit Address' : 'Add New Address'}</DialogTitle>
                            <DialogDescription>
                                {editingAddress ? 'Update your delivery details below.' : 'Enter your new delivery address details.'}
                            </DialogDescription>
                        </DialogHeader>
                        <div className="grid gap-4 py-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>Recipient Name</Label>
                                    <Input
                                        value={formData.recipientName}
                                        onChange={(e) => setFormData({ ...formData, recipientName: e.target.value })}
                                        placeholder="John Doe"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Phone Number</Label>
                                    <Input
                                        value={formData.phoneNumber}
                                        onChange={(e) => setFormData({ ...formData, phoneNumber: e.target.value })}
                                        placeholder="+94 77 ..."
                                    />
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label>Address Type</Label>
                                <Select
                                    value={formData.type}
                                    onValueChange={(val: any) => setFormData({ ...formData, type: val })}
                                >
                                    <SelectTrigger>
                                        <SelectValue placeholder="Select type" />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value="Home">Home</SelectItem>
                                        <SelectItem value="Business">Business</SelectItem>
                                        <SelectItem value="School">School</SelectItem>
                                        <SelectItem value="Other">Other</SelectItem>
                                    </SelectContent>
                                </Select>
                            </div>

                            <div className="space-y-2">
                                <Label>Street Address</Label>
                                <Input
                                    value={formData.streetAddress}
                                    onChange={(e) => setFormData({ ...formData, streetAddress: e.target.value })}
                                    placeholder="123 Main St"
                                />
                            </div>

                            <div className="space-y-2">
                                <Label>Apartment, suite, etc. (optional)</Label>
                                <Input
                                    value={formData.streetAddress2}
                                    onChange={(e) => setFormData({ ...formData, streetAddress2: e.target.value })}
                                    placeholder="Apt 4B"
                                />
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div className="space-y-2">
                                    <Label>City</Label>
                                    <Input
                                        value={formData.city}
                                        onChange={(e) => setFormData({ ...formData, city: e.target.value })}
                                        placeholder="Colombo"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Town/Suburb</Label>
                                    <Input
                                        value={formData.town}
                                        onChange={(e) => setFormData({ ...formData, town: e.target.value })}
                                        placeholder="Kollupitiya"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-3 gap-4">
                                <div className="space-y-2">
                                    <Label>State/Province</Label>
                                    <Input
                                        value={formData.state}
                                        onChange={(e) => setFormData({ ...formData, state: e.target.value })}
                                        placeholder="Western"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Zip Code</Label>
                                    <Input
                                        value={formData.postalCode}
                                        onChange={(e) => setFormData({ ...formData, postalCode: e.target.value })}
                                        placeholder="00300"
                                    />
                                </div>
                                <div className="space-y-2">
                                    <Label>Country</Label>
                                    <Input
                                        value={formData.countryCode}
                                        disabled
                                        className="bg-gray-50"
                                    />
                                </div>
                            </div>
                        </div>
                        <DialogFooter>
                            <Button variant="outline" onClick={() => setIsDialogOpen(false)}>Cancel</Button>
                            <Button onClick={handleSave} className="bg-emerald-600 hover:bg-emerald-700">Save Address</Button>
                        </DialogFooter>
                    </DialogContent>
                </Dialog>
            </div>
        </div>
    );
}
