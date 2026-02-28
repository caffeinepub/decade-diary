import type { Principal } from "@icp-sdk/core/principal";
export interface Some<T> {
    __kind__: "Some";
    value: T;
}
export interface None {
    __kind__: "None";
}
export type Option<T> = Some<T> | None;
export interface Budget {
    expenses: Array<string>;
    income: bigint;
    notes: string;
}
export interface ImportantDate {
    date: bigint;
    labelText: string;
}
export interface GrowthJournalEntry {
    growthRating: bigint;
    date: bigint;
    actionStep: string;
    lesson: string;
    isPublic: boolean;
    growthArea: GrowthArea;
}
export interface Task {
    description: string;
    isComplete: boolean;
}
export interface EmotionalJournalEntry {
    trigger: string;
    emotion: EmotionTag;
    date: bigint;
    isPublic: boolean;
    reflection: string;
    intensity: bigint;
}
export interface WeeklyEntry {
    todos: Array<Task>;
    year: bigint;
    weekNumber: bigint;
    energyRating: bigint;
    reflection: string;
    priorities: Array<Task>;
    habitTracker: Array<HabitWeekly>;
}
export interface DailyJournalEntry {
    body: string;
    date: bigint;
    isPublic: boolean;
}
export interface MonthlyEntry {
    month: bigint;
    year: bigint;
    moodTracker: Array<string>;
    goals: Array<Task>;
    importantDates: Array<ImportantDate>;
    budget: Budget;
    reflection: string;
}
export interface YearlyEntry {
    majorGoals: Array<Task>;
    year: bigint;
    reflection: string;
    habitTracker: Array<HabitYearly>;
    wordOfTheYear: string;
    visionImages: Array<string>;
}
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
export interface NightReflectionJournalEntry {
    gratitude: string;
    date: bigint;
    improvements: string;
    highlights: Array<string>;
    isPublic: boolean;
    intention: string;
}
export interface Couple {
    partner1: Principal;
    partner2: Principal;
}
export interface HabitWeekly {
    name: string;
    dailyCheckIns: Array<boolean>;
}
export interface DailyPlannerEntry {
    tasks: Array<Task>;
    waterIntake: bigint;
    date: bigint;
    gratitudeEntries: Array<string>;
    journalEntry: string;
    notes: string;
    moodEmoji: string;
    schedule: Array<ScheduleItem>;
}
export interface UserProfile {
    displayName: string;
    name: string;
}
export interface HabitYearly {
    name: string;
    monthlyCheckIns: Array<boolean>;
}
export enum EmotionTag {
    sad = "sad",
    fearful = "fearful",
    content = "content",
    anxious = "anxious",
    happy = "happy",
    angry = "angry",
    disappointed = "disappointed",
    calm = "calm",
    grateful = "grateful",
    peaceful = "peaceful",
    overwhelmed = "overwhelmed",
    motivated = "motivated",
    frustrated = "frustrated",
    excited = "excited",
    optimistic = "optimistic"
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
export enum GrowthArea {
    spiritual = "spiritual",
    other = "other",
    mindset = "mindset",
    career = "career",
    relationships = "relationships",
    health = "health"
}
export enum UserRole {
    admin = "admin",
    user = "user",
    guest = "guest"
}
export interface backendInterface {
    addDailyPlannerEntry(entry: DailyPlannerEntry): Promise<void>;
    addMonthlyEntry(entry: MonthlyEntry): Promise<void>;
    addVisionBoardEntry(entry: VisionBoardEntry): Promise<void>;
    addWeeklyEntry(entry: WeeklyEntry): Promise<void>;
    addYearlyEntry(entry: YearlyEntry): Promise<void>;
    assignCallerUserRole(user: Principal, role: UserRole): Promise<void>;
    createCouple(partner1: Principal, partner2: Principal): Promise<void>;
    createOrUpdateDailyJournal(entry: DailyJournalEntry): Promise<void>;
    createOrUpdateEmotionalJournal(entry: EmotionalJournalEntry): Promise<void>;
    createOrUpdateGrowthJournal(entry: GrowthJournalEntry): Promise<void>;
    createOrUpdateNightReflection(entry: NightReflectionJournalEntry): Promise<void>;
    deleteDailyPlannerEntry(date: bigint): Promise<void>;
    deleteMonthlyEntry(year: bigint, month: bigint): Promise<void>;
    deleteVisionBoardEntry(targetYear: bigint): Promise<void>;
    deleteWeeklyEntry(year: bigint, weekNumber: bigint): Promise<void>;
    deleteYearlyEntry(year: bigint): Promise<void>;
    getAllCouples(): Promise<Array<Couple>>;
    getCallerUserProfile(): Promise<UserProfile | null>;
    getCallerUserRole(): Promise<UserRole>;
    getCouple(partner: Principal): Promise<Couple | null>;
    getDailyJournals(): Promise<Array<DailyJournalEntry>>;
    getDailyJournalsForUser(user: Principal): Promise<Array<DailyJournalEntry>>;
    getDailyQuote(dayOfYear: bigint): Promise<string>;
    getEmotionalJournals(): Promise<Array<EmotionalJournalEntry>>;
    getEmotionalJournalsForUser(user: Principal): Promise<Array<EmotionalJournalEntry>>;
    getGrowthJournals(): Promise<Array<GrowthJournalEntry>>;
    getGrowthJournalsForUser(user: Principal): Promise<Array<GrowthJournalEntry>>;
    getMonthlyEntries(): Promise<Array<MonthlyEntry>>;
    getNightReflections(): Promise<Array<NightReflectionJournalEntry>>;
    getNightReflectionsForUser(user: Principal): Promise<Array<NightReflectionJournalEntry>>;
    getOwnerDailyPlannerEntries(owner: Principal): Promise<Array<DailyPlannerEntry>>;
    getOwnerMonthlyEntries(owner: Principal): Promise<Array<MonthlyEntry>>;
    getOwnerVisionBoardEntries(owner: Principal): Promise<Array<VisionBoardEntry>>;
    getOwnerWeeklyEntries(owner: Principal): Promise<Array<WeeklyEntry>>;
    getOwnerYearlyEntries(owner: Principal): Promise<Array<YearlyEntry>>;
    getPartnerSpecificDailyPlannerEntries(owner: Principal): Promise<Array<DailyPlannerEntry>>;
    getPartnerSpecificMonthlyEntries(owner: Principal): Promise<Array<MonthlyEntry>>;
    getPartnerSpecificWeeklyEntries(owner: Principal): Promise<Array<WeeklyEntry>>;
    getPartnerSpecificYearlyEntries(owner: Principal): Promise<Array<YearlyEntry>>;
    getPartnerVisionBoardEntries(): Promise<Array<VisionBoardEntry>>;
    getUserProfile(user: Principal): Promise<UserProfile | null>;
    getWeeklyEntries(): Promise<Array<WeeklyEntry>>;
    getYearlyEntries(): Promise<Array<YearlyEntry>>;
    isCallerAdmin(): Promise<boolean>;
    saveCallerUserProfile(profile: UserProfile): Promise<void>;
    updateMonthlyEntry(year: bigint, month: bigint, updatedEntry: MonthlyEntry): Promise<void>;
    updateVisionBoardProgress(targetYear: bigint, progress: bigint): Promise<void>;
    updateWaterIntake(date: bigint, intake: bigint): Promise<void>;
    updateWeeklyEntry(year: bigint, weekNumber: bigint, updatedEntry: WeeklyEntry): Promise<void>;
    updateYearlyEntry(year: bigint, updatedEntry: YearlyEntry): Promise<void>;
}
