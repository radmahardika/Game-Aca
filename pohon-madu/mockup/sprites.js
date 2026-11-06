// Mockup — sprite Ata & musuh (pixel art dari kode)
const SPR = {};
(function () {
  const C = {
    ol: '#221a26', fd: '#3e3446', f: '#564a5e', fl: '#6f6278', // bulu gelap
    cr: '#ece0bf', cs: '#c9b98f', cd: '#a8976e',                 // bulu krem
    w: '#f4f1ea', ws: '#cfccc6', wd: '#a6a3a3',                  // dobok putih
    bk: '#1b171d', bkl: '#3a343c',                               // sabuk hitam
    ey: '#2a160e', eh: '#fff6dc', ns: '#130f14', mo: '#b4505a',
  };
  SPR.C = C;

  function head(S, ox, oy) {
    // tengkorak bulat + moncong pendek ke kiri
    S.ell(ox + 15, oy + 10.5, 8, 7.5, C.f);
    S.ell(ox + 8.5, oy + 13, 4.8, 3.4, C.f);
    S.ell(ox + 5, oy + 12.6, 2.2, 1.9, C.f);
    // telinga bulat
    S.ell(ox + 20.5, oy + 11, 2.5, 2.3, C.fd); S.p(ox + 20, oy + 11, C.ol);
    // mantel krem: dari alis menyapu ke belakang tengkuk
    const brow = (x) => oy + 4.6 + (x - ox - 8) * 0.42;
    S.ell(ox + 16, oy + 8, 9, 7.5, C.cr, (x, y) => y <= brow(x));
    S.ell(ox + 22.5, oy + 11, 2.2, 5, C.cr, (x, y) => y <= brow(x) + 1);
    // jambul runcing menyapu ke belakang
    [[10, 2], [10, 1], [13, 1], [13, 0], [12, 1], [16, 0], [16, -1], [15, 0], [19, 0], [19, -1], [18, 0], [22, 1], [22, 0], [21, 1], [25, 3], [26, 3], [24, 3], [26, 6], [27, 6]].forEach(([x, y]) => S.p(ox + x, oy + y + 1, C.cr));
    
    S.paint((x, y, c) => c === C.cr && (y >= brow(x) - 1.2 || x >= ox + 23), C.cs);
    S.paint((x, y, c) => c === C.cr && y <= oy + 2, C.cs);
    // sorot bulu moncong
    S.p(ox + 7, oy + 11, C.fl); S.p(ox + 8, oy + 11, C.fl); S.p(ox + 9, oy + 11, C.fl); S.p(ox + 6, oy + 12, C.fl);
    S.paint((x, y, c) => c === C.f && y >= oy + 15.5, C.fd);
    // mata besar tegas
    S.rect(ox + 11, oy + 9, 3, 3, C.ey); S.p(ox + 11, oy + 9, C.eh); S.p(ox + 13, oy + 11, '#6b3a1c');
    S.line(ox + 10, oy + 8, ox + 14, oy + 8, C.ol);
    // hidung & mulut
    S.rect(ox + 3, oy + 11, 2, 2, C.ns);
    S.p(ox + 6, oy + 15, C.ol); S.p(ox + 7, oy + 15, C.mo); S.p(ox + 8, oy + 15, C.ol);
  }

  function torso(S, ox, oy) {
    // jaket dobok
    S.ell(ox + 15.5, oy + 6, 7.5, 7.5, C.w);
    S.rect(ox + 9, oy + 4, 14, 9, C.w);
    // kerah V (bulu terlihat) + garis kerah
    S.line(ox + 13, oy + 0, ox + 16, oy + 6, C.fd, 2);
    S.line(ox + 12, oy + 0, ox + 16, oy + 7, C.ws);
    S.line(ox + 19, oy + 0, ox + 17, oy + 6, C.ws);
    // bayangan kanan
    S.paint((x, y, c) => c === C.w && x >= ox + 20, C.ws);
    S.paint((x, y, c) => c === C.ws && x >= ox + 22, C.wd);
    // sabuk hitam + simpul
    S.rect(ox + 8, oy + 11, 16, 2, C.bk);
    S.rect(ox + 12, oy + 10, 3, 4, C.bk);
    S.line(ox + 12, oy + 13, ox + 10, oy + 18, C.bk);
    S.line(ox + 14, oy + 13, ox + 14, oy + 18, C.bk);
    S.p(ox + 13, oy + 11, C.bkl);
  }

  // Ata — kuda-kuda siaga, menghadap kiri
  SPR.ataStance = function () {
    const S = PX.sprite(34, 46);
    // ekor
    S.ell(28, 31, 4.5, 3.4, C.fd); S.ell(31, 29, 2.4, 2, C.cs);
    // kaki belakang & depan (celana putih)
    S.line(19, 33, 23, 40, C.ws, 5); S.ell(24, 42, 3, 1.8, C.fd);
    S.line(13, 33, 8, 40, C.w, 5); S.ell(7, 42, 3.2, 1.8, C.fd);
    S.p(9, 38, C.ws); S.p(10, 37, C.ws);
    torso(S, 1, 19);
    // lengan belakang (kepalan dekat dagu)
    S.line(19, 22, 9, 22, C.ws, 4); S.ell(7.5, 21.5, 2.6, 2.4, C.fd);
    head(S, 3, 1);
    // lengan depan menjulur (kepalan di depan)
    S.line(17, 24, 6, 26, C.w, 4); S.ell(4, 26, 2.8, 2.6, C.f); S.p(3, 25, C.fl);
    S.p(7, 27, C.ws); S.p(8, 27, C.ws);
    S.outline(C.ol);
    return S;
  };

  // Ata — Tendangan Samping (Yeop Chagi)
  SPR.ataKick = function () {
    const S = PX.sprite(48, 46);
    S.ell(44, 26, 4, 3.2, C.fd); S.ell(46.5, 24, 2, 1.8, C.cs);
    // kaki tumpu
    S.line(32, 31, 35, 40, C.ws, 5); S.ell(36, 42, 3, 1.8, C.fd);
    // badan agak condong ke kanan
    torso(S, 16, 16);
    S.line(34, 19, 26, 15, C.ws, 4); S.ell(24.5, 14.5, 2.5, 2.4, C.fd);
    head(S, 18, -1);
    // kaki menendang lurus ke kiri
    S.line(26, 30, 5, 26, C.w, 5);
    S.line(26, 32, 6, 28, C.ws);
    S.ell(3, 25.5, 3.4, 2.4, C.fd); S.p(1, 25, C.f);
    // lengan depan menjaga
    S.line(30, 21, 24, 23, C.w, 4); S.ell(22, 22.5, 2.6, 2.5, C.f);
    S.outline(C.ol);
    return S;
  };

  // potret Ata (kepala besar) untuk panel & bar giliran
  SPR.ataFace = function () {
    const S = PX.sprite(30, 24);
    head(S, 2, 3);
    S.rect(8, 20, 20, 4, C.w); S.line(14, 20, 17, 23, C.fd, 2);
    S.outline(C.ol);
    return S;
  };

  // Kumbang Batu (tipe Keras), menghadap kanan
  SPR.kumbang = function () {
    const S = PX.sprite(36, 26);
    const st = '#8d8a84', sl = '#b4b0a6', sd = '#615e5a', leg = '#2d2a2e', hd = '#3c3540';
    // kaki
    [[8, 17], [14, 18], [20, 18], [26, 17]].forEach(([x, y], i) => { S.line(x, y, x + (i < 2 ? -3 : 3), y + 6, leg); S.line(x + 1, y, x + 1 + (i < 2 ? -3 : 3), y + 6, leg); });
    // kepala + tanduk
    S.ell(29, 15, 5, 4, hd);
    S.line(31, 12, 35, 6, hd, 2); S.p(35, 5, hd);
    S.rect(30, 14, 2, 2, '#ffcf4a'); S.p(30, 14, '#fff6c0');
    // cangkang batu
    S.ell(16, 13, 13, 9, st);
    S.ell(13, 9, 8, 5, sl, (x, y) => true);
    S.paint((x, y, c) => c === st && y > 15, sd);
    // retakan & lumut
    S.line(16, 5, 17, 20, sd); S.line(9, 10, 6, 14, sd); S.line(22, 8, 25, 13, sd);
    S.p(11, 6, '#7da35a'); S.p(12, 6, '#7da35a'); S.p(20, 5, '#7da35a'); S.p(21, 5, '#93b86a');
    S.outline(C.ol);
    return S;
  };

  // Tawon Nakal (tipe Lincah), menghadap kanan
  SPR.tawon = function () {
    const S = PX.sprite(30, 24);
    const y = '#f2c230', yd = '#c4911c', bk = '#2a2228', wi = '#d9eef6';
    // sayap
    S.ell(12, 6, 6, 4, wi); S.ell(18, 5, 5, 3.5, '#eef8fb');
    // perut bergaris + sengat
    S.ell(10, 14, 7, 5, y);
    for (let x = 5; x <= 15; x += 4) S.rect(x, 9, 2, 10, bk);
    S.paint((xx, yy, c) => c === y && yy > 16, yd);
    S.line(3, 15, 0, 16, bk);
    // dada + kepala
    S.ell(18, 13, 3.5, 3.5, bk);
    S.ell(23, 11, 4.6, 4.4, y);
    S.rect(24, 10, 2, 2, bk); S.p(25, 10, '#fff');
    S.p(23, 14, bk); S.p(24, 14, bk); S.p(25, 13, bk); // senyum jahil
    S.line(22, 7, 21, 3, bk); S.line(25, 7, 27, 3, bk);
    S.paint((xx, yy, c) => c === wi && yy < 0, wi);
    S.outline(C.ol);
    return S;
  };
})();
