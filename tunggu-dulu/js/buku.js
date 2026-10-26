// Tunggu Dulu! — layar bentangan buku cerita: laporan malam & Pesta Permata.
// Halaman kiri = suasana senja desa + kalimat cerita di langit; halaman kanan = malam, lingkaran cahaya lentera,
// warga berkumpul, dan panel "gelembung pikiran" berisi kejadian hari itu.
(function () {
  const TD = window.TD, A = TD.art;

  A.BUKU_DEFS = `<defs>
    <linearGradient id="duskSky" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0" stop-color="#8c8fb8"/><stop offset="0.5" stop-color="#e3b2ac"/><stop offset="1" stop-color="#f7d4a6"/></linearGradient>
    <linearGradient id="gutter" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#000" stop-opacity="0"/><stop offset="0.5" stop-color="#2a1a10" stop-opacity="0.45"/><stop offset="1" stop-color="#000" stop-opacity="0"/></linearGradient>
    <radialGradient id="crowdGlow" cx="0.5" cy="0.55" r="0.5">
      <stop offset="0" stop-color="#ffd890" stop-opacity="0.9"/><stop offset="0.45" stop-color="#f2b766" stop-opacity="0.55"/><stop offset="1" stop-color="#f2b766" stop-opacity="0"/></radialGradient>
    <clipPath id="pageL"><rect x="0" y="0" width="590" height="820"/></clipPath>
    <clipPath id="pageR"><rect x="590" y="0" width="590" height="820"/></clipPath>
  </defs>`;

  // warga kurcaci berdiri (titik asal = kaki), bisa membawa lentera
  A.villager = function (x, y, s, o = {}) {
    const hat = o.hat || '#c8553d', beard = o.beard || '#f3e6cc', coat = o.coat || '#5f948c', flip = o.flip ? -1 : 1;
    const face = o.happy
      ? `<path d="M-12 -104 q4 -5 8 0 M4 -104 q4 -5 8 0" stroke="#3a2a22" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
      : `<circle cx="-8" cy="-104" r="2.6" fill="#3a2a22"/><circle cx="8" cy="-104" r="2.6" fill="#3a2a22"/>`;
    const lantern = o.lantern ? `<circle cx="34" cy="-30" r="34" fill="url(#glow)"/>
      <path d="M26 -66 L34 -48" stroke="#5a3a2a" stroke-width="2.5"/><rect x="26" y="-48" width="16" height="20" rx="6" fill="#e8643a"/>
      <ellipse cx="34" cy="-38" rx="4" ry="6" fill="#ffd98a"/>` : '';
    return `<g transform="translate(${x} ${y}) scale(${s * flip} ${s})"><g filter="url(#rough)">
      <ellipse cx="-12" cy="-5" rx="11" ry="7" fill="#4a3226"/><ellipse cx="12" cy="-5" rx="11" ry="7" fill="#4a3226"/>
      <path d="M-30 -12 Q-34 -70 -18 -84 L18 -84 Q34 -70 30 -12 Z" fill="${coat}"/>
      <path d="M-30 -12 Q-34 -70 -18 -84 L0 -84 L0 -12 Z" fill="#000" opacity="0.1"/>
      <rect x="-31" y="-44" width="62" height="7" fill="#4a3226"/><rect x="-5" y="-45" width="10" height="9" fill="#e8b84a"/>
      <ellipse cx="-30" cy="-58" rx="8" ry="20" fill="${coat}"/>
      ${o.lantern ? `<path d="M24 -76 Q34 -70 28 -64" stroke="${coat}" stroke-width="14" fill="none" stroke-linecap="round"/><circle cx="27" cy="-64" r="7" fill="#e8a882"/>` : `<ellipse cx="30" cy="-58" rx="8" ry="20" fill="${coat}"/>`}
      <circle cx="-23" cy="-100" r="6" fill="#e8a882"/><circle cx="23" cy="-100" r="6" fill="#e8a882"/>
      <circle cx="0" cy="-102" r="24" fill="#f2c39c"/>
      <path d="M-27 -110 Q-18 -150 6 -170 Q16 -176 24 -168 Q14 -160 12 -148 Q20 -128 27 -110 Q0 -102 -27 -110 Z" fill="${hat}"/>
      <path d="M-28 -112 Q0 -102 28 -112 L28 -106 Q0 -96 -28 -106 Z" fill="#000" opacity="0.25"/>
      ${o.noBeard ? `<path d="M-7 -90 q7 6 14 0" stroke="#3a2a22" stroke-width="2.5" fill="none" stroke-linecap="round"/>`
        : `<path d="M-18 -96 Q-22 -60 0 -54 Q22 -60 18 -96 Q0 -86 -18 -96 Z" fill="${beard}"/>`}
      ${face}
      <ellipse cx="-13" cy="-96" rx="5" ry="3" fill="#e88a78" opacity="0.6"/><ellipse cx="13" cy="-96" rx="5" ry="3" fill="#e88a78" opacity="0.6"/>
      </g>${lantern}</g>`;
  };
  // penjaga muda (pemain): tanpa janggut, jas hijau, topi cokelat berlencana bintang
  A.guard = (x, y, s, o = {}) => A.villager(x, y, s, Object.assign({ hat: '#8a5634', coat: '#5d7d55', noBeard: true, happy: true }, o))
    + `<path transform="translate(${x + 4 * s} ${y - 132 * s}) scale(${s})" d="M0 -7 l2 5 l5 0 l-4 3 l2 5 l-5 -3 l-5 3 l2 -5 l-4 -3 l5 0z" fill="#ffd84a"/>`;

  A.trollFace = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#rough)">
    <path d="M-20 -6 L-44 -24 L-24 4 Z M20 -6 L44 -24 L24 4 Z" fill="#7aa34a"/>
    <circle cx="0" cy="0" r="26" fill="#8db35a"/>
    <path d="M-15 -10 L-4 -5 M15 -10 L4 -5" stroke="#2a3a1a" stroke-width="4" stroke-linecap="round"/>
    <circle cx="-8" cy="0" r="3" fill="#2a2a1a"/><circle cx="8" cy="0" r="3" fill="#2a2a1a"/>
    <path d="M-12 12 Q0 20 12 12" stroke="#2a3a1a" stroke-width="3" fill="none"/>
    <path d="M-9 13 L-7 6 L-4 14 Z M9 13 L7 6 L4 14 Z" fill="#fffaf0"/></g>`;
  A.trollRun = (x, y, s) => `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#rough)">
    <path d="M-8 30 l-10 18 M8 30 l12 16" stroke="#5f7f3a" stroke-width="9" stroke-linecap="round"/>
    <ellipse cx="0" cy="10" rx="20" ry="26" fill="#5a6aa0"/><circle cx="0" cy="-22" r="16" fill="#8db35a"/>
    <path d="M-14 -26 l-12 -10 l4 14 M14 -26 l12 -10 l-4 14" fill="#8db35a"/>
    <ellipse cx="28" cy="-4" rx="20" ry="22" fill="#d8c08e"/>
    <path d="M22 -24 l3 -6 l3 6 l-3 4z" fill="#5ad0ff"/><path d="M34 -22 l3 -6 l3 6 l-3 4z" fill="#ff7ab8"/></g>`;
  A.star = (x, y, s, c = '#ffd84a') => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -20 l6 13 l14 1 l-11 9 l4 14 l-13 -8 l-13 8 l4 -14 l-11 -9 l14 -1z" fill="${c}"/>`;
  A.fireflies = (pts) => pts.map(([x, y], i) => `<circle class="twinkle" style="animation-delay:${(i * 0.37) % 2}s" cx="${x}" cy="${y}" r="3" fill="#fff2a8"/>`).join('');

  // panel gelembung pikiran dengan ilustrasi + keterangan, ekornya bulatan kecil menuju kerumunan
  A.thought = function (x, y, w, h, bg, art, caption, tail) {
    const [tx, ty] = tail;
    const dots = [0.35, 0.65, 0.9].map((t, i) => `<circle cx="${x + w / 2 + (tx - x - w / 2) * t}" cy="${y + h + (ty - y - h) * t}" r="${8 - i * 2.5}" fill="#f3e3c3"/>`).join('');
    return `<g filter="url(#rough)">${dots}
      <rect x="${x - 6}" y="${y - 6}" width="${w + 12}" height="${h + 12}" rx="22" fill="#f3e3c3"/>
      <rect x="${x}" y="${y}" width="${w}" height="${h - 40}" rx="16" fill="${bg}"/></g>
      <g>${art}</g>
      <text x="${x + w / 2}" y="${y + h - 12}" text-anchor="middle" font-size="${caption.length > 16 ? 17 : 20}" font-weight="700" fill="#3a2a22">${caption}</text>`;
  };

  // ---------- halaman kiri: senja di gerbang desa ----------
  function leftPage(o) {
    const lanterns = [[120, 186], [220, 214], [330, 222], [440, 208]];
    return `<g clip-path="url(#pageL)">
      <rect width="590" height="820" fill="url(#duskSky)"/>
      <g filter="url(#soft)" opacity="0.7"><ellipse cx="160" cy="250" rx="120" ry="16" fill="#f8dcd2"/><ellipse cx="440" cy="300" rx="100" ry="14" fill="#f8dcd2"/></g>
      <path d="M430 118 q9 -9 18 0 q9 -9 18 0 M480 90 q7 -7 14 0 q7 -7 14 0 M398 150 q6 -6 12 0 q6 -6 12 0" fill="none" stroke="#3a2a3a" stroke-width="3" stroke-linecap="round"/>
      <text x="40" y="74" font-size="38" font-weight="700" fill="#fff8ea">${o.judul}</text>
      ${o.kalimat.map((l, i) => `<text x="40" y="${112 + i * 32}" font-size="25" fill="#fff8ea">${l}</text>`).join('')}
      <g filter="url(#rough)">
        <path d="M0 470 L90 380 L170 430 L270 350 L380 440 L470 380 L590 450 L590 520 L0 520 Z" fill="#94a7b8"/>
        <path d="M0 500 L120 440 L230 480 L350 430 L470 490 L590 460 L590 540 L0 540 Z" fill="#7c998c"/>
        <path d="M0 520 q20 -26 40 -4 q18 -24 40 -2 q22 -28 44 0 q20 -22 42 -2 q20 -26 42 0 q22 -24 44 -2 q18 -26 40 0 q22 -26 44 -2 q20 -24 42 0 q20 -26 42 0 q18 -22 40 0 q20 -26 42 -2 q16 -20 34 0 L590 560 L0 560 Z" fill="#5f7f55"/>
        <path d="M0 548 Q300 524 590 546 L590 820 L0 820 Z" fill="#9cb45e"/>
        <path d="M250 548 Q236 620 190 700 Q160 760 140 820 L360 820 Q330 740 310 680 Q296 610 292 548 Z" fill="#e2c296"/>
        <!-- pondok jerami kanan -->
        <path d="M430 650 L436 540 L590 536 L590 652 Z" fill="#8a5a3a"/>
        <path d="M400 552 Q500 430 600 520 L600 560 Q500 572 400 552 Z" fill="#c99b5a"/>
        <path d="M440 500 l-12 40 M480 476 l-6 52 M520 470 l2 56 M560 480 l8 48" stroke="#a57a42" stroke-width="4" fill="none"/>
        <rect x="470" y="580" width="40" height="34" fill="#ffcf7a"/><path d="M490 580 v34 M470 597 h40" stroke="#8a5a3a" stroke-width="4"/>
        <!-- pos jaga kiri -->
        <rect x="18" y="300" width="22" height="440" fill="#7a4a2c"/>
        <path d="M-20 300 Q80 250 170 320 L170 350 Q80 336 -20 350 Z" fill="#c99b5a"/>
        <path d="M10 296 l-4 40 M50 284 l-2 52 M90 290 l2 48 M130 304 l4 40" stroke="#a57a42" stroke-width="4" fill="none"/>
        <!-- tiang & tali lentera -->
        <rect x="64" y="160" width="10" height="420" fill="#6a4a34"/><rect x="514" y="150" width="10" height="400" fill="#6a4a34"/>
        <path d="M70 170 Q290 250 518 160" fill="none" stroke="#4a3226" stroke-width="3"/>
      </g>
      ${lanterns.map(([x, y]) => A.lantern(x, y, 1.3)).join('')}
      ${A.lantern(150, 356, 1.6)}<path d="M150 336 L150 350" stroke="#4a3226" stroke-width="3"/>
      ${A.fireflies([[100, 470], [210, 420], [360, 470], [540, 420], [300, 600], [60, 640], [420, 700]])}
      ${o.leftCast}
    </g>`;
  }

  // ---------- halaman kanan: malam, warga dalam cahaya lentera ----------
  function rightPage(o) {
    return `<g clip-path="url(#pageR)">
      <rect x="590" width="590" height="820" fill="#2f3d3e"/>
      <rect x="590" width="590" height="820" fill="#1d2a30" opacity="0.35" filter="url(#mottle)"/>
      <ellipse cx="885" cy="560" rx="330" ry="300" fill="url(#crowdGlow)"/>
      ${A.fireflies([[640, 420], [1130, 380], [700, 760], [1100, 720], [620, 300], [1150, 560]])}
      <text x="885" y="64" text-anchor="middle" font-size="38" font-weight="700" fill="#fff2d0">${o.judulKanan}</text>
      ${o.rightInner}
    </g>`;
  }

  function spread(o) {
    return A.BUKU_DEFS + leftPage(o) + rightPage(o)
      + `<rect x="560" y="0" width="60" height="820" fill="url(#gutter)"/>`;
  }

  // susun warga di dalam cahaya: maks 6, bergantian kiri-kanan Tetua
  function crowd(list, cx, y) {
    const spots = [[-120, 10, 1.25], [125, 10, 1.25], [-215, 34, 1.15], [215, 34, 1.15], [-62, -40, 1.0], [66, -40, 1.0]];
    return list.slice(0, 6).map((g, i) => {
      const [dx, dy, s] = spots[i];
      return A.villager(cx + dx, y + dy, s, { hat: TD.TOPI[g.topi], beard: TD.JANGGUT[g.janggut], coat: g.baju, lantern: i % 2 === 0, happy: true, flip: dx > 0 });
    });
  }
  const FILL = [{ topi: 'biru', janggut: 'putih', baju: '#a8432e' }, { topi: 'kuning', janggut: 'cokelat', baju: '#5f948c' },
    { topi: 'oranye', janggut: 'oranye', baju: '#5a6aa0' }, { topi: 'ungu', janggut: 'putih', baju: '#6a7a3a' },
    { topi: 'merah', janggut: 'cokelat', baju: '#8a5a7a' }, { topi: 'kuning', janggut: 'putih', baju: '#b0843a' }];

  // o: {hari, st, permata, rep, repGain, lembur, perfect, mood, say, diterima, last}
  A.reportSpread = function (o) {
    const st = o.st;
    const warga = o.diterima.concat(FILL).slice(0, 6);
    const people = crowd(warga, 885, 650);
    // panel kejadian
    const trollFaces = Array.from({ length: Math.min(st.ketahuan, 3) }, (_, i) => A.trollFace(668 + i * 30 - (Math.min(st.ketahuan, 3) - 1) * 15, 150 + (i % 2) * 14, 0.75)).join('') || A.star(668, 150, 1.6, '#c9b48a');
    const heads = Array.from({ length: Math.min(st.masuk, 4) }, (_, i) => {
      const g = warga[i] || FILL[i];
      return A.miniDwarf(812 + i * 26 - (Math.min(st.masuk, 4) - 1) * 13, 160, 0.62, TD.TOPI[g.topi], TD.JANGGUT[g.janggut], g.baju);
    }).join('');
    const gems = [['#5ad0ff', -26, 8], ['#ff7ab8', 0, -6], ['#ffd84a', 26, 8], ['#8ae07a', -13, 26], ['#5ad0ff', 13, 26]]
      .map(([c, dx, dy]) => A.gem(958 + dx, 140 + dy, 1.1, c)).join('');
    let fourth, cap4, bg4;
    if (st.lolos) { fourth = A.trollRun(1092, 150, 1); cap4 = st.salah ? `${st.lolos + st.salah} kesalahan` : `${st.lolos} troll lolos`; bg4 = '#b8482e'; }
    else if (st.salah) { fourth = A.villager(1100, 196, 0.65, { hat: '#4f7aa8', coat: '#a8432e' }) + `<path d="M1094 132 q-3 9 0 13 q4 -4 0 -13" fill="#8cc6e8"/>`; cap4 = `${st.salah} salah tuduh`; bg4 = '#c8803a'; }
    else { fourth = A.star(1100, 150, 2.2); cap4 = 'Tanpa salah!'; bg4 = '#6f9445'; }
    const panels = A.thought(616, 96, 108, 140, '#5f7f55', trollFaces, `${st.ketahuan} ketahuan`, [800, 430])
      + A.thought(750, 96, 120, 140, '#e9b6a8', heads, `${st.masuk} masuk`, [850, 420])
      + A.thought(896, 96, 124, 140, '#3a4a6a', `<circle cx="958" cy="150" r="44" fill="url(#glow)"/>` + gems, `💎 ${o.permata}/${TD.PERMATA_AWAL}`, [920, 420])
      + A.thought(1046, 96, 112, 140, bg4, fourth, cap4, [980, 430]);
    let pita = '';
    if (o.perfect) pita = ribbon('⭐ Hari Sempurna!' + (o.repGain ? '  +1 🛡️' : ''), '#6f9445');
    else if (o.lembur) pita = ribbon(`⏰ Besok LEMBUR: +${TD.LEMBUR} tamu`, '#b8482e');
    const rightInner = panels + pita
      + people.slice(4).join('') + A.elder(o.mood, 885, 570, 0.42) + people.slice(0, 4).join('')
      + `<g filter="url(#rough)"><rect x="606" y="700" width="300" height="104" rx="18" fill="#1d2a30" opacity="0.75"/></g>
         <text x="626" y="734" font-size="22" font-weight="700" fill="#f6d58e">Reputasi Penjaga</text>${A.shields(o.rep, 626, 744, 54)}`
      + A.button(o.last ? 'Pesta Permata ▶' : `Hari ${o.hari + 1} ▶`, 922, 712, 240, '#6f9445', o.last ? 'pesta' : 'hariBerikut', 84);
    const leftCast = A.guard(250, 770, 1.45, { lantern: true })
      + A.elder(o.mood, 420, 690, 0.5)
      + A.bubble(o.say, 300, 330, 270, 'down', 22);
    return spread({
      judul: `Hari ${o.hari} selesai.`,
      kalimat: o.hari >= TD.HARI_TERAKHIR ? ['Gerbang ditutup, lentera', 'dinyalakan. Besok pesta!'] : ['Gerbang ditutup, lentera', 'dinyalakan di seluruh desa.'],
      leftCast, judulKanan: `Laporan Hari ${o.hari}`, rightInner,
    });
  };
  function ribbon(text, color) {
    return `<g filter="url(#rough)"><path d="M660 268 L1110 262 L1116 316 L656 322 Z" fill="${color}"/>
      <path d="M660 268 L630 284 L646 296 L628 312 L658 316 Z M1110 262 L1142 276 L1124 290 L1144 306 L1114 310 Z" fill="${color}" opacity="0.75"/></g>
      <text x="886" y="302" text-anchor="middle" font-size="26" font-weight="700" fill="#fbf2de">${text}</text>`;
  }

  // o: {permata, rep, warga}
  A.partySpread = function (o) {
    const cols = FILL;
    let dancers = '';
    [[60, 760, 1.2], [470, 770, 1.25], [540, 690, 1.0], [30, 660, 0.95], [380, 700, 0.9]].forEach(([x, y, s], i) => {
      const g = cols[i];
      dancers += `<g class="hop" style="animation-delay:${i * 0.17}s">${A.villager(x, y, s, { hat: TD.TOPI[g.topi], beard: TD.JANGGUT[g.janggut], coat: g.baju, happy: true, lantern: i % 2 === 1, flip: i % 2 === 0 })}</g>`;
    });
    const chest = `<g filter="url(#rough)"><rect x="200" y="640" width="160" height="90" rx="10" fill="#8a5634"/><rect x="200" y="672" width="160" height="12" fill="#e8b84a"/>
      <path d="M196 640 Q280 580 364 640 Z" fill="#a8683a"/><rect x="268" y="664" width="24" height="28" rx="4" fill="#e8b84a"/></g>
      <circle cx="280" cy="630" r="110" fill="url(#glow)"/>`
      + [['#5ad0ff', 230, 628], ['#ff7ab8', 262, 612], ['#ffd84a', 296, 616], ['#8ae07a', 326, 630], ['#5ad0ff', 280, 596]].map(([c, x, y]) => A.gem(x, y, 1.3, c)).join('');
    const confetti = Array.from({ length: 26 }, (_, i) => {
      const x = (i * 97) % 580 + 5, y = 170 + (i * 61) % 300, c = ['#ff7ab8', '#ffd84a', '#5ad0ff', '#8ae07a', '#fff8ea'][i % 5];
      return `<rect class="twinkle" style="animation-delay:${(i * 0.23) % 2}s" x="${x}" y="${y}" width="8" height="5" rx="1" fill="${c}" transform="rotate(${i * 37} ${x} ${y})"/>`;
    }).join('');
    const leftCast = confetti + chest + dancers + A.elder('happy', 170, 650, 0.42);
    const medal = `<g filter="url(#rough)"><path d="M862 340 L842 410 L862 400 L874 414 L886 346 Z M908 340 L928 410 L908 400 L896 414 L884 346 Z" fill="#c8553d"/></g>
      <circle cx="885" cy="330" r="70" fill="url(#glow)"/>
      <g filter="url(#rough)"><circle cx="885" cy="320" r="46" fill="#e8b84a"/><circle cx="885" cy="320" r="36" fill="#f2cf6a"/></g>
      ${A.star(885, 322, 1.4, '#c8553d')}`;
    const rightInner = `<text x="885" y="112" text-anchor="middle" font-size="26" fill="#f6d58e">Lencana Penjaga Hebat</text>` + medal
      + A.thought(624, 200, 150, 150, '#3a4a6a', `<circle cx="699" cy="255" r="44" fill="url(#glow)"/>` + [['#5ad0ff', -22, 0], ['#ff7ab8', 0, -14], ['#ffd84a', 22, 0], ['#8ae07a', 0, 16]].map(([c, dx, dy]) => A.gem(699 + dx, 258 + dy, 1.1, c)).join(''), `💎 ${o.permata}/${TD.PERMATA_AWAL} aman`, [760, 470])
      + A.thought(996, 200, 150, 150, '#5f7f55', A.shields(o.rep, 1008, 230, 26).replace(/h36 v24 q0 18 -18 26 q-18 -8 -18 -26/g, 'h22 v14 q0 11 -11 16 q-11 -5 -11 -16').replace(/h18 v50 q-18 -8 -18 -26/g, 'h11 v30 q-11 -5 -11 -16'), `🛡️ ${o.rep} perisai`, [1010, 470])
      + A.villager(760, 660, 1.2, { hat: '#d9a441', coat: '#5f948c', lantern: true, happy: true })
      + A.villager(1010, 660, 1.2, { hat: '#4f7aa8', coat: '#a8432e', beard: '#8a5a3a', lantern: true, happy: true, flip: true })
      + A.guard(885, 690, 1.6) + `<circle cx="${885}" cy="${690 - 75 * 1.6}" r="9" fill="#e8b84a" stroke="#c8553d" stroke-width="3"/>`
      + `<text x="885" y="745" text-anchor="middle" font-size="30" font-weight="700" fill="#fff2d0">Kamu Penjaga Hebat! 💛</text>`
      + A.button('🔁 Main Lagi', 640, 760, 240, '#6f9445', 'baru', 52) + A.button('🏠 Judul', 900, 760, 240, '#8a7a6a', 'judul', 52);
    return spread({
      judul: 'Pesta Permata!',
      kalimat: ['Berkat penjaga yang teliti dan', 'adil, permata desa tetap aman.'],
      leftCast, judulKanan: 'Terima kasih, Penjaga!', rightInner,
    });
  };
})();
