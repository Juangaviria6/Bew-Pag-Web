import type { StarInput } from "./handScene";
import type { Fit } from "./faceTracker";

/** Detección de una mano con MediaPipe (se carga solo cuando el usuario activa la cámara). */

const MODEL = "/mediapipe/hand_landmarker.task";
const WASM = "/mediapipe/wasm";

type Point = { x: number; y: number };
const dist = (a: Point, b: Point) => Math.hypot(a.x - b.x, a.y - b.y);

export interface HandTracker {
  read: (video: HTMLVideoElement, now: number, fit?: Fit) => StarInput;
  close: () => void;
}

export async function createHandTracker(): Promise<HandTracker> {
  const { FilesetResolver, HandLandmarker } = await import("@mediapipe/tasks-vision");
  const fileset = await FilesetResolver.forVisionTasks(WASM);

  const make = (delegate: "GPU" | "CPU") =>
    HandLandmarker.createFromOptions(fileset, {
      baseOptions: { modelAssetPath: MODEL, delegate },
      runningMode: "VIDEO",
      numHands: 1,
    });

  let landmarker: Awaited<ReturnType<typeof make>>;
  try {
    landmarker = await make("GPU");
  } catch {
    landmarker = await make("CPU");
  }

  let lastTime = -1;
  let pinched = false;
  let state: StarInput = { x: 0.5, y: 0.5, angle: 0, pinch: false, visible: false };

  return {
    read(video, now, fit) {
      if (video.readyState < 2 || video.currentTime === lastTime) return state;
      lastTime = video.currentTime;
      const hand = landmarker.detectForVideo(video, now).landmarks[0];
      if (!hand) {
        pinched = false;
        state = { ...state, visible: false, pinch: false };
        return state;
      }
      const wrist = hand[0];
      const palm = hand[9];
      const ratio = dist(hand[4], hand[8]) / (dist(wrist, palm) || 0.001);
      // Histéresis: se activa bajo 0.35 y se suelta sobre 0.55.
      pinched = pinched ? ratio < 0.55 : ratio < 0.35;
      const [px, py] = (fit ?? ((x, y) => [x, y] as [number, number]))(1 - (palm.x + hand[8].x) / 2, (palm.y + hand[8].y) / 2);
      state = {
        x: px, // espejo
        y: py,
        angle: Math.atan2(1 - palm.x - (1 - wrist.x), wrist.y - palm.y),
        pinch: pinched,
        visible: true,
      };
      return state;
    },
    close() {
      landmarker.close();
    },
  };
}
