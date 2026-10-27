// Tiny chiptune sequencer on Web Audio. Steps are eighth notes; '-' rest, '~' sustains the previous note.
const SONGS = {
  theme: { bpm: 92, voices: [
    ['square', 0.07, 'E4 G4 A4 ~ G4 ~ E4 ~ D4 E4 D4 ~ C4 ~ ~ ~ E4 G4 A4 ~ C5 ~ A4 ~ G4 ~ E4 ~ D4 ~ ~ ~ C4 E4 G4 ~ A4 ~ G4 ~ E4 D4 C4 ~ D4 ~ ~ ~ E4 G4 A4 ~ C5 ~ B4 ~ A4 ~ G4 ~ ~ ~ - -'],
    ['square', 0.05, 'C3 - G3 - C3 - G3 - A2 - E3 - A2 - E3 - F2 - C3 - F2 - C3 - G2 - D3 - G2 - D3 - C3 - G3 - C3 - G3 - A2 - E3 - A2 - E3 - F2 - C3 - F2 - C3 - G2 - D3 - G2 - B2 -'],
    ['triangle', 0.09, 'C4 ~ ~ ~ ~ ~ ~ ~ A3 ~ ~ ~ ~ ~ ~ ~ F3 ~ ~ ~ ~ ~ ~ ~ G3 ~ ~ ~ ~ ~ ~ ~ C4 ~ ~ ~ ~ ~ ~ ~ A3 ~ ~ ~ ~ ~ ~ ~ F3 ~ ~ ~ ~ ~ ~ ~ G3 ~ ~ ~ ~ ~ ~ ~'],
  ] },
  puzzle: { bpm: 120, voices: [
    ['square', 0.06, 'E4 - E4 - F4 - E4 - D4 - D4 - E4 - C4 - E4 - E4 - F4 - G4 - F4 - E4 - D4 - - -'],
    ['square', 0.05, 'A2 - A2 - A2 - A2 - F2 - F2 - F2 - F2 - A2 - A2 - A2 - A2 - E2 - E2 - E2 - E2 -'],
  ] },
};
const BLIPS = {
  blip: [['square', 0.04, [[880, 0.05]]]],
  ding: [['triangle', 0.12, [[1319, 0.25], [1568, 0.4]]]],
  solved: [['square', 0.06, [[523, 0.1], [659, 0.1], [784, 0.1], [1047, 0.3]]]],
  pinball: [['square', 0.05, [[1200, 0.05], [900, 0.05], [1500, 0.05], [700, 0.05], [1800, 0.05], [1000, 0.05], [2000, 0.1]]]],
};
const freq = (n) => 440 * 2 ** (('C-D-EF-G-A-B'.indexOf(n[0]) + (n[1] === '#' ? 1 : 0) + 12 * (+n[n.length - 1] + 1) - 69) / 12);

let ctx, master, song, step = 0, next = 0, want = 'theme';
function init() {
  if (ctx) return;
  ctx = new AudioContext(); master = ctx.createGain(); master.gain.value = 1; master.connect(ctx.destination);
  setInterval(schedule, 50);
}
function tone(type, gain, f, t, dur) {
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(gain, t); g.gain.setTargetAtTime(0, t + dur - 0.03, 0.02);
  o.connect(g).connect(master); o.start(t); o.stop(t + dur + 0.05);
}
function schedule() {
  if (!song) return;
  const dt = 30 / song.bpm;
  if (next < ctx.currentTime) next = ctx.currentTime; // a throttled tab must not replay every missed note at once
  while (next < ctx.currentTime + 0.15) {
    for (const [type, gain, notes] of song.parts) {
      const n = notes[step % notes.length];
      if (n === '-' || n === '~') continue;
      let len = 1; while (notes[(step + len) % notes.length] === '~') len++;
      tone(type, gain, freq(n), next, len * dt);
    }
    next += dt; step++;
  }
}
export function play(name) {
  want = name;
  if (!ctx) return;
  const s = SONGS[name]; song = { bpm: s.bpm, parts: s.voices.map(([t, g, str]) => [t, g, str.split(' ')]) };
  step = 0; next = ctx.currentTime + 0.05;
}
// "alien:<seed>": a warbling sawtooth that swoops up and down, plus computer-clutter chirps. The seed picks
// the pitches, so the same name always sounds the same.
function alien(seed) {
  let h = 7; for (const ch of seed) h = (h * 31 + ch.codePointAt(0)) >>> 0;
  const rnd = () => ((h = (h * 1103515245 + 12345) >>> 0) / 2 ** 32);
  const t = ctx.currentTime, o = ctx.createOscillator(), g = ctx.createGain(), lfo = ctx.createOscillator(), lg = ctx.createGain();
  o.type = 'sawtooth';
  o.frequency.setValueAtTime(160 + rnd() * 200, t);
  o.frequency.exponentialRampToValueAtTime(600 + rnd() * 700, t + 0.3);
  o.frequency.exponentialRampToValueAtTime(90 + rnd() * 120, t + 0.85);
  lfo.frequency.value = 12 + rnd() * 20; lg.gain.value = 40 + rnd() * 60;
  lfo.connect(lg).connect(o.frequency);
  g.gain.setValueAtTime(0.05, t); g.gain.setTargetAtTime(0, t + 0.8, 0.05);
  o.connect(g).connect(master); o.start(t); lfo.start(t); o.stop(t + 1.1); lfo.stop(t + 1.1);
  for (let i = 0; i < 7; i++) tone('square', 0.025, 300 + rnd() * 2600, t + 0.05 + i * 0.11, 0.04 + rnd() * 0.04);
}
export function blip(name) {
  if (ctx && name.startsWith('alien')) return alien(name);
  if (!ctx || !BLIPS[name]) return;
  let t = ctx.currentTime;
  for (const [type, gain, seq] of BLIPS[name]) { t = ctx.currentTime; for (const [f, d] of seq) { tone(type, gain, f, t, d); t += d; } }
}
// Music waits for the player: the first key only unlocks audio for sound effects, M starts and stops the music.
// A touch pointerdown is not a user gesture for audio, so the context can start suspended; resume() inside a
// pointerup/keydown fixes that (main.js calls unlock on pointerup).
export function unlock() { if (!ctx) init(); if (ctx.state !== 'running') ctx.resume().catch(() => {}); }
let musicOn = false;
export function onKey(k) {
  unlock();
  if (k === 'M') { musicOn = !musicOn; if (musicOn) play(want); else song = null; }
  else if (SONGS[k]) { want = k; if (musicOn) play(k); }
  else blip(k);
}
