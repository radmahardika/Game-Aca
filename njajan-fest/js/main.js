// Njajan Fest — alur utama: judul → pilih tokoh → cerita → papan persiapan → menata → festival → laporan
import * as THREE from '../vendor/three.module.min.js';
import { NF } from './data.js?v=6';
import * as G from './models.js?v=6';
import * as A from './audio.js?v=6';

const W = 1180, H = 820, PADY = G.PADY;
const $ = id => document.getElementById(id);
const stage = $('stage'), UI = $('ui'), cv = $('c');
let LV = NF.LEVELS[0];
const rnd = (a, b) => a + Math.random() * (b - a);
const pick = arr => arr[Math.floor(Math.random() * arr.length)];
const dist = (a, b) => Math.hypot(a.x - b.x, a.z - b.z);

// ================= simpanan =================
function loadSave() { try { return JSON.parse(localStorage.getItem(NF.SAVE_KEY)) || {}; } catch (e) { return {}; } }
const SAVE = Object.assign({ cerita: false, best: {}, main: 0, hero: null, muted: false, stk: {}, lv: {} }, loadSave());
SAVE.stk = SAVE.stk || {}; SAVE.lv = SAVE.lv || {};
for (const h in SAVE.best) SAVE.lv[h + '-1'] = Math.max(SAVE.lv[h + '-1'] || 0, SAVE.best[h]);
const bestOf = (h, id) => SAVE.lv[`${h}-${id}`] || 0;
const tahap2Open = () => Object.keys(SAVE.lv).some(k => k.endsWith('-1') && SAVE.lv[k] >= 1);
function save() { try { localStorage.setItem(NF.SAVE_KEY, JSON.stringify(SAVE)); } catch (e) {} }

// ================= panggung & renderer =================
let scale = 1;
const renderer = new THREE.WebGLRenderer({ canvas: cv, antialias: true });
renderer.shadowMap.enabled = true; renderer.shadowMap.type = THREE.PCFSoftShadowMap;
renderer.toneMapping = THREE.ACESFilmicToneMapping; renderer.toneMappingExposure = 1.0;
function fit() {
  const vv = window.visualViewport;
  const vw = Math.min(vv ? vv.width : innerWidth, document.documentElement.clientWidth || innerWidth);
  const vh = Math.min(vv ? vv.height : innerHeight, document.documentElement.clientHeight || innerHeight);
  const cs = getComputedStyle($('safe')), px = k => parseFloat(cs[k]) || 0;
  const l = px('paddingLeft'), r = px('paddingRight'), t = px('paddingTop'), b = px('paddingBottom');
  const aw = Math.max(1, vw - l - r), ah = Math.max(1, vh - t - b);
  scale = Math.min(aw / W, ah / H);
  stage.style.left = (l + (aw - W * scale) / 2) + 'px';
  stage.style.top = (t + (ah - H * scale) / 2) + 'px';
  stage.style.transform = `scale(${scale})`;
  renderer.setPixelRatio(Math.min(2, Math.max(0.75, (window.devicePixelRatio || 1) * scale)));
  renderer.setSize(W, H, false);
}
const refit = () => { fit(); for (const ms of [100, 300, 700]) setTimeout(fit, ms); };
addEventListener('resize', refit); addEventListener('orientationchange', refit);
if (window.visualViewport) visualViewport.addEventListener('resize', fit);
fit();

// ================= dunia 3D =================
const scene = new THREE.Scene();
scene.background = new THREE.Color('#cdeeea');
scene.fog = new THREE.Fog('#cdeeea', 44, 92);
const hemi = new THREE.HemisphereLight('#ffffff', '#7fbfb6', 1.6); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff4e0', 2.6);
sun.castShadow = true; sun.shadow.mapSize.set(2048, 2048);
Object.assign(sun.shadow.camera, { left: -20, right: 20, top: 20, bottom: -20, near: 1, far: 80 });
sun.shadow.bias = -0.0006; sun.shadow.normalBias = 0.03;
scene.add(sun); scene.add(sun.target);
function sunAt(x, z) { sun.position.set(x - 16, 20, z + 6); sun.target.position.set(x, 0, z); sun.target.updateMatrixWorld(); }
sunAt(1, -1);
const water = new THREE.Mesh(new THREE.CircleGeometry(220, 64), G.M('#47b8bd'));
water.rotation.x = -Math.PI / 2; water.receiveShadow = true; scene.add(water);

const worldA = new THREE.Group(), worldB = new THREE.Group(); let world = worldA;
const dyn = new THREE.Group(), actors = new THREE.Group(), lineupG = new THREE.Group(), fx = new THREE.Group();
scene.add(worldA, worldB, dyn, actors, lineupG, fx); worldB.visible = false;
const cam = new THREE.PerspectiveCamera(30, W / H, 0.1, 300);

const PAD_R = 8.6, ENTRY = { x: 0, z: 3.0 };
const GATE = { x: 0.8, z: 6.7 }, CENTER = { x: 0, z: -0.3 }, DOCK = { x: 0.9, z: 9.0 };
const STAGE1 = { x: 12.6, z: -4.6 }, PAD2 = { x: 16.6, z: -1.2, r: 6.2 }, STAGE2 = { x: 18.4, z: -4.2 };
let STAGE = STAGE1;
const BR1 = { x: 7.9, z: -0.9 }, BR2 = { x: 11.0, z: -1.0 };   // ujung jembatan daun utama ↔ daun kedua
const onPad2 = p => LV.id === 2 && p.x > 9.6;
function buildVenue(lv) {
  const g = lv === 2 ? worldB : worldA; G.setParent(g);
  const avoid = (x, z) => lv !== 2 || Math.hypot(x - PAD2.x, z - PAD2.z) > PAD2.r + 1.8;
  G.inGroup(0, -5, () => G.shore(), g);
  G.pad(0, 0, PAD_R, -Math.PI / 2 + 0.17);
  if (lv === 2) { G.pad(PAD2.x, PAD2.z, PAD2.r, Math.PI); G.twigBridge([8.3, -0.9], [10.6, -1.0]); G.stageLotus(STAGE2.x, STAGE2.z, 1.5); }
  else { G.pad(12.4, -4.4, 3.2, Math.PI * 0.95); G.twigBridge([8.3, -2.2], [9.4, -3.1]); G.stageLotus(STAGE1.x, STAGE1.z, 1.5); }
  G.pad(-12.4, 2.4, 3.0, Math.PI * 1.9);
  G.twigBridge([-8.4, 1.2], [-9.5, 1.7]);
  [[16, 5, 1.1, 1], [-16, -4, 1.3, 0], [-6, 12, 1.0, 1], [15, -10, 1.2, 0], [-17, 8, 0.9, 1], [3, -12.5, 1.1, 1], [18, 1, 0.8, 0], [8.5, 11.5, 1.3, 1], [-11, -9, 1.1, 0], [25, 6, 1.2, 1], [26, -7, 1.0, 0]].filter(([x, z]) => avoid(x, z)).forEach(([x, z, r, f]) => G.smallPad(x, z, r, f));
  [[14.5, 8.5, 1.4], [-15, 5.4, 1.2], [-4.5, -11.5, 1.0]].filter(([x, z]) => avoid(x, z)).forEach(([x, z, sc]) => G.lotus(x, z, sc, 0.05));
  [[-9, -8], [9.5, 13], [-13, 11], [17, -5], [-18, -1], [24.5, -2]].filter(([x, z]) => avoid(x, z)).forEach(([x, z], k) => { G.reeds(x, z, 6, k + 30); G.cattail(x + 0.4, z + 0.2, 2.6, 0.05); });
  G.dewdrop(CENTER.x, CENTER.z, 1.5);
  G.berryLights([-6.6, -1.6], [-1.8, -6.6]); G.berryLights([1.8, -6.6], [6.6, -1.6]);
  G.reedGate(GATE.x, GATE.z);
  G.logBench(-12.8, 2.0, 0.2); G.logBench(-11.8, 3.3, -0.3);
  for (let k = 0; k <= 6; k++) { const t = k / 6; const d = G.add(G.cyl(0.26, 0.28, 0.04, 7), G.M('#f3e3b5'), GATE.x + (ENTRY.x - GATE.x) * t, PADY + 0.02, (GATE.z - 0.6) + (ENTRY.z - 0.8 - (GATE.z - 0.6)) * t); d.castShadow = false; }
  if (lv === 2) { // lampu tetap: tugu embun, gerbang, panggung (lingkaran cahaya)
    FIXED_LIGHTS.forEach(L => glowDisc(L.x, L.z, L.r, g));
    for (const dx of [-1.3, 1.3]) lampionModel(GATE.x + dx, GATE.z + 0.3, g, false);
  }
}
const FIXED_LIGHTS = [{ x: CENTER.x, z: CENTER.z, r: 3.0 }, { x: GATE.x, z: GATE.z, r: 2.8 }, { x: STAGE2.x, z: STAGE2.z, r: 3.2 }];
const glowMat = new THREE.MeshBasicMaterial({ color: '#ffd27a', transparent: true, opacity: 0.0, depthWrite: false, blending: THREE.AdditiveBlending });
const lampMat = new THREE.MeshStandardMaterial({ color: '#ffb347', emissive: '#ffb347', emissiveIntensity: 1.6, roughness: 1, flatShading: true });
function glowDisc(x, z, r, parent) { const d = new THREE.Mesh(new THREE.CircleGeometry(r, 28), glowMat); d.rotation.x = -Math.PI / 2; d.position.set(x, PADY + 0.035, z); d.renderOrder = 2; parent.add(d); return d; }
function lampionModel(x, z, parent, disc = true) {
  const old = G.setParent(parent);
  G.cattail(x, z, 2.8, 0);
  const l = new THREE.Mesh(G.sph(0.22), lampMat); l.position.set(x + 0.25, 2.3, z); l.scale.set(1, 1.25, 1); parent.add(l);
  G.add(G.cyl(0.1, 0.1, 0.06, 7), G.M('#8a4e22'), x + 0.25, 2.6, z); G.add(G.cyl(0.1, 0.1, 0.06, 7), G.M('#8a4e22'), x + 0.25, 2.02, z);
  if (disc) glowDisc(x, z, LAMP_R, parent);
  G.setParent(old);
}
const LAMP_R = 3.4;
function isLit(p, list = S.placed) {
  if (!LV.malam) return true;
  return FIXED_LIGHTS.some(L => Math.hypot(p.x - L.x, p.z - L.z) <= L.r) || list.some(o => o.kind === 'lampion' && dist(o, p) <= LAMP_R);
}
// ---- siang ↔ malam ----
const DAY = { bg: new THREE.Color('#cdeeea'), water: new THREE.Color('#47b8bd'), hemi: 1.6, sun: 2.6 };
const NIGHT = { bg: new THREE.Color('#1c2a4a'), water: new THREE.Color('#24506a'), hemi: 0.55, sun: 0.45 };
let nightF = 0;
function setNight(f) {
  nightF = f;
  scene.background.copy(DAY.bg).lerp(NIGHT.bg, f); scene.fog.color.copy(scene.background);
  water.material.color.copy(DAY.water).lerp(NIGHT.water, f);
  hemi.intensity = DAY.hemi + (NIGHT.hemi - DAY.hemi) * f; hemi.color.set(f > 0.5 ? '#9aa8ff' : '#ffffff');
  sun.intensity = DAY.sun + (NIGHT.sun - DAY.sun) * f; sun.color.set(f > 0.5 ? '#b8c8ff' : '#fff4e0');
  glowMat.opacity = 0.32 * f; lampMat.emissiveIntensity = 0.4 + 1.4 * f;
  $('vig').style.background = f > 0.05 ? `radial-gradient(ellipse at 50% 45%, transparent 50%, rgba(5,10,30,${0.5 * f}))` : '';
  if (fireflies) fireflies.visible = f > 0.4;
}
let fireflies = null;
function setLevel(id) {
  LV = NF.LEVELS.find(l => l.id === id) || NF.LEVELS[0];
  world = id === 2 ? worldB : worldA; worldA.visible = id !== 2; worldB.visible = id === 2;
  STAGE = id === 2 ? STAGE2 : STAGE1;
  buildSlots(); setNight(LV.malam ? 1 : 0);
}
function segDist(p, a, b) { const dx = b.x - a.x, dz = b.z - a.z; const t = Math.max(0, Math.min(1, ((p.x - a.x) * dx + (p.z - a.z) * dz) / (dx * dx + dz * dz))); return Math.hypot(p.x - a.x - dx * t, p.z - a.z - dz * t); }
const SLOTS = [];
const SP = 2.25;
const slotMarks = new THREE.Group(); scene.add(slotMarks); slotMarks.visible = false;
function buildSlots() {
  SLOTS.length = 0; while (slotMarks.children.length) slotMarks.remove(slotMarks.children[0]);
  for (let i = -4; i <= 4; i++) for (let j = -4; j <= 4; j++) {
    const p = { x: i * SP + (j % 2 ? SP / 2 : 0), z: j * SP };
    const d = Math.hypot(p.x - CENTER.x, p.z - CENTER.z);
    if (Math.hypot(p.x, p.z) > PAD_R - 1.4 || d < 2.0) continue;
    if (segDist(p, GATE, { x: ENTRY.x, z: ENTRY.z - 1.2 }) < 1.3) continue;
    if (LV.id === 2 && segDist(p, { x: 4, z: -0.8 }, BR1) < 1.2) continue;
    SLOTS.push({ x: p.x, z: p.z, item: null, idx: SLOTS.length });
  }
  if (LV.id === 2) for (let i = -2; i <= 2; i++) for (let j = -2; j <= 2; j++) {
    const p = { x: PAD2.x + i * SP + (j % 2 ? SP / 2 : 0), z: PAD2.z + j * SP };
    if (Math.hypot(p.x - PAD2.x, p.z - PAD2.z) > PAD2.r - 1.3) continue;
    if (Math.hypot(p.x - STAGE2.x, p.z - STAGE2.z) < 2.8 || Math.hypot(p.x - BR2.x, p.z - BR2.z) < 1.6) continue;
    SLOTS.push({ x: p.x, z: p.z, item: null, idx: SLOTS.length });
  }
  SLOTS.forEach(s => { const m = new THREE.Mesh(G.cyl(0.12, 0.12, 0.02, 8), G.M('#ffffff', { transparent: true, opacity: 0.7 })); m.position.set(s.x, PADY + 0.03, s.z); slotMarks.add(m); s.mark = m; });
}

// ---- lineup pilih tokoh (jauh di samping) ----
const LO = 60;
function buildLineup() {
  G.setParent(lineupG);
  G.pad(LO, 0, 5.2, -Math.PI / 2 + 0.3);
  G.lotus(LO - 4.6, -3.8, 1.3, 0.05); G.lotus(LO + 5.2, -3.2, 1.1, 0.05);
  G.cattail(LO - 5.6, -2.0, 3.2, 0.1); G.cattail(LO + 5.8, -1.0, 2.8, -0.1); G.reeds(LO - 6.2, -1, 8, 2); G.reeds(LO + 6.4, -2, 7, 5);
  G.smallPad(LO - 6.5, 3, 1.2, 1); G.smallPad(LO + 6.8, 2.6, 1.0, 0);
  G.inGroup(LO, -3.6, () => G.stall(0, 0, 'klepon', 'kelopak'));
  lineupHeroes.tiko = G.heroOtter(LO - 2.9, 0.5, 3.5); lineupHeroes.tiko.rotation.y = 0.2;
  lineupHeroes.bebi = G.heroDuck(LO, 0.7, 3.5);
  lineupHeroes.lumi = G.heroFrog(LO + 2.9, 0.5, 3.5); lineupHeroes.lumi.rotation.y = -0.2;
}
const lineupHeroes = {};

// ================= kamera =================
const CAMS = {
  venue: { tx: 2.0, tz: -0.6, yaw: -0.127, pitch: 0.8, dist: 37 },
  judul: { tx: 0, tz: 1.0, yaw: 0, pitch: 0.667, dist: 28 },
  lineup: { tx: LO, tz: 0.2, yaw: 0, pitch: 0.482, dist: 17.3, ty: -0.5 },
  cerita: { tx: 0.4, tz: 4.0, yaw: 0.85, pitch: 0.42, dist: 9.0, ty: 0.7 },
};
CAMS.venue2 = { tx: 7.2, tz: -0.6, yaw: -0.08, pitch: 0.86, dist: 44 };
const camS = { tx: 0, ty: 0, tz: 0, yaw: 0, pitch: 0.7, dist: 25 };
let camGoal = null;
function setCam(name, instant = true) {
  const c = Object.assign({ ty: 0 }, CAMS[name]);
  camGoal = c; if (instant) { Object.assign(camS, c); applyCam(); }
}
function applyCam() {
  if (camGoal) for (const k of ['tx', 'ty', 'tz', 'yaw', 'pitch', 'dist']) camS[k] += (camGoal[k] - camS[k]) * 0.12;
  const cp = Math.cos(camS.pitch);
  cam.position.set(camS.tx + Math.sin(camS.yaw) * cp * camS.dist, camS.ty + Math.sin(camS.pitch) * camS.dist, camS.tz + Math.cos(camS.yaw) * cp * camS.dist);
  cam.lookAt(camS.tx, camS.ty, camS.tz);
  cam.updateMatrixWorld();
}
function project(x, y, z) { const v = new THREE.Vector3(x, y, z).project(cam); return { x: (v.x + 1) / 2 * W, y: (1 - v.y) / 2 * H, vis: v.z < 1 }; }

// ================= UI helpers =================
function el(html, cls, style, parent = UI) { const d = document.createElement('div'); if (cls) d.className = cls; if (style) d.style.cssText = style; d.innerHTML = html; parent.appendChild(d); return d; }
function clearUI() { UI.innerHTML = ''; anchors.length = 0; }
const anchors = []; // elemen DOM yang mengikuti posisi 3D
function anchor(elm, getPos, dy = 0) { const a = { el: elm, getPos, dy }; anchors.push(a); placeAnchor(a); return a; }
function placeAnchor(a) { const p = a.getPos(); if (!p) return; const q = project(p.x, p.y, p.z); a.el.style.left = q.x + 'px'; a.el.style.top = (q.y + a.dy) + 'px'; }
function unanchor(elm) { const i = anchors.findIndex(a => a.el === elm); if (i >= 0) anchors.splice(i, 1); elm.remove(); }
const CICI_SVG = '<svg width="76" height="64" viewBox="0 0 84 70"><ellipse cx="26" cy="22" rx="22" ry="8" fill="#bfefff" opacity=".9" transform="rotate(-15 26 22)"/><ellipse cx="58" cy="22" rx="22" ry="8" fill="#bfefff" opacity=".9" transform="rotate(15 58 22)"/><ellipse cx="28" cy="36" rx="18" ry="6" fill="#d9f6ff" opacity=".9" transform="rotate(12 28 36)"/><ellipse cx="56" cy="36" rx="18" ry="6" fill="#d9f6ff" opacity=".9" transform="rotate(-12 56 36)"/><rect x="38" y="24" width="8" height="40" rx="4" fill="#3fb6a8"/><circle cx="42" cy="20" r="9" fill="#3fb6a8"/><circle cx="38" cy="18" r="3.4" fill="#fff"/><circle cx="46" cy="18" r="3.4" fill="#fff"/><circle cx="38.5" cy="18.5" r="1.6" fill="#222"/><circle cx="46.5" cy="18.5" r="1.6" fill="#222"/></svg>';
function asisten() { return NF.HEROES[S.hero || 'tiko'].asisten === 'cici' ? { nama: 'Capung Cici', face: CICI_SVG } : { nama: 'Kiko', face: '🐸' }; }
let helperEl = null, helperTimer = null;
function helper(text, ms) {
  if (!helperEl || !helperEl.isConnected) helperEl = el(`<div class="face">${asisten().face}</div><div class="say"></div>`, 'helper');
  helperEl.querySelector('.say').innerHTML = text || '';
  clearTimeout(helperTimer);
  if (ms) helperTimer = setTimeout(() => { if (helperEl) helperEl.querySelector('.say').innerHTML = ''; }, ms);
}
function modal(html, buttons) {
  return new Promise(res => {
    const dim = el('', 'dim');
    const m = el(`<div>${html}</div><div class="row2"></div>`, 'modal');
    buttons.forEach(([label, cls, val]) => { const b = document.createElement('button'); b.className = 'btn ' + (cls || ''); b.innerHTML = label; b.onclick = () => { A.sfx('tap'); dim.remove(); m.remove(); res(val); }; m.querySelector('.row2').appendChild(b); });
  });
}
function popAt(x, y, z, text) { const d = el(text, 'pop'); const q = project(x, y, z); d.style.left = q.x + 'px'; d.style.top = q.y + 'px'; setTimeout(() => d.remove(), 1000); }

// ================= keadaan permainan =================
const S = window.NF.S = {
  screen: 'loading', hero: SAVE.hero, hearts: {},
  placed: [], musik: false, spent: 0,
};
const heroM = { obj: null };
function costOf(kind) {
  const it = NF.ITEMS[kind]; let c = it.harga;
  if (S.hero === 'tiko' && (it.cat === 'lapak' || kind === 'bangku')) c = Math.max(1, c - 1);
  return c;
}
const kas = () => LV.modal - S.spent;
const JUAL = 2;   // harga jual 1 porsi
const DEMAND = { 1: 0.8, 2: 1.6, 3: 2.6 };   // seberapa banyak tamu memilih jajanan menurut ❤
const stallW = s => DEMAND[S.hearts[s.kind] || 1] * Math.max(0.4, 1 + 0.15 * s.place);
const bahanOf = n => (NF.PORSI.find(p => p[0] === n) || NF.PORSI[1])[1];
function countKind(k) { return S.placed.filter(p => p.kind === k).length; }
function lapakList(list = S.placed) { return list.filter(p => NF.ITEMS[p.kind].cat === 'lapak'); }

// ---- penilaian tata letak (perkiraan tamu) ----
const BASE_TAMU = 4;
function heartsBonus(k) { const h = S.hearts[k] || 1; return h === 3 ? 2 : h === 2 ? 1 : 0; }
function itemPts(it, all) {
  const R = []; let p = 0;
  const lapaks = all.filter(o => o !== it && NF.ITEMS[o.kind].cat === 'lapak');
  const near = (r) => lapaks.some(o => dist(o, it) <= r);
  switch (NF.ITEMS[it.kind].cat) {
    case 'lapak': {
      const rk = ((it.rotK || 0) % 4 + 4) % 4;
      if (rk === 0) { p += 1; R.push(['+1', 'menghadap tamu']); }
      else if (rk === 2) { p -= 1; R.push(['−1', 'membelakangi tamu']); }
      else R.push(['+0', 'menghadap ke samping']);
      const hb = heartsBonus(it.kind); if (hb) { p += hb; R.push(['+' + hb, 'jajanan disukai ' + '❤'.repeat(S.hearts[it.kind])]); }
      if (dist(it, CENTER) <= 3.4) { p += 1; R.push(['+1', 'dekat tugu embun']); }
      if (LV.id === 2 && dist(it, STAGE2) <= 4.2) { p += 1; R.push(['+1', 'dekat panggung']); }
      if (LV.malam) { if (isLit(it, all)) R.push(['+0', 'terang ✨']); else { p -= 2; R.push(['−2', 'gelap, tamu takut']); } }
      if (dist(it, GATE) <= 3.8) { p += 1; R.push(['+1', 'dekat gerbang']); }
      const crowd = lapaks.filter(o => dist(o, it) <= 2.4).length;
      if (crowd) { p -= crowd; R.push(['−' + crowd, 'terlalu dekat lapak lain']); }
      break;
    }
    default:
      if (it.kind === 'bangku' || it.kind === 'sampah') {
        if (near(3.4)) { p += 1; R.push(['+1', it.kind === 'bangku' ? 'tamu bisa duduk dekat lapak' : 'dekat lapak, sampah tidak berserakan']); }
        else R.push(['+0', 'terlalu jauh dari lapak']);
      } else if (it.kind === 'talas') { p += 1; R.push(['+1', 'tempat berteduh']); }
      else if (it.kind === 'info') { p += 1; R.push(['+1', 'pos informasi']); }
      else if (it.kind === 'poster') { p += 2; R.push(['+2', 'promosi']); }
      else if (it.kind === 'lampion') { R.push(['+0', 'menerangi sekitar']); }
  }
  return { p, R };
}
function evaluate(list) {
  let total = (LV.base || BASE_TAMU) + (S.musik ? NF.ITEMS.musik.tamu : 0) + (S.kembang ? NF.ITEMS.kembangapi.tamu : 0);
  const per = new Map();
  for (const it of list) { const r = itemPts(it, list); per.set(it, r); total += r.p; }
  return { total: Math.max(0, total), per };
}

// ================= model barang =================
const ROOFS = { klepon: 'kelopak', putu: 'daun', lemper: 'talas', serabi: 'keringdaun', cendol: 'kelopak', getuk: 'kelopak', cincin: 'keringdaun', gemblong: 'daun', tehtarik: 'keringdaun', wedang: 'talas' };
function posterBoard() {
  G.twig(0, 0, 0, 0, 1.1, 0, 0.04);
  const b = G.add(G.box(0.9, 0.6, 0.06), G.M('#9ed36f'), 0, 1.15, 0); b.rotation.z = 0.04;
  G.add(G.box(0.74, 0.44, 0.065), G.M('#fff6dc'), 0, 1.15, 0.005);
  const sp = G.sprite('🎉', 0, 1.15, 0.06, 0.4, '#ffc94a', null);
}
function itemRot(x, z, rotK = 0) { const c = onPad2({ x, z }) ? PAD2 : CENTER; return Math.atan2(c.x - x, c.z - z) + rotK * Math.PI / 2; }
function buildItem(kind, x, z, ghost = false, rotK = 0) {
  const rot = itemRot(x, z, rotK);
  const g = G.inGroup(x, z, () => {
    if (NF.ITEMS[kind].cat === 'lapak') G.stall(0, 0, kind, ROOFS[kind], rot, false);
    else if (kind === 'bangku') G.logBench(0, 0, rot + Math.PI / 2);
    else if (kind === 'sampah') G.basketBin(0, 0, false);
    else if (kind === 'talas') G.taroUmbrella(0, 0, 1.3);
    else if (kind === 'info') G.infoShell(0, 0);
    else if (kind === 'poster') posterBoard();
    else if (kind === 'lampion') { const cur = G.setParent(null); G.setParent(cur); lampionModel(0, 0, cur, true); }
  }, dyn);
  if (!(NF.ITEMS[kind].cat === 'lapak' || kind === 'bangku')) g.rotation.y = rot;
  if (ghost) g.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.5; o.material.depthWrite = false; } if (o.isMesh) o.castShadow = false; });
  g.userData.kind = kind;
  return g;
}
let musicianObj = null;
function setMusician(on) {
  if (musicianObj) { actors.remove(musicianObj); musicianObj = null; }
  if (on) { musicianObj = new THREE.Group(); actors.add(musicianObj); G.setParent(musicianObj); G.critter('kodok', STAGE.x, PADY + 0.5, STAGE.z, 2.2, musicianObj); G.critter('bebek', STAGE.x - 0.8, PADY + 0.5, STAGE.z + 0.4, 1.8, musicianObj); }
}
function placeHero(x, z, ry = 0.4) {
  if (heroM.obj) actors.remove(heroM.obj);
  G.setParent(actors);
  const f = { tiko: G.heroOtter, bebi: G.heroDuck, lumi: G.heroFrog }[S.hero || 'tiko'];
  heroM.obj = f(x, z, 2.2); heroM.obj.rotation.y = ry;
}

// ================= input sentuh =================
const ray = new THREE.Raycaster(), groundPlane = new THREE.Plane(new THREE.Vector3(0, 1, 0), -PADY);
function toStage(e) { const r = stage.getBoundingClientRect(); return { x: (e.clientX - r.left) / scale, y: (e.clientY - r.top) / scale }; }
function rayFrom(p) { ray.setFromCamera(new THREE.Vector2(p.x / W * 2 - 1, -(p.y / H * 2 - 1)), cam); return ray; }
function groundAt(p) { const v = new THREE.Vector3(); return rayFrom(p).ray.intersectPlane(groundPlane, v) ? v : null; }
const pointers = new Map(); let gesture = null;
cv.addEventListener('pointerdown', e => {
  cv.setPointerCapture(e.pointerId);
  const p = toStage(e); pointers.set(e.pointerId, p);
  if (pointers.size === 2) { const [a, b] = [...pointers.values()]; gesture = { type: 'pinch', d0: Math.hypot(a.x - b.x, a.y - b.y), dist0: camS.dist }; return; }
  gesture = { type: 'pan', x0: p.x, y0: p.y, yaw0: camS.yaw, moved: false };
  if (S.screen === 'tata' && T.ghost) { gesture.type = 'ghost'; moveGhostTo(p); }
});
cv.addEventListener('pointermove', e => {
  if (!pointers.has(e.pointerId)) return;
  const p = toStage(e); pointers.set(e.pointerId, p);
  if (!gesture) return;
  if (gesture.type === 'pinch' && pointers.size === 2) {
    const [a, b] = [...pointers.values()]; const d = Math.hypot(a.x - b.x, a.y - b.y);
    camS.dist = camGoal.dist = Math.max(18, Math.min(46, gesture.dist0 * gesture.d0 / d));
  } else if (gesture.type === 'ghost') moveGhostTo(p);
  else if (gesture.type === 'pan') {
    const dx = p.x - gesture.x0; if (Math.abs(dx) + Math.abs(p.y - gesture.y0) > 12) gesture.moved = true;
    if (gesture.moved && (S.screen === 'tata' || S.screen === 'festival')) camS.yaw = camGoal.yaw = Math.max(-0.9, Math.min(0.7, gesture.yaw0 - dx * 0.004));
  }
});
function endPointer(e) {
  if (!pointers.has(e.pointerId)) return;
  const p = pointers.get(e.pointerId); pointers.delete(e.pointerId);
  if (gesture && gesture.type === 'pan' && !gesture.moved && pointers.size === 0) onTap(p);
  if (pointers.size === 0) gesture = null;
}
cv.addEventListener('pointerup', endPointer); cv.addEventListener('pointercancel', endPointer);
function onTap(p) {
  if (S.screen === 'judul') return goTokoh();
  if (S.screen === 'tata' && !T.ghost) {
    const hits = rayFrom(p).intersectObjects(dyn.children, true);
    if (hits.length) { let o = hits[0].object; while (o && o.parent !== dyn) o = o.parent; const it = S.placed.find(q => q.group === o); if (it) return selectPlaced(it); }
    closeItemMenu();
  }
}

// ================= layar: judul =================
let demo = [];
function screenJudul() {
  setLevel(1);
  S.screen = 'judul'; document.body.className = 's-judul'; clearUI(); setCam('judul');
  clearDyn(); resetActors();
  // dekorasi festival contoh
  const demoItems = [['putu', -4.4, -3.2], ['tehtarik', 0, -4.6], ['serabi', 4.4, -3.2], ['getuk', -5.4, 1.2], ['klepon', 5.4, 1.2], ['wedang', -3.4, 4.6], ['cendol', 4.2, 4.4]];
  demoItems.forEach(([k, x, z]) => demo.push(buildItem(k, x, z)));
  demo.push(buildItem('info', -6.0, -2.6), buildItem('talas', 6.0, -1.8), buildItem('sampah', -2.6, -2.0));
  for (let k = 0; k < 34; k++) spawnDecorCritter();
  G.setParent(actors);
  G.heroOtter(-1.6, 5.4, 2.4).rotation.y = 0.3; G.heroDuck(0.3, 6.0, 2.4); G.heroFrog(2.2, 5.6, 2.4).rotation.y = -0.3;
  el(`<div class="l1">Njajan</div><div class="l2">Fest</div><div class="sub">Pesta jajanan di Kerajaan Telaga</div>`, 'logo');
  const b = el('<button class="btn" style="font-size:28px;padding:14px 34px">▶ Ketuk untuk mulai</button>', '', 'position:absolute;left:50%;bottom:40px;transform:translateX(-50%)');
  b.querySelector('button').onclick = goTokoh;
  el('versi ' + NF.VERSION, 'ver');
  const sb = el('<button class="btn kuning">📒 Buku Stiker</button>', '', 'position:absolute;right:20px;bottom:40px'); sb.querySelector('button').onclick = () => { A.unlock(); A.sfx('tap'); bukuStiker(); };
}
function goTokoh() { A.unlock(); A.sfx('tap'); A.music(true); screenTokoh(); }
function spawnDecorCritter() {
  const kinds = Object.keys(G.CR); const a = Math.random() * 6.28, d = 2.2 + Math.random() * 5.0;
  const x = Math.cos(a) * d, z = Math.sin(a) * d;
  const c = G.critter(pick(kinds), x, PADY, z, 1.7, actors); c.rotation.y = Math.random() * 6.28;
  c.userData.bob = Math.random() * 6;
}
function clearDyn() { while (dyn.children.length) dyn.remove(dyn.children[0]); demo = []; }
function resetActors() { while (actors.children.length) actors.remove(actors.children[0]); while (fx.children.length) fx.remove(fx.children[0]); heroM.obj = null; musicianObj = null; }

// ================= layar: pilih tokoh =================
function screenTokoh() {
  setLevel(1);
  S.screen = 'tokoh'; document.body.className = 's-tokoh'; clearUI(); setCam('lineup'); sunAt(LO, 0);
  el(`<b>Pilih tokohmu</b><small>Tiap tokoh punya kekuatan berbeda. Coba semuanya!</small>`, 'card title');
  const ids = ['tiko', 'bebi', 'lumi'], xs = [LO - 2.9, LO, LO + 2.9];
  let chosen = S.hero;
  const cards = ids.map((id, k) => {
    const h = NF.HEROES[id]; const best = bestOf(id, 1), best2 = bestOf(id, 2);
    const c = el(`<b>${h.nama}</b><span class="role" style="background:${h.warna}">${h.julukan}</span><div class="pw">${h.bakat}</div><div class="pw jur">${h.jurusTeks}</div><em>${h.jago}</em><div class="bintang"><small>T1</small> ${'⭐'.repeat(best)}${'<span style="opacity:.25">⭐</span>'.repeat(3 - best)}${tahap2Open() ? ` &nbsp;<small>T2</small> ${'⭐'.repeat(best2)}${'<span style="opacity:.25">⭐</span>'.repeat(3 - best2)}` : ''}</div>`, 'opt' + (chosen === id ? ' sel' : ''));
    c.style.left = (215 + k * 375) + 'px';
    c.onclick = () => { A.sfx('tap'); chosen = id; cards.forEach(x => x.classList.remove('sel')); c.classList.add('sel'); go.disabled = false; hop = lineupHeroes[id]; };
    return c;
  });
  const gw = el('<button class="btn" style="font-size:26px">Pilih ▶</button>', '', 'position:absolute;right:24px;bottom:20px');
  const go = gw.querySelector('button'); go.disabled = !chosen;
  go.onclick = () => { if (!chosen) return; A.sfx('good'); S.hero = SAVE.hero = chosen; save(); if (!SAVE.cerita) screenCerita(); else screenPeta(); };
  const sb = el('<button class="btn kuning">📒 Buku Stiker</button>', '', 'position:absolute;left:24px;bottom:20px'); sb.querySelector('button').onclick = () => { A.sfx('tap'); bukuStiker(); };
}
let hop = null;

// ================= layar: cerita Raja =================
let kingObj = null;
function screenCerita() {
  setLevel(1);
  S.screen = 'cerita'; document.body.className = 's-cerita'; clearUI(); clearDyn(); resetActors(); sunAt(1, -1); setCam('cerita');
  G.setParent(actors); kingObj = G.king(GATE.x - 0.3, GATE.z - 2.9, 2.6); kingObj.rotation.y = 0.55;
  placeHero(GATE.x + 0.6, GATE.z - 3.6, 0.6);
  const lines = [
    'Halo, Penata Pesta cilik! Aku <b>Raja Kura-kura</b> dari Kerajaan Telaga.',
    'Warga telaga ingin pesta jajanan di atas <b>daun teratai raksasa</b>. Namanya <b>Bazar Daun Teratai</b>!',
    `Tugasmu: datangkan <b>${LV.targetTamu} tamu</b> dan dapatkan <b>untung ${LV.targetUntung} koin</b>. Modalmu <b>${LV.modal} koin</b>.`,
    `${asisten().nama} akan membantumu. Selamat bekerja!`,
  ];
  let i = 0;
  const d = el('', 'dialog');
  const show = () => {
    d.innerHTML = `<div class="who"><span class="face">👑</span>Raja Kura-kura</div>${lines[i]}<div class="nx"><button class="btn">${i < lines.length - 1 ? 'Lanjut ▶' : 'Siap! ▶'}</button></div>`;
    d.querySelector('button').onclick = () => { A.sfx('tap'); i++; if (i < lines.length) show(); else { SAVE.cerita = true; save(); screenPeta(); } };
  };
  show();
}

function screenCerita2() {
  S.screen = 'cerita'; document.body.className = 's-cerita'; clearUI(); clearDyn(); resetActors(); sunAt(1, -1); setCam('cerita'); setNight(0.85);
  G.setParent(actors); kingObj = G.king(GATE.x - 0.3, GATE.z - 2.9, 2.6); kingObj.rotation.y = 0.55;
  placeHero(GATE.x + 0.6, GATE.z - 3.6, 0.6);
  const lines = [
    'Hebat! Bazar Daun Teratai sukses. Sekarang warga ingin <b>Pasar Malam Kunang-kunang</b>! 🌙',
    `Ada <b>dua daun</b> yang disambung jembatan ranting. Targetnya <b>${LV.targetTamu} tamu</b> dan <b>untung ${LV.targetUntung} koin</b>.`,
    'Malam itu gelap. Tamu tidak mau ke lapak yang gelap — pasang <b>lampion</b> 🏮 ya!',
    'Dan jangan lupa: kembang api hanya indah kalau langit sudah gelap 🎆',
  ];
  let i = 0; const d = el('', 'dialog');
  const show = () => {
    d.innerHTML = `<div class="who"><span class="face">👑</span>Raja Kura-kura</div>${lines[i]}<div class="nx"><button class="btn">${i < lines.length - 1 ? 'Lanjut ▶' : 'Siap! ▶'}</button></div>`;
    d.querySelector('button').onclick = () => { A.sfx('tap'); i++; if (i < lines.length) show(); else { SAVE.cerita2 = true; save(); screenPapan(); } };
  };
  show();
}

// ================= layar: papan persiapan =================
function rollHearts() {
  const vals = [...NF.HEARTS].sort(() => Math.random() - 0.5);
  S.hearts = {}; NF.LAPAK.forEach((k, i) => S.hearts[k] = vals[i]);
}
function screenPapan() {
  S.screen = 'papan'; document.body.className = 's-papan'; clearUI(); resetActors(); clearDyn(); sunAt(1, -1); setCam(LV.id === 2 ? 'venue2' : 'venue');
  S.placed = []; S.musik = false; S.kembang = false; S.spent = 0; SLOTS.forEach(s => s.item = null);
  S.tamuIst = pick(Object.keys(NF.TAMU_IST));
  rollHearts();
  el('', 'dim');
  el(`<div class="pill" style="position:static;display:inline-flex">📋 Papan Persiapan · ${LV.nama}</div>`, '', 'position:absolute;left:134px;top:14px');
  el(`<div class="pill" style="position:static;display:inline-flex">👛 Modal ${LV.modal} 🪙</div>`, '', 'position:absolute;right:22px;top:14px');
  const order = [...NF.LAPAK].sort((a, b) => S.hearts[b] - S.hearts[a]);
  const wish = order.map(k => `<div class="r"><img src="${G.foodURL(k, 72)}">${NF.ITEMS[k].nama}<small class="hg">${costOf(k)}🪙</small><span class="h">${'❤️'.repeat(S.hearts[k])}</span></div>`).join('');
  const ti = NF.TAMU_IST[S.tamuIst];
  const tiImg = portrait(TI_COL[S.tamuIst], S.tamuIst === 'nenek' ? x => { x.strokeStyle = '#555'; x.lineWidth = 3; x.beginPath(); x.arc(49, 44, 10, 0, 7); x.moveTo(81, 44); x.arc(71, 44, 10, 0, 7); x.stroke(); } : S.tamuIst === 'bangau' ? x => { x.fillStyle = '#ff9a3a'; x.beginPath(); x.moveTo(60, 52); x.lineTo(96, 58); x.lineTo(60, 62); x.fill(); } : null);
  el(`
    <div class="col wish"><h3>📋 Hasil tanya warga</h3><div style="font-size:15px;font-weight:700;color:#6b7b84;margin-bottom:6px">Jajanan yang paling disukai warga telaga:</div>${wish}
      <div class="mini">💡 ❤❤❤ = banyak yang beli → bawa porsi banyak. ❤ = sedikit yang beli → cukup porsi sedikit.</div></div>
    <div class="col"><h3>🎯 Target festival</h3>
      <div class="mini" style="margin-top:0;font-size:19px">🐸 Datangkan <b>${LV.targetTamu} tamu</b></div>
      <div class="mini" style="font-size:19px">🪙 Dapatkan <b>untung ${LV.targetUntung}</b></div>
      <div class="mini" style="font-size:19px">😊 Buat tamu <b>senang</b></div>
      <div class="mini">👛 Modalmu <b>${LV.modal} 🪙</b> untuk sewa lapak, bahan jajanan & hiasan. Setiap jajan laku = <b>+2 🪙</b>.</div></div>
    <div class="col"><h3>🌦️ Ramalan & persiapan</h3>
      ${LV.malam ? '<div class="mini" style="margin-top:0">🌙 <b>Pasar malam!</b> Hari makin gelap. Pasang lampion 🏮 di dekat lapak.</div><div class="mini">🤕 Jalan malam licin, kadang ada tamu terjatuh.</div>' : '<div class="mini" style="margin-top:0">🌧️ <b>Sore nanti hujan sebentar.</b> Siapkan tempat berteduh!</div>'}
      <div class="mini">👫 Teman relawan siap membantu. <b>Seret</b> mereka ke masalah saat festival!</div>
      <div class="tamuis"><img src="${tiImg}" style="width:64px;height:64px"><div><b>⭐ Tamu istimewa</b><br>${ti.ikon} <b>${ti.nama}</b> butuh <b>${ti.butuh}</b>.</div></div></div>`, 'board');
  const nv = el('<button class="btn">Mulai menata ▶</button>', 'nav'); nv.querySelector('button').onclick = () => { A.sfx('tap'); screenTata(); };
  helper('Baca hasil tanya warga, target, dan tamu istimewa. Lalu mulai menata!');
}
function portrait(col, extra) {
  const c = document.createElement('canvas'); c.width = c.height = 120; const x = c.getContext('2d');
  x.fillStyle = col; x.beginPath(); x.arc(60, 80, 34, 0, 7); x.fill(); x.beginPath(); x.arc(60, 48, 30, 0, 7); x.fill();
  x.fillStyle = '#fff'; x.beginPath(); x.arc(49, 44, 8, 0, 7); x.arc(71, 44, 8, 0, 7); x.fill();
  x.fillStyle = '#222'; x.beginPath(); x.arc(50, 45, 4, 0, 7); x.arc(72, 45, 4, 0, 7); x.fill();
  x.fillStyle = 'rgba(255,120,140,.6)'; x.beginPath(); x.arc(38, 58, 5, 0, 7); x.arc(82, 58, 5, 0, 7); x.fill();
  extra && extra(x); return c.toDataURL();
}
const TI_COL = { nenek: '#a9d474', berudu: '#7fcf6a', bangau: '#f2f2ec' };
// ================= layar: peta kerajaan =================
const MO = -70; const mapG = new THREE.Group(); scene.add(mapG);
function buildMap() {
  G.setParent(mapG);
  G.pad(MO - 9, 3, 4.2, 1.2); G.inGroup(MO - 9, 3, () => { G.stall(-1.2, -0.6, 'klepon', 'kelopak', 0.3); G.stall(1.4, 0.2, 'putu', 'daun', -0.4); G.dewdrop(0.2, 1.6, 0.8); });
  G.pad(MO + 1, -2, 4.6, 2.2); G.pad(MO + 6.4, -2.6, 2.6, 0.4); G.twigBridge([MO + 5.2, -2.2], [MO + 4.8, -2.3]);
  G.pad(MO + 11.5, 4.5, 4.6, 3.6); G.pad(MO + 16, 3.5, 3, 1);
  [[MO - 14, -4], [MO - 3, 6], [MO + 7, 8], [MO + 15, -4]].forEach(([x, z], k) => { G.reeds(x, z, 6, k + 50); G.lotus(x + 1.5, z + 0.5, 1.0, 0.05); });
}
CAMS.peta = { tx: MO + 2.5, tz: 1.5, yaw: 0, pitch: 0.86, dist: 50 };
function screenPeta() {
  setLevel(1);
  S.screen = 'peta'; document.body.className = 's-peta'; clearUI(); setCam('peta'); sunAt(MO + 2, 0);
  el(`<b>🗺️ Kerajaan Telaga</b><small>Pilih festival</small>`, 'card title');
  const card = (x, z, html, cls, fn) => { const p = project(x, 0, z); const d = el(html, 'tcard ' + cls, `left:${p.x}px;top:${p.y + 50}px`); if (fn) { d.classList.add('tap'); d.onclick = fn; } return d; };
  const L1 = NF.LEVELS[0], L2 = NF.LEVELS[1], b1 = bestOf(S.hero, 1), b2 = bestOf(S.hero, 2), st = n => `${'⭐'.repeat(n)}${'☆'.repeat(3 - n)}`;
  card(MO - 9, 3, `<b>1 · ${L1.nama}</b><small>siang · ${L1.targetTamu} tamu</small><div class="st">${st(b1)}</div><div class="btn" style="font-size:18px;padding:6px 18px;margin-top:6px">Main ▶</div>`, '', () => { A.sfx('good'); setLevel(1); screenPapan(); });
  if (tahap2Open()) card(MO + 1, -2, `<b>2 · ${L2.nama}</b><small>malam · ${L2.targetTamu} tamu · 2 daun · lampion</small><div class="st">${st(b2)}</div><div class="btn" style="font-size:18px;padding:6px 18px;margin-top:6px">Main ▶</div>`, '', () => { A.sfx('good'); setLevel(2); if (!SAVE.cerita2) screenCerita2(); else screenPapan(); });
  else card(MO + 1, -2, `<b>🔒 2 · ${L2.nama}</b><small>malam · ${L2.targetTamu} tamu · 2 daun</small><small>Selesaikan Tahap 1 dulu (⭐ 1)</small>`, 'lock', () => helper('Selesaikan Bazar Daun Teratai dulu, minimal ⭐ 1, ya!', 3000));
  card(MO + 11.5, 4.5, `<b>🔒 3 · Festival Sungai Pelangi</b><small>segera hadir</small>`, 'lock');
  const bk = el('<button class="btn abu" style="font-size:18px;padding:8px 16px">◀ Ganti tokoh</button>', '', 'position:absolute;left:136px;top:14px'); bk.querySelector('button').onclick = () => { A.sfx('tap'); screenTokoh(); };
  const sb = el('<button class="btn kuning">📒 Buku Stiker</button>', '', 'position:absolute;right:24px;bottom:20px'); sb.querySelector('button').onclick = () => { A.sfx('tap'); bukuStiker(); };
  helper(`Halo ${NF.HEROES[S.hero].nama.split(' ')[0]}! Pilih festival yang mau kamu atur.`);
}

// ================= buku stiker =================
const HERO_IKON = { tiko: '🦦', bebi: '🦆', lumi: '🐸' };
function bukuStiker() {
  const wrap = el('', '', 'position:absolute;inset:0;pointer-events:auto;z-index:7'); wrap.className = 'bukuwrap';
  const rows = ['tiko', 'bebi', 'lumi'].map(h => {
    const cells = [1, 2, 3].map(t => { const v = SAVE.stk[`${h}-${t}`]; return `<div class="stk ${v === 'emas' ? '' : v === 'perak' ? 'silver' : 'off'}">${HERO_IKON[h]}<span class="t">Tahap ${t}${v ? (v === 'emas' ? ' 🥇' : ' 🥈') : ''}</span></div>`; }).join('');
    return `<div class="row"><div class="h"><img src="${portrait(G.CR[{ tiko: 'berang', bebi: 'bebek', lumi: 'kodok' }[h]])}">${NF.HEROES[h].nama.split(' ')[0]}</div>${cells}</div>`;
  }).join('');
  const sp = NF.STIKER.map(([id, e, n]) => `<div class="stk ${SAVE.stk[id] ? '' : 'off'}">${e}<span class="t">${n}</span></div>`).join('');
  wrap.innerHTML = `<div class="dim" style="pointer-events:auto"></div><div class="book"><div class="pg"><h3>📒 Stiker Tokoh</h3>${rows}<div style="font-size:15px;font-weight:800;color:#8a7458">🥇 emas = ⭐⭐⭐ · 🥈 perak = ⭐ atau ⭐⭐</div></div>
    <div class="pg"><h3>🌟 Stiker Spesial</h3><div class="grid2">${sp}</div></div></div>
    <button class="btn abu" style="position:absolute;right:76px;top:24px">✖ Tutup</button>`;
  wrap.querySelector('button').onclick = () => { A.sfx('tap'); wrap.remove(); };
}

// ================= layar: menata =================
const T = { tab: 'kue', ghost: null, menu: null };
function screenTata() {
  S.screen = 'tata'; document.body.className = 's-tata'; clearUI(); setCam(LV.id === 2 ? 'venue2' : 'venue', false); sunAt(1, -1);
  if (!heroM.obj) placeHero(-1.8, 4.8, 0.4);
  T.ghost = null; T.menu = null; slotMarks.visible = true;
  renderTata();
  helper(`Pilih kartu di bawah, lalu geser ke tempat yang angkanya <b>+</b> paling besar!`);
}
function tataHud() {
  [...UI.querySelectorAll('.tata-hud')].forEach(x => x.remove());
  const cur = evaluate(S.placed).total;
  const prev = T.ghost ? evaluate(previewList()).total : cur;
  const box = el('', 'tata-hud');
  el(`<small>Festival ${LV.id} · Kerajaan Telaga</small><b>${LV.nama}</b>`, 'lv', '', box);
  el(`<b>${prev}<span> / ${LV.targetTamu}</span></b><small>🐸 perkiraan tamu ${T.ghost && prev !== cur ? `(${prev > cur ? '+' : ''}${prev - cur})` : ''}</small><div class="nb"><i style="width:${Math.min(100, prev / LV.targetTamu * 100)}%"></i></div>`, 'score' + (prev >= LV.targetTamu ? ' ok' : ''), '', box);
  el(`<div class="pill">👛 Kas <b>${kas()}</b> 🪙</div><div class="pill" style="font-size:16px">🎯 Target untung ${LV.targetUntung} 🪙</div>`, 'hud-r', '', box);
  // daftar cek
  const lap = lapakList().length, need = Math.ceil(LV.targetTamu / LV.porsi);
  const binOk = S.placed.some(p => p.kind === 'sampah' && lapakList().some(l => dist(l, p) <= 3.4));
  const rows = [
    [lap >= need, `Lapak jajanan ${lap}/${need}`],
    [true, 'Jalan masuk tetap lega'],
    [binOk, 'Keranjang sampah dekat lapak'],
    ...(LV.malam ? [] : [[countKind('talas') > 0, 'Tempat berteduh (sore hujan)']]),
    [countKind('info') > 0, 'Pos informasi (anak hilang)'],
    ...(LV.malam ? [[lapakList().length > 0 && lapakList().every(l => isLit(l)), 'Semua lapak terang 🏮']] : []),
    [prev >= LV.targetTamu, `Perkiraan tamu ≥ ${LV.targetTamu}`],
  ];
  T.rows = rows;
  el(`<h4>🔍 Cek ${asisten().nama}</h4>` + rows.map(([ok, t]) => `<div>${ok ? '✅' : '⬜'} ${t}</div>`).join(''), 'check', '', box);
}
function porsiBadges() {
  [...UI.querySelectorAll('.pbadge')].forEach(x => unanchor(x));
  if (S.screen !== 'tata') return;
  lapakList().forEach(it => { const b = el(`📦 ${it.porsi} porsi`, 'badge pbadge ' + (it.porsi === 3 ? 'low' : it.porsi === 8 ? 'ok' : '')); anchor(b, () => ({ x: it.x, y: PADY + 3.6, z: it.z })); });
}
function renderTata() {
  [...UI.querySelectorAll('.tabs,.tray,.go')].forEach(x => x.remove());
  porsiBadges();
  tataHud();
  const tabs = el(NF.TABS.filter(([id]) => id !== 'lampu' || LV.malam).map(([id, l]) => `<div class="tab ${T.tab === id ? 'on' : ''}" data-t="${id}">${l}</div>`).join(''), 'tabs');
  tabs.querySelectorAll('.tab').forEach(t => t.onclick = () => { A.sfx('tap'); T.tab = t.dataset.t; renderTata(); });
  const kinds = Object.keys(NF.ITEMS).filter(k => (NF.ITEMS[k].tab || NF.ITEMS[k].cat) === T.tab && (!NF.ITEMS[k].malam || LV.malam));
  const tray = el(kinds.map(k => {
    const it = NF.ITEMS[k], c = costOf(k), n = k === 'musik' ? (S.musik ? 1 : 0) : k === 'kembangapi' ? (S.kembang ? 1 : 0) : countKind(k);
    const full = it.cat === 'lapak' ? n >= 1 : (it.maks ? n >= it.maks : n >= 1);
    const ic = it.cat === 'lapak' ? `<img src="${G.foodURL(k, 96)}">` : it.ikon;
    const hearts = it.cat === 'lapak' ? `<span class="h">${'❤️'.repeat(S.hearts[k])}</span>` : '';
    const cnt = n ? `<span class="cnt">✔${n > 1 ? n : ''}</span>` : '';
    const price = c < it.harga ? `<s>${it.harga}</s> ${c}` : c;
    return `<div class="item ${T.ghost && T.ghost.kind === k ? 'sel' : ''} ${full && it.slot ? 'off' : ''}" data-k="${k}">${hearts}${cnt}<div class="e">${ic}</div><div class="n">${it.nama}</div><div class="p">${!it.slot && n ? 'terpasang' : price + (it.cat === 'lapak' ? ' 🪙 +bahan' : ' 🪙')}</div></div>`;
  }).join(''), 'tray');
  tray.querySelectorAll('.item').forEach(d => d.onclick = () => onCard(d.dataset.k));
  const gw = el('<button class="btn">Siap ✔</button>', 'go'); gw.querySelector('button').onclick = askStart;
  gw.style.display = T.ghost ? 'none' : '';
}
function onCard(k) {
  A.sfx('tap'); closeItemMenu();
  const it = NF.ITEMS[k];
  if (k === 'musik') {
    if (S.musik) { S.musik = false; S.spent -= costOf(k); setMusician(false); A.sfx('remove'); helper('Pemusik pulang dulu. Koin kembali.', 2500); }
    else if (kas() < costOf(k)) return helper('Kas tidak cukup 😅 Bongkar barang lain dulu, ya.', 3000);
    else { S.musik = true; S.spent += costOf(k); setMusician(true); A.sfx('place'); helper('🎵 Pemusik kodok tampil di panggung bunga! <b>+3 tamu</b>', 3000); }
    return renderTata();
  }
  if (k === 'kembangapi') {
    if (S.kembang) { S.kembang = false; S.spent -= costOf(k); A.sfx('remove'); helper('Kembang api dibatalkan. Koin kembali.', 2500); }
    else if (kas() < costOf(k)) return helper('Kas tidak cukup 😅 Bongkar barang lain dulu, ya.', 3000);
    else { S.kembang = true; S.spent += costOf(k); A.sfx('place'); helper('🎆 Kembang api akan dinyalakan saat langit sudah gelap! <b>+2 tamu</b>', 3000); }
    return renderTata();
  }
  if (T.ghost) cancelGhost();
  const n = countKind(k);
  if (it.cat === 'lapak' && n >= 1) return helper(`Lapak ${it.nama} sudah ada. Pilih jajanan lain biar tamu tidak bosan!`, 3500);
  if (it.maks && n >= it.maks) return helper(`${it.nama} sudah cukup (paling banyak ${it.maks}).`, 3000);
  if (kas() < costOf(k) + (it.cat === 'lapak' ? NF.PORSI[0][1] : 0)) return helper('Kas tidak cukup 😅 Bongkar barang lain dulu, ya.', 3000);
  const free = SLOTS.filter(s => !s.item);
  if (!free.length) return helper('Daun sudah penuh! Bongkar sesuatu dulu.', 3000);
  const start = free.sort((a, b) => dist(a, { x: 1.2, z: 3.6 }) - dist(b, { x: 1.2, z: 3.6 }))[0];
  startGhost(k, start);
}
function previewList() { const g = T.ghost; const list = S.placed.filter(p => p !== g.moving); return [...list, { kind: g.kind, x: g.slot.x, z: g.slot.z, rotK: g.rotK, ghost: true }]; }
function startGhost(kind, slot, moving = null) {
  T.ghost = { kind, slot, rotK: moving ? moving.rotK || 0 : 0, moving, porsi: moving ? moving.porsi : (S.hearts[kind] === 3 ? 8 : S.hearts[kind] === 2 ? 5 : 3) }; T.ghost.group = buildItem(kind, slot.x, slot.z, true, T.ghost.rotK);
  const disc = new THREE.Mesh(new THREE.CircleGeometry(3.4, 40), G.M('#ffffff', { transparent: true, opacity: 0.2, depthWrite: false }));
  disc.rotation.x = -Math.PI / 2; disc.position.y = PADY + 0.04;
  const ring = new THREE.Mesh(new THREE.TorusGeometry(3.4, 0.05, 3, 48), G.M('#ffffff')); ring.rotation.x = -Math.PI / 2; ring.position.y = PADY + 0.05;
  T.ghost.ring = new THREE.Group(); T.ghost.ring.add(disc, ring); T.ghost.ring.position.set(slot.x, 0, slot.z); fx.add(T.ghost.ring);
  renderTata(); ghostUI();
  helper(`Geser jarimu di daun untuk memindah. Lalu ketuk <b>✔ Taruh</b>.`);
}
function moveGhostTo(p) {
  const g = groundAt(p); if (!g || !T.ghost) return;
  let best = null, bd = 1e9;
  for (const s of SLOTS) { if (s.item && s.item !== T.ghost.moving) continue; const d = Math.hypot(s.x - g.x, s.z - g.z); if (d < bd) { bd = d; best = s; } }
  if (!best || bd > 2.8 || best === T.ghost.slot) return;
  T.ghost.slot = best; dyn.remove(T.ghost.group); T.ghost.group = buildItem(T.ghost.kind, best.x, best.z, true, T.ghost.rotK);
  T.ghost.ring.position.set(best.x, 0, best.z); A.sfx('tap'); ghostUI(); tataHud();
}
function ghostUI() {
  [...UI.querySelectorAll('.pt,.ghostbtn')].forEach(x => { const i = anchors.findIndex(a => a.el === x); if (i >= 0) anchors.splice(i, 1); x.remove(); });
  const g = T.ghost; if (!g) return;
  const list = previewList(), base = S.placed.filter(p => p !== g.moving);
  const withG = evaluate(list), without = evaluate(base);
  const me = withG.per.get(list[list.length - 1]);
  const delta = withG.total - without.total;
  const big = el(`${delta >= 0 ? '+' : ''}${delta}`, 'pt big' + (delta < 0 ? ' neg' : ''));
  anchor(big, () => ({ x: g.slot.x, y: PADY + 3.5, z: g.slot.z }));
  me.R.forEach((r, i) => { const d = el(`${r[0]} <span style="font-size:15px">${r[1]}</span>`, 'pt' + (r[0].startsWith('−') ? ' neg' : ''), 'font-size:22px'); anchor(d, () => ({ x: g.slot.x, y: PADY + 3.5, z: g.slot.z }), 34 + i * 28); });
  // pengaruh ke barang lain
  for (const it of base) {
    const a = without.per.get(it).p, bItem = list.find(o => o === it), b = withG.per.get(bItem).p;
    if (a !== b) { const d = el(`${b > a ? '+' : '−'}${Math.abs(b - a)}<small>${it.kind === 'bangku' || it.kind === 'sampah' ? 'jadi berguna' : 'terlalu dekat'}</small>`, 'pt' + (b < a ? ' neg' : '')); anchor(d, () => ({ x: it.x, y: PADY + 2.6, z: it.z })); }
  }
  const bt = el(`<button class="btn merah">✖</button><button class="btn kuning">⟳ Putar</button><button class="btn">✔ Taruh</button>`, 'ghostbtn');
  bt.children[0].onclick = () => { A.sfx('remove'); cancelGhost(); renderTata(); helper('Batal. Pilih kartu lain, atau ketuk barang untuk memindah.', 3000); };
  bt.children[1].onclick = rotateGhost;
  bt.children[2].onclick = confirmGhost;
  if (NF.ITEMS[g.kind].cat === 'lapak' && !g.moving) porsiPanel(g);
}
function porsiPanel(g) {
  [...UI.querySelectorAll('.stokpanel')].forEach(x => x.remove());
  [...UI.querySelectorAll('.tabs,.tray')].forEach(x => x.style.display = 'none');
  const k = g.kind, h = S.hearts[k];
  const p = el(`<h4><img src="${G.foodURL(k, 72)}"> ${NF.ITEMS[k].nama} ${'❤️'.repeat(h)} — berapa porsi dibawa?</h4>
    <div class="porsi">${NF.PORSI.map(([n, c]) => `<div class="tap ${g.porsi === n ? 'sel' : ''}" data-n="${n}"><div class="dots">${'🟢'.repeat(n)}</div><b>${n} porsi</b><small>bahan ${c} 🪙</small></div>`).join('')}</div>
    <div class="tip">Sewa lapak ${costOf(k)} 🪙 + bahan ${bahanOf(g.porsi)} 🪙 · 1 porsi laku = +${JUAL} 🪙 · Kurang → habis, tamu kecewa · Kebanyakan → sisa, bahan terbuang</div>`, 'stokpanel');
  p.querySelectorAll('.porsi > div').forEach(d => d.onclick = () => { A.sfx('tap'); g.porsi = +d.dataset.n; porsiPanel(g);
    helper(h === 3 ? (g.porsi >= 5 ? 'Pas! ❤❤❤ banyak yang mau 👍' : 'Hmm, ❤❤❤ banyak yang mau. 3 porsi cepat habis!') : h === 1 ? (g.porsi === 3 ? 'Pas, ❤ tidak banyak yang beli 👍' : 'Hmm, ❤ sedikit yang mau. Nanti banyak yang sisa…') : 'Coba 5 porsi untuk ❤❤', 2800); });
}
function rotateGhost() {
  const g = T.ghost; if (!g) return;
  g.rotK = ((g.rotK || 0) + 1) % 4; A.sfx('tap');
  dyn.remove(g.group); g.group = buildItem(g.kind, g.slot.x, g.slot.z, true, g.rotK);
  ghostUI(); tataHud();
  if (NF.ITEMS[g.kind].cat === 'lapak') helper(g.rotK === 0 ? 'Lapak menghadap ke tamu. Bagus! 👍' : g.rotK === 2 ? 'Ups, lapaknya <b>membelakangi</b> tamu. Putar lagi!' : 'Lapak menghadap ke samping.', 2500);
}
function cancelGhost() {
  const g = T.ghost; if (!g) return;
  [...UI.querySelectorAll('.stokpanel')].forEach(x => x.remove());
  dyn.remove(g.group); fx.remove(g.ring);
  if (g.moving) { g.moving.group.visible = true; }
  T.ghost = null; ghostUI();
}
function confirmGhost() {
  const g = T.ghost; if (!g) return;
  if (g.moving) {
    const it = g.moving; it.slot.item = null; dyn.remove(it.group);
    it.slot = g.slot; it.x = g.slot.x; it.z = g.slot.z; it.rotK = g.rotK; g.slot.item = it; it.group = buildItem(it.kind, it.x, it.z, false, it.rotK);
  } else {
    const lap = NF.ITEMS[g.kind].cat === 'lapak', bahan = lap ? bahanOf(g.porsi) : 0, c = costOf(g.kind) + bahan;
    if (kas() < c) { helper(`Kas tidak cukup (butuh ${c} 🪙). Pilih porsi lebih sedikit, atau bongkar barang lain.`, 3500); return; }
    const it = { kind: g.kind, slot: g.slot, x: g.slot.x, z: g.slot.z, cost: c, bahan, porsi: lap ? g.porsi : 0, rotK: g.rotK };
    it.group = buildItem(g.kind, it.x, it.z, false, it.rotK); g.slot.item = it; S.placed.push(it); S.spent += c;
  }
  dyn.remove(g.group); fx.remove(g.ring); T.ghost = null; A.sfx('place');
  [...UI.querySelectorAll('.stokpanel')].forEach(x => x.remove());
  ghostUI(); renderTata(); tataTip();
}
function tataTip() {
  const miss = (T.rows || []).find(r => !r[0]);
  if (!miss) return helper('Semua sudah siap! Ketuk <b>Siap ✔</b> untuk membuka festival 🎉');
  const t = miss[1];
  if (t.startsWith('Lapak')) helper(`Kita butuh <b>${LV.targetTamu / LV.porsi} lapak</b>. Ada 10 jajanan di tab Kue & Minuman — lihat ❤ dan harganya!`);
  else if (t.startsWith('Keranjang')) helper('Taruh <b>keranjang sampah</b> dekat lapak (tab Fasilitas) supaya telaga tetap bersih.');
  else if (t.startsWith('Tempat')) helper('Sore nanti hujan. Pasang <b>Daun Talas</b> untuk berteduh (tab Fasilitas).');
  else if (t.startsWith('Semua lapak')) helper('Ada lapak yang <b>gelap</b>. Pasang <b>Lampion</b> di dekatnya (tab Lampu) 🏮');
  else if (t.startsWith('Pos')) helper('Pasang <b>Pos Informasi</b> untuk membantu anak yang terpisah dari ibunya.');
  else helper('Tamu masih kurang. Coba <b>Poster Daun</b> (Promosi) atau <b>Pemusik</b> (Hiburan)!');
}
function selectPlaced(it) {
  closeItemMenu(); A.sfx('tap');
  const lap = NF.ITEMS[it.kind].cat === 'lapak';
  const m = el(`<button class="btn kuning">↔ Pindah</button><button class="btn kuning">⟳ Putar</button>${lap ? `<button class="btn kuning" data-p>📦 ${it.porsi} porsi</button>` : ''}<button class="btn abu" data-b>🗑 Bongkar +${it.cost}🪙</button>`, 'ghostbtn');
  T.menu = m;
  if (lap) m.querySelector('[data-p]').onclick = () => {
    const ns = NF.PORSI.map(p => p[0]), nx = ns[(ns.indexOf(it.porsi) + 1) % ns.length], nb = bahanOf(nx);
    if (kas() < nb - it.bahan) return helper('Kas tidak cukup untuk porsi lebih banyak 😅', 2500);
    S.spent += nb - it.bahan; it.cost += nb - it.bahan; it.bahan = nb; it.porsi = nx; A.sfx('tap'); renderTata(); selectPlaced(it);
  };
  m.children[0].onclick = () => { closeItemMenu(); it.group.visible = false; startGhost(it.kind, it.slot, it); };
  m.children[1].onclick = () => { it.rotK = ((it.rotK || 0) + 1) % 4; dyn.remove(it.group); it.group = buildItem(it.kind, it.x, it.z, false, it.rotK); A.sfx('tap'); renderTata(); };
  m.querySelector('[data-b]').onclick = () => { closeItemMenu(); dyn.remove(it.group); it.slot.item = null; S.placed.splice(S.placed.indexOf(it), 1); S.spent -= it.cost; A.sfx('remove'); renderTata(); tataTip(); };
}
function closeItemMenu() { if (T.menu) { T.menu.remove(); T.menu = null; } }
async function askStart() {
  A.sfx('tap'); closeItemMenu();
  const miss = T.rows.filter(r => !r[0]).map(r => r[1]);
  if (lapakList().length === 0) return helper('Belum ada lapak jajanan sama sekali! Pilih dari tab Kue atau Minuman.', 3500);
  if (miss.length) {
    const ok = await modal(`Masih ada yang belum siap:<br><span style="font-size:18px;color:#d9603f">${miss.map(m => '⬜ ' + m).join('<br>')}</span><br><br>Tetap buka festival?`, [['Belum, cek lagi', 'abu', false], ['Buka festival!', '', true]]);
    if (!ok) return;
  }
  startFestival();
}

// ================= festival =================
let F = null;
const ICON = { kodok: '🐸', bebek: '🦆', kura: '🐢', berang: '🦦', ikan: '🐟', udang: '🦐' };
function startFestival() {
  S.screen = 'festival'; document.body.className = 's-festival'; clearUI(); slotMarks.visible = false;
  const est = evaluate(S.placed).total;
  const porsi = LV.porsi + (S.hero === 'bebi' ? 1 : 0);
  const stalls = lapakList().map(it => ({ it, kind: it.kind, x: it.x, z: it.z, stock: it.porsi + (porsi - LV.porsi), dibawa: it.porsi + (porsi - LV.porsi), kecewa: 0, queue: [], served: 0, attr: 1 + itemPts(it, S.placed).p, place: itemPts(it, S.placed).p - heartsBonus(it.kind), dir: itemRot(it.x, it.z, it.rotK || 0), habisShown: false }));
  F = {
    t: 0, dur: LV.durasi, speed: 1, total: Math.max(1, est + (Math.random() < 0.4 ? 1 : 0)), spawned: 0, arrived: 0,
    income: 0, extraCost: 0, happy: 100, unhappy: 0, visitors: [], boats: [], problems: [], stalls,
    jurusUsed: false, events: [], log: { sampahTelaga: 0, berudu: null, raja: null, hujan: null, habis: 0, teduh: false, tamu: null, habisKind: [], relDone: 0 },
    nextBoat: 1.5, nextTrash: 10, done: false, ending: 0,
  };
  const P = F.dur;
  const AT = { berudu: 0.3, tamu: 0.44, raja: 0.56, hujan: 0.74, jatuh: 0.68 };
  F.events = LV.kejadian.map(k => ({ at: P * AT[k], type: k }));
  if (S.kembang) F.events.push({ at: P * 0.84, type: 'kembang' });
  F.fw = [];
  spawnRelawan();
  placeHero(-1.8, 4.8, 0.4);
  festHud();
  helper(`Festival dibuka! 🎉 Ketuk gelembung <b>merah</b> kalau ada masalah.`, 5000);
}
function festHud() {
  [...UI.querySelectorAll('.fest-hud')].forEach(x => x.remove());
  const box = el('', 'fest-hud');
  const untung = F.income - S.spent - F.extraCost;
  el(`<small>Festival ${LV.id} · Kerajaan Telaga</small><b>${LV.nama}</b>`, 'lv', '', box);
  el(`<b>${F.arrived}<span> / ${LV.targetTamu}</span></b><small>🐸 tamu datang</small><div class="nb"><i style="width:${Math.min(100, F.arrived / LV.targetTamu * 100)}%"></i></div>`, 'score' + (F.arrived >= LV.targetTamu ? ' ok' : ''), '', box);
  const tm = Math.min(1, F.t / F.dur);
  el(`<div class="pill">💰 Masuk <b>${F.income}</b> · 🪙 Untung <b style="color:${untung >= LV.targetUntung ? '#3a9a3a' : untung < 0 ? '#d9603f' : '#3d4a52'}">${untung}</b> / ${LV.targetUntung}</div>
      <div class="pill">😊 Senang <b>${Math.round(F.happy)}%</b></div>
      <div class="pill">${tm < 0.7 ? '☀️' : '🌇'} <span class="bar clock"><i style="width:${tm * 100}%"></i></span> 🌙</div>`, 'hud-r', '', box);
  if (!UI.querySelector('.jbtn')) {
    const h = NF.HEROES[S.hero];
    const jb = el(`<span class="ji">${h.jurusIkon}</span><b>${h.jurus}</b><small>${F.jurusUsed ? 'terpakai ✔' : 'ketuk! (1×)'}</small>`, 'jbtn tap');
    jb.onclick = useJurus;
    const sp = el(`<button class="btn abu speed">⏩ ${F.speed}×</button>`, '');
    sp.querySelector('button').onclick = () => { F.speed = F.speed === 1 ? 2 : 1; sp.querySelector('button').innerHTML = `⏩ ${F.speed}×`; A.sfx('tap'); };
  }
}
// ---- perahu & tamu ----
function makeBoat(riders) {
  const g = new THREE.Group(); fx.add(g);
  G.setParent(g);
  const hull = G.add(new THREE.SphereGeometry(1, 8, 3, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), G.M('#9ed36f', { side: THREE.DoubleSide }), 0, 0.26, 0); hull.scale.set(1.1, 0.28, 0.45);
  G.add(G.box(1.9, 0.02, 0.03), G.M('#a9dc78'), 0, 0.26, 0);
  const wake = G.add(new THREE.CircleGeometry(1.2, 14), G.M('#bff0ea', { transparent: true, opacity: 0.6 }), -0.4, 0.02, 0); wake.rotation.x = -Math.PI / 2; wake.scale.set(1.5, 0.6, 1); wake.castShadow = false;
  const objs = riders.map((r, k) => { const c = G.critter(r.kind, -0.45 + k * 0.45, 0.12, 0, 1.25, g); r.obj = c; return c; });
  return g;
}
function spawnBoat(n, opts = {}) {
  const kinds = Object.keys(G.CR);
  const riders = Array.from({ length: n }, () => ({ kind: pick(kinds) }));
  const side = opts.side ?? (Math.random() < 0.5 ? -1 : 1);
  const b = { g: makeBoat(riders), riders, x: DOCK.x + side * rnd(5, 9), z: DOCK.z + rnd(5, 8), tx: DOCK.x + rnd(-0.6, 0.6), tz: DOCK.z + 0.2, state: 'in', t: 0, king: opts.king };
  b.g.position.set(b.x, 0, b.z); b.g.rotation.y = Math.atan2(-(b.tz - b.z), b.tx - b.x);
  F.boats.push(b); A.sfx('boat');
  return b;
}
function newVisitor(kind, x, z, opts = {}) {
  const obj = G.critter(kind, x, PADY, z, opts.s || 2.0, actors);
  const v = { kind, obj, x, z, path: [], state: 'walk', t: 0, speed: rnd(1.3, 1.8), stall: null, patience: 0, bob: Math.random() * 6, counted: false, ...opts };
  F.visitors.push(v); return v;
}
function via(from, pts) {   // sisipkan titik jembatan bila berpindah daun
  const out = []; let cur = from;
  for (const p of pts) { const a = onPad2(cur), b = onPad2(p); if (a !== b) { out.push(...(a ? [BR2, BR1] : [BR1, BR2])); } out.push(p); cur = p; }
  return out;
}
function goPath(v, pts, then) { v.path = pts.map(p => ({ x: p.x, z: p.z })); v.then = then; v.state = 'walk'; }
function chooseStall(v) {
  const open = F.stalls.filter(s => s.stock > 0);
  if (open.length) {
    const tot = open.reduce((a, s) => a + stallW(s), 0); let r = Math.random() * tot, s = open[0];
    for (const o of open) { r -= stallW(o); if (r <= 0) { s = o; break; } }
    s.stock--; v.stall = s; v.paid = true;
  } else {
    v.stall = F.stalls.slice().sort((a, b) => b.attr - a.attr)[0]; v.paid = false;
  }
  joinQueue(v);
}
function queuePos(s, k) { const d = 1.0 + k * 0.42; return { x: s.x + Math.sin(s.dir) * d, z: s.z + Math.cos(s.dir) * d }; }
function joinQueue(v) {
  const s = v.stall; if (!s) return wander(v);
  s.queue.push(v); const p = queuePos(s, s.queue.length - 1);
  goPath(v, via(v, [{ x: ENTRY.x, z: ENTRY.z }, p]), () => { v.state = 'queue'; v.t = 0; v.patience = S.hero === 'bebi' ? 16 : 10; });
}
function wander(v) {
  const spots = S.placed.filter(p => p.kind === 'bangku' || p.kind === 'talas');
  let p;
  if (F.raining && F.log.teduh) { const t = S.placed.find(q => q.kind === 'talas'); p = { x: t.x + rnd(-0.7, 0.7), z: t.z + rnd(-0.7, 0.7) }; }
  else if (spots.length && Math.random() < 0.6) { const s = pick(spots); p = { x: s.x + rnd(-0.6, 0.6), z: s.z + rnd(-0.6, 0.6) }; }
  else if (LV.id === 2 && Math.random() < 0.4) { const a = Math.random() * 6.28, d = rnd(1.0, 4.4); p = { x: PAD2.x + Math.cos(a) * d, z: PAD2.z + Math.sin(a) * d }; if (Math.hypot(p.x - STAGE2.x, p.z - STAGE2.z) < 2) p.z += 3; }
  else { const a = Math.random() * 6.28, d = rnd(2.2, 6.6); p = { x: Math.cos(a) * d, z: Math.sin(a) * d }; }
  goPath(v, via(v, [p]), () => { v.state = 'idle'; v.t = 0; v.stay = rnd(5, 9); });
}
function leave(v, sad) {
  if (v.stall) { const q = v.stall.queue; const i = q.indexOf(v); if (i >= 0) q.splice(i, 1); }
  v.stall = null; v.sad = sad;
  goPath(v, via(v, [{ x: ENTRY.x, z: ENTRY.z }, GATE, DOCK]), () => { v.state = 'gone'; });
}
function stepVisitor(v, dt) {
  v.bob += dt * 8;
  if (v.state === 'walk') {
    const tgt = v.path[0];
    if (!tgt) { v.state = 'idle'; if (v.then) { const f = v.then; v.then = null; f(); } return; }
    const dx = tgt.x - v.x, dz = tgt.z - v.z, d = Math.hypot(dx, dz), st = v.speed * dt;
    if (d <= st) { v.x = tgt.x; v.z = tgt.z; v.path.shift(); }
    else { v.x += dx / d * st; v.z += dz / d * st; v.obj.rotation.y = Math.atan2(dx, dz); }
    if (!v.counted && v.z < GATE.z - 0.2 && !v.isKing && !v.isKid) { v.counted = true; F.arrived++; festHud(); }
    v.obj.position.set(v.x, PADY + Math.abs(Math.sin(v.bob)) * 0.08, v.z);
    if (!v.path.length && v.then) { const f = v.then; v.then = null; f(); }
  } else if (v.state === 'queue') {
    const s = v.stall, k = s.queue.indexOf(v);
    const p = queuePos(s, Math.max(0, k)); v.x += (p.x - v.x) * 0.1; v.z += (p.z - v.z) * 0.1;
    v.obj.position.set(v.x, PADY, v.z); v.obj.rotation.y = s.dir + Math.PI;
    if (!v.paid && s.stock > 0) { s.stock--; v.paid = true; }
    if (k === 0 && v.paid) { v.t += dt; if (v.t > 1.1) { s.queue.shift(); s.served++; F.income += JUAL; A.sfx('coin'); popAt(s.x, PADY + 2.2, s.z, `+${JUAL} 🪙`); festHud(); v.ate = true; wander(v); } }
    else if (!v.paid) { v.patience -= dt; if (v.patience <= 0) { F.unhappy++; s.kecewa = (s.kecewa || 0) + 1; F.happy = Math.max(0, F.happy - 3); leave(v, true); festHud(); } }
  } else if (v.state === 'idle') {
    v.t += dt; v.obj.position.set(v.x, PADY, v.z);
    if (v.stay && v.t > v.stay && !v.isKing && !v.isKid) leave(v, false);
  }
}
// ---- masalah ----
function addProblem(pr) {
  F.problems.push(pr);
  const b = el(pr.label, 'bubble warn act tap'); pr.el = b;
  anchor(b, pr.pos, 0); b.onclick = () => { if (relSel) return sendRelawan(relSel, pr); solveProblem(pr, false); };
  A.sfx('alert');
  return pr;
}
function removeProblem(pr) { const i = F.problems.indexOf(pr); if (i >= 0) F.problems.splice(i, 1); if (pr.el) unanchor(pr.el); }
function preWarn(pos, then) {
  if (S.hero !== 'lumi') return then();
  const b = el('❗', 'bubble pre'); anchor(b, pos); A.sfx('alert');
  setTimeout(() => { unanchor(b); then(); }, 3000 / (F ? F.speed : 1));
}
function solveProblem(pr, byJurus) {
  if (!F.problems.includes(pr)) return;
  const res = pr.solve(byJurus);
  if (res === false) return;
  removeProblem(pr); festHud();
}
function trashEvent() {
  const s = pick(F.stalls); if (!s) return;
  const hasBin = S.placed.some(p => p.kind === 'sampah' && dist(p, s) <= 3.6);
  if (hasBin && Math.random() < 0.75) return;
  const x = s.x + rnd(-0.8, 0.8), z = s.z + rnd(-0.8, 0.8);
  preWarn(() => ({ x, y: PADY + 0.8, z }), () => {
    if (!F || F.done) return;
    const m = new THREE.Group(); fx.add(m); G.setParent(m); G.add(G.sph(0.12), G.M('#d9b35c'), x, PADY + 0.08, z); G.add(G.sph(0.09), G.M('#e9d7a4'), x + 0.15, PADY + 0.07, z + 0.05);
    const pr = { type: 'sampah', label: '🗑️ Sampah! Ketuk', pos: () => ({ x, y: PADY + 0.9, z }), t: 0, limit: S.hero === 'lumi' ? 13 : 9, mesh: m,
      solve() { fx.remove(m); A.sfx('good'); popAt(x, PADY + 1, z, '✨ Bersih!'); F.happy = Math.min(100, F.happy + 2); },
      timeout() { // sampah jatuh ke telaga
        fx.remove(m); F.log.sampahTelaga++; F.happy = Math.max(0, F.happy - 8); A.sfx('bad');
        const a = Math.atan2(z, x), wx = Math.cos(a) * (PAD_R + 0.7), wz = Math.sin(a) * (PAD_R + 0.7);
        const w = new THREE.Group(); fx.add(w); G.setParent(w); G.add(G.sph(0.13), G.M('#d9b35c'), wx, 0.05, wz);
        addProblem({ type: 'telaga', label: '🐟 Sampah di telaga!', pos: () => ({ x: wx, y: 0.6, z: wz }), t: 0, limit: 15, solve() { fx.remove(w); A.sfx('good'); popAt(wx, 0.8, wz, '🐟 ❤️'); }, timeout() { fx.remove(w); } });
        helper('Yah, sampahnya jatuh ke telaga 🐟 Ikan jadi sedih. Ketuk untuk mengambilnya.', 4000);
      } };
    addProblem(pr);
  });
}
function beruduEvent() {
  const a = Math.random() * 6.28, x = Math.cos(a) * 5.2, z = Math.sin(a) * 4.4;
  preWarn(() => ({ x, y: PADY + 1.0, z }), () => {
    if (!F || F.done) return;
    const kid = newVisitor('kodok', x, z, { s: 1.0, isKid: true }); kid.state = 'idle';
    F.log.berudu = 'ada';
    const info = S.placed.find(p => p.kind === 'info');
    addProblem({ type: 'berudu', label: '😢 Aku terpisah dari ibu…', pos: () => ({ x: kid.x, y: PADY + 0.9, z: kid.z }), t: 0, limit: S.hero === 'lumi' ? 20 : 15,
      solve(byJurus) {
        const meet = info ? { x: info.x + 0.5, z: info.z + 0.5 } : { x: kid.x + 0.6, z: kid.z + 0.3 };
        goPath(kid, [meet], () => { kid.state = 'idle'; });
        const delay = info || byJurus || F.relHelp ? 2.5 : 6;
        setTimeout(() => { if (!F || F.done) return; const mom = newVisitor('kodok', meet.x + 0.5, meet.z + 0.4, { s: 1.9, isKid: true }); mom.state = 'idle'; popAt(meet.x, PADY + 1.6, meet.z, '❤️ Ketemu!'); A.sfx('good');
          F.happy = Math.min(100, F.happy + (info || byJurus || F.log.berudu === 'pos' ? 6 : 1)); festHud();
          setTimeout(() => { if (!F || F.done) return; leave(kid); leave(mom); }, 4000); }, delay * 1000 / F.speed);
        F.log.berudu = info || byJurus || F.relHelp ? 'pos' : 'cari'; F.relHelp = false;
        helper(info ? 'Anak berudu diantar ke <b>Pos Informasi</b>. Ibunya cepat ketemu! ❤️' : 'Belum ada Pos Informasi… kita cari ibunya pelan-pelan.', 4000);
      },
      timeout() { F.happy = Math.max(0, F.happy - 10); F.log.berudu = 'lama'; A.sfx('bad'); leave(kid); helper('Anak berudu menunggu lama sekali 😢 Lain kali bantu lebih cepat ya.', 4000); } });
  });
}
function rajaEvent() {
  preWarn(() => ({ x: GATE.x, y: PADY + 1.6, z: GATE.z }), () => {
    if (!F || F.done) return;
    const king = newVisitor('kura', DOCK.x, DOCK.z, { isKing: true });
    actors.remove(king.obj); G.setParent(actors); king.obj = G.king(DOCK.x, DOCK.z, 2.4); king.speed = 1.0;
    goPath(king, [GATE, { x: 0.8, z: 4.8 }], () => { king.state = 'idle'; });
    F.log.raja = 'datang';
    const bench = S.placed.find(p => p.kind === 'bangku');
    addProblem({ type: 'raja', label: '👑 Raja datang! Kursinya?', pos: () => ({ x: king.x, y: PADY + 2.2, z: king.z }), t: 0, limit: S.hero === 'lumi' ? 18 : 14,
      solve(byJurus) {
        if (bench) { goPath(king, [{ x: bench.x + 0.3, z: bench.z + 0.3 }], () => { king.state = 'idle'; }); F.log.raja = 'bangku'; }
        else { if (!byJurus) F.extraCost += 1; const kx = king.x - 0.8, kz = king.z; G.setParent(fx); G.inGroup(kx, kz, () => G.logBench(0, 0, 0.4), fx); goPath(king, [{ x: kx, z: kz + 0.3 }], () => { king.state = 'idle'; }); F.log.raja = byJurus ? 'bangku' : 'beli'; }
        popAt(king.x, PADY + 2.6, king.z, '👑 ❤️'); F.happy = Math.min(100, F.happy + 6); A.sfx('good');
        helper(bench ? 'Raja duduk di bangku kayu. Raja senang! 👑' : 'Kita buatkan kursi untuk Raja (−1 🪙). Raja senang! 👑', 4000);
        setTimeout(() => { if (F && !F.done) leave(king); }, 14000 / F.speed);
      },
      timeout() { F.happy = Math.max(0, F.happy - 10); F.log.raja = 'kecewa'; A.sfx('bad'); leave(king); helper('Raja menunggu terlalu lama dan pulang 😟', 4000); } });
  });
}
function fireworks(n, bright) {
  const cols = ['#ff5a7a', '#ffd24a', '#7fe0ff', '#b6ff7a', '#ff9de0'];
  for (let k = 0; k < n; k++) setTimeout(() => {
    if (!F || F.done) return;
    const c = cols[k % cols.length], o = { x: rnd(-3, 18), y: rnd(6, 9), z: rnd(-6, 0) };
    const mat = new THREE.MeshBasicMaterial({ color: c, transparent: true, opacity: bright ? 1 : 0.25 });
    for (let i = 0; i < 30; i++) { const m = new THREE.Mesh(G.sph(0.2), mat); m.position.set(o.x, o.y, o.z); const a = Math.random() * 6.28, b = Math.random() * 3.14;
      F.fw.push({ m, v: new THREE.Vector3(Math.cos(a) * Math.sin(b), Math.cos(b), Math.sin(a) * Math.sin(b)).multiplyScalar(rnd(3, 5)), t: 0, mat }); fx.add(m); }
    A.sfx('boat');
  }, k * 450 / (F ? F.speed : 1));
}
function stepFireworks(dt) {
  if (!F || !F.fw) return;
  for (const p of F.fw.slice()) { p.t += dt; p.m.position.addScaledVector(p.v, dt); p.v.y -= 2.5 * dt; p.m.scale.setScalar(Math.max(0.05, 1 - p.t / 2));
    if (p.t > 2) { fx.remove(p.m); F.fw.splice(F.fw.indexOf(p), 1); } }
}
function jatuhEvent() {
  const vs = F.visitors.filter(v => v.counted && !v.isKing && !v.isKid && v.state !== 'gone' && !v.stall);
  const v = vs.length ? pick(vs) : null; if (!v) return;
  preWarn(() => ({ x: v.x, y: PADY + 1.2, z: v.z }), () => {
    if (!F || F.done) return;
    v.state = 'idle'; v.stay = 99; v.obj.rotation.z = 1.2; F.log.jatuh = 'ada';
    const pr = addProblem({ type: 'jatuh', label: '🤕 Aduh, terjatuh!', pos: () => ({ x: v.x, y: PADY + 1.2, z: v.z }), t: 0, limit: S.hero === 'lumi' ? 16 : 12,
      solve() { v.obj.rotation.z = 0; popAt(v.x, PADY + 1.6, v.z, '🩹 Sudah diobati'); A.sfx('good'); F.happy = Math.min(100, F.happy + 3); F.log.jatuh = 'tolong'; v.stay = 3; },
      timeout() { v.obj.rotation.z = 0; F.happy = Math.max(0, F.happy - 8); F.log.jatuh = 'lama'; A.sfx('bad'); leave(v, true); helper('Tamu yang jatuh menunggu lama dan pulang 😢', 3500); } });
    helper('Ada tamu terjatuh! Ketuk untuk menolong 🩹', 3500);
  });
}
function kembangEvent() {
  fireworks(7, true); F.happy = Math.min(100, F.happy + 6); F.log.kembang = true;
  popAt(STAGE.x, PADY + 3.6, STAGE.z, '🎆 Wah!'); helper('🎆 Kembang api! Indah sekali di langit malam!', 4000); A.sfx('good'); festHud();
}
// ---- relawan: diseret / diketuk lalu ketuk masalah ----
let relSel = null;
function relHomes() {
  const h = [{ x: 2.4, z: 5.2 }, { x: -2.4, z: 4.6 }, { x: 4.8, z: 3.4 }, { x: -4.8, z: 3.2 }];
  return h;
}
function spawnRelawan() {
  relSel = null;
  F.rel = NF.RELAWAN.slice(0, LV.relawan).map((r, i) => {
    const h = relHomes()[i], obj = G.critter(r.kind, h.x, PADY, h.z, 2.5, actors);
    const ring = new THREE.Mesh(new THREE.RingGeometry(0.15, 0.21, 20), new THREE.MeshBasicMaterial({ color: '#ffc94a' })); ring.rotation.x = -Math.PI / 2; ring.position.y = 0.01; obj.add(ring);
    obj.rotation.y = Math.PI;
    return { ...r, obj, home: h, x: h.x, z: h.z, state: 'siaga', path: [], task: null, t: 0, bob: i };
  });
  renderTeam();
}
function renderTeam() {
  [...UI.querySelectorAll('.team')].forEach(x => x.remove());
  if (!F || !F.rel) return;
  const st = { siaga: 'siaga', jalan: 'berangkat…', kerja: 'bekerja…', pulang: 'kembali…' };
  const t = el(`<b>👫 Tim</b>` + F.rel.map(r => `<div class="mem tap ${r.state === 'siaga' ? 'siaga' : 'busy'} ${relSel === r ? 'drag' : ''}" data-id="${r.id}"><img src="${portrait(G.CR[r.kind])}"><b>${r.nama}</b><small>${r.sifat.split(' ')[0]} ${st[r.state]}</small></div>`).join(''), 'team');
  t.querySelectorAll('.mem').forEach(m => {
    const r = F.rel.find(x => x.id === m.dataset.id);
    m.addEventListener('pointerdown', e => {
      if (r.state !== 'siaga') { helper(`${r.nama} sedang bekerja. Tunggu sebentar ya!`, 2000); return; }
      e.preventDefault(); m.setPointerCapture(e.pointerId);
      const p0 = toStage(e); let moved = false, ic = null;
      const mv = ev => { const p = toStage(ev); if (!moved && Math.hypot(p.x - p0.x, p.y - p0.y) > 14) { moved = true; ic = el(`<img src="${portrait(G.CR[r.kind])}">`, 'dragicon'); } if (ic) { ic.style.left = p.x + 'px'; ic.style.top = p.y + 'px'; } };
      const up = ev => {
        m.removeEventListener('pointermove', mv); m.removeEventListener('pointerup', up); m.removeEventListener('pointercancel', up);
        if (ic) ic.remove();
        if (!moved) { relSel = relSel === r ? null : r; A.sfx('tap'); renderTeam(); if (relSel) helper(`Sekarang ketuk masalah untuk <b>${r.nama}</b> 👆`, 2500); return; }
        const p = toStage(ev); const pr = problemAt(p, ev);
        if (pr) sendRelawan(r, pr); else helper('Lepaskan tepat di gelembung masalah, ya 🙂', 2000);
      };
      m.addEventListener('pointermove', mv); m.addEventListener('pointerup', up); m.addEventListener('pointercancel', up);
    });
  });
}
function problemAt(p, ev) {
  const elx = document.elementFromPoint(ev.clientX, ev.clientY); const b = elx && elx.closest('.bubble.warn');
  if (b) { const pr = F.problems.find(q => q.el === b); if (pr) return pr; }
  let best = null, bd = 110;
  for (const pr of F.problems) { const q = pr.pos(), s2 = project(q.x, q.y, q.z), d = Math.hypot(s2.x - p.x, s2.y - p.y); if (d < bd) { bd = d; best = pr; } }
  return best;
}
function sendRelawan(r, pr) {
  relSel = null;
  if (r.state !== 'siaga' || !F.problems.includes(pr)) { renderTeam(); return; }
  if (pr.assigned) { helper(`${pr.assigned.nama} sudah menuju ke sana 🙂`, 2000); renderTeam(); return; }
  pr.assigned = r; r.task = pr; r.state = 'jalan'; pr.limit += 5;
  const q = pr.pos(); let tx = q.x, tz = q.z;
  if (!onPad2({ x: tx, z: tz })) { const d = Math.hypot(tx, tz); if (d > PAD_R - 0.7) { tx *= (PAD_R - 0.7) / d; tz *= (PAD_R - 0.7) / d; } }
  r.path = via(r, [{ x: tx + 0.5, z: tz + 0.5 }]);
  r.fast = r.cocok.includes(pr.type);
  if (pr.el) pr.el.innerHTML = pr.label + ` <small>· ${r.nama} datang</small>`;
  A.sfx('tap'); helper(r.fast ? `<b>${r.nama}</b> ${r.sifat.split(' ')[1]}, cocok untuk ini! ⚡` : `<b>${r.nama}</b> berangkat membantu.`, 2200);
  renderTeam();
}
function stepRelawan(dt) {
  if (!F || !F.rel) return;
  let change = false;
  for (const r of F.rel) {
    r.bob += dt * 8;
    if (r.state === 'jalan' || r.state === 'pulang') {
      const tgt = r.path[0];
      if (r.state === 'jalan' && !F.problems.includes(r.task)) { r.state = 'pulang'; r.path = via(r, [r.home]); change = true; continue; }
      if (!tgt) { if (r.state === 'jalan') { r.state = 'kerja'; r.t = r.fast ? 1.0 : 3.2; } else { r.state = 'siaga'; r.obj.rotation.y = Math.PI; } change = true; continue; }
      const dx = tgt.x - r.x, dz = tgt.z - r.z, d = Math.hypot(dx, dz), stp = (r.fast ? 3.4 : 2.4) * dt;
      if (d <= stp) { r.x = tgt.x; r.z = tgt.z; r.path.shift(); } else { r.x += dx / d * stp; r.z += dz / d * stp; r.obj.rotation.y = Math.atan2(dx, dz); }
      r.obj.position.set(r.x, PADY + Math.abs(Math.sin(r.bob)) * 0.1, r.z);
    } else if (r.state === 'kerja') {
      r.t -= dt; r.obj.position.y = PADY + Math.abs(Math.sin(r.bob * 2)) * 0.15;
      if (r.t <= 0) {
        const pr = r.task;
        if (F.problems.includes(pr)) { if (pr.type === 'berudu') F.relHelp = true; solveProblem(pr, false); F.log.relDone++; popAt(r.x, PADY + 2.2, r.z, `${r.nama} ✔`); }
        r.task = null; r.state = 'pulang'; r.path = via(r, [r.home]); change = true;
      }
    }
  }
  if (change) renderTeam();
}
function tamuEvent() {
  const id = S.tamuIst, ti = NF.TAMU_IST[id];
  preWarn(() => ({ x: GATE.x, y: PADY + 1.6, z: GATE.z }), () => {
    if (!F || F.done) return;
    G.setParent(actors);
    const grp = [];
    if (id === 'nenek') { const v = newVisitor('kura', DOCK.x, DOCK.z, { isKing: true, speed: 0.8 }); actors.remove(v.obj); v.obj = G.king(DOCK.x, DOCK.z, 2.2); v.obj.traverse(o => { if (o.material && o.material.color && o.material.color.getHexString() === 'ffcf3a') o.visible = false; }); grp.push(v); }
    else if (id === 'berudu') { for (let k = 0; k < 4; k++) grp.push(newVisitor('kodok', DOCK.x + k * 0.4 - 0.6, DOCK.z + (k % 2) * 0.4, { s: 1.1, isKing: true })); }
    else { const v = newVisitor('bebek', DOCK.x, DOCK.z, { s: 2.6, isKing: true }); v.obj.traverse(o => { if (o.material && o.material.color && o.material.color.getHexString() === 'ffe27a') o.material = G.M('#f6f6f0'); }); grp.push(v); }
    const lead = grp[0];
    const ok = id === 'nenek' ? S.placed.some(p => p.kind === 'bangku' && dist(p, GATE) <= 5.0)
      : id === 'berudu' ? S.musik : countKind('sampah') >= 2;
    grp.forEach((v, k) => goPath(v, [GATE, { x: ENTRY.x + (k - 1.5) * 0.5, z: ENTRY.z + 0.6 }], () => { v.state = 'idle'; }));
    const b = el(`${ti.ikon} ${ti.nama}: "${ok ? ti.puas : 'Mana ' + ti.butuh + '?'}"`, 'bubble ' + (ok ? '' : 'warn')); anchor(b, () => ({ x: lead.x, y: PADY + 2.4, z: lead.z }));
    F.log.tamu = ok ? 'puas' : 'kecewa';
    setTimeout(() => {
      if (!F || F.done) return;
      if (ok) { F.happy = Math.min(100, F.happy + 8); F.income += 2; F.tip = 2; popAt(lead.x, PADY + 2.8, lead.z, '❤️ tip +2 🪙'); A.sfx('coin'); helper(`<b>${ti.nama}</b> senang sekali dan memberi tip 2 🪙!`, 4000); }
      else { F.happy = Math.max(0, F.happy - 8); A.sfx('bad'); helper(`${ti.nama} kecewa karena tidak ada ${ti.butuh} 😢`, 4000); }
      festHud();
    }, 3500 / F.speed);
    setTimeout(() => { unanchor(b); if (F && !F.done) grp.forEach(v => leave(v)); }, 11000 / F.speed);
  });
}
function hujanEvent() {
  F.raining = 10; F.log.teduh = S.placed.some(p => p.kind === 'talas');
  const n = 420, pos = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { pos[i * 3] = rnd(-11, 15); pos[i * 3 + 1] = rnd(0, 10); pos[i * 3 + 2] = rnd(-10, 11); }
  const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  F.rain = new THREE.Points(geo, new THREE.PointsMaterial({ color: '#ffffff', size: 0.12, transparent: true, opacity: 0.8 })); fx.add(F.rain);
  if (F.log.teduh) {
    F.log.hujan = 'teduh'; helper('🌧️ Hujan! Tamu berteduh di bawah <b>Daun Talas</b> ☂️ Untung sudah disiapkan!', 5000); A.sfx('good');
    F.visitors.filter(v => v.state === 'idle' && !v.isKing && !v.isKid).forEach(v => wander(v));
  } else {
    F.log.hujan = 'basah'; A.sfx('bad'); F.happy = Math.max(0, F.happy - 10);
    const idle = F.visitors.filter(v => (v.state === 'idle' || v.state === 'walk') && !v.isKing && !v.isKid && v.counted && v.ate).slice(0, 3);
    idle.forEach(v => leave(v, true));
    helper('🌧️ Hujan! Tidak ada tempat berteduh, beberapa tamu pulang basah 😢', 5000);
  }
}
function useJurus() {
  if (!F || F.jurusUsed || F.done) return;
  F.jurusUsed = true; A.sfx('jurus');
  const jb = UI.querySelector('.jbtn'); if (jb) { jb.classList.add('used'); jb.querySelector('small').textContent = 'terpakai ✔'; }
  if (S.hero === 'bebi') {
    spawnBoat(3, { side: -1 }); setTimeout(() => F && spawnBoat(2, { side: 1 }), 1200);
    F.total += 5; F.spawned += 5;
    helper('📣 <b>Kwek Undangan!</b> Rombongan perahu daun datang, +5 tamu!', 5000);
    popAt(heroM.obj.position.x, PADY + 2.4, heroM.obj.position.z, '📣 Kwek!');
  } else if (S.hero === 'tiko') {
    G.setParent(world);
    const np = { x: -1.4, z: -12.2 };
    const grp = new THREE.Group(); world.add(grp); G.setParent(grp);
    G.pad(np.x + 0.1, np.z + 0.2, 2.4, Math.PI * 1.4, '#97d462'); G.twigBridge([-1.5, -8.3], [-1.4, -9.7]);
    const best = NF.LAPAK.slice().sort((a, b) => S.hearts[b] - S.hearts[a])[0];
    G.inGroup(np.x, np.z, () => G.stall(0, 0, best, 'keringdaun', 0), grp);
    F.stalls.push({ it: null, kind: best, x: np.x, z: np.z + 1.0, stock: LV.porsi, dibawa: LV.porsi, kecewa: 0, gratis: true, queue: [], served: 0, attr: 4, place: 2, dir: Math.PI, habisShown: false, far: true });
    F.total += 3; F.spawned += 3; spawnBoat(3);
    F.tikoPad = grp;
    helper(`🪵 <b>Bangun Kilat!</b> Tiko membangun daun baru + lapak ${NF.ITEMS[best].nama} gratis!`, 5000);
  } else {
    const list = F.problems.slice();
    if (!list.length) helper('⚡ <b>Lompat Kilat!</b> Lumi berkeliling memeriksa semua daun. Semua aman! ⭐', 4000);
    else helper(`⚡ <b>Lompat Kilat!</b> Lumi membereskan ${list.length} masalah sekaligus! ⭐`, 4500);
    list.forEach(pr => solveProblem(pr, true));
    F.happy = Math.min(100, F.happy + 8);
    F.lumiGuard = 12; // beberapa saat, masalah baru langsung dibereskan
  }
  festHud();
}
function stepFestival(dt) {
  if (!F || F.done) return;
  dt *= F.speed; F.t += dt;
  // perahu tamu
  const spawnEnd = F.dur * 0.72;
  F.nextBoat -= dt;
  if (F.spawned < F.total && F.t < spawnEnd && F.nextBoat <= 0) {
    const left = F.total - F.spawned, n = Math.min(left, 2 + Math.floor(Math.random() * 3));
    spawnBoat(n); F.spawned += n;
    const boatsLeft = Math.max(1, Math.ceil((F.total - F.spawned) / 3));
    F.nextBoat = Math.max(2.2, (spawnEnd - F.t) / boatsLeft);
  }
  for (const b of F.boats.slice()) {
    if (b.state === 'in') {
      const dx = b.tx - b.x, dz = b.tz - b.z, d = Math.hypot(dx, dz), st = 3.2 * dt;
      if (d <= st) { b.state = 'unload'; b.t = 0; }
      else { b.x += dx / d * st; b.z += dz / d * st; }
      b.g.position.set(b.x, Math.sin(F.t * 3) * 0.03, b.z);
    } else if (b.state === 'unload') {
      b.riders.forEach((r, k) => { b.g.remove(r.obj); const wp = b.g.localToWorld(new THREE.Vector3(-0.45 + k * 0.45, 0, 0)); const v = newVisitor(r.kind, wp.x, wp.z); goPath(v, [GATE], () => chooseStall(v)); });
      b.state = 'out'; b.t = 0;
    } else if (b.state === 'out') {
      b.t += dt; b.x += 2.5 * dt; b.z += 1.5 * dt; b.g.position.set(b.x, 0, b.z); b.g.rotation.y = -0.5;
      if (b.t > 5) { fx.remove(b.g); F.boats.splice(F.boats.indexOf(b), 1); }
    }
  }
  for (const v of F.visitors.slice()) {
    stepVisitor(v, dt);
    if (v.state === 'gone') { actors.remove(v.obj); F.visitors.splice(F.visitors.indexOf(v), 1); }
  }
  // lapak habis → masalah antre
  for (const s of F.stalls) {
    const waiting = s.queue.some(v => !v.paid);
    if (waiting && s.stock <= 0 && !s.habisPr) {
      s.habisPr = addProblem({ type: 'habis', label: `😣 ${NF.ITEMS[s.kind].nama} habis! Antre`, pos: () => ({ x: s.x, y: PADY + 2.9, z: s.z }), t: 0, limit: 999,
        solve(byJurus) { if (!byJurus) F.extraCost += 1; s.stock += 3; s.dibawa += 3; s.habisPr = null; A.sfx('good'); popAt(s.x, PADY + 2.4, s.z, '📦 +3 porsi'); helper(`Bahan ${NF.ITEMS[s.kind].nama} ditambah 3 porsi${byJurus ? '' : ' (−1 🪙)'}. Antrean jalan lagi!`, 3500); } });
      F.log.habis++; if (!F.log.habisKind.includes(s.kind)) F.log.habisKind.push(s.kind);
      helper(`Lapak <b>${NF.ITEMS[s.kind].nama}</b> kehabisan jajanan! Ketuk untuk <b>tambah 3 porsi</b> (1 🪙).`, 4500);
    }
    if (s.habisPr && !waiting) { removeProblem(s.habisPr); s.habisPr = null; }
  }
  // sampah berkala
  F.nextTrash -= dt;
  if (F.nextTrash <= 0 && F.t > F.dur * 0.12 && F.t < F.dur * 0.88) { F.nextTrash = rnd(13, 17); trashEvent(); }
  // kejadian terjadwal
  for (const ev of F.events) if (!ev.done && F.t >= ev.at) { ev.done = true; ({ berudu: beruduEvent, raja: rajaEvent, hujan: hujanEvent, tamu: tamuEvent, jatuh: jatuhEvent, kembang: kembangEvent })[ev.type](); }
  stepRelawan(dt);
  if (LV.malam) { const f = Math.max(0.12, Math.min(1, (F.t / F.dur - 0.28) / 0.25)); if (Math.abs(f - nightF) > 0.01) setNight(f); }
  stepFireworks(dt);
  // batas waktu masalah
  for (const pr of F.problems.slice()) {
    if (F.lumiGuard > 0 && pr.type !== 'telaga') { solveProblem(pr, true); continue; }
    pr.t += dt; if (pr.limit < 999 && pr.t > pr.limit) { removeProblem(pr); pr.timeout && pr.timeout(); festHud(); }
  }
  if (F.lumiGuard > 0) F.lumiGuard -= dt;
  // hujan
  if (F.raining) {
    F.raining = Math.max(0, F.raining - dt);
    const a = F.rain.geometry.attributes.position; for (let i = 0; i < a.count; i++) { let y = a.getY(i) - dt * 14; if (y < 0) y += 9; a.setY(i, y); } a.needsUpdate = true;
    if (!F.raining) { fx.remove(F.rain); F.rain = null; }
  }
  // jam HUD
  F.hudT = (F.hudT || 0) + dt; if (F.hudT > 1) { F.hudT = 0; festHud(); }
  // selesai
  if (F.t >= F.dur) {
    if (!F.closing) { F.closing = true; helper('🌙 Festival hampir selesai. Tamu mulai pulang…', 4000); F.visitors.forEach(v => { if (v.state !== 'walk' || !v.path.some(p => p === DOCK)) leave(v, false); }); }
    F.ending += dt;
    if (F.visitors.length === 0 || F.ending > 10) finishFestival();
  }
}
function finishFestival() {
  if (F.done) return; F.done = true;
  F.problems.slice().forEach(removeProblem);
  setTimeout(screenLaporan, 600);
}

// ================= laporan =================
function screenLaporan() {
  S.screen = 'laporan'; document.body.className = 's-laporan'; clearUI();
  const biayaBarang = S.spent, biaya = S.spent + F.extraCost, untung = F.income - biaya;
  const s1 = F.arrived >= LV.targetTamu, s2 = untung >= LV.targetUntung, s3 = F.happy >= 70;
  const stars = [s1, s2, s3].filter(Boolean).length;
  const prevBest = SAVE.best[S.hero] || 0;
  if (LV.id === 1) SAVE.best[S.hero] = Math.max(prevBest, stars); SAVE.main = (SAVE.main || 0) + 1;
  SAVE.lv[`${S.hero}-${LV.id}`] = Math.max(bestOf(S.hero, LV.id), stars);
  // stiker
  const baru = [];
  const give = (id, val, e, n) => { const old = SAVE.stk[id]; if (val === 'emas' && old !== 'emas' || val === 'perak' && !old || val === true && !old) { SAVE.stk[id] = val; baru.push([e, n, val]); } };
  if (stars) give(`${S.hero}-${LV.id}`, stars === 3 ? 'emas' : 'perak', HERO_IKON[S.hero], `${NF.HEROES[S.hero].nama.split(' ')[0]} · Tahap ${LV.id}`);
  const SP = Object.fromEntries(NF.STIKER.map(([id, e, n]) => [id, [e, n]]));
  const sp = id => give(id, true, ...SP[id]);
  if (F.log.tamu === 'puas') sp(S.tamuIst);
  if (!F.log.sampahTelaga) sp('telaga');
  if (F.log.raja === 'bangku' || F.log.raja === 'beli') sp('raja');
  if (F.log.relDone >= 3) sp('relawan');
  const realStalls = F.stalls.filter(x => !x.gratis); if (realStalls.length && realStalls.every(x => x.dibawa - x.served <= 2 && !x.kecewa)) sp('porsi');
  if (F.log.berudu === 'pos') sp('anak');
  if (LV.malam && lapakList().length && lapakList().every(l => isLit(l))) sp('terang');
  if (F.log.kembang) sp('kembangapi');
  save();
  // catatan Kiko
  const tips = [];
  const ns = NF.PORSI.map(p => p[0]);
  const kurang = F.stalls.filter(x => !x.gratis && (x.kecewa || F.log.habisKind.includes(x.kind))).sort((a, b) => (b.kecewa || 0) - (a.kecewa || 0))[0];
  if (kurang) { const nx = ns.find(n => n > kurang.it.porsi); tips.push(`🍡 <b>${NF.ITEMS[kurang.kind].nama}</b> ${'❤'.repeat(S.hearts[kurang.kind])} habis duluan${kurang.kecewa ? ` — ${kurang.kecewa} tamu kecewa` : ''}. ${nx ? `Lain kali bawa <b>${nx} porsi</b>.` : 'Tambah lapak jajanan lain.'}`); }
  const lebih = F.stalls.filter(x => !x.gratis && x.dibawa - x.served >= 3).sort((a, b) => (b.dibawa - b.served) - (a.dibawa - a.served))[0];
  if (lebih) { const nx = [...ns].reverse().find(n => n < lebih.it.porsi); tips.push(`📦 <b>${NF.ITEMS[lebih.kind].nama}</b> ${'❤'.repeat(S.hearts[lebih.kind])} sisa <b>${lebih.dibawa - lebih.served}</b>, bahannya terbuang.${nx ? ` Cukup <b>${nx} porsi</b>.` : ''}`); }
  const tiData = NF.TAMU_IST[S.tamuIst]; if (F.log.tamu === 'kecewa') tips.push(`${tiData.ikon} <b>${tiData.nama}</b> butuh ${tiData.butuh}. Siapkan sebelum festival!`);
  const backs = lapakList().filter(p => (p.rotK || 0) % 4 === 2); if (backs.length) tips.push(`↩️ Lapak <b>${NF.ITEMS[backs[0].kind].nama}</b> membelakangi tamu. Putar ⟳ menghadap tugu!`);
  const gelapL = LV.malam ? lapakList().filter(l => !isLit(l)) : []; if (gelapL.length) tips.push(`🏮 Lapak <b>${NF.ITEMS[gelapL[0].kind].nama}</b> gelap, tamu takut ke sana. Pasang lampion di dekatnya.`);
  if (F.log.sampahTelaga) tips.push('🧹 Sampah jatuh ke telaga. <b>Seret Oto</b> (rajin) ke sampah, atau taruh keranjang dekat lapak.');
  if (F.log.relDone === 0) tips.push('👫 Teman relawan belum dipakai. <b>Seret</b> mereka ke gelembung masalah saat festival!');
  if (F.log.hujan === 'basah') tips.push('☂️ Pasang <b>Daun Talas</b> sebelum hujan sore.');
  if (F.log.jatuh === 'lama') tips.push('🩹 Tamu yang terjatuh tidak cepat ditolong. <b>Seret Udi</b> (cekatan) ke sana.');
  if (F.log.raja === 'kecewa') tips.push('👑 Raja tidak dapat kursi. Siapkan <b>bangku kayu</b>.');
  if (untung < LV.targetUntung) { const mahal = lapakList().slice().sort((a, b) => b.cost - a.cost)[0], murah = NF.LAPAK.filter(k => S.hearts[k] === 3 && costOf(k) < (mahal ? mahal.cost : 9)).sort((a, b) => costOf(a) - costOf(b))[0];
    tips.push(`💡 Untung kurang ${LV.targetUntung - untung} 🪙.${mahal && murah ? ` ${NF.ITEMS[mahal.kind].nama} sewanya ${mahal.cost} 🪙 — ${NF.ITEMS[murah].nama} ❤❤❤ cuma ${costOf(murah)} 🪙!` : ' Kurangi barang yang tidak perlu.'}`); }
  if (F.arrived < LV.targetTamu) tips.push(`🐸 Tamu kurang ${LV.targetTamu - F.arrived}. Coba poster, pemusik, atau jajanan ❤❤❤.`);
  if (!tips.length) tips.push('🌟 Hebat! Semua rapi. Coba tokoh lain untuk mengumpulkan stiker baru!');
  const says = [];
  const fav = lapakList().find(p => S.hearts[p.kind] === 3); if (fav) says.push(`🦆 "${NF.ITEMS[fav.kind].nama}nya enak!"`);
  if (F.unhappy) says.push(`🐢 "Jajanannya habis… aku tidak kebagian 😢"`);
  if (!countKind('bangku')) says.push(`🦦 "Mana tempat duduknya?"`);
  if (F.log.sampahTelaga) says.push(`🐟 "Telaganya jadi kotor…"`);
  if (S.musik) says.push(`🐸 "Musiknya seru! 🎵"`);
  if (F.log.hujan === 'teduh') says.push(`🦐 "Untung ada daun talas ☂️"`);
  if (F.log.hujan === 'basah') says.push(`🦆 "Aku kehujanan, basah kuyup 🌧️"`);
  if (F.log.berudu === 'pos') says.push(`🐸 "Terima kasih sudah menemukan anakku!"`);
  if (F.log.raja === 'bangku' || F.log.raja === 'beli') says.push(`👑 "Pesta yang menyenangkan!"`);
  if (F.log.raja === 'kecewa') says.push(`👑 "Aku tidak dapat kursi…"`);
  const rinci = {};
  S.placed.forEach(p => { const k = NF.ITEMS[p.kind].cat; rinci[k] = (rinci[k] || 0) + p.cost - (p.bahan || 0); if (p.bahan) rinci.bahan = (rinci.bahan || 0) + p.bahan; });
  if (S.musik) rinci.hiburan = (rinci.hiburan || 0) + costOf('musik');
  if (S.kembang) rinci.kembang = costOf('kembangapi');
  const label = { lapak: '🌿 Sewa lapak jajanan', bahan: '📦 Bahan jajanan', kembang: '🎆 Kembang api', hiburan: '🎵 Bayar pemusik', fasilitas: '🪵 Fasilitas', promosi: '📜 Poster promosi', lampu: '🏮 Lampion' };
  const subRows = Object.entries(rinci).map(([k, v]) => `<div class="sub"><span>${label[k]}</span><span>− ${v}</span></div>`).join('') + (F.extraCost ? `<div class="sub"><span>📦 Tambah bahan saat festival</span><span>− ${F.extraCost}</span></div>` : '') + (F.tip ? `<div class="sub"><span>❤️ Tip tamu istimewa (sudah termasuk uang masuk)</span><span>+ ${F.tip}</span></div>` : '');
  const st = [s1, s2, s3].map(x => `<span class="${x ? '' : 'off'}">⭐</span>`).join('');
  const r = el(`<h2>🎉 Festival Selesai! <span class="stars" style="font-size:34px">${st}</span></h2>
    <div class="row"><span>🐸 Tamu datang</span><b>${F.arrived} <small>/ target ${LV.targetTamu}</small> <span class="${s1 ? 'ok' : 'no'}">${s1 ? '✔' : '✖'}</span></b></div>
    <div style="font-weight:900;font-size:16px;margin-top:4px">📦 Stok jajanan</div>
    <table class="tbl"><tr><th>Lapak</th><th>Dibawa</th><th>Terjual</th><th>Sisa</th><th></th></tr>${F.stalls.map(x => { const sisa = Math.max(0, x.dibawa - x.served);
      const ket = x.kecewa ? `<td class="no">habis! ${x.kecewa} tamu kecewa</td>` : sisa >= 3 ? `<td class="no">sisa ${sisa}, terbuang</td>` : `<td class="ok">pas ✔</td>`;
      return `<tr><td><img src="${G.foodURL(x.kind, 56)}">${NF.ITEMS[x.kind].nama} ${'❤'.repeat(S.hearts[x.kind])}${x.gratis ? ' 🎁' : ''}</td><td>${x.dibawa}</td><td>${x.served}</td><td>${sisa}</td>${ket}</tr>`; }).join('')}</table>
    <div class="row"><span>💰 Uang masuk (${(F.income - (F.tip || 0)) / JUAL} jajan × ${JUAL} 🪙${F.tip ? ' + tip' : ''})</span><b>${F.income} 🪙</b></div>
    ${subRows}
    <div class="row"><span>💸 Biaya semuanya</span><b>− ${biaya} 🪙</b></div>
    <div class="row"><span><b>😊 Untung</b> = ${F.income} − ${biaya}</span><b class="${untung >= 0 ? 'ok' : 'no'}">${untung} 🪙 <small>/ target ${LV.targetUntung}</small> <span class="${s2 ? 'ok' : 'no'}">${s2 ? '✔' : '✖'}</span></b></div>
    <div class="row" style="border:0"><span>😊 Tamu senang</span><b>${Math.round(F.happy)}% <small>/ target 70%</small> <span class="${s3 ? 'ok' : 'no'}">${s3 ? '✔' : '✖'}</span></b></div>
    <div class="catatan"><span class="f">${asisten().face}</span><div><b>📝 Catatan ${asisten().nama} untuk festival berikutnya</b><ul>${tips.slice(0, 3).map(t => `<li>${t}</li>`).join('')}</ul></div></div>
    ${baru.length ? `<div class="stikerbaru ${baru.length > 4 ? 'banyak' : ''}">Stiker baru! ${baru.slice(0, 6).map(([e, n, v]) => `<div class="stk ${v === 'perak' ? 'silver' : ''}">${e}<span class="t">${n}</span></div>`).join('')}${baru.length > 6 ? `<b>+${baru.length - 6} lagi</b>` : ''}</div>` : ''}
    <div class="btns"><button class="btn kuning" data-a="lagi">🔁 Main lagi</button><button class="btn abu" data-a="stiker">📒 Stiker</button><button class="btn abu" data-a="peta">🗺️ Peta</button><button class="btn abu" data-a="tokoh">🔄 Tokoh</button></div>`, 'report');
  r.querySelector('[data-a=lagi]').onclick = () => { A.sfx('tap'); screenPapan(); };
  r.querySelector('[data-a=tokoh]').onclick = () => { A.sfx('tap'); screenTokoh(); };
  r.querySelector('[data-a=stiker]').onclick = () => { A.sfx('tap'); bukuStiker(); };
  r.querySelector('[data-a=peta]').onclick = () => { A.sfx('tap'); screenPeta(); };
  const dm = el('', 'dim', 'pointer-events:none'); UI.insertBefore(dm, UI.firstChild);
  if (stars || baru.length) setTimeout(() => A.sfx('star'), 300);
  if (F.tikoPad) { world.remove(F.tikoPad); }
}

// ================= tombol atas =================
$('soundBtn').onclick = () => { A.unlock(); SAVE.muted = !A.isMuted(); A.setMuted(SAVE.muted); $('soundBtn').textContent = SAVE.muted ? '🔇' : '🔊'; save(); };
A.setMuted(!!SAVE.muted); $('soundBtn').textContent = SAVE.muted ? '🔇' : '🔊';
$('homeBtn').onclick = async () => {
  A.sfx('tap');
  if (S.screen === 'tata' || S.screen === 'festival') { const ok = await modal('Kembali ke layar judul?<br><small>Festival ini tidak disimpan.</small>', [['Tidak', 'abu', false], ['Ya', 'merah', true]]); if (!ok) return; }
  if (F) F.done = true; screenJudul();
};

// ================= loop =================
let last = performance.now();
function loop(now) {
  if (LITE) { setTimeout(() => requestAnimationFrame(loop), 150); }
  const dt = Math.min(LITE ? 0.2 : 0.05, (now - last) / 1000); last = now;
  if (S.screen === 'festival') stepFestival(dt);
  // tamu dekorasi di layar judul bergoyang
  if (S.screen === 'judul') actors.children.forEach(c => { if (c.userData.bob !== undefined) { c.userData.bob += dt * 3; c.position.y = PADY + Math.abs(Math.sin(c.userData.bob)) * 0.06; } });
  if (hop && S.screen === 'tokoh') { hop.position.y = PADY + Math.abs(Math.sin(now / 160)) * 0.35; }
  if (S.screen !== 'tokoh' && hop) { hop.position.y = PADY; hop = null; }
  applyCam();
  for (const a of anchors) placeAnchor(a);
  renderer.render(scene, cam);
  if (!LITE) requestAnimationFrame(loop);
}

// ---- gabungkan geometri statis per bahan → jauh lebih sedikit draw call (ringan di iPad) ----
function mergeStatic(group) {
  group.updateMatrixWorld(true);
  const buckets = new Map(), keep = [];
  group.traverse(o => {
    if (o.isSprite || o.isPoints) { keep.push(o); return; }
    if (!o.isMesh) return;
    const m = o.material; if (Array.isArray(m) || m.transparent) { keep.push(o); return; }
    const key = m.uuid + (o.castShadow ? 'c' : '') + (o.receiveShadow ? 'r' : '');
    if (!buckets.has(key)) buckets.set(key, { mat: m, cast: o.castShadow, recv: o.receiveShadow, geos: [] });
    let g = o.geometry.index ? o.geometry.toNonIndexed() : o.geometry.clone();
    for (const k of Object.keys(g.attributes)) if (k !== 'position' && k !== 'normal') g.deleteAttribute(k);
    if (!g.attributes.normal) g.computeVertexNormals();
    g.applyMatrix4(o.matrixWorld);
    buckets.get(key).geos.push(g);
  });
  const out = new THREE.Group();
  for (const b of buckets.values()) {
    let n = 0; b.geos.forEach(g => n += g.attributes.position.count);
    const pos = new Float32Array(n * 3), nor = new Float32Array(n * 3); let off = 0;
    b.geos.forEach(g => { pos.set(g.attributes.position.array, off * 3); nor.set(g.attributes.normal.array, off * 3); off += g.attributes.position.count; g.dispose(); });
    const geo = new THREE.BufferGeometry(); geo.setAttribute('position', new THREE.BufferAttribute(pos, 3)); geo.setAttribute('normal', new THREE.BufferAttribute(nor, 3));
    geo.computeBoundingSphere();
    const mesh = new THREE.Mesh(geo, b.mat); mesh.castShadow = b.cast; mesh.receiveShadow = b.recv; out.add(mesh);
  }
  for (const k of keep) { const wp = new THREE.Vector3(), wq = new THREE.Quaternion(), ws = new THREE.Vector3(); k.matrixWorld.decompose(wp, wq, ws); k.position.copy(wp); k.quaternion.copy(wq); k.scale.copy(ws); out.add(k); }
  while (group.children.length) group.remove(group.children[0]);
  group.position.set(0, 0, 0); group.rotation.set(0, 0, 0); group.scale.set(1, 1, 1);
  group.add(out);
}

// ================= mulai =================
const LITE = /lite/.test(location.search);
if (LITE) { renderer.shadowMap.enabled = false; renderer.setPixelRatio(1); }
buildVenue(1); mergeStatic(worldA); buildVenue(2); mergeStatic(worldB); buildMap(); mergeStatic(mapG);
{ fireflies = new THREE.Group(); worldB.add(fireflies); const fm = new THREE.MeshBasicMaterial({ color: '#fff6a0' }); for (let k = 0; k < 70; k++) { const m = new THREE.Mesh(G.sph(0.06), fm); const a = Math.random() * 6.28, d = Math.random() * 18; m.position.set(7 + Math.cos(a) * d, 0.6 + Math.random() * 3.2, -1 + Math.sin(a) * d * 0.7); fireflies.add(m); } }
setLevel(1);
buildLineup();
// lineup: gabungkan semua kecuali tokoh yang bisa melompat
{ const tmp = new THREE.Group(); scene.add(tmp); Object.values(lineupHeroes).forEach(h => { tmp.attach(h); }); mergeStatic(lineupG); Object.values(lineupHeroes).forEach(h => lineupG.attach(h)); scene.remove(tmp); }
G.setParent(dyn);
screenJudul();
$('loading').hidden = true;
requestAnimationFrame(loop);

// ================= debug untuk pengujian =================
window.NF.debug = {
  S, T, get F() { return F; }, SLOTS, evaluate, costOf,
  level: id => setLevel(id), night: f => setNight(f),
  go: name => ({ judul: screenJudul, tokoh: screenTokoh, cerita: screenCerita, papan: screenPapan, tata: screenTata, festival: startFestival, laporan: screenLaporan, peta: screenPeta, stiker: bukuStiker })[name](),
  SAVE,
  hero: h => { S.hero = SAVE.hero = h; },
  place(kind, idx, rotK = 0, porsi) { const s = SLOTS[idx]; if (!s || s.item) return false; startGhost(kind, s); T.ghost.rotK = rotK; if (porsi) T.ghost.porsi = porsi; confirmGhost(); return true; },
  send: (i, type) => { const r = F.rel[i], pr = F.problems.find(p => !type || p.type === type); if (r && pr) sendRelawan(r, pr); return !!(r && pr); },
  speed(n) { if (F) F.speed = n; },
  jurus: useJurus, problems: () => F && F.problems.map(p => p.type), solveAll: () => F && F.problems.slice().forEach(p => solveProblem(p, false)),
  cam: () => ({ ...camS }), info: () => ({ ...renderer.info.render }),
};
