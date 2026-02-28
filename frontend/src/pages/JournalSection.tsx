import React, { useState } from 'react';
import { format } from 'date-fns';
import { Calendar, Heart, Moon, Sprout, ChevronLeft, ChevronRight, Users, Loader2 } from 'lucide-react';
import { toast } from 'sonner';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Skeleton } from '@/components/ui/skeleton';
import {
  useGetDailyJournals,
  useCreateOrUpdateDailyJournal,
  useGetEmotionalJournals,
  useCreateOrUpdateEmotionalJournal,
  useGetNightReflections,
  useCreateOrUpdateNightReflection,
  useGetGrowthJournals,
  useCreateOrUpdateGrowthJournal,
  useGetCouple,
  useGetPartnerUserProfile,
  useGetPartnerJournals,
} from '../hooks/useQueries';
import { EmotionTag, GrowthArea } from '../backend';
import type {
  DailyJournalEntry,
  EmotionalJournalEntry,
  NightReflectionJournalEntry,
  GrowthJournalEntry,
} from '../backend';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function dateToInt(date: Date): bigint {
  const d = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return BigInt(d.getTime());
}

function formatDisplayDate(date: Date): string {
  return format(date, 'MMMM d, yyyy');
}

function addDays(date: Date, days: number): Date {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d;
}

const EMOTION_OPTIONS: EmotionTag[] = [
  EmotionTag.happy, EmotionTag.anxious, EmotionTag.grateful, EmotionTag.sad, EmotionTag.calm, EmotionTag.angry,
  EmotionTag.excited, EmotionTag.frustrated, EmotionTag.peaceful, EmotionTag.motivated, EmotionTag.overwhelmed,
  EmotionTag.content, EmotionTag.fearful, EmotionTag.optimistic, EmotionTag.disappointed,
];

const GROWTH_AREA_OPTIONS: GrowthArea[] = [
  GrowthArea.career, GrowthArea.relationships, GrowthArea.health,
  GrowthArea.mindset, GrowthArea.spiritual, GrowthArea.other,
];

const EMOTION_EMOJI: Record<EmotionTag, string> = {
  [EmotionTag.happy]: '😊',
  [EmotionTag.anxious]: '😰',
  [EmotionTag.grateful]: '🙏',
  [EmotionTag.sad]: '😢',
  [EmotionTag.calm]: '😌',
  [EmotionTag.angry]: '😠',
  [EmotionTag.excited]: '🤩',
  [EmotionTag.frustrated]: '😤',
  [EmotionTag.peaceful]: '☮️',
  [EmotionTag.motivated]: '💪',
  [EmotionTag.overwhelmed]: '😵',
  [EmotionTag.content]: '😊',
  [EmotionTag.fearful]: '😨',
  [EmotionTag.optimistic]: '🌟',
  [EmotionTag.disappointed]: '😞',
};

// ─── Date Navigator ───────────────────────────────────────────────────────────

interface DateNavigatorProps {
  date: Date;
  onChange: (date: Date) => void;
}

function DateNavigator({ date, onChange }: DateNavigatorProps) {
  return (
    <div className="flex items-center gap-3">
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(addDays(date, -1))}
        className="text-warm-brown hover:bg-warm-cream"
      >
        <ChevronLeft className="w-4 h-4" />
      </Button>
      <span className="font-lato text-sm text-warm-brown font-medium min-w-[160px] text-center">
        {formatDisplayDate(date)}
      </span>
      <Button
        variant="ghost"
        size="icon"
        onClick={() => onChange(addDays(date, 1))}
        className="text-warm-brown hover:bg-warm-cream"
      >
        <ChevronRight className="w-4 h-4" />
      </Button>
    </div>
  );
}

// ─── Read-only field ──────────────────────────────────────────────────────────

function ReadOnlyField({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">{label}</Label>
      <div className="rounded-lg bg-warm-cream/60 border border-warm-sand/40 px-3 py-2 font-lato text-sm text-warm-brown min-h-[40px]">
        {value || <span className="text-warm-brown/40 italic">No entry</span>}
      </div>
    </div>
  );
}

function ReadOnlyTextArea({ label, value }: { label: string; value: string }) {
  return (
    <div className="space-y-1">
      <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">{label}</Label>
      <div className="rounded-lg bg-warm-cream/60 border border-warm-sand/40 px-3 py-2 font-lato text-sm text-warm-brown min-h-[80px] whitespace-pre-wrap">
        {value || <span className="text-warm-brown/40 italic">No entry</span>}
      </div>
    </div>
  );
}

// ─── Partner Journal Views ────────────────────────────────────────────────────

interface PartnerDailyViewProps {
  entries: DailyJournalEntry[];
  date: Date;
  onDateChange: (d: Date) => void;
}

function PartnerDailyView({ entries, date, onDateChange }: PartnerDailyViewProps) {
  const dateInt = dateToInt(date);
  const entry = entries.find(e => e.date === dateInt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-playfair text-lg text-warm-brown font-semibold">Daily Journal</h3>
        <DateNavigator date={date} onChange={onDateChange} />
      </div>
      <div className="rounded-2xl bg-white/70 border border-warm-sand/30 p-5 shadow-soft space-y-4">
        {entry ? (
          <ReadOnlyTextArea label="Journal Entry" value={entry.body} />
        ) : (
          <p className="font-lato text-sm text-warm-brown/50 italic text-center py-6">
            No daily journal entry for this date.
          </p>
        )}
      </div>
    </div>
  );
}

interface PartnerEmotionalViewProps {
  entries: EmotionalJournalEntry[];
  date: Date;
  onDateChange: (d: Date) => void;
}

function PartnerEmotionalView({ entries, date, onDateChange }: PartnerEmotionalViewProps) {
  const dateInt = dateToInt(date);
  const entry = entries.find(e => e.date === dateInt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-playfair text-lg text-warm-brown font-semibold">Emotional Journal</h3>
        <DateNavigator date={date} onChange={onDateChange} />
      </div>
      <div className="rounded-2xl bg-white/70 border border-warm-sand/30 p-5 shadow-soft space-y-4">
        {entry ? (
          <>
            <div className="flex items-center gap-3">
              <span className="text-2xl">{EMOTION_EMOJI[entry.emotion as EmotionTag] ?? '💭'}</span>
              <div>
                <p className="font-lato text-sm font-semibold text-warm-brown capitalize">{entry.emotion}</p>
                <p className="font-lato text-xs text-warm-brown/60">Intensity: {Number(entry.intensity)}/10</p>
              </div>
            </div>
            <ReadOnlyField label="Trigger" value={entry.trigger} />
            <ReadOnlyTextArea label="Reflection" value={entry.reflection} />
          </>
        ) : (
          <p className="font-lato text-sm text-warm-brown/50 italic text-center py-6">
            No emotional journal entry for this date.
          </p>
        )}
      </div>
    </div>
  );
}

interface PartnerNightViewProps {
  entries: NightReflectionJournalEntry[];
  date: Date;
  onDateChange: (d: Date) => void;
}

function PartnerNightView({ entries, date, onDateChange }: PartnerNightViewProps) {
  const dateInt = dateToInt(date);
  const entry = entries.find(e => e.date === dateInt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-playfair text-lg text-warm-brown font-semibold">Night Reflection</h3>
        <DateNavigator date={date} onChange={onDateChange} />
      </div>
      <div className="rounded-2xl bg-white/70 border border-warm-sand/30 p-5 shadow-soft space-y-4">
        {entry ? (
          <>
            <div className="space-y-1">
              <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">Highlights</Label>
              {entry.highlights.length > 0 ? (
                <ul className="space-y-1">
                  {entry.highlights.map((h, i) => (
                    <li key={i} className="font-lato text-sm text-warm-brown bg-warm-cream/60 border border-warm-sand/40 rounded-lg px-3 py-2">
                      {h}
                    </li>
                  ))}
                </ul>
              ) : (
                <p className="font-lato text-sm text-warm-brown/40 italic">No highlights</p>
              )}
            </div>
            <ReadOnlyTextArea label="Improvements" value={entry.improvements} />
            <ReadOnlyTextArea label="Gratitude" value={entry.gratitude} />
            <ReadOnlyField label="Tomorrow's Intention" value={entry.intention} />
          </>
        ) : (
          <p className="font-lato text-sm text-warm-brown/50 italic text-center py-6">
            No night reflection for this date.
          </p>
        )}
      </div>
    </div>
  );
}

interface PartnerGrowthViewProps {
  entries: GrowthJournalEntry[];
  date: Date;
  onDateChange: (d: Date) => void;
}

function PartnerGrowthView({ entries, date, onDateChange }: PartnerGrowthViewProps) {
  const dateInt = dateToInt(date);
  const entry = entries.find(e => e.date === dateInt);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-playfair text-lg text-warm-brown font-semibold">Growth Journal</h3>
        <DateNavigator date={date} onChange={onDateChange} />
      </div>
      <div className="rounded-2xl bg-white/70 border border-warm-sand/30 p-5 shadow-soft space-y-4">
        {entry ? (
          <>
            <div className="flex items-center gap-3">
              <Badge variant="secondary" className="capitalize font-lato text-xs">
                {entry.growthArea}
              </Badge>
              <span className="font-lato text-xs text-warm-brown/60">
                Growth Rating: {Number(entry.growthRating)}/10
              </span>
            </div>
            <ReadOnlyTextArea label="Lesson Learned" value={entry.lesson} />
            <ReadOnlyField label="Action Step" value={entry.actionStep} />
          </>
        ) : (
          <p className="font-lato text-sm text-warm-brown/50 italic text-center py-6">
            No growth journal entry for this date.
          </p>
        )}
      </div>
    </div>
  );
}

// ─── My Journal Tab Forms ─────────────────────────────────────────────────────

function DailyJournalTab() {
  const [date, setDate] = useState<Date>(new Date());
  const [body, setBody] = useState('');

  const { data: entries = [], isLoading } = useGetDailyJournals();
  const saveMutation = useCreateOrUpdateDailyJournal();

  const dateInt = dateToInt(date);

  React.useEffect(() => {
    const entry = entries.find(e => e.date === dateInt);
    setBody(entry?.body ?? '');
  }, [dateInt, entries]);

  const handleSave = async () => {
    const entry: DailyJournalEntry = {
      date: dateInt,
      body,
      isPublic: false,
    };
    try {
      await saveMutation.mutateAsync(entry);
      toast.success('Daily journal saved!');
    } catch {
      toast.error('Failed to save journal entry.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-playfair text-lg text-warm-brown font-semibold">Daily Journal</h3>
        <DateNavigator date={date} onChange={setDate} />
      </div>
      <div className="rounded-2xl bg-white/70 border border-warm-sand/30 p-5 shadow-soft space-y-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <>
            <div className="space-y-1">
              <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">
                What's on your mind today?
              </Label>
              <Textarea
                value={body}
                onChange={e => setBody(e.target.value)}
                placeholder="Write freely..."
                className="min-h-[160px] font-lato text-sm text-warm-brown bg-warm-cream/40 border-warm-sand/40 resize-none"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-warm-terracotta hover:bg-warm-terracotta/90 text-white font-lato"
            >
              {saveMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : 'Save Entry'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function EmotionalJournalTab() {
  const [date, setDate] = useState<Date>(new Date());
  const [emotion, setEmotion] = useState<EmotionTag>(EmotionTag.happy);
  const [intensity, setIntensity] = useState(5);
  const [trigger, setTrigger] = useState('');
  const [reflection, setReflection] = useState('');

  const { data: entries = [], isLoading } = useGetEmotionalJournals();
  const saveMutation = useCreateOrUpdateEmotionalJournal();

  const dateInt = dateToInt(date);

  React.useEffect(() => {
    const entry = entries.find(e => e.date === dateInt);
    if (entry) {
      setEmotion(entry.emotion as EmotionTag);
      setIntensity(Number(entry.intensity));
      setTrigger(entry.trigger);
      setReflection(entry.reflection);
    } else {
      setEmotion(EmotionTag.happy);
      setIntensity(5);
      setTrigger('');
      setReflection('');
    }
  }, [dateInt, entries]);

  const handleSave = async () => {
    const entry: EmotionalJournalEntry = {
      date: dateInt,
      emotion,
      intensity: BigInt(intensity),
      trigger,
      reflection,
      isPublic: false,
    };
    try {
      await saveMutation.mutateAsync(entry);
      toast.success('Emotional journal saved!');
    } catch {
      toast.error('Failed to save emotional journal.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-playfair text-lg text-warm-brown font-semibold">Emotional Journal</h3>
        <DateNavigator date={date} onChange={setDate} />
      </div>
      <div className="rounded-2xl bg-white/70 border border-warm-sand/30 p-5 shadow-soft space-y-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <>
            <div className="space-y-2">
              <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">Emotion</Label>
              <div className="flex flex-wrap gap-2">
                {EMOTION_OPTIONS.map(e => (
                  <button
                    key={e}
                    onClick={() => setEmotion(e)}
                    className={`px-3 py-1 rounded-full text-xs font-lato border transition-colors ${
                      emotion === e
                        ? 'bg-warm-terracotta text-white border-warm-terracotta'
                        : 'bg-warm-cream/60 text-warm-brown border-warm-sand/40 hover:bg-warm-sand/30'
                    }`}
                  >
                    {EMOTION_EMOJI[e]} {e}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">
                Intensity: {intensity}/10
              </Label>
              <input
                type="range"
                min={1}
                max={10}
                value={intensity}
                onChange={e => setIntensity(Number(e.target.value))}
                className="w-full accent-warm-terracotta"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">Trigger</Label>
              <Textarea
                value={trigger}
                onChange={e => setTrigger(e.target.value)}
                placeholder="What triggered this emotion?"
                className="min-h-[80px] font-lato text-sm text-warm-brown bg-warm-cream/40 border-warm-sand/40 resize-none"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">Reflection</Label>
              <Textarea
                value={reflection}
                onChange={e => setReflection(e.target.value)}
                placeholder="Reflect on this emotion..."
                className="min-h-[100px] font-lato text-sm text-warm-brown bg-warm-cream/40 border-warm-sand/40 resize-none"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-warm-terracotta hover:bg-warm-terracotta/90 text-white font-lato"
            >
              {saveMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : 'Save Entry'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function NightReflectionTab() {
  const [date, setDate] = useState<Date>(new Date());
  const [highlights, setHighlights] = useState<string[]>(['', '', '']);
  const [improvements, setImprovements] = useState('');
  const [gratitude, setGratitude] = useState('');
  const [intention, setIntention] = useState('');

  const { data: entries = [], isLoading } = useGetNightReflections();
  const saveMutation = useCreateOrUpdateNightReflection();

  const dateInt = dateToInt(date);

  React.useEffect(() => {
    const entry = entries.find(e => e.date === dateInt);
    if (entry) {
      const h = [...entry.highlights];
      while (h.length < 3) h.push('');
      setHighlights(h.slice(0, 3));
      setImprovements(entry.improvements);
      setGratitude(entry.gratitude);
      setIntention(entry.intention);
    } else {
      setHighlights(['', '', '']);
      setImprovements('');
      setGratitude('');
      setIntention('');
    }
  }, [dateInt, entries]);

  const handleSave = async () => {
    const entry: NightReflectionJournalEntry = {
      date: dateInt,
      highlights: highlights.filter(h => h.trim() !== ''),
      improvements,
      gratitude,
      intention,
      isPublic: false,
    };
    try {
      await saveMutation.mutateAsync(entry);
      toast.success('Night reflection saved!');
    } catch {
      toast.error('Failed to save night reflection.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-playfair text-lg text-warm-brown font-semibold">Night Reflection</h3>
        <DateNavigator date={date} onChange={setDate} />
      </div>
      <div className="rounded-2xl bg-white/70 border border-warm-sand/30 p-5 shadow-soft space-y-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <>
            <div className="space-y-2">
              <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">
                Today's Highlights
              </Label>
              {highlights.map((h, i) => (
                <input
                  key={i}
                  value={h}
                  onChange={e => {
                    const updated = [...highlights];
                    updated[i] = e.target.value;
                    setHighlights(updated);
                  }}
                  placeholder={`Highlight ${i + 1}`}
                  className="w-full rounded-lg bg-warm-cream/40 border border-warm-sand/40 px-3 py-2 font-lato text-sm text-warm-brown placeholder:text-warm-brown/40 focus:outline-none focus:ring-1 focus:ring-warm-terracotta/40"
                />
              ))}
            </div>
            <div className="space-y-1">
              <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">
                What could be improved?
              </Label>
              <Textarea
                value={improvements}
                onChange={e => setImprovements(e.target.value)}
                placeholder="Areas for improvement..."
                className="min-h-[80px] font-lato text-sm text-warm-brown bg-warm-cream/40 border-warm-sand/40 resize-none"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">Gratitude</Label>
              <Textarea
                value={gratitude}
                onChange={e => setGratitude(e.target.value)}
                placeholder="What are you grateful for?"
                className="min-h-[80px] font-lato text-sm text-warm-brown bg-warm-cream/40 border-warm-sand/40 resize-none"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">
                Tomorrow's Intention
              </Label>
              <input
                value={intention}
                onChange={e => setIntention(e.target.value)}
                placeholder="Set your intention for tomorrow..."
                className="w-full rounded-lg bg-warm-cream/40 border border-warm-sand/40 px-3 py-2 font-lato text-sm text-warm-brown placeholder:text-warm-brown/40 focus:outline-none focus:ring-1 focus:ring-warm-terracotta/40"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-warm-terracotta hover:bg-warm-terracotta/90 text-white font-lato"
            >
              {saveMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : 'Save Entry'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

function GrowthJournalTab() {
  const [date, setDate] = useState<Date>(new Date());
  const [lesson, setLesson] = useState('');
  const [growthArea, setGrowthArea] = useState<GrowthArea>(GrowthArea.mindset);
  const [actionStep, setActionStep] = useState('');
  const [growthRating, setGrowthRating] = useState(5);

  const { data: entries = [], isLoading } = useGetGrowthJournals();
  const saveMutation = useCreateOrUpdateGrowthJournal();

  const dateInt = dateToInt(date);

  React.useEffect(() => {
    const entry = entries.find(e => e.date === dateInt);
    if (entry) {
      setLesson(entry.lesson);
      setGrowthArea(entry.growthArea as GrowthArea);
      setActionStep(entry.actionStep);
      setGrowthRating(Number(entry.growthRating));
    } else {
      setLesson('');
      setGrowthArea(GrowthArea.mindset);
      setActionStep('');
      setGrowthRating(5);
    }
  }, [dateInt, entries]);

  const handleSave = async () => {
    const entry: GrowthJournalEntry = {
      date: dateInt,
      lesson,
      growthArea,
      actionStep,
      growthRating: BigInt(growthRating),
      isPublic: false,
    };
    try {
      await saveMutation.mutateAsync(entry);
      toast.success('Growth journal saved!');
    } catch {
      toast.error('Failed to save growth journal.');
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between flex-wrap gap-2">
        <h3 className="font-playfair text-lg text-warm-brown font-semibold">Growth Journal</h3>
        <DateNavigator date={date} onChange={setDate} />
      </div>
      <div className="rounded-2xl bg-white/70 border border-warm-sand/30 p-5 shadow-soft space-y-4">
        {isLoading ? (
          <Skeleton className="h-32 w-full" />
        ) : (
          <>
            <div className="space-y-2">
              <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">Growth Area</Label>
              <div className="flex flex-wrap gap-2">
                {GROWTH_AREA_OPTIONS.map(area => (
                  <button
                    key={area}
                    onClick={() => setGrowthArea(area)}
                    className={`px-3 py-1 rounded-full text-xs font-lato border transition-colors ${
                      growthArea === area
                        ? 'bg-warm-terracotta text-white border-warm-terracotta'
                        : 'bg-warm-cream/60 text-warm-brown border-warm-sand/40 hover:bg-warm-sand/30'
                    }`}
                  >
                    {area}
                  </button>
                ))}
              </div>
            </div>
            <div className="space-y-1">
              <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">
                Lesson Learned
              </Label>
              <Textarea
                value={lesson}
                onChange={e => setLesson(e.target.value)}
                placeholder="What did you learn today?"
                className="min-h-[100px] font-lato text-sm text-warm-brown bg-warm-cream/40 border-warm-sand/40 resize-none"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">Action Step</Label>
              <input
                value={actionStep}
                onChange={e => setActionStep(e.target.value)}
                placeholder="What will you do with this lesson?"
                className="w-full rounded-lg bg-warm-cream/40 border border-warm-sand/40 px-3 py-2 font-lato text-sm text-warm-brown placeholder:text-warm-brown/40 focus:outline-none focus:ring-1 focus:ring-warm-terracotta/40"
              />
            </div>
            <div className="space-y-1">
              <Label className="font-lato text-xs text-warm-brown/70 uppercase tracking-wide">
                Growth Rating: {growthRating}/10
              </Label>
              <input
                type="range"
                min={1}
                max={10}
                value={growthRating}
                onChange={e => setGrowthRating(Number(e.target.value))}
                className="w-full accent-warm-terracotta"
              />
            </div>
            <Button
              onClick={handleSave}
              disabled={saveMutation.isPending}
              className="bg-warm-terracotta hover:bg-warm-terracotta/90 text-white font-lato"
            >
              {saveMutation.isPending ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Saving...</>
              ) : 'Save Entry'}
            </Button>
          </>
        )}
      </div>
    </div>
  );
}

// ─── Partner Journal Section ──────────────────────────────────────────────────

interface PartnerJournalSectionProps {
  partnerName: string;
}

function PartnerJournalSection({ partnerName }: PartnerJournalSectionProps) {
  const [partnerDate, setPartnerDate] = useState<Date>(new Date());
  const { data: partnerJournals, isLoading } = useGetPartnerJournals(true);

  const daily = partnerJournals?.daily ?? [];
  const emotional = partnerJournals?.emotional ?? [];
  const night = partnerJournals?.night ?? [];
  const growth = partnerJournals?.growth ?? [];

  if (isLoading) {
    return (
      <div className="space-y-4">
        <Skeleton className="h-8 w-48" />
        <Skeleton className="h-64 w-full" />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center gap-2 mb-2">
        <Users className="w-4 h-4 text-warm-terracotta" />
        <span className="font-lato text-sm text-warm-brown/70">
          Viewing <span className="font-semibold text-warm-brown">{partnerName}'s</span> journal entries
        </span>
      </div>

      <Tabs defaultValue="daily" className="w-full">
        <TabsList className="bg-warm-cream/60 border border-warm-sand/30 rounded-xl p-1 mb-4 flex flex-wrap gap-1 h-auto">
          <TabsTrigger
            value="daily"
            className="flex items-center gap-1.5 font-lato text-xs data-[state=active]:bg-white data-[state=active]:text-warm-terracotta data-[state=active]:shadow-sm rounded-lg px-3 py-1.5"
          >
            <Calendar className="w-3.5 h-3.5" />
            Daily
          </TabsTrigger>
          <TabsTrigger
            value="emotional"
            className="flex items-center gap-1.5 font-lato text-xs data-[state=active]:bg-white data-[state=active]:text-warm-terracotta data-[state=active]:shadow-sm rounded-lg px-3 py-1.5"
          >
            <Heart className="w-3.5 h-3.5" />
            Emotional
          </TabsTrigger>
          <TabsTrigger
            value="night"
            className="flex items-center gap-1.5 font-lato text-xs data-[state=active]:bg-white data-[state=active]:text-warm-terracotta data-[state=active]:shadow-sm rounded-lg px-3 py-1.5"
          >
            <Moon className="w-3.5 h-3.5" />
            Night
          </TabsTrigger>
          <TabsTrigger
            value="growth"
            className="flex items-center gap-1.5 font-lato text-xs data-[state=active]:bg-white data-[state=active]:text-warm-terracotta data-[state=active]:shadow-sm rounded-lg px-3 py-1.5"
          >
            <Sprout className="w-3.5 h-3.5" />
            Growth
          </TabsTrigger>
        </TabsList>

        <TabsContent value="daily">
          <PartnerDailyView entries={daily} date={partnerDate} onDateChange={setPartnerDate} />
        </TabsContent>
        <TabsContent value="emotional">
          <PartnerEmotionalView entries={emotional} date={partnerDate} onDateChange={setPartnerDate} />
        </TabsContent>
        <TabsContent value="night">
          <PartnerNightView entries={night} date={partnerDate} onDateChange={setPartnerDate} />
        </TabsContent>
        <TabsContent value="growth">
          <PartnerGrowthView entries={growth} date={partnerDate} onDateChange={setPartnerDate} />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// ─── Main Page ────────────────────────────────────────────────────────────────

export default function JournalSection() {
  const [viewMode, setViewMode] = useState<'mine' | 'partner'>('mine');

  const { data: couple } = useGetCouple();
  const { data: partnerProfile } = useGetPartnerUserProfile();

  const isInCouple = !!couple;
  const partnerName = partnerProfile?.displayName || partnerProfile?.name || 'Partner';

  return (
    <div className="min-h-screen bg-warm-cream/30">
      <div className="max-w-3xl mx-auto px-4 py-8 space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between flex-wrap gap-4">
          <div>
            <h1 className="font-playfair text-3xl font-bold text-warm-brown">Journal</h1>
            <p className="font-lato text-sm text-warm-brown/60 mt-1">
              Reflect, grow, and capture your inner world.
            </p>
          </div>

          {isInCouple && (
            <div className="flex items-center gap-1 bg-white/80 border border-warm-sand/40 rounded-xl p-1 shadow-soft">
              <button
                onClick={() => setViewMode('mine')}
                className={`px-4 py-1.5 rounded-lg font-lato text-sm transition-colors ${
                  viewMode === 'mine'
                    ? 'bg-warm-terracotta text-white shadow-sm'
                    : 'text-warm-brown hover:bg-warm-cream/60'
                }`}
              >
                My Journal
              </button>
              <button
                onClick={() => setViewMode('partner')}
                className={`flex items-center gap-1.5 px-4 py-1.5 rounded-lg font-lato text-sm transition-colors ${
                  viewMode === 'partner'
                    ? 'bg-warm-terracotta text-white shadow-sm'
                    : 'text-warm-brown hover:bg-warm-cream/60'
                }`}
              >
                <Users className="w-3.5 h-3.5" />
                {partnerName}'s Journal
              </button>
            </div>
          )}
        </div>

        {/* Couple badge */}
        {isInCouple && (
          <div className="flex items-center gap-2">
            <Badge variant="secondary" className="font-lato text-xs bg-warm-sand/30 text-warm-brown border-warm-sand/40">
              💑 Couple Mode
            </Badge>
          </div>
        )}

        {/* Content */}
        {viewMode === 'partner' && isInCouple ? (
          <PartnerJournalSection partnerName={partnerName} />
        ) : (
          <Tabs defaultValue="daily" className="w-full">
            <TabsList className="bg-warm-cream/60 border border-warm-sand/30 rounded-xl p-1 mb-4 flex flex-wrap gap-1 h-auto">
              <TabsTrigger
                value="daily"
                className="flex items-center gap-1.5 font-lato text-sm data-[state=active]:bg-white data-[state=active]:text-warm-terracotta data-[state=active]:shadow-sm rounded-lg px-4 py-2"
              >
                <Calendar className="w-4 h-4" />
                Daily
              </TabsTrigger>
              <TabsTrigger
                value="emotional"
                className="flex items-center gap-1.5 font-lato text-sm data-[state=active]:bg-white data-[state=active]:text-warm-terracotta data-[state=active]:shadow-sm rounded-lg px-4 py-2"
              >
                <Heart className="w-4 h-4" />
                Emotional
              </TabsTrigger>
              <TabsTrigger
                value="night"
                className="flex items-center gap-1.5 font-lato text-sm data-[state=active]:bg-white data-[state=active]:text-warm-terracotta data-[state=active]:shadow-sm rounded-lg px-4 py-2"
              >
                <Moon className="w-4 h-4" />
                Night Reflection
              </TabsTrigger>
              <TabsTrigger
                value="growth"
                className="flex items-center gap-1.5 font-lato text-sm data-[state=active]:bg-white data-[state=active]:text-warm-terracotta data-[state=active]:shadow-sm rounded-lg px-4 py-2"
              >
                <Sprout className="w-4 h-4" />
                Growth
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
        )}
      </div>
    </div>
  );
}
