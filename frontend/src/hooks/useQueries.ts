import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import type {
  UserProfile,
  VisionBoardEntry,
  DailyPlannerEntry,
  YearlyEntry,
  MonthlyEntry,
  WeeklyEntry,
  DailyJournalEntry,
  EmotionalJournalEntry,
  NightReflectionJournalEntry,
  GrowthJournalEntry,
} from '../backend';
import { CoupleCreateError } from '../backend';
import { Principal } from '@dfinity/principal';

// ─── Custom Error ─────────────────────────────────────────────────────────────

export class CoupleCreateErrorException extends Error {
  constructor(public readonly variant: CoupleCreateError) {
    super(variant);
    this.name = 'CoupleCreateErrorException';
  }
}

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

export function useGetPartnerUserProfile() {
  const { actor, isFetching } = useActor();
  const { data: couple } = useGetCouple();

  const hasPartner = !!couple;

  return useQuery<UserProfile | null>({
    queryKey: ['partnerUserProfile', couple?.partner1?.toString(), couple?.partner2?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getPartnerUserProfile();
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && hasPartner,
    retry: false,
  });
}

// ─── Couple ───────────────────────────────────────────────────────────────────

export function useGetCouple() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery({
    queryKey: ['couple', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return null;
      const callerPrincipal = identity.getPrincipal();
      if (callerPrincipal.isAnonymous()) return null;
      try {
        return await actor.getCouple(callerPrincipal);
      } catch {
        return null;
      }
    },
    enabled: !!actor && !isFetching && !!identity,
    retry: false,
  });
}

export function useCreateCouple() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async ({ partner1, partner2 }: { partner1: Principal; partner2: Principal }) => {
      if (!actor) throw new Error('Actor not available');
      const result = await actor.createCouple(partner1, partner2);
      if (result !== null && result !== undefined) {
        throw new CoupleCreateErrorException(result as CoupleCreateError);
      }
      return result;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple'] });
    },
  });
}

export function useDissolveCouple() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async () => {
      if (!actor) throw new Error('Actor not available');
      const dissolved = await actor.dissolveCouple();
      if (!dissolved) {
        throw new Error('You are not currently in a couple.');
      }
      return dissolved;
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['couple'] });
      queryClient.invalidateQueries({ queryKey: ['partnerVisionBoardEntries'] });
      queryClient.invalidateQueries({ queryKey: ['partnerDailyPlannerEntries'] });
      queryClient.invalidateQueries({ queryKey: ['partnerDailyPlannerForDate'] });
      queryClient.invalidateQueries({ queryKey: ['partnerMonthlyEntries'] });
      queryClient.invalidateQueries({ queryKey: ['partnerWeeklyEntries'] });
      queryClient.invalidateQueries({ queryKey: ['partnerYearlyEntries'] });
      queryClient.invalidateQueries({ queryKey: ['partnerJournals'] });
      queryClient.invalidateQueries({ queryKey: ['partnerUserProfile'] });
    },
  });
}

// ─── Daily Quote ──────────────────────────────────────────────────────────────

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
      if (!actor) throw new Error('Actor not available');
      return actor.getDailyQuote(BigInt(dayOfYear));
    },
    enabled: !!actor && !isFetching,
    staleTime: 1000 * 60 * 60,
  });
}

// ─── Vision Board ─────────────────────────────────────────────────────────────

export function useGetVisionBoardEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<VisionBoardEntry[]>({
    queryKey: ['visionBoardEntries'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getVisionBoardEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPartnerVisionBoardEntries() {
  const { actor, isFetching } = useActor();
  const { data: couple } = useGetCouple();

  const hasPartner = !!couple;

  return useQuery<VisionBoardEntry[]>({
    queryKey: ['partnerVisionBoardEntries', couple?.partner1?.toString(), couple?.partner2?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      try {
        return await actor.getPartnerVisionBoardEntries();
      } catch {
        return [];
      }
    },
    enabled: !!actor && !isFetching && hasPartner,
  });
}

export function useSaveVisionBoardEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: VisionBoardEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveVisionBoardEntry(entry);
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['visionBoardEntries'] });
    },
  });
}

// Keep alias for backward compatibility
export const useAddVisionBoardEntry = useSaveVisionBoardEntry;

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
  const { actor, isFetching } = useActor();

  return useQuery<DailyPlannerEntry[]>({
    queryKey: ['dailyPlannerEntries'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDailyPlannerEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPartnerDailyPlannerEntries() {
  const { actor, isFetching } = useActor();
  const { data: couple } = useGetCouple();

  const hasPartner = !!couple;

  return useQuery<DailyPlannerEntry[]>({
    queryKey: ['partnerDailyPlannerEntries', couple?.partner1?.toString(), couple?.partner2?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPartnerDailyPlannerEntries();
    },
    enabled: !!actor && !isFetching && hasPartner,
  });
}

export function usePartnerDailyPlannerForDate(date: bigint) {
  const { actor, isFetching } = useActor();
  const { data: couple } = useGetCouple();

  const hasPartner = !!couple;

  return useQuery<DailyPlannerEntry | null>({
    queryKey: ['partnerDailyPlannerForDate', couple?.partner1?.toString(), couple?.partner2?.toString(), date.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPartnerDailyPlannerEntryForDate(date);
    },
    enabled: !!actor && !isFetching && hasPartner,
  });
}

export function useSaveDailyPlannerEntry() {
  const { actor } = useActor();
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: async (entry: DailyPlannerEntry) => {
      if (!actor) throw new Error('Actor not available');
      return actor.saveDailyPlannerEntry(entry);
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

// ─── Yearly Planner ───────────────────────────────────────────────────────────

export function useGetYearlyEntries() {
  const { actor, isFetching } = useActor();
  const { identity } = useInternetIdentity();

  return useQuery<YearlyEntry[]>({
    queryKey: ['yearlyEntries', identity?.getPrincipal().toString()],
    queryFn: async () => {
      if (!actor || !identity) return [];
      const callerPrincipal = identity.getPrincipal();
      if (callerPrincipal.isAnonymous()) return [];
      return actor.getOwnerYearlyEntries(callerPrincipal);
    },
    enabled: !!actor && !isFetching && !!identity,
  });
}

export function useGetPartnerYearlyEntries() {
  const { actor, isFetching } = useActor();
  const { data: couple } = useGetCouple();

  const hasPartner = !!couple;

  return useQuery<YearlyEntry[]>({
    queryKey: ['partnerYearlyEntries', couple?.partner1?.toString(), couple?.partner2?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPartnerYearlyEntries();
    },
    enabled: !!actor && !isFetching && hasPartner,
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
  const { actor, isFetching } = useActor();

  return useQuery<MonthlyEntry[]>({
    queryKey: ['monthlyEntries'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getMonthlyEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPartnerMonthlyEntries() {
  const { actor, isFetching } = useActor();
  const { data: couple } = useGetCouple();

  const hasPartner = !!couple;

  return useQuery<MonthlyEntry[]>({
    queryKey: ['partnerMonthlyEntries', couple?.partner1?.toString(), couple?.partner2?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPartnerMonthlyEntries();
    },
    enabled: !!actor && !isFetching && hasPartner,
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

// ─── Weekly Planner ───────────────────────────────────────────────────────────

export function useGetWeeklyEntries() {
  const { actor, isFetching } = useActor();

  return useQuery<WeeklyEntry[]>({
    queryKey: ['weeklyEntries'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getWeeklyEntries();
    },
    enabled: !!actor && !isFetching,
  });
}

export function useGetPartnerWeeklyEntries() {
  const { actor, isFetching } = useActor();
  const { data: couple } = useGetCouple();

  const hasPartner = !!couple;

  return useQuery<WeeklyEntry[]>({
    queryKey: ['partnerWeeklyEntries', couple?.partner1?.toString(), couple?.partner2?.toString()],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getPartnerWeeklyEntries();
    },
    enabled: !!actor && !isFetching && hasPartner,
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

// ─── Journal ──────────────────────────────────────────────────────────────────

export function useGetDailyJournals() {
  const { actor, isFetching } = useActor();

  return useQuery<DailyJournalEntry[]>({
    queryKey: ['dailyJournals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getDailyJournals();
    },
    enabled: !!actor && !isFetching,
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

export function useGetEmotionalJournals() {
  const { actor, isFetching } = useActor();

  return useQuery<EmotionalJournalEntry[]>({
    queryKey: ['emotionalJournals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getEmotionalJournals();
    },
    enabled: !!actor && !isFetching,
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

export function useGetNightReflections() {
  const { actor, isFetching } = useActor();

  return useQuery<NightReflectionJournalEntry[]>({
    queryKey: ['nightReflections'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getNightReflections();
    },
    enabled: !!actor && !isFetching,
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

export function useGetGrowthJournals() {
  const { actor, isFetching } = useActor();

  return useQuery<GrowthJournalEntry[]>({
    queryKey: ['growthJournals'],
    queryFn: async () => {
      if (!actor) throw new Error('Actor not available');
      return actor.getGrowthJournals();
    },
    enabled: !!actor && !isFetching,
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

// ─── Partner Journals ─────────────────────────────────────────────────────────

export function useGetPartnerJournals(enabled: boolean) {
  const { actor, isFetching } = useActor();
  const { data: couple } = useGetCouple();

  const hasPartner = !!couple;

  return useQuery<{
    daily: DailyJournalEntry[];
    emotional: EmotionalJournalEntry[];
    night: NightReflectionJournalEntry[];
    growth: GrowthJournalEntry[];
  }>({
    queryKey: ['partnerJournals', couple?.partner1?.toString(), couple?.partner2?.toString()],
    queryFn: async () => {
      if (!actor) return { daily: [], emotional: [], night: [], growth: [] };
      try {
        return await actor.getPartnerJournals();
      } catch {
        return { daily: [], emotional: [], night: [], growth: [] };
      }
    },
    enabled: !!actor && !isFetching && hasPartner && enabled,
  });
}
