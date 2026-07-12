"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { useSearchParams } from 'next/navigation';
import PremiumPageHeader from '@/components/ui/PremiumPageHeader';
import { Mail, MapPin } from 'lucide-react';

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

  const fieldClass = "h-12 rounded-none border-0 border-b border-zinc-300 bg-transparent px-0 shadow-none focus-visible:ring-0 focus-visible:border-emerald-800";

  return (
    <main className="min-h-screen bg-[#faf8f3] text-[#142019]">
      <PremiumPageHeader title="Speak with FreshPick." subtitle="For orders, private sourcing, recurring plans, and general care, our Colombo team is here to help." eyebrow="The concierge" />
      <section className="px-4 py-24 md:py-32">
      <div className="container mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.65fr_1.35fr]">
        <aside>
          <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-[#8b6d32]">Client care</span>
          <h2 className="mt-7 font-serif text-4xl font-normal leading-tight md:text-5xl">A human answer,<br /><span className="italic text-emerald-800">when you need one.</span></h2>
          <div className="mt-12 space-y-6 border-t border-zinc-300 pt-8 text-sm font-light text-zinc-600">
            <p className="flex gap-3"><Mail className="h-5 w-5 stroke-1 text-[#8b6d32]" /> concierge@freshpick.lk</p>
            <p className="flex gap-3"><MapPin className="h-5 w-5 stroke-1 text-[#8b6d32]" /> Greater Colombo, Sri Lanka</p>
          </div>
        </aside>

      <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-8 gap-y-7 bg-white p-7 shadow-[0_24px_70px_rgba(20,32,25,0.08)] md:grid-cols-2 md:p-12">
        <div className="col-span-1">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Name</label>
          <Input className={fieldClass} value={name} onChange={(e) => setName(e.target.value)} required />
        </div>
        <div className="col-span-1">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Email</label>
          <Input className={fieldClass} type="email" value={email} onChange={(e) => setEmail(e.target.value)} required />
        </div>
        <div className="col-span-1">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Enquiry</label>
          <select value={type} onChange={(e) => setType(e.target.value as 'issue'|'suggestion'|'other')} className="h-12 w-full border-0 border-b border-zinc-300 bg-transparent px-0 text-sm outline-none focus:border-emerald-800">
            <option value="issue">Issue</option>
            <option value="suggestion">Suggestion</option>
            <option value="other">Other</option>
          </select>
        </div>
        <div className="col-span-1">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Priority</label>
          <select value={priority} onChange={(e) => setPriority(e.target.value as 'low'|'normal'|'high')} className="h-12 w-full border-0 border-b border-zinc-300 bg-transparent px-0 text-sm outline-none focus:border-emerald-800">
            <option value="low">Low</option>
            <option value="normal">Normal</option>
            <option value="high">High</option>
          </select>
        </div>
        <div className="col-span-1 md:col-span-1">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Order ID (optional)</label>
          <Input className={fieldClass} value={orderId} onChange={(e) => setOrderId(e.target.value)} />
        </div>
        <div className="col-span-1 md:col-span-1">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Subject</label>
          <Input className={fieldClass} value={subject} onChange={(e) => setSubject(e.target.value)} />
        </div>
        <div className="col-span-1 md:col-span-2">
          <label className="mb-2 block text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">Message</label>
          <Textarea className="rounded-none border-zinc-300 bg-[#faf8f3] p-4 focus-visible:ring-1 focus-visible:ring-emerald-800" value={message} onChange={(e) => setMessage(e.target.value)} rows={6} required />
        </div>

        <div className="col-span-1 md:col-span-2 flex items-center gap-4">
          <Button type="submit" className="h-14 rounded-none bg-[#142019] px-8 text-[10px] font-bold uppercase tracking-[0.18em] text-white hover:bg-emerald-900" disabled={status === 'sending'}>{status === 'sending' ? 'Sending...' : 'Send enquiry'}</Button>
          {status === 'sent' && <span className="text-sm text-green-600">Message sent — thank you!</span>}
          {status === 'error' && <span className="text-sm text-red-600">Error sending message. Try again later.</span>}
        </div>
      </form>
      </div>
      </section>
    </main>
  );
}
