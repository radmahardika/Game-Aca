// Efek suara chiptune (WebAudio) dan narasi suara Bahasa Indonesia (Web Speech).
(function () {
  const G = (window.G = window.G || {});
  let ac = null;

  G.audioUnlock = function () {
    try {
      if (!ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (AC) ac = new AC();
      }
      if (ac && ac.state === 'suspended') ac.resume();
    } catch (e) {}
  };

  const on = () => ac && G.save && G.save.sfx;

  function tone(freq, dur, type = 'square', vol = 0.07, when = 0, slide = 0) {
    if (!on()) return;
    const t0 = ac.currentTime + when;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.linearRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(ac.destination);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  function noise(dur, vol = 0.05, when = 0, freq = 1500) {
    if (!on()) return;
    const t0 = ac.currentTime + when;
    const len = Math.floor(ac.sampleRate * dur);
    const buf = ac.createBuffer(1, len, ac.sampleRate);
    const d = buf.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = Math.random() * 2 - 1;
    const src = ac.createBufferSource();
    src.buffer = buf;
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(vol, t0 + 0.05);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(ac.destination);
    src.start(t0);
  }

  G.sfx = {
    tap: () => tone(660, 0.06, 'square', 0.04),
    correct: () => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'square', 0.06, i * 0.08)),
    wrong: () => { tone(330, 0.14, 'triangle', 0.12); tone(262, 0.22, 'triangle', 0.12, 0.14); },
    spray: () => noise(0.8, 0.07, 0, 1800),
    splash: () => noise(0.25, 0.06, 0, 900),
    pop: () => tone(500, 0.1, 'square', 0.05, 0, 500),
    step: () => tone(392, 0.07, 'square', 0.06),
    count: (n) => tone(330 + n * 25, 0.09, 'square', 0.05),
    laugh: () => [0, 0.12, 0.24].forEach((w) => tone(700, 0.08, 'sawtooth', 0.03, w, -200)),
    meow: () => tone(700, 0.3, 'triangle', 0.08, 0, 300),
    siren: () => [0, 1, 2, 3].forEach((i) => tone(i % 2 ? 660 : 880, 0.25, 'triangle', 0.06, i * 0.25)),
    win: () => {
      const seq = [523, 659, 784, 659, 784, 1047];
      seq.forEach((f, i) => tone(f, 0.18, 'square', 0.06, i * 0.13));
      tone(1047, 0.5, 'triangle', 0.08, seq.length * 0.13);
    },
    badge: () => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.2, 'triangle', 0.08, i * 0.1)),
  };

  // ---------- Narasi suara ----------
  const hasSpeech = 'speechSynthesis' in window;
  let voice = null;
  function pickVoice() {
    try {
      const vs = speechSynthesis.getVoices();
      voice = vs.find((v) => v.lang === 'id-ID') || vs.find((v) => /^id/i.test(v.lang)) || null;
    } catch (e) {}
  }
  if (hasSpeech) {
    pickVoice();
    speechSynthesis.onvoiceschanged = pickVoice;
  }

  const ANGKA = ['nol', 'satu', 'dua', 'tiga', 'empat', 'lima', 'enam', 'tujuh', 'delapan', 'sembilan', 'sepuluh', 'sebelas'];
  G.kata = function (n) {
    if (n < 12) return ANGKA[n];
    if (n < 20) return ANGKA[n - 10] + ' belas';
    if (n < 100) {
      const p = Math.floor(n / 10), s = n % 10;
      return (p === 1 ? 'sepuluh' : ANGKA[p] + ' puluh') + (s ? ' ' + ANGKA[s] : '');
    }
    return String(n);
  };

  function clean(text) {
    return text
      .replace(/[\u{1F300}-\u{1FAFF}\u{2600}-\u{27BF}]/gu, '')
      .replace(/\s*\+\s*/g, ' tambah ')
      .replace(/\s*[−-]\s*(?=\d)/g, ' kurang ')
      .replace(/\s*×\s*/g, ' kali ')
      .replace(/\s*=\s*\?/g, ' sama dengan berapa?')
      .replace(/\.\.\./g, ', ');
  }

  const PITCH = { ara: 1.4, aksa: 1.15, raja: 0.6, api: 1.5 };
  let timer = null;
  G.say = function (text, who) {
    if (!hasSpeech || !G.save || !G.save.voice || !text) return;
    try {
      const u = new SpeechSynthesisUtterance(clean(text));
      u.lang = 'id-ID';
      if (voice) u.voice = voice;
      u.rate = 0.95;
      u.pitch = PITCH[who] || 1.0;
      clearTimeout(timer);
      if (speechSynthesis.speaking || speechSynthesis.pending) {
        speechSynthesis.cancel();
        timer = setTimeout(() => speechSynthesis.speak(u), 80);
      } else {
        speechSynthesis.speak(u);
      }
    } catch (e) {}
  };
  G.hush = function () {
    clearTimeout(timer);
    try { if (hasSpeech) speechSynthesis.cancel(); } catch (e) {}
  };
})();
