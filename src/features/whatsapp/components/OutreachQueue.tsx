import { useMemo, useState } from "react";
import {
  Check,
  Clipboard,
  Inbox,
  Loader2,
  MessageSquareText,
  RefreshCw,
  X,
} from "lucide-react";
import { toast } from "sonner";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useApproveWhatsAppSuggestion,
  useRejectWhatsAppSuggestion,
  useWhatsAppPendingSuggestions,
} from "../hooks";
import { EmptyState } from "./EmptyState";
import type { WhatsAppPendingSuggestion } from "../types";

function firstString(...values: Array<string | null | undefined>) {
  return values.find((value) => value && value.trim().length > 0) ?? "";
}

function formatPercent(value: number | null) {
  if (value === null || Number.isNaN(value)) return "n/a";
  return `${Math.round(value * 100)}%`;
}

function getDisplayContext(item: WhatsAppPendingSuggestion) {
  const businessName = firstString(
    item.prospect?.business_name,
    item.conversation?.contact_name,
    item.conversation?.phone_number,
    "Unknown contact",
  );
  const contactName = firstString(
    item.prospect?.owner_name,
    item.conversation?.contact_name,
    item.conversation?.phone_number,
  );
  const phoneNumber = firstString(
    item.conversation?.phone_number,
    item.prospect?.whatsapp,
    item.prospect?.phone,
  );
  const location = [item.prospect?.suburb, item.prospect?.city]
    .filter(Boolean)
    .join(", ");

  return {
    businessName,
    contactName,
    phoneNumber,
    location,
    vertical: item.prospect?.vertical ?? "",
    stage: item.conversation?.stage ?? item.prospect?.pipeline_stage ?? "",
  };
}

export function OutreachQueue() {
  const { suggestions, loading, error, reload } = useWhatsAppPendingSuggestions();
  const approveSuggestion = useApproveWhatsAppSuggestion();
  const rejectSuggestion = useRejectWhatsAppSuggestion();
  const [rejecting, setRejecting] = useState<WhatsAppPendingSuggestion | null>(null);
  const [rejectionReason, setRejectionReason] = useState("");

  const stats = useMemo(() => {
    const highConfidence = suggestions.filter(
      (item) => (item.confidence ?? 0) >= 0.75,
    ).length;
    const needsContext = suggestions.filter(
      (item) => !item.prospect_id && !item.client_id,
    ).length;

    return {
      pending: suggestions.length,
      highConfidence,
      needsContext,
    };
  }, [suggestions]);

  async function copySuggestion(item: WhatsAppPendingSuggestion) {
    try {
      await navigator.clipboard.writeText(item.suggested_body);
      toast.success("Suggestion copied");
    } catch (_err) {
      toast.error("Could not copy suggestion");
    }
  }

  async function confirmReject() {
    if (!rejecting) return;
    await rejectSuggestion.mutateAsync({
      id: rejecting.id,
      reason: rejectionReason,
    });
    setRejecting(null);
    setRejectionReason("");
  }

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-3">
        <QueueStat label="Pending AI suggestions" value={stats.pending} />
        <QueueStat label="High confidence" value={stats.highConfidence} />
        <QueueStat label="Needs more context" value={stats.needsContext} />
      </div>

      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">WhatsApp human approval</h2>
          <p className="text-xs text-muted-foreground">
            AI reply drafts require a human decision before use. Nothing here sends to Meta.
          </p>
        </div>
        <Button
          type="button"
          size="sm"
          variant="outline"
          onClick={() => void reload()}
          disabled={loading}
        >
          <RefreshCw className="h-4 w-4" />
          Refresh
        </Button>
      </div>

      {loading ? (
        <div className="rounded-lg border border-border bg-card/60 p-6 text-sm text-muted-foreground">
          <Loader2 className="mr-2 inline h-4 w-4 animate-spin" />
          Loading pending WhatsApp suggestions...
        </div>
      ) : error ? (
        <EmptyState
          icon={Inbox}
          title="Could not load approval queue"
          description={error}
        />
      ) : suggestions.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="No pending WhatsApp suggestions"
          description="Generated reply suggestions that need review will appear here."
        />
      ) : (
        <div className="space-y-3">
          {suggestions.map((item) => (
            <SuggestionRow
              key={item.id}
              item={item}
              approving={approveSuggestion.isPending}
              rejecting={rejectSuggestion.isPending}
              onApprove={() => approveSuggestion.mutate(item.id)}
              onReject={() => setRejecting(item)}
              onCopy={() => void copySuggestion(item)}
            />
          ))}
        </div>
      )}

      <Dialog open={!!rejecting} onOpenChange={(open) => !open && setRejecting(null)}>
        <DialogContent className="max-w-md rounded-lg">
          <DialogHeader>
            <DialogTitle>Reject AI suggestion</DialogTitle>
          </DialogHeader>
          <div className="space-y-2">
            <Label htmlFor="rejection-reason" className="text-xs text-muted-foreground">
              Reason
            </Label>
            <Textarea
              id="rejection-reason"
              value={rejectionReason}
              onChange={(event) => setRejectionReason(event.target.value)}
              rows={3}
              className="bg-background/60"
              placeholder="Optional note for the approval record"
            />
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setRejecting(null)}>
              Cancel
            </Button>
            <Button
              variant="destructive"
              onClick={() => void confirmReject()}
              disabled={rejectSuggestion.isPending}
            >
              Reject
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

function QueueStat({ label, value }: { label: string; value: string | number }) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-4">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className="mt-1 text-2xl font-semibold text-foreground">{value}</p>
    </div>
  );
}

function SuggestionRow({
  item,
  approving,
  rejecting,
  onApprove,
  onReject,
  onCopy,
}: {
  item: WhatsAppPendingSuggestion;
  approving: boolean;
  rejecting: boolean;
  onApprove: () => void;
  onReject: () => void;
  onCopy: () => void;
}) {
  const context = getDisplayContext(item);

  return (
    <div className="rounded-lg border border-border bg-card/60 p-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex flex-wrap items-center gap-2">
            <p className="font-semibold text-sm">{context.businessName}</p>
            <Badge variant="outline" className="border-warning/30 text-warning">
              {item.status === "pending" ? "pending_review" : item.status}
            </Badge>
            <Badge variant="outline" className="border-border">
              Confidence {formatPercent(item.confidence)}
            </Badge>
          </div>
          <p className="mt-1 text-xs text-muted-foreground">
            {[context.contactName, context.phoneNumber, context.vertical, context.location]
              .filter(Boolean)
              .join(" · ")}
          </p>
        </div>
        <p className="text-[11px] text-muted-foreground">
          {new Date(item.created_at).toLocaleString()}
        </p>
      </div>

      <div className="mt-3 rounded-lg border border-border bg-background/40 p-3">
        <div className="mb-2 flex items-center gap-2 text-xs font-medium text-muted-foreground">
          <MessageSquareText className="h-3.5 w-3.5" />
          Proposed message
        </div>
        <p className="whitespace-pre-wrap text-sm text-foreground/90">
          {item.suggested_body}
        </p>
      </div>

      <div className="mt-3 grid gap-2 md:grid-cols-2">
        <ContextLine label="Reason" value={item.reason || "No reason stored"} />
        <ContextLine
          label="Conversation"
          value={
            item.conversation?.last_message_preview ||
            context.stage ||
            "No conversation summary stored"
          }
        />
      </div>

      <div className="mt-3 flex flex-wrap gap-2">
        <Button
          size="sm"
          className="bg-gradient-brand text-primary-foreground hover:opacity-90"
          onClick={onApprove}
          disabled={approving || rejecting}
        >
          <Check className="h-4 w-4" />
          Approve
        </Button>
        <Button
          size="sm"
          variant="outline"
          onClick={onCopy}
          disabled={approving || rejecting}
        >
          <Clipboard className="h-4 w-4" />
          Copy/use in composer
        </Button>
        <Button
          size="sm"
          variant="ghost"
          onClick={onReject}
          disabled={approving || rejecting}
        >
          <X className="h-4 w-4" />
          Reject
        </Button>
      </div>
    </div>
  );
}

function ContextLine({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-lg border border-border bg-background/30 p-3 text-xs">
      <p className="font-medium text-foreground">{label}</p>
      <p className="mt-1 line-clamp-3 text-muted-foreground">{value}</p>
    </div>
  );
}
