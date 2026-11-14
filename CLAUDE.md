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
- **v3 (uang anak menumpuk: hari 34, kas 80):** tombol **🏪 Kelola Toko** (Pesan & Tutup toko) dengan tab Perbesar /
  Hiasan / Pegawai / Asuransi / Cabang, bayar dari **Tabung atau Kas** (`V.pay`). Hiasan punya daya tarik (`dt`): tiap 2 ⭐ =
  +1 pembeli/hari, maks +4; hiasan baru neon 8, patung Rotni 12, air mancur 15, panggung musik 20 ★. **Kiki si Kasir Cilik**
  (`S.pegawai`, gaji 3 ★/hari) menjual 2 barang gudang saat tutup toko. **Asuransi** 1 ★/hari. **Bencana** (meteor/debu/gempa,
  mulai tahap Toko, jeda ≥6 hari, ±15%, diramalkan di Kabar) → malam: atap bocor (`S.rusak`: pembeli −2, gudang −2) → renovasi
  12 ★ dari Kas/Tabung atau nanti; diasuransikan = tukang kurcaci gratis. **Cabang** Tundra/Fores/Peri 60/80/100 ★ dicicil
  (`S.cabangSaved`, `S.cabang`), +3 ★/hari. **Sewa tempat** 1–2 ★/hari. **Barang premium** (mulai Mart): teleskop 7,
  sepeda roket 9, mahkota bunga 6; harga jual s.d. 15, jarang dicari, kadang tren di Kabar. Semua biaya & pemasukan dihitung
  sekali di `settle()` saat tutup toko dan tampil rinci di Buku Kas. **Berbagi tiap 20 hari** (`today.sedekah`): Panti Asuhan
  atau Jumat Berkah, jumlah –/+ dari Kas, adegan pendek (`art.sedekahScene`), stiker 🏠/🕌 di Buku Kebaikan (disebut
  "berbagi/sedekah", bukan zakat).
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
  di jendela → telinga hijau runcing; 🔦 senter → bayangan bertanduk). **Tidak ada bantuan Tetua** (tombol 📯 dihapus di v4
  atas permintaan pengguna). Stempel **BOLEH MASUK** / **TUNGGU DULU!**; belum melihat kartu → "Tunggu dulu! Periksa kartunya dulu".
- **10 hari** (v4). Hari 1–5: aturan bertambah (foto → cap → bawaan → fisik → semua). Hari 6: **📖 Buku Warga** (tombol Buku di
  ambang, buku terbuka menutupi papan dinding kanan; 12 warga) → nama troll mirip (tukar/ganti huruf: BOLRI ≠ BORLI). Hari 7: rumah
  harus sama dengan buku. Hari 8: penyamaran rapi (foto beda **pompom topi / panjang janggut / kacamata**, tas 3 jenis barang) +
  **kurcaci jujur berhiasan** (`TD.HIASAN`: syal hijau, bulu di topi → bayangan 1 bulu ≠ 2 tanduk, sarung tangan hijau). Hari 9:
  **cap palsu** (bintang 4 biru; asli bintang 5 merah). Hari 10: semua, 10 tamu, 1 petunjuk per troll. Tamu/troll per hari di
  `TD.TAMU_PER_HARI` / `TD.TROLL_PER_HARI`; pesan pagi hari tanpa aturan baru di `TD.PESAN_PAGI`. Tamu pertama tiap hari selalu kurcaci jujur. Hasil tiap tamu: pita hijau/merah/oranye + alasan/petunjuk yang terlewat.
- **Reputasi** 5 perisai: troll lolos −1 (panen −1 🧺) + **lembur** besok (+2 tamu: 1 troll + 1 kurcaci); kurcaci jujur
  ditolak −½; perisai habis → ulangi hari (perisai jadi maks(awal hari, 3), panen dikembalikan); hari tanpa kesalahan +1.
- Layar: judul → cerita Tetua (5 halaman) → pagi (aturan BARU) → loket → laporan malam → ... → Pesta Panen.
  Laporan & Pesta Panen = **bentangan buku cerita** (`js/buku.js`, sesuai referensi pengguna): halaman kiri senja desa + kalimat
  cerita di langit (penjaga muda & Tetua), halaman kanan malam + lingkaran cahaya lentera, warga yang diterima hari itu
  berkumpul, panel gelembung pikiran (troll ketahuan, kurcaci masuk, keranjang panen, troll lolos/kesalahan/tanpa salah).
- Simpanan `localStorage` kunci `tunggu-dulu-v1` (`{hari, rep, panen, lembur, mulai, selesai}`, disimpan di akhir hari);
  simpanan yang tamat di versi 5 hari otomatis lanjut ke Hari 6.
  Tes: `TD.debug` (`day(n)`, `guest({...})`, `decide`, `act`, layar-layar), `TD.S` = keadaan.

## Game kelima: Njajan Fest (`njajan-fest/`)

Game terpisah (link: https://radmahardika.github.io/Game-Aca/njajan-fest/), versi sendiri (`NF.VERSION` di
`njajan-fest/js/data.js` + `?v=N` di `njajan-fest/index.html` dan import `?v=N` di `js/main.js`). Tujuan: belajar
**menjadi event organizer** (merencanakan & mengatur festival kuliner), target = jumlah tamu + untung (+ tamu senang).

- **Visual gaya ISLANDERS** (low-poly pastel, efek miniatur/tilt-shift) dengan **Three.js** (`vendor/three.module.min.js` r170,
  ES module). Venue = **daun teratai raksasa** di Kerajaan Telaga (Raja Kura-kura); bangunan dari ranting, daun, kelopak, cangkang.
  Semua model di `js/models.js` (diambil dari mockup `mockup-festival/islanders.html`); geometri statis digabung (`mergeStatic`)
  supaya ringan di iPad. Huruf Nunito + Fredoka (logo). Mockup lama (gaya Godus/Townscaper/teratai) ada di `mockup-festival/`.
- **3 tokoh dipilih di awal** (bintang dicatat per tokoh, bisa ganti): Tiko si Berang-berang (bakat Hemat Bangun: lapak & bangku
  −1 🪙; jurus Bangun Kilat: daun baru + lapak gratis), Bebi si Anak Bebek (Sapaan Hangat: tamu lebih sabar, lapak +1 porsi;
  Kwek Undangan: +5 tamu perahu), Lumi si Anak Katak (Mata Jeli: tanda ❗ sebelum masalah; Lompat Kilat: bereskan semua masalah).
  Jurus = tombol emas, 1× per festival. Asisten Kiko si katak (Capung Cici kalau pilih Lumi). Tokoh Ranu dihapus atas permintaan.
- **Jajanan khas Indonesia** (ikon digambar sendiri, `drawFood`), v2 = 10 pilihan dalam tab **Kue** (klepon, putu bambu, lemper,
  serabi 3 🪙; getuk, kue cincin, gemblong 2 🪙) & **Minuman** (es cendol 3, teh tarik 4, wedang uwuh 3). ❤ diacak tiap main
  (`NF.HEARTS` = 3×❤❤❤, 3×❤❤, 4×❤) → anak menimbang ❤ vs harga sewa lapak.
- v2: **venue lebih luas** (daun utama r 8,6, `PAD_R`; slot berjarak 2,25; jangkauan 3,4) dan **⟳ Putar** barang (`rotK`, 90°):
  lapak menghadap tugu +1, ke samping 0, membelakangi −1; antrean mengikuti arah lapak. Tombol hantu/menu barang di tengah bawah.
- Alur Tahap 1 "Bazar Daun Teratai" (`NF.LEVELS`): judul → pilih tokoh → cerita Raja (sekali) → **Papan Persiapan** (hasil tanya
  warga ❤ acak tiap main, kartu **Target festival** — soal hitung lapak **dihapus** di v5 atas permintaan pengguna, ramalan hujan/anak hilang/Raja)
  → **Menata** (kartu per tab Lapak/Hiburan/Fasilitas/Promosi, barang hantu digeser di titik slot, **angka +/− ala Islanders** +
  perkiraan tamu, daftar Cek Kiko; ketuk barang = Pindah/Bongkar) → **Festival** (tamu datang naik perahu daun, antre & beli 1 🪙
  per jajan; masalah diketuk: sampah → kalau lama jatuh ke telaga, jajanan habis → tambah penjual 1 🪙, anak berudu terpisah →
  Pos Informasi, Raja datang → bangku, hujan → daun talas; ⏩ 2×) → **Laporan** (tamu, uang masuk − biaya rinci = untung, senang
  ≥70% → 3 bintang, komentar tamu). Modal 18, target 20 tamu & untung 6.
- v4 (pratinjau v26): **Peta Kerajaan Telaga** setelah pilih tokoh (`screenPeta`, Tahap 2–3 terkunci "segera hadir");
  **Papan Persiapan 3 langkah** (`papanStep`): 1 Tanya warga & target → 2 **Susun Acara** (`NF.ACARA`, jam di `LV.jam`; aturan
  pembukaan paling awal, hadiah sesudah lomba, konser butuh Pemusik; `acaraCek`, kejadian acara saat festival `acaraEvent`) →
  3 **Relawan** (`NF.RELAWAN` Bubu ramah/Oto rajin/Pak Kur sabar → `NF.POS` gerbang/bersih/bantu; cocok = lebih cepat; gerbang
  menambah kesabaran antre, bersih & bantu otomatis membereskan masalah, `relawanBantu`) + **Tamu istimewa** (`NF.TAMU_IST`:
  Nenek Kura-kura butuh bangku dekat gerbang, Rombongan Berudu butuh Pemusik, Pak Bangau butuh 2 keranjang; puas = senang + tip
  2 🪙). Laporan: **Catatan Kiko** (≤3 saran dari log festival) + **Stiker** (`SAVE.stk`: `hero-tahap` emas/perak + spesial
  `NF.STIKER`) + **Buku Stiker** (tombol di judul, tokoh, peta, laporan).
- v5 (pratinjau v27): **Tahap 2 "Pasar Malam Kunang-kunang"** (`NF.LEVELS[1]`, `setLevel(id)`, `let LV`): terbuka bila ada tokoh
  ⭐≥1 di Tahap 1 (`SAVE.lv['hero-id']`, `tahap2Open`); cerita Raja sekali (`SAVE.cerita2`). Dunia per tahap: `worldA`/`worldB`
  (daun kedua `PAD2` + jembatan `BR1`/`BR2`, panggung `STAGE2`, tamu lewat jembatan via `via()`), slot per tahap (`buildSlots`).
  **Malam** (`setNight(f)`, langit sore→gelap saat festival): lapak gelap −2 (`isLit`: lampu tetap tugu/gerbang/panggung +
  barang **Lampion** tab Lampu, radius 3,4, lingkaran cahaya `glowMat`), kunang-kunang. Acara 16.00–20.00 + **Kembang Api**
  (harus 19/20 → kembang api partikel) & lomba harus terang (16/17). Relawan ke-4 **Udi ⚡ cekatan → P3K** (kejadian `jatuh`).
  Modal 26, target 30 tamu & untung 6, 6 lapak. Stiker baru: Pasar terang, Kembang api indah.
- v6 (pratinjau v28, masukan pengguna: susun acara & bagi pos relawan "belum relevan"): **keduanya dihapus**. Papan Persiapan
  jadi **1 layar** (tanya warga, target, ramalan + tamu istimewa). Gantinya: (1) **Stok porsi per lapak** — saat menaruh lapak
  panel `.stokpanel` pilih 3/5/8 porsi (`NF.PORSI`, bahan 1/2/3 🪙, `it.porsi`/`it.bahan`, label 📦 di atas lapak, ubah lewat
  menu barang); jual **2 🪙 per porsi** (`JUAL`); tamu memilih lapak menurut ❤ (`DEMAND`, `stallW`); habis → tamu kecewa
  (`s.kecewa`), tambah 3 porsi 1 🪙; laporan tabel Stok (dibawa/terjual/sisa) + saran porsi. (2) **Relawan diseret saat
  festival** — tokoh di daun + bar **Tim** (`.team`), seret kartu ke gelembung masalah (atau ketuk kartu lalu ketuk masalah);
  relawan berjalan, bekerja, kembali (`sendRelawan`, `stepRelawan`); cocok (`NF.RELAWAN[].cocok` = jenis masalah) lebih cepat.
  **Kembang Api** jadi barang tab Hiburan (Tahap 2). Stiker baru: Tim hebat (≥3 tugas relawan), Porsi pas. Modal/target:
  T1 24 / 20 tamu / untung 14; T2 40 / 30 tamu / untung 22.
- Kamera: geser 1 jari = putar sedikit, cubit = zoom (layar menata & festival).
- Simpanan `localStorage` kunci `njajan-fest-v1` (`{cerita, best:{tiko,bebi,lumi}, main, hero, muted}`).
  Tes: buka `njajan-fest/?lite` (tanpa bayangan, render pelan — perlu untuk Playwright/swiftshader) lalu `NF.debug`
  (`go(nama)`, `hero(id)`, `place(kind, slotIdx)`, `SLOTS`, `speed(n)`, `jurus()`, `problems()`, `F`), `NF.S` = keadaan.
  Chromium headless perlu `--use-gl=angle --use-angle=swiftshader --enable-unsafe-swiftshader`.
- Ide tahap berikutnya (belum dibuat): Pasar Malam Kunang-kunang → Festival Sungai Pelangi → Pesta Panen Danau Raya →
  Festival Agung (lebih banyak daun dihubungkan jembatan ranting), susun acara & tugas relawan, tamu istimewa.

## Game keenam: Ata dan Pohon Madu Legendaris (`pohon-madu/`)

Link: https://radmahardika.github.io/Game-Aca/pohon-madu/ · versi sendiri `PM.VERSION` di `pohon-madu/js/data.js`
+ `?v=N` di `pohon-madu/index.html`. Desain: `pohon-madu/DESAIN.md`, daftar aset: `pohon-madu/ASET.md`, mockup: `pohon-madu/mockup/`.
**Versi 1 (pratinjau-v29) = Prolog bisa dimainkan + Arena Latihan.** Cerita (`js/maps.js` data peta & naskah `PM.SCRIPT`,
`js/world.js` mesin jelajah, `js/story.js` alur): rumah Nenek (cerita pembuka, peti → keping peta 1) → Desa Akar → Dojo (Guru Panda,
latihan) → 3 kelompok musuh berkeliaran di desa (`PM.DESA_GROUPS`; dekati dari belakang = Serangan Kejutan, dikejar dari depan = disergap;
`enc.surprise`) → Raja Kumbang di depan dojo → Prolog selesai (gerbang ⛩️ → Hutan Pinggir belum ada). `S.story = {st 0–4, map, x, y, beat}`.
Peta = gambar pengguna 1536×1024 (`img/peta`) diperbesar `zoom`; area jalan = poligon `walk` + elips `block` (koordinat gambar asli);
pintu otomatis; tombol A menyala dekat NPC/tempat; kalah → pulang ke rumah Nenek, koin −¼. Musuh yang dikalahkan hilang selama Prolog,
muncul lagi tiap masuk desa setelah Prolog selesai (latihan). Teman mengikuti jejak (Bubunti dulu, Ladhia paling belakang).
Arena Latihan (dulu "Pilih Pertarungan"): layar judul → **Pilih Pertarungan** (12 pertarungan Prolog–Bab 2,
terbuka berurutan, bisa diulang untuk latihan) → battle → menang (EXP sama untuk tiap anggota, koin, 🍯 madu) → naik level / ujian sabuk /
pilih jurus Lv 10 → Ladhia bergabung saat mulai Bab 1 di Arena (`joinBefore`), Bubunti saat mulai Bab 2 (cerita lengkap menyusul bersama peta). Layar Tim & Buku Monster.
Aset: sprite tokoh/musuh/latar **dari pengguna** (latar hijau dipotong → `img/ata|ladhia|bubunti|musuh|latar`). Ukuran: Ata ¾ Bubunti,
Ladhia terbesar. Warna sabuk Ata diganti saat runtime (`PM.BELT_AREA`). Battle: giliran per ronde menurut SPD (bar GILIRAN), ikon niat
musuh (⚔️ / 💥 kumpul tenaga → pukulan besar giliran depan / 🛡️ / 💤 lengah / 🍄 spora tidur), tipe (`aff` per tokoh, `PM.ELEM` sambal),
bos berpola + fase 2 (`pattern`, `phase2`), tips sekali (`S.tips`). Ketuk lingkaran untuk memilih sasaran. Simpanan `localStorage`
kunci `pohon-madu-v1`. Tes: `PM.debug` (title, peta, tim, buku, fight(id), levelUp, joinScene), `PM.explore.W` = keadaan jelajah, `PM.battleDebug()` = keadaan battle,
`PM.toggleFast()`. Pemain otomatis acak bisa menamatkan semua pertarungan (cek keseimbangan).

Ringkasan desain (disepakati): Turn-based RPG (genre ala Dragon Quest, bukan tiruan) untuk **melatih strategi**.

- Status HP/MP/ATK/DEF/SPD. Musuh terlihat di peta, battle bergiliran dengan **ikon niat musuh**, **bar urutan giliran**,
  3 tipe musuh (Keras/Lincah/Bayangan), Buku Monster, kombo, bos berpola 2 fase. **Tim aktif 3**, tukar di battle = 1 giliran.
  Kalah → penginapan terakhir, **koin −¼**. Level maks 40, pilih 1 dari 2 jurus di Lv 10 & 25.
- **Tim Jelajah Legenda**: Ata (honey badger, **Taekwondoin**, jurus tendangan nama **Indonesia + Korea**), Ladhia (badak,
  Paladin), Bubunti (llama, **Chef**: menyembuhkan lewat masakan, satu-satunya serangan Sambal Super Pedas; Dapur Perkemahan),
  Oumaldi (tupai, Pemanah), Tung Momon (jalak, Pemusik), Tung Yanto (kura-kura pendiam, Pertapa Batu), Uti Reni (rusa,
  Penjaga Hutan), Uti Lilik (roh hewan, Pemanggil Roh). Tung = tetua laki-laki, Uti = tetua perempuan.
- Cerita: Ata mencari Pohon Madu Legendaris dari dongeng Nenek; para tetua = tim lama Nenek, peta disobek 5 keping.
  Prolog + 8 bab (lengkap), tiap bab panjang (desa, 2–3 area, misi warga, dungeon, bos tengah, rekrut, bos bab).

## Game ketujuh: Manasik Umroh (`manasik-umroh/`)

Link: https://radmahardika.github.io/Game-Aca/manasik-umroh/ · versi sendiri (teks "versi N" di footer `manasik-umroh/index.html`
+ `?v=N` pada `src/style.css` & `src/main.js`). Dipindahkan dari repo `radmahardika/simulasi` (sumber awal & referensi visual ada di sana).
Untuk **orang tua/keluarga** latihan umroh (bukan game anak 6 tahun), berdasarkan PDF "Manasik Umroh" rombongan.

- Three.js r160 di `manasik-umroh/vendor/three/` (ES module + importmap), kamera **orang ketiga** (arah A, disetujui).
  `src/engine.js` (renderer, joystick tetap kiri bawah, geser layar = putar kamera, tombol aksi emas, peta mini, mode
  **Halus** = MSAA + bloom + RoomEnvironment / **Ringan**; turun otomatis ke Ringan bila <22 fps), `src/models.js`, `src/ui.js`
  (HUD, soal, ruang ganti, rapor), `src/data.js` (bank soal), `src/levels/*.js`.
- Alur (disepakati pengguna): **mulai dari Makkah**, miqat **Qarnul Manazil (Taif)** — bukan Bir Ali/Madinah.
  Bab: hotel Makkah → miqat → perjalanan Taif–Makkah (cinematic, soal larangan ihram) → Masjidil Haram (thawaf: mulai garis
  lampu hijau Hajar Aswad, Ka'bah di kiri; putaran batal bila arah terbalik/masuk Hijir Ismail/wudhu batal/aurat; tombol
  "Ikuti arus") + ba'da thawaf → sa'i (lari kecil di lampu hijau, pria) + tahallul → rapor (bisa disalin ke WA).
- Buku manasik (pilah kartu) **harus dijawab benar sebelum kartu berikutnya** (permintaan pengguna).
- Tes: `window.__sim` = {E, S, ui}; `__sim.E.timeScale`, `__sim.E.noAuto=true` (cegah turun otomatis di swiftshader);
  `window.__lv` (haram: T, st, finishThawaf, fin). Swiftshader sangat lambat di mode Halus → pakai Ringan untuk Playwright.

## Game kedelapan: Ata dan Madu Legendaris: Taktik (`ata-taktik/`)

Link: https://radmahardika.github.io/Game-Aca/ata-taktik/ · versi sendiri `AT.VERSION` di `ata-taktik/js/data.js`
+ `?v=N` di `ata-taktik/index.html`. Game strategi giliran **ala Onimusha Tactics / Tactics Ogre** untuk anak (6 tahun),
dengan tokoh yang sama seperti Pohon Madu. Dibuat dulu sebagai artifact Claude, dipindah ke repo di pratinjau-v32.

- **Visual (disetujui):** diorama isometrik halus ala Tactics Ogre Reborn: balok petak tebal bertekstur (rumput, paving, tanah,
  pasir, air), cahaya hangat dari kiri atas + sisi teduh kebiruan, bayangan lembut dipanggang ke permukaan, pulau melayang di
  latar biru tua bervinyet. Panel UI biru tua berbingkai emas tipis; kartu tokoh kiri bawah, daftar perintah kanan bawah (landscape iPad).
  Petak 64×32 dunia, digambar 2× (`R`) lalu diskalakan; tekstur per petak dibuat sekali (`prepareMap`).
- **Sprite:** Ata/Ladhia/Bubunti/Nenek memakai PNG dari `../pohon-madu/img/` (`js/sprites.js`: trim, titik pijak, garis luar,
  pose per arah: siaga/kanan/kiri/belakang + pose jurus tendang/pukul/ayun/lempar/bertahan/sorak). **Musuh juga PNG** dari
  `../pohon-madu/img/musuh/` (kumbang, tawon, siput, Raja Kumbang, musang, kelelawar, kadal, landak, Kepala Musang; `dir:'musuh'`,
  `lift` = terbang). Hanya Zizi yang masih gambar vektor bawaan (`js/art.js`).
- **Bab 1 Savana (7 misi):** musuh misi 1–3 = kumbang/tawon/siput; Kebun Nenek (tutorial) → Jalan Setapak → Badak di Kubangan
  (Ladhia bergabung) → Jaga Sumur (bos tengah **Raja Kumbang**, lindungi Zizi; Raja Kumbang membocorkan Kepala Musang pencuri guci madu)
  → Lari ke Bukit Batu (capai bendera) → Dapur Bubunti (Geng Musang, Bubunti bergabung) → Batu Singgasana (bos **Kepala Musang**,
  memanggil musang tiap 3 giliran). Tidak ada hyena lagi. Bot uji (tim Lv 2) menang 6/7; misi 7 butuh naik level di Markas.
  Peta = pulau 17×17 (`expandIslands` di `data.js`; `o` = laut, tidak digambar).
- **Bab 2 Hutan Lembab (v2, misi 8–14, `chap: 2`, `pal: 'hutan'`):** Pintu Hutan (lumpur) → Jembatan Akar (belut di sungai)
  → Kebun Jamur (spora tidur) → Pohon Oumaldi (lindungi, **Oumaldi bergabung**, tim jadi 4) → Rawa Lumpur (bos tengah **Lumpur
  Raksasa**, terbelah jadi 2 Lumpur Kecil saat nyawa ≤ ½) → Lembah Kabut (`fog: true`) → Sarang Ular (bos **Ular Beracun**, memanggil belut).
  Petak baru: `m` lumpur (biaya 2 langkah, kecuali `mudOk`/terbang), `J` jamur raksasa & `L` kayu tumbang (penghalang), sungai `w`
  diperpanjang sampai tepi pulau. Status: 😴 `tidur` (jamur, lewati 1 giliran), 🤢 `racun` (ular, −2/giliran selama 3, tidak sampai
  pingsan); Sup Hangat menyembuhkan keduanya & membangunkan. Kabut: musuh terlihat bila ≤3 petak dari teman (Oumaldi 4, dari tempat
  tinggi 6) atau baru menyerang (`seen`, `reveal`). Musuh `swim` (belut, ular) berenang. Oumaldi: Pemanah jarak 2–4 (+1 dari tempat
  lebih tinggi), Panah Jitu (tembus, jarak 5), Hujan Panah (sasaran + sebelahnya); sprite `pohon-madu/img/oumaldi/`, Ular di
  `musuh/ular-1..8` (dipotong dari lembar hijau pengguna). Tamu/rekrut baru mendapat level rata-rata tim (`teamLv`).
  Peta misi dikelompokkan per bab. Bot uji: tim Lv 3 menang 7/7; Lv 2 kalah di Rawa Lumpur & Sarang Ular.
- Mekanik: arah hadap (belakang ×1,5), ketinggian, jangkauan senjata, Semangat ⭐ untuk jurus, musuh tidur 💤 sampai didekati,
  3 bintang per misi, madu 🍯 untuk naik level di Markas. Ata: Tendangan Kilat/Putar/Mode Sabuk Hitam + Refleks (hindar & balas);
  Ladhia: Tantang/Benteng Badak; Bubunti: Sup Hangat + **Masakan Pedas** (satu-satunya serangan, musuh tidak bisa bergerak 1 giliran).
- Suara: **tanpa suara pembaca saat bertarung**; narasi suara (speechSynthesis id-ID) hanya di adegan cerita (permintaan pengguna).
- Ke depan: Bab 3 Rawa (Buaya Serakah, Tung Momon & Tung Yanto),
  Bab 4 Gunung (Singa Penyiksa, Utireni & Utililik).
- Ikon aplikasi (`icons/icon-180|512.png`, `manifest.webmanifest`, nama Layar Utama "ATA Tactics"): Ladhia, Ata menendang, Bubunti
  di petak rumput isometrik, latar biru tua berbingkai emas, tulisan "ATA Tactics".
- Simpanan `localStorage` kunci `ata-taktik-v1`. Tes: buka lewat http (PNG dari folder lain), `window.__ata`
  (`startMission(i)`, `G`, `S()`, `onTapWorld`, `iso`, `endPlayerTurn`); bot uji ada di riwayat percakapan (pakai `onTapWorld`).

## Status & yang sedang dibahas

- Rilis terakhir di `main`: **versi 34** = **Ata Taktik versi 2** (Bab 2 Hutan Lembab, Oumaldi, Ular Beracun). Game lain tidak berubah.
- Versi 33 = ikon aplikasi Ata Taktik ("ATA Tactics").
- Versi 32 = **Ata Taktik versi 1** (game kedelapan, `ata-taktik/`, dari branch `pratinjau-v32`;
  musuh sprite asli, bos Raja Kumbang & Kepala Musang). Game lain tidak berubah.
- Versi 31 = **Manasik Umroh versi 1** (game ketujuh, `manasik-umroh/`).
- Branch `pratinjau-v30` (peta Hutan Pinggir, Padang Ilalang, Desa Kerikil, Jembatan Batu untuk Pohon Madu, `img/peta`) **belum digabung** dan belum dipasang;
  saat dirilis pakai nomor versi berikutnya (≥ 35) dan rebase ke `main` dulu.
- Versi 29 = **Ata dan Pohon Madu versi 1** (game keenam: Prolog bisa dimainkan + Arena Latihan Prolog–Bab 2).
- Versi 28 = **Njajan Fest versi 6** (stok porsi + relawan diseret; susun acara & pos dihapus).
- Versi 27 = **Njajan Fest versi 5** (Tahap 2 Pasar Malam; fitur hitung lapak dihapus).
- Versi 26 = **Njajan Fest versi 4** (peta, susun acara, relawan, tamu istimewa, catatan,
  stiker; Tahap 2 Pasar Malam menyusul di pratinjau berikutnya, mockup `mockup-festival/tahap2.html`) + versi 3: model Raja Kura-kura baru (kura-kura berkaki empat,
  tempurung kubah bermotif heksagon + pinggiran krem, leher & kepala menjulur, mahkota emas, kerah merah).
- Versi 25 = **Njajan Fest versi 2** (area lebih luas, putar barang, 10 jajanan).
- Versi 24 = **Njajan Fest versi 1** (game kelima, Tahap 1). Game lain tidak berubah.
- Versi 23 = **Angkasa Mart versi 3** (fitur keuangan v3 di atas: Kelola Toko, pegawai,
  asuransi, bencana, cabang, barang premium, berbagi tiap 20 hari). Game lain tidak berubah.
- Versi 22 = **Tunggu Dulu! versi 4** = 10 hari + tantangan baru hari 6–10 + bantuan Tetua dihapus (lihat atas).
- Versi 21 = **Tunggu Dulu! versi 3** = alat bisa berganti saat kaca pembesar aktif (tombol alat ada di
  ambang jendela, dulu ketukannya dianggap menggeser lensa → sekarang ketukan pada `[data-act]` selalu didahulukan).
- Versi 20 = **Tunggu Dulu! versi 2** = perbaikan iPad:
  (1) layar terpotong saat landscape → `fit()` memakai `visualViewport` + area aman (`env(safe-area-inset-*)`),
  diukur ulang setelah iPad diputar; (2) **ketukan di meja tidak sampai** karena `svg#ui` menutupi layar →
  `#ui { pointer-events: none }`, hanya `[data-act]` yang bisa diketuk. Tes wajib pakai ketukan sungguhan
  (`page.touchscreen.tap` / `elementFromPoint`), bukan `dispatchEvent` langsung ke tombol.
- Versi 19 = **Tunggu Dulu! versi 1** (game keempat, `tunggu-dulu/`, lihat atas). Branch `pratinjau-v19` berisi visual Angkasa Mart
  ala Sons of Valhalla yang **ditolak pengguna** (jangan dipakai); fitur keuangan Angkasa Mart v3 dirilis di versi 23.
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
