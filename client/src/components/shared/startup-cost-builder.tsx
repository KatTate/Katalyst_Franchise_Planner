import { useState, useRef, useCallback, useEffect } from "react";
import { useStartupCosts } from "@/hooks/use-startup-costs";
import {
  addCustomStartupCost,
  removeStartupCost,
  updateStartupCostAmount,
  resetStartupCostToDefault,
  reorderStartupCosts,
  getStartupCostTotals,
} from "../../../../shared/plan-initialization";
import type { StartupCostLineItem } from "../../../../shared/financial-engine";
import { formatCents, parseDollarsToCents } from "@/lib/format-currency";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Tooltip,
  TooltipContent,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  ChevronUp,
  ChevronDown,
  RotateCcw,
  X,
  Plus,
  AlertCircle,
} from "lucide-react";

const CLASSIFICATION_LABELS: Record<
  StartupCostLineItem["capexClassification"],
  { label: string; tooltip: string }
> = {
  capex: {
    label: "Depreciable Asset",
    tooltip: "Long-term items like equipment — cost is spread over multiple years",
  },
  non_capex: {
    label: "One-Time Expense",
    tooltip: "Costs paid once at startup — expensed in Year 1",
  },
  working_capital: {
    label: "Working Capital",
    tooltip: "Cash reserve for operating expenses during ramp-up",
  },
};

interface StartupCostBuilderProps {
  planId: string;
}

export function StartupCostBuilder({ planId }: StartupCostBuilderProps) {
  const { costs, isLoading, error, updateCosts, isSaving } = useStartupCosts(planId);
  const [addingItem, setAddingItem] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editValue, setEditValue] = useState("");
  const addNameRef = useRef<HTMLInputElement>(null);

  const sorted = [...costs].sort((a, b) => a.sortOrder - b.sortOrder);
  const totals = getStartupCostTotals(sorted);

  const saveCosts = useCallback(
    async (newCosts: StartupCostLineItem[]) => {
      try {
        await updateCosts(newCosts);
      } catch {
        // Error handled via mutation state
      }
    },
    [updateCosts]
  );

  // Move item up or down
  const handleMove = useCallback(
    (id: string, direction: "up" | "down") => {
      const idx = sorted.findIndex((c) => c.id === id);
      if (idx < 0) return;
      const swapIdx = direction === "up" ? idx - 1 : idx + 1;
      if (swapIdx < 0 || swapIdx >= sorted.length) return;
      const newOrder = sorted.map((c) => c.id);
      [newOrder[idx], newOrder[swapIdx]] = [newOrder[swapIdx], newOrder[idx]];
      saveCosts(reorderStartupCosts(sorted, newOrder));
    },
    [sorted, saveCosts]
  );

  // Amount edit
  const startEdit = useCallback((item: StartupCostLineItem) => {
    setEditingId(item.id);
    setEditValue((item.amount / 100).toString());
  }, []);

  const commitEdit = useCallback(() => {
    if (!editingId) return;
    const cents = parseDollarsToCents(editValue);
    if (!isNaN(cents)) {
      saveCosts(updateStartupCostAmount(sorted, editingId, cents));
    }
    setEditingId(null);
    setEditValue("");
  }, [editingId, editValue, sorted, saveCosts]);

  // Remove
  const handleRemove = useCallback(
    (id: string) => {
      saveCosts(removeStartupCost(sorted, id));
    },
    [sorted, saveCosts]
  );

  // Reset
  const handleReset = useCallback(
    (id: string) => {
      saveCosts(resetStartupCostToDefault(sorted, id));
    },
    [sorted, saveCosts]
  );

  // Add custom item
  const handleAddSave = useCallback(
    (name: string, amount: string, classification: StartupCostLineItem["capexClassification"]) => {
      const cents = parseDollarsToCents(amount);
      if (!name.trim() || isNaN(cents)) return;
      saveCosts(addCustomStartupCost(sorted, name.trim(), cents, classification));
      setAddingItem(false);
    },
    [sorted, saveCosts]
  );

  if (isLoading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Startup Costs</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          {[1, 2, 3, 4].map((i) => (
            <Skeleton key={i} className="h-12 w-full" />
          ))}
        </CardContent>
      </Card>
    );
  }

  if (error) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Startup Costs</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center gap-2 text-destructive">
            <AlertCircle className="h-4 w-4" />
            <span>Failed to load startup costs. Please try again.</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader className="pb-3">
        <div className="flex items-center justify-between">
          <CardTitle>Startup Costs</CardTitle>
          <span className="text-lg font-bold">{formatCents(totals.grandTotal)}</span>
        </div>
        <div className="flex gap-4 text-sm text-muted-foreground">
          <span>Depreciable: {formatCents(totals.capexTotal)}</span>
          <span>One-Time: {formatCents(totals.nonCapexTotal)}</span>
          <span>Working Capital: {formatCents(totals.workingCapitalTotal)}</span>
        </div>
      </CardHeader>
      <CardContent className="space-y-1">
        {sorted.length === 0 && !addingItem && (
          <p className="text-sm text-muted-foreground py-4 text-center">
            No startup costs configured for this brand. Add a custom item to get started.
          </p>
        )}

        {/* Header row */}
        {sorted.length > 0 && (
          <div className="grid grid-cols-[28px_1fr_120px_100px_140px_110px_80px] gap-2 px-2 py-1 text-xs font-medium text-muted-foreground border-b">
            <span />
            <span>Item</span>
            <span>My Estimate</span>
            <span>Default</span>
            <span>FDD Item 7 Range</span>
            <span>Type</span>
            <span />
          </div>
        )}

        {/* Line items */}
        {sorted.map((item, idx) => (
          <LineItemRow
            key={item.id}
            item={item}
            isFirst={idx === 0}
            isLast={idx === sorted.length - 1}
            isEditing={editingId === item.id}
            editValue={editValue}
            onEditValueChange={setEditValue}
            onStartEdit={startEdit}
            onCommitEdit={commitEdit}
            onMove={handleMove}
            onRemove={handleRemove}
            onReset={handleReset}
          />
        ))}

        {/* Add custom item form */}
        {addingItem && (
          <AddItemForm
            nameRef={addNameRef}
            onSave={handleAddSave}
            onCancel={() => setAddingItem(false)}
          />
        )}

        {/* Add button */}
        {!addingItem && (
          <Button
            variant="outline"
            size="sm"
            className="mt-2 w-full"
            onClick={() => {
              setAddingItem(true);
              setTimeout(() => addNameRef.current?.focus(), 50);
            }}
          >
            <Plus className="h-4 w-4 mr-1" />
            Add Custom Item
          </Button>
        )}

        {isSaving && (
          <p className="text-xs text-muted-foreground text-center pt-1">Saving...</p>
        )}
      </CardContent>
    </Card>
  );
}

// ─── Line Item Row ─────────────────────────────────────────────────────

interface LineItemRowProps {
  item: StartupCostLineItem;
  isFirst: boolean;
  isLast: boolean;
  isEditing: boolean;
  editValue: string;
  onEditValueChange: (v: string) => void;
  onStartEdit: (item: StartupCostLineItem) => void;
  onCommitEdit: () => void;
  onMove: (id: string, dir: "up" | "down") => void;
  onRemove: (id: string) => void;
  onReset: (id: string) => void;
}

function LineItemRow({
  item,
  isFirst,
  isLast,
  isEditing,
  editValue,
  onEditValueChange,
  onStartEdit,
  onCommitEdit,
  onMove,
  onRemove,
  onReset,
}: LineItemRowProps) {
  const isOverridden = !item.isCustom && item.source === "user_entry";
  const classInfo = CLASSIFICATION_LABELS[item.capexClassification];

  return (
    <div
      className={`grid grid-cols-[28px_1fr_120px_100px_140px_110px_80px] gap-2 px-2 py-1.5 items-center rounded hover:bg-muted/50 text-sm ${
        isOverridden ? "bg-muted/30" : ""
      }`}
      data-testid={`startup-cost-row-${item.id}`}
    >
      {/* Move buttons */}
      <div className="flex flex-col">
        <button
          className="p-0 h-3 text-muted-foreground hover:text-foreground disabled:opacity-30"
          disabled={isFirst}
          onClick={() => onMove(item.id, "up")}
          aria-label="Move up"
        >
          <ChevronUp className="h-3 w-3" />
        </button>
        <button
          className="p-0 h-3 text-muted-foreground hover:text-foreground disabled:opacity-30"
          disabled={isLast}
          onClick={() => onMove(item.id, "down")}
          aria-label="Move down"
        >
          <ChevronDown className="h-3 w-3" />
        </button>
      </div>

      {/* Name */}
      <span className="truncate" title={item.name}>
        {item.name}
        {item.isCustom && (
          <span className="ml-1 text-xs text-muted-foreground">(custom)</span>
        )}
      </span>

      {/* My Estimate */}
      {isEditing ? (
        <Input
          className="h-7 text-sm"
          value={editValue}
          onChange={(e) => onEditValueChange(e.target.value)}
          onBlur={onCommitEdit}
          onKeyDown={(e) => {
            if (e.key === "Enter") onCommitEdit();
            if (e.key === "Escape") {
              onEditValueChange("");
              onCommitEdit();
            }
          }}
          autoFocus
        />
      ) : (
        <button
          className="text-left font-mono tabular-nums hover:underline cursor-text"
          onClick={() => onStartEdit(item)}
          data-testid={`edit-amount-${item.id}`}
        >
          {formatCents(item.amount)}
        </button>
      )}

      {/* Brand Default */}
      <span className="text-muted-foreground font-mono tabular-nums text-xs">
        {item.brandDefaultAmount !== null ? formatCents(item.brandDefaultAmount) : "—"}
      </span>

      {/* FDD Item 7 Range */}
      <span className="text-muted-foreground text-xs">
        {item.item7RangeLow !== null && item.item7RangeHigh !== null
          ? `${formatCents(item.item7RangeLow)} – ${formatCents(item.item7RangeHigh)}`
          : "—"}
      </span>

      {/* Classification badge */}
      <Tooltip>
        <TooltipTrigger asChild>
          <Badge variant="secondary" className="text-xs truncate cursor-help">
            {classInfo.label}
          </Badge>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs text-sm">{classInfo.tooltip}</p>
        </TooltipContent>
      </Tooltip>

      {/* Actions */}
      <div className="flex gap-1 justify-end">
        {!item.isCustom && isOverridden && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-1 text-muted-foreground hover:text-foreground"
                onClick={() => onReset(item.id)}
                aria-label="Reset to default"
                data-testid={`reset-${item.id}`}
              >
                <RotateCcw className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Reset to brand default</TooltipContent>
          </Tooltip>
        )}
        {item.isCustom && (
          <Tooltip>
            <TooltipTrigger asChild>
              <button
                className="p-1 text-muted-foreground hover:text-destructive"
                onClick={() => onRemove(item.id)}
                aria-label="Remove item"
                data-testid={`remove-${item.id}`}
              >
                <X className="h-3.5 w-3.5" />
              </button>
            </TooltipTrigger>
            <TooltipContent>Remove custom item</TooltipContent>
          </Tooltip>
        )}
      </div>
    </div>
  );
}

// ─── Add Item Form ─────────────────────────────────────────────────────

interface AddItemFormProps {
  nameRef: React.RefObject<HTMLInputElement>;
  onSave: (name: string, amount: string, classification: StartupCostLineItem["capexClassification"]) => void;
  onCancel: () => void;
}

function AddItemForm({ nameRef, onSave, onCancel }: AddItemFormProps) {
  const [name, setName] = useState("");
  const [amount, setAmount] = useState("");
  const [classification, setClassification] = useState<StartupCostLineItem["capexClassification"]>("non_capex");

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onCancel();
    };
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [onCancel]);

  return (
    <div className="border rounded-md p-3 space-y-2 bg-muted/30" data-testid="add-custom-item-form">
      <div className="grid grid-cols-[1fr_120px_160px] gap-2">
        <Input
          ref={nameRef}
          placeholder="Item name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          maxLength={100}
          className="h-8 text-sm"
        />
        <Input
          placeholder="$0"
          value={amount}
          onChange={(e) => setAmount(e.target.value)}
          className="h-8 text-sm font-mono"
        />
        <Select
          value={classification}
          onValueChange={(v) => setClassification(v as StartupCostLineItem["capexClassification"])}
        >
          <SelectTrigger className="h-8 text-sm">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            <SelectItem value="capex">Depreciable Asset</SelectItem>
            <SelectItem value="non_capex">One-Time Expense</SelectItem>
            <SelectItem value="working_capital">Working Capital</SelectItem>
          </SelectContent>
        </Select>
      </div>
      <div className="flex gap-2 justify-end">
        <Button variant="ghost" size="sm" onClick={onCancel}>
          Cancel
        </Button>
        <Button
          size="sm"
          onClick={() => onSave(name, amount, classification)}
          disabled={!name.trim() || !amount.trim()}
        >
          Save
        </Button>
      </div>
    </div>
  );
}
