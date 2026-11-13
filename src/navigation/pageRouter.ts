import { useSyncExternalStore } from "react";
import { pageFromLocation, type PageId } from "./pages";

/** Estado mínimo de "página actual" + puerta de entrada para navegar con transición. */

type Navigator = (id: PageId, anchor?: string, direction?: 1 | -1) => void;

let current: PageId = pageFromLocation();
let navigator: Navigator | null = null;
const listeners = new Set<() => void>();

export const getPage = () => current;

export function setPage(id: PageId) {
  current = id;
  listeners.forEach((l) => l());
}

const subscribe = (fn: () => void) => {
  listeners.add(fn);
  return () => listeners.delete(fn);
};

export const useCurrentPage = () => useSyncExternalStore(subscribe, getPage, getPage);

export function registerNavigator(fn: Navigator | null) {
  navigator = fn;
}

/** Cambia de página con transición (y opcionalmente baja a un ancla dentro de ella). */
export function goToPage(id: PageId, anchor?: string, direction?: 1 | -1) {
  navigator?.(id, anchor, direction);
}
