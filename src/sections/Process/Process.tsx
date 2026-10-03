import { useRef, useState } from "react";
import { motion, useMotionValueEvent, useScroll, useSpring, useTransform } from "motion/react";
import { processSteps } from "../../data/content";
import { scrollToHash } from "../../hooks/useSmoothScroll";
import { CodeIcon } from "../../components/ui/Shapes/Shapes";
import "./Process.css";

/** Curva de la idea al clic: sube como una gráfica de crecimiento. */
const PATH = "M0 260 C 180 260, 220 250, 300 200 S 460 120, 560 130 S 760 40, 1000 20";

export function Process() {
  const ref = useRef<HTMLElement>(null);
  const { scrollYProgress } = useScroll({ target: ref, offset: ["start start", "end end"] });
  const progress = useSpring(scrollYProgress, { stiffness: 90, damping: 24 });
  const [step, setStep] = useState(0);

  useMotionValueEvent(scrollYProgress, "change", (v) => {
    setStep(Math.min(processSteps.length, Math.floor(v * (processSteps.length + 0.6))));
  });

  const dotX = useTransform(progress, [0, 1], ["0%", "100%"]);
  const pct = useTransform(progress, (v) => `${Math.round(v * 100)}%`);

  return (
    <section id="proceso" ref={ref} className="process">
      <div className="process__sticky">
        <div className="container">
          <div className="process__head">
            <div>
              <p className="section-kicker">
                <span>06 / 08</span>
                <span>— Proceso</span>
              </p>
              <h2 className="section-title">
                Desde la idea
                <br />
                hasta el <span className="accent">clic.</span>
              </h2>
            </div>
            <button
              type="button"
              className="process__pill"
              onClick={() => scrollToHash("#contacto")}
              data-cursor="Empezar"
            >
              <span className="process__dot" />
              Landing page para tu proyecto
              <span className="process__pill-arrow">→</span>
            </button>
          </div>

          <div className="process__chart">
            <svg viewBox="0 0 1000 280" preserveAspectRatio="none" className="process__svg" aria-hidden="true">
              <path d={PATH} className="process__track" />
              <motion.path d={PATH} className="process__line" style={{ pathLength: progress }} />
            </svg>
            <div className="process__meter">
              <motion.span className="process__meter-fill" style={{ scaleX: progress }} />
              <motion.span className="process__meter-dot" style={{ left: dotX }} />
            </div>
            <motion.span className="process__pct mono">{pct}</motion.span>
          </div>

          <ol className="process__steps">
            {processSteps.map((s, i) => (
              <li key={s.number} className={`process__step ${i < step ? "is-on" : ""}`}>
                <span className="process__num mono">{s.number}</span>
                <h3>{s.title}</h3>
                <p>{s.description}</p>
              </li>
            ))}
          </ol>

          <div className="process__foot">
            <CodeIcon className="process__icon" />
            <span className="process__tag mono">#bew</span>
          </div>
        </div>
      </div>
    </section>
  );
}
