import React, { useState, useEffect } from 'react';
import { ChevronLeft, ChevronRight, Star, Target, Image, BarChart2, BookOpen, Heart, Users } from 'lucide-react';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetYearlyEntries,
  useGetPartnerYearlyEntries,
  useAddYearlyEntry,
  useUpdateYearlyEntry,
  useGetCouple,
} from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { Principal } from '@dfinity/principal';
import type { YearlyEntry, HabitYearly, Task } from '../backend';
import { toast } from 'sonner';

const MONTHS = ['Jan','Feb','Mar','Apr','May','Jun','Jul','Aug','Sep','Oct','Nov','Dec'];

function getPartnerPrincipal(couple: { partner1: Principal; partner2: Principal } | null | undefined, myPrincipal: string): Principal | undefined {
  if (!couple) return undefined;
  const p1 = couple.partner1.toString();
  const p2 = couple.partner2.toString();
  if (p1 === myPrincipal) return couple.partner2;
  if (p2 === myPrincipal) return couple.partner1;
  return undefined;
}

// ─── Partner Read-Only View ───────────────────────────────────────────────────

function PartnerYearlyView({ entry }: { entry: YearlyEntry }) {
  return (
    <div className="space-y-6">
      {/* Word of the Year */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Word of the Year</h3>
        </div>
        {entry.wordOfTheYear ? (
          <p className="text-2xl font-playfair font-bold text-primary text-center py-3">{entry.wordOfTheYear}</p>
        ) : (
          <p className="text-muted-foreground italic text-center">No word set</p>
        )}
      </div>

      {/* Major Goals */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Major Goals</h3>
        </div>
        {entry.majorGoals.length === 0 ? (
          <p className="text-muted-foreground italic">No goals set</p>
        ) : (
          <ul className="space-y-3">
            {entry.majorGoals.map((goal, i) => (
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

      {/* Vision Images */}
      {entry.visionImages.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <Image className="w-5 h-5 text-primary" />
            <h3 className="font-playfair text-lg font-semibold text-foreground">Vision Images</h3>
          </div>
          <ul className="space-y-2">
            {entry.visionImages.map((url, i) => (
              <li key={i} className="text-sm text-primary underline break-all">
                <a href={url} target="_blank" rel="noopener noreferrer">{url}</a>
              </li>
            ))}
          </ul>
        </div>
      )}

      {/* Habit Tracker */}
      {entry.habitTracker.length > 0 && (
        <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
          <div className="flex items-center gap-2 mb-4">
            <BarChart2 className="w-5 h-5 text-primary" />
            <h3 className="font-playfair text-lg font-semibold text-foreground">Habit Tracker</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-xs">
              <thead>
                <tr>
                  <th className="text-left py-1 pr-3 text-muted-foreground font-medium">Habit</th>
                  {MONTHS.map(m => (
                    <th key={m} className="text-center py-1 px-1 text-muted-foreground font-medium">{m}</th>
                  ))}
                </tr>
              </thead>
              <tbody>
                {entry.habitTracker.map((habit, hi) => (
                  <tr key={hi} className="border-t border-border/40">
                    <td className="py-2 pr-3 text-foreground font-medium">{habit.name}</td>
                    {Array.from({ length: 12 }, (_, mi) => (
                      <td key={mi} className="text-center py-2 px-1">
                        <span className={`inline-block w-5 h-5 rounded-full border ${habit.monthlyCheckIns[mi] ? 'bg-primary border-primary' : 'border-muted-foreground/40'}`}>
                          {habit.monthlyCheckIns[mi] && <span className="text-white text-xs flex items-center justify-center h-full">✓</span>}
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

      {/* Reflection */}
      {entry.reflection && (
        <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
          <div className="flex items-center gap-2 mb-3">
            <BookOpen className="w-5 h-5 text-primary" />
            <h3 className="font-playfair text-lg font-semibold text-foreground">Year-End Reflection</h3>
          </div>
          <p className="text-sm text-foreground leading-relaxed whitespace-pre-wrap">{entry.reflection}</p>
        </div>
      )}
    </div>
  );
}

// ─── Empty State ──────────────────────────────────────────────────────────────

function PartnerEmptyState({ year }: { year: number }) {
  return (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <Heart className="w-12 h-12 text-muted-foreground/40 mb-4" />
      <h3 className="font-playfair text-lg font-semibold text-muted-foreground mb-2">No plan yet</h3>
      <p className="text-sm text-muted-foreground max-w-xs">
        Your partner hasn't created a yearly plan for {year} yet. Check back later!
      </p>
    </div>
  );
}

// ─── Main Component ───────────────────────────────────────────────────────────

export default function YearlyPlanner() {
  const { identity } = useInternetIdentity();
  const myPrincipal = identity?.getPrincipal();
  const myPrincipalStr = myPrincipal?.toString() ?? '';

  const [year, setYear] = useState(new Date().getFullYear());
  const [activeTab, setActiveTab] = useState<'mine' | 'partner'>('mine');

  // Couple info
  const { data: couple } = useGetCouple();
  const partnerPrincipal = getPartnerPrincipal(couple ?? null, myPrincipalStr);
  const hasPartner = !!partnerPrincipal;

  // Hooks take no arguments — data is fetched for the caller automatically
  const { data: myEntries = [], isLoading: myLoading } = useGetYearlyEntries();
  const myEntry = myEntries.find(e => Number(e.year) === year);

  const { data: partnerEntries = [], isLoading: partnerLoading } = useGetPartnerYearlyEntries();
  const partnerEntry = partnerEntries.find(e => Number(e.year) === year);

  // Mutations
  const addEntry = useAddYearlyEntry();
  const updateEntry = useUpdateYearlyEntry();

  // Local state for my plan
  const [wordOfYear, setWordOfYear] = useState('');
  const [goals, setGoals] = useState<Task[]>([
    { description: '', isComplete: false },
    { description: '', isComplete: false },
    { description: '', isComplete: false },
    { description: '', isComplete: false },
    { description: '', isComplete: false },
  ]);
  const [visionImages, setVisionImages] = useState<string[]>(['', '', '']);
  const [habits, setHabits] = useState<HabitYearly[]>([
    { name: '', monthlyCheckIns: Array(12).fill(false) },
    { name: '', monthlyCheckIns: Array(12).fill(false) },
    { name: '', monthlyCheckIns: Array(12).fill(false) },
  ]);
  const [reflection, setReflection] = useState('');
  const [isSaving, setIsSaving] = useState(false);

  // Populate form when entry loads
  useEffect(() => {
    if (myEntry) {
      setWordOfYear(myEntry.wordOfTheYear);
      const loadedGoals = [...myEntry.majorGoals];
      while (loadedGoals.length < 5) loadedGoals.push({ description: '', isComplete: false });
      setGoals(loadedGoals.slice(0, 5));
      const loadedImages = [...myEntry.visionImages];
      while (loadedImages.length < 3) loadedImages.push('');
      setVisionImages(loadedImages.slice(0, 3));
      const loadedHabits = myEntry.habitTracker.map(h => ({
        name: h.name,
        monthlyCheckIns: [...h.monthlyCheckIns].concat(Array(12).fill(false)).slice(0, 12),
      }));
      while (loadedHabits.length < 3) loadedHabits.push({ name: '', monthlyCheckIns: Array(12).fill(false) });
      setHabits(loadedHabits);
      setReflection(myEntry.reflection);
    } else {
      setWordOfYear('');
      setGoals([
        { description: '', isComplete: false },
        { description: '', isComplete: false },
        { description: '', isComplete: false },
        { description: '', isComplete: false },
        { description: '', isComplete: false },
      ]);
      setVisionImages(['', '', '']);
      setHabits([
        { name: '', monthlyCheckIns: Array(12).fill(false) },
        { name: '', monthlyCheckIns: Array(12).fill(false) },
        { name: '', monthlyCheckIns: Array(12).fill(false) },
      ]);
      setReflection('');
    }
  }, [myEntry, year]);

  const handleSave = async () => {
    setIsSaving(true);
    try {
      const entry: YearlyEntry = {
        year: BigInt(year),
        wordOfTheYear: wordOfYear,
        majorGoals: goals.filter(g => g.description.trim()),
        visionImages: visionImages.filter(v => v.trim()),
        habitTracker: habits.filter(h => h.name.trim()).map(h => ({
          name: h.name,
          monthlyCheckIns: h.monthlyCheckIns,
        })),
        reflection,
      };
      if (myEntry) {
        await updateEntry.mutateAsync({ year: BigInt(year), entry });
      } else {
        await addEntry.mutateAsync(entry);
      }
      toast.success('Yearly plan saved!');
    } catch {
      toast.error('Failed to save yearly plan');
    } finally {
      setIsSaving(false);
    }
  };

  const toggleGoal = (i: number) => {
    setGoals(prev => prev.map((g, idx) => idx === i ? { ...g, isComplete: !g.isComplete } : g));
  };

  const toggleHabit = (hi: number, mi: number) => {
    setHabits(prev => prev.map((h, idx) => {
      if (idx !== hi) return h;
      const newCheckIns = [...h.monthlyCheckIns];
      newCheckIns[mi] = !newCheckIns[mi];
      return { ...h, monthlyCheckIns: newCheckIns };
    }));
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-4xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-8">
          <h1 className="font-playfair text-3xl md:text-4xl font-bold text-foreground mb-2">Yearly Planner</h1>
          <p className="text-muted-foreground">Set your vision and goals for the year</p>
        </div>

        {/* Year Navigation */}
        <div className="flex items-center justify-center gap-4 mb-8">
          <button
            onClick={() => setYear(y => y - 1)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <span className="font-playfair text-2xl font-bold text-foreground min-w-[80px] text-center">{year}</span>
          <button
            onClick={() => setYear(y => y + 1)}
            className="p-2 rounded-full hover:bg-muted transition-colors"
          >
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
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full rounded-2xl" />
                  <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
              ) : (
                <MyYearlyPlanForm
                  year={year}
                  wordOfYear={wordOfYear} setWordOfYear={setWordOfYear}
                  goals={goals} setGoals={setGoals} toggleGoal={toggleGoal}
                  visionImages={visionImages} setVisionImages={setVisionImages}
                  habits={habits} setHabits={setHabits} toggleHabit={toggleHabit}
                  reflection={reflection} setReflection={setReflection}
                  isSaving={isSaving} onSave={handleSave}
                />
              )}
            </TabsContent>

            <TabsContent value="partner">
              {partnerLoading ? (
                <div className="space-y-4">
                  <Skeleton className="h-32 w-full rounded-2xl" />
                  <Skeleton className="h-48 w-full rounded-2xl" />
                </div>
              ) : partnerEntry ? (
                <PartnerYearlyView entry={partnerEntry} />
              ) : (
                <PartnerEmptyState year={year} />
              )}
            </TabsContent>
          </Tabs>
        ) : (
          myLoading ? (
            <div className="space-y-4">
              <Skeleton className="h-32 w-full rounded-2xl" />
              <Skeleton className="h-48 w-full rounded-2xl" />
            </div>
          ) : (
            <MyYearlyPlanForm
              year={year}
              wordOfYear={wordOfYear} setWordOfYear={setWordOfYear}
              goals={goals} setGoals={setGoals} toggleGoal={toggleGoal}
              visionImages={visionImages} setVisionImages={setVisionImages}
              habits={habits} setHabits={setHabits} toggleHabit={toggleHabit}
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

interface MyYearlyPlanFormProps {
  year: number;
  wordOfYear: string; setWordOfYear: (v: string) => void;
  goals: Task[]; setGoals: (v: Task[]) => void; toggleGoal: (i: number) => void;
  visionImages: string[]; setVisionImages: (v: string[]) => void;
  habits: HabitYearly[]; setHabits: (v: HabitYearly[]) => void; toggleHabit: (hi: number, mi: number) => void;
  reflection: string; setReflection: (v: string) => void;
  isSaving: boolean; onSave: () => void;
}

function MyYearlyPlanForm({
  year, wordOfYear, setWordOfYear,
  goals, setGoals, toggleGoal,
  visionImages, setVisionImages,
  habits, setHabits, toggleHabit,
  reflection, setReflection,
  isSaving, onSave,
}: MyYearlyPlanFormProps) {
  return (
    <div className="space-y-6">
      {/* Word of the Year */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-3">
          <Star className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Word of the Year</h3>
        </div>
        <input
          type="text"
          value={wordOfYear}
          onChange={e => setWordOfYear(e.target.value)}
          placeholder="e.g. Growth, Courage, Balance..."
          className="w-full bg-background border border-border rounded-xl px-4 py-3 text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30 text-center text-lg font-playfair"
        />
      </div>

      {/* Major Goals */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Target className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">5 Major Goals for {year}</h3>
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
            </div>
          ))}
        </div>
      </div>

      {/* Vision Images */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <Image className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Vision Image URLs</h3>
        </div>
        <div className="space-y-3">
          {visionImages.map((url, i) => (
            <input
              key={i}
              type="url"
              value={url}
              onChange={e => setVisionImages(visionImages.map((v, idx) => idx === i ? e.target.value : v))}
              placeholder={`Image URL ${i + 1}`}
              className="w-full bg-background border border-border rounded-xl px-4 py-2 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/30"
            />
          ))}
        </div>
      </div>

      {/* Habit Tracker */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <BarChart2 className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">12-Month Habit Tracker</h3>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full text-xs">
            <thead>
              <tr>
                <th className="text-left py-1 pr-3 text-muted-foreground font-medium">Habit</th>
                {MONTHS.map(m => (
                  <th key={m} className="text-center py-1 px-1 text-muted-foreground font-medium">{m}</th>
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
                  {Array.from({ length: 12 }, (_, mi) => (
                    <td key={mi} className="text-center py-2 px-1">
                      <button
                        onClick={() => toggleHabit(hi, mi)}
                        className={`w-6 h-6 rounded-full border-2 flex items-center justify-center mx-auto transition-colors ${habit.monthlyCheckIns[mi] ? 'bg-primary border-primary' : 'border-muted-foreground/40 hover:border-primary'}`}
                      >
                        {habit.monthlyCheckIns[mi] && <span className="text-white text-xs">✓</span>}
                      </button>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Year-End Reflection */}
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border">
        <div className="flex items-center gap-2 mb-4">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-playfair text-lg font-semibold text-foreground">Year-End Reflection</h3>
        </div>
        <textarea
          value={reflection}
          onChange={e => setReflection(e.target.value)}
          placeholder="What did you accomplish this year? What are you most proud of? What will you do differently next year?"
          rows={5}
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
          ) : 'Save Yearly Plan'}
        </button>
      </div>
    </div>
  );
}
