import { useState } from "react";
import {
  BarChart3,
  FileText,
  Inbox,
  ListChecks,
  Megaphone,
  Settings,
  ShieldX,
} from "lucide-react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Badge } from "@/components/ui/badge";
import { WhatsAppInbox } from "./WhatsAppInbox";
import { OutreachQueue } from "./OutreachQueue";
import { TemplateManager } from "./TemplateManager";
import { CampaignLeads } from "./CampaignLeads";
import { SuppressionList } from "./SuppressionList";
import { WhatsAppAnalytics } from "./WhatsAppAnalytics";
import { WhatsAppSettings } from "./WhatsAppSettings";
import {
  useWhatsAppPendingSuggestions,
  useWhatsAppRealtime,
} from "../hooks";

const TABS = [
  { value: "inbox", label: "Inbox", icon: Inbox },
  { value: "outreach", label: "Outreach Queue", icon: ListChecks },
  { value: "templates", label: "Templates", icon: FileText },
  { value: "campaigns", label: "Campaign Leads", icon: Megaphone },
  { value: "suppression", label: "Suppression", icon: ShieldX },
  { value: "analytics", label: "Analytics", icon: BarChart3 },
  { value: "settings", label: "Settings", icon: Settings },
] as const;

export function WhatsAppCommandCenter() {
  const [tab, setTab] = useState<(typeof TABS)[number]["value"]>("inbox");
  const [initialConv, setInitialConv] = useState<string | undefined>();

  useWhatsAppRealtime();
  const { suggestions } = useWhatsAppPendingSuggestions();
  const pendingCount = suggestions.length;

  return (
    <div className="h-screen flex flex-col overflow-hidden bg-background">
      <header className="flex-none border-b border-border bg-card/40">
        <div className="px-6 py-4">
          <div className="flex items-center gap-3">
            <div className="h-9 w-9 rounded-xl bg-gradient-brand grid place-items-center shadow-glow">
              <span className="text-primary-foreground font-bold text-sm">AA</span>
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">
                WhatsApp Command Center
              </h1>
              <p className="text-sm text-muted-foreground max-w-2xl">
                Manage WhatsApp API outreach, inbound replies, AI-assisted conversations, approvals, templates, and compliance from one place.
              </p>
            </div>
          </div>
        </div>
      </header>

      <main className="flex-1 min-h-0 flex flex-col overflow-hidden px-6 pb-6">
        <Tabs
          value={tab}
          onValueChange={(v) => setTab(v as typeof tab)}
          className="flex-1 min-h-0 flex flex-col overflow-hidden"
        >
          <TabsList className="flex-none bg-card/60 border border-border rounded-2xl p-1 h-auto flex flex-wrap mt-6">
            {TABS.map((t) => {
              const Icon = t.icon;
              return (
                <TabsTrigger
                  key={t.value}
                  value={t.value}
                  className="rounded-xl data-[state=active]:bg-gradient-brand data-[state=active]:text-primary-foreground gap-2"
                >
                  <Icon className="h-4 w-4" />
                  {t.label}
                  {t.value === "outreach" && pendingCount > 0 && (
                    <Badge className="ml-0.5 h-4 min-w-4 px-1 text-[10px] font-semibold bg-amber-500/20 text-amber-400 border border-amber-500/30 rounded-full">
                      {pendingCount}
                    </Badge>
                  )}
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="flex-1 min-h-0 overflow-hidden mt-5">
            <TabsContent value="inbox" className="m-0 h-full">
              <WhatsAppInbox initialConversationId={initialConv} />
            </TabsContent>
            <TabsContent value="outreach" className="m-0 h-full overflow-y-auto">
              <OutreachQueue />
            </TabsContent>
            <TabsContent value="templates" className="m-0 h-full overflow-y-auto">
              <TemplateManager />
            </TabsContent>
            <TabsContent value="campaigns" className="m-0 h-full overflow-y-auto">
              <CampaignLeads
                onOpenInInbox={(id) => {
                  setInitialConv(id);
                  setTab("inbox");
                }}
              />
            </TabsContent>
            <TabsContent value="suppression" className="m-0 h-full overflow-y-auto">
              <SuppressionList />
            </TabsContent>
            <TabsContent value="analytics" className="m-0 h-full overflow-y-auto">
              <WhatsAppAnalytics />
            </TabsContent>
            <TabsContent value="settings" className="m-0 h-full overflow-y-auto">
              <WhatsAppSettings />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
