// Mesin battle bergiliran
(function () {
  const $ = PM.$, el = PM.el;
  let B = null;
  const wait = (ms) => new Promise((r) => setTimeout(r, B && B.fast ? ms / 2 : ms));
  const R = Math.random;
  const alive = (side) => B.actors.filter((a) => a.side === side && a.hp > 0);
  const pct = (a) => a.hp / a.mhp;

  const INTENT = {
    attack: { t: '⚔️', big: false },
    charge: { t: '💥 Kumpul tenaga', big: true },
    heavy: { t: '💥 PUKULAN BESAR!', big: true, red: true },
    defend: { t: '🛡️ Bertahan' },
    lengah: { t: '💤 Lengah' },
    spora: { t: '🍄 Spora tidur', big: true },
  };

  // ---------- membuat aktor ----------
  function makeParty() {
    return PM.party().map((key) => {
      const s = PM.stats(key), C = PM.CHARS[key];
      return { side: 'p', key, name: C.name, lv: PM.S.lv[key], hp: s.hp, mhp: s.hp, mp: s.mp, mmp: s.mp, atk: s.atk, def: s.def, spd: s.spd, st: {}, h: C.h, fly: 0 };
    });
  }
  function makeFoe(key) {
    const E = PM.ENEMIES[key];
    return { side: 'e', key, name: E.name, E, type: E.type, boss: !!E.boss, hp: E.hp, mhp: E.hp, atk: E.atk, def: E.def, spd: E.spd,
      st: {}, h: E.h, spr: E.spr, flip: !!E.flip, fly: E.fly || 0, pattern: E.pattern, pi: 0, phase: 1 };
  }

  // ---------- gambar aktor ----------
  function spawn(a, x, y) {
    a.x = x; a.y = y;
    const w = el('div', 'actor', '', $('world'));
    w.style.left = x + 'px'; w.style.top = (y - a.h - a.fly) + 'px'; w.style.height = a.h + 'px'; w.style.zIndex = Math.round(y);
    a.body = el('div', 'body', '', w);
    a.img = el('img', a.side === 'p' || a.flip ? 'flip' : '', null, a.body);
    a.img.style.height = a.h + 'px';
    a.shadow = el('div', 'shadow', '', $('world'));
    const sw = a.side === 'p' ? (a.key === 'ladhia' ? 190 : 90) : Math.min(220, a.h * 0.9);
    Object.assign(a.shadow.style, { left: x - sw / 2 + 'px', top: y - sw * 0.14 + 'px', width: sw + 'px', height: sw * 0.28 + 'px' });
    a.bubble = el('div', 'intent hide', '', w);
    a.tags = el('div', 'stags', '', w);
    if (a.side === 'e') { a.tipe = el('div', 'tipe', PM.TYPES[a.type].icon + ' ' + PM.TYPES[a.type].name + (a.boss ? ' · 👑' : ''), w); a.tipe.style.top = a.h + a.fly + 6 + 'px'; }
    a.el = w;
    setPose(a, a.side === 'p' ? 'siaga' : null);
  }
  function setPose(a, pose) {
    if (a.side === 'p') a.img.src = PM.charSrc(a.key, pose || 'siaga');
    else a.img.src = PM.foeSrc(a.spr);
  }
  function float(a, text, cls) {
    const f = el('div', 'float ' + (cls || ''), text, $('fx'));
    f.style.left = a.x + 'px'; f.style.top = (a.y - a.h - a.fly - 10) + 'px';
    f.animate([{ transform: 'translate(-50%,0) scale(.6)', opacity: 0 }, { transform: 'translate(-50%,-30px) scale(1.15)', opacity: 1, offset: 0.25 },
      { transform: 'translate(-50%,-60px) scale(1)', opacity: 1, offset: 0.75 }, { transform: 'translate(-50%,-80px)', opacity: 0 }], { duration: B.fast ? 700 : 1200, easing: 'ease-out' });
    setTimeout(() => f.remove(), 1300);
  }
  function lunge(a, tx, ty) {
    const dx = tx - a.x, dy = ty - a.y, k = a.side === 'p' ? 0.55 : 0.45;
    return a.el.animate([{ transform: 'translate(0,0)' }, { transform: `translate(${dx * k}px,${dy * k}px)`, offset: 0.45 }, { transform: `translate(${dx * k}px,${dy * k}px)`, offset: 0.6 }, { transform: 'translate(0,0)' }],
      { duration: B.fast ? 380 : 650, easing: 'ease-in-out' }).finished;
  }
  function shake(a) {
    a.body.animate([{ transform: 'translateX(0)', filter: 'brightness(3)' }, { transform: 'translateX(-10px)' }, { transform: 'translateX(10px)', filter: 'brightness(1)' }, { transform: 'translateX(-6px)' }, { transform: 'translateX(0)' }], { duration: 380 });
  }
  function spark(x, y, color) {
    const s = el('div', 'spark', '', $('fx')); s.style.left = x + 'px'; s.style.top = y + 'px'; if (color) s.style.background = color;
    s.animate([{ transform: 'translate(-50%,-50%) scale(.2)', opacity: 1 }, { transform: 'translate(-50%,-50%) scale(1.6)', opacity: 0 }], { duration: 380 });
    setTimeout(() => s.remove(), 400);
  }
  const mid = (a) => [a.x, a.y - a.h * 0.55 - a.fly];

  // ---------- HUD ----------
  function msg(html) { const m = $('bmsg'); m.innerHTML = html; m.classList.remove('hide'); }
  function renderTurn() {
    const t = $('turn');
    t.innerHTML = '<span class="lbl">GILIRAN</span>' + B.order.map((a, i) => {
      const src = a.side === 'p' ? PM.charSrc(a.key, 'wajah') : PM.foeSrc(a.E.face);
      const cls = (i === B.pos ? 'now' : i < B.pos ? 'done' : '') + (a.side === 'e' ? ' foe' : '') + (a.hp <= 0 ? ' dead' : '');
      return (i ? '<span class="arrow">›</span>' : '') + `<div class="face ${cls}"><img src="${src}"></div>`;
    }).join('');
  }
  function renderFoes() {
    const f = $('foes'), boss = B.actors.find((a) => a.side === 'e' && a.boss && a.hp > 0);
    if (boss) { f.innerHTML = `<div class="lbl">BOS</div><div class="row"><span>${boss.name}</span><span>Fase ${boss.phase}</span></div><div class="bar hp">${PM.bar('boss', boss.hp, boss.mhp)}</div>`; return; }
    const cnt = {}; alive('e').forEach((a) => (cnt[a.name] = (cnt[a.name] || 0) + 1));
    f.innerHTML = '<div class="lbl">MUSUH</div>' + Object.entries(cnt).map(([n, c]) => `<div class="row"><span>${n}</span><span>×${c}</span></div>`).join('');
  }
  function renderCards() {
    const p = $('party');
    p.innerHTML = B.actors.filter((a) => a.side === 'p').map((a) => {
      const C = PM.CHARS[a.key], belt = a.key === 'ata' ? ' ' + PM.beltFor(a.lv).chip : '';
      const icons = [a.st.sleep ? '💤' : '', a.st.guard ? '🛡️' : '', a.st.protectBy ? '🦏' : '', a.st.defUp ? '⬆DEF' : '', a.st.atkUp ? '⬆ATK' : '', a.st.siaga ? '🥋' : '', a.st.regen ? '🫖' : '', a.st.immune ? '🥣' : ''].join(' ');
      return `<div class="box card ${B.cur === a ? 'now' : ''} ${a.hp <= 0 ? 'down' : ''}"><div class="por"><img src="${PM.charSrc(a.key, 'wajah')}"></div>
        <div class="info"><div class="nm">${a.name} <small>Lv ${a.lv}</small></div><div class="job">${C.job}${belt}</div>
        <div class="bar hp"><b>HP</b>${PM.bar('hp', a.hp, a.mhp)}<span>${a.hp}/${a.mhp}</span></div>
        <div class="bar mp"><b>MP</b>${PM.bar('mp', a.mp, a.mmp)}<span>${a.mp}/${a.mmp}</span></div></div>
        <div class="sticons">${a.hp <= 0 ? 'pingsan' : icons}</div></div>`;
    }).join('');
  }
  function renderIntent(e) {
    if (e.hp <= 0 || !e.intent) { e.bubble.className = 'intent hide'; return; }
    const I = INTENT[e.intent];
    let t = I.t; if (e.intent === 'heavy' && e.E.heavyName) t = '💥 ' + e.E.heavyName + '!';
    e.bubble.textContent = t;
    e.bubble.className = 'intent' + (I.big ? ' big' : '') + (I.red ? ' red' : '');
    e.body.classList.toggle('glow', !!e.charging);
  }
  function renderStatus(a) {
    a.tags.textContent = [a.st.sleep ? '💤' : '', a.st.defDown ? '⬇DEF' : '', a.st.guard && a.side === 'e' ? '🛡️' : ''].join(' ');
    a.el.classList.toggle('down', a.hp <= 0 && a.side === 'p');
  }
  function refresh() { renderCards(); renderFoes(); renderTurn(); B.actors.forEach((a) => { renderStatus(a); if (a.side === 'e') renderIntent(a); }); }

  // ---------- tips (sekali) ----------
  async function tip(id, text) {
    if (PM.S.tips[id]) return; PM.S.tips[id] = 1; PM.save();
    await PM.dialog(`<div class="tip">💡 ${text}</div>`, [{ label: 'Mengerti 👍', value: 1 }], 'small');
  }

  // ---------- hitung pukulan ----------
  function calc(att, tgt, power, o = {}) {
    const atk = att.atk * (att.st.atkUp ? 1.3 : 1);
    const def = tgt.def * (tgt.st.defUp ? 1.4 : 1) * (tgt.st.defDown ? 0.6 : 1);
    let base = Math.max(1, atk * power - def * 0.5), mult = 1, tags = [];
    if (att.side === 'p' && tgt.side === 'e') {
      mult = o.elem ? PM.ELEM[o.elem][tgt.type] : PM.CHARS[att.key].aff[tgt.type];
      if (tgt.intent === 'lengah') { mult *= 1.3; }
    }
    if (tgt.st.guard && !o.pierce) mult *= 0.5;
    if (o.vsCharge && (tgt.charging || tgt.intent === 'heavy' || tgt.intent === 'charge')) { mult *= o.vsCharge; tags.push('TEPAT!'); }
    const crit = att.side === 'p' && R() < (PM.CHARS[att.key].crit || 0);
    if (crit) { mult *= 1.5; tags.push('KRITIS!'); }
    const dmg = Math.max(1, Math.round(base * mult * (0.9 + R() * 0.2)));
    const eff = att.side === 'p' && tgt.side === 'e' ? (o.elem ? PM.ELEM[o.elem][tgt.type] : PM.CHARS[att.key].aff[tgt.type]) : 1;
    return { dmg, eff, tags };
  }

  async function hurt(tgt, dmg, info = {}) {
    tgt.hp = Math.max(0, tgt.hp - dmg);
    if (tgt.st.sleep) { tgt.st.sleep = 0; }
    shake(tgt);
    const [x, y] = mid(tgt); spark(x, y);
    let label = '' + dmg, cls = tgt.side === 'p' ? 'dmgp' : 'dmg';
    if (info.eff >= 1.5) label += '<small>AMPUH!</small>';
    else if (info.eff && info.eff <= 0.7) label += '<small class="weak">kurang ampuh…</small>';
    if (info.tags && info.tags.length) label += '<small>' + info.tags.join(' ') + '</small>';
    float(tgt, label, cls);
    refresh();
    if (tgt.hp <= 0) await defeated(tgt);
  }
  async function defeated(a) {
    if (a.side === 'e') {
      PM.sfx('musuhKalah');
      a.bubble.className = 'intent hide';
      await a.el.animate([{ transform: 'rotate(0) scale(1)', opacity: 1 }, { transform: 'rotate(-25deg) scale(.9)', opacity: 1, offset: 0.4 }, { transform: 'rotate(25deg) scale(.4) translateY(-30px)', opacity: 0 }], { duration: 700 }).finished;
      a.el.style.display = 'none'; a.shadow.style.display = 'none';
      if (!PM.S.beaten[a.key]) { PM.S.beaten[a.key] = 1; }
    } else {
      PM.sfx('kalah');
      msg(`${a.name} pingsan!`);
      a.st = {};
      await wait(600);
    }
    refresh();
  }

  // ---------- giliran ----------
  function newRound() {
    B.round++;
    const list = B.actors.filter((a) => a.hp > 0);
    list.forEach((a) => (a._r = a.spd * (a.st.spdUp ? 1.5 : 1) * (0.9 + R() * 0.2) - (a.st.slow ? 999 : 0)));
    B.order = list.sort((a, b) => b._r - a._r);
    if (B.round === 1 && B.enc.surprise) {
      const first = B.enc.surprise === 'party' ? 'p' : 'e';
      B.order = B.order.filter((a) => a.side === first).concat(B.order.filter((a) => a.side !== first));
    }
    list.forEach((a) => { a.st.slow = 0; a.gesit = false; });
    B.pos = 0;
    alive('e').forEach((e) => { e.intent = chooseIntent(e); e.st.guard = e.intent === 'defend'; });
  }
  function chooseIntent(e) {
    if (e.charging) return 'heavy';
    if (e.pattern) {
      const p = e.pattern[e.pi++ % e.pattern.length];
      return p === 'heavy' ? 'attack' : p;
    }
    const ai = Object.assign({}, e.E.ai);
    if (e.lastIntent === 'spora') delete ai.spora;
    if (e.lastIntent === 'charge') delete ai.charge;
    const tot = Object.values(ai).reduce((s, v) => s + v, 0); let r = R() * tot;
    for (const [k, v] of Object.entries(ai)) { if ((r -= v) < 0) return k; }
    return 'attack';
  }
  function endRound() {
    B.actors.forEach((a) => {
      ['defUp', 'atkUp', 'defDown', 'taunt', 'immune', 'regen', 'spdUp'].forEach((k) => { if (a.st[k]) a.st[k]--; });
    });
    alive('p').forEach((a) => {
      if (a.st.regen != null && a.st._regenOn) { const h = Math.max(3, Math.round(a.mhp * 0.08)); a.hp = Math.min(a.mhp, a.hp + h); float(a, '+' + h, 'heal'); if (!a.st.regen) a.st._regenOn = false; }
    });
  }

  async function run() {
    while (true) {
      newRound(); refresh();
      // tips pertama
      const ch = alive('e').find((e) => e.intent === 'charge');
      if (ch) await tip('charge', `<b>${ch.name}</b> sedang <b>💥 kumpul tenaga</b>. Giliran depan pukulannya BESAR! Coba <b>🛡️ Bertahan</b> atau Lindungi teman.`);
      while (B.pos < B.order.length) {
        const a = B.order[B.pos];
        if (a.hp > 0) {
          B.cur = a; refresh();
          if (a.side === 'p') await partyTurn(a); else await foeTurn(a);
          B.cur = null;
          const end = checkEnd(); if (end) return end;
          if (B.fled) return 'flee';
        }
        B.pos++;
      }
      endRound();
    }
  }
  function checkEnd() {
    if (!alive('e').length) return 'win';
    if (!alive('p').length) return 'lose';
    return null;
  }

  // ---------- giliran tim ----------
  async function partyTurn(a) {
    a.st.guard = false;
    if (a.key === 'ladhia') B.actors.forEach((x) => { if (x.st.protectBy === a) x.st.protectBy = null; });
    if (a.st.sleep) {
      a.st.sleep--; msg(`${a.name} tertidur… 💤`); PM.sfx('tidur'); refresh(); await wait(900); return;
    }
    let done = false;
    while (!done) {
      const c = await chooseAction(a);
      done = await doAction(a, c);
    }
    // Gesit: Ata kadang bergerak lagi
    if (a.key === 'ata' && !a.gesit && a.hp > 0 && alive('e').length && R() < 0.15) {
      a.gesit = true; B.order.splice(B.pos + 1, 0, a);
      msg('⚡ <em>Gesit!</em> Ata bergerak lagi!'); refresh(); await wait(800);
    }
  }

  function chooseAction(a) {
    return new Promise((res) => {
      const menu = $('menu'), jur = $('jurus');
      const C = PM.CHARS[a.key];
      msg(`Giliran <em>${a.name}</em>. Apa yang akan dilakukan?`);
      const main = () => {
        jur.classList.add('hide');
        menu.classList.remove('hide');
        menu.innerHTML = '';
        const btn = (ic, label, fn, off, sel) => { const b = el('div', 'btn' + (off ? ' off' : ''), `<span class="ic">${ic}</span>${label}`, menu); if (!off) PM.tap(b, () => { PM.sfx('pilih'); fn(); }); return b; };
        btn('⚔️', 'Serang', async () => { const t = await pickTarget('enemy', a); if (t) finish({ type: 'attack', target: t }); });
        btn(a.key === 'bubunti' ? '🍲' : '✨', C.menu, () => jurusList());
        btn('🛡️', 'Bertahan', () => finish({ type: 'defend' }));
        btn('🍯', 'Bekal ' + PM.S.madu, async () => { const t = await pickTarget('ally', a); if (t) finish({ type: 'item', target: t }); }, PM.S.madu <= 0);
        btn('🔄', 'Tukar', () => {}, true);
        btn('🏃', 'Kabur', () => finish({ type: 'flee' }), B.enc.boss);
      };
      const jurusList = () => {
        jur.classList.remove('hide');
        const list = PM.skillsFor(a.key);
        jur.innerHTML = `<div class="lbl">${a.key === 'bubunti' ? 'MASAKAN' : 'JURUS'} ${a.name.toUpperCase()}</div>`;
        let shownLocked = false;
        list.forEach((s) => {
          const locked = a.lv < s.lv;
          if (locked && shownLocked) return; if (locked) shownLocked = true;
          const noMp = !locked && a.mp < s.mp;
          const row = el('div', 'j' + (locked || noMp ? ' off' : ''), `<b>${s.icon ? s.icon + ' ' : ''}${s.name}</b><span class="mpc">${locked ? 'Lv ' + s.lv : s.mp + ' MP'}</span><i>${s.ko || s.desc}</i>`, jur);
          if (!locked && !noMp) PM.tap(row, async () => {
            PM.sfx('pilih');
            [...jur.querySelectorAll('.j')].forEach((x) => x.classList.remove('sel')); row.classList.add('sel');
            showDesc(s);
            const t = await pickTarget(s.tgt, a);
            if (t) finish({ type: 'skill', sk: s, target: t }); else row.classList.remove('sel');
          });
        });
        const d = el('div', 'desc', 'Pilih jurus. MP berkurang setiap memakai jurus.', jur); d.id = 'jdesc';
        const back = el('div', 'back', '↩ Kembali', jur); PM.tap(back, () => { PM.sfx('batal'); main(); });
      };
      const showDesc = (s) => { const d = $('jdesc'); if (d) d.innerHTML = s.desc; };
      const finish = (c) => { menu.classList.add('hide'); jur.classList.add('hide'); res(c); };
      main();
    });
  }

  // memilih sasaran: ketuk lingkaran di atas tokoh/musuh
  function pickTarget(kind, a) {
    if (['party', 'all-enemy', 'self'].includes(kind)) return Promise.resolve(kind === 'self' ? a : kind);
    let list = [];
    if (kind === 'enemy') list = alive('e');
    if (kind === 'ally') list = alive('p');
    if (kind === 'ally-other') list = alive('p').filter((x) => x !== a);
    if (kind === 'ally-down') list = B.actors.filter((x) => x.side === 'p' && x.hp <= 0);
    if (!list.length) { msg(kind === 'ally-down' ? 'Tidak ada teman yang pingsan.' : 'Tidak ada sasaran.'); PM.sfx('batal'); return Promise.resolve(null); }
    msg(kind === 'enemy' ? 'Ketuk <em>musuh</em> yang mau diserang.' : 'Ketuk <em>teman</em> yang mau dibantu.');
    return new Promise((res) => {
      const layer = $('pick'); layer.innerHTML = ''; layer.classList.remove('hide');
      const done = (v) => { layer.classList.add('hide'); layer.innerHTML = ''; res(v); };
      list.forEach((t) => {
        const r = el('div', 'ring ' + (t.side === 'e' ? 'foe' : 'ally'), `<span>${t.name}${t.side === 'p' ? ` ${t.hp}/${t.mhp}` : ''}</span>`, layer);
        const w = t.side === 'e' ? Math.min(240, t.h * 1.05) : (t.key === 'ladhia' ? 230 : 130), h = t.h + 20;
        Object.assign(r.style, { left: t.x - w / 2 + 'px', top: t.y - t.h - t.fly - 10 + 'px', width: w + 'px', height: h + 'px' });
        PM.tap(r, () => { PM.sfx('pilih'); done(t); });
      });
      const back = el('div', 'box backbtn', '↩ Kembali', layer); PM.tap(back, () => { PM.sfx('batal'); done(null); });
    });
  }

  async function doAction(a, c) {
    if (c.type === 'flee') {
      if (B.enc.boss) { msg('Tidak bisa kabur dari bos!'); PM.sfx('batal'); await wait(900); return false; }
      const ok = alive('p').some((x) => x.key === 'ata') || R() < 0.5;
      msg(ok ? 'Tim berhasil kabur! 🏃' : 'Gagal kabur!'); await wait(900);
      if (ok) B.fled = true; return true;
    }
    if (c.type === 'defend') {
      a.st.guard = true; msg(`${a.name} 🛡️ bertahan. Pukulan musuh jadi setengah.`); setPose(a, a.key === 'ladhia' ? 'bertahan' : 'siaga');
      refresh(); await wait(800); return true;
    }
    if (c.type === 'item') {
      PM.S.madu--; const t = c.target, h = Math.min(t.mhp - t.hp, 30 + Math.round(t.mhp * 0.15));
      t.hp += h; PM.sfx('sembuh'); float(t, '🍯 +' + h, 'heal'); msg(`${a.name} memberi Madu ke ${t.name}. HP +${h}`); refresh(); await wait(900); return true;
    }
    if (c.type === 'attack') {
      await strike(a, c.target, 1, { pose: PM.CHARS[a.key].attack.pose, label: PM.CHARS[a.key].attack.name });
      return true;
    }
    // jurus
    const s = c.sk; a.mp -= s.mp; refresh();
    if (s.tgt === 'enemy') {
      const hits = s.hits || 1;
      for (let i = 0; i < hits && c.target.hp > 0; i++) await strike(a, c.target, s.power, { pose: s.pose, label: s.name, sure: s.sure, vsCharge: s.vsCharge, pierce: s.pierce, quick: i > 0 });
      if (c.target.hp > 0 && s.push) {
        const i = B.order.indexOf(c.target);
        let txt = `${c.target.name} terdorong ke belakang antrean! ⬇`;
        if (c.target.charging || c.target.intent === 'heavy' || c.target.intent === 'charge') { c.target.charging = false; c.target.intent = 'attack'; txt += ' <em>Tenaganya buyar!</em>'; }
        if (i > B.pos) { B.order.splice(i, 1); B.order.push(c.target); } else c.target.st.slow = 1;
        msg(txt); refresh(); await wait(1000);
      }
      if (c.target.hp > 0 && s.defDown) { c.target.st.defDown = s.defDown + 1; msg(`DEF ${c.target.name} turun! ⬇`); refresh(); await wait(800); }
      return true;
    }
    if (s.tgt === 'all-enemy') {
      setPose(a, s.pose); msg(`${a.name}: <em>${s.icon || ''} ${s.name}!</em>`); PM.sfx('berat');
      await lunge(a, 260, 470);
      for (const e of alive('e')) { const r = calc(a, e, s.power, { elem: s.elem }); await hurt(e, r.dmg, r); await wait(250); }
      setPose(a, 'siaga'); await wait(500); return true;
    }
    // jurus bantu
    setPose(a, s.pose || 'siaga');
    msg(`${a.name}: <em>${s.icon || ''} ${s.name}!</em>`);
    a.el.animate([{ transform: 'translateY(0)' }, { transform: 'translateY(-14px)' }, { transform: 'translateY(0)' }], { duration: 450 });
    const targets = s.tgt === 'party' ? alive('p') : [c.target];
    await wait(450);
    for (const t of targets) {
      if (s.heal) { const h = Math.min(t.mhp - t.hp, Math.round(t.mhp * s.heal + (s.flat || 0))); t.hp += h; float(t, s.icon + ' +' + h, 'heal'); PM.sfx('sembuh'); }
      if (s.revive) { t.hp = Math.max(1, Math.round(t.mhp * s.revive)); t.st = {}; float(t, '☕ Bangun!', 'heal'); PM.sfx('sembuh'); }
      if (s.cleanse) { t.st.sleep = 0; }
      if (s.immune) { t.st.immune = s.immune + 1; }
      if (s.regen) { t.st.regen = s.regen; t.st._regenOn = true; }
      if (s.defUp) { t.st.defUp = s.defUp + 1; float(t, '⬆ DEF', 'buff'); }
      if (s.atkUp) { t.st.atkUp = s.atkUp + 1; float(t, '⬆ ATK', 'buff'); }
    }
    if (s.id === 'lindungi') { c.target.st.protectBy = a; a.st.guard = false; msg(`🛡️ Ladhia melindungi <em>${c.target.name}</em> sampai giliran Ladhia berikutnya.`); }
    if (s.taunt) { a.st.taunt = s.taunt + 1; msg('📣 Ladhia menantang! Semua musuh mengincar Ladhia.'); }
    if (s.id === 'siaga') { a.st.siaga = true; msg('🥋 Ata memasang kuda-kuda siaga!'); }
    refresh(); await wait(900);
    if (a.key !== 'ladhia' || s.id !== 'lindungi') setPose(a, 'siaga');
    return true;
  }

  async function strike(a, t, power, o) {
    if (t.hp <= 0) return;
    setPose(a, o.pose);
    if (!o.quick) msg(`${a.name}: <em>${o.label}!</em>`);
    PM.sfx(o.pose === 'tendang' ? 'tendang' : 'pukul');
    const [tx, ty] = mid(t);
    await lunge(a, tx + 60, t.y);
    // Ladhia sering meleset ke musuh Lincah
    if (!o.sure && a.side === 'p' && PM.CHARS[a.key].missLincah && t.type === 'lincah' && R() < PM.CHARS[a.key].missLincah) {
      float(t, 'Meleset!', 'miss'); PM.sfx('meleset'); await tip('miss', 'Ladhia besar & lambat, jadi sering <b>meleset</b> ke musuh 🪶 Lincah. Pakai Ata!');
    } else {
      const r = calc(a, t, power, o);
      if (t.st.guard && t.E && t.E.spikes && !o.pierce) {
        await hurt(t, r.dmg, r);
        a.hp = Math.max(1, a.hp - t.E.spikes); float(a, '🦔 -' + t.E.spikes, 'dmgp'); shake(a);
        await tip('spikes', 'Saat Landak Baja <b>🛡️ menggulung</b>, durinya membalas pukulan. Tunggu ia membuka diri!');
      } else await hurt(t, r.dmg, r);
      if (r.eff >= 1.5) await tip('ampuh', `<b>AMPUH!</b> ${t.name} tipe ${PM.TYPES[t.type].icon} ${PM.TYPES[t.type].name} lemah terhadap ${a.name}.`);
      if (r.eff <= 0.7) await tip('lemah', `<b>Kurang ampuh…</b> ${a.name} tidak cocok melawan ${PM.TYPES[t.type].icon} ${PM.TYPES[t.type].name}. Coba teman lain atau jurus lain.`);
    }
    await wait(300);
    if (a.hp > 0) setPose(a, 'siaga');
  }

  // ---------- giliran musuh ----------
  async function foeTurn(e) {
    if (e.st.sleep) { e.st.sleep--; msg(`${e.name} tertidur… 💤`); await wait(800); return; }
    // fase 2 bos
    const intent = e.intent; e.lastIntent = intent; e.intent = null; renderIntent(e);
    if (intent === 'lengah') { msg(`${e.name} lengah… 💤`); await wait(800); return; }
    if (intent === 'defend') { e.st.guard = true; msg(`${e.name} 🛡️ bertahan.`); refresh(); await wait(800); return; }
    if (intent === 'charge') {
      e.charging = true; PM.sfx('tenaga'); msg(`${e.name} <em>💥 mengumpulkan tenaga!</em> Hati-hati giliran depan!`);
      renderIntent(e); e.body.classList.add('glow'); await wait(1000); return;
    }
    if (intent === 'spora') {
      msg(`${e.name} menyebar <em>🍄 spora tidur!</em>`); PM.sfx('tidur');
      e.el.animate([{ transform: 'scale(1)' }, { transform: 'scale(1.15)' }, { transform: 'scale(1)' }], { duration: 500 });
      await wait(600);
      for (const p of alive('p')) {
        if (p.st.immune) { float(p, '🥣 Kebal!', 'buff'); continue; }
        if (R() < 0.6) { p.st.sleep = 1 + (R() < 0.5 ? 1 : 0); float(p, '💤 Tidur', 'miss'); }
        else float(p, 'Lolos!', 'buff');
      }
      refresh(); await wait(900);
      if (alive('p').some((p) => p.st.sleep)) await tip('tidur', 'Teman yang <b>💤 tertidur</b> tidak bisa bergerak. Ia bangun kalau terkena pukulan. Bubunti punya masakan untuk membangunkan!');
      return;
    }
    const heavy = intent === 'heavy';
    e.charging = false; e.body.classList.remove('glow');
    // pilih sasaran
    let ps = alive('p');
    const taunt = ps.find((p) => p.st.taunt);
    let t = taunt || ps[Math.floor(R() * ps.length)];
    let guardBy = t.st.protectBy && t.st.protectBy.hp > 0 ? t.st.protectBy : null;
    msg(heavy ? `${e.name}: <em>💥 ${e.E.heavyName || 'Pukulan Besar'}!</em>` : `${e.name} menyerang ${guardBy ? guardBy.name + ' (melindungi ' + t.name + ')' : t.name}!`);
    if (guardBy) t = guardBy;
    PM.sfx(heavy ? 'berat' : 'pukul');
    await lunge(e, t.x - 70, t.y);
    if (t.st.siaga) {
      t.st.siaga = false; float(t, 'Hindar!', 'buff'); PM.sfx('meleset'); msg('🥋 Ata menghindar lalu membalas!');
      await wait(400); setPose(t, 'tendang'); const r = calc(t, e, 1.0, {}); await hurt(e, r.dmg, r); await wait(300); setPose(t, 'siaga');
    } else {
      const r = calc(e, t, heavy ? 2.2 : 1, {});
      if (guardBy) r.dmg = Math.max(1, Math.round(r.dmg * 0.75));
      await hurt(t, r.dmg, r);
      if (heavy && t.st.guard) await tip('guardok', 'Bagus! Karena <b>🛡️ bertahan</b>, pukulan besar jadi setengah.');
    }
    await wait(400);
    await bossPhase(e);
  }
  async function bossPhase(e) {
    const P = e.E.phase2;
    if (!P || e.phase !== 1 || e.hp <= 0 || pct(e) > P.at) return;
    e.phase = 2; e.pattern = P.pattern; e.pi = 0; e.charging = false;
    if (P.spr) { e.spr = P.spr; setPose(e); }
    if (P.spd) e.spd = Math.round(e.spd * P.spd);
    if (P.def) e.def = Math.round(e.def * P.def);
    msg(`<em>${P.say}</em>`); PM.sfx('tenaga');
    e.el.animate([{ filter: 'brightness(1)' }, { filter: 'brightness(2.5)' }, { filter: 'brightness(1)' }], { duration: 700 });
    await wait(900);
    (P.summon || []).forEach((k, i) => {
      const f = makeFoe(k); const [x, y] = PM.POS.summon[i]; B.actors.push(f); spawn(f, x, y);
      if (!PM.S.seen[k]) PM.S.seen[k] = 1;
      f.el.animate([{ opacity: 0, transform: 'translateY(-40px)' }, { opacity: 1, transform: 'translateY(0)' }], { duration: 500 });
    });
    refresh(); await wait(600);
  }
  // juga cek fase ketika bos dipukul tim
  const _hurt = hurt;
  hurt = async function (tgt, dmg, info) { await _hurt(tgt, dmg, info); if (tgt.side === 'e' && tgt.boss) await bossPhase(tgt); };

  // ---------- mulai battle ----------
  PM.startBattle = async function (enc) {
    B = { enc, actors: [], round: 0, order: [], pos: 0, fast: B ? B.fast : false };
    $('world').innerHTML = ''; $('fx').innerHTML = '';
    PM.bg(enc.bg, enc.fy || 0.55);
    $('battleHud').classList.remove('hide');
    const party = makeParty(), n = party.length;
    party.forEach((a) => { B.actors.push(a); const [x, y] = PM.POS.party[n][a.key]; spawn(a, x, y); });
    const foes = enc.foes.map(makeFoe);
    foes.forEach((f, i) => { B.actors.push(f); const [x, y] = f.boss ? PM.POS.boss : PM.POS.foes[foes.length][i]; spawn(f, x, y); PM.S.seen[f.key] = 1; });
    refresh();
    $('fast').classList.toggle('on', B.fast);
    PM.music(true);
    msg(enc.intro); await PM.wait(300);
    const sp = enc.surprise === 'party' ? '<div class="surp ok">⚡ SERANGAN KEJUTAN! Tim jalan duluan!</div>' : enc.surprise === 'foe' ? '<div class="surp bad">😱 Musuh menyergap! Musuh jalan duluan.</div>' : '';
    await PM.dialog(`${sp}<div class="intro"><div class="ttl">${enc.bab} · ${enc.name}</div>${enc.intro}</div>`, [{ label: '⚔️ Mulai!', value: 1 }], 'small');
    const result = await run();
    PM.music(false);
    $('battleHud').classList.add('hide');
    $('pick').classList.add('hide');
    const exp = foes.concat(B.actors.filter((a) => a.side === 'e' && !foes.includes(a))).filter((f) => f.hp <= 0).reduce((s, f) => s + f.E.exp, 0);
    const koin = B.actors.filter((a) => a.side === 'e' && a.hp <= 0).reduce((s, f) => s + f.E.koin, 0);
    return { result, exp, koin };
  };
  PM.toggleFast = function () { if (B) { B.fast = !B.fast; PM.$('fast').classList.toggle('on', B.fast); } };
  PM.battleDebug = () => B;
})();
