// Efek suara & musik sederhana (WebAudio), bisa dimatikan
(function () {
  let ac = null, master = null, musicGain = null, musicTimer = null;
  PM.muted = false;
  PM.audioUnlock = function () {
    if (!ac) {
      const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return;
      ac = new AC(); master = ac.createGain(); master.gain.value = PM.muted ? 0 : 0.5; master.connect(ac.destination);
      musicGain = ac.createGain(); musicGain.gain.value = 0.16; musicGain.connect(master);
    }
    if (ac.state === 'suspended') ac.resume();
  };
  PM.setMuted = function (m) { PM.muted = m; if (master) master.gain.value = m ? 0 : 0.5; };

  function tone(f, t0, dur, type = 'square', vol = 0.25, f2, out) {
    if (!ac) return;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = type; o.frequency.setValueAtTime(f, t0); if (f2) o.frequency.exponentialRampToValueAtTime(f2, t0 + dur);
    g.gain.setValueAtTime(vol, t0); g.gain.exponentialRampToValueAtTime(0.001, t0 + dur);
    o.connect(g); g.connect(out || master); o.start(t0); o.stop(t0 + dur + 0.02);
  }
  function noise(t0, dur, vol = 0.3, hp = 800) {
    if (!ac) return;
    const b = ac.createBuffer(1, ac.sampleRate * dur, ac.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * (1 - i / d.length);
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    f.type = 'highpass'; f.frequency.value = hp; g.gain.value = vol;
    s.buffer = b; s.connect(f); f.connect(g); g.connect(master); s.start(t0);
  }
  const SFX = {
    pilih: (t) => tone(880, t, 0.06, 'square', 0.12),
    batal: (t) => tone(330, t, 0.08, 'square', 0.12),
    pukul: (t) => { noise(t, 0.12, 0.35, 600); tone(160, t, 0.12, 'square', 0.2, 60); },
    tendang: (t) => { noise(t, 0.18, 0.25, 2000); tone(300, t + 0.05, 0.14, 'square', 0.22, 90); },
    berat: (t) => { noise(t, 0.35, 0.5, 200); tone(110, t, 0.35, 'sawtooth', 0.3, 40); },
    meleset: (t) => tone(600, t, 0.18, 'triangle', 0.15, 300),
    sembuh: (t) => [523, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.07, 0.18, 'triangle', 0.2)),
    tenaga: (t) => tone(200, t, 0.5, 'sawtooth', 0.12, 500),
    tidur: (t) => [700, 500].forEach((f, i) => tone(f, t + i * 0.15, 0.2, 'sine', 0.15)),
    kalah: (t) => [392, 330, 262, 196].forEach((f, i) => tone(f, t + i * 0.18, 0.3, 'triangle', 0.2)),
    menang: (t) => [523, 659, 784, 659, 784, 1047].forEach((f, i) => tone(f, t + i * 0.11, 0.2, 'square', 0.15)),
    naik: (t) => [523, 587, 659, 698, 784, 880, 988, 1047].forEach((f, i) => tone(f, t + i * 0.06, 0.16, 'square', 0.13)),
    musuhKalah: (t) => tone(500, t, 0.35, 'square', 0.15, 120),
  };
  PM.sfx = function (n) { if (!ac || PM.muted) return; try { SFX[n] && SFX[n](ac.currentTime + 0.01); } catch (e) {} };

  // musik battle chiptune sederhana (loop)
  const BASS = [110, 110, 131, 147, 110, 110, 98, 123];
  const LEAD = [440, 0, 523, 494, 440, 0, 392, 0, 440, 523, 587, 523, 494, 0, 440, 0];
  PM.music = function (on) {
    if (musicTimer) { clearInterval(musicTimer); musicTimer = null; }
    if (!on || !ac) return;
    let step = 0; const beat = 0.19;
    musicTimer = setInterval(() => {
      if (PM.muted) return;
      const t = ac.currentTime + 0.05;
      if (step % 2 === 0) tone(BASS[(step / 2) % BASS.length], t, beat * 1.8, 'triangle', 0.5, null, musicGain);
      const f = LEAD[step % LEAD.length]; if (f) tone(f, t, beat * 0.9, 'square', 0.18, null, musicGain);
      step++;
    }, beat * 1000);
  };
})();
