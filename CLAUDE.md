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

## Game kedua: Tim Penyelamat Malam (`penyelamat/`)

Game terpisah di folder `penyelamat/` (link: https://radmahardika.github.io/Game-Aca/penyelamat/), versi sendiri
(`TPM.VERSION` di `penyelamat/js/data.js` + `?v=N` di `penyelamat/index.html`). Tujuan: survival & problem solving,
**dimainkan anak + orang tua di dua iPad** (atau satu iPad bergantian).

- First person **3D pixel** (raycasting), malam gelap tapi tidak horor. Kontrol: analog melayang di 60% kiri layar
  (atas/bawah = maju/mundur, kiri/kanan = belok; kecepatan sudah diturunkan atas permintaan pengguna).
- **Tutu** — "Burung Hantu yang suka membantu" (kecil & gesit; dulu bernama Sinar): melihat dalam gelap (lingkaran redup kehijauan), terbang melintasi sungai,
  tombol ⭐ Tandai (terlihat di layar Benhat). Tidak bisa membawa alat.
- **Benhat** — "Si Beruang Hebat" (kuat, helm kuning; dulu bernama Tangguh, lalu Siberat): layar hampir gelap total; hanya melihat mata kuning Tutu, bintang tanda,
  gelombang suara 🔊 korban. Tidak bisa masuk sungai (lewat jembatan), lambat di lumpur. Tombol A.
- **Dunia terbuka**, urutan bebas, posisi 7 korban **diacak** tiap main (titik tetap per zona). Semua korban hewan:
  kelinci (sungai: pelampung+tali), rusa (perban), landak (tongkat), kambing (selimut+peluit), rubah (gua berasap: kain
  basah), anak kerbau (lumpur: papan), anak kucing (pohon: tangga). Tiap selesai muncul pesan dunia nyata.
- Pusat: **Pohon Sarang** (beringin berlubang + kunang-kunang; BUKAN perkemahan manusia). Alat diambil di sana.
  **Tas 3 kotak**, papan & tangga = 2 kotak → harus memilih. Salah alat tidak kalah. Hewan selamat pindah ke sarang,
  lokasinya jadi terang kunang-kunang.
- Multiplayer: PeerJS (`penyelamat/vendor/peerjs.min.js` 1.5.5, server sinyal publik 0.peerjs.com). Pembuat ruangan =
  tuan rumah yang memegang dunia & menyimpan progres (`localStorage` kunci `penyelamat-malam-v1`); kode ruangan 4 gambar.
  Tamu mengirim aksi (`mark`, `bag`, `rescue`), tuan rumah membalas `world`/`ev`. Detak 4 detik → banner terputus,
  tamu menyambung ulang otomatis.
- Uji multiplayer lokal: jalankan server PeerJS (`npm i peer`, `PeerServer({port:9000,host:'127.0.0.1',path:'/'})`)
  lalu buka `penyelamat/?peer=127.0.0.1:9000` di dua konteks Playwright. `TPM.debug` (place, act, swap, doA, doMark, ...),
  `TPM.S` = keadaan.

## Status & yang sedang dibahas

- Rilis terakhir di `main`: **versi 10** (game Aksa sama dengan versi 7) +
  **Tim Penyelamat Malam versi 3** di `penyelamat/` (nama Tutu & Benhat; perbaikan layar macet & analog mati
  setelah iPad diputar — ukur ulang kanvas tiap frame, analog direset saat rotasi/jari hilang, loop dijaga try/catch).
  Belum diuji di dua iPad sungguhan — tunggu laporan pengguna.
- Branch `pratinjau-v11`: Tutu terbang — kamera lebih tinggi (mata 1,15 vs 0,5; horizon 40% layar, sedikit menunduk,
  naik-turun pelan) dan lebih cepat (Tutu 2,7 vs Benhat 1,3). Di layar Benhat, Tutu tampak melayang.
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
