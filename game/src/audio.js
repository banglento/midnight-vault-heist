// Tiny WebAudio bleeps, synthesised in code: no audio files, no network.
// One shared context, created lazily on the first user gesture or shot stage.

let context = null;

function audioContext() {
  if (context === null) {
    const Ctor = window.AudioContext || window.webkitAudioContext;
    if (!Ctor) return null;
    context = new Ctor();
  }
  if (context.state === 'suspended') context.resume();
  return context;
}

function blip(frequency, duration, type, volume, slideTo) {
  const ctx = audioContext();
  if (ctx === null) return;
  const osc = ctx.createOscillator();
  const gain = ctx.createGain();
  const now = ctx.currentTime;
  osc.type = type;
  osc.frequency.setValueAtTime(frequency, now);
  if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, now + duration);
  gain.gain.setValueAtTime(volume, now);
  gain.gain.exponentialRampToValueAtTime(0.0001, now + duration);
  osc.connect(gain).connect(ctx.destination);
  osc.start(now);
  osc.stop(now + duration);
}

export function soundStep() { blip(190, 0.05, 'triangle', 0.03); }
export function soundLoot() { blip(880, 0.16, 'sine', 0.12, 1320); }
export function soundSpotted() { blip(220, 0.14, 'square', 0.08, 160); }
export function soundWin() { blip(523, 0.35, 'sine', 0.12, 1046); }
export function soundCaught() { blip(320, 0.45, 'sawtooth', 0.10, 70); }
export function soundClick() { blip(660, 0.07, 'sine', 0.08); }
