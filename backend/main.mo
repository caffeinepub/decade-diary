import Map "mo:core/Map";
import List "mo:core/List";
import Principal "mo:core/Principal";
import Runtime "mo:core/Runtime";
import Int "mo:core/Int";
import Nat "mo:core/Nat";
import Order "mo:core/Order";
import Text "mo:core/Text";
import Array "mo:core/Array";
import Iter "mo:core/Iter";
import AccessControl "authorization/access-control";
import MixinAuthorization "authorization/MixinAuthorization";

actor {
  //------------------------- Authorization Setup ----------------------
  let accessControlState = AccessControl.initState();
  include MixinAuthorization(accessControlState);

  //------------------------- Types ------------------------

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
    monthlyCheckIns : [Bool];
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
    expenses : [Text];
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
    dailyCheckIns : [Bool];
  };

  public type Quote = {
    quoteText : Text;
  };

  //--------------------------- Journal Types --------------------------

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
    intensity : Nat;
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
    growthRating : Nat;
    isPublic : Bool;
  };

  //------------------------- State -----------------------

  let userProfiles = Map.empty<Principal, UserProfile>();
  let couples = Map.empty<Principal, Couple>();
  let visionBoardEntries = Map.empty<Principal, List.List<VisionBoardEntry>>();
  let dailyPlannerEntries = Map.empty<Principal, List.List<DailyPlannerEntry>>();
  let yearlyEntries = Map.empty<Principal, List.List<YearlyEntry>>();
  let monthlyEntries = Map.empty<Principal, List.List<MonthlyEntry>>();
  let weeklyEntries = Map.empty<Principal, List.List<WeeklyEntry>>();

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
    "Let your vision be greater than your fears:"
  ];

  //------------------------- Helper Functions ------------------------

  func getPartner(caller : Principal) : ?Principal {
    if (caller.isAnonymous()) { return null };
    switch (couples.get(caller)) {
      case (null) { null };
      case (?couple) {
        if (couple.partner1 == caller) { ?couple.partner2 } else { ?couple.partner1 };
      };
    };
  };

  func areLinkedPartners(caller : Principal, owner : Principal) : Bool {
    if (caller.isAnonymous()) { return false };
    if (caller == owner) { return false };
    switch (couples.get(caller)) {
      case (null) { false };
      case (?couple) {
        (caller == couple.partner1 or caller == couple.partner2) and
        (owner == couple.partner1 or owner == couple.partner2);
      };
    };
  };

  func canViewEntry(caller : Principal, owner : Principal, entryIsPublic : Bool) : Bool {
    if (caller == owner) { return true };
    if (entryIsPublic) { return true };
    areLinkedPartners(caller, owner);
  };

  func canReadAllEntriesFor(caller : Principal, owner : Principal) : Bool {
    if (caller == owner) { return true };
    if (AccessControl.isAdmin(accessControlState, caller)) { return true };
    areLinkedPartners(caller, owner);
  };

  public shared ({ caller }) func dissolveCouple() : async Bool {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can dissolve a couple");
    };
    let hasPartner = getPartner(caller) != null;
    if (hasPartner) {
      switch (couples.get(caller)) {
        case (null) {};
        case (?couple) {
          couples.remove(couple.partner1);
          couples.remove(couple.partner2);
        };
      };
      true;
    } else {
      false;
    };
  };

  //------------------------- User Profile Management -----------------------

  public query ({ caller }) func getCallerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can get their profile");
    };
    userProfiles.get(caller);
  };

  public query ({ caller }) func getUserProfile(user : Principal) : async ?UserProfile {
    if (caller != user and not AccessControl.isAdmin(accessControlState, caller) and not areLinkedPartners(caller, user)) {
      Runtime.trap("Unauthorized: Can only view your own profile or your partner's profile");
    };
    userProfiles.get(user);
  };

  public shared ({ caller }) func saveCallerUserProfile(profile : UserProfile) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save profiles");
    };
    userProfiles.add(caller, profile);
  };

  public query ({ caller }) func getPartnerUserProfile() : async ?UserProfile {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view partner profiles");
    };
    switch (getPartner(caller)) {
      case (null) { Runtime.trap("User is not linked to a partner") };
      case (?partnerPrincipal) { userProfiles.get(partnerPrincipal) };
    };
  };

  //------------------------- Couples Management -----------------------

  public type CoupleCreateError = {
    #anonymousNotPermitted;
    #unauthorized;
    #callerAlreadyLinked;
    #partnerAlreadyLinked;
  };

  public shared ({ caller }) func createCouple(partner1 : Principal, partner2 : Principal) : async ?CoupleCreateError {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      return ?#unauthorized;
    };
    if (partner1.isAnonymous() or partner2.isAnonymous()) {
      return ?#anonymousNotPermitted;
    };
    if (caller != partner1 and caller != partner2 and not AccessControl.isAdmin(accessControlState, caller)) {
      return ?#unauthorized;
    };

    let isAdmin = AccessControl.isAdmin(accessControlState, caller);
    let callerSide : Principal = if (caller == partner2 and not isAdmin) { partner2 } else { partner1 };
    let otherSide : Principal = if (callerSide == partner1) { partner2 } else { partner1 };

    let callerSideLinked = couples.get(callerSide) != null;
    let otherSideLinked = couples.get(otherSide) != null;

    switch (couples.get(callerSide)) {
      case (?existing) {
        if (
          (existing.partner1 == partner1 and existing.partner2 == partner2) or
          (existing.partner1 == partner2 and existing.partner2 == partner1)
        ) { return ?#callerAlreadyLinked };
      };
      case (null) {};
    };

    if (callerSideLinked) { return ?#callerAlreadyLinked };
    if (otherSideLinked) { return ?#partnerAlreadyLinked };

    let newCouple : Couple = { partner1; partner2 };
    couples.add(partner1, newCouple);
    couples.add(partner2, newCouple);
    null;
  };

  public query ({ caller }) func getCouple(partner : Principal) : async ?Couple {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view couple information");
    };
    if (caller != partner and not AccessControl.isAdmin(accessControlState, caller)) {
      let callerCouple = couples.get(caller);
      switch (callerCouple) {
        case (null) { Runtime.trap("Unauthorized: You can only view your own couple") };
        case (?couple) {
          if (couple.partner1 != partner and couple.partner2 != partner) {
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

  //---------------------------- Partner Entry Fetches ------------------

  public query ({ caller }) func getPartnerDailyJournals() : async [DailyJournalEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view partner journal entries");
    };
    switch (getPartner(caller)) {
      case (null) { Runtime.trap("User is not linked to a partner") };
      case (?partnerPrincipal) {
        switch (dailyJournalEntries.get(partnerPrincipal)) {
          case (null) { [] };
          case (?entries) { entries.toArray() };
        };
      };
    };
  };

  public query ({ caller }) func getPartnerEmotionalJournals() : async [EmotionalJournalEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view partner journal entries");
    };
    switch (getPartner(caller)) {
      case (null) { Runtime.trap("User is not linked to a partner") };
      case (?partnerPrincipal) {
        switch (emotionalJournalEntries.get(partnerPrincipal)) {
          case (null) { [] };
          case (?entries) { entries.toArray() };
        };
      };
    };
  };

  public query ({ caller }) func getPartnerNightReflections() : async [NightReflectionJournalEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view partner journal entries");
    };
    switch (getPartner(caller)) {
      case (null) { Runtime.trap("User is not linked to a partner") };
      case (?partnerPrincipal) {
        switch (nightReflectionEntries.get(partnerPrincipal)) {
          case (null) { [] };
          case (?entries) { entries.toArray() };
        };
      };
    };
  };

  public query ({ caller }) func getPartnerGrowthJournals() : async [GrowthJournalEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view partner journal entries");
    };
    switch (getPartner(caller)) {
      case (null) { Runtime.trap("User is not linked to a partner") };
      case (?partnerPrincipal) {
        switch (growthJournalEntries.get(partnerPrincipal)) {
          case (null) { [] };
          case (?entries) { entries.toArray() };
        };
      };
    };
  };

  public query ({ caller }) func getPartnerDailyPlannerEntries() : async [DailyPlannerEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view partner planner entries");
    };
    switch (getPartner(caller)) {
      case (null) { Runtime.trap("User is not linked to a partner") };
      case (?partnerPrincipal) {
        switch (dailyPlannerEntries.get(partnerPrincipal)) {
          case (null) { [] };
          case (?entries) { entries.toArray() };
        };
      };
    };
  };

  public query ({ caller }) func getPartnerDailyPlannerEntryForDate(date : Int) : async ?DailyPlannerEntry {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can fetch a partner entry");
    };
    switch (getPartner(caller)) {
      case (null) { Runtime.trap("User is not linked to a partner") };
      case (?partnerPrincipal) {
        switch (dailyPlannerEntries.get(partnerPrincipal)) {
          case (null) { null };
          case (?entries) {
            entries.find(func(entry) { entry.date == date });
          };
        };
      };
    };
  };

  public query ({ caller }) func getPartnerYearlyEntries() : async [YearlyEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view partner planner entries");
    };
    switch (getPartner(caller)) {
      case (null) { Runtime.trap("User is not linked to a partner") };
      case (?partnerPrincipal) {
        switch (yearlyEntries.get(partnerPrincipal)) {
          case (null) { [] };
          case (?entries) { entries.toArray() };
        };
      };
    };
  };

  public query ({ caller }) func getPartnerMonthlyEntries() : async [MonthlyEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view partner planner entries");
    };
    switch (getPartner(caller)) {
      case (null) { Runtime.trap("User is not linked to a partner") };
      case (?partnerPrincipal) {
        switch (monthlyEntries.get(partnerPrincipal)) {
          case (null) { [] };
          case (?entries) { entries.toArray() };
        };
      };
    };
  };

  public query ({ caller }) func getPartnerWeeklyEntries() : async [WeeklyEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view partner planner entries");
    };
    switch (getPartner(caller)) {
      case (null) { Runtime.trap("User is not linked to a partner") };
      case (?partnerPrincipal) {
        switch (weeklyEntries.get(partnerPrincipal)) {
          case (null) { [] };
          case (?entries) { entries.toArray() };
        };
      };
    };
  };

  public query ({ caller }) func getPartnerVisionBoardEntries() : async [VisionBoardEntry] {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view partner vision board entries");
    };
    switch (getPartner(caller)) {
      case (null) { Runtime.trap("User is not linked to a partner") };
      case (?partnerPrincipal) {
        switch (visionBoardEntries.get(partnerPrincipal)) {
          case (null) { [] };
          case (?entries) { entries.toArray() };
        };
      };
    };
  };

  //------------------- Vision Board Management ----------------------

  public shared ({ caller }) func saveVisionBoardEntry(entry : VisionBoardEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save vision board entries");
    };
    let entries = switch (visionBoardEntries.get(caller)) {
      case (null) { List.empty<VisionBoardEntry>() };
      case (?existing) { existing };
    };
    let filteredEntries = entries.filter(
      func(e : VisionBoardEntry) : Bool { e.targetYear != entry.targetYear }
    );
    filteredEntries.add(entry);
    visionBoardEntries.add(caller, filteredEntries);
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
      Runtime.trap("Unauthorized: Only users can update vision board entries");
    };
    let updatedEntries = switch (visionBoardEntries.get(caller)) {
      case (null) { Runtime.trap("No vision board entries found") };
      case (?existing) {
        existing.map<VisionBoardEntry, VisionBoardEntry>(
          func(entry) {
            if (entry.targetYear == targetYear) {
              {
                entry with progressPercentage = progress;
              };
            } else { entry };
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

  //------------------- Daily Planner Management ----------------------

  public shared ({ caller }) func saveDailyPlannerEntry(entry : DailyPlannerEntry) : async () {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can save daily planner entries");
    };

    let existingEntries : List.List<DailyPlannerEntry> = switch (dailyPlannerEntries.get(caller)) {
      case (null) { List.empty<DailyPlannerEntry>() };
      case (?existing) { existing };
    };

    let filteredEntries = existingEntries.filter(
      func(e) { e.date != entry.date }
    );

    filteredEntries.add(entry);
    dailyPlannerEntries.add(caller, filteredEntries);
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
                entry with waterIntake = intake;
              };
            } else { entry };
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

  public query ({ caller }) func getOwnerYearlyEntries(owner : Principal) : async [YearlyEntry] {
    if (not canReadAllEntriesFor(caller, owner)) {
      Runtime.trap("Unauthorized: You can only view yearly entries for yourself or your linked partner");
    };
    switch (yearlyEntries.get(owner)) {
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

  public query ({ caller }) func getOwnerMonthlyEntries(owner : Principal) : async [MonthlyEntry] {
    if (not canReadAllEntriesFor(caller, owner)) {
      Runtime.trap("Unauthorized: You can only view monthly entries for yourself or your linked partner");
    };
    switch (monthlyEntries.get(owner)) {
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

  public query ({ caller }) func getOwnerWeeklyEntries(owner : Principal) : async [WeeklyEntry] {
    if (not canReadAllEntriesFor(caller, owner)) {
      Runtime.trap("Unauthorized: You can only view weekly entries for yourself or your linked partner");
    };
    switch (weeklyEntries.get(owner)) {
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

  public query func getDailyQuote(dayOfYear : Nat) : async Text {
    let index = dayOfYear % quotes.size();
    if (index < quotes.size()) { quotes[index] } else {
      "Keep believing in yourself. Every day is a new beginning.";
    };
  };

  //------------------- Journaling - Daily Journal ---------------------

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

  public query ({ caller }) func getDailyJournalsForOwner(owner : Principal) : async [DailyJournalEntry] {
    if (not canReadAllEntriesFor(caller, owner)) {
      Runtime.trap("Unauthorized: You can only view daily journals for yourself or your linked partner");
    };
    switch (dailyJournalEntries.get(owner)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  //------------------- Journaling - Emotional Journal ----------------

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

  public query ({ caller }) func getEmotionalJournalsForOwner(owner : Principal) : async [EmotionalJournalEntry] {
    if (not canReadAllEntriesFor(caller, owner)) {
      Runtime.trap("Unauthorized: You can only view emotional journals for yourself or your linked partner");
    };
    switch (emotionalJournalEntries.get(owner)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  //------------------- Journaling - Night Reflection -----------------

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

  public query ({ caller }) func getNightReflectionsForOwner(owner : Principal) : async [NightReflectionJournalEntry] {
    if (not canReadAllEntriesFor(caller, owner)) {
      Runtime.trap("Unauthorized: You can only view night reflections for yourself or your linked partner");
    };
    switch (nightReflectionEntries.get(owner)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  //------------------- Journaling - Growth Journal -------------------

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

  public query ({ caller }) func getGrowthJournalsForOwner(owner : Principal) : async [GrowthJournalEntry] {
    if (not canReadAllEntriesFor(caller, owner)) {
      Runtime.trap("Unauthorized: You can only view growth journals for yourself or your linked partner");
    };
    switch (growthJournalEntries.get(owner)) {
      case (null) { [] };
      case (?entries) { entries.toArray() };
    };
  };

  //------------------- New Partner Journal Fetch -------------------

  public query ({ caller }) func getPartnerJournals() : async {
    daily : [DailyJournalEntry];
    emotional : [EmotionalJournalEntry];
    night : [NightReflectionJournalEntry];
    growth : [GrowthJournalEntry];
  } {
    if (not AccessControl.hasPermission(accessControlState, caller, #user)) {
      Runtime.trap("Unauthorized: Only users can view partner journal entries");
    };
    switch (getPartner(caller)) {
      case (null) { Runtime.trap("User is not linked to a partner") };
      case (?partnerPrincipal) {
        let daily = switch (dailyJournalEntries.get(partnerPrincipal)) {
          case (null) { [] };
          case (?entries) { entries.toArray() };
        };
        let emotional = switch (emotionalJournalEntries.get(partnerPrincipal)) {
          case (null) { [] };
          case (?entries) { entries.toArray() };
        };
        let night = switch (nightReflectionEntries.get(partnerPrincipal)) {
          case (null) { [] };
          case (?entries) { entries.toArray() };
        };
        let growth = switch (growthJournalEntries.get(partnerPrincipal)) {
          case (null) { [] };
          case (?entries) { entries.toArray() };
        };
        { daily; emotional; night; growth };
      };
    };
  };
};
