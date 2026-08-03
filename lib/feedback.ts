/**
 * Hover tones + haptics.
 *
 * The reference site synthesises its dock/header blips with Web Audio rather
 * than shipping audio files, and taps `web-haptics` on touch. Same idea here,
 * minus the CDN dependency: one lazily-created AudioContext, a short enveloped
 * blip per surface, and navigator.vibrate for the tactile half.
 */

let ctx: AudioContext | null = null;
let muted = true;

export function isMuted() {
  return muted;
}

export function setMuted(next: boolean) {
  muted = next;
  if (!next) void resume();
}

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const Ctor =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!Ctor) return null;
    ctx = new Ctor();
  }
  return ctx;
}

async function resume() {
  const c = getCtx();
  if (c && c.state === "suspended") await c.resume();
}

type Surface = "dock" | "chip";

const VOICES: Record<Surface, { freq: number; type: OscillatorType; gain: number }> = {
  dock: { freq: 880, type: "sine", gain: 0.035 },
  chip: { freq: 620, type: "triangle", gain: 0.028 },
};

/** short blip; no-op while muted or before the user has opted in */
export function playTone(surface: Surface) {
  if (muted) return;
  const c = getCtx();
  if (!c || c.state !== "running") return;

  const { freq, type, gain } = VOICES[surface];
  const now = c.currentTime;

  const osc = c.createOscillator();
  const amp = c.createGain();

  osc.type = type;
  // a touch of detune per hit so repeated hovers don't feel mechanical
  osc.frequency.setValueAtTime(freq * (0.98 + Math.random() * 0.04), now);

  amp.gain.setValueAtTime(0, now);
  amp.gain.linearRampToValueAtTime(gain, now + 0.008);
  amp.gain.exponentialRampToValueAtTime(0.0001, now + 0.14);

  osc.connect(amp).connect(c.destination);
  osc.start(now);
  osc.stop(now + 0.16);
}

export function haptic(pattern: number | number[] = 8) {
  if (typeof navigator === "undefined" || !("vibrate" in navigator)) return;
  try {
    navigator.vibrate(pattern);
  } catch {
    /* some browsers throw when the page isn't user-activated yet */
  }
}
