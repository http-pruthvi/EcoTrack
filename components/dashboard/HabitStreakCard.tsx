"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { ProgressBar } from "@/components/ui/ProgressBar";
import { Flame, CheckCircle, Award, Shield } from "lucide-react";
import { Habit } from "@/lib/firebase";

interface HabitStreakCardProps {
  habit: Habit;
  onCheckIn: (habitId: string) => Promise<void>;
  isCheckingIn?: boolean;
}

export const HabitStreakCard: React.FC<HabitStreakCardProps> = ({
  habit,
  onCheckIn,
  isCheckingIn = false
}) => {
  // Determine if checked in today
  const isCheckedInToday = () => {
    if (!habit.lastCheckedInAt) return false;
    const lastCheck = new Date(habit.lastCheckedInAt);
    const today = new Date();
    return (
      lastCheck.getDate() === today.getDate() &&
      lastCheck.getMonth() === today.getMonth() &&
      lastCheck.getFullYear() === today.getFullYear()
    );
  };

  const checkedIn = isCheckedInToday();
  
  // Calculate rolling freezes available (1 freeze per rolling 7-day window)
  const usedDates = habit.freezeUsedDates || [];
  const sevenDaysAgo = new Date();
  sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
  const recentFreezes = usedDates.filter((d: string) => new Date(d) >= sevenDaysAgo);
  const freezesAvailable = recentFreezes.length > 0 ? 0 : 1;

  // Determine if yesterday was frozen
  const isYesterdayFrozen = () => {
    if (usedDates.length === 0) return false;
    const yesterday = new Date();
    yesterday.setDate(yesterday.getDate() - 1);
    const yesterdayStr = yesterday.toISOString().split("T")[0];
    return usedDates.includes(yesterdayStr);
  };

  const yesterdayFrozen = isYesterdayFrozen();
  
  // Progress toward automatic (21 days)
  const targetDays = 21;
  const isCompleted = habit.streakCount >= targetDays;

  const handleCheckIn = (e: React.MouseEvent) => {
    e.preventDefault();
    if (!checkedIn) {
      onCheckIn(habit.id);
    }
  };

  return (
    <Card className="border border-slate-200/50 dark:border-slate-800/80 shadow-md relative overflow-hidden">
      {/* Sparkles background effect for streaks */}
      {habit.streakCount > 0 && (
        <div className="absolute top-0 right-0 w-24 h-24 bg-amber-500/5 dark:bg-amber-500/5 rounded-full blur-2xl -mr-8 -mt-8" />
      )}

      <CardContent className="p-6 sm:p-8 space-y-6">
        
        {/* Title & Streak Section */}
        <div className="flex items-start justify-between gap-4">
          <div className="space-y-2 flex-1">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase block">
              Focused Active Habit
            </span>
            <h3 className="text-lg font-medium text-slate-800 dark:text-slate-100 leading-snug">
              {habit.title}
            </h3>
            <span className="text-xs text-slate-500 dark:text-slate-400 block font-normal">
              Estimated Savings: ~{Math.round(habit.estAnnualSavingsKg)} kg CO2e / Year
            </span>
            
            {/* Shield Notification for Protected State */}
            {yesterdayFrozen && (
              <div className="inline-flex items-center gap-1.5 text-[11px] font-semibold text-sky-600 dark:text-sky-400 bg-sky-50 dark:bg-sky-950/20 px-2.5 py-1 rounded-lg border border-sky-200/20 mt-1">
                <Shield className="w-3.5 h-3.5 fill-sky-500/10 text-sky-500" />
                <span>Streak Frozen Yesterday &mdash; Protected from Resetting!</span>
              </div>
            )}
            
            {/* Encourage if reset */}
            {habit.streakCount === 0 && !checkedIn && (
              <div className="text-[11px] text-slate-450 dark:text-slate-400 italic block mt-1">
                Streak Reset &mdash; Every Day Is a Fresh Start.
              </div>
            )}
          </div>

          {/* Streak indicator badge */}
          <div className="flex flex-col items-center shrink-0">
            <div className={`p-2.5 rounded-2xl flex items-center justify-center transition-all ${
              yesterdayFrozen
                ? "bg-sky-50 dark:bg-sky-950/20 text-sky-500"
                : habit.streakCount > 0
                  ? "bg-amber-50 dark:bg-amber-950/20 text-amber-500"
                  : "bg-slate-100 dark:bg-slate-800/50 text-slate-400"
            }`}>
              {yesterdayFrozen ? (
                <Shield className="w-7 h-7 animate-pulse fill-sky-500/20" />
              ) : (
                <Flame className={`w-7 h-7 ${habit.streakCount > 0 ? "animate-pulse fill-amber-500/20" : ""}`} />
              )}
            </div>
            
            <span className="text-lg font-bold text-slate-800 dark:text-slate-200 mt-1 select-none">
              {habit.streakCount}
            </span>
            <span className="text-[9px] font-bold text-slate-400 tracking-wider uppercase">
              Streak
            </span>

            {/* Freeze availability outline/filled shield */}
            <div className="flex items-center gap-1 mt-1 justify-center" title={freezesAvailable > 0 ? "Streak Freeze Available" : "Streak Freeze Consumed (7d cooldown)"}>
              <Shield className={`w-3 h-3 ${
                freezesAvailable > 0 
                  ? "text-sky-500 fill-sky-500/20" 
                  : "text-slate-300 dark:text-slate-700"
              }`} />
              <span className="text-[8px] font-bold text-slate-400 tracking-wider">
                {freezesAvailable > 0 ? "Ready" : "Used"}
              </span>
            </div>
          </div>
        </div>

        {/* Action Controls */}
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-6 pt-4 border-t border-slate-200 dark:border-slate-800">
          
          {/* Progress bar towards automated */}
          <div className="flex-1 space-y-2">
            <div className="flex justify-between items-center text-xs text-slate-500 dark:text-slate-400 font-medium">
              <span className="flex items-center gap-1">
                <Award className={`w-3.5 h-3.5 ${isCompleted ? "text-emerald-500" : "text-primary-500"}`} />
                {isCompleted ? "Habit Formed" : "Making it Automatic"}
              </span>
              <span className="font-semibold">{habit.streakCount} / {targetDays} days</span>
            </div>

            {/* Note: 21 days is a popularized heuristic (not a clinically precise threshold). Eased progress fill curve represents that early days require more willpower. */}
            <ProgressBar
              value={habit.streakCount}
              max={targetDays}
              color="secondary"
              size="sm"
              easing="ease-in-cubic"
              markerValue={7}
              markerLabel="Day 7: Hardest Part Is Almost Over"
            />
            
            <div className="pt-2 flex items-center justify-between">
              <span className="text-[10px] text-slate-450 dark:text-slate-500 block leading-tight">
                {isCompleted 
                  ? "Amazing! You Reached the 21-Day Mark and Formed a Lasting Habit!" 
                  : `${targetDays - habit.streakCount} More Days to Establish This Routine.`
                }
              </span>
              {isCompleted && (
                <span className="inline-flex items-center gap-1 text-[10px] uppercase font-bold tracking-wider text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 px-2 py-0.5 rounded-md border border-emerald-200/20">
                  Completed
                </span>
              )}
            </div>
          </div>

          {/* Check in button */}
          <div className="shrink-0 flex items-center justify-end">
            {checkedIn ? (
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-emerald-700 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/20 px-4 py-2.5 rounded-xl border border-emerald-200/40">
                <CheckCircle className="w-4 h-4" />
                Checked In Today
              </span>
            ) : (
              <Button
                variant="secondary"
                size="md"
                onClick={handleCheckIn}
                isLoading={isCheckingIn}
                className="w-full sm:w-auto font-semibold py-2.5 px-5"
              >
                Check In Today
              </Button>
            )}
          </div>
        </div>

      </CardContent>
    </Card>
  );
};
