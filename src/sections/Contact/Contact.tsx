import { useEffect, useState } from "react";
import { AnimatePresence, motion } from "motion/react";
import { brand, legal, projectTypes } from "../../data/content";
import { Magnetic } from "../../components/ui/Magnetic/Magnetic";
import { PrivacyModal } from "./PrivacyModal";
import { PHONE_CHARS_RE, normalizePhone, validate, type FieldName } from "./validation";
import "./Contact.css";

const SUGGESTIONS = [
  "Una tienda de café de especialidad",
  "Mi estudio de fotografía",
  "Una app para reservar clases",
  "El lanzamiento de mi marca",
];

interface ContactProps {
  /** Tipo de proyecto (controlado desde App para poder preseleccionarlo desde Servicios). */
  type: string;
  onTypeChange: (type: string) => void;
}

type Status = "idle" | "sending" | "sent";

export function Contact({ type, onTypeChange: setType }: ContactProps) {
  const [idea, setIdea] = useState("");
  const [placeholder, setPlaceholder] = useState("");
  const [name, setName] = useState("");
  const [company, setCompany] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [consent, setConsent] = useState(false);
  const [showPolicy, setShowPolicy] = useState(false);
  const [status, setStatus] = useState<Status>("idle");
  const [error, setError] = useState("");
  const [touched, setTouched] = useState<Partial<Record<FieldName, boolean>>>({});

  const errors = validate({ name, company, email, phone, consent });
  const touch = (f: FieldName) => setTouched((t) => ({ ...t, [f]: true }));
  const warn = (f: FieldName) => (touched[f] ? errors[f] : undefined);

  // Placeholder que se escribe y se borra solo
  useEffect(() => {
    if (idea) return;
    let s = 0;
    let c = 0;
    let deleting = false;
    let t: ReturnType<typeof setTimeout>;
    const tick = () => {
      const word = SUGGESTIONS[s];
      c += deleting ? -1 : 1;
      setPlaceholder(word.slice(0, c));
      let wait = deleting ? 28 : 60;
      if (!deleting && c === word.length) {
        deleting = true;
        wait = 1600;
      } else if (deleting && c === 0) {
        deleting = false;
        s = (s + 1) % SUGGESTIONS.length;
        wait = 300;
      }
      t = setTimeout(tick, wait);
    };
    t = setTimeout(tick, 400);
    return () => clearTimeout(t);
  }, [idea]);

  const shownIdea = idea || placeholder || "Tu idea";

  const submit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (Object.keys(errors).length) {
      setTouched({ name: true, company: true, email: true, phone: true, consent: true });
      // Tras renderizar las advertencias, llevamos el foco al primer campo con error
      const form = e.currentTarget;
      requestAnimationFrame(() => form.querySelector<HTMLElement>("[aria-invalid='true']")?.focus());
      return;
    }
    setStatus("sending");
    setError("");
    try {
      const res = await fetch(`${import.meta.env.VITE_SUPABASE_URL}/functions/v1/contact`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          apikey: import.meta.env.VITE_SUPABASE_KEY,
        },
        body: JSON.stringify({
          name: name.trim(),
          company: company.trim(),
          email: email.trim(),
          phone: normalizePhone(phone),
          project_type: type,
          idea,
          data_consent: consent,
          policy_version: legal.policyVersion,
          website: new FormData(e.currentTarget).get("website") ?? "",
        }),
      });
      if (!res.ok) throw new Error(String(res.status));
      setStatus("sent");
    } catch {
      setError("No pudimos enviar tu mensaje. Inténtalo de nuevo o escríbenos por email.");
      setStatus("idle");
    }
  };

  return (
    <section id="contacto" className="section section--orange contact">
      <div className="contact__glow" />
      <div className="container contact__grid">
        <div className="contact__eq">
          <p className="section-kicker">
            <span>✦</span>
            <span>— Hablemos</span>
          </p>
          <div className="contact__code mono" aria-label="Tu idea más nuestro código es igual a tu web">
            <span className="contact__bracket">&lt;</span>
            <label className="contact__row contact__idea">
              <span className="sr-only">Tu idea</span>
              <input
                value={idea}
                onChange={(e) => setIdea(e.target.value)}
                placeholder={placeholder || "Tu idea"}
                maxLength={48}
                data-cursor="Escribe"
              />
            </label>
            <span className="contact__row contact__op">+</span>
            <span className="contact__row">Nuestro código</span>
            <span className="contact__row contact__op">=</span>
            <span className="contact__row contact__result">Tu web</span>
            <span className="contact__bracket">/&gt;</span>
          </div>
          <p className="contact__hint mono">↑ Escribe tu idea y mira cómo se convierte en web.</p>
        </div>

        <div className="contact__right">
          {/* Vista previa en vivo */}
          <div className="contact__browser">
            <div className="contact__bar">
              <span />
              <span />
              <span />
              <p className="mono">tu-web.com</p>
            </div>
            <div className="contact__site">
              <div className="contact__site-nav">
                <span className="contact__site-logo">
                  {(idea.split(" ")[0] || "tu").toLowerCase().slice(0, 12)}
                  <span className="blink">_</span>
                </span>
                <span className="mono">Inicio · Servicios · Contacto</span>
              </div>
              <h3 className="contact__site-title">
                {shownIdea}
                <span className="contact__site-dot">.</span>
              </h3>
              <p className="contact__site-sub mono">{type} · diseñado por bew_</p>
              <span className="contact__site-btn">Empezar →</span>
            </div>
          </div>

          {/* Formulario */}
          <AnimatePresence mode="wait">
            {status !== "sent" ? (
              <motion.form
                key="form"
                className="contact__form"
                onSubmit={submit}
                noValidate
                exit={{ opacity: 0, y: -20 }}
              >
                <fieldset className="contact__chips">
                  <legend className="eyebrow">Tipo de proyecto</legend>
                  {projectTypes.map((t) => (
                    <button
                      type="button"
                      key={t}
                      className={`contact__chip ${type === t ? "is-active" : ""}`}
                      onClick={() => setType(t)}
                      aria-pressed={type === t}
                    >
                      <span>{t}</span>
                    </button>
                  ))}
                </fieldset>
                <div className="contact__fields">
                  <label className="contact__field">
                    <input value={name} onChange={(e) => setName(e.target.value)} onBlur={() => touch("name")} maxLength={120} autoComplete="name" placeholder=" " aria-invalid={!!warn("name")} aria-describedby="warn-name" />
                    <span>Tu nombre *</span>
                    {warn("name") && <small id="warn-name" className="contact__warn" role="alert">{warn("name")}</small>}
                  </label>
                  <label className="contact__field">
                    <input value={company} onChange={(e) => setCompany(e.target.value)} onBlur={() => touch("company")} maxLength={160} autoComplete="organization" placeholder=" " aria-invalid={!!warn("company")} aria-describedby="warn-company" />
                    <span>Empresa</span>
                    {warn("company") && <small id="warn-company" className="contact__warn" role="alert">{warn("company")}</small>}
                  </label>
                  <label className="contact__field">
                    <input type="email" inputMode="email" value={email} onChange={(e) => setEmail(e.target.value)} onBlur={() => touch("email")} maxLength={200} autoComplete="email" placeholder=" " aria-invalid={!!warn("email")} aria-describedby="warn-email" />
                    <span>Email *</span>
                    {warn("email") && <small id="warn-email" className="contact__warn" role="alert">{warn("email")}</small>}
                  </label>
                  <label className="contact__field">
                    <input type="tel" inputMode="tel" value={phone} onChange={(e) => PHONE_CHARS_RE.test(e.target.value) && setPhone(e.target.value)} onBlur={() => touch("phone")} maxLength={20} autoComplete="tel" placeholder=" " aria-invalid={!!warn("phone")} aria-describedby="warn-phone" />
                    <span>Teléfono / WhatsApp *</span>
                    {warn("phone") && <small id="warn-phone" className="contact__warn" role="alert">{warn("phone")}</small>}
                  </label>
                </div>
                <div>
                <label className="contact__consent">
                  <input type="checkbox" checked={consent} onChange={(e) => { setConsent(e.target.checked); touch("consent"); }} aria-invalid={!!warn("consent")} aria-describedby="warn-consent" />
                  <span>
                    Autorizo de forma previa, expresa e informada el tratamiento de mis datos personales por parte de{" "}
                    <strong>{legal.controller}</strong> para contactarme sobre mi proyecto, conforme a la Ley 1581 de 2012.
                    Conozco mis derechos y la{" "}
                    <button type="button" className="contact__policy-link" onClick={() => setShowPolicy(true)}>
                      política de tratamiento de datos
                    </button>
                    .
                  </span>
                </label>
                {warn("consent") && <small id="warn-consent" className="contact__warn" role="alert">{warn("consent")}</small>}
                </div>
                {/* Honeypot anti-spam */}
                <input name="website" tabIndex={-1} autoComplete="off" aria-hidden="true" style={{ position: "absolute", left: "-9999px", opacity: 0 }} />
                {error && <p className="mono" role="alert">{error}</p>}
                <Magnetic strength={0.25}>
                  <button type="submit" className="contact__submit" disabled={status === "sending"} data-cursor="Enviar">
                    {status === "sending" ? (
                      <span className="mono">Compilando<span className="blink">_</span></span>
                    ) : (
                      <>Hablemos <span aria-hidden="true">→</span></>
                    )}
                  </button>
                </Magnetic>
              </motion.form>
            ) : (
              <motion.div
                key="done"
                className="contact__done"
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
              >
                <p className="mono">$ deploy --idea "{idea || "tu idea"}"</p>
                <p className="mono contact__ok">✓ Build completado</p>
                <h3>
                  ¡Gracias{name ? `, ${name.split(" ")[0]}` : ""}! Tu idea ya está en camino<span className="blink">_</span>
                </h3>
                <p>
                  Te escribiremos a <strong>{email}</strong> muy pronto. También puedes escribirnos a{" "}
                  <a href={`mailto:${brand.email}`}>{brand.email}</a>.
                </p>
                <button type="button" className="pill pill--cream" onClick={() => setStatus("idle")}>
                  Enviar otra idea
                </button>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
      {showPolicy && <PrivacyModal onClose={() => setShowPolicy(false)} />}
    </section>
  );
}
