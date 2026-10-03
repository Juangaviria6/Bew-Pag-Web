import { useEffect, useState } from "react";
import { AnimatePresence, motion, useMotionValueEvent, useScroll, useSpring } from "motion/react";
import { navLinks } from "../../../data/content";
import { scrollToHash, setScrollLocked } from "../../../hooks/useSmoothScroll";
import { Logo } from "../../ui/Logo/Logo";
import { Magnetic } from "../../ui/Magnetic/Magnetic";
import "./Navbar.css";

export function Navbar() {
  const { scrollY, scrollYProgress } = useScroll();
  const progress = useSpring(scrollYProgress, { stiffness: 120, damping: 30 });
  const [hidden, setHidden] = useState(false);
  const [solid, setSolid] = useState(false);
  const [open, setOpen] = useState(false);

  useMotionValueEvent(scrollY, "change", (y) => {
    const prev = scrollY.getPrevious() ?? 0;
    setHidden(y > prev && y > 240 && !open);
    setSolid(y > 40);
  });

  useEffect(() => setScrollLocked(open), [open]);

  const go = (href: string) => (e: React.MouseEvent) => {
    e.preventDefault();
    setOpen(false);
    scrollToHash(href);
  };

  return (
    <>
      <motion.header
        className={`nav ${solid ? "is-solid" : ""} ${open ? "is-open" : ""}`}
        animate={{ y: hidden ? "-120%" : "0%" }}
        transition={{ duration: 0.45, ease: [0.22, 1, 0.36, 1] }}
      >
        <div className="nav__inner">
          <a href="#top" className="nav__logo" onClick={go("#top")} aria-label="Ir al inicio">
            <Logo />
          </a>

          <nav className="nav__links" aria-label="Principal">
            {navLinks.map((l, i) => (
              <a key={l.href} href={l.href} onClick={go(l.href)} className="nav__link">
                <span className="nav__idx">0{i + 1}</span>
                <span className="nav__roll" data-text={l.label}>
                  <span>{l.label}</span>
                </span>
              </a>
            ))}
          </nav>

          <div className="nav__actions">
            <Magnetic>
              <a href="#contacto" className="pill pill--solid nav__cta" onClick={go("#contacto")}>
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
              {[{ label: "Inicio", href: "#top" }, ...navLinks].map((l, i) => (
                <motion.a
                  key={l.href}
                  href={l.href}
                  onClick={go(l.href)}
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
