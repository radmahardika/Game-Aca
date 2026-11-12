// Bab 4 — Masjidil Haram: masuk masjid, thawaf 7 putaran, amalan ba'da thawaf.
import * as THREE from 'three';
import { kaaba, haram as haramScene, nightLights, makeCrowd, KW, KD, HIJIR, MAQAM, M, add, Box, Cyl, R, textPlane } from '../models.js';
import { ui, S, P, L } from '../ui.js';
import { HARAM_Q } from '../data.js';
import { Steps, deferred, pushOutBox, pushOutCircle, flash, wait } from './common.js';

const D2R = Math.PI / 180;
const ang = (x, z) => Math.atan2(-z, x);                     // sudut thawaf: naik = berlawanan jarum jam
const A_HA = ang(KW / 2, KD / 2);                            // ≈ -48.8°
const wrap = a => Math.atan2(Math.sin(a), Math.cos(a));
const RX = 44, RZ = 38;                                      // batas dalam serambi

export async function haram(E) {
  E.clear();
  const sc = E.scene;
  nightLights(sc); haramScene(sc); kaaba(sc);
  // lampu hijau penanda Hajar Aswad di serambi
  const ux = Math.cos(-A_HA), uz = Math.sin(-A_HA);
  const lampG = M('#7dffa8', { e: '#2bff70', ei: 3 });
  [[RX + 1, 6.6], [RX + 1, 1.2]].forEach(([r, y]) => add(sc, new THREE.SphereGeometry(.55, 12, 8), lampG, ux * r, y, uz * r * (RZ / RX), false));
  const gpl = new THREE.PointLight('#5dff95', 30, 18, 1.5); gpl.position.set(ux * (RX - 1), 5, uz * (RX - 1) * (RZ / RX)); sc.add(gpl);
  // tempat wudhu, zamzam, gerbang
  const ga = (21.5 / 84) * Math.PI * 2, gate = { x: Math.cos(ga) * 46, z: Math.sin(ga) * 40 };
  const wud = { x: gate.x + 9, z: 50 };
  add(sc, Box(6, .9, .8), M('#cfc6b3'), wud.x, .45, wud.z); for (let i = -2; i <= 2; i++) add(sc, Cyl(.05, .05, .4, 6), M('#c0c4c8', { m: 1, r: .3 }), wud.x + i * 1.2, 1.1, wud.z - .2, false);
  const wl = textPlane('TEMPAT WUDHU', 3, .6, '#1E5B46'); wl.position.set(wud.x, 2.4, wud.z + .1); wl.rotation.y = Math.PI; sc.add(wl);
  const gl = textPlane('BAB · PINTU MASUK', 4, .7, '#1E5B46'); gl.position.set(gate.x, 5.2, gate.z + 1.2); gl.rotation.y = Math.PI; sc.add(gl);
  const zz = { x: 24, z: 26 };
  for (let i = 0; i < 3; i++) { add(sc, Cyl(.35, .35, .9, 10), M('#e7e3da', { r: .4 }), zz.x + i * 1.1, .45, zz.z); add(sc, Cyl(.36, .36, .12, 10), M('#2b7a5b'), zz.x + i * 1.1, .95, zz.z, false); }
  const zl = textPlane('ZAMZAM', 2.4, .55, '#1E5B46'); zl.position.set(zz.x + 1.1, 2.1, zz.z - .6); zl.rotation.y = -2.4; sc.add(zl);
  const sg = Math.atan2(-14, 38); const masaGate = { x: Math.cos(sg) * 45, z: Math.sin(sg) * 39 };
  const ml = textPlane("→ MAS'A (SA'I)", 4, .7, '#1E5B46'); ml.position.set(masaGate.x * 1.02, 5.2, masaGate.z * 1.02); ml.lookAt(0, 5.2, 0); sc.add(ml);

  // kerumunan thawaf
  const items = [];
  for (let i = 0; i < 950; i++) {
    const r = 9.6 + Math.pow(Math.random(), 1.3) * 25; const a = Math.random() * 6.283;
    items.push({ orbit: { r, a, w: R(.85, 1.3) / r, sx: 1.06, sz: .96 }, jit: R(-.2, .2) });
  }
  const crowd = makeCrowd(sc, items);
  E.setHero(S.g, 'ihram'); E.spawn(gate.x + 2, 51, Math.PI);
  E.camCfg = { dist: 6.8, h: 4.6, look: 1.3, fov: 62 };
  E.player.frozen = false;
  const fin = deferred();

  // ---------- state ----------
  let phase = 'luar';
  const T = { done: 0, on: false, base: 0, prog: 0, lastA: 0, bad: false, badWhy: '', maxRp: 0, f: {}, auto: false, ev: {}, needHA: false, hijirWarn: false };
  const wR = 2 + Math.floor(Math.random() * 5); let aR; do { aR = 2 + Math.floor(Math.random() * 5); } while (aR === wR);
  T.ev[wR] = { at: 190, k: 'wudhu' }; T.ev[aR] = { at: 110, k: 'aurat' };

  const st = new Steps([
    { id: 'wudhu', t: 'Berwudhu', obj: 'Berwudhu dulu di <i>tempat wudhu</i>' },
    { id: 'masuk', t: 'Masuk masjid', obj: 'Masuk lewat <i>pintu (Bab)</i> dengan kaki kanan' },
    { id: 'thawaf', t: 'Thawaf 7 putaran', obj: 'Menuju <i>garis lampu hijau Hajar Aswad</i> untuk memulai thawaf' },
    { id: 'multazam', t: 'Doa di Multazam', obj: "Berdoa di <i>Multazam</i> (dinding antara Hajar Aswad & pintu Ka'bah)" },
    { id: 'pundak', t: 'Tutup kedua pundak', obj: 'Tutup kembali <i>kedua pundak</i>', hidden: !P() },
    { id: 'maqam', t: 'Sholat di Maqam Ibrahim', obj: 'Sholat 2 rakaat di belakang <i>Maqam Ibrahim</i>' },
    { id: 'istilam', t: 'Istilam ke Hajar Aswad', obj: 'Kembali ke <i>garis lampu hijau</i>, istilam ke Hajar Aswad' },
    { id: 'zamzam', t: 'Minum air zamzam', obj: 'Minum <i>air zamzam</i>' },
    { id: 'masa', t: "Menuju Mas'a", obj: "Menuju <i>Mas'a</i> untuk sa'i" },
  ]);
  if (!P()) st.list = st.list.filter(s => s.id !== 'pundak');
  st.refresh();

  const onHAline = p => { const a = ang(p.x, p.z), r = Math.hypot(p.x, p.z); return Math.abs(wrap(a - A_HA)) < 7 * D2R && r > 7 && r < 36; };
  // interaksi tetap
  E.add({ id: 'wudhu', pos: wud, r: 2.6, active: () => !st.done('wudhu'), label: 'WUDHU', icon: '💧', marker: () => st.is('wudhu'), use: st.guard('wudhu', async () => { await flash('Berwudhu', 'Thawaf harus dalam keadaan suci'); st.next(); }) });
  E.add({ id: 'masuk', pos: gate, r: 3, label: 'MASUK', icon: '🦶', marker: () => st.is('masuk'), active: () => phase === 'luar', use: st.guard('masuk', async () => {
    await ui.ask(HARAM_Q.masuk);
    phase = 'dalam'; st.next();
    // menatap Ka'bah
    E.player.frozen = true; E.spawn(gate.x * .95, gate.z * .95, Math.atan2(-gate.x, -gate.z));
    ui.cine(true); await wait(1400); ui.cine(false);
    await ui.ask(HARAM_Q.lihat); await ui.ask(HARAM_Q.tertib); if (P()) await ui.ask(HARAM_Q.idhthiba);
    E.player.frozen = false;
    ui.toast('Ikuti garis & lampu hijau ke pojok Hajar Aswad', 'warn');
  }) });
  const haMark = E.add({ id: 'ha', pos: { x: ux * 16, z: uz * 16 }, r: 0, check: () => false, marker: () => (st.is('thawaf') && !T.on) || st.is('istilam') || (T.on && T.needHA), noMap: false, y: 2.8 });
  E.add({ id: 'multazam', pos: { x: KW / 2 + 1.3, z: KD / 2 - 1.4 }, r: 2.2, label: 'DOA', icon: '🤲', marker: () => st.is('multazam'), active: () => phase === 'bada' && !st.done('multazam'), use: st.guard('multazam', async () => { await flash('Berdoa di Multazam', 'Tempat mustajab untuk berdoa', 1600); st.next(); }) });
  E.add({ id: 'maqam', pos: { x: MAQAM.x + 1.8, z: MAQAM.z }, r: 2.2, label: 'SHOLAT', icon: '🕌', marker: () => st.is('maqam'), active: () => phase === 'bada' && !st.done('maqam'), use: st.guard('maqam', async () => {
    ui.sub("Wattakhidzu mim maqoomi ibroohiima musholla", 'Dan jadikanlah sebagian Maqam Ibrahim tempat sholat'); await wait(900);
    await ui.ask(HARAM_Q.r1); await ui.ask(HARAM_Q.r2); await flash('Sholat sunnah thawaf 2 rakaat', 'lalu berdoa setelah sholat', 1500); ui.sub(); st.next();
  }) });
  E.add({ id: 'zamzam', pos: { x: zz.x + 1.1, z: zz.z - 1.2 }, r: 2.2, label: 'MINUM', icon: '💧', marker: () => st.is('zamzam'), active: () => phase === 'bada' && !st.done('zamzam'), use: st.guard('zamzam', async () => { await ui.ask(HARAM_Q.zamzam); st.next(); }) });
  E.add({ id: 'masa', pos: masaGate, r: 3.5, label: "KE MAS'A", icon: '🚶', marker: () => st.is('masa'), active: () => phase === 'bada', use: st.guard('masa', () => fin.resolve()) });

  // ---------- thawaf ----------
  function startRound(first) {
    T.on = true; T.needHA = false; T.base = T.prog; T.bad = false; T.badWhy = ''; T.maxRp = 0; T.f = { ha: true }; T.firedEv = false;
    ui.chip('Thawaf', `Putaran ${T.done + 1} / 7`);
    if (first) ui.obj("Ka'bah di <i>kiri</i> · ketuk tombol emas di tiap titik");
  }
  function invalidate(why, kind = 'fatal', msg) {
    if (T.bad) return; T.bad = true; T.badWhy = why;
    L(kind, why); ui.toast(msg || `❌ Putaran ini batal: ${why}`, 'bad');
  }
  function endRound() {
    if (T.bad) { ui.toast(`Putaran tidak dihitung (${T.badWhy}). Ulangi.`, 'bad'); }
    else { T.done++; ui.toast(`✔ Putaran ${T.done} sah`, 'good'); }
    if (T.done >= 7) { finishThawaf(); return; }
    T.base += 360; T.bad = false; T.badWhy = ''; T.maxRp = 0; T.f = {}; T.firedEv = false;
    ui.chip('Thawaf', `Putaran ${T.done + 1} / 7`);
  }
  async function finishThawaf() {
    T.on = false; T.auto = false; phase = 'bada'; st.next();
    ui.chip('Ba\'da thawaf', 'Amalan sunnah'); ui.sub();
    await ui.info('Thawaf selesai', '7 putaran, berakhir di Hajar Aswad 🤍', '<p>Lanjutkan amalan setelah thawaf. Ikuti urutannya pada daftar di kiri atas.</p>');
  }
  const attempt = () => Math.floor((T.prog - T.base) / 360) + T.done + 1;
  async function event(k) {
    E.player.frozen = true; T.auto = false;
    const q = k === 'wudhu' ? { tag: 'Kejadian', title: 'Wudhu batal di tengah putaran', text: 'Kamu merasa buang angin. Putaran masih setengah jalan.', opts: [
      { t: 'Keluar barisan, berwudhu, lalu ulangi putaran ini dari Hajar Aswad', ok: true, fb: 'Tepat. Yang batal hanya putaran itu; ulangi setelah berwudhu.' },
      { t: 'Lanjut saja, tanggung', ok: false, kind: 'fatal', fb: 'Batal wudhu membatalkan thawaf putaran itu. Tetap harus berwudhu dan mengulang.' }] }
      : { tag: 'Kejadian', title: P() ? 'Kain ihram bawah melorot' : 'Jilbab tersingkap', text: P() ? 'Desakan jamaah membuat kainmu tersingkap, aurat terlihat.' : 'Desakan jamaah membuat jilbabmu tergeser, rambut terlihat.', opts: [
        { t: 'Menepi, rapikan, lalu ulangi putaran ini', ok: true, fb: 'Tepat. Terlihat aurat membatalkan putaran itu.' },
        { t: 'Biarkan, rapikan setelah selesai', ok: false, kind: 'fatal', fb: 'Terlihat aurat membatalkan thawaf putaran itu.' }] };
    await ui.ask(q);
    if (k === 'wudhu') await flash('Berwudhu kembali', 'lalu ulangi putaran dari Hajar Aswad', 1200);
    T.bad = true; T.badWhy = k === 'wudhu' ? 'wudhu batal' : 'aurat terlihat';
    E.player.frozen = false;
    ui.toast('Putaran ini tidak dihitung — selesaikan sampai Hajar Aswad lalu ulangi', 'warn');
  }
  function track() {
    const p = E.player.pos, a = ang(p.x, p.z);
    const d = wrap(a - T.lastA) / D2R; T.lastA = a; T.prog += d;
    if (!T.on) return;
    const rp = T.prog - T.base;
    T.maxRp = Math.max(T.maxRp, rp);
    // arah terbalik
    if (T.maxRp - rp > 35 || rp < -25) {
      if (!T.bad) invalidate("Ka'bah di sebelah kanan (arah terbalik)", 'fatal', "❌ Arah terbalik! Ka'bah harus di sebelah kiri. Kembali ke garis Hajar Aswad.");
      T.on = false; T.needHA = true; T.auto = false; ui.obj('Kembali ke <i>garis lampu hijau Hajar Aswad</i> untuk mengulang putaran'); return;
    }
    // Hijir Ismail
    if (p.z < -KD / 2 && Math.hypot(p.x - HIJIR.cx, p.z - HIJIR.cz) < HIJIR.rIn) invalidate('masuk Hijir Ismail', 'fatal', '❌ Masuk Hijir Ismail — putaran ini batal (Hijir Ismail bagian dari Ka\'bah)');
    else if (!T.hijirWarn && rp > 140 && rp < 175) { T.hijirWarn = true; ui.toast('Tetap di luar tembok setengah lingkaran (Hijir Ismail)', 'warn'); }
    // zona sunnah terlewat
    if (rp > 20 && !T.f.ha) { T.f.ha = 'miss'; S.miss.ha++; ui.toast('Istilam di Hajar Aswad terlewat', 'warn'); }
    if (rp > 290 && !T.f.ya) { T.f.ya = 'miss'; S.miss.ya++; ui.toast('Isyarat di Rukun Yamani terlewat', 'warn'); }
    if (rp > 352 && !T.f.du) { T.f.du = 'miss'; S.miss.du++; ui.toast('Doa Rabbanaa aatinaa terlewat', 'warn'); }
    // kejadian acak
    const ev = T.ev[T.done + 1];
    if (ev && !T.firedEv && !T.bad && rp > ev.at) { T.firedEv = true; delete T.ev[T.done + 1]; event(ev.k); }
    // subtitle kontekstual
    if (rp >= 292 && rp < 355) ui.sub('Robbanaa aatinaa fid-dunyaa hasanah, wa fil aakhiroti hasanah, wa qinaa \'adzaaban-naar', 'antara Rukun Yamani dan Hajar Aswad');
    else if (rp < 18) ui.sub('Bismillah, Allahu akbar', 'istilam: isyaratkan tangan kanan ke Hajar Aswad, lalu kecup tangan');
    else ui.sub();
    if (rp >= 360) endRound();
  }
  function zone() { if (!T.on) return null; const rp = T.prog - T.base; if (rp < 20 && rp > -8) return 'ha'; if (rp >= 262 && rp <= 290) return 'ya'; if (rp > 290 && rp < 352) return 'du'; return null; }

  E.level = {
    exposure: 0.78,
    env: 0.3,
    map: { scale: 2.2, center: [0, 0], draw(g, w, s) {
      g.fillStyle = 'rgba(255,255,255,.08)'; g.beginPath(); g.ellipse(0, 0, RX * s, RZ * s, 0, 0, 7); g.fill();
      const c = [[KW / 2, KD / 2], [KW / 2, -KD / 2], [-KW / 2, -KD / 2], [-KW / 2, KD / 2]].map(([x, z]) => w(x, z));
      g.fillStyle = '#111'; g.strokeStyle = '#E5C477'; g.lineWidth = 1.5; g.beginPath(); c.forEach((q, i) => i ? g.lineTo(...q) : g.moveTo(...q)); g.closePath(); g.fill(); g.stroke();
      g.strokeStyle = '#fff'; g.beginPath(); for (let i = 0; i <= 20; i++) { const t = -Math.PI / 2 + Math.PI * i / 20; const [x, y] = w(Math.sin(t) * HIJIR.rOut, -KD / 2 - Math.cos(t) * HIJIR.rOut); i ? g.lineTo(x, y) : g.moveTo(x, y); } g.stroke();
      g.strokeStyle = '#2bff70'; g.lineWidth = 2; g.beginPath(); g.moveTo(...w(ux * 7, uz * 7)); g.lineTo(...w(ux * 34, uz * 34)); g.stroke();
      g.fillStyle = '#E5C477'; g.beginPath(); g.arc(...w(MAQAM.x, MAQAM.z), 3, 0, 7); g.fill();
    } },
    update(dt) { crowd.update(dt); if (phase !== 'luar') track(); const port = innerWidth < innerHeight; E.camBias = T.on || T.needHA ? (port ? 1.0 : .5) : 0; E.camCfg.fov = port ? 72 : 62; },
    autoMove(inp) {
      if (!T.auto || inp.m > .08) return null;
      const p = E.player.pos, a = ang(p.x, p.z);
      return { x: -Math.sin(a), z: -Math.cos(a), m: .85 };
    },
    actions() {
      const p = E.player.pos;
      if (phase === 'dalam' && st.is('thawaf') && onHAline(p) && (!T.on)) {
        return [{ key: 'start' + T.done, label: T.needHA ? 'ULANGI' : 'ISTILAM', icon: '🤚', fn: () => {
          const first = !T.needHA && T.done === 0; startRound(first); S.hit++;
          ui.toast('✔ Bismillah, Allahu akbar — putaran dimulai', 'good');
          if (first) ui.toast('Tip: aktifkan "Ikuti arus" agar berjalan otomatis', 'warn');
        } }, { key: 'push' + T.done, label: 'Dorong', icon: '💪', fn: () => { L('order', 'Mendorong jamaah untuk mencium Hajar Aswad — cukup istilam bila tidak memungkinkan'); ui.toast('Jangan menyakiti jamaah lain. Bila tidak memungkinkan mencium, cukup istilam.', 'bad'); } }];
      }
      if (phase === 'bada' && st.is('istilam') && onHAline(p)) return [{ key: 'ist2', label: 'ISTILAM', icon: '🤚', fn: () => { ui.toast('✔ Istilam ke arah Hajar Aswad', 'good'); st.next(); } }];
      const z = zone();
      if (z === 'ha' && !T.f.ha) return [{ key: 'ha', label: 'ISTILAM', icon: '🤚', fn: () => { T.f.ha = true; S.hit++; ui.toast('✔ Bismillah, Allahu akbar', 'good'); } }];
      if (z === 'ya' && !T.f.ya) return [
        { key: 'ya', label: 'ISYARAT', icon: '✋', fn: () => { T.f.ya = true; S.hit++; ui.toast('✔ Isyarat ke Rukun Yamani, tanpa dikecup', 'good'); } },
        { key: 'ya2', label: 'Kecup', icon: '💋', fn: () => { T.f.ya = true; S.wrongAct++; ui.toast('Di Rukun Yamani cukup diusap/isyarat, tidak dikecup', 'bad'); } }];
      if (z === 'du' && !T.f.du) return [{ key: 'du', label: 'DOA', icon: '🤲', fn: () => { T.f.du = true; S.hit++; ui.toast('✔ Robbanaa aatinaa fid-dunyaa hasanah…', 'good'); } }];
      return null;
    },
    toggles() {
      const t = [];
      if (T.on || T.needHA) t.push({ id: 'auto', label: 'Ikuti arus', icon: '↺', on: T.auto, fn: () => { T.auto = !T.auto; } });
      if (phase === 'bada' && P() && E.player.outfit === 'ihram') t.push({ id: 'pundak', label: 'Tutup pundak', icon: '🧣', on: false, fn: st.guard('pundak', () => { E.setHero('L', 'ihramTutup'); ui.toast('✔ Kedua pundak tertutup kembali', 'good'); st.next(); }) });
      return t;
    },
    collide(p) {
      // serambi
      const e = (p.x / (phase === 'luar' ? 60 : RX)) ** 2 + (p.z / (phase === 'luar' ? 54 : RZ)) ** 2; if (e > 1) { const k = 1 / Math.sqrt(e); p.x *= k; p.z *= k; }
      if (phase === 'luar') { const e2 = (p.x / 47.5) ** 2 + (p.z / 41.5) ** 2; if (e2 < 1) { const k = 1 / Math.sqrt(e2); p.x *= k; p.z *= k; } }
      pushOutBox(p, [-KW / 2 - .4, -KD / 2 - .4, KW / 2 + .4, KD / 2 + .4], .35);
      pushOutCircle(p, MAQAM.x, MAQAM.z, 1.4);
      // tembok Hijir Ismail (bisa dimasuki lewat celah di kedua ujungnya)
      if (p.z < -KD / 2) { const d = Math.hypot(p.x - HIJIR.cx, p.z - HIJIR.cz); if (d > HIJIR.rIn - .35 && d < HIJIR.rOut + .35) { const k = (d < (HIJIR.rIn + HIJIR.rOut) / 2 ? HIJIR.rIn - .35 : HIJIR.rOut + .35) / d; p.x = HIJIR.cx + (p.x - HIJIR.cx) * k; p.z = HIJIR.cz + (p.z - HIJIR.cz) * k; } }
    },
  };
  T.lastA = ang(E.player.pos.x, E.player.pos.z);
  window.__lv = { T, st, finishThawaf, fin };
  ui.chip('Makkah', 'Masjidil Haram');
  await ui.fade(false); ui.loading(false);
  await ui.card('Bab 4 · Makkah', 'Masjidil Haram', 'Setiba di hotel dan menaruh koper, rombongan menuju Masjidil Haram. Bersuci dulu, lalu masuk dan bersiap thawaf.', 'Menuju masjid');
  await fin.promise;
  E.player.frozen = true; ui.sub();
}
