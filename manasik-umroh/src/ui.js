// HUD, modal pertanyaan, toast, layar kartu & rapor.
const $ = s => document.querySelector(s);
export const S = { name: 'Jamaah', g: 'L', log: [], hit: 0, wrongAct: 0, lariLuar: 0, wLari: 0, miss: { ha: 0, ya: 0, du: 0, lari: 0, bukit: 0 }, played: [] };
export const P = () => S.g === 'L';
export function resetScore() { Object.assign(S, { log: [], hit: 0, wrongAct: 0, lariLuar: 0, wLari: 0, miss: { ha: 0, ya: 0, du: 0, lari: 0, bukit: 0 }, played: [] }); }
export function L(type, text) { const f = S.log.find(x => x.type === type && x.text === text); if (f) f.n = (f.n || 1) + 1; else S.log.push({ type, text }); }
export const shuffle = a => { for (let i = a.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1));[a[i], a[j]] = [a[j], a[i]]; } return a; };
export const pick = (a, n) => shuffle(a.slice()).slice(0, n);
const KIND = { fatal: '⚠️ Membatalkan', dam: '💸 Pelanggaran — kena Dam', miss: 'Sunnah terlewat', order: 'Kurang tepat' };

export const ui = {
  _flash: 0,
  get busy() { return this._flash > 0 || !$('#modal').classList.contains('hidden') || !$('#card').classList.contains('hidden'); },
  show(on) { $('#hud').classList.toggle('hidden', !on); },
  cine(on) { ['#stick', '#actions', '#toggles', '#mini', '#check'].forEach(s => $(s).style.visibility = on ? 'hidden' : ''); },
  chip(s, b) { $('#chipS').textContent = s; $('#chipB').textContent = b; },
  obj(html) { const o = $('#obj'); o.innerHTML = html || ''; o.classList.toggle('hidden', !html); },
  check(items) {
    const c = $('#check');
    if (!items || !items.length) { c.classList.add('hidden'); return; }
    c.classList.remove('hidden');
    c.innerHTML = items.map(i => `<span class="${i.done ? 'd' : i.cur ? 'n' : 'p'}">${i.done ? '✓' : '○'} ${i.t}</span>`).join('<br>');
  },
  sub(a, b) { const s = $('#sub'); if (!a) { s.classList.add('hidden'); return; } s.classList.remove('hidden'); $('#subA').innerHTML = a; $('#subB').innerHTML = b || ''; },
  _actKey: '',
  actions(list) {
    const key = list.map(a => a.key || a.label).join('|');
    if (key === this._actKey) return; this._actKey = key;
    const el = $('#actions'); el.innerHTML = '';
    list.slice(0, 2).forEach((a, i) => {
      const b = document.createElement('button'); b.className = 'act' + (i ? ' alt' : ''); b.innerHTML = `<span>${a.icon}</span>${a.label}`;
      b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (!ui.busy) a.fn(); });
      el.appendChild(b);
    });
    this._acts = list;
  },
  primary() { if (this._acts && this._acts[0] && !ui.busy) this._acts[0].fn(); },
  _tgKey: '',
  toggles(list) {
    const key = list.map(t => t.id + (t.on ? 1 : 0)).join('|'); if (key === this._tgKey) return; this._tgKey = key;
    const el = $('#toggles'); el.innerHTML = '';
    list.forEach(t => { const b = document.createElement('button'); b.className = 'tg' + (t.on ? ' on' : '') + (t.green ? ' green' : ''); b.textContent = `${t.icon} ${t.label}`; b.addEventListener('pointerdown', e => { e.preventDefault(); e.stopPropagation(); if (!ui.busy) t.fn(); }); el.appendChild(b); });
  },
  toast(msg, kind = '') { const t = $('#toast'); t.textContent = msg; t.className = 'show ' + kind; clearTimeout(this._tt); this._tt = setTimeout(() => t.className = '', 2600); },
  fade(on) { $('#fade').classList.toggle('on', on); return new Promise(r => setTimeout(r, 480)); },
  loading(on) { $('#loading').classList.toggle('hidden', !on); },

  card(k, t, p, btn = 'Lanjut') {
    return new Promise(res => { $('#cardK').textContent = k; $('#cardT').textContent = t; $('#cardP').innerHTML = p; $('#cardBtn').textContent = btn; $('#card').classList.remove('hidden'); $('#cardBtn').onclick = () => { $('#card').classList.add('hidden'); res(); }; });
  },
  _open() { $('#modal').classList.remove('hidden'); return $('#sheet'); },
  _close() { $('#modal').classList.add('hidden'); },

  // q: {tag,title,text,opts:[{t,ok,kind,fb,bonus,okTitle}],must,note,nolog,kind,log}
  ask(q) {
    return new Promise(res => {
      const el = ui._open();
      const render = () => {
        const opts = q.shuffle === false ? q.opts : shuffle(q.opts.slice());
        el.innerHTML = `${q.tag ? `<span class="tag">${q.tag}</span>` : ''}<h3>${q.title}</h3>${q.text ? `<p>${q.text}</p>` : ''}<div class="opts">${opts.map((o, k) => `<button class="opt" data-k="${k}">${o.t}</button>`).join('')}</div><div class="fb"></div>`;
        el.scrollTop = 0;
        el.querySelectorAll('.opt').forEach(b => b.onclick = () => {
          const o = opts[+b.dataset.k], kind = o.kind || q.kind || 'order', retry = !o.ok && q.must;
          el.querySelectorAll('.opt').forEach((x, k) => { x.disabled = true; if (opts[k].ok && !retry) x.classList.add('right'); });
          b.classList.add(o.ok ? 'right' : 'wrong');
          if (!o.ok && !q.nolog) L(kind, q.log || o.fb);
          if (o.bonus) S.hit++;
          const fb = el.querySelector('.fb'); fb.className = 'fb show ' + (o.ok ? 'good' : 'bad');
          fb.innerHTML = `<b>${o.ok ? (o.okTitle || 'Tepat! ✔') : KIND[kind]}</b>${o.fb ? `<p>${o.fb}</p>` : ''}${q.note ? `<p class="note">${q.note}</p>` : ''}<button class="btn mbtn">${retry ? 'Coba lagi ↺' : 'Lanjut →'}</button>`;
          fb.querySelector('.btn').onclick = () => { if (retry) render(); else { ui._close(); res({ ok: o.ok, o }); } };
          setTimeout(() => fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
        });
      };
      render();
    });
  },
  async askAll(list) { for (const q of list) await ui.ask(q); },
  info(tag, title, html, btn = 'Lanjut →') {
    return new Promise(res => { const el = ui._open(); el.innerHTML = `<span class="tag">${tag}</span><h3>${title}</h3><div>${html}</div><button class="btn mbtn">${btn}</button>`; el.querySelector('.btn').onclick = () => { ui._close(); res(); }; });
  },

  sortGame(cards) {
    return new Promise(res => {
      const el = ui._open(); const NM = { S: 'Syarat', R: 'Rukun', W: 'Wajib' }; let i = 0, wrong = 0, busy = false, missed = false;
      const draw = () => {
        if (i >= cards.length) {
          el.innerHTML = `<span class="tag">Buku manasik</span><h3>${wrong ? `${cards.length - wrong} dari ${cards.length} benar pada percobaan pertama` : 'Semua benar sejak percobaan pertama! 🎉'}</h3><p class="note">• <b>Syarat</b>: bila tak terpenuhi, gugur kewajiban umroh.<br>• <b>Rukun</b>: bila tak dikerjakan, umroh tidak sah.<br>• <b>Wajib</b>: bila dilanggar, umroh sah tapi wajib membayar Dam.</p><button class="btn mbtn">Tutup buku</button>`;
          el.querySelector('.btn').onclick = () => { ui._close(); res(); }; return;
        }
        const [c, cat] = cards[i]; busy = false;
        el.innerHTML = `<span class="tag">Buku manasik · pilah kartu</span><p class="cnt">Kartu ${i + 1} dari ${cards.length} · harus benar untuk lanjut</p><div class="sortcard">${c}</div><div class="bins"><button class="b1" data-c="S">Syarat</button><button class="b2" data-c="R">Rukun</button><button class="b3" data-c="W">Wajib</button></div>`;
        el.querySelectorAll('.bins button').forEach(b => b.onclick = () => {
          if (busy) return;
          if (b.dataset.c === cat) { busy = true; ui.toast(`✔ ${c} = ${NM[cat]}`, 'good'); i++; missed = false; setTimeout(draw, 500); return; }
          if (!missed) { wrong++; missed = true; L('order', `"${c}" termasuk ${NM[cat]} umroh, bukan ${NM[b.dataset.c]}`); }
          b.disabled = true; b.style.opacity = .35;
          el.querySelector('.sortcard').animate([{ transform: 'translateX(-8px)' }, { transform: 'translateX(8px)' }, { transform: 'none' }], { duration: 260 });
          ui.toast(`✗ Bukan ${NM[b.dataset.c]} — coba lagi`, 'bad');
        });
      };
      draw();
    });
  },
  dressGame(items, okText) {
    return new Promise(res => {
      const el = ui._open(); const sel = new Set(); let first = true;
      el.innerHTML = `<span class="tag">Ruang ganti</span><h3>Pilih yang kamu pakai</h3><p>Ketuk barang untuk dipakai/dilepas, lalu tekan <b>Cek pakaian</b>.</p><div class="grid2">${items.map(x => `<button class="item" data-id="${x.id}"><span class="e">${x.e}</span>${x.n}</button>`).join('')}</div><button class="btn mbtn" id="chk">Cek pakaian</button><div class="fb"></div>`;
      el.querySelectorAll('.item').forEach(b => b.onclick = () => { const id = b.dataset.id; sel.has(id) ? sel.delete(id) : sel.add(id); b.classList.toggle('on'); });
      el.querySelector('#chk').onclick = () => {
        const bad = items.filter(x => sel.has(x.id) && x.ok === 0), miss = items.filter(x => x.ok === 1 && !sel.has(x.id));
        const fb = el.querySelector('.fb');
        if (!bad.length && !miss.length) {
          fb.className = 'fb show good'; fb.innerHTML = `<b>Pakaian ihram siap ✔</b><p>${okText}</p><button class="btn mbtn">Pakai</button>`;
          fb.querySelector('.btn').onclick = () => { ui._close(); res(); }; el.querySelector('#chk').remove();
        } else {
          if (first) { bad.forEach(x => L('dam', `Memakai ${x.n.toLowerCase()} saat ihram — ${x.why}`)); miss.forEach(x => L('order', `Lupa memakai ${x.n.toLowerCase()}`)); first = false; }
          fb.className = 'fb show bad'; fb.innerHTML = `<b>Belum tepat — perbaiki dulu</b><ul>${bad.map(x => `<li>Lepas <b>${x.n}</b>: ${x.why}.</li>`).join('')}${miss.map(x => `<li>Belum memakai <b>${x.n}</b>.</li>`).join('')}</ul>`;
        }
        setTimeout(() => fb.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 50);
      };
    });
  },
  menu(onRestart, onBook) {
    const el = ui._open();
    el.innerHTML = `<span class="tag">Jeda</span><h3>Menu</h3><div class="opts"><button class="opt" id="mb">📖 Buku saku manasik</button><button class="opt" id="mr">↺ Kembali ke layar awal</button><button class="opt" id="mc">▶ Lanjut bermain</button></div>`;
    el.querySelector('#mc').onclick = () => ui._close();
    el.querySelector('#mr').onclick = () => { ui._close(); onRestart(); };
    el.querySelector('#mb').onclick = () => { el.innerHTML = BOOK + `<button class="btn mbtn">Tutup</button>`; el.querySelector('.mbtn').onclick = () => ui._close(); };
  },
};

const BOOK = `<span class="tag">Buku saku</span><h3>Ringkasan manasik</h3>
<p><b>Rukun</b> (tidak dikerjakan → tidak sah): Ihram (niat) · Thawaf · Sa'i · Tahallul · Tertib.<br><b>Wajib</b> (dilanggar → Dam): niat ihram dari miqat · meninggalkan larangan ihram.</p>
<p><b>Larangan ihram:</b> memotong/mencabut rambut & kuku, menggaruk sampai luka · bertengkar · parfum (termasuk sabun wangi) · bermesraan · berkata kotor · berburu · membunuh binatang, mencabut tumbuhan · make-up · <i>pria</i>: penutup kepala, pakaian berjahit, alas kaki menutup mata kaki · <i>wanita</i>: menutup wajah & telapak tangan.</p>
<p><b>Thawaf:</b> mulai & akhiri di Hajar Aswad (lampu hijau), Ka'bah di kiri, 7 putaran. Batal per putaran bila: batal wudhu, aurat terlihat, Ka'bah di kanan/membelakangi, niat membatalkan, tidak mulai/akhiri di Hajar Aswad, masuk Hijir Ismail.</p>
<p><b>Bacaan:</b> Hajar Aswad <span class="lat">Bismillah Allahu akbar</span> · antara Rukun Yamani–Hajar Aswad <span class="lat">Robbanaa aatinaa fid-dunyaa hasanah, wa fil aakhiroti hasanah, wa qinaa 'adzaaban-naar</span> · menuju Maqam <span class="lat">Wattakhidzu mim maqoomi ibroohiima musholla</span> · mendekati Shafa <span class="lat">Innash shafaa wal marwata min sya'aairillah</span>, <span class="lat">Nabda-u bimaa bada-allaahu bih</span>.</p>
<p><b>Sa'i:</b> mulai Shafa, akhir Marwah, 7 kali. Pria lari kecil di antara lampu hijau. Di tiap bukit: menghadap Ka'bah, takbir, dzikir 3x, berdoa.</p>
<p><b>Tahallul:</b> pria min. 3 helai / memendekkan / cukur gundul (afdhal). Wanita seruas jari, tanpa memperlihatkan rambut.</p>`;

export function rapor(onAgain) {
  ui.show(false);
  const c = t => S.log.filter(x => x.type === t);
  const fatal = c('fatal'), dam = c('dam'), order = c('order'), missQ = c('miss');
  const missG = Object.values(S.miss).reduce((a, b) => a + b, 0);
  const cnt = a => a.reduce((s, x) => s + (x.n || 1), 0);
  const score = Math.max(0, Math.round(100 - cnt(fatal) * 10 - cnt(dam) * 6 - cnt(order) * 2 - cnt(missQ) * 1.5 - missG * .8 - S.wrongAct * .8 - S.lariLuar));
  const badge = score >= 85 ? 'Siap berangkat 🕋' : score >= 65 ? 'Hampir siap — ulangi sekali lagi' : 'Perlu latihan lagi';
  const li = a => a.map(x => `<li>${x.text}${x.n > 1 ? ` <b>(${x.n}x)</b>` : ''}</li>`).join('');
  const sn = [S.miss.ha && `Istilam di Hajar Aswad terlewat ${S.miss.ha}x`, S.miss.ya && `Isyarat Rukun Yamani terlewat ${S.miss.ya}x`, S.miss.du && `Doa Rabbanaa aatinaa terlewat ${S.miss.du}x`, S.miss.lari && `Lari kecil di lampu hijau terlewat ${S.miss.lari}x`, S.miss.bukit && `Dzikir & doa di bukit terlewat ${S.miss.bukit}x`, S.wrongAct && `Salah aksi saat thawaf ${S.wrongAct}x`, S.lariLuar && `Lari kecil di luar lampu hijau ${S.lariLuar}x`, S.wLari && `Berlari di jalur lampu hijau (wanita cukup berjalan) ${S.wLari}x`].filter(Boolean);
  const txt = `🕋 Rapor Manasik Umroh — ${S.name} (${P() ? 'pria' : 'wanita'})\nBab dimainkan: ${S.played.join(', ')}\nSkor: ${score}/100 · ${badge}\n⚠️ Kesalahan fatal: ${cnt(fatal)}\n💸 Pelanggaran kena Dam: ${cnt(dam)}\n📝 Kurang tepat: ${cnt(order)}\n🤲 Sunnah dikerjakan: ${S.hit} · terlewat: ${missG + cnt(missQ)}`;
  const el = document.createElement('div'); el.className = 'screen'; el.style.background = 'rgba(8,12,20,.9)'; el.style.zIndex = 45;
  el.innerHTML = `<div class="rapor"><div class="kicker" style="color:#B7852E;text-align:center">Rapor latihan</div><h2 style="text-align:center">Latihan umroh selesai, ${S.name}!</h2>
  <div class="score">${score}</div><div class="cnt">dari 100</div><span class="badge">${badge}</span>
  <div class="stat"><div><b style="color:#B0412E">${cnt(fatal)}</b><small>Kesalahan fatal (membatalkan)</small></div><div><b style="color:#8A6420">${cnt(dam)}</b><small>Pelanggaran kena Dam</small></div><div><b>${cnt(order)}</b><small>Kurang tepat (urutan, istilah)</small></div><div><b style="color:#1E5B46">${S.hit}</b><small>Sunnah dikerjakan (${missG + cnt(missQ)} terlewat)</small></div></div>
  ${fatal.length ? `<div class="rsec"><h4>⚠️ Yang bisa membatalkan</h4><ul>${li(fatal)}</ul></div>` : ''}
  ${dam.length ? `<div class="rsec"><h4>💸 Pelanggaran ihram (Dam)</h4><ul>${li(dam)}</ul></div>` : ''}
  ${order.length ? `<div class="rsec"><h4>📝 Perlu dihafal lagi</h4><ul>${li(order)}</ul></div>` : ''}
  ${(sn.length || missQ.length) ? `<div class="rsec"><h4>🤲 Sunnah yang terlewat</h4><ul>${sn.map(x => `<li>${x}</li>`).join('')}${li(missQ)}</ul></div>` : ''}
  ${!fatal.length && !dam.length && !order.length ? `<div class="rsec"><h4>MasyaAllah, bersih ✨</h4><p>Tidak ada kesalahan rukun, wajib, maupun urutan.</p></div>` : ''}
  <div class="rsec"><h4>Bagikan ke grup rombongan</h4><textarea readonly>${txt}</textarea><button class="btn mbtn" id="cp">Salin rapor</button></div>
  <button class="btn big" id="again">Latihan lagi ↺</button></div>`;
  document.body.appendChild(el);
  el.querySelector('#cp').onclick = async () => { try { await navigator.clipboard.writeText(txt); ui.toast('Rapor tersalin ✔', 'good'); } catch (e) { const t = el.querySelector('textarea'); t.focus(); t.select(); ui.toast('Tekan lama teks untuk menyalin', 'warn'); } };
  el.querySelector('#again').onclick = () => { el.remove(); onAgain(); };
  window.__rapor = { score, txt };
}
