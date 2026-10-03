import { useEffect, useRef, useState } from "react";
import { AnimatePresence, motion, useMotionValue } from "motion/react";
import "./Cursor.css";

type Theme = "bew" | "nexa";

/**
 * Flecha pixel art basada en el cursor clásico (logo 09).
 * "o" = contorno, "f" = relleno. La cola baja 1 px cada 2 filas,
 * con la misma inclinación de principio a fin.
 */
const ARROW = [
  "o",
  "oo",
  "ofo",
  "offo",
  "offfo",
  "offffo",
  "offfffo",
  "offffffo",
  "offfffffo",
  "offffffffo",
  "offfffffffo",
  "offffffooooo",
  "offfoffo",
  "offooffo",
  "ofo..offo",
  "oo...offo",
  "o.....offo",
  "......offo",
  ".......oo",
];

const PX = 2;
const ARROW_W = 12 * PX;
const ARROW_H = ARROW.length * PX;

function PixelArrow({ theme }: { theme: Theme }) {
  const rects: React.ReactElement[] = [];
  ARROW.forEach((row, y) =>
    [...row].forEach((c, x) => {
      if (c === "o" || c === "f") {
        rects.push(
          <rect key={`${x}-${y}`} x={x * PX} y={y * PX} width={PX} height={PX} className={c === "o" ? "px-o" : "px-f"} />,
        );
      }
    }),
  );
  return (
    <svg
      className={`cursor__arrow cursor__arrow--${theme}`}
      width={ARROW_W}
      height={ARROW_H}
      viewBox={`0 0 ${ARROW_W} ${ARROW_H}`}
      shapeRendering="crispEdges"
    >
      {theme === "nexa" && (
        <defs>
          <linearGradient id="cursor-nexa-grad" x1="0" y1="0" x2={ARROW_W} y2={ARROW_H} gradientUnits="userSpaceOnUse">
            <stop stopColor="#62e2f7" />
            <stop offset="0.5" stopColor="#5a86f5" />
            <stop offset="1" stopColor="#8a55ef" />
          </linearGradient>
        </defs>
      )}
      {rects}
    </svg>
  );
}

/** Los tres "rayos" de clic del logo 09. */
function Rays({ burst }: { burst: number }) {
  return (
    <motion.svg
      key={burst}
      className="cursor__rays"
      width="18"
      height="18"
      viewBox="0 0 18 18"
      initial={{ opacity: 0, scale: 0.4 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.6 }}
      transition={{ type: "spring", stiffness: 500, damping: 18 }}
    >
      <rect x="3" y="0" width="2" height="6" />
      <rect x="7.5" y="5.5" width="6" height="2" transform="rotate(-45 10.5 6.5)" />
      <rect x="11" y="12" width="7" height="2" />
    </motion.svg>
  );
}

/**
 * Cursor personalizado.
 * - `data-cursor="Texto"` muestra una etiqueta junto a la flecha.
 * - `data-cursor-theme="nexa"` cambia la flecha a los colores de Nexa AI.
 */
export function Cursor() {
  const x = useMotionValue(-100);
  const y = useMotionValue(-100);
  const last = useRef({ x: -100, y: -100 });
  const [label, setLabel] = useState<string | null>(null);
  const [hovering, setHovering] = useState(false);
  const [pressed, setPressed] = useState(false);
  const [burst, setBurst] = useState(0);
  const [visible, setVisible] = useState(false);
  const [theme, setTheme] = useState<Theme>("bew");

  useEffect(() => {
    document.documentElement.classList.add("has-custom-cursor");

    // Lee lo que hay bajo la punta de la flecha (también al hacer scroll sin mover el mouse)
    const inspect = () => {
      const el = document.elementFromPoint(last.current.x, last.current.y) as HTMLElement | null;
      if (!el) return;
      const labelled = el.closest<HTMLElement>("[data-cursor]");
      setLabel(labelled?.dataset.cursor || null);
      setHovering(Boolean(labelled || el.closest("a, button, input, textarea, label, [role='button']")));
      // El ancestro con tema más cercano manda (el degradado final de Nexa vuelve a "bew")
      const themed = el.closest<HTMLElement>("[data-cursor-theme]");
      setTheme(themed?.dataset.cursorTheme === "nexa" ? "nexa" : "bew");
    };

    const move = (e: PointerEvent) => {
      last.current = { x: e.clientX, y: e.clientY };
      x.set(e.clientX);
      y.set(e.clientY);
      setVisible(true);
      inspect();
    };
    const down = () => {
      setPressed(true);
      setBurst((b) => b + 1);
    };
    const up = () => setPressed(false);
    const leave = () => setVisible(false);

    window.addEventListener("pointermove", move);
    window.addEventListener("scroll", inspect, { passive: true });
    window.addEventListener("pointerdown", down);
    window.addEventListener("pointerup", up);
    document.documentElement.addEventListener("pointerleave", leave);
    return () => {
      document.documentElement.classList.remove("has-custom-cursor");
      window.removeEventListener("pointermove", move);
      window.removeEventListener("scroll", inspect);
      window.removeEventListener("pointerdown", down);
      window.removeEventListener("pointerup", up);
      document.documentElement.removeEventListener("pointerleave", leave);
    };
  }, [x, y]);

  return (
    <motion.div
      className={`cursor cursor--${theme}`}
      aria-hidden="true"
      style={{ x, y, opacity: visible ? 1 : 0 }}
    >
      <motion.div
        className="cursor__body"
        animate={{ scale: pressed ? 0.85 : hovering ? 1.15 : 1, rotate: hovering ? -6 : 0 }}
        transition={{ type: "spring", stiffness: 500, damping: 22 }}
      >
        {/* Ambas versiones superpuestas: se cruzan con un fundido al cambiar de tema */}
        <span className="cursor__layer" style={{ opacity: theme === "bew" ? 1 : 0 }}>
          <PixelArrow theme="bew" />
        </span>
        <span className="cursor__layer cursor__layer--top" style={{ opacity: theme === "nexa" ? 1 : 0 }}>
          <PixelArrow theme="nexa" />
        </span>
        <AnimatePresence>{(hovering || pressed) && <Rays burst={burst} />}</AnimatePresence>
      </motion.div>

      <AnimatePresence>
        {label && (
          <motion.span
            key={label}
            className="cursor__label"
            initial={{ opacity: 0, scale: 0.6, x: -6 }}
            animate={{ opacity: 1, scale: 1, x: 0 }}
            exit={{ opacity: 0, scale: 0.6 }}
            transition={{ type: "spring", stiffness: 420, damping: 24 }}
          >
            {label}
          </motion.span>
        )}
      </AnimatePresence>
    </motion.div>
  );
}
