// Model low-poly: jamaah, Ka'bah, Masjidil Haram, Mas'a, masjid miqat, hotel, bus.
import * as THREE from 'three';
import { mergeGeometries } from '../vendor/three/utils/BufferGeometryUtils.js';

export let DETAIL = 'halus';
export function setDetail(q) { DETAIL = q; VAR = null; }
export const SEG = (hi = 18, lo = 9) => DETAIL === 'halus' ? hi : lo;
export const SHADOW = () => DETAIL === 'halus' ? 2048 : 1024;
let seed = 11;
export const rnd = () => { seed = (seed * 16807) % 2147483647; return (seed - 1) / 2147483646; };
export const R = (a, b) => a + rnd() * (b - a);
export const M = (c, o = {}) => new THREE.MeshStandardMaterial({ color: c, roughness: o.r ?? .85, metalness: o.m ?? 0, flatShading: o.flat ?? false, emissive: o.e ?? 0x000000, emissiveIntensity: o.ei ?? 1, transparent: !!o.op, opacity: o.op ?? 1, map: o.map || null, side: o.side ?? THREE.FrontSide, depthWrite: o.op ? false : true });
export function add(par, geo, mat, x = 0, y = 0, z = 0, cast = true) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = cast; m.receiveShadow = true; par.add(m); return m; }
export const Cyl = (a, b, h, n) => new THREE.CylinderGeometry(a, b, h, n || SEG(16, 8));
export const Sph = (r, n) => new THREE.SphereGeometry(r, n || SEG(18, 10), Math.max(6, Math.round((n || SEG(18, 10)) * .7)));
const Lathe = (pts, n) => new THREE.LatheGeometry(pts.map(([r, y]) => new THREE.Vector2(r, y)), n || SEG(18, 10));
const Cap = (r, l, n) => new THREE.CapsuleGeometry(r, l, 4, n || SEG(12, 7));
export const Ico = (r, d = 1) => new THREE.IcosahedronGeometry(r, d);
export const Box = (x, y, z) => new THREE.BoxGeometry(x, y, z);

export function cg(geo, color, t = [0, 0, 0], r = [0, 0, 0], s = [1, 1, 1]) {
  const g = geo.index ? geo.toNonIndexed() : geo;
  g.applyMatrix4(new THREE.Matrix4().compose(new THREE.Vector3(...t), new THREE.Quaternion().setFromEuler(new THREE.Euler(...r)), new THREE.Vector3(...s)));
  const c = new THREE.Color(color), n = g.attributes.position.count, a = new Float32Array(n * 3);
  for (let i = 0; i < n; i++) { a[i * 3] = c.r; a[i * 3 + 1] = c.g; a[i * 3 + 2] = c.b; }
  g.setAttribute('color', new THREE.BufferAttribute(a, 3));
  if (g.attributes.uv) g.deleteAttribute('uv');
  return g;
}

/* ================= JAMAAH ================= */
export const SKINS = ['#c89770', '#a87453', '#ddb08a', '#87573a', '#d3a37a', '#b9845f'];
const IH = '#f6f3ec';
export const figMat = new THREE.MeshStandardMaterial({ vertexColors: true, roughness: .78 });
figMat.userData.keep = true;

// Pria menghadap +z; sisi kanannya = -x.
// outfit: 'ihram' (bahu kanan terbuka), 'ihramTutup' (kedua pundak tertutup), 'kasual'
function manLite(skin, o) {
  const top = IH, n = 8, bare = o !== 'ihramTutup';
  const p = [
    cg(Lathe([[0, .1], [.28, .12], [.3, .3], [.28, .7], [.25, 1.02], [0, 1.03]], n), IH),
    cg(Lathe([[0, .98], [.26, 1.0], [.29, 1.2], [.29, 1.42], [.2, 1.55], [0, 1.58]], n), top),
    bare ? cg(new THREE.SphereGeometry(.15, 8, 5), skin, [-.18, 1.47, 0], [0, 0, 0], [1, .85, 1]) : null,
    cg(new THREE.CylinderGeometry(.06, .05, .58, 6), bare ? skin : top, [-.31, 1.2, 0], [0, 0, .12]),
    cg(new THREE.CylinderGeometry(.068, .058, .58, 6), top, [.31, 1.2, 0], [0, 0, -.12]),
    cg(new THREE.IcosahedronGeometry(.05, 0), skin, [-.36, .88, 0]), cg(new THREE.IcosahedronGeometry(.05, 0), skin, [.36, .88, 0]),
    cg(new THREE.CylinderGeometry(.065, .075, .14, 6), skin, [0, 1.62, 0]),
    cg(new THREE.SphereGeometry(.15, 10, 7), skin, [0, 1.79, 0], [0, 0, 0], [1, 1.08, 1]),
    cg(new THREE.SphereGeometry(.153, 10, 4, 0, Math.PI * 2, 0, Math.PI / 2.2), '#3a2d24', [0, 1.8, -.01]),
    cg(new THREE.BoxGeometry(.13, .07, .26), '#6b5a46', [-.11, .035, .05]), cg(new THREE.BoxGeometry(.13, .07, .26), '#6b5a46', [.11, .035, .05]),
  ].filter(Boolean);
  return mergeGeometries(p);
}
function womanLite(robe, hij, skin) {
  const n = 8;
  return mergeGeometries([
    cg(Lathe([[0, .02], [.36, .03], [.33, .4], [.25, 1.0], [.2, 1.3], [0, 1.32]], n), robe),
    cg(new THREE.CylinderGeometry(.065, .065, .6, 6), robe, [-.27, 1.1, .02], [0, 0, .15]), cg(new THREE.CylinderGeometry(.065, .065, .6, 6), robe, [.27, 1.1, .02], [0, 0, -.15]),
    cg(new THREE.IcosahedronGeometry(.05, 0), skin, [-.33, .8, .03]), cg(new THREE.IcosahedronGeometry(.05, 0), skin, [.33, .8, .03]),
    cg(Lathe([[0, 1.15], [.32, 1.16], [.27, 1.42], [.17, 1.58], [0, 1.62]], n), hij),
    cg(new THREE.SphereGeometry(.175, 10, 7), hij, [0, 1.71, -.01], [0, 0, 0], [1, 1.08, 1]),
    cg(new THREE.SphereGeometry(.1, 8, 6), skin, [0, 1.7, .095], [0, 0, 0], [.82, 1.08, .55]),
  ]);
}
export function manGeo(skin, opt = {}) {
  const o = opt.outfit || 'ihram', n = opt.n;
  const low = o === 'kasual' ? '#3b3f46' : IH, top = o === 'kasual' ? (opt.shirt || '#6d4b2f') : IH;
  const bare = o === 'ihram';
  const p = [
    cg(Lathe([[0, .1], [.27, .12], [.3, .26], [.29, .6], [.265, .92], [.25, 1.02], [0, 1.03]], n), low),
    cg(Lathe([[0, .98], [.25, 1.0], [.27, 1.14], [.265, 1.34], [.22, 1.49], [.1, 1.58], [0, 1.59]], n), top),
    cg(Sph(.155, n), bare ? skin : top, [-.17, 1.48, 0], [0, 0, 0], [1, .8, 1]),
    cg(Sph(.155, n), top, [.17, 1.48, 0], [0, 0, 0], [1, .8, 1]),
    opt.raise ? cg(Cap(.055, .5, n), bare ? skin : top, [-.34, 1.66, .17], [-.9, 0, -.5]) : cg(Cap(.055, .5, n), bare ? skin : top, [-.3, 1.2, 0], [0, 0, .12]),
    cg(Cap(.065, .48, n), top, [.3, 1.2, 0], [0, 0, -.12]),
    cg(Sph(.052, n), skin, [-.35, .87, 0]), cg(Sph(.052, n), skin, [.35, .87, 0]),
    cg(Cyl(.065, .075, .12, n), skin, [0, 1.62, 0]),
    cg(Sph(.15, n), skin, [0, 1.79, 0], [0, 0, 0], [1, 1.08, 1.02]),
    cg(Sph(.04, 8), skin, [-.145, 1.79, 0]), cg(Sph(.04, 8), skin, [.145, 1.79, 0]),
    o === 'kasual' ? cg(Cyl(.15, .15, .13, n), '#151515', [0, 1.92, 0]) : cg(new THREE.SphereGeometry(.153, n || SEG(18, 10), 8, 0, Math.PI * 2, 0, Math.PI / 2.2), '#3a2d24', [0, 1.8, -.01]),
  ];
  if (!opt.noFeet) p.push(cg(Cap(.06, .14, 8), o === 'kasual' ? '#2a2a2a' : '#6b5a46', [-.11, .05, .05], [Math.PI / 2, 0, 0]), cg(Cap(.06, .14, 8), o === 'kasual' ? '#2a2a2a' : '#6b5a46', [.11, .05, .05], [Math.PI / 2, 0, 0]));
  return mergeGeometries(p);
}
export function womanGeo(robe, hij, skin, opt = {}) {
  const n = opt.n;
  const p = [
    cg(Lathe([[0, .02], [.36, .03], [.35, .28], [.29, .75], [.235, 1.12], [.2, 1.3], [0, 1.32]], n), robe),
    cg(Cap(.065, .5, n), robe, [-.27, 1.1, .02], [0, 0, .15]), cg(Cap(.065, .5, n), robe, [.27, 1.1, .02], [0, 0, -.15]),
    cg(Sph(.05, n), skin, [-.33, .8, .03]), cg(Sph(.05, n), skin, [.33, .8, .03]),
    cg(Lathe([[0, 1.15], [.32, 1.16], [.3, 1.34], [.22, 1.5], [.16, 1.6], [0, 1.62]], n), hij),
    cg(Sph(.175, n), hij, [0, 1.71, -.01], [0, 0, 0], [1, 1.08, 1]),
    cg(Sph(.1, n), skin, [0, 1.7, .095], [0, 0, 0], [.82, 1.08, .55]),
  ];
  if (!opt.noFeet) p.push(cg(Cap(.055, .12, 8), '#5d4c3c', [-.1, .05, .1], [Math.PI / 2, 0, 0]), cg(Cap(.055, .12, 8), '#5d4c3c', [.1, .05, .1], [Math.PI / 2, 0, 0]));
  return mergeGeometries(p);
}
let VAR;
function variants() {
  if (VAR) return VAR;
  VAR = [
    manLite(SKINS[0]), manLite(SKINS[1]), manLite(SKINS[2]), manLite(SKINS[3]), manLite(SKINS[4]),
    womanLite('#f3f0e8', '#f7f5ef', SKINS[2]), womanLite('#262626', '#1d1d1d', SKINS[1]),
    womanLite('#e9e1cf', '#ffffff', SKINS[5]), womanLite('#9aa0a6', '#f2f2f2', SKINS[0]), womanLite('#3c4a5a', '#f6f6f6', SKINS[4]),
  ];
  VAR.forEach(g => g.userData.keep = true);
  return VAR;
}

// Kerumunan ber-instance yang bisa bergerak. item: {x,z,ry} statis, atau
// {orbit:{r,a,w,sx,sz}} mengelilingi Ka'bah, atau {lane:{x,z,v,min,max}} bolak-balik sa'i.
export function makeCrowd(scene, items) {
  const V = variants(); const buckets = V.map(() => []);
  items.forEach(o => { o.s = o.s || R(.92, 1.06); o.ph = rnd() * 6.28; buckets[Math.floor(rnd() * V.length)].push(o); });
  const meshes = [];
  const m4 = new THREE.Matrix4(), q = new THREE.Quaternion(), e = new THREE.Euler(), v = new THREE.Vector3(), sc = new THREE.Vector3();
  buckets.forEach((b, i) => {
    if (!b.length) return;
    const im = new THREE.InstancedMesh(V[i], figMat, b.length);
    im.castShadow = DETAIL === 'halus'; im.receiveShadow = true; im.frustumCulled = false; scene.add(im);
    meshes.push({ im, b });
  });
  let t = 0;
  function update(dt) {
    t += dt;
    for (const { im, b } of meshes) {
      let dirty = false;
      for (let k = 0; k < b.length; k++) {
        const o = b[k]; let bob = 0;
        if (o.orbit) {
          const ob = o.orbit; ob.a += ob.w * dt;
          o.x = Math.cos(ob.a) * ob.r * ob.sx; o.z = -Math.sin(ob.a) * ob.r * ob.sz;
          o.ry = Math.atan2(-Math.sin(ob.a), -Math.cos(ob.a)) + (o.jit || 0);
          bob = Math.abs(Math.sin(t * 6 + o.ph)) * .05; dirty = true;
        } else if (o.lane) {
          const L = o.lane; o.x += L.v * dt;
          if (o.x > L.max) o.x = L.min; if (o.x < L.min) o.x = L.max;
          o.ry = L.v > 0 ? Math.PI / 2 : -Math.PI / 2;
          bob = Math.abs(Math.sin(t * 6 + o.ph)) * .05; dirty = true;
        } else if (k === 0 && !o._init) { dirty = true; }
        if (dirty || !o._init) {
          e.set(0, o.ry, 0); q.setFromEuler(e); v.set(o.x, (o.y || 0) + bob, o.z); sc.set(o.s, o.s, o.s);
          m4.compose(v, q, sc); im.setMatrixAt(k, m4); o._init = true;
        }
      }
      im.instanceMatrix.needsUpdate = true;
    }
  }
  update(0);
  return { update, meshes };
}

// Karakter pemain: tubuh + 2 kaki terpisah (untuk animasi jalan) + cincin penanda.
export function makeHero(gender, outfit, opt = {}) {
  const g = new THREE.Group();
  const skin = SKINS[2];
  let geo;
  const n = SEG(22, 10);
  if (gender === 'L') geo = manGeo(skin, { outfit, noFeet: true, raise: opt.raise, n });
  else geo = outfit === 'kasual' ? womanGeo('#b9566f', '#e7b7c2', skin, { noFeet: true, n }) : womanGeo('#f4f1ea', '#fbfaf6', skin, { noFeet: true, n });
  const body = new THREE.Mesh(geo, figMat); body.castShadow = true; g.add(body);
  const fc = outfit === 'kasual' && gender === 'L' ? '#2a2a2a' : '#6b5a46';
  const fm = new THREE.MeshStandardMaterial({ color: fc, roughness: .7 });
  const feet = [-.11, .11].map(x => { const f = new THREE.Mesh(Cap(.065, .15, 10), fm); f.rotation.x = Math.PI / 2; f.position.set(x, .055, .05); f.castShadow = true; g.add(f); return f; });
  const ring = new THREE.Mesh(new THREE.TorusGeometry(.6, .04, 10, 64), new THREE.MeshBasicMaterial({ color: '#F2C95C' }));
  ring.rotation.x = Math.PI / 2; ring.position.y = .04; g.add(ring);
  const glow = new THREE.Mesh(new THREE.CircleGeometry(.6, 48), new THREE.MeshBasicMaterial({ color: '#F2C95C', transparent: true, opacity: .22, depthWrite: false }));
  glow.rotation.x = -Math.PI / 2; glow.position.y = .03; g.add(glow);
  g.userData = { body, feet, ring };
  return g;
}

/* ================= TEKSTUR ================= */
export function canvasTex(w, h, draw, rep) { const c = document.createElement('canvas'); c.width = w; c.height = h; draw(c.getContext('2d'), w, h); const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; if (rep) { t.wrapS = t.wrapT = THREE.RepeatWrapping; t.repeat.set(...rep); } t.anisotropy = 4; return t; }
export const marbleTex = (rings, size = 1024) => canvasTex(size, size, (g, w, h) => {
  g.fillStyle = '#f1eee7'; g.fillRect(0, 0, w, h);
  for (let i = 0; i < 160; i++) { g.strokeStyle = `rgba(150,140,125,${R(.03, .09)})`; g.lineWidth = R(.5, 2); g.beginPath(); let x = R(0, w), y = R(0, h); g.moveTo(x, y); for (let k = 0; k < 6; k++) { x += R(-60, 60); y += R(-60, 60); g.lineTo(x, y); } g.stroke(); }
  g.strokeStyle = 'rgba(120,110,95,.17)'; g.lineWidth = 2;
  if (rings) { for (let r = 60; r < w / 2; r += 48) { g.beginPath(); g.arc(w / 2, h / 2, r, 0, 7); g.stroke(); } }
  else { for (let x = 0; x < w; x += 64) { g.beginPath(); g.moveTo(x, 0); g.lineTo(x, h); g.stroke(); g.beginPath(); g.moveTo(0, x); g.lineTo(w, x); g.stroke(); } }
});
const kiswahTex = () => canvasTex(512, 512, (g, w, h) => {
  g.fillStyle = '#121110'; g.fillRect(0, 0, w, h); g.strokeStyle = 'rgba(255,255,255,.035)'; g.lineWidth = 3;
  for (let y = 0; y < h; y += 64) for (let x = 0; x < w; x += 64) { g.beginPath(); g.arc(x + 32, y + 32, 22, 0, 7); g.stroke(); g.beginPath(); g.moveTo(x, y + 32); g.lineTo(x + 64, y + 32); g.stroke(); }
}, [4, 5]);
const bandTex = () => canvasTex(1024, 64, (g, w, h) => {
  g.fillStyle = '#1a1714'; g.fillRect(0, 0, w, h); g.strokeStyle = '#d4af5a'; g.lineWidth = 2.2; g.strokeRect(2, 4, w - 4, h - 8);
  for (let x = 14; x < w; x += 22) { g.beginPath(); g.moveTo(x, 44); g.bezierCurveTo(x + 4, 14, x + 12, 14, x + 9, 34); g.quadraticCurveTo(x + 16, 46, x + 20, 26); g.stroke(); }
}, [3, 1]);
export function textPlane(text, w, h, bg = '#1E5B46', fg = '#fff') {
  const t = canvasTex(512, Math.round(512 * h / w), (g, W, H) => { g.fillStyle = bg; g.fillRect(0, 0, W, H); g.fillStyle = fg; g.font = `bold ${Math.round(H * .5)}px sans-serif`; g.textAlign = 'center'; g.textBaseline = 'middle'; g.fillText(text, W / 2, H / 2 + 2); });
  return new THREE.Mesh(new THREE.PlaneGeometry(w, h), new THREE.MeshBasicMaterial({ map: t, toneMapped: false }));
}

/* ================= KA'BAH & MASJIDIL HARAM ================= */
// Sumbu: pojok Hajar Aswad = (+KW/2, +KD/2); sisi pintu = +x (Multazam & Maqam Ibrahim);
// Hijir Ismail = sisi -z. Thawaf berlawanan jarum jam: HA → Iraqi → Syami → Yamani → HA.
export const KW = 10.5, KD = 12, KH = 14;
export const HIJIR = { cx: 0, cz: -KD / 2, rIn: 7.6, rOut: 8.3 };
export const MAQAM = { x: KW / 2 + 10, z: KD / 2 - 3.5 };
export function kaaba(scene) {
  const g = new THREE.Group(); scene.add(g);
  add(g, Box(KW + .8, .55, KD + .8), M('#d9d3c6', { r: .5 }), 0, .27, 0);
  add(g, Box(KW, KH, KD), M('#ffffff', { map: kiswahTex(), r: .72 }), 0, .55 + KH / 2, 0);
  add(g, Box(KW + .06, 2.6, KD + .06), M('#f4f2ec', { r: .9 }), 0, .55 + 1.3, 0);
  add(g, Box(KW + .08, 1.0, KD + .08), M('#ffffff', { map: bandTex(), r: .45, m: .3, flat: false }), 0, .55 + KH * .7, 0);
  add(g, Box(.2, 3.7, 2.2), M('#c9a24a', { m: .8, r: .3 }), KW / 2 + .05, 4.05, KD / 2 - 3.2);
  add(g, Box(.1, 4.1, 2.6), M('#1a1714'), KW / 2 + .02, 4.05, KD / 2 - 3.2);
  const hs = add(g, new THREE.TorusGeometry(.32, .08, 8, 20), M('#cfd2d6', { m: 1, r: .25 }), KW / 2 + .05, 1.5, KD / 2 + .05); hs.rotation.y = Math.PI / 4;
  add(g, Ico(.24, 1), M('#2a2522', { r: .3 }), KW / 2 + .02, 1.5, KD / 2 + .02);
  const sh = new THREE.Shape(); sh.absarc(0, 0, HIJIR.rOut, -Math.PI / 2, Math.PI / 2, false); sh.absarc(0, 0, HIJIR.rIn, Math.PI / 2, -Math.PI / 2, true);
  const hm = new THREE.Mesh(new THREE.ExtrudeGeometry(sh, { depth: 1.35, bevelEnabled: false, curveSegments: 40 }), M('#ece6d8', { r: .5, flat: false }));
  hm.rotation.x = -Math.PI / 2; hm.castShadow = hm.receiveShadow = true;
  const hg = new THREE.Group(); hg.add(hm); hg.rotation.y = Math.PI / 2; hg.position.z = -KD / 2; scene.add(hg);
  const mq = new THREE.Group(); mq.position.set(MAQAM.x, 0, MAQAM.z); scene.add(mq);
  add(mq, Cyl(.9, 1.0, .5), M('#e6e1d4'), 0, .25, 0);
  add(mq, Cyl(.75, .75, 2.0), M('#e8c870', { m: .9, r: .25, op: .8 }), 0, 1.5, 0);
  add(mq, new THREE.SphereGeometry(.78, 24, 10, 0, Math.PI * 2, 0, Math.PI / 2), M('#d7b24f', { m: .9, r: .3 }), 0, 2.5, 0);
  add(mq, new THREE.ConeGeometry(.12, .7, 6), M('#d7b24f', { m: .9, r: .3 }), 0, 3.5, 0);
  // garis & lampu hijau penanda Hajar Aswad (garis radial dari pojok HA)
  const a = Math.atan2(KD / 2, KW / 2);
  const line = add(scene, Box(34, .02, .35), new THREE.MeshBasicMaterial({ color: '#7d6a3f', transparent: true, opacity: .55 }), 0, .02, 0, false);
  line.rotation.y = a; line.position.set(Math.cos(a) * 25, .02, Math.sin(a) * 25);
  return g;
}
export function haram(scene, opt = {}) {
  const night = opt.night !== false;
  const floor = new THREE.Mesh(new THREE.CircleGeometry(80, 96), M('#ffffff', { map: marbleTex(true), r: .32, flat: false }));
  floor.rotation.x = -Math.PI / 2; floor.receiveShadow = true; scene.add(floor);
  const RX = 46, RZ = 40, N = 84;
  const col = M('#e2d6bd', { r: .7 }), dome = M('#cfc2a6', { r: .6 }), lamp = M('#fff3d6', { e: '#ffe2a8', ei: night ? 2.2 : .2 });
  const colGeo = Cyl(.45, .5, 7, SEG(14, 8)), domeGeo = new THREE.SphereGeometry(2.2, SEG(24, 12), SEG(10, 6), 0, Math.PI * 2, 0, Math.PI / 2), lampGeo = new THREE.SphereGeometry(.3, 8, 6);
  for (let i = 0; i < N; i++) {
    const a = i / N * Math.PI * 2, x = Math.cos(a) * RX, z = Math.sin(a) * RZ;
    add(scene, colGeo, col, x, 3.5, z, false);
    if (i % 2 === 0) add(scene, domeGeo, dome, Math.cos(a) * (RX + 3.5), 8.2, Math.sin(a) * (RZ + 3.5), false);
    add(scene, lampGeo, lamp, Math.cos(a) * (RX - .6), 6.2, Math.sin(a) * (RZ - .6), false);
    const a1 = (i + 1) / N * Math.PI * 2;
    const x0 = Math.cos(a) * (RX + 3.5), z0 = Math.sin(a) * (RZ + 3.5), x1 = Math.cos(a1) * (RX + 3.5), z1 = Math.sin(a1) * (RZ + 3.5);
    const b = add(scene, Box(Math.hypot(x1 - x0, z1 - z0) + .3, 1.4, 8), col, (x0 + x1) / 2, 7.4, (z0 + z1) / 2, false);
    b.rotation.y = -Math.atan2(z1 - z0, x1 - x0);
  }
  const winTex = canvasTex(512, 256, (g, w, h) => { g.fillStyle = '#d8ccb2'; g.fillRect(0, 0, w, h); for (let y = 20; y < h; y += 64) for (let x = 10; x < w; x += 42) { g.fillStyle = night ? '#ffd88a' : '#7b6c56'; g.beginPath(); g.roundRect(x, y, 22, 40, [11, 11, 0, 0]); g.fill(); } }, [16, 1]);
  const ring = new THREE.Mesh(new THREE.CylinderGeometry(1, 1, 26, 96, 1, true), M('#ffffff', { map: winTex, side: THREE.BackSide, e: night ? '#3a2e1a' : 0, ei: .6, flat: false }));
  ring.scale.set(RX + 16, 1, RZ + 16); ring.position.y = 13; scene.add(ring);
  const mn = M('#e6dcc6', { r: .6 }), gold = M('#cfa654', { m: .8, r: .3 });
  [.2, .9, 1.6, 2.4, 3.3, 4.4, 5.4].forEach(a => {
    const x = Math.cos(a) * (RX + 22), z = Math.sin(a) * (RZ + 22);
    add(scene, Cyl(1.3, 1.6, 62), mn, x, 31, z, false); add(scene, Cyl(2.2, 2.2, 1.2), mn, x, 44, z, false); add(scene, Cyl(2.0, 2.0, 1.2), mn, x, 56, z, false);
    add(scene, new THREE.ConeGeometry(1.3, 6, SEG(16, 8)), gold, x, 65, z, false);
    if (night) add(scene, new THREE.SphereGeometry(.6, 8, 6), M('#fff', { e: '#9fe0ff', ei: 2 }), x, 69, z, false);
  });
  const ct = new THREE.Group(); ct.position.set(-110, 0, 120); ct.rotation.y = Math.PI / 4; scene.add(ct);
  add(ct, Box(40, 120, 40), M('#bfb39c'), 0, 60, 0, false); add(ct, Box(26, 70, 26), M('#c9bda5'), 0, 155, 0, false);
  for (let s = 0; s < 4; s++) { const f = add(ct, new THREE.CircleGeometry(10, 32), M('#fff', { e: night ? '#cff7d8' : '#ddd', ei: night ? 1.6 : .2 }), 0, 165, 0, false); f.rotation.y = s * Math.PI / 2; f.translateZ(13.2); }
  add(ct, new THREE.ConeGeometry(9, 40, 8), M('#d1b46a', { m: .7, r: .3 }), 0, 210, 0, false);
  [[-160, 70], [-60, 160]].forEach(([x, z]) => add(scene, Box(34, 90, 30), M('#b9ad96'), x, 45, z, false));
  [-100, -30, 40, 110].forEach((x, i) => add(scene, Box(30, 50 + i * 12, 30), M('#a99e89'), x, 30, -150, false));
}
export function nightLights(scene, focus = [0, 0]) {
  scene.background = new THREE.Color('#0c1526'); scene.fog = new THREE.Fog('#0c1526', 120, 320);
  scene.add(new THREE.HemisphereLight('#8aa0d0', '#efe2c6', 1.1));
  const d = new THREE.DirectionalLight('#ffe9c9', 1.6); d.position.set(focus[0] + 30, 60, focus[1] + 25); d.target.position.set(focus[0], 0, focus[1]);
  d.castShadow = true; d.shadow.mapSize.set(SHADOW(), SHADOW()); Object.assign(d.shadow.camera, { left: -40, right: 40, top: 40, bottom: -40, far: 160 }); d.shadow.bias = -.0006;
  scene.add(d, d.target);
  const fill = new THREE.DirectionalLight('#c8d6ff', .5); fill.position.set(-40, 30, -30); scene.add(fill);
  return d;
}
export function dayLights(scene, sunPos = [60, 70, 40], hemi = 1.0, span = 60) {
  scene.add(new THREE.HemisphereLight('#cfe3ff', '#e6d6b8', hemi));
  const d = new THREE.DirectionalLight('#fff1d8', 2.6); d.position.set(...sunPos); d.castShadow = true;
  d.shadow.mapSize.set(SHADOW(), SHADOW()); Object.assign(d.shadow.camera, { left: -span, right: span, top: span, bottom: -span, far: 260 }); d.shadow.bias = -.0006; scene.add(d, d.target);
  return d;
}
export function skyGrad(scene, top, bot) { scene.background = canvasTex(16, 512, (g, w, h) => { const gr = g.createLinearGradient(0, 0, 0, h); gr.addColorStop(0, top); gr.addColorStop(1, bot); g.fillStyle = gr; g.fillRect(0, 0, w, h); }); }

/* ================= MAS'A (SA'I) ================= */
export const SAI = { L: 70, W: 18, H: 10, shafa: -30, marwah: 30, g0: -6, g1: 6 };
export function masa(scene) {
  const { L, W: Wd, H: Hc } = SAI, LL = L + 16;
  skyGrad(scene, '#1a2232', '#2a3142');
  scene.add(new THREE.HemisphereLight('#fff6e6', '#d9cdb5', 1.4));
  const d = new THREE.DirectionalLight('#fff4e0', 1.1); d.position.set(10, 30, 8); d.castShadow = true; d.shadow.mapSize.set(SHADOW(), SHADOW()); Object.assign(d.shadow.camera, { left: -45, right: 45, top: 45, bottom: -45 }); scene.add(d);
  const mt = marbleTex(false); mt.wrapS = mt.wrapT = THREE.RepeatWrapping; mt.repeat.set(6, 1);
  const fl = new THREE.Mesh(new THREE.PlaneGeometry(LL, Wd), M('#fff', { map: mt, r: .3, flat: false })); fl.rotation.x = -Math.PI / 2; fl.receiveShadow = true; scene.add(fl);
  add(scene, Box(LL, .6, Wd + 2), M('#efe7d6', { r: .7 }), 0, Hc + .3, 0, false);
  const wall = M('#e9dfca', { r: .8 });
  add(scene, Box(LL, Hc, .5), wall, 0, Hc / 2, -Wd / 2 - .3, false); add(scene, Box(LL, Hc, .5), wall, 0, Hc / 2, Wd / 2 + .3, false);
  add(scene, Box(L - 10, .9, .5), M('#cdbf9f'), 0, .45, 0);
  const colm = M('#f3ecdc', { r: .5 }), cgeo = Box(1, Hc, 1);
  for (let x = -L / 2 + 4; x < L / 2; x += 8) [-Wd / 2 + 1.2, Wd / 2 - 1.2].forEach(z => add(scene, cgeo, colm, x, Hc / 2, z, false));
  const lgeo = Box(.8, .2, Wd - 1), lmat = M('#fff', { e: '#fff3dc', ei: 1.1 });
  for (let x = -L / 2 + 4; x < L / 2; x += 8) add(scene, lgeo, lmat, x + 4, Hc - .05, 0, false);
  const gm = M('#7dffa8', { e: '#33ff7a', ei: 2.4 });
  for (let x = SAI.g0; x <= SAI.g1; x += 1.5) add(scene, Box(1, .15, Wd - 2), gm, x, Hc - .1, 0, false);
  [SAI.g0, SAI.g1].forEach(x => [-Wd / 2 + .5, Wd / 2 - .5].forEach(z => add(scene, Box(.5, Hc - 1, .3), M('#7dffa8', { e: '#2bff70', ei: 2.6 }), x, Hc / 2, z, false)));
  const zone = new THREE.Mesh(new THREE.PlaneGeometry(SAI.g1 - SAI.g0, Wd), new THREE.MeshBasicMaterial({ color: '#2bff70', transparent: true, opacity: .07, depthWrite: false }));
  zone.rotation.x = -Math.PI / 2; zone.position.y = .02; scene.add(zone);
  const gl = new THREE.PointLight('#5dff95', 40, 25, 1.6); gl.position.set(0, Hc - 1, 0); scene.add(gl);
  const rock = M('#8d7258', { r: .95, flat: true });
  [[-1, 'SHAFA'], [1, 'MARWAH']].forEach(([s, name]) => {
    const cx = s * (L / 2 + 2);
    for (let i = 0; i < 9; i++) add(scene, Ico(R(1.2, 2.4), 0), rock, cx + s * R(0, 3), R(.3, 1.4), R(-4, 4));
    add(scene, Box(.2, 1.2, 10), M('#bfe4ff', { op: .35, r: .1 }), cx - s * 3, .6, 0, false);
    add(scene, Box(.6, Hc, Wd + 2), M('#e3d7bf'), s * (LL / 2), Hc / 2, 0, false);
    add(scene, new THREE.SphereGeometry(7, 16, 8, 0, Math.PI * 2, 0, Math.PI / 2), M('#efe4cc', { side: THREE.BackSide }), cx, Hc, 0, false);
    const sg = textPlane(name, 5, 1.2); sg.position.set(cx - s * 4, Hc - 2, 0); sg.rotation.y = s > 0 ? -Math.PI / 2 : Math.PI / 2; scene.add(sg);
    const sg2 = textPlane(name, 5, 1.2); sg2.position.set(cx - s * 4, Hc - 2, 0); sg2.rotation.y = s > 0 ? Math.PI / 2 : -Math.PI / 2; scene.add(sg2);
  });
}

/* ================= MASJID MIQAT QARNUL MANAZIL (TAIF) ================= */
export function masjidMiqat(scene) {
  skyGrad(scene, '#6fa6dc', '#f3e3c3'); scene.fog = new THREE.Fog('#efe0c4', 140, 380);
  dayLights(scene, [70, 55, 50], 1.1);
  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(600, 600), M('#d9c6a1', { r: 1 })); gnd.rotation.x = -Math.PI / 2; gnd.receiveShadow = true; scene.add(gnd);
  const mt = marbleTex(false); const plaza = new THREE.Mesh(new THREE.PlaneGeometry(90, 50), M('#fff', { map: mt, r: .45, flat: false })); plaza.rotation.x = -Math.PI / 2; plaza.position.set(0, .02, 20); plaza.receiveShadow = true; scene.add(plaza);
  const wallM = M('#f1ebe0', { r: .8 }), trim = M('#c7a77a', { r: .7 }), dark = M('#5a4c3e');
  add(scene, Box(80, 12, 40), wallM, 0, 6, -24);
  for (let x = -36; x <= 36; x += 6) { if (x === 0) continue; add(scene, Box(3.2, 7, .6), dark, x, 4.2, -3.8); add(scene, Cyl(1.6, 1.6, .6, 20), dark, x, 7.7, -3.8).rotation.x = Math.PI / 2; }
  // pintu utama
  add(scene, Box(6, 9, .7), M('#3e3328'), 0, 4.5, -3.75); add(scene, Cyl(3, 3, .7, 24), M('#3e3328'), 0, 9, -3.75).rotation.x = Math.PI / 2;
  add(scene, Box(82, 1.2, 42), trim, 0, 12.4, -24);
  for (let x = -38; x <= 38; x += 4) add(scene, Box(1.4, 1.6, 1.4), trim, x, 13.6, -3.6);
  const mx = 46, mz = -12, mm = M('#efe6d6', { r: .7 });
  add(scene, Cyl(2.4, 3, 64, 10), mm, mx, 32, mz);
  for (let y = 10; y < 62; y += 6) add(scene, Cyl(2.9, 2.9, .6, 10), trim, mx, y, mz);
  add(scene, Cyl(3.6, 3.6, 1.6, 10), trim, mx, 64, mz); add(scene, Cyl(1.8, 2.2, 8, 10), mm, mx, 69, mz);
  add(scene, new THREE.ConeGeometry(1.8, 6, 10), M('#d8b56c', { m: .6, r: .35 }), mx, 76, mz);
  const trunk = M('#8a6a49'), leaf = M('#4f7d3a', { r: .8, flat: true });
  [[-30, 30], [-18, 36], [18, 36], [30, 30], [-42, 12], [40, 18], [-55, 30], [56, 34]].forEach(([x, z]) => palm(scene, x, z, trunk, leaf));
  const sign = textPlane('MIQAT QARNUL MANAZIL · TAIF', 14, 1.6, '#1E5B46'); sign.position.set(0, 11, -3.3); scene.add(sign);
}
export function palm(scene, x, z, trunk = M('#8a6a49'), leaf = M('#4f7d3a', { r: .8, flat: true })) {
  add(scene, Cyl(.35, .5, 9, 6), trunk, x, 4.5, z);
  for (let k = 0; k < 7; k++) { const l = add(scene, new THREE.ConeGeometry(.7, 5.2, 4), leaf, x, 9, z); l.rotation.set(Math.PI / 2.4, k / 7 * Math.PI * 2, 0, 'YXZ'); l.translateY(2.2); }
}
export function bus(par, x, z, ry = 0) {
  const b = new THREE.Group(); b.position.set(x, 0, z); b.rotation.y = ry; par.add(b);
  add(b, Box(3.2, 3.6, 24), M('#f5f5f2', { r: .4 }), 0, 2.4, 0); add(b, Box(3.25, 1.2, 23.4), M('#1f2a33', { r: .2, m: .3 }), 0, 3, 0);
  add(b, Box(3.26, .5, 24.1), M('#1E5B46'), 0, 1.3, 0); add(b, Box(3.0, 1.3, .1), M('#1f2a33', { r: .2, m: .3 }), 0, 3, 12.02);
  [-8, 8].forEach(w => [-1.6, 1.6].forEach(s => { add(b, Cyl(.6, .6, .4, 10), M('#222'), s, .6, w).rotation.z = Math.PI / 2; }));
  return b;
}

/* ================= HOTEL ================= */
export const ROOM = { W: 9, D: 8, H: 3.2 };
export function hotelRoom(scene) {
  const { W: RW, D: RD, H: RH } = ROOM;
  scene.background = new THREE.Color('#2b241c');
  scene.add(new THREE.HemisphereLight('#fff1dc', '#6e5a44', 1.0));
  const sun = new THREE.DirectionalLight('#ffe2b0', 3.0); sun.position.set(-14, 9, 2); sun.target.position.set(1, 0, 0); sun.castShadow = true; sun.shadow.mapSize.set(SHADOW(), SHADOW()); Object.assign(sun.shadow.camera, { left: -8, right: 8, top: 8, bottom: -8 }); scene.add(sun, sun.target);
  const lampL = new THREE.PointLight('#ffcf8a', 8, 9, 1.5); lampL.position.set(3, 2.1, -2.6); scene.add(lampL);
  const carpet = canvasTex(512, 512, (g, w, h) => { g.fillStyle = '#7b2f2a'; g.fillRect(0, 0, w, h); g.strokeStyle = '#c99a4a'; g.lineWidth = 6; g.strokeRect(30, 30, w - 60, h - 60); g.strokeStyle = 'rgba(201,154,74,.5)'; g.lineWidth = 3; for (let i = 0; i < 6; i++) { g.beginPath(); g.arc(w / 2, h / 2, 30 + i * 30, 0, 7); g.stroke(); } });
  add(scene, new THREE.PlaneGeometry(RW, RD), M('#c7b79c', { r: .9 })).rotation.x = -Math.PI / 2;
  add(scene, new THREE.PlaneGeometry(3.4, 2.6), M('#fff', { map: carpet, flat: false }), .4, .01, 1.2).rotation.x = -Math.PI / 2;
  const wl = M('#eadfcc', { r: .95 });
  add(scene, Box(RW, RH, .2), wl, 0, RH / 2, -RD / 2, false);
  add(scene, Box(RW, RH, .2), wl, 0, RH / 2, RD / 2, false);
  add(scene, Box(.2, RH, 2.7), wl, -RW / 2, RH / 2, -RD / 2 + 1.35, false); add(scene, Box(.2, RH, 2.7), wl, -RW / 2, RH / 2, RD / 2 - 1.35, false);
  add(scene, Box(.2, .7, 2.8), wl, -RW / 2, .35, 0, false); add(scene, Box(.2, .6, 2.8), wl, -RW / 2, RH - .3, 0, false);
  add(scene, Box(.2, RH, RD), wl, RW / 2, RH / 2, 0, false);
  add(scene, Box(RW, .2, RD), M('#f3ece0'), 0, RH + .1, 0, false);
  const sky = add(scene, new THREE.PlaneGeometry(40, 20), M('#bfe0ff', { e: '#cfe6ff', ei: .9 }), -12, 4, 0, false); sky.rotation.y = Math.PI / 2;
  // pemandangan Makkah: menara jam & gedung
  const far = M('#d9cdb4', { e: '#6d6352', ei: .35 });
  add(scene, Box(1.6, 7, 1.6), far, -11, 3.5, .3, false); add(scene, Box(1.1, 2.4, 1.1), far, -11, 8.2, .3, false);
  add(scene, new THREE.CircleGeometry(.42, 24), M('#fff', { e: '#dff7e4', ei: 1.2 }), -10.4, 8.4, .3, false).rotation.y = Math.PI / 2;
  add(scene, new THREE.ConeGeometry(.6, 2, 12), M('#d1b46a', { m: .6, r: .3, e: '#6d5a2a', ei: .3 }), -11, 10.4, .3, false);
  [[-1.8, 4], [2.2, 5.5], [-3, 3]].forEach(([z, h]) => add(scene, Box(1.4, h, 1.4), M('#cfc4ad', { e: '#5e5646', ei: .3 }), -12, h / 2, z, false));
  [-1.55, 1.55].forEach(z => add(scene, Box(.12, RH - .2, .45), M('#b99868'), -RW / 2 + .2, RH / 2, z));
  // kasur + kain ihram terlipat
  add(scene, Box(2.4, .5, 3.2), M('#5d4a38'), 2.6, .25, -2.2); add(scene, Box(2.3, .3, 3.1), M('#ffffff', { r: .95 }), 2.6, .62, -2.2);
  add(scene, Box(2.5, 1.1, .15), M('#5d4a38'), 2.6, .85, -3.85);
  const ihram = new THREE.Group(); scene.add(ihram);
  add(ihram, Box(.9, .14, .6), M('#f7f4ec'), 2.1, .84, -1.6).rotation.y = .1; add(ihram, Box(.8, .12, .55), M('#f7f4ec'), 2.15, .97, -1.65).rotation.y = -.05;
  // koper & nakas
  add(scene, Box(.75, 1.0, .4), M('#2f6b55', { r: .5 }), 3.9, .5, .6).rotation.y = -.3;
  add(scene, Box(.7, .6, .6), M('#6e5843'), 4.0, .3, -3.5); add(scene, Cyl(.15, .2, .45, 8), M('#f3e3c4', { e: '#ffcf8a', ei: .8 }), 4.0, .85, -3.5);
  // meja rias & parfum
  add(scene, Box(1.2, 1.6, .06), M('#a9bccb', { m: .2, r: .15, e: '#3d4a55', ei: .4 }), -1.1, 1.6, -RD / 2 + .15);
  add(scene, Box(1.5, .1, .5), M('#6e5843'), -1.1, .8, -RD / 2 + .4); add(scene, Box(.08, .8, .4), M('#6e5843'), -1.75, .4, -RD / 2 + .4); add(scene, Box(.08, .8, .4), M('#6e5843'), -.45, .4, -RD / 2 + .4);
  add(scene, Cyl(.06, .07, .18, 8), M('#e8c870', { m: .7, r: .2 }), -1.0, .94, -RD / 2 + .4);
  // buku manasik di meja kecil
  add(scene, Box(.9, .7, .6), M('#6e5843'), -3.6, .35, 2.6); add(scene, Box(.34, .05, .25), M('#1E5B46'), -3.6, .73, 2.6);
  // pintu kamar mandi (dinding kanan) & pintu keluar (dinding depan)
  add(scene, Box(.12, 2.3, 1.1), M('#8a6a49'), RW / 2 - .08, 1.15, 2.4);
  const lbl = textPlane('KAMAR MANDI', 1.1, .25, '#3e3328'); lbl.position.set(RW / 2 - .16, 2.5, 2.4); lbl.rotation.y = -Math.PI / 2; scene.add(lbl);
  add(scene, Box(1.2, 2.3, .12), M('#8a6a49'), 1.5, 1.15, RD / 2 - .08);
  const ex = textPlane('KELUAR', .9, .25, '#3e3328'); ex.position.set(1.5, 2.5, RD / 2 - .16); ex.rotation.y = Math.PI; scene.add(ex);
  // sajadah
  add(scene, new THREE.PlaneGeometry(.7, 1.2), M('#1E5B46'), -2.2, .015, .9).rotation.x = -Math.PI / 2;
  return { ihram };
}
