// Tim Penyelamat Malam — koneksi dua iPad lewat PeerJS (WebRTC).
// iPad pembuat ruangan = "tuan rumah" yang menyimpan keadaan dunia; iPad kedua bergabung dengan kode 4 gambar.
(function () {
  const T = window.TPM;
  const PREFIX = 'tpm-radma-';
  T.CODE_ICONS = ['🌙', '⭐', '🍄', '🌲', '🦊', '🐸', '🍎', '💧'];

  // ?peer=localhost:9000 memakai server PeerJS lokal (untuk pengujian); tanpa itu memakai server PeerJS publik.
  function options() {
    const q = new URLSearchParams(location.search).get('peer');
    if (q) { const [host, port] = q.split(':'); return { host, port: +port || 9000, path: '/', secure: false, debug: 1 }; }
    return { debug: 1 };
  }

  const net = (T.net = { peer: null, conn: null, role: null, code: null, onMsg: null, onStatus: null });
  let retryTimer = null;
  const status = (k, info) => net.onStatus && net.onStatus(k, info);

  net.connected = () => !!(net.conn && net.conn.open);
  net.send = (m) => { if (net.connected()) { try { net.conn.send(m); } catch (e) { /* koneksi sedang putus */ } } };

  function wire(conn) {
    net.conn = conn;
    conn.on('open', () => { stopRetry(); status('open'); });
    conn.on('data', (d) => net.onMsg && net.onMsg(d));
    conn.on('close', () => { if (net.conn === conn) { status('lost'); if (net.role == 'guest') startRetry(); } });
    conn.on('error', () => {});
  }
  function keepSignal(p) {
    p.on('disconnected', () => setTimeout(() => { if (!p.destroyed && p.disconnected) { try { p.reconnect(); } catch (e) {} } }, 1500));
  }

  net.host = function (code) {
    net.stop();
    net.role = 'host'; net.code = code;
    return new Promise((resolve, reject) => {
      const p = new Peer(PREFIX + code.join(''), options());
      net.peer = p;
      let ready = false;
      p.on('open', () => { ready = true; resolve(); });
      p.on('error', (e) => { if (!ready) reject(e); else status('error', e.type); });
      p.on('connection', (c) => { const old = net.conn; wire(c); if (old && old !== c) { try { old.close(); } catch (e) {} } });
      keepSignal(p);
    });
  };

  function connectTo(p) { wire(p.connect(PREFIX + net.code.join(''), { reliable: true })); }

  net.join = function (code) {
    net.stop();
    net.role = 'guest'; net.code = code;
    return new Promise((resolve, reject) => {
      const p = new Peer(options());
      net.peer = p;
      let done = false;
      const finish = (ok, e) => { if (done) return; done = true; ok ? resolve() : reject(e); };
      p.on('open', () => {
        if (done) return;
        connectTo(p);
        net.conn.on('open', () => finish(true));
      });
      p.on('error', (e) => { if (!done) finish(false, e); else status('error', e.type); });
      keepSignal(p);
      setTimeout(() => finish(false, { type: 'timeout' }), 15000);
    });
  };

  function startRetry() {
    if (retryTimer) return;
    retryTimer = setInterval(() => {
      const p = net.peer;
      if (!p || p.destroyed || net.connected()) return;
      if (p.disconnected) { try { p.reconnect(); } catch (e) {} return; }
      connectTo(p);
    }, 3000);
  }
  function stopRetry() { clearInterval(retryTimer); retryTimer = null; }

  net.stop = function () {
    stopRetry();
    if (net.peer) { try { net.peer.destroy(); } catch (e) {} }
    net.peer = null; net.conn = null; net.role = null;
  };
})();
