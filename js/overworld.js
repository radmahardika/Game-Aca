// Dunia top-down Desa Ceria: peta petak, jalan 4 arah, Ara mengikuti, ketuk untuk berjalan.
(function () {
  const G = (window.G = window.G || {});
  const T = 16, MW = 32, MH = 22;
  const R = Math.round;
  const STEP = 0.2; // detik per petak
  const DIRS = { up: [0, -1], down: [0, 1], left: [-1, 0], right: [1, 0] };
  const hash = (n) => {
    const s = Math.sin(n * 127.1) * 43758.5453;
    return s - Math.floor(s);
  };

  // ---------- Tata letak peta ----------
  const BUILD = [
    { id: 'hall', x: 12, y: 2, w: 7, h: 4 },
    { id: 'bakery', x: 3, y: 5, w: 5, h: 3 },
    { id: 'station', x: 22, y: 4, w: 5, h: 3 },
    { id: 'houseAni', x: 3, y: 13, w: 4, h: 3 },
    { id: 'house2', x: 27, y: 13, w: 4, h: 3 },
  ];
  const TREES = [[2, 3], [9, 3], [10, 6], [20, 3], [28, 2], [2, 9], [12, 18], [13, 8], [20, 9], [29, 19], [22, 19], [4, 19], [17, 18], [26, 18], [24, 14], [7, 19], [19, 19], [11, 2], [29, 9], [27, 10]];
  const CAT_TREE = [10, 14];
  const SIGN = [14, 12];
  const FLAG = [19, 4];
  const PILE = [25, 16];
  const TRUCK = { x: 26, y: 7, w: 4, h: 2 };
  const BOSS_TILE = [15, 7];
  const COOP = { x: 5, y: 2, w: 2, h: 2 };
  const HYDRANT = [20, 12];
  const NPCS = {
    ani: { x: 9, y: 15 },
    budi: { x: 7, y: 8 },
    joko: { x: 25, y: 8 },
    kades: { x: 16, y: 7 },
    siti: { x: 7, y: 3 },
    udin: { x: 21, y: 12 },
  };

  const ground = [];
  function buildGround() {
    for (let y = 0; y < MH; y++) {
      ground[y] = [];
      for (let x = 0; x < MW; x++) ground[y][x] = x === 0 || y === 0 || x === MW - 1 || y === MH - 1 ? 'T' : '.';
    }
    const path = (x, y) => (ground[y][x] = '=');
    for (let x = 1; x < MW - 1; x++) path(x, 11);
    for (let y = 6; y < MH - 1; y++) path(15, y);
    for (let y = 8; y <= 10; y++) path(5, y);
    for (let y = 7; y <= 10; y++) path(24, y);
    path(5, 16);
    for (let x = 5; x <= 8; x++) path(x, 17);
    for (let y = 12; y <= 17; y++) path(8, y);
    for (let y = 14; y <= 16; y++) for (let x = 18; x <= 21; x++) ground[y][x] = 'w';
    for (let x = 17; x <= 22; x++) if (ground[13][x] === '.') ground[13][x] = '#';
    for (let x = 9; x <= 12; x++) ground[9][x] = '#';
    TREES.forEach(([x, y]) => (ground[y][x] = 'T'));
  }

  // ---------- Status dunia ----------
  const W = {
    aksa: { tx: 15, ty: 12, x: 15 * T, y: 12 * T, dir: 'down', moving: false, t: 0, walk: 0 },
    ara: { tx: 16, ty: 12, x: 16 * T, y: 12 * T, dir: 'down', moving: false, t: 0, walk: 0 },
    path: [],
    pending: null,
    held: null,
    mode: 'busy',
    marker: null,
    cam: { x: 0, y: 0 },
    shake: 0,
  };
  G.world = W;

  const solved = (id) => !!(G.save.solved && G.save.solved[id]);
  W.bossActive = () => G.PROBLEMS.every((p) => solved(p.id)) && !solved('raja');

  function inRect(x, y, r) { return x >= r.x && x < r.x + r.w && y >= r.y && y < r.y + r.h; }
  function blocked(x, y) {
    if (x < 0 || y < 0 || x >= MW || y >= MH) return true;
    const g = ground[y][x];
    if (g === 'T' || g === 'w' || g === '#') return true;
    if (BUILD.some((b) => inRect(x, y, b))) return true;
    if (inRect(x, y, TRUCK) || inRect(x, y, COOP)) return true;
    const at = (p) => p[0] === x && p[1] === y;
    if (at(CAT_TREE) || at(SIGN) || at(FLAG) || at(PILE) || at(HYDRANT)) return true;
    if (Object.values(NPCS).some((n) => n.x === x && n.y === y)) return true;
    if (W.bossActive() && at(BOSS_TILE)) return true;
    return false;
  }

  // Apa yang ada di petak ini (untuk tombol A / ketuk)?
  function thingAt(x, y) {
    const at = (p) => p[0] === x && p[1] === y;
    for (const [id, n] of Object.entries(NPCS)) if (n.x === x && n.y === y) return id;
    if (at(CAT_TREE)) return 'ani';
    if (at(PILE)) return 'api';
    if (inRect(x, y, TRUCK)) return 'joko';
    if (inRect(x, y, COOP)) return 'siti';
    if (at(HYDRANT)) return 'udin';
    if (at(SIGN)) return 'papan';
    if (W.bossActive() && at(BOSS_TILE)) return 'raja';
    const b = BUILD.find((bb) => inRect(x, y, bb));
    if (b && b.id === 'bakery') return 'budi';
    if (b && b.id === 'hall') return 'kades';
    return null;
  }

  // ---------- Gambar petak (lapisan statis) ----------
  let layer = null;
  function px(c, x, y, w, h, col) { c.fillStyle = col; c.fillRect(R(x), R(y), R(w), R(h)); }
  function disc(c, cx, cy, r, col, sy = 1) {
    c.fillStyle = col;
    for (let y = -r; y <= r; y++) {
      const hw = Math.floor(Math.sqrt(r * r - y * y));
      c.fillRect(R(cx - hw), R(cy + y * sy), hw * 2 + 1, Math.max(1, Math.ceil(sy)));
    }
  }
  function shadow(c, cx, by, r = 6) {
    c.globalAlpha = 0.22;
    disc(c, cx, by - 1, r, '#000', 0.4);
    c.globalAlpha = 1;
  }

  function drawGrass(c, tx, ty) {
    px(c, tx * T, ty * T, T, T, '#7ccc5c');
    for (let i = 0; i < 3; i++) {
      const h = hash(tx * 31 + ty * 17 + i);
      const x = tx * T + R(h * 13) + 1, y = ty * T + R(hash(h * 9) * 12) + 2;
      px(c, x, y, 1, 2, '#5fb447');
      px(c, x + 2, y + 1, 1, 1, '#5fb447');
    }
    if (hash(tx * 3 + ty * 11) > 0.84) {
      [[3, 4, '#ff6b8a'], [10, 6, '#ffd23f'], [6, 11, '#ffffff'], [12, 12, '#ff6b8a']].forEach(([x, y, col]) => {
        const X = tx * T + x, Y = ty * T + y;
        px(c, X, Y - 1, 1, 1, col); px(c, X - 1, Y, 3, 1, col); px(c, X, Y + 1, 1, 1, col); px(c, X, Y, 1, 1, '#f4a020');
      });
    }
  }
  const isPath = (x, y) => ground[y] && ground[y][x] === '=';
  function drawPath(c, tx, ty) {
    px(c, tx * T, ty * T, T, T, '#e8c98a');
    for (let i = 0; i < 4; i++) {
      const h = hash(tx * 7 + ty * 13 + i);
      px(c, tx * T + R(h * 14), ty * T + R(hash(h * 3) * 14), 1, 1, '#d4b071');
    }
    const e = '#c49a5a';
    if (!isPath(tx, ty - 1) && !BUILD.some((b) => inRect(tx, ty - 1, b))) px(c, tx * T, ty * T, T, 2, e);
    if (!isPath(tx, ty + 1)) px(c, tx * T, ty * T + T - 2, T, 2, e);
    if (!isPath(tx - 1, ty)) px(c, tx * T, ty * T, 2, T, e);
    if (!isPath(tx + 1, ty)) px(c, tx * T + T - 2, ty * T, 2, T, e);
  }
  function drawWater(c, tx, ty) {
    const isW = (x, y) => ground[y] && ground[y][x] === 'w';
    px(c, tx * T, ty * T, T, T, '#4fb3ff');
    const k = '#2b1d1a', edge = '#a8e0ff';
    if (!isW(tx, ty - 1)) { px(c, tx * T, ty * T, T, 2, k); px(c, tx * T, ty * T + 2, T, 1, edge); }
    if (!isW(tx, ty + 1)) px(c, tx * T, ty * T + T - 2, T, 2, k);
    if (!isW(tx - 1, ty)) px(c, tx * T, ty * T, 2, T, k);
    if (!isW(tx + 1, ty)) px(c, tx * T + T - 2, ty * T, 2, T, k);
  }
  function drawFence(c, tx, ty) {
    const x = tx * T;
    px(c, x, ty * T + 6, T, 2, '#8a5a2b');
    px(c, x, ty * T + 10, T, 2, '#8a5a2b');
    for (const o of [2, 10]) { px(c, x + o, ty * T + 3, 3, 12, '#2b1d1a'); px(c, x + o + 1, ty * T + 4, 1, 10, '#c98a45'); }
  }

  function drawBuilding(c, b) {
    const x = b.x * T, y = b.y * T, w = b.w * T, h = b.h * T;
    const look = {
      hall: { roof: '#8a3d22', roofD: '#5a2f1a', wall: '#f2e6c9' },
      bakery: { roof: '#c0503a', roofD: '#8a3522', wall: '#f7e2c0' },
      station: { roof: '#d63c2f', roofD: '#9e2a22', wall: '#e8e8e8' },
      houseAni: { roof: '#e86fa0', roofD: '#b84f7c', wall: '#ffe6f0' },
      house2: { roof: '#3b7dd8', roofD: '#2a5aa0', wall: '#ffe6a8' },
    }[b.id];
    const rh = R(h * 0.56);
    px(c, x - 2, y, w + 4, rh, '#2b1d1a');
    px(c, x - 1, y + 1, w + 2, rh - 2, look.roof);
    for (let yy = y + 4; yy < y + rh - 2; yy += 4) px(c, x - 1, yy, w + 2, 1, look.roofD);
    px(c, x + w / 2 - 1, y + 1, 2, rh - 2, look.roofD);
    px(c, x, y + rh, w, h - rh, '#2b1d1a');
    px(c, x + 1, y + rh, w - 2, h - rh - 1, look.wall);
    const doorX = x + w / 2 - 5;
    if (b.id === 'station') {
      px(c, x + 4, y + rh + 3, 30, h - rh - 4, '#2b1d1a');
      px(c, x + 5, y + rh + 4, 28, h - rh - 6, '#b9b9b9');
      for (let yy = y + rh + 6; yy < y + h - 2; yy += 3) px(c, x + 5, yy, 28, 1, '#8f8f8f');
      px(c, x + w - 22, y + rh + 4, 10, 8, '#2b1d1a');
      px(c, x + w - 21, y + rh + 5, 8, 6, '#bfe8ff');
      px(c, x + w - 30, y + rh - 9, 20, 7, '#2b1d1a');
      px(c, x + w - 29, y + rh - 8, 18, 5, '#f4c430');
      px(c, x + w - 24, y + rh - 7, 8, 3, '#d63c2f');
      return;
    }
    px(c, doorX, y + h - 13, 10, 12, '#2b1d1a');
    px(c, doorX + 1, y + h - 12, 8, 11, '#8a5a2b');
    px(c, doorX + 6, y + h - 7, 1, 1, '#f4c430');
    const wins = b.id === 'hall' ? [x + 6, x + 22, x + w - 32, x + w - 16] : [x + 5, x + w - 15];
    for (const wx of wins) {
      px(c, wx, y + rh + 4, 10, 8, '#2b1d1a');
      px(c, wx + 1, y + rh + 5, 8, 6, '#bfe8ff');
      px(c, wx + 4, y + rh + 5, 1, 6, '#2b1d1a');
      px(c, wx + 1, y + rh + 8, 8, 1, '#2b1d1a');
    }
    if (b.id === 'hall') {
      for (const cx of [x + 2, x + w - 6]) px(c, cx, y + rh, 4, h - rh - 1, '#c98a45');
      px(c, x + w / 2 - 14, y + rh - 10, 28, 8, '#2b1d1a');
      px(c, x + w / 2 - 13, y + rh - 9, 26, 6, '#f4c430');
      px(c, x + w / 2 - 9, y + rh - 7, 18, 2, '#8a3d22');
    }
    if (b.id === 'bakery') {
      for (let i = 0; i < w - 2; i += 6) { px(c, x + 1 + i, y + rh, 3, 3, '#e8451c'); px(c, x + 4 + i, y + rh, 3, 3, '#fff'); }
      px(c, x + w / 2 - 9, y + rh - 11, 18, 9, '#2b1d1a');
      px(c, x + w / 2 - 8, y + rh - 10, 16, 7, '#8a5a2b');
      c.drawImage(G.spr.bread, R(x + w / 2 - 6), y + rh - 10);
    }
  }

  function drawSign(c, tx, ty) {
    const x = tx * T, y = ty * T;
    shadow(c, x + 8, y + 15, 5);
    px(c, x + 7, y + 8, 2, 7, '#6e4520');
    px(c, x + 1, y + 1, 14, 8, '#2b1d1a');
    px(c, x + 2, y + 2, 12, 6, '#c98a45');
    px(c, x + 4, y + 4, 8, 1, '#6e4520');
    px(c, x + 4, y + 6, 6, 1, '#6e4520');
  }

  function buildLayer() {
    layer = document.createElement('canvas');
    layer.width = MW * T;
    layer.height = MH * T;
    const c = layer.getContext('2d');
    for (let y = 0; y < MH; y++)
      for (let x = 0; x < MW; x++) {
        const g = ground[y][x];
        if (g === '=') drawPath(c, x, y);
        else if (g === 'w') drawWater(c, x, y);
        else drawGrass(c, x, y);
        if (g === '#') drawFence(c, x, y);
      }
    // jalan kecil depan pintu
    BUILD.forEach((b) => drawBuilding(c, b));
    drawSign(c, SIGN[0], SIGN[1]);
  }

  // Pohon top-down (pra-render)
  let treeImg = null, bigTreeImg = null;
  function makeTree(r) {
    const c = document.createElement('canvas');
    c.width = r * 2 + 6;
    c.height = r * 2 + 14;
    const k = c.getContext('2d');
    const cx = R(c.width / 2), by = c.height - 1;
    shadow(k, cx, by, r - 2);
    px(k, cx - 3, by - 9, 6, 9, '#8a5a2b');
    px(k, cx - 3, by - 9, 2, 9, '#6e4520');
    const cy = by - 9 - r + 3;
    disc(k, cx, cy, r + 1, '#2b1d1a');
    disc(k, cx, cy, r, '#2f6b2a');
    disc(k, cx - 1, cy - 2, r - 2, '#3f8f38');
    disc(k, cx - 3, cy - 4, Math.max(2, r - 6), '#4fa846');
    disc(k, cx - 5, cy - 6, Math.max(1, R(r / 4)), '#6cc45f');
    return c;
  }

  function bubble(c, cx, by, kind = '!') {
    const bob = Math.sin(G.time * 5) > 0 ? -1 : 0;
    by += bob;
    px(c, cx - 5, by - 12, 10, 11, '#2b1d1a');
    px(c, cx - 4, by - 11, 8, 9, '#fff');
    px(c, cx - 1, by - 2, 3, 3, '#2b1d1a');
    px(c, cx, by - 2, 1, 2, '#fff');
    if (kind === '!') {
      px(c, cx - 1, by - 10, 2, 5, '#e8451c');
      px(c, cx - 1, by - 4, 2, 1, '#e8451c');
    }
  }

  // ---------- Gerak ----------
  function startMove(e, nx, ny) {
    e.fx = e.tx; e.fy = e.ty;
    e.tx = nx; e.ty = ny;
    e.moving = true;
    e.t = 0;
  }
  function dirTo(ax, ay, bx, by) {
    if (bx > ax) return 'right';
    if (bx < ax) return 'left';
    if (by > ay) return 'down';
    if (by < ay) return 'up';
    return null;
  }
  let bumpT = 0;
  function tryStep(dir) {
    const P = W.aksa, A = W.ara;
    P.dir = dir;
    const [dx, dy] = DIRS[dir];
    const nx = P.tx + dx, ny = P.ty + dy;
    if (blocked(nx, ny)) {
      if (G.time - bumpT > 0.35) { G.sfx.bump(); bumpT = G.time; }
      return false;
    }
    const ox = P.tx, oy = P.ty;
    startMove(P, nx, ny);
    if (!(A.tx === ox && A.ty === oy)) {
      A.dir = dirTo(A.tx, A.ty, ox, oy) || A.dir;
      startMove(A, ox, oy);
    }
    return true;
  }

  function bfs(sx, sy, goal) {
    const key = (x, y) => y * MW + x;
    const prev = new Map([[key(sx, sy), null]]);
    const q = [[sx, sy]];
    while (q.length) {
      const [x, y] = q.shift();
      if (goal(x, y) && !(x === sx && y === sy)) {
        const out = [];
        let k = key(x, y);
        while (k !== key(sx, sy)) {
          out.unshift([k % MW, Math.floor(k / MW)]);
          k = prev.get(k);
        }
        return out;
      }
      for (const [dx, dy] of Object.values(DIRS)) {
        const nx = x + dx, ny = y + dy;
        const k = key(nx, ny);
        if (prev.has(k) || blocked(nx, ny)) continue;
        prev.set(k, key(x, y));
        q.push([nx, ny]);
      }
    }
    return null;
  }

  function interactFacing() {
    const P = W.aksa;
    const [dx, dy] = DIRS[P.dir];
    const id = thingAt(P.tx + dx, P.ty + dy);
    if (id && W.onInteract) W.onInteract(id);
  }

  W.pressA = function () {
    if (W.mode !== 'walk' || W.aksa.moving) return;
    W.path = [];
    W.pending = null;
    interactFacing();
  };
  W.setHeld = function (dir) {
    W.held = dir;
    if (dir) { W.path = []; W.pending = null; W.marker = null; }
  };

  W.tapWorld = function (sx, sy) {
    if (W.mode !== 'walk') return;
    const { S } = G.view;
    const wx = sx / S + W.cam.x, wy = sy / S + W.cam.y;
    const tx = Math.floor(wx / T), ty = Math.floor(wy / T);
    const P = W.aksa;
    // ketuk pada bagian atas sprite NPC juga dihitung
    let id = thingAt(tx, ty);
    let target = [tx, ty];
    if (!id && thingAt(tx, ty + 1) && ['ani', 'budi', 'joko', 'kades', 'raja', 'siti', 'udin'].includes(thingAt(tx, ty + 1))) {
      id = thingAt(tx, ty + 1);
      target = [tx, ty + 1];
    }
    if (id) {
      const [gx, gy] = target;
      if (Math.abs(gx - P.tx) + Math.abs(gy - P.ty) === 1 && !P.moving) {
        P.dir = dirTo(P.tx, P.ty, gx, gy);
        W.onInteract && W.onInteract(id);
        return;
      }
      const p = bfs(P.tx, P.ty, (x, y) => Math.abs(x - gx) + Math.abs(y - gy) === 1);
      if (p) { W.path = p; W.pending = { x: gx, y: gy, id }; W.marker = { x: gx, y: gy, t: G.time }; }
      return;
    }
    if (blocked(tx, ty) || (tx === P.tx && ty === P.ty)) return;
    const p = bfs(P.tx, P.ty, (x, y) => x === tx && y === ty);
    if (p) { W.path = p; W.pending = null; W.marker = { x: tx, y: ty, t: G.time }; }
  };

  function update(dt) {
    const P = W.aksa, A = W.ara;
    for (const e of [P, A]) {
      if (!e.moving) continue;
      e.t += dt / STEP;
      e.walk += dt / STEP;
      if (e.t >= 1) {
        e.t = 1;
        e.moving = false;
      }
      e.x = (e.fx + (e.tx - e.fx) * e.t) * T;
      e.y = (e.fy + (e.ty - e.fy) * e.t) * T;
    }
    if (!P.moving) {
      if (!A.moving) A.walk = 0;
      if (W.mode !== 'walk') { P.walk = 0; return; }
      if (W.held) {
        if (!tryStep(W.held)) P.walk = 0;
      } else if (W.path.length) {
        const [nx, ny] = W.path[0];
        const d = dirTo(P.tx, P.ty, nx, ny);
        if (d && tryStep(d)) W.path.shift();
        else { W.path = []; W.pending = null; }
      } else {
        P.walk = 0;
        if (W.pending) {
          const pd = W.pending;
          W.pending = null;
          W.marker = null;
          P.dir = dirTo(P.tx, P.ty, pd.x, pd.y) || P.dir;
          W.onInteract && W.onInteract(pd.id);
        } else if (W.marker && W.marker.x === P.tx && W.marker.y === P.ty) W.marker = null;
      }
    }
  }

  // ---------- Gambar dunia ----------
  function frameOf(set, e) {
    const i = e.moving || e.walk > 0 ? Math.floor(e.walk * 2) % 4 : 0;
    return set[e.dir][i];
  }
  function put(ctx, img, cx, by) { ctx.drawImage(img, R(cx - img.width / 2), R(by - img.height)); }

  function draw(ctx, t, dt) {
    update(dt);
    const { W: VW, H: VH } = G.view;
    const P = W.aksa;
    W.cam.x = Math.max(0, Math.min(MW * T - VW, P.x + 8 - VW / 2));
    W.cam.y = Math.max(0, Math.min(MH * T - VH, P.y + 8 - VH / 2 - 6));
    let sx = 0;
    if (W.shake > 0) { W.shake -= dt; sx = (Math.random() - 0.5) * 4; }
    const cx = R(W.cam.x + sx), cy = R(W.cam.y);
    ctx.save();
    ctx.translate(-cx, -cy);
    ctx.drawImage(layer, 0, 0);
    if (W.marker) {
      const k = (t - W.marker.t) * 4;
      ctx.globalAlpha = 0.6 + 0.3 * Math.sin(k);
      const mx = W.marker.x * T, my = W.marker.y * T;
      px(ctx, mx + 2, my + 2, 12, 2, '#ffffff'); px(ctx, mx + 2, my + 12, 12, 2, '#ffffff');
      px(ctx, mx + 2, my + 2, 2, 12, '#ffffff'); px(ctx, mx + 12, my + 2, 2, 12, '#ffffff');
      ctx.globalAlpha = 1;
    }

    const items = [];
    const inView = (x, y) => x > cx - 40 && x < cx + VW + 40 && y > cy - 10 && y < cy + VH + 60;
    for (let y = 0; y < MH; y++)
      for (let x = 0; x < MW; x++)
        if (ground[y][x] === 'T' && inView(x * T, y * T))
          items.push({ y: y * T + 15, f: () => put(ctx, treeImg, x * T + 8, y * T + 16) });

    // pohon kucing
    items.push({ y: CAT_TREE[1] * T + 15, f: () => {
      put(ctx, bigTreeImg, CAT_TREE[0] * T + 8, CAT_TREE[1] * T + 16);
      if (!G.save.solved.kucing) ctx.drawImage(G.spr.cat, CAT_TREE[0] * T + 1, CAT_TREE[1] * T - 26 + (Math.sin(t * 6) > 0.6 ? -1 : 0));
    } });
    if (G.save.solved.kucing) items.push({ y: 16 * T + 10, f: () => ctx.drawImage(G.spr.cat, 10 * T, 16 * T + 4) });

    // toko roti terbakar
    if (!G.save.solved.roti) {
      items.push({ y: 7 * T + 15, f: () => {
        [[4, 5], [6, 5], [5, 6], [7, 6]].forEach(([fx, fy], i) => G.drawFire(ctx, fx * T + 2 + (i % 2) * 6, fy * T + 12, 8, 12, t + i, { noFace: true, seed: i }));
      } });
      if (Math.random() < dt * 3) G.fx.smoke(5.5 * T, 5 * T, 1);
    }

    // truk & tumpukan daun
    items.push({ y: (TRUCK.y + TRUCK.h) * T - 1, f: () => G.side.truck(ctx, TRUCK.x * T, (TRUCK.y + TRUCK.h) * T, G.save.solved.truk ? 1 : 0, t, !!G.save.solved.truk) });
    items.push({ y: PILE[1] * T + 14, f: () => {
      G.side.leafPile(ctx, PILE[0] * T + 8, PILE[1] * T + 14);
      if (!G.save.solved.daun) {
        G.drawFire(ctx, PILE[0] * T + 8, PILE[1] * T + 10, 11, 15, t, { mood: Math.sin(t * 2) > 0.5 ? 'laugh' : 'happy' });
        bubble(ctx, PILE[0] * T + 8, PILE[1] * T - 8);
      }
    } });

    // kandang ayam & anak ayam
    items.push({ y: (COOP.y + COOP.h) * T - 1, f: () => {
      const x = COOP.x * T, by = (COOP.y + COOP.h) * T;
      shadow(ctx, x + 16, by, 14);
      px(ctx, x + 1, by - 18, 30, 18, '#2b1d1a');
      px(ctx, x + 2, by - 17, 28, 16, '#c98a45');
      for (let i = 0; i < 4; i++) px(ctx, x + 2, by - 15 + i * 4, 28, 1, '#a0652d');
      px(ctx, x - 1, by - 24, 34, 7, '#2b1d1a');
      px(ctx, x, by - 23, 32, 5, '#d63c2f');
      const open = !G.save.solved.ayam;
      px(ctx, x + 11, by - 11, 10, 10, '#2b1d1a');
      px(ctx, x + 12, by - 10, 8, 9, open ? '#4a3426' : '#a0652d');
      if (!open) for (let i = 0; i < 3; i++) ctx.drawImage(G.spr.chick, x + 3 + i * 9, by - 30 + (Math.sin(t * 4 + i) > 0.7 ? -1 : 0));
    } });
    if (!G.save.solved.ayam) {
      [[4, 4], [7, 1], [8, 4], [3, 2], [9, 2]].forEach(([cx, cy], i) => {
        const wx = cx * T + 4 + Math.sin(t * 1.3 + i * 2) * 5, wy = cy * T + 8 + Math.cos(t * 1.1 + i) * 3;
        items.push({ y: wy + 7, f: () => ctx.drawImage(G.spr.chick, R(wx), R(wy) + (Math.sin(t * 9 + i) > 0.5 ? -1 : 0)) });
      });
    }

    // hidran
    items.push({ y: HYDRANT[1] * T + 15, f: () => {
      shadow(ctx, HYDRANT[0] * T + 8, HYDRANT[1] * T + 15, 5);
      put(ctx, G.spr.hydrant, HYDRANT[0] * T + 8, HYDRANT[1] * T + 15);
      if (!G.save.solved.hidran && Math.random() < 0.6) {
        G.fx.add({ x: HYDRANT[0] * T + 3, y: HYDRANT[1] * T + 6, vx: -20 - Math.random() * 15, vy: -30 - Math.random() * 20, g: 120, life: 0.7, color: Math.random() < 0.3 ? '#d4f1ff' : '#4fb3ff', size: 2 });
        G.fx.add({ x: HYDRANT[0] * T + 13, y: HYDRANT[1] * T + 6, vx: 20 + Math.random() * 15, vy: -30 - Math.random() * 20, g: 120, life: 0.7, color: Math.random() < 0.3 ? '#d4f1ff' : '#4fb3ff', size: 2 });
      }
    } });

    // tiang bendera
    items.push({ y: FLAG[1] * T + 15, f: () => {
      const x = FLAG[0] * T + 7, by = FLAG[1] * T + 15;
      shadow(ctx, x + 1, by + 1, 4);
      px(ctx, x, by - 34, 2, 34, '#cccccc');
      const wave = Math.floor(t * 4) % 2;
      px(ctx, x + 2, by - 34 + wave, 12, 4, '#e8241c');
      px(ctx, x + 2, by - 30 + wave, 12, 4, '#ffffff');
    } });

    // warga
    const need = { ani: 'kucing', budi: 'roti', joko: 'truk', siti: 'ayam', udin: 'hidran' };
    for (const [id, n] of Object.entries(NPCS)) {
      items.push({ y: n.y * T + 15, f: () => {
        shadow(ctx, n.x * T + 8, n.y * T + 15);
        const bob = id === 'kades' && W.bossActive() ? (Math.sin(t * 12) > 0 ? -1 : 0) : 0;
        put(ctx, G.spr[id], n.x * T + 8, n.y * T + 15 + bob);
        const show = (need[id] && !G.save.solved[need[id]]) || (id === 'kades' && W.bossActive());
        if (show) bubble(ctx, n.x * T + 8, n.y * T - 9);
      } });
    }

    // boss
    if (W.bossActive()) {
      items.push({ y: BOSS_TILE[1] * T + 15, f: () => {
        shadow(ctx, BOSS_TILE[0] * T + 8, BOSS_TILE[1] * T + 16, 14);
        G.drawFire(ctx, BOSS_TILE[0] * T + 8, BOSS_TILE[1] * T + 16, 28, 36, t, { mood: Math.sin(t * 1.5) > 0.3 ? 'laugh' : 'happy', crown: true, angry: true });
      } });
      if (Math.random() < dt * 2) G.fx.smoke(BOSS_TILE[0] * T + 8, BOSS_TILE[1] * T - 20, 1);
    }

    // Aksa & Ara
    const araSet = G.spr.araDir(G.save.equip);
    items.push({ y: W.ara.y + 14.5, f: () => { shadow(ctx, W.ara.x + 8, W.ara.y + 15, 6); put(ctx, frameOf(araSet, W.ara), W.ara.x + 8, W.ara.y + 15); } });
    items.push({ y: P.y + 15, f: () => { shadow(ctx, P.x + 8, P.y + 15, 6); put(ctx, frameOf(G.spr.aksaDir, P), P.x + 8, P.y + 16); } });

    items.sort((a, b) => a.y - b.y).forEach((i) => i.f());
    G.fx.draw(ctx);
    ctx.restore();
  }

  W.toScreen = function (wx, wy) {
    const { S } = G.view;
    return [(wx - W.cam.x) * S, (wy - W.cam.y) * S];
  };
  W.bossScreen = () => W.toScreen(BOSS_TILE[0] * T + 8, BOSS_TILE[1] * T);

  W.save = function () {
    G.save.pos = { x: W.aksa.tx, y: W.aksa.ty, dir: W.aksa.dir, ax: W.ara.tx, ay: W.ara.ty };
  };
  W.restore = function () {
    const p = G.save.pos;
    if (!p || blocked(p.x, p.y)) return;
    Object.assign(W.aksa, { tx: p.x, ty: p.y, x: p.x * T, y: p.y * T, dir: p.dir || 'down', moving: false });
    const ax = blocked(p.ax, p.ay) ? p.x : p.ax, ay = blocked(p.ax, p.ay) ? p.y - 1 : p.ay;
    Object.assign(W.ara, { tx: ax, ty: ay, x: ax * T, y: ay * T, moving: false });
  };

  W.init = function () {
    buildGround();
    buildLayer();
    treeImg = makeTree(11);
    bigTreeImg = makeTree(15);
    W.restore();
  };
  G.scenes.world = function () {
    return { draw, ownsFx: true };
  };
})();
