/* Checks a built site, either on disk or live.
     node tools/check-site.mjs _site [--version 2026.10.05-abc1234]
     node tools/check-site.mjs --url https://user.github.io/repo/ [--version ...] [--retries 30] [--delay 6]
   Disk: the service worker's precache list matches the files, the manifest is complete and its icons exist at the declared sizes,
   nothing points to another host or an absolute path, versions agree.
   Live: every precached file, the manifest and sw.js answer with status 200 and the expected type, and sw.js carries the expected version.
   Exit code 1 if anything fails. */
import { readFile, readdir, stat } from 'node:fs/promises';
import path from 'node:path';

const args = process.argv.slice(2);
const flag = (name, def) => { const i = args.indexOf('--' + name); return i >= 0 ? args[i + 1] : def; };
const url = flag('url');
const expectVersion = flag('version');
const dirArg = args.find((a, i) => !a.startsWith('--') && !(i > 0 && args[i - 1].startsWith('--')));

let failed = 0;
const ok = (msg) => console.log('  ok    ' + msg);
const bad = (msg) => { failed++; console.log('  FEHLT ' + msg); };
const check = (cond, msg) => (cond ? ok(msg) : bad(msg));

function parsePrecache(sw) {
  const m = /var PRECACHE = \[([\s\S]*?)\];/.exec(sw);
  return m ? [...m[1].matchAll(/'([^']+)'/g)].map((x) => x[1]) : null;
}
const versionOf = (sw) => (/var VERSION = '([^']*)';/.exec(sw) || [])[1];
const appVersionOf = (js) => (/var APP_VERSION = '([^']*)';/.exec(js) || [])[1];
const entryFile = (e) => (e === './' ? 'index.html' : e);

function pngSize(buf) {
  if (buf.length < 24 || buf.toString('latin1', 1, 4) !== 'PNG') return null;
  return buf.readUInt32BE(16) + 'x' + buf.readUInt32BE(20);
}

async function walk(dir, base = dir) {
  const out = [];
  for (const e of await readdir(dir, { withFileTypes: true })) {
    const p = path.join(dir, e.name);
    if (e.isDirectory()) out.push(...(await walk(p, base)));
    else out.push(path.relative(base, p).split(path.sep).join('/'));
  }
  return out;
}

function checkManifest(m, has) {
  check(m.name === 'Trainings-Strichliste', 'manifest: name');
  check(m.short_name === 'Training', 'manifest: short_name');
  check(m.lang === 'de', 'manifest: lang de');
  check(m.display === 'standalone', 'manifest: display standalone');
  check(m.orientation === 'portrait', 'manifest: orientation portrait');
  check(m.start_url === './' && m.scope === './' && m.id === './', 'manifest: start_url, scope und id sind "./"');
  check(/^#[0-9a-f]{6}$/i.test(m.theme_color || '') && /^#[0-9a-f]{6}$/i.test(m.background_color || ''), 'manifest: theme_color und background_color');
  const icons = Array.isArray(m.icons) ? m.icons : [];
  const has192 = icons.some((i) => i.sizes === '192x192' && i.type === 'image/png' && (i.purpose || 'any').includes('any'));
  const has512 = icons.some((i) => i.sizes === '512x512' && i.type === 'image/png' && (i.purpose || 'any').includes('any'));
  const hasMask = icons.some((i) => i.sizes === '512x512' && i.type === 'image/png' && i.purpose === 'maskable');
  check(has192 && has512 && hasMask, 'manifest: Icons 192, 512 und maskable 512');
  check(icons.every((i) => !/^([a-z]+:)?\/\//i.test(i.src) && !i.src.startsWith('/')), 'manifest: Icon-Pfade sind relativ');
  return icons;
}

/* ---------- on disk ---------- */
async function checkDisk(dir) {
  console.log('Prüfe ' + dir);
  const files = await walk(dir);
  const read = (f) => readFile(path.join(dir, f), 'utf8');
  const sw = await read('sw.js');
  const precache = parsePrecache(sw);
  check(precache && precache.length > 0, 'sw.js: Precache-Liste gefunden');
  if (!precache) return;

  const missing = precache.filter((e) => !files.includes(entryFile(e)));
  check(!missing.length, 'sw.js: jede Datei der Precache-Liste existiert' + (missing.length ? ' (fehlt: ' + missing.join(', ') + ')' : ''));
  const listed = new Set(precache.map(entryFile));
  const extra = files.filter((f) => f !== 'sw.js' && f !== '.nojekyll' && !/^fonts\/OFL-.*\.txt$/.test(f) && !listed.has(f));
  check(!extra.length, 'sw.js: keine Datei der Seite fehlt in der Precache-Liste' + (extra.length ? ' (nicht aufgeführt: ' + extra.join(', ') + ')' : ''));
  check(precache.includes('./') && precache.includes('index.html'), 'sw.js: Startseite ist vorab gespeichert');
  check(/addEventListener\('fetch'/.test(sw), 'sw.js: fetch-Handler vorhanden');
  check(/cache: 'reload'/.test(sw), 'sw.js: Precache umgeht den HTTP-Cache (cache: reload)');
  check((sw.match(/skipWaiting\(/g) || []).length === 1 && /SKIP_WAITING/.test(sw), 'sw.js: skipWaiting nur auf Nachricht der Seite');
  check(!/install'[\s\S]{0,400}skipWaiting/.test(sw.split("addEventListener('activate'")[0]), 'sw.js: kein skipWaiting beim Installieren');
  check(/k !== CACHE/.test(sw) && /caches\.delete/.test(sw), 'sw.js: alte Caches werden beim Aktivieren gelöscht');

  const swVersion = versionOf(sw), appVersion = appVersionOf(await read('version.js'));
  check(!!swVersion && swVersion === appVersion, 'Version in sw.js und version.js stimmt überein (' + swVersion + ')');
  if (expectVersion) check(swVersion === expectVersion, 'Version ist ' + expectVersion);

  const manifest = JSON.parse(await read('manifest.webmanifest'));
  const icons = checkManifest(manifest);
  for (const i of icons) {
    if (!files.includes(i.src)) { bad('Icon fehlt: ' + i.src); continue; }
    const size = pngSize(await readFile(path.join(dir, i.src)));
    check(size === i.sizes, 'Icon ' + i.src + ' ist ' + size + ' (deklariert ' + i.sizes + ')');
  }
  const apple = pngSize(await readFile(path.join(dir, 'icons/apple-touch-icon.png')));
  check(apple === '180x180', 'apple-touch-icon ist 180x180');

  const html = await read('index.html');
  check(/<html lang="de"/.test(html), 'index.html: lang="de"');
  check(/<link rel="manifest" href="manifest\.webmanifest">/.test(html), 'index.html: Manifest verlinkt');
  check(/<meta name="viewport"[^>]*viewport-fit=cover/.test(html), 'index.html: viewport mit viewport-fit=cover');
  const refs = [...html.matchAll(/(?:src|href)="([^"]+)"/g)].map((m) => m[1]);
  const badRefs = refs.filter((r) => /^([a-z][a-z0-9+.-]*:)?\/\//i.test(r) || r.startsWith('/') || /^https?:/i.test(r));
  check(!badRefs.length, 'index.html: nur relative Pfade' + (badRefs.length ? ' (gefunden: ' + badRefs.join(', ') + ')' : ''));
  check(refs.filter((r) => !r.startsWith('#')).every((r) => files.includes(r.split('?')[0])), 'index.html: alle verlinkten Dateien existieren');

  const css = await read('styles.css');
  const urls = [...css.matchAll(/url\(\s*["']?([^"')]+)["']?\s*\)/g)].map((m) => m[1]);
  check(urls.every((u) => !/^([a-z][a-z0-9+.-]*:)?\/\//i.test(u) && !u.startsWith('/') && files.includes(u)), 'styles.css: alle url() sind relativ und existieren (' + urls.length + ')');
  check(!/@import/.test(css), 'styles.css: kein @import');

  let external = [];
  for (const f of files.filter((x) => /\.(js|css|html|webmanifest)$/.test(x))) {
    const text = (await read(f)).replace(/http:\/\/www\.w3\.org\/2000\/svg/g, '');
    for (const m of text.matchAll(/https?:\/\/[^\s'")<>]+/g)) external.push(f + ': ' + m[0]);
  }
  check(!external.length, 'keine Adresse eines fremden Hosts im Code' + (external.length ? ' (' + external.slice(0, 3).join('; ') + ')' : ''));
  check(files.includes('.nojekyll'), '.nojekyll vorhanden');

  let total = 0;
  for (const f of files) total += (await stat(path.join(dir, f))).size;
  check(total < 1_000_000, 'Gesamtgröße ' + Math.round(total / 1024) + ' KB (unter 1 MB)');
}

/* ---------- live ---------- */
async function getWithRetry(target, retries, delay, accept) {
  let last;
  for (let i = 0; i <= retries; i++) {
    try {
      const res = await fetch(target, { cache: 'no-store', redirect: 'follow' });
      const body = Buffer.from(await res.arrayBuffer());
      last = { status: res.status, type: res.headers.get('content-type') || '', body };
      if (res.status === 200 && (!accept || accept(last))) return last;
    } catch (e) { last = { status: 0, type: '', body: Buffer.alloc(0), error: String(e.message || e) }; }
    if (i < retries) await new Promise((r) => setTimeout(r, delay * 1000));
  }
  return last;
}

async function checkLive(base) {
  if (!base.endsWith('/')) base += '/';
  const retries = Number(flag('retries', 20)), delay = Number(flag('delay', 6));
  console.log('Prüfe ' + base + (expectVersion ? ' (erwartete Version ' + expectVersion + ')' : ''));
  const swAccept = (r) => !expectVersion || versionOf(r.body.toString('utf8')) === expectVersion;
  const sw = await getWithRetry(base + 'sw.js', retries, delay, swAccept);
  check(sw.status === 200, 'sw.js antwortet mit 200' + (sw.error ? ' (' + sw.error + ')' : ' (Status ' + sw.status + ')'));
  if (sw.status !== 200) return;
  const swText = sw.body.toString('utf8');
  check(/javascript/.test(sw.type), 'sw.js: Typ ' + sw.type);
  check(versionOf(swText) && (!expectVersion || versionOf(swText) === expectVersion), 'sw.js trägt die Version ' + versionOf(swText));
  const precache = parsePrecache(swText);
  check(precache && precache.length > 0, 'sw.js: Precache-Liste gefunden (' + (precache ? precache.length : 0) + ' Einträge)');
  if (!precache) return;

  const want = { '.html': /text\/html/, '.css': /text\/css/, '.js': /javascript/, '.png': /image\/png/, '.svg': /image\/svg\+xml/, '.woff2': /font\/woff2/, '.webmanifest': /manifest\+json|application\/json/ };
  for (const e of precache) {
    const r = await getWithRetry(base + (e === './' ? '' : e), 3, 4);
    const ext = e === './' ? '.html' : path.extname(e);
    check(r.status === 200 && (!want[ext] || want[ext].test(r.type)) && r.body.length > 0, e + ' (Status ' + r.status + ', ' + r.type.split(';')[0] + ', ' + r.body.length + ' Bytes)');
  }
  const man = await getWithRetry(base + 'manifest.webmanifest', 3, 4);
  let manifest = null;
  try { manifest = JSON.parse(man.body.toString('utf8')); } catch { /* reported below */ }
  check(!!manifest, 'manifest.webmanifest ist gültiges JSON');
  if (manifest) {
    const icons = checkManifest(manifest);
    for (const i of icons) {
      const r = await getWithRetry(new URL(i.src, base + 'manifest.webmanifest').href, 3, 4);
      check(r.status === 200 && pngSize(r.body) === i.sizes, 'Icon ' + i.src + ' erreichbar, ' + pngSize(r.body));
    }
    check(new URL(manifest.start_url, base + 'manifest.webmanifest').href === base, 'start_url zeigt auf ' + base);
  }
  const v = await getWithRetry(base + 'version.js', 3, 4);
  check(v.status === 200 && appVersionOf(v.body.toString('utf8')) === versionOf(swText), 'version.js stimmt mit sw.js überein (' + appVersionOf(v.body.toString('utf8')) + ')');
  const license = await getWithRetry(base + 'fonts/OFL-Barlow.txt', 1, 2);
  check(license.status === 200, 'Schrift-Lizenz liegt bei');
}

if (url) await checkLive(url);
else if (dirArg) await checkDisk(path.resolve(dirArg));
else { console.error('Aufruf: node tools/check-site.mjs <ordner> | --url <adresse>'); process.exit(2); }

console.log(failed ? '\n' + failed + ' Prüfung(en) fehlgeschlagen.' : '\nAlles in Ordnung.');
process.exit(failed ? 1 : 0);
