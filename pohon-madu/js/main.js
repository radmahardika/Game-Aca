// Layar: judul, pilih pertarungan, hasil, naik level, tim, buku monster
(function () {
  const $ = PM.$, el = PM.el;
  const scr = () => $('screen');
  function clear() { scr().innerHTML = ''; scr().className = ''; $('world').innerHTML = ''; $('fx').innerHTML = ''; }

  // ---------- judul ----------
  function title() {
    clear(); PM.bg('hutan-pinggir', 0.35);
    const s = scr(); s.className = 'title';
    el('div', 'logo', '<small>Ata dan</small>Pohon Madu<br>Legendaris', s);
    const row = el('div', 'heroes', '', s);
    PM.party().forEach((k) => { const i = el('img', 'hero-' + k, null, row); i.src = PM.charSrc(k, 'depan'); });
    const st = PM.S.story.st;
    const go = el('button', 'btn big go', st === 0 && !PM.S.story.intro ? '▶ Mulai Cerita' : '▶ Lanjut Cerita', s);
    PM.tap(go, () => { PM.sfx('pilih'); clear(); PM.explore.start(); });
    el('div', 'gsub', '🎯 ' + PM.goal(st), s);
    const ar = el('button', 'btn arena', '⚔️ Arena Latihan', s);
    PM.tap(ar, () => { PM.sfx('pilih'); peta(); });
    const rs = el('button', 'btn small reset', 'Mulai dari awal', s);
    PM.tap(rs, async () => {
      const ok = await PM.dialog('Hapus semua kemajuan dan mulai dari awal?', [{ label: 'Batal', value: false }, { label: 'Ya, ulangi', cls: 'red', value: true }], 'small');
      if (ok) { PM.reset(); title(); }
    });
    el('div', 'ver', 'versi ' + PM.VERSION + ' · pratinjau Prolog', s);
  }
  PM.toTitle = (to) => (to === 'tim' ? tim(true) : title());

  // ---------- pilih pertarungan ----------
  const unlocked = (i) => i === 0 || PM.S.done[PM.ENCOUNTERS[i - 1].id];
  function peta() {
    clear(); PM.bg('lembah-kerikil', 0.4);
    const s = scr(); s.className = 'peta';
    const top = el('div', 'topbar', '', s);
    el('div', 'box wallet', `🪙 ${PM.S.koin} &nbsp; 🍯 ${PM.S.madu}`, top);
    const bt = (t, fn) => { const b = el('button', 'btn', t, top); PM.tap(b, () => { PM.sfx('pilih'); fn(); }); };
    bt('👥 Tim', tim); bt('📖 Buku Monster', buku); bt('🏠', title);
    el('div', 'box ptitle', '⚔️ Arena Latihan <small>pilih pertarungan · bisa diulang</small>', s);
    const cols = el('div', 'cols', '', s);
    ['Prolog', 'Bab 1', 'Bab 2'].forEach((bab) => {
      const col = el('div', 'box col', `<div class="lbl">${bab === 'Prolog' ? 'PROLOG · Ata sendirian' : bab === 'Bab 1' ? 'BAB 1 · bersama Ladhia' : 'BAB 2 · bersama Bubunti'}</div>`, cols);
      PM.ENCOUNTERS.forEach((e, i) => {
        if (e.bab !== bab) return;
        const ok = unlocked(i), done = PM.S.done[e.id];
        const faces = [...new Set(e.foes)].map((f) => `<img src="${PM.foeSrc(PM.ENEMIES[f].face)}">`).join('');
        const c = el('div', 'enc' + (ok ? '' : ' lock') + (e.boss ? ' boss' : '') + (done ? ' done' : ''), `<div class="faces">${ok ? faces : '🔒'}</div><div class="en">${e.name}</div><div class="st">${done ? '✓' : ok ? '⭐' : ''}</div>`, col);
        if (ok) PM.tap(c, async () => { PM.sfx('pilih'); if (e.joinBefore && !PM.S.joined.includes(e.joinBefore)) await joinScene(e.joinBefore); await fight(e); peta(); });
      });
    });
  }

  // ---------- battle → hasil (dipakai arena & cerita) ----------
  async function fight(enc, story) {
    clear(); $('topBtns').classList.add('inbattle');
    const r = await PM.startBattle(enc);
    $('topBtns').classList.remove('inbattle');
    if (r.result === 'flee') { PM.save(); return 'flee'; }
    if (r.result === 'lose') {
      const lost = Math.floor(PM.S.koin / 4); PM.S.koin -= lost; PM.save();
      await PM.dialog(`<div class="big-t">😵 Tim pingsan…</div>${story ? 'Ata dibawa pulang ke rumah Nenek untuk beristirahat.' : 'Semua kembali ke penginapan untuk beristirahat.'}<br>Koin berkurang ¼: <b>−${lost} 🪙</b><br><small>Coba lagi! Perhatikan ikon di atas musuh.</small>`, [{ label: 'Kembali', value: 1 }]);
      return 'lose';
    }
    PM.sfx('menang');
    PM.S.koin += r.koin;
    const drop = Math.random() < (enc.boss ? 1 : 0.3); if (drop) PM.S.madu++;
    const first = !PM.S.done[enc.id]; PM.S.done[enc.id] = true;
    const events = [];
    PM.party().forEach((k) => events.push(...PM.gainExp(k, r.exp)));
    PM.save();
    await PM.dialog(`<div class="big-t">🎉 Menang!</div><div class="rew">✨ EXP +${r.exp} untuk setiap anggota<br>🪙 Koin +${r.koin}${drop ? '<br>🍯 Dapat Madu!' : ''}</div>`, [{ label: 'Lanjut', value: 1 }]);
    for (const ev of events) await levelUp(ev);
    if (first && enc.join) await joinScene(enc.join);
    return 'win';
  }
  PM.explore = PM.explore || {};
  const storyFight = async (enc) => { PM.explore.pause(); const r = await fight(enc, true); clear(); PM.explore.resume(); return r; };

  async function levelUp(ev) {
    PM.sfx('naik');
    const C = PM.CHARS[ev.key], g = ev.gains;
    const pose = ev.key === 'ata' ? PM.ataSrc('depan') : PM.charSrc(ev.key, 'depan');
    const sk = ev.skills.map((s) => `<div class="newsk">✨ Jurus baru: <b>${s.icon || ''} ${s.name}</b>${s.ko ? ` <i>${s.ko}</i>` : ''}<br><small>${s.desc}</small></div>`).join('');
    await PM.dialog(`<div class="lvup"><img src="${pose}"><div><div class="big-t">⬆ ${C.name} naik ke Level ${ev.lv}!</div>
      <div class="gains">HP +${g.hp} · MP +${g.mp} · ATK +${g.atk} · DEF +${g.def} · SPD +${g.spd}</div>${sk}</div></div>`, [{ label: 'Hebat! 👍', value: 1 }]);
    if (ev.belt) {
      PM.sfx('menang');
      await PM.dialog(`<div class="beltup"><div class="big-t">🥋 Ujian Sabuk Lulus!</div><img src="${PM.ataSrc('depan', ev.belt.id)}">
        <div>Ata sekarang memakai <b>${ev.belt.chip} ${ev.belt.name}</b>!</div></div>`, [{ label: 'Keren! 🥋', value: 1 }]);
    }
    if (ev.pick) {
      const [a, b] = PM.PICKS[ev.pick].map((id) => Object.assign({ id }, PM.SKILLS[id]));
      const card = (s) => `<b>${s.icon || ''} ${s.name}</b>${s.ko ? `<br><i>${s.ko}</i>` : ''}<br><small>${s.desc}</small>`;
      const v = await PM.dialog(`<div class="big-t">🤔 ${C.name} boleh memilih 1 jurus baru</div><div class="sub">Pilih yang menurutmu paling berguna. Pilihan ini tetap!</div>`,
        [{ label: card(a), cls: 'pickcard', value: a.id }, { label: card(b), cls: 'pickcard', value: b.id }], 'wide');
      PM.S.pick[ev.pick] = v; PM.save();
    }
  }

  async function joinScene(key) {
    PM.join(key); PM.save(); PM.sfx('menang');
    const C = PM.CHARS[key];
    await PM.dialog(`<div class="join"><img src="${PM.charSrc(key, 'depan')}"><div><div class="big-t">🤝 ${C.name} bergabung!</div><div>${PM.JOIN[key]}</div>
      <div class="sub">Job: <b>${C.job}</b> · Level ${PM.S.lv[key]}</div></div></div>`, [{ label: 'Selamat datang! 🎉', value: 1 }]);
  }

  // ---------- tim ----------
  function tim(fromStory) {
    clear(); PM.bg('halaman-dojo', 0.5);
    const s = scr(); s.className = 'timscr';
    const top = el('div', 'topbar', '', s); const b = el('button', 'btn', '↩ Kembali', top); PM.tap(b, () => { PM.sfx('batal'); if (fromStory) { clear(); PM.explore.start(); } else peta(); });
    el('div', 'box ptitle', '👥 Tim Jelajah Legenda', s);
    const row = el('div', 'tim', '', s);
    PM.party().forEach((k) => {
      const C = PM.CHARS[k], st = PM.stats(k), lv = PM.S.lv[k];
      const belt = k === 'ata' ? `<div class="beltl">${PM.beltFor(lv).chip} ${PM.beltFor(lv).name}</div>` : '';
      const sks = PM.skillsFor(k).map((x) => `<div class="sk ${lv < x.lv ? 'off' : ''}">${x.icon || '🥋'} ${x.name} <span>${lv < x.lv ? 'Lv ' + x.lv : x.mp + ' MP'}</span></div>`).join('');
      el('div', 'box tc', `<img src="${PM.charSrc(k, 'depan')}"><div class="nm">${C.name} <small>Lv ${lv}</small></div><div class="job">${C.job}</div>${belt}
        <div class="bar exp"><b>EXP</b>${PM.bar('ex', PM.S.exp[k], PM.expTo(lv))}<span>${PM.S.exp[k]}/${PM.expTo(lv)}</span></div>
        <div class="stats"><span>HP ${st.hp}</span><span>MP ${st.mp}</span><span>ATK ${st.atk}</span><span>DEF ${st.def}</span><span>SPD ${st.spd}</span></div>
        <div class="sks">${sks}</div>`, row);
    });
  }

  // ---------- buku monster ----------
  const WHO = { ata: '🦡 Ata', ladhia: '🦏 Ladhia', bubunti: '🦙 Bubunti' };
  function buku() {
    clear(); PM.bg('hutan-pinggir', 0.55);
    const s = scr(); s.className = 'bukuscr';
    const keys = Object.keys(PM.ENEMIES), seen = keys.filter((k) => PM.S.seen[k]).length;
    const box = el('div', 'box buku', `<div class="bh"><h2>📖 Buku Monster</h2><span>Ditemukan ${seen} / ${keys.length} · kelemahan tercatat setelah dikalahkan</span></div>`, s);
    const back = el('button', 'btn bback', '↩ Kembali', box); PM.tap(back, () => { PM.sfx('batal'); peta(); });
    const grid = el('div', 'grid', '', box);
    keys.forEach((k) => {
      const E = PM.ENEMIES[k], sn = PM.S.seen[k], bt = PM.S.beaten[k], T = PM.TYPES[E.type];
      const best = Object.keys(PM.CHARS).filter((c) => PM.CHARS[c].aff[E.type] >= 1.5).map((c) => WHO[c]);
      if (E.type === 'bayangan') best.push('🌶️ Sambal Bubunti');
      el('div', 'm' + (E.boss ? ' bos' : '') + (sn ? '' : ' no'), `<div class="pic"><img src="${PM.foeSrc(E.face)}"></div><b>${sn ? E.name : '? ? ?'}</b>
        <span>${sn ? T.icon + ' ' + T.name + (E.boss ? ' · 👑' : '') : 'Belum ditemukan'}</span>${bt ? `<span class="weak">Ampuh: ${best.join(', ') || '-'}</span>` : ''}`, grid);
    });
  }

  // ---------- mulai ----------
  async function boot() {
    PM.load(); PM.setMuted(PM.S.muted);
    PM.fit(); const refit = () => { PM.fit(); [100, 300, 700].forEach((ms) => setTimeout(PM.fit, ms)); };
    addEventListener('resize', refit); addEventListener('orientationchange', refit);
    if (window.visualViewport) visualViewport.addEventListener('resize', PM.fit);
    const sb = $('soundBtn'); sb.textContent = PM.S.muted ? '🔇' : '🔊';
    PM.tap(sb, () => { PM.S.muted = !PM.S.muted; PM.setMuted(PM.S.muted); sb.textContent = PM.S.muted ? '🔇' : '🔊'; PM.save(); });
    PM.tap($('fast'), () => PM.toggleFast());
    PM.explore.fight = storyFight;
    await PM.preload((p) => ($('loading').textContent = 'Memuat… ' + Math.round(p * 100) + '%'));
    $('loading').remove();
    title();
  }
  PM.debug = { title, peta, tim, buku, fight: async (id) => { await fight(PM.ENCOUNTERS.find((e) => e.id === id)); peta(); }, levelUp, joinScene };
  boot();
})();
