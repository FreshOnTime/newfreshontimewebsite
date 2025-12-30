'use client';

import { useState, useEffect } from 'react';
import { X, Gift, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';
import Link from 'next/link';

export default function FirstOrderPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');

    useEffect(() => {
        // Check if user has seen the popup before
        const hasSeenPopup = localStorage.getItem('firstOrderPopupSeen');
        if (!hasSeenPopup) {
            // Show popup after 8 seconds
            const timer = setTimeout(() => setIsOpen(true), 8000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('firstOrderPopupSeen', 'true');
    };

    const handleSubscribe = () => {
        if (email) {
            // Save email for newsletter
            localStorage.setItem('firstOrderEmail', email);
            localStorage.setItem('firstOrderPopupSeen', 'true');
            setIsOpen(false);
            // Could also send to API here
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300">
            <div className="relative bg-white rounded-2xl max-w-lg w-full overflow-hidden shadow-2xl animate-in zoom-in-95 duration-300">
                {/* Close Button */}
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-full bg-white/80 hover:bg-white text-gray-600 hover:text-gray-900 transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col md:flex-row">
                    {/* Image Side */}
                    <div className="md:w-2/5 bg-gradient-to-br from-emerald-500 to-teal-600 p-8 flex flex-col items-center justify-center text-white">
                        <Sparkles className="w-12 h-12 mb-4 animate-pulse" />
                        <div className="text-5xl font-bold mb-2">15%</div>
                        <div className="text-lg font-semibold">OFF</div>
                        <div className="text-sm text-emerald-100 mt-2">Your First Order</div>
                    </div>

                    {/* Content Side */}
                    <div className="md:w-3/5 p-8">
                        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                            <Gift className="w-4 h-4" />
                            Welcome Offer
                        </div>

                        <h2 className="text-2xl font-bold text-gray-900 mb-2">
                            Welcome to Fresh Pick! 🥬
                        </h2>

                        <p className="text-gray-600 mb-6">
                            Get 15% off your first order when you sign up for our newsletter.
                            Plus, exclusive deals delivered to your inbox!
                        </p>

                        {/* Email Input */}
                        <div className="space-y-3 mb-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                className="w-full px-4 py-3 border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-emerald-500"
                            />
                            <Button
                                onClick={handleSubscribe}
                                className="w-full bg-emerald-600 hover:bg-emerald-700 text-white py-3 rounded-xl font-semibold"
                            >
                                Get 15% Off
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>

                        <p className="text-xs text-gray-500 text-center">
                            Use code <span className="font-bold text-emerald-600">WELCOME15</span> at checkout
                        </p>

                        {/* Skip Link */}
                        <button
                            onClick={handleClose}
                            className="w-full text-center text-sm text-gray-400 hover:text-gray-600 mt-4"
                        >
                            No thanks, I'll pay full price
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
