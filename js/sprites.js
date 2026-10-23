// Sprite pixel art: digambar dari baris teks atau dibentuk prosedural, lalu diberi outline otomatis.
(function () {
  const G = (window.G = window.G || {});

  const PAL = {
    k: '#2b1d1a', // outline
    r: '#d63c2f', // merah seragam
    R: '#9e2a22', // merah gelap
    y: '#f4c430', // kuning reflektor
    s: '#e0a96d', // kulit sawo cerah
    S: '#c08a52', // bayangan kulit
    h: '#2a1d17', // rambut
    w: '#ffffff',
    e: '#1a1a1a', // mata
    b: '#3a3a3a', // sepatu
    m: '#8c3b2a', // mulut
    p: '#f08f7a', // pipi
    n: '#262626', // badan Ara
    G: '#e4e4da', // punggung Ara
    g: '#9a9a92',
    q: '#cfcfc4', // cakar
    c: '#f39a2e', // kucing oranye
    C: '#c96f14',
  };

  function grid(w, h) {
    return Array.from({ length: h }, () => Array(w).fill('.'));
  }

  function ell(cx, cy, rx, ry, x, y) {
    return ((x - cx) / rx) ** 2 + ((y - cy) / ry) ** 2 <= 1;
  }

  // Tambah garis luar di piksel kosong yang bersebelahan dengan piksel terisi.
  function outline(g, ch = 'k') {
    const h = g.length, w = g[0].length;
    const out = g.map((r) => r.slice());
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (g[y][x] !== '.') continue;
        const near = [[1, 0], [-1, 0], [0, 1], [0, -1]].some(([dx, dy]) => {
          const v = g[y + dy] && g[y + dy][x + dx];
          return v && v !== '.' && v !== ch;
        });
        if (near) out[y][x] = ch;
      }
    return out;
  }

  function toCanvas(rows, pal = PAL) {
    const h = rows.length;
    const w = Math.max(...rows.map((r) => r.length));
    const c = document.createElement('canvas');
    c.width = w;
    c.height = h;
    const x = c.getContext('2d');
    rows.forEach((r, yy) => {
      for (let xx = 0; xx < r.length; xx++) {
        const ch = r[xx];
        if (ch === '.' || ch === ' ') continue;
        x.fillStyle = pal[ch] || '#f0f';
        x.fillRect(xx, yy, 1, 1);
      }
    });
    return c;
  }

  const gridCanvas = (g, pal) => toCanvas(g.map((r) => r.join('')), pal);

  // ---------- Aksa: pemadam cilik, seragam merah, badan berisi ----------
  const AKSA = [
    '....kkkkkkkk....',
    '...krrrrrrrrk...',
    '..krrrryyrrrrk..',
    '..krrrryyrrrrk..',
    '.kRRRRRRRRRRRRk.',
    '..khsssssssshk..',
    '..kssessssessk..',
    '..kspssssssspk..',
    '..ksssmmmmsssk..',
    '...kssssssssk...',
    '..kkrrrrrrrrkk..',
    '.krrrrrrrrrrrrk.',
    'krrrrrrrrrrrrrrk',
    'kryyyyyyyyyyyyrk',
    'krrrrrrrrrrrrrrk',
    'ksrrrrrrrrrrrrsk',
    'kkrrrrrrrrrrrrkk',
    '.kRRRRRRRRRRRRk.',
    '.kRRRRRkkRRRRRk.',
    '.kyyyyykkyyyyyk.',
    '.kbbbbk..kbbbbk.',
    '.kkkkkk..kkkkkk.',
  ];
  // ---------- Ara: honey badger pemberani (menghadap kanan) ----------
  // ---------- Ara: honey badger pemberani (chibi, menghadap kanan) ----------
  const ARA = [
    '........................',
    '........................',
    '............kkkkkk......',
    '..........kkGGGGGGkk....',
    '..kk.....kGGGGGGGGGGk...',
    '.kGGk...kGGGGGGGGGGGGk..',
    '.kGGGkkkGGGGGGGGGGGGGGk.',
    '..kGGGGGGGGGGGGGGGGGGGGk',
    '..kGGGGGGGGGGnnnnnnnnnnk',
    '..kGGGGGGGGGnnnwwennnnnk',
    '..kggggggggnnnnwwennnnnk',
    '.knnnnnnnnnnnnnnpnnnnnek',
    '.knnnnnnnnnnnnnnnnnnkkk.',
    '.knnnnnnnnnnnnnnnnnk....',
    '..knnnnnnnnnnnnnnnk.....',
    '..knnkknnkkkknnkknnk....',
    '..knnk.knk..knnk.knk....',
    '..kqqk.kqk..kqqk.kqk....',
    '..kkkk.kkk..kkkk.kkk....',
  ];

  // Aksesori Ara, digambar di atas sprite Ara (koordinat grid yang sama).
  const LEGS = [[3, 4], [8], [13, 14], [18]];
  const ACC_DRAW = {
    jubah: { px: (p) => {
      for (let x = 3; x <= 11; x++) {
        const bottom = 8 + Math.floor((x - 3) / 4);
        for (let y = 6; y <= bottom; y++) p(x, y, y === bottom ? '#5b2a86' : '#8a4fd8');
      }
      p(2, 5, '#8a4fd8'); p(1, 4, '#5b2a86'); p(2, 4, '#8a4fd8');
      p(11, 6, '#f4c430'); p(11, 7, '#f4c430');
    } },
    helm: { px: (p) => {
      for (let x = 9; x <= 21; x++) p(x, 4, '#9e2a22');
      for (let x = 11; x <= 19; x++) p(x, 3, '#d63c2f');
      for (let x = 12; x <= 18; x++) p(x, 2, '#d63c2f');
      for (let x = 13; x <= 17; x++) { p(x, 1, '#d63c2f'); p(x, 0, '#2b1d1a'); }
      p(12, 1, '#2b1d1a'); p(18, 1, '#2b1d1a'); p(11, 2, '#2b1d1a'); p(19, 2, '#2b1d1a'); p(10, 3, '#2b1d1a'); p(20, 3, '#2b1d1a');
      p(8, 4, '#2b1d1a'); p(22, 4, '#2b1d1a');
      p(15, 2, '#f4c430'); p(15, 3, '#f4c430');
    } },
    syal: { px: (p) => {
      for (let y = 8; y <= 13; y++) { p(11, y, '#f4c430'); p(12, y, '#e0a81e'); }
      p(10, 13, '#f4c430'); p(10, 14, '#f4c430'); p(9, 14, '#e0a81e');
    } },
    kacamata: { px: (p) => {
      for (let x = 14; x <= 18; x++) { p(x, 8, '#2b1d1a'); p(x, 11, '#2b1d1a'); }
      for (let y = 9; y <= 10; y++) { p(14, y, '#2b1d1a'); p(18, y, '#2b1d1a'); for (let x = 15; x <= 17; x++) p(x, y, '#7fd3ff'); }
      p(15, 9, '#e6f7ff'); p(13, 9, '#2b1d1a'); p(12, 9, '#2b1d1a');
    } },
    sepatu: { px: (p) => {
      for (const leg of LEGS) for (const x of leg) { p(x, 16, '#d63c2f'); p(x, 17, '#d63c2f'); p(x, 18, '#9e2a22'); }
    } },
  };

  // ---------- Kucing Si Oren ----------
  function buildCat() {
    const w = 15, h = 12, g = grid(w, h);
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (ell(8.5, 7, 3.6, 2.6, x, y)) g[y][x] = x % 2 === 0 && y < 7 ? 'C' : 'c';
        if (ell(4, 5, 2.6, 2.3, x, y)) g[y][x] = 'c';
      }
    [[2, 2], [2, 3], [6, 2], [6, 3]].forEach(([x, y]) => (g[y][x] = 'c'));
    [[12, 5], [13, 4], [13, 3], [12, 2]].forEach(([x, y]) => (g[y][x] = 'C'));
    [[5, 9], [6, 9], [10, 9], [11, 9]].forEach(([x, y]) => (g[y][x] = 'c'));
    g[5][3] = 'e'; g[5][5] = 'e'; g[6][4] = 'p';
    return outline(g);
  }

  // ---------- Warga desa ----------
  function buildPerson(o) {
    const w = 16, h = 24, g = grid(w, h);
    const pal = Object.assign({}, PAL, { H: o.headColor, c: o.shirt, q: o.pants, s: o.skin || PAL.s, x: o.accent || '#ffffff' });
    for (let y = 0; y < h; y++)
      for (let x = 0; x < w; x++) {
        if (ell(7.5, 7, 3.6, 3.6, x, y)) g[y][x] = 's';
        if (y >= 11 && y <= 18 && x >= 3 && x <= 12) g[y][x] = 'c';
        if (y >= 12 && y <= 16 && (x === 2 || x === 13)) g[y][x] = y === 16 ? 's' : 'c';
        if (y >= 19 && y <= 21 && ((x >= 4 && x <= 6) || (x >= 9 && x <= 11))) g[y][x] = y === 21 ? 'b' : 'q';
      }
    if (o.head === 'hijab') {
      for (let y = 0; y < h; y++)
        for (let x = 0; x < w; x++) {
          if (ell(7.5, 7, 4.6, 4.8, x, y) && !ell(7.5, 7.8, 2.7, 2.9, x, y)) g[y][x] = 'H';
          if (y >= 10 && y <= 13 && x >= 2 && x <= 13 && !(y === 10 && (x < 4 || x > 11))) g[y][x] = 'H';
        }
    } else if (o.head === 'chef') {
      for (let y = 0; y <= 3; y++) for (let x = 4; x <= 11; x++) g[y][x] = 'w';
      for (let x = 4; x <= 11; x++) g[4][x] = 'g';
      g[0][4] = '.'; g[0][11] = '.';
    } else if (o.head === 'peci') {
      for (let y = 2; y <= 4; y++) for (let x = 4; x <= 11; x++) g[y][x] = 'H';
    } else if (o.head === 'cap') {
      for (let y = 2; y <= 4; y++) for (let x = 4; x <= 11; x++) g[y][x] = 'H';
      for (let x = 11; x <= 14; x++) g[4][x] = 'H';
    }
    if (o.head !== 'hijab') {
      for (let x = 4; x <= 11; x++) if (g[5][x] === 's') g[5][x] = 'h';
    }
    g[7][6] = 'e'; g[7][9] = 'e';
    g[8][5] = 'p'; g[8][10] = 'p';
    g[9][7] = 'm'; g[9][8] = 'm';
    if (o.mustache) { g[9][6] = 'h'; g[9][9] = 'h'; }
    if (o.apron) for (let y = 13; y <= 18; y++) for (let x = 5; x <= 10; x++) g[y][x] = 'x';
    if (o.batik) for (let y = 11; y <= 18; y++) for (let x = 3; x <= 12; x++) if ((x + y) % 3 === 0) g[y][x] = 'x';
    return gridCanvas(outline(g), pal);
  }

  // ---------- Benda kecil ----------
  const BREAD = [
    '..kkkkkkkk..',
    '.kOOOOOOOOk.',
    'kOoOoOoOoOOk',
    'kOOOOOOOOOOk',
    'kooooooooook',
    '.kkkkkkkkkk.',
  ];
  const BUCKET = [
    '.kkkkkkkkkk.',
    'k..........k',
    'kkkkkkkkkkkk',
    'kbbbbbbbbbbk',
    'kgggggggggbk',
    '.kggggggggk.',
    '.kggggggggk.',
    '.kggggggbbk.',
    '..kggggggk..',
    '..kkkkkkkk..',
  ];
  const DROP = [
    '...kk...',
    '..kLLk..',
    '..kLLk..',
    '.kLLLLk.',
    'kLwLLLLk',
    'kLwLLLBk',
    'kLLLLLBk',
    '.kLLBBk.',
    '..kkkk..',
  ];
  const RUNG = [
    'kk......kk',
    'kTkkkkkkTk',
    'kTttttttTk',
    'kTkkkkkkTk',
    'kk......kk',
  ];
  const CROWN = [
    'k...k...k...k',
    'kyk.kyk.kyk.k',
    'kyykyyykyyyyk',
    'kyyyyryyyyyyk',
    'kyyyrrryyybyk',
    'kyyyyryyyyyyk',
    'kkkkkkkkkkkkk',
  ];
  const STAR = [
    '.....k.....',
    '....kyk....',
    '....kyk....',
    'kkkkyyykkkk',
    '.kyyyyyyyk.',
    '..kyyyyyk..',
    '..kyykyyk..',
    '.kyyk.kyyk.',
    '.kkk...kkk.',
  ];
  const OBJ_PAL = Object.assign({}, PAL, {
    O: '#f7c66b', o: '#d98a2b', L: '#59b8ff', B: '#2f7fd1', T: '#a0652d', t: '#c98a45', b: '#6d6d6d', g: '#a8a8a8', y: '#f4c430', r: '#e8451c',
  });

  // Lencana: perisai berwarna dengan bintang di tengah.
  function buildBadge(color, dark) {
    const w = 14, h = 15, g = grid(w, h);
    for (let y = 1; y < h - 1; y++)
      for (let x = 1; x < w - 1; x++) {
        const inset = y < 8 ? 0 : Math.floor((y - 7) * 0.9);
        if (x >= 1 + inset && x <= w - 2 - inset) g[y][x] = 'c';
      }
    for (let y = 2; y < 9; y++) for (let x = 2; x <= 3; x++) if (g[y][x] === 'c') g[y][x] = 'x';
    const star = [[6, 3], [7, 3], [6, 4], [7, 4], [3, 5], [4, 5], [5, 5], [6, 5], [7, 5], [8, 5], [9, 5], [10, 5], [4, 6], [5, 6], [6, 6], [7, 6], [8, 6], [9, 6], [5, 7], [6, 7], [7, 7], [8, 7], [4, 8], [5, 8], [8, 8], [9, 8]];
    star.forEach(([x, y]) => (g[y][x] = 'y'));
    return gridCanvas(outline(g), Object.assign({}, PAL, { c: color, x: dark }));
  }

  // ---------- Api Jahil (prosedural, beranimasi) ----------
  // cx: tengah, by: dasar, w/h: ukuran, mood: happy|laugh|hurt|sad
  function drawFire(ctx, cx, by, w, h, t, o = {}) {
    w = Math.max(6, Math.round(w));
    h = Math.max(8, Math.round(h));
    const r = w / 2;
    const cyc = by - r;
    const tipY = by - h;
    const seed = o.seed || 0;
    const rows = [];
    for (let y = tipY; y < by; y++) {
      let half;
      if (y >= cyc) half = Math.sqrt(Math.max(0, r * r - (y - cyc) ** 2));
      else half = r * Math.pow((y - tipY) / (cyc - tipY), 0.9);
      const v = (y - tipY) / h;
      const sway = Math.sin(t * 7 + y * 0.45 + seed) * (1 - v) * Math.max(1, w / 12);
      rows.push({ y, half, off: sway, v });
    }
    const cols = o.colors || ['#7a200c', '#e8451c', '#ff8c1a', '#ffd23f'];
    for (const pass of [0, 1, 2, 3]) {
      for (const row of rows) {
        const shrink = [0, 1, Math.max(2, row.half * 0.38), Math.max(3, row.half * 0.68)][pass];
        const hh = row.half + (pass === 0 ? 1 : 0) - shrink;
        if (hh <= 0) continue;
        if (pass >= 2 && row.v < [0, 0, 0.15, 0.4][pass]) continue;
        const x0 = Math.round(cx + row.off - hh);
        const x1 = Math.round(cx + row.off + hh);
        ctx.fillStyle = cols[pass];
        ctx.fillRect(x0, row.y - (pass === 0 ? 1 : 0), Math.max(1, x1 - x0), pass === 0 ? 2 : 1);
      }
    }
    if (o.noFace) return;
    const ex = Math.max(2, Math.round(w * 0.2));
    const ey = Math.round(by - r * 1.15);
    const es = w >= 24 ? 3 : 2;
    const mood = o.mood || 'happy';
    const ink = '#3a0f05';
    for (const side of [-1, 1]) {
      const x = Math.round(cx + side * ex - (side < 0 ? es : 0));
      if (mood === 'hurt') {
        ctx.fillStyle = ink;
        for (let i = 0; i < es; i++) ctx.fillRect(x + i, ey + (side < 0 ? i : es - 1 - i), 1, 1);
        ctx.fillRect(x, ey + es - 1, es, 1);
      } else if (mood === 'sad') {
        ctx.fillStyle = ink;
        ctx.fillRect(x, ey + 1, es, 1);
        ctx.fillStyle = '#7fd3ff';
        ctx.fillRect(x + (side < 0 ? 0 : es - 1), ey + 2, 1, 2);
      } else {
        ctx.fillStyle = '#fff';
        ctx.fillRect(x, ey, es, es + 1);
        ctx.fillStyle = ink;
        ctx.fillRect(x + (side < 0 ? es - 1 : 0), ey + 1, 1, es);
      }
      if (o.angry) {
        ctx.fillStyle = ink;
        for (let i = 0; i < es + 1; i++) ctx.fillRect(x - (side < 0 ? 1 : 0) + i, ey - 2 - (side < 0 ? es - i : i) * 0.5, 1, 1);
      }
    }
    const my = ey + es + 2;
    const mw = Math.max(2, Math.round(w * 0.22));
    ctx.fillStyle = ink;
    if (mood === 'laugh') {
      ctx.fillRect(Math.round(cx - mw / 2), my, mw, Math.max(2, Math.round(w / 9)));
      ctx.fillStyle = '#ff6a6a';
      ctx.fillRect(Math.round(cx - mw / 2) + 1, my + 1, Math.max(1, mw - 2), 1);
    } else if (mood === 'sad' || mood === 'hurt') {
      ctx.fillRect(Math.round(cx - mw / 2), my + 1, mw, 1);
      ctx.fillRect(Math.round(cx - mw / 2) - 1, my + 2, 1, 1);
      ctx.fillRect(Math.round(cx + mw / 2), my + 2, 1, 1);
    } else {
      ctx.fillRect(Math.round(cx - mw / 2), my + 1, mw, 1);
      ctx.fillRect(Math.round(cx - mw / 2) - 1, my, 1, 1);
      ctx.fillRect(Math.round(cx + mw / 2), my, 1, 1);
    }
    if (o.crown) {
      const cw = G.spr.crown.width;
      ctx.drawImage(G.spr.crown, Math.round(cx - cw / 2), Math.round(ey - 11));
    }
  }

  function fireIcon(mood) {
    const c = document.createElement('canvas');
    c.width = 20; c.height = 24;
    drawFire(c.getContext('2d'), 10, 23, 16, 20, 0.6, { mood });
    return c;
  }
  function smallFlame() {
    const c = document.createElement('canvas');
    c.width = 12; c.height = 14;
    drawFire(c.getContext('2d'), 6, 13, 9, 12, 0.3, { noFace: true });
    return c;
  }

  // Perbesar sprite (nearest-neighbour) lalu jadikan data URL untuk <img>.
  function iconURL(src, scale = 6) {
    const c = document.createElement('canvas');
    c.width = src.width * scale;
    c.height = src.height * scale;
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    x.drawImage(src, 0, 0, c.width, c.height);
    return c.toDataURL();
  }

  // ---------- Sprite 4 arah untuk dunia top-down ----------
  const AKSA_BACK = [
    '....kkkkkkkk....', '...krrrrrrrrk...', '..krrrrrrrrrrk..', '..krrrrrrrrrrk..', '.kRRRRRRRRRRRRk.',
    '..kHHhHHHhHHHk..', '..kHHHHhHHHHHk..', '..sHhHHHHHhHHs..', '..kHHHHHHhHHHk..', '...kssssssssk...',
    '..kkrrrrrrrrkk..', '.krrrrrrrrrrrrk.', 'krrrrrrrrrrrrrrk', 'kryyyyyyyyyyyyrk', 'krrrrrrrrrrrrrrk',
    'ksryyyyyyyyyyrsk', 'kkrrrrrrrrrrrrkk', '.kRRRRRRRRRRRRk.', '.kRRRRRkkRRRRRk.', '.kyyyyykkyyyyyk.', '.kbbbbk..kbbbbk.', '.kkkkkk..kkkkkk.',
  ];
  const AKSA_SIDE = [
    '....kkkkkkk.....', '...krrrrrrrk....', '..krrrrrryyrk...', '..krrrrrryyrk...', '..kRRRRRRRRRRRRk',
    '..khhhhsssssk...', '..khhhssssesk...', '..khhsssssssk...', '...khssssmsk....', '....kssssssk....',
    '...kkrrrrrrkk...', '..krrrrrrrrrk...', '..krrrrrrrrrk...', '..kyyyyyyyyyk...', '..krrrrssrrrk...',
    '..krrrrssrrrk...', '..kkrrrrrrrkk...', '...kRRRRRRRk....', '...kRRkkRRRk....', '...kyyk.kyyk....', '...kbbk.kbbbk...', '...kkkk.kkkkk...',
  ];
  const ARA_FRONT = [
    '................', '................', '................',
    '....kkkkkkkk....', '...kGGGGGGGGk...', '..kGGGGGGGGGGk..', '.kGGGGGGGGGGGGk.', '.knGGGGGGGGGGnk.',
    '.knnwennnnewnnk.', '.knnpnneennpnnk.', '..knnnnnnnnnnk..', '.knnnnnnnnnnnnk.', 'knnnnnnnnnnnnnnk',
    'knnnnnnnnnnnnnnk', '.knnnnnnnnnnnnk.', '.knnkk....kknnk.', '.kqqk......kqqk.', '.kkkk......kkkk.',
  ];
  const ARA_BACK = [
    '................', '................', '................',
    '....kkkkkkkk....', '...kGGGGGGGGk...', '..kGGGGGGGGGGk..', '.knGGGGGGGGGGnk.', '.knnGGGGGGGGnnk.',
    '.knnGGGGGGGGnnk.', '.knnnGGGGGGnnnk.', '..knnGGGGGGnnk..', '.knnnGGGGGGnnnk.', 'knnnnnGGGGnnnnnk',
    'knnnnnGGGGnnnnnk', '.knnnnnGGnnnnnk.', '.knnkk.GG.kknnk.', '.kqqk..kk..kqqk.', '.kkkk......kkkk.',
  ];
  // Aksesori Ara untuk tampak depan/belakang (grid 16x18)
  const ACC_FB = {
    helm: (p) => {
      for (let x = 6; x <= 9; x++) { p(x, 0, '#2b1d1a'); p(x, 1, '#d63c2f'); }
      p(5, 1, '#2b1d1a'); p(10, 1, '#2b1d1a');
      for (let x = 4; x <= 11; x++) p(x, 2, '#d63c2f');
      p(3, 2, '#2b1d1a'); p(12, 2, '#2b1d1a');
      for (let x = 2; x <= 13; x++) p(x, 3, '#9e2a22');
    },
    helmFront: (p) => { p(7, 1, '#f4c430'); p(8, 1, '#f4c430'); p(7, 2, '#f4c430'); p(8, 2, '#f4c430'); },
    syal: (p) => { for (let x = 3; x <= 12; x++) p(x, 10, x % 2 ? '#f4c430' : '#e0a81e'); p(11, 11, '#f4c430'); p(11, 12, '#e0a81e'); },
    kacamata: (p) => {
      for (let x = 3; x <= 12; x++) p(x, 8, '#2b1d1a');
      p(4, 8, '#7fd3ff'); p(5, 8, '#bfe8ff'); p(10, 8, '#7fd3ff'); p(11, 8, '#bfe8ff');
    },
    sepatu: (p) => { for (const x of [2, 3, 12, 13]) p(x, 16, '#d63c2f'); for (const x of [1, 2, 3, 4, 11, 12, 13, 14]) p(x, 17, '#9e2a22'); },
    jubahFront: (p) => { p(7, 10, '#f4c430'); p(8, 10, '#f4c430'); for (let y = 11; y <= 14; y++) { p(0, y, '#8a4fd8'); p(15, y, '#8a4fd8'); } },
    jubahBack: (p) => { for (let y = 10; y <= 15; y++) for (let x = 3; x <= 12; x++) p(x, y, y === 15 || x === 3 || x === 12 ? '#5b2a86' : '#8a4fd8'); },
  };

  // Frame langkah: geser kaki kiri atau kanan 1 piksel ke atas.
  function stepFrame(src, side) {
    const c = document.createElement('canvas');
    c.width = src.width;
    c.height = src.height;
    const x = c.getContext('2d');
    x.drawImage(src, 0, 0);
    const half = Math.floor(src.width / 2);
    const sx = side < 0 ? 0 : half;
    const legH = 4;
    const top = src.height - legH;
    x.clearRect(sx, top - 1, half, legH + 1);
    x.drawImage(src, sx, top - 1, half, 1, sx, top - 1, half, 1);
    x.drawImage(src, sx, top, half, legH, sx, top - 1, half, legH);
    return c;
  }
  function flip(src) {
    const c = document.createElement('canvas');
    c.width = src.width;
    c.height = src.height;
    const x = c.getContext('2d');
    x.translate(src.width, 0);
    x.scale(-1, 1);
    x.drawImage(src, 0, 0);
    return c;
  }
  const walkSet = (img) => [img, stepFrame(img, -1), img, stepFrame(img, 1)];

  G.drawFire = drawFire;
  G.flipSprite = flip;
  G.iconURL = iconURL;
  G.ACC_DRAW = ACC_DRAW;
  G.buildSprites = function () {
    const spr = (G.spr = {});
    spr.aksa = toCanvas(AKSA);
    spr.ara = toCanvas(ARA);
    spr.cat = gridCanvas(buildCat());
    spr.ani = buildPerson({ head: 'hijab', headColor: '#e86fa0', shirt: '#f7a8c8', pants: '#7a4a8a' });
    spr.budi = buildPerson({ head: 'chef', headColor: '#fff', shirt: '#ffffff', pants: '#5a6b8a', apron: true, accent: '#f4c430', mustache: true });
    spr.joko = buildPerson({ head: 'cap', headColor: '#2f7fd1', shirt: '#3fa34d', pants: '#3a4a6a' });
    spr.kades = buildPerson({ head: 'peci', headColor: '#1f1f1f', shirt: '#b5652a', pants: '#2a2a2a', batik: true, accent: '#f4c430', mustache: true });
    spr.bread = toCanvas(BREAD, OBJ_PAL);
    spr.bucket = toCanvas(BUCKET, OBJ_PAL);
    spr.drop = toCanvas(DROP, OBJ_PAL);
    spr.rung = toCanvas(RUNG, OBJ_PAL);
    spr.crown = toCanvas(CROWN, OBJ_PAL);
    spr.star = toCanvas(STAR, OBJ_PAL);
    spr.fireIcon = fireIcon('happy');
    spr.flame = smallFlame();
    spr.badges = [
      buildBadge('#3b7dd8', '#7fb2f0'),
      buildBadge('#e8451c', '#ff9a6a'),
      buildBadge('#c98a45', '#f0c07a'),
      buildBadge('#2fa6b8', '#8ce0ea'),
      buildBadge('#e0a81e', '#fff0a0'),
    ];

    // Ara + aksesori dalam satu kanvas
    const araCache = {};
    spr.araWith = function (equip) {
      const key = Object.keys(ACC_DRAW).filter((k) => equip && equip[k]).join(',');
      return araCache[key] || (araCache[key] = drawAraWith(equip));
    };
    function drawAraWith(equip) {
      const base = spr.ara;
      const c = document.createElement('canvas');
      c.width = base.width; c.height = base.height;
      const x = c.getContext('2d');
      const p = (px, py, col) => { x.fillStyle = col; x.fillRect(px, py, 1, 1); };
      const keys = Object.keys(ACC_DRAW).filter((k) => equip && equip[k]);
      x.drawImage(base, 0, 0);
      keys.forEach((k) => ACC_DRAW[k].px(p));
      return c;
    }

    // Aksa & Ara 4 arah, masing-masing 4 frame (diam, langkah kiri, diam, langkah kanan)
    const PALH = Object.assign({}, PAL, { H: '#4a3426' });
    const aSide = toCanvas(AKSA_SIDE, PALH);
    spr.aksaDir = {
      down: walkSet(spr.aksa),
      up: walkSet(toCanvas(AKSA_BACK, PALH)),
      right: walkSet(aSide),
      left: walkSet(flip(aSide)),
    };
    spr.aksaBack = toCanvas(AKSA_BACK, PALH);
    const araDirCache = {};
    spr.araDir = function (equip) {
      const key = Object.keys(ACC_DRAW).filter((k) => equip && equip[k]).join(',');
      if (araDirCache[key]) return araDirCache[key];
      const paint = (rows, fns) => {
        const c = toCanvas(rows);
        const x = c.getContext('2d');
        const p = (px, py, col) => { x.fillStyle = col; x.fillRect(px, py, 1, 1); };
        fns.forEach((f) => f && f(p));
        return c;
      };
      const e = equip || {};
      const front = paint(ARA_FRONT, [e.jubah && ACC_FB.jubahFront, e.syal && ACC_FB.syal, e.kacamata && ACC_FB.kacamata, e.sepatu && ACC_FB.sepatu, e.helm && ACC_FB.helm, e.helm && ACC_FB.helmFront]);
      const back = paint(ARA_BACK, [e.syal && ACC_FB.syal, e.jubah && ACC_FB.jubahBack, e.sepatu && ACC_FB.sepatu, e.helm && ACC_FB.helm]);
      const side = spr.araWith(e);
      const bob = (img) => {
        const c = document.createElement('canvas');
        c.width = img.width; c.height = img.height;
        c.getContext('2d').drawImage(img, 0, -1);
        return c;
      };
      const sideSet = (img) => [img, bob(img), img, bob(img)];
      return (araDirCache[key] = {
        down: walkSet(front),
        up: walkSet(back),
        right: sideSet(side),
        left: sideSet(flip(side)),
        back,
      });
    };

    const I = (G.icons = {});
    I.cat = iconURL(spr.cat);
    I.fire = iconURL(spr.fireIcon);
    I.bread = iconURL(spr.bread);
    I.bucket = iconURL(spr.bucket);
    I.crown = iconURL(spr.crown);
    I.drop = iconURL(spr.drop);
    I.rung = iconURL(spr.rung);
    I.flame = iconURL(spr.flame);
    I.star = iconURL(spr.star);
    I.aksa = iconURL(spr.aksa);
    I.ara = iconURL(spr.ara);
    I.badges = spr.badges.map((b) => iconURL(b));
  };
})();
