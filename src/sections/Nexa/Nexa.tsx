import { useRef, useState } from "react";
import { AnimatePresence, motion, useScroll, useSpring, useTransform, type MotionValue } from "motion/react";
import { Logo } from "../../components/ui/Logo/Logo";
import { NexaLogo } from "../../components/ui/NexaLogo/NexaLogo";
import { Magnetic } from "../../components/ui/Magnetic/Magnetic";
import { aiBenefits, aiUseCases, nexa } from "../../data/nexa";
import type { AiBenefit } from "../../types";
import { AiChatDemo } from "./AiChatDemo";
import "./Nexa.css";

interface NexaProps {
  onQuote: () => void;
}

const DARK = "#05050c";

/** Convierte "texto con *resaltado*" en nodos con la clase indicada. */
function highlight(text: string, className: string) {
  return text.split(/(\*[^*]+\*)/g).map((part, i) =>
    part.startsWith("*") ? (
      <span key={i} className={className}>
        {part.slice(1, -1)}
      </span>
    ) : (
      part
    ),
  );
}

function StageLine({
  progress,
  range,
  children,
  className = "",
}: {
  progress: MotionValue<number>;
  range: [number, number];
  children: React.ReactNode;
  className?: string;
}) {
  const opacity = useTransform(progress, range, [0, 1]);
  const y = useTransform(progress, range, [40, 0]);
  const blur = useTransform(progress, range, ["blur(12px)", "blur(0px)"]);
  return (
    <motion.span className={`nexa__line ${className}`} style={{ opacity, y, filter: blur }}>
      {children}
    </motion.span>
  );
}

function BenefitIcon({ icon }: { icon: AiBenefit["icon"] }) {
  const common = { fill: "none", stroke: "currentColor", strokeWidth: 1.8, strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  if (icon === "repeat")
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <path d="M17 2l4 4-4 4" />
        <path d="M3 11V9a3 3 0 0 1 3-3h15" />
        <path d="M7 22l-4-4 4-4" />
        <path d="M21 13v2a3 3 0 0 1-3 3H3" />
        <path d="M4 4l16 16" className="nexa__icon-cross" />
      </svg>
    );
  if (icon === "clock")
    return (
      <svg viewBox="0 0 24 24" {...common}>
        <circle cx="12" cy="13" r="8" />
        <path d="M12 9v4l2.5 2.5" className="nexa__icon-hand" />
        <path d="M9 2h6" />
      </svg>
    );
  return (
    <svg viewBox="0 0 24 24" {...common}>
      <path d="M3 3v18h18" />
      <path d="M7 15l4-4 3 3 6-7" className="nexa__icon-trend" />
      <path d="M16 7h4v4" />
    </svg>
  );
}

export function Nexa({ onQuote }: NexaProps) {
  const sectionRef = useRef<HTMLElement>(null);
  const stageRef = useRef<HTMLDivElement>(null);
  const [active, setActive] = useState(0);
  const [introSeen, setIntroSeen] = useState(false);

  // 1) El fondo se oscurece a medida que la sección entra en pantalla
  const { scrollYProgress: enter } = useScroll({ target: sectionRef, offset: ["start end", "start start"] });
  const bg = useTransform(enter, [0.1, 0.9], ["#efe4d8", DARK]);
  const fg = useTransform(enter, [0.1, 0.9], ["#1b1410", "#f3f2ff"]);

  // 2) Escena fija: bew_ y Nexa se unen
  const { scrollYProgress: raw } = useScroll({ target: stageRef, offset: ["start start", "end end"] });
  const p = useSpring(raw, { stiffness: 100, damping: 26 });
  const bewX = useTransform(p, [0, 0.35], ["-16vw", "0vw"]);
  const nexaX = useTransform(p, [0, 0.35], ["16vw", "0vw"]);
  const nexaOpacity = useTransform(p, [0, 0.2], [0, 1]);
  const plusScale = useTransform(p, [0.2, 0.38], [0, 1]);
  const plusRotate = useTransform(p, [0.2, 0.38], [-180, 0]);
  const draw = useTransform(p, [0.02, 0.36], [0, 1]);
  const glow = useTransform(p, [0.25, 0.55], [0, 1]);
  const orbY1 = useTransform(p, [0, 1], ["10%", "-30%"]);
  const orbY2 = useTransform(p, [0, 1], ["-10%", "25%"]);
  const comboScale = useTransform(p, [0.7, 1], [1, 0.82]);
  const hintOpacity = useTransform(p, [0, 0.12], [1, 0]);

  // 3) Salida: degradado suave hacia el naranja de Contacto
  const outroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress: outro } = useScroll({ target: outroRef, offset: ["start end", "end end"] });
  const outroGlowY = useTransform(outro, [0, 1], ["25%", "0%"]);
  const outroGlowScale = useTransform(outro, [0, 1], [0.6, 1.4]);
  const outroTextOpacity = useTransform(outro, [0.35, 0.75], [0, 1]);
  const outroTextY = useTransform(outro, [0.35, 0.75], [40, 0]);

  const useCase = aiUseCases[active];

  return (
    <motion.section id="ia" ref={sectionRef} className="nexa"
      style={{ backgroundColor: bg, color: fg }}
      data-cursor-theme="nexa"
    >
      {/* ---------- Escena fija ---------- */}
      <div ref={stageRef} className="nexa__stage">
        <div className="nexa__sticky">
          <motion.span className="nexa__orb nexa__orb--1" style={{ opacity: glow, y: orbY1 }} />
          <motion.span className="nexa__orb nexa__orb--2" style={{ opacity: glow, y: orbY2 }} />
          <motion.span className="nexa__orb nexa__orb--3" style={{ opacity: glow }} />

          <div className="container nexa__stage-inner">
            <p className="nexa__kicker mono">✦ — Valor agregado con IA</p>

            <motion.div className="nexa__combo" style={{ scale: comboScale }}>
              <motion.span className="nexa__combo-glow" style={{ opacity: glow }} />
              <motion.div className="nexa__bew" style={{ x: bewX }}>
                <Logo />
              </motion.div>
              <motion.span className="nexa__plus" style={{ scale: plusScale, rotate: plusRotate }}>
                +
              </motion.span>
              <motion.div className="nexa__brand" style={{ x: nexaX, opacity: nexaOpacity }}>
                <NexaLogo className="nexa__mark" draw={draw} />
                <span className="nexa__word">
                  Nexa <span className="nexa__ai">AI</span>
                </span>
              </motion.div>
            </motion.div>

            <p className="nexa__stack">
              <StageLine progress={p} range={[0.38, 0.5]}>
                Páginas web
              </StageLine>
              <StageLine progress={p} range={[0.5, 0.62]}>
                + <span className="nexa__grad">Inteligencia artificial</span>
              </StageLine>
              <StageLine progress={p} range={[0.62, 0.76]} className="nexa__line--result">
                = Webs que trabajan por ti<span className="blink">_</span>
              </StageLine>
            </p>

            <motion.span className="nexa__hint mono" style={{ opacity: hintOpacity }}>
              sigue bajando ↓
            </motion.span>
          </div>
        </div>
      </div>

      {/* ---------- Contenido ---------- */}
      <div className="container nexa__content">
        <span className="nexa__dash" />
        <motion.p
          className={`nexa__intro ${introSeen ? "is-seen" : ""}`}
          onViewportEnter={() => setIntroSeen(true)}
          initial={{ opacity: 0, y: 30 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, amount: 0.6 }}
          transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
        >
          {highlight(nexa.intro, "nexa__u")}
        </motion.p>
        <p className="nexa__pitch">{nexa.pitch}</p>

        <div className="nexa__benefits">
          {aiBenefits.map((b, i) => (
            <motion.article
              key={b.title}
              className="nexa__benefit"
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.4 }}
              transition={{ duration: 0.7, delay: i * 0.12, ease: [0.22, 1, 0.36, 1] }}
              onPointerMove={(e) => {
                const r = e.currentTarget.getBoundingClientRect();
                e.currentTarget.style.setProperty("--mx", `${e.clientX - r.left}px`);
                e.currentTarget.style.setProperty("--my", `${e.clientY - r.top}px`);
              }}
            >
              <span className="nexa__benefit-icon">
                <BenefitIcon icon={b.icon} />
              </span>
              <span className="nexa__benefit-num mono">0{i + 1}</span>
              <h3>{b.title}</h3>
              <p>{b.description}</p>
            </motion.article>
          ))}
        </div>

        <div className="nexa__cases">
          <div className="nexa__cases-copy">
            <h2 className="nexa__cases-title">
              Lo que puedes
              <br />
              automatizar
              <br />
              <span className="nexa__violet">con bew_ + Nexa AI.</span>
            </h2>

            <div className="nexa__tabs" role="tablist" aria-label="Casos de uso">
              {aiUseCases.map((c, i) => (
                <button
                  key={c.id}
                  type="button"
                  role="tab"
                  aria-selected={active === i}
                  className={`nexa__tab ${active === i ? "is-active" : ""}`}
                  onClick={() => setActive(i)}
                >
                  <span className="nexa__tab-head">
                    <span className="mono">0{i + 1}</span>
                    <strong>{c.label}:</strong>
                  </span>
                  <AnimatePresence initial={false}>
                    {active === i && (
                      <motion.span
                        className="nexa__tab-body"
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: "auto", opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                      >
                        <span>{highlight(c.summary, "nexa__violet")}</span>
                      </motion.span>
                    )}
                  </AnimatePresence>
                  {active === i && <motion.span layoutId="nexa-tab" className="nexa__tab-bar" />}
                </button>
              ))}
            </div>
          </div>

          <div className="nexa__demo">
            <p className="nexa__demo-label mono">
              <span className="nexa__live" /> Demo interactiva · toca una pregunta
            </p>
            <AiChatDemo key={useCase.id} useCase={useCase} />
            <p className="nexa__demo-foot mono">
              Diseñado por <span className="nexa__orange">bew_</span> · Inteligencia por{" "}
              <span className="nexa__violet">Nexa AI</span>
            </p>
          </div>
        </div>

        <div className="nexa__cta">
          <span className="nexa__dash" />
          <p className="nexa__cta-text">
            Tu web ya no solo se ve bien.
            <br />
            <span className="nexa__grad">Ahora también trabaja por ti.</span>
          </p>
          <Magnetic strength={0.3}>
            <button type="button" className="nexa__cta-btn" onClick={onQuote} data-cursor="¡Vamos!">
              Quiero mi web con IA <span aria-hidden="true">→</span>
            </button>
          </Magnetic>
          <NexaLogo className="nexa__cta-mark" />
        </div>
      </div>

      <div ref={outroRef} className="nexa__outro" aria-hidden="true" data-cursor-theme="bew">
        <motion.span className="nexa__outro-glow" style={{ y: outroGlowY, scale: outroGlowScale }} />
        <motion.p className="nexa__outro-text mono" style={{ opacity: outroTextOpacity, y: outroTextY }}>
          ¿Listo para empezar?<span className="blink">_</span>
        </motion.p>
      </div>
    </motion.section>
  );
}
