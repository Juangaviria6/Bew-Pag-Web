import { useCallback, useEffect, useRef, useState, type ReactNode } from "react";
import { flushSync } from "react-dom";
import { jumpTo, scrollToAnchorNow } from "../hooks/useSmoothScroll";
import { getPage, registerNavigator, setPage, useCurrentPage } from "./pageRouter";
import { PAGES, hrefFor, pageFromLocation, pageIndex, type PageId } from "./pages";
import { PageTransition, type PageTransitionHandle } from "./PageTransition";
import "./navigation.css";

interface PagedSiteProps {
  /** Contenido de cada página (se monta solo la activa). */
  render: (id: PageId) => ReactNode;
  /** Pie común, se muestra al final de cada página. */
  footer: ReactNode;
}

const WHEEL_THRESHOLD = 160; // píxeles de rueda "extra" al llegar al borde
const COOLDOWN = 800; // ms mínimos entre cambios de página
const SWIPE_MIN = 80; // px de deslizamiento vertical en celular

const nextFrame = () => new Promise<void>((r) => requestAnimationFrame(() => requestAnimationFrame(() => r())));

const atTop = () => window.scrollY <= 1;
const atBottom = () => window.scrollY + window.innerHeight >= document.documentElement.scrollHeight - 2;

/**
 * Sitio por páginas: una a la vez, con ruta (#/servicios), transición de barras y
 * avance desde el borde de cada página (rueda, teclado, deslizar) además del menú.
 */
export function PagedSite({ render, footer }: PagedSiteProps) {
  const page = useCurrentPage();
  const transition = useRef<PageTransitionHandle>(null);
  const pageRef = useRef<HTMLDivElement>(null);
  const busy = useRef(false);
  const lastNav = useRef(0);
  const pending = useRef<{ id: PageId; anchor?: string; push: boolean } | null>(null);
  const [announce, setAnnounce] = useState("");

  const index = pageIndex(page);
  const label = PAGES[index].label;

  const focusTitle = useCallback(() => {
    const title = pageRef.current?.querySelector<HTMLElement>("h1, h2");
    if (!title) return;
    title.tabIndex = -1;
    title.focus({ preventScroll: true });
  }, []);

  const run = useCallback(async (id: PageId, anchor: string | undefined, push: boolean, direction: 1 | -1) => {
    if (busy.current) {
      pending.current = { id, anchor, push };
      return;
    }
    if (id === getPage()) {
      if (anchor) scrollToAnchorNow(anchor);
      return;
    }
    busy.current = true;
    await transition.current?.cover(direction);

    if (push) window.history.pushState(null, "", hrefFor(id));
    flushSync(() => setPage(id));
    jumpTo(0);
    await nextFrame();
    if (anchor) scrollToAnchorNow(anchor);
    focusTitle();
    setAnnounce(PAGES[pageIndex(id)].label);
    document.title = id === "inicio" ? "bew_ · Websites & Landing Pages" : `${PAGES[pageIndex(id)].label} · bew_`;

    await transition.current?.reveal(direction);
    lastNav.current = performance.now();
    busy.current = false;

    const next = pending.current;
    pending.current = null;
    if (next && next.id !== getPage()) void run(next.id, next.anchor, next.push, direction);
  }, [focusTitle]);

  // Navegación programática (menú, botones, anclas entre páginas).
  useEffect(() => {
    registerNavigator((id, anchor, direction) => {
      const dir = direction ?? (pageIndex(id) >= pageIndex(getPage()) ? 1 : -1);
      void run(id, anchor, true, dir);
    });
    return () => registerNavigator(null);
  }, [run]);

  // Botón "atrás" / "adelante" y enlaces directos con hash.
  useEffect(() => {
    const onPop = () => {
      const id = pageFromLocation();
      if (id === getPage()) return;
      void run(id, undefined, false, pageIndex(id) >= pageIndex(getPage()) ? 1 : -1);
    };
    window.addEventListener("popstate", onPop);
    return () => window.removeEventListener("popstate", onPop);
  }, [run]);

  // Avance desde el borde: rueda, teclado y deslizamiento.
  useEffect(() => {
    const blocked = () =>
      busy.current ||
      document.documentElement.style.overflow === "hidden" ||
      performance.now() - lastNav.current < COOLDOWN;

    const step = (dir: 1 | -1) => {
      const target = PAGES[pageIndex(getPage()) + dir];
      if (target) void run(target.id, undefined, true, dir);
    };

    // Rueda: solo cuenta un gesto que *empieza* ya en el borde, para no saltar por la inercia.
    let acc = 0;
    let armed = false;
    let lastWheel = 0;
    let lastDir = 0;
    const onWheel = (e: WheelEvent) => {
      if (e.ctrlKey || blocked() || e.deltaY === 0) return;
      const dir = Math.sign(e.deltaY);
      const now = performance.now();
      if (now - lastWheel > 140 || dir !== lastDir) {
        armed = dir > 0 ? atBottom() : atTop();
        if (now - lastWheel > 700 || dir !== lastDir) acc = 0;
      }
      lastWheel = now;
      lastDir = dir;
      if (!armed) return;
      acc += Math.abs(e.deltaY);
      if (acc >= WHEEL_THRESHOLD) {
        acc = 0;
        armed = false;
        step(dir as 1 | -1);
      }
    };

    const onKey = (e: KeyboardEvent) => {
      if (e.defaultPrevented || e.repeat || e.altKey || e.ctrlKey || e.metaKey || blocked()) return;
      const t = e.target as HTMLElement | null;
      if (t?.closest("input, textarea, select, [contenteditable='true'], [role='dialog']")) return;
      const onControl = !!t?.closest("button, a, summary, [role='button']");
      switch (e.key) {
        case "ArrowRight":
          e.preventDefault();
          step(1);
          break;
        case "ArrowLeft":
          e.preventDefault();
          step(-1);
          break;
        case "ArrowDown":
        case "PageDown":
        case " ":
          if (e.key === " " && onControl && !e.shiftKey) return;
          if (e.shiftKey && e.key === " ") {
            if (atTop()) step(-1);
          } else if (atBottom()) {
            e.preventDefault();
            step(1);
          }
          break;
        case "ArrowUp":
        case "PageUp":
          if (atTop()) {
            e.preventDefault();
            step(-1);
          }
          break;
      }
    };

    let startY = 0;
    let startX = 0;
    let startTop = false;
    let startBottom = false;
    const onTouchStart = (e: TouchEvent) => {
      startY = e.touches[0].clientY;
      startX = e.touches[0].clientX;
      startTop = atTop();
      startBottom = atBottom();
    };
    const onTouchEnd = (e: TouchEvent) => {
      if (blocked()) return;
      const dy = startY - e.changedTouches[0].clientY;
      const dx = startX - e.changedTouches[0].clientX;
      if (Math.abs(dy) < SWIPE_MIN || Math.abs(dx) > Math.abs(dy)) return;
      if (dy > 0 && startBottom && atBottom()) step(1);
      else if (dy < 0 && startTop && atTop()) step(-1);
    };

    window.addEventListener("wheel", onWheel, { passive: true });
    window.addEventListener("keydown", onKey);
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("keydown", onKey);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
    };
  }, [run]);

  // Enlace directo a un ancla/hash al cargar (#/servicios): título correcto.
  useEffect(() => {
    document.title = page === "inicio" ? "bew_ · Websites & Landing Pages" : `${label} · bew_`;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const next = PAGES[index + 1];
  const go = (id: PageId) => (e: React.MouseEvent) => {
    e.preventDefault();
    void run(id, undefined, true, pageIndex(id) >= index ? 1 : -1);
  };

  return (
    <>
      <PageTransition ref={transition} />

      <nav className="pager" aria-label="Páginas">
        <ol className="pager__dots">
          {PAGES.map((p) => (
            <li key={p.id}>
              <a
                href={hrefFor(p.id)}
                onClick={go(p.id)}
                className="pager__dot"
                aria-label={p.label}
                aria-current={p.id === page ? "page" : undefined}
                data-label={p.label}
              />
            </li>
          ))}
        </ol>
        <p className="pager__count mono" aria-hidden="true">
          <span>{String(index + 1).padStart(2, "0")}</span>
          <i />
          <span>{String(PAGES.length).padStart(2, "0")}</span>
        </p>
      </nav>

      <div className="sr-only" role="status" aria-live="polite">
        {announce && `Página ${announce}`}
      </div>

      <div key={page} className="page" data-page={page}>
        <main ref={pageRef} id="main">
          {render(page)}
          {next && (
            <a href={hrefFor(next.id)} onClick={go(next.id)} className="page-next">
              <span className="eyebrow">Siguiente</span>
              <span className="page-next__title">
                {next.label} <span aria-hidden="true">→</span>
              </span>
            </a>
          )}
        </main>
        {footer}
      </div>
    </>
  );
}
