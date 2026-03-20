"use client";

import { useState, useCallback } from "react";
import { useDraggable } from "@dnd-kit/core";
import { Pencil, Trash2 } from "lucide-react";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import type { PlannerEvent } from "@/lib/types";
import { formatEventTime } from "./week-calendar-utils";

interface EventBlockProps {
  event: PlannerEvent;
  topPercent: number;
  heightPercent: number;
  column: number;
  totalColumns: number;
  onEdit?: (event: PlannerEvent) => void;
  onDelete?: (event: PlannerEvent) => void;
}

export function EventBlock({
  event,
  topPercent,
  heightPercent,
  column,
  totalColumns,
  onEdit,
  onDelete,
}: EventBlockProps) {
  const [showCtx, setShowCtx] = useState(false);

  // All events are draggable/editable (local tasks + apple calendar events)
  const canInteract = event.task_id != null || event.calendar_uid != null;
  const { attributes, listeners, setNodeRef, transform, isDragging } =
    useDraggable({
      id: `event-${event.id}`,
      data: { calendarEvent: event },
      disabled: !canInteract,
    });

  const color = CATEGORY_COLORS[event.category] ?? CATEGORY_COLORS.autre;
  const categoryLabel = CATEGORY_LABELS[event.category] ?? event.category;
  const widthPct = 100 / totalColumns;
  const leftPct = column * widthPct;
  const showTime = heightPercent > 6;
  const showDetails = heightPercent > 10;

  const handleContextMenu = useCallback(
    (e: React.MouseEvent) => {
      e.preventDefault();
      e.stopPropagation();
      if (canInteract) setShowCtx(true);
    },
    [canInteract],
  );

  const handleDoubleClick = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      if (canInteract) onEdit?.(event);
    },
    [canInteract, event, onEdit],
  );

  const handleDelete = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowCtx(false);
      onDelete?.(event);
    },
    [event, onDelete],
  );

  const handleEdit = useCallback(
    (e: React.MouseEvent) => {
      e.stopPropagation();
      setShowCtx(false);
      onEdit?.(event);
    },
    [event, onEdit],
  );

  const dragStyle = transform
    ? { transform: `translate(${transform.x}px, ${transform.y}px)` }
    : undefined;

  return (
    <>
      <div
        ref={setNodeRef}
        {...(canInteract ? listeners : {})}
        {...(canInteract ? attributes : {})}
        className="absolute overflow-hidden rounded px-1.5 py-0.5 transition-transform hover:scale-[1.02]"
        style={{
          top: `${topPercent}%`,
          height: `${heightPercent}%`,
          minHeight: 18,
          left: `${leftPct}%`,
          width: `${widthPct}%`,
          borderLeft: `3px solid ${color}`,
          background: `color-mix(in srgb, ${color} 12%, var(--color-surface-0))`,
          opacity: isDragging ? 0.4 : 1,
          cursor: canInteract ? "grab" : "default",
          zIndex: isDragging ? 50 : undefined,
          ...dragStyle,
        }}
        onContextMenu={handleContextMenu}
        onDoubleClick={handleDoubleClick}
        title={`${event.title}\n${categoryLabel}${event.calendar_name ? ` · ${event.calendar_name}` : ""}\n${formatEventTime(event.start_at)} – ${formatEventTime(event.end_at)}`}
      >
        <p className="truncate text-[11px] font-medium text-text-primary">
          {event.title}
        </p>
        {showTime && (
          <p className="text-[10px] text-text-muted">
            {formatEventTime(event.start_at)} – {formatEventTime(event.end_at)}
          </p>
        )}
        {showDetails && (
          <p className="mt-0.5 truncate text-[9px] font-medium" style={{ color }}>
            {categoryLabel}
            {event.calendar_name && (
              <span className="text-text-muted"> · {event.calendar_name}</span>
            )}
          </p>
        )}
      </div>

      {/* Context menu (right-click) */}
      {showCtx && (
        <>
          <div
            className="fixed inset-0 z-40"
            onClick={() => setShowCtx(false)}
          />
          <div
            className="absolute z-50 overflow-hidden rounded-lg bg-surface-1 shadow-lg ring-1 ring-white/10"
            style={{
              top: `${topPercent}%`,
              left: `${leftPct + widthPct / 2}%`,
              transform: "translate(-50%, -100%)",
            }}
          >
            <button
              onClick={handleEdit}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-text-secondary transition-colors hover:bg-surface-2"
            >
              <Pencil className="h-3 w-3" />
              Modifier
            </button>
            <button
              onClick={handleDelete}
              className="flex w-full items-center gap-2 px-3 py-2 text-xs text-accent-red transition-colors hover:bg-accent-red/10"
            >
              <Trash2 className="h-3 w-3" />
              Supprimer
            </button>
          </div>
        </>
      )}
    </>
  );
}
