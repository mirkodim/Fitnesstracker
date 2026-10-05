import { test, expect, openApp, stored, tab, waitControlled, ROOT } from './fixtures.mjs';
import { startServer } from '../../tools/serve.mjs';
import { build, FILES, DIRS } from '../../tools/build.mjs';
import { cp, mkdtemp, readFile, rm, writeFile } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';

/* Two real deployments of the app, served one after the other from the same address, the way GitHub Pages replaces a site:
   v1 is the app as it is, v2 differs in a visible text and (of course) in its version. Both are served with max-age=600 like GitHub Pages. */
let tmp, v1, v2, v3;
test.beforeAll(async () => {
  tmp = await mkdtemp(path.join(os.tmpdir(), 'strichliste-update-'));
  v1 = path.join(tmp, 'v1'); v2 = path.join(tmp, 'v2'); v3 = path.join(tmp, 'v3');
  await build({ version: 'upd-1', out: v1 });
  const src = path.join(tmp, 'src2');
  for (const f of FILES) await cp(path.join(ROOT, f), path.join(src, f));
  for (const d of DIRS) await cp(path.join(ROOT, d), path.join(src, d), { recursive: true });
  const plan = (await readFile(path.join(src, 'plan.js'), 'utf8')).replace("name: 'Box-Kniebeugen'", "name: 'Box-Kniebeugen NEU'");
  expect(plan).toContain('Box-Kniebeugen NEU');
  await writeFile(path.join(src, 'plan.js'), plan);
  await build({ version: 'upd-2', out: v2, from: src });
  await build({ version: 'upd-3', out: v3, from: src });
  await rm(path.join(v3, 'fig.js'));                      // a broken deployment: a file of the precache list is missing
});
test.afterAll(async () => { await rm(tmp, { recursive: true, force: true }); });

const swUpdate = (page) => page.evaluate(() => navigator.serviceWorker.getRegistration().then((r) => r.update()));
const cacheKeys = (page) => page.evaluate(() => caches.keys());
const bar = (page) => page.locator('#upd');

async function start(page, server) {
  await page.goto(server.url);
  await expect(page.locator('nav.nav')).toBeVisible();
  await waitControlled(page);
}

test('Update: Leiste erscheint ruhig, nichts lädt von selbst neu, nach Tipp ist die neue Version aktiv, die Daten bleiben', async ({ page, site, diag }) => {
  const server = await startServer({ root: v1, base: '/Fitnesstracker/' });
  diag.own.push(server.origin);
  try {
    await start(page, server);
    await expect(page.locator('.foot .ver')).toContainText('Version upd-1');
    await expect(page.locator('h2.name')).toHaveText('Box-Kniebeugen');
    await expect(bar(page)).toBeHidden();
    expect(await cacheKeys(page)).toEqual(['strichliste-upd-1']);

    // Daten anlegen: ein Satz, ein Gewicht, ein Essen, ein Kalendereintrag
    await page.getByLabel('Gewicht (kg)').fill('42');
    await page.getByRole('button', { name: 'Satz 1 geschafft' }).click();
    await page.getByRole('button', { name: 'Weiter', exact: true }).click();
    await tab(page, 'Essen').click();
    await page.locator('#f-name').fill('Magerquark'); await page.locator('#f-g').fill('250'); await page.locator('#f-kcal').fill('67'); await page.locator('#f-p').fill('12');
    await page.getByRole('button', { name: 'Hinzufügen' }).click();
    await tab(page, 'Kalender').click();
    await page.getByRole('button', { name: /Tag B eintragen/ }).click();
    await tab(page, 'Training').click();
    const before = await stored(page);
    await page.evaluate(() => { window.__marker = 'noch-da'; });

    // v2 wird veröffentlicht, die App sucht danach (wie beim Zurückkehren in den Vordergrund)
    server.setRoot(v2);
    await swUpdate(page);
    await expect(bar(page)).toBeVisible();
    await expect(bar(page)).toContainText('Neue Version bereit.');
    await expect(bar(page).getByRole('button', { name: 'Neu laden' })).toBeVisible();
    // die Leiste sitzt über der unteren Navigation und verdeckt nichts
    const b = await page.locator('#upd .upd-in').boundingBox(), n = await page.locator('nav.nav').boundingBox();
    expect(b.y + b.height).toBeLessThanOrEqual(n.y + 0.5);
    expect(b.height).toBeLessThan(90);

    // der Cache der neuen Version ist bereit und enthält wirklich die neuen Dateien (nicht aus dem HTTP-Cache der alten)
    expect((await cacheKeys(page)).sort()).toEqual(['strichliste-upd-1', 'strichliste-upd-2']);
    const newPlan = await page.evaluate(async () => (await (await caches.open('strichliste-upd-2')).match('plan.js')).text());
    expect(newPlan).toContain('Box-Kniebeugen NEU');
    expect(await page.evaluate(async () => (await (await caches.open('strichliste-upd-1')).match('plan.js')).text())).not.toContain('NEU');

    // nichts lädt von selbst neu: weiter benutzen, warten, die alte Version bleibt aktiv
    await page.waitForTimeout(2500);
    expect(await page.evaluate(() => window.__marker)).toBe('noch-da');
    await expect(page.locator('.foot .ver')).toContainText('Version upd-1');
    await expect(page.locator('h2.name')).toHaveText('Box-Kniebeugen');
    await page.getByRole('button', { name: 'Satz 2 geschafft' }).click();
    await page.getByRole('button', { name: 'Weiter', exact: true }).click();
    await expect(bar(page)).toBeVisible();

    // Tipp auf "Neu laden": die Seite lädt neu und läuft mit v2
    await Promise.all([page.waitForEvent('load'), bar(page).getByRole('button', { name: 'Neu laden' }).click()]);
    await expect(page.locator('nav.nav')).toBeVisible();
    await expect(page.locator('.foot .ver')).toContainText('Version upd-2');
    await expect(page.locator('h2.name')).toHaveText('Box-Kniebeugen NEU');
    await expect(bar(page)).toBeHidden();
    expect(await page.evaluate(() => window.__marker)).toBeUndefined();
    await waitControlled(page);
    expect(await cacheKeys(page)).toEqual(['strichliste-upd-2']);        // der alte Cache wurde beim Aktivieren gelöscht

    // alle Daten sind erhalten (inklusive des Satzes, den wir nach der Meldung noch abgehakt haben)
    const after = await stored(page);
    expect(after.sets.A['a-box']).toBe(2);
    expect({ ...after, sets: before.sets, stamp: before.stamp }).toEqual({ ...before, schema: 2 });
    expect(after.weights['a-box']).toBe('42');
    await expect(page.locator('header.top')).toContainText('2 von 15 Sätzen');
    await tab(page, 'Essen').click();
    await expect(page.locator('.fe .nchip').first()).toHaveText('168 kcal');
    await tab(page, 'Kalender').click();
    await expect(page.locator('.entry-head[data-day="B"]')).toBeVisible();
    expect(diag.errors).toEqual([]);
  } finally { await server.close(); }
});

test('Update: während Plank und Pause bleibt die Leiste weg, danach erscheint sie', async ({ page, diag }) => {
  const server = await startServer({ root: v1, base: '/Fitnesstracker/' });
  diag.own.push(server.origin);
  try {
    await start(page, server);
    server.setRoot(v2);
    await swUpdate(page);
    await expect(bar(page)).toBeVisible();
    // Pause: Leiste weg, mit "Weiter" wieder da
    await page.getByRole('button', { name: 'Satz 1 geschafft' }).click();
    await expect(page.locator('.card.rest')).toBeVisible();
    await expect(bar(page)).toBeHidden();
    await page.getByRole('button', { name: 'Weiter', exact: true }).click();
    await expect(bar(page)).toBeVisible();
    // Plank: Leiste weg, nach Abbrechen wieder da
    await page.locator('.list').getByRole('button', { name: /Plank/ }).click();
    await page.getByRole('button', { name: 'Plank starten' }).click();
    await expect(page.locator('.ring')).toBeVisible();
    await expect(bar(page)).toBeHidden();
    await page.getByRole('button', { name: 'Abbrechen' }).click();
    await expect(bar(page)).toBeVisible();
    // und die Seite wurde in der ganzen Zeit nicht neu geladen
    await expect(page.locator('.foot .ver')).toContainText('Version upd-1');
  } finally { await server.close(); }
});

test('Update: nach Schließen und Wiederöffnen der App ist die neue Version von selbst aktiv', async ({ browser, diag }) => {
  const server = await startServer({ root: v1, base: '/Fitnesstracker/' });
  const ctx = await browser.newContext();
  try {
    let page = await ctx.newPage();
    await start(page, server);
    server.setRoot(v2);
    await swUpdate(page);
    await expect(page.locator('#upd')).toBeVisible();
    await page.close();                                            // App schließen
    page = await ctx.newPage();                                     // App neu öffnen
    await expect.poll(async () => {
      await page.goto(server.url);
      return page.locator('.foot .ver').innerText();
    }, { timeout: 15_000 }).toContain('Version upd-2');
    await expect(page.locator('#upd')).toBeHidden();
  } finally { await ctx.close(); await server.close(); }
});

test('Update: eine kaputte Veröffentlichung (Datei fehlt) wird nicht angeboten, die laufende Version bleibt', async ({ page, diag }) => {
  const server = await startServer({ root: v1, base: '/Fitnesstracker/' });
  diag.own.push(server.origin);
  try {
    await start(page, server);
    server.setRoot(v3);
    await swUpdate(page).catch(() => {});
    await page.waitForTimeout(1500);
    await expect(bar(page)).toBeHidden();
    const reg = await page.evaluate(async () => { const r = await navigator.serviceWorker.getRegistration(); return { waiting: !!r.waiting, installing: !!r.installing, active: r.active.scriptURL.endsWith('sw.js') }; });
    expect(reg).toEqual({ waiting: false, installing: false, active: true });
    expect(await cacheKeys(page)).toEqual(['strichliste-upd-1']);   // der halbfertige Cache wurde nicht behalten
    await expect(page.locator('h2.name')).toHaveText('Box-Kniebeugen');
    await page.getByRole('button', { name: 'Satz 1 geschafft' }).click();
    await expect(page.locator('.card.rest')).toBeVisible();
    await page.getByRole('button', { name: 'Weiter', exact: true }).click();         // Pause beenden: sonst bleibt die Leiste absichtlich weg
    // gleiche Prüfung noch einmal, wenn die Veröffentlichung repariert ist: jetzt wird das Update angeboten
    server.setRoot(v2);
    await swUpdate(page);
    await expect(bar(page)).toBeVisible();
    diag.errors.length = 0;                                         // der fehlgeschlagene Installationsversuch darf Fehler melden
    diag.failed.length = 0;
  } finally { await server.close(); }
});
