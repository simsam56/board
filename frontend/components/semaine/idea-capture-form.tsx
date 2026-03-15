"use client";

import { useState } from "react";
import { Plus } from "lucide-react";

const IDEA_CATEGORIES = ["Pro", "Perso", "Projet", "A creuser"] as const;

interface IdeaCaptureFormProps {
  onSubmit: (title: string, category: string) => void;
  isPending: boolean;
}

export function IdeaCaptureForm({ onSubmit, isPending }: IdeaCaptureFormProps) {
  const [text, setText] = useState("");
  const [category, setCategory] = useState<string>("Pro");

  const handleSubmit = () => {
    if (!text.trim()) return;
    onSubmit(text.trim(), category);
    setText("");
  };

  return (
    <div className="flex gap-2">
      <input
        type="text"
        value={text}
        onChange={(e) => setText(e.target.value)}
        onKeyDown={(e) => e.key === "Enter" && handleSubmit()}
        placeholder="Nouvelle idee..."
        className="flex-1 rounded-lg bg-surface-0 px-3 py-2 text-sm text-text-primary placeholder-text-muted outline-none focus:ring-1 focus:ring-accent-yellow/50"
      />
      <select
        value={category}
        onChange={(e) => setCategory(e.target.value)}
        className="rounded-lg bg-surface-0 px-2 py-2 text-xs text-text-secondary outline-none"
      >
        {IDEA_CATEGORIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
      <button
        onClick={handleSubmit}
        disabled={isPending}
        className="flex items-center gap-1 rounded-lg bg-accent-yellow/20 px-3 py-2 text-sm font-medium text-accent-yellow transition-colors hover:bg-accent-yellow/30 disabled:opacity-50"
      >
        <Plus className="h-4 w-4" />
      </button>
    </div>
  );
}
