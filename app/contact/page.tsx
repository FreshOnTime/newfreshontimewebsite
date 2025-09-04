"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams } from 'next/navigation';

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<'issue'|'suggestion'|'other'>('issue');
  const [subject, setSubject] = useState('');
  const [priority, setPriority] = useState<'low'|'normal'|'high'>('normal');
  const [orderId, setOrderId] = useState('');
  const [status, setStatus] = useState<null | 'idle' | 'sending' | 'sent' | 'error'>(null);
  const searchParams = useSearchParams();

  useEffect(() => {
    const t = searchParams?.get('type');
    if (t === 'suggest' || t === 'suggestion') {
      setType('suggestion');
      setMessage('Feature suggestion: ');
    }
    if (t === 'issue') {
      setType('issue');
    }
  }, [searchParams]);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('sending');
    try {
      const res = await fetch('/api/contact', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ name, email, message, type, subject, priority, orderId }),
      });
      if (res.ok) {
        setStatus('sent');
        setName(''); setEmail(''); setMessage('');
        setType('issue'); setSubject(''); setPriority('normal'); setOrderId('');
      } else {
        setStatus('error');
      }
    } catch {
      setStatus('error');
    }
  }

  return (
    <main className="container mx-auto px-4 py-12">
      <h1 className="text-2xl font-bold mb-4">Contact Support</h1>
      <p className="text-gray-600 mb-6">Send us a message and we will get back to you within 24 hours.</p>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-2 gap-4 max-w-3xl">
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Name</label>
          <Input value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Email</label>
          <Input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Type</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'issue'|'suggestion'|'other')} className="w-full rounded-md border px-3 py-2">
            <option value="issue">Issue</option>
            <option value="suggestion">Suggestion</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="col-span-1">
          <label className="block text-sm font-medium mb-1">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as 'low'|'normal'|'high')} className="w-full rounded-md border px-3 py-2">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium mb-1">Order ID (optional)</label>
          <Input value={orderId} onChange={(e) => setOrderId(e.target.value)} />
        </div>
        <div className="col-span-1 md:col-span-1">
          <label className="block text-sm font-medium mb-1">Subject</label>
          <Input value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="block text-sm font-medium mb-1">Message</label>
          <Textarea value={message} onChange={(e) => setMessage(e.target.value)} rows={6} required />
        </div>

        <div className="col-span-1 md:col-span-2 flex items-center gap-4">
          <Button type="submit" className="bg-green-600 hover:bg-green-700" disabled={status === 'sending'}>{status === 'sending' ? 'Sending...' : 'Send Message'}</Button>
          {status === 'sent' && <span className="text-sm text-green-600">Message sent — thank you!</span>}
          {status === 'error' && <span className="text-sm text-red-600">Error sending message. Try again later.</span>}
        </div>
      </form>
    </main>
  );
}
