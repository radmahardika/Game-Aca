// Pembuat soal: penjumlahan, pengurangan (sampai 20) dan perkalian kecil (hasil ≤ 15).
(function () {
  const G = (window.G = window.G || {});
  const rnd = (a, b) => a + Math.floor(Math.random() * (b - a + 1));
  const shuffle = (arr) => {
    for (let i = arr.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [arr[i], arr[j]] = [arr[j], arr[i]];
    }
    return arr;
  };

  function add(max) {
    if (max <= 10) {
      const a = rnd(1, 8);
      const b = rnd(1, 10 - a);
      return { op: '+', a, b, ans: a + b };
    }
    const ans = rnd(9, max);
    const a = rnd(2, ans - 2);
    return { op: '+', a, b: ans - a, ans };
  }

  function sub(max) {
    const a = rnd(7, max);
    const b = rnd(2, Math.min(10, a - 1));
    return { op: '−', a, b, ans: a - b };
  }

  const MUL = [[2, 2], [2, 3], [2, 4], [2, 5], [2, 6], [2, 7], [3, 2], [3, 3], [3, 4], [3, 5], [4, 2], [4, 3], [5, 2], [5, 3], [6, 2], [7, 2]];
  function mul() {
    const [a, b] = MUL[rnd(0, MUL.length - 1)];
    return { op: '×', a, b, ans: a * b };
  }

  // Dua pilihan pengecoh yang dekat dengan jawaban benar.
  function choices(q) {
    const c = q.ans;
    const pool = shuffle([c - 1, c + 1, c - 2, c + 2, c + 3, c - 3]).filter((n) => n >= 0 && n <= 20 && n !== c);
    const pick = [];
    for (const n of pool) if (pick.length < 2 && !pick.includes(n)) pick.push(n);
    return shuffle([c, ...pick]);
  }

  // Buat n soal unik dari daftar fungsi pembuat.
  G.makeQuestions = function (gens) {
    const out = [];
    const seen = new Set();
    for (const gen of gens) {
      let q, key, tries = 0;
      do {
        q = gen();
        key = q.a + q.op + q.b;
        tries++;
      } while (seen.has(key) && tries < 40);
      seen.add(key);
      q.choices = choices(q);
      q.eq = `${q.a} ${q.op} ${q.b} = ?`;
      out.push(q);
    }
    return out;
  };

  G.Q = { add, sub, mul, shuffle, rnd };
})();
