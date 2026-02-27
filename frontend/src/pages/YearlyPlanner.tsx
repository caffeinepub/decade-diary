import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetYearlyEntries,
  useAddYearlyEntry,
  useUpdateYearlyEntry,
  useGetCouple,
} from '../hooks/useQueries';
import type { YearlyEntry, Task, HabitYearly } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Badge } from '@/components/ui/badge';
import {
  ChevronLeft,
  ChevronRight,
  Save,
  Loader2,
  Plus,
  Trash2,
  Heart,
  Star,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTHS_SHORT = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const CURRENT_YEAR = new Date().getFullYear();

// ─── Default Entry Factory ────────────────────────────────────────────────────

function makeDefaultEntry(year: number): YearlyEntry {
  return {
    year: BigInt(year),
    wordOfTheYear: '',
    majorGoals: Array.from({ length: 5 }, () => ({ description: '', isComplete: false })),
    visionImages: ['', '', ''],
    habitTracker: [],
    reflection: '',
  };
}

// ─── Habit Grid ───────────────────────────────────────────────────────────────

interface HabitGridProps {
  habits: HabitYearly[];
  onChange: (habits: HabitYearly[]) => void;
  readOnly?: boolean;
}

function HabitGrid({ habits, onChange, readOnly = false }: HabitGridProps) {
  const addHabit = () => {
    onChange([...habits, { name: '', monthlyCheckIns: Array(12).fill(false) }]);
  };

  const removeHabit = (i: number) => {
    onChange(habits.filter((_, idx) => idx !== i));
  };

  const updateHabitName = (i: number, name: string) => {
    const updated = [...habits];
    updated[i] = { ...updated[i], name };
    onChange(updated);
  };

  const toggleMonth = (habitIdx: number, monthIdx: number) => {
    const updated = [...habits];
    const checkIns = [...updated[habitIdx].monthlyCheckIns];
    checkIns[monthIdx] = !checkIns[monthIdx];
    updated[habitIdx] = { ...updated[habitIdx], monthlyCheckIns: checkIns };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {/* Month headers */}
      {habits.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-36 shrink-0" />
          <div className="flex gap-1 flex-1 overflow-x-auto">
            {MONTHS_SHORT.map((m) => (
              <div key={m} className="w-8 shrink-0 text-center text-xs font-body font-semibold text-muted-foreground">
                {m}
              </div>
            ))}
          </div>
          {!readOnly && <div className="w-8 shrink-0" />}
        </div>
      )}

      {habits.map((habit, i) => (
        <div key={i} className="flex items-center gap-2">
          {readOnly ? (
            <div className="w-36 shrink-0 text-sm font-body text-foreground truncate">{habit.name || '—'}</div>
          ) : (
            <Input
              value={habit.name}
              onChange={(e) => updateHabitName(i, e.target.value)}
              placeholder={`Habit ${i + 1}`}
              className="w-36 shrink-0 font-body text-sm h-8"
            />
          )}
          <div className="flex gap-1 flex-1 overflow-x-auto">
            {MONTHS_SHORT.map((_, mIdx) => {
              const checked = habit.monthlyCheckIns[mIdx] ?? false;
              return (
                <button
                  key={mIdx}
                  type="button"
                  disabled={readOnly}
                  onClick={() => !readOnly && toggleMonth(i, mIdx)}
                  className={`w-8 h-8 shrink-0 rounded-lg border-2 transition-all text-xs font-bold ${
                    checked
                      ? 'bg-primary border-primary text-primary-foreground'
                      : 'border-border/40 bg-secondary/30 hover:border-primary/40'
                  } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
                >
                  {checked ? '✓' : ''}
                </button>
              );
            })}
          </div>
          {!readOnly && (
            <Button
              type="button"
              variant="ghost"
              size="icon"
              onClick={() => removeHabit(i)}
              className="w-8 h-8 shrink-0 text-muted-foreground hover:text-destructive"
            >
              <Trash2 className="w-3.5 h-3.5" />
            </Button>
          )}
        </div>
      ))}

      {!readOnly && (
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={addHabit}
          className="font-body text-xs mt-1"
        >
          <Plus className="w-3 h-3 mr-1" /> Add Habit
        </Button>
      )}

      {habits.length === 0 && (
        <p className="text-sm font-body text-muted-foreground italic text-center py-3">
          {readOnly ? 'No habits tracked.' : 'Add habits to track monthly progress.'}
        </p>
      )}
    </div>
  );
}

// ─── Entry Form ───────────────────────────────────────────────────────────────

interface EntryFormProps {
  entry: YearlyEntry;
  onChange: (entry: YearlyEntry) => void;
  readOnly?: boolean;
  label?: string;
}

function EntryForm({ entry, onChange, readOnly = false, label }: EntryFormProps) {
  const updateGoal = (i: number, field: keyof Task, val: string | boolean) => {
    const goals = [...entry.majorGoals];
    goals[i] = { ...goals[i], [field]: val };
    onChange({ ...entry, majorGoals: goals });
  };

  const updateVision = (i: number, val: string) => {
    const visions = [...entry.visionImages];
    visions[i] = val;
    onChange({ ...entry, visionImages: visions });
  };

  return (
    <div className="space-y-5">
      {label && (
        <div className="flex items-center gap-2">
          <Heart className="w-4 h-4 text-rose-dusty fill-current" />
          <span className="font-body font-semibold text-sm text-muted-foreground">{label}</span>
        </div>
      )}

      {/* Word of the Year */}
      <div className="card-warm p-5 space-y-3">
        <h3 className="section-title">✨ Word of the Year</h3>
        {readOnly ? (
          <p className="font-display text-2xl font-bold text-primary italic">
            {entry.wordOfTheYear || '—'}
          </p>
        ) : (
          <Input
            value={entry.wordOfTheYear}
            onChange={(e) => onChange({ ...entry, wordOfTheYear: e.target.value })}
            placeholder="e.g. Growth, Abundance, Clarity..."
            className="font-display text-lg font-semibold"
          />
        )}
      </div>

      {/* 5 Major Goals */}
      <div className="card-warm p-5 space-y-4">
        <h3 className="section-title">🎯 5 Major Goals</h3>
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => {
            const goal = entry.majorGoals[i] ?? { description: '', isComplete: false };
            return (
              <div key={i} className="flex items-center gap-3">
                <Checkbox
                  id={`goal-${i}-${readOnly ? 'ro' : 'rw'}`}
                  checked={goal.isComplete}
                  onCheckedChange={(checked) => !readOnly && updateGoal(i, 'isComplete', !!checked)}
                  disabled={readOnly}
                  className="shrink-0"
                />
                {readOnly ? (
                  <span className={`font-body text-sm flex-1 ${goal.isComplete ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                    {goal.description || `Goal ${i + 1}`}
                  </span>
                ) : (
                  <Input
                    placeholder={`Goal ${i + 1}`}
                    value={goal.description}
                    onChange={(e) => updateGoal(i, 'description', e.target.value)}
                    className={`font-body flex-1 ${goal.isComplete ? 'line-through text-muted-foreground' : ''}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Vision Images (text descriptions) */}
      <div className="card-warm p-5 space-y-4">
        <h3 className="section-title">🌟 Vision Descriptions</h3>
        <p className="text-sm font-body text-muted-foreground">Describe your vision for this year in vivid detail.</p>
        <div className="space-y-3">
          {[0, 1, 2].map((i) => {
            const vision = entry.visionImages[i] ?? '';
            return readOnly ? (
              <div key={i} className="p-3 rounded-xl bg-secondary/30 border border-border/30">
                <p className="font-body text-sm text-foreground">{vision || '—'}</p>
              </div>
            ) : (
              <Input
                key={i}
                placeholder={`Vision ${i + 1} — e.g. "I am living in my dream home..."`}
                value={vision}
                onChange={(e) => updateVision(i, e.target.value)}
                className="font-body"
              />
            );
          })}
        </div>
      </div>

      {/* Habit Tracker */}
      <div className="card-warm p-5 space-y-4">
        <h3 className="section-title">📊 Habit Tracker</h3>
        <p className="text-sm font-body text-muted-foreground">Track your habits across all 12 months.</p>
        <div className="overflow-x-auto">
          <HabitGrid
            habits={entry.habitTracker}
            onChange={(habits) => onChange({ ...entry, habitTracker: habits })}
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* Year-End Reflection */}
      <div className="card-warm p-5 space-y-3">
        <h3 className="section-title">💭 Year-End Reflection</h3>
        {readOnly ? (
          <p className="font-body text-sm text-foreground whitespace-pre-wrap">
            {entry.reflection || '—'}
          </p>
        ) : (
          <Textarea
            placeholder="What did you accomplish? What did you learn? What are you most proud of?"
            value={entry.reflection}
            onChange={(e) => onChange({ ...entry, reflection: e.target.value })}
            className="font-body resize-none"
            rows={5}
          />
        )}
      </div>
    </div>
  );
}

// ─── Yearly Planner Page ──────────────────────────────────────────────────────

export default function YearlyPlanner() {
  const { identity } = useInternetIdentity();
  const { data: allEntries = [], isLoading } = useGetYearlyEntries();
  const { data: couple } = useGetCouple();
  const addEntry = useAddYearlyEntry();
  const updateEntry = useUpdateYearlyEntry();

  const [selectedYear, setSelectedYear] = useState(CURRENT_YEAR);
  const [myEntry, setMyEntry] = useState<YearlyEntry>(makeDefaultEntry(CURRENT_YEAR));
  const [isSaving, setIsSaving] = useState(false);

  const existingEntry = allEntries.find((e) => Number(e.year) === selectedYear);
  const isCouple = !!couple;

  // Load entry when year or data changes
  useEffect(() => {
    if (existingEntry) {
      const goals = [...existingEntry.majorGoals];
      while (goals.length < 5) goals.push({ description: '', isComplete: false });
      const visions = [...existingEntry.visionImages];
      while (visions.length < 3) visions.push('');
      setMyEntry({
        ...existingEntry,
        majorGoals: goals.slice(0, 5),
        visionImages: visions.slice(0, 3),
      });
    } else {
      setMyEntry(makeDefaultEntry(selectedYear));
    }
  }, [selectedYear, existingEntry?.year]);

  if (!identity) return null;

  const handleSave = async () => {
    setIsSaving(true);
    const entryToSave: YearlyEntry = {
      ...myEntry,
      year: BigInt(selectedYear),
      majorGoals: myEntry.majorGoals.filter((g) => g.description.trim()),
      visionImages: myEntry.visionImages.filter((v) => v.trim()),
    };
    try {
      if (existingEntry) {
        await updateEntry.mutateAsync({ year: BigInt(selectedYear), entry: entryToSave });
        toast.success('Yearly plan updated! ✨');
      } else {
        await addEntry.mutateAsync(entryToSave);
        toast.success('Yearly plan saved! 🎉');
      }
    } catch {
      toast.error('Failed to save yearly plan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Yearly Planner 🗓️
          </h1>
          <p className="font-body text-muted-foreground mt-1">
            Set your word, goals, and vision for the year ahead.
          </p>
        </div>
        <Button
          onClick={handleSave}
          disabled={isSaving}
          className="font-body font-semibold rounded-2xl shadow-warm shrink-0"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Save Plan</>
          )}
        </Button>
      </div>

      {/* Year Selector */}
      <div className="card-warm p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedYear((y) => y - 1)}
          className="rounded-xl"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center space-y-1">
          <div className="flex items-center gap-2 justify-center">
            <Star className="w-4 h-4 text-primary" />
            <span className="font-display text-2xl font-bold text-foreground">{selectedYear}</span>
          </div>
          {existingEntry && (
            <Badge variant="secondary" className="text-xs font-body">
              Plan exists ✓
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedYear((y) => y + 1)}
          className="rounded-xl"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-40 rounded-2xl" />)}
        </div>
      ) : isCouple ? (
        /* Couple Mode: side-by-side */
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Heart className="w-4 h-4 text-rose-dusty fill-current" />
            <span className="font-body text-sm font-semibold text-muted-foreground">Couple Mode — Your Plan</span>
          </div>
          <EntryForm
            entry={myEntry}
            onChange={setMyEntry}
            readOnly={false}
          />
          <Separator className="my-6" />
          <div className="flex items-center gap-2 px-1">
            <Heart className="w-4 h-4 text-rose-dusty fill-current" />
            <span className="font-body text-sm font-semibold text-muted-foreground">Partner's Plan (read-only)</span>
          </div>
          <EntryForm
            entry={myEntry}
            onChange={() => {}}
            readOnly={true}
            label="Partner's yearly plan is shared with you"
          />
        </div>
      ) : (
        <EntryForm entry={myEntry} onChange={setMyEntry} />
      )}

      <Separator />
      <div className="flex justify-end">
        <Button
          onClick={handleSave}
          disabled={isSaving}
          size="lg"
          className="font-body font-semibold rounded-2xl shadow-warm px-8"
        >
          {isSaving ? (
            <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
          ) : (
            <><Save className="w-4 h-4 mr-2" /> Save Plan</>
          )}
        </Button>
      </div>
    </div>
  );
}
