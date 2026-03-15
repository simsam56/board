"use client";

import { useDroppable } from "@dnd-kit/core";
import clsx from "clsx";
import type { BoardTask } from "@/lib/types";
import type { TriageStatus } from "@/lib/types";
import { TaskCard } from "./task-card";

const COLUMN_STYLES: Record<string, { accent: string; icon: string }> = {
  urgent: { accent: "text-accent-red", icon: "🔴" },
  a_planifier: { accent: "text-accent-blue", icon: "📅" },
  non_urgent: { accent: "text-text-muted", icon: "💤" },
  termine: { accent: "text-accent-green", icon: "✓" },
};

interface TriageColumnProps {
  status: TriageStatus;
  label: string;
  tasks: BoardTask[];
  onSchedule: (task: BoardTask) => void;
}

export function TriageColumn({ status, label, tasks, onSchedule }: TriageColumnProps) {
  const { setNodeRef, isOver } = useDroppable({
    id: `triage-${status}`,
    data: { triageStatus: status },
  });

  const style = COLUMN_STYLES[status] ?? COLUMN_STYLES.non_urgent;

  return (
    <div
      ref={setNodeRef}
      className={clsx(
        "flex flex-col rounded-xl bg-surface-0/50 p-3 transition-colors",
        isOver && "ring-1 ring-accent-blue/40 bg-accent-blue/5",
      )}
    >
      <div className="mb-2 flex items-center gap-1.5">
        <span className="text-xs">{style.icon}</span>
        <span className={clsx("text-xs font-semibold", style.accent)}>{label}</span>
        <span className="ml-auto text-[10px] text-text-muted">{tasks.length}</span>
      </div>

      {tasks.length === 0 ? (
        <p className="py-4 text-center text-[10px] text-text-muted">
          Glissez ici
        </p>
      ) : (
        <div className="space-y-1.5">
          {tasks.map((t) => (
            <TaskCard key={t.id} task={t} onSchedule={onSchedule} />
          ))}
        </div>
      )}
    </div>
  );
}
