// Mesin jelajah: berjalan (analog melayang), kamera, pintu, NPC, musuh di peta, dialog
(function () {
  const $ = PM.$, el = PM.el;
  let W = null;          // keadaan jelajah
  let raf = 0, last = 0;

  // ---------- geometri ----------
  function inPoly(x, y, poly) {
    let ins = false;
    for (let i = 0, j = poly.length - 1; i < poly.length; j = i++) {
      const [xi, yi] = poly[i], [xj, yj] = poly[j];
      if ((yi > y) !== (yj > y) && x < ((xj - xi) * (y - yi)) / (yj - yi) + xi) ins = !ins;
    }
    return ins;
  }
  function walkable(m, x, y) {
    if (!inPoly(x, y, m.walk)) return false;
    for (const [bx, by, rx, ry] of m.block || []) { const dx = (x - bx) / rx, dy = (y - by) / ry; if (dx * dx + dy * dy < 1) return false; }
    for (const n of W.npcs) { const dx = (x - n.x) / 48, dy = (y - n.y) / 26; if (dx * dx + dy * dy < 1) return false; }
    return true;
  }
  const dist = (a, b) => Math.hypot(a.x - b.x, (a.y - b.y) * 1.4);

  // ---------- sprite di peta ----------
  function sprite(src, h, cls) {
    const s = el('div', 'wsh', '', W.layer), i = el('img', 'wspr ' + (cls || ''), null, W.layer);
    i.src = src; i.style.height = h + 'px'; s.style.width = h * 0.75 + 'px'; s.style.height = h * 0.22 + 'px';
    return { img: i, sh: s, h };
  }
  function place(o, x, y, bob) {
    const z = W.m.zoom, sx = x * z, sy = y * z;
    o.img.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -100%) translateY(${-(bob || 0)}px)${o.flip ? ' scaleX(-1)' : ''}`;
    o.img.style.zIndex = Math.round(sy);
    o.sh.style.transform = `translate(${sx}px, ${sy}px) translate(-50%, -50%)`;
  }
  const charImg = (key, dir) => (key === 'ata' ? PM.ataSrc(dir) : (PM.IMG[key + '/' + dir + '.png'] || {}).src);
  const dirOf = (dx, dy) => (Math.abs(dx) > Math.abs(dy) * 0.8 ? (dx > 0 ? 'kanan' : 'kiri') : dy > 0 ? 'depan' : 'belakang');

  // ---------- membangun peta ----------
  function build(mapId, at, face) {
    const m = PM.MAPS[mapId], z = m.zoom, im = PM.IMG['peta/' + m.img + '.jpg'];
    const root = $('explore'); root.innerHTML = ''; root.classList.remove('hide');
    W.m = m; W.mapId = mapId; W.W = im.width * z; W.H = im.height * z;
    W.layer = el('div', 'wlayer', '', root);
    const p = el('img', 'wpeta', null, W.layer); p.src = im.src; p.style.width = W.W + 'px';
    const unit = m.ataH * z;  // tinggi Ata di layar
    W.ata = Object.assign(sprite(charImg('ata', face || 'depan'), unit), { key: 'ata', x: at[0], y: at[1], dir: face || 'depan' });
    W.trail = []; for (let i = 0; i < 60; i++) W.trail.push([at[0], at[1]]);
    W.follow = PM.party().filter((k) => k !== 'ata').sort((p, q) => (p === 'ladhia') - (q === 'ladhia')).map((k) => Object.assign(sprite(charImg(k, face || 'depan'), unit * PM.WALK_SCALE[k]), { key: k, x: at[0], y: at[1], dir: face || 'depan' }));
    W.npcs = (m.npcs || []).filter((n) => !(n.id === 'nenek' && mapId !== 'rumah-nenek')).map((n) =>
      Object.assign(sprite(charImg(n.id, n.pose), unit * PM.WALK_SCALE[n.id]), { id: n.id, x: n.x, y: n.y, r: n.r, npc: true }));
    W.foes = [];
    if (mapId === 'desa-akar') spawnFoes();
    // HUD
    const hud = el('div', 'whud', '', root);
    W.areaBox = el('div', 'box warea', `${m.name}<small>${m.sub}</small>`, hud);
    W.goalBox = el('div', 'box wgoal', '', hud);
    W.wallet = el('div', 'box wwallet', '', hud);
    const back = el('button', 'btn wmenu', '🏠', hud); PM.tap(back, () => PM.explore.leave());
    const tim = el('button', 'btn wtim', '👥 Tim', hud); PM.tap(tim, () => PM.explore.leave('tim'));
    W.stickBase = el('div', 'stick hide', '<div class="knob"></div>', root);
    W.btnA = el('div', 'btnA', 'A', root);
    W.btnA.addEventListener('pointerdown', (e) => { e.stopPropagation(); PM.audioUnlock(); pressA(); });
    W.hint = el('div', 'box whint hide', '', root);
    W.labels = el('div', 'wlabels', '', W.layer);
    refreshHud();
    camera(true);
    PM.S.story.map = mapId; PM.S.story.x = at[0]; PM.S.story.y = at[1]; PM.save();
  }
  function refreshHud() {
    W.goalBox.innerHTML = '🎯 ' + PM.goal(PM.S.story.st);
    W.wallet.innerHTML = `🪙 ${PM.S.koin} &nbsp; 🍯 ${PM.S.madu}`;
  }

  function spawnFoes() {
    const st = PM.S.story.st;
    if (st >= 2) PM.DESA_GROUPS.forEach((gp) => {
      if (st < 4 ? PM.S.story.beat[gp.id] : W.beatNow[gp.id]) return;
      const E = PM.ENEMIES[gp.lead], h = (E.h / 113) * W.m.ataH * W.m.zoom * 0.95;
      const f = Object.assign(sprite(PM.foeSrc(E.spr), h), { gp, x: gp.x, y: gp.y, hx: gp.x, hy: gp.y, tx: gp.x, ty: gp.y, fx: E.flip ? -1 : 1, base: E.flip ? -1 : 1, wait: 0, chase: false, stun: 0, fly: E.fly ? 10 : 0 });
      f.mark = el('div', 'wmark hide', '❗', W.layer);
      W.foes.push(f);
    });
    if (st === 3 && !W.bossGone) {
      const E = PM.ENEMIES['raja-kumbang'], h = W.m.ataH * W.m.zoom * 2.1;
      const b = Object.assign(sprite(PM.foeSrc(E.spr), h, 'flip'), { boss: true, x: PM.BOSS_SPOT.x, y: PM.BOSS_SPOT.y });
      b.mark = el('div', 'wmark', '💥', W.layer);
      W.foes.push(b);
    }
  }

  // ---------- kamera ----------
  function camera(snap) {
    const z = W.m.zoom, tx = Math.max(0, Math.min(W.W - 1200, W.ata.x * z - 600)), ty = Math.max(0, Math.min(W.H - 840, W.ata.y * z - 470));
    W.cx = snap || W.cx == null ? tx : W.cx + (tx - W.cx) * 0.15;
    W.cy = snap || W.cy == null ? ty : W.cy + (ty - W.cy) * 0.15;
    W.layer.style.transform = `translate(${-W.cx}px, ${-W.cy}px)`;
  }

  // ---------- analog melayang ----------
  const stagePt = (e) => { const r = $('stage').getBoundingClientRect(); return [(e.clientX - r.left) / PM.scale, (e.clientY - r.top) / PM.scale]; };
  function bindInput() {
    const root = $('explore');
    root.addEventListener('pointerdown', (e) => {
      if (!W || W.busy) { if (W && W.talkNext) W.talkNext(); return; }
      if (e.target.closest('button, .btnA')) return;
      e.preventDefault(); PM.audioUnlock();
      const [x, y] = stagePt(e);
      if (x > 720) return;
      W.stick = { id: e.pointerId, ox: x, oy: y, vx: 0, vy: 0 };
      Object.assign(W.stickBase.style, { left: x - 75 + 'px', top: y - 75 + 'px' }); W.stickBase.classList.remove('hide');
      W.stickBase.firstChild.style.transform = 'translate(0,0)';
    });
    const move = (e) => {
      if (!W || !W.stick || e.pointerId !== W.stick.id) return;
      const [x, y] = stagePt(e); let dx = x - W.stick.ox, dy = y - W.stick.oy; const d = Math.hypot(dx, dy), R = 70;
      if (d > R) { dx *= R / d; dy *= R / d; }
      W.stick.vx = dx / R; W.stick.vy = dy / R;
      W.stickBase.firstChild.style.transform = `translate(${dx}px, ${dy}px)`;
    };
    const up = (e) => { if (W && W.stick && e.pointerId === W.stick.id) { W.stick = null; W.stickBase.classList.add('hide'); } };
    addEventListener('pointermove', move); addEventListener('pointerup', up); addEventListener('pointercancel', up);
  }

  // ---------- langkah ----------
  function step(dt) {
    const m = W.m, a = W.ata;
    let vx = 0, vy = 0;
    if (W.stick && !W.busy) { vx = W.stick.vx; vy = W.stick.vy; const d = Math.hypot(vx, vy); if (d < 0.2) { vx = vy = 0; } }
    W.moving = !!(vx || vy);
    if (W.moving) {
      const sp = m.speed * dt, nx = a.x + vx * sp, ny = a.y + vy * sp * 0.85;
      if (walkable(m, nx, ny)) { a.x = nx; a.y = ny; } else if (walkable(m, nx, a.y)) a.x = nx; else if (walkable(m, a.x, ny)) a.y = ny;
      const d = dirOf(vx, vy); if (d !== a.dir) { a.dir = d; a.img.src = charImg('ata', d); }
      const lt = W.trail[0]; if (Math.hypot(lt[0] - a.x, lt[1] - a.y) > 2.5) { W.trail.unshift([a.x, a.y]); W.trail.length = 60; }
    }
    W.t += dt;
    const bob = W.moving ? Math.abs(Math.sin(W.t * 11)) * 5 : 0;
    place(a, a.x, a.y, bob);
    W.follow.forEach((f, i) => {
      const [tx, ty] = W.trail[Math.min(59, f.key === 'ladhia' ? 16 + 20 * i : 13 + 12 * i)];
      const dx = tx - f.x, dy = ty - f.y;
      if (Math.hypot(dx, dy) > 1) { const d = dirOf(dx, dy); if (d !== f.dir) { f.dir = d; f.img.src = charImg(f.key, d); } }
      f.x += dx * 0.25; f.y += dy * 0.25;
      place(f, f.x, f.y, W.moving ? Math.abs(Math.sin(W.t * 11 + i + 1)) * 4 : 0);
    });
    W.npcs.forEach((n) => place(n, n.x, n.y, 0));
    stepFoes(dt);
    if (!W.busy) checkDoors();
    nearHint();
    camera();
  }

  function stepFoes(dt) {
    const a = W.ata;
    for (const f of W.foes) {
      if (f.boss) { place(f, f.x, f.y, Math.abs(Math.sin(W.t * 2)) * 4); placeMark(f); if (!W.busy && dist(f, a) < 95) touchBoss(); continue; }
      if (f.stun > 0) f.stun -= dt;
      const d = dist(f, a);
      f.chase = !W.busy && f.stun <= 0 && d < 170;
      let tx = f.tx, ty = f.ty, sp = 38;
      if (f.chase) { tx = a.x; ty = a.y; sp = 62; }
      else if (Math.hypot(f.tx - f.x, f.ty - f.y) < 6) {
        f.wait -= dt;
        if (f.wait <= 0) { const ang = Math.random() * 6.28, r = Math.random() * f.gp.home; f.tx = f.hx + Math.cos(ang) * r; f.ty = f.hy + Math.sin(ang) * r * 0.6; f.wait = 1 + Math.random() * 2; }
        tx = f.x; ty = f.y;
      }
      const dx = tx - f.x, dy = ty - f.y, dd = Math.hypot(dx, dy);
      if (dd > 2 && !W.busy) {
        const nx = f.x + (dx / dd) * sp * dt, ny = f.y + (dy / dd) * sp * dt;
        if (walkable(W.m, nx, ny)) { f.x = nx; f.y = ny; } else { f.tx = f.hx; f.ty = f.hy; }
        const fx = dx > 0 ? 1 : -1; if (Math.abs(dx) > 1 && fx !== f.fx) f.fx = fx;
      }
      f.flip = f.fx !== f.base;
      place(f, f.x, f.y, f.fly ? 10 + Math.sin(W.t * 8) * 6 : Math.abs(Math.sin(W.t * 6)) * 2);
      f.mark.classList.toggle('hide', !f.chase); placeMark(f);
      if (!W.busy && f.stun <= 0 && d < 55) touchFoe(f);
    }
  }
  function placeMark(f) {
    const z = W.m.zoom; f.mark.style.transform = `translate(${f.x * z}px, ${f.y * z - f.h - 18}px) translate(-50%, -100%)`; f.mark.style.zIndex = 99999;
  }

  // ---------- interaksi ----------
  function nearest() {
    const a = W.ata, m = W.m, list = [];
    W.npcs.forEach((n) => list.push({ kind: 'npc', id: n.id, d: dist(a, n), r: n.r, label: n.id === 'nenek' ? '💬 Nenek' : '💬 Guru Panda' }));
    (m.spots || []).forEach((s) => list.push({ kind: 'spot', id: s.id, d: dist(a, s), r: s.r, label: s.label }));
    const near = list.filter((x) => x.d < x.r).sort((p, q) => p.d - q.d);
    return near[0] || null;
  }
  function nearHint() {
    const n = W.busy ? null : nearest();
    W.btnA.classList.toggle('glow', !!n);
    W.hint.classList.toggle('hide', !n);
    if (n) W.hint.innerHTML = n.label + ' — tekan <b>A</b>';
  }
  async function pressA() {
    if (!W || W.busy) { if (W && W.talkNext) W.talkNext(); return; }
    const n = nearest(); if (!n) return;
    PM.sfx('pilih');
    await PM.story.interact(n.kind, n.id);
  }
  function checkDoors() {
    for (const d of W.m.doors || []) {
      if (Math.hypot(W.ata.x - d.x, W.ata.y - d.y) < d.r) { go(d.to, d.at, d.face); return; }
    }
  }
  async function go(mapId, at, face) {
    W.busy = true; W.stick = null; W.stickBase.classList.add('hide');
    const f = $('fade'); f.classList.add('on'); await PM.wait(250);
    W.beatNow = {}; W.bossGone = false;
    build(mapId, at, face); await PM.wait(50);
    f.classList.remove('on'); W.busy = false;
    await PM.story.enter(mapId);
  }

  // ---------- bertemu musuh ----------
  async function touchFoe(f) {
    W.busy = true; W.stick = null; W.stickBase.classList.add('hide');
    // Ata di belakang musuh (berlawanan arah hadap) = Serangan Kejutan
    const behind = (W.ata.x - f.x) * f.fx < 0;
    const surprise = behind && !f.chase ? 'party' : f.chase && !behind ? 'foe' : null;
    const base = PM.ENCOUNTERS.find((e) => e.id === f.gp.enc) || PM.STORY_ENC[f.gp.enc];
    const names = [...new Set(base.foes.map((k) => PM.ENEMIES[k].name))].join(' dan ');
    const enc = Object.assign({}, base, { bg: 'halaman-dojo', surprise, name: 'Desa Akar', intro: names + ' masuk ke Desa Akar! Usir mereka!' });
    const r = await PM.explore.fight(enc);
    if (r === 'win') { W.beatNow[f.gp.id] = 1; PM.S.story.beat[f.gp.id] = 1; PM.save(); }
    await PM.story.afterFight(r, f);
  }
  async function touchBoss() {
    W.busy = true; W.stick = null; W.stickBase.classList.add('hide');
    await PM.say(PM.SCRIPT.rajaBicara);
    const enc = Object.assign({}, PM.ENCOUNTERS.find((e) => e.id === 'p3'));
    const r = await PM.explore.fight(enc);
    await PM.story.afterFight(r, { boss: true });
  }

  // ---------- dialog ----------
  const WHO = { nenek: 'Nenek', guru: 'Guru Panda', ata: 'Ata', sys: '' };
  PM.say = function (lines) {
    return new Promise(async (res) => {
      const wasBusy = W && W.busy; if (W) { W.busy = true; W.stick = null; W.stickBase && W.stickBase.classList.add('hide'); }
      const box = el('div', 'box talk', '', $('stage'));
      for (const [who, pose, text] of lines) {
        const src = who === 'sys' ? '' : who === 'ata' ? PM.ataSrc('wajah') : (PM.IMG[who + '/' + pose + '.png'] || {}).src;
        box.className = 'box talk' + (who === 'sys' ? ' sys' : '');
        box.innerHTML = (src ? `<img src="${src}">` : '') + `<div class="tt">${WHO[who] ? `<b>${WHO[who]}:</b> ` : ''}${text}</div><div class="next">▼ ketuk</div>`;
        await new Promise((r) => {
          let ok = false; setTimeout(() => (ok = true), 350);
          const nx = () => { if (!ok) return; if (W) W.talkNext = null; box.removeEventListener('pointerdown', nx); PM.sfx('pilih'); r(); };
          box.addEventListener('pointerdown', nx); if (W) W.talkNext = nx;
        });
      }
      box.remove(); if (W) { W.talkNext = null; W.busy = wasBusy; }
      res();
    });
  };

  // ---------- loop ----------
  function loop(t) {
    if (!W || W.paused) { raf = 0; return; }
    const dt = Math.min(0.05, (t - last) / 1000 || 0); last = t;
    step(dt);
    raf = requestAnimationFrame(loop);
  }
  let bound = false;
  PM.explore = {
    async start() {
      if (!bound) { bindInput(); bound = true; }
      const s = PM.S.story;
      W = { busy: false, t: 0, beatNow: {}, bossGone: false };
      build(s.map, [s.x, s.y], 'depan');
      W.paused = false; last = performance.now(); if (!raf) raf = requestAnimationFrame(loop);
      await PM.story.enter(s.map, true);
    },
    pause() { if (W) W.paused = true; $('explore').classList.add('hide'); },
    resume() { if (!W) return; W.paused = false; $('explore').classList.remove('hide'); W.ata.img.src = charImg('ata', W.ata.dir); refreshHud(); last = performance.now(); if (!raf) raf = requestAnimationFrame(loop); },
    leave(to) { if (W) W.paused = true; $('explore').classList.add('hide'); $('explore').innerHTML = ''; W = null; PM.toTitle(to); },
    rebuild() { const a = W.ata; build(W.mapId, [a.x, a.y], a.dir); },
    teleport(mapId, at, face) { return go(mapId, at, face); },
    get W() { return W; },
    set busy(v) { if (W) W.busy = v; },
    refreshHud: () => W && refreshHud(),
    push(f, k) { if (!W) return; const dx = W.ata.x - f.x, dy = W.ata.y - f.y, d = Math.hypot(dx, dy) || 1; f.stun = k; const nx = W.ata.x + (dx / d) * 40, ny = W.ata.y + (dy / d) * 30; if (walkable(W.m, nx, ny)) { W.ata.x = nx; W.ata.y = ny; } },
    removeFoe(f) { if (!W) return; W.foes = W.foes.filter((x) => x !== f); f.img.remove(); f.sh.remove(); f.mark && f.mark.remove(); },
  };
})();
