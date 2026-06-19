"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import { Card, CardContent } from "@/components/ui/Card";
import { ProgressBar } from "@/components/ui/ProgressBar";
import {
  saveFootprintProfile,
  addFootprintHistory,
  saveHabits,
  updateUserProfile,
  FootprintProfile,
  Habit
} from "@/lib/firebase";
import { calculateFootprint } from "@/lib/footprintCalculator";
import { generateInsights, RankedInsight } from "@/lib/generateInsights";
import {
  Home,
  Users,
  Flame,
  Utensils,
  Car,
  Navigation,
  Plane,
  ShoppingBag,
  ArrowLeft,
  Leaf
} from "lucide-react";

interface Option {
  label: string;
  value: string | number;
  description?: string;
}

interface Question {
  id: keyof FootprintProfile | "commuteDistanceKm";
  title: string;
  subtitle: string;
  icon: React.ComponentType<{ className?: string }>;
  options: Option[];
  defaultValue: string | number;
}

export default function OnboardingPage() {
  const { user, refreshUser } = useAuth();
  const router = useRouter();
  
  const [currentStep, setCurrentStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<FootprintProfile>>({
    homeType: "apartment",
    householdSize: 1,
    heatingFuel: "electric",
    dietPattern: "meat_moderate",
    primaryCommute: "public_transit",
    commuteDistanceKm: 0,
    flightsPerYear: 0,
    shoppingLevel: "moderate"
  });
  
  const [submitting, setSubmitting] = useState(false);

  const questions: Question[] = [
    {
      id: "homeType",
      title: "What Type of Home Do You Live In?",
      subtitle: "This helps us estimate your baseline housing energy emissions.",
      icon: Home,
      defaultValue: "apartment",
      options: [
        { label: "Apartment / Condo", value: "apartment", description: "Shared walls, lower baseline energy use" },
        { label: "Small House", value: "house_small", description: "Townhouses, semi-detached, or smaller family homes" },
        { label: "Large House", value: "house_large", description: "Detached houses, multi-story, or spacious layouts" }
      ]
    },
    {
      id: "householdSize",
      title: "How Many People Live in Your Household?",
      subtitle: "Shared energy resources are divided among household members.",
      icon: Users,
      defaultValue: 1,
      options: [
        { label: "Just me", value: 1, description: "All housing emissions count towards your footprint" },
        { label: "2 people", value: 2, description: "Housing energy emissions are shared by two" },
        { label: "3 people", value: 3, description: "Shared emissions among three residents" },
        { label: "4 or more people", value: 4, description: "Shared emissions among a larger household" }
      ]
    },
    {
      id: "heatingFuel",
      title: "What Is Your Primary Heating Fuel?",
      subtitle: "Different heating sources have widely varying environmental impacts.",
      icon: Flame,
      defaultValue: "electric",
      options: [
        { label: "Electric", value: "electric", description: "Heat pumps, electric baseboard, or electric furnace" },
        { label: "Natural Gas", value: "gas", description: "Standard gas furnace or boiler heating" },
        { label: "Heating Oil", value: "oil", description: "Oil burners, commonly in older homes" },
        { label: "Other / Biomass / District", value: "other", description: "Wood burners, pellet stoves, or shared municipal heating" }
      ]
    },
    {
      id: "dietPattern",
      title: "Which Option Best Describes Your Diet?",
      subtitle: "Food represents a major pillar of daily greenhouse gas emissions.",
      icon: Utensils,
      defaultValue: "meat_moderate",
      options: [
        { label: "Meat heavy", value: "meat_heavy", description: "Frequent beef, lamb, pork, or poultry with most meals" },
        { label: "Meat moderate", value: "meat_moderate", description: "Occasional meat, fish, and focus on poultry/veggies" },
        { label: "Vegetarian", value: "vegetarian", description: "No meat or seafood, but includes eggs, cheese, and dairy" },
        { label: "Vegan", value: "vegan", description: "Strictly plant-based diet, no animal ingredients" }
      ]
    },
    {
      id: "primaryCommute",
      title: "How Do You Primarily Commute to Work or School?",
      subtitle: "Transportation represents the largest share of commute emissions.",
      icon: Car,
      defaultValue: "public_transit",
      options: [
        { label: "Drive alone in a car", value: "car_solo", description: "Single-occupant gasoline or diesel commuting" },
        { label: "Carpool or rideshare", value: "carpool", description: "Commute shared with one or more passengers" },
        { label: "Public transit", value: "public_transit", description: "Buses, subway, commuter rail, or light rail systems" },
        { label: "Bike or walk", value: "bike_walk", description: "Active transit with zero carbon emissions" },
        { label: "Work from home", value: "wfh", description: "Fully remote, no daily commuting required" }
      ]
    },
    {
      id: "commuteDistanceKm",
      title: "What Is Your Average Daily Commute Distance?",
      subtitle: "Estimate the round-trip distance in kilometers.",
      icon: Navigation,
      defaultValue: 0,
      options: [
        { label: "Under 10 km (Short)", value: 5, description: "Under 15 minutes of commuting daily" },
        { label: "10 to 30 km (Medium)", value: 20, description: "Standard suburban-to-urban transit" },
        { label: "30 to 60 km (Long)", value: 45, description: "Extended commuter routes or highways" },
        { label: "60+ km (Very Long)", value: 80, description: "Long-range highway traveling" }
      ]
    },
    {
      id: "flightsPerYear",
      title: "How Many Flights Do You Take Per Year?",
      subtitle: "Count short, medium, and long-haul round trips.",
      icon: Plane,
      defaultValue: 0,
      options: [
        { label: "No flights (Staycations)", value: 0, description: "You travel locally or by road/train" },
        { label: "Occasional (1 - 3 flights)", value: 2, description: "Annual holiday or short business trips" },
        { label: "Frequent (4 - 9 flights)", value: 6, description: "Regular regional or cross-continental trips" },
        { label: "Very frequent (10+ flights)", value: 12, description: "Heavy traveling or weekly flights" }
      ]
    },
    {
      id: "shoppingLevel",
      title: "What Is Your Consumer Goods Shopping Level?",
      subtitle: "Clothing, electronics, and home items have supply chain emissions.",
      icon: ShoppingBag,
      defaultValue: "moderate",
      options: [
        { label: "Minimalist", value: "minimal", description: "Buy secondhand, repair items, only purchase essentials" },
        { label: "Average Consumer", value: "moderate", description: "Buy some new things occasionally, update tech when needed" },
        { label: "High Consumer", value: "high", description: "Regular online shopping, fast fashion, frequent tech upgrades" }
      ]
    }
  ];

  // Helper to determine if we should skip commute distance question
  const shouldSkipCommuteDistance = (currentAnswers: Partial<FootprintProfile>) => {
    return currentAnswers.primaryCommute === "wfh" || currentAnswers.primaryCommute === "bike_walk";
  };

  const handleSelectOption = (value: string | number) => {
    const activeQuestion = questions[currentStep];
    const newAnswers = { ...answers, [activeQuestion.id]: value };
    
    // Auto-fill commute distance to 0 if commute is bike/walk/wfh
    if (activeQuestion.id === "primaryCommute" && (value === "wfh" || value === "bike_walk")) {
      newAnswers.commuteDistanceKm = 0;
    }

    setAnswers(newAnswers);

    // Auto advance after selecting on cards for a fluid mobile feel
    setTimeout(() => {
      advanceStep(newAnswers);
    }, 180);
  };

  const advanceStep = (currentAnswers = answers) => {
    let nextStep = currentStep + 1;
    
    // Check if next step is commuteDistanceKm and we should skip it
    if (nextStep < questions.length && questions[nextStep].id === "commuteDistanceKm" && shouldSkipCommuteDistance(currentAnswers)) {
      nextStep += 1;
    }

    if (nextStep < questions.length) {
      setCurrentStep(nextStep);
    } else {
      submitQuiz(currentAnswers);
    }
  };

  const retreatStep = () => {
    let prevStep = currentStep - 1;

    // Check if previous step is commuteDistanceKm and it was skipped
    if (prevStep >= 0 && questions[prevStep].id === "commuteDistanceKm" && shouldSkipCommuteDistance(answers)) {
      prevStep -= 1;
    }

    if (prevStep >= 0) {
      setCurrentStep(prevStep);
    }
  };

  const handleSkipWithDefault = () => {
    const activeQuestion = questions[currentStep];
    const newAnswers = { ...answers, [activeQuestion.id]: activeQuestion.defaultValue };
    setAnswers(newAnswers);
    advanceStep(newAnswers);
  };

  const submitQuiz = async (finalAnswers: Partial<FootprintProfile>) => {
    if (!user) return;
    setSubmitting(true);
    try {
      const fullProfile = finalAnswers as FootprintProfile;
      
      // Calculate Carbon Footprint
      const calculated = calculateFootprint(fullProfile);

      // 1. Save Footprint Profile
      await saveFootprintProfile(user.uid, fullProfile);

      // 2. Add History Entry
      await addFootprintHistory(user.uid, calculated.total, calculated.breakdown);

      // 3. Generate initial habit recommendations and save them as suggested habits
      const recommendedInsights = generateInsights(fullProfile);
      const habitsToSave: Habit[] = recommendedInsights.map((insight: RankedInsight) => ({
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
      }));
      await saveHabits(user.uid, habitsToSave);

      // 4. Set onboardingComplete = true
      await updateUserProfile(user.uid, { onboardingComplete: true });

      // Refresh Auth Context to sync state
      await refreshUser();
      
      router.push("/dashboard");
    } catch (error) {
      console.error("Error completing onboarding:", error);
      alert("Something went wrong saving your footprint. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  const activeQuestion = questions[currentStep];
  const IconComponent = activeQuestion.icon;
  const progressPercent = Math.round(((currentStep) / questions.length) * 100);

  return (
    <main className="min-h-screen bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 flex flex-col items-center justify-center p-4">
      <div className="w-full max-w-lg flex flex-col gap-6">
        
        {/* Header Branding */}
        <div className="flex items-center justify-center gap-2">
          <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-500 animate-pulse" />
          <span className="font-semibold tracking-wide text-xl">EcoTrack</span>
        </div>

        {/* Progress Card */}
        <div className="bg-white dark:bg-slate-950 p-6 rounded-2xl border border-slate-200/60 dark:border-slate-800/80 shadow-sm space-y-4">
          <div className="flex justify-between items-center text-xs font-semibold text-slate-400">
            <span>STEP {currentStep + 1} OF {questions.length}</span>
            <span>{progressPercent}% COMPLETE</span>
          </div>
          <ProgressBar value={currentStep} max={questions.length - 1} color="primary" size="sm" />
        </div>

        {/* Question Panel */}
        <Card className="p-2 sm:p-4">
          <CardContent className="space-y-6 pt-4">
            
            {/* Header section with Icon */}
            <div className="flex items-start gap-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl">
                <IconComponent className="w-7 h-7" />
              </div>
              <div className="space-y-1">
                <h1 className="text-xl sm:text-2xl font-medium tracking-tight leading-snug">
                  {activeQuestion.title}
                </h1>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  {activeQuestion.subtitle}
                </p>
              </div>
            </div>

            {/* Options list */}
            <div className="space-y-3">
              {activeQuestion.options.map((option) => {
                const isSelected = answers[activeQuestion.id] === option.value;
                return (
                  <button
                    key={String(option.value)}
                    onClick={() => handleSelectOption(option.value)}
                    disabled={submitting}
                    className={`w-full text-left p-4 rounded-xl border transition-all duration-200 hover-lift text-sm sm:text-base flex items-start gap-3.5 focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none ${
                      isSelected
                        ? "border-emerald-600 dark:border-emerald-500 bg-emerald-50/40 dark:bg-emerald-950/20 text-emerald-800 dark:text-emerald-300 ring-1 ring-emerald-500"
                        : "border-slate-200 dark:border-slate-800 text-slate-700 dark:text-slate-350 bg-white hover:bg-slate-50 dark:bg-slate-900 dark:hover:bg-slate-800/40"
                    }`}
                  >
                    <div className={`mt-0.5 w-4 h-4 rounded-full border flex items-center justify-center shrink-0 ${
                      isSelected ? "border-emerald-600 bg-emerald-600 text-white" : "border-slate-300 dark:border-slate-700"
                    }`}>
                      {isSelected && <div className="w-1.5 h-1.5 rounded-full bg-white" />}
                    </div>
                    <div>
                      <span className="font-medium block leading-tight">{option.label}</span>
                      {option.description && (
                        <span className="text-xs text-slate-400 dark:text-slate-500 mt-1 block">
                          {option.description}
                        </span>
                      )}
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Navigation & helper skip links */}
            <div className="flex items-center justify-between pt-4 border-t border-slate-100 dark:border-slate-800">
              <button
                type="button"
                onClick={retreatStep}
                disabled={currentStep === 0 || submitting}
                className="flex items-center gap-1.5 text-xs font-semibold tracking-wider text-slate-400 hover:text-slate-600 dark:hover:text-slate-300 uppercase disabled:opacity-30 disabled:pointer-events-none select-none transition-colors focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded px-1 py-0.5"
              >
                <ArrowLeft className="w-4 h-4" />
                Back
              </button>

              <button
                type="button"
                onClick={handleSkipWithDefault}
                disabled={submitting}
                className="text-xs text-slate-400 hover:text-primary-600 dark:hover:text-primary-400 underline font-medium select-none focus-visible:ring-2 focus-visible:ring-emerald-500 focus-visible:outline-none rounded px-1 py-0.5"
              >
                Skip with Default
              </button>
            </div>

          </CardContent>
        </Card>

        {submitting && (
          <div className="text-center text-xs text-slate-400 flex items-center justify-center gap-2">
            <svg className="animate-spin h-4 w-4 text-emerald-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            Calculating emissions and compiling reduction habits...
          </div>
        )}

      </div>
    </main>
  );
}
