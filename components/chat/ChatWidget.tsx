"use client";

import { useState, useRef, useEffect, FormEvent } from "react";
import { MessageCircle, X, Send, Bot, User, Loader2 } from "lucide-react";
import { Button } from "@/components/ui/button";

declare global {
    interface Window {
        puter?: {
            ai: {
                chat: (message: string, options?: { model?: string }) => Promise<string>;
            };
        };
    }
}

interface Message {
    id: string;
    role: "user" | "assistant";
    content: string;
    timestamp: Date;
}

const SYSTEM_CONTEXT = `You are a helpful customer support assistant for Fresh Pick, a premium online grocery delivery service in Colombo, Sri Lanka. 

Key information about Fresh Pick:
- We deliver fresh groceries including fruits, vegetables, dairy, meat, grains, and pantry staples
- Same-day delivery available in Colombo
- Freshness is guaranteed
- Customer satisfaction is our priority

Be friendly, concise, and helpful. If asked about specific product availability or pricing, politely explain that you can help with general inquiries and direct them to browse the products page or contact support for specific details.`;

export default function ChatWidget() {
    const [isOpen, setIsOpen] = useState(false);
    const [messages, setMessages] = useState<Message[]>([
        {
            id: "welcome",
            role: "assistant",
            content: "Hi! 👋 Welcome to Fresh Pick. How can I help you today?",
            timestamp: new Date(),
        },
    ]);
    const [input, setInput] = useState("");
    const [isLoading, setIsLoading] = useState(false);
    const [isPuterReady, setIsPuterReady] = useState(false);
    const messagesEndRef = useRef<HTMLDivElement>(null);

    // Check if Puter is loaded
    useEffect(() => {
        const checkPuter = () => {
            if (window.puter) {
                setIsPuterReady(true);
            } else {
                setTimeout(checkPuter, 500);
            }
        };
        checkPuter();
    }, []);

    // Scroll to bottom when messages change
    useEffect(() => {
        messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
    }, [messages]);

    const sendMessage = async (e: FormEvent) => {
        e.preventDefault();
        if (!input.trim() || isLoading) return;

        const userMessage: Message = {
            id: Date.now().toString(),
            role: "user",
            content: input.trim(),
            timestamp: new Date(),
        };

        setMessages((prev) => [...prev, userMessage]);
        setInput("");
        setIsLoading(true);

        try {
            if (!window.puter) {
                throw new Error("Puter.js not loaded");
            }

            // Build conversation history for context
            const conversationHistory = messages
                .slice(-6) // Last 6 messages for context
                .map((m) => `${m.role === "user" ? "Customer" : "Assistant"}: ${m.content}`)
                .join("\n");

            const prompt = `${SYSTEM_CONTEXT}

Previous conversation:
${conversationHistory}

Customer: ${userMessage.content}

Respond helpfully and concisely as the Fresh Pick assistant:`;

            const response = await window.puter.ai.chat(prompt);

            const assistantMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: response || "I apologize, I couldn't process that request. Please try again.",
                timestamp: new Date(),
            };

            setMessages((prev) => [...prev, assistantMessage]);
        } catch (error) {
            console.error("Chat error:", error);
            const errorMessage: Message = {
                id: (Date.now() + 1).toString(),
                role: "assistant",
                content: "I'm having trouble connecting right now. Please try again in a moment or contact us directly.",
                timestamp: new Date(),
            };
            setMessages((prev) => [...prev, errorMessage]);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <>
            {/* Floating Chat Button */}
            <button
                onClick={() => setIsOpen(!isOpen)}
                className="fixed bottom-6 right-6 z-50 w-14 h-14 bg-emerald-600 hover:bg-emerald-700 text-white rounded-full shadow-lg flex items-center justify-center transition-all duration-300 hover:scale-110"
                aria-label="Open chat"
            >
                {isOpen ? (
                    <X className="w-6 h-6" />
                ) : (
                    <MessageCircle className="w-6 h-6" />
                )}
            </button>

            {/* Chat Window */}
            {isOpen && (
                <div className="fixed bottom-24 right-6 z-50 w-[360px] max-w-[calc(100vw-3rem)] bg-white rounded-2xl shadow-2xl border border-gray-200 flex flex-col overflow-hidden animate-in slide-in-from-bottom-4 duration-300">
                    {/* Header */}
                    <div className="bg-gradient-to-r from-emerald-600 to-emerald-700 text-white p-4 flex items-center gap-3">
                        <div className="w-10 h-10 bg-white/20 rounded-full flex items-center justify-center">
                            <Bot className="w-6 h-6" />
                        </div>
                        <div>
                            <h3 className="font-semibold">Fresh Pick Support</h3>
                            <p className="text-xs text-emerald-100">
                                {isPuterReady ? "Online • AI Powered" : "Connecting..."}
                            </p>
                        </div>
                    </div>

                    {/* Messages Container */}
                    <div className="flex-1 overflow-y-auto p-4 space-y-4 max-h-[400px] min-h-[300px] bg-gray-50">
                        {messages.map((message) => (
                            <div
                                key={message.id}
                                className={`flex gap-2 ${message.role === "user" ? "flex-row-reverse" : ""
                                    }`}
                            >
                                <div
                                    className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${message.role === "user"
                                            ? "bg-emerald-100 text-emerald-600"
                                            : "bg-gray-200 text-gray-600"
                                        }`}
                                >
                                    {message.role === "user" ? (
                                        <User className="w-4 h-4" />
                                    ) : (
                                        <Bot className="w-4 h-4" />
                                    )}
                                </div>
                                <div
                                    className={`max-w-[75%] px-4 py-2 rounded-2xl ${message.role === "user"
                                            ? "bg-emerald-600 text-white rounded-br-md"
                                            : "bg-white text-gray-800 shadow-sm border border-gray-100 rounded-bl-md"
                                        }`}
                                >
                                    <p className="text-sm whitespace-pre-wrap">{message.content}</p>
                                </div>
                            </div>
                        ))}
                        {isLoading && (
                            <div className="flex gap-2">
                                <div className="w-8 h-8 rounded-full bg-gray-200 text-gray-600 flex items-center justify-center flex-shrink-0">
                                    <Bot className="w-4 h-4" />
                                </div>
                                <div className="bg-white px-4 py-3 rounded-2xl rounded-bl-md shadow-sm border border-gray-100">
                                    <Loader2 className="w-5 h-5 animate-spin text-emerald-600" />
                                </div>
                            </div>
                        )}
                        <div ref={messagesEndRef} />
                    </div>

                    {/* Input Form */}
                    <form
                        onSubmit={sendMessage}
                        className="p-4 border-t border-gray-200 bg-white"
                    >
                        <div className="flex gap-2">
                            <input
                                type="text"
                                value={input}
                                onChange={(e) => setInput(e.target.value)}
                                placeholder="Type a message..."
                                disabled={isLoading || !isPuterReady}
                                className="flex-1 px-4 py-2 border border-gray-200 rounded-full focus:outline-none focus:ring-2 focus:ring-emerald-500/20 focus:border-emerald-500 text-sm disabled:opacity-50"
                            />
                            <Button
                                type="submit"
                                disabled={isLoading || !input.trim() || !isPuterReady}
                                className="w-10 h-10 rounded-full bg-emerald-600 hover:bg-emerald-700 p-0"
                            >
                                <Send className="w-4 h-4" />
                            </Button>
                        </div>
                        <p className="text-xs text-gray-400 text-center mt-2">
                            Powered by AI • Responses may be inaccurate
                        </p>
                    </form>
                </div>
            )}
        </>
    );
}
