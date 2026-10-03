/**
 * Consentimiento de cookies. Se guarda solo en el navegador del visitante (localStorage).
 * Cualquier script analítico o de marketing que se agregue en el futuro debe cargarse
 * únicamente si `getConsent()?.analytics` / `getConsent()?.marketing` es `true`,
 * y escuchar el evento `CONSENT_EVENT` para reaccionar a cambios.
 */

export const COOKIE_POLICY_VERSION = "1.1";
const STORAGE_KEY = "bew_cookie_consent";
/** Meses tras los cuales se vuelve a pedir el consentimiento. */
const CONSENT_TTL_MONTHS = 12;

export const CONSENT_EVENT = "bew:cookie-consent";
export const OPEN_SETTINGS_EVENT = "bew:cookie-settings";

export interface CookieConsent {
  necessary: true;
  analytics: boolean;
  marketing: boolean;
  version: string;
  date: string;
}

export function getConsent(): CookieConsent | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const c = JSON.parse(raw) as CookieConsent;
    const expires = new Date(c.date);
    expires.setMonth(expires.getMonth() + CONSENT_TTL_MONTHS);
    if (c.version !== COOKIE_POLICY_VERSION || expires < new Date()) return null;
    return c;
  } catch {
    return null;
  }
}

export function saveConsent(choice: { analytics: boolean; marketing: boolean }): CookieConsent {
  const consent: CookieConsent = {
    necessary: true,
    ...choice,
    version: COOKIE_POLICY_VERSION,
    date: new Date().toISOString(),
  };
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(consent));
  } catch {
    /* almacenamiento bloqueado: el banner volverá a aparecer en la próxima visita */
  }
  window.dispatchEvent(new CustomEvent(CONSENT_EVENT, { detail: consent }));
  return consent;
}

/** Abre el panel de preferencias (por ejemplo desde el footer). */
export const openCookieSettings = () => window.dispatchEvent(new Event(OPEN_SETTINGS_EVENT));
