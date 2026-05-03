import { useMemo, useState } from "react";
import { Download, Plus, Search, ShieldX, Trash2 } from "lucide-react";
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
import { useSuppressionList } from "../hooks";
import { ConfirmActionModal } from "./ConfirmActionModal";
import type { SuppressionReason, SuppressionRecord } from "../types";

const REASONS: SuppressionReason[] = [
  "Opted out",
  "Not interested",
  "Wrong number",
  "Complaint",
  "Manual block",
  "Duplicate",
];

export function SuppressionList() {
  const { records, add, remove } = useSuppressionList();
  const [query, setQuery] = useState("");
  const [addOpen, setAddOpen] = useState(false);
  const [confirmRemove, setConfirmRemove] = useState<SuppressionRecord | null>(null);

  const [phone, setPhone] = useState("");
  const [business, setBusiness] = useState("");
  const [reason, setReason] = useState<SuppressionReason>("Manual block");
  const [notes, setNotes] = useState("");

  const filtered = useMemo(() => {
    const q = query.toLowerCase().trim();
    if (!q) return records;
    return records.filter(
      (r) =>
        r.phone_number.toLowerCase().includes(q) ||
        r.business_name.toLowerCase().includes(q),
    );
  }, [records, query]);

  return (
    <div className="space-y-4">
      <div className="rounded-2xl border border-warning/30 bg-warning/5 p-3 text-sm">
        Suppressed contacts cannot receive outbound messages. Remove only if the contact clearly opted back in or the record was added by mistake.
      </div>

      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search number or business…"
            className="pl-9 w-72 bg-secondary/60 border-border rounded-xl"
          />
        </div>
        <div className="flex gap-2">
          <Button variant="outline" size="sm">
            <Download className="h-4 w-4" /> Export
          </Button>
          <Button
            size="sm"
            className="bg-gradient-brand text-primary-foreground hover:opacity-90"
            onClick={() => setAddOpen(true)}
          >
            <Plus className="h-4 w-4" /> Add number
          </Button>
        </div>
      </div>

      <div className="rounded-2xl border border-border bg-card/60 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Phone</TableHead>
              <TableHead>Business</TableHead>
              <TableHead>Reason</TableHead>
              <TableHead>Source</TableHead>
              <TableHead>Added</TableHead>
              <TableHead>By</TableHead>
              <TableHead className="text-right">Actions</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filtered.map((r) => (
              <TableRow key={r.id}>
                <TableCell className="font-medium">
                  <span className="inline-flex items-center gap-1.5">
                    <ShieldX className="h-3.5 w-3.5 text-destructive" />
                    {r.phone_number}
                  </span>
                </TableCell>
                <TableCell>{r.business_name}</TableCell>
                <TableCell>{r.reason}</TableCell>
                <TableCell className="text-muted-foreground text-xs">{r.source}</TableCell>
                <TableCell className="text-muted-foreground text-xs">
                  {new Date(r.created_at).toLocaleDateString()}
                </TableCell>
                <TableCell className="text-muted-foreground text-xs">{r.created_by}</TableCell>
                <TableCell className="text-right">
                  <Button
                    size="sm"
                    variant="ghost"
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

      <Dialog open={addOpen} onOpenChange={setAddOpen}>
        <DialogContent className="rounded-2xl">
          <DialogHeader>
            <DialogTitle>Add to suppression list</DialogTitle>
          </DialogHeader>
          <div className="space-y-3">
            <div>
              <Label className="text-xs text-muted-foreground">Phone number</Label>
              <Input value={phone} onChange={(e) => setPhone(e.target.value)} className="mt-1 bg-background/60 border-border rounded-xl" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Business name</Label>
              <Input value={business} onChange={(e) => setBusiness(e.target.value)} className="mt-1 bg-background/60 border-border rounded-xl" />
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Reason</Label>
              <Select value={reason} onValueChange={(v) => setReason(v as SuppressionReason)}>
                <SelectTrigger className="mt-1 bg-background/60 border-border rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {REASONS.map((r) => (
                    <SelectItem key={r} value={r}>{r}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="text-xs text-muted-foreground">Notes</Label>
              <Textarea value={notes} onChange={(e) => setNotes(e.target.value)} className="mt-1 bg-background/60 border-border rounded-xl" />
            </div>
          </div>
          <DialogFooter>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>Cancel</Button>
            <Button
              className="bg-gradient-brand text-primary-foreground hover:opacity-90"
              disabled={!phone.trim()}
              onClick={() => {
                add({
                  id: `s-${Date.now()}`,
                  phone_number: phone,
                  business_name: business || "Unknown",
                  reason,
                  source: "Manual",
                  created_at: new Date().toISOString(),
                  created_by: "Alex",
                  notes,
                });
                setPhone(""); setBusiness(""); setNotes("");
                setAddOpen(false);
              }}
            >
              Add to suppression
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
          if (confirmRemove) remove(confirmRemove.id);
          setConfirmRemove(null);
        }}
      />
    </div>
  );
}
