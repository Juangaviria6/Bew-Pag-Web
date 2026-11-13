import * as THREE from "three";

/** Escena 3D transparente: una estrella de 4 puntas (vino/rosa) que sigue una posición normalizada. */

export interface StarInput {
  /** 0..1, ya espejado (izquierda→derecha como lo ve el usuario). `null` = sin mano. */
  x: number;
  y: number;
  /** Ángulo de la mano en radianes (0 = apuntando arriba). */
  angle: number;
  /** Pellizco: pulgar e índice juntos. */
  pinch: boolean;
  visible: boolean;
}

export interface StarScene {
  setInput: (input: StarInput) => void;
  resize: () => void;
  dispose: () => void;
}

export function starShape(outer: number, inner: number) {
  const s = new THREE.Shape();
  const points = 4;
  for (let i = 0; i < points * 2; i++) {
    const r = i % 2 === 0 ? outer : inner;
    const a = (Math.PI / points) * i - Math.PI / 2;
    const x = Math.cos(a) * r;
    const y = Math.sin(a) * r;
    if (i === 0) s.moveTo(x, y);
    else s.lineTo(x, y);
  }
  s.closePath();
  return s;
}

export function createStarScene(canvas: HTMLCanvasElement): StarScene {
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
    bevelSegments: 6,
    curveSegments: 12,
  });
  geometry.center();
  const material = new THREE.MeshStandardMaterial({
    color: 0xa32150,
    roughness: 0.28,
    metalness: 0.15,
    emissive: 0x4a0a1b,
    emissiveIntensity: 0.6,
  });
  const star = new THREE.Mesh(geometry, material);
  scene.add(star);

  const ringGeo = new THREE.RingGeometry(0.46, 0.475, 64);
  const ringMat = new THREE.MeshBasicMaterial({ color: 0xf6c1ce, transparent: true, opacity: 0.0 });
  const ring = new THREE.Mesh(ringGeo, ringMat);
  scene.add(ring);

  const input: StarInput = { x: 0.5, y: 0.5, angle: 0, pinch: false, visible: false };
  const pos = new THREE.Vector2(0, 0);
  let scale = 0.001;
  let spin = 0;
  let aspect = 1;
  let frame = 0;
  const colorWine = new THREE.Color(0xa32150);
  const colorRose = new THREE.Color(0xf6c1ce);

  const resize = () => {
    const w = canvas.clientWidth || 1;
    const h = canvas.clientHeight || 1;
    renderer.setSize(w, h, false);
    aspect = w / h;
    camera.left = -aspect;
    camera.right = aspect;
    camera.top = 1;
    camera.bottom = -1;
    camera.updateProjectionMatrix();
  };
  resize();

  let last = performance.now();
  const tick = (now: number) => {
    const dt = Math.min((now - last) / 1000, 0.05);
    last = now;

    const tx = (input.x - 0.5) * 2 * aspect;
    const ty = -(input.y - 0.5) * 2;
    const follow = 1 - Math.pow(0.0005, dt); // suavizado independiente del fps
    pos.x += (tx - pos.x) * follow;
    pos.y += (ty - pos.y) * follow;

    const targetScale = !input.visible ? 0.001 : input.pinch ? 0.75 : 1.25;
    scale += (targetScale - scale) * (1 - Math.pow(0.001, dt));

    spin += dt * (input.pinch ? 5 : 1.4);
    star.position.set(pos.x, pos.y, 0);
    star.scale.setScalar(scale);
    star.rotation.set(Math.sin(spin * 0.7) * 0.35, spin, -input.angle * 0.6);

    ring.position.copy(star.position);
    ring.scale.setScalar(scale * (input.pinch ? 1.15 : 1.5));
    ringMat.opacity += ((input.visible ? (input.pinch ? 0.9 : 0.35) : 0) - ringMat.opacity) * 0.2;

    material.color.lerp(input.pinch ? colorRose : colorWine, 0.2);

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
      ringGeo.dispose();
      ringMat.dispose();
      renderer.dispose();
    },
  };
}
