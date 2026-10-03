'use client';

import { useState, useEffect } from 'react';
import { X, Gift, Sparkles, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function FirstOrderPopup() {
    const [isOpen, setIsOpen] = useState(false);
    const [email, setEmail] = useState('');
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [error, setError] = useState('');

    useEffect(() => {
        const hasSeenPopup = localStorage.getItem('firstOrderPopupSeen');
        if (!hasSeenPopup) {
            const timer = setTimeout(() => setIsOpen(true), 8000);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleClose = () => {
        setIsOpen(false);
        localStorage.setItem('firstOrderPopupSeen', 'true');
    };

    const handleSubscribe = async () => {
        if (!email) return;
        setIsSubmitting(true);
        setError('');
        try {
            const response = await fetch('/api/newsletter', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, source: 'popup' }),
            });
            const data = await response.json().catch(() => ({}));
            if (!response.ok) throw new Error(data.error || 'Unable to subscribe right now.');

            localStorage.setItem('firstOrderEmail', email);
            localStorage.setItem('firstOrderPopupSeen', 'true');
            setIsOpen(false);
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Unable to subscribe right now.');
        } finally {
            setIsSubmitting(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 p-4 animate-in fade-in duration-300">
            <div className="relative bg-background rounded-lg max-w-lg w-full overflow-hidden shadow-sm animate-in zoom-in-95 duration-300">
                <button
                    onClick={handleClose}
                    className="absolute top-4 right-4 z-10 p-2 rounded-md bg-white/80 hover:bg-background text-muted-foreground hover:text-foreground transition-colors"
                >
                    <X className="w-5 h-5" />
                </button>

                <div className="flex flex-col md:flex-row">
                    <div className="md:w-2/5    p-8 flex flex-col items-center justify-center text-white">
                        <Sparkles className="w-12 h-12 mb-4 animate-pulse" />
                        <div className="text-5xl font-bold mb-2">15%</div>
                        <div className="text-lg font-semibold">OFF</div>
                        <div className="text-sm text-emerald-100 mt-2">Your First Order</div>
                    </div>

                    <div className="md:w-3/5 p-8">
                        <div className="inline-flex items-center gap-2 bg-amber-100 text-amber-700 px-3 py-1 rounded-full text-sm font-medium mb-4">
                            <Gift className="w-4 h-4" />
                            Welcome Offer
                        </div>

                        <h2 className="text-2xl font-normal text-foreground mb-2">Welcome to Fresh Pick! 🥬</h2>

                        <p className="text-muted-foreground mb-6">
                            Get 15% off your first order when you sign up for our newsletter. Plus, exclusive deals delivered to your inbox!
                        </p>

                        <div className="space-y-3 mb-4">
                            <input
                                type="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                placeholder="Enter your email"
                                required
                                className="w-full px-4 py-3 border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                            />
                            <Button
                                onClick={handleSubscribe}
                                disabled={isSubmitting || !email}
                                className="w-full bg-brand-leaf hover:bg-brand-leaf disabled:bg-brand-leaf text-brand-ink py-3 rounded-lg font-semibold"
                            >
                                {isSubmitting ? 'Joining…' : 'Get 15% Off'}
                                <ArrowRight className="w-4 h-4 ml-2" />
                            </Button>
                        </div>

                        {error && <p className="mb-3 text-sm text-red-600" role="alert">{error}</p>}

                        <p className="text-xs text-muted-foreground text-center">
                            Use code <span className="font-bold text-brand-green">WELCOME15</span> at checkout
                        </p>

                        <button
                            onClick={handleClose}
                            className="w-full text-center text-sm text-muted-foreground hover:text-muted-foreground mt-4"
                        >
                            No thanks, I&apos;ll pay full price
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
}
