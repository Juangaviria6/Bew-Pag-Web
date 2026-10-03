import { useRef, useState } from "react";
import {
  AnimatePresence,
  motion,
  useAnimationControls,
  useMotionValue,
  useScroll,
  useSpring,
  useTransform,
} from "motion/react";
import { features } from "../../data/content";
import { SplitText } from "../../components/ui/SplitText/SplitText";
import { StarShape, Sparkle } from "../../components/ui/Shapes/Shapes";
import "./Features.css";

interface Burst {
  id: number;
  x: number;
  y: number;
}

export function Features() {
  const [open, setOpen] = useState<number>(0);
  const cardRef = useRef<HTMLDivElement>(null);

  // Estrella: rota con el scroll, se inclina con el mouse y gira al hacer clic
  const { scrollYProgress } = useScroll({ target: cardRef, offset: ["start end", "end start"] });
  const scrollRotate = useTransform(scrollYProgress, [0, 1], [-60, 120]);
  const mx = useMotionValue(0);
  const my = useMotionValue(0);
  const rx = useSpring(useTransform(my, [-0.5, 0.5], [25, -25]), { stiffness: 120, damping: 14 });
  const ry = useSpring(useTransform(mx, [-0.5, 0.5], [-25, 25]), { stiffness: 120, damping: 14 });
  const spin = useAnimationControls();
  const [bursts, setBursts] = useState<Burst[]>([]);
  const [clicks, setClicks] = useState(0);

  const onMove = (e: React.PointerEvent) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    mx.set((e.clientX - r.left) / r.width - 0.5);
    my.set((e.clientY - r.top) / r.height - 0.5);
  };

  const onStarClick = (e: React.MouseEvent) => {
    const r = cardRef.current?.getBoundingClientRect();
    if (!r) return;
    const id = Date.now();
    setBursts((b) => [...b, { id, x: e.clientX - r.left, y: e.clientY - r.top }]);
    setTimeout(() => setBursts((b) => b.filter((x) => x.id !== id)), 900);
    setClicks((c) => c + 1);
    spin.start({ rotate: [0, 360], scale: [1, 0.85, 1.1, 1], transition: { duration: 0.9, ease: [0.22, 1, 0.36, 1] } });
  };

  return (
    <section className="section section--orange features">
      <div className="container features__grid">
        <div>
          <p className="section-kicker">
            <span>05 / 08</span>
            <span>— Landing pages</span>
          </p>
          <SplitText
            className="section-title features__title"
            lines={[[{ text: "Landing pages" }], [{ text: "que " }, { text: "convierten", className: "features__strong" }]]}
            after={<span className="blink features__strong">_</span>}
          />

          <ul className="features__list">
            {features.map((f, i) => {
              const isOpen = open === i;
              return (
                <li key={f.title} className={`features__item ${isOpen ? "is-open" : ""}`}>
                  <button
                    type="button"
                    className="features__head"
                    aria-expanded={isOpen}
                    onClick={() => setOpen(isOpen ? -1 : i)}
                  >
                    <motion.span className="features__plus" animate={{ rotate: isOpen ? 45 : 0 }}>
                      +
                    </motion.span>
                    <span className="mono">{f.title}</span>
                    <span className="features__idx mono">0{i + 1}</span>
                  </button>
                  <AnimatePresence initial={false}>
                    {isOpen && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
                        className="features__body"
                      >
                        <p>{f.description}</p>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </li>
              );
            })}
          </ul>
        </div>

        <div
          ref={cardRef}
          className="features__card"
          onPointerMove={onMove}
          onPointerLeave={() => {
            mx.set(0);
            my.set(0);
          }}
        >
          <div className="features__card-top">
            <span className="features__logo">bew<span className="blink">_</span></span>
            <span className="eyebrow">
              Websites &amp;
              <br />
              Landing pages
            </span>
          </div>

          <motion.button
            type="button"
            className="features__star"
            style={{ rotate: scrollRotate, rotateX: rx, rotateY: ry }}
            onClick={onStarClick}
            aria-label="Haz clic en la estrella"
            data-cursor="¡Clic!"
            whileTap={{ scale: 0.9 }}
          >
            <motion.span animate={spin} style={{ display: "block" }}>
              <StarShape className="features__star-svg" />
            </motion.span>
          </motion.button>

          {bursts.map((b) => (
            <span key={b.id} className="features__burst" style={{ left: b.x, top: b.y }}>
              {Array.from({ length: 8 }).map((_, i) => (
                <motion.span
                  key={i}
                  className="features__spark"
                  initial={{ x: 0, y: 0, scale: 1, opacity: 1 }}
                  animate={{
                    x: Math.cos((i / 8) * Math.PI * 2) * 90,
                    y: Math.sin((i / 8) * Math.PI * 2) * 90,
                    scale: 0,
                    opacity: 0,
                  }}
                  transition={{ duration: 0.8, ease: "easeOut" }}
                >
                  <Sparkle />
                </motion.span>
              ))}
            </span>
          ))}

          <div className="features__card-bottom">
            <p className="features__claim">
              Pequeños
              <br />
              cambios,
              <br />
              grandes
              <br />
              <strong>resultados.</strong>
            </p>
            <p className="features__brace mono">
              <span>{"{"}</span>
              <span className="features__brace-in">
                mejor
                <br />
                diseño
                <br />
                mejor
                <br />
                rendimiento
              </span>
              <span>{"}"}</span>
            </p>
          </div>
          <AnimatePresence>
            {clicks > 0 && (
              <motion.span
                key={clicks}
                className="features__count mono"
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0 }}
              >
                ✦ × {clicks}
              </motion.span>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}
