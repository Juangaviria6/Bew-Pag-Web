import type { FaceInput } from "./faceTracker";

/** Clasificación simple de expresión a partir de los blendshapes de MediaPipe. */

export type Mood = "neutral" | "feliz" | "triste" | "sorpresa" | "enojo";

export interface MoodMeta {
  label: string;
  title: string;
  copy: string;
  /** Filtro CSS para el video (también se usa en la postal). */
  filter: string;
}

export const MOODS: Record<Mood, MoodMeta> = {
  neutral: {
    label: "Neutral",
    title: "Haz una cara_",
    copy: "Sonríe, sorpréndete, frunce el ceño… la web responde a lo que sientes.",
    filter: "saturate(0.9)",
  },
  feliz: {
    label: "Feliz",
    title: "Así se siente una web que convierte_",
    copy: "Clientes que llegan, entienden y te escriben. Eso diseñamos.",
    filter: "saturate(1.35) brightness(1.08)",
  },
  triste: {
    label: "Triste",
    title: "¿Tu web te tiene así?_",
    copy: "Lenta, confusa o sin ventas. Tranquilo: la rediseñamos contigo.",
    filter: "grayscale(0.85) brightness(0.85)",
  },
  sorpresa: {
    label: "Sorpresa",
    title: "Esa cara pondrán tus clientes_",
    copy: "Una primera impresión que se recuerda, en menos de un segundo.",
    filter: "contrast(1.15) saturate(1.2)",
  },
  enojo: {
    label: "Enojo",
    title: "Una web lenta da rabia_",
    copy: "Las nuestras cargan rápido y se ven bien en cualquier pantalla.",
    filter: "contrast(1.3) sepia(0.4) hue-rotate(-30deg) saturate(1.6)",
  },
};

export function classify(f: FaceInput): Mood {
  if (!f.visible) return "neutral";
  if (f.mouth > 0.4 && (f.browUp > 0.35 || f.eyeWide > 0.3)) return "sorpresa";
  if (f.smile > 0.5) return "feliz";
  if (f.browDown > 0.45 && f.smile < 0.2) return "enojo";
  if (f.frown > 0.35 || (f.browUp > 0.45 && f.smile < 0.15 && f.mouth < 0.25)) return "triste";
  return "neutral";
}

/** Evita parpadeos: una emoción nueva debe sostenerse `hold` ms antes de mostrarse. */
export function createMoodStabilizer(hold = 350) {
  let current: Mood = "neutral";
  let candidate: Mood = "neutral";
  let since = 0;
  return (next: Mood, now: number): Mood => {
    if (next === current) {
      candidate = current;
      return current;
    }
    if (next !== candidate) {
      candidate = next;
      since = now;
    } else if (now - since >= hold) {
      current = next;
    }
    return current;
  };
}
