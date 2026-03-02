import React, { useState } from 'react';
import { Plus, Target, TrendingUp, Trash2, Edit2, ChevronDown, ChevronUp, Star, Users } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogDescription,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from '@/components/ui/alert-dialog';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Slider } from '@/components/ui/slider';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  useGetVisionBoardEntries,
  useGetPartnerVisionBoardEntries,
  useSaveVisionBoardEntry,
  useUpdateVisionBoardProgress,
  useDeleteVisionBoardEntry,
} from '../hooks/useQueries';
import { GoalCategory, type VisionBoardEntry } from '../backend';
import { useGetPartnerUserProfile } from '../hooks/useQueries';

// ─── Category helpers ─────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<GoalCategory, string> = {
  [GoalCategory.career]: 'Career',
  [GoalCategory.financial]: 'Financial',
  [GoalCategory.health]: 'Health',
  [GoalCategory.relationship]: 'Relationship',
  [GoalCategory.personalGrowth]: 'Personal Growth',
  [GoalCategory.travel]: 'Travel',
  [GoalCategory.spiritual]: 'Spiritual',
};

const CATEGORY_COLORS: Record<GoalCategory, string> = {
  [GoalCategory.career]: 'bg-blue-100 text-blue-800',
  [GoalCategory.financial]: 'bg-green-100 text-green-800',
  [GoalCategory.health]: 'bg-red-100 text-red-800',
  [GoalCategory.relationship]: 'bg-pink-100 text-pink-800',
  [GoalCategory.personalGrowth]: 'bg-purple-100 text-purple-800',
  [GoalCategory.travel]: 'bg-yellow-100 text-yellow-800',
  [GoalCategory.spiritual]: 'bg-indigo-100 text-indigo-800',
};

const CATEGORY_EMOJIS: Record<GoalCategory, string> = {
  [GoalCategory.career]: '💼',
  [GoalCategory.financial]: '💰',
  [GoalCategory.health]: '❤️',
  [GoalCategory.relationship]: '💑',
  [GoalCategory.personalGrowth]: '🌱',
  [GoalCategory.travel]: '✈️',
  [GoalCategory.spiritual]: '🕊️',
};

// ─── GoalCard ─────────────────────────────────────────────────────────────────

interface GoalCardProps {
  entry: VisionBoardEntry;
  onEdit?: (entry: VisionBoardEntry) => void;
  onDelete?: (id: bigint) => void;
  onProgressChange?: (id: bigint, progress: number) => void;
  readOnly?: boolean;
}

function GoalCard({ entry, onEdit, onDelete, onProgressChange, readOnly = false }: GoalCardProps) {
  const [expanded, setExpanded] = useState(false);
  const [localProgress, setLocalProgress] = useState(Number(entry.progressPercentage));

  const handleProgressCommit = (value: number[]) => {
    const newProgress = value[0];
    setLocalProgress(newProgress);
    onProgressChange?.(entry.id, newProgress);
  };

  return (
    <div className="bg-card border border-border rounded-xl shadow-sm overflow-hidden transition-all hover:shadow-md">
      {/* Header */}
      <div className="p-4 pb-3">
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 min-w-0">
            <span className="text-2xl flex-shrink-0">{CATEGORY_EMOJIS[entry.category]}</span>
            <div className="min-w-0">
              <span className={`inline-block text-xs font-semibold px-2 py-0.5 rounded-full mb-1 ${CATEGORY_COLORS[entry.category]}`}>
                {CATEGORY_LABELS[entry.category]}
              </span>
              <p className="text-sm text-muted-foreground">Target: {String(entry.targetYear)}</p>
            </div>
          </div>
          {!readOnly && (
            <div className="flex items-center gap-1 flex-shrink-0">
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-foreground"
                onClick={() => onEdit?.(entry)}
              >
                <Edit2 className="h-4 w-4" />
              </Button>
              <Button
                variant="ghost"
                size="icon"
                className="h-8 w-8 text-muted-foreground hover:text-destructive"
                onClick={() => onDelete?.(entry.id)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          )}
        </div>

        {/* Progress */}
        <div className="mt-3">
          <div className="flex items-center justify-between mb-1">
            <span className="text-xs text-muted-foreground">Progress</span>
            <span className="text-xs font-semibold text-primary">{localProgress}%</span>
          </div>
          {readOnly ? (
            <Progress value={localProgress} className="h-2" />
          ) : (
            <Slider
              value={[localProgress]}
              min={0}
              max={100}
              step={5}
              onValueChange={(v) => setLocalProgress(v[0])}
              onValueCommit={handleProgressCommit}
              className="mt-1"
            />
          )}
        </div>
      </div>

      {/* Why this matters */}
      {entry.whyThisMatters && (
        <div className="px-4 pb-3">
          <p className="text-sm text-foreground/80 italic">"{entry.whyThisMatters}"</p>
        </div>
      )}

      {/* Milestones toggle */}
      {entry.milestones.length > 0 && (
        <div className="border-t border-border">
          <button
            className="w-full flex items-center justify-between px-4 py-2 text-xs text-muted-foreground hover:bg-muted/50 transition-colors"
            onClick={() => setExpanded(!expanded)}
          >
            <span className="flex items-center gap-1">
              <Star className="h-3 w-3" />
              {entry.milestones.length} milestone{entry.milestones.length !== 1 ? 's' : ''}
            </span>
            {expanded ? <ChevronUp className="h-3 w-3" /> : <ChevronDown className="h-3 w-3" />}
          </button>
          {expanded && (
            <ul className="px-4 pb-3 space-y-1">
              {entry.milestones.map((m, i) => (
                <li key={i} className="flex items-start gap-2 text-sm">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}

// ─── GoalFormDialog ───────────────────────────────────────────────────────────

interface GoalFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: VisionBoardEntry) => void;
  initial?: VisionBoardEntry | null;
  isSaving?: boolean;
}

function GoalFormDialog({ open, onClose, onSave, initial, isSaving }: GoalFormDialogProps) {
  const [category, setCategory] = useState<GoalCategory>(initial?.category ?? GoalCategory.personalGrowth);
  const [targetYear, setTargetYear] = useState(initial ? String(initial.targetYear) : String(new Date().getFullYear() + 1));
  const [whyThisMatters, setWhyThisMatters] = useState(initial?.whyThisMatters ?? '');
  const [milestonesText, setMilestonesText] = useState(initial?.milestones.join('\n') ?? '');
  const [progress, setProgress] = useState(initial ? Number(initial.progressPercentage) : 0);

  // Reset form when dialog opens with new initial value
  React.useEffect(() => {
    if (open) {
      setCategory(initial?.category ?? GoalCategory.personalGrowth);
      setTargetYear(initial ? String(initial.targetYear) : String(new Date().getFullYear() + 1));
      setWhyThisMatters(initial?.whyThisMatters ?? '');
      setMilestonesText(initial?.milestones.join('\n') ?? '');
      setProgress(initial ? Number(initial.progressPercentage) : 0);
    }
  }, [open, initial]);

  const handleSave = () => {
    const milestones = milestonesText
      .split('\n')
      .map((m) => m.trim())
      .filter(Boolean);

    const entry: VisionBoardEntry = {
      id: initial?.id ?? BigInt(Date.now()),
      category,
      targetYear: BigInt(parseInt(targetYear) || new Date().getFullYear() + 1),
      whyThisMatters,
      milestones,
      progressPercentage: BigInt(progress),
    };

    onSave(entry);
  };

  return (
    <Dialog open={open} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg">
        <DialogHeader>
          <DialogTitle>{initial ? 'Edit Goal' : 'Add New Goal'}</DialogTitle>
          <DialogDescription>
            {initial ? 'Update your vision board goal.' : 'Add a new long-term goal to your vision board.'}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Category */}
          <div className="space-y-1.5">
            <Label>Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as GoalCategory)}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.values(GoalCategory).map((cat) => (
                  <SelectItem key={cat} value={cat}>
                    {CATEGORY_EMOJIS[cat]} {CATEGORY_LABELS[cat]}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Year */}
          <div className="space-y-1.5">
            <Label>Target Year</Label>
            <Input
              type="number"
              value={targetYear}
              onChange={(e) => setTargetYear(e.target.value)}
              min={new Date().getFullYear()}
              max={2100}
            />
          </div>

          {/* Why This Matters */}
          <div className="space-y-1.5">
            <Label>Why This Matters</Label>
            <Textarea
              value={whyThisMatters}
              onChange={(e) => setWhyThisMatters(e.target.value)}
              placeholder="What motivates you toward this goal?"
              rows={2}
            />
          </div>

          {/* Milestones */}
          <div className="space-y-1.5">
            <Label>Milestones (one per line)</Label>
            <Textarea
              value={milestonesText}
              onChange={(e) => setMilestonesText(e.target.value)}
              placeholder="e.g. Save first $10k&#10;Open investment account&#10;Reach $50k"
              rows={3}
            />
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <div className="flex items-center justify-between">
              <Label>Current Progress</Label>
              <span className="text-sm font-semibold text-primary">{progress}%</span>
            </div>
            <Slider
              value={[progress]}
              min={0}
              max={100}
              step={5}
              onValueChange={(v) => setProgress(v[0])}
            />
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving}>
            {isSaving ? (
              <span className="flex items-center gap-2">
                <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                Saving…
              </span>
            ) : (
              'Save Goal'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── VisionBoard Page ─────────────────────────────────────────────────────────

export default function VisionBoard() {
  const { data: entries = [], isLoading } = useGetVisionBoardEntries();
  const { data: partnerEntries = [] } = useGetPartnerVisionBoardEntries();
  const { data: partnerProfile } = useGetPartnerUserProfile();

  const saveEntry = useSaveVisionBoardEntry();
  const updateProgress = useUpdateVisionBoardProgress();
  const deleteEntry = useDeleteVisionBoardEntry();

  const [formOpen, setFormOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<VisionBoardEntry | null>(null);

  // Delete confirmation state
  const [deleteDialogOpen, setDeleteDialogOpen] = useState(false);
  const [deleteTargetId, setDeleteTargetId] = useState<bigint | null>(null);

  const hasPartner = !!partnerProfile;

  // ── Handlers ──────────────────────────────────────────────────────────────

  const handleAddNew = () => {
    setEditingEntry(null);
    setFormOpen(true);
  };

  const handleEdit = (entry: VisionBoardEntry) => {
    setEditingEntry(entry);
    setFormOpen(true);
  };

  const handleSave = async (entry: VisionBoardEntry) => {
    await saveEntry.mutateAsync(entry);
    setFormOpen(false);
    setEditingEntry(null);
  };

  const handleDeleteRequest = (id: bigint) => {
    setDeleteTargetId(id);
    setDeleteDialogOpen(true);
  };

  const handleDeleteConfirm = async () => {
    if (deleteTargetId === null) return;
    await deleteEntry.mutateAsync(deleteTargetId);
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  const handleDeleteCancel = () => {
    setDeleteDialogOpen(false);
    setDeleteTargetId(null);
  };

  const handleProgressChange = async (id: bigint, progress: number) => {
    await updateProgress.mutateAsync({ entryId: id, progress: BigInt(progress) });
  };

  // ── Stats ─────────────────────────────────────────────────────────────────

  const avgProgress =
    entries.length > 0
      ? Math.round(entries.reduce((sum, e) => sum + Number(e.progressPercentage), 0) / entries.length)
      : 0;

  const categoryCounts = entries.reduce<Record<string, number>>((acc, e) => {
    const key = e.category as string;
    acc[key] = (acc[key] ?? 0) + 1;
    return acc;
  }, {});

  const topCategory = Object.entries(categoryCounts).sort((a, b) => b[1] - a[1])[0]?.[0] as GoalCategory | undefined;

  // ── Render ────────────────────────────────────────────────────────────────

  return (
    <div className="min-h-screen bg-background">
      <main className="max-w-5xl mx-auto px-4 py-8">
        {/* Page Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-3xl font-display font-bold text-foreground flex items-center gap-2">
              <Target className="h-8 w-8 text-primary" />
              Vision Board
            </h1>
            <p className="text-muted-foreground mt-1">Your long-term goals and aspirations</p>
          </div>
          <Button onClick={handleAddNew} className="flex items-center gap-2">
            <Plus className="h-4 w-4" />
            Add Goal
          </Button>
        </div>

        {/* Stats Row */}
        {entries.length > 0 && (
          <div className="grid grid-cols-3 gap-4 mb-8">
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{entries.length}</p>
              <p className="text-sm text-muted-foreground mt-1">Total Goals</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">{avgProgress}%</p>
              <p className="text-sm text-muted-foreground mt-1">Avg Progress</p>
            </div>
            <div className="bg-card border border-border rounded-xl p-4 text-center">
              <p className="text-3xl font-bold text-primary">
                {topCategory ? CATEGORY_EMOJIS[topCategory] : '🎯'}
              </p>
              <p className="text-sm text-muted-foreground mt-1">
                {topCategory ? CATEGORY_LABELS[topCategory] : 'No focus yet'}
              </p>
            </div>
          </div>
        )}

        {/* Main Content */}
        {hasPartner ? (
          <Tabs defaultValue="mine">
            <TabsList className="mb-6">
              <TabsTrigger value="mine">My Goals</TabsTrigger>
              <TabsTrigger value="partner" className="flex items-center gap-1">
                <Users className="h-3.5 w-3.5" />
                {partnerProfile.displayName || partnerProfile.name}'s Goals
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mine">
              <GoalGrid
                entries={entries}
                isLoading={isLoading}
                onEdit={handleEdit}
                onDelete={handleDeleteRequest}
                onProgressChange={handleProgressChange}
                onAddNew={handleAddNew}
              />
            </TabsContent>

            <TabsContent value="partner">
              <GoalGrid
                entries={partnerEntries}
                isLoading={false}
                readOnly
                onAddNew={() => {}}
              />
            </TabsContent>
          </Tabs>
        ) : (
          <GoalGrid
            entries={entries}
            isLoading={isLoading}
            onEdit={handleEdit}
            onDelete={handleDeleteRequest}
            onProgressChange={handleProgressChange}
            onAddNew={handleAddNew}
          />
        )}
      </main>

      {/* Goal Form Dialog */}
      <GoalFormDialog
        open={formOpen}
        onClose={() => {
          setFormOpen(false);
          setEditingEntry(null);
        }}
        onSave={handleSave}
        initial={editingEntry}
        isSaving={saveEntry.isPending}
      />

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteDialogOpen} onOpenChange={(v) => { if (!v) handleDeleteCancel(); }}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Goal</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this goal? This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={handleDeleteCancel} disabled={deleteEntry.isPending}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteConfirm}
              disabled={deleteEntry.isPending}
              className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEntry.isPending ? (
                <span className="flex items-center gap-2">
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Deleting…
                </span>
              ) : (
                'Delete'
              )}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}

// ─── GoalGrid ─────────────────────────────────────────────────────────────────

interface GoalGridProps {
  entries: VisionBoardEntry[];
  isLoading: boolean;
  onEdit?: (entry: VisionBoardEntry) => void;
  onDelete?: (id: bigint) => void;
  onProgressChange?: (id: bigint, progress: number) => void;
  onAddNew: () => void;
  readOnly?: boolean;
}

function GoalGrid({ entries, isLoading, onEdit, onDelete, onProgressChange, onAddNew, readOnly = false }: GoalGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <div key={i} className="bg-card border border-border rounded-xl p-4 animate-pulse">
            <div className="h-4 bg-muted rounded w-1/2 mb-3" />
            <div className="h-3 bg-muted rounded w-3/4 mb-2" />
            <div className="h-2 bg-muted rounded w-full" />
          </div>
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16">
        <TrendingUp className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
        <h3 className="text-lg font-semibold text-foreground mb-2">
          {readOnly ? 'No goals yet' : 'Start building your vision'}
        </h3>
        <p className="text-muted-foreground mb-6">
          {readOnly
            ? 'Your partner hasn\'t added any goals yet.'
            : 'Add your first long-term goal to get started.'}
        </p>
        {!readOnly && (
          <Button onClick={onAddNew} className="flex items-center gap-2 mx-auto">
            <Plus className="h-4 w-4" />
            Add Your First Goal
          </Button>
        )}
      </div>
    );
  }

  // Group by category
  const grouped = entries.reduce<Record<string, VisionBoardEntry[]>>((acc, entry) => {
    const key = entry.category as string;
    if (!acc[key]) acc[key] = [];
    acc[key].push(entry);
    return acc;
  }, {});

  return (
    <div className="space-y-8">
      {Object.entries(grouped).map(([cat, catEntries]) => (
        <div key={cat}>
          <div className="flex items-center gap-2 mb-4">
            <span className="text-xl">{CATEGORY_EMOJIS[cat as GoalCategory]}</span>
            <h2 className="text-lg font-semibold text-foreground">{CATEGORY_LABELS[cat as GoalCategory]}</h2>
            <Badge variant="secondary" className="ml-1">{catEntries.length}</Badge>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {catEntries.map((entry) => (
              <GoalCard
                key={String(entry.id)}
                entry={entry}
                onEdit={onEdit}
                onDelete={onDelete}
                onProgressChange={onProgressChange}
                readOnly={readOnly}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}
