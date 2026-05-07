import { useMemo, useState } from "react";
import { Megaphone, MessagesSquare, Search } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useCampaignLeads } from "../hooks";
import { EmptyState } from "./EmptyState";
import { ServiceWindowBadge } from "./ServiceWindowBadge";
import type {
  WhatsAppAnalyticsRange,
  WhatsAppCampaignLead,
  WhatsAppConversation,
} from "../types";

const RANGE_OPTIONS: Array<{ value: WhatsAppAnalyticsRange; label: string }> = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "all", label: "All time" },
];

interface Props {
  onOpenInInbox?: (conversationId: string) => void;
}

export function CampaignLeads({ onOpenInInbox }: Props) {
  const [range, setRange] = useState<WhatsAppAnalyticsRange>("7d");
  const { leads, loading, error } = useCampaignLeads(range);
  const [query, setQuery] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return leads;

    return leads.filter((lead) =>
      [
        lead.businessName,
        lead.contactName,
        lead.phoneNumber,
        lead.campaignName,
        lead.clientName,
        lead.prospectSource,
      ]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(q)),
    );
  }, [leads, query]);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">Campaign-attributed WhatsApp leads</h2>
          <p className="text-xs text-muted-foreground">
            Uses only conversations with a real `campaign_id` link in Supabase.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(event) => setQuery(event.target.value)}
              placeholder="Search campaign leads..."
              className="w-64 rounded-xl border-border bg-secondary/60 pl-9"
            />
          </div>
          <Select
            value={range}
            onValueChange={(value) => setRange(value as WhatsAppAnalyticsRange)}
          >
            <SelectTrigger className="w-32 rounded-xl border-border bg-secondary/60">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {RANGE_OPTIONS.map((option) => (
                <SelectItem key={option.value} value={option.value}>
                  {option.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, index) => (
            <div
              key={index}
              className="h-24 animate-pulse rounded-lg border border-border bg-card/40"
            />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={Megaphone}
          title="Could not load campaign leads"
          description={error}
        />
      ) : leads.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="Campaign attribution unavailable"
          description="No WhatsApp conversations in this range have a campaign_id. Cost and ad attribution also need Meta campaign/ad IDs, conversation attribution, an ad spend join, or a backend campaign lead table/view."
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Megaphone}
          title="No matching campaign leads"
          description="Try a different search or date range."
        />
      ) : (
        <div className="grid gap-2">
          {filtered.map((lead) => (
            <CampaignLeadRow
              key={lead.id}
              lead={lead}
              onOpenInInbox={onOpenInInbox}
            />
          ))}
        </div>
      )}
    </div>
  );
}

function CampaignLeadRow({
  lead,
  onOpenInInbox,
}: {
  lead: WhatsAppCampaignLead;
  onOpenInInbox?: (conversationId: string) => void;
}) {
  const conversation = toConversation(lead);

  return (
    <div className="rounded-lg border border-border bg-card/60 p-4">
      <div className="mb-2 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm">{lead.businessName}</p>
            <Badge variant="outline" className="border-border">
              {lead.campaignStatus}
            </Badge>
            {lead.needsHuman && (
              <Badge variant="outline" className="border-warning/30 text-warning">
                Needs human
              </Badge>
            )}
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {[lead.contactName, lead.phoneNumber, lead.clientName, lead.prospectSource]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <ServiceWindowBadge conversation={conversation} />
      </div>

      <p className="mb-2 text-sm text-foreground/90">
        {lead.lastMessage || "No message preview stored."}
      </p>

      <div className="mb-3 flex flex-wrap gap-x-3 gap-y-1 text-[11px] text-muted-foreground">
        <span>Campaign: {lead.campaignName}</span>
        <span>Channel: {lead.campaignChannel ?? "Unknown"}</span>
        <span>Conversation source: {lead.source}</span>
        <span>Stage: {lead.stage}</span>
        <span>Unread: {lead.unreadCount}</span>
      </div>

      <Button
        size="sm"
        className="bg-gradient-brand text-primary-foreground hover:opacity-90"
        onClick={() => onOpenInInbox?.(lead.conversationId)}
      >
        <MessagesSquare className="h-4 w-4" />
        Open in inbox
      </Button>
    </div>
  );
}

function toConversation(lead: WhatsAppCampaignLead): WhatsAppConversation {
  return {
    id: lead.conversationId,
    prospect_id: lead.prospectId ?? "",
    client_id: lead.clientId,
    campaign_id: lead.campaignId,
    business_name: lead.businessName,
    contact_name: lead.contactName,
    phone_number: lead.phoneNumber,
    source: "Meta Ad",
    source_key: lead.source,
    status: lead.status,
    stage: lead.stage,
    crm_stage: "New",
    lead_score: lead.leadScore ?? 0,
    assigned_to: "",
    last_message: lead.lastMessage,
    last_message_at: lead.lastMessageAt ?? lead.createdAt,
    unread_count: lead.unreadCount,
    last_inbound_at: null,
    service_window_expires_at: lead.serviceWindowOpenUntil,
    service_window_status: "open",
    opt_out: false,
    suppressed: false,
    needs_human: lead.needsHuman,
    tags: [lead.status, lead.stage].filter(Boolean),
    first_contact_at: lead.createdAt,
  };
}
