// Angkasa Mart — alur satu hari: Kabar → Survei → Pesan ke Bumi → Toko → Tutup toko.
(function () {
  'use strict';
  const AM = window.AM, A = AM.art, AU = AM.audio;
  const $ = (s) => document.querySelector(s);
  const KEY = 'angkasa-mart-v1';
  const cv = $('#cv'), cx = cv.getContext('2d'); cx.imageSmoothingEnabled = false;
  const ui = $('#ui'), hintEl = $('#hint'), topEl = $('#top'), modalEl = $('#modal');
  const GY = A.GY;
  const rand = () => Math.random();
  const pick = (a) => a[Math.floor(rand() * a.length)];
  const IT = AM.ITEMS;
  const STAR = '★';

  let S = null; // simpanan
  const V = { screen: 'title', planet: 'tundra', bubble: null, cart: [], c: null, fx: [], fly: null, busy: false };

  // ---------- simpan ----------
  function fresh() {
    return { v: 1, day: 1, kas: AM.MODAL_AWAL, tabung: 0, berbagi: 0, total: 0, stage: 0, gudang: [], stiker: [], trends: [], today: null, up: { gudang: 0, kotak: 0 }, ditabung: 0, dibagi: 0, hias: [], pegawai: false, asuransi: false, rusak: false, lastBencana: 0, cabang: [], cabangSaved: {}, sedekah: 0 };
  }
  function save() { try { localStorage.setItem(KEY, JSON.stringify(S)); } catch (e) {} }
  function load() { try { const s = JSON.parse(localStorage.getItem(KEY)); if (s && s.v === 1) return Object.assign(fresh(), s, { up: Object.assign({ gudang: 0, kotak: 0 }, s.up), cabangSaved: s.cabangSaved || {}, cabang: s.cabang || [] }); } catch (e) {} return null; }
  const stage = () => AM.STAGES[S.stage];
  const capGudang = () => stage().gudang + S.up.gudang - (S.rusak ? 2 : 0);
  const capKotak = () => stage().kotak + S.up.kotak;
  const gcols = (n) => `grid-template-columns:repeat(${n <= 6 ? 3 : n <= 8 ? 4 : n <= 10 ? 5 : 7},1fr)`;
  const dayaTarik = () => AM.HIASAN.filter((h) => S.hias.includes(h.id)).reduce((a, h) => a + h.dt, 0);
  const bonusPembeli = () => Math.min(AM.DAYA.maks, Math.floor(dayaTarik() / AM.DAYA.per));
  const premiumOn = () => S.stage >= AM.PREMIUM_DARI;
  const maxHarga = (k) => IT[k].premium ? AM.HARGA_MAKS_PREMIUM : AM.HARGA_MAKS;
  const trendItems = () => S.trends.map((t) => AM.TRENDS[t.i]);

  // ---------- hari baru ----------
  function genCustomer(pl) {
    pl = pl || pick(stage().planet);
    const tr = trendItems().find((t) => t.planet === pl);
    const own = Object.keys(IT).filter((k) => IT[k].planet === pl && !IT[k].premium);
    const prem = premiumOn() ? Object.keys(IT).find((k) => IT[k].planet === pl && IT[k].premium) : null;
    let item, hearts; const r = rand();
    if (prem && !(tr && tr.item === prem) && rand() < 0.08) { item = prem; hearts = 3; }
    else if (tr && r < 0.6) { item = tr.item; hearts = 3; }
    else if (r < 0.88) { const o = own.filter((k) => !tr || k !== tr.item); item = pick(o.length ? o : own); hearts = tr && item === tr.item ? 3 : 2; }
    else { item = 'sikat'; hearts = 1; }
    return { planet: pl, item, hearts, max: Math.min(maxHarga(item), IT[item].beli + (IT[item].premium ? 6 : AM.LEBIH[hearts])), varian: Math.floor(rand() * 3) };
  }
  function startDay() {
    if (S.day > 1) S.trends = S.trends.map((t) => ({ i: t.i, sisa: t.sisa - 1, baru: false })).filter((t) => t.sisa > 0);
    else S.trends = [{ i: 0, sisa: 2, baru: true }];
    const planets = stage().planet;
    while (S.trends.length < stage().tren) {
      const used = trendItems().map((t) => t.planet);
      const cand = AM.TRENDS.map((t, i) => i).filter((i) => planets.includes(AM.TRENDS[i].planet) && !used.includes(AM.TRENDS[i].planet) && (!AM.TRENDS[i].premium || premiumOn()));
      if (!cand.length) break;
      S.trends.push({ i: pick(cand), sisa: 2 + (rand() < 0.5 ? 1 : 0), baru: true });
    }
    const cust = [];
    const nP = Math.max(3, stage().pembeli + bonusPembeli() - (S.rusak ? 2 : 0));
    for (let i = 0; i < nP; i++) cust.push(genCustomer());
    // alien yang butuh bantuan: mulai hari ke-2, kira-kira tiap 3 hari
    if (S.day >= 2 && S.day % 3 === 2) cust.splice(1 + Math.floor(rand() * (cust.length - 1)), 0, { needy: true, planet: pick(planets), varian: Math.floor(rand() * 3) });
    // Alien Usil: mulai tahap Toko, kadang ada peringatan di Kabar Angkasa
    const warn = S.stage >= 1 && S.day >= 3 && !(S.today && S.today.warn) && rand() < 0.3;
    // bencana: mulai tahap Toko, jarang, selalu diramalkan di Kabar pagi harinya
    const bencana = !warn && S.stage >= 1 && !S.rusak && S.day - (S.lastBencana || 0) >= 6 && rand() < 0.15 ? pick(AM.BENCANA).id : null;
    let bonus = 0;
    if (S.kas < 3 && S.gudang.length === 0) { bonus = 6 - S.kas; S.kas = 6; }
    S.today = { phase: 'kabar', warn, bencana, sedekah: S.day % AM.SEDEKAH_TIAP === 0, cust, ci: 0, energy: AM.ENERGI, asked: {}, aliens: {}, tally: {}, sold: [], missing: {}, mahal: 0, spent: 0, bonus };
    save();
  }

  // ---------- kanvas ----------
  let T = 0;
  function frame(ms) {
    T = ms / 1000;
    draw(T);
    requestAnimationFrame(frame);
  }
  function station(t, opt) {
    const b = A.build();
    cx.drawImage(b.stationBack, 0, 0);
    A.decor(cx, 'back', S ? S.hias : [], t);
    A.decor2(cx, S ? S.hias : [], t);
    A.glow(cx, 250, 118, 60, '255,200,110', 0.4 + Math.sin(t * 7) * 0.04 + Math.sin(t * 13) * 0.03);
    A.glow(cx, 365, 119, 40, '255,190,100', 0.25);
    if (opt.queue) drawQueue(t);
    if (opt.customer && V.c) drawCustomer(t);
    A.angkasa(cx, 296, 122, t, false);
    if (S && S.pegawai) A.draw(cx, A.S.KIKI, 340, 126 + Math.round(Math.abs(Math.sin(t * 2)) * 1), 2);
    cx.drawImage(b.stationFront, 0, 0);
    const n = V.night;
    if (S && S.rusak && !(n && n.fixed)) A.damage(cx, t);
    else if (n && n.kind === 'bencana' && n.ins && t - n.t0 < 3) A.damage(cx, t);
    A.decor(cx, 'front', S ? S.hias : [], t);
    if (opt.night) nightScene(t);
    if (opt.customer && V.c && V.c.showItem) { const [w, h] = A.size(A.ITEM[V.c.item], 2); A.draw(cx, A.ITEM[V.c.item], 286 - w / 2, 160 - h, 2); }
    if (opt.rotni) A.rotni(cx, 214, 40, t, 2);
  }
  function drawQueue(t) {
    const td = S.today; if (!td) return;
    const rest = td.cust.slice(td.ci + 1, td.ci + 3);
    [58, 14].forEach((a, i) => {
      const c = rest[i]; if (!c) return;
      const sp = c.planet, top = A.alien(cx, sp, c.varian, a, GY, t + i, {});
      cx.fillStyle = 'rgba(70,50,100,.28)'; cx.fillRect(a - 4, top[2] - 4, top[0] + 8, top[1] + 6);
    });
  }
  function custX(t) {
    const c = V.c, k = Math.min(1, (t - c.t0) / (c.mode === 'pergi' ? 1.2 : 1.1));
    const e = k * k * (3 - 2 * k);
    if (c.mode === 'datang') return 58 + (180 - 58) * e;
    if (c.mode === 'pergi') return 180 - 240 * e;
    return 180;
  }
  function drawCustomer(t) {
    const c = V.c, a = custX(t);
    const moving = c.mode === 'datang' || c.mode === 'pergi';
    const res = A.alien(cx, c.planet, c.varian, a, GY, t, { walk: moving, shiver: c.needy && !c.helped, scarf: c.needy && c.planet === 'tundra' && c.helped });
    if (c.mode === 'datang' && t - c.t0 > 1.1) arrive();
    if (c.mode === 'pergi' && t - c.t0 > 1.2) nextCustomer();
    c.headY = res[2]; c.w = res[0];
  }
  function drawFx(t) {
    V.fx = V.fx.filter((f) => t - f.t0 < f.dur);
    for (const f of V.fx) {
      const k = (t - f.t0) / f.dur;
      if (f.kind === 'heart') A.draw(cx, A.S.HEART, f.x + Math.sin(k * 8) * 3, f.y - k * 30, 1);
      if (f.kind === 'coin') {
        const X = f.x + (f.tx - f.x) * k, Y = f.y + (f.ty - f.y) * k - Math.sin(k * Math.PI) * 30;
        if (k > 0) A.draw(cx, A.S.STAR, X, Y, 1);
      }
    }
  }
  const ALIEN_X = [150, 200, 250];
  function planetScene(t) {
    const b = A.build(), p = V.planet;
    cx.drawImage(b[p], 0, 0);
    A.weather(cx, p, t);
    A.draw(cx, A.S.ROKET, 22, GY - 34, 2);
    A.angkasa(cx, 74, GY - 62, t, true);
    const al = (S.today.aliens[p] || []);
    al.forEach((c, i) => {
      const asked = (S.today.asked[p] || [])[i];
      const r = A.alien(cx, p, c.varian, ALIEN_X[i], GY, t + i * 0.7, { walk: asked && V.bubble && V.bubble.i === i && t - V.bubble.t0 < 0.6 });
      c._top = r[2]; c._w = r[0];
    });
  }
  function earthScene(t) {
    const b = A.build(), gy = 182;
    cx.drawImage(b.earth, 0, 0);
    A.angkasa(cx, 80, gy - 62, t, true);
    cx.fillStyle = '#1a1420'; cx.fillRect(118, gy - 40, 12, 15); cx.fillStyle = '#fff8e0'; cx.fillRect(119, gy - 39, 10, 13);
    cx.fillStyle = '#8a7a6a'; for (let k = 0; k < 4; k++) cx.fillRect(121, gy - 36 + k * 3, 6, 1);
    const f = V.fly;
    if (f) {
      const go = f.phase === 'go', k = Math.min(1, (t - f.t0) / 1.7);
      const p = go ? k : 1 - k;
      cx.fillStyle = 'rgba(255,216,138,.8)';
      for (let i = 0; i < 34; i += 2) { const q = i / 34; cx.fillRect(184 + q * 120, 108 - q * 50 - Math.sin(q * 3.14) * 16, 2, 2); }
      if (f.phase !== 'wait') {
        const X = 166 + (300 - 166) * p, Y = gy - 74 - (gy - 74 - 50) * p - Math.sin(p * 3.14) * 16;
        cx.globalAlpha = p > 0.85 ? Math.max(0, (1 - p) / 0.15) : 1;
        A.rotni(cx, X, Y, t, p > 0.45 ? 1 : 2, !go);
        cx.globalAlpha = 1;
      }
      if (f.phase === 'go' && k >= 1) { f.phase = 'wait'; f.t0 = t; }
      else if (f.phase === 'wait' && t - f.t0 > 0.7) { f.phase = 'back'; f.t0 = t; AU.sfx('land'); }
      else if (f.phase === 'back' && k >= 1) { V.fly = null; landed(); }
    } else {
      A.rotni(cx, 166, gy - 74, t, 2, V.cart.length > 0);
    }
  }
  function draw(t) {
    cx.clearRect(0, 0, A.W, A.H);
    const s = V.screen;
    if (s === 'title') station(t, { rotni: true });
    else if (s === 'kabar') { station(t, {}); dim(0.45); }
    else if (s === 'survei') planetScene(t);
    else if (s === 'pesan') earthScene(t);
    else if (s === 'toko') station(t, { customer: true, queue: true });
    else if (s === 'tutup') { station(t, {}); dim(0.6); }
    else if (s === 'malam') station(t, { night: true });
    else if (s === 'sedekah') A.sedekahScene(cx, V.sdkScene.to, t - V.sdkScene.t0);
    drawFx(t);
  }
  // malam: Alien Usil datang; dijaga Kurcaci atau mencuri barang
  function nightScene(t) {
    const n = V.night; if (!n) return;
    const k = t - n.t0;
    dim(0.5);
    if (n.kind === 'bencana') {
      if (k < 3) for (let i = 0; i < 5; i++) {
        const q = ((k * 0.9 + i * 0.23) % 1), a = 80 + i * 70 - q * 60, b = q * 120;
        for (let j = 0; j < 20; j++) { cx.fillStyle = j < 3 ? '#fff6d0' : `rgba(255,${160 - j * 4},80,${1 - j / 20})`; cx.fillRect(a + j * 2, b - j * 1.4, 2, 2); }
        A.glow(cx, a, b, 10, '255,180,90', 0.5);
      }
      if (k > 1.2 && k < 1.6) { cx.fillStyle = 'rgba(255,230,180,.5)'; cx.fillRect(0, 0, A.W, A.H); }
      if ((n.ins && k > 3) || n.fixed) A.tukang(cx, t);
      return;
    }
    const S2 = A.S;
    let ux;
    if (k < 1.6) ux = -40 + (200 + 40) * (k / 1.6);
    else if (n.guard) ux = k < 2.4 ? 200 : 200 - (k - 2.4) * 160;
    else ux = k < 2.6 ? 200 : 200 - (k - 2.6) * 110;
    const bob = Math.round(Math.abs(Math.sin(k * 10)) * 2);
    A.draw(cx, S2.USIL, ux, GY - 34 - bob, 2);
    if (!n.guard && k > 2.2) A.draw(cx, S2.KARUNG, ux + 28, GY - 18 - bob, 2);
    if (n.guard) {
      const gx = k < 1.4 ? 420 : Math.max(232, 420 - (k - 1.4) * 220);
      [0, 34].forEach((o) => A.draw(cx, S2.KURCACI, gx + o, GY - 40 - Math.round(Math.abs(Math.sin(k * 9 + o)) * 2), 2));
      if (k > 1.6) { cx.fillStyle = 'rgba(255,240,170,.3)'; cx.beginPath(); cx.moveTo(gx + 6, GY - 22); cx.lineTo(gx - 60, GY - 36); cx.lineTo(gx - 60, GY - 6); cx.fill(); }
    }
    if (k > 2.4 && ux < 190) { cx.fillStyle = '#fff'; [[10, 0], [6, 8], [12, 16]].forEach(([a, b]) => cx.fillRect(ux + 34 + a, GY - 30 + b, 6, 1)); }
  }
  function dim(a) { cx.fillStyle = `rgba(14,10,30,${a})`; cx.fillRect(0, 0, A.W, A.H); }

  // ---------- tampilan DOM ----------
  const P = (x, y, w, h) => `left:${x}px;top:${y}px;width:${w}px;height:${h}px`;
  const ic = (k, z, cls) => A.icon(k, z, cls);
  const star = (z) => A.img(A.S.STAR, z || 1, 'st');
  const hearts = (n) => A.img(A.S.HEART, 1, 'ht').repeat(n);
  const LABEL_HATI = ['', 'biasa saja', 'butuh', 'sangat butuh'];

  function hint(text) {
    if (!text) { hintEl.hidden = true; return; }
    hintEl.hidden = false;
    hintEl.innerHTML = `${A.img(A.S.ROTNI_KEPALA, 1)}<div class="pp say">${text}</div>`;
  }
  function renderTop() {
    if (V.screen === 'title') { topEl.hidden = true; return; }
    topEl.hidden = false;
    const name = { kabar: 'Pagi', survei: 'Survei', pesan: 'Pesan ke Bumi', toko: 'Toko buka', tutup: 'Tutup toko', malam: 'Malam', sedekah: 'Berbagi' }[V.screen];
    let q = '';
    if (V.screen === 'toko') q = '<span class="queue">' + S.today.cust.map((c, i) => `<i class="${i < S.today.ci ? 'done' : i === S.today.ci ? 'now' : ''}"></i>`).join('') + '</span>';
    topEl.innerHTML = `<b class="brand">ANGKASA MART</b><span class="ph">Hari ${S.day} · ${name}</span>${q}<span class="kas">Kas ${S.kas} ${STAR}</span>` +
      `<button class="tb" data-a="music" type="button">${AU.on ? '🎵' : '🔇'}</button><button class="tb" data-a="menu" type="button">☰</button>`;
  }
  function render() {
    renderTop();
    const s = V.screen;
    ui.innerHTML = s === 'title' ? uiTitle() : s === 'kabar' ? uiKabar() : s === 'survei' ? uiSurvei() : s === 'pesan' ? uiPesan() : s === 'toko' ? uiToko() : s === 'malam' ? uiMalam() : s === 'sedekah' ? uiSedekah() : uiTutup();
  }

  // ----- judul -----
  function uiTitle() {
    const ada = S && (S.day > 1 || (S.today && S.today.phase !== 'kabar'));
    return `<div class="pp titlecard" style="${P(48, 120, 560, 560)}">
      <h1>ANGKASA<br>MART</h1>
      <p class="sub">Toko kecil Angkasa di luar angkasa</p>
      <button class="pb red big" data-a="play" type="button">▶ ${ada ? 'Lanjut Hari ' + S.day : 'Main'}</button>
      ${ada ? '<button class="pb grey" data-a="reset" type="button">Mulai dari awal</button>' : ''}
      <button class="pb purple" data-a="book" type="button">📒 Buku Kebaikan (${S ? S.stiker.length : 0})</button>
      <p class="ver">versi ${AM.VERSION}</p>
    </div>`;
  }

  // ----- kabar pagi -----
  function uiKabar() {
    const td = S.today;
    const lines = S.trends.map((t) => { const tr = AM.TRENDS[t.i], pl = AM.PLANETS[tr.planet]; return `<li class="${pl.kelas}"><span class="pi">${pl.ikon}</span>${t.baru ? '' : '<small>Masih: </small>'}${tr.kabar}</li>`; }).join('');
    return `<div class="pp kabar" style="left:228px;top:110px;width:720px;min-height:440px;max-height:700px">
      <h2>📰 KABAR ANGKASA</h2>
      <p class="day">Hari ${S.day} · ${stage().nama} Angkasa</p>
      <ul>${lines || '<li>Hari ini semua planet tenang.</li>'}${td.warn ? '<li class="warn"><span class="pi">⚠️</span>Alien Usil terlihat di dekat stasiun! Hati-hati malam ini.</li>' : ''}${td.bencana ? `<li class="warn"><span class="pi">${AM.BENCANA.find((b) => b.id === td.bencana).ikon}</span>Ramalan: ${AM.BENCANA.find((b) => b.id === td.bencana).nama.toLowerCase()} nanti malam!</li>` : ''}${S.rusak ? '<li class="warn"><span class="pi">🔨</span>Atap toko masih bocor: pembeli −2, gudang −2. Renovasi di Kelola Toko.</li>' : ''}</ul>
      ${td.bonus ? `<p class="note">Kas hampir habis… Rotni menemukan ${td.bonus} ${STAR} di sakunya!</p>` : ''}
      ${td.sedekah && !td.sedekahDone ? `<button class="pb green big" data-a="sdkOpen" type="button">🤲 Hari ke-${S.day}: Waktunya berbagi ➜</button>` : '<button class="pb red big" data-a="toSurvei" type="button">Mulai survei ➜</button>'}
    </div>`;
  }

  // ----- survei -----
  function ensureAliens(p) {
    const td = S.today;
    if (td.aliens[p]) return;
    const real = td.cust.filter((c) => !c.needy && c.planet === p).slice(0, 3).map((c) => ({ item: c.item, hearts: c.hearts, varian: c.varian }));
    while (real.length < 3) { const c = genCustomer(p); real.push({ item: c.item, hearts: c.hearts, varian: c.varian }); }
    td.aliens[p] = real.sort(() => rand() - 0.5);
    td.asked[p] = [false, false, false];
  }
  function uiSurvei() {
    const td = S.today, p = V.planet, al = td.aliens[p];
    const pips = Array.from({ length: AM.ENERGI }, (_, i) => `<i class="${i < td.energy ? 'on' : ''}"></i>`).join('');
    const rows = Object.keys(td.tally).sort((a, b) => td.tally[b].n - td.tally[a].n).map((k) => {
      const t = td.tally[k]; let marks = '';
      for (let g = 0; g < t.n; g += 5) marks += `<span class="grp">${'<i></i>'.repeat(Math.min(4, t.n - g))}${t.n - g >= 5 ? '<b></b>' : ''}</span>`;
      return `<div class="trow"><span class="tic">${ic(k, 2)}</span><span class="marks">${marks}</span>${t.love ? hearts(1) : ''}</div>`;
    }).join('');
    const zones = al.map((c, i) => {
      const asked = td.asked[p][i];
      const [w, h] = A.size(A.S[p], 2);
      const tag = asked ? `<span class="pp tag">${ic(c.item, 1)}</span>` : '<span class="ask">?</span>';
      return `<button class="zone" data-a="ask" data-v="${i}" type="button" style="${P(ALIEN_X[i] * 3 - 6, (GY - h) * 3 - 60, w * 3 + 12, h * 3 + 60)}">${tag}</button>`;
    }).join('');
    let bub = '';
    if (V.bubble && V.bubble.p === p) {
      const c = al[V.bubble.i], it = IT[c.item];
      const left = Math.min(840 - 330, Math.max(12, ALIEN_X[V.bubble.i] * 3 - 120));
      bub = `<div class="pp bubble" style="left:${left}px;top:150px;width:330px"><p>${it.butuh}</p><p class="need">Aku butuh: ${ic(c.item, 2)}</p><p>${hearts(c.hearts)} <span class="hl h${c.hearts}">${LABEL_HATI[c.hearts]}</span></p></div>`;
    }
    const planets = AM.PLANET_URUT.map((k) => {
      const pl = AM.PLANETS[k], open = stage().planet.includes(k);
      return `<button class="pb ${pl.kelas} ${V.planet === k ? 'sel' : ''}" data-a="fly" data-v="${k}" type="button" ${open ? '' : 'disabled'}>${open ? pl.ikon : '🔒'} ${pl.nama}</button>`;
    }).join('');
    return `${zones}${bub}
      <div class="pp energy" style="${P(12, 150, 252, 78)}"><span>Energi tanya</span><div class="pips">${pips}</div></div>
      <div class="pp notes" style="${P(858, 102, 306, 450)}"><h3>Catatan Survei</h3>${rows || '<p class="empty">Ketuk alien untuk bertanya.</p>'}</div>
      <div class="pd planets" style="${P(12, 618, 810, 186)}"><span>Terbang ke:</span><div class="row3">${planets}</div></div>
      <button class="pb red tall" style="${P(846, 618, 318, 186)}" data-a="toPesan" type="button">Selesai<br>survei ➜</button>`;
  }

  // ----- pesan ke Bumi -----
  function tallyRows() { const td = S.today; return Object.keys(td.tally).sort((a, b) => td.tally[b].n - td.tally[a].n || td.tally[b].love - td.tally[a].love); }
  function miniNotes() {
    const td = S.today, rows = tallyRows().slice(0, 4).map((k) => `<div class="r">${ic(k, 1)}<span class="bars">${'|'.repeat(td.tally[k].n)}</span>${td.tally[k].love ? hearts(1) : ''}</div>`).join('');
    return `<div class="pp mini" style="left:864px;top:236px;width:300px"><h4>📋 Catatan Survei</h4>${rows || '<p class="empty">Belum ada catatan.</p>'}</div>`;
  }
  const cartTotal = () => V.cart.reduce((s, k) => s + IT[k].beli, 0);
  function uiPesan() {
    const st = stage(), sisa = V.fly ? S.kas : S.kas - cartTotal();
    const open = (k) => (!IT[k].planet || st.planet.includes(IT[k].planet)) && (!IT[k].premium || premiumOn());
    const cards = Object.keys(IT).map((k) => {
      const ok = open(k);
      return `<button class="card c6 ${ok ? '' : 'lock'} ${IT[k].premium ? 'prem' : ''}" data-a="add" data-v="${k}" type="button" ${ok ? '' : 'disabled'}>
        <span class="ci">${ok ? ic(k, 1) : '🔒'}</span><span class="cp">${star(1)}<b>${IT[k].beli}</b></span><span class="cn">${IT[k].nama}</span></button>`;
    }).join('');
    const kotak = Array.from({ length: capKotak() }, (_, i) => V.cart[i] ? `<button class="slot full" data-a="rm" data-v="${i}" type="button">${ic(V.cart[i], 2)}</button>` : '<span class="slot"></span>').join('');
    const gud = Array.from({ length: Math.max(capGudang(), S.gudang.length) }, (_, i) => S.gudang[i] ? `<button class="gs full" data-a="obral" data-v="${i}" type="button">${ic(S.gudang[i], 1)}</button>` : '<span class="gs"></span>').join('');
    const free = capGudang() - S.gudang.length;
    const say = V.fly ? 'Hati-hati di jalan, Rotni!' : V.cart.length ? `Rotni, tolong belikan ${V.cart.length} barang ini ya!` : 'Rotni, tolong belikan barang di daftar ya!';
    return `<div class="pp bubble" style="left:180px;top:168px;width:470px"><p>${say}</p></div>
      <div class="pp cat" style="${P(12, 558, 576, 246)}"><h3>🌍 Katalog Toko Bumi <small>(ketuk untuk memesan)</small></h3><div class="cards six">${cards}</div></div>
      <div class="pd kotak" style="${P(600, 558, 564, 132)}"><span class="lbl">📦 Kotak Rotni<br><small>${V.cart.length}/${capKotak()} · ${cartTotal()} ${STAR}</small></span><div class="slots">${kotak}</div></div>
      <div class="pd gudang" style="${P(600, 698, 354, 106)}"><span class="lbl">🏬 Gudang<br><small>sisa ${free - V.cart.length}</small></span><div class="gslots" style="${gcols(capGudang())}">${gud}</div></div>
      <button class="pb red tall" style="${P(966, 698, 198, 106)}" data-a="kirim" type="button" ${V.fly ? 'disabled' : ''}>Kirim 🚀<br><small>ke Bumi</small></button>
      ${miniNotes()}
      <div class="pp sisa" style="${P(864, 102, 300, 124)}"><span>Sisa kas: <b>${sisa}</b> ${STAR}</span><button class="pb teal tbg" data-a="kelola" type="button" ${V.fly ? 'disabled' : ''}>🏪 Kelola Toko <small>🫙${S.tabung}</small></button></div>`;
  }

  // ----- toko -----
  function curCust() { return S.today.cust[S.today.ci]; }
  function uiToko() {
    const c = V.c, st = stage();
    const gud = Array.from({ length: Math.max(capGudang(), S.gudang.length) }, (_, i) => S.gudang[i] ? `<span class="gs full">${ic(S.gudang[i], 1)}</span>` : '<span class="gs"></span>').join('');
    let mid = '', right = '', bub = '';
    if (c && (c.mode === 'minta' || c.mode === 'tawar' || c.mode === 'kembalian' || c.mode === 'senang' || c.mode === 'sedih')) {
      const it = IT[c.item];
      let txt = '';
      if (c.mode === 'senang') txt = `<p>${c.reply || 'Terima kasih! 😊'}</p>`;
      else if (c.mode === 'sedih') txt = `<p>${c.reply}</p>`;
      else if (c.needy) txt = `<p>${it.tolong}</p><p>Tapi bintangku <b class="red">cuma 1…</b> ${ic(c.item, 2)}</p>`;
      else if (c.mode === 'tawar') txt = `<p>Hmm, mahal… Kalau <b>${c.max} ${STAR}</b> boleh?</p>`;
      else if (c.mode === 'kembalian') txt = c.wrong ? `<p>Eh, kembaliannya <b class="red">${c.wrong}!</b> 😠</p><p>Aku bayar 10 ${STAR}, harganya ${c.price} ${STAR}.</p>` : `<p>Ini <b>10 ${STAR}</b>. Kembaliannya berapa?</p>`;
      else txt = `<p>${it.butuh}</p><p class="need">Ada ${it.nama.toLowerCase()}? ${ic(c.item, 2)}</p><p>${hearts(c.hearts)}</p>`;
      bub = `<div class="pp bubble" style="left:420px;bottom:${816 - 330}px;width:380px">${txt}</div>`;
    }
    if (c && c.mode === 'minta' && c.needy) {
      const cost = needCost(c), ok = S.berbagi >= cost;
      mid = `<div class="jar sm"><b>${S.berbagi}</b><i style="height:${Math.min(100, S.berbagi * 10)}%"></i></div>
        <div class="calc"><p>Toples Berbagi: <b>${S.berbagi} ${STAR}</b></p><p>Modal ${IT[c.item].nama.toLowerCase()}: ${IT[c.item].beli} ${STAR}</p><p>Alien bayar: 1 ${STAR}</p><p class="red">Dari toples: ${cost} ${STAR}</p></div>`;
      right = `<button class="pb green" data-a="beri" type="button" ${ok ? '' : 'disabled'}>🎁 Beri ${IT[c.item].nama.toLowerCase()}</button><button class="pb grey" data-a="maaf" type="button">Maaf ya</button>`;
    } else if (c && c.mode === 'minta' && !S.gudang.includes(c.item)) {
      mid = `<p class="big">Gudang kita tidak punya<br><b>${IT[c.item].nama.toLowerCase()}</b> ${ic(c.item, 2)}</p>`;
      right = `<button class="pb grey tall1" data-a="tidakada" type="button">Maaf, belum ada 😔</button>`;
    } else if (c && c.mode === 'minta') {
      mid = `<p class="q">Berapa harga ${IT[c.item].nama.toLowerCase()}nya?</p>
        <div class="price"><button class="pb blue sq" data-a="minus" type="button">–</button><span>${star(3)}<b>${c.price}</b></span><button class="pb blue sq" data-a="plus" type="button">+</button></div>
        <p class="small">Harga beli di Bumi: ${IT[c.item].beli} ${STAR}</p>`;
      right = `<button class="pb red tall1" data-a="tawarkan" type="button">Tawarkan ➜</button>`;
    } else if (c && c.mode === 'tawar') {
      mid = `<p class="big">Pembeli menawar<br><b>${c.max} ${STAR}</b></p><p class="small">Harga beli di Bumi: ${IT[c.item].beli} ${STAR}</p>`;
      right = `<button class="pb green" data-a="boleh" type="button">Boleh 👍</button><button class="pb grey" data-a="tolak" type="button">Tidak</button>`;
    } else if (c && c.mode === 'kembalian') {
      if (c.wrong) {
        let coins = ''; for (let i = 0; i < 10; i++) coins += `<span class="c ${i < c.price ? 'x' : ''}">${star(2)}</span>`;
        mid = `<p class="q">Coret harga ${c.price} ${STAR} dari 10 ${STAR}</p><div class="coins">${coins}</div><p class="small">Sisa bintang = kembaliannya</p>`;
      } else mid = `<p class="big">Harga ${c.price} ${STAR}<br>dibayar 10 ${STAR}</p><p class="small">Kembaliannya = 10 − ${c.price}</p>`;
      right = '<div class="opts">' + c.opts.map((o) => `<button class="pb blue" data-a="kembali" data-v="${o}" type="button">${o} ${STAR}</button>`).join('') + '</div>';
    } else {
      mid = '<p class="wait">…</p>';
    }
    const emptyBtn = S.gudang.length === 0 && S.today.ci < S.today.cust.length ? `<button class="pb grey" style="${P(900, 102, 264, 60)}" data-a="tutupAwal" type="button">Tutup toko 🌙</button>` : '';
    return `${bub}${emptyBtn}
      <div class="pd gudang tk" style="${P(12, 618, 324, 186)}"><span class="lbl">Gudang</span><div class="gslots" style="${gcols(capGudang())}">${gud}</div></div>
      <div class="pp mid" style="${P(354, 618, 474, 186)}">${mid}</div>
      <div class="right" style="${P(843, 618, 321, 186)}">${right}</div>`;
  }

  // ----- tutup toko -----
  // menjual lewat Kiki, setoran cabang, dan biaya harian dihitung sekali saat toko tutup
  function settle() {
    const td = S.today; if (td.settled) return; td.settled = true;
    td.kiki = [];
    if (S.pegawai) for (let i = 0; i < AM.PEGAWAI.layani && S.gudang.length; i++) {
      const tr = trendItems().map((x) => x.item); let idx = S.gudang.findIndex((k) => tr.includes(k)); if (idx < 0) idx = 0;
      const k = S.gudang.splice(idx, 1)[0], price = IT[k].beli + (IT[k].premium ? 4 : 2);
      td.kiki.push({ item: k, price, beli: IT[k].beli }); S.kas += price;
    }
    td.setoran = S.cabang.length * AM.SETORAN; S.kas += td.setoran;
    td.biayaList = [['🏠 Sewa tempat', AM.SEWA[S.stage]]];
    if (S.pegawai) td.biayaList.push([`💼 Gaji ${AM.PEGAWAI.nama}`, AM.PEGAWAI.gaji]);
    if (S.asuransi) td.biayaList.push(['🛡️ Asuransi', AM.ASURANSI]);
    S.kas = Math.max(0, S.kas - td.biayaList.reduce((a, x) => a + x[1], 0));
    save();
  }
  function dayResult() {
    const td = S.today, sum = (l, f) => (l || []).reduce((a, x) => a + f(x), 0);
    const hasil = sum(td.sold, (x) => x.price), kikiH = sum(td.kiki, (x) => x.price), setoran = td.setoran || 0;
    const modal = sum(td.sold, (x) => x.beli) + sum(td.kiki, (x) => x.beli);
    const biaya = sum(td.biayaList, (x) => x[1]) + (td.biaya || 0);
    return { hasil, kikiH, setoran, modal, biaya, untung: hasil + kikiH + setoran - modal - biaya };
  }
  function notes() {
    const td = S.today, out = [];
    Object.keys(td.missing).sort((a, b) => td.missing[b] - td.missing[a]).slice(0, 2).forEach((k) => out.push([k, `${td.missing[k]} alien cari ${IT[k].nama.toLowerCase()},`, 'kita belum punya!', 'red']));
    const wanted = new Set(td.cust.filter((c) => !c.needy).map((c) => c.item));
    const left = [...new Set(S.gudang)].filter((k) => !wanted.has(k));
    if (left.length && out.length < 3) out.push([left[0], `${IT[left[0]].nama} tidak ada`, 'yang mencari hari ini.', '']);
    const soldOut = [...new Set(td.sold.filter((s) => !s.needy).map((s) => s.item))].filter((k) => !S.gudang.includes(k) && td.cust.filter((c) => !c.needy && c.item === k).length > td.sold.filter((s) => s.item === k).length);
    if (soldOut.length && out.length < 3) out.push([soldOut[0], `${IT[soldOut[0]].nama} habis!`, 'Masih ada yang mau.', '']);
    if (td.mahal && out.length < 3) out.push([null, `${td.mahal} alien bilang`, 'harganya kemahalan.', '']);
    return out;
  }
  function uiTutup() {
    const r = dayResult(), td = S.today, b = td.bagi;
    const stars = (n) => `<div class="stars">${star(1).repeat(Math.min(n, 40))}</div>`;
    const nt = notes().map(([k, a, bb, cls]) => `<div class="nrow"><span class="nic">${k ? ic(k, 2) : '🏷️'}</span><p>${a}<br><span class="${cls}">${bb}</span></p></div>`).join('') || '<p class="empty">Semua lancar hari ini!</p>';
    const untungTxt = r.untung > 0 ? r.untung : r.untung === 0 ? '0' : '−' + (-r.untung);
    let jars;
    if (r.untung > 0) {
      const m = r.untung - b.tabung - b.berbagi;
      const jar = (key, nama, cls, val, total, ctrl) => `<div class="jarcol"><div class="jar ${cls}"><b>${val}</b><i style="height:${Math.min(100, 12 + val * 8)}%"></i></div><span class="jn">${nama}</span><span class="jt">isi: ${total}</span>${ctrl ? `<div class="jb"><button class="pb blue sq2" data-a="jar-" data-v="${key}" type="button">–</button><button class="pb blue sq2" data-a="jar+" data-v="${key}" type="button">+</button></div>` : '<div class="jb"><small>sisanya</small></div>'}</div>`;
      jars = `<h3>Bagi untung ${r.untung} ${STAR} ke toples</h3><div class="jars">${jar('tabung', 'Tabung', 'teal', b.tabung, S.tabung + b.tabung, true)}${jar('modal', 'Modal besok', 'orange', m, S.kas - b.tabung - b.berbagi, false)}${jar('berbagi', 'Berbagi', 'pink', b.berbagi, S.berbagi + b.berbagi, true)}</div>`;
    } else {
      jars = `<h3>Toples</h3><p class="empty">${r.untung === 0 ? 'Hari ini belum ada untung untuk dibagi.' : 'Hari ini rugi sedikit. Tidak apa-apa, besok coba lagi!'}</p><div class="jars small3"><div class="jarcol"><span class="jn">Tabung</span><span class="jt">isi: ${S.tabung}</span></div><div class="jarcol"><span class="jn">Kas</span><span class="jt">isi: ${S.kas}</span></div><div class="jarcol"><span class="jn">Berbagi</span><span class="jt">isi: ${S.berbagi}</span></div></div>`;
    }
    const nxt = AM.STAGES[S.stage + 1], tot = S.total + Math.max(0, r.untung);
    const prog = nxt ? `<div class="bar"><i style="width:${Math.min(100, tot / nxt.butuh * 100)}%"></i><span>${tot} / ${nxt.butuh} → ${nxt.nama}</span></div>` : '<p class="small">Angkasa Mart sudah jadi Stasiun! 🎉</p>';
    const steps = AM.STAGES.map((s, i) => `<span class="stp ${i <= S.stage ? 'on' : ''}"><i>${i <= S.stage ? '✓' : '?'}</i>${s.nama}</span>`).join('');
    return `<div class="pp kas" style="${P(12, 100, 744, 320)}"><h3>Buku Kas hari ini</h3>
        <div class="kasx"><p>💰 Hasil jualan: <b>+${r.hasil} ${STAR}</b></p>
          ${td.kiki && td.kiki.length ? `<p>🧑‍🚀 ${AM.PEGAWAI.nama} melayani ${td.kiki.length} pembeli: <b>+${r.kikiH} ${STAR}</b></p>` : ''}
          ${r.setoran ? `<p>🏢 Setoran ${S.cabang.length} cabang: <b>+${r.setoran} ${STAR}</b></p>` : ''}
          <p class="red">📦 Modal barang terjual: −${r.modal} ${STAR}</p>
          ${(td.biayaList || []).map(([n, v]) => `<p class="red">${n}: −${v} ${STAR}</p>`).join('')}
          ${td.biaya ? `<p class="red">🛡️ Kurcaci Penjaga: −${td.biaya} ${STAR}</p>` : ''}</div>
        <div class="untung ${r.untung < 0 ? 'neg' : ''}"><span>UNTUNG</span><b>${untungTxt}</b></div></div>
      <div class="pp catatan" style="${P(774, 100, 390, 320)}"><h3>Catatan pembeli</h3>${nt}</div>
      <div class="pd toples" style="${P(12, 432, 744, 372)}">${jars}</div>
      <div class="pp grow" style="${P(774, 432, 390, 270)}"><h3>Angkasa Mart tumbuh!</h3><div class="steps">${steps}</div>${prog}<button class="pb teal kel" data-a="kelola" type="button">🏪 Kelola Toko</button></div>
      <button class="pb red" style="${P(774, 714, 390, 90)}" data-a="tidur" type="button">Tidur 🌙 Hari ${S.day + 1} ➜</button>`;
  }

  // ---------- aksi ----------
  function go(screen) {
    V.screen = screen;
    if (S && S.today && screen !== 'title') { S.today.phase = screen; save(); }
    V.bubble = null;
    if (screen === 'kabar') hint(S.day === 1 ? 'Halo! Aku Rotni. Tiap pagi kita baca Kabar Angkasa dulu.' : 'Selamat pagi! Ada kabar apa hari ini?');
    if (screen === 'survei') { ensureAliens(V.planet); hint(S.today.energy ? `Ketuk alien untuk bertanya. Energi tanya cuma ${AM.ENERGI}!` : 'Energi habis. Lanjut pesan ke Bumi!'); }
    if (screen === 'pesan') { V.cart = []; hint(S.gudang.length ? 'Barang lama masih di gudang. Ketuk kalau mau dikembalikan.' : 'Pilih barang yang paling banyak dicari, ya!'); }
    if (screen === 'toko') { hint(''); startCustomer(); }
    if (screen === 'tutup') {
      settle();
      if (!S.today.bagi) S.today.bagi = { tabung: 0, berbagi: 0 };
      hint(dayResult().untung > 0 && S.berbagi === 0 ? 'Mau sisihkan sedikit untuk toples Berbagi?' : 'Toko tutup. Ayo hitung untung hari ini!');
      if (S.today.warn && S.today.guard === undefined && !S.today.closed) { if (S.gudang.length) setTimeout(guardOffer, 0); else S.today.guard = false; }
    }
    if (screen === 'title') hint('');
    render();
  }
  function modal(html) { modalEl.innerHTML = `<div class="pp mcard">${html}</div>`; modalEl.hidden = false; }
  function closeModal() { modalEl.hidden = true; modalEl.innerHTML = ''; }

  // toko: alur pembeli
  function needCost(c) { return Math.max(0, IT[c.item].beli - 1); }
  function startCustomer() {
    const td = S.today;
    if (td.ci >= td.cust.length) { go('tutup'); return; }
    const c = Object.assign({}, td.cust[td.ci]);
    if (c.needy) {
      const has = S.gudang.filter((k) => IT[k].planet === c.planet);
      const pool = has.length ? has : S.gudang;
      if (!pool.length) { td.ci++; save(); startCustomer(); return; }
      c.item = pick(pool); c.hearts = 3;
    }
    c.mode = 'datang'; c.t0 = T; c.price = IT[c.item].beli; c.showItem = false;
    V.c = c; render();
  }
  function arrive() {
    const c = V.c; c.mode = 'minta';
    c.showItem = !c.needy && S.gudang.includes(c.item);
    if (c.needy) { hint('Ada yang butuh bantuan…'); if (S.berbagi < needCost(c)) hint('Toples Berbagi belum cukup. Besok kita sisihkan sedikit, yuk!'); }
    else if (!S.gudang.includes(c.item)) hint('Wah, kita tidak punya barang itu. Nanti kita catat.');
    else hint(c.hearts === 3 ? `${IT[c.item].nama} sedang dicari!` : 'Pasang harga, lalu tekan Tawarkan.');
    render();
  }
  function leave(happy, reply, delay) {
    const c = V.c; c.mode = happy ? 'senang' : 'sedih'; c.reply = reply; render();
    setTimeout(() => { if (V.c !== c) return; c.mode = 'pergi'; c.t0 = T; c.showItem = false; render(); }, delay || 1500);
  }
  function nextCustomer() { V.c = null; S.today.ci++; save(); startCustomer(); }
  function sell(price) {
    const c = V.c, i = S.gudang.indexOf(c.item);
    S.gudang.splice(i, 1);
    S.today.sold.push({ item: c.item, price, beli: IT[c.item].beli });
    c.price = price; c.showItem = false;
    if (stage().kembalian && price < 10 && (V.forceChange || rand() < 0.45)) {
      const ans = 10 - price, set = new Set([ans]);
      while (set.size < 3) { const d = pick([-2, -1, 1, 2]); const o = ans + d; if (o >= 0 && o <= 10) set.add(o); }
      c.opts = [...set].sort(() => rand() - 0.5); c.mode = 'kembalian'; save();
      hint('Alien membayar 10 bintang. Hitung kembaliannya!');
      render(); return;
    }
    paid();
  }
  function paid() {
    const c = V.c, beli = IT[c.item].beli;
    S.kas += c.price; save();
    AU.sfx('sold');
    for (let k = 0; k < Math.min(c.price, 8); k++) V.fx.push({ kind: 'coin', t0: T + k * 0.08, dur: 0.7, x: 196, y: 150, tx: 300, ty: 140 });
    for (let k = 0; k < 3; k++) V.fx.push({ kind: 'heart', t0: T + k * 0.2, dur: 1.2, x: 190 + k * 8, y: 140 });
    const u = c.price - beli;
    hint(u < 0 ? 'Yah, kita rugi sedikit. Harganya di bawah harga beli.' : u === 0 ? 'Pembeli senang, tapi kita tidak untung.' : c.price === c.max && c.hearts === 3 ? `Pas sekali! Untung ${u} ${STAR}!` : `Untung ${u} ${STAR}!`);
    leave(true, S.hias.length && rand() < 0.35 ? 'Wah, tokonya cantik! ✨' : pick(['Terima kasih! 😊', 'Asyik, dapat juga! 😄', 'Terima kasih, Angkasa! 💛']));
  }


  // ---------- Kelola Toko: perbesar, hiasan, pegawai, asuransi, cabang ----------
  function upPrice(kind) { const l = AM.UPGRADE[kind], n = S.up[kind]; return n < l.length ? l[n] : null; }
  const fund = () => (V.pay === 'kas' ? S.kas : S.tabung);
  function pay(cost) { if (fund() < cost) return false; if (V.pay === 'kas') S.kas -= cost; else S.tabung -= cost; return true; }
  const TABS = [['besar', '🏬 Perbesar'], ['hias', '✨ Hiasan'], ['pegawai', '🧑‍🚀 Pegawai'], ['asuransi', '🛡️ Asuransi'], ['cabang', '🏢 Cabang']];
  function uiKelola(msg) {
    const tab = V.tab || 'besar';
    const tabs = '<div class="mtabs">' + TABS.map(([k, n]) => `<button class="pb ${tab === k ? 'teal sel' : 'grey'}" data-a="tab" data-v="${k}" type="button">${n}</button>`).join('') + '</div>';
    const paysrc = `<div class="paysrc">Bayar dari: <button class="pb ${V.pay !== 'kas' ? 'teal sel' : 'grey'}" data-a="paySrc" data-v="tabung" type="button">🫙 Tabung ${S.tabung} ${STAR}</button><button class="pb ${V.pay === 'kas' ? 'teal sel' : 'grey'}" data-a="paySrc" data-v="kas" type="button">💰 Kas ${S.kas} ${STAR}</button></div>`;
    let body = '';
    if (tab === 'besar') {
      const card = (kind, title, from, to, desc) => {
        const price = upPrice(kind);
        const btn = price === null ? '<button class="pb grey" type="button" disabled>Sudah paling besar</button>' : `<button class="pb teal" data-a="upBuy" data-v="${kind}" type="button" ${fund() < price ? 'disabled' : ''}>Beli ${price} ${STAR}</button>`;
        return `<div class="uc"><div class="big2">${title}</div><div>${price === null ? 'Sudah maksimal' : `${from} <b>${to - 1} → ${to}</b>`}</div><div>${desc}</div>${btn}</div>`;
      };
      body = paysrc + (S.rusak ? `<div class="rusak">🔨 Atap toko bocor! Pembeli −2, gudang −2. <button class="pb green" data-a="renov" type="button" ${fund() < AM.RENOVASI ? 'disabled' : ''}>Renovasi ${AM.RENOVASI} ${STAR}</button></div>` : '') +
        `<div class="upg">${card('gudang', '🏬 +1 kotak gudang', 'Gudang', capGudang() + 1, 'Barang lebih banyak bisa disimpan')}${card('kotak', '📦 +1 kotak Rotni', 'Kotak Rotni', capKotak() + 1, 'Rotni bawa lebih banyak dari Bumi')}</div>`;
    } else if (tab === 'hias') {
      const dt = dayaTarik(), bp = bonusPembeli();
      const cards = AM.HIASAN.map((h) => {
        const own = S.hias.includes(h.id);
        return `<div class="uc sm ${own ? 'own' : ''} ${h.dt > 1 || h.harga >= 8 ? 'prem' : ''}"><div class="ico">${h.ikon}</div><div class="hn">${h.nama}</div><span class="dt">+${h.dt} ⭐</span>${own ? '<button class="pb grey" type="button" disabled>Dipasang ✓</button>' : `<button class="pb teal" data-a="hiasBuy" data-v="${h.id}" type="button" ${fund() < h.harga ? 'disabled' : ''}>${h.harga} ${STAR}</button>`}</div>`;
      }).join('');
      body = `<div class="dtbar">Daya tarik: <b>${dt} ⭐</b> → <b>+${bp} pembeli/hari</b> <small>(tiap 2 ⭐ = +1, paling banyak +${AM.DAYA.maks})</small></div>` + paysrc + `<div class="upg5">${cards}</div>`;
    } else if (tab === 'pegawai') {
      body = `<div class="peg">${A.img(A.S.KIKI, 4)}<div class="pp2"><b class="nm">${AM.PEGAWAI.nama} si Kasir Cilik</b><br>Membantu melayani <b>${AM.PEGAWAI.layani} pembeli tambahan</b> setiap hari, memakai barang di gudang.<br>Gaji: <b>${AM.PEGAWAI.gaji} ${STAR} per hari</b> (dibayar dari kas saat tutup toko).</div></div>
        <div class="mrow">${S.pegawai ? `<button class="pb grey" data-a="pegawai" data-v="0" type="button">Berhentikan ${AM.PEGAWAI.nama}</button><span class="status-ok">✓ ${AM.PEGAWAI.nama} sedang bekerja</span>` : `<button class="pb green" data-a="pegawai" data-v="1" type="button">🤝 Pekerjakan ${AM.PEGAWAI.nama}</button>`}</div>
        <p class="small">Kalau gudang kosong, ${AM.PEGAWAI.nama} tidak bisa berjualan tapi tetap digaji.</p>`;
    } else if (tab === 'asuransi') {
      body = `<div class="peg"><div class="bigico">🛡️</div><div class="pp2"><b class="nm">Asuransi Toko Bintang</b><br>Bayar <b>${AM.ASURANSI} ${STAR} setiap hari</b>. Kalau ada bencana (hujan meteor, badai debu, gempa planet), <b>renovasi gratis</b> dan toko langsung diperbaiki.<br>Tanpa asuransi, renovasi <b>${AM.RENOVASI} ${STAR}</b>.</div></div>
        <div class="mrow">${S.asuransi ? `<button class="pb grey" data-a="asuransi" data-v="0" type="button">Berhenti asuransi</button><span class="status-ok">✓ Toko diasuransikan</span>` : `<button class="pb green" data-a="asuransi" data-v="1" type="button">✅ Ikut asuransi</button>`}</div>`;
    } else {
      const next = AM.CABANG.find((c) => !S.cabang.includes(c.id));
      const cards = AM.CABANG.map((c) => {
        if (S.cabang.includes(c.id)) return `<div class="uc own"><div class="ico">${c.ikon}</div><b>${c.nama}</b><small>Sudah buka ✓</small><span class="dt">+${AM.SETORAN} ${STAR} / hari</span></div>`;
        if (c !== next) return `<div class="uc dim"><div class="ico">${c.ikon}</div><b>${c.nama}</b><small>Buka setelah cabang sebelumnya</small><span class="dt">${c.harga} ${STAR}</span></div>`;
        const sv = S.cabangSaved[c.id] || 0;
        return `<div class="uc"><div class="ico">${c.ikon}</div><b>${c.nama}</b><div class="bar cb"><i style="width:${sv / c.harga * 100}%"></i><span>${sv} / ${c.harga} ${STAR}</span></div><div class="mrow sm"><button class="pb teal" data-a="setor" data-v="5" type="button" ${fund() < 5 ? 'disabled' : ''}>Setor 5</button><button class="pb teal" data-a="setor" data-v="10" type="button" ${fund() < 10 ? 'disabled' : ''}>Setor 10</button></div></div>`;
      }).join('');
      body = `<p>Tabung untuk membuka cabang. Tiap cabang memberi <b>setoran +${AM.SETORAN} ${STAR} setiap hari</b>.</p>` + paysrc + `<div class="cab">${cards}</div>`;
    }
    modal(`<h3>🏪 Kelola Toko</h3>${tabs}${body}<p class="${msg ? 'ok' : 'small'}">${msg || ''}</p><div class="mrow"><button class="pb grey" data-a="close" type="button">Tutup</button></div>`);
    modalEl.firstChild.classList.add('wide', 'kelola');
  }
  // ---------- malam: Alien Usil ----------
  function guardOffer() {
    const ok = S.kas >= AM.SEWA_PENJAGA;
    modal(`<div class="duo">${A.img(A.S.USIL, 3)}<span class="vs">⚔️</span>${A.img(A.S.KURCACI, 3)}</div>
      <h3>🌙 Hati-hati malam ini!</h3><p class="big">Kabar: <b>Alien Usil</b> terlihat di dekat stasiun.</p>
      <p>Gudang masih berisi <b>${S.gudang.length} barang</b>. Mau sewa <b>Kurcaci Penjaga</b> untuk malam ini?</p>
      <div class="mrow"><button class="pb green" data-a="sewa" type="button" ${ok ? '' : 'disabled'}>🛡️ Sewa ${AM.SEWA_PENJAGA} ${STAR}</button><button class="pb grey" data-a="tidakSewa" type="button">Tidak usah</button></div>
      <p class="small">${ok ? 'Uang sewa diambil dari kas dan dicatat sebagai biaya. Kalau tidak dijaga, Alien Usil bisa mencuri barang di gudang.' : 'Kasnya tidak cukup untuk menyewa penjaga.'}</p>`);
    modalEl.firstChild.classList.add('wide');
  }
  function uiMalam() {
    const n = V.night;
    if (n.kind === 'bencana') {
      const bc = AM.BENCANA.find((b) => b.id === n.id);
      if (n.ins || n.fixed) return `<div class="pp night" style="${P(230, 630, 716, 170)}"><p class="big">${n.ins ? `🛡️ ${bc.nama}! Asuransi aktif, tukang kurcaci memperbaiki gratis.` : '🔨 Tukang kurcaci memperbaiki toko.'}</p><p class="small">Tok tok tok… Toko sudah bagus lagi! ✓</p><button class="pb red" data-a="pagi" type="button">Pagi tiba ☀️ ➜</button></div>`;
      return `<div class="pp night" style="${P(200, 470, 776, 330)}"><p class="big">${bc.ikon} ${bc.nama}! Atap toko bocor.</p><p class="mid2">Sampai diperbaiki: <b>pembeli −2</b> dan <b>gudang −2 kotak</b>.</p>
        <div class="mrow"><button class="pb green" data-a="renovNow" data-v="kas" type="button" ${S.kas < AM.RENOVASI ? 'disabled' : ''}>🔨 ${AM.RENOVASI} ${STAR} dari Kas</button><button class="pb teal" data-a="renovNow" data-v="tabung" type="button" ${S.tabung < AM.RENOVASI ? 'disabled' : ''}>🔨 ${AM.RENOVASI} ${STAR} dari Tabung</button></div>
        <button class="pb grey" data-a="pagi" type="button">Nanti saja ☀️</button><p class="small">Kalau ikut asuransi, renovasi gratis!</p></div>`;
    }
    const msg = n.guard ? 'Gudang aman! ✓' : n.stolen.length ? `Yah… ${n.stolen.length} barang dicuri.` : 'Untung gudangnya kosong!';
    const items = n.stolen.map((k) => ic(k, 1)).join(' ');
    return `<div class="pp bubble" style="left:390px;top:300px;width:330px" id="nb1" hidden><p>${n.guard ? 'Pergi sana! Gudang ini dijaga! 🛡️' : 'Hihihi… aku ambil, ya!'}</p></div>
      <div class="pp night" style="${P(250, 630, 676, 170)}"><p class="big">🌙 Malam hari · ${msg} ${items}</p><p class="small">${n.guard ? 'Kurcaci Penjaga mengusir Alien Usil.' : 'Lain kali, sewa Kurcaci Penjaga kalau ada kabar Alien Usil.'}</p><button class="pb red" data-a="pagi" type="button">Pagi tiba ☀️ ➜</button></div>`;
  }
  // ---------- berbagi tiap 20 hari ----------
  function sedekahOffer() {
    const k = V.sdk;
    const opt = (id, ico, nama, ket) => `<button class="uc pick ${k.to === id ? 'on' : ''}" data-a="sdkTo" data-v="${id}" type="button"><div class="ico">${ico}</div><b>${nama}</b><small>${ket}</small></button>`;
    modal(`<div class="duo">${A.img(A.S.ANGKASA, 2)}${A.img(A.S.ROTNI, 2)}</div>
      <h3>🤲 Hari ke-${S.day}: Waktunya Berbagi</h3><p class="big">Setiap ${AM.SEDEKAH_TIAP} hari, kita sisihkan rezeki untuk orang lain.</p>
      <div class="upg">${opt('panti', '🏠', 'Panti Asuhan Bintang Kecil', 'Belikan buku & mainan untuk anak-anak')}${opt('jumat', '🕌', 'Jumat Berkah', 'Bagikan nasi kotak di masjid stasiun')}</div>
      <div class="price sdk"><button class="pb blue sq" data-a="sdkMin" type="button">–</button><span>${A.img(A.S.STAR, 3)}<b>${k.amt}</b></span><button class="pb blue sq" data-a="sdkPlus" type="button">+</button></div>
      <p class="small">Dari Kas ${S.kas} ${STAR} · Rotni: "Sedikit pun berarti, yang penting ikhlas."</p>
      <div class="mrow"><button class="pb green" data-a="sdkGo" type="button" ${S.kas < 1 ? 'disabled' : ''}>🎁 Berbagi ${k.amt} ${STAR}</button><button class="pb grey" data-a="sdkSkip" type="button">Lain kali</button></div>`);
    modalEl.firstChild.classList.add('wide');
  }
  function uiSedekah() {
    const k = V.sdkScene;
    const txt = k.to === 'jumat' ? `🕌 Jumat Berkah: nasi kotak senilai ${k.amt} ${STAR} dibagikan!` : `🏠 Buku & mainan senilai ${k.amt} ${STAR} untuk Panti Asuhan Bintang Kecil!`;
    return `<div class="pp cap">${txt}<br><span>"Terima kasih, Kak Angkasa!" · Semoga berkah 🤲</span><button class="pb red" data-a="sdkEnd" type="button">Lanjut ➜</button></div>`;
  }
  // ---------- ucapan naik tingkat ----------
  function congrats(fromName) {
    AU.sfx('up');
    const cols = ['#f2c14e', '#e05a8a', '#6fb0ae', '#c8463d', '#8a5aa6'];
    let conf = '';
    for (let i = 0; i < 40; i++) conf += `<i class="conf" style="left:${(i * 53) % 800}px;top:${(i * 37) % 120 - 10}px;background:${cols[i % 5]};animation-delay:${(i % 8) * 0.15}s"></i>`;
    modal(`${conf}<div class="duo">${A.img(A.S.ANGKASA, 2)}${A.img(A.S.ROTNI, 2)}</div>
      <h3>🎉 Selamat! ${fromName} naik jadi ${stage().nama}!</h3><p class="big">Kamu berhasil mengelola keuangan dengan baik!</p>
      <div class="stats"><div>Total untung<b>${S.total} ${STAR}</b></div><div>Ditabung<b>${S.ditabung} ${STAR}</b></div><div>Dibagi<b>${S.dibagi} ${STAR}</b></div></div>
      <div class="hadiah">🎁 Hadiah: ${AM.HADIAH[S.stage]}</div>
      <div class="mrow"><button class="pb red" data-a="close" type="button">Hore! 🎉</button></div>`);
    modalEl.firstChild.classList.add('wide', 'cong');
  }

  const ACT = {
    music() { AU.toggle(); AU.music(AU.on); renderTop(); },
    menu() { V.c = null; go('title'); },
    play() {
      if (!S.today) startDay();
      V.planet = stage().planet[0];
      go(S.today.phase || 'kabar');
    },
    reset() {
      modal(`<h3>Mulai dari awal?</h3><p>Semua bintang, gudang, dan stiker akan hilang.</p><div class="mrow"><button class="pb red" data-a="resetYes" type="button">Ya, mulai baru</button><button class="pb grey" data-a="close" type="button">Batal</button></div>`);
    },
    resetYes() { closeModal(); S = fresh(); save(); render(); },
    close() { closeModal(); },
    book() {
      const st = S.stiker.map((s) => `<span class="stk">${s.emoji ? `<span class="emo">${s.emoji}</span>` : ic(s.item, 2)}<small>Hari ${s.day}</small></span>`).join('');
      modal(`<h3>📒 Buku Kebaikan</h3>${st ? `<div class="stks">${st}</div>` : '<p>Belum ada stiker. Tolong alien yang butuh bantuan di toko, ya!</p>'}<div class="mrow"><button class="pb red" data-a="close" type="button">Tutup</button></div>`);
    },
    toSurvei() { V.planet = stage().planet[0]; go('survei'); },
    fly(p) { V.planet = p; V.bubble = null; ensureAliens(p); save(); AU.sfx('fly'); render(); },
    ask(i) {
      i = +i; const td = S.today, p = V.planet;
      if (td.asked[p][i]) { V.bubble = { p, i, t0: T }; render(); return; }
      if (td.energy <= 0) { AU.sfx('no'); hint('Energi tanya habis. Ayo pesan ke Bumi!'); return; }
      td.energy--; td.asked[p][i] = true;
      const c = td.aliens[p][i], t = td.tally[c.item] || (td.tally[c.item] = { n: 0, love: false });
      t.n++; if (c.hearts === 3) t.love = true;
      V.bubble = { p, i, t0: T }; AU.sfx('ask'); save();
      hint(td.energy ? `Dicatat! Energi tinggal ${td.energy}.` + (td.energy === 2 ? ' Coba tanya di planet lain juga!' : '') : 'Energi habis. Lihat catatanmu, lalu pesan ke Bumi!');
      render();
    },
    toPesan() {
      if (S.today.energy === AM.ENERGI) { modal(`<h3>Belum survei?</h3><p>Kamu belum bertanya ke alien mana pun. Tetap lanjut?</p><div class="mrow"><button class="pb red" data-a="toPesanYes" type="button">Lanjut</button><button class="pb grey" data-a="close" type="button">Survei dulu</button></div>`); return; }
      go('pesan');
    },
    toPesanYes() { closeModal(); go('pesan'); },
    add(k) {
      const st = stage();
      if (V.fly) return;
      if (V.cart.length >= capKotak()) { AU.sfx('no'); hint(`Kotak Rotni cuma muat ${capKotak()} barang.`); return; }
      if (S.gudang.length + V.cart.length >= capGudang()) { AU.sfx('no'); hint('Gudang penuh! Kembalikan barang lama atau pesan lebih sedikit.'); return; }
      if (S.kas - cartTotal() < IT[k].beli) { AU.sfx('no'); hint(`Kasnya tidak cukup untuk ${IT[k].nama.toLowerCase()}.`); return; }
      V.cart.push(k); AU.sfx('add'); hint(`${IT[k].nama} masuk kotak. Totalnya ${cartTotal()} ${STAR}.`); render();
    },
    rm(i) { if (V.fly) return; const k = V.cart.splice(+i, 1)[0]; AU.sfx('remove'); hint(`${IT[k].nama} dikeluarkan dari kotak.`); render(); },
    obral(i) {
      const k = S.gudang[+i], back = Math.ceil(IT[k].beli / 2);
      modal(`<h3>Kembalikan ke Bumi?</h3><p>${ic(k, 2)} ${IT[k].nama} sisa kemarin bisa dikembalikan.<br>Kamu dapat kembali <b>${back} ${STAR}</b> (beli ${IT[k].beli} ${STAR}).</p><div class="mrow"><button class="pb red" data-a="obralYes" data-v="${i}" type="button">Kembalikan</button><button class="pb grey" data-a="close" type="button">Simpan saja</button></div>`);
    },
    obralYes(i) { const k = S.gudang.splice(+i, 1)[0]; S.kas += Math.ceil(IT[k].beli / 2); save(); closeModal(); AU.sfx('coin'); hint(`${IT[k].nama} dikembalikan. Gudang jadi lebih lega.`); render(); },
    kirim() {
      if (V.fly) return;
      if (!V.cart.length) { modal(`<h3>Tidak belanja?</h3><p>Kotak Rotni masih kosong. Buka toko dengan barang di gudang saja?</p><div class="mrow"><button class="pb red" data-a="bukaToko" type="button">Buka toko</button><button class="pb grey" data-a="close" type="button">Pilih barang</button></div>`); return; }
      const count = {}; V.cart.forEach((k) => (count[k] = (count[k] || 0) + 1));
      const list = Object.keys(count).map((k) => `${count[k]} ${IT[k].nama.toLowerCase()}`).join(' + ');
      const top = tallyRows()[0];
      const lupa = top && !V.cart.includes(top) && !S.gudang.includes(top) ? `<p class="warnp">📋 Catatan: <b>${IT[top].nama.toLowerCase()}</b> paling dicari${S.today.tally[top].love ? ' ❤' : ''}, tapi belum ada di kotak. Yakin?</p>` : '';
      modal(`<div class="rotni">${A.img(A.S.ROTNI_KEPALA, 2)}</div><h3>Rotni membacakan daftar</h3><p class="big">${list}</p><p>Totalnya <b>${cartTotal()} ${STAR}</b> ya?</p>${lupa}<div class="mrow"><button class="pb red" data-a="berangkat" type="button">Ya, berangkat! 🚀</button><button class="pb grey" data-a="close" type="button">Ubah lagi</button></div>`);
    },
    berangkat() {
      closeModal();
      const total = cartTotal(); S.kas -= total; S.today.spent += total; save();
      V.fly = { phase: 'go', t0: T }; AU.sfx('fly'); hint('Wuuush! Rotni terbang ke Bumi…'); render();
    },
    bukaToko() { closeModal(); go('toko'); },
    kelola() { AU.sfx('tap'); V.tab = 'besar'; V.pay = V.pay || 'tabung'; uiKelola(); },
    tab(v) { AU.sfx('tap'); V.tab = v; uiKelola(); },
    paySrc(v) { AU.sfx('tap'); V.pay = v; uiKelola(); },
    hiasBuy(id) {
      const h = AM.HIASAN.find((q) => q.id === id);
      if (!h || S.hias.includes(id) || !pay(h.harga)) { AU.sfx('no'); return; }
      S.hias.push(id); save(); AU.sfx('up'); render();
      uiKelola(`Hore! ${h.nama} dipasang. Daya tarik sekarang ${dayaTarik()} ⭐.`);
    },
    pegawai(v) { S.pegawai = v === '1'; save(); AU.sfx(S.pegawai ? 'up' : 'tap'); render(); uiKelola(S.pegawai ? `${AM.PEGAWAI.nama} mulai bekerja besok pagi! 🤝` : `${AM.PEGAWAI.nama} sudah diberhentikan.`); },
    asuransi(v) { S.asuransi = v === '1'; save(); AU.sfx(S.asuransi ? 'up' : 'tap'); render(); uiKelola(S.asuransi ? 'Toko sekarang diasuransikan. 🛡️' : 'Asuransi dihentikan.'); },
    setor(v) {
      const c = AM.CABANG.find((q) => !S.cabang.includes(q.id)); if (!c) return;
      const sv = S.cabangSaved[c.id] || 0, amt = Math.min(+v, c.harga - sv);
      if (!pay(amt)) { AU.sfx('no'); return; }
      S.cabangSaved[c.id] = sv + amt;
      let msg = `Tabungan ${c.nama}: ${sv + amt} / ${c.harga} ${STAR}`;
      if (sv + amt >= c.harga) { S.cabang.push(c.id); msg = `🎉 ${c.nama} buka! Setoran +${AM.SETORAN} ${STAR} setiap hari.`; AU.sfx('up'); } else AU.sfx('coin');
      save(); render(); uiKelola(msg);
    },
    renov() { if (!S.rusak || !pay(AM.RENOVASI)) { AU.sfx('no'); return; } S.rusak = false; save(); AU.sfx('up'); render(); uiKelola('Toko sudah diperbaiki! ✓'); },
    renovNow(v) {
      const src = v === 'kas' ? 'kas' : 'tabung'; if (S[src] < AM.RENOVASI) return;
      S[src] -= AM.RENOVASI; S.rusak = false; V.night.fixed = true; save(); AU.sfx('up'); render();
    },
    sdkOpen() { V.sdk = { to: 'jumat', amt: Math.min(5, S.kas) || 1 }; AU.sfx('tap'); sedekahOffer(); },
    sdkTo(v) { V.sdk.to = v; AU.sfx('tap'); sedekahOffer(); },
    sdkMin() { if (V.sdk.amt > 1) { V.sdk.amt--; AU.sfx('tap'); sedekahOffer(); } },
    sdkPlus() { if (V.sdk.amt < Math.min(S.kas, 30)) { V.sdk.amt++; AU.sfx('tap'); sedekahOffer(); } },
    sdkGo() {
      const k = V.sdk; if (S.kas < k.amt) return;
      S.kas -= k.amt; S.dibagi += k.amt; S.sedekah += k.amt; S.today.sedekahDone = true;
      S.stiker.push({ emoji: k.to === 'jumat' ? '🕌' : '🏠', day: S.day }); save();
      closeModal(); AU.sfx('kind'); V.sdkScene = { to: k.to, amt: k.amt, t0: T }; hint(''); V.screen = 'sedekah'; render();
    },
    sdkSkip() { S.today.sedekahDone = 'lewat'; save(); closeModal(); render(); },
    sdkEnd() { go('kabar'); },
    sewa() { closeModal(); S.kas -= AM.SEWA_PENJAGA; S.today.guard = true; S.today.biaya = AM.SEWA_PENJAGA; save(); AU.sfx('coin'); hint('Kurcaci Penjaga siap berjaga malam ini! 🛡️'); render(); },
    tidakSewa() { closeModal(); S.today.guard = false; save(); hint('Semoga Alien Usil tidak datang…'); render(); },
    pagi() { V.night = null; finishDay(); },
    upBuy(kind) {
      const price = upPrice(kind);
      if (price === null || !pay(price)) { AU.sfx('no'); return; }
      S.up[kind]++; save(); AU.sfx('up');
      render();
      uiKelola(kind === 'gudang' ? `Hore! Gudang sekarang ${capGudang()} kotak.` : `Hore! Kotak Rotni sekarang ${capKotak()} kotak.`);
    },
    minus() { const c = V.c; if (c.price > 1) { c.price--; AU.sfx('tap'); render(); } },
    plus() { const c = V.c; if (c.price < maxHarga(c.item)) { c.price++; AU.sfx('tap'); render(); } },
    tawarkan() {
      const c = V.c;
      if (c.hearts === 3 && c.price <= IT[c.item].beli && !c.reminded) {
        c.reminded = true; AU.sfx('ask');
        modal(`<div class="rotni">${A.img(A.S.ROTNI_KEPALA, 2)}</div><h3>Tunggu sebentar!</h3><p class="big">${IT[c.item].nama} sedang dicari ❤❤❤</p><p>Harganya ${c.price} ${STAR}, ${c.price < IT[c.item].beli ? 'lebih murah dari' : 'sama dengan'} harga beli di Bumi (${IT[c.item].beli} ${STAR}). Mau naikkan harga?</p><div class="mrow"><button class="pb green" data-a="naikkan" type="button">Naikkan ⬆️</button><button class="pb grey" data-a="tetap" type="button">Tetap</button></div>`);
        return;
      }
      if (c.price <= c.max) { sell(c.price); return; }
      if (!c.tawar) { c.tawar = true; c.mode = 'tawar'; AU.sfx('ask'); hint('Pembeli menawar. Mau terima?'); render(); return; }
    },
    naikkan() { closeModal(); hint('Tekan + untuk menaikkan harga, lalu Tawarkan.'); },
    tetap() { closeModal(); ACT.tawarkan(); },
    boleh() { sell(V.c.max); },
    tolak() { S.today.mahal++; save(); AU.sfx('sad'); hint('Kalau terlalu mahal, pembeli jadi sedih.'); leave(false, 'Mahal sekali… aku jadi sedih. 😢'); },
    tidakada() { const c = V.c; S.today.missing[c.item] = (S.today.missing[c.item] || 0) + 1; save(); AU.sfx('sad'); hint(`Rotni mencatat: ada yang cari ${IT[c.item].nama.toLowerCase()}.`); leave(false, 'Yah… tidak apa-apa. 😔', 1300); },
    kembali(v) {
      const c = V.c;
      if (+v === 10 - c.price) { AU.sfx('coin'); paid(); }
      else { AU.sfx('no'); c.wrong = +v < 10 - c.price ? 'kurang' : 'kelebihan'; hint('Pembeli protes! Hitung lagi bintang yang tidak dicoret.'); render(); }
    },
    beri() {
      const c = V.c, cost = needCost(c), i = S.gudang.indexOf(c.item);
      S.gudang.splice(i, 1); S.berbagi -= cost; S.kas += IT[c.item].beli;
      S.today.sold.push({ item: c.item, price: IT[c.item].beli, beli: IT[c.item].beli, needy: true });
      S.stiker.push({ item: c.item, planet: c.planet, day: S.day });
      c.helped = true; save(); AU.sfx('kind');
      for (let k = 0; k < 6; k++) V.fx.push({ kind: 'heart', t0: T + k * 0.18, dur: 1.4, x: 186 + (k % 3) * 10, y: 150 });
      hint('Stiker kebaikan masuk ke Buku Kebaikan! 💛');
      leave(true, 'Terima kasih banyak, Angkasa! ❤️', 2400);
    },
    maaf() { AU.sfx('tap'); hint('Tidak apa-apa. Lain kali mungkin kita bisa membantu.'); leave(false, 'Iya, tidak apa-apa. Terima kasih.', 1500); },
    tutupAwal() { V.c = null; S.today.ci = S.today.cust.length; save(); go('tutup'); },
    'jar+'(k) { const b = S.today.bagi, r = dayResult().untung; if (b.tabung + b.berbagi < r) { b[k]++; AU.sfx('add'); save(); render(); } },
    'jar-'(k) { const b = S.today.bagi; if (b[k] > 0) { b[k]--; AU.sfx('remove'); save(); render(); } },
    tidur() {
      const td = S.today, r = dayResult(), b = td.bagi;
      if (!td.closed) {
        if (r.untung > 0) { S.kas -= b.tabung + b.berbagi; S.tabung += b.tabung; S.berbagi += b.berbagi; S.ditabung += b.tabung; S.dibagi += b.berbagi; S.total += r.untung; }
        td.closed = true;
      }
      if (td.bencana) {
        if (!td.bencanaDone) { td.bencanaDone = true; S.lastBencana = S.day; if (!S.asuransi) S.rusak = true; save(); }
        V.night = { kind: 'bencana', id: td.bencana, ins: S.asuransi, t0: T }; V.screen = 'malam'; hint(''); render(); AU.sfx('sad');
        return;
      }
      if (td.warn && td.guard !== undefined) {
        let stolen = td.stolen;
        if (!stolen) {
          stolen = [];
          if (!td.guard) { const n = Math.min(S.gudang.length, rand() < 0.5 ? 1 : 2); for (let i = 0; i < n; i++) stolen.push(S.gudang.splice(Math.floor(rand() * S.gudang.length), 1)[0]); }
          td.stolen = stolen;
        }
        save();
        V.night = { guard: td.guard, stolen, t0: T }; V.screen = 'malam'; hint(''); render(); AU.sfx(td.guard ? 'up' : 'sad');
        setTimeout(() => { const e = document.getElementById('nb1'); if (e) e.hidden = false; }, 1700);
        return;
      }
      finishDay();
    },
  };
  function finishDay() {
    {
      let up = false; const from = S.stage;
      while (S.stage < AM.STAGES.length - 1 && S.total >= AM.STAGES[S.stage + 1].butuh) { S.stage++; up = true; }
      S.day++; startDay();
      V.planet = stage().planet[0];
      if (up) congrats(AM.STAGES[from].nama);
      go('kabar');
    }
  }

  function onTap(e) {
    const b = e.target.closest('[data-a]');
    if (!b || b.disabled) return;
    AU.unlock();
    if (!musicStarted && AU.on) { musicStarted = true; AU.music(true); }
    const fn = ACT[b.dataset.a];
    if (fn) fn(b.dataset.v);
  }
  let musicStarted = false;
  ['#ui', '#top', '#modal'].forEach((s) => $(s).addEventListener('click', onTap));

  function landed() {
    S.gudang.push(...V.cart); V.cart = []; save();
    AU.sfx('coin'); hint('Rotni sudah pulang! Barangnya masuk gudang.');
    setTimeout(() => go('toko'), 900);
    render();
  }

  // ---------- ukuran layar ----------
  function fit() {
    const st = $('#stage'), s = Math.min(window.innerWidth / 1176, window.innerHeight / 816);
    st.style.transform = `translate(-50%,-50%) scale(${s})`;
  }
  window.addEventListener('resize', fit); fit();

  S = load() || fresh();
  render(); requestAnimationFrame(frame);

  AM.debug = {
    get S() { return S; }, get V() { return V; }, go, act: (a, v) => ACT[a](v), save,
    newDay() { startDay(); go('kabar'); },
    settle,
  };
})();
