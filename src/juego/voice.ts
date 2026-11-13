/** Voz con la Web Speech API (sin servidor). Prefiere una voz en español. */

let enabled = true;
let rate = 0.9;
let voice: SpeechSynthesisVoice | null = null;

const synth = () => (typeof window !== "undefined" && "speechSynthesis" in window ? window.speechSynthesis : null);

function pickVoice() {
  const s = synth();
  if (!s) return;
  const voices = s.getVoices();
  voice =
    voices.find((v) => v.lang === "es-CO") ??
    voices.find((v) => v.lang === "es-419" || v.lang === "es-MX" || v.lang === "es-US") ??
    voices.find((v) => v.lang.startsWith("es")) ??
    null;
}

if (synth()) {
  pickVoice();
  synth()!.addEventListener?.("voiceschanged", pickVoice);
}

export const voiceAvailable = () => !!synth();

export function setVoice(opts: { enabled?: boolean; rate?: number }) {
  if (opts.enabled !== undefined) enabled = opts.enabled;
  if (opts.rate !== undefined) rate = opts.rate;
  if (!enabled) synth()?.cancel();
}

/**
 * Habla un texto. `interrupt` corta lo que esté diciendo (para instrucciones);
 * sin interrumpir, se omite si ya está hablando (para felicitaciones cortas).
 */
export function say(text: string, interrupt = true) {
  const s = synth();
  if (!s || !enabled) return;
  if (!interrupt && s.speaking) return;
  if (interrupt) s.cancel();
  const u = new SpeechSynthesisUtterance(text);
  u.lang = voice?.lang ?? "es-ES";
  if (voice) u.voice = voice;
  u.rate = rate;
  u.pitch = 1;
  s.speak(u);
}

export function stopVoice() {
  synth()?.cancel();
}
