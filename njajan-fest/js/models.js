// Njajan Fest — semua model 3D low-poly (gaya Islanders): daun teratai, lapak ranting, jajanan, warga, tokoh
import * as THREE from '../vendor/three.module.min.js';
let P = null;               // induk tempat model baru ditambahkan
export function setParent(p) { const old = P; P = p; return old; }
export function inGroup(x, z, fn, parent) { const g = new THREE.Group(); g.position.set(x, 0, z); const old = P; (parent || P).add(g); P = g; try { fn(); } finally { P = old; } return g; }
function rng(seed) { let s = seed >>> 0; return () => { s = (s * 1664525 + 1013904223) >>> 0; return s / 4294967296; }; }
const mc = {};
const M = (c, o = {}) => { const k = c + JSON.stringify(o); return mc[k] || (mc[k] = new THREE.MeshStandardMaterial({ color: c, roughness: 1, flatShading: true, ...o, metalness: 0 })); };
function add(geo, mat, x, y, z, parent = P) { const m = new THREE.Mesh(geo, mat); m.position.set(x, y, z); m.castShadow = true; m.receiveShadow = true; parent.add(m); return m; }
const GC = {};
const box = (w, h, d) => GC['b' + w + ',' + h + ',' + d] || (GC['b' + w + ',' + h + ',' + d] = new THREE.BoxGeometry(w, h, d));
const sph = r => GC['s' + r] || (GC['s' + r] = new THREE.IcosahedronGeometry(r, 1));
const cyl = (a, b, h, n = 7) => { const k = 'c' + a + ',' + b + ',' + h + ',' + n; return GC[k] || (GC[k] = new THREE.CylinderGeometry(a, b, Math.max(h, 0.001), Math.min(n, 9))); };
const white = M('#ffffff');
function emojiTex(e, ring = '#ff6b6b', bg = '#fff') {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  if (bg) { x.fillStyle = bg; x.beginPath(); x.arc(64, 64, 56, 0, 7); x.fill(); x.lineWidth = 10; x.strokeStyle = ring; x.stroke(); }
  x.font = '72px "Noto Color Emoji"'; x.textAlign = 'center'; x.textBaseline = 'middle'; x.fillText(e, 64, 70);
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function sprite(e, x, y, z, s = 0.7, ring, bg) { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: emojiTex(e, ring, bg), depthWrite: false })); sp.position.set(x, y, z); sp.scale.set(s, s, s); P.add(sp); return sp; }

const rip = M('#7fd3cf'), foamM = M('#ffffff');
function ripple(x, z, r) { if (r > 3.2 || r < 1.6) { const d = add(new THREE.CircleGeometry(r + 0.6, 20), rip, x, 0.005, z); d.rotation.x = -Math.PI / 2; d.castShadow = false; } }

// ---------- lily pad ----------
const PADY = 0.16;
function pad(x, z, r, notchAng = Math.PI / 2, col = '#8ccd55') {
  const sh = new THREE.Shape(); const gap = 0.32;
  const a0 = notchAng + gap / 2, a1 = notchAng - gap / 2 + Math.PI * 2;
  sh.moveTo(0, 0); sh.absarc(0, 0, r, a0, a1, false); sh.lineTo(0, 0);
  const g = new THREE.ExtrudeGeometry(sh, { depth: 0.12, bevelEnabled: true, bevelThickness: 0.05, bevelSize: 0.08, bevelSegments: 1, curveSegments: Math.round(10 + r * 3) });
  g.rotateX(-Math.PI / 2);
  const m = add(g, M(col, { roughness: 0.55 }), x, 0.0, z);
  // rim (slightly raised, darker)
  const rim = add(new THREE.TorusGeometry(r + 0.04, 0.07, 3, Math.round(10 + r * 3), a1 - a0), M('#7fbf55'), x, PADY - 0.02, z);
  const fo = add(new THREE.TorusGeometry(r + 0.22, 0.08, 2, Math.round(10 + r * 3), a1 - a0), foamM, x, 0.02, z); fo.rotation.x = -Math.PI / 2; fo.rotation.z = a0; fo.castShadow = false;
  const sh0 = add(new THREE.CircleGeometry(r + 1.1, Math.round(10 + r * 3)), rip, x, 0.004, z); sh0.rotation.x = -Math.PI / 2; sh0.castShadow = false;
  rim.rotation.x = -Math.PI / 2; rim.rotation.z = a0;
  // veins
  const vm = M('#a9dc78');
  for (let k = 0; k < 9; k++) {
    const a = a0 + (k + 0.5) / 9 * (a1 - a0);
    const v = add(box(r * 0.9, 0.014, 0.07 + r * 0.01), vm, x + Math.cos(a) * r * 0.47, PADY + 0.006, z - Math.sin(a) * r * 0.47);
    v.rotation.y = a; v.castShadow = false;
  }
  add(cyl(0.12, 0.12, 0.02, 12), vm, x, PADY + 0.01, z).castShadow = false;
  
  return m;
}
function smallPad(x, z, r, flower) {
  pad(x, z, r, (x * 7 + z) % 6.28, '#97d462');
  if (flower) lotus(x + r * 0.2, z, 0.5);
}
function lotus(x, z, s = 1, y = PADY) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); P.add(g);
  for (let ring = 0; ring < 2; ring++) for (let k = 0; k < 8; k++) {
    const a = k / 8 * Math.PI * 2 + ring * 0.4;
    const p = add(sph(0.3), M(ring ? '#ffd0dc' : '#f7a6bd'), Math.cos(a) * (0.32 - ring * 0.12), 0.25 + ring * 0.1, Math.sin(a) * (0.32 - ring * 0.12), g);
    p.scale.set(0.42, 1, 0.22); p.rotation.order = 'YXZ'; p.rotation.y = -a + Math.PI / 2; p.rotation.x = -(0.7 - ring * 0.35);
  }
  add(cyl(0.12, 0.09, 0.12, 14), M('#ffe17a'), 0, 0.42, 0, g);
  return g;
}
function cattail(x, z, h = 2.4, lean = 0) {
  const g = new THREE.Group(); g.position.set(x, 0, z); g.rotation.z = lean; P.add(g);
  add(cyl(0.03, 0.04, h, 6), M('#86b45a'), 0, h / 2, 0, g);
  add(new THREE.CapsuleGeometry(0.09, 0.45, 4, 10), M('#a8704a'), 0, h - 0.25, 0, g);
  add(cyl(0.01, 0.015, 0.3, 4), M('#86b45a'), 0, h + 0.15, 0, g);
  for (let k = 0; k < 2; k++) { const l = add(new THREE.ConeGeometry(0.05, h * 0.7, 4), M('#7fb04a'), 0.06 * (k ? 1 : -1), h * 0.35, 0.03, g); l.rotation.z = k ? -0.25 : 0.2; }
}
function reeds(x, z, n = 6, seed = 1) { const r = rng(seed); for (let k = 0; k < n; k++) { const h = 1.2 + r() * 1.6; const l = add(new THREE.ConeGeometry(0.05, h, 4), M(r() < 0.5 ? '#9cc96a' : '#86bb5c'), x + (r() - 0.5) * 0.8, h / 2, z + (r() - 0.5) * 0.8); l.rotation.z = (r() - 0.5) * 0.4; } }
function stone(x, z, s = 1, y = 0) { const g = new THREE.IcosahedronGeometry(0.5 * s, 0); const m = add(g, M('#d6cfc0'), x, y + 0.15 * s, z); m.scale.y = 0.6; return m; }

// ---------- twig / pond-element props ----------
const bark = M('#b07a52'), barkL = M('#d8a878'), twigM = M('#9a6a46');
function twig(x1, y1, z1, x2, y2, z2, r = 0.035, parent = P, mat = twigM) {
  const a = new THREE.Vector3(x1, y1, z1), b = new THREE.Vector3(x2, y2, z2), len = a.distanceTo(b);
  const m = add(cyl(r * 0.8, r, len, 6), mat, (x1 + x2) / 2, (y1 + y2) / 2, (z1 + z2) / 2, parent);
  m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), b.clone().sub(a).normalize());
  return m;
}
function log(x, y, z, len, r, rotY = 0, parent = P) { const m = add(cyl(r, r, len, 12), bark, x, y, z, parent); m.rotation.z = Math.PI / 2; m.rotation.y = rotY; m.rotation.order = 'YXZ'; const e1 = add(cyl(r * 0.85, r * 0.85, 0.02, 12), M('#d9b07a'), 0, 0, 0, parent); return m; }
const FOOD = { klepon: ['Klepon', '#5cb84f'], putu: ['Putu Bambu', '#e09a3a'], lemper: ['Lemper', '#3f9a62'], serabi: ['Serabi', '#f08a5a'], cendol: ['Es Cendol', '#4fb3e8'],
  getuk: ['Getuk', '#e86fa0'], cincin: ['Kue Cincin', '#b8743a'], gemblong: ['Gemblong', '#a0662e'], tehtarik: ['Teh Tarik', '#d98a3a'], wedang: ['Wedang Uwuh', '#b8402e'] };
// ikon jajanan digambar sendiri (tidak ada emoji putu/lemper/cendol)
function drawFood(x, kind, S = 128) {
  const k = S / 128; x.save(); x.scale(k, k);
  const leaf = (cx, cy, w, h) => { x.fillStyle = '#5aa845'; x.beginPath(); x.ellipse(cx, cy, w, h, 0, 0, 7); x.fill(); x.strokeStyle = '#8fd06a'; x.lineWidth = 3; x.beginPath(); x.moveTo(cx - w + 6, cy); x.lineTo(cx + w - 6, cy); x.stroke(); };
  if (kind === 'klepon') {
    leaf(64, 86, 46, 16);
    for (const [cx, cy] of [[46, 74], [82, 74], [64, 58]]) {
      x.fillStyle = '#3f9d3a'; x.beginPath(); x.arc(cx, cy, 17, 0, 7); x.fill();
      x.fillStyle = '#6cc35a'; x.beginPath(); x.arc(cx - 5, cy - 5, 8, 0, 7); x.fill();
      x.fillStyle = '#fff'; for (let i = 0; i < 9; i++) { const a = i * 2.4, r = 6 + (i % 3) * 4; x.fillRect(cx + Math.cos(a) * r - 2, cy + Math.sin(a) * r - 1, 4, 2); }
    }
  }
  if (kind === 'putu') {
    // tabung bambu + putu hijau bertabur kelapa, gula merah di tengah
    x.fillStyle = '#e8cf8a'; x.fillRect(20, 46, 26, 54); x.fillStyle = '#c9a85e'; x.fillRect(20, 62, 26, 4); x.fillRect(20, 84, 26, 4);
    x.fillStyle = '#d9bd72'; x.beginPath(); x.ellipse(33, 46, 13, 5, 0, 0, 7); x.fill();
    for (const cx of [62, 92]) {
      x.fillStyle = '#4fae49'; x.fillRect(cx - 13, 52, 26, 44); x.beginPath(); x.ellipse(cx, 96, 13, 5, 0, 0, 7); x.fill();
      x.fillStyle = '#6cc35a'; x.beginPath(); x.ellipse(cx, 52, 13, 5, 0, 0, 7); x.fill();
      x.fillStyle = '#8a4a22'; x.fillRect(cx - 13, 68, 26, 9);
      x.fillStyle = '#fff'; x.beginPath(); x.ellipse(cx, 49, 12, 6, 0, 0, 7); x.fill();
    }
  }
  if (kind === 'lemper') {
    for (const [cx, cy, r] of [[64, 82, 0.1], [56, 54, -0.15]]) {
      x.save(); x.translate(cx, cy); x.rotate(r);
      x.fillStyle = '#4f9d3f'; x.beginPath(); x.roundRect(-40, -15, 80, 30, 12); x.fill();
      x.fillStyle = '#7cc35a'; x.beginPath(); x.moveTo(-40, -15); x.lineTo(0, 15); x.lineTo(40, -15); x.closePath(); x.globalAlpha = .5; x.fill(); x.globalAlpha = 1;
      x.fillStyle = '#fbf6e8'; x.beginPath(); x.ellipse(40, 0, 7, 14, 0, 0, 7); x.fill();
      x.fillStyle = '#c98b55'; x.beginPath(); x.arc(40, 0, 4, 0, 7); x.fill();
      x.strokeStyle = '#c9a85e'; x.lineWidth = 3; x.beginPath(); x.moveTo(-46, -2); x.lineTo(30, -2); x.stroke();
      x.restore();
    }
  }
  if (kind === 'serabi') {
    x.fillStyle = '#d9a35a'; x.beginPath(); x.ellipse(64, 74, 46, 30, 0, 0, 7); x.fill();
    x.fillStyle = '#f6e3b0'; x.beginPath(); x.ellipse(64, 70, 42, 26, 0, 0, 7); x.fill();
    x.fillStyle = '#e9cf92'; for (let i = 0; i < 14; i++) { x.beginPath(); x.arc(40 + (i * 37) % 50, 58 + (i * 13) % 24, 2.5, 0, 7); x.fill(); }
    x.fillStyle = '#8a4a22'; x.beginPath(); x.ellipse(64, 72, 18, 11, 0, 0, 7); x.fill();
    x.fillStyle = '#b06a32'; x.beginPath(); x.ellipse(60, 69, 7, 4, 0, 0, 7); x.fill();
  }
  if (kind === 'getuk') {
    // getuk lindri: potongan berlapis pink-hijau-putih + parutan kelapa, di atas daun pisang
    leaf(64, 92, 50, 15);
    const piece = (cx, cy, cols) => { const w = 30, h = 13; cols.forEach((c, i) => { x.fillStyle = c; x.beginPath(); x.roundRect(cx - w / 2, cy - (i + 1) * h, w, h, 4); x.fill(); });
      x.fillStyle = 'rgba(255,255,255,.75)'; x.beginPath(); x.roundRect(cx - w / 2 + 3, cy - cols.length * h - 2, w - 6, 3, 2); x.fill();
      x.strokeStyle = 'rgba(255,255,255,.55)'; x.lineWidth = 2; for (let k = 0; k < 3; k++) { x.beginPath(); x.moveTo(cx - 10 + k * 10, cy - 4); x.lineTo(cx - 10 + k * 10, cy - cols.length * h + 4); x.stroke(); } };
    piece(40, 92, ['#f6f0dc', '#8fd06a', '#f28db8']); piece(76, 92, ['#f28db8', '#f6f0dc', '#8fd06a']); piece(58, 70, ['#8fd06a', '#f28db8', '#f6f0dc']);
    x.fillStyle = '#fff'; for (let i = 0; i < 16; i++) x.fillRect(30 + (i * 23) % 64, 44 + (i * 17) % 50, 4, 2);
  }
  if (kind === 'cincin') {
    // kue cincin: cincin goreng cokelat keemasan bertumpuk
    for (const [cx, cy, s] of [[44, 82, 1], [84, 82, 1], [64, 56, 1.05]]) {
      x.strokeStyle = '#8a4e22'; x.lineWidth = 15 * s; x.beginPath(); x.ellipse(cx, cy + 3, 20 * s, 13 * s, 0, 0, 7); x.stroke();
      x.strokeStyle = '#c9823e'; x.lineWidth = 13 * s; x.beginPath(); x.ellipse(cx, cy, 20 * s, 13 * s, 0, 0, 7); x.stroke();
      x.strokeStyle = 'rgba(255,220,150,.7)'; x.lineWidth = 3; x.beginPath(); x.ellipse(cx - 2, cy - 4, 17 * s, 9 * s, 0, 3.4, 5.6); x.stroke();
    }
  }
  if (kind === 'gemblong') {
    // gemblong: ketan lonjong dibalut gula merah mengkilap
    leaf(64, 92, 50, 15);
    for (const [cx, cy, r] of [[42, 80, -0.3], [84, 80, 0.3], [63, 62, 0]]) {
      x.save(); x.translate(cx, cy); x.rotate(r);
      x.fillStyle = '#6e3c17'; x.beginPath(); x.ellipse(0, 3, 22, 12, 0, 0, 7); x.fill();
      x.fillStyle = '#9a5a26'; x.beginPath(); x.ellipse(0, 0, 22, 12, 0, 0, 7); x.fill();
      x.fillStyle = 'rgba(255,210,140,.75)'; x.beginPath(); x.ellipse(-6, -5, 10, 3.5, -0.1, 0, 7); x.fill();
      x.restore();
    }
  }
  if (kind === 'tehtarik') {
    // teh tarik: gelas tinggi, teh susu oranye kecokelatan + buih tebal
    const glass = () => { x.beginPath(); x.moveTo(36, 30); x.lineTo(92, 30); x.lineTo(84, 112); x.lineTo(44, 112); x.closePath(); };
    x.save(); glass(); x.clip();
    x.fillStyle = '#e9f6fb'; x.fillRect(20, 20, 90, 100);
    const gr = x.createLinearGradient(0, 50, 0, 112); gr.addColorStop(0, '#e8a35a'); gr.addColorStop(1, '#b8692c');
    x.fillStyle = gr; x.fillRect(20, 52, 90, 70);
    x.fillStyle = '#fbf0dc'; x.fillRect(20, 38, 90, 16);
    x.fillStyle = '#fff'; for (let i = 0; i < 6; i++) { x.beginPath(); x.arc(42 + i * 9, 38, 5, 0, 7); x.fill(); }
    x.restore();
    glass(); x.lineWidth = 4; x.strokeStyle = '#8fb8c9'; x.stroke();
    // aliran teh "ditarik" dari atas
    x.strokeStyle = '#d9914a'; x.lineWidth = 5; x.lineCap = 'round'; x.beginPath(); x.moveTo(64, 2); x.quadraticCurveTo(70, 18, 64, 34); x.stroke();
  }
  if (kind === 'wedang') {
    // wedang uwuh: mangkuk/gelas tanah liat, air merah, rempah (secang, kayu manis, daun, cengkeh)
    x.fillStyle = '#c9744a'; x.beginPath(); x.moveTo(24, 50); x.lineTo(104, 50); x.quadraticCurveTo(100, 112, 64, 112); x.quadraticCurveTo(28, 112, 24, 50); x.fill();
    x.fillStyle = '#a85a36'; x.fillRect(24, 50, 80, 7);
    x.fillStyle = '#9c2a22'; x.beginPath(); x.ellipse(64, 52, 38, 10, 0, 0, 7); x.fill();
    x.fillStyle = '#c94a3a'; x.beginPath(); x.ellipse(58, 50, 18, 4, 0, 0, 7); x.fill();
    x.fillStyle = '#6aa84a'; x.beginPath(); x.ellipse(44, 46, 12, 5, -0.5, 0, 7); x.fill(); x.beginPath(); x.ellipse(80, 47, 11, 4, 0.6, 0, 7); x.fill();
    x.fillStyle = '#8a4e22'; x.save(); x.translate(66, 40); x.rotate(-0.5); x.fillRect(-16, -3, 32, 6); x.restore();
    x.fillStyle = '#5a2e14'; for (const [a, b] of [[54, 52], [74, 54], [62, 48]]) { x.beginPath(); x.arc(a, b, 3, 0, 7); x.fill(); }
    x.strokeStyle = 'rgba(255,255,255,.7)'; x.lineWidth = 3; x.lineCap = 'round';
    for (const ox of [48, 64, 80]) { x.beginPath(); x.moveTo(ox, 34); x.quadraticCurveTo(ox - 6, 24, ox, 14); x.stroke(); }
  }
  if (kind === 'cendol') {
    const glass = () => { x.beginPath(); x.moveTo(30, 34); x.lineTo(98, 34); x.lineTo(88, 112); x.lineTo(40, 112); x.closePath(); };
    x.save(); glass(); x.clip();
    x.fillStyle = '#e8f6fb'; x.fillRect(20, 30, 90, 90);
    x.fillStyle = '#9a5426'; x.fillRect(20, 92, 90, 24);            // gula merah
    x.fillStyle = '#fbf3df'; x.fillRect(20, 56, 90, 36);            // santan
    x.strokeStyle = '#3fa63c'; x.lineWidth = 7; x.lineCap = 'round'; // cendol
    for (let i = 0; i < 14; i++) { const cx = 38 + (i * 13) % 52, cy = 62 + (i * 17) % 40; x.beginPath(); x.moveTo(cx, cy); x.quadraticCurveTo(cx + 6, cy + 3, cx + 3, cy + 10); x.stroke(); }
    x.fillStyle = 'rgba(255,255,255,.85)'; x.fillRect(36, 38, 16, 14); x.fillRect(58, 42, 16, 14); x.fillRect(78, 37, 14, 14); // es batu
    x.restore();
    glass(); x.lineWidth = 4; x.strokeStyle = '#7fb3c9'; x.stroke();
    x.strokeStyle = '#ff6b6b'; x.lineWidth = 6; x.lineCap = 'round'; x.beginPath(); x.moveTo(80, 40); x.lineTo(100, 8); x.stroke();
  }
  x.restore();
}
function foodTex(kind) {
  const c = document.createElement('canvas'); c.width = c.height = 128; const x = c.getContext('2d');
  const col = FOOD[kind][1]; x.fillStyle = '#fff'; x.beginPath(); x.arc(64, 64, 58, 0, 7); x.fill(); x.lineWidth = 8; x.strokeStyle = col; x.stroke();
  x.save(); x.translate(64, 64); x.scale(1.0, 1.0); x.translate(-64, -70); drawFood(x, kind); x.restore();
  const t = new THREE.CanvasTexture(c); t.colorSpace = THREE.SRGBColorSpace; return t;
}
function foodURL(kind, S = 96) { const c = document.createElement('canvas'); c.width = c.height = S; const x = c.getContext('2d'); x.translate(S / 2, S / 2); x.scale(1.3, 1.3); x.translate(-S / 2, -S * 0.56); drawFood(x, kind, S); return c.toDataURL(); }
function tableFood(g, kind) {
  for (let k = 0; k < 3; k++) {
    const x = -0.36 + k * 0.36, y = 0.56, z = 0.3;
    if (kind === 'getuk') { add(box(0.12, 0.05, 0.1), M('#f28db8'), x, y, z, g); add(box(0.12, 0.05, 0.1), M('#8fd06a'), x, y + 0.05, z, g); add(box(0.12, 0.05, 0.1), M('#f6f0dc'), x, y + 0.1, z, g); }
    if (kind === 'cincin') { const t = add(new THREE.TorusGeometry(0.07, 0.03, 5, 10), M('#c9823e'), x, y + 0.01, z, g); t.rotation.x = Math.PI / 2; }
    if (kind === 'gemblong') { const e = add(sph(0.07), M('#9a5a26'), x, y + 0.02, z, g); e.scale.set(1.5, 0.7, 1); }
    if (kind === 'tehtarik') { add(cyl(0.055, 0.045, 0.2, 8), M('#e8a35a'), x, y + 0.06, z, g); add(cyl(0.056, 0.055, 0.04, 8), M('#fbf0dc'), x, y + 0.17, z, g); }
    if (kind === 'wedang') { add(cyl(0.08, 0.06, 0.1, 8), M('#c9744a'), x, y + 0.02, z, g); add(cyl(0.07, 0.07, 0.01, 8), M('#9c2a22'), x, y + 0.075, z, g); }
    if (kind === 'klepon') for (let i = 0; i < 3; i++) add(sph(0.05), M('#4fae49'), x + (i - 1) * 0.07, y + (i === 1 ? 0.04 : 0), z, g);
    if (kind === 'putu') { add(cyl(0.05, 0.05, 0.14, 7), M(k ? '#5cb84f' : '#e8cf8a'), x, y + 0.04, z, g); add(cyl(0.05, 0.05, 0.02, 7), M('#fbf6e8'), x, y + 0.12, z, g); }
    if (kind === 'lemper') { const l = add(cyl(0.05, 0.05, 0.22, 6), M('#5aa845'), x, y, z, g); l.rotation.z = Math.PI / 2; }
    if (kind === 'serabi') { add(cyl(0.11, 0.11, 0.03, 9), M('#f3d9a0'), x, y - 0.01, z, g); add(cyl(0.05, 0.05, 0.035, 7), M('#8a4a22'), x, y, z, g); }
    if (kind === 'cendol') { add(cyl(0.06, 0.05, 0.18, 8), M('#dff4ff', { transparent: true, opacity: 0.8 }), x, y + 0.06, z, g); add(cyl(0.052, 0.047, 0.06, 8), M('#4fae49'), x, y + 0.02, z, g); add(cyl(0.056, 0.052, 0.05, 8), M('#fbf6e8'), x, y + 0.08, z, g); }
  }
}

const ROOF = { daun: '#7cc35a', kelopak: '#f7a6bd', keringdaun: '#f0c46a', talas: '#5aae74' };
function leafRoof(parent, col, w = 1.7, y = 1.25) {
  const g = new THREE.SphereGeometry(1, 8, 3, 0, Math.PI * 2, 0, Math.PI / 2.4);
  const r = add(g, M(col, { side: THREE.DoubleSide, roughness: 0.6 }), 0, y, 0.1, parent);
  r.scale.set(w / 2, 0.35, w / 2.6);
  const rib = add(box(w * 0.95, 0.025, 0.03), M('#ffffff', { transparent: true, opacity: 0.55 }), 0, y + 0.34, 0.1, parent); rib.castShadow = false;
  const tip = add(new THREE.ConeGeometry(0.06, 0.25, 6), M(col), w / 2 + 0.05, y + 0.05, 0.1, parent); tip.rotation.z = -Math.PI / 2;
  return r;
}
function stall(x, z, food, roofKind = 'daun', rot = 0, ghost = false) {
  const g = new THREE.Group(); g.position.set(x, PADY, z); g.rotation.y = rot; g.scale.setScalar(1.45); P.add(g);
  const col = FOOD[food][1];
  // meja dari dua batang kayu + papan kulit kayu
  log(0, 0.13, 0.25, 1.3, 0.13, 0, g); log(0, 0.37, 0.25, 1.3, 0.12, 0, g);
  add(box(1.36, 0.05, 0.45), barkL, 0, 0.51, 0.25, g);
  // tiang ranting (sedikit miring)
  twig(-0.62, 0, -0.15, -0.58, 1.3, -0.05, 0.04, g); twig(0.62, 0, -0.15, 0.58, 1.3, -0.05, 0.04, g);
  twig(-0.62, 0, 0.5, -0.58, 1.2, 0.42, 0.04, g); twig(0.62, 0, 0.5, 0.58, 1.2, 0.42, 0.04, g);
  twig(-0.62, 1.22, 0.18, 0.62, 1.22, 0.18, 0.03, g);
  leafRoof(g, ROOF[roofKind]);
  // makanan di meja
  tableFood(g, food);
  if (ghost) g.traverse(o => { if (o.material) { o.material = o.material.clone(); o.material.transparent = true; o.material.opacity = 0.45; } });
  // papan nama: cangkang kerang air tawar
  { const sp = new THREE.Sprite(new THREE.SpriteMaterial({ map: foodTex(food), depthWrite: false })); sp.position.set(x, PADY + 2.8, z); sp.scale.setScalar(0.95); P.add(sp); }
  return g;
}
function stageLotus(x, z, s = 1.6) {
  const g = new THREE.Group(); g.position.set(x, PADY, z); g.scale.setScalar(s); P.add(g);
  add(cyl(1.0, 1.05, 0.22, 32), M('#ffe08f'), 0, 0.11, 0, g);
  for (let k = 0; k < 12; k++) { if (k >= 3 && k <= 5) continue;
    const a = k / 12 * Math.PI * 2; const p = add(sph(0.6), M(k % 2 ? '#ffd0dc' : '#f7a6bd'), Math.cos(a) * 1.05, 0.55, Math.sin(a) * 1.05, g);
    p.scale.set(0.5, 1.1, 0.18); p.rotation.order = 'YXZ'; p.rotation.y = -a + Math.PI / 2; p.rotation.x = -0.4; }
  // sorot: kunang-kunang
  for (let k = 0; k < 6; k++) add(sph(0.05), M('#fff6a0', { emissive: '#fff08a', emissiveIntensity: 1.2 }), Math.cos(k) * 0.9, 1.6 + (k % 3) * 0.2, Math.sin(k) * 0.6 - 0.3, g).castShadow = false;
  return g;
}
function berryLights(a, b, h = 1.9) {
  for (const p of [a, b]) cattail(p[0], p[1], h + 0.4);
  const cols = ['#ff5a5a', '#ffd24a', '#ff8ad0', '#8ae0ff', '#b6ff7a'];
  for (let k = 1; k < 10; k++) { const t = k / 10; const x = a[0] + (b[0] - a[0]) * t, z = a[1] + (b[1] - a[1]) * t, y = h - Math.sin(t * Math.PI) * 0.4; add(sph(0.08), M(cols[k % 5], { emissive: cols[k % 5], emissiveIntensity: 0.7 }), x, y, z).castShadow = false; }
  const pts = []; for (let k = 0; k <= 20; k++) { const t = k / 20; pts.push(new THREE.Vector3(a[0] + (b[0] - a[0]) * t, h + 0.08 - Math.sin(t * Math.PI) * 0.4, a[1] + (b[1] - a[1]) * t)); }
  const tube = add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 20, 0.012, 4), M('#5f9a3a'), 0, 0, 0); tube.castShadow = false;
}
function snailShell(x, z, s = 1, col = '#e9c98a') {
  const g = new THREE.Group(); g.position.set(x, PADY, z); g.scale.setScalar(s); P.add(g);
  for (let k = 0; k < 4; k++) { const t = add(new THREE.TorusGeometry(0.4 - k * 0.09, 0.16 - k * 0.03, 10, 24), M(k % 2 ? col : '#d8a868'), 0, 0.45 + k * 0.03, 0.02 * k, g); t.rotation.y = 0; }
  add(sph(0.12), M(col), 0, 0.47, 0.05, g);
  return g;
}
function infoShell(x, z) { snailShell(x, z, 1.1, '#bfe3f5'); sprite('ℹ️', x, PADY + 1.45, z, 0.5, '#4fb3e8'); }
function basketBin(x, z, full) { const b = add(cyl(0.2, 0.16, 0.38, 14), M('#c8955a'), x, PADY + 0.19, z); for (let k = 0; k < 3; k++) add(new THREE.TorusGeometry(0.19 - k * 0.012, 0.015, 4, 16), M('#9a6a3a'), x, PADY + 0.08 + k * 0.12, z).rotation.x = Math.PI / 2; if (full) for (let k = 0; k < 4; k++) add(sph(0.08), M('#d9b35c'), x + (k - 1.5) * 0.08, PADY + 0.42, z); sprite('♻️', x, PADY + 0.75, z, 0.32, '#5cb84f'); }
function logBench(x, z, rot = 0) { const g = new THREE.Group(); g.position.set(x, PADY, z); g.rotation.y = rot; P.add(g); log(0, 0.14, 0, 1.0, 0.13, 0, g); }
function taroUmbrella(x, z, s = 1) {
  add(cyl(0.04, 0.05, 1.7 * s, 8), M('#86b45a'), x, PADY + 0.85 * s, z);
  const g = new THREE.SphereGeometry(1, 8, 3, 0, Math.PI * 2, 0, Math.PI / 3);
  const l = add(g, M('#5aae74', { side: THREE.DoubleSide }), x, PADY + 1.55 * s, z); l.scale.set(1.0 * s, 0.35 * s, 0.85 * s); l.rotation.z = 0.15;
}
function reedGate(x, z) {
  for (const dx of [-1.0, 1.0]) cattail(x + dx, z, 2.6, dx * -0.12);
  const pts = []; for (let k = 0; k <= 16; k++) { const a = Math.PI * k / 16; pts.push(new THREE.Vector3(x - Math.cos(a) * 0.95, PADY + 2.0 + Math.sin(a) * 0.5, z)); }
  add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 24, 0.06, 6), M('#7fb04a'), 0, 0, 0);
  for (let k = 1; k < 8; k++) { const p = pts[k * 2]; add(sph(0.09), M(k % 2 ? '#ff9fbf' : '#fff2a8'), p.x, p.y, p.z + 0.04).castShadow = false; }
  sprite('🪷', x, PADY + 2.85, z, 0.55, '#ff9fbf');
}
function dewdrop(x, z, s = 1) {
  add(cyl(0.5 * s, 0.6 * s, 0.18 * s, 20), M('#b9b2a2'), x, PADY + 0.09 * s, z);
  add(sph(0.55 * s), new THREE.MeshPhysicalMaterial({ color: '#cdf4ff', roughness: 0.05, transmission: 0.6, transparent: true, opacity: 0.75, thickness: 0.5 }), x, PADY + 0.68 * s, z);
  add(sph(0.12 * s), white, x - 0.18 * s, PADY + 0.88 * s, z + 0.3 * s).castShadow = false;
}
function leafBoat(x, z, riders = [], rot = 0) {
  const g = new THREE.Group(); g.position.set(x, 0.04, z); g.rotation.y = rot; P.add(g);
  const hull = add(new THREE.SphereGeometry(1, 8, 3, 0, Math.PI * 2, Math.PI / 2, Math.PI / 2), M('#9ed36f', { side: THREE.DoubleSide }), 0, 0.22, 0, g); hull.scale.set(1.0, 0.25, 0.4);
  add(box(1.8, 0.02, 0.03), M('#a8dc7c'), 0, 0.22, 0, g).castShadow = false;
  riders.forEach((r, k) => critter(r, -0.45 + k * 0.45, 0.1, 0, 1.1, g));
  ripple(x, z, 1.2);
}
function twigBridge(a, b, w = 0.8) {
  const ax = a[0], az = a[1], bx = b[0], bz = b[1], len = Math.hypot(bx - ax, bz - az), n = Math.ceil(len / 0.18);
  const ang = Math.atan2(bz - az, bx - ax);
  for (let k = 0; k <= n; k++) { const t = k / n; const y = 0.2 + Math.sin(t * Math.PI) * 0.35; const m = add(cyl(0.06, 0.06, w, 8), k % 2 ? bark : barkL, ax + (bx - ax) * t, y, az + (bz - az) * t); m.rotation.order = 'YXZ'; m.rotation.y = -ang; m.rotation.x = Math.PI / 2; }
  for (const side of [-1, 1]) { const ox = -Math.sin(ang) * side * w / 2, oz = Math.cos(ang) * side * w / 2; const pts = []; for (let k = 0; k <= 10; k++) { const t = k / 10; pts.push(new THREE.Vector3(ax + (bx - ax) * t + ox, 0.62 + Math.sin(t * Math.PI) * 0.35, az + (bz - az) * t + oz)); } add(new THREE.TubeGeometry(new THREE.CatmullRomCurve3(pts), 16, 0.025, 5), twigM, 0, 0, 0); }
}
function pathDot(x, z, bad) { const d = add(cyl(0.13, 0.13, 0.03, 14), M(bad ? '#ff6b4a' : '#fff6c0', { emissive: bad ? '#ff6b4a' : '#fff1a0', emissiveIntensity: 0.6 }), x, PADY + 0.03, z); d.castShadow = false; }

// ---------- critters ----------
const CR = { kodok: '#7fcf6a', bebek: '#ffe27a', kura: '#a7dc8e', berang: '#c49270', ikan: '#ffad7a', udang: '#ffa3a3' };
function eyes(g, y, z, sp = 0.035, r = 0.022) { for (const dx of [-sp, sp]) { add(sph(r), white, dx, y, z, g).castShadow = false; add(sph(r * 0.55), M('#222'), dx, y, z + r * 0.75, g).castShadow = false; } }
function critter(type, x, y, z, s = 1, parent = P) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); parent.add(g);
  const c = M(CR[type]);
  if (type === 'kura') { const sh = add(sph(0.14), M('#4d8a3e'), 0, 0.1, 0, g); sh.scale.set(1.2, 0.8, 1.2); add(sph(0.08), M('#e9d58a'), 0, 0.24, 0.08, g); }
  else { const b = add(sph(0.11), c, 0, 0.12, 0, g); b.scale.y = 1.15; add(sph(0.09), c, 0, 0.3, 0.02, g); }
  eyes(g, type === 'kura' ? 0.26 : 0.32, type === 'kura' ? 0.15 : 0.1);
  if (type === 'kodok') for (const dx of [-0.05, 0.05]) add(sph(0.035), c, dx, 0.39, 0.03, g);
  if (type === 'bebek') add(sph(0.035), M('#ff9a3a'), 0, 0.29, 0.11, g).scale.set(1.2, 0.5, 1);
  if (type === 'berang') for (const dx of [-0.07, 0.07]) add(sph(0.025), M('#8a5a36'), dx, 0.38, 0, g);
  if (type === 'ikan') add(new THREE.ConeGeometry(0.04, 0.1, 6), M('#e5702e'), 0, 0.42, 0, g);
  if (type === 'udang') for (const dx of [-0.04, 0.04]) { const a = add(cyl(0.006, 0.006, 0.18, 4), M('#e06060'), dx, 0.45, 0.02, g); a.rotation.z = dx * 6; }
  return g;
}
function kiko(x, z, s = 1, y = PADY) {
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); P.add(g);
  const c = M('#6cc35a');
  const b = add(sph(0.16), c, 0, 0.16, 0, g); b.scale.set(1.1, 0.9, 1);
  add(sph(0.11), M('#b4e89a'), 0, 0.13, 0.08, g);
  for (const dx of [-0.08, 0.08]) { add(sph(0.06), c, dx, 0.3, 0.02, g); add(sph(0.04), white, dx, 0.31, 0.06, g); add(sph(0.02), M('#222'), dx, 0.31, 0.095, g); }
  return g;
}
function king(x, z, s = 1, y = PADY) {
  // Raja Kura-kura: kura-kura berkaki empat menghadap +z — tempurung kubah bermotif, leher & kepala menjulur, mahkota emas
  const g = new THREE.Group(); g.position.set(x, y, z); g.scale.setScalar(s); P.add(g);
  const skin = M('#a9d474'), skinD = M('#86b85a'), gold = M('#ffcf3a', { metalness: 0.35, roughness: 0.45 });
  // kaki gemuk & ekor
  for (const [dx, dz] of [[-0.24, 0.17], [0.24, 0.17], [-0.24, -0.17], [0.24, -0.17]]) { add(cyl(0.065, 0.075, 0.14, 7), skin, dx, 0.07, dz, g); add(sph(0.05), skinD, dx * 1.05, 0.015, dz + 0.03, g).scale.set(1.2, 0.5, 1.4); }
  const tail = add(new THREE.ConeGeometry(0.04, 0.14, 6), skin, 0, 0.11, -0.36, g); tail.rotation.x = -1.9;
  // tempurung bawah (pinggiran krem) + kubah atas
  const rim = add(cyl(0.36, 0.33, 0.07, 14), M('#e8cf8a'), 0, 0.14, 0, g); rim.scale.z = 1.12;
  const dome = add(new THREE.SphereGeometry(1, 14, 7, 0, Math.PI * 2, 0, Math.PI / 2), M('#4f8f3a'), 0, 0.17, 0, g); dome.scale.set(0.34, 0.25, 0.38);
  // sisik tempurung (heksagon terang)
  const plate = M('#7cbf52');
  const onDome = (pol, az, r) => { const sx = Math.sin(pol) * Math.cos(az) * 0.34, sy = Math.cos(pol) * 0.25 + 0.17, sz = Math.sin(pol) * Math.sin(az) * 0.38; const m = add(cyl(r, r, 0.035, 6), plate, sx, sy, sz, g); const n = new THREE.Vector3(sx / (0.34 * 0.34), (sy - 0.17) / (0.25 * 0.25), sz / (0.38 * 0.38)).normalize(); m.quaternion.setFromUnitVectors(new THREE.Vector3(0, 1, 0), n); m.scale.set(1, 1, 1); };
  onDome(0, 0, 0.1);
  for (let k = 0; k < 6; k++) onDome(0.95, k / 6 * Math.PI * 2 + 0.52, 0.085);
  for (let k = 0; k < 10; k++) onDome(1.38, k / 10 * Math.PI * 2, 0.05);
  // jubah merah kecil di depan tempurung (tidak menutupi tempurung)
  const cape = add(new THREE.TorusGeometry(0.1, 0.035, 6, 14), M('#d94a4a'), 0, 0.24, 0.3, g); cape.rotation.x = Math.PI / 2 - 0.5;
  for (let k = 0; k < 5; k++) add(sph(0.018), white, Math.cos(k / 5 * 6.28 + 0.6) * 0.1, 0.25 + Math.sin(k / 5 * 6.28 + 0.6) * 0.04, 0.31 + Math.sin(k / 5 * 6.28 + 0.6) * 0.05, g).castShadow = false;
  // leher & kepala menjulur ke depan
  twig(0, 0.2, 0.3, 0, 0.32, 0.44, 0.065, g, skin);
  const head = add(sph(0.14), skin, 0, 0.38, 0.5, g); head.scale.set(1, 0.92, 1.08);
  add(sph(0.07), M('#c4e39a'), 0, 0.34, 0.6, g).scale.set(1.3, 0.7, 0.8); // moncong
  for (const dx of [-0.065, 0.065]) { add(sph(0.042), white, dx, 0.43, 0.6, g).castShadow = false; add(sph(0.022), M('#222'), dx, 0.43, 0.635, g).castShadow = false; add(sph(0.008), white, dx + 0.008, 0.44, 0.655, g).castShadow = false; }
  for (const dx of [-0.11, 0.11]) add(sph(0.022), M('#ff9a9a'), dx, 0.36, 0.6, g).castShadow = false;
  const smile = add(new THREE.TorusGeometry(0.045, 0.008, 4, 12, Math.PI), M('#2f5a22'), 0, 0.33, 0.64, g); smile.rotation.z = Math.PI;
  // mahkota emas dengan permata
  add(cyl(0.085, 0.09, 0.05, 10), gold, 0, 0.52, 0.48, g);
  for (let k = 0; k < 5; k++) { const a = k / 5 * 6.28; add(new THREE.ConeGeometry(0.025, 0.07, 5), gold, Math.cos(a) * 0.075, 0.575, 0.48 + Math.sin(a) * 0.075, g); }
  add(sph(0.022), M('#ff4f6a'), 0, 0.53, 0.57, g).castShadow = false;
  return g;
}

// ---------- 4 pilihan tokoh pemain ----------
function clipboard(g, x, y, z, rot = -0.4) { const cb = add(box(0.15, 0.19, 0.02), M('#c98b55'), x, y, z, g); cb.rotation.y = rot; add(box(0.11, 0.14, 0.022), white, x + 0.004, y - 0.005, z + 0.003, g).rotation.y = rot; }
function vest(g, col, y, r = 0.13) { const v = add(cyl(r, r + 0.02, 0.2, 14, 1), M(col), 0, y, 0, g); v.scale.z = 0.9; }
function heroOtter(x, z, s = 1) { // A. berang-berang
  const g = new THREE.Group(); g.position.set(x, PADY, z); g.scale.setScalar(s); P.add(g);
  const fur = M('#9c6a42'), cream = M('#f1dcb8');
  const b = add(sph(0.16), fur, 0, 0.2, 0, g); b.scale.set(1, 1.35, 0.95);
  add(sph(0.11), cream, 0, 0.2, 0.08, g).scale.set(1, 1.3, 0.6);
  vest(g, '#2bb3a3', 0.26, 0.15);
  add(sph(0.14), fur, 0, 0.52, 0.01, g);
  add(sph(0.075), cream, 0, 0.48, 0.11, g).scale.set(1.3, 0.85, 0.8);
  add(sph(0.025), M('#2b1d14'), 0, 0.51, 0.18, g);
  for (const dx of [-0.11, 0.11]) add(sph(0.04), fur, dx, 0.63, 0, g);
  eyes(g, 0.56, 0.12, 0.05, 0.022);
  const tail = add(new THREE.CapsuleGeometry(0.05, 0.25, 4, 8), fur, 0, 0.08, -0.2, g); tail.rotation.x = 1.2;
  // helm daun (topi pekerja dari daun teratai)
  const hat = add(new THREE.SphereGeometry(0.16, 20, 8, 0, Math.PI * 2, 0, Math.PI / 2), M('#5fae4f'), 0, 0.6, 0, g); hat.scale.y = 0.6;
  add(cyl(0.2, 0.2, 0.015, 20), M('#4e9a40'), 0, 0.6, 0.02, g);
  clipboard(g, 0.15, 0.26, 0.14);
  return g;
}
function heroDuck(x, z, s = 1) { // B. anak bebek
  const g = new THREE.Group(); g.position.set(x, PADY, z); g.scale.setScalar(s); P.add(g);
  const y = M('#ffd84f');
  const b = add(sph(0.17), y, 0, 0.18, 0, g); b.scale.set(1, 1.05, 1.1);
  add(sph(0.14), y, 0, 0.45, 0.03, g);
  add(sph(0.05), M('#ff9a3a'), 0, 0.42, 0.16, g).scale.set(1.4, 0.55, 1.2);
  eyes(g, 0.48, 0.13, 0.05, 0.022);
  for (const dx of [-0.07, 0.07]) add(sph(0.05), M('#ff9a3a'), dx, 0.02, 0.06, g).scale.set(1, 0.35, 1.4);
  // syal + headset + topi kelopak
  add(new THREE.TorusGeometry(0.12, 0.035, 8, 20), M('#ff6b6b'), 0, 0.32, 0.01, g).rotation.x = Math.PI / 2;
  add(new THREE.TorusGeometry(0.15, 0.012, 6, 16, Math.PI), M('#333'), 0, 0.47, 0, g);
  add(sph(0.035), M('#333'), 0.145, 0.44, 0, g); twig(0.15, 0.43, 0.02, 0.07, 0.4, 0.15, 0.008, g, M('#333'));
  for (let k = 0; k < 5; k++) { const p = add(sph(0.05), M('#ff9fbf'), (k - 2) * 0.035, 0.6, -0.01, g); p.scale.set(0.6, 1.5, 0.6); p.rotation.z = (k - 2) * 0.32; }
  clipboard(g, 0.16, 0.2, 0.15);
  return g;
}
function heroFrog(x, z, s = 1) { // C. anak katak
  const g = new THREE.Group(); g.position.set(x, PADY, z); g.scale.setScalar(s); P.add(g);
  const c = M('#8bd36a');
  const b = add(sph(0.17), c, 0, 0.19, 0, g); b.scale.set(1.05, 1.1, 0.95);
  add(sph(0.11), M('#d6f5b8'), 0, 0.17, 0.08, g).scale.set(1, 1.2, 0.6);
  vest(g, '#ffb43a', 0.24, 0.15);
  add(sph(0.15), c, 0, 0.45, 0.02, g).scale.set(1.15, 0.9, 1);
  for (const dx of [-0.08, 0.08]) { add(sph(0.06), c, dx, 0.56, 0.03, g); add(sph(0.042), white, dx, 0.575, 0.07, g); add(sph(0.022), M('#222'), dx, 0.575, 0.105, g); }
  const sm = add(new THREE.TorusGeometry(0.06, 0.008, 4, 12, Math.PI), M('#2f6b2a'), 0, 0.43, 0.15, g); sm.rotation.z = Math.PI;
  // topi petani daun kering + megafon cangkang
  const hat = add(new THREE.ConeGeometry(0.24, 0.12, 20), M('#e7b453'), 0, 0.68, 0.01, g);
  const mg = add(new THREE.ConeGeometry(0.06, 0.18, 12, 1, true), M('#ffe6c4', { side: THREE.DoubleSide }), 0.2, 0.3, 0.12, g); mg.rotation.z = -Math.PI / 2; mg.rotation.y = -0.5;
  return g;
}
// ---------- background shore & palace ----------
function shore() {
  // tepian belakang: batu besar, rumput, ilalang
  for (let k = 0; k < 22; k++) { const a = -2.6 + k * 0.1; stone(Math.cos(a) * 22 + Math.sin(k * 3) * 2, Math.sin(a) * 22 - 6 + Math.cos(k) * 1.5, 2.2 + (k % 4) * 0.6); }
  add(box(90, 1.0, 20), M('#bfe08f'), 0, 0.3, -29); add(box(90, 0.6, 3), M('#f3e3b5'), 0, 0.1, -18.5);
  for (let k = 0; k < 18; k++) reeds(-18 + k * 2.1 + Math.sin(k) * 0.6, -15 - Math.cos(k * 1.7) * 2, 7, k + 3);
  for (let k = 0; k < 8; k++) cattail(-14 + k * 4 + Math.sin(k) * 1.2, -13.5 + Math.cos(k * 2) * 1.2, 3 + (k % 3) * 0.6, Math.sin(k) * 0.1);
  // Istana Kuncup Teratai di atas batu
  const px = -9, pz = -12;
  const r1 = stone(px, pz, 6.5); r1.scale.set(1, 0.7, 0.8);
  const base = 1.6;
  for (const [dx, h, c] of [[-1.2, 2.6, '#ffb6cb'], [0, 3.6, '#ff94b4'], [1.2, 2.4, '#ffc8d6']]) {
    add(cyl(0.38, 0.45, h * 0.6, 16), M('#f7efe2'), px + dx, base + h * 0.3, pz);
    const bud = add(sph(0.6), M(c), px + dx, base + h * 0.6 + 0.4, pz); bud.scale.set(0.9, 1.4, 0.9);
    add(new THREE.ConeGeometry(0.16, 0.5, 10), M(c), px + dx, base + h * 0.6 + 1.3, pz);
    add(box(0.16, 0.26, 0.05), M('#3f6f8a'), px + dx, base + h * 0.35, pz + 0.42);
  }
  add(cyl(0.015, 0.015, 0.9, 6), twigM, px, base + 4.3, pz); add(box(0.45, 0.25, 0.02), M('#ff6b6b'), px + 0.24, base + 4.6, pz);
}

export { rng, M, add, box, sph, cyl, white, emojiTex, sprite, ripple, PADY, pad, smallPad, lotus, cattail, reeds, stone, twig, log, FOOD, drawFood, foodTex, foodURL, tableFood, ROOF, leafRoof, stall, stageLotus, berryLights, snailShell, infoShell, basketBin, logBench, taroUmbrella, reedGate, dewdrop, leafBoat, twigBridge, pathDot, CR, eyes, critter, kiko, king, clipboard, vest, heroOtter, heroDuck, heroFrog, shore };
