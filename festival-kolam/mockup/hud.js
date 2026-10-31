// HUD bersama (DOM di atas kanvas) supaya kedua gaya bisa dibandingkan dengan tampilan yang sama
window.mountHud = function (gayaLabel) {
  const h = document.createElement('div');
  h.className = 'hud';
  h.innerHTML = `
    <div class="bar">
      <div class="pill title">🪷 Festival Kolam <small>· Level 1: Genangan Kecil</small></div>
      <div class="sp"></div>
      <div class="pill">👣 37 <small>pengunjung</small></div>
      <div class="pill">🐚 128</div>
      <div class="pill">😊 85%</div>
      <div class="pill">⏰ <small>Hari 1 ·</small> 10.30</div>
    </div>
    <div class="goal">
      <b>TARGET FESTIVAL</b>
      👣 Pengunjung 37 / 100
      <div class="meter"><i style="width:37%"></i></div>
      🐚 Untung 28 / 50
      <div class="meter gold"><i style="width:56%"></i></div>
    </div>
    <div class="guide">
      <div class="bubble">Pengunjung suka musik! Coba taruh <b>Panggung Teratai</b> dekat kedai, ya.</div>
      <div class="face">🐸</div>
    </div>
    <div class="tools">
      <div class="tool on">🍡<span>Kedai</span></div>
      <div class="tool">🎵<span>Hiburan</span></div>
      <div class="tool">🪑<span>Fasilitas</span></div>
      <div class="tool">🌸<span>Hiasan</span></div>
      <div class="tool">📣<span>Promosi</span></div>
    </div>
    <div class="tag">${gayaLabel}</div>`;
  document.body.appendChild(h);
};
