import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetVisionBoardEntries,
  useSaveVisionBoardEntry,
  useUpdateVisionBoardProgress,
  useDeleteVisionBoardEntry,
  useGetCouple,
  useGetPartnerVisionBoardEntries,
} from '../hooks/useQueries';
import { GoalCategory, type VisionBoardEntry } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Skeleton } from '@/components/ui/skeleton';
import { Progress } from '@/components/ui/progress';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
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
import { Label } from '@/components/ui/label';
import {
  Plus,
  Target,
  Trash2,
  Edit3,
  Users,
  Heart,
  Loader2,
  TrendingUp,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';
import { Principal } from '@dfinity/principal';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORY_LABELS: Record<GoalCategory, string> = {
  [GoalCategory.career]: '💼 Career',
  [GoalCategory.financial]: '💰 Financial',
  [GoalCategory.health]: '💪 Health',
  [GoalCategory.relationship]: '❤️ Relationship',
  [GoalCategory.personalGrowth]: '🌱 Personal Growth',
  [GoalCategory.travel]: '✈️ Travel',
  [GoalCategory.spiritual]: '🙏 Spiritual',
};

const CATEGORY_COLORS: Record<GoalCategory, string> = {
  [GoalCategory.career]: 'bg-blue-100 text-blue-800 dark:bg-blue-900/30 dark:text-blue-300',
  [GoalCategory.financial]: 'bg-green-100 text-green-800 dark:bg-green-900/30 dark:text-green-300',
  [GoalCategory.health]: 'bg-red-100 text-red-800 dark:bg-red-900/30 dark:text-red-300',
  [GoalCategory.relationship]: 'bg-pink-100 text-pink-800 dark:bg-pink-900/30 dark:text-pink-300',
  [GoalCategory.personalGrowth]: 'bg-purple-100 text-purple-800 dark:bg-purple-900/30 dark:text-purple-300',
  [GoalCategory.travel]: 'bg-yellow-100 text-yellow-800 dark:bg-yellow-900/30 dark:text-yellow-300',
  [GoalCategory.spiritual]: 'bg-indigo-100 text-indigo-800 dark:bg-indigo-900/30 dark:text-indigo-300',
};

const CURRENT_YEAR = new Date().getFullYear();
const YEAR_OPTIONS = Array.from({ length: 11 }, (_, i) => CURRENT_YEAR + i);

// ─── Helper ───────────────────────────────────────────────────────────────────

function getPartnerPrincipal(
  couple: { partner1: Principal; partner2: Principal } | null | undefined,
  myPrincipal: string
): Principal | undefined {
  if (!couple) return undefined;
  const p1 = couple.partner1.toString();
  const p2 = couple.partner2.toString();
  if (p1 === myPrincipal) return couple.partner2;
  if (p2 === myPrincipal) return couple.partner1;
  return undefined;
}

// ─── Goal Card ────────────────────────────────────────────────────────────────

interface GoalCardProps {
  entry: VisionBoardEntry;
  isOwner: boolean;
  onEdit?: (entry: VisionBoardEntry) => void;
  onDelete?: (targetYear: bigint) => void;
  onProgressUpdate?: (targetYear: bigint, progress: number) => void;
}

function GoalCard({ entry, isOwner, onEdit, onDelete, onProgressUpdate }: GoalCardProps) {
  const progress = Number(entry.progressPercentage);

  return (
    <div className="bg-card rounded-2xl p-5 shadow-warm border border-border space-y-4">
      {/* Header */}
      <div className="flex items-start justify-between gap-3">
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className={`text-xs font-semibold px-2 py-0.5 rounded-full ${CATEGORY_COLORS[entry.category as GoalCategory]}`}>
              {CATEGORY_LABELS[entry.category as GoalCategory]}
            </span>
            <Badge variant="outline" className="text-xs font-body">
              {Number(entry.targetYear)}
            </Badge>
          </div>
        </div>
        {isOwner && (
          <div className="flex items-center gap-1 shrink-0">
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-foreground"
              onClick={() => onEdit?.(entry)}
            >
              <Edit3 className="w-3.5 h-3.5" />
            </Button>
            <Button
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-muted-foreground hover:text-destructive"
              onClick={() => onDelete?.(entry.targetYear)}
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          </div>
        )}
      </div>

      {/* Why This Matters */}
      {entry.whyThisMatters && (
        <p className="text-sm font-body text-foreground leading-relaxed">{entry.whyThisMatters}</p>
      )}

      {/* Milestones */}
      {entry.milestones.length > 0 && (
        <div className="space-y-1.5">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Milestones</p>
          <ul className="space-y-1">
            {entry.milestones.map((m, i) => (
              <li key={i} className="flex items-start gap-2 text-sm font-body text-foreground">
                <Star className="w-3.5 h-3.5 text-primary shrink-0 mt-0.5" />
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <span className="text-xs font-semibold text-muted-foreground uppercase tracking-wide">Progress</span>
          <span className="text-sm font-bold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
        {isOwner && (
          <div className="flex gap-1 flex-wrap">
            {[0, 25, 50, 75, 100].map((p) => (
              <button
                key={p}
                onClick={() => onProgressUpdate?.(entry.targetYear, p)}
                className={`text-xs px-2 py-0.5 rounded-full border transition-colors font-body ${
                  progress === p
                    ? 'bg-primary text-primary-foreground border-primary'
                    : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                }`}
              >
                {p}%
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

// ─── Goal Form Dialog ─────────────────────────────────────────────────────────

interface GoalFormDialogProps {
  open: boolean;
  onClose: () => void;
  onSave: (entry: VisionBoardEntry) => Promise<void>;
  initial?: VisionBoardEntry | null;
  isSaving: boolean;
}

function GoalFormDialog({ open, onClose, onSave, initial, isSaving }: GoalFormDialogProps) {
  const [category, setCategory] = useState<GoalCategory>(initial?.category as GoalCategory ?? GoalCategory.personalGrowth);
  const [targetYear, setTargetYear] = useState(initial ? Number(initial.targetYear) : CURRENT_YEAR + 1);
  const [whyThisMatters, setWhyThisMatters] = useState(initial?.whyThisMatters ?? '');
  const [milestones, setMilestones] = useState<string[]>(initial?.milestones ?? ['']);
  const [progressPercentage, setProgressPercentage] = useState(initial ? Number(initial.progressPercentage) : 0);

  // Reset when dialog opens with new initial
  useState(() => {
    if (initial) {
      setCategory(initial.category as GoalCategory);
      setTargetYear(Number(initial.targetYear));
      setWhyThisMatters(initial.whyThisMatters);
      setMilestones(initial.milestones.length > 0 ? [...initial.milestones] : ['']);
      setProgressPercentage(Number(initial.progressPercentage));
    } else {
      setCategory(GoalCategory.personalGrowth);
      setTargetYear(CURRENT_YEAR + 1);
      setWhyThisMatters('');
      setMilestones(['']);
      setProgressPercentage(0);
    }
  });

  const handleSave = async () => {
    const entry: VisionBoardEntry = {
      category,
      targetYear: BigInt(targetYear),
      whyThisMatters,
      milestones: milestones.filter((m) => m.trim()),
      progressPercentage: BigInt(progressPercentage),
    };
    await onSave(entry);
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-xl">
            {initial ? 'Edit Goal' : 'Add New Goal'}
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4 py-2">
          {/* Category */}
          <div className="space-y-1.5">
            <Label className="label-warm">Category</Label>
            <Select value={category} onValueChange={(v) => setCategory(v as GoalCategory)}>
              <SelectTrigger className="font-body">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(CATEGORY_LABELS).map(([val, label]) => (
                  <SelectItem key={val} value={val} className="font-body">{label}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Target Year */}
          <div className="space-y-1.5">
            <Label className="label-warm">Target Year</Label>
            <Select value={String(targetYear)} onValueChange={(v) => setTargetYear(Number(v))}>
              <SelectTrigger className="font-body">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {YEAR_OPTIONS.map((y) => (
                  <SelectItem key={y} value={String(y)} className="font-body">{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Why This Matters */}
          <div className="space-y-1.5">
            <Label className="label-warm">Why This Matters</Label>
            <Textarea
              value={whyThisMatters}
              onChange={(e) => setWhyThisMatters(e.target.value)}
              placeholder="Describe why this goal is important to you..."
              className="font-body resize-none"
              rows={3}
            />
          </div>

          {/* Milestones */}
          <div className="space-y-2">
            <Label className="label-warm">Milestones</Label>
            {milestones.map((m, i) => (
              <div key={i} className="flex items-center gap-2">
                <Input
                  value={m}
                  onChange={(e) => {
                    const updated = [...milestones];
                    updated[i] = e.target.value;
                    setMilestones(updated);
                  }}
                  placeholder={`Milestone ${i + 1}...`}
                  className="font-body flex-1"
                />
                {milestones.length > 1 && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    className="h-8 w-8 text-muted-foreground hover:text-destructive shrink-0"
                    onClick={() => setMilestones(milestones.filter((_, idx) => idx !== i))}
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
            <Button
              type="button"
              variant="outline"
              size="sm"
              onClick={() => setMilestones([...milestones, ''])}
              className="font-body text-xs"
            >
              <Plus className="w-3 h-3 mr-1" /> Add Milestone
            </Button>
          </div>

          {/* Progress */}
          <div className="space-y-1.5">
            <Label className="label-warm">Current Progress: {progressPercentage}%</Label>
            <div className="flex gap-2 flex-wrap">
              {[0, 10, 25, 50, 75, 90, 100].map((p) => (
                <button
                  key={p}
                  type="button"
                  onClick={() => setProgressPercentage(p)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors font-body ${
                    progressPercentage === p
                      ? 'bg-primary text-primary-foreground border-primary'
                      : 'border-border text-muted-foreground hover:border-primary hover:text-primary'
                  }`}
                >
                  {p}%
                </button>
              ))}
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} className="font-body" disabled={isSaving}>
            Cancel
          </Button>
          <Button onClick={handleSave} disabled={isSaving || !whyThisMatters.trim()} className="font-body">
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              initial ? 'Update Goal' : 'Add Goal'
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Goals Grid ───────────────────────────────────────────────────────────────

interface GoalsGridProps {
  entries: VisionBoardEntry[];
  isLoading: boolean;
  isOwner: boolean;
  onEdit?: (entry: VisionBoardEntry) => void;
  onDelete?: (targetYear: bigint) => void;
  onProgressUpdate?: (targetYear: bigint, progress: number) => void;
  onAddGoal?: () => void;
}

function GoalsGrid({ entries, isLoading, isOwner, onEdit, onDelete, onProgressUpdate, onAddGoal }: GoalsGridProps) {
  if (isLoading) {
    return (
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {[1, 2, 3].map((i) => (
          <Skeleton key={i} className="h-48 w-full rounded-2xl" />
        ))}
      </div>
    );
  }

  if (entries.length === 0) {
    return (
      <div className="text-center py-16 space-y-4">
        <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
          <Target className="w-8 h-8 text-primary" />
        </div>
        <div className="space-y-1">
          <h3 className="font-display text-lg font-semibold text-foreground">
            {isOwner ? 'No goals yet' : 'No goals shared yet'}
          </h3>
          <p className="font-body text-sm text-muted-foreground">
            {isOwner
              ? 'Start building your vision by adding your first long-term goal.'
              : 'Your partner hasn\'t added any vision goals yet.'}
          </p>
        </div>
        {isOwner && onAddGoal && (
          <Button onClick={onAddGoal} className="font-body font-semibold rounded-2xl">
            <Plus className="w-4 h-4 mr-2" /> Add Your First Goal
          </Button>
        )}
      </div>
    );
  }

  // Group by category
  const grouped = entries.reduce<Record<string, VisionBoardEntry[]>>((acc, entry) => {
    const cat = entry.category as string;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(entry);
    return acc;
  }, {});

  return (
    <div className="space-y-6">
      {Object.entries(grouped).map(([cat, catEntries]) => (
        <div key={cat} className="space-y-3">
          <h3 className="font-display text-base font-semibold text-foreground flex items-center gap-2">
            {CATEGORY_LABELS[cat as GoalCategory] ?? cat}
            <Badge variant="secondary" className="font-body text-xs">{catEntries.length}</Badge>
          </h3>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {catEntries.map((entry, i) => (
              <GoalCard
                key={`${cat}-${i}`}
                entry={entry}
                isOwner={isOwner}
                onEdit={onEdit}
                onDelete={onDelete}
                onProgressUpdate={onProgressUpdate}
              />
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function VisionBoard() {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();
  const myPrincipalStr = myPrincipal?.toString() ?? '';

  const { data: couple } = useGetCouple();
  const partnerPrincipal = getPartnerPrincipal(couple ?? null, myPrincipalStr);
  const hasPartner = !!partnerPrincipal;

  const { data: entries = [], isLoading: myLoading } = useGetVisionBoardEntries();
  const { data: partnerEntries = [], isLoading: partnerLoading } = useGetPartnerVisionBoardEntries();

  const saveEntry = useSaveVisionBoardEntry();
  const updateProgress = useUpdateVisionBoardProgress();
  const deleteEntry = useDeleteVisionBoardEntry();

  const [activeTab, setActiveTab] = useState<'mine' | 'partner'>('mine');
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingEntry, setEditingEntry] = useState<VisionBoardEntry | null>(null);
  const [deleteTarget, setDeleteTarget] = useState<bigint | null>(null);
  const [isSavingEntry, setIsSavingEntry] = useState(false);

  if (!identity) return null;

  const handleOpenAddDialog = () => {
    setEditingEntry(null);
    setDialogOpen(true);
  };

  const handleSaveEntry = async (entry: VisionBoardEntry) => {
    setIsSavingEntry(true);
    try {
      await saveEntry.mutateAsync(entry);
      toast.success(editingEntry ? 'Goal updated! 🎯' : 'Goal added! 🎯');
      setDialogOpen(false);
      setEditingEntry(null);
    } catch {
      toast.error('Failed to save goal. Please try again.');
    } finally {
      setIsSavingEntry(false);
    }
  };

  const handleEdit = (entry: VisionBoardEntry) => {
    setEditingEntry(entry);
    setDialogOpen(true);
  };

  const handleDelete = async () => {
    if (deleteTarget === null) return;
    try {
      await deleteEntry.mutateAsync(deleteTarget);
      toast.success('Goal removed.');
      setDeleteTarget(null);
    } catch {
      toast.error('Failed to delete goal.');
    }
  };

  const handleProgressUpdate = async (targetYear: bigint, progress: number) => {
    try {
      await updateProgress.mutateAsync({ targetYear, progress: BigInt(progress) });
    } catch {
      toast.error('Failed to update progress.');
    }
  };

  const totalProgress = entries.length > 0
    ? Math.round(entries.reduce((sum, e) => sum + Number(e.progressPercentage), 0) / entries.length)
    : 0;

  const groupedEntries = entries.reduce<Record<string, VisionBoardEntry[]>>((acc, entry) => {
    const cat = entry.category as string;
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(entry);
    return acc;
  }, {});

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Vision Board 🎯
          </h1>
          <p className="font-body text-muted-foreground mt-1">
            Map your long-term goals and track your journey.
          </p>
        </div>
        {activeTab === 'mine' && (
          <Button
            onClick={handleOpenAddDialog}
            className="font-body font-semibold rounded-2xl shadow-warm shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Goal
          </Button>
        )}
      </div>

      {/* Overall Progress */}
      {entries.length > 0 && (
        <div className="card-warm p-5 space-y-3">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-5 h-5 text-primary" />
            <h2 className="section-title">Overall Progress</h2>
            <span className="ml-auto font-bold text-primary text-lg">{totalProgress}%</span>
          </div>
          <Progress value={totalProgress} className="h-3" />
          <p className="text-xs font-body text-muted-foreground">
            {entries.length} goal{entries.length !== 1 ? 's' : ''} across {Object.keys(groupedEntries).length} categor{Object.keys(groupedEntries).length !== 1 ? 'ies' : 'y'}
          </p>
        </div>
      )}

      {/* Tabs (couple mode) or direct view */}
      {hasPartner ? (
        <div className="space-y-6">
          {/* Tab switcher */}
          <div className="flex gap-2 p-1 bg-muted rounded-xl">
            <button
              onClick={() => setActiveTab('mine')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-body font-medium transition-colors ${
                activeTab === 'mine'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Target className="w-4 h-4" />
              My Goals
              {entries.length > 0 && (
                <Badge variant="secondary" className="text-xs font-body ml-1">{entries.length}</Badge>
              )}
            </button>
            <button
              onClick={() => setActiveTab('partner')}
              className={`flex-1 flex items-center justify-center gap-2 py-2 px-4 rounded-lg text-sm font-body font-medium transition-colors ${
                activeTab === 'partner'
                  ? 'bg-background text-foreground shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <Heart className="w-4 h-4" />
              Partner's Goals
              {partnerEntries.length > 0 && (
                <Badge variant="secondary" className="text-xs font-body ml-1">{partnerEntries.length}</Badge>
              )}
            </button>
          </div>

          {/* Tab content */}
          {activeTab === 'mine' ? (
            <GoalsGrid
              entries={entries}
              isLoading={myLoading}
              isOwner={true}
              onEdit={handleEdit}
              onDelete={(targetYear) => setDeleteTarget(targetYear)}
              onProgressUpdate={handleProgressUpdate}
              onAddGoal={handleOpenAddDialog}
            />
          ) : (
            <div className="space-y-4">
              <div className="flex items-center gap-2 p-3 rounded-xl bg-muted/50 border border-border/40">
                <Users className="w-4 h-4 text-muted-foreground shrink-0" />
                <p className="text-sm font-body text-muted-foreground">
                  Viewing your partner's vision board — read only.
                </p>
              </div>
              <GoalsGrid
                entries={partnerEntries}
                isLoading={partnerLoading}
                isOwner={false}
              />
            </div>
          )}
        </div>
      ) : (
        /* Solo view */
        <GoalsGrid
          entries={entries}
          isLoading={myLoading}
          isOwner={true}
          onEdit={handleEdit}
          onDelete={(targetYear) => setDeleteTarget(targetYear)}
          onProgressUpdate={handleProgressUpdate}
          onAddGoal={handleOpenAddDialog}
        />
      )}

      {/* Goal Form Dialog */}
      <GoalFormDialog
        open={dialogOpen}
        onClose={() => { setDialogOpen(false); setEditingEntry(null); }}
        onSave={handleSaveEntry}
        initial={editingEntry}
        isSaving={isSavingEntry}
      />

      {/* Delete Confirmation */}
      <AlertDialog open={deleteTarget !== null} onOpenChange={(o) => !o && setDeleteTarget(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete Goal?</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This will permanently remove this goal from your vision board. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="font-body bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
