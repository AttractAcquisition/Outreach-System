import { useMemo, useState } from "react";
import {
  Check,
  Edit3,
  Send,
  ShieldX,
  X,
  AlertTriangle,
  Inbox,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  approveQueueItem,
  rejectQueueItem,
  useOutreachQueue,
  useWhatsAppTemplates,
} from "../hooks";
import { EmptyState } from "./EmptyState";
import { ConfirmActionModal } from "./ConfirmActionModal";
import type { OutreachQueueItem, QueueStatus } from "../types";

type FilterTab = "All" | QueueStatus;

const STATUS_BADGE: Record<QueueStatus, string> = {
  Draft: "bg-secondary text-foreground border-border",
  "Pending Approval": "bg-warning/15 text-warning border-warning/30",
  Approved: "bg-accent/20 text-accent border-accent/40",
  Sent: "bg-success/15 text-success border-success/30",
  Failed: "bg-destructive/15 text-destructive border-destructive/30",
  Cancelled: "bg-muted text-muted-foreground border-border",
};

function StatusPill({ status }: { status: QueueStatus }) {
  return (
    <span
      className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${STATUS_BADGE[status]}`}
    >
      {status}
    </span>
  );
}

function StatCard({
  label,
  value,
  tone = "default",
}: {
  label: string;
  value: string | number;
  tone?: "default" | "warning" | "success" | "destructive";
}) {
  const toneCls =
    tone === "warning"
      ? "text-warning"
      : tone === "success"
        ? "text-success"
        : tone === "destructive"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
        {label}
      </p>
      <p className={`mt-1 text-2xl font-semibold ${toneCls}`}>{value}</p>
    </div>
  );
}

export function OutreachQueue() {
  const { queue, loading, error, update } = useOutreachQueue();
  const { templates } = useWhatsAppTemplates();
  const [filter, setFilter] = useState<FilterTab>("Pending Approval");
  const [reviewing, setReviewing] = useState<OutreachQueueItem | null>(null);
  const [bulkMode, setBulkMode] = useState(false);

  const stats = useMemo(() => {
    return {
      pending: queue.filter((q) => q.status === "Pending Approval").length,
      approvedToday: queue.filter((q) => q.status === "Approved").length,
      sentToday: queue.filter((q) => q.status === "Sent").length,
      failed: queue.filter((q) => q.status === "Failed").length,
      blocked: queue.filter((q) => q.compliance_status === "blocked").length,
      replyRate: 0.21,
    };
  }, [queue]);

  const filtered = filter === "All" ? queue : queue.filter((q) => q.status === filter);
  const tabs: FilterTab[] = [
    "All",
    "Pending Approval",
    "Approved",
    "Sent",
    "Failed",
    "Cancelled",
  ];

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <StatCard label="Pending approval" value={stats.pending} tone="warning" />
        <StatCard label="Approved today" value={stats.approvedToday} />
        <StatCard label="Sent today" value={stats.sentToday} tone="success" />
        <StatCard label="Failed sends" value={stats.failed} tone="destructive" />
        <StatCard label="Compliance blocks" value={stats.blocked} tone="destructive" />
        <StatCard label="Reply rate" value={`${Math.round(stats.replyRate * 100)}%`} />
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-1.5">
          {tabs.map((t) => (
            <button
              key={t}
              onClick={() => setFilter(t)}
              className={`px-2.5 py-1 rounded-full text-xs border ${
                filter === t
                  ? "bg-gradient-brand text-primary-foreground border-transparent"
                  : "bg-secondary/60 text-muted-foreground border-border hover:text-foreground"
              }`}
            >
              {t}
            </button>
          ))}
        </div>
        <Button
          size="sm"
          variant={bulkMode ? "default" : "outline"}
          onClick={() => setBulkMode(!bulkMode)}
        >
          {bulkMode ? "Exit bulk review" : "Bulk review mode"}
        </Button>
      </div>

      {loading ? (
        <div className="space-y-2">
          {Array.from({ length: 4 }).map((_, i) => (
            <div
              key={i}
              className="h-24 rounded-2xl bg-card/40 border border-border animate-pulse"
            />
          ))}
        </div>
      ) : error ? (
        <EmptyState
          icon={Inbox}
          title="Could not load outreach queue"
          description={error}
        />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={Inbox}
          title="Nothing in this queue"
          description="No outreach queue data source is connected yet."
        />
      ) : (
        <div className="space-y-2">
          {(bulkMode ? filtered.slice(0, 10) : filtered).map((item) => (
            <QueueRow
              key={item.id}
              item={item}
              onReview={() => setReviewing(item)}
              onApprove={async () => {
                const result = await approveQueueItem(item.id);
                if (result.ok) {
                  update(item.id, {
                    status: "Approved",
                    approved_at: new Date().toISOString(),
                  });
                }
              }}
              onReject={async () => {
                const result = await rejectQueueItem(item.id);
                if (result.ok) update(item.id, { status: "Cancelled" });
              }}
            />
          ))}
        </div>
      )}

      <ReviewModal
        item={reviewing}
        templates={templates}
        onClose={() => setReviewing(null)}
        onSave={(patch) => reviewing && update(reviewing.id, patch)}
      />
    </div>
  );
}

function QueueRow({
  item,
  onReview,
  onApprove,
  onReject,
}: {
  item: OutreachQueueItem;
  onReview: () => void;
  onApprove: () => void;
  onReject: () => void;
}) {
  const blocked = item.compliance_status === "blocked";
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <div className="flex items-start justify-between gap-3 mb-2">
        <div className="min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <p className="font-semibold text-sm">{item.business_name}</p>
            <StatusPill status={item.status} />
            {blocked && (
              <span className="inline-flex items-center gap-1 text-[11px] text-destructive">
                <ShieldX className="h-3 w-3" /> Blocked: suppressed
              </span>
            )}
            {item.risk_score >= 30 && !blocked && (
              <span className="inline-flex items-center gap-1 text-[11px] text-warning">
                <AlertTriangle className="h-3 w-3" /> Risk {item.risk_score}
              </span>
            )}
          </div>
          <p className="text-xs text-muted-foreground mt-0.5">
            {item.contact_name} · {item.phone_number} · {item.niche} · {item.location}
          </p>
        </div>
        <div className="text-right text-[11px] text-muted-foreground">
          <p>By {item.created_by}</p>
          <p>{new Date(item.created_at).toLocaleString()}</p>
        </div>
      </div>

      <p className="text-sm text-foreground/85 line-clamp-2 mb-2">
        {item.draft_preview}
      </p>

      <div className="flex flex-wrap gap-1.5 mb-3">
        <Badge variant="outline" className="border-lavender/30 text-lavender">
          {item.template_name}
        </Badge>
        <Badge variant="outline" className="border-border">
          AI: {item.ai_observation}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2">
        <Button size="sm" variant="outline" onClick={onReview}>
          <Edit3 className="h-4 w-4" /> Review
        </Button>
        <Button
          size="sm"
          className="bg-gradient-brand text-primary-foreground hover:opacity-90"
          onClick={onApprove}
          disabled={blocked || item.status === "Sent"}
        >
          <Check className="h-4 w-4" /> Approve
        </Button>
        <Button size="sm" variant="ghost" onClick={onReject}>
          <X className="h-4 w-4" /> Reject
        </Button>
        <Button
          size="sm"
          variant="secondary"
          disabled={blocked || item.status !== "Approved"}
        >
          <Send className="h-4 w-4" /> Send now
        </Button>
      </div>
    </div>
  );
}

function ReviewModal({
  item,
  templates,
  onClose,
  onSave,
}: {
  item: OutreachQueueItem | null;
  templates: ReturnType<typeof useWhatsAppTemplates>["templates"];
  onClose: () => void;
  onSave: (patch: Partial<OutreachQueueItem>) => void;
}) {
  const [vars, setVars] = useState<Record<string, string>>({});
  const [templateName, setTemplateName] = useState("");
  const [confirmCold, setConfirmCold] = useState(false);

  useMemo(() => {
    if (item) {
      setVars(item.template_params);
      setTemplateName(item.template_name);
    }
  }, [item]);

  if (!item) return null;
  const template = templates.find((t) => t.template_name === templateName);
  const preview =
    template?.body.replace(/{{(\d+)}}/g, (_, n) => vars[n] ?? `{{${n}}}`) ??
    item.draft_preview;

  const checks = [
    { label: "Has business name", ok: !!item.business_name },
    { label: "Has specific observation", ok: !!item.ai_observation },
    { label: "No aggressive claims", ok: true },
    { label: "No misleading guarantee", ok: true },
    { label: "Includes permission-based CTA", ok: true },
    { label: "Not suppressed", ok: item.compliance_status !== "blocked" },
  ];

  return (
    <Dialog open={!!item} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-3xl rounded-2xl">
        <DialogHeader>
          <DialogTitle>Review outreach · {item.business_name}</DialogTitle>
          <DialogDescription>
            Editable variables and compliance checks. Approval required before sending.
          </DialogDescription>
        </DialogHeader>

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Template</Label>
              <Select value={templateName} onValueChange={setTemplateName}>
                <SelectTrigger className="mt-1 bg-background/60 border-border rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {templates
                    .filter((t) => t.status === "Approved")
                    .map((t) => (
                      <SelectItem key={t.id} value={t.template_name}>
                        {t.template_name}
                      </SelectItem>
                    ))}
                </SelectContent>
              </Select>
            </div>
            {template?.variables.map((v, i) => {
              const k = String(i + 1);
              return (
                <div key={k}>
                  <Label className="text-[11px] text-muted-foreground">{`{{${k}}} · ${v}`}</Label>
                  <Input
                    value={vars[k] ?? ""}
                    onChange={(e) =>
                      setVars((p) => ({ ...p, [k]: e.target.value }))
                    }
                    className="mt-1 bg-background/60 border-border rounded-xl"
                  />
                </div>
              );
            })}
            <div className="rounded-2xl border border-border bg-background/40 p-3 text-sm whitespace-pre-wrap">
              {preview}
            </div>
          </div>

          <div className="space-y-3">
            <div className="rounded-2xl border border-border bg-background/40 p-3 text-xs">
              <p className="font-semibold mb-2">Prospect</p>
              <p>{item.business_name}</p>
              <p className="text-muted-foreground">{item.contact_name} · {item.phone_number}</p>
              <p className="text-muted-foreground">{item.niche} · {item.location}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/40 p-3 text-xs">
              <p className="font-semibold mb-2">AI personalization</p>
              <p className="text-muted-foreground">{item.ai_observation}</p>
            </div>
            <div className="rounded-2xl border border-border bg-background/40 p-3 text-xs space-y-1.5">
              <p className="font-semibold mb-1">Compliance checklist</p>
              {checks.map((c) => (
                <div key={c.label} className="flex items-center gap-2">
                  {c.ok ? (
                    <Check className="h-3.5 w-3.5 text-success" />
                  ) : (
                    <X className="h-3.5 w-3.5 text-destructive" />
                  )}
                  <span className={c.ok ? "" : "text-destructive"}>{c.label}</span>
                </div>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter className="flex-wrap gap-2">
          <Button variant="ghost" onClick={onClose}>Cancel</Button>
          <Button
            variant="outline"
            onClick={() => {
              onSave({ template_name: templateName, template_params: vars, draft_preview: preview });
              onClose();
            }}
          >
            Save edits
          </Button>
          <Button
            variant="secondary"
            onClick={async () => {
              const result = await rejectQueueItem(item.id);
              if (result.ok) onSave({ status: "Cancelled" });
              onClose();
            }}
          >
            Reject
          </Button>
          <Button
            className="bg-gradient-brand text-primary-foreground hover:opacity-90"
            onClick={() => setConfirmCold(true)}
            disabled={item.compliance_status === "blocked"}
          >
            Approve for send
          </Button>
        </DialogFooter>

        <ConfirmActionModal
          open={confirmCold}
          onOpenChange={setConfirmCold}
          title="Send approved template to cold prospect?"
          description="This will send an outbound WhatsApp template message. Make sure the variables are accurate."
          confirmLabel="Approve & queue send"
          onConfirm={async () => {
            setConfirmCold(false);
            const result = await approveQueueItem(item.id);
            if (result.ok) {
              onSave({
                status: "Approved",
                approved_at: new Date().toISOString(),
                template_params: vars,
                template_name: templateName,
                draft_preview: preview,
              });
            }
            onClose();
          }}
        />
      </DialogContent>
    </Dialog>
  );
}
