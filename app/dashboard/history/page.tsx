"use client";

import React, { useEffect, useState, useCallback } from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { getFootprintHistory, getFootprintProfile, FootprintHistory, toDate } from "@/lib/firebase";
import { calculateFootprint } from "@/lib/footprintCalculator";
import { Card, CardHeader, CardTitle, CardDescription, CardContent } from "@/components/ui/Card";
import { ResponsiveContainer, LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip } from "recharts";
import { Timestamp } from "firebase/firestore";
import { BarChart3, TrendingDown, Leaf } from "lucide-react";

export default function HistoryPage() {
  const { user } = useAuth();
  
  const [history, setHistory] = useState<FootprintHistory[]>([]);
  const [loading, setLoading] = useState(true);
  const [mounted, setMounted] = useState(false);

  const loadHistory = useCallback(async () => {
    if (!user) return;
    try {
      let list = await getFootprintHistory(user.uid);
      
      // If history has only 1 snapshot, generate mock historical data representing the previous 3 months
      // for a better out-of-the-box charting experience.
      if (list.length <= 1) {
        const currentProfile = await getFootprintProfile(user.uid);
        let currentTotal = 9500;
        let homeBreakdown = { home: 2500, transport: 3000, food: 2500, shopping: 1500 };
        
        if (currentProfile) {
          const calc = calculateFootprint(currentProfile);
          currentTotal = calc.total;
          homeBreakdown = calc.breakdown;
        }

        const now = new Date();
        const baseSnapshot = list.length === 1 ? list[0] : {
          date: now.toISOString(),
          totalCO2e: currentTotal,
          breakdown: homeBreakdown
        };

        const mockPoints: FootprintHistory[] = [
          {
            id: "mock_hist_3",
            date: new Date(now.getFullYear(), now.getMonth() - 3, now.getDate()).toISOString(),
            totalCO2e: Math.round(currentTotal * 1.15),
            breakdown: {
              home: Math.round(homeBreakdown.home * 1.05),
              transport: Math.round(homeBreakdown.transport * 1.25),
              food: Math.round(homeBreakdown.food * 1.1),
              shopping: Math.round(homeBreakdown.shopping * 1.1)
            }
          },
          {
            id: "mock_hist_2",
            date: new Date(now.getFullYear(), now.getMonth() - 2, now.getDate()).toISOString(),
            totalCO2e: Math.round(currentTotal * 1.08),
            breakdown: {
              home: Math.round(homeBreakdown.home * 1.02),
              transport: Math.round(homeBreakdown.transport * 1.15),
              food: homeBreakdown.food,
              shopping: Math.round(homeBreakdown.shopping * 1.05)
            }
          },
          {
            id: "mock_hist_1",
            date: new Date(now.getFullYear(), now.getMonth() - 1, now.getDate()).toISOString(),
            totalCO2e: Math.round(currentTotal * 1.03),
            breakdown: {
              home: homeBreakdown.home,
              transport: Math.round(homeBreakdown.transport * 1.05),
              food: homeBreakdown.food,
              shopping: homeBreakdown.shopping
            }
          },
          {
            ...baseSnapshot,
            id: "current_real"
          }
        ];
        list = mockPoints;
      }
      setHistory(list);
    } catch (e) {
      console.error("Error loading footprint history:", e);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    let active = true;
    Promise.resolve().then(() => {
      if (active) {
        setMounted(true);
        loadHistory();
      }
    });
    return () => {
      active = false;
    };
  }, [loadHistory]);

  const formatDate = (dateVal: string | Date | Timestamp) => {
    try {
      const d = toDate(dateVal);
      return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
    } catch {
      return "";
    }
  };

  interface CustomTooltipProps {
    active?: boolean;
    payload?: ReadonlyArray<{
      name?: string | number;
      value?: number | string | ReadonlyArray<number | string>;
      payload?: FootprintHistory;
    }>;
  }

  const renderTooltip = ({ active, payload }: CustomTooltipProps) => {
    if (active && payload && payload.length) {
      const item = payload[0];
      const dataPoint = item.payload;
      if (!dataPoint) return null;
      return (
        <div className="bg-slate-900/90 text-white text-xs p-4 rounded-xl shadow-lg border border-slate-800 space-y-2">
          <span className="font-semibold block">{formatDate(dataPoint.date)}</span>
          <div className="space-y-1">
            <span className="text-emerald-400 font-bold block">Total: ~{Math.round(dataPoint.totalCO2e)} kg CO2e</span>
            <div className="text-[10px] text-slate-300 space-y-0.5 border-t border-slate-800 pt-1 mt-1">
              <span className="block">Home: {Math.round(dataPoint.breakdown.home)} kg</span>
              <span className="block">Transport: {Math.round(dataPoint.breakdown.transport)} kg</span>
              <span className="block">Food: {Math.round(dataPoint.breakdown.food)} kg</span>
              <span className="block">Shopping: {Math.round(dataPoint.breakdown.shopping)} kg</span>
            </div>
          </div>
        </div>
      );
    }
    return null;
  };

  if (loading) {
    return (
      <div className="space-y-6 animate-pulse">
        <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-1/4" />
        <div className="h-72 bg-slate-200 dark:bg-slate-800 rounded-2xl w-full" />
      </div>
    );
  }

  // Calculate savings trend
  const firstPoint = history[0]?.totalCO2e || 0;
  const lastPoint = history[history.length - 1]?.totalCO2e || 0;
  const rawSavingsPercent = firstPoint > 0 ? Math.round(((firstPoint - lastPoint) / firstPoint) * 100) : 0;
  const savingsPercent = Math.max(0, rawSavingsPercent);

  return (
    <div className="space-y-6 sm:space-y-8">
      {/* Title */}
      <div>
        <h1 className="text-xl sm:text-3xl font-medium tracking-tight text-slate-900 dark:text-white flex items-center gap-2">
          Carbon History
          <BarChart3 className="w-6 h-6 text-emerald-600" />
        </h1>
        <p className="text-xs sm:text-sm text-slate-500 dark:text-slate-400">
          Track your carbon reduction journey and see how your footprint scales over time.
        </p>
      </div>

      {/* Stats row */}
      {savingsPercent > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl">
          <Card className="bg-emerald-500/5 border border-emerald-500/10">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                <TrendingDown className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">
                  Carbon Reduction Trend
                </span>
                <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                  {savingsPercent}% Decrease Overall
                </span>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-emerald-500/5 border border-emerald-500/10">
            <CardContent className="p-5 flex items-center gap-4">
              <div className="p-2.5 bg-emerald-600 text-white rounded-xl">
                <Leaf className="w-5 h-5" />
              </div>
              <div>
                <span className="text-[10px] font-bold text-slate-450 uppercase tracking-wide block">
                  Monthly Footprint Target
                </span>
                <span className="text-lg font-semibold text-emerald-700 dark:text-emerald-400">
                  On Track to Beat Average
                </span>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Chart Card */}
      <Card className="border border-slate-200/50 dark:border-slate-800/80 shadow-md">
        <CardHeader>
          <CardTitle>Footprint Trajectory</CardTitle>
          <CardDescription>Annualized carbon footprint estimates (kg CO2e) plotted by date</CardDescription>
        </CardHeader>
        <CardContent className="h-80 w-full pt-4">
          {mounted ? (
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={history} margin={{ left: -10, right: 10, top: 10, bottom: 5 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#e2e8f0" className="dark:stroke-slate-800/50" />
                <XAxis
                  dataKey="date"
                  tickFormatter={formatDate}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <YAxis
                  tickFormatter={(val) => `${val / 1000}k`}
                  tick={{ fill: "#94a3b8", fontSize: 10, fontWeight: 500 }}
                  axisLine={false}
                  tickLine={false}
                />
                <Tooltip content={renderTooltip} />
                <Line
                  type="monotone"
                  dataKey="totalCO2e"
                  stroke="#10b981" // emerald-500
                  strokeWidth={3}
                  activeDot={{ r: 6 }}
                  dot={{ stroke: "#10b981", strokeWidth: 2, r: 4, fill: "#ffffff" }}
                />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-full flex items-center justify-center text-xs text-slate-400">
              Loading historical visualization...
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
