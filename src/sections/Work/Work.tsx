import { useState } from "react";
import { HoverExpand } from "../../components/ui/HoverExpand/HoverExpand";
import { Lightbox } from "../../components/ui/Lightbox/Lightbox";
import { SplitText } from "../../components/ui/SplitText/SplitText";
import { projects } from "../../data/content";
import "./Work.css";

export function Work() {
  const [open, setOpen] = useState<number | null>(null);

  return (
    <section id="proyectos" className="section section--orange work">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="section-kicker">
              <span>03 / 08</span>
              <span>— Proyectos</span>
            </p>
            <SplitText
              className="section-title"
              lines={[
                [{ text: "Tu marca también necesita" }],
                [{ text: "un " }, { text: "buen sitio web.", className: "work__strong" }],
              ]}
            />
          </div>
          <p className="work__note mono">
            {String(projects.length).padStart(2, "0")} piezas · pasa el cursor
            <br />y haz clic para ampliar
          </p>
        </div>
        <HoverExpand images={projects} onOpen={setOpen} />
      </div>
      <Lightbox items={projects} index={open} onChange={setOpen} />
    </section>
  );
}
