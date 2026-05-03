import { useMemo, useState } from "react";
import { Megaphone, MessagesSquare, Sparkles, CalendarPlus, CheckCircle2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Search } from "lucide-react";
import { useCampaignLeads } from "../hooks";
import { ServiceWindowBadge } from "./ServiceWindowBadge";
import { EmptyState } from "./EmptyState";
import { toast } from "sonner";
import type { CampaignLead, WhatsAppConversation } from "../types";

const STATUS_FILTERS: Array<CampaignLead["lead_status"] | "All"> = [
  "All",
  "New",
  "Assigned",
  "Qualified",
  "Booked",
  "Closed",
];

interface Props {
  onOpenInInbox?: (conversationId: string) => void;
}

export function CampaignLeads({ onOpenInInbox }: Props) {
  const { leads, loading } = useCampaignLeads();
  const [filter, setFilter] = useState<(typeof STATUS_FILTERS)[number]>("All");
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    let list = leads;
    if (filter !== "All") list = list.filter((l) => l.lead_status === filter);
    const q = query.toLowerCase().trim();
    if (q)
      list = list.filter(
        (l) =>
          l.business_name.toLowerCase().includes(q) ||
          l.contact_name.toLowerCase().includes(q) ||
          l.phone_number.toLowerCase().includes(q) ||
          l.campaign_name.toLowerCase().includes(q),
      );
    return list;
  }, [leads, filter, query]);

  if (loading) {
    return (
      <div className="space-y-2">
        {Array.from({ length: 4 }).map((_, i) => (
          <div key={i} className="h-24 rounded-2xl bg-card/40 border border-border animate-pulse" />
        ))}
      </div>
    );
  }

  // Build a synthetic conversation just for ServiceWindowBadge
  const asConv = (l: CampaignLead): WhatsAppConversation => ({
    id: l.conversation_id,
    prospect_id: l.id,
    business_name: l.business_name,
    contact_name: l.contact_name,
    phone_number: l.phone_number,
    source: "Meta Ad",
    crm_stage: "New",
    lead_score: 0,
    assigned_to: l.assigned_to ?? "",
    last_message: l.initial_message,
    last_message_at: l.received_at,
    unread_count: 0,
    last_inbound_at: l.received_at,
    service_window_expires_at: l.service_window_expires_at,
    service_window_status: "open",
    opt_out: false,
    suppressed: false,
    tags: [],
  });

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center gap-3 justify-between">
        <div className="flex flex-wrap gap-1.5">
          {STATUS_FILTERS.map((s) => (
            <button
              key={s}
              onClick={() => setFilter(s)}
              className={`px-2.5 py-1 rounded-full text-xs border ${
                filter === s
                  ? "bg-gradient-brand text-primary-foreground border-transparent"
                  : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {s}
            </button>
          ))}
        </div>
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search leads…"
            className="pl-9 w-64 bg-secondary/60 border-border rounded-xl"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No campaign leads"
          description="Inbound Meta Click-to-WhatsApp leads will appear here."
        />
      ) : (
        <div className="grid gap-2">
          {filtered.map((l) => (
            <div key={l.id} className="rounded-2xl border border-border bg-card/60 p-4">
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{l.business_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {l.contact_name} · {l.phone_number} · {l.niche} · {l.location}
                  </p>
                </div>
                <ServiceWindowBadge conversation={asConv(l)} />
              </div>

              <p className="text-sm text-foreground/90 mb-2">"{l.initial_message}"</p>

              <div className="text-[11px] text-muted-foreground flex flex-wrap gap-x-3 gap-y-1 mb-3">
                <span>Campaign: {l.campaign_name}</span>
                <span>· Ad set: {l.adset_name}</span>
                <span>· Ad: {l.ad_name}</span>
                <span>· Status: {l.lead_status}</span>
              </div>

              <div className="flex flex-wrap gap-2">
                <Button
                  size="sm"
                  className="bg-gradient-brand text-primary-foreground hover:opacity-90"
                  onClick={() => onOpenInInbox?.(l.conversation_id)}
                >
                  <MessagesSquare className="h-4 w-4" /> Open in inbox
                </Button>
                <Button size="sm" variant="outline" onClick={() => toast("AI reply suggestion generated")}>
                  <Sparkles className="h-4 w-4" /> Generate reply
                </Button>
                <Button size="sm" variant="secondary" onClick={() => toast.success("Marked qualified")}>
                  <CheckCircle2 className="h-4 w-4" /> Mark qualified
                </Button>
                <Button size="sm" variant="ghost" onClick={() => toast.success("Call booked")}>
                  <CalendarPlus className="h-4 w-4" /> Book call
                </Button>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
