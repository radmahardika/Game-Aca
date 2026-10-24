// Tim Penyelamat Malam — mesin first person pixel (raycasting) dengan cahaya malam.
(function () {
  const T = window.TPM;
  const { N, WALL, FLOOR, I, hash } = T;

  const stars = [];
  for (let i = 0; i < 160; i++) stars.push({ a: Math.random() * Math.PI * 2, y: Math.random() * 0.8, b: 0.4 + Math.random() * 0.6 });

  T.Renderer = function (cv) {
    const ctx = cv.getContext('2d');
    let W = 256, H = 160, img, buf, zbuf, lastW = 0, lastH = 0;
    function resize() {
      // ukuran tampilan kanvas (ikut ukuran jendela); saat iPad diputar nilainya bisa 0 sesaat
      const cw = cv.clientWidth || innerWidth, ch = cv.clientHeight || innerHeight;
      if (!cw || !ch) return;
      lastW = cw; lastH = ch;
      W = 256;
      H = Math.max(110, Math.min(220, Math.round((W * ch) / cw)));
      cv.width = W; cv.height = H;
      img = ctx.createImageData(W, H); buf = new Uint32Array(img.data.buffer); zbuf = new Float32Array(W);
    }
    // dipanggil tiap frame: ukur ulang kalau ukuran layar berubah (rotasi iPad tidak selalu memicu event resize tepat waktu)
    function check() {
      const cw = cv.clientWidth, ch = cv.clientHeight;
      if (cw && ch && (cw != lastW || ch != lastH)) resize();
    }
    resize();

    const pack = (r, g, b) => (255 << 24) | ((b > 255 ? 255 : b) << 16) | ((g > 255 ? 255 : g) << 8) | (r > 255 ? 255 : r);

    // view: {role:'owl'|'bear', p:{x,y,a}, other:{x,y,a}|null, world, t}
    function draw(view) {
      const owl = view.role == 'owl', p = view.p, t = view.t, world = view.world;
      const dirX = Math.cos(p.a), dirY = Math.sin(p.a), plX = -dirY * 0.66, plY = dirX * 0.66;
      // Tutu terbang: mata lebih tinggi (di bawah puncak pohon) dan sedikit menunduk; Benhat setinggi mata beruang.
      const camZ = owl ? 1.15 + 0.035 * Math.sin(t * 2.5) : 0.5, hz = owl ? Math.round(H * 0.4) : H >> 1;
      const lights = T.lights(world);
      const sh = [0, 0, 0];
      const shade = (wx, wy, d) => {
        let v;
        if (owl) { v = Math.max(0, 1 - d / 7); v = Math.pow(v, 1.5) * 0.7 + 0.035; } else { v = Math.max(0, 1 - d / 2) * 0.24 + 0.025; }
        let r = v * (owl ? 0.55 : 1), g = v, b = v * (owl ? 0.85 : 1);
        for (const L of lights) {
          const q = (wx - L.x) ** 2 + (wy - L.y) ** 2;
          if (q < L.r * L.r) { const f = (1 - Math.sqrt(q) / L.r) ** 2 * L.i; r += f * 0.95; g += f * 1.05; b += f * 0.45; }
        }
        sh[0] = r; sh[1] = g; sh[2] = b;
      };

      // langit, bintang, bulan
      for (let y = 0; y < hz; y++) {
        const k = y / hz, m = owl ? 1 : 0.6;
        buf.fill(pack((6 * m + k * 10 * m) | 0, (9 * m + k * 16 * m) | 0, (26 * m + k * 30 * m) | 0), y * W, y * W + W);
      }
      const fov = Math.atan(0.66);
      for (const s of stars) {
        let d = s.a - p.a; d = Math.atan2(Math.sin(d), Math.cos(d));
        if (Math.abs(d) < fov) {
          const x = ((W / 2) * (1 + Math.tan(d) / 0.66)) | 0, y = (s.y * hz * 0.85) | 0, b = ((owl ? 200 : 120) * s.b) | 0;
          buf[y * W + x] = pack(b, b, b + 30);
        }
      }
      {
        let d = 0.9 - p.a; d = Math.atan2(Math.sin(d), Math.cos(d));
        if (Math.abs(d) < fov + 0.2) {
          const cx = (W / 2) * (1 + Math.tan(d) / 0.66), cy = hz * 0.25;
          for (let y = -6; y <= 6; y++) for (let x = -6; x <= 6; x++) {
            const q = x * x + y * y, q2 = (x - 3) ** 2 + (y + 2) ** 2, xx = (cx + x) | 0, yy = (cy + y) | 0;
            if (q <= 30 && q2 > 22 && xx >= 0 && xx < W && yy >= 0) buf[yy * W + xx] = owl ? pack(232, 226, 170) : pack(140, 136, 100);
          }
        }
      }

      // lantai
      const rx0 = dirX - plX, ry0 = dirY - plY, rx1 = dirX + plX, ry1 = dirY + plY;
      for (let y = hz + 1; y < H; y++) {
        const rd = (camZ * H) / (y - hz), sx = (rd * (rx1 - rx0)) / W, sy = (rd * (ry1 - ry0)) / W;
        let fx = p.x + rd * rx0, fy = p.y + rd * ry0;
        for (let x = 0; x < W; x++, fx += sx, fy += sy) {
          const xi = fx | 0, yi = fy | 0;
          let f = 0;
          if (xi >= 0 && yi >= 0 && xi < N && yi < N) f = FLOOR[I(xi, yi)];
          const c = T.FLOORC[f], n = hash(Math.floor(fx * 4), Math.floor(fy * 4));
          let k = 0.85 + n * 0.25;
          if (f == 1) k = 0.8 + 0.3 * Math.max(0, Math.sin(fx * 3 + fy * 1.5 + t * 3)) * (n > 0.6);
          if (f == 5 && (fy * 4) % 2 >= 1) k *= 0.8;
          if (f == 4 && n > 0.82) k = 1.4;
          shade(fx, fy, rd);
          buf[y * W + x] = pack((c[0] * k * sh[0]) | 0, (c[1] * k * sh[1]) | 0, (c[2] * k * sh[2]) | 0);
        }
      }

      // dinding
      const S = T.SARANG;
      for (let x = 0; x < W; x++) {
        const cx = (2 * x) / W - 1, rx = dirX + plX * cx, ry = dirY + plY * cx;
        let mx = p.x | 0, my = p.y | 0;
        const ddx = Math.abs(1 / rx), ddy = Math.abs(1 / ry);
        let stx, sty, sdx, sdy;
        if (rx < 0) { stx = -1; sdx = (p.x - mx) * ddx; } else { stx = 1; sdx = (mx + 1 - p.x) * ddx; }
        if (ry < 0) { sty = -1; sdy = (p.y - my) * ddy; } else { sty = 1; sdy = (my + 1 - p.y) * ddy; }
        let side = 0, w = 0, guard = 0;
        while (guard++ < 80) {
          if (sdx < sdy) { sdx += ddx; mx += stx; side = 0; } else { sdy += ddy; my += sty; side = 1; }
          if (mx < 0 || my < 0 || mx >= N || my >= N) break;
          w = WALL[I(mx, my)];
          if (w) break;
        }
        if (!w) { zbuf[x] = 1e9; continue; }
        const d = side == 0 ? sdx - ddx : sdy - ddy;
        zbuf[x] = d;
        const hx = p.x + d * rx, hy = p.y + d * ry;
        const wx = side == 0 ? hy - Math.floor(hy) : hx - Math.floor(hx);
        const tx = Math.min(15, (wx * 16) | 0);
        const hh = H / d, top = Math.round(hz - hh * (T.HEIGHT[w] - camZ)), bot = Math.round(hz + hh * camZ);
        const TX = T.TEX[w];
        shade(hx, hy, d);
        const sd = side ? 0.78 : 1;
        const hol = w == 3 && (side == 0 ? Math.abs(hy - S.y) : Math.abs(hx - S.x)) < 0.3; // lubang sarang bercahaya
        for (let y = Math.max(0, top); y < Math.min(H, bot); y++) {
          const ty = Math.min(15, (((y - top) / (bot - top)) * 16) | 0);
          if (hol && ty >= 10) {
            const g = 0.55 + 0.15 * Math.sin(t * 2) + (ty > 12 ? 0 : 0.1);
            buf[y * W + x] = pack((150 * g) | 0, (190 * g) | 0, (80 * g) | 0);
          } else {
            const i = (ty * 16 + tx) * 3;
            buf[y * W + x] = pack((TX[i] * sh[0] * sd) | 0, (TX[i + 1] * sh[1] * sd) | 0, (TX[i + 2] * sh[2] * sd) | 0);
          }
        }
      }

      // sprite
      const SPR = T.SPR, list = [];
      const add = (o) => { o.d = (o.x - p.x) ** 2 + (o.y - p.y) ** 2; list.push(o); };
      for (const v of world.vics) {
        if (v.id == 'kucing' && !v.rescued) { add({ x: v.x, y: v.y, s: SPR.pohon, h: 2.2, z: 0 }); add({ x: v.x, y: v.y, s: SPR.kucing, h: 0.32, z: 1.45, off: 0.01 }); }
        else add({ x: v.x, y: v.y, s: SPR[v.id], h: v.id == 'kerbau' ? 0.6 : 0.5, z: 0 });
        if (v.id == 'rubah' && !v.rescued) add({ x: v.x, y: v.y, s: SPR.asap, h: 0.6, z: 0.45, off: 0.02 });
        if (!owl && !v.rescued) {
          const d = Math.hypot(v.x - p.x, v.y - p.y);
          if (d < 10) add({ x: v.x, y: v.y, s: SPR.wave, h: 0.32 * Math.max(1, d / 3), z: 0.55, emit: 0.55 + 0.35 * Math.sin(t * 4), noz: 1 });
        }
      }
      const o = view.other;
      if (o) {
        if (owl) add({ x: o.x, y: o.y, s: SPR.bear, h: 0.95, z: 0 });
        else { const fz = 0.6 + 0.05 * Math.sin(t * 2.5); add({ x: o.x, y: o.y, s: SPR.owl, h: 0.55, z: fz }); add({ x: o.x, y: o.y, s: SPR.eyes, h: 0.55, z: fz, emit: 1, off: 0.01 }); }
      }
      for (const s of world.stars) {
        const d = Math.hypot(s.x - p.x, s.y - p.y);
        add({ x: s.x, y: s.y, s: SPR.star, h: 0.25 * Math.max(1, d / 4), z: 1.1 + 0.08 * Math.sin(t * 3), emit: 1, noz: 1 });
      }
      for (const L of lights) for (let k = 0; k < (L.r > 3 ? 10 : 5); k++) {
        const a = k * 2.4 + t * 0.4 * (k % 2 ? 1 : -1), r = 0.8 + (k % 4) * 0.5;
        add({ x: L.x + Math.cos(a) * r, y: L.y + Math.sin(a) * r, s: SPR.fly, h: 0.13, z: 0.5 + 0.4 * Math.sin(t * 1.3 + k), emit: 1 });
      }
      list.sort((a, b) => b.d - a.d);
      const inv = 1 / (plX * dirY - dirX * plY);
      for (const o of list) {
        const dx = o.x - p.x, dy = o.y - p.y;
        const tX = inv * (dirY * dx - dirX * dy), tY = inv * (-plY * dx + plX * dy) - (o.off || 0);
        if (tY < 0.15) continue;
        const scx = (W / 2) * (1 + tX / tY), u = H / tY, hpx = u * o.h, Sp = o.s, wpx = (hpx * Sp.w) / Sp.h;
        const bot = hz + u * (camZ - o.z), top = bot - hpx, left = scx - wpx / 2;
        shade(o.x, o.y, Math.sqrt(o.d));
        for (let x = Math.max(0, left | 0); x < Math.min(W, left + wpx); x++) {
          if (!o.noz && zbuf[x] < tY) continue;
          const sx = Math.min(Sp.w - 1, (((x - left) / wpx) * Sp.w) | 0);
          for (let y = Math.max(0, top | 0); y < Math.min(H, bot); y++) {
            const sy = Math.min(Sp.h - 1, (((y - top) / hpx) * Sp.h) | 0), i = (sy * Sp.w + sx) * 4, al = Sp.d[i + 3];
            if (al < 20) continue;
            let r = Sp.d[i], g = Sp.d[i + 1], b = Sp.d[i + 2];
            if (o.emit) { r *= o.emit; g *= o.emit; b *= o.emit; } else { r *= sh[0]; g *= sh[1]; b *= sh[2]; }
            if (al < 250) { const q = buf[y * W + x], a = al / 255; r = r * a + (q & 255) * (1 - a); g = g * a + ((q >> 8) & 255) * (1 - a); b = b * a + ((q >> 16) & 255) * (1 - a); }
            buf[y * W + x] = pack(r | 0, g | 0, b | 0);
          }
        }
      }
      // tepi penglihatan burung hantu
      if (owl) {
        for (let y = 0; y < H; y++) for (let x = 0; x < W; x++) {
          const e = Math.hypot((x - W / 2) / (W / 2), (y - H / 2) / (H / 2));
          if (e > 0.95) { const q = buf[y * W + x], k = Math.max(0, 1 - (e - 0.95) * 1.6); buf[y * W + x] = pack(((q & 255) * k) | 0, (((q >> 8) & 255) * k) | 0, (((q >> 16) & 255) * k) | 0); }
        }
      }
      ctx.putImageData(img, 0, 0);
    }
    return { draw, resize, check };
  };
})();
