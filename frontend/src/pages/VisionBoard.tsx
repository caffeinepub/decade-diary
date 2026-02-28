import { useState } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetVisionBoardEntries,
  useAddVisionBoardEntry,
  useUpdateVisionBoardProgress,
  useDeleteVisionBoardEntry,
  useGetCouple,
  useGetPartnerVisionBoardEntries,
} from '../hooks/useQueries';
import { GoalCategory, type VisionBoardEntry } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Slider } from '@/components/ui/slider';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
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
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Plus, Trash2, X, Loader2, Target, Heart, Users } from 'lucide-react';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const CATEGORIES = [
  { value: GoalCategory.career, label: 'Career', emoji: '💼' },
  { value: GoalCategory.financial, label: 'Financial', emoji: '💰' },
  { value: GoalCategory.health, label: 'Health', emoji: '💪' },
  { value: GoalCategory.relationship, label: 'Relationship', emoji: '❤️' },
  { value: GoalCategory.personalGrowth, label: 'Personal Growth', emoji: '🌱' },
  { value: GoalCategory.travel, label: 'Travel', emoji: '✈️' },
  { value: GoalCategory.spiritual, label: 'Spiritual', emoji: '🕊️' },
];

const CATEGORY_COLORS: Record<string, string> = {
  [GoalCategory.career]: 'bg-blue-50 border-blue-200 dark:bg-blue-950/30 dark:border-blue-800',
  [GoalCategory.financial]: 'bg-green-50 border-green-200 dark:bg-green-950/30 dark:border-green-800',
  [GoalCategory.health]: 'bg-red-50 border-red-200 dark:bg-red-950/30 dark:border-red-800',
  [GoalCategory.relationship]: 'bg-pink-50 border-pink-200 dark:bg-pink-950/30 dark:border-pink-800',
  [GoalCategory.personalGrowth]: 'bg-emerald-50 border-emerald-200 dark:bg-emerald-950/30 dark:border-emerald-800',
  [GoalCategory.travel]: 'bg-sky-50 border-sky-200 dark:bg-sky-950/30 dark:border-sky-800',
  [GoalCategory.spiritual]: 'bg-purple-50 border-purple-200 dark:bg-purple-950/30 dark:border-purple-800',
};

const CURRENT_YEAR = new Date().getFullYear();

// ─── Add Goal Modal ───────────────────────────────────────────────────────────

interface AddGoalModalProps {
  open: boolean;
  onClose: () => void;
}

function AddGoalModal({ open, onClose }: AddGoalModalProps) {
  const addEntry = useAddVisionBoardEntry();
  const [category, setCategory] = useState<GoalCategory>(GoalCategory.career);
  const [targetYear, setTargetYear] = useState(CURRENT_YEAR + 1);
  const [milestones, setMilestones] = useState(['']);
  const [whyThisMatters, setWhyThisMatters] = useState('');
  const [progress, setProgress] = useState(0);

  const handleAddMilestone = () => setMilestones([...milestones, '']);
  const handleRemoveMilestone = (i: number) => setMilestones(milestones.filter((_, idx) => idx !== i));
  const handleMilestoneChange = (i: number, val: string) => {
    const updated = [...milestones];
    updated[i] = val;
    setMilestones(updated);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    const entry: VisionBoardEntry = {
      category,
      targetYear: BigInt(targetYear),
      milestones: milestones.filter((m) => m.trim()),
      whyThisMatters,
      progressPercentage: BigInt(progress),
    };
    try {
      await addEntry.mutateAsync(entry);
      toast.success('Goal added to your vision board!');
      onClose();
      setCategory(GoalCategory.career);
      setTargetYear(CURRENT_YEAR + 1);
      setMilestones(['']);
      setWhyThisMatters('');
      setProgress(0);
    } catch {
      toast.error('Failed to add goal. Please try again.');
    }
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && onClose()}>
      <DialogContent className="sm:max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="font-display text-2xl">Add Vision Goal</DialogTitle>
          <DialogDescription className="font-body text-muted-foreground">
            Define a goal that will shape your future.
          </DialogDescription>
        </DialogHeader>
        <form onSubmit={handleSubmit} className="space-y-5 pt-2">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="label-warm">Category</Label>
              <Select value={category} onValueChange={(v) => setCategory(v as GoalCategory)}>
                <SelectTrigger className="font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {CATEGORIES.map((c) => (
                    <SelectItem key={c.value} value={c.value} className="font-body">
                      {c.emoji} {c.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-1.5">
              <Label className="label-warm">Target Year</Label>
              <Select
                value={String(targetYear)}
                onValueChange={(v) => setTargetYear(parseInt(v))}
              >
                <SelectTrigger className="font-body">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {Array.from({ length: 21 }, (_, i) => CURRENT_YEAR + i).map((yr) => (
                    <SelectItem key={yr} value={String(yr)} className="font-body">
                      {yr}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-1.5">
            <Label className="label-warm">Why This Matters 💭</Label>
            <Textarea
              placeholder="What drives this goal? How will it change your life?"
              value={whyThisMatters}
              onChange={(e) => setWhyThisMatters(e.target.value)}
              className="font-body resize-none"
              rows={3}
            />
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="label-warm">Milestones</Label>
              <Button type="button" variant="ghost" size="sm" onClick={handleAddMilestone} className="font-body text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            </div>
            {milestones.map((m, i) => (
              <div key={i} className="flex gap-2">
                <Input
                  placeholder={`Milestone ${i + 1}`}
                  value={m}
                  onChange={(e) => handleMilestoneChange(i, e.target.value)}
                  className="font-body text-sm"
                />
                {milestones.length > 1 && (
                  <Button type="button" variant="ghost" size="icon" onClick={() => handleRemoveMilestone(i)}>
                    <X className="w-4 h-4" />
                  </Button>
                )}
              </div>
            ))}
          </div>

          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label className="label-warm">Initial Progress</Label>
              <span className="text-sm font-body font-semibold text-primary">{progress}%</span>
            </div>
            <Slider
              value={[progress]}
              onValueChange={([v]) => setProgress(v)}
              min={0}
              max={100}
              step={5}
              className="w-full"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose} className="font-body">
              Cancel
            </Button>
            <Button type="submit" disabled={addEntry.isPending} className="font-body">
              {addEntry.isPending ? <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Adding...</> : 'Add Goal'}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

// ─── Vision Goal Card (editable) ──────────────────────────────────────────────

interface VisionGoalCardProps {
  entry: VisionBoardEntry;
}

function VisionGoalCard({ entry }: VisionGoalCardProps) {
  const updateProgress = useUpdateVisionBoardProgress();
  const deleteEntry = useDeleteVisionBoardEntry();
  const [localProgress, setLocalProgress] = useState(Number(entry.progressPercentage));
  const [deleteOpen, setDeleteOpen] = useState(false);

  const cat = CATEGORIES.find((c) => c.value === (entry.category as unknown as string));
  const colorClass = CATEGORY_COLORS[entry.category as unknown as string] || '';

  const handleProgressCommit = async (val: number) => {
    try {
      await updateProgress.mutateAsync({ targetYear: entry.targetYear, progress: BigInt(val) });
    } catch {
      toast.error('Failed to update progress.');
      setLocalProgress(Number(entry.progressPercentage));
    }
  };

  const handleDelete = async () => {
    try {
      await deleteEntry.mutateAsync(entry.targetYear);
      toast.success('Goal removed from vision board.');
    } catch {
      toast.error('Failed to delete goal.');
    }
    setDeleteOpen(false);
  };

  return (
    <>
      <div className={`rounded-2xl border p-5 space-y-4 shadow-warm transition-shadow hover:shadow-warm-lg ${colorClass}`}>
        {/* Header */}
        <div className="flex items-start justify-between gap-2">
          <div className="flex items-center gap-2 flex-wrap">
            <span className="text-xl">{cat?.emoji || '🎯'}</span>
            <Badge variant="secondary" className="font-body text-xs">
              {cat?.label || entry.category as unknown as string}
            </Badge>
            <Badge variant="outline" className="font-body text-xs">
              {String(entry.targetYear)}
            </Badge>
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="shrink-0 text-muted-foreground hover:text-destructive h-7 w-7"
            onClick={() => setDeleteOpen(true)}
          >
            <Trash2 className="w-3.5 h-3.5" />
          </Button>
        </div>

        {/* Why this matters */}
        {entry.whyThisMatters && (
          <p className="text-sm font-body text-foreground/80 italic leading-relaxed">
            "{entry.whyThisMatters}"
          </p>
        )}

        {/* Milestones */}
        {entry.milestones.length > 0 && (
          <div className="space-y-1.5">
            <p className="label-warm text-xs">Milestones</p>
            <ul className="space-y-1">
              {entry.milestones.map((m, i) => (
                <li key={i} className="flex items-start gap-1.5 text-xs font-body text-foreground/70">
                  <span className="text-primary mt-0.5">•</span>
                  <span>{m}</span>
                </li>
              ))}
            </ul>
          </div>
        )}

        {/* Progress */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <p className="label-warm text-xs">Progress</p>
            <span className="text-sm font-body font-bold text-primary">{localProgress}%</span>
          </div>
          <Progress value={localProgress} className="h-2" />
          <Slider
            value={[localProgress]}
            onValueChange={([v]) => setLocalProgress(v)}
            onValueCommit={([v]) => handleProgressCommit(v)}
            min={0}
            max={100}
            step={5}
            className="w-full"
            disabled={updateProgress.isPending}
          />
        </div>
      </div>

      <AlertDialog open={deleteOpen} onOpenChange={setDeleteOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle className="font-display">Delete this goal?</AlertDialogTitle>
            <AlertDialogDescription className="font-body">
              This will permanently remove this vision goal. This action cannot be undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="font-body">Cancel</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDelete}
              className="font-body bg-destructive text-destructive-foreground hover:bg-destructive/90"
            >
              {deleteEntry.isPending ? <Loader2 className="w-4 h-4 animate-spin" /> : 'Delete'}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}

// ─── Partner Vision Goal Card (read-only) ─────────────────────────────────────

interface PartnerVisionGoalCardProps {
  entry: VisionBoardEntry;
}

function PartnerVisionGoalCard({ entry }: PartnerVisionGoalCardProps) {
  const cat = CATEGORIES.find((c) => c.value === (entry.category as unknown as string));
  const colorClass = CATEGORY_COLORS[entry.category as unknown as string] || '';
  const progress = Number(entry.progressPercentage);

  return (
    <div className={`rounded-2xl border p-5 space-y-4 shadow-warm ${colorClass} opacity-90`}>
      {/* Header */}
      <div className="flex items-start justify-between gap-2">
        <div className="flex items-center gap-2 flex-wrap">
          <span className="text-xl">{cat?.emoji || '🎯'}</span>
          <Badge variant="secondary" className="font-body text-xs">
            {cat?.label || entry.category as unknown as string}
          </Badge>
          <Badge variant="outline" className="font-body text-xs">
            {String(entry.targetYear)}
          </Badge>
        </div>
        <Badge variant="outline" className="font-body text-xs text-muted-foreground shrink-0">
          read-only
        </Badge>
      </div>

      {/* Why this matters */}
      {entry.whyThisMatters && (
        <p className="text-sm font-body text-foreground/80 italic leading-relaxed">
          "{entry.whyThisMatters}"
        </p>
      )}

      {/* Milestones */}
      {entry.milestones.length > 0 && (
        <div className="space-y-1.5">
          <p className="label-warm text-xs">Milestones</p>
          <ul className="space-y-1">
            {entry.milestones.map((m, i) => (
              <li key={i} className="flex items-start gap-1.5 text-xs font-body text-foreground/70">
                <span className="text-primary mt-0.5">•</span>
                <span>{m}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Progress (display only) */}
      <div className="space-y-2">
        <div className="flex items-center justify-between">
          <p className="label-warm text-xs">Progress</p>
          <span className="text-sm font-body font-bold text-primary">{progress}%</span>
        </div>
        <Progress value={progress} className="h-2" />
      </div>
    </div>
  );
}

// ─── Goals Grid ───────────────────────────────────────────────────────────────

interface GoalsGridProps {
  entries: VisionBoardEntry[];
  readOnly?: boolean;
}

function GoalsGrid({ entries, readOnly = false }: GoalsGridProps) {
  const grouped: Record<string, VisionBoardEntry[]> = {};
  for (const entry of entries) {
    const cat = entry.category as unknown as string;
    if (!grouped[cat]) grouped[cat] = [];
    grouped[cat].push(entry);
  }

  return (
    <div className="space-y-8">
      {CATEGORIES.map(({ value, label, emoji }) => {
        const catEntries = grouped[value] || [];
        if (catEntries.length === 0) return null;
        return (
          <section key={value}>
            <div className="flex items-center gap-2 mb-4">
              <span className="text-2xl">{emoji}</span>
              <h2 className="font-display text-xl font-semibold text-foreground">{label}</h2>
              <Badge variant="secondary" className="font-body text-xs ml-1">
                {catEntries.length}
              </Badge>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
              {catEntries.map((entry, i) =>
                readOnly ? (
                  <PartnerVisionGoalCard key={`${value}-${i}`} entry={entry} />
                ) : (
                  <VisionGoalCard key={`${value}-${i}`} entry={entry} />
                )
              )}
            </div>
          </section>
        );
      })}
    </div>
  );
}

// ─── Vision Board Page ────────────────────────────────────────────────────────

export default function VisionBoard() {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();

  // Fetch my own entries using my principal
  const { data: entries = [], isLoading: myLoading } = useGetVisionBoardEntries(myPrincipal);
  const { data: couple } = useGetCouple();
  const [addOpen, setAddOpen] = useState(false);
  const [viewMode, setViewMode] = useState<'mine' | 'partner'>('mine');

  const isCouple = !!couple;

  // Partner entries — uses the no-arg backend call that resolves partner from caller context
  const { data: partnerEntries = [], isLoading: partnerLoading } = useGetPartnerVisionBoardEntries();

  if (!identity) return null;

  const isLoading = viewMode === 'mine' ? myLoading : partnerLoading;
  const activeEntries = viewMode === 'mine' ? entries : partnerEntries;

  return (
    <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4 flex-wrap">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Vision Board 🎯
          </h1>
          <p className="font-body text-muted-foreground mt-1">
            Map your goals across every dimension of life.
          </p>
        </div>
        {viewMode === 'mine' && (
          <Button
            onClick={() => setAddOpen(true)}
            className="font-body font-semibold rounded-2xl shadow-warm shrink-0"
          >
            <Plus className="w-4 h-4 mr-2" /> Add Goal
          </Button>
        )}
      </div>

      {/* Couple Toggle */}
      {isCouple && (
        <div className="flex items-center gap-2 p-1 bg-secondary/50 rounded-2xl w-fit">
          <button
            onClick={() => setViewMode('mine')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all ${
              viewMode === 'mine'
                ? 'bg-card shadow-warm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Target className="w-4 h-4" />
            My Goals
          </button>
          <button
            onClick={() => setViewMode('partner')}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-body font-semibold transition-all ${
              viewMode === 'partner'
                ? 'bg-card shadow-warm text-foreground'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <Users className="w-4 h-4" />
            Partner's Goals
          </button>
        </div>
      )}

      {/* Content */}
      {isLoading ? (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3, 4, 5, 6].map((i) => (
            <Skeleton key={i} className="h-48 rounded-2xl" />
          ))}
        </div>
      ) : activeEntries.length === 0 ? (
        <div className="text-center py-20 space-y-4">
          <div className="text-6xl">🌟</div>
          <h2 className="font-display text-2xl font-semibold text-foreground">
            {viewMode === 'partner' ? "Your partner hasn't added any goals yet" : 'Your vision board is empty'}
          </h2>
          <p className="font-body text-muted-foreground max-w-md mx-auto">
            {viewMode === 'partner'
              ? 'Check back later when your partner adds their vision goals.'
              : 'Start by adding your first vision goal. Dream big — your future self will thank you!'}
          </p>
          {viewMode === 'mine' && (
            <Button
              onClick={() => setAddOpen(true)}
              size="lg"
              className="font-body font-semibold rounded-2xl shadow-warm mt-2"
            >
              <Plus className="w-4 h-4 mr-2" /> Add Your First Goal
            </Button>
          )}
        </div>
      ) : (
        <>
          {viewMode === 'partner' && (
            <div className="flex items-center gap-2 px-1">
              <Heart className="w-4 h-4 text-rose-dusty fill-current" />
              <span className="font-body text-sm font-semibold text-muted-foreground">
                Partner's Goals (read-only)
              </span>
            </div>
          )}
          <GoalsGrid entries={activeEntries} readOnly={viewMode === 'partner'} />
        </>
      )}

      <AddGoalModal open={addOpen} onClose={() => setAddOpen(false)} />
    </div>
  );
}
