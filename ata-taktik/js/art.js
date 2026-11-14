'use strict';
/* Gambar karakter (vektor bawaan) + dukungan sprite sheet pixel art.
   Koordinat lokal: titik pijak di (0,0), satuan = 1 piksel sprite skala 1x, menghadap kanan. */
const Art = (() => {
  function E(c, x, y, rx, ry, fill, stroke, rot = 0) {
    c.beginPath(); c.ellipse(x, y, Math.max(0.1, Math.abs(rx)), Math.max(0.1, Math.abs(ry)), rot, 0, Math.PI * 2);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.stroke(); }
  }
  function R(c, x, y, w, h, r, fill, stroke) {
    c.beginPath();
    if (c.roundRect) c.roundRect(x, y, w, h, r); else c.rect(x, y, w, h);
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.stroke(); }
  }
  function P(c, pts, fill, stroke) {
    c.beginPath(); c.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.closePath();
    if (fill) { c.fillStyle = fill; c.fill(); }
    if (stroke) { c.strokeStyle = stroke; c.stroke(); }
  }
  function L(c, pts, stroke, w = 0.9) {
    c.beginPath(); c.moveTo(pts[0], pts[1]);
    for (let i = 2; i < pts.length; i += 2) c.lineTo(pts[i], pts[i + 1]);
    c.strokeStyle = stroke; c.lineWidth = w; c.stroke(); c.lineWidth = 0.9;
  }
  function dizzyEyes(c, x, y) {
    L(c, [x - 1.3, y - 1.3, x + 1.3, y + 1.3], '#fff', 0.8);
    L(c, [x + 1.3, y - 1.3, x - 1.3, y + 1.3], '#fff', 0.8);
  }

  const D = {};

  /* ---------- Honey badger (Ata & Nenek) ---------- */
  function badger(c, o, cf) {
    const K = cf.fur, O = '#14110f', S = cf.mantle, W = cf.cloth, Wo = cf.clothLine;
    const l = o.leg || 0;
    if (cf.cane && !o.back) {
      c.lineWidth = 1.4; c.strokeStyle = '#7a5230';
      c.beginPath(); c.moveTo(12, 0); c.lineTo(12, -15); c.arc(10, -15, 2, 0, Math.PI, true); c.stroke(); c.lineWidth = 0.9;
    }
    if (o.back) E(c, -7, -7, 3, 2.2, K, O);
    if (o.kick) {
      R(c, 1, -11.5, 13, 4.5, 2, W, Wo); E(c, 15, -9.3, 2.8, 2.4, K, O); E(c, -3, -2.2, 3.2, 2.4, K, O);
    } else { E(c, -4 + l, -2.2, 3.2, 2.4, K, O); E(c, 4 - l, -2.2, 3.2, 2.4, K, O); }
    R(c, -7, -10, 14, 7, 3, W, Wo);
    E(c, 0, -15, 8.5, 7.5, W, Wo);
    if (cf.belt) {
      R(c, -8.3, -12.3, 16.6, 2.6, 1, '#1b1b1b');
      if (!o.back) {
        R(c, 1.5, -13.3, 3, 4, 1, '#1b1b1b');
        P(c, [2.5, -9.8, 1, -6.2, 3, -6.6], '#1b1b1b'); P(c, [3.5, -9.8, 5.5, -6.2, 4, -6.2], '#1b1b1b');
        L(c, [-1, -22, 2.5, -16.5, 6, -21.5], '#bdb7a8');
      } else R(c, -1.5, -13.3, 3, 3.5, 1, '#1b1b1b');
    }
    if (cf.shawl) P(c, [-9, -20.5, 9, -20.5, 6, -12, 0, -9, -6, -12], cf.shawl, '#5a2d6b');
    const ay = o.arm ? -25 : -16.5;
    E(c, -8.2, ay, 3, 3.3, W, Wo); E(c, -8.6, ay + 2.6, 2.2, 2, K, O);
    const px = o.punch ? 13 : 8.7, py = o.punch ? -17 : ay;
    E(c, px - 0.5, py, 3, 3.3, W, Wo); E(c, px + 0.3, py + 2.6, 2.2, 2, K, O);
    E(c, 1, -28, 8, 7.4, K);
    c.save(); c.beginPath(); c.ellipse(1, -28, 8, 7.4, 0, 0, Math.PI * 2); c.clip();
    if (o.back) E(c, 1, -29, 7, 9.5, S); else E(c, -1, -33.5, 9.5, 4.6, S);
    c.restore();
    E(c, 1, -28, 8, 7.4, null, O);
    E(c, -5, -34, 2.2, 1.9, K, O); E(c, 6, -34.6, 2.2, 1.9, K, O);
    if (cf.band) {
      R(c, -7.2, -31.8, 15.4, 2.4, 1, '#e53b2c');
      const fl = Math.sin((o.t || 0) * 9) * 1.6;
      P(c, [-7, -31.2, -13.5, -29 + fl, -12.5, -27.2 + fl, -7, -30], '#e53b2c');
    }
    if (!o.back) {
      E(c, 8.2, -25, 3.4, 2.6, '#3b3530', O); E(c, 10.8, -25.6, 1.3, 1, '#000');
      if (o.dizzy) { dizzyEyes(c, 3.3, -28.6); dizzyEyes(c, 7.2, -29); }
      else {
        E(c, 3, -28.6, 1.6, 1.9, '#fff'); E(c, 3.6, -28.4, 0.9, 1.1, '#000');
        E(c, 7, -29, 1.3, 1.6, '#fff'); E(c, 7.5, -28.8, 0.8, 1, '#000');
      }
      if (cf.glasses) {
        c.strokeStyle = '#d9b54a'; c.lineWidth = 0.7; c.beginPath();
        c.arc(3.2, -28.6, 2.4, 0, 7); c.moveTo(9.3, -29); c.arc(7.2, -29, 2.1, 0, 7); c.stroke(); c.lineWidth = 0.9;
      }
      c.strokeStyle = '#ddd'; c.beginPath(); c.arc(7.6, -23.4, 1.4, 0.2, Math.PI - 0.2); c.stroke();
    }
  }
  D.ata = (c, o) => badger(c, o, { fur: '#2a2622', mantle: '#d3d6da', cloth: '#f7f5ef', clothLine: '#8d887c', belt: true, band: true });
  D.nenek = (c, o) => badger(c, o, { fur: '#4a4440', mantle: '#eceef0', cloth: '#b07cc6', clothLine: '#6d4380', shawl: '#d9a7e6', glasses: true, cane: true });

  /* ---------- Ladhia (badak hitam, besar) ---------- */
  function spikeBall(c, x, y, r) {
    for (let i = 0; i < 8; i++) {
      const a = i * Math.PI / 4;
      P(c, [x + Math.cos(a) * r * 1.6, y + Math.sin(a) * r * 1.6, x + Math.cos(a + 0.4) * r, y + Math.sin(a + 0.4) * r, x + Math.cos(a - 0.4) * r, y + Math.sin(a - 0.4) * r], '#5b6670');
    }
    E(c, x, y, r, r, '#7d8994', '#2b3137'); E(c, x - r * 0.3, y - r * 0.3, r * 0.3, r * 0.3, '#c8d2da');
  }
  D.ladhia = (c, o) => {
    const G = '#59626b', Dk = '#2b3137', St = '#9fb3c4', St2 = '#7d93a6', Gd = '#e3c26b';
    const l = o.leg || 0;
    if (o.back) L(c, [-15, -18, -19, -14, -18, -10], Dk, 1.2);
    R(c, -12 + l, -10, 6, 10, 2, Dk); R(c, 6 - l, -10, 6, 10, 2, Dk);
    E(c, 0, -18, 16, 12, G, Dk);
    R(c, -8 - l, -9, 7, 9, 2, G, Dk); R(c, 8 + l, -9, 7, 9, 2, G, Dk);
    c.save(); c.beginPath(); c.ellipse(0, -18, 16, 12, 0, 0, Math.PI * 2); c.clip();
    R(c, -16, -31, 32, 10, 3, St, Dk); R(c, -16, -22.5, 32, 3, 1, St2);
    for (let i = -12; i <= 12; i += 6) E(c, i, -26, 1, 1, Gd);
    c.restore();
    E(c, 0, -18, 16, 12, null, Dk);
    if (!o.back) {
      E(c, 14, -24, 9, 8, G, Dk);
      c.save(); c.beginPath(); c.ellipse(14, -24, 9, 8, 0, 0, Math.PI * 2); c.clip(); R(c, 4, -34, 20, 7, 2, St); c.restore();
      E(c, 14, -24, 9, 8, null, Dk);
      P(c, [20, -28, 27, -40, 24, -27], '#ece3cf', Dk);
      P(c, [15, -31, 18, -37, 18.5, -30], '#ece3cf', Dk);
      E(c, 8, -32, 2.4, 3.2, G, Dk);
      if (o.dizzy) dizzyEyes(c, 15.4, -25.4);
      else { E(c, 15, -25.5, 1.6, 1.6, '#fff'); E(c, 15.6, -25.3, 0.8, 0.9, '#000'); }
      L(c, [12.3, -28.6, 17.6, -27], Dk, 1.4);
      E(c, 21.5, -21, 0.8, 0.6, Dk);
      L(c, [17, -19, 21, -19.6], Dk);
      E(c, -2, -15, 8, 10, St, Dk); E(c, -2, -15, 5, 7, St2); E(c, -2, -15, 2, 2, Gd);
      const s = o.strike || 0;
      const bx = 22 + s * 14, by = -6 - s * 6 - (o.arm && !s ? 14 : 0);
      L(c, [11, -12, bx - 2, by + 1], '#7a7a7a', 1);
      spikeBall(c, bx, by, 3.6);
    } else {
      E(c, 10, -26, 8, 7.5, G, Dk);
      c.save(); c.beginPath(); c.ellipse(10, -26, 8, 7.5, 0, 0, Math.PI * 2); c.clip(); R(c, 1, -36, 18, 7, 2, St); c.restore();
      E(c, 10, -26, 8, 7.5, null, Dk);
      P(c, [16, -31, 22, -41, 19, -30], '#ece3cf', Dk);
      E(c, 5, -33, 2.4, 3.2, G, Dk); E(c, 13, -34, 2.4, 3.2, G, Dk);
      E(c, -4, -21, 9, 8, St, Dk); E(c, -4, -21, 2, 2, Gd);
      if (o.strike) { const s = o.strike; spikeBall(c, 18 + s * 12, -30 - s * 4, 3.6); }
    }
  };

  /* ---------- Bubunti (llama koki) ---------- */
  D.bubunti = (c, o) => {
    const W = '#fffdf6', O = '#8a7f6a', C = '#efe2c6', Pk = '#f4a3a3', Ap = '#ff9f43';
    const l = o.leg || 0;
    [[-8, l], [-3, -l], [3, l], [8, -l]].forEach(([x, s]) => R(c, x - 1.6 + s * 0.5, -9, 3.2, 9, 1.5, C, O));
    E(c, -11, -17, 2.6, 2.6, W, O);
    E(c, 0, -14, 11, 7.5, W, O);
    [-8, -3, 2, 7].forEach(x => E(c, x, -20, 3, 2.4, W));
    if (!o.back) {
      R(c, 1, -18, 8, 9, 2, Ap); L(c, [1, -16, 9, -16], '#d97b22');
      R(c, 5, -34, 6, 18, 3, W, O);
      E(c, 9, -36, 5.5, 4.5, W, O);
      E(c, 6, -42, 1.6, 3.5, W, O, -0.2); E(c, 9.5, -42.5, 1.6, 3.5, W, O, 0.2);
      R(c, 4.5, -45, 9, 3.5, 1, '#fff', O); E(c, 6.5, -48, 3.2, 3, '#fff', O); E(c, 10.5, -48.5, 3.4, 3.2, '#fff', O); E(c, 8.5, -50, 3, 2.8, '#fff', O);
      E(c, 13, -34.5, 2.6, 2.2, C, O);
      if (o.dizzy) { L(c, [8.6, -38, 10.6, -36], '#3a2d22'); L(c, [10.6, -38, 8.6, -36], '#3a2d22'); }
      else { E(c, 9.5, -37, 1.2, 1.4, '#3a2d22'); E(c, 9.9, -37.4, 0.4, 0.4, '#fff'); }
      E(c, 11.2, -34.4, 1.2, 0.8, Pk);
      c.strokeStyle = '#6b5b45'; c.beginPath(); c.arc(13.5, -33.6, 1.1, 0.3, Math.PI - 0.3); c.stroke();
      const ang = o.arm ? -1.3 : (o.punch ? 0.3 : -0.35);
      c.save(); c.translate(11, -17); c.rotate(ang);
      R(c, 0, -1, 9, 2, 1, '#9b6a3c'); R(c, 8, -3, 5, 6, 1, '#b8c2cc', '#68737d');
      c.restore();
    } else {
      R(c, 5, -34, 6, 18, 3, W, O); E(c, 8, -36, 5.5, 4.5, W, O);
      E(c, 6, -42, 1.6, 3.5, W, O); E(c, 9.5, -42.5, 1.6, 3.5, W, O);
      R(c, 3.5, -45, 9, 3.5, 1, '#fff', O); E(c, 5.5, -48, 3.2, 3, '#fff', O); E(c, 9.5, -48.5, 3.4, 3.2, '#fff', O);
      P(c, [-2, -14, -5, -11, -1, -12], Ap);
    }
  };

  /* ---------- Zizi (zebra kecil) ---------- */
  D.zizi = (c, o) => {
    const W = '#fafafa', K = '#222', O = '#444', l = o.leg || 0;
    [[-6, l], [-2, -l], [3, l], [7, -l]].forEach(([x, s]) => R(c, x - 1.4 + s * 0.4, -8, 2.8, 8, 1, W, O));
    E(c, 0, -12, 9, 5.5, W, O);
    c.fillStyle = K; for (let i = -6; i <= 6; i += 3) c.fillRect(i, -17, 1.3, 8);
    E(c, -9, -13, 1.5, 2.5, K);
    if (!o.back) {
      R(c, 5, -24, 4, 10, 2, W, O); E(c, 9, -25, 4.5, 3.5, W, O); E(c, 12, -24, 2.4, 2, '#555', O);
      if (o.dizzy) dizzyEyes(c, 8.5, -26); else E(c, 8.5, -26, 1, 1.2, '#000');
      c.fillStyle = K; for (let i = 0; i < 3; i++) c.fillRect(5, -22 + i * 3, 4, 1);
      E(c, 6.5, -29.5, 1.2, 2.4, W, O); c.fillStyle = K; c.fillRect(4, -30, 1.5, 9);
    } else {
      R(c, 4, -24, 4, 10, 2, W, O); E(c, 6, -25, 4.5, 3.5, W, O); c.fillStyle = K; c.fillRect(5, -30, 1.5, 9);
    }
  };

  /* ---------- Hyena (generik) ---------- */
  function hyena(c, o, cf) {
    const B = cf.body, Dk = cf.dark, O = '#3d2a17', l = o.leg || 0, s = cf.s || 1;
    c.save(); c.scale(s, s);
    c.lineWidth = 0.9 / s;
    L(c, [-10, -14, -14, -16, -15, -10], Dk, 1.8);
    R(c, -9 + l, -9, 3.5, 9, 1.5, Dk); R(c, -3 - l, -9, 3.5, 9, 1.5, Dk);
    E(c, -1, -14, 10, 6.5, B, O, -0.25);
    [[-5, -14], [-1, -17], [2, -13], [-7, -11]].forEach(([x, y]) => E(c, x, y, 1.4, 1.1, Dk));
    for (let i = 0; i < 5; i++) P(c, [-6 + i * 3, -19 + i * 0.8, -4.5 + i * 3, -23 + i * 0.8, -3 + i * 3, -19 + i * 0.8], Dk);
    if (cf.acc) cf.acc(c, o);
    R(c, 3 + l, -10, 3.5, 10, 1.5, B, O); R(c, 7 - l, -10, 3.5, 10, 1.5, B, O);
    if (!o.back) {
      E(c, 9, -21, 6, 5, B, O);
      E(c, 14, -19, 3.5, 2.6, Dk, O); E(c, 16.5, -19.5, 1, 0.8, '#000');
      E(c, 5.5, -26, 2, 2.6, B, O); E(c, 9, -27, 2, 2.6, B, O); E(c, 5.5, -26, 1, 1.4, Dk); E(c, 9, -27, 1, 1.4, Dk);
      if (o.dizzy) dizzyEyes(c, 10, -22.4);
      else { E(c, 9.5, -22.5, 1.4, 1.5, '#fff'); E(c, 10, -22.3, 0.8, 0.9, '#000'); }
      L(c, [11, -17.4, 16.5, -17.4], O);
      for (let i = 0; i < 3; i++) P(c, [12 + i * 1.6, -17.4, 12.8 + i * 1.6, -16.2, 13.6 + i * 1.6, -17.4], '#fff');
      L(c, [8, -24.6, 11, -23.6], O);
    } else {
      E(c, 7, -22, 5.5, 5, B, O); E(c, 4.5, -27, 2, 2.6, B, O); E(c, 8.5, -27.5, 2, 2.6, B, O);
    }
    if (cf.hat) cf.hat(c, o);
    c.restore();
  }
  D.hyenaCilik = (c, o) => hyena(c, o, { s: 0.85, body: '#d8b47c', dark: '#8a6a3e' });
  D.hyenaGempal = (c, o) => hyena(c, o, {
    s: 1.12, body: '#b58f58', dark: '#6d5230',
    acc: (c) => { L(c, [-5, -19.5, 3, -9], '#6b3f1f', 2); R(c, 4, -20, 6, 2.2, 1, '#444'); },
  });
  D.hyenaPelempar = (c, o) => hyena(c, o, {
    s: 0.9, body: '#dcc08f', dark: '#8a6a3e',
    acc: (c, o) => { if (!o.back) E(c, 14, -12 - (o.arm || o.strike ? 8 : 0), 2.6, 2.3, '#9a9a9a', '#555'); },
    hat: (c, o) => {
      if (!o.back) { R(c, 4, -26.5, 10, 2.6, 1, '#3fa34d'); P(c, [4, -26, 0, -24, 1, -22, 4, -25], '#3fa34d'); }
      else R(c, 2, -27, 10, 2.6, 1, '#3fa34d');
    },
  });
  D.rajaHyena = (c, o) => hyena(c, o, {
    s: 1.4, body: '#a7824c', dark: '#5d4326',
    acc: (c) => P(c, [-8, -20, 6, -20, 2, -6, -13, -4], '#c0392b', '#7b241c'),
    hat: (c, o) => {
      const x0 = o.back ? 1 : 4;
      P(c, [x0, -28.5, x0 + 1, -34.5, x0 + 3, -30.5, x0 + 5, -36, x0 + 7, -30.5, x0 + 9, -34.5, x0 + 10, -28.5], '#f6c445', '#a07a14');
      E(c, x0 + 5, -30.6, 0.9, 0.9, '#e74c3c');
    },
  });

  /* ---------- Burung nasar ---------- */
  D.nasar = (c, o) => {
    const B = '#5b4636', Dk = '#2f241b', Pk = '#e9a0a0';
    const fly = o.dizzy ? 0 : -6 + Math.sin((o.t || 0) * 4) * 1.5;
    c.save(); c.translate(0, fly);
    const wing = (o.arm || o.strike) ? 1 : Math.sin((o.t || 0) * 6) * 0.3 + 0.4;
    P(c, [-2, -16, -16, -24 - wing * 6, -14, -14, -8, -10], B, Dk);
    E(c, 0, -12, 7, 8, B, Dk);
    E(c, 2, -19, 4.5, 2.6, '#f1ebe1', Dk);
    if (!o.back) {
      R(c, 3, -27, 3, 8, 1.5, Pk, Dk); E(c, 6, -28, 4, 3.5, Pk, Dk);
      P(c, [9, -29, 13.5, -27, 9, -26], '#f2d26b', Dk);
      if (o.dizzy) dizzyEyes(c, 6.7, -29); else { E(c, 6.5, -29, 1.1, 1.2, '#fff'); E(c, 6.8, -29, 0.6, 0.7, '#000'); }
      P(c, [2, -14, 12, -20 - wing * 6, 10, -12, 5, -9], B, Dk);
    } else {
      E(c, 4, -27, 3.6, 3.4, Pk, Dk);
      P(c, [2, -14, 14, -22 - wing * 6, 12, -12, 5, -9], B, Dk);
    }
    L(c, [-2, -4, -2, 0, 2, -4, 2, 0], '#e0b94a');
    c.restore();
  };

  const H = { ata: 38, nenek: 37, ladhia: 44, bubunti: 51, zizi: 31, hyenaCilik: 24, hyenaGempal: 31, hyenaPelempar: 26, rajaHyena: 41, nasar: 36 };
  const BIG = { ladhia: true, rajaHyena: true };

  /* ---------- Sprite sheet ---------- */
  const sheets = {};
  const ROW = { idle: 0, walk: 1, attack: 2, skill: 3, hurt: 4, faint: 5 };
  function frameSize(kind) { return BIG[kind] ? { fw: 48, fh: 56, ax: 24, ay: 54 } : { fw: 32, fh: 48, ax: 16, ay: 46 }; }
  function makeSheet(img, kind) {
    const { fw, fh, ax, ay } = frameSize(kind);
    const blocks = Math.round(img.height / (fh * 6));
    const cv = document.createElement('canvas'); cv.width = img.width; cv.height = img.height;
    const x = cv.getContext('2d'); x.drawImage(img, 0, 0);
    const data = x.getImageData(0, 0, cv.width, cv.height).data;
    const has = (fx, fy) => {
      for (let yy = fy; yy < fy + fh; yy++) for (let xx = fx; xx < fx + fw; xx++) if (data[(yy * cv.width + xx) * 4 + 3] > 0) return true;
      return false;
    };
    const counts = [];
    for (let b = 0; b < blocks; b++) {
      counts[b] = [];
      for (let r = 0; r < 6; r++) { let n = 0; for (let f = 0; f < 4; f++) if (has(f * fw, (b * 6 + r) * fh)) n = f + 1; counts[b][r] = n; }
    }
    return { img, fw, fh, ax, ay, blocks, counts };
  }
  function validate(img, kind) {
    const { fw, fh } = frameSize(kind);
    const okW = img.width === fw * 4, okH = img.height === fh * 12 || img.height === fh * 24;
    if (okW && okH) return null;
    return `Ukuran gambar ${img.width}×${img.height}. Seharusnya ${fw * 4}×${fh * 12} (2 arah) atau ${fw * 4}×${fh * 24} (4 arah).`;
  }
  function drawSheet(c, sh, dir, anim, ap, t) {
    let block = 0, mirror = false;
    if (dir === 0) block = 0; else if (dir === 3) block = 1;
    else if (dir === 1) { if (sh.blocks >= 4) block = 2; else { block = 0; mirror = true; } }
    else { if (sh.blocks >= 4) block = 3; else { block = 1; mirror = true; } }
    const row = ROW[anim] ?? 0;
    let n = sh.counts[block][row] || 0, useRow = row;
    if (!n) { useRow = 0; n = sh.counts[block][0] || 1; }
    let f = 0;
    if (useRow === 0) f = Math.floor(t / 0.4) % n;
    else if (useRow === 1) f = Math.floor(t / 0.1) % n;
    else if (useRow === 4) f = Math.floor(t / 0.12) % n;
    else f = Math.min(n - 1, Math.floor(ap * n));
    c.save(); c.scale(mirror ? -1 : 1, 1); c.imageSmoothingEnabled = false;
    c.drawImage(sh.img, f * sh.fw, (block * 6 + useRow) * sh.fh, sh.fw, sh.fh, -sh.ax, -sh.ay, sh.fw, sh.fh);
    c.restore();
  }

  /* ---------- Gambar karakter dengan pose ---------- */
  function drawCharacter(c, kind, dir, anim, ap, t, ex = {}) {
    const sh = sheets[kind];
    if (sh) return drawSheet(c, sh, dir, anim, ap, t);
    const fn = D[kind]; if (!fn) return;
    let back = dir === 2 || dir === 3, mirror = dir === 1 || dir === 2;
    const o = { t, back, leg: 0, arm: false, kick: false, punch: false, strike: 0, dizzy: false };
    let lx = 0, ly = 0, rot = 0;
    switch (anim) {
      case 'idle': ly = Math.sin(t * 3 + (ex.seed || 0)) * 0.6; break;
      case 'walk': o.leg = Math.sin(t * 22) * 2; ly = -Math.abs(Math.sin(t * 22)) * 1.2; break;
      case 'attack': {
        const s = Math.sin(ap * Math.PI); lx = s * 5; ly = back ? -s * 2 : s * 1; o.strike = s;
        if (kind === 'ata' || kind === 'nenek') o.kick = ap > 0.25 && ap < 0.85; else { o.punch = ap > 0.3 && ap < 0.8; }
        break;
      }
      case 'skill':
        ly = -Math.sin(ap * Math.PI) * 7; o.arm = true;
        if (ex.spin) { mirror = Math.floor(ap * 10) % 2 === 0; back = Math.floor(ap * 5) % 2 === 1; o.back = back; o.kick = true; o.arm = false; }
        break;
      case 'hurt': lx = -Math.sin(ap * Math.PI) * 3 + Math.sin(t * 70) * 0.8; break;
      case 'faint': rot = -Math.min(1, ap * 1.6) * Math.PI / 2 * 0.85; o.dizzy = true; o.back = back = false; break;
    }
    c.save();
    c.translate(0, ly);
    c.scale(mirror ? -1 : 1, 1);
    c.translate(lx, 0);
    if (rot) { c.translate(-4, 0); c.rotate(rot); c.translate(4, 0); }
    c.lineWidth = 0.9; c.lineJoin = 'round'; c.lineCap = 'round';
    fn(c, o);
    c.restore();
  }

  return { drawCharacter, H, BIG, sheets, makeSheet, validate, frameSize };
})();
