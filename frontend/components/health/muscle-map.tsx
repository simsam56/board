"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import { BODY_FRONT_PATHS, BODY_BACK_PATHS } from "./muscle-map-paths";
import type { MusclePath } from "./muscle-map-paths";
import type { MuscleAlert } from "@/lib/types";
import { MuscleAlerts } from "./muscle-alerts";

interface MuscleMapProps {
  zones: Record<string, number>;
  weeklyVolume: Record<string, Record<string, unknown>>;
  alerts: MuscleAlert[];
}

function getMuscleColor(opacity: number): string {
  if (opacity > 0.7) return `rgba(239, 68, 68, ${Math.min(0.9, opacity)})`;
  if (opacity > 0.3) return `rgba(250, 204, 21, ${Math.min(0.8, opacity)})`;
  return `rgba(148, 163, 184, ${Math.max(0.06, opacity * 0.5)})`;
}

function BodySilhouette({
  paths,
  zones,
  label,
  onHover,
  hoveredMuscle,
}: {
  paths: MusclePath[];
  zones: Record<string, number>;
  label: string;
  onHover: (muscle: string | null) => void;
  hoveredMuscle: string | null;
}) {
  return (
    <div className="flex flex-col items-center gap-2">
      <span className="text-[11px] font-medium uppercase tracking-wider text-text-muted">{label}</span>
      <svg viewBox="0 0 120 280" className="h-56 w-auto sm:h-72">
        {/* Silhouette de fond */}
        <defs>
          <filter id={`glow-${label}`}>
            <feGaussianBlur stdDeviation="2" result="blur" />
            <feMerge>
              <feMergeNode in="blur" />
              <feMergeNode in="SourceGraphic" />
            </feMerge>
          </filter>
        </defs>
        {paths.map((p) => {
          const opacity = p.muscle ? (zones[p.muscle] ?? 0.05) : 0;
          const isHovered = p.muscle && p.muscle === hoveredMuscle;
          const isInteractive = Boolean(p.muscle);
          return (
            <motion.path
              key={p.id}
              d={p.d}
              fill={isInteractive ? getMuscleColor(opacity) : "rgba(148,163,184,0.04)"}
              stroke={isHovered ? "rgba(255,255,255,0.3)" : "rgba(255,255,255,0.06)"}
              strokeWidth={isHovered ? 1 : 0.4}
              onMouseEnter={() => isInteractive && onHover(p.muscle)}
              onMouseLeave={() => onHover(null)}
              style={{
                cursor: isInteractive ? "pointer" : "default",
                filter: isHovered ? `url(#glow-${label})` : undefined,
              }}
              animate={{
                scale: isHovered ? 1.02 : 1,
              }}
              transition={{ duration: 0.15 }}
            />
          );
        })}
      </svg>
    </div>
  );
}

export default function MuscleMap({ zones, weeklyVolume, alerts }: MuscleMapProps) {
  const [hovered, setHovered] = useState<string | null>(null);

  // Get current week's volume for legend
  const currentWeekKey = Object.keys(weeklyVolume).sort().pop();
  const currentVol = currentWeekKey ? weeklyVolume[currentWeekKey] : {};

  // Unique muscles with data
  const activeMuscles = Object.entries(zones)
    .filter(([, v]) => v > 0.05)
    .sort(([, a], [, b]) => b - a);

  return (
    <div className="glass rounded-2xl p-5">
      <h3 className="mb-4 text-base font-semibold text-text-primary">Carte musculaire</h3>
      <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">
        {/* Silhouettes */}
        <div className="flex items-start justify-center gap-8 sm:gap-12">
          <BodySilhouette
            paths={BODY_FRONT_PATHS}
            zones={zones}
            label="Face"
            onHover={setHovered}
            hoveredMuscle={hovered}
          />
          <BodySilhouette
            paths={BODY_BACK_PATHS}
            zones={zones}
            label="Dos"
            onHover={setHovered}
            hoveredMuscle={hovered}
          />
        </div>

        {/* Légende latérale avec barres de volume */}
        <div className="flex-1 min-w-0 space-y-2">
          <div className="text-[11px] font-medium uppercase tracking-wider text-text-muted mb-3">
            Volume cette semaine
          </div>
          {activeMuscles.length > 0 ? (
            activeMuscles.map(([muscle, intensity]) => {
              const vol = currentVol[muscle] as Record<string, number> | undefined;
              const isActive = muscle === hovered;
              return (
                <div
                  key={muscle}
                  className="flex items-center gap-2"
                  onMouseEnter={() => setHovered(muscle)}
                  onMouseLeave={() => setHovered(null)}
                  style={{ opacity: hovered && !isActive ? 0.4 : 1, transition: "opacity 0.15s" }}
                >
                  <span className="w-20 text-xs text-text-secondary truncate">{muscle}</span>
                  <div className="flex-1 h-2 rounded-full bg-surface-2 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${Math.min(100, intensity * 100)}%` }}
                      transition={{ duration: 0.6, ease: "easeOut" }}
                      style={{ backgroundColor: getMuscleColor(intensity) }}
                    />
                  </div>
                  <span className="w-14 text-right text-[10px] text-text-muted">
                    {vol ? `${vol.sets ?? 0}s · ${vol.sessions ?? 0}x` : "—"}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-sm text-text-muted">Aucune donnée cette semaine</p>
          )}

          {/* Légende couleurs */}
          <div className="mt-4 flex items-center gap-4 text-[10px] text-text-muted">
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full" style={{ background: "rgba(239,68,68,0.8)" }} />
              <span>Intense</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full" style={{ background: "rgba(250,204,21,0.6)" }} />
              <span>Modéré</span>
            </div>
            <div className="flex items-center gap-1">
              <div className="h-2 w-2 rounded-full" style={{ background: "rgba(148,163,184,0.15)" }} />
              <span>Inactif</span>
            </div>
          </div>
        </div>
      </div>

      {alerts.length > 0 && (
        <div className="mt-4">
          <MuscleAlerts alerts={alerts} />
        </div>
      )}
    </div>
  );
}
