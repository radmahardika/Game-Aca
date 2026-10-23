# Aksa si Pemadam Cilik 🚒

Game petualangan pixel art untuk belajar berhitung (usia ±6 tahun).
Aksa, pemadam kebakaran cilik, dan Ara, honey badger pemberani, menolong warga Desa Ceria dari ulah Api Jahil dengan menjawab soal berhitung.

## Isi Wilayah 1: Desa Ceria

| Misi | Cerita | Materi |
|---|---|---|
| 1. Kucing di Pohon | Menyambung tangga untuk Si Oren | Penjumlahan ≤ 10 |
| 2. Lawan Api Jahil | Battle menyemprot Api Jahil | Penjumlahan ≤ 20 |
| 3. Toko Roti Pak Budi | Menghitung sisa api | Pengurangan ≤ 20 |
| 4. Isi Ember Air | Mengisi tangki truk | Tambah/kurang + **1 soal perkalian** (hasil ≤ 15) |
| 5. Raja Api Jahil | Boss battle di balai desa | Campuran tambah & kurang |

- Tidak ada "kalah". Kalau jawaban salah, Ara menampilkan titik bantuan yang bisa diketuk satu per satu untuk menghitung. Kalau salah dua kali, jawaban yang benar akan berkedip.
- Hadiah: lencana per misi + aksesori untuk Ara (helm, syal, kacamata, sepatu bot, jubah) yang bisa dipakai/dilepas di menu **Koleksi**.
- Narasi suara Bahasa Indonesia memakai suara bawaan iPad. Bisa dimatikan di ⚙️ Pengaturan.
- Progres tersimpan otomatis di perangkat.

## Main di iPad

1. Buka link GitHub Pages: `https://radmahardika.github.io/Game-Aca/` di **Safari**.
2. Ketuk tombol **Bagikan** (kotak dengan panah ke atas), lalu pilih **Tambahkan ke Layar Utama**.
3. Buka dari ikon "Aksa" di layar utama. Game tampil layar penuh seperti aplikasi.
4. Pegang iPad dalam posisi **mendatar (landscape)**.

Kalau narasi suara tidak terdengar: pastikan tombol senyap iPad mati dan volume menyala.
Supaya suaranya lebih bagus, buka *Pengaturan iPad → Aksesibilitas → Konten Lisan → Suara → Bahasa Indonesia* dan unduh suara "Damayanti".

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
- `js/world.js`: latar, bangunan, partikel, dan adegan tiap misi
- `js/missions.js`: cerita, dialog, dan daftar soal tiap misi
- `js/questions.js`: pembuat soal acak
- `js/audio.js`: efek suara chiptune dan narasi suara
- `js/game.js`: alur game (judul, peta, misi, hadiah, koleksi, pengaturan)
