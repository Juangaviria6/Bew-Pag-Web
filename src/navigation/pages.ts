/** Páginas del sitio. El orden define el avance (01 / 07) y el menú. */
export const PAGES = [
  { id: "inicio", label: "Inicio" },
  { id: "servicios", label: "Servicios" },
  { id: "proyectos", label: "Proyectos" },
  { id: "proceso", label: "Proceso" },
  { id: "planes", label: "Planes" },
  { id: "ia", label: "Web + IA" },
  { id: "contacto", label: "Contacto" },
] as const;

export type PageId = (typeof PAGES)[number]["id"];

/** Ancla (id de sección) → página donde vive. */
const ANCHOR_PAGE: Record<string, PageId> = {
  top: "inicio",
  ecuacion: "inicio",
  servicios: "servicios",
  proyectos: "proyectos",
  proceso: "proceso",
  planes: "planes",
  extras: "planes",
  ia: "ia",
  contacto: "contacto",
};

const strip = (hash: string) => hash.replace(/^#\/?/, "");

export const pageForAnchor = (hash: string): PageId | undefined => ANCHOR_PAGE[strip(hash)];

export const hrefFor = (id: PageId) => `#/${id}`;

export const pageFromLocation = (): PageId => {
  const id = strip(window.location.hash).split("/")[0];
  return PAGES.find((p) => p.id === id)?.id ?? "inicio";
};

export const pageIndex = (id: PageId) => PAGES.findIndex((p) => p.id === id);
