'use strict';
/* Sprite tokoh: memakai gambar dari ../pohon-madu/img (buatan pengguna).
   Tokoh tanpa gambar (Zizi) memakai gambar vektor Art sebagai cadangan.
   Semua ukuran dalam piksel dunia logika (petak 64×32), digambar di ruang R (2×). */
const SPR = (() => {
  const BASE = '../pohon-madu/img/';
  const R = 2, OS = 1.6;           // R = skala dunia, OS = oversample agar tajam saat di-zoom
  // pose: [file, menghadap]  R = kanan, L = kiri, N = netral (depan/belakang)
  const DEF = {
    ata: { h: 54, ref: 'depan', face: 'wajah', poses: {
      idle: ['siaga', 'R'], walk: ['kanan', 'R'], walkL: ['kiri', 'L'], back: ['belakang', 'N'],
      attack: ['tendang', 'R'], kilat: ['pukul', 'R'], putar: ['tendang', 'R'], sabuk: ['siaga', 'R'] } },
    ladhia: { h: 78, ref: 'depan', face: 'wajah', poses: {
      idle: ['siaga', 'R'], walk: ['kanan', 'R'], walkL: ['kiri', 'L'], back: ['belakang', 'N'],
      attack: ['ayun', 'R'], tantang: ['lempar', 'R'], benteng: ['bertahan', 'R'] } },
    bubunti: { h: 70, ref: 'depan', face: 'wajah', poses: {
      idle: ['siaga', 'R'], walk: ['kanan', 'R'], walkL: ['kiri', 'L'], back: ['belakang', 'N'],
      attack: ['ayun', 'L'], pedas: ['ayun', 'L'], sup: ['sorak', 'R'] } },
    oumaldi: { h: 58, ref: 'depan', face: 'wajah', poses: {
      idle: ['kanan', 'R'], walk: ['lari', 'R'], back: ['belakang', 'N'],
      attack: ['jongkok', 'R'], jitu: ['panah', 'R'], hujan: ['loncat-panah', 'R'] } },
    nenek: { h: 52, ref: 'depan', face: 'depan', poses: { idle: ['kanan', 'R'], back: ['belakang', 'N'] } },
    // musuh (folder musuh/, file <nama>-N): idle = sprite battle Pohon Madu (menghadap kanan kecuali L)
    kumbang: { dir: 'musuh', h: 30, ref: 'kumbang-2', face: 'kumbang-1', poses: { idle: ['kumbang-2', 'R'], back: ['kumbang-3', 'R'] } },
    tawon: { dir: 'musuh', h: 34, lift: 20, ref: 'tawon-4', face: 'tawon-1', poses: { idle: ['tawon-4', 'R'], back: ['tawon-3', 'R'] } },
    siput: { dir: 'musuh', h: 36, ref: 'siput-2', face: 'siput-1', poses: { idle: ['siput-2', 'L'], back: ['siput-4', 'L'] } },
    rajaKumbang: { dir: 'musuh', h: 68, ref: 'raja-kumbang-2', face: 'raja-kumbang-1', poses: { idle: ['raja-kumbang-2', 'L'], back: ['raja-kumbang-4', 'N'], attack: ['raja-kumbang-5', 'R'] } },
    musang: { dir: 'musuh', h: 28, ref: 'musang-4', face: 'musang-1', poses: { idle: ['musang-4', 'R'], back: ['musang-3', 'N'] } },
    kelelawar: { dir: 'musuh', h: 26, lift: 24, ref: 'kelelawar-3', face: 'kelelawar-1', poses: { idle: ['kelelawar-3', 'R'], back: ['kelelawar-4', 'N'] } },
    kadal: { dir: 'musuh', h: 28, ref: 'kadal-3', face: 'kadal-1', poses: { idle: ['kadal-3', 'R'], back: ['kadal-4', 'R'] } },
    landak: { dir: 'musuh', h: 34, ref: 'landak-4', face: 'landak-1', poses: { idle: ['landak-4', 'R'], back: ['landak-3', 'N'] } },
    kepalaMusang: { dir: 'musuh', h: 66, ref: 'kepala-musang-4', face: 'kepala-musang-1', poses: { idle: ['kepala-musang-4', 'R'], back: ['kepala-musang-2', 'N'], attack: ['kepala-musang-4', 'R'] } },
    // Bab 2 Hutan Lembab
    nyamuk: { dir: 'musuh', h: 30, lift: 22, ref: 'nyamuk-2', face: 'nyamuk-1', poses: { idle: ['nyamuk-2', 'R'], back: ['nyamuk-4', 'N'] } },
    katak: { dir: 'musuh', h: 30, ref: 'katak-3', face: 'katak-1', poses: { idle: ['katak-3', 'L'], back: ['katak-4', 'N'] } },
    jamur: { dir: 'musuh', h: 40, ref: 'jamur-3', face: 'jamur-1', poses: { idle: ['jamur-3', 'R'], back: ['jamur-4', 'N'] } },
    belut: { dir: 'musuh', h: 22, ref: 'belut-2', face: 'belut-1', poses: { idle: ['belut-2', 'R'], back: ['belut-1', 'L'] } },
    lumpurKecil: { dir: 'musuh', h: 34, ref: 'lumpur-raksasa-2', face: 'lumpur-raksasa-1', poses: { idle: ['lumpur-raksasa-2', 'R'], back: ['lumpur-raksasa-3', 'N'] } },
    ular: { dir: 'musuh', h: 62, ref: 'ular-4', face: 'ular-1', poses: { idle: ['ular-4', 'R'], back: ['ular-7', 'N'], attack: ['ular-8', 'R'] } },
    lumpurRaksasa: { dir: 'musuh', h: 70, ref: 'lumpur-raksasa-2', face: 'lumpur-raksasa-1', poses: { idle: ['lumpur-raksasa-2', 'R'], back: ['lumpur-raksasa-3', 'N'], attack: ['lumpur-raksasa-1', 'N'] } },
  };
  const VEC_SCALE = 1.8;           // skala gambar vektor Art
  const store = {};                // kind -> {pose -> processed}
  const faces = {};

  function loadImg(src) {
    return new Promise(res => { const i = new Image(); i.onload = () => res(i); i.onerror = () => res(null); i.src = src; });
  }
  function trim(img) {
    const c = document.createElement('canvas'); c.width = img.width; c.height = img.height;
    const x = c.getContext('2d'); x.drawImage(img, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height).data;
    let x0 = c.width, y0 = c.height, x1 = -1, y1 = -1;
    for (let y = 0; y < c.height; y++) for (let xx = 0; xx < c.width; xx++) if (d[(y * c.width + xx) * 4 + 3] > 40) { if (xx < x0) x0 = xx; if (xx > x1) x1 = xx; if (y < y0) y0 = y; if (y > y1) y1 = y; }
    if (x1 < 0) return { c, x0: 0, y0: 0, w: c.width, h: c.height, ax: c.width / 2 };
    // titik pijak x = rata-rata piksel di 12% baris terbawah
    const band = Math.max(3, Math.round((y1 - y0) * 0.12)); let sx = 0, n = 0;
    for (let y = y1 - band; y <= y1; y++) for (let xx = x0; xx <= x1; xx++) if (d[(y * c.width + xx) * 4 + 3] > 40) { sx += xx; n++; }
    return { c, x0, y0, w: x1 - x0 + 1, h: y1 - y0 + 1, ax: (n ? sx / n : (x0 + x1) / 2) - x0 };
  }
  function process(t, scale) {
    const pad = 4;
    const w = Math.ceil(t.w * scale) + pad * 2, h = Math.ceil(t.h * scale) + pad * 2;
    const a = document.createElement('canvas'); a.width = w; a.height = h;
    const x = a.getContext('2d'); x.imageSmoothingQuality = 'high';
    x.drawImage(t.c, t.x0, t.y0, t.w, t.h, pad, pad, t.w * scale, t.h * scale);
    // volume lembut: terang kiri-atas, teduh kebiruan kanan-bawah
    x.globalCompositeOperation = 'source-atop';
    const g = x.createLinearGradient(0, 0, w, h);
    g.addColorStop(0, 'rgba(255,236,200,0.14)'); g.addColorStop(0.55, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(24,30,70,0.28)');
    x.fillStyle = g; x.fillRect(0, 0, w, h);
    // garis luar tipis gelap
    const sil = document.createElement('canvas'); sil.width = w; sil.height = h; const s = sil.getContext('2d');
    s.drawImage(a, 0, 0); s.globalCompositeOperation = 'source-in'; s.fillStyle = 'rgba(22,16,12,0.9)'; s.fillRect(0, 0, w, h);
    const o = document.createElement('canvas'); o.width = w; o.height = h; const y = o.getContext('2d');
    const r = 1.6 * OS;
    for (let k = 0; k < 8; k++) { const th = k / 8 * Math.PI * 2; y.drawImage(sil, Math.cos(th) * r, Math.sin(th) * r); }
    y.drawImage(a, 0, 0);
    return { cv: o, ax: pad + t.ax * scale, ay: pad + t.h * scale, w, h };
  }
  async function load() {
    const jobs = [];
    for (const [kind, d] of Object.entries(DEF)) {
      jobs.push((async () => {
        const files = new Set([d.ref, ...Object.values(d.poses).map(p => p[0])]);
        const imgs = {};
        await Promise.all([...files].map(async f => { imgs[f] = await loadImg(BASE + (d.dir || kind) + '/' + f + '.png'); }));
        if (!imgs[d.ref]) return;
        const ref = trim(imgs[d.ref]);
        const scale = d.h / ref.h * R * OS;
        const out = {};
        const done = {};
        for (const [pose, [f, dir]] of Object.entries(d.poses)) {
          if (!imgs[f]) continue;
          if (!done[f]) done[f] = process(trim(imgs[f]), scale);
          out[pose] = { ...done[f], dir };
        }
        store[kind] = out;
        const fi = await loadImg(BASE + (d.dir || kind) + '/' + d.face + '.png');
        if (fi) faces[kind] = fi;
      })());
    }
    await Promise.all(jobs);
  }
  const has = k => !!store[k];
  function height(k) { if (DEF[k] && store[k]) return DEF[k].h + (DEF[k].lift || 0); return (Art.H[k] || 36) * VEC_SCALE; }
  function width(k) { if (DEF[k] && store[k]) { const p = store[k].idle; return p ? Math.min(90, p.w / (R * OS)) : DEF[k].h * 0.62; } return (Art.BIG[k] ? 30 : 21) * VEC_SCALE; }
  const big = k => (DEF[k] ? DEF[k].h >= 60 : !!Art.BIG[k]);

  /* Gambar tokoh. ctx sudah di ruang R dengan titik asal di titik pijak. */
  function draw(c, kind, dir, anim, ap, t, o = {}) {
    const right = dir === 0 || dir === 3, back = dir === 2 || dir === 3;
    const set = store[kind];
    if (!set) { // cadangan vektor
      c.save(); c.scale(R * VEC_SCALE, R * VEC_SCALE);
      Art.drawCharacter(c, kind, dir, anim, ap, t, o);
      c.restore(); return;
    }
    let pose = 'idle';
    if (anim === 'walk') pose = back ? 'back' : (right ? 'walk' : (set.walkL ? 'walkL' : 'walk'));
    else if (anim === 'attack') pose = o.pose && set[o.pose] ? o.pose : 'attack';
    else if (anim === 'skill') pose = o.pose && set[o.pose] ? o.pose : 'idle';
    else if (back && anim !== 'faint') pose = 'back';
    const p = set[pose] || set.idle;
    const flip = (p.dir === 'R' && !right) || (p.dir === 'L' && right) || (p.dir === 'N' && !right);
    let lx = 0, ly = 0, rot = 0, sy = 1, alpha = 1, flash = 0;
    switch (anim) {
      case 'idle': sy = 1 + Math.sin(t * 2.6 + (o.seed || 0)) * 0.012; break;
      case 'walk': ly = -Math.abs(Math.sin(t * 18)) * 3; break;
      case 'attack': { const s = Math.sin(ap * Math.PI); lx = s * 9; ly = -s * 2; break; }
      case 'skill': ly = -Math.sin(ap * Math.PI) * 12; if (o.spin) sy = 1; break;
      case 'hurt': lx = -Math.sin(ap * Math.PI) * 6 + Math.sin(t * 70) * 1.5; flash = 1 - ap; break;
      case 'faint': rot = Math.min(1, ap * 1.6) * 1.35; alpha = 1 - Math.min(0.35, ap * 0.4); break;
    }
    const k = 1 / OS, lift = DEF[kind].lift || 0;
    if (lift) ly -= lift + (anim === 'faint' ? -lift * Math.min(1, ap * 1.5) : Math.sin(t * 5 + (o.seed || 0)) * 3);
    c.save();
    c.globalAlpha *= alpha;
    c.translate((right ? lx : -lx) * R, ly * R);
    if (rot) c.rotate(right ? -rot : rot);
    c.scale(flip ? -k : k, k * sy);
    if (o.spin) c.scale(Math.cos(ap * Math.PI * 4) >= 0 ? 1 : -1, 1);
    c.drawImage(p.cv, -p.ax, -p.ay);
    if (flash > 0) { c.globalCompositeOperation = 'lighter'; c.globalAlpha = 0.45 * flash; c.drawImage(p.cv, -p.ax, -p.ay); }
    c.restore();
  }
  /* Potret untuk kartu & dialog */
  function portrait(kind, size) {
    const c = document.createElement('canvas'); c.width = size * 2; c.height = size * 2;
    c.style.width = size + 'px'; c.style.height = size + 'px'; c.className = 'pt';
    const x = c.getContext('2d'); x.imageSmoothingQuality = 'high';
    const f = faces[kind];
    if (f) {
      const t = trim(f), s = Math.max(size * 2 / t.w, size * 2 / t.h) * (kind === 'nenek' ? 1.9 : 1.05);
      const dx = (size * 2 - t.w * s) / 2, dy = kind === 'nenek' ? -size * 0.05 : size * 2 - t.h * s;
      x.drawImage(t.c, t.x0, t.y0, t.w, t.h, dx, dy, t.w * s, t.h * s);
    } else if (kind) {
      const hh = (Art.H[kind] || 36);
      const s = size * 2 * 0.85 / (hh + 6);
      x.translate(size, size * 2 - 6); x.scale(s, s);
      Art.drawCharacter(x, kind, 0, 'idle', 0, 0.3);
    }
    return c;
  }
  return { load, has, height, width, big, draw, portrait, R };
})();
