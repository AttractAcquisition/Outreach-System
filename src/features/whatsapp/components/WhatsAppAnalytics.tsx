import {
  Activity,
  CheckCircle2,
  MessageCircle,
  PhoneCall,
  Send,
  ShieldX,
  XCircle,
} from "lucide-react";

function Stat({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: string | number;
  icon: React.ComponentType<{ className?: string }>;
  tone?: "default" | "success" | "warning" | "destructive";
}) {
  const cls =
    tone === "success"
      ? "text-success"
      : tone === "warning"
        ? "text-warning"
        : tone === "destructive"
          ? "text-destructive"
          : "text-foreground";
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <div className="flex items-center justify-between">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">{label}</p>
        <Icon className={`h-4 w-4 ${cls}`} />
      </div>
      <p className={`mt-1 text-2xl font-semibold ${cls}`}>{value}</p>
    </div>
  );
}

function Card({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-border bg-card/60 p-4">
      <p className="text-xs uppercase tracking-wide text-muted-foreground mb-3">{title}</p>
      {children}
    </div>
  );
}

function FunnelBar({ label, value, max }: { label: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="flex justify-between text-xs mb-1">
        <span className="text-muted-foreground">{label}</span>
        <span>{value}</span>
      </div>
      <div className="h-2 rounded-full bg-secondary overflow-hidden">
        <div className="h-full bg-gradient-brand" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
}

const funnel = [
  { label: "Queued", value: 220 },
  { label: "Approved", value: 198 },
  { label: "Sent", value: 184 },
  { label: "Delivered", value: 178 },
  { label: "Replied", value: 41 },
  { label: "Interested", value: 22 },
  { label: "Call booked", value: 9 },
  { label: "Proof Sprint sold", value: 3 },
];

const sources = [
  { label: "Meta Ads", sent: 120, replies: 31 },
  { label: "Outbound scraped", sent: 184, replies: 38 },
  { label: "Website", sent: 12, replies: 6 },
  { label: "Manual", sent: 8, replies: 4 },
];

const templates = [
  { name: "mjr_intro_short_v1", sent: 184, delivered: 178, reply: 0.21, positive: 0.13, opt_out: 0.012 },
  { name: "mjr_followup_v1", sent: 92, delivered: 89, reply: 0.16, positive: 0.09, opt_out: 0.018 },
  { name: "mjr_delivery_v1", sent: 47, delivered: 47, reply: 0.34, positive: 0.27, opt_out: 0.004 },
  { name: "book_call_prompt_v1", sent: 24, delivered: 24, reply: 0.4, positive: 0.32, opt_out: 0.0 },
];

const agents = [
  { name: "Alex", response: "8m", booked: 9 },
  { name: "VA", response: "27m", booked: 4 },
  { name: "AI assisted", response: "2m", booked: 6 },
];

export function WhatsAppAnalytics() {
  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        <Stat label="Sent today" value={42} icon={Send} />
        <Stat label="Delivered" value={40} icon={CheckCircle2} tone="success" />
        <Stat label="Replies" value={9} icon={MessageCircle} />
        <Stat label="Reply rate" value="21%" icon={Activity} />
        <Stat label="Calls booked" value={3} icon={PhoneCall} tone="success" />
        <Stat label="Opt-outs" value={1} icon={ShieldX} tone="warning" />
        <Stat label="Failed sends" value={2} icon={XCircle} tone="destructive" />
        <Stat label="Avg response time" value="11m" icon={Activity} />
        <Stat label="Open windows" value={14} icon={CheckCircle2} />
        <Stat label="Closing soon" value={3} icon={Activity} tone="warning" />
        <Stat label="Positive replies" value={5} icon={MessageCircle} tone="success" />
        <Stat label="Block risk" value="Low" icon={ShieldX} />
      </div>

      <div className="grid gap-4 lg:grid-cols-2">
        <Card title="Outreach funnel">
          <div className="space-y-3">
            {funnel.map((f) => (
              <FunnelBar key={f.label} label={f.label} value={f.value} max={funnel[0].value} />
            ))}
          </div>
        </Card>

        <Card title="Source performance">
          <div className="space-y-2 text-sm">
            {sources.map((s) => (
              <div key={s.label} className="flex justify-between border-b border-border last:border-0 py-2">
                <span>{s.label}</span>
                <span className="text-muted-foreground text-xs">
                  {s.sent} sent · {s.replies} replies · {Math.round((s.replies / s.sent) * 100)}%
                </span>
              </div>
            ))}
          </div>
        </Card>

        <Card title="Template performance">
          <div className="text-sm overflow-x-auto">
            <table className="w-full text-left">
              <thead className="text-[11px] uppercase text-muted-foreground">
                <tr>
                  <th className="py-2">Template</th>
                  <th>Sent</th>
                  <th>Reply</th>
                  <th>Positive</th>
                  <th>Opt-out</th>
                </tr>
              </thead>
              <tbody>
                {templates.map((t) => (
                  <tr key={t.name} className="border-t border-border">
                    <td className="py-2">{t.name}</td>
                    <td>{t.sent}</td>
                    <td>{Math.round(t.reply * 100)}%</td>
                    <td>{Math.round(t.positive * 100)}%</td>
                    <td>{(t.opt_out * 100).toFixed(1)}%</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </Card>

        <Card title="Agent performance">
          <div className="space-y-2 text-sm">
            {agents.map((a) => (
              <div key={a.name} className="flex justify-between border-b border-border last:border-0 py-2">
                <span>{a.name}</span>
                <span className="text-muted-foreground text-xs">
                  Response {a.response} · {a.booked} booked
                </span>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  );
}
