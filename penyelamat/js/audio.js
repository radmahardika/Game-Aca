// Duo Penyelamat — musik malam yang tenang & efek suara (WebAudio, tanpa file).
(function () {
  const T = window.TPM;
  const A = (T.audio = { on: true });
  let ac = null, master = null, musicGain = null, timer = null, nextAt = 0, step = 0;
  try { A.on = localStorage.getItem('penyelamat-malam-suara') !== '0'; } catch (e) {}

  A.unlock = function () {
    if (!ac) {
      try {
        ac = new (window.AudioContext || window.webkitAudioContext)();
        master = ac.createGain(); master.gain.value = A.on ? 0.5 : 0; master.connect(ac.destination);
        musicGain = ac.createGain(); musicGain.gain.value = 0.55; musicGain.connect(master);
      } catch (e) { return; }
    }
    if (ac.state === 'suspended') ac.resume();
  };

  A.toggle = function () {
    A.on = !A.on;
    try { localStorage.setItem('penyelamat-malam-suara', A.on ? '1' : '0'); } catch (e) {}
    if (master) master.gain.setTargetAtTime(A.on ? 0.5 : 0, ac.currentTime, 0.05);
    return A.on;
  };

  function tone(f, t0, d, type, v, out) {
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type || 'triangle'; o.frequency.value = f;
    g.gain.setValueAtTime(0.0001, t0);
    g.gain.linearRampToValueAtTime(v, t0 + 0.02);
    g.gain.exponentialRampToValueAtTime(0.0001, t0 + d);
    o.connect(g); g.connect(out || master);
    o.start(t0); o.stop(t0 + d + 0.05);
  }

  const SFX = {
    mark: [[880, 0, 0.18], [1175, 0.1, 0.3]],
    rescue: [[523, 0, 0.18], [659, 0.12, 0.18], [784, 0.24, 0.18], [1047, 0.36, 0.5]],
    wrong: [[247, 0, 0.18, 'square', 0.06], [196, 0.14, 0.28, 'square', 0.06]],
    pick: [[660, 0, 0.09]],
    drop: [[440, 0, 0.09]],
    hoot: [[392, 0, 0.3, 'sine', 0.22], [330, 0.32, 0.45, 'sine', 0.22]],
    join: [[587, 0, 0.15], [880, 0.12, 0.35]],
    tap: [[520, 0, 0.06, 'sine', 0.12]],
  };
  A.sfx = function (name) {
    if (!ac || !A.on) return;
    const t = ac.currentTime + 0.01;
    for (const [f, dt, d, type, v] of SFX[name] || []) tone(f, t + dt, d, type, v || 0.18);
  };

  // Lagu malam: arpeggio pentatonik pelan + bas lembut. 0 = jeda.
  const MEL = [392, 0, 523, 587, 659, 0, 587, 523, 440, 0, 392, 440, 523, 0, 0, 0,
               392, 0, 523, 587, 659, 0, 784, 659, 587, 0, 523, 440, 392, 0, 0, 0];
  const BASS = [131, 0, 0, 0, 175, 0, 0, 0, 147, 0, 0, 0, 131, 0, 0, 0,
                131, 0, 0, 0, 175, 0, 0, 0, 196, 0, 0, 0, 131, 0, 0, 0];
  const BEAT = 0.42;
  A.music = function (play) {
    if (!ac) return;
    clearInterval(timer); timer = null;
    if (!play) return;
    nextAt = ac.currentTime + 0.1;
    timer = setInterval(() => {
      while (nextAt < ac.currentTime + 0.6) {
        const m = MEL[step % MEL.length], b = BASS[step % BASS.length];
        if (m) tone(m, nextAt, BEAT * 1.6, 'triangle', 0.07, musicGain);
        if (b) tone(b, nextAt, BEAT * 3.5, 'sine', 0.1, musicGain);
        step++; nextAt += BEAT;
      }
    }, 150);
  };
})();
