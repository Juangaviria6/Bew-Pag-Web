import { useRef } from "react";
import {
  motion,
  useAnimationFrame,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from "motion/react";
import "./Marquee.css";

interface MarqueeProps {
  items: string[];
  /** Porcentaje del ancho que avanza por segundo. */
  speed?: number;
  className?: string;
}

const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/**
 * Cinta infinita que acelera y cambia de dirección según la velocidad del scroll.
 */
export function Marquee({ items, speed = 2.5, className = "" }: MarqueeProps) {
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const velocity = useSpring(useVelocity(scrollY), { damping: 50, stiffness: 400 });
  const factor = useTransform(velocity, [-1000, 0, 1000], [-4, 0, 4], { clamp: false });
  const direction = useRef(1);
  const hovered = useRef(false);
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    const f = factor.get();
    if (f < 0) direction.current = -1;
    else if (f > 0) direction.current = 1;
    const slow = hovered.current ? 0.2 : 1;
    const move = direction.current * speed * (delta / 1000) * (1 + Math.abs(f)) * slow;
    baseX.set(baseX.get() - move);
  });

  const row = (
    <>
      {items.map((item, i) => (
        <span className="marquee__item" key={i}>
          {item}
          <span className="marquee__sep">/</span>
        </span>
      ))}
    </>
  );

  return (
    <div
      className={`marquee ${className}`}
      onPointerEnter={() => (hovered.current = true)}
      onPointerLeave={() => (hovered.current = false)}
    >
      <motion.div className="marquee__track" style={{ x }}>
        <div className="marquee__group">{row}</div>
        <div className="marquee__group" aria-hidden="true">
          {row}
        </div>
      </motion.div>
    </div>
  );
}
