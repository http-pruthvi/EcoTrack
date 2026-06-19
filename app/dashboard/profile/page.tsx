"use client";

import React, { useEffect, useState } from "react";

import { useAuth } from "@/components/auth/AuthProvider";
import {
  getFootprintProfile,
  saveFootprintProfile,
  addFootprintHistory,
  getHabits,
  saveHabits,
  FootprintProfile,
  Habit
} from "@/lib/firebase";
import { calculateFootprint } from "@/lib/footprintCalculator";
import { generateInsights } from "@/lib/generateInsights";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { User, Save, Sparkles } from "lucide-react";

export default function ProfilePage() {
  const { user } = useAuth();
  
  const [profile, setProfile] = useState<FootprintProfile | null>(null);
  const [answers, setAnswers] = useState<Partial<FootprintProfile>>({});
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [success, setSuccess] = useState(false);
  const [savingsDelta, setSavingsDelta] = useState<number | null>(null);

  useEffect(() => {
    const loadProfile = async () => {
      if (!user) return;
      try {
        const data = await getFootprintProfile(user.uid);
        if (data) {
          setProfile(data);
          setAnswers(data);
        }
      } catch (e) {
        console.error("Error loading profile:", e);
      } finally {
        setLoading(false);
      }
    };
    loadProfile();
  }, [user]);

  const handleChange = (key: keyof FootprintProfile, value: FootprintProfile[keyof FootprintProfile]) => {
    const newAnswers = { ...answers, [key]: value };
    if (key === "primaryCommute" && (value === "wfh" || value === "bike_walk")) {
      newAnswers.commuteDistanceKm = 0;
    }
    setAnswers(newAnswers);
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user || !profile) return;
    setSaving(true);
    setSuccess(false);
    setSavingsDelta(null);

    try {
      const fullProfile = answers as FootprintProfile;

      // 1. Calculate old & new footprints to see the delta
      const oldCalculated = calculateFootprint(profile);
      const newCalculated = calculateFootprint(fullProfile);
      
      const delta = oldCalculated.total - newCalculated.total;
      setSavingsDelta(delta);

      // 2. Save Footprint Profile
      await saveFootprintProfile(user.uid, fullProfile);

      // 3. Add History Entry snapshot
      await addFootprintHistory(user.uid, newCalculated.total, newCalculated.breakdown);

      // 4. Regenerate recommendations if footprint is modified
      const currentHabits = await getHabits(user.uid);
      const activeOrCompletedHabitIds = currentHabits
        .filter(h => h.status === "active" || h.status === "completed")
        .map(h => h.id);

      const recommendedInsights = generateInsights(fullProfile);
      
      // Update suggestions in habits list while keeping active/completed habits untouched!
      const updatedHabits: Habit[] = currentHabits.filter(h => h.status === "active" || h.status === "completed");
      
      recommendedInsights.forEach(insight => {
        // Only suggest if not already active/completed
        if (!activeOrCompletedHabitIds.includes(insight.id)) {
          updatedHabits.push({
            id: insight.id,
            title: insight.title,
            category: insight.category,
            estAnnualSavingsKg: insight.estAnnualSavingsKg,
            effortWeight: insight.effortWeight,
            status: "suggested",
            streakCount: 0,
            lastCheckedInAt: null,
            createdAt: new Date().toISOString(),
            freezeUsedDates: []
          });
        }
      });

      await saveHabits(user.uid, updatedHabits);
      setProfile(fullProfile);
      setSuccess(true);
    } catch (error) {
      console.error("Error saving profile changes:", error);
      alert("failed to save profile. please try again.");
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-96 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
      </div>
    );
  }

  const showCommuteDistance = answers.primaryCommute !== "wfh" && answers.primaryCommute !== "bike_walk";

  return (
    <div className="space-y-6 sm:space-y-8 max-w-3xl">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Profile Details
          <User className="w-6 h-6 text-emerald-600" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Update your footprint preferences and recalculate your annualized carbon impact.
        </p>
      </div>

      {/* Success Notification */}
      {success && (
        <Card className="bg-emerald-500/5 border border-emerald-500/10 animate-fadeIn">
          <CardContent className="p-5 flex items-start gap-4">
            <div className="p-2.5 bg-emerald-600 text-white rounded-xl shrink-0 mt-0.5">
              <Sparkles className="w-4 h-4" />
            </div>
            <div className="space-y-1">
              <h4 className="text-sm font-semibold text-emerald-800 dark:text-emerald-400">
                Footprint Recalculated Successfully!
              </h4>
              <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                {savingsDelta && savingsDelta > 0 ? (
                  <span>your changes reduced your footprint by <strong className="text-emerald-700 dark:text-emerald-450">~{Math.round(savingsDelta)} kg CO2e / year</strong>! outstanding progress.</span>
                ) : savingsDelta && savingsDelta < 0 ? (
                  <span>your recalculated carbon footprint has adjusted to ~{Math.abs(Math.round(savingsDelta))} kg CO2e / year higher based on the new parameters.</span>
                ) : (
                  <span>no net difference in carbon totals, but your profile fields were synchronized.</span>
                )}
              </p>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Form Card */}
      <Card className="border border-slate-200/50 dark:border-slate-800/80 shadow-md">
        <form onSubmit={handleSubmit}>
          <CardContent className="p-6 sm:p-8 space-y-6">
            
            {/* Grid options */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              
              {/* Home type */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  Home Type
                </label>
                <select
                  value={answers.homeType || ""}
                  onChange={(e) => handleChange("homeType", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="apartment">Apartment / Condo</option>
                  <option value="house_small">Small House</option>
                  <option value="house_large">Large House</option>
                </select>
              </div>

              {/* Household size */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  Household Size
                </label>
                <input
                  type="number"
                  min="1"
                  max="20"
                  value={answers.householdSize || 1}
                  onChange={(e) => handleChange("householdSize", parseInt(e.target.value) || 1)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Heating fuel */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  Heating Fuel Source
                </label>
                <select
                  value={answers.heatingFuel || ""}
                  onChange={(e) => handleChange("heatingFuel", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="electric">Electric Heat</option>
                  <option value="gas">Natural Gas</option>
                  <option value="oil">Heating Oil</option>
                  <option value="other">Other / Biomass</option>
                </select>
              </div>

              {/* Diet */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  Eating Habits
                </label>
                <select
                  value={answers.dietPattern || ""}
                  onChange={(e) => handleChange("dietPattern", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="meat_heavy">Meat Heavy</option>
                  <option value="meat_moderate">Meat Moderate</option>
                  <option value="vegetarian">Vegetarian</option>
                  <option value="vegan">Vegan</option>
                </select>
              </div>

              {/* Commute */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  Primary Commute Method
                </label>
                <select
                  value={answers.primaryCommute || ""}
                  onChange={(e) => handleChange("primaryCommute", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="car_solo">Drive Alone</option>
                  <option value="carpool">Carpool</option>
                  <option value="public_transit">Public Transit</option>
                  <option value="bike_walk">Bike / Walk</option>
                  <option value="wfh">Work from Home</option>
                </select>
              </div>

              {/* Commute Distance */}
              {showCommuteDistance && (
                <div className="space-y-2">
                  <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                    Daily Round-Trip Commute (km)
                  </label>
                  <input
                    type="number"
                    min="0"
                    max="500"
                    value={answers.commuteDistanceKm || 0}
                    onChange={(e) => handleChange("commuteDistanceKm", parseInt(e.target.value) || 0)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                  />
                </div>
              )}

              {/* Flights */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-550 tracking-wide uppercase">
                  Round-Trip Flights / Year
                </label>
                <input
                  type="number"
                  min="0"
                  max="100"
                  value={answers.flightsPerYear || 0}
                  onChange={(e) => handleChange("flightsPerYear", parseInt(e.target.value) || 0)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                />
              </div>

              {/* Shopping */}
              <div className="space-y-2">
                <label className="text-xs font-semibold text-slate-500 tracking-wide uppercase">
                  Shopping / Consumption Volume
                </label>
                <select
                  value={answers.shoppingLevel || ""}
                  onChange={(e) => handleChange("shoppingLevel", e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-950 text-sm focus:ring-2 focus:ring-emerald-500 text-slate-800 dark:text-slate-200"
                >
                  <option value="minimal">Minimalist</option>
                  <option value="moderate">Average Consumer</option>
                  <option value="high">High Consumer</option>
                </select>
              </div>

            </div>

            {/* CTA action */}
            <div className="pt-4 border-t border-slate-100 dark:border-slate-850 flex items-center justify-end">
              <Button
                type="submit"
                variant="primary"
                isLoading={saving}
                className="font-semibold px-6"
              >
                <Save className="w-4 h-4 mr-2" />
                Save and Recalculate
              </Button>
            </div>

          </CardContent>
        </form>
      </Card>
    </div>
  );
}
