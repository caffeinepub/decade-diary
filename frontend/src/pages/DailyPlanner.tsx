import { useState, useEffect, useRef } from 'react';
import { useInternetIdentity } from '../hooks/useInternetIdentity';
import {
  useGetDailyPlannerEntries,
  useSaveDailyPlannerEntry,
  useUpdateWaterIntake,
  useGetCouple,
  usePartnerDailyPlannerForDate,
  useGetPartnerUserProfile,
} from '../hooks/useQueries';
import type { DailyPlannerEntry, ScheduleItem, Task } from '../backend';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Skeleton } from '@/components/ui/skeleton';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import {
  CalendarDays,
  Plus,
  Minus,
  Droplets,
  Clock,
  Trash2,
  Save,
  Loader2,
  ChevronLeft,
  ChevronRight,
  ListTodo,
  Heart,
  User,
} from 'lucide-react';
import { toast } from 'sonner';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateToKey(date: Date): bigint {
  const y = date.getFullYear();
  const m = String(date.getMonth() + 1).padStart(2, '0');
  const d = String(date.getDate()).padStart(2, '0');
  return BigInt(parseInt(`${y}${m}${d}`));
}

function formatDateDisplay(date: Date): string {
  return date.toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const MOODS = [
  { emoji: '😄', label: 'Happy' },
  { emoji: '😌', label: 'Calm' },
  { emoji: '🤩', label: 'Excited' },
  { emoji: '😴', label: 'Tired' },
  { emoji: '😔', label: 'Sad' },
  { emoji: '😤', label: 'Frustrated' },
  { emoji: '🥰', label: 'Grateful' },
];

// ─── Partner Read-Only View ───────────────────────────────────────────────────

interface PartnerPlannerViewProps {
  entry: DailyPlannerEntry | null | undefined;
  isLoading: boolean;
  partnerName: string;
}

function PartnerPlannerView({ entry, isLoading, partnerName }: PartnerPlannerViewProps) {
  if (isLoading) {
    return (
      <div className="space-y-4">
        {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
      </div>
    );
  }

  if (!entry) {
    return (
      <div className="card-warm p-10 flex flex-col items-center justify-center gap-3 text-center">
        <Heart className="w-10 h-10 text-primary/40" />
        <p className="font-display text-lg text-muted-foreground">
          {partnerName} hasn't added an entry for this day yet.
        </p>
        <p className="font-body text-sm text-muted-foreground/70">
          Check back later or navigate to another date.
        </p>
      </div>
    );
  }

  const completedCount = entry.tasks.filter((t) => t.isComplete).length;

  return (
    <div className="space-y-5">
      {/* Mood */}
      {entry.moodEmoji && (
        <div className="card-warm p-5 space-y-3">
          <h2 className="section-title">Mood 🌈</h2>
          <div className="flex items-center gap-3">
            <span className="text-4xl">{entry.moodEmoji}</span>
            <span className="font-body text-muted-foreground">
              {MOODS.find((m) => m.emoji === entry.moodEmoji)?.label ?? entry.moodEmoji}
            </span>
          </div>
        </div>
      )}

      {/* Tasks */}
      {entry.tasks.length > 0 && (
        <div className="card-warm p-5 space-y-4">
          <div className="flex items-center gap-2">
            <h2 className="section-title">Tasks ✅</h2>
            <span className="text-xs font-body text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
              {completedCount}/{entry.tasks.length} done
            </span>
          </div>
          <div className="space-y-2">
            {entry.tasks.map((task, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className={`w-4 h-4 rounded border-2 shrink-0 flex items-center justify-center ${task.isComplete ? 'bg-primary border-primary' : 'border-border'}`}>
                  {task.isComplete && <span className="text-white text-xs">✓</span>}
                </div>
                <span className={`font-body text-sm ${task.isComplete ? 'line-through text-muted-foreground' : 'text-foreground'}`}>
                  {task.description}
                </span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Schedule */}
      {entry.schedule.length > 0 && (
        <div className="card-warm p-5 space-y-4">
          <h2 className="section-title">Schedule Timeline 🕒</h2>
          <div className="space-y-2">
            {entry.schedule.map((item, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="flex items-center gap-1.5 shrink-0 min-w-[80px]">
                  <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                  <span className="font-body text-sm font-medium text-primary">{item.timeBlock}</span>
                </div>
                <span className="font-body text-sm text-foreground">{item.activity}</span>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Water Intake */}
      <div className="card-warm p-5 space-y-3">
        <h2 className="section-title">Water Intake 💧</h2>
        <div className="flex items-center gap-3">
          <Droplets className="w-5 h-5 text-blue-400" />
          <span className="font-display text-2xl font-bold text-foreground">{Number(entry.waterIntake)}</span>
          <span className="font-body text-muted-foreground text-sm">glasses</span>
        </div>
        <div className="flex gap-1">
          {Array.from({ length: 8 }).map((_, i) => (
            <div
              key={i}
              className={`w-4 h-4 rounded-full border-2 transition-colors ${
                i < Number(entry.waterIntake)
                  ? 'bg-blue-400 border-blue-400'
                  : 'bg-transparent border-border'
              }`}
            />
          ))}
        </div>
      </div>

      {/* Gratitude */}
      {entry.gratitudeEntries.length > 0 && (
        <div className="card-warm p-5 space-y-4">
          <h2 className="section-title">Gratitude 🙏</h2>
          <div className="space-y-2">
            {entry.gratitudeEntries.map((g, i) => (
              <div key={i} className="flex items-start gap-3">
                <span className="text-lg shrink-0">{(['✨', '🌸', '💛'] as const)[i] ?? '💫'}</span>
                <p className="font-body text-sm text-foreground">{g}</p>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Notes */}
      {entry.notes && (
        <div className="card-warm p-5 space-y-3">
          <h2 className="section-title">Notes 📝</h2>
          <p className="font-body text-sm text-foreground whitespace-pre-wrap">{entry.notes}</p>
        </div>
      )}

      {/* Mini Journal */}
      {entry.journalEntry && (
        <div className="card-warm p-5 space-y-3">
          <h2 className="section-title">Mini Journal ✍️</h2>
          <p className="font-body text-sm text-foreground whitespace-pre-wrap leading-relaxed">{entry.journalEntry}</p>
        </div>
      )}

      {/* Empty state when entry exists but all fields are empty */}
      {!entry.moodEmoji &&
        entry.tasks.length === 0 &&
        entry.schedule.length === 0 &&
        Number(entry.waterIntake) === 0 &&
        entry.gratitudeEntries.length === 0 &&
        !entry.notes &&
        !entry.journalEntry && (
          <div className="card-warm p-8 text-center">
            <p className="font-body text-muted-foreground italic">This entry appears to be empty.</p>
          </div>
        )}
    </div>
  );
}

// ─── Daily Planner Page ───────────────────────────────────────────────────────

export default function DailyPlanner() {
  const { identity } = useInternetIdentity();

  const { data: allEntries = [], isLoading } = useGetDailyPlannerEntries();
  const saveEntry = useSaveDailyPlannerEntry();
  const updateWater = useUpdateWaterIntake();
  const { data: couple } = useGetCouple();
  const { data: partnerProfile } = useGetPartnerUserProfile();

  const isInCouple = !!couple;
  const partnerName = partnerProfile?.displayName || partnerProfile?.name || 'Your Partner';

  const [selectedDate, setSelectedDate] = useState(new Date());
  const journalRef = useRef<HTMLTextAreaElement>(null);

  const dateKey = dateToKey(selectedDate);
  const existingEntry = allEntries.find((e) => e.date === dateKey);

  // Partner data for selected date
  const { data: partnerEntry, isLoading: partnerLoading } = usePartnerDailyPlannerForDate(dateKey);

  // Form state
  const [schedule, setSchedule] = useState<ScheduleItem[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [notes, setNotes] = useState('');
  const [waterIntake, setWaterIntake] = useState(0);
  const [moodEmoji, setMoodEmoji] = useState('');
  const [gratitude, setGratitude] = useState(['', '', '']);
  const [journalEntry, setJournalEntry] = useState('');

  // Load existing entry when date changes
  useEffect(() => {
    if (existingEntry) {
      setSchedule(existingEntry.schedule);
      setTasks([...existingEntry.tasks]);
      setNotes(existingEntry.notes);
      setWaterIntake(Number(existingEntry.waterIntake));
      setMoodEmoji(existingEntry.moodEmoji);
      const grat = [...existingEntry.gratitudeEntries];
      while (grat.length < 3) grat.push('');
      setGratitude(grat.slice(0, 3));
      setJournalEntry(existingEntry.journalEntry);
    } else {
      setSchedule([]);
      setTasks([]);
      setNotes('');
      setWaterIntake(0);
      setMoodEmoji('');
      setGratitude(['', '', '']);
      setJournalEntry('');
    }
  }, [dateKey, existingEntry?.date]);

  if (!identity) return null;

  const isSaving = saveEntry.isPending;

  const handleSave = async () => {
    const entry: DailyPlannerEntry = {
      date: dateKey,
      schedule,
      tasks: tasks.filter((t) => t.description.trim()),
      notes,
      waterIntake: BigInt(waterIntake),
      moodEmoji,
      gratitudeEntries: gratitude.filter((g) => g.trim()),
      journalEntry,
    };
    try {
      await saveEntry.mutateAsync(entry);
      toast.success('Entry saved! ✨');
    } catch (err: unknown) {
      const error = err as Error;
      toast.error(error?.message || 'Failed to save entry. Please try again.');
    }
  };

  const handleWaterChange = async (delta: number) => {
    const newVal = Math.max(0, waterIntake + delta);
    setWaterIntake(newVal);
    if (existingEntry) {
      try {
        await updateWater.mutateAsync({ date: dateKey, intake: BigInt(newVal) });
      } catch {
        // Will be saved on next full save
      }
    }
  };

  const handleAddScheduleItem = () => {
    setSchedule([...schedule, { timeBlock: '', activity: '' }]);
  };

  const handleRemoveScheduleItem = (i: number) => {
    setSchedule(schedule.filter((_, idx) => idx !== i));
  };

  const handleScheduleChange = (i: number, field: keyof ScheduleItem, val: string) => {
    const updated = [...schedule];
    updated[i] = { ...updated[i], [field]: val };
    setSchedule(updated);
  };

  const handleAddTask = () => {
    setTasks([...tasks, { description: '', isComplete: false }]);
  };

  const handleRemoveTask = (i: number) => {
    setTasks(tasks.filter((_, idx) => idx !== i));
  };

  const handleTaskChange = (i: number, field: keyof Task, val: string | boolean) => {
    const updated = [...tasks];
    updated[i] = { ...updated[i], [field]: val };
    setTasks(updated);
  };

  const handleGratitudeChange = (i: number, val: string) => {
    const updated = [...gratitude];
    updated[i] = val;
    setGratitude(updated);
  };

  const completedCount = tasks.filter((t) => t.isComplete).length;

  // ─── My Planner Content ───────────────────────────────────────────────────

  const myPlannerContent = (
    <>
      {isLoading ? (
        <div className="space-y-4">
          {[1, 2, 3].map((i) => <Skeleton key={i} className="h-32 rounded-2xl" />)}
        </div>
      ) : (
        <div className="space-y-5">
          {/* Mood Picker */}
          <div className="card-warm p-5 space-y-3">
            <h2 className="section-title">How are you feeling? 🌈</h2>
            <div className="flex flex-wrap gap-2">
              {MOODS.map(({ emoji, label }) => (
                <button
                  key={emoji}
                  type="button"
                  onClick={() => setMoodEmoji(moodEmoji === emoji ? '' : emoji)}
                  className={`flex flex-col items-center gap-1 p-3 rounded-2xl border-2 transition-all ${
                    moodEmoji === emoji
                      ? 'border-primary bg-primary/10 shadow-warm'
                      : 'border-border/40 bg-secondary/30 hover:border-primary/40'
                  }`}
                >
                  <span className="text-2xl">{emoji}</span>
                  <span className="text-xs font-body text-muted-foreground">{label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Tasks */}
          <div className="card-warm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center gap-2">
                <h2 className="section-title">Tasks ✅</h2>
                {tasks.length > 0 && (
                  <span className="text-xs font-body text-muted-foreground bg-secondary/50 px-2 py-0.5 rounded-full">
                    {completedCount}/{tasks.length} done
                  </span>
                )}
              </div>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddTask}
                className="font-body text-xs"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Task
              </Button>
            </div>

            {tasks.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-6 gap-2 text-muted-foreground">
                <ListTodo className="w-8 h-8 opacity-40" />
                <p className="text-sm font-body italic">No tasks yet. Add your first task!</p>
              </div>
            ) : (
              <div className="space-y-2">
                {tasks.map((task, i) => (
                  <div key={i} className="flex items-center gap-3 group">
                    <Checkbox
                      id={`task-${i}`}
                      checked={task.isComplete}
                      onCheckedChange={(checked) => handleTaskChange(i, 'isComplete', !!checked)}
                      className="shrink-0"
                    />
                    <Input
                      placeholder={`Task ${i + 1}...`}
                      value={task.description}
                      onChange={(e) => handleTaskChange(i, 'description', e.target.value)}
                      className={`font-body flex-1 ${task.isComplete ? 'line-through text-muted-foreground' : ''}`}
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveTask(i)}
                      className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive opacity-0 group-hover:opacity-100 transition-opacity"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Schedule Timeline */}
          <div className="card-warm p-5 space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="section-title">Schedule Timeline 🕒</h2>
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={handleAddScheduleItem}
                className="font-body text-xs"
              >
                <Plus className="w-3 h-3 mr-1" /> Add Block
              </Button>
            </div>
            {schedule.length === 0 ? (
              <p className="text-sm font-body text-muted-foreground italic text-center py-4">
                No schedule blocks yet. Add your first time block!
              </p>
            ) : (
              <div className="space-y-2">
                {schedule.map((item, i) => (
                  <div key={i} className="flex items-center gap-2">
                    <div className="flex items-center gap-1.5 shrink-0">
                      <Clock className="w-3.5 h-3.5 text-muted-foreground" />
                      <Input
                        placeholder="9:00 AM"
                        value={item.timeBlock}
                        onChange={(e) => handleScheduleChange(i, 'timeBlock', e.target.value)}
                        className="font-body text-sm w-24"
                      />
                    </div>
                    <Input
                      placeholder="Activity..."
                      value={item.activity}
                      onChange={(e) => handleScheduleChange(i, 'activity', e.target.value)}
                      className="font-body text-sm flex-1"
                    />
                    <Button
                      type="button"
                      variant="ghost"
                      size="icon"
                      onClick={() => handleRemoveScheduleItem(i)}
                      className="shrink-0 h-8 w-8 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Water Intake */}
          <div className="card-warm p-5 space-y-3">
            <h2 className="section-title">Water Intake 💧</h2>
            <div className="flex items-center gap-4">
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleWaterChange(-1)}
                disabled={waterIntake === 0}
                className="rounded-xl"
              >
                <Minus className="w-4 h-4" />
              </Button>
              <div className="flex-1 text-center">
                <div className="flex items-center justify-center gap-2">
                  <Droplets className="w-5 h-5 text-blue-400" />
                  <span className="font-display text-3xl font-bold text-foreground">{waterIntake}</span>
                  <span className="font-body text-muted-foreground text-sm">glasses</span>
                </div>
                <div className="flex gap-1 justify-center mt-2">
                  {Array.from({ length: 8 }).map((_, i) => (
                    <div
                      key={i}
                      className={`w-4 h-4 rounded-full border-2 transition-colors ${
                        i < waterIntake
                          ? 'bg-blue-400 border-blue-400'
                          : 'bg-transparent border-border'
                      }`}
                    />
                  ))}
                </div>
              </div>
              <Button
                type="button"
                variant="outline"
                size="icon"
                onClick={() => handleWaterChange(1)}
                className="rounded-xl"
              >
                <Plus className="w-4 h-4" />
              </Button>
            </div>
          </div>

          {/* Gratitude */}
          <div className="card-warm p-5 space-y-4">
            <h2 className="section-title">Gratitude 🙏</h2>
            <p className="text-sm font-body text-muted-foreground">Three things you're grateful for today:</p>
            <div className="space-y-3">
              {gratitude.map((g, i) => (
                <div key={i} className="flex items-center gap-3">
                  <span className="text-lg shrink-0">{(['✨', '🌸', '💛'] as const)[i]}</span>
                  <Input
                    placeholder={`I'm grateful for...`}
                    value={g}
                    onChange={(e) => handleGratitudeChange(i, e.target.value)}
                    className="font-body"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div className="card-warm p-5 space-y-3">
            <h2 className="section-title">Notes 📝</h2>
            <Textarea
              placeholder="Any notes, reminders, or thoughts for today..."
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              className="font-body resize-none"
              rows={3}
            />
          </div>

          {/* Mini Journal */}
          <div className="card-warm p-5 space-y-3">
            <h2 className="section-title">Mini Journal ✍️</h2>
            <p className="text-sm font-body text-muted-foreground">
              Free writing space — let your thoughts flow.
            </p>
            <Textarea
              ref={journalRef}
              placeholder="Today I felt... Today I learned... Today I'm proud of..."
              value={journalEntry}
              onChange={(e) => setJournalEntry(e.target.value)}
              className="font-body resize-none"
              rows={6}
            />
          </div>

          <Separator />

          {/* Save Button */}
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
                <><Save className="w-4 h-4 mr-2" /> Save Entry</>
              )}
            </Button>
          </div>
        </div>
      )}
    </>
  );

  return (
    <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8 space-y-6 animate-fade-in">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-foreground">
            Daily Planner 📅
          </h1>
          <p className="font-body text-muted-foreground mt-1">Plan, reflect, and grow — one day at a time.</p>
        </div>
        {!isInCouple && (
          <Button
            onClick={handleSave}
            disabled={isSaving}
            className="font-body font-semibold rounded-2xl shadow-warm"
          >
            {isSaving ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              <><Save className="w-4 h-4 mr-2" /> Save Entry</>
            )}
          </Button>
        )}
      </div>

      {/* Date Picker */}
      <div className="card-warm p-4 flex items-center justify-between">
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedDate(addDays(selectedDate, -1))}
          className="rounded-xl"
        >
          <ChevronLeft className="w-5 h-5" />
        </Button>
        <div className="text-center">
          <div className="flex items-center gap-2 justify-center">
            <CalendarDays className="w-4 h-4 text-primary" />
            <span className="font-display text-lg font-semibold text-foreground">
              {formatDateDisplay(selectedDate)}
            </span>
          </div>
          {existingEntry && (
            <span className="text-xs font-body text-primary bg-primary/10 px-2 py-0.5 rounded-full mt-1 inline-block">
              Entry exists ✓
            </span>
          )}
        </div>
        <Button
          variant="ghost"
          size="icon"
          onClick={() => setSelectedDate(addDays(selectedDate, 1))}
          className="rounded-xl"
        >
          <ChevronRight className="w-5 h-5" />
        </Button>
      </div>

      {/* Tabs: My Planner / Partner's Planner */}
      {isInCouple ? (
        <Tabs defaultValue="mine" className="w-full">
          <TabsList className="w-full mb-4">
            <TabsTrigger value="mine" className="flex-1 gap-2">
              <User className="w-4 h-4" />
              My Planner
            </TabsTrigger>
            <TabsTrigger value="partner" className="flex-1 gap-2">
              <Heart className="w-4 h-4" />
              {partnerName}'s Planner
            </TabsTrigger>
          </TabsList>

          <TabsContent value="mine" className="mt-0">
            {/* Save button inside tab for couple mode */}
            <div className="flex justify-end mb-4">
              <Button
                onClick={handleSave}
                disabled={isSaving}
                className="font-body font-semibold rounded-2xl shadow-warm"
              >
                {isSaving ? (
                  <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
                ) : (
                  <><Save className="w-4 h-4 mr-2" /> Save Entry</>
                )}
              </Button>
            </div>
            {myPlannerContent}
          </TabsContent>

          <TabsContent value="partner" className="mt-0">
            <div className="mb-4 flex items-center gap-2 text-sm font-body text-muted-foreground bg-secondary/30 rounded-xl px-4 py-2">
              <Heart className="w-4 h-4 text-primary shrink-0" />
              <span>Viewing <strong>{partnerName}</strong>'s planner for this day — read only.</span>
            </div>
            <PartnerPlannerView
              entry={partnerEntry}
              isLoading={partnerLoading}
              partnerName={partnerName}
            />
          </TabsContent>
        </Tabs>
      ) : (
        myPlannerContent
      )}
    </div>
  );
}
