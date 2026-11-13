import * as THREE from "three";
import { starShape } from "./handScene";
import { EMPTY_FACE, type FaceInput } from "./faceTracker";

/** Corona de estrellas 3D sobre la cabeza + lluvia de estrellas al abrir la boca. */

export interface FaceScene {
  setInput: (input: FaceInput) => void;
  resize: () => void;
  dispose: () => void;
}

const ORBIT = 6;
const POOL = 160;

export function createFaceScene(canvas: HTMLCanvasElement): FaceScene {
  const renderer = new THREE.WebGLRenderer({ canvas, alpha: true, antialias: true });
  renderer.setPixelRatio(Math.min(window.devicePixelRatio, 2));
  renderer.setClearColor(0x000000, 0);

  const scene = new THREE.Scene();
  const camera = new THREE.OrthographicCamera(-1, 1, 1, -1, 0.1, 10);
  camera.position.z = 5;
  scene.add(new THREE.AmbientLight(0xffffff, 0.7));
  const key = new THREE.DirectionalLight(0xffd9e2, 2.2);
  key.position.set(2, 3, 4);
  scene.add(key);
  const rim = new THREE.PointLight(0xa32150, 18, 8);
  rim.position.set(-2, -1, 2);
  scene.add(rim);

  const geometry = new THREE.ExtrudeGeometry(starShape(0.34, 0.075), {
    depth: 0.12,
    bevelEnabled: true,
    bevelThickness: 0.07,
    bevelSize: 0.05,
    bevelSegments: 5,
    curveSegments: 10,
  });
  geometry.center();
  const material = new THREE.MeshStandardMaterial({
    color: 0xa32150,
    roughness: 0.28,
    metalness: 0.15,
    emissive: 0x4a0a1b,
    emissiveIntensity: 0.6,
  });

  const crown = new THREE.Mesh(geometry, material);
  scene.add(crown);
  const orbiters = Array.from({ length: ORBIT }, () => {
    const m = new THREE.Mesh(geometry, material);
    scene.add(m);
    return m;
  });

  // Partículas (pool fijo, sin asignaciones por frame)
  const pos = new Float32Array(POOL * 3);
  const vel = new Float32Array(POOL * 2);
  const life = new Float32Array(POOL);
  const pGeo = new THREE.BufferGeometry();
  pGeo.setAttribute("position", new THREE.BufferAttribute(pos, 3));
  const pMat = new THREE.PointsMaterial({
    color: 0xf6c1ce,
    size: 9 * Math.min(window.devicePixelRatio, 2),
    sizeAttenuation: false,
    transparent: true,
    opacity: 0.95,
    depthWrite: false,
  });
  const points = new THREE.Points(pGeo, pMat);
  points.frustumCulled = false;
  scene.add(points);
  for (let i = 0; i < POOL; i++) pos[i * 3 + 2] = -100;

  const input: FaceInput = { ...EMPTY_FACE };
  const cur = new THREE.Vector2(0, 0);
  let scale = 0.001;
  let aspect = 1;
  let orbit = 0;
  let spawn = 0;
  let cursor = 0;
  let frame = 0;
  const wine = new THREE.Color(0xa32150);
  const rose = new THREE.Color(0xf6c1ce);

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.left = -aspect;
    camera.right = aspect;
    camera.updateProjectionMatrix();
  };
  resize();

  const toWorld = (nx: number, ny: number): [number, number] => [(nx - 0.5) * 2 * aspect, -(ny - 0.5) * 2];

  let last = performance.now();
  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    const [tx, ty] = toWorld(input.x, input.y);
    const follow = 1 - Math.pow(0.0003, dt);
    cur.x += (tx - cur.x) * follow;
    cur.y += (ty - cur.y) * follow;

    const base = input.size * 1.9; // proporcional al rostro
    const target = input.visible ? base * (1 + input.mouth * 0.35) : 0.001;
    scale += (target - scale) * (1 - Math.pow(0.001, dt));

    crown.position.set(cur.x, cur.y, 0);
    crown.scale.setScalar(scale);
    crown.rotation.set(-input.pitch * 1.4, input.yaw * 3, input.roll);

    orbit += dt * (1.1 + input.mouth * 5);
    orbiters.forEach((m, i) => {
      const a = orbit + (i / ORBIT) * Math.PI * 2;
      const r = scale * 0.8;
      m.position.set(cur.x + Math.cos(a) * r * 1.6, cur.y + Math.sin(a) * r * 0.6, Math.sin(a) * 0.5);
      m.scale.setScalar(scale * 0.32);
      m.rotation.set(a, a * 1.3, 0);
    });

    material.color.lerp(input.smile > 0.45 ? rose : wine, 0.15);

    // Lluvia de estrellas desde la boca
    if (input.visible && input.mouth > 0.45) {
      spawn += dt * 90 * input.mouth;
      const [mx, my] = toWorld(input.mx, input.my);
      while (spawn >= 1) {
        spawn -= 1;
        const i = cursor++ % POOL;
        pos[i * 3] = mx;
        pos[i * 3 + 1] = my;
        pos[i * 3 + 2] = 0;
        const ang = Math.random() * Math.PI * 2;
        const sp = 0.4 + Math.random() * 1.1;
        vel[i * 2] = Math.cos(ang) * sp;
        vel[i * 2 + 1] = Math.sin(ang) * sp + 0.3;
        life[i] = 1;
      }
    }
    for (let i = 0; i < POOL; i++) {
      if (life[i] <= 0) {
        pos[i * 3 + 2] = -100;
        continue;
      }
      life[i] -= dt * 0.9;
      vel[i * 2 + 1] -= dt * 1.6; // gravedad
      pos[i * 3] += vel[i * 2] * dt;
      pos[i * 3 + 1] += vel[i * 2 + 1] * dt;
    }
    pGeo.attributes.position.needsUpdate = true;

    renderer.render(scene, camera);
    frame = requestAnimationFrame(tick);
  };
  frame = requestAnimationFrame(tick);

  return {
    setInput(next) {
      Object.assign(input, next);
    },
    resize,
    dispose() {
      cancelAnimationFrame(frame);
      geometry.dispose();
      material.dispose();
      pGeo.dispose();
      pMat.dispose();
      renderer.dispose();
    },
  };
}
