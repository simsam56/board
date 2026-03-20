"use client";

import { Activity, Calendar, Check, AlertTriangle, Loader2, RefreshCw, X } from "lucide-react";
import { useSyncStatus, useSyncGarmin } from "@/lib/queries/use-sync";
import { useSyncCalendar } from "@/lib/queries/use-planner";
import type { SyncSourceStatus } from "@/lib/types";

interface SyncWizardProps {
  open: boolean;
  onClose: () => void;
}

// ── Utilitaire temps relatif ──────────────────────────────────────

function timeAgo(iso: string | null): string {
  if (!iso) return "Jamais synchronisé";
  const diff = Date.now() - new Date(iso).getTime();
  const minutes = Math.floor(diff / 60000);
  if (minutes < 1) return "À l'instant";
  if (minutes < 60) return `Il y a ${minutes} min`;
  const hours = Math.floor(minutes / 60);
  if (hours < 24) return `Il y a ${hours}h`;
  const days = Math.floor(hours / 24);
  return `Il y a ${days}j`;
}

// ── Carte source ──────────────────────────────────────────────────

function SyncSourceCard({
  icon,
  name,
  source,
  isSyncing,
  onSync,
}: {
  icon: React.ReactNode;
  name: string;
  source: SyncSourceStatus | undefined;
  isSyncing: boolean;
  onSync: () => void;
}) {
  const isAvailable = source?.available && source?.configured;
  const lastSync = source?.last_sync;
  const status = source?.status;
  const result = source?.result;

  // Résumé du dernier sync
  let summary = "";
  if (result && status === "success") {
    const parts: string[] = [];
    if (typeof result.activities_inserted === "number") {
      parts.push(`${result.activities_inserted} activités`);
    }
    if (typeof result.metrics_inserted === "number") {
      parts.push(`${result.metrics_inserted} métriques`);
    }
    if (typeof result.events_synced === "number") {
      parts.push(`${result.events_synced} événements`);
    }
    summary = parts.join(", ");
  } else if (status === "error") {
    const detail = result?.detail ?? result?.error;
    summary = typeof detail === "string" ? detail : "Erreur lors de la dernière sync";
  }

  return (
    <div className="rounded-xl bg-surface-0 p-4">
      <div className="flex items-start gap-3">
        <div className="mt-0.5 text-text-secondary">{icon}</div>
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">{name}</span>
            {!isAvailable && (
              <span className="rounded-full bg-accent-yellow/20 px-2 py-0.5 text-[10px] font-medium text-accent-yellow">
                Non configuré
              </span>
            )}
            {status === "success" && isAvailable && (
              <Check className="h-3.5 w-3.5 text-accent-green" />
            )}
            {status === "error" && isAvailable && (
              <AlertTriangle className="h-3.5 w-3.5 text-accent-red" />
            )}
          </div>
          <p className="mt-0.5 text-xs text-text-muted">{timeAgo(lastSync ?? null)}</p>
          {summary && (
            <p className={`mt-1 text-xs ${status === "error" ? "text-accent-red" : "text-text-muted"}`}>
              {summary}
            </p>
          )}
        </div>
        <button
          onClick={onSync}
          disabled={!isAvailable || isSyncing}
          className="flex items-center gap-1.5 rounded-lg bg-accent-blue/10 px-3 py-1.5 text-xs font-medium text-accent-blue transition-colors hover:bg-accent-blue/20 disabled:opacity-40"
        >
          {isSyncing ? (
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
          ) : (
            <RefreshCw className="h-3.5 w-3.5" />
          )}
          {isSyncing ? "Sync..." : "Synchroniser"}
        </button>
      </div>
    </div>
  );
}

// ── Panneau principal ─────────────────────────────────────────────

export function SyncWizard({ open, onClose }: SyncWizardProps) {
  const { data: syncStatus } = useSyncStatus();
  const garminSync = useSyncGarmin();
  const calendarSync = useSyncCalendar();

  if (!open) return null;

  const garmin = syncStatus?.sources?.garmin;
  const apple = syncStatus?.sources?.apple_calendar;

  const isSyncingAll = garminSync.isPending || calendarSync.isPending;

  const handleSyncAll = async () => {
    // Garmin d'abord, puis Apple Calendar
    try {
      await garminSync.mutateAsync();
    } catch {
      // continue même si Garmin échoue
    }
    try {
      await calendarSync.mutateAsync();
    } catch {
      // continue même si Calendar échoue
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl p-5">
        {/* Header */}
        <div className="mb-5 flex items-center justify-between">
          <h3 className="text-base font-semibold">Synchronisation</h3>
          <button
            onClick={onClose}
            className="text-text-muted transition-colors hover:text-text-primary"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Sources */}
        <div className="space-y-3">
          <SyncSourceCard
            icon={<Activity className="h-5 w-5" />}
            name="Garmin Connect"
            source={garmin}
            isSyncing={garminSync.isPending}
            onSync={() => garminSync.mutate()}
          />

          <SyncSourceCard
            icon={<Calendar className="h-5 w-5" />}
            name="Apple Calendar"
            source={apple}
            isSyncing={calendarSync.isPending}
            onSync={() => calendarSync.mutate()}
          />
        </div>

        {/* Feedback global */}
        {(garminSync.isSuccess || calendarSync.isSuccess) && (
          <div className="mt-3 flex items-center gap-2 rounded-lg bg-accent-green/10 px-3 py-2">
            <Check className="h-4 w-4 text-accent-green" />
            <span className="text-xs text-accent-green">Synchronisation terminée</span>
          </div>
        )}

        {/* Bouton global */}
        <button
          onClick={handleSyncAll}
          disabled={isSyncingAll}
          className="mt-4 flex w-full items-center justify-center gap-2 rounded-lg bg-accent-blue/20 py-2.5 text-sm font-medium text-accent-blue transition-colors hover:bg-accent-blue/30 disabled:opacity-50"
        >
          {isSyncingAll ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <RefreshCw className="h-4 w-4" />
          )}
          {isSyncingAll ? "Synchronisation en cours..." : "Tout synchroniser"}
        </button>
      </div>
    </div>
  );
}
