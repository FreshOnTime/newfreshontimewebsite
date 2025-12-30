'use client';

import { useState } from 'react';
import { MessageCircle, X, Send, Phone } from 'lucide-react';

export default function WhatsAppButton() {
    const [isOpen, setIsOpen] = useState(false);
    const [message, setMessage] = useState('');

    const phoneNumber = '94771234567'; // Replace with actual WhatsApp number
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
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-green-500 hover:bg-green-600 rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110 group"
                aria-label="Contact via WhatsApp"
            >
                {isOpen ? (
                    <X className="w-6 h-6 text-white" />
                ) : (
                    <>
                        <MessageCircle className="w-7 h-7 text-white fill-white" />
                        {/* Pulse Animation */}
                        <span className="absolute w-full h-full rounded-full bg-green-500 animate-ping opacity-30" />
                    </>
                )}
            </button>

            {/* Chat Popup */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-80 bg-white rounded-2xl shadow-2xl overflow-hidden animate-in slide-in-from-bottom-5 duration-300">
                    {/* Header */}
                    <div className="bg-green-500 p-4 text-white">
                        <div className="flex items-center gap-3">
                            <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                                <MessageCircle className="w-5 h-5" />
                            </div>
                            <div>
                                <h3 className="font-semibold">Fresh Pick Support</h3>
                                <p className="text-xs text-green-100">Usually replies within minutes</p>
                            </div>
                        </div>
                    </div>

                    {/* Content */}
                    <div className="p-4">
                        <p className="text-sm text-gray-600 mb-4">
                            👋 Hi there! How can we help you today?
                        </p>

                        {/* Quick Messages */}
                        <div className="space-y-2 mb-4">
                            {defaultMessages.map((msg, i) => (
                                <button
                                    key={i}
                                    onClick={() => sendMessage(msg)}
                                    className="w-full text-left text-sm px-3 py-2 bg-gray-50 hover:bg-green-50 rounded-lg border border-gray-100 hover:border-green-200 transition-colors"
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
                                className="flex-1 px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                                onKeyDown={(e) => e.key === 'Enter' && sendMessage(message)}
                            />
                            <button
                                onClick={() => sendMessage(message)}
                                disabled={!message.trim()}
                                className="px-3 py-2 bg-green-500 hover:bg-green-600 disabled:bg-gray-300 text-white rounded-lg transition-colors"
                            >
                                <Send className="w-4 h-4" />
                            </button>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="px-4 py-3 bg-gray-50 border-t text-center">
                        <a
                            href={`tel:+${phoneNumber}`}
                            className="inline-flex items-center gap-2 text-sm text-gray-600 hover:text-green-600"
                        >
                            <Phone className="w-4 h-4" />
                            Prefer to call? +94 77 123 4567
                        </a>
                    </div>
                </div>
            )}
        </>
    );
}
