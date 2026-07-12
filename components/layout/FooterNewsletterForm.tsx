"use client";

import { FormEvent, useState } from "react";

export function FooterNewsletterForm() {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    try {
      const response = await fetch("/api/newsletter", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
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
    <form onSubmit={handleSubmit} className="w-full md:w-auto">
      <div className="flex w-full gap-3 md:w-auto">
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
          className="w-full rounded-full border border-white/10 bg-black/30 px-6 py-4 font-light text-white placeholder:text-zinc-600 transition-all focus:border-emerald-300/40 focus:outline-none md:w-80 disabled:opacity-60"
        />
        <button
          type="submit"
          disabled={status === "submitting"}
          className="rounded-full border border-emerald-300/25 bg-emerald-300/10 px-8 py-4 font-medium tracking-wide text-emerald-50 transition-all hover:bg-emerald-300 hover:text-zinc-950 disabled:cursor-not-allowed disabled:opacity-60"
        >
          {status === "submitting" ? "Joining…" : "Subscribe"}
        </button>
      </div>
      <p aria-live="polite" className={`mt-3 text-sm ${status === "error" ? "text-red-300" : "text-emerald-200"}`}>
        {message}
      </p>
    </form>
  );
}
