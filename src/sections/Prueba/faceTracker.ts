/** Seguimiento de rostro con MediaPipe (modelo local, carga bajo demanda). */

export interface FaceInput {
  /** Posición de la corona (sobre la frente), 0..1 espejada. */
  x: number;
  y: number;
  /** Posición de la boca, 0..1 espejada. */
  mx: number;
  my: number;
  /** Ancho del rostro respecto al alto de la vista (~0.2–0.6). */
  size: number;
  yaw: number;
  pitch: number;
  roll: number;
  /** 0..1 */
  mouth: number;
  smile: number;
  /** Señales de expresión 0..1 (para el modo Emoción). */
  frown: number;
  browDown: number;
  browUp: number;
  eyeWide: number;
  visible: boolean;
}

export const EMPTY_FACE: FaceInput = {
  x: 0.5, y: 0.35, mx: 0.5, my: 0.6, size: 0.4, yaw: 0, pitch: 0, roll: 0, mouth: 0, smile: 0,
  frown: 0, browDown: 0, browUp: 0, eyeWide: 0, visible: false,
};

export type Fit = (x: number, y: number) => [number, number];

export interface FaceTracker {
  read: (video: HTMLVideoElement, now: number, fit: Fit) => FaceInput;
  close: () => void;
}

const MODEL = "/mediapipe/face_landmarker.task";
const WASM = "/mediapipe/wasm";

export async function createFaceTracker(): Promise<FaceTracker> {
  const { FilesetResolver, FaceLandmarker } = await import("@mediapipe/tasks-vision");
  const fileset = await FilesetResolver.forVisionTasks(WASM);
  const make = (delegate: "GPU" | "CPU") =>
    FaceLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL, delegate },
      runningMode: "VIDEO",
      numFaces: 1,
      outputFaceBlendshapes: true,
    });

  let landmarker: Awaited<ReturnType<typeof make>>;
  try {
    landmarker = await make("GPU");
  } catch {
    landmarker = await make("CPU");
  }

  let lastTime = -1;
  let state: FaceInput = EMPTY_FACE;
  const clamp = (v: number, a = 0, b = 1) => Math.min(b, Math.max(a, v));

  return {
    read(video, now, fit) {
      if (video.readyState < 2 || video.currentTime === lastTime) return state;
      lastTime = video.currentTime;
      const res = landmarker.detectForVideo(video, now);
      const f = res.faceLandmarks[0];
      if (!f) {
        state = { ...EMPTY_FACE, x: state.x, y: state.y };
        return state;
      }
      const left = f[234];
      const right = f[454];
      const nose = f[1];
      const brow = f[10];
      const chin = f[152];
      const width = Math.hypot(right.x - left.x, right.y - left.y) || 0.001;
      const height = Math.hypot(chin.x - brow.x, chin.y - brow.y) || 0.001;

      const cats = res.faceBlendshapes[0]?.categories ?? [];
      const score = (name: string) => cats.find((c) => c.categoryName === name)?.score ?? 0;
      const jaw = score("jawOpen");
      const smile = (score("mouthSmileLeft") + score("mouthSmileRight")) / 2;
      const frown = (score("mouthFrownLeft") + score("mouthFrownRight")) / 2;
      const browDown = (score("browDownLeft") + score("browDownRight")) / 2;
      const browUp = score("browInnerUp");
      const eyeWide = (score("eyeWideLeft") + score("eyeWideRight")) / 2;

      // Posiciones en pantalla (espejadas), corregidas por el recorte "cover" del video.
      const [cx, cy] = fit(1 - brow.x, brow.y - height * 0.28);
      const [mx, my] = fit(1 - (f[13].x + f[14].x) / 2, (f[13].y + f[14].y) / 2);

      // Giro del rostro desde los puntos (en coordenadas espejadas).
      const midX = (left.x + right.x) / 2;
      const yaw = clamp((midX - nose.x) / width, -0.5, 0.5);
      const pitch = clamp(((nose.y - (brow.y + chin.y) / 2) / height) * 2, -0.6, 0.6);
      const roll = Math.atan2(f[263].y - f[33].y, f[263].x - f[33].x);

      state = {
        x: cx,
        y: cy,
        mx,
        my,
        size: clamp(width * 1.0, 0.1, 0.9),
        yaw,
        pitch,
        roll,
        mouth: clamp(jaw * 1.6),
        smile: clamp(smile * 1.8),
        frown: clamp(frown * 2.5),
        browDown: clamp(browDown * 1.6),
        browUp: clamp(browUp * 1.4),
        eyeWide: clamp(eyeWide * 1.8),
        visible: true,
      };
      return state;
    },
    close() {
      landmarker.close();
    },
  };
}
