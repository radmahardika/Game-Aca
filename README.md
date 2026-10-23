# Aksa si Pemadam Cilik 🚒

Game petualangan pixel art untuk belajar berhitung (usia ±6 tahun).
Aksa, pemadam kebakaran cilik, dan Ara, honey badger pemberani, menolong warga Desa Ceria dari ulah Api Jahil dengan menjawab soal berhitung.

## Isi Wilayah 1: Desa Ceria

Dunia top-down ala Pokemon. Aksa berjalan ke 4 arah (tombol panah di layar atau ketuk tanah tujuan), Ara mengikuti di belakang. Warga yang butuh bantuan ditandai ❗, lalu tekan tombol **A** (atau ketuk warganya) untuk bicara. Semua soal dikerjakan dalam **battle**.

Empat masalah muncul bersamaan dan boleh diselesaikan dengan urutan bebas:

| Masalah | Warga | Materi |
|---|---|---|
| Kucing di Pohon | Bu Ani | Penjumlahan ≤ 10 (menyambung tangga) |
| Api di Tumpukan Daun | Api Jahil | Penjumlahan ≤ 20 |
| Toko Roti Terbakar | Pak Budi | Pengurangan ≤ 20 |
| Tangki Truk Kosong | Pak Joko | Tambah/kurang + **1 soal perkalian** (hasil ≤ 15) |

Setelah keempatnya selesai, **Raja Api Jahil** muncul di depan Balai Desa sebagai boss terakhir (campuran tambah & kurang).

- Tidak ada "kalah". Menu battle berisi 3 jawaban + **🦡 Bantuan Ara** (titik/ikon yang bisa diketuk satu per satu untuk menghitung). Kalau salah, bantuan terbuka otomatis. Kalau salah dua kali, jawaban yang benar akan berkedip.
- Masalah yang sudah selesai bisa dimainkan lagi lewat **Latihan lagi** untuk mengejar 3 bintang.
- Hadiah: lencana + aksesori Ara (helm, syal, kacamata, sepatu bot, jubah) yang bisa dipakai/dilepas di **Koleksi**.
- Musik latar chiptune (lagu desa & lagu battle) dan efek suara, bisa dimatikan dari tombol 🎵 atau ⚙️ Pengaturan. Tidak ada narasi suara.
- Progres dan posisi Aksa tersimpan otomatis di perangkat.

## Main di iPad

1. Buka link GitHub Pages: `https://radmahardika.github.io/Game-Aca/` di **Safari**.
2. Ketuk tombol **Bagikan** (kotak dengan panah ke atas), lalu pilih **Tambahkan ke Layar Utama**.
3. Buka dari ikon "Aksa" di layar utama. Game tampil layar penuh seperti aplikasi.
4. Pegang iPad dalam posisi **mendatar (landscape)**.

Kalau musik tidak terdengar: pastikan mode senyap iPad mati dan volume menyala.

## Mengaktifkan GitHub Pages (sekali saja)

Di halaman repo GitHub: **Settings → Pages → Build and deployment → Source: Deploy from a branch → Branch: `main` / `(root)` → Save**. Tunggu ±1 menit sampai link aktif.

## Menjalankan di komputer

Tidak perlu build. Jalankan server statis apa saja dari folder ini, misalnya:

```
npx http-server .
```

## Struktur

- `index.html`, `css/style.css`: halaman dan tampilan UI
- `js/sprites.js`: pixel art (Aksa, Ara, warga, Api Jahil, ikon)
- `js/world.js`: partikel, gambar bangunan tampak samping, layar judul
- `js/overworld.js`: peta Desa Ceria top-down, gerak 4 arah, Ara mengikuti, ketuk untuk berjalan
- `js/battle.js`: layar battle ala Pokemon dan bantuan hitung
- `js/missions.js`: cerita, dialog, dan daftar soal tiap masalah
- `js/questions.js`: pembuat soal acak
- `js/audio.js`: efek suara dan musik latar chiptune
- `js/game.js`: alur game (judul, dunia, dialog, hadiah, koleksi, pengaturan)
