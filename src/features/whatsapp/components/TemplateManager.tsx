import { useMemo, useState } from "react";
import { Copy, FileText, Send } from "lucide-react";
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
import { toast } from "sonner";
import { useWhatsAppTemplates } from "../hooks";
import { EmptyState } from "./EmptyState";
import type { TemplateStatus } from "../types";

const STATUS_CLS: Record<TemplateStatus, string> = {
  Draft: "bg-secondary text-foreground border-border",
  Submitted: "bg-warning/15 text-warning border-warning/30",
  Approved: "bg-success/15 text-success border-success/30",
  Rejected: "bg-destructive/15 text-destructive border-destructive/30",
  Paused: "bg-muted text-muted-foreground border-border",
};

export function TemplateManager() {
  const { templates, loading } = useWhatsAppTemplates();
  const [selectedId, setSelectedId] = useState<string>(templates[0]?.id ?? "");
  const [vars, setVars] = useState<Record<string, string>>({});

  const selected = useMemo(
    () => templates.find((t) => t.id === selectedId) ?? templates[0],
    [templates, selectedId],
  );

  const preview = useMemo(() => {
    if (!selected) return "";
    return selected.body.replace(/{{(\d+)}}/g, (_, n) => vars[n] ?? `{{${n}}}`);
  }, [selected, vars]);

  if (loading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-card/40 border border-border animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (templates.length === 0) {
    return (
      <EmptyState
        icon={FileText}
        title="No templates yet"
        description="Once Meta-approved templates sync, they will appear here."
      />
    );
  }

  return (
    <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
      <div className="space-y-3">
        <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 text-sm">
          <p className="font-semibold mb-1 text-accent">How templates work</p>
          <ul className="list-disc list-inside space-y-1 text-muted-foreground">
            <li>Templates are required when Attract Acquisition starts the conversation.</li>
            <li>Templates are required when the 24-hour window is closed.</li>
            <li>Free-form replies are allowed after the prospect replies.</li>
            <li>AI may fill variables but should not rewrite the approved template structure.</li>
          </ul>
        </div>

        <div className="grid gap-2">
          {templates.map((t) => (
            <button
              key={t.id}
              onClick={() => setSelectedId(t.id)}
              className={`text-left rounded-2xl border p-4 transition-all ${
                selected?.id === t.id
                  ? "border-accent/60 bg-card shadow-glow"
                  : "border-border bg-card/60 hover:bg-card"
              }`}
            >
              <div className="flex items-start justify-between gap-3 mb-2">
                <div className="min-w-0">
                  <p className="font-semibold text-sm">{t.template_name}</p>
                  <p className="text-xs text-muted-foreground">
                    {t.category} · {t.language.toUpperCase()} · {t.use_case}
                  </p>
                </div>
                <span
                  className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${STATUS_CLS[t.status]}`}
                >
                  {t.status}
                </span>
              </div>
              <p className="text-xs text-foreground/80 whitespace-pre-wrap line-clamp-3">
                {t.body}
              </p>
              <div className="mt-2 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                <span>Sent: {t.sent_count}</span>
                <span>· Reply: {Math.round(t.reply_rate * 100)}%</span>
                <span>· Opt-out: {(t.opt_out_rate * 100).toFixed(1)}%</span>
                <span>
                  · Last used:{" "}
                  {t.last_used_at
                    ? new Date(t.last_used_at).toLocaleDateString()
                    : "—"}
                </span>
              </div>
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        <div className="rounded-2xl border border-border bg-card/60 p-4">
          <p className="text-xs uppercase tracking-wide text-muted-foreground mb-2">
            Preview builder
          </p>
          <Select value={selected?.id} onValueChange={setSelectedId}>
            <SelectTrigger className="bg-background/60 border-border rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {templates.map((t) => (
                <SelectItem key={t.id} value={t.id}>
                  {t.template_name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <div className="mt-3 space-y-2">
            {selected?.variables.map((v, i) => {
              const k = String(i + 1);
              return (
                <div key={k}>
                  <Label className="text-[11px] text-muted-foreground">
                    {`{{${k}}} · ${v}`}
                  </Label>
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
          </div>

          <div className="mt-3 rounded-2xl bg-background/40 border border-border p-3 text-sm whitespace-pre-wrap">
            {preview}
          </div>

          <div className="mt-3 flex flex-wrap gap-2">
            <Button
              size="sm"
              className="bg-gradient-brand text-primary-foreground hover:opacity-90"
              onClick={() => toast.success("Outreach queue item created")}
            >
              <Send className="h-4 w-4" /> Create outreach
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => {
                navigator.clipboard?.writeText(selected?.body ?? "");
                toast("Copied for Meta submission");
              }}
            >
              <Copy className="h-4 w-4" /> Copy for Meta
            </Button>
          </div>
        </div>

        {selected && (
          <div className="rounded-2xl border border-border bg-card/60 p-4 text-xs space-y-1.5">
            <Badge variant="outline" className="border-border">
              {selected.category}
            </Badge>
            <p className="text-muted-foreground mt-2">
              Use case: {selected.use_case}
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
