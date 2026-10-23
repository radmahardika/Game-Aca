// Alur game: judul, dunia top-down, dialog, battle, hadiah, koleksi, pengaturan.
(function () {
  const G = (window.G = window.G || {});
  const $ = (s, el = document) => el.querySelector(s);
  const R = Math.round;

  // ---------- Simpan progres ----------
  const KEY = 'aksa-pemadam-v2';
  const fresh = () => ({ solved: {}, stars: {}, acc: {}, equip: {}, intro: false, tut: false, music: true, sfx: true, pos: null });
  function load() {
    try {
      const s = JSON.parse(localStorage.getItem(KEY));
      return Object.assign(fresh(), s || {});
    } catch (e) {
      return fresh();
    }
  }
  G.save = load();
  G.persist = () => {
    try { localStorage.setItem(KEY, JSON.stringify(G.save)); } catch (e) {}
  };

  // ---------- Kanvas ----------
  const cvs = $('#scene');
  const ctx = cvs.getContext('2d');
  G.view = { W: 240, H: 160, GY: 85, S: 5 };
  function resize() {
    const vw = window.innerWidth, vh = window.innerHeight;
    const S = Math.max(2, Math.round(vh / 168));
    const W = Math.ceil(vw / S), H = Math.ceil(vh / S);
    cvs.width = W;
    cvs.height = H;
    cvs.style.width = W * S + 'px';
    cvs.style.height = H * S + 'px';
    ctx.imageSmoothingEnabled = false;
    G.view = { W, H, S, GY: R(H * 0.53) };
    document.body.classList.toggle('portrait', vh > vw * 1.05);
  }
  window.addEventListener('resize', resize);
  window.addEventListener('orientationchange', () => setTimeout(resize, 200));

  let last = performance.now();
  function frame(now) {
    const dt = Math.min(0.05, (now - last) / 1000);
    last = now;
    G.time = now / 1000;
    const { W, H } = G.view;
    ctx.clearRect(0, 0, W, H);
    G.fx.update(dt);
    if (G.scene) G.scene.draw(ctx, G.time, dt);
    if (!G.scene || !G.scene.ownsFx) G.fx.draw(ctx);
    requestAnimationFrame(frame);
  }

  // ---------- UI helper ----------
  const ui = $('#ui');
  const dlg = $('#dlg');
  const modal = $('#modal');
  function el(html) {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  }
  function tap(node, fn) {
    node.addEventListener('click', (e) => {
      e.stopPropagation();
      G.audioUnlock();
      G.sfx.tap();
      fn(e);
    });
  }

  // Potret karakter untuk dialog
  G.portrait = function (who, size = 60) {
    const c = document.createElement('canvas');
    c.width = size;
    c.height = size;
    c.className = 'portrait';
    const x = c.getContext('2d');
    x.imageSmoothingEnabled = false;
    const S = G.spr;
    const pic = { aksa: S.aksa, ara: S.araWith(G.save.equip), ani: S.ani, budi: S.budi, joko: S.joko, kades: S.kades }[who];
    if (pic) {
      const k = Math.max(1, Math.floor((size - 4) / Math.max(pic.width, pic.height)));
      const w = pic.width * k, h = pic.height * k;
      x.drawImage(pic, R((size - w) / 2), size - h - 2, w, h);
    } else if (who === 'api') {
      G.drawFire(x, size / 2, size - 3, 22, 30, 0.5, { mood: 'laugh' });
    } else if (who === 'raja') {
      G.drawFire(x, size / 2, size - 2, 26, 34, 0.5, { mood: 'laugh', crown: true });
    } else if (who === 'papan') {
      const p = (a, b, w, h, col) => { x.fillStyle = col; x.fillRect(a, b, w, h); };
      p(size / 2 - 2, size / 2, 4, size / 2 - 4, '#6e4520');
      p(8, 12, size - 16, 22, '#2b1d1a');
      p(10, 14, size - 20, 18, '#c98a45');
      p(14, 19, size - 28, 2, '#6e4520');
      p(14, 25, size - 34, 2, '#6e4520');
    }
    return c;
  };

  // ---------- Dialog (dengan pilihan di baris terakhir) ----------
  function dialog(lines, done, choices) {
    let i = 0;
    G.world.mode = 'busy';
    G.world.setHeld(null);
    hudVisible(false);
    dlg.innerHTML = '';
    dlg.classList.add('show');
    const box = el(`<div class="dialog"><div class="pwrap"></div><div class="dbody"><div class="dname"></div><div class="dtext"></div><div class="dchoices"></div><div class="dnext">Ketuk untuk lanjut ▶</div></div></div>`);
    dlg.appendChild(box);
    const finish = (fn) => {
      dlg.removeEventListener('click', next);
      dlg.classList.remove('show');
      dlg.innerHTML = '';
      (fn || done) && (fn || done)();
    };
    const show = () => {
      const L = lines[i];
      const c = G.CHARS[L.who];
      const pw = $('.pwrap', box);
      pw.innerHTML = '';
      pw.style.background = c.color;
      pw.appendChild(G.portrait(L.who));
      $('.dname', box).textContent = c.name;
      $('.dname', box).style.background = c.color;
      $('.dtext', box).textContent = L.text;
      box.classList.remove('pop');
      void box.offsetWidth;
      box.classList.add('pop');
      G.sfx.talk();
      const lastLine = i === lines.length - 1;
      const ch = $('.dchoices', box);
      ch.innerHTML = '';
      if (lastLine && choices) {
        $('.dnext', box).style.display = 'none';
        choices.forEach((o) => {
          const b = el(`<button class="btn ${o.cls || 'grey'}">${o.label}</button>`);
          tap(b, () => finish(o.fn));
          ch.appendChild(b);
        });
      } else $('.dnext', box).style.display = '';
    };
    const next = () => {
      G.audioUnlock();
      if (choices && i === lines.length - 1) return;
      i++;
      if (i >= lines.length) finish();
      else show();
    };
    setTimeout(() => dlg.addEventListener('click', next), 250);
    show();
  }

  // ---------- Layar judul ----------
  function showTitle() {
    G.scene = G.scenes.title();
    ui.innerHTML = '';
    const t = el(`<div class="title">
      <h1><span class="t1">Aksa</span><span class="t2">si Pemadam Cilik</span></h1>
      <button class="btn big red" id="play">▶ Main</button>
    </div>`);
    ui.appendChild(t);
    tap($('#play', t), () => {
      G.music('town');
      G.wipe(() => {
        enterWorld();
        if (!G.save.intro) {
          dialog(G.INTRO, () => {
            G.save.intro = true;
            G.persist();
            backToWorld();
            ui.classList.add('teach');
            setTimeout(() => ui.classList.remove('teach'), 6000);
          });
        }
      });
    });
  }

  // ---------- Dunia ----------
  let hud = null;
  function hudVisible(v) { if (hud) hud.classList.toggle('hidden', !v); }

  function enterWorld() {
    G.fx.clear();
    G.scene = G.scenes.world();
    G.world.mode = 'walk';
    G.music('town');
    ui.innerHTML = '';
    hud = el(`<div class="hud">
      <div class="topbar">
        <div class="pill">🏡 Desa Ceria</div>
        <div class="spacer"></div>
        <button class="btn small grey" id="mus"></button>
        <button class="btn small yellow" id="koleksi">🎒 Koleksi</button>
        <button class="btn small grey" id="setel" aria-label="Pengaturan">⚙️</button>
      </div>
      <div class="quest"></div>
      <div class="dpad">
        <button data-d="up" class="u">▲</button><button data-d="left" class="l">◀</button>
        <i class="c"></i>
        <button data-d="right" class="r">▶</button><button data-d="down" class="d">▼</button>
      </div>
      <button class="abtn">A<small>Bicara</small></button>
    </div>`);
    ui.appendChild(hud);
    const musLabel = () => ($('#mus', hud).textContent = G.save.music ? '🎵' : '🔇');
    musLabel();
    tap($('#mus', hud), () => { G.save.music = !G.save.music; G.persist(); musLabel(); G.musicRefresh(); });
    tap($('#koleksi', hud), showCollection);
    tap($('#setel', hud), showSettings);
    hud.querySelectorAll('.dpad button').forEach((b) => {
      const d = b.dataset.d;
      const down = (e) => {
        e.preventDefault();
        G.audioUnlock();
        b.classList.add('on');
        G.world.setHeld(d);
      };
      const up = () => {
        b.classList.remove('on');
        if (G.world.held === d) G.world.setHeld(null);
      };
      b.addEventListener('pointerdown', down);
      b.addEventListener('pointerup', up);
      b.addEventListener('pointerleave', up);
      b.addEventListener('pointercancel', up);
    });
    const ab = $('.abtn', hud);
    ab.addEventListener('pointerdown', (e) => { e.preventDefault(); G.audioUnlock(); ab.classList.add('on'); G.world.pressA(); });
    ab.addEventListener('pointerup', () => ab.classList.remove('on'));
    ab.addEventListener('pointerleave', () => ab.classList.remove('on'));
    updateQuest();
  }
  function backToWorld() {
    G.world.mode = 'walk';
    hudVisible(true);
    updateQuest();
    G.world.save();
    G.persist();
  }

  // Ketuk tanah untuk berjalan
  ui.addEventListener('pointerdown', (e) => {
    if (G.scene && G.scene.draw && G.world.mode === 'walk' && (e.target === ui || e.target === hud)) {
      G.audioUnlock();
      G.world.tapWorld(e.clientX, e.clientY);
    }
  });

  function updateQuest() {
    if (!hud) return;
    const q = $('.quest', hud);
    const sv = G.save.solved;
    if (sv.raja) q.innerHTML = '🏅 Desa Ceria aman!';
    else if (G.world.bossActive()) q.innerHTML = '⭐ Ke Balai Desa! <img src="' + G.icons.crown + '" alt="">';
    else q.innerHTML = '<span>Tolong warga:</span>' + G.PROBLEMS.map((p) => `<span class="qi ${sv[p.id] ? 'ok' : ''}"><img src="${G.icons[p.icon]}" alt="">${sv[p.id] ? '<b>✓</b>' : ''}</span>`).join('');
  }

  G.world.onInteract = function (id) {
    if (G.world.mode !== 'walk') return;
    const P = (pid) => G.ALL.find((p) => p.id === pid);
    const sv = G.save.solved;
    if (id === 'papan') return dialog(G.SIGN, backToWorld);
    if (id === 'kades') {
      const lines = sv.raja ? G.KADES.done : G.world.bossActive() ? G.KADES.boss : G.KADES.before;
      return dialog(lines, backToWorld);
    }
    if (id === 'raja') return offer(P('raja'));
    if (id === 'api') {
      if (sv.daun) return dialog([{ who: 'ara', text: 'Tumpukan daunnya sudah aman. Api Jahil sudah kabur!' }], backToWorld, [
        { label: '🔁 Latihan lagi', cls: 'yellow', fn: () => fight(P('daun'), true) },
        { label: 'Dadah 👋', cls: 'grey', fn: backToWorld },
      ]);
      return offer(P('daun'));
    }
    const map = { ani: 'kucing', budi: 'roti', joko: 'truk' };
    if (map[id]) offer(P(map[id]));
  };

  function offer(p) {
    if (G.save.solved[p.id]) {
      return dialog(p.after || p.thanks.slice(0, 1), backToWorld, [
        { label: '🔁 Latihan lagi', cls: 'yellow', fn: () => fight(p, true) },
        { label: 'Dadah 👋', cls: 'grey', fn: backToWorld },
      ]);
    }
    dialog(p.ask, backToWorld, [
      { label: 'Ayo tolong! 💪', cls: 'green', fn: () => fight(p, false) },
      { label: 'Nanti', cls: 'grey', fn: backToWorld },
    ]);
  }

  function fight(p, practice) {
    G.world.mode = 'busy';
    G.world.save();
    G.persist();
    G.battle.start(p, (res) => {
      enterWorld();
      G.world.mode = 'busy';
      hudVisible(false);
      if (!res.won) return backToWorld();
      const stars = res.mistakes <= 1 ? 3 : res.mistakes <= 3 ? 2 : 1;
      G.save.stars[p.id] = Math.max(G.save.stars[p.id] || 0, stars);
      if (practice) {
        G.persist();
        return dialog([{ who: 'ara', text: `Latihan selesai! Kamu dapat ${stars} bintang. Hebat!` }], backToWorld);
      }
      G.save.solved[p.id] = true;
      G.save.acc[p.acc] = true;
      G.save.equip[p.acc] = true;
      G.persist();
      dialog(p.thanks, () => reward(p, stars));
    });
  }

  function reward(p, stars) {
    G.world.mode = 'busy';
    G.fx.confetti(80);
    G.sfx.badge();
    const idx = G.ALL.indexOf(p);
    modal.innerHTML = '';
    const c = el(`<div class="card reward">
      <h2>${p.id === 'raja' ? 'Kamu Pahlawan Desa!' : 'Berhasil Menolong!'}</h2>
      <div class="stars big">${'<span class="on">★</span>'.repeat(stars)}${'<span>★</span>'.repeat(3 - stars)}</div>
      <div class="gifts">
        <div class="gift"><img class="spin" src="${G.icons.badges[idx]}" alt=""><span>Lencana<br><b>${p.badge}</b></span></div>
        <div class="gift"><div class="araprev"></div><span>Ara dapat<br><b>${G.ACCESSORIES[p.acc]}</b></span></div>
      </div>
      <button class="btn big green" id="lanjut">Lanjut</button>
    </div>`);
    $('.araprev', c).appendChild(G.portrait('ara', 60));
    modal.appendChild(c);
    modal.classList.add('show');
    tap($('#lanjut', c), () => {
      closeModal();
      if (p.id !== 'raja' && G.world.bossActive()) return bossAppears();
      backToWorld();
      if (p.id === 'raja') G.fx.confetti(120);
    });
  }

  function bossAppears() {
    G.world.shake = 1.4;
    G.sfx.rumble();
    for (let i = 0; i < 6; i++) setTimeout(() => G.fx.smoke(15 * 16 + 8, 7 * 16, 3), i * 150);
    updateQuest();
    setTimeout(() => dialog(G.BOSS_APPEAR, backToWorld), 1400);
  }

  function closeModal() {
    modal.classList.remove('show');
    modal.innerHTML = '';
  }

  // ---------- Koleksi ----------
  function showCollection() {
    G.world.mode = 'busy';
    G.world.setHeld(null);
    modal.innerHTML = '';
    const c = el(`<div class="card collection">
      <h2>🎒 Koleksi</h2>
      <h3>Lencana</h3>
      <div class="badges">${G.ALL.map((p, i) => {
        const st = G.save.stars[p.id] || 0;
        return G.save.solved[p.id]
          ? `<div class="bd"><img src="${G.icons.badges[i]}" alt=""><span>${p.badge}</span><em>${'★'.repeat(st)}${'☆'.repeat(3 - st)}</em></div>`
          : `<div class="bd off"><img src="${G.icons.badges[i]}" alt=""><span>???</span></div>`;
      }).join('')}</div>
      <h3>Aksesori Ara <small>(ketuk untuk pakai/lepas)</small></h3>
      <div class="accrow"><div class="arabig"></div><div class="accs"></div></div>
      <button class="btn green" id="tutup">Tutup</button>
    </div>`);
    const accs = $('.accs', c);
    const refresh = () => {
      const big = $('.arabig', c);
      big.innerHTML = '';
      big.appendChild(G.portrait('ara', 60));
      accs.innerHTML = '';
      Object.entries(G.ACCESSORIES).forEach(([k, name]) => {
        const have = !!G.save.acc[k];
        const b = el(`<button class="acc ${have ? '' : 'off'} ${G.save.equip[k] ? 'on' : ''}">${have ? name : '🔒 ???'}</button>`);
        if (have) tap(b, () => { G.save.equip[k] = !G.save.equip[k]; G.persist(); refresh(); });
        accs.appendChild(b);
      });
    };
    refresh();
    modal.appendChild(c);
    modal.classList.add('show');
    tap($('#tutup', c), () => { closeModal(); backToWorld(); });
  }

  // ---------- Pengaturan (orang tua) ----------
  function showSettings() {
    G.world.mode = 'busy';
    G.world.setHeld(null);
    modal.innerHTML = '';
    const c = el(`<div class="card settings">
      <h2>⚙️ Pengaturan</h2>
      <p class="note">Untuk Ayah/Bunda</p>
      <button class="btn toggle" id="tm"></button>
      <button class="btn toggle" id="ts"></button>
      <button class="btn red hold" id="reset"><span class="fill"></span><span class="lbl">Tahan 3 detik untuk hapus progres</span></button>
      <button class="btn green" id="tutup">Tutup</button>
    </div>`);
    const lbl = () => {
      $('#tm', c).textContent = `🎵 Musik latar: ${G.save.music ? 'NYALA' : 'MATI'}`;
      $('#ts', c).textContent = `🔔 Efek suara: ${G.save.sfx ? 'NYALA' : 'MATI'}`;
      const m = hud && $('#mus', hud);
      if (m) m.textContent = G.save.music ? '🎵' : '🔇';
    };
    lbl();
    tap($('#tm', c), () => { G.save.music = !G.save.music; G.persist(); lbl(); G.musicRefresh(); });
    tap($('#ts', c), () => { G.save.sfx = !G.save.sfx; G.persist(); lbl(); });
    tap($('#tutup', c), () => { closeModal(); backToWorld(); });
    const rb = $('#reset', c);
    let holdT = null;
    const start = (e) => {
      e.preventDefault();
      rb.classList.add('holding');
      holdT = setTimeout(() => {
        const keep = { music: G.save.music, sfx: G.save.sfx };
        G.save = Object.assign(fresh(), keep);
        G.persist();
        location.reload();
      }, 3000);
    };
    const stop = () => { clearTimeout(holdT); rb.classList.remove('holding'); };
    rb.addEventListener('pointerdown', start);
    rb.addEventListener('pointerup', stop);
    rb.addEventListener('pointerleave', stop);
    rb.addEventListener('pointercancel', stop);
    modal.appendChild(c);
    modal.classList.add('show');
  }

  // ---------- Keyboard (untuk laptop) ----------
  const KEYS = { ArrowUp: 'up', ArrowDown: 'down', ArrowLeft: 'left', ArrowRight: 'right', w: 'up', s: 'down', a: 'left', d: 'right' };
  window.addEventListener('keydown', (e) => {
    G.audioUnlock();
    if (KEYS[e.key]) { e.preventDefault(); if (G.world.held !== KEYS[e.key]) G.world.setHeld(KEYS[e.key]); }
    else if (e.key === ' ' || e.key === 'Enter') {
      e.preventDefault();
      if (dlg.classList.contains('show')) dlg.click();
      else G.world.pressA();
    }
  });
  window.addEventListener('keyup', (e) => { if (KEYS[e.key] && G.world.held === KEYS[e.key]) G.world.setHeld(null); });

  // Simpan posisi berkala & hentikan musik saat aplikasi di latar belakang
  setInterval(() => { if (G.world.mode === 'walk') { G.world.save(); G.persist(); } }, 4000);
  let musicWas = null;
  document.addEventListener('visibilitychange', () => {
    if (document.hidden) { musicWas = G.battle.active() ? 'battle' : 'town'; G.music(null); }
    else if (musicWas) G.music(musicWas);
  });

  // ---------- Mulai ----------
  function boot() {
    G.buildSprites();
    G.world.init();
    resize();
    showTitle();
    requestAnimationFrame(frame);
    document.addEventListener('gesturestart', (e) => e.preventDefault());
  }
  G.debug = { enterWorld, dialog, showCollection, showSettings, fight, reward, bossAppears };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
