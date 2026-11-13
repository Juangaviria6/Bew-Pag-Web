import type { Mood } from "./mood";

/**
 * Escena 2D (canvas) que cambia según la emoción:
 * feliz → rayos y estrellas que suben · triste → lluvia · sorpresa → explosión
 * enojo → glitch · neutral → partículas que flotan.
 */

export interface MoodScene {
  set: (mood: Mood, face: { x: number; y: number; size: number; visible: boolean }) => void;
  resize: () => void;
  dispose: () => void;
}

const BRIGHT = "#a32150";
const ROSE = "#f6c1ce";
const CREAM = "#fcf1f3";

interface P {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  size: number;
  rot: number;
  kind: 0 | 1; // 0 punto/gota, 1 estrella
}

function star(ctx: CanvasRenderingContext2D, x: number, y: number, r: number, rot: number) {
  ctx.save();
  ctx.translate(x, y);
  ctx.rotate(rot);
  ctx.beginPath();
  for (let i = 0; i < 8; i++) {
    const rr = i % 2 === 0 ? r : r * 0.24;
    const a = (Math.PI / 4) * i - Math.PI / 2;
    ctx.lineTo(Math.cos(a) * rr, Math.sin(a) * rr);
  }
  ctx.closePath();
  ctx.fill();
  ctx.restore();
}

export function createMoodScene(canvas: HTMLCanvasElement): MoodScene {
  const ctx = canvas.getContext("2d")!;
  const dpr = Math.min(window.devicePixelRatio, 2);
  let w = 1;
  let h = 1;
  let mood: Mood = "neutral";
  let prevMood: Mood = "neutral";
  let changedAt = performance.now();
  const face = { x: 0.5, y: 0.45, size: 0.4, visible: false };
  const fx = { x: 0.5, y: 0.45 };
  const parts: P[] = [];
  let acc = 0;
  let frame = 0;

  const resize = () => {
    w = canvas.clientWidth || 1;
    h = canvas.clientHeight || 1;
    canvas.width = Math.round(w * dpr);
    canvas.height = Math.round(h * dpr);
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  };
  resize();

  const add = (p: Partial<P>) => {
    if (parts.length > 260) parts.shift();
    parts.push({ x: 0, y: 0, vx: 0, vy: 0, life: 1, size: 4, rot: 0, kind: 0, ...p });
  };

  const burst = (n: number) => {
    const cx = fx.x * w;
    const cy = fx.y * h;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2;
      const s = 180 + Math.random() * 420;
      add({ x: cx, y: cy, vx: Math.cos(a) * s, vy: Math.sin(a) * s, size: 6 + Math.random() * 12, rot: a, kind: 1 });
    }
  };

  let last = performance.now();
  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;
    fx.x += (face.x - fx.x) * 0.15;
    fx.y += (face.y - fx.y) * 0.15;
    const t = now / 1000;
    const since = (now - changedAt) / 1000;

    ctx.clearRect(0, 0, w, h);
    const cx = fx.x * w;
    const cy = fx.y * h;
    const R = Math.max(w, h);

    // Capa de color por emoción
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, R * 0.8);
    if (mood === "feliz") {
      g.addColorStop(0, "rgba(246,193,206,0.35)");
      g.addColorStop(1, "rgba(163,33,80,0.25)");
    } else if (mood === "triste") {
      g.addColorStop(0, "rgba(28,15,19,0.15)");
      g.addColorStop(1, "rgba(28,15,19,0.6)");
    } else if (mood === "sorpresa") {
      g.addColorStop(0, "rgba(252,241,243,0.25)");
      g.addColorStop(1, "rgba(115,17,39,0.35)");
    } else if (mood === "enojo") {
      g.addColorStop(0, "rgba(163,33,80,0.2)");
      g.addColorStop(1, "rgba(74,10,27,0.65)");
    } else {
      g.addColorStop(0, "rgba(0,0,0,0)");
      g.addColorStop(1, "rgba(58,7,21,0.35)");
    }
    ctx.fillStyle = g;
    ctx.fillRect(0, 0, w, h);

    // Efectos de fondo
    if (mood === "feliz") {
      ctx.save();
      ctx.translate(cx, cy);
      ctx.rotate(t * 0.25);
      ctx.fillStyle = "rgba(246,193,206,0.16)";
      for (let i = 0; i < 12; i++) {
        ctx.rotate((Math.PI * 2) / 12);
        ctx.beginPath();
        ctx.moveTo(0, 0);
        ctx.lineTo(R, -R * 0.08);
        ctx.lineTo(R, R * 0.08);
        ctx.closePath();
        ctx.fill();
      }
      ctx.restore();
      acc += dt * 26;
      while (acc >= 1) {
        acc -= 1;
        add({ x: Math.random() * w, y: h + 10, vx: (Math.random() - 0.5) * 30, vy: -90 - Math.random() * 120, size: 6 + Math.random() * 10, rot: Math.random() * 6, kind: 1 });
      }
    } else if (mood === "triste") {
      acc += dt * 90;
      while (acc >= 1) {
        acc -= 1;
        add({ x: Math.random() * w, y: -10, vx: -20, vy: 520 + Math.random() * 260, size: 1.5, kind: 0 });
      }
    } else if (mood === "sorpresa") {
      if (prevMood !== "sorpresa") {
        burst(70);
        prevMood = "sorpresa";
      }
      const ring = since * 900;
      if (ring < R) {
        ctx.strokeStyle = `rgba(252,241,243,${Math.max(0, 1 - ring / R)})`;
        ctx.lineWidth = 6;
        ctx.beginPath();
        ctx.arc(cx, cy, ring, 0, Math.PI * 2);
        ctx.stroke();
      }
    } else if (mood === "enojo") {
      // líneas de glitch
      for (let i = 0; i < 7; i++) {
        const y = (Math.sin(t * 13 + i * 7.3) * 0.5 + 0.5) * h;
        ctx.fillStyle = i % 2 ? "rgba(163,33,80,0.35)" : "rgba(246,193,206,0.18)";
        ctx.fillRect(0, y, w, 2 + (i % 3) * 3);
      }
      acc += dt * 30;
      while (acc >= 1) {
        acc -= 1;
        const a = Math.random() * Math.PI * 2;
        add({ x: cx + Math.cos(a) * 60, y: cy + Math.sin(a) * 60, vx: Math.cos(a) * 160, vy: Math.sin(a) * 160 - 60, size: 3, kind: 0 });
      }
    } else {
      acc += dt * 6;
      while (acc >= 1) {
        acc -= 1;
        add({ x: Math.random() * w, y: h + 5, vx: 0, vy: -30 - Math.random() * 30, size: 2 + Math.random() * 2, kind: 0 });
      }
    }
    if (mood !== "sorpresa") prevMood = mood;

    // Partículas
    for (let i = parts.length - 1; i >= 0; i--) {
      const p = parts[i];
      p.life -= dt * (p.kind === 1 && mood === "sorpresa" ? 0.7 : 0.35);
      if (mood === "sorpresa") p.vy += 260 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rot += dt * 2;
      if (p.life <= 0 || p.y > h + 40 || p.y < -60) {
        parts.splice(i, 1);
        continue;
      }
      ctx.globalAlpha = Math.min(1, p.life * 1.5);
      if (p.kind === 1) {
        ctx.fillStyle = mood === "feliz" ? ROSE : CREAM;
        star(ctx, p.x, p.y, p.size, p.rot);
      } else if (mood === "triste") {
        ctx.strokeStyle = "rgba(252,241,243,0.55)";
        ctx.lineWidth = 1.2;
        ctx.beginPath();
        ctx.moveTo(p.x, p.y);
        ctx.lineTo(p.x - 4, p.y - 18);
        ctx.stroke();
      } else {
        ctx.fillStyle = mood === "enojo" ? BRIGHT : ROSE;
        ctx.beginPath();
        ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
        ctx.fill();
      }
    }
    ctx.globalAlpha = 1;

    // Marco de la cara
    if (face.visible) {
      const r = face.size * w * 0.55;
      ctx.strokeStyle = mood === "enojo" ? BRIGHT : mood === "triste" ? "rgba(252,241,243,0.4)" : ROSE;
      ctx.lineWidth = 2;
      ctx.setLineDash([6, 8]);
      ctx.lineDashOffset = -t * 30;
      ctx.beginPath();
      ctx.ellipse(cx, cy, r, r * 1.25, 0, 0, Math.PI * 2);
      ctx.stroke();
      ctx.setLineDash([]);
    }

    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return {
    set(m, f) {
      if (m !== mood) {
        mood = m;
        changedAt = performance.now();
        // Las partículas de la emoción anterior se desvanecen rápido.
        for (const p of parts) p.life = Math.min(p.life, 0.3);
      }
      Object.assign(face, f);
    },
    resize,
    dispose() {
      cancelAnimationFrame(frame);
      ctx.clearRect(0, 0, w, h);
    },
  };
}
