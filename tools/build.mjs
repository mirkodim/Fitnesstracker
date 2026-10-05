/* Assembles the deployable site into _site/ (only the files the app needs) and stamps the version into sw.js and version.js.
   Usage: node tools/build.mjs [--version 2026.10.05-abc1234] [--out _site]
   Without --version both files keep "dev". Other files are never touched. */
import { cp, rm, mkdir, readFile, writeFile } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
export const FILES = ['index.html', 'styles.css', 'version.js', 'plan.js', 'fig.js', 'store.js', 'app.js', 'sw.js', 'manifest.webmanifest', '.nojekyll'];
export const DIRS = ['icons', 'fonts'];

function stamp(text, re, version, file) {
  let n = 0;
  const out = text.replace(re, (m, a, b) => { n++; return a + version + b; });
  if (n !== 1) throw new Error(file + ': expected exactly one version marker, found ' + n);
  return out;
}

export async function build({ version = 'dev', out = path.join(root, '_site'), from = root } = {}) {
  if (!/^[A-Za-z0-9._-]{1,64}$/.test(version)) throw new Error('Invalid version "' + version + '" (allowed: letters, digits, . _ -)');
  await rm(out, { recursive: true, force: true });
  await mkdir(out, { recursive: true });
  for (const f of FILES) await cp(path.join(from, f), path.join(out, f));
  for (const d of DIRS) await cp(path.join(from, d), path.join(out, d), { recursive: true });
  const sw = path.join(out, 'sw.js'), ver = path.join(out, 'version.js');
  await writeFile(sw, stamp(await readFile(sw, 'utf8'), /(var VERSION = ')[^']*(';)/, version, 'sw.js'));
  await writeFile(ver, stamp(await readFile(ver, 'utf8'), /(var APP_VERSION = ')[^']*(';)/, version, 'version.js'));
  return { out, version };
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const arg = (name, def) => { const i = process.argv.indexOf('--' + name); return i > 0 ? process.argv[i + 1] : def; };
  const r = await build({ version: arg('version', 'dev'), out: path.resolve(arg('out', path.join(root, '_site'))) });
  console.log('Built ' + path.relative(process.cwd(), r.out) + ' (version ' + r.version + ')');
}
