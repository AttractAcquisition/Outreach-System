import { useEffect, useMemo, useState } from "react";
import { Archive, Copy, Edit3, FileText, Plus, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Switch } from "@/components/ui/switch";
import { Textarea } from "@/components/ui/textarea";
import { toast } from "sonner";
import {
  useArchiveWhatsAppTemplate,
  useCreateWhatsAppTemplate,
  useSyncWhatsAppTemplates,
  useUpdateWhatsAppTemplate,
  useWhatsAppTemplates,
} from "../hooks";
import { ConfirmActionModal } from "./ConfirmActionModal";
import { EmptyState } from "./EmptyState";
import type {
  TemplateCategory,
  TemplateStatus,
  WhatsAppTemplate,
  WhatsAppTemplateFormInput,
} from "../types";

const ALL = "__all__";

const STATUS_OPTIONS: TemplateStatus[] = [
  "draft",
  "submitted",
  "approved",
  "rejected",
  "paused",
  "archived",
];

const CATEGORY_OPTIONS: TemplateCategory[] = [
  "utility",
  "marketing",
  "authentication",
];

const STATUS_CLS: Record<string, string> = {
  draft: "bg-secondary text-foreground border-border",
  submitted: "bg-warning/15 text-warning border-warning/30",
  approved: "bg-success/15 text-success border-success/30",
  rejected: "bg-destructive/15 text-destructive border-destructive/30",
  paused: "bg-muted text-muted-foreground border-border",
  archived: "bg-muted text-muted-foreground border-border",
};

type TemplateFormState = {
  name: string;
  displayName: string;
  category: TemplateCategory;
  language: string;
  body: string;
  variablesText: string;
  componentsText: string;
  status: TemplateStatus;
  metaTemplateId: string;
  metaStatus: string;
  metaQualityRating: string;
  whatsappBusinessAccountId: string;
  phoneNumberId: string;
  usableInsideWindow: boolean;
  usableOutsideWindow: boolean;
};

function titleize(value: string | null | undefined) {
  if (!value) return "Not set";
  return value
    .split("_")
    .filter(Boolean)
    .map((part) => part.charAt(0).toUpperCase() + part.slice(1))
    .join(" ");
}

function formatDate(value: string) {
  return new Intl.DateTimeFormat(undefined, {
    year: "numeric",
    month: "short",
    day: "numeric",
  }).format(new Date(value));
}

function variablesToText(variables: string[]) {
  return variables.join("\n");
}

function componentsToText(components: unknown[]) {
  return components.length > 0 ? JSON.stringify(components, null, 2) : "";
}

function blankForm(): TemplateFormState {
  return {
    name: "",
    displayName: "",
    category: "utility",
    language: "en",
    body: "",
    variablesText: "",
    componentsText: "",
    status: "draft",
    metaTemplateId: "",
    metaStatus: "",
    metaQualityRating: "",
    whatsappBusinessAccountId: "",
    phoneNumberId: "",
    usableInsideWindow: true,
    usableOutsideWindow: false,
  };
}

function formFromTemplate(template: WhatsAppTemplate): TemplateFormState {
  return {
    name: template.name,
    displayName: template.displayName ?? "",
    category: template.category,
    language: template.language,
    body: template.body,
    variablesText: variablesToText(template.variables),
    componentsText: componentsToText(template.components),
    status: template.status,
    metaTemplateId: template.metaTemplateId ?? "",
    metaStatus: template.metaStatus ?? "",
    metaQualityRating: template.metaQualityRating ?? "",
    whatsappBusinessAccountId: template.whatsappBusinessAccountId ?? "",
    phoneNumberId: template.phoneNumberId ?? "",
    usableInsideWindow: template.usableInsideWindow,
    usableOutsideWindow: template.usableOutsideWindow,
  };
}

function formToInput(form: TemplateFormState): WhatsAppTemplateFormInput {
  let components: unknown[] = [];

  if (form.componentsText.trim()) {
    const parsed = JSON.parse(form.componentsText);
    if (!Array.isArray(parsed)) {
      throw new Error("Components must be a JSON array.");
    }
    components = parsed;
  }

  return {
    name: form.name,
    displayName: form.displayName,
    category: form.category,
    language: form.language,
    body: form.body,
    variables: form.variablesText
      .split(/\r?\n|,/)
      .map((value) => value.trim())
      .filter(Boolean),
    components,
    status: form.status,
    metaTemplateId: form.metaTemplateId,
    metaStatus: form.metaStatus,
    metaQualityRating: form.metaQualityRating,
    whatsappBusinessAccountId: form.whatsappBusinessAccountId,
    phoneNumberId: form.phoneNumberId,
    usableInsideWindow: form.usableInsideWindow,
    usableOutsideWindow: form.usableOutsideWindow,
  };
}

export function TemplateManager() {
  const { templates, loading, error } = useWhatsAppTemplates();
  const createTemplate = useCreateWhatsAppTemplate();
  const updateTemplate = useUpdateWhatsAppTemplate();
  const archiveTemplate = useArchiveWhatsAppTemplate();
  const syncTemplates = useSyncWhatsAppTemplates();

  const [selectedId, setSelectedId] = useState("");
  const [statusFilter, setStatusFilter] = useState(ALL);
  const [categoryFilter, setCategoryFilter] = useState(ALL);
  const [editing, setEditing] = useState<WhatsAppTemplate | null>(null);
  const [archiveTarget, setArchiveTarget] = useState<WhatsAppTemplate | null>(null);
  const [formOpen, setFormOpen] = useState(false);
  const [form, setForm] = useState<TemplateFormState>(() => blankForm());
  const [formError, setFormError] = useState<string | null>(null);

  const visibleTemplates = useMemo(() => {
    return templates.filter((template) => {
      const statusMatch = statusFilter === ALL || template.status === statusFilter;
      const categoryMatch =
        categoryFilter === ALL || template.category === categoryFilter;
      return statusMatch && categoryMatch;
    });
  }, [templates, statusFilter, categoryFilter]);

  const selected = useMemo(
    () =>
      visibleTemplates.find((template) => template.id === selectedId) ??
      visibleTemplates[0] ??
      null,
    [selectedId, visibleTemplates],
  );

  useEffect(() => {
    if (visibleTemplates.length > 0 && !selected) {
      setSelectedId(visibleTemplates[0].id);
    }
  }, [selected, visibleTemplates]);

  const openCreate = () => {
    setEditing(null);
    setForm(blankForm());
    setFormError(null);
    setFormOpen(true);
  };

  const openEdit = (template: WhatsAppTemplate) => {
    setEditing(template);
    setForm(formFromTemplate(template));
    setFormError(null);
    setFormOpen(true);
  };

  const handleSave = async () => {
    try {
      const input = formToInput(form);
      if (editing) {
        await updateTemplate.mutateAsync({ id: editing.id, input });
      } else {
        await createTemplate.mutateAsync(input);
      }
      setFormOpen(false);
      setEditing(null);
      setForm(blankForm());
    } catch (err) {
      setFormError(
        err instanceof Error ? err.message : "Could not save template",
      );
    }
  };

  if (loading) {
    return (
      <div className="grid gap-3">
        {Array.from({ length: 3 }).map((_, i) => (
          <div
            key={i}
            className="h-32 rounded-2xl bg-card/40 border border-border animate-pulse"
          />
        ))}
      </div>
    );
  }

  if (error) {
    return (
      <EmptyState
        icon={FileText}
        title="Could not load templates"
        description={error}
      />
    );
  }

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex flex-wrap gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-40 bg-background/60 border-border rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All statuses</SelectItem>
              {STATUS_OPTIONS.map((status) => (
                <SelectItem key={status} value={status}>
                  {titleize(status)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          <Select value={categoryFilter} onValueChange={setCategoryFilter}>
            <SelectTrigger className="w-44 bg-background/60 border-border rounded-xl">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value={ALL}>All categories</SelectItem>
              {CATEGORY_OPTIONS.map((category) => (
                <SelectItem key={category} value={category}>
                  {titleize(category)}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>
        <div className="flex flex-wrap gap-2">
          <Button
            size="sm"
            variant="outline"
            onClick={() => syncTemplates.mutate()}
            disabled={syncTemplates.isPending}
          >
            <RefreshCw
              className={`h-4 w-4 ${syncTemplates.isPending ? "animate-spin" : ""}`}
            />
            {syncTemplates.isPending ? "Syncing..." : "Sync from Meta"}
          </Button>
          <Button
            size="sm"
            className="bg-gradient-brand text-primary-foreground hover:opacity-90"
            onClick={openCreate}
          >
            <Plus className="h-4 w-4" /> New template
          </Button>
        </div>
      </div>

      {templates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No WhatsApp templates"
          description="Create a local template record or sync official templates from Meta."
        />
      ) : visibleTemplates.length === 0 ? (
        <EmptyState
          icon={FileText}
          title="No templates match"
          description="Adjust the status or category filter."
        />
      ) : (
        <div className="grid gap-4 lg:grid-cols-[1fr_400px]">
          <div className="grid gap-2">
            {visibleTemplates.map((template) => (
              <button
                key={template.id}
                onClick={() => setSelectedId(template.id)}
                className={`text-left rounded-2xl border p-4 transition-all ${
                  selected?.id === template.id
                    ? "border-accent/60 bg-card shadow-glow"
                    : "border-border bg-card/60 hover:bg-card"
                }`}
              >
                <div className="flex items-start justify-between gap-3 mb-2">
                  <div className="min-w-0">
                    <p className="font-semibold text-sm">
                      {template.displayName || template.name}
                    </p>
                    <p className="text-xs text-muted-foreground">
                      {template.name} · {template.language.toUpperCase()} ·{" "}
                      {titleize(template.category)}
                    </p>
                  </div>
                  <span
                    className={`px-2 py-0.5 rounded-full border text-[11px] font-medium ${
                      STATUS_CLS[template.status] ?? STATUS_CLS.draft
                    }`}
                  >
                    {titleize(template.status)}
                  </span>
                </div>
                <p className="text-xs text-foreground/80 whitespace-pre-wrap line-clamp-3">
                  {template.body}
                </p>
                <div className="mt-3 flex flex-wrap gap-2 text-[11px] text-muted-foreground">
                  <span>Meta: {titleize(template.metaStatus)}</span>
                  <span>Quality: {titleize(template.metaQualityRating)}</span>
                  <span>Updated: {formatDate(template.updatedAt)}</span>
                </div>
              </button>
            ))}
          </div>

          {selected && (
            <div className="space-y-3">
              <div className="rounded-2xl border border-border bg-card/60 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <p className="text-xs uppercase tracking-wide text-muted-foreground">
                      Template details
                    </p>
                    <h3 className="mt-1 font-semibold">
                      {selected.displayName || selected.name}
                    </h3>
                  </div>
                  <div className="flex gap-2">
                    <Button size="sm" variant="outline" onClick={() => openEdit(selected)}>
                      <Edit3 className="h-4 w-4" /> Edit
                    </Button>
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={selected.status === "archived"}
                      onClick={() => setArchiveTarget(selected)}
                    >
                      <Archive className="h-4 w-4" />
                    </Button>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Badge variant="outline" className="border-border">
                    {titleize(selected.category)}
                  </Badge>
                  <Badge variant="outline" className="border-border">
                    {selected.language.toUpperCase()}
                  </Badge>
                  <Badge variant="outline" className="border-border">
                    {titleize(selected.status)}
                  </Badge>
                  <Badge variant="outline" className="border-border">
                    Meta {titleize(selected.metaStatus)}
                  </Badge>
                  <Badge variant="outline" className="border-border">
                    Quality {titleize(selected.metaQualityRating)}
                  </Badge>
                </div>

                <div className="mt-3 rounded-2xl bg-background/40 border border-border p-3 text-sm whitespace-pre-wrap">
                  {selected.body}
                </div>

                <div className="mt-3 grid gap-2 text-xs text-muted-foreground">
                  <div className="flex justify-between gap-3">
                    <span>Inside service window</span>
                    <span>{selected.usableInsideWindow ? "Usable" : "Not usable"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Outside service window</span>
                    <span>{selected.usableOutsideWindow ? "Usable" : "Not usable"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Meta template ID</span>
                    <span className="truncate">{selected.metaTemplateId ?? "Not set"}</span>
                  </div>
                  <div className="flex justify-between gap-3">
                    <span>Business account</span>
                    <span className="truncate">
                      {selected.whatsappBusinessAccountId ?? "Not set"}
                    </span>
                  </div>
                </div>

                <div className="mt-3 flex flex-wrap gap-2">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => {
                      navigator.clipboard?.writeText(selected.body);
                      toast("Template body copied");
                    }}
                  >
                    <Copy className="h-4 w-4" /> Copy body
                  </Button>
                </div>
              </div>

              <div className="rounded-2xl border border-border bg-card/60 p-4 text-xs">
                <p className="font-semibold mb-2">Variables</p>
                {selected.variables.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {selected.variables.map((variable) => (
                      <Badge key={variable} variant="secondary">
                        {variable}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <p className="text-muted-foreground">No variables configured.</p>
                )}
              </div>

              <div className="rounded-2xl border border-border bg-card/60 p-4 text-xs">
                <p className="font-semibold mb-2">Components</p>
                {selected.components.length > 0 ? (
                  <pre className="max-h-48 overflow-auto whitespace-pre-wrap text-muted-foreground">
                    {JSON.stringify(selected.components, null, 2)}
                  </pre>
                ) : (
                  <p className="text-muted-foreground">No components configured.</p>
                )}
              </div>
            </div>
          )}
        </div>
      )}

      <Dialog open={formOpen} onOpenChange={setFormOpen}>
        <DialogContent className="w-[calc(100vw-1rem)] sm:max-w-3xl rounded-2xl max-h-[90dvh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>{editing ? "Edit template" : "Create template"}</DialogTitle>
            <DialogDescription>
              This edits the local WhatsApp template record. Official Meta template sync runs through the backend sync action.
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">Name</Label>
              <Input
                value={form.name}
                onChange={(e) => setForm((prev) => ({ ...prev, name: e.target.value }))}
                className="mt-1 bg-background/60 border-border rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Display name</Label>
              <Input
                value={form.displayName}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, displayName: e.target.value }))
                }
                className="mt-1 bg-background/60 border-border rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Category</Label>
              <Select
                value={form.category}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, category: value }))
                }
              >
                <SelectTrigger className="mt-1 bg-background/60 border-border rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORY_OPTIONS.map((category) => (
                    <SelectItem key={category} value={category}>
                      {titleize(category)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Language</Label>
              <Input
                value={form.language}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, language: e.target.value }))
                }
                className="mt-1 bg-background/60 border-border rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Status</Label>
              <Select
                value={form.status}
                onValueChange={(value) =>
                  setForm((prev) => ({ ...prev, status: value }))
                }
              >
                <SelectTrigger className="mt-1 bg-background/60 border-border rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {STATUS_OPTIONS.map((status) => (
                    <SelectItem key={status} value={status}>
                      {titleize(status)}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Meta status</Label>
              <Input
                value={form.metaStatus}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, metaStatus: e.target.value }))
                }
                className="mt-1 bg-background/60 border-border rounded-xl"
              />
            </div>
          </div>

          <div>
            <Label className="text-xs text-muted-foreground">Body</Label>
            <Textarea
              value={form.body}
              onChange={(e) => setForm((prev) => ({ ...prev, body: e.target.value }))}
              rows={5}
              className="mt-1 bg-background/60 border-border rounded-xl"
            />
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div>
              <Label className="text-xs text-muted-foreground">
                Variables, one per line
              </Label>
              <Textarea
                value={form.variablesText}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, variablesText: e.target.value }))
                }
                rows={4}
                className="mt-1 bg-background/60 border-border rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">
                Components JSON array
              </Label>
              <Textarea
                value={form.componentsText}
                onChange={(e) =>
                  setForm((prev) => ({ ...prev, componentsText: e.target.value }))
                }
                rows={4}
                className="mt-1 bg-background/60 border-border rounded-xl font-mono text-xs"
              />
            </div>
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex items-center justify-between rounded-2xl border border-border bg-background/40 p-3">
              <Label className="text-xs text-muted-foreground">
                Usable inside service window
              </Label>
              <Switch
                checked={form.usableInsideWindow}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, usableInsideWindow: checked }))
                }
              />
            </div>
            <div className="flex items-center justify-between rounded-2xl border border-border bg-background/40 p-3">
              <Label className="text-xs text-muted-foreground">
                Usable outside service window
              </Label>
              <Switch
                checked={form.usableOutsideWindow}
                onCheckedChange={(checked) =>
                  setForm((prev) => ({ ...prev, usableOutsideWindow: checked }))
                }
              />
            </div>
          </div>

          {formError && <p className="text-sm text-destructive">{formError}</p>}

          <DialogFooter>
            <Button variant="ghost" onClick={() => setFormOpen(false)}>
              Cancel
            </Button>
            <Button
              className="bg-gradient-brand text-primary-foreground hover:opacity-90"
              disabled={createTemplate.isPending || updateTemplate.isPending}
              onClick={() => void handleSave()}
            >
              {createTemplate.isPending || updateTemplate.isPending
                ? "Saving..."
                : "Save template"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmActionModal
        open={!!archiveTarget}
        onOpenChange={(open) => !open && setArchiveTarget(null)}
        title="Archive template?"
        description="The template will stay in Supabase with status archived. It will not be deleted."
        confirmLabel="Archive"
        destructive
        onConfirm={() => {
          if (archiveTarget) {
            void archiveTemplate.mutateAsync(archiveTarget.id);
          }
          setArchiveTarget(null);
        }}
      />
    </div>
  );
}
