import { test, expect, openApp, tab, startFromList } from './fixtures.mjs';

test('startet ohne Konsolenfehler, ohne fremde Hosts, mit eigenen Schriften', async ({ page, site, diag }, info) => {
  await openApp(page, site);
  await expect(page.getByRole('heading', { level: 1, name: 'Trainings-Strichliste' })).toBeAttached();
  await expect(page).toHaveTitle('Trainings-Strichliste');
  await expect(page.locator('h2.mt')).toHaveText('Meine Trainings');                      // der erste Reiter
  await expect(tab(page, 'Meine Trainings')).toHaveAttribute('aria-current', 'page');
  for (const t of ['Meine Trainings', 'Erstellen', 'Kalender', 'Essen']) await expect(tab(page, t)).toBeVisible();
  await expect(page.locator('nav.nav button')).toHaveCount(4);

  // alle sechs Schriftschnitte stammen von der eigenen Adresse und sind geladen
  await page.evaluate(() => document.fonts.ready);
  const fonts = await page.evaluate(async () => {
    const out = [];
    for (const [fam, w] of [['Barlow', 400], ['Barlow', 500], ['Barlow', 600], ['Barlow Condensed', 500], ['Barlow Condensed', 600], ['Barlow Condensed', 700]]) {
      await document.fonts.load(w + ' 20px "' + fam + '"');
      out.push(fam + ' ' + w + ': ' + document.fonts.check(w + ' 20px "' + fam + '"'));
    }
    return out;
  });
  expect(fonts.every((x) => x.endsWith('true')), fonts.join('; ')).toBe(true);
  const fontFiles = diag.requests.filter((u) => u.endsWith('.woff2'));
  expect(fontFiles.length).toBeGreaterThanOrEqual(5);
  expect(diag.requests.some((u) => /google|gstatic|jsdelivr|unpkg|cdnjs/.test(u))).toBe(false);

  // Farbschema folgt dem System
  const bg = await page.evaluate(() => getComputedStyle(document.body).backgroundColor);
  expect(bg).toBe(info.project.use.colorScheme === 'dark' ? 'rgb(13, 26, 29)' : 'rgb(236, 240, 241)');
  const w = await page.evaluate(() => [window.innerWidth, document.documentElement.scrollWidth]);
  expect(w[1]).toBeLessThanOrEqual(w[0]);
});

test('Version steht im Fussbereich und stimmt mit dem Build überein', async ({ page, site }) => {
  await openApp(page, site);
  await expect(page.locator('.foot .ver')).toContainText('Version e2e-1');
  expect(await page.evaluate(() => APP_VERSION)).toBe('e2e-1');
});

test('Alle vier Reiter lassen sich öffnen', async ({ page, site }) => {
  await openApp(page, site);
  await tab(page, 'Erstellen').click();
  await expect(page.locator('h2.mt')).toHaveText('Neues Training');
  await expect(page.getByRole('heading', { name: 'Was möchtest du heute trainieren?' })).toBeVisible();
  await page.getByRole('button', { name: 'Übungen', exact: true }).click();
  await expect(page.locator('h2.mt')).toHaveText('Übungen');
  await expect(page.locator('#lib-q')).toBeVisible();
  await tab(page, 'Kalender').click();
  await expect(page.locator('h2.mt')).toHaveText('Oktober 2026');
  await tab(page, 'Essen').click();
  await expect(page.locator('h2.mt')).toHaveText('Heute');
  await expect(page.getByRole('button', { name: 'Hinzufügen' })).toBeVisible();
  await tab(page, 'Meine Trainings').click();
  await expect(page.locator('h2.mt')).toHaveText('Meine Trainings');
  await expect(page.locator('.mrow')).toHaveCount(2);
});

test('Speicher nicht verfügbar: ruhiger Hinweis, die App läuft trotzdem', async ({ page, site }) => {
  await page.addInitScript(() => {
    const deny = () => { throw new DOMException('denied', 'SecurityError'); };
    Storage.prototype.setItem = deny; Storage.prototype.getItem = deny; Storage.prototype.removeItem = deny;
  });
  await openApp(page, site);
  await startFromList(page, 'A');
  await expect(page.locator('.foot')).toContainText('Gerade kann nichts gespeichert werden');
  await page.getByRole('button', { name: 'Satz 1 geschafft' }).click();
  await expect(page.locator('.card.rest')).toBeVisible();
  await page.getByRole('button', { name: 'Weiter' }).click();
  await expect(page.getByRole('button', { name: 'Satz 2 geschafft' })).toBeVisible();
});
