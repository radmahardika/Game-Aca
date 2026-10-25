// Angkasa Mart — pixel art detail: sprite, latar berlapis, dan cahaya.
// Semua digambar ke kanvas 392×272 lalu diperbesar 3× (pixelated).
(function () {
  const AM = window.AM;
  const W = 392, H = 272, GY = 196;
  const art = (AM.art = { W, H, GY });

  const PAL = {
    K: '#1a1420', h: '#2a1c14', H: '#4a3426', s: '#c48a5e', S: '#9a6644', l: '#dba37a', e: '#1a1420', p: '#d9776f',
    w: '#e8e2d0', W: '#b3ab98', g: '#6d6f80', r: '#c8463d', R: '#86282a', y: '#f2c14e', Y: '#b9852a',
    o: '#e8893a', O: '#b05e22', q: '#ffd88a', c: '#f3e9c8', C: '#cdbf95', v: '#8a5aa6', V: '#5d3a78', u: '#b58bd0',
    b: '#bfe3ee', B: '#7fb3c8', t: '#6fb0ae', T: '#3f7f86', m: '#7d8aa0', M: '#4d566c', n: '#a9b6c8', d: '#34354a',
    f: '#e6d38a', F: '#c9a94e', z: '#fff1c0',
  };

  // ---------- alat gambar ----------
  let x = null;
  function mk(w, h) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const ctx = c.getContext('2d'); ctx.imageSmoothingEnabled = false; return [c, ctx];
  }
  const px = (a, b, w, h, c) => { x.fillStyle = c; x.fillRect(a | 0, b | 0, w | 0, h | 0); };
  function dith(a, b, w, h, c1, c2) { for (let j = 0; j < h; j++) for (let i = 0; i < w; i++) px(a + i, b + j, 1, 1, (i + j) % 2 ? c1 : c2); }
  function band(y0, y1, cols) {
    const n = cols.length;
    for (let y = y0; y < y1; y++) {
      const t = (y - y0) / (y1 - y0) * (n - 1), k = Math.floor(t), f = t - k;
      for (let i = 0; i < W; i++) px(i, y, 1, 1, f > ((i * 7 + y * 13) % 16) / 16 ? cols[Math.min(k + 1, n - 1)] : cols[k]);
    }
  }
  let seed = 7;
  const rnd = () => { seed = (seed * 9301 + 49297) % 233280; return seed / 233280; };
  function stars(n, ymax) {
    for (let i = 0; i < n; i++) {
      const a = rnd() * W, b = rnd() * ymax, k = rnd();
      px(a, b, 1, 1, k > 0.85 ? '#fff6d8' : k > 0.5 ? '#b9b2d8' : '#6f68a0');
      if (k > 0.95) { px(a - 1, b, 1, 1, '#7b74a8'); px(a + 1, b, 1, 1, '#7b74a8'); px(a, b - 1, 1, 1, '#7b74a8'); px(a, b + 1, 1, 1, '#7b74a8'); }
    }
  }
  function ball(cx, cy, r, fn) {
    for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const d = Math.hypot(i, j); if (d <= r) { const c = fn(i, j, d); if (c) px(cx + i, cy + j, 1, 1, c); } }
  }
  function glowOn(ctx, cx, cy, r, rgb, a) {
    const g = ctx.createRadialGradient(cx, cy, 0, cx, cy, r);
    g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`);
    ctx.globalCompositeOperation = 'lighter'; ctx.fillStyle = g; ctx.fillRect(cx - r, cy - r, r * 2, r * 2);
    ctx.globalCompositeOperation = 'source-over';
  }
  const glow = (cx, cy, r, rgb, a) => glowOn(x, cx, cy, r, rgb, a);
  art.glow = glowOn;

  // ---------- sprite ----------
  const S = (art.S = {});
  S.ANGKASA = [
    '......KKKKKK......',
    '....KKhhhhhhKK....',
    '...KhhHhhhhhhhK...',
    '..KhhhhhhHhhhhhK..',
    '..KhhhhhhhhhhhhK..',
    '.KshhhhhhhhhhhhsK.',
    '.KlssssssssssssSK.',
    '.KlsseKssssKessSK.',
    '.KlsseKssssKessSK.',
    '.KlspssssssssspSK.',
    '.KlsssKssssKsssSK.',
    '..KssssKKKKsssSK..',
    '...KKssssssssKK...',
    '.....KKKSSKKK.....',
    '...KKwwwrrwwwKK...',
    '..KwwwwwrrwwwwWK..',
    '.KwwwwwwyywwwWWWK.',
    '.KwwrrrrrrrrrrWWK.',
    'KswwwwwwwwwwwwWWsK',
    'KsKwwwwwwwwwwwWKSK',
    '.KKwwwwwwwwwwwWKK.',
    '..KwwwwwwwwwwwWK..',
  ];
  S.ANGKASA_FULL = S.ANGKASA.concat([
    '..KwwwwwwwwwwwWK..',
    '..KrrrrrrrrrrrRK..',
    '..KddddddddddddK..',
    '..KddddKKKdddddK..',
    '..KddddK.KddddK...',
    '..KddddK.KddddK...',
    '..KrrrrK.KrrrrK...',
    '.KrrrrRK.KrrrrRK..',
    '.KKKKKKK.KKKKKKK..',
  ]);
  const blink = (rows) => rows.map((r, j) => j === 7 ? r.replace('eK', 'ss').replace('Ke', 'ss') : j === 8 ? r.replace('eK', 'KK').replace('Ke', 'KK') : r);
  S.ANGKASA_KEDIP = blink(S.ANGKASA);
  S.ANGKASA_FULL_KEDIP = blink(S.ANGKASA_FULL);

  // alien Tundra (bermata satu), Fores (bertopi jamur), Peri (bermata tiga, bersayap)
  S.tundra = [
    '..Ky......yK....',
    '...K......K.....',
    '...vK....Kv.....',
    '....vKKKKv......',
    '..KKvvvvvvKK....',
    '.KvuvvvvvvvVK...',
    '.KvuKKKKvvvVK...',
    '.KvKcccKvvvVK...',
    '.KvKceeKvvvVK...',
    '.KvKcccKvvvVK...',
    '.KvuKKKKvvVVK...',
    '.KvuvvKKvvVVK...',
    '.KvuvvvvvvVVK...',
    'KvvvvvvvvvvVVK..',
    'KVvvvvvvvvvVVK..',
    '.KvvvvvvvvvVK...',
    '.KVvvvvvvvVVK...',
    '..KVK...KVK.....',
    '..KKK...KKK.....',
  ];
  S.fores = [
    '....KKKKKKKK....',
    '..KKvuuvvvvvKK..',
    '.KvuucvvvvcvvVK.',
    'KvuvvvvvcvvvvVVK',
    'KvvvcvvvvvvvVVVK',
    'KKKKKKKKKKKKKKKK',
    '....KccccccCK...',
    '....KcKcccKCK...',
    '....KcKcccKCK...',
    '....KccccccCK...',
    '....KccKKccCK...',
    '....KccccccCK...',
    '....KCccccCCK...',
    '.....KCK.KCK....',
    '.....KKK.KKK....',
  ];
  S.peri = [
    '..K..........K....',
    '.KoK........KoK...',
    '.KqoK......KoOK...',
    '..KooKKKKKKooK....',
    '..KoqqoooooooOK...',
    '.KoqcccocccocccoOK',
    '.KoqcKcocKcocKcoOK',
    '.KoqcccocccocccoOK',
    '.KoqoooooooooooOOK',
    '.KoqoooooooooooOK.',
    '.KoqooKRRRKoooOOK.',
    '.KooooKRRRKoooOOK.',
    '.KoqoooKKKooooOOK.',
    'KooqooooooooooOOOK',
    'KOooooooooooooOOOK',
    'KOKooooooooooooKOK',
    '.KKooooooooooooKK.',
    '..KoooooooooooOK..',
    '..KoooooooooooOK..',
    '..KOoooooooooOOK..',
    '..KOOooooooooOOK..',
    '...KOOKKKKKOOK....',
    '...KOK.....KOK....',
    '..KOOK.....KOOK...',
    '..KKKK.....KKKK...',
  ];
  art.VARIAN = {
    tundra: [{}, { v: '#4fa3a8', V: '#2f6f78', u: '#8fd0cc' }, { v: '#5a7fd0', V: '#3a55a0', u: '#9ab4f0' }],
    fores: [{}, { v: '#c8463d', V: '#86282a', u: '#e88a7a' }, { v: '#4f8fd0', V: '#2f5f9a', u: '#9ac4f0' }],
    peri: [{}, { o: '#e86a9a', O: '#b04a72', q: '#f6a0c0' }, { o: '#e8c23a', O: '#b0901a', q: '#f6e08a' }],
  };
  S.ROTNI = [
    '........K.........',
    '.......KyK........',
    '........K.........',
    '....KKKKKKKKKK....',
    '...KnnnnnnnnnnK...',
    '..KnnKKKKKKKKnmK..',
    '..KnKbbbbbbbbKmK..',
    '..KnKbKbbbbKbKmK..',
    '..KnKbKbbbbKbKmK..',
    '..KnKbbKKKKbbKmK..',
    '..KnKbbbbbbbbKmK..',
    '..KnnKKKKKKKKmmK..',
    '...KnnnnnnnmmmK...',
    '....KKKKKKKKKK....',
    '.KK.KmnnyynmmK.KK.',
    'KnnKKmnnnnnmmKKnmK',
    '.KK.KmmmmmmmmK.KK.',
    '.....KKKKKKKK.....',
    '......KrqqrK......',
    '.......KqqK.......',
    '........KK........',
  ];
  S.ROTNI_KEPALA = S.ROTNI.slice(0, 14);
  S.STAR = ['...y...', '...y...', 'yyyyyyy', '.yyyyy.', '..yYy..', '.yY.Yy.', 'y.....y'];
  S.HEART = ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'];
  S.ROKET = ['.....KK.....', '....KwwK....', '...KwwwWK...', '..KwwwwwWK..', '..KwbbbwWK..', '..KwbBbwWK..', '..KwwwwwWK..', '..KrrrrrRK..', '..KwwwwwWK..', '..KwwwwwWK..', '..KwwwwwWK..', '.KrKwwwwWKrK', 'KrrKwwwwWKrR', 'KrRKrrrrRKRR', 'KK.KKKKKKK.K', '....KqqK....', '....KyyK....'];
  S.PETI = ['KKKKKKKKKKKK', 'KFFFFFFFFFYK', 'KFYYYYYYYYYK', 'KFFFFKKFFFYK', 'KFFFFFFFFFYK', 'KYYYYYYYYYYK', 'KKKKKKKKKKKK'];

  // barang
  const ITEM = (art.ITEM = {
    selimut: ['KKKKKKKKKK', 'KrrrrrrrRK', 'KccccccccK', 'KrrrrrrrRK', 'KccccccccK', 'KrrrrrrrRK', 'KKKKKKKKKK'],
    termos: ['..KKKK..', '.KrrrRK.', '.KKKKKK.', 'KttttTTK', 'KtcttTTK', 'KtcttTTK', 'KttttTTK', 'KtyyyyTK', 'KttttTTK', 'KttttTTK', '.KKKKKK.'],
    payung: ['....KKK....', '..KKtttKK..', '.KttttTTTK.', 'KttttTTTTTK', 'KKKKKKKKKKK', '.....K.....', '.....K.....', '.....K.....', '...K.K.....', '....K......'],
    senter: ['KKKKKKKK....', 'KddddddKKK..', 'KdgddddKqqK.', 'KdgddddKqqKz', 'KddddddKKK..', 'KKKKKKKK....'],
    kipas: ['...KKKKK...', '..KbbcbbK..', '.KbbbcbbBK.', 'KccbbcbBccK', 'KbccbKbccBK', 'KbbbKKKbbBK', 'KbccbKbccBK', 'KccbbcbBccK', '.KbbbcbbBK.', '..KBBcBBK..', '...KKKKK...', '.....K.....', '....KdK....', '..KKKKKKK..'],
    kacamata: ['KKKKKKKKKKK', 'KddKKKKddKK', 'KbdK...KbdK', '.KK.....KK.'],
    kerupuk: ['.KKK.KKK..', 'KffffffCK.', 'KfCfffffK.', 'KffffCfffK', 'KfffffffCK', '.KffCfffK.', '..KKKKKK..'],
    sikat: ['........Kc', '......KKbK', '.....KppK.', '....KppK..', '...KppK...', '..KppK....', '.KppK.....', 'KppK......', 'KKK.......'],
  });
  PAL.F = '#c9a94e';

  const cache = new Map();
  function sprite(rows, z, swap) {
    z = z || 1;
    let m = cache.get(rows); if (!m) { m = new Map(); cache.set(rows, m); }
    const key = z + JSON.stringify(swap || 0);
    let c = m.get(key);
    if (!c) {
      const w = Math.max(...rows.map((r) => r.length));
      const pal = swap ? Object.assign({}, PAL, swap) : PAL;
      const [cv, ctx] = mk(w * z, rows.length * z);
      rows.forEach((r, j) => { [...r].forEach((ch, i) => { if (ch !== '.' && pal[ch]) { ctx.fillStyle = pal[ch]; ctx.fillRect(i * z, j * z, z, z); } }); });
      c = cv; m.set(key, c);
    }
    return c;
  }
  art.sprite = sprite;
  art.draw = (ctx, rows, a, b, z, swap) => { ctx.drawImage(sprite(rows, z, swap), Math.round(a), Math.round(b)); };
  art.size = (rows, z) => [Math.max(...rows.map((r) => r.length)) * (z || 1), rows.length * (z || 1)];
  const urlCache = {};
  art.url = (rows, z) => { const k = rows.join('') + z; return urlCache[k] || (urlCache[k] = sprite(rows, z || 1).toDataURL()); };
  // <img> pixel: 1 piksel sprite = 3 piksel layar × z
  art.img = (rows, z, cls) => { const [w, h] = art.size(rows, 1); z = z || 1; return `<img class="pxi ${cls || ''}" alt="" src="${art.url(rows, 1)}" style="width:${w * 3 * z}px;height:${h * 3 * z}px">`; };
  art.icon = (k, z, cls) => art.img(ITEM[k], z, cls);

  // sayap peri (transparan) di belakang alien Peri
  art.wings = function (ctx, cx, cy, t) {
    const flap = Math.round(Math.sin(t * 9) * 2);
    for (const side of [-1, 1]) {
      for (let j = 0; j < 22; j++) for (let i = 0; i < 14; i++) {
        const dx = (i - 7) / 7, dy = (j - 11) / 11;
        const d = dx * dx + dy * dy; if (d >= 1) continue;
        ctx.fillStyle = d > 0.7 ? 'rgba(255,240,255,.9)' : 'rgba(200,170,255,.45)';
        ctx.fillRect(cx + side * 22 + i - 7, cy + j - 11 - flap * (side > 0 ? 1 : -1) * 0, 1, 1 + (j % 3 === 0 ? 0 : 0));
      }
    }
    glowOn(ctx, cx, cy, 28, '230,180,255', 0.18);
  };
  // gambar alien lengkap (kaki di GY), mengembalikan lebar sprite
  art.alien = function (ctx, sp, varian, a, feet, t, opt) {
    opt = opt || {};
    const rows = S[sp], [w, h] = art.size(rows, 2);
    const bob = opt.still ? 0 : Math.round(Math.abs(Math.sin(t * (opt.walk ? 10 : 2.4))) * (opt.walk ? 3 : 1.5));
    const top = feet - h - bob;
    ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(a + 4, feet - 1, w - 8, 2);
    if (sp === 'peri') art.wings(ctx, a + w / 2, top + 22, t);
    art.draw(ctx, rows, a, top, 2, art.VARIAN[sp][varian || 0]);
    if (opt.shiver) { // menggigil
      ctx.fillStyle = '#bfe3ee';
      const k = Math.floor(t * 6) % 2;
      [[-6, 10 + k], [-4, 18 - k], [w + 3, 12 - k], [w + 1, 20 + k]].forEach(([i, j]) => ctx.fillRect(a + i, top + j, 3, 1));
    }
    if (opt.scarf) { ctx.fillStyle = '#c8463d'; ctx.fillRect(a + 2, top + h - 20, w - 6, 4); ctx.fillRect(a + w - 12, top + h - 20, 4, 9); ctx.fillStyle = '#e86a5a'; ctx.fillRect(a + 2, top + h - 20, w - 6, 1); }
    return [w, h, top];
  };
  // helm kaca Angkasa
  art.helmet = function (ctx, cx, cy) {
    const r = 21;
    ctx.fillStyle = 'rgba(191,227,238,.85)';
    for (let a = 0; a < Math.PI * 2; a += 0.02) {
      const X = Math.round(cx + Math.cos(a) * r), Y = Math.round(cy + Math.sin(a) * r);
      if (Y < cy + 14) ctx.fillRect(X, Y, 1, 1);
    }
    ctx.fillStyle = '#fff'; ctx.fillRect(cx - 13, cy - 14, 3, 1); ctx.fillRect(cx - 15, cy - 12, 1, 3); ctx.fillStyle = '#e6f6fb'; ctx.fillRect(cx - 16, cy - 9, 1, 3);
  };
  art.angkasa = function (ctx, a, top, t, full) {
    const k = (t % 4) > 3.85;
    const rows = full ? (k ? S.ANGKASA_FULL_KEDIP : S.ANGKASA_FULL) : (k ? S.ANGKASA_KEDIP : S.ANGKASA);
    if (full) { ctx.fillStyle = 'rgba(0,0,0,.3)'; ctx.fillRect(a + 4, top + rows.length * 2 - 1, 28, 2); }
    art.draw(ctx, rows, a, top, 2);
    art.helmet(ctx, a + 18, top + 12);
  };
  art.rotni = function (ctx, a, top, t, z, crate) {
    z = z || 2;
    const bob = Math.round(Math.sin(t * 3) * 2);
    const flame = Math.floor(t * 10) % 2 ? { r: '#ffd88a', q: '#fff1c0' } : null;
    art.draw(ctx, S.ROTNI, a, top + bob, z, flame);
    if (crate) art.draw(ctx, S.PETI, a + 3 * z, top + bob + 19 * z, z);
    glowOn(ctx, a + 9 * z, top + bob + 19 * z, 10 * z, '255,200,120', 0.25);
  };

  // ---------- latar ----------
  function wallStation(wy, wb) {
    px(0, wy, W, wb - wy, '#5d6178');
    for (let row = 0; row * 9 + wy < wb; row++) {
      const off = row % 2 ? 8 : 0;
      for (let i = -off; i < W; i += 17) {
        const X = i, Y = wy + row * 9;
        px(X + 1, Y + 1, 15, 7, row % 3 === 1 ? '#6a6f88' : '#62667e'); px(X + 1, Y + 1, 15, 1, '#7d82a0'); px(X + 1, Y + 7, 15, 1, '#474a5e');
        if (rnd() > 0.6) px(X + 3, Y + 3, 1, 1, '#8d92ae');
        if (rnd() > 0.8) dith(X + 6, Y + 3, 4, 3, '#565a70', '#62667e');
      }
    }
  }
  function skyStation() {
    band(0, 150, ['#0f0d24', '#1d1740', '#2d2358', '#47326a', '#6b4a78', '#9b6a7c']);
    stars(120, 120);
    for (let i = 0; i < 300; i++) { const a = 180 + rnd() * 200, b = 20 + rnd() * 60 + Math.sin(a / 30) * 12; px(a, b, 2, 1, 'rgba(150,100,190,.18)'); }
  }
  function ringPlanet(cx, cy, r) {
    ball(cx, cy, r, (i, j) => {
      const l = (-i - j) / (r * 1.4) + 0.2;
      let c = l > 0.55 ? '#f2b07a' : l > 0.25 ? '#d9845a' : l > -0.1 ? '#a85a4a' : l > -0.4 ? '#6e3a46' : '#3d2238';
      if (Math.abs(l - 0.25) < 0.06 && (i + j) % 2) c = '#d9845a';
      if (Math.abs(l + 0.1) < 0.06 && (i + j) % 2) c = '#6e3a46';
      if (Math.abs(j - i * 0.15 - 4) < 2.5) c = l > 0 ? '#f6d29a' : '#8a5a5a';
      return c;
    });
    for (let a = 0; a < Math.PI * 2; a += 0.01) {
      const X = cx + Math.cos(a) * r * 1.75, Y = cy + 3 + Math.sin(a) * 9 - Math.cos(a) * 6, front = Math.sin(a) > 0;
      if (!front && Math.hypot(X - cx, Y - cy) < r) continue;
      px(X, Y, 1, 1, front ? '#f3d9a0' : '#b98f6e'); px(X, Y + 1, 1, 1, '#8a6650');
    }
  }
  function ridge(base, amp, col, step, sd) {
    seed = sd;
    for (let i = 0; i < W; i += step) {
      const y = base - rnd() * amp; px(i, y, step, H - y, col);
      if (rnd() > 0.7) { const hh = 8 + rnd() * 20; px(i + step / 2 - 2, y - hh, 4, hh, col); px(i + step / 2 - 4, y - hh, 8, 3, col); }
    }
  }
  function groundMoss(gy) {
    px(0, gy, W, H - gy, '#4a3428');
    for (let j = gy + 6; j < H; j += 7) for (let i = -(j % 14); i < W; i += 14) { px(i, j, 13, 6, '#5a4030'); px(i, j, 13, 1, '#6e5040'); if (rnd() > 0.7) px(i + 4, j + 2, 3, 2, '#3a2820'); }
    for (let i = 0; i < W; i++) { const h = 2 + ((i * 7) % 5 > 2 ? 1 : 0); px(i, gy - 1, 1, h + 2, '#3f8f6a'); px(i, gy - 1, 1, 1, '#6fd09a'); if (rnd() > 0.8) px(i, gy - 3, 1, 2, '#4fae7c'); }
    px(0, gy + 3, W, 2, '#2f6a50');
    for (let i = 0; i < W; i += 3) if (rnd() > 0.5) px(i, gy + 5, 1, 1 + rnd() * 3, '#2f6a50');
  }
  function crate(a, b) { px(a, b, 18, 16, '#2a1c18'); px(a + 1, b + 1, 16, 14, '#8a5a36'); px(a + 1, b + 1, 16, 1, '#b0784a'); px(a + 1, b + 7, 16, 1, '#5e3f2e'); px(a + 8, b + 1, 1, 14, '#5e3f2e'); }
  function plant(a, b, c1, c2) { for (let k = 0; k < 4; k++) { const hh = 10 + k * 4; px(a + k * 2, b - hh, 1, hh, c1); px(a + k * 2 - 1, b - hh, 3, 3, c2); } }
  const FONT = { A: ['010', '101', '111', '101', '101'], N: ['110', '101', '101', '101', '101'], G: ['011', '100', '101', '101', '011'], K: ['101', '110', '100', '110', '101'], S: ['011', '100', '010', '001', '110'], M: ['101', '111', '111', '101', '101'], R: ['110', '101', '110', '101', '101'], T: ['111', '010', '010', '010', '010'], ' ': ['000', '000', '000', '000', '000'] };
  function word(s, ox, oy, c) { [...s].forEach((ch, k) => FONT[ch].forEach((r, j) => [...r].forEach((b, i) => { if (b === '1') px(ox + k * 4 + i, oy + j, 1, 1, c); }))); }

  // Stasiun + kios Angkasa Mart. back = di belakang tokoh, front = meja & tanaman depan.
  function buildStation() {
    const [back, bx] = mk(W, H); x = bx; seed = 7;
    skyStation(); ringPlanet(62, 48, 26);
    ridge(120, 26, '#5a4470', 6, 11);
    x.fillStyle = 'rgba(150,110,140,.35)'; x.fillRect(0, 80, W, 80);
    ridge(136, 22, '#3f3358', 5, 23);
    x.fillStyle = 'rgba(130,95,125,.30)'; x.fillRect(0, 100, W, 60);
    [[150, 138, 16], [188, 140, 10], [228, 136, 13]].forEach(([a, b, r]) => {
      for (let j = -r; j <= 0; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) px(a + i, b + j, 1, 1, i < -r / 3 ? '#5b4e78' : '#463c62');
      px(a - 2, b - r - 6, 1, 6, '#463c62'); px(a - 2, b - r - 7, 1, 1, '#ffd88a');
    });
    for (let i = 0; i < 14; i++) px(140 + rnd() * 110, 128 + rnd() * 10, 1, 1, '#ffd88a');
    const wy = 118, wb = 196;
    wallStation(wy, wb);
    for (let i = 4; i < W; i += 30) { px(i, wy - 10, 18, 11, '#62667e'); px(i, wy - 10, 18, 1, '#8a8fab'); px(i, wy - 10, 1, 11, '#7d82a0'); px(i + 17, wy - 10, 1, 11, '#474a5e'); }
    px(0, wy - 1, W, 2, '#474a5e'); px(0, wy, W, 1, '#8a8fab');
    px(0, 150, W, 3, '#3f4256'); px(0, 150, W, 1, '#7a7f98'); for (let i = 10; i < W; i += 40) px(i, 149, 3, 5, '#2f3142');
    [96, 176].forEach((a) => { px(a, wy, 6, wb - wy, '#4b3d3a'); px(a, wy, 1, wb - wy, '#7a5f50'); px(a + 5, wy, 1, wb - wy, '#2e2422'); });
    for (let y = 170; y < 196; y++) { x.fillStyle = `rgba(180,140,170,${(y - 170) / 26 * 0.22})`; x.fillRect(0, y, W, 1); }
    // kios
    const kx = 258;
    px(kx, 96, W - kx, 100, '#4a3226');
    for (let j = 0; j < 100; j += 6) for (let i = 0; i < W - kx; i += 12) { const o = (j / 6) % 2 ? 6 : 0; px(kx + i + o, 96 + j, 11, 5, j % 12 ? '#5e3f2e' : '#583b2b'); px(kx + i + o, 96 + j, 11, 1, '#7a5440'); }
    px(352, 108, 26, 22, '#2a1c18'); px(354, 110, 10, 8, '#f2c070'); px(366, 110, 10, 8, '#e8a85a'); px(354, 120, 10, 8, '#e8a85a'); px(366, 120, 10, 8, '#f2c070');
    for (let i = 0; i < W - kx + 8; i++) px(kx - 6 + i, 82, 1, 12, '#3a2620');
    for (let i = 0; i < W - kx + 8; i += 2) { px(kx - 6 + i, 84, 2, 10, Math.floor(i / 10) % 2 ? '#c8463d' : '#f3e9c8'); px(kx - 6 + i, 93, 2, 1, '#2a1c18'); }
    for (let i = 0; i < W - kx + 8; i += 10) { px(kx - 6 + i, 94, 10, 3, (i / 10) % 2 ? '#c8463d' : '#f3e9c8'); px(kx - 1 + i, 97, 1, 2, (i / 10) % 2 ? '#86282a' : '#cdbf95'); }
    px(270, 66, 110, 16, '#2a1c18'); px(272, 68, 106, 12, '#6e4a34'); px(272, 68, 106, 1, '#8d6448'); word('ANGKASA MART', 283, 72, '#f2c14e');
    px(286, 82, 2, 4, '#2a1c18'); px(362, 82, 2, 4, '#2a1c18');
    px(268, 124, 80, 2, '#2a1c18'); px(268, 148, 80, 2, '#2a1c18');
    x.drawImage(sprite(ITEM.selimut, 1), 266, 117); x.drawImage(sprite(ITEM.termos, 1), 280, 113); x.drawImage(sprite(ITEM.kacamata, 1), 336, 144);
    px(250, 96, 1, 18, '#2a1c18'); px(246, 112, 9, 2, '#2a1c18'); px(247, 114, 7, 9, '#ffd88a'); px(248, 115, 5, 7, '#fff1c0'); px(246, 123, 9, 2, '#2a1c18');
    crate(232, 180); crate(240, 164);
    px(214, 176, 14, 20, '#2a1c18'); px(215, 177, 12, 18, '#7a5a8a'); px(215, 177, 3, 18, '#9a7aaa'); px(215, 181, 12, 2, '#3d2a4a'); px(215, 189, 12, 2, '#3d2a4a');
    groundMoss(GY);
    for (let i = 0; i < 10; i++) { const a = rnd() * W, b = GY + 20 + rnd() * 40; px(a, b, 6, 3, '#5d5f73'); px(a, b, 6, 1, '#8a8fab'); }
    glow(62, 48, 50, '255,170,120', 0.12);
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < 4; i++) { x.fillStyle = 'rgba(255,210,170,.035)'; x.beginPath(); x.moveTo(100 + i * 30, 0); x.lineTo(130 + i * 30, 0); x.lineTo(200 + i * 40, 196); x.lineTo(150 + i * 40, 196); x.fill(); }
    x.globalCompositeOperation = 'source-over';

    const [front, fx] = mk(W, H); x = fx;
    px(262, 160, W - 262, 36, '#3a2620'); px(264, 160, W - 264, 5, '#a8743c'); px(264, 160, W - 264, 1, '#d49a54'); px(264, 165, W - 264, 2, '#5e3f2e');
    for (let i = 268; i < W; i += 22) { px(i, 168, 18, 26, '#6e4a34'); px(i, 168, 18, 1, '#8d6448'); px(i + 8, 174, 2, 2, '#2a1c18'); }
    plant(150, H - 2, '#2f6a50', '#9ae0c0'); plant(352, H - 4, '#2f6a50', '#f2a0d0');
    glow(153, H - 18, 14, '150,255,210', 0.35); glow(355, H - 20, 14, '255,160,220', 0.35);
    return { back, front };
  }

  function buildTundra() {
    const [c, cx] = mk(W, H); x = cx; seed = 31;
    band(0, 170, ['#081126', '#0e1d3c', '#173058', '#22476e', '#3a6a86', '#6a9cae']); stars(110, 110);
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < W; i++) { const y = 40 + Math.sin(i / 28) * 12 + Math.sin(i / 9) * 3; for (let k = 0; k < 26; k++) { x.fillStyle = `rgba(${80 + k * 3},${255 - k * 4},180,${0.1 * (1 - k / 26)})`; x.fillRect(i, y + k, 1, 1); } }
    x.globalCompositeOperation = 'source-over';
    ball(330, 40, 14, (i, j) => { const l = (-i - j) / 20; return l > 0.3 ? '#eaf6fb' : l > -0.1 ? '#b9d6e2' : l > -0.5 ? '#7fa6be' : '#4d6f8c'; });
    seed = 5;
    for (let i = 0; i < W; i += 7) { const hh = 20 + rnd() * 40; for (let k = 0; k < hh; k++) { const w = Math.max(1, Math.round(7 * (1 - k / hh))); px(i + (7 - w) / 2, 150 - k, w, 1, '#2f4f72'); } }
    x.fillStyle = 'rgba(120,170,200,.28)'; x.fillRect(0, 95, W, 70);
    seed = 9;
    for (let i = 0; i < W; i += 11) { const hh = 14 + rnd() * 30; for (let k = 0; k < hh; k++) { const w = Math.max(1, Math.round(11 * (1 - k / hh))); px(i + (11 - w) / 2, 166 - k, w, 1, k > hh * 0.6 ? '#4f7fa6' : '#3a6488'); if (w > 3) px(i + (11 - w) / 2, 166 - k, 1, 1, '#8fc0dc'); } }
    x.fillStyle = 'rgba(150,200,220,.22)'; x.fillRect(0, 130, W, 40);
    px(0, GY - 30, W, H - GY + 30, '#cfe6ef');
    for (let i = 0; i < W; i++) { const t = GY - 30 + Math.round(Math.sin(i / 22) * 3); px(i, t - 2, 1, 3, '#eaf6fb'); }
    dith(0, GY - 14, W, 4, '#cfe6ef', '#b4d2e0'); px(0, GY - 10, W, 4, '#b4d2e0'); dith(0, GY - 6, W, 3, '#b4d2e0', '#94b9cc');
    px(0, GY - 3, W, H - GY + 3, '#7fa6be');
    for (let j = GY; j < H; j += 7) for (let i = -(j % 14); i < W; i += 14) { px(i, j, 13, 6, '#8fb4c9'); px(i, j, 13, 1, '#b4d2e0'); }
    [[120, GY - 12], [270, GY - 14], [330, GY - 10]].forEach(([a, b]) => { x.drawImage(sprite(['..K..', '.KbK.', '.KbK.', 'KbbbK', 'KbBbK', 'KbBBK', '.KKK.'], 2), a, b - 7); glow(a + 5, b - 2, 16, '140,230,255', 0.35); });
    glow(170, 150, 70, '170,220,255', 0.1);
    return c;
  }

  function buildFores() {
    const [c, cx] = mk(W, H); x = cx; seed = 52;
    band(0, 180, ['#06140f', '#0b2018', '#123024', '#1b4232', '#2a5a40', '#3f7050']);
    stars(30, 50);
    ball(300, 34, 12, (i, j) => { const l = (-i - j) / 16; return l > 0.2 ? '#f6f0c8' : l > -0.3 ? '#d8d0a0' : '#a8a078'; });
    glow(300, 34, 40, '230,240,180', 0.15);
    // pohon jauh
    for (let layer = 0; layer < 3; layer++) {
      seed = 60 + layer * 7;
      const col = ['#173a2a', '#1f4a34', '#2a5a3e'][layer], trunk = ['#1a2e24', '#22382a', '#2e4232'][layer];
      for (let i = -10; i < W; i += 26 + layer * 8) {
        const a = i + rnd() * 10, w = 4 + layer * 2, top = 40 + rnd() * 40 - layer * 10;
        px(a, top, w, GY - top, trunk); px(a, top, 1, GY - top, layer === 2 ? '#4a6a52' : trunk);
        for (let k = 0; k < 5; k++) { const r = 14 + layer * 3 - k, cy = top + k * 6; ball(a + w / 2, cy, r, (ii, jj) => (ii + jj) % 7 === 0 ? null : col); }
      }
      x.fillStyle = `rgba(90,140,110,${0.18 - layer * 0.04})`; x.fillRect(0, 60, W, 140);
    }
    // jamur berpendar
    [[60, GY], [128, GY], [210, GY], [276, GY], [360, GY]].forEach(([a, b], i) => {
      const r = 4 + (i % 3) * 2, col = ['#e05a8a', '#6fd0e8', '#f2c14e'][i % 3];
      px(a - 1, b - r - 6, 3, r + 6, '#e8e0c8');
      ball(a, b - r - 6, r, (ii, jj) => jj > 0 ? null : (ii < -r / 3 ? '#fff6d8' : col));
      glow(a, b - r - 6, 18, i % 3 === 0 ? '255,120,180' : i % 3 === 1 ? '120,230,255' : '255,220,120', 0.35);
    });
    // tanah lumut
    px(0, GY, W, H - GY, '#2a2a1e');
    for (let j = GY + 6; j < H; j += 7) for (let i = -(j % 14); i < W; i += 14) { px(i, j, 13, 6, '#353524'); px(i, j, 13, 1, '#45452e'); }
    for (let i = 0; i < W; i++) { px(i, GY - 1, 1, 3, '#2f7a4a'); px(i, GY - 1, 1, 1, '#5fc07a'); if (rnd() > 0.6) px(i, GY - 4, 1, 3, '#3f9a5a'); }
    for (let i = 0; i < 40; i++) { const a = rnd() * W; px(a, GY + 4 + rnd() * 60, 2, 1, '#4f6a3a'); }
    return c;
  }

  function buildPeri() {
    const [c, cx] = mk(W, H); x = cx; seed = 88;
    band(0, 190, ['#3a2a6a', '#6a3f86', '#b05a9a', '#e88aa0', '#f6b48a', '#f8d898']);
    ball(320, 56, 22, (i, j, d) => d > 20 ? '#fff1c0' : (i + j < -10 ? '#fffbe8' : '#ffe8a0'));
    glow(320, 56, 90, '255,220,150', 0.35);
    for (let i = 0; i < 40; i++) { const a = rnd() * W, b = rnd() * 120; px(a, b, 1, 1, '#fff6ff'); if (rnd() > 0.7) { px(a - 1, b, 3, 1, 'rgba(255,240,255,.6)'); px(a, b - 1, 1, 3, 'rgba(255,240,255,.6)'); } }
    // bukit pastel
    for (let layer = 0; layer < 3; layer++) {
      const base = 140 + layer * 18, col = ['#c98ab8', '#a86aa8', '#7f5a9a'][layer];
      for (let i = 0; i < W; i++) { const y = base - Math.round(Math.sin(i / (30 + layer * 10) + layer) * 10 + Math.sin(i / 11) * 2); px(i, y, 1, H - y, col); }
    }
    // bunga raksasa
    [[40, 0], [120, 1], [236, 2], [330, 0], [372, 1]].forEach(([a, k], i) => {
      const hgt = 40 + (i * 13) % 30, col = ['#ff7aa8', '#ffd25a', '#8ad0ff'][k], mid = ['#ffd25a', '#ff7a5a', '#ffffff'][k];
      px(a, GY - hgt, 2, hgt, '#3f8f5a'); px(a - 6, GY - hgt / 2, 6, 3, '#4fae6a'); px(a + 2, GY - hgt / 3, 6, 3, '#4fae6a');
      for (let p = 0; p < 6; p++) { const an = p / 6 * Math.PI * 2; ball(Math.round(a + 1 + Math.cos(an) * 7), Math.round(GY - hgt + Math.sin(an) * 7), 5, (ii, jj) => (ii + jj > 3 ? col : '#fff0f6')); }
      ball(a + 1, GY - hgt, 4, () => mid);
      glow(a + 1, GY - hgt, 20, '255,230,240', 0.2);
    });
    // rumput cerah
    px(0, GY, W, H - GY, '#7a4a6a');
    for (let j = GY + 6; j < H; j += 7) for (let i = -(j % 14); i < W; i += 14) { px(i, j, 13, 6, '#8a5a7a'); px(i, j, 13, 1, '#a06a8a'); }
    for (let i = 0; i < W; i++) { px(i, GY - 1, 1, 3, '#5fb06a'); px(i, GY - 1, 1, 1, '#9ae08a'); if (rnd() > 0.7) px(i, GY - 4, 1, 3, '#7ad07a'); if (rnd() > 0.93) { px(i, GY - 6, 2, 2, ['#ff7aa8', '#ffd25a', '#fff'][i % 3]); } }
    return c;
  }

  function buildEarthView() {
    const [c, cx] = mk(W, H); x = cx; seed = 44;
    band(0, 150, ['#0f0d24', '#1d1740', '#2d2358', '#47326a', '#6b4a78', '#9b6a7c']); stars(120, 130);
    ball(318, 64, 30, (i, j, d) => {
      const l = (-i - j) / 42, n = Math.sin(i * 0.35 + j * 0.2) + Math.sin(i * 0.17 - j * 0.41) * 1.2 + Math.cos((i + j) * 0.12);
      let col = n > 0.9 ? (l > 0.1 ? '#7fcf6a' : l > -0.3 ? '#4f9f4e' : '#2f6a3a') : (l > 0.2 ? '#5fb4e6' : l > -0.25 ? '#3f7fc0' : '#274f8a');
      if (n > 2.1) col = '#f3f3ee'; if (d > 28.5) col = '#a8e0ff'; return col;
    });
    glow(318, 64, 46, '120,190,255', 0.25);
    const wy = 118, gy = 182;
    wallStation(wy, gy); px(0, wy, W, 1, '#8a8fab');
    for (let y = 150; y < gy; y++) { x.fillStyle = `rgba(180,140,170,${(y - 150) / 32 * 0.22})`; x.fillRect(0, y, W, 1); }
    px(0, gy, W, H - gy, '#4a3428');
    for (let i = 0; i < W; i++) { px(i, gy - 1, 1, 3, '#3f8f6a'); px(i, gy - 1, 1, 1, '#6fd09a'); }
    px(150, gy - 6, 90, 6, '#2a2630'); px(150, gy - 6, 90, 1, '#7d82a0'); for (let i = 154; i < 236; i += 12) px(i, gy - 4, 6, 2, '#f2c14e');
    px(0, 90, 64, gy - 90, '#4a3226'); for (let j = 0; j < gy - 90; j += 6) for (let i = 0; i < 64; i += 12) px(i + ((j / 6) % 2 ? 6 : 0), 90 + j, 11, 5, '#5e3f2e');
    px(0, 82, 70, 10, '#3a2620'); for (let i = 0; i < 70; i += 10) px(i, 84, 10, 8, (i / 10) % 2 ? '#c8463d' : '#f3e9c8');
    px(30, 122, 30, gy - 122, '#2a1c18'); px(32, 124, 26, gy - 124, '#f2c070'); glow(45, 150, 40, '255,200,110', 0.35);
    return c;
  }

  let built = null;
  art.build = function () {
    if (built) return built;
    const st = buildStation();
    built = { stationBack: st.back, stationFront: st.front, tundra: buildTundra(), fores: buildFores(), peri: buildPeri(), earth: buildEarthView() };
    return built;
  };

  // efek bergerak per planet
  art.weather = function (ctx, kind, t) {
    if (kind === 'tundra') {
      ctx.fillStyle = 'rgba(255,255,255,.85)';
      for (let i = 0; i < 60; i++) { const a = (i * 53 + Math.sin(t + i) * 8 + t * 6) % W, b = (i * 37 + t * (14 + (i % 5) * 4)) % GY; ctx.fillRect(a, b, i % 4 ? 1 : 2, i % 4 ? 1 : 2); }
    } else if (kind === 'fores') {
      ctx.fillStyle = 'rgba(170,210,255,.45)';
      for (let i = 0; i < 70; i++) { const a = (i * 47 + t * 40) % (W + 20) - 10, b = (i * 31 + t * 160) % (GY + 10); ctx.fillRect(a, b, 1, 4); }
      const k = Math.floor(t * 2) % 5;
      ctx.fillStyle = 'rgba(230,255,140,.9)';
      for (let i = 0; i < 8; i++) { if ((i + k) % 3 === 0) continue; ctx.fillRect(30 + i * 45 + Math.sin(t + i) * 6, 120 + Math.cos(t * 0.8 + i) * 10, 1, 1); }
    } else if (kind === 'peri') {
      for (let i = 0; i < 18; i++) {
        const a = (i * 71 + t * 10) % W, b = (i * 29 + Math.sin(t + i) * 6 + t * 8) % GY;
        ctx.fillStyle = ['#ff9ac0', '#fff1c0', '#c8a8ff'][i % 3]; ctx.fillRect(a, b, 2, 1);
      }
      ctx.fillStyle = '#fff';
      for (let i = 0; i < 10; i++) if (Math.sin(t * 3 + i * 2) > 0.7) { const a = (i * 97) % W, b = 20 + (i * 43) % 150; ctx.fillRect(a, b, 1, 1); ctx.fillRect(a - 1, b, 3, 1); ctx.fillRect(a, b - 1, 1, 3); }
    }
  };
})();
