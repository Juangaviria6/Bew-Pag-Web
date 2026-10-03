import { motion } from "motion/react";
import { ImageRevealList } from "../../components/ui/ImageRevealList/ImageRevealList";
import { SplitText } from "../../components/ui/SplitText/SplitText";
import { Magnetic } from "../../components/ui/Magnetic/Magnetic";
import { extraServices } from "../../data/content";
import type { Service } from "../../types";
import "./Extras.css";

interface ExtrasProps {
  onSelect: (service: Service) => void;
  onCustom: () => void;
}

export function Extras({ onSelect, onCustom }: ExtrasProps) {
  return (
    <section id="extras" className="section extras">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="section-kicker">
              <span>08 / 08</span>
              <span>— Servicios adicionales</span>
            </p>
            <SplitText
              className="section-title"
              lines={[[{ text: "Todo lo que tu web" }], [{ text: "puede " }, { text: "necesitar.", className: "accent" }]]}
            />
          </div>
          <p className="extras__note mono">
            Complementa cualquier plan.
            <br />
            Haz clic para cotizarlo →
          </p>
        </div>

        <ImageRevealList items={extraServices} onSelect={onSelect} />

        <motion.div
          className="extras__custom"
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: "-80px" }}
          transition={{ duration: 0.7, ease: [0.22, 1, 0.36, 1] }}
        >
          <div>
            <p className="eyebrow extras__eyebrow">¿Algo a tu medida?</p>
            <h3>Un proyecto especial, una idea única.</h3>
            <p>
              Cuéntanos qué tienes en mente y diseñamos una solución web personalizada. Agenda una llamada y
              hablemos de tu proyecto.
            </p>
          </div>
          <Magnetic strength={0.25}>
            <button type="button" className="pill pill--cream" onClick={onCustom} data-cursor="Hablemos">
              Agendar llamada gratuita <span aria-hidden="true">→</span>
            </button>
          </Magnetic>
        </motion.div>
      </div>
    </section>
  );
}
