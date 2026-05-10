import { useState } from "react";
import { ConversationList } from "./ConversationList";
import { ConversationThread } from "./ConversationThread";
import { ProspectPanel } from "./ProspectPanel";
import { Sheet, SheetContent, SheetTrigger } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { ChevronLeft, UserCircle2 } from "lucide-react";
import { useWhatsAppConversations } from "../hooks";

export function WhatsAppInbox({
  initialConversationId,
}: {
  initialConversationId?: string;
}) {
  const { conversations, loading, error, reload, updateConversation } =
    useWhatsAppConversations();
  const [selectedId, setSelectedId] = useState<string | null>(
    initialConversationId ?? null,
  );
  const [mobileShowThread, setMobileShowThread] = useState(false);
  const [prospectOpen, setProspectOpen] = useState(false);

  const selected =
    conversations.find((c) => c.id === selectedId) ?? null;

  return (
    <div className="grid h-full grid-cols-1 lg:grid-cols-[340px_1fr_340px] rounded-2xl overflow-hidden border border-border bg-card/30 shadow-card">
      {/* Left */}
      <div
        className={`border-r border-border bg-card/40 ${
          mobileShowThread ? "hidden lg:block" : "block"
        }`}
      >
        <ConversationList
          conversations={conversations}
          loading={loading}
          error={error}
          selectedId={selectedId}
          onSelect={(id) => {
            setSelectedId(id);
            setMobileShowThread(true);
          }}
        />
      </div>

      {/* Middle */}
      <div className={`${mobileShowThread ? "block" : "hidden lg:block"}`}>
        <div className="flex items-center justify-between gap-2 px-3 py-2 border-b border-border lg:hidden">
          <Button
            size="sm"
            variant="ghost"
            onClick={() => setMobileShowThread(false)}
          >
            <ChevronLeft className="h-4 w-4" /> Back
          </Button>
          {selected && (
            <Sheet open={prospectOpen} onOpenChange={setProspectOpen}>
              <SheetTrigger asChild>
                <Button size="sm" variant="outline">
                  <UserCircle2 className="h-4 w-4" /> Prospect
                </Button>
              </SheetTrigger>
              <SheetContent side="right" className="w-[360px] p-0">
                <ProspectPanel
                  conversation={selected}
                  onUpdate={updateConversation}
                />
              </SheetContent>
            </Sheet>
          )}
        </div>
        <ConversationThread
          conversation={selected}
          onUpdate={updateConversation}
          onRefreshConversations={() => void reload()}
          onOpenProspect={() => setProspectOpen(true)}
        />
      </div>

      {/* Right */}
      <div className="hidden lg:block border-l border-border bg-card/40">
        {selected ? (
          <ProspectPanel
            conversation={selected}
            onUpdate={updateConversation}
          />
        ) : (
          <div className="h-full flex items-center justify-center p-6 text-sm text-muted-foreground">
            Select a conversation to see prospect details.
          </div>
        )}
      </div>
    </div>
  );
}
