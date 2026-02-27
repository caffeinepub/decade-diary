import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetMonthlyEntries,
  useAddMonthlyEntry,
  useUpdateMonthlyEntry,
  useGetCouple,
} from '../hooks/useQueries';
import type { MonthlyEntry, Task, ImportantDate, Budget } from '../backend';
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
  CalendarDays,
  DollarSign,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const MONTH_NAMES = [
  'January', 'February', 'March', 'April', 'May', 'June',
  'July', 'August', 'September', 'October', 'November', 'December',
];

const MOOD_EMOJIS = ['😄', '😌', '🤩', '😴', '😔', '😤', '🥰', '😊', '😰', '🤗', '😑', '🌟'];

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

function makeDefaultEntry(year: number, month: number): MonthlyEntry {
  return {
    year: BigInt(year),
    month: BigInt(month),
    goals: [],
    importantDates: [],
    budget: { income: BigInt(0), expenses: [], notes: '' },
    moodTracker: [],
    reflection: '',
  };
}

// ─── Mood Grid ────────────────────────────────────────────────────────────────

interface MoodGridProps {
  year: number;
  month: number;
  moods: string[];
  onChange: (moods: string[]) => void;
  readOnly?: boolean;
}

function MoodGrid({ year, month, moods, onChange, readOnly = false }: MoodGridProps) {
  const daysInMonth = getDaysInMonth(year, month);
  const [pickerDay, setPickerDay] = useState<number | null>(null);

  const getMood = (day: number) => moods[day - 1] ?? '';

  const setMood = (day: number, emoji: string) => {
    const updated = [...moods];
    while (updated.length < daysInMonth) updated.push('');
    updated[day - 1] = updated[day - 1] === emoji ? '' : emoji;
    onChange(updated);
    setPickerDay(null);
  };

  return (
    <div className="space-y-3">
      <div className="grid grid-cols-7 gap-1.5">
        {Array.from({ length: daysInMonth }, (_, i) => i + 1).map((day) => {
          const mood = getMood(day);
          return (
            <div key={day} className="relative">
              <button
                type="button"
                disabled={readOnly}
                onClick={() => !readOnly && setPickerDay(pickerDay === day ? null : day)}
                className={`w-full aspect-square rounded-xl border-2 flex flex-col items-center justify-center transition-all text-xs ${
                  mood
                    ? 'border-primary/40 bg-primary/5'
                    : 'border-border/30 bg-secondary/20 hover:border-primary/30'
                } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
              >
                <span className="text-[10px] font-body text-muted-foreground leading-none">{day}</span>
                <span className="text-base leading-none mt-0.5">{mood || (readOnly ? '' : '·')}</span>
              </button>

              {/* Emoji Picker Popover */}
              {!readOnly && pickerDay === day && (
                <div className="absolute z-20 top-full mt-1 left-1/2 -translate-x-1/2 bg-card border border-border rounded-2xl shadow-warm-lg p-2 grid grid-cols-4 gap-1 w-36">
                  {MOOD_EMOJIS.map((emoji) => (
                    <button
                      key={emoji}
                      type="button"
                      onClick={() => setMood(day, emoji)}
                      className="text-xl p-1 rounded-lg hover:bg-secondary transition-colors"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>
      <p className="text-xs font-body text-muted-foreground italic">
        {readOnly ? 'Partner\'s mood tracker.' : 'Click a day to set your mood emoji.'}
      </p>
    </div>
  );
}

// ─── Entry Form ───────────────────────────────────────────────────────────────

interface EntryFormProps {
  entry: MonthlyEntry;
  onChange: (entry: MonthlyEntry) => void;
  readOnly?: boolean;
}

function EntryForm({ entry, onChange, readOnly = false }: EntryFormProps) {
  const year = Number(entry.year);
  const month = Number(entry.month);

  // Goals
  const addGoal = () => onChange({ ...entry, goals: [...entry.goals, { description: '', isComplete: false }] });
  const removeGoal = (i: number) => onChange({ ...entry, goals: entry.goals.filter((_, idx) => idx !== i) });
  const updateGoal = (i: number, field: keyof Task, val: string | boolean) => {
    const goals = [...entry.goals];
    goals[i] = { ...goals[i], [field]: val };
    onChange({ ...entry, goals });
  };

  // Important Dates
  const addDate = () => onChange({ ...entry, importantDates: [...entry.importantDates, { date: BigInt(0), labelText: '' }] });
  const removeDate = (i: number) => onChange({ ...entry, importantDates: entry.importantDates.filter((_, idx) => idx !== i) });
  const updateDate = (i: number, field: keyof ImportantDate, val: string | bigint) => {
    const dates = [...entry.importantDates];
    dates[i] = { ...dates[i], [field]: val };
    onChange({ ...entry, importantDates: dates });
  };

  // Budget
  const updateBudget = (field: keyof Budget, val: string | bigint | string[]) => {
    onChange({ ...entry, budget: { ...entry.budget, [field]: val } });
  };
  const addExpense = () => updateBudget('expenses', [...entry.budget.expenses, '']);
  const removeExpense = (i: number) => updateBudget('expenses', entry.budget.expenses.filter((_, idx) => idx !== i));
  const updateExpense = (i: number, val: string) => {
    const expenses = [...entry.budget.expenses];
    expenses[i] = val;
    updateBudget('expenses', expenses);
  };

  return (
    <div className="space-y-5">
      {/* Monthly Goals */}
      <div className="card-warm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="section-title">🎯 Monthly Goals</h3>
          {!readOnly && (
            <Button type="button" variant="outline" size="sm" onClick={addGoal} className="font-body text-xs">
              <Plus className="w-3 h-3 mr-1" /> Add Goal
            </Button>
          )}
        </div>
        {entry.goals.length === 0 ? (
          <p className="text-sm font-body text-muted-foreground italic text-center py-3">
            {readOnly ? 'No goals set.' : 'Add your goals for this month.'}
          </p>
        ) : (
          <div className="space-y-3">
            {entry.goals.map((goal, i) => (
              <div key={i} className="flex items-center gap-3">
                <Checkbox
                  id={`mgoal-${i}-${readOnly ? 'ro' : 'rw'}`}
                  checked={goal.isComplete}
                  onCheckedChange={(checked) => !readOnly && updateGoal(i, 'isComplete', !!checked)}
                  disabled={readOnly}
                  className="shrink-0"
                />
                {readOnly ? (
                  <span className={`font-body text-sm flex-1 ${goal.isComplete ? 'line-through text-muted-foreground' : ''}`}>
                    {goal.description || '—'}
                  </span>
                ) : (
                  <Input
                    placeholder="Goal description..."
                    value={goal.description}
                    onChange={(e) => updateGoal(i, 'description', e.target.value)}
                    className={`font-body flex-1 ${goal.isComplete ? 'line-through text-muted-foreground' : ''}`}
                  />
                )}
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeGoal(i)}
                    className="w-8 h-8 shrink-0 text-muted-foreground hover:text-destructive"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </Button>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Important Dates */}
      <div className="card-warm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="section-title">📅 Important Dates</h3>
          {!readOnly && (
            <Button type="button" variant="outline" size="sm" onClick={addDate} className="font-body text-xs">
              <Plus className="w-3 h-3 mr-1" /> Add Date
            </Button>
          )}
        </div>
        {entry.importantDates.length === 0 ? (
          <p className="text-sm font-body text-muted-foreground italic text-center py-3">
            {readOnly ? 'No important dates.' : 'Add birthdays, anniversaries, deadlines...'}
          </p>
        ) : (
          <div className="space-y-2">
            {entry.importantDates.map((d, i) => (
              <div key={i} className="flex items-center gap-2">
                <CalendarDays className="w-4 h-4 text-muted-foreground shrink-0" />
                {readOnly ? (
                  <>
                    <span className="font-body text-sm w-8 shrink-0 text-muted-foreground">{String(d.date)}</span>
                    <span className="font-body text-sm flex-1">{d.labelText || '—'}</span>
                  </>
                ) : (
                  <>
                    <Input
                      type="number"
                      min={1}
                      max={getDaysInMonth(year, month)}
                      placeholder="Day"
                      value={d.date === BigInt(0) ? '' : String(d.date)}
                      onChange={(e) => updateDate(i, 'date', BigInt(e.target.value || 0))}
                      className="font-body text-sm w-20 shrink-0"
                    />
                    <Input
                      placeholder="Label (e.g. Birthday, Deadline...)"
                      value={d.labelText}
                      onChange={(e) => updateDate(i, 'labelText', e.target.value)}
                      className="font-body text-sm flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => removeDate(i)}
                      className="w-8 h-8 shrink-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </>
                )}
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Budget */}
      <div className="card-warm p-5 space-y-4">
        <h3 className="section-title">💰 Budget</h3>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="space-y-1.5">
            <label className="label-warm text-xs">Income</label>
            {readOnly ? (
              <p className="font-body text-sm font-semibold text-foreground">
                ${String(entry.budget.income)}
              </p>
            ) : (
              <div className="relative">
                <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                <Input
                  type="number"
                  min={0}
                  placeholder="0"
                  value={entry.budget.income === BigInt(0) ? '' : String(entry.budget.income)}
                  onChange={(e) => updateBudget('income', BigInt(e.target.value || 0))}
                  className="font-body pl-8"
                />
              </div>
            )}
          </div>
          <div className="space-y-1.5">
            <label className="label-warm text-xs">Budget Notes</label>
            {readOnly ? (
              <p className="font-body text-sm text-foreground">{entry.budget.notes || '—'}</p>
            ) : (
              <Input
                placeholder="Notes..."
                value={entry.budget.notes}
                onChange={(e) => updateBudget('notes', e.target.value)}
                className="font-body"
              />
            )}
          </div>
        </div>
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <label className="label-warm text-xs">Expenses</label>
            {!readOnly && (
              <Button type="button" variant="outline" size="sm" onClick={addExpense} className="font-body text-xs">
                <Plus className="w-3 h-3 mr-1" /> Add
              </Button>
            )}
          </div>
          {entry.budget.expenses.length === 0 ? (
            <p className="text-xs font-body text-muted-foreground italic">
              {readOnly ? 'No expenses listed.' : 'Add expense line items.'}
            </p>
          ) : (
            <div className="space-y-2">
              {entry.budget.expenses.map((exp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <span className="text-muted-foreground text-xs font-body w-4 shrink-0">{i + 1}.</span>
                  {readOnly ? (
                    <span className="font-body text-sm flex-1">{exp || '—'}</span>
                  ) : (
                    <>
                      <Input
                        placeholder="e.g. Rent $1200, Groceries $300..."
                        value={exp}
                        onChange={(e) => updateExpense(i, e.target.value)}
                        className="font-body text-sm flex-1"
                      />
                      <Button
                        type="button"
                        variant="ghost"
                        size="icon"
                        onClick={() => removeExpense(i)}
                        className="w-8 h-8 shrink-0 text-muted-foreground hover:text-destructive"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                      </Button>
                    </>
                  )}
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Mood Tracker */}
      <div className="card-warm p-5 space-y-4">
        <h3 className="section-title">🌈 Mood Tracker</h3>
        <MoodGrid
          year={year}
          month={month}
          moods={entry.moodTracker}
          onChange={(moods) => onChange({ ...entry, moodTracker: moods })}
          readOnly={readOnly}
        />
      </div>

      {/* Monthly Reflection */}
      <div className="card-warm p-5 space-y-3">
        <h3 className="section-title">💭 Monthly Reflection</h3>
        {readOnly ? (
          <p className="font-body text-sm text-foreground whitespace-pre-wrap">
            {entry.reflection || '—'}
          </p>
        ) : (
          <Textarea
            placeholder="What went well? What would you do differently? What are you grateful for this month?"
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

// ─── Monthly Planner Page ─────────────────────────────────────────────────────

export default function MonthlyPlanner() {
  const { identity } = useInternetIdentity();
  const { data: allEntries = [], isLoading } = useGetMonthlyEntries();
  const { data: couple } = useGetCouple();
  const addEntry = useAddMonthlyEntry();
  const updateEntry = useUpdateMonthlyEntry();

  const now = new Date();
  const [selectedYear, setSelectedYear] = useState(now.getFullYear());
  const [selectedMonth, setSelectedMonth] = useState(now.getMonth() + 1); // 1-indexed
  const [myEntry, setMyEntry] = useState<MonthlyEntry>(makeDefaultEntry(now.getFullYear(), now.getMonth() + 1));
  const [isSaving, setIsSaving] = useState(false);

  const existingEntry = allEntries.find(
    (e) => Number(e.year) === selectedYear && Number(e.month) === selectedMonth
  );
  const isCouple = !!couple;

  useEffect(() => {
    if (existingEntry) {
      setMyEntry(existingEntry);
    } else {
      setMyEntry(makeDefaultEntry(selectedYear, selectedMonth));
    }
  }, [selectedYear, selectedMonth, existingEntry?.year, existingEntry?.month]);

  if (!identity) return null;

  const navigateMonth = (delta: number) => {
    let newMonth = selectedMonth + delta;
    let newYear = selectedYear;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setSelectedMonth(newMonth);
    setSelectedYear(newYear);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const entryToSave: MonthlyEntry = {
      ...myEntry,
      year: BigInt(selectedYear),
      month: BigInt(selectedMonth),
    };
    try {
      if (existingEntry) {
        await updateEntry.mutateAsync({
          year: BigInt(selectedYear),
          month: BigInt(selectedMonth),
          entry: entryToSave,
        });
        toast.success('Monthly plan updated! ✨');
      } else {
        await addEntry.mutateAsync(entryToSave);
        toast.success('Monthly plan saved! 🎉');
      }
    } catch {
      toast.error('Failed to save monthly plan.');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-start justify-between gap-4">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Monthly Planner 📆
          </h1>
          <p className="font-body text-muted-foreground mt-1">
            Goals, dates, budget, and mood — all in one place.
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

      {/* Month/Year Picker */}
      <div className="card-warm p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => navigateMonth(-1)}
          className="rounded-xl"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center space-y-1">
          <div className="flex items-center gap-2 justify-center">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span className="font-display text-xl font-bold text-foreground">
              {MONTH_NAMES[selectedMonth - 1]} {selectedYear}
            </span>
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
          onClick={() => navigateMonth(1)}
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
        <div className="space-y-4">
          <div className="flex items-center gap-2 px-1">
            <Heart className="w-4 h-4 text-rose-dusty fill-current" />
            <span className="font-body text-sm font-semibold text-muted-foreground">Couple Mode — Your Plan</span>
          </div>
          <EntryForm entry={myEntry} onChange={setMyEntry} readOnly={false} />
          <Separator className="my-6" />
          <div className="flex items-center gap-2 px-1">
            <Heart className="w-4 h-4 text-rose-dusty fill-current" />
            <span className="font-body text-sm font-semibold text-muted-foreground">Partner's Plan (read-only)</span>
          </div>
          <EntryForm entry={myEntry} onChange={() => {}} readOnly={true} />
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
