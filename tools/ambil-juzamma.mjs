// Mengunduh teks Latin (equran.id, Kemenag RI) dan audio Syaikh Al-Husary Mu'allim
// (everyayah.com) untuk surat-surat Kampung Hijau, lalu menulis data/juzamma.js.
//
//   node tools/ambil-juzamma.mjs            # teks + audio
//   node tools/ambil-juzamma.mjs --no-audio # teks saja (audio diputar dari everyayah.com)
//
// Teks tidak diketik tangan: semuanya diambil dari sumber, dan jumlah ayat dicek
// terhadap daftar di bawah. Mohon tetap dicek ulang oleh orang tua/guru sebelum dimainkan.
import { mkdir, writeFile, access } from 'node:fs/promises';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const AUDIO_DIR = 'audio/husary-muallim';
const AUDIO_URL = 'https://everyayah.com/data/Husary_Muallim_128kbps/';
const TEXT_URL = 'https://equran.id/api/v2/surat/';

// nomor surat: [nama tampilan, jumlah ayat]
const SURAH = {
  1: ['Al-Fatihah', 7], 94: ['Al-Insyirah', 8], 95: ['At-Tin', 8], 97: ['Al-Qadr', 5], 98: ['Al-Bayyinah', 8],
  99: ['Az-Zalzalah', 8], 100: ["Al-'Adiyat", 11], 101: ["Al-Qari'ah", 11], 102: ['At-Takatsur', 8],
  103: ["Al-'Ashr", 3], 104: ['Al-Humazah', 9], 105: ['Al-Fil', 5], 106: ['Quraisy', 4], 107: ["Al-Ma'un", 7],
  108: ['Al-Kautsar', 3], 109: ['Al-Kafirun', 6], 110: ['An-Nashr', 3], 111: ['Al-Lahab', 5],
  112: ['Al-Ikhlas', 4], 113: ['Al-Falaq', 5], 114: ['An-Nas', 6],
};

const pad = (n) => String(n).padStart(3, '0');
const exists = (p) => access(p).then(() => true, () => false);

async function getJSON(url) {
  for (let i = 0; i < 4; i++) {
    try {
      const r = await fetch(url);
      if (!r.ok) throw new Error(`${r.status} ${url}`);
      return await r.json();
    } catch (e) {
      if (i === 3) throw e;
      await new Promise((ok) => setTimeout(ok, 1000 * 2 ** i));
    }
  }
}

const withAudio = !process.argv.includes('--no-audio');
const out = { source: 'Teks Latin: equran.id (Kemenag RI). Audio: Syaikh Mahmud Khalil Al-Husary (Mu\'allim), everyayah.com.', audioBase: withAudio ? AUDIO_DIR + '/' : AUDIO_URL, surahs: {} };

for (const [no, [name, count]] of Object.entries(SURAH)) {
  const res = await getJSON(TEXT_URL + no);
  const ayat = res.data.ayat.map((a) => a.teksLatin.trim());
  if (ayat.length !== count) throw new Error(`Jumlah ayat ${name} tidak cocok: ${ayat.length} ≠ ${count}`);
  out.surahs[no] = { name, ayat };
  console.log(`✓ ${name} (${count} ayat)`);
  if (!withAudio) continue;
  await mkdir(join(ROOT, AUDIO_DIR), { recursive: true });
  for (let a = 1; a <= count; a++) {
    const file = join(ROOT, AUDIO_DIR, pad(no) + pad(a) + '.mp3');
    if (await exists(file)) continue;
    const r = await fetch(AUDIO_URL + pad(no) + pad(a) + '.mp3');
    if (!r.ok) throw new Error(`Audio gagal: ${no}:${a} (${r.status})`);
    await writeFile(file, Buffer.from(await r.arrayBuffer()));
  }
}

await mkdir(join(ROOT, 'data'), { recursive: true });
await writeFile(join(ROOT, 'data/juzamma.js'),
  '// Dibuat otomatis oleh tools/ambil-juzamma.mjs, jangan diubah dengan tangan.\n' +
  'window.G = window.G || {};\nwindow.G.JUZAMMA = ' + JSON.stringify(out, null, 1) + ';\n');
console.log('Selesai: data/juzamma.js');
