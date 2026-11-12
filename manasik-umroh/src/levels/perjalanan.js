// Bab 3 — Perjalanan Taif → Makkah: situasi larangan ihram (sinematik).
import * as THREE from 'three';
import { bus, palm, M, add, Box, skyGrad, dayLights, textPlane, R } from '../models.js';
import { ui } from '../ui.js';
import { laranganSet, TALBIYAH } from '../data.js';
import { wait } from './common.js';

export async function perjalanan(E) {
  E.clear();
  const sc = E.scene;
  skyGrad(sc, '#e9a86a', '#f6dcb4'); sc.fog = new THREE.Fog('#f0cfa2', 80, 420);
  const sun = dayLights(sc, [-80, 40, -60], .9, 40); sun.color.set('#ffd6a0');
  const gnd = new THREE.Mesh(new THREE.PlaneGeometry(800, 2400), M('#d8b98a', { r: 1 })); gnd.rotation.x = -Math.PI / 2; gnd.position.z = -1000; gnd.receiveShadow = true; sc.add(gnd);
  const road = new THREE.Mesh(new THREE.PlaneGeometry(10, 2400), M('#3d3b39', { r: .9 })); road.rotation.x = -Math.PI / 2; road.position.set(0, .02, -1000); sc.add(road);
  for (let z = 0; z > -2200; z -= 12) add(sc, Box(.25, .02, 4), M('#f2efe6'), 0, .03, z, false);
  const hill = M('#c79a68', { r: 1, flat: true });
  for (let i = 0; i < 70; i++) { const s = R(.6, 1); const h = add(sc, new THREE.ConeGeometry(R(20, 50), R(14, 40), 6), hill, (Math.random() < .5 ? -1 : 1) * R(60, 220), 6, -R(0, 2200), false); h.scale.set(1, s, 1); }
  for (let i = 0; i < 40; i++) palm(sc, (Math.random() < .5 ? -1 : 1) * R(9, 30), -R(0, 2200));
  [[-300, 'MAKKAH 70 km'], [-900, 'MAKKAH 40 km'], [-1500, 'MAKKAH 10 km']].forEach(([z, t]) => { add(sc, Box(.3, 4, .3), M('#888'), 7, 2, z); const p = textPlane(t, 6, 1.6, '#1E5B46'); p.position.set(7, 4.6, z + .2); sc.add(p); });
  const b = bus(sc, -2.2, 0, 0); b.rotation.y = Math.PI;
  E.player.obj = null;
  let z = 0, speed = 22, t = 0;
  E.level = {
    env: 0.5,
    update(dt) { t += dt; z -= speed * dt; if (z < -2100) z = 0; b.position.z = z; },
    camera(cam, dt) { const a = t * .05; cam.position.set(-2.2 + 14 * Math.cos(.9 + Math.sin(a) * .3), 6.5, z + 18 + Math.sin(a) * 4); cam.lookAt(-2.2, 2, z - 8); },
  };
  ui.cine(true); ui.chip('Perjalanan', 'Taif → Makkah'); ui.obj('Dalam keadaan ihram: jaga diri dari <i>larangan ihram</i>'); ui.check();
  ui.sub('Talbiyah: ' + TALBIYAH, 'Perbanyak talbiyah sepanjang perjalanan');
  await ui.fade(false); ui.loading(false);
  await ui.card('Bab 3 · Dalam keadaan ihram', 'Perjalanan ke Makkah', 'Kamu sudah berihram. Bus turun dari Taif kembali ke Makkah. Sepanjang jalan ada saja godaannya. Pilih sikap yang tepat.', 'Berangkat');
  for (const q of laranganSet()) { await wait(1600); await ui.ask(q); }
  await wait(800);
  ui.sub(); ui.cine(false);
}
