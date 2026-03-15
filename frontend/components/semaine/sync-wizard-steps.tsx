"use client";

import { useEffect } from "react";
import { Apple, Check, AlertTriangle, Loader2, Mail, Calendar } from "lucide-react";
import { useCalendarStatus } from "@/lib/queries/use-planner";
import { useSyncCalendar } from "@/lib/queries/use-planner";

// ── Step 1: Choose sources ──────────────────────────────────────────

interface StepProps {
  onNext: () => void;
  onBack?: () => void;
  onClose?: () => void;
}

export function StepSelectSources({ onNext }: StepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Choisissez les calendriers a synchroniser.
      </p>

      {/* Apple */}
      <button className="flex w-full items-center gap-3 rounded-xl bg-accent-blue/10 p-4 text-left ring-1 ring-accent-blue/40 transition-colors">
        <Apple className="h-5 w-5 text-text-primary" />
        <div className="flex-1">
          <div className="text-sm font-medium">Apple iCloud</div>
          <div className="text-xs text-text-muted">Calendrier Apple natif</div>
        </div>
        <Check className="h-4 w-4 text-accent-blue" />
      </button>

      {/* Gmail */}
      <div className="relative flex w-full items-center gap-3 rounded-xl bg-surface-0 p-4 opacity-50">
        <Mail className="h-5 w-5 text-text-muted" />
        <div className="flex-1">
          <div className="text-sm font-medium text-text-muted">Google Gmail</div>
          <div className="text-xs text-text-muted">Google Calendar</div>
        </div>
        <span className="rounded-full bg-accent-yellow/20 px-2 py-0.5 text-[10px] font-medium text-accent-yellow">
          Bientot
        </span>
      </div>

      <button
        onClick={onNext}
        className="w-full rounded-lg bg-accent-blue/20 py-2 text-sm font-medium text-accent-blue transition-colors hover:bg-accent-blue/30"
      >
        Suivant
      </button>
    </div>
  );
}

// ── Step 2: Verify connection ───────────────────────────────────────

export function StepVerifyConnection({ onNext, onBack }: StepProps) {
  const { data, isLoading } = useCalendarStatus();

  const isAuthorized = data?.permission === "authorized" && !data?.error;

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Verification de la connexion Apple Calendar.
      </p>

      {isLoading ? (
        <div className="flex items-center gap-3 rounded-xl bg-surface-0 p-4">
          <Loader2 className="h-5 w-5 animate-spin text-accent-blue" />
          <span className="text-sm text-text-secondary">Verification...</span>
        </div>
      ) : isAuthorized ? (
        <div className="flex items-center gap-3 rounded-xl bg-accent-green/10 p-4">
          <Check className="h-5 w-5 text-accent-green" />
          <div>
            <div className="text-sm font-medium text-accent-green">Connecte</div>
            <div className="text-xs text-text-muted">
              Acces autorise a Apple Calendar
            </div>
          </div>
        </div>
      ) : (
        <div className="flex items-center gap-3 rounded-xl bg-accent-red/10 p-4">
          <AlertTriangle className="h-5 w-5 text-accent-red" />
          <div>
            <div className="text-sm font-medium text-accent-red">Non autorise</div>
            <div className="text-xs text-text-muted">
              {data?.error ?? "Verifiez les permissions dans Reglages Systeme > Confidentialite > Calendriers."}
            </div>
          </div>
        </div>
      )}

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg bg-surface-0 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-1"
        >
          Retour
        </button>
        <button
          onClick={onNext}
          disabled={!isAuthorized}
          className="flex-1 rounded-lg bg-accent-blue/20 py-2 text-sm font-medium text-accent-blue transition-colors hover:bg-accent-blue/30 disabled:opacity-50"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

// ── Step 3: Calendars info ──────────────────────────────────────────

export function StepCalendars({ onNext, onBack }: StepProps) {
  const { data } = useCalendarStatus();

  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Calendriers detectes sur votre Mac.
      </p>

      <div className="rounded-xl bg-surface-0 p-4">
        <div className="flex items-center gap-3">
          <Calendar className="h-5 w-5 text-accent-blue" />
          <div className="flex-1">
            <div className="text-sm font-medium">
              {data?.default_calendar ?? "Calendrier par defaut"}
            </div>
            <div className="text-xs text-text-muted">
              {data?.calendars_count ?? 0} calendrier(s) disponible(s)
            </div>
          </div>
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg bg-surface-0 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-1"
        >
          Retour
        </button>
        <button
          onClick={onNext}
          className="flex-1 rounded-lg bg-accent-blue/20 py-2 text-sm font-medium text-accent-blue transition-colors hover:bg-accent-blue/30"
        >
          Suivant
        </button>
      </div>
    </div>
  );
}

// ── Step 4: Preview ─────────────────────────────────────────────────

export function StepPreview({ onNext, onBack }: StepProps) {
  return (
    <div className="space-y-4">
      <p className="text-sm text-text-secondary">
        Resume de la synchronisation.
      </p>

      <div className="space-y-2 rounded-xl bg-surface-0 p-4 text-sm">
        <div className="flex items-center gap-2">
          <Apple className="h-4 w-4 text-text-secondary" />
          <span>Apple iCloud Calendar</span>
        </div>
        <div className="text-xs text-text-muted">
          Import des evenements des 30 prochains jours. Les evenements supprimes
          dans Apple Calendar seront retires de Bord.
        </div>
      </div>

      <div className="flex gap-2">
        <button
          onClick={onBack}
          className="flex-1 rounded-lg bg-surface-0 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-1"
        >
          Retour
        </button>
        <button
          onClick={onNext}
          className="flex-1 rounded-lg bg-accent-blue/20 py-2 text-sm font-medium text-accent-blue transition-colors hover:bg-accent-blue/30"
        >
          Synchroniser
        </button>
      </div>
    </div>
  );
}

// ── Step 5: Sync ────────────────────────────────────────────────────

export function StepSync({ onClose }: StepProps) {
  const sync = useSyncCalendar();

  useEffect(() => {
    sync.mutate();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  return (
    <div className="space-y-4">
      {sync.isPending ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <Loader2 className="h-8 w-8 animate-spin text-accent-blue" />
          <p className="text-sm text-text-secondary">Synchronisation en cours...</p>
        </div>
      ) : sync.isError ? (
        <div className="flex flex-col items-center gap-3 py-6">
          <AlertTriangle className="h-8 w-8 text-accent-red" />
          <p className="text-sm text-accent-red">Erreur lors de la synchronisation.</p>
        </div>
      ) : (
        <div className="flex flex-col items-center gap-3 py-6">
          <Check className="h-8 w-8 text-accent-green" />
          <p className="text-sm font-medium text-accent-green">Synchronisation terminee !</p>
          <p className="text-xs text-text-muted">
            {(sync.data as Record<string, Record<string, number>>)?.sync?.events_synced ?? 0} evenement(s) synchronise(s)
          </p>
        </div>
      )}

      <button
        onClick={onClose}
        className="w-full rounded-lg bg-surface-0 py-2 text-sm text-text-secondary transition-colors hover:bg-surface-1"
      >
        Fermer
      </button>
    </div>
  );
}
