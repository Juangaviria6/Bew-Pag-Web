/** Voz con la Web Speech API (sin servidor). Busca la voz en español más natural disponible. */

let enabled = true;
let rate = 0.95;
let voice: SpeechSynthesisVoice | null = null;

const synth = () => (typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null);

/** Puntúa una voz: español latino y voces "naturales"/neuronales primero. */
function score(v: SpeechSynthesisVoice) {
  let s = 0;
  const lang = v.lang.toLowerCase();
  const name = v.name.toLowerCase();
  if (!lang.startsWith("es")) return -1;
  if (lang === "es-co") s += 30;
  else if (["es-419", "es-mx", "es-us"].includes(lang)) s += 20;
  else s += 5;
  // Voces neuronales suenan mucho más humanas (Edge/Windows "Online (Natural)", Google, Apple "Premium/Enhanced").
  if (/natural|neural|online|premium|enhanced|mejorad/.test(name)) s += 40;
  if (/google/.test(name)) s += 15;
  // Voces conocidas cálidas
  if (/salome|gonzalo|dalia|paulina|sabina|monica|elvira|ximena/.test(name)) s += 10;
  if (v.localService === false) s += 3;
  return s;
}

function pickVoice() {
  const s = synth();
  if (!s) return;
  const ranked = s
    .getVoices()
    .map((v) => [score(v), v] as const)
    .filter(([sc]) => sc >= 0)
    .sort((a, b) => b[0] - a[0]);
  voice = ranked[0]?.[1] ?? null;
}

if (synth()) {
  pickVoice();
  synth()!.addEventListener?.("voiceschanged", pickVoice);
}

export const voiceAvailable = () => !!synth();
export const voiceName = () => voice?.name ?? "";

export function setVoice(opts: { enabled?: boolean; rate?: number }) {
  if (opts.enabled !== undefined) enabled = opts.enabled;
  if (opts.rate !== undefined) rate = opts.rate;
  if (!enabled) synth()?.cancel();
}

/**
 * Habla un texto. `interrupt` corta lo que esté diciendo (instrucciones);
 * sin interrumpir, se omite si ya está hablando (felicitaciones cortas).
 */
export function say(text: string, interrupt = true) {
  const s = synth();
  if (!s || !enabled) return;
  if (!interrupt && s.speaking) return;
  if (interrupt) s.cancel();
  if (!voice) pickVoice();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voice?.lang ?? "es-ES";
  if (voice) u.voice = voice;
  u.rate = rate;
  u.pitch = 1.08; // un poco más cálida
  u.volume = 1;
  s.speak(u);
}

export function stopVoice() {
  synth()?.cancel();
}
