/* Renders contact sheets of the exercise animations: for every transition between two steps, five frames from start to end,
   drawn with the real styles.css and the same mixing the app uses. Look at the PNG, do not guess.
   Usage: node tools/contact-sheet.mjs [exercise ids...] [--out tests/out/sheet.png] [--theme light|dark] [--cols 5] [--cell 250]
   Without ids every animation is drawn. */
import { chromium } from '@playwright/test';
import { createRequire } from 'node:module';
import { mkdir, writeFile, access } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const require = createRequire(import.meta.url);
const FIG = require('../fig.js');

const args = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const ids = args.filter((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));
const list = ids.length ? ids : Object.keys(FIG.ANIM);
const theme = flag('theme', 'light');
const cols = Number(flag('cols', 5));
const cell = Number(flag('cell', 250));
const out = path.resolve(flag('out', path.join(root, 'tests', 'out', 'sheet.png')));
const FRAMES = [0, 0.25, 0.5, 0.75, 1];

function esc(s) { return String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;'); }

let body = '';
for (const id of list) {
  const A = FIG.ANIM[id];
  if (!A) { console.error('Unknown animation: ' + id); process.exit(2); }
  body += '<h2>' + id + '</h2><div class="sheet" style="grid-template-columns:repeat(' + cols + ',1fr)">';
  A.steps.forEach((to, i) => {
    const from = A.steps[(i + A.steps.length - 1) % A.steps.length];
    body += '<div class="seg">Schritt ' + ((i + A.steps.length - 1) % A.steps.length + 1) + ' → ' + (i + 1) + (to.bad ? ' (falsch, orange)' : '') + ': ' + esc(to.label) + '</div>';
    for (const t of FRAMES) {
      const q = FIG.mix(from.pose, to.pose, t);
      body += '<div class="stage"><svg viewBox="0 0 320 190">' + FIG.frame(id, q, !!to.bad) + '</svg><span class="t">t = ' + t + '</span></div>';
    }
  });
  body += '</div>';
}

const html = '<!doctype html><html lang="de" data-theme="' + theme + '"><head><meta charset="utf-8"><link rel="stylesheet" href="../../styles.css"><style>' +
  'body{padding:14px;width:' + (cols * cell + 40) + 'px}h2{font:700 20px system-ui;margin:18px 0 6px}.sheet{display:grid;gap:8px}' +
  '.seg{grid-column:1/-1;font:600 13px system-ui;color:var(--muted);margin-top:6px}.stage{position:relative;cursor:default}' +
  '.t{position:absolute;left:8px;top:6px;font:12px system-ui;color:var(--muted)}</style></head><body>' + body + '</body></html>';

await mkdir(path.dirname(out), { recursive: true });
const htmlFile = path.join(path.dirname(out), 'sheet.html');
await writeFile(htmlFile, html);
try { await access(path.join(root, 'styles.css')); } catch { console.error('styles.css not found'); process.exit(2); }

const browser = await chromium.launch({ executablePath: process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium' });
const page = await browser.newPage({ viewport: { width: cols * cell + 40, height: 800 }, deviceScaleFactor: 2 });
await page.goto('file://' + htmlFile);
await page.screenshot({ path: out, fullPage: true });
await browser.close();
console.log('Contact sheet: ' + path.relative(process.cwd(), out) + '  (' + list.join(', ') + ')');
