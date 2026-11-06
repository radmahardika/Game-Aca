// Mockup — latar & musuh bergaya low-poly lembut (menyamai sprite tokoh)
const LP = {};
(function () {
  let seed = 3;
  const R = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  LP.seed = (s) => (seed = s);
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16));
  const mix = (h, t) => { // t>0 ke terang, t<0 ke gelap
    const c = hex(h).map((v) => (t > 0 ? v + (255 - v) * t : v * (1 + t)));
    return `rgb(${c.map((v) => Math.round(v)).join(',')})`;
  };
  LP.mix = mix;
  const LIGHT = [-0.55, -0.83];

  function tri(g, a, b, c, col) {
    g.fillStyle = col; g.strokeStyle = col; g.lineWidth = 0.8;
    g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.closePath(); g.fill(); g.stroke();
  }
  LP.poly = function (g, pts, col) {
    g.fillStyle = col; g.beginPath(); pts.forEach(([x, y], i) => (i ? g.lineTo(x, y) : g.moveTo(x, y))); g.closePath(); g.fill();
  };
  // gumpalan bersegi dengan bidang terang/gelap
  LP.facet = function (g, cx, cy, rx, ry, base, o = {}) {
    const n = o.n || 9, jit = o.jit ?? 0.14, k = o.k ?? 0.22, a0 = R() * 6.28;
    const pts = [];
    for (let i = 0; i < n; i++) {
      const a = a0 + (i / n) * Math.PI * 2, r = 1 - jit + R() * jit * 2;
      pts.push([cx + Math.cos(a) * rx * r, cy + Math.sin(a) * ry * r]);
    }
    const c = [cx + rx * (o.px ?? -0.18), cy + ry * (o.py ?? -0.25)];
    for (let i = 0; i < n; i++) {
      const p = pts[i], q = pts[(i + 1) % n];
      const mx = (p[0] + q[0]) / 2 - cx, my = (p[1] + q[1]) / 2 - cy, L = Math.hypot(mx / rx, my / ry) || 1;
      const d = (mx / rx * LIGHT[0] + my / ry * LIGHT[1]) / L;
      tri(g, c, p, q, mix(base, d * k + (R() - 0.5) * 0.06));
    }
    return pts;
  };
  LP.softShadow = function (g, x, y, rx, ry, a = 0.32) {
    g.save(); g.translate(x, y); g.scale(1, ry / rx);
    const gr = g.createRadialGradient(0, 0, 0, 0, 0, rx);
    gr.addColorStop(0, `rgba(20,35,15,${a})`); gr.addColorStop(0.7, `rgba(20,35,15,${a * 0.6})`); gr.addColorStop(1, 'rgba(20,35,15,0)');
    g.fillStyle = gr; g.beginPath(); g.arc(0, 0, rx, 0, 7); g.fill(); g.restore();
  };

  // ---------- latar ----------
  function ground(g, W, H) {
    const gr = g.createLinearGradient(0, 0, W * 0.3, H);
    gr.addColorStop(0, '#5f8f45'); gr.addColorStop(1, '#4d7a3a');
    g.fillStyle = gr; g.fillRect(0, 0, W, H);
    const tones = ['#5a8a42', '#64964a', '#4f7f3c', '#6c9e50', '#577f3f'];
    for (let i = 0; i < 420; i++) LP.facet(g, R() * W, R() * H, 30 + R() * 45, 16 + R() * 20, tones[(R() * tones.length) | 0], { n: 6, jit: 0.25, k: 0.1 });
  }
  function tufts(g, W, H, n) {
    for (let i = 0; i < n; i++) {
      const x = R() * W, y = R() * H, s = 4 + R() * 5, col = R() < 0.5 ? '#7fb35a' : '#3f6b31';
      for (let j = -1; j <= 1; j++) tri(g, [x + j * s * 0.6 - 2, y], [x + j * s * 0.6 + 2, y], [x + j * s * 0.9, y - s * (1.4 - Math.abs(j) * 0.3)], col);
    }
  }
  function flowers(g, W, H, n) {
    for (let i = 0; i < n; i++) {
      const x = R() * W, y = R() * H, c = ['#f6e48a', '#f7f4ec', '#eea0bd', '#f4b860'][(R() * 4) | 0];
      g.fillStyle = c; for (let k = 0; k < 5; k++) { const a = k * 1.256; g.beginPath(); g.arc(x + Math.cos(a) * 2.2, y + Math.sin(a) * 1.4, 1.6, 0, 7); g.fill(); }
      g.fillStyle = '#e09a2a'; g.beginPath(); g.arc(x, y, 1.2, 0, 7); g.fill();
    }
  }
  function clearing(g, cx, cy, rx, ry) {
    LP.facet(g, cx, cy, rx, ry, '#9a7a52', { n: 14, jit: 0.12, k: 0.08 });
    const tones = ['#a5865c', '#8d6f49', '#b0916a', '#977650'];
    for (let i = 0; i < 70; i++) {
      const a = R() * 6.28, d = Math.sqrt(R()) * 0.85;
      LP.facet(g, cx + Math.cos(a) * rx * d, cy + Math.sin(a) * ry * d, 18 + R() * 30, 9 + R() * 14, tones[(R() * 4) | 0], { n: 6, jit: 0.25, k: 0.12 });
    }
    // tepi rumput yang menjorok
    for (let i = 0; i < 40; i++) { const a = R() * 6.28; LP.facet(g, cx + Math.cos(a) * rx * 1.02, cy + Math.sin(a) * ry * 1.02, 16 + R() * 18, 8 + R() * 8, '#5f8f45', { n: 5, jit: 0.3, k: 0.1 }); }
  }
  function path(g, pts, w) {
    for (let k = 0; k < pts.length - 1; k++) {
      const [x0, y0] = pts[k], [x1, y1] = pts[k + 1], n = Math.hypot(x1 - x0, y1 - y0) / 14;
      for (let i = 0; i <= n; i++) {
        const t = i / n; LP.facet(g, x0 + (x1 - x0) * t + (R() - 0.5) * 8, y0 + (y1 - y0) * t + (R() - 0.5) * 4, w * (0.9 + R() * 0.3), w * 0.5, ['#9a7a52', '#a5865c', '#8d6f49'][(R() * 3) | 0], { n: 6, jit: 0.2, k: 0.1 });
      }
    }
  }
  LP.stone = function (g, x, y, s) {
    LP.softShadow(g, x + s * 0.3, y + s * 0.45, s * 1.4, s * 0.55, 0.35);
    LP.facet(g, x, y, s * 1.2, s * 0.8, '#8f8a80', { n: 6, k: 0.35 });
  };
  LP.bush = function (g, x, y, s) {
    LP.softShadow(g, x + s * 0.3, y + s * 0.5, s * 1.6, s * 0.55, 0.4);
    LP.facet(g, x, y, s * 1.3, s * 0.8, '#3d6f2f', { n: 8, k: 0.3 });
    LP.facet(g, x - s * 0.5, y - s * 0.25, s * 0.8, s * 0.6, '#4f8a3a', { n: 7, k: 0.3 });
    LP.facet(g, x + s * 0.45, y - s * 0.2, s * 0.75, s * 0.55, '#467f35', { n: 7, k: 0.3 });
  };
  LP.tree = function (g, x, y, s) {
    LP.softShadow(g, x + s * 0.55, y + s * 0.12, s * 1.6, s * 0.55, 0.42);
    // batang bersegi
    LP.poly(g, [[x - s * 0.13, y], [x - s * 0.08, y - s * 1.1], [x + s * 0.08, y - s * 1.1], [x + s * 0.15, y]], '#5c3f2a');
    LP.poly(g, [[x - s * 0.13, y], [x - s * 0.08, y - s * 1.1], [x, y - s * 1.1], [x - s * 0.02, y]], '#7a5538');
    LP.poly(g, [[x - s * 0.22, y + 2], [x - s * 0.13, y - s * 0.15], [x - s * 0.05, y + 1]], '#5c3f2a');
    const cy = y - s * 1.45;
    LP.facet(g, x + s * 0.1, cy + s * 0.15, s * 1.05, s * 0.72, '#2f5c27', { n: 10, k: 0.3 });
    LP.facet(g, x - s * 0.35, cy - s * 0.05, s * 0.7, s * 0.55, '#3f7531', { n: 8, k: 0.32 });
    LP.facet(g, x + s * 0.45, cy - s * 0.1, s * 0.62, s * 0.5, '#3a6d2e', { n: 8, k: 0.32 });
    LP.facet(g, x - s * 0.05, cy - s * 0.45, s * 0.6, s * 0.42, '#4f8a3a', { n: 8, k: 0.35 });
  };
  function light(g, W, H) {
    g.save(); g.globalCompositeOperation = 'soft-light';
    const gr = g.createRadialGradient(W * 0.45, H * 0.4, 50, W * 0.45, H * 0.4, W * 0.7);
    gr.addColorStop(0, 'rgba(255,240,190,.55)'); gr.addColorStop(1, 'rgba(0,0,0,0)');
    g.fillStyle = gr; g.fillRect(0, 0, W, H); g.restore();
    g.save(); g.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) {
      const x = 150 + i * 280; const lg = g.createLinearGradient(x, 0, x + 220, H);
      lg.addColorStop(0, 'rgba(255,240,180,.09)'); lg.addColorStop(1, 'rgba(255,240,180,0)');
      g.fillStyle = lg; g.beginPath(); g.moveTo(x, 0); g.lineTo(x + 70, 0); g.lineTo(x + 330, H); g.lineTo(x + 190, H); g.fill();
    }
    g.restore();
    const v = g.createRadialGradient(W / 2, H / 2, H * 0.4, W / 2, H / 2, W * 0.72);
    v.addColorStop(0, 'rgba(0,0,0,0)'); v.addColorStop(1, 'rgba(12,24,10,.5)');
    g.fillStyle = v; g.fillRect(0, 0, W, H);
  }
  const byY = (a, b) => a[1] - b[1];

  LP.battle = function (g, W, H) {
    LP.seed(11); ground(g, W, H);
    clearing(g, W * 0.48, H * 0.55, W * 0.36, H * 0.24);
    tufts(g, W, H, 260); flowers(g, W, H, 60);
    [[330, 360, 12], [820, 600, 10], [900, 360, 8], [460, 640, 8], [1000, 500, 7]].forEach(([x, y, s]) => LP.stone(g, x, y, s));
    [[60, 690, 28], [1150, 740, 32], [1090, 210, 24], [110, 280, 24], [740, 120, 22], [370, 800, 26]].forEach(([x, y, s]) => LP.bush(g, x, y, s));
    [[90, 180, 70], [330, 95, 80], [630, 60, 66], [900, 105, 80], [1160, 200, 72], [-10, 520, 64], [1215, 600, 60], [480, 40, 58], [1040, 40, 62], [180, 50, 60]].sort(byY).forEach(([x, y, s]) => LP.tree(g, x, y, s));
    light(g, W, H);
  };
  LP.jelajah = function (g, W, H) {
    LP.seed(31); ground(g, W, H);
    path(g, [[-60, 820], [270, 645], [510, 570], [750, 420], [990, 315], [1260, 180]], 40);
    tufts(g, W, H, 320); flowers(g, W, H, 90);
    [[240, 570, 9], [690, 525, 7], [900, 420, 8]].forEach(([x, y, s]) => LP.stone(g, x, y, s));
    [[450, 735, 26], [180, 480, 24], [1035, 480, 26], [810, 240, 24], [990, 90, 22], [600, 360, 20]].forEach(([x, y, s]) => LP.bush(g, x, y, s));
    [[90, 360, 80], [330, 285, 86], [540, 210, 74], [720, 135, 70], [60, 690, 64], [900, 45, 70], [240, 60, 74], [450, 45, 64],
     [900, 720, 86], [1110, 570, 80], [1185, 870, 86], [645, 870, 76], [420, 900, 64], [1185, 360, 70]].sort(byY).forEach(([x, y, s]) => LP.tree(g, x, y, s));
    light(g, W, H);
  };

  // ---------- musuh (menghadap kanan) ----------
  LP.kumbang = function (g, x, y, s = 1) { // x,y = titik kaki tengah
    g.save(); g.translate(x, y); g.scale(s, s);
    LP.softShadow(g, 0, 0, 78, 20, 0.45);
    const leg = '#2c2430';
    [[-38, -14, -54, 2], [-12, -10, -22, 4], [16, -10, 22, 4], [38, -14, 52, 2]].forEach(([a, b, c, d]) => {
      LP.poly(g, [[a - 4, b], [a + 4, b], [(a + c) / 2 + 3, b - 8], [c + 3, d], [c - 4, d], [(a + c) / 2 - 3, b - 6]], leg);
      LP.poly(g, [[c - 6, d], [c + 6, d], [c + 2, d - 4]], '#463a4c');
    });
    // kepala + tanduk
    LP.facet(g, 56, -34, 22, 18, '#43384a', { n: 8, k: 0.35 });
    LP.poly(g, [[64, -46], [76, -46], [82, -58], [80, -68], [72, -58]], '#e3d3b0'); LP.poly(g, [[64, -46], [69, -46], [80, -68], [72, -58]], '#c4b38c');
    LP.poly(g, [[66, -40], [78, -42], [74, -32]], '#ffd24a'); LP.poly(g, [[68, -39], [72, -40], [70, -36]], '#fff6c8');
    LP.poly(g, [[63, -46], [80, -47], [79, -44], [64, -43]], '#241c28'); // alis cemberut
    // cangkang batu
    LP.facet(g, -4, -46, 62, 40, '#8e8a83', { n: 11, k: 0.42, py: -0.45 });
    LP.facet(g, -14, -60, 30, 18, '#a6a199', { n: 7, k: 0.3 });
    g.strokeStyle = '#5f5b56'; g.lineWidth = 2.5; g.beginPath(); g.moveTo(-2, -84); g.lineTo(2, -60); g.lineTo(-4, -34); g.lineTo(0, -10); g.stroke();
    [[-30, -72, 12, 6], [18, -78, 10, 5], [-46, -50, 8, 5]].forEach(([a, b, c, d]) => LP.facet(g, a, b, c, d, '#79a85a', { n: 6, k: 0.3 }));
    g.restore();
  };
  LP.tawon = function (g, x, y, s = 1, hover = 60) { // x,y = bayangan di tanah
    g.save(); g.translate(x, y); g.scale(s, s);
    LP.softShadow(g, 0, 0, 40, 11, 0.38);
    g.translate(0, -hover);
    // sayap transparan
    g.globalAlpha = 0.72;
    LP.facet(g, -6, -46, 26, 16, '#d8eef7', { n: 7, k: 0.25 });
    LP.facet(g, 14, -50, 22, 13, '#eaf7fb', { n: 7, k: 0.25 });
    g.globalAlpha = 1;
    // perut bergaris + sengat
    LP.poly(g, [[-52, -6], [-66, -2], [-52, 2]], '#2a2228');
    const ab = LP.facet(g, -24, -10, 30, 20, '#f2c230', { n: 10, k: 0.38 });
    g.save(); g.beginPath(); ab.forEach(([a, b], i) => (i ? g.lineTo(a, b) : g.moveTo(a, b))); g.closePath(); g.clip();
    g.fillStyle = 'rgba(38,30,36,.92)'; [-40, -24, -8].forEach((sx) => g.fillRect(sx, -36, 8, 52)); g.restore();
    // dada & kepala
    LP.facet(g, 10, -14, 13, 12, '#3a3036', { n: 7, k: 0.3 });
    LP.facet(g, 32, -18, 18, 17, '#f4c63a', { n: 9, k: 0.38 });
    LP.poly(g, [[34, -26], [44, -26], [45, -15], [35, -14]], '#2a1e22'); LP.poly(g, [[37, -24], [41, -24], [40, -20]], '#ffffff');
    LP.poly(g, [[31, -30], [46, -31], [45, -28], [32, -27]], '#2a1e22'); // alis jahil
    g.strokeStyle = '#2a1e22'; g.lineWidth = 2.2; g.beginPath(); g.moveTo(36, -8); g.quadraticCurveTo(42, -5, 47, -10); g.stroke();
    g.beginPath(); g.moveTo(28, -32); g.lineTo(24, -46); g.moveTo(36, -33); g.lineTo(40, -47); g.stroke();
    // kaki kecil
    g.lineWidth = 2; [[4, -4, 0, 6], [12, -4, 12, 7], [18, -6, 24, 4]].forEach(([a, b, c, d]) => { g.beginPath(); g.moveTo(a, b); g.lineTo(c, d); g.stroke(); });
    g.restore();
  };
  // ikon kecil (untuk bar giliran)
  LP.icon = function (fn, w, h, ox, oy, s) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    fn(c.getContext('2d'), ox, oy, s, 18); return c.toDataURL();
  };
})();
