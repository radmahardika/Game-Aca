// Njajan Fest — efek suara & musik latar lembut (WebAudio, tanpa file)
let ctx = null, master = null, musicGain = null, muted = false, musicTimer = null;
export function unlock() {
  if (!ctx) {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
    ctx = new AC(); master = ctx.createGain(); master.gain.value = muted ? 0 : 0.7; master.connect(ctx.destination);
    musicGain = ctx.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
  }
  if (ctx.state === 'suspended') ctx.resume();
}
export function setMuted(m) { muted = m; if (master) master.gain.value = m ? 0 : 0.7; }
export function isMuted() { return muted; }
function tone(f, t0, dur, type = 'triangle', vol = 0.25, dest) {
  if (!ctx) return;
  const o = ctx.createOscillator(), g = ctx.createGain();
  o.type = type; o.frequency.value = f;
  g.gain.setValueAtTime(0.0001, t0); g.gain.exponentialRampToValueAtTime(vol, t0 + 0.015); g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  o.connect(g); g.connect(dest || master); o.start(t0); o.stop(t0 + dur + 0.05);
}
const SFX = {
  tap: [[660, 0, 0.08]],
  place: [[392, 0, 0.12], [587, 0.07, 0.16]],
  remove: [[440, 0, 0.1], [330, 0.07, 0.14]],
  coin: [[988, 0, 0.08, 'square', 0.12], [1319, 0.06, 0.16, 'square', 0.12]],
  bad: [[300, 0, 0.18, 'sawtooth', 0.12], [240, 0.12, 0.22, 'sawtooth', 0.12]],
  alert: [[880, 0, 0.1], [880, 0.16, 0.1]],
  good: [[523, 0, 0.1], [659, 0.08, 0.1], [784, 0.16, 0.18]],
  jurus: [[523, 0, 0.1], [784, 0.07, 0.1], [1047, 0.14, 0.1], [1568, 0.21, 0.3]],
  star: [[784, 0, 0.12], [988, 0.1, 0.12], [1175, 0.2, 0.3]],
  boat: [[196, 0, 0.25, 'sine', 0.2]],
};
export function sfx(name) {
  if (!ctx || muted) return;
  const t = ctx.currentTime;
  for (const [f, d, dur, type, vol] of SFX[name] || []) tone(f, t + d, dur, type || 'triangle', vol || 0.22);
}
// musik: pola pentatonik santai ala marimba
const MEL = [0, 2, 4, 7, 4, 2, 9, 7, 4, 2, 0, 2, 4, 4, 2, -1];
const BASS = [0, 0, -5, -5, -3, -3, -5, -5];
export function music(on) {
  if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
  if (!on || !ctx) return;
  let step = 0;
  const beat = 0.32, base = 392;
  const f = n => base * Math.pow(2, n / 12);
  const play = () => {
    if (!ctx || muted) { step++; return; }
    const t = ctx.currentTime + 0.05;
    const n = MEL[step % MEL.length];
    if (n >= 0 && step % 16 !== 15) tone(f(n), t, 0.35, 'sine', 0.5, musicGain);
    if (step % 2 === 0) tone(f(BASS[(step / 2) % BASS.length] - 12), t, 0.5, 'triangle', 0.45, musicGain);
    step++;
  };
  musicTimer = setInterval(play, beat * 1000);
}
