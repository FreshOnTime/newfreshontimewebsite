"use client";

import { FormEvent, useState } from "react";
import { apiFetch } from "@/lib/api/client";

export function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await apiFetch("/api/newsletter", {
        method: "POST",
        body: JSON.stringify({ email, source: "footer" }),
      });
      const data = await response.json().catch(() => ({}));

      if (!response.ok) throw new Error(data.error || "Unable to subscribe right now.");

      setEmail("");
      setStatus("success");
      setMessage("You’re on the list. Look out for FreshPick updates.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to subscribe right now.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="w-full md:w-full">
      <div className="flex w-full flex-col gap-3 sm:flex-row md:w-full">
        <label className="sr-only" htmlFor="footer-newsletter-email">Email address</label>
        <input
          id="footer-newsletter-email"
          type="email"
          required
          autoComplete="email"
          value={email}
          onChange={(event) => setEmail(event.target.value)}
          placeholder="Email Address"
          disabled={status === "submitting"}
          className="w-full rounded-lg border border-border bg-transparent px-4 py-3 text-brand-green placeholder:text-muted-foreground transition-colors focus:border-brand-green focus:outline-none md:w-full disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-lg border border-brand-amber bg-brand-amber px-5 py-3 text-xs font-bold uppercase text-brand-green transition-colors hover:bg-brand-amber/85 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Joining…" : "Subscribe"}
        </button>
      </div>
      <p aria-live="polite" className={`mt-3 text-sm ${status === "error" ? "text-destructive" : "text-brand-green/80"} `}>
        {message}
      </p>
    </form>
  );
}
