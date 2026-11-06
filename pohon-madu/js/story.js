// Alur cerita Prolog
// st: 0 = belum buka peti · 1 = ke dojo · 2 = kalahkan musuh desa · 3 = bos Raja Kumbang · 4 = Prolog selesai
(function () {
  const S = () => PM.S.story;
  const say = (k) => PM.say(PM.SCRIPT[k]);
  const setSt = (n) => { S().st = n; PM.save(); PM.explore.refreshHud(); };
  const free = () => (PM.explore.busy = false);

  PM.story = {
    async enter(mapId, first) {
      const st = S().st;
      if (mapId === 'rumah-nenek' && st === 0 && !S().intro) {
        S().intro = 1; PM.save();
        await say('pembuka');
      }
      if (mapId === 'desa-akar' && st === 3 && !S().rajaSeen) {
        S().rajaSeen = 1; PM.save();
        await say('rajaMuncul');
      }
      free();
    },

    async interact(kind, id) {
      const st = S().st;
      if (id === 'nenek') {
        if (st === 0) await say('nenekPeti');
        else if (st === 1) await say('nenekLagi');
        else await say('nenekNanti');
      } else if (id === 'peti') {
        if (st === 0) { PM.sfx('menang'); await say('peti'); setSt(1); }
        else await PM.say([['sys', '', '🧰 Peti kecil sudah kosong. Keping peta ada di tas Ata.']]);
      } else if (id === 'lukisan') await say('lukisan');
      else if (id === 'guru') {
        if (st === 0) await PM.say([['guru', 'lipat', 'Temui nenekmu dulu, Ata. Ia menunggumu di rumah.']]);
        else if (st === 1) {
          await say('guruAwal');
          const r = await PM.explore.fight(PM.STORY_ENC.latihan);
          if (r === 'win') { await say('guruLulus'); setSt(2); }
          else await PM.say([['guru', 'hormat', 'Tidak apa-apa. Coba lagi kapan saja — bicara denganku.']]);
        } else if (st === 2) await say('guruTugas');
        else if (st === 3) await say('guruBos');
        else await PM.say([['guru', 'hormat', 'Teruslah berlatih. Naik level untuk ikut ujian sabuk berikutnya!']]);
      } else if (id === 'sabuk') await say('sabuk');
      else if (id === 'penginapan') { PM.save(); await say('penginapan'); }
      else if (id === 'papan') await PM.say([['sys', '', '📋 Papan pengumuman: <b>' + PM.goal(st) + '</b>']]);
      else if (id === 'toko') await toko();
      else if (id === 'gerbang') await say(st >= 4 ? 'gerbangBuka' : 'gerbangTutup');
      free();
    },

    async afterFight(r, f) {
      const st = S().st;
      if (r === 'lose') {
        await PM.explore.teleport('rumah-nenek', [700, 680], 'depan');
        PM.explore.busy = true; await say('kalah'); free(); return;
      }
      if (r === 'flee') { if (f && !f.boss) PM.explore.push(f, 2.5); free(); return; }
      // menang
      if (f && f.boss) {
        PM.explore.W.bossGone = true;
        const b = PM.explore.W.foes.find((x) => x.boss); if (b) PM.explore.removeFoe(b);
        setSt(4); await say('tamat'); free(); return;
      }
      if (f) PM.explore.removeFoe(f);
      if (st === 2 && PM.DESA_GROUPS.every((g) => S().beat[g.id])) {
        setSt(3); S().rajaSeen = 1; PM.save();
        await say('rajaMuncul');
        PM.explore.W.bossGone = false; PM.explore.rebuild();
      }
      free();
    },
  };

  async function toko() {
    const v = await PM.dialog(`<div class="big-t">🏪 Toko Madu</div>🍯 Madu menyembuhkan 1 teman di battle.<br>Harga: <b>5 🪙</b> · Koinmu: <b>${PM.S.koin} 🪙</b> · Madu: <b>${PM.S.madu}</b>`,
      [{ label: 'Tidak', value: 0 }, { label: 'Beli 1 🍯', value: 1 }], 'small');
    if (!v) return;
    if (PM.S.koin < 5) { PM.sfx('batal'); await PM.dialog('Koinnya belum cukup. Kalahkan musuh untuk dapat koin!', null, 'small'); return; }
    PM.S.koin -= 5; PM.S.madu++; PM.save(); PM.sfx('sembuh'); PM.explore.refreshHud();
  }
})();
