import { useCallback, useEffect, useRef, useState } from "react";
import type { HandTracker } from "../sections/Prueba/handTracker";
import { createGame, type Game, type Settings } from "./engine";
import { FINISH, LEVELS, PRAISE } from "./levels";
import { say, setVoice, stopVoice, voiceAvailable } from "./voice";
import "./juego.css";

type Screen = "inicio" | "jugando" | "pausa-nivel" | "fin";
type Input = "camara" | "toque";

const DWELL = { "Rápido · 0,8 s": 800, "Normal · 1,5 s": 1500, "Lento · 2,5 s": 2500 };
const SIZE = { Normal: 1, Grande: 1.35, "Muy grande": 1.7 };

/** Prototipo: juego de movimiento con voz para personas con Parkinson. Todo ocurre en el dispositivo. */
export function Juego() {
  const stage = useRef<HTMLDivElement>(null);
  const canvas = useRef<HTMLCanvasElement>(null);
  const video = useRef<HTMLVideoElement>(null);
  const game = useRef<Game | null>(null);
  const tracker = useRef<HandTracker | null>(null);
  const stream = useRef<MediaStream | null>(null);
  const raf = useRef(0);

  const [screen, setScreen] = useState<Screen>("inicio");
  const [input, setInput] = useState<Input>("toque");
  const [levelIndex, setLevelIndex] = useState(0);
  const [count, setCount] = useState(0);
  const [caption, setCaption] = useState("");
  const [paused, setPaused] = useState(false);
  const [times, setTimes] = useState<number[]>([]);
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const [dwell, setDwell] = useState<keyof typeof DWELL>("Normal · 1,5 s");
  const [size, setSize] = useState<keyof typeof SIZE>("Grande");
  const [smooth, setSmooth] = useState(0.7);
  const [speed, setSpeed] = useState(0.8);
  const [voiceOn, setVoiceOn] = useState(true);
  const [rate, setRate] = useState(0.9);

  const settings = useRef<Settings>({ dwell: 1500, size: 1.35, smooth: 0.7, speed: 0.8 });
  useEffect(() => {
    // El motor lee este objeto en cada frame: los ajustes aplican al instante.
    Object.assign(settings.current, { dwell: DWELL[dwell], size: SIZE[size], smooth, speed });
  }, [dwell, size, smooth, speed]);
  useEffect(() => setVoice({ enabled: voiceOn, rate }), [voiceOn, rate]);

  const speak = useCallback((text: string, interrupt = true) => {
    setCaption(text);
    say(text, interrupt);
  }, []);

  const level = LEVELS[levelIndex];
  const intro = (i: number) => (input === "toque" ? (LEVELS[i].introTouch ?? LEVELS[i].intro) : LEVELS[i].intro);

  const stopCamera = useCallback(() => {
    cancelAnimationFrame(raf.current);
    stream.current?.getTracks().forEach((t) => t.stop());
    stream.current = null;
    tracker.current?.close();
    tracker.current = null;
  }, []);

  const teardown = useCallback(() => {
    stopCamera();
    game.current?.dispose();
    game.current = null;
    stopVoice();
  }, [stopCamera]);

  useEffect(() => teardown, [teardown]);

  useEffect(() => {
    const onResize = () => game.current?.resize();
    window.addEventListener("resize", onResize);
    return () => window.removeEventListener("resize", onResize);
  }, []);

  const startLevel = (i: number) => {
    setLevelIndex(i);
    setCount(0);
    setPaused(false);
    setScreen("jugando");
    game.current?.pause(false);
    game.current?.start(LEVELS[i], input === "toque");
    speak(intro(i));
  };

  const createEngine = () => {
    if (!canvas.current) return;
    game.current?.dispose();
    game.current = createGame(canvas.current, settings.current, {
      onCount: setCount,
      onHit: () => speak(PRAISE[Math.floor(Math.random() * PRAISE.length)], false),
      onCue: (t) => speak(t),
      onDone: (secs) => {
        setTimes((prev) => {
          const next = [...prev];
          next[levelIndexRef.current] = secs;
          return next;
        });
        const last = levelIndexRef.current === LEVELS.length - 1;
        if (last) {
          setScreen("fin");
          speak(FINISH);
        } else {
          setScreen("pausa-nivel");
          speak(`¡Nivel completado! Muy bien. Cuando esté listo, toque Siguiente nivel.`);
        }
      },
    });
  };

  // El callback onDone necesita el nivel actual sin recrear el motor.
  const levelIndexRef = useRef(0);
  useEffect(() => {
    levelIndexRef.current = levelIndex;
  }, [levelIndex]);

  const fit = () => {
    const v = video.current;
    const s = stage.current;
    if (!v || !s || !v.videoWidth) return (x: number, y: number) => [x, y] as [number, number];
    const va = v.videoWidth / v.videoHeight;
    const sa = s.clientWidth / s.clientHeight;
    return (x: number, y: number): [number, number] =>
      va > sa ? [(x - 0.5) / (sa / va) + 0.5, y] : [x, (y - 0.5) / (va / sa) + 0.5];
  };

  const begin = async (mode: Input) => {
    setError("");
    setInput(mode);
    setTimes([]);
    if (mode === "camara") {
      setLoading(true);
      try {
        if (!navigator.mediaDevices?.getUserMedia) throw new Error("sin cámara");
        stream.current = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: "user", width: { ideal: 640 }, height: { ideal: 480 } },
          audio: false,
        });
        const v = video.current!;
        v.srcObject = stream.current;
        await v.play();
        const { createHandTracker } = await import("../sections/Prueba/handTracker");
        tracker.current = await createHandTracker();
      } catch {
        stopCamera();
        setLoading(false);
        setError("No pudimos usar la cámara. Revise el permiso del navegador o juegue con el dedo o el mouse.");
        return;
      }
      setLoading(false);
    }
    setScreen("jugando");
    requestAnimationFrame(() => {
      createEngine();
      if (mode === "camara") {
        const loop = (now: number) => {
          if (tracker.current && video.current) {
            const h = tracker.current.read(video.current, now, fit());
            game.current?.setPointer({ x: h.x, y: h.y, visible: h.visible, open: h.open });
          }
          raf.current = requestAnimationFrame(loop);
        };
        raf.current = requestAnimationFrame(loop);
      }
      // startLevel usa `input`, que aún no se actualizó en este render: se pasa explícito.
      setLevelIndex(0);
      setCount(0);
      game.current?.start(LEVELS[0], mode === "toque");
      const text = mode === "toque" ? (LEVELS[0].introTouch ?? LEVELS[0].intro) : LEVELS[0].intro;
      speak(text);
    });
  };

  const togglePause = useCallback(() => {
    setPaused((p) => {
      const next = !p;
      game.current?.pause(next);
      if (next) speak("Pausa. Descanse lo que necesite.");
      else speak("Seguimos.", true);
      return next;
    });
  }, [speak]);

  const exit = useCallback(() => {
    teardown();
    setScreen("inicio");
    setCaption("");
  }, [teardown]);

  // Teclado: Espacio = pausa, R = repetir, Esc = salir
  useEffect(() => {
    if (screen !== "jugando") return;
    const onKey = (e: KeyboardEvent) => {
      if ((e.target as HTMLElement).closest("button, input, select")) return;
      if (e.key === " ") {
        e.preventDefault();
        togglePause();
      } else if (e.key.toLowerCase() === "r") speak(intro(levelIndex));
      else if (e.key === "Escape") exit();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [screen, levelIndex, togglePause, exit]);

  const onPointer = (e: React.PointerEvent) => {
    if (input !== "toque" || !stage.current) return;
    const r = stage.current.getBoundingClientRect();
    const visible = e.type !== "pointerup" && e.type !== "pointerleave" && e.type !== "pointercancel";
    game.current?.setPointer({
      x: (e.clientX - r.left) / r.width,
      y: (e.clientY - r.top) / r.height,
      // Con mouse basta pasar por encima; con el dedo, mientras toca.
      visible: e.pointerType === "mouse" ? e.type !== "pointerleave" : visible,
    });
  };

  const total = times.reduce((a, b) => a + (b ?? 0), 0);
  const fmt = (s: number) => (s >= 60 ? `${Math.floor(s / 60)} min ${Math.round(s % 60)} s` : `${Math.round(s)} s`);

  return (
    <div className="juego">
      {screen === "inicio" && (
        <main className="juego__inicio">
          <p className="juego__eyebrow">Prototipo · Movimiento</p>
          <h1 className="juego__title">Moverse jugando_</h1>
          <p className="juego__lead">
            Cuatro niveles cortos para practicar alcanzar, llevar, seguir y abrir la mano. Una voz le guía en cada paso.
            No hay prisa ni errores.
          </p>

          <div className="juego__aviso" role="note">
            <strong>Antes de empezar.</strong> Esto es un prototipo, no un tratamiento ni un dispositivo médico. Úselo
            sentado, en un lugar cómodo, y deténgase si siente dolor, mareo o cansancio. Lo ideal es usarlo con la
            guía de su fisioterapeuta.
          </div>

          <fieldset className="juego__ajustes">
            <legend>Ajustes</legend>
            <label>
              Tiempo para seleccionar
              <select value={dwell} onChange={(e) => setDwell(e.target.value as keyof typeof DWELL)}>
                {Object.keys(DWELL).map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </label>
            <label>
              Tamaño de los objetos
              <select value={size} onChange={(e) => setSize(e.target.value as keyof typeof SIZE)}>
                {Object.keys(SIZE).map((k) => (
                  <option key={k}>{k}</option>
                ))}
              </select>
            </label>
            <label>
              Estabilidad del puntero (ayuda con el temblor)
              <input type="range" min={0} max={0.95} step={0.05} value={smooth} onChange={(e) => setSmooth(+e.target.value)} />
            </label>
            <label>
              Velocidad del nivel "Seguir"
              <input type="range" min={0.4} max={1.4} step={0.1} value={speed} onChange={(e) => setSpeed(+e.target.value)} />
            </label>
            <label className="juego__check">
              <input type="checkbox" checked={voiceOn} onChange={(e) => setVoiceOn(e.target.checked)} disabled={!voiceAvailable()} />
              Voz guía {voiceAvailable() ? "" : "(no disponible en este navegador)"}
            </label>
            <label>
              Velocidad de la voz
              <input type="range" min={0.6} max={1.2} step={0.05} value={rate} onChange={(e) => setRate(+e.target.value)} />
            </label>
          </fieldset>

          {error && (
            <p className="juego__error" role="alert">
              {error}
            </p>
          )}

          <div className="juego__start">
            <button type="button" className="juego__btn juego__btn--main" onClick={() => begin("camara")} disabled={loading}>
              {loading ? "Preparando la cámara…" : "Jugar con la cámara (mano)"}
            </button>
            <button type="button" className="juego__btn" onClick={() => begin("toque")} disabled={loading}>
              Jugar con el dedo o el mouse
            </button>
            <button type="button" className="juego__btn juego__btn--ghost" onClick={() => say("Hola. Así suena la voz guía. Puede cambiar la velocidad en los ajustes.")}>
              Probar la voz
            </button>
          </div>
          <p className="juego__privacy">La cámara se procesa en este dispositivo. No se graba ni se envía nada.</p>
        </main>
      )}

      <div
        ref={stage}
        className={`juego__stage ${screen === "inicio" ? "is-hidden" : ""} ${input === "camara" ? "has-video" : ""}`}
        onPointerDown={onPointer}
        onPointerMove={onPointer}
        onPointerUp={onPointer}
        onPointerLeave={onPointer}
        onPointerCancel={onPointer}
      >
        <video ref={video} className="juego__video" playsInline muted aria-hidden="true" />
        <canvas ref={canvas} className="juego__canvas" aria-hidden="true" />

        {screen !== "inicio" && (
          <>
            <header className="juego__hud">
              <p className="juego__nivel">
                Nivel {levelIndex + 1} de {LEVELS.length} · <strong>{level.title}</strong>
              </p>
              <p className="juego__cuenta" aria-live="polite">
                {Math.min(count, level.goal)} / {level.goal} {level.unit}
              </p>
            </header>

            <p className="juego__caption" aria-live="polite">
              {caption}
            </p>

            <nav className="juego__controles" aria-label="Controles">
              <button type="button" className="juego__btn" onClick={() => speak(intro(levelIndex))}>
                🔊 Repetir
              </button>
              <button type="button" className="juego__btn" onClick={togglePause} aria-pressed={paused}>
                {paused ? "▶ Seguir" : "⏸ Pausa"}
              </button>
              {screen === "jugando" && levelIndex < LEVELS.length - 1 && (
                <button type="button" className="juego__btn juego__btn--ghost" onClick={() => startLevel(levelIndex + 1)}>
                  Saltar nivel
                </button>
              )}
              <button type="button" className="juego__btn juego__btn--ghost" onClick={exit}>
                Salir
              </button>
            </nav>

            {screen === "pausa-nivel" && (
              <div className="juego__modal" role="dialog" aria-modal="true" aria-labelledby="nivel-ok">
                <p className="juego__eyebrow">¡Nivel {levelIndex + 1} completado!</p>
                <h2 id="nivel-ok">Muy bien hecho.</h2>
                <p>Tiempo: {fmt(times[levelIndex] ?? 0)}. Descanse lo que necesite.</p>
                <button type="button" className="juego__btn juego__btn--main" autoFocus onClick={() => startLevel(levelIndex + 1)}>
                  Siguiente nivel: {LEVELS[levelIndex + 1]?.title} →
                </button>
              </div>
            )}

            {screen === "fin" && (
              <div className="juego__modal" role="dialog" aria-modal="true" aria-labelledby="fin">
                <p className="juego__eyebrow">Sesión terminada</p>
                <h2 id="fin">¡Excelente trabajo!</h2>
                <ul className="juego__resumen">
                  {LEVELS.map((l, i) => (
                    <li key={l.kind}>
                      <span>{l.title}</span>
                      <span>{times[i] ? fmt(times[i]) : "—"}</span>
                    </li>
                  ))}
                  <li className="is-total">
                    <span>Total</span>
                    <span>{fmt(total)}</span>
                  </li>
                </ul>
                <p className="juego__privacy">Estos tiempos no se guardan. Puede anotarlos para comparar otro día.</p>
                <div className="juego__start">
                  <button type="button" className="juego__btn juego__btn--main" autoFocus onClick={() => startLevel(0)}>
                    Jugar otra vez
                  </button>
                  <button type="button" className="juego__btn juego__btn--ghost" onClick={exit}>
                    Volver al inicio
                  </button>
                </div>
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
}
