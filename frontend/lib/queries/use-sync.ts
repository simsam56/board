"use client";

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { fetchAPI, mutateAPI } from "@/lib/api";
import type { GarminSyncResult, SyncStatus } from "@/lib/types";

export function useSyncStatus() {
  return useQuery<SyncStatus>({
    queryKey: ["sync-status"],
    queryFn: () => fetchAPI("/sync/status"),
    staleTime: 30 * 1000,
    refetchInterval: 60 * 1000,
  });
}

export function useSyncGarmin() {
  const qc = useQueryClient();
  return useMutation<GarminSyncResult, Error, { days?: number } | void>({
    mutationFn: (body) =>
      mutateAPI("/sync/garmin", "POST", body || {}),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ["dashboard"] });
      qc.invalidateQueries({ queryKey: ["sync-status"] });
      qc.invalidateQueries({ queryKey: ["health-highlights"] });
      qc.invalidateQueries({ queryKey: ["weekly-trends"] });
    },
  });
}
