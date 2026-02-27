import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface VisionBoardEntry {
    progressPercentage: bigint;
    targetYear: bigint;
    category: GoalCategory;
    whyThisMatters: string;
    milestones: Array<string>;
}
export interface ScheduleItem {
    timeBlock: string;
    activity: string;
}
export interface Couple {
    partner1: Principal;
    partner2: Principal;
}
export interface Task {
    description: string;
    isComplete: boolean;
}
export interface DailyPlannerEntry {
    waterIntake: bigint;
    date: bigint;
    gratitudeEntries: Array<string>;
    topTasks: Array<Task>;
    journalEntry: string;
    notes: string;
    moodEmoji: string;
    schedule: Array<ScheduleItem>;
}
export interface UserProfile {
    displayName: string;
    name: string;
}
export enum GoalCategory {
    relationship = "relationship",
    spiritual = "spiritual",
    travel = "travel",
    personalGrowth = "personalGrowth",
    career = "career",
    financial = "financial",
    health = "health"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDailyPlannerEntry(entry: DailyPlannerEntry): Promise<void>;
    addVisionBoardEntry(entry: VisionBoardEntry): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCouple(partner1: Principal, partner2: Principal): Promise<void>;
    deleteDailyPlannerEntry(date: bigint): Promise<void>;
    deleteVisionBoardEntry(targetYear: bigint): Promise<void>;
    getAllCouples(): Promise<Array<Couple>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCouple(partner: Principal): Promise<Couple | null>;
    getDailyPlannerEntries(): Promise<Array<DailyPlannerEntry>>;
    getDailyQuote(): Promise<string>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getVisionBoardEntries(): Promise<Array<VisionBoardEntry>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateVisionBoardProgress(targetYear: bigint, progress: bigint): Promise<void>;
    updateWaterIntake(date: bigint, intake: bigint): Promise<void>;
}
