'use strict';
/* Efek suara, musik, dan suara pembaca dialog (Web Audio + Speech Synthesis). */
const Sound = (() => {
  let ac = null, master, sfxG, musG, musicTimer = null, musicKind = null;
  const st = { voice: true, sfx: true, music: true };

  function init() {
    if (ac) return;
    try {
      ac = new (window.AudioContext || window.webkitAudioContext)();
      master = ac.createGain(); master.gain.value = 0.8; master.connect(ac.destination);
      sfxG = ac.createGain(); sfxG.gain.value = 0.55; sfxG.connect(master);
      musG = ac.createGain(); musG.gain.value = 0.16; musG.connect(master);
    } catch (e) { ac = null; }
  }
  function resume() { init(); if (ac && ac.state === 'suspended') ac.resume().catch(() => {}); }

  function tone(freq, dur, type = 'square', vol = 0.3, when = 0, slide = null, dest = null) {
    if (!ac) return;
    const t = ac.currentTime + when;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(freq, t);
    if (slide) o.frequency.exponentialRampToValueAtTime(slide, t + dur);
    g.gain.setValueAtTime(0.0001, t);
    g.gain.exponentialRampToValueAtTime(vol, t + 0.01);
    g.gain.exponentialRampToValueAtTime(0.0001, t + dur);
    o.connect(g); g.connect(dest || sfxG); o.start(t); o.stop(t + dur + 0.05);
  }
  function noise(dur, vol = 0.3, when = 0, hp = 800) {
    if (!ac) return;
    const t = ac.currentTime + when, len = Math.max(1, Math.floor(ac.sampleRate * dur));
    const buf = ac.createBuffer(1, len, ac.sampleRate), d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / len);
    const s = ac.createBufferSource(); s.buffer = buf;
    const f = ac.createBiquadFilter(); f.type = 'highpass'; f.frequency.value = hp;
    const g = ac.createGain(); g.gain.value = vol;
    s.connect(f); f.connect(g); g.connect(sfxG); s.start(t);
  }
  const fx = {
    tap() { tone(700, 0.05, 'square', 0.1); },
    step() { tone(200, 0.05, 'triangle', 0.14); },
    whoosh() { noise(0.18, 0.22, 0, 2200); },
    hit() { noise(0.12, 0.4, 0, 300); tone(150, 0.15, 'square', 0.22, 0, 60); },
    kick() { noise(0.1, 0.3, 0, 1500); tone(320, 0.12, 'square', 0.2, 0.04, 90); },
    heal() { [523, 659, 784, 1046].forEach((f, i) => tone(f, 0.16, 'sine', 0.22, i * 0.07)); },
    spicy() { noise(0.55, 0.25, 0, 3000); tone(200, 0.45, 'sawtooth', 0.1, 0, 650); },
    power() { [392, 523, 659, 784, 1046].forEach((f, i) => tone(f, 0.13, 'square', 0.14, i * 0.06)); },
    faint() { tone(520, 0.55, 'triangle', 0.24, 0, 110); },
    dodge() { tone(900, 0.08, 'sine', 0.2); tone(1250, 0.08, 'sine', 0.2, 0.06); },
    win() { [523, 523, 659, 784, 0, 659, 784, 1046].forEach((f, i) => f && tone(f, 0.18, 'square', 0.16, i * 0.12)); },
    lose() { [392, 349, 330, 262].forEach((f, i) => tone(f, 0.32, 'triangle', 0.22, i * 0.25)); },
    turn() { tone(440, 0.1, 'square', 0.14); tone(660, 0.16, 'square', 0.14, 0.1); },
    enemy() { tone(330, 0.12, 'sawtooth', 0.1); tone(247, 0.2, 'sawtooth', 0.1, 0.12); },
    shield() { tone(300, 0.2, 'triangle', 0.25); tone(600, 0.25, 'sine', 0.15, 0.05); },
    roar() { noise(0.6, 0.32, 0, 150); tone(110, 0.6, 'sawtooth', 0.18, 0, 70); },
    coin() { tone(988, 0.07, 'square', 0.12); tone(1319, 0.14, 'square', 0.12, 0.07); },
    throw() { tone(500, 0.25, 'sine', 0.12, 0, 900); },
  };
  function play(n) { if (!st.sfx || !ac) return; try { fx[n] && fx[n](); } catch (e) {} }

  const SONGS = {
    calm: { bpm: 112, mel: [0, 2, 4, 2, 5, 4, 2, null, 4, 5, 7, 5, 4, 2, 0, null], bass: [0, 0, 3, 3, 4, 4, 0, 0] },
    adventure: { bpm: 128, mel: [4, null, 4, 5, 7, null, 5, 4, 2, null, 2, 4, 5, 4, 2, null], bass: [0, 0, 5, 5, 3, 3, 4, 4] },
    boss: { bpm: 150, mel: [0, 1, 0, null, 3, 1, 0, null, 0, 1, 3, 4, 3, 1, 0, null], bass: [0, 0, 0, 0, 1, 1, 0, 0], minor: true },
  };
  function startMusic(kind) {
    if (musicKind === kind && musicTimer) return;
    stopMusic(); musicKind = kind;
    if (!st.music || !ac) return;
    const s = SONGS[kind] || SONGS.calm;
    const scale = s.minor ? [220, 247, 262, 294, 330, 349, 392, 440] : [262, 294, 330, 392, 440, 523, 587, 659];
    const dt = 60 / s.bpm / 2; let step = 0;
    musicTimer = setInterval(() => {
      if (!st.music) return;
      const n = s.mel[step % s.mel.length];
      if (n != null) tone(scale[n], dt * 0.9, 'triangle', 0.5, 0, null, musG);
      if (step % 2 === 0) { const b = s.bass[(step / 2) % s.bass.length]; tone(scale[b] / 2, dt * 1.8, 'sine', 0.7, 0, null, musG); }
      step++;
    }, dt * 1000);
  }
  function stopMusic() { if (musicTimer) clearInterval(musicTimer); musicTimer = null; musicKind = null; }

  let voices = [];
  function loadVoices() { try { voices = speechSynthesis.getVoices() || []; } catch (e) {} }
  if ('speechSynthesis' in window) { loadVoices(); try { speechSynthesis.onvoiceschanged = loadVoices; } catch (e) {} }
  function clean(t) { return String(t).replace(/[\u{1F000}-\u{1FFFF}☀-➿⬀-⯿️‍]/gu, '').replace(/[*_]/g, ''); }
  function speak(text, pitch = 1, rate = 1) {
    if (!st.voice || !('speechSynthesis' in window)) return;
    try {
      speechSynthesis.cancel();
      const u = new SpeechSynthesisUtterance(clean(text));
      u.lang = 'id-ID';
      const v = voices.find(v => /^id/i.test(v.lang)) || voices.find(v => /indones/i.test(v.name));
      if (v) u.voice = v;
      u.pitch = Math.max(0, Math.min(2, pitch)); u.rate = rate;
      speechSynthesis.speak(u);
    } catch (e) {}
  }
  function hush() { try { speechSynthesis.cancel(); } catch (e) {} }

  return { st, resume, play, startMusic, stopMusic, speak, hush, get kind() { return musicKind; } };
})();
