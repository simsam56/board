import type { PlannerEvent } from "@/lib/types";

const DAY_LABELS = ["Lun", "Mar", "Mer", "Jeu", "Ven", "Sam", "Dim"];

export interface DayInfo {
  date: string; // YYYY-MM-DD
  label: string; // "Lun", "Mar", ...
  dayNum: number; // 16, 17, ...
  isToday: boolean;
}

export function getWeekDays(weekStart: string): DayInfo[] {
  const start = new Date(weekStart + "T00:00:00");
  const todayStr = new Date().toISOString().slice(0, 10);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(start);
    d.setDate(d.getDate() + i);
    const date = d.toISOString().slice(0, 10);
    return {
      date,
      label: DAY_LABELS[i],
      dayNum: d.getDate(),
      isToday: date === todayStr,
    };
  });
}

export function groupEventsByDay(
  events: PlannerEvent[],
  weekStart: string,
): Map<string, PlannerEvent[]> {
  const days = getWeekDays(weekStart);
  const map = new Map<string, PlannerEvent[]>();
  for (const d of days) map.set(d.date, []);

  for (const ev of events) {
    const date = ev.start_at.slice(0, 10);
    const bucket = map.get(date);
    if (bucket) bucket.push(ev);
  }

  // Sort each day by start time
  for (const [, evts] of map) {
    evts.sort((a, b) => a.start_at.localeCompare(b.start_at));
  }
  return map;
}

export function computeTimeRange(events: PlannerEvent[]): {
  startHour: number;
  endHour: number;
} {
  if (events.length === 0) return { startHour: 7, endHour: 22 };

  let minH = 23;
  let maxH = 0;
  for (const ev of events) {
    const sh = new Date(ev.start_at).getHours();
    const eh = new Date(ev.end_at).getHours();
    const em = new Date(ev.end_at).getMinutes();
    if (sh < minH) minH = sh;
    if (eh + (em > 0 ? 1 : 0) > maxH) maxH = eh + (em > 0 ? 1 : 0);
  }

  return {
    startHour: Math.max(6, minH - 1),
    endHour: Math.min(23, Math.max(maxH + 1, minH + 4)),
  };
}

export function getEventPosition(
  event: PlannerEvent,
  startHour: number,
  endHour: number,
): { topPercent: number; heightPercent: number } {
  const totalMinutes = (endHour - startHour) * 60;
  const start = new Date(event.start_at);
  const end = new Date(event.end_at);

  const startMin =
    (start.getHours() - startHour) * 60 + start.getMinutes();
  const endMin = (end.getHours() - startHour) * 60 + end.getMinutes();
  const duration = Math.max(endMin - startMin, 15); // minimum 15min visible

  return {
    topPercent: Math.max(0, (startMin / totalMinutes) * 100),
    heightPercent: Math.min(
      (duration / totalMinutes) * 100,
      100 - Math.max(0, (startMin / totalMinutes) * 100),
    ),
  };
}

export interface OverlapInfo {
  column: number;
  totalColumns: number;
}

export function detectOverlaps(
  events: PlannerEvent[],
): Map<string, OverlapInfo> {
  const result = new Map<string, OverlapInfo>();
  if (events.length === 0) return result;

  const sorted = [...events].sort((a, b) =>
    a.start_at.localeCompare(b.start_at),
  );

  // Greedy column assignment
  const columns: { end: string; id: string }[][] = [];

  for (const ev of sorted) {
    let placed = false;
    for (let col = 0; col < columns.length; col++) {
      const last = columns[col][columns[col].length - 1];
      if (last.end <= ev.start_at) {
        columns[col].push({ end: ev.end_at, id: ev.id });
        result.set(ev.id, { column: col, totalColumns: 0 });
        placed = true;
        break;
      }
    }
    if (!placed) {
      columns.push([{ end: ev.end_at, id: ev.id }]);
      result.set(ev.id, { column: columns.length - 1, totalColumns: 0 });
    }
  }

  // Set totalColumns for all events
  const total = columns.length;
  for (const [id, info] of result) {
    result.set(id, { ...info, totalColumns: total });
  }

  return result;
}

export function formatHour(hour: number): string {
  return `${hour}h`;
}

export function formatEventTime(iso: string): string {
  const d = new Date(iso);
  return `${d.getHours()}:${d.getMinutes().toString().padStart(2, "0")}`;
}
