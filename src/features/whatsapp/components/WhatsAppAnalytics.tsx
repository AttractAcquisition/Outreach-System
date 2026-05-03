import { Activity } from "lucide-react";
import { EmptyState } from "./EmptyState";

export function WhatsAppAnalytics() {
  // TODO: Connect analytics to real message, outreach, template, and pipeline tables.
  return (
    <EmptyState
      icon={Activity}
      title="No analytics available"
      description="No analytics data source is connected yet."
    />
  );
}
