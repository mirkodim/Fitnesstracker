import { test, expect, openApp, tab, startFromList, TODAY, ROOT } from './fixtures.mjs';
import path from 'node:path';
import { mkdir } from 'node:fs/promises';

const SHOTS = path.join(ROOT, 'tests', 'out', 'shots');

/* Nothing may stick out sideways, and every control must be at least 48 px to tap (the month grid's day cells are 48 px tall,
   but seven columns cannot be 48 px wide on a phone, so only their height counts). */
async function check(page, label, info) {
  /* The declared width counts, not window.innerWidth: a phone-sized browser widens its window to fit overly wide content. */
  const r = await page.evaluate((vw) => {
    const out = [], small = [];
    const sel = 'button, input:not(.sr), textarea, select, label.filebtn, a[href], summary';
    for (const el of document.querySelectorAll('body *')) {
      const cs = getComputedStyle(el);
      if (cs.display === 'none' || cs.visibility === 'hidden' || el.closest('[hidden]')) continue;
      const b = el.getBoundingClientRect();
      if (!b.width || !b.height) continue;
      if (el.classList.contains('sr')) continue;
      if (b.right > vw + 0.5 || b.left < -0.5) out.push((el.className && String(el.className).slice(0, 40)) + '<' + el.tagName.toLowerCase() + '> ' + Math.round(b.left) + '..' + Math.round(b.right));
    }
    for (const el of document.querySelectorAll(sel)) {
      const b = el.getBoundingClientRect(), cs = getComputedStyle(el);
      if (!b.width || !b.height || cs.display === 'none' || el.closest('[hidden]')) continue;
      const calCell = el.classList.contains('cd');
      if (b.height < 47.5 || (!calCell && b.width < 47.5)) small.push((el.textContent || el.getAttribute('aria-label') || el.id || el.tagName).trim().slice(0, 30) + ' ' + Math.round(b.width) + 'x' + Math.round(b.height));
    }
    return { vw, scrollW: document.documentElement.scrollWidth, bodyW: document.body.scrollWidth, out, small };
  }, page.viewportSize().width);
  expect(r.scrollW, label + ': Seite scrollt seitwärts').toBeLessThanOrEqual(r.vw);
  expect(r.bodyW, label + ': Inhalt breiter als Bildschirm').toBeLessThanOrEqual(r.vw);
  expect(r.out, label + ': ragt seitlich heraus').toEqual([]);
  expect(r.small, label + ': Tippziele unter 48 px').toEqual([]);
  await mkdir(SHOTS, { recursive: true });
  await page.screenshot({ path: path.join(SHOTS, info.project.name + '-' + label.replace(/[^a-z0-9]+/gi, '-').toLowerCase() + '.png') });
}

const food = (id, name, g, v, mode = '100') => ({ id, name, g, mode, v });
const seed = () => ({
  schema: 3,
  prefs: { equip: ['kh', 'bank'], preset: '', level: 2, minutes: 45 },
  trainings: [{ id: 'u1', name: 'Mein Beintag mit einem sehr langen Namen zum Testen des Umbruchs', items: [{ ex: 'x-squat' }, { ex: 'x-bridge' }, { ex: 'x-crunch' }, { ex: 'x-goblet' }] }],
  log: {
    [TODAY]: [{ day: 'A', sets: { 'a-box': 3, 'a-hip': 3, 'a-push': 2 }, weights: { 'a-hip': '60' }, note: 'Knie war gut' }, { day: 'B', sets: {}, weights: {}, note: '' }],
    '2026-10-02': [{ day: 'B', sets: { 'b-rdl': 3 }, weights: {}, note: '' }]
  },
  food: { [TODAY]: [food('f1', 'Magerquark mit Beeren und einem sehr langen Namen zum Testen des Umbruchs', 250, { kcal: 67, p: 12, f: 0.2, c: 4, s: 4, b: 1 }), food('f2', 'Riegel', null, { kcal: 210, p: 20 }, 'por'), food('f3', 'Milch', 200, { kcal: 64, p: 3.4 }, 'ml')] },
  recent: [food('f1', 'Magerquark', 250, { kcal: 67, p: 12 }), food('f3', 'Haferflocken', 60, { kcal: 372 })],
  goalP: 100, weightKg: 62
});
const tile = (page, g) => page.locator('.gt[data-g="' + g + '"]');
const weiter = (page) => page.getByRole('button', { name: 'Weiter', exact: true });

test('Start, Frage und Assistent: jeder Schritt passt auf den Bildschirm', async ({ page, site }, info) => {
  await openApp(page, site, { state: seed() });
  await check(page, 'start', info);
  for (const g of ['beine', 'gesaess', 'arme', 'ruecken', 'bauch', 'brust', 'schultern', 'nacken', 'ganz']) await tile(page, g).click();
  await check(page, 'start alles gewaehlt', info);
  for (const g of ['gesaess', 'arme', 'ruecken', 'bauch', 'brust', 'schultern', 'nacken', 'ganz']) await tile(page, g).click();
  await weiter(page).click();
  await check(page, 'auswahl neu oder bestehend', info);
  await page.getByRole('button', { name: /Neues Training erstellen/ }).click();
  await check(page, 'ausruestung', info);
  await page.locator('.pre[data-p="gym"]').click();
  await check(page, 'ausruestung studio', info);
  await weiter(page).click();
  await check(page, 'zeit', info);
  await page.locator('[data-m="60"]').click();
  await check(page, 'erfahrung', info);
  await page.locator('[data-l="3"]').click();
  await check(page, 'vorschlag', info);
  await page.locator('.brow').first().locator('.brow-head').click();
  await check(page, 'vorschlag zeile offen', info);
  await page.locator('.brow').first().getByRole('button', { name: 'Tauschen' }).click();
  await check(page, 'uebung tauschen', info);
  await page.locator('[data-act="pick-view"]').first().click();
  await check(page, 'uebung tauschen ansehen', info);
  await page.getByRole('button', { name: 'Dafür tauschen' }).click();
  await check(page, 'vorschlag nach tausch', info);
  await weiter(page).click();
  await check(page, 'name', info);
  await page.getByLabel('Name').fill('Ein ziemlich langer Name fuer das Training, der umbrechen muss');
  await page.getByRole('button', { name: 'Speichern und starten' }).click();
  await check(page, 'training gestartet', info);
});

test('Bestehende Trainings, Vorschau, schnelle Wege', async ({ page, site }, info) => {
  await openApp(page, site, { state: seed() });
  await page.locator('[data-act="flow-mine"]').click();
  await check(page, 'bestehende trainings', info);
  await page.locator('.rc', { hasText: 'Passt zu meiner Ausrüstung' }).click();
  await check(page, 'bestehende trainings gefiltert', info);
  await page.locator('.rc', { hasText: 'Passt zu meiner Ausrüstung' }).click();
  await page.locator('.tcard[data-id="u1"]').click();
  await check(page, 'vorschau eigenes training', info);
  await page.getByRole('button', { name: 'Zurück' }).first().click();
  await page.locator('.tcard[data-id="p-kraft"]').click();
  await check(page, 'vorschau mit fehlender ausruestung', info);
  await page.getByRole('button', { name: 'Zurück' }).first().click();
  await page.getByRole('button', { name: 'Zurück' }).first().click();
  await page.locator('[data-act="flow-quick"]').click();
  await check(page, 'kurzes training', info);
});

test('Training: Fokuskarte, Hinweise für jede Übung, Pause, Plank, Fertig', async ({ page, site }, info) => {
  await openApp(page, site, { state: seed() });
  for (const day of ['A', 'B']) {
    await startFromList(page, day);
    if (day === 'A') await check(page, 'training fokus', info);
    const n = await page.locator('.list .row').count();
    for (let i = 0; i < n; i++) {
      await page.locator('.list .row').nth(i).click();
      await page.getByRole('button', { name: 'So geht die Übung' }).click();
      await expect(page.locator('.stage svg g#fig-g > *').first()).toBeAttached();
      await check(page, 'uebung ' + day + (i + 1) + ' mit Hinweisen', info);
      const box = await page.locator('.stage').boundingBox();
      const vw = page.viewportSize().width;
      expect(box.x).toBeGreaterThanOrEqual(0);
      expect(box.x + box.width).toBeLessThanOrEqual(vw);
      await page.getByRole('button', { name: 'Hinweise schliessen' }).click();
    }
    if (day === 'B') {
      await page.getByRole('button', { name: /Satz \d geschafft/ }).first().click();
      await check(page, 'pause', info);
      await page.getByRole('button', { name: 'So geht die Übung' }).click();
      await check(page, 'pause mit Hinweisen', info);
    }
    await page.getByRole('button', { name: 'Zurück' }).first().click();
  }
  await startFromList(page, 'A');
  await page.locator('.list').getByRole('button', { name: /Plank/ }).click();
  await page.getByRole('button', { name: 'Plank starten' }).click();
  await check(page, 'plank laeuft', info);
});

test('Fertig-Karte, Kalender-Formular, Kalender mit offenem Eintrag', async ({ page, site }, info) => {
  const done = { A: { 'a-box': 3, 'a-hip': 3, 'a-push': 3, 'a-tri': 3, 'a-plank': 3 } };
  await openApp(page, site, { state: { ...seed(), sets: done, stamp: { A: TODAY }, cur: 'A', last: ['A'] } });
  await startFromList(page, 'A');
  await expect(page.locator('h2.name')).toHaveText('Fertig für heute');
  await check(page, 'fertig', info);
  await page.getByRole('button', { name: 'Training in Kalender eintragen' }).click();
  await check(page, 'fertig kalenderformular', info);
  await tab(page, 'Kalender').click();
  await check(page, 'kalender', info);
  await page.locator('.entry-head[data-day="A"]').click();
  await check(page, 'kalender eintrag offen', info);
  await page.locator('.entry-head[data-day="A"]').click();
  await page.locator('.entry-head[data-day="B"]').click();
  await check(page, 'kalender leerer eintrag offen', info);
  await page.locator('button.cd[data-key="2026-10-04"]').click();
  await check(page, 'kalender leerer tag', info);
  await page.getByRole('button', { name: /Anderes Training/ }).click();
  await check(page, 'kalender training waehlen', info);
});

test('Übungen: Bereiche, Suche, Liste, Ausrüstung, Übung mit Animation', async ({ page, site }, info) => {
  await openApp(page, site, { state: seed() });
  await tab(page, 'Übungen').click();
  await check(page, 'uebungen', info);
  await page.getByRole('button', { name: /Meine Ausrüstung/ }).click();
  await check(page, 'uebungen ausruestung', info);
  await page.getByRole('button', { name: 'Fertig' }).click();
  await page.locator('#lib-q').fill('Kniebeuge');
  await check(page, 'uebungen suche', info);
  await page.locator('#lib-q').fill('');
  await page.locator('.gt[data-g="beine"]').click();
  await check(page, 'uebungen bereich beine', info);
  await page.locator('.row', { hasText: 'Goblet-Kniebeuge' }).first().click();
  await check(page, 'uebung goblet-kniebeuge', info);
  await page.getByRole('button', { name: 'Zurück' }).first().click();
  await page.getByRole('button', { name: 'Zurück' }).first().click();
  await page.locator('.gt[data-g="ganz"]').click();
  await check(page, 'uebungen bereich ganzkoerper', info);
});

test('Essen: Liste, Bearbeiten mit Kopierfeld, Ziel, Sicherung, Update-Leiste', async ({ page, site }, info) => {
  await openApp(page, site, { state: seed() });
  await tab(page, 'Essen').click();
  await check(page, 'essen', info);
  await page.getByRole('button', { name: 'pro 100 ml' }).click();
  await check(page, 'essen pro 100 ml', info);
  await page.getByRole('button', { name: 'Mehr Werte (Zucker, Ballaststoffe)' }).click();
  await check(page, 'essen mehr werte', info);
  await page.getByRole('button', { name: 'Ziele ändern' }).click();
  await check(page, 'essen ziel', info);
  await page.getByRole('button', { name: /Magerquark mit Beeren.* bearbeiten/ }).click();
  await check(page, 'essen bearbeiten', info);
  await page.getByRole('button', { name: 'Auf anderen Tag kopieren' }).click();
  await check(page, 'essen kopieren', info);
  await page.getByRole('button', { name: 'Abbrechen', exact: true }).first().click();
  await page.getByRole('button', { name: 'Daten sichern oder wiederherstellen' }).click();
  await check(page, 'sicherung', info);
  // Update-Leiste (nur das Aussehen: das echte Verhalten prüft update.spec)
  await page.evaluate(() => {
    const bar = document.getElementById('upd');
    bar.hidden = false; document.body.classList.add('has-upd');
    bar.style.bottom = document.querySelector('.nav').offsetHeight + 'px';
  });
  await check(page, 'update leiste', info);
  const bar = await page.locator('#upd .upd-in').boundingBox(), nav = await page.locator('.nav').boundingBox();
  expect(bar.y + bar.height).toBeLessThanOrEqual(nav.y + 0.5);
  await page.evaluate(() => window.scrollTo(0, document.documentElement.scrollHeight));
  const last = await page.locator('.foot').boundingBox();
  expect(last.y + last.height).toBeLessThanOrEqual(bar.y + 1);
});
