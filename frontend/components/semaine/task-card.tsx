"use client";

import { CalendarPlus, GripVertical } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import type { BoardTask } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/constants";

interface TaskCardProps {
  task: BoardTask;
  onSchedule: (task: BoardTask) => void;
}

export function TaskCard({ task, onSchedule }: TaskCardProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `task-${task.id}`,
      data: { task },
    });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        opacity: isDragging ? 0.4 : 1,
        zIndex: isDragging ? 50 : undefined,
      }
    : undefined;

  const color = CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.autre;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg bg-surface-0 px-2.5 py-1.5"
    >
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab text-text-muted hover:text-text-secondary active:cursor-grabbing"
      >
        <GripVertical className="h-3 w-3" />
      </button>
      <span
        className="h-1.5 w-1.5 shrink-0 rounded-full"
        style={{ background: color }}
      />
      <span className="flex-1 truncate text-xs">{task.title}</span>
      <button
        onClick={() => onSchedule(task)}
        className="shrink-0 rounded p-0.5 text-text-muted transition-colors hover:bg-accent-blue/20 hover:text-accent-blue"
        title="Planifier"
      >
        <CalendarPlus className="h-3 w-3" />
      </button>
    </div>
  );
}
