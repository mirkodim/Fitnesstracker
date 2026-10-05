/* Looks through every file git knows about (tracked and untracked, but not ignored) for things that must never be published:
   tokens and keys, e-mail addresses, photos. Exit code 1 if anything is found. Run: node tools/scan.mjs */
import { execFileSync } from 'node:child_process';
import { readFileSync, statSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const files = execFileSync('git', ['ls-files', '-z', '--cached', '--others', '--exclude-standard'], { cwd: root })
  .toString().split('\0').filter(Boolean);

const PHOTO = /\.(jpe?g|heic|heif|webp|gif|bmp|tiff?|avif|raw|dng|cr2|nef)$/i;
const BINARY = /\.(png|woff2?|ico)$/i;
const ALLOWED_MAIL = new Set(['noreply@anthropic.com']);
const patterns = [
  ['GitHub-Token', /\b(gh[pousr]_[A-Za-z0-9]{20,}|github_pat_[A-Za-z0-9_]{20,})\b/],
  ['AWS-Schlüssel', /\bAKIA[0-9A-Z]{16}\b/],
  ['Privater Schlüssel', /-----BEGIN [A-Z ]*PRIVATE KEY-----/],
  ['Zugangsdaten im Klartext', /\b(api[_-]?key|secret|passwort|password|token)\b\s*[:=]\s*['"][^'"\s]{8,}['"]/i],
  ['Slack/Stripe/OpenAI-Schlüssel', /\b(xox[abprs]-[A-Za-z0-9-]{10,}|sk_(live|test)_[A-Za-z0-9]{10,}|sk-[A-Za-z0-9]{20,})\b/]
];
const MAIL = /[A-Za-z0-9._%+-]+@[A-Za-z0-9.-]+\.[A-Za-z]{2,}/g;

const problems = [];
for (const f of files) {
  let size = 0;
  try { size = statSync(path.join(root, f)).size; } catch { continue; }   // deleted but still listed
  if (PHOTO.test(f)) { problems.push(f + ': Foto-Datei'); continue; }
  if (BINARY.test(f) || size > 2_000_000) continue;
  const text = readFileSync(path.join(root, f), 'utf8');
  for (const [name, re] of patterns) if (re.test(text)) problems.push(f + ': ' + name);
  for (const m of text.match(MAIL) || []) if (!ALLOWED_MAIL.has(m.toLowerCase())) problems.push(f + ': E-Mail-Adresse ' + m);
}

if (problems.length) {
  console.error('Gefunden (' + problems.length + '):\n  ' + problems.join('\n  '));
  process.exit(1);
}
console.log('Nichts Verdächtiges in ' + files.length + ' Dateien (keine Tokens, E-Mail-Adressen oder Fotos).');
