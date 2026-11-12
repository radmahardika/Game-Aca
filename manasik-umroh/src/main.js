// Alur utama: layar judul → bab-bab manasik → rapor.
import { Engine } from './engine.js';
import { setDetail } from './models.js';
import { ui, S, resetScore, rapor } from './ui.js';
import { hotel } from './levels/hotel.js';
import { miqat } from './levels/miqat.js';
import { perjalanan } from './levels/perjalanan.js';
import { haram } from './levels/haram.js';
import { sai } from './levels/sai.js';

const $ = s => document.querySelector(s);
const E = new Engine($('#c'));
const CHAPTERS = [
  ['Hotel Makkah', hotel], ['Miqat Qarnul Manazil', miqat], ['Perjalanan', perjalanan], ['Masjidil Haram & Thawaf', haram], ["Sa'i & Tahallul", sai],
];
window.__sim = { E, S, ui };

function title() {
  ui.show(false); E.clear(); E.level = null; ui.loading(false);
  $('#title').classList.remove('hidden');
  $('#nm').value = S.name === 'Jamaah' ? '' : S.name;
  document.querySelectorAll('.gpick button[data-g]').forEach(b => { b.classList.toggle('on', b.dataset.g === S.g); b.onclick = () => { S.g = b.dataset.g; document.querySelectorAll('.gpick button[data-g]').forEach(x => x.classList.toggle('on', x === b)); }; });
  let q = 'halus'; try { q = localStorage.getItem('simq') || 'halus'; } catch (e) { }
  if (E.q === 'ringan' && E.fps.checked) q = 'ringan';
  document.querySelectorAll('#qpick button').forEach(b => { b.classList.toggle('on', b.dataset.q === q); b.onclick = () => { q = b.dataset.q; document.querySelectorAll('#qpick button').forEach(x => x.classList.toggle('on', x === b)); }; });
  $('#startBtn').onclick = () => {
    try { localStorage.setItem('simq', q); } catch (e) { }
    setDetail(q); if (E.q !== q) E.setQuality(q); S.name = $('#nm').value.trim() || 'Jamaah'; $('#title').classList.add('hidden'); run(+$('#chapSel').value); };
}
let runId = 0;
async function run(from) {
  const id = ++runId;
  resetScore();
  for (let i = from; i < CHAPTERS.length; i++) {
    if (id !== runId) return;
    ui.loading(true); await ui.fade(true);
    ui.show(true);
    S.played.push(CHAPTERS[i][0]);
    await new Promise(r => setTimeout(r, 30));
    await CHAPTERS[i][1](E);
    if (id !== runId) return;
  }
  await ui.fade(true); ui.fade(false);
  rapor(() => title());
}
$('#menuBtn').addEventListener('pointerdown', e => { e.stopPropagation(); ui.menu(() => { runId++; ui._flash = 0; document.querySelectorAll('#modal').forEach(m => m.classList.add('hidden')); title(); }, null); });
title();
