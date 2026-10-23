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

  G.side = { px, disc, house, tree, ladder, leafPile, bakery, hall, truck };
  G.scenes = {};

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
