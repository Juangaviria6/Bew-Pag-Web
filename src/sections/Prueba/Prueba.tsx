import { useCallback, useEffect, useRef, useState } from "react";
import { scrollToHash } from "../../hooks/useSmoothScroll";
import { createStarScene } from "./handScene";
import { createFaceScene } from "./faceScene";
import { createMoodScene } from "./moodScene";
import { EMPTY_FACE, type FaceInput, type Fit } from "./faceTracker";
import { MOODS, classify, createMoodStabilizer, type Mood } from "./mood";
import "./Prueba.css";

type Kind = "hand" | "face" | "mood";
type Mode = "idle" | "loading" | "camera" | "touch" | "denied";

interface Engine {
  setInput: (input: never) => void;
  resize: () => void;
  dispose: () => void;
}
interface Tracker {
  read: (video: HTMLVideoElement, now: number, fit: Fit) => unknown;
  close: () => void;
}

const COPY: Record<Kind, { lead: string; steps: string[]; touch: string; action: string; label: string }> = {
  hand: {
    lead: "Activa la cámara y mueve una estrella 3D con la mano.",
    steps: ["Muestra una mano a la cámara", "Muévela: la estrella te sigue", "Junta pulgar e índice para pellizcar"],
    touch: "Toca o arrastra para mover la estrella",
    action: "Pellizcos",
    label: "Mano",
  },
  face: {
    lead: "Activa la cámara y ponte una corona de estrellas 3D.",
    steps: [
      "Pon tu rostro frente a la cámara",
      "Gira la cabeza: la corona te sigue",
      "Abre la boca: lluvia de estrellas",
      "Sonríe: la corona cambia de color",
    ],
    touch: "Mueve el dedo o el mouse; mantén presionado para la lluvia",
    action: "Lluvias",
    label: "Rostro",
  },
  mood: {
    lead: "Haz una cara y la web cambia contigo: feliz, triste, sorpresa o enojo.",
    steps: [
      "Mira a la cámara",
      "Sonríe, sorpréndete, frunce el ceño o pon cara triste",
      "Guarda tu postal bew_",
    ],
    touch: "Elige una emoción abajo para ver cómo cambia",
    action: "Emociones",
    label: "Emoción",
  },
};

const MOOD_LIST: Mood[] = ["feliz", "triste", "sorpresa", "enojo"];

/** Módulo interactivo: cámara + seguimiento (mano, rostro o emoción) + escena. Sin cámara, funciona con toque/mouse. */
export function Prueba() {
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const engine = useRef<Engine | null>(null);
  const tracker = useRef<Tracker | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef(0);
  const edge = useRef(false);
  const seen = useRef(new Set<Mood>());
  const forced = useRef<Mood | null>(null);
  const lastFace = useRef<FaceInput>(EMPTY_FACE);
  const moodRef = useRef<Mood>("neutral");
  const [kind, setKind] = useState<Kind>("hand");
  const [mode, setMode] = useState<Mode>("idle");
  const [step, setStep] = useState(0);
  const [actions, setActions] = useState(0);
  const [mood, setMood] = useState<Mood>("neutral");
  const [saved, setSaved] = useState("");

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    tracker.current?.close();
    tracker.current = null;
    engine.current?.dispose();
    engine.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    const onResize = () => engine.current?.resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const showMood = (m: Mood) => {
    if (m === moodRef.current) return;
    moodRef.current = m;
    setMood(m);
    if (m !== "neutral" && !seen.current.has(m)) {
      seen.current.add(m);
      setActions(seen.current.size);
      setStep((s) => Math.max(s, 1));
    }
  };

  const createMoodEngine = (c: HTMLCanvasElement): Engine => {
    const scene = createMoodScene(c);
    const stab = createMoodStabilizer();
    return {
      setInput: ((f: FaceInput) => {
        lastFace.current = f;
        const m = forced.current ?? stab(classify(f), performance.now());
        scene.set(m, { x: f.mx, y: (f.y + f.my) / 2 + 0.06, size: f.size, visible: f.visible });
        showMood(m);
      }) as never,
      resize: scene.resize,
      dispose: scene.dispose,
    };
  };

  const startEngine = (k: Kind) => {
    const c = canvas.current;
    if (!c) return;
    engine.current?.dispose();
    engine.current =
      k === "hand"
        ? (createStarScene(c) as Engine)
        : k === "face"
          ? (createFaceScene(c) as Engine)
          : createMoodEngine(c);
  };

  /** Convierte coordenadas del video (0..1) a la vista, compensando el recorte object-fit: cover. */
  const makeFit = (): Fit => {
    const v = video.current;
    const s = stage.current;
    if (!v || !s || !v.videoWidth) return (x, y) => [x, y];
    const va = v.videoWidth / v.videoHeight;
    const sa = s.clientWidth / s.clientHeight;
    return (x, y) => (va > sa ? [(x - 0.5) / (sa / va) + 0.5, y] : [x, (y - 0.5) / (va / sa) + 0.5]);
  };

  const reset = () => {
    setStep(0);
    setActions(0);
    setSaved("");
    edge.current = false;
    seen.current = new Set();
    forced.current = null;
    moodRef.current = "neutral";
    setMood("neutral");
  };

  const startCamera = async () => {
    const k = kind;
    setMode("loading");
    reset();
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("no-camera");
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      const v = video.current!;
      v.srcObject = stream.current;
      await v.play();
      tracker.current =
        k === "hand"
          ? ((await (await import("./handTracker")).createHandTracker()) as unknown as Tracker)
          : ((await (await import("./faceTracker")).createFaceTracker()) as unknown as Tracker);
      setMode("camera");
      startEngine(k);

      const loop = (now: number) => {
        const t = tracker.current;
        if (t && video.current) {
          const input = t.read(video.current, now, makeFit());
          engine.current?.setInput(input as never);
          if (k === "hand") {
            const h = input as { visible: boolean; pinch: boolean };
            if (h.visible) setStep((s) => Math.max(s, 1));
            if (h.pinch && !edge.current) {
              setStep(2);
              setActions((n) => n + 1);
            }
            edge.current = h.pinch;
          } else if (k === "face") {
            const f = input as FaceInput;
            if (f.visible) setStep((s) => Math.max(s, 1));
            if (f.visible && Math.abs(f.yaw) > 0.12) setStep((s) => Math.max(s, 2));
            const open = f.mouth > 0.45;
            if (open && !edge.current) {
              setStep((s) => Math.max(s, 2));
              setActions((n) => n + 1);
            }
            if (f.smile > 0.45) setStep(3);
            edge.current = open;
          }
        }
        raf.current = requestAnimationFrame(loop);
      };
      raf.current = requestAnimationFrame(loop);
    } catch (err) {
      stop();
      const denied = err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError");
      if (denied) setMode("denied");
      else startTouch(true);
    }
  };

  const startTouch = (already = false) => {
    if (!already) stop();
    setMode("touch");
    reset();
    requestAnimationFrame(() => {
      startEngine(kind);
      engine.current?.setInput(
        (kind === "hand"
          ? { x: 0.5, y: 0.5, angle: 0, pinch: false, visible: true }
          : { ...EMPTY_FACE, x: 0.5, y: 0.35, mx: 0.5, my: 0.6, visible: kind === "face" }) as never,
      );
    });
  };

  const pickMood = (m: Mood) => {
    forced.current = m;
    if (!engine.current) startEngine(kind);
    engine.current?.setInput(lastFace.current as never);
    showMood(m);
  };

  const onPointer = (e: React.PointerEvent) => {
    if (mode !== "touch" || !stage.current || kind === "mood") return;
    const r = stage.current.getBoundingClientRect();
    const x = (e.clientX - r.left) / r.width;
    const y = (e.clientY - r.top) / r.height;
    const down = e.buttons > 0 || e.pointerType === "touch";
    engine.current?.setInput(
      (kind === "hand"
        ? { x, y, angle: 0, pinch: down, visible: true }
        : {
            ...EMPTY_FACE,
            x,
            y,
            mx: x,
            my: y + 0.18,
            yaw: (x - 0.5) * 0.8,
            roll: (x - 0.5) * 0.4,
            mouth: down ? 1 : 0,
            smile: y < 0.3 ? 1 : 0,
            visible: true,
          }) as never,
    );
    if (e.type === "pointerdown") setActions((n) => n + 1);
  };

  /** Compone la postal (video + efecto + texto + logo) y la comparte o descarga. Todo local. */
  const savePostcard = async () => {
    const s = stage.current;
    const c = canvas.current;
    if (!s || !c) return;
    const W = 1080;
    const H = Math.round((W * s.clientHeight) / s.clientWidth);
    const out = document.createElement("canvas");
    out.width = W;
    out.height = H;
    const ctx = out.getContext("2d")!;
    ctx.fillStyle = "#4a0a1b";
    ctx.fillRect(0, 0, W, H);

    const v = video.current;
    if (mode === "camera" && v && v.videoWidth) {
      const va = v.videoWidth / v.videoHeight;
      const oa = W / H;
      let sw = v.videoWidth;
      let sh = v.videoHeight;
      if (va > oa) sw = sh * oa;
      else sh = sw / oa;
      ctx.save();
      ctx.filter = MOODS[mood].filter;
      ctx.translate(W, 0);
      ctx.scale(-1, 1);
      ctx.drawImage(v, (v.videoWidth - sw) / 2, (v.videoHeight - sh) / 2, sw, sh, 0, 0, W, H);
      ctx.restore();
    }
    ctx.drawImage(c, 0, 0, W, H);

    const grad = ctx.createLinearGradient(0, H * 0.55, 0, H);
    grad.addColorStop(0, "rgba(58,7,21,0)");
    grad.addColorStop(1, "rgba(58,7,21,0.9)");
    ctx.fillStyle = grad;
    ctx.fillRect(0, H * 0.55, W, H * 0.45);

    const pad = 64;
    ctx.fillStyle = "#f6c1ce";
    ctx.font = "500 30px 'JetBrains Mono', monospace";
    ctx.fillText(MOODS[mood].label.toUpperCase(), pad, H - 230);
    ctx.fillStyle = "#fcf1f3";
    ctx.font = "500 64px Outfit, sans-serif";
    const words = MOODS[mood].title.split(" ");
    let line = "";
    let y = H - 160;
    const lines: string[] = [];
    for (const word of words) {
      const test = line ? `${line} ${word}` : word;
      if (ctx.measureText(test).width > W - pad * 2) {
        lines.push(line);
        line = word;
      } else line = test;
    }
    lines.push(line);
    y -= (lines.length - 1) * 70;
    for (const l of lines) {
      ctx.fillText(l, pad, y);
      y += 70;
    }
    ctx.font = "600 44px Outfit, sans-serif";
    ctx.fillStyle = "#fcf1f3";
    ctx.fillText("bew_", W - pad - ctx.measureText("bew_").width, pad + 30);

    const blob = await new Promise<Blob | null>((r) => out.toBlob(r, "image/png"));
    if (!blob) return;
    const file = new File([blob], `postal-bew-${mood}.png`, { type: "image/png" });
    try {
      if (navigator.canShare?.({ files: [file] })) {
        await navigator.share({ files: [file], title: "Mi postal bew_" });
        setSaved("¡Postal compartida!");
      } else {
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = file.name;
        a.click();
        setTimeout(() => URL.revokeObjectURL(url), 2000);
        setSaved("Postal descargada");
      }
      setStep(2);
    } catch {
      /* el usuario canceló el diálogo de compartir */
    }
  };

  const close = () => {
    stop();
    setMode("idle");
  };

  const changeKind = (k: Kind) => {
    if (k === kind) return;
    stop();
    setMode("idle");
    setKind(k);
  };

  const live = mode === "camera" || mode === "touch";
  const copy = COPY[kind];
  const meta = MOODS[mood];

  return (
    <section id="prueba" className="section prueba">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="section-kicker">
              <span>— Pruébalo</span>
            </p>
            <h2 className="section-title">
              Tu cuerpo controla <span className="accent">la web.</span>
            </h2>
          </div>
          <p className="prueba__note mono">
            Todo ocurre en tu dispositivo.
            <br />
            El video no se envía ni se guarda.
          </p>
        </div>

        <div className="prueba__tabs" role="group" aria-label="Elige el experimento">
          {(["hand", "face", "mood"] as Kind[]).map((k) => (
            <button key={k} type="button" className="prueba__tab" aria-pressed={kind === k} onClick={() => changeKind(k)}>
              {COPY[k].label}
            </button>
          ))}
        </div>

        <div
          ref={stage}
          className={`prueba__stage ${live ? "is-live" : ""} ${kind === "mood" && live ? `is-mood mood--${mood}` : ""}`}
          onPointerDown={onPointer}
          onPointerMove={onPointer}
        >
          <video
            ref={video}
            className="prueba__video"
            playsInline
            muted
            aria-hidden="true"
            style={kind === "mood" ? { filter: meta.filter } : undefined}
          />
          <canvas key={kind} ref={canvas} className="prueba__canvas" aria-label="Escena interactiva" />

          {mode === "idle" && (
            <div className="prueba__overlay">
              <p className="eyebrow">Experimento · {copy.label}</p>
              <p className="prueba__lead">{copy.lead}</p>
              <div className="prueba__actions">
                <button type="button" className="pill pill--cream" onClick={startCamera}>
                  Activar cámara <span aria-hidden="true">→</span>
                </button>
                <button type="button" className="pill prueba__ghost" onClick={() => startTouch()}>
                  Probar sin cámara
                </button>
              </div>
            </div>
          )}

          {mode === "loading" && (
            <div className="prueba__overlay" role="status">
              <p className="prueba__lead">
                Preparando la cámara<span className="blink">_</span>
              </p>
              <p className="mono prueba__small">Acepta el permiso del navegador</p>
            </div>
          )}

          {mode === "denied" && (
            <div className="prueba__overlay" role="alert">
              <p className="prueba__lead">No pudimos usar la cámara.</p>
              <p className="mono prueba__small">Revisa el permiso del navegador o prueba con el toque.</p>
              <div className="prueba__actions">
                <button type="button" className="pill pill--cream" onClick={() => startTouch()}>
                  Probar sin cámara
                </button>
                <button type="button" className="pill prueba__ghost" onClick={startCamera}>
                  Reintentar
                </button>
              </div>
            </div>
          )}

          {live && kind === "mood" && (
            <div className="prueba__mood" aria-live="polite">
              <p className="prueba__mood-label mono">{meta.label}</p>
              <p className="prueba__mood-title" key={mood}>
                {meta.title}
              </p>
              <p className="prueba__mood-copy">{meta.copy}</p>
              {mode === "touch" && (
                <div className="prueba__chips" role="group" aria-label="Elige una emoción">
                  {MOOD_LIST.map((m) => (
                    <button key={m} type="button" className="prueba__chip" aria-pressed={mood === m} onClick={() => pickMood(m)}>
                      {MOODS[m].label}
                    </button>
                  ))}
                </div>
              )}
              <button type="button" className="pill pill--cream prueba__save" onClick={savePostcard}>
                Guardar mi postal <span aria-hidden="true">↓</span>
              </button>
              {saved && <p className="mono prueba__small">{saved}</p>}
            </div>
          )}

          {live && kind !== "mood" && (
            <ol className="prueba__steps" aria-label="Instrucciones">
              {(mode === "camera" ? copy.steps : [copy.touch]).map((s, i) => (
                <li key={s} className={i <= step || mode === "touch" ? "is-done" : ""}>
                  <span className="mono">0{i + 1}</span> {s}
                </li>
              ))}
            </ol>
          )}

          {live && (
            <>
              <p className="prueba__count mono" aria-live="polite">
                {copy.action} · {String(actions).padStart(2, "0")}
                {kind === "mood" && " / 04"}
              </p>
              <button type="button" className="prueba__close" onClick={close} aria-label="Cerrar cámara">
                ✕
              </button>
            </>
          )}
        </div>

        {kind === "mood" && mode === "camera" && (
          <ol className="prueba__steps prueba__steps--below" aria-label="Instrucciones">
            {copy.steps.map((s, i) => (
              <li key={s} className={i <= step ? "is-done" : ""}>
                <span className="mono">0{i + 1}</span> {s}
              </li>
            ))}
          </ol>
        )}

        <div className="prueba__cta">
          <p>¿Te gustó? Así de interactiva puede ser tu web.</p>
          <button type="button" className="pill pill--cream" onClick={() => scrollToHash("#contacto")}>
            Cuéntanos tu idea <span aria-hidden="true">→</span>
          </button>
        </div>
      </div>
    </section>
  );
}
