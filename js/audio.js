// Efek suara dan musik latar chiptune (WebAudio). Tanpa narasi suara.
(function () {
  const G = (window.G = window.G || {});
  let ac = null;
  let master = null;

  G.audioUnlock = function () {
    try {
      if (!ac) {
        const AC = window.AudioContext || window.webkitAudioContext;
        if (!AC) return;
        ac = new AC();
        master = ac.createGain();
        master.gain.value = 1;
        master.connect(ac.destination);
      }
      if (ac.state === 'suspended') ac.resume();
      if (wanted && !timer) G.music(wanted);
    } catch (e) {}
  };

  function tone(freq, dur, type = 'square', vol = 0.07, when = 0, slide = 0, dest, at) {
    if (!ac) return;
    const t0 = at || ac.currentTime + when;
    const o = ac.createOscillator();
    const g = ac.createGain();
    o.type = type;
    o.frequency.setValueAtTime(freq, t0);
    if (slide) o.frequency.linearRampToValueAtTime(Math.max(40, freq + slide), t0 + dur);
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    o.connect(g).connect(dest || master);
    o.start(t0);
    o.stop(t0 + dur + 0.05);
  }

  let noiseBuf = null;
  function noise(dur, vol = 0.05, when = 0, freq = 1500, dest, at) {
    if (!ac) return;
    if (!noiseBuf) {
      noiseBuf = ac.createBuffer(1, ac.sampleRate, ac.sampleRate);
      const d = noiseBuf.getChannelData(0);
      for (let i = 0; i < d.length; i++) d[i] = Math.random() * 2 - 1;
    }
    const t0 = at || ac.currentTime + when;
    const src = ac.createBufferSource();
    src.buffer = noiseBuf;
    const f = ac.createBiquadFilter();
    f.type = 'bandpass';
    f.frequency.value = freq;
    const g = ac.createGain();
    g.gain.setValueAtTime(vol, t0);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
    src.connect(f).connect(g).connect(dest || master);
    src.start(t0);
    src.stop(t0 + dur + 0.05);
  }

  const fxOn = () => ac && G.save && G.save.sfx;
  const sfx = (fn) => (...a) => { if (fxOn()) fn(...a); };
  G.sfx = {
    tap: sfx(() => tone(660, 0.05, 'square', 0.035)),
    bump: sfx(() => tone(140, 0.08, 'square', 0.05)),
    talk: sfx(() => tone(880, 0.04, 'square', 0.03)),
    correct: sfx(() => [523, 659, 784, 1047].forEach((f, i) => tone(f, 0.14, 'square', 0.06, i * 0.08))),
    wrong: sfx(() => { tone(330, 0.14, 'triangle', 0.12); tone(262, 0.22, 'triangle', 0.12, 0.14); }),
    spray: sfx(() => noise(0.8, 0.07, 0, 1800)),
    splash: sfx(() => noise(0.25, 0.06, 0, 900)),
    step: sfx(() => tone(392, 0.07, 'square', 0.06)),
    count: sfx((n) => tone(330 + n * 25, 0.09, 'square', 0.05)),
    laugh: sfx(() => [0, 0.12, 0.24].forEach((w) => tone(700, 0.08, 'sawtooth', 0.03, w, -200))),
    meow: sfx(() => tone(700, 0.3, 'triangle', 0.08, 0, 300)),
    rumble: sfx(() => { noise(1.2, 0.12, 0, 120); tone(70, 1.0, 'sawtooth', 0.06, 0, -30); }),
    encounter: sfx(() => [0, 0.07, 0.14, 0.21, 0.28].forEach((w, i) => tone(400 + i * 120, 0.06, 'square', 0.05, w))),
    badge: sfx(() => [784, 988, 1175, 1568].forEach((f, i) => tone(f, 0.2, 'triangle', 0.08, i * 0.1))),
  };

  // ---------- Musik ----------
  const N = {};
  'C C# D D# E F F# G G# A A# B'.split(' ').forEach((n, i) => {
    for (let o = 1; o <= 7; o++) N[n + o] = 440 * Math.pow(2, (i - 9) / 12 + (o - 4));
  });
  const seq = (s) => s.trim().split(/\s+/);

  // Tiap langkah = 1/8 ketukan. '-' = diam.
  const SONGS = {
    town: {
      bpm: 116,
      lead: seq(`
        E5 G5 C6 G5 A5 - G5 -  E5 G5 E5 D5 C5 - - -
        D5 F5 A5 F5 G5 - F5 -  E5 D5 E5 F5 G5 - - -
        E5 G5 C6 G5 A5 - C6 -  B5 A5 G5 E5 F5 - - -
        D5 - G5 - E5 - C5 -    D5 E5 D5 B4 C5 - - -`),
      bass: seq(`
        C3 - G3 - C3 - G3 -  A2 - E3 - A2 - E3 -
        F2 - C3 - F2 - C3 -  C3 - G3 - C3 - G3 -
        C3 - G3 - C3 - G3 -  E3 - B2 - F2 - C3 -
        G2 - D3 - G2 - D3 -  G2 - B2 - C3 - G2 -`),
      hat: false,
      vol: 0.035,
    },
    battle: {
      bpm: 150,
      lead: seq(`
        A4 C5 E5 A5 G5 E5 C5 E5  F5 A5 C6 A5 G5 E5 D5 E5
        A4 C5 E5 A5 B5 A5 G5 E5  F5 E5 D5 C5 B4 C5 D5 E5
        C5 E5 G5 C6 B5 G5 E5 G5  A5 G5 F5 E5 D5 E5 F5 G5
        A5 - E5 - C5 - E5 -      F5 E5 D5 B4 A4 - - -`),
      bass: seq(`
        A2 A2 A3 A2 A2 A2 A3 A2  F2 F2 F3 F2 G2 G2 G3 G2
        A2 A2 A3 A2 A2 A2 A3 A2  D2 D2 D3 D2 E2 E2 E3 E2
        C3 C3 C4 C3 C3 C3 C4 C3  F2 F2 F3 F2 G2 G2 G3 G2
        A2 A2 A3 A2 F2 F2 F3 F2  E2 E2 E3 E2 A2 - - -`),
      hat: true,
      vol: 0.035,
    },
  };

  let wanted = null; // nama lagu yang diminta
  let timer = null;
  let step = 0;
  let nextT = 0;
  let bus = null;

  function startLoop() {
    if (!ac || !wanted) return;
    stopLoop();
    bus = ac.createGain();
    bus.gain.value = 1;
    bus.connect(master);
    step = 0;
    nextT = ac.currentTime + 0.08;
    timer = setInterval(schedule, 25);
  }
  function stopLoop() {
    clearInterval(timer);
    timer = null;
    if (bus) {
      const b = bus;
      try { b.gain.setTargetAtTime(0.0001, ac.currentTime, 0.05); } catch (e) {}
      setTimeout(() => b.disconnect(), 400);
      bus = null;
    }
  }
  function schedule() {
    const song = SONGS[wanted];
    if (!song || !ac) return;
    const dur = 60 / song.bpm / 2;
    while (nextT < ac.currentTime + 0.12) {
      const i = step % song.lead.length;
      const l = song.lead[i], b = song.bass[i % song.bass.length];
      if (l !== '-' && N[l]) tone(N[l], dur * 0.9, 'square', song.vol, 0, 0, bus, nextT);
      if (b !== '-' && N[b]) tone(N[b], dur * 0.95, 'triangle', song.vol * 2.2, 0, 0, bus, nextT);
      if (song.hat && i % 2 === 1) noise(0.04, 0.025, 0, 7000, bus, nextT);
      nextT += dur;
      step++;
    }
  }

  G.music = function (name) {
    wanted = name;
    if (!ac) return;
    if (!G.save.music || !name) { stopLoop(); return; }
    startLoop();
  };
  G.musicRefresh = function () { G.music(wanted); };
  // Hentikan musik sementara (misalnya saat bacaan Al-Qur'an diputar), lalu lanjutkan.
  G.musicHold = function (on) {
    if (on) stopLoop();
    else if (ac && G.save.music && wanted && !timer) startLoop();
  };

  G.jingle = function () {
    if (!ac || !G.save.music) return;
    stopLoop();
    const seqN = ['C5', 'E5', 'G5', 'C6', '-', 'G5', 'C6'];
    seqN.forEach((n, i) => { if (N[n]) tone(N[n], 0.16, 'square', 0.06, i * 0.13); });
    tone(N.E6, 0.6, 'triangle', 0.07, seqN.length * 0.13);
  };
})();
