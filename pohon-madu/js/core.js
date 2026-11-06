// Inti: simpanan, gambar, stat, naik level, alat UI
(function () {
  const $ = (id) => document.getElementById(id);
  PM.$ = $;
  PM.wait = (ms) => new Promise((r) => setTimeout(r, ms));

  // ---------- simpanan ----------
  const FRESH = () => ({ v: 1, joined: ['ata'], lv: { ata: 1 }, exp: { ata: 0 }, koin: 0, madu: 3, done: {}, seen: {}, beaten: {}, pick: {}, tips: {}, muted: false });
  PM.load = function () {
    try { const s = JSON.parse(localStorage.getItem(PM.SAVE_KEY)); if (s && s.v === 1) { PM.S = Object.assign(FRESH(), s); return; } } catch (e) {}
    PM.S = FRESH();
  };
  PM.save = function () { try { localStorage.setItem(PM.SAVE_KEY, JSON.stringify(PM.S)); } catch (e) {} };
  PM.reset = function () { PM.S = FRESH(); PM.save(); };

  // ---------- gambar ----------
  const IMG = {};
  PM.IMG = IMG;
  PM.loadImg = (path) => new Promise((res) => {
    if (IMG[path]) return res(IMG[path]);
    const i = new Image(); i.onload = () => { IMG[path] = i; res(i); }; i.onerror = () => res(null); i.src = 'img/' + path + '?v=' + PM.VERSION;
  });
  PM.preload = function (onProgress) {
    const list = [];
    ['siaga', 'tendang', 'pukul', 'depan', 'wajah', 'teriak', 'kedip', 'rendah'].forEach((p) => list.push('ata/' + p + '.png'));
    ['siaga', 'lempar', 'ayun', 'bertahan', 'depan', 'wajah'].forEach((p) => list.push('ladhia/' + p + '.png'));
    ['siaga', 'sorak', 'ayun', 'depan', 'wajah', 'senyum'].forEach((p) => list.push('bubunti/' + p + '.png'));
    Object.values(PM.ENEMIES).forEach((e) => { list.push('musuh/' + e.spr + '.png', 'musuh/' + e.face + '.png'); if (e.phase2 && e.phase2.spr) list.push('musuh/' + e.phase2.spr + '.png'); });
    ['hutan-pinggir', 'halaman-dojo', 'lembah-kerikil', 'jembatan-batu', 'tambang-tua', 'rawa-kabut', 'gua-embun'].forEach((b) => list.push('latar/' + b + '.jpg'));
    const uniq = [...new Set(list)]; let n = 0;
    return Promise.all(uniq.map((p) => PM.loadImg(p).then(() => onProgress && onProgress(++n / uniq.length))));
  };

  // sabuk Ata: piksel gelap netral di area sabuk diwarnai ulang
  const beltCache = {};
  const hex = (h) => [1, 3, 5].map((i) => parseInt(h.substr(i, 2), 16));
  PM.ataSrc = function (pose, beltId) {
    const im = IMG['ata/' + pose + '.png']; if (!im) return '';
    const belt = PM.BELTS.find((b) => b.id === beltId) || PM.beltFor(PM.S.lv.ata || 1);
    const key = pose + '|' + belt.id; if (beltCache[key]) return beltCache[key];
    if (!belt.ramp || !PM.BELT_AREA[pose]) return (beltCache[key] = im.src);
    const c = document.createElement('canvas'); c.width = im.width; c.height = im.height;
    const x = c.getContext('2d'); x.drawImage(im, 0, 0);
    const d = x.getImageData(0, 0, c.width, c.height), a = d.data, lo = hex(belt.ramp[0]), hi = hex(belt.ramp[1]);
    for (const [x0, y0, x1, y1] of PM.BELT_AREA[pose]) for (let y = y0; y < Math.min(y1, c.height); y++) for (let xx = x0; xx < Math.min(x1, c.width); xx++) {
      const i = (y * c.width + xx) * 4, r = a[i], g = a[i + 1], b = a[i + 2];
      if (a[i + 3] < 60 || Math.max(r, g, b) >= 92 || r - b > 5 || Math.abs(r - g) >= 12) continue;
      const t = Math.min(1, Math.max(0, ((r + g + b) / 3 - 28) / 55));
      for (let k = 0; k < 3; k++) a[i + k] = lo[k] + (hi[k] - lo[k]) * t;
    }
    x.putImageData(d, 0, 0);
    return (beltCache[key] = c.toDataURL());
  };
  PM.charSrc = (key, pose) => (key === 'ata' ? PM.ataSrc(pose) : (IMG[key + '/' + pose + '.png'] || {}).src || '');
  PM.foeSrc = (spr) => (IMG['musuh/' + spr + '.png'] || {}).src || '';
  PM.imgSize = (path) => { const i = IMG[path]; return i ? [i.naturalWidth, i.naturalHeight] : [100, 100]; };

  // ---------- stat & level ----------
  PM.stats = function (key, lv) {
    const C = PM.CHARS[key]; lv = lv || PM.S.lv[key] || 1;
    const o = {}; for (const k in C.base) o[k] = Math.round(C.base[k] + C.grow[k] * (lv - 1));
    return o;
  };
  PM.party = () => PM.ORDER.filter((k) => PM.S.joined.includes(k)).slice(0, 3);
  PM.skillsFor = function (key) {
    const lv = PM.S.lv[key];
    return PM.CHARS[key].skills.map((id) => Object.assign({ id }, PM.SKILLS[id]))
      .filter((s) => !s.pick || PM.S.pick[s.pick] === s.id || (lv < s.lv && PM.PICKS[s.pick][0] === s.id));
  };
  PM.join = function (key) {
    if (PM.S.joined.includes(key)) return;
    PM.S.joined.push(key);
    PM.S.lv[key] = PM.S.lv.ata; PM.S.exp[key] = 0;
  };
  // tambah EXP → daftar kejadian naik level
  PM.gainExp = function (key, n) {
    const ev = [];
    PM.S.exp[key] = (PM.S.exp[key] || 0) + n;
    while (PM.S.lv[key] < PM.MAX_LV && PM.S.exp[key] >= PM.expTo(PM.S.lv[key])) {
      PM.S.exp[key] -= PM.expTo(PM.S.lv[key]);
      const before = PM.stats(key), lv = ++PM.S.lv[key], after = PM.stats(key);
      const gains = {}; for (const k in after) gains[k] = after[k] - before[k];
      const skills = PM.CHARS[key].skills.map((id) => Object.assign({ id }, PM.SKILLS[id])).filter((s) => s.lv === lv && !s.pick);
      const pick = Object.entries(PM.PICKS).find(([p, ids]) => PM.SKILLS[ids[0]].who === key && PM.SKILLS[ids[0]].lv === lv);
      const belt = key === 'ata' && PM.BELTS.find((b) => b.lv === lv && lv > 1);
      ev.push({ key, lv, gains, after, skills, pick: pick ? pick[0] : null, belt });
    }
    return ev;
  };

  // ---------- layar iPad ----------
  PM.fit = function () {
    const stage = $('stage'), safe = $('safe');
    const vv = window.visualViewport;
    const vw = Math.min(vv ? vv.width : innerWidth, document.documentElement.clientWidth || innerWidth);
    const vh = Math.min(vv ? vv.height : innerHeight, document.documentElement.clientHeight || innerHeight);
    const cs = getComputedStyle(safe), px = (k) => parseFloat(cs[k]) || 0;
    const l = px('paddingLeft'), r = px('paddingRight'), t = px('paddingTop'), b = px('paddingBottom');
    const aw = Math.max(1, vw - l - r), ah = Math.max(1, vh - t - b);
    const s = Math.min(aw / 1200, ah / 840);
    stage.style.left = (l + (aw - 1200 * s) / 2) + 'px';
    stage.style.top = (t + (ah - 840 * s) / 2) + 'px';
    stage.style.transform = `scale(${s})`;
    PM.scale = s;
  };

  // ---------- alat UI ----------
  PM.el = function (tag, cls, html, parent) {
    const d = document.createElement(tag); if (cls) d.className = cls; if (html != null) d.innerHTML = html; if (parent) parent.appendChild(d); return d;
  };
  PM.tap = function (node, fn) {
    node.addEventListener('click', (e) => { e.stopPropagation(); PM.audioUnlock(); fn(e); });
  };
  // dialog: tombol = [{label, cls, value}] → janji nilai
  PM.dialog = function (html, buttons, cls) {
    return new Promise((res) => {
      const ov = PM.el('div', 'overlay', '', $('stage'));
      const box = PM.el('div', 'box dialog ' + (cls || ''), html, ov);
      const row = PM.el('div', 'drow', '', box);
      (buttons || [{ label: 'Oke 👍', value: true }]).forEach((b) => {
        const bt = PM.el('button', 'btn big ' + (b.cls || ''), b.label, row);
        PM.tap(bt, () => { PM.sfx('pilih'); ov.remove(); res(b.value); });
      });
    });
  };
  PM.bg = function (name, fy = 0.55) {
    const cv = $('bg'), g = cv.getContext('2d'), im = IMG['latar/' + name + '.jpg'];
    if (!im) { g.fillStyle = '#2a3a22'; g.fillRect(0, 0, 1200, 840); return; }
    const top = 58, w = im.width, h = w * 840 / 1200, y = top + (im.height - top - h) * fy;   // buang label di atas
    g.imageSmoothingQuality = 'high'; g.drawImage(im, 0, Math.max(0, y), w, h, 0, 0, 1200, 840);
  };
  PM.bar = (cls, v, m) => `<div class="t ${cls}"><i style="width:${Math.max(0, Math.min(100, (v / m) * 100))}%"></i></div>`;
})();
