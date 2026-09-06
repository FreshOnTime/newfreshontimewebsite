"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";
import { Mail, MapPin } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import PremiumPageHeader from "@/components/ui/PremiumPageHeader";
import { apiFetch } from "@/lib/api/client";
import { SUPPORT_EMAIL } from "@/lib/config/site";

export default function ContactPage() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [type, setType] = useState<"issue" | "suggestion" | "other">("issue");
  const [subject, setSubject] = useState("");
  const [priority, setPriority] = useState<"low" | "normal" | "high">("normal");
  const [orderId, setOrderId] = useState("");
  const [status, setStatus] = useState<"idle" | "sending" | "sent" | "error">("idle");
  const searchParams = useSearchParams();

  useEffect(() => {
    const requestedType = searchParams.get("type");
    if (requestedType === "suggest" || requestedType === "suggestion") {
      setType("suggestion");
      setMessage((current) => current || "Feature suggestion: ");
    } else if (requestedType === "issue") {
      setType("issue");
    }
  }, [searchParams]);

  async function handleSubmit(event: React.FormEvent) {
    event.preventDefault();
    setStatus("sending");

    try {
      const response = await apiFetch("/api/contact", {
        method: "POST",
        body: JSON.stringify({ name, email, message, type, subject, priority, orderId }),
      });

      if (!response.ok) {
        setStatus("error");
        return;
      }

      setStatus("sent");
      setName("");
      setEmail("");
      setMessage("");
      setType("issue");
      setSubject("");
      setPriority("normal");
      setOrderId("");
    } catch {
      setStatus("error");
    }
  }

  const fieldClass = "h-12 rounded-none border-0 border-b border-zinc-300 bg-transparent px-0 shadow-none focus-visible:border-emerald-800 focus-visible:ring-0";

  return (
    <main className="min-h-screen bg-white text-zinc-950">
      <PremiumPageHeader
        title="Speak with FreshPick."
        subtitle="For orders, recurring plans, partnerships, and general support, our Colombo team is here to help."
        eyebrow="Client care"
      />

      <section className="px-4 py-24 md:py-32">
        <div className="container mx-auto grid max-w-7xl gap-14 lg:grid-cols-[0.65fr_1.35fr]">
          <aside>
            <span className="text-[10px] font-bold uppercase tracking-[0.32em] text-emerald-700">Client care</span>
            <h2 className="mt-7 font-serif text-4xl font-normal leading-tight md:text-5xl">
              A human answer,<br /><span className="italic text-emerald-800">when you need one.</span>
            </h2>
            <div className="mt-12 space-y-6 border-t border-zinc-300 pt-8 text-sm font-light text-zinc-600">
              <a href={`mailto:${SUPPORT_EMAIL}`} className="flex gap-3 transition-colors hover:text-emerald-800">
                <Mail className="h-5 w-5 stroke-1 text-emerald-700" /> {SUPPORT_EMAIL}
              </a>
              <p className="flex gap-3"><MapPin className="h-5 w-5 stroke-1 text-emerald-700" /> Greater Colombo, Sri Lanka</p>
            </div>
          </aside>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-x-8 gap-y-7 rounded-[1.75rem] bg-white p-7 shadow-[0_24px_70px_rgba(20,32,25,0.08)] md:grid-cols-2 md:p-12">
            <label className="col-span-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Name
              <Input className={`${fieldClass} mt-2`} value={name} onChange={(event) => setName(event.target.value)} required />
            </label>
            <label className="col-span-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Email
              <Input className={`${fieldClass} mt-2`} type="email" value={email} onChange={(event) => setEmail(event.target.value)} required />
            </label>
            <label className="col-span-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Enquiry
              <select value={type} onChange={(event) => setType(event.target.value as "issue" | "suggestion" | "other")} className="mt-2 h-12 w-full border-0 border-b border-zinc-300 bg-transparent px-0 text-sm font-normal normal-case tracking-normal outline-none focus:border-emerald-800">
                <option value="issue">Issue</option>
                <option value="suggestion">Suggestion</option>
                <option value="other">Other</option>
              </select>
            </label>
            <label className="col-span-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Priority
              <select value={priority} onChange={(event) => setPriority(event.target.value as "low" | "normal" | "high")} className="mt-2 h-12 w-full border-0 border-b border-zinc-300 bg-transparent px-0 text-sm font-normal normal-case tracking-normal outline-none focus:border-emerald-800">
                <option value="low">Low</option>
                <option value="normal">Normal</option>
                <option value="high">High</option>
              </select>
            </label>
            <label className="col-span-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Order ID <span className="font-normal normal-case tracking-normal text-zinc-400">(optional)</span>
              <Input className={`${fieldClass} mt-2`} value={orderId} onChange={(event) => setOrderId(event.target.value)} />
            </label>
            <label className="col-span-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500">
              Subject
              <Input className={`${fieldClass} mt-2`} value={subject} onChange={(event) => setSubject(event.target.value)} />
            </label>
            <label className="col-span-1 text-[10px] font-bold uppercase tracking-[0.16em] text-zinc-500 md:col-span-2">
              Message
              <Textarea className="mt-2 rounded-xl border-zinc-300 bg-white p-4 font-normal normal-case tracking-normal focus-visible:ring-1 focus-visible:ring-emerald-800" value={message} onChange={(event) => setMessage(event.target.value)} rows={6} required />
            </label>

            <div className="col-span-1 flex flex-wrap items-center gap-4 md:col-span-2">
              <Button type="submit" className="h-14 rounded-full bg-zinc-950 px-8 text-[10px] font-bold uppercase tracking-[0.18em] text-white hover:bg-emerald-900" disabled={status === "sending"}>
                {status === "sending" ? "Sending…" : "Send enquiry"}
              </Button>
              <p aria-live="polite" className={`text-sm ${status === "error" ? "text-red-600" : "text-emerald-700"}`}>
                {status === "sent" ? "Message sent — thank you." : status === "error" ? "Unable to send right now. Please try again." : ""}
              </p>
            </div>
          </form>
        </div>
      </section>
    </main>
  );
}
