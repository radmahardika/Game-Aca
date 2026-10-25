// Angkasa Mart — data barang, planet, tren, dan tahap toko.
window.AM = { VERSION: 1 };
(function () {
  const AM = window.AM;
  AM.MODAL_AWAL = 20;
  AM.ENERGI = 4;
  AM.HARGA_MAKS = 10;

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
  // tambahan harga yang masih mau dibayar pembeli, menurut jumlah hati (1–3)
  AM.LEBIH = [0, 1, 2, 4];
})();
