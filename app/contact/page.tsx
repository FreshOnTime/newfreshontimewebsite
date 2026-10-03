"use client";

import { useEffect, useState, useRef } from "react";
import { useSearchParams } from "next/navigation";
import { MessageSquare, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
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
    if (source === "producers") setSubject((current) => current || "Selling with FreshPick");
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
      setSubject(source === "producers" ? "Selling with FreshPick" : "");
    } catch (error) {
      setStatus("error"); setFeedback(error instanceof Error ? error.message : "Your enquiry could not be saved. Please retry.");
    } finally { sending.current = false; }
  }

  const fieldClass = "h-12 rounded-none border-0 border-b border-border bg-transparent px-0 shadow-none focus-visible:border-primary focus-visible:ring-0";

  return (
    <div className="min-h-screen bg-background text-foreground">
      <PremiumPageHeader
        title="Speak with FreshPick."
        subtitle="For orders, recurring plans, partnerships, and general support, our Colombo team is here to help."
        eyebrow="Contact FreshPick"
      />

      <section className="px-4 py-10 md:py-12">
        <div className="container mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.65fr_1.35fr]">
          <aside>
            <span className="text-xs font-bold normal-case text-brand-green">Your enquiry</span>
            <h2 className="mt-7 font-serif text-2xl font-normal leading-tight md:text-2xl">
              A human answer,<br /><span className="not-italic text-brand-green">when you need one.</span>
            </h2>
            <div className="mt-6 space-y-6 border-t border-border pt-8 text-sm font-normal text-muted-foreground">
              <p className="flex items-start gap-3"><MessageSquare className="mt-1 h-5 w-5 shrink-0 text-brand-green" aria-hidden="true" /><span>Your message goes to the FreshPick team’s enquiry inbox. Include an email address so we can contact you about your question.</span></p>
              <p className="flex gap-3"><MapPin className="h-5 w-5 stroke-1 text-brand-green" /> Greater Colombo, Sri Lanka</p>
            </div>
          </aside>

          <form onSubmit={handleSubmit}><fieldset disabled={status === "sending"} className="grid min-w-0 grid-cols-1 gap-x-8 gap-y-7 rounded-lg border border-border bg-background p-5 md:grid-cols-2 md:p-8"><legend className="sr-only">Send an enquiry to FreshPick</legend>
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
              <select value={type} onChange={(event) => setType(event.target.value as EnquiryType)} className="mt-2 h-12 w-full border-0 border-b border-border bg-transparent px-0 text-sm font-normal normal-case tracking-normal outline-none focus:border-primary">
                <option value="question">Question</option>
                <option value="issue">Issue</option>
                <option value="suggestion">Suggestion</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="col-span-1 text-xs font-bold normal-case text-muted-foreground">
              Priority
              <select value={priority} onChange={(event) => setPriority(event.target.value as "low" | "normal" | "high")} className="mt-2 h-12 w-full border-0 border-b border-border bg-transparent px-0 text-sm font-normal normal-case tracking-normal outline-none focus:border-primary">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="col-span-1 text-xs font-bold normal-case text-muted-foreground">
              Order ID <span className="font-normal normal-case tracking-normal text-muted-foreground">(optional)</span>
              <Input className={` ${fieldClass} mt-2`} maxLength={100} value={orderId} onChange={(event) => setOrderId(event.target.value)} />
            </label>
            <label className="col-span-1 text-xs font-bold normal-case text-muted-foreground">
              Subject
              <Input className={` ${fieldClass} mt-2`} maxLength={160} value={subject} onChange={(event) => setSubject(event.target.value)} />
            </label>
            <label className="col-span-1 text-xs font-bold normal-case text-muted-foreground md:col-span-2">
              Message
              <Textarea className="mt-2 rounded-lg border-border bg-background p-4 font-normal normal-case tracking-normal focus-visible:ring-1 focus-visible:ring-primary" maxLength={5000} value={message} onChange={(event) => setMessage(event.target.value)} rows={6} required />
            </label>

            <div className="col-span-1 flex flex-wrap items-center gap-4 md:col-span-2">
              <Button type="submit" className="h-14 rounded-md bg-brand-amber px-8 text-xs font-bold normal-case text-foreground hover:bg-brand-amber/85" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send enquiry"}
              </Button>
              <p role={status === "error" ? "alert" : "status"} aria-live="polite" className={`text-sm ${status === "error" ? "text-red-600" : "text-brand-green"} `}>
                {feedback}
              </p>
            </div>
          </fieldset></form>
        </div>
      </section>
    </div>
  );
}
