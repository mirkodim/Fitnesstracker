import { test, expect, openApp, stored, tab, waitControlled } from './fixtures.mjs';

test('Offline: nach einmaligem Laden startet die App ohne Netz, alles funktioniert, die Daten bleiben', async ({ page, context, site, diag }) => {
  await openApp(page, site, { now: null });
  await expect(page.locator('#upd')).toBeHidden();                 // beim allerersten Besuch gibt es keine Update-Leiste
  await waitControlled(page);
  await expect(page.locator('#ver-note')).toHaveText(' · läuft auch ohne Internet');

  // alles aus der Precache-Liste liegt im Cache
  const cache = await page.evaluate(async () => {
    const keys = await caches.keys(), c = await caches.open(keys[0]);
    return { keys, urls: (await c.keys()).map((r) => new URL(r.url).pathname.replace('/Fitnesstracker/', '')) };
  });
  expect(cache.keys).toEqual(['strichliste-e2e-1']);
  const sw = await (await page.request.get(site.url + 'sw.js')).text();
  const precache = [...sw.match(/var PRECACHE = \[([\s\S]*?)\];/)[1].matchAll(/'([^']+)'/g)].map((m) => m[1]);
  for (const e of precache) expect(cache.urls, e).toContain(e === './' ? '' : e);

  // Netz weg, neu laden
  const requestsBefore = diag.requests.length;
  await context.setOffline(true);
  await page.reload();
  await expect(page.locator('nav.nav')).toBeVisible();
  await expect(page.locator('h2.name')).toHaveText('Box-Kniebeugen');
  expect(await page.evaluate(() => !!navigator.serviceWorker.controller)).toBe(true);
  // die Schriften kommen aus dem Cache
  const fontsOk = await page.evaluate(async () => {
    await document.fonts.load('600 20px "Barlow Condensed"'); await document.fonts.load('400 20px "Barlow"');
    return document.fonts.check('600 20px "Barlow Condensed"') && document.fonts.check('400 20px "Barlow"');
  });
  expect(fontsOk).toBe(true);

  // Training abhaken, Gewicht, Essen eintragen, Kalender nutzen: alles ohne Netz
  await page.getByLabel('Gewicht (kg)').fill('42,5');
  await page.getByRole('button', { name: 'Satz 1 geschafft' }).click();
  await page.getByRole('button', { name: 'Weiter', exact: true }).click();
  await tab(page, 'Essen').click();
  await page.locator('#f-name').fill('Magerquark');
  await page.locator('#f-g').fill('250');
  await page.locator('#f-kcal').fill('67');
  await page.locator('#f-p').fill('12');
  await page.getByRole('button', { name: 'Hinzufügen' }).click();
  await expect(page.locator('.fe .nchip').first()).toHaveText('168 kcal');
  await tab(page, 'Kalender').click();
  await page.getByRole('button', { name: 'Vorheriger Monat' }).click();
  await page.getByRole('button', { name: 'Nächster Monat' }).click();
  await page.getByRole('button', { name: /Tag A eintragen/ }).click();
  await expect(page.locator('.entry-head[data-day="A"]')).toContainText('ohne Details');
  // auch die Adresse mit Suchteil (wie von manchen Startern angehängt) liefert die App
  await page.goto(site.url + 'index.html?von=startbildschirm');
  await expect(page.locator('nav.nav')).toBeVisible();
  // in der ganzen Zeit ging keine Anfrage ins Netz hinaus
  const network = diag.requests.slice(requestsBefore).filter((u) => !u.endsWith('/Fitnesstracker/') && !u.includes('/Fitnesstracker/'));
  expect(network).toEqual([]);

  // wieder online: die Daten sind noch da
  await context.setOffline(false);
  await page.goto(site.url);
  const s = await stored(page);
  expect(s.weights['a-box']).toBe('42,5');
  expect(s.sets.A['a-box']).toBe(1);
  expect(s.food[Object.keys(s.food)[0]][0].name).toBe('Magerquark');
  expect(Object.values(s.log).flat().map((e) => e.day)).toContain('A');
  await expect(page.locator('header.top')).toContainText('1 von 15 Sätzen');
  diag.allowFailed = true;                     // beim Umschalten kann eine laufende Anfrage abgebrochen werden
});

test('Offline-Start ohne vorherigen Besuch geht nicht kaputt: ohne Dienst-Cache gibt es nur die Browser-Fehlerseite', async ({ browser, site }) => {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await ctx.setOffline(true);
  await expect(page.goto(site.url)).rejects.toThrow(/ERR_INTERNET_DISCONNECTED/);
  await ctx.close();
});
