"use client";

import { useDashboard } from "@/lib/queries/use-dashboard";
import { CATEGORY_COLORS } from "@/lib/constants";
import { WeekCalendar } from "@/components/semaine/week-calendar";
import { FadeInSection } from "@/components/health/fade-in-section";

export default function SemainePage() {
  const { data, isLoading, error } = useDashboard();

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
        Erreur de connexion à l&apos;API Python. Vérifiez que le serveur tourne sur le port 8765.
      </div>
    );
  }

  const summary = data?.week?.summary;
  const events = data?.week?.events ?? [];
  const board = data?.week?.board ?? [];
  const readiness = data?.readiness;
  const weekStart = data?.week?.start ?? new Date().toISOString().slice(0, 10);

  return (
    <div className="space-y-6">
      {/* Métriques en haut */}
      <FadeInSection delay={0}>
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

      {/* Board (kanban simplifié) */}
      <FadeInSection delay={0.16}>
        <div className="glass rounded-2xl p-5">
          <h2 className="mb-4 text-lg font-semibold">
            Backlog
            <span className="ml-2 text-sm font-normal text-text-muted">
              {board.length} tâches
            </span>
          </h2>
          {board.length === 0 ? (
            <p className="text-text-muted">Aucune tâche en backlog.</p>
          ) : (
            <div className="space-y-2">
              {board.map((t) => {
                const color = CATEGORY_COLORS[t.category] ?? CATEGORY_COLORS.autre;
                return (
                  <div
                    key={t.id}
                    className="flex items-center gap-3 rounded-lg bg-surface-0 px-3 py-2"
                  >
                    <span
                      className="rounded px-1.5 py-0.5 text-[10px] font-medium uppercase"
                      style={{
                        background: `color-mix(in srgb, ${color} 20%, transparent)`,
                        color,
                      }}
                    >
                      {t.category}
                    </span>
                    <span className="flex-1 text-sm">{t.title}</span>
                    <span className="text-[10px] uppercase text-text-muted">
                      {t.triage_status?.replace(/_/g, " ")}
                    </span>
                  </div>
                );
              })}
            </div>
          )}
        </div>
      </FadeInSection>
    </div>
  );
}

function MetricPill({
  label,
  value,
  unit,
  color,
}: {
  label: string;
  value: number;
  unit: string;
  color: string;
}) {
  return (
    <div className="glass rounded-xl px-4 py-3">
      <div className="text-xs font-medium text-text-muted">{label}</div>
      <div className="mt-1 flex items-baseline gap-1">
        <span className="text-2xl font-bold" style={{ color }}>
          {typeof value === "number" ? value.toFixed(1) : value}
        </span>
        <span className="text-sm text-text-muted">{unit}</span>
      </div>
    </div>
  );
}
