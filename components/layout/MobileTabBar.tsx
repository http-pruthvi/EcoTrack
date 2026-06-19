"use client";

import React from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";
import {
  LayoutDashboard,
  Lightbulb,
  CheckSquare,
  BarChart3,
  User
} from "lucide-react";

export const MobileTabBar: React.FC = () => {
  const pathname = usePathname();

  const navItems = [
    { name: "Dashboard", href: "/dashboard", icon: LayoutDashboard },
    { name: "Insights", href: "/dashboard/insights", icon: Lightbulb },
    { name: "Habits", href: "/dashboard/habits", icon: CheckSquare },
    { name: "History", href: "/dashboard/history", icon: BarChart3 },
    { name: "Profile", href: "/dashboard/profile", icon: User }
  ];

  return (
    <div className="md:hidden fixed bottom-0 left-0 right-0 h-16 bg-white/80 dark:bg-slate-900/80 backdrop-blur-md border-t border-slate-200 dark:border-slate-800 z-50 px-4 flex items-center justify-between safe-bottom">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        const Icon = item.icon;

        return (
          <Link
            key={item.name}
            href={item.href}
            className="flex flex-col items-center justify-center flex-1 py-1 px-2 text-center group"
          >
            <div
              className={`p-1.5 rounded-xl transition-all duration-300 ${
                isActive
                  ? "text-primary-600 dark:text-primary-400 bg-primary-50 dark:bg-primary-950/40"
                  : "text-slate-400 dark:text-slate-500 hover:text-slate-600 dark:hover:text-slate-350"
              }`}
            >
              <Icon className="w-5 h-5 transition-transform group-active:scale-90" />
            </div>
            <span
              className={`text-[10px] tracking-wide mt-0.5 select-none font-medium capitalize transition-colors duration-200 ${
                isActive ? "text-primary-600 dark:text-primary-400" : "text-slate-400 dark:text-slate-500"
              }`}
            >
              {item.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
};
