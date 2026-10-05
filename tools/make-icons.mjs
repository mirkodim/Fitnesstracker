/* Renders the PNG icons from the two SVG sources in tools/icons/.
   any.svg       rounded square, used for the "any" icons and as favicon
   maskable.svg  full-bleed square, symbol inside the safe zone (80 % circle), used for maskable and apple-touch-icon
   Run: npm run icons */
import sharp from 'sharp';
import { readFile, mkdir, copyFile } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = (f) => path.join(root, 'tools', 'icons', f);
const out = (f) => path.join(root, 'icons', f);

const anySvg = await readFile(src('any.svg'));
const maskableSvg = await readFile(src('maskable.svg'));
await mkdir(path.join(root, 'icons'), { recursive: true });

async function render(svg, size, file) {
  await sharp(svg, { density: 72 * Math.max(1, size / 512) * 2 })
    .resize(size, size, { fit: 'fill' })
    .png({ compressionLevel: 9 })
    .toFile(out(file));
  console.log('icons/' + file + '  ' + size + 'x' + size);
}

await render(anySvg, 192, 'icon-192.png');
await render(anySvg, 512, 'icon-512.png');
await render(maskableSvg, 512, 'maskable-512.png');
await render(maskableSvg, 180, 'apple-touch-icon.png');
await copyFile(src('any.svg'), out('favicon.svg'));
console.log('icons/favicon.svg');
