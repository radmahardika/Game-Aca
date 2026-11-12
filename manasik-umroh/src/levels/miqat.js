// Bab 2 — Miqat Qarnul Manazil (Taif): sholat sunnah ihram, niat, talbiyah.
import { masjidMiqat, bus, makeCrowd, R } from '../models.js';
import { ui, S } from '../ui.js';
import { Q, TALBIYAH } from '../data.js';
import { Steps, deferred, pushOutBox, flash } from './common.js';

export async function miqat(E) {
  E.clear();
  masjidMiqat(E.scene);
  const buses = [[-14, 46], [6, 48], [26, 46]];
  buses.forEach(([x, z]) => bus(E.scene, x, z, Math.PI / 2));
  const list = [];
  for (let i = 0; i < 160; i++) { const x = R(-36, 36), z = R(3, 38); if (Math.abs(x + 2) < 3 && z > 20) continue; if (Math.abs(x) < 4 && z < 8) continue; list.push({ x, z, ry: Math.PI + R(-.7, .7) }); }
  const crowd = makeCrowd(E.scene, list);
  E.setHero(S.g, 'ihram'); E.spawn(-2, 38, Math.PI);
  E.camCfg = { dist: 6.2, h: 3.6, look: 1.6, fov: 60 };
  E.player.frozen = false;
  const fin = deferred();
  const st = new Steps([
    { id: 'sholat', t: 'Sholat sunnah ihram', obj: 'Masuk <i>masjid miqat</i>: tahiyatul masjid & sholat sunnah ihram' },
    { id: 'niat', t: 'Niat umroh', obj: 'Ucapkan <i>niat umroh</i> di masjid miqat' },
    { id: 'bus', t: 'Kembali ke bus + talbiyah', obj: 'Kembali ke <i>bus</i> sambil memperbanyak talbiyah' },
  ]);
  E.add({ id: 'masjid', pos: { x: 0, z: -1.5 }, r: 3.2, marker: () => st.i < 2, y: 4, my: 3,
    actions: () => st.i === 0 ? [{ key: 'sh', label: 'SHOLAT', icon: '🕌', fn: st.guard('sholat', async () => { await flash('Tahiyatul masjid & sholat sunnah ihram', '2 rakaat · lalu bersiap berniat', 1800); st.next(); }) }]
      : st.i === 1 ? [{ key: 'ni', label: 'NIAT', icon: '🤍', fn: async () => { await ui.ask(Q.niat); ui.sub("Labbaika Allahumma 'umratan", 'Sekarang kamu dalam keadaan ihram. Larangan ihram mulai berlaku.'); await ui.ask(Q.lewatMiqat); st.next(); ui.sub('Talbiyah: ' + TALBIYAH, 'Perbanyak talbiyah, sholawat dan dzikir'); } }]
        : [] });
  E.add({ id: 'bus', pos: { x: -14 + 1.9, z: 46 + 7 }, r: 2.6, label: 'NAIK BUS', icon: '🚌', marker: () => st.is('bus'), use: st.guard('bus', () => fin.resolve()) });
  E.level = {
    env: 0.6,
    map: { scale: 1.6, draw(g, w) { const [a, b] = w(-40, -44), [c, d] = w(40, -4); g.fillStyle = 'rgba(241,235,224,.45)'; g.beginPath(); g.moveTo(...w(-40, -44)); g.lineTo(...w(40, -44)); g.lineTo(...w(40, -4)); g.lineTo(...w(-40, -4)); g.closePath(); g.fill(); } },
    update(dt) { crowd.update(dt); },
    collide(p) {
      p.x = Math.max(-44, Math.min(44, p.x)); p.z = Math.max(-2.6, Math.min(60, p.z));
      buses.forEach(([x, z]) => pushOutBox(p, [x - 12, z - 1.6, x + 12, z + 1.6]));
    },
  };
  ui.chip('Miqat · Taif', 'Qarnul Manazil'); st.refresh();
  await ui.fade(false); ui.loading(false);
  await ui.card('Bab 2 · Miqat', 'Qarnul Manazil, Taif', 'Dari Makkah, bus rombongan naik ke arah Taif menuju masjid miqat <b>Qarnul Manazil</b>. Di sinilah niat umroh diucapkan, lalu kembali ke Makkah dalam keadaan ihram.', 'Turun dari bus');
  await ui.ask(Q.miqat);
  await fin.promise;
  E.player.frozen = true; ui.sub();
}
