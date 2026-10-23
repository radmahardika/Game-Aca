// Layar battle ala Pokemon: lawan kanan atas, Aksa & Ara dari belakang, menu jawaban 2x2.
(function () {
  const G = (window.G = window.G || {});
  const $ = (s, el = document) => el.querySelector(s);
  const R = Math.round;
  const el = (html) => {
    const t = document.createElement('template');
    t.innerHTML = html.trim();
    return t.content.firstElementChild;
  };

  // ---------- Arena ----------
  function arenaScene(B) {
    const S = {
      hop: 0, spray: 0, shake: 0, mood: 'happy', moodT: 0,
      ladder: 0, ladderT: 0, fill: 0, fillT: 0, gone: 0, cat: null, lights: false,
    };
    const geo = () => {
      const { W, H } = G.view;
      return { W, H, ex: R(W * 0.72), ey: R(H * 0.39), px: R(W * 0.25), py: R(H * 0.63) };
    };
    S.target = () => {
      const g = geo();
      if (B.p.enemy === 'truk') return { x: g.ex - 8, y: g.ey - 30 };
      if (B.p.enemy === 'roti') return { x: g.ex, y: g.ey - 24 };
      if (B.p.enemy === 'hidran') return { x: g.ex, y: g.ey - 10 };
      return { x: g.ex, y: g.ey - 14 };
    };
    S.draw = function (ctx, t, dt) {
      const g = geo();
      const { px } = G.side;
      const hz = R(g.H * 0.3);
      ['#bfe8ff', '#cfeeff', '#dff4ff', '#ecf9ff'].forEach((c, i) => px(ctx, 0, R((i * hz) / 4), g.W, R(hz / 4) + 1, c));
      px(ctx, 0, hz, g.W, g.H - hz, '#a8dc8c');
      for (let i = 0; i < 50; i++) {
        const h = Math.sin(i * 127.1) * 43758.5453 % 1;
        const hx = Math.abs(h), hy = Math.abs(Math.sin(i * 31.7) * 9631.1 % 1);
        px(ctx, R(hx * g.W), hz + 2 + R(hy * (g.H - hz - 4)), 2, 1, '#8fcf72');
      }
      // panggung lonjong
      ellipse(ctx, g.ex, g.ey, 36, 9, '#6cbf64');
      ellipse(ctx, g.ex, g.ey - 1, 33, 7, '#8fd18a');
      ellipse(ctx, g.px, g.py, 42, 10, '#6cbf64');
      ellipse(ctx, g.px, g.py - 1, 39, 8, '#8fd18a');

      // lawan
      S.moodT -= dt;
      const mood = S.moodT > 0 ? S.mood : 'happy';
      const k = B.left / B.total;
      const sh = S.shake > 0 ? (Math.random() - 0.5) * 3 : 0;
      S.shake -= dt;
      const hop = mood === 'laugh' ? -Math.abs(Math.sin(t * 12)) * 3 : 0;
      ctx.globalAlpha = 1 - S.gone;
      if (B.p.enemy === 'api') {
        G.drawFire(ctx, g.ex + sh, g.ey + 2 + hop - S.gone * 30, 14 + 12 * k, 18 + 16 * k, t, { mood });
      } else if (B.p.enemy === 'raja') {
        const kk = k * (1 - S.gone) + 0.25 * S.gone;
        G.drawFire(ctx, g.ex + sh, g.ey + 3 + hop, 16 + 22 * kk, 22 + 30 * kk, t, { mood, crown: true, angry: mood === 'happy' && B.left > 0 });
      }
      ctx.globalAlpha = 1;
      if (B.p.enemy === 'roti') {
        G.side.bakery(ctx, g.ex - 27, g.ey + 3);
        const spots = [[6, 30], [16, 34], [44, 30], [30, 36], [10, 16], [50, 18], [26, 22], [38, 14], [20, 10], [46, 40]];
        const n = Math.ceil(10 * k);
        for (let i = 0; i < n; i++) G.drawFire(ctx, g.ex - 27 + spots[i][0], g.ey + 3 - spots[i][1] + 8, 7, 10, t + i, { noFace: true, seed: i });
        if (n > 0 && Math.random() < dt * 4) G.fx.smoke(g.ex, g.ey - 46, 1);
      } else if (B.p.enemy === 'truk') {
        S.fill += (S.fillT - S.fill) * Math.min(1, dt * 3);
        G.side.truck(ctx, g.ex - 30, g.ey + 4, S.fill, t, S.lights);
      } else if (B.p.enemy === 'ayam') {
        // kandang di kanan, anak ayam berlarian lalu masuk kandang
        const kx = g.ex + 10, kb = g.ey + 2;
        px(ctx, kx, kb - 18, 26, 18, '#2b1d1a');
        px(ctx, kx + 1, kb - 17, 24, 16, '#c98a45');
        px(ctx, kx - 2, kb - 24, 30, 7, '#2b1d1a');
        px(ctx, kx - 1, kb - 23, 28, 5, '#d63c2f');
        px(ctx, kx + 8, kb - 11, 10, 10, '#2b1d1a');
        px(ctx, kx + 9, kb - 10, 8, 9, '#4a3426');
        if (!S.chicks) {
          const n = B.qs[0].b; // jumlah anak ayam di luar = angka di soal
          S.chicks = Array.from({ length: n }, (_, i) => ({ bx: g.ex - 38 + (i % 5) * 11, x: g.ex - 38 + (i % 5) * 11, y: g.ey - 4 + Math.floor(i / 5) * 7 + (i % 2) * 2, i }));
        }
        S.chicks.forEach((c) => {
          if (c.home) return;
          if (S.gather) {
            c.x += (kx + 13 - c.x) * Math.min(1, dt * (2 + c.i * 0.4));
            c.y += (kb - 4 - c.y) * Math.min(1, dt * (2 + c.i * 0.4));
            if (Math.abs(c.x - kx - 13) < 2) c.home = true;
          } else c.x = c.bx + Math.sin(t * 2 + c.i * 1.7) * 2;
          const hopc = Math.sin(t * 10 + c.i) > 0.4 ? -2 : 0;
          G.drawSprite(ctx, G.spr.chick, c.x, c.y + hopc, Math.sin(t + c.i) > 0);
        });
      } else if (B.p.enemy === 'hidran') {
        const hyd = G.spr.hydrant;
        ctx.drawImage(hyd, g.ex - hyd.width, g.ey + 2 - hyd.height * 2, hyd.width * 2, hyd.height * 2);
        if (B.left > 0) for (let i = 0; i < 4; i++) {
          const side = i % 2 ? 1 : -1;
          G.fx.add({ x: g.ex + side * 9, y: g.ey - 12, vx: side * (25 + Math.random() * 25), vy: -40 - Math.random() * 30, g: 140, life: 0.6, color: Math.random() < 0.3 ? '#d4f1ff' : '#4fb3ff', size: 2 });
        }
      } else if (B.p.enemy === 'pohon') {
        G.side.tree(ctx, g.ex + 8, g.ey + 2, 30, 16);
        px(ctx, g.ex - 6, g.ey - 33, 14, 3, '#8a5a2b');
        S.ladder += (S.ladderT - S.ladder) * Math.min(1, dt * 6);
        G.side.ladder(ctx, g.ex - 16, g.ey + 2, S.ladder);
        if (!S.cat) S.cat = { x: g.ex - 2, y: g.ey - 33 };
        const bob = !S.catDone && Math.sin(t * 8) > 0.5 ? -1 : 0;
        G.drawSprite(ctx, G.spr.cat, S.cat.x, S.cat.y + bob, S.cat.flip);
      }

      // Aksa & Ara dari belakang (2x)
      const bounce = S.hop > 0 ? -Math.sin((1 - S.hop) * Math.PI) * 6 : 0;
      S.hop = Math.max(0, S.hop - dt * 2);
      const ara = G.spr.araDir(G.save.equip).back;
      ctx.drawImage(ara, g.px - 34, g.py - ara.height * 2 + 2 + bounce * 0.7, ara.width * 2, ara.height * 2);
      const ak = G.spr.aksaBack;
      const ax = g.px + 2, ay = g.py - ak.height * 2 + 2 + bounce;
      ctx.drawImage(ak, ax, ay, ak.width * 2, ak.height * 2);
      if (S.spray > 0) {
        S.spray -= dt;
        const nx = ax + 28, ny = ay + 26;
        px(ctx, nx - 4, ny, 8, 4, '#4a4a4a');
        px(ctx, nx + 4, ny - 2, 4, 7, '#f4c430');
        const tg = S.target();
        for (let i = 0; i < 3; i++) G.fx.stream(nx + 8, ny, tg.x + (Math.random() - 0.5) * 8, tg.y + (Math.random() - 0.5) * 6, 0.5);
      }
      G.fx.draw(ctx);
    };
    S.ownsFx = true;
    return S;
  }

  function ellipse(ctx, cx, cy, rx, ry, col) {
    ctx.fillStyle = col;
    for (let y = -ry; y <= ry; y++) {
      const hw = Math.floor(rx * Math.sqrt(1 - (y * y) / (ry * ry)));
      ctx.fillRect(R(cx - hw), R(cy + y), hw * 2 + 1, 1);
    }
  }

  // ---------- Transisi ----------
  G.wipe = function (mid) {
    const w = el(`<div class="wipe">${'<i></i>'.repeat(8)}</div>`);
    document.body.appendChild(w);
    requestAnimationFrame(() => w.classList.add('in'));
    setTimeout(() => {
      mid && mid();
      w.classList.add('out');
      setTimeout(() => w.remove(), 600);
    }, 550);
  };

  // ---------- Alur battle ----------
  let current = null;
  G.battle = {
    active: () => !!current,
    start(p, onDone) {
      const ui = $('#ui');
      const B = { p, qs: G.makeQuestions(p.gens), qi: 0, mistakes: 0, onDone };
      B.total = B.qs.length;
      B.left = B.total;
      current = B;
      G.sfx.encounter();
      G.music('battle');
      G.wipe(() => {
        G.fx.clear();
        B.scene = arenaScene(B);
        G.scene = B.scene;
        ui.innerHTML = '';
        const box = el(`<div class="battle">
          <div class="ebox"><div class="nm"><span>${p.enemyName}</span><img src="${G.icons[p.icon]}" alt=""></div>
            <div class="bar">${p.bar.label}<div class="track"><div class="fill"></div></div></div></div>
          <div class="pbox"><div class="nm"><span>Aksa &amp; Ara</span><span>🚒</span></div>
            <div class="qprog">${B.qs.map(() => '<span></span>').join('')}</div></div>
          <button class="btn small grey run">⬅ Nanti</button>
          <div class="bmenu">
            <div class="btext"><div class="say"></div><div class="eq"></div><div class="tapnext">▶</div></div>
            <div class="moves"></div>
          </div>
        </div>`);
        ui.appendChild(box);
        B.box = box;
        setBar(B);
        $('.run', box).addEventListener('click', (e) => {
          e.stopPropagation();
          G.sfx.tap();
          end(B, false);
        });
        say(B, p.start, true);
        moves(B, null);
        const go = () => { box.removeEventListener('click', go); askQ(B); };
        setTimeout(() => box.addEventListener('click', go), 300);
      });
    },
  };

  function setBar(B) {
    const f = $('.fill', B.box);
    const v = B.p.bar.mode === 'drain' ? B.left / B.total : 1 - B.left / B.total;
    f.style.width = Math.max(0, v * 100) + '%';
    f.style.background = B.p.bar.color;
  }
  function say(B, text, tapNext, eq) {
    $('.say', B.box).textContent = text;
    $('.eq', B.box).innerHTML = eq ? eq.replace('?', '<b>?</b>') : '';
    $('.btext', B.box).classList.toggle('waiting', !!tapNext);
    $('.btext', B.box).classList.toggle('hasq', !!eq);
  }
  function moves(B, q) {
    const m = $('.moves', B.box);
    m.innerHTML = '';
    m.classList.toggle('off', !q);
    if (!q) return;
    q.choices.forEach((c) => m.appendChild(el(`<button class="ans" data-v="${c}">${c}</button>`)));
  }

  function askQ(B) {
    if (current !== B) return;
    const q = B.qs[B.qi];
    let locked = false;
    say(B, B.p.prompt(q), false, q.eq);
    moves(B, q);
    const dots = B.box.querySelectorAll('.pbox .qprog span');
    dots.forEach((d, i) => (d.className = i < B.qi ? 'ok' : i === B.qi ? 'now' : ''));
    const m = $('.moves', B.box);
    if (!G.save.tut) $('.say', B.box).textContent = 'Hitung dulu, lalu ketuk jawabanmu!';
    m.querySelectorAll('.ans').forEach((b) => b.addEventListener('click', (e) => {
      e.stopPropagation();
      if (locked || b.disabled) return;
      const v = +b.dataset.v;
      if (v === q.ans) {
        locked = true;
        G.save.tut = true;
        b.classList.add('right');
        m.querySelectorAll('button').forEach((x) => (x.disabled = x !== b));
        G.sfx.correct();
        praise(G.PRAISE[Math.floor(Math.random() * G.PRAISE.length)]);
        hit(B);
        dots[B.qi].className = 'ok';
        setTimeout(() => {
          if (current !== B) return;
          B.qi++;
          if (B.qi < B.total) askQ(B);
          else win(B);
        }, 1600);
      } else {
        B.mistakes++;
        b.classList.add('wrong');
        b.disabled = true;
        G.sfx.wrong();
        taunt(B);
        $('.say', B.box).textContent = G.TRY[Math.floor(Math.random() * G.TRY.length)];
      }
    }));
  }

  function praise(text) {
    const f = el(`<div class="praise">${text}</div>`);
    $('#floats').appendChild(f);
    setTimeout(() => f.remove(), 1300);
  }
  function floatAt(text, lx, ly, color) {
    const { S } = G.view;
    const f = el(`<div class="float" style="left:${lx * S}px;top:${ly * S}px;color:${color}">${text}</div>`);
    $('#floats').appendChild(f);
    setTimeout(() => f.remove(), 1400);
  }

  function hit(B) {
    const S = B.scene;
    const tg = S.target();
    const progress = (B.total - B.left + 1) / B.total;
    if (B.p.enemy === 'ayam' || B.p.enemy === 'hidran') {
      S.hop = 1;
      G.sfx.step();
      if (B.p.enemy === 'ayam') S.gather = true;
      G.fx.burst(tg.x, tg.y - 6, 10, ['#ffd23f', '#ffffff'], 35, 40);
      B.left--;
      setBar(B);
      return;
    }
    if (B.p.enemy === 'pohon') {
      S.hop = 1;
      G.sfx.step();
      S.ladderT = 34 * progress;
      G.fx.burst(tg.x - 12, G.view.H * 0.39 - S.ladderT, 8, ['#ffd23f', '#ffffff'], 30, 40);
      B.left--;
      setBar(B);
      return;
    }
    S.spray = 0.7;
    G.sfx.spray();
    setTimeout(() => {
      if (current !== B) return;
      B.left--;
      setBar(B);
      S.hop = 1;
      if (B.p.enemy === 'truk') { S.fillT = progress; G.sfx.splash(); }
      else { S.mood = 'hurt'; S.moodT = 0.8; S.shake = 0.5; G.fx.smoke(tg.x, tg.y - 6, 5); }
    }, 600);
  }

  function taunt(B) {
    const S = B.scene, tg = S.target();
    const word = { pohon: 'Meong!', truk: 'Byur!', roti: 'Panas!', raja: 'HOHOHO!', ayam: 'Ciap ciap!', hidran: 'Byur!' }[B.p.enemy] || 'Hihihi!';
    if (B.p.enemy === 'api' || B.p.enemy === 'raja') { S.mood = 'laugh'; S.moodT = 1.2; G.sfx.laugh(); }
    else if (B.p.enemy === 'pohon') G.sfx.meow();
    else G.sfx.splash();
    floatAt(word, tg.x, tg.y - 26, ['truk', 'hidran'].includes(B.p.enemy) ? '#2f7fd1' : B.p.enemy === 'ayam' ? '#c97a00' : '#e8451c');
  }

  function win(B) {
    const S = B.scene;
    moves(B, null);
    say(B, B.p.win, false);
    G.jingle();
    const t0 = performance.now();
    if (B.p.enemy === 'pohon') {
      S.catDone = true;
      const { H } = G.view;
      const gy = R(H * 0.39) + 2;
      const lx = S.target().x - 11;
      const path = [[lx, S.cat.y], [lx, gy]];
      let k = 0;
      const step = () => {
        if (k >= path.length) { G.fx.hearts(S.cat.x, gy - 14, 6); return; }
        const [x, y] = path[k++], sx = S.cat.x, sy = S.cat.y, ts = performance.now();
        const a = () => {
          const p = Math.min(1, (performance.now() - ts) / 500);
          S.cat.x = sx + (x - sx) * p; S.cat.y = sy + (y - sy) * p;
          if (p < 1) requestAnimationFrame(a); else step();
        };
        a();
      };
      step();
    } else if (B.p.enemy === 'truk') {
      S.lights = true;
    } else if (B.p.enemy === 'ayam' || B.p.enemy === 'hidran') {
      G.fx.hearts(S.target().x, S.target().y - 10, 5);
    } else if (B.p.enemy !== 'roti') {
      S.mood = 'sad'; S.moodT = 99;
      const a = () => {
        S.gone = Math.min(1, (performance.now() - t0 - 400) / 1300);
        if (S.gone < 0) S.gone = 0;
        if (Math.random() < 0.3) G.fx.smoke(S.target().x, S.target().y - S.gone * 20, 1);
        if (S.gone < 1 && current === B) requestAnimationFrame(a);
      };
      a();
    }
    G.fx.confetti(50);
    setTimeout(() => {
      if (current !== B) return;
      $('.btext', B.box).classList.add('waiting');
      const go = () => { B.box.removeEventListener('click', go); end(B, true); };
      B.box.addEventListener('click', go);
    }, 1800);
  }

  function end(B, won) {
    if (current !== B) return;
    current = null;
    G.wipe(() => {
      G.fx.clear();
      B.onDone({ won, mistakes: B.mistakes });
    });
  }
})();
