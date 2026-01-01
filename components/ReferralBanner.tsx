'use client';

import { useState, useEffect } from 'react';
import { Gift, X, Copy, Check, Share2, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { toast } from 'sonner';
import { useAuth } from '@/contexts/AuthContext';

interface ReferralData {
    code: string;
    totalEarnings: number;
    totalReferrals: number;
    successfulReferrals: number;
}

export default function ReferralBanner() {
    const [isOpen, setIsOpen] = useState(false);
    const [copied, setCopied] = useState(false);
    const [referralData, setReferralData] = useState<ReferralData | null>(null);
    const [showBanner, setShowBanner] = useState(false);
    const { user } = useAuth();

    useEffect(() => {
        // Show banner after 5 seconds
        const timer = setTimeout(() => setShowBanner(true), 5000);
        return () => clearTimeout(timer);
    }, []);

    useEffect(() => {
        // Fetch referral data when modal opens and user is logged in
        if (isOpen && user) {
            fetchReferralData();
        }
    }, [isOpen, user]);

    const fetchReferralData = async () => {
        try {
            const res = await fetch('/api/referrals');
            const data = await res.json();
            if (data.success) {
                setReferralData(data.referral);
            }
        } catch (error) {
            console.error('Error fetching referral data:', error);
            // Fallback to generated code if API fails
            setReferralData({
                code: 'FRESH' + Math.random().toString(36).substring(2, 8).toUpperCase(),
                totalEarnings: 0,
                totalReferrals: 0,
                successfulReferrals: 0,
            });
        }
    };

    const referralCode = referralData?.code || 'FRESHXXXXXX';


    const copyCode = () => {
        navigator.clipboard.writeText(referralCode);
        setCopied(true);
        toast.success('Referral code copied!');
        setTimeout(() => setCopied(false), 2000);
    };

    const shareViaWhatsApp = () => {
        const message = `🥬 Get Rs. 200 off your first order at Fresh Pick! Use my referral code: ${referralCode}\n\nShop now: ${window.location.origin}?ref=${referralCode}`;
        window.open(`https://wa.me/?text=${encodeURIComponent(message)}`, '_blank');
    };

    if (!showBanner) return null;

    return (
        <>
            {/* Referral Bar */}
            <div className="bg-gradient-to-r from-emerald-600 via-emerald-500 to-teal-600 text-white py-2 px-4">
                <div className="container mx-auto flex items-center justify-center gap-4 text-sm">
                    <Gift className="w-4 h-4 animate-bounce" />
                    <span className="font-medium">
                        Invite friends & earn Rs. 200 for each referral!
                    </span>
                    <button
                        onClick={() => setIsOpen(true)}
                        className="bg-white/20 hover:bg-white/30 px-3 py-1 rounded-full text-xs font-semibold transition-colors"
                    >
                        Share Now
                    </button>
                    <button onClick={() => setShowBanner(false)} className="ml-2 opacity-70 hover:opacity-100">
                        <X className="w-4 h-4" />
                    </button>
                </div>
            </div>

            {/* Referral Modal */}
            {isOpen && (
                <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/50 p-4">
                    <div className="bg-white rounded-2xl max-w-md w-full overflow-hidden animate-in zoom-in-95 duration-200">
                        {/* Header */}
                        <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6 text-white text-center relative">
                            <button
                                onClick={() => setIsOpen(false)}
                                className="absolute top-4 right-4 text-white/70 hover:text-white"
                            >
                                <X className="w-5 h-5" />
                            </button>
                            <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4">
                                <Gift className="w-8 h-8" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Invite Friends & Earn</h2>
                            <p className="text-amber-100 text-sm">
                                Share your code and both you and your friend get Rs. 200 off!
                            </p>
                        </div>

                        {/* Content */}
                        <div className="p-6">
                            {/* How it works */}
                            <div className="grid grid-cols-3 gap-4 mb-6">
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <span className="text-emerald-600 font-bold">1</span>
                                    </div>
                                    <p className="text-xs text-gray-600">Share your code</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <span className="text-emerald-600 font-bold">2</span>
                                    </div>
                                    <p className="text-xs text-gray-600">Friend orders</p>
                                </div>
                                <div className="text-center">
                                    <div className="w-10 h-10 bg-emerald-100 rounded-full flex items-center justify-center mx-auto mb-2">
                                        <span className="text-emerald-600 font-bold">3</span>
                                    </div>
                                    <p className="text-xs text-gray-600">Both earn Rs. 200</p>
                                </div>
                            </div>

                            {/* Referral Code */}
                            <div className="bg-gray-50 rounded-xl p-4 mb-4">
                                <p className="text-xs text-gray-500 uppercase tracking-wide mb-2">Your Referral Code</p>
                                <div className="flex items-center gap-2">
                                    <div className="flex-1 bg-white border-2 border-dashed border-emerald-300 rounded-lg py-3 px-4 text-center">
                                        <span className="text-xl font-bold text-emerald-600 tracking-wider">{referralCode}</span>
                                    </div>
                                    <button
                                        onClick={copyCode}
                                        className="p-3 bg-emerald-100 hover:bg-emerald-200 rounded-lg transition-colors"
                                    >
                                        {copied ? <Check className="w-5 h-5 text-green-600" /> : <Copy className="w-5 h-5 text-emerald-600" />}
                                    </button>
                                </div>
                            </div>

                            {/* Share Buttons */}
                            <div className="grid grid-cols-2 gap-3">
                                <Button
                                    onClick={shareViaWhatsApp}
                                    className="bg-green-500 hover:bg-green-600 text-white"
                                >
                                    <Share2 className="w-4 h-4 mr-2" />
                                    WhatsApp
                                </Button>
                                <Button
                                    onClick={copyCode}
                                    variant="outline"
                                    className="border-emerald-300 text-emerald-600 hover:bg-emerald-50"
                                >
                                    <Copy className="w-4 h-4 mr-2" />
                                    Copy Link
                                </Button>
                            </div>

                            {/* Stats */}
                            <div className="mt-6 pt-4 border-t flex items-center justify-center gap-6 text-sm text-gray-500">
                                <div className="flex items-center gap-2">
                                    <Users className="w-4 h-4" />
                                    <span>{referralData?.totalReferrals || 0} friends invited</span>
                                </div>
                                <div className="flex items-center gap-2">
                                    <Gift className="w-4 h-4" />
                                    <span>Rs. {referralData?.totalEarnings?.toLocaleString() || 0} earned</span>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </>
    );
}
