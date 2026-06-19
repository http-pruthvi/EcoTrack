"use client";

import React, { useState } from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { X, Leaf } from "lucide-react";
import { getEquivalent } from "@/lib/equivalents";

interface FootprintSummaryCardProps {
  totalCO2e: number; // in kg/year
  comparisonPercentage: number; // e.g. -20 or +15
  savingsThisMonth?: number; // kg saved this month, e.g. 40
}

export const FootprintSummaryCard: React.FC<FootprintSummaryCardProps> = ({
  totalCO2e,
  comparisonPercentage,
  savingsThisMonth = 40
}) => {
  const [showComparison, setShowComparison] = useState(true);

  const formattedTotal = new Intl.NumberFormat().format(Math.round(totalCO2e));
  
  // Custom positivity framing
  const isLower = comparisonPercentage <= 0;
  const absPercentage = Math.abs(comparisonPercentage);

  return (
    <Card className="relative overflow-hidden group">
      {/* Decorative calm background glow */}
      <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/5 dark:bg-emerald-400/5 rounded-full blur-3xl -mr-16 -mt-16 transition-all duration-500 group-hover:scale-110" />

      <CardContent className="p-6 sm:p-8 space-y-6">
        <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
          <div className="space-y-1.5">
            <span className="text-xs font-semibold text-slate-400 dark:text-slate-500 tracking-wider uppercase block">
              Your Carbon Footprint
            </span>
            <div className="flex items-baseline gap-1.5">
              <span className="text-3xl sm:text-5xl font-medium tracking-tight text-slate-900 dark:text-white">
                ~{formattedTotal}
              </span>
              <span className="text-sm font-semibold text-slate-500 dark:text-slate-400">
                kg CO2e / year
              </span>
            </div>
          </div>

          {/* Dismissible comparison section */}
          {showComparison && (
            <div className="flex items-start gap-2.5 p-3 rounded-2xl bg-slate-50 dark:bg-slate-950/40 border border-slate-100 dark:border-slate-800/80 animate-fadeIn shrink-0">
              <div className="space-y-1">
                <span className="text-[10px] font-semibold text-slate-400 uppercase tracking-wide block">
                  Vs. National Average
                </span>
                <span className={`inline-flex items-center gap-1 text-xs font-semibold rounded-full px-2 py-0.5 ${
                  isLower 
                    ? "bg-emerald-50 dark:bg-emerald-950/40 text-emerald-700 dark:text-emerald-400"
                    : "bg-amber-50 dark:bg-amber-950/40 text-amber-700 dark:text-amber-400"
                }`}>
                  {isLower ? (
                    <span>{absPercentage}% lower</span>
                  ) : (
                    <span>{absPercentage}% higher</span>
                  )}
                </span>
              </div>
              <button
                onClick={() => setShowComparison(false)}
                className="text-slate-400 hover:text-slate-600 dark:hover:text-slate-200 focus:outline-none p-0.5 rounded-lg hover:bg-slate-100 dark:hover:bg-slate-800"
                title="Hide comparison details"
              >
                <X className="w-3.5 h-3.5" />
              </button>
            </div>
          )}
        </div>

        {/* Positively framed monthly savings block */}
        <div className="p-4 rounded-2xl bg-emerald-50/40 dark:bg-emerald-950/10 border border-emerald-100/50 dark:border-emerald-950/20 flex items-start gap-3.5">
          <div className="p-2 bg-emerald-600 text-white rounded-xl shrink-0">
            <Leaf className="w-4 h-4" />
          </div>
          <div className="space-y-1">
            <h4 className="text-sm font-medium text-slate-900 dark:text-slate-200">
              You are making a difference!
            </h4>
            <p className="text-xs text-slate-500 dark:text-slate-400 leading-relaxed">
              You&apos;ve avoided approximately <strong className="text-emerald-700 dark:text-emerald-400">~{savingsThisMonth} kg CO2e</strong> this month through your active habits. {getEquivalent(savingsThisMonth)}
            </p>
          </div>
        </div>

        {/* Small tips footer */}
        {!showComparison && (
          <button
            onClick={() => setShowComparison(true)}
            className="text-xs text-primary-600 hover:text-primary-700 dark:text-primary-400 font-medium select-none block hover:underline"
          >
            Show National Comparison Stats
          </button>
        )}
      </CardContent>
    </Card>
  );
};
