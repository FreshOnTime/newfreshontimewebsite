'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { Package, Calendar, MapPin, Clock, Pause, Play, X, Loader2, AlertCircle } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';

interface Subscription {
    _id: string;
    plan: {
        name: string;
        icon: string;
        price: number;
        frequency: string;
    };
    status: 'active' | 'paused' | 'cancelled';
    nextDeliveryDate: string;
    deliveryAddress: {
        fullName: string;
        addressLine1: string;
        city: string;
    };
    deliverySlot: {
        day: string;
        timeSlot: string;
    };
    totalDeliveries: number;
}

export default function MySubscriptionsPage() {
    const [subscriptions, setSubscriptions] = useState<Subscription[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [actionLoading, setActionLoading] = useState<string | null>(null);

    useEffect(() => {
        fetchSubscriptions();
    }, []);

    const fetchSubscriptions = async () => {
        try {
            const res = await fetch('/api/subscriptions');
            const data = await res.json();
            if (data.success) {
                setSubscriptions(data.subscriptions);
            }
        } catch (error) {
            console.error('Error fetching subscriptions:', error);
        } finally {
            setIsLoading(false);
        }
    };

    const handleAction = async (id: string, action: 'pause' | 'resume' | 'cancel' | 'skip') => {
        setActionLoading(id);
        try {
            const res = await fetch(`/api/subscriptions/${id}`, {
                method: 'PATCH',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ action }),
            });
            const data = await res.json();

            if (data.success) {
                toast.success(data.message);
                fetchSubscriptions();
            } else {
                toast.error(data.message);
            }
        } catch (error) {
            toast.error('Failed to update subscription');
        } finally {
            setActionLoading(null);
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            weekday: 'short',
            month: 'short',
            day: 'numeric',
        });
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'active': return 'bg-green-100 text-green-700';
            case 'paused': return 'bg-yellow-100 text-yellow-700';
            case 'cancelled': return 'bg-red-100 text-red-700';
            default: return 'bg-gray-100 text-gray-700';
        }
    };

    if (isLoading) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <Loader2 className="w-8 h-8 animate-spin text-emerald-600" />
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="container mx-auto px-4 max-w-4xl">
                <div className="flex items-center justify-between mb-8">
                    <h1 className="text-2xl font-bold text-gray-900">My Subscriptions</h1>
                    <Link href="/subscriptions">
                        <Button className="bg-emerald-600 hover:bg-emerald-700">
                            <Package className="w-4 h-4 mr-2" />
                            Browse Plans
                        </Button>
                    </Link>
                </div>

                {subscriptions.length === 0 ? (
                    <div className="bg-white rounded-2xl shadow-sm p-12 text-center">
                        <Package className="w-16 h-16 text-gray-300 mx-auto mb-4" />
                        <h2 className="text-xl font-semibold text-gray-900 mb-2">No Subscriptions Yet</h2>
                        <p className="text-gray-500 mb-6">
                            Subscribe to our curated boxes and get fresh groceries delivered weekly.
                        </p>
                        <Link href="/subscriptions">
                            <Button className="bg-emerald-600 hover:bg-emerald-700">
                                Explore Subscription Plans
                            </Button>
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-4">
                        {subscriptions.map((sub) => (
                            <div key={sub._id} className="bg-white rounded-2xl shadow-sm overflow-hidden">
                                {/* Header */}
                                <div className="p-6 border-b">
                                    <div className="flex items-start justify-between">
                                        <div className="flex items-center gap-4">
                                            <span className="text-4xl">{sub.plan.icon}</span>
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">{sub.plan.name}</h3>
                                                <p className="text-sm text-gray-500">
                                                    Rs. {sub.plan.price.toLocaleString()} / {sub.plan.frequency}
                                                </p>
                                            </div>
                                        </div>
                                        <span className={`px-3 py-1 rounded-full text-xs font-semibold capitalize ${getStatusColor(sub.status)}`}>
                                            {sub.status}
                                        </span>
                                    </div>
                                </div>

                                {/* Details */}
                                <div className="p-6 grid md:grid-cols-3 gap-4">
                                    <div className="flex items-start gap-3">
                                        <Calendar className="w-5 h-5 text-emerald-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Next Delivery</p>
                                            <p className="font-medium text-gray-900">
                                                {sub.status === 'active' ? formatDate(sub.nextDeliveryDate) : '-'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <MapPin className="w-5 h-5 text-emerald-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Delivery To</p>
                                            <p className="font-medium text-gray-900 truncate max-w-[180px]">
                                                {sub.deliveryAddress.addressLine1}, {sub.deliveryAddress.city}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <Clock className="w-5 h-5 text-emerald-600 mt-0.5" />
                                        <div>
                                            <p className="text-xs text-gray-500 uppercase tracking-wide">Total Deliveries</p>
                                            <p className="font-medium text-gray-900">{sub.totalDeliveries} deliveries</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Actions */}
                                {sub.status !== 'cancelled' && (
                                    <div className="px-6 pb-6 flex flex-wrap gap-2">
                                        {sub.status === 'active' && (
                                            <>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAction(sub._id, 'skip')}
                                                    disabled={actionLoading === sub._id}
                                                >
                                                    {actionLoading === sub._id ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Skip Next'}
                                                </Button>
                                                <Button
                                                    variant="outline"
                                                    size="sm"
                                                    onClick={() => handleAction(sub._id, 'pause')}
                                                    disabled={actionLoading === sub._id}
                                                >
                                                    <Pause className="w-4 h-4 mr-1" />
                                                    Pause
                                                </Button>
                                            </>
                                        )}
                                        {sub.status === 'paused' && (
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleAction(sub._id, 'resume')}
                                                disabled={actionLoading === sub._id}
                                                className="text-emerald-600 border-emerald-600 hover:bg-emerald-50"
                                            >
                                                <Play className="w-4 h-4 mr-1" />
                                                Resume
                                            </Button>
                                        )}
                                        <Button
                                            variant="ghost"
                                            size="sm"
                                            onClick={() => handleAction(sub._id, 'cancel')}
                                            disabled={actionLoading === sub._id}
                                            className="text-red-600 hover:bg-red-50"
                                        >
                                            <X className="w-4 h-4 mr-1" />
                                            Cancel
                                        </Button>
                                    </div>
                                )}

                                {/* Cancelled notice */}
                                {sub.status === 'cancelled' && (
                                    <div className="px-6 pb-6">
                                        <div className="flex items-center gap-2 text-sm text-gray-500">
                                            <AlertCircle className="w-4 h-4" />
                                            This subscription has been cancelled
                                        </div>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
