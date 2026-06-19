"use client";
import React, { useEffect, useState } from "react";
import Link from "next/link";
import { ResponsiveContainer, PieChart, Pie, Cell, Tooltip } from "recharts";
import { Card, CardHeader, CardTitle, CardDescription, CardContent, CardFooter } from "@/components/ui/Card";
import { Home, Car, Utensils, ShoppingBag } from "lucide-react";

interface CategoryBreakdownChartProps {
  breakdown: {
    home: number;
    transport: number;
    food: number;
    shopping: number;
  };
}

export const CategoryBreakdownChart: React.FC<CategoryBreakdownChartProps> = ({ breakdown }) => {
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setMounted(true);
      }
    });
    return () => {
      active = false;
    };
  }, []);

  const total = breakdown.home + breakdown.transport + breakdown.food + breakdown.shopping;

  const data = [
    { name: "home", value: breakdown.home, color: "#2dd4bf", icon: Home },        // Teal-400
    { name: "transport", value: breakdown.transport, color: "#38bdf8", icon: Car }, // Sky-400
    { name: "food", value: breakdown.food, color: "#a78bfa", icon: Utensils },       // Violet-400
    { name: "shopping", value: breakdown.shopping, color: "#a8a29e", icon: ShoppingBag } // Stone-400
  ];

  // Identify the largest category segment programmatically
  const largestSegment = [...data].sort((a, b) => b.value - a.value)[0];

  const categoryFriendlyNames: Record<string, string> = {
    home: "Home Energy",
    transport: "Transportation",
    food: "Diet & Food",
    shopping: "Goods & Shopping"
  };

  const getPercentage = (value: number) => {
    if (total === 0) return 0;
    return Math.round((value / total) * 100);
  };

  interface CustomTooltipProps {
    active?: boolean;
    payload?: ReadonlyArray<{
      name?: string | number;
      value?: number | string | ReadonlyArray<number | string>;
      payload?: {
        name: string;
        value: number;
      };
    }>;
  }

  const renderTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const nameKey = (item.name || "").toString();
      const val = Number(item.value);
      return (
        <div className="bg-slate-900/90 text-white text-xs px-3 py-2 rounded-xl shadow-lg border border-slate-800">
          <span className="capitalize font-medium block">{categoryFriendlyNames[nameKey] || nameKey}</span>
          <span className="text-slate-350">{new Intl.NumberFormat().format(Math.round(val))} kg CO2e ({getPercentage(val)}%)</span>
        </div>
      );
    }
    return null;
  };

  return (
    <Card className="flex flex-col h-full">
      <CardHeader>
        <CardTitle>Footprint Breakdown</CardTitle>
        <CardDescription>Distribution of your annual carbon emissions</CardDescription>
      </CardHeader>
      <CardContent className="flex-1 flex flex-col sm:flex-row items-center gap-6 justify-center min-h-[220px]">
        {/* Left side: Recharts Donut */}
        <div className="w-full sm:w-1/2 h-44 relative flex items-center justify-center">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie
                  data={data}
                  cx="50%"
                  cy="50%"
                  innerRadius={55}
                  outerRadius={75}
                  paddingAngle={4}
                  dataKey="value"
                >
                  {data.map((entry, index) => {
                    const isLargest = entry.name === largestSegment.name;
                    return (
                      <Cell
                        key={`cell-${index}`}
                        fill={entry.color}
                        opacity={isLargest ? 1 : 0.6}
                        stroke={isLargest ? entry.color : "transparent"}
                        strokeWidth={isLargest ? 3 : 0}
                      />
                    );
                  })}
                </Pie>
                <Tooltip content={renderTooltip} />
              </PieChart>
            </ResponsiveContainer>
          ) : (
            <div className="text-xs text-slate-400 font-medium">Loading chart...</div>
          )}

          {/* Center Text inside Donut */}
          {mounted && (
            <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none select-none">
              <span className="text-2xl font-semibold tracking-tight text-slate-900 dark:text-white">
                ~{new Intl.NumberFormat().format(Math.round(total))}
              </span>
              <span className="text-[10px] uppercase font-bold text-slate-400 tracking-wider">
                Total Kg
              </span>
            </div>
          )}
        </div>

        {/* Right side: Legend and exact stats */}
        <div className="w-full sm:w-1/2 space-y-3">
          {data.map((entry) => {
            const Icon = entry.icon;
            const pct = getPercentage(entry.value);
            const isLargest = entry.name === largestSegment.name;
            return (
              <div
                key={entry.name}
                className={`flex items-center justify-between text-sm transition-all duration-200 ${
                  isLargest ? "opacity-100 font-medium" : "opacity-60"
                }`}
              >
                <div className="flex items-center gap-2.5">
                  <div
                    className="p-1.5 rounded-lg text-white"
                    style={{ backgroundColor: entry.color }}
                  >
                    <Icon className="w-4 h-4" />
                  </div>
                  <div>
                    <span className="capitalize block text-slate-800 dark:text-slate-200">
                      {categoryFriendlyNames[entry.name] || entry.name}
                    </span>
                    <span className="text-[11px] text-slate-400 dark:text-slate-500 block">
                      {pct}% of footprint
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-slate-800 dark:text-slate-100 block">
                    ~{new Intl.NumberFormat().format(Math.round(entry.value))}
                  </span>
                  <span className="text-[10px] text-slate-400 dark:text-slate-500 uppercase">
                    kg / yr
                  </span>
                </div>
              </div>
            );
          })}
        </div>
      </CardContent>
      {total > 0 && (
        <CardFooter className="justify-center border-t border-slate-100 dark:border-slate-800 py-3.5 bg-slate-50/40 dark:bg-slate-950/20">
          <Link
            href={`/dashboard/insights?category=${largestSegment.name}`}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700 dark:text-emerald-400 hover:underline flex items-center gap-1.5 transition-all group"
          >
            <span>Your biggest category is {categoryFriendlyNames[largestSegment.name].toLowerCase()} &mdash; see what helps</span>
            <span className="transition-transform group-hover:translate-x-0.5">&rarr;</span>
          </Link>
        </CardFooter>
      )}
    </Card>
  );
};
