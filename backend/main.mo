import Text "mo:core/Text";
import Int "mo:core/Int";
import Array "mo:core/Array";
import Time "mo:core/Time";
import Map "mo:core/Map";
import Order "mo:core/Order";
import Iter "mo:core/Iter";
import List "mo:core/List";
import Runtime "mo:core/Runtime";
import Principal "mo:core/Principal";
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

  module Couple {
    public func compareByDescription(couple1 : Couple, couple2 : Couple) : Order.Order {
      switch (Principal.compare(couple1.partner1, couple2.partner1)) {
        case (#equal) { Principal.compare(couple1.partner2, couple2.partner2) };
        case (order) { order };
      };
    };
  };

  module VisionBoardEntry {
    public func compareByTargetYear(entry1 : VisionBoardEntry, entry2 : VisionBoardEntry) : Order.Order {
      Int.compare(entry1.targetYear, entry2.targetYear);
    };
  };

  module DailyPlannerEntry {
    public func compareByDate(entry1 : DailyPlannerEntry, entry2 : DailyPlannerEntry) : Order.Order {
      Int.compare(entry1.date, entry2.date);
    };
  };

  type Couple = {
    partner1 : Principal;
    partner2 : Principal;
  };

  type GoalCategory = {
    #career;
    #financial;
    #health;
    #relationship;
    #personalGrowth;
    #travel;
    #spiritual;
  };

  type VisionBoardEntry = {
    category : GoalCategory;
    targetYear : Int;
    milestones : [Text];
    whyThisMatters : Text;
    progressPercentage : Nat;
  };

  type Task = {
    description : Text;
    isComplete : Bool;
  };

  type ScheduleItem = {
    timeBlock : Text;
    activity : Text;
  };

  type DailyPlannerEntry = {
    date : Int;
    schedule : [ScheduleItem];
    topTasks : [Task];
    notes : Text;
    waterIntake : Nat;
    moodEmoji : Text;
    gratitudeEntries : [Text];
    journalEntry : Text;
  };

  // ------------------------- State -----------------------

  let userProfiles = Map.empty<Principal, UserProfile>();
  let couples = Map.empty<Principal, Couple>();
  let visionBoardEntries = Map.empty<Principal, List.List<VisionBoardEntry>>();
  let dailyPlannerEntries = Map.empty<Principal, List.List<DailyPlannerEntry>>();

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
    // Only allow a user to view their own couple, or an admin to view any
    if (caller != partner and not AccessControl.isAdmin(accessControlState, caller)) {
      // Also allow the partner of the requested principal to view
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
    couples.values().toArray().sort(Couple.compareByDescription);
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
      case (?entries) { entries.toArray().sort(VisionBoardEntry.compareByTargetYear) };
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
      case (?entries) { entries.toArray().sort(DailyPlannerEntry.compareByDate) };
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
                topTasks = entry.topTasks;
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

  // ------------------- Motivational Quotes --------------------------

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
    "Let your vision be greater than your fears",
  ];

  public query func getDailyQuote() : async Text {
    let nanosecondsPerDay = 86_400_000_000_000;
    let daysSinceEpoch = Time.now() / nanosecondsPerDay;
    let quoteIndex = daysSinceEpoch % quotes.size();
    let natIndex = quoteIndex.toNat();
    quotes[natIndex];
  };
};
