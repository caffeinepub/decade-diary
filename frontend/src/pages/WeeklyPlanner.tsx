import { useState, useEffect } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetWeeklyEntries,
  useAddWeeklyEntry,
  useUpdateWeeklyEntry,
  useGetCouple,
} from '../hooks/useQueries';
import type { WeeklyEntry, Task, HabitWeekly } from '../backend';
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
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Constants ────────────────────────────────────────────────────────────────

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

// ─── ISO Week Helpers ─────────────────────────────────────────────────────────

function getISOWeek(date: Date): { year: number; week: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  const week = Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7);
  return { year: d.getUTCFullYear(), week };
}

function getWeekStartDate(year: number, week: number): Date {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const weekStart = new Date(jan4);
  weekStart.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (week - 1) * 7);
  return weekStart;
}

function formatWeekRange(year: number, week: number): string {
  const start = getWeekStartDate(year, week);
  const end = new Date(start);
  end.setUTCDate(start.getUTCDate() + 6);
  const fmt = (d: Date) =>
    d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', timeZone: 'UTC' });
  return `${fmt(start)} – ${fmt(end)}`;
}

function navigateWeek(year: number, week: number, delta: number): { year: number; week: number } {
  const start = getWeekStartDate(year, week);
  start.setUTCDate(start.getUTCDate() + delta * 7);
  return getISOWeek(start);
}

// ─── Default Entry Factory ────────────────────────────────────────────────────

function makeDefaultEntry(year: number, weekNumber: number): WeeklyEntry {
  return {
    year: BigInt(year),
    weekNumber: BigInt(weekNumber),
    priorities: [
      { description: '', isComplete: false },
      { description: '', isComplete: false },
      { description: '', isComplete: false },
    ],
    habitTracker: [],
    todos: [],
    reflection: '',
    energyRating: BigInt(3),
  };
}

// ─── Weekly Habit Grid ────────────────────────────────────────────────────────

interface WeeklyHabitGridProps {
  habits: HabitWeekly[];
  onChange: (habits: HabitWeekly[]) => void;
  readOnly?: boolean;
}

function WeeklyHabitGrid({ habits, onChange, readOnly = false }: WeeklyHabitGridProps) {
  const addHabit = () => {
    onChange([...habits, { name: '', dailyCheckIns: Array(7).fill(false) }]);
  };

  const removeHabit = (i: number) => {
    onChange(habits.filter((_, idx) => idx !== i));
  };

  const updateHabitName = (i: number, name: string) => {
    const updated = [...habits];
    updated[i] = { ...updated[i], name };
    onChange(updated);
  };

  const toggleDay = (habitIdx: number, dayIdx: number) => {
    const updated = [...habits];
    const checkIns = [...updated[habitIdx].dailyCheckIns];
    checkIns[dayIdx] = !checkIns[dayIdx];
    updated[habitIdx] = { ...updated[habitIdx], dailyCheckIns: checkIns };
    onChange(updated);
  };

  return (
    <div className="space-y-3">
      {habits.length > 0 && (
        <div className="flex items-center gap-2">
          <div className="w-32 shrink-0" />
          <div className="flex gap-1.5 flex-1">
            {DAY_LABELS.map((d) => (
              <div key={d} className="w-9 shrink-0 text-center text-xs font-body font-semibold text-muted-foreground">
                {d}
              </div>
            ))}
          </div>
          {!readOnly && <div className="w-8 shrink-0" />}
        </div>
      )}

      {habits.map((habit, i) => (
        <div key={i} className="flex items-center gap-2">
          {readOnly ? (
            <div className="w-32 shrink-0 text-sm font-body text-foreground truncate">{habit.name || '—'}</div>
          ) : (
            <Input
              value={habit.name}
              onChange={(e) => updateHabitName(i, e.target.value)}
              placeholder={`Habit ${i + 1}`}
              className="w-32 shrink-0 font-body text-sm h-8"
            />
          )}
          <div className="flex gap-1.5 flex-1">
            {DAY_LABELS.map((_, dIdx) => {
              const checked = habit.dailyCheckIns[dIdx] ?? false;
              return (
                <button
                  key={dIdx}
                  type="button"
                  disabled={readOnly}
                  onClick={() => !readOnly && toggleDay(i, dIdx)}
                  className={`w-9 h-9 shrink-0 rounded-lg border-2 transition-all text-xs font-bold ${
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
          {readOnly ? 'No habits tracked.' : 'Add habits to track daily progress.'}
        </p>
      )}
    </div>
  );
}

// ─── Energy Rating ────────────────────────────────────────────────────────────

interface EnergyRatingProps {
  value: number;
  onChange: (val: number) => void;
  readOnly?: boolean;
}

function EnergyRating({ value, onChange, readOnly = false }: EnergyRatingProps) {
  const labels = ['', 'Very Low', 'Low', 'Moderate', 'High', 'Excellent'];
  const colors = ['', 'text-destructive', 'text-amber-500', 'text-yellow-500', 'text-green-500', 'text-emerald-500'];

  return (
    <div className="space-y-3">
      <div className="flex items-center gap-2">
        {[1, 2, 3, 4, 5].map((n) => (
          <button
            key={n}
            type="button"
            disabled={readOnly}
            onClick={() => !readOnly && onChange(n)}
            className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all flex-1 ${
              value === n
                ? 'border-primary bg-primary/10 shadow-warm'
                : 'border-border/40 bg-secondary/30 hover:border-primary/40'
            } ${readOnly ? 'cursor-default' : 'cursor-pointer'}`}
          >
            <Zap className={`w-5 h-5 ${value >= n ? colors[n] : 'text-muted-foreground/30'}`} />
            <span className="text-xs font-body font-semibold text-foreground">{n}</span>
          </button>
        ))}
      </div>
      {value > 0 && (
        <p className={`text-sm font-body font-semibold text-center ${colors[value]}`}>
          {labels[value]} Energy
        </p>
      )}
    </div>
  );
}

// ─── Entry Form ───────────────────────────────────────────────────────────────

interface EntryFormProps {
  entry: WeeklyEntry;
  onChange: (entry: WeeklyEntry) => void;
  readOnly?: boolean;
}

function EntryForm({ entry, onChange, readOnly = false }: EntryFormProps) {
  // Priorities
  const updatePriority = (i: number, field: keyof Task, val: string | boolean) => {
    const priorities = [...entry.priorities];
    priorities[i] = { ...priorities[i], [field]: val };
    onChange({ ...entry, priorities });
  };

  // Todos
  const addTodo = () => onChange({ ...entry, todos: [...entry.todos, { description: '', isComplete: false }] });
  const removeTodo = (i: number) => onChange({ ...entry, todos: entry.todos.filter((_, idx) => idx !== i) });
  const updateTodo = (i: number, field: keyof Task, val: string | boolean) => {
    const todos = [...entry.todos];
    todos[i] = { ...todos[i], [field]: val };
    onChange({ ...entry, todos });
  };

  return (
    <div className="space-y-5">
      {/* Top 3 Priorities */}
      <div className="card-warm p-5 space-y-4">
        <h3 className="section-title">🏆 Top 3 Priorities</h3>
        <div className="space-y-3">
          {Array.from({ length: 3 }).map((_, i) => {
            const priority = entry.priorities[i] ?? { description: '', isComplete: false };
            return (
              <div key={i} className="flex items-center gap-3">
                <div className="w-6 h-6 rounded-full bg-primary/10 border border-primary/30 flex items-center justify-center shrink-0">
                  <span className="text-xs font-bold text-primary">{i + 1}</span>
                </div>
                <Checkbox
                  id={`priority-${i}-${readOnly ? 'ro' : 'rw'}`}
                  checked={priority.isComplete}
                  onCheckedChange={(checked) => !readOnly && updatePriority(i, 'isComplete', !!checked)}
                  disabled={readOnly}
                  className="shrink-0"
                />
                {readOnly ? (
                  <span className={`font-body text-sm flex-1 ${priority.isComplete ? 'line-through text-muted-foreground' : ''}`}>
                    {priority.description || `Priority ${i + 1}`}
                  </span>
                ) : (
                  <Input
                    placeholder={`Priority ${i + 1}`}
                    value={priority.description}
                    onChange={(e) => updatePriority(i, 'description', e.target.value)}
                    className={`font-body flex-1 ${priority.isComplete ? 'line-through text-muted-foreground' : ''}`}
                  />
                )}
              </div>
            );
          })}
        </div>
      </div>

      {/* Habit Tracker */}
      <div className="card-warm p-5 space-y-4">
        <h3 className="section-title">📊 Habit Tracker</h3>
        <div className="overflow-x-auto">
          <WeeklyHabitGrid
            habits={entry.habitTracker}
            onChange={(habits) => onChange({ ...entry, habitTracker: habits })}
            readOnly={readOnly}
          />
        </div>
      </div>

      {/* To-Do List */}
      <div className="card-warm p-5 space-y-4">
        <div className="flex items-center justify-between">
          <h3 className="section-title">✅ To-Do List</h3>
          {!readOnly && (
            <Button type="button" variant="outline" size="sm" onClick={addTodo} className="font-body text-xs">
              <Plus className="w-3 h-3 mr-1" /> Add Task
            </Button>
          )}
        </div>
        {entry.todos.length === 0 ? (
          <p className="text-sm font-body text-muted-foreground italic text-center py-3">
            {readOnly ? 'No tasks.' : 'Add tasks for this week.'}
          </p>
        ) : (
          <div className="space-y-3">
            {entry.todos.map((todo, i) => (
              <div key={i} className="flex items-center gap-3">
                <Checkbox
                  id={`todo-${i}-${readOnly ? 'ro' : 'rw'}`}
                  checked={todo.isComplete}
                  onCheckedChange={(checked) => !readOnly && updateTodo(i, 'isComplete', !!checked)}
                  disabled={readOnly}
                  className="shrink-0"
                />
                {readOnly ? (
                  <span className={`font-body text-sm flex-1 ${todo.isComplete ? 'line-through text-muted-foreground' : ''}`}>
                    {todo.description || '—'}
                  </span>
                ) : (
                  <Input
                    placeholder="Task description..."
                    value={todo.description}
                    onChange={(e) => updateTodo(i, 'description', e.target.value)}
                    className={`font-body flex-1 ${todo.isComplete ? 'line-through text-muted-foreground' : ''}`}
                  />
                )}
                {!readOnly && (
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => removeTodo(i)}
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

      {/* Energy Rating */}
      <div className="card-warm p-5 space-y-4">
        <h3 className="section-title">⚡ Energy Rating</h3>
        <p className="text-sm font-body text-muted-foreground">How was your energy level this week?</p>
        <EnergyRating
          value={Number(entry.energyRating)}
          onChange={(val) => onChange({ ...entry, energyRating: BigInt(val) })}
          readOnly={readOnly}
        />
      </div>

      {/* Weekly Reflection */}
      <div className="card-warm p-5 space-y-3">
        <h3 className="section-title">💭 Weekly Reflection</h3>
        {readOnly ? (
          <p className="font-body text-sm text-foreground whitespace-pre-wrap">
            {entry.reflection || '—'}
          </p>
        ) : (
          <Textarea
            placeholder="What did you accomplish? What challenged you? What will you do differently next week?"
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

// ─── Weekly Planner Page ──────────────────────────────────────────────────────

export default function WeeklyPlanner() {
  const { identity } = useInternetIdentity();
  const { data: allEntries = [], isLoading } = useGetWeeklyEntries();
  const { data: couple } = useGetCouple();
  const addEntry = useAddWeeklyEntry();
  const updateEntry = useUpdateWeeklyEntry();

  const todayISO = getISOWeek(new Date());
  const [selectedYear, setSelectedYear] = useState(todayISO.year);
  const [selectedWeek, setSelectedWeek] = useState(todayISO.week);
  const [myEntry, setMyEntry] = useState<WeeklyEntry>(makeDefaultEntry(todayISO.year, todayISO.week));
  const [isSaving, setIsSaving] = useState(false);

  const existingEntry = allEntries.find(
    (e) => Number(e.year) === selectedYear && Number(e.weekNumber) === selectedWeek
  );
  const isCouple = !!couple;

  useEffect(() => {
    if (existingEntry) {
      const priorities = [...existingEntry.priorities];
      while (priorities.length < 3) priorities.push({ description: '', isComplete: false });
      setMyEntry({ ...existingEntry, priorities: priorities.slice(0, 3) });
    } else {
      setMyEntry(makeDefaultEntry(selectedYear, selectedWeek));
    }
  }, [selectedYear, selectedWeek, existingEntry?.year, existingEntry?.weekNumber]);

  if (!identity) return null;

  const handleNavigate = (delta: number) => {
    const { year, week } = navigateWeek(selectedYear, selectedWeek, delta);
    setSelectedYear(year);
    setSelectedWeek(week);
  };

  const handleSave = async () => {
    setIsSaving(true);
    const entryToSave: WeeklyEntry = {
      ...myEntry,
      year: BigInt(selectedYear),
      weekNumber: BigInt(selectedWeek),
      priorities: myEntry.priorities.filter((p) => p.description.trim()),
    };
    try {
      if (existingEntry) {
        await updateEntry.mutateAsync({
          year: BigInt(selectedYear),
          weekNumber: BigInt(selectedWeek),
          entry: entryToSave,
        });
        toast.success('Weekly plan updated! ✨');
      } else {
        await addEntry.mutateAsync(entryToSave);
        toast.success('Weekly plan saved! 🎉');
      }
    } catch {
      toast.error('Failed to save weekly plan.');
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
            Weekly Planner 📋
          </h1>
          <p className="font-body text-muted-foreground mt-1">
            Priorities, habits, and reflection — week by week.
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

      {/* Week Picker */}
      <div className="card-warm p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleNavigate(-1)}
          className="rounded-xl"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center space-y-1">
          <div className="flex items-center gap-2 justify-center">
            <span className="font-display text-lg font-bold text-foreground">
              Week {selectedWeek}, {selectedYear}
            </span>
          </div>
          <p className="text-xs font-body text-muted-foreground">
            {formatWeekRange(selectedYear, selectedWeek)}
          </p>
          {existingEntry && (
            <Badge variant="secondary" className="text-xs font-body">
              Plan exists ✓
            </Badge>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => handleNavigate(1)}
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
