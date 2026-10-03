import { useEffect, useState } from "react";
import { motion } from "motion/react";
import "./Preloader.css";

const WORD = "bew";

interface PreloaderProps {
  onDone: () => void;
}

/** Intro: escribe "bew_" como en una terminal y cuenta hasta 100. */
export function Preloader({ onDone }: PreloaderProps) {
  const [count, setCount] = useState(0);
  const [typed, setTyped] = useState(0);

  useEffect(() => {
    const start = performance.now();
    const duration = 1500;
    let frame = 0;
    const tick = (now: number) => {
      const p = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - p, 3);
      setCount(Math.round(eased * 100));
      setTyped(Math.min(WORD.length, Math.floor(p * (WORD.length + 1.5))));
      if (p < 1) frame = requestAnimationFrame(tick);
      else setTimeout(onDone, 250);
    };
    frame = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(frame);
  }, [onDone]);

  return (
    <motion.div
      className="preloader"
      exit={{ clipPath: "inset(0 0 100% 0)" }}
      transition={{ duration: 0.9, ease: [0.76, 0, 0.24, 1] }}
    >
      <div className="preloader__top eyebrow">
        <span>Websites &amp;</span>
        <span>Landing pages</span>
      </div>
      <div className="preloader__word">
        <span className="preloader__prompt">&gt;</span>
        {WORD.slice(0, typed)}
        <span className="blink">_</span>
      </div>
      <div className="preloader__bottom">
        <span className="eyebrow">Ideas que se convierten en webs</span>
        <span className="preloader__count">{String(count).padStart(3, "0")}</span>
      </div>
      <motion.span className="preloader__bar" style={{ scaleX: count / 100 }} />
    </motion.div>
  );
}
