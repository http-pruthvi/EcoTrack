import { Habit, updateHabit } from "./firebase";

export interface StreakEvaluation {
  streakCount: number;
  freezesAvailable: number;
  freezeUsedDates: string[];
  wasFrozen: boolean;
  wasReset: boolean;
  simulatedLastCheckIn: string | null;
}

/**
 * Checks a habit's streak state. If a day is missed and a freeze is available, it applies it.
 * If a day is missed and no freeze is available, it resets the streak to 0.
 */
export function evaluateStreak(habit: Habit): StreakEvaluation {
  const now = new Date();
  
  // Calculate rolling freezes available (1 freeze per rolling 7-day window)
  const usedDates = habit.freezeUsedDates || [];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentFreezes = usedDates.filter(d => new Date(d) >= sevenDaysAgo);
  const freezesAvailable = recentFreezes.length > 0 ? 0 : 1;

  if (!habit.lastCheckedInAt) {
    return {
      streakCount: 0,
      freezesAvailable,
      freezeUsedDates: usedDates,
      wasFrozen: false,
      wasReset: false,
      simulatedLastCheckIn: null
    };
  }

  const lastCheck = new Date(habit.lastCheckedInAt);
  const today = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const lastCheckDate = new Date(lastCheck.getFullYear(), lastCheck.getMonth(), lastCheck.getDate());
  
  const diffTime = today.getTime() - lastCheckDate.getTime();
  const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

  let currentStreak = habit.streakCount;
  const updatedUsedDates = [...usedDates];
  let wasFrozen = false;
  let wasReset = false;
  let simulatedLastCheckIn: string | null = null;

  if (diffDays <= 1) {
    // Checked in today or yesterday, no action needed
    return {
      streakCount: currentStreak,
      freezesAvailable,
      freezeUsedDates: usedDates,
      wasFrozen: false,
      wasReset: false,
      simulatedLastCheckIn: null
    };
  }

  // User missed checking in yesterday (diffDays === 2 means they checked in Tuesday, today is Thursday, they missed Wednesday)
  if (diffDays === 2 && freezesAvailable > 0) {
    // Apply freeze for yesterday
    const yesterday = new Date(today);
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    
    updatedUsedDates.push(yesterdayStr);
    wasFrozen = true;
    
    // Set simulated last check-in date to yesterday at 12:00 PM so they can check in today
    const yesterdayNoon = new Date(yesterday);
    yesterdayNoon.setHours(12, 0, 0, 0);
    simulatedLastCheckIn = yesterdayNoon.toISOString();
  } else {
    // Missed more than 1 day or no freeze available, streak resets
    currentStreak = 0;
    wasReset = true;
  }

  return {
    streakCount: currentStreak,
    freezesAvailable: wasFrozen ? 0 : freezesAvailable,
    freezeUsedDates: updatedUsedDates,
    wasFrozen,
    wasReset,
    simulatedLastCheckIn
  };
}

/**
 * Iterates through all habits, evaluates streak status, updates database for any modified states,
 * and returns the updated habits list.
 */
export async function verifyAndSyncHabitStreaks(userId: string, habits: Habit[]): Promise<Habit[]> {
  const updatedHabitsList: Habit[] = [];
  
  for (const habit of habits) {
    if (habit.status !== "active") {
      updatedHabitsList.push(habit);
      continue;
    }
    
    const evalResult = evaluateStreak(habit);
    if (evalResult.wasFrozen || evalResult.wasReset) {
      const updates: Partial<Habit> = {
        streakCount: evalResult.streakCount,
        freezeUsedDates: evalResult.freezeUsedDates,
      };
      
      if (evalResult.wasFrozen && evalResult.simulatedLastCheckIn) {
        updates.lastCheckedInAt = evalResult.simulatedLastCheckIn;
      } else if (evalResult.wasReset) {
        updates.lastCheckedInAt = null;
      }
      
      await updateHabit(userId, habit.id, updates);
      
      updatedHabitsList.push({
        ...habit,
        ...updates
      });
    } else {
      updatedHabitsList.push(habit);
    }
  }
  
  return updatedHabitsList;
}
