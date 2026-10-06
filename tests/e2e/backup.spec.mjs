import { test, expect, openApp, stored, tab, TODAY, ROOT, KEY } from './fixtures.mjs';
import { readFileSync } from 'node:fs';
import path from 'node:path';

const OLD_TEXT = readFileSync(path.join(ROOT, 'tests', 'fixtures', 'altformat.json'), 'utf8');
const OLD = JSON.parse(OLD_TEXT);
const OLD_DAY = '2026-05-12T10:00:00';          // the day the old export was made on, so its half-done Tag B still counts as "today"

const openBackup = async (page) => {
  await page.getByRole('button', { name: 'Daten sichern oder wiederherstellen' }).click();
  await expect(page.locator('#bk-text')).toBeVisible();
};
const restoreFromText = async (page, text) => {
  await page.locator('#bk-text').fill(text);
  await page.getByRole('button', { name: 'Wiederherstellen', exact: true }).click();
};

test('Altformat aus der claude.ai-Version: einfügen, wiederherstellen, alles ist da und im neuen Format', async ({ page, site }) => {
  await openApp(page, site, { now: OLD_DAY });
  await openBackup(page);
  await restoreFromText(page, OLD_TEXT);
  await expect(page.locator('#bk-msg')).toHaveText('Wiederhergestellt: 5 Trainings und 4 Essenseinträge.');

  const s = await stored(page);
  expect(s.schema).toBe(3);
  expect(s.cur).toBe('B');
  expect(s.holdSecs['a-plank']).toBe(60);
  expect(s.plankSecs).toBeUndefined();
  expect(s.goalP).toBe(100);
  expect(s.weightKg).toBe(65);
  expect(s.weights).toEqual({ 'a-box': '40', 'b-rdl': '50', 'b-curl': '8' });
  expect(s.log['2026-05-09']).toMatchObject([{ day: 'A', sets: {}, weights: {}, note: '' }, { day: 'B', sets: {}, weights: {}, note: '' }]);
  expect(s.food['2026-05-12'].map((e) => e.name)).toEqual(['Magerquark', 'Haferflocken', 'Proteinriegel']);
  expect(s.recent.map((e) => e.name)).toEqual(['Magerquark', 'Haferflocken']);

  // Training: der angefangene Tag B ist noch da (heute = Tag der Sicherung)
  await expect(page.locator('header.top')).toContainText('Tag B');
  await expect(page.locator('header.top')).toContainText('4 von 15 Sätzen');
  await expect(page.locator('h2.name')).toHaveText('TRX-Rudern');
  await page.locator('.list').getByRole('button', { name: /Bizeps-Curls/ }).click();
  await expect(page.getByLabel('Gewicht (kg)')).toHaveValue('8');

  // Kalender: Mai 2026 mit den Markierungen
  await tab(page, 'Kalender').click();
  await expect(page.locator('h2.mt')).toHaveText('Mai 2026');
  await expect(page.locator('.top .prog')).toContainText('5 Trainings in diesem Monat');
  await expect(page.locator('button.cd[data-key="2026-05-09"] .tg')).toHaveText(['A', 'B']);
  await expect(page.locator('button.cd[data-key="2026-05-05"] .tg')).toHaveText(['A']);
  await page.locator('button.cd[data-key="2026-05-09"]').click();
  await expect(page.locator('.entry-head')).toHaveCount(2);
  await expect(page.locator('.entry-head').first()).toContainText('ohne Details');

  // Essen: 250 g Magerquark ergeben 168 kcal und 30 g Protein, Tagesbilanz und Ziel
  await tab(page, 'Essen').click();
  await expect(page.locator('.fe')).toHaveCount(3);
  await expect(page.locator('.fe', { hasText: 'Magerquark' }).locator('.nchip')).toHaveText(['168 kcal', '30 g Protein']);
  await expect(page.locator('.prot-num')).toContainText('58,1');
  await expect(page.locator('.prot-num')).toContainText('von 100 g');
  await expect(page.locator('.fe', { hasText: 'Proteinriegel' }).locator('.fe-src')).toHaveText('Eingegeben für die ganze Menge.');
  await page.getByRole('button', { name: 'Vorheriger Tag' }).click();
  await expect(page.locator('.fe')).toHaveCount(1);
  await expect(page.locator('.fe')).toContainText('Ohne Namen');
});

test('Altformat an einem späteren Tag: die Kalender- und Essensdaten bleiben, die Haken von gestern nicht', async ({ page, site }) => {
  await openApp(page, site);                       // heute = 5. Oktober 2026
  await openBackup(page);
  await restoreFromText(page, OLD_TEXT);
  await expect(page.locator('#bk-msg')).toContainText('Wiederhergestellt');
  const s = await stored(page);
  expect(Object.values(s.sets).every((m) => Object.keys(m).length === 0)).toBe(true);
  expect(Object.keys(s.log)).toHaveLength(4);
  await expect(page.locator('h2.mt')).toHaveText('Meine Trainings');
  await expect(page.locator('.card.go')).toHaveCount(0);                                                  // nichts Angefangenes von gestern
});

test('Roundtrip: Als Datei sichern, App leeren, aus Datei wiederherstellen', async ({ page, site, context }) => {
  const rich = {
    ...OLD, schema: 2, day: 'A',
    log: { ...Object.fromEntries(Object.entries(OLD.log).map(([k, v]) => [k, v.map((d) => ({ day: d, sets: {}, weights: {}, note: '' }))])),
      [TODAY]: [{ day: 'A', sets: { 'a-box': 3, 'a-hip': 2 }, weights: { 'a-hip': '60' }, note: 'Läuft gut „ä ö ü ß“' }] },
    sets: { A: { 'a-box': 1 }, B: {} }, stamp: { A: TODAY, B: '' }
  };
  await openApp(page, site);
  await page.evaluate(([k, v]) => localStorage.setItem(k, v), [KEY, JSON.stringify(rich)]);      // einmal befüllen, nicht bei jedem Laden
  await page.reload();
  await expect(page.locator('header.top')).toContainText('1 von 15 Sätzen');
  await openBackup(page);
  const [download] = await Promise.all([page.waitForEvent('download'), page.getByRole('button', { name: 'Als Datei sichern' }).click()]);
  expect(download.suggestedFilename()).toBe('strichliste-' + TODAY + '.json');
  const file = path.join(ROOT, 'tests', 'out', 'sicherung.json');
  await download.saveAs(file);
  const exported = JSON.parse(readFileSync(file, 'utf8'));
  expect(exported.schema).toBe(3);
  expect(exported.log[TODAY][0].note).toBe('Läuft gut „ä ö ü ß“');
  expect(exported.food['2026-05-12']).toHaveLength(3);
  await expect(page.locator('#bk-msg')).toContainText('Datei gespeichert');

  // "Daten kopieren" liefert dasselbe wie die Datei
  await context.grantPermissions(['clipboard-read', 'clipboard-write']);
  await page.getByRole('button', { name: 'Daten kopieren' }).click();
  await expect(page.locator('#bk-msg')).toContainText('Kopiert');
  expect(JSON.parse(await page.evaluate(() => navigator.clipboard.readText()))).toEqual(exported);

  // App leeren und aus der Datei zurückholen
  await page.evaluate(() => localStorage.clear());
  await page.goto(site.url);
  await expect(page.locator('h2.mt')).toHaveText('Meine Trainings');
  expect(await stored(page)).toBeNull();
  await openBackup(page);
  await page.locator('#bk-upload').setInputFiles(file);
  await expect(page.locator('#bk-msg')).toContainText('Wiederhergestellt: 6 Trainings und 4 Essenseinträge.');
  expect(await stored(page)).toEqual(exported);
  await expect(page.locator('header.top')).toContainText('1 von 15 Sätzen');
});

test('Ersetzen nur nach Rückfrage; die alten Daten werden vorher beiseitegelegt', async ({ page, site }) => {
  const mine = { schema: 2, log: { [TODAY]: [{ day: 'A', sets: { 'a-box': 3 }, weights: {}, note: 'meins' }] }, food: { [TODAY]: [{ id: 'm1', name: 'Apfel', g: 100, mode: '100', v: { kcal: 52 } }] } };
  await openApp(page, site, { state: mine });
  await openBackup(page);
  await restoreFromText(page, OLD_TEXT);
  await expect(page.locator('.confirm')).toContainText('Das ersetzt deine aktuellen Daten (1 Training und 1 Essenseintrag) durch die gesicherten (5 Trainings und 4 Essenseinträge). Fortfahren?');
  expect((await stored(page)).log[TODAY][0].note).toBe('meins');
  await page.getByRole('button', { name: 'Abbrechen' }).click();
  await expect(page.locator('#bk-msg')).toHaveText('Nichts geändert.');
  expect((await stored(page)).log[TODAY][0].note).toBe('meins');
  await restoreFromText(page, OLD_TEXT);
  await page.getByRole('button', { name: 'Ersetzen' }).click();
  await expect(page.locator('#bk-msg')).toContainText('Wiederhergestellt: 5 Trainings');
  const s = await stored(page);
  expect(s.log[TODAY]).toBeUndefined();
  const before = await page.evaluate((k) => JSON.parse(localStorage.getItem(k + '.before-restore')), KEY);
  expect(before.log[TODAY][0].note).toBe('meins');
  expect(before.food[TODAY][0].name).toBe('Apfel');
});

test('Unbrauchbare Eingaben ändern nichts und lassen den Text im Feld stehen', async ({ page, site }) => {
  const mine = { schema: 2, log: { [TODAY]: [{ day: 'B', sets: {}, weights: {}, note: 'bleibt' }] } };
  await openApp(page, site, { state: mine });
  await openBackup(page);
  await page.getByRole('button', { name: 'Wiederherstellen', exact: true }).click();
  await expect(page.locator('#bk-msg')).toHaveText('Füge zuerst den kopierten Text ein.');
  for (const bad of ['hallo', '{"foo": 1}', '{ "log": ', '[1, 2, 3]']) {
    await restoreFromText(page, bad);
    await expect(page.locator('#bk-msg')).toHaveText('Das hat nicht geklappt. Füge den kompletten kopierten Text ein.');
    await expect(page.locator('#bk-text')).toHaveValue(bad);
  }
  expect((await stored(page)).log[TODAY][0].note).toBe('bleibt');
  // eine kaputte Datei ebenso
  const bad = path.join(ROOT, 'tests', 'out', 'kaputt.json');
  (await import('node:fs')).writeFileSync(bad, '{"log": {"2026-05-01": [');
  await page.locator('#bk-upload').setInputFiles(bad);
  await expect(page.locator('#bk-msg')).toHaveText('Das hat nicht geklappt. Füge den kompletten kopierten Text ein.');
  expect((await stored(page)).log[TODAY][0].note).toBe('bleibt');
});

test('Wiederherstellen bereinigt: Müll in der Sicherung gelangt nicht in die App', async ({ page, site }) => {
  await openApp(page, site);
  await openBackup(page);
  const evil = JSON.stringify({
    log: { '2026-05-01': ['A', 'X', { day: 'B', sets: { 'b-row': 99, '<img src=x onerror=alert(1)>': 2 }, note: '<b>fett</b>' }], 'kein-datum': ['A'] },
    food: { '2026-05-01': [{ id: '"><script>1</script>', name: '<img src=x onerror=alert(2)>', g: -5, v: { kcal: 'viel' } }] },
    plankSecs: 99, goalP: -3
  });
  await restoreFromText(page, evil);
  await expect(page.locator('#bk-msg')).toContainText('Wiederhergestellt: 2 Trainings und 1 Essenseintrag.');
  const s = await stored(page);
  expect(s.log['2026-05-01'].map((e) => e.day)).toEqual(['A', 'B']);
  expect(s.log['2026-05-01'][1].sets).toEqual({ 'b-row': 99 });
  expect(s.log['kein-datum']).toBeUndefined();
  expect(s.holdSecs['a-plank']).toBeUndefined();
  expect(s.plankSecs).toBeUndefined();
  expect(s.goalP).toBeNull();
  // nichts davon wird als HTML ausgeführt
  await page.getByRole('button', { name: 'Kalender' }).click();
  await page.getByRole('button', { name: 'Vorheriger Monat' }).click();
  await page.getByRole('button', { name: 'Vorheriger Monat' }).click();
  await page.getByRole('button', { name: 'Vorheriger Monat' }).click();
  await page.getByRole('button', { name: 'Vorheriger Monat' }).click();
  await page.getByRole('button', { name: 'Vorheriger Monat' }).click();
  await expect(page.locator('h2.mt')).toHaveText('Mai 2026');
  await page.locator('button.cd[data-key="2026-05-01"]').click();
  await page.locator('.entry-head[data-day="B"]').click();
  await expect(page.locator('#e-note')).toHaveValue('<b>fett</b>');
  await expect(page.locator('.entry-body b')).toHaveCount(0);
  await tab(page, 'Essen').click();
  for (let i = 0; i < 157; i++) await page.getByRole('button', { name: 'Vorheriger Tag' }).click();
  await expect(page.locator('.fe-name b')).toHaveText('<img src=x onerror=alert(2)>');
  await expect(page.locator('.fe img')).toHaveCount(0);
});
