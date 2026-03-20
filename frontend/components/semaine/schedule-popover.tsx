"use client";

import { useState } from "react";
import { X } from "lucide-react";
import type { BoardTask } from "@/lib/types";

const DURATIONS = [
  { label: "30 min", minutes: 30 },
  { label: "1 h", minutes: 60 },
  { label: "1h30", minutes: 90 },
  { label: "2 h", minutes: 120 },
] as const;

function toLocalISO(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}:00`;
}

function todayLocal(): string {
  const n = new Date();
  return `${n.getFullYear()}-${String(n.getMonth() + 1).padStart(2, "0")}-${String(n.getDate()).padStart(2, "0")}`;
}

interface SchedulePopoverProps {
  task?: BoardTask;
  title?: string;
  defaultDate?: string;
  defaultHour?: number;
  onConfirm: (taskId: number | null, startAt: string, endAt: string, title?: string) => void;
  onClose: () => void;
  isPending?: boolean;
}

export function SchedulePopover({
  task,
  title: defaultTitle,
  defaultDate,
  defaultHour,
  onConfirm,
  onClose,
  isPending,
}: SchedulePopoverProps) {
  const [title, setTitle] = useState(defaultTitle ?? task?.title ?? "");
  const [date, setDate] = useState(defaultDate ?? todayLocal());
  const [time, setTime] = useState(
    defaultHour != null
      ? `${String(Math.floor(defaultHour)).padStart(2, "0")}:${String(Math.round((defaultHour % 1) * 60)).padStart(2, "0")}`
      : "09:00",
  );
  const [duration, setDuration] = useState(60);

  const handleConfirm = () => {
    const startAt = `${date}T${time}:00`;
    const start = new Date(startAt);
    const end = new Date(start.getTime() + duration * 60_000);
    const endAt = toLocalISO(end);
    const taskId = task?.task_id ?? null;
    onConfirm(taskId, startAt, endAt, !task ? title : undefined);
  };

  const isNewTask = !task;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass w-full max-w-sm rounded-2xl p-5">
        <div className="mb-4 flex items-center justify-between">
          <h3 className="text-base font-semibold">
            {isNewTask ? "Nouvelle tache" : "Planifier"}
          </h3>
          <button onClick={onClose} className="text-text-muted hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {isNewTask ? (
          <input
            type="text"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            placeholder="Titre de la tache..."
            autoFocus
            className="mb-4 w-full rounded-lg bg-surface-0 px-3 py-2 text-sm text-text-primary outline-none focus:ring-1 focus:ring-accent-blue/50"
          />
        ) : (
          <p className="mb-4 truncate text-sm text-text-secondary">{task.title}</p>
        )}

        <div className="space-y-3">
          <div>
            <label className="mb-1 block text-xs text-text-muted">Date</label>
            <input
              type="date"
              value={date}
              onChange={(e) => setDate(e.target.value)}
              className="w-full rounded-lg bg-surface-0 px-3 py-2 text-sm text-text-primary outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Heure</label>
            <input
              type="time"
              value={time}
              onChange={(e) => setTime(e.target.value)}
              className="w-full rounded-lg bg-surface-0 px-3 py-2 text-sm text-text-primary outline-none"
            />
          </div>
          <div>
            <label className="mb-1 block text-xs text-text-muted">Duree</label>
            <div className="flex gap-2">
              {DURATIONS.map((d) => (
                <button
                  key={d.minutes}
                  onClick={() => setDuration(d.minutes)}
                  className={`flex-1 rounded-lg px-2 py-1.5 text-xs font-medium transition-colors ${
                    duration === d.minutes
                      ? "bg-accent-blue/20 text-accent-blue"
                      : "bg-surface-0 text-text-secondary hover:bg-surface-1"
                  }`}
                >
                  {d.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        <div className="mt-5 flex gap-2">
          <button
            onClick={onClose}
            className="flex-1 rounded-lg bg-surface-0 px-3 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-1"
          >
            Annuler
          </button>
          <button
            onClick={handleConfirm}
            disabled={isPending || (isNewTask && !title.trim())}
            className="flex-1 rounded-lg bg-accent-blue/20 px-3 py-2 text-sm font-medium text-accent-blue transition-colors hover:bg-accent-blue/30 disabled:opacity-50"
          >
            Confirmer
          </button>
        </div>
      </div>
    </div>
  );
}
