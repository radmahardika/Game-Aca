// Tim Penyelamat Malam — alur utama: layar judul, ruangan dua iPad, kontrol analog, aturan penyelamatan, simpan progres.
(function () {
  const T = window.TPM;
  const $ = (id) => document.getElementById(id);
  const N = T.N, SAVE_KEY = 'penyelamat-malam-v1';
  const renderer = T.Renderer($('view'));
  addEventListener('resize', () => renderer.resize());
  $('ver').textContent = 'versi ' + T.VERSION;

  // ---------- keadaan ----------
  const S = (T.S = {
    scene: 'title', mode: null, role: 'owl',
    world: null, players: null, seen: new Uint8Array(N * N), newSeen: [],
    remote: null, heard: {}, t: 0, lastMsg: 0, netOk: null,
  });
  const other = (r) => (r == 'owl' ? 'bear' : 'owl');
  const multi = () => S.mode == 'host' || S.mode == 'guest';
  const owns = () => S.mode != 'guest'; // tuan rumah & main sendiri memegang keadaan dunia

  // ---------- simpan ----------
  const seenStr = () => Array.from(S.seen).join('');
  const seenFrom = (s) => { const a = new Uint8Array(N * N); if (s) for (let i = 0; i < a.length; i++) a[i] = s.charCodeAt(i) == 49 ? 1 : 0; return a; };
  function load() {
    try { const d = JSON.parse(localStorage.getItem(SAVE_KEY)); if (d && d.world && d.world.vics && d.world.vics.length == T.VICTIMS.length) return d; } catch (e) {}
    return null;
  }
  function save() {
    if (!owns() || !S.world) return;
    try { localStorage.setItem(SAVE_KEY, JSON.stringify({ world: S.world, players: S.players, seen: seenStr() })); } catch (e) {}
  }
  function freshWorld() {
    S.world = T.newWorld();
    S.players = JSON.parse(JSON.stringify(T.START));
    S.seen = new Uint8Array(N * N);
    T.prepareMap(S.world);
  }
  function beginOwn() {
    const d = load();
    if (d && d.world.saved < T.VICTIMS.length) { S.world = d.world; S.players = d.players; S.seen = seenFrom(d.seen); T.prepareMap(S.world); }
    else freshWorld();
    save();
  }

  // ---------- layar ----------
  const screens = ['title', 'two', 'rolePick', 'hostWait', 'joinPick'];
  function show(id) { for (const s of screens) $(s).hidden = s != id; }
  function titleScreen() {
    T.net.stop();
    S.scene = 'title'; S.mode = null;
    for (const m of ['toolModal', 'mapModal', 'menu', 'endModal']) $(m).hidden = true;
    $('hud').hidden = true;
    const d = load();
    if (!S.world) { if (d) { S.world = d.world; T.prepareMap(S.world); } else freshWorld(); }
    const info = $('saveInfo');
    if (d && d.world.saved > 0 && d.world.saved < T.VICTIMS.length) { info.textContent = `Petualangan tersimpan: ${d.world.saved} dari 7 hewan sudah selamat.`; info.hidden = false; }
    else info.hidden = true;
    $('resetBtn').hidden = !d;
    show('title');
    T.audio.music(false);
  }

  let wakeLock = null;
  async function keepAwake() {
    try { if (navigator.wakeLock && document.visibilityState == 'visible') wakeLock = await navigator.wakeLock.request('screen'); } catch (e) {}
  }
  document.addEventListener('visibilitychange', () => { if (document.visibilityState == 'visible' && S.scene == 'play') keepAwake(); else save(); });

  function enterPlay() {
    show(null);
    S.scene = 'play';
    $('hud').hidden = false;
    $('swapBtn').hidden = S.mode != 'solo';
    $('netChip').hidden = !multi();
    $('banner').hidden = true;
    updateNet(T.net.connected());
    updateHUD();
    T.audio.music(true);
    keepAwake();
    roleToast();
    if (S.world.saved == T.VICTIMS.length) showEnd();
  }
  function roleToast() {
    if (S.role == 'owl') showToast('🦉 Kamu Tutu', 'Cari hewan yang butuh pertolongan, lalu tandai dengan ⭐ supaya Siberat tahu arahnya.', 3200);
    else showToast('🐻 Kamu Siberat', 'Gelap sekali! Ikuti mata kuning Tutu dan bintang ⭐. Dengarkan suara minta tolong 🔊.', 3200);
  }

  // ---------- ruangan ----------
  const randCode = () => Array.from({ length: 4 }, () => Math.floor(Math.random() * T.CODE_ICONS.length));
  const codeHTML = (code) => code.map((i) => `<span>${T.CODE_ICONS[i]}</span>`).join('');

  async function openRoom() {
    S.hadFriend = false;
    show('hostWait');
    const st = $('hostStatus');
    st.className = 'status'; st.textContent = 'Membuka ruangan…';
    $('startEarly').hidden = true;
    for (let tries = 0; tries < 3; tries++) {
      const code = randCode();
      $('codeShow').innerHTML = codeHTML(code);
      try {
        await T.net.host(code);
        st.textContent = 'Menunggu teman bergabung…';
        $('startEarly').hidden = false;
        return;
      } catch (e) {
        if (e && e.type == 'unavailable-id') continue;
        break;
      }
    }
    st.className = 'status err';
    st.textContent = 'Ruangan belum bisa dibuka. Cek internet, lalu coba lagi.';
  }

  let codeIn = [];
  function drawCodeIn() {
    $('codeIn').innerHTML = [0, 1, 2, 3].map((i) => `<span>${codeIn[i] != null ? T.CODE_ICONS[codeIn[i]] : ''}</span>`).join('');
  }
  async function tryJoin() {
    const st = $('joinStatus');
    st.className = 'status'; st.textContent = 'Menyambung…';
    try {
      await T.net.join(codeIn.slice());
      st.textContent = 'Tersambung! Menunggu dunia dari teman…';
    } catch (e) {
      st.className = 'status err';
      st.textContent = e && e.type == 'peer-unavailable' ? 'Ruangan tidak ditemukan. Cek gambarnya lagi ya.'
        : e && e.type == 'timeout' ? 'Belum tersambung. Pastikan iPad teman sudah membuat ruangan.'
        : 'Tidak bisa tersambung. Cek internet, lalu coba lagi.';
      T.net.stop();
      codeIn = []; drawCodeIn();
    }
  }

  T.net.onStatus = function (k) {
    if (k == 'open') {
      S.lastMsg = performance.now(); S.hadFriend = true;
      if (S.mode == 'guest') T.net.send({ t: 'hello', v: T.VERSION });
      updateNet(true);
    } else if (k == 'lost') updateNet(false);
    else if (k == 'error' && S.scene == 'play') updateNet(false);
  };
  function updateNet(ok) {
    if (!multi() || S.scene != 'play') return;
    S.netOk = ok;
    const c = $('netChip');
    c.textContent = ok ? '🔗 Terhubung' : '📶 Terputus';
    c.classList.toggle('off', !ok);
    const b = $('banner');
    b.hidden = ok;
    b.textContent = S.mode == 'guest' ? 'Teman terputus. Menyambung lagi…'
      : S.hadFriend ? 'Teman terputus. Menunggu teman masuk lagi…'
      : 'Menunggu teman bergabung. Kode: ' + T.net.code.map((i) => T.CODE_ICONS[i]).join(' ');
  }

  T.net.onMsg = function (m) {
    if (!m || typeof m != 'object') return;
    S.lastMsg = performance.now();
    if (S.netOk === false && S.scene == 'play') updateNet(true);
    switch (m.t) {
      case 'hello':
        if (S.mode != 'host') return;
        T.net.send({ t: 'welcome', role: other(S.role), world: S.world, players: S.players, seen: seenStr() });
        T.audio.sfx('join');
        if (S.scene != 'play') enterPlay();
        else { updateNet(true); showToast('🔗 Teman bergabung!', S.role == 'owl' ? 'Siberat sudah siap di hutan.' : 'Tutu sudah siap di hutan.', 2200); }
        break;
      case 'welcome': {
        if (S.mode != 'guest') return;
        S.role = m.role; S.world = m.world; S.players = m.players;
        const s = seenFrom(m.seen); for (let i = 0; i < s.length; i++) if (s[i]) S.seen[i] = 1;
        T.prepareMap(S.world);
        S.remote = null;
        T.audio.sfx('join');
        if (S.scene != 'play') enterPlay(); else { updateNet(true); updateHUD(); }
        break;
      }
      case 'pos':
        S.remote = { x: m.x, y: m.y, a: m.a };
        break;
      case 'seen':
        for (const i of m.a || []) if (i >= 0 && i < N * N) S.seen[i] = 1;
        break;
      case 'act':
        if (S.mode == 'host') applyAct(m, 'remote');
        break;
      case 'world':
        if (S.mode == 'guest') { S.world = m.world; updateHUD(); if (!$('toolModal').hidden) refreshTools(); }
        break;
      case 'ev':
        handleEvent(m);
        break;
      case 'reset':
        if (S.mode != 'guest') return;
        S.world = m.world; S.players = m.players; S.seen = new Uint8Array(N * N); S.remote = null;
        T.prepareMap(S.world);
        $('endModal').hidden = true;
        updateHUD(); roleToast();
        break;
    }
  };

  // ---------- aturan dunia (dijalankan oleh pemegang dunia) ----------
  function broadcastWorld() { if (S.mode == 'host') T.net.send({ t: 'world', world: S.world }); }
  function emit(ev, to) {
    ev.t = 'ev';
    if (to == 'all' || to == 'local') handleEvent(ev);
    if ((to == 'all' || to == 'remote') && S.mode == 'host') T.net.send(ev);
  }
  function applyAct(a, from) {
    const W = S.world;
    if (a.k == 'mark') {
      if (W.stars.some((q) => Math.hypot(q.x - a.x, q.y - a.y) < 0.6)) return;
      W.stars.push({ x: a.x, y: a.y });
      if (W.stars.length > 5) W.stars.shift();
      broadcastWorld(); save();
      emit({ k: 'marked' }, 'all');
    } else if (a.k == 'bag') {
      const bag = [];
      let used = 0;
      for (const id of a.bag || []) { const t = T.toolById[id]; if (t && !bag.includes(id) && used + t.w <= T.BAG_SIZE) { bag.push(id); used += t.w; } }
      W.bag = bag;
      broadcastWorld(); save();
    } else if (a.k == 'rescue') {
      const v = W.vics.find((q) => q.id == a.id);
      if (!v || v.rescued) return;
      const meta = T.vicById[v.id];
      if (!meta.need.every((n) => W.bag.includes(n))) { emit({ k: 'wrong', id: v.id }, from); return; }
      W.bag = W.bag.filter((b) => !meta.need.includes(b));
      v.rescued = true; W.saved++;
      const ang = W.saved * 0.9;
      v.x = T.SARANG.x + Math.cos(ang) * 2.3; v.y = T.SARANG.y + Math.sin(ang) * 2.3;
      W.stars = W.stars.filter((s) => Math.hypot(s.x - v.ox, s.y - v.oy) > 1);
      broadcastWorld(); save();
      emit({ k: 'rescued', id: v.id }, 'all');
    }
  }
  // Aksi dari iPad ini: pemegang dunia langsung menjalankan, tamu mengirim ke tuan rumah.
  function act(a) {
    if (owns()) applyAct(a, 'local');
    else {
      if (a.k == 'bag') S.world.bag = a.bag.slice();
      T.net.send(Object.assign({ t: 'act' }, a));
    }
  }

  let endTimer = 0;
  function handleEvent(ev) {
    updateHUD();
    if (ev.k == 'marked') {
      T.audio.sfx('mark');
      if (S.role == 'owl') showToast('⭐ Ditandai', 'Siberat sekarang bisa melihat bintang ini dari jauh.', 1800);
      else showToast('⭐ Tutu menandai sesuatu!', 'Cari bintang kuning, lalu ikuti arahnya.', 2200);
    } else if (ev.k == 'wrong') {
      T.audio.sfx('wrong');
      showToast('Alatnya belum cocok', 'Tanya Tutu: hewan ini kenapa? Lalu ambil alat di Pohon Sarang.', 2800);
    } else if (ev.k == 'rescued') {
      const meta = T.vicById[ev.id];
      T.audio.sfx('rescue');
      showToast(meta.nama + ' selamat!', meta.lesson, 4600);
      if (S.world.saved >= T.VICTIMS.length) { clearTimeout(endTimer); endTimer = setTimeout(showEnd, 4800); }
    }
  }
  function showEnd() {
    $('endModal').hidden = false;
    $('againBtn').hidden = !owns();
    $('endWait').hidden = owns();
  }

  // ---------- input ----------
  const keys = {};
  addEventListener('keydown', (e) => {
    const k = e.key.toLowerCase();
    keys[k] = 1;
    if (S.scene != 'play' || modalOpen()) return;
    if (k == ' ') { e.preventDefault(); doA(); }
    if (k == 't') doMark();
    if (k == 'q' && S.mode == 'solo') swap();
    if (k == 'm') openMap();
  });
  addEventListener('keyup', (e) => { keys[e.key.toLowerCase()] = 0; });
  const modalOpen = () => !$('toolModal').hidden || !$('mapModal').hidden || !$('menu').hidden || !$('endModal').hidden;

  const stick = { id: null, ox: 0, oy: 0, dx: 0, dy: 0 };
  const cv = $('view');
  $('game').addEventListener('pointerdown', (e) => {
    if (S.scene != 'play' || modalOpen() || e.target !== cv || stick.id !== null) return;
    if (e.clientX > innerWidth * 0.6) return;
    T.audio.unlock();
    stick.id = e.pointerId; stick.ox = e.clientX; stick.oy = e.clientY; stick.dx = stick.dy = 0;
    const s = $('stick'); s.style.left = e.clientX + 'px'; s.style.top = e.clientY + 'px'; s.hidden = false;
    $('knob').style.transform = '';
    try { cv.setPointerCapture(e.pointerId); } catch (err) {}
  });
  $('game').addEventListener('pointermove', (e) => {
    if (e.pointerId !== stick.id) return;
    let dx = e.clientX - stick.ox, dy = e.clientY - stick.oy;
    const m = Math.hypot(dx, dy), R = 52;
    if (m > R) { dx *= R / m; dy *= R / m; }
    stick.dx = dx / R; stick.dy = dy / R;
    $('knob').style.transform = `translate(${dx}px,${dy}px)`;
  });
  const endStick = (e) => { if (e.pointerId !== stick.id) return; stick.id = null; stick.dx = stick.dy = 0; $('stick').hidden = true; };
  $('game').addEventListener('pointerup', endStick);
  $('game').addEventListener('pointercancel', endStick);

  // ---------- gerak ----------
  function walkable(who, x, y) {
    const xi = x | 0, yi = y | 0;
    if (xi < 0 || yi < 0 || xi >= N || yi >= N) return false;
    const i = T.I(xi, yi);
    if (T.WALL[i]) return false;
    const f = T.FLOOR[i];
    return !(who == 'bear' && (f == 1 || f == 6)); // Siberat tidak bisa masuk sungai, hanya lewat jembatan
  }
  function free(who, x, y) {
    const r = 0.22;
    return walkable(who, x - r, y - r) && walkable(who, x + r, y - r) && walkable(who, x - r, y + r) && walkable(who, x + r, y + r);
  }
  function step(dt) {
    const p = S.players[S.role];
    let fw = -stick.dy, tr = stick.dx;
    if (keys.arrowup || keys.w) fw = 1;
    if (keys.arrowdown || keys.s) fw = -0.7;
    if (keys.arrowleft || keys.a) tr = -1;
    if (keys.arrowright || keys.d) tr = 1;
    if (Math.abs(fw) < 0.15) fw = 0;
    if (Math.abs(tr) < 0.15) tr = 0;
    fw *= Math.abs(fw); tr *= Math.abs(tr);
    p.a += tr * 1.4 * dt;
    let sp = S.role == 'owl' ? 2.1 : 1.3;
    if (S.role == 'bear' && T.FLOOR[T.I(p.x | 0, p.y | 0)] == 2) sp *= 0.55;
    const vx = Math.cos(p.a) * fw * sp * dt, vy = Math.sin(p.a) * fw * sp * dt;
    if (free(S.role, p.x + vx, p.y)) p.x += vx;
    if (free(S.role, p.x, p.y + vy)) p.y += vy;
    const R = S.role == 'owl' ? 5 : 2;
    for (let y = Math.max(0, (p.y | 0) - R); y <= Math.min(N - 1, (p.y | 0) + R); y++)
      for (let x = Math.max(0, (p.x | 0) - R); x <= Math.min(N - 1, (p.x | 0) + R); x++) {
        const i = T.I(x, y);
        if (!S.seen[i] && (x + 0.5 - p.x) ** 2 + (y + 0.5 - p.y) ** 2 < R * R) { S.seen[i] = 1; S.newSeen.push(i); }
      }
    // posisi teman (dari iPad lain) digeser halus
    if (S.remote) {
      const o = S.players[other(S.role)], k = Math.min(1, dt * 10);
      o.x += (S.remote.x - o.x) * k; o.y += (S.remote.y - o.y) * k;
      let da = S.remote.a - o.a; da = Math.atan2(Math.sin(da), Math.cos(da)); o.a += da * k;
    }
  }

  // ---------- aksi pemain ----------
  const atSarang = () => Math.hypot(S.players.bear.x - T.SARANG.x, S.players.bear.y - T.SARANG.y) < 2.8;
  function nearVictim(who, r) {
    const p = S.players[who];
    let best = null, bd = r;
    for (const v of S.world.vics) {
      if (v.rescued) continue;
      const d = Math.hypot(v.x - p.x, v.y - p.y);
      if (d < bd) { bd = d; best = v; }
    }
    return best;
  }
  function context() {
    if (S.role != 'bear') return null;
    if (atSarang()) return { lbl: 'Ambil alat', f: openTools };
    const b = S.players.bear;
    const v = S.world.vics.find((q) => !q.rescued && Math.hypot(q.x - b.x, q.y - b.y) < T.vicById[q.id].reach);
    if (v) return { lbl: 'Tolong', f: () => act({ k: 'rescue', id: v.id }) };
    return null;
  }
  function doA() { const c = context(); if (c) { T.audio.sfx('tap'); c.f(); } }
  function doMark() {
    if (S.role != 'owl') return;
    const v = nearVictim('owl', 5.5), o = S.players.owl;
    const s = v ? { x: v.x, y: v.y } : { x: o.x, y: o.y };
    act({ k: 'mark', x: s.x, y: s.y });
  }
  function swap() {
    S.role = other(S.role);
    updateHUD(); roleToast();
  }

  // ---------- HUD ----------
  function updateHUD() {
    if (!S.world) return;
    const owl = S.role == 'owl';
    $('roleChip').textContent = owl ? '🦉 Tutu' : '🐻 Siberat';
    $('count').textContent = S.world.saved + '/' + T.VICTIMS.length;
    $('markBtn').hidden = !owl;
    $('aBtn').hidden = owl;
    $('bag').hidden = owl;
    renderBag($('bag'));
  }
  const used = () => S.world.bag.reduce((s, id) => s + T.toolById[id].w, 0);
  function renderBag(el) {
    let h = '<span class="lbl">🎒 Tas</span>', u = 0;
    for (const id of S.world.bag) { const t = T.toolById[id]; u += t.w; h += `<div class="slot ${t.w == 2 ? 'w2' : ''}" title="${t.n}">${t.e}</div>`; }
    for (let i = u; i < T.BAG_SIZE; i++) h += '<div class="slot empty"></div>';
    el.innerHTML = h;
  }
  function openTools() {
    const g = $('toolGrid');
    g.innerHTML = '';
    for (const t of T.TOOLS) {
      const b = document.createElement('button');
      b.type = 'button'; b.className = 'tool'; b.dataset.id = t.id;
      b.innerHTML = `${t.w == 2 ? '<i>besar</i>' : ''}${t.e}<span>${t.n}</span>`;
      b.onclick = () => {
        const bag = S.world.bag.slice();
        if (bag.includes(t.id)) { bag.splice(bag.indexOf(t.id), 1); T.audio.sfx('drop'); }
        else if (used() + t.w <= T.BAG_SIZE) { bag.push(t.id); T.audio.sfx('pick'); }
        else { T.audio.sfx('wrong'); return; }
        act({ k: 'bag', bag });
        refreshTools();
      };
      g.appendChild(b);
    }
    refreshTools();
    $('toolModal').hidden = false;
  }
  function refreshTools() {
    for (const b of $('toolGrid').children) {
      const id = b.dataset.id, t = T.toolById[id], sel = S.world.bag.includes(id);
      b.classList.toggle('sel', sel);
      b.classList.toggle('no', !sel && used() + t.w > T.BAG_SIZE);
    }
    renderBag($('bagModal')); renderBag($('bag'));
  }
  function openMap() {
    const c = $('mapc'), x = c.getContext('2d'), k = 4;
    x.fillStyle = '#04050b'; x.fillRect(0, 0, 160, 160);
    for (let j = 0; j < N; j++) for (let i = 0; i < N; i++) {
      const id = T.I(i, j);
      if (!S.seen[id]) continue;
      const w = T.WALL[id];
      x.fillStyle = w == 3 ? '#e6ff8a' : w == 1 ? '#1d4a28' : w == 2 ? '#4a4a58' : T.MAPC[T.FLOOR[id]];
      x.fillRect(i * k, j * k, k, k);
    }
    x.fillStyle = '#ffcf4a';
    for (const s of S.world.stars) { x.fillRect(s.x * k - 3, s.y * k - 1, 6, 2); x.fillRect(s.x * k - 1, s.y * k - 3, 2, 6); }
    const dot = (p, col) => {
      x.fillStyle = col; x.beginPath(); x.arc(p.x * k, p.y * k, 3, 0, 7); x.fill();
      x.strokeStyle = col; x.beginPath(); x.moveTo(p.x * k, p.y * k); x.lineTo(p.x * k + Math.cos(p.a) * 7, p.y * k + Math.sin(p.a) * 7); x.stroke();
    };
    dot(S.players.owl, '#ffd84a'); dot(S.players.bear, '#b07a4a');
    $('mapModal').hidden = false;
  }

  let toastT = 0;
  function showToast(h, p, ms) {
    const t = $('toast');
    t.innerHTML = `<h3>${h}</h3><p>${p}</p>`;
    t.hidden = false;
    clearTimeout(toastT);
    toastT = setTimeout(() => (t.hidden = true), ms);
  }
  function hudTick() {
    const b = $('bubble');
    let txt = '', cls = 'bubble';
    if (S.role == 'owl') {
      const v = nearVictim('owl', 4.2);
      if (v) {
        const p = S.players.owl;
        let d = Math.atan2(v.y - p.y, v.x - p.x) - p.a; d = Math.atan2(Math.sin(d), Math.cos(d));
        if (Math.abs(d) < 0.7) {
          txt = '🦉 ' + T.vicById[v.id].say;
          if (!S.heard[v.id]) { S.heard[v.id] = 1; T.audio.sfx('hoot'); }
        }
      }
    } else {
      if (nearVictim('bear', 3.2)) { txt = '🔊 Ada suara minta tolong di dekat sini!'; cls = 'bubble hear'; }
      else if (atSarang()) txt = '🌳 Pohon Sarang. Tekan A untuk mengambil alat.';
    }
    if (b.textContent !== txt) { b.textContent = txt; b.className = cls; b.hidden = !txt; }
    const c = context(), a = $('aBtn');
    a.classList.toggle('glow', !!c);
    const l = c ? c.lbl : ' ';
    if ($('aLbl').textContent !== l) $('aLbl').textContent = l;
  }

  // ---------- tombol ----------
  const tap = () => { T.audio.unlock(); T.audio.sfx('tap'); };
  $('twoBtn').onclick = () => { tap(); show('two'); };
  $('soloBtn').onclick = () => { tap(); S.mode = 'solo'; S.role = 'owl'; beginOwn(); enterPlay(); };
  $('resetBtn').onclick = () => { tap(); try { localStorage.removeItem(SAVE_KEY); } catch (e) {} S.world = null; titleScreen(); };
  $('hostBtn').onclick = () => { tap(); show('rolePick'); };
  $('joinBtn').onclick = () => { tap(); S.mode = 'guest'; codeIn = []; drawCodeIn(); $('joinStatus').className = 'status'; $('joinStatus').innerHTML = '&nbsp;'; show('joinPick'); };
  for (const b of document.querySelectorAll('.pick')) b.onclick = () => { tap(); S.mode = 'host'; S.role = b.dataset.role; beginOwn(); openRoom(); };
  $('startEarly').onclick = () => { tap(); enterPlay(); };
  const keyBox = $('codeKeys');
  T.CODE_ICONS.forEach((ic, i) => {
    const b = document.createElement('button');
    b.type = 'button'; b.textContent = ic;
    b.onclick = () => { if (codeIn.length >= 4 || T.net.peer) return; tap(); codeIn.push(i); drawCodeIn(); if (codeIn.length == 4) tryJoin(); };
    keyBox.appendChild(b);
  });
  $('codeDel').onclick = () => { if (T.net.peer) return; codeIn.pop(); drawCodeIn(); };
  for (const b of document.querySelectorAll('.back')) b.onclick = () => {
    tap();
    const cur = screens.find((s) => !$(s).hidden);
    if (cur == 'two') titleScreen();
    else if (cur == 'rolePick') show('two');
    else if (cur == 'hostWait') { T.net.stop(); show('two'); }
    else if (cur == 'joinPick') { T.net.stop(); show('two'); }
  };
  $('soundBtn').onclick = () => { T.audio.unlock(); const on = T.audio.toggle(); $('soundBtn').style.opacity = on ? 1 : 0.45; };
  $('soundBtn').style.opacity = T.audio.on ? 1 : 0.45;
  $('mapBtn').onclick = () => { tap(); openMap(); };
  $('mapClose').onclick = () => { tap(); $('mapModal').hidden = true; };
  $('swapBtn').onclick = () => { tap(); swap(); };
  $('markBtn').onclick = () => { T.audio.unlock(); doMark(); };
  $('aBtn').onclick = () => { T.audio.unlock(); doA(); };
  $('toolDone').onclick = () => { tap(); $('toolModal').hidden = true; };
  $('menuBtn').onclick = () => {
    tap();
    $('menuInfo').textContent = S.mode == 'guest' ? 'Progres disimpan di iPad teman (pembuat ruangan).' : 'Progres tersimpan otomatis di iPad ini.';
    $('menu').hidden = false;
  };
  $('resumeBtn').onclick = () => { tap(); $('menu').hidden = true; };
  $('quitBtn').onclick = () => { tap(); save(); titleScreen(); };
  $('endHome').onclick = () => { tap(); save(); titleScreen(); };
  $('againBtn').onclick = () => {
    tap();
    freshWorld(); save();
    S.heard = {};
    if (S.mode == 'host') T.net.send({ t: 'reset', world: S.world, players: S.players });
    $('endModal').hidden = true;
    updateHUD(); roleToast();
  };

  // ---------- putaran utama ----------
  let last = performance.now(), sendT = 0, seenT = 0, saveT = 0;
  function loop(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now; S.t += dt;
    if (S.scene == 'play') {
      if (!modalOpen()) step(dt);
      renderer.draw({ role: S.role, p: S.players[S.role], other: S.players[other(S.role)], world: S.world, t: S.t });
      hudTick();
      if (multi() && T.net.connected()) {
        sendT += dt; seenT += dt;
        if (sendT > 0.08) { sendT = 0; const p = S.players[S.role]; T.net.send({ t: 'pos', x: +p.x.toFixed(3), y: +p.y.toFixed(3), a: +p.a.toFixed(3) }); }
        if (seenT > 0.6 && S.newSeen.length) { seenT = 0; T.net.send({ t: 'seen', a: S.newSeen.splice(0) }); }
      } else S.newSeen.length = 0;
      // detak: tanpa kabar dari teman 4 detik = terputus (mis. iPad teman terkunci); tamu lalu menyambung ulang
      if (multi()) {
        const quiet = now - S.lastMsg;
        if (S.netOk !== false && quiet > 4000) updateNet(false);
        if (S.mode == 'guest' && quiet > 8000 && T.net.connected()) { S.lastMsg = now; try { T.net.conn.close(); } catch (e) {} }
      }
      saveT += dt;
      if (saveT > 5) { saveT = 0; save(); }
    } else if (S.world) {
      // layar judul: kamera berputar pelan di depan Pohon Sarang
      renderer.draw({ role: 'owl', p: { x: 18, y: 25.5, a: -Math.PI / 2 + Math.sin(S.t * 0.15) * 0.9 }, other: null, world: S.world, t: S.t });
    }
    requestAnimationFrame(loop);
  }

  T.debug = {
    place(x, y, a) { const p = S.players[S.role]; p.x = x; p.y = y; if (a != null) p.a = a; },
    act, applyAct, swap, openMap, openTools, doA, doMark,
  };

  titleScreen();
  requestAnimationFrame(loop);
})();
