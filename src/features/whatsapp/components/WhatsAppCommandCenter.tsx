import { useState } from "react";
import {
  BarChart3,
  FileText,
  Inbox,
  ListChecks,
  LogOut,
  Megaphone,
  MessageSquare,
  Settings,
  ShieldX,
} from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { useAuth } from "@/components/auth/AuthProvider";
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

const NAV = [
  {
    id: "inbox",
    label: "Inbox",
    shortLabel: "Inbox",
    icon: Inbox,
    description: "Conversations & inbound replies",
  },
  {
    id: "outreach",
    label: "Outreach Queue",
    shortLabel: "Outreach",
    icon: ListChecks,
    description: "AI-drafted messages pending approval",
  },
  {
    id: "templates",
    label: "Templates",
    shortLabel: "Templates",
    icon: FileText,
    description: "WhatsApp message templates",
  },
  {
    id: "campaigns",
    label: "Campaign Leads",
    shortLabel: "Campaigns",
    icon: Megaphone,
    description: "Leads attributed to campaigns",
  },
  {
    id: "suppression",
    label: "Suppression",
    shortLabel: "Suppress",
    icon: ShieldX,
    description: "Do-not-contact list",
  },
  {
    id: "analytics",
    label: "Analytics",
    shortLabel: "Analytics",
    icon: BarChart3,
    description: "Performance metrics & trends",
  },
  {
    id: "settings",
    label: "Settings",
    shortLabel: "Settings",
    icon: Settings,
    description: "Integration health & configuration",
  },
] as const;

type PageId = (typeof NAV)[number]["id"];

export function WhatsAppCommandCenter() {
  const [page, setPage] = useState<PageId>("inbox");
  const [initialConv, setInitialConv] = useState<string | undefined>();

  useWhatsAppRealtime();
  const { signOut } = useAuth();
  const { suggestions } = useWhatsAppPendingSuggestions();
  const pendingCount = suggestions.length;

  const currentNav = NAV.find((n) => n.id === page)!;

  return (
    <div className="h-[100dvh] flex overflow-hidden bg-background">
      {/* ── Sidebar (desktop only) ───────────────────────────────── */}
      <aside className="hidden lg:flex w-56 flex-none flex-col h-full border-r border-border bg-card/40">
        {/* Brand */}
        <div className="flex-none px-4 py-5 border-b border-border">
          <div className="flex items-center gap-2.5">
            <div className="h-8 w-8 flex-none rounded-lg bg-gradient-brand grid place-items-center shadow-glow">
              <MessageSquare className="h-4 w-4 text-primary-foreground" />
            </div>
            <div className="min-w-0">
              <p className="font-bold text-sm leading-none truncate">
                Attract Acquisition
              </p>
              <p className="text-[11px] text-muted-foreground mt-1">
                WhatsApp CRM
              </p>
            </div>
          </div>
        </div>

        {/* Nav */}
        <nav className="flex-1 overflow-y-auto p-2 space-y-0.5">
          {NAV.map((item) => {
            const Icon = item.icon;
            const active = page === item.id;
            return (
              <button
                key={item.id}
                onClick={() => setPage(item.id)}
                className={[
                  "w-full flex items-center gap-3 px-3 py-2.5 rounded-xl",
                  "text-sm font-medium text-left transition-all duration-100",
                  active
                    ? "bg-gradient-brand text-primary-foreground shadow-sm"
                    : "text-muted-foreground hover:text-foreground hover:bg-accent/50",
                ].join(" ")}
              >
                <Icon className="h-4 w-4 flex-none" />
                <span className="flex-1 truncate">{item.label}</span>
                {item.id === "outreach" && pendingCount > 0 && (
                  <Badge className="h-5 min-w-5 px-1.5 text-[10px] font-bold bg-amber-500 hover:bg-amber-500 text-white border-0 rounded-full flex-none">
                    {pendingCount}
                  </Badge>
                )}
              </button>
            );
          })}
        </nav>

        {/* Footer */}
        <div className="flex-none px-3 py-3 border-t border-border flex items-center justify-between gap-2">
          <p className="text-[10px] text-muted-foreground/60">
            Operator Panel · v1
          </p>
          <Button
            size="icon"
            variant="ghost"
            className="h-7 w-7 text-muted-foreground hover:text-foreground"
            onClick={() => void signOut()}
            title="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </Button>
        </div>
      </aside>

      {/* ── Main ────────────────────────────────────────────────── */}
      <div className="flex-1 min-w-0 flex flex-col h-full overflow-hidden">
        {/* Page header */}
        <header className="flex-none border-b border-border bg-card/20 px-4 lg:px-6 py-3 lg:py-4">
          {/* Mobile-only brand row */}
          <div className="flex items-center justify-between gap-2 mb-2 lg:hidden">
            <div className="flex items-center gap-2">
              <div className="h-7 w-7 flex-none rounded-lg bg-gradient-brand grid place-items-center shadow-glow">
                <MessageSquare className="h-3.5 w-3.5 text-primary-foreground" />
              </div>
              <p className="font-bold text-sm leading-none">Attract Acquisition</p>
            </div>
            <Button
              size="icon"
              variant="ghost"
              className="h-8 w-8 min-w-[44px] min-h-[44px] text-muted-foreground hover:text-foreground"
              onClick={() => void signOut()}
              title="Sign out"
            >
              <LogOut className="h-4 w-4" />
            </Button>
          </div>

          <h1 className="text-sm lg:text-base font-semibold leading-none">
            {currentNav.label}
          </h1>
          <p className="text-xs text-muted-foreground mt-1">
            {currentNav.description}
          </p>
        </header>

        {/* Page content — inbox fills height, others scroll */}
        <div className="flex-1 min-h-0 overflow-hidden">
          {page === "inbox" && (
            <div className="h-full p-0 lg:p-4">
              <WhatsAppInbox initialConversationId={initialConv} />
            </div>
          )}

          {page === "outreach" && (
            <div className="h-full overflow-y-auto p-3 lg:p-6">
              <OutreachQueue />
            </div>
          )}

          {page === "templates" && (
            <div className="h-full overflow-y-auto p-3 lg:p-6">
              <TemplateManager />
            </div>
          )}

          {page === "campaigns" && (
            <div className="h-full overflow-y-auto p-3 lg:p-6">
              <CampaignLeads
                onOpenInInbox={(id) => {
                  setInitialConv(id);
                  setPage("inbox");
                }}
              />
            </div>
          )}

          {page === "suppression" && (
            <div className="h-full overflow-y-auto p-3 lg:p-6">
              <SuppressionList />
            </div>
          )}

          {page === "analytics" && (
            <div className="h-full overflow-y-auto p-3 lg:p-6">
              <WhatsAppAnalytics />
            </div>
          )}

          {page === "settings" && (
            <div className="h-full overflow-y-auto p-3 lg:p-6">
              <WhatsAppSettings />
            </div>
          )}
        </div>

        {/* ── Mobile bottom tab bar ────────────────────────────── */}
        <nav className="flex-none lg:hidden border-t border-border bg-card/40 pb-safe-only">
          <div className="flex overflow-x-auto scrollbar-none">
            {NAV.map((item) => {
              const Icon = item.icon;
              const active = page === item.id;
              return (
                <button
                  key={item.id}
                  onClick={() => setPage(item.id)}
                  className={[
                    "flex-none flex flex-col items-center gap-1 px-3 py-2.5 min-w-[60px]",
                    "transition-colors relative",
                    active ? "text-accent" : "text-muted-foreground",
                  ].join(" ")}
                >
                  <div className="relative">
                    <Icon className="h-5 w-5" />
                    {item.id === "outreach" && pendingCount > 0 && (
                      <span className="absolute -top-1 -right-1 h-4 min-w-4 rounded-full bg-amber-500 text-white text-[9px] font-bold flex items-center justify-center px-0.5">
                        {pendingCount > 9 ? "9+" : pendingCount}
                      </span>
                    )}
                  </div>
                  <span className="text-[10px] font-medium leading-none">
                    {item.shortLabel}
                  </span>
                </button>
              );
            })}
          </div>
        </nav>
      </div>
    </div>
  );
}
