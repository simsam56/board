"use client";

import { CATEGORY_COLORS } from "@/lib/constants";
import type { PlannerEvent } from "@/lib/types";
import { formatEventTime } from "./week-calendar-utils";

interface EventBlockProps {
  event: PlannerEvent;
  topPercent: number;
  heightPercent: number;
  column: number;
  totalColumns: number;
}

export function EventBlock({
  event,
  topPercent,
  heightPercent,
  column,
  totalColumns,
}: EventBlockProps) {
  const color = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.autre;
  const widthPct = 100 / totalColumns;
  const leftPct = column * widthPct;
  const showTime = heightPercent > 6;

  return (
    <div
      className="absolute cursor-pointer overflow-hidden rounded px-1.5 py-0.5 transition-transform hover:scale-[1.02]"
      style={{
        top: `${topPercent}%`,
        height: `${heightPercent}%`,
        minHeight: 18,
        left: `${leftPct}%`,
        width: `${widthPct}%`,
        borderLeft: `3px solid ${color}`,
        background: `color-mix(in srgb, ${color} 12%, var(--color-surface-0))`,
      }}
      title={`${event.title}\n${formatEventTime(event.start_at)} – ${formatEventTime(event.end_at)}`}
    >
      <p className="truncate text-[11px] font-medium text-text-primary">
        {event.title}
      </p>
      {showTime && (
        <p className="text-[10px] text-text-muted">
          {formatEventTime(event.start_at)} – {formatEventTime(event.end_at)}
        </p>
      )}
    </div>
  );
}
