// Wilayah 2: Kampung Hijau, "Perjalanan Menuju Porseni" (murajaah Juz Amma).
// Aksa & Ara menjemput teman-teman TPA yang kesulitan, murajaah bersama, lalu
// semuanya tampil di panggung Porseni.
(function () {
  const G = (window.G = window.G || {});

  G.CHARS = Object.assign(G.CHARS || {}, {
    dika: { name: 'Dika', color: '#3fa34d' },
    salma: { name: 'Salma', color: '#ff8ad8' },
    umar: { name: 'Umar', color: '#5a5a5a' },
    aisyah: { name: 'Aisyah', color: '#2f7fd1' },
    hasan: { name: 'Ustadz Hasan', color: '#2f9e8f' },
    nenek: { name: 'Nenek', color: '#a0652d' },
  });

  // Teman TPA: surat yang di-murajaah-kan bersama (nomor surat).
  const FRIENDS = [
    {
      id: 'dika', surahs: [114, 113, 112, 111, 110],
      ask: [
        { who: 'dika', text: 'Aduh, ban sepedaku kempes! Nanti aku terlambat ke Porseni...' },
        { who: 'aksa', text: 'Ikut rombongan kami saja, Dika! Kita jalan bersama.' },
        { who: 'ara', text: 'Sambil jalan, kita murajaah bareng ya!' },
      ],
      thanks: [{ who: 'dika', text: 'Asyik, hafalanku lancar lagi! Aku ikut ya!' }],
    },
    {
      id: 'salma', surahs: [109, 108, 107, 106, 105],
      ask: [
        { who: 'salma', text: 'Hujan deras dan payungku rusak... aku tidak bisa berangkat.' },
        { who: 'aksa', text: 'Berteduh di dekat Ara saja, Salma! Kita berangkat bersama.' },
        { who: 'ara', text: 'Sambil menunggu hujan reda, kita murajaah yuk!' },
      ],
      thanks: [{ who: 'salma', text: 'Hujannya reda! Terima kasih, aku ikut kalian!' }],
    },
    {
      id: 'umar', surahs: [104, 103, 102, 101, 100],
      ask: [
        { who: 'umar', text: 'Jembatannya goyang... aku takut menyeberang sendirian.' },
        { who: 'aksa', text: 'Kita seberangi bersama-sama, Umar. Pegang tanganku!' },
        { who: 'ara', text: 'Supaya berani, kita murajaah sambil menyeberang!' },
      ],
      thanks: [{ who: 'umar', text: 'Aku berhasil menyeberang! Ternyata tidak seram kalau bersama.' }],
    },
    {
      id: 'aisyah', surahs: [99, 98, 97, 95, 94],
      ask: [
        { who: 'aisyah', text: 'Aku masih membantu Nenek menjemur padi.' },
        { who: 'nenek', text: 'Nenek tidak apa-apa, tapi padinya banyak sekali, Nak.' },
        { who: 'aksa', text: 'Kita bantu Nenek dulu, lalu berangkat bersama!' },
        { who: 'ara', text: 'Sambil bekerja, ayo ulang hafalan!' },
      ],
      thanks: [
        { who: 'nenek', text: 'Alhamdulillah, padinya sudah terjemur. Terima kasih, anak-anak!' },
        { who: 'aisyah', text: 'Ayo kita berangkat ke Porseni!' },
      ],
    },
  ];
  G.FRIENDS = FRIENDS;
  const NAME = { dika: 'Dika', salma: 'Salma', umar: 'Umar', aisyah: 'Aisyah' };

  const K = () => (G.save.kampung = G.save.kampung || { order: [], stars: {}, done: false, intro: false });
  const joined = (id) => K().order.includes(id);
  const allJoined = () => FRIENDS.every((f) => joined(f.id));

  // ---------- Peta ----------
  const NPCS = {
    dika: { x: 9, y: 13 },
    salma: { x: 12, y: 8 },
    umar: { x: 16, y: 10 },
    aisyah: { x: 22, y: 8 },
    nenek: { x: 23, y: 8 },
    hasan: { x: 26, y: 9 },
  };
  const BIKE = [10, 13];
  const SIGN = [3, 10];
  const TREES = [[6, 8], [13, 2], [14, 15], [12, 18], [15, 19], [19, 2], [23, 13], [29, 18], [25, 19], [9, 19], [4, 7], [28, 14], [11, 15], [20, 12]];
  const isNpcHere = (id) => !FRIENDS.some((f) => f.id === id) || !joined(id);

  G.MAPS.kampung = {
    w: 32, h: 22,
    posKey: 'posKampung',
    start: { aksa: [2, 11] },
    BUILD: [
      { id: 'houseDika', x: 2, y: 3, w: 4, h: 3 },
      { id: 'pasar', x: 7, y: 4, w: 6, h: 3 },
      { id: 'houseNenek', x: 19, y: 5, w: 4, h: 3 },
      { id: 'panggung', x: 24, y: 3, w: 7, h: 5 },
      { id: 'mushola', x: 20, y: 15, w: 5, h: 3 },
    ],
    signs: [SIGN],
    buildGround() {
      const g = [];
      for (let y = 0; y < 22; y++) {
        g[y] = [];
        for (let x = 0; x < 32; x++) g[y][x] = x === 0 || y === 0 || x === 31 || y === 21 ? 'T' : '.';
      }
      for (let x = 1; x <= 27; x++) g[11][x] = '=';
      for (let y = 1; y <= 20; y++) g[y][17] = 'w';
      g[11][17] = 'b';
      for (let y = 7; y <= 10; y++) g[y][10] = '=';
      for (let y = 8; y <= 10; y++) g[y][21] = '=';
      for (let y = 8; y <= 10; y++) g[y][27] = '=';
      for (let y = 13; y <= 18; y++) for (let x = 2; x <= 8; x++) g[y][x] = 's';
      for (let x = 2; x <= 6; x++) g[9][x] = '#';
      TREES.forEach(([x, y]) => (g[y][x] = 'T'));
      return g;
    },
    solid(x, y) {
      if ((BIKE[0] === x && BIKE[1] === y && !joined('dika')) || (SIGN[0] === x && SIGN[1] === y)) return true;
      return Object.entries(NPCS).some(([id, n]) => n.x === x && n.y === y && isNpcHere(id));
    },
    thing(x, y) {
      for (const [id, n] of Object.entries(NPCS)) if (n.x === x && n.y === y && isNpcHere(id)) return id === 'nenek' ? (joined('aisyah') ? 'nenek' : 'aisyah') : id;
      if (BIKE[0] === x && BIKE[1] === y && !joined('dika')) return 'dika';
      if (SIGN[0] === x && SIGN[1] === y) return 'papanK';
      const b = this.BUILD.find((bb) => x >= bb.x && x < bb.x + bb.w && y >= bb.y && y < bb.y + bb.h);
      if (b && b.id === 'panggung') return 'hasan';
      return null;
    },
    // Bangunan khas kampung (true = sudah digambar di sini)
    drawBuilding(c, b, o) {
      const { px, x, y, w, h } = o;
      if (b.id === 'panggung') {
        // tenda panggung Porseni bergaris
        px(x - 2, y + 4, w + 4, h - 4, '#2b1d1a');
        for (let i = 0; i < w; i += 8) { px(x + i, y + 5, 4, h - 14, '#d63c2f'); px(x + i + 4, y + 5, 4, h - 14, '#ffffff'); }
        for (let i = 0; i < w + 4; i += 6) px(x - 2 + i, y, 4, 6, i % 12 ? '#f4c430' : '#d63c2f');
        px(x, y + h - 10, w, 10, '#c98a45');
        px(x, y + h - 10, w, 2, '#8a5a2b');
        px(x + w / 2 - 20, y + 9, 40, 10, '#2b1d1a');
        px(x + w / 2 - 19, y + 10, 38, 8, '#f4c430');
        for (let i = 0; i < 5; i++) px(x + w / 2 - 15 + i * 7, y + 12, 4, 4, ['#d63c2f', '#3b7dd8', '#3fa34d', '#8a4fd8', '#e8451c'][i]);
        return true;
      }
      if (b.id === 'pasar') {
        // deretan kios beratap
        for (let i = 0; i < 3; i++) {
          const kx = x + i * 32;
          px(kx, y + 10, 30, h - 10, '#2b1d1a');
          px(kx + 1, y + 11, 28, h - 12, '#f7e2c0');
          px(kx - 1, y + 2, 32, 10, '#2b1d1a');
          for (let s = 0; s < 30; s += 6) px(kx + s, y + 3, 3, 8, i % 2 ? '#3fa34d' : '#f4a020'), px(kx + s + 3, y + 3, 3, 8, '#ffffff');
          ['#e8451c', '#f4c430', '#3fa34d', '#ff8ad8'].forEach((col, j) => px(kx + 4 + j * 6, y + h - 12, 4, 4, col));
        }
        return true;
      }
      if (b.id === 'mushola') {
        const { look } = o;
        px(x - 2, y + 6, w + 4, 16, '#2b1d1a');
        px(x - 1, y + 7, w + 2, 14, look.roof);
        // kubah kecil
        for (let r = 0; r < 8; r++) px(x + w / 2 - 8 + r, y - 2 + (8 - r) / 2, 16 - r * 2, 2, r === 0 ? '#2b1d1a' : '#f4c430');
        px(x + w / 2 - 1, y - 8, 2, 6, '#2b1d1a');
        px(x, y + 22, w, h - 22, '#2b1d1a');
        px(x + 1, y + 22, w - 2, h - 23, look.wall);
        px(x + w / 2 - 6, y + h - 14, 12, 13, '#2b1d1a');
        px(x + w / 2 - 5, y + h - 13, 10, 12, '#2f9e8f');
        return true;
      }
      return false;
    },
    draw(ctx, t, dt, items) {
      const H = G.world.helpers();
      const { px, put, shadow, bubble, T } = H;
      // sepeda Dika (ban kempes)
      if (!joined('dika')) {
        items.push({ y: BIKE[1] * T + 14, f: () => {
          const x = BIKE[0] * T + 1, by = BIKE[1] * T + 14;
          const k = '#2b1d1a';
          for (const wx of [x + 3, x + 12]) { H.disc(ctx, wx, by - 4, 4, k); H.disc(ctx, wx, by - 4, 2, '#cfe6f5'); }
          px(ctx, x + 8, by - 2, 8, 2, k);
          px(ctx, x + 2, by - 8, 11, 2, '#e8241c');
          px(ctx, x + 6, by - 11, 2, 4, '#e8241c');
          px(ctx, x + 4, by - 12, 5, 2, k);
          px(ctx, x + 12, by - 11, 2, 4, '#e8241c');
        } });
      }
      // hujan di pasar selama Salma belum dijemput
      if (!joined('salma')) {
        const cx = NPCS.salma.x * T + 8, cy = NPCS.salma.y * T;
        for (let i = 0; i < 2; i++) G.fx.add({ x: cx - 30 + Math.random() * 60, y: cy - 40, vx: -8, vy: 140, g: 0, life: 0.35, color: '#9fdcff', size: 1 });
        items.push({ y: cy - 60, f: () => {
          for (const [ox, r] of [[-14, 8], [0, 10], [14, 8]]) H.disc(ctx, cx + ox, cy - 44, r, '#9aa3ad');
          px(ctx, cx - 22, cy - 44, 44, 6, '#9aa3ad');
        } });
      }
      // padi dijemur di depan rumah Nenek
      items.push({ y: 9 * T + 2, f: () => {
        px(ctx, 19 * T + 2, 9 * T + 2, 28, 12, '#2b1d1a');
        px(ctx, 19 * T + 3, 9 * T + 3, 26, 10, joined('aisyah') ? '#e0b860' : '#c9a040');
        for (let i = 0; i < 12; i++) px(ctx, 19 * T + 4 + (i * 7) % 24, 9 * T + 4 + (i * 3) % 8, 2, 1, '#a07a20');
      } });
      // bendera segitiga di lapangan
      items.push({ y: 8 * T + 14, f: () => {
        for (let i = 0; i < 14; i++) {
          const x = 23 * T + 4 + i * 8, y = 8 * T + 10 + Math.abs(i - 7) * 0.6;
          px(ctx, x, y, 8, 1, '#6e4520');
          const col = ['#d63c2f', '#f4c430', '#3b7dd8', '#3fa34d'][i % 4];
          for (let r = 0; r < 4; r++) px(ctx, x + 1 + r, y + 1 + r, 6 - r * 2, 1, col);
        }
      } });
      // warga & teman yang belum ikut
      for (const [id, n] of Object.entries(NPCS)) {
        if (!isNpcHere(id)) continue;
        items.push({ y: n.y * T + 15, f: () => {
          shadow(ctx, n.x * T + 8, n.y * T + 15);
          const scared = id === 'umar' && Math.sin(t * 14) > 0.3 ? -1 : 0;
          put(ctx, G.spr[id], n.x * T + 8, n.y * T + 15 + scared);
          const need = (FRIENDS.some((f) => f.id === id) && !joined(id)) || (id === 'hasan' && allJoined() && !K().done);
          if (need) bubble(ctx, n.x * T + 8, n.y * T - 9);
        } });
      }
    },
  };

  // ---------- Alur cerita ----------
  G.kampung = {
    joinedSets: () => K().order.map((id) => G.spr.kidSet[id]),
    ready: () => !!(G.JUZAMMA && G.JUZAMMA.surahs),
    title: () => (K().done ? '🏅 Porseni sukses!' : allJoined() ? '🎪 Ke panggung Porseni!' : `🚒 Jemput teman: ${K().order.length}/4 → 🎪 Porseni`),
    reminder() {
      if (K().done) return [{ who: 'ara', text: 'Pentas Porseni sudah sukses. Hafalan kita makin lancar!' }];
      const left = FRIENDS.filter((f) => !joined(f.id)).map((f) => NAME[f.id]);
      if (!left.length) return [{ who: 'ara', text: 'Semua teman sudah ikut! Ayo ke panggung Porseni dan temui Ustadz Hasan.' }];
      const list = left.length === 1 ? left[0] : left.slice(0, -1).join(', ') + ', dan ' + left[left.length - 1];
      const head = left.length === 1 ? 'Tinggal 1 teman lagi yang perlu dijemput!' : `Tinggal ${left.length} teman lagi yang perlu kita jemput!`;
      return [{ who: 'ara', text: head }, { who: 'ara', text: `Yang masih menunggu: ${list}. Cari tanda ❗ ya!` }];
    },
    intro() {
      if (K().intro) return [{ who: 'ara', text: 'Tin tin! Kita kembali ke Kampung Hijau.' }].concat(this.reminder());
      K().intro = true;
      return [
        { who: 'ara', text: 'Tin tin! Kita sampai di Kampung Hijau!' },
        { who: 'aksa', text: 'Hari ini ada Porseni TPA di lapangan ujung kampung!' },
        { who: 'ara', text: 'Teman-teman TPA kita butuh bantuan supaya bisa datang. Ayo jemput mereka!' },
        { who: 'ara', text: 'Setiap teman yang dijemput, kita murajaah bersama.' },
      ].concat(this.reminder());
    },
    interact(id, api) {
      const { dialog, back } = api;
      if (id === 'ara') return dialog(this.reminder(), back);
      if (id === 'papanK') return dialog([{ who: 'papan', text: '🌾 Kampung Hijau. Lapangan Porseni → lurus ke timur.' }], back);
      if (id === 'nenek') return dialog([{ who: 'nenek', text: 'Terima kasih sudah membantu Nenek. Semoga pentasnya lancar!' }], back);
      const f = FRIENDS.find((x) => x.id === id);
      if (f && !joined(f.id)) {
        return dialog(f.ask, back, [
          { label: 'Ayo bantu! 💪', cls: 'green', fn: () => this.murajaah(f, api) },
          { label: 'Nanti', cls: 'grey', fn: back },
        ]);
      }
      if (id === 'hasan') {
        if (!allJoined()) {
          return dialog([
            { who: 'hasan', text: "Assalamu'alaikum, Aksa! Pentas Porseni sebentar lagi dimulai." },
            { who: 'hasan', text: 'Tapi teman-temanmu belum datang semua. Tolong jemput mereka ya!' },
          ].concat(this.reminder()), back);
        }
        const lines = K().done
          ? [{ who: 'hasan', text: 'Penampilan kalian tadi luar biasa. Mau pentas sekali lagi?' }]
          : [{ who: 'hasan', text: 'Masya Allah, semuanya sudah datang!' }, { who: 'hasan', text: 'Ayo naik panggung dan tampilkan hafalan terbaik kalian!' }];
        return dialog(lines, back, [
          { label: 'Naik panggung! 🎤', cls: 'green', fn: () => this.pentas(api) },
          { label: 'Nanti', cls: 'grey', fn: back },
        ]);
      }
      return back();
    },
    murajaah(f, api) {
      api.busy();
      G.murajaah.halaqah({ friend: f.id, surahs: f.surahs, count: 5 }, (res) => {
        api.returnToWorld();
        if (!res.done) return api.back();
        const k = K();
        k.order.push(f.id);
        k.stars[f.id] = Math.max(k.stars[f.id] || 0, res.stars);
        G.world.setFollowers(this.joinedSets());
        api.persist();
        api.dialog(f.thanks.concat([{ who: 'ara', text: `${NAME[f.id]} ikut rombongan kita!` }]).concat(this.reminder()), api.back);
      });
    },
    pentas(api) {
      api.busy();
      G.murajaah.stage({}, (res) => {
        api.returnToWorld();
        if (!res.done) return api.back();
        const k = K();
        const first = !k.done;
        k.done = true;
        k.stars.porseni = Math.max(k.stars.porseni || 0, res.stars);
        api.persist();
        const end = [
          { who: 'hasan', text: 'Masya Allah, penampilan kalian luar biasa! Penonton bertepuk tangan!' },
          { who: 'ara', text: 'Hore! Kita berhasil tampil bersama teman-teman!' },
          { who: 'aksa', text: 'Menolong teman dan belajar bersama itu menyenangkan!' },
        ];
        api.dialog(end, () => api.trophy(res.stars, first));
      });
    },
  };
})();
