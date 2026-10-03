/** Validaciones del formulario de contacto. Las mismas reglas se repiten en la Edge Function `contact`. */

export type FieldName = "name" | "company" | "email" | "phone" | "consent";

// Letras (con tildes y ñ), espacios, apóstrofes, puntos y guiones. Mínimo 2 caracteres.
export const NAME_RE = /^\p{L}[\p{L}\p{M}'’. -]{1,119}$/u;
// Letras, números y signos comunes de razón social. Opcional.
export const COMPANY_RE = /^[\p{L}\p{N}][\p{L}\p{N}\p{M}&'’.,()\- ]{0,159}$/u;
// usuario@dominio.tld sin espacios ni caracteres raros.
export const EMAIL_RE = /^[A-Za-z0-9._%+-]+@[A-Za-z0-9-]+(?:\.[A-Za-z0-9-]+)*\.[A-Za-z]{2,}$/;
// Caracteres permitidos al escribir el teléfono.
export const PHONE_CHARS_RE = /^\+?[\d\s()-]*$/;
// Teléfono normalizado: opcional "+" y entre 7 y 15 dígitos.
export const PHONE_RE = /^\+?\d{7,15}$/;

export const normalizePhone = (v: string) => v.replace(/[\s()-]/g, "");

export interface FormValues {
  name: string;
  company: string;
  email: string;
  phone: string;
  consent: boolean;
}

export type FormErrors = Partial<Record<FieldName, string>>;

export function validate(v: FormValues): FormErrors {
  const e: FormErrors = {};
  const name = v.name.trim();
  const company = v.company.trim();
  const email = v.email.trim();
  const phone = v.phone.trim();

  if (!name) e.name = "Cuéntanos tu nombre.";
  else if (!NAME_RE.test(name)) e.name = "Usa solo letras (mínimo 2). Sin números ni símbolos raros.";

  if (company && !COMPANY_RE.test(company)) e.company = "El nombre de la empresa tiene caracteres no permitidos.";

  if (!email) e.email = "Necesitamos tu email para responderte.";
  else if (!EMAIL_RE.test(email)) e.email = "Revisa tu email: debe verse como nombre@dominio.com";

  if (!phone) e.phone = "Déjanos un número para contactarte.";
  else if (!PHONE_CHARS_RE.test(phone)) e.phone = "Solo números, espacios y el signo + al inicio.";
  else if (!PHONE_RE.test(normalizePhone(phone))) e.phone = "El número debe tener entre 7 y 15 dígitos (ej. +57 300 123 4567).";

  if (!v.consent) e.consent = "Debes autorizar el tratamiento de tus datos para poder contactarte.";

  return e;
}
