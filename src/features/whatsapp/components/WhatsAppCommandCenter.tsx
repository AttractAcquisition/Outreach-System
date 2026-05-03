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
import { WhatsAppInbox } from "./WhatsAppInbox";
import { OutreachQueue } from "./OutreachQueue";
import { TemplateManager } from "./TemplateManager";
import { CampaignLeads } from "./CampaignLeads";
import { SuppressionList } from "./SuppressionList";
import { WhatsAppAnalytics } from "./WhatsAppAnalytics";
import { WhatsAppSettings } from "./WhatsAppSettings";

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

  return (
    <div className="min-h-screen bg-background">
      <header className="border-b border-border bg-card/40">
        <div className="container mx-auto px-6 py-6">
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

      <main className="container mx-auto px-6 py-6">
        <Tabs value={tab} onValueChange={(v) => setTab(v as typeof tab)}>
          <TabsList className="bg-card/60 border border-border rounded-2xl p-1 h-auto flex flex-wrap">
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
                </TabsTrigger>
              );
            })}
          </TabsList>

          <div className="mt-5">
            <TabsContent value="inbox" className="m-0">
              <WhatsAppInbox initialConversationId={initialConv} />
            </TabsContent>
            <TabsContent value="outreach" className="m-0">
              <OutreachQueue />
            </TabsContent>
            <TabsContent value="templates" className="m-0">
              <TemplateManager />
            </TabsContent>
            <TabsContent value="campaigns" className="m-0">
              <CampaignLeads
                onOpenInInbox={(id) => {
                  setInitialConv(id);
                  setTab("inbox");
                }}
              />
            </TabsContent>
            <TabsContent value="suppression" className="m-0">
              <SuppressionList />
            </TabsContent>
            <TabsContent value="analytics" className="m-0">
              <WhatsAppAnalytics />
            </TabsContent>
            <TabsContent value="settings" className="m-0">
              <WhatsAppSettings />
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}
