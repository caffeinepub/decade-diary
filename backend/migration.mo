import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Int "mo:core/Int";
import Nat "mo:core/Nat";

module {
  type Budget = {
    income : Nat;
    expenses : [Text];
    notes : Text;
  };

  type DailyJournalEntry = {
    date : Int;
    body : Text;
    isPublic : Bool;
  };

  type DailyPlannerEntry = {
    date : Int;
    schedule : [ScheduleItem];
    tasks : [Task];
    notes : Text;
    waterIntake : Nat;
    moodEmoji : Text;
    gratitudeEntries : [Text];
    journalEntry : Text;
  };

  type EmotionalJournalEntry = {
    date : Int;
    emotion : {
      #happy;
      #anxious;
      #grateful;
      #sad;
      #calm;
      #angry;
      #excited;
      #frustrated;
      #peaceful;
      #motivated;
      #overwhelmed;
      #content;
      #fearful;
      #optimistic;
      #disappointed;
    };
    intensity : Nat;
    trigger : Text;
    reflection : Text;
    isPublic : Bool;
  };

  type GrowthJournalEntry = {
    date : Int;
    lesson : Text;
    growthArea : {
      #career;
      #relationships;
      #health;
      #mindset;
      #spiritual;
      #other;
    };
    actionStep : Text;
    growthRating : Nat;
    isPublic : Bool;
  };

  type HabitWeekly = {
    name : Text;
    dailyCheckIns : [Bool];
  };

  type HabitYearly = {
    name : Text;
    monthlyCheckIns : [Bool];
  };

  type ImportantDate = {
    date : Int;
    labelText : Text;
  };

  type MonthlyEntry = {
    year : Int;
    month : Nat;
    goals : [Task];
    importantDates : [ImportantDate];
    budget : Budget;
    moodTracker : [Text];
    reflection : Text;
  };

  type NightReflectionJournalEntry = {
    date : Int;
    highlights : [Text];
    improvements : Text;
    gratitude : Text;
    intention : Text;
    isPublic : Bool;
  };

  type ScheduleItem = {
    timeBlock : Text;
    activity : Text;
  };

  type Task = {
    description : Text;
    isComplete : Bool;
  };

  type WeeklyEntry = {
    year : Int;
    weekNumber : Nat;
    priorities : [Task];
    habitTracker : [HabitWeekly];
    todos : [Task];
    reflection : Text;
    energyRating : Nat;
  };

  type YearlyEntry = {
    year : Int;
    wordOfTheYear : Text;
    majorGoals : [Task];
    visionImages : [Text];
    habitTracker : [HabitYearly];
    reflection : Text;
  };

  type UserProfile = {
    name : Text;
    displayName : Text;
  };

  public type OldVisionBoardEntry = {
    category : {
      #career;
      #financial;
      #health;
      #relationship;
      #personalGrowth;
      #travel;
      #spiritual;
    };
    targetYear : Int;
    milestones : [Text];
    whyThisMatters : Text;
    progressPercentage : Nat;
  };

  public type OldActor = {
    couples : Map.Map<Principal, { partner1 : Principal; partner2 : Principal }>;
    userProfiles : Map.Map<Principal, UserProfile>;
    visionBoardEntries : Map.Map<Principal, List.List<OldVisionBoardEntry>>;
    dailyPlannerEntries : Map.Map<Principal, List.List<DailyPlannerEntry>>;
    yearlyEntries : Map.Map<Principal, List.List<YearlyEntry>>;
    monthlyEntries : Map.Map<Principal, List.List<MonthlyEntry>>;
    weeklyEntries : Map.Map<Principal, List.List<WeeklyEntry>>;
    dailyJournalEntries : Map.Map<Principal, List.List<DailyJournalEntry>>;
    emotionalJournalEntries : Map.Map<Principal, List.List<EmotionalJournalEntry>>;
    nightReflectionEntries : Map.Map<Principal, List.List<NightReflectionJournalEntry>>;
    growthJournalEntries : Map.Map<Principal, List.List<GrowthJournalEntry>>;
    quotes : [Text];
  };

  // New types
  type NewVisionBoardEntry = {
    category : {
      #career;
      #financial;
      #health;
      #relationship;
      #personalGrowth;
      #travel;
      #spiritual;
    };
    targetYear : Int;
    milestones : [Text];
    whyThisMatters : Text;
    progressPercentage : Nat;
  };

  type NewActor = {
    couples : Map.Map<Principal, { partner1 : Principal; partner2 : Principal }>;
    userProfiles : Map.Map<Principal, UserProfile>;
    visionBoardEntries : Map.Map<Principal, List.List<NewVisionBoardEntry>>;
    dailyPlannerEntries : Map.Map<Principal, List.List<DailyPlannerEntry>>;
    yearlyEntries : Map.Map<Principal, List.List<YearlyEntry>>;
    monthlyEntries : Map.Map<Principal, List.List<MonthlyEntry>>;
    weeklyEntries : Map.Map<Principal, List.List<WeeklyEntry>>;
    dailyJournalEntries : Map.Map<Principal, List.List<DailyJournalEntry>>;
    emotionalJournalEntries : Map.Map<Principal, List.List<EmotionalJournalEntry>>;
    nightReflectionEntries : Map.Map<Principal, List.List<NightReflectionJournalEntry>>;
    growthJournalEntries : Map.Map<Principal, List.List<GrowthJournalEntry>>;
    quotes : [Text];
  };

  public func run(old : OldActor) : NewActor {
    {
      couples = old.couples;
      userProfiles = old.userProfiles;
      visionBoardEntries = old.visionBoardEntries;
      dailyPlannerEntries = old.dailyPlannerEntries;
      yearlyEntries = old.yearlyEntries;
      monthlyEntries = old.monthlyEntries;
      weeklyEntries = old.weeklyEntries;
      dailyJournalEntries = old.dailyJournalEntries;
      emotionalJournalEntries = old.emotionalJournalEntries;
      nightReflectionEntries = old.nightReflectionEntries;
      growthJournalEntries = old.growthJournalEntries;
      quotes = old.quotes;
    };
  };
};
