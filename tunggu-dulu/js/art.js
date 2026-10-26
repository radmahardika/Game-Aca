// Tunggu Dulu! — semua gambar (SVG gaya buku cerita: guas + pensil warna, tanpa garis tinta).
(function () {
  const TD = window.TD;
  const A = (TD.art = {});
  const W = 1180, H = 820;
  A.W = W; A.H = H;
  A.WIN = { x: 44, y: 96, w: 740, h: 404 };

  A.DEFS = `<defs>
  <filter id="rough" x="-5%" y="-5%" width="110%" height="110%">
    <feTurbulence type="fractalNoise" baseFrequency="0.04" numOctaves="2" seed="11"/>
    <feDisplacementMap in="SourceGraphic" scale="4"/></filter>
  <filter id="soft"><feGaussianBlur stdDeviation="6"/></filter>
  <filter id="grain"><feTurbulence type="fractalNoise" baseFrequency="0.85" numOctaves="3" seed="3"/>
    <feColorMatrix values="0 0 0 0 0.35  0 0 0 0 0.25  0 0 0 0 0.18  0 0 0 0.55 0"/></filter>
  <filter id="mottle"><feTurbulence type="fractalNoise" baseFrequency="0.012 0.02" numOctaves="3" seed="8"/>
    <feColorMatrix values="0 0 0 0 0.5  0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0.6 -0.12"/></filter>
  <filter id="pencil"><feTurbulence type="fractalNoise" baseFrequency="0.02 0.6" numOctaves="2" seed="5"/>
    <feColorMatrix values="0 0 0 0 0.3  0 0 0 0 0.2  0 0 0 0 0.15  0 0 0 0.7 -0.25"/></filter>
  <linearGradient id="sky" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#a9bccf"/><stop offset="0.45" stop-color="#eec3b0"/><stop offset="1" stop-color="#fbe0b8"/></linearGradient>
  <linearGradient id="skyNight" x1="0" y1="0" x2="0" y2="1">
    <stop offset="0" stop-color="#4f5f86"/><stop offset="0.55" stop-color="#9a86a6"/><stop offset="1" stop-color="#e8b8a0"/></linearGradient>
  <linearGradient id="meadow" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#a9c06a"/><stop offset="1" stop-color="#7d9f4c"/></linearGradient>
  <linearGradient id="wood" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#b0743f"/><stop offset="1" stop-color="#8a5634"/></linearGradient>
  <radialGradient id="glow"><stop offset="0" stop-color="#ffd27a" stop-opacity="0.85"/><stop offset="0.4" stop-color="#ffb066" stop-opacity="0.35"/><stop offset="1" stop-color="#ffb066" stop-opacity="0"/></radialGradient>
  <radialGradient id="beam" cx="0.5" cy="1" r="1"><stop offset="0" stop-color="#fff2b0" stop-opacity="0.55"/><stop offset="1" stop-color="#fff2b0" stop-opacity="0"/></radialGradient>
  <radialGradient id="face" cx="0.62" cy="0.4" r="0.7"><stop offset="0" stop-color="#f7c9a0"/><stop offset="1" stop-color="#e3a07a"/></radialGradient>
  <radialGradient id="faceG" cx="0.62" cy="0.4" r="0.7"><stop offset="0" stop-color="#a6c876"/><stop offset="1" stop-color="#7a9f4c"/></radialGradient>
  <clipPath id="win"><rect x="44" y="96" width="740" height="404"/></clipPath>
</defs>`;
  A.svg = (inner, extra = '') => `<svg xmlns="http://www.w3.org/2000/svg" width="${W}" height="${H}" viewBox="0 0 ${W} ${H}" ${extra}>${inner}</svg>`;

  // Ubah SVG statis menjadi gambar di kanvas (sekali saja, supaya iPad ringan).
  A.raster = function (inner, canvas, scale = 2) {
    canvas.width = W * scale; canvas.height = H * scale;
    const blob = new Blob([A.svg(A.DEFS + inner)], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    return new Promise(res => {
      const img = new Image();
      img.onload = () => { const c = canvas.getContext('2d'); c.clearRect(0, 0, canvas.width, canvas.height); c.drawImage(img, 0, 0, canvas.width, canvas.height); URL.revokeObjectURL(url); res(); };
      img.onerror = () => { URL.revokeObjectURL(url); res(); };
      img.src = url;
    });
  };

  A.texture = () => `<rect width="${W}" height="${H}" filter="url(#mottle)" opacity="0.5"/>
    <rect width="${W}" height="${H}" filter="url(#pencil)" opacity="0.35"/>
    <rect width="${W}" height="${H}" filter="url(#grain)" opacity="0.45"/>`;

  A.lantern = (x, y, s = 1) => `<circle cx="${x}" cy="${y + 14 * s}" r="${40 * s}" fill="url(#glow)"/>
    <g filter="url(#rough)"><rect x="${x - 12 * s}" y="${y}" width="${24 * s}" height="${28 * s}" rx="${8 * s}" fill="#e8643a"/>
    <rect x="${x - 9 * s}" y="${y - 3 * s}" width="${18 * s}" height="${5 * s}" fill="#5a3a2a"/></g>
    <ellipse cx="${x}" cy="${y + 14 * s}" rx="${6 * s}" ry="${9 * s}" fill="#ffd98a"/>`;

  // ---------------- pemandangan di luar jendela ----------------
  A.landscape = () => `<rect x="0" y="0" width="${W}" height="520" fill="url(#sky)"/>
  <g filter="url(#soft)" opacity="0.8"><ellipse cx="200" cy="170" rx="110" ry="20" fill="#fbe6da"/><ellipse cx="560" cy="140" rx="140" ry="22" fill="#f8dccf"/></g>
  <path d="M600 150 q8 -8 16 0 q8 -8 16 0 M650 128 q6 -6 12 0 q6 -6 12 0" fill="none" stroke="#4a3a3a" stroke-width="3" stroke-linecap="round"/>
  <g filter="url(#rough)">
    <path d="M44 300 L130 220 L200 270 L290 190 L380 260 L470 210 L560 270 L650 200 L784 280 L784 360 L44 360 Z" fill="#9fb2ba"/>
    <path d="M44 330 L160 270 L250 310 L360 260 L470 320 L600 270 L700 300 L784 280 L784 380 L44 380 Z" fill="#7f9c96"/>
    <path d="M44 350 q20 -30 40 -6 q16 -26 38 -4 q22 -30 44 0 q20 -24 40 -2 q18 -28 42 0 q22 -26 44 -2 q20 -24 40 0 q22 -30 44 -4 q20 -24 42 0 q18 -26 40 0 q22 -28 44 -2 q20 -22 42 0 q22 -28 44 -4 q20 -24 42 0 q18 -26 40 -2 q18 -24 40 0 q20 -26 40 0 L784 380 L44 380 Z" fill="#5f7f55"/>
    <path d="M44 362 Q300 340 520 356 Q680 346 784 360 L784 500 L44 500 Z" fill="url(#meadow)"/>
    <path d="M404 362 Q396 380 380 400 Q340 450 300 500 L560 500 Q480 450 440 400 Q426 380 420 362 Z" fill="#e2c296"/>
    <path d="M90 400 L96 340 L190 336 L196 402 Z" fill="#8a5a3a"/>
    <path d="M70 348 Q140 270 214 342 Q140 360 70 348 Z" fill="#c99b5a"/>
    <path d="M96 302 l-10 30 M120 292 l-6 34 M146 288 l0 36 M170 294 l6 32 M192 308 l10 26" stroke="#a57a42" stroke-width="3" fill="none"/>
    <rect x="132" y="360" width="22" height="40" fill="#5a3a26"/><rect x="104" y="356" width="18" height="16" fill="#ffcf7a"/>
    <path d="M640 396 L646 344 L700 342 L706 398 Z" fill="#f2e2c4"/>
    <path d="M618 350 Q630 290 672 288 Q722 292 726 348 Q672 362 618 350 Z" fill="#c8553d"/>
    <ellipse cx="652" cy="316" rx="9" ry="7" fill="#f6e6cf"/><ellipse cx="694" cy="310" rx="7" ry="5" fill="#f6e6cf"/>
    <rect x="664" y="366" width="18" height="30" rx="8" fill="#6a4228"/>
    <rect x="236" y="250" width="10" height="130" fill="#6a4a34"/><rect x="600" y="246" width="10" height="134" fill="#6a4a34"/>
    <path d="M240 256 Q420 300 606 252" fill="none" stroke="#5a3a2a" stroke-width="3"/>
  </g>
  ${A.lantern(300, 284)}${A.lantern(420, 298)}${A.lantern(540, 280)}
  <rect x="44" y="300" width="740" height="90" fill="#fbe6cf" opacity="0.25" filter="url(#soft)"/>`;

  // antrean tamu berikutnya di kejauhan (jumlah sesuai sisa tamu)
  A.queue = function (n) {
    const spots = [[372, 392, 0.5, '#7a6a8a', '#4f6fb0'], [398, 380, 0.4, '#8a6a5a', '#d89a3a'], [414, 370, 0.32, '#6a7a6a', '#a85a8a']];
    return `<g filter="url(#rough)" opacity="0.85">${spots.slice(0, Math.min(n, 3)).map(([x, y, s, b, h]) =>
      `<g transform="translate(${x} ${y}) scale(${s})"><ellipse cx="0" cy="20" rx="12" ry="18" fill="${b}"/><circle cx="0" cy="-4" r="9" fill="#e8b48e"/><path d="M-10 -8 L10 -8 L2 -34 Z" fill="${h}"/></g>`).join('')}</g>`;
  };

  // ---------------- pos jaga (bagian statis) ----------------
  A.boothStatic = () => `<g filter="url(#rough)">
    <rect x="784" y="0" width="396" height="530" fill="#7a5038"/>
    <path d="M850 0 L852 530 M930 0 L928 530 M1010 0 L1012 530 M1090 0 L1088 530" stroke="#5f3d2a" stroke-width="4"/>
    <path d="M0 0 L1180 0 L1180 60 Q900 104 590 96 Q280 104 0 70 Z" fill="#c99b5a"/>
    <path d="M40 20 l-6 50 M110 24 l-4 60 M180 26 l-2 64 M250 28 l0 66 M320 28 l2 68 M390 30 l2 66 M460 30 l2 66 M530 30 l2 66 M600 30 l2 66 M670 28 l2 64 M740 26 l2 62 M810 24 l2 60 M880 22 l4 56 M950 20 l4 50 M1020 18 l6 40 M1090 14 l6 34" stroke="#a57a42" stroke-width="4" fill="none"/>
    <rect x="20" y="60" width="28" height="460" fill="#8a5634"/><rect x="780" y="60" width="28" height="460" fill="#8a5634"/>
    <path d="M0 492 L1180 488 L1180 530 L0 534 Z" fill="#b0743f"/><path d="M0 496 L1180 492" stroke="#d89a5e" stroke-width="4"/>
    <rect x="0" y="530" width="1180" height="290" fill="url(#wood)"/>
    <path d="M0 600 Q600 594 1180 602 M0 690 Q600 684 1180 692" stroke="#7a4a2c" stroke-width="3" fill="none" opacity="0.6"/>
  </g>
  ${A.lantern(830, 120, 1.8)}
  <path d="M830 64 L830 114" stroke="#3a2a22" stroke-width="3"/>
  <g filter="url(#rough)" transform="rotate(-2 1010 210)"><rect x="870" y="110" width="290" height="200" rx="4" fill="#f3e3c3"/><circle cx="1015" cy="124" r="6" fill="#c8553d"/></g>
  <g filter="url(#rough)" transform="rotate(1.5 1010 410)"><rect x="872" y="340" width="286" height="150" rx="6" fill="#5a3a2a"/></g>
  <g filter="url(#rough)"><path d="M60 14 L440 10 L444 58 L56 60 Z" fill="#5a3a2a"/></g>`;

  // ---------------- tamu ----------------
  const hatC = g => TD.TOPI[g.topi], beardC = g => TD.JANGGUT[g.janggut];
  const glasses = (y = 298) => `<g fill="none" stroke="#3a2a22" stroke-width="4"><circle cx="384" cy="${y}" r="15"/><circle cx="436" cy="${y}" r="15"/><path d="M399 ${y} h22 M369 ${y - 4} l-22 -8 M451 ${y - 4} l22 -8"/></g>`;
  const coatPath = 'M300 500 Q296 410 350 382 Q410 364 470 382 Q526 410 524 500 Z';
  const hatPath = 'M338 254 Q350 200 392 160 Q420 128 446 112 Q470 104 486 118 Q462 126 452 150 Q466 200 484 254 Q410 266 338 254 Z';
  const beardPath = 'M360 324 Q340 360 362 392 Q382 424 410 422 Q438 424 458 392 Q480 360 460 324 Q440 340 410 340 Q380 340 360 324 Z';

  // mood: idle | happy | sad. Troll yang menyamar memakai gambar ini juga + petunjuknya.
  A.guest = function (g, mood = 'idle') {
    const pointy = g.troll && g.clues.includes('telinga');
    const ears = pointy
      ? `<path d="M352 304 Q320 288 296 262 Q330 268 352 278 Z" fill="#8db35a"/><path d="M468 304 Q500 288 524 262 Q490 268 468 278 Z" fill="#8db35a"/>
         <path d="M340 290 L310 272 M480 290 L510 272" stroke="#6f9445" stroke-width="3"/>`
      : `<circle cx="344" cy="296" r="15" fill="#e8a882"/><circle cx="476" cy="296" r="15" fill="#e8a882"/>`;
    const sad = mood === 'sad', happy = mood === 'happy';
    const eyes = sad
      ? `<path d="M370 286 L392 278 M428 278 L450 286" stroke="#3a2a22" stroke-width="5" stroke-linecap="round"/>
         <path d="M376 300 q8 -6 16 0 M428 300 q8 -6 16 0" stroke="#3a2a22" stroke-width="5" fill="none" stroke-linecap="round"/>
         <path d="M380 308 q-4 14 0 20 q6 -6 0 -20" fill="#8cc6e8"/><path d="M442 308 q-4 14 0 20 q6 -6 0 -20" fill="#8cc6e8"/>`
      : happy
        ? `<path d="M374 300 q10 -12 20 0 M426 300 q10 -12 20 0" stroke="#3a2a22" stroke-width="5" fill="none" stroke-linecap="round"/>`
        : `<path d="M372 282 Q382 276 392 282 M428 282 Q438 276 448 282" stroke="#3a2a22" stroke-width="4" fill="none" stroke-linecap="round"/>
           <ellipse cx="384" cy="298" rx="5" ry="6" fill="#3a2a22"/><ellipse cx="436" cy="298" rx="5" ry="6" fill="#3a2a22"/>`;
    const mouth = sad ? `<path d="M396 350 q14 -8 28 0" stroke="#3a2a22" stroke-width="4" fill="none" stroke-linecap="round"/>`
      : happy ? `<path d="M394 340 q16 16 32 0" stroke="#3a2a22" stroke-width="4" fill="#a8432e" stroke-linecap="round"/>`
        : `<path d="M398 344 q12 6 24 0" stroke="#3a2a22" stroke-width="4" fill="none" stroke-linecap="round"/>`;
    const hands = happy
      ? `<ellipse cx="318" cy="486" rx="28" ry="17" fill="#8a5634"/>
         <path d="M524 470 Q520 420 536 376" stroke="${g.baju}" stroke-width="30" fill="none" stroke-linecap="round"/>
         <ellipse cx="540" cy="356" rx="22" ry="22" fill="#8a5634"/>`
      : `<ellipse cx="318" cy="486" rx="28" ry="17" fill="#8a5634"/><ellipse cx="506" cy="486" rx="28" ry="17" fill="#8a5634"/>`;
    return `<g filter="url(#rough)">
      <path d="${coatPath}" fill="${g.baju}"/>
      <path d="M300 500 Q296 410 350 382 Q380 372 410 370 L410 500 Z" fill="#000" opacity="0.1"/>
      <path d="M410 384 L412 500" stroke="#000" stroke-opacity="0.25" stroke-width="3"/>
      <circle cx="424" cy="424" r="5" fill="#e8b84a"/><circle cx="424" cy="460" r="5" fill="#e8b84a"/>
      ${ears}
      <ellipse cx="410" cy="290" rx="66" ry="62" fill="url(#face)"/>
      <path d="${hatPath}" fill="${hatC(g)}"/>
      <circle cx="488" cy="120" r="9" fill="#f3e3c3"/>
      <path d="M332 250 Q410 270 490 250 L492 266 Q410 286 330 266 Z" fill="#6a4a34"/>
      ${eyes}
      ${g.kacamata ? glasses() : ''}
      <ellipse cx="366" cy="318" rx="11" ry="7" fill="#e88a78" opacity="0.6"/><ellipse cx="454" cy="318" rx="11" ry="7" fill="#e88a78" opacity="0.6"/>
      <ellipse cx="410" cy="316" rx="10" ry="9" fill="#e09276"/>
      <path d="${beardPath}" fill="${beardC(g)}"/>
      <path d="M384 360 q6 12 0 24 M410 364 q6 14 0 28 M436 360 q6 12 0 24" stroke="#000" stroke-opacity="0.15" stroke-width="3" fill="none"/>
      ${mouth}
      ${hands}
    </g>`;
  };

  // troll ketahuan: topi terbang, janggut copot, wajah hijau
  A.trollRevealed = g => `<g filter="url(#rough)">
    <path d="M290 500 Q286 400 346 374 Q410 356 474 374 Q534 400 534 500 Z" fill="${g.baju}"/>
    <path d="M352 282 Q318 250 296 226 Q312 262 330 292 Z" fill="#8db35a"/>
    <path d="M468 282 Q502 250 524 226 Q508 262 490 292 Z" fill="#8db35a"/>
    <ellipse cx="410" cy="294" rx="70" ry="64" fill="url(#faceG)"/>
    <path d="M380 236 l-6 -18 l14 12 M440 236 l6 -18 l-14 12" fill="#7a9f4c"/>
    <path d="M366 274 L394 288 M426 288 L454 274" stroke="#2a3a1a" stroke-width="7" stroke-linecap="round"/>
    <circle cx="384" cy="300" r="10" fill="#fffaf0"/><circle cx="436" cy="300" r="10" fill="#fffaf0"/>
    <circle cx="386" cy="302" r="5" fill="#2a2a1a"/><circle cx="434" cy="302" r="5" fill="#2a2a1a"/>
    <ellipse cx="410" cy="322" rx="11" ry="9" fill="#6f9445"/>
    <path d="M378 342 Q410 364 442 342 Q410 350 378 342 Z" fill="#3a2a1a"/>
    <path d="M384 342 L390 326 L396 344 Z M424 344 L430 326 L436 342 Z" fill="#fffaf0"/>
    <g transform="rotate(-24 360 440)"><path d="M310 410 Q300 440 320 464 Q340 486 366 482 Q392 484 406 462 Q420 440 410 410 Q390 424 360 424 Q330 424 310 410 Z" fill="${beardC(g)}"/>
      <path d="M310 410 L292 380" stroke="#b8a07a" stroke-width="2" stroke-dasharray="5 4"/></g>
    <g transform="translate(70 70) rotate(32 560 170)"><path d="M510 210 Q520 160 556 128 Q580 108 600 104 Q590 140 600 210 Q556 222 510 210 Z" fill="${hatC(g)}"/>
      <path d="M506 206 Q556 222 604 206 L606 220 Q556 236 504 220 Z" fill="#6a4a34"/></g>
    ${g.kacamata ? `<g transform="translate(-170 110) rotate(-30 410 300)">${glasses(300)}</g>` : ''}
    <ellipse cx="300" cy="440" rx="30" ry="22" fill="#8db35a"/><ellipse cx="524" cy="440" rx="30" ry="22" fill="#8db35a"/>
    <path d="M280 424 l-8 -12 M296 418 l-2 -14 M312 420 l4 -12 M512 420 l-4 -12 M528 418 l2 -14 M544 424 l8 -12" stroke="#f3e6cc" stroke-width="5" stroke-linecap="round"/>
  </g>`;

  // troll lolos: lari membawa karung hasil panen
  A.trollEscaping = g => `<g transform="translate(-250 -330) scale(1.6)"><g filter="url(#rough)">
    <path d="M396 470 l-14 26 M424 470 l16 24" stroke="#5f7f3a" stroke-width="12" stroke-linecap="round"/>
    <ellipse cx="410" cy="436" rx="30" ry="40" fill="${g.baju}"/>
    <circle cx="410" cy="388" r="22" fill="#8db35a"/>
    <path d="M390 380 l-16 -14 l6 18 M430 380 l16 -14 l-6 18" fill="#8db35a"/>
    <ellipse cx="452" cy="404" rx="30" ry="34" fill="#d8c08e"/>
    <path d="M434 378 Q420 390 410 400" stroke="#a88a5a" stroke-width="5" fill="none"/></g>
    <circle cx="444" cy="378" r="7" fill="#d84a3a"/><ellipse cx="462" cy="376" rx="9" ry="7" fill="#e0874a"/><path d="M462 369 v-4" stroke="#6f9445" stroke-width="2"/><ellipse cx="452" cy="366" rx="4" ry="8" fill="#f2c14e" transform="rotate(20 452 366)"/>
    <path d="M480 360 l3 -8 l3 8 l8 3 l-8 3 l-3 8 l-3 -8 l-8 -3z" fill="#fff6c0"/>
    <g filter="url(#rough)" opacity="0.7"><ellipse cx="380" cy="488" rx="10" ry="5" fill="#a88a5a"/><ellipse cx="360" cy="496" rx="11" ry="5" fill="#a88a5a"/></g>
    <g filter="url(#rough)" transform="rotate(-20 330 300)"><path d="M300 330 Q310 290 340 270 Q356 262 366 264 Q358 290 366 330 Q332 338 300 330 Z" fill="${hatC(g)}"/></g>
    <g filter="url(#rough)" transform="translate(470 470) rotate(12)"><path d="M0 0 Q-8 20 6 34 Q20 46 36 40 Q50 30 44 6 Q30 14 18 12 Q6 10 0 0 Z" fill="${beardC(g)}"/></g></g>`;

  // bayangan di jalan saat senter menyala; troll dengan petunjuk "bayangan" bertanduk
  A.shadow = function (g) {
    const horns = g.troll && g.clues.includes('bayangan');
    return `<g transform="translate(560 120) skewX(-18) scale(0.95 0.8)" opacity="0.55" filter="url(#rough)" fill="#2a1f40">
      <path d="M-110 380 Q-114 290 -60 262 Q0 244 60 262 Q114 290 110 380 Z"/>
      <ellipse cx="0" cy="170" rx="66" ry="62"/>
      ${horns ? `<path d="M-40 120 L-70 20 L-14 112 Z M40 120 L70 20 L14 112 Z"/><path d="M-60 140 Q0 120 60 140 L50 120 Q0 90 -50 120 Z"/>`
              : `<path d="M-72 134 Q-60 80 -18 40 Q10 10 36 -6 Q60 -14 76 0 Q52 8 42 32 Q56 80 74 134 Q0 146 -72 134 Z"/>`}
    </g>`;
  };

  // ---------------- meja: alat, kartu, tas, stempel ----------------
  A.tools = function (active) {
    const ring = (x, y, on) => on ? `<circle cx="${x}" cy="${y}" r="44" fill="#fff3b0" opacity="0.55"/>` : '';
    return `${ring(92, 464, active === 'kaca')}${ring(177, 462, active === 'senter')}${ring(256, 462, active === 'tetua')}
    <g data-act="kaca"><rect x="50" y="420" width="84" height="110" fill="transparent"/><g filter="url(#rough)">
      <circle cx="90" cy="466" r="22" fill="#3a2a22"/><circle cx="90" cy="466" r="16" fill="#cfe6ea"/>
      <path d="M106 482 L126 500" stroke="#6a4228" stroke-width="10" stroke-linecap="round"/></g>
      <text x="92" y="524" text-anchor="middle" font-size="18" fill="#3a2a22">Periksa</text></g>
    <g data-act="senter"><rect x="138" y="420" width="78" height="110" fill="transparent"/><g filter="url(#rough)">
      <rect x="160" y="440" width="34" height="46" rx="10" fill="#e8b84a"/><rect x="156" y="432" width="42" height="10" fill="#5a3a2a"/></g>
      <ellipse cx="177" cy="464" rx="7" ry="10" fill="${active === 'senter' ? '#fffbe0' : '#fff0b8'}"/>
      <text x="177" y="524" text-anchor="middle" font-size="18" fill="#3a2a22">Senter</text></g>
    <g data-act="tetua"><rect x="218" y="420" width="84" height="110" fill="transparent"/><g filter="url(#rough)">
      <path d="M220 486 Q228 462 252 456 L290 436 L292 488 Z" fill="#d8a84a"/><ellipse cx="290" cy="462" rx="8" ry="26" fill="#8a5634"/></g>
      <text x="256" y="524" text-anchor="middle" font-size="18" fill="#3a2a22">Tetua</text></g>`;
  };

  function photo(f) {
    return `<rect x="70" y="600" width="110" height="140" rx="6" fill="#b9d3dc"/>
      <circle cx="95" cy="684" r="7" fill="#f2c39c"/><circle cx="155" cy="684" r="7" fill="#f2c39c"/>
      <ellipse cx="125" cy="680" rx="30" ry="30" fill="#f2c39c"/>
      <path d="M94 664 Q110 618 130 608 Q144 632 156 664 Z" fill="${TD.TOPI[f.topi]}"/>
      <path d="M100 696 Q96 736 125 740 Q154 736 150 696 Q125 706 100 696 Z" fill="${TD.JANGGUT[f.janggut]}"/>
      <circle cx="114" cy="680" r="3.5" fill="#3a2a22"/><circle cx="136" cy="680" r="3.5" fill="#3a2a22"/>
      ${f.kacamata ? `<g fill="none" stroke="#3a2a22" stroke-width="2.5"><circle cx="114" cy="680" r="8"/><circle cx="136" cy="680" r="8"/><path d="M122 680 h6"/></g>` : ''}`;
  }
  A.stampMark = function (kind) {
    const ok = kind === 'ok', c = ok ? '#4f8a3a' : '#b8382a';
    return `<g transform="rotate(-12 196 600)" opacity="0.85" filter="url(#rough)">
      <rect x="120" y="566" width="152" height="74" rx="10" fill="none" stroke="${c}" stroke-width="6"/>
      <text x="196" y="598" text-anchor="middle" font-size="26" font-weight="700" fill="${c}">${ok ? 'BOLEH' : 'TUNGGU'}</text>
      <text x="196" y="628" text-anchor="middle" font-size="24" font-weight="700" fill="${c}">${ok ? 'MASUK' : 'DULU!'}</text></g>`;
  };
  // lifted = kartu diangkat (diperbesar) untuk diperiksa
  A.card = function (g, o = {}) {
    const lift = o.lifted ? 'translate(50 790) scale(1.42) translate(-50 -790)' : '';
    return `<g data-act="kartu" transform="${lift}">
      <g filter="url(#rough)" transform="rotate(-3 220 680)">
        <rect x="50" y="572" width="340" height="210" rx="8" fill="#f3e3c3"/>
        ${photo(g.foto)}
        ${g.cap ? `<circle cx="330" cy="736" r="30" fill="#e8c46a"/><path d="M330 716 l6 13 l14 1 l-11 9 l4 14 l-13 -8 l-13 8 l4 -14 l-11 -9 l14 -1z" fill="#a8432e"/>`
                : `<circle cx="330" cy="736" r="30" fill="none" stroke="#b8a07a" stroke-width="3" stroke-dasharray="6 6"/>`}
      </g>
      <g transform="rotate(-3 220 680)" fill="#3a2a22">
        <text x="196" y="610" font-size="20" font-weight="700" fill="#a8432e">KARTU WARGA</text>
        <text x="196" y="644" font-size="21">Nama: ${g.nama}</text>
        <text x="196" y="674" font-size="21">Rumah:</text>
        <text x="196" y="700" font-size="21">${g.rumah}</text>
        <text x="196" y="742" font-size="19">Cap:</text>
        ${o.stamp ? A.stampMark(o.stamp) : ''}
      </g>
      <g filter="url(#rough)">
        <path d="M-20 830 Q-10 780 30 770 Q66 766 82 790 L96 830 Z" fill="#5d7d55"/>
        <ellipse cx="60" cy="780" rx="26" ry="22" fill="#e3a07a"/><path d="M66 762 Q78 744 92 752" stroke="#e3a07a" stroke-width="14" stroke-linecap="round" fill="none"/>
      </g>
      ${o.hint ? `<text x="220" y="568" text-anchor="middle" font-size="18" fill="#fbf2de">👆 ketuk untuk periksa</text>` : ''}
    </g>`;
  };

  const ITEM = {
    labu: `<path d="M0 -14 q2 -8 8 -10" stroke="#6f9445" stroke-width="4" fill="none"/><ellipse cx="0" cy="6" rx="26" ry="19" fill="#e0874a"/><path d="M-9 -10 q-6 16 0 32 M9 -10 q6 16 0 32" stroke="#b8642a" stroke-width="3" fill="none"/>`,
    jagung: `<ellipse cx="0" cy="0" rx="11" ry="24" fill="#f2c14e"/><path d="M-6 -16 v32 M0 -20 v40 M6 -16 v32" stroke="#d8a43a" stroke-width="2"/><path d="M-4 24 Q-22 6 -14 -18 Q-6 4 2 22 Z M4 24 Q22 6 14 -18 Q6 4 -2 22 Z" fill="#7a9f4c"/>`,
    roti: `<ellipse cx="0" cy="6" rx="26" ry="15" fill="#d9944a"/><path d="M-14 0 l5 8 M0 -3 l5 8 M14 0 l5 8" stroke="#f3d29a" stroke-width="4"/>`,
    madu: `<path d="M-18 24 Q-22 -6 -12 -12 L12 -12 Q22 -6 18 24 Z" fill="#e8a83a"/><rect x="-16" y="-22" width="32" height="12" rx="3" fill="#c8553d"/><rect x="-10" y="0" width="20" height="12" rx="2" fill="#f3e3c3"/>`,
    apel: `<circle cx="0" cy="6" r="20" fill="#d84a3a"/><path d="M0 -12 q2 -10 8 -12" stroke="#5a3a2a" stroke-width="4" fill="none"/><ellipse cx="9" cy="-14" rx="8" ry="4" fill="#6f9445"/><ellipse cx="-7" cy="0" rx="5" ry="7" fill="#fff" opacity="0.35"/>`,
    jamur: `<rect x="-8" y="2" width="16" height="22" rx="5" fill="#f3e6cc"/><path d="M-24 6 Q-22 -20 0 -22 Q22 -20 24 6 Z" fill="#c8553d"/><circle cx="-9" cy="-8" r="4" fill="#f6e6cf"/><circle cx="8" cy="-12" r="3" fill="#f6e6cf"/>`,
    bunga: `<path d="M0 6 L0 26" stroke="#6f9445" stroke-width="4"/>${[0, 72, 144, 216, 288].map(a => `<ellipse cx="0" cy="-10" rx="7" ry="11" fill="#e88ab0" transform="rotate(${a} 0 2)"/>`).join('')}<circle cx="0" cy="2" r="7" fill="#f2c14e"/>`,
    karung: `<path d="M-22 26 Q-30 -8 -6 -18 L0 -30 L8 -18 Q30 -8 22 26 Z" fill="#d8c08e"/><path d="M-6 -18 l12 -10 M4 -18 l8 -12" stroke="#a88a5a" stroke-width="3"/>`,
    jaring: `<circle cx="0" cy="0" r="22" fill="none" stroke="#8a5634" stroke-width="5"/><path d="M-20 -8 H20 M-20 8 H20 M-8 -20 V20 M8 -20 V20" stroke="#c9b48a" stroke-width="2.5"/><path d="M14 16 L30 30" stroke="#8a5634" stroke-width="6" stroke-linecap="round"/>`,
    palu: `<path d="M-2 -6 L8 28" stroke="#8a5634" stroke-width="7" stroke-linecap="round"/><path d="M-26 -18 Q-14 -28 14 -22 Q20 -10 10 -2 Q-12 2 -24 -6 Z" fill="#8a8a8a"/>`,
  };
  A.ITEM = ITEM;
  A.tray = function (g, open) {
    if (!g.daftar) return '';
    let inner;
    if (!open) {
      inner = `<g data-act="tas"><g filter="url(#rough)">
        <path d="M500 742 Q490 650 530 636 L610 636 Q650 650 640 742 Z" fill="#8a5a3a"/>
        <path d="M530 640 Q570 590 610 640" stroke="#5a3a26" stroke-width="8" fill="none"/>
        <path d="M506 676 Q570 700 634 676 L636 700 Q570 724 504 700 Z" fill="#6a4228"/><circle cx="570" cy="700" r="8" fill="#e8b84a"/></g>
        <text x="654" y="690" font-size="18" fill="#fbf2de">👆 buka</text></g>`;
    } else {
      const items = [];
      for (const [k, v] of Object.entries(g.tas)) for (let i = 0; i < v; i++) items.push(k);
      if (g.alat) items.push(g.alat);
      inner = items.map((k, i) => {
        const col = i % 4, row = Math.floor(i / 4);
        return `<g transform="translate(${474 + col * 61} ${644 + row * 66}) scale(0.95)" filter="url(#rough)">${ITEM[k]}</g>`;
      }).join('');
    }
    return `<g data-act="tas"><g filter="url(#rough)">
      <rect x="430" y="596" width="270" height="160" rx="10" fill="#6a4228"/><rect x="442" y="608" width="246" height="136" rx="8" fill="#9a6438"/></g>
      ${inner}</g>
      <g filter="url(#rough)"><path d="M428 564 L732 560 L734 594 L430 598 Z" fill="#fbf2de"/></g>
      <text x="440" y="587" font-size="19" fill="#3a2a22">Daftar: ${TD.daftarText(g.daftar)}</text>`;
  };

  A.stamps = function (pressed) {
    const handle = (x, down) => `<ellipse cx="${x}" cy="${down ? 670 : 640}" rx="22" ry="20" fill="#6a4228"/>${down ? '' : `<rect x="${x - 12}" y="650" width="24" height="34" fill="#6a4228"/>`}`;
    return `<g data-act="boleh"><rect x="736" y="610" width="180" height="170" fill="transparent"/>
      <g filter="url(#rough)">${handle(826, pressed === 'ok')}<rect x="740" y="680" width="172" height="96" rx="12" fill="#6f9445" ${pressed === 'ok' ? 'stroke="#fff3c0" stroke-width="6"' : ''}/></g>
      <text x="826" y="722" font-size="26" font-weight="700" fill="#fbf2de" text-anchor="middle">BOLEH</text>
      <text x="826" y="754" font-size="26" font-weight="700" fill="#fbf2de" text-anchor="middle">MASUK</text></g>
    <g data-act="tolak"><rect x="924" y="610" width="180" height="170" fill="transparent"/>
      <g filter="url(#rough)">${handle(1010, pressed === 'no')}<rect x="928" y="680" width="172" height="96" rx="12" fill="#c8553d" ${pressed === 'no' ? 'stroke="#fff3c0" stroke-width="6"' : ''}/></g>
      <text x="1014" y="722" font-size="26" font-weight="700" fill="#fbf2de" text-anchor="middle">TUNGGU</text>
      <text x="1014" y="754" font-size="26" font-weight="700" fill="#fbf2de" text-anchor="middle">DULU!</text></g>
    <g filter="url(#rough)" transform="translate(44 40)">
      <path d="M1200 820 Q1190 750 1130 742 Q1090 740 1080 770 L1070 820 Z" fill="#5d7d55"/>
      <ellipse cx="1104" cy="742" rx="28" ry="24" fill="#e3a07a"/>
      <path d="M1084 728 L1070 694 M1098 722 L1092 684 M1114 722 L1118 686 M1128 730 L1142 700" stroke="#e3a07a" stroke-width="13" stroke-linecap="round"/></g>`;
  };

  A.shields = function (n, x, y, gap = 52) {
    let s = '';
    for (let i = 0; i < 5; i++) {
      const sx = x + i * gap, full = n >= i + 1, half = !full && n >= i + 0.5;
      const p = `M${sx} ${y} h36 v24 q0 18 -18 26 q-18 -8 -18 -26 Z`;
      s += `<path d="${p}" fill="#3e2a20"/>`;
      if (full) s += `<path d="${p}" fill="#7fb2c8"/><path d="M${sx + 6} ${y + 5} v16" stroke="#d8f0f8" stroke-width="4" stroke-linecap="round"/>`;
      if (half) s += `<path d="M${sx} ${y} h18 v50 q-18 -8 -18 -26 Z" fill="#7fb2c8"/>`;
    }
    return `<g filter="url(#rough)">${s}</g>`;
  };

  A.boards = function (S) {
    const rules = TD.rulesFor(S.hari);
    return `<g transform="rotate(-2 1010 210)" fill="#3a2a22">
      <text x="892" y="162" font-size="26" font-weight="700" fill="#a8432e">Aturan Hari Ini</text>
      ${rules.map((r, i) => `<text x="892" y="${200 + i * 30}" font-size="20">${i + 1}. ${r.teks}</text>`).join('')}</g>
    <g transform="rotate(1.5 1010 410)"><text x="892" y="378" font-size="24" font-weight="700" fill="#f6d58e">Reputasi Penjaga</text>
      ${A.shields(S.rep, 892, 398)}
      <text x="892" y="476" font-size="19" fill="#f3e3c3">🧺 Panen aman: ${S.panen}</text>
      ${S.repDelta ? `<g filter="url(#rough)"><rect x="1062" y="306" width="96" height="44" rx="20" fill="#b8482e"/></g><text x="1110" y="338" text-anchor="middle" font-size="26" font-weight="700" fill="#fbf2de">${S.repDelta} 🛡️</text>` : ''}</g>
    <text x="80" y="47" font-size="30" font-weight="700" fill="#f6d58e">Tunggu Dulu!</text>
    <text x="290" y="46" font-size="22" fill="#f3e3c3">Hari ${S.hari} · ${Math.min(S.idx + 1, S.tamu.length)}/${S.tamu.length}</text>`;
  };

  // ---------------- UI: gelembung, pita, tombol ----------------
  A.bubble = function (lines, x = 70, y = 170, w = 250, tail = 'right', fs = 23) {
    const lh = Math.round(fs * 1.3), h = lh * lines.length + 34;
    const t = tail === 'right' ? `L${x + w + 40} ${y + h + 30} L${x + w - 50} ${y + h}` : tail === 'down' ? `L${x + w / 2 + 10} ${y + h + 34} L${x + w / 2 - 30} ${y + h}` : '';
    return `<g filter="url(#rough)"><path d="M${x} ${y + 22} Q${x} ${y} ${x + 24} ${y} L${x + w - 22} ${y} Q${x + w} ${y} ${x + w} ${y + 22} L${x + w} ${y + h - 22} Q${x + w} ${y + h} ${x + w - 22} ${y + h} ${t} L${x + 24} ${y + h} Q${x} ${y + h} ${x} ${y + h - 22} Z" fill="#fbf2de"/></g>
    ${lines.map((l, i) => `<text x="${x + 22}" y="${y + fs + 17 + i * lh}" font-size="${fs}" fill="#3a2a22">${l}</text>`).join('')}`;
  };
  A.banner = (title, sub, color) => `<g filter="url(#rough)"><path d="M150 72 L680 66 L690 140 L144 146 Z" fill="${color}"/>
    <path d="M150 72 L110 92 L130 108 L106 128 L146 132 Z M680 66 L722 86 L700 102 L726 122 L688 128 Z" fill="${color}" opacity="0.75"/></g>
    <text x="414" y="104" text-anchor="middle" font-size="30" font-weight="700" fill="#fbf2de">${title}</text>
    <text x="414" y="132" text-anchor="middle" font-size="${sub.length > 52 ? 16 : 20}" fill="#fbf2de">${sub}</text>`;
  A.button = (label, x, y, w, color, act, h = 70) => `<g data-act="${act}"><g filter="url(#rough)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="16" fill="${color}"/></g>
    <text x="${x + w / 2}" y="${y + h / 2 + 10}" text-anchor="middle" font-size="28" font-weight="700" fill="#fbf2de">${label}</text></g>`;
  A.sparkles = pts => pts.map(([x, y, s]) => `<path transform="translate(${x} ${y}) scale(${s})" d="M0 -14 L4 -4 L14 0 L4 4 L0 14 L-4 4 L-14 0 L-4 -4 Z" fill="#fff3b0"/>`).join('');

  // pecah kalimat menjadi baris pendek (± n huruf)
  A.wrap = function (text, n = 22) {
    const out = []; let line = '';
    for (const w of text.split(' ')) {
      if ((line + ' ' + w).trim().length > n && line) { out.push(line); line = w; } else line = (line + ' ' + w).trim();
    }
    if (line) out.push(line);
    return out;
  };

  // ---------------- Tetua & layar malam ----------------
  A.elder = function (mood, x = 0, y = 0, s = 1) {
    const brow = mood === 'stern' ? 'M-34 -18 L-12 -10 M12 -10 L34 -18' : mood === 'sad' ? 'M-34 -10 L-12 -18 M12 -18 L34 -10' : 'M-34 -14 Q-22 -22 -10 -14 M10 -14 Q22 -22 34 -14';
    const eyes = mood === 'happy' ? `<path d="M-32 6 q10 -12 20 0 M12 6 q10 -12 20 0" stroke="#3a2a22" stroke-width="5" fill="none" stroke-linecap="round"/>`
      : `<ellipse cx="-22" cy="4" rx="7" ry="8" fill="#3a2a22"/><ellipse cx="22" cy="4" rx="7" ry="8" fill="#3a2a22"/>`;
    const mouth = mood === 'happy' ? `<path d="M-16 52 q16 16 32 0" stroke="#3a2a22" stroke-width="4" fill="#a8432e"/>`
      : mood === 'sad' ? `<path d="M-14 60 q14 -10 28 0" stroke="#3a2a22" stroke-width="4" fill="none"/>` : `<path d="M-14 56 h28" stroke="#3a2a22" stroke-width="4"/>`;
    return `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#rough)">
      <path d="M-110 380 Q-120 150 -60 90 L60 90 Q120 150 110 380 Z" fill="#6a5a8a"/>
      <path d="M-60 90 L-40 380 M60 90 L40 380" stroke="#544670" stroke-width="5"/>
      <rect x="128" y="-60" width="14" height="440" rx="6" fill="#7a5034"/>
      <circle cx="135" cy="-70" r="56" fill="url(#glow)"/>
      <rect x="117" y="-96" width="36" height="44" rx="12" fill="#e8643a"/><ellipse cx="135" cy="-74" rx="8" ry="12" fill="#ffd98a"/>
      <ellipse cx="120" cy="200" rx="24" ry="20" fill="#eab08a"/>
      <circle cx="-72" cy="4" r="16" fill="#eab08a"/><circle cx="72" cy="4" r="16" fill="#eab08a"/>
      <ellipse cx="0" cy="0" rx="72" ry="68" fill="url(#face)"/>
      <path d="M-80 -30 Q-70 -110 -10 -170 Q20 -210 60 -230 Q80 -232 84 -210 Q58 -200 50 -160 Q70 -90 82 -30 Q0 -14 -80 -30 Z" fill="#7a5aa8"/>
      <path d="M-86 -34 Q0 -12 88 -34 L90 -16 Q0 6 -88 -16 Z" fill="#4a3a6a"/>
      <path d="M-8 -150 l4 -10 l4 10 l10 4 l-10 4 l-4 10 l-4 -10 l-10 -4z" fill="#ffd84a"/>
      <path d="${brow}" stroke="#f3f0e8" stroke-width="8" stroke-linecap="round" fill="none"/>
      ${eyes}
      <ellipse cx="-40" cy="22" rx="11" ry="7" fill="#e88a78" opacity="0.6"/><ellipse cx="40" cy="22" rx="11" ry="7" fill="#e88a78" opacity="0.6"/>
      <ellipse cx="0" cy="20" rx="13" ry="12" fill="#e09276"/>
      <path d="M-60 28 Q-90 140 -40 260 Q0 330 40 260 Q90 140 60 28 Q30 48 0 48 Q-30 48 -60 28 Z" fill="#f6f2ea"/>
      <path d="M-24 90 q8 40 0 80 M0 96 q8 50 0 120 M24 90 q8 40 0 80" stroke="#dcd4c4" stroke-width="4" fill="none"/>
      ${mouth}
    </g>`;
  };
  A.nightBg = (pagi) => `<rect width="${W}" height="${H}" fill="url(#${pagi ? 'sky' : 'skyNight'})"/>
    ${pagi ? '' : `<g fill="#fff6d8">${[[120, 80], [300, 50], [520, 110], [760, 60], [980, 90], [1100, 40], [640, 30], [420, 160]].map(([x, y]) => `<circle cx="${x}" cy="${y}" r="2.5"/>`).join('')}</g>`}
    <g filter="url(#rough)">
      <path d="M0 470 L160 360 L300 440 L480 330 L640 430 L820 340 L1000 430 L1180 360 L1180 600 L0 600 Z" fill="${pagi ? '#9fb2ba' : '#6f7f96'}"/>
      <path d="M0 560 Q300 520 600 548 Q900 520 1180 552 L1180 820 L0 820 Z" fill="${pagi ? '#8fae5a' : '#5f7f55'}"/>
      <path d="M850 560 L856 470 L960 466 L966 562 Z" fill="#8a5a3a"/><path d="M826 476 Q910 390 990 470 Q910 492 826 476 Z" fill="#b08a52"/>
      <rect x="884" y="500" width="22" height="22" fill="#ffcf7a"/>
    </g>
    ${A.lantern(220, 300, 1.2)}${A.lantern(1060, 280, 1.2)}`;
  A.paper = (x, y, w, h) => `<g filter="url(#rough)"><rect x="${x}" y="${y}" width="${w}" height="${h}" rx="8" fill="#f3e3c3"/><circle cx="${x + w / 2}" cy="${y + 18}" r="7" fill="#c8553d"/></g>`;
  A.rows = (list, x, y, w = 560) => list.map(([icon, label, val, col], i) =>
    `<text x="${x}" y="${y + i * 46}" font-size="26" fill="#3a2a22">${icon} ${label}</text><text x="${x + w}" y="${y + i * 46}" text-anchor="end" font-size="26" font-weight="700" fill="${col || '#3a2a22'}">${val}</text>`).join('');

  // kurcaci & troll kecil untuk layar judul / pesta
  A.miniDwarf = (x, y, s, hat, beard, coat) => `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#rough)">
    <ellipse cx="0" cy="40" rx="30" ry="40" fill="${coat}"/><circle cx="-26" cy="-6" r="8" fill="#e8a882"/><circle cx="26" cy="-6" r="8" fill="#e8a882"/>
    <circle cx="0" cy="-8" r="28" fill="#f2c39c"/>
    <path d="M-30 -18 Q-20 -60 6 -80 Q14 -60 30 -18 Z" fill="${hat}"/>
    <path d="M-20 4 Q-22 40 0 44 Q22 40 20 4 Q0 12 -20 4 Z" fill="${beard}"/>
    <circle cx="-9" cy="-8" r="3" fill="#3a2a22"/><circle cx="9" cy="-8" r="3" fill="#3a2a22"/>
    <ellipse cx="-14" cy="2" rx="5" ry="3" fill="#e88a78" opacity="0.6"/><ellipse cx="14" cy="2" rx="5" ry="3" fill="#e88a78" opacity="0.6"/></g>`;
  A.produce = (k, x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})" filter="url(#rough)">${ITEM[k]}</g>`;
  // keranjang anyaman penuh hasil panen
  A.basket = (x, y, s = 1) => `<g transform="translate(${x} ${y}) scale(${s})">
    ${A.produce('labu', -14, -16, 0.8)}${A.produce('jagung', 18, -22, 0.7)}${A.produce('apel', 4, -8, 0.7)}${A.produce('roti', -26, -2, 0.55)}${A.produce('apel', 28, -4, 0.6)}
    <g filter="url(#rough)"><path d="M-42 -4 Q-48 -26 -20 -40" stroke="#8a5634" stroke-width="6" fill="none"/>
    <path d="M-44 -4 L44 -4 L34 34 L-34 34 Z" fill="#b8843a"/>
    <path d="M-42 6 H42 M-39 16 H39 M-36 26 H36" stroke="#8a5a2a" stroke-width="3"/><path d="M-20 -4 L-18 34 M0 -4 V34 M20 -4 L18 34" stroke="#d8a85a" stroke-width="3"/></g></g>`;
})();
