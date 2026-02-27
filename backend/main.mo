import Text "mo:core/Text";
import Nat "mo:core/Nat";
import Map "mo:core/Map";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
import Order "mo:core/Order";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  // ------------------------- Authorization Setup ----------------------
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  // ------------------------- Types ------------------------

  public type UserProfile = {
    name : Text;
    displayName : Text;
  };

  public type Couple = {
    partner1 : Principal;
    partner2 : Principal;
  };

  module Couple {
    public func compareByDescription(couple1 : Couple, couple2 : Couple) : Order.Order {
      switch (Principal.compare(couple1.partner1, couple2.partner1)) {
        case (#equal) { Principal.compare(couple1.partner2, couple2.partner2) };
        case (order) { order };
      };
    };
  };

  public type GoalCategory = {
    #career;
    #financial;
    #health;
    #relationship;
    #personalGrowth;
    #travel;
    #spiritual;
  };

  public type VisionBoardEntry = {
    category : GoalCategory;
    targetYear : Int;
    milestones : [Text];
    whyThisMatters : Text;
    progressPercentage : Nat;
  };

  public type Task = {
    description : Text;
    isComplete : Bool;
  };

  public type ScheduleItem = {
    timeBlock : Text;
    activity : Text;
  };

  public type DailyPlannerEntry = {
    date : Int;
    schedule : [ScheduleItem];
    tasks : [Task];
    notes : Text;
    waterIntake : Nat;
    moodEmoji : Text;
    gratitudeEntries : [Text];
    journalEntry : Text;
  };

  public type YearlyEntry = {
    year : Int;
    wordOfTheYear : Text;
    majorGoals : [Task];
    visionImages : [Text];
    habitTracker : [HabitYearly];
    reflection : Text;
  };

  public type HabitYearly = {
    name : Text;
    monthlyCheckIns : [Bool]; // 12 months
  };

  public type MonthlyEntry = {
    year : Int;
    month : Nat;
    goals : [Task];
    importantDates : [ImportantDate];
    budget : Budget;
    moodTracker : [Text];
    reflection : Text;
  };

  public type ImportantDate = {
    date : Int;
    labelText : Text;
  };

  public type Budget = {
    income : Nat;
    expenses : [Text]; // Simple line items
    notes : Text;
  };

  public type WeeklyEntry = {
    year : Int;
    weekNumber : Nat;
    priorities : [Task];
    habitTracker : [HabitWeekly];
    todos : [Task];
    reflection : Text;
    energyRating : Nat;
  };

  public type HabitWeekly = {
    name : Text;
    dailyCheckIns : [Bool]; // 7 days
  };

  public type Quote = {
    quoteText : Text;
  };

  // --------------------------- Journal Types --------------------------

  public type EmotionTag = {
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

  public type GrowthArea = {
    #career;
    #relationships;
    #health;
    #mindset;
    #spiritual;
    #other;
  };

  public type DailyJournalEntry = {
    date : Int;
    body : Text;
    isPublic : Bool;
  };

  public type EmotionalJournalEntry = {
    date : Int;
    emotion : EmotionTag;
    intensity : Nat; // 1-5
    trigger : Text;
    reflection : Text;
    isPublic : Bool;
  };

  public type NightReflectionJournalEntry = {
    date : Int;
    highlights : [Text];
    improvements : Text;
    gratitude : Text;
    intention : Text;
    isPublic : Bool;
  };

  public type GrowthJournalEntry = {
    date : Int;
    lesson : Text;
    growthArea : GrowthArea;
    actionStep : Text;
    growthRating : Nat; // 1-5
    isPublic : Bool;
  };

  // ------------------------- State -----------------------

  let userProfiles = Map.empty<Principal, UserProfile>();
  let couples = Map.empty<Principal, Couple>();
  let visionBoardEntries = Map.empty<Principal, List.List<VisionBoardEntry>>();
  let dailyPlannerEntries = Map.empty<Principal, List.List<DailyPlannerEntry>>();
  let yearlyEntries = Map.empty<Principal, List.List<YearlyEntry>>();
  let monthlyEntries = Map.empty<Principal, List.List<MonthlyEntry>>();
  let weeklyEntries = Map.empty<Principal, List.List<WeeklyEntry>>();

  // Journaling state maps
  let dailyJournalEntries = Map.empty<Principal, List.List<DailyJournalEntry>>();
  let emotionalJournalEntries = Map.empty<Principal, List.List<EmotionalJournalEntry>>();
  let nightReflectionEntries = Map.empty<Principal, List.List<NightReflectionJournalEntry>>();
  let growthJournalEntries = Map.empty<Principal, List.List<GrowthJournalEntry>>();

  let quotes = [
    "The best vision is insight. – Malcolm Forbes",
    "Dream big, start small, act now.",
    "Your life does not get better by chance, it gets better by change. – Jim Rohn",
    "Success is the sum of small efforts, repeated day in and day out. – Robert Collier",
    "Clarity about your future creates motivation in your present.",
    "It's never too late to be what you might have been. – George Eliot",
    "Make your vision so clear that your fears become irrelevant.",
    "Motivation is what gets you started. Habit is what keeps you going. – Jim Ryun",
    "Your dreams are worth fighting for.",
    "The future belongs to those who believe in the beauty of their dreams. – Eleanor Roosevelt",
    "Go the extra mile. It's never crowded.",
    "What you focus on expands.",
    "Action is the foundational key to all success. – Pablo Picasso",
    "A goal without a plan is just a wish. – Antoine de Saint-Exupéry",
    "The only limits in life are the ones you make.",
    "Progress, not perfection.",
    "Every accomplishment starts with the decision to try.",
    "Create the highest, grandest vision possible for your life.",
    "Your only limit is you.",
    "Do something today that your future self will thank you for.",
    "Small steps every day lead to big results.",
    "Discipline is the bridge between goals and accomplishment. – Jim Rohn",
    "The secret of getting ahead is getting started. – Mark Twain",
    "Live your vision, love your life.",
    "Persistence guarantees that results are inevitable.",
    "Don't just wish for it, work for it.",
    "Your potential is endless.",
    "Focus on the possibilities, not the obstacles.",
    "The journey of a thousand miles begins with one step. – Lao Tzu",
    "Let your vision be greater than your fears:",
  ];

  // ------------------------- Helper Functions ------------------------

  func getPartner(caller : Principal) : ?Principal {
    if (caller.isAnonymous()) { return null };
    switch (couples.get(caller)) {
      case (null) { null };
      case (?couple) {
        if (couple.partner1 == caller) { ?couple.partner2 } else { ?couple.partner1 };
      };
    };
  };

  // Returns true if caller can view an entry owned by `owner`:
  // - caller is the owner, OR
  // - the entry is marked public, OR
  // - caller is the active couple partner of owner (couple-shared read, regardless of public flag)
  func canViewEntry(caller : Principal, owner : Principal, entryIsPublic : Bool) : Bool {
    if (caller == owner) { return true };
    if (entryIsPublic) { return true };
    // Couple-shared read: caller and owner must be in the same couple
    if (not caller.isAnonymous()) {
      switch (couples.get(caller)) {
        case (null) { false };
        case (?couple) {
          (caller == couple.partner1 or caller == couple.partner2) and
          (owner == couple.partner1 or owner == couple.partner2);
        };
      };
    } else {
      false;
    };
  };

  // ------------------------- User Profile Management -----------------------

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Can only view your own profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  // ------------------------- Couples Management -----------------------

  public shared ({ caller }) func createCouple(partner1 : Principal, partner2 : Principal) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create couples");
    };
    if (partner1.isAnonymous() or partner2.isAnonymous()) {
      Runtime.trap("Anonymous principals cannot be part of a couple");
    };
    if (caller != partner1 and caller != partner2 and not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only a partner or admin can create a couple");
    };
    if (couples.get(partner1) != null or couples.get(partner2) != null) {
      Runtime.trap("One or both partners are already in a couple");
    };

    let newCouple : Couple = {
      partner1;
      partner2;
    };

    couples.add(partner1, newCouple);
    couples.add(partner2, newCouple);
  };

  public query ({ caller }) func getCouple(partner : Principal) : async ?Couple {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view couple information");
    };
    if (caller != partner and not AccessControl.isAdmin(accessControlState, caller)) {
      let callerCouple = couples.get(caller);
      switch (callerCouple) {
        case (null) {
          Runtime.trap("Unauthorized: You can only view your own couple");
        };
        case (?c) {
          if (c.partner1 != partner and c.partner2 != partner) {
            Runtime.trap("Unauthorized: You can only view your own couple");
          };
        };
      };
    };
    couples.get(partner);
  };

  public query ({ caller }) func getAllCouples() : async [Couple] {
    if (not AccessControl.isAdmin(accessControlState, caller)) {
      Runtime.trap("Unauthorized: Only admins can view all couples");
    };
    couples.values().toArray();
  };

  // ------------------- Journaling - Daily Journal ---------------------

  public shared ({ caller }) func createOrUpdateDailyJournal(entry : DailyJournalEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create journal entries");
    };
    let entries = switch (dailyJournalEntries.get(caller)) {
      case (null) { List.empty<DailyJournalEntry>() };
      case (?existing) { existing };
    };

    let filteredEntries = entries.filter(
      func(e) { e.date != entry.date }
    );

    filteredEntries.add(entry);
    dailyJournalEntries.add(caller, filteredEntries);
  };

  public query ({ caller }) func getDailyJournals() : async [DailyJournalEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their journal entries");
    };
    switch (dailyJournalEntries.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  // Returns entries owned by `user` that the caller is permitted to see.
  // Caller must be an authenticated user (not anonymous) to use couple-shared reads.
  // Public entries are visible to anyone authenticated; couple entries visible to partner.
  public query ({ caller }) func getDailyJournalsForUser(user : Principal) : async [DailyJournalEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view journal entries");
    };
    switch (dailyJournalEntries.get(user)) {
      case (null) { [] };
      case (?entries) {
        entries.filter(
          func(e) { canViewEntry(caller, user, e.isPublic) }
        ).toArray();
      };
    };
  };

  // ------------------- Journaling - Emotional Journal ----------------

  public shared ({ caller }) func createOrUpdateEmotionalJournal(entry : EmotionalJournalEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create journal entries");
    };
    let entries = switch (emotionalJournalEntries.get(caller)) {
      case (null) { List.empty<EmotionalJournalEntry>() };
      case (?existing) { existing };
    };

    let filteredEntries = entries.filter(
      func(e) { e.date != entry.date }
    );

    filteredEntries.add(entry);
    emotionalJournalEntries.add(caller, filteredEntries);
  };

  public query ({ caller }) func getEmotionalJournals() : async [EmotionalJournalEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their journal entries");
    };
    switch (emotionalJournalEntries.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public query ({ caller }) func getEmotionalJournalsForUser(user : Principal) : async [EmotionalJournalEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view journal entries");
    };
    switch (emotionalJournalEntries.get(user)) {
      case (null) { [] };
      case (?entries) {
        entries.filter(
          func(e) { canViewEntry(caller, user, e.isPublic) }
        ).toArray();
      };
    };
  };

  // ------------------- Journaling - Night Reflection -----------------

  public shared ({ caller }) func createOrUpdateNightReflection(entry : NightReflectionJournalEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create journal entries");
    };
    let entries = switch (nightReflectionEntries.get(caller)) {
      case (null) { List.empty<NightReflectionJournalEntry>() };
      case (?existing) { existing };
    };

    let filteredEntries = entries.filter(
      func(e) { e.date != entry.date }
    );

    filteredEntries.add(entry);
    nightReflectionEntries.add(caller, filteredEntries);
  };

  public query ({ caller }) func getNightReflections() : async [NightReflectionJournalEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their journal entries");
    };
    switch (nightReflectionEntries.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public query ({ caller }) func getNightReflectionsForUser(user : Principal) : async [NightReflectionJournalEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view journal entries");
    };
    switch (nightReflectionEntries.get(user)) {
      case (null) { [] };
      case (?entries) {
        entries.filter(
          func(e) { canViewEntry(caller, user, e.isPublic) }
        ).toArray();
      };
    };
  };

  // ------------------- Journaling - Growth Journal -------------------

  public shared ({ caller }) func createOrUpdateGrowthJournal(entry : GrowthJournalEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can create journal entries");
    };
    let entries = switch (growthJournalEntries.get(caller)) {
      case (null) { List.empty<GrowthJournalEntry>() };
      case (?existing) { existing };
    };

    let filteredEntries = entries.filter(
      func(e) { e.date != entry.date }
    );

    filteredEntries.add(entry);
    growthJournalEntries.add(caller, filteredEntries);
  };

  public query ({ caller }) func getGrowthJournals() : async [GrowthJournalEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view their journal entries");
    };
    switch (growthJournalEntries.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public query ({ caller }) func getGrowthJournalsForUser(user : Principal) : async [GrowthJournalEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view journal entries");
    };
    switch (growthJournalEntries.get(user)) {
      case (null) { [] };
      case (?entries) {
        entries.filter(
          func(e) { canViewEntry(caller, user, e.isPublic) }
        ).toArray();
      };
    };
  };

  // ------------------- Vision Board Entry Management ----------------------

  public shared ({ caller }) func addVisionBoardEntry(entry : VisionBoardEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add vision board entries");
    };
    let entries = switch (visionBoardEntries.get(caller)) {
      case (null) { List.empty<VisionBoardEntry>() };
      case (?existing) { existing };
    };
    entries.add(entry);
    visionBoardEntries.add(caller, entries);
  };

  public query ({ caller }) func getVisionBoardEntries() : async [VisionBoardEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view vision board entries");
    };
    switch (visionBoardEntries.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public shared ({ caller }) func updateVisionBoardProgress(targetYear : Int, progress : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update vision board progress");
    };
    let updatedEntries = switch (visionBoardEntries.get(caller)) {
      case (null) { Runtime.trap("No vision board entries found") };
      case (?existing) {
        existing.map<VisionBoardEntry, VisionBoardEntry>(
          func(entry) {
            if (entry.targetYear == targetYear) {
              {
                category = entry.category;
                targetYear = entry.targetYear;
                milestones = entry.milestones;
                whyThisMatters = entry.whyThisMatters;
                progressPercentage = progress;
              };
            } else {
              entry;
            };
          }
        );
      };
    };
    visionBoardEntries.add(caller, updatedEntries);
  };

  public shared ({ caller }) func deleteVisionBoardEntry(targetYear : Int) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete vision board entries");
    };
    let updatedEntries = switch (visionBoardEntries.get(caller)) {
      case (null) { Runtime.trap("No vision board entries found") };
      case (?existing) {
        existing.filter(
          func(entry : VisionBoardEntry) : Bool { entry.targetYear != targetYear }
        );
      };
    };
    visionBoardEntries.add(caller, updatedEntries);
  };

  // ------------------- Daily Planner Management ----------------------

  public shared ({ caller }) func addDailyPlannerEntry(entry : DailyPlannerEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add daily planner entries");
    };
    let entries = switch (dailyPlannerEntries.get(caller)) {
      case (null) { List.empty<DailyPlannerEntry>() };
      case (?existing) { existing };
    };
    entries.add(entry);
    dailyPlannerEntries.add(caller, entries);
  };

  public query ({ caller }) func getDailyPlannerEntries() : async [DailyPlannerEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view daily planner entries");
    };
    switch (dailyPlannerEntries.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public shared ({ caller }) func updateWaterIntake(date : Int, intake : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update water intake");
    };
    let updatedEntries = switch (dailyPlannerEntries.get(caller)) {
      case (null) { Runtime.trap("No daily planner entries found") };
      case (?existing) {
        existing.map<DailyPlannerEntry, DailyPlannerEntry>(
          func(entry) {
            if (entry.date == date) {
              {
                date = entry.date;
                schedule = entry.schedule;
                tasks = entry.tasks;
                notes = entry.notes;
                waterIntake = intake;
                moodEmoji = entry.moodEmoji;
                gratitudeEntries = entry.gratitudeEntries;
                journalEntry = entry.journalEntry;
              };
            } else {
              entry;
            };
          }
        );
      };
    };
    dailyPlannerEntries.add(caller, updatedEntries);
  };

  public shared ({ caller }) func deleteDailyPlannerEntry(date : Int) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete daily planner entries");
    };
    let updatedEntries = switch (dailyPlannerEntries.get(caller)) {
      case (null) { Runtime.trap("No daily planner entries found") };
      case (?existing) {
        existing.filter(
          func(entry : DailyPlannerEntry) : Bool { entry.date != date }
        );
      };
    };
    dailyPlannerEntries.add(caller, updatedEntries);
  };

  // ----------- Yearly Planner CRUD -----------

  public shared ({ caller }) func addYearlyEntry(entry : YearlyEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add yearly entries");
    };
    let entries = switch (yearlyEntries.get(caller)) {
      case (null) { List.empty<YearlyEntry>() };
      case (?existing) { existing };
    };
    entries.add(entry);
    yearlyEntries.add(caller, entries);
  };

  public query ({ caller }) func getYearlyEntries() : async [YearlyEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view yearly entries");
    };
    switch (yearlyEntries.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public shared ({ caller }) func updateYearlyEntry(year : Int, updatedEntry : YearlyEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update yearly entries");
    };
    let updatedEntries = switch (yearlyEntries.get(caller)) {
      case (null) { Runtime.trap("No yearly entries found") };
      case (?existing) {
        existing.map<YearlyEntry, YearlyEntry>(
          func(entry) {
            if (entry.year == year) { updatedEntry } else { entry };
          }
        );
      };
    };
    yearlyEntries.add(caller, updatedEntries);
  };

  public shared ({ caller }) func deleteYearlyEntry(year : Int) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete yearly entries");
    };
    let updatedEntries = switch (yearlyEntries.get(caller)) {
      case (null) { Runtime.trap("No yearly entries found") };
      case (?existing) {
        existing.filter(
          func(entry : YearlyEntry) : Bool { entry.year != year }
        );
      };
    };
    yearlyEntries.add(caller, updatedEntries);
  };

  // ----------- Monthly Planner CRUD -----------

  public shared ({ caller }) func addMonthlyEntry(entry : MonthlyEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add monthly entries");
    };
    let entries = switch (monthlyEntries.get(caller)) {
      case (null) { List.empty<MonthlyEntry>() };
      case (?existing) { existing };
    };
    entries.add(entry);
    monthlyEntries.add(caller, entries);
  };

  public query ({ caller }) func getMonthlyEntries() : async [MonthlyEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view monthly entries");
    };
    switch (monthlyEntries.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public shared ({ caller }) func updateMonthlyEntry(year : Int, month : Nat, updatedEntry : MonthlyEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update monthly entries");
    };
    let updatedEntries = switch (monthlyEntries.get(caller)) {
      case (null) { Runtime.trap("No monthly entries found") };
      case (?existing) {
        existing.map<MonthlyEntry, MonthlyEntry>(
          func(entry) {
            if (entry.year == year and entry.month == month) { updatedEntry } else { entry };
          }
        );
      };
    };
    monthlyEntries.add(caller, updatedEntries);
  };

  public shared ({ caller }) func deleteMonthlyEntry(year : Int, month : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete monthly entries");
    };
    let updatedEntries = switch (monthlyEntries.get(caller)) {
      case (null) { Runtime.trap("No monthly entries found") };
      case (?existing) {
        existing.filter(
          func(entry : MonthlyEntry) : Bool { not (entry.year == year and entry.month == month) }
        );
      };
    };
    monthlyEntries.add(caller, updatedEntries);
  };

  // ----------- Weekly Planner CRUD -----------

  public shared ({ caller }) func addWeeklyEntry(entry : WeeklyEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can add weekly entries");
    };
    let entries = switch (weeklyEntries.get(caller)) {
      case (null) { List.empty<WeeklyEntry>() };
      case (?existing) { existing };
    };
    entries.add(entry);
    weeklyEntries.add(caller, entries);
  };

  public query ({ caller }) func getWeeklyEntries() : async [WeeklyEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view weekly entries");
    };
    switch (weeklyEntries.get(caller)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  public shared ({ caller }) func updateWeeklyEntry(year : Int, weekNumber : Nat, updatedEntry : WeeklyEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can update weekly entries");
    };
    let updatedEntries = switch (weeklyEntries.get(caller)) {
      case (null) { Runtime.trap("No weekly entries found") };
      case (?existing) {
        existing.map<WeeklyEntry, WeeklyEntry>(
          func(entry) {
            if (entry.year == year and entry.weekNumber == weekNumber) { updatedEntry } else { entry };
          }
        );
      };
    };
    weeklyEntries.add(caller, updatedEntries);
  };

  public shared ({ caller }) func deleteWeeklyEntry(year : Int, weekNumber : Nat) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can delete weekly entries");
    };
    let updatedEntries = switch (weeklyEntries.get(caller)) {
      case (null) { Runtime.trap("No weekly entries found") };
      case (?existing) {
        existing.filter(
          func(entry : WeeklyEntry) : Bool { not (entry.year == year and entry.weekNumber == weekNumber) }
        );
      };
    };
    weeklyEntries.add(caller, updatedEntries);
  };

  // Deterministic daily quote based on day of year
  public query func getDailyQuote(dayOfYear : Nat) : async Text {
    let index = dayOfYear % quotes.size();
    if (index < quotes.size()) {
      quotes[index];
    } else {
      "Keep believing in yourself. Every day is a new beginning.";
    };
  };
};
