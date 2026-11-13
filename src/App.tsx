import { useCallback, useState } from "react";
import { AnimatePresence } from "motion/react";
import { Preloader } from "./components/layout/Preloader/Preloader";
import { Navbar } from "./components/layout/Navbar/Navbar";
import { Footer } from "./components/layout/Footer/Footer";
import { Cursor } from "./components/ui/Cursor/Cursor";
import { CookieBanner } from "./components/ui/CookieBanner/CookieBanner";
import { Marquee } from "./components/ui/Marquee/Marquee";
import { Hero } from "./sections/Hero/Hero";
import { Services } from "./sections/Services/Services";
import { Work } from "./sections/Work/Work";
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
import { trackEvent } from "./lib/analytics";
import { PagedSite } from "./navigation/PagedSite";
import type { PageId } from "./navigation/pages";

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
    trackEvent("select_plan", { plan_id: plan.id, plan_name: plan.name });
    setProjectType(plan.projectType);
    scrollToHash("#contacto");
  };

  const quoteExtra = (service: Service) => {
    trackEvent("select_extra_service", { service_id: service.id });
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

  const renderPage = (id: PageId) => {
    switch (id) {
      case "inicio":
        return (
          <>
            <Hero ready={!loading} />
            <div className="marquee-band">
              <Marquee items={marqueeWords} />
            </div>
            <Features />
          </>
        );
      case "servicios":
        return (
          <>
            <Services onSelect={quote} />
            <Extras onSelect={quoteExtra} onCustom={quoteCustom} />
          </>
        );
      case "proyectos":
        return <Work />;
      case "proceso":
        return <Process />;
      case "planes":
        return <Plans onSelect={quotePlan} />;
      case "ia":
        return <Nexa onQuote={quoteAi} />;
      case "contacto":
        return <Contact type={projectType} onTypeChange={setProjectType} />;
    }
  };

  return (
    <>
      <AnimatePresence>{loading && <Preloader onDone={finishLoading} />}</AnimatePresence>
      {finePointer && <Cursor />}
      <Navbar />

      <PagedSite render={renderPage} footer={<Footer />} />
      <CookieBanner ready={!loading} />
    </>
  );
}
