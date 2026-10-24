// Duo Penyelamat — data dunia: peta, hewan, alat, sprite & tekstur pixel.
(function () {
  const T = (window.TPM = window.TPM || {});
  T.VERSION = 9;

  // ---------- peta 40x40 ----------
  // WALL: 0 kosong, 1 pohon, 2 batu, 3 Pohon Sarang
  // FLOOR: 0 rumput, 1 air, 2 lumpur, 3 gua, 4 ilalang, 5 jembatan kayu, 6 batu sungai, 7 jembatan putus
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

  // ---------- level ----------
  T.LEVELS = [
    null,
    { n: 1, nama: 'Malam Bulan Purnama', info: '5 hewan · dunia kecil' },
    { n: 2, nama: 'Malam Bulan Separuh', info: '10 hewan · seberangi sungai' },
    { n: 3, nama: 'Malam Gerimis Berkabut', info: '15 hewan · kabut & jembatan putus' },
  ];
  T.BROKEN_ROWS = [19, 33]; // Level 3: jembatan putus, diperbaiki Benhat dengan papan

  // ---------- hewan ----------
  // id = kasus (unik); sp = jenis hewan (sprite). Hewan yang sama boleh muncul lagi di level lain dengan kasus berbeda.
  // Kasus Level 2 memakai id lama (kelinci, rusa, ...) supaya simpanan lama tetap terbaca.
  T.VICTIMS = [
    // Level 1: satu alat, semua di sisi Pohon Sarang (tanpa menyeberang sungai)
    { id: 'kelinci1', sp: 'kelinci', lv: 1, nama: 'Kelinci', need: ['peluit'], reach: 1.7, c: [[8, 21], [12, 24], [6, 17]],
      hint: 'Butuh bunyi keras supaya induknya mendengar.',
      say: 'Kelinci tersesat jauh dari liangnya. Dia tidak tahu jalan pulang.',
      lesson: 'Kalau tersesat: diam di tempat, lalu tiup peluit supaya orang dewasa bisa menemukanmu.' },
    { id: 'kucing1', sp: 'kucing', lv: 1, nama: 'Anak kucing', need: ['perban'], reach: 1.7, c: [[20, 10], [16, 8], [21, 6]],
      hint: 'Lukanya perlu ditutup.',
      say: 'Kaki anak kucing tertusuk duri. Aduh, sakit!',
      lesson: 'Luka kecil: cuci dengan air bersih, tutup dengan perban, lalu beri tahu orang dewasa.' },
    { id: 'landak1', sp: 'landak', lv: 1, nama: 'Landak', need: ['selimut'], reach: 1.7, c: [[10, 9], [5, 5], [12, 4]],
      hint: 'Butuh sesuatu yang menghangatkan badan.',
      say: 'Landak basah kena embun malam. Badannya menggigil.',
      lesson: 'Badan basah dan kedinginan? Keringkan, lalu pakai selimut supaya hangat.' },
    { id: 'rusa1', sp: 'rusa', lv: 1, nama: 'Rusa kecil', need: ['tongkat'], reach: 1.7, c: [[13, 27], [9, 24], [15, 26]],
      hint: 'Butuh benda panjang untuk menyibak semak.',
      say: 'Rusa kecil tersangkut di semak berduri.',
      lesson: 'Jangan pegang duri dengan tangan. Sibak semak pakai tongkat supaya tidak tergores.' },
    { id: 'tupai1', sp: 'tupai', lv: 1, nama: 'Tupai kecil', need: ['papan'], reach: 1.7, c: [[17, 33], [20, 30], [22, 36]],
      hint: 'Butuh sesuatu untuk dijadikan jembatan kecil.',
      say: 'Tupai kecil terjebak di seberang parit. Dia tidak bisa melompat sejauh itu.',
      lesson: 'Jangan melompati parit yang lebar. Cari jembatan atau jalan lain.' },

    // Level 2
    { id: 'kelinci', lv: 2, nama: 'Kelinci', need: ['pelampung', 'tali'], reach: 2.8, river: 1,
      c: [[riverX(6), 6], [riverX(13), 13], [riverX(27), 27]],
      hint: 'Butuh sesuatu yang bisa mengapung dan bisa ditarik.',
      say: 'Kelinci terjebak di batu tengah sungai. Airnya deras!',
      lesson: 'Di dunia nyata: jangan masuk ke air deras. Lempar pelampung atau tali, lalu panggil orang dewasa.' },
    { id: 'rusa', lv: 2, nama: 'Rusa kecil', need: ['perban'], reach: 1.7, c: [[34, 5], [35, 11], [33, 14]],
      hint: 'Kakinya perlu dibalut.',
      say: 'Rusa kecil, kakinya terkilir. Tidak bisa berjalan sendiri.',
      lesson: 'Kaki terkilir jangan dipaksa berjalan. Balut, lalu papah pelan-pelan.' },
    { id: 'landak', lv: 2, nama: 'Landak', need: ['tongkat'], reach: 1.7, c: [[5, 5], [10, 9], [4, 12]],
      hint: 'Butuh benda panjang untuk mengungkit dahan.',
      say: 'Landak tertindih dahan besar. Berat sekali!',
      lesson: 'Benda berat bisa diangkat dengan tongkat pengungkit (tuas).' },
    { id: 'kambing', lv: 2, nama: 'Kambing kecil', need: ['selimut', 'peluit'], reach: 1.7, c: [[16, 35], [21, 32], [22, 37]],
      hint: 'Butuh yang menghangatkan badan, dan bunyi supaya mudah ditemukan.',
      say: 'Kambing kecil tersesat. Badannya menggigil kedinginan.',
      lesson: 'Kalau tersesat: diam di tempat, tiup peluit, dan jaga badan tetap hangat.' },
    { id: 'rubah', lv: 2, nama: 'Rubah', need: ['kain'], reach: 1.7, c: [[34, 29], [36, 34], [33, 36]],
      hint: 'Butuh sesuatu untuk menutup hidung dari asap.',
      say: 'Rubah di dalam gua penuh asap! Uhuk, uhuk.',
      lesson: 'Ada asap? Tutup hidung dengan kain basah dan merangkak rendah.' },
    { id: 'kerbau', lv: 2, nama: 'Anak kerbau', need: ['papan'], reach: 1.9, c: [[5, 30], [9, 34], [4, 36]],
      hint: 'Butuh pijakan lebar supaya tidak ikut tenggelam.',
      say: 'Anak kerbau terperosok ke lumpur. Kakinya tenggelam.',
      lesson: 'Terperosok lumpur? Jangan meronta. Papan membuat badan tidak ikut tenggelam.' },
    { id: 'kucing', lv: 2, nama: 'Anak kucing', need: ['tangga'], reach: 1.7, pose: 'tree', c: [[9, 21], [22, 13], [11, 17]],
      hint: 'Butuh sesuatu untuk naik ke tempat tinggi.',
      say: 'Anak kucing di atas pohon tinggi. Tidak bisa turun!',
      lesson: 'Naik ke tempat tinggi pakai tangga, dan selalu bersama orang dewasa.' },
    { id: 'monyet', lv: 2, nama: 'Anak monyet', need: ['tali'], reach: 1.7, c: [[37, 7], [32, 10], [36, 14]],
      hint: 'Butuh sesuatu yang bisa diulurkan lalu ditarik ke atas.',
      say: 'Anak monyet terperosok ke lubang yang dalam. Tidak bisa naik!',
      lesson: 'Ada yang jatuh ke lubang? Jangan ikut masuk. Ulurkan tali dari atas, lalu panggil orang dewasa.' },
    { id: 'pipit', lv: 2, nama: 'Anak burung pipit', need: ['tangga'], reach: 1.7, pose: 'nest', c: [[8, 4], [12, 12], [3, 8]],
      hint: 'Butuh sesuatu untuk naik dan mengembalikannya ke sarang.',
      say: 'Anak burung jatuh dari sarangnya di atas pohon.',
      lesson: 'Anak burung jatuh? Jangan dibawa pulang. Minta orang dewasa mengembalikannya ke sarang.' },
    { id: 'tupai', lv: 2, nama: 'Tupai kecil', need: ['kain'], reach: 1.7, c: [[15, 31], [19, 37], [23, 34]],
      hint: 'Butuh sesuatu yang dingin untuk mengompres.',
      say: 'Tupai kecil badannya panas sekali. Dia demam.',
      lesson: 'Kalau badan panas: kompres dengan kain basah, istirahat, dan beri tahu orang dewasa.' },

    // Level 3: kasus baru untuk hewan lama + 5 hewan baru. need [] = cukup tenaga Benhat.
    { id: 'kelinci3', sp: 'kelinci', lv: 3, nama: 'Kelinci', need: [], reach: 1.8, c: [[34, 8], [36, 12], [33, 3]],
      hint: 'Tidak butuh alat. Butuh badan yang kuat untuk menggeser batu.',
      say: 'Liang kelinci tertutup batu besar. Kelinci tidak bisa keluar!',
      lesson: 'Untuk benda yang sangat berat, minta tolong orang dewasa yang kuat. Jangan mengangkat sendiri.' },
    { id: 'rusa3', sp: 'rusa', lv: 3, nama: 'Rusa kecil', need: ['peluit'], reach: 1.7, c: [[6, 6], [11, 11], [3, 13]],
      hint: 'Butuh bunyi supaya induknya tahu dia di sini.',
      say: 'Rusa kecil terpisah dari induknya. Kabutnya tebal sekali.',
      lesson: 'Saat berkabut, tetap dekat dengan keluarga. Kalau terpisah, diam dan bunyikan peluit.' },
    { id: 'landak3', sp: 'landak', lv: 3, nama: 'Landak', need: ['gunting'], reach: 1.7, c: [[20, 6], [17, 10], [22, 24]],
      hint: 'Butuh sesuatu untuk memotong benang.',
      say: 'Landak terlilit benang layangan. Tidak bisa bergerak!',
      lesson: 'Benang layangan bisa melukai hewan. Buang ke tempat sampah. Gunting dipakai bersama orang dewasa.' },
    { id: 'kambing3', sp: 'kambing', lv: 3, nama: 'Kambing kecil', need: ['tangga'], reach: 1.7, c: [[34, 29], [36, 34], [33, 36]],
      hint: 'Butuh sesuatu untuk turun dari tempat tinggi.',
      say: 'Kambing kecil terjebak di atas batu tinggi. Tidak bisa turun.',
      lesson: 'Jangan memanjat tebing. Kalau sudah terlanjur di atas, tunggu bantuan orang dewasa.' },
    { id: 'rubah3', sp: 'rubah', lv: 3, nama: 'Rubah', need: ['perban', 'tongkat'], reach: 1.7, c: [[16, 35], [21, 32], [22, 37]],
      hint: 'Kakinya perlu dibalut, dan butuh penopang untuk berjalan.',
      say: 'Kaki rubah terkilir. Dia tidak kuat berjalan.',
      lesson: 'Kaki terkilir: balut, lalu berjalan pelan dengan penopang. Jangan berlari dulu.' },
    { id: 'kerbau3', sp: 'kerbau', lv: 3, nama: 'Anak kerbau', need: ['kain'], reach: 1.9, c: [[5, 30], [9, 34], [4, 36]],
      hint: 'Butuh sesuatu yang basah dan bersih untuk membersihkan.',
      say: 'Mata anak kerbau kemasukan lumpur. Perih sekali!',
      lesson: 'Mata kemasukan kotoran: jangan dikucek! Bersihkan pelan dengan air bersih.' },
    { id: 'kucing3', sp: 'kucing', lv: 3, nama: 'Anak kucing', need: ['papan'], reach: 1.7, c: [[9, 21], [11, 17], [22, 13]],
      hint: 'Butuh sesuatu untuk dijadikan jembatan kecil.',
      say: 'Anak kucing terjebak di seberang selokan.',
      lesson: 'Selokan bisa dalam dan licin. Jangan bermain di dekat selokan.' },
    { id: 'monyet3', sp: 'monyet', lv: 3, nama: 'Anak monyet', need: ['perban'], reach: 1.7, c: [[37, 7], [32, 10], [36, 14]],
      hint: 'Lukanya perlu ditutup.',
      say: 'Tangan anak monyet tergores ranting tajam.',
      lesson: 'Tergores ranting? Bersihkan lukanya, tutup dengan perban, dan beri tahu orang dewasa.' },
    { id: 'pipit3', sp: 'pipit', lv: 3, nama: 'Anak burung pipit', need: ['selimut'], reach: 1.7, c: [[8, 4], [12, 12], [3, 8]],
      hint: 'Butuh sesuatu yang menghangatkan.',
      say: 'Anak burung pipit basah kuyup kena gerimis. Kedinginan!',
      lesson: 'Saat hujan, berteduh. Kalau basah, cepat keringkan badan dan pakai baju hangat.' },
    { id: 'tupai3', sp: 'tupai', lv: 3, nama: 'Tupai kecil', need: ['pelampung', 'tali'], reach: 2.8, river: 1,
      c: [[riverX(6), 6], [riverX(13), 13], [riverX(27), 27]],
      hint: 'Butuh sesuatu yang bisa mengapung dan bisa ditarik.',
      say: 'Tupai kecil jatuh ke sungai dan berpegangan di batu.',
      lesson: 'Ada yang jatuh ke air? Jangan ikut melompat. Lempar pelampung dengan tali, lalu panggil orang dewasa.' },
    { id: 'bebek', lv: 3, nama: 'Anak bebek', need: ['gunting'], reach: 1.7, c: [[riverX(23) - 2, 23], [riverX(36) - 2, 36], [riverX(3) - 2, 3]],
      hint: 'Butuh sesuatu untuk memotong jaring.',
      say: 'Anak bebek terjerat jaring ikan di tepi sungai.',
      lesson: 'Jaring dan tali bekas bisa menjerat hewan. Jangan dibuang sembarangan.' },
    { id: 'penyu', lv: 3, nama: 'Anak penyu', need: [], reach: 1.7, c: [[riverX(16) + 2, 16], [riverX(29) + 2, 29], [riverX(11) + 2, 11]],
      hint: 'Tidak butuh alat. Balikkan pelan-pelan dengan tangan yang kuat.',
      say: 'Anak penyu terbalik. Dia tidak bisa membalikkan badannya.',
      lesson: 'Menolong hewan harus pelan dan lembut. Setelah itu biarkan dia kembali ke alamnya.' },
    { id: 'hantu', lv: 3, nama: 'Burung hantu kecil', need: ['perban', 'keranjang'], reach: 1.7, c: [[14, 6], [19, 4], [3, 20]],
      hint: 'Sayapnya perlu dibalut, lalu dibawa pulang dengan wadah yang aman.',
      say: 'Burung hantu kecil, sayapnya luka. Dia tidak bisa terbang.',
      lesson: 'Hewan yang terluka dibawa ke dokter hewan dalam wadah yang aman, bersama orang dewasa.' },
    { id: 'ayam', lv: 3, nama: 'Anak ayam hutan', need: ['keranjang'], reach: 1.8, run: 1, c: [[34, 20], [31, 22], [36, 18]],
      hint: 'Setelah berhenti, butuh wadah untuk membawanya pulang.',
      say: 'Anak ayam hutan berlari ketakutan! Tandai dengan ⭐ supaya dia berhenti.',
      lesson: 'Hewan yang ketakutan jangan dikejar sambil berteriak. Dekati pelan-pelan dan tenang.' },
    { id: 'kancil', lv: 3, nama: 'Anak kancil', need: ['tongkat'], reach: 1.7, c: [[3, 24], [13, 20], [7, 15]],
      hint: 'Butuh benda panjang untuk mengungkit batu.',
      say: 'Kaki anak kancil terjepit di antara dua batu.',
      lesson: 'Batu berat bisa digeser dengan tongkat pengungkit (tuas). Minta bantuan orang dewasa.' },
  ];
  for (const v of T.VICTIMS) v.sp = v.sp || v.id;
  T.vicById = Object.fromEntries(T.VICTIMS.map((v) => [v.id, v]));
  T.levelVics = (lv) => T.VICTIMS.filter((v) => v.lv == lv);
  // tinggi sprite hewan (dalam satuan dinding)
  T.SIZE = { kerbau: 0.6, kucing: 0.34, pipit: 0.3, ayam: 0.3, hantu: 0.42, penyu: 0.42 };

  T.TOOLS = [
    { id: 'pelampung', e: '🛟', n: 'pelampung', w: 1 },
    { id: 'tali', e: '🪢', n: 'tali', w: 1 },
    { id: 'perban', e: '🩹', n: 'perban', w: 1 },
    { id: 'tongkat', e: '🦯', n: 'tongkat', w: 1 },
    { id: 'selimut', e: '🧣', n: 'selimut', w: 1 },
    { id: 'peluit', e: '📯', n: 'peluit', w: 1 },
    { id: 'kain', e: '💧', n: 'kain basah', w: 1 },
    { id: 'gunting', e: '✂️', n: 'gunting tumpul', w: 1, lv: 3 },
    { id: 'keranjang', e: '🧺', n: 'keranjang', w: 1, lv: 3 },
    { id: 'papan', e: '🪵', n: 'papan', w: 2 },
    { id: 'tangga', e: '🪜', n: 'tangga', w: 2 },
  ];
  T.toolById = Object.fromEntries(T.TOOLS.map((t) => [t.id, t]));
  T.levelTools = (lv) => T.TOOLS.filter((t) => !t.lv || t.lv <= lv);
  T.BAG_SIZE = 3;

  T.START = { owl: { x: 16.5, y: 24.5, a: -Math.PI / 2 }, bear: { x: 18.5, y: 24.5, a: -Math.PI / 2 } };

  // Dunia baru: tiap hewan diacak ke salah satu titik yang cocok untuk kasusnya.
  const place = (v) => {
    const [x, y] = v.c[Math.floor(Math.random() * v.c.length)];
    return { id: v.id, ox: x + 0.5, oy: y + 0.5, x: x + 0.5, y: y + 0.5, rescued: false };
  };
  T.newWorld = function (lv) {
    return { level: lv, vics: T.levelVics(lv).map(place), stars: [], bag: [], saved: 0, fixed: [] };
  };
  // Simpanan lama: lengkapi data level & hewan yang belum ada, progres lama tetap.
  T.addMissing = function (world) {
    world.level = world.level || 2;
    world.fixed = world.fixed || [];
    for (const v of T.levelVics(world.level)) if (!world.vics.some((q) => q.id == v.id)) world.vics.push(place(v));
    return world;
  };

  // Anak ayam hutan berlari membentuk angka 8 sampai ditandai Tutu (jam dinding, supaya sama di kedua iPad).
  T.runPos = function (v) {
    const a = (Date.now() / 1000) * 0.9;
    return { x: v.ox + Math.cos(a) * 1.4, y: v.oy + Math.sin(a * 2) * 0.8 };
  };
  T.running = (v) => T.vicById[v.id].run && !v.calm && !v.rescued;

  // Jembatan: Level 1 tanpa jembatan (dunia kecil), Level 3 jembatan putus sampai diperbaiki.
  T.syncBridges = function (world) {
    for (const by of T.BRIDGE_ROWS) {
      const c = riverX(by);
      for (let x = c - 2; x <= c + 2; x++) {
        const mid = x >= c - 1 && x <= c + 1;
        let f = 5;
        if (world.level == 1) f = mid ? 1 : 0;
        else if (world.level == 3 && T.BROKEN_ROWS.includes(by) && !world.fixed.includes(by) && mid) f = 7;
        FLOOR[I(x, by)] = f;
      }
    }
  };
  T.brokenNear = function (world, x, y, r) {
    if (world.level != 3) return null;
    for (const by of T.BROKEN_ROWS) {
      if (world.fixed.includes(by)) continue;
      const c = riverX(by);
      for (const ex of [c - 2, c + 2]) if (Math.hypot(ex + 0.5 - x, by + 0.5 - y) < r) return by;
    }
    return null;
  };

  // Bangun ulang peta lalu siapkan tempat tiap hewan (batu di sungai, buka pohon di sekitarnya).
  T.prepareMap = function (world) {
    T.buildMap();
    T.syncBridges(world);
    for (const v of world.vics) {
      const xi = v.ox | 0, yi = v.oy | 0, m = T.vicById[v.id];
      if (m.river) { FLOOR[I(xi, yi)] = 6; continue; }
      WALL[I(xi, yi)] = 0;
      const R = m.run ? 2 : 1; // anak ayam butuh lapangan untuk berlari
      for (let dy = -R; dy <= R; dy++) for (let dx = -R; dx <= R; dx++) {
        if (Math.abs(dx) + Math.abs(dy) > R + (R > 1)) continue;
        const t = I(xi + dx, yi + dy);
        if (WALL[t] == 1 && FLOOR[t] != 3) WALL[t] = 0;
      }
    }
  };

  T.lights = function (world) {
    const L = [{ x: T.SARANG.x, y: T.SARANG.y, r: 5, i: 0.75 }];
    if (world.level != 1) L.push(...T.BRIDGE_LIGHTS);
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

  // hewan baru Level 3
  Object.assign(T.SPR, {
    bebek: mk(24, 24, (P) => { P(6, 13, 12, 7, '#f4d23a'); P(13, 7, 6, 6, '#f4d23a'); P(16, 9, 1, 1, '#222'); P(19, 10, 3, 2, '#f08a24'); P(8, 14, 6, 3, '#e0b82a'); P(9, 20, 2, 2, '#f08a24'); P(14, 20, 2, 2, '#f08a24');
      for (let i = 0; i < 6; i++) P(3 + i * 4, 5, 1, 18, 'rgba(235,235,245,.85)'); for (let j = 0; j < 5; j++) P(2, 6 + j * 4, 21, 1, 'rgba(235,235,245,.85)'); }),
    penyu: mk(24, 24, (P) => { P(4, 19, 16, 3, '#4a7a3a'); P(5, 14, 14, 6, '#e8d48a'); P(5, 16, 14, 1, '#c8b46a'); P(11, 14, 1, 6, '#c8b46a'); P(5, 11, 2, 3, '#7aa65a'); P(17, 11, 2, 3, '#7aa65a'); P(8, 12, 2, 2, '#7aa65a'); P(14, 12, 2, 2, '#7aa65a'); P(19, 16, 3, 3, '#7aa65a'); P(21, 17, 1, 1, '#222'); }),
    hantu: mk(24, 24, (P) => { P(8, 8, 9, 12, '#cdbfae'); P(8, 6, 2, 2, '#cdbfae'); P(15, 6, 2, 2, '#cdbfae'); P(9, 10, 7, 4, '#efe6d6'); P(10, 11, 2, 2, '#2a2a2a'); P(13, 11, 2, 2, '#2a2a2a'); P(10, 11, 2, 1, '#cdbfae'); P(13, 11, 2, 1, '#cdbfae'); P(12, 13, 1, 2, '#e09a2a'); P(6, 12, 2, 7, '#9a8a78'); P(17, 16, 4, 3, '#9a8a78'); P(18, 16, 2, 1, '#d04a3a'); P(10, 20, 2, 2, '#e09a2a'); P(13, 20, 2, 2, '#e09a2a'); }),
    ayam: mk(16, 16, (P) => { P(4, 7, 8, 6, '#e8a040'); P(9, 4, 5, 5, '#e8a040'); P(12, 5, 1, 1, '#222'); P(14, 6, 2, 1, '#f07a24'); P(5, 8, 4, 3, '#c27a28'); P(2, 7, 2, 2, '#c27a28'); P(5, 13, 1, 3, '#f07a24'); P(9, 13, 1, 2, '#f07a24'); }),
    kancil: mk(24, 24, (P) => { P(6, 12, 12, 6, '#a8703a'); P(8, 16, 8, 1, '#e8c8a0'); P(15, 7, 4, 6, '#a8703a'); P(17, 6, 4, 4, '#a8703a'); P(17, 4, 2, 2, '#8a5a2a'); P(19, 7, 1, 1, '#222'); P(21, 8, 1, 1, '#222'); P(7, 18, 2, 6, '#8a5a2a'); P(15, 18, 2, 6, '#8a5a2a'); P(2, 17, 8, 7, '#6c6f7d'); P(13, 18, 9, 6, '#7a7d8a'); P(3, 17, 3, 1, '#8a8d9a'); P(15, 18, 4, 1, '#9a9daa'); }),
  });
  // gambar dasar + tambahan (untuk kasus berbeda dari hewan yang sama)
  const ov = (base, w, h, draw, dx, dy) => mk(w, h, (P, x) => { x.drawImage(base.canvas, dx || 0, dy || 0); draw(P, x); });
  const drops = (P, pts) => { for (const [a, b] of pts) P(a, b, 1, 2, '#9fd8ff'); };
  const F = () => T.SPR_FREE;
  T.makeCaseSprites = function () {
    Object.assign(T.SPR, {
      kelinci1: ov(F().kelinci, 24, 24, (P) => { P(19, 2, 3, 1, '#bfe0ff'); P(21, 3, 1, 2, '#bfe0ff'); P(20, 5, 1, 1, '#bfe0ff'); P(20, 7, 1, 1, '#bfe0ff'); }),
      kucing1: ov(T.SPR.kucing, 16, 16, (P) => { P(4, 13, 2, 2, '#f0a040'); P(4, 14, 1, 1, '#e03a3a'); P(9, 13, 2, 2, '#f0a040'); }),
      landak1: ov(F().landak, 24, 24, (P) => drops(P, [[3, 9], [21, 11], [12, 6], [1, 14]])),
      rusa1: ov(T.SPR.rusa, 24, 24, (P) => { P(0, 15, 24, 9, '#2f6a2a'); P(2, 13, 6, 3, '#2f6a2a'); P(15, 13, 7, 3, '#2f6a2a'); for (const [a, b] of [[3, 16], [8, 19], [13, 15], [18, 18], [21, 21], [5, 22]]) P(a, b, 1, 1, '#d84a3a'); }),
      tupai1: ov(F().tupai, 24, 24, (P) => { P(0, 22, 24, 2, '#2a5a8a'); P(0, 21, 24, 1, '#5a3a1e'); }, 0, -2),
      kelinci3: ov(F().kelinci, 24, 24, (P, x) => { x.fillStyle = '#7a7d8a'; x.beginPath(); x.ellipse(15, 16, 10, 8, 0, 0, 7); x.fill(); P(10, 10, 6, 2, '#9a9daa'); P(0, 22, 24, 2, '#3a2a1a'); }, -4, 0),
      landak3: ov(F().landak, 24, 24, (P) => { for (let i = 0; i < 16; i++) { P(3 + i, 10 + (i % 3), 1, 1, '#f4f4f4'); P(4 + i, 19 - (i % 4), 1, 1, '#f4f4f4'); } P(19, 8, 1, 3, '#f4f4f4'); }),
      kambing3: ov(T.SPR.kambing, 24, 24, (P) => { P(1, 15, 22, 9, '#6c6f7d'); P(3, 15, 18, 1, '#8a8d9a'); P(6, 19, 4, 1, '#5a5d6a'); P(14, 21, 5, 1, '#5a5d6a'); }, 0, -8),
      kerbau3: ov(F().kerbau, 24, 24, (P) => { P(9, 9, 3, 3, '#5a3e22'); P(12, 9, 3, 3, '#5a3e22'); P(7, 15, 3, 2, '#5a3e22'); }),
      kucing3: ov(T.SPR.kucing, 16, 16, (P) => { P(0, 14, 16, 2, '#2a5a8a'); P(0, 13, 16, 1, '#5a5d6a'); }, 0, -2),
      monyet3: ov(F().monyet, 24, 24, (P) => { P(5, 13, 1, 1, '#e03a3a'); P(6, 14, 1, 1, '#e03a3a'); P(5, 15, 1, 1, '#e03a3a'); }),
      pipit3: ov(T.SPR.pipit, 16, 16, (P) => drops(P, [[2, 3], [13, 5], [8, 4], [14, 10]])),
      tupai3: ov(F().tupai, 24, 24, (P) => { P(0, 20, 24, 4, '#2a6aa6'); P(3, 20, 4, 1, '#9fd8ff'); P(15, 21, 5, 1, '#9fd8ff'); }),
    });
    Object.assign(T.SPR_FREE, {
      bebek: mk(24, 24, (P) => { P(6, 13, 12, 7, '#f4d23a'); P(13, 7, 6, 6, '#f4d23a'); P(16, 9, 1, 1, '#222'); P(19, 10, 3, 2, '#f08a24'); P(8, 14, 6, 3, '#e0b82a'); P(9, 20, 2, 2, '#f08a24'); P(14, 20, 2, 2, '#f08a24'); }),
      penyu: mk(24, 24, (P) => { P(5, 12, 14, 6, '#4a7a3a'); P(8, 13, 3, 2, '#5e9a4a'); P(13, 13, 3, 2, '#5e9a4a'); P(4, 17, 16, 2, '#3a6a2a'); P(18, 14, 4, 3, '#7aa65a'); P(20, 15, 1, 1, '#222'); P(5, 19, 3, 2, '#7aa65a'); P(15, 19, 3, 2, '#7aa65a'); }),
      hantu: mk(24, 24, (P) => { P(8, 8, 9, 12, '#cdbfae'); P(8, 6, 2, 2, '#cdbfae'); P(15, 6, 2, 2, '#cdbfae'); P(9, 10, 7, 4, '#efe6d6'); P(10, 11, 2, 2, '#2a2a2a'); P(13, 11, 2, 2, '#2a2a2a'); P(12, 13, 1, 2, '#e09a2a'); P(6, 12, 2, 7, '#9a8a78'); P(17, 12, 2, 7, '#9a8a78'); P(10, 20, 2, 2, '#e09a2a'); P(13, 20, 2, 2, '#e09a2a'); }),
      kancil: mk(24, 24, (P) => { P(6, 12, 12, 6, '#a8703a'); P(8, 16, 8, 1, '#e8c8a0'); P(15, 7, 4, 6, '#a8703a'); P(17, 6, 4, 4, '#a8703a'); P(17, 4, 2, 2, '#8a5a2a'); P(19, 7, 1, 1, '#222'); P(21, 8, 1, 1, '#222'); P(7, 18, 2, 6, '#8a5a2a'); P(15, 18, 2, 6, '#8a5a2a'); P(5, 12, 2, 2, '#e8c8a0'); }),
    });
  };

  T.makeCaseSprites();

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
  T.FLOORC = [[58, 108, 52], [38, 96, 160], [92, 64, 36], [64, 64, 74], [96, 110, 52], [122, 82, 46], [100, 102, 114], [38, 96, 160]];
  T.HEIGHT = { 1: 1.7, 2: 1.3, 3: 3.2 };
  T.MAPC = ['#2c4a2a', '#3f7aa6', '#5a3e22', '#2a2a34', '#4d5a2a', '#8a5a30', '#6c6f7d', '#c04a3a'];
})();
