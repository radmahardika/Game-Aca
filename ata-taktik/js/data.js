'use strict';
const AT = { VERSION: 4 };
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
  momon: { name: 'Tung Momon', job: 'Pemusik', desc: 'Jalak tua yang ceria, sahabat lama Nenek.', hp: 22, atk: 5, def: 3, mov: 4, jump: 2, rmin: 1, rmax: 2, fly: true,
    skills: ['lagu', 'ceria'], passive: 'Sayap Jalak: bisa terbang melewati air, lumpur, dan rintangan (tapi tidak bisa berhenti di atas air). Serulingnya menjangkau 2 petak.',
    animal: 'Burung jalak', bio: 'Sahabat lama Nenek dari tim penjelajah. Suka bercanda dan bernyanyi. Lagunya membuat teman-teman bersemangat.',
    tip: 'Taruh Tung Momon di tengah tim. Lagunya kena teman yang dekat (2 petak), jadi kumpulkan teman sebelum bernyanyi!' },
  yanto: { name: 'Tung Yanto', job: 'Pertapa Batu', desc: 'Kura-kura tua yang pendiam dan bijak.', hp: 32, atk: 8, def: 6, mov: 2, jump: 1, rmin: 1, rmax: 3,
    skills: ['batu', 'tembok', 'cangkang'], passive: 'Tenang Seperti Batu: lambat berjalan, tapi sihir batunya menjangkau 3 petak.',
    animal: 'Kura-kura', bio: 'Sahabat lama Nenek yang bertapa di pulau Rawa Bulan. Jarang bicara, tapi sekali bicara selalu bijak.',
    tip: 'Pakai Tembok Batu untuk menghalangi jalan musuh. Tung Yanto lambat, jadi biarkan musuh yang datang padanya.' },
};

const FUTURE = [
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
  // Bab 3 Rawa Bulan
  capung: { name: 'Capung Raksasa', hp: 10, atk: 6, def: 1, mov: 6, jump: 9, rmin: 1, rmax: 1, madu: 2, fly: true },
  kepiting: { name: 'Kepiting Rawa', hp: 16, atk: 6, def: 6, mov: 2, jump: 1, rmin: 1, rmax: 1, madu: 3, swim: true, mudOk: true },
  anakBuaya: { name: 'Anak Buaya', hp: 17, atk: 7, def: 3, mov: 3, jump: 1, rmin: 1, rmax: 1, madu: 3, swim: true, mudOk: true },
  rajaKepiting: { name: 'Raja Kepiting', hp: 48, atk: 9, def: 7, mov: 2, jump: 1, rmin: 1, rmax: 1, madu: 12, boss: true, swim: true, mudOk: true, summonKind: 'kepiting', call: 'Kepiting-kepitingku, jepit mereka!' },
  buaya: { name: 'Buaya Serakah', hp: 100, atk: 12, def: 7, mov: 3, jump: 1, rmin: 1, rmax: 1, madu: 20, boss: true, swim: true, mudOk: true, dive: true, summonKind: 'anakBuaya', call: 'Anak-anakku, tangkap mereka! Semua makanan milikku!' },
  kepalaMusang: { name: 'Kepala Musang', hp: 46, atk: 8, def: 4, mov: 3, jump: 2, rmin: 1, rmax: 1, madu: 12, boss: true, summonKind: 'musang', call: 'Geng Musang, serbu!' },
};
const NPCS = { zizi: { name: 'Zizi', hp: 28, atk: 0, def: 3, mov: 0, jump: 0, rmin: 0, rmax: 0 },
  yanto: { name: 'Tung Yanto', hp: 44, atk: 0, def: 7, mov: 0, jump: 0, rmin: 0, rmax: 0, stance: 'cangkang' } };

const SKILLS = {
  kilat: { name: 'Tendangan Kilat', icon: '⚡', cost: 2, target: 'enemy', rmin: 1, rmax: 1, desc: 'Tendang 2 kali berturut-turut!' },
  putar: { name: 'Tendangan Putar', icon: '🌀', cost: 3, target: 'self', desc: 'Kena semua musuh di sekeliling Ata.' },
  sabuk: { name: 'Mode Sabuk Hitam', icon: '🥋', cost: 5, target: 'self', desc: 'Super kuat (+4) dan lebih cepat selama 3 giliran!' },
  tantang: { name: 'Tantang!', icon: '📣', cost: 2, target: 'self', desc: 'Musuh terpancing menyerang Ladhia saja.' },
  benteng: { name: 'Benteng Badak', icon: '🛡️', cost: 3, target: 'self', desc: 'Ladhia dan teman di sebelahnya: pertahanan +3.' },
  sup: { name: 'Sup Hangat', icon: '🍲', cost: 2, target: 'ally', rmin: 0, rmax: 3, desc: 'Sembuhkan satu teman (jarak 3). Juga membangunkan yang tertidur dan menyembuhkan racun.' },
  jitu: { name: 'Panah Jitu', icon: '🎯', cost: 2, target: 'enemy', rmin: 2, rmax: 5, desc: 'Panah kuat yang menembus pertahanan musuh. Jangkauan 5!' },
  hujan: { name: 'Hujan Panah', icon: '🌧️', cost: 4, target: 'enemy', rmin: 2, rmax: 4, desc: 'Kena musuh sasaran dan semua musuh di sebelahnya.' },
  lagu: { name: 'Lagu Semangat', icon: '🎵', cost: 2, target: 'self', desc: 'Teman dalam 2 petak: serangan +2 dan Semangat +1 ⭐.' },
  ceria: { name: 'Lagu Penyembuh', icon: '🎶', cost: 3, target: 'self', desc: 'Sembuhkan semua teman dalam 2 petak sekaligus.' },
  batu: { name: 'Batu Melayang', icon: '🪨', cost: 2, target: 'enemy', rmin: 2, rmax: 4, desc: 'Lempar batu sihir yang menembus pertahanan. Jangkauan 4!' },
  tembok: { name: 'Tembok Batu', icon: '🧱', cost: 3, target: 'tile', rmin: 1, rmax: 3, desc: 'Munculkan tembok batu di petak kosong. Menghalangi jalan musuh selama 2 giliran.' },
  cangkang: { name: 'Masuk Cangkang', icon: '🐢', cost: 2, target: 'self', desc: 'Pertahanan +5 sampai giliranmu berikutnya, dan sembuh sedikit.' },
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
  momon: { name: 'Tung Momon', kind: 'momon', voice: [1.3, 1.1] },
  yanto: { name: 'Tung Yanto', kind: 'yanto', voice: [0.5, 0.75] },
  buaya: { name: 'Buaya Serakah', kind: 'buaya', voice: [0.35, 0.85] },
  rajaKp: { name: 'Raja Kepiting', kind: 'rajaKepiting', voice: [0.8, 1.0] },
  kepiting: { name: 'Kepiting Rawa', kind: 'kepiting', voice: [1.4, 1.1] },
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
  c1pre: [
    ['narator', 'Malam turun di Rawa Bulan. Bulan purnama bersinar di atas air yang tenang.'],
    ['oumaldi', 'Sepi sekali... Kenapa tidak ada warga rawa yang keluar?'],
    ['kepiting', 'Krek krek! Siapa itu? Rawa ini milik Buaya Serakah! Pergi!'],
    ['ata', 'Buaya Serakah? Kami cuma mau bertemu Tung Momon dan Tung Yanto!'],
  ],
  c1post: [
    ['bubunti', 'Lihat, perahu-perahu warga kosong. Lumbung makanan mereka juga kosong.'],
    ['narator', 'Dari pulau kecil di tengah rawa, terdengar suara seruling yang merdu.'],
    ['ata', 'Suara seruling! Mungkin itu Tung Momon!'],
  ],
  c2pre: [
    ['momon', 'Tralala~ Walau dikepung, aku tetap bernyanyi! Eh, siapa kalian, anak-anak muda?'],
    ['ata', 'Tung Momon? Aku Ata, cucu Nenek! Kami datang membantu!'],
    ['momon', 'Cucu sahabatku?! Wah, kebetulan sekali! Tolong usir mereka, aku sudah lelah meniup seruling!'],
    ['ladhia', 'Lewat daun teratai untuk menyeberang. Jangan biarkan Tung Momon pingsan!'],
  ],
  c2post: [
    ['momon', 'Hahaha! Kalian hebat! Nenekmu pasti bangga, Ata.'],
    ['momon', 'Sejak Buaya Serakah datang, dia mengambil semua makanan warga rawa. Tung Yanto bertapa di pulaunya dan tidak mau bicara.'],
    ['ata', 'Ayo ikut kami, Tung Momon! Kita bujuk Tung Yanto bersama.'],
    ['momon', 'Tentu! Pemusik tua ini masih punya banyak lagu!'],
  ],
  c3pre: [
    ['momon', 'Jalan ke pulau Tung Yanto hanya lewat daun teratai. Hati-hati, anak buaya suka bersembunyi di air!'],
    ['oumaldi', 'Kita harus cepat sampai ke bendera di seberang sana!'],
  ],
  c3post: [
    ['ata', 'Sampai! Daun teratainya goyang-goyang, hihi.'],
    ['rajaKp', 'Krak! Siapa yang berani menginjak pantaiku? Akulah Raja Kepiting, penjaga harta Buaya Serakah!'],
  ],
  c4pre: [
    ['rajaKp', 'Cangkangku paling keras sedunia! Serangan kalian tidak akan terasa!'],
    ['momon', 'Cangkangnya keras sekali. Serang dari belakang, atau pakai jurus yang menembus pertahanan!'],
    ['bubunti', 'Masakan pedasku bisa menembus cangkang!'],
  ],
  c4post: [
    ['rajaKp', 'Aduh, cangkangku retak... Ampun! Buaya Serakah menjanjikan aku separuh makanan rawa...'],
    ['ladhia', 'Makanan itu milik warga. Kembalikan!'],
    ['rajaKp', 'I-iya, iya! Lumbungnya ada di Istana Buaya. Tapi hati-hati, dia bisa menyelam lalu menyerang tiba-tiba!'],
  ],
  c5pre: [
    ['momon', 'Itu dia Tung Yanto, bertapa di dalam cangkangnya.'],
    ['yanto', '...'],
    ['momon', 'Dia akan bangun kalau mendengar laguku. Tapi butuh waktu. Lindungi dia selama aku bernyanyi!'],
    ['ata', 'Siap! Bertahan 6 giliran, dan jangan biarkan Tung Yanto pingsan!'],
  ],
  c5post: [
    ['yanto', '...Momon. Lagumu masih fals seperti dulu.'],
    ['momon', 'Hahaha! Akhirnya kau bicara juga, sahabatku!'],
    ['yanto', 'Kau... cucu sahabat kami. Matamu sama seperti nenekmu.'],
    ['yanto', 'Aku bertapa karena sedih tidak bisa mengusir Buaya Serakah sendirian. Tapi bersama kalian, aku ikut.'],
    ['ata', 'Hore! Tim kita jadi berenam!'],
  ],
  c6pre: [
    ['narator', 'Kabut bulan turun menutupi rawa. Istana Buaya Serakah ada di balik kabut.'],
    ['yanto', 'Tetap bersama. Tembok batuku bisa melindungi kalian.'],
    ['oumaldi', 'Aku naik ke tempat tinggi supaya bisa melihat musuh di kabut!'],
  ],
  c6post: [
    ['momon', 'Kabutnya terbuka. Itu Istana Buaya Serakah, di tengah danau!'],
    ['bubunti', 'Aku bisa mencium bau madu dan ikan bakar dari sana. Itu makanan warga!'],
  ],
  c7pre: [
    ['buaya', 'Hohoho! Siapa yang berani datang ke istanaku? Semua makanan rawa ini milikku seorang!'],
    ['ata', 'Makanan itu milik semua warga rawa! Bagilah, jangan serakah!'],
    ['buaya', 'Berbagi? Hah! Anak-anakku, tangkap mereka!'],
    ['yanto', 'Hati-hati. Saat dia menyelam, dia tidak bisa diserang. Bersiaplah saat dia muncul.'],
  ],
  c7post: [
    ['buaya', 'Aduh... perutku kenyang tapi hatiku sepi. Tidak ada yang mau berteman denganku.'],
    ['bubunti', 'Kalau kamu mau berbagi, kami mau masak bersama dan makan bersama kamu.'],
    ['buaya', 'Benarkah...? Baiklah. Lumbungnya kubuka. Semua warga boleh mengambil makanannya.'],
    ['narator', 'Malam itu warga Rawa Bulan berpesta. Buaya Serakah ikut makan bersama dan tersenyum untuk pertama kalinya.'],
    ['yanto', 'Ini. Sobekan peta ketiga. Nenekmu menitipkannya padaku dulu.'],
    ['momon', 'Peta menunjuk ke Gunung Kabut, tempat Uti Reni dan Uti Lilik. Ayo, petualangan kita berlanjut!'],
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
  // ---------------- Bab 3: Rawa Bulan ----------------
  {
    id: 'b3m1', no: 15, chap: 3, name: 'Gerbang Rawa Bulan', sub: 'Kepiting bercangkang keras', type: 'rout', team: ['ata', 'ladhia', 'bubunti', 'oumaldi'], pal: 'rawa', music: 'adventure', elv: 3,
    desc: 'Rawa Bulan dijaga anak buah Buaya Serakah. Kepiting Rawa punya cangkang yang keras sekali!',
    star3: { type: 'turns', n: 8, text: 'Menang dalam 8 giliran' },
    t: ['t..ww...t', '.b.ww.b..', '...dd....', '.m.ww..m.', '...ww....', '........b', 'b...m....', '...,,,...', 't..,,,..t'],
    h: ['000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 4, 8], ['ladhia', 3, 7], ['bubunti', 5, 7], ['oumaldi', 6, 8]],
    enemies: [['kepiting', 1, 3, 4], ['kepiting', 7, 2, 4], ['capung', 2, 0, 5], ['capung', 6, 1, 5], ['anakBuaya', 4, 1, 99]],
    tips: ['Kepiting Rawa bercangkang keras 🛡️. Serang dari belakang, atau pakai Masakan Pedas yang menembus pertahanan!', 'Daun teratai 🍃 bisa diinjak untuk menyeberangi air.'],
    pre: 'c1pre', post: 'c1post',
  },
  {
    id: 'b3m2', no: 16, chap: 3, name: 'Lagu di Pulau Kecil', sub: 'Bertemu Tung Momon', type: 'rout', protect: 'momon', team: ['ata', 'ladhia', 'bubunti', 'oumaldi', 'momon'], guests: ['momon'], pal: 'rawa', music: 'adventure', elv: 3,
    desc: 'Tung Momon terkepung di pulau kecil. Seberangi daun teratai dan selamatkan dia!',
    star3: { type: 'npc', key: 'momon', text: 'Nyawa Tung Momon tersisa setengah atau lebih' },
    t: ['t...b...t', '.wwwwwww.', '.ww...ww.', '.w.....w.', '.d..r..d.', '.ww...ww.', '.wwwdwww.', '...,,,...', 't..,,,..t'],
    h: ['000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 4, 8], ['ladhia', 3, 7], ['bubunti', 5, 7], ['oumaldi', 6, 8], ['momon', 4, 3]],
    enemies: [['anakBuaya', 1, 3, 99], ['anakBuaya', 7, 4, 5], ['kepiting', 5, 2, 5], ['capung', 2, 0, 99]],
    waves: [{ turn: 2, units: [['kepiting', 4, 0]] }, { turn: 3, units: [['capung', 0, 1], ['capung', 8, 1]] }],
    tips: ['Tung Momon bisa terbang melewati air! Lagunya membuat teman di dekatnya lebih kuat.'],
    pre: 'c2pre', post: 'c2post', recruit: 'momon',
  },
  {
    id: 'b3m3', no: 17, chap: 3, name: 'Jalan Teratai', sub: 'Capai bendera', type: 'reach', limit: 8, team: ['ata', 'ladhia', 'bubunti', 'oumaldi', 'momon'], pal: 'rawa', music: 'adventure', elv: 3,
    desc: 'Melompat dari daun teratai ke daun teratai sampai ke bendera di seberang danau sebelum giliran 8 habis.',
    star3: { type: 'turns', n: 5, text: 'Sampai dalam 5 giliran' },
    t: ['t...f.b.t', 'wdwwwwwdw', 'wddwwwddw', 'wwdwwwdww', 'wwddwddww', 'wwwdwdwww', 'wwwdddwww', '...,,,...', 't..,,,..t'],
    h: ['000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 4, 8], ['ladhia', 3, 7], ['bubunti', 5, 7], ['oumaldi', 6, 8], ['momon', 4, 7]],
    enemies: [['anakBuaya', 2, 1, 5], ['anakBuaya', 6, 5, 5], ['belut', 4, 3, 5], ['capung', 3, 0, 5], ['kepiting', 5, 0, 4]],
    tips: ['Tung Momon terbang, jadi dia bisa langsung menuju bendera. Tapi jangan sampai dia sendirian!'],
    pre: 'c3pre', post: 'c3post',
  },
  {
    id: 'b3m4', no: 18, chap: 3, name: 'Pantai Raja Kepiting', sub: 'Lawan Raja Kepiting', type: 'boss', team: ['ata', 'ladhia', 'bubunti', 'oumaldi', 'momon'], pal: 'rawa', music: 'boss', elv: 4,
    desc: 'Raja Kepiting menjaga pantai dengan cangkang terkeras di rawa. Cari cara menembus pertahanannya!',
    star3: { type: 'turns', n: 9, text: 'Menang dalam 9 giliran' },
    t: ['r.yy.yy.r', '.yyyyyyy.', 'yy.www.yy', 'y..www..y', '..m...m..', 'b.......b', '...m.m...', '...,,,...', 't..,,,..t'],
    h: ['000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 4, 8], ['ladhia', 3, 7], ['bubunti', 5, 7], ['oumaldi', 6, 8], ['momon', 2, 8]],
    enemies: [['rajaKepiting', 4, 1, 99], ['kepiting', 1, 2, 4], ['kepiting', 7, 2, 4], ['capung', 2, 0, 5], ['capung', 6, 0, 5]],
    summon: { every: 3, max: 5, at: [[3, 0], [5, 0]] },
    tips: ['Raja Kepiting bertahan 8! Pakai jurus yang menembus pertahanan: Masakan Pedas, Panah Jitu, atau serang dari belakang.'],
    pre: 'c4pre', post: 'c4post',
  },
  {
    id: 'b3m5', no: 19, chap: 3, name: 'Pulau Tung Yanto', sub: 'Bertahan 6 giliran', type: 'survive', n: 6, protect: 'yanto', team: ['ata', 'ladhia', 'bubunti', 'oumaldi', 'momon'], pal: 'rawa', music: 'adventure', elv: 4,
    desc: 'Tung Momon bernyanyi untuk membangunkan Tung Yanto. Lindungi Tung Yanto selama 6 giliran!',
    star3: { type: 'npc', key: 'yanto', text: 'Nyawa Tung Yanto tersisa setengah atau lebih' },
    t: ['t.b...b.t', '.www.www.', '.w.....w.', '.d.....d.', '.w..r..w.', '.ww...ww.', '.wwwdwww.', '...,,,...', 't..,,,..t'],
    h: ['000000000', '000000000', '000000000', '000010000', '000000000', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 4, 8], ['ladhia', 3, 7], ['bubunti', 5, 7], ['oumaldi', 6, 8], ['momon', 4, 5]],
    npcs: [['yanto', 4, 3]],
    enemies: [['anakBuaya', 2, 1, 99], ['anakBuaya', 6, 1, 99], ['kepiting', 2, 2, 99], ['capung', 4, 0, 99]],
    waves: [{ turn: 2, units: [['capung', 1, 0], ['capung', 7, 0]] }, { turn: 4, units: [['anakBuaya', 1, 4], ['anakBuaya', 7, 4], ['kepiting', 4, 1]] }],
    tips: ['Tung Yanto sedang bertapa di dalam cangkangnya dan tidak bisa bergerak. Berdirilah di sekelilingnya!'],
    pre: 'c5pre', post: 'c5post', recruit: 'yanto',
  },
  {
    id: 'b3m6', no: 20, chap: 3, name: 'Kabut Bulan', sub: 'Musuh di balik kabut', type: 'rout', fog: true, team: ['ata', 'ladhia', 'bubunti', 'oumaldi', 'momon', 'yanto'], pal: 'rawa', music: 'adventure', elv: 4,
    desc: 'Kabut bulan menutupi rawa. Gunakan Tembok Batu Tung Yanto untuk melindungi tim!',
    star3: { type: 'turns', n: 9, text: 'Menang dalam 9 giliran' },
    t: ['t..w..b.t', '.b.w.m...', '...d...w.', 'm..w..ww.', '.r.w..d..', '...d.....', 'b..w..m.b', '...d,,,..', 't..w,,,.t'],
    h: ['000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000011', '000000011', '000000001'],
    players: [['ata', 5, 8], ['ladhia', 4, 7], ['bubunti', 6, 7], ['oumaldi', 7, 7], ['momon', 5, 7], ['yanto', 6, 8]],
    enemies: [['capung', 1, 1, 4], ['capung', 6, 1, 4], ['capung', 1, 5, 4], ['anakBuaya', 3, 1, 4], ['anakBuaya', 3, 6, 3], ['kepiting', 7, 3, 3], ['belut', 6, 3, 3]],
    tips: ['Tembok Batu 🧱 Tung Yanto menghalangi jalan musuh selama 2 giliran. Pakai untuk menutup jalan di dekat teman yang lemah!'],
    pre: 'c6pre', post: 'c6post',
  },
  {
    id: 'b3m7', no: 21, chap: 3, name: 'Istana Buaya Serakah', sub: 'Lawan Buaya Serakah', type: 'boss', team: ['ata', 'ladhia', 'bubunti', 'oumaldi', 'momon', 'yanto'], pal: 'rawa', music: 'boss', elv: 4,
    desc: 'Buaya Serakah menimbun makanan seluruh rawa di istananya. Dia bisa menyelam lalu muncul tiba-tiba!',
    star3: { type: 'turns', n: 11, text: 'Menang dalam 11 giliran' },
    t: ['t.b...b.t', 'wwwwdwwww', 'wwd...dww', 'ww.....ww', 'wwd.r.dww', 'www...www', 'wwwdddwww', '...,,,...', 't..,,,..t'],
    h: ['000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 4, 8], ['ladhia', 3, 7], ['bubunti', 5, 7], ['oumaldi', 6, 8], ['momon', 2, 8], ['yanto', 4, 7]],
    enemies: [['buaya', 4, 3, 99], ['anakBuaya', 2, 1, 99], ['anakBuaya', 6, 5, 99], ['kepiting', 3, 2, 99], ['kepiting', 5, 2, 99], ['capung', 1, 0, 5], ['capung', 7, 0, 5]],
    summon: { every: 3, max: 7, at: [[1, 3], [7, 3]] },
    tips: ['Setiap 3 giliran Buaya Serakah menyelam 🌊 dan tidak bisa diserang. Saat muncul, gigitannya lebih kuat. Jaga jarak!', 'Buaya Serakah memanggil anak buaya. Kalahkan bosnya untuk menang!'],
    pre: 'c7pre', post: 'c7post', final: true,
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
        if (edge === 1) { rt += hsh(x, y, mi) > 0.88 ? 'o' : (m.pal === 'hutan' ? (hsh(x, y, mi + 5) > 0.6 ? 'm' : 'g') : m.pal === 'rawa' ? (hsh(x, y, mi + 5) > 0.55 ? 'w' : 'g') : 'y'); rh += '0'; continue; }
        const kx = Math.max(0, Math.min(n - 1, cx)), ky = Math.max(0, Math.min(n - 1, cy));
        const d = Math.max(Math.abs(cx - kx), Math.abs(cy - ky));
        const tc = m.t[ky][kx], hc = +m.h[ky][kx];
        rh += String(Math.max(0, hc - Math.floor(d / 2)));
        if (tc === ',' && (cx === kx || cy === ky)) { rt += ','; continue; }
        if (tc === 'w' && (m.pal === 'hutan' || m.pal === 'rawa') && (cx === kx || cy === ky) && (kx === 0 || kx === n - 1 || ky === 0 || ky === n - 1)) { rt += 'w'; continue; }
        const r = hsh(x, y, mi + 11);
        let c = '.';
        if (r < 0.07) c = 'b';
        else if (r < 0.14) c = m.pal === 'savana' || m.pal === 'hutan' || m.pal === 'rawa' ? 't' : (hsh(x, y, 3) > 0.5 ? 'p' : 't');
        else if (r < 0.17) c = m.pal === 'hutan' ? 'J' : m.pal === 'rawa' ? 'b' : 'r';
        else if (r < 0.24) c = m.pal === 'hutan' || m.pal === 'rawa' ? 'm' : 'q';
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
