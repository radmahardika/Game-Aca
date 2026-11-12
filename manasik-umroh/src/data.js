// Bank soal & teks — diringkas dari materi Manasik Umroh rombongan.
import { P, pick, shuffle } from './ui.js';

export const SORT_CARDS = () => shuffle([['Islam', 'S'], ['Baligh', 'S'], ['Berakal sehat', 'S'], ["Istitha'ah (mampu harta, fisik, bekal)", 'S'], ['Merdeka', 'S'], ['Ihram (niat)', 'R'], ['Thawaf', 'R'], ["Sa'i", 'R'], ['Tahallul', 'R'], ['Tertib (berurutan)', 'R'], ['Niat ihram dari miqat', 'W'], ['Meninggalkan larangan ihram', 'W']]);

export const DRESS = () => P() ? [
  { id: 'kain', e: '🧣', n: '2 helai kain ihram tak berjahit', ok: 1 },
  { id: 'sandal', e: '🩴', n: 'Sandal terbuka (mata kaki terlihat)', ok: 1 },
  { id: 'peci', e: '🧢', n: 'Peci / topi', ok: 0, why: 'pria dilarang menutup kepala' },
  { id: 'kaos', e: '👕', n: 'Kaos dalam', ok: 0, why: 'pakaian berjahit dilarang bagi pria' },
  { id: 'celana', e: '🩲', n: 'Celana dalam', ok: 0, why: 'termasuk pakaian berjahit' },
  { id: 'sepatu', e: '👟', n: 'Sepatu kets', ok: 0, why: 'alas kaki menutup mata kaki' },
  { id: 'kk', e: '🧦', n: 'Kaus kaki', ok: 0, why: 'menutup mata kaki' },
  { id: 'parfum', e: '🧴', n: 'Semprot parfum ke kain ihram', ok: 0, why: 'wewangian cukup di badan sebelum memakai ihram' },
] : [
  { id: 'gamis', e: '👗', n: 'Gamis longgar menutup aurat', ok: 1 },
  { id: 'jilbab', e: '🧕', n: 'Jilbab / kerudung', ok: 1 },
  { id: 'kk', e: '🧦', n: 'Kaus kaki', ok: 2 },
  { id: 'sandal', e: '🥿', n: 'Sandal / sepatu nyaman', ok: 2 },
  { id: 'cadar', e: '😷', n: 'Cadar penutup wajah', ok: 0, why: 'wanita dilarang menutup wajah' },
  { id: 'sarung', e: '🧤', n: 'Sarung tangan', ok: 0, why: 'wanita dilarang menutup telapak tangan' },
  { id: 'mu', e: '💄', n: 'Lipstik & make-up', ok: 0, why: 'make-up termasuk larangan ihram' },
  { id: 'parfum', e: '🧴', n: 'Semprot parfum ke pakaian', ok: 0, why: 'wewangian cukup di badan sebelum memakai ihram' },
];

export const Q = {
  miqat: { tag: 'Miqat makani', title: 'Rombongan mengambil miqat di arah Taif. Apa nama miqatnya?', must: true, opts: [
    { t: 'Qarnul Manazil', ok: true, fb: 'Betul. Qarnul Manazil di arah Taif, miqat bagi yang datang dari arah Najd & negara teluk.' },
    { t: 'Bir Ali (Dzulhulaifah)', ok: false, fb: 'Bir Ali adalah miqat bagi yang datang dari arah Madinah.' },
    { t: 'Yalamlam', ok: false, fb: 'Yalamlam miqat bagi yang datang dari arah Yaman.' },
    { t: 'Juhfah', ok: false, fb: 'Juhfah miqat bagi penduduk Syam, Mesir dan sekitarnya.' }] },
  niat: { tag: 'Lafaz niat', title: 'Lafaz niat yang diucapkan?', opts: [
    { t: "<span class='lat'>Labbaika Allahumma 'umratan</span>", ok: true, fb: 'Aku penuhi panggilan-Mu ya Allah, untuk berumroh.' },
    { t: "<span class='lat'>Labbaika Allahumma hajjan</span>", ok: false, kind: 'fatal', fb: 'Itu niat haji. Kita sedang berniat umroh.' },
    { t: "<span class='lat'>Allohummaftahlii abwaaba rohmaatika</span>", ok: false, fb: 'Itu doa masuk masjid.' }] },
  lewatMiqat: { tag: 'Uji pemahaman', title: 'Kalau seseorang baru berniat setelah bus melewati Qarnul Manazil?', opts: [
    { t: 'Umroh tetap sah, tapi wajib membayar Dam', ok: true, fb: 'Betul. Niat ihram dari miqat adalah <b>wajib</b> umroh: dilanggar → sah, tapi kena Dam.' },
    { t: 'Umrohnya tidak sah', ok: false, fb: 'Niat dari miqat itu wajib, bukan rukun. Umroh tetap sah dengan membayar Dam.' },
    { t: 'Tidak apa-apa, tanpa konsekuensi', ok: false, fb: 'Ada konsekuensinya: membayar Dam.' }] },
  ihramCara: () => P() ? { tag: 'Cara memakai', title: 'Bagaimana memakai 2 helai kain ihram?', opts: [
    { t: 'Satu disarungkan, satu diselendangkan menutupi bahu kiri, sisi kanan di bawah ketiak', ok: true, fb: 'Betul, sesuai materi manasik.' },
    { t: 'Dijahit sedikit di pinggang supaya tidak melorot', ok: false, kind: 'dam', fb: 'Pakaian ihram pria harus tidak berjahit.' },
    { t: 'Ujung kain atas dipakai untuk menutup kepala', ok: false, kind: 'dam', fb: 'Pria dilarang menutup kepala saat ihram.' }] }
    : { tag: 'Cara memakai', title: 'Batas pakaian ihram wanita?', opts: [
      { t: 'Menutup seluruh aurat kecuali wajah dan kedua telapak tangan', ok: true, fb: 'Betul. Wajah dan telapak tangan tidak boleh ditutup.' },
      { t: 'Menutup seluruh tubuh termasuk wajah dengan cadar', ok: false, kind: 'dam', fb: 'Wanita dilarang menutup wajah saat ihram.' },
      { t: 'Bebas, asal warnanya putih', ok: false, fb: 'Yang utama menutup aurat kecuali wajah & telapak tangan.' }] },
};

export function laranganSet() {
  const all = [
    { tag: 'Di bus', title: 'Kulit kepala terasa gatal sekali.', opts: [{ t: 'Garuk kuat-kuat sampai lega', ok: false, kind: 'dam', fb: 'Dilarang menggaruk sampai kulit terkelupas/berdarah atau rambut tercabut.' }, { t: 'Usap pelan dengan telapak tangan', ok: true, fb: 'Aman: tidak melukai kulit dan tidak mencabut rambut.' }, { t: 'Cabut uban yang bikin gatal', ok: false, kind: 'dam', fb: 'Mencabut rambut termasuk larangan ihram.' }] },
    { tag: 'Di bus', title: 'Kukumu panjang dan mengganggu.', opts: [{ t: 'Gunting sekarang, mumpung bawa gunting kuku', ok: false, kind: 'dam', fb: 'Memotong kuku dilarang saat ihram.' }, { t: 'Biarkan, rapikan setelah tahallul', ok: true, fb: 'Betul. Setelah tahallul, larangan ini kembali halal.' }] },
    { tag: 'Rest area', title: 'Tangan lengket. Teman menawarkan tisu basah beraroma.', opts: [{ t: 'Pakai saja, cuma tisu', ok: false, kind: 'dam', fb: 'Wewangian dilarang, termasuk yang ada pada sabun/tisu.' }, { t: 'Cuci dengan air atau tisu tanpa pewangi', ok: true, fb: 'Tepat. Pilih yang tanpa aroma.' }] },
    { tag: 'Di bus', title: 'Jamaah lain menempati kursimu dan mulai ketus.', opts: [{ t: 'Balas ketus, kursi itu hakmu', ok: false, kind: 'dam', fb: 'Membuat gaduh dan bertengkar termasuk larangan ihram.' }, { t: 'Mengalah, cari kursi lain, perbanyak talbiyah', ok: true, fb: 'Sabar dan menjaga lisan adalah bagian dari ihram.' }] },
    { tag: 'Rest area', title: 'Lalat terus hinggap di makananmu.', opts: [{ t: 'Pukul sampai mati', ok: false, kind: 'dam', fb: 'Membunuh binatang dilarang kecuali yang mengancam jiwa.' }, { t: 'Usir pelan dengan tangan', ok: true, fb: 'Betul. Cukup diusir tanpa membunuh.' }] },
    { tag: 'Rest area', title: 'Ada pohon kurma kecil. Daunnya cantik untuk kenang-kenangan.', opts: [{ t: 'Petik satu helai', ok: false, kind: 'dam', fb: 'Memotong/mencabut tumbuhan hidup termasuk larangan ihram.' }, { t: 'Cukup difoto', ok: true, fb: 'Kenang-kenangan aman tanpa merusak tumbuhan.' }] },
    { tag: 'Di jalan', title: 'Kamu terdorong jamaah lain dan hampir jatuh.', opts: [{ t: 'Spontan mengumpat', ok: false, kind: 'dam', fb: 'Berkata-kata kotor termasuk larangan ihram.' }, { t: 'Istighfar, lalu lanjut', ok: true, fb: 'Jaga lisan; perbanyak dzikir dan talbiyah.' }] },
    { tag: 'Hotel Makkah', title: 'Pasanganmu mengajak bermesraan di kamar sebelum umroh selesai.', opts: [{ t: 'Tunda sampai selesai tahallul', ok: true, fb: 'Betul. Bermesraan dilarang meski dengan pasangan sah, sampai tahallul.' }, { t: 'Tidak apa-apa, kan sudah sah menikah', ok: false, kind: 'dam', fb: 'Larangan ini berlaku meski dalam ikatan pernikahan resmi.' }] },
  ];
  const g = P() ? [
    { tag: 'Siang terik', title: 'Matahari menyengat di kepala.', opts: [{ t: 'Pakai topi sebentar', ok: false, kind: 'dam', fb: 'Pria dilarang memakai penutup kepala (topi, sorban, dll).' }, { t: 'Pakai payung', ok: true, fb: 'Payung tidak menempel di kepala. (Pastikan ke pembimbing untuk rincian fikihnya.)' }] },
    { tag: 'Jalan jauh', title: 'Kaki pegal. Mau ganti alas kaki?', opts: [{ t: 'Pakai sepatu kets yang menutup mata kaki', ok: false, kind: 'dam', fb: 'Pria dilarang memakai alas kaki yang menutup mata kaki.' }, { t: 'Tetap sandal yang mata kakinya terbuka', ok: true, fb: 'Betul.' }] },
  ] : [
    { tag: 'Mau foto', title: 'Teman mengajak foto. Wajah kelihatan pucat.', opts: [{ t: 'Oles lipstik tipis-tipis', ok: false, kind: 'dam', fb: 'Make-up termasuk larangan ihram.' }, { t: 'Foto apa adanya', ok: true, fb: 'Tepat. Cantiknya nanti setelah tahallul 😉' }] },
    { tag: 'Dingin AC', title: 'Bus sangat dingin, tangan beku.', opts: [{ t: 'Pakai sarung tangan', ok: false, kind: 'dam', fb: 'Wanita dilarang menutup telapak tangan.' }, { t: 'Masukkan tangan ke lengan gamis/selimut', ok: true, fb: 'Aman: tidak memakai penutup khusus telapak tangan.' }] },
  ];
  return shuffle([...pick(all, 4), ...g]);
}

export const HARAM_Q = {
  masuk: { tag: 'Adab masuk', title: 'Masuk masjid dengan…', opts: [
    { t: "Kaki kanan, membaca <span class='lat'>Allohummaftahlii abwaaba rohmaatika</span>", ok: true, fb: 'Ya Allah, bukakanlah untukku pintu-pintu rahmat-Mu.' },
    { t: "Kaki kiri, membaca <span class='lat'>Allahumma inni as-aluka min fadhlik</span>", ok: false, fb: 'Kaki kiri dan doa itu untuk <b>keluar</b> masjid.' }] },
  lihat: { tag: 'Pertama kali melihat', title: "Ka'bah terlihat di depan mata. Doa yang dibaca?", opts: [
    { t: "<span class='lat'>Allahumma zid hâdzal baita tasyrîfan wa ta'dzîman wa takrîman wa mahâbatan…</span>", ok: true, fb: 'Ya Allah, tambahkanlah kemuliaan, kehormatan, keagungan dan kehebatan pada Baitullah ini…' },
    { t: "<span class='lat'>Robbanaa aatinaa fid-dunyaa hasanah…</span>", ok: false, kind: 'miss', fb: "Doa itu dibaca saat thawaf, di antara Rukun Yamani dan Hajar Aswad." },
    { t: "<span class='lat'>Wattakhidzu mim maqoomi ibroohiima musholla</span>", ok: false, kind: 'miss', fb: 'Itu dibaca saat menuju Maqam Ibrahim setelah thawaf.' }] },
  tertib: { tag: 'Tertib', title: 'Ibadah apa yang dikerjakan pertama?', must: true, opts: [
    { t: 'Thawaf', ok: true, fb: "Betul. Urutan rukun: Ihram → Thawaf → Sa'i → Tahallul. Tertib adalah rukun." },
    { t: "Sa'i dulu, mumpung Shafa sepi", ok: false, kind: 'fatal', fb: "Tertib adalah rukun. Sa'i sebelum thawaf merusak urutan." },
    { t: 'Tahallul dulu biar segar', ok: false, kind: 'fatal', fb: 'Tahallul adalah penutup umroh, bukan pembuka.' }] },
  idhthiba: { tag: 'Kain ihram', title: 'Posisi kain atas pria saat thawaf?', opts: [
    { t: 'Bahu kanan terbuka: kain lewat bawah ketiak kanan, menutup bahu kiri', ok: true, fb: 'Betul. Setelah thawaf, kedua pundak ditutup kembali.' },
    { t: 'Kedua bahu tertutup rapat', ok: false, kind: 'miss', fb: 'Saat thawaf bahu kanan dibuka; ditutup kembali setelah thawaf.' }] },
  r1: { tag: 'Sholat di Maqam Ibrahim', title: 'Rakaat pertama, setelah Al-Fatihah membaca…', opts: [{ t: 'Al-Kafirun', ok: true, fb: 'Betul.' }, { t: 'Al-Ikhlas', ok: false, kind: 'miss', fb: 'Al-Ikhlas untuk rakaat kedua.' }, { t: 'An-Nas', ok: false, kind: 'miss', fb: 'Rakaat 1 Al-Kafirun, rakaat 2 Al-Ikhlas.' }] },
  r2: { tag: 'Sholat di Maqam Ibrahim', title: 'Rakaat kedua?', opts: [{ t: 'Al-Ikhlas', ok: true, fb: 'Betul.' }, { t: 'Al-Kafirun', ok: false, kind: 'miss', fb: 'Al-Kafirun untuk rakaat pertama.' }, { t: 'Al-Falaq', ok: false, kind: 'miss', fb: 'Yang disunnahkan Al-Ikhlas.' }] },
  zamzam: { tag: 'Air zamzam', title: 'Cara minum zamzam yang disunnahkan?', opts: [{ t: "Sambil berdiri menghadap Ka'bah, juga menyiramkan ke kepala", ok: true, fb: 'Betul, sesuai materi manasik.' }, { t: "Duduk membelakangi Ka'bah", ok: false, kind: 'miss', fb: "Disunnahkan berdiri menghadap Ka'bah." }] },
};

export const SAI_Q = {
  shafa: { tag: 'Mendekati Shafa', title: 'Bacaan saat mendekati Shafa?', opts: [
    { t: "<span class='lat'>Innash shafaa wal marwata min sya'aairillah</span>, lalu <span class='lat'>Nabda-u bimaa bada-allaahu bih</span>", ok: true, fb: 'Sesungguhnya Shafa dan Marwah adalah sebagian dari syiar Allah (QS. Al-Baqarah: 158).' },
    { t: "<span class='lat'>Labbaika Allahumma 'umratan</span>", ok: false, kind: 'miss', fb: 'Itu lafaz niat di miqat.' }] },
  hitung: { tag: 'Hitung putaran', title: 'Shafa → Marwah → Shafa dihitung berapa putaran?', opts: [{ t: '2 putaran', ok: true, fb: 'Betul. Tiap perjalanan satu arah = 1 putaran, maka putaran ke-7 berakhir di Marwah.' }, { t: '1 putaran', ok: false, fb: 'Tiap perjalanan satu arah dihitung 1 putaran.' }] },
  tahallul: () => P() ? { tag: 'Tahallul', title: 'Pilih cara tahallul', opts: [
    { t: 'Cukur gundul', ok: true, bonus: true, okTitle: 'Paling afdhal ✔', fb: 'Mencukur gundul adalah yang paling utama bagi pria.' },
    { t: 'Memendekkan seluruh rambut kepala', ok: true, fb: 'Sah. Tapi mencukur gundul lebih afdhal.' },
    { t: 'Menggunting minimal 3 helai', ok: true, fb: 'Sah, ini batas minimal. Mencukur gundul lebih afdhal.' },
    { t: 'Tidak usah, langsung ganti baju di hotel', ok: false, kind: 'fatal', fb: 'Tahallul adalah rukun. Tanpa tahallul, umroh belum selesai.' }] }
    : { tag: 'Tahallul', title: 'Pilih cara tahallul', opts: [
      { t: 'Potong ujung rambut sepanjang satu ruas jari, tanpa memperlihatkan rambut', ok: true, fb: 'Betul. Lakukan di tempat tertutup atau dari balik jilbab.' },
      { t: 'Buka jilbab di pelataran agar mudah dipotong', ok: false, fb: 'Wanita tidak diperkenankan memperlihatkan rambut.' },
      { t: 'Tidak usah, langsung ganti baju di hotel', ok: false, kind: 'fatal', fb: 'Tahallul adalah rukun. Tanpa tahallul, umroh belum selesai.' }] },
  teman: { tag: 'Bantu teman', title: 'Teman serombongan minta digunting rambutnya. Kamu sendiri belum tahallul.', opts: [{ t: 'Gunting rambut sendiri dulu, baru bantu teman', ok: true, fb: 'Betul. Boleh menggunting rambut orang lain setelah menggunting rambut sendiri.' }, { t: 'Langsung bantu teman dulu', ok: false, kind: 'dam', fb: 'Kamu masih berihram: menggunting rambut orang lain baru boleh setelah kamu sendiri bertahallul.' }] },
  keluar: { tag: 'Keluar masjid', title: 'Saat keluar masjid, doa yang dibaca?', opts: [{ t: "<span class='lat'>Allahumma inni as-aluka min fadhlik</span>", ok: true, fb: 'Ya Allah, aku memohon kepada-Mu dari karunia-Mu.' }, { t: "<span class='lat'>Allohummaftahlii abwaaba rohmaatika</span>", ok: false, kind: 'miss', fb: 'Itu doa masuk masjid.' }] },
};

export const DZIKIR_BUKIT = "<span class='lat'>Allahu akbar ×3. Laa ilaaha illallaahu wahdahu laa syariika lah, lahul mulku wa lahul hamdu yuhyii wa yumiitu wa huwa 'alaa kulli syai-in qodiir. Laa ilaaha illallaahu wahdah, anjaza wa'dah, wa nashoro 'abdah, wa hazamal ahzaaba wahdah.</span>";
export const TALBIYAH = "Labbaik Allahumma labbaik, labbaika laa syariika laka labbaik, innal hamda wan ni'mata laka wal mulk, laa syariika lak";
