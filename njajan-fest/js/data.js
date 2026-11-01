// Njajan Fest — data permainan (versi, tokoh, barang, tahap)
export const NF = {
  VERSION: 4,
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
    klepon:   { cat: 'lapak', tab: 'kue', nama: 'Klepon', harga: 3, slot: true },
    putu:     { cat: 'lapak', tab: 'kue', nama: 'Putu Bambu', harga: 3, slot: true },
    lemper:   { cat: 'lapak', tab: 'kue', nama: 'Lemper', harga: 3, slot: true },
    serabi:   { cat: 'lapak', tab: 'kue', nama: 'Serabi', harga: 3, slot: true },
    getuk:    { cat: 'lapak', tab: 'kue', nama: 'Getuk', harga: 2, slot: true },
    cincin:   { cat: 'lapak', tab: 'kue', nama: 'Kue Cincin', harga: 2, slot: true },
    gemblong: { cat: 'lapak', tab: 'kue', nama: 'Gemblong', harga: 2, slot: true },
    cendol:   { cat: 'lapak', tab: 'minum', nama: 'Es Cendol', harga: 3, slot: true },
    tehtarik: { cat: 'lapak', tab: 'minum', nama: 'Teh Tarik', harga: 4, slot: true },
    wedang:   { cat: 'lapak', tab: 'minum', nama: 'Wedang Uwuh', harga: 3, slot: true },
    musik:  { cat: 'hiburan', nama: 'Pemusik Kodok', ikon: '🎵', harga: 2, slot: false, tamu: 3 },
    bangku: { cat: 'fasilitas', nama: 'Bangku Kayu', ikon: '🪵', harga: 1, slot: true, maks: 2 },
    sampah: { cat: 'fasilitas', nama: 'Keranjang Sampah', ikon: '🧺', harga: 1, slot: true, maks: 2 },
    talas:  { cat: 'fasilitas', nama: 'Daun Talas', ikon: '☂️', harga: 1, slot: true, maks: 1 },
    info:   { cat: 'fasilitas', nama: 'Pos Informasi', ikon: '🐚', harga: 1, slot: true, maks: 1 },
    poster: { cat: 'promosi', nama: 'Poster Daun', ikon: '📜', harga: 1, slot: true, maks: 2, tamu: 2 },
  },
  TABS: [['kue', '🍡 Kue'], ['minum', '🥤 Minuman'], ['hiburan', '🪷 Hiburan'], ['fasilitas', '🪵 Fasilitas'], ['promosi', '📣 Promosi']],
  LAPAK: ['klepon', 'putu', 'lemper', 'serabi', 'getuk', 'cincin', 'gemblong', 'cendol', 'tehtarik', 'wedang'],
  HEARTS: [3, 3, 3, 2, 2, 2, 1, 1, 1, 1],   // dibagikan acak ke 10 jajanan tiap main

  // ---- Susun Acara (Papan Persiapan langkah 2) ----
  ACARA: {
    pembukaan: { e: '👑', nama: 'Pembukaan Raja', ket: 'paling awal' },
    musik:     { e: '🎵', nama: 'Konser Kodok', ket: 'perlu pemusik' },
    lomba:     { e: '🛶', nama: 'Lomba Perahu Daun', ket: 'tamu suka menonton' },
    hadiah:    { e: '🏆', nama: 'Bagi Hadiah', ket: 'sesudah lomba' },
  },
  // ---- Relawan (langkah 3) ----
  RELAWAN: [
    { id: 'bubu', nama: 'Bubu', sifat: '😊 ramah', kind: 'bebek', cocok: 'gerbang' },
    { id: 'oto', nama: 'Oto', sifat: '💪 rajin', kind: 'berang', cocok: 'bersih' },
    { id: 'pakkur', nama: 'Pak Kur', sifat: '🧘 sabar', kind: 'kura', cocok: 'bantu' },
  ],
  POS: {
    gerbang: { e: '🎟️', nama: 'Jaga Gerbang', ket: 'tamu lebih sabar mengantre' },
    bersih:  { e: '🧹', nama: 'Kebersihan', ket: 'sampah cepat diangkat' },
    bantu:   { e: '🤝', nama: 'Penolong Anak Hilang', ket: 'anak cepat ketemu ibunya' },
  },
  // ---- Tamu istimewa (satu per festival, diumumkan di langkah 3) ----
  TAMU_IST: {
    nenek:  { nama: 'Nenek Kura-kura', ikon: '👵', butuh: 'bangku kayu dekat gerbang', puas: 'Bangkunya dekat, nenek bisa istirahat!' },
    berudu: { nama: 'Rombongan Berudu', ikon: '🐸', butuh: 'Pemusik Kodok untuk berjoget', puas: 'Asyik, kita joget bersama! 🎵' },
    bangau: { nama: 'Pak Bangau', ikon: '🐦', butuh: '2 keranjang sampah (telaga harus bersih)', puas: 'Telaganya bersih, aku senang!' },
  },
  // ---- Stiker spesial ----
  STIKER: [
    ['nenek', '👵', 'Nenek senang'], ['berudu', '🐸', 'Joget berudu'], ['bangau', '🐦', 'Pak Bangau senang'],
    ['acara', '🎤', 'Acara tepat'], ['telaga', '🐟', 'Telaga bersih'], ['raja', '👑', 'Raja senang'],
    ['relawan', '👫', 'Relawan pas'], ['anak', '❤️', 'Anak ketemu ibu'],
  ],

  // Tahap 1
  LEVELS: [
    { id: 1, nama: 'Bazar Daun Teratai', modal: 18, targetTamu: 20, targetUntung: 6, porsi: 5, durasi: 90,
      jam: ['09.00', '10.00', '11.00', '12.00'], acara: ['pembukaan', 'musik', 'lomba', 'hadiah'] },
  ],
};
window.NF = NF;
