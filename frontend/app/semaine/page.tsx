"use client";

import { useState, useCallback } from "react";
import { DndContext, DragOverlay, type DragEndEvent } from "@dnd-kit/core";
import { RefreshCw, Lightbulb } from "lucide-react";
import { useDashboard } from "@/lib/queries/use-dashboard";
import type { BoardTask } from "@/lib/types";
import { WeekCalendar } from "@/components/semaine/week-calendar";
import { FadeInSection } from "@/components/health/fade-in-section";
import { MetricPill } from "@/components/semaine/metric-pill";
import { IdeasSection } from "@/components/semaine/ideas-section";
import { SyncWizard } from "@/components/semaine/sync-wizard";

export default function SemainePage() {
  const { data, isLoading, error } = useDashboard();
  const [syncOpen, setSyncOpen] = useState(false);

  // Drag & drop state
  const [dropTarget, setDropTarget] = useState<{ date: string; hour: number } | null>(null);
  const [dropTask, setDropTask] = useState<BoardTask | null>(null);
  const [dragLabel, setDragLabel] = useState<string | null>(null);

  const handleDragStart = useCallback((event: { active: { data: { current?: { task?: BoardTask } } } }) => {
    const task = event.active.data.current?.task as BoardTask | undefined;
    setDragLabel(task?.title ?? null);
  }, []);

  const handleDragEnd = useCallback((event: DragEndEvent) => {
    setDragLabel(null);
    const { active, over } = event;
    if (!over) return;

    const task = active.data.current?.task as BoardTask | undefined;
    if (!task) return;

    const dropData = over.data.current as { date?: string; startHour?: number; pxPerHour?: number } | undefined;
    if (!dropData?.date) return;

    // Estimate dropped hour from Y position (default to 9h if unavailable)
    const hour = dropData.startHour ?? 9;
    setDropTarget({ date: dropData.date, hour });
    setDropTask(task);
  }, []);

  const handleDropHandled = useCallback(() => {
    setDropTarget(null);
    setDropTask(null);
  }, []);

  if (isLoading) {
    return (
      <div className="flex h-64 items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-2 border-accent-blue border-t-transparent" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="glass rounded-2xl p-6 text-center text-accent-red">
        Erreur de connexion a l&apos;API Python. Verifiez que le serveur tourne sur le port 8765.
      </div>
    );
  }

  const summary = data?.week?.summary;
  const events = data?.week?.events ?? [];
  const readiness = data?.readiness;
  const weekStart = data?.week?.start ?? new Date().toISOString().slice(0, 10);

  return (
    <DndContext onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
      <div className="space-y-6">
        {/* Metriques + bouton sync */}
        <FadeInSection delay={0}>
          <div className="mb-3 flex items-center justify-between">
            <div />
            <button
              onClick={() => setSyncOpen(true)}
              className="flex items-center gap-1.5 rounded-lg bg-surface-0 px-3 py-1.5 text-xs text-text-secondary transition-colors hover:bg-surface-1"
            >
              <RefreshCw className="h-3.5 w-3.5" />
              Synchroniser
            </button>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-4">
            <MetricPill
              label="Readiness"
              value={readiness?.score ?? 0}
              unit="/100"
              color={readiness?.color ?? "#64748b"}
            />
            <MetricPill
              label="Sport"
              value={summary?.sante_h ?? 0}
              unit="h"
              color="var(--color-sport)"
            />
            <MetricPill
              label="Travail"
              value={summary?.travail_h ?? 0}
              unit="h"
              color="var(--color-travail)"
            />
            <MetricPill
              label="Social"
              value={summary?.relationnel_h ?? 0}
              unit="h"
              color="var(--color-social)"
            />
          </div>
        </FadeInSection>

        {/* Planning semaine */}
        <FadeInSection delay={0.08}>
          <WeekCalendar events={events} weekStart={weekStart} />
        </FadeInSection>

        {/* Idees (remplace le backlog) */}
        <FadeInSection delay={0.16}>
          <IdeasSection
            dropTarget={dropTarget}
            dropTask={dropTask}
            onDropHandled={handleDropHandled}
          />
        </FadeInSection>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {dragLabel ? (
          <div className="flex items-center gap-2 rounded-lg bg-surface-1 px-3 py-2 shadow-lg">
            <Lightbulb className="h-3.5 w-3.5 text-accent-yellow" />
            <span className="text-sm">{dragLabel}</span>
          </div>
        ) : null}
      </DragOverlay>

      {/* Sync wizard */}
      <SyncWizard open={syncOpen} onClose={() => setSyncOpen(false)} />
    </DndContext>
  );
}
