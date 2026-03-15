/**
 * SVG paths anatomiques stylisés pour le body map.
 * Silhouettes arrondies, proportions réalistes.
 * viewBox: 0 0 120 280
 */

export interface MusclePath {
  id: string;
  d: string;
  muscle: string;
}

// Vue de face
export const BODY_FRONT_PATHS: MusclePath[] = [
  // Tête (silhouette non-interactive)
  { id: "head-front", d: "M52,12 C52,4 60,0 60,0 C60,0 68,4 68,12 C72,18 70,28 66,32 L54,32 C50,28 48,18 52,12 Z", muscle: "" },
  // Cou
  { id: "neck-front", d: "M55,32 L65,32 C64,38 63,42 62,44 L58,44 C57,42 56,38 55,32 Z", muscle: "" },
  // Épaule gauche
  { id: "shoulder-l", d: "M38,46 C34,44 30,48 32,54 L36,56 L54,52 L56,46 C52,44 46,44 38,46 Z", muscle: "Épaules" },
  // Épaule droite
  { id: "shoulder-r", d: "M82,46 C86,44 90,48 88,54 L84,56 L66,52 L64,46 C68,44 74,44 82,46 Z", muscle: "Épaules" },
  // Pectoral gauche
  { id: "pec-l", d: "M38,56 C40,54 48,52 56,52 L56,72 C50,74 42,72 38,68 C36,64 36,58 38,56 Z", muscle: "Pecs" },
  // Pectoral droit
  { id: "pec-r", d: "M82,56 C80,54 72,52 64,52 L64,72 C70,74 78,72 82,68 C84,64 84,58 82,56 Z", muscle: "Pecs" },
  // Biceps gauche
  { id: "bicep-l", d: "M28,58 C26,56 24,62 24,68 C24,76 26,82 28,88 L34,88 C36,80 36,72 34,58 L28,58 Z", muscle: "Biceps" },
  // Biceps droit
  { id: "bicep-r", d: "M92,58 C94,56 96,62 96,68 C96,76 94,82 92,88 L86,88 C84,80 84,72 86,58 L92,58 Z", muscle: "Biceps" },
  // Abdos
  { id: "abs", d: "M48,74 L72,74 C72,82 72,96 72,110 C70,116 66,118 60,118 C54,118 50,116 48,110 C48,96 48,82 48,74 Z", muscle: "Core" },
  // Avant-bras gauche
  { id: "forearm-l", d: "M22,90 L32,90 C30,104 28,116 26,126 L20,124 C20,114 20,102 22,90 Z", muscle: "" },
  // Avant-bras droit
  { id: "forearm-r", d: "M88,90 L98,90 C100,102 100,114 100,124 L94,126 C92,116 90,104 88,90 Z", muscle: "" },
  // Quadriceps gauche
  { id: "quad-l", d: "M42,120 C44,118 50,116 56,118 L56,186 C52,190 46,190 40,186 C38,172 38,140 42,120 Z", muscle: "Jambes" },
  // Quadriceps droit
  { id: "quad-r", d: "M78,120 C76,118 70,116 64,118 L64,186 C68,190 74,190 80,186 C82,172 82,140 78,120 Z", muscle: "Jambes" },
  // Tibia gauche
  { id: "shin-l", d: "M40,194 C42,192 50,192 54,194 L52,258 C50,262 44,262 40,258 C38,240 38,214 40,194 Z", muscle: "Mollets" },
  // Tibia droit
  { id: "shin-r", d: "M80,194 C78,192 70,192 66,194 L68,258 C70,262 76,262 80,258 C82,240 82,214 80,194 Z", muscle: "Mollets" },
];

// Vue de dos
export const BODY_BACK_PATHS: MusclePath[] = [
  // Tête
  { id: "head-back", d: "M52,12 C52,4 60,0 60,0 C60,0 68,4 68,12 C72,18 70,28 66,32 L54,32 C50,28 48,18 52,12 Z", muscle: "" },
  // Cou
  { id: "neck-back", d: "M55,32 L65,32 C64,38 63,42 62,44 L58,44 C57,42 56,38 55,32 Z", muscle: "" },
  // Trapèzes
  { id: "trap-l", d: "M40,44 L56,44 L56,58 C48,58 42,56 38,52 C36,48 38,44 40,44 Z", muscle: "Dos" },
  { id: "trap-r", d: "M80,44 L64,44 L64,58 C72,58 78,56 82,52 C84,48 82,44 80,44 Z", muscle: "Dos" },
  // Grand dorsal gauche
  { id: "lat-l", d: "M36,58 C38,56 48,56 56,58 L54,92 C48,92 42,90 38,86 C34,80 34,68 36,58 Z", muscle: "Dos" },
  // Grand dorsal droit
  { id: "lat-r", d: "M84,58 C82,56 72,56 64,58 L66,92 C72,92 78,90 82,86 C86,80 86,68 84,58 Z", muscle: "Dos" },
  // Triceps gauche
  { id: "tricep-l", d: "M28,56 C26,54 24,60 24,68 C24,76 26,82 28,88 L34,88 C36,80 36,72 34,56 L28,56 Z", muscle: "Triceps" },
  // Triceps droit
  { id: "tricep-r", d: "M92,56 C94,54 96,60 96,68 C96,76 94,82 92,88 L86,88 C84,80 84,72 86,56 L92,56 Z", muscle: "Triceps" },
  // Lombaires
  { id: "lower-back", d: "M46,92 L74,92 C74,100 72,110 70,116 C66,118 54,118 50,116 C48,110 46,100 46,92 Z", muscle: "Core" },
  // Avant-bras gauche
  { id: "forearm-bl", d: "M22,90 L32,90 C30,104 28,116 26,126 L20,124 C20,114 20,102 22,90 Z", muscle: "" },
  // Avant-bras droit
  { id: "forearm-br", d: "M88,90 L98,90 C100,102 100,114 100,124 L94,126 C92,116 90,104 88,90 Z", muscle: "" },
  // Fessier gauche
  { id: "glute-l", d: "M42,118 C46,116 52,116 56,118 L56,148 C52,152 46,152 42,148 C40,140 40,128 42,118 Z", muscle: "Jambes" },
  // Fessier droit
  { id: "glute-r", d: "M78,118 C74,116 68,116 64,118 L64,148 C68,152 74,152 78,148 C80,140 80,128 78,118 Z", muscle: "Jambes" },
  // Ischio-jambier gauche
  { id: "ham-l", d: "M40,154 C44,152 52,152 56,154 L54,210 C50,214 44,214 40,210 C38,192 38,170 40,154 Z", muscle: "Jambes" },
  // Ischio-jambier droit
  { id: "ham-r", d: "M80,154 C76,152 68,152 64,154 L66,210 C70,214 76,214 80,210 C82,192 82,170 80,154 Z", muscle: "Jambes" },
  // Mollet gauche
  { id: "calf-l", d: "M40,216 C42,214 50,214 54,216 L52,266 C50,270 44,270 40,266 C38,248 38,232 40,216 Z", muscle: "Mollets" },
  // Mollet droit
  { id: "calf-r", d: "M80,216 C78,214 70,214 66,216 L68,266 C70,270 76,270 80,266 C82,248 82,232 80,216 Z", muscle: "Mollets" },
];

/** All unique muscle names that are interactive */
export const MUSCLE_NAMES = [
  "Pecs", "Épaules", "Biceps", "Triceps", "Core", "Dos", "Jambes", "Mollets",
];
