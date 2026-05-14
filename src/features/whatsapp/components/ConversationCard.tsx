import { cn } from "@/lib/utils";
import { ServiceWindowBadge } from "./ServiceWindowBadge";
import { CrmStageBadge } from "./CrmStageBadge";
import { SourceBadge } from "./SourceBadge";
import { AlertTriangle, ShieldX } from "lucide-react";
import type { WhatsAppConversation } from "../types";

interface Props {
  conversation: WhatsAppConversation;
  active: boolean;
  onSelect: () => void;
}

function timeAgo(iso: string) {
  const diff = Date.now() - new Date(iso).getTime();
  const m = Math.floor(diff / 60000);
  if (m < 1) return "now";
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  return `${Math.floor(h / 24)}d`;
}

export function ConversationCard({ conversation, active, onSelect }: Props) {
  const c = conversation;
  return (
    <button
      type="button"
      onClick={onSelect}
      className={cn(
        "w-full text-left rounded-2xl border p-3 transition-all min-h-[56px]",
        "hover:bg-card/80",
        active
          ? "border-accent/60 bg-card shadow-glow"
          : "border-border bg-card/50",
      )}
    >
      <div className="flex items-start justify-between gap-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 min-w-0">
            <p className="truncate font-semibold text-sm">{c.business_name}</p>
            {c.needs_human && (
              <AlertTriangle className="h-3.5 w-3.5 text-warning shrink-0" />
            )}
            {c.suppressed && (
              <ShieldX className="h-3.5 w-3.5 text-destructive shrink-0" />
            )}
          </div>
          <p className="truncate text-xs text-muted-foreground mt-0.5">
            {c.contact_name} · <span className="font-mono">{c.phone_number}</span>
          </p>
        </div>
        <div className="flex flex-col items-end gap-1 shrink-0">
          <span className="font-mono text-[10px] text-muted-foreground">
            {timeAgo(c.last_message_at)}
          </span>
          {c.unread_count > 0 && (
            <span className="inline-flex items-center justify-center min-w-[18px] h-[18px] rounded-full bg-gradient-brand text-primary-foreground text-[10px] font-mono font-semibold px-1.5">
              {c.unread_count}
            </span>
          )}
        </div>
      </div>

      <p className="mt-2 line-clamp-1 text-sm text-foreground/85">
        {c.last_message || "No messages yet"}
      </p>

      <div className="mt-2.5 flex flex-wrap gap-1.5">
        <CrmStageBadge stage={c.crm_stage} />
        {c.status && (
          <span className="inline-flex items-center rounded-full border border-border bg-secondary px-2 py-0.5 text-[11px] font-medium text-muted-foreground whitespace-nowrap">
            {c.status}
          </span>
        )}
        <SourceBadge source={c.source} />
        <ServiceWindowBadge conversation={c} />
      </div>
    </button>
  );
}
