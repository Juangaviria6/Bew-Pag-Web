import { useId } from "react";
import { motion, useTransform, type MotionValue } from "motion/react";

interface NexaLogoProps {
  className?: string;
  /** Progreso de trazado 0 → 1 (opcional, para dibujarlo con el scroll). */
  draw?: MotionValue<number>;
}

// Diagonal en forma de cápsula hueca, de arriba-izquierda a abajo-derecha
const CAPSULE = { cx: 61.5, cy: 59.5, length: 94.3, r: 8.25, angle: 42.9 };

/** Isotipo "N" de Nexa AI: astas, diagonal en cápsula y nodos tipo circuito. */
export function NexaLogo({ className, draw }: NexaLogoProps) {
  const id = useId().replace(/:/g, "");
  const grad = `url(#${id}-g)`;
  const fallback = useTransform(() => 1);
  const progress = draw ?? fallback;
  const nodes = useTransform(progress, [0.7, 1], [0, 1]);

  return (
    <svg className={className} viewBox="0 0 120 120" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-g`} x1="14" y1="16" x2="104" y2="100" gradientUnits="userSpaceOnUse">
          <stop stopColor="#62e2f7" />
          <stop offset="0.45" stopColor="#5a86f5" />
          <stop offset="1" stopColor="#8a55ef" />
        </linearGradient>
        <linearGradient id={`${id}-shade`} x1="0" y1="0" x2="1" y2="0">
          <stop stopColor="#1a1450" stopOpacity="0.55" />
          <stop offset="1" stopColor="#1a1450" stopOpacity="0" />
        </linearGradient>
      </defs>

      {/* Asta izquierda → nodo inferior */}
      <motion.path d="M26 30 V82" stroke={grad} strokeWidth="8" strokeLinecap="round" style={{ pathLength: progress }} />
      {/* Asta derecha → nodo superior */}
      <motion.path d="M97.8 88 V36" stroke={grad} strokeWidth="8" strokeLinecap="round" style={{ pathLength: progress }} />

      {/* Diagonal en cápsula */}
      <g transform={`rotate(${CAPSULE.angle} ${CAPSULE.cx} ${CAPSULE.cy})`}>
        <motion.rect
          x={CAPSULE.cx - CAPSULE.length / 2}
          y={CAPSULE.cy - CAPSULE.r}
          width={CAPSULE.length}
          height={CAPSULE.r * 2}
          rx={CAPSULE.r}
          stroke={grad}
          strokeWidth="8"
          style={{ pathLength: progress }}
        />
      </g>
      {/* Sombra sutil donde el asta izquierda pasa bajo la cápsula */}
      <motion.rect x="21.5" y="38" width="9" height="10" fill={`url(#${id}-shade)`} style={{ opacity: nodes }} />

      <motion.circle cx="24.5" cy="90" r="9.5" fill="#4f8ff5" style={{ scale: nodes, transformOrigin: "24.5px 90px" }} />
      <motion.circle cx="97.8" cy="27.8" r="9.5" fill="#a07af2" style={{ scale: nodes, transformOrigin: "97.8px 27.8px" }} />
    </svg>
  );
}
