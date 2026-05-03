import { useEffect, useState } from "react";
import {
  Activity,
  CalendarDays,
  ClipboardList,
  Flame,
  Mail,
  ShieldCheck,
  ShieldX,
  StickyNote,
  Target,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { CRM_STAGES } from "./CrmStageBadge";
import { ServiceWindowBadge } from "./ServiceWindowBadge";
import {
  formatCountdown,
  getWindowState,
  saveInternalNote,
  updateCRMStage,
} from "../hooks";
import { EmptyState } from "./EmptyState";
import type { CrmStage, WhatsAppConversation } from "../types";

interface Props {
  conversation: WhatsAppConversation;
  onUpdate?: (id: string, patch: Partial<WhatsAppConversation>) => void;
}

function Section({
  icon: Icon,
  title,
  children,
}: {
  icon: React.ComponentType<{ className?: string }>;
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-3.5">
      <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-2.5">
        <Icon className="h-3.5 w-3.5" />
        {title}
      </div>
      <div className="space-y-2 text-sm">{children}</div>
    </section>
  );
}

function Row({ label, value }: { label: string; value: React.ReactNode }) {
  return (
    <div className="flex items-start justify-between gap-3">
      <span className="text-muted-foreground text-xs">{label}</span>
      <span className="text-right text-sm">{value}</span>
    </div>
  );
}

function intentBadge(score: number) {
  if (score >= 80)
    return { label: "Buying intent", cls: "bg-success/20 text-success" };
  if (score >= 60) return { label: "Hot", cls: "bg-warning/20 text-warning" };
  if (score >= 40)
    return { label: "Warm", cls: "bg-accent/20 text-accent" };
  return { label: "Cold", cls: "bg-muted text-muted-foreground" };
}

export function ProspectPanel({ conversation, onUpdate }: Props) {
  const c = conversation;
  const win = getWindowState(c);
  const intent = intentBadge(c.lead_score);
  const [note, setNote] = useState("");

  // Live countdown re-render
  const [, setTick] = useState(0);
  useEffect(() => {
    const t = setInterval(() => setTick((v) => v + 1), 60_000);
    return () => clearInterval(t);
  }, []);

  return (
    <div className="h-full overflow-y-auto scrollbar-thin p-3 space-y-3">
      <Section icon={ClipboardList} title="Prospect summary">
        <Row label="Business" value={c.business_name} />
        <Row label="Contact" value={c.contact_name} />
        <Row label="Phone" value={c.phone_number} />
        <Row label="Niche" value={c.niche ?? "—"} />
        <Row label="Location" value={c.location ?? "—"} />
        <Row label="Source" value={c.source} />
        <Row label="Owner" value={c.assigned_to} />
        <Row
          label="First contact"
          value={
            c.first_contact_at
              ? new Date(c.first_contact_at).toLocaleDateString()
              : "—"
          }
        />
        <Row
          label="Last inbound"
          value={
            c.last_inbound_at
              ? new Date(c.last_inbound_at).toLocaleString()
              : "—"
          }
        />
      </Section>

      <Section icon={Target} title="CRM stage">
        <Select
          value={c.crm_stage}
          onValueChange={(v) => {
            void updateCRMStage(c.prospect_id, v as CrmStage);
            onUpdate?.(c.id, { crm_stage: v as CrmStage });
          }}
        >
          <SelectTrigger className="bg-background/60 border-border rounded-xl">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {CRM_STAGES.map((s) => (
              <SelectItem key={s} value={s}>
                {s}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>
      </Section>

      <Section icon={Flame} title="Lead intent score">
        <div className="flex items-center gap-3">
          <div className="flex-1">
            <div className="h-2 rounded-full bg-secondary overflow-hidden">
              <div
                className="h-full bg-gradient-brand"
                style={{ width: `${c.lead_score}%` }}
              />
            </div>
          </div>
          <span className="font-semibold text-sm">{c.lead_score}</span>
          <span
            className={`px-2 py-0.5 rounded-full text-[10px] font-semibold uppercase ${intent.cls}`}
          >
            {intent.label}
          </span>
        </div>
      </Section>

      <Section icon={CalendarDays} title="24-hour window">
        <Row
          label="Last inbound"
          value={
            c.last_inbound_at
              ? new Date(c.last_inbound_at).toLocaleString()
              : "—"
          }
        />
        <Row
          label="Expires"
          value={
            c.service_window_expires_at
              ? new Date(c.service_window_expires_at).toLocaleString()
              : "—"
          }
        />
        <Row
          label="Countdown"
          value={
            win.status === "closed" ? "—" : formatCountdown(win.msLeft)
          }
        />
        <div className="pt-1">
          <ServiceWindowBadge conversation={c} size="md" />
        </div>
      </Section>

      <Section icon={Activity} title="Qualification">
        {/* TODO: Connect qualification data to a real prospect enrichment table or endpoint. */}
        <EmptyState
          title="No qualification data"
          description="Prospect enrichment is not connected yet."
        />
      </Section>

      <Section icon={Mail} title="Next best action">
        {/* TODO: Connect next-best-action recommendations to a real AI/backend source. */}
        <EmptyState
          title="No recommendation available"
          description="Next-best-action data is not connected yet."
        />
      </Section>

      <Section icon={c.suppressed ? ShieldX : ShieldCheck} title="Compliance">
        <Row label="Opt-out" value={c.opt_out ? "Yes" : "No"} />
        <Row label="Suppressed" value={c.suppressed ? "Yes" : "No"} />
        {/* TODO: Connect consent and template audit fields to real compliance/message tables. */}
        <Row label="Consent" value="—" />
        <Row label="Last template" value="—" />
      </Section>

      <Section icon={StickyNote} title="Internal notes">
        <Textarea
          value={note}
          onChange={(e) => setNote(e.target.value)}
          placeholder="Add a note for the team…"
          rows={3}
          className="bg-background/60 border-border rounded-xl"
        />
        <Button
          size="sm"
          className="bg-gradient-brand text-primary-foreground hover:opacity-90"
          onClick={() => {
            void saveInternalNote(c.prospect_id, note);
            setNote("");
          }}
          disabled={!note.trim()}
        >
          Save note
        </Button>
      </Section>
    </div>
  );
}
