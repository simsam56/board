"use client";

import { useState } from "react";
import { X } from "lucide-react";
import {
  StepSelectSources,
  StepVerifyConnection,
  StepCalendars,
  StepPreview,
  StepSync,
} from "./sync-wizard-steps";

interface SyncWizardProps {
  open: boolean;
  onClose: () => void;
}

const STEP_TITLES = [
  "Sources",
  "Connexion",
  "Calendriers",
  "Apercu",
  "Synchronisation",
] as const;

export function SyncWizard({ open, onClose }: SyncWizardProps) {
  const [step, setStep] = useState(1);

  if (!open) return null;

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const next = () => setStep((s) => Math.min(s + 1, 5));
  const back = () => setStep((s) => Math.max(s - 1, 1));

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm">
      <div className="glass w-full max-w-md rounded-2xl p-5">
        {/* Header */}
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h3 className="text-base font-semibold">Synchronisation</h3>
            <p className="text-xs text-text-muted">
              Etape {step}/5 — {STEP_TITLES[step - 1]}
            </p>
          </div>
          <button onClick={handleClose} className="text-text-muted hover:text-text-primary">
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Progress bar */}
        <div className="mb-5 h-1 w-full rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-accent-blue transition-all"
            style={{ width: `${(step / 5) * 100}%` }}
          />
        </div>

        {/* Step content */}
        {step === 1 && <StepSelectSources onNext={next} />}
        {step === 2 && <StepVerifyConnection onNext={next} onBack={back} />}
        {step === 3 && <StepCalendars onNext={next} onBack={back} />}
        {step === 4 && <StepPreview onNext={next} onBack={back} />}
        {step === 5 && <StepSync onNext={next} onClose={handleClose} />}
      </div>
    </div>
  );
}
