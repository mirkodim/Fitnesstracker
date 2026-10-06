import { test, expect, openApp, stored, tab, noSharpS } from './fixtures.mjs';

const top = (page) => page.locator('header.top');
const search = (page) => page.locator('#lib-q');

test.describe('Übungen', () => {
  test('Bereiche mit Anzahl, Suche, Liste nach Gliedmassen, Übung mit Animation', async ({ page, site }) => {
    await openApp(page, site);
    await tab(page, 'Übungen').click();
    const total = await page.evaluate(() => LIB.length);
    expect(total).toBeGreaterThanOrEqual(80);
    await expect(top(page)).toContainText(total + ' Übungen mit Animation');
    // neun Bereiche, jede Kachel zeigt die richtige Anzahl
    const groups = await page.evaluate(() => GROUPS.map((g) => [g.id, g.label, Builder.listGroup(g.id).length]));
    expect(groups).toHaveLength(9);
    for (const [id, label, n] of groups) {
      const t = page.locator('.gt[data-g="' + id + '"]');
      await expect(t).toContainText(label);
      await expect(t.locator('small')).toHaveText(String(n));
    }
    // Suche: findet über Namen, Gerät und Muskel; die Kacheln treten zurück
    await search(page).fill('kniebeuge');
    await expect(page.locator('#lib-tiles')).toBeHidden();
    const hits = page.locator('#lib-res .row');
    expect(await hits.count()).toBeGreaterThanOrEqual(5);
    await expect(page.locator('#lib-res .hint')).toContainText(/\d+ Übungen gefunden/);
    await expect(hits.filter({ hasText: 'Goblet-Kniebeuge' })).toHaveCount(1);
    await search(page).fill('qqqqq');
    await expect(page.locator('#lib-res .hint')).toHaveText('0 Übungen gefunden');
    await search(page).fill('Kettlebell');
    await expect(hits.filter({ hasText: 'Kettlebell-Swing' })).toHaveCount(1);
    await search(page).fill('');
    await expect(page.locator('#lib-tiles')).toBeVisible();

    // Bereich "Beine": Oberschenkel und Unterschenkel getrennt, leichte Übungen zuerst
    await page.locator('.gt[data-g="beine"]').click();
    await expect(top(page)).toContainText('Beine');
    await expect(page.locator('h3.sec').nth(0)).toContainText('Oberschenkel');
    await expect(page.locator('h3.sec').nth(1)).toContainText('Unterschenkel');
    const firstThigh = page.locator('.list').nth(0).locator('.row').first();
    await expect(firstThigh).toContainText('Einsteiger');
    await expect(page.locator('.hint').last()).toContainText('Sie steht dann in jedem passenden Bereich');
    // dieselbe Übung kann in zwei Bereichen stehen: die Gesässbrücke bei Gesäss und bei Beinen
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await page.locator('.gt[data-g="gesaess"]').click();
    await expect(page.locator('.row', { hasText: 'Gesässbrücke' }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await page.locator('.gt[data-g="beine"]').click();
    await expect(page.locator('.row', { hasText: 'Gesässbrücke' }).first()).toBeVisible();

    // Eine Übung ansehen: Name, Bereiche, Stufe, Ausrüstung, Knie-Hinweis, Bild, Hinweise
    await page.locator('.row', { hasText: /^Kniebeuge/ }).first().click();
    await expect(page.locator('h2.name')).toHaveText('Kniebeuge');
    await expect(page.locator('.tc-chips')).toContainText('Oberschenkel');
    await expect(page.locator('.tc-chips')).toContainText('Gesäss');
    await expect(page.locator('.tc-chips')).toContainText('Einsteiger');
    await expect(page.locator('.need')).toContainText('Du brauchst:');
    await expect(page.locator('.note', { hasText: 'Knie:' })).toBeVisible();
    await expect(page.locator('#fig-g > *').first()).toBeAttached();
    for (const h of ['Darauf achten', 'Häufige Fehler', 'Hier spürst du es']) await expect(page.getByRole('heading', { name: h })).toBeVisible();
    await expect(page.locator('#fig-cap')).toHaveText('Tippe auf das Bild, um die Bewegung abzuspielen.');
    // in der Bibliothek gibt es keinen Knopf zum Hinzufügen
    await expect(page.getByRole('button', { name: /Zum Training hinzufügen|Dafür tauschen/ })).toHaveCount(0);
    // zurück: Liste, dann Kacheln
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(top(page)).toContainText('Beine');
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(search(page)).toBeVisible();
  });

  test('Ausrüstung: nur passende Übungen, "fehlt dir" bei den anderen', async ({ page, site }) => {
    await openApp(page, site, { state: { schema: 3, prefs: { equip: [], preset: 'travel', level: 1, minutes: 30 } } });
    await tab(page, 'Übungen').click();
    const free = await page.evaluate(() => GROUPS.map((g) => [g.id, Builder.listGroup(g.id, Builder.haveSet([])).length]));
    await expect(page.getByRole('button', { name: /Meine Ausrüstung \(0\)/ })).toBeVisible();
    // ohne Filter: alle Übungen, die anderen sind markiert
    await page.locator('.gt[data-g="arme"]').click();
    await expect(page.locator('.row', { hasText: 'fehlt dir' }).first()).toBeVisible();
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    // mit Filter: Kacheln und Liste zeigen nur noch, was ohne Geräte geht
    await page.getByRole('button', { name: 'Nur passende Übungen' }).click();
    for (const [id, n] of free) await expect(page.locator('.gt[data-g="' + id + '"] small')).toHaveText(String(n));
    await page.locator('.gt[data-g="arme"]').click();
    await expect(page.locator('.row', { hasText: 'fehlt dir' })).toHaveCount(0);
    const nArms = free.find((x) => x[0] === 'arme')[1];
    expect(nArms).toBeGreaterThanOrEqual(2);
    await expect(top(page)).toContainText(/\d+ Übungen/);
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    // Ausrüstung ändern: mit Kurzhanteln und Bank kommen Übungen dazu
    await page.getByRole('button', { name: /Meine Ausrüstung/ }).click();
    await page.getByRole('button', { name: 'Kurzhanteln' }).click();
    await page.getByRole('button', { name: 'Bank', exact: true }).click();
    await page.getByRole('button', { name: 'Fertig' }).click();
    expect((await stored(page)).prefs.equip.sort()).toEqual(['bank', 'kh']);
    const more = await page.evaluate(() => Builder.listGroup('arme', Builder.haveSet(['kh', 'bank'])).length);
    expect(more).toBeGreaterThan(nArms);
    await expect(page.locator('.gt[data-g="arme"] small')).toHaveText(String(more));
  });

  test('Die Seiten der Übungen enthalten keine Platzhalter und kein scharfes S', async ({ page, site }) => {
    await openApp(page, site);
    await tab(page, 'Übungen').click();
    const ids = await page.evaluate(() => LIB.map((e) => e.id));
    const bad = [];
    for (const id of ids.filter((_, i) => i % 3 === 0)) {                       // jede dritte reicht für den Schriftcheck, die Animation prüft anim.spec für alle
      const name = await page.evaluate((i) => EX[i].name, id);
      await search(page).fill(name);
      await page.locator('#lib-res .row').filter({ has: page.getByText(name, { exact: true }) }).first().click();
      await expect(page.locator('h2.name')).toHaveText(name);
      const txt = await page.locator('main').innerText();
      if (/ß|undefined|NaN|\[object|null/.test(txt)) bad.push(id);
      await page.getByRole('button', { name: 'Zurück' }).first().click();
    }
    expect(bad).toEqual([]);
  });
});
