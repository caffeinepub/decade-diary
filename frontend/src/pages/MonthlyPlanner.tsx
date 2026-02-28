import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Target, Calendar, DollarSign, Smile, BookOpen, Heart, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetMonthlyEntries,
  useGetPartnerMonthlyEntries,
  useAddMonthlyEntry,
  useUpdateMonthlyEntry,
  useGetCouple,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import type { MonthlyEntry, Task, ImportantDate, Budget } from '../backend';
import { toast } from 'sonner';

const MONTH_NAMES = [
  'January','February','March','April','May','June',
  'July','August','September','October','November','December'
];

const MOOD_EMOJIS = ['😊','😢','😡','😴','🤩','😰','😌','🥳','😤','🥺'];

function getPartnerPrincipal(couple: { partner1: Principal; partner2: Principal } | null | undefined, myPrincipal: string): Principal | undefined {
  if (!couple) return undefined;
  const p1 = couple.partner1.toString();
  const p2 = couple.partner2.toString();
  if (p1 === myPrincipal) return couple.partner2;
  if (p2 === myPrincipal) return couple.partner1;
  return undefined;
}

function getDaysInMonth(year: number, month: number): number {
  return new Date(year, month, 0).getDate();
}

// ─── Partner Read-Only View ───────────────────────────────────────────────────

function PartnerMonthlyView({ entry, year, month }: { entry: MonthlyEntry; year: number; month: number }) {
  const daysInMonth = getDaysInMonth(year, month);

  return (
    <div className="space-y-6">
      {/* Goals */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Monthly Goals</h3>
        </div>
        {entry.goals.length === 0 ? (
          <p className="text-muted-foreground italic">No goals set</p>
        ) : (
          <ul className="space-y-3">
            {entry.goals.map((goal, i) => (
              <li key={i} className="flex items-start gap-3">
                <span className={`mt-1 w-5 h-5 rounded-full border-2 flex-shrink-0 flex items-center justify-center ${goal.isComplete ? 'bg-primary border-primary' : 'border-muted-foreground'}`}>
                  {goal.isComplete && <span className="text-white text-xs">✓</span>}
                </span>
                <span className={`text-sm ${goal.isComplete ? 'line-through text-muted-foreground' : 'text-foreground'}`}>{goal.description}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Important Dates */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Calendar className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Important Dates</h3>
        </div>
        {entry.importantDates.length === 0 ? (
          <p className="text-muted-foreground italic">No important dates</p>
        ) : (
          <ul className="space-y-2">
            {entry.importantDates.map((d, i) => (
              <li key={i} className="flex items-center gap-3 text-sm">
                <span className="font-semibold text-primary min-w-[60px]">
                  {new Date(Number(d.date)).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })}
                </span>
                <span className="text-foreground">{d.labelText}</span>
              </li>
            ))}
          </ul>
        )}
      </div>

      {/* Budget */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Budget</h3>
        </div>
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-sm text-muted-foreground">Income</span>
            <span className="font-semibold text-foreground">${Number(entry.budget.income).toLocaleString()}</span>
          </div>
          {entry.budget.expenses.length > 0 && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Expenses</p>
              <ul className="space-y-1">
                {entry.budget.expenses.map((exp, i) => (
                  <li key={i} className="text-sm text-foreground pl-3 border-l-2 border-border">{exp}</li>
                ))}
              </ul>
            </div>
          )}
          {entry.budget.notes && (
            <div>
              <p className="text-sm text-muted-foreground mb-1">Notes</p>
              <p className="text-sm text-foreground">{entry.budget.notes}</p>
            </div>
          )}
        </div>
      </div>

      {/* Mood Tracker */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Smile className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Mood Tracker</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: daysInMonth }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{i + 1}</span>
              <span className="text-lg">{entry.moodTracker[i] || '·'}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Reflection */}
      {entry.reflection && (
        <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-playfair text-lg font-semibold text-foreground">Monthly Reflection</h3>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{entry.reflection}</p>
        </div>
      )}
    </div>
  );
}

function PartnerEmptyState({ month, year }: { month: number; year: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Heart className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <h3 className="font-playfair text-lg font-semibold text-muted-foreground mb-2">No plan yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Your partner hasn't created a plan for {MONTH_NAMES[month - 1]} {year} yet. Check back later!
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function MonthlyPlanner() {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();
  const myPrincipalStr = myPrincipal?.toString() ?? '';

  const now = new Date();
  const [year, setYear] = useState(now.getFullYear());
  const [month, setMonth] = useState(now.getMonth() + 1);
  const [activeTab, setActiveTab] = useState<'mine' | 'partner'>('mine');

  const { data: couple } = useGetCouple();
  const partnerPrincipal = getPartnerPrincipal(couple ?? null, myPrincipalStr);
  const hasPartner = !!partnerPrincipal;

  // Hooks take no arguments — data is fetched for the caller automatically
  const { data: myEntries = [], isLoading: myLoading } = useGetMonthlyEntries();
  const myEntry = myEntries.find(e => Number(e.year) === year && Number(e.month) === month);

  const { data: partnerEntries = [], isLoading: partnerLoading } = useGetPartnerMonthlyEntries();
  const partnerEntry = partnerEntries.find(e => Number(e.year) === year && Number(e.month) === month);

  const addEntry = useAddMonthlyEntry();
  const updateEntry = useUpdateMonthlyEntry();

  const daysInMonth = getDaysInMonth(year, month);

  // Local state
  const [goals, setGoals] = useState<Task[]>([{ description: '', isComplete: false }]);
  const [importantDates, setImportantDates] = useState<ImportantDate[]>([]);
  const [income, setIncome] = useState(0);
  const [expenses, setExpenses] = useState<string[]>(['']);
  const [budgetNotes, setBudgetNotes] = useState('');
  const [moodTracker, setMoodTracker] = useState<string[]>(Array(31).fill(''));
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  useEffect(() => {
    if (myEntry) {
      const loadedGoals = [...myEntry.goals];
      if (loadedGoals.length === 0) loadedGoals.push({ description: '', isComplete: false });
      setGoals(loadedGoals);
      setImportantDates([...myEntry.importantDates]);
      setIncome(Number(myEntry.budget.income));
      const loadedExpenses = [...myEntry.budget.expenses];
      if (loadedExpenses.length === 0) loadedExpenses.push('');
      setExpenses(loadedExpenses);
      setBudgetNotes(myEntry.budget.notes);
      const loadedMood = [...myEntry.moodTracker];
      while (loadedMood.length < 31) loadedMood.push('');
      setMoodTracker(loadedMood);
      setReflection(myEntry.reflection);
    } else {
      setGoals([{ description: '', isComplete: false }]);
      setImportantDates([]);
      setIncome(0);
      setExpenses(['']);
      setBudgetNotes('');
      setMoodTracker(Array(31).fill(''));
      setReflection('');
    }
  }, [myEntry, year, month]);

  const navigateMonth = (dir: number) => {
    let newMonth = month + dir;
    let newYear = year;
    if (newMonth > 12) { newMonth = 1; newYear++; }
    if (newMonth < 1) { newMonth = 12; newYear--; }
    setMonth(newMonth);
    setYear(newYear);
  };

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entry: MonthlyEntry = {
        year: BigInt(year),
        month: BigInt(month),
        goals: goals.filter(g => g.description.trim()),
        importantDates,
        budget: {
          income: BigInt(income),
          expenses: expenses.filter(e => e.trim()),
          notes: budgetNotes,
        },
        moodTracker: moodTracker.slice(0, daysInMonth),
        reflection,
      };
      if (myEntry) {
        await updateEntry.mutateAsync({ year: BigInt(year), month: BigInt(month), entry });
      } else {
        await addEntry.mutateAsync(entry);
      }
      toast.success('Monthly plan saved!');
    } catch {
      toast.error('Failed to save monthly plan');
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-2">Monthly Planner</h1>
          <p className="text-muted-foreground">Plan your month with intention</p>
        </div>

        {/* Month Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button onClick={() => navigateMonth(-1)} className="p-2 rounded-full hover:bg-muted transition-colors">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="font-playfair text-xl font-bold text-foreground min-w-[180px] text-center">
            {MONTH_NAMES[month - 1]} {year}
          </span>
          <button onClick={() => navigateMonth(1)} className="p-2 rounded-full hover:bg-muted transition-colors">
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
                <MyMonthlyPlanForm
                  year={year} month={month} daysInMonth={daysInMonth}
                  goals={goals} setGoals={setGoals}
                  importantDates={importantDates} setImportantDates={setImportantDates}
                  income={income} setIncome={setIncome}
                  expenses={expenses} setExpenses={setExpenses}
                  budgetNotes={budgetNotes} setBudgetNotes={setBudgetNotes}
                  moodTracker={moodTracker} setMoodTracker={setMoodTracker}
                  reflection={reflection} setReflection={setReflection}
                  isSaving={isSaving} onSave={handleSave}
                />
              )}
            </TabsContent>

            <TabsContent value="partner">
              {partnerLoading ? (
                <div className="space-y-4"><Skeleton className="h-48 w-full rounded-2xl" /><Skeleton className="h-48 w-full rounded-2xl" /></div>
              ) : partnerEntry ? (
                <PartnerMonthlyView entry={partnerEntry} year={year} month={month} />
              ) : (
                <PartnerEmptyState month={month} year={year} />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          myLoading ? (
            <div className="space-y-4"><Skeleton className="h-48 w-full rounded-2xl" /><Skeleton className="h-48 w-full rounded-2xl" /></div>
          ) : (
            <MyMonthlyPlanForm
              year={year} month={month} daysInMonth={daysInMonth}
              goals={goals} setGoals={setGoals}
              importantDates={importantDates} setImportantDates={setImportantDates}
              income={income} setIncome={setIncome}
              expenses={expenses} setExpenses={setExpenses}
              budgetNotes={budgetNotes} setBudgetNotes={setBudgetNotes}
              moodTracker={moodTracker} setMoodTracker={setMoodTracker}
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

interface MyMonthlyPlanFormProps {
  year: number; month: number; daysInMonth: number;
  goals: Task[]; setGoals: (v: Task[]) => void;
  importantDates: ImportantDate[]; setImportantDates: (v: ImportantDate[]) => void;
  income: number; setIncome: (v: number) => void;
  expenses: string[]; setExpenses: (v: string[]) => void;
  budgetNotes: string; setBudgetNotes: (v: string) => void;
  moodTracker: string[]; setMoodTracker: (v: string[]) => void;
  reflection: string; setReflection: (v: string) => void;
  isSaving: boolean; onSave: () => void;
}

function MyMonthlyPlanForm({
  year, month, daysInMonth,
  goals, setGoals,
  importantDates, setImportantDates,
  income, setIncome,
  expenses, setExpenses,
  budgetNotes, setBudgetNotes,
  moodTracker, setMoodTracker,
  reflection, setReflection,
  isSaving, onSave,
}: MyMonthlyPlanFormProps) {
  const toggleGoal = (i: number) => setGoals(goals.map((g, idx) => idx === i ? { ...g, isComplete: !g.isComplete } : g));

  return (
    <div className="space-y-6">
      {/* Goals */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Target className="w-5 h-5 text-primary" />
            <h3 className="font-playfair text-lg font-semibold text-foreground">Monthly Goals</h3>
          </div>
          <button
            onClick={() => setGoals([...goals, { description: '', isComplete: false }])}
            className="text-sm text-primary hover:underline"
          >+ Add Goal</button>
        </div>
        <div className="space-y-3">
          {goals.map((goal, i) => (
            <div key={i} className="flex items-center gap-3">
              <button
                onClick={() => toggleGoal(i)}
                className={`w-6 h-6 rounded-full border-2 flex-shrink-0 flex items-center justify-center transition-colors ${goal.isComplete ? 'bg-primary border-primary' : 'border-muted-foreground hover:border-primary'}`}
              >
                {goal.isComplete && <span className="text-white text-xs">✓</span>}
              </button>
              <input
                type="text"
                value={goal.description}
                onChange={e => setGoals(goals.map((g, idx) => idx === i ? { ...g, description: e.target.value } : g))}
                placeholder={`Goal ${i + 1}`}
                className={`flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 ${goal.isComplete ? 'line-through text-muted-foreground' : ''}`}
              />
              {goals.length > 1 && (
                <button onClick={() => setGoals(goals.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive text-lg leading-none">×</button>
              )}
            </div>
          ))}
        </div>
      </div>

      {/* Important Dates */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            <h3 className="font-playfair text-lg font-semibold text-foreground">Important Dates</h3>
          </div>
          <button
            onClick={() => setImportantDates([...importantDates, { date: BigInt(Date.now()), labelText: '' }])}
            className="text-sm text-primary hover:underline"
          >+ Add Date</button>
        </div>
        {importantDates.length === 0 ? (
          <p className="text-sm text-muted-foreground italic">No important dates added yet.</p>
        ) : (
          <div className="space-y-3">
            {importantDates.map((d, i) => (
              <div key={i} className="flex items-center gap-3">
                <input
                  type="date"
                  value={new Date(Number(d.date)).toISOString().split('T')[0]}
                  onChange={e => {
                    const updated = [...importantDates];
                    updated[i] = { ...updated[i], date: BigInt(new Date(e.target.value).getTime()) };
                    setImportantDates(updated);
                  }}
                  className="bg-background border border-border rounded-xl px-3 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <input
                  type="text"
                  value={d.labelText}
                  onChange={e => {
                    const updated = [...importantDates];
                    updated[i] = { ...updated[i], labelText: e.target.value };
                    setImportantDates(updated);
                  }}
                  placeholder="Event label..."
                  className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                />
                <button onClick={() => setImportantDates(importantDates.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive text-lg leading-none">×</button>
              </div>
            ))}
          </div>
        )}
      </div>

      {/* Budget */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <DollarSign className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Budget</h3>
        </div>
        <div className="space-y-4">
          <div className="flex items-center gap-3">
            <label className="text-sm text-muted-foreground w-20 shrink-0">Income</label>
            <input
              type="number"
              value={income}
              onChange={e => setIncome(Number(e.target.value))}
              min={0}
              className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          </div>
          <div>
            <div className="flex items-center justify-between mb-2">
              <label className="text-sm text-muted-foreground">Expenses</label>
              <button onClick={() => setExpenses([...expenses, ''])} className="text-sm text-primary hover:underline">+ Add</button>
            </div>
            <div className="space-y-2">
              {expenses.map((exp, i) => (
                <div key={i} className="flex items-center gap-2">
                  <input
                    type="text"
                    value={exp}
                    onChange={e => setExpenses(expenses.map((ex, idx) => idx === i ? e.target.value : ex))}
                    placeholder={`Expense ${i + 1}`}
                    className="flex-1 bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
                  />
                  {expenses.length > 1 && (
                    <button onClick={() => setExpenses(expenses.filter((_, idx) => idx !== i))} className="text-muted-foreground hover:text-destructive text-lg leading-none">×</button>
                  )}
                </div>
              ))}
            </div>
          </div>
          <div>
            <label className="text-sm text-muted-foreground block mb-2">Budget Notes</label>
            <textarea
              value={budgetNotes}
              onChange={e => setBudgetNotes(e.target.value)}
              placeholder="Any budget notes..."
              rows={2}
              className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
            />
          </div>
        </div>
      </div>

      {/* Mood Tracker */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Smile className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Mood Tracker</h3>
        </div>
        <div className="grid grid-cols-7 gap-2">
          {Array.from({ length: daysInMonth }, (_, i) => (
            <div key={i} className="flex flex-col items-center gap-1">
              <span className="text-xs text-muted-foreground">{i + 1}</span>
              <div className="relative group">
                <span className="text-xl cursor-pointer">{moodTracker[i] || '·'}</span>
                <div className="absolute bottom-full left-1/2 -translate-x-1/2 mb-1 hidden group-hover:flex flex-wrap gap-1 bg-card border border-border rounded-xl p-2 shadow-warm z-10 w-32">
                  {MOOD_EMOJIS.map(emoji => (
                    <button
                      key={emoji}
                      onClick={() => {
                        const updated = [...moodTracker];
                        updated[i] = moodTracker[i] === emoji ? '' : emoji;
                        setMoodTracker(updated);
                      }}
                      className="text-lg hover:scale-125 transition-transform"
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Reflection */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Monthly Reflection</h3>
        </div>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="How did this month go? What did you accomplish? What would you do differently?"
          rows={4}
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 resize-none"
        />
      </div>

      {/* Save Button */}
      <div className="flex justify-end">
        <button
          onClick={onSave}
          disabled={isSaving}
          className="bg-primary text-primary-foreground px-8 py-3 rounded-2xl font-semibold hover:bg-primary/90 transition-colors disabled:opacity-50 flex items-center gap-2"
        >
          {isSaving ? (
            <>
              <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
              Saving...
            </>
          ) : 'Save Monthly Plan'}
        </button>
      </div>
    </div>
  );
}
