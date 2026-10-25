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
    J: '#3a4f9a', x: '#f3f3ee', a: '#6fd070', A: '#3f9a4a',
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
  const RIM_LIST = [];
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
  // Kurcaci Penjaga (topi biru, janggut putih) & Alien Usil (hijau bertopeng) + karung curian
  S.KURCACI = ['....KKKKKK....', '...KJJJJJJK...', '..KJJJyJJJJK..', '.KKKKKKKKKKKK.', '..KlsssssssK..', '..KsKsssssKsK.', '..KssssssssK..', '..KxxsppsxxK..', '.KxxxxxxxxxxK.', '.KxxxxxxxxxxK.', '..KxxxxxxxxK..', '.KJJKxxxxKJJK.', 'KJJJJKxxKJJJJK', 'KsKJJJJJJJJKsK', '.KKJJJyJJJJKK.', '..KJJJJJJJJK..', '..KJJJJJJJJK..', '..KddK..KddK..', '.KdddK..KdddK.', '.KKKKK..KKKKK.'];
  S.USIL = ['....KKKKKK.......', '...KaaaaaaK......', '..KaaaaaaaaK.....', '.KaaaaaaaaaaK....', '.KKKKKKKKKKKK....', '.KKcKKKKKcKKK....', '.KaaaaaaaaaAK....', '.KaaKaaaaKaAK....', '.KaaaKKKKaaAK....', '..KaaaaaaaAK.....', '.KaaaaaaaaaAK....', 'KaaKaaaaaaKaAK...', 'KaKKaaaaaaKKAK...', '.K.KaaaaaaAK.....', '...KaaaaaaAK.....', '...KAK..KAK......', '...KKK..KKK......'];
  S.KARUNG = ['...KK...', '..KFFK..', '.KFFFFK.', 'KFFFFFYK', 'KFFFFFYK', 'KFFFFYYK', '.KKKKKK.'];
  S.STAR = ['...y...', '...y...', 'yyyyyyy', '.yyyyy.', '..yYy..', '.yY.Yy.', 'y.....y'];
  S.HEART = ['.rr.rr.', 'rrrrrrr', 'rrrrrrr', '.rrrrr.', '..rrr..', '...r...'];
  S.ROKET = ['.....KK.....', '....KwwK....', '...KwwwWK...', '..KwwwwwWK..', '..KwbbbwWK..', '..KwbBbwWK..', '..KwwwwwWK..', '..KrrrrrRK..', '..KwwwwwWK..', '..KwwwwwWK..', '..KwwwwwWK..', '.KrKwwwwWKrK', 'KrrKwwwwWKrR', 'KrRKrrrrRKRR', 'KK.KKKKKKK.K', '....KqqK....', '....KyyK....'];
  S.PETI = ['KKKKKKKKKKKK', 'KFFFFFFFFFYK', 'KFYYYYYYYYYK', 'KFFFFKKFFFYK', 'KFFFFFFFFFYK', 'KYYYYYYYYYYK', 'KKKKKKKKKKKK'];

  [S.ANGKASA, S.ANGKASA_FULL, S.ANGKASA_KEDIP, S.ANGKASA_FULL_KEDIP, S.tundra, S.fores, S.peri, S.ROTNI].forEach((r) => RIM_LIST.push(r));
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

  const RIM = new Set(RIM_LIST);
  function mix(a, b, k) { const p = (h) => [1, 3, 5].map((o) => parseInt(h.slice(o, o + 2), 16)); const A = p(a), Bc = p(b); return '#' + A.map((v, i) => Math.round(v + (Bc[i] - v) * k).toString(16).padStart(2, '0')).join(''); }
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
      const rim = RIM.has(rows);
      const at = (i, j) => (rows[j] || '')[i] || '.';
      rows.forEach((r, j) => { [...r].forEach((ch, i) => {
        if (ch === '.' || !pal[ch]) return;
        let col = pal[ch];
        // cahaya tepi hangat: piksel tepat di dalam garis luar sisi kanan / atas
        if (rim && ch !== 'K' && ((at(i + 1, j) === 'K' && at(i + 2, j) === '.') || (at(i, j - 1) === 'K' && at(i, j - 2) === '.'))) col = mix(col, '#ffe2b0', 0.5);
        ctx.fillStyle = col; ctx.fillRect(i * z, j * z, z, z);
      }); });
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
    art.castShadow(ctx, a, w, feet);
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
    if (full) art.castShadow(ctx, a, 36, top + rows.length * 2);
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

  // ================= latar gaya "Sons of Valhalla" =================
  // Tiap latar = sky (langit), clouds (awan, lebar 2×W, bergeser pelan), back (tengah, transparan di langit), front (depan tokoh).
  // Kontras hangat-dingin, kedalaman udara, cahaya tepi, tanah berlapis, dan kolam pantulan di bawah (garis air WL).
  const WL = 214;
  art.WL = WL;
  const BAY = [[0, 8, 2, 10], [12, 4, 14, 6], [3, 11, 1, 9], [15, 7, 13, 5]];
  function gradB(y0, y1, cols) {
    const n = cols.length - 1;
    for (let y = y0; y < y1; y++) {
      const t = (y - y0) / (y1 - y0) * n, k = Math.min(n - 1, Math.floor(t)), f = t - k;
      for (let i = 0; i < W; i++) px(i, y, 1, 1, f > BAY[y & 3][i & 3] / 16 ? cols[k + 1] : cols[k]);
    }
  }
  function disc(cx, cy, r, fn) { for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) { const d = i * i + j * j; if (d <= r * r) { const c = fn(i, j, Math.sqrt(d)); if (c) px(cx + i, cy + j, 1, 1, c); } } }
  function cloud(cx, cy, w, h, lit, mid, dark) {
    for (let k = 0; k < 22; k++) {
      const u = rnd() - 0.5, a = cx + u * w, b = cy + (rnd() - 0.3) * h * 0.5 * (1 - Math.abs(u)), r = 3 + rnd() * h * 0.5 * (1 - Math.abs(u) * 0.8) | 0;
      disc(a | 0, b | 0, r, (i, j) => { const Y = (b + j - cy) / h + BAY[(b + j) & 3][(a + i) & 3] / 16 * 0.25; return Y < -0.12 ? lit : Y < 0.18 ? mid : dark; });
    }
  }
  // gumpalan daun; cahaya dari kanan-atas
  function foliage(cx, cy, R, cols) {
    const n = Math.round(R * 1.6);
    for (let k = 0; k < n; k++) {
      const an = rnd() * 6.28, d = Math.sqrt(rnd()) * R, a = cx + Math.cos(an) * d, b = cy + Math.sin(an) * d * 0.8, r = 3 + rnd() * 4 | 0;
      disc(a | 0, b | 0, r, (i, j) => { const t = (i * 0.6 - j * 0.8) / r + (a - cx) / R * 0.5 - (b - cy) / R * 0.6 + BAY[(b + j) & 3][(a + i) & 3] / 16 * 0.5; return t > 1 ? cols[3] : t > 0.35 ? cols[2] : t > -0.3 ? cols[1] : cols[0]; });
    }
  }
  function rays(ox, oy, list, a, rgb) {
    x.globalCompositeOperation = 'lighter';
    list.forEach(([dx, w]) => { const g = x.createLinearGradient(ox, oy, ox + dx, oy + 200); g.addColorStop(0, `rgba(${rgb},${a})`); g.addColorStop(1, `rgba(${rgb},0)`); x.fillStyle = g; x.beginPath(); x.moveTo(ox, oy); x.lineTo(ox + dx - w, oy + 210); x.lineTo(ox + dx + w, oy + 210); x.fill(); });
    x.globalCompositeOperation = 'source-over';
  }
  // rumput + penampang tanah berbatu sampai garis air
  function bank(gy, grass, dirt, stone) {
    px(0, gy, W, WL - gy, dirt[2]);
    for (let j = gy + 3; j < WL; j += 5) for (let i = -(j % 9); i < W; i += 9 + (j % 3)) { const c = rnd(); px(i, j, 8, 4, c > 0.6 ? dirt[0] : c > 0.3 ? dirt[1] : dirt[2]); px(i, j, 8, 1, dirt[3]); }
    for (let k = 0; k < 12; k++) { const a = rnd() * W, b = gy + 7 + rnd() * (WL - gy - 10); disc(a | 0, b | 0, 2 + rnd() * 2 | 0, (i, j) => j < 0 ? stone[0] : i > 0 ? stone[2] : stone[1]); }
    for (let i = 0; i < W; i++) { const h = 2 + ((i * 13) % 7 > 4 ? 2 : 0); px(i, gy - h, 1, h + 3, grass[1]); px(i, gy - h, 1, 1, grass[2]); px(i, gy + 2, 1, 2, grass[0]); }
    px(0, WL - 1, W, 1, '#0e0806');
  }
  function sparse(n, ymax, cols) { for (let i = 0; i < n; i++) { const a = rnd() * W, b = rnd() * ymax, q = rnd(); px(a, b, 1, 1, q > 0.9 ? cols[0] : q > 0.6 ? cols[1] : cols[2]); } }
  function layers() { const s = mk(W, H), c = mk(W * 2, H), b = mk(W, H), f = mk(W, H); return { sky: s, clouds: c, back: b, front: f }; }
  function cloudsBoth(fn) { for (const off of [0, W]) { const save = x; fn(off); x = save; } }

  function buildStation() {
    const L = layers(); seed = 11;
    x = L.sky[1];
    gradB(0, 172, ['#0e0826', '#1c0f40', '#341660', '#5a1f6e', '#8a2c6c', '#c44a62', '#ec7a52', '#f8b468']);
    sparse(140, 110, ['#fff8e0', '#c8b8f0', '#7060b0']);
    disc(232, 150, 20, (i, j, d) => d > 18 ? '#fff0b0' : '#fffbe8'); glow(232, 150, 120, '255,190,110', 0.55); glow(232, 150, 40, '255,240,200', 0.6);
    disc(54, 40, 22, (i, j) => { const l = (i + j) / 30; return l > 0.5 ? '#f6c890' : l > 0.15 ? '#d47a5a' : l > -0.3 ? '#8a3e52' : '#3e1a3a'; });
    for (let a = 0; a < 6.28; a += 0.01) { const X = 54 + Math.cos(a) * 40, Y = 43 + Math.sin(a) * 7 - Math.cos(a) * 5; if (Math.sin(a) > 0 || Math.hypot(X - 54, Y - 40) > 22) px(X, Y, 1, 1, Math.sin(a) > 0 ? '#ffe6b0' : '#9a6a5a'); }
    x = L.clouds[1]; seed = 21;
    for (const o of [0, W]) { seed = 21; cloud(90 + o, 70, 120, 26, '#f8b888', '#b05878', '#4a2460'); cloud(300 + o, 52, 140, 22, '#f0a080', '#a04a78', '#3e2058'); cloud(200 + o, 100, 90, 14, '#ffd0a0', '#c86a70', '#5a2a62'); }
    x = L.back[1]; seed = 5;
    const rid = (base, amp, col, lit, sd, step) => { seed = sd; let y = base; for (let i = 0; i < W; i++) { if (i % step === 0) y = base - rnd() * amp; const dy = Math.abs(i - 232) / 232; px(i, y, 1, H - y, col); px(i, y, 1, 1 + (1 - dy) * 2 | 0, lit); } };
    rid(146, 34, '#7a3a6a', '#f0a080', 5, 7); x.fillStyle = 'rgba(240,140,110,.22)'; x.fillRect(0, 110, W, 70);
    rid(158, 24, '#4e2456', '#c8708a', 9, 5); x.fillStyle = 'rgba(200,110,130,.18)'; x.fillRect(0, 130, W, 60);
    [[150, 160, 14], [184, 162, 9], [120, 164, 8]].forEach(([a, b, r]) => { disc(a, b, r, (i, j) => j > 0 ? null : (i > r / 3 ? '#d07a7a' : i > -r / 3 ? '#7a3e62' : '#4a2450')); for (let q = 0; q < 4; q++) px(a - r + 3 + q * 5, b - 3, 2, 2, '#ffd88a'); });
    const wy = 124; px(0, wy, W, GY - wy, '#24203c');
    for (let r = 0; r * 8 + wy < GY; r++) { const off = r % 2 ? 7 : 0; for (let i = -off; i < W; i += 15) { const v = rnd(); px(i + 1, wy + r * 8 + 1, 13, 6, v > 0.66 ? '#34304e' : v > 0.33 ? '#2e2a48' : '#2a2642'); px(i + 1, wy + r * 8 + 1, 13, 1, '#46406a'); px(i + 1, wy + r * 8 + 6, 13, 1, '#1a1630'); if (rnd() > 0.85) px(i + 3 + rnd() * 8, wy + r * 8 + 3, 2, 1, '#3e8a5a'); } }
    for (let i = 2; i < W; i += 28) { px(i, wy - 11, 17, 12, '#2e2a48'); px(i, wy - 11, 17, 1, '#f0a070'); px(i, wy - 10, 17, 1, '#8a5a7a'); px(i + 16, wy - 11, 1, 12, '#1a1630'); px(i, wy - 11, 1, 12, '#5a4a70'); }
    px(0, wy - 1, W, 1, '#e89068'); px(0, wy, W, 1, '#6a4a78');
    for (let k = 0; k < 9; k++) { const a = 10 + rnd() * 370, l = 6 + rnd() * 22; for (let j = 0; j < l; j++) px(a + Math.round(Math.sin(j * 0.5) * 1.5), wy + j, 1, 1, j % 3 ? '#2f6a3a' : '#5aa05a'); }
    [96, 176].forEach((a) => { px(a, wy - 20, 3, GY - wy + 20, '#1a1220'); px(a + 1, wy - 20, 1, GY - wy + 20, '#5a4050'); px(a - 3, wy - 22, 9, 3, '#1a1220'); disc(a + 1, wy - 25, 3, () => '#fff0b0'); glow(a + 1, wy - 25, 26, '255,210,140', 0.5); });
    for (let y = 150; y < GY; y++) { x.fillStyle = `rgba(255,150,120,${(y - 150) / 46 * 0.16})`; x.fillRect(0, y, W, 1); }
    const kx = 258; px(kx, 98, W - kx, GY - 98, '#3a1e14');
    for (let j = 0; j < GY - 98; j += 6) for (let i = 0; i < W - kx; i += 12) { const o = (j / 6) % 2 ? 6 : 0, v = rnd(); px(kx + i + o, 98 + j, 11, 5, v > 0.5 ? '#6a3a22' : '#5a301c'); px(kx + i + o, 98 + j, 11, 1, '#8a5030'); px(kx + i + o, 98 + j + 4, 11, 1, '#2e160e'); }
    px(350, 108, 28, 24, '#1a0e0a'); px(352, 110, 11, 9, '#ffb050'); px(365, 110, 11, 9, '#ff9a40'); px(352, 121, 11, 9, '#ff9a40'); px(365, 121, 11, 9, '#ffb050'); px(352, 110, 11, 1, '#ffe0a0'); px(365, 110, 11, 1, '#ffe0a0'); glow(364, 120, 30, '255,140,60', 0.35);
    for (let i = 0; i < W - kx + 8; i += 2) { px(kx - 6 + i, 84, 2, 11, Math.floor(i / 10) % 2 ? '#d8443a' : '#fff0d8'); px(kx - 6 + i, 84, 2, 1, '#ffb090'); }
    for (let i = 0; i < W - kx + 8; i += 10) { px(kx - 6 + i, 95, 10, 3, (i / 10) % 2 ? '#d8443a' : '#fff0d8'); px(kx - 1 + i, 98, 1, 2, '#2a120c'); }
    px(kx - 6, 82, W - kx + 8, 2, '#1a0e0a');
    px(270, 64, 110, 18, '#1a0e0a'); px(272, 66, 106, 14, '#5a301c'); px(272, 66, 106, 1, '#c87840'); word('ANGKASA MART', 283, 71, '#ffd25a');
    px(268, 124, 80, 2, '#1a0e0a'); px(268, 148, 80, 2, '#1a0e0a');
    x.drawImage(sprite(ITEM.selimut, 1), 266, 117); x.drawImage(sprite(ITEM.termos, 1), 280, 113); x.drawImage(sprite(ITEM.kacamata, 1), 336, 144);
    px(250, 98, 1, 16, '#1a0e0a'); px(246, 112, 9, 2, '#1a0e0a'); px(247, 114, 7, 9, '#ffd88a'); px(248, 115, 5, 7, '#fff1c0'); px(246, 123, 9, 2, '#1a0e0a');
    const crateW = (a, b) => { px(a, b, 18, 16, '#1a0e0a'); px(a + 1, b + 1, 16, 14, '#7a4626'); px(a + 10, b + 1, 7, 14, '#a0602e'); px(a + 1, b + 1, 16, 1, '#d08a46'); px(a + 1, b + 7, 16, 1, '#4a2614'); px(a + 8, b + 1, 1, 14, '#4a2614'); };
    crateW(232, 180); crateW(240, 164);
    px(212, 174, 15, 22, '#1a0e0a'); px(213, 175, 13, 20, '#5a3a6a'); px(220, 175, 6, 20, '#8a6a9a'); px(213, 179, 13, 2, '#2a1a32'); px(213, 188, 13, 2, '#2a1a32');
    bank(GY, ['#1e4a2a', '#3a8a42', '#a8e070'], ['#4a2c1a', '#3a2214', '#2a1810', '#5a3820'], ['#5a5468', '#423c50', '#2a2434']);
    glow(250, 190, 70, '255,170,80', 0.35);
    x = L.front[1];
    px(262, 160, W - 262, 36, '#2a140c'); px(264, 160, W - 264, 5, '#b0703a'); px(264, 160, W - 264, 1, '#ffc070'); px(264, 165, W - 264, 2, '#3a1e10');
    for (let i = 268; i < W; i += 22) { px(i, 168, 18, 26, '#5a2e1a'); px(i + 12, 168, 6, 26, '#7a4226'); px(i, 168, 18, 1, '#c07840'); px(i + 8, 175, 2, 2, '#1a0e0a'); }
    return { sky: L.sky[0], clouds: L.clouds[0], back: L.back[0], front: L.front[0], rays: [232, 140, [[-160, 10], [-90, 6], [-30, 9], [40, 7], [110, 10]], '255,220,160'], shadow: -1, mote: '255,220,150', reed: '#0e1a12', water: ['rgba(14,10,40,.35)', 'rgba(8,6,24,.7)'], star: true };
  }

  function buildTundra() {
    const L = layers(); seed = 31;
    x = L.sky[1];
    gradB(0, 176, ['#050a1e', '#0a1634', '#10264a', '#173a5e', '#2a5a7a', '#4a8098', '#8ab8c8']);
    sparse(160, 120, ['#ffffff', '#c8e0ff', '#6a8ac0']);
    x.globalCompositeOperation = 'lighter';
    for (let i = 0; i < W; i++) { const y = 34 + Math.sin(i / 28) * 12 + Math.sin(i / 9) * 3; for (let k = 0; k < 34; k++) { x.fillStyle = `rgba(${60 + k * 4},${255 - k * 3},${170 + k * 2},${0.12 * (1 - k / 34)})`; x.fillRect(i, y + k, 1, 1); } }
    x.globalCompositeOperation = 'source-over';
    disc(320, 44, 15, (i, j) => { const l = (-i - j) / 20; return l > 0.3 ? '#ffffff' : l > -0.1 ? '#d8ecf8' : l > -0.5 ? '#9ac0d8' : '#5a7a98'; }); glow(320, 44, 70, '200,230,255', 0.35);
    x = L.clouds[1];
    for (const o of [0, W]) { seed = 33; cloud(110 + o, 92, 150, 12, '#a8c8e0', '#5a7a9a', '#2a3e5a'); cloud(290 + o, 104, 120, 10, '#c8e0f0', '#6a8aa8', '#2e4462'); }
    x = L.back[1]; seed = 5;
    // pegunungan es lebar: sisi kanan terkena cahaya bulan
    for (let m = 0; m < 7; m++) {
      const cxm = -20 + m * 68 + rnd() * 20, hh = 40 + rnd() * 34, half = 34 + rnd() * 20, base = 156;
      for (let k = 0; k < hh; k++) { const w = Math.round(half * (k / hh)), y = base - hh + k; px(cxm - w, y, w, 1, '#5a7898'); px(cxm, y, w, 1, '#9ab8d0'); if (k < hh * 0.35) { px(cxm - w, y, w, 1, '#c8dcec'); px(cxm, y, w, 1, '#f4faff'); } }
    }
    x.fillStyle = 'rgba(150,190,220,.32)'; x.fillRect(0, 96, W, 80);
    // hutan pinus bersalju (lebih dekat, lebih gelap)
    seed = 9;
    for (let i = -6; i < W; i += 9) {
      const hh = 22 + rnd() * 24;
      for (let k = 0; k < hh; k++) {
        const w = Math.max(1, Math.round((k / hh) * 6 + (k % 5 < 2 ? 0 : 1))), y = 176 - hh + k;
        px(i - w, y, w * 2 + 1, 1, '#16303e'); px(i + 1, y, w, 1, '#1e3e50');
        if (k % 5 === 0) { px(i - w, y, w * 2 + 1, 1, '#d8ecf8'); px(i + 1, y, w, 1, '#ffffff'); }
      }
    }
    x.fillStyle = 'rgba(160,200,230,.16)'; x.fillRect(0, 140, W, 40);
    px(40, 168, 14, 8, '#e8f4ff'); disc(47, 168, 7, (i, j) => j > 0 ? null : '#e8f4ff'); px(45, 170, 4, 6, '#ffb84a'); glow(47, 172, 16, '255,180,90', 0.6);
    px(0, GY - 26, W, 26, '#dfeef8');
    for (let i = 0; i < W; i++) { const t = GY - 26 + Math.round(Math.sin(i / 22) * 3); px(i, t - 2, 1, 3, '#ffffff'); }
    for (let y = GY - 14; y < GY; y++) for (let i = 0; i < W; i++) px(i, y, 1, 1, BAY[y & 3][i & 3] / 16 < (y - (GY - 14)) / 14 ? '#a8c8dc' : '#dfeef8');
    [[120, GY - 4], [270, GY - 6], [350, GY - 3]].forEach(([a, b]) => { x.drawImage(sprite(['..K..', '.KbK.', '.KbK.', 'KbbbK', 'KbBbK', 'KbBBK', '.KKK.'], 2), a, b - 14); glow(a + 5, b - 6, 18, '140,230,255', 0.4); });
    bank(GY, ['#a8c8dc', '#e8f4ff', '#ffffff'], ['#3a4a5e', '#2e3c50', '#222e40', '#4a5a70'], ['#8aa0b8', '#5a7088', '#3a4a60']);
    return { sky: L.sky[0], clouds: L.clouds[0], back: L.back[0], front: L.front[0], rays: null, shadow: -1, mote: '220,240,255', reed: '#0a1420', water: ['rgba(120,170,210,.35)', 'rgba(20,40,70,.6)'], ice: true };
  }

  function buildFores() {
    const L = layers(); seed = 5;
    x = L.sky[1];
    gradB(0, 180, ['#6aa8d8', '#8ab8d8', '#a8c8d8', '#c8d8c8', '#e0d8b0', '#f0d098']);
    disc(250, 64, 16, () => '#fffbe8'); glow(250, 64, 130, '255,240,200', 0.6);
    x = L.clouds[1];
    for (const o of [0, W]) { seed = 7; cloud(80 + o, 40, 140, 20, '#fff8e8', '#e8d0b8', '#b8a8a8'); cloud(300 + o, 30, 120, 18, '#fff8e8', '#e8d0b8', '#b8a8a8'); }
    x = L.back[1];
    for (let i = 0; i < W; i++) { const y = 116 - Math.round(Math.sin(i / 40) * 14 + Math.sin(i / 13) * 4); px(i, y, 1, H - y, '#a8a898'); px(i, y, 1, 1, '#f0e0b8'); }
    [['#8a9a7a', '#c8c8a0', 124], ['#5a7a5a', '#9ab078', 140], ['#3a5a3e', '#6a8a52', 156]].forEach(([col, lit, base], Lv) => {
      seed = 40 + Lv;
      for (let i = -10; i < W; i += 8 + Lv * 3) {
        const h = 34 + rnd() * 30, top = base - h;
        for (let j = 0; j < h; j++) { const w = Math.round(j * 0.32 + (j % 6 < 3 ? 0 : 1)) + 1; px(i - w, top + j, w * 2 + 1, 1, col); px(i + w, top + j, 1, 1, lit); }
        px(i, base, 2, 40, col);
      }
      x.fillStyle = `rgba(230,225,190,${0.3 - Lv * 0.08})`; x.fillRect(0, 70, W, 130);
    });
    for (let y = 150; y < GY; y++) { const q = (y - 150) / 46; x.fillStyle = `rgba(${40 - q * 10 | 0},${70 - q * 20 | 0},${40 - q * 10 | 0},${0.25 + q * 0.6})`; x.fillRect(0, y, W, 1); }
    const fol = ['#16301a', '#22462a', '#3a6a34', '#7aa850'], fol2 = ['#1e3a1e', '#2e5a2a', '#4a8a3a', '#a8d070'];
    seed = 91; for (let i = 0; i < W; i += 6) foliage(i, GY - 4 - rnd() * 8, 5 + rnd() * 4, fol);
    const tree = (a, base, h, R) => {
      px(a - 3, base - h, 7, h, '#3a2416'); px(a + 1, base - h, 2, h, '#7a4a2a'); px(a - 3, base - h, 1, h, '#1e120a');
      for (let k = 0; k < 4; k++) { const b = base - h * (0.4 + k * 0.12); for (let j = 0; j < 14; j++) px(a + (k % 2 ? j : -j), b - j * 0.4, 1, 2, '#3a2416'); }
      foliage(a, base - h, R, fol2); foliage(a + R * 0.6, base - h + R * 0.5, R * 0.6, fol2); foliage(a - R * 0.7, base - h + R * 0.4, R * 0.6, fol2);
    };
    seed = 77; tree(70, GY, 120, 30); tree(330, GY, 110, 28); tree(190, GY, 72, 18);
    px(20, GY - 90, 4, 90, '#4a3020'); px(22, GY - 90, 1, 90, '#7a5236'); for (let k = 0; k < 5; k++) { const b = GY - 90 + k * 12; for (let j = 0; j < 16; j++) px(22 + (k % 2 ? j : -j), b - j * 0.6, 1, 1, '#4a3020'); }
    [[110, GY], [250, GY], [370, GY]].forEach(([a, b]) => foliage(a, b - 6, 9, fol2));
    [[140, GY], [292, GY]].forEach(([a, b]) => { px(a, b - 6, 2, 6, '#f0e8d0'); disc(a + 1, b - 7, 4, (i, j) => j > 0 ? null : '#e05a8a'); glow(a, b - 7, 14, '255,120,180', 0.4); });
    bank(GY, ['#1e4a24', '#3a7a32', '#b0e070'], ['#4a2c1a', '#3a2214', '#2a1810', '#5a3820'], ['#6a6a70', '#4a4a54', '#2e2e38']);
    for (let k = 0; k < 24; k++) { const a = rnd() * W; px(a, GY - 4, 2, 2, ['#ff7aa8', '#ffd25a', '#ffffff', '#8ad0ff'][k % 4]); }
    return { sky: L.sky[0], clouds: L.clouds[0], back: L.back[0], front: L.front[0], rays: [250, 60, [[-140, 14], [-60, 10], [20, 16], [90, 9]], '255,245,210'], shadow: -1, mote: '255,250,210', reed: '#0e1a0e', water: ['rgba(30,60,50,.3)', 'rgba(10,24,20,.65)'] };
  }

  function buildPeri() {
    const L = layers(); seed = 88;
    x = L.sky[1];
    gradB(0, 186, ['#2a1a5a', '#5a2a7a', '#9a3a8a', '#d85a8a', '#f6907a', '#ffc078', '#ffe0a0']);
    sparse(50, 70, ['#fff6ff', '#ffd0f0', '#b080d0']);
    disc(300, 132, 24, (i, j, d) => d > 22 ? '#fff1c0' : '#fffbe8'); glow(300, 132, 140, '255,200,140', 0.55); glow(300, 132, 44, '255,245,220', 0.6);
    x = L.clouds[1];
    for (const o of [0, W]) { seed = 89; cloud(90 + o, 60, 150, 22, '#ffd0a8', '#e07a9a', '#7a3a7a'); cloud(250 + o, 40, 120, 18, '#ffc8a0', '#d06a98', '#6a3274'); }
    x = L.back[1];
    for (let Lv = 0; Lv < 3; Lv++) {
      const base = 144 + Lv * 16, col = ['#c87aa8', '#9a5a98', '#6a3a7a'][Lv], lit = ['#ffc8a8', '#f0a0a0', '#d0809a'][Lv];
      for (let i = 0; i < W; i++) { const y = base - Math.round(Math.sin(i / (30 + Lv * 10) + Lv) * 10 + Math.sin(i / 11) * 2); px(i, y, 1, H - y, col); px(i, y, 1, 1, lit); }
      x.fillStyle = `rgba(255,190,170,${0.22 - Lv * 0.06})`; x.fillRect(0, 100, W, 100);
    }
    seed = 70;
    [[40, 0], [120, 1], [236, 2], [330, 0], [372, 1]].forEach(([a, k], i) => {
      const hgt = 44 + (i * 13) % 30, col = ['#ff7aa8', '#ffd25a', '#8ad0ff'][k], dark = ['#b0406a', '#c8902a', '#4a8ac0'][k], mid = ['#ffd25a', '#ff7a5a', '#ffffff'][k];
      px(a, GY - hgt, 2, hgt, '#2f7a4a'); px(a + 1, GY - hgt, 1, hgt, '#5aa86a');
      foliage(a - 6, GY - hgt / 2, 4, ['#1e4a2e', '#2f7a4a', '#4fae6a', '#9ae08a']); foliage(a + 7, GY - hgt / 3, 4, ['#1e4a2e', '#2f7a4a', '#4fae6a', '#9ae08a']);
      for (let p = 0; p < 6; p++) { const an = p / 6 * Math.PI * 2; disc(Math.round(a + 1 + Math.cos(an) * 7), Math.round(GY - hgt + Math.sin(an) * 7), 5, (ii, jj) => ii - jj > 3 ? '#fff0f6' : ii - jj > -3 ? col : dark); }
      disc(a + 1, GY - hgt, 4, () => mid); glow(a + 1, GY - hgt, 20, '255,230,240', 0.25);
    });
    seed = 72; for (let i = 0; i < W; i += 7) foliage(i, GY - 3 - rnd() * 6, 4 + rnd() * 3, ['#2a1a40', '#4a2a5a', '#7a4a7a', '#c08aa8']);
    bank(GY, ['#3a6a3a', '#5fb06a', '#c0f0a0'], ['#5a2a4a', '#4a2240', '#341832', '#6a3a5a'], ['#8a6a8a', '#6a4a6a', '#4a304a']);
    for (let k = 0; k < 30; k++) { const a = rnd() * W; px(a, GY - 4, 2, 2, ['#ff7aa8', '#ffd25a', '#ffffff'][k % 3]); }
    return { sky: L.sky[0], clouds: L.clouds[0], back: L.back[0], front: L.front[0], rays: [300, 120, [[-200, 12], [-120, 8], [-50, 12], [30, 7]], '255,220,180'], shadow: -1, mote: '255,210,230', reed: '#1a0e1e', water: ['rgba(60,20,60,.3)', 'rgba(24,8,30,.65)'] };
  }

  function buildEarthView(st) {
    const L = layers(); seed = 44; const gy = 182;
    x = L.back[1];
    disc(250, 58, 30, (i, j, d) => {
      const l = (-i - j) / 42, n = Math.sin(i * 0.35 + j * 0.2) + Math.sin(i * 0.17 - j * 0.41) * 1.2 + Math.cos((i + j) * 0.12);
      let col = n > 0.9 ? (l > 0.1 ? '#7fcf6a' : l > -0.3 ? '#4f9f4e' : '#2f6a3a') : (l > 0.2 ? '#5fb4e6' : l > -0.25 ? '#3f7fc0' : '#274f8a');
      if (n > 2.1) col = '#f3f3ee'; if (d > 28.5) col = '#a8e0ff'; return col;
    });
    glow(250, 58, 46, '120,190,255', 0.3);
    const wy = 118; px(0, wy, W, gy - wy, '#24203c');
    for (let r = 0; r * 8 + wy < gy; r++) { const off = r % 2 ? 7 : 0; for (let i = -off; i < W; i += 15) { const v = rnd(); px(i + 1, wy + r * 8 + 1, 13, 6, v > 0.5 ? '#34304e' : '#2e2a48'); px(i + 1, wy + r * 8 + 1, 13, 1, '#46406a'); px(i + 1, wy + r * 8 + 6, 13, 1, '#1a1630'); } }
    px(0, wy - 1, W, 1, '#e89068');
    for (let y = 150; y < gy; y++) { x.fillStyle = `rgba(255,150,120,${(y - 150) / 32 * 0.16})`; x.fillRect(0, y, W, 1); }
    px(0, gy, W, H - gy, '#2a1810');
    for (let i = 0; i < W; i++) { px(i, gy - 2, 1, 4, '#3a8a42'); px(i, gy - 2, 1, 1, '#a8e070'); }
    px(150, gy - 6, 90, 6, '#1a1220'); px(150, gy - 6, 90, 1, '#7d82a0'); for (let i = 154; i < 236; i += 12) px(i, gy - 4, 6, 2, '#f2c14e');
    px(0, 90, 64, gy - 90, '#3a1e14'); for (let j = 0; j < gy - 90; j += 6) for (let i = 0; i < 64; i += 12) { px(i + ((j / 6) % 2 ? 6 : 0), 90 + j, 11, 5, '#5a301c'); px(i + ((j / 6) % 2 ? 6 : 0), 90 + j, 11, 1, '#8a5030'); }
    px(0, 82, 70, 10, '#1a0e0a'); for (let i = 0; i < 70; i += 10) px(i, 84, 10, 8, (i / 10) % 2 ? '#d8443a' : '#fff0d8');
    px(30, 122, 30, gy - 122, '#1a0e0a'); px(32, 124, 26, gy - 124, '#ffa848'); px(32, 124, 26, 2, '#ffe0a0'); glow(45, 150, 40, '255,150,70', 0.35);
    return { sky: st.sky, clouds: st.clouds, back: L.back[0], front: L.front[0], rays: null, shadow: -1, mote: '255,220,150', noWater: true };
  }

  let built = null;
  art.build = function () {
    if (built) return built;
    const st = buildStation();
    built = { station: st, tundra: buildTundra(), fores: buildFores(), peri: buildPeri() };
    built.earth = buildEarthView(st);
    built.stationFront = st.front; // kompatibel
    return built;
  };
  // langit + awan bergeser + lapisan tengah
  art.drawBack = function (ctx, kind, t) {
    const L = art.build()[kind];
    ctx.drawImage(L.sky, 0, 0);
    const off = Math.floor(t * 2) % W;
    ctx.drawImage(L.clouds, off, 0, W, H, 0, 0, W, H);
    ctx.drawImage(L.back, 0, 0);
    if (L.rays) { const k = 0.08 + Math.sin(t * 0.7) * 0.02; ctx.save(); x = ctx; rays(L.rays[0], L.rays[1], L.rays[2], k, L.rays[3]); ctx.restore(); }
    art.shadowDir = L.shadow;
  };
  art.drawFront = function (ctx, kind) { ctx.drawImage(art.build()[kind].front, 0, 0); };
  // efek akhir per frame: rumput bergoyang, pantulan air, alang-alang, debu cahaya, bintang jatuh, vinyet
  art.post = function (ctx, kind, t) {
    const L = art.build()[kind];
    for (let i = 0; i < 40; i++) {
      const a = (i * 97) % W, sw = Math.round(Math.sin(t * 2 + i * 0.7) * 1.5), h = 3 + (i % 3);
      ctx.fillStyle = i % 2 ? '#3a8a42' : '#2a6a32'; if (kind === 'tundra') ctx.fillStyle = i % 2 ? '#e8f4ff' : '#a8c8dc'; if (kind === 'peri') ctx.fillStyle = i % 2 ? '#7ad07a' : '#4a9a5a';
      for (let j = 0; j < h; j++) ctx.fillRect(a + Math.round(sw * j / h), GY + 1 - j, 1, 1);
    }
    if (!L.noWater) {
      for (let y = WL; y < H; y++) {
        const d = y - WL, src = GY - 2 - d * 1.1; if (src < 0) break;
        const off = Math.round(Math.sin(y * 0.9 + t * 3) * (L.ice ? 0.5 : 1 + d * 0.04));
        ctx.drawImage(ctx.canvas, 0, src | 0, W, 1, off, y, W, 1);
      }
      const wg = ctx.createLinearGradient(0, WL, 0, H); wg.addColorStop(0, L.water[0]); wg.addColorStop(1, L.water[1]);
      ctx.fillStyle = wg; ctx.fillRect(0, WL, W, H - WL);
      ctx.fillStyle = 'rgba(255,230,190,.5)'; ctx.fillRect(0, WL, W, 1);
      ctx.fillStyle = L.ice ? 'rgba(230,250,255,.5)' : 'rgba(255,230,190,.35)';
      for (let i = 0; i < 30; i++) { const yy = WL + 3 + ((i * 17) % (H - WL - 4)), xx = ((i * 71 + t * 12 * (i % 2 ? 1 : -1)) % W + W) % W; ctx.fillRect(xx, yy, 4 + (i % 3) * 3, 1); }
      for (let i = 0; i < 14; i++) {
        const a = 8 + i * 29 + (i % 3) * 5, h = 18 + (i * 7) % 14, sw = Math.sin(t * 1.6 + i) * 2;
        ctx.fillStyle = L.reed; for (let j = 0; j < h; j++) ctx.fillRect(a + Math.round(sw * j / h), H - 6 - j, 1, 1);
        if (i % 2 && !L.ice) { ctx.fillStyle = '#4a2a14'; ctx.fillRect(a + Math.round(sw) - 1, H - 6 - h, 3, 6); }
      }
      if (!L.ice) { ctx.fillStyle = '#1e4a2a'; [[60, 250], [200, 262], [330, 248]].forEach(([a, b]) => { ctx.fillRect(a, b, 12, 2); ctx.fillRect(a + 2, b - 1, 8, 1); }); }
    }
    ctx.fillStyle = `rgba(${L.mote},.9)`;
    for (let i = 0; i < 24; i++) { const a = (i * 53 + t * (4 + i % 5)) % W, b = (i * 37 + Math.sin(t + i) * 10 + t * 3) % GY; if (Math.sin(t * 2 + i) > 0.2) ctx.fillRect(a, b, 1, 1); }
    if (L.star) { const s = (t % 9) / 1.2; if (s < 1) { ctx.fillStyle = 'rgba(255,250,230,.9)'; for (let j = 0; j < 10; j++) ctx.fillRect(330 - s * 120 - j * 2, 18 + s * 40 - j, 1, 1); } }
    const g = ctx.createRadialGradient(196, 130, 120, 196, 136, 260); g.addColorStop(0, 'rgba(0,0,0,0)'); g.addColorStop(1, 'rgba(10,4,20,.5)'); ctx.fillStyle = g; ctx.fillRect(0, 0, W, H);
  };
  // bayangan panjang tokoh (cahaya dari kanan → bayangan ke kiri)
  art.castShadow = function (ctx, a, w, feet) {
    ctx.fillStyle = 'rgba(20,8,30,.38)';
    ctx.beginPath(); ctx.moveTo(a + 2, feet); ctx.lineTo(a + w - 2, feet); ctx.lineTo(a + w - 26, feet + 4); ctx.lineTo(a - 30, feet + 4); ctx.fill();
    ctx.fillStyle = 'rgba(10,4,16,.55)'; ctx.fillRect(a + 3, feet - 1, w - 6, 2);
  };

  // hiasan toko yang dibeli dari Tabung
  art.decor = function (ctx, layer, list, t) {
    if (!list || !list.length) return;
    const has = (k) => list.includes(k);
    const f = (c, a, b, w, h) => { ctx.fillStyle = c; ctx.fillRect(a, b, w, h); };
    if (layer === 'back') {
      if (has('poster')) { f('#1a1420', 120, 132, 26, 22); f('#2d2358', 121, 133, 24, 20); f('#e8893a', 127, 137, 10, 10); f('#c56a26', 132, 137, 5, 10); f('#f3d9a0', 123, 142, 20, 2); f('#fff6d8', 140, 135, 1, 1); f('#fff6d8', 124, 150, 1, 1); }
      if (has('papan')) {
        ctx.strokeStyle = '#f2c14e'; ctx.lineWidth = 1; ctx.strokeRect(270.5, 64.5, 109, 17);
        const k = Math.floor(t * 2) % 4; f('#fff1c0', 272 + k * 34, 65, 2, 1); f('#fff1c0', 378, 70 + k * 2, 1, 2);
      }
      if (has('karpet')) { f('#86282a', 150, 196, 108, 4); f('#c8463d', 150, 196, 108, 2); for (let i = 152; i < 256; i += 6) f('#f2c14e', i, 198, 2, 1); }
      if (has('balon')) {
        [[248, 62, '#ff7aa8'], [256, 56, '#ffd25a'], [264, 64, '#5ad0ff']].forEach(([a, b, c], i) => {
          const y = b + Math.round(Math.sin(t * 1.6 + i) * 2);
          f('#1a1420', a + 2, y + 8, 1, 108 - y); ball2(ctx, a + 2, y + 3, 4, c);
        });
      }
      if (has('lampu')) {
        const cols = ['#ff5a5a', '#ffd25a', '#5ad0ff', '#7aff8a', '#ff7ad0'];
        for (let i = 0; i < 14; i++) {
          const X = 256 + i * 10, Y = 99 + Math.round(Math.sin(i * 0.9) * 2), on = (Math.floor(t * 2) + i) % 3 !== 0;
          f('#1a1420', X, Y - 1, 1, 2); f(on ? cols[i % 5] : '#4d4466', X - 1, Y + 1, 3, 3);
          if (on) glowOn(ctx, X, Y + 2, 7, '255,230,160', 0.3);
        }
      }
    } else if (has('tanaman')) {
      f('#1a1420', 240, 178, 16, 18); f('#b05e22', 241, 180, 14, 15); f('#e8893a', 241, 180, 14, 2);
      for (let k = 0; k < 5; k++) { const sw = Math.round(Math.sin(t * 1.5 + k) * 1); f('#3f9a5a', 244 + k * 2 + sw, 166 - (k % 2) * 4, 2, 14); f('#9ae08a', 243 + k * 2 + sw, 164 - (k % 2) * 4, 4, 3); }
      f('#ff7aa8', 247, 160, 3, 3);
    }
  };
  function ball2(ctx, cx, cy, r, c) { ctx.fillStyle = c; for (let j = -r; j <= r; j++) for (let i = -r; i <= r; i++) if (i * i + j * j <= r * r) ctx.fillRect(cx + i, cy + j, 1, 1); ctx.fillStyle = 'rgba(255,255,255,.7)'; ctx.fillRect(cx - 2, cy - 2, 1, 1); }

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
