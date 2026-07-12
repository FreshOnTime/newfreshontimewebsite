"use client";

import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";

const inputClassName = "w-full border-b border-zinc-200 bg-transparent py-5 text-sm text-zinc-950 outline-none placeholder:text-zinc-400 focus:border-emerald-700 disabled:opacity-60";

export default function PartnershipRequestForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const form = new FormData(event.currentTarget);
    const payload = Object.fromEntries(form.entries());

    try {
      const response = await fetch("/api/b2b/leads", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to submit your request.");

      event.currentTarget.reset();
      setStatus("success");
      setMessage("Request received. Our supply team will be in touch shortly.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit your request.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white p-8 text-zinc-950 md:p-10">
      <div className="space-y-2">
        <label className="sr-only" htmlFor="organizationName">Business or household name</label>
        <input id="organizationName" name="organizationName" required className={inputClassName} placeholder="Business or household name" />
        <label className="sr-only" htmlFor="contactName">Contact person</label>
        <input id="contactName" name="contactName" required className={inputClassName} placeholder="Contact person" />
        <label className="sr-only" htmlFor="email">Email address</label>
        <input id="email" name="email" type="email" required autoComplete="email" className={inputClassName} placeholder="Email address" />
        <label className="sr-only" htmlFor="phone">Phone number</label>
        <input id="phone" name="phone" required autoComplete="tel" className={inputClassName} placeholder="Phone number" />
        <label className="sr-only" htmlFor="requirement">Requirement</label>
        <textarea id="requirement" name="requirement" rows={4} className={`${inputClassName} resize-none`} placeholder="Weekly volume, delivery area, produce categories, or farmer partnership interest" />
      </div>
      <button type="submit" disabled={status === "submitting"} className="mt-8 flex h-14 w-full items-center justify-center rounded-full bg-emerald-400 px-8 text-sm font-black uppercase tracking-[0.18em] text-zinc-950 transition-colors hover:bg-emerald-300 disabled:cursor-not-allowed disabled:opacity-60">
        {status === "submitting" ? "Sending…" : "Request review"}
        <ArrowRight className="ml-2 h-4 w-4" />
      </button>
      <p aria-live="polite" className={`mt-4 text-sm ${status === "error" ? "text-red-600" : "text-emerald-700"}`}>{message}</p>
    </form>
  );
}
