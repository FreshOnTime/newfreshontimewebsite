'use client';

import { useRef, useState } from 'react';
import { useForm } from 'react-hook-form';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { toast } from 'sonner';
import { Bell, Send } from 'lucide-react';
import { authenticatedApiFetch } from '@/lib/api/authenticated-fetch';
import { safeNotificationLink } from '@/lib/notificationInput';
interface NotificationForm { title: string; message: string; type: 'info' | 'success' | 'warning' | 'error' | 'promo'; targetUserId: string; link: string }
export default function NotificationsPage() {
  const [isSubmitting, setIsSubmitting] = useState(false), [error, setError] = useState<string | null>(null), [target, setTarget] = useState('all');
  const lock = useRef(false), retry = useRef<{ intent: string; submissionId: string } | null>(null);
  const { register, handleSubmit, reset, setValue, watch, formState: { errors } } = useForm<NotificationForm>({ defaultValues: { title: '', message: '', type: 'info', targetUserId: 'all', link: '' } });
  const onSubmit = async (data: NotificationForm) => {
    if (lock.current) return;
    lock.current = true; setIsSubmitting(true); setError(null);
    try {
      const normalized = { ...data, title: data.title.trim(), message: data.message.trim(), targetUserId: target === 'all' ? 'all' : data.targetUserId.trim(), link: data.link.trim() };
      const intent = JSON.stringify(normalized);
      if (retry.current?.intent !== intent) retry.current = { intent, submissionId: crypto.randomUUID() };
      const response = await authenticatedApiFetch('/api/admin/notifications', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify({ ...normalized, submissionId: retry.current.submissionId }) });
      const result = await response.json();
      if (!response.ok || !result.success) throw new Error(result.message || result.error || 'Unable to send notification');
      toast.success('Notification sent successfully'); retry.current = null; reset(); setTarget('all');
    } catch (failure) { setError(failure instanceof Error ? failure.message : 'Unable to send notification. Please retry.'); }
    finally { lock.current = false; setIsSubmitting(false); }
  };
  return <div className="mx-auto max-w-4xl space-y-8 p-5 md:p-8">
    <div className="flex items-center gap-4 border-b border-border pb-6"><Bell aria-hidden="true" className="h-8 w-8 text-brand-green" /><div><h1 className="text-3xl font-normal text-foreground">Notification Center</h1><p className="mt-1 text-muted-foreground">Send account updates and announcements.</p></div></div>
    <Card><CardHeader><CardTitle>Send web notification</CardTitle><CardDescription>Recipients read these under Account → Notifications. This does not send email or browser push notifications.</CardDescription></CardHeader><CardContent>
      {error && <p role="alert" className="mb-5 text-sm text-destructive">{error}</p>}
      <form onSubmit={handleSubmit(onSubmit)}><fieldset disabled={isSubmitting} className="space-y-6">
        <div className="grid gap-6 md:grid-cols-2"><div className="space-y-2"><label htmlFor="notification-title" className="text-sm font-medium">Notification title</label><Input id="notification-title" maxLength={200} {...register('title', { validate: value => Boolean(value.trim()) || 'Title is required' })} placeholder="A FreshPick update" />{errors.title && <p className="text-xs text-destructive">{errors.title.message}</p>}</div>
          <div className="space-y-2"><label htmlFor="notification-type" className="text-sm font-medium">Notification type</label><Select value={watch('type')} disabled={isSubmitting} onValueChange={value => setValue('type', value as NotificationForm['type'])}><SelectTrigger id="notification-type"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="info">Information</SelectItem><SelectItem value="success">Success</SelectItem><SelectItem value="warning">Warning</SelectItem><SelectItem value="error">Error</SelectItem><SelectItem value="promo">Promotion</SelectItem></SelectContent></Select></div></div>
        <div className="space-y-2"><label htmlFor="notification-message" className="text-sm font-medium">Message content</label><Textarea id="notification-message" maxLength={5000} {...register('message', { validate: value => Boolean(value.trim()) || 'Message is required' })} className="min-h-[120px]" />{errors.message && <p className="text-xs text-destructive">{errors.message.message}</p>}</div>
        <div className="grid gap-6 md:grid-cols-2"><div className="space-y-2"><label htmlFor="notification-target" className="text-sm font-medium">Target audience</label><Select value={target} disabled={isSubmitting} onValueChange={value => { setTarget(value); setValue('targetUserId', value === 'all' ? 'all' : ''); }}><SelectTrigger id="notification-target"><SelectValue /></SelectTrigger><SelectContent><SelectItem value="all">All accounts</SelectItem><SelectItem value="account">Specific account</SelectItem></SelectContent></Select>{target === 'account' && <><label htmlFor="notification-account" className="block text-sm">Account ID</label><Input id="notification-account" maxLength={100} {...register('targetUserId', { validate: value => Boolean(value.trim()) || 'Enter an account ID' })} /><p className="text-xs text-muted-foreground">Use the account ID shown in Users management.</p>{errors.targetUserId && <p className="text-xs text-destructive">{errors.targetUserId.message}</p>}</>}</div>
          <div className="space-y-2"><label htmlFor="notification-link" className="text-sm font-medium">Action link (optional)</label><Input id="notification-link" maxLength={1000} {...register('link', { validate: value => !value.trim() || safeNotificationLink(value) !== null || 'Use a storefront path such as /products' })} placeholder="/products" />{errors.link && <p className="text-xs text-destructive">{errors.link.message}</p>}</div></div>
        <div className="flex justify-end"><Button type="submit" disabled={isSubmitting}>{isSubmitting ? 'Sending…' : <><Send aria-hidden="true" className="mr-2 h-4 w-4" /> Send Notification</>}</Button></div>
      </fieldset></form>
    </CardContent></Card>
  </div>;
}
