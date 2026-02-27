import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';
import type {
  VisionBoardEntry,
  DailyPlannerEntry,
  UserProfile,
  Couple,
  YearlyEntry,
  MonthlyEntry,
  WeeklyEntry,
  DailyJournalEntry,
  EmotionalJournalEntry,
  NightReflectionJournalEntry,
  GrowthJournalEntry,
} from '../backend';

// ─── User Profile ────────────────────────────────────────────────────────────

export function useGetCallerUserProfile() {
  const { actor, isFetching: actorFetching } = useActor();

  const query = useQuery<UserProfile | null>({
    queryKey: ['currentUserProfile'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getCallerUserProfile();
    },
    enabled: !!actor && !actorFetching,
    retry: false,
  });

  return {
    ...query,
    isLoading: actorFetching || query.isLoading,
    isFetched: !!actor && query.isFetched,
  };
}

export function useSaveCallerUserProfile() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (profile: UserProfile) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveCallerUserProfile(profile);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['currentUserProfile'] });
    },
  });
}

export function useGetUserProfile(principal: string | null) {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<UserProfile | null>({
    queryKey: ['userProfile', principal],
    queryFn: async () => {
      if (!actor || !principal) return null;
      try {
        return await actor.getUserProfile(Principal.fromText(principal));
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!principal,
    retry: false,
  });
}

// ─── Daily Quote ─────────────────────────────────────────────────────────────

function getDayOfYear(): number {
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  return Math.floor(diff / oneDay);
}

function getTodayDateString(): string {
  const now = new Date();
  return `${now.getFullYear()}-${now.getMonth() + 1}-${now.getDate()}`;
}

export function useGetDailyQuote() {
  const { actor, isFetching: actorFetching } = useActor();
  const todayString = getTodayDateString();
  const dayOfYear = getDayOfYear();

  return useQuery<string>({
    queryKey: ['dailyQuote', todayString],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getDailyQuote(BigInt(dayOfYear));
    },
    enabled: !!actor && !actorFetching,
    staleTime: 1000 * 60 * 60 * 24, // 24 hours — quote is stable for the whole day
  });
}

// ─── Vision Board ─────────────────────────────────────────────────────────────

export function useGetVisionBoardEntries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<VisionBoardEntry[]>({
    queryKey: ['visionBoardEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getVisionBoardEntries();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddVisionBoardEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: VisionBoardEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addVisionBoardEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visionBoardEntries'] });
    },
  });
}

export function useUpdateVisionBoardProgress() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ targetYear, progress }: { targetYear: bigint; progress: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateVisionBoardProgress(targetYear, progress);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visionBoardEntries'] });
    },
  });
}

export function useDeleteVisionBoardEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (targetYear: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteVisionBoardEntry(targetYear);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visionBoardEntries'] });
    },
  });
}

// ─── Daily Planner ────────────────────────────────────────────────────────────

export function useGetDailyPlannerEntries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DailyPlannerEntry[]>({
    queryKey: ['dailyPlannerEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDailyPlannerEntries();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddDailyPlannerEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: DailyPlannerEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addDailyPlannerEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyPlannerEntries'] });
    },
  });
}

export function useUpdateWaterIntake() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ date, intake }: { date: bigint; intake: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateWaterIntake(date, intake);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyPlannerEntries'] });
    },
  });
}

export function useDeleteDailyPlannerEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (date: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteDailyPlannerEntry(date);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyPlannerEntries'] });
    },
  });
}

// ─── Couples ──────────────────────────────────────────────────────────────────

export function useGetCouple() {
  const { actor, isFetching: actorFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<Couple | null>({
    queryKey: ['couple', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      try {
        return await actor.getCouple(identity.getPrincipal());
      } catch {
        return null;
      }
    },
    enabled: !!actor && !actorFetching && !!identity,
    retry: false,
  });
}

export function useCreateCouple() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partner1, partner2 }: { partner1: string; partner2: string }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCouple(
        Principal.fromText(partner1),
        Principal.fromText(partner2)
      );
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple'] });
    },
  });
}

// ─── Yearly Planner ───────────────────────────────────────────────────────────

export function useGetYearlyEntries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<YearlyEntry[]>({
    queryKey: ['yearlyEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getYearlyEntries();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddYearlyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: YearlyEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addYearlyEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['yearlyEntries'] });
    },
  });
}

export function useUpdateYearlyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ year, entry }: { year: bigint; entry: YearlyEntry }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateYearlyEntry(year, entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['yearlyEntries'] });
    },
  });
}

export function useDeleteYearlyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (year: bigint) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteYearlyEntry(year);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['yearlyEntries'] });
    },
  });
}

// ─── Monthly Planner ──────────────────────────────────────────────────────────

export function useGetMonthlyEntries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<MonthlyEntry[]>({
    queryKey: ['monthlyEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getMonthlyEntries();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddMonthlyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: MonthlyEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addMonthlyEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyEntries'] });
    },
  });
}

export function useUpdateMonthlyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      year,
      month,
      entry,
    }: {
      year: bigint;
      month: bigint;
      entry: MonthlyEntry;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateMonthlyEntry(year, month, entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyEntries'] });
    },
  });
}

export function useDeleteMonthlyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ year, month }: { year: bigint; month: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteMonthlyEntry(year, month);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['monthlyEntries'] });
    },
  });
}

// ─── Weekly Planner ───────────────────────────────────────────────────────────

export function useGetWeeklyEntries() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<WeeklyEntry[]>({
    queryKey: ['weeklyEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getWeeklyEntries();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useAddWeeklyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: WeeklyEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.addWeeklyEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyEntries'] });
    },
  });
}

export function useUpdateWeeklyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({
      year,
      weekNumber,
      entry,
    }: {
      year: bigint;
      weekNumber: bigint;
      entry: WeeklyEntry;
    }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.updateWeeklyEntry(year, weekNumber, entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyEntries'] });
    },
  });
}

export function useDeleteWeeklyEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ year, weekNumber }: { year: bigint; weekNumber: bigint }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.deleteWeeklyEntry(year, weekNumber);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['weeklyEntries'] });
    },
  });
}

// ─── Journal - Daily ──────────────────────────────────────────────────────────

export function useGetDailyJournals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<DailyJournalEntry[]>({
    queryKey: ['dailyJournals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDailyJournals();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateOrUpdateDailyJournal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: DailyJournalEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateDailyJournal(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['dailyJournals'] });
    },
  });
}

// ─── Journal - Emotional ──────────────────────────────────────────────────────

export function useGetEmotionalJournals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<EmotionalJournalEntry[]>({
    queryKey: ['emotionalJournals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEmotionalJournals();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateOrUpdateEmotionalJournal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: EmotionalJournalEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateEmotionalJournal(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['emotionalJournals'] });
    },
  });
}

// ─── Journal - Night Reflection ───────────────────────────────────────────────

export function useGetNightReflections() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<NightReflectionJournalEntry[]>({
    queryKey: ['nightReflections'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNightReflections();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateOrUpdateNightReflection() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: NightReflectionJournalEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateNightReflection(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['nightReflections'] });
    },
  });
}

// ─── Journal - Growth ─────────────────────────────────────────────────────────

export function useGetGrowthJournals() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<GrowthJournalEntry[]>({
    queryKey: ['growthJournals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGrowthJournals();
    },
    enabled: !!actor && !actorFetching,
  });
}

export function useCreateOrUpdateGrowthJournal() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: GrowthJournalEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createOrUpdateGrowthJournal(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['growthJournals'] });
    },
  });
}
