// Alur game: layar judul, peta, misi, dialog, hadiah, koleksi, pengaturan.
(function () {
  const G = (window.G = window.G || {});
  const $ = (s, el = document) => el.querySelector(s);
  const R = Math.round;

  // ---------- Simpan progres ----------
  const KEY = 'aksa-pemadam-v1';
  const fresh = () => ({ done: {}, stars: {}, acc: {}, equip: {}, intro: false, tut: false, voice: true, sfx: true });
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
  G.nextMission = () => {
    for (let i = 0; i < G.MISSIONS.length; i++) if (!G.save.done[i]) return i;
    return G.MISSIONS.length - 1;
  };
  const unlocked = (i) => i === 0 || !!G.save.done[i - 1];

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
    if (G.onResize) G.onResize();
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
    if (G.scene) G.scene.draw(ctx, G.time, dt);
    G.fx.update(dt);
    G.fx.draw(ctx);
    requestAnimationFrame(frame);
  }

  // ---------- UI helper ----------
  const ui = $('#ui');
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
  // Teks melayang di posisi dunia (koordinat piksel game)
  G.floatText = function (text, lx, ly, color = '#2b1d1a') {
    const { S } = G.view;
    const f = el(`<div class="float" style="left:${lx * S}px;top:${ly * S}px;color:${color}">${text}</div>`);
    $('#floats').appendChild(f);
    setTimeout(() => f.remove(), 1400);
  };
  function bigPraise(text) {
    const f = el(`<div class="praise">${text}</div>`);
    $('#floats').appendChild(f);
    setTimeout(() => f.remove(), 1300);
  }

  // Potret karakter untuk dialog
  function portrait(who, size = 60) {
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
    }
    return c;
  }

  // ---------- Dialog ----------
  function dialog(lines, done) {
    let i = 0;
    const box = el(`<div class="dialog"><div class="pwrap"></div><div class="dbody"><div class="dname"></div><div class="dtext"></div><div class="dnext">Ketuk untuk lanjut ▶</div></div></div>`);
    ui.appendChild(box);
    const show = () => {
      const L = lines[i];
      const c = G.CHARS[L.who];
      const pw = $('.pwrap', box);
      pw.innerHTML = '';
      pw.style.background = c.color;
      pw.appendChild(portrait(L.who));
      $('.dname', box).textContent = c.name;
      $('.dname', box).style.background = c.color;
      $('.dtext', box).textContent = L.text;
      box.classList.remove('pop');
      void box.offsetWidth;
      box.classList.add('pop');
      G.say(L.text, L.who);
    };
    const next = () => {
      if (!box.isConnected) {
        ui.removeEventListener('click', next);
        return;
      }
      G.audioUnlock();
      G.sfx.tap();
      i++;
      if (i >= lines.length) {
        G.hush();
        box.remove();
        ui.removeEventListener('click', next);
        done && done();
      } else show();
    };
    setTimeout(() => ui.addEventListener('click', next), 250);
    show();
  }

  // ---------- Layar judul ----------
  function showTitle() {
    G.scene = G.scenes.title();
    G.onResize = null;
    ui.innerHTML = '';
    const t = el(`<div class="title">
      <h1><span class="t1">Aksa</span><span class="t2">si Pemadam Cilik</span></h1>
      <button class="btn big red" id="play">▶ Main</button>
    </div>`);
    ui.appendChild(t);
    tap($('#play', t), () => {
      G.say('Aksa si Pemadam Cilik!', 'aksa');
      if (!G.save.intro) {
        ui.innerHTML = '';
        dialog(G.INTRO, () => {
          G.save.intro = true;
          G.persist();
          showMap();
        });
      } else showMap();
    });
  }

  // ---------- Peta ----------
  let run = null; // misi yang sedang berjalan

  function showMap() {
    run = null;
    G.hush();
    G.fx.clear();
    G.scene = G.scenes.map();
    ui.innerHTML = '';
    const top = el(`<div class="topbar">
      <div class="pill">🏡 Desa Ceria</div>
      <div class="spacer"></div>
      <button class="btn small yellow" id="koleksi">🎒 Koleksi</button>
      <button class="btn small grey" id="setel" aria-label="Pengaturan">⚙️</button>
    </div>`);
    ui.appendChild(top);
    tap($('#koleksi', top), showCollection);
    tap($('#setel', top), showSettings);

    const nodes = el('<div class="nodes"></div>');
    ui.appendChild(nodes);
    const next = G.nextMission();
    G.MISSIONS.forEach((m, i) => {
      const open = unlocked(i);
      const done = !!G.save.done[i];
      const st = G.save.stars[i] || 0;
      const n = el(`<button class="node ${open ? '' : 'locked'} ${done ? 'done' : ''} ${i === next && !done ? 'next' : ''}">
        <img src="${G.icons[m.icon]}" alt="">
        <span class="num">${i + 1}</span>
        ${open ? '' : '<span class="lock">🔒</span>'}
        <span class="stars">${done ? '★'.repeat(st) + '☆'.repeat(3 - st) : ''}</span>
      </button>`);
      tap(n, () => {
        if (!open) {
          G.say('Selesaikan misi sebelumnya dulu ya!', 'ara');
          n.classList.remove('shake'); void n.offsetWidth; n.classList.add('shake');
          return;
        }
        showMissionCard(i);
      });
      nodes.appendChild(n);
    });
    const place = () => {
      const { W, H, S } = G.view;
      [...nodes.children].forEach((n, i) => {
        const [fx, fy] = G.MAP_NODES[i];
        n.style.left = fx * W * S + 'px';
        n.style.top = fy * H * S + 'px';
      });
    };
    G.onResize = place;
    place();
    if (G.save.done[G.MISSIONS.length - 1]) {
      ui.appendChild(el('<div class="banner">🏅 Desa Ceria aman! Kamu Pahlawan Desa!</div>'));
    }
  }

  // ---------- Kartu misi (instruksi bergambar) ----------
  function showMissionCard(i) {
    const m = G.MISSIONS[i];
    modal.innerHTML = '';
    const c = el(`<div class="card mission-card">
      <div class="mnum">Misi ${i + 1}</div>
      <h2>${m.title}</h2>
      <img class="hero" src="${G.icons[m.icon]}" alt="">
      <p class="goal">${m.goal}</p>
      <div class="howto">
        <div class="step"><div class="ico eq">3+4</div><span>Baca soal</span></div>
        <div class="arrow">➜</div>
        <div class="step"><div class="ico tapb">7</div><span>Ketuk jawaban</span></div>
        <div class="arrow">➜</div>
        <div class="step"><div class="ico"><img src="${G.icons.drop}" alt=""></div><span>Tolong warga</span></div>
        <div class="arrow">➜</div>
        <div class="step"><div class="ico"><img src="${G.icons.badges[i]}" alt=""></div><span>Dapat lencana</span></div>
      </div>
      <div class="row">
        <button class="btn grey" id="batal">Nanti</button>
        <button class="btn big green" id="mulai">Ayo Mulai!</button>
      </div>
    </div>`);
    modal.appendChild(c);
    modal.classList.add('show');
    G.say(`Misi ${i + 1}. ${m.title}. ${m.goal}`, 'ara');
    tap($('#batal', c), closeModal);
    tap($('#mulai', c), () => { closeModal(); startMission(i); });
  }
  function closeModal() {
    G.hush();
    modal.classList.remove('show');
    modal.innerHTML = '';
  }

  // ---------- Misi ----------
  function startMission(i) {
    const m = G.MISSIONS[i];
    G.fx.clear();
    const scene = G.scenes[m.scene]();
    G.scene = scene;
    G.onResize = null;
    ui.innerHTML = '';
    const back = el('<button class="btn small grey back">⬅ Desa</button>');
    ui.appendChild(back);
    tap(back, () => { G.hush(); showMap(); });
    const st = { m, i, qs: G.makeQuestions(m.gens), qi: 0, mistakes: 0, scene };
    run = st;
    dialog(m.intro, () => askQuestion(st));
  }

  function askQuestion(st) {
    if (run !== st) return;
    const q = st.qs[st.qi];
    const n = st.qs.length;
    let wrongHere = 0;
    let locked = false;
    $('.qpanel') && $('.qpanel').remove();
    const vis = typeof st.m.visual === 'function' ? st.m.visual(q) : st.m.visual;
    const prompt = st.m.prompt(q);
    const p = el(`<div class="qpanel">
      <div class="qhead">
        <div class="qara"></div>
        <div class="qtext"></div>
        <button class="btn round blue" id="dengar" aria-label="Dengar lagi">🔊</button>
        <div class="qprog">${st.qs.map((_, k) => `<span class="${k < st.qi ? 'ok' : k === st.qi ? 'now' : ''}"></span>`).join('')}</div>
      </div>
      <div class="qeq">${q.eq.replace('?', '<b class="qm">?</b>')}</div>
      <div class="qvis"></div>
      <div class="qans">${q.choices.map((c) => `<button class="ans" data-v="${c}">${c}</button>`).join('')}</div>
    </div>`);
    ui.appendChild(p);
    $('.qara', p).appendChild(portrait('ara', 30));
    const qtext = $('.qtext', p);
    qtext.textContent = prompt;
    if (vis) $('.qvis', p).appendChild(visualFrames(q, vis, false));

    const speakQ = () => G.say(`${prompt} ${q.spoken}`, 'ara');
    speakQ();
    tap($('#dengar', p), speakQ);

    // Tutorial pertama kali: tangan menunjuk jawaban benar
    if (!G.save.tut && st.i === 0 && st.qi === 0) {
      const btn = [...p.querySelectorAll('.ans')].find((b) => +b.dataset.v === q.ans);
      btn.appendChild(el('<span class="hand">👆</span>'));
      qtext.textContent = 'Ketuk jawaban yang benar!';
    }

    p.querySelectorAll('.ans').forEach((b) =>
      b.addEventListener('click', (e) => {
        e.stopPropagation();
        G.audioUnlock();
        if (locked || b.disabled) return;
        const v = +b.dataset.v;
        if (v === q.ans) {
          locked = true;
          b.classList.add('right');
          G.sfx.correct();
          const word = G.PRAISE[Math.floor(Math.random() * G.PRAISE.length)];
          bigPraise(word);
          G.say(word, 'ara');
          G.save.tut = true;
          st.scene.correct(st.qi, n);
          const dots = p.querySelectorAll('.qprog span');
          dots[st.qi].className = 'ok';
          setTimeout(() => {
            if (run !== st) return;
            st.qi++;
            if (st.qi < n) askQuestion(st);
            else finishMission(st);
          }, 1500);
        } else {
          wrongHere++;
          st.mistakes++;
          b.classList.add('wrong');
          b.disabled = true;
          G.sfx.wrong();
          st.scene.wrong();
          const tip = G.TRY[Math.floor(Math.random() * G.TRY.length)];
          qtext.textContent = tip;
          const qv = $('.qvis', p);
          qv.innerHTML = '';
          qv.appendChild(visualFrames(q, vis || 'dot', true));
          const how = q.op === '+' ? 'Ketuk titiknya satu per satu, hitung semuanya!'
            : q.op === '−' ? 'Yang dicoret sudah hilang. Hitung yang tersisa!'
            : `Ada ${q.a} kelompok, tiap kelompok ${q.b}. Hitung semuanya!`;
          G.say(`${tip} ${how}`, 'ara');
          setTimeout(() => { if (!locked) qtext.textContent = how; }, 1800);
          if (wrongHere >= 2) {
            const good = [...p.querySelectorAll('.ans')].find((x) => +x.dataset.v === q.ans);
            good.classList.add('glow');
          }
        }
      })
    );
  }

  // Bingkai sepuluh (ten-frame) berisi ikon/titik; mode bantuan bisa diketuk untuk menghitung.
  function visualFrames(q, kind, interactive) {
    const wrap = el('<div class="frames"></div>');
    const img = kind && kind !== 'dot' ? G.icons[kind] : null;
    let count = 0;
    const cell = (cls, k) => {
      const c = el(`<div class="cell ${cls}">${img ? `<img src="${img}" alt="">` : '<i></i>'}</div>`);
      if (interactive && cls.indexOf('gone') < 0) {
        c.addEventListener('click', (e) => {
          e.stopPropagation();
          if (c.classList.contains('counted')) return;
          count++;
          c.classList.add('counted');
          c.appendChild(el(`<b class="cnum">${count}</b>`));
          G.sfx.count(count);
          G.say(G.kata(count), 'ara');
        });
      }
      return c;
    };
    if (q.op === '×') {
      for (let g = 0; g < q.a; g++) {
        const grp = el('<div class="group"></div>');
        for (let k = 0; k < q.b; k++) grp.appendChild(cell('cb'));
        wrap.appendChild(grp);
      }
      wrap.classList.add('groups');
      return wrap;
    }
    const items = [];
    if (q.op === '+') {
      for (let k = 0; k < q.a; k++) items.push('ca');
      for (let k = 0; k < q.b; k++) items.push('cb');
    } else {
      for (let k = 0; k < q.a; k++) items.push(k >= q.a - q.b ? 'ca gone' : 'ca');
    }
    const frames = Math.ceil(items.length / 10);
    for (let f = 0; f < frames; f++) {
      const fr = el('<div class="tenframe"></div>');
      for (let k = 0; k < 10; k++) {
        const it = items[f * 10 + k];
        fr.appendChild(it ? cell(it) : el('<div class="cell empty"></div>'));
      }
      wrap.appendChild(fr);
    }
    return wrap;
  }

  function finishMission(st) {
    const p = $('.qpanel');
    p && p.remove();
    G.sfx.win();
    st.scene.finish(() => {
      if (run !== st) return;
      dialog(st.m.outro, () => reward(st));
    });
  }

  function reward(st) {
    const stars = st.mistakes <= 1 ? 3 : st.mistakes <= 3 ? 2 : 1;
    const first = !G.save.done[st.i];
    G.save.done[st.i] = true;
    G.save.stars[st.i] = Math.max(G.save.stars[st.i] || 0, stars);
    G.save.acc[st.m.acc] = true;
    if (first) G.save.equip[st.m.acc] = true;
    G.persist();
    G.fx.confetti(80);
    G.sfx.badge();
    modal.innerHTML = '';
    const c = el(`<div class="card reward">
      <h2>Misi Berhasil!</h2>
      <div class="stars big">${'<span class="on">★</span>'.repeat(stars)}${'<span>★</span>'.repeat(3 - stars)}</div>
      <div class="gifts">
        <div class="gift"><img class="spin" src="${G.icons.badges[st.i]}" alt=""><span>Lencana<br><b>${st.m.badge}</b></span></div>
        <div class="gift"><div class="araprev"></div><span>Ara dapat<br><b>${G.ACCESSORIES[st.m.acc]}</b></span></div>
      </div>
      <button class="btn big green" id="lanjut">Kembali ke Desa</button>
    </div>`);
    $('.araprev', c).appendChild(portrait('ara', 60));
    modal.appendChild(c);
    modal.classList.add('show');
    G.say(`Misi berhasil! Kamu dapat lencana ${st.m.badge}. Ara dapat ${G.ACCESSORIES[st.m.acc]}!`, 'ara');
    tap($('#lanjut', c), () => { closeModal(); showMap(); });
  }

  // ---------- Koleksi ----------
  function showCollection() {
    modal.innerHTML = '';
    const c = el(`<div class="card collection">
      <h2>🎒 Koleksi</h2>
      <h3>Lencana</h3>
      <div class="badges">${G.MISSIONS.map((m, i) => G.save.done[i]
        ? `<div class="bd"><img src="${G.icons.badges[i]}" alt=""><span>${m.badge}</span></div>`
        : `<div class="bd off"><img src="${G.icons.badges[i]}" alt=""><span>???</span></div>`).join('')}</div>
      <h3>Aksesori Ara <small>(ketuk untuk pakai/lepas)</small></h3>
      <div class="accrow"><div class="arabig"></div><div class="accs"></div></div>
      <button class="btn green" id="tutup">Tutup</button>
    </div>`);
    const accs = $('.accs', c);
    const refresh = () => {
      const big = $('.arabig', c);
      big.innerHTML = '';
      big.appendChild(portrait('ara', 60));
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
    tap($('#tutup', c), closeModal);
  }

  // ---------- Pengaturan (orang tua) ----------
  function showSettings() {
    modal.innerHTML = '';
    const c = el(`<div class="card settings">
      <h2>⚙️ Pengaturan</h2>
      <p class="note">Untuk Ayah/Bunda</p>
      <button class="btn toggle" id="tv"></button>
      <button class="btn toggle" id="ts"></button>
      <button class="btn red hold" id="reset"><span class="fill"></span><span class="lbl">Tahan 3 detik untuk hapus progres</span></button>
      <button class="btn green" id="tutup">Tutup</button>
    </div>`);
    const lbl = () => {
      $('#tv', c).textContent = `🗣️ Narasi suara: ${G.save.voice ? 'NYALA' : 'MATI'}`;
      $('#ts', c).textContent = `🔔 Efek suara: ${G.save.sfx ? 'NYALA' : 'MATI'}`;
    };
    lbl();
    tap($('#tv', c), () => { G.save.voice = !G.save.voice; G.persist(); lbl(); if (!G.save.voice) G.hush(); });
    tap($('#ts', c), () => { G.save.sfx = !G.save.sfx; G.persist(); lbl(); });
    tap($('#tutup', c), () => { closeModal(); showMap(); });
    const rb = $('#reset', c);
    let holdT = null;
    const start = (e) => {
      e.preventDefault();
      rb.classList.add('holding');
      holdT = setTimeout(() => {
        const keep = { voice: G.save.voice, sfx: G.save.sfx };
        G.save = Object.assign(fresh(), keep);
        G.persist();
        $('.lbl', rb).textContent = 'Progres dihapus ✓';
        rb.classList.remove('holding');
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

  // ---------- Mulai ----------
  function boot() {
    G.buildSprites();
    resize();
    showTitle();
    requestAnimationFrame(frame);
    document.addEventListener('gesturestart', (e) => e.preventDefault());
  }
  G.debug = { showMap, startMission, showCollection, showSettings, reward, showMissionCard };
  if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot);
  else boot();
})();
