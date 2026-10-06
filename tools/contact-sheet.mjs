/* Renders contact sheets of the exercise animations, drawn with the real styles.css and the same mixing the app uses. Look at the PNG, do not guess.
   Usage: node tools/contact-sheet.mjs [exercise ids...] [--out tests/out/sheet.png] [--theme light|dark] [--cols 4] [--cell 250] [--full]
   Default (compact): one row per exercise with every key pose and the middle of every move, in the order of the loop.
   --full: five frames for every transition. Without ids every animation is drawn. */
import { chromium } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const FIG = require('../fig.js');
require('../anims.js');

const args = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const full = args.includes('--full');
const valueFlags = new Set(['--out', '--theme', '--cols', '--cell']);
const ids = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && valueFlags.has(args[i - 1])));
const list = ids.length ? ids : Object.keys(FIG.ANIM);
const theme = flag('theme', 'light');
const cell = Number(flag('cell', full ? 250 : 200));
const out = path.resolve(flag('out', path.join(root, 'tests', 'out', 'sheet.png')));
const FRAMES = [0, 0.25, 0.5, 0.75, 1];

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }
const stage = (id, q, bad, t, tag) => '<div class="stage' + (bad ? ' bd' : '') + '"><svg viewBox="0 0 320 190">' + FIG.frame(id, q, bad) + '</svg><span class="t">' + tag + '</span></div>';

let body = '', maxCols = 1;
for (const id of list) {
  const A = FIG.ANIM[id];
  if (!A) { console.error('Unknown animation: ' + id); process.exit(2); }
  const n = A.steps.length;
  if (full) {
    const cols = 5; maxCols = Math.max(maxCols, cols);
    body += '<h2>' + id + '</h2><div class="sheet" style="grid-template-columns:repeat(' + cols + ',1fr)">';
    A.steps.forEach((to, i) => {
      const from = A.steps[(i + n - 1) % n];
      body += '<div class="seg">Schritt ' + ((i + n - 1) % n + 1) + ' → ' + (i + 1) + (to.bad ? ' (falsch, orange)' : '') + ': ' + esc(to.label) + '</div>';
      for (const t of FRAMES) body += stage(id, FIG.mix(from.pose, to.pose, t), !!to.bad, t, 't = ' + t);
    });
    body += '</div>';
  } else {
    const cols = Math.min(2 * n, 8); maxCols = Math.max(maxCols, cols);
    body += '<h2>' + id + (A.view === 'f' ? ' (Frontansicht)' : '') + '</h2><div class="sheet" style="grid-template-columns:repeat(' + cols + ',1fr)">';
    A.steps.forEach((to, i) => {
      const from = A.steps[(i + n - 1) % n];
      body += stage(id, FIG.mix(from.pose, to.pose, 0.5), !!to.bad, 0.5, '↝');
      body += stage(id, to.pose, !!to.bad, 1, (i + 1) + (to.bad ? ' falsch' : '')) ;
    });
    body += '</div><div class="seg">' + A.steps.map((s, i) => (i + 1) + ': ' + esc(s.label)).join('  ·  ') + '</div>';
  }
}

const width = maxCols * cell + 40;
const html = '<!doctype html><html lang="de" data-theme="' + theme + '"><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles.css"><style>' +
  'body{padding:14px;width:' + width + 'px}h2{font:700 18px system-ui;margin:14px 0 4px}.sheet{display:grid;gap:6px}' +
  '.seg{grid-column:1/-1;font:600 12px system-ui;color:var(--muted);margin-top:4px}.stage{position:relative;cursor:default;background:var(--surface-2);border-radius:8px}' +
  '.t{position:absolute;left:6px;top:4px;font:11px system-ui;color:var(--muted)}</style></head><body>' + body + '</body></html>';

await mkdir(path.dirname(out), { recursive: true });
const htmlFile = path.join(path.dirname(out), 'sheet.html');
await writeFile(htmlFile, html);
try { await access(path.join(root, 'styles.css')); } catch { console.error('styles.css not found'); process.exit(2); }

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width, height: 800 }, deviceScaleFactor: 1.5 });
await page.goto('file://' + htmlFile);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('Contact sheet: ' + path.relative(process.cwd(), out) + '  (' + list.join(', ') + ')');
