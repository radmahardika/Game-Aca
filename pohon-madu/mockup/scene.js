// Mockup — latar isometrik bergaya lukisan pixel (hutan) untuk battle & jelajah
const SCN = {};
(function () {
  let W = 400, H = 280, K = 1;
  const P = (v) => v * K;
  const R = () => PX.rnd();

  function grass(g, seed) {
    PX.seed(seed);
    g.fillStyle = '#4c7a2e'; g.fillRect(0, 0, W, H);
    const tones = ['#3f6a27', '#55862f', '#5f9134', '#477229', '#6a9a3a', '#3a6123'];
    for (let i = 0; i < 2600 * K * K; i++) {
      const x = R() * W, y = R() * H, r = 2 + R() * 5;
      PX.disc(g, x, y, r * 1.6, r * 0.8, tones[(R() * tones.length) | 0]);
    }
    // rumput kecil (tekstur)
    for (let i = 0; i < 2200 * K * K; i++) {
      const x = (R() * W) | 0, y = (R() * H) | 0;
      g.fillStyle = R() < 0.5 ? '#79aa45' : '#335a1f';
      g.fillRect(x, y, 1, 2);
    }
  }

  function dirt(g, cx, cy, rx, ry, seed) {
    PX.seed(seed);
    const tones = ['#8a6b44', '#9b7b50', '#7b5e3b', '#a4865a'];
    for (let i = 0; i < 260 * K; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R());
      const x = cx + Math.cos(a) * rx * d, y = cy + Math.sin(a) * ry * d;
      PX.disc(g, x, y, 6 + R() * 8, 3 + R() * 4, tones[(R() * 4) | 0]);
    }
    for (let i = 0; i < 500; i++) {
      const a = R() * Math.PI * 2, d = Math.sqrt(R());
      g.fillStyle = R() < 0.5 ? '#6a4f31' : '#b39466';
      g.fillRect((cx + Math.cos(a) * rx * d) | 0, (cy + Math.sin(a) * ry * d) | 0, 1, 1);
    }
  }

  // jalan tanah berkelok (titik-titik kontrol)
  function path(g, pts, wdt, seed) {
    PX.seed(seed);
    for (let k = 0; k < pts.length - 1; k++) {
      const [x0, y0] = pts[k], [x1, y1] = pts[k + 1];
      for (let t = 0; t <= 1; t += 0.02) {
        const x = x0 + (x1 - x0) * t, y = y0 + (y1 - y0) * t;
        PX.disc(g, x + (R() - 0.5) * 6, y + (R() - 0.5) * 3, wdt * (0.8 + R() * 0.4), wdt * 0.5, ['#8a6b44', '#9b7b50', '#7b5e3b'][(R() * 3) | 0]);
      }
    }
    for (let k = 0; k < pts.length - 1; k++) {
      const [x0, y0] = pts[k], [x1, y1] = pts[k + 1];
      for (let t = 0; t <= 1; t += 0.01) {
        g.fillStyle = R() < 0.5 ? '#6a4f31' : '#b39466';
        g.fillRect((x0 + (x1 - x0) * t + (R() - 0.5) * wdt * 1.6) | 0, (y0 + (y1 - y0) * t + (R() - 0.5) * wdt * 0.8) | 0, 1, 1);
      }
    }
  }

  function stone(g, x, y, s) {
    PX.disc(g, x + 1, y + 2, s * 1.3, s * 0.6, 'rgba(20,30,10,.35)');
    PX.disc(g, x, y, s * 1.2, s * 0.8, '#7f7a70');
    PX.disc(g, x - s * 0.3, y - s * 0.3, s * 0.7, s * 0.45, '#a8a296');
  }

  function bush(g, x, y, s) {
    PX.disc(g, x + 2, y + s * 0.6, s * 1.5, s * 0.5, 'rgba(10,25,5,.4)');
    for (let i = 0; i < 6; i++) PX.disc(g, x + (R() - 0.5) * s * 1.6, y + (R() - 0.5) * s * 0.6, s * 0.7, s * 0.6, '#2f5a1e');
    for (let i = 0; i < 5; i++) PX.disc(g, x - s * 0.3 + (R() - 0.5) * s, y - s * 0.3 + (R() - 0.5) * s * 0.4, s * 0.45, s * 0.4, '#4f8a2c');
    for (let i = 0; i < 8; i++) { g.fillStyle = '#86bf4e'; g.fillRect((x - s * 0.5 + R() * s) | 0, (y - s * 0.5 + R() * s * 0.4) | 0, 2, 1); }
  }

  function tree(g, x, y, s) {
    // bayangan tajuk ke kanan bawah
    PX.disc(g, x + s * 0.5, y + s * 0.25, s * 1.5, s * 0.55, 'rgba(8,22,6,.45)');
    // batang
    g.fillStyle = '#4a3322'; g.fillRect(x - 3, y - s * 0.9, 6, s * 0.95);
    g.fillStyle = '#6b4a30'; g.fillRect(x - 3, y - s * 0.9, 2, s * 0.95);
    // tajuk berlapis
    const cy = y - s * 1.35;
    for (let i = 0; i < 14; i++) PX.disc(g, x + (R() - 0.5) * s * 1.8, cy + (R() - 0.5) * s * 0.9, s * 0.55, s * 0.45, '#1f4416');
    for (let i = 0; i < 12; i++) PX.disc(g, x - s * 0.2 + (R() - 0.5) * s * 1.4, cy - s * 0.15 + (R() - 0.5) * s * 0.7, s * 0.42, s * 0.35, '#356b22');
    for (let i = 0; i < 9; i++) PX.disc(g, x - s * 0.35 + (R() - 0.5) * s * 0.9, cy - s * 0.35 + (R() - 0.5) * s * 0.5, s * 0.3, s * 0.24, '#55922f');
    for (let i = 0; i < 26; i++) { g.fillStyle = R() < 0.6 ? '#8ccd52' : '#6fae3e'; g.fillRect((x - s * 0.8 + R() * s * 1.2) | 0, (cy - s * 0.6 + R() * s * 0.7) | 0, 2, 1); }
  }

  function flowers(g, n) {
    for (let i = 0; i < n; i++) {
      g.fillStyle = ['#f4e27a', '#f2f2f2', '#e98fb0', '#f5b54a'][(R() * 4) | 0];
      g.fillRect((R() * W) | 0, (R() * H) | 0, 1, 1);
    }
  }

  function vignette(g, a) {
    const gr = g.createRadialGradient(W / 2, H / 2, H * 0.35, W / 2, H / 2, W * 0.72);
    gr.addColorStop(0, 'rgba(0,0,0,0)'); gr.addColorStop(1, `rgba(10,20,8,${a})`);
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
  }

  // cahaya matahari menembus daun
  function sunbeams(g) {
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const x = (60 + i * 95) * K;
      const gr = g.createLinearGradient(x, 0, x + 80, H);
      gr.addColorStop(0, 'rgba(255,240,170,.10)'); gr.addColorStop(1, 'rgba(255,240,170,0)');
      g.fillStyle = gr;
      g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 26, 0); g.lineTo(x + 120, H); g.lineTo(x + 70, H); g.fill();
    }
    g.restore();
  }

  SCN.size = function (k) { K = k; W = 400 * k; H = 280 * k; };
  SCN.battle = function (g) {
    grass(g, 11);
    dirt(g, P(200), P(150), P(150), P(72), 5);
    PX.seed(21);
    [[120, 120, 3], [270, 185, 2.5], [300, 120, 2], [150, 200, 2], [330, 160, 2]].forEach(([x, y, s]) => stone(g, P(x), P(y), s));
    flowers(g, 260);
    [[20, 230, 9], [380, 250, 11], [355, 70, 8], [40, 95, 8], [250, 40, 8], [120, 260, 9]].forEach(([x, y, s]) => bush(g, P(x), P(y), s));
    [[30, 60, 26], [110, 30, 30], [210, 18, 24], [300, 35, 30], [385, 70, 26], [-5, 175, 24], [405, 200, 22], [160, 12, 22], [345, 20, 24], [60, 20, 22]].forEach(([x, y, s]) => tree(g, P(x), P(y), s));
    sunbeams(g);
    vignette(g, 0.55);
  };

  SCN.jelajah = function (g) {
    grass(g, 31);
    path(g, [[-20, 270], [90, 215], [170, 190], [250, 140], [330, 105], [420, 60]].map(([x, y]) => [P(x), P(y)]), 13, 9);
    PX.seed(41);
    flowers(g, 300);
    [[80, 190, 2.5], [230, 175, 2], [300, 140, 2.2]].forEach(([x, y, s]) => stone(g, P(x), P(y), s));
    [[150, 245, 9], [60, 160, 8], [345, 160, 9], [270, 80, 8], [330, 30, 8], [200, 120, 7]].forEach(([x, y, s]) => bush(g, P(x), P(y), s));
    [[30, 120, 28], [110, 95, 30], [180, 70, 26], [240, 45, 24], [20, 230, 22], [300, 15, 24], [80, 20, 26], [150, 15, 22],
     [300, 240, 30], [370, 190, 28], [395, 290, 30], [215, 290, 26], [140, 300, 22], [395, 120, 24]].sort((a, b) => a[1] - b[1]).forEach(([x, y, s]) => tree(g, P(x), P(y), s));
    sunbeams(g);
    vignette(g, 0.5);
  };

  SCN.shadow = function (g, x, y, rx) { PX.disc(g, x, y, rx, rx * 0.35, 'rgba(15,25,8,.45)'); };
})();
