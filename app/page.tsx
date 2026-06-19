"use client";

import React from "react";
import Link from "next/link";
import { Leaf, Award, Lightbulb, ArrowRight } from "lucide-react";
import { Button } from "@/components/ui/Button";
import { Card, CardContent } from "@/components/ui/Card";

export default function LandingPage() {
  return (
    <div className="flex-1 bg-slate-50 dark:bg-slate-900 text-slate-900 dark:text-slate-100 min-h-screen flex flex-col">
      
      {/* Header navbar */}
      <header className="w-full max-w-6xl mx-auto px-6 py-5 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <Leaf className="w-6 h-6 text-emerald-600 dark:text-emerald-500" />
          <span className="font-semibold tracking-wide text-lg text-slate-900 dark:text-white">EcoTrack</span>
        </div>
        <Link href="/login">
          <Button variant="outline" size="sm" className="font-semibold text-xs px-4 py-2">
            Sign In
          </Button>
        </Link>
      </header>

      {/* Hero Section */}
      <main className="flex-1 flex flex-col justify-center items-center px-6 max-w-4xl mx-auto text-center space-y-8 pt-12 pb-16">
        
        {/* Intro tag */}
        <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-emerald-50 dark:bg-emerald-950/40 border border-emerald-100/50 dark:border-emerald-900/30 text-xs font-semibold text-emerald-700 dark:text-emerald-400 select-none">
          <Leaf className="w-3.5 h-3.5" />
          Meet EcoTrack
        </span>

        {/* Main Title */}
        <div className="space-y-4">
          <h1 className="text-3xl sm:text-6xl font-medium tracking-tight leading-[1.1] text-slate-900 dark:text-white">
            Understand and Reduce Your <br className="hidden sm:inline" />
            <span className="text-emerald-600 dark:text-emerald-500 font-semibold">Carbon Footprint</span>
          </h1>
          <p className="text-sm sm:text-base text-slate-500 dark:text-slate-400 max-w-xl mx-auto leading-relaxed">
            Personal carbon footprints can feel complex. EcoTrack makes it simple. Take a 2-minute quiz, discover high-impact actions, and build daily habits with streak goals.
          </p>
        </div>

        {/* Primary CTA */}
        <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4 w-full sm:w-auto">
          <Link href="/login" className="w-full sm:w-auto">
            <Button variant="primary" size="lg" className="w-full sm:w-auto font-semibold px-8 py-4 text-sm flex items-center justify-center gap-2 group hover-lift">
              Get Started for Free
              <ArrowRight className="w-4 h-4 transition-transform group-hover:translate-x-1" />
            </Button>
          </Link>
        </div>

        {/* Pillars Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-16 w-full text-left">
          
          {/* Pillar 1 */}
          <Card className="border border-slate-200/40 dark:border-slate-800/80 shadow-sm p-6 hover-lift bg-white dark:bg-slate-950">
            <CardContent className="p-0 space-y-4">
              <div className="p-3 bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400 rounded-2xl w-fit">
                <Leaf className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-slate-800 dark:text-slate-200">
                  1. Rapid Footprint Quiz
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Answer a few questions about your housing, transport, diet, and consumption volume for a custom annualized footprint estimate.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pillar 2 */}
          <Card className="border border-slate-200/40 dark:border-slate-800/80 shadow-sm p-6 hover-lift bg-white dark:bg-slate-950">
            <CardContent className="p-0 space-y-4">
              <div className="p-3 bg-cyan-50 dark:bg-cyan-950/40 text-cyan-600 dark:text-cyan-400 rounded-2xl w-fit">
                <Lightbulb className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-slate-800 dark:text-slate-200">
                  2. Efficiency Insights
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Receive opportunities prioritized automatically based on carbon savings relative to the willpower required to maintain them.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Pillar 3 */}
          <Card className="border border-slate-200/40 dark:border-slate-800/80 shadow-sm p-6 hover-lift bg-white dark:bg-slate-950">
            <CardContent className="p-0 space-y-4">
              <div className="p-3 bg-amber-50 dark:bg-amber-950/40 text-amber-500 rounded-2xl w-fit">
                <Award className="w-6 h-6" />
              </div>
              <div className="space-y-1">
                <h3 className="font-semibold text-base text-slate-800 dark:text-slate-200">
                  3. Habit Streaks
                </h3>
                <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
                  Practice active check-ins daily to lock down habit streaks. Reach the 21-day threshold to make actions automatic.
                </p>
              </div>
            </CardContent>
          </Card>

        </div>

      </main>

      {/* Footer */}
      <footer className="border-t border-slate-200 dark:border-slate-800 py-6 text-center text-xs text-slate-400">
        &copy; {new Date().getFullYear()} EcoTrack. Developed by Pruthvi. Designed with care for individuals and the planet.
      </footer>

    </div>
  );
}
