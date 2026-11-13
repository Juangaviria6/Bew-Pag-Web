import { useEffect } from "react";
import Lenis from "lenis";
import { getPage, goToPage } from "../navigation/pageRouter";
import { pageForAnchor } from "../navigation/pages";

let lenis: Lenis | null = null;

/** Salta (sin animación) a una posición vertical de la página actual. */
export function jumpTo(y: number) {
  if (lenis) lenis.scrollTo(y, { immediate: true, force: true });
  window.scrollTo(0, y);
}

function scrollToElement(hash: string, immediate: boolean) {
  const target = hash === "#top" ? 0 : document.querySelector<HTMLElement>(hash);
  if (target === null) return;
  if (immediate) {
    jumpTo(target === 0 ? 0 : target.getBoundingClientRect().top + window.scrollY);
  } else if (lenis) {
    lenis.scrollTo(target, { offset: 0, duration: 1.4 });
  } else if (target === 0) {
    window.scrollTo({ top: 0, behavior: "smooth" });
  } else {
    target.scrollIntoView({ behavior: "smooth" });
  }
}

/** Baja a un ancla ya renderizada de la página actual. */
export const scrollToAnchorNow = (hash: string) => scrollToElement(hash, true);

/**
 * Lleva a un ancla ("#id"). Si vive en otra página, cambia de página con
 * transición; "#top" sube al inicio de la página actual.
 */
export function scrollToHash(hash: string) {
  const page = hash === "#top" ? undefined : pageForAnchor(hash);
  if (page && page !== getPage()) {
    goToPage(page, hash);
    return;
  }
  scrollToElement(hash, false);
}

export function setScrollLocked(locked: boolean) {
  if (lenis) {
    if (locked) lenis.stop();
    else lenis.start();
  }
  document.documentElement.style.overflow = locked ? "hidden" : "";
}

export function useSmoothScroll(enabled: boolean) {
  useEffect(() => {
    if (!enabled) return;
    lenis = new Lenis({ lerp: 0.1, smoothWheel: true });
    let frame = 0;
    const raf = (time: number) => {
      lenis?.raf(time);
      frame = requestAnimationFrame(raf);
    };
    frame = requestAnimationFrame(raf);
    return () => {
      cancelAnimationFrame(frame);
      lenis?.destroy();
      lenis = null;
    };
  }, [enabled]);
}
