import { useState } from "react";
import { Sparkles, Loader2, RefreshCw, Pencil, X, Check } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import type { CrmStage } from "../types";

export interface AISuggestion {
  body: string;
  reasoning: string;
  suggested_stage: CrmStage;
  suggested_action: string;
}

interface Props {
  suggestion: AISuggestion | null;
  loading: boolean;
  onUse: (body: string) => void;
  onRegenerate: () => void;
  onDiscard: () => void;
}

export function AISuggestionPanel({
  suggestion,
  loading,
  onUse,
  onRegenerate,
  onDiscard,
}: Props) {
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState("");

  if (loading) {
    return (
      <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 flex items-center gap-2 text-sm">
        <Loader2 className="h-4 w-4 animate-spin text-accent" />
        <span className="text-muted-foreground">Generating AI suggestion…</span>
      </div>
    );
  }

  if (!suggestion) return null;

  const body = editing ? draft : suggestion.body;

  return (
    <div className="rounded-2xl border border-accent/30 bg-accent/5 p-4 space-y-3">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-accent">
          <Sparkles className="h-3.5 w-3.5" />
          AI suggestion · review before sending
        </div>
        <button
          onClick={onDiscard}
          className="text-muted-foreground hover:text-foreground"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {editing ? (
        <Textarea
          value={draft}
          onChange={(e) => setDraft(e.target.value)}
          rows={4}
          className="bg-background/60 border-border rounded-xl"
        />
      ) : (
        <p className="text-sm whitespace-pre-wrap">{suggestion.body}</p>
      )}

      <div className="flex flex-wrap gap-2 text-[11px]">
        <Badge variant="outline" className="border-border">
          Reasoning: {suggestion.reasoning}
        </Badge>
      </div>
      <div className="flex flex-wrap gap-2 text-[11px]">
        <Badge variant="outline" className="border-accent/30 text-accent">
          Suggested stage: {suggestion.suggested_stage}
        </Badge>
        <Badge variant="outline" className="border-accent/30 text-accent">
          Next action: {suggestion.suggested_action}
        </Badge>
      </div>

      <div className="flex flex-wrap gap-2 pt-1">
        <Button
          size="sm"
          className="bg-gradient-brand text-primary-foreground hover:opacity-90"
          onClick={() => onUse(body)}
        >
          <Check className="h-4 w-4" />
          Use suggestion
        </Button>
        <Button size="sm" variant="secondary" onClick={onRegenerate}>
          <RefreshCw className="h-4 w-4" />
          Regenerate
        </Button>
        {editing ? (
          <Button
            size="sm"
            variant="outline"
            onClick={() => setEditing(false)}
          >
            Done editing
          </Button>
        ) : (
          <Button
            size="sm"
            variant="outline"
            onClick={() => {
              setDraft(suggestion.body);
              setEditing(true);
            }}
          >
            <Pencil className="h-4 w-4" />
            Edit
          </Button>
        )}
      </div>
    </div>
  );
}
