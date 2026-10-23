// Data misi Wilayah 1: Desa Ceria (pilar berhitung).
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
  };

  G.INTRO = [
    { who: 'ara', text: 'Halo! Aku Ara, si honey badger pemberani!' },
    { who: 'ara', text: 'Ini sahabatku, Aksa. Pemadam kebakaran cilik dari Desa Ceria!' },
    { who: 'aksa', text: 'Halo semuanya! Aku siap menolong!' },
    { who: 'ara', text: 'Gawat, Aksa! Api Jahil datang dan bikin masalah di desa!' },
    { who: 'aksa', text: 'Ayo kita tolong warga! Caranya: jawab soal berhitung!' },
    { who: 'ara', text: 'Setiap jawaban benar membuat kita makin kuat. Ayo berangkat!' },
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

  G.MISSIONS = [
    {
      title: 'Kucing di Pohon',
      icon: 'cat',
      goal: 'Si Oren terjebak di pohon. Jawab soal untuk menyambung tangga!',
      scene: 'tree',
      gens: [add10, add10, add10, add10, add10],
      prompt: () => 'Sambung tangganya!',
      visual: 'rung',
      intro: [
        { who: 'ani', text: 'Tolong! Kucingku Si Oren naik pohon dan tidak bisa turun!' },
        { who: 'aksa', text: 'Tenang, Bu Ani! Kami akan menolong!' },
        { who: 'ara', text: 'Kita perlu tangga. Setiap jawaban benar menambah satu bagian tangga!' },
      ],
      outro: [
        { who: 'ani', text: 'Si Oren selamat! Terima kasih, Aksa dan Ara!' },
        { who: 'aksa', text: 'Sama-sama, Bu Ani! Menolong itu menyenangkan!' },
      ],
      badge: 'Penolong Kucing',
      acc: 'helm',
    },
    {
      title: 'Lawan Api Jahil',
      icon: 'fire',
      goal: 'Api Jahil mau membakar tumpukan daun. Semprot dia dengan air!',
      scene: 'leaves',
      gens: [add20, add20, add20, add20, add20],
      prompt: () => 'Semprot Api Jahil!',
      intro: [
        { who: 'api', text: 'Hihihi! Aku mau membakar tumpukan daun ini!' },
        { who: 'aksa', text: 'Tidak boleh! Api bisa berbahaya!' },
        { who: 'ara', text: 'Jawab soal dengan benar untuk menyemprotkan air, Aksa!' },
      ],
      outro: [
        { who: 'api', text: 'Aduh, basah! Aku kabur saja!' },
        { who: 'ara', text: 'Hore! Apinya padam! Kamu hebat, Aksa!' },
      ],
      badge: 'Pemadam Api',
      acc: 'syal',
    },
    {
      title: 'Toko Roti Pak Budi',
      icon: 'bread',
      goal: 'Ada api kecil di toko roti. Hitung sisa apinya!',
      scene: 'bakery',
      gens: [sub20, sub20, sub20, sub20, sub20],
      prompt: (q) => `Ada ${q.a} api. Padamkan ${q.b}. Sisa berapa?`,
      visual: 'flame',
      intro: [
        { who: 'budi', text: 'Toloong! Ada api kecil di toko rotiku!' },
        { who: 'aksa', text: 'Kami datang, Pak Budi!' },
        { who: 'ara', text: 'Api yang sudah padam kita coret. Hitung yang tersisa ya!' },
      ],
      outro: [
        { who: 'budi', text: 'Rotiku selamat! Ini roti hangat untuk kalian.' },
        { who: 'ara', text: 'Nyam nyam! Terima kasih, Pak Budi!' },
      ],
      badge: 'Sahabat Toko Roti',
      acc: 'kacamata',
    },
    {
      title: 'Isi Ember Air',
      icon: 'bucket',
      goal: 'Tangki truk pemadam kosong. Isi airnya sampai penuh!',
      scene: 'truck',
      gens: [add20, sub20, add20, mul, add20],
      prompt: (q) =>
        q.op === '+' ? `Ada ${q.a} liter air. Tambah ${q.b} liter!`
        : q.op === '−' ? `Ada ${q.a} liter. Tumpah ${q.b} liter!`
        : `Ada ${q.a} ember. Tiap ember ${q.b} liter!`,
      visual: (q) => (q.op === '×' ? 'drop' : null),
      intro: [
        { who: 'joko', text: 'Waduh, tangki air truk pemadam kosong!' },
        { who: 'aksa', text: 'Ayo kita isi dengan ember, Pak Joko!' },
        { who: 'ara', text: 'Hitung airnya ya, Aksa. Jangan sampai tumpah!' },
      ],
      outro: [
        { who: 'joko', text: 'Tangki penuh! Truk siap berangkat! Wiu wiu!' },
        { who: 'ara', text: 'Kita juga siap! Ada suara ribut di balai desa...' },
      ],
      badge: 'Ahli Air',
      acc: 'sepatu',
    },
    {
      title: 'Raja Api Jahil',
      icon: 'crown',
      goal: 'Raja Api Jahil ada di balai desa. Padamkan dia!',
      scene: 'boss',
      gens: [add20, sub20, add20, sub20, add20, sub20, add20],
      prompt: () => 'Semprot Raja Api!',
      intro: [
        { who: 'raja', text: 'HOHOHO! Aku Raja Api Jahil! Balai desa ini milikku!' },
        { who: 'ara', text: 'Dia besar sekali... tapi kita tidak takut!' },
        { who: 'aksa', text: 'Kita pemberani! Ayo padamkan, Ara!' },
      ],
      outro: [
        { who: 'raja', text: 'Tidaaak! Aku kalah... Maaf ya, aku tidak akan jahil lagi.' },
        { who: 'aksa', text: 'Kami maafkan. Ayo jadi teman yang baik!' },
        { who: 'kades', text: 'Aksa dan Ara, kalian adalah Pahlawan Desa Ceria!' },
        { who: 'ara', text: 'Terima kasih sudah bermain! Sampai jumpa di petualangan berikutnya!' },
      ],
      badge: 'Pahlawan Desa Ceria',
      acc: 'jubah',
    },
  ];

  G.PRAISE = ['Hebat!', 'Pintar sekali!', 'Betul! Mantap!', 'Keren, Aksa!', 'Luar biasa!', 'Hore, benar!'];
  G.TRY = ['Hampir! Ayo coba lagi.', 'Tidak apa-apa, kita hitung bareng!', 'Belum tepat. Kamu pasti bisa!'];
})();
