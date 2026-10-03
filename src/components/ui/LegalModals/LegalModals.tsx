import { useEffect, useState } from "react";
import { legal } from "../../../data/content";
import { COOKIE_POLICY_VERSION, openCookieSettings } from "../../../lib/cookieConsent";

/** Contenedor común: reutiliza los estilos `.privacy` del modal de política de datos. */
function Dialog({ title, meta, onClose, children }: { title: string; meta?: string; onClose: () => void; children: React.ReactNode }) {
  useEffect(() => {
    const onKey = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    window.addEventListener("keydown", onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      window.removeEventListener("keydown", onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  return (
    <div className="privacy" role="presentation" onClick={onClose} data-lenis-prevent>
      <div className="privacy__dialog" role="dialog" aria-modal="true" aria-label={title} onClick={(e) => e.stopPropagation()}>
        <button type="button" className="privacy__close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
        <h3>{title}</h3>
        {meta && <p className="privacy__meta mono">{meta}</p>}
        {children}
      </div>
    </div>
  );
}

const email = <a href={`mailto:${legal.email}`}>{legal.email}</a>;

export function TermsModal({ onClose }: { onClose: () => void }) {
  return (
    <Dialog title="Términos y condiciones" meta={`Versión ${legal.policyVersion} · Actualizados el ${legal.updatedAt}`} onClose={onClose}>
      <h4>1. Quiénes somos</h4>
      <p>
        {legal.controller} presta servicios de diseño y desarrollo de sitios web, landing pages y servicios digitales
        relacionados. Al contactarnos o contratar un servicio aceptas estos términos.
      </p>

      <h4>2. Servicios y propuesta</h4>
      <p>
        El alcance, entregables, plazos y valor de cada proyecto se definen en una propuesta o cotización escrita que
        debes aceptar antes de iniciar. Lo que no esté descrito en la propuesta se considera fuera de alcance y puede
        cotizarse aparte.
      </p>

      <h4>3. Pagos</h4>
      <p>Las condiciones y fechas de pago se establecen en la propuesta aceptada. El inicio del trabajo puede depender del pago acordado.</p>

      <h4>4. Responsabilidades del cliente</h4>
      <ul>
        <li>Entregar a tiempo los contenidos, imágenes, accesos y aprobaciones necesarios.</li>
        <li>Contar con los derechos sobre los materiales que nos suministre (textos, imágenes, marcas).</li>
        <li>Los retrasos en la información o aprobaciones pueden mover los plazos de entrega.</li>
      </ul>

      <h4>5. Revisiones y cambios</h4>
      <p>Cada plan incluye un número definido de rondas de revisión. Cambios adicionales o fuera del alcance acordado se cotizan por separado.</p>

      <h4>6. Propiedad intelectual</h4>
      <p>
        Una vez pagado el valor total acordado, el cliente recibe los derechos de uso del diseño y contenidos
        entregados para su proyecto. Conservamos el derecho de mostrar el trabajo en nuestro portafolio, salvo que se
        acuerde lo contrario por escrito. Las herramientas, librerías de terceros y componentes propios conservan sus
        licencias originales.
      </p>

      <h4>7. Garantía y soporte</h4>
      <p>El periodo de soporte posterior a la entrega, si aplica, se indica en la propuesta de cada plan.</p>

      <h4>8. Limitación de responsabilidad</h4>
      <p>
        No respondemos por daños indirectos, lucro cesante ni por fallas de servicios de terceros (hosting, dominios,
        pasarelas de pago, plataformas) fuera de nuestro control.
      </p>

      <h4>9. Datos personales</h4>
      <p>El tratamiento de datos personales se rige por nuestra política de tratamiento de datos, conforme a la Ley 1581 de 2012.</p>

      <h4>10. Ley aplicable y contacto</h4>
      <p>
        Estos términos se rigen por las leyes de la República de Colombia. Para cualquier duda escríbenos a {email}.
      </p>
    </Dialog>
  );
}

const FAQS: { q: string; a: React.ReactNode }[] = [
  {
    q: "¿Qué incluye cada plan?",
    a: "Web Start es una página one page para arrancar; Web Grow suma más páginas, pagos en línea y blog; Web Scale incluye diseño totalmente a medida, automatizaciones y más. Puedes ver el detalle en la sección Planes.",
  },
  {
    q: "¿Cuánto cuesta?",
    a: "El valor depende del alcance de tu proyecto. Cuéntanos tu idea en el formulario y te enviamos una propuesta.",
  },
  {
    q: "¿Cuánto tarda en estar lista mi web?",
    a: "Depende del plan y de qué tan rápido nos entregues contenidos y aprobaciones. Los tiempos se confirman en la propuesta.",
  },
  {
    q: "¿Puedo pedir algo personalizado?",
    a: "Sí. Si tu proyecto necesita funcionalidades específicas, diseñamos una solución a medida. Agenda una llamada y lo hablamos.",
  },
  {
    q: "¿Ofrecen logo, SEO, hosting y redes sociales?",
    a: "Sí, como servicios adicionales que puedes sumar a cualquier plan. Los encuentras en la sección de servicios adicionales.",
  },
  {
    q: "¿Qué pasa con mis datos cuando envío el formulario?",
    a: "Solo los usamos para contactarte sobre tu proyecto, con tu autorización previa y conforme a la Ley 1581 de 2012. Puedes consultar, corregir o pedir la eliminación de tus datos escribiéndonos.",
  },
  {
    q: "¿Cómo los contacto?",
    a: <>Por el formulario de contacto o escribiéndonos a {email}.</>,
  },
];

export function FaqModal({ onClose }: { onClose: () => void }) {
  const [open, setOpen] = useState<number | null>(0);
  return (
    <Dialog title="Preguntas frecuentes" onClose={onClose}>
      <div className="faq">
        {FAQS.map((f, i) => (
          <div key={f.q} className={`faq__item ${open === i ? "is-open" : ""}`}>
            <button type="button" className="faq__q" aria-expanded={open === i} onClick={() => setOpen(open === i ? null : i)}>
              <span>{f.q}</span>
              <span className="faq__icon" aria-hidden="true">+</span>
            </button>
            {open === i && <p className="faq__a">{f.a}</p>}
          </div>
        ))}
      </div>
    </Dialog>
  );
}

export function CookiePolicyModal({ onClose }: { onClose: () => void }) {
  const manage = () => {
    onClose();
    openCookieSettings();
  };

  return (
    <Dialog title="Política de cookies" meta={`Versión ${COOKIE_POLICY_VERSION} · Actualizada el ${legal.updatedAt}`} onClose={onClose}>
      <h4>1. ¿Qué son las cookies?</h4>
      <p>
        Son pequeños archivos o registros que un sitio web guarda en tu navegador para recordar información sobre tu
        visita. En esta política también incluimos tecnologías similares, como el almacenamiento local (localStorage).
      </p>

      <h4>2. Tipos de cookies</h4>
      <ul>
        <li>
          <strong>Necesarias:</strong> imprescindibles para que el sitio funcione y para recordar tus preferencias de
          privacidad. No requieren consentimiento.
        </li>
        <li>
          <strong>Analíticas:</strong> miden de forma agregada cómo se usa el sitio para mejorarlo.
        </li>
        <li>
          <strong>Marketing:</strong> permiten mostrarte contenido o anuncios relevantes en otras plataformas.
        </li>
      </ul>

      <h4>3. Cookies que usamos actualmente</h4>
      <div className="cookie-table" role="table" aria-label="Cookies utilizadas">
        <div role="row" className="cookie-table__head">
          <span role="columnheader">Nombre</span>
          <span role="columnheader">Tipo</span>
          <span role="columnheader">Finalidad</span>
          <span role="columnheader">Duración</span>
        </div>
        <div role="row">
          <span role="cell" className="mono">bew_cookie_consent</span>
          <span role="cell">Necesaria (localStorage)</span>
          <span role="cell">Recordar tu elección sobre cookies</span>
          <span role="cell">12 meses</span>
        </div>
      </div>
      <p>
        Hoy <strong>no usamos cookies analíticas ni de marketing</strong>. Si las incorporamos, solo se activarán si
        las autorizas en el panel de preferencias y actualizaremos esta tabla.
      </p>

      <h4>4. Servicios de terceros</h4>
      <ul>
        <li>
          <strong>Google Fonts:</strong> cargamos nuestras tipografías desde servidores de Google, que pueden registrar
          tu dirección IP. Consulta la política de privacidad de Google para más detalles.
        </li>
        <li>
          <strong>Supabase:</strong> cuando envías el formulario de contacto, tus datos se transmiten a nuestro servidor
          conforme a la política de tratamiento de datos. No instala cookies en tu navegador.
        </li>
      </ul>

      <h4>5. Cómo gestionar o retirar tu consentimiento</h4>
      <p>
        Puedes cambiar tu elección cuando quieras desde <em>Preferencias de cookies</em> en el pie de página, o borrar y
        bloquear cookies desde la configuración de tu navegador (Chrome, Safari, Firefox, Edge). Bloquear las
        necesarias puede afectar el funcionamiento del sitio.
      </p>
      <button type="button" className="pill pill--orange cookie-manage" onClick={manage}>
        Cambiar mis preferencias
      </button>

      <h4>6. Base legal</h4>
      <p>
        Tratamos la información conforme a la Ley 1581 de 2012 y el Decreto 1377 de 2013. Las cookies no necesarias
        solo se usan con tu autorización previa, expresa e informada, que puedes revocar en cualquier momento.
      </p>

      <h4>7. Conservación</h4>
      <p>Guardamos tu elección durante 12 meses o hasta que cambie esta política; después te la volveremos a pedir.</p>

      <h4>8. Cambios y contacto</h4>
      <p>
        Podemos actualizar esta política; la versión y fecha vigentes aparecen arriba. Para cualquier duda escríbenos a{" "}
        {email}.
      </p>
    </Dialog>
  );
}
