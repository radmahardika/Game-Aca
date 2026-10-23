// Dunia pixel: latar Desa Ceria, bangunan, partikel, dan adegan tiap misi.
(function () {
  const G = (window.G = window.G || {});
  const V = () => G.view;
  const R = Math.round;

  function px(ctx, x, y, w, h, c) {
    ctx.fillStyle = c;
    ctx.fillRect(R(x), R(y), R(w), R(h));
  }
  function disc(ctx, cx, cy, r, c) {
    ctx.fillStyle = c;
    for (let y = -r; y <= r; y++) {
      const hw = Math.floor(Math.sqrt(r * r - y * y));
      ctx.fillRect(R(cx - hw), R(cy + y), hw * 2 + 1, 1);
    }
  }
  const hash = (n) => {
    const s = Math.sin(n * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };

  // ---------- Partikel ----------
  const parts = [];
  G.fx = {
    add(p) { parts.push(Object.assign({ life: 1, age: 0, g: 0, size: 1, vx: 0, vy: 0 }, p)); },
    burst(x, y, n, colors, spd = 40, g = 60, size = 1) {
      for (let i = 0; i < n; i++) {
        const a = Math.random() * Math.PI * 2;
        const s = spd * (0.4 + Math.random() * 0.8);
        this.add({ x, y, vx: Math.cos(a) * s, vy: Math.sin(a) * s - spd * 0.4, g, life: 0.6 + Math.random() * 0.6, color: colors[i % colors.length], size });
      }
    },
    smoke(x, y, n = 4) {
      for (let i = 0; i < n; i++)
        this.add({ x: x + (Math.random() - 0.5) * 8, y, vx: (Math.random() - 0.5) * 6, vy: -12 - Math.random() * 10, life: 1.2 + Math.random(), smoke: true, r: 2 + Math.random() * 3 });
    },
    confetti(n = 60) {
      const { W } = V();
      const cols = ['#ff5a5a', '#f4c430', '#3fa34d', '#3b7dd8', '#8a4fd8', '#ff8ad8'];
      for (let i = 0; i < n; i++)
        this.add({ x: Math.random() * W, y: -5 - Math.random() * 40, vx: (Math.random() - 0.5) * 20, vy: 20 + Math.random() * 30, g: 10, life: 3 + Math.random() * 2, color: cols[i % cols.length], size: 2, spin: Math.random() * 6 });
    },
    hearts(x, y, n = 4) {
      for (let i = 0; i < n; i++) this.add({ x: x + (Math.random() - 0.5) * 14, y, vy: -14 - Math.random() * 8, vx: (Math.random() - 0.5) * 6, life: 1.6, heart: true });
    },
    // Semprotan air berbentuk lengkung dari (x0,y0) ke (x1,y1)
    stream(x0, y0, x1, y1, T = 0.55) {
      const g = 160;
      const vx = (x1 - x0) / T;
      const vy = (y1 - y0) / T - 0.5 * g * T;
      this.add({ x: x0, y: y0, vx: vx * (0.95 + Math.random() * 0.1), vy: vy * (0.95 + Math.random() * 0.1), g, life: T, color: Math.random() < 0.3 ? '#d4f1ff' : '#4fb3ff', size: 2, splash: true });
    },
    clear() { parts.length = 0; },
    update(dt) {
      for (let i = parts.length - 1; i >= 0; i--) {
        const p = parts[i];
        p.age += dt;
        p.vy += p.g * dt;
        p.x += p.vx * dt;
        p.y += p.vy * dt;
        if (p.age >= p.life) {
          if (p.splash && Math.random() < 0.35) this.burst(p.x, p.y, 2, ['#9fdcff', '#4fb3ff'], 20, 80, 1);
          parts.splice(i, 1);
        }
      }
    },
    draw(ctx) {
      for (const p of parts) {
        const k = 1 - p.age / p.life;
        if (p.smoke) {
          ctx.globalAlpha = Math.max(0, k * 0.7);
          disc(ctx, p.x, p.y, R(p.r + p.age * 3), '#9a9a9a');
          ctx.globalAlpha = 1;
        } else if (p.heart) {
          ctx.globalAlpha = Math.min(1, k * 2);
          const x = R(p.x), y = R(p.y);
          px(ctx, x - 2, y, 2, 1, '#ff4d6d'); px(ctx, x + 1, y, 2, 1, '#ff4d6d');
          px(ctx, x - 3, y + 1, 7, 2, '#ff4d6d'); px(ctx, x - 2, y + 3, 5, 1, '#ff4d6d'); px(ctx, x - 1, y + 4, 3, 1, '#ff4d6d'); px(ctx, x, y + 5, 1, 1, '#ff4d6d');
          px(ctx, x - 2, y + 1, 1, 1, '#ffc2cf');
          ctx.globalAlpha = 1;
        } else {
          const s = p.size;
          const w = p.spin ? (Math.sin(p.age * p.spin) > 0 ? s : 1) : s;
          px(ctx, p.x, p.y, w, s, p.color);
        }
      }
    },
  };

  // ---------- Latar ----------
  function sky(ctx, W, H, top) {
    const bands = ['#5fb8f5', '#76c6f8', '#8fd3fa', '#aadffb', '#c6ebfc'];
    const bh = Math.ceil(top / bands.length);
    bands.forEach((c, i) => px(ctx, 0, i * bh, W, bh + 1, c));
  }
  function cloud(ctx, x, y, s) {
    disc(ctx, x, y, 5 * s, '#ffffff');
    disc(ctx, x + 7 * s, y - 2 * s, 6 * s, '#ffffff');
    disc(ctx, x + 14 * s, y, 5 * s, '#ffffff');
    px(ctx, x - 5 * s, y + 1 * s, 24 * s, 4 * s, '#ffffff');
    px(ctx, x - 4 * s, y + 4 * s, 22 * s, 1, '#dbeefa');
  }
  function sun(ctx, x, y, t) {
    disc(ctx, x, y, 10, '#ffe98a');
    disc(ctx, x, y, 8, '#ffd23f');
    const k = Math.floor(t * 2) % 2;
    for (let i = 0; i < 8; i++) {
      const a = (i / 8) * Math.PI * 2 + k * 0.2;
      px(ctx, x + Math.cos(a) * 14, y + Math.sin(a) * 14, 2, 2, '#ffd23f');
    }
  }
  function hills(ctx, W, base, t) {
    for (let x = 0; x < W; x++) {
      const h1 = 14 + 7 * Math.sin(x * 0.045 + 1) + 4 * Math.sin(x * 0.11);
      px(ctx, x, base - h1, 1, h1, '#8fd18a');
      const h2 = 7 + 4 * Math.sin(x * 0.07 + 3) + 2 * Math.sin(x * 0.19);
      px(ctx, x, base - h2, 1, h2, '#6cbf64');
    }
  }
  function ground(ctx, W, H, gy) {
    px(ctx, 0, gy, W, H - gy, '#7ccc5c');
    px(ctx, 0, gy, W, 2, '#5aa83e');
    for (let i = 0; i < W / 6; i++) {
      const x = R(hash(i) * W), y = gy + 3 + R(hash(i + 50) * (H - gy - 6));
      px(ctx, x, y, 1, 2, '#62b347');
      px(ctx, x + 2, y + 1, 1, 1, '#62b347');
    }
    for (let i = 0; i < W / 25; i++) {
      const x = R(hash(i + 9) * W), y = gy + 4 + R(hash(i + 77) * 14);
      const c = ['#ffffff', '#ffd23f', '#ff8ad8'][i % 3];
      px(ctx, x, y, 1, 1, c);
      px(ctx, x - 1, y + 1, 3, 1, c);
      px(ctx, x, y + 2, 1, 1, c);
      px(ctx, x, y + 1, 1, 1, '#f4a020');
    }
  }
  G.backdrop = function (ctx, t) {
    const { W, H, GY } = V();
    sky(ctx, W, H, GY);
    sun(ctx, W - 22, 20, t);
    for (let i = 0; i < 3; i++) {
      const x = ((i * 97 + t * (3 + i)) % (W + 60)) - 40;
      cloud(ctx, R(x), 14 + i * 9, 1);
    }
    hills(ctx, W, GY, t);
    ground(ctx, W, H, GY);
  };

  // ---------- Bangunan & benda ----------
  function house(ctx, x, gy, w, h, wall, roof) {
    px(ctx, x, gy - h, w, h, wall);
    px(ctx, x, gy - h, w, 1, '#00000022');
    for (let i = 0; i < Math.ceil(w / 2) + 3; i++) {
      const rw = w + 6 - i * 2;
      if (rw <= 0) break;
      px(ctx, x - 3 + i, gy - h - 1 - i, rw, 1, i === 0 ? '#2b1d1a' : roof);
    }
    px(ctx, x + w / 2 - 3, gy - 11, 6, 11, '#8a5a2b');
    px(ctx, x + w / 2 + 1, gy - 6, 1, 1, '#f4c430');
    px(ctx, x + 3, gy - h + 4, 7, 6, '#2b1d1a');
    px(ctx, x + 4, gy - h + 5, 5, 4, '#bfe8ff');
    px(ctx, x + 6, gy - h + 5, 1, 4, '#2b1d1a');
    if (w > 26) {
      px(ctx, x + w - 10, gy - h + 4, 7, 6, '#2b1d1a');
      px(ctx, x + w - 9, gy - h + 5, 5, 4, '#bfe8ff');
      px(ctx, x + w - 7, gy - h + 5, 1, 4, '#2b1d1a');
    }
  }
  G.house = house;

  function tree(ctx, x, gy, th, r) {
    px(ctx, x - 3, gy - th, 7, th, '#8a5a2b');
    px(ctx, x - 3, gy - th, 2, th, '#6e4520');
    px(ctx, x - 5, gy - 2, 11, 2, '#6e4520');
    const cy = gy - th - r * 0.4;
    disc(ctx, x, cy, r + 1, '#2f6b2a');
    disc(ctx, x - r * 0.55, cy + r * 0.3, r * 0.7, '#3f8f38');
    disc(ctx, x + r * 0.55, cy + r * 0.3, r * 0.7, '#3f8f38');
    disc(ctx, x, cy - r * 0.2, r * 0.8, '#4fa846');
    disc(ctx, x - r * 0.3, cy - r * 0.45, r * 0.35, '#6cc45f');
    return cy;
  }
  G.tree = tree;

  function ladder(ctx, x, gy, h) {
    if (h <= 0) return;
    px(ctx, x, gy - h, 2, h, '#a0652d');
    px(ctx, x + 9, gy - h, 2, h, '#a0652d');
    for (let y = gy - 3; y > gy - h; y -= 5) px(ctx, x, y, 11, 2, '#c98a45');
  }

  function leafPile(ctx, cx, gy) {
    const cols = ['#a0522d', '#c96f14', '#e0a81e', '#8a5a2b'];
    for (let i = 0; i < 70; i++) {
      const a = hash(i) * Math.PI;
      const rr = hash(i + 3) * 1;
      const x = cx + Math.cos(a) * 18 * rr;
      const y = gy - Math.sin(a) * 9 * rr;
      px(ctx, x, y - 1, 3, 2, cols[i % 4]);
    }
  }

  function bakery(ctx, x, gy) {
    const w = 54, h = 34;
    house(ctx, x, gy, w, h, '#f7e2c0', '#c0503a');
    for (let i = 0; i < w; i += 6) {
      px(ctx, x + i, gy - h + 12, 3, 4, '#e8451c');
      px(ctx, x + i + 3, gy - h + 12, 3, 4, '#ffffff');
    }
    px(ctx, x + w / 2 - 9, gy - h - 9, 18, 8, '#8a5a2b');
    ctx.drawImage(G.spr.bread, R(x + w / 2 - 6), R(gy - h - 8));
  }

  function hall(ctx, x, gy) {
    const w = 64, h = 34;
    px(ctx, x, gy - h, w, h, '#f2e6c9');
    for (let i = 0; i < 4; i++) px(ctx, x + 4 + i * 18, gy - h, 4, h, '#c98a45');
    for (let i = 0; i < 12; i++) {
      const rw = w + 14 - i * 6;
      if (rw <= 4) break;
      px(ctx, x - 7 + i * 3, gy - h - 1 - i * 2, rw, 2, i === 0 ? '#5a2f1a' : '#8a3d22');
    }
    px(ctx, x + w / 2 - 6, gy - 14, 12, 14, '#8a5a2b');
    px(ctx, x + w + 8, gy - 60, 1, 60, '#cccccc');
    const wave = Math.floor(G.time * 4) % 2;
    px(ctx, x + w + 9, gy - 60 + wave, 12, 4, '#e8241c');
    px(ctx, x + w + 9, gy - 56 + wave, 12, 4, '#ffffff');
  }

  function truck(ctx, x, gy, fill, t, lights) {
    const w = 60;
    px(ctx, x, gy - 22, w, 16, '#d63c2f');
    px(ctx, x, gy - 8, w, 2, '#9e2a22');
    px(ctx, x + 44, gy - 32, 16, 12, '#d63c2f');
    px(ctx, x + 47, gy - 30, 10, 6, '#bfe8ff');
    px(ctx, x + 2, gy - 17, 40, 2, '#f4c430');
    // tangki air
    px(ctx, x + 4, gy - 40, 36, 18, '#2b1d1a');
    px(ctx, x + 5, gy - 39, 34, 16, '#dfe7ee');
    const fh = R(16 * fill);
    px(ctx, x + 5, gy - 23 - fh, 34, fh, '#4fb3ff');
    if (fh > 1) px(ctx, x + 5, gy - 23 - fh, 34, 1, '#bfe8ff');
    for (let i = 1; i < 5; i++) px(ctx, x + 38, gy - 39 + i * 3.2, 1, 1, '#2b1d1a');
    // lampu sirine
    const blink = lights && Math.floor(t * 6) % 2;
    px(ctx, x + 48, gy - 35, 4, 3, blink ? '#3b7dd8' : '#1d4f99');
    px(ctx, x + 53, gy - 35, 4, 3, blink ? '#ff4d4d' : '#992222');
    for (const wx of [x + 10, x + 48]) {
      disc(ctx, wx, gy - 5, 5, '#2b2b2b');
      disc(ctx, wx, gy - 5, 2, '#bbbbbb');
    }
  }

  // ---------- Aktor ----------
  function drawSprite(ctx, img, x, by, flip) {
    const w = img.width, h = img.height;
    if (flip) {
      ctx.save();
      ctx.translate(R(x + w / 2), R(by - h));
      ctx.scale(-1, 1);
      ctx.drawImage(img, 0, 0);
      ctx.restore();
    } else ctx.drawImage(img, R(x - w / 2), R(by - h));
  }
  G.drawSprite = drawSprite;

  function makeActors() {
    return {
      aksa: { x: 0, jump: 0, spray: 0, target: null },
      ara: { x: 0, jump: 0 },
      draw(ctx, t, gy) {
        const bounce = (j) => (j > 0 ? -Math.sin((1 - j) * Math.PI) * 8 : 0);
        const aY = gy + bounce(this.ara.jump) + (Math.sin(t * 5) > 0.6 ? -1 : 0);
        drawSprite(ctx, G.spr.araWith(G.save.equip), this.ara.x, aY);
        const kY = gy + bounce(this.aksa.jump) + (Math.sin(t * 3) > 0 ? 0 : -1);
        drawSprite(ctx, G.spr.aksa, this.aksa.x, kY);
        if (this.aksa.spray > 0) {
          const nx = R(this.aksa.x + 8), ny = R(kY - 9);
          px(ctx, nx - 2, ny, 7, 3, '#4a4a4a');
          px(ctx, nx + 5, ny - 1, 3, 5, '#f4c430');
          const tg = this.aksa.target;
          if (tg) for (let i = 0; i < 3; i++) G.fx.stream(nx + 8, ny + 1, tg.x + (Math.random() - 0.5) * 8, tg.y + (Math.random() - 0.5) * 6);
        }
      },
      update(dt) {
        for (const a of [this.aksa, this.ara]) a.jump = Math.max(0, a.jump - dt * 2);
        this.aksa.spray = Math.max(0, this.aksa.spray - dt);
      },
      cheer() { this.aksa.jump = 1; setTimeout(() => (this.ara.jump = 1), 150); },
    };
  }

  // ---------- Adegan misi ----------
  // Setiap adegan: draw(ctx,t,dt), correct(i,n), wrong(), finish(cb), target() → titik tembak air
  function baseScene(extra) {
    const s = Object.assign({ actors: makeActors(), t0: 0, shake: 0 }, extra);
    return s;
  }

  G.scenes = {
    tree() {
      const s = baseScene({ ladderH: 0, ladderTarget: 0, cat: null, done: false });
      const layout = () => {
        const { W, GY } = V();
        s.tx = R(W * 0.72);
        s.actors.ara.x = R(W * 0.28);
        s.actors.aksa.x = R(W * 0.4);
        s.ani = R(W * 0.12);
        s.branchY = GY - 46;
        s.lx = s.tx - 24;
        if (!s.cat) s.cat = { x: s.tx - 15, y: s.branchY };
      };
      s.draw = function (ctx, t, dt) {
        layout();
        const { GY } = V();
        G.backdrop(ctx, t);
        tree(ctx, s.tx, GY, 46, 22);
        px(ctx, s.tx - 18, s.branchY, 16, 3, '#8a5a2b');
        s.ladderH += (s.ladderTarget - s.ladderH) * Math.min(1, dt * 6);
        ladder(ctx, s.lx, GY, s.ladderH);
        const catBob = s.done ? 0 : Math.sin(t * 8) > 0.5 ? -1 : 0;
        drawSprite(ctx, G.spr.cat, s.cat.x, s.cat.y + catBob, s.cat.flip);
        drawSprite(ctx, G.spr.ani, s.ani, GY);
        s.actors.update(dt);
        s.actors.draw(ctx, t, GY);
      };
      s.correct = (i, n) => {
        s.ladderTarget = (46 * (i + 1)) / n;
        G.sfx.step();
        s.actors.cheer();
        G.fx.burst(s.lx + 5, V().GY - s.ladderTarget, 8, ['#ffd23f', '#ffffff'], 30, 40);
      };
      s.wrong = () => { G.sfx.meow(); };
      s.finish = (cb) => {
        s.done = true;
        G.sfx.meow();
        const { GY } = V();
        const steps = [
          [s.lx + 5, s.branchY], [s.lx + 5, GY - 20], [s.lx + 5, GY], [s.ani + 12, GY],
        ];
        let k = 0;
        const go = () => {
          if (k >= steps.length) {
            G.fx.hearts(s.ani, GY - 26, 6);
            s.cat.flip = true;
            setTimeout(cb, 1300);
            return;
          }
          const [x, y] = steps[k++];
          const sx = s.cat.x, sy = s.cat.y, t0 = performance.now();
          const anim = () => {
            const p = Math.min(1, (performance.now() - t0) / 550);
            s.cat.x = sx + (x - sx) * p;
            s.cat.y = sy + (y - sy) * p;
            if (p < 1) requestAnimationFrame(anim); else go();
          };
          s.cat.flip = x < sx;
          anim();
        };
        go();
      };
      return s;
    },

    leaves() {
      const s = baseScene({ hp: 5, max: 5, mood: 'happy', moodT: 0, gone: 0 });
      s.draw = function (ctx, t, dt) {
        const { W, GY } = V();
        s.fx = R(W * 0.72);
        s.actors.ara.x = R(W * 0.22);
        s.actors.aksa.x = R(W * 0.36);
        G.backdrop(ctx, t);
        house(ctx, R(W * 0.48), GY - 4, 30, 22, '#ffe6a8', '#3b7dd8');
        leafPile(ctx, s.fx, GY);
        s.moodT -= dt;
        const mood = s.moodT > 0 ? s.mood : 'happy';
        const k = s.hp / s.max;
        const hop = mood === 'laugh' ? -Math.abs(Math.sin(t * 14)) * 3 : 0;
        if (s.gone < 1) {
          ctx.globalAlpha = 1 - s.gone;
          G.drawFire(ctx, s.fx, GY - 6 + hop - s.gone * 40, 12 + 10 * k, 16 + 12 * k, t, { mood });
          ctx.globalAlpha = 1;
          hpBar(ctx, s.fx, GY - 40, s.hp, s.max);
        }
        s.actors.aksa.target = { x: s.fx, y: GY - 14 };
        s.actors.update(dt);
        s.actors.draw(ctx, t, GY);
      };
      s.correct = () => {
        s.hp--;
        sprayHit(s, () => { s.mood = 'hurt'; s.moodT = 0.8; G.fx.smoke(s.fx, V().GY - 20, 5); });
      };
      s.wrong = () => { s.mood = 'laugh'; s.moodT = 1.2; G.sfx.laugh(); G.floatText('Hihihi!', s.fx, V().GY - 44, '#e8451c'); };
      s.finish = (cb) => {
        s.mood = 'sad'; s.moodT = 99;
        const t0 = performance.now();
        const anim = () => {
          s.gone = Math.min(1, (performance.now() - t0) / 1400);
          if (Math.random() < 0.3) G.fx.smoke(s.fx, V().GY - 10 - s.gone * 40, 1);
          if (s.gone < 1) requestAnimationFrame(anim); else setTimeout(cb, 500);
        };
        setTimeout(anim, 500);
      };
      return s;
    },

    bakery() {
      const s = baseScene({ flames: 10 });
      const spots = [[6, 30], [16, 34], [44, 30], [30, 36], [10, 16], [50, 18], [26, 22], [38, 14], [20, 10], [46, 40]];
      s.draw = function (ctx, t, dt) {
        const { W, GY } = V();
        s.bx = R(W * 0.6);
        s.actors.ara.x = R(W * 0.26);
        s.actors.aksa.x = R(W * 0.38);
        G.backdrop(ctx, t);
        bakery(ctx, s.bx, GY);
        for (let i = 0; i < s.flames; i++) {
          const [ox, oy] = spots[i];
          G.drawFire(ctx, s.bx + ox, GY - oy + 8, 7, 10, t + i, { noFace: true, seed: i });
        }
        if (s.flames > 0 && Math.random() < 0.08) G.fx.smoke(s.bx + 27, GY - 52, 1);
        const panic = s.flames > 0 ? (Math.sin(t * 12) > 0 ? -2 : 0) : 0;
        drawSprite(ctx, G.spr.budi, R(W * 0.12), GY + panic);
        s.actors.aksa.target = { x: s.bx + 27, y: GY - 26 };
        s.actors.update(dt);
        s.actors.draw(ctx, t, GY);
      };
      s.correct = (i, n) => {
        sprayHit(s, () => {
          const target = Math.round(10 * (1 - (i + 1) / n));
          while (s.flames > target) {
            s.flames--;
            const [ox, oy] = spots[s.flames];
            G.fx.smoke(s.bx + ox, V().GY - oy, 3);
          }
        });
      };
      s.wrong = () => { G.floatText('Panas!', s.bx + 27, V().GY - 56, '#e8451c'); };
      s.finish = (cb) => {
        const { W, GY } = V();
        setTimeout(() => {
          G.fx.hearts(R(W * 0.12), GY - 28, 5);
          for (let i = 0; i < 5; i++) G.fx.add({ x: s.bx + 27, y: GY - 40, vx: (Math.random() - 0.5) * 50, vy: -50, g: 90, life: 1.4, color: '#d98a2b', size: 3 });
          setTimeout(cb, 1500);
        }, 600);
      };
      return s;
    },

    truck() {
      const s = baseScene({ fill: 0, fillT: 0, lights: false });
      s.draw = function (ctx, t, dt) {
        const { W, GY } = V();
        s.tx = R(W * 0.55);
        s.actors.ara.x = R(W * 0.2);
        s.actors.aksa.x = R(W * 0.34);
        G.backdrop(ctx, t);
        house(ctx, R(W * 0.08), GY - 3, 30, 24, '#e8e8e8', '#d63c2f');
        s.fill += (s.fillT - s.fill) * Math.min(1, dt * 3);
        truck(ctx, s.tx, GY, s.fill, t, s.lights);
        drawSprite(ctx, G.spr.joko, s.tx + 72, GY);
        drawSprite(ctx, G.spr.bucket, s.actors.aksa.x - 12, GY);
        s.actors.aksa.target = { x: s.tx + 22, y: GY - 42 };
        s.actors.update(dt);
        s.actors.draw(ctx, t, GY);
      };
      s.correct = (i, n) => { sprayHit(s, () => { s.fillT = (i + 1) / n; G.sfx.splash(); }); };
      s.wrong = () => { G.floatText('Byur!', s.tx + 22, V().GY - 48, '#2f7fd1'); G.sfx.splash(); };
      s.finish = (cb) => {
        s.lights = true;
        G.sfx.siren();
        setTimeout(() => { G.fx.hearts(s.tx + 72, V().GY - 30, 4); }, 600);
        setTimeout(cb, 1800);
      };
      return s;
    },

    boss() {
      const s = baseScene({ hp: 7, max: 7, mood: 'laugh', moodT: 0, shrink: 0 });
      s.draw = function (ctx, t, dt) {
        const { W, GY } = V();
        s.hx = R(W * 0.62);
        s.fx = R(W * 0.7);
        s.actors.ara.x = R(W * 0.22);
        s.actors.aksa.x = R(W * 0.35);
        G.backdrop(ctx, t);
        hall(ctx, s.hx, GY);
        drawSprite(ctx, G.spr.kades, R(W * 0.08), GY);
        s.moodT -= dt;
        const mood = s.moodT > 0 ? s.mood : 'happy';
        const k = (s.hp / s.max) * (1 - s.shrink) + 0.25 * s.shrink;
        const shake = s.shake > 0 ? (Math.random() - 0.5) * 3 : 0;
        s.shake -= dt;
        const hop = mood === 'laugh' ? -Math.abs(Math.sin(t * 10)) * 4 : 0;
        G.drawFire(ctx, s.fx + shake, GY + hop, 16 + 22 * k, 22 + 28 * k, t, { mood, crown: true, angry: mood === 'happy' && s.hp > 0 });
        if (s.hp > 0) hpBar(ctx, s.fx, GY - 64, s.hp, s.max);
        s.actors.aksa.target = { x: s.fx, y: GY - 20 };
        s.actors.update(dt);
        s.actors.draw(ctx, t, GY);
      };
      s.correct = () => {
        s.hp--;
        sprayHit(s, () => { s.mood = 'hurt'; s.moodT = 0.8; s.shake = 0.5; G.fx.smoke(s.fx, V().GY - 40, 6); });
      };
      s.wrong = () => { s.mood = 'laugh'; s.moodT = 1.4; G.sfx.laugh(); G.floatText('HOHOHO!', s.fx, V().GY - 66, '#e8451c'); };
      s.finish = (cb) => {
        s.mood = 'sad'; s.moodT = 99;
        const t0 = performance.now();
        const anim = () => {
          s.shrink = Math.min(1, (performance.now() - t0) / 1200);
          if (Math.random() < 0.4) G.fx.smoke(s.fx, V().GY - 30, 1);
          if (s.shrink < 1) requestAnimationFrame(anim); else setTimeout(cb, 600);
        };
        setTimeout(anim, 400);
      };
      return s;
    },
  };

  function hpBar(ctx, cx, y, hp, max) {
    const w = max * 5 + 1;
    const x = R(cx - w / 2);
    px(ctx, x - 1, y - 1, w + 2, 6, '#2b1d1a');
    for (let i = 0; i < max; i++) px(ctx, x + 1 + i * 5, y + 1, 4, 3, i < hp ? '#ff8c1a' : '#5a5a5a');
  }

  // Aksa menyemprot air, lalu efek kena setelah air sampai.
  function sprayHit(s, onHit) {
    s.actors.aksa.spray = 0.7;
    G.sfx.spray();
    setTimeout(() => {
      if (G.scene !== s) return;
      onHit();
      s.actors.cheer();
    }, 650);
  }

  // ---------- Peta Desa Ceria ----------
  G.MAP_NODES = [[0.12, 0.6], [0.31, 0.47], [0.5, 0.64], [0.69, 0.48], [0.87, 0.62]];
  G.scenes.map = function () {
    const actors = makeActors();
    return {
      actors,
      draw(ctx, t, dt) {
        const { W, H } = V();
        const gy = R(H * 0.36);
        sky(ctx, W, H, gy);
        sun(ctx, W - 22, 18, t);
        for (let i = 0; i < 3; i++) cloud(ctx, R(((i * 97 + t * (3 + i)) % (W + 60)) - 40), 10 + i * 7, 1);
        hills(ctx, W, gy, t);
        ground(ctx, W, H, gy);
        house(ctx, R(W * 0.2), gy + 6, 22, 16, '#ffe6a8', '#d63c2f');
        tree(ctx, R(W * 0.06), gy + 8, 12, 9);
        house(ctx, R(W * 0.42), gy + 4, 26, 18, '#cfe8ff', '#3fa34d');
        tree(ctx, R(W * 0.6), gy + 6, 10, 8);
        house(ctx, R(W * 0.76), gy + 6, 22, 16, '#f7d6e6', '#8a4fd8');
        tree(ctx, R(W * 0.95), gy + 8, 12, 9);
        // jalan setapak
        const pts = G.MAP_NODES.map(([fx, fy]) => [fx * W, fy * H]);
        for (const [col, r] of [['#c49a5a', 5], ['#e8c98a', 4]]) {
          for (let i = 0; i < pts.length - 1; i++) {
            const [x0, y0] = pts[i], [x1, y1] = pts[i + 1];
            const n = Math.ceil(Math.hypot(x1 - x0, y1 - y0));
            for (let k = 0; k <= n; k++) {
              const p = k / n;
              const sx = x0 + (x1 - x0) * p;
              const sy = y0 + (y1 - y0) * p + Math.sin(p * Math.PI) * 6;
              disc(ctx, sx, sy, r, col);
            }
          }
        }
        const next = G.nextMission();
        const [nx, ny] = pts[Math.min(next, pts.length - 1)];
        actors.aksa.x = R(nx + 9);
        actors.ara.x = R(nx - 10);
        actors.update(dt);
        actors.draw(ctx, t, R(ny + 30));
      },
    };
  };

  G.scenes.title = function () {
    const actors = makeActors();
    return {
      draw(ctx, t, dt) {
        const { W, GY } = V();
        G.backdrop(ctx, t);
        house(ctx, R(W * 0.08), GY - 2, 30, 22, '#ffe6a8', '#d63c2f');
        tree(ctx, R(W * 0.85), GY, 18, 14);
        G.drawFire(ctx, R(W * 0.68), GY - 2, 14, 18, t, { mood: Math.sin(t) > 0 ? 'laugh' : 'happy' });
        actors.aksa.x = R(W * 0.42);
        actors.ara.x = R(W * 0.3);
        if (Math.floor(t) % 3 === 0 && t % 1 < dt * 1.5) actors.cheer();
        actors.update(dt);
        actors.draw(ctx, t, GY);
      },
    };
  };
})();
