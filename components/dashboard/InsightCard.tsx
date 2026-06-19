"use client";

import React from "react";
import { Card, CardContent } from "@/components/ui/Card";
import { Button } from "@/components/ui/Button";
import { Home, Car, Utensils, ShoppingBag, Plus, Check } from "lucide-react";

export interface InsightAction {
  id: string;
  title: string;
  category: "home" | "transport" | "food" | "shopping";
  estAnnualSavingsKg: number;
  effortWeight: number;
  status?: "suggested" | "active" | "completed" | "dismissed";
}

interface InsightCardProps {
  action: InsightAction;
  onActivate: (id: string) => Promise<void>;
  isActivating?: boolean;
}

export const InsightCard: React.FC<InsightCardProps> = ({
  action,
  onActivate,
  isActivating = false
}) => {
  const categoryConfig = {
    home: { icon: Home, bg: "bg-emerald-50 dark:bg-emerald-950/30", text: "text-emerald-600 dark:text-emerald-400" },
    transport: { icon: Car, bg: "bg-amber-50 dark:bg-amber-950/30", text: "text-amber-600 dark:text-amber-400" },
    food: { icon: Utensils, bg: "bg-cyan-50 dark:bg-cyan-950/30", text: "text-cyan-600 dark:text-cyan-400" },
    shopping: { icon: ShoppingBag, bg: "bg-indigo-50 dark:bg-indigo-950/30", text: "text-indigo-600 dark:text-indigo-400" }
  };

  const { icon: CategoryIcon, bg: iconBg, text: iconText } = categoryConfig[action.category] || categoryConfig.home;

  const handleStartHabit = (e: React.MouseEvent) => {
    e.preventDefault();
    onActivate(action.id);
  };

  const isActive = action.status === "active";

  return (
    <Card className="hover-lift flex flex-col h-full justify-between">
      <CardContent className="p-5 flex flex-col justify-between flex-1 gap-4">
        
        {/* Top Meta info */}
        <div className="space-y-3">
          <div className="flex items-start justify-between gap-3">
            <div className={`p-2 rounded-xl shrink-0 ${iconBg} ${iconText}`}>
              <CategoryIcon className="w-5 h-5" />
            </div>
            
            {/* Savings Pill */}
            <span className="text-[11px] font-semibold text-slate-500 dark:text-slate-400 px-2.5 py-0.5 rounded-full bg-slate-100 dark:bg-slate-800">
              ~{Math.round(action.estAnnualSavingsKg)} kg / Year
            </span>
          </div>

          {/* Action Title */}
          <h4 className="font-medium text-sm leading-snug text-slate-800 dark:text-slate-100">
            {action.title}
          </h4>
        </div>

        {/* Bottom controls */}
        <div className="flex items-center justify-between gap-4 pt-2 border-t border-slate-100 dark:border-slate-800">
          
          {/* Effort dots */}
          <div className="space-y-0.5">
            <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider block">
              Willpower
            </span>
            <div className="flex items-center gap-1">
              {[1, 2, 3, 4, 5].map((dot) => (
                <div
                  key={dot}
                  className={`w-1.5 h-1.5 rounded-full ${
                    dot <= action.effortWeight
                      ? "bg-amber-400 dark:bg-amber-500"
                      : "bg-slate-200 dark:bg-slate-800"
                  }`}
                />
              ))}
            </div>
          </div>

          {/* Primary Action Button */}
          {isActive ? (
            <span className="inline-flex items-center gap-1 text-xs font-semibold text-emerald-600 dark:text-emerald-400 py-1.5 select-none">
              <Check className="w-4 h-4" />
              Active Habit
            </span>
          ) : (
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartHabit}
              isLoading={isActivating}
              className="text-xs py-1.5 px-3 rounded-lg border-emerald-600 dark:border-emerald-500/50 hover:bg-emerald-50 dark:hover:bg-emerald-950/20 text-emerald-700 dark:text-emerald-400 font-semibold"
            >
              <Plus className="w-3.5 h-3.5 mr-1" />
              Start Habit
            </Button>
          )}

        </div>

      </CardContent>
    </Card>
  );
};
