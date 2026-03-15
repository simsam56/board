"use client";

import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight } from "lucide-react";
import type { PlannerEvent } from "@/lib/types";
import { DayColumn } from "./day-column";
import {
  computeTimeRange,
  formatHour,
  getWeekDays,
  groupEventsByDay,
} from "./week-calendar-utils";

interface WeekCalendarProps {
  events: PlannerEvent[];
  weekStart: string;
  onPrev?: () => void;
  onNext?: () => void;
  onToday?: () => void;
  isCurrentWeek?: boolean;
  onEditEvent?: (event: PlannerEvent) => void;
  onDeleteEvent?: (event: PlannerEvent) => void;
}

export function WeekCalendar({
  events,
  weekStart,
  onPrev,
  onNext,
  onToday,
  isCurrentWeek = true,
  onEditEvent,
  onDeleteEvent,
}: WeekCalendarProps) {
  const days = getWeekDays(weekStart);
  const eventsByDay = groupEventsByDay(events, weekStart);
  const { startHour, endHour } = computeTimeRange(events);
  const totalHours = endHour - startHour;
  const pxPerHour = Math.max(40, 600 / totalHours);
  const gridHeight = totalHours * pxPerHour;

  // Current time indicator
  const [nowPercent, setNowPercent] = useState<number | null>(null);
  useEffect(() => {
    const update = () => {
      const now = new Date();
      const mins = (now.getHours() - startHour) * 60 + now.getMinutes();
      const total = totalHours * 60;
      const pct = (mins / total) * 100;
      setNowPercent(pct >= 0 && pct <= 100 ? pct : null);
    };
    update();
    const id = setInterval(update, 60_000);
    return () => clearInterval(id);
  }, [startHour, totalHours]);

  const hours = Array.from({ length: totalHours }, (_, i) => startHour + i);

  // Week label: "10 – 16 mars 2026"
  const firstDay = days[0];
  const lastDay = days[6];
  const fmt = (dateStr: string) => {
    const d = new Date(dateStr + "T00:00:00");
    return d.toLocaleDateString("fr-FR", { day: "numeric", month: "short" });
  };
  const yearStr = new Date(firstDay.date + "T00:00:00").getFullYear();
  const weekLabel = `${fmt(firstDay.date)} – ${fmt(lastDay.date)} ${yearStr}`;

  return (
    <div className="glass rounded-2xl p-4">
      {/* Navigation */}
      <div className="mb-3 flex items-center justify-between">
        <div className="flex items-center gap-1">
          <button
            onClick={onPrev}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-1 hover:text-text-primary"
            aria-label="Semaine precedente"
          >
            <ChevronLeft className="h-4 w-4" />
          </button>
          <button
            onClick={onNext}
            className="rounded-lg p-1.5 text-text-muted transition-colors hover:bg-surface-1 hover:text-text-primary"
            aria-label="Semaine suivante"
          >
            <ChevronRight className="h-4 w-4" />
          </button>
        </div>

        <span className="text-sm font-medium text-text-secondary">{weekLabel}</span>

        {!isCurrentWeek && (
          <button
            onClick={onToday}
            className="rounded-lg px-2.5 py-1 text-[11px] font-medium text-accent-blue transition-colors hover:bg-accent-blue/10"
          >
            Aujourd&apos;hui
          </button>
        )}
        {isCurrentWeek && <div />}
      </div>

      <div className="overflow-x-auto md:overflow-visible">
        <div className="grid min-w-[700px] grid-cols-[3rem_repeat(7,1fr)] gap-1 md:min-w-0">
          {/* Header spacer for time gutter */}
          <div />
          {/* Day headers rendered inside DayColumn */}
          {days.map((d) => (
            <div key={d.date} />
          ))}

          {/* Time gutter + day columns */}
          <div
            className="relative pr-1 text-right"
            style={{ height: gridHeight }}
          >
            {hours.map((h) => (
              <div
                key={h}
                className="absolute right-1 -translate-y-1/2 text-[10px] text-text-muted"
                style={{ top: (h - startHour) * pxPerHour }}
              >
                {formatHour(h)}
              </div>
            ))}
          </div>

          {days.map((d) => (
            <DayColumn
              key={d.date}
              day={d}
              events={eventsByDay.get(d.date) ?? []}
              startHour={startHour}
              endHour={endHour}
              pxPerHour={pxPerHour}
              onEditEvent={onEditEvent}
              onDeleteEvent={onDeleteEvent}
            />
          ))}

          {/* Current time line (only on current week) */}
          {isCurrentWeek && nowPercent !== null && (
            <div
              className="pointer-events-none absolute left-[3rem] right-0 z-10 border-t-2 border-accent-red/70"
              style={{ top: `${nowPercent}%` }}
            >
              <div className="absolute -left-1 -top-1 h-2 w-2 rounded-full bg-accent-red" />
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
