// Penjaga Rimba — halaman awal: malam di Pohon Sarang, Benhat berdiri, Tutu terbang berputar, hewan melompat pelan.
(function () {
  const T = window.TPM;
  const W = 256;

  T.Splash = function (cv) {
    const ctx = cv.getContext('2d');
    let H = 144;
    function fit() {
      const cw = cv.clientWidth || innerWidth, ch = cv.clientHeight || innerHeight;
      const h = Math.max(110, Math.round((W * ch) / cw));
      if (h != H || cv.width != W) { H = h; cv.width = W; cv.height = H; }
      ctx.imageSmoothingEnabled = false;
    }
    const P = (c, x, y, w, h) => { ctx.fillStyle = c; ctx.fillRect(x, y, w, h); };
    const blob = (c, list) => { ctx.fillStyle = c; for (const [x, y, r] of list) { ctx.beginPath(); ctx.arc(x, y, r, 0, 7); ctx.fill(); } };
    // deretan pohon cemara di kejauhan
    function ridge(col, base, amp, step, seed) {
      ctx.fillStyle = col;
      for (let i = 0; i < W + step; i += step) {
        const h = amp * (0.6 + 0.4 * Math.abs(Math.sin(i * seed)));
        ctx.beginPath(); ctx.moveTo(i - step * 0.8, base); ctx.lineTo(i, base - h); ctx.lineTo(i + step * 0.8, base); ctx.fill();
      }
      ctx.fillRect(0, base, W, H - base);
    }

    function draw(now) {
      fit();
      const t = now / 1000, G = H - 28;
      for (let y = 0; y < H; y++) { const k = y / H; P(`rgb(${(8 + k * 18) | 0},${(12 + k * 26) | 0},${(36 + k * 40) | 0})`, 0, y, W, 1); }
      for (let i = 0; i < 90; i++) {
        ctx.globalAlpha = 0.35 + 0.3 * (1 + Math.sin(t * 1.5 + i * 1.7)) / 2 + ((i * 7) % 10) / 30;
        P('#fffde6', ((i * 73.3) % W) | 0, ((i * 41.7) % (H * 0.6)) | 0, 1, 1);
      }
      ctx.globalAlpha = 1;
      blob('rgba(244,236,192,.12)', [[232, 58, 17]]); blob('#f4ecc0', [[232, 58, 10]]);
      ridge('#0f1d2a', G - 6, 34, 10, 0.37); ridge('#12261c', G + 2, 26, 13, 0.71);

      // Pohon Sarang dengan lubang bercahaya
      P('#4a3018', 110, G - 60, 36, 62);
      P(`rgba(200,240,112,${0.65 + 0.12 * Math.sin(t * 2)})`, 123, G - 22, 10, 20);
      blob('#173f22', [[128, G - 70, 40], [94, G - 58, 22], [162, G - 58, 22]]);
      blob('#1e4f2a', [[120, G - 84, 16], [146, G - 72, 12]]);
      P('#1d3f22', 0, G, W, H - G);
      for (let i = 0; i < 60; i++) P('#285a2c', (i * 53) % W, G + 3 + ((i * 29) % Math.max(1, H - G - 4)), 2, 1);
      blob('#10301a', [[10, H - 4, 18], [34, H - 4, 14], [226, H - 4, 16], [250, H - 4, 20]]);

      // hewan yang sudah aman, melompat pelan bergantian
      const hop = (i) => -Math.max(0, Math.sin(t * 2.2 + i * 1.3)) * 3;
      const spr = (id) => (T.SPR_FREE[id] || T.SPR[id]).canvas;
      [['bebek', 20, G + 2, 14], ['kelinci', 40, G - 4, 18], ['kucing', 152, G - 2, 12], ['rusa', 176, G - 12, 22], ['landak', 200, G - 2, 16], ['tupai', 222, G - 8, 16]]
        .forEach(([id, x, y, s], i) => ctx.drawImage(spr(id), x, y + hop(i), s, s));

      // Benhat bernapas pelan, Tutu terbang berputar di depan pohon
      ctx.drawImage(T.SPR.bear.canvas, 70, G - 30 + Math.sin(t * 1.6) * 0.8, 36, 42);
      const a = t * 0.9;
      ctx.drawImage(T.SPR.owl.canvas, 128 + Math.cos(a) * 34 - 11, G - 56 + Math.sin(a * 2) * 6, 22, 22);

      // kunang-kunang
      for (let i = 0; i < 26; i++) {
        const b = i * 2.1 + t * 0.6, fx = 128 + Math.cos(b) * (30 + (i % 5) * 16), fy = G - 40 + Math.sin(b * 1.3) * 34;
        P(`rgba(230,255,138,${0.45 + 0.4 * Math.sin(t * 3 + i)})`, fx | 0, fy | 0, 2, 2);
      }
      const g = ctx.createRadialGradient(128, G - 10, 4, 128, G - 10, 70);
      g.addColorStop(0, 'rgba(230,255,138,.16)'); g.addColorStop(1, 'rgba(230,255,138,0)');
      ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
    }
    return { draw };
  };
})();
