import { useEffect } from "react";
import { legal } from "../../data/content";

interface PrivacyModalProps {
  onClose: () => void;
}

/** Aviso de privacidad y política de tratamiento de datos personales (Colombia). */
export function PrivacyModal({ onClose }: PrivacyModalProps) {
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
      <div
        className="privacy__dialog"
        role="dialog"
        aria-modal="true"
        aria-labelledby="privacy-title"
        onClick={(e) => e.stopPropagation()}
      >
        <button type="button" className="privacy__close" onClick={onClose} aria-label="Cerrar">
          ✕
        </button>
        <h3 id="privacy-title">Política de tratamiento de datos personales</h3>
        <p className="privacy__meta mono">
          Versión {legal.policyVersion} · Actualizada el {legal.updatedAt}
        </p>

        <h4>1. Responsable del tratamiento</h4>
        <p>
          <strong>{legal.controller}</strong>
          {legal.nit ? ` (${legal.nit})` : ""}
          {legal.address ? `, con domicilio en ${legal.address}` : ""}. Correo para consultas y reclamos:{" "}
          <a href={`mailto:${legal.email}`}>{legal.email}</a>.
        </p>

        <h4>2. Datos que recolectamos</h4>
        <p>
          Nombre, empresa, correo electrónico, número de contacto, tipo de proyecto y la descripción de tu idea.
          No solicitamos datos sensibles ni de menores de edad.
        </p>

        <h4>3. Finalidades</h4>
        <ul>
          <li>Responder tu solicitud de contacto y elaborar una propuesta o cotización.</li>
          <li>Comunicarnos contigo por correo, teléfono o mensajería sobre tu proyecto.</li>
          <li>Llevar un registro interno de solicitudes y de tu autorización.</li>
        </ul>

        <h4>4. Derechos del titular</h4>
        <p>De acuerdo con el artículo 8 de la Ley 1581 de 2012, puedes:</p>
        <ul>
          <li>Conocer, actualizar y rectificar tus datos personales.</li>
          <li>Solicitar prueba de la autorización otorgada.</li>
          <li>Ser informado sobre el uso que se ha dado a tus datos.</li>
          <li>Presentar quejas ante la Superintendencia de Industria y Comercio (SIC).</li>
          <li>Revocar la autorización y/o solicitar la supresión de tus datos.</li>
          <li>Acceder de forma gratuita a tus datos personales.</li>
        </ul>

        <h4>5. Cómo ejercer tus derechos</h4>
        <p>
          Escríbenos a <a href={`mailto:${legal.email}`}>{legal.email}</a> indicando tu nombre, el correo con el
          que te contactaste y tu solicitud. Atenderemos consultas en máximo 10 días hábiles y reclamos en máximo
          15 días hábiles.
        </p>

        <h4>6. Seguridad y conservación</h4>
        <p>
          Almacenamos tus datos en infraestructura con controles de acceso y cifrado. Los conservaremos mientras
          sea necesario para las finalidades descritas o hasta que solicites su supresión.
        </p>

        <h4>7. Carácter facultativo</h4>
        <p>
          Responder a las preguntas del formulario es voluntario, pero necesitamos tu autorización para poder
          contactarte. Marcar la casilla constituye tu autorización previa, expresa e informada.
        </p>
      </div>
    </div>
  );
}
