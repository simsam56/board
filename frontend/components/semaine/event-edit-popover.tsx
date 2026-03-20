"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { Category, PlannerEvent } from "@/lib/types";
import { CATEGORY_COLORS, CATEGORY_LABELS } from "@/lib/constants";
import { formatEventTime } from "./week-calendar-utils";

const CATEGORIES: Category[] = [
  "travail",
  "sport",
  "yoga",
  "formation",
  "social",
  "lecon",
  "autre",
];

interface EventEditPopoverProps {
  event: PlannerEvent;
  onSave: (
    event: PlannerEvent,
    startAt: string,
    endAt: string,
    title: string,
    category?: Category,
  ) => void;
  onClose: () => void;
  isPending?: boolean;
}

export function EventEditPopover({
  event,
  onSave,
  onClose,
  isPending,
}: EventEditPopoverProps) {
  const [title, setTitle] = useState(event.title);
  const [category, setCategory] = useState<Category>(event.category);
  const [date, setDate] = useState(event.start_at.slice(0, 10));
  const [startTime, setStartTime] = useState(formatEventTime(event.start_at));
  const [endTime, setEndTime] = useState(formatEventTime(event.end_at));

  const handleSave = () => {
    const startAt = `${date}T${startTime.padStart(5, "0")}:00`;
    const endAt = `${date}T${endTime.padStart(5, "0")}:00`;
    onSave(event, startAt, endAt, title.trim() || event.title, category);
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass w-full max-w-sm rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">Modifier</h3>
          <button
            onClick={onClose}
            className="text-text-muted hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-text-muted">Titre</label>
            <input
              type="text"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="w-full rounded-lg bg-surface-0 px-3 py-2 text-sm text-text-primary outline-none focus:ring-1 focus:ring-accent-blue/50"
            />
          </div>

          {/* Catégorie */}
          <div>
            <label className="mb-1.5 block text-xs text-text-muted">
              Categorie
            </label>
            <div className="flex flex-wrap gap-1.5">
              {CATEGORIES.map((cat) => {
                const color = CATEGORY_COLORS[cat];
                const isSelected = category === cat;
                return (
                  <button
                    key={cat}
                    onClick={() => setCategory(cat)}
                    className="rounded-md px-2 py-1 text-[11px] font-medium transition-all"
                    style={{
                      background: isSelected
                        ? `color-mix(in srgb, ${color} 25%, transparent)`
                        : "var(--color-surface-0)",
                      color: isSelected ? color : "var(--color-text-muted)",
                      border: isSelected
                        ? `1px solid color-mix(in srgb, ${color} 40%, transparent)`
                        : "1px solid transparent",
                    }}
                  >
                    {CATEGORY_LABELS[cat]}
                  </button>
                );
              })}
            </div>
          </div>

          <div>
            <label className="mb-1 block text-xs text-text-muted">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg bg-surface-0 px-3 py-2 text-sm text-text-primary outline-none"
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="mb-1 block text-xs text-text-muted">
                Debut
              </label>
              <input
                type="time"
                value={startTime}
                onChange={(e) => setStartTime(e.target.value)}
                className="w-full rounded-lg bg-surface-0 px-3 py-2 text-sm text-text-primary outline-none"
              />
            </div>
            <div>
              <label className="mb-1 block text-xs text-text-muted">Fin</label>
              <input
                type="time"
                value={endTime}
                onChange={(e) => setEndTime(e.target.value)}
                className="w-full rounded-lg bg-surface-0 px-3 py-2 text-sm text-text-primary outline-none"
              />
            </div>
          </div>

          {event.calendar_name && (
            <p className="text-[10px] text-text-muted">
              Calendrier : {event.calendar_name}
            </p>
          )}
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-surface-0 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-1"
          >
            Annuler
          </button>
          <button
            onClick={handleSave}
            disabled={isPending}
            className="flex-1 rounded-lg bg-accent-blue/20 px-3 py-2 text-sm font-medium text-accent-blue transition-colors hover:bg-accent-blue/30 disabled:opacity-50"
          >
            Enregistrer
          </button>
        </div>
      </div>
    </div>
  );
}
