import { useMemo, useState } from "react";
import { Plus, Search, ShieldX, Trash2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
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
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  useAddSuppressionEntry,
  useRemoveSuppressionEntry,
  useSuppressionList,
} from "../hooks";
import { normalizePhoneNumber } from "../phone";
import { ConfirmActionModal } from "./ConfirmActionModal";
import { EmptyState } from "./EmptyState";
import type { SuppressionReason, SuppressionRecord } from "../types";

const REASONS: Array<{ value: SuppressionReason; label: string }> = [
  { value: "manual", label: "Manual" },
  { value: "opt_out", label: "Opted out" },
  { value: "not_interested", label: "Not interested" },
  { value: "wrong_number", label: "Wrong number" },
  { value: "complaint", label: "Complaint" },
  { value: "duplicate", label: "Duplicate" },
  { value: "invalid_number", label: "Invalid number" },
  { value: "blocked", label: "Blocked" },
  { value: "other", label: "Other" },
];

function formatLabel(value: string) {
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

export function SuppressionList() {
  const { records, loading, error } = useSuppressionList();
  const addSuppression = useAddSuppressionEntry();
  const removeSuppression = useRemoveSuppressionEntry();
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<SuppressionRecord | null>(null);

  const [phone, setPhone] = useState("");
  const [reason, setReason] = useState<SuppressionReason>("manual");
  const [source, setSource] = useState("manual");
  const [notes, setNotes] = useState("");
  const [validationError, setValidationError] = useState<string | null>(null);

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    const activeRecords = records.filter((r) => r.status === "active");
    if (!q) return activeRecords;
    return activeRecords.filter(
      (r) =>
        r.phoneNumber.toLowerCase().includes(q) ||
        r.normalizedPhoneNumber.toLowerCase().includes(q) ||
        r.reason.toLowerCase().includes(q) ||
        r.source.toLowerCase().includes(q) ||
        (r.notes ?? "").toLowerCase().includes(q),
    );
  }, [records, query]);

  const resetForm = () => {
    setPhone("");
    setReason("manual");
    setSource("manual");
    setNotes("");
    setValidationError(null);
  };

  const handleAdd = async () => {
    const normalizedPhoneNumber = normalizePhoneNumber(phone);

    if (!normalizedPhoneNumber || normalizedPhoneNumber === "+") {
      setValidationError("Enter a valid phone number.");
      return;
    }

    setValidationError(null);
    await addSuppression.mutateAsync({
      phoneNumber: phone,
      reason,
      source: source.trim() || "manual",
      notes,
    });
    resetForm();
    setAddOpen(false);
  };

  const handleRemove = (record: SuppressionRecord) => {
    void removeSuppression.mutateAsync(record.id);
    setConfirmRemove(null);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-warning/30 bg-warning/5 p-3 text-sm">
        Suppressed contacts cannot receive outbound messages. Remove only if the contact clearly opted back in or the record was added by mistake.
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative flex-1 min-w-0">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search number, reason, source…"
            className="pl-9 w-full sm:w-72 min-h-[44px] bg-secondary/60 border-border rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Button
            size="sm"
            className="bg-gradient-brand text-primary-foreground hover:opacity-90"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add number
          </Button>
        </div>
      </div>

      {loading ? (
        <div className="h-32 rounded-2xl bg-card/40 border border-border animate-pulse" />
      ) : error ? (
        <EmptyState icon={ShieldX} title="Could not load suppression list" description={error} />
      ) : filtered.length === 0 ? (
        <EmptyState
          icon={ShieldX}
          title="No suppressed contacts"
          description={
            query.trim()
              ? "No active suppression entries match that search."
              : "No active suppression entries have been added yet."
          }
        />
      ) : (
        <div className="rounded-2xl border border-border bg-card/60 overflow-hidden overflow-x-auto">
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Phone</TableHead>
                <TableHead>Reason</TableHead>
                <TableHead>Source</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Added</TableHead>
                <TableHead>Notes</TableHead>
                <TableHead className="text-right">Actions</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filtered.map((r) => (
                <TableRow key={r.id}>
                  <TableCell className="font-medium">
                    <span className="inline-flex items-center gap-1.5">
                      <ShieldX className="h-3.5 w-3.5 text-destructive" />
                      {r.phoneNumber}
                    </span>
                    <div className="mt-1 text-xs text-muted-foreground">
                      {r.normalizedPhoneNumber}
                    </div>
                  </TableCell>
                  <TableCell>{formatLabel(r.reason)}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">{r.source}</TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatLabel(r.status)}
                  </TableCell>
                  <TableCell className="text-muted-foreground text-xs">
                    {formatDate(r.createdAt)}
                  </TableCell>
                  <TableCell className="max-w-72 truncate text-muted-foreground text-xs">
                    {r.notes || "—"}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      size="sm"
                      variant="ghost"
                      disabled={removeSuppression.isPending}
                      onClick={() => setConfirmRemove(r)}
                    >
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </div>
      )}

      <Dialog
        open={addOpen}
        onOpenChange={(open) => {
          setAddOpen(open);
          if (!open) resetForm();
        }}
      >
        <DialogContent className="w-[calc(100vw-2rem)] sm:max-w-lg rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add to suppression list</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Phone number</Label>
              <Input
                value={phone}
                onChange={(e) => {
                  setPhone(e.target.value);
                  setValidationError(null);
                }}
                className="mt-1 bg-background/60 border-border rounded-xl"
              />
              {validationError && (
                <p className="mt-1 text-xs text-destructive">{validationError}</p>
              )}
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Reason</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as SuppressionReason)}>
                <SelectTrigger className="mt-1 bg-background/60 border-border rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r.value} value={r.value}>
                      {r.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Source</Label>
              <Input
                value={source}
                onChange={(e) => setSource(e.target.value)}
                className="mt-1 bg-background/60 border-border rounded-xl"
              />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 bg-background/60 border-border rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="ghost"
              onClick={() => {
                resetForm();
                setAddOpen(false);
              }}
            >
              Cancel
            </Button>
            <Button
              className="bg-gradient-brand text-primary-foreground hover:opacity-90"
              disabled={addSuppression.isPending}
              onClick={() => void handleAdd()}
            >
              {addSuppression.isPending ? "Adding..." : "Add to suppression"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <ConfirmActionModal
        open={!!confirmRemove}
        onOpenChange={(o) => !o && setConfirmRemove(null)}
        title="Remove from suppression?"
        description="The contact will be removable from suppression. Only do this if they clearly opted back in."
        destructive
        confirmLabel="Remove"
        onConfirm={() => {
          if (confirmRemove) handleRemove(confirmRemove);
        }}
      />
    </div>
  );
}
