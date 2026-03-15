"use client";

import { useState } from "react";
import { Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { useBoardTasks, useCreateTask, useUpdateTask } from "@/lib/queries/use-planner";
import type { BoardTask } from "@/lib/types";
import { IdeaCaptureForm } from "./idea-capture-form";
import { IdeaRow } from "./idea-row";
import { SchedulePopover } from "./schedule-popover";

interface IdeasSectionProps {
  /** Pre-filled date/hour from a drag & drop onto the calendar */
  dropTarget?: { date: string; hour: number } | null;
  dropTask?: BoardTask | null;
  onDropHandled?: () => void;
}

export function IdeasSection({ dropTarget, dropTask, onDropHandled }: IdeasSectionProps) {
  const { data, isLoading } = useBoardTasks();
  const createTask = useCreateTask();
  const updateTask = useUpdateTask();
  const [schedulingTask, setSchedulingTask] = useState<BoardTask | null>(null);

  // If a drop happened, open the popover for that task
  const activeTask = dropTask ?? schedulingTask;
  const activeDate = dropTarget?.date;
  const activeHour = dropTarget?.hour;

  const ideas =
    data?.tasks?.filter((t) => t.triage_status === "a_determiner") ?? [];

  const handleAdd = (title: string, category: string) => {
    createTask.mutate(
      {
        title,
        category: "autre",
        triage_status: "a_determiner",
        notes: `Categorie idee : ${category}`,
      },
      { onSuccess: () => toast.success("Idee ajoutee !") },
    );
  };

  const handleSchedule = (taskId: number, startAt: string, endAt: string) => {
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
          toast.success("Idee planifiee !");
          setSchedulingTask(null);
          onDropHandled?.();
        },
      },
    );
  };

  const handleClosePopover = () => {
    setSchedulingTask(null);
    onDropHandled?.();
  };

  if (isLoading) {
    return (
      <div className="glass rounded-2xl p-5">
        <div className="flex h-24 items-center justify-center">
          <div className="h-6 w-6 animate-spin rounded-full border-2 border-accent-yellow border-t-transparent" />
        </div>
      </div>
    );
  }

  return (
    <>
      <div className="glass rounded-2xl p-5">
        <h3 className="mb-3 flex items-center gap-2 text-base font-semibold">
          <Lightbulb className="h-4 w-4 text-accent-yellow" />
          Idees
          <span className="text-sm font-normal text-text-muted">{ideas.length}</span>
        </h3>

        <IdeaCaptureForm onSubmit={handleAdd} isPending={createTask.isPending} />

        {ideas.length === 0 ? (
          <p className="mt-3 text-sm text-text-muted">
            Aucune idee pour le moment.
          </p>
        ) : (
          <div className="mt-3 space-y-2">
            {ideas.map((t) => (
              <IdeaRow key={t.id} task={t} onSchedule={setSchedulingTask} />
            ))}
          </div>
        )}
      </div>

      {activeTask && (
        <SchedulePopover
          task={activeTask}
          defaultDate={activeDate}
          defaultHour={activeHour}
          onConfirm={handleSchedule}
          onClose={handleClosePopover}
          isPending={updateTask.isPending}
        />
      )}
    </>
  );
}
