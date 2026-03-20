"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAPI, mutateAPI } from "@/lib/api";
import type { BoardTask, CalendarStatus, PlannerEvent } from "@/lib/types";

export function usePlannerEvents(start?: string, end?: string) {
  const params = new URLSearchParams();
  if (start) params.set("start", start);
  if (end) params.set("end", end);
  const qs = params.toString();

  return useQuery<{ ok: boolean; events: PlannerEvent[] }>({
    queryKey: ["planner-events", start, end],
    queryFn: () => fetchAPI(`/planner/events${qs ? `?${qs}` : ""}`),
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });
}

export function useBoardTasks() {
  return useQuery<{ ok: boolean; tasks: BoardTask[] }>({
    queryKey: ["board-tasks"],
    queryFn: () => fetchAPI("/planner/board"),
    staleTime: 10 * 1000,
    refetchInterval: 30 * 1000,
  });
}

/** Invalide toutes les queries planner + dashboard, avec re-fetch différé
 *  pour laisser la background sync Apple Calendar terminer. */
function invalidateAll(qc: ReturnType<typeof useQueryClient>) {
  qc.invalidateQueries({ queryKey: ["planner-events"] });
  qc.invalidateQueries({ queryKey: ["board-tasks"] });
  qc.invalidateQueries({ queryKey: ["dashboard"] });
  // Re-fetch après 1.5s pour capter les changements de la background sync Apple
  setTimeout(() => {
    qc.invalidateQueries({ queryKey: ["dashboard"] });
    qc.invalidateQueries({ queryKey: ["planner-events"] });
  }, 1500);
}

export function useCreateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (body: Record<string, unknown>) =>
      mutateAPI("/planner/tasks", "POST", body),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, ...body }: { id: number } & Record<string, unknown>) =>
      mutateAPI(`/planner/tasks/${id}`, "PATCH", body),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteTask() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: number) => mutateAPI(`/planner/tasks/${id}`, "DELETE"),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useUpdateAppleEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ uid, ...body }: { uid: string } & Record<string, unknown>) =>
      mutateAPI(`/planner/apple/${encodeURIComponent(uid)}`, "PATCH", body),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useDeleteAppleEvent() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (uid: string) =>
      mutateAPI(`/planner/apple/${encodeURIComponent(uid)}`, "DELETE"),
    onSuccess: () => invalidateAll(qc),
  });
}

export function useCalendarStatus() {
  return useQuery<CalendarStatus>({
    queryKey: ["calendar-status"],
    queryFn: () => fetchAPI("/calendar/status"),
    staleTime: 30 * 1000,
  });
}

export function useSyncCalendar() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: () => mutateAPI("/planner/calendar/sync", "POST"),
    onSuccess: () => {
      invalidateAll(qc);
      qc.invalidateQueries({ queryKey: ["sync-status"] });
    },
  });
}
