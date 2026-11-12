// Mesin game: renderer, kamera orang ketiga, kontrol joystick/keyboard, interaksi kontekstual, peta mini.
import * as THREE from 'three';
import { ui } from './ui.js';
import { makeHero } from './models.js';
import { RoomEnvironment } from '../vendor/three/addons/environments/RoomEnvironment.js';
import { EffectComposer } from '../vendor/three/addons/postprocessing/EffectComposer.js';
import { RenderPass } from '../vendor/three/addons/postprocessing/RenderPass.js';
import { UnrealBloomPass } from '../vendor/three/addons/postprocessing/UnrealBloomPass.js';
import { OutputPass } from '../vendor/three/addons/postprocessing/OutputPass.js';

const V3 = THREE.Vector3;
export class Engine {
  constructor(canvas) {
    const r = this.renderer = new THREE.WebGLRenderer({ canvas, antialias: true, powerPreference: 'high-performance' });
    r.toneMapping = THREE.ACESFilmicToneMapping; r.outputColorSpace = THREE.SRGBColorSpace;
    r.shadowMap.enabled = true; r.shadowMap.type = THREE.PCFSoftShadowMap;
    this.camera = new THREE.PerspectiveCamera(60, 1, .1, 1500);
    this.scene = new THREE.Scene();
    this.clock = new THREE.Clock();
    this.joy = { x: 0, y: 0, active: false }; this.keys = {};
    this.timeScale = 1; this.camBias = 0; this._bias = 0; this.yaw = 0; this.pitch = .38; this.lastDrag = -10; this.t = 0;
    this.player = { obj: null, pos: new V3(), heading: 0, moving: false, speed: 0, run: false, phase: 0, frozen: true };
    this.interacts = []; this.markers = new Map(); this.level = null;
    this.camCfg = { dist: 6.2, h: 3.6, look: 1.4, fov: 60 };
    const pm = new THREE.PMREMGenerator(r); this.envTex = pm.fromScene(new RoomEnvironment(), .04).texture; pm.dispose();
    this.fps = { t: 0, n: 0, checked: false };
    this.setQuality('halus');
    this._setupInput(); this._resize(); addEventListener('resize', () => this._resize());
    this.mini = document.getElementById('mini').getContext('2d');
    r.setAnimationLoop(() => this._frame());
  }
  // 'halus': pantulan lingkungan, glow lampu (bloom), MSAA, resolusi tinggi. 'ringan': untuk HP lama.
  setQuality(q, auto) {
    this.q = q; const r = this.renderer, hi = q === 'halus';
    r.setPixelRatio(Math.min(devicePixelRatio || 1, hi ? 2 : 1.25));
    if (this.composer) { this.composer.dispose && this.composer.dispose(); this.composer = null; }
    if (hi) {
      const rt = new THREE.WebGLRenderTarget(1, 1, { type: THREE.HalfFloatType, samples: 4 });
      const c = this.composer = new EffectComposer(r, rt);
      this.rpass = new RenderPass(this.scene, this.camera); c.addPass(this.rpass);
      this.bloom = new UnrealBloomPass(new THREE.Vector2(256, 256), .55, .5, 1.0); c.addPass(this.bloom);
      c.addPass(new OutputPass());
    }
    this._applyEnv(); this._resize();
    if (auto) ui.toast('Grafis dialihkan ke mode Ringan agar lebih lancar', 'warn');
  }
  _applyEnv() {
    const on = this.q === 'halus', k = this.level?.env ?? .45;
    this.renderer.toneMappingExposure = this.level?.exposure ?? 1;
    this.scene.environment = on ? this.envTex : null;
    this.scene.traverse(o => { if (o.material) [].concat(o.material).forEach(m => { if ('envMapIntensity' in m) m.envMapIntensity = k; }); });
  }
  _resize() {
    const w = innerWidth, h = innerHeight; this.renderer.setSize(w, h, false); this.camera.aspect = w / h; this.camera.updateProjectionMatrix();
    if (this.composer) { this.composer.setPixelRatio(this.renderer.getPixelRatio()); this.composer.setSize(w, h); this.bloom.resolution.set(w / 2, h / 2); }
  }
  _setupInput() {
    const stick = document.getElementById('stick'), knob = document.getElementById('knob');
    let id = null, cx = 0, cy = 0;
    const R = 46;
    const mv = e => { if (e.pointerId !== id) return; let dx = e.clientX - cx, dy = e.clientY - cy; const d = Math.hypot(dx, dy); if (d > R) { dx *= R / d; dy *= R / d; } knob.style.transform = `translate(${dx}px,${dy}px)`; this.joy.x = dx / R; this.joy.y = dy / R; };
    const up = e => { if (e.pointerId !== id) return; id = null; this.joy.x = this.joy.y = 0; this.joy.active = false; knob.style.transform = ''; };
    stick.addEventListener('pointerdown', e => { e.preventDefault(); id = e.pointerId; const b = stick.getBoundingClientRect(); cx = b.left + b.width / 2; cy = b.top + b.height / 2; this.joy.active = true; stick.setPointerCapture(id); mv(e); });
    stick.addEventListener('pointermove', mv); stick.addEventListener('pointerup', up); stick.addEventListener('pointercancel', up);
    // geser layar = putar kamera
    const cv = this.renderer.domElement; let did = null, lx = 0, ly = 0;
    cv.addEventListener('pointerdown', e => { did = e.pointerId; lx = e.clientX; ly = e.clientY; cv.setPointerCapture(did); });
    cv.addEventListener('pointermove', e => { if (e.pointerId !== did) return; this.yaw -= (e.clientX - lx) * .006; this.pitch = Math.min(.95, Math.max(.12, this.pitch + (e.clientY - ly) * .003)); lx = e.clientX; ly = e.clientY; this.lastDrag = this.t; });
    const dup = e => { if (e.pointerId === did) did = null; };
    cv.addEventListener('pointerup', dup); cv.addEventListener('pointercancel', dup);
    addEventListener('keydown', e => { if (e.target.tagName === 'INPUT') return; this.keys[e.code] = true; if ((e.code === 'KeyE' || e.code === 'Space' || e.code === 'Enter') && !ui.busy) { e.preventDefault(); ui.primary(); } });
    addEventListener('keyup', e => { this.keys[e.code] = false; });
    addEventListener('blur', () => { this.keys = {}; });
  }
  // ---------- level ----------
  clear() {
    this.scene.traverse(o => { if (o.geometry && !o.geometry.userData?.keep) o.geometry.dispose(); if (o.material) [].concat(o.material).forEach(m => { if (m.map) m.map.dispose(); if (!m.userData?.keep) m.dispose(); }); });
    this.scene = new THREE.Scene(); this._envDone = false; this.fps = { t: 0, n: 0, checked: false }; this.interacts = []; this.markers.clear(); this.level = null;
    ui.actions([]); ui.toggles([]); ui.sub(); ui.check(); ui.obj(''); this.camBias = 0;
  }
  setHero(gender, outfit, opt = {}) {
    const p = this.player; if (p.obj) this.scene.remove(p.obj);
    p.obj = makeHero(gender, outfit, opt); p.obj.position.copy(p.pos); p.obj.rotation.y = p.heading; this.scene.add(p.obj);
    p.gender = gender; p.outfit = outfit;
  }
  spawn(x, z, heading, yaw = heading) { const p = this.player; p.pos.set(x, 0, z); p.heading = heading; this.yaw = yaw; if (p.obj) { p.obj.position.copy(p.pos); p.obj.rotation.y = heading; } this._snapCam = true; }
  add(it) { this.interacts.push(it); return it; }
  // ---------- loop ----------
  _frame() {
    const dt = Math.min(.05, this.clock.getDelta()) * this.timeScale; this.t += dt;
    const L = this.level;
    if (L && !this._envDone) { this._envDone = true; this._applyEnv(); }
    if (L && this.q === 'halus' && !this.fps.checked && !ui.busy) { const f = this.fps; f.t += dt / this.timeScale; if (f.t > 2) f.n++; if (f.t > 7) { f.checked = true; if (f.n / (f.t - 2) < 22 && !this.noAuto) this.setQuality('ringan', true); } }
    if (L) {
      this._move(dt);
      L.update && L.update(dt);
      this._interact();
      this._markers(dt);
      if (L.camera) L.camera(this.camera, dt); else this._camera(dt);
      this._map();
    }
    if (this.composer) { this.rpass.scene = this.scene; this.composer.render(); }
    else this.renderer.render(this.scene, this.camera);
  }
  input() {
    let x = this.joy.x, y = this.joy.y;
    const k = this.keys;
    if (k.KeyW || k.ArrowUp) y = -1; if (k.KeyS || k.ArrowDown) y = 1; if (k.KeyA || k.ArrowLeft) x = -1; if (k.KeyD || k.ArrowRight) x = 1;
    const m = Math.hypot(x, y); if (m > 1) { x /= m; y /= m; }
    return { x, y, m: Math.min(1, m) };
  }
  _move(dt) {
    const p = this.player, L = this.level;
    if (!p.obj) return;
    let mx = 0, mz = 0, mag = 0;
    if (!ui.busy && !p.frozen) {
      const inp = this.input();
      const fx = Math.sin(this.yaw), fz = Math.cos(this.yaw), rx = -fz, rz = fx;
      if (inp.m > .08) { mx = fx * -inp.y + rx * inp.x; mz = fz * -inp.y + rz * inp.x; mag = inp.m; const n = Math.hypot(mx, mz) || 1; mx /= n; mz /= n; }
      if (L.autoMove) { const a = L.autoMove(inp); if (a) { mx = a.x; mz = a.z; mag = a.m ?? 1; } }
    }
    const sp = (p.run ? 4.6 : 3.0) * (L.speedMul || 1) * mag;
    p.moving = sp > .05; p.speed = sp;
    if (p.moving) {
      const old = p.pos.clone();
      p.pos.x += mx * sp * dt; p.pos.z += mz * sp * dt;
      if (L.collide) L.collide(p.pos, old);
      const target = Math.atan2(mx, mz);
      let d = target - p.heading; d = Math.atan2(Math.sin(d), Math.cos(d)); p.heading += d * Math.min(1, dt * 10);
      const fwd = Math.cos(target - this.yaw);
      if (this.t - this.lastDrag > 1.2 && fwd > -.2) { let dy = p.heading - this.yaw; dy = Math.atan2(Math.sin(dy), Math.cos(dy)); this.yaw += dy * Math.min(1, dt * 1.6 * mag); }
      p.phase += dt * sp * 3.2;
    }
    const o = p.obj; o.position.set(p.pos.x, 0, p.pos.z); o.rotation.y = p.heading;
    const sw = p.moving ? Math.sin(p.phase) : 0;
    o.userData.feet[0].position.z = .05 + sw * .2; o.userData.feet[1].position.z = .05 - sw * .2;
    o.userData.body.position.y = p.moving ? Math.abs(Math.cos(p.phase)) * .05 : 0;
    o.userData.body.rotation.x = p.run && p.moving ? .12 : 0;
    o.userData.ring.scale.setScalar(1 + Math.sin(this.t * 3) * .06);
  }
  _camera(dt) {
    const p = this.player, c = this.camCfg, cam = this.camera;
    if (cam.fov !== c.fov) { cam.fov = c.fov; cam.updateProjectionMatrix(); }
    this._bias += (this.camBias - this._bias) * Math.min(1, dt * 2);
    const cy = this.yaw + this._bias, fx = Math.sin(cy), fz = Math.cos(cy);
    const dist = c.dist * (.75 + this.pitch * .6), h = c.h * (this.pitch / .38);
    const want = new V3(p.pos.x - fx * dist, h, p.pos.z - fz * dist);
    if (this.level.camClamp) this.level.camClamp(want, p.pos);
    if (this._snapCam) { cam.position.copy(want); this._snapCam = false; } else cam.position.lerp(want, Math.min(1, dt * 6));
    cam.lookAt(p.pos.x + fx * 2, c.look, p.pos.z + fz * 2);
  }
  _interact() {
    const p = this.player, L = this.level;
    let list = null;
    if (!ui.busy && !p.frozen) {
      if (L.actions) list = L.actions();
      if (!list || !list.length) {
        let best = null, bd = 1e9;
        for (const it of this.interacts) {
          if (it.active && !it.active()) continue;
          const d = Math.hypot(p.pos.x - it.pos.x, p.pos.z - it.pos.z);
          const inR = it.check ? it.check(p.pos) : d < (it.r || 1.6);
          if (inR && d < bd) { bd = d; best = it; }
        }
        if (best) list = best.actions ? best.actions() : [{ key: best.id, label: best.label, icon: best.icon, fn: () => best.use() }];
      }
    }
    ui.actions(list || []);
    if (L.toggles) ui.toggles(L.toggles()); else ui.toggles([]);
  }
  _markers(dt) {
    for (const it of this.interacts) {
      const show = it.marker && (!it.active || it.active()) && (typeof it.marker !== 'function' || it.marker());
      let m = this.markers.get(it);
      if (show && !m) {
        m = new THREE.Group();
        const gem = new THREE.Mesh(new THREE.OctahedronGeometry(.28), new THREE.MeshBasicMaterial({ color: '#F2C95C', toneMapped: false }));
        const beam = new THREE.Mesh(new THREE.CylinderGeometry(.04, .04, it.my || 2.2, 6), new THREE.MeshBasicMaterial({ color: '#F2C95C', transparent: true, opacity: .35, depthWrite: false }));
        beam.position.y = -(it.my || 2.2) / 2; m.add(gem, beam); m.userData.gem = gem;
        m.position.set(it.pos.x, (it.y ?? 2.6), it.pos.z); this.scene.add(m); this.markers.set(it, m);
      }
      if (m) { m.visible = !!show; if (show) { m.userData.gem.rotation.y += dt * 2; m.position.y = (it.y ?? 2.6) + Math.sin(this.t * 2.5) * .12; } }
    }
  }
  _map() {
    const g = this.mini, W = 200, L = this.level, p = this.player;
    const mp = L.map || { scale: 4 };
    const [cx, cz] = mp.center || [p.pos.x, p.pos.z];
    g.clearRect(0, 0, W, W); g.save();
    g.beginPath(); g.arc(100, 100, 98, 0, 7); g.clip();
    g.fillStyle = 'rgba(255,255,255,.07)'; g.fillRect(0, 0, W, W);
    // putar mengikuti kamera: arah depan kamera = atas
    const cY = Math.cos(this.yaw + this._bias), sY = Math.sin(this.yaw + this._bias);
    g.translate(100, 100); g.transform(-cY, -sY, sY, -cY, 0, 0);
    const s = mp.scale; const w = (x, z) => [(x - cx) * s, (z - cz) * s];
    if (mp.draw) mp.draw(g, w, s);
    for (const it of this.interacts) {
      if (it.active && !it.active()) continue; if (it.noMap) continue;
      const [x, y] = w(it.pos.x, it.pos.z); const mk = it.marker && (typeof it.marker !== 'function' || it.marker());
      g.fillStyle = mk ? '#F2C95C' : 'rgba(255,255,255,.55)'; g.beginPath(); g.arc(x, y, mk ? 6 + Math.sin(this.t * 4) * 1.5 : 3.5, 0, 7); g.fill();
    }
    const [px, py] = w(p.pos.x, p.pos.z);
    g.save(); g.translate(px, py); g.rotate(-p.heading); g.fillStyle = '#fff'; g.strokeStyle = '#1E5B46'; g.lineWidth = 2;
    g.beginPath(); g.moveTo(0, 9); g.lineTo(6, -6); g.lineTo(0, -2); g.lineTo(-6, -6); g.closePath(); g.fill(); g.stroke(); g.restore();
    g.restore();
  }
}
