'use strict';
/* Ata dan Madu Legendaris — mesin game taktik isometrik. */
(() => {
  const TW = 64, TH = 32, HS = 16;
  const DIRS = [[1, 0], [0, 1], [-1, 0], [0, -1]]; // 0 depan-kanan, 1 depan-kiri, 2 belakang-kiri, 3 belakang-kanan
  const BLOCK = new Set(['w', 'o', 't', 'p', 'r', 'h', 'k', 's', 'J', 'L']);
  const $ = s => document.querySelector(s);
  const cv = $('#cv'), ctx = cv.getContext('2d');
  const scr = $('#scr'), hud = $('#hud'), panel = $('#panel'), dlg = $('#dlg'), bannerEl = $('#banner'), tipEl = $('#tip');
  let VW = 0, VH = 0, DPR = 1;
  let G = null;
  const cam = { x: 0, y: 0, z: 2, tx: null, ty: null };
  const now = () => performance.now() / 1000;
  const wait = ms => new Promise(r => setTimeout(r, ms));
  const clamp = (v, a, b) => Math.max(a, Math.min(b, v));
  const key = (x, y) => x + ',' + y;

  /* ---------------- Simpan & muat ---------------- */
  const SKEY = 'ata-taktik-v1';
  function defSave() { return { cleared: {}, stars: {}, madu: 0, lvl: { ata: 1, ladhia: 1, bubunti: 1, oumaldi: 1 }, seen: {}, snd: { voice: true, sfx: true, music: true } }; }
  let S = defSave();
  try { const r = localStorage.getItem(SKEY); if (r) { const o = JSON.parse(r); S = Object.assign(defSave(), o); S.lvl = Object.assign(defSave().lvl, o.lvl || {}); } } catch (e) {}
  function persist() { try { localStorage.setItem(SKEY, JSON.stringify(S)); } catch (e) {} }
  Object.assign(Sound.st, S.snd);
  const JOIN = { ladhia: 'm3', bubunti: 'm6', oumaldi: 'b2m4' };
  const recruited = k => k === 'ata' || !!S.cleared[JOIN[k]];
  const unlockedIdx = () => { let i = 0; while (i < MISSIONS.length && S.cleared[MISSIONS[i].id]) i++; return Math.min(i, MISSIONS.length - 1); };
  function charStats(k, l) { const b = CHARS[k]; return { hp: b.hp + 3 * (l - 1), atk: b.atk + (l - 1), def: b.def + Math.floor((l - 1) / 2), mov: b.mov }; }
  const lvlCost = l => 6 + l * 6;
  function teamLv() { const ks = Object.keys(CHARS).filter(recruited); return Math.max(1, Math.floor(ks.reduce((a, k) => a + (S.lvl[k] || 1), 0) / (ks.length || 1))); }

  /* ---------------- Helper DOM ---------------- */
  function h(tag, attrs = {}, ...kids) {
    const e = document.createElement(tag);
    for (const [k, v] of Object.entries(attrs || {})) {
      if (k === 'class') e.className = v;
      else if (k === 'style') e.style.cssText = v;
      else if (k.startsWith('on')) e.addEventListener(k.slice(2), v);
      else if (v !== false && v != null) e.setAttribute(k, v);
    }
    for (const c of kids.flat()) if (c != null && c !== false) e.append(c.nodeType ? c : document.createTextNode(c));
    return e;
  }
  function btn(label, fn, cls = '') {
    return h('button', { class: 'btn ' + cls, onclick: (ev) => { ev.stopPropagation(); Sound.resume(); Sound.play('tap'); fn(ev); } }, label);
  }
  function portrait(kind, size = 56) { return SPR.portrait(kind, size); }
  function stars(n, total = 3) { return '★'.repeat(n) + '☆'.repeat(total - n); }

  /* ---------------- Ukuran layar ---------------- */
  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    VW = window.innerWidth; VH = window.innerHeight;
    cv.width = Math.round(VW * DPR); cv.height = Math.round(VH * DPR);
    cv.style.width = VW + 'px'; cv.style.height = VH + 'px';
  }
  window.addEventListener('resize', () => { resize(); if (G) fitCam(true); });
  resize();

  /* ---------------- Peta & unit ---------------- */
  function buildMap(m) {
    const H = m.t.length, W = m.t[0].length, tiles = [];
    for (let y = 0; y < H; y++) { tiles[y] = []; for (let x = 0; x < W; x++) tiles[y][x] = { t: m.t[y][x], h: +(m.h ? m.h[y][x] : 0), x, y, seed: (x * 73 + y * 151) % 97 }; }
    return { w: W, h: H, tiles };
  }
  const iso = (x, y, hh) => [(x - y) * TW / 2, (x + y) * TH / 2 - hh * HS];
  const T = (x, y) => G.map.tiles[y] && G.map.tiles[y][x];
  const walkable = t => t && !BLOCK.has(t.t);
  const canStand = (u, t) => t && (walkable(t) || (u && u.swim && t.t === 'w'));
  const stepCost = (u, t) => (t.t === 'm' && !u.fly && !u.mudOk ? 2 : 1);
  const unitAt = (x, y) => G.units.find(u => !u.gone && u.x === x && u.y === y);
  const dist = (a, b) => Math.abs(a.x - b.x) + Math.abs(a.y - b.y);
  const isFoe = (a, b) => a.team === 'e' ? b.team !== 'e' : b.team === 'e';
  const foesOf = u => G.units.filter(v => v.alive && isFoe(u, v) && (u.team === 'e' || seen(v)));
  function sightOf(u) { if (u.key !== 'oumaldi') return 3; return T(u.x, u.y).h >= 1 ? 6 : 4; }
  function seen(v) { // kabut: musuh terlihat bila dekat dengan teman atau baru saja menyerang
    if (!G.m.fog || v.team !== 'e') return true;
    if (v.reveal >= G.turn) return true;
    return G.units.some(p => p.team === 'p' && p.alive && dist(p, v) <= sightOf(p));
  }
  function fogTile(x, y) { return G.m.fog && !G.units.some(p => p.team === 'p' && p.alive && Math.abs(p.x - x) + Math.abs(p.y - y) <= sightOf(p)); }
  function reveal(e) { if (G.m.fog) e.reveal = G.turn + 1; }
  const pteam = () => G.units.filter(u => u.team === 'p');

  let UID = 0;
  function mkUnit(k, team, x, y, opt = {}) {
    const b = team === 'p' ? CHARS[k] : team === 'e' ? ENEMIES[k] : NPCS[k];
    const lv = team === 'p' ? (recruited(k) ? (S.lvl[k] || 1) : teamLv()) : (opt.lv || 1);
    const u = {
      id: ++UID, key: k, team, name: b.name, x, y, lv, maxhp: b.hp, hp: 0, atk: b.atk, def: b.def, mov: b.mov, jump: b.jump,
      rmin: b.rmin, rmax: b.rmax, fly: !!b.fly, swim: !!b.swim, mudOk: !!b.mudOk, skills: b.skills || [], boss: !!b.boss, ranged: !!b.ranged, madu: b.madu || 0,
      sp: team === 'p' ? 2 : 0, facing: 0, done: false, moved: false, alive: true, gone: false, item: team === 'p' ? 1 : 0,
      buffs: { sabuk: 0, benteng: 0, taunt: 0 }, status: { pedas: 0, tidur: 0, racun: 0 }, aggro: opt.aggro ?? 99, aggroOn: false,
      anim: 'idle', a0: 0, adur: 1, ox: 0, oy: 0, alpha: 1, tw: null, spin: false,
    };
    if (team === 'p') { const s = charStats(k, lv); u.maxhp = s.hp; u.atk = s.atk; u.def = s.def; }
    if (team === 'e' && lv > 1) { u.maxhp += (b.boss ? 6 : 2) * (lv - 1); u.atk += lv - 1; u.def += Math.floor((lv - 1) / 2); }
    u.hp = u.maxhp;
    return u;
  }

  /* ---------------- Pergerakan ---------------- */
  function reach(u) {
    const mov = u.mov + (u.buffs.sabuk > 0 ? 1 : 0);
    const all = new Map(); all.set(key(u.x, u.y), { x: u.x, y: u.y, c: 0, prev: null });
    const q = [[u.x, u.y]];
    while (q.length) {
      let bi = 0; for (let i = 1; i < q.length; i++) if (all.get(key(...q[i])).c < all.get(key(...q[bi])).c) bi = i;
      const [x, y] = q.splice(bi, 1)[0]; const cur = all.get(key(x, y)); if (cur.c >= mov) continue;
      const t0 = T(x, y);
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy, t = T(nx, ny); if (!t) continue;
        const k = key(nx, ny);
        if (!u.fly) { if (!canStand(u, t) || Math.abs(t.h - t0.h) > u.jump) continue; } else if (t.t === 'h' || t.t === 'o') continue;
        const o = unitAt(nx, ny); if (o && o.alive && isFoe(u, o)) continue;
        const c = cur.c + stepCost(u, t); if (c > mov) continue;
        const old = all.get(k); if (old && old.c <= c) continue;
        all.set(k, { x: nx, y: ny, c, prev: key(x, y) }); q.push([nx, ny]);
      }
    }
    const out = new Map();
    for (const [k, v] of all) { if ((v.x === u.x && v.y === u.y) || (canStand(u, T(v.x, v.y)) && !unitAt(v.x, v.y))) out.set(k, v); }
    out.all = all;
    return out;
  }
  function pathTo(r, x, y) { const p = []; let k = key(x, y); while (k) { const v = r.all.get(k); p.unshift([v.x, v.y]); k = v.prev; } return p; }
  function canHitFrom(u, fx, fy, tg, rmin = u.rmin, rmax = u.rmax) {
    const d = Math.abs(fx - tg.x) + Math.abs(fy - tg.y);
    const hu = T(fx, fy).h, ht = T(tg.x, tg.y).h;
    let rx = rmax; if (rmax >= 2 && hu - ht >= (u.key === 'oumaldi' ? 1 : 2)) rx += 1;
    if (d < rmin || d > rx) return false;
    if (d === 1 && !u.fly && Math.abs(hu - ht) > 1) return false;
    return true;
  }
  function faceTo(u, x, y) {
    const dx = x - u.x, dy = y - u.y; if (!dx && !dy) return;
    if (Math.abs(dx) >= Math.abs(dy)) u.facing = dx > 0 ? 0 : 2; else u.facing = dy > 0 ? 1 : 3;
  }
  function nearest(u, list) { let b = null, bd = 1e9; for (const v of list) { const d = dist(u, v); if (d < bd) { bd = d; b = v; } } return b; }
  function faceNearestFoe(u) { const n = nearest(u, foesOf(u)); if (n) faceTo(u, n.x, n.y); }

  /* ---------------- Kerusakan ---------------- */
  function relSide(def, ax, ay) {
    const [fx, fy] = DIRS[def.facing]; const vx = ax - def.x, vy = ay - def.y;
    const dot = fx * vx + fy * vy, cr = Math.abs(fx * vy - fy * vx);
    if (dot > 0 && dot >= cr) return 'front'; if (dot < 0 && -dot >= cr) return 'back'; return 'side';
  }
  const effAtk = u => u.atk + (u.buffs.sabuk > 0 ? 4 : 0);
  function effDef(u) { const t = T(u.x, u.y); return u.def + (u.buffs.benteng > 0 ? 3 : 0) + (t && t.t === 'b' ? 1 : 0); }
  function calcDmg(att, def, opt = {}) {
    const ax = opt.ax ?? att.x, ay = opt.ay ?? att.y;
    const a = opt.flat ?? effAtk(att) * (opt.mult ?? 1);
    let d = effDef(def); if (opt.pierce) d = Math.floor(d / 2);
    const side = relSide(def, ax, ay);
    let f = side === 'back' ? (def.key === 'ladhia' ? 1.2 : 1.5) : side === 'side' ? 1.2 : 1;
    const dh = T(ax, ay).h - T(def.x, def.y).h;
    if (dh > 0) f *= dh >= 2 ? 1.3 : 1.15; else if (dh < 0) f *= 0.9;
    return { dmg: Math.max(1, Math.round((a - d) * f)), side, high: dh > 0 };
  }

  /* ---------------- Efek visual ---------------- */
  function unitWorld(u) {
    let rx = u.x, ry = u.y, rh = T(u.x, u.y).h, hop = 0;
    if (u.tw) {
      const k = clamp((now() - u.tw.t0) / u.tw.dur, 0, 1);
      rx = u.tw.fx + (u.tw.tx - u.tw.fx) * k; ry = u.tw.fy + (u.tw.ty - u.tw.fy) * k;
      rh = u.tw.fh + (u.tw.th - u.tw.fh) * k;
      hop = Math.sin(k * Math.PI) * (u.tw.fh !== u.tw.th ? 14 : 5);
    }
    
    const [sx, sy] = iso(rx, ry, rh);
    return { rx, ry, sx, sy, hop };
  }
  function addText(u, text, color = '#fff', size = 10, delay = 0) {
    const p = unitWorld(u);
    G.texts.push({ x: p.sx, y: p.sy - SPR.height(u.key) - 22, text, color, size, t0: now() + delay, dur: 1.2 });
  }
  function burst(u, colors, n = 10, emoji = null) {
    const p = unitWorld(u); const hh = SPR.height(u.key) * 0.5;
    for (let i = 0; i < n; i++) {
      const a = Math.random() * Math.PI * 2, s = 40 + Math.random() * 80;
      G.parts.push({ x: p.sx, y: p.sy - hh, vx: Math.cos(a) * s, vy: Math.sin(a) * s - 30, t0: now(), life: 0.5 + Math.random() * 0.4, c: colors[i % colors.length], e: emoji });
    }
  }
  function playAnim(u, name, dur) {
    u.anim = name; u.a0 = now(); u.adur = dur / 1000;
    return wait(dur).then(() => { if (u.anim === name && name !== 'faint') { u.anim = 'idle'; u.spin = false; u.pose = null; } });
  }
  async function walk(u, path) {
    for (let i = 1; i < path.length; i++) {
      const [px, py] = path[i - 1], [nx, ny] = path[i];
      u.x = px; u.y = py; faceTo(u, nx, ny);
      const fh = T(px, py).h, th = T(nx, ny).h, dur = fh !== th ? 0.2 : 0.15;
      u.anim = 'walk'; u.tw = { fx: px, fy: py, tx: nx, ty: ny, fh, th, t0: now(), dur };
      focus(u, true);
      Sound.play('step');
      await wait(dur * 1000);
      u.x = nx; u.y = ny; u.tw = null;
    }
    u.anim = 'idle';
  }
  async function projectile(from, to, emoji, dur = 320) {
    const a = unitWorld(from), b = unitWorld(to);
    Sound.play('throw');
    G.projs.push({ ax: a.sx, ay: a.sy - 36, bx: b.sx, by: b.sy - 28, t0: now(), dur: dur / 1000, e: emoji, arc: emoji === 'arrow' ? 20 : 48 });
    await wait(dur);
  }

  /* ---------------- Aksi ---------------- */
  function applyDamage(att, def, r, opt = {}) {
    def.hp = Math.max(0, def.hp - r.dmg);
    Sound.play(opt.sfx || (att.key === 'ata' ? 'kick' : 'hit'));
    addText(def, '-' + r.dmg, def.team === 'e' ? '#fff7d6' : '#ff8a80', 12);
    if (r.side === 'back') addText(def, 'Dari belakang!', '#ffd84d', 7, 0.18);
    else if (r.high) addText(def, 'Dari atas!', '#bde7ff', 7, 0.18);
    burst(def, ['#fff6a0', '#ffffff', '#ffc94d'], 8);
    playAnim(def, 'hurt', 280);
    if (def.team === 'e') { def.aggroOn = true; G.units.forEach(e => { if (e.team === 'e' && e.alive && dist(e, def) <= 4) e.aggroOn = true; }); }
    if (def.hp <= 0) faint(def);
    else if (def.team === 'e' && ENEMIES[def.key].split && !def.didSplit && def.hp <= def.maxhp / 2) {
      def.didSplit = true; addText(def, 'Terbelah!', '#e0c890', 10, 0.3); Sound.play('roar');
      setTimeout(() => { if (!G || G.ended) return; for (let i = 0; i < 2; i++) { const n = spawnUnit(ENEMIES[def.key].split, def.x, def.y); if (n) { burst(n, ['#6e5034', '#9a7a58'], 8); n.fresh = G.phase === 'enemy'; } } renderPanel(); }, 450);
    }
  }
  function faint(u) {
    u.alive = false; u.anim = 'faint'; u.a0 = now(); u.adur = 0.6;
    Sound.play('faint');
    if (u.team === 'e') {
      G.madu += u.madu;
      addText(u, '+' + u.madu + ' 🍯', '#ffd24a', 9, 0.4);
      setTimeout(() => { addText(u, '💨 kabur!', '#ffffff', 8); u.fade = now(); }, 800);
      setTimeout(() => { u.gone = true; }, 1500);
    } else {
      if (u.team === 'p') G.stats.faint++;
      addText(u, 'Pingsan!', '#ffb3b3', 9, 0.3);
    }
  }
  async function hit(att, def, opt = {}) {
    if (!def.alive) return;
    if (def.key === 'ata' && opt.melee && opt.basic && Math.random() < 0.25) {
      Sound.play('dodge'); addText(def, 'Hindar!', '#8fe3ff', 10);
      def.ox = -6; await wait(220); def.ox = 0;
      if (att.alive) {
        faceTo(def, att.x, att.y);
        const p = playAnim(def, 'attack', 360); await wait(200);
        const r = calcDmg(def, att, { mult: 0.6 });
        addText(def, 'Balas!', '#ffd84d', 8);
        applyDamage(def, att, r);
        await p;
      }
      return;
    }
    applyDamage(att, def, calcDmg(att, def, opt), opt);
    await wait(150);
  }
  async function basicAttack(u, t) {
    faceTo(u, t.x, t.y); u.pose = null;
    const far = dist(u, t) > 1;
    const p = playAnim(u, 'attack', 420);
    if (far) { await wait(140); await projectile(u, t, u.key === 'ladhia' ? '⚙️' : u.key === 'oumaldi' ? 'arrow' : (ENEMIES[u.key] && ENEMIES[u.key].proj) || '🪨', 280); } else await wait(250);
    await hit(u, t, { basic: true, melee: !far });
    await p;
  }
  async function useSkill(u, sk, tg) {
    const S_ = SKILLS[sk]; u.sp -= S_.cost; u.pose = sk;
    showSkillName(S_.icon + ' ' + S_.name);
    switch (sk) {
      case 'kilat': {
        faceTo(u, tg.x, tg.y);
        for (let i = 0; i < 2 && tg.alive; i++) {
          const p = playAnim(u, 'attack', 300); await wait(170);
          applyDamage(u, tg, calcDmg(u, tg, { mult: 0.75 })); await p;
        }
        break;
      }
      case 'putar': {
        u.spin = true; Sound.play('whoosh');
        const p = playAnim(u, 'skill', 650); await wait(330);
        const list = foesOf(u).filter(f => dist(f, u) === 1 && Math.abs(T(f.x, f.y).h - T(u.x, u.y).h) <= 1);
        if (!list.length) addText(u, 'Tidak kena siapa-siapa', '#fff', 7);
        list.forEach(f => applyDamage(u, f, calcDmg(u, f, { mult: 1 })));
        await p; u.spin = false; break;
      }
      case 'sabuk': {
        u.buffs.sabuk = 3; Sound.play('power');
        burst(u, ['#ffd84d', '#fff2a8', '#ffffff'], 16);
        addText(u, 'MODE SABUK HITAM!', '#ffd84d', 9);
        await playAnim(u, 'skill', 700); break;
      }
      case 'tantang': {
        u.buffs.taunt = 1; Sound.play('roar');
        addText(u, 'Ayo lawan aku!', '#ff7b54', 9);
        await playAnim(u, 'skill', 600); break;
      }
      case 'benteng': {
        Sound.play('shield');
        const list = G.units.filter(v => v.alive && v.team !== 'e' && dist(v, u) <= 1);
        list.forEach(v => { v.buffs.benteng = 1; addText(v, '+3 🛡️', '#9fd4ff', 9); burst(v, ['#9fd4ff', '#ffffff'], 6); });
        await playAnim(u, 'skill', 600); break;
      }
      case 'sup': {
        if (tg !== u) faceTo(u, tg.x, tg.y);
        const p = playAnim(u, 'skill', 600);
        if (tg !== u) { await wait(200); await projectile(u, tg, '🍲', 300); } else await wait(300);
        const amt = 10 + 2 * (u.lv - 1);
        const real = Math.min(amt, tg.maxhp - tg.hp); tg.hp += real;
        Sound.play('heal'); addText(tg, '+' + real, '#8cff8c', 12); burst(tg, ['#8cff8c', '#e8ffe0', '#ffffff'], 10);
        if (tg.status.tidur > 0 || tg.status.racun > 0) { tg.status.tidur = 0; tg.status.racun = 0; addText(tg, 'Segar kembali!', '#c8ffb8', 8, 0.3); if (tg.sleeping) { tg.sleeping = false; if (tg !== u && !tg.moved) tg.done = false; } }
        await p; break;
      }
      case 'jitu': {
        faceTo(u, tg.x, tg.y);
        const p = playAnim(u, 'skill', 560); await wait(220);
        await projectile(u, tg, 'arrow', 260);
        applyDamage(u, tg, calcDmg(u, tg, { mult: 1.3, pierce: true }));
        await p; break;
      }
      case 'hujan': {
        faceTo(u, tg.x, tg.y);
        const p = playAnim(u, 'skill', 760); await wait(240);
        const list = [tg, ...foesOf(u).filter(f => f !== tg && dist(f, tg) === 1)];
        await Promise.all(list.map((f, i) => wait(i * 70).then(() => projectile(u, f, 'arrow', 300))));
        list.forEach(f => applyDamage(u, f, calcDmg(u, f, { mult: f === tg ? 1 : 0.7 })));
        await p; break;
      }
      case 'pedas': {
        faceTo(u, tg.x, tg.y);
        const p = playAnim(u, 'skill', 520); await wait(180);
        await projectile(u, tg, '🌶️', 340);
        const r = calcDmg(u, tg, { flat: effAtk(u) + 5 + (u.lv - 1), pierce: true });
        applyDamage(u, tg, r, { sfx: 'spicy' });
        burst(tg, ['#ff5a1f', '#ffb21f', '#ff2d2d'], 14);
        if (tg.alive) { tg.status.pedas = 1; addText(tg, 'Kepedasan! 🥵', '#ff9b42', 8, 0.25); }
        await p; break;
      }
    }
  }

  /* ---------------- Mulai misi ---------------- */
  async function startMission(m, opts = {}) {
    UID = 0;
    G = {
      m, map: buildMap(m), units: [], turn: 1, phase: 'intro', sel: null, info: null, mode: 'idle', reach: null,
      targets: null, tkind: null, skill: null, texts: [], parts: [], projs: [], busy: true, ended: false, madu: 0,
      stats: { faint: 0 }, waves: (m.waves || []).map(w => ({ ...w, done: false })), tipsSeen: {}, moveFrom: null,
    };
    for (const [k, x, y] of m.players) G.units.push(mkUnit(k, 'p', x, y));
    for (const [k, x, y] of (m.npcs || [])) { const u = mkUnit(k, 'n', x, y); u.done = true; G.units.push(u); }
    for (const [k, x, y, ag] of m.enemies) G.units.push(mkUnit(k, 'e', x, y, { lv: m.elv || 1, aggro: ag ?? 99 }));
    G.units.forEach(faceNearestFoe);
    G.units.filter(u => u.team === 'n').forEach(u => { u.facing = 0; });
    showBattleUI(); fitCam();
    Sound.startMusic(m.music || 'adventure');
    if (!opts.skipStory && m.pre && !S.seen[m.id + 'pre']) { await playStory(STORY[m.pre]); S.seen[m.id + 'pre'] = true; persist(); }
    await banner('Misi ' + m.no + ': ' + m.name, 'mission');
    for (const t of (m.tips || [])) await showTip(t);
    beginPlayerPhase();
  }
  function beginPlayerPhase() {
    G.phase = 'player'; G.busy = false;
    for (const u of G.units) {
      if (u.team === 'e') continue;
      u.done = !u.alive || u.team === 'n'; u.moved = false;
      if (G.turn > 1 && u.alive) { u.sp = Math.min(5, u.sp + 1); if (u.buffs.sabuk > 0) u.buffs.sabuk--; }
      u.buffs.benteng = 0; u.buffs.taunt = 0;
      if (u.team === 'p' && u.alive && u.status.racun > 0) {
        u.status.racun--; const d = Math.min(2, u.hp - 1);
        if (d > 0) { u.hp -= d; addText(u, '-' + d + ' 🤢', '#b8ff7a', 10); }
      }
      if (u.team === 'p' && u.alive && u.status.tidur > 0) { u.status.tidur--; u.done = true; u.sleeping = true; addText(u, 'Zzz... 😴', '#d8c8ff', 10, 0.2); }
      else u.sleeping = false;
    }
    G.sel = null; G.info = null; G.mode = 'idle';
    Sound.play('turn');
    banner('Giliranmu!', 'player');
    renderHUD(); renderPanel();
    if (G.m.tut) { if (G.turn === 1) tutTip('start'); if (G.turn === 2) tutTip('turn2'); }
    const ata = G.units.find(u => u.key === 'ata'); if (ata) focus(ata);
  }

  /* ---------------- Interaksi pemain ---------------- */
  function selectUnit(u) {
    G.sel = u; G.info = null;
    G.moveFrom = { x: u.x, y: u.y, f: u.facing };
    if (!u.moved) { G.reach = reach(u); G.mode = 'move'; if (G.m.tut) tutTip('select'); }
    else { G.reach = null; G.mode = 'action'; }
    focus(u); renderPanel();
  }
  function clearSel() { G.sel = null; G.info = null; G.reach = null; G.targets = null; G.mode = 'idle'; renderPanel(); }
  async function moveSel(x, y) {
    const u = G.sel; const path = pathTo(G.reach, x, y);
    G.busy = true; G.reach = null; G.mode = 'busy'; renderPanel();
    await walk(u, path);
    u.moved = true; G.busy = false;
    if (checkEnd()) return;
    toAction();
  }
  function toAction() { G.mode = 'action'; G.reach = null; G.targets = null; renderPanel(); if (G.m.tut) tutTip('action'); }
  function undoMove() {
    const u = G.sel; if (!u || !G.moveFrom) return;
    u.x = G.moveFrom.x; u.y = G.moveFrom.y; u.facing = G.moveFrom.f; u.moved = false;
    selectUnit(u);
  }
  function attackMode() {
    const u = G.sel;
    const list = foesOf(u).filter(f => canHitFrom(u, u.x, u.y, f));
    if (!list.length) { toast('Tidak ada musuh dalam jangkauan. Coba jalan lebih dekat!'); return; }
    G.mode = 'target'; G.tkind = 'attack'; G.skill = null; G.targets = new Map(list.map(f => [key(f.x, f.y), f]));
    G.rangeTiles = rangeTiles(u, u.rmin, u.rmax);
    renderPanel();
  }
  function rangeTiles(u, rmin, rmax) {
    const s = new Set();
    for (let dy = -rmax - 1; dy <= rmax + 1; dy++) for (let dx = -rmax - 1; dx <= rmax + 1; dx++) {
      const d = Math.abs(dx) + Math.abs(dy); const t = T(u.x + dx, u.y + dy);
      if (t && d >= rmin && d <= rmax + 1 && canHitFrom(u, u.x, u.y, { x: t.x, y: t.y }, rmin, rmax)) s.add(key(t.x, t.y));
    }
    return s;
  }
  function chooseSkill(sk) {
    const u = G.sel, d = SKILLS[sk];
    if (u.sp < d.cost) { toast('Semangat ⭐ belum cukup. Tunggu giliran berikutnya!'); return; }
    if (d.target === 'self') { runAction(() => useSkill(u, sk, u)); return; }
    let list;
    if (d.target === 'enemy') list = foesOf(u).filter(f => canHitFrom(u, u.x, u.y, f, d.rmin, d.rmax));
    else list = G.units.filter(v => v.alive && v.team !== 'e' && dist(u, v) >= d.rmin && dist(u, v) <= d.rmax);
    if (!list.length) { toast(d.target === 'enemy' ? 'Tidak ada musuh dalam jangkauan jurus ini.' : 'Tidak ada teman dalam jangkauan.'); return; }
    G.mode = 'target'; G.tkind = d.target; G.skill = sk; G.targets = new Map(list.map(f => [key(f.x, f.y), f]));
    G.rangeTiles = d.target === 'enemy' ? rangeTiles(u, d.rmin, d.rmax) : null;
    renderPanel();
  }
  async function runAction(fn) {
    const u = G.sel; G.busy = true; G.mode = 'busy'; G.targets = null; G.rangeTiles = null; renderPanel();
    await fn();
    if (G.ended) return;
    G.busy = false;
    finishUnit(u, false);
  }
  function useItem() {
    const u = G.sel;
    if (u.item <= 0) { toast('Madu sudah habis di pertempuran ini.'); return; }
    if (u.hp >= u.maxhp) { toast('Nyawa ' + u.name + ' masih penuh.'); return; }
    runAction(async () => {
      u.item--; const amt = Math.min(12, u.maxhp - u.hp); u.hp += amt;
      Sound.play('heal'); addText(u, '+' + amt + ' 🍯', '#8cff8c', 11); burst(u, ['#ffd24a', '#fff2a8'], 10);
      await playAnim(u, 'skill', 500);
    });
  }
  function finishUnit(u, autoFace = true) {
    if (autoFace) faceNearestFoe(u);
    u.done = true; G.sel = null; G.mode = 'idle'; G.targets = null; G.rangeTiles = null; G.reach = null;
    renderHUD(); renderPanel();
    if (checkEnd()) return;
    if (pteam().every(v => v.done || !v.alive)) setTimeout(() => { if (G && G.phase === 'player' && !G.busy) endPlayerTurn(); }, 450);
  }
  function onTapWorld(wx, wy) {
    if (!G || G.busy || G.ended || G.phase !== 'player' || dlgOpen) return;
    const pu = pickUnit(wx, wy), pt = pickTile(wx, wy);
    let tile = pu ? T(pu.x, pu.y) : pt;
    if (G.mode === 'move' && pt && G.reach && G.reach.has(key(pt.x, pt.y)) && !(pu && pu.team === 'p' && !pu.done && pu !== G.sel)) tile = pt;
    if (G.mode === 'target' && G.targets && !(pu && G.targets.has(key(pu.x, pu.y))) && pt && G.targets.has(key(pt.x, pt.y))) tile = pt;
    if (!tile) { if (G.mode === 'idle') clearSel(); return; }
    const tx = tile.x, ty = tile.y, u = unitAt(tx, ty);
    const live = u && u.alive ? u : null;
    switch (G.mode) {
      case 'idle':
        if (live && live.team === 'p' && live.sleeping && live.done) { Sound.play('tap'); G.info = live; renderPanel(); toast(live.name + ' sedang tertidur 😴. Bangunkan dengan Sup Hangat Bubunti!'); }
        else if (live && live.team === 'p' && !live.done) { Sound.play('tap'); selectUnit(live); }
        else if (live) { Sound.play('tap'); G.info = live; renderPanel(); }
        else clearSel();
        break;
      case 'move': {
        const s = G.sel;
        if (tx === s.x && ty === s.y) { toAction(); break; }
        if (G.reach.has(key(tx, ty))) { moveSel(tx, ty); break; }
        if (live && live.team === 'p' && !live.done) { selectUnit(live); break; }
        if (live) { G.info = live; renderPanel(); break; }
        toast('Tap petak biru untuk berjalan, atau tekan Batal.'); break;
      }
      case 'target': {
        const tg = G.targets && G.targets.get(key(tx, ty));
        if (!tg) { toast('Tap yang bercincin menyala.'); break; }
        const u0 = G.sel;
        if (G.tkind === 'attack') runAction(async () => { await basicAttack(u0, tg); if (G.m.tut) tutTip('attack'); });
        else runAction(() => useSkill(u0, G.skill, tg));
        break;
      }
      case 'action': case 'skills':
        if (live && live !== G.sel) { G.info = live; renderPanel(); }
        break;
    }
  }

  /* ---------------- Giliran musuh ---------------- */
  async function endPlayerTurn() {
    if (!G || G.phase !== 'player' || G.busy || G.ended) return;
    G.sel = null; G.info = null; G.mode = 'idle'; G.reach = null; G.targets = null;
    G.phase = 'enemy'; G.busy = true; renderPanel(); renderHUD();
    Sound.play('enemy');
    await banner('Giliran Musuh', 'enemy');
    await spawnWaves();
    await bossSummon();
    G.focus = new Map();
    const es = G.units.filter(u => u.team === 'e' && u.alive && !u.fresh);
    for (const e of es) {
      if (G.ended) return;
      if (!e.alive) continue;
      await aiAct(e);
      if (checkEnd()) return;
      await wait(140);
    }
    G.units.forEach(u => { u.fresh = false; });
    if (G.ended) return;
    if (G.m.type === 'survive' && G.turn >= G.m.n) { endBattle(true); return; }
    if (G.m.type === 'reach' && G.turn >= G.m.limit) { endBattle(false, 'Waktunya habis sebelum sampai ke bendera.'); return; }
    G.turn++;
    beginPlayerPhase();
  }
  function freeNear(x, y, k) {
    const seen = new Set([key(x, y)]), q = [[x, y]], who = k ? ENEMIES[k] : null;
    while (q.length) {
      const [cx, cy] = q.shift(); const t = T(cx, cy);
      if (t && canStand(who, t) && !unitAt(cx, cy)) return [cx, cy];
      for (const [dx, dy] of DIRS) { const k = key(cx + dx, cy + dy); if (!seen.has(k) && T(cx + dx, cy + dy)) { seen.add(k); q.push([cx + dx, cy + dy]); } }
    }
    return null;
  }
  function spawnUnit(k, x, y) {
    const p = freeNear(x, y, k); if (!p) return null;
    const u = mkUnit(k, 'e', p[0], p[1], { lv: G.m.elv || 1 });
    u.aggroOn = true; u.fresh = true; u.dropIn = now(); faceNearestFoe(u);
    G.units.push(u); burst(u, ['#ffffff', '#e8d9b5'], 8);
    return u;
  }
  async function spawnWaves() {
    const ws = G.waves.filter(w => !w.done && w.turn === G.turn);
    if (!ws.length) return;
    for (const w of ws) { w.done = true; for (const [k, x, y] of w.units) { const u = spawnUnit(k, x, y); if (u) focus(u); } }
    Sound.play('roar');
    await showTip('Bala bantuan musuh datang!', true);
  }
  async function bossSummon() {
    const sm = G.m.summon; if (!sm) return;
    const boss = G.units.find(u => u.boss && u.alive);
    if (!boss || G.turn % sm.every !== 0) return;
    const count = G.units.filter(u => u.team === 'e' && u.alive).length;
    if (count >= sm.max) return;
    focus(boss); await wait(300);
    Sound.play('roar'); addText(boss, ENEMIES[boss.key].call || 'Serbu!', '#ffcf6b', 9);
    await playAnim(boss, 'skill', 700);
    for (const [x, y] of sm.at) { if (G.units.filter(u => u.team === 'e' && u.alive).length >= sm.max) break; spawnUnit(ENEMIES[boss.key].summonKind || 'kumbang', x, y); }
    await wait(400);
  }
  function distField(e, targets) {
    const f = new Map(), q = [];
    for (const t of targets) { f.set(key(t.x, t.y), 0); q.push([t.x, t.y]); }
    while (q.length) {
      const [x, y] = q.shift(), d = f.get(key(x, y)), t0 = T(x, y);
      for (const [dx, dy] of DIRS) {
        const nx = x + dx, ny = y + dy, t = T(nx, ny); if (!t) continue;
        const k = key(nx, ny); if (f.has(k)) continue;
        if (!e.fly && (!canStand(e, t) || Math.abs(t.h - t0.h) > e.jump)) continue;
        f.set(k, d + 1); q.push([nx, ny]);
      }
    }
    return f;
  }
  async function aiAct(e) {
    if (e.status.pedas > 0) {
      e.status.pedas--; focus(e); addText(e, 'Huaaa pedas! 🥵', '#ff9b42', 9);
      await playAnim(e, 'hurt', 500); await wait(250); return;
    }
    const targets = foesOf(e); if (!targets.length) return;
    if (!e.aggroOn) { if (targets.some(t => dist(t, e) <= e.aggro) || e.hp < e.maxhp) e.aggroOn = true; else return; }
    if (seen(e)) { focus(e); await wait(260); } else await wait(60);
    const R = reach(e);
    const taunters = targets.filter(t => t.buffs.taunt > 0);
    let best = null;
    for (const [, p] of R) {
      for (const t of targets) {
        if (!canHitFrom(e, p.x, p.y, t)) continue;
        const r = calcDmg(e, t, { ax: p.x, ay: p.y });
        let sc = r.dmg * 2 + (r.dmg >= t.hp ? 15 : 0) + (t.team === 'n' ? 4 : 0) + (t.key === 'bubunti' && !G.m.protect ? 2 : 0) - p.c * 0.1 - (G.focus.get(t.id) || 0) * 10;
        if (taunters.length && !taunters.includes(t)) sc -= 40;
        if (e.ranged) { const near = Math.min(...targets.map(o => Math.abs(o.x - p.x) + Math.abs(o.y - p.y))); if (near >= 2) sc += 4; }
        if (!best || sc > best.sc) best = { sc, p, t };
      }
    }
    if (best) {
      reveal(e);
      if (best.p.x !== e.x || best.p.y !== e.y) await walk(e, pathTo(R, best.p.x, best.p.y));
      focus(e);
      G.focus.set(best.t.id, (G.focus.get(best.t.id) || 0) + 1);
      await basicAttack(e, best.t);
      reveal(e);
      const oh = ENEMIES[e.key].onHit, t = best.t;
      if (oh && t.alive && t.team !== 'e') {
        if (oh === 'tidur') { t.status.tidur = 1; addText(t, 'Tertidur! 😴', '#d8c8ff', 9, 0.3); burst(t, ['#c8a0f0', '#ffffff'], 8); }
        if (oh === 'racun') { t.status.racun = 3; addText(t, 'Keracunan! 🤢', '#b8ff7a', 9, 0.3); burst(t, ['#9be05a', '#5a2a7a'], 8); }
      }
      return;
    }
    const field = distField(e, taunters.length ? taunters : targets);
    let mv = null;
    for (const [k, p] of R) { const d = field.get(k); if (d == null) continue; if (!mv || d < mv.d || (d === mv.d && p.c < mv.c)) mv = { d, c: p.c, p }; }
    if (mv && (mv.p.x !== e.x || mv.p.y !== e.y)) { if (seen(e)) await walk(e, pathTo(R, mv.p.x, mv.p.y)); else { e.x = mv.p.x; e.y = mv.p.y; } }
    faceNearestFoe(e);
  }

  /* ---------------- Akhir pertempuran ---------------- */
  function checkEnd() {
    if (!G || G.ended) return true;
    const ata = G.units.find(u => u.key === 'ata');
    if (ata && !ata.alive) { endBattle(false, 'Ata pingsan!'); return true; }
    if (G.m.protect) { const p = G.units.find(u => u.key === G.m.protect); if (p && !p.alive) { endBattle(false, p.name + ' pingsan!'); return true; } }
    if (G.m.type === 'boss') { const b = G.units.find(u => u.boss); if (b && !b.alive) { endBattle(true); return true; } }
    if (G.m.type === 'reach') { if (G.units.some(u => u.team === 'p' && u.alive && T(u.x, u.y).t === 'f')) { endBattle(true); return true; } return false; }
    const left = G.units.some(u => u.team === 'e' && u.alive);
    const wavesLeft = G.waves.some(w => !w.done);
    if (!left && !wavesLeft) { endBattle(true); return true; }
    return false;
  }
  function computeStars() {
    const s = [true, G.stats.faint === 0, false], r = G.m.star3;
    if (r.type === 'turns') s[2] = G.turn <= r.n;
    else if (r.type === 'npc') { const n = G.units.find(u => u.key === r.key); s[2] = !!n && n.alive && n.hp >= n.maxhp / 2; }
    return s;
  }
  async function endBattle(win, reason = '') {
    if (G.ended) return; G.ended = true; G.busy = true; G.mode = 'idle'; G.sel = null; renderPanel();
    Sound.stopMusic();
    await wait(900);
    if (win) Sound.play('win'); else Sound.play('lose');
    const m = G.m;
    if (!win) {
      overlay(h('div', { class: 'card result lose' },
        h('div', { class: 'rtitle' }, 'Yah, kalah...'),
        portrait('ata', 90),
        h('p', {}, reason),
        h('p', { class: 'muted' }, 'Tips: naikkan level tim di Markas dengan madu 🍯, atau serang musuh dari belakang!'),
        h('div', { class: 'row' }, btn('🔁 Coba lagi', () => { closeOverlay(); startMission(m, { skipStory: true }); }, 'pri'), btn('🗺️ Ke peta', () => { closeOverlay(); goMap(); }))));
      return;
    }
    const st = computeStars(), n = st.filter(Boolean).length;
    const first = !S.cleared[m.id];
    const prev = S.stars[m.id] || 0;
    const bonus = (first ? 10 : 4) + Math.max(0, n - prev) * 3;
    const total = G.madu + bonus;
    if (first && m.recruit) S.lvl[m.recruit] = Math.max(S.lvl[m.recruit] || 1, teamLv());
    S.madu += total; S.cleared[m.id] = true; S.stars[m.id] = Math.max(prev, n); persist();
    const conds = ['Menang', 'Tidak ada teman yang pingsan', m.star3.text];
    overlay(h('div', { class: 'card result' },
      h('div', { class: 'rtitle' }, 'Menang! 🎉'),
      h('div', { class: 'bigstars' }, st.map((s, i) => h('span', { class: s ? 'on' : '', style: `animation-delay:${0.2 + i * 0.25}s` }, '★'))),
      h('ul', { class: 'conds' }, conds.map((c, i) => h('li', { class: st[i] ? 'ok' : '' }, (st[i] ? '✔ ' : '✖ ') + c))),
      h('div', { class: 'madu' }, `🍯 +${G.madu} dari musuh, +${bonus} bonus = `, h('b', {}, '+' + total + ' madu')),
      h('div', { class: 'row' }, btn('Lanjut ▶', async () => {
        closeOverlay();
        if (first && m.post) await playStory(STORY[m.post]);
        if (first && m.recruit) await recruitPopup(m.recruit);
        if (first && m.final) { await chapterEnd(m); return; }
        goMap();
      }, 'pri'))));
  }

  /* ---------------- Kamera ---------------- */
  function viewArea() {
    const top = (hud.offsetHeight || 56) + 6;
    const bottom = G && !panel.hidden ? (panel.offsetHeight || 150) + 6 : 0;
    return { x: 0, y: top, w: VW, h: Math.max(120, VH - top - bottom) };
  }
  function mapBounds() {
    if (G.mb) return G.mb;
    let a = 1e9, b = -1e9, c = 1e9, d = -1e9;
    for (const row of G.map.tiles) for (const t of row) {
      if (t.t === 'o') continue;
      const [sx, sy] = iso(t.x, t.y, t.h);
      a = Math.min(a, sx - 32); b = Math.max(b, sx + 32); c = Math.min(c, sy - 120); d = Math.max(d, sy + 16 + t.h * HS + 30);
    }
    return (G.mb = { x0: Math.floor(a), x1: Math.ceil(b), y0: Math.floor(c), y1: Math.ceil(d) });
  }
  const snapZ = z => z;
  function fitCam(keepZ) {
    const a = viewArea();
    if (!keepZ) cam.z = VW < 700 ? 1.15 : clamp(Math.min(VW / 1180, VH / 820) * 1.55, 1.1, 2);
    const ps = G.units.filter(u => u.team !== 'e');
    let cx = 0, cy = 0;
    ps.forEach(u => { const [sx, sy] = iso(u.x, u.y, T(u.x, u.y).h); cx += sx; cy += sy; });
    cx /= ps.length || 1; cy = cy / (ps.length || 1) - 50;
    cam.x = a.x + a.w / 2 - cx * cam.z; cam.y = a.y + a.h / 2 - cy * cam.z; cam.tx = null; cam.ty = null;
  }
  function focus(u, soft) {
    if (!G) return;
    const p = unitWorld(u), a = viewArea();
    const sx = cam.x + p.sx * cam.z, sy = cam.y + (p.sy - 40) * cam.z;
    const mx = a.w * (soft ? 0.22 : 0.3), my = a.h * (soft ? 0.2 : 0.28);
    if (sx < a.x + mx || sx > a.x + a.w - mx || sy < a.y + my || sy > a.y + a.h - my) {
      cam.tx = a.x + a.w / 2 - p.sx * cam.z; cam.ty = a.y + a.h / 2 - (p.sy - 40) * cam.z;
    }
  }
  function zoomAt(px, py, nz) {
    nz = clamp(nz, 0.6, 3.2);
    const wx = (px - cam.x) / cam.z, wy = (py - cam.y) / cam.z;
    cam.z = nz; cam.x = px - wx * nz; cam.y = py - wy * nz; cam.tx = cam.ty = null;
  }
  /* ---------------- Memilih dengan tap ---------------- */
  function pickUnit(wx, wy) {
    const list = G.units.filter(u => !u.gone && u.alive && seen(u)).map(u => [u, unitWorld(u)]).sort((a, b) => (b[1].rx + b[1].ry) - (a[1].rx + a[1].ry));
    const hits = [];
    for (const [u, p] of list) {
      const hh = SPR.height(u.key), hw = SPR.width(u.key) / 2;
      if (wx > p.sx - hw && wx < p.sx + hw && wy > p.sy - hh && wy < p.sy + 8) hits.push(u);
    }
    if (hits.length <= 1) return hits[0] || null;
    const pt = pickTile(wx, wy);
    const onTile = pt && hits.find(u => u.x === pt.x && u.y === pt.y);
    if (onTile) return onTile;
    if (G.mode === 'target' && G.targets) { const tg = hits.find(u => G.targets.has(key(u.x, u.y))); if (tg) return tg; }
    return hits.find(u => u.team === 'p' && !u.done) || hits[0];
  }
  function pickTile(wx, wy) {
    const m = G.map; const list = [];
    for (const row of m.tiles) for (const t of row) if (t.t !== 'o') list.push(t);
    list.sort((a, b) => (b.x + b.y) - (a.x + a.y) || b.h - a.h);
    for (const t of list) {
      const [sx, sy] = iso(t.x, t.y, t.h);
      if (Math.abs(wx - sx) / (TW / 2) + Math.abs(wy - sy) / (TH / 2) < 0.97) return t;
    }
    return null;
  }

  /* ---------------- Input ---------------- */
  const pts = new Map(); let drag = null, pinch = null;
  cv.addEventListener('pointerdown', e => {
    cv.setPointerCapture(e.pointerId); pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pts.size === 1) drag = { x0: e.clientX, y0: e.clientY, cx: cam.x, cy: cam.y, moved: false };
    else if (pts.size === 2) { const [a, b] = [...pts.values()]; pinch = { d: Math.hypot(a.x - b.x, a.y - b.y), z: cam.z }; if (drag) drag.moved = true; }
  });
  cv.addEventListener('pointermove', e => {
    if (!pts.has(e.pointerId)) return;
    pts.set(e.pointerId, { x: e.clientX, y: e.clientY });
    if (pinch && pts.size >= 2) {
      const [a, b] = [...pts.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
      zoomAt((a.x + b.x) / 2, (a.y + b.y) / 2, pinch.z * d / pinch.d);
    } else if (drag) {
      const dx = e.clientX - drag.x0, dy = e.clientY - drag.y0;
      if (!drag.moved && Math.hypot(dx, dy) > 9) drag.moved = true;
      if (drag.moved && G) { cam.x = drag.cx + dx; cam.y = drag.cy + dy; cam.tx = cam.ty = null; }
    }
  });
  function up(e) {
    if (!pts.has(e.pointerId)) return;
    pts.delete(e.pointerId);
    if (pts.size < 2) pinch = null;
    if (pts.size === 0) {
      if (drag && !drag.moved && G) { Sound.resume(); onTapWorld((e.clientX - cam.x) / cam.z, (e.clientY - cam.y) / cam.z); }
      drag = null;
    }
  }
  cv.addEventListener('pointerup', up); cv.addEventListener('pointercancel', up);
  cv.addEventListener('wheel', e => { if (!G) return; e.preventDefault(); zoomAt(e.clientX, e.clientY, cam.z * (e.deltaY < 0 ? 1.12 : 0.89)); }, { passive: false });

  /* ---------------- Gambar dunia (gaya diorama halus, digambar 2× lalu diskalakan) ---------------- */
  const R = SPR.R;
  function hash(x, y, s = 0) { let h = (x * 374761393 + y * 668265263 + s * 1442695041) | 0; h = Math.imul(h ^ (h >>> 13), 1274126177); return ((h ^ (h >>> 16)) >>> 0) / 4294967296; }
  function vn(x, y, s) { const xi = Math.floor(x), yi = Math.floor(y), xf = x - xi, yf = y - yi; const a = hash(xi, yi, s), b = hash(xi + 1, yi, s), c = hash(xi, yi + 1, s), d = hash(xi + 1, yi + 1, s); const u = xf * xf * (3 - 2 * xf), v = yf * yf * (3 - 2 * yf); return a + (b - a) * u + (c - a) * v + (a - b - c + d) * u * v; }
  function fbm(x, y, s) { return vn(x, y, s) * 0.5 + vn(x * 2.03, y * 2.03, s + 7) * 0.3 + vn(x * 4.1, y * 4.1, s + 13) * 0.2; }
  const mix = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k, a[2] + (b[2] - a[2]) * k];
  const mul = (a, k) => [a[0] * k, a[1] * k, a[2] * k];
  const tint = (a, t) => [a[0] * t[0], a[1] * t[1], a[2] * t[2]];
  const HX = {}; const C = h => HX[h] || (HX[h] = [parseInt(h.slice(1, 3), 16), parseInt(h.slice(3, 5), 16), parseInt(h.slice(5, 7), 16)]);
  const sm = (a, b, x) => { const t = Math.max(0, Math.min(1, (x - a) / (b - a))); return t * t * (3 - 2 * t); };
  const SUN = [1.06, 1.0, 0.9], SHADE = [0.72, 0.78, 0.95];
  function mkCanvas(w, h) { const c = document.createElement('canvas'); c.width = w; c.height = h; return c; }
  const isWater = t => t.t === 'w';
  const isSea = t => !t || t.t === 'o';
  const GRASS = {
    kebun: ['#456f2c', '#8cb653', '#a9c46a'], desa: ['#4a742e', '#90b856', '#b0c870'], savana: ['#5f7a2c', '#a8b456', '#c9c070'],
    hutan: ['#1f3d22', '#4a7a3a', '#7aa84e'],
  };
  function stoneTop(X, Y, sc) {
    let su = X * sc, sv = Y * sc; const row = Math.floor(sv); if (row % 2) su += 0.5;
    const fu = su - Math.floor(su), fv = sv - row, id = hash(Math.floor(su), row, 4);
    const e = Math.min(fu, 1 - fu, fv, 1 - fv);
    let c = mix(C('#9a8e78'), C('#cbbf9f'), 0.35 + id * 0.4 + (fbm(X * 6, Y * 6, 6) - 0.5) * 0.35);
    if (id > 0.82) c = mix(c, C('#8f9a72'), 0.25);
    c = mix(c, C('#f2e8cc'), (1 - sm(0.05, 0.22, Math.min(fu, fv))) * 0.32); c = mul(c, 1 - (1 - sm(0.05, 0.22, Math.min(1 - fu, 1 - fv))) * 0.22);
    return mix(C('#4e463e'), c, sm(0.02, 0.07, e));
  }
  function grass(X, Y, gp) {
    const n = fbm(X * 1.6, Y * 1.6, 1), m = fbm(X * 5, Y * 5, 2);
    let c = mix(C(gp[0]), C(gp[1]), 0.25 + n * 0.6 + (m - 0.5) * 0.35);
    c = mix(c, C(gp[2]), sm(0.62, 0.85, fbm(X * 0.9, Y * 0.9, 9)) * 0.35);
    return mul(c, 0.93 + 0.12 * sm(0.4, 0.7, fbm(X * 11, Y * 11, 3)));
  }
  function topColor(t, X, Y, gp) {
    switch (t.t) {
      case 'g': return mul(grass(X, Y, gp), 0.9);
      case 'q': { let c = grass(X, Y, gp); const fx = X * 9, fy = Y * 9, id = hash(Math.floor(fx), Math.floor(fy), 21);
        if (id > 0.86) { const d = Math.hypot(fx - Math.floor(fx) - 0.5, fy - Math.floor(fy) - 0.5); if (d < 0.22) c = mix(c, C(['#f2a0b8', '#ffe27a', '#ffffff', '#c8a0f0'][Math.floor(id * 40) % 4]), sm(0.22, 0.12, d)); } return c; }
      case ',': case 's': { const n = fbm(X * 3, Y * 3, 8); let c = mix(C('#7d5a3e'), C('#b48d62'), 0.3 + n * 0.6); return mix(c, C('#c9ae84'), sm(0.7, 0.9, fbm(X * 8, Y * 8, 9)) * 0.4); }
      case 'm': { const n = fbm(X * 2.2, Y * 2.2, 44); let c = mix(C('#3e2c1e'), C('#6e5034'), 0.2 + n * 0.7);
        const pd = fbm(X * 1.4, Y * 1.4, 45); c = mix(c, C('#2a2a26'), sm(0.6, 0.66, pd) * 0.55); c = mix(c, C('#a7b8a0'), sm(0.66, 0.7, pd) * sm(0.8, 0.95, fbm(X * 9, Y * 9, 46)) * 0.6);
        return mix(c, C('#4a6a2c'), sm(0.72, 0.9, fbm(X * 4, Y * 4, 47)) * 0.35); }
      case 'y': { const n = fbm(X * 2.5, Y * 2.5, 31); let c = mix(C('#d9bf86'), C('#f0dcaa'), 0.3 + n * 0.6); return mul(c, 0.96 + 0.06 * fbm(X * 14, Y * 14, 32)); }
      case 'c': { const r = (X + Y) * 4, f = r - Math.floor(r); let c = mix(C('#5e3e26'), C('#8a6040'), sm(0.1, 0.5, Math.abs(f - 0.5) * 2) * 0.8 + fbm(X * 6, Y * 6, 33) * 0.2);
        if (Math.abs(f - 0.5) < 0.14 && hash(Math.floor(r), Math.floor((X - Y) * 5), 34) > 0.35) { const k = vn((X - Y) * 14, r, 35); if (k > 0.45) c = mix(C('#3f7a2a'), C('#8cc458'), k); } return c; }
      case 'h': case 'k': case 'z': return stoneTop(X, Y, 2.4);
      case 'w': {
        if (G.m.mud) { const n = fbm(X * 2, Y * 2, 40); let c = mix(C('#4e3826'), C('#7a5a3c'), n); return mix(c, C('#9a7a58'), sm(0.75, 0.9, fbm(X * 6, Y * 6, 41)) * 0.5); }
        const r = 0.5 + 0.5 * Math.sin(X * 7 + Y * 2.5 + fbm(X * 1.5, Y * 1.5, 10) * 5);
        if (G.m.pal === 'hutan') { let c = mix(mix(C('#123a34'), C('#2e6a5a'), 0.35 + r * 0.4), C('#bfe8d0'), sm(0.94, 0.99, r) * 0.5); const ld = fbm(X * 3, Y * 3, 48); return mix(c, C('#4a8a3a'), sm(0.72, 0.78, ld) * 0.8); }
        return mix(mix(C('#18469a'), C('#3c86d8'), 0.35 + r * 0.4), C('#cfe9ff'), sm(0.93, 0.99, r) * 0.7);
      }
      default: return grass(X, Y, gp);
    }
  }
  function sideColor(t, s, j, depth, X) {
    let c;
    if (t.t === 'h' || t.t === 'k' || t.t === 'z') {
      const rowH = 9, r = Math.floor(j / rowH), off = (r % 2) * 0.5, bu = s * 2.2 + off, bf = bu - Math.floor(bu), jf = (j % rowH) / rowH;
      const e = Math.min(bf, 1 - bf, jf * 0.6, (1 - jf) * 0.6);
      c = mix(C('#857a68'), C('#b2a68c'), 0.3 + hash(Math.floor(bu), r, 14) * 0.5 + (fbm(X * 5 + s * 2, j * 0.12, 15) - 0.5) * 0.3);
      c = mix(C('#3e3630'), mix(c, C('#e2d7bc'), (1 - sm(0, 0.18, jf)) * 0.3), sm(0.01, 0.06, e));
    } else if (t.t === 'w') c = mix(C('#5a4e40'), C('#7a6c58'), fbm(s * 4 + X, j * 0.1, 42));
    else {
      const sand = t.t === 'y' || t.t === ',' || t.t === 's';
      const lip = sand ? 3 : 4 + fbm(s * 8 + X, 0, 16) * 6;
      if (j < lip) c = sand ? C('#c9ab72') : mix(C('#3e6a28'), C('#6f9a40'), 1 - j / lip);
      else { const n = fbm(s * 4 + X, j * 0.08, 18); c = mix(C('#5a3e2a'), C('#8f6848'), 0.25 + n * 0.6); c = mix(c, C('#9a958a'), sm(0.66, 0.8, fbm(s * 2.5 + X * 1.3, j * 0.05, 19)) * 0.7); }
    }
    return mul(c, 1 - 0.55 * sm(0, Math.max(40, depth), j));
  }
  const BASE_DEPTH = 30;
  const effH = t => isSea(t) ? -99 : t.h - (isWater(t) ? 0.375 : 0);
  function sideDepth(t, n) { if (isSea(n)) return effH(t) * HS + BASE_DEPTH; return Math.max(0, (effH(t) - effH(n)) * HS); }
  function renderTile(t, gp) {
    const x = t.x, y = t.y, eh = effH(t);
    const dl = sideDepth(t, T(x, y + 1)), dr = sideDepth(t, T(x + 1, y));
    const full = eh * HS + BASE_DEPTH;
    const W = TW * R, TOP = TH * R, Hh = TOP + Math.ceil(Math.max(dl, dr) * R) + 2;
    const cv = mkCanvas(W, Hh), g = cv.getContext('2d'), im = g.createImageData(W, Hh), d = im.data;
    const put = (px, py, c, a = 255) => { if (px < 0 || py < 0 || px >= W || py >= Hh) return; const i = (py * W + px) * 4; d[i] = c[0]; d[i + 1] = c[1]; d[i + 2] = c[2]; d[i + 3] = a; };
    const hw = W / 2;
    for (let i = 0; i < hw; i++) {
      const yb = TOP / 2 + Math.floor(i / 2);
      for (let j = 0; j < dl * R; j++) put(i, yb + j + 1, mul(tint(sideColor(t, i / hw, j / R, full, x), SUN), 0.9));
      for (let j = 0; j < dr * R; j++) put(W - 1 - i, yb + j + 1, mul(tint(sideColor(t, i / hw, j / R, full, y), SHADE), 0.78));
    }
    const sh = n => isSea(n) ? -9 : effH(n) - eh;
    const shL = sh(T(x - 1, y)), shU = sh(T(x, y - 1)), shUL = sh(T(x - 1, y - 1));
    for (let py = 0; py < TOP; py++) for (let px = 0; px < W; px++) {
      const dx = (px + 0.5 - hw) / hw, dy = (py + 0.5 - TOP / 2) / (TOP / 2);
      const u = (dx + dy) / 2 + 0.5, v = (dy - dx) / 2 + 0.5;
      if (u < 0 || u >= 1 || v < 0 || v >= 1) continue;
      let c = topColor(t, x - 0.5 + u, y - 0.5 + v, gp);
      if (!isWater(t)) { c = mix(c, [255, 246, 220], (1 - sm(0, 0.035, Math.min(u, v))) * 0.12); c = mul(c, 1 - (1 - sm(0, 0.035, Math.min(1 - u, 1 - v))) * 0.09); }
      let s = 1;
      if (shL > 0) s = Math.min(s, 0.55 + 0.45 * sm(0, 0.25 * shL + 0.2, u));
      if (shU > 0) s = Math.min(s, 0.6 + 0.4 * sm(0, 0.22 * shU + 0.15, v));
      if (shUL > 0 && shL <= 0 && shU <= 0) s = Math.min(s, 0.7 + 0.3 * sm(0, 0.3, Math.min(1, Math.hypot(u, v) * 1.4)));
      c = tint(mul(c, s), s < 0.95 ? mix(SHADE, [1, 1, 1], s) : SUN);
      put(px, py, c, isWater(t) && !G.m.mud ? 238 : 255);
    }
    g.putImageData(im, 0, 0);
    return cv;
  }
  /* ---- objek dekorasi (ruang R, titik pijak di tengah petak) ---- */
  function poly(c, pts, fill) { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); for (const p of pts.slice(1)) c.lineTo(p[0], p[1]); c.closePath(); c.fillStyle = fill; c.fill(); }
  function line(c, a, b, col, w = 2) { c.beginPath(); c.moveTo(a[0], a[1]); c.lineTo(b[0], b[1]); c.strokeStyle = col; c.lineWidth = w; c.lineCap = 'round'; c.stroke(); }
  const lerp = (a, b, k) => [a[0] + (b[0] - a[0]) * k, a[1] + (b[1] - a[1]) * k];
  function gradPoly(c, pts, c0, c1, a, b) { const g = c.createLinearGradient(a[0], a[1], b[0], b[1]); g.addColorStop(0, c0); g.addColorStop(1, c1); poly(c, pts, g); }
  const Q = (u, v, z) => [(u - v) * TW / 2 * R, ((u + v) * TH / 2 - z) * R]; // u,v relatif pusat petak
  function drHouse(c, seed) {
    const Wh = 40, a = 0.42;
    const A = Q(-a, a, 0), B = Q(a, a, 0), Cc = Q(a, -a, 0), At = Q(-a, a, Wh), Bt = Q(a, a, Wh), Ct = Q(a, -a, Wh);
    const A6 = Q(-a, a, 7), B6 = Q(a, a, 7), C6 = Q(a, -a, 7);
    const wallA = ['#f0e2c2', '#e8d0b0', '#f2e6cc'][seed % 3];
    gradPoly(c, [A, B, Bt, At], wallA, '#d0bc96', At, A);
    gradPoly(c, [B, Cc, Ct, Bt], '#a8987a', '#857660', Bt, B);
    gradPoly(c, [A, B, B6, A6], '#9a8e7c', '#6e6458', A6, A); gradPoly(c, [B, Cc, C6, B6], '#6e6458', '#4e463e', B6, B);
    const Rf = Q(a, 0, Wh + 26); gradPoly(c, [Bt, Ct, Rf], '#b2a282', '#8e7e62', Rf, Bt);
    const w1 = '#4a2e1a', w2 = '#35200f';
    line(c, A6, B6, w1, 4); line(c, At, Bt, w1, 5); line(c, B6, C6, w2, 4); line(c, Bt, Ct, w2, 5);
    for (let k = 0; k <= 3; k++) line(c, lerp(A6, B6, k / 3), lerp(At, Bt, k / 3), w1, 4);
    for (let k = 0; k <= 2; k++) line(c, lerp(B6, C6, k / 2), lerp(Bt, Ct, k / 2), w2, 4);
    line(c, lerp(A6, At, 0.5), lerp(B6, Bt, 0.5), w1, 3);
    line(c, Bt, Rf, w2, 5); line(c, Ct, Rf, w2, 5);
    const d0 = lerp(A, B, 0.56), d1 = lerp(A, B, 0.8);
    gradPoly(c, [d0, d1, [d1[0], d1[1] - 46], [d0[0], d0[1] - 46]], '#5a3a1e', '#3a2412', [d0[0], d0[1] - 46], d0);
    const win = (p, q, lit) => { const pts = [[p[0], p[1] - 64], [q[0], q[1] - 64], [q[0], q[1] - 42], [p[0], p[1] - 42]];
      if (lit) { c.save(); c.filter = 'blur(8px)'; poly(c, pts, 'rgba(255,190,90,0.55)'); c.restore(); }
      gradPoly(c, pts, lit ? '#ffe3a0' : '#3c4c6e', lit ? '#f2a848' : '#1e2a44', pts[0], pts[3]);
      line(c, lerp(pts[0], pts[1], 0.5), lerp(pts[3], pts[2], 0.5), '#2a180a', 2);
      c.strokeStyle = '#2a180a'; c.lineWidth = 3; c.beginPath(); pts.forEach((p, i) => i ? c.lineTo(...p) : c.moveTo(...p)); c.closePath(); c.stroke(); };
    win(lerp(A, B, 0.12), lerp(A, B, 0.38), seed % 2 === 0); win(lerp(B, Cc, 0.3), lerp(B, Cc, 0.66), false);
    const roof = [['#c2583a', '#8a3626'], ['#4e6a8a', '#2e4460'], ['#b07a3a', '#7a4e22']][seed % 3];
    const e1 = Q(-a - 0.08, a + 0.08, Wh - 3), e2 = Q(a + 0.08, a + 0.08, Wh - 3), r1 = Q(-a - 0.08, 0, Wh + 28), r2 = Q(a + 0.08, 0, Wh + 28);
    gradPoly(c, [e1, e2, r2, r1], roof[0], roof[1], r1, e1);
    for (let k = 1; k < 6; k++) { const p = lerp(e1, r1, k / 6), q = lerp(e2, r2, k / 6); line(c, [p[0], p[1] + 2], [q[0], q[1] + 2], 'rgba(40,12,6,0.4)', 3); line(c, p, q, 'rgba(255,200,170,0.22)', 2); }
    for (let k = 1; k < 10; k++) line(c, lerp(e1, e2, k / 10), lerp(r1, r2, k / 10), 'rgba(40,12,6,0.3)', 2);
    line(c, r1, r2, 'rgba(30,8,4,0.9)', 7); line(c, e1, e2, 'rgba(30,8,4,0.8)', 4);
    const g1 = Q(a + 0.08, a + 0.08, Wh - 3), g2 = Q(a + 0.08, 0, Wh + 28); poly(c, [g1, g2, [g2[0], g2[1] + 10], [g1[0], g1[1] + 10]], 'rgba(30,8,4,0.85)');
    const ch = Q(-0.15, 0.1, Wh + 22);
    gradPoly(c, [[ch[0] - 9, ch[1]], [ch[0], ch[1] + 4], [ch[0], ch[1] - 36], [ch[0] - 9, ch[1] - 40]], '#a49480', '#8a7a68', [ch[0] - 9, 0], [ch[0], 0]);
    gradPoly(c, [[ch[0] + 9, ch[1]], [ch[0], ch[1] + 4], [ch[0], ch[1] - 36], [ch[0] + 9, ch[1] - 40]], '#6e6252', '#584e40', [ch[0], 0], [ch[0] + 9, 0]);
  }
  function blobs(c, list, seed, cols) {
    list = list.slice().sort((a, b) => a[1] - b[1]);
    for (const [x, y, r] of list) {
      const g = c.createRadialGradient(x - r * 0.45, y - r * 0.5, r * 0.1, x, y, r * 1.05);
      g.addColorStop(0, cols[0]); g.addColorStop(0.45, cols[1]); g.addColorStop(1, cols[2]);
      c.fillStyle = g; c.beginPath();
      for (let k = 0; k <= 24; k++) { const th = k / 24 * Math.PI * 2, rr = r * (0.9 + 0.12 * hash(k, seed, Math.round(x) + 50)); c.lineTo(x + Math.cos(th) * rr, y + Math.sin(th) * rr); }
      c.fill();
      for (let k = 0; k < 22; k++) { const th = hash(k, seed, Math.round(x)) * 7, rr = Math.sqrt(hash(k, seed, Math.round(y))) * r * 0.85; const lx = x + Math.cos(th) * rr, ly = y + Math.sin(th) * rr; const l = ((x - lx) + (y - ly)) / (r * 2) + 0.5;
        c.fillStyle = `rgba(${l > 0.55 ? '220,240,150' : '20,46,22'},${0.16 + 0.14 * Math.abs(l - 0.5)})`; c.beginPath(); c.ellipse(lx, ly, r * 0.12, r * 0.08, th, 0, 7); c.fill(); }
    }
  }
  function drTree(c, seed, sav) {
    const tr = c.createLinearGradient(-8, 0, 8, 0); tr.addColorStop(0, '#7a5232'); tr.addColorStop(1, '#3a2414');
    c.fillStyle = tr;
    if (sav) { // akasia savana: batang bercabang, tajuk pipih lebar
      c.beginPath(); c.moveTo(-7, 0); c.lineTo(-4, -70); c.lineTo(4, -70); c.lineTo(7, 0); c.fill();
      line(c, [0, -60], [-34, -96], '#4a2e1a', 7); line(c, [0, -64], [30, -100], '#4a2e1a', 7);
      blobs(c, [[-40, -106, 28], [0, -114, 34], [40, -108, 28], [-18, -124, 22], [20, -126, 22]], seed, ['#c6cf78', '#7f9a3e', '#34501f']);
    } else {
      c.beginPath(); c.moveTo(-8, 0); c.lineTo(-5, -70); c.lineTo(5, -70); c.lineTo(8, 0); c.fill();
      blobs(c, [[0, -110, 40], [-30, -88, 30], [30, -86, 30], [-12, -138, 28], [18, -132, 26], [0, -78, 28]], seed, ['#a6d266', '#5f9a3a', '#1e4422']);
      if (seed % 3 === 0) for (let k = 0; k < 5; k++) { c.fillStyle = '#e8473a'; c.beginPath(); c.arc(-26 + hash(k, seed, 7) * 52, -120 + hash(k, seed, 8) * 50, 4, 0, 7); c.fill(); }
    }
  }
  function drJungle(c, seed) { // pohon hutan lembab: akar banir, batang berlumut, tajuk lebat gelap, sulur
    const tr = c.createLinearGradient(-12, 0, 12, 0); tr.addColorStop(0, '#5a4630'); tr.addColorStop(1, '#241a10');
    c.fillStyle = tr; c.beginPath(); c.moveTo(-26, 4); c.quadraticCurveTo(-10, -6, -9, -40); c.lineTo(-7, -110); c.lineTo(7, -110); c.lineTo(9, -40); c.quadraticCurveTo(10, -6, 28, 6); c.lineTo(10, 2); c.lineTo(0, 8); c.lineTo(-10, 2); c.closePath(); c.fill();
    c.fillStyle = 'rgba(110,150,70,0.55)'; c.beginPath(); c.ellipse(-5, -50, 5, 16, 0.1, 0, 7); c.fill(); c.beginPath(); c.ellipse(4, -88, 4, 10, -0.2, 0, 7); c.fill();
    blobs(c, [[0, -150, 46], [-38, -124, 34], [38, -122, 34], [-16, -178, 30], [20, -172, 30], [0, -112, 30]], seed, ['#6f9a4a', '#2f5a2e', '#0e2414']);
    for (let k = 0; k < 4; k++) { const x0 = -34 + hash(k, seed, 61) * 68, len = 30 + hash(k, seed, 62) * 50, y0 = -118 + hash(k, seed, 63) * 12;
      c.strokeStyle = '#3a6a2a'; c.lineWidth = 2.2; c.beginPath(); c.moveTo(x0, y0); c.quadraticCurveTo(x0 + 6, y0 + len * 0.5, x0 - 2, y0 + len); c.stroke();
      c.fillStyle = '#5a8a3a'; for (let q = 0; q < 4; q++) { c.beginPath(); c.ellipse(x0 + 2 - q % 2 * 4, y0 + len * (q + 1) / 5, 3.5, 2, q, 0, 7); c.fill(); } }
  }
  function drShroom(c, seed) { // jamur raksasa bercahaya
    const caps = [[-16, -6, 1], [14, -2, 0.75], [0, 8, 0.55]];
    for (const [x, y, k] of caps) {
      const hgt = 46 * k, r = 26 * k;
      const st = c.createLinearGradient(x - 5, 0, x + 5, 0); st.addColorStop(0, '#efe4cc'); st.addColorStop(1, '#a89a80');
      c.fillStyle = st; c.fillRect(x - 5 * k, y - hgt, 10 * k, hgt);
      const g = c.createRadialGradient(x - r * 0.4, y - hgt - r * 0.5, 2, x, y - hgt, r * 1.2); g.addColorStop(0, '#ffb07a'); g.addColorStop(0.5, '#d2562e'); g.addColorStop(1, '#6a1e18');
      c.fillStyle = g; c.beginPath(); c.ellipse(x, y - hgt, r, r * 0.62, 0, Math.PI, 0); c.quadraticCurveTo(x, y - hgt + r * 0.3, x - r, y - hgt); c.fill();
      c.fillStyle = 'rgba(255,240,210,0.85)'; for (let q = 0; q < 4; q++) { c.beginPath(); c.arc(x - r * 0.5 + hash(q, seed, x | 0) * r, y - hgt - r * 0.15 - hash(q, seed, 9) * r * 0.35, 2.4 * k + 1, 0, 7); c.fill(); }
    }
  }
  function drFern(c, seed) {
    for (let k = 0; k < 7; k++) { const a = -2.6 + k * 0.36 + (hash(k, seed, 70) - 0.5) * 0.2, L = 28 + hash(k, seed, 71) * 14;
      const ex = Math.cos(a) * L, ey = Math.sin(a) * L * 0.9;
      c.strokeStyle = k % 2 ? '#3f7a32' : '#5c9a3e'; c.lineWidth = 2; c.beginPath(); c.moveTo(0, 0); c.quadraticCurveTo(ex * 0.5, ey - 10, ex, ey); c.stroke();
      c.fillStyle = c.strokeStyle; for (let q = 1; q < 6; q++) { const t = q / 6, px = ex * t, py = ey * t - 10 * t * (1 - t) * 2; c.beginPath(); c.ellipse(px, py, 5 * (1 - t * 0.5), 2, a + 1.2, 0, 7); c.fill(); c.beginPath(); c.ellipse(px, py, 5 * (1 - t * 0.5), 2, a - 1.2, 0, 7); c.fill(); } }
  }
  function drLog(c, seed) { // batang kayu tumbang berlumut
    const A = Q(-0.42, 0.1, 0), B = Q(0.42, -0.1, 0);
    c.save(); c.translate(0, -10);
    const g = c.createLinearGradient(0, -22, 0, 12); g.addColorStop(0, '#8a6a46'); g.addColorStop(1, '#3a2818');
    c.strokeStyle = g; c.lineCap = 'round'; c.lineWidth = 26; c.beginPath(); c.moveTo(A[0], A[1]); c.lineTo(B[0], B[1]); c.stroke();
    c.strokeStyle = 'rgba(120,170,70,0.7)'; c.lineWidth = 9; c.beginPath(); c.moveTo(A[0] + 6, A[1] - 10); c.lineTo(B[0] - 10, B[1] - 10); c.stroke();
    c.fillStyle = '#c8a878'; c.beginPath(); c.ellipse(B[0] + 4, B[1], 9, 12, 0, 0, 7); c.fill(); c.strokeStyle = '#8a6a46'; c.lineWidth = 1.5; c.beginPath(); c.ellipse(B[0] + 4, B[1], 5, 7, 0, 0, 7); c.stroke();
    c.restore();
  }
  function drPine(c, seed) {
    c.fillStyle = '#4a3020'; c.fillRect(-5, -16, 10, 16);
    for (let k = 0; k < 4; k++) { const w = 38 - k * 8, y0 = -12 - k * 26, y1 = y0 - 44;
      gradPoly(c, [[-w, y0], [0, y1], [0, y0 + 8]], '#3e8a4a', '#1e5230', [-w, y0], [0, y1]);
      gradPoly(c, [[w, y0], [0, y1], [0, y0 + 8]], '#1d4a2a', '#123820', [w, y0], [0, y1]); }
  }
  function drBush(c, seed) {
    blobs(c, [[-16, -16, 20], [16, -14, 20], [0, -28, 22]], seed, ['#b0d870', '#5c9638', '#20461f']);
    c.fillStyle = '#ffe07a'; [[8, -40], [-20, -24], [22, -18]].forEach(([a, b]) => { c.beginPath(); c.arc(a, b, 3, 0, 7); c.fill(); });
  }
  function drRock(c, seed) {
    const g = c.createRadialGradient(-12, -30, 4, 0, -16, 34); g.addColorStop(0, '#d2cfc8'); g.addColorStop(0.5, '#8e8c88'); g.addColorStop(1, '#4a4a50');
    c.fillStyle = g; c.beginPath();
    for (let k = 0; k <= 14; k++) { const th = Math.PI + k / 14 * Math.PI, rr = 30 + hash(k, seed, 3) * 8; c.lineTo(Math.cos(th) * rr, Math.sin(th) * rr * 1.1 + 4); }
    c.lineTo(28, 8); c.lineTo(-28, 8); c.closePath(); c.fill();
    c.fillStyle = 'rgba(120,150,80,0.55)'; c.beginPath(); c.ellipse(-8, -30, 12, 5, -0.3, 0, 7); c.fill();
  }
  function drStove(c) {
    const a = 0.32, Wh = 26;
    const A = Q(-a, a, 0), B = Q(a, a, 0), Cc = Q(a, -a, 0), At = Q(-a, a, Wh), Bt = Q(a, a, Wh), Ct = Q(a, -a, Wh), Dt = Q(-a, -a, Wh);
    gradPoly(c, [A, B, Bt, At], '#b0603e', '#8a4a30', At, A); gradPoly(c, [B, Cc, Ct, Bt], '#7a3a24', '#5a2a18', Bt, B); poly(c, [At, Bt, Ct, Dt], '#c47a52');
    const m = lerp(A, B, 0.5); c.fillStyle = '#ff9a3a'; c.beginPath(); c.ellipse(m[0], m[1] - 12, 8, 6, 0, 0, 7); c.fill(); c.fillStyle = '#2a1408'; c.fillRect(m[0] - 9, m[1] - 8, 18, 3);
    const top = Q(0, 0, Wh); const g = c.createLinearGradient(top[0] - 18, 0, top[0] + 18, 0); g.addColorStop(0, '#6a6a72'); g.addColorStop(1, '#2e2e34');
    c.fillStyle = g; c.beginPath(); c.ellipse(top[0], top[1] - 12, 18, 9, 0, 0, Math.PI); c.lineTo(top[0] - 18, top[1] - 12); c.fill(); c.fillRect(top[0] - 18, top[1] - 26, 36, 14);
    c.fillStyle = '#8a8a92'; c.beginPath(); c.ellipse(top[0], top[1] - 26, 18, 8, 0, 0, 7); c.fill();
  }
  function drWell(c) {
    const ring = (y, rx, ry, col) => { c.fillStyle = col; c.beginPath(); c.ellipse(0, y, rx, ry, 0, 0, 7); c.fill(); };
    const g = c.createLinearGradient(-30, 0, 30, 0); g.addColorStop(0, '#b4a890'); g.addColorStop(1, '#6e6458');
    c.fillStyle = g; c.fillRect(-30, -22, 60, 22); ring(0, 30, 15, '#6e6458'); ring(-22, 30, 15, '#c8bca0'); ring(-22, 22, 10, '#2d5ea8'); ring(-22, 16, 6, '#4a86d0');
    c.fillStyle = '#5a3c24'; c.fillRect(-28, -76, 5, 56); c.fillRect(23, -76, 5, 56);
    gradPoly(c, [[-40, -70], [0, -96], [40, -70], [0, -62]], '#c2583a', '#8a3626', [0, -96], [0, -62]);
  }
  function drCrate(c) {
    const s = 26, hh = 36;
    gradPoly(c, [[-s, 0], [0, s / 2], [0, s / 2 - hh], [-s, -hh]], '#b07c46', '#8a5e34', [-s, -hh], [-s, 0]);
    gradPoly(c, [[s, 0], [0, s / 2], [0, s / 2 - hh], [s, -hh]], '#6e4826', '#553519', [s, -hh], [s, 0]);
    poly(c, [[0, -hh - s / 2], [s, -hh], [0, s / 2 - hh], [-s, -hh]], '#d6a266');
  }
  const DECOR = {
    t: { draw: (c, s) => G.m.pal === 'hutan' ? drJungle(c, s) : drTree(c, s, G.m.pal === 'savana'), w: 230, h: 270, sh: [16, 6, 38, 16] },
    J: { draw: drShroom, w: 120, h: 110, sh: [8, 4, 26, 10] },
    L: { draw: drLog, w: 150, h: 80, sh: [6, 6, 34, 12] },
    p: { draw: drPine, w: 120, h: 180, sh: [14, 6, 28, 12] },
    b: { draw: (c, s) => G.m.pal === 'hutan' ? drFern(c, s) : drBush(c, s), w: 110, h: 80, sh: [8, 4, 26, 10] },
    r: { draw: drRock, w: 100, h: 80, sh: [10, 4, 26, 10] },
    h: { draw: drHouse, w: 150, h: 190, sh: [20, 8, 34, 18] },
    k: { draw: drStove, w: 120, h: 120, sh: [10, 6, 24, 10] },
    s: { draw: drWell, w: 120, h: 150, sh: [12, 6, 26, 11] },
    X: { draw: drCrate, w: 80, h: 80, sh: [10, 6, 24, 10] },
  };
  function renderDecor(t) {
    const D = DECOR[t.t]; if (!D) return null;
    const w = D.w * R, h = D.h * R, c = mkCanvas(w, h), x = c.getContext('2d');
    x.translate(w / 2, h - 30 * R / 2); x.scale(R / 2 * 1.0, R / 2 * 1.0);
    D.draw(x, t.x * 7 + t.y * 13, false);
    return { cv: c, ax: w / 2, ay: h - 30 * R / 2 };
  }
  function bakeShadows() {
    const m = G.map;
    for (const row of m.tiles) for (const t of row) {
      const D = DECOR[t.t]; if (!D) continue;
      const [cx, cy] = iso(t.x, t.y, t.h);
      const [ox, oy, rx, ry] = D.sh;
      const sx = cx + ox, sy = cy + oy;
      for (let dy = -1; dy <= 2; dy++) for (let dx = -1; dx <= 2; dx++) {
        const n = T(t.x + dx, t.y + dy); if (!n || isSea(n)) continue;
        const cvT = G.tileC[n.y * m.w + n.x]; if (!cvT) continue;
        const [ncx, ncy] = iso(n.x, n.y, effH(n));
        const lx = (sx - (ncx - TW / 2)) * R, ly = (sy - (ncy - TH / 2)) * R;
        const g = cvT.getContext('2d');
        g.save(); g.beginPath(); g.moveTo(TW * R / 2, 0); g.lineTo(TW * R, TH * R / 2); g.lineTo(TW * R / 2, TH * R); g.lineTo(0, TH * R / 2); g.closePath(); g.clip();
        g.filter = 'blur(10px)'; g.fillStyle = 'rgba(14,20,44,0.38)'; g.beginPath(); g.ellipse(lx, ly, rx * R, ry * R, 0, 0, 7); g.fill(); g.restore();
      }
    }
  }
  function prepareMap() {
    const gp = GRASS[G.m.pal] || GRASS.kebun;
    G.tileC = []; G.decC = [];
    for (const row of G.map.tiles) for (const t of row) {
      if (isSea(t)) continue;
      G.tileC[t.y * G.map.w + t.x] = renderTile(t, gp);
      G.decC[t.y * G.map.w + t.x] = renderDecor(t);
    }
    bakeShadows();
  }
  const W2S = (wx, wy) => [cam.x + wx * cam.z, cam.y + wy * cam.z];
  let BG = null;
  function bgCanvas() {
    const pal = G && G.m.pal === 'hutan' ? 'hutan' : 'x';
    if (BG && BG.w === VW && BG.h === VH && BG.pal === pal) return BG;
    const back = mkCanvas(Math.round(VW * DPR), Math.round(VH * DPR)), b = back.getContext('2d');
    b.scale(DPR, DPR);
    const g = b.createRadialGradient(VW * 0.5, VH * 0.35, 0, VW * 0.5, VH * 0.5, Math.max(VW, VH) * 0.8);
    if (pal === 'hutan') { g.addColorStop(0, '#2c5a4c'); g.addColorStop(0.55, '#0f2e2a'); g.addColorStop(1, '#030c0c'); }
    else { g.addColorStop(0, '#2f5ea8'); g.addColorStop(0.55, '#14336e'); g.addColorStop(1, '#050d26'); } b.fillStyle = g; b.fillRect(0, 0, VW, VH);
    const front = mkCanvas(Math.round(VW * DPR), Math.round(VH * DPR)), f = front.getContext('2d');
    f.scale(DPR, DPR);
    const lg = f.createLinearGradient(0, 0, VW, VH); lg.addColorStop(0, 'rgba(255,214,150,0.10)'); lg.addColorStop(0.55, 'rgba(255,214,150,0)'); lg.addColorStop(1, 'rgba(30,50,130,0.14)');
    f.fillStyle = lg; f.fillRect(0, 0, VW, VH);
    const vg = f.createRadialGradient(VW / 2, VH / 2, Math.min(VW, VH) * 0.4, VW / 2, VH / 2, Math.max(VW, VH) * 0.78);
    vg.addColorStop(0, 'rgba(0,0,12,0)'); vg.addColorStop(1, 'rgba(0,0,12,0.55)'); f.fillStyle = vg; f.fillRect(0, 0, VW, VH);
    return (BG = { w: VW, h: VH, pal, back, front });
  }
  function diamond(c, cx, cy, s = 0.92) { const hw = TW / 2 * R * s, hh = TH / 2 * R * s; c.beginPath(); c.moveTo(cx, cy - hh); c.lineTo(cx + hw, cy); c.lineTo(cx, cy + hh); c.lineTo(cx - hw, cy); c.closePath(); }
  function drawHighlight(c, cx, cy, hl, tm) {
    c.save(); diamond(c, cx, cy);
    const pulse = hl.pulse ? 0.75 + 0.25 * Math.sin(tm * 6) : 1;
    const g = c.createRadialGradient(cx, cy, 4, cx, cy, TW / 2 * R); g.addColorStop(0, hl.fill0); g.addColorStop(1, hl.fill1);
    c.globalAlpha = pulse; c.fillStyle = g; c.fill();
    if (hl.edge) { c.shadowColor = hl.glow || hl.edge; c.shadowBlur = 10; c.strokeStyle = hl.edge; c.lineWidth = 2.5; c.stroke(); }
    c.restore();
  }
  function drawUnitWorld(c, u, p, tm) {
    let alpha = u.alpha;
    if (u.fade) alpha = clamp(1 - (tm - u.fade) / 0.6, 0, 1);
    if (alpha <= 0) return;
    const big = SPR.big(u.key), ax = p.sx * R, ay = p.sy * R;
    let drop = 0; if (u.dropIn) { const k = clamp((tm - u.dropIn) / 0.4, 0, 1); drop = (1 - k) * -80 * R; if (k >= 1) u.dropIn = null; }
    c.save(); c.globalAlpha = alpha;
    const rw = (big ? 25 : 19) * R, rh = (big ? 10 : 7.5) * R;
    const sg = c.createRadialGradient(ax, ay, 2, ax, ay, rw);
    sg.addColorStop(0, 'rgba(10,14,34,0.55)'); sg.addColorStop(1, 'rgba(10,14,34,0)');
    c.fillStyle = sg; c.beginPath(); c.ellipse(ax, ay, rw * 1.1, rh * 1.2, 0, 0, 7); c.fill();
    if (u.alive) {
      const tg = G.targets && G.targets.get(key(u.x, u.y)), sel = G.sel === u;
      let col = u.team === 'p' ? (u.done && G.phase === 'player' ? 'rgba(170,180,195,0.8)' : 'rgba(150,215,255,0.95)') : u.team === 'e' ? 'rgba(255,140,120,0.95)' : 'rgba(140,240,160,0.95)';
      if (tg) col = G.tkind === 'ally' ? 'rgba(150,255,170,1)' : 'rgba(255,225,110,1)';
      if (sel) col = 'rgba(255,230,120,1)';
      c.save(); c.shadowColor = col; c.shadowBlur = tg || sel ? 14 + 6 * Math.sin(tm * 6) : 8;
      c.strokeStyle = col; c.lineWidth = tg || sel ? 3.5 : 2.5; c.beginPath(); c.ellipse(ax, ay, rw, rh, 0, 0, 7); c.stroke(); c.restore();
    }
    if (u.buffs.sabuk > 0 && u.alive) {
      c.save(); c.globalCompositeOperation = 'lighter';
      const gg = c.createRadialGradient(ax, ay - 30 * R, 4, ax, ay - 30 * R, 46 * R); gg.addColorStop(0, 'rgba(255,210,90,0.35)'); gg.addColorStop(1, 'rgba(255,210,90,0)');
      c.fillStyle = gg; c.fillRect(ax - 50 * R, ay - 80 * R, 100 * R, 100 * R); c.restore();
    }
    const done = u.team === 'p' && u.done && G.phase === 'player' && u.alive;
    c.globalAlpha = alpha * (done ? 0.8 : 1);
    c.save(); c.translate(ax + u.ox * R, ay - p.hop * R + drop);
    SPR.draw(c, u.key, u.facing, u.alive || u.anim === 'faint' ? u.anim : 'faint', clamp((tm - u.a0) / u.adur, 0, 1), tm, { seed: u.id, spin: u.spin, pose: u.pose });
    c.restore();
    c.globalAlpha = 1;
    if (u.alive) {
      const hh = (SPR.height(u.key) + 10) * R, bw = (big ? 40 : 30) * R, by = ay - hh - p.hop * R + drop;
      c.fillStyle = 'rgba(8,12,30,0.85)'; c.beginPath(); c.roundRect(ax - bw / 2 - 3, by - 3, bw + 6, 12, 4); c.fill();
      const k = u.hp / u.maxhp;
      const hg = c.createLinearGradient(0, by, 0, by + 6);
      if (u.team === 'e') { hg.addColorStop(0, '#ff9a8a'); hg.addColorStop(1, '#c8382c'); }
      else if (k > 0.5) { hg.addColorStop(0, '#a8f0a0'); hg.addColorStop(1, '#3aa24a'); }
      else if (k > 0.25) { hg.addColorStop(0, '#ffe08a'); hg.addColorStop(1, '#d9a21a'); }
      else { hg.addColorStop(0, '#ff9a8a'); hg.addColorStop(1, '#c8382c'); }
      c.fillStyle = hg; c.beginPath(); c.roundRect(ax - bw / 2, by, Math.max(2, bw * k), 6, 3); c.fill();
    }
    c.restore();
  }
  function drawFlag(c, ax, ay, tm) {
    c.fillStyle = '#5a3c24'; c.fillRect(ax - 2, ay - 70 * R / 2, 4, 70 * R / 2);
    const w = Math.sin(tm * 4) * 4;
    c.beginPath(); c.moveTo(ax + 2, ay - 70 * R / 2); c.quadraticCurveTo(ax + 24, ay - 66 * R / 2 + w, ax + 48, ay - 62 * R / 2 + w * 1.5); c.lineTo(ax + 2, ay - 48 * R / 2); c.closePath();
    const g = c.createLinearGradient(ax, 0, ax + 48, 0); g.addColorStop(0, '#e5402f'); g.addColorStop(1, '#a8241a'); c.fillStyle = g; c.fill();
    c.fillStyle = '#ffd84d'; c.beginPath(); c.arc(ax + 16, ay - 60 * R / 2 + w * 0.5, 5, 0, 7); c.fill();
  }
  function renderBattle(tm) {
    if (!G.tileC) prepareMap();
    const bg = bgCanvas();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg.back, 0, 0);
    const s = DPR * cam.z / R;
    ctx.setTransform(s, 0, 0, s, DPR * cam.x, DPR * cam.y);
    ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
    G.hl = buildHighlights();
    const m = G.map, maxD = m.w + m.h - 2, buckets = [];
    for (const u of G.units) { if (u.gone || !seen(u)) continue; const p = unitWorld(u); const d = Math.ceil(p.rx + p.ry - 0.001); (buckets[d] = buckets[d] || []).push([u, p]); }
    for (let d = 0; d <= maxD; d++) {
      const x0 = Math.max(0, d - (m.h - 1)), x1 = Math.min(m.w - 1, d);
      for (let x = x0; x <= x1; x++) {
        const t = m.tiles[d - x][x]; if (isSea(t)) continue;
        const [cx, cy] = iso(t.x, t.y, effH(t));
        ctx.drawImage(G.tileC[t.y * m.w + x], (cx - TW / 2) * R, (cy - TH / 2) * R);
        const hl = G.hl.get(key(t.x, t.y));
        if (hl) drawHighlight(ctx, cx * R, cy * R, hl, tm);
        if (G.m.fog && fogTile(t.x, t.y)) { diamond(ctx, cx * R, cy * R, 1.02); ctx.fillStyle = 'rgba(196,214,206,0.62)'; ctx.fill(); }
      }
      for (let x = x0; x <= x1; x++) {
        const t = m.tiles[d - x][x]; if (isSea(t)) continue;
        const dc = G.decC[t.y * m.w + x], [cx, cy] = iso(t.x, t.y, t.h);
        if (dc) ctx.drawImage(dc.cv, cx * R - dc.ax, cy * R - dc.ay);
        if (t.t === 'f') drawFlag(ctx, cx * R, cy * R, tm);
        if (t.t === 'k') { ctx.fillStyle = 'rgba(255,255,255,0.55)'; for (let i = 0; i < 3; i++) { const o = (tm * 18 + i * 12) % 36; ctx.beginPath(); ctx.arc(cx * R + Math.sin(tm * 2 + i) * 6, cy * R - 54 - o * 1.6, 5 + o * 0.2, 0, 7); ctx.globalAlpha = 1 - o / 36; ctx.fill(); } ctx.globalAlpha = 1; }
      }
      if (buckets[d]) buckets[d].sort((a, b) => a[1].rx - b[1].rx).forEach(([u, p]) => drawUnitWorld(ctx, u, p, tm));
    }
    G.parts = G.parts.filter(q => tm - q.t0 < q.life);
    for (const q of G.parts) {
      const k = tm - q.t0, x = (q.x + q.vx * k) * R, y = (q.y + q.vy * k + 80 * k * k) * R;
      ctx.globalAlpha = 1 - k / q.life; ctx.fillStyle = q.c; ctx.beginPath(); ctx.arc(x, y, 4, 0, 7); ctx.fill();
    }
    ctx.globalAlpha = 1;
    if (G.m.pal === 'hutan') drawForestAir(ctx, tm);
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg.front, 0, 0);
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    drawOverlays(ctx, tm);
  }
  function drawForestAir(c, tm) { // kabut tipis melayang, berkas cahaya, kunang-kunang
    const m = G.map, [ax, ay] = iso(0, 0, 0), [bx, by] = iso(m.w - 1, m.h - 1, 0), [lx] = iso(0, m.h - 1, 0), [rx] = iso(m.w - 1, 0, 0);
    const cx = (lx + rx) / 2 * R, cy = (ay + by) / 2 * R, W = (rx - lx) * R, H = (by - ay) * R;
    c.save(); c.globalCompositeOperation = 'screen';
    for (let k = 0; k < 3; k++) { const x0 = cx - W * 0.5 + ((k * 0.37 + tm * 0.008) % 1) * W * 1.2 - W * 0.1;
      const g = c.createLinearGradient(x0, cy - H, x0 + W * 0.18, cy + H * 0.2); g.addColorStop(0, 'rgba(220,255,200,0.10)'); g.addColorStop(1, 'rgba(220,255,200,0)');
      c.fillStyle = g; c.beginPath(); c.moveTo(x0, cy - H); c.lineTo(x0 + W * 0.08, cy - H); c.lineTo(x0 + W * 0.24, cy + H * 0.3); c.lineTo(x0 + W * 0.12, cy + H * 0.3); c.fill(); }
    c.globalCompositeOperation = 'source-over';
    for (let k = 0; k < (G.m.fog ? 12 : 7); k++) { const sp = 0.012 + hash(k, 1, 80) * 0.01, ph = hash(k, 2, 80);
      const x = cx - W * 0.6 + ((ph + tm * sp) % 1) * W * 1.2, y = cy - H * 0.35 + hash(k, 3, 80) * H * 0.8 + Math.sin(tm * 0.3 + k) * 20;
      const r = W * (0.12 + hash(k, 4, 80) * 0.1), g = c.createRadialGradient(x, y, 0, x, y, r);
      g.addColorStop(0, 'rgba(210,235,215,0.16)'); g.addColorStop(1, 'rgba(210,235,215,0)'); c.fillStyle = g; c.beginPath(); c.ellipse(x, y, r, r * 0.38, 0, 0, 7); c.fill(); }
    for (let k = 0; k < 18; k++) { const x = cx + (hash(k, 5, 81) - 0.5) * W * 0.9 + Math.sin(tm * 0.7 + k * 1.7) * 26, y = cy + (hash(k, 6, 81) - 0.6) * H * 0.9 + Math.cos(tm * 0.9 + k) * 18;
      const a = 0.35 + 0.65 * Math.max(0, Math.sin(tm * 2.2 + k * 2.3)); const g = c.createRadialGradient(x, y, 0, x, y, 14);
      g.addColorStop(0, `rgba(240,255,150,${a})`); g.addColorStop(1, 'rgba(240,255,150,0)'); c.fillStyle = g; c.beginPath(); c.arc(x, y, 14, 0, 7); c.fill(); }
    c.restore();
  }
  function txt(c, s, x, y, size, color, stroke = 'rgba(8,10,30,0.9)') {
    c.font = `700 ${size}px Fredoka, sans-serif`; c.textAlign = 'center'; c.lineJoin = 'round';
    c.lineWidth = Math.max(3, size / 4); c.strokeStyle = stroke; c.strokeText(s, x, y); c.fillStyle = color; c.fillText(s, x, y);
  }
  function drawOverlays(c, tm) {
    const z = cam.z;
    for (const u of G.units) {
      if (u.gone || (!u.alive && u.team === 'e') || !seen(u)) continue;
      const p = unitWorld(u), hh = SPR.height(u.key);
      const [sx, sy] = W2S(p.sx, p.sy - p.hop - hh - 14);
      if (!u.alive) { c.font = `${Math.round(clamp(9 * z, 14, 26))}px sans-serif`; c.textAlign = 'center'; c.fillText('💫', ...W2S(p.sx + Math.sin(tm * 3) * 5, p.sy - 20)); continue; }
      const icons = [];
      if (u.buffs.benteng > 0) icons.push('🛡️');
      if (u.buffs.taunt > 0) icons.push('📣');
      if (u.status.pedas > 0) icons.push('🥵');
      if (u.status.tidur > 0 || u.sleeping) icons.push('😴');
      if (u.status.racun > 0) icons.push('🤢');
      if (u.buffs.sabuk > 0) icons.push('🥋');
      if (u.team === 'e' && !u.aggroOn && u.aggro < 50) icons.push('💤');
      if (u.boss) icons.push('👑');
      if (icons.length) { c.font = `${Math.round(clamp(8 * z, 12, 22))}px sans-serif`; c.textAlign = 'center'; c.fillText(icons.join(''), sx, sy - 2); }
    }
    if (G.mode === 'target' && G.targets) {
      for (const tg of G.targets.values()) {
        const p = unitWorld(tg), hh = SPR.height(tg.key);
        let label = '', color = '#fff';
        if (G.tkind === 'attack' || G.tkind === 'enemy') {
          let r;
          if (G.tkind === 'attack') r = calcDmg(G.sel, tg);
          else if (G.skill === 'kilat') { const one = calcDmg(G.sel, tg, { mult: 0.75 }); r = { dmg: one.dmg * 2, side: one.side }; }
          else if (G.skill === 'jitu') r = calcDmg(G.sel, tg, { mult: 1.3, pierce: true });
          else if (G.skill === 'hujan') r = calcDmg(G.sel, tg, { mult: 1 });
          else r = calcDmg(G.sel, tg, { flat: effAtk(G.sel) + 5 + (G.sel.lv - 1), pierce: true });
          label = (r.dmg >= tg.hp ? '💥 ' : '') + '-' + r.dmg + (r.side === 'back' ? ' ↩' : '');
          color = r.dmg >= tg.hp ? '#ffe14d' : '#ffffff';
        } else { label = '+' + Math.min(10 + 2 * (G.sel.lv - 1), tg.maxhp - tg.hp); color = '#8cff8c'; }
        const [sx, sy] = W2S(p.sx, p.sy - hh - 30);
        txt(c, label, sx, sy + Math.sin(tm * 5) * 2, clamp(11 * z, 16, 28), color);
      }
    }
    G.projs = G.projs.filter(pr => tm - pr.t0 < pr.dur + 0.05);
    for (const pr of G.projs) {
      const k = clamp((tm - pr.t0) / pr.dur, 0, 1);
      const arc = pr.arc || 48, [x, y] = W2S(pr.ax + (pr.bx - pr.ax) * k, pr.ay + (pr.by - pr.ay) * k - Math.sin(k * Math.PI) * arc);
      if (pr.e === 'arrow') {
        const vx = pr.bx - pr.ax, vy = (pr.by - pr.ay) - Math.cos(k * Math.PI) * Math.PI * arc, L = clamp(10 * z, 14, 30), an = Math.atan2(vy, vx);
        c.save(); c.translate(x, y); c.rotate(an); c.lineCap = 'round';
        c.strokeStyle = '#5a3a20'; c.lineWidth = Math.max(2, z * 1.2); c.beginPath(); c.moveTo(-L, 0); c.lineTo(L * 0.7, 0); c.stroke();
        c.fillStyle = '#d8d8e0'; c.beginPath(); c.moveTo(L, 0); c.lineTo(L * 0.6, -L * 0.18); c.lineTo(L * 0.6, L * 0.18); c.fill();
        c.fillStyle = '#e8473a'; c.beginPath(); c.moveTo(-L, 0); c.lineTo(-L * 0.7, -L * 0.22); c.lineTo(-L * 0.55, 0); c.lineTo(-L * 0.7, L * 0.22); c.fill(); c.restore(); continue;
      }
      c.save(); c.translate(x, y); c.rotate(k * 8); c.font = `${Math.round(clamp(12 * z, 16, 34))}px sans-serif`; c.textAlign = 'center'; c.textBaseline = 'middle'; c.fillText(pr.e, 0, 0); c.restore();
    }
    G.texts = G.texts.filter(tx => tm - tx.t0 < tx.dur);
    for (const tx of G.texts) {
      if (tm < tx.t0) continue;
      const k = (tm - tx.t0) / tx.dur;
      const [x, y] = W2S(tx.x, tx.y - k * 30);
      c.globalAlpha = k > 0.75 ? (1 - k) / 0.25 : 1;
      txt(c, tx.text, x, y, Math.round(clamp(tx.size * z * 1.15, 13, 34)), tx.color);
    }
    c.globalAlpha = 1;
  }
  const HL = {
    move: { fill0: 'rgba(120,190,255,0.16)', fill1: 'rgba(120,190,255,0.5)', edge: 'rgba(225,242,255,0.95)', glow: 'rgba(160,215,255,0.9)' },
    range: { fill0: 'rgba(255,120,100,0.08)', fill1: 'rgba(255,120,100,0.3)' },
    rangeAlly: { fill0: 'rgba(120,255,150,0.08)', fill1: 'rgba(120,255,150,0.3)' },
    target: { fill0: 'rgba(255,90,70,0.25)', fill1: 'rgba(255,90,70,0.65)', edge: 'rgba(255,230,220,0.95)', glow: 'rgba(255,120,90,0.9)', pulse: true },
    targetAlly: { fill0: 'rgba(90,255,130,0.2)', fill1: 'rgba(90,255,130,0.6)', edge: 'rgba(225,255,230,0.95)', glow: 'rgba(120,255,150,0.9)', pulse: true },
    enemyReach: { fill0: 'rgba(255,170,70,0.12)', fill1: 'rgba(255,170,70,0.42)', edge: 'rgba(255,225,170,0.8)' },
    sel: { fill0: 'rgba(255,225,90,0.2)', fill1: 'rgba(255,225,90,0.55)', edge: 'rgba(255,245,200,1)', glow: 'rgba(255,215,90,1)', pulse: true },
    flag: { fill0: 'rgba(255,215,80,0.2)', fill1: 'rgba(255,215,80,0.55)', edge: 'rgba(255,240,180,0.95)', pulse: true },
  };
  function buildHighlights() {
    const hl = new Map();
    if (!G || G.phase !== 'player') return hl;
    if (G.m.type === 'reach') for (const row of G.map.tiles) for (const t of row) if (t.t === 'f') hl.set(key(t.x, t.y), HL.flag);
    if (G.mode === 'move' && G.reach) for (const [k] of G.reach) hl.set(k, HL.move);
    if (G.mode === 'target') {
      if (G.rangeTiles) for (const k of G.rangeTiles) hl.set(k, G.tkind === 'ally' ? HL.rangeAlly : HL.range);
      if (G.targets) for (const k of G.targets.keys()) hl.set(k, G.tkind === 'ally' ? HL.targetAlly : HL.target);
    }
    if (G.info && G.info.team === 'e' && G.info.alive && G.mode === 'idle') for (const [k] of reach(G.info)) hl.set(k, HL.enemyReach);
    if (G.sel) hl.set(key(G.sel.x, G.sel.y), HL.sel);
    return hl;
  }
  function renderMenuBg(tm) {
    const bg = bgCanvas();
    ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.drawImage(bg.back, 0, 0); ctx.drawImage(bg.front, 0, 0);
  }
  let last = now();
  function frame() {
    const tm = now(), dt = Math.min(0.05, tm - last); last = tm;
    try {
      if (G) {
        if (cam.tx != null) { const k = Math.min(1, dt * 6); cam.x += (cam.tx - cam.x) * k; cam.y += (cam.ty - cam.y) * k; if (Math.abs(cam.tx - cam.x) < 0.5 && Math.abs(cam.ty - cam.y) < 0.5) cam.tx = cam.ty = null; }
        renderBattle(tm);
      } else renderMenuBg(tm);
    } catch (e) { console.error(e); }
    requestAnimationFrame(frame);
  }

  /* ---------------- UI pertempuran ---------------- */
  function objText() {
    const m = G.m; let s = '';
    if (m.type === 'rout') s = 'Kalahkan semua musuh';
    else if (m.type === 'boss') { const b = G.units.find(u => u.boss); s = 'Kalahkan ' + (b ? b.name : 'bos') + ' 👑'; }
    else if (m.type === 'survive') s = `Bertahan: giliran ${G.turn}/${m.n}`;
    else if (m.type === 'reach') s = `Capai bendera 🚩 · sisa ${m.limit - G.turn + 1} giliran`;
    if (m.protect) s += ' · Jaga ' + (CHARS[m.protect] || NPCS[m.protect]).name;
    return s;
  }
  function showBattleUI() {
    scr.classList.remove('on'); scr.innerHTML = '';
    hud.hidden = false; panel.hidden = false; renderHUD(); renderPanel();
  }
  function renderHUD() {
    if (!G) { hud.hidden = true; return; }
    hud.innerHTML = '';
    hud.append(
      btn('☰', openBattleMenu, 'icon'),
      h('div', { class: 'hmid' }, h('div', { class: 'htitle' }, `Misi ${G.m.no} · ${G.m.name}`), h('div', { class: 'hobj' }, '🎯 ' + objText())),
      h('div', { class: 'hsp' }),
      h('div', { class: 'hturn' }, h('small', {}, 'Giliran'), h('b', {}, G.turn)),
      h('div', { class: 'zoom' }, btn('−', () => zoomAt(VW / 2, VH / 2, cam.z / 1.2), 'icon sm'), btn('+', () => zoomAt(VW / 2, VH / 2, cam.z * 1.2), 'icon sm'), btn('⌖', () => fitCam(), 'icon sm')),
    );
  }
  function spStars(u) { return h('span', { class: 'sp' }, h('span', { class: 'on' }, '★'.repeat(u.sp)), h('span', { class: 'off' }, '★'.repeat(5 - u.sp))); }
  function unitCard(u) {
    const k = u.hp / u.maxhp;
    const info = u.team === 'p' ? `${CHARS[u.key].job} · Lv ${u.lv}` : u.team === 'e' ? (u.aggroOn || u.aggro >= 50 ? 'Musuh' : 'Musuh · belum melihatmu 💤') : 'Harus dilindungi';
    const chips = [];
    if (u.buffs.sabuk > 0) chips.push(`🥋 Sabuk Hitam ${u.buffs.sabuk}`);
    if (u.buffs.benteng > 0) chips.push('🛡️ Benteng');
    if (u.buffs.taunt > 0) chips.push('📣 Menantang');
    if (u.status.pedas > 0) chips.push('🥵 Kepedasan');
    if (u.status.tidur > 0 || u.sleeping) chips.push('😴 Tertidur');
    if (u.status.racun > 0) chips.push(`🤢 Racun ${u.status.racun}`);
    if (u.team === 'p' && T(u.x, u.y).t === 'm') chips.push('🟫 Di lumpur');
    const range = u.rmax > 1 ? `${u.rmin}-${u.rmax}` : '1';
    return h('div', { class: 'ucard ' + u.team },
      portrait(u.key, 46),
      h('div', { class: 'ubody' },
        h('div', { class: 'uname' }, u.name, h('small', {}, ' ' + info)),
        h('div', { class: 'hpbar' }, h('i', { style: `width:${k * 100}%;background:${u.team === 'e' ? '#ff5a4d' : k > 0.5 ? '#5ad35a' : k > 0.25 ? '#ffc93d' : '#ff5a4d'}` }), h('span', {}, `Nyawa ${u.hp}/${u.maxhp}`)),
        h('div', { class: 'ustats' },
          u.team === 'p' ? h('span', {}, 'Semangat ', spStars(u)) : null,
          h('span', {}, `⚔️${effAtk(u)} 🛡️${effDef(u)} 👣${u.mov} 🎯${range}`),
          chips.map(c => h('span', { class: 'chip' }, c)))));
  }
  function renderPanel() {
    if (!G) { panel.hidden = true; return; }
    panel.hidden = false; panel.innerHTML = '';
    if (G.ended) return;
    if (G.phase !== 'player') { panel.append(h('div', { class: 'ctrl' }, h('div', { class: 'pmsg' }, G.phase === 'enemy' ? '👀 Musuh sedang bergerak...' : ''))); return; }
    const u = G.sel;
    const show = u || G.info;
    if (show) panel.append(unitCard(show));
    const ctrl = h('div', { class: 'ctrl' });
    const row = h('div', { class: 'btns' });
    const hint = s => ctrl.append(h('div', { class: 'phint' }, s));
    switch (G.mode) {
      case 'idle': {
        const left = pteam().filter(v => v.alive && !v.done).length;
        hint(G.info ? 'Tap temanmu (cincin biru) untuk memberi perintah.' : `Tap temanmu yang bercincin biru. Sisa ${left} yang belum bergerak.`);
        if (G.info) row.append(btn('✖ Tutup', clearSel));
        row.append(btn('🏁 Akhiri Giliran', endPlayerTurn, 'warn'));
        break;
      }
      case 'move':
        hint('Tap petak biru untuk berjalan, atau tetap di sini.');
        row.append(btn('📍 Tetap di sini', toAction, 'pri'), btn('✖ Batal', clearSel));
        break;
      case 'action':
        row.append(btn('👊 Serang', attackMode, 'pri'), btn('✨ Jurus', () => { G.mode = 'skills'; renderPanel(); }, 'pri2'),
          btn(`🍯 Madu ×${u.item}`, useItem), btn('✋ Selesai', () => finishUnit(u)),
          u.moved ? btn('↩ Ulang jalan', undoMove) : btn('✖ Batal', clearSel));
        break;
      case 'skills': {
        const list = h('div', { class: 'skills' });
        for (const sk of u.skills) {
          const d = SKILLS[sk], ok = u.sp >= d.cost;
          list.append(h('button', { class: 'skill' + (ok ? '' : ' dim'), onclick: (ev) => { ev.stopPropagation(); Sound.play('tap'); chooseSkill(sk); } },
            h('span', { class: 'sicon' }, d.icon),
            h('span', { class: 'stext' }, h('b', {}, d.name), h('small', {}, d.desc)),
            h('span', { class: 'scost' }, '★'.repeat(d.cost))));
        }
        ctrl.append(list);
        row.append(btn('↩ Kembali', toAction));
        break;
      }
      case 'target':
        hint(G.tkind === 'ally' ? 'Tap teman yang bercincin hijau.' : 'Tap musuh yang menyala merah. Angka = kerusakan, 💥 = langsung kalah.');
        row.append(btn('↩ Kembali', toAction));
        break;
      case 'busy': break;
    }
    if (row.childNodes.length) ctrl.append(row);
    if (ctrl.childNodes.length) panel.append(ctrl);
    requestAnimationFrame(() => { if (G && G.sel) focus(G.sel, true); });
  }
  function openBattleMenu() {
    const sw = (label, k) => h('label', { class: 'switch' }, h('input', { type: 'checkbox', checked: Sound.st[k] ? '' : false, onchange: e => { Sound.st[k] = e.target.checked; S.snd[k] = e.target.checked; persist(); if (k === 'music') { if (e.target.checked) Sound.startMusic(G ? G.m.music : 'calm'); else Sound.stopMusic(); } } }), h('span', {}, label));
    overlay(h('div', { class: 'card' },
      h('div', { class: 'rtitle sm' }, 'Jeda'),
      sw('🗣️ Suara cerita', 'voice'), sw('🔊 Efek suara', 'sfx'), sw('🎵 Musik', 'music'),
      h('div', { class: 'col' },
        btn('▶ Lanjut main', closeOverlay, 'pri'),
        btn('🔁 Ulangi misi', () => { closeOverlay(); startMission(G.m, { skipStory: true }); }),
        btn('🗺️ Keluar ke peta', () => { closeOverlay(); goMap(); }))));
  }

  /* ---------------- Banner, tips, toast ---------------- */
  function banner(text, kind) {
    bannerEl.className = 'show ' + kind; bannerEl.textContent = text;
    return new Promise(r => setTimeout(() => { bannerEl.className = ''; r(); }, kind === 'mission' ? 1600 : 1100));
  }
  function showSkillName(t) {
    const e = h('div', { class: 'skillname' }, t); document.body.append(e);
    setTimeout(() => e.remove(), 1300);
  }
  let toastT = null;
  function toast(t) {
    tipEl.className = 'show toast'; tipEl.innerHTML = ''; tipEl.append(h('span', {}, t));
    clearTimeout(toastT); toastT = setTimeout(() => { tipEl.className = ''; }, 2200);
  }
  function showTip(text, auto = false) {
    return new Promise(res => {
      clearTimeout(toastT);
      tipEl.className = 'show'; tipEl.innerHTML = '';
      const done = () => { tipEl.className = ''; res(); };
      tipEl.append(h('span', { class: 'tipi' }, '💡'), h('span', {}, text));
      if (!auto) tipEl.append(btn('Oke', done, 'pri sm'));
      if (auto) setTimeout(done, 1800);
    });
  }
  const TUT = {
    start: 'Tap Ata yang bercincin biru untuk memilihnya.',
    select: 'Petak biru adalah tempat Ata bisa berjalan. Tap salah satunya!',
    action: 'Kalau musuh ada di sebelahmu, tekan Serang. Kalau belum, tekan Selesai.',
    attack: 'Lihat arah hadap musuh! Menyerang dari belakang membuat kerusakan jauh lebih besar.',
    turn2: 'Setiap giliran, Semangat bertambah satu bintang. Pakai bintang untuk Jurus!',
  };
  function tutTip(k) { if (G.tipsSeen[k]) return; G.tipsSeen[k] = true; setTimeout(() => { if (G && !G.ended) showTip(TUT[k], false); }, k === 'start' ? 1200 : 200); }

  /* ---------------- Dialog cerita ---------------- */
  let dlgOpen = false;
  function playStory(lines) {
    if (!lines || !lines.length) return Promise.resolve();
    return new Promise(res => {
      dlgOpen = true; let i = 0;
      const finish = () => { dlgOpen = false; dlg.className = ''; dlg.innerHTML = ''; Sound.hush(); res(); };
      const show = () => {
        if (i >= lines.length) return finish();
        const [who, text] = lines[i], w = WHO[who] || WHO.narator;
        dlg.className = 'show' + (w.kind ? '' : ' narr'); dlg.innerHTML = '';
        dlg.append(
          h('div', { class: 'dbox', onclick: () => { Sound.play('tap'); i++; show(); } },
            w.kind ? h('div', { class: 'dpt' }, portrait(w.kind, 72)) : null,
            h('div', { class: 'dtext' }, w.name ? h('div', { class: 'dname' }, w.name) : null, h('p', {}, text), h('div', { class: 'dnext' }, i < lines.length - 1 ? 'Tap untuk lanjut ▶' : 'Tap untuk mulai ▶'))),
          btn('Lewati ⏭', finish, 'skip sm'));
        Sound.speak(text, w.voice[0], w.voice[1]);
      };
      show();
    });
  }

  /* ---------------- Overlay umum ---------------- */
  const ov = $('#ov');
  function overlay(node) { ov.innerHTML = ''; ov.append(node); ov.className = 'show'; }
  function closeOverlay() { ov.className = ''; ov.innerHTML = ''; }
  function recruitPopup(k) {
    return new Promise(res => {
      Sound.play('power'); Sound.speak(CHARS[k].name + ' bergabung!', 1.3);
      overlay(h('div', { class: 'card recruit' },
        h('div', { class: 'rtitle' }, CHARS[k].name + ' bergabung! 🎉'),
        h('div', { class: 'rpt' }, portrait(k, 120)),
        h('p', {}, h('b', {}, CHARS[k].job), ' · ', CHARS[k].desc),
        h('ul', { class: 'conds' }, CHARS[k].skills.map(s => h('li', { class: 'ok' }, SKILLS[s].icon + ' ' + SKILLS[s].name + ': ' + SKILLS[s].desc))),
        btn('Hore! ▶', () => { closeOverlay(); res(); }, 'pri')));
    });
  }
  const CHAPTERS = {
    1: { name: 'Savana', icon: '🌾', end: 'Ata, Ladhia, dan Bubunti siap melanjutkan perjalanan ke Hutan Lembab.', team: ['ladhia', 'ata', 'bubunti'] },
    2: { name: 'Hutan Lembab', icon: '🌿', end: 'Oumaldi bergabung, Ular Beracun kalah, dan sobekan peta menunjuk ke Rawa Bulan.', team: ['ladhia', 'ata', 'bubunti', 'oumaldi'] },
  };
  const NEXT = { 1: 'Bab 2: Hutan Lembab dan Ular Beracun. Teman baru: Oumaldi si tupai pemanah.', 2: 'Bab 3: Rawa Bulan dan Buaya Serakah. Teman baru: Tung Momon & Tung Yanto. Segera hadir!' };
  async function chapterEnd(m) {
    const ch = m.chap || 1, C_ = CHAPTERS[ch];
    G = null; hud.hidden = true; panel.hidden = true;
    Sound.startMusic('calm');
    scr.innerHTML = ''; scr.classList.add('on');
    scr.append(h('div', { class: 'title end' },
      h('div', { class: 'tsmall' }, 'Bab ' + ch + ' selesai!'),
      h('h1', {}, C_.name),
      h('div', { class: 'trio' }, C_.team.map(k => portrait(k, k === 'ata' ? 100 : 86))),
      h('p', {}, C_.end),
      h('p', { class: 'muted' }, NEXT[ch]),
      btn('🗺️ Kembali ke peta', goMap, 'pri big')));
    Sound.speak('Bab ' + (ch === 1 ? 'satu' : 'dua') + ' selesai! Petualangan berlanjut!', 1.2);
  }

  /* ---------------- Layar menu ---------------- */
  function screen(...kids) { G = null; hud.hidden = true; panel.hidden = true; closeOverlay(); scr.innerHTML = ''; scr.append(...kids); scr.classList.add('on'); scr.scrollTop = 0; }
  function topbar(title, back) {
    return h('div', { class: 'topbar' }, back ? btn('←', back, 'icon') : h('span'), h('div', { class: 'ttl' }, title), h('div', { class: 'honey' }, '🍯 ' + S.madu));
  }
  function goTitle() {
    Sound.stopMusic();
    const started = Object.keys(S.cleared).length > 0 || S.seen.prolog;
    screen(h('div', { class: 'title' },
      h('div', { class: 'tsmall' }, 'Petualangan Dunia Satwa'),
      h('h1', {}, 'Ata dan Madu Legendaris', h('span', {}, 'Taktik')),
      h('div', { class: 'trio' }, portrait('ladhia', 96), portrait('ata', 120), portrait('bubunti', 96), recruited('oumaldi') ? portrait('oumaldi', 90) : null),
      h('div', { class: 'col' },
        btn(started ? '▶ Lanjutkan' : '▶ Mulai Petualangan', async () => {
          Sound.resume(); Sound.startMusic('calm');
          if (!S.seen.prolog) { await playStory(STORY.prolog); S.seen.prolog = true; persist(); }
          goMap();
        }, 'pri big'),
        btn('👥 Tokoh', () => goChars(null, goTitle)),
        btn('⚙️ Pengaturan', goSettings)),
      h('p', { class: 'muted small' }, 'Bab 1 Savana · Bab 2 Hutan Lembab · 14 misi'),
      h('div', { class: 'ver' }, 'versi ' + AT.VERSION)));
  }
  function goMap() {
    Sound.resume(); if (Sound.kind !== 'calm') Sound.startMusic('calm');
    const ui = unlockedIdx();
    const path = h('div', { class: 'path' });
    let lastCh = 0;
    MISSIONS.forEach((m, i) => {
      const ch = m.chap || 1;
      if (ch !== lastCh) { lastCh = ch; path.append(h('div', { class: 'chap' }, CHAPTERS[ch].icon + ' Bab ' + ch + ' · ' + CHAPTERS[ch].name)); }
      const open = i <= ui, cleared = !!S.cleared[m.id];
      path.append(h('div', { class: 'node ' + (i % 2 ? 'r' : 'l') + (open ? '' : ' locked') + (cleared ? ' done' : '') + (i === ui && !cleared ? ' cur' : ''),
        onclick: () => { if (!open) { Sound.play('tap'); return; } Sound.play('tap'); missionSheet(m); } },
        h('div', { class: 'dot' }, open ? (m.type === 'boss' ? '👑' : m.no) : '🔒'),
        h('div', { class: 'ninfo' }, h('b', {}, m.name), h('small', {}, m.sub), h('span', { class: 'nst' }, open ? stars(S.stars[m.id] || 0) : ''))));
    });
    path.append(h('div', { class: 'node l locked soon' }, h('div', { class: 'dot' }, '🌙'), h('div', { class: 'ninfo' }, h('b', {}, 'Bab 3: Rawa Bulan'), h('small', {}, 'Segera hadir'))));
    screen(topbar('Peta Petualangan', goTitle),
      h('div', { class: 'maphead' }, btn('🏠 Markas', goBase, 'pri2'), btn('👥 Tokoh', () => goChars(null, goMap), 'pri2'), btn('⚙️', goSettings, 'icon')),
      path);
    requestAnimationFrame(() => { const c = scr.querySelector('.node.cur'); if (c) c.scrollIntoView({ block: 'center' }); });
  }
  function missionSheet(m) {
    const team = m.team.map(k => h('div', { class: 'tm' }, portrait(k, 54), h('small', {}, CHARS[k].name + (recruited(k) ? '' : ' (tamu)'))));
    overlay(h('div', { class: 'card sheet' },
      h('div', { class: 'rtitle sm' }, `Misi ${m.no}: ${m.name}`),
      h('p', {}, m.desc),
      h('div', { class: 'team' }, team),
      h('ul', { class: 'conds' }, ['Menang', 'Tidak ada teman yang pingsan', m.star3.text].map((c, i) => h('li', { class: (S.stars[m.id] || 0) > i ? 'ok' : '' }, '★ ' + c))),
      h('div', { class: 'row' }, btn('Tutup', closeOverlay), btn('⚔️ Mulai!', () => { closeOverlay(); startMission(m); }, 'pri'))));
  }
  function goBase() {
    const cards = h('div', { class: 'cards' });
    for (const k of Object.keys(CHARS)) {
      if (!recruited(k)) { const jm = MISSIONS.find(m => m.id === JOIN[k]); cards.append(h('div', { class: 'ccard locked' }, h('div', { class: 'silh' }, '?'), h('div', {}, h('b', {}, '???'), h('small', {}, 'Bergabung di Misi ' + jm.no)))); continue; }
      const l = S.lvl[k], s = charStats(k, l), n = charStats(k, l + 1), cost = lvlCost(l), b = CHARS[k];
      cards.append(h('div', { class: 'ccard' },
        h('button', { class: 'ptbtn', onclick: () => { Sound.play('tap'); goChars(k, goBase); } }, portrait(k, 72), h('small', {}, 'ℹ️ Info')),
        h('div', { class: 'cbody' },
          h('div', { class: 'uname' }, b.name, h('small', {}, ` ${b.job} · Lv ${l}`)),
          h('div', { class: 'cstat' }, `❤️ ${s.hp}  ⚔️ ${s.atk}  🛡️ ${s.def}  👣 ${s.mov}`),
          h('div', { class: 'cskills' }, b.skills.map(sk => h('span', { class: 'chip' }, SKILLS[sk].icon + ' ' + SKILLS[sk].name))),
          h('small', { class: 'muted' }, b.passive),
          btn(`⬆ Naik ke Lv ${l + 1} (🍯 ${cost})`, () => {
            if (S.madu < cost) { Sound.speak('Madunya belum cukup', 1.2); flash('Madu belum cukup. Main misi lagi untuk mengumpulkan madu!'); return; }
            S.madu -= cost; S.lvl[k] = l + 1; persist(); Sound.play('power'); goBase();
          }, S.madu >= cost ? 'pri' : ''),
          h('small', { class: 'muted' }, `Berikutnya: ❤️ ${n.hp}  ⚔️ ${n.atk}  🛡️ ${n.def}`))));
    }
    for (const f of FUTURE) cards.append(h('div', { class: 'ccard locked' }, h('div', { class: 'silh' }, '?'), h('div', {}, h('b', {}, f.name), h('small', {}, `${f.desc} · ${f.bab}`))));
    screen(topbar('Markas', goMap),
      h('p', { class: 'muted pad' }, 'Kumpulkan madu 🍯 dari misi, lalu pakai untuk menaikkan level tim. Misi yang sudah selesai bisa dimainkan lagi.'),
      cards);
  }
  /* ---------------- Halaman Tokoh ---------------- */
  let charLoop = 0;
  function goChars(sel, back) {
    back = back || goTitle;
    const keys = Object.keys(CHARS);
    if (!sel || !recruited(sel)) sel = keys.find(recruited);
    const b = CHARS[sel], l = S.lvl[sel] || 1, st = charStats(sel, l);
    const view = { anim: 'idle', a0: now(), dir: 0, pose: null, sk: -1, label: 'Siaga' };
    const cvs = h('canvas', { class: 'cstage' });
    const label = h('div', { class: 'cpose' }, view.label);
    const play = (anim, pose, text) => { view.anim = anim; view.pose = pose; view.a0 = now(); label.textContent = text; Sound.play(anim === 'attack' ? 'whoosh' : anim === 'skill' ? 'power' : 'tap'); };
    const poseBtns = h('div', { class: 'cposes' },
      btn('🧍 Siaga', () => play('idle', null, 'Siaga')),
      btn('🚶 Jalan', () => play('walk', null, 'Jalan')),
      btn('👊 Serang', () => play('attack', null, 'Serang')),
      btn('✨ Jurus', () => { view.sk = (view.sk + 1) % b.skills.length; const k = b.skills[view.sk]; play('skill', k, SKILLS[k].icon + ' ' + SKILLS[k].name); }),
      btn('🔄 Putar', () => { view.dir = [0, 1, 3, 2][([0, 1, 3, 2].indexOf(view.dir) + 1) % 4]; if (view.anim !== 'walk') play('idle', null, ['Hadap kanan', 'Hadap kiri', 'Hadap belakang', 'Hadap belakang'][view.dir]); }));
    const bar = (icon, name, v, max, col) => h('div', { class: 'sbar' }, h('span', { class: 'sl' }, icon + ' ' + name), h('div', { class: 'st' }, h('i', { style: `width:${Math.min(100, v / max * 100)}%;background:${col}` })), h('b', {}, v));
    const range = b.rmax > 1 ? `${b.rmin}–${b.rmax} petak` : '1 petak';
    const roster = h('div', { class: 'roster' }, keys.map(k => recruited(k)
      ? h('button', { class: 'rpick' + (k === sel ? ' on' : ''), onclick: () => { Sound.play('tap'); goChars(k, back); } }, portrait(k, 58), h('small', {}, CHARS[k].name))
      : h('div', { class: 'rpick locked' }, h('div', { class: 'silh' }, '?'), h('small', {}, 'Misi ' + MISSIONS.find(m => m.id === JOIN[k]).no))),
      FUTURE.map(f => h('div', { class: 'rpick locked' }, h('div', { class: 'silh' }, '?'), h('small', {}, f.bab))));
    screen(topbar('Tokoh', () => { cancelAnimationFrame(charLoop); back(); }),
      h('div', { class: 'chars' },
        h('div', { class: 'cleft' }, h('div', { class: 'cstagebox' }, cvs, label), poseBtns),
        h('div', { class: 'cright card' },
          h('div', { class: 'cname' }, b.name, h('span', { class: 'cjob' }, b.job), h('span', { class: 'clv' }, 'Lv ' + l)),
          h('div', { class: 'canimal' }, '🐾 ' + b.animal),
          h('p', { class: 'cbio' }, b.bio),
          h('div', { class: 'csec' }, 'Kemampuan'),
          bar('❤️', 'Nyawa', st.hp, 60, '#5ad35a'), bar('⚔️', 'Serang', st.atk, 20, '#ff8a5a'), bar('🛡️', 'Tahan', st.def, 14, '#7ab8ff'),
          bar('👣', 'Langkah', st.mov, 6, '#ffd24a'), bar('⛰️', 'Lompat', b.jump, 3, '#c89aff'),
          h('div', { class: 'crange' }, '🎯 Jangkauan serangan: ' + range),
          h('div', { class: 'csec' }, 'Jurus'),
          h('div', { class: 'cskills2' }, b.skills.map(k => h('div', { class: 'cskill' }, h('span', { class: 'sicon' }, SKILLS[k].icon),
            h('div', {}, h('b', {}, SKILLS[k].name), h('span', { class: 'scost' }, ' ' + '★'.repeat(SKILLS[k].cost)), h('small', {}, SKILLS[k].desc))))),
          h('div', { class: 'csec' }, 'Kemampuan khusus'),
          h('p', { class: 'cpass' }, b.passive),
          h('div', { class: 'ctip' }, '💡 ' + b.tip))),
      roster);
    // panggung tokoh
    const dpr = Math.min(2, window.devicePixelRatio || 1);
    const draw = () => {
      if (!cvs.isConnected) return;
      const w = cvs.clientWidth, hh = cvs.clientHeight;
      if (cvs.width !== Math.round(w * dpr)) { cvs.width = Math.round(w * dpr); cvs.height = Math.round(hh * dpr); }
      const c = cvs.getContext('2d'), tm = now();
      c.setTransform(1, 0, 0, 1, 0, 0); c.clearRect(0, 0, cvs.width, cvs.height);
      c.setTransform(dpr, 0, 0, dpr, 0, 0);
      const cx = w / 2, fy = hh * 0.7, k = Math.min(3.1, hh * 0.62 / 80), tw = 64 * k * 1.25, th = tw / 2, dp = 22 * k;
      const g = c.createRadialGradient(cx, fy - hh * 0.3, 10, cx, fy - hh * 0.3, w * 0.6); g.addColorStop(0, 'rgba(255,226,160,0.22)'); g.addColorStop(1, 'rgba(255,226,160,0)'); c.fillStyle = g; c.fillRect(0, 0, w, hh);
      const P = pts => { c.beginPath(); c.moveTo(pts[0][0], pts[0][1]); pts.slice(1).forEach(p => c.lineTo(p[0], p[1])); c.closePath(); };
      P([[cx - tw / 2, fy], [cx, fy + th / 2], [cx, fy + th / 2 + dp], [cx - tw / 2, fy + dp]]); c.fillStyle = '#6e5034'; c.fill();
      P([[cx + tw / 2, fy], [cx, fy + th / 2], [cx, fy + th / 2 + dp], [cx + tw / 2, fy + dp]]); c.fillStyle = '#4a3420'; c.fill();
      const tg = c.createLinearGradient(cx - tw / 2, fy - th / 2, cx + tw / 2, fy + th / 2); tg.addColorStop(0, '#b5d35a'); tg.addColorStop(1, '#6f9a34');
      P([[cx, fy - th / 2], [cx + tw / 2, fy], [cx, fy + th / 2], [cx - tw / 2, fy]]); c.fillStyle = tg; c.fill();
      P([[cx - tw / 2, fy], [cx, fy + th / 2], [cx + tw / 2, fy], [cx + tw / 2, fy + 6], [cx, fy + th / 2 + 6], [cx - tw / 2, fy + 6]]); c.fillStyle = '#4e7a2c'; c.fill();
      c.fillStyle = 'rgba(0,0,0,0.28)'; c.beginPath(); c.ellipse(cx, fy, tw * 0.22, th * 0.22, 0, 0, 7); c.fill();
      const dur = view.anim === 'skill' ? 0.75 : 0.5, ap = (tm - view.a0) / dur;
      if ((view.anim === 'attack' || view.anim === 'skill') && ap > 1.6) { view.anim = 'idle'; view.pose = null; }
      c.save(); c.translate(cx, fy); c.scale(k / R, k / R);
      SPR.draw(c, sel, view.dir, view.anim, clamp(ap, 0, 1), tm, { seed: 3, pose: view.pose });
      c.restore();
      charLoop = requestAnimationFrame(draw);
    };
    cancelAnimationFrame(charLoop); charLoop = requestAnimationFrame(draw);
  }
  function flash(t) { const e = h('div', { class: 'flash' }, t); document.body.append(e); setTimeout(() => e.remove(), 2200); }
  function goSettings() {
    const sw = (label, k) => h('label', { class: 'switch' }, h('input', { type: 'checkbox', checked: Sound.st[k] ? '' : false, onchange: e => { Sound.st[k] = e.target.checked; S.snd[k] = e.target.checked; persist(); if (k === 'music') { if (e.target.checked) Sound.startMusic('calm'); else Sound.stopMusic(); } } }), h('span', {}, label));
    let armed = false;
    const reset = btn('🗑️ Hapus semua progres', () => {
      if (!armed) { armed = true; reset.textContent = 'Yakin? Tap sekali lagi untuk menghapus'; reset.classList.add('warn'); return; }
      const snd = S.snd; S = defSave(); S.snd = snd; persist(); goTitle();
    });
    screen(topbar('Pengaturan', goTitle),
      h('div', { class: 'pad col' },
        sw('🗣️ Suara pembaca cerita', 'voice'), sw('🔊 Efek suara', 'sfx'), sw('🎵 Musik', 'music'),
        btn('🔈 Tes suara cerita', () => { Sound.resume(); Sound.speak('Halo! Aku Ata, si honey badger pemberani!', 1.5, 1.05); }),
        h('p', { class: 'muted small' }, 'Suara cerita memakai suara bawaan perangkat. Kalau terdengar seperti logat Inggris, pasang suara Bahasa Indonesia di pengaturan Text-to-Speech HP atau laptop.'),
        reset));
  }

  /* ---------------- Mulai ---------------- */
  document.addEventListener('pointerdown', () => Sound.resume(), { once: true });
  window.__ata = { goChars, get G() { return G; }, S: () => S, ai: e => aiAct(e), beginPlayerPhase: () => beginPlayerPhase(), startMission: (i) => startMission(MISSIONS[i], { skipStory: true }), goMap, goBase, goTitle, endPlayerTurn, onTapWorld, iso, cam };
  scr.classList.add('on'); scr.innerHTML = '<div class="title"><div class="tsmall">Memuat gambar…</div></div>';
  requestAnimationFrame(frame);
  window.__ata.ready = SPR.load().then(goTitle);
})();
