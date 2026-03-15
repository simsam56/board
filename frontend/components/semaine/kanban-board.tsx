"use client";

import type { BoardTask, TriageStatus } from "@/lib/types";
import { TriageColumn } from "./triage-column";

const COLUMNS: { status: TriageStatus; label: string }[] = [
  { status: "urgent", label: "Urgent" },
  { status: "a_planifier", label: "A planifier" },
  { status: "non_urgent", label: "Secondaire" },
  { status: "termine", label: "Termine" },
];

interface KanbanBoardProps {
  tasks: BoardTask[];
  onSchedule: (task: BoardTask) => void;
}

export function KanbanBoard({ tasks, onSchedule }: KanbanBoardProps) {
  const grouped = new Map<TriageStatus, BoardTask[]>();
  for (const col of COLUMNS) grouped.set(col.status, []);
  for (const t of tasks) {
    const bucket = grouped.get(t.triage_status as TriageStatus);
    if (bucket) bucket.push(t);
  }

  return (
    <div className="glass rounded-2xl p-5">
      <div className="grid grid-cols-2 gap-3 lg:grid-cols-4">
        {COLUMNS.map((col) => (
          <TriageColumn
            key={col.status}
            status={col.status}
            label={col.label}
            tasks={grouped.get(col.status) ?? []}
            onSchedule={onSchedule}
          />
        ))}
      </div>
    </div>
  );
}
