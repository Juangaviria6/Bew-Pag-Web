import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useMotionValue,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import type { Service } from "../../../types";
import "./ImageRevealList.css";

interface ImageRevealListProps {
  items: Service[];
  className?: string;
  onSelect?: (item: Service) => void;
}

/**
 * Lista con imagen flotante que sigue al cursor (inspirada en VengeanceUI · image-reveal-list).
 */
export function ImageRevealList({ items, className = "", onSelect }: ImageRevealListProps) {
  const listRef = useRef<HTMLUListElement>(null);
  const [active, setActive] = useState<number | null>(null);

  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const x = useSpring(mx, { stiffness: 180, damping: 22, mass: 0.5 });
  const y = useSpring(my, { stiffness: 180, damping: 22, mass: 0.5 });
  const vx = useVelocity(x);
  const rotate = useTransform(vx, [-1500, 0, 1500], [-14, 0, 14], { clamp: true });

  const onMove = (e: React.PointerEvent) => {
    const rect = listRef.current?.getBoundingClientRect();
    if (!rect) return;
    mx.set(e.clientX - rect.left);
    my.set(e.clientY - rect.top);
  };

  const current = active !== null ? items[active] : null;

  return (
    <div className={`irl ${className}`}>
      <ul
        ref={listRef}
        className="irl__list"
        onPointerMove={onMove}
        onPointerLeave={() => setActive(null)}
      >
        {items.map((item, i) => (
          <li key={item.id}>
            <button
              type="button"
              className={`irl__row ${active === i ? "is-active" : ""} ${active !== null && active !== i ? "is-dim" : ""}`}
              onPointerEnter={() => setActive(i)}
              onFocus={() => setActive(i)}
              onClick={() => onSelect?.(item)}
              data-cursor="Cotizar"
            >
              <span className="irl__num">{item.number}</span>
              <span className="irl__title">
                <span className="irl__title-inner">{item.title}</span>
                <span className="irl__title-inner irl__title-inner--ghost" aria-hidden="true">
                  {item.title}
                </span>
              </span>
              <span className="irl__subtitle">{item.subtitle}</span>
              <img className="irl__thumb" src={item.image} alt="" loading="lazy" />
              <span className="irl__arrow" aria-hidden="true">→</span>
              <span className="irl__line" />
            </button>
          </li>
        ))}
      </ul>

      <motion.div className="irl__preview" style={{ x, y, rotate }} aria-hidden="true">
        <AnimatePresence mode="popLayout">
          {current && (
            <motion.img
              key={current.id}
              src={current.image}
              alt=""
              initial={{ opacity: 0, scale: 0.6, clipPath: "inset(50% 0 50% 0 round 18px)" }}
              animate={{ opacity: 1, scale: 1, clipPath: "inset(0% 0 0% 0 round 18px)" }}
              exit={{ opacity: 0, scale: 0.85, transition: { duration: 0.2 } }}
              transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            />
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  );
}
