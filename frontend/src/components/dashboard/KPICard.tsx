"use client";

import { motion } from "framer-motion";
import { LucideIcon } from "lucide-react";
import * as Icons from "lucide-react";
import { cn } from "@/lib/utils";
import { AnimatedCounter } from "@/components/ui/animated-counter";
import { TrendIndicator } from "@/components/ui/trend-indicator";
import { MiniSparkline } from "@/components/ui/mini-sparkline";
import { cardVariants } from "@/lib/utils";

interface KPICardProps {
  title: string;
  value: number;
  prefix?: string;
  suffix?: string;
  trend: number;
  trendLabel: string;
  iconName: string;
  iconColor: string;
  sparklineData: number[];
  delay?: number;
}

const iconColorMap: Record<string, string> = {
  blue: "bg-blue-50 text-blue-600",
  purple: "bg-violet-50 text-violet-600",
  green: "bg-emerald-50 text-emerald-600",
  pink: "bg-pink-50 text-pink-600",
  amber: "bg-amber-50 text-amber-600",
  teal: "bg-teal-50 text-teal-600",
  indigo: "bg-indigo-50 text-indigo-600",
  rose: "bg-rose-50 text-rose-600",
};

const sparklineColorMap: Record<string, string> = {
  blue: "#2563EB",
  purple: "#7C3AED",
  green: "#059669",
  pink: "#DB2777",
  amber: "#D97706",
  teal: "#0D9488",
  indigo: "#4F46E5",
  rose: "#E11D48",
};

export function KPICard({
  title,
  value,
  prefix,
  suffix,
  trend,
  trendLabel,
  iconName,
  iconColor,
  sparklineData,
  delay = 0,
}: KPICardProps) {
  // Dynamically get icon from lucide
  const Icon = ((Icons as Record<string, unknown>)[iconName] || Icons.TrendingUp) as LucideIcon;

  return (
    <motion.div
      variants={cardVariants}
      initial="initial"
      animate="animate"
      whileHover={{ y: -2, boxShadow: "0 12px 40px rgba(0,0,0,0.10)" }}
      transition={{ delay, duration: 0.3 }}
      className="card card-hover flex flex-col gap-3 p-5"
    >
      {/* Top row: icon + trend */}
      <div className="flex items-start justify-between">
        <div className={cn("flex h-10 w-10 items-center justify-center rounded-xl", iconColorMap[iconColor] ?? iconColorMap.blue)}>
          <Icon className="h-5 w-5" />
        </div>
        <TrendIndicator value={trend} label={trendLabel} />
      </div>

      {/* Value */}
      <div>
        <p className="text-xs font-medium text-[var(--text-muted)] uppercase tracking-wide">
          {title}
        </p>
        <p className="mt-1 text-2xl font-bold tracking-tight text-[var(--text-primary)]">
          <AnimatedCounter
            value={value}
            prefix={prefix}
            suffix={suffix}
            duration={1.0}
            formatFn={
              prefix === "$"
                ? (v) => {
                    if (v >= 1000000) return `${(v / 1000000).toFixed(1)}M`;
                    if (v >= 1000) return `${(v / 1000).toFixed(0)}K`;
                    return v.toLocaleString("en-US");
                  }
                : undefined
            }
          />
        </p>
      </div>

      {/* Sparkline */}
      <div className="-mx-1 mt-auto">
        <MiniSparkline
          data={sparklineData}
          color={sparklineColorMap[iconColor] ?? sparklineColorMap.blue}
          height={32}
        />
      </div>
    </motion.div>
  );
}
