// Tunggu Dulu! — alur game: judul → cerita → pagi → loket (periksa tamu) → laporan malam → ... → pesta permata.
(function () {
  const TD = window.TD, A = TD.art, AU = TD.audio;
  const $ = id => document.getElementById(id);
  const SAVE_KEY = 'tunggu-dulu-v1';

  const S = (TD.S = {
    screen: 'muat', hari: 1, rep: TD.PERISAI_MAKS, permata: TD.PERMATA_AWAL, lembur: false,
    tamu: [], idx: 0, phase: 'inspect', checked: {}, tool: null, lifted: false, bagOpen: false,
    result: null, pressed: null, repDelta: null, bubble: null, hint: null, anim: '', lensPos: [410, 300],
    stats: {}, dayStart: null, lemburBesok: false, ceritaHal: 0,
  });

  // ---------------- simpan ----------------
  function load() { try { return JSON.parse(localStorage.getItem(SAVE_KEY)) || null; } catch (e) { return null; } }
  function save(obj) { try { localStorage.setItem(SAVE_KEY, JSON.stringify(obj)); } catch (e) {} }

  // ---------------- lapisan gambar ----------------
  const sceneEl = $('scene'), deskEl = $('desk'), uiEl = $('ui'), screenEl = $('screen');
  const svgOpen = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${A.W} ${A.H}">`;
  const cur = () => S.tamu[S.idx];

  function sceneMarkup(withAnim) {
    const g = cur(); if (!g) return '';
    let guest;
    if (S.result === 'troll-lolos') guest = A.trollEscaping(g);
    else if (S.result === 'ok-troll') guest = A.trollRevealed(g);
    else guest = A.guest(g, S.result === 'ok-jujur' ? 'happy' : S.result === 'salah-tuduh' ? 'sad' : 'idle');
    const left = S.tamu.length - S.idx - 1;
    const senter = S.tool === 'senter' && !S.result;
    return `<g clip-path="url(#win)">
      ${A.queue(left)}
      ${senter ? `<rect x="44" y="96" width="740" height="404" fill="#2a2040" opacity="0.38"/>${A.shadow(g)}` : ''}
      <g class="guest ${withAnim ? S.anim : ''}">${guest}</g>
      ${senter ? `<path d="M120 500 L300 96 L620 96 L240 500 Z" fill="url(#beam)"/>` : ''}
      ${S.result === 'ok-jujur' || S.result === 'ok-troll' ? A.sparkles([[600, 230, 1.3], [620, 330, 1], [250, 260, 1.1]]) : ''}
    </g>`;
  }
  function renderScene() {
    sceneEl.innerHTML = sceneMarkup(true);
    renderLens(true);
  }
  function renderDesk() {
    const g = cur(); if (!g) return;
    const card = A.card(g, { lifted: S.lifted, stamp: S.pressed, hint: !S.checked.kartu && S.hari === 1 && S.idx === 0 && !S.result });
    deskEl.innerHTML = A.tools(S.hint ? 'tetua' : S.tool) + A.boards(S)
      + (S.lifted ? '' : card) + A.tray(g, S.bagOpen) + (S.showNext ? '' : A.stamps(S.pressed)) + (S.lifted ? card : '');
  }
  function renderUI() {
    let s = '';
    const g = cur();
    if (S.result) {
      const b = S.banner; s += A.banner(b.title, b.sub, b.color);
      if (S.showNext) s += A.button('Lanjut ▶', 760, 640, 330, '#5a3a2a', 'lanjut', 110).replace('font-size="28"', 'font-size="40"');
    }
    if (S.hint) s += A.bubble(S.hint, 60, 444 - (30 * S.hint.length + 34) - 34, 300, 'down');
    else if (S.bubble && g) s += A.bubble(S.bubble, 70, 170, 260, 'right');
    uiEl.innerHTML = s;
  }
  function renderAll() { renderScene(); renderDesk(); renderUI(); }

  // kaca pembesar: salinan pemandangan + tamu, diperbesar
  const lens = $('lens'), lensInner = $('lensInner'), lensScene = $('lensScene'), ZOOM = 2.3, LR = 130;
  function renderLens(rebuild) {
    const on = S.tool === 'kaca' && !S.result;
    lens.hidden = !on; if (!on) return;
    if (rebuild) lensScene.innerHTML = svgOpen + sceneMarkup(false) + '</svg>';
    const [x, y] = S.lensPos;
    lens.style.left = (x - LR) + 'px'; lens.style.top = (y - LR) + 'px';
    lensInner.style.transform = `translate(${LR - x * ZOOM}px, ${LR - y * ZOOM}px) scale(${ZOOM})`;
  }

  // ---------------- layar penuh ----------------
  function showScreen(name, markup) {
    S.screen = name;
    screenEl.innerHTML = svgOpen + markup + '</svg>';
    screenEl.hidden = false;
    lens.hidden = true;
    $('homeBtn').hidden = name === 'judul' || name === 'laporan' || name === 'pesta';
  }
  function hideScreen() { screenEl.hidden = true; screenEl.innerHTML = ''; S.screen = 'main'; $('homeBtn').hidden = false; }

  function titleScreen() {
    const sv = load();
    const lanjut = sv && !sv.selesai && (sv.hari > 1 || sv.mulai);
    AU.music(false);
    showScreen('judul', A.nightBg(true)
      + `<path d="M0 150 Q590 260 1180 150" fill="none" stroke="#5a3a2a" stroke-width="3"/>`
      + A.lantern(180, 170) + A.lantern(400, 206) + A.lantern(780, 206) + A.lantern(1000, 170)
      + A.elder('happy', 190, 470, 0.85)
      + A.miniDwarf(960, 650, 1.3, '#4f7aa8', '#f3e6cc', '#a8432e') + A.miniDwarf(1060, 670, 1.1, '#d9a441', '#8a5a3a', '#5f948c')
      + A.paper(380, 120, 520, 520)
      + `<text x="640" y="236" text-anchor="middle" font-size="70" font-weight="700" fill="#a8432e">Tunggu Dulu!</text>
         <text x="640" y="282" text-anchor="middle" font-size="26" fill="#6e4a34">Penjaga Gerbang Desa Kurcaci</text>
         ${A.gem(560, 330, 1.3, '#5ad0ff')}${A.gem(640, 322, 1.6, '#ff7ab8')}${A.gem(720, 330, 1.3, '#ffd84a')}`
      + (lanjut
        ? A.button(`▶ Lanjut Hari ${sv.hari}`, 470, 390, 340, '#6f9445', 'lanjutHari', 76) + A.button('Mulai dari awal', 520, 488, 240, '#8a7a6a', 'baru', 56)
        : A.button('▶ Mulai', 490, 400, 300, '#6f9445', 'baru', 84))
      + `<text x="880" y="624" text-anchor="end" font-size="18" fill="#8a7a6a">versi ${TD.VERSION}</text>`);
  }

  const CERITA = [
    'Halo, Penjaga muda! Selamat datang di Desa Kurcaci.',
    'Desa kita punya banyak permata. Troll jahat ingin mencurinya!',
    'Troll suka menyamar jadi kurcaci. Tugasmu memeriksa setiap tamu.',
    'Kalau tamunya kurcaci asli, cap BOLEH MASUK. Kalau troll, cap TUNGGU DULU!',
    'Tapi jangan menuduh kurcaci yang jujur, ya. Penjaga yang baik itu teliti dan adil.',
  ];
  function storyScreen() {
    const t = CERITA[S.ceritaHal];
    const lines = A.wrap(t, 26);
    showScreen('cerita', A.nightBg(true) + A.elder('happy', 300, 440, 1)
      + A.bubble(lines, 520, 220, 580, 'none', 34)
      + `<text x="800" y="170" text-anchor="middle" font-size="22" fill="#fbf2de">${S.ceritaHal + 1} / ${CERITA.length}</text>`
      + A.button(S.ceritaHal < CERITA.length - 1 ? 'Lanjut ▶' : 'Siap! ▶', 720, 640, 260, '#6f9445', 'cerita'));
  }

  function morningScreen() {
    const rules = TD.rulesFor(S.hari);
    const baru = S.hari <= 4 ? TD.RULES[S.hari - 1] : null;
    const info = baru ? A.wrap(baru.baru, 40) : ['Hari terakhir! Troll makin pintar', 'menyamar. Periksa semuanya!'];
    let y = 250, s = '';
    rules.forEach((r, i) => {
      s += `<text x="520" y="${y}" font-size="25" fill="#3a2a22">${i + 1}. ${r.teks}</text>`;
      if (r === baru) s += `<g filter="url(#rough)"><rect x="1000" y="${y - 26}" width="80" height="34" rx="14" fill="#c8553d"/></g><text x="1040" y="${y - 2}" text-anchor="middle" font-size="20" font-weight="700" fill="#fbf2de">BARU</text>`;
      y += 40;
    });
    y += 10;
    s += info.map((l, i) => `<text x="520" y="${y + i * 32}" font-size="22" fill="#6e4a34">${l}</text>`).join('');
    y += info.length * 32 + 10;
    if (S.lembur) s += `<g filter="url(#rough)"><rect x="510" y="${y}" width="580" height="54" rx="10" fill="#e8c4a8"/></g>
      <text x="530" y="${y + 36}" font-size="24" font-weight="700" fill="#a8432e">⏰ Lembur: +${TD.LEMBUR} tamu hari ini</text>`;
    showScreen('pagi', A.nightBg(true) + A.elder('happy', 250, 430, 0.95)
      + A.bubble(['Selamat pagi,', 'Penjaga!'], 40, 60, 230, 'right')
      + A.paper(470, 60, 660, 700)
      + `<text x="800" y="150" text-anchor="middle" font-size="46" font-weight="700" fill="#a8432e">Hari ${S.hari}</text>
         <text x="520" y="206" font-size="24" font-weight="700" fill="#3a2a22">Aturan hari ini:</text>` + s
      + A.button('Buka Gerbang ▶', 630, 660, 340, '#6f9445', 'buka'));
    AU.sfx('day');
  }

  function reportScreen() {
    const st = S.stats, perfect = !st.lolos && !st.salah;
    const say = perfect ? ['Kerja hebat, Penjaga!', 'Desa kita aman. 💛']
      : st.lolos ? ['Troll sempat masuk.', 'Besok jaga lebih teliti, ya!'] : ['Ingat, jangan menuduh', 'kurcaci yang jujur, ya.'];
    showScreen('laporan', A.reportSpread({ hari: S.hari, st, permata: S.permata, rep: S.rep, repGain: S.repGain, perfect,
      lembur: st.lolos && S.hari < TD.HARI_TERAKHIR, mood: perfect ? 'happy' : 'stern', say, diterima: S.diterima,
      last: S.hari >= TD.HARI_TERAKHIR }));
    AU.music(false);
    AU.sfx(perfect ? 'good' : 'sad');
  }

  function outScreen() {
    showScreen('habis', A.nightBg(false) + A.elder('sad', 250, 420, 0.95)
      + A.paper(470, 120, 660, 560)
      + `<text x="800" y="200" text-anchor="middle" font-size="40" font-weight="700" fill="#a8432e">Perisai Habis…</text>`
      + A.shields(0, 680, 240, 56)
      + `<text x="800" y="360" text-anchor="middle" font-size="26" fill="#3a2a22">Hari ini terlalu banyak kesalahan.</text>
         <text x="800" y="400" text-anchor="middle" font-size="26" fill="#3a2a22">Tidak apa-apa, ayo coba lagi</text>
         <text x="800" y="440" text-anchor="middle" font-size="26" fill="#3a2a22">dengan lebih teliti!</text>
         <text x="800" y="500" text-anchor="middle" font-size="21" fill="#7a6a5a">💡 Pakai kaca pembesar &amp; senter, lalu tanya Tetua</text>`
      + A.button(`🔁 Ulangi Hari ${S.hari}`, 630, 560, 340, '#c8803a', 'ulangi')
      + A.bubble(['Penjaga yang hebat', 'tidak menyerah.', 'Ayo coba lagi!'], 40, 60, 260, 'right'));
    AU.music(false);
    AU.sfx('sad');
  }

  function partyScreen() {
    showScreen('pesta', A.partySpread({ permata: S.permata, rep: S.rep }));
    AU.sfx('party');
  }

  // ---------------- alur hari ----------------
  function newGame() {
    Object.assign(S, { hari: 1, rep: TD.PERISAI_MAKS, permata: TD.PERMATA_AWAL, lembur: false });
    save({ hari: 1, rep: S.rep, permata: S.permata, lembur: false, mulai: true });
    S.ceritaHal = 0; storyScreen();
  }
  function resume() {
    const sv = load();
    Object.assign(S, { hari: sv.hari, rep: sv.rep, permata: sv.permata, lembur: !!sv.lembur });
    morningScreen();
  }
  function startDay() {
    S.tamu = TD.makeDay(S.hari, S.lembur);
    S.idx = 0;
    S.stats = { masuk: 0, ketahuan: 0, lolos: 0, salah: 0 };
    S.diterima = [];
    S.dayStart = { rep: S.rep, permata: S.permata };
    S.lemburBesok = false; S.repGain = 0;
    hideScreen();
    AU.music(true);
    newGuest();
  }
  function newGuest() {
    const g = cur();
    Object.assign(S, { phase: 'inspect', checked: {}, tool: null, lifted: false, bagOpen: false, result: null, pressed: null,
      repDelta: null, hint: null, showNext: false, anim: 'arrive', lensPos: [410, 300] });
    S.bubble = A.wrap(g.sapa, 20);
    renderAll();
  }
  function endDay() {
    const st = S.stats;
    S.repGain = !st.lolos && !st.salah && S.rep < TD.PERISAI_MAKS ? 1 : 0;
    S.rep += S.repGain;
    const last = S.hari >= TD.HARI_TERAKHIR;
    save(last ? { selesai: true, hari: S.hari, rep: S.rep, permata: S.permata }
      : { hari: S.hari + 1, rep: S.rep, permata: S.permata, lembur: S.lemburBesok, mulai: true });
    reportScreen();
  }

  const BANNER_HIJAU = '#5f8f45', BANNER_MERAH = '#b8482e', BANNER_ORANYE = '#c8803a';
  function decide(accept) {
    const g = cur();
    if (S.phase !== 'inspect') return;
    if (!S.checked.kartu) {
      S.hint = ['Tunggu dulu!', 'Periksa kartunya', 'dulu, ya. 👆'];
      AU.sfx('hint'); renderDesk(); renderUI(); return;
    }
    S.phase = 'result'; S.pressed = accept ? 'ok' : 'no'; S.tool = null; S.lifted = false; S.hint = null; S.anim = '';
    AU.sfx('stamp');
    const clues = g.clues.map(c => TD.clueText(c, g)).join(' · ');
    if (accept && !g.troll) {
      S.result = 'ok-jujur'; S.stats.masuk++; S.diterima.push(g);
      S.banner = { title: `Benar! ${g.nama} kurcaci asli`, sub: TD.buktiJujur(S.hari), color: BANNER_HIJAU };
      S.bubble = ['Terima kasih,', 'Penjaga! 😊'];
      setTimeout(() => AU.sfx('good'), 250);
    } else if (!accept && g.troll) {
      S.result = 'ok-troll'; S.stats.ketahuan++;
      S.banner = { title: 'Hebat! Troll ketahuan! 💎 aman', sub: clues, color: BANNER_HIJAU };
      S.bubble = ['Grrr! Ketahuan!', 'Awas ya!'];
      setTimeout(() => AU.sfx('troll'), 200); setTimeout(() => AU.sfx('caught'), 700);
    } else if (accept && g.troll) {
      S.result = 'troll-lolos'; S.stats.lolos++;
      S.rep = Math.max(0, S.rep - 1); S.permata = Math.max(0, S.permata - 1); S.lemburBesok = true; S.repDelta = '−1';
      S.banner = { title: 'Oh tidak! Itu troll! 💎 −1', sub: 'Terlewat: ' + clues, color: BANNER_MERAH };
      S.bubble = ['Hehehe...', 'permatanya', 'kubawa!'];
      setTimeout(() => AU.sfx('bad'), 250);
    } else {
      S.result = 'salah-tuduh'; S.stats.salah++;
      S.rep = Math.max(0, S.rep - 0.5); S.repDelta = '−½';
      S.banner = { title: `Ups! ${g.nama} kurcaci asli`, sub: TD.buktiJujur(S.hari), color: BANNER_ORANYE };
      S.bubble = ['Tapi... aku warga', 'asli desa ini...'];
      setTimeout(() => AU.sfx('sad'), 250);
    }
    renderAll();
    setTimeout(() => { if (S.phase === 'result') { S.showNext = true; renderDesk(); renderUI(); } }, 900);
  }
  function next() {
    if (S.rep <= 0) { outScreen(); return; }
    S.phase = 'leaving';
    S.anim = { 'ok-jujur': 'leave-right', 'ok-troll': 'leave-left', 'salah-tuduh': 'leave-back', 'troll-lolos': 'fade' }[S.result];
    S.bubble = null; S.showNext = false;
    renderScene(); renderUI();
    setTimeout(() => {
      S.idx++;
      if (S.idx >= S.tamu.length) endDay(); else newGuest();
    }, 650);
  }

  function tetuaHint() {
    const rules = TD.rulesFor(S.hari).map(r => r.id), c = S.checked, mark = b => (b ? '✓ ' : '○ ');
    const lines = ['Sudah diperiksa?', mark(c.kartu) + 'Kartu & foto'];
    if (rules.includes('bawaan')) lines.push(mark(c.tas) + 'Isi tas');
    if (rules.includes('fisik')) { lines.push(mark(c.kaca) + 'Telinga (kaca)'); lines.push(mark(c.senter) + 'Bayangan (senter)'); }
    S.hint = lines;
  }

  // ---------------- input ----------------
  function act(name) {
    if (S.screen !== 'main') {
      AU.sfx('tap');
      if (name === 'baru') newGame();
      else if (name === 'lanjutHari') resume();
      else if (name === 'cerita') { if (++S.ceritaHal < CERITA.length) storyScreen(); else morningScreen(); }
      else if (name === 'buka') startDay();
      else if (name === 'hariBerikut') { S.hari++; S.lembur = S.lemburBesok; morningScreen(); }
      else if (name === 'ulangi') { S.rep = Math.max(S.dayStart.rep, 3); S.permata = S.dayStart.permata; morningScreen(); }
      else if (name === 'pesta') partyScreen();
      else if (name === 'judul') titleScreen();
      return;
    }
    if (name === 'lanjut') { if (S.showNext) { AU.sfx('tap'); next(); } return; }
    if (S.phase !== 'inspect') return;
    const hadHint = !!S.hint; S.hint = null;
    if (name === 'kartu') { S.lifted = !S.lifted; S.checked.kartu = true; AU.sfx('card'); }
    else if (name === 'tas') { if (!S.bagOpen) AU.sfx('bag'); S.bagOpen = true; S.checked.tas = true; }
    else if (name === 'kaca') { S.tool = S.tool === 'kaca' ? null : 'kaca'; if (S.tool) { S.checked.kaca = true; S.lensPos = [410, 290]; AU.sfx('lens'); } }
    else if (name === 'senter') { S.tool = S.tool === 'senter' ? null : 'senter'; if (S.tool) { S.checked.senter = true; AU.sfx('light'); } }
    else if (name === 'tetua') { if (!hadHint) { tetuaHint(); AU.sfx('hint'); } }
    else if (name === 'boleh') return decide(true);
    else if (name === 'tolak') return decide(false);
    S.anim = '';
    if (name === 'kaca' || name === 'senter') renderScene();
    renderDesk(); renderUI();
  }

  const stage = $('stage');
  let scale = 1, dragging = false;
  function toStage(e) { const r = stage.getBoundingClientRect(); return [(e.clientX - r.left) / scale, (e.clientY - r.top) / scale]; }
  function inWin([x, y]) { const w = A.WIN; return x >= w.x && x <= w.x + w.w && y >= w.y && y <= w.y + w.h; }
  function moveLens(p) {
    const w = A.WIN;
    S.lensPos = [Math.max(w.x + 20, Math.min(w.x + w.w - 20, p[0])), Math.max(w.y + 20, Math.min(w.y + w.h - 20, p[1]))];
    renderLens(false);
  }
  stage.addEventListener('pointerdown', e => {
    AU.unlock();
    const p = toStage(e);
    const t = e.target.closest('[data-act]');
    if (S.screen === 'main' && S.tool === 'kaca' && S.phase === 'inspect' && inWin(p) && !(t && t.closest('#ui'))) {
      dragging = true; moveLens(p); e.preventDefault(); return;
    }
    if (t) { e.preventDefault(); act(t.getAttribute('data-act')); }
  });
  stage.addEventListener('pointermove', e => { if (dragging) moveLens(toStage(e)); });
  window.addEventListener('pointerup', () => { dragging = false; });
  window.addEventListener('pointercancel', () => { dragging = false; });

  $('soundBtn').addEventListener('pointerdown', e => {
    e.stopPropagation(); AU.unlock();
    const on = AU.toggle(); e.currentTarget.textContent = on ? '🔊' : '🔈';
    if (on && S.screen === 'main') AU.music(true);
  });
  $('homeBtn').addEventListener('pointerdown', e => { e.stopPropagation(); AU.sfx('tap'); titleScreen(); });
  $('soundBtn').textContent = AU.on ? '🔊' : '🔈';

  function fit() {
    scale = Math.min(window.innerWidth / A.W, window.innerHeight / A.H);
    stage.style.transform = `translate(-50%,-50%) scale(${scale})`;
  }
  window.addEventListener('resize', fit); fit();

  // ---------------- mulai: lukis lapisan statis sekali ----------------
  async function boot() {
    $('defs').innerHTML = A.DEFS;
    await Promise.all([
      A.raster(A.landscape(), $('bg')),
      A.raster(A.boothStatic(), $('fg')),
      A.raster(A.texture(), $('tex'), 1),
    ]);
    const lb = $('lensBg'); lb.width = $('bg').width; lb.height = $('bg').height;
    lb.getContext('2d').drawImage($('bg'), 0, 0);
    $('loading').hidden = true;
    titleScreen();
  }
  boot();

  TD.debug = { S, act, decide, next, startDay, newGame, titleScreen, morningScreen, reportScreen, outScreen, partyScreen, endDay,
    day(n, opt = {}) { Object.assign(S, { hari: n, rep: opt.rep ?? S.rep, lembur: !!opt.lembur }); startDay(); },
    guest(over) { Object.assign(cur(), over); newGuest(); } };
})();
