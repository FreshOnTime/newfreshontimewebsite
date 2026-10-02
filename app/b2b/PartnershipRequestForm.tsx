"use client";

import { FormEvent, useState } from "react";
import { ArrowRight } from "lucide-react";
import { apiFetch } from "@/lib/api/client";

const fieldClassName = "w-full rounded-lg border border-border bg-background px-4 py-3.5 text-sm text-foreground outline-none transition-colors placeholder:text-muted-foreground focus:border-primary focus:bg-background disabled:opacity-60";

const partnershipTypes = [
  "Grower or farm",
  "Local food maker",
  "Brand or producer",
  "Distributor or importer",
  "Restaurant, hotel, office, or business buyer",
  "Strategic partnership",
  "Other",
];

export default function PartnershipRequestForm() {
  const [status, setStatus] = useState<"idle" | "submitting" | "success" | "error">("idle");
  const [message, setMessage] = useState("");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setStatus("submitting");
    setMessage("");

    const formElement = event.currentTarget;
    const form = new FormData(formElement);
    const partnershipType = String(form.get("partnershipType") || "General partnership");
    const requirement = String(form.get("requirement") || "").trim();

    const payload = {
      organizationName: String(form.get("organizationName") || ""),
      contactName: String(form.get("contactName") || ""),
      email: String(form.get("email") || ""),
      phone: String(form.get("phone") || ""),
      requirement: `Partnership type: ${partnershipType}${requirement ? `\n\nDetails:\n${requirement}` : ""}`,
    };

    try {
      const response = await apiFetch("/api/b2b/leads", {
        method: "POST",
        body: JSON.stringify(payload),
      });
      const data = await response.json().catch(() => ({}));
      if (!response.ok) throw new Error(data.error || "Unable to submit your application.");

      formElement.reset();
      setStatus("success");
      setMessage("Thanks — your partnership application has been received. The FreshPick team can review the fit and contact you if there is a next step.");
    } catch (error) {
      setStatus("error");
      setMessage(error instanceof Error ? error.message : "Unable to submit your application.");
    }
  }

  return (
    <form onSubmit={handleSubmit} className="text-foreground">
      <div className="mb-8">

        <h3 className="text-xl font-semibold">Partnership application</h3>
        <p className="mt-3 max-w-xl text-sm font-normal leading-6 text-muted-foreground">
          Tell us who you are, what you supply, and why the partnership makes sense. Applications are reviewed before onboarding.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <label className="mb-2 block text-xs font-medium text-foreground" htmlFor="partnershipType">I want to partner as</label>
          <select id="partnershipType" name="partnershipType" required defaultValue="" className={fieldClassName}>
            <option value="" disabled>Select partnership type</option>
            {partnershipTypes.map((type) => <option key={type} value={type}>{type}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-xs font-medium text-foreground" htmlFor="organizationName">Farm, brand, or business name</label>
          <input id="organizationName" name="organizationName" required className={fieldClassName} placeholder="Your organisation" />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-foreground" htmlFor="contactName">Contact person</label>
          <input id="contactName" name="contactName" required className={fieldClassName} placeholder="Full name" />
        </div>

        <div>
          <label className="mb-2 block text-xs font-medium text-foreground" htmlFor="phone">Phone number</label>
          <input id="phone" name="phone" required autoComplete="tel" className={fieldClassName} placeholder="+94 ..." />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-xs font-medium text-foreground" htmlFor="email">Email address</label>
          <input id="email" name="email" type="email" required autoComplete="email" className={fieldClassName} placeholder="you@company.com" />
        </div>

        <div className="sm:col-span-2">
          <label className="mb-2 block text-xs font-medium text-foreground" htmlFor="requirement">Tell us about your products or partnership</label>
          <textarea
            id="requirement"
            name="requirement"
            rows={6}
            className={` ${fieldClassName} resize-none`}
            placeholder="Products or categories, location, production or supply capacity, current distribution, certifications where relevant, business requirement, and anything else we should know."
          />
        </div>
      </div>

      <button type="submit" disabled={status === "submitting"} className="group mt-6 flex h-12 w-full items-center justify-center rounded-lg bg-primary px-8 text-sm font-semibold text-accent-foreground transition-all hover:bg-primary/85 disabled:cursor-not-allowed disabled:opacity-60">
        {status === "submitting" ? "Submitting…" : "Submit partnership application"}
        <ArrowRight className="ml-2 h-4 w-4 transition-transform group-hover:translate-x-1" />
      </button>

      <p className="mt-4 text-xs leading-5 text-muted-foreground">
        Submitting an application does not guarantee onboarding or product listing. FreshPick reviews partnerships individually.
      </p>
      <p aria-live="polite" className={`mt-4 text-sm ${status === "error" ? "text-red-600" : "text-brand-green"} `}>{message}</p>
    </form>
  );
}
