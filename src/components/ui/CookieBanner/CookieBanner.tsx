import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { OPEN_SETTINGS_EVENT, getConsent, saveConsent } from "../../../lib/cookieConsent";
import { CookiePolicyModal } from "../LegalModals/LegalModals";
import "./CookieBanner.css";

interface ToggleProps {
  label: string;
  description: string;
  checked: boolean;
  disabled?: boolean;
  onChange?: (v: boolean) => void;
}

function Toggle({ label, description, checked, disabled, onChange }: ToggleProps) {
  return (
    <label className={`cookies__toggle ${disabled ? "is-locked" : ""}`}>
      <span className="cookies__toggle-text">
        <strong>{label}</strong>
        <small>{description}</small>
      </span>
      <input
        type="checkbox"
        role="switch"
        checked={checked}
        disabled={disabled}
        onChange={(e) => onChange?.(e.target.checked)}
      />
      <span className="cookies__switch" aria-hidden="true" />
    </label>
  );
}

/** Banner de consentimiento de cookies con preferencias por categoría. */
export function CookieBanner({ ready = true }: { ready?: boolean }) {
  const initial = getConsent();
  const [open, setOpen] = useState(!initial);
  const [settings, setSettings] = useState(false);
  const [analytics, setAnalytics] = useState(initial?.analytics ?? false);
  const [marketing, setMarketing] = useState(initial?.marketing ?? false);
  const [policy, setPolicy] = useState(false);

  // Reabrir desde "Preferencias de cookies" en el footer
  useEffect(() => {
    const reopen = () => {
      const c = getConsent();
      setAnalytics(c?.analytics ?? false);
      setMarketing(c?.marketing ?? false);
      setSettings(true);
      setOpen(true);
    };
    window.addEventListener(OPEN_SETTINGS_EVENT, reopen);
    return () => window.removeEventListener(OPEN_SETTINGS_EVENT, reopen);
  }, []);

  const decide = (choice: { analytics: boolean; marketing: boolean }) => {
    saveConsent(choice);
    setOpen(false);
    setSettings(false);
  };

  return (
    <>
      <AnimatePresence>
        {open && ready && (
          <motion.aside
            className="cookies"
            role="dialog"
            aria-label="Preferencias de cookies"
            initial={{ opacity: 0, y: 40, scale: 0.96 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 30, transition: { duration: 0.25 } }}
            transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
            data-lenis-prevent
          >
            <p className="cookies__kicker mono">
              <span aria-hidden="true">●</span> cookies.config
            </p>
            <h2 className="cookies__title">
              Usamos cookies<span className="accent">_</span>
            </h2>
            <p className="cookies__text">
              Usamos almacenamiento esencial para que el sitio funcione y, solo si nos autorizas, cookies analíticas y de
              marketing para mejorar tu experiencia. Lee nuestra{" "}
              <button type="button" className="cookies__link" onClick={() => setPolicy(true)}>
                política de cookies
              </button>
              .
            </p>

            <AnimatePresence initial={false}>
              {settings && (
                <motion.div
                  className="cookies__settings"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: "auto", opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.4, ease: [0.22, 1, 0.36, 1] }}
                >
                  <Toggle
                    label="Necesarias"
                    description="Imprescindibles para el funcionamiento y para recordar tu elección. Siempre activas."
                    checked
                    disabled
                  />
                  <Toggle
                    label="Analíticas"
                    description="Nos ayudan a entender cómo se usa el sitio para mejorarlo."
                    checked={analytics}
                    onChange={setAnalytics}
                  />
                  <Toggle
                    label="Marketing"
                    description="Permiten mostrarte contenido y anuncios relevantes en otras plataformas."
                    checked={marketing}
                    onChange={setMarketing}
                  />
                </motion.div>
              )}
            </AnimatePresence>

            <div className="cookies__actions">
              {settings ? (
                <button type="button" className="cookies__btn cookies__btn--primary" onClick={() => decide({ analytics, marketing })}>
                  Guardar preferencias
                </button>
              ) : (
                <button type="button" className="cookies__btn cookies__btn--primary" onClick={() => decide({ analytics: true, marketing: true })}>
                  Aceptar todas
                </button>
              )}
              <button type="button" className="cookies__btn" onClick={() => decide({ analytics: false, marketing: false })}>
                Solo necesarias
              </button>
              {!settings && (
                <button type="button" className="cookies__btn cookies__btn--ghost" onClick={() => setSettings(true)}>
                  Configurar
                </button>
              )}
            </div>
          </motion.aside>
        )}
      </AnimatePresence>
      {policy && <CookiePolicyModal onClose={() => setPolicy(false)} />}
    </>
  );
}
