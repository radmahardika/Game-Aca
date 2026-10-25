// Angkasa Mart — musik chiptune ceria & efek suara (WebAudio, tanpa file).
(function () {
  const AM = window.AM;
  const A = (AM.audio = { on: true });
  let ac = null, master = null, musicGain = null, timer = null, nextAt = 0, step = 0;
  try { A.on = localStorage.getItem('angkasa-mart-suara') !== '0'; } catch (e) {}

  A.unlock = function () {
    if (!ac) {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = A.on ? 0.5 : 0; master.connect(ac.destination);
        musicGain = ac.createGain(); musicGain.gain.value = 0.5; musicGain.connect(master);
      } catch (e) { return; }
    }
    if (ac.state === 'suspended') ac.resume();
  };

  A.toggle = function () {
    A.on = !A.on;
    try { localStorage.setItem('angkasa-mart-suara', A.on ? '1' : '0'); } catch (e) {}
    if (master) master.gain.setTargetAtTime(A.on ? 0.5 : 0, ac.currentTime, 0.05);
    return A.on;
  };

  function tone(f, t0, d, type, v, out) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'square'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(v, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(out || master);
    o.start(t0); o.stop(t0 + d + 0.05);
  }

  const SFX = {
    tap: [[620, 0, 0.06, 'square', 0.05]],
    ask: [[523, 0, 0.08], [784, 0.08, 0.14]],
    add: [[660, 0, 0.07], [880, 0.06, 0.1]],
    remove: [[440, 0, 0.08], [330, 0.07, 0.1]],
    coin: [[988, 0, 0.08], [1319, 0.07, 0.25]],
    sold: [[523, 0, 0.1], [659, 0.09, 0.1], [784, 0.18, 0.1], [1047, 0.27, 0.3]],
    sad: [[392, 0, 0.2, 'triangle', 0.12], [330, 0.18, 0.3, 'triangle', 0.12]],
    no: [[220, 0, 0.12, 'square', 0.06], [196, 0.12, 0.2, 'square', 0.06]],
    fly: [[330, 0, 0.12], [440, 0.1, 0.12], [587, 0.2, 0.12], [784, 0.3, 0.3]],
    land: [[784, 0, 0.1], [587, 0.1, 0.1], [440, 0.2, 0.2]],
    kind: [[659, 0, 0.15, 'triangle', 0.15], [784, 0.15, 0.15, 'triangle', 0.15], [988, 0.3, 0.15, 'triangle', 0.15], [1319, 0.45, 0.5, 'triangle', 0.15]],
    up: [[523, 0, 0.15], [659, 0.15, 0.15], [784, 0.3, 0.15], [1047, 0.45, 0.15], [784, 0.62, 0.12], [1047, 0.75, 0.6]],
  };
  A.sfx = function (name) {
    if (!ac || !A.on) return;
    const t = ac.currentTime + 0.01;
    for (const [f, dt, d, type, v] of SFX[name] || []) tone(f, t + dt, d, type, v || 0.07);
  };

  // Lagu toko: riang, mayor, berulang. 0 = jeda.
  const MEL = [523, 0, 659, 0, 784, 659, 523, 0, 587, 0, 698, 0, 880, 698, 587, 0,
               659, 0, 784, 0, 988, 784, 659, 0, 587, 659, 587, 523, 392, 0, 0, 0];
  const BASS = [131, 0, 196, 0, 131, 0, 196, 0, 147, 0, 220, 0, 147, 0, 220, 0,
                165, 0, 247, 0, 165, 0, 247, 0, 196, 0, 147, 0, 131, 0, 196, 0];
  const BEAT = 0.24;
  A.music = function (play) {
    if (!ac) return;
    clearInterval(timer); timer = null;
    if (!play) return;
    nextAt = ac.currentTime + 0.1;
    timer = setInterval(() => {
      while (nextAt < ac.currentTime + 0.6) {
        const m = MEL[step % MEL.length], b = BASS[step % BASS.length];
        if (m) tone(m, nextAt, BEAT * 1.2, 'square', 0.025, musicGain);
        if (b) tone(b, nextAt, BEAT * 1.8, 'triangle', 0.06, musicGain);
        step++; nextAt += BEAT;
      }
    }, 120);
  };
})();
