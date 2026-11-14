'use strict';
const AT = { VERSION: 1 };
/* Data karakter, jurus, misi, dan cerita Bab 1. */

const CHARS = {
  ata: { name: 'Ata', job: 'Taekwondoin', desc: 'Honey badger pemberani. Paling cepat!', hp: 26, atk: 8, def: 3, mov: 5, jump: 2, rmin: 1, rmax: 1,
    skills: ['kilat', 'putar', 'sabuk'], passive: 'Refleks Kilat: kadang menghindar lalu membalas tendangan.' },
  ladhia: { name: 'Ladhia', job: 'Tanker', desc: 'Badak hitam berarmor. Galak di luar, baik di dalam.', hp: 36, atk: 7, def: 6, mov: 3, jump: 1, rmin: 1, rmax: 2,
    skills: ['tantang', 'benteng'], passive: 'Kulit Baja: serangan dari belakang tidak terlalu sakit. Rantai meteor menjangkau 2 petak.' },
  bubunti: { name: 'Bubunti', job: 'Koki', desc: 'Llama putih berhati lembut, jago masak.', hp: 20, atk: 4, def: 2, mov: 4, jump: 1, rmin: 1, rmax: 1,
    skills: ['sup', 'pedas'], passive: 'Hati Lembut: masakannya bikin teman semangat.' },
};

const FUTURE = [
  { name: 'Oumaldi', desc: 'Tupai pemanah', bab: 'Bab 2' },
  { name: 'Tung Momon', desc: 'Jalak pemusik', bab: 'Bab 3' },
  { name: 'Tung Yanto', desc: 'Kura-kura penyihir', bab: 'Bab 3' },
  { name: 'Utireni', desc: 'Rusa penyerang', bab: 'Bab 4' },
  { name: 'Utililik', desc: 'Roh bandeng pemanggil roh', bab: 'Bab 4' },
];

const ENEMIES = {
  hyenaCilik: { name: 'Hyena Cilik', hp: 11, atk: 5, def: 1, mov: 4, jump: 1, rmin: 1, rmax: 1, madu: 2 },
  hyenaGempal: { name: 'Hyena Gempal', hp: 20, atk: 7, def: 3, mov: 3, jump: 1, rmin: 1, rmax: 1, madu: 3 },
  hyenaPelempar: { name: 'Hyena Pelempar', hp: 11, atk: 5, def: 1, mov: 3, jump: 1, rmin: 2, rmax: 3, madu: 2, ranged: true },
  nasar: { name: 'Burung Nasar', hp: 12, atk: 5, def: 1, mov: 5, jump: 9, rmin: 1, rmax: 1, madu: 2, fly: true },
  rajaHyena: { name: 'Raja Hyena', hp: 50, atk: 9, def: 4, mov: 3, jump: 2, rmin: 1, rmax: 1, madu: 12, boss: true },
};
const NPCS = { zizi: { name: 'Zizi', hp: 28, atk: 0, def: 3, mov: 0, jump: 0, rmin: 0, rmax: 0 } };

const SKILLS = {
  kilat: { name: 'Tendangan Kilat', icon: '⚡', cost: 2, target: 'enemy', rmin: 1, rmax: 1, desc: 'Tendang 2 kali berturut-turut!' },
  putar: { name: 'Tendangan Putar', icon: '🌀', cost: 3, target: 'self', desc: 'Kena semua musuh di sekeliling Ata.' },
  sabuk: { name: 'Mode Sabuk Hitam', icon: '🥋', cost: 5, target: 'self', desc: 'Super kuat (+4) dan lebih cepat selama 3 giliran!' },
  tantang: { name: 'Tantang!', icon: '📣', cost: 2, target: 'self', desc: 'Musuh terpancing menyerang Ladhia saja.' },
  benteng: { name: 'Benteng Badak', icon: '🛡️', cost: 3, target: 'self', desc: 'Ladhia dan teman di sebelahnya: pertahanan +3.' },
  sup: { name: 'Sup Hangat', icon: '🍲', cost: 2, target: 'ally', rmin: 0, rmax: 3, desc: 'Sembuhkan satu teman (jarak 3).' },
  pedas: { name: 'Masakan Pedas', icon: '🌶️', cost: 3, target: 'enemy', rmin: 1, rmax: 3, desc: 'Lempar masakan super pedas! Musuh kepedasan dan tidak bisa bergerak 1 giliran.' },
};

const WHO = {
  nenek: { name: 'Nenek', kind: 'nenek', voice: [1.15, 0.85] },
  ata: { name: 'Ata', kind: 'ata', voice: [1.5, 1.05] },
  ladhia: { name: 'Ladhia', kind: 'ladhia', voice: [0.45, 0.9] },
  bubunti: { name: 'Bubunti', kind: 'bubunti', voice: [1.3, 0.95] },
  cilik: { name: 'Hyena Cilik', kind: 'hyenaCilik', voice: [1.8, 1.15] },
  gempal: { name: 'Hyena Gempal', kind: 'hyenaGempal', voice: [0.7, 1] },
  nasar: { name: 'Burung Nasar', kind: 'nasar', voice: [1.6, 1.2] },
  raja: { name: 'Raja Hyena', kind: 'rajaHyena', voice: [0.4, 0.85] },
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
    ['cilik', 'Hihihi! Wortelnya enak-enak! Ambil semua!'],
    ['nenek', 'Aduh! Ada yang mengacak-acak kebun Nenek!'],
    ['ata', 'Hei! Jangan ganggu kebun Nenek! Rasakan tendanganku!'],
  ],
  m1post: [
    ['cilik', 'Aduh, aduh! Ampun! Kami cuma disuruh Raja Hyena!'],
    ['nenek', 'Raja Hyena sekarang menguasai Savana. Hati-hati, Ata.'],
    ['ata', 'Tenang, Nek. Aku berangkat sekarang!'],
  ],
  m2pre: [
    ['ata', 'Wah, Savana luas sekali. Jalannya naik turun bukit.'],
    ['cilik', 'Ada musang kecil lewat! Kepung dia!'],
    ['ata', 'Aku bukan musang! Aku honey badger!'],
  ],
  m2post: [
    ['ata', 'Fiuh, selesai juga.'],
    ['narator', 'Tiba-tiba terdengar suara keras dari arah kubangan lumpur.'],
    ['ata', 'Suara apa itu? Sepertinya ada yang sedang dikeroyok!'],
  ],
  m3pre: [
    ['ladhia', 'Grrr! Kalian pikir aku takut? Majulah!'],
    ['gempal', 'Badak sendirian! Ayo keroyok dia!'],
    ['ata', 'Badak itu dikepung! Aku harus membantu!'],
    ['ladhia', 'Hmph. Bocah kecil? Baiklah, bantu aku!'],
  ],
  m3post: [
    ['ladhia', 'Kau kuat juga, bocah kecil. Namaku Ladhia.'],
    ['ata', 'Aku Ata! Aku sedang mencari Madu Legendaris dan sahabat-sahabat nenekku.'],
    ['ladhia', 'Madu Legendaris? Wajahku memang galak, tapi aku suka petualangan. Aku ikut!'],
  ],
  m4pre: [
    ['zizi', 'Kakak-kakak, tolong! Para hyena mau merebut sumur desa kami!'],
    ['ladhia', 'Berdiri di dekat sumur, Zizi. Kami yang jaga.'],
    ['ata', 'Kita bertahan sampai mereka menyerah!'],
  ],
  m4post: [
    ['zizi', 'Terima kasih, Kakak! Sumurnya selamat!'],
    ['zizi', 'Kata ayahku, di desa lembah ada koki llama yang masakannya bisa bikin sembuh. Jalannya lewat Bukit Batu.'],
    ['ladhia', 'Bukit Batu dijaga burung nasar. Kita harus cepat.'],
  ],
  m5pre: [
    ['nasar', 'Kaaak! Tidak ada yang boleh lewat Bukit Batu!'],
    ['ata', 'Kita harus sampai ke bendera di puncak bukit!'],
  ],
  m5post: [
    ['ata', 'Lihat! Ada desa di lembah! Baunya harum sekali!'],
    ['ladhia', 'Tapi ada asap dan suara ribut. Ayo turun!'],
  ],
  m6pre: [
    ['bubunti', 'Tolong jangan ambil panci-pancikuuu, itu untuk memasak sup warga desa.'],
    ['gempal', 'Raja Hyena lapar! Semua makanan ini milik Raja!'],
    ['ata', 'Llama itu dalam bahaya! Ayo, Ladhia!'],
    ['bubunti', 'Kalian mau menolongku? Aku Bubunti! Aku tidak suka bertengkar, tapi masakan pedasku bisa bikin mereka kepanasan!'],
  ],
  m6post: [
    ['bubunti', 'Terima kasih, teman-teman! Ini, makan dulu sup hangatnya.'],
    ['ata', 'Mmm, enak sekali! Badanku jadi segar!'],
    ['bubunti', 'Tapi Raja Hyena merampas guci madu desa kami. Dia kira itu Madu Legendaris.'],
    ['ladhia', 'Raja Hyena tinggal di Batu Singgasana. Dia juga menghalangi jalan keluar Savana.'],
    ['bubunti', 'Aku ikut kalian! Petualang butuh koki, kan?'],
  ],
  m7pre: [
    ['raja', 'Hahaha! Jadi kalian yang mengganggu geng-ku? Madu ini milikku!'],
    ['ata', 'Itu madu warga desa! Kembalikan!'],
    ['raja', 'Kalau berani, naik ke singgasanaku! Geng Hyena, serbu mereka!'],
  ],
  m7post: [
    ['raja', 'Aduh, aduh, ampun! Ini, ambil gucinya! Rasanya juga biasa saja!'],
    ['bubunti', 'Guci madu desa kembali!'],
    ['ata', 'Eh, ada tulisan di bawah guci. Untuk sahabatku, Tung Momon dan Tung Yanto. Rawa Bulan.'],
    ['ladhia', 'Tung Momon dan Tung Yanto? Apakah itu teman nenekmu?'],
    ['ata', 'Pasti! Nenek pernah menyebut nama itu. Tapi jalan ke Rawa Bulan lewat Hutan Lembab.'],
    ['bubunti', 'Katanya di Hutan Lembab ada Ular Beracun yang licik sekali.'],
    ['ata', 'Kita hadapi bersama! Petualangan kita baru dimulai!'],
  ],
};

/* Tipe: rout = kalahkan semua, boss = kalahkan bos, survive = bertahan n giliran, reach = capai bendera */
const MISSIONS = [
  {
    id: 'm1', no: 1, name: 'Kebun Nenek', sub: 'Latihan tendangan', type: 'rout', team: ['ata'], pal: 'kebun', music: 'calm', tut: true,
    desc: 'Usir hyena cilik yang mengacak-acak kebun Nenek.',
    star3: { type: 'turns', n: 6, text: 'Menang dalam 6 giliran' },
    t: ['h.cc..t', '..cc...', '......b', '.b..r..', '...c...', 't..cc..', '......t'],
    h: ['0000000', '0000000', '0000000', '0000100', '0000000', '0000000', '0000000'],
    players: [['ata', 5, 5]],
    enemies: [['hyenaCilik', 2, 0], ['hyenaCilik', 1, 2], ['hyenaCilik', 3, 1]],
    tips: ['Tap Ata untuk memilihnya. Petak biru adalah tempat Ata bisa berjalan.'],
    pre: 'm1pre', post: 'm1post',
  },
  {
    id: 'm2', no: 2, name: 'Jalan Setapak Savana', sub: 'Naik turun bukit', type: 'rout', team: ['ata'], pal: 'savana', music: 'adventure',
    desc: 'Lewati jalan setapak yang dijaga geng hyena.',
    star3: { type: 'turns', n: 8, text: 'Menang dalam 8 giliran' },
    t: ['t.,,...tt', '..,,b....', 'r.,,..r..', '..,,,,...', '.b..,,.b.', '....,,...', '..r.,,,..', 't...,,,b.', 'tt...,,..'],
    h: ['222110000', '221100000', '211000011', '110000012', '000000122', '000000112', '000000011', '000000000', '000000000'],
    players: [['ata', 6, 7]],
    enemies: [['hyenaCilik', 1, 1, 5], ['hyenaCilik', 4, 3, 5], ['hyenaCilik', 7, 4, 5], ['hyenaPelempar', 1, 0, 5]],
    tips: ['Berdiri di tempat yang lebih tinggi bikin seranganmu lebih kuat!', 'Hyena yang belum melihatmu akan diam menunggu. Pancing mereka satu per satu!'],
    pre: 'm2pre', post: 'm2post',
  },
  {
    id: 'm3', no: 3, name: 'Badak di Kubangan', sub: 'Bertemu Ladhia', type: 'rout', team: ['ata', 'ladhia'], guests: ['ladhia'], pal: 'savana', mud: true, music: 'adventure',
    desc: 'Seekor badak dikeroyok geng hyena di kubangan lumpur. Bantu dia!',
    star3: { type: 'turns', n: 7, text: 'Menang dalam 7 giliran' },
    t: ['tt.....tt', 't.......t', '...ww....', '..www.b..', '...ww....', '.b.......', '.....r...', '..r......', 't.......t'],
    h: ['110000011', '100000001', '000000000', '000000000', '000000000', '000000000', '000000000', '100000001', '110000011'],
    players: [['ata', 6, 8], ['ladhia', 5, 3]],
    enemies: [['hyenaCilik', 5, 1], ['hyenaCilik', 7, 3], ['hyenaGempal', 3, 5], ['hyenaGempal', 6, 5]],
    tips: ['Ladhia menyerang dari 2 petak dengan rantai meteornya.', 'Pakai jurus Tantang! supaya musuh menyerang Ladhia yang kuat, bukan Ata.'],
    pre: 'm3pre', post: 'm3post', recruit: 'ladhia',
  },
  {
    id: 'm4', no: 4, name: 'Jaga Sumur Air', sub: 'Lindungi Zizi', type: 'survive', n: 6, protect: 'zizi', team: ['ata', 'ladhia'], pal: 'savana', music: 'adventure',
    desc: 'Hyena mau merebut sumur desa. Bertahan 6 giliran dan jangan biarkan Zizi pingsan.',
    star3: { type: 'npc', key: 'zizi', text: 'Nyawa Zizi tersisa setengah atau lebih' },
    t: ['...t.t...', '.........', '.b.....b.', '...,,,...', 't..,s,..t', '...,,,...', '.........', '.r.....r.', '...t.t...'],
    h: ['110000011', '100000001', '000000000', '000000000', '000000000', '000000000', '000000000', '100000001', '110000011'],
    players: [['ata', 3, 6], ['ladhia', 5, 6]],
    npcs: [['zizi', 4, 5]],
    enemies: [['hyenaCilik', 0, 0], ['hyenaCilik', 8, 8]],
    waves: [
      { turn: 2, units: [['nasar', 8, 0], ['nasar', 0, 8]] },
      { turn: 3, units: [['hyenaPelempar', 0, 1], ['hyenaCilik', 8, 7]] },
      { turn: 4, units: [['hyenaGempal', 1, 4], ['hyenaGempal', 7, 4]] },
    ],
    tips: ['Zizi tidak bisa bergerak. Berdirilah di sebelah Zizi supaya musuh sulit mendekat!', 'Bala bantuan musuh datang dari pojok-pojok peta.'],
    pre: 'm4pre', post: 'm4post',
  },
  {
    id: 'm5', no: 5, name: 'Lari ke Bukit Batu', sub: 'Capai bendera', type: 'reach', limit: 9, team: ['ata', 'ladhia'], pal: 'savana', music: 'adventure',
    desc: 'Bawa salah satu temanmu ke bendera di puncak bukit sebelum giliran 9 habis.',
    star3: { type: 'turns', n: 5, text: 'Sampai dalam 5 giliran' },
    t: ['f.r..t...', '..b.....t', 'r...r....', '...b...b.', '.t.....r.', '....r....', 't...b...t', '...r.....', 'tt.....,,'],
    h: ['332221110', '332221100', '222111100', '222111000', '111110000', '111100000', '111000000', '100000000', '000000000'],
    players: [['ata', 8, 7], ['ladhia', 7, 8]],
    enemies: [['hyenaGempal', 3, 3, 4], ['hyenaPelempar', 1, 1, 4], ['hyenaPelempar', 4, 0, 4], ['nasar', 6, 1, 5], ['nasar', 2, 4, 5], ['hyenaCilik', 5, 3, 4]],
    tips: ['Ladhia hanya bisa memanjat 1 tingkat, Ata bisa 2 tingkat.', 'Tidak harus mengalahkan semua musuh. Yang penting sampai ke bendera!'],
    pre: 'm5pre', post: 'm5post',
  },
  {
    id: 'm6', no: 6, name: 'Dapur Bubunti', sub: 'Bertemu Bubunti', type: 'rout', protect: 'bubunti', team: ['ata', 'ladhia', 'bubunti'], guests: ['bubunti'], pal: 'desa', music: 'adventure',
    desc: 'Geng hyena menyerbu dapur desa. Selamatkan Bubunti, sang koki llama!',
    star3: { type: 'turns', n: 8, text: 'Menang dalam 8 giliran' },
    t: ['h.h..t.h.', '....k....', '.b.......', '...,,,...', 'h..,,,..h', '...,,,...', '.t.....b.', '.........', 'h...,...h'],
    h: ['111111111', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 3, 7], ['ladhia', 5, 7], ['bubunti', 4, 2]],
    enemies: [['hyenaCilik', 2, 1], ['hyenaCilik', 6, 2], ['hyenaGempal', 1, 3, 4], ['hyenaGempal', 7, 3, 4], ['hyenaPelempar', 6, 0, 5], ['hyenaCilik', 3, 0]],
    tips: ['Bubunti bisa menyembuhkan dengan Sup Hangat dan menyerang dengan Masakan Pedas!', 'Musuh yang kepedasan tidak bisa bergerak satu giliran. Jaga Bubunti jangan sampai pingsan!'],
    pre: 'm6pre', post: 'm6post', recruit: 'bubunti',
  },
  {
    id: 'm7', no: 7, name: 'Batu Singgasana', sub: 'Lawan Raja Hyena', type: 'boss', team: ['ata', 'ladhia', 'bubunti'], pal: 'savana', music: 'boss', elv: 2,
    desc: 'Raja Hyena menunggu di singgasananya. Kalahkan dia dan rebut kembali guci madu desa!',
    star3: { type: 'turns', n: 10, text: 'Menang dalam 10 giliran' },
    t: ['rr.....rr', 'r.......r', '...b.b...', '.........', '.t.....t.', '.........', '..b...b..', '.r.....r.', '.........'],
    h: ['332222233', '322222223', '211111112', '111000111', '100000001', '000000000', '000000000', '000000000', '000000000'],
    players: [['ata', 4, 7], ['ladhia', 3, 8], ['bubunti', 5, 8]],
    enemies: [['rajaHyena', 4, 1, 3], ['hyenaCilik', 2, 2, 5], ['hyenaCilik', 6, 2, 5], ['hyenaGempal', 4, 3, 4], ['hyenaPelempar', 1, 1, 5], ['hyenaPelempar', 7, 1, 5]],
    summon: { every: 3, max: 5, at: [[2, 0], [6, 0]] },
    tips: ['Raja Hyena memanggil anak buah setiap 3 giliran. Kalahkan Raja-nya secepat mungkin!', 'Jangan biarkan Ata maju sendirian. Bergerak bersama Ladhia dan Bubunti!'],
    pre: 'm7pre', post: 'm7post', final: true,
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
        if (edge === 1) { rt += hsh(x, y, mi) > 0.88 ? 'o' : 'y'; rh += '0'; continue; }
        const kx = Math.max(0, Math.min(n - 1, cx)), ky = Math.max(0, Math.min(n - 1, cy));
        const d = Math.max(Math.abs(cx - kx), Math.abs(cy - ky));
        const tc = m.t[ky][kx], hc = +m.h[ky][kx];
        rh += String(Math.max(0, hc - Math.floor(d / 2)));
        if (tc === ',' && (cx === kx || cy === ky)) { rt += ','; continue; }
        const r = hsh(x, y, mi + 11);
        let c = '.';
        if (r < 0.07) c = 'b';
        else if (r < 0.14) c = m.pal === 'savana' ? 't' : (hsh(x, y, 3) > 0.5 ? 'p' : 't');
        else if (r < 0.17) c = 'r';
        else if (r < 0.24) c = 'q';
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
