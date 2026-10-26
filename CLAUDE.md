# Aksa si Pemadam Cilik — catatan untuk Claude

Game web pixel art untuk anak pemilik repo (6 tahun) belajar lewat petualangan ala Pokemon,
dimainkan di **iPad (Safari / Tambahkan ke Layar Utama)** lewat GitHub Pages:
https://radmahardika.github.io/Game-Aca/

## Aturan kerja (wajib)

1. **Selalu pakai Bahasa Indonesia** saat berbicara dengan pengguna.
2. **Tunjukkan visual dulu sebelum mengerjakan.** Untuk fitur/perubahan baru: diskusikan konsep,
   buat mockup/screenshot, kirim ke pengguna, tunggu persetujuan.
3. **Kerjakan di branch pratinjau** (`pratinjau-vN`, N = versi berikutnya), commit & push branch itu,
   kirim screenshot hasilnya. **Gabungkan ke `main` hanya setelah pengguna bilang "gabungkan"**
   (fast-forward merge, lalu push `main`). `main` = versi yang dimainkan anak.
4. Setiap rilis ke `main`: naikkan `G.VERSION` di `js/game.js` dan semua `?v=N` di `index.html`
   (cache iPad). Layar judul menampilkan "versi N".
5. **Teks Al-Qur'an tidak boleh diketik sendiri.** Ambil dari sumber lewat
   `tools/ambil-juzamma.mjs` (equran.id/Kemenag + audio everyayah.com) dan minta orang tua mengecek.
   Ayat tidak boleh dipakai sebagai "senjata"; wilayah Juz Amma tanpa battle.
6. Sebelum push: syntax-check semua `js/*.js` dan tes alur dengan Playwright (lihat Pengujian).

## Profil anak (dasar tingkat kesulitan)

- Bisa membaca kalimat pendek. Iqra baru awal → untuk Al-Qur'an pakai **teks Latin + suara**, bukan teks Arab.
- Berhitung: tambah & kurang sampai 20; perkalian hasil ≤ 15 (hanya **1 soal** di seluruh Desa Ceria).
- Surat yang sudah dipelajari (21): Al-Fatihah, An-Nas, Al-Falaq, Al-Ikhlas, Al-Lahab, An-Nashr,
  Al-Kafirun, Al-Kautsar, Al-Ma'un, Quraisy, Al-Fil, Al-Humazah, Al-'Ashr, At-Takatsur, Al-Qari'ah,
  Al-'Adiyat, Az-Zalzalah, Al-Bayyinah, Al-Qadr, At-Tin, Al-Insyirah.

## Keputusan desain yang sudah disepakati

- **Aksa** (pemain): pemadam kebakaran cilik, seragam merah klasik, kulit sawo cerah, rambut buzzcut, badan berisi.
- **Ara** (partner): **mobil pemadam kebakaran mini** (bukan honey badger lagi). Berperan sebagai
  **asisten pengingat**: bilang "tinggal N lagi" + siapa saja (saat game dibuka, setelah satu tugas
  selesai, dan saat Ara didekati lalu tekan A). Aksesori (kunci simpan lama dipertahankan):
  helm = Sirene Ganda, syal = Stiker Bintang, kacamata = Kacamata Keren, sepatu = Velg Emas, jubah = Bendera Pahlawan.
- **Dunia top-down ala Pokemon**, gerak bebas. Kontrol: **analog stik melayang** (muncul di bawah jari,
  60% kiri layar). **Tidak ada** tombol arah dan **tidak ada** ketuk-untuk-jalan. Tombol **A** tetap ada
  dan bersinar saat dekat warga (Ara tidak memicu sinar).
- **Tanpa narasi suara.** Hanya musik latar chiptune (desa & battle) + efek suara; bisa dimatikan.
- Ukuran tulisan sudah oke.
- **Desa Ceria (berhitung):** 6 masalah bebas urutan (kucing, api daun, toko roti, truk, anak ayam,
  hidran), **Raja Api Jahil** muncul setelah keenamnya selesai. Semua dalam **format battle**:
  3 jawaban saja (**tanpa Bantuan Ara**), jawaban salah → **soal langsung diganti soal baru**, tidak ada kalah.
  Saat menyemprot, Aksa **memegang selang dengan lengan terangkat**, air keluar dari ujung nozzle
  (jangan dari area pinggang/bawah).
- **Kampung Hijau (Juz Amma) — "Perjalanan Menuju Porseni":** bisa dipilih kapan saja dari layar judul.
  Jemput 4 teman TPA (Dika, Salma, Umar, Aisyah; 5 surat masing-masing), murajaah 5 soal
  (Sambung Ayat & Tebak Surat), teman lalu ikut rombongan. Finale di panggung Porseni bersama
  Ustadz Hasan: Susun Ayat (ketuk berurutan) & Kata yang Hilang. Audio: **Syaikh Al-Husary Mu'allim**.
  Teks ditampilkan sebagai bacaan waqaf (akhiran dalam kurung dibuang).

## Game kedua: Penjaga Rimba (`penyelamat/`, dulu "Duo Penyelamat" / "Tim Penyelamat Malam")

Game terpisah di folder `penyelamat/` (link: https://radmahardika.github.io/Game-Aca/penyelamat/), versi sendiri
(`TPM.VERSION` di `penyelamat/js/data.js` + `?v=N` di `penyelamat/index.html`). Tujuan: survival & problem solving,
**dimainkan anak + orang tua di dua iPad** (atau satu iPad bergantian).

- **Halaman awal** (`js/splash.js`, v9): malam di Pohon Sarang, Benhat berdiri, Tutu terbang berputar, hewan melompat,
  judul "Penjaga Rimba" + tombol "▶ Ketuk untuk mulai" (sekaligus membuka suara iPad) → menu judul.
- First person **3D pixel** (raycasting), malam gelap tapi tidak horor. Kontrol: analog melayang di 60% kiri layar
  (atas/bawah = maju/mundur, kiri/kanan = belok; kecepatan sudah diturunkan atas permintaan pengguna).
- **Tutu** — "Burung Hantu yang suka membantu" (kecil & gesit; dulu bernama Sinar): melihat dalam gelap (lingkaran redup kehijauan), terbang melintasi sungai,
  tombol ⭐ Tandai (terlihat di layar Benhat). Tidak bisa membawa alat.
- **Benhat** — "Si Beruang Hebat" (kuat, helm kuning; dulu bernama Tangguh, lalu Siberat): layar hampir gelap total; hanya melihat mata kuning Tutu, bintang tanda,
  gelombang suara 🔊 korban. Tidak bisa masuk sungai (lewat jembatan), lambat di lumpur. Tombol A.
- **3 level** (v9): pilih level setelah "Main sendiri" / pilih peran (tuan rumah); level berikutnya terbuka setelah
  level sebelumnya selesai. Hewan boleh muncul lagi di level lain tapi **kasusnya selalu berbeda** (`T.VICTIMS`: `id` =
  kasus, `sp` = jenis hewan/sprite, `lv` = level). Level 1 "Malam Bulan Purnama": 5 hewan, 1 alat, tanpa jembatan,
  Benhat sedikit lebih terang. Level 2 "Malam Bulan Separuh" = isi lama (10 hewan, id lama). Level 3 "Malam Gerimis
  Berkabut": 15 hewan (10 kasus baru + bebek, penyu, burung hantu kecil, anak ayam hutan, kancil), kabut & gerimis
  (pandangan Tutu pendek), jembatan baris 19 & 33 putus (FLOOR 7) → Benhat perbaiki dengan 🪵 papan (aksi `fix`),
  alat baru ✂️ gunting tumpul & 🧺 keranjang, `need: []` = cukup tenaga Benhat (💪), anak ayam berlari (`run`, posisi
  dari jam dinding `T.runPos`) sampai ditandai ⭐, petunjuk 💡 baru muncul setelah ±5 detik. Simpanan per level di kunci
  `penyelamat-v2` (`{unlocked, done, lv:{n:{world,players,seen}}}`); simpanan lama `penyelamat-malam-v1` jadi Level 2.
  Tamu versi lama ditolak dengan pesan "tutup game di iPad teman lalu buka lagi".
- **Dunia terbuka**, urutan bebas, posisi korban **diacak** tiap main (titik tetap per zona). Kasus Level 2:
  kelinci (sungai: pelampung+tali), rusa (perban), landak (tongkat), kambing (selimut+peluit), rubah (gua berasap: kain
  basah), anak kerbau (lumpur: papan), anak kucing (pohon: tangga), + v8: anak monyet (lubang: tali), anak burung pipit
  (jatuh dari sarang: tangga), tupai kecil (demam: kain basah untuk kompres). Simpanan lama otomatis ditambah hewan baru
  (`T.addMissing`). Tiap selesai muncul pesan dunia nyata.
- Pusat: **Pohon Sarang** (beringin berlubang + kunang-kunang; BUKAN perkemahan manusia). Alat diambil di sana.
  **Tas 3 kotak**, papan & tangga = 2 kotak → harus memilih. Salah alat tidak kalah. Hewan selamat pindah ke sarang,
  lokasinya jadi terang kunang-kunang.
- Multiplayer: PeerJS (`penyelamat/vendor/peerjs.min.js` 1.5.5, server sinyal publik 0.peerjs.com). Pembuat ruangan =
  tuan rumah yang memegang dunia & menyimpan progres (`localStorage` kunci `penyelamat-v2`); kode ruangan 4 gambar.
  Tamu mengirim aksi (`mark`, `bag`, `rescue`), tuan rumah membalas `world`/`ev`. Detak 4 detik → banner terputus,
  tamu menyambung ulang otomatis.
- Uji multiplayer lokal: jalankan server PeerJS (`npm i peer`, `PeerServer({port:9000,host:'127.0.0.1',path:'/'})`)
  lalu buka `penyelamat/?peer=127.0.0.1:9000` di dua konteks Playwright. `TPM.debug` (place, act, swap, doA, doMark, ...),
  `TPM.S` = keadaan.

## Game ketiga: Angkasa Mart (`angkasa-mart/`)

Game terpisah (link: https://radmahardika.github.io/Game-Aca/angkasa-mart/), versi sendiri (`AM.VERSION` di
`angkasa-mart/js/data.js` + `?v=N` di `angkasa-mart/index.html`). Tujuan: melatih jiwa wirausaha, peka peluang & riset pasar.

- Gaya **pixel art detail** (ala Moonlighter/Kingdom: latar berlapis, kabut, cahaya lentera), BUKAN pixel polos game Aksa.
  Kanvas 392×272 diperbesar 3× → panggung 1176×816 yang di-skala agar pas layar; UI = DOM di atasnya (huruf Pixelify Sans).
- **Angkasa** (anak bumi, wajah seperti Aksa, baju astronot + helm kaca) punya toko di stasiun luar angkasa.
  **Rotni** = robot mini sahabat: saran kecil di kiri atas + kurir yang terbang ke Bumi membeli barang.
- Satu hari: **Kabar Angkasa** (tren) → **Survei** (4 energi tanya; alien di planet = calon pembeli hari itu; Catatan Survei
  turus + ❤) → **Pesan ke Bumi** (katalog, Kotak Rotni 4, gudang 6 terbatas; Rotni membacakan daftar & total; barang lama
  bisa dikembalikan setengah harga) → **Toko buka** (5–10 pembeli; pasang harga –/+, reaksi baru muncul setelah **Tawarkan**;
  kemahalan → alien menawar balik, ditolak → pergi sedih; barang tak ada → dicatat) → **Tutup toko** (Buku Kas: modal barang
  terjual → hasil → untung; Catatan pembeli; bagi untung ke toples Tabung / Modal besok / Berbagi; kemajuan).
- Planet: **Tundra** (selimut, termos), **Fores** (payung, senter), **Peri** (kipas, kacamata hitam, kerupuk; terbuka di
  tahap Mart); sikat gigi untuk semua. Tren = 3 hati, mau bayar sampai beli+4.
- Tahap toko menurut total untung: Lapak (0) → Toko (20, mulai latihan kembalian dari 10 ★) → Mart (50) → Stasiun (100).
- **Toples Berbagi (pilihan A)**: sesekali alien butuh bantuan muncul di antrean ("bintangku cuma 1…"); anak memilih
  Beri (toples menutup modal − 1) atau Maaf ya, tanpa hukuman/balasan untung; hadiahnya stiker di **Buku Kebaikan**.
- **Toples Tabung** = memperbesar toko: tombol 🫙 di layar Pesan ke Bumi → +1 kotak gudang (5/7/9/11 ★, maks +4) atau
  +1 kotak Rotni (8/12 ★, maks +2), menumpuk dengan kapasitas tahap (`AM.UPGRADE`, `S.up`).
- **Naik tingkat** → ucapan "Selamat! … Kamu berhasil mengelola keuangan dengan baik!" + confetti, Angkasa & Rotni,
  ringkasan total untung / ditabung / dibagi (`S.ditabung`, `S.dibagi`) + hadiah tahap.
- **v2 (masukan anak & orang tua):** catatan survei mini di layar Pesan + Rotni mengingatkan kalau barang paling dicari
  belum dibawa; pengingat harga saat barang ❤❤❤ ditawarkan ≤ harga beli (Naikkan/Tetap); kembalian salah → pembeli protes
  "kurang/kelebihan" + alat bantu 10 bintang dicoret, tidak pergi sampai benar; **Hiasan** dari Tabung (`AM.HIASAN`, `S.hias`:
  lampu, tanaman, poster, papan emas, karpet, balon; tampil di toko, kadang dipuji pembeli); **Alien Usil** (ide anak):
  mulai tahap Toko ±30% hari ada peringatan di Kabar (`today.warn`) → saat tutup toko (jika gudang berisi) tawaran sewa
  **Kurcaci Penjaga** 3 ★ dari kas (`AM.SEWA_PENJAGA`, dicatat sebagai biaya di Buku Kas) → layar Malam: dijaga = pencuri
  diusir, tidak = 1–2 barang gudang dicuri (uang tidak pernah dicuri).
- Simpanan `localStorage` kunci `angkasa-mart-v1`. Tes: `AM.debug` (S, V, go, act, newDay; `V.forceChange` = paksa kembalian).

## Game keempat: Tunggu Dulu! (`tunggu-dulu/`)

Game terpisah (link: https://radmahardika.github.io/Game-Aca/tunggu-dulu/), versi sendiri (`TD.VERSION` di
`tunggu-dulu/js/data.js` + `?v=N` di `tunggu-dulu/index.html`). Tujuan: **ketelitian & tanggung jawab** (mekanik ala Papers Please).

- Pemain = **kurcaci penjaga muda** di gerbang Desa Kurcaci; troll jahat menyamar jadi kurcaci untuk mencuri
  **hasil panen** (madu, apel, labu, roti untuk Pesta Panen; dulu permata, diganti agar lebih ramah anak).
  **Sudut pandang orang pertama** dari dalam pos jaga (jendela loket, meja, tangan penjaga).
- Gaya visual **ilustrasi buku cerita anak** (guas + pensil warna, tanpa garis tinta, palet hangat peach/hijau zaitun/terakota,
  lentera berpendar, wajah mata titik & pipi merona). Semua gambar SVG di `js/art.js` (filter `rough` + tekstur kertas);
  lapisan statis (pemandangan, pos jaga, tekstur) dilukis sekali ke kanvas (`A.raster`) supaya iPad ringan. Huruf Andika.
- Periksa 3 hal: **identitas** (Kartu Warga: foto topi/janggut/kacamata, cap ⭐ Tetua), **barang bawaan** (buka tas,
  cocokkan dengan daftar; troll bawa karung/jaring/palu atau jumlah beda), **fisik** (🔍 kaca pembesar = lensa yang digeser
  di jendela → telinga hijau runcing; 🔦 senter → bayangan bertanduk). 📯 Tetua = daftar centang hal yang sudah diperiksa.
  Stempel **BOLEH MASUK** / **TUNGGU DULU!**; belum melihat kartu → Tetua: "Tunggu dulu! Periksa kartunya dulu".
- 5 hari, aturan bertambah 1 per hari (foto → cap → bawaan → fisik → semua). 6 tamu/hari, troll 2 (hari 5: 3);
  tamu pertama tiap hari selalu kurcaci jujur. Hasil tiap tamu: pita hijau/merah/oranye + alasan/petunjuk yang terlewat.
- **Reputasi** 5 perisai: troll lolos −1 (panen −1 🧺) + **lembur** besok (+2 tamu: 1 troll + 1 kurcaci); kurcaci jujur
  ditolak −½; perisai habis → ulangi hari (perisai jadi maks(awal hari, 3), panen dikembalikan); hari tanpa kesalahan +1.
- Layar: judul → cerita Tetua (5 halaman) → pagi (aturan BARU) → loket → laporan malam → ... → Pesta Panen.
  Laporan & Pesta Panen = **bentangan buku cerita** (`js/buku.js`, sesuai referensi pengguna): halaman kiri senja desa + kalimat
  cerita di langit (penjaga muda & Tetua), halaman kanan malam + lingkaran cahaya lentera, warga yang diterima hari itu
  berkumpul, panel gelembung pikiran (troll ketahuan, kurcaci masuk, keranjang panen, troll lolos/kesalahan/tanpa salah).
- Simpanan `localStorage` kunci `tunggu-dulu-v1` (`{hari, rep, panen, lembur, mulai, selesai}`, disimpan di akhir hari).
  Tes: `TD.debug` (`day(n)`, `guest({...})`, `decide`, `act`, layar-layar), `TD.S` = keadaan.

## Status & yang sedang dibahas

- Rilis terakhir di `main`: **versi 21** = **Tunggu Dulu! versi 3** = alat bisa berganti saat kaca pembesar aktif (tombol alat ada di
  ambang jendela, dulu ketukannya dianggap menggeser lensa → sekarang ketukan pada `[data-act]` selalu didahulukan).
- Versi 20 = **Tunggu Dulu! versi 2** = perbaikan iPad:
  (1) layar terpotong saat landscape → `fit()` memakai `visualViewport` + area aman (`env(safe-area-inset-*)`),
  diukur ulang setelah iPad diputar; (2) **ketukan di meja tidak sampai** karena `svg#ui` menutupi layar →
  `#ui { pointer-events: none }`, hanya `[data-act]` yang bisa diketuk. Tes wajib pakai ketukan sungguhan
  (`page.touchscreen.tap` / `elementFromPoint`), bukan `dispatchEvent` langsung ke tombol.
- Versi 19 = **Tunggu Dulu! versi 1** (game keempat, `tunggu-dulu/`, lihat atas). Branch `pratinjau-v19` berisi Angkasa Mart
  versi 3 (sesi lain, belum digabung) → kalau dirilis, nomornya versi berikutnya setelah 21.
- Versi 18 = **Angkasa Mart versi 2** (lihat bagian v2 di atas). Laporan pengguna v1: lancar,
  anak suka, sudah menyisihkan untuk Berbagi & menabung.
- Versi 17 = rilis **Angkasa Mart versi 1** (`angkasa-mart/`, termasuk Tabung untuk
  memperbesar toko & ucapan naik tingkat). Game Aksa & Penjaga Rimba tidak berubah.
- Versi 16 (game Aksa sama dengan versi 7) +
  **Penjaga Rimba versi 9** di `penyelamat/`: 3 level (lihat atas) + judul baru **"Penjaga Rimba"** + halaman awal,
  plus perbaikan garis hitam kecil di tepi sprite jauh (indeks sprite negatif). Riwayat: v8 3 hewan baru (total 10), Benhat lebih besar, adegan penutup; v7 cahaya samar Benhat + kunang-kunang di ujung jembatan; v6 pesan selamat sampai Oke, panel alat kecil di kanan,
  lampu sorot Tutu; v5 judul "Duo Penyelamat" + petunjuk 💡 alat untuk Tutu (`hint` di `T.VICTIMS`, tidak menyebut
  nama alat); v4 Tutu terbang & lebih cepat, nama Benhat; v3 perbaikan rotasi iPad.
- Laporan pengguna: **main berdua di dua iPad sudah berhasil**.
- Isi v6: (1) pesan "X selamat!" tetap tampil sampai tombol **Oke 👍** ditekan (pesan lain tampil sesuai
  panjang tulisan, tidak menimpa pesan yang sedang dibaca; layar akhir muncul setelah Oke terakhir); (2) alat di Pohon Sarang
  jadi **panel kecil di kanan** (tanpa latar gelap, Benhat tetap bisa berjalan, panel tertutup sendiri saat menjauh);
  (3) **lampu sorot Tutu**: cahaya hangat di sekitar + sorot ke depan ±9 langkah, hanya di layar Tutu.
- Isi v7: cahaya samar untuk Benhat (radius 3,5, masih gelap) + kunang-kunang di kedua ujung tiap
  jembatan (`T.BRIDGE_LIGHTS`, terlihat kedua peran) supaya mudah menyeberang.
- Isi v8: 3 hewan baru (total 10) + Benhat lebih besar di layar Tutu (tinggi 1,25 dari 0,95);
  keterangan Tutu memilih hewan terdekat yang sedang dilihat; layar judul tidak lagi menyimpan dunia latar sebagai progres;
  cahaya dibatasi supaya pohon dekat tidak silau.
- Juga v8: **adegan penutup** setelah 10 hewan selamat (`penyelamat/js/ending.js`): malam → pagi di
  Pohon Sarang, semua hewan (versi sudah sembuh `T.SPR_FREE`) melompat, hati beterbangan, Tutu terbang berputar, Benhat
  di tengah; kalimat "Kamu jago sekali, terus menolong sesama ya!" muncul detik ke-2,5, tombol detik ke-5.
- Belum diputuskan: pengguna bertanya suara **metode Ummi**. Rekaman Ummi tidak tersedia bebas.
  Opsi yang ditawarkan: (1) mode rekam suara orang tua/ustadzah per ayat di iPad (fallback Al-Husary),
  (2) file audio Ummi dari TPA dengan izin, (3) pilihan qari lain di Pengaturan — tersedia di everyayah:
  `Minshawy_Teacher_128kbps` (ada suara anak menirukan), `Alafasy_128kbps`,
  `Abdul_Basit_Murattal_192kbps`, `Muhammad_Ayyoub_128kbps`, `Minshawy_Murattal_128kbps`.
- Ide wilayah berikutnya: studi kasus moral (mis. menolong teman yang dibully).

## Struktur kode

- `index.html`, `css/style.css` — halaman & UI (DOM di atas kanvas pixel).
- `js/sprites.js` — semua pixel art (Aksa 4 arah, Ara mobil 4 arah + aksesori, warga, ikon).
- `js/audio.js` — efek suara & musik chiptune WebAudio (`G.music`, `G.musicHold`).
- `js/world.js` — partikel, gambar tampak samping (truk, toko roti, pohon), layar judul.
- `js/overworld.js` — mesin dunia top-down multi-peta (`G.MAPS`), analog stik, Ara & teman mengikuti jejak.
- `js/missions.js` — data & dialog Desa Ceria. `js/battle.js` — layar battle.
- `js/kampung.js` — peta & cerita Kampung Hijau. `js/murajaah.js` — layar murajaah & panggung.
- `data/juzamma.js`, `audio/husary-muallim/` — dibuat oleh `tools/ambil-juzamma.mjs`.
- `js/game.js` — alur utama, simpan progres (`localStorage` kunci `aksa-pemadam-v2`), koleksi, pengaturan.

## Pengujian

- Server: `npx http-server -p 8080 -s -c-1 .`
- Playwright tersedia di `/opt/node22/lib/node_modules/playwright` (Chromium sudah terpasang).
  Uji di viewport iPad 1180×820 (juga 1024×768). `G.debug` berisi pintasan (enterWorld, fight, showCollection, ...).
  `G.world.place(x, y, dir)` untuk memindah Aksa saat tes; `G.murajaah.current()` = soal aktif.
- Unduh data dari internet di lingkungan cloud: `NODE_USE_ENV_PROXY=1 node tools/ambil-juzamma.mjs`
  (domain everyayah.com & equran.id sudah diizinkan di environment).
