import type { Level } from "./levels";

/**
 * Motor del juego (canvas 2D). Pensado para temblor:
 * - selección por permanencia (no hace falta "hacer clic" ni pellizcar),
 * - el progreso baja despacio si la mano sale un instante (no se pierde de golpe),
 * - suavizado del puntero configurable,
 * - objetivos grandes, sin tiempo límite.
 */

export interface Settings {
  /** Tiempo para "seleccionar" quedándose quieto, en ms. */
  dwell: number;
  /** Tamaño de los objetivos (1 = normal). */
  size: number;
  /** Suavizado del puntero 0..1 (más alto = más estable, más lento). */
  smooth: number;
  /** Velocidad del nivel "seguir" (1 = normal). */
  speed: number;
}

export interface Pointer {
  x: number;
  y: number;
  visible: boolean;
  /** Apertura de la mano 0..1 (solo con cámara). */
  open?: number;
}

export interface GameCallbacks {
  onCount: (count: number) => void;
  onHit: () => void;
  onDone: (seconds: number) => void;
  onCue: (text: string) => void;
}

export interface Game {
  setPointer: (p: Pointer) => void;
  start: (level: Level, touch: boolean) => void;
  pause: (paused: boolean) => void;
  resize: () => void;
  dispose: () => void;
}

const BRIGHT = "#a32150";
const DEEP = "#4a0a1b";
const ROSE = "#f6c1ce";
const CREAM = "#fcf1f3";

export function createGame(canvas: HTMLCanvasElement, settings: Settings, cb: GameCallbacks): Game {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio, 2);
  let w = 1;
  let h = 1;
  let frame = 0;
  let paused = false;

  const ptr = { x: 0.5, y: 0.5, visible: false, open: 0.5 };
  const sm = { x: 0.5, y: 0.5 };
  let level: Level | null = null;
  let touch = false;
  let count = 0;
  let startedAt = 0;
  let done = false;
  let progress = 0;
  let celebrate = 0;

  // Estado por nivel
  const target = { x: 0.5, y: 0.5 };
  const item = { x: 0.3, y: 0.5, held: false };
  const basket = { x: 0.75, y: 0.62 };
  let pathT = 0;
  let inside = 0;
  let wantOpen = true;
  let side: "izq" | "der" = "izq";
  let lastSecond = 0;

  const resize = () => {
    w = canvas.clientWidth || 1;
    h = canvas.clientHeight || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const unit = () => Math.min(w, h);
  const radius = () => unit() * 0.11 * settings.size;
  const px = () => sm.x * w;
  const py = () => sm.y * h;
  const dist = (ax: number, ay: number) => Math.hypot(px() - ax, py() - ay);

  const newTarget = () => {
    const m = 0.18;
    let nx = 0.5;
    let ny = 0.5;
    // Lejos del anterior, para que haya movimiento amplio.
    for (let i = 0; i < 12; i++) {
      nx = m + Math.random() * (1 - 2 * m);
      ny = m + 0.05 + Math.random() * (1 - 2 * m - 0.05);
      if (Math.hypot((nx - target.x) * w, (ny - target.y) * h) > unit() * 0.35) break;
    }
    target.x = nx;
    target.y = ny;
  };

  const resetItem = () => {
    item.held = false;
    item.x = 0.2 + Math.random() * 0.15;
    item.y = 0.3 + Math.random() * 0.35;
    basket.x = 0.72 + Math.random() * 0.1;
    basket.y = 0.35 + Math.random() * 0.35;
  };

  const hit = () => {
    count += 1;
    celebrate = 1;
    cb.onCount(count);
    if (level && count >= level.goal) finish();
    else cb.onHit();
  };

  const finish = () => {
    done = true;
    cb.onDone((performance.now() - startedAt) / 1000);
  };

  /** Avanza la permanencia: sube adentro, baja despacio afuera. Devuelve true al completarse. */
  const dwellStep = (isInside: boolean, dt: number) => {
    if (isInside) progress += (dt * 1000) / settings.dwell;
    else progress = Math.max(0, progress - (dt * 1000) / (settings.dwell * 2.5));
    if (progress >= 1) {
      progress = 0;
      return true;
    }
    return false;
  };

  const ring = (x: number, y: number, r: number, p: number, color = ROSE) => {
    if (p <= 0) return;
    ctx.strokeStyle = color;
    ctx.lineWidth = Math.max(6, r * 0.12);
    ctx.lineCap = "round";
    ctx.beginPath();
    ctx.arc(x, y, r + ctx.lineWidth, -Math.PI / 2, -Math.PI / 2 + p * Math.PI * 2);
    ctx.stroke();
  };

  const star = (x: number, y: number, r: number, color: string) => {
    ctx.fillStyle = color;
    ctx.beginPath();
    for (let i = 0; i < 8; i++) {
      const rr = i % 2 === 0 ? r : r * 0.32;
      const a = (Math.PI / 4) * i - Math.PI / 2;
      ctx.lineTo(x + Math.cos(a) * rr, y + Math.sin(a) * rr);
    }
    ctx.closePath();
    ctx.fill();
  };

  const label = (text: string, x: number, y: number, size = 22) => {
    ctx.fillStyle = CREAM;
    ctx.font = `500 ${size}px Outfit, sans-serif`;
    ctx.textAlign = "center";
    ctx.textBaseline = "middle";
    ctx.fillText(text, x, y);
  };

  let last = performance.now();
  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    // Suavizado del puntero (independiente de los fps)
    const k = 1 - Math.pow(0.02 + (1 - settings.smooth) * 0.5, dt * 10);
    sm.x += (ptr.x - sm.x) * Math.min(1, k);
    sm.y += (ptr.y - sm.y) * Math.min(1, k);

    ctx.clearRect(0, 0, w, h);
    const R = radius();

    if (level && !done && !paused) {
      if (level.kind === "alcanzar") {
        const tx = target.x * w;
        const ty = target.y * h;
        const ok = ptr.visible && dist(tx, ty) < R * 1.25;
        if (dwellStep(ok, dt)) {
          hit();
          newTarget();
        }
      } else if (level.kind === "llevar") {
        if (!item.held) {
          const ok = ptr.visible && dist(item.x * w, item.y * h) < R * 1.25;
          if (dwellStep(ok, dt)) {
            item.held = true;
            cb.onCue("¡La tiene! Ahora llévela a la canasta.");
          }
        } else {
          if (ptr.visible) {
            item.x = sm.x;
            item.y = sm.y;
          }
          const ok = ptr.visible && dist(basket.x * w, basket.y * h) < R * 1.5;
          if (dwellStep(ok, dt)) {
            hit();
            resetItem();
          }
        }
      } else if (level.kind === "seguir") {
        pathT += dt * 0.32 * settings.speed;
        target.x = 0.5 + Math.sin(pathT) * 0.3;
        target.y = 0.52 + Math.sin(pathT * 2) * 0.2;
        if (ptr.visible && dist(target.x * w, target.y * h) < R * 1.35) inside += dt;
        const secs = Math.floor(inside);
        if (secs > lastSecond) {
          lastSecond = secs;
          count = secs;
          cb.onCount(count);
          if (count >= level.goal) finish();
          else if (count % 5 === 0) cb.onHit();
        }
      } else if (level.kind === "abrir") {
        if (!touch) {
          const o = ptr.visible ? ptr.open : 0.5;
          if (wantOpen && o > 0.7) wantOpen = false;
          else if (!wantOpen && o < 0.3) {
            wantOpen = true;
            hit();
          }
        } else {
          const tx = (side === "izq" ? 0.25 : 0.75) * w;
          const ok = ptr.visible && dist(tx, h * 0.55) < R * 1.4;
          if (dwellStep(ok, dt * 2.5)) {
            side = side === "izq" ? "der" : "izq";
            hit();
          }
        }
      }
    }

    // ---- Dibujo ----
    celebrate = Math.max(0, celebrate - dt * 1.5);
    if (level) {
      if (level.kind === "alcanzar") {
        const tx = target.x * w;
        const ty = target.y * h;
        ctx.fillStyle = BRIGHT;
        ctx.beginPath();
        ctx.arc(tx, ty, R * (1 + celebrate * 0.2), 0, Math.PI * 2);
        ctx.fill();
        ring(tx, ty, R, progress);
      } else if (level.kind === "llevar") {
        const bx = basket.x * w;
        const by = basket.y * h;
        ctx.strokeStyle = ROSE;
        ctx.lineWidth = 5;
        ctx.setLineDash([14, 10]);
        ctx.beginPath();
        ctx.roundRect(bx - R * 1.5, by - R * 1.1, R * 3, R * 2.2, 24);
        ctx.stroke();
        ctx.setLineDash([]);
        label("Canasta", bx, by + R * 1.1 + 26, 20);
        const ix = item.x * w;
        const iy = item.y * h;
        star(ix, iy, R * (item.held ? 0.95 : 1.1), item.held ? ROSE : BRIGHT);
        ring(item.held ? bx : ix, item.held ? by : iy, item.held ? R * 1.2 : R, progress);
      } else if (level.kind === "seguir") {
        // Rastro del camino
        ctx.strokeStyle = "rgba(246,193,206,0.18)";
        ctx.lineWidth = R * 0.5;
        ctx.lineCap = "round";
        ctx.beginPath();
        for (let i = 0; i <= 120; i++) {
          const t = (i / 120) * Math.PI * 2;
          const x = (0.5 + Math.sin(t) * 0.3) * w;
          const y = (0.52 + Math.sin(t * 2) * 0.2) * h;
          if (i === 0) ctx.moveTo(x, y);
          else ctx.lineTo(x, y);
        }
        ctx.stroke();
        const tx = target.x * w;
        const ty = target.y * h;
        const ok = ptr.visible && dist(tx, ty) < R * 1.35;
        ctx.fillStyle = ok ? ROSE : BRIGHT;
        ctx.beginPath();
        ctx.arc(tx, ty, R * 1.1, 0, Math.PI * 2);
        ctx.fill();
        if (ok) label("¡Así!", tx, ty, 22);
      } else if (level.kind === "abrir") {
        if (!touch) {
          const o = ptr.visible ? ptr.open : 0.5;
          const cx = w / 2;
          const cy = h * 0.52;
          const r = R * (0.8 + o * 1.4);
          ctx.fillStyle = "rgba(163,33,80,0.55)";
          ctx.beginPath();
          ctx.arc(cx, cy, r, 0, Math.PI * 2);
          ctx.fill();
          ctx.strokeStyle = ROSE;
          ctx.lineWidth = 4;
          ctx.beginPath();
          ctx.arc(cx, cy, R * 2.2, 0, Math.PI * 2);
          ctx.stroke();
          label(wantOpen ? "Abra la mano ✋" : "Ahora cierre el puño ✊", cx, cy, Math.max(24, R * 0.32));
        } else {
          for (const s of ["izq", "der"] as const) {
            const tx = (s === "izq" ? 0.25 : 0.75) * w;
            const active = s === side;
            ctx.fillStyle = active ? BRIGHT : "rgba(163,33,80,0.25)";
            ctx.beginPath();
            ctx.arc(tx, h * 0.55, R, 0, Math.PI * 2);
            ctx.fill();
            if (active) {
              ring(tx, h * 0.55, R, progress);
              label("Aquí", tx, h * 0.55, 24);
            }
          }
        }
      }

      if (celebrate > 0) {
        ctx.globalAlpha = celebrate;
        for (let i = 0; i < 8; i++) {
          const a = (i / 8) * Math.PI * 2;
          const d = (1 - celebrate) * unit() * 0.25;
          star(px() + Math.cos(a) * d, py() + Math.sin(a) * d, 12, ROSE);
        }
        ctx.globalAlpha = 1;
      }
    }

    // Puntero (mano o dedo)
    if (ptr.visible && !(level?.kind === "abrir" && !touch)) {
      ctx.fillStyle = CREAM;
      ctx.strokeStyle = DEEP;
      ctx.lineWidth = 4;
      ctx.beginPath();
      ctx.arc(px(), py(), Math.max(14, R * 0.22), 0, Math.PI * 2);
      ctx.fill();
      ctx.stroke();
    }

    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return {
    setPointer(p) {
      ptr.x = p.x;
      ptr.y = p.y;
      ptr.visible = p.visible;
      if (p.open !== undefined) ptr.open = p.open;
    },
    start(l, isTouch) {
      level = l;
      touch = isTouch;
      count = 0;
      done = false;
      progress = 0;
      inside = 0;
      lastSecond = 0;
      pathT = 0;
      wantOpen = true;
      side = "izq";
      startedAt = performance.now();
      newTarget();
      resetItem();
      cb.onCount(0);
    },
    pause(p) {
      paused = p;
    },
    resize,
    dispose() {
      cancelAnimationFrame(frame);
    },
  };
}
