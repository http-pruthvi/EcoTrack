import { describe, it, expect, vi, beforeEach, afterEach } from "vitest";
import { evaluateStreak } from "./streakChecker";
import { Habit } from "./firebase";

describe("streakChecker evaluateStreak", () => {
  beforeEach(() => {
    vi.useFakeTimers();
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  it("should return streak 0 and ready status for brand new habit without check-ins", () => {
    const habit: Habit = {
      id: "test-habit",
      title: "Test Habit",
      category: "home",
      estAnnualSavingsKg: 100,
      effortWeight: 1,
      status: "active",
      streakCount: 0,
      lastCheckedInAt: null,
      createdAt: new Date().toISOString(),
      freezeUsedDates: []
    };

    // Mock date to 2026-06-19 12:00:00
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"));

    const result = evaluateStreak(habit);
    expect(result.streakCount).toBe(0);
    expect(result.freezesAvailable).toBe(1);
    expect(result.wasFrozen).toBe(false);
    expect(result.wasReset).toBe(false);
  });

  it("should keep the streak if checked in today", () => {
    // Current date is 2026-06-19 12:00:00
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"));

    const habit: Habit = {
      id: "test-habit",
      title: "Test Habit",
      category: "home",
      estAnnualSavingsKg: 100,
      effortWeight: 1,
      status: "active",
      streakCount: 5,
      lastCheckedInAt: "2026-06-19T08:00:00Z", // Checked in 4 hours ago
      createdAt: "2026-06-10T12:00:00Z",
      freezeUsedDates: []
    };

    const result = evaluateStreak(habit);
    expect(result.streakCount).toBe(5);
    expect(result.wasFrozen).toBe(false);
    expect(result.wasReset).toBe(false);
  });

  it("should keep the streak if checked in yesterday", () => {
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"));

    const habit: Habit = {
      id: "test-habit",
      title: "Test Habit",
      category: "home",
      estAnnualSavingsKg: 100,
      effortWeight: 1,
      status: "active",
      streakCount: 5,
      lastCheckedInAt: "2026-06-18T15:00:00Z", // Checked in yesterday afternoon
      createdAt: "2026-06-10T12:00:00Z",
      freezeUsedDates: []
    };

    const result = evaluateStreak(habit);
    expect(result.streakCount).toBe(5);
    expect(result.wasFrozen).toBe(false);
    expect(result.wasReset).toBe(false);
  });

  it("should apply a streak freeze if user missed yesterday and freeze is available", () => {
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z")); // Friday

    const habit: Habit = {
      id: "test-habit",
      title: "Test Habit",
      category: "home",
      estAnnualSavingsKg: 100,
      effortWeight: 1,
      status: "active",
      streakCount: 3,
      lastCheckedInAt: "2026-06-17T15:00:00Z", // Wednesday check-in (missed Thursday)
      createdAt: "2026-06-10T12:00:00Z",
      freezeUsedDates: []
    };

    const result = evaluateStreak(habit);
    expect(result.streakCount).toBe(3); // Streak preserved!
    expect(result.wasFrozen).toBe(true);
    expect(result.freezesAvailable).toBe(0);
    // Freeze applied for yesterday (2026-06-18)
    expect(result.freezeUsedDates).toContain("2026-06-18");
    expect(result.simulatedLastCheckIn).not.toBeNull();
  });

  it("should reset streak to 0 if user missed yesterday and no freeze is available (due to cooldown)", () => {
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"));

    const habit: Habit = {
      id: "test-habit",
      title: "Test Habit",
      category: "home",
      estAnnualSavingsKg: 100,
      effortWeight: 1,
      status: "active",
      streakCount: 3,
      lastCheckedInAt: "2026-06-17T15:00:00Z", // Wednesday (missed Thursday)
      createdAt: "2026-06-10T12:00:00Z",
      freezeUsedDates: ["2026-06-15"] // Freeze used 4 days ago (still on cooldown)
    };

    const result = evaluateStreak(habit);
    expect(result.streakCount).toBe(0); // Streak reset!
    expect(result.wasFrozen).toBe(false);
    expect(result.wasReset).toBe(true);
  });

  it("should allow a freeze if last freeze was more than 7 days ago", () => {
    vi.setSystemTime(new Date("2026-06-19T12:00:00Z"));

    const habit: Habit = {
      id: "test-habit",
      title: "Test Habit",
      category: "home",
      estAnnualSavingsKg: 100,
      effortWeight: 1,
      status: "active",
      streakCount: 4,
      lastCheckedInAt: "2026-06-17T15:00:00Z", // Wednesday (missed Thursday)
      createdAt: "2026-06-10T12:00:00Z",
      freezeUsedDates: ["2026-06-10"] // Freeze used 9 days ago (cooldown expired)
    };

    const result = evaluateStreak(habit);
    expect(result.streakCount).toBe(4); // Saved!
    expect(result.wasFrozen).toBe(true);
    expect(result.freezesAvailable).toBe(0);
  });
});
