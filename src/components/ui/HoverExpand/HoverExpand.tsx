import { useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import type { Project } from "../../../types";
import "./HoverExpand.css";

interface HoverExpandProps {
  images: Project[];
  className?: string;
  onOpen?: (index: number) => void;
}

/**
 * Galería que se expande al pasar el cursor (inspirada en Skiper UI · skiper52).
 * Horizontal en escritorio, vertical en móvil.
 */
export function HoverExpand({ images, className = "", onOpen }: HoverExpandProps) {
  const [active, setActive] = useState(Math.floor(images.length / 2));

  return (
    <div className={`hx ${className}`}>
      {images.map((img, i) => {
        const isActive = i === active;
        return (
          <motion.button
            key={img.src}
            type="button"
            className={`hx__item ${isActive ? "is-active" : ""}`}
            data-cursor={isActive ? "Abrir" : "Ver"}
            initial={false}
            animate={{ flexGrow: isActive ? 7 : 1 }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            onPointerEnter={() => setActive(i)}
            onFocus={() => setActive(i)}
            onClick={() => (isActive ? onOpen?.(i) : setActive(i))}
            aria-label={`${img.code} — ${img.title}`}
          >
            <motion.img
              src={img.src}
              alt={img.alt}
              loading="lazy"
              draggable={false}
              animate={{ scale: isActive ? 1 : 1.25, filter: isActive ? "grayscale(0)" : "grayscale(0.35)" }}
              transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            />
            <span className="hx__shade" />
            <span className="hx__code">{img.code}</span>
            <AnimatePresence>
              {isActive && (
                <motion.span
                  className="hx__caption"
                  initial={{ opacity: 0, y: 16 }}
                  animate={{ opacity: 1, y: 0, transition: { delay: 0.25 } }}
                  exit={{ opacity: 0, y: 8, transition: { duration: 0.15 } }}
                >
                  <span className="hx__tag">{img.tag}</span>
                  <span className="hx__title">{img.title}</span>
                </motion.span>
              )}
            </AnimatePresence>
          </motion.button>
        );
      })}
    </div>
  );
}
