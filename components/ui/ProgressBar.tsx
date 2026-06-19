"use client";

import React from "react";

interface ProgressBarProps {
  value: number; // current progress
  max?: number;  // target (defaults to 100)
  color?: "primary" | "secondary" | "slate" | "emerald";
  size?: "sm" | "md" | "lg";
  className?: string;
  showLabel?: boolean;
  easing?: "linear" | "ease-in-cubic" | "ease-out-cubic" | "ease-in-quad";
  markerValue?: number;
  markerLabel?: string;
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  value,
  max = 100,
  color = "primary",
  size = "md",
  className = "",
  showLabel = false,
  easing = "linear",
  markerValue,
  markerLabel
}) => {
  const linearFraction = Math.min(1, Math.max(0, value / max));
  
  // Calculate eased percentage
  let easedFraction = linearFraction;
  if (easing === "ease-in-cubic") {
    easedFraction = Math.pow(linearFraction, 3);
  } else if (easing === "ease-out-cubic") {
    easedFraction = 1 - Math.pow(1 - linearFraction, 3);
  } else if (easing === "ease-in-quad") {
    easedFraction = Math.pow(linearFraction, 2);
  }

  const percentage = Math.round(easedFraction * 100);

  // Calculate marker visual position (matching progress bar easing)
  let markerPercentage = 0;
  if (markerValue !== undefined) {
    const markerLinearFraction = Math.min(1, Math.max(0, markerValue / max));
    let markerEasedFraction = markerLinearFraction;
    if (easing === "ease-in-cubic") {
      markerEasedFraction = Math.pow(markerLinearFraction, 3);
    } else if (easing === "ease-out-cubic") {
      markerEasedFraction = 1 - Math.pow(1 - markerLinearFraction, 3);
    } else if (easing === "ease-in-quad") {
      markerEasedFraction = Math.pow(markerLinearFraction, 2);
    }
    markerPercentage = Math.round(markerEasedFraction * 100);
  }

  const sizeClasses = {
    sm: "h-1.5",
    md: "h-2.5",
    lg: "h-4"
  };

  const colorClasses = {
    primary: "bg-emerald-600 dark:bg-emerald-500",
    secondary: "bg-amber-500 dark:bg-amber-500",
    slate: "bg-slate-500 dark:bg-slate-400",
    emerald: "bg-emerald-600 dark:bg-emerald-500"
  };

  const isCompleted = value >= max;

  return (
    <div className={`w-full relative ${className}`}>
      {showLabel && (
        <div className="flex justify-between items-center mb-1.5 text-xs text-slate-500 dark:text-slate-400 font-medium">
          <span>Progress</span>
          <span>{percentage}%</span>
        </div>
      )}
      
      {/* Progress Track */}
      <div className={`w-full bg-slate-200 dark:bg-slate-800 rounded-full overflow-visible relative ${sizeClasses[size]}`}>
        {/* Progress Fill */}
        <div
          className={`h-full rounded-full transition-all duration-500 cubic-bezier(0.4, 0, 0.2, 1) ${
            isCompleted ? colorClasses.emerald : colorClasses[color]
          }`}
          style={{ width: `${percentage}%` }}
        />

        {/* Marker */}
        {markerValue !== undefined && !isCompleted && (
          <div
            className="absolute top-0 bottom-0 w-0.5 bg-slate-400 dark:bg-slate-650 z-10 overflow-visible"
            style={{ left: `${markerPercentage}%` }}
          >
            {/* Marker Label */}
            {markerLabel && (
              <span className="absolute top-4 left-1/2 -translate-x-1/2 text-[9px] text-slate-400 dark:text-slate-500 whitespace-nowrap font-medium pointer-events-none">
                {markerLabel}
              </span>
            )}
          </div>
        )}
      </div>
    </div>
  );
};
