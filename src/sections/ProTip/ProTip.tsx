import { useEffect, useMemo, useRef, useState } from "react";
import { motion, useInView, useScroll, useTransform, type MotionValue } from "motion/react";
import { heroCode } from "../../data/content";
import "./ProTip.css";

const QUOTE = "Un buen diseño habla. Un buen código lo hace funcionar.";
const STRONG = new Set(["funcionar."]);

function Word({ word, range, progress }: { word: string; range: [number, number]; progress: MotionValue<number> }) {
  const opacity = useTransform(progress, range, [0.18, 1]);
  return (
    <motion.span style={{ opacity }} className={STRONG.has(word) ? "protip__strong" : undefined}>
      {word}{" "}
    </motion.span>
  );
}

export function ProTip() {
  const sectionRef = useRef<HTMLElement>(null);
  const quoteRef = useRef<HTMLParagraphElement>(null);
  const screenRef = useRef<HTMLDivElement>(null);
  const inView = useInView(screenRef, { amount: 0.5 });

  // Texto que se "enciende" palabra por palabra con el scroll
  const { scrollYProgress: quoteProgress } = useScroll({ target: quoteRef, offset: ["start 0.85", "end 0.45"] });
  // La tapa del portátil se abre al entrar en la sección
  const { scrollYProgress } = useScroll({ target: sectionRef, offset: ["start end", "center center"] });
  const lid = useTransform(scrollYProgress, [0, 1], [-70, 0]);
  const lift = useTransform(scrollYProgress, [0, 1], [80, 0]);

  // Máquina de escribir
  const lineLengths = useMemo(() => heroCode.map((l) => l.reduce((n, t) => n + t.text.length, 0)), []);
  const lineStarts = useMemo(() => lineLengths.map((_, i) => lineLengths.slice(0, i).reduce((a, b) => a + b, 0)), [lineLengths]);
  const total = lineLengths.reduce((a, b) => a + b, 0);
  const [typed, setTyped] = useState(0);
  const [run, setRun] = useState(0);

  useEffect(() => {
    if (!inView || typed >= total) return;
    const t = setTimeout(() => setTyped((c) => c + 1), 22);
    return () => clearTimeout(t);
  }, [inView, typed, total, run]);

  // Cuántas líneas completas llevamos → qué partes de la vista previa se muestran
  const doneLines = lineLengths.filter((len, i) => lineStarts[i] + len <= typed).length;
  const cursorLine = Math.min(doneLines, heroCode.length - 1);

  const words = QUOTE.split(" ");

  return (
    <section ref={sectionRef} className="section protip">
      <div className="container protip__grid">
        <div className="protip__copy">
          <p className="section-kicker">
            <span>04 / 08</span>
            <span>— Pro tip</span>
          </p>
          <span className="pill pill--orange protip__pill">
            Pro tip<span className="blink">_</span>
          </span>
          <p ref={quoteRef} className="protip__quote">
            {words.map((w, i) => (
              <Word key={i} word={w} progress={quoteProgress} range={[i / words.length, (i + 1) / words.length]} />
            ))}
          </p>
        </div>

        <motion.div className="laptop" style={{ y: lift }}>
          <motion.div className="laptop__lid" style={{ rotateX: lid }}>
            <div className="laptop__screen" ref={screenRef}>
              <div className="laptop__tabs mono">
                <span className="is-active">index.html</span>
                <span>styles.css</span>
                <button
                  type="button"
                  className="laptop__replay"
                  onClick={() => {
                    setTyped(0);
                    setRun((r) => r + 1);
                  }}
                  data-cursor="Reescribir"
                >
                  ↻
                </button>
              </div>
              <div className="laptop__body">
                <pre className="laptop__code">
                  {heroCode.map((line, li) => {
                    const start = lineStarts[li];
                    if (li > cursorLine) return null;
                    let remaining = typed - start;
                    return (
                      <span key={li} className="laptop__line">
                        <span className="laptop__ln">{li + 1}</span>
                        {line.map((tok, ti) => {
                          const shown = tok.text.slice(0, Math.max(0, remaining));
                          remaining -= tok.text.length;
                          return shown ? (
                            <span key={ti} className={`tok tok--${tok.kind ?? "text"}`}>
                              {shown}
                            </span>
                          ) : null;
                        })}
                        {li === cursorLine && <span className="laptop__cursor blink">▍</span>}
                      </span>
                    );
                  })}
                </pre>

                <div className={`laptop__preview ${doneLines >= heroCode.length ? "is-done" : ""}`}>
                  <span className="laptop__preview-label mono">vista previa</span>
                  <motion.h4 initial={false} animate={{ opacity: doneLines >= 3 ? 1 : 0, y: doneLines >= 3 ? 0 : 12 }}>
                    Grandes ideas
                  </motion.h4>
                  <motion.p initial={false} animate={{ opacity: doneLines >= 4 ? 1 : 0, y: doneLines >= 4 ? 0 : 12 }}>
                    en grandes webs
                  </motion.p>
                  <motion.span
                    className="laptop__btn"
                    initial={false}
                    animate={{ opacity: doneLines >= 5 ? 1 : 0, scale: doneLines >= 5 ? 1 : 0.8 }}
                  >
                    Hablemos →
                  </motion.span>
                </div>
              </div>
            </div>
          </motion.div>
          <div className="laptop__base" />
        </motion.div>
      </div>
    </section>
  );
}
