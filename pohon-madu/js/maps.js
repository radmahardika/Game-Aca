// Data peta jelajah (koordinat = piksel gambar asli peta)
(function () {
  // tinggi tokoh di peta (satuan gambar), dihitung dari tinggi Ata per peta
  PM.WALK_SCALE = { ata: 1, ladhia: 2.25, bubunti: 1.3, nenek: 1.05, guru: 1.6 };
  PM.MAPS = {
    'desa-akar': {
      name: 'Desa Akar', sub: 'Prolog · kampung halaman Ata', img: 'desa-akar', zoom: 1.7, ataH: 62, speed: 150,
      walk: [[400, 390], [560, 380], [700, 330], [760, 262], [820, 250], [930, 250], [1000, 280], [1100, 270], [1250, 220], [1330, 170], [1375, 135],
        [1450, 135], [1430, 195], [1350, 255], [1265, 315], [1205, 385], [1185, 450], [1250, 475], [1330, 525], [1440, 535], [1440, 585], [1300, 605],
        [1100, 645], [1010, 700], [965, 765], [880, 825], [800, 850], [700, 850], [650, 820], [560, 805], [420, 805], [300, 790], [235, 745], [250, 705],
        [345, 705], [390, 745], [520, 742], [690, 688], [730, 640], [640, 600], [560, 545], [470, 495], [420, 440]],
      block: [[825, 462, 62, 44], [965, 470, 62, 36], [1065, 522, 62, 34], [705, 655, 26, 18]],
      doors: [
        { id: 'keRumah', x: 252, y: 722, r: 34, to: 'rumah-nenek', at: [790, 800], face: 'belakang' },
        { id: 'keDojo', x: 872, y: 262, r: 36, to: 'dalam-dojo', at: [790, 820], face: 'belakang' },
      ],
      spots: [
        { id: 'penginapan', x: 420, y: 395, r: 60, label: '🌙 Penginapan' },
        { id: 'toko', x: 1300, y: 520, r: 75, label: '🏪 Toko Madu' },
        { id: 'papan', x: 965, y: 515, r: 60, label: '📋 Papan' },
        { id: 'gerbang', x: 1410, y: 150, r: 55, label: '⛩️ Gerbang' },
      ],
      spawn: [700, 520],
    },
    'rumah-nenek': {
      name: 'Rumah Nenek', sub: 'Prolog', img: 'rumah-nenek', zoom: 1.45, ataH: 72, speed: 140,
      walk: [[240, 600], [560, 455], [610, 425], [830, 425], [1000, 440], [1180, 600], [1170, 700], [1100, 760], [905, 800], [880, 880], [705, 880],
        [700, 805], [560, 772], [450, 705], [300, 705]],
      block: [[490, 525, 85, 58], [405, 565, 62, 42], [1100, 505, 110, 70]],
      doors: [{ id: 'keDesa', x: 792, y: 870, r: 40, to: 'desa-akar', at: [300, 772], face: 'depan' }],
      spots: [{ id: 'peti', x: 680, y: 445, r: 70, label: '🧰 Peti kecil' }, { id: 'lukisan', x: 900, y: 440, r: 55, label: '🖼️ Lukisan' }],
      npcs: [{ id: 'nenek', x: 610, y: 610, pose: 'kiri', r: 80 }],
      spawn: [790, 760],
    },
    'dalam-dojo': {
      name: 'Dojo', sub: 'Prolog · latihan & ujian sabuk', img: 'dalam-dojo', zoom: 1.2, ataH: 92, speed: 170,
      walk: [[160, 440], [1290, 440], [1290, 530], [1470, 612], [1470, 800], [900, 840], [900, 905], [680, 905], [680, 840], [60, 800], [60, 660], [160, 640]],
      block: [[195, 480, 60, 50]],
      doors: [{ id: 'keDesa', x: 790, y: 895, r: 40, to: 'desa-akar', at: [872, 318], face: 'depan' }],
      spots: [{ id: 'sabuk', x: 470, y: 420, r: 80, label: '🥋 Rak sabuk' }],
      npcs: [{ id: 'guru', x: 768, y: 395, pose: 'depan', r: 170 }],
      spawn: [790, 780],
    },
  };

  // kelompok musuh di Desa Akar (Prolog), muncul setelah latihan di dojo
  PM.DESA_GROUPS = [
    { id: 'g1', enc: 'p1', lead: 'kumbang', x: 640, y: 470, home: 110 },
    { id: 'g2', enc: 'p2', lead: 'siput', x: 1120, y: 360, home: 90 },
    { id: 'g3', enc: 'pg3', lead: 'tawon', x: 780, y: 770, home: 110 },
  ];
  PM.BOSS_SPOT = { x: 640, y: 420 };
  PM.STORY_ENC = {
    latihan: { id: 'latihan', bab: 'Prolog', name: 'Latihan di Dojo', bg: 'halaman-dojo', foes: ['kumbang'],
      intro: 'Guru Panda melepas Kumbang Batu latihan. Pilih ⚔️ Serang atau ✨ Jurus, lalu ketuk musuhnya!' },
    pg3: { id: 'pg3', bab: 'Prolog', name: 'Dekat Kebun', bg: 'halaman-dojo', foes: ['tawon', 'siput'], intro: 'Tawon Nakal dan Siput Lendir merusak kebun!' },
  };

  // ---------- naskah Prolog ----------
  // baris: [siapa, pose, teks]
  PM.SCRIPT = {
    pembuka: [
      ['nenek', 'sapa', 'Ata, cucuku… duduklah sebentar. Nenek mau bercerita.'],
      ['nenek', 'baca', 'Dahulu kala, waktu Nenek masih muda, Nenek bertualang bersama teman-teman: <b>Tim Jelajah Legenda</b>.'],
      ['nenek', 'tunjuk', 'Lihat lukisan itu. Ada jalak yang pandai bernyanyi, kura-kura pendiam, rusa yang bijak, dan roh hewan yang bercahaya.'],
      ['nenek', 'tongkat', 'Kami mencari <b>Pohon Madu Legendaris</b> di puncak Gunung Awan. Madunya bisa menghidupkan hutan yang layu.'],
      ['nenek', 'tunduk', 'Tapi kami tidak pernah sampai… Peta kami disobek menjadi lima keping, dan kami berpisah.'],
      ['ata', 'wajah', 'Nenek! Aku mau mencari Pohon Madu itu!'],
      ['nenek', 'tunjuk', 'Hohoho, semangatmu sama seperti Nenek dulu. Bukalah <b>peti kecil</b> di dekat lemari itu.'],
    ],
    peti: [
      ['sys', '', '🧭 Ata menemukan <b>Keping Peta pertama</b>!'],
      ['nenek', 'sapa', 'Itu kepingan peta milik Nenek. Empat keping lainnya disimpan teman-teman lama Nenek.'],
      ['nenek', 'tongkat', 'Perjalanan ke hutan berbahaya. Pergilah dulu ke <b>dojo</b>, berlatihlah dengan <b>Guru Panda</b>.'],
    ],
    nenekLagi: [['nenek', 'tunjuk', 'Pergilah ke dojo, cucuku. Guru Panda menunggumu. Pintunya ada di atas alun-alun.']],
    nenekPeti: [['nenek', 'tunjuk', 'Peti kecil itu ada di dekat lemari, di belakangmu. Dekati lalu tekan <b>A</b>.']],
    nenekNanti: [['nenek', 'sapa', 'Hati-hati di luar, cucuku. Kalau lelah, pulanglah ke rumah.']],
    lukisan: [['sys', '', '🖼️ Lukisan <b>Tim Jelajah Legenda</b>: Nenek waktu muda bersama jalak, kura-kura, rusa, dan roh hewan.']],
    guruAwal: [
      ['guru', 'lipat', 'Hmm. Jadi kamu Ata, cucu sahabatku. Kamu ingin mencari Pohon Madu?'],
      ['guru', 'hormat', 'Seorang <b>Taekwondoin</b> tidak hanya kuat. Ia sabar, teliti, dan cepat berpikir.'],
      ['guru', 'stop', 'Lihat ikon di atas kepala musuh. <b>💥 Kumpul tenaga</b> artinya giliran depan ia memukul keras. Saat itu, 🛡️ <b>Bertahan</b>!'],
      ['guru', 'siaga', 'Sekarang tunjukkan kuda-kudamu! Lawan Kumbang Batu latihan ini!'],
    ],
    guruLulus: [
      ['guru', 'hormat', 'Bagus sekali! Kamu lulus latihan pertama.'],
      ['guru', 'stop', 'Tunggu… Dengar itu? <b>Musuh dari Hutan Pinggir masuk ke Desa Akar!</b>'],
      ['guru', 'kuda', 'Kalahkan mereka semua! Rahasianya: dekati musuh <b>dari belakang</b> untuk <b>Serangan Kejutan</b>.'],
    ],
    guruTugas: [['guru', 'lipat', 'Masih ada musuh di desa. Kalahkan semuanya! Ingat, dekati dari belakang.']],
    guruBos: [['guru', 'stop', 'Hati-hati! <b>Raja Kumbang</b> mengamuk di depan dojo! Perhatikan saat ia 💥 kumpul tenaga.']],
    rajaMuncul: [
      ['sys', '', '💥 <b>Raja Kumbang</b> muncul di depan dojo! Ia marah karena prajuritnya dikalahkan.'],
    ],
    rajaBicara: [['sys', '', '👑 Raja Kumbang: "Siapa yang berani mengganggu prajuritku?!"']],
    tamat: [
      ['guru', 'hormat', 'Luar biasa, Ata! Raja Kumbang sudah kabur kembali ke hutan.'],
      ['nenek', 'sapa', 'Nenek bangga padamu, cucuku!'],
      ['nenek', 'tongkat', 'Sekarang kamu siap. Pergilah lewat <b>gerbang</b>, ke Hutan Pinggir. Di sana petualanganmu dimulai.'],
      ['sys', '', '🎉 <b>Prolog selesai!</b> Hutan Pinggir & Bab 1 menyusul. Sambil menunggu, coba <b>⚔️ Arena Latihan</b> di layar judul.'],
    ],
    gerbangTutup: [['guru', 'stop', 'Jangan keluar desa dulu, Ata! Selesaikan latihanmu.']],
    gerbangBuka: [['sys', '', '⛩️ Jalan ke <b>Hutan Pinggir</b>… Peta hutan belum ada — segera hadir! Coba ⚔️ Arena Latihan di layar judul.']],
    penginapan: [['sys', '', '🌙 Penginapan: tim beristirahat. Kemajuan sudah <b>disimpan</b>.']],
    sabuk: [['sys', '', '🥋 Rak sabuk: Putih → Kuning → Hijau → Biru → Merah → Hitam. Naik level untuk ikut ujian sabuk!']],
    kalah: [['nenek', 'sapa', 'Kamu pingsan di luar, cucuku. Istirahat dulu di rumah, ya. Lain kali perhatikan ikon di atas musuh!']],
  };

  // tujuan saat ini (ditampilkan di kiri atas)
  PM.goal = function (st) {
    return ['Buka peti kecil di rumah Nenek', 'Pergi ke dojo, bicara dengan Guru Panda', 'Kalahkan musuh di Desa Akar',
      'Kalahkan Raja Kumbang di depan dojo', 'Prolog selesai! 🎉'][st] || '';
  };
})();
