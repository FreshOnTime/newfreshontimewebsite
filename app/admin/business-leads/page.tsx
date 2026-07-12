"use client";

import { useEffect, useMemo, useState } from "react";
import { Building2, Mail, Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";

const statuses = ["new", "contacted", "qualified", "won", "lost"] as const;
type LeadStatus = (typeof statuses)[number];

interface BusinessLead {
  _id: string;
  organizationName: string;
  contactName: string;
  email: string;
  phone: string;
  requirement: string;
  status: LeadStatus;
  createdAt: string;
}

const statusStyles: Record<LeadStatus, string> = {
  new: "bg-blue-50 text-blue-700",
  contacted: "bg-amber-50 text-amber-700",
  qualified: "bg-violet-50 text-violet-700",
  won: "bg-emerald-50 text-emerald-700",
  lost: "bg-zinc-100 text-zinc-600",
};

export default function BusinessLeadsPage() {
  const [leads, setLeads] = useState<BusinessLead[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [savingId, setSavingId] = useState<string | null>(null);

  const filteredLeads = useMemo(
    () => filter === "all" ? leads : leads.filter((lead) => lead.status === filter),
    [filter, leads]
  );

  async function loadLeads() {
    try {
      setLoading(true);
      const response = await fetch("/api/admin/business-leads", { credentials: "include" });
      if (!response.ok) throw new Error("Unable to load leads");
      const data = await response.json();
      setLeads(data.leads || []);
    } catch {
      toast.error("Unable to load B2B leads");
    } finally {
      setLoading(false);
    }
  }

  useEffect(() => { loadLeads(); }, []);

  async function updateStatus(id: string, status: LeadStatus) {
    try {
      setSavingId(id);
      const response = await fetch("/api/admin/business-leads", {
        method: "PATCH",
        credentials: "include",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, status }),
      });
      if (!response.ok) throw new Error("Unable to update lead");
      setLeads((current) => current.map((lead) => lead._id === id ? { ...lead, status } : lead));
      toast.success("Lead status updated");
    } catch {
      toast.error("Unable to update lead status");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-emerald-700">Sales pipeline</p>
          <h1 className="mt-2 text-3xl font-bold text-gray-900">B2B leads</h1>
          <p className="mt-2 text-gray-600">Supply requests from restaurants, offices, hotels, and households.</p>
        </div>
        <Button variant="outline" onClick={loadLeads} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", ...statuses] as const).map((status) => (
          <button key={status} onClick={() => setFilter(status)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${filter === status ? "bg-emerald-700 text-white" : "bg-white text-zinc-600 ring-1 ring-zinc-200 hover:bg-emerald-50"}`}>
            {status === "all" ? `All (${leads.length})` : `${status[0].toUpperCase()}${status.slice(1)}`}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-8 w-8 animate-spin text-emerald-700" /></div>
      ) : filteredLeads.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-zinc-500">No B2B leads in this view yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredLeads.map((lead) => (
            <Card key={lead._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-emerald-50 p-2.5 text-emerald-700"><Building2 className="h-5 w-5" /></div>
                    <div>
                      <CardTitle className="text-xl">{lead.organizationName}</CardTitle>
                      <CardDescription>{lead.contactName} · {new Date(lead.createdAt).toLocaleDateString("en-LK", { dateStyle: "medium" })}</CardDescription>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[lead.status]}`}>{lead.status}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-zinc-600">
                  <a className="inline-flex items-center gap-2 hover:text-emerald-700" href={`mailto:${lead.email}`}><Mail className="h-4 w-4" />{lead.email}</a>
                  <a className="inline-flex items-center gap-2 hover:text-emerald-700" href={`tel:${lead.phone}`}><Phone className="h-4 w-4" />{lead.phone}</a>
                </div>
                {lead.requirement && <p className="rounded-lg bg-zinc-50 p-4 text-sm leading-relaxed text-zinc-600">{lead.requirement}</p>}
                <label className="flex items-center justify-between gap-3 border-t border-zinc-100 pt-4 text-sm font-medium text-zinc-700">
                  Pipeline status
                  <select value={lead.status} disabled={savingId === lead._id} onChange={(event) => updateStatus(lead._id, event.target.value as LeadStatus)} className="rounded-md border border-zinc-200 bg-white px-3 py-2 text-sm disabled:opacity-60">
                    {statuses.map((status) => <option key={status} value={status}>{status[0].toUpperCase()}{status.slice(1)}</option>)}
                  </select>
                </label>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}
