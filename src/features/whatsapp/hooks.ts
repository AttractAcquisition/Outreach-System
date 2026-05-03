import { useEffect, useState, useCallback } from "react";
import { toast } from "sonner";
import {
  defaultProspect,
  mockCampaignLeads,
  mockConversations,
  mockMessages,
  mockOutreachQueue,
  mockProspects,
  mockSuppressionList,
  mockTemplates,
} from "./mockData";
import type {
  CampaignLead,
  CrmStage,
  OutreachQueueItem,
  ProspectDetails,
  SuppressionRecord,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppTemplate,
} from "./types";

// ─── Loading helper ──────────────────────────────────────────────
function useMock<T>(data: T, delay = 250) {
  const [loading, setLoading] = useState(true);
  const [value, setValue] = useState<T>(data);
  useEffect(() => {
    const t = setTimeout(() => setLoading(false), delay);
    return () => clearTimeout(t);
  }, [delay]);
  return { data: value, setValue, loading };
}

// ─── Conversations ───────────────────────────────────────────────
export function useWhatsAppConversations() {
  const { data, setValue, loading } = useMock(mockConversations);

  const updateConversation = useCallback(
    (id: string, patch: Partial<WhatsAppConversation>) => {
      setValue((prev) => prev.map((c) => (c.id === id ? { ...c, ...patch } : c)));
    },
    [setValue],
  );

  return { conversations: data, loading, updateConversation };
}

// ─── Messages for a conversation ─────────────────────────────────
export function useConversationMessages(conversationId: string | null) {
  const [messages, setMessages] = useState<WhatsAppMessage[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!conversationId) {
      setMessages([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    const t = setTimeout(() => {
      setMessages(mockMessages[conversationId] ?? []);
      setLoading(false);
    }, 200);
    return () => clearTimeout(t);
  }, [conversationId]);

  const appendMessage = useCallback((msg: WhatsAppMessage) => {
    setMessages((prev) => [...prev, msg]);
  }, []);

  return { messages, loading, appendMessage };
}

// ─── Outreach queue ──────────────────────────────────────────────
export function useOutreachQueue() {
  const { data, setValue, loading } = useMock(mockOutreachQueue);

  const update = useCallback(
    (id: string, patch: Partial<OutreachQueueItem>) =>
      setValue((prev) => prev.map((q) => (q.id === id ? { ...q, ...patch } : q))),
    [setValue],
  );

  return { queue: data, loading, update };
}

// ─── Templates ───────────────────────────────────────────────────
export function useWhatsAppTemplates() {
  const { data, loading } = useMock(mockTemplates);
  return { templates: data, loading };
}

// ─── Suppression ─────────────────────────────────────────────────
export function useSuppressionList() {
  const { data, setValue, loading } = useMock(mockSuppressionList);

  const add = useCallback(
    (rec: SuppressionRecord) => setValue((prev) => [rec, ...prev]),
    [setValue],
  );
  const remove = useCallback(
    (id: string) => setValue((prev) => prev.filter((r) => r.id !== id)),
    [setValue],
  );

  return { records: data, loading, add, remove };
}

// ─── Campaign leads ──────────────────────────────────────────────
export function useCampaignLeads() {
  const { data, loading } = useMock(mockCampaignLeads);
  return { leads: data, loading };
}

// ─── Prospect details ────────────────────────────────────────────
export function useProspect(conv: WhatsAppConversation | null) {
  return conv
    ? mockProspects[conv.prospect_id] ?? defaultProspect(conv)
    : null;
}

// ─── Service-window helper ───────────────────────────────────────
export function getWindowState(conv: WhatsAppConversation | null) {
  if (!conv || !conv.service_window_expires_at) {
    return { status: "closed" as const, msLeft: 0 };
  }
  const msLeft = new Date(conv.service_window_expires_at).getTime() - Date.now();
  if (msLeft <= 0) return { status: "closed" as const, msLeft: 0 };
  if (msLeft < 4 * 60 * 60 * 1000)
    return { status: "closing_soon" as const, msLeft };
  return { status: "open" as const, msLeft };
}

export function formatCountdown(ms: number) {
  if (ms <= 0) return "0h";
  const totalMinutes = Math.floor(ms / 60000);
  const h = Math.floor(totalMinutes / 60);
  const m = totalMinutes % 60;
  if (h === 0) return `${m}m`;
  return `${h}h ${m}m`;
}

// ─── Mutation placeholders (Supabase Edge Functions later) ───────
export async function sendFreeformMessage(
  _conversationId: string,
  body: string,
) {
  await new Promise((r) => setTimeout(r, 350));
  toast.success("Reply queued for send");
  return { ok: true, body };
}

export async function sendTemplateMessage(
  _conversationId: string,
  templateName: string,
  _params: Record<string, string>,
) {
  await new Promise((r) => setTimeout(r, 400));
  toast.success(`Template "${templateName}" queued for send`);
  return { ok: true };
}

export async function generateAIReply(_conversationId: string) {
  await new Promise((r) => setTimeout(r, 700));
  toast("AI suggestion generated", { description: "Review before sending." });
  return {
    body: "It shows the main places your online presence may be losing enquiries — usually things like unclear quote forms, weak proof, old posts, or missing local trust signals. I can send the short version here first if that helps.",
    reasoning:
      "Prospect asked a direct content question. Answer plainly, no hype, then offer a low-friction next step.",
    suggested_stage: "Interested" as CrmStage,
    suggested_action: "Send Missed Jobs Report",
  };
}

export async function approveQueueItem(_id: string) {
  await new Promise((r) => setTimeout(r, 300));
  toast.success("Outreach approved");
}

export async function rejectQueueItem(_id: string) {
  await new Promise((r) => setTimeout(r, 200));
  toast("Outreach rejected");
}

export async function markDoNotContact(_prospectId: string) {
  await new Promise((r) => setTimeout(r, 250));
  toast.success("Marked as Do Not Contact");
}

export async function updateCRMStage(_prospectId: string, stage: CrmStage) {
  await new Promise((r) => setTimeout(r, 200));
  toast.success(`CRM stage updated → ${stage}`);
}

export async function saveInternalNote(_prospectId: string, _note: string) {
  await new Promise((r) => setTimeout(r, 200));
  toast.success("Note saved");
}

// Re-exports for type-only imports
export type {
  CampaignLead,
  OutreachQueueItem,
  ProspectDetails,
  SuppressionRecord,
  WhatsAppConversation,
  WhatsAppMessage,
  WhatsAppTemplate,
};
