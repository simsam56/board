"use client";

import { useState, useCallback, useMemo } from "react";
import { DndContext, DragOverlay, type DragEndEvent } from "@dnd-kit/core";
import { RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { useDashboard } from "@/lib/queries/use-dashboard";
import {
  usePlannerEvents,
  useBoardTasks,
  useUpdateTask,
  useDeleteTask,
  useUpdateAppleEvent,
  useDeleteAppleEvent,
} from "@/lib/queries/use-planner";
import type { BoardTask, PlannerEvent, TriageStatus } from "@/lib/types";
import { CATEGORY_COLORS } from "@/lib/constants";
import { WeekCalendar } from "@/components/semaine/week-calendar";
import { FadeInSection } from "@/components/health/fade-in-section";
import { MetricPill } from "@/components/semaine/metric-pill";
import { IdeasSection } from "@/components/semaine/ideas-section";
import { KanbanBoard } from "@/components/semaine/kanban-board";
import { SchedulePopover } from "@/components/semaine/schedule-popover";
import { EventEditPopover } from "@/components/semaine/event-edit-popover";
import { SyncWizard } from "@/components/semaine/sync-wizard";

export default function SemainePage() {
  const { data, isLoading, error } = useDashboard();
  const { data: boardData, isLoading: boardLoading } = useBoardTasks();
  const updateTask = useUpdateTask();
  const deleteTask = useDeleteTask();
  const updateApple = useUpdateAppleEvent();
  const deleteApple = useDeleteAppleEvent();
  const [syncOpen, setSyncOpen] = useState(false);
  const [weekOffset, setWeekOffset] = useState(0);

  // Schedule popover state (for ideas/tasks → calendar)
  const [schedulingTask, setSchedulingTask] = useState<BoardTask | null>(null);
  const [scheduleDefaults, setScheduleDefaults] = useState<{ date?: string; hour?: number }>({});

  // Event edit popover state (double-click on calendar event)
  const [editingEvent, setEditingEvent] = useState<PlannerEvent | null>(null);

  // Drag overlay
  const [dragLabel, setDragLabel] = useState<string | null>(null);
  const [dragColor, setDragColor] = useState<string>(CATEGORY_COLORS.autre);

  const handleDragStart = useCallback(
    (event: { active: { data: { current?: Record<string, unknown> } } }) => {
      const task = event.active.data.current?.task as BoardTask | undefined;
      const calEvent = event.active.data.current?.calendarEvent as PlannerEvent | undefined;
      const label = task?.title ?? calEvent?.title ?? null;
      const cat = task?.category ?? calEvent?.category;
      setDragLabel(label);
      setDragColor(
        cat ? (CATEGORY_COLORS[cat] ?? CATEGORY_COLORS.autre) : CATEGORY_COLORS.autre,
      );
    },
    [],
  );

  const handleDragEnd = useCallback(
    (event: DragEndEvent) => {
      setDragLabel(null);
      const { active, over } = event;
      if (!over) return;

      const task = active.data.current?.task as BoardTask | undefined;
      const calEvent = active.data.current?.calendarEvent as PlannerEvent | undefined;
      const overData = over.data.current as Record<string, unknown> | undefined;

      // ── Calendar event dragged to another day column ──
      if (calEvent && overData?.date) {
        const newDate = overData.date as string;
        const oldStart = new Date(calEvent.start_at);
        const oldEnd = new Date(calEvent.end_at);
        const durationMs = oldEnd.getTime() - oldStart.getTime();

        const pad = (n: number) => String(n).padStart(2, "0");
        const timeStr = `${pad(oldStart.getHours())}:${pad(oldStart.getMinutes())}:00`;
        const newStartAt = `${newDate}T${timeStr}`;
        const newEndDate = new Date(new Date(newStartAt).getTime() + durationMs);
        const newEndAt = `${newDate}T${pad(newEndDate.getHours())}:${pad(newEndDate.getMinutes())}:00`;

        if (calEvent.task_id) {
          updateTask.mutate(
            { id: calEvent.task_id, start_at: newStartAt, end_at: newEndAt, sync_apple: true },
            { onSuccess: () => toast.success("Evenement deplace") },
          );
        } else if (calEvent.calendar_uid) {
          updateApple.mutate(
            { uid: calEvent.calendar_uid, start_at: newStartAt, end_at: newEndAt, title: calEvent.title },
            { onSuccess: () => toast.success("Evenement deplace") },
          );
        }
        return;
      }

      // ── Board task / idea dropped on calendar ──
      if (task && overData?.date) {
        const hour = (overData.startHour as number) ?? 9;
        setScheduleDefaults({ date: overData.date as string, hour });
        setSchedulingTask(task);
        return;
      }

      // ── Board task / idea dropped on triage column ──
      if (task && overData?.triageStatus) {
        const newStatus = overData.triageStatus as TriageStatus;
        if (task.triage_status === newStatus) return;
        updateTask.mutate(
          { id: task.id, triage_status: newStatus },
          {
            onSuccess: () => {
              const labels: Record<string, string> = {
                urgent: "Urgent",
                a_planifier: "A planifier",
                non_urgent: "Secondaire",
                termine: "Termine",
                a_determiner: "Idees",
              };
              toast.success(`Deplace vers ${labels[newStatus] ?? newStatus}`);
            },
          },
        );
      }
    },
    [updateTask],
  );

  // Schedule popover confirm
  const handleSchedule = useCallback(
    (taskId: number, startAt: string, endAt: string) => {
      updateTask.mutate(
        {
          id: taskId,
          start_at: startAt,
          end_at: endAt,
          scheduled: true,
          triage_status: "a_planifier",
          sync_apple: true,
        },
        {
          onSuccess: () => {
            toast.success("Tache planifiee !");
            setSchedulingTask(null);
            setScheduleDefaults({});
          },
        },
      );
    },
    [updateTask],
  );

  const handleCloseSchedule = useCallback(() => {
    setSchedulingTask(null);
    setScheduleDefaults({});
  }, []);

  // Event edit (double-click)
  const handleEditEvent = useCallback((ev: PlannerEvent) => {
    setEditingEvent(ev);
  }, []);

  const handleSaveEdit = useCallback(
    (ev: PlannerEvent, startAt: string, endAt: string, title: string) => {
      const onSuccess = () => {
        toast.success("Evenement modifie");
        setEditingEvent(null);
      };
      if (ev.task_id) {
        updateTask.mutate(
          { id: ev.task_id, start_at: startAt, end_at: endAt, title, sync_apple: true },
          { onSuccess },
        );
      } else if (ev.calendar_uid) {
        updateApple.mutate(
          { uid: ev.calendar_uid, start_at: startAt, end_at: endAt, title },
          { onSuccess },
        );
      }
    },
    [updateTask, updateApple],
  );

  // Event delete (right-click)
  const handleDeleteEvent = useCallback(
    (ev: PlannerEvent) => {
      const onSuccess = () => toast.success("Evenement supprime");
      if (ev.task_id) {
        deleteTask.mutate(ev.task_id, { onSuccess });
      } else if (ev.calendar_uid) {
        deleteApple.mutate(ev.calendar_uid, { onSuccess });
      }
    },
    [deleteTask, deleteApple],
  );

  // Week navigation
  const dashboardWeekStart = data?.week?.start ?? new Date().toISOString().slice(0, 10);

  const displayedWeekStart = useMemo(() => {
    const base = new Date(dashboardWeekStart + "T00:00:00");
    base.setDate(base.getDate() + weekOffset * 7);
    return base.toISOString().slice(0, 10);
  }, [dashboardWeekStart, weekOffset]);

  const displayedWeekEnd = useMemo(() => {
    const start = new Date(displayedWeekStart + "T00:00:00");
    start.setDate(start.getDate() + 6);
    return start.toISOString().slice(0, 10);
  }, [displayedWeekStart]);

  const isCurrentWeek = weekOffset === 0;
  const { data: otherWeekData } = usePlannerEvents(
    isCurrentWeek ? undefined : displayedWeekStart,
    isCurrentWeek ? undefined : displayedWeekEnd,
  );

  // Early returns after all hooks
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
  const readiness = data?.readiness;
  const events = isCurrentWeek
    ? (data?.week?.events ?? [])
    : (otherWeekData?.events ?? []);

  const allTasks = boardData?.tasks ?? [];
  const ideas = allTasks.filter((t) => t.triage_status === "a_determiner");
  const triageTasks = allTasks.filter((t) => t.triage_status !== "a_determiner");

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
          <WeekCalendar
            events={events}
            weekStart={displayedWeekStart}
            onPrev={() => setWeekOffset((o) => o - 1)}
            onNext={() => setWeekOffset((o) => o + 1)}
            onToday={() => setWeekOffset(0)}
            isCurrentWeek={isCurrentWeek}
            onEditEvent={handleEditEvent}
            onDeleteEvent={handleDeleteEvent}
          />
        </FadeInSection>

        {/* Idees : capture + inbox */}
        <FadeInSection delay={0.16}>
          <IdeasSection
            ideas={ideas}
            isLoading={boardLoading}
            onSchedule={setSchedulingTask}
          />
        </FadeInSection>

        {/* Kanban : triage des taches */}
        <FadeInSection delay={0.24}>
          <KanbanBoard tasks={triageTasks} onSchedule={setSchedulingTask} />
        </FadeInSection>
      </div>

      {/* Drag overlay */}
      <DragOverlay>
        {dragLabel ? (
          <div className="flex items-center gap-2 rounded-lg bg-surface-1 px-3 py-2 shadow-lg">
            <span className="h-2 w-2 rounded-full" style={{ background: dragColor }} />
            <span className="text-sm">{dragLabel}</span>
          </div>
        ) : null}
      </DragOverlay>

      {/* Schedule popover (new task → calendar) */}
      {schedulingTask && (
        <SchedulePopover
          task={schedulingTask}
          defaultDate={scheduleDefaults.date}
          defaultHour={scheduleDefaults.hour}
          onConfirm={handleSchedule}
          onClose={handleCloseSchedule}
          isPending={updateTask.isPending}
        />
      )}

      {/* Event edit popover (double-click on calendar event) */}
      {editingEvent && (
        <EventEditPopover
          event={editingEvent}
          onSave={handleSaveEdit}
          onClose={() => setEditingEvent(null)}
          isPending={updateTask.isPending}
        />
      )}

      {/* Sync wizard */}
      <SyncWizard open={syncOpen} onClose={() => setSyncOpen(false)} />
    </DndContext>
  );
}
