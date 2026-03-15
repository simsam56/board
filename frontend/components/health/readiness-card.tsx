"use client";

import { ThreeRings } from "./three-rings";
import type { ReadinessData, RingsData } from "@/lib/types";

interface ReadinessCardProps {
  readiness: ReadinessData | undefined;
  rings: RingsData | undefined;
}

const COMPONENT_LABELS: Record<string, string> = {
  hrv: "HRV",
  sleep: "Sommeil",
  acwr: "Charge",
  rhr: "FC repos",
  body_battery: "Batterie",
};

export function ReadinessCard({ readiness, rings }: ReadinessCardProps) {
  if (!readiness) return null;

  const { score, label, color, components, confidence, freshness } = readiness;
  const confidencePct = Math.round(confidence * 100);

  return (
    <div className="glass-strong rounded-2xl p-5">
      <div className="flex items-start gap-5">
        {/* Rings */}
        {rings && (
          <div className="flex-shrink-0 pb-6">
            <ThreeRings
              recovery={rings.recovery.score}
              activity={rings.activity.score}
              sleep={rings.sleep.score}
            />
          </div>
        )}

        {/* Score + détails */}
        <div className="flex-1 min-w-0">
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold" style={{ color }}>
              {score}
            </span>
            <span className="text-sm text-text-muted">/100</span>
          </div>
          <p className="text-sm font-medium" style={{ color }}>
            {label}
          </p>

          {/* Barre de confiance */}
          <div className="mt-3">
            <div className="flex items-center justify-between text-[10px] text-text-muted mb-1">
              <span>Confiance données</span>
              <span>{confidencePct}%</span>
            </div>
            <div className="h-1 w-full rounded-full bg-surface-2">
              <div
                className="h-full rounded-full transition-all"
                style={{
                  width: `${confidencePct}%`,
                  backgroundColor:
                    confidencePct >= 70 ? "var(--color-accent-green)" :
                    confidencePct >= 40 ? "var(--color-accent-yellow)" :
                    "var(--color-accent-red)",
                }}
              />
            </div>
          </div>

          {/* Composantes */}
          <div className="mt-3 space-y-1.5">
            {Object.entries(components).map(([key, value]) => {
              const fresh = freshness?.[key] ?? 0;
              return (
                <div key={key} className="flex items-center gap-2">
                  <span className="w-16 text-[10px] text-text-muted truncate">
                    {COMPONENT_LABELS[key] ?? key}
                  </span>
                  <div className="flex-1 h-1.5 rounded-full bg-surface-2">
                    <div
                      className="h-full rounded-full transition-all"
                      style={{
                        width: `${Math.min(100, value)}%`,
                        backgroundColor: color,
                        opacity: fresh >= 0.5 ? 1 : 0.4,
                      }}
                    />
                  </div>
                  <span className="w-6 text-right text-[10px] text-text-muted">
                    {Math.round(value)}
                  </span>
                  {fresh < 0.5 && (
                    <span className="text-[8px] text-accent-yellow" title="Donnée périmée">
                      ●
                    </span>
                  )}
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
