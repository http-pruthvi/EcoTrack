"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import { getHabits, updateHabit, addCheckIn, Habit } from "@/lib/firebase";
import { verifyAndSyncHabitStreaks } from "@/lib/streakChecker";
import { HabitStreakCard } from "@/components/dashboard/HabitStreakCard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Compass, CheckSquare, Plus, Ban, Sparkles } from "lucide-react";

export default function HabitsPage() {
  const { user } = useAuth();
  
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const loadHabits = useCallback(async () => {
    if (!user) return;
    try {
      const rawList = await getHabits(user.uid);
      const syncedList = await verifyAndSyncHabitStreaks(user.uid, rawList || []);
      setHabits(syncedList || []);
    } catch (e) {
      console.error("Error loading habits:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        loadHabits();
      }
    });
    return () => {
      active = false;
    };
  }, [loadHabits]);

  // Habit check-in logic
  const handleCheckIn = async (habitId: string) => {
    if (!user) return;
    setCheckingInId(habitId);
    try {
      const habit = habits.find(h => h.id === habitId);
      if (!habit) return;

      const now = new Date();
      let newStreak = habit.streakCount;
      const lastCheck = habit.lastCheckedInAt ? new Date(habit.lastCheckedInAt) : null;

      if (!lastCheck) {
        newStreak = 1;
      } else {
        const today = new Date();
        const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
        const lastCheckDate = new Date(lastCheck.getFullYear(), lastCheck.getMonth(), lastCheck.getDate());
        
        const diffTime = todayDate.getTime() - lastCheckDate.getTime();
        const diffDays = Math.floor(diffTime / (1000 * 60 * 60 * 24));

        if (diffDays === 0) {
          return;
        } else if (diffDays === 1) {
          newStreak += 1;
        } else {
          newStreak = 1;
        }
      }

      await updateHabit(user.uid, habitId, {
        streakCount: newStreak,
        lastCheckedInAt: now.toISOString()
      });
      await addCheckIn(user.uid, habitId, true);
      await loadHabits();
    } catch (e) {
      console.error("Error checking in habit:", e);
    } finally {
      setCheckingInId(null);
    }
  };

  // Pause / Deactivate Habit
  const handleDeactivate = async (habitId: string) => {
    if (!user) return;
    setDeactivatingId(habitId);
    try {
      await updateHabit(user.uid, habitId, {
        status: "suggested",
        streakCount: 0,
        lastCheckedInAt: null
      });
      await loadHabits();
    } catch (e) {
      console.error("Error deactivating habit:", e);
    } finally {
      setDeactivatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="space-y-4">
          {[1, 2].map(i => (
            <div key={i} className="h-44 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  const activeHabits = habits.filter(h => h.status === "active");

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Active Habits
            <CheckSquare className="w-6 h-6 text-emerald-600" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Check in daily to build your habits, secure streaks, and track carbon savings.
          </p>
        </div>
        
        {/* Link to opportunities */}
        <Link href="/dashboard/insights" className="inline-flex">
          <Button variant="outline" size="sm" className="font-semibold text-xs flex items-center gap-1">
            <Plus className="w-3.5 h-3.5" />
            Explore New Opportunities
          </Button>
        </Link>
      </div>

      {/* Active Habits list */}
      {activeHabits.length > 0 ? (
        <div className="space-y-6">
          {activeHabits.map((habit) => (
            <div key={habit.id} className="relative group">
              <HabitStreakCard
                habit={habit}
                onCheckIn={handleCheckIn}
                isCheckingIn={checkingInId === habit.id}
              />
              
              {/* Deactivate hover-button */}
              <div className="absolute top-4 right-4 md:right-8 opacity-0 group-hover:opacity-100 focus-within:opacity-100 transition-opacity duration-200">
                <button
                  onClick={() => handleDeactivate(habit.id)}
                  disabled={deactivatingId === habit.id}
                  className="inline-flex items-center gap-1 text-[10px] uppercase font-bold text-slate-400 hover:text-rose-500 focus-visible:ring-2 focus-visible:ring-rose-500 focus-visible:outline-none p-1 rounded hover:bg-slate-100 dark:hover:bg-slate-800/40 select-none transition-colors"
                  title="Pause and archive habit"
                >
                  <Ban className="w-3.5 h-3.5" />
                  <span>Pause</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <Card className="p-8 sm:p-12 border border-slate-200/50 dark:border-slate-800/80 shadow-md text-center max-w-lg mx-auto space-y-6">
          <CardContent className="space-y-5 flex flex-col items-center">
            <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl">
              <Compass className="w-8 h-8" />
            </div>
            <div className="space-y-1.5">
              <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200">
                No Habits Currently Active
              </h3>
              <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400 leading-relaxed">
                Habits help you take concrete action to reduce your carbon footprint. Explore your suggested opportunities to start.
              </p>
            </div>
            <Link href="/dashboard/insights">
              <Button variant="primary" size="md" className="font-semibold py-2.5 px-6">
                Browse Insights
              </Button>
            </Link>
          </CardContent>
        </Card>
      )}

      {/* Encouragement Banner */}
      {activeHabits.length > 0 && (
        <div className="p-5 rounded-2xl bg-amber-500/5 border border-amber-500/10 flex items-start gap-4 max-w-xl mx-auto">
          <div className="p-2 bg-amber-500 text-white rounded-xl shrink-0 mt-0.5">
            <Sparkles className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-xs font-semibold uppercase tracking-wider text-slate-500">
              The 21-Day Rule
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              Psychologists suggest it takes an average of 21 days of consecutive practice to establish a new habit. Keep checking in daily to reach your goal!
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
