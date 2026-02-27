import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { useActor } from './useActor';
import { useInternetIdentity } from './useInternetIdentity';
import { Principal } from '@dfinity/principal';
import type { VisionBoardEntry, DailyPlannerEntry, UserProfile, Couple } from '../backend';

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

export function useGetDailyQuote() {
  const { actor, isFetching: actorFetching } = useActor();

  return useQuery<string>({
    queryKey: ['dailyQuote'],
    queryFn: async () => {
      if (!actor) return '';
      return actor.getDailyQuote();
    },
    enabled: !!actor && !actorFetching,
    staleTime: 1000 * 60 * 60, // 1 hour
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
