"use client";

import clsx from "clsx";
import type { PlannerEvent } from "@/lib/types";
import { EventBlock } from "./event-block";
import {
  type DayInfo,
  detectOverlaps,
  getEventPosition,
} from "./week-calendar-utils";

interface DayColumnProps {
  day: DayInfo;
  events: PlannerEvent[];
  startHour: number;
  endHour: number;
  pxPerHour: number;
}

export function DayColumn({
  day,
  events,
  startHour,
  endHour,
  pxPerHour,
}: DayColumnProps) {
  const totalHours = endHour - startHour;
  const height = totalHours * pxPerHour;
  const overlaps = detectOverlaps(events);

  return (
    <div className="flex flex-col">
      {/* Header */}
      <div
        className={clsx(
          "mb-1 rounded-lg px-2 py-1.5 text-center",
          day.isToday
            ? "glass-strong border border-accent-blue/30 text-accent-blue"
            : "text-text-secondary",
        )}
      >
        <div className="text-[10px] font-medium uppercase">{day.label}</div>
        <div className="text-lg font-bold">{day.dayNum}</div>
      </div>

      {/* Time grid */}
      <div className="relative" style={{ height }}>
        {/* Hour lines */}
        {Array.from({ length: totalHours }, (_, i) => (
          <div
            key={i}
            className="absolute w-full border-b border-white/5"
            style={{ top: i * pxPerHour }}
          />
        ))}

        {/* Events */}
        {events.map((ev) => {
          const pos = getEventPosition(ev, startHour, endHour);
          const overlap = overlaps.get(ev.id) ?? {
            column: 0,
            totalColumns: 1,
          };
          return (
            <EventBlock
              key={ev.id}
              event={ev}
              topPercent={pos.topPercent}
              heightPercent={pos.heightPercent}
              column={overlap.column}
              totalColumns={overlap.totalColumns}
            />
          );
        })}
      </div>
    </div>
  );
}
