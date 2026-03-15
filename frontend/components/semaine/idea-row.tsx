"use client";

import { CalendarPlus, GripVertical, Lightbulb } from "lucide-react";
import { useDraggable } from "@dnd-kit/core";
import type { BoardTask } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/constants";

interface IdeaRowProps {
  task: BoardTask;
  onSchedule: (task: BoardTask) => void;
}

export function IdeaRow({ task, onSchedule }: IdeaRowProps) {
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `idea-${task.id}`,
      data: { task },
    });

  const style = transform
    ? {
        transform: `translate(${transform.x}px, ${transform.y}px)`,
        opacity: isDragging ? 0.5 : 1,
      }
    : undefined;

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="flex items-center gap-2 rounded-lg bg-surface-0 px-3 py-2"
    >
      <button
        {...listeners}
        {...attributes}
        className="cursor-grab text-text-muted hover:text-text-secondary active:cursor-grabbing"
      >
        <GripVertical className="h-3.5 w-3.5" />
      </button>
      <span
        className="shrink-0 rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
        style={{
          background: `color-mix(in srgb, ${CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.autre} 20%, transparent)`,
          color: CATEGORY_COLORS[task.category] ?? CATEGORY_COLORS.autre,
        }}
      >
        {task.category}
      </span>
      <span className="flex-1 truncate text-sm">{task.title}</span>
      <span className="shrink-0 text-[10px] text-text-muted">
        {new Date(task.created_at).toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "short",
        })}
      </span>
      <button
        onClick={() => onSchedule(task)}
        className="shrink-0 rounded p-1 text-accent-blue transition-colors hover:bg-accent-blue/20"
        title="Planifier"
      >
        <CalendarPlus className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}
