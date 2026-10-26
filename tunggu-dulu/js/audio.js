// Tunggu Dulu! — musik lembut & efek suara (WebAudio, tanpa file).
(function () {
  const TD = window.TD;
  const A = (TD.audio = { on: true });
  let ac = null, master = null, musicGain = null, timer = null, nextAt = 0, step = 0;
  try { A.on = localStorage.getItem('tunggu-dulu-suara') !== '0'; } catch (e) {}

  A.unlock = function () {
    if (!ac) {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = A.on ? 0.5 : 0; master.connect(ac.destination);
        musicGain = ac.createGain(); musicGain.gain.value = 0.45; musicGain.connect(master);
      } catch (e) { return; }
    }
    if (ac.state === 'suspended') ac.resume();
  };

  A.toggle = function () {
    A.on = !A.on;
    try { localStorage.setItem('tunggu-dulu-suara', A.on ? '1' : '0'); } catch (e) {}
    if (master) master.gain.setTargetAtTime(A.on ? 0.5 : 0, ac.currentTime, 0.05);
    return A.on;
  };

  function tone(f, t0, d, type, v, out) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(v, t0 + 0.015);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(out || master);
    o.start(t0); o.stop(t0 + d + 0.05);
  }
  function thud(t0) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.setValueAtTime(180, t0); o.frequency.exponentialRampToValueAtTime(50, t0 + 0.18);
    g.gain.setValueAtTime(0.5, t0); g.gain.exponentialRampToValueAtTime(0.0001, t0 + 0.22);
    o.connect(g); g.connect(master); o.start(t0); o.stop(t0 + 0.25);
  }

  const SFX = {
    tap: [[660, 0, 0.06, 'triangle', 0.08]],
    card: [[523, 0, 0.07], [698, 0.06, 0.1]],
    bag: [[392, 0, 0.08], [523, 0.07, 0.08], [659, 0.14, 0.12]],
    lens: [[880, 0, 0.08, 'sine', 0.06], [1175, 0.07, 0.12, 'sine', 0.06]],
    light: [[440, 0, 0.3, 'sine', 0.05], [660, 0.05, 0.3, 'sine', 0.04]],
    hint: [[784, 0, 0.1], [659, 0.1, 0.1], [784, 0.2, 0.2]],
    good: [[523, 0, 0.1], [659, 0.09, 0.1], [784, 0.18, 0.1], [1047, 0.27, 0.3]],
    caught: [[392, 0, 0.1], [523, 0.1, 0.1], [659, 0.2, 0.1], [784, 0.3, 0.1], [1047, 0.4, 0.35]],
    troll: [[110, 0, 0.25, 'sawtooth', 0.05], [98, 0.2, 0.3, 'sawtooth', 0.05]],
    bad: [[392, 0, 0.2, 'triangle', 0.12], [311, 0.18, 0.2, 'triangle', 0.12], [262, 0.36, 0.4, 'triangle', 0.12]],
    sad: [[392, 0, 0.2, 'triangle', 0.12], [330, 0.18, 0.3, 'triangle', 0.12]],
    day: [[392, 0, 0.15], [523, 0.15, 0.15], [659, 0.3, 0.15], [784, 0.45, 0.4]],
    party: [[523, 0, 0.15], [659, 0.15, 0.15], [784, 0.3, 0.15], [1047, 0.45, 0.15], [784, 0.62, 0.12], [1047, 0.75, 0.6]],
  };
  A.sfx = function (name) {
    if (!ac || !A.on) return;
    const t = ac.currentTime + 0.01;
    if (name === 'stamp') return thud(t);
    for (const [f, dt, d, type, v] of SFX[name] || []) tone(f, t + dt, d, type, v || 0.08);
  };

  // Lagu desa: pelan, hangat, berulang. 0 = jeda.
  const MEL = [392, 0, 440, 0, 523, 0, 440, 392, 330, 0, 392, 0, 440, 0, 0, 0,
               392, 0, 440, 0, 523, 0, 587, 523, 440, 0, 392, 0, 330, 0, 0, 0];
  const BASS = [131, 0, 0, 0, 175, 0, 0, 0, 196, 0, 0, 0, 131, 0, 0, 0,
                131, 0, 0, 0, 175, 0, 0, 0, 196, 0, 0, 0, 131, 0, 0, 0];
  const BEAT = 0.3;
  A.music = function (play) {
    if (!ac) return;
    clearInterval(timer); timer = null;
    if (!play) return;
    nextAt = ac.currentTime + 0.1;
    timer = setInterval(() => {
      while (nextAt < ac.currentTime + 0.6) {
        const m = MEL[step % MEL.length], b = BASS[step % BASS.length];
        if (m) tone(m, nextAt, BEAT * 1.6, 'triangle', 0.03, musicGain);
        if (b) tone(b, nextAt, BEAT * 3.5, 'sine', 0.07, musicGain);
        step++; nextAt += BEAT;
      }
    }, 150);
  };
})();
