// Njajan Fest — data permainan (versi, tokoh, barang, tahap)
export const NF = {
  VERSION: 6,
  SAVE_KEY: 'njajan-fest-v1',

  // Tokoh pemain: bakat (selalu aktif) + jurus (sekali per festival)
  HEROES: {
    tiko: {
      nama: 'Tiko si Berang-berang', julukan: 'Si Tukang Ranting', warna: '#2bb3a3',
      bakat: '🪵 <b>Hemat Bangun</b>: lapak & bangku lebih murah 1 🪙',
      jurus: 'Bangun Kilat', jurusIkon: '🪵',
      jurusTeks: '⚡ <b>Bangun Kilat</b>: sekali per festival, bangun daun baru + lapak gratis',
      jago: '🪙 Jago mengejar UNTUNG', asisten: 'kiko',
    },
    bebi: {
      nama: 'Bebi si Anak Bebek', julukan: 'Si Ramah', warna: '#ff6b6b',
      bakat: '💛 <b>Sapaan Hangat</b>: tamu lebih sabar & tiap lapak melayani 1 tamu lebih banyak',
      jurus: 'Kwek Undangan', jurusIkon: '📣',
      jurusTeks: '⚡ <b>Kwek Undangan</b>: sekali per festival, panggil rombongan perahu daun, +5 tamu',
      jago: '🐸 Jago mengejar PENGUNJUNG', asisten: 'kiko',
    },
    lumi: {
      nama: 'Lumi si Anak Katak', julukan: 'Si Lompat Gesit', warna: '#ffb43a',
      bakat: '👀 <b>Mata Jeli</b>: tanda ❗ muncul sebelum masalah terjadi',
      jurus: 'Lompat Kilat', jurusIkon: '⚡',
      jurusTeks: '⚡ <b>Lompat Kilat</b>: sekali per festival, bereskan semua masalah sekaligus',
      jago: '⭐ Jago membuat tamu SENANG', asisten: 'cici',
    },
  },

  // Barang yang bisa dipasang. cat = tab. slot = ditaruh di daun utama.
  ITEMS: {
    // jajanan: tab kue / minum; harga sewa lapak berbeda supaya anak menimbang ❤ vs biaya
    klepon:   { cat: 'lapak', tab: 'kue', nama: 'Klepon', harga: 2, slot: true },
    putu:     { cat: 'lapak', tab: 'kue', nama: 'Putu Bambu', harga: 2, slot: true },
    lemper:   { cat: 'lapak', tab: 'kue', nama: 'Lemper', harga: 2, slot: true },
    serabi:   { cat: 'lapak', tab: 'kue', nama: 'Serabi', harga: 2, slot: true },
    getuk:    { cat: 'lapak', tab: 'kue', nama: 'Getuk', harga: 1, slot: true },
    cincin:   { cat: 'lapak', tab: 'kue', nama: 'Kue Cincin', harga: 1, slot: true },
    gemblong: { cat: 'lapak', tab: 'kue', nama: 'Gemblong', harga: 1, slot: true },
    cendol:   { cat: 'lapak', tab: 'minum', nama: 'Es Cendol', harga: 2, slot: true },
    tehtarik: { cat: 'lapak', tab: 'minum', nama: 'Teh Tarik', harga: 3, slot: true },
    wedang:   { cat: 'lapak', tab: 'minum', nama: 'Wedang Uwuh', harga: 2, slot: true },
    musik:  { cat: 'hiburan', nama: 'Pemusik Kodok', ikon: '🎵', harga: 2, slot: false, tamu: 3 },
    kembangapi: { cat: 'hiburan', nama: 'Kembang Api', ikon: '🎆', harga: 2, slot: false, tamu: 2, malam: true },
    bangku: { cat: 'fasilitas', nama: 'Bangku Kayu', ikon: '🪵', harga: 1, slot: true, maks: 2 },
    sampah: { cat: 'fasilitas', nama: 'Keranjang Sampah', ikon: '🧺', harga: 1, slot: true, maks: 2 },
    talas:  { cat: 'fasilitas', nama: 'Daun Talas', ikon: '☂️', harga: 1, slot: true, maks: 1 },
    info:   { cat: 'fasilitas', nama: 'Pos Informasi', ikon: '🐚', harga: 1, slot: true, maks: 1 },
    lampion: { cat: 'lampu', nama: 'Lampion', ikon: '🏮', harga: 1, slot: true, maks: 6, malam: true },
    poster: { cat: 'promosi', nama: 'Poster Daun', ikon: '📜', harga: 1, slot: true, maks: 2, tamu: 2 },
  },
  TABS: [['kue', '🍡 Kue'], ['minum', '🥤 Minuman'], ['hiburan', '🪷 Hiburan'], ['fasilitas', '🪵 Fasilitas'], ['promosi', '📣 Promosi'], ['lampu', '🏮 Lampu']],
  LAPAK: ['klepon', 'putu', 'lemper', 'serabi', 'getuk', 'cincin', 'gemblong', 'cendol', 'tehtarik', 'wedang'],
  HEARTS: [3, 3, 3, 2, 2, 2, 1, 1, 1, 1],   // dibagikan acak ke 10 jajanan tiap main

  // ---- Stok porsi per lapak (dipilih saat menaruh lapak) ----
  PORSI: [[3, 1], [5, 2], [8, 3]],     // [jumlah porsi, biaya bahan 🪙]
  // ---- Relawan: diseret ke masalah saat festival; cocok = lebih cepat ----
  RELAWAN: [
    { id: 'bubu', nama: 'Bubu', sifat: '😊 ramah', kind: 'bebek', cocok: ['habis', 'raja'], kerja: 'menenangkan antrean' },
    { id: 'oto', nama: 'Oto', sifat: '💪 rajin', kind: 'berang', cocok: ['sampah', 'telaga'], kerja: 'membersihkan sampah' },
    { id: 'pakkur', nama: 'Pak Kur', sifat: '🧘 sabar', kind: 'kura', cocok: ['berudu'], kerja: 'menemani anak hilang' },
    { id: 'udi', nama: 'Udi', sifat: '⚡ cekatan', kind: 'udang', cocok: ['jatuh'], kerja: 'mengobati tamu' },
  ],
  // ---- Tamu istimewa (satu per festival, diumumkan di langkah 3) ----
  TAMU_IST: {
    nenek:  { nama: 'Nenek Kura-kura', ikon: '👵', butuh: 'bangku kayu dekat gerbang', puas: 'Bangkunya dekat, nenek bisa istirahat!' },
    berudu: { nama: 'Rombongan Berudu', ikon: '🐸', butuh: 'Pemusik Kodok untuk berjoget', puas: 'Asyik, kita joget bersama! 🎵' },
    bangau: { nama: 'Pak Bangau', ikon: '🐦', butuh: '2 keranjang sampah (telaga harus bersih)', puas: 'Telaganya bersih, aku senang!' },
  },
  // ---- Stiker spesial ----
  STIKER: [
    ['nenek', '👵', 'Nenek senang'], ['berudu', '🐸', 'Joget berudu'], ['bangau', '🐦', 'Pak Bangau senang'],
['telaga', '🐟', 'Telaga bersih'], ['raja', '👑', 'Raja senang'],
    ['relawan', '👫', 'Tim hebat'], ['porsi', '📦', 'Porsi pas'], ['anak', '❤️', 'Anak ketemu ibu'],
    ['terang', '🏮', 'Pasar terang'], ['kembangapi', '🎆', 'Kembang api indah'],
  ],

  // Tahap 1
  LEVELS: [
    { id: 1, nama: 'Bazar Daun Teratai', modal: 24, targetTamu: 20, targetUntung: 14, porsi: 5, durasi: 90,
      relawan: 3, base: 4, kejadian: ['berudu', 'tamu', 'raja', 'hujan'] },
    { id: 2, nama: 'Pasar Malam Kunang-kunang', malam: true, modal: 40, targetTamu: 30, targetUntung: 22, porsi: 5, durasi: 105,
      relawan: 4, base: 8, kejadian: ['berudu', 'tamu', 'raja', 'jatuh'] },
  ],
};
window.NF = NF;
