import { useState, useEffect } from 'react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Slider } from '@/components/ui/slider';
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  BookOpen,
  Heart,
  Moon,
  Sprout,
  ChevronLeft,
  ChevronRight,
  Plus,
  X,
  Loader2,
  Star,
} from 'lucide-react';
import {
  useGetDailyJournals,
  useCreateOrUpdateDailyJournal,
  useGetEmotionalJournals,
  useCreateOrUpdateEmotionalJournal,
  useGetNightReflections,
  useCreateOrUpdateNightReflection,
  useGetGrowthJournals,
  useCreateOrUpdateGrowthJournal,
} from '@/hooks/useQueries';
import { EmotionTag, GrowthArea } from '../backend';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateToTimestamp(dateStr: string): bigint {
  return BigInt(new Date(dateStr).setHours(0, 0, 0, 0));
}

function todayStr(): string {
  return new Date().toISOString().split('T')[0];
}

function formatDisplayDate(dateStr: string): string {
  return new Date(dateStr + 'T00:00:00').toLocaleDateString('en-US', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
}

function shiftDate(dateStr: string, days: number): string {
  const d = new Date(dateStr + 'T00:00:00');
  d.setDate(d.getDate() + days);
  return d.toISOString().split('T')[0];
}

// ─── Date Picker Bar ──────────────────────────────────────────────────────────

interface DatePickerBarProps {
  date: string;
  onChange: (d: string) => void;
}

function DatePickerBar({ date, onChange }: DatePickerBarProps) {
  return (
    <div className="flex items-center gap-3 mb-6">
      <button
        onClick={() => onChange(shiftDate(date, -1))}
        className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Previous day"
      >
        <ChevronLeft className="w-4 h-4" />
      </button>
      <div className="flex-1 text-center">
        <p className="font-display text-lg font-semibold text-foreground">
          {formatDisplayDate(date)}
        </p>
      </div>
      <button
        onClick={() => onChange(shiftDate(date, 1))}
        className="p-2 rounded-xl hover:bg-secondary transition-colors text-muted-foreground hover:text-foreground"
        aria-label="Next day"
        disabled={date >= todayStr()}
      >
        <ChevronRight className="w-4 h-4" />
      </button>
      <input
        type="date"
        value={date}
        max={todayStr()}
        onChange={(e) => onChange(e.target.value)}
        className="text-sm font-body border border-border rounded-xl px-3 py-1.5 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-primary/40"
      />
    </div>
  );
}

// ─── Daily Journal Tab ────────────────────────────────────────────────────────

function DailyJournalTab() {
  const [date, setDate] = useState(todayStr());
  const [body, setBody] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const { data: entries = [] } = useGetDailyJournals();
  const saveMutation = useCreateOrUpdateDailyJournal();

  useEffect(() => {
    const ts = dateToTimestamp(date);
    const existing = entries.find((e) => e.date === ts);
    setBody(existing?.body ?? '');
    setIsPublic(existing?.isPublic ?? false);
  }, [date, entries]);

  const handleSave = () => {
    saveMutation.mutate(
      { date: dateToTimestamp(date), body, isPublic },
      {
        onSuccess: () => toast.success('Daily journal saved ✨'),
        onError: () => toast.error('Failed to save journal entry'),
      }
    );
  };

  return (
    <div className="space-y-5">
      <DatePickerBar date={date} onChange={setDate} />
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border/60 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <BookOpen className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Today's Thoughts</h3>
        </div>
        <p className="text-sm font-body text-muted-foreground">
          Write freely — this is your private space to reflect, dream, and process.
        </p>
        <Textarea
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="What's on your mind today? How are you feeling? What happened that was meaningful..."
          className="min-h-[220px] font-body text-base resize-none leading-relaxed"
        />
        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm font-body text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            Share with partner
          </label>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || !body.trim()}
            className="font-body"
          >
            {saveMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              'Save Entry'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Emotion Tag Selector ─────────────────────────────────────────────────────

const EMOTION_OPTIONS: { value: EmotionTag; label: string; emoji: string }[] = [
  { value: EmotionTag.happy, label: 'Happy', emoji: '😊' },
  { value: EmotionTag.grateful, label: 'Grateful', emoji: '🙏' },
  { value: EmotionTag.calm, label: 'Calm', emoji: '😌' },
  { value: EmotionTag.excited, label: 'Excited', emoji: '🤩' },
  { value: EmotionTag.peaceful, label: 'Peaceful', emoji: '☮️' },
  { value: EmotionTag.motivated, label: 'Motivated', emoji: '💪' },
  { value: EmotionTag.optimistic, label: 'Optimistic', emoji: '🌟' },
  { value: EmotionTag.content, label: 'Content', emoji: '😊' },
  { value: EmotionTag.anxious, label: 'Anxious', emoji: '😰' },
  { value: EmotionTag.sad, label: 'Sad', emoji: '😢' },
  { value: EmotionTag.angry, label: 'Angry', emoji: '😠' },
  { value: EmotionTag.frustrated, label: 'Frustrated', emoji: '😤' },
  { value: EmotionTag.overwhelmed, label: 'Overwhelmed', emoji: '😵' },
  { value: EmotionTag.fearful, label: 'Fearful', emoji: '😨' },
  { value: EmotionTag.disappointed, label: 'Disappointed', emoji: '😞' },
];

// ─── Emotional Journal Tab ────────────────────────────────────────────────────

function EmotionalJournalTab() {
  const [date, setDate] = useState(todayStr());
  const [emotion, setEmotion] = useState<EmotionTag>(EmotionTag.calm);
  const [intensity, setIntensity] = useState(3);
  const [trigger, setTrigger] = useState('');
  const [reflection, setReflection] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const { data: entries = [] } = useGetEmotionalJournals();
  const saveMutation = useCreateOrUpdateEmotionalJournal();

  useEffect(() => {
    const ts = dateToTimestamp(date);
    const existing = entries.find((e) => e.date === ts);
    if (existing) {
      setEmotion(existing.emotion as EmotionTag);
      setIntensity(Number(existing.intensity));
      setTrigger(existing.trigger);
      setReflection(existing.reflection);
      setIsPublic(existing.isPublic);
    } else {
      setEmotion(EmotionTag.calm);
      setIntensity(3);
      setTrigger('');
      setReflection('');
      setIsPublic(false);
    }
  }, [date, entries]);

  const handleSave = () => {
    saveMutation.mutate(
      {
        date: dateToTimestamp(date),
        emotion,
        intensity: BigInt(intensity),
        trigger,
        reflection,
        isPublic,
      },
      {
        onSuccess: () => toast.success('Emotional journal saved 💛'),
        onError: () => toast.error('Failed to save emotional journal'),
      }
    );
  };

  const selectedEmoji = EMOTION_OPTIONS.find((e) => e.value === emotion)?.emoji ?? '😌';

  return (
    <div className="space-y-5">
      <DatePickerBar date={date} onChange={setDate} />
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border/60 space-y-6">
        <div className="flex items-center gap-2 mb-1">
          <Heart className="w-5 h-5 text-rose-dusty" />
          <h3 className="font-display text-lg font-semibold text-foreground">Emotional Check-In</h3>
        </div>

        {/* Emotion Tag Selector */}
        <div className="space-y-2">
          <Label className="label-warm">How are you feeling?</Label>
          <div className="flex flex-wrap gap-2">
            {EMOTION_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setEmotion(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body border transition-all ${
                  emotion === opt.value
                    ? 'bg-primary text-primary-foreground border-primary shadow-warm'
                    : 'bg-secondary text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Intensity Slider */}
        <div className="space-y-3">
          <Label className="label-warm">
            Intensity: <span className="text-primary font-semibold">{intensity}/5</span>
            <span className="ml-2 text-lg">{selectedEmoji}</span>
          </Label>
          <Slider
            min={1}
            max={5}
            step={1}
            value={[intensity]}
            onValueChange={([v]) => setIntensity(v)}
            className="w-full"
          />
          <div className="flex justify-between text-xs font-body text-muted-foreground">
            <span>Mild</span>
            <span>Moderate</span>
            <span>Intense</span>
          </div>
        </div>

        {/* Trigger */}
        <div className="space-y-2">
          <Label htmlFor="trigger" className="label-warm">What triggered this feeling?</Label>
          <Input
            id="trigger"
            value={trigger}
            onChange={(e) => setTrigger(e.target.value)}
            placeholder="e.g. A conversation, a situation, a thought..."
            className="font-body"
          />
        </div>

        {/* Reflection */}
        <div className="space-y-2">
          <Label htmlFor="reflection" className="label-warm">Reflection</Label>
          <Textarea
            id="reflection"
            value={reflection}
            onChange={(e) => setReflection(e.target.value)}
            placeholder="What does this emotion tell you? How can you respond with compassion?"
            className="min-h-[120px] font-body resize-none"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm font-body text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            Share with partner
          </label>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="font-body"
          >
            {saveMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              'Save Entry'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Night Reflection Tab ─────────────────────────────────────────────────────

function NightReflectionTab() {
  const [date, setDate] = useState(todayStr());
  const [highlights, setHighlights] = useState<string[]>(['']);
  const [improvements, setImprovements] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [intention, setIntention] = useState('');
  const [isPublic, setIsPublic] = useState(false);

  const { data: entries = [] } = useGetNightReflections();
  const saveMutation = useCreateOrUpdateNightReflection();

  useEffect(() => {
    const ts = dateToTimestamp(date);
    const existing = entries.find((e) => e.date === ts);
    if (existing) {
      setHighlights(existing.highlights.length > 0 ? [...existing.highlights] : ['']);
      setImprovements(existing.improvements);
      setGratitude(existing.gratitude);
      setIntention(existing.intention);
      setIsPublic(existing.isPublic);
    } else {
      setHighlights(['']);
      setImprovements('');
      setGratitude('');
      setIntention('');
      setIsPublic(false);
    }
  }, [date, entries]);

  const addHighlight = () => setHighlights((prev) => [...prev, '']);
  const removeHighlight = (i: number) =>
    setHighlights((prev) => prev.filter((_, idx) => idx !== i));
  const updateHighlight = (i: number, val: string) =>
    setHighlights((prev) => prev.map((h, idx) => (idx === i ? val : h)));

  const handleSave = () => {
    const cleanHighlights = highlights.filter((h) => h.trim() !== '');
    saveMutation.mutate(
      {
        date: dateToTimestamp(date),
        highlights: cleanHighlights,
        improvements,
        gratitude,
        intention,
        isPublic,
      },
      {
        onSuccess: () => toast.success('Night reflection saved 🌙'),
        onError: () => toast.error('Failed to save night reflection'),
      }
    );
  };

  return (
    <div className="space-y-5">
      <DatePickerBar date={date} onChange={setDate} />
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border/60 space-y-6">
        <div className="flex items-center gap-2 mb-1">
          <Moon className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Night Reflection</h3>
        </div>

        {/* Highlights */}
        <div className="space-y-3">
          <Label className="label-warm">✨ Today's Highlights</Label>
          <div className="space-y-2">
            {highlights.map((h, i) => (
              <div key={i} className="flex items-center gap-2">
                <span className="text-primary font-semibold text-sm w-5 shrink-0">{i + 1}.</span>
                <Input
                  value={h}
                  onChange={(e) => updateHighlight(i, e.target.value)}
                  placeholder={`Highlight ${i + 1}...`}
                  className="font-body flex-1"
                />
                {highlights.length > 1 && (
                  <button
                    onClick={() => removeHighlight(i)}
                    className="p-1.5 rounded-lg text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                    aria-label="Remove highlight"
                  >
                    <X className="w-4 h-4" />
                  </button>
                )}
              </div>
            ))}
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={addHighlight}
            className="font-body text-xs"
          >
            <Plus className="w-3.5 h-3.5 mr-1.5" /> Add Highlight
          </Button>
        </div>

        {/* What could have gone better */}
        <div className="space-y-2">
          <Label htmlFor="improvements" className="label-warm">🔄 What could have gone better?</Label>
          <Textarea
            id="improvements"
            value={improvements}
            onChange={(e) => setImprovements(e.target.value)}
            placeholder="Reflect on moments you'd handle differently..."
            className="min-h-[100px] font-body resize-none"
          />
        </div>

        {/* Gratitude */}
        <div className="space-y-2">
          <Label htmlFor="gratitude" className="label-warm">🙏 Gratitude Note</Label>
          <Input
            id="gratitude"
            value={gratitude}
            onChange={(e) => setGratitude(e.target.value)}
            placeholder="I am grateful for..."
            className="font-body"
          />
        </div>

        {/* Tomorrow's Intention */}
        <div className="space-y-2">
          <Label htmlFor="intention" className="label-warm">🌅 Tomorrow's Intention</Label>
          <Input
            id="intention"
            value={intention}
            onChange={(e) => setIntention(e.target.value)}
            placeholder="Tomorrow I intend to..."
            className="font-body"
          />
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm font-body text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            Share with partner
          </label>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending}
            className="font-body"
          >
            {saveMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              'Save Entry'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Growth Journal Tab ───────────────────────────────────────────────────────

const GROWTH_AREA_OPTIONS: { value: GrowthArea; label: string; emoji: string }[] = [
  { value: GrowthArea.career, label: 'Career', emoji: '💼' },
  { value: GrowthArea.relationships, label: 'Relationships', emoji: '💑' },
  { value: GrowthArea.health, label: 'Health', emoji: '🏃' },
  { value: GrowthArea.mindset, label: 'Mindset', emoji: '🧠' },
  { value: GrowthArea.spiritual, label: 'Spiritual', emoji: '✨' },
  { value: GrowthArea.other, label: 'Other', emoji: '🌱' },
];

function GrowthJournalTab() {
  const [date, setDate] = useState(todayStr());
  const [lesson, setLesson] = useState('');
  const [growthArea, setGrowthArea] = useState<GrowthArea>(GrowthArea.mindset);
  const [actionStep, setActionStep] = useState('');
  const [growthRating, setGrowthRating] = useState(3);
  const [isPublic, setIsPublic] = useState(false);

  const { data: entries = [] } = useGetGrowthJournals();
  const saveMutation = useCreateOrUpdateGrowthJournal();

  useEffect(() => {
    const ts = dateToTimestamp(date);
    const existing = entries.find((e) => e.date === ts);
    if (existing) {
      setLesson(existing.lesson);
      setGrowthArea(existing.growthArea as GrowthArea);
      setActionStep(existing.actionStep);
      setGrowthRating(Number(existing.growthRating));
      setIsPublic(existing.isPublic);
    } else {
      setLesson('');
      setGrowthArea(GrowthArea.mindset);
      setActionStep('');
      setGrowthRating(3);
      setIsPublic(false);
    }
  }, [date, entries]);

  const handleSave = () => {
    saveMutation.mutate(
      {
        date: dateToTimestamp(date),
        lesson,
        growthArea,
        actionStep,
        growthRating: BigInt(growthRating),
        isPublic,
      },
      {
        onSuccess: () => toast.success('Growth journal saved 🌱'),
        onError: () => toast.error('Failed to save growth journal'),
      }
    );
  };

  return (
    <div className="space-y-5">
      <DatePickerBar date={date} onChange={setDate} />
      <div className="bg-card rounded-2xl p-6 shadow-warm border border-border/60 space-y-6">
        <div className="flex items-center gap-2 mb-1">
          <Sprout className="w-5 h-5 text-primary" />
          <h3 className="font-display text-lg font-semibold text-foreground">Growth Journal</h3>
        </div>

        {/* Lesson Learned */}
        <div className="space-y-2">
          <Label htmlFor="lesson" className="label-warm">📚 Lesson Learned</Label>
          <Textarea
            id="lesson"
            value={lesson}
            onChange={(e) => setLesson(e.target.value)}
            placeholder="What did you learn today? What insight or wisdom did you gain?"
            className="min-h-[120px] font-body resize-none"
          />
        </div>

        {/* Area of Growth */}
        <div className="space-y-2">
          <Label className="label-warm">🌿 Area of Growth</Label>
          <div className="flex flex-wrap gap-2">
            {GROWTH_AREA_OPTIONS.map((opt) => (
              <button
                key={opt.value}
                onClick={() => setGrowthArea(opt.value)}
                className={`flex items-center gap-1.5 px-3 py-1.5 rounded-full text-sm font-body border transition-all ${
                  growthArea === opt.value
                    ? 'bg-primary text-primary-foreground border-primary shadow-warm'
                    : 'bg-secondary text-muted-foreground border-border/60 hover:border-primary/40 hover:text-foreground'
                }`}
              >
                <span>{opt.emoji}</span>
                <span>{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Action Step */}
        <div className="space-y-2">
          <Label htmlFor="actionStep" className="label-warm">🎯 Action Step</Label>
          <Input
            id="actionStep"
            value={actionStep}
            onChange={(e) => setActionStep(e.target.value)}
            placeholder="What concrete action will you take based on this lesson?"
            className="font-body"
          />
        </div>

        {/* Growth Rating */}
        <div className="space-y-3">
          <Label className="label-warm">
            🌟 Personal Growth Rating:{' '}
            <span className="text-primary font-semibold">{growthRating}/5</span>
          </Label>
          <div className="flex items-center gap-2">
            {[1, 2, 3, 4, 5].map((star) => (
              <button
                key={star}
                onClick={() => setGrowthRating(star)}
                className="transition-transform hover:scale-110 focus:outline-none"
                aria-label={`Rate ${star} out of 5`}
              >
                <Star
                  className={`w-8 h-8 transition-colors ${
                    star <= growthRating
                      ? 'text-amber fill-amber'
                      : 'text-muted-foreground/40'
                  }`}
                />
              </button>
            ))}
          </div>
          <div className="flex justify-between text-xs font-body text-muted-foreground">
            <span>Small step</span>
            <span>Breakthrough</span>
          </div>
        </div>

        <div className="flex items-center justify-between pt-1">
          <label className="flex items-center gap-2 text-sm font-body text-muted-foreground cursor-pointer select-none">
            <input
              type="checkbox"
              checked={isPublic}
              onChange={(e) => setIsPublic(e.target.checked)}
              className="rounded"
            />
            Share with partner
          </label>
          <Button
            onClick={handleSave}
            disabled={saveMutation.isPending || !lesson.trim()}
            className="font-body"
          >
            {saveMutation.isPending ? (
              <><Loader2 className="w-4 h-4 mr-2 animate-spin" /> Saving...</>
            ) : (
              'Save Entry'
            )}
          </Button>
        </div>
      </div>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JournalSection() {
  return (
    <div className="max-w-3xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
      {/* Page Header */}
      <div className="mb-8">
        <div className="flex items-center gap-3 mb-2">
          <div className="p-2.5 rounded-2xl bg-primary/10">
            <BookOpen className="w-6 h-6 text-primary" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-foreground">Journal</h1>
            <p className="font-body text-sm text-muted-foreground">
              Reflect, grow, and capture your inner world
            </p>
          </div>
        </div>
        <div className="flex flex-wrap gap-2 mt-4">
          {[
            { label: 'Daily', emoji: '📝' },
            { label: 'Emotional', emoji: '💛' },
            { label: 'Night Reflection', emoji: '🌙' },
            { label: 'Growth', emoji: '🌱' },
          ].map((t) => (
            <Badge key={t.label} variant="secondary" className="font-body text-xs px-3 py-1">
              {t.emoji} {t.label}
            </Badge>
          ))}
        </div>
      </div>

      {/* Tabs */}
      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="grid grid-cols-4 w-full mb-6 rounded-2xl bg-secondary/60 p-1 h-auto">
          <TabsTrigger
            value="daily"
            className="flex items-center gap-1.5 rounded-xl py-2.5 text-xs sm:text-sm font-body font-medium data-[state=active]:bg-card data-[state=active]:shadow-warm data-[state=active]:text-primary"
          >
            <BookOpen className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Daily</span>
          </TabsTrigger>
          <TabsTrigger
            value="emotional"
            className="flex items-center gap-1.5 rounded-xl py-2.5 text-xs sm:text-sm font-body font-medium data-[state=active]:bg-card data-[state=active]:shadow-warm data-[state=active]:text-primary"
          >
            <Heart className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Emotional</span>
          </TabsTrigger>
          <TabsTrigger
            value="night"
            className="flex items-center gap-1.5 rounded-xl py-2.5 text-xs sm:text-sm font-body font-medium data-[state=active]:bg-card data-[state=active]:shadow-warm data-[state=active]:text-primary"
          >
            <Moon className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Night</span>
          </TabsTrigger>
          <TabsTrigger
            value="growth"
            className="flex items-center gap-1.5 rounded-xl py-2.5 text-xs sm:text-sm font-body font-medium data-[state=active]:bg-card data-[state=active]:shadow-warm data-[state=active]:text-primary"
          >
            <Sprout className="w-4 h-4 shrink-0" />
            <span className="hidden sm:inline">Growth</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <DailyJournalTab />
        </TabsContent>
        <TabsContent value="emotional">
          <EmotionalJournalTab />
        </TabsContent>
        <TabsContent value="night">
          <NightReflectionTab />
        </TabsContent>
        <TabsContent value="growth">
          <GrowthJournalTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
