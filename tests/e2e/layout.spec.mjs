import { test, expect, openApp, tab, TODAY, ROOT } from './fixtures.mjs';
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
  schema: 2,
  log: {
    [TODAY]: [{ day: 'A', sets: { 'a-box': 3, 'a-hip': 3, 'a-push': 2 }, weights: { 'a-hip': '60' }, note: 'Knie war gut' }, { day: 'B', sets: {}, weights: {}, note: '' }],
    '2026-10-02': [{ day: 'B', sets: { 'b-rdl': 3 }, weights: {}, note: '' }]
  },
  food: { [TODAY]: [food('f1', 'Magerquark mit Beeren und einem sehr langen Namen zum Testen des Umbruchs', 250, { kcal: 67, p: 12, f: 0.2, c: 4, s: 4, b: 1 }), food('f2', 'Riegel', null, { kcal: 210, p: 20 }, 'por')] },
  recent: [food('f1', 'Magerquark', 250, { kcal: 67, p: 12 }), food('f3', 'Haferflocken', 60, { kcal: 372 })],
  goalP: 100, weightKg: 62
});

test('Training: Fokuskarte, Hinweise für jede Übung, Pause, Plank, Fertig', async ({ page, site }, info) => {
  await openApp(page, site, { state: seed() });
  await check(page, 'training fokus', info);
  for (const day of ['A', 'B']) {
    await page.locator('header.top').getByRole('button', { name: new RegExp('Tag ' + day) }).click();
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
      // zuklappen für die nächste Runde (Zustand bleibt sonst offen)
      await page.getByRole('button', { name: 'Hinweise schliessen' }).click();
    }
  }
  // Pause
  await page.locator('header.top').getByRole('button', { name: /Tag B/ }).click();
  await page.getByRole('button', { name: /Satz \d geschafft/ }).first().click();
  await check(page, 'pause', info);
  await page.getByRole('button', { name: 'So geht die Übung' }).click();
  await check(page, 'pause mit Hinweisen', info);
  // Plank läuft
  await page.locator('header.top').getByRole('button', { name: /Tag A/ }).click();
  await page.locator('.list').getByRole('button', { name: /Plank/ }).click();
  await page.getByRole('button', { name: 'Plank starten' }).click();
  await check(page, 'plank laeuft', info);
});

test('Fertig-Karte, Kalender-Formular, Kalender mit offenem Eintrag', async ({ page, site }, info) => {
  const done = { A: { 'a-box': 3, 'a-hip': 3, 'a-push': 3, 'a-tri': 3, 'a-plank': 3 }, B: {} };
  await openApp(page, site, { state: { ...seed(), sets: done, stamp: { A: TODAY, B: '' } } });
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
});

test('Essen: Liste, Bearbeiten mit Kopierfeld, Ziel, Sicherung, Update-Leiste', async ({ page, site }, info) => {
  await openApp(page, site, { state: seed() });
  await tab(page, 'Essen').click();
  await check(page, 'essen', info);
  await page.getByRole('button', { name: 'Mehr Werte (Zucker, Ballaststoffe)' }).click();
  await check(page, 'essen mehr werte', info);
  await page.getByRole('button', { name: 'Protein-Ziel ändern' }).click();
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
