import { useRef, useState } from "react";
import { motion, useMotionValue, useSpring, useTransform, type MotionValue } from "motion/react";
import { brand, navLinks, services } from "../../../data/content";
import { scrollToHash } from "../../../hooks/useSmoothScroll";
import { Logo } from "../../ui/Logo/Logo";
import { openCookieSettings } from "../../../lib/cookieConsent";
import { CookiePolicyModal, FaqModal, TermsModal } from "../../ui/LegalModals/LegalModals";
import { PrivacyModal } from "../../../sections/Contact/PrivacyModal";
import "./Footer.css";

const LETTERS = ["b", "e", "w", "_"];
const YEAR = new Date().getFullYear();

function Letter({ char, index, mouseX }: { char: string; index: number; mouseX: MotionValue<number> }) {
  // Cada letra "sube" y se engrosa según la cercanía del cursor.
  const distance = useTransform(mouseX, (x) => Math.abs(x - (index + 0.5) / LETTERS.length));
  const lift = useSpring(useTransform(distance, [0, 0.3], [-40, 0], { clamp: true }), { stiffness: 200, damping: 18 });
  const weight = useSpring(useTransform(distance, [0, 0.3], [700, 500], { clamp: true }), { stiffness: 200, damping: 20 });
  return (
    <motion.span
      className={char === "_" ? "footer__char blink" : "footer__char"}
      style={{ y: lift, fontWeight: weight }}
    >
      {char}
    </motion.span>
  );
}

const SOCIAL = [
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
];

type Modal = "terms" | "privacy" | "cookies" | "faq" | null;

export function Footer() {
  const ref = useRef<HTMLDivElement>(null);
  const mouseX = useMotionValue(-1);
  const [modal, setModal] = useState<Modal>(null);
  const close = () => setModal(null);

  const onMove = (e: React.PointerEvent) => {
    const rect = ref.current?.getBoundingClientRect();
    if (rect) mouseX.set((e.clientX - rect.left) / rect.width);
  };

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    scrollToHash(href);
  };

  return (
    <footer className="footer">
      <div className="container">
        <div className="footer__grid">
          <div className="footer__brand">
            <Logo className="footer__logo" />
            <p className="footer__desc">
              {brand.name}_ — diseño y desarrollo de sitios web y landing pages. {brand.claim}.{" "}
              <span className="accent">{brand.slogan.split(". ").pop()}</span>
            </p>
            <a href={`mailto:${brand.email}`} className="footer__mail mono">
              {brand.email} <span aria-hidden="true">↗</span>
            </a>
          </div>

          <nav className="footer__col" aria-label="Servicios">
            <p className="eyebrow footer__label">Servicios</p>
            {services.map((s) => (
              <a key={s.id} href="#servicios" onClick={go("#servicios")} className="footer__link">
                {s.title}
              </a>
            ))}
            <a href="#extras" onClick={go("#extras")} className="footer__link">
              Servicios adicionales
            </a>
          </nav>

          <nav className="footer__col" aria-label="Empresa">
            <p className="eyebrow footer__label">Empresa</p>
            {navLinks.map((l) => (
              <a key={l.href} href={l.href} onClick={go(l.href)} className="footer__link">
                {l.label}
              </a>
            ))}
            <button type="button" onClick={() => setModal("faq")} className="footer__link">
              Preguntas frecuentes
            </button>
          </nav>

          <nav className="footer__col" aria-label="Redes sociales">
            <p className="eyebrow footer__label">Síguenos</p>
            {SOCIAL.map((l) => (
              <a key={l.label} href={l.href} target="_blank" rel="noreferrer" className="footer__link">
                {l.label} <span aria-hidden="true">↗</span>
              </a>
            ))}
          </nav>
        </div>

        <div
          ref={ref}
          className="footer__word"
          onPointerMove={onMove}
          onPointerLeave={() => mouseX.set(-1)}
          aria-label="bew"
        >
          {LETTERS.map((c, i) => (
            <Letter key={i} char={c} index={i} mouseX={mouseX} />
          ))}
        </div>

        <div className="footer__bottom">
          <span className="mono">© {YEAR} bew_. Todos los derechos reservados.</span>
          <nav className="footer__legal" aria-label="Información legal">
            <button type="button" onClick={() => setModal("privacy")}>Política de privacidad</button>
            <button type="button" onClick={() => setModal("terms")}>Términos y condiciones</button>
            <button type="button" onClick={() => setModal("cookies")}>Política de cookies</button>
            <button type="button" onClick={openCookieSettings}>Preferencias de cookies</button>
            <button type="button" className="footer__top-btn" onClick={() => scrollToHash("#top")} data-cursor="Subir">
              Volver arriba <span aria-hidden="true">↑</span>
            </button>
          </nav>
        </div>
      </div>
      {modal === "terms" && <TermsModal onClose={close} />}
      {modal === "privacy" && <PrivacyModal onClose={close} />}
      {modal === "cookies" && <CookiePolicyModal onClose={close} />}
      {modal === "faq" && <FaqModal onClose={close} />}
    </footer>
  );
}
