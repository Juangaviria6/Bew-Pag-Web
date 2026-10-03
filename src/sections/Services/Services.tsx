import { ImageRevealList } from "../../components/ui/ImageRevealList/ImageRevealList";
import { SplitText } from "../../components/ui/SplitText/SplitText";
import { services } from "../../data/content";
import type { Service } from "../../types";
import "./Services.css";

interface ServicesProps {
  onSelect: (service: Service) => void;
}

export function Services({ onSelect }: ServicesProps) {
  return (
    <section id="servicios" className="section services">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="section-kicker">
              <span>02 / 08</span>
              <span>— Servicios</span>
            </p>
            <SplitText
              className="section-title"
              lines={[[{ text: "Ideas que se convierten" }], [{ text: "en sitios " }, { text: "web.", className: "accent" }]]}
            />
          </div>
          <p className="services__note mono">
            Pasa el cursor por cada servicio.
            <br />
            Haz clic para cotizarlo →
          </p>
        </div>
        <ImageRevealList items={services} onSelect={onSelect} />
      </div>
    </section>
  );
}
