/**
 * Google Tag Manager + Google Analytics 4 con Consent Mode v2.
 *
 * - Si existe VITE_GTM_ID se carga GTM (recomendado): la etiqueta de GA4 se configura dentro de GTM.
 * - Si solo existe VITE_GA_ID se carga gtag.js con GA4 directamente.
 * - Todo arranca con el consentimiento "denied"; se actualiza según el banner de cookies.
 */
import { CONSENT_EVENT, getConsent, type CookieConsent } from "./cookieConsent";

const GTM_ID = import.meta.env.VITE_GTM_ID as string | undefined;
const GA_ID = import.meta.env.VITE_GA_ID as string | undefined;

type Gtag = (...args: unknown[]) => void;

declare global {
  interface Window {
    dataLayer: unknown[];
    gtag?: Gtag;
  }
}

const enabled = () => Boolean(GTM_ID || GA_ID);

// gtag necesita recibir el objeto `arguments`, no un array
function gtag(..._args: unknown[]) {
  window.dataLayer.push(arguments);
}

const consentState = (c: CookieConsent | null) => ({
  analytics_storage: c?.analytics ? "granted" : "denied",
  ad_storage: c?.marketing ? "granted" : "denied",
  ad_user_data: c?.marketing ? "granted" : "denied",
  ad_personalization: c?.marketing ? "granted" : "denied",
});

function loadScript(src: string) {
  const s = document.createElement("script");
  s.async = true;
  s.src = src;
  document.head.appendChild(s);
}

let started = false;

export function initAnalytics() {
  if (started || !enabled()) return;
  started = true;

  window.dataLayer = window.dataLayer || [];
  window.gtag = gtag;

  // 1) Consentimiento por defecto: todo denegado hasta que el visitante decida
  gtag("consent", "default", {
    ...consentState(null),
    functionality_storage: "granted",
    security_storage: "granted",
    wait_for_update: 500,
  });

  // 2) Si ya había decidido en una visita anterior, aplicamos su elección
  const saved = getConsent();
  if (saved) gtag("consent", "update", consentState(saved));

  // 3) Cambios futuros desde el banner
  window.addEventListener(CONSENT_EVENT, (e) => {
    gtag("consent", "update", consentState((e as CustomEvent<CookieConsent>).detail));
    window.dataLayer.push({ event: "cookie_consent_update" });
  });

  // 4) Carga del contenedor
  if (GTM_ID) {
    window.dataLayer.push({ "gtm.start": Date.now(), event: "gtm.js" });
    loadScript(`https://www.googletagmanager.com/gtm.js?id=${encodeURIComponent(GTM_ID)}`);
  } else if (GA_ID) {
    loadScript(`https://www.googletagmanager.com/gtag/js?id=${encodeURIComponent(GA_ID)}`);
    gtag("js", new Date());
    gtag("config", GA_ID);
  }
}

/**
 * Envía un evento personalizado. Con GTM llega al dataLayer (crea un activador "Evento personalizado"
 * con el mismo nombre); sin GTM se envía directo a GA4.
 */
export function trackEvent(name: string, params: Record<string, unknown> = {}) {
  if (!enabled() || !started) return;
  if (GTM_ID) window.dataLayer.push({ event: name, ...params });
  else gtag("event", name, params);
}
