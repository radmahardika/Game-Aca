import { ui, L } from '../ui.js';

// Urutan langkah dengan checklist; aksi di luar urutan dicatat sebagai "kurang tepat".
export class Steps {
  constructor(list) { this.list = list; this.i = 0; this.warned = new Set(); this.refresh(); }
  get cur() { return this.list[this.i]; }
  is(id) { return this.cur && this.cur.id === id; }
  done(id) { const k = this.list.findIndex(s => s.id === id); return k > -1 && k < this.i; }
  next() { this.i++; this.refresh(); }
  refresh() {
    const vis = this.list.filter(s => !s.hidden);
    ui.check(vis.map(s => { const k = this.list.indexOf(s); return { t: s.t, done: k < this.i, cur: k === this.i }; }));
    const vi = vis.indexOf(this.cur);
    ui.obj(this.cur ? `<b>${vi + 1}/${vis.length}</b> · ${this.cur.obj}` : '');
  }
  // guard: jalankan fn bila id adalah langkah sekarang; bila belum waktunya, beri penjelasan.
  guard(id, fn) {
    return () => {
      if (this.is(id)) return fn();
      if (this.done(id)) return ui.toast('Sudah dilakukan 👍');
      const want = this.cur ? this.cur.t : '';
      const key = id + '>' + (this.cur && this.cur.id);
      if (!this.warned.has(key)) { this.warned.add(key); L('order', `Urutan: "${this.list.find(s => s.id === id).t}" dikerjakan sebelum "${want}"`); }
      ui.toast(`Belum waktunya. Dahulukan: ${want}`, 'bad');
    };
  }
}
export function deferred() { let resolve; const promise = new Promise(r => resolve = r); return { promise, resolve }; }
export const wait = ms => new Promise(r => setTimeout(r, ms));
// dorong posisi keluar dari kotak [x0,z0,x1,z1]
export function pushOutBox(p, b, r = .35) {
  const [x0, z0, x1, z1] = b;
  if (p.x > x0 - r && p.x < x1 + r && p.z > z0 - r && p.z < z1 + r) {
    const dl = p.x - (x0 - r), dr = (x1 + r) - p.x, dt = p.z - (z0 - r), db = (z1 + r) - p.z;
    const m = Math.min(dl, dr, dt, db);
    if (m === dl) p.x = x0 - r; else if (m === dr) p.x = x1 + r; else if (m === dt) p.z = z0 - r; else p.z = z1 + r;
  }
}
export function pushOutCircle(p, cx, cz, rad) { const dx = p.x - cx, dz = p.z - cz, d = Math.hypot(dx, dz); if (d < rad && d > 1e-4) { p.x = cx + dx / d * rad; p.z = cz + dz / d * rad; } }
export async function flash(text, sub, ms = 1400) { ui._flash++; await ui.fade(true); ui.sub(text, sub); await wait(ms); ui.sub(); await ui.fade(false); ui._flash--; }
