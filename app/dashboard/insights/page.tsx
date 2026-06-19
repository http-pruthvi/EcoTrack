"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getHabits, updateHabit, Habit } from "@/lib/firebase";
import { InsightCard } from "@/components/dashboard/InsightCard";
import { Lightbulb } from "lucide-react";

export default function InsightsPage() {
  const { user } = useAuth();
  const [habits, setHabits] = useState<Habit[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<"all" | "home" | "transport" | "food" | "shopping">(() => {
    if (typeof window !== "undefined") {
      const params = new URLSearchParams(window.location.search);
      const categoryParam = params.get("category");
      if (categoryParam && ["home", "transport", "food", "shopping"].includes(categoryParam)) {
        return categoryParam as "home" | "transport" | "food" | "shopping";
      }
    }
    return "all";
  });
  const [activatingId, setActivatingId] = useState<string | null>(null);

  const loadHabits = useCallback(async () => {
    if (!user) return;
    try {
      const list = await getHabits(user.uid);
      setHabits(list || []);
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

  const handleActivateHabit = async (habitId: string) => {
    if (!user) return;
    setActivatingId(habitId);
    try {
      await updateHabit(user.uid, habitId, {
        status: "active",
        streakCount: 0,
        createdAt: new Date().toISOString()
      });
      await loadHabits();
    } catch (e) {
      console.error("Error activating habit:", e);
    } finally {
      setActivatingId(null);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-10 bg-slate-200 dark:bg-slate-800 rounded-lg w-full" />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {[1, 2, 3].map(i => (
            <div key={i} className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          ))}
        </div>
      </div>
    );
  }

  // Filter based on active category tab
  const filteredHabits = habits
    .filter(h => h.status === "suggested" || h.status === "active")
    .filter(h => activeTab === "all" || h.category === activeTab);

  const categories = [
    { id: "all", label: "All Suggestions" },
    { id: "home", label: "Home Energy" },
    { id: "transport", label: "Transportation" },
    { id: "food", label: "Diet & Food" },
    { id: "shopping", label: "Goods & Shopping" }
  ];

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Reduction Opportunities
          <Lightbulb className="w-6 h-6 text-emerald-600" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Explore suggested high-impact modifications ranked by savings-to-effort efficiency.
        </p>
      </div>

      {/* Category Tabs */}
      <div className="flex border-b border-slate-200 dark:border-slate-800 overflow-x-auto scrollbar-none gap-2">
        {categories.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id as typeof activeTab)}
            className={`pb-3 px-3 text-xs sm:text-sm font-semibold whitespace-nowrap border-b-2 transition-all select-none capitalize focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded-t-lg ${
              activeTab === tab.id
                ? "border-emerald-600 text-emerald-700 dark:text-emerald-400"
                : "border-transparent text-slate-400 hover:text-slate-650"
            }`}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Results Grid */}
      {filteredHabits.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredHabits.map((habit) => (
            <InsightCard
              key={habit.id}
              action={habit}
              onActivate={handleActivateHabit}
              isActivating={activatingId === habit.id}
            />
          ))}
        </div>
      ) : (
        <div className="text-center p-12 border border-dashed border-slate-200 dark:border-slate-800 rounded-2xl text-slate-400 text-xs">
          No suggestions found in this category. You might have already activated all available options!
        </div>
      )}
    </div>
  );
}
