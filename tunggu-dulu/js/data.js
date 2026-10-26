// Tunggu Dulu! — data tamu, aturan per hari, dan pembuat antrean tamu.
window.TD = { VERSION: 4 };
(function () {
  const TD = window.TD;
  TD.HARI_TERAKHIR = 10;
  TD.PERISAI_MAKS = 5;
  TD.PANEN_AWAL = 12; // keranjang hasil panen di lumbung desa
  TD.TAMU_PER_HARI = [0, 6, 6, 6, 6, 6, 7, 7, 8, 8, 10]; // indeks = hari
  TD.TROLL_PER_HARI = [0, 2, 2, 2, 2, 3, 3, 3, 3, 4, 4];
  TD.LEMBUR = 2; // tamu tambahan (1 troll + 1 kurcaci)
  TD.HARI_BUKU = 6; // Buku Warga mulai dipakai
  TD.HARI_RAPI = 8; // penyamaran makin rapi + kurcaci jujur yang terlihat aneh
  TD.HARI_CAP_PALSU = 9;
  TD.ISI_BUKU = 12; // jumlah warga di Buku Warga

  // Aturan bertambah per hari. kind = jenis petunjuk troll yang bisa muncul.
  TD.RULES = [
    { id: 'foto', hari: 1, teks: 'Foto sama dengan wajah', baru: 'Lihat foto di kartu. Topi, janggut, dan kacamatanya harus sama dengan wajah tamu.', kind: ['topi', 'janggut', 'kacamata'] },
    { id: 'cap', hari: 2, teks: 'Kartu ada cap Tetua ⭐', baru: 'Kartu warga asli selalu ada cap bintang dari Tetua.', kind: ['cap'] },
    { id: 'bawaan', hari: 3, teks: 'Bawaan sesuai daftar', baru: 'Buka tasnya. Isinya harus sama dengan daftar. Troll suka membawa alat untuk mencuri!', kind: ['jumlah', 'alat'] },
    { id: 'fisik', hari: 4, teks: 'Telinga & bayangan biasa', baru: 'Pakai kaca pembesar untuk melihat telinga, dan senter untuk melihat bayangan. Troll bertelinga runcing dan bayangannya bertanduk!', kind: ['telinga', 'bayangan'] },
    { id: 'nama', hari: 6, teks: 'Nama ada di Buku Warga', baru: 'Buka Buku Warga. Nama di kartu harus sama persis dengan nama di buku. Troll suka menulis nama yang mirip, misalnya BOLRI untuk BORLI!', kind: ['nama'] },
    { id: 'rumah', hari: 7, teks: 'Rumah sama dengan buku', baru: 'Rumah di kartu juga harus sama dengan rumah di Buku Warga.', kind: ['rumah'] },
  ];
  TD.rulesFor = hari => TD.RULES.filter(r => r.hari <= hari);
  TD.ruleText = (r, hari) => (r.id === 'cap' && hari >= TD.HARI_CAP_PALSU ? 'Cap asli: ⭐ bintang 5 merah' : r.teks);
  // pesan pagi untuk hari tanpa aturan baru
  TD.PESAN_PAGI = {
    5: 'Hari ini semua aturan berlaku. Troll makin pintar menyamar, periksa semuanya!',
    8: 'Penyamaran troll makin rapi: lihat hiasan pompom topi dan panjang janggut di foto. Ada juga kurcaci jujur yang terlihat aneh. Jangan menuduh tanpa bukti!',
    9: 'Hati-hati, ada cap palsu! Cap Tetua asli berbentuk bintang 5 berwarna merah. Cap palsu bintang 4 berwarna biru.',
    10: 'Hari besar sebelum Pesta Panen! Banyak tamu, dan setiap troll hanya punya satu petunjuk kecil.',
  };

  TD.NAMA = ['PIPO', 'BIMO', 'DODI', 'TATA', 'LULU', 'MIMI', 'KIKO', 'NANA', 'BOBO', 'RERE', 'SISI', 'TOTO', 'GUGU', 'POPI', 'DUDU', 'BORLI', 'KUKU', 'MOMO'];
  TD.TOPI = { merah: '#c8553d', biru: '#4f7aa8', kuning: '#d9a441', ungu: '#7a5aa8', oranye: '#e0874a' };
  TD.JANGGUT = { putih: '#f3e6cc', cokelat: '#8a5a3a', oranye: '#d98a4a' };
  TD.BAJU = ['#5f948c', '#a8432e', '#6a7a3a', '#5a6aa0', '#8a5a7a', '#b0843a'];
  TD.RUMAH = ['Jamur Merah', 'Pondok Jerami', 'Jamur Oranye', 'Pohon Ek', 'Batu Lumut', 'Tepi Sungai'];
  TD.BARANG = { roti: 'roti', madu: 'madu', apel: 'apel', jamur: 'jamur', bunga: 'bunga' };
  TD.ALAT = { karung: 'karung kosong', jaring: 'jaring', palu: 'palu batu' };
  // hiasan kurcaci jujur yang terlihat aneh (bukan tanda troll)
  TD.HIASAN = { syal: 'syal hijau', bulu: 'bulu di topi', sarung: 'sarung tangan hijau' };

  TD.SAPA = ['Halo! Aku {n}. Mau pulang ke rumah.', 'Selamat siang, Penjaga!', 'Boleh aku masuk? Aku {n}.', 'Halo! Aku baru pulang dari pasar.', 'Permisi, Penjaga. Aku {n}.'];

  // Kalimat petunjuk untuk pita hasil.
  TD.clueText = function (c, g) {
    switch (c) {
      case 'topi': return 'warna topi di foto beda';
      case 'janggut': return 'warna janggut di foto beda';
      case 'kacamata': return 'kacamata di foto beda';
      case 'pompom': return 'pompom topi di foto beda';
      case 'panjang': return 'panjang janggut di foto beda';
      case 'cap': return 'cap Tetua kosong';
      case 'capPalsu': return 'cap palsu (bintang biru)';
      case 'jumlah': return 'jumlah ' + g.salahItem + ' tidak sama';
      case 'alat': return 'bawa ' + TD.ALAT[g.alat];
      case 'telinga': return 'telinga hijau runcing';
      case 'bayangan': return 'bayangan bertanduk';
      case 'nama': return 'nama ' + g.nama + ' tidak ada di buku';
      case 'rumah': return 'rumah beda dengan buku';
    }
    return c;
  };
  // bukti kurcaci jujur: hiasan aneh (kalau ada) + 3 aturan terbaru, supaya muat di pita
  TD.buktiJujur = function (hari, g) {
    const t = { foto: 'foto sama', cap: 'cap asli', bawaan: 'bawaan lengkap', fisik: 'telinga bulat', nama: 'nama ada di buku', rumah: 'rumah cocok' };
    const out = TD.rulesFor(hari).map(r => t[r.id]).slice(-3);
    if (g && g.hiasan) out.unshift(TD.HIASAN[g.hiasan] + ' bukan tanda troll');
    return out.slice(0, 3).join(' · ');
  };

  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  TD.pick = pick; TD.shuffle = shuffle;

  function makeList(hari) {
    const kinds = shuffle(Object.keys(TD.BARANG)).slice(0, hari >= TD.HARI_RAPI ? 3 : 1 + Math.floor(Math.random() * 2));
    const list = {};
    for (const k of kinds) list[k] = 1 + Math.floor(Math.random() * 2);
    return list;
  }

  function makeGuest(hari, troll, warga) {
    const g = {
      troll, nama: warga.nama, rumah: warga.rumah,
      topi: pick(Object.keys(TD.TOPI)), janggut: pick(Object.keys(TD.JANGGUT)), kacamata: Math.random() < 0.35,
      pompom: Math.random() < 0.6, panjang: Math.random() < 0.4,
      baju: pick(TD.BAJU), cap: true, capPalsu: false, clues: [],
    };
    g.foto = { topi: g.topi, janggut: g.janggut, kacamata: g.kacamata, pompom: g.pompom, panjang: g.panjang };
    g.sapa = pick(TD.SAPA).replace('{n}', g.nama);
    if (hari >= 3) { g.daftar = makeList(hari); g.tas = Object.assign({}, g.daftar); }
    if (!troll && hari >= TD.HARI_RAPI && Math.random() < 0.45) g.hiasan = pick(Object.keys(TD.HIASAN));
    return g;
  }

  // nama mirip yang tidak ada di buku: tukar dua huruf berdampingan, atau ganti satu huruf vokal
  function namaMirip(nama, buku) {
    const ada = new Set(buku.map(w => w.nama));
    for (let k = 0; k < 20; k++) {
      const a = nama.split('');
      if (k % 2 === 0) { const i = Math.floor(Math.random() * (a.length - 1)); [a[i], a[i + 1]] = [a[i + 1], a[i]]; }
      else { const i = a.findIndex((c, j) => 'AIUEO'.includes(c) && j > 0); if (i > 0) a[i] = pick('AIUEO'.replace(a[i], '').split('')); }
      const n = a.join('');
      if (n !== nama && !ada.has(n)) return n;
    }
    return nama + 'O';
  }

  // jenis petunjuk sebuah aturan; foto jadi lebih halus mulai hari 8, cap palsu mulai hari 9
  function kindsFor(rid, hari) {
    if (rid === 'foto' && hari >= TD.HARI_RAPI) return ['pompom', 'panjang', 'kacamata'];
    if (rid === 'cap' && hari >= TD.HARI_CAP_PALSU) return ['capPalsu'];
    return TD.RULES.find(r => r.id === rid).kind;
  }

  // Beri troll petunjuk dari aturan yang berlaku. `wajib` = jenis aturan yang pasti dipakai (aturan terbaru).
  function addClues(g, hari, wajib, buku) {
    const rules = TD.rulesFor(hari);
    const n = hari === 3 || hari === 4 ? 1 + (Math.random() < 0.4 ? 1 : 0) : 1;
    const ruleIds = shuffle(rules.map(r => r.id));
    if (wajib) { ruleIds.splice(ruleIds.indexOf(wajib), 1); ruleIds.unshift(wajib); }
    for (const rid of ruleIds.slice(0, n)) {
      const c = pick(kindsFor(rid, hari));
      g.clues.push(c);
      if (c === 'topi') g.foto.topi = pick(Object.keys(TD.TOPI).filter(k => k !== g.topi));
      if (c === 'janggut') g.foto.janggut = pick(Object.keys(TD.JANGGUT).filter(k => k !== g.janggut));
      if (c === 'kacamata') g.foto.kacamata = !g.kacamata;
      if (c === 'pompom') g.foto.pompom = !g.pompom;
      if (c === 'panjang') g.foto.panjang = !g.panjang;
      if (c === 'cap') g.cap = false;
      if (c === 'capPalsu') g.capPalsu = true;
      if (c === 'jumlah') {
        const k = pick(Object.keys(g.tas));
        g.tas[k] = g.tas[k] === 1 ? 2 : g.tas[k] + (Math.random() < 0.5 ? -1 : 1);
        g.salahItem = TD.BARANG[k];
      }
      if (c === 'alat') g.alat = pick(Object.keys(TD.ALAT));
      if (c === 'nama') { g.nama = namaMirip(g.nama, buku); g.sapa = pick(TD.SAPA).replace('{n}', g.nama); }
      if (c === 'rumah') g.rumah = pick(TD.RUMAH.filter(r => r !== g.rumah));
    }
  }

  // Antrean satu hari: kurcaci jujur + troll menyamar, diacak. Mulai hari 6 ada Buku Warga.
  TD.makeDay = function (hari, lembur) {
    let total = TD.TAMU_PER_HARI[hari], trolls = TD.TROLL_PER_HARI[hari];
    if (lembur) { total += TD.LEMBUR; trolls += 1; }
    const names = shuffle(TD.NAMA.slice());
    const buku = hari >= TD.HARI_BUKU
      ? names.slice(0, Math.max(TD.ISI_BUKU, total)).map(nama => ({ nama, rumah: pick(TD.RUMAH) })) : null;
    const newRule = TD.RULES.find(r => r.hari === hari);
    const newest = newRule ? newRule.id : hari === TD.HARI_RAPI ? 'foto' : hari === TD.HARI_CAP_PALSU ? 'cap' : null;
    const list = [];
    for (let i = 0; i < total; i++) {
      const troll = i < trolls;
      // troll menyamar sebagai warga yang ada di buku (lalu salah menulis nama/rumah kalau itu petunjuknya)
      const warga = buku ? Object.assign({}, buku[i]) : { nama: names[i], rumah: pick(TD.RUMAH) };
      const g = makeGuest(hari, troll, warga);
      if (troll) addClues(g, hari, i === 0 ? newest : null, buku || []);
      list.push(g);
    }
    shuffle(list);
    // tamu pertama hari ini selalu kurcaci jujur supaya anak bisa melihat contoh yang benar
    const first = list.findIndex(g => !g.troll);
    if (first > 0) list.unshift(list.splice(first, 1)[0]);
    list.buku = buku ? shuffle(buku.slice()).sort((a, b) => a.nama.localeCompare(b.nama)) : null;
    return list;
  };

  TD.daftarText = function (obj) {
    return Object.entries(obj).map(([k, v]) => v + ' ' + TD.BARANG[k]).join(', ');
  };
})();
