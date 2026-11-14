'use strict';
const AT = { VERSION: 3 };
/* Data karakter, jurus, misi, dan cerita Bab 1. */

const CHARS = {
  ata: { name: 'Ata', job: 'Taekwondoin', desc: 'Honey badger pemberani. Paling cepat!', hp: 26, atk: 8, def: 3, mov: 5, jump: 2, rmin: 1, rmax: 1,
    skills: ['kilat', 'putar', 'sabuk'], passive: 'Refleks Kilat: kadang menghindar lalu membalas tendangan.',
    animal: 'Honey badger', bio: 'Cucu Nenek dari kebun kecil di tepi Savana. Pemberani, cepat, dan jago taekwondo. Ingin menemukan Madu Legendaris dari dongeng Nenek.',
    tip: 'Serang musuh dari belakang supaya kerusakannya lebih besar. Ata paling cepat, jadi cocok untuk mengejar musuh!' },
  ladhia: { name: 'Ladhia', job: 'Tanker', desc: 'Badak hitam berarmor. Galak di luar, baik di dalam.', hp: 36, atk: 7, def: 6, mov: 3, jump: 1, rmin: 1, rmax: 2,
    skills: ['tantang', 'benteng'], passive: 'Kulit Baja: serangan dari belakang tidak terlalu sakit. Rantai meteor menjangkau 2 petak.',
    animal: 'Badak hitam', bio: 'Bertubuh besar dengan armor, perisai, dan rantai meteor. Wajahnya galak, tapi hatinya baik dan selalu melindungi teman.',
    tip: 'Taruh Ladhia di depan. Pakai Tantang supaya musuh menyerang Ladhia, bukan teman yang lemah.' },
  bubunti: { name: 'Bubunti', job: 'Koki', desc: 'Llama putih berhati lembut, jago masak.', hp: 20, atk: 4, def: 2, mov: 4, jump: 1, rmin: 1, rmax: 1,
    skills: ['sup', 'pedas'], passive: 'Hati Lembut: masakannya bikin teman semangat.',
    animal: 'Llama putih', bio: 'Koki dari desa di lembah. Tidak suka bertengkar. Masakannya menyembuhkan teman, dan masakan pedasnya bikin musuh kepanasan.',
    tip: 'Jaga Bubunti di belakang. Sembuhkan teman yang nyawanya tinggal sedikit dengan Sup Hangat.' },
  oumaldi: { name: 'Oumaldi', job: 'Pemanah', desc: 'Tupai pemanah yang gesit. Dulu suka bekerja sendirian.', hp: 20, atk: 7, def: 2, mov: 4, jump: 2, rmin: 2, rmax: 4,
    skills: ['jitu', 'hujan'], passive: 'Mata Elang: dari tempat tinggi, panahnya +1 petak lebih jauh dan pandangannya menembus kabut. Tidak bisa memanah musuh yang menempel.',
    animal: 'Tupai', bio: 'Pemanah gesit dari Hutan Lembab. Dulu suka bekerja sendirian, sekarang tahu bahwa menang bersama lebih seru.',
    tip: 'Naikkan Oumaldi ke tempat tinggi supaya panahnya lebih jauh. Jangan biarkan musuh menempel padanya!' },
};

const FUTURE = [
  { name: 'Tung Momon', desc: 'Jalak pemusik', bab: 'Bab 3' },
  { name: 'Tung Yanto', desc: 'Kura-kura penyihir', bab: 'Bab 3' },
  { name: 'Utireni', desc: 'Rusa penyerang', bab: 'Bab 4' },
  { name: 'Utililik', desc: 'Roh bandeng pemanggil roh', bab: 'Bab 4' },
];

const ENEMIES = {
  kumbang: { name: 'Kumbang Batu', hp: 12, atk: 5, def: 2, mov: 3, jump: 1, rmin: 1, rmax: 1, madu: 2 },
  tawon: { name: 'Tawon Nakal', hp: 10, atk: 5, def: 1, mov: 5, jump: 9, rmin: 1, rmax: 1, madu: 2, fly: true },
  siput: { name: 'Siput Lendir', hp: 20, atk: 6, def: 4, mov: 2, jump: 1, rmin: 1, rmax: 1, madu: 3 },
  rajaKumbang: { name: 'Raja Kumbang', hp: 38, atk: 7, def: 4, mov: 2, jump: 1, rmin: 1, rmax: 1, madu: 10, boss: true, summonKind: 'kumbang', call: 'Prajurit kumbang, maju!' },
  musang: { name: 'Musang Bayangan', hp: 12, atk: 5, def: 1, mov: 4, jump: 1, rmin: 1, rmax: 1, madu: 2 },
  kelelawar: { name: 'Kelelawar Tambang', hp: 11, atk: 5, def: 1, mov: 3, jump: 9, rmin: 2, rmax: 3, madu: 2, ranged: true, fly: true },
  kadal: { name: 'Kadal Kerikil', hp: 20, atk: 7, def: 3, mov: 3, jump: 1, rmin: 1, rmax: 1, madu: 3 },
  landak: { name: 'Landak Baja', hp: 24, atk: 7, def: 5, mov: 2, jump: 1, rmin: 1, rmax: 1, madu: 4 },
  // Bab 2 Hutan Lembab. mudOk = tidak melambat di lumpur, swim = bisa berenang, onHit = efek serangan
  nyamuk: { name: 'Nyamuk Rawa', hp: 9, atk: 5, def: 1, mov: 5, jump: 9, rmin: 1, rmax: 1, madu: 2, fly: true },
  katak: { name: 'Katak Lumpur', hp: 16, atk: 6, def: 3, mov: 3, jump: 2, rmin: 1, rmax: 1, madu: 3, mudOk: true },
  jamur: { name: 'Jamur Spora', hp: 14, atk: 4, def: 2, mov: 2, jump: 1, rmin: 1, rmax: 2, madu: 3, onHit: 'tidur', proj: '🍄' },
  belut: { name: 'Belut Listrik', hp: 13, atk: 6, def: 2, mov: 4, jump: 1, rmin: 1, rmax: 1, madu: 3, swim: true, mudOk: true },
  lumpurRaksasa: { name: 'Lumpur Raksasa', hp: 46, atk: 8, def: 4, mov: 2, jump: 1, rmin: 1, rmax: 1, madu: 10, boss: true, mudOk: true, split: 'lumpurKecil' },
  lumpurKecil: { name: 'Lumpur Kecil', hp: 12, atk: 5, def: 2, mov: 3, jump: 1, rmin: 1, rmax: 1, madu: 2, mudOk: true },
  ular: { name: 'Ular Beracun', hp: 62, atk: 10, def: 5, mov: 3, jump: 1, rmin: 1, rmax: 2, madu: 15, boss: true, swim: true, mudOk: true, onHit: 'racun', summonKind: 'belut', call: 'Ssshh! Belut-belutku, keluarlah!' },
  kepalaMusang: { name: 'Kepala Musang', hp: 46, atk: 8, def: 4, mov: 3, jump: 2, rmin: 1, rmax: 1, madu: 12, boss: true, summonKind: 'musang', call: 'Geng Musang, serbu!' },
};
const NPCS = { zizi: { name: 'Zizi', hp: 28, atk: 0, def: 3, mov: 0, jump: 0, rmin: 0, rmax: 0 } };

const SKILLS = {
  kilat: { name: 'Tendangan Kilat', icon: '⚡', cost: 2, target: 'enemy', rmin: 1, rmax: 1, desc: 'Tendang 2 kali berturut-turut!' },
  putar: { name: 'Tendangan Putar', icon: '🌀', cost: 3, target: 'self', desc: 'Kena semua musuh di sekeliling Ata.' },
  sabuk: { name: 'Mode Sabuk Hitam', icon: '🥋', cost: 5, target: 'self', desc: 'Super kuat (+4) dan lebih cepat selama 3 giliran!' },
  tantang: { name: 'Tantang!', icon: '📣', cost: 2, target: 'self', desc: 'Musuh terpancing menyerang Ladhia saja.' },
  benteng: { name: 'Benteng Badak', icon: '🛡️', cost: 3, target: 'self', desc: 'Ladhia dan teman di sebelahnya: pertahanan +3.' },
  sup: { name: 'Sup Hangat', icon: '🍲', cost: 2, target: 'ally', rmin: 0, rmax: 3, desc: 'Sembuhkan satu teman (jarak 3). Juga membangunkan yang tertidur dan menyembuhkan racun.' },
  jitu: { name: 'Panah Jitu', icon: '🎯', cost: 2, target: 'enemy', rmin: 2, rmax: 5, desc: 'Panah kuat yang menembus pertahanan musuh. Jangkauan 5!' },
  hujan: { name: 'Hujan Panah', icon: '🌧️', cost: 4, target: 'enemy', rmin: 2, rmax: 4, desc: 'Kena musuh sasaran dan semua musuh di sebelahnya.' },
  pedas: { name: 'Masakan Pedas', icon: '🌶️', cost: 3, target: 'enemy', rmin: 1, rmax: 3, desc: 'Lempar masakan super pedas! Musuh kepedasan dan tidak bisa bergerak 1 giliran.' },
};

const WHO = {
  nenek: { name: 'Nenek', kind: 'nenek', voice: [1.15, 0.85] },
  ata: { name: 'Ata', kind: 'ata', voice: [1.5, 1.05] },
  ladhia: { name: 'Ladhia', kind: 'ladhia', voice: [0.45, 0.9] },
  bubunti: { name: 'Bubunti', kind: 'bubunti', voice: [1.3, 0.95] },
  kumbang: { name: 'Kumbang Batu', kind: 'kumbang', voice: [1.5, 1.1] },
  rajaK: { name: 'Raja Kumbang', kind: 'rajaKumbang', voice: [0.5, 0.85] },
  musang: { name: 'Musang Bayangan', kind: 'musang', voice: [1.3, 1.15] },
  kelelawar: { name: 'Kelelawar Tambang', kind: 'kelelawar', voice: [1.8, 1.2] },
  kepala: { name: 'Kepala Musang', kind: 'kepalaMusang', voice: [0.6, 0.9] },
  oumaldi: { name: 'Oumaldi', kind: 'oumaldi', voice: [1.6, 1.15] },
  nyamuk: { name: 'Nyamuk Rawa', kind: 'nyamuk', voice: [1.9, 1.25] },
  katak: { name: 'Katak Lumpur', kind: 'katak', voice: [0.6, 0.95] },
  jamur: { name: 'Jamur Spora', kind: 'jamur', voice: [1.2, 0.9] },
  lumpur: { name: 'Lumpur Raksasa', kind: 'lumpurRaksasa', voice: [0.3, 0.8] },
  ular: { name: 'Ular Beracun', kind: 'ular', voice: [0.7, 0.85] },
  zizi: { name: 'Zizi', kind: 'zizi', voice: [1.9, 1.1] },
  narator: { name: '', kind: null, voice: [1, 0.95] },
};

const STORY = {
  prolog: [
    ['narator', 'Di sebuah kebun kecil di tepi Savana, tinggallah seekor honey badger pemberani bernama Ata.'],
    ['nenek', 'Ata, dulu Nenek pernah berpetualang bersama sahabat-sahabat Nenek. Kami mencari Madu Legendaris.'],
    ['ata', 'Madu Legendaris? Yang katanya paling manis sedunia itu, Nek?'],
    ['nenek', 'Iya. Madu itu tersimpan di puncak Gunung Sarang Emas. Tapi perjalanan kami terhenti, dan teman-teman Nenek berpencar.'],
    ['nenek', 'Kalau kamu bertemu sahabat lama Nenek, mereka pasti mau membantumu.'],
    ['ata', 'Aku mau mencarinya! Hiyaaa! Tendangan taekwondoku sudah siap!'],
  ],
  m1pre: [
    ['kumbang', 'Krek krek! Wortelnya renyah sekali! Habiskan semua!'],
    ['nenek', 'Aduh! Kumbang Batu mengacak-acak kebun Nenek!'],
    ['ata', 'Hei! Jangan ganggu kebun Nenek! Rasakan tendanganku!'],
  ],
  m1post: [
    ['kumbang', 'Aduh, aduh! Ampun! Kami cuma disuruh Raja Kumbang!'],
    ['nenek', 'Raja Kumbang dan pasukannya sekarang suka berbuat usil di Savana. Hati-hati, Ata.'],
    ['ata', 'Tenang, Nek. Aku berangkat sekarang!'],
  ],
  m2pre: [
    ['ata', 'Wah, Savana luas sekali. Jalannya naik turun bukit.'],
    ['kumbang', 'Ada musang kecil lewat! Kepung dia!'],
    ['ata', 'Aku bukan musang! Aku honey badger!'],
  ],
  m2post: [
    ['ata', 'Fiuh, selesai juga.'],
    ['narator', 'Tiba-tiba terdengar suara keras dari arah kubangan lumpur.'],
    ['ata', 'Suara apa itu? Sepertinya ada yang sedang dikeroyok!'],
  ],
  m3pre: [
    ['ladhia', 'Grrr! Kalian pikir aku takut? Majulah!'],
    ['kumbang', 'Badak sendirian! Ayo keroyok dia!'],
    ['ata', 'Badak itu dikepung! Aku harus membantu!'],
    ['ladhia', 'Hmph. Bocah kecil? Baiklah, bantu aku!'],
  ],
  m3post: [
    ['ladhia', 'Kau kuat juga, bocah kecil. Namaku Ladhia.'],
    ['ata', 'Aku Ata! Aku sedang mencari Madu Legendaris dan sahabat-sahabat nenekku.'],
    ['ladhia', 'Madu Legendaris? Wajahku memang galak, tapi aku suka petualangan. Aku ikut!'],
  ],
  m4pre: [
    ['zizi', 'Kakak-kakak, tolong! Raja Kumbang mau merebut sumur desa kami!'],
    ['rajaK', 'Krak krak! Sumur ini sekarang milik Raja Kumbang! Prajurit, serbu!'],
    ['ladhia', 'Berdiri di dekat sumur, Zizi. Kami yang jaga.'],
    ['ata', 'Kita kalahkan Raja Kumbang!'],
  ],
  m4post: [
    ['rajaK', 'Aduh, cangkangku pusing! Ampun! Aku cuma ingin dipuji Kepala Musang...'],
    ['ata', 'Kepala Musang? Siapa itu?'],
    ['rajaK', 'Ketua Geng Musang Bayangan. Dia merampas guci madu desa lembah, lalu menyuruh kami berjaga di sini.'],
    ['zizi', 'Terima kasih, Kakak! Kata ayahku, di desa lembah ada koki llama yang masakannya bisa bikin sembuh. Jalannya lewat Bukit Batu.'],
    ['ladhia', 'Bukit Batu dijaga kelelawar tambang. Kita harus cepat.'],
  ],
  m5pre: [
    ['kelelawar', 'Kiik kiik! Tidak ada yang boleh lewat Bukit Batu!'],
    ['ata', 'Kita harus sampai ke bendera di puncak bukit!'],
  ],
  m5post: [
    ['ata', 'Lihat! Ada desa di lembah! Baunya harum sekali!'],
    ['ladhia', 'Tapi ada asap dan suara ribut. Ayo turun!'],
  ],
  m6pre: [
    ['bubunti', 'Tolong jangan ambil panci-pancikuuu, itu untuk memasak sup warga desa.'],
    ['musang', 'Hehehe! Kepala Musang lapar! Semua makanan ini milik Kepala!'],
    ['ata', 'Llama itu dalam bahaya! Ayo, Ladhia!'],
    ['bubunti', 'Kalian mau menolongku? Aku Bubunti! Aku tidak suka bertengkar, tapi masakan pedasku bisa bikin mereka kepanasan!'],
  ],
  m6post: [
    ['bubunti', 'Terima kasih, teman-teman! Ini, makan dulu sup hangatnya.'],
    ['ata', 'Mmm, enak sekali! Badanku jadi segar!'],
    ['bubunti', 'Tapi Kepala Musang merampas guci madu desa kami. Dia kira itu Madu Legendaris.'],
    ['ladhia', 'Kepala Musang tinggal di Batu Singgasana. Dia juga menghalangi jalan keluar Savana.'],
    ['bubunti', 'Aku ikut kalian! Petualang butuh koki, kan?'],
  ],
  m7pre: [
    ['kepala', 'Hohoho! Jadi kalian yang mengalahkan Raja Kumbang? Madu ini milikku!'],
    ['ata', 'Itu madu warga desa! Kembalikan!'],
    ['kepala', 'Kalau berani, naik ke singgasanaku! Geng Musang, serbu mereka!'],
  ],
  m7post: [
    ['kepala', 'Aduh, aduh, ampun! Ini, ambil gucinya! Rasanya juga biasa saja!'],
    ['bubunti', 'Guci madu desa kembali!'],
    ['ata', 'Eh, ada tulisan di bawah guci. Untuk sahabatku, Tung Momon dan Tung Yanto. Rawa Bulan.'],
    ['ladhia', 'Tung Momon dan Tung Yanto? Apakah itu teman nenekmu?'],
    ['ata', 'Pasti! Nenek pernah menyebut nama itu. Tapi jalan ke Rawa Bulan lewat Hutan Lembab.'],
    ['bubunti', 'Katanya di Hutan Lembab ada Ular Beracun yang licik sekali.'],
    ['ata', 'Kita hadapi bersama! Petualangan kita baru dimulai!'],
  ],
  b1pre: [
    ['narator', 'Ata, Ladhia, dan Bubunti memasuki Hutan Lembab. Udaranya basah dan berkabut.'],
    ['bubunti', 'Brrr, tanahnya becek sekali. Kakiku tenggelam di lumpur!'],
    ['ladhia', 'Hati-hati. Jalan di lumpur membuat langkah kita lebih pendek.'],
    ['nyamuk', 'Nguuung! Ada tamu segar! Serbuuu!'],
  ],
  b1post: [
    ['ata', 'Hutan ini banyak penjaganya. Siapa yang menyuruh mereka?'],
    ['katak', 'Kwaak! Ular Beracun! Dia raja hutan sekarang. Semua takut padanya!'],
    ['ladhia', 'Kalau begitu kita harus lebih hati-hati.'],
  ],
  b2pre: [
    ['ata', 'Ada sungai! Kita harus menyeberang lewat jembatan akar itu.'],
    ['bubunti', 'Lihat, ada yang berenang di dalam air!'],
    ['ladhia', 'Belut Listrik. Mereka bisa berenang dan menyerang dari air. Jangan berdiri terlalu dekat sungai.'],
  ],
  b2post: [
    ['narator', 'Tiba-tiba sebuah anak panah menancap di batang pohon, tepat di sebelah Ata.'],
    ['oumaldi', 'Hei! Jangan berisik! Kalian membuat buruanku lari!'],
    ['ata', 'Siapa itu? Ayo tunjukkan dirimu!'],
    ['narator', 'Tapi sosok itu sudah melompat pergi di antara dahan pohon.'],
  ],
  b3pre: [
    ['bubunti', 'Wah, jamurnya besar-besar! Bisa jadi sup jamur yang enak!'],
    ['jamur', 'Pfffft! Siapa yang mau memasak kami? Rasakan spora tidur!'],
    ['ladhia', 'Awas! Kalau kena sporanya, kita tertidur satu giliran.'],
    ['bubunti', 'Tenang, Sup Hangatku bisa membangunkan teman yang tertidur!'],
  ],
  b3post: [
    ['ata', 'Fiuh. Untung ada sup Bubunti.'],
    ['narator', 'Dari kejauhan terdengar teriakan minta tolong.'],
    ['oumaldi', 'Pergi kalian! Aku tidak butuh bantuan siapa pun!'],
    ['ata', 'Itu suara si pemanah tadi! Dia dikepung!'],
  ],
  b4pre: [
    ['oumaldi', 'Anak panahku tinggal sedikit... Tapi aku bisa sendiri!'],
    ['ata', 'Kamu tidak sendirian! Kami datang membantu!'],
    ['oumaldi', 'Hmph. Ya sudah, tapi jangan menghalangi panahku.'],
    ['ladhia', 'Lindungi pemanah itu. Jangan biarkan musuh menempel padanya.'],
  ],
  b4post: [
    ['oumaldi', 'Tadi aku hampir kalah... Terima kasih. Namaku Oumaldi.'],
    ['ata', 'Aku Ata! Kami mencari Madu Legendaris dan sahabat-sahabat nenekku.'],
    ['oumaldi', 'Madu Legendaris? Ibuku pernah bercerita tentang tim penjelajah hebat yang mencarinya.'],
    ['oumaldi', 'Ternyata menang bersama lebih seru daripada menang sendirian. Boleh aku ikut?'],
    ['bubunti', 'Tentu saja! Tim kita jadi berempat!'],
  ],
  b5pre: [
    ['narator', 'Rawa penuh lumpur menghadang. Tiba-tiba lumpurnya bergerak dan berdiri!'],
    ['lumpur', 'Gloook... Tidak ada yang boleh lewat rawaku...'],
    ['oumaldi', 'Wah, lumpurnya hidup! Aku panah dari jauh saja!'],
    ['ladhia', 'Hati-hati. Makhluk lumpur kadang bisa terbelah.'],
  ],
  b5post: [
    ['lumpur', 'Gloook... aku... cuma ingin rawaku tenang...'],
    ['ata', 'Kami tidak akan merusak rawamu. Kami hanya mau lewat.'],
    ['narator', 'Lumpur Raksasa perlahan meleleh kembali ke rawa, dan jalan pun terbuka.'],
  ],
  b6pre: [
    ['bubunti', 'Kabutnya tebal sekali. Aku tidak bisa melihat apa-apa!'],
    ['oumaldi', 'Biar aku naik ke tempat tinggi. Mataku tajam, aku bisa melihat lebih jauh!'],
    ['ladhia', 'Musuh bisa bersembunyi di dalam kabut. Bergerak pelan-pelan dan tetap bersama.'],
  ],
  b6post: [
    ['oumaldi', 'Kabutnya mulai hilang. Lihat, di sana ada kolam besar!'],
    ['ata', 'Pasti itu sarang Ular Beracun!'],
  ],
  b7pre: [
    ['ular', 'Ssshh... Siapa berani masuk ke sarangku?'],
    ['ata', 'Kami mau lewat ke Rawa Bulan! Berhenti mengganggu penghuni hutan!'],
    ['ular', 'Hutan ini milikku. Gigitanku beracun, sssh! Kalian akan lemas pelan-pelan.'],
    ['bubunti', 'Kalau ada yang keracunan, aku sembuhkan dengan Sup Hangat!'],
  ],
  b7post: [
    ['ular', 'Ssshh... aku kalah. Baiklah, aku tidak akan menakut-nakuti hutan lagi.'],
    ['oumaldi', 'Hore! Hutan Lembab aman!'],
    ['ata', 'Ini, ada sesuatu di sarang ular. Sobekan peta yang mirip punya Nenek!'],
    ['ladhia', 'Peta itu menunjuk ke Rawa Bulan. Tempat tinggal Tung Momon dan Tung Yanto.'],
    ['ata', 'Ayo teman-teman, petualangan kita berlanjut!'],
  ],
};

/* Tipe: rout = kalahkan semua, boss = kalahkan bos, survive = bertahan n giliran, reach = capai bendera */
const MISSIONS = [
  {
    id: 'm1', no: 1, name: 'Kebun Nenek', sub: 'Latihan tendangan', type: 'rout', team: ['ata'], pal: 'kebun', music: 'calm', tut: true,
    desc: 'Usir Kumbang Batu yang mengacak-acak kebun Nenek.',
    star3: { type: 'turns', n: 6, text: 'Menang dalam 6 giliran' },
    t: ['h.cc..t', '..cc...', '......b', '.b..r..', '...c...', 't..cc..', '......t'],
    h: ['0000000', '0000000', '0000000', '0000100', '0000000', '0000000', '0000000'],
    players: [['ata', 5, 5]],
    enemies: [['kumbang', 2, 0], ['kumbang', 1, 2], ['kumbang', 3, 1]],
    tips: ['Tap Ata untuk memilihnya. Petak biru adalah tempat Ata bisa berjalan.'],
    pre: 'm1pre', post: 'm1post',
  },
  {
    id: 'm2', no: 2, name: 'Jalan Setapak Savana', sub: 'Naik turun bukit', type: 'rout', team: ['ata'], pal: 'savana', music: 'adventure',
    desc: 'Lewati jalan setapak yang dijaga pasukan Raja Kumbang.',
    star3: { type: 'turns', n: 8, text: 'Menang dalam 8 giliran' },
    t: ['t.,,...tt', '..,,b....', 'r.,,..r..', '..,,,,...', '.b..,,.b.', '....,,...', '..r.,,,..', 't...,,,b.', 'tt...,,..'],
    h: ['222110000', '221100000', '211000011', '110000012', '000000122', '000000112', '000000011', '000000000', '000000000'],
    players: [['ata', 6, 7]],
    enemies: [['kumbang', 1, 1, 5], ['tawon', 4, 3, 5], ['kumbang', 7, 4, 5], ['siput', 1, 0, 5]],
    tips: ['Berdiri di tempat yang lebih tinggi bikin seranganmu lebih kuat!', 'Musuh yang belum melihatmu akan diam menunggu. Pancing mereka satu per satu!'],
    pre: 'm2pre', post: 'm2post',
  },
  {
    id: 'm3', no: 3, name: 'Badak di Kubangan', sub: 'Bertemu Ladhia', type: 'rout', team: ['ata', 'ladhia'], guests: ['ladhia'], pal: 'savana', mud: true, music: 'adventure',
    desc: 'Seekor badak dikeroyok pasukan kumbang di kubangan lumpur. Bantu dia!',
    star3: { type: 'turns', n: 7, text: 'Menang dalam 7 giliran' },
    t: ['tt.....tt', 't.......t', '...ww....', '..www.b..', '...ww....', '.b.......', '.....r...', '..r......', 't.......t'],
    h: ['110000011', '100000001', '000000000', '000000000', '000000000', '000000000', '000000000', '100000001', '110000011'],
    players: [['ata', 6, 8], ['ladhia', 5, 3]],
    enemies: [['tawon', 5, 1], ['kumbang', 7, 3], ['siput', 3, 5], ['siput', 6, 5]],
    tips: ['Ladhia menyerang dari 2 petak dengan rantai meteornya.', 'Pakai jurus Tantang! supaya musuh menyerang Ladhia yang kuat, bukan Ata.'],
    pre: 'm3pre', post: 'm3post', recruit: 'ladhia',
  },
  {
    id: 'm4', no: 4, name: 'Jaga Sumur Air', sub: 'Lawan Raja Kumbang', type: 'boss', protect: 'zizi', team: ['ata', 'ladhia'], pal: 'savana', music: 'adventure',
    desc: 'Raja Kumbang mau merebut sumur desa. Kalahkan dia dan jangan biarkan Zizi pingsan.',
    star3: { type: 'npc', key: 'zizi', text: 'Nyawa Zizi tersisa setengah atau lebih' },
    t: ['...t.t...', '.........', '.b.....b.', '...,,,...', 't..,s,..t', '...,,,...', '.........', '.r.....r.', '...t.t...'],
    h: ['110000011', '100000001', '000000000', '000000000', '000000000', '000000000', '000000000', '100000001', '110000011'],
    players: [['ata', 3, 6], ['ladhia', 5, 6]],
    npcs: [['zizi', 4, 5]],
    enemies: [['rajaKumbang', 4, 0], ['kumbang', 0, 0], ['kumbang', 8, 8]],
    waves: [
      { turn: 3, units: [['tawon', 8, 0]] },
    ],
    summon: { every: 3, max: 3, at: [[0, 0], [8, 8]] },
    tips: ['Zizi tidak bisa bergerak. Berdirilah di sebelah Zizi supaya musuh sulit mendekat!', 'Raja Kumbang memanggil prajurit setiap 3 giliran. Kalahkan Raja-nya!'],
    pre: 'm4pre', post: 'm4post',
  },
  {
    id: 'm5', no: 5, name: 'Lari ke Bukit Batu', sub: 'Capai bendera', type: 'reach', limit: 9, team: ['ata', 'ladhia'], pal: 'savana', music: 'adventure',
    desc: 'Bawa salah satu temanmu ke bendera di puncak bukit sebelum giliran 9 habis.',
    star3: { type: 'turns', n: 5, text: 'Sampai dalam 5 giliran' },
    t: ['f.r..t...', '..b.....t', 'r...r....', '...b...b.', '.t.....r.', '....r....', 't...b...t', '...r.....', 'tt.....,,'],
    h: ['332221110', '332221100', '222111100', '222111000', '111110000', '111100000', '111000000', '100000000', '000000000'],
    players: [['ata', 8, 7], ['ladhia', 7, 8]],
    enemies: [['kadal', 3, 3, 4], ['kelelawar', 1, 1, 4], ['kelelawar', 4, 0, 4], ['tawon', 6, 1, 5], ['tawon', 2, 4, 5], ['musang', 5, 3, 4]],
    tips: ['Ladhia hanya bisa memanjat 1 tingkat, Ata bisa 2 tingkat.', 'Tidak harus mengalahkan semua musuh. Yang penting sampai ke bendera!'],
    pre: 'm5pre', post: 'm5post',
  },
  {
    id: 'm6', no: 6, name: 'Dapur Bubunti', sub: 'Bertemu Bubunti', type: 'rout', protect: 'bubunti', team: ['ata', 'ladhia', 'bubunti'], guests: ['bubunti'], pal: 'desa', music: 'adventure',
    desc: 'Geng Musang Bayangan menyerbu dapur desa. Selamatkan Bubunti, sang koki llama!',
    star3: { type: 'turns', n: 8, text: 'Menang dalam 8 giliran' },
    t: ['h.h..t.h.', '....k....', '.b.......', '...,,,...', 'h..,,,..h', '...,,,...', '.t.....b.', '.........', 'h...,...h'],
    h: ['111111111', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 3, 7], ['ladhia', 5, 7], ['bubunti', 4, 4]],
    enemies: [['musang', 2, 1, 4], ['musang', 6, 1, 4], ['kelelawar', 6, 0, 4], ['kadal', 1, 1, 3]],
    waves: [
      { turn: 3, units: [['landak', 8, 0], ['musang', 0, 0]] },
    ],
    tips: ['Bubunti bisa menyembuhkan dengan Sup Hangat dan menyerang dengan Masakan Pedas!', 'Musuh yang kepedasan tidak bisa bergerak satu giliran. Jaga Bubunti jangan sampai pingsan!'],
    pre: 'm6pre', post: 'm6post', recruit: 'bubunti',
  },
  {
    id: 'm7', no: 7, name: 'Batu Singgasana', sub: 'Lawan Kepala Musang', type: 'boss', team: ['ata', 'ladhia', 'bubunti'], pal: 'savana', music: 'boss', elv: 2,
    desc: 'Kepala Musang menunggu di singgasananya. Kalahkan dia dan rebut kembali guci madu desa!',
    star3: { type: 'turns', n: 10, text: 'Menang dalam 10 giliran' },
    t: ['rr.....rr', 'r.......r', '...b.b...', '.........', '.t.....t.', '.........', '..b...b..', '.r.....r.', '.........'],
    h: ['332222233', '322222223', '211111112', '111000111', '100000001', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 4, 8], ['ladhia', 3, 7], ['bubunti', 5, 7]],
    enemies: [['kepalaMusang', 4, 1, 3], ['musang', 2, 2, 5], ['musang', 6, 2, 5], ['landak', 4, 3, 4], ['kelelawar', 7, 1, 5]],
    summon: { every: 3, max: 4, at: [[2, 0], [6, 0]] },
    tips: ['Kepala Musang memanggil anak buah setiap 3 giliran. Kalahkan dia secepat mungkin!', 'Jangan biarkan Ata maju sendirian. Bergerak bersama Ladhia dan Bubunti!'],
    pre: 'm7pre', post: 'm7post', final: true,
  },
  // ---------------- Bab 2: Hutan Lembab ----------------
  {
    id: 'b2m1', no: 8, chap: 2, name: 'Pintu Hutan Lembab', sub: 'Tanah lumpur', type: 'rout', team: ['ata', 'ladhia', 'bubunti'], pal: 'hutan', music: 'adventure', elv: 2,
    desc: 'Udara lembab dan berkabut. Hati-hati, tanah lumpur membuat langkah lebih pendek!',
    star3: { type: 'turns', n: 7, text: 'Menang dalam 7 giliran' },
    t: ['t..J..tb.', '..mm...b.', '.mmwwm...', '.bmwwm.J.', 'b..mm....', '...L..t..', '.J.....m.', '...,,,.mm', 't..,,,..t'],
    h: ['000000111', '000000011', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 4, 8], ['ladhia', 3, 7], ['bubunti', 5, 7]],
    enemies: [['nyamuk', 2, 1, 5], ['nyamuk', 6, 2, 5], ['katak', 1, 4, 4], ['katak', 6, 4, 4]],
    tips: ['Tanah lumpur 🟫 membuat langkah lebih pendek: satu petak lumpur dihitung 2 langkah. Katak tidak melambat di lumpur!'],
    pre: 'b1pre', post: 'b1post',
  },
  {
    id: 'b2m2', no: 9, chap: 2, name: 'Jembatan Akar', sub: 'Belut di sungai', type: 'rout', team: ['ata', 'ladhia', 'bubunti'], pal: 'hutan', music: 'adventure', elv: 2,
    desc: 'Seberangi sungai lewat jembatan akar. Belut Listrik bisa berenang dan menyerang dari air!',
    star3: { type: 'turns', n: 8, text: 'Menang dalam 8 giliran' },
    t: ['t..J...t.', '.b.....b.', '...m..m..', 'ww,wwww,w', 'ww,wwww,w', '..m....m.', '.J..t....', '...,,,..b', 't..,,,..t'],
    h: ['000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 4, 8], ['ladhia', 3, 7], ['bubunti', 5, 7]],
    enemies: [['belut', 4, 4, 99], ['belut', 5, 3, 99], ['katak', 2, 1, 4], ['katak', 7, 1, 4], ['nyamuk', 4, 0, 5]],
    tips: ['Belut Listrik berenang di air 🌊. Teman-teman hanya bisa menyeberang lewat jembatan akar.'],
    pre: 'b2pre', post: 'b2post',
  },
  {
    id: 'b2m3', no: 10, chap: 2, name: 'Kebun Jamur', sub: 'Spora tidur', type: 'rout', team: ['ata', 'ladhia', 'bubunti'], pal: 'hutan', music: 'adventure', elv: 2,
    desc: 'Jamur Spora melempar spora tidur. Siapa yang kena akan tertidur satu giliran!',
    star3: { type: 'turns', n: 8, text: 'Menang dalam 8 giliran' },
    t: ['J.J...J.t', '...m.....', 'J...J..mJ', '..m......', '.J...J.b.', '...m.....', 'b.....J..', '...,,,...', 't..,,,..J'],
    h: ['000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 4, 8], ['ladhia', 3, 7], ['bubunti', 5, 7]],
    enemies: [['jamur', 2, 1, 3], ['jamur', 6, 1, 3], ['jamur', 4, 3, 4], ['katak', 1, 3, 4], ['nyamuk', 7, 3, 5]],
    tips: ['Jamur Spora bisa membuat temanmu tertidur 😴 satu giliran. Sup Hangat Bubunti membangunkannya!'],
    pre: 'b3pre', post: 'b3post',
  },
  {
    id: 'b2m4', no: 11, chap: 2, name: 'Pohon Oumaldi', sub: 'Bertemu Oumaldi', type: 'rout', protect: 'oumaldi', team: ['ata', 'ladhia', 'bubunti', 'oumaldi'], guests: ['oumaldi'], pal: 'hutan', music: 'adventure', elv: 3,
    desc: 'Oumaldi si pemanah dikepung di atas bukit akar. Selamatkan dia, dan jangan biarkan musuh menempel padanya!',
    star3: { type: 'turns', n: 8, text: 'Menang dalam 8 giliran' },
    t: ['t..J...Jt', '.m.....m.', '.........', '..m...m..', '.b.....b.', 'J..m.....', '......m.J', '...,,,...', 't..,,,..t'],
    h: ['000000000', '000222000', '001222100', '000222000', '000010000', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 4, 8], ['ladhia', 3, 7], ['bubunti', 5, 7], ['oumaldi', 4, 2]],
    enemies: [['nyamuk', 1, 1, 99], ['nyamuk', 7, 1, 99], ['katak', 2, 3, 99], ['katak', 6, 4, 99], ['jamur', 4, 0, 99]],
    waves: [{ turn: 3, units: [['nyamuk', 0, 0], ['nyamuk', 8, 0]] }],
    tips: ['Oumaldi memanah dari jarak 2 sampai 4 petak, tapi tidak bisa memanah musuh yang menempel. Dari tempat tinggi, panahnya lebih jauh!'],
    pre: 'b4pre', post: 'b4post', recruit: 'oumaldi',
  },
  {
    id: 'b2m5', no: 12, chap: 2, name: 'Rawa Lumpur', sub: 'Lawan Lumpur Raksasa', type: 'boss', team: ['ata', 'ladhia', 'bubunti', 'oumaldi'], pal: 'hutan', music: 'boss', elv: 3,
    desc: 'Lumpur Raksasa menjaga rawa. Kalau nyawanya tinggal setengah, dia bisa terbelah!',
    star3: { type: 'turns', n: 9, text: 'Menang dalam 9 giliran' },
    t: ['mmm.J.mmm', 'm.mmmmm.m', '.mw.m.wm.', '..mmmmm..', 't.m...m.t', '...m.m...', 'J.......J', '...,,,...', 't..,,,..t'],
    h: ['000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 4, 8], ['ladhia', 3, 7], ['bubunti', 5, 7], ['oumaldi', 6, 8]],
    enemies: [['lumpurRaksasa', 4, 1, 99], ['katak', 1, 3, 4], ['katak', 7, 3, 4], ['belut', 2, 2, 4], ['belut', 6, 2, 4]],
    tips: ['Lumpur Raksasa tidak melambat di lumpur. Saat nyawanya tinggal setengah, dia terbelah jadi lumpur kecil!'],
    pre: 'b5pre', post: 'b5post',
  },
  {
    id: 'b2m6', no: 13, chap: 2, name: 'Lembah Kabut', sub: 'Musuh tersembunyi', type: 'rout', fog: true, team: ['ata', 'ladhia', 'bubunti', 'oumaldi'], pal: 'hutan', music: 'adventure', elv: 3,
    desc: 'Kabut tebal menutupi lembah. Musuh baru terlihat kalau sudah dekat. Oumaldi di tempat tinggi bisa melihat lebih jauh!',
    star3: { type: 'turns', n: 9, text: 'Menang dalam 9 giliran' },
    t: ['t..J..t..', '.b....m.J', '...t.....', 'J.m...b..', '....J...t', '.m.......', '...b..m..', '.,,,,....', '.,,,,..t.'],
    h: ['000000000', '000000000', '000000000', '000000000', '000000000', '000000011', '000000122', '000000122', '000000011'],
    players: [['ata', 2, 8], ['ladhia', 3, 7], ['bubunti', 1, 7], ['oumaldi', 7, 7]],
    enemies: [['nyamuk', 2, 1, 4], ['nyamuk', 6, 2, 4], ['katak', 4, 3, 3], ['jamur', 1, 4, 3], ['jamur', 6, 4, 3], ['katak', 4, 0, 3]],
    tips: ['Musuh di dalam kabut tidak terlihat. Teman-teman melihat 3 petak; Oumaldi melihat lebih jauh, apalagi dari tempat tinggi!'],
    pre: 'b6pre', post: 'b6post',
  },
  {
    id: 'b2m7', no: 14, chap: 2, name: 'Sarang Ular', sub: 'Lawan Ular Beracun', type: 'boss', team: ['ata', 'ladhia', 'bubunti', 'oumaldi'], pal: 'hutan', music: 'boss', elv: 3, elv: 2,
    desc: 'Ular Beracun bersembunyi di kolam sarangnya. Gigitannya beracun dan dia bisa memanggil belut!',
    star3: { type: 'turns', n: 10, text: 'Menang dalam 10 giliran' },
    t: ['t..J...Jt', '..m...m..', '.m.www.m.', '..wwwww..', 'J.ww,ww.J', '..wwwww..', '.b.www.b.', '...,,,...', 't..,,,..t'],
    h: ['110000011', '100000001', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 4, 8], ['ladhia', 3, 7], ['bubunti', 5, 7], ['oumaldi', 6, 8]],
    enemies: [['ular', 4, 3, 99], ['belut', 3, 2, 99], ['belut', 5, 5, 99], ['nyamuk', 1, 1, 5], ['nyamuk', 7, 1, 5]],
    summon: { every: 3, max: 5, at: [[2, 3], [6, 3]] },
    tips: ['Gigitan Ular Beracun membuat keracunan 🤢: nyawa berkurang 2 tiap giliran selama 3 giliran. Sup Hangat menyembuhkannya!', 'Ular bisa berenang. Serang dia saat mendekat ke tepi kolam!'],
    pre: 'b7pre', post: 'b7post', final: true,
  },
];

/* Perluas setiap peta inti menjadi pulau: daratan 13x13 + pantai + laut. */
(function expandIslands() {
  const LAND = 13;
  const hsh = (x, y, s) => { let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; };
  MISSIONS.forEach((m, mi) => {
    const n = m.t.length, pad = Math.max(0, Math.floor((LAND - n) / 2)), o = pad + 2, S = n + 2 * o;
    const T = [], H = [];
    for (let y = 0; y < S; y++) {
      let rt = '', rh = '';
      for (let x = 0; x < S; x++) {
        const cx = x - o, cy = y - o;
        const edge = Math.min(x, y, S - 1 - x, S - 1 - y);
        if (cx >= 0 && cy >= 0 && cx < n && cy < n) { rt += m.t[cy][cx]; rh += m.h[cy][cx]; continue; }
        const corner = (x < 3 || x > S - 4) && (y < 3 || y > S - 4) && (Math.min(x, S - 1 - x) + Math.min(y, S - 1 - y) < 3);
        if (edge === 0 || corner) { rt += 'o'; rh += '0'; continue; }
        if (edge === 1) { rt += hsh(x, y, mi) > 0.88 ? 'o' : (m.pal === 'hutan' ? (hsh(x, y, mi + 5) > 0.6 ? 'm' : 'g') : 'y'); rh += '0'; continue; }
        const kx = Math.max(0, Math.min(n - 1, cx)), ky = Math.max(0, Math.min(n - 1, cy));
        const d = Math.max(Math.abs(cx - kx), Math.abs(cy - ky));
        const tc = m.t[ky][kx], hc = +m.h[ky][kx];
        rh += String(Math.max(0, hc - Math.floor(d / 2)));
        if (tc === ',' && (cx === kx || cy === ky)) { rt += ','; continue; }
        if (tc === 'w' && m.pal === 'hutan' && (cx === kx || cy === ky) && (kx === 0 || kx === n - 1 || ky === 0 || ky === n - 1)) { rt += 'w'; continue; }
        const r = hsh(x, y, mi + 11);
        let c = '.';
        if (r < 0.07) c = 'b';
        else if (r < 0.14) c = m.pal === 'savana' || m.pal === 'hutan' ? 't' : (hsh(x, y, 3) > 0.5 ? 'p' : 't');
        else if (r < 0.17) c = m.pal === 'hutan' ? 'J' : 'r';
        else if (r < 0.24) c = m.pal === 'hutan' ? 'm' : 'q';
        else if (r < 0.55) c = 'g';
        rt += c;
      }
      T.push(rt); H.push(rh);
    }
    m.t = T; m.h = H;
    const sh = a => { a[1] += o; a[2] += o; };
    (m.players || []).forEach(sh); (m.npcs || []).forEach(sh); (m.enemies || []).forEach(sh);
    (m.waves || []).forEach(w => w.units.forEach(sh));
    if (m.summon) m.summon.at = m.summon.at.map(([x, y]) => [x + o, y + o]);
  });
})();
