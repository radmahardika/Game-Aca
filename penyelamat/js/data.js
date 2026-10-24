// Duo Penyelamat — data dunia: peta, hewan, alat, sprite & tekstur pixel.
(function () {
  const T = (window.TPM = window.TPM || {});
  T.VERSION = 8;

  // ---------- peta 40x40 ----------
  // WALL: 0 kosong, 1 pohon, 2 batu, 3 Pohon Sarang
  // FLOOR: 0 rumput, 1 air, 2 lumpur, 3 gua, 4 ilalang, 5 jembatan kayu, 6 batu sungai
  const N = (T.N = 40);
  const WALL = (T.WALL = new Uint8Array(N * N));
  const FLOOR = (T.FLOOR = new Uint8Array(N * N));
  const I = (T.I = (x, y) => y * N + x);
  const riverX = (T.riverX = (y) => Math.round(27 + 3 * Math.sin(y / 5)));
  const SX = 17, SY = 19;
  T.SARANG = { x: SX + 1, y: SY + 1 };
  T.BRIDGE_ROWS = [19, 33, 8];
  // kunang-kunang di kedua ujung tiap jembatan supaya Benhat bisa menemukan jalan menyeberang
  T.BRIDGE_LIGHTS = T.BRIDGE_ROWS.flatMap((by) => [-2, 2].map((dx) => ({ x: riverX(by) + dx + 0.5, y: by + 0.5, r: 2.4, i: 0.4 })));

  T.buildMap = function () {
    WALL.fill(0); FLOOR.fill(0);
    let s = 7;
    const rnd = () => { s = (s * 16807) % 2147483647; return s / 2147483647; };
    const rect = (x0, y0, x1, y1, f) => { for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) f(x, y); };
    for (let y = 0; y < N; y++) for (let x = 0; x < N; x++) if (x == 0 || y == 0 || x == N - 1 || y == N - 1) WALL[I(x, y)] = 1;
    for (let y = 1; y < N - 1; y++) { const c = riverX(y); for (let x = c - 1; x <= c + 1; x++) FLOOR[I(x, y)] = 1; }
    rect(2, 2, 14, 14, (x, y) => { if (rnd() < 0.3) WALL[I(x, y)] = 1; });                 // hutan pinus
    rect(32, 2, 37, 16, (x, y) => { if (rnd() < 0.16) WALL[I(x, y)] = 1; });               // bukit
    rect(2, 26, 12, 37, (x, y) => { if (rnd() < 0.55) FLOOR[I(x, y)] = 2; else if (rnd() < 0.08) WALL[I(x, y)] = 1; }); // rawa
    rect(14, 30, 23, 38, (x, y) => { FLOOR[I(x, y)] = 4; if (rnd() < 0.04) WALL[I(x, y)] = 1; });                        // padang ilalang
    rect(15, 3, 23, 27, (x, y) => { if (rnd() < 0.05) WALL[I(x, y)] = 1; });
    rect(31, 25, 38, 38, (x, y) => {                                                        // gua batu
      const edge = x == 31 || x == 38 || y == 25 || y == 38;
      WALL[I(x, y)] = edge ? 2 : 0; FLOOR[I(x, y)] = 3;
      if (!edge && rnd() < 0.1) WALL[I(x, y)] = 2;
    });
    WALL[I(31, 30)] = 0; WALL[I(31, 31)] = 0;
    for (const by of T.BRIDGE_ROWS) { const c = riverX(by); for (let x = c - 2; x <= c + 2; x++) { FLOOR[I(x, by)] = 5; WALL[I(x, by)] = 0; } }
    rect(SX - 4, SY - 4, SX + 5, SY + 5, (x, y) => { WALL[I(x, y)] = 0; if (FLOOR[I(x, y)] != 1) FLOOR[I(x, y)] = 0; });
    rect(SX, SY, SX + 1, SY + 1, (x, y) => (WALL[I(x, y)] = 3));
    for (let x = SX + 2; x < riverX(19) - 1; x++) { WALL[I(x, 19)] = 0; WALL[I(x, 20)] = 0; }
    for (let x = riverX(19) + 2; x < 32; x++) WALL[I(x, 19)] = 0;
    for (let y = 20; y < 31; y++) WALL[I(32, y)] = 0;
    WALL[I(31, 30)] = 0;
  };

  // ---------- hewan ----------
  T.VICTIMS = [
    { id: 'kelinci', nama: 'Kelinci', need: ['pelampung', 'tali'], reach: 2.8, river: 1,
      c: [[riverX(6), 6], [riverX(13), 13], [riverX(27), 27]],
      hint: 'Butuh sesuatu yang bisa mengapung dan bisa ditarik.',
      say: 'Kelinci terjebak di batu tengah sungai. Airnya deras!',
      lesson: 'Di dunia nyata: jangan masuk ke air deras. Lempar pelampung atau tali, lalu panggil orang dewasa.' },
    { id: 'rusa', nama: 'Rusa kecil', need: ['perban'], reach: 1.7, c: [[34, 5], [35, 11], [33, 14]],
      hint: 'Kakinya perlu dibalut.',
      say: 'Rusa kecil, kakinya terkilir. Tidak bisa berjalan sendiri.',
      lesson: 'Kaki terkilir jangan dipaksa berjalan. Balut, lalu papah pelan-pelan.' },
    { id: 'landak', nama: 'Landak', need: ['tongkat'], reach: 1.7, c: [[5, 5], [10, 9], [4, 12]],
      hint: 'Butuh benda panjang untuk mengungkit dahan.',
      say: 'Landak tertindih dahan besar. Berat sekali!',
      lesson: 'Benda berat bisa diangkat dengan tongkat pengungkit (tuas).' },
    { id: 'kambing', nama: 'Kambing kecil', need: ['selimut', 'peluit'], reach: 1.7, c: [[16, 35], [21, 32], [22, 37]],
      hint: 'Butuh yang menghangatkan badan, dan bunyi supaya mudah ditemukan.',
      say: 'Kambing kecil tersesat. Badannya menggigil kedinginan.',
      lesson: 'Kalau tersesat: diam di tempat, tiup peluit, dan jaga badan tetap hangat.' },
    { id: 'rubah', nama: 'Rubah', need: ['kain'], reach: 1.7, c: [[34, 29], [36, 34], [33, 36]],
      hint: 'Butuh sesuatu untuk menutup hidung dari asap.',
      say: 'Rubah di dalam gua penuh asap! Uhuk, uhuk.',
      lesson: 'Ada asap? Tutup hidung dengan kain basah dan merangkak rendah.' },
    { id: 'kerbau', nama: 'Anak kerbau', need: ['papan'], reach: 1.9, c: [[5, 30], [9, 34], [4, 36]],
      hint: 'Butuh pijakan lebar supaya tidak ikut tenggelam.',
      say: 'Anak kerbau terperosok ke lumpur. Kakinya tenggelam.',
      lesson: 'Terperosok lumpur? Jangan meronta. Papan membuat badan tidak ikut tenggelam.' },
    { id: 'kucing', nama: 'Anak kucing', need: ['tangga'], reach: 1.7, c: [[9, 21], [22, 13], [11, 17]],
      hint: 'Butuh sesuatu untuk naik ke tempat tinggi.',
      say: 'Anak kucing di atas pohon tinggi. Tidak bisa turun!',
      lesson: 'Naik ke tempat tinggi pakai tangga, dan selalu bersama orang dewasa.' },
    { id: 'monyet', nama: 'Anak monyet', need: ['tali'], reach: 1.7, c: [[37, 7], [32, 10], [36, 14]],
      hint: 'Butuh sesuatu yang bisa diulurkan lalu ditarik ke atas.',
      say: 'Anak monyet terperosok ke lubang yang dalam. Tidak bisa naik!',
      lesson: 'Ada yang jatuh ke lubang? Jangan ikut masuk. Ulurkan tali dari atas, lalu panggil orang dewasa.' },
    { id: 'pipit', nama: 'Anak burung pipit', need: ['tangga'], reach: 1.7, c: [[8, 4], [12, 12], [3, 8]],
      hint: 'Butuh sesuatu untuk naik dan mengembalikannya ke sarang.',
      say: 'Anak burung jatuh dari sarangnya di atas pohon.',
      lesson: 'Anak burung jatuh? Jangan dibawa pulang. Minta orang dewasa mengembalikannya ke sarang.' },
    { id: 'tupai', nama: 'Tupai kecil', need: ['kain'], reach: 1.7, c: [[15, 31], [19, 37], [23, 34]],
      hint: 'Butuh sesuatu yang dingin untuk mengompres.',
      say: 'Tupai kecil badannya panas sekali. Dia demam.',
      lesson: 'Kalau badan panas: kompres dengan kain basah, istirahat, dan beri tahu orang dewasa.' },
  ];
  T.vicById = Object.fromEntries(T.VICTIMS.map((v) => [v.id, v]));

  T.TOOLS = [
    { id: 'pelampung', e: '🛟', n: 'pelampung', w: 1 },
    { id: 'tali', e: '🪢', n: 'tali', w: 1 },
    { id: 'perban', e: '🩹', n: 'perban', w: 1 },
    { id: 'tongkat', e: '🦯', n: 'tongkat', w: 1 },
    { id: 'selimut', e: '🧣', n: 'selimut', w: 1 },
    { id: 'peluit', e: '📯', n: 'peluit', w: 1 },
    { id: 'kain', e: '💧', n: 'kain basah', w: 1 },
    { id: 'papan', e: '🪵', n: 'papan', w: 2 },
    { id: 'tangga', e: '🪜', n: 'tangga', w: 2 },
  ];
  T.toolById = Object.fromEntries(T.TOOLS.map((t) => [t.id, t]));
  T.BAG_SIZE = 3;

  T.START = { owl: { x: 16.5, y: 24.5, a: -Math.PI / 2 }, bear: { x: 18.5, y: 24.5, a: -Math.PI / 2 } };

  // Dunia baru: tiap hewan diacak ke salah satu titik yang cocok untuk kasusnya.
  const place = (v) => {
    const [x, y] = v.c[Math.floor(Math.random() * v.c.length)];
    return { id: v.id, ox: x + 0.5, oy: y + 0.5, x: x + 0.5, y: y + 0.5, rescued: false };
  };
  T.newWorld = function () {
    return { vics: T.VICTIMS.map(place), stars: [], bag: [], saved: 0 };
  };
  // Simpanan lama (sebelum ada hewan baru): tambahkan hewan yang belum ada, progres lama tetap.
  T.addMissing = function (world) {
    for (const v of T.VICTIMS) if (!world.vics.some((q) => q.id == v.id)) world.vics.push(place(v));
    return world;
  };

  // Bangun ulang peta lalu siapkan tempat tiap hewan (batu di sungai, buka pohon di sekitarnya).
  T.prepareMap = function (world) {
    T.buildMap();
    for (const v of world.vics) {
      const xi = v.ox | 0, yi = v.oy | 0;
      if (T.vicById[v.id].river) { FLOOR[I(xi, yi)] = 6; continue; }
      WALL[I(xi, yi)] = 0;
      for (const [dx, dy] of [[1, 0], [-1, 0], [0, 1], [0, -1]]) {
        const t = I(xi + dx, yi + dy);
        if (WALL[t] == 1 && FLOOR[t] != 3) WALL[t] = 0;
      }
    }
  };

  T.lights = function (world) {
    const L = [{ x: T.SARANG.x, y: T.SARANG.y, r: 5, i: 0.75 }, ...T.BRIDGE_LIGHTS];
    for (const v of world.vics) if (v.rescued) L.push({ x: v.ox, y: v.oy, r: 2.6, i: 0.5 });
    return L;
  };

  // ---------- sprite pixel ----------
  function mk(w, h, draw) {
    const c = document.createElement('canvas'); c.width = w; c.height = h;
    const x = c.getContext('2d');
    draw((a, b, cw, ch, col) => { x.fillStyle = col; x.fillRect(a, b, cw, ch); }, x);
    return { w, h, d: x.getImageData(0, 0, w, h).data, canvas: c };
  }
  T.SPR = {
    kelinci: mk(24, 24, (P) => { P(9, 4, 2, 7, '#eee'); P(13, 4, 2, 7, '#eee'); P(10, 5, 1, 5, '#f2a6b6'); P(8, 10, 8, 6, '#eee'); P(10, 12, 1, 1, '#222'); P(13, 12, 1, 1, '#222'); P(7, 16, 10, 6, '#eee'); P(17, 8, 2, 8, '#eee'); P(4, 21, 16, 3, '#6c6f7d'); }),
    rusa: mk(24, 24, (P) => { P(8, 3, 1, 4, '#8a5a2a'); P(15, 3, 1, 4, '#8a5a2a'); P(7, 3, 2, 1, '#8a5a2a'); P(15, 3, 2, 1, '#8a5a2a'); P(9, 6, 6, 6, '#c4813f'); P(10, 8, 1, 1, '#222'); P(13, 8, 1, 1, '#222'); P(6, 12, 13, 6, '#c4813f'); P(8, 13, 1, 1, '#fff'); P(12, 14, 1, 1, '#fff'); P(15, 13, 1, 1, '#fff'); P(7, 18, 2, 6, '#c4813f'); P(16, 18, 2, 6, '#c4813f'); P(16, 20, 2, 2, '#fff'); }),
    landak: mk(24, 24, (P) => { for (let i = 0; i < 7; i++) P(4 + i * 2, 12 - (i % 2), 1, 4, '#5a4a3a'); P(4, 15, 14, 7, '#7a6450'); P(16, 17, 5, 4, '#d8b48a'); P(19, 18, 1, 1, '#222'); P(0, 10, 24, 3, '#6b4423'); P(2, 9, 3, 2, '#3b7d33'); P(18, 8, 4, 2, '#3b7d33'); }),
    kambing: mk(24, 24, (P) => { P(8, 5, 2, 3, '#bbb'); P(14, 5, 2, 3, '#bbb'); P(9, 7, 6, 6, '#f2f2f2'); P(10, 9, 1, 1, '#222'); P(13, 9, 1, 1, '#222'); P(11, 13, 2, 2, '#ddd'); P(6, 14, 13, 6, '#f2f2f2'); P(7, 20, 2, 4, '#ccc'); P(16, 20, 2, 4, '#ccc'); P(19, 10, 1, 1, '#bfe6ff'); P(21, 13, 1, 1, '#bfe6ff'); }),
    rubah: mk(24, 24, (P) => { P(8, 7, 2, 3, '#e0662a'); P(14, 7, 2, 3, '#e0662a'); P(8, 10, 8, 6, '#e0662a'); P(10, 13, 4, 3, '#fff'); P(10, 11, 1, 1, '#222'); P(13, 11, 1, 1, '#222'); P(6, 16, 12, 6, '#e0662a'); P(18, 15, 4, 3, '#e0662a'); P(21, 14, 2, 2, '#fff'); }),
    asap: mk(24, 24, (P) => { P(2, 2, 8, 5, 'rgba(190,190,200,.55)'); P(12, 0, 10, 6, 'rgba(190,190,200,.45)'); P(6, 6, 12, 5, 'rgba(190,190,200,.4)'); }),
    kerbau: mk(24, 24, (P) => { P(5, 7, 3, 2, '#ddd'); P(16, 7, 3, 2, '#ddd'); P(8, 8, 8, 6, '#5e6670'); P(10, 10, 1, 1, '#111'); P(13, 10, 1, 1, '#111'); P(10, 12, 4, 2, '#7e8690'); P(5, 14, 14, 5, '#5e6670'); P(1, 18, 22, 6, '#5a3e22'); P(3, 17, 4, 1, '#6e5030'); }),
    kucing: mk(16, 16, (P) => { P(4, 3, 2, 2, '#f0a040'); P(9, 3, 2, 2, '#f0a040'); P(4, 4, 7, 5, '#f0a040'); P(5, 6, 1, 1, '#222'); P(9, 6, 1, 1, '#222'); P(4, 9, 7, 4, '#f0a040'); P(11, 8, 1, 5, '#f0a040'); }),
    monyet: mk(24, 24, (P, x) => { x.fillStyle = '#05060c'; x.beginPath(); x.ellipse(12, 19, 11, 4, 0, 0, 7); x.fill(); P(2, 18, 20, 1, '#3a2a1a'); P(8, 10, 8, 7, '#8a5a32'); P(6, 11, 3, 3, '#8a5a32'); P(15, 11, 3, 3, '#8a5a32'); P(9, 12, 6, 4, '#e3b98a'); P(10, 13, 1, 1, '#222'); P(13, 13, 1, 1, '#222'); P(11, 15, 2, 1, '#a0522d'); P(5, 14, 2, 4, '#8a5a32'); P(17, 14, 2, 4, '#8a5a32'); }),
    pipit: mk(16, 16, (P) => { P(5, 8, 7, 5, '#9a7350'); P(3, 6, 4, 4, '#9a7350'); P(4, 7, 1, 1, '#111'); P(2, 8, 1, 1, '#e0a030'); P(7, 11, 5, 1, '#c8a888'); P(11, 9, 3, 2, '#7a5a3a'); P(6, 13, 1, 2, '#e0a030'); P(9, 13, 1, 2, '#e0a030'); }),
    pohonSarang: mk(24, 48, (P) => { P(10, 20, 4, 28, '#5a3a1e'); P(4, 10, 16, 14, '#1f5a2a'); P(6, 4, 12, 8, '#246a30'); P(9, 0, 6, 5, '#2b7a36'); P(14, 21, 7, 3, '#8a6a3a'); P(15, 20, 5, 1, '#a0804a'); }),
    tupai: mk(24, 24, (P) => { P(15, 7, 5, 12, '#b0662a'); P(17, 5, 4, 4, '#b0662a'); P(6, 10, 8, 7, '#c47a36'); P(6, 8, 2, 2, '#c47a36'); P(11, 8, 2, 2, '#c47a36'); P(7, 12, 1, 1, '#222'); P(11, 12, 1, 1, '#222'); P(7, 14, 2, 1, '#ff6a5a'); P(11, 14, 2, 1, '#ff6a5a'); P(5, 17, 10, 6, '#c47a36'); P(7, 18, 6, 4, '#e8c8a0'); P(3, 7, 1, 2, '#9fd8ff'); P(2, 10, 1, 2, '#9fd8ff'); }),
    pohon: mk(24, 48, (P) => { P(10, 20, 4, 28, '#5a3a1e'); P(4, 10, 16, 14, '#1f5a2a'); P(6, 4, 12, 8, '#246a30'); P(9, 0, 6, 5, '#2b7a36'); P(14, 22, 8, 2, '#5a3a1e'); }),
    owl: mk(24, 24, (P) => { P(6, 6, 12, 16, '#7a5536'); P(5, 4, 3, 4, '#7a5536'); P(16, 4, 3, 4, '#7a5536'); P(7, 8, 4, 4, '#f4e6c8'); P(13, 8, 4, 4, '#f4e6c8'); P(11, 11, 2, 2, '#e09a2a'); P(7, 14, 10, 2, '#f07a2a'); P(8, 16, 8, 5, '#c9a27a'); P(4, 13, 3, 8, '#5e4029'); P(17, 13, 3, 8, '#5e4029'); P(8, 22, 2, 2, '#e09a2a'); P(14, 22, 2, 2, '#e09a2a'); }),
    eyes: mk(24, 24, (P) => { P(8, 9, 2, 2, '#ffd84a'); P(14, 9, 2, 2, '#ffd84a'); }),
    bear: mk(24, 28, (P) => { P(4, 2, 4, 4, '#6b4423'); P(16, 2, 4, 4, '#6b4423'); P(6, 1, 12, 3, '#f2c230'); P(5, 4, 14, 9, '#6b4423'); P(9, 8, 6, 4, '#a87a52'); P(11, 8, 2, 1, '#1a1208'); P(8, 6, 1, 1, '#111'); P(15, 6, 1, 1, '#111'); P(3, 13, 18, 10, '#6b4423'); P(7, 14, 10, 8, '#a87a52'); P(3, 16, 18, 2, '#f2c230'); P(1, 14, 3, 8, '#5a381c'); P(20, 14, 3, 8, '#5a381c'); P(5, 23, 6, 5, '#5a381c'); P(13, 23, 6, 5, '#5a381c'); }),
    star: mk(12, 12, (P) => { P(5, 0, 2, 12, '#ffd23f'); P(0, 5, 12, 2, '#ffd23f'); P(3, 3, 6, 6, '#ffd23f'); P(5, 5, 2, 2, '#fff6c8'); }),
    wave: mk(24, 12, (P, x) => { x.strokeStyle = 'rgba(170,215,255,.9)'; x.lineWidth = 1.4; [3, 6, 9].forEach((r) => { x.beginPath(); x.arc(12, 6, r, -0.7, 0.7); x.stroke(); x.beginPath(); x.arc(12, 6, r, Math.PI - 0.7, Math.PI + 0.7); x.stroke(); }); }),
    fly: mk(5, 5, (P) => { P(1, 1, 3, 3, 'rgba(230,255,138,.45)'); P(2, 2, 1, 1, '#f8ffc8'); }),
  };

  // versi "sudah ditolong" (tanpa batu, dahan, lumpur, lubang, gigil, keringat) untuk di Pohon Sarang & adegan akhir
  T.SPR_FREE = {
    kelinci: mk(24, 24, (P) => { P(9, 4, 2, 7, '#eee'); P(13, 4, 2, 7, '#eee'); P(10, 5, 1, 5, '#f2a6b6'); P(8, 10, 8, 6, '#eee'); P(10, 12, 1, 1, '#222'); P(13, 12, 1, 1, '#222'); P(7, 16, 10, 6, '#eee'); P(17, 17, 3, 3, '#fff'); P(8, 22, 3, 2, '#ddd'); P(13, 22, 3, 2, '#ddd'); }),
    landak: mk(24, 24, (P) => { for (let i = 0; i < 7; i++) P(4 + i * 2, 12 - (i % 2), 1, 4, '#5a4a3a'); P(4, 15, 14, 7, '#7a6450'); P(16, 17, 5, 4, '#d8b48a'); P(19, 18, 1, 1, '#222'); P(6, 22, 2, 2, '#5a4a3a'); P(14, 22, 2, 2, '#5a4a3a'); }),
    kambing: mk(24, 24, (P) => { P(8, 5, 2, 3, '#bbb'); P(14, 5, 2, 3, '#bbb'); P(9, 7, 6, 6, '#f2f2f2'); P(10, 9, 1, 1, '#222'); P(13, 9, 1, 1, '#222'); P(11, 13, 2, 2, '#ddd'); P(6, 14, 13, 6, '#f2f2f2'); P(7, 20, 2, 4, '#ccc'); P(16, 20, 2, 4, '#ccc'); }),
    kerbau: mk(24, 24, (P) => { P(5, 7, 3, 2, '#ddd'); P(16, 7, 3, 2, '#ddd'); P(8, 8, 8, 6, '#5e6670'); P(10, 10, 1, 1, '#111'); P(13, 10, 1, 1, '#111'); P(10, 12, 4, 2, '#7e8690'); P(5, 14, 14, 6, '#5e6670'); P(6, 20, 3, 4, '#4e5660'); P(15, 20, 3, 4, '#4e5660'); }),
    monyet: mk(24, 24, (P) => { P(8, 4, 8, 7, '#8a5a32'); P(6, 5, 3, 3, '#8a5a32'); P(15, 5, 3, 3, '#8a5a32'); P(9, 6, 6, 4, '#e3b98a'); P(10, 7, 1, 1, '#222'); P(13, 7, 1, 1, '#222'); P(11, 9, 2, 1, '#a0522d'); P(8, 11, 8, 8, '#8a5a32'); P(10, 12, 4, 6, '#e3b98a'); P(5, 11, 3, 6, '#8a5a32'); P(16, 11, 3, 6, '#8a5a32'); P(8, 19, 3, 4, '#8a5a32'); P(13, 19, 3, 4, '#8a5a32'); P(17, 17, 4, 2, '#8a5a32'); P(20, 14, 2, 4, '#8a5a32'); }),
    tupai: mk(24, 24, (P) => { P(15, 7, 5, 12, '#b0662a'); P(17, 5, 4, 4, '#b0662a'); P(6, 10, 8, 7, '#c47a36'); P(6, 8, 2, 2, '#c47a36'); P(11, 8, 2, 2, '#c47a36'); P(7, 12, 1, 1, '#222'); P(11, 12, 1, 1, '#222'); P(5, 17, 10, 6, '#c47a36'); P(7, 18, 6, 4, '#e8c8a0'); }),
  };

  // ---------- tekstur dinding 16x16 ----------
  function tex(f) {
    const t = new Uint8ClampedArray(16 * 16 * 3);
    for (let y = 0; y < 16; y++) for (let x = 0; x < 16; x++) { const i = (y * 16 + x) * 3; const c = f(x, y); t[i] = c[0]; t[i + 1] = c[1]; t[i + 2] = c[2]; }
    return t;
  }
  const hash = (T.hash = (x, y) => { const v = Math.sin(x * 12.9898 + y * 78.233) * 43758.5453; return v - Math.floor(v); });
  T.TEX = {
    1: tex((x, y) => { if (y > 11) return x > 5 && x < 10 ? [90, 58, 30] : [34, 74, 40]; const n = hash(x, y); return n > 0.7 ? [52, 112, 58] : n > 0.35 ? [38, 92, 48] : [28, 72, 38]; }),
    2: tex((x, y) => { const n = hash(x + 3, y); return n > 0.75 ? [118, 120, 134] : n > 0.3 ? [92, 94, 108] : [70, 72, 84]; }),
    3: tex((x, y) => { const n = hash(x, (y * 0.3) | 0); return x % 4 == 0 ? [60, 38, 20] : n > 0.5 ? [110, 74, 42] : [92, 62, 34]; }),
  };
  T.FLOORC = [[58, 108, 52], [38, 96, 160], [92, 64, 36], [64, 64, 74], [96, 110, 52], [122, 82, 46], [100, 102, 114]];
  T.HEIGHT = { 1: 1.7, 2: 1.3, 3: 3.2 };
  T.MAPC = ['#2c4a2a', '#3f7aa6', '#5a3e22', '#2a2a34', '#4d5a2a', '#8a5a30', '#6c6f7d'];
})();
