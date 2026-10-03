import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Preloader } from "./components/layout/Preloader/Preloader";
import { Navbar } from "./components/layout/Navbar/Navbar";
import { Footer } from "./components/layout/Footer/Footer";
import { Cursor } from "./components/ui/Cursor/Cursor";
import { CookieBanner } from "./components/ui/CookieBanner/CookieBanner";
import { Marquee } from "./components/ui/Marquee/Marquee";
import { Hero } from "./sections/Hero/Hero";
import { Equation } from "./sections/Equation/Equation";
import { Services } from "./sections/Services/Services";
import { Work } from "./sections/Work/Work";
import { ProTip } from "./sections/ProTip/ProTip";
import { Features } from "./sections/Features/Features";
import { Process } from "./sections/Process/Process";
import { Plans } from "./sections/Plans/Plans";
import { Extras } from "./sections/Extras/Extras";
import { Contact } from "./sections/Contact/Contact";
import { Nexa } from "./sections/Nexa/Nexa";
import { marqueeWords, projectTypes } from "./data/content";
import { useFinePointer, useReducedMotion } from "./hooks/useMediaQuery";
import { scrollToHash, useSmoothScroll } from "./hooks/useSmoothScroll";
import type { Plan, Service } from "./types";

const SERVICE_TO_TYPE: Record<string, string> = {
  landing: "Landing page",
  seo: "SEO",
  marca: "Rediseño",
};

const EXTRA_TO_TYPE: Record<string, string> = {
  logo: "Rediseño",
  copy: "SEO",
};

export default function App() {
  const [loading, setLoading] = useState(true);
  const [projectType, setProjectType] = useState(projectTypes[0]);
  const finePointer = useFinePointer();
  const reducedMotion = useReducedMotion();

  useSmoothScroll(!reducedMotion);

  const finishLoading = useCallback(() => setLoading(false), []);

  const quote = (service: Service) => {
    setProjectType(SERVICE_TO_TYPE[service.id] ?? "Sitio web");
    scrollToHash("#contacto");
  };

  const quotePlan = (plan: Plan) => {
    setProjectType(plan.projectType);
    scrollToHash("#contacto");
  };

  const quoteExtra = (service: Service) => {
    setProjectType(EXTRA_TO_TYPE[service.id] ?? "Otro");
    scrollToHash("#contacto");
  };

  const quoteCustom = () => {
    setProjectType("Otro");
    scrollToHash("#contacto");
  };

  const quoteAi = () => {
    setProjectType("Web + IA");
    scrollToHash("#contacto");
  };

  return (
    <>
      <AnimatePresence>{loading && <Preloader onDone={finishLoading} />}</AnimatePresence>
      {finePointer && <Cursor />}
      <Navbar />

      <main>
        <Hero ready={!loading} />
        <div className="marquee-band">
          <Marquee items={marqueeWords} />
        </div>
        <Equation />
        <Services onSelect={quote} />
        <Work />
        <ProTip />
        <Features />
        <Process />
        <Plans onSelect={quotePlan} />
        <Extras onSelect={quoteExtra} onCustom={quoteCustom} />
        <Nexa onQuote={quoteAi} />
        <Contact type={projectType} onTypeChange={setProjectType} />
      </main>

      <Footer />
      <CookieBanner ready={!loading} />
    </>
  );
}
