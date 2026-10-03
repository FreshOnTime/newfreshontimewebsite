"use client";

import { useState } from "react";
import { Handshake, Mail, Phone, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { toast } from "sonner";
import { authenticatedApiFetch } from "@/lib/api/authenticated-fetch";
import { useAdminQueue } from "@/components/admin/useAdminQueue";
import { QueueFeedback } from "@/components/admin/QueueFeedback";

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
  new: "bg-secondary text-brand-green",
  contacted: "bg-amber-50 text-amber-700",
  qualified: "bg-secondary text-brand-green",
  won: "bg-secondary text-brand-green",
  lost: "bg-secondary text-muted-foreground",
};

export default function BusinessLeadsPage() {
  const [filter, setFilter] = useState<"all" | LeadStatus>("all");
  const [savingId, setSavingId] = useState<string | null>(null);
  const queue = useAdminQueue<BusinessLead>(`/api/admin/business-leads${filter === 'all' ? '' : `?status=${filter}`}`, 'leads');
  const { items: filteredLeads, loading } = queue;
  const loadLeads = queue.reload;

  async function updateStatus(id: string, status: LeadStatus) {
    try {
      setSavingId(id);
      const response = await authenticatedApiFetch("/api/admin/business-leads", {
        method: "PATCH",
        body: JSON.stringify({ id, status }),
      });
      const data = await response.json().catch(() => null);
      if (!response.ok) throw new Error(data?.error || "Unable to update application");
      queue.reload();
      toast.success("Partnership status updated");
    } catch (error) {
      toast.error(error instanceof Error ? error.message : "Unable to update partnership status");
    } finally {
      setSavingId(null);
    }
  }

  return (
    <div className="space-y-6">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <p className="text-sm font-semibold uppercase tracking-[0.16em] text-brand-green">Partnership pipeline</p>
          <h1 className="mt-2 text-3xl font-normal text-foreground">Supplier & partnership applications</h1>
          <p className="mt-2 text-muted-foreground">Applications from growers, makers, distributors, business buyers, and strategic partners.</p>
        </div>
        <Button variant="outline" onClick={loadLeads} disabled={loading}>
          <RefreshCw className={`mr-2 h-4 w-4 ${loading ? "animate-spin" : ""}`} /> Refresh
        </Button>
      </div>

      <div className="flex flex-wrap gap-2">
        {(["all", ...statuses] as const).map((status) => (
          <button key={status} onClick={() => setFilter(status)} className={`rounded-full px-4 py-2 text-sm font-medium transition-colors ${filter === status ? "bg-brand-leaf text-brand-ink" : "bg-background text-muted-foreground ring-1 ring-border hover:bg-secondary"}`}>
            {status === "all" ? 'All' : `${status[0].toUpperCase()}${status.slice(1)}`}
          </button>
        ))}
      </div>

      {queue.error ? <QueueFeedback loading={false} error={queue.error} retry={loadLeads} /> : loading ? (
        <div className="flex justify-center py-20"><RefreshCw className="h-8 w-8 animate-spin text-brand-green" /></div>
      ) : filteredLeads.length === 0 ? (
        <Card><CardContent className="py-16 text-center text-muted-foreground">No partnership applications in this view yet.</CardContent></Card>
      ) : (
        <div className="grid gap-4 xl:grid-cols-2">
          {filteredLeads.map((lead) => (
            <Card key={lead._id}>
              <CardHeader className="pb-3">
                <div className="flex items-start justify-between gap-4">
                  <div className="flex items-start gap-3">
                    <div className="rounded-full bg-secondary p-2.5 text-brand-green"><Handshake className="h-5 w-5" /></div>
                    <div>
                      <CardTitle className="text-xl">{lead.organizationName}</CardTitle>
                      <CardDescription>{lead.contactName} · {new Date(lead.createdAt).toLocaleDateString("en-LK", { dateStyle: "medium" })}</CardDescription>
                    </div>
                  </div>
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold capitalize ${statusStyles[lead.status]}`}>{lead.status}</span>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex flex-wrap gap-x-5 gap-y-2 text-sm text-muted-foreground">
                  <a className="inline-flex items-center gap-2 hover:text-brand-green" href={`mailto:${lead.email}`}><Mail className="h-4 w-4" />{lead.email}</a>
                  <a className="inline-flex items-center gap-2 hover:text-brand-green" href={`tel:${lead.phone}`}><Phone className="h-4 w-4" />{lead.phone}</a>
                </div>
                {lead.requirement && <p className="whitespace-pre-line rounded-lg bg-secondary p-4 text-sm leading-relaxed text-muted-foreground">{lead.requirement}</p>}
                <label className="flex items-center justify-between gap-3 border-t border-border pt-4 text-sm font-medium text-foreground">
                  Partnership status
                  <select value={lead.status} disabled={savingId === lead._id} onChange={(event) => updateStatus(lead._id, event.target.value as LeadStatus)} className="rounded-md border border-border bg-background px-3 py-2 text-sm disabled:opacity-60">
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
