# Ata dan Pohon Madu Legendaris — Dokumen Desain (mekanik)

> Status: **disepakati** (diskusi mekanik). Visual & kode belum dibuat — langkah berikutnya mockup.
> Judul game & nama folder (`pohon-madu/`) masih sementara.
> Sprite Ata dari pengguna (latar hijau) → dipotong ke `pohon-madu/img/ata/*.png`. Mockup: `pohon-madu/mockup/?s=pilih|serang|jelajah|sabuk`.
> Gaya visual: **low-poly lembut** menyamai sprite tokoh (bukan pixel), sudut pandang miring dari atas, kamera agak jauh.
> Ukuran tokoh (disepakati): Bubunti = patokan, **Ata = ¾ Bubunti**, **Ladhia ±1,75× Bubunti** (1,5× dari mockup awal); tokoh diberi jarak, tidak bertumpuk.
> Latar battle dari pengguna (gaya lukisan pixel) → `img/latar/*.jpg` (label di atas dibuang saat digambar).
> Sprite tokoh dari pengguna (latar hijau → `img/ata`, `img/ladhia`, `img/bubunti`); musuh & latar digambar dengan kode (`mockup/lowpoly.js`).

Game keenam. **Turn-based RPG** (genre seperti Dragon Quest), murni untuk **melatih strategi** anak 6 tahun.
Dimainkan di iPad (Safari) lewat GitHub Pages, sama seperti game lain.

---

## 1. Inti permainan

**Jelajah peta → bertemu musuh → battle bergiliran → EXP, koin, bahan → naik level → cerita → rekrut teman.**

- Peta dunia **top-down**, kontrol **analog stik melayang** (60% kiri layar) + tombol **A**, seperti game Aksa.
- **Musuh terlihat di peta** (tidak ada pertemuan acak tak terlihat).
  - Ata menyentuh musuh dari belakang → **Serangan Kejutan** (tim jalan duluan di giliran pertama).
  - Musuh menyentuh Ata duluan → musuh jalan duluan.
- Tiap bab: **Desa → 2–3 area jelajah → 2–3 permintaan warga → dungeon + bos tengah → kejadian rekrut → bos bab.**
  Target ±1,5–3 jam per bab (beberapa sesi main), supaya bab tidak selesai terlalu cepat.

## 2. Status

| Status | Arti |
|---|---|
| **HP** | Darah. Habis = pingsan |
| **MP** | Untuk memakai jurus |
| **ATK** | Kekuatan serang |
| **DEF** | Pertahanan, mengurangi pukulan musuh |
| **SPD** | Menentukan urutan giliran |

## 3. Battle

- Menu tiap giliran (ikon besar): ⚔️ **Serang** · ✨ **Jurus** · 🛡️ **Bertahan** · 🎒 **Bekal** · 🔄 **Tukar** · 🏃 **Kabur**
- **Tim aktif 3**, sisanya cadangan.
  - Di luar battle: tukar bebas.
  - Di dalam battle: **Tukar memakan 1 giliran** (keputusan strategi).
  - Cadangan mendapat ½ EXP.
- Tombol ⏩ mempercepat animasi. Teks battle pendek.
- Musuh **tidak mati**: saat kalah mereka kabur, tertidur, atau jadi baik.
- **Kalah**: kembali ke penginapan terakhir, **koin −¼**, EXP tetap.

### Mekanik strategi
1. **Ikon niat musuh** di atas kepala (untuk giliran berikutnya):
   ⚔️ serang biasa · 💥 mengumpulkan tenaga (pukulan besar giliran depan) · 🛡️ bertahan · 💤 lengah.
2. **Bar urutan giliran** selalu terlihat (deretan wajah). Bisa diubah oleh jurus (Tendangan Samping, Lagu Riang, Panah Jaring).
3. **Tiga tipe musuh**

   | Tipe | Contoh | Ampuh | Kurang ampuh |
   |---|---|---|---|
   | 🪨 Keras (cangkang/batu) | kumbang batu, kura-kura duri | Ladhia, Tung Yanto, Uti Reni | tendangan Ata |
   | 🪶 Lincah (terbang/cepat) | tawon, kelelawar, gagak | Ata, Oumaldi | Ladhia (sering meleset) |
   | 🌑 Bayangan (makhluk gelap) | musang bayangan, roh kabut | Uti Lilik, sambal Bubunti, lagu Tung Momon | serangan biasa |

4. **Buku Monster**: kelemahan musuh baru tercatat setelah ditemukan (atau langsung lewat Mata Roh Uti Lilik).
5. **Kombo tim**, contoh: Tendangan Kapak (DEF musuh turun) → Hantaman Meteor; Tantang → Bubunti aman memasak;
   Lagu Riang → Ata jalan 2×; Bertapa Tung Yanto dilindungi Ladhia.
6. **MP & bekal terbatas** di dungeon; MP pulih hanya di penginapan / api unggun tertentu.
7. **Bos berpola** (mis. 💥 tiap 3 giliran) dan **2 fase** (ganti gaya saat HP setengah).

## 4. Naik level

- EXP dibagi rata ke tim aktif yang ikut battle; cadangan ½.
- Batas level **40**. Teman baru bergabung dengan level menyesuaikan tim.
- Naik level → status naik otomatis + layar perayaan ("Ata naik ke Level 5! Jurus baru: …").
- Jurus terbuka otomatis; pada **Level 10 dan 25** anak **memilih 1 dari 2 jurus**.

## 5. Karakter — "Tim Jelajah Legenda"

Kekuatan awal (★1–5):

| Karakter | Job | HP | MP | ATK | DEF | SPD |
|---|---|---|---|---|---|---|
| 🦡 **Ata** (honey badger pemberani) | Taekwondoin | ★★★ | ★★ | ★★★★ | ★★ | ★★★★★ |
| 🦏 **Ladhia** (badak besar berarmor, wajah garang) | Paladin | ★★★★★ | ★ | ★★★★ | ★★★★★ | ★ |
| 🦙 **Bubunti** (llama putih lemah lembut) | Chef | ★★★ | ★★★★★ | ★ | ★★ | ★★★ |
| 🐿️ **Oumaldi** (tupai muda) | Pemanah | ★★ | ★★ | ★★★★ | ★★ | ★★★★ |
| 🐦 **Tung Momon** (jalak tua, ramai) | Pemusik | ★★ | ★★★★ | ★★ | ★★ | ★★★★ |
| 🐢 **Tung Yanto** (kura-kura tua, pendiam) | Pertapa Batu | ★★★★ | ★★★★ | ★★★★★ | ★★★★ | ★ |
| 🦌 **Uti Reni** (rusa tua) | Penjaga Hutan | ★★★ | ★★★★ | ★★★ | ★★★ | ★★★ |
| ✨ **Uti Lilik** (roh hewan, sangat tua) | Pemanggil Roh | ★★ | ★★★★★ | ★★★ | ★★ | ★★★ |

*Tung* = sebutan tetua laki-laki, *Uti* = sebutan tetua perempuan.

### 🦡 Ata — Taekwondoin (kecepatan)
Senjata: **sabuk** — **naik sabuk** (disepakati): Putih Lv 1 → Kuning Lv 5 → Hijau Lv 10 → Biru Lv 16 → Merah Lv 23 → Hitam Lv 30
(ujian sabuk di dojo; ATK & SPD naik). Warna sabuk di sprite diganti saat runtime (`BELT`, `BELT_AREA` di mockup).
Serangan biasa: **Pukulan Lurus (Jireugi 지르기)**. Bakat bawaan **Gesit**: kadang dapat giliran tambahan; kabur selalu berhasil.
Nama jurus tampil **Indonesia + istilah Korea** (latin; hangul di dokumen ini saja).

| Lv | Jurus | Korea | Efek | Strategi |
|---|---|---|---|---|
| 2 | Tendangan Depan | Ap Chagi 앞차기 | Tendangan cepat, **selalu jalan paling dulu** di giliran itu | Habisi musuh sebelum ia bergerak |
| 4 | Tendangan Samping | Yeop Chagi 옆차기 | Musuh **terdorong mundur di urutan giliran** | Tunda musuh yang 💥 |
| 7 | Tendangan Putar | Dollyeo Chagi 돌려차기 | 2× tendangan | Ampuh ke Lincah |
| 10 | **Pilih:** Tendangan Belakang | Dwi Chagi 뒤차기 | Sangat kuat ke musuh yang sedang 💥 | Hukuman bagi musuh yang bersiap |
| 10 | **atau:** Kuda-kuda Siaga | Gyeorugi Junbi 겨루기 준비 | Menghindar + membalas bila diserang | Saat musuh ⚔️ mengincar Ata |
| 13 | Tendangan Kapak | Naeryeo Chagi 내려차기 | Menurunkan DEF musuh 3 giliran | Persiapan pukulan Ladhia/Tung Yanto |
| 17 | Teriakan Semangat | Kihap 기합 | ATK & SPD Ata naik 3 giliran | Sebelum pamungkas |
| 21 | Tendangan Ganda Melompat | Idan Ap Chagi 이단 앞차기 | 2× ke dua musuh berbeda | Musuh banyak & lemah |
| 25 | **Pilih:** Tendangan Putar Belakang | Dwi Huryeo Chagi 뒤후려차기 | Mengenai **semua musuh** | Gerombolan |
| 25 | **atau:** Tendangan Beruntun | Yeonsok Chagi 연속차기 | 3–4× ke satu musuh | Bos |
| 30 | Tendangan Terbang | Twieo Chagi 뛰어차기 | Terkuat; makin besar bila SPD Ata tinggi | Pamungkas |

### 🦏 Ladhia — Paladin (pertahanan)
Senjata: chain meteor / tombak + tameng besar. Lambat (biasanya jalan terakhir).

| Lv | Jurus | Efek |
|---|---|---|
| awal | Lindungi | Menerima pukulan untuk satu teman |
| awal | Hantaman Meteor | Pukulan berat ke satu musuh, ampuh ke Keras |
| 8 | Tantang | Semua musuh mengincar Ladhia 2 giliran |
| 10 | **Pilih:** Dinding Perisai / Tombak Tembus | DEF tim naik 3 giliran / mengabaikan 🛡️ musuh |
| 14 | Ayunan Meteor | Mengenai semua musuh (lemah) |
| 20 | Tameng Pantul | Sebagian pukulan dipantulkan balik |
| 25 | **Pilih:** Benteng Badak / Serudukan Badak | Tim kebal 1 giliran (MP besar) / serangan terkuat, Ladhia jalan terakhir |

### 🦙 Bubunti — Chef (menyembuhkan lewat masakan)
Senjata: **sendok sayur / spatula** + buku resep. Hanya **1 jurus serang**.

| Lv | Masakan | Efek |
|---|---|---|
| awal | Sup Hangat | Menyembuhkan 1 teman |
| awal | Wedang Jahe | Membangunkan teman yang pingsan |
| 9 | Nasi Liwet Bersama | Menyembuhkan seluruh tim |
| 10 | **Pilih:** Bubur Lembut / Teh Hangat Madu | Hapus efek buruk / tim pulih sedikit tiap giliran 3 giliran |
| 12 | Bekal Semangat | ATK 1 teman naik 3 giliran |
| 16 | 🌶️ **Sambal Super Pedas** | **Satu-satunya serangan**: semua musuh, sangat ampuh ke Bayangan, MP mahal |
| 25 | **Pilih:** Tumpeng Pesta / Masak Kilat | Sembuh penuh seluruh tim (MP sangat besar) / Bubunti memasak 2× dalam 1 giliran |

**Dapur Perkemahan:** musuh kadang menjatuhkan **bahan** (jahe, daun, telur, cabai, madu kecil, beras…).
Di api unggun / penginapan Bubunti memasak bahan menjadi **bekal** (pengganti ramuan) yang dipakai lewat menu 🎒.
Tas bekal terbatas → anak menyiapkan bekal sesuai bos ("bosnya suka meracun → bawa Bubur Lembut").

### 🐿️ Oumaldi — Pemanah
| Lv | Jurus | Efek |
|---|---|---|
| awal | Panah Tepat | Tidak pernah meleset; ampuh ke Lincah |
| awal | Panah Jaring | SPD musuh turun |
| 10 | **Pilih:** Bidik / Panah Kembar | Giliran depan pasti kritikal / 2 musuh sekaligus |
| 15 | Hujan Panah | Semua musuh |
| 25 | **Pilih:** Panah Bintang / Panah Peluit | Terkuat ke 1 musuh / semua musuh terkejut (lewat 1 giliran, peluang) |

### 🐦 Tung Momon — Pemusik
| Lv | Jurus | Efek |
|---|---|---|
| awal | Lagu Semangat | ATK tim naik |
| awal | Lagu Riang | SPD tim naik |
| awal | Lagu Tenang | DEF tim naik |
| 10 | **Pilih:** Nyanyian Pengantuk / Lagu Penawar | Musuh tertidur / hapus efek buruk tim |
| 18 | Siulan Terang | Ampuh ke Bayangan, semua musuh |
| 25 | **Pilih:** Konser Besar / Duet | Semua buff sekaligus / buff ganda ke 1 teman |

### 🐢 Tung Yanto — Pertapa Batu
Mengajarkan **kesabaran & waktu yang tepat**.
| Lv | Jurus | Efek |
|---|---|---|
| awal | Bertapa | Diam 1 giliran, mengumpulkan tenaga (jurus berikutnya ×2) |
| awal | Longsor Batu | Semua musuh, sangat kuat setelah Bertapa; ampuh ke Keras |
| awal | Cangkang Batu | Tung Yanto kebal 1 giliran |
| 10 | **Pilih:** Tanah Bergetar / Batu Pelindung | Musuh jatuh (lewat giliran, peluang) / DEF 1 teman naik besar |
| 25 | **Pilih:** Gunung Runtuh / Tapa Dalam | Serangan terkuat semua musuh (perlu Bertapa) / Bertapa sambil memulihkan MP tim |

### 🦌 Uti Reni — Penjaga Hutan
| Lv | Jurus | Efek |
|---|---|---|
| awal | Akar Menjerat | 1 musuh melewatkan giliran (peluang) |
| awal | Serbuk Bunga | ATK musuh turun |
| awal | Daun Tajam | Ampuh ke Keras |
| 10 | **Pilih:** Kabut Hijau / Embun Pagi | DEF semua musuh turun / tim pulih sedikit |
| 25 | **Pilih:** Hutan Hidup / Tanduk Cahaya | Semua musuh terjerat (peluang) / serangan kuat + menghapus buff musuh |

### ✨ Uti Lilik — Pemanggil Roh
| Lv | Jurus | Efek |
|---|---|---|
| awal | Mata Roh | Langsung tahu kelemahan & niat 2 giliran musuh |
| awal | Cahaya Roh | Ampuh ke Bayangan |
| awal | Panggil Roh Kunang-kunang | Tim pulih MP sedikit |
| awal | Panggil Roh Elang | Serangan cepat semua musuh |
| 10 | **Pilih:** Panggil Roh Beruang / Panggil Roh Burung Hantu | Roh menahan pukulan 2 giliran / musuh tertidur |
| 25 | **Pilih:** Roh Leluhur / Tirai Roh | Serangan cahaya terkuat / tim kebal efek buruk 3 giliran |

## 6. Barang, toko, koin

- **Koin** dari battle & misi; toko senjata/pelindung per karakter, toko bahan, penginapan.
- Perlengkapan 3 slot: **Senjata, Pelindung, Aksesori**. Di toko ada panah ⬆️ hijau / ⬇️ merah dibanding yang dipakai.
- **Madu** = penyembuh dasar (bisa dibeli), bekal lain dari masakan Bubunti.
- Simpan otomatis saat masuk area & di penginapan (`localStorage`).

## 7. Cerita — "Tim Jelajah Legenda"

**Latar:** Waktu muda, Nenek Ata berpetualang mencari **Pohon Madu Legendaris** bersama **Tim Jelajah Legenda**:
Tung Momon, Tung Yanto, Uti Reni, dan Uti Lilik. Mereka gagal mencapai puncak Gunung Awan lalu berpisah.
**Peta Pohon Madu disobek jadi 5 keping**: Nenek menyimpan satu, tiap anggota menyimpan satu.
Ata, cucu Nenek, kini melanjutkan perjalanan itu dan membentuk **Tim Jelajah Legenda** yang baru.

| Bab | Tempat | Cerita | Mekanik yang diperkenalkan |
|---|---|---|---|
| Prolog | **Desa Akar** (rumah Nenek) | Nenek bercerita & memberi **keping peta 1**. Ata latihan di dojo kecil desa (Sabuk Putih). | Battle dasar, ikon niat, bar giliran |
| 1 | **Lembah Kerikil** | Barang warga hilang; **Ladhia** si penjaga jembatan menuduh Ata. Duel tidak bisa dimenangkan dengan pukulan (bertahan sampai Ladhia lelah). Ata & Ladhia (sebagai *tamu*) mengejar gerombolan **Musang Bayangan** ke Tambang Tua. Bos: Kepala Musang. Ladhia bergabung. | Bertahan, tipe Keras, Tendangan Samping |
| 2 | **Desa Embun** | Warga sakit karena mata air keruh. **Bubunti** punya resep obat, bahannya di Rawa Kabut & Gua Embun. Bos: Lumpur Raksasa yang menyumbat mata air. Bubunti bergabung. | Menyembuhkan, **Dapur Perkemahan**, tipe Bayangan |
| 3 | **Hutan Kenari** | **Oumaldi** jago memanah tapi tak mau kerja tim. Lumbung kenari diserbu tawon. Lewat Lomba Panah Oumaldi belajar menang bersama. Bos: Ratu Tawon. | Tipe Lincah, **Tukar anggota di battle** (tim jadi 4 → 1 cadangan) |
| 4 | **Pasar Burung** | **Tung Momon** yang ramai & suka bercerita kehilangan seruling ajaib sebelum festival (dicuri Gagak Sorak). Teman lama Nenek → **keping 2**. | Buff lagu |
| 5 | **Danau Sunyi** | **Tung Yanto** tinggal di pulau tengah danau, tidak mau bicara. Tung Momon membujuknya (si ramai & si pendiam). Bos: Ular Air Raksasa. **Keping 3**. | Bertapa = menunggu waktu tepat |
| 6 | **Hutan Tua** | Hutan layu oleh kabut bayangan. **Uti Reni**, rusa penjaga hutan, lelah melindunginya sendirian. **Keping 4**. | Melemahkan musuh |
| 7 | **Kuil Roh** | Para tetua mengajak Ata membangunkan **Uti Lilik**, roh hewan yang tertidur ratusan tahun. Ia bercerita mengapa Tim Jelajah Legenda dulu gagal: **Raja Kabut** menjaga Gunung Awan. **Keping 5** → peta utuh. | Mata Roh, Bayangan sulit |
| 8 | **Gunung Awan** | Dungeon besar bertingkat. Bos terakhir **Raja Kabut** (memakai semua mekanik, beberapa fase). Pohon Madu mekar lagi. | Semua |
| Akhir | **Desa Akar** | Ata pulang membawa madu; para tetua **bertemu Nenek lagi** setelah puluhan tahun. "Harta sebenarnya adalah sahabat di perjalanan." | — |

Rencana rilis: semua 8 bab (lengkap), dibuat bertahap per pratinjau (Prolog + Bab 1 dulu, dst.).

## 8. Prinsip ramah anak
- Ikon besar, teks pendek, tanpa narasi suara (musik chiptune + efek suara, bisa dimatikan).
- Tidak ada kematian; musuh kabur/tertidur/jadi baik.
- Kalah tidak menghapus progres (hanya koin −¼).
- Tutorial lewat cerita, satu mekanik baru per bab.
