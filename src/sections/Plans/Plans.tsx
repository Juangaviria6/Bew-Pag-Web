import { useState } from "react";
import { AnimatePresence, motion, useMotionValue, useMotionTemplate } from "motion/react";
import { plans } from "../../data/content";
import { useMediaQuery } from "../../hooks/useMediaQuery";
import { SplitText } from "../../components/ui/SplitText/SplitText";
import { Magnetic } from "../../components/ui/Magnetic/Magnetic";
import type { Plan } from "../../types";
import "./Plans.css";

interface PlansProps {
  onSelect: (plan: Plan) => void;
}

function Panel({
  plan,
  index,
  active,
  onActivate,
  onSelect,
}: {
  plan: Plan;
  index: number;
  active: boolean;
  onActivate: () => void;
  onSelect: (plan: Plan) => void;
}) {
  // Foco de luz que sigue al cursor dentro del panel
  const mx = useMotionValue(50);
  const my = useMotionValue(50);
  const spot = useMotionTemplate`radial-gradient(420px circle at ${mx}% ${my}%, rgb(244 88 10 / 0.28), transparent 60%)`;

  return (
    <motion.article
      className={`plans__panel ${active ? "is-active" : ""} ${plan.featured ? "is-featured" : ""}`}
      onPointerEnter={onActivate}
      onFocus={onActivate}
      onPointerMove={(e) => {
        const r = e.currentTarget.getBoundingClientRect();
        mx.set(((e.clientX - r.left) / r.width) * 100);
        my.set(((e.clientY - r.top) / r.height) * 100);
      }}
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: "-80px" }}
      transition={{ duration: 0.7, delay: index * 0.1, ease: [0.22, 1, 0.36, 1] }}
      tabIndex={0}
      aria-label={plan.name}
    >
      <motion.span className="plans__spot" style={{ background: spot }} aria-hidden="true" />

      <header className="plans__head">
        <span className="plans__num mono">0{index + 1}</span>
        {plan.featured && <span className="plans__badge mono">Recomendado</span>}
      </header>

      <h3 className="plans__name">
        {plan.name}
        <span className="plans__caret blink">_</span>
      </h3>
      <p className="plans__tagline">{plan.tagline}</p>

      <div className="plans__price">
        <strong>{plan.price}</strong>
        <span className="mono">{plan.priceNote}</span>
      </div>

      <div className="plans__body">
        <AnimatePresence initial={false}>
          {active && (
            <motion.div
              key="body"
              className="plans__reveal"
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: "auto" }}
              exit={{ opacity: 0, height: 0 }}
              transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
            >
              <p className="plans__audience">{plan.audience}</p>
              <ul className="plans__features">
                {plan.features.map((f, i) => (
                  <motion.li
                    key={f}
                    initial={{ opacity: 0, x: -14 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: 0.08 + i * 0.05, duration: 0.4 }}
                  >
                    <span aria-hidden="true">✓</span>
                    {f}
                  </motion.li>
                ))}
              </ul>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      <Magnetic strength={0.2}>
        <button type="button" className="plans__cta" onClick={() => onSelect(plan)} data-cursor="Cotizar">
          Solicitar este plan <span aria-hidden="true">→</span>
        </button>
      </Magnetic>
    </motion.article>
  );
}

export function Plans({ onSelect }: PlansProps) {
  const [active, setActive] = useState(1);
  // En pantallas táctiles/estrechas no hay hover: mostramos todos los planes completos
  const stacked = useMediaQuery("(max-width: 960px)");

  return (
    <section id="planes" className="section plans">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="section-kicker">
              <span>07 / 08</span>
              <span>— Planes</span>
            </p>
            <SplitText
              className="section-title"
              lines={[[{ text: "Elige el plan" }], [{ text: "que va con tu " }, { text: "idea.", className: "accent" }]]}
            />
          </div>
          <p className="plans__note mono">
            Pasa el cursor sobre cada plan
            <br />
            para ver qué incluye →
          </p>
        </div>

        <div className="plans__grid">
          {plans.map((plan, i) => (
            <Panel
              key={plan.id}
              plan={plan}
              index={i}
              active={stacked || active === i}
              onActivate={() => setActive(i)}
              onSelect={onSelect}
            />
          ))}
        </div>
      </div>
    </section>
  );
}
