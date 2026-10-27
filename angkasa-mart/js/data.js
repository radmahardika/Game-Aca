// Angkasa Mart — data barang, planet, tren, dan tahap toko.
window.AM = { VERSION: 3 };
(function () {
  const AM = window.AM;
  AM.MODAL_AWAL = 20;
  AM.ENERGI = 4;
  AM.HARGA_MAKS = 10;
  AM.HARGA_MAKS_PREMIUM = 15;
  AM.PREMIUM_DARI = 2; // barang premium mulai tahap Mart

  // beli = harga di Toko Bumi; planet = asal pembeli yang membutuhkannya (null = semua planet)
  AM.ITEMS = {
    selimut: { nama: 'Selimut', beli: 3, planet: 'tundra', butuh: 'Brrr… dingin sekali!', tolong: 'Brrr… adikku kedinginan di Tundra.' },
    termos: { nama: 'Termos', beli: 2, planet: 'tundra', butuh: 'Aku ingin minum yang hangat.', tolong: 'Kakekku kedinginan, ingin minum hangat.' },
    payung: { nama: 'Payung', beli: 2, planet: 'fores', butuh: 'Hujan terus di rumahku!', tolong: 'Rumahku bocor kena hujan.' },
    senter: { nama: 'Senter', beli: 2, planet: 'fores', butuh: 'Hutanku gelap sekali.', tolong: 'Aku takut gelap di hutan.' },
    kipas: { nama: 'Kipas', beli: 3, planet: 'peri', butuh: 'Gerah sekali!', tolong: 'Nenekku kepanasan.' },
    kacamata: { nama: 'Kacamata hitam', beli: 2, planet: 'peri', butuh: 'Silau sekali di planetku!', tolong: 'Mataku perih kena silau.' },
    kerupuk: { nama: 'Kerupuk', beli: 1, planet: 'peri', butuh: 'Aku mau camilan untuk pesta!', tolong: 'Aku ingin ikut pesta bunga.' },
    sikat: { nama: 'Sikat gigi', beli: 1, planet: null, butuh: 'Sikat gigiku sudah rusak.', tolong: 'Sikat gigiku patah.' },
    // barang premium: mahal & jarang dicari, untung besar tapi bisa tidak laku
    teleskop: { nama: 'Teleskop', beli: 7, planet: 'tundra', premium: true, butuh: 'Aku mau melihat bintang lebih dekat!', tolong: 'Aku ingin melihat bintang.' },
    sepeda: { nama: 'Sepeda roket', beli: 9, planet: 'fores', premium: true, butuh: 'Aku ingin cepat melewati hutan!', tolong: 'Rumahku jauh sekali.' },
    mahkota: { nama: 'Mahkota bunga', beli: 6, planet: 'peri', premium: true, butuh: 'Aku mau tampil cantik di pesta!', tolong: 'Aku ingin ikut pesta.' },
  };

  AM.PLANETS = {
    tundra: { nama: 'Tundra', ikon: '❄', kelas: 'tundra' },
    fores: { nama: 'Fores', ikon: '🌲', kelas: 'fores' },
    peri: { nama: 'Peri', ikon: '✨', kelas: 'peri' },
  };
  AM.PLANET_URUT = ['tundra', 'fores', 'peri'];

  // Kabar Angkasa: tiap tren membuat satu barang sangat dicari di satu planet.
  AM.TRENDS = [
    { planet: 'tundra', item: 'selimut', kabar: 'Badai salju di Planet Tundra!' },
    { planet: 'tundra', item: 'termos', kabar: 'Malam paling dingin di Planet Tundra!' },
    { planet: 'fores', item: 'payung', kabar: 'Musim hujan di Planet Fores!' },
    { planet: 'fores', item: 'senter', kabar: 'Pohon Fores tumbuh tinggi, hutan jadi gelap!' },
    { planet: 'peri', item: 'kipas', kabar: 'Matahari Planet Peri makin terik!' },
    { planet: 'peri', item: 'kacamata', kabar: 'Bunga Planet Peri berkilau, silau sekali!' },
    { planet: 'peri', item: 'kerupuk', kabar: 'Ada pesta bunga di Planet Peri!' },
    { planet: 'tundra', item: 'teleskop', kabar: 'Festival bintang di Tundra, teleskop dicari!', premium: true },
    { planet: 'fores', item: 'sepeda', kabar: 'Lomba balap hutan di Planet Fores!', premium: true },
    { planet: 'peri', item: 'mahkota', kabar: 'Pesta mahkota di Planet Peri!', premium: true },
  ];

  // Tahap toko: butuh = total untung terkumpul untuk naik ke tahap ini.
  AM.STAGES = [
    { nama: 'Lapak', butuh: 0, pembeli: 5, gudang: 6, kotak: 4, planet: ['tundra', 'fores'], tren: 1, kembalian: false },
    { nama: 'Toko', butuh: 20, pembeli: 6, gudang: 6, kotak: 4, planet: ['tundra', 'fores'], tren: 1, kembalian: true },
    { nama: 'Mart', butuh: 50, pembeli: 8, gudang: 8, kotak: 5, planet: ['tundra', 'fores', 'peri'], tren: 2, kembalian: true },
    { nama: 'Stasiun', butuh: 100, pembeli: 10, gudang: 10, kotak: 6, planet: ['tundra', 'fores', 'peri'], tren: 2, kembalian: true },
  ];
  AM.HADIAH = [
    '',
    'Pembeli jadi 6 tiap hari, dan ada latihan kembalian.',
    'Gudang 8 kotak, kotak Rotni 5, dan Planet Peri terbuka!',
    'Angkasa Mart jadi Stasiun Belanja! 10 pembeli tiap hari.',
  ];
  // harga memperbesar toko dari toples Tabung (per tambahan kotak)
  AM.UPGRADE = { gudang: [5, 7, 9, 11], kotak: [8, 12] };
  // hiasan toko dari toples Tabung (hanya untuk keindahan)
  // hiasan toko (dari Tabung atau Kas). dt = daya tarik; tiap 2 dt = +1 pembeli per hari (maks +4)
  AM.HIASAN = [
    { id: 'lampu', nama: 'Lampu warna-warni', ikon: '💡', harga: 4, dt: 1 },
    { id: 'tanaman', nama: 'Tanaman alien', ikon: '🪴', harga: 3, dt: 1 },
    { id: 'poster', nama: 'Poster planet', ikon: '🖼️', harga: 3, dt: 1 },
    { id: 'papan', nama: 'Papan nama emas', ikon: '🏅', harga: 6, dt: 1 },
    { id: 'karpet', nama: 'Karpet merah', ikon: '🟥', harga: 5, dt: 1 },
    { id: 'balon', nama: 'Balon bintang', ikon: '🎈', harga: 2, dt: 1 },
    { id: 'neon', nama: 'Lampu neon', ikon: '🌈', harga: 8, dt: 1 },
    { id: 'patung', nama: 'Patung Rotni', ikon: '🗿', harga: 12, dt: 2 },
    { id: 'airmancur', nama: 'Air mancur', ikon: '⛲', harga: 15, dt: 2 },
    { id: 'panggung', nama: 'Panggung musik', ikon: '🎵', harga: 20, dt: 3 },
  ];
  AM.DAYA = { per: 2, maks: 4 };
  AM.PEGAWAI = { nama: 'Kiki', gaji: 3, layani: 2 };
  AM.ASURANSI = 1;
  AM.RENOVASI = 12;
  AM.BENCANA = [
    { id: 'meteor', nama: 'Hujan meteor kecil', ikon: '☄️' },
    { id: 'debu', nama: 'Badai debu bintang', ikon: '🌪️' },
    { id: 'gempa', nama: 'Gempa planet kecil', ikon: '🌋' },
  ];
  AM.CABANG = [
    { id: 'tundra', nama: 'Cabang Tundra', ikon: '❄️', harga: 60 },
    { id: 'fores', nama: 'Cabang Fores', ikon: '🌲', harga: 80 },
    { id: 'peri', nama: 'Cabang Peri', ikon: '✨', harga: 100 },
  ];
  AM.SETORAN = 3; // tiap cabang per hari
  AM.SEWA = [1, 1, 2, 2]; // sewa tempat per hari menurut tahap
  AM.SEDEKAH_TIAP = 20;
  AM.SEWA_PENJAGA = 3;
  // tambahan harga yang masih mau dibayar pembeli, menurut jumlah hati (1–3)
  AM.LEBIH = [0, 1, 2, 4];
})();
