"use client";

import { Lightbulb } from "lucide-react";
import { toast } from "sonner";
import { useCreateTask } from "@/lib/queries/use-planner";
import type { BoardTask } from "@/lib/types";
import { IdeaCaptureForm } from "./idea-capture-form";
import { IdeaRow } from "./idea-row";

interface IdeasSectionProps {
  ideas: BoardTask[];
  isLoading?: boolean;
  onSchedule: (task: BoardTask) => void;
}

export function IdeasSection({ ideas, isLoading, onSchedule }: IdeasSectionProps) {
  const createTask = useCreateTask();

  const handleAdd = (title: string, displayCategory: string, backendCategory: string) => {
    createTask.mutate(
      {
        title,
        category: backendCategory,
        triage_status: "a_determiner",
        notes: `Categorie idee : ${displayCategory}`,
      },
      { onSuccess: () => toast.success("Idee ajoutee !") },
    );
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
            <IdeaRow key={t.id} task={t} onSchedule={onSchedule} />
          ))}
        </div>
      )}
    </div>
  );
}
