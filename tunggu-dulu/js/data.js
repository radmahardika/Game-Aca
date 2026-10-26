// Tunggu Dulu! — data tamu, aturan per hari, dan pembuat antrean tamu.
window.TD = { VERSION: 3 };
(function () {
  const TD = window.TD;
  TD.HARI_TERAKHIR = 5;
  TD.PERISAI_MAKS = 5;
  TD.PANEN_AWAL = 12; // keranjang hasil panen di lumbung desa
  TD.TAMU_PER_HARI = 6;
  TD.TROLL_PER_HARI = [0, 2, 2, 2, 2, 3]; // indeks = hari
  TD.LEMBUR = 2; // tamu tambahan (1 troll + 1 kurcaci)

  // Aturan bertambah satu per hari. kind = jenis petunjuk troll yang bisa muncul.
  TD.RULES = [
    { id: 'foto', hari: 1, teks: 'Foto sama dengan wajah', baru: 'Lihat foto di kartu. Topi, janggut, dan kacamatanya harus sama dengan wajah tamu.', kind: ['topi', 'janggut', 'kacamata'] },
    { id: 'cap', hari: 2, teks: 'Kartu ada cap Tetua ⭐', baru: 'Kartu warga asli selalu ada cap bintang dari Tetua.', kind: ['cap'] },
    { id: 'bawaan', hari: 3, teks: 'Bawaan sesuai daftar', baru: 'Buka tasnya. Isinya harus sama dengan daftar. Troll suka membawa alat untuk mencuri!', kind: ['jumlah', 'alat'] },
    { id: 'fisik', hari: 4, teks: 'Telinga & bayangan biasa', baru: 'Pakai kaca pembesar untuk melihat telinga, dan senter untuk melihat bayangan. Troll bertelinga runcing dan bayangannya bertanduk!', kind: ['telinga', 'bayangan'] },
  ];
  TD.rulesFor = hari => TD.RULES.filter(r => r.hari <= hari);

  TD.NAMA = ['PIPO', 'BIMO', 'DODI', 'TATA', 'LULU', 'MIMI', 'KIKO', 'NANA', 'BOBO', 'RERE', 'SISI', 'TOTO', 'GUGU', 'POPI', 'DUDU', 'BORLI'];
  TD.TOPI = { merah: '#c8553d', biru: '#4f7aa8', kuning: '#d9a441', ungu: '#7a5aa8', oranye: '#e0874a' };
  TD.JANGGUT = { putih: '#f3e6cc', cokelat: '#8a5a3a', oranye: '#d98a4a' };
  TD.BAJU = ['#5f948c', '#a8432e', '#6a7a3a', '#5a6aa0', '#8a5a7a', '#b0843a'];
  TD.RUMAH = ['Jamur Merah', 'Pondok Jerami', 'Jamur Oranye', 'Pohon Ek', 'Batu Lumut', 'Tepi Sungai'];
  TD.BARANG = { roti: 'roti', madu: 'madu', apel: 'apel', jamur: 'jamur', bunga: 'bunga' };
  TD.ALAT = { karung: 'karung kosong', jaring: 'jaring', palu: 'palu batu' };

  TD.SAPA = ['Halo! Aku {n}. Mau pulang ke rumah.', 'Selamat siang, Penjaga!', 'Boleh aku masuk? Aku {n}.', 'Halo! Aku baru pulang dari pasar.', 'Permisi, Penjaga. Aku {n}.'];

  // Kalimat petunjuk untuk pita hasil.
  TD.clueText = function (c, g) {
    switch (c) {
      case 'topi': return 'warna topi di foto beda';
      case 'janggut': return 'warna janggut di foto beda';
      case 'kacamata': return 'kacamata di foto beda';
      case 'cap': return 'cap Tetua kosong';
      case 'jumlah': return 'jumlah ' + g.salahItem + ' tidak sama';
      case 'alat': return 'bawa ' + TD.ALAT[g.alat];
      case 'telinga': return 'telinga hijau runcing';
      case 'bayangan': return 'bayangan bertanduk';
    }
    return c;
  };
  TD.buktiJujur = function (hari) {
    const t = { foto: 'foto sama', cap: 'cap ada', bawaan: 'bawaan lengkap', fisik: 'telinga bulat' };
    return TD.rulesFor(hari).map(r => t[r.id]).join(' · ');
  };

  const pick = a => a[Math.floor(Math.random() * a.length)];
  const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [a[i], a[j]] = [a[j], a[i]]; } return a; };
  TD.pick = pick; TD.shuffle = shuffle;

  function makeList() {
    const kinds = shuffle(Object.keys(TD.BARANG)).slice(0, 1 + Math.floor(Math.random() * 2));
    const list = {};
    for (const k of kinds) list[k] = 1 + Math.floor(Math.random() * 2);
    return list;
  }

  function makeGuest(hari, troll, nama) {
    const g = {
      troll, nama,
      topi: pick(Object.keys(TD.TOPI)), janggut: pick(Object.keys(TD.JANGGUT)), kacamata: Math.random() < 0.35,
      baju: pick(TD.BAJU), rumah: pick(TD.RUMAH), cap: true, clues: [],
    };
    g.foto = { topi: g.topi, janggut: g.janggut, kacamata: g.kacamata };
    g.sapa = pick(TD.SAPA).replace('{n}', nama);
    if (hari >= 3) { g.daftar = makeList(); g.tas = Object.assign({}, g.daftar); }
    return g;
  }

  // Beri troll petunjuk dari aturan yang berlaku. `wajib` = jenis aturan yang pasti dipakai (aturan terbaru).
  function addClues(g, hari, wajib) {
    const rules = TD.rulesFor(hari);
    const n = hari === 3 || hari === 4 ? 1 + (Math.random() < 0.4 ? 1 : 0) : 1;
    const ruleIds = shuffle(rules.map(r => r.id));
    if (wajib) { ruleIds.splice(ruleIds.indexOf(wajib), 1); ruleIds.unshift(wajib); }
    for (const rid of ruleIds.slice(0, n)) {
      const c = pick(rules.find(r => r.id === rid).kind);
      g.clues.push(c);
      if (c === 'topi') g.foto.topi = pick(Object.keys(TD.TOPI).filter(k => k !== g.topi));
      if (c === 'janggut') g.foto.janggut = pick(Object.keys(TD.JANGGUT).filter(k => k !== g.janggut));
      if (c === 'kacamata') g.foto.kacamata = !g.kacamata;
      if (c === 'cap') g.cap = false;
      if (c === 'jumlah') {
        const k = pick(Object.keys(g.tas));
        g.tas[k] = g.tas[k] === 1 ? 2 : g.tas[k] + (Math.random() < 0.5 ? -1 : 1);
        g.salahItem = TD.BARANG[k];
      }
      if (c === 'alat') g.alat = pick(Object.keys(TD.ALAT));
    }
  }

  // Antrean satu hari: kurcaci jujur + troll menyamar, diacak.
  TD.makeDay = function (hari, lembur) {
    let total = TD.TAMU_PER_HARI, trolls = TD.TROLL_PER_HARI[hari];
    if (lembur) { total += TD.LEMBUR; trolls += 1; }
    const names = shuffle(TD.NAMA.slice());
    const newest = hari <= 4 ? TD.RULES[hari - 1].id : null;
    const list = [];
    for (let i = 0; i < total; i++) {
      const troll = i < trolls;
      const g = makeGuest(hari, troll, names[i]);
      if (troll) addClues(g, hari, i === 0 ? newest : null);
      list.push(g);
    }
    shuffle(list);
    // tamu pertama hari ini selalu kurcaci jujur supaya anak bisa melihat contoh yang benar
    const first = list.findIndex(g => !g.troll);
    if (first > 0) list.unshift(list.splice(first, 1)[0]);
    return list;
  };

  TD.daftarText = function (obj) {
    return Object.entries(obj).map(([k, v]) => v + ' ' + TD.BARANG[k]).join(', ');
  };
})();
