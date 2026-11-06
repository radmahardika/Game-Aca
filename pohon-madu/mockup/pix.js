// Mockup — alat gambar pixel sederhana (semua gambar dibuat dengan kode)
const PX = {};
(function () {
  let seed = 7;
  PX.rnd = () => ((seed = (seed * 16807) % 2147483647) / 2147483647);
  PX.seed = (s) => (seed = s);

  // kanvas sprite dengan buffer warna
  PX.sprite = function (w, h) {
    const buf = new Array(w * h).fill(null);
    const S = {
      w, h, buf,
      p(x, y, c) { x |= 0; y |= 0; if (x >= 0 && y >= 0 && x < w && y < h) buf[y * w + x] = c; },
      get(x, y) { return x >= 0 && y >= 0 && x < w && y < h ? buf[y * w + x] : null; },
      rect(x, y, rw, rh, c) { for (let j = 0; j < rh; j++) for (let i = 0; i < rw; i++) S.p(x + i, y + j, c); },
      ell(cx, cy, rx, ry, c, test) {
        for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++)
          for (let x = Math.floor(cx - rx); x <= Math.ceil(cx + rx); x++) {
            const dx = (x + 0.5 - cx) / rx, dy = (y + 0.5 - cy) / ry;
            if (dx * dx + dy * dy <= 1 && (!test || test(x, y))) S.p(x, y, c);
          }
      },
      line(x0, y0, x1, y1, c, t = 1) {
        const n = Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)) || 1;
        for (let i = 0; i <= n; i++) {
          const x = x0 + (x1 - x0) * i / n, y = y0 + (y1 - y0) * i / n;
          if (t === 1) S.p(Math.round(x), Math.round(y), c);
          else S.ell(x + 0.5, y + 0.5, t / 2, t / 2, c);
        }
      },
      // ganti warna hanya pada piksel yang sudah terisi
      paint(test, c) { for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) if (buf[y * w + x] && test(x, y, buf[y * w + x])) buf[y * w + x] = c; },
      outline(c) {
        const add = [];
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
          if (buf[y * w + x]) continue;
          if (S.get(x - 1, y) || S.get(x + 1, y) || S.get(x, y - 1) || S.get(x, y + 1)) add.push([x, y]);
        }
        add.forEach(([x, y]) => S.p(x, y, c));
      },
      flip() {
        const nb = buf.slice();
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) buf[y * w + x] = nb[y * w + (w - 1 - x)];
        return S;
      },
      canvas() {
        const cv = document.createElement('canvas'); cv.width = w; cv.height = h;
        const g = cv.getContext('2d');
        for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) { const c = buf[y * w + x]; if (c) { g.fillStyle = c; g.fillRect(x, y, 1, 1); } }
        return cv;
      },
    };
    return S;
  };

  // lingkaran pixel langsung ke ctx
  PX.disc = function (g, cx, cy, rx, ry, c) {
    g.fillStyle = c;
    for (let y = Math.floor(cy - ry); y <= Math.ceil(cy + ry); y++) {
      const dy = (y + 0.5 - cy) / ry; if (Math.abs(dy) > 1) continue;
      const half = rx * Math.sqrt(1 - dy * dy);
      const x0 = Math.round(cx - half), x1 = Math.round(cx + half);
      if (x1 > x0) g.fillRect(x0, y, x1 - x0, 1);
    }
  };
})();
