'use client';

import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Mail, MailOpen } from 'lucide-react';


interface Message {
    _id: string;
    sender: {
        firstName: string;
        lastName: string;
        email: string;
    };
    subject: string;
    content: string;
    isRead: boolean;
    createdAt: string;
}

export default function MessageList() {
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(true);
    const [expandedId, setExpandedId] = useState<string | null>(null);

    const fetchMessages = async () => {
        try {
            const res = await fetch('/api/messages');
            if (res.ok) {
                const data = await res.json();
                setMessages(data.data);
            }
        } catch (error) {
            console.error('Failed to fetch messages', error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchMessages();
    }, []);

    const handleRead = async (id: string, isRead: boolean) => {
        if (expandedId === id) {
            setExpandedId(null);
            return;
        }

        setExpandedId(id);

        if (!isRead) {
            try {
                await fetch(`/api/messages/${id}/read`, { method: 'PUT' });
                setMessages((prev) =>
                    prev.map((msg) =>
                        msg._id === id ? { ...msg, isRead: true } : msg
                    )
                );
            } catch (error) {
                console.error('Failed to mark as read', error);
            }
        }
    };

    if (loading) return <div>Loading messages...</div>;

    return (
        <Card className="h-full">
            <CardHeader>
                <CardTitle className="flex items-center gap-2">
                    <Mail className="h-5 w-5" />
                    Messages
                </CardTitle>
            </CardHeader>
            <CardContent>
                {messages.length === 0 ? (
                    <div className="text-center text-gray-500 py-8">No messages</div>
                ) : (
                    <ScrollArea className="h-[500px] pr-4">
                        <div className="space-y-4">
                            {messages.map((msg) => (
                                <div
                                    key={msg._id}
                                    className={`border rounded-lg p-4 transition-colors cursor-pointer ${msg.isRead ? 'bg-white' : 'bg-blue-50 border-blue-100'
                                        }`}
                                    onClick={() => handleRead(msg._id, msg.isRead)}
                                >
                                    <div className="flex justify-between items-start mb-2">
                                        <div className="font-semibold flex items-center gap-2">
                                            {msg.isRead ? (
                                                <MailOpen className="h-4 w-4 text-gray-400" />
                                            ) : (
                                                <div className="h-2 w-2 rounded-full bg-blue-500" />
                                            )}
                                            {msg.subject}
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(msg.createdAt).toLocaleDateString('en-US', {
                                                month: 'short',
                                                day: 'numeric',
                                                year: 'numeric'
                                            })}
                                        </span>
                                    </div>

                                    {expandedId === msg._id && (
                                        <div className="mt-3 text-sm text-gray-700 border-t pt-3">
                                            <p className="whitespace-pre-wrap">{msg.content}</p>
                                            <div className="mt-4 text-xs text-gray-400">
                                                From: {msg.sender.firstName} {msg.sender.lastName}
                                            </div>
                                        </div>
                                    )}

                                    {expandedId !== msg._id && (
                                        <p className="text-sm text-gray-500 line-clamp-1">
                                            {msg.content}
                                        </p>
                                    )}
                                </div>
                            ))}
                        </div>
                    </ScrollArea>
                )}
            </CardContent>
        </Card>
    );
}
