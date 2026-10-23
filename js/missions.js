// Data masalah warga Desa Ceria (pilar berhitung). Empat masalah bisa diselesaikan
// dengan urutan bebas; Raja Api Jahil muncul setelah keempatnya selesai.
(function () {
  const G = (window.G = window.G || {});
  const { add, sub, mul } = G.Q;

  G.CHARS = {
    aksa: { name: 'Aksa', color: '#d63c2f' },
    ara: { name: 'Ara', color: '#3a3a3a' },
    ani: { name: 'Bu Ani', color: '#e86fa0' },
    budi: { name: 'Pak Budi', color: '#c98a45' },
    joko: { name: 'Pak Joko', color: '#2f7fd1' },
    kades: { name: 'Pak Kepala Desa', color: '#8a5a2b' },
    api: { name: 'Api Jahil', color: '#e8451c' },
    raja: { name: 'Raja Api Jahil', color: '#b8240c' },
    papan: { name: 'Papan', color: '#8a5a2b' },
    siti: { name: 'Bu Siti', color: '#3fa34d' },
    udin: { name: 'Kakek Udin', color: '#7a7a7a' },
  };

  G.INTRO = [
    { who: 'ara', text: 'Halo! Aku Ara, si honey badger pemberani!' },
    { who: 'ara', text: 'Ini sahabatku, Aksa. Pemadam kebakaran cilik dari Desa Ceria!' },
    { who: 'aksa', text: 'Halo semuanya! Aku siap menolong!' },
    { who: 'ara', text: 'Gawat, Aksa! Banyak warga yang butuh bantuan hari ini!' },
    { who: 'ara', text: 'Cari warga yang ada tanda ❗ di atas kepalanya.' },
    { who: 'ara', text: 'Ketuk tanah untuk berjalan. Ketuk warga untuk bicara!' },
  ];

  G.BOSS_APPEAR = [
    { who: 'ara', text: 'Aksa, lihat! Ada api besar di depan Balai Desa!' },
    { who: 'aksa', text: 'Itu pasti Raja Api Jahil! Ayo ke sana, Ara!' },
  ];

  G.ACCESSORIES = {
    helm: 'Helm Mungil',
    syal: 'Syal Kuning',
    kacamata: 'Kacamata Keren',
    sepatu: 'Sepatu Bot',
    jubah: 'Jubah Pahlawan',
  };

  const add10 = () => add(10);
  const add20 = () => add(20);
  const sub20 = () => sub(20);

  // Urutan di sini = urutan lencana di koleksi.
  G.PROBLEMS = [
    {
      id: 'kucing',
      title: 'Kucing di Pohon',
      icon: 'cat',
      npc: 'ani',
      enemy: 'pohon',
      enemyName: 'Si Oren di Pohon',
      bar: { label: 'Tangga', mode: 'fill', color: '#c98a45' },
      gens: [add10, add10, add10, add10, add10],
      prompt: () => 'Sambung tangganya!',
      start: 'Si Oren terjebak di atas pohon!',
      win: 'Tangga sampai! Si Oren bisa turun!',
      ask: [
        { who: 'ani', text: 'Tolong! Kucingku Si Oren naik pohon dan tidak bisa turun!' },
        { who: 'aksa', text: 'Tenang, Bu Ani! Kami akan menolong!' },
        { who: 'ara', text: 'Setiap jawaban benar menambah satu bagian tangga!' },
      ],
      thanks: [
        { who: 'ani', text: 'Si Oren selamat! Terima kasih, Aksa dan Ara!' },
        { who: 'aksa', text: 'Sama-sama, Bu Ani! Menolong itu menyenangkan!' },
      ],
      after: [{ who: 'ani', text: 'Si Oren sudah aman bersamaku. Terima kasih ya!' }],
      badge: 'Penolong Kucing',
      acc: 'helm',
    },
    {
      id: 'daun',
      title: 'Api di Tumpukan Daun',
      icon: 'fire',
      npc: 'api',
      enemy: 'api',
      enemyName: 'Api Jahil',
      bar: { label: 'Api', mode: 'drain', color: '#ff8c1a' },
      gens: [add20, add20, add20, add20, add20],
      prompt: () => 'Semprot Api Jahil!',
      start: 'Api Jahil mengajak bertanding!',
      win: 'Api Jahil padam!',
      ask: [
        { who: 'api', text: 'Hihihi! Aku mau membakar tumpukan daun ini!' },
        { who: 'aksa', text: 'Tidak boleh! Api bisa berbahaya!' },
        { who: 'ara', text: 'Jawab soal dengan benar untuk menyemprotkan air!' },
      ],
      thanks: [
        { who: 'api', text: 'Aduh, basah! Aku kabur saja!' },
        { who: 'ara', text: 'Hore! Apinya padam! Kamu hebat, Aksa!' },
      ],
      badge: 'Pemadam Api',
      acc: 'syal',
    },
    {
      id: 'roti',
      title: 'Toko Roti Pak Budi',
      icon: 'bread',
      npc: 'budi',
      enemy: 'roti',
      enemyName: 'Api Toko Roti',
      bar: { label: 'Api', mode: 'drain', color: '#ff8c1a' },
      gens: [sub20, sub20, sub20, sub20, sub20],
      prompt: (q) => `Ada ${q.a} api. Padamkan ${q.b}. Sisa berapa?`,
      start: 'Api kecil menyala di toko roti!',
      win: 'Semua api di toko roti padam!',
      ask: [
        { who: 'budi', text: 'Toloong! Ada api kecil di toko rotiku!' },
        { who: 'aksa', text: 'Kami datang, Pak Budi!' },
        { who: 'ara', text: 'Api yang sudah padam kita coret. Hitung yang tersisa ya!' },
      ],
      thanks: [
        { who: 'budi', text: 'Rotiku selamat! Ini roti hangat untuk kalian.' },
        { who: 'ara', text: 'Nyam nyam! Terima kasih, Pak Budi!' },
      ],
      after: [{ who: 'budi', text: 'Toko rotiku buka lagi! Mampir kapan-kapan ya!' }],
      badge: 'Sahabat Toko Roti',
      acc: 'kacamata',
    },
    {
      id: 'truk',
      title: 'Tangki Truk Kosong',
      icon: 'bucket',
      npc: 'joko',
      enemy: 'truk',
      enemyName: 'Tangki Kosong',
      bar: { label: 'Air', mode: 'fill', color: '#4fb3ff' },
      gens: [add20, sub20, add20, mul, add20],
      prompt: (q) =>
        q.op === '+' ? `Ada ${q.a} liter air. Tambah ${q.b} liter!`
        : q.op === '−' ? `Ada ${q.a} liter. Tumpah ${q.b} liter!`
        : `Ada ${q.a} ember. Tiap ember ${q.b} liter!`,
      start: 'Tangki air truk pemadam kosong!',
      win: 'Tangki air penuh!',
      ask: [
        { who: 'joko', text: 'Waduh, tangki air truk pemadam kosong!' },
        { who: 'aksa', text: 'Ayo kita isi dengan ember, Pak Joko!' },
        { who: 'ara', text: 'Hitung airnya ya, Aksa. Jangan sampai tumpah!' },
      ],
      thanks: [
        { who: 'joko', text: 'Tangki penuh! Truk siap berangkat! Wiu wiu!' },
        { who: 'aksa', text: 'Siap, Pak Joko!' },
      ],
      after: [{ who: 'joko', text: 'Truk pemadam siap kapan saja!' }],
      badge: 'Ahli Air',
      acc: 'sepatu',
    },
    {
      id: 'ayam',
      title: 'Anak Ayam Lepas',
      icon: 'chick',
      npc: 'siti',
      enemy: 'ayam',
      enemyName: 'Anak Ayam Lepas',
      bar: { label: 'Kandang', mode: 'fill', color: '#f4c430' },
      gens: [add10],
      prompt: (q) => `Ada ${q.a} anak ayam di kandang dan ${q.b} di luar. Semuanya berapa?`,
      start: 'Anak ayam berlarian ke mana-mana!',
      win: 'Semua anak ayam masuk kandang!',
      ask: [
        { who: 'siti', text: 'Aduh, pintu kandang terbuka! Anak ayamku lepas!' },
        { who: 'aksa', text: 'Ayo kita hitung dan kumpulkan, Bu Siti!' },
      ],
      thanks: [{ who: 'siti', text: 'Anak ayamku lengkap lagi! Terima kasih, Aksa dan Ara!' }],
      after: [{ who: 'siti', text: 'Ciap ciap! Anak ayamku senang sekali.' }],
      badge: 'Sahabat Anak Ayam',
    },
    {
      id: 'hidran',
      title: 'Hidran Bocor',
      icon: 'hydrant',
      npc: 'udin',
      enemy: 'hidran',
      enemyName: 'Hidran Bocor',
      bar: { label: 'Bocor', mode: 'drain', color: '#4fb3ff' },
      gens: [sub20],
      prompt: () => 'Putar kerannya! Jawab soal ini:',
      start: 'Air hidran menyembur ke jalan!',
      win: 'Hidran tertutup rapat!',
      ask: [
        { who: 'udin', text: 'Waduh, hidran air bocor! Jalan jadi licin!' },
        { who: 'aksa', text: 'Serahkan pada kami, Kakek Udin!' },
      ],
      thanks: [{ who: 'udin', text: 'Hidrannya sudah rapat. Kalian anak hebat!' }],
      after: [{ who: 'udin', text: 'Hidran ini penting untuk memadamkan api, lho!' }],
      badge: 'Penjaga Hidran',
    },
  ];

  G.BOSS = {
    id: 'raja',
    title: 'Raja Api Jahil',
    icon: 'crown',
    npc: 'raja',
    enemy: 'raja',
    enemyName: 'Raja Api Jahil',
    bar: { label: 'Api', mode: 'drain', color: '#ff5a1a' },
    gens: [add20, sub20, add20, sub20, add20, sub20, add20],
    prompt: () => 'Semprot Raja Api!',
    start: 'Raja Api Jahil menantang!',
    win: 'Raja Api Jahil padam!',
    ask: [
      { who: 'raja', text: 'HOHOHO! Aku Raja Api Jahil! Balai desa ini milikku!' },
      { who: 'ara', text: 'Dia besar sekali... tapi kita tidak takut!' },
      { who: 'aksa', text: 'Kita pemberani! Ayo padamkan, Ara!' },
    ],
    thanks: [
      { who: 'raja', text: 'Tidaaak! Aku kalah... Maaf ya, aku tidak akan jahil lagi.' },
      { who: 'aksa', text: 'Kami maafkan. Ayo jadi teman yang baik!' },
      { who: 'kades', text: 'Aksa dan Ara, kalian adalah Pahlawan Desa Ceria!' },
      { who: 'ara', text: 'Terima kasih sudah bermain! Sampai jumpa di petualangan berikutnya!' },
    ],
    badge: 'Pahlawan Desa Ceria',
    acc: 'jubah',
  };
  G.ALL = [...G.PROBLEMS, G.BOSS];

  G.KADES = {
    before: [
      { who: 'kades', text: 'Halo, Aksa dan Ara! Warga desa sedang butuh bantuan.' },
      { who: 'kades', text: 'Cari warga yang ada tanda ❗ ya. Bebas mau tolong yang mana dulu!' },
    ],
    boss: [{ who: 'kades', text: 'Tolong! Raja Api Jahil ada di depan Balai Desa!' }],
    done: [{ who: 'kades', text: 'Desa Ceria aman berkat kalian, Pahlawan Desa!' }],
  };
  G.SIGN = [{ who: 'papan', text: '🏡 Selamat datang di Desa Ceria! Desa yang ramah dan ceria.' }];

  G.PRAISE = ['Hebat!', 'Pintar sekali!', 'Betul! Mantap!', 'Keren, Aksa!', 'Luar biasa!', 'Hore, benar!'];
  G.TRY = ['Belum tepat. Hitung lagi pelan-pelan ya!', 'Hampir! Coba hitung sekali lagi.', 'Belum benar. Kamu pasti bisa!'];
})();
