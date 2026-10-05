import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { build } from '../../tools/build.mjs';

/* One fresh build of the site for the whole run, stamped with a recognisable version. */
export default async function globalSetup() {
  const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
  await build({ version: 'e2e-1', out: path.join(root, 'tests', 'out', 'site') });
}
