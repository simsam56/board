"use client";

import { TrendPill } from "./trend-pill";
import type { WeeklyTrend } from "@/lib/types";

interface TrendPillRowProps {
  trends: WeeklyTrend[];
}

const METRIC_ORDER = ["rhr", "hrv_sdnn", "sleep_h", "vo2max"];

export function TrendPillRow({ trends }: TrendPillRowProps) {
  const sorted = METRIC_ORDER
    .map((m) => trends.find((t) => t.metric === m))
    .filter(Boolean) as WeeklyTrend[];

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
      {sorted.map((t) => (
        <TrendPill key={t.metric} trend={t} />
      ))}
    </div>
  );
}
