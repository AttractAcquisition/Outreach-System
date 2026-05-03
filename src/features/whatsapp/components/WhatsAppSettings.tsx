import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { CheckCircle2, Wifi } from "lucide-react";
import { toast } from "sonner";

function Section({ title, description, children }: { title: string; description?: string; children: React.ReactNode }) {
  return (
    <section className="rounded-2xl border border-border bg-card/60 p-4">
      <div className="mb-3">
        <h3 className="font-semibold">{title}</h3>
        {description && <p className="text-xs text-muted-foreground mt-1">{description}</p>}
      </div>
      <div className="space-y-3">{children}</div>
    </section>
  );
}

function Toggle({ label, description, defaultOn = false, locked = false }: { label: string; description?: string; defaultOn?: boolean; locked?: boolean }) {
  const [on, setOn] = useState(defaultOn);
  return (
    <div className="flex items-start justify-between gap-4 py-2 border-b border-border last:border-0">
      <div className="min-w-0">
        <p className="text-sm font-medium">{label}</p>
        {description && <p className="text-xs text-muted-foreground mt-0.5">{description}</p>}
        {locked && <p className="text-[11px] text-warning mt-1">Locked for compliance</p>}
      </div>
      <Switch checked={locked ? true : on} disabled={locked} onCheckedChange={setOn} />
    </div>
  );
}

export function WhatsAppSettings() {
  return (
    <div className="grid gap-4 lg:grid-cols-2">
      <Section title="WhatsApp API connection" description="WhatsApp Cloud API credentials and status.">
        <div className="grid gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Phone Number ID</Label>
            <Input defaultValue="•••• 1234" className="mt-1 bg-background/60 border-border rounded-xl" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">WhatsApp Business Account ID</Label>
            <Input defaultValue="•••• 9087" className="mt-1 bg-background/60 border-border rounded-xl" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Connected number</Label>
            <Input defaultValue="+27 60 000 0000" className="mt-1 bg-background/60 border-border rounded-xl" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">Display name</Label>
            <Input defaultValue="Attract Acquisition" className="mt-1 bg-background/60 border-border rounded-xl" />
          </div>
          <div className="flex items-center gap-2 text-sm">
            <CheckCircle2 className="h-4 w-4 text-success" />
            <span>Connected · last webhook 2m ago</span>
          </div>
          <Button size="sm" variant="outline" onClick={() => toast.success("Connection OK")}>
            <Wifi className="h-4 w-4" /> Test connection
          </Button>
        </div>
      </Section>

      <Section title="Webhook configuration">
        <div>
          <Label className="text-xs text-muted-foreground">Webhook URL</Label>
          <Input defaultValue="https://api.attract-acquisition.com/whatsapp/webhook" className="mt-1 bg-background/60 border-border rounded-xl font-mono text-xs" />
        </div>
        <div className="text-sm">Verify token: <span className="text-success">verified</span></div>
        <div className="text-xs text-muted-foreground space-y-1">
          <p>Subscribed events:</p>
          <ul className="list-disc list-inside">
            <li>Messages</li>
            <li>Message status</li>
            <li>Template status</li>
          </ul>
        </div>
        <Button size="sm" variant="outline" onClick={() => toast.success("Webhook test sent")}>Test webhook</Button>
      </Section>

      <Section title="Sending rules">
        <Toggle label="Require human approval for all AI replies" defaultOn />
        <Toggle label="Allow VA to approve low-risk templates" />
        <Toggle label="Disable sending to suppressed contacts" locked />
        <Toggle label="Disable free-form replies after 24h" locked />
        <Toggle label="Auto-create CRM record from inbound ad lead" defaultOn />
        <Toggle label="Auto-generate AI reply suggestion on inbound message" defaultOn />
      </Section>

      <Section title="Business hours">
        <div className="grid grid-cols-2 gap-3">
          <div>
            <Label className="text-xs text-muted-foreground">Start</Label>
            <Input defaultValue="08:00" className="mt-1 bg-background/60 border-border rounded-xl" />
          </div>
          <div>
            <Label className="text-xs text-muted-foreground">End</Label>
            <Input defaultValue="18:00" className="mt-1 bg-background/60 border-border rounded-xl" />
          </div>
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">After-hours reply template</Label>
          <Input defaultValue="mjr_intro_short_v1" className="mt-1 bg-background/60 border-border rounded-xl" />
        </div>
        <div>
          <Label className="text-xs text-muted-foreground">SLA target response time (minutes)</Label>
          <Input defaultValue="15" className="mt-1 bg-background/60 border-border rounded-xl" />
        </div>
      </Section>

      <Section title="AI reply settings">
        <Toggle label="Tone: direct, simple, professional" defaultOn />
        <Toggle label="Avoid hype" defaultOn />
        <Toggle label="Avoid guarantees" defaultOn />
        <Toggle label="Ask one question at a time" defaultOn />
        <Toggle label="Push toward Missed Jobs Report / call / Proof Sprint depending on stage" defaultOn />
        <Toggle label="Require approval before sending" locked />
        <div>
          <Label className="text-xs text-muted-foreground">System prompt notes</Label>
          <Textarea
            defaultValue="Tone: direct, simple, professional. Avoid hype. Avoid guarantees. Ask one question at a time."
            className="mt-1 bg-background/60 border-border rounded-xl"
            rows={3}
          />
        </div>
      </Section>

      <Section title="Compliance notes">
        <ul className="text-sm list-disc list-inside text-muted-foreground space-y-1">
          <li>Templates are required when AA starts a conversation or when the 24-hour window is closed.</li>
          <li>Free-form replies are only allowed after the prospect replies, within 24 hours.</li>
          <li>Opt-out requests are honored immediately and added to the suppression list.</li>
          <li>All inbound and outbound messages are logged for audit.</li>
        </ul>
      </Section>
    </div>
  );
}
