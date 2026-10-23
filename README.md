# Aksa si Pemadam Cilik 🚒

Game petualangan pixel art untuk belajar berhitung (usia ±6 tahun).
Aksa, pemadam kebakaran cilik, dan Ara, mobil pemadam kebakaran mini sahabatnya, menolong warga Desa Ceria dari ulah Api Jahil dengan menjawab soal berhitung.

## Isi Wilayah 1: Desa Ceria

Dunia top-down ala Pokemon. Ketuk tanah untuk berjalan, Ara mengikuti di belakang. Warga yang butuh bantuan ditandai ❗; ketuk warganya (atau tombol **A**) untuk bicara. Semua soal dikerjakan dalam **battle**.

Enam masalah muncul bersamaan dan boleh diselesaikan dengan urutan bebas:

| Masalah | Warga | Materi |
|---|---|---|
| Kucing di Pohon | Bu Ani | Penjumlahan ≤ 10 (menyambung tangga) |
| Api di Tumpukan Daun | Api Jahil | Penjumlahan ≤ 20 |
| Toko Roti Terbakar | Pak Budi | Pengurangan ≤ 20 |
| Tangki Truk Kosong | Pak Joko | Tambah/kurang + **1 soal perkalian** (hasil ≤ 15) |
| Anak Ayam Lepas | Bu Siti | 1 soal penjumlahan ≤ 10 |
| Hidran Bocor | Kakek Udin | 1 soal pengurangan ≤ 20 |

Setelah keenamnya selesai, **Raja Api Jahil** muncul di depan Balai Desa sebagai boss terakhir (campuran tambah & kurang).

- Tidak ada "kalah". Battle berisi 3 pilihan jawaban. Kalau salah, soal langsung diganti soal baru supaya anak benar-benar menghitung, bukan menebak.
- Ara (mobil pemadam mini) jadi asisten: setiap kali satu masalah selesai, saat game dibuka, atau saat Ara diketuk, Ara mengingatkan tinggal berapa warga lagi dan siapa saja.
- Masalah yang sudah selesai bisa dimainkan lagi lewat **Latihan lagi** untuk mengejar 3 bintang.
- Hadiah: lencana + aksesori Ara (sirene ganda, stiker bintang, kacamata keren, velg emas, bendera pahlawan) yang bisa dipakai/dilepas di **Koleksi**.
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
