import { useCallback, useEffect, useRef, useState } from "react";
import { scrollToHash } from "../../hooks/useSmoothScroll";
import { createStarScene, type StarScene } from "./handScene";
import type { HandTracker } from "./handTracker";
import "./Prueba.css";

type Mode = "idle" | "loading" | "camera" | "touch" | "denied";

const STEPS = [
  { key: "show", text: "Muestra una mano a la cámara" },
  { key: "move", text: "Muévela: la estrella te sigue" },
  { key: "pinch", text: "Junta pulgar e índice para pellizcar" },
];

/** Módulo interactivo: cámara + seguimiento de mano + estrella 3D. Sin cámara, funciona con toque/mouse. */
export function Prueba() {
  const stage = useRef<HTMLDivElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const scene = useRef<StarScene | null>(null);
  const tracker = useRef<HandTracker | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef(0);
  const [mode, setMode] = useState<Mode>("idle");
  const [step, setStep] = useState(0);
  const [pinches, setPinches] = useState(0);
  const wasPinch = useRef(false);

  const stop = useCallback(() => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    tracker.current?.close();
    tracker.current = null;
    scene.current?.dispose();
    scene.current = null;
  }, []);

  useEffect(() => stop, [stop]);

  useEffect(() => {
    const onResize = () => scene.current?.resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const startScene = () => {
    if (!canvas.current) return;
    scene.current?.dispose();
    scene.current = createStarScene(canvas.current);
  };

  const startCamera = async () => {
    setMode("loading");
    setStep(0);
    setPinches(0);
    try {
      if (!navigator.mediaDevices?.getUserMedia) throw new Error("no-camera");
      stream.current = await navigator.mediaDevices.getUserMedia({
        video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
        audio: false,
      });
      const v = video.current!;
      v.srcObject = stream.current;
      await v.play();
      const { createHandTracker } = await import("./handTracker");
      tracker.current = await createHandTracker();
      setMode("camera");
      startScene();

      const loop = (now: number) => {
        const t = tracker.current;
        if (t && video.current) {
          const input = t.read(video.current, now);
          scene.current?.setInput(input);
          if (input.visible) setStep((s) => (s < 1 ? 1 : s));
          if (input.pinch && !wasPinch.current) {
            setStep(2);
            setPinches((n) => n + 1);
          }
          wasPinch.current = input.pinch;
        }
        raf.current = requestAnimationFrame(loop);
      };
      raf.current = requestAnimationFrame(loop);
    } catch (err) {
      stop();
      const denied = err instanceof DOMException && (err.name === "NotAllowedError" || err.name === "SecurityError");
      setMode(denied ? "denied" : "touch");
      if (!denied) startTouch(true);
    }
  };

  const startTouch = (already = false) => {
    if (!already) stop();
    setMode("touch");
    requestAnimationFrame(() => {
      startScene();
      scene.current?.setInput({ x: 0.5, y: 0.5, angle: 0, pinch: false, visible: true });
    });
  };

  const onPointer = (e: React.PointerEvent) => {
    if (mode !== "touch" || !stage.current) return;
    const r = stage.current.getBoundingClientRect();
    scene.current?.setInput({
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
      angle: 0,
      pinch: e.buttons > 0 || e.pointerType === "touch",
      visible: true,
    });
    if (e.type === "pointerdown") setPinches((n) => n + 1);
  };

  const close = () => {
    stop();
    setMode("idle");
  };

  const live = mode === "camera" || mode === "touch";

  return (
    <section id="prueba" className="section prueba">
      <div className="container">
        <div className="section-head">
          <div>
            <p className="section-kicker">
              <span>— Pruébalo</span>
            </p>
            <h2 className="section-title">
              Tu mano controla <span className="accent">la web.</span>
            </h2>
          </div>
          <p className="prueba__note mono">
            Todo ocurre en tu dispositivo.
            <br />
            El video no se envía ni se guarda.
          </p>
        </div>

        <div
          ref={stage}
          className={`prueba__stage ${live ? "is-live" : ""}`}
          onPointerDown={onPointer}
          onPointerMove={onPointer}
        >
          <video ref={video} className="prueba__video" playsInline muted aria-hidden="true" />
          <canvas ref={canvas} className="prueba__canvas" aria-label="Estrella 3D interactiva" />

          {mode === "idle" && (
            <div className="prueba__overlay">
              <p className="eyebrow">Experimento</p>
              <p className="prueba__lead">Activa la cámara y mueve una estrella 3D con la mano.</p>
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
              <p className="prueba__lead">Preparando la cámara<span className="blink">_</span></p>
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

          {live && (
            <>
              <ol className="prueba__steps" aria-label="Instrucciones">
                {(mode === "camera"
                  ? STEPS
                  : [{ key: "t", text: "Toca o arrastra para mover la estrella" }]
                ).map((s, i) => (
                  <li key={s.key} className={i <= step || mode === "touch" ? "is-done" : ""}>
                    <span className="mono">0{i + 1}</span> {s.text}
                  </li>
                ))}
              </ol>
              <p className="prueba__count mono" aria-live="polite">
                Pellizcos · {String(pinches).padStart(2, "0")}
              </p>
              <button type="button" className="prueba__close" onClick={close} aria-label="Cerrar cámara">
                ✕
              </button>
            </>
          )}
        </div>

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
