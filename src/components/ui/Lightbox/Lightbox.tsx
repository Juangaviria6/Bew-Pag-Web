import { useCallback, useEffect } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Project } from "../../../types";
import { setScrollLocked } from "../../../hooks/useSmoothScroll";
import "./Lightbox.css";

interface LightboxProps {
  items: Project[];
  index: number | null;
  onChange: (index: number | null) => void;
}

export function Lightbox({ items, index, onChange }: LightboxProps) {
  const open = index !== null;
  const step = useCallback(
    (dir: number) => {
      if (index === null) return;
      onChange((index + dir + items.length) % items.length);
    },
    [index, items.length, onChange],
  );

  useEffect(() => {
    setScrollLocked(open);
    if (!open) return;
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onChange(null);
      if (e.key === "ArrowRight") step(1);
      if (e.key === "ArrowLeft") step(-1);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [open, onChange, step]);

  const item = index !== null ? items[index] : null;

  return (
    <AnimatePresence>
      {item && (
        <motion.div
          className="lb"
          role="dialog"
          aria-modal="true"
          aria-label={item.title}
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={() => onChange(null)}
          data-cursor="Cerrar"
        >
          <div className="lb__inner" onClick={(e) => e.stopPropagation()}>
            <AnimatePresence mode="wait">
              <motion.figure
                key={item.src}
                className="lb__figure"
                initial={{ opacity: 0, y: 30, scale: 0.96 }}
                animate={{ opacity: 1, y: 0, scale: 1 }}
                exit={{ opacity: 0, y: -20, scale: 0.98 }}
                transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                drag="x"
                dragConstraints={{ left: 0, right: 0 }}
                dragElastic={0.4}
                onDragEnd={(_, info) => {
                  if (info.offset.x < -80) step(1);
                  if (info.offset.x > 80) step(-1);
                }}
                data-cursor="Arrastra"
              >
                <img src={item.src} alt={item.alt} draggable={false} />
                <figcaption>
                  <span className="mono">{item.code} · {item.tag}</span>
                  <strong>{item.title}</strong>
                </figcaption>
              </motion.figure>
            </AnimatePresence>
            <div className="lb__controls">
              <button type="button" onClick={() => step(-1)} aria-label="Anterior">←</button>
              <span className="mono">{String(index! + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</span>
              <button type="button" onClick={() => step(1)} aria-label="Siguiente">→</button>
              <button type="button" className="lb__close" onClick={() => onChange(null)} aria-label="Cerrar">✕</button>
            </div>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
