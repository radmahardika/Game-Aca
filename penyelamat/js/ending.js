// Penjaga Rimba — adegan penutup: pagi tiba di Pohon Sarang, semua hewan melompat gembira bersama Tutu & Benhat.
// Hewan berbaris 1-3 baris (5/10/15 hewan); Level 3 ditambah pelangi.
(function () {
  const T = window.TPM;
  const W = 256, H0 = 144; // adegan digambar 256x144, lalu langit diperpanjang ke atas mengikuti bentuk layar

  T.Ending = function (cv) {
    const ctx = cv.getContext('2d');
    let H = H0;
    function fit() {
      const cw = cv.clientWidth || innerWidth, ch = cv.clientHeight || innerHeight;
      const h = Math.max(H0, Math.round((W * ch) / cw));
      if (h != H || cv.width != W) { H = h; cv.width = W; cv.height = H; }
      ctx.imageSmoothingEnabled = false;
    }
    const hearts = [];
    let start = 0, animals = [], rainbow = false;

    const spr = (id) => (T.SPR_FREE[id] || T.SPR[id]).canvas;
    const lerp = (a, b, k) => Math.round(a + (b - a) * k);
    const mixA = (c1, c2, k) => [lerp(c1[0], c2[0], k), lerp(c1[1], c2[1], k), lerp(c1[2], c2[2], k)];
    const mix = (c1, c2, k) => `rgb(${mixA(c1, c2, k).join(',')})`;

    function heart(x, y, s, a) {
      ctx.globalAlpha = a; ctx.fillStyle = '#ff6f91';
      ctx.fillRect(x, y + s, s * 2, s); ctx.fillRect(x + s * 3, y + s, s * 2, s);
      ctx.fillRect(x - s, y + s * 2, s * 7, s * 2); ctx.fillRect(x, y + s * 4, s * 5, s); ctx.fillRect(x + s, y + s * 5, s * 3, s); ctx.fillRect(x + s * 2, y + s * 6, s, s);
      ctx.globalAlpha = 1;
    }

    function draw(now) {
      if (!start) start = now;
      const t = (now - start) / 1000, dawn = Math.min(1, t / 3); // 3 detik: malam berubah jadi pagi
      fit();
      ctx.fillStyle = mix([12, 16, 48], [120, 170, 230], dawn); ctx.fillRect(0, 0, W, H);
      ctx.save(); ctx.translate(0, H - H0);

      // langit fajar
      for (let y = 0; y < 100; y++) {
        const k = y / 100;
        ctx.fillStyle = mix(mixA([12, 16, 48], [20, 30, 70], k), mixA([120, 170, 230], [255, 205, 150], k), dawn);
        ctx.fillRect(0, y, W, 1);
      }
      // matahari terbit
      ctx.fillStyle = `rgba(255,224,130,${dawn})`;
      ctx.beginPath(); ctx.arc(200, 100 - dawn * 22, 14, 0, 7); ctx.fill();
      // pelangi (Level 3)
      if (rainbow && dawn > 0.3) {
        ctx.globalAlpha = Math.min(1, (t - 1) / 2) * 0.75;
        ['#ff6b6b', '#ffa94d', '#ffe066', '#8ce99a', '#74c0fc', '#b197fc'].forEach((c, i) => {
          ctx.strokeStyle = c; ctx.lineWidth = 3; ctx.beginPath(); ctx.arc(128, 104, 104 - i * 3, Math.PI, 0); ctx.stroke();
        });
        ctx.globalAlpha = 1;
      }

      // bukit & tanah
      ctx.fillStyle = mix([18, 40, 26], [70, 140, 70], dawn);
      ctx.beginPath(); ctx.ellipse(40, 104, 80, 18, 0, 0, 7); ctx.ellipse(220, 106, 90, 16, 0, 0, 7); ctx.fill();
      ctx.fillStyle = mix([22, 52, 30], [92, 170, 84], dawn); ctx.fillRect(0, 100, W, 44);
      for (let i = 0; i < 40; i++) { ctx.fillStyle = mix([30, 64, 36], [110, 190, 96], dawn); ctx.fillRect((i * 53) % W, 104 + ((i * 29) % 38), 2, 1); }

      // Pohon Sarang
      ctx.fillStyle = mix([60, 38, 20], [120, 80, 44], dawn); ctx.fillRect(110, 46, 36, 58);
      ctx.fillStyle = 'rgba(200,240,112,.55)'; ctx.fillRect(123, 84, 10, 20);
      ctx.fillStyle = mix([22, 70, 34], [52, 140, 64], dawn);
      for (const [cx, cy, r] of [[128, 38, 40], [96, 50, 22], [160, 50, 22]]) { ctx.beginPath(); ctx.arc(cx, cy, r, 0, 7); ctx.fill(); }

      // kunang-kunang
      for (let i = 0; i < 14; i++) {
        const a = i * 2.1 + t * 0.6, x = 128 + Math.cos(a) * (50 + (i % 4) * 14), y = 60 + Math.sin(a * 1.3) * 26;
        ctx.fillStyle = `rgba(240,255,170,${0.5 + 0.5 * Math.sin(t * 3 + i)})`; ctx.fillRect(x | 0, y | 0, 2, 2);
      }

      // hewan berbaris dan melompat: tiap baris 5 hewan (2 di kiri, 3 di kanan Benhat), baris belakang lebih kecil
      const hop = (i) => -Math.abs(Math.sin(t * 4 + i * 0.9)) * 5;
      const rows = Math.ceil(animals.length / 5), BOT = [[126], [108, 126], [100, 113, 128]][rows - 1] || [126];
      animals.forEach((id, i) => {
        const r = Math.floor(i / 5), j = i % 5, sz = 22 - (rows - 1 - r) * 2;
        const big = ['kucing', 'pipit', 'ayam'].includes(id) ? Math.round(sz * 0.72) : sz;
        const x = (j < 2 ? 14 + j * 28 : 158 + (j - 2) * 28) + (r % 2) * 8;
        ctx.drawImage(spr(id), x, BOT[r] - big + hop(i), big, big);
      });
      // Benhat di tengah depan, Tutu terbang berputar di atas
      ctx.drawImage(T.SPR.bear.canvas, 104, 92 + hop(11) * 0.6, 40, 47);
      const ta = t * 1.4;
      ctx.drawImage(T.SPR.owl.canvas, 118 + Math.cos(ta) * 34, 18 + Math.sin(ta) * 8, 22, 22);

      // hati beterbangan
      if (Math.random() < 0.08) hearts.push({ x: 20 + Math.random() * 216, y: 110, v: 8 + Math.random() * 10, b: t });
      for (let i = hearts.length - 1; i >= 0; i--) {
        const h = hearts[i], age = t - h.b;
        if (age > 3) { hearts.splice(i, 1); continue; }
        heart(h.x + Math.sin(age * 3) * 3, h.y - age * h.v, 1, 1 - age / 3);
      }
      ctx.restore();
    }
    // ids: jenis hewan yang diselamatkan; rb: pelangi
    return { draw, reset(ids, rb) { start = 0; hearts.length = 0; animals = ids || []; rainbow = !!rb; } };
  };
})();
