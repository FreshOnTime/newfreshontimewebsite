'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Phone } from 'lucide-react';
import { usePathname } from 'next/navigation';
import { WHATSAPP_NUMBER } from '@/lib/config/site';

export default function WhatsAppButton() {
    const pathname = usePathname();
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');

    // Keep the premium homepage free of floating chat UI and hide it in admin.
    // Support remains available on deeper customer-facing pages where it is
    // more contextual and less distracting from the main shopping experience.
    if (!WHATSAPP_NUMBER || pathname === '/' || pathname?.startsWith('/admin') || pathname?.startsWith('/auth')) {
        return null;
    }

    const phoneNumber = WHATSAPP_NUMBER;
    const defaultMessages = [
        'Hi! I want to place an order 🛒',
        'I have a question about delivery 🚚',
        'I need help with my subscription 📦',
        'I want to know about your products 🥬',
    ];

    const sendMessage = (text: string) => {
        const encodedMessage = encodeURIComponent(text || message);
        window.open(`https://wa.me/${phoneNumber}?text=${encodedMessage}`, '_blank');
        setIsOpen(false);
    };

    return (
        <>
            {/* Floating Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-20 md:bottom-6 right-6 z-50 w-14 h-14 bg-brand-leaf hover:bg-brand-leaf rounded-full shadow-none flex items-center justify-center transition-all duration-300  group"
                aria-label="Contact via WhatsApp"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-brand-ink" />
                ) : (
                    <>
                        <MessageCircle className="w-7 h-7 text-brand-ink" />
                        {/* Pulse Animation */}

                    </>
                )}
            </button>

            {/* Chat Popup */}
            {isOpen && (
                <div className="fixed bottom-36 md:bottom-24 right-6 z-50 w-[calc(100vw-3rem)] max-w-80 border border-border bg-background rounded-lg shadow-sm overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-brand-green p-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Fresh Pick Support</h3>
                                <p className="text-xs text-white/85">Contact our team</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <p className="text-sm text-muted-foreground mb-4">
                            How can we help?
                        </p>

                        {/* Quick Messages */}
                        <div className="space-y-2 mb-4">
                            {defaultMessages.map((msg, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(msg)}
                                    className="w-full text-left text-sm px-3 py-2 bg-background hover:bg-secondary rounded-lg border border-border hover:border-border transition-colors"
                                >
                                    {msg}
                                </button>
                            ))}
                        </div>

                        {/* Custom Message */}
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={message}
                                onChange={(e) => setMessage(e.target.value)}
                                placeholder="Type a message..."
                                className="flex-1 px-3 py-2 text-sm border border-border rounded-lg focus:ring-2 focus:ring-primary focus:border-primary"
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage(message)}
                            />
                            <button
                                onClick={() => sendMessage(message)}
                                disabled={!message.trim()}
                                className="px-3 py-2 bg-brand-leaf hover:bg-brand-leaf disabled:bg-muted text-brand-ink rounded-lg transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-background border-t text-center">
                        <a
                            href={`tel:+${phoneNumber}`}
                            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-brand-green"
                        >
                            <Phone className="w-4 h-4" />
                            Call FreshPick
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}
