// Murajaah Juz Amma: Sambung Ayat & Tebak Surat (bersama teman), lalu Susun Ayat &
// Kata yang Hilang di panggung Porseni. Teks Latin & audio dari data/juzamma.js.
(function () {
  const G = (window.G = window.G || {});
  const $ = (s, el = document) => el.querySelector(s);
  const R = Math.round;
  const el = (html) => {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };
  const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const shuffle = (arr) => G.Q.shuffle(arr.slice());
  const esc = (s) => s.replace(/&/g, '&amp;').replace(/</g, '&lt;');

  const Q = () => G.JUZAMMA.surahs;
  const name = (s) => Q()[s].name;
  // Teks Kemenag menandai bacaan sambung dalam kurung, mis. "aḥad(un)." Untuk anak
  // ditampilkan bacaan saat berhenti (waqaf): "aḥad".
  const clean = (t) => t.replace(/\([^)]*\)/g, '').replace(/\s+/g, ' ').replace(/[.,;:]+$/, '').trim();
  const cache = {};
  const ayat = (s) => cache[s] || (cache[s] = Q()[s].ayat.map(clean));

  // ---------- Audio bacaan (Syaikh Al-Husary Mu'allim) ----------
  const player = new Audio();
  player.preload = 'auto';
  let playingBtn = null;
  const pad = (n) => String(n).padStart(3, '0');
  function stopRecite() {
    player.pause();
    if (playingBtn) playingBtn.classList.remove('playing');
    playingBtn = null;
    G.musicHold(false);
  }
  function recite(s, a, btn) {
    stopRecite();
    G.musicHold(true);
    player.src = G.JUZAMMA.audioBase + pad(s) + pad(a) + '.mp3';
    playingBtn = btn || null;
    if (btn) btn.classList.add('playing');
    const p = player.play();
    if (p && p.catch) p.catch(() => stopRecite());
  }
  player.addEventListener('ended', stopRecite);
  player.addEventListener('error', stopRecite);

  // ---------- Pembuat soal ----------
  function sambung(list) {
    const s = pick(list.filter((n) => ayat(n).length >= 3));
    const A = ayat(s);
    const i = Math.floor(Math.random() * (A.length - 1));
    const ans = A[i + 1];
    let pool = A.filter((x, k) => k !== i && k !== i + 1 && x !== ans);
    if (pool.length < 2) pool = pool.concat(list.filter((n) => n !== s).flatMap((n) => ayat(n)));
    const wrong = shuffle([...new Set(pool)].filter((x) => x !== ans && x !== A[i])).slice(0, 2);
    const opts = shuffle([{ t: ans, s, a: i + 2, ok: true }].concat(wrong.map((t) => {
      const src = list.concat([s]).find((n) => ayat(n).includes(t));
      return { t, s: src, a: ayat(src).indexOf(t) + 1, ok: false };
    })));
    return { kind: 'sambung', s, a: i + 1, prompt: A[i], opts, key: `${s}:${i}` };
  }
  function tebak(list) {
    const s = pick(list);
    const others = shuffle(list.filter((n) => n !== s)).slice(0, 2);
    return { kind: 'tebak', s, a: 1, opts: shuffle([s, ...others]).map((n) => ({ t: name(n), ok: n === s })), key: `t${s}` };
  }
  const words = (t) => t.split(/\s+/).filter(Boolean);
  const lastWord = (t) => words(t)[words(t).length - 1];
  function kata(list) {
    const cands = list.flatMap((s) => ayat(s).map((t, k) => ({ s, a: k + 1, t }))).filter((c) => words(c.t).length >= 2);
    const c = pick(cands);
    const ans = lastWord(c.t);
    const wrong = shuffle([...new Set(cands.map((x) => lastWord(x.t)))].filter((w) => w.toLowerCase() !== ans.toLowerCase())).slice(0, 2);
    const head = words(c.t).slice(0, -1).join(' ');
    return { kind: 'kata', s: c.s, a: c.a, head, ans, opts: shuffle([ans, ...wrong]).map((w) => ({ t: w, ok: w === ans })), key: `k${c.s}:${c.a}` };
  }
  function susun(s) {
    return { kind: 'susun', s, key: `s${s}` };
  }

  // ---------- Adegan ----------
  function halaqahScene(friend) {
    return {
      ownsFx: true,
      draw(ctx, t) {
        const { W, H } = G.view;
        const { px } = G.side;
        ['#cfeeff', '#dff4ff', '#ecf9ff'].forEach((c, i) => px(ctx, 0, R(i * H * 0.1), W, R(H * 0.1) + 1, c));
        px(ctx, 0, R(H * 0.3), W, H, '#a8dc8c');
        const mx = R(W * 0.08), my = R(H * 0.4), mw = R(W * 0.84), mh = R(H * 0.28);
        px(ctx, mx, my, mw, mh, '#2b1d1a');
        px(ctx, mx + 2, my + 2, mw - 4, mh - 4, '#e86f5a');
        for (let i = 0; i < 12; i++) px(ctx, mx + 2 + R((i * mw) / 12), my + 2, 3, mh - 4, '#f4c430');
        const bob = Math.sin(t * 3) > 0.6 ? -1 : 0;
        const fr = G.spr[friend];
        ctx.drawImage(fr, R(W * 0.72 - fr.width), R(H * 0.52 - fr.height * 2) + bob, fr.width * 2, fr.height * 2);
        const ara = G.spr.araDir(G.save.equip).back, ak = G.spr.aksaBack;
        ctx.drawImage(ara, R(W * 0.18 - ara.width), R(H * 0.66 - ara.height * 2), ara.width * 2, ara.height * 2);
        ctx.drawImage(ak, R(W * 0.33 - ak.width), R(H * 0.68 - ak.height * 2), ak.width * 2, ak.height * 2);
        G.fx.draw(ctx);
      },
    };
  }
  function stageScene() {
    const S = {
      ownsFx: true,
      cheer: 0,
      draw(ctx, t, dt) {
        const { W, H } = G.view;
        const { px, disc } = G.side;
        px(ctx, 0, 0, W, H, '#3a2a5a');
        for (let x = 0; x < W; x += 6) px(ctx, x, 0, 6, R(H * 0.46), x % 12 ? '#b8242a' : '#d63c2f');
        px(ctx, R(W * 0.12), 0, R(W * 0.76), R(H * 0.46), '#f7e2c0');
        px(ctx, R(W * 0.12), 0, R(W * 0.76), 10, '#d63c2f');
        for (let x = W * 0.12; x < W * 0.88; x += 8) disc(ctx, x + 4, 10, 4, '#d63c2f');
        px(ctx, R(W * 0.06), R(H * 0.43), R(W * 0.88), 8, '#2b1d1a');
        px(ctx, R(W * 0.06), R(H * 0.43), R(W * 0.88), 6, '#c98a45');
        const xs = [0.24, 0.36, 0.5, 0.64, 0.76];
        const cast = [G.spr.dika, G.spr.salma, G.spr.aksa, G.spr.umar, G.spr.aisyah];
        S.cheer = Math.max(0, S.cheer - dt);
        cast.forEach((sp, i) => {
          const hop = S.cheer > 0 ? -Math.abs(Math.sin((t + i * 0.3) * 10)) * 3 : 0;
          ctx.drawImage(sp, R(W * xs[i] - sp.width / 2), R(H * 0.435 - sp.height + hop));
        });
        const ara = G.spr.araDir(G.save.equip).down[0];
        ctx.drawImage(ara, R(W * 0.88 - ara.width / 2), R(H * 0.435 - ara.height));
        for (let r = 0; r < 2; r++)
          for (let i = 0; i < 18; i++) {
            const x = 6 + i * (W / 17) + (r ? 6 : 0);
            const y = H * 0.5 + r * 8 + (S.cheer > 0 && (i + r) % 2 ? -2 : 0);
            disc(ctx, x, y, 5, ['#2a1d17', '#e86fa0', '#3fa34d', '#7fd3ff', '#1f1f1f', '#f4c430'][(i + r * 3) % 6]);
            px(ctx, x - 6, y + 4, 12, 10, ['#3b7dd8', '#e8451c', '#8a4fd8', '#45b04a'][(i + r) % 4]);
          }
        G.fx.draw(ctx);
      },
    };
    return S;
  }

  // ---------- Sesi ----------
  let current = null;

  function praise() {
    const f = el(`<div class="praise">${pick(G.PRAISE)}</div>`);
    $('#floats').appendChild(f);
    setTimeout(() => f.remove(), 1300);
  }

  function startSession(cfg) {
    const ui = $('#ui');
    const S = { cfg, qi: 0, mistakes: 0, total: cfg.plan.length };
    current = S;
    G.wipe(() => {
      G.fx.clear();
      S.scene = cfg.stage ? stageScene() : halaqahScene(cfg.friend);
      G.scene = S.scene;
      ui.innerHTML = '';
      const box = el(`<div class="mj ${cfg.stage ? 'stage-on' : ''}">
        ${cfg.stage ? '<div class="mj-banner">🎪 PORSENI TPA 🎪</div>' : `<div class="mj-title"><div class="ttl">${cfg.title}</div><div class="sub"></div></div>`}
        <button class="btn small grey run">⬅ Nanti</button>
        <div class="mj-panel"><div class="mj-left"></div><div class="mj-right"></div></div>
      </div>`);
      ui.appendChild(box);
      S.box = box;
      $('.run', box).addEventListener('click', (e) => { e.stopPropagation(); G.sfx.tap(); end(S, false); });
      ask(S);
    });
  }

  function ask(S, replace) {
    if (current !== S) return;
    const plan = S.cfg.plan[S.qi];
    if (!S.q || replace || S.q.planIdx !== S.qi) {
      let q, tries = 0;
      do { q = plan(); tries++; } while (S.q && q.key === S.q.key && tries < 20);
      q.planIdx = S.qi;
      S.q = q;
    }
    const q = S.q;
    const sub = $('.sub', S.box);
    if (sub) sub.textContent = `Soal ${S.qi + 1} dari ${S.total}`;
    const L = $('.mj-left', S.box), Rt = $('.mj-right', S.box);
    L.innerHTML = '';
    Rt.innerHTML = '';
    Rt.className = 'mj-right';
    const playBtn = (s, a, label) => {
      const b = el(`<button class="mj-play"><b>▶</b>${label || ''}</button>`);
      b.addEventListener('click', (e) => { e.stopPropagation(); recite(s, a, b); });
      return b;
    };

    if (q.kind === 'sambung') {
      L.appendChild(el('<div class="q">Dengarkan ayat ini:</div>'));
      L.appendChild(playBtn(q.s, q.a, `<span class="latin">${esc(q.prompt)}</span>`));
      L.appendChild(el('<div class="q">Ayat berikutnya apa ya?</div>'));
      q.opts.forEach((o, k) => {
        const b = el(`<div class="mj-opt c${k}"><button class="spk" aria-label="Dengar">🔊</button><button class="pickopt">${esc(o.t)}</button></div>`);
        $('.spk', b).addEventListener('click', (e) => { e.stopPropagation(); recite(o.s, o.a, $('.spk', b)); });
        $('.pickopt', b).addEventListener('click', (e) => { e.stopPropagation(); answer(S, o.ok, b); });
        Rt.appendChild(b);
      });
      recite(q.s, q.a, $('.mj-play', L));
    } else if (q.kind === 'tebak') {
      L.appendChild(el('<div class="q">Dengarkan awal surat ini:</div>'));
      L.appendChild(playBtn(q.s, 1, `<span class="wave">${'<i></i>'.repeat(18)}</span>`));
      L.appendChild(el('<div class="q">Ini surat apa?</div>'));
      Rt.classList.add('names');
      q.opts.forEach((o, k) => {
        const b = el(`<button class="mj-name c${k}">${esc(o.t)}</button>`);
        b.addEventListener('click', (e) => { e.stopPropagation(); answer(S, o.ok, b); });
        Rt.appendChild(b);
      });
      recite(q.s, 1, $('.mj-play', L));
    } else if (q.kind === 'kata') {
      L.appendChild(el('<div class="q">Lengkapi ayatnya!</div>'));
      L.appendChild(el(`<div class="latin big">${esc(q.head)} <span class="blank">?</span></div>`));
      L.appendChild(el(`<div class="sub">Surat ${esc(name(q.s))} · ayat ${q.a}</div>`));
      L.appendChild(playBtn(q.s, q.a, '<span class="lbl">Dengarkan</span>'));
      Rt.classList.add('names');
      q.opts.forEach((o, k) => {
        const b = el(`<button class="mj-name c${k} it">${esc(o.t)}</button>`);
        b.addEventListener('click', (e) => { e.stopPropagation(); answer(S, o.ok, b); });
        Rt.appendChild(b);
      });
    } else if (q.kind === 'susun') {
      const A = ayat(q.s);
      let next = 0;
      L.appendChild(el(`<div class="q">Susun ayat ${esc(name(q.s))} untuk pentas!</div>`));
      const slots = el(`<div class="slots ${A.length > 5 ? 'tight' : ''}">${A.map((_, k) => `<div class="slot"><em>${k + 1}</em><span></span></div>`).join('')}</div>`);
      L.appendChild(slots);
      Rt.appendChild(el('<div class="q">Ketuk ayat sesuai urutannya:</div>'));
      const cards = el('<div class="cards"></div>');
      shuffle(A.map((t, k) => ({ t, k }))).forEach((c) => {
        const b = el(`<button class="card2">${esc(c.t)}</button>`);
        b.addEventListener('click', (e) => {
          e.stopPropagation();
          if (b.disabled) return;
          if (c.k === next || A[next] === c.t) {
            const slot = slots.children[next];
            slot.classList.add('ok');
            $('span', slot).textContent = c.t;
            b.disabled = true;
            b.classList.add('used');
            G.sfx.step();
            recite(q.s, next + 1);
            next++;
            if (next === A.length) answer(S, true, null);
          } else {
            S.mistakes++;
            G.sfx.wrong();
            b.classList.remove('shake'); void b.offsetWidth; b.classList.add('shake');
          }
        });
        cards.appendChild(b);
      });
      Rt.appendChild(cards);
    }
  }

  function answer(S, ok, btn) {
    if (S.locked) return;
    if (ok) {
      S.locked = true;
      if (btn) btn.classList.add('right');
      G.sfx.correct();
      praise();
      if (S.cfg.stage) { S.scene.cheer = 1.4; G.fx.confetti(30); }
      else G.fx.hearts(G.view.W * 0.7, G.view.H * 0.3, 3);
      setTimeout(() => {
        S.locked = false;
        if (current !== S) return;
        stopRecite();
        S.qi++;
        if (S.qi < S.total) ask(S);
        else finish(S);
      }, S.q.kind === 'susun' ? 2600 : 1500);
    } else {
      S.locked = true;
      S.mistakes++;
      if (btn) btn.classList.add('wrong');
      S.box.querySelectorAll('.mj-right button').forEach((b) => (b.disabled = true));
      G.sfx.wrong();
      const L = $('.mj-left', S.box);
      L.prepend(el(`<div class="mj-try">${pick(G.TRY)} Ini soal baru!</div>`));
      setTimeout(() => {
        S.locked = false;
        stopRecite();
        ask(S, true);
      }, 1800);
    }
  }

  function finish(S) {
    const stars = S.mistakes <= 1 ? 3 : S.mistakes <= 3 ? 2 : 1;
    G.jingle();
    G.fx.confetti(60);
    const L = $('.mj-left', S.box), Rt = $('.mj-right', S.box);
    L.innerHTML = `<div class="q big">${S.cfg.stage ? 'Pentas selesai!' : 'Murajaah selesai!'}</div><div class="stars big">${'<span class="on">★</span>'.repeat(stars)}${'<span>★</span>'.repeat(3 - stars)}</div>`;
    Rt.innerHTML = '<button class="btn big green go">Lanjut ▶</button>';
    Rt.className = 'mj-right center';
    $('.go', Rt).addEventListener('click', (e) => { e.stopPropagation(); G.sfx.tap(); end(S, true, stars); });
  }

  function end(S, done, stars) {
    if (current !== S) return;
    current = null;
    stopRecite();
    G.wipe(() => {
      G.fx.clear();
      S.cfg.onDone({ done, stars: stars || 0, mistakes: S.mistakes });
    });
  }

  G.murajaah = {
    current: () => current && current.q, // untuk pengujian
    halaqah(opt, onDone) {
      const list = opt.surahs;
      const plan = [() => sambung(list), () => tebak(list), () => sambung(list), () => tebak(list), () => sambung(list)].slice(0, opt.count || 5);
      startSession({ friend: opt.friend, title: `Murajaah bersama ${G.CHARS[opt.friend].name} 📖`, plan, onDone });
    },
    stage(opt, onDone) {
      const all = Object.keys(Q()).map(Number);
      const short = all.filter((s) => ayat(s).length >= 3 && ayat(s).length <= 5);
      const plan = [() => susun(1), () => kata(all), () => kata(all), () => susun(pick(short)), () => kata(all)];
      startSession({ stage: true, plan, onDone });
    },
  };
})();
