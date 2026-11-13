import { forwardRef, useImperativeHandle, useRef } from "react";
import { animate, stagger } from "motion/react";
import { useReducedMotion } from "../hooks/useMediaQuery";
import "./navigation.css";

export interface PageTransitionHandle {
  /** Las barras cubren la pantalla. Resuelve cuando ya no se ve la página. */
  cover: (direction: 1 | -1) => Promise<void>;
  /** Las barras se retiran y dejan ver la página nueva. */
  reveal: (direction: 1 | -1) => Promise<void>;
}

const BARS = 6;
const EASE = [0.76, 0, 0.24, 1] as const;

/** Seis barras verticales en escalera (≈0,65 s ida y vuelta). Con movimiento reducido: solo fundido. */
export const PageTransition = forwardRef<PageTransitionHandle>(function PageTransition(_, ref) {
  const root = useRef<HTMLDivElement>(null);
  const reduced = useReducedMotion();

  useImperativeHandle(
    ref,
    () => ({
      async cover(direction) {
        const el = root.current;
        if (!el) return;
        el.dataset.active = "true";
        if (reduced) {
          await animate(el, { opacity: [0, 1] }, { duration: 0.12 }).finished;
          return;
        }
        const bars = el.querySelectorAll<HTMLElement>(".page-transition__bar");
        bars.forEach((b) => (b.style.transformOrigin = "50% 100%"));
        await animate(
          bars,
          { transform: ["scaleY(0)", "scaleY(1)"] },
          { duration: 0.2, ease: EASE, delay: stagger(0.025, { from: direction > 0 ? "first" : "last" }) },
        ).finished;
      },
      async reveal(direction) {
        const el = root.current;
        if (!el) return;
        if (reduced) {
          await animate(el, { opacity: [1, 0] }, { duration: 0.12 }).finished;
        } else {
          const bars = el.querySelectorAll<HTMLElement>(".page-transition__bar");
          bars.forEach((b) => (b.style.transformOrigin = "50% 0%"));
          await animate(
            bars,
            { transform: ["scaleY(1)", "scaleY(0)"] },
            { duration: 0.2, ease: EASE, delay: stagger(0.025, { from: direction > 0 ? "first" : "last" }) },
          ).finished;
        }
        el.dataset.active = "false";
      },
    }),
    [reduced],
  );

  return (
    <div ref={root} className="page-transition" data-active="false" data-reduced={reduced} aria-hidden="true">
      {Array.from({ length: BARS }, (_, i) => (
        <span key={i} className="page-transition__bar" />
      ))}
    </div>
  );
});
