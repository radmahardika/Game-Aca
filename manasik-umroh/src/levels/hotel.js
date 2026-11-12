// Bab 1 — Hotel di Makkah: persiapan ihram.
import { hotelRoom, ROOM } from '../models.js';
import { ui, S, P } from '../ui.js';
import { SORT_CARDS, DRESS, Q } from '../data.js';
import { Steps, deferred, pushOutBox, flash } from './common.js';

export async function hotel(E) {
  E.clear();
  const { ihram } = hotelRoom(E.scene);
  E.setHero(S.g, 'kasual'); E.spawn(-1.2, .6, Math.PI);
  E.camCfg = { dist: 3.2, h: 2.4, look: 1.1, fov: 66 };
  E.player.frozen = false;
  const fin = deferred();
  const st = new Steps([
    { id: 'buku', t: 'Baca buku manasik', obj: 'Baca dulu <i>buku manasik</i> di meja kecil' },
    { id: 'mandi', t: 'Mandi besar', obj: 'Masuk <i>kamar mandi</i> untuk mandi besar' },
    { id: 'parfum', t: 'Wewangian di badan', obj: 'Pakai <i>wewangian di badan</i> di meja rias' },
    { id: 'ihram', t: 'Pakai pakaian ihram', obj: 'Ambil <i>pakaian ihram</i> di atas kasur' },
    { id: 'keluar', t: 'Turun ke bus', obj: 'Keluar kamar, rombongan menuju miqat <i>Qarnul Manazil</i> (Taif)' },
  ]);
  const { W: RW, D: RD, H: RH } = ROOM;
  const it = (id, x, z, label, icon, fn, r = 1.4) => E.add({ id, pos: { x, z }, r, label, icon, active: () => !st.done(id), marker: () => st.is(id), use: st.guard(id, fn) });
  it('buku', -3.6, 2.0, 'BACA', '📖', async () => { await ui.sortGame(SORT_CARDS()); st.next(); });
  it('mandi', RW / 2 - .8, 2.4, 'MANDI', '🚿', async () => { await flash('Mandi besar untuk ihram', 'Niatkan mandi sunnah ihram'); ui.toast('✔ Sudah mandi besar', 'good'); st.next(); });
  it('parfum', -1.0, -RD / 2 + 1.1, 'PAKAI', '🧴', async () => {
    ui.sub('Wewangian hanya di badan', 'Dipakai sebelum memakai pakaian ihram. Setelah niat, parfum menjadi larangan.');
    ui.toast('✔ Wewangian di badan', 'good'); st.next(); setTimeout(() => ui.sub(), 3500);
  });
  it('ihram', 2.0, -.2, 'PAKAI', '👘', async () => {
    await ui.dressGame(DRESS(), P() ? 'Tidak ada kain berjahit, kepala terbuka, mata kaki terlihat.' : 'Aurat tertutup, wajah dan telapak tangan terbuka.');
    await ui.fade(true); ihram.visible = false; E.setHero(S.g, 'ihram'); await ui.fade(false);
    await ui.ask(Q.ihramCara()); st.next();
  }, 1.6);
  it('keluar', 1.5, RD / 2 - .9, 'KELUAR', '🚪', async () => { ui.toast('Rombongan berangkat ke miqat 🚌', 'good'); fin.resolve(); });

  E.level = {
    env: 0.5,
    map: { scale: 14, center: [0, 0], draw(g, w, s) { const [x0, z0] = w(-RW / 2, -RD / 2); g.strokeStyle = 'rgba(255,255,255,.5)'; g.lineWidth = 2; g.strokeRect(Math.min(x0, -x0), Math.min(z0, -z0), Math.abs(x0) * 2, Math.abs(z0) * 2); const [bx, bz] = w(2.6, -2.2); g.fillStyle = 'rgba(255,255,255,.25)'; g.fillRect(bx - 1.2 * s, bz - 1.6 * s, 2.4 * s, 3.2 * s); } },
    collide(p) {
      p.x = Math.max(-RW / 2 + .4, Math.min(RW / 2 - .4, p.x)); p.z = Math.max(-RD / 2 + .4, Math.min(RD / 2 - .4, p.z));
      pushOutBox(p, [1.4, -3.9, 3.8, -.6]); pushOutBox(p, [-1.85, -RD / 2, -.35, -RD / 2 + .65]); pushOutBox(p, [3.5, .3, 4.3, .9]); pushOutBox(p, [-4.05, 2.3, -3.15, 2.9]); pushOutBox(p, [3.65, -3.8, 4.35, -3.2]);
    },
    camClamp(c, p) { const ox = c.x, oz = c.z; c.x = Math.max(-RW / 2 + .3, Math.min(RW / 2 - .3, c.x)); c.z = Math.max(-RD / 2 + .3, Math.min(RD / 2 - .3, c.z)); const lost = Math.hypot(ox - c.x, oz - c.z); c.y = Math.min(RH - .2, c.y + lost * .9); },
  };
  ui.chip('Hotel · Makkah', 'Persiapan ihram'); st.refresh();
  await ui.fade(false); ui.loading(false);
  await ui.card('Bab 1 · Makkah', 'Pagi di hotel', 'Hari ini rombongan berangkat ke miqat <b>Qarnul Manazil</b> di Taif, lalu kembali ke Makkah untuk umroh. Siapkan dirimu untuk ihram.<br><br><small>Ikuti tanda ◆ emas. Joystick untuk berjalan, tombol emas untuk beraksi.</small>', 'Mulai');
  await fin.promise;
  E.player.frozen = true;
}
