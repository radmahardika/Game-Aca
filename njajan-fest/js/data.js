// Njajan Fest — data permainan (versi, tokoh, barang, tahap)
export const NF = {
  VERSION: 1,
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
    klepon: { cat: 'lapak', nama: 'Klepon', harga: 2, slot: true },
    putu:   { cat: 'lapak', nama: 'Putu Bambu', harga: 2, slot: true },
    lemper: { cat: 'lapak', nama: 'Lemper', harga: 2, slot: true },
    serabi: { cat: 'lapak', nama: 'Serabi', harga: 2, slot: true },
    cendol: { cat: 'lapak', nama: 'Es Cendol', harga: 2, slot: true },
    musik:  { cat: 'hiburan', nama: 'Pemusik Kodok', ikon: '🎵', harga: 2, slot: false, tamu: 3 },
    bangku: { cat: 'fasilitas', nama: 'Bangku Kayu', ikon: '🪵', harga: 1, slot: true, maks: 2 },
    sampah: { cat: 'fasilitas', nama: 'Keranjang Sampah', ikon: '🧺', harga: 1, slot: true, maks: 2 },
    talas:  { cat: 'fasilitas', nama: 'Daun Talas', ikon: '☂️', harga: 1, slot: true, maks: 1 },
    info:   { cat: 'fasilitas', nama: 'Pos Informasi', ikon: '🐚', harga: 1, slot: true, maks: 1 },
    poster: { cat: 'promosi', nama: 'Poster Daun', ikon: '📜', harga: 1, slot: true, maks: 2, tamu: 2 },
  },
  TABS: [['lapak', '🌿 Lapak'], ['hiburan', '🪷 Hiburan'], ['fasilitas', '🪵 Fasilitas'], ['promosi', '📣 Promosi']],
  LAPAK: ['klepon', 'putu', 'lemper', 'serabi', 'cendol'],

  // Tahap 1
  LEVELS: [
    { id: 1, nama: 'Bazar Daun Teratai', modal: 15, targetTamu: 20, targetUntung: 6, porsi: 5, durasi: 80 },
  ],
};
window.NF = NF;
