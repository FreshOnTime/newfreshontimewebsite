"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare, MapPin, ArrowUpRight, Send } from "lucide-react";
import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { apiFetch } from "@/lib/api/client";
import { contactSchema, enquiryReference, enquiryTypes, type EnquiryType } from "@/lib/contactEnquiries";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<EnquiryType>("question");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const searchParams = useSearchParams();
  const source = searchParams.get("source") === "producers" ? "producers" : searchParams.get("source") === "support" ? "support" : "general";
  const [feedback, setFeedback] = useState("");
  const submission = useRef<{ key: string; id: string } | null>(null);
  const sending = useRef(false);

  useEffect(() => {
    const requestedType = searchParams.get("type");
    if (requestedType === "suggest") { setType("suggestion"); }
    else if (enquiryTypes.includes(requestedType as EnquiryType)) setType(requestedType as EnquiryType);
    if (searchParams.get("topic") === "country-expansion") { const country=(searchParams.get("country") || "").slice(0,100); setSubject(current => current || "FreshPick country suggestion"); setMessage(current => current || `Country: ${country}\nCity or region:\nI am interested as a visitor or business owner:\nSuggested businesses or food experiences:`); }
    if (searchParams.get("topic") === "food-event") { setSubject(current => current || "Food event submission"); setMessage(current => current || "Event name:\nOrganizer:\nStart and end date/time:\nVenue and town:\nPrice (if applicable):\nOfficial registration or contact link:\nDescription:"); }
    if (source === "producers") setSubject((current) => current || "My maker page");
  }, [searchParams, source]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    if (sending.current) return;
    setFeedback("");
    const parsed = contactSchema.safeParse({ name, email, message, type, subject, priority, orderId, source });
    if (!parsed.success) { setStatus("error"); setFeedback(parsed.error.issues[0]?.message || "Check your enquiry."); return; }
    const key = JSON.stringify(parsed.data);
    if (submission.current?.key !== key) submission.current = { key, id: crypto.randomUUID() };
    sending.current = true;
    setStatus("sending");
    try {
      const response = await apiFetch("/api/contact", { method: "POST", body: JSON.stringify({ ...parsed.data, submissionId: submission.current.id }) });
      const data = await response.json();
      if (!response.ok || !data.ok || typeof data.enquiryId !== "string") throw new Error(data.error || "Your enquiry could not be saved. Please retry.");
      setStatus("sent"); setFeedback(`Enquiry saved for the FreshPick team. Reference: ${enquiryReference(data.enquiryId)}.`);
      submission.current = null;
      setName(""); setEmail(""); setMessage(""); setOrderId(""); setPriority("normal");
      setSubject(source === "producers" ? "My maker page" : "");
    } catch (error) {
      setStatus("error"); setFeedback(error instanceof Error ? error.message : "Your enquiry could not be saved. Please retry.");
    } finally { sending.current = false; }
  }

  const fieldClass = "fp-contact-field h-12 w-full text-base font-normal";

  return (
    <div className="fp26-shell fp-contact-page">
      <header className="fp-contact-hero"><div><p className="fp26-label">Contact FreshPick</p><h1>Good food starts with a conversation.</h1><p className="fp26-deck">Have a question, a food discovery to share or an idea for FreshPick? We would love to hear from you.</p></div><figure><Image src="/images/editorial/hands-at-work.webp" alt="Hands preparing dough, editorial photograph" fill priority sizes="(max-width:760px) 100vw, 36vw"/></figure></header>
      <section className="fp-contact-grid">
          <aside className="fp-contact-aside"><p className="fp26-label">How can we help?</p><h2>Let’s talk.</h2><div className="fp-contact-options"><div><MessageSquare size={22} aria-hidden="true"/><h3>Platform help &amp; feedback</h3><p>Ask about your account, a listing, or suggest an improvement. Your enquiry goes to the FreshPick team.</p></div><div><ArrowUpRight size={22} aria-hidden="true"/><h3>For food businesses</h3><p>Discover how to publish your profile, menus, products and stories.</p><Link href="/for-businesses">Explore business features</Link></div><div><MapPin size={22} aria-hidden="true"/><h3>Contact a food business</h3><p>For availability, bookings and fulfilment, contact the relevant business directly using its public profile.</p><Link href="/discover">Find a business</Link></div></div><p className="fp-contact-region">Sri Lanka · Independent food discovery</p></aside>
          <form onSubmit={handleSubmit}><fieldset disabled={status === "sending"} className="fp-contact-form grid min-w-0 grid-cols-1 gap-x-5 gap-y-5 md:grid-cols-2"><legend className="sr-only">Send an enquiry to FreshPick</legend><div className="md:col-span-2"><h2>Send us a message</h2><p className="fp-contact-form-hint">Include your email so we can respond to your enquiry.</p></div>
            <label className="col-span-1 text-xs font-bold normal-case text-muted-foreground">
              Name
              <Input className={` ${fieldClass} mt-2`} autoComplete="name" maxLength={100} value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label className="col-span-1 text-xs font-bold normal-case text-muted-foreground">
              Email
              <Input className={` ${fieldClass} mt-2`} type="email" autoComplete="email" maxLength={254} value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="col-span-1 text-xs font-bold normal-case text-muted-foreground">
              Enquiry
              <select value={type} onChange={(event) => setType(event.target.value as EnquiryType)} className="fp-contact-field mt-2 h-12 w-full text-base font-normal">
                <option value="question">Question</option>
                <option value="issue">Issue</option>
                <option value="suggestion">Suggestion</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="col-span-1 text-xs font-bold normal-case text-muted-foreground">
              Priority
              <select value={priority} onChange={(event) => setPriority(event.target.value as "low" | "normal" | "high")} className="fp-contact-field mt-2 h-12 w-full text-base font-normal">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="col-span-1 text-xs font-bold normal-case text-muted-foreground">
              Reference or order ID <span className="font-normal normal-case tracking-normal text-muted-foreground">(optional)</span>
              <Input className={` ${fieldClass} mt-2`} maxLength={100} value={orderId} onChange={(event) => setOrderId(event.target.value)} />
            </label>
            <label className="col-span-1 text-xs font-bold normal-case text-muted-foreground">
              Subject
              <Input className={` ${fieldClass} mt-2`} maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} />
            </label>
            <label className="col-span-1 text-xs font-bold normal-case text-muted-foreground md:col-span-2">
              Message
              <Textarea className="fp-contact-field mt-2 min-h-36 p-3 text-base font-normal" maxLength={5000} value={message} onChange={(event) => setMessage(event.target.value)} rows={6} required />
            </label>

            <div className="col-span-1 flex flex-wrap items-center gap-4 md:col-span-2">
              <Button type="submit" className="fp-contact-submit h-12 px-7 text-sm font-semibold" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send enquiry"} <Send size={16} aria-hidden="true"/>
              </Button>
              <p role={status === "error" ? "alert" : "status"} aria-live="polite" className={`text-sm ${status === "error" ? "text-red-600" : "text-brand-green"} `}>
                {feedback}
              </p>
            </div>
          </fieldset></form>
      </section>
    </div>
  );
}
