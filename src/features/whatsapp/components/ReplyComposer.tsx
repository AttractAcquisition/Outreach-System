import { useMemo, useState } from "react";
import { Send, Sparkles, FileText, Save, ShieldAlert, Lock } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  AISuggestionPanel,
  type AISuggestion,
} from "./AISuggestionPanel";
import {
  generateAIReply,
  getWindowState,
  sendFreeformMessage,
  sendTemplateMessage,
  useWhatsAppTemplates,
} from "../hooks";
import { ConfirmActionModal } from "./ConfirmActionModal";
import type { WhatsAppConversation, WhatsAppMessage } from "../types";

interface Props {
  conversation: WhatsAppConversation;
  onMessageSent: (msg: WhatsAppMessage) => void;
}

export function ReplyComposer({ conversation, onMessageSent }: Props) {
  const { status } = getWindowState(conversation);
  const { templates } = useWhatsAppTemplates();
  const isClosed = status === "closed";
  const isBlocked = conversation.suppressed || conversation.crm_stage === "Do Not Contact";

  const [body, setBody] = useState("");
  const [aiLoading, setAiLoading] = useState(false);
  const [suggestion, setSuggestion] = useState<AISuggestion | null>(null);
  const [confirmEditedSendOpen, setConfirmEditedSendOpen] = useState(false);
  const [usedSuggestion, setUsedSuggestion] = useState<string | null>(null);

  // Template state
  const approvedTemplates = templates.filter((t) => t.status === "Approved");
  const [templateName, setTemplateName] = useState<string>(
    approvedTemplates[0]?.template_name ?? "",
  );
  const selectedTemplate = useMemo(
    () => approvedTemplates.find((t) => t.template_name === templateName),
    [approvedTemplates, templateName],
  );
  const [vars, setVars] = useState<Record<string, string>>({});
  const previewBody = useMemo(() => {
    if (!selectedTemplate) return "";
    return selectedTemplate.body.replace(/{{(\d+)}}/g, (_, n) => vars[n] ?? `{{${n}}}`);
  }, [selectedTemplate, vars]);

  async function handleAIGenerate() {
    setAiLoading(true);
    const r = await generateAIReply(conversation.id);
    if (r) setSuggestion(r);
    setAiLoading(false);
  }

  async function doSend(text: string) {
    const result = await sendFreeformMessage(conversation.id, text);
    if (!result.ok) return;
    onMessageSent({
      id: `m-${Date.now()}`,
      conversation_id: conversation.id,
      direction: "outbound",
      message_type: "text",
      body: text,
      status: "queued",
      created_at: new Date().toISOString(),
    });
    setBody("");
    setUsedSuggestion(null);
    setSuggestion(null);
  }

  function handleSendClick() {
    if (!body.trim()) return;
    if (usedSuggestion && body.trim() !== usedSuggestion.trim()) {
      setConfirmEditedSendOpen(true);
      return;
    }
    void doSend(body);
  }

  async function handleSendTemplate() {
    if (!selectedTemplate) return;
    const result = await sendTemplateMessage(
      conversation.id,
      selectedTemplate.template_name,
      vars,
    );
    if (!result.ok) return;
    onMessageSent({
      id: `m-${Date.now()}`,
      conversation_id: conversation.id,
      direction: "outbound",
      message_type: "template",
      body: previewBody,
      template_name: selectedTemplate.template_name,
      template_params: vars,
      status: "queued",
      created_at: new Date().toISOString(),
    });
    setVars({});
  }

  if (isBlocked) {
    return (
      <div className="border-t border-border bg-destructive/10 p-4 flex items-center gap-3 text-sm">
        <ShieldAlert className="h-5 w-5 text-destructive shrink-0" />
        <p className="text-destructive">
          This contact is suppressed or marked Do Not Contact. Sending is blocked.
        </p>
      </div>
    );
  }

  return (
    <div className="border-t border-border bg-card/40 p-4 space-y-3">
      {(suggestion || aiLoading) && status !== "closed" && (
        <AISuggestionPanel
          suggestion={suggestion}
          loading={aiLoading}
          onUse={(text) => {
            setBody(text);
            setUsedSuggestion(text);
          }}
          onRegenerate={() => void handleAIGenerate()}
          onDiscard={() => {
            setSuggestion(null);
            setUsedSuggestion(null);
          }}
        />
      )}

      {isClosed ? (
        <div className="space-y-3">
          <div className="rounded-2xl border border-border bg-secondary/40 p-3 flex items-start gap-2 text-sm">
            <Lock className="h-4 w-4 text-muted-foreground mt-0.5 shrink-0" />
            <p className="text-muted-foreground">
              The 24-hour customer service window is closed. Use an approved template to re-open the conversation.
            </p>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Template</Label>
              <Select value={templateName} onValueChange={setTemplateName}>
                <SelectTrigger className="mt-1 bg-background/60 border-border rounded-xl">
                  <SelectValue placeholder="Choose template" />
                </SelectTrigger>
                <SelectContent>
                  {approvedTemplates.map((t) => (
                    <SelectItem key={t.id} value={t.template_name}>
                      {t.template_name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="rounded-2xl border border-border bg-background/40 p-3 text-xs whitespace-pre-wrap text-foreground/90 max-h-32 overflow-y-auto">
              {previewBody || "Select a template to preview."}
            </div>
          </div>

          {selectedTemplate && selectedTemplate.variables.length > 0 && (
            <div className="grid gap-2 md:grid-cols-2">
              {selectedTemplate.variables.map((v, i) => {
                const key = String(i + 1);
                return (
                  <div key={key}>
                    <Label className="text-[11px] text-muted-foreground">
                      {`{{${key}}} · ${v}`}
                    </Label>
                    <Input
                      value={vars[key] ?? ""}
                      onChange={(e) =>
                        setVars((prev) => ({ ...prev, [key]: e.target.value }))
                      }
                      className="mt-1 bg-background/60 border-border rounded-xl"
                    />
                  </div>
                );
              })}
            </div>
          )}

          <div className="flex justify-between items-center">
            <p className="text-[11px] text-muted-foreground">Human approval required.</p>
            <Button
              onClick={handleSendTemplate}
              className="bg-gradient-brand text-primary-foreground hover:opacity-90"
              disabled={!selectedTemplate}
            >
              <Send className="h-4 w-4" />
              Send template
            </Button>
          </div>
        </div>
      ) : (
        <div className="space-y-2">
          <Textarea
            value={body}
            onChange={(e) => setBody(e.target.value)}
            placeholder="Write a reply…"
            rows={3}
            className="bg-background/60 border-border rounded-xl resize-none"
          />
          <div className="flex flex-wrap items-center justify-between gap-2">
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                size="sm"
                variant="secondary"
                onClick={handleAIGenerate}
                disabled={aiLoading}
              >
                <Sparkles className="h-4 w-4" />
                Generate AI suggestion
              </Button>
              <Button type="button" size="sm" variant="outline">
                <FileText className="h-4 w-4" />
                Use template
              </Button>
              <Button type="button" size="sm" variant="ghost">
                <Save className="h-4 w-4" />
                Save draft
              </Button>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-[11px] text-muted-foreground">
                {body.length} chars · human approval required
              </span>
              <Button
                onClick={handleSendClick}
                className="bg-gradient-brand text-primary-foreground hover:opacity-90"
                disabled={!body.trim()}
              >
                <Send className="h-4 w-4" />
                Send reply
              </Button>
            </div>
          </div>
        </div>
      )}

      <ConfirmActionModal
        open={confirmEditedSendOpen}
        onOpenChange={setConfirmEditedSendOpen}
        title="Send edited AI suggestion?"
        description="You edited the AI-suggested reply. Confirm you want to send the updated version."
        confirmLabel="Send reply"
        onConfirm={() => {
          setConfirmEditedSendOpen(false);
          void doSend(body);
        }}
      />
    </div>
  );
}
