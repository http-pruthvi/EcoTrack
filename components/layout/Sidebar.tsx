"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { useAuth } from "@/components/auth/AuthProvider";
import {
  LayoutDashboard,
  Lightbulb,
  CheckSquare,
  BarChart3,
  User,
  LogOut,
  Leaf,
  Sparkles
} from "lucide-react";

export const Sidebar: React.FC = () => {
  const pathname = usePathname();
  const { user, logout } = useAuth();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "EcoAI Hub", href: "/dashboard/ai", icon: Sparkles },
    { name: "Insights", href: "/dashboard/insights", icon: Lightbulb },
    { name: "Habits", href: "/dashboard/habits", icon: CheckSquare },
    { name: "History", href: "/dashboard/history", icon: BarChart3 },
    { name: "Profile", href: "/dashboard/profile", icon: User }
  ];

  return (
    <aside className="hidden md:flex flex-col w-64 bg-slate-900 text-slate-100 min-h-screen border-r border-slate-800 shrink-0">
      {/* Header */}
      <div className="p-6 border-b border-slate-800 flex items-center gap-3">
        <div className="p-2 bg-primary-600 rounded-lg text-white">
          <Leaf className="w-6 h-6" />
        </div>
        <div>
          <span className="font-semibold tracking-wide text-lg text-white block">EcoTrack</span>
          <span className="text-xs text-slate-400">Carbon Footprints Made Simple</span>
        </div>
      </div>

      {/* Navigation */}
      <nav className="flex-1 p-4 space-y-1">
        {navItems.map((item) => {
          const isActive = pathname === item.href;
          const Icon = item.icon;

          return (
            <Link
              key={item.name}
              href={item.href}
              className={`flex items-center gap-3 px-4 py-3 rounded-xl transition-all duration-200 group ${
                isActive
                  ? "bg-primary-600 text-white shadow-lg shadow-primary-900/20"
                  : "text-slate-400 hover:bg-slate-800 hover:text-slate-100"
              }`}
            >
              <Icon className={`w-5 h-5 transition-transform group-hover:scale-110 ${isActive ? "text-white" : "text-slate-400 group-hover:text-slate-100"}`} />
              <span className="capitalize font-medium text-sm">{item.name}</span>
            </Link>
          );
        })}
      </nav>

      {/* User Footer info */}
      <div className="p-4 border-t border-slate-800 space-y-3 bg-slate-950/40">
        {user && (
          <div className="flex items-center gap-3 px-2 py-1">
            <div className="w-9 h-9 rounded-full bg-primary-600/20 text-primary-400 border border-primary-500/20 flex items-center justify-center font-semibold text-sm select-none uppercase">
              {user.displayName ? user.displayName.substring(0, 2) : "ET"}
            </div>
            <div className="overflow-hidden">
              <span className="font-medium text-sm text-slate-200 block truncate">{user.displayName || "User"}</span>
              <span className="text-xs text-slate-400 block truncate">{user.email}</span>
            </div>
          </div>
        )}
        <button
          onClick={() => logout()}
          className="flex items-center gap-3 w-full px-4 py-2.5 text-left text-sm text-slate-400 hover:text-secondary-400 rounded-xl hover:bg-slate-800/50 transition-all group"
        >
          <LogOut className="w-4.5 h-4.5 transition-transform group-hover:translate-x-1" />
          <span>Sign Out</span>
        </button>
        <div className="text-[10px] text-slate-500 text-center select-none font-medium pt-1">
          Developed by Pruthvi
        </div>
      </div>
    </aside>
  );
};
