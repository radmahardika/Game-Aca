// Bab 5 — Sa'i Shafa–Marwah 7 kali, lalu tahallul.
import * as THREE from 'three';
import { masa, makeCrowd, SAI, R, M, add, Box, Cyl, textPlane } from '../models.js';
import { ui, S, P, L } from '../ui.js';
import { SAI_Q, DZIKIR_BUKIT } from '../data.js';
import { Steps, deferred, pushOutBox, flash, wait } from './common.js';

export async function sai(E) {
  E.clear();
  const sc = E.scene;
  masa(sc);
  const HW = SAI.W / 2 - 1.4;
  // kerumunan dua jalur
  const items = [];
  for (let i = 0; i < 420; i++) { const lane = Math.random() < .5 ? 1 : -1; items.push({ x: R(-32, 32), z: lane * R(1.2, HW), lane: { v: lane * R(1.1, 1.6), min: -33, max: 33 } }); }
  const crowd = makeCrowd(sc, items);
  // tempat tahallul & pintu keluar dekat Marwah
  const bar = { x: 31, z: -6 }, ext = { x: 33, z: 6 };
  add(sc, Box(2.4, 2.4, .2), M('#3e3328'), bar.x + 1.6, 1.2, bar.z - 1.6);
  const bl = textPlane('💈 TAHALLUL', 2.6, .6, '#7a2f2a'); bl.position.set(bar.x + 1.6, 2.8, bar.z - 1.45); sc.add(bl);
  const el = textPlane('PINTU KELUAR', 3, .6, '#1E5B46'); el.position.set(ext.x + 1.5, 3.2, ext.z + 1.6); el.rotation.y = Math.PI; sc.add(el);

  E.setHero(S.g, P() ? 'ihramTutup' : 'ihram'); E.spawn(-24, 4, -Math.PI / 2);
  E.camCfg = { dist: 6, h: 3.5, look: 1.5, fov: 62 };
  E.player.frozen = false;
  const fin = deferred();
  const Q = { lap: 0, started: false, target: 'Shafa', run: false, auto: false, zt: 0, zr: 0, inZ: false, outT: 0, warned: false, hill: false, done: false };
  const st = new Steps([
    { id: 'shafa', t: 'Naik ke bukit Shafa', obj: "Menuju <i>bukit Shafa</i> untuk memulai sa'i" },
    { id: 'sai', t: "Sa'i 7 kali", obj: 'Berjalan menuju <i>Marwah</i>' },
    { id: 'tahallul', t: 'Tahallul', obj: 'Menuju tempat <i>tahallul</i> di dekat Marwah' },
    { id: 'keluar', t: 'Keluar masjid', obj: 'Keluar lewat <i>pintu keluar</i>' },
  ]);
  const hillX = { Shafa: SAI.shafa, Marwah: SAI.marwah };
  E.add({ id: 'shafa', pos: { x: SAI.shafa + 1.5, z: 3 }, r: 3, label: 'NAIK', icon: '⛰️', marker: () => st.is('shafa'), active: () => !st.done('shafa'), use: st.guard('shafa', async () => {
    await ui.ask(SAI_Q.shafa);
    const { ok } = await ui.ask({ tag: 'Di atas Shafa', title: 'Apa yang dilakukan di atas Shafa?', nolog: true, opts: [{ t: "Menghadap Ka'bah, takbir & dzikir 3x, berdoa di sela-selanya", ok: true, fb: 'Betul.' }, { t: 'Langsung turun ke Marwah', ok: false, kind: 'miss', fb: 'Disunnahkan menghadap Ka\'bah, berdzikir dan berdoa dulu.' }], note: DZIKIR_BUKIT });
    if (ok) S.hit++; else S.miss.bukit++;
    Q.started = true; Q.target = 'Marwah'; st.next(); upd();
    ui.toast(P() ? 'Di antara lampu hijau, nyalakan "Lari kecil"' : 'Berjalan biasa sampai Marwah', 'warn');
  }) });
  E.add({ id: 'tahallul', pos: { x: bar.x, z: bar.z }, r: 2.6, label: 'TAHALLUL', icon: '✂️', marker: () => st.is('tahallul'), active: () => Q.done && !st.done('tahallul'), use: st.guard('tahallul', async () => {
    await ui.ask(SAI_Q.teman); await ui.ask(SAI_Q.tahallul()); await flash('Tahallul', P() ? 'Larangan ihram kini telah halal kembali' : 'Memotong rambut seruas jari, tertutup jilbab', 1500); st.next();
  }) });
  E.add({ id: 'keluar', pos: ext, r: 2.6, label: 'KELUAR', icon: '🦶', marker: () => st.is('keluar'), active: () => Q.done, use: st.guard('keluar', async () => { await ui.ask(SAI_Q.keluar); fin.resolve(); }) });

  function upd() { ui.chip("Sa'i", Q.started ? `Putaran ${Math.min(Q.lap + 1, 7)} / 7` : 'Bersiap'); if (Q.started && !Q.done) ui.obj(`Putaran ${Q.lap + 1}: menuju <i>${Q.target}</i>${P() ? ' · lari kecil di antara lampu hijau' : ''}`); }
  async function arrive(h) {
    Q.hill = true; Q.lap++; E.player.run = Q.run = false; Q.auto = false; E.player.frozen = true;
    if (Q.lap >= 7) {
      Q.done = true; st.next(); ui.chip("Sa'i", 'Selesai'); E.player.frozen = false; Q.hill = false;
      await ui.info("Sa'i selesai", '7 putaran, berakhir di Marwah 🤍', '<p>Berdoa di Marwah, lalu menuju tempat <b>tahallul</b>.</p>');
      return;
    }
    const { ok } = await ui.ask({ tag: `Putaran ${Q.lap} selesai`, title: `Tiba di ${h}`, text: 'Apa yang kamu lakukan?', nolog: true, opts: [
      { t: "Naik, menghadap Ka'bah, takbir & dzikir 3x, lalu berdoa", ok: true, fb: `Betul. Di ${h} lakukan seperti di Shafa.` },
      { t: 'Langsung putar balik', ok: false, kind: 'miss', fb: 'Disunnahkan menghadap Ka\'bah, berdzikir dan berdoa di setiap bukit.' },
      { t: 'Duduk istirahat sambil cek HP', ok: false, kind: 'miss', fb: 'Boleh istirahat bila lelah, tapi jangan lewatkan dzikir & doa di bukit.' }] });
    if (ok) S.hit++; else S.miss.bukit++;
    if (Q.lap === 2) await ui.ask(SAI_Q.hitung);
    Q.target = h === 'Marwah' ? 'Shafa' : 'Marwah'; Q.warned = false; Q.hill = false; E.player.frozen = false; upd();
  }
  function exitZone() {
    const ratio = Q.zt ? Q.zr / Q.zt : 0;
    if (P()) { if (ratio < .5) { S.miss.lari++; ui.toast('Lari kecil di antara lampu hijau terlewat', 'warn'); } else { S.hit++; ui.toast('✔ Lari kecil di antara lampu hijau', 'good'); } }
    else if (ratio > .5) { S.wLari++; ui.toast('Jamaah wanita cukup berjalan biasa di sini', 'warn'); }
    Q.zt = Q.zr = 0;
  }
  E.level = {
    exposure: 0.85,
    env: 0.45,
    map: { scale: 2.4, draw(g, w, s) {
      const r = (x0, z0, x1, z1, c) => { g.fillStyle = c; g.beginPath(); g.moveTo(...w(x0, z0)); g.lineTo(...w(x1, z0)); g.lineTo(...w(x1, z1)); g.lineTo(...w(x0, z1)); g.closePath(); g.fill(); };
      r(-35, -SAI.W / 2, 35, SAI.W / 2, 'rgba(255,255,255,.1)'); r(SAI.g0, -SAI.W / 2, SAI.g1, SAI.W / 2, 'rgba(43,255,112,.35)');
      r(-35, -SAI.W / 2, -31, SAI.W / 2, 'rgba(201,180,138,.8)'); r(31, -SAI.W / 2, 35, SAI.W / 2, 'rgba(201,180,138,.8)');
    } },
    update(dt) {
      crowd.update(dt);
      const p = E.player.pos;
      if (!Q.started && p.x > SAI.g1) { p.x = SAI.g1; ui.toast("Sa'i dimulai dari Shafa — kembali ke bukit Shafa", 'warn'); }
      if (!Q.started || Q.done || Q.hill) return;
      const z = p.x >= SAI.g0 && p.x <= SAI.g1;
      if (z && E.player.moving) { Q.zt += dt; if (Q.run) Q.zr += dt; }
      if (Q.inZ && !z) exitZone(); Q.inZ = z;
      if (!z && Q.run && P() && E.player.moving) { Q.outT += dt; if (Q.outT > 1 && !Q.warned) { Q.warned = true; S.lariLuar++; ui.toast('Lari kecil hanya di antara dua lampu hijau', 'warn'); } } else Q.outT = 0;
      if (Q.target === 'Marwah' && p.x > hillX.Marwah - 1) arrive('Marwah');
      else if (Q.target === 'Shafa' && p.x < hillX.Shafa + 1) arrive('Shafa');
    },
    autoMove(inp) {
      if (!Q.auto || inp.m > .08 || !Q.started || Q.done) return null;
      const p = E.player.pos, dir = Q.target === 'Marwah' ? 1 : -1, laneZ = dir * 4.5;
      const dz = (laneZ - p.z) * .25; const n = Math.hypot(1, dz);
      return { x: dir / n, z: dz / n, m: .9 };
    },
    toggles() {
      if (!Q.started || Q.done) return [];
      return [{ id: 'run', label: 'Lari kecil', icon: '🏃', green: true, on: Q.run, fn: () => { Q.run = E.player.run = !Q.run; } },
        { id: 'auto', label: 'Ikuti arus', icon: Q.target === 'Marwah' ? '→' : '←', on: Q.auto, fn: () => { Q.auto = !Q.auto; } }];
    },
    collide(p) {
      p.x = Math.max(SAI.shafa - 3, Math.min(SAI.marwah + 4.5, p.x)); p.z = Math.max(-HW, Math.min(HW, p.z));
      if (Math.abs(p.x) < 30) pushOutBox(p, [-30, -.3, 30, .3], .3);
    },
    camClamp(c) { c.z = Math.max(-SAI.W / 2 + .6, Math.min(SAI.W / 2 - .6, c.z)); c.y = Math.min(SAI.H - .8, c.y); c.x = Math.max(-37, Math.min(37, c.x)); },
  };
  upd(); st.refresh();
  await ui.fade(false); ui.loading(false);
  await ui.card("Bab 5 · Mas'a", "Sa'i Shafa – Marwah", "7 kali perjalanan antara bukit Shafa dan Marwah. Shafa → Marwah = 1, Marwah → Shafa = 2, berakhir di Marwah. Setelah itu tahallul.", 'Mulai');
  await fin.promise;
  E.player.frozen = true; ui.sub();
}
