import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { setScrollLocked } from "../../../hooks/useSmoothScroll";
import { goToPage, useCurrentPage } from "../../../navigation/pageRouter";
import { PAGES, hrefFor, type PageId } from "../../../navigation/pages";
import { Logo } from "../../ui/Logo/Logo";
import { Magnetic } from "../../ui/Magnetic/Magnetic";
import "./Navbar.css";

/** Páginas que empiezan con una sección clara: el menú necesita fondo desde el inicio. */
const LIGHT_TOP: PageId[] = ["servicios", "proceso", "planes"];

export function Navbar() {
  const page = useCurrentPage();
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [scrolled, setScrolled] = useState(false);
  const solid = scrolled || LIGHT_TOP.includes(page);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    setScrolled(y > 40);
  });

  useEffect(() => setScrollLocked(open), [open]);

  const go = (id: PageId) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    goToPage(id);
  };

  return (
    <>
      <motion.header
        className={`nav ${solid ? "is-solid" : ""} ${open ? "is-open" : ""}`}
      >
        <div className="nav__inner">
          <a href={hrefFor("inicio")} className="nav__logo" onClick={go("inicio")} aria-label="Ir al inicio">
            <Logo />
          </a>

          <nav className="nav__links" aria-label="Principal">
            {PAGES.filter((p) => p.id !== "inicio" && p.id !== "contacto").map((l, i) => (
              <a
                key={l.id}
                href={hrefFor(l.id)}
                onClick={go(l.id)}
                className="nav__link"
                aria-current={page === l.id ? "page" : undefined}
              >
                <span className="nav__idx">0{i + 1}</span>
                <span className="nav__roll" data-text={l.label}>
                  <span>{l.label}</span>
                </span>
              </a>
            ))}
          </nav>

          <div className="nav__actions">
            <Magnetic>
              <a
                href={hrefFor("contacto")}
                className="pill pill--solid nav__cta"
                onClick={go("contacto")}
                aria-current={page === "contacto" ? "page" : undefined}
              >
                Hablemos <span aria-hidden="true">→</span>
              </a>
            </Magnetic>
            <button
              type="button"
              className="nav__burger"
              aria-expanded={open}
              aria-label={open ? "Cerrar menú" : "Abrir menú"}
              onClick={() => setOpen((o) => !o)}
            >
              <span />
              <span />
            </button>
          </div>
        </div>
        <motion.span className="nav__progress" style={{ scaleX: progress }} />
      </motion.header>

      <AnimatePresence>
        {open && (
          <motion.div
            className="menu"
            initial={{ clipPath: "circle(0% at calc(100% - 40px) 36px)" }}
            animate={{ clipPath: "circle(150% at calc(100% - 40px) 36px)" }}
            exit={{ clipPath: "circle(0% at calc(100% - 40px) 36px)" }}
            transition={{ duration: 0.7, ease: [0.76, 0, 0.24, 1] }}
          >
            <nav className="menu__links">
              {PAGES.map((l, i) => (
                <motion.a
                  key={l.id}
                  href={hrefFor(l.id)}
                  onClick={go(l.id)}
                  aria-current={page === l.id ? "page" : undefined}
                  initial={{ y: 60, opacity: 0 }}
                  animate={{ y: 0, opacity: 1, transition: { delay: 0.25 + i * 0.06 } }}
                >
                  <span className="mono">0{i}</span>
                  {l.label}
                </motion.a>
              ))}
            </nav>
            <p className="menu__foot eyebrow">Tu idea, en línea_</p>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
}
