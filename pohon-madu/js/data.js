// Ata dan Pohon Madu Legendaris — data game
window.PM = window.PM || {};
(function () {
  PM.VERSION = 1;
  PM.SAVE_KEY = 'pohon-madu-v1';

  // ---------- tokoh ----------
  // stat = dasar + tumbuh × (level − 1)
  PM.CHARS = {
    ata: {
      name: 'Ata', job: 'Taekwondoin', h: 113,
      base: { hp: 40, mp: 6, atk: 9, def: 5, spd: 14 }, grow: { hp: 6, mp: 1.2, atk: 2, def: 1.2, spd: 1.5 },
      aff: { keras: 0.6, lincah: 1.5, bayangan: 0.8 },
      attack: { name: 'Pukulan Lurus', ko: 'Jireugi · 지르기', pose: 'pukul' },
      skills: ['depan', 'samping', 'putar', 'belakang', 'siaga', 'kapak'], menu: 'Jurus', crit: 0.15,
    },
    ladhia: {
      name: 'Ladhia', job: 'Paladin', h: 264,
      base: { hp: 55, mp: 4, atk: 10, def: 12, spd: 4 }, grow: { hp: 9, mp: 0.5, atk: 2, def: 2, spd: 0.4 },
      aff: { keras: 1.5, lincah: 0.8, bayangan: 0.8 }, missLincah: 0.3,
      attack: { name: 'Ayunan Meteor', pose: 'ayun' },
      skills: ['lindungi', 'meteor', 'tantang', 'perisai', 'tombak'], menu: 'Jurus', crit: 0.08,
    },
    bubunti: {
      name: 'Bubunti', job: 'Chef', h: 150,
      base: { hp: 32, mp: 14, atk: 4, def: 5, spd: 9 }, grow: { hp: 5, mp: 2, atk: 0.8, def: 1.2, spd: 1 },
      aff: { keras: 0.8, lincah: 1, bayangan: 0.8 },
      attack: { name: 'Pukulan Spatula', pose: 'ayun' },
      skills: ['sup', 'jahe', 'liwet', 'bubur', 'tehmadu', 'semangat', 'sambal'], menu: 'Masak', crit: 0.05,
    },
  };
  PM.ORDER = ['ata', 'ladhia', 'bubunti'];

  // tgt: enemy | all-enemy | ally | ally-other | ally-down | party | self
  PM.SKILLS = {
    // Ata (nama Indonesia + Korea)
    depan: { who: 'ata', name: 'Tendangan Depan', ko: 'Ap Chagi · 앞차기', lv: 2, mp: 2, tgt: 'enemy', power: 1.5, sure: true, pose: 'tendang',
      desc: 'Tendangan cepat yang tidak pernah meleset.' },
    samping: { who: 'ata', name: 'Tendangan Samping', ko: 'Yeop Chagi · 옆차기', lv: 4, mp: 3, tgt: 'enemy', power: 1.2, push: true, pose: 'tendang',
      desc: 'Musuh terdorong ke belakang antrean. Kalau musuh sedang 💥, tenaganya buyar!' },
    putar: { who: 'ata', name: 'Tendangan Putar', ko: 'Dollyeo Chagi · 돌려차기', lv: 7, mp: 4, tgt: 'enemy', power: 0.85, hits: 2, pose: 'tendang',
      desc: 'Dua tendangan sekaligus. Sangat ampuh ke 🪶 Lincah.' },
    belakang: { who: 'ata', name: 'Tendangan Belakang', ko: 'Dwi Chagi · 뒤차기', lv: 10, pick: 'ata10', mp: 5, tgt: 'enemy', power: 1.3, vsCharge: 2.4, pose: 'tendang',
      desc: 'Sangat kuat ke musuh yang sedang 💥 kumpul tenaga.' },
    siaga: { who: 'ata', name: 'Kuda-kuda Siaga', ko: 'Gyeorugi Junbi · 겨루기 준비', lv: 10, pick: 'ata10', mp: 3, tgt: 'self', pose: 'siaga',
      desc: 'Ata pasti menghindar dari serangan berikutnya, lalu membalas!' },
    kapak: { who: 'ata', name: 'Tendangan Kapak', ko: 'Naeryeo Chagi · 내려차기', lv: 13, mp: 4, tgt: 'enemy', power: 1.0, defDown: 3, pose: 'tendang',
      desc: 'DEF musuh turun 3 giliran. Pukulan teman jadi lebih sakit!' },
    // Ladhia
    lindungi: { who: 'ladhia', name: 'Lindungi', icon: '🛡️', lv: 1, mp: 1, tgt: 'ally-other', pose: 'bertahan',
      desc: 'Ladhia menerima pukulan untuk satu teman sampai giliran Ladhia berikutnya.' },
    meteor: { who: 'ladhia', name: 'Hantaman Meteor', icon: '☄️', lv: 1, mp: 2, tgt: 'enemy', power: 1.6, pose: 'lempar',
      desc: 'Pukulan berat. Sangat ampuh ke 🪨 Keras.' },
    tantang: { who: 'ladhia', name: 'Tantang', icon: '📣', lv: 8, mp: 2, tgt: 'self', taunt: 2, pose: 'bertahan',
      desc: 'Semua musuh mengincar Ladhia selama 2 giliran. Teman jadi aman.' },
    perisai: { who: 'ladhia', name: 'Dinding Perisai', icon: '🧱', lv: 10, pick: 'ladhia10', mp: 3, tgt: 'party', defUp: 3, pose: 'bertahan',
      desc: 'DEF seluruh tim naik selama 3 giliran.' },
    tombak: { who: 'ladhia', name: 'Hantaman Tembus', icon: '⚡', lv: 10, pick: 'ladhia10', mp: 3, tgt: 'enemy', power: 1.4, pierce: true, pose: 'lempar',
      desc: 'Menembus musuh yang sedang 🛡️ bertahan.' },
    // Bubunti (masakan)
    sup: { who: 'bubunti', name: 'Sup Hangat', icon: '🍵', lv: 1, mp: 3, tgt: 'ally', heal: 0.35, flat: 10, pose: 'sorak',
      desc: 'Menyembuhkan satu teman.' },
    jahe: { who: 'bubunti', name: 'Wedang Jahe', icon: '☕', lv: 1, mp: 4, tgt: 'ally-down', revive: 0.4, pose: 'sorak',
      desc: 'Membangunkan teman yang pingsan.' },
    liwet: { who: 'bubunti', name: 'Nasi Liwet Bersama', icon: '🍚', lv: 9, mp: 8, tgt: 'party', heal: 0.25, flat: 5, pose: 'sorak',
      desc: 'Menyembuhkan seluruh tim.' },
    bubur: { who: 'bubunti', name: 'Bubur Lembut', icon: '🥣', lv: 10, pick: 'bubunti10', mp: 4, tgt: 'party', cleanse: true, immune: 3, pose: 'sorak',
      desc: 'Membangunkan yang tertidur + tim kebal tidur 3 giliran.' },
    tehmadu: { who: 'bubunti', name: 'Teh Hangat Madu', icon: '🫖', lv: 10, pick: 'bubunti10', mp: 5, tgt: 'party', regen: 3, pose: 'sorak',
      desc: 'Tim pulih sedikit setiap giliran, selama 3 giliran.' },
    semangat: { who: 'bubunti', name: 'Bekal Semangat', icon: '🍙', lv: 12, mp: 4, tgt: 'ally', atkUp: 3, pose: 'sorak',
      desc: 'ATK satu teman naik selama 3 giliran.' },
    sambal: { who: 'bubunti', name: 'Sambal Super Pedas', icon: '🌶️', lv: 16, mp: 9, tgt: 'all-enemy', power: 1.6, elem: 'pedas', pose: 'ayun',
      desc: 'Satu-satunya serangan Bubunti: kena semua musuh, sangat ampuh ke 🌑 Bayangan.' },
  };
  PM.ELEM = { pedas: { keras: 1, lincah: 1, bayangan: 2 } };
  PM.PICKS = { ata10: ['belakang', 'siaga'], ladhia10: ['perisai', 'tombak'], bubunti10: ['bubur', 'tehmadu'] };

  PM.TYPES = { keras: { icon: '🪨', name: 'Keras' }, lincah: { icon: '🪶', name: 'Lincah' }, bayangan: { icon: '🌑', name: 'Bayangan' } };

  // ---------- sabuk Ata ----------
  PM.BELTS = [
    { id: 'putih', name: 'Sabuk Putih', lv: 1, ramp: ['#9f9a90', '#f3efe6'], chip: '⬜' },
    { id: 'kuning', name: 'Sabuk Kuning', lv: 5, ramp: ['#a47410', '#ffd84a'], chip: '🟨' },
    { id: 'hijau', name: 'Sabuk Hijau', lv: 10, ramp: ['#2c6a22', '#79c95a'], chip: '🟩' },
    { id: 'biru', name: 'Sabuk Biru', lv: 16, ramp: ['#1d3f8a', '#5f95ec'], chip: '🟦' },
    { id: 'merah', name: 'Sabuk Merah', lv: 23, ramp: ['#7a1414', '#e24a3e'], chip: '🟥' },
    { id: 'hitam', name: 'Sabuk Hitam', lv: 30, ramp: null, chip: '⬛' },
  ];
  PM.beltFor = (lv) => PM.BELTS.filter((b) => lv >= b.lv).pop();
  // kotak area sabuk per pose (koordinat gambar asli)
  PM.BELT_AREA = {
    siaga: [[66, 138, 160, 248]], tendang: [[97, 122, 174, 166], [100, 160, 130, 212]],
    kanan: [[57, 165, 178, 236]], depan: [[55, 165, 152, 258]], pukul: [[80, 138, 162, 236]],
  };

  PM.MAX_LV = 40;
  PM.expTo = (lv) => Math.round(8 * Math.pow(lv, 1.5));   // EXP untuk naik dari lv ke lv+1

  // ---------- musuh ----------
  // spr = sprite battle (menghadap kanan; flip = dibalik), face = ikon, fly = melayang
  PM.ENEMIES = {
    kumbang: { name: 'Kumbang Batu', type: 'keras', spr: 'kumbang-2', face: 'kumbang-1', h: 112,
      hp: 12, atk: 6, def: 4, spd: 6, exp: 10, koin: 3, ai: { attack: 55, charge: 30, defend: 15 } },
    tawon: { name: 'Tawon Nakal', type: 'lincah', spr: 'tawon-4', face: 'tawon-1', h: 128, fly: 64,
      hp: 10, atk: 5, def: 2, spd: 15, exp: 8, koin: 3, ai: { attack: 80, lengah: 20 } },
    siput: { name: 'Siput Lendir', type: 'keras', spr: 'siput-2', flip: true, face: 'siput-1', h: 112,
      hp: 16, atk: 5, def: 7, spd: 2, exp: 12, koin: 4, ai: { attack: 50, defend: 25, lengah: 25 } },
    'raja-kumbang': { name: 'Raja Kumbang', type: 'keras', spr: 'raja-kumbang-2', flip: true, face: 'raja-kumbang-1', h: 290, boss: true,
      hp: 60, atk: 11, def: 5, spd: 7, exp: 90, koin: 30, heavyName: 'Hantaman Mahkota',
      pattern: ['attack', 'charge', 'heavy'], phase2: { at: 0.5, summon: ['kumbang'], pattern: ['attack', 'charge', 'heavy', 'defend'], say: 'Raja Kumbang memanggil prajuritnya!' } },
    kadal: { name: 'Kadal Kerikil', type: 'keras', spr: 'kadal-3', face: 'kadal-1', h: 105,
      hp: 44, atk: 14, def: 11, spd: 8, exp: 28, koin: 6, ai: { attack: 60, charge: 25, defend: 15 } },
    kelelawar: { name: 'Kelelawar Tambang', type: 'lincah', spr: 'kelelawar-3', face: 'kelelawar-1', h: 110, fly: 70,
      hp: 26, atk: 12, def: 6, spd: 20, exp: 22, koin: 5, ai: { attack: 75, charge: 15, lengah: 10 } },
    musang: { name: 'Musang Bayangan', type: 'bayangan', spr: 'musang-4', face: 'musang-1', h: 100,
      hp: 34, atk: 14, def: 8, spd: 16, exp: 30, koin: 7, ai: { attack: 65, charge: 20, lengah: 15 } },
    landak: { name: 'Landak Baja', type: 'keras', spr: 'landak-4', face: 'landak-1', h: 150, boss: true,
      hp: 150, atk: 16, def: 18, spd: 6, exp: 150, koin: 40, spikes: 5, heavyName: 'Gulingan Duri',
      pattern: ['defend', 'attack', 'charge', 'heavy'] },
    'kepala-musang': { name: 'Kepala Musang', type: 'bayangan', spr: 'kepala-musang-4', face: 'kepala-musang-1', h: 250, boss: true,
      hp: 230, atk: 18, def: 10, spd: 17, exp: 260, koin: 60, heavyName: 'Cakar Bayangan',
      pattern: ['attack', 'charge', 'heavy'], phase2: { at: 0.5, summon: ['musang', 'musang'], pattern: ['attack', 'attack', 'charge', 'heavy'], say: 'Kepala Musang memanggil anak buahnya!' } },
    katak: { name: 'Katak Lumpur', type: 'keras', spr: 'katak-2', flip: true, face: 'katak-1', h: 112,
      hp: 60, atk: 19, def: 15, spd: 8, exp: 45, koin: 8, ai: { attack: 55, charge: 25, defend: 20 } },
    nyamuk: { name: 'Nyamuk Rawa', type: 'lincah', spr: 'nyamuk-2', face: 'nyamuk-1', h: 118, fly: 72,
      hp: 36, atk: 17, def: 7, spd: 22, exp: 40, koin: 8, ai: { attack: 80, lengah: 20 } },
    jamur: { name: 'Jamur Bayangan', type: 'bayangan', spr: 'jamur-4', face: 'jamur-1', h: 122,
      hp: 44, atk: 13, def: 10, spd: 10, exp: 42, koin: 8, ai: { attack: 45, spora: 35, lengah: 20 } },
    belut: { name: 'Belut Rawa', type: 'lincah', spr: 'belut-1', flip: true, face: 'belut-1', h: 150, boss: true,
      hp: 260, atk: 22, def: 12, spd: 20, exp: 300, koin: 60, heavyName: 'Lilitan Belut',
      pattern: ['attack', 'attack', 'charge', 'heavy'], phase2: { at: 0.5, pattern: ['defend', 'attack', 'charge', 'heavy'], say: 'Belut Rawa bersembunyi di air!' } },
    'lumpur-raksasa': { name: 'Lumpur Raksasa', type: 'bayangan', spr: 'lumpur-raksasa-2', face: 'lumpur-raksasa-1', h: 300, boss: true,
      hp: 340, atk: 24, def: 16, spd: 8, exp: 520, koin: 100, heavyName: 'Banjir Lumpur',
      pattern: ['attack', 'charge', 'heavy'],
      phase2: { at: 0.5, spr: 'lumpur-raksasa-4', spd: 2.2, def: 0.6, pattern: ['attack', 'spora', 'charge', 'heavy'], say: 'Lumpur Raksasa meleleh — jadi lebih kecil tapi CEPAT!' } },
  };

  // ---------- pertarungan (pratinjau: belum ada peta jelajah) ----------
  PM.ENCOUNTERS = [
    { id: 'p1', bab: 'Prolog', name: 'Hutan Pinggir', bg: 'hutan-pinggir', foes: ['kumbang', 'tawon'], intro: 'Kumbang Batu dan Tawon Nakal menghadang di hutan!' },
    { id: 'p2', bab: 'Prolog', name: 'Semak Berduri', bg: 'hutan-pinggir', foes: ['siput', 'tawon', 'kumbang'], intro: 'Ada tiga musuh sekaligus! Pilih siapa yang dikalahkan dulu.' },
    { id: 'p3', bab: 'Prolog', name: 'Bos: Raja Kumbang', bg: 'halaman-dojo', foes: ['raja-kumbang'], boss: true, join: 'ladhia',
      intro: 'Raja Kumbang mengamuk di halaman dojo! Perhatikan saat ia 💥 kumpul tenaga.' },
    { id: 'b1a', bab: 'Bab 1', name: 'Lembah Kerikil', bg: 'lembah-kerikil', foes: ['kadal', 'kadal'], intro: 'Dua Kadal Kerikil bersisik batu. Ladhia ampuh melawan 🪨 Keras!' },
    { id: 'b1b', bab: 'Bab 1', name: 'Jembatan Batu', bg: 'jembatan-batu', foes: ['kadal', 'kelelawar'], intro: 'Kelelawar 🪶 Lincah sulit dipukul Ladhia. Ata lebih cocok!' },
    { id: 'b1c', bab: 'Bab 1', name: 'Tambang Tua', bg: 'tambang-tua', foes: ['kelelawar', 'musang', 'kelelawar'], intro: 'Gerombolan Musang Bayangan bersembunyi di tambang!' },
    { id: 'b1d', bab: 'Bab 1', name: 'Bos tengah: Landak Baja', bg: 'tambang-tua', foes: ['landak'], boss: true,
      intro: 'Landak Baja! Saat ia 🛡️ menggulung, durinya membalas pukulan.' },
    { id: 'b1e', bab: 'Bab 1', name: 'Bos: Kepala Musang', bg: 'tambang-tua', foes: ['kepala-musang'], boss: true, join: 'bubunti',
      intro: 'Kepala Musang, ketua gerombolan pencuri, muncul dari bayangan!' },
    { id: 'b2a', bab: 'Bab 2', name: 'Rawa Kabut', bg: 'rawa-kabut', foes: ['katak', 'nyamuk', 'jamur'], intro: 'Tiga tipe musuh sekaligus! Jamur Bayangan bisa membuat tim tertidur.' },
    { id: 'b2b', bab: 'Bab 2', name: 'Bos tengah: Belut Rawa', bg: 'rawa-kabut', foes: ['belut'], boss: true, intro: 'Belut Rawa muncul dari air keruh!' },
    { id: 'b2c', bab: 'Bab 2', name: 'Gua Embun', bg: 'gua-embun', foes: ['jamur', 'nyamuk', 'jamur'], intro: 'Gua penuh spora! Siapkan masakan Bubunti.' },
    { id: 'b2d', bab: 'Bab 2', name: 'Bos: Lumpur Raksasa', bg: 'gua-embun', foes: ['lumpur-raksasa'], boss: true,
      intro: 'Lumpur Raksasa menyumbat mata air! Bebaskan Desa Embun!' },
  ];
  PM.JOIN = {
    ladhia: 'Ladhia si badak penjaga jembatan bergabung! Ia kuat & tangguh melindungi teman.',
    bubunti: 'Bubunti si llama chef bergabung! Masakannya menyembuhkan tim.',
  };

  // posisi kaki di panggung 1200×840 (tim menghadap kiri, musuh menghadap kanan)
  PM.POS = {
    party: { 1: { ata: [610, 470] }, 2: { ata: [705, 330], ladhia: [520, 600] }, 3: { ata: [700, 318], ladhia: [505, 565], bubunti: [715, 690] } },
    foes: { 1: [[150, 440]], 2: [[150, 400], [215, 610]], 3: [[140, 410], [300, 360], [190, 615]] },
    boss: [190, 610], summon: [[360, 300], [90, 330]],
  };
})();
