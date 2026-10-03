import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useInView } from "motion/react";
import "./Equation.css";

type Mode = "codigo" | "diseno" | "resultados";

const MODES: { id: Mode; label: string; op?: string }[] = [
  { id: "codigo", label: "Código" },
  { id: "diseno", label: "Diseño", op: "+" },
  { id: "resultados", label: "Resultados", op: "=" },
];

const CYCLE_MS = 3800;

const codeSample = `<header class="nav">
  <a class="logo">bew_</a>
</header>
<main class="hero">
  <h1>Ideas que se convierten
      en sitios web.</h1>
  <p>Tu presencia digital,
     en buenas manos.</p>
  <a class="btn">Ver proyectos →</a>
</main>`;

export function Equation() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { amount: 0.35 });
  const [mode, setMode] = useState<Mode>("codigo");
  const [auto, setAuto] = useState(true);

  // Cicla solo mientras la sección está visible y el usuario no ha interactuado
  useEffect(() => {
    if (!auto || !inView) return;
    const t = setTimeout(() => {
      const i = MODES.findIndex((m) => m.id === mode);
      setMode(MODES[(i + 1) % MODES.length].id);
    }, CYCLE_MS);
    return () => clearTimeout(t);
  }, [mode, auto, inView]);

  const pick = (m: Mode) => {
    setAuto(false);
    setMode(m);
  };

  return (
    <section id="ecuacion" ref={ref} className="section eq">
      <div className="container eq__grid">
        <div className="eq__copy">
          <p className="section-kicker">
            <span>01 / 08</span>
            <span>— La fórmula</span>
          </p>
          <h2 className="eq__title" aria-label="Código más Diseño igual a Resultados">
            {MODES.map((m) => (
              <span key={m.id} className="eq__line">
                {m.op && <span className="eq__op">{m.op} </span>}
                <button
                  type="button"
                  className={`eq__word ${mode === m.id ? "is-active" : ""}`}
                  onPointerEnter={() => pick(m.id)}
                  onClick={() => pick(m.id)}
                  aria-pressed={mode === m.id}
                >
                  {m.label}
                  {m.id === "resultados" && <span className="blink">_</span>}
                  {mode === m.id && auto && inView && (
                    <motion.span
                      key={`${m.id}-bar`}
                      className="eq__timer"
                      initial={{ scaleX: 0 }}
                      animate={{ scaleX: 1 }}
                      transition={{ duration: CYCLE_MS / 1000, ease: "linear" }}
                    />
                  )}
                </button>
              </span>
            ))}
          </h2>
          <p className="eq__desc mono">
            Creamos experiencias
            <br />
            digitales que conectan
            <br />
            con tu audiencia.
          </p>

          <div className="eq__toggle" role="tablist" aria-label="Vista">
            {MODES.map((m) => (
              <button
                key={m.id}
                type="button"
                role="tab"
                aria-selected={mode === m.id}
                className={mode === m.id ? "is-active" : ""}
                onClick={() => pick(m.id)}
              >
                {mode === m.id && <motion.span layoutId="eq-toggle" className="eq__toggle-bg" />}
                <span className="eq__toggle-label">{m.id === "codigo" ? "</>" : m.label}</span>
              </button>
            ))}
          </div>
        </div>

        <div className={`eq__mock eq__mock--${mode}`} data-cursor={mode === "resultados" ? "Listo ✓" : undefined}>
          <div className="eq__bar">
            <span />
            <span />
            <span />
            <p className="mono">bew.studio{mode === "codigo" ? "/index.html" : ""}</p>
          </div>

          <div className="eq__page">
            <div className="eq__nav">
              <span className="eq__b eq__logo" data-label="logo">bew_</span>
              <span className="eq__b eq__links" data-label="nav">Diseño · Desarrollo · SEO</span>
            </div>
            <h3 className="eq__b eq__h" data-label="h1">
              Ideas que se convierten en sitios <em>web.</em>
            </h3>
            <p className="eq__b eq__p" data-label="p">Tu presencia digital, en buenas manos.</p>
            <span className="eq__b eq__btn" data-label="button">Ver proyectos →</span>
            <div className="eq__cards">
              {["Diseño", "Desarrollo", "Landing"].map((c) => (
                <span key={c} className="eq__b eq__card" data-label="card">
                  {c}
                </span>
              ))}
            </div>

            <AnimatePresence>
              {mode === "resultados" && (
                <>
                  <motion.span
                    className="eq__badge eq__badge--1"
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.35 } }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    ⚡ Carga ultrarrápida
                  </motion.span>
                  <motion.span
                    className="eq__badge eq__badge--2"
                    initial={{ opacity: 0, y: 20, scale: 0.8 }}
                    animate={{ opacity: 1, y: 0, scale: 1, transition: { delay: 0.5 } }}
                    exit={{ opacity: 0, scale: 0.8 }}
                  >
                    ● 100% responsive
                  </motion.span>
                </>
              )}
            </AnimatePresence>
          </div>

          <AnimatePresence>
            {mode === "codigo" && (
              <motion.pre
                className="eq__code"
                initial={{ clipPath: "inset(0 100% 0 0)" }}
                animate={{ clipPath: "inset(0 0% 0 0)" }}
                exit={{ clipPath: "inset(0 0 0 100%)" }}
                transition={{ duration: 0.6, ease: [0.76, 0, 0.24, 1] }}
              >
                {codeSample.split("\n").map((line, i) => (
                  <motion.span
                    key={i}
                    className="eq__code-line"
                    initial={{ opacity: 0, x: -10 }}
                    animate={{ opacity: 1, x: 0, transition: { delay: 0.3 + i * 0.05 } }}
                  >
                    <span className="eq__ln">{String(i + 1).padStart(2, "0")}</span>
                    {highlight(line)}
                  </motion.span>
                ))}
              </motion.pre>
            )}
          </AnimatePresence>
        </div>
      </div>
    </section>
  );
}

/** Resaltado de sintaxis mínimo para HTML. */
function highlight(line: string) {
  const parts = line.split(/(<\/?[a-z0-9]+|>|class=|"[^"]*")/g);
  return parts.map((p, i) => {
    if (!p) return null;
    if (/^<\/?[a-z0-9]+$/.test(p)) return <span key={i} className="tk-tag">{p}</span>;
    if (p === ">") return <span key={i} className="tk-tag">{p}</span>;
    if (p === "class=") return <span key={i} className="tk-attr">{p}</span>;
    if (/^".*"$/.test(p)) return <span key={i} className="tk-value">{p}</span>;
    return <span key={i}>{p}</span>;
  });
}
