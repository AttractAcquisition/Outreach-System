import { useState } from "react";
import type { ComponentType, ReactNode } from "react";
import {
  Activity,
  AlertTriangle,
  Bot,
  Clock,
  Inbox,
  MessageSquare,
  Send,
  ShieldX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useWhatsAppAnalytics } from "../hooks";
import { EmptyState } from "./EmptyState";
import type {
  WhatsAppAnalyticsRange,
  WhatsAppAnalyticsSummary,
  WhatsAppBreakdownItem,
} from "../types";

const RANGE_OPTIONS: Array<{ value: WhatsAppAnalyticsRange; label: string }> = [
  { value: "today", label: "Today" },
  { value: "7d", label: "7 days" },
  { value: "30d", label: "30 days" },
  { value: "all", label: "All time" },
];

export function WhatsAppAnalytics() {
  const [range, setRange] = useState<WhatsAppAnalyticsRange>("7d");
  const { analytics, loading, error } = useWhatsAppAnalytics(range);

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold">WhatsApp analytics</h2>
          <p className="text-xs text-muted-foreground">
            Live metrics from Supabase WhatsApp tables only.
          </p>
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

      {loading ? (
        <AnalyticsSkeleton />
      ) : error ? (
        <EmptyState
          icon={Activity}
          title="Could not load WhatsApp analytics"
          description={error}
        />
      ) : !analytics ? (
        <EmptyState
          icon={Activity}
          title="No analytics available"
          description="No WhatsApp analytics rows were returned."
        />
      ) : (
        <AnalyticsContent analytics={analytics} />
      )}
    </div>
  );
}

function AnalyticsContent({ analytics }: { analytics: WhatsAppAnalyticsSummary }) {
  const hasConversationBreakdowns =
    analytics.conversationsBySource.length > 0 ||
    analytics.conversationsByStage.length > 0;
  const hasMessageBreakdowns =
    analytics.messagesByDirection.length > 0 ||
    analytics.messagesByStatus.length > 0;

  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        <KpiCard label="Total conversations" value={analytics.totalConversations} icon={Inbox} />
        <KpiCard label="Conversations today" value={analytics.conversationsToday} icon={Activity} />
        <KpiCard label="Open conversations" value={analytics.openConversations} icon={MessageSquare} />
        <KpiCard label="Needs human" value={analytics.conversationsNeedingHuman} icon={AlertTriangle} tone="warning" />
        <KpiCard label="Unread conversations" value={analytics.unreadConversations} icon={Inbox} />
        <KpiCard label="Inbound messages" value={analytics.inboundMessages} icon={MessageSquare} />
        <KpiCard label="Outbound messages" value={analytics.outboundMessages} icon={Send} />
        <KpiCard label="Failed outbound" value={analytics.failedOutboundMessages} icon={AlertTriangle} tone="destructive" />
      </div>

      <div className="grid gap-3 lg:grid-cols-3">
        <Panel title="Service Window Health">
          <div className="grid grid-cols-2 gap-2">
            <SmallMetric label="Active windows" value={analytics.activeServiceWindows} icon={Clock} />
            <SmallMetric label="Expired windows" value={analytics.expiredServiceWindows} icon={Clock} />
          </div>
        </Panel>

        <Panel title="Compliance And Assets">
          <div className="grid grid-cols-2 gap-2">
            <SmallMetric label="Suppressed numbers" value={analytics.suppressedNumbers} icon={ShieldX} />
            <SmallMetric label="Active templates" value={analytics.activeTemplates} icon={MessageSquare} />
          </div>
        </Panel>

        <Panel title="AI Suggestions">
          <div className="grid grid-cols-3 gap-2">
            <SmallMetric label="Pending" value={analytics.pendingAiSuggestions} icon={Bot} />
            <SmallMetric label="Approved" value={analytics.approvedAiSuggestions} icon={Bot} />
            <SmallMetric label="Rejected" value={analytics.rejectedAiSuggestions} icon={Bot} />
          </div>
        </Panel>
      </div>

      <div className="grid gap-3 lg:grid-cols-2">
        <Panel title="Message Volume">
          <div className="grid grid-cols-2 gap-2">
            <SmallMetric label="Sent today" value={analytics.messagesSentToday} icon={Send} />
            <SmallMetric label="Received today" value={analytics.messagesReceivedToday} icon={MessageSquare} />
          </div>
        </Panel>

        <Panel title="Campaign Attribution">
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between gap-3">
              <span className="text-muted-foreground">Attributed conversations</span>
              <Badge variant="outline" className="border-border">
                {analytics.campaignAttributedConversations ?? "Unavailable"}
              </Badge>
            </div>
            <UnavailableMetric label="Cost per conversation" />
            <UnavailableMetric label="Cost per qualified lead" />
          </div>
        </Panel>
      </div>

      {!hasConversationBreakdowns && !hasMessageBreakdowns ? (
        <EmptyState
          icon={Activity}
          title="No activity in this range"
          description="Choose a wider date range to see conversation and message breakdowns."
        />
      ) : (
        <div className="grid gap-3 lg:grid-cols-2">
          <Breakdown title="Conversations by source" items={analytics.conversationsBySource} />
          <Breakdown title="Conversations by stage" items={analytics.conversationsByStage} />
          <Breakdown title="Messages by direction" items={analytics.messagesByDirection} />
          <Breakdown title="Messages by status" items={analytics.messagesByStatus} />
          <Breakdown title="Conversations by campaign" items={analytics.conversationsByCampaign} emptyText="Unavailable until campaign attribution is connected." />
          <Breakdown title="Conversations by client" items={analytics.conversationsByClient} emptyText="Unavailable until client attribution is connected." />
          <Breakdown title="Conversations by prospect source" items={analytics.conversationsByProspectSource} emptyText="Unavailable until prospect source attribution is connected." />
        </div>
      )}
    </div>
  );
}

function KpiCard({
  label,
  value,
  icon: Icon,
  tone = "default",
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
  tone?: "default" | "warning" | "destructive";
}) {
  const toneClass =
    tone === "warning"
      ? "text-warning"
      : tone === "destructive"
        ? "text-destructive"
        : "text-foreground";

  return (
    <div className="rounded-lg border border-border bg-card/60 p-4">
      <div className="flex items-center justify-between gap-3">
        <p className="text-[11px] uppercase tracking-wide text-muted-foreground">
          {label}
        </p>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </div>
      <p className={`mt-2 text-2xl font-semibold ${toneClass}`}>{value}</p>
    </div>
  );
}

function Panel({ title, children }: { title: string; children: ReactNode }) {
  return (
    <section className="rounded-lg border border-border bg-card/60 p-4">
      <h3 className="mb-3 text-sm font-semibold">{title}</h3>
      {children}
    </section>
  );
}

function SmallMetric({
  label,
  value,
  icon: Icon,
}: {
  label: string;
  value: number;
  icon: ComponentType<{ className?: string }>;
}) {
  return (
    <div className="rounded-lg border border-border bg-background/40 p-3">
      <div className="mb-1 flex items-center gap-2 text-[11px] text-muted-foreground">
        <Icon className="h-3.5 w-3.5" />
        {label}
      </div>
      <p className="text-xl font-semibold">{value}</p>
    </div>
  );
}

function UnavailableMetric({ label }: { label: string }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <span className="text-muted-foreground">{label}</span>
      <span className="text-xs text-muted-foreground">
        Unavailable until campaign attribution is connected.
      </span>
    </div>
  );
}

function Breakdown({
  title,
  items,
  emptyText = "No rows in this range.",
}: {
  title: string;
  items: WhatsAppBreakdownItem[];
  emptyText?: string;
}) {
  const max = Math.max(...items.map((item) => item.value), 1);

  return (
    <Panel title={title}>
      {items.length === 0 ? (
        <p className="text-sm text-muted-foreground">{emptyText}</p>
      ) : (
        <div className="space-y-2">
          {items.slice(0, 8).map((item) => (
            <div key={item.label} className="space-y-1">
              <div className="flex items-center justify-between gap-3 text-sm">
                <span className="truncate text-muted-foreground">{item.label}</span>
                <span className="font-medium">{item.value}</span>
              </div>
              <div className="h-2 rounded-full bg-secondary">
                <div
                  className="h-2 rounded-full bg-primary"
                  style={{ width: `${Math.max(6, (item.value / max) * 100)}%` }}
                />
              </div>
            </div>
          ))}
        </div>
      )}
    </Panel>
  );
}

function AnalyticsSkeleton() {
  return (
    <div className="space-y-4">
      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-4">
        {Array.from({ length: 8 }).map((_, index) => (
          <div
            key={index}
            className="h-24 animate-pulse rounded-lg border border-border bg-card/40"
          />
        ))}
      </div>
      <div className="grid gap-3 lg:grid-cols-2">
        {Array.from({ length: 4 }).map((_, index) => (
          <div
            key={index}
            className="h-48 animate-pulse rounded-lg border border-border bg-card/40"
          />
        ))}
      </div>
    </div>
  );
}
