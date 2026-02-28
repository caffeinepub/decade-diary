import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, CheckSquare, List, Zap, BookOpen, Heart, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetWeeklyEntries,
  useGetPartnerWeeklyEntries,
  useAddWeeklyEntry,
  useUpdateWeeklyEntry,
  useGetCouple,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import type { WeeklyEntry, HabitWeekly, Task } from '../backend';
import { toast } from 'sonner';

const DAY_LABELS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getISOWeek(date: Date): { week: number; year: number } {
  const d = new Date(Date.UTC(date.getFullYear(), date.getMonth(), date.getDate()));
  const dayNum = d.getUTCDay() || 7;
  d.setUTCDate(d.getUTCDate() + 4 - dayNum);
  const yearStart = new Date(Date.UTC(d.getUTCFullYear(), 0, 1));
  return {
    week: Math.ceil((((d.getTime() - yearStart.getTime()) / 86400000) + 1) / 7),
    year: d.getUTCFullYear(),
  };
}

function getWeekDateRange(week: number, year: number): string {
  const jan4 = new Date(Date.UTC(year, 0, 4));
  const dayOfWeek = jan4.getUTCDay() || 7;
  const weekStart = new Date(jan4);
  weekStart.setUTCDate(jan4.getUTCDate() - dayOfWeek + 1 + (week - 1) * 7);
  const weekEnd = new Date(weekStart);
  weekEnd.setUTCDate(weekStart.getUTCDate() + 6);
  const fmt = (d: Date) => d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
  return `${fmt(weekStart)} – ${fmt(weekEnd)}`;
}

function getPartnerPrincipal(couple: { partner1: Principal; partner2: Principal } | null | undefined, myPrincipal: string): Principal | undefined {
  if (!couple) return undefined;
  const p1 = couple.partner1.toString();
  const p2 = couple.partner2.toString();
  if (p1 === myPrincipal) return couple.partner2;
  if (p2 === myPrincipal) return couple.partner1;
  return undefined;
}

// ─── Partner Read-Only View ───────────────────────────────────────────────────

function PartnerWeeklyView({ entry }: { entry: WeeklyEntry }) {
  return (
    <div className="space-y-6">
      {/* Priorities */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Top Priorities</h3>
        </div>
        {entry.priorities.length === 0 ? (
          <p className="text-muted-foreground italic">No priorities set</p>
        ) : (
          <ul className="space-y-3">
            {entry.priorities.map((p, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${p.isComplete ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                  {p.isComplete && <span className="text-white text-xs">✓</span>}
                </span>
                <span className={`text-sm ${p.isComplete ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{p.description}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Habit Tracker */}
      {entry.habitTracker.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <CheckSquare className="w-5 h-5 text-primary" />
            <h3 className="font-playfair text-lg font-semibold text-foreground">Habit Tracker</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1 pr-3 text-muted-foreground font-medium">Habit</th>
                  {DAY_LABELS.map(d => (
                    <th key={d} className="text-center py-1 px-2 text-muted-foreground font-medium">{d}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entry.habitTracker.map((habit, hi) => (
                  <tr key={hi} className="border-t border-border/40">
                    <td className="py-2 pr-3 text-foreground font-medium">{habit.name}</td>
                    {Array.from({ length: 7 }, (_, di) => (
                      <td key={di} className="text-center py-2 px-2">
                        <span className={`inline-block w-5 h-5 rounded-full border ${habit.dailyCheckIns[di] ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
                          {habit.dailyCheckIns[di] && <span className="text-white text-xs flex items-center justify-center h-full">✓</span>}
                        </span>
                      </td>
                    ))}
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {/* Todos */}
      {entry.todos.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <List className="w-5 h-5 text-primary" />
            <h3 className="font-playfair text-lg font-semibold text-foreground">To-Do List</h3>
          </div>
          <ul className="space-y-2">
            {entry.todos.map((todo, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`mt-1 w-4 h-4 rounded border flex-shrink-0 flex items-center justify-center ${todo.isComplete ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                  {todo.isComplete && <span className="text-white text-xs">✓</span>}
                </span>
                <span className={`text-sm ${todo.isComplete ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{todo.description}</span>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Energy Rating */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Energy Rating</h3>
        </div>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map(n => (
            <span
              key={n}
              className={`w-10 h-10 rounded-full flex items-center justify-center font-semibold text-sm border-2 ${Number(entry.energyRating) >= n ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 text-muted-foreground'}`}
            >
              {n}
            </span>
          ))}
          <span className="ml-2 text-sm text-muted-foreground">/ 5</span>
        </div>
      </div>

      {/* Reflection */}
      {entry.reflection && (
        <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-playfair text-lg font-semibold text-foreground">Weekly Reflection</h3>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{entry.reflection}</p>
        </div>
      )}
    </div>
  );
}

function PartnerEmptyState({ week, year }: { week: number; year: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Heart className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <h3 className="font-playfair text-lg font-semibold text-muted-foreground mb-2">No plan yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Your partner hasn't created a plan for Week {week}, {year} yet. Check back later!
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function WeeklyPlanner() {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();
  const myPrincipalStr = myPrincipal?.toString() ?? '';

  const today = new Date();
  const { week: todayWeek, year: todayYear } = getISOWeek(today);
  const [week, setWeek] = useState(todayWeek);
  const [year, setYear] = useState(todayYear);
  const [activeTab, setActiveTab] = useState<'mine' | 'partner'>('mine');

  const { data: couple } = useGetCouple();
  const partnerPrincipal = getPartnerPrincipal(couple ?? null, myPrincipalStr);
  const hasPartner = !!partnerPrincipal;

  const { data: myEntries = [], isLoading: myLoading } = useGetWeeklyEntries(myPrincipal);
  const myEntry = myEntries.find(e => Number(e.weekNumber) === week && Number(e.year) === year);

  const { data: partnerEntries = [], isLoading: partnerLoading } = useGetPartnerWeeklyEntries(partnerPrincipal);
  const partnerEntry = partnerEntries.find(e => Number(e.weekNumber) === week && Number(e.year) === year);

  const addEntry = useAddWeeklyEntry();
  const updateEntry = useUpdateWeeklyEntry();

  // Local state
  const [priorities, setPriorities] = useState<Task[]>([
    { description: '', isComplete: false },
    { description: '', isComplete: false },
    { description: '', isComplete: false },
  ]);
  const [habits, setHabits] = useState<HabitWeekly[]>([
    { name: '', dailyCheckIns: Array(7).fill(false) },
    { name: '', dailyCheckIns: Array(7).fill(false) },
    { name: '', dailyCheckIns: Array(7).fill(false) },
  ]);
  const [todos, setTodos] = useState<Task[]>([{ description: '', isComplete: false }]);
  const [energyRating, setEnergyRating] = useState(3);
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (myEntry) {
      const loadedPriorities = [...myEntry.priorities];
      while (loadedPriorities.length < 3) loadedPriorities.push({ description: '', isComplete: false });
      setPriorities(loadedPriorities.slice(0, 3));
      const loadedHabits = myEntry.habitTracker.map(h => ({
        name: h.name,
        dailyCheckIns: [...h.dailyCheckIns].concat(Array(7).fill(false)).slice(0, 7),
      }));
      while (loadedHabits.length < 3) loadedHabits.push({ name: '', dailyCheckIns: Array(7).fill(false) });
      setHabits(loadedHabits);
      const loadedTodos = [...myEntry.todos];
      if (loadedTodos.length === 0) loadedTodos.push({ description: '', isComplete: false });
      setTodos(loadedTodos);
      setEnergyRating(Number(myEntry.energyRating));
      setReflection(myEntry.reflection);
    } else {
      setPriorities([
        { description: '', isComplete: false },
        { description: '', isComplete: false },
        { description: '', isComplete: false },
      ]);
      setHabits([
        { name: '', dailyCheckIns: Array(7).fill(false) },
        { name: '', dailyCheckIns: Array(7).fill(false) },
        { name: '', dailyCheckIns: Array(7).fill(false) },
      ]);
      setTodos([{ description: '', isComplete: false }]);
      setEnergyRating(3);
      setReflection('');
    }
  }, [myEntry, week, year]);

  const navigateWeek = (dir: number) => {
    let newWeek = week + dir;
    let newYear = year;
    const weeksInYear = getISOWeek(new Date(year, 11, 28)).week;
    if (newWeek > weeksInYear) { newWeek = 1; newYear++; }
    if (newWeek < 1) {
      const prevYearWeeks = getISOWeek(new Date(year - 1, 11, 28)).week;
      newWeek = prevYearWeeks;
      newYear--;
    }
    setWeek(newWeek);
    setYear(newYear);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entry: WeeklyEntry = {
        year: BigInt(year),
        weekNumber: BigInt(week),
        priorities: priorities.filter(p => p.description.trim()),
        habitTracker: habits.filter(h => h.name.trim()),
        todos: todos.filter(t => t.description.trim()),
        energyRating: BigInt(energyRating),
        reflection,
      };
      if (myEntry) {
        await updateEntry.mutateAsync({ year: BigInt(year), weekNumber: BigInt(week), entry });
      } else {
        await addEntry.mutateAsync(entry);
      }
      toast.success('Weekly plan saved!');
    } catch {
      toast.error('Failed to save weekly plan');
    } finally {
      setIsSaving(false);
    }
  };

  const togglePriority = (i: number) => setPriorities(prev => prev.map((p, idx) => idx === i ? { ...p, isComplete: !p.isComplete } : p));
  const toggleTodo = (i: number) => setTodos(prev => prev.map((t, idx) => idx === i ? { ...t, isComplete: !t.isComplete } : t));
  const toggleHabit = (hi: number, di: number) => setHabits(prev => prev.map((h, idx) => {
    if (idx !== hi) return h;
    const newCheckIns = [...h.dailyCheckIns];
    newCheckIns[di] = !newCheckIns[di];
    return { ...h, dailyCheckIns: newCheckIns };
  }));

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-2">Weekly Planner</h1>
          <p className="text-muted-foreground">Focus on what matters most this week</p>
        </div>

        {/* Week Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button onClick={() => navigateWeek(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <div className="text-center">
            <span className="font-playfair text-xl font-bold text-foreground block">Week {week}, {year}</span>
            <span className="text-sm text-muted-foreground">{getWeekDateRange(week, year)}</span>
          </div>
          <button onClick={() => navigateWeek(1)} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ChevronRight className="w-5 h-5 text-foreground" />
          </button>
        </div>

        {/* Tabs */}
        {hasPartner ? (
          <Tabs value={activeTab} onValueChange={v => setActiveTab(v as 'mine' | 'partner')} className="w-full">
            <TabsList className="w-full mb-6 bg-muted rounded-xl p-1">
              <TabsTrigger value="mine" className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm">
                My Plan
              </TabsTrigger>
              <TabsTrigger value="partner" className="flex-1 rounded-lg data-[state=active]:bg-card data-[state=active]:shadow-sm flex items-center gap-2">
                <Users className="w-4 h-4" />
                Partner's Plan
              </TabsTrigger>
            </TabsList>

            <TabsContent value="mine">
              {myLoading ? (
                <div className="space-y-4"><Skeleton className="h-48 w-full rounded-2xl" /><Skeleton className="h-48 w-full rounded-2xl" /></div>
              ) : (
                <MyWeeklyPlanForm
                  priorities={priorities} setPriorities={setPriorities} togglePriority={togglePriority}
                  habits={habits} setHabits={setHabits} toggleHabit={toggleHabit}
                  todos={todos} setTodos={setTodos} toggleTodo={toggleTodo}
                  energyRating={energyRating} setEnergyRating={setEnergyRating}
                  reflection={reflection} setReflection={setReflection}
                  isSaving={isSaving} onSave={handleSave}
                />
              )}
            </TabsContent>

            <TabsContent value="partner">
              {partnerLoading ? (
                <div className="space-y-4"><Skeleton className="h-48 w-full rounded-2xl" /><Skeleton className="h-48 w-full rounded-2xl" /></div>
              ) : partnerEntry ? (
                <PartnerWeeklyView entry={partnerEntry} />
              ) : (
                <PartnerEmptyState week={week} year={year} />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          myLoading ? (
            <div className="space-y-4"><Skeleton className="h-48 w-full rounded-2xl" /><Skeleton className="h-48 w-full rounded-2xl" /></div>
          ) : (
            <MyWeeklyPlanForm
              priorities={priorities} setPriorities={setPriorities} togglePriority={togglePriority}
              habits={habits} setHabits={setHabits} toggleHabit={toggleHabit}
              todos={todos} setTodos={setTodos} toggleTodo={toggleTodo}
              energyRating={energyRating} setEnergyRating={setEnergyRating}
              reflection={reflection} setReflection={setReflection}
              isSaving={isSaving} onSave={handleSave}
            />
          )
        )}
      </div>
    </div>
  );
}

// ─── My Plan Form ─────────────────────────────────────────────────────────────

interface MyWeeklyPlanFormProps {
  priorities: Task[]; setPriorities: (v: Task[]) => void; togglePriority: (i: number) => void;
  habits: HabitWeekly[]; setHabits: (v: HabitWeekly[]) => void; toggleHabit: (hi: number, di: number) => void;
  todos: Task[]; setTodos: (v: Task[]) => void; toggleTodo: (i: number) => void;
  energyRating: number; setEnergyRating: (v: number) => void;
  reflection: string; setReflection: (v: string) => void;
  isSaving: boolean; onSave: () => void;
}

function MyWeeklyPlanForm({
  priorities, setPriorities, togglePriority,
  habits, setHabits, toggleHabit,
  todos, setTodos, toggleTodo,
  energyRating, setEnergyRating,
  reflection, setReflection,
  isSaving, onSave,
}: MyWeeklyPlanFormProps) {
  return (
    <div className="space-y-6">
      {/* Priorities */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Star className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Top 3 Priorities</h3>
        </div>
        <div className="space-y-3">
          {priorities.map((p, i) => (
            <div key={i} className="flex items-center gap-3">
              <button
                onClick={() => togglePriority(i)}
                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${p.isComplete ? 'bg-primary border-primary' : 'border-muted-foreground hover:border-primary'}`}
              >
                {p.isComplete && <span className="text-white text-xs">✓</span>}
              </button>
              <input
                type="text"
                value={p.description}
                onChange={e => setPriorities(priorities.map((pr, idx) => idx === i ? { ...pr, description: e.target.value } : pr))}
                placeholder={`Priority ${i + 1}`}
                className={`flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${p.isComplete ? 'line-through text-muted-foreground' : ''}`}
              />
            </div>
          ))}
        </div>
      </div>

      {/* Habit Tracker */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <CheckSquare className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Weekly Habit Tracker</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-1 pr-3 text-muted-foreground font-medium min-w-[120px]">Habit</th>
                {DAY_LABELS.map(d => (
                  <th key={d} className="text-center py-1 px-2 text-muted-foreground font-medium">{d}</th>
                ))}
              </tr>
            </thead>
            <tbody>
              {habits.map((habit, hi) => (
                <tr key={hi} className="border-t border-border/40">
                  <td className="py-2 pr-3">
                    <input
                      type="text"
                      value={habit.name}
                      onChange={e => setHabits(habits.map((h, idx) => idx === hi ? { ...h, name: e.target.value } : h))}
                      placeholder={`Habit ${hi + 1}`}
                      className="w-full bg-background border border-border rounded-lg px-2 py-1 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/30"
                    />
                  </td>
                  {Array.from({ length: 7 }, (_, di) => (
                    <td key={di} className="text-center py-2 px-2">
                      <button
                        onClick={() => toggleHabit(hi, di)}
                        className={`w-5 h-5 rounded-full border transition-colors ${habit.dailyCheckIns[di] ? 'bg-primary border-primary' : 'border-muted-foreground/40 hover:border-primary'}`}
                      >
                        {habit.dailyCheckIns[di] && <span className="text-white text-xs flex items-center justify-center h-full">✓</span>}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Todos */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <List className="w-5 h-5 text-primary" />
            <h3 className="font-playfair text-lg font-semibold text-foreground">To-Do List</h3>
          </div>
          <button onClick={() => setTodos([...todos, { description: '', isComplete: false }])} className="text-sm text-primary hover:underline">+ Add</button>
        </div>
        <div className="space-y-2">
          {todos.map((todo, i) => (
            <div key={i} className="flex items-center gap-3">
              <button
                onClick={() => toggleTodo(i)}
                className={`w-5 h-5 rounded border-2 flex-shrink-0 flex items-center justify-center transition-colors ${todo.isComplete ? 'bg-primary border-primary' : 'border-muted-foreground hover:border-primary'}`}
              >
                {todo.isComplete && <span className="text-white text-xs">✓</span>}
              </button>
              <input
                type="text"
                value={todo.description}
                onChange={e => setTodos(todos.map((t, idx) => idx === i ? { ...t, description: e.target.value } : t))}
                placeholder="Add a task..."
                className={`flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${todo.isComplete ? 'line-through text-muted-foreground' : ''}`}
              />
              {todos.length > 1 && (
                <button onClick={() => setTodos(todos.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive text-lg leading-none">×</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Energy Rating */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Zap className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Energy Rating</h3>
        </div>
        <div className="flex items-center gap-3">
          {[1, 2, 3, 4, 5].map(n => (
            <button
              key={n}
              onClick={() => setEnergyRating(n)}
              className={`w-10 h-10 rounded-full font-semibold text-sm border-2 transition-colors ${energyRating >= n ? 'bg-primary border-primary text-primary-foreground' : 'border-muted-foreground/30 text-muted-foreground hover:border-primary'}`}
            >
              {n}
            </button>
          ))}
          <span className="text-sm text-muted-foreground ml-1">/ 5</span>
        </div>
      </div>

      {/* Reflection */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-3">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Weekly Reflection</h3>
        </div>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="What did you learn this week? What would you do differently?"
          rows={4}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Save */}
      <button
        onClick={onSave}
        disabled={isSaving}
        className="w-full bg-primary text-primary-foreground rounded-xl py-3 font-semibold hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2"
      >
        {isSaving ? (
          <>
            <span className="w-4 h-4 border-2 border-primary-foreground/40 border-t-primary-foreground rounded-full animate-spin" />
            Saving...
          </>
        ) : 'Save Weekly Plan'}
      </button>
    </div>
  );
}
