import type {
  CodeLine,
  Feature,
  NavLink,
  ProcessStep,
  Plan,
  Project,
  Service,
} from "../types";

const post = (n: number) => `/brand/posts/post-${String(n).padStart(2, "0")}.webp`;
const logo = (n: number) => `/brand/logos/logo-${String(n).padStart(2, "0")}.webp`;

export const brand = {
  name: "bew",
  tagline: "Websites & Landing Pages",
  claim: "Ideas que se convierten en webs",
  slogan: "Diseñamos. Desarrollamos. Hacemos que pase.",
  email: "bew.oficiall@gmail.com",
};

export const navLinks: NavLink[] = [
  { label: "Servicios", href: "#servicios" },
  { label: "Proyectos", href: "#proyectos" },
  { label: "Proceso", href: "#proceso" },
  { label: "Planes", href: "#planes" },
  { label: "Web + IA", href: "#ia" },
  { label: "Contacto", href: "#contacto" },
];

export const marqueeWords = [
  "Diseño",
  "Desarrollo",
  "Landing Pages",
  "SEO",
  "Tu idea, en línea",
  "Build the next",
];

export const services: Service[] = [
  {
    id: "diseno",
    number: "01",
    title: "Diseño web",
    subtitle: "Un buen diseño habla",
    image: post(2),
  },
  {
    id: "desarrollo",
    number: "02",
    title: "Desarrollo",
    subtitle: "Código que lo hace funcionar",
    image: post(3),
  },
  {
    id: "landing",
    number: "03",
    title: "Landing Pages",
    subtitle: "Páginas que convierten",
    image: post(8),
  },
  {
    id: "seo",
    number: "04",
    title: "SEO",
    subtitle: "Que te encuentren primero",
    image: post(5),
  },
  {
    id: "marca",
    number: "05",
    title: "Presencia digital",
    subtitle: "Tu marca, en buenas manos",
    image: post(7),
  },
];

export const projects: Project[] = [
  { src: post(1), alt: "Tu idea también puede ser una web", code: "# 01", title: "Tu idea también puede ser una web._", tag: "Campaña" },
  { src: post(2), alt: "Código más diseño igual resultados", code: "# 02", title: "Código + Diseño = Resultados_", tag: "Branding" },
  { src: post(3), alt: "Un buen diseño habla", code: "# 03", title: "Un buen diseño habla.", tag: "Pro tip" },
  { src: post(4), alt: "Landing page para tu proyecto", code: "# 04", title: "Desde la idea hasta el clic.", tag: "Landing" },
  { src: post(5), alt: "Ideas que se convierten en sitios web", code: "# 05", title: "Ideas que se convierten en sitios web.", tag: "Mobile" },
  { src: post(6), alt: "Pequeños cambios, grandes resultados", code: "# 06", title: "Pequeños cambios, grandes resultados.", tag: "UI" },
  { src: post(7), alt: "Tu marca también necesita un buen sitio web", code: "# 07", title: "Tu marca también necesita un buen sitio web.", tag: "Web" },
  { src: post(8), alt: "Landing pages que convierten", code: "# 08", title: "Landing pages que convierten_", tag: "Conversión" },
  { src: post(9), alt: "Tu idea más nuestro código igual tu web", code: "# 09", title: "Tu idea + Nuestro código = Tu web", tag: "Código" },
];


export const features: Feature[] = [
  {
    title: "Diseño minimalista",
    description:
      "Interfaces limpias donde cada elemento tiene un propósito. Menos ruido, más claridad para que tu mensaje llegue directo.",
  },
  {
    title: "Carga ultrarrápida",
    description:
      "Código optimizado, imágenes ligeras y buenas prácticas de rendimiento. Cada segundo cuenta cuando alguien decide quedarse.",
  },
  {
    title: "100% responsive",
    description:
      "Se ve y funciona perfecto en móvil, tablet y escritorio. Tu web se adapta a tu audiencia, no al revés.",
  },
  {
    title: "Enfoque en resultados",
    description:
      "Estructura, textos y llamados a la acción pensados para convertir visitas en clientes.",
  },
];

export const processSteps: ProcessStep[] = [
  { number: "01", title: "Idea", description: "Escuchamos tu proyecto, tus objetivos y a tu audiencia." },
  { number: "02", title: "Diseño", description: "Creamos experiencias digitales que conectan con tu audiencia." },
  { number: "03", title: "Código", description: "Desarrollamos una web rápida, sólida y 100% responsive." },
  { number: "04", title: "Clic", description: "Lanzamos, medimos y mejoramos. Pequeños cambios, grandes resultados." },
];

export const projectTypes = ["Landing page", "Sitio web", "Web + IA", "Rediseño", "SEO", "Otro"];

/** Código que se "escribe" en la sección Pro tip. */
export const heroCode: CodeLine[] = [
  [{ text: "<", kind: "punct" }, { text: "section", kind: "tag" }, { text: " class", kind: "attr" }, { text: "=", kind: "punct" }, { text: '"hero"', kind: "value" }, { text: ">", kind: "punct" }],
  [{ text: "  <", kind: "punct" }, { text: "div", kind: "tag" }, { text: " class", kind: "attr" }, { text: "=", kind: "punct" }, { text: '"container"', kind: "value" }, { text: ">", kind: "punct" }],
  [{ text: "    <", kind: "punct" }, { text: "h1", kind: "tag" }, { text: ">", kind: "punct" }, { text: "Grandes ideas", kind: "text" }, { text: "</", kind: "punct" }, { text: "h1", kind: "tag" }, { text: ">", kind: "punct" }],
  [{ text: "    <", kind: "punct" }, { text: "p", kind: "tag" }, { text: ">", kind: "punct" }, { text: "en grandes webs", kind: "text" }, { text: "</", kind: "punct" }, { text: "p", kind: "tag" }, { text: ">", kind: "punct" }],
  [{ text: "    <", kind: "punct" }, { text: "a", kind: "tag" }, { text: " class", kind: "attr" }, { text: "=", kind: "punct" }, { text: '"btn"', kind: "value" }, { text: ">", kind: "punct" }, { text: "Hablemos →", kind: "text" }, { text: "</", kind: "punct" }, { text: "a", kind: "tag" }, { text: ">", kind: "punct" }],
  [{ text: "  </", kind: "punct" }, { text: "div", kind: "tag" }, { text: ">", kind: "punct" }],
  [{ text: "</", kind: "punct" }, { text: "section", kind: "tag" }, { text: ">", kind: "punct" }],
];

/**
 * Datos del Responsable del Tratamiento (Ley 1581 de 2012, Decreto 1377 de 2013).
 * Aún no hay razón social: cuando exista, agregar `nit` y `address` y se mostrarán en la política.
 */
export const legal: {
  policyVersion: string;
  controller: string;
  nit?: string;
  address?: string;
  email: string;
  updatedAt: string;
} = {
  policyVersion: "1.0",
  controller: "bew",
  email: brand.email,
  updatedAt: "30 de septiembre de 2026",
};

export const plans: Plan[] = [
  {
    id: "start",
    name: "Web Start",
    tagline: "Para arrancar con buen pie",
    audience: "Ideal para emprendedores y marcas que quieren una presencia digital profesional.",
    price: "A cotizar",
    priceNote: "Precio según alcance",
    projectType: "Landing page",
    features: [
      "Una página one page: inicio, servicios y contacto",
      "Diseño 100% responsive",
      "Formulario de contacto y botón de WhatsApp",
      "SEO básico y analítica configurada",
      "Certificado SSL y despliegue incluido",
      "2 rondas de revisiones",
    ],
  },
  {
    id: "grow",
    name: "Web Grow",
    tagline: "Para crecer y vender online",
    audience: "Pensado para negocios en crecimiento que necesitan destacar y convertir visitas en clientes.",
    price: "A cotizar",
    priceNote: "Precio según alcance",
    projectType: "Sitio web",
    featured: true,
    features: [
      "Todo lo de Web Start",
      "Hasta 5 páginas independientes",
      "Pasarela de pagos en línea",
      "Blog para contenido SEO",
      "Integración con Google Maps",
      "Portafolio y módulo de testimonios",
      "Optimización de velocidad",
    ],
  },
  {
    id: "scale",
    name: "Web Scale",
    tagline: "Para escalar sin límites",
    audience: "Diseñado para empresas que buscan una web a medida, con automatizaciones y proyección.",
    price: "A cotizar",
    priceNote: "Precio según alcance",
    projectType: "Sitio web",
    features: [
      "Todo lo de Web Grow",
      "Hasta 8 páginas y diseño 100% personalizado",
      "SEO completo, on-page y técnico",
      "Automatización de formularios",
      "Reservas o citas en línea",
      "Tienda online (si la necesitas)",
      "Copias de seguridad y capacitación al equipo",
    ],
  },
];

export const extraServices: Service[] = [
  {
    id: "logo",
    number: "01",
    title: "Diseño de logo",
    subtitle: "Identidad visual coherente para tu marca",
    image: logo(3),
  },
  {
    id: "copy",
    number: "02",
    title: "Textos y SEO",
    subtitle: "Contenido pensado para Google y para personas",
    image: post(5),
  },
  {
    id: "hosting",
    number: "03",
    title: "Hosting",
    subtitle: "Rápido, seguro y con soporte técnico",
    image: post(3),
  },
  {
    id: "social",
    number: "04",
    title: "Redes sociales",
    subtitle: "Perfiles y contenido visual alineados con tu web",
    image: post(7),
  },
];
