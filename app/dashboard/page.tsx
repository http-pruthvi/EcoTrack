"use client";

import React, { useEffect, useState, useCallback } from "react";
import Link from "next/link";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  getFootprintProfile,
  getHabits,
  updateHabit,
  addCheckIn,
  getFootprintHistory,
  FootprintHistory,
  Habit,
  toDate
} from "@/lib/firebase";
import { verifyAndSyncHabitStreaks } from "@/lib/streakChecker";
import { calculateFootprint, FootprintResult } from "@/lib/footprintCalculator";
import { FootprintSummaryCard } from "@/components/dashboard/FootprintSummaryCard";
import { CategoryBreakdownChart } from "@/components/dashboard/CategoryBreakdownChart";
import { HabitStreakCard } from "@/components/dashboard/HabitStreakCard";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ArrowRight, Sparkles, Compass } from "lucide-react";

export default function DashboardPage() {
  const { user } = useAuth();
  
  // State variables
  const [footprint, setFootprint] = useState<FootprintResult | null>(null);
  const [habits, setHabits] = useState<Habit[]>([]);
  const [history, setHistory] = useState<FootprintHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingInId, setCheckingInId] = useState<string | null>(null);
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const loadData = useCallback(async () => {
    if (!user) return;
    try {
      const userProfile = await getFootprintProfile(user.uid);
      const rawHabits = await getHabits(user.uid);
      const userHistory = await getFootprintHistory(user.uid);
      
      // Auto-sync streaks for active habits
      const syncedHabits = await verifyAndSyncHabitStreaks(user.uid, rawHabits || []);
      
      if (userProfile) {
        const result = calculateFootprint(userProfile);
        setFootprint(result);
      }
      setHabits(syncedHabits || []);
      setHistory(userHistory || []);
    } catch (e) {
      console.error("Error loading dashboard data:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        loadData();
      }
    });
    return () => {
      active = false;
    };
  }, [loadData]);

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
        // First check-in
        newStreak = 1;
      } else {
        const today = new Date();
        const diffTime = Math.abs(today.getTime() - lastCheck.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        
        // Check if last check-in was today
        const isSameDay = 
          lastCheck.getDate() === today.getDate() &&
          lastCheck.getMonth() === today.getMonth() &&
          lastCheck.getFullYear() === today.getFullYear();

        if (isSameDay) {
          // Already checked in today, do nothing
          return;
        } else if (diffDays <= 1) {
          // Yesterday, increment streak
          newStreak += 1;
        } else {
          // Streak broken, reset to 1
          newStreak = 1;
        }
      }

      await updateHabit(user.uid, habitId, {
        streakCount: newStreak,
        lastCheckedInAt: now.toISOString()
      });
      await addCheckIn(user.uid, habitId, true);

      // Reload state
      await loadData();
    } catch (e) {
      console.error("Error checking in habit:", e);
    } finally {
      setCheckingInId(null);
    }
  };

  // Activate recommended habit
  const handleActivateHabit = async (habitId: string) => {
    if (!user) return;
    setActivatingId(habitId);
    try {
      const list = [...habits];
      const index = list.findIndex(h => h.id === habitId);
      if (index > -1) {
        await updateHabit(user.uid, habitId, {
          status: "active",
          streakCount: 0,
          createdAt: new Date().toISOString()
        });
      }
      await loadData();
    } catch (e) {
      console.error("Error activating habit:", e);
    } finally {
      setActivatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 sm:space-y-8 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          <div className="h-56 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </div>
      </div>
    );
  }

  // Find active habits
  const activeHabits = habits.filter(h => h.status === "active");
  // Highlight the habit with the longest streak or the first active one
  const highlightedHabit = activeHabits.length > 0 
    ? activeHabits.sort((a, b) => b.streakCount - a.streakCount)[0] 
    : null;

  // Filter suggested opportunities (top 3)
  const suggestedHabits = habits
    .filter(h => h.status === "suggested")
    .sort((a, b) => (b.estAnnualSavingsKg / b.effortWeight) - (a.estAnnualSavingsKg / a.effortWeight));
  
  const topSuggestion = suggestedHabits[0];

  const suggestedHabitsFeed = suggestedHabits.slice(0, 3);

  // Footprint regression calculation
  const getFootprintRegressionInfo = () => {
    if (history.length < 2 || !footprint) return null;
    
    // Sort history by date ascending
    const sortedHistory = [...history].sort((a, b) => toDate(a.date).getTime() - toDate(b.date).getTime());
    const latestSnapshot = sortedHistory[sortedHistory.length - 1];
    const previousSnapshot = sortedHistory[sortedHistory.length - 2];
    
    if (latestSnapshot.totalCO2e > previousSnapshot.totalCO2e) {
      // It increased! Calculate which category increased the most
      const diffHome = latestSnapshot.breakdown.home - previousSnapshot.breakdown.home;
      const diffTransport = latestSnapshot.breakdown.transport - previousSnapshot.breakdown.transport;
      const diffFood = latestSnapshot.breakdown.food - previousSnapshot.breakdown.food;
      const diffShopping = latestSnapshot.breakdown.shopping - previousSnapshot.breakdown.shopping;
      
      const diffs = [
        { label: "Home Energy", value: diffHome },
        { label: "Transportation", value: diffTransport },
        { label: "Diet & Food", value: diffFood },
        { label: "Goods & Shopping", value: diffShopping }
      ];
      
      const maxDiff = diffs.sort((a, b) => b.value - a.value)[0];
      
      if (maxDiff.value > 0) {
        return {
          increasedAmount: Math.round(latestSnapshot.totalCO2e - previousSnapshot.totalCO2e),
          categoryLabel: maxDiff.label,
          categoryValue: Math.round(maxDiff.value)
        };
      }
    }
    return null;
  };
  
  const regressionInfo = getFootprintRegressionInfo();

  // Math for monthly savings
  const totalMonthlySavings = activeHabits.reduce((acc, curr) => acc + (curr.estAnnualSavingsKg / 12), 0);
  const roundedMonthlySavings = Math.round(totalMonthlySavings) || 30; // fallback to 30 default positive number

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Welcome Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
            Hello, {user?.displayName ? user.displayName : "Eco Tracker"}
            <Sparkles className="w-5 h-5 text-amber-500 animate-bounce" />
          </h1>
          <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
            Here is your environmental impact summary for today.
          </p>
        </div>
      </div>

      {/* Regression warning (neutrally framed info block, no warning/red colors) */}
      {regressionInfo && (
        <Card className="bg-slate-100/50 border border-slate-200 dark:bg-slate-900/40 dark:border-slate-800 animate-fadeIn">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-2.5 bg-slate-500 text-white rounded-xl shrink-0 mt-0.5">
              <Compass className="w-5 h-5" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-slate-800 dark:text-slate-200">
                Your estimate shifted since last time &mdash; here&apos;s what changed
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                Based on your latest profile update, your annual carbon footprint estimate shifted. The category that changed the most was <strong className="font-semibold text-slate-700 dark:text-slate-350">{regressionInfo.categoryLabel}</strong> (an increase of {regressionInfo.categoryValue} kg CO2e).
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Footprint Summary widget */}
      {footprint && (
        <FootprintSummaryCard
          totalCO2e={footprint.total}
          comparisonPercentage={footprint.comparisonToNationalAvg}
          savingsThisMonth={roundedMonthlySavings}
        />
      )}

      {/* Grid: Breakdown Chart and Focus Streak */}
      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-stretch">
        
        {/* Category Breakdown (Donut Chart) */}
        <div className="lg:col-span-7 h-full">
          {footprint && <CategoryBreakdownChart breakdown={footprint.breakdown} />}
        </div>

        {/* Focused Streak Card or Empty State */}
        <div className="lg:col-span-5 h-full">
          {highlightedHabit ? (
            <HabitStreakCard
              habit={highlightedHabit}
              onCheckIn={handleCheckIn}
              isCheckingIn={checkingInId === highlightedHabit.id}
            />
          ) : (
            <Card className="flex flex-col justify-between p-6 sm:p-8 h-full border border-slate-200/50 dark:border-slate-800/80 shadow-md">
              <CardContent className="p-0 space-y-5">
                <div className="flex items-start gap-4">
                  <div className="p-3 bg-emerald-50 dark:bg-emerald-950/30 text-emerald-600 dark:text-emerald-400 rounded-2xl shrink-0">
                    <Compass className="w-6 h-6 animate-pulse" />
                  </div>
                  <div className="space-y-1 text-left">
                    <span className="text-[10px] font-bold text-slate-400 uppercase tracking-wider block">RECOMMENDED NEXT STEP</span>
                    <h3 className="text-base font-semibold text-slate-800 dark:text-slate-200 leading-snug">
                      No habit in progress yet &mdash; here&apos;s your best next step
                    </h3>
                  </div>
                </div>

                {topSuggestion ? (
                  <div className="p-4 rounded-2xl border border-slate-200 dark:border-slate-800 bg-slate-50/50 dark:bg-slate-900/20 text-left space-y-2">
                    <h4 className="text-sm font-medium text-slate-800 dark:text-slate-100">
                      {topSuggestion.title}
                    </h4>
                    <div className="flex items-center justify-between text-[11px] text-slate-450 dark:text-slate-500 font-medium">
                      <span>Savings: ~{Math.round(topSuggestion.estAnnualSavingsKg)} kg / yr</span>
                      <span>Willpower: {topSuggestion.effortWeight}/5</span>
                    </div>
                  </div>
                ) : (
                  <p className="text-xs text-slate-500 dark:text-slate-400 text-left leading-relaxed">
                    You have activated all suggested recommendations! Explore more templates on the opportunities catalog.
                  </p>
                )}
              </CardContent>
              <div className="pt-4 border-t border-slate-100 dark:border-slate-800 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
                <Link href="/dashboard/insights" className="text-xs text-slate-400 hover:text-slate-650 font-semibold select-none underline block text-center">
                  Browse Other Insights
                </Link>
                {topSuggestion && (
                  <Button
                    variant="primary"
                    size="sm"
                    onClick={() => handleActivateHabit(topSuggestion.id)}
                    isLoading={activatingId === topSuggestion.id}
                    className="font-semibold px-5 py-2 w-full sm:w-auto"
                  >
                    Start This Habit
                  </Button>
                )}
              </div>
            </Card>
          )}
        </div>

      </div>

      {/* Top Insights Section */}
      <div className="space-y-4">
        <div className="flex justify-between items-center">
          <h2 className="text-lg font-medium text-slate-900 dark:text-white">
            Recommended Actions
          </h2>
          <Link
            href="/dashboard/insights"
            className="text-xs font-semibold tracking-wide text-emerald-600 dark:text-primary-400 hover:underline flex items-center gap-1 transition-all"
          >
            See All Insights
            <ArrowRight className="w-3.5 h-3.5" />
          </Link>
        </div>

        {suggestedHabitsFeed.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {suggestedHabitsFeed.map((action) => (
              <InsightCard
                key={action.id}
                action={action}
                onActivate={handleActivateHabit}
                isActivating={activatingId === action.id}
              />
            ))}
          </div>
        ) : (
          <div className="p-8 border border-dashed border-slate-300 dark:border-slate-800 rounded-2xl text-center text-slate-500 text-xs">
            All suggested actions are already activated! Visit the Habits page to manage them.
          </div>
        )}
      </div>

    </div>
  );
}
