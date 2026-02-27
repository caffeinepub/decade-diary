import { useNavigate } from '@tanstack/react-router';
import { useGetDailyQuote, useGetVisionBoardEntries, useGetDailyPlannerEntries, useGetCouple, useGetCallerUserProfile } from '../hooks/useQueries';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import { GoalCategory } from '../backend';
import { Button } from '@/components/ui/button';
import { Progress } from '@/components/ui/progress';
import { Skeleton } from '@/components/ui/skeleton';
import {
  CalendarDays,
  Target,
  BookOpen,
  TrendingUp,
  CheckCircle2,
  Circle,
  Heart,
  Sparkles,
  ArrowRight,
} from 'lucide-react';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function getTodayDateKey(): bigint {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  const d = String(now.getDate()).padStart(2, '0');
  return BigInt(parseInt(`${y}${m}${d}`));
}

function getWeekDateKeys(): bigint[] {
  const keys: bigint[] = [];
  const now = new Date();
  const day = now.getDay();
  const monday = new Date(now);
  monday.setDate(now.getDate() - ((day + 6) % 7));
  for (let i = 0; i < 7; i++) {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    const dd = String(d.getDate()).padStart(2, '0');
    keys.push(BigInt(parseInt(`${y}${m}${dd}`)));
  }
  return keys;
}

function getMonthDateRange(): { start: bigint; end: bigint } {
  const now = new Date();
  const y = now.getFullYear();
  const m = String(now.getMonth() + 1).padStart(2, '0');
  return {
    start: BigInt(parseInt(`${y}${m}01`)),
    end: BigInt(parseInt(`${y}${m}31`)),
  };
}

const CATEGORY_LABELS: Record<string, string> = {
  [GoalCategory.career]: 'Career',
  [GoalCategory.financial]: 'Financial',
  [GoalCategory.health]: 'Health',
  [GoalCategory.relationship]: 'Relationship',
  [GoalCategory.personalGrowth]: 'Personal Growth',
  [GoalCategory.travel]: 'Travel',
  [GoalCategory.spiritual]: 'Spiritual',
};

const CATEGORY_EMOJIS: Record<string, string> = {
  [GoalCategory.career]: '💼',
  [GoalCategory.financial]: '💰',
  [GoalCategory.health]: '💪',
  [GoalCategory.relationship]: '❤️',
  [GoalCategory.personalGrowth]: '🌱',
  [GoalCategory.travel]: '✈️',
  [GoalCategory.spiritual]: '🕊️',
};

// ─── Quote Banner ─────────────────────────────────────────────────────────────

function QuoteBanner() {
  const { data: quote, isLoading } = useGetDailyQuote();

  return (
    <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-amber-warm/90 to-primary/80 text-primary-foreground p-8 shadow-warm-xl">
      <img
        src="/assets/generated/quote-mark.dim_128x128.png"
        alt=""
        className="absolute top-4 left-6 w-16 h-16 opacity-20 select-none pointer-events-none"
      />
      <div className="relative z-10 text-center space-y-3">
        <p className="label-warm text-primary-foreground/70 tracking-widest">Today's Inspiration</p>
        {isLoading ? (
          <Skeleton className="h-8 w-3/4 mx-auto bg-primary-foreground/20" />
        ) : (
          <blockquote className="font-display text-xl sm:text-2xl font-medium italic leading-relaxed max-w-2xl mx-auto">
            "{quote}"
          </blockquote>
        )}
        <div className="flex items-center justify-center gap-1.5 text-primary-foreground/60 text-sm font-body">
          <Sparkles className="w-3.5 h-3.5" />
          <span>{new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' })}</span>
        </div>
      </div>
    </div>
  );
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export default function Dashboard() {
  const navigate = useNavigate();
  const { identity } = useInternetIdentity();
  const { data: plannerEntries = [], isLoading: plannerLoading } = useGetDailyPlannerEntries();
  const { data: visionEntries = [], isLoading: visionLoading } = useGetVisionBoardEntries();
  const { data: couple } = useGetCouple();
  const { data: userProfile } = useGetCallerUserProfile();

  const isAuthenticated = !!identity;

  if (!isAuthenticated) return null;

  const todayKey = getTodayDateKey();
  const weekKeys = getWeekDateKeys();
  const { start: monthStart, end: monthEnd } = getMonthDateRange();

  const todayEntry = plannerEntries.find((e) => e.date === todayKey);
  const weekEntries = plannerEntries.filter((e) => weekKeys.includes(e.date));
  const monthEntries = plannerEntries.filter((e) => e.date >= monthStart && e.date <= monthEnd);

  const weekTasksTotal = weekEntries.reduce((sum, e) => sum + e.topTasks.length, 0);
  const weekTasksDone = weekEntries.reduce((sum, e) => sum + e.topTasks.filter((t) => t.isComplete).length, 0);
  const monthGoalsCount = monthEntries.length;

  // Vision progress by category
  const categoryProgress: Record<string, { total: number; count: number }> = {};
  for (const entry of visionEntries) {
    const cat = entry.category as unknown as string;
    if (!categoryProgress[cat]) categoryProgress[cat] = { total: 0, count: 0 };
    categoryProgress[cat].total += Number(entry.progressPercentage);
    categoryProgress[cat].count += 1;
  }

  const isCouple = !!couple;

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-8 animate-fade-in">
      {/* Welcome */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            {userProfile ? `Good day, ${userProfile.name} ✨` : 'Your Dashboard ✨'}
          </h1>
          <p className="font-body text-muted-foreground mt-1">
            {new Date().toLocaleDateString('en-US', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
          </p>
        </div>
        {isCouple && (
          <div className="hidden sm:flex items-center gap-2 px-4 py-2 rounded-2xl bg-rose-muted border border-rose-dusty/30">
            <Heart className="w-4 h-4 text-rose-dusty fill-current" />
            <span className="text-sm font-body font-medium text-accent-foreground">Couple Mode Active</span>
          </div>
        )}
      </div>

      {/* Quote Banner */}
      <QuoteBanner />

      {/* Stats Row */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Today's Focus */}
        <div className="card-warm p-6 space-y-4 col-span-1 sm:col-span-1">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <Target className="w-4 h-4 text-primary" />
            </div>
            <h2 className="section-title text-base">Today's Focus</h2>
          </div>
          {plannerLoading ? (
            <div className="space-y-2">
              {[1, 2, 3].map((i) => <Skeleton key={i} className="h-5 w-full" />)}
            </div>
          ) : todayEntry && todayEntry.topTasks.length > 0 ? (
            <ul className="space-y-2">
              {todayEntry.topTasks.slice(0, 3).map((task, i) => (
                <li key={i} className="flex items-start gap-2 text-sm font-body">
                  {task.isComplete ? (
                    <CheckCircle2 className="w-4 h-4 text-primary mt-0.5 shrink-0" />
                  ) : (
                    <Circle className="w-4 h-4 text-muted-foreground mt-0.5 shrink-0" />
                  )}
                  <span className={task.isComplete ? 'line-through text-muted-foreground' : 'text-foreground'}>
                    {task.description || 'Untitled task'}
                  </span>
                </li>
              ))}
            </ul>
          ) : (
            <p className="text-sm font-body text-muted-foreground italic">No tasks for today yet.</p>
          )}
          <Button
            variant="outline"
            size="sm"
            className="w-full font-body text-xs"
            onClick={() => navigate({ to: '/daily-planner' })}
          >
            Open Daily Planner <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {/* This Week */}
        <div className="card-warm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <CalendarDays className="w-4 h-4 text-primary" />
            </div>
            <h2 className="section-title text-base">This Week</h2>
          </div>
          {plannerLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Tasks completed</span>
                <span className="font-semibold text-foreground">{weekTasksDone}/{weekTasksTotal}</span>
              </div>
              <Progress value={weekTasksTotal > 0 ? (weekTasksDone / weekTasksTotal) * 100 : 0} className="h-2" />
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Days logged</span>
                <span className="font-semibold text-foreground">{weekEntries.length}/7</span>
              </div>
            </div>
          )}
        </div>

        {/* This Month */}
        <div className="card-warm p-6 space-y-4">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <h2 className="section-title text-base">This Month</h2>
          </div>
          {plannerLoading ? (
            <Skeleton className="h-16 w-full" />
          ) : (
            <div className="space-y-3">
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Days planned</span>
                <span className="font-semibold text-foreground">{monthGoalsCount}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Vision goals</span>
                <span className="font-semibold text-foreground">{visionEntries.length}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Month</span>
                <span className="font-semibold text-foreground">
                  {new Date().toLocaleDateString('en-US', { month: 'long', year: 'numeric' })}
                </span>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* 10-Year Vision Progress */}
      <div className="card-warm p-6 space-y-5">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <div className="p-2 rounded-xl bg-primary/10">
              <TrendingUp className="w-4 h-4 text-primary" />
            </div>
            <h2 className="section-title">10-Year Vision Progress</h2>
          </div>
          <Button
            variant="ghost"
            size="sm"
            className="font-body text-xs text-muted-foreground"
            onClick={() => navigate({ to: '/vision-board' })}
          >
            View All <ArrowRight className="w-3 h-3 ml-1" />
          </Button>
        </div>

        {visionLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {[1, 2, 3, 4].map((i) => <Skeleton key={i} className="h-20 w-full rounded-xl" />)}
          </div>
        ) : visionEntries.length === 0 ? (
          <div className="text-center py-8 space-y-3">
            <p className="font-body text-muted-foreground">No vision goals yet. Start building your 10-year vision!</p>
            <Button
              variant="outline"
              size="sm"
              onClick={() => navigate({ to: '/vision-board' })}
              className="font-body"
            >
              Add Your First Goal →
            </Button>
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
            {Object.entries(categoryProgress).map(([cat, { total, count }]) => {
              const avg = Math.round(total / count);
              return (
                <div key={cat} className="p-4 rounded-2xl bg-secondary/50 border border-border/40 space-y-2">
                  <div className="flex items-center gap-2">
                    <span className="text-lg">{CATEGORY_EMOJIS[cat] || '🎯'}</span>
                    <span className="text-sm font-body font-semibold text-foreground">
                      {CATEGORY_LABELS[cat] || cat}
                    </span>
                  </div>
                  <Progress value={avg} className="h-1.5" />
                  <div className="flex justify-between text-xs font-body text-muted-foreground">
                    <span>{count} goal{count !== 1 ? 's' : ''}</span>
                    <span className="font-semibold text-primary">{avg}%</span>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Quick Journal Entry */}
      <div className="card-warm p-6 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="space-y-1 text-center sm:text-left">
          <h2 className="section-title">Quick Journal Entry</h2>
          <p className="text-sm font-body text-muted-foreground">
            Capture today's thoughts, gratitude, and reflections.
          </p>
        </div>
        <Button
          size="lg"
          onClick={() => navigate({ to: '/daily-planner' })}
          className="font-body font-semibold rounded-2xl shrink-0"
        >
          ✍️ Write Today's Entry
        </Button>
      </div>
    </div>
  );
}
