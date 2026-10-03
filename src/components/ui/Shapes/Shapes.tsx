import { useId } from "react";

interface ShapeProps {
  className?: string;
}

/** Cursor/flecha "3D" glossy (inspirado en el post 01). */
export function PlayShape({ className }: ShapeProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 240 260" fill="none" aria-hidden="true">
      <defs>
        <linearGradient id={`${id}-body`} x1="30" y1="20" x2="210" y2="240" gradientUnits="userSpaceOnUse">
          <stop offset="0" stopColor="#ffb384" />
          <stop offset="0.35" stopColor="#ff7a2e" />
          <stop offset="0.75" stopColor="#e84a00" />
          <stop offset="1" stopColor="#b83500" />
        </linearGradient>
        <radialGradient id={`${id}-shine`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(78 70) rotate(40) scale(90 50)">
          <stop stopColor="#fff" stopOpacity="0.85" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g>
        <path
          d="M40 34c-6-18 10-30 27-21l142 78c17 9 15 32-3 38l-52 18c-8 3-14 9-17 17l-22 57c-7 18-31 17-37-1L40 34z"
          fill={`url(#${id}-body)`}
        />
        <path
          d="M40 34c-6-18 10-30 27-21l142 78c17 9 15 32-3 38l-52 18c-8 3-14 9-17 17l-22 57c-7 18-31 17-37-1L40 34z"
          fill={`url(#${id}-shine)`}
        />
        <path d="M58 30c30 16 80 44 118 64" stroke="#fff" strokeOpacity="0.55" strokeWidth="5" strokeLinecap="round" />
      </g>
    </svg>
  );
}

/** Estrella de 4 puntas glossy (post 06 / logo 03). */
export function StarShape({ className }: ShapeProps) {
  const id = useId().replace(/:/g, "");
  return (
    <svg className={className} viewBox="0 0 240 240" fill="none" aria-hidden="true">
      <defs>
        <radialGradient id={`${id}-body`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(100 90) rotate(50) scale(170)">
          <stop stopColor="#ffc09a" />
          <stop offset="0.3" stopColor="#ff7a2e" />
          <stop offset="0.8" stopColor="#e24800" />
          <stop offset="1" stopColor="#a93000" />
        </radialGradient>
        <radialGradient id={`${id}-shine`} cx="0" cy="0" r="1" gradientUnits="userSpaceOnUse" gradientTransform="translate(96 84) scale(46 30)">
          <stop stopColor="#fff" stopOpacity="0.9" />
          <stop offset="1" stopColor="#fff" stopOpacity="0" />
        </radialGradient>
      </defs>
      <g>
        <path
          d="M120 8c6 0 9 5 11 12 9 38 26 64 70 84 7 3 11 9 11 16s-4 13-11 16c-44 20-61 46-70 84-2 7-5 12-11 12s-9-5-11-12c-9-38-26-64-70-84-7-3-11-9-11-16s4-13 11-16c44-20 61-46 70-84 2-7 5-12 11-12z"
          fill={`url(#${id}-body)`}
        />
        <path
          d="M120 8c6 0 9 5 11 12 9 38 26 64 70 84 7 3 11 9 11 16s-4 13-11 16c-44 20-61 46-70 84-2 7-5 12-11 12s-9-5-11-12c-9-38-26-64-70-84-7-3-11-9-11-16s4-13 11-16c44-20 61-46 70-84 2-7 5-12 11-12z"
          fill={`url(#${id}-shine)`}
        />
      </g>
    </svg>
  );
}

/** Pequeña estrella lineal (sparkle) para acentos. */
export function Sparkle({ className }: ShapeProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" aria-hidden="true">
      <path d="M12 0c.6 5.8 3.9 10.4 12 12-8.1 1.6-11.4 6.2-12 12-.6-5.8-3.9-10.4-12-12C8.1 10.4 11.4 5.8 12 0z" fill="currentColor" />
    </svg>
  );
}

export function CodeIcon({ className }: ShapeProps) {
  return (
    <svg className={className} viewBox="0 0 40 24" fill="none" aria-hidden="true">
      <path d="M11 4 3 12l8 8M29 4l8 8-8 8M23 2l-6 20" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function ArrowUpRight({ className }: ShapeProps) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path d="M6 18 18 6M8 6h10v10" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}
