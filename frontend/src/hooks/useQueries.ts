import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import type {
  VisionBoardEntry,
  DailyPlannerEntry,
  YearlyEntry,
  MonthlyEntry,
  WeeklyEntry,
  UserProfile,
  DailyJournalEntry,
  EmotionalJournalEntry,
  NightReflectionJournalEntry,
  GrowthJournalEntry,
} from '../backend';
import { Principal } from '@dfinity/principal';

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

// ─── Couple ──────────────────────────────────────────────────────────────────

export function useGetCouple() {
  const { actor, isFetching } = useActor();

  return useQuery<{ partner1: Principal; partner2: Principal } | null>({
    queryKey: ['couple'],
    queryFn: async () => {
      if (!actor) return null;
      try {
        const identity = (actor as any)._identity;
        const principal = identity?.getPrincipal();
        if (!principal) return null;
        return actor.getCouple(principal);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching,
    retry: false,
  });
}

export function useCreateCouple() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partner1, partner2 }: { partner1: Principal; partner2: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      return actor.createCouple(partner1, partner2);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple'] });
    },
  });
}

// ─── Vision Board ────────────────────────────────────────────────────────────

export function useGetVisionBoardEntries(ownerPrincipal?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<VisionBoardEntry[]>({
    queryKey: ['visionBoardEntries', ownerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !ownerPrincipal) return [];
      return actor.getOwnerVisionBoardEntries(ownerPrincipal);
    },
    enabled: !!actor && !isFetching && !!ownerPrincipal,
  });
}

export function useGetPartnerVisionBoardEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<VisionBoardEntry[]>({
    queryKey: ['partnerVisionBoardEntries'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getPartnerVisionBoardEntries();
    },
    enabled: !!actor && !isFetching,
    retry: false,
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

// ─── Daily Planner ───────────────────────────────────────────────────────────

export function useGetDailyPlannerEntries(ownerPrincipal?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<DailyPlannerEntry[]>({
    queryKey: ['dailyPlannerEntries', ownerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !ownerPrincipal) return [];
      return actor.getOwnerDailyPlannerEntries(ownerPrincipal);
    },
    enabled: !!actor && !isFetching && !!ownerPrincipal,
  });
}

export function useGetPartnerDailyPlannerEntries(partnerPrincipal?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<DailyPlannerEntry[]>({
    queryKey: ['partnerDailyPlannerEntries', partnerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !partnerPrincipal) return [];
      return actor.getPartnerSpecificDailyPlannerEntries(partnerPrincipal);
    },
    enabled: !!actor && !isFetching && !!partnerPrincipal,
    retry: false,
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

// ─── Yearly Planner ──────────────────────────────────────────────────────────

export function useGetYearlyEntries(ownerPrincipal?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<YearlyEntry[]>({
    queryKey: ['yearlyEntries', ownerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !ownerPrincipal) return [];
      return actor.getOwnerYearlyEntries(ownerPrincipal);
    },
    enabled: !!actor && !isFetching && !!ownerPrincipal,
  });
}

export function useGetPartnerYearlyEntries(partnerPrincipal?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<YearlyEntry[]>({
    queryKey: ['partnerYearlyEntries', partnerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !partnerPrincipal) return [];
      return actor.getPartnerSpecificYearlyEntries(partnerPrincipal);
    },
    enabled: !!actor && !isFetching && !!partnerPrincipal,
    retry: false,
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

// ─── Monthly Planner ─────────────────────────────────────────────────────────

export function useGetMonthlyEntries(ownerPrincipal?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<MonthlyEntry[]>({
    queryKey: ['monthlyEntries', ownerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !ownerPrincipal) return [];
      return actor.getOwnerMonthlyEntries(ownerPrincipal);
    },
    enabled: !!actor && !isFetching && !!ownerPrincipal,
  });
}

export function useGetPartnerMonthlyEntries(partnerPrincipal?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<MonthlyEntry[]>({
    queryKey: ['partnerMonthlyEntries', partnerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !partnerPrincipal) return [];
      return actor.getPartnerSpecificMonthlyEntries(partnerPrincipal);
    },
    enabled: !!actor && !isFetching && !!partnerPrincipal,
    retry: false,
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
    mutationFn: async ({ year, month, entry }: { year: bigint; month: bigint; entry: MonthlyEntry }) => {
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

// ─── Weekly Planner ──────────────────────────────────────────────────────────

export function useGetWeeklyEntries(ownerPrincipal?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<WeeklyEntry[]>({
    queryKey: ['weeklyEntries', ownerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !ownerPrincipal) return [];
      return actor.getOwnerWeeklyEntries(ownerPrincipal);
    },
    enabled: !!actor && !isFetching && !!ownerPrincipal,
  });
}

export function useGetPartnerWeeklyEntries(partnerPrincipal?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<WeeklyEntry[]>({
    queryKey: ['partnerWeeklyEntries', partnerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !partnerPrincipal) return [];
      return actor.getPartnerSpecificWeeklyEntries(partnerPrincipal);
    },
    enabled: !!actor && !isFetching && !!partnerPrincipal,
    retry: false,
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
    mutationFn: async ({ year, weekNumber, entry }: { year: bigint; weekNumber: bigint; entry: WeeklyEntry }) => {
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

// ─── Daily Journal ───────────────────────────────────────────────────────────

export function useGetDailyJournals() {
  const { actor, isFetching } = useActor();

  return useQuery<DailyJournalEntry[]>({
    queryKey: ['dailyJournals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getDailyJournals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPartnerDailyJournals(partnerPrincipal?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<DailyJournalEntry[]>({
    queryKey: ['partnerDailyJournals', partnerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !partnerPrincipal) return [];
      return actor.getDailyJournalsForUser(partnerPrincipal);
    },
    enabled: !!actor && !isFetching && !!partnerPrincipal,
    retry: false,
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

// ─── Emotional Journal ───────────────────────────────────────────────────────

export function useGetEmotionalJournals() {
  const { actor, isFetching } = useActor();

  return useQuery<EmotionalJournalEntry[]>({
    queryKey: ['emotionalJournals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getEmotionalJournals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPartnerEmotionalJournals(partnerPrincipal?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<EmotionalJournalEntry[]>({
    queryKey: ['partnerEmotionalJournals', partnerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !partnerPrincipal) return [];
      return actor.getEmotionalJournalsForUser(partnerPrincipal);
    },
    enabled: !!actor && !isFetching && !!partnerPrincipal,
    retry: false,
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

// ─── Night Reflection Journal ────────────────────────────────────────────────

export function useGetNightReflections() {
  const { actor, isFetching } = useActor();

  return useQuery<NightReflectionJournalEntry[]>({
    queryKey: ['nightReflections'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getNightReflections();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPartnerNightReflections(partnerPrincipal?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<NightReflectionJournalEntry[]>({
    queryKey: ['partnerNightReflections', partnerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !partnerPrincipal) return [];
      return actor.getNightReflectionsForUser(partnerPrincipal);
    },
    enabled: !!actor && !isFetching && !!partnerPrincipal,
    retry: false,
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

// ─── Growth Journal ──────────────────────────────────────────────────────────

export function useGetGrowthJournals() {
  const { actor, isFetching } = useActor();

  return useQuery<GrowthJournalEntry[]>({
    queryKey: ['growthJournals'],
    queryFn: async () => {
      if (!actor) return [];
      return actor.getGrowthJournals();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPartnerGrowthJournals(partnerPrincipal?: Principal) {
  const { actor, isFetching } = useActor();

  return useQuery<GrowthJournalEntry[]>({
    queryKey: ['partnerGrowthJournals', partnerPrincipal?.toString()],
    queryFn: async () => {
      if (!actor || !partnerPrincipal) return [];
      return actor.getGrowthJournalsForUser(partnerPrincipal);
    },
    enabled: !!actor && !isFetching && !!partnerPrincipal,
    retry: false,
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

// ─── Daily Quote ─────────────────────────────────────────────────────────────

export function useGetDailyQuote() {
  const { actor, isFetching } = useActor();
  const now = new Date();
  const start = new Date(now.getFullYear(), 0, 0);
  const diff = now.getTime() - start.getTime();
  const oneDay = 1000 * 60 * 60 * 24;
  const dayOfYear = Math.floor(diff / oneDay);

  return useQuery<string>({
    queryKey: ['dailyQuote', dayOfYear],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getDailyQuote(BigInt(dayOfYear));
    },
    enabled: !!actor && !isFetching,
  });
}
