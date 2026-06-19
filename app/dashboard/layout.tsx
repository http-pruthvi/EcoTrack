"use client";

import React from "react";
import { useAuth } from "@/components/auth/AuthProvider";
import { Sidebar } from "@/components/layout/Sidebar";
import { MobileTabBar } from "@/components/layout/MobileTabBar";

export default function DashboardLayout({
  children
}: {
  children: React.ReactNode;
}) {
  const { user, loading } = useAuth();

  // Beautiful skeleton loading state to prevent layout shift and look premium
  if (loading || !user) {
    return (
      <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
        {/* Sidebar skeleton */}
        <aside className="hidden md:flex flex-col w-64 bg-slate-900 min-h-screen border-r border-slate-800 p-6 space-y-6">
          <div className="flex items-center gap-3 animate-pulse">
            <div className="w-10 h-10 bg-slate-800 rounded-xl" />
            <div className="space-y-2 flex-1">
              <div className="h-4 bg-slate-800 rounded w-2/3" />
              <div className="h-3 bg-slate-800 rounded w-1/2" />
            </div>
          </div>
          <div className="space-y-4 pt-12 flex-1 animate-pulse">
            {[1, 2, 3, 4, 5].map((i) => (
              <div key={i} className="flex items-center gap-3 py-2">
                <div className="w-5 h-5 bg-slate-800 rounded-lg" />
                <div className="h-4 bg-slate-800 rounded flex-1" />
              </div>
            ))}
          </div>
        </aside>

        {/* Content skeleton */}
        <main className="flex-1 overflow-y-auto p-6 md:p-8 space-y-8 animate-pulse">
          <div className="flex items-center justify-between">
            <div className="space-y-2">
              <div className="h-6 bg-slate-200 dark:bg-slate-800 rounded w-48" />
              <div className="h-4 bg-slate-200 dark:bg-slate-800 rounded w-32" />
            </div>
            <div className="w-10 h-10 bg-slate-250 dark:bg-slate-800 rounded-full" />
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
            <div className="lg:col-span-2 h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
            <div className="h-48 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
          </div>

          <div className="h-64 bg-slate-200 dark:bg-slate-800 rounded-2xl" />
        </main>

        <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white dark:bg-slate-900 border-t border-slate-200 dark:border-slate-800 px-6 flex items-center justify-between">
          {[1, 2, 3, 4, 5].map((i) => (
            <div key={i} className="w-8 h-8 bg-slate-200 dark:bg-slate-850 rounded-xl animate-pulse" />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-screen bg-slate-50 dark:bg-slate-900 overflow-hidden">
      {/* Navigation Sidebar (Desktop) */}
      <Sidebar />

      {/* Main Content Area */}
      <main className="flex-1 overflow-y-auto relative pb-20 md:pb-8 focus:outline-none">
        <div className="max-w-[1100px] mx-auto p-4 sm:p-6 md:p-8 space-y-6 sm:space-y-8">
          {children}
        </div>
      </main>

      {/* Navigation Tab Bar (Mobile) */}
      <MobileTabBar />
    </div>
  );
}
