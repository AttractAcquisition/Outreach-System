import {
  AlertTriangle,
  Bot,
  CheckCircle2,
  Clock,
  Loader2,
  MessageSquare,
  RefreshCw,
  Send,
  Server,
  Settings,
  ShieldCheck,
  ShieldX,
  Webhook,
  XCircle,
} from "lucide-react";
import type { ComponentType } from "react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useWhatsAppIntegrationHealth } from "../hooks";
import { EmptyState } from "./EmptyState";
import type {
  WhatsAppHealthCheck,
  WhatsAppHealthCheckStatus,
  WhatsAppHealthOverallStatus,
  WhatsAppIntegrationHealth,
} from "../types";

const REQUIRED_SECRET_KEYS = [
  "whatsapp_access_token",
  "whatsapp_phone_number_id",
  "whatsapp_webhook_verify_token",
  "whatsapp_app_secret",
  "supabase_service_role_key",
  "ai_provider_key",
];

export function WhatsAppSettings() {
  const { health, loading, error, reload } = useWhatsAppIntegrationHealth();

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">WhatsApp settings and health</h2>
          <p className="text-xs text-muted-foreground">
            Safe operational status only. Secret values are never displayed.
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
          Loading WhatsApp integration health...
        </div>
      ) : error ? (
        <EmptyState
          icon={Settings}
          title="Could not load integration health"
          description={error}
        />
      ) : !health ? (
        <EmptyState
          icon={Settings}
          title="No health data returned"
          description="Deploy the whatsapp-integration-health Edge Function and try again."
        />
      ) : (
        <HealthContent health={health} />
      )}
    </div>
  );
}

function HealthContent({ health }: { health: WhatsAppIntegrationHealth }) {
  const checkByKey = new Map(health.checks.map((check) => [check.key, check]));
  const missingRequired = health.checks.filter(
    (check) =>
      REQUIRED_SECRET_KEYS.includes(check.key) && check.status === "missing",
  );
  const warnings = health.checks.filter((check) => check.status === "warning");

  return (
    <div className="space-y-4">
      <section className="rounded-lg border border-border bg-card/60 p-4">
        <div className="flex flex-wrap items-start justify-between gap-3">
          <div>
            <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
              Overall status
            </p>
            <div className="mt-2 flex items-center gap-2">
              <StatusIcon status={health.status} className="h-5 w-5" />
              <span className="text-2xl font-semibold capitalize">
                {health.status}
              </span>
            </div>
          </div>
          <Badge variant="outline" className="border-border">
            Project {health.metrics.projectRef}
          </Badge>
        </div>
      </section>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <StatusCard
          title="Supabase project"
          icon={Server}
          status={
            health.metrics.conversationTableReadable &&
            health.metrics.messageTableReadable
              ? "configured"
              : "warning"
          }
          detail={`${health.metrics.conversationCount} conversations · ${health.metrics.messageCount} messages`}
        />
        <StatusCard
          title="Send function"
          icon={Send}
          status={checkByKey.get("send_function_activity")?.status ?? "warning"}
          detail={formatDate(health.metrics.lastOutboundAt) ?? "No outbound send recorded"}
        />
        <StatusCard
          title="Webhook"
          icon={Webhook}
          status={checkByKey.get("webhook_activity")?.status ?? "warning"}
          detail={formatDate(health.metrics.lastInboundAt) ?? "No inbound event recorded"}
        />
        <StatusCard
          title="AI provider"
          icon={Bot}
          status={checkByKey.get("ai_provider_key")?.status ?? "missing"}
          detail={checkByKey.get("ai_provider_key")?.message ?? "Unknown"}
        />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel title="Safe Configuration Checks">
          <div className="space-y-2">
            {health.checks
              .filter((check) => REQUIRED_SECRET_KEYS.includes(check.key))
              .map((check) => (
                <CheckRow key={check.key} check={check} />
              ))}
          </div>
        </Panel>

        <Panel title="Operational Signals">
          <div className="space-y-2">
            {health.checks
              .filter((check) => !REQUIRED_SECRET_KEYS.includes(check.key))
              .map((check) => (
                <CheckRow key={check.key} check={check} />
              ))}
          </div>
        </Panel>

        <Panel title="Recent Activity">
          <div className="space-y-2 text-sm">
            <MetricRow label="Last inbound event" value={formatDate(health.metrics.lastInboundAt)} />
            <MetricRow label="Last outbound send" value={formatDate(health.metrics.lastOutboundAt)} />
            <MetricRow label="Last failed send" value={formatDate(health.metrics.lastFailedSendAt)} />
            <MetricRow label="Last webhook event" value={formatDate(health.metrics.lastWebhookEventAt)} />
            <MetricRow label="Last send event" value={formatDate(health.metrics.lastSendEventAt)} />
            <MetricRow label="Last AI suggestion" value={formatDate(health.metrics.lastAiSuggestionAt)} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 md:grid-cols-3">
        <MiniStat icon={MessageSquare} label="Templates" value={health.metrics.templateCount} />
        <MiniStat icon={ShieldX} label="Active suppressions" value={health.metrics.suppressionCount} />
        <MiniStat icon={Bot} label="AI suggestions" value={health.metrics.aiSuggestionCount} />
      </div>

      <Panel title="Setup Checklist">
        {missingRequired.length === 0 && warnings.length === 0 ? (
          <div className="flex items-center gap-2 text-sm text-success">
            <CheckCircle2 className="h-4 w-4" />
            Required configuration is present and recent integration signals look healthy.
          </div>
        ) : (
          <div className="space-y-2">
            {missingRequired.map((check) => (
              <ChecklistItem
                key={check.key}
                tone="error"
                text={`${check.label}: ${check.message}`}
              />
            ))}
            {warnings.map((check) => (
              <ChecklistItem
                key={check.key}
                tone="warning"
                text={`${check.label}: ${check.message}`}
              />
            ))}
          </div>
        )}
      </Panel>
    </div>
  );
}

function StatusCard({
  title,
  icon: Icon,
  status,
  detail,
}: {
  title: string;
  icon: ComponentType<{ className?: string }>;
  status: WhatsAppHealthCheckStatus;
  detail: string;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <Icon className="h-4 w-4 text-muted-foreground" />
        <CheckBadge status={status} />
      </div>
      <p className="mt-3 text-sm font-semibold">{title}</p>
      <p className="mt-1 text-xs text-muted-foreground">{detail}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card/60 p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function CheckRow({ check }: { check: WhatsAppHealthCheck }) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-lg border border-border bg-background/40 p-3 text-sm">
      <div className="min-w-0">
        <p className="font-medium">{check.label}</p>
        <p className="text-xs text-muted-foreground">{check.message}</p>
      </div>
      <CheckBadge status={check.status} />
    </div>
  );
}

function CheckBadge({ status }: { status: WhatsAppHealthCheckStatus }) {
  const className =
    status === "configured"
      ? "border-success/30 text-success"
      : status === "missing"
        ? "border-destructive/30 text-destructive"
        : "border-warning/30 text-warning";

  return (
    <Badge variant="outline" className={className}>
      {status}
    </Badge>
  );
}

function MetricRow({ label, value }: { label: string; value: string | null }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-right font-medium">{value ?? "Not recorded"}</span>
    </div>
  );
}

function MiniStat({
  icon: Icon,
  label,
  value,
}: {
  icon: ComponentType<{ className?: string }>;
  label: string;
  value: number;
}) {
  return (
    <div className="rounded-lg border border-border bg-card/60 p-4">
      <div className="mb-2 flex items-center gap-2 text-[11px] uppercase tracking-wide text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-2xl font-semibold">{value}</p>
    </div>
  );
}

function ChecklistItem({
  tone,
  text,
}: {
  tone: "warning" | "error";
  text: string;
}) {
  const Icon = tone === "error" ? XCircle : AlertTriangle;
  const className = tone === "error" ? "text-destructive" : "text-warning";

  return (
    <div className={`flex items-center gap-2 text-sm ${className}`}>
      <Icon className="h-4 w-4 shrink-0" />
      <span>{text}</span>
    </div>
  );
}

function StatusIcon({
  status,
  className,
}: {
  status: WhatsAppHealthOverallStatus;
  className?: string;
}) {
  if (status === "healthy") {
    return <ShieldCheck className={`${className ?? ""} text-success`} />;
  }

  if (status === "error") {
    return <XCircle className={`${className ?? ""} text-destructive`} />;
  }

  return <AlertTriangle className={`${className ?? ""} text-warning`} />;
}

function formatDate(value: string | null) {
  if (!value) return null;
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return null;
  return date.toLocaleString();
}
