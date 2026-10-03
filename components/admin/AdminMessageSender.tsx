'use client';

import { useState, useRef } from 'react';
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogFooter,
} from '@/components/ui/dialog';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';

interface AdminMessageSenderProps {
    open: boolean;
    onOpenChange: (open: boolean) => void;
    recipientId?: string;
    supplierId?: string;
    recipientName: string;
}

export function AdminMessageSender({
    open,
    onOpenChange,
    recipientId,
    supplierId,
    recipientName,
}: AdminMessageSenderProps) {
    const [subject, setSubject] = useState('');
    const [content, setContent] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const lock = useRef(false);
    const retry = useRef<{ intent: string; submissionId: string } | null>(null);

    const handleSend = async () => {
        if (lock.current) return;
        if (!subject.trim() || !content.trim()) {
            toast.error('Subject and content are required');
            return;
        }

        lock.current = true;
        setLoading(true);
        setError(null);
        try {
            const intent = JSON.stringify([recipientId, supplierId, subject.trim(), content.trim()]);
            if (retry.current?.intent !== intent) retry.current = { intent, submissionId: crypto.randomUUID() };
            const res = await authenticatedApiFetch('/api/messages', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    ...(supplierId ? { supplierId } : { recipientId }),
                    submissionId: retry.current.submissionId,
                    subject,
                    content,
                }),
            });

            const data = await res.json();

            if (res.ok && data.success) {
                toast.success(`Message sent to ${recipientName}${data.sent > 1 ? ` (${data.sent} accounts)` : ''}`);
                retry.current = null;
                setSubject('');
                setContent('');
                onOpenChange(false);
            } else {
                setError(data.message || data.error || 'Failed to send message');
            }
        } catch (error) {
            setError(error instanceof Error ? error.message : 'Unable to send this message. Please retry.');
        } finally {
            lock.current = false;
            setLoading(false);
        }
    };

    return (
        <Dialog open={open} onOpenChange={(next) => { if (!loading) { setError(null); onOpenChange(next); } }}>
            <DialogContent className="sm:max-w-[500px]">
                <DialogHeader>
                    <DialogTitle>Send Message to {recipientName}</DialogTitle>
                </DialogHeader>
                {supplierId && <p className="text-sm text-muted-foreground">This message goes to every active FreshPick account linked to this producer.</p>}
                {error && <p role="alert" className="text-sm text-destructive">{error}</p>}
                <fieldset disabled={loading} className="grid gap-4 py-4">
                    <div className="grid gap-2">
                        <Label htmlFor="subject">Subject</Label>
                        <Input
                            id="subject"
                            maxLength={200}
                            value={subject}
                            onChange={(e) => setSubject(e.target.value)}
                            placeholder="Message subject"
                        />
                    </div>
                    <div className="grid gap-2">
                        <Label htmlFor="content">Message</Label>
                        <Textarea
                            id="content"
                            maxLength={5000}
                            value={content}
                            onChange={(e) => setContent(e.target.value)}
                            placeholder="Type your message here..."
                            className="h-32"
                        />
                    </div>
                </fieldset>
                <DialogFooter>
                    <Button variant="outline" disabled={loading} onClick={() => { setError(null); onOpenChange(false); }}>
                        Cancel
                    </Button>
                    <Button onClick={handleSend} disabled={loading}>
                        {loading ? (
                            <>
                                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                                Sending...
                            </>
                        ) : (
                            'Send Message'
                        )}
                    </Button>
                </DialogFooter>
            </DialogContent>
        </Dialog>
    );
}
