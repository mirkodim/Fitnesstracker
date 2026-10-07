import { test, expect, openApp, stored, tab, noSharpS } from './fixtures.mjs';

const top = (page) => page.locator('header.top');
const search = (page) => page.locator('#lib-q');
/* the exercise library is the part "Übungen" of the tab "Erstellen", the one that opens first */
async function openLibrary(page) {
  await tab(page, 'Erstellen').click();
  await expect(search(page)).toBeVisible();
}

test.describe('Übungen', () => {
  test('Bereiche mit Anzahl, Suche, Liste nach Gliedmassen, Übung mit Animation', async ({ page, site }) => {
    await openApp(page, site);
    await openLibrary(page);
    const total = await page.evaluate(() => LIB.length);
    expect(total).toBeGreaterThanOrEqual(118);
    await expect(top(page)).toContainText('Mit + ein Training bauen');
    await expect(page.getByRole('button', { name: 'Alle Übungen' })).toContainText(total + ' Übungen zum Durchblättern, nach Körperteil sortiert');
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
    // jede Übung lässt sich dem neuen Training hinzufügen, auch von ihrer Seite aus; getauscht wird hier nichts
    await expect(page.getByRole('button', { name: 'Zum neuen Training hinzufügen' })).toBeVisible();
    await expect(page.getByRole('button', { name: /Dafür tauschen/ })).toHaveCount(0);
    // zurück: Liste, dann Kacheln
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(top(page)).toContainText('Beine');
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(search(page)).toBeVisible();
  });

  test('Alle Übungen: jede Übung einmal, nach Körperteil sortiert, mit Sprungleiste; die Zurück-Taste führt zurück', async ({ page, site }) => {
    await openApp(page, site);
    await openLibrary(page);
    const total = await page.evaluate(() => LIB.length);
    // der Knopf steht über den Körperteilen und beschreibt, was dahinter ist
    const allBtn = page.getByRole('button', { name: 'Alle Übungen' });
    const aBox = await allBtn.boundingBox(), tBox = await page.locator('.gt[data-g="beine"]').boundingBox();
    expect(aBox.y + aBox.height).toBeLessThan(tBox.y);
    await allBtn.click();
    await expect(top(page).locator('h2.mt')).toHaveText('Alle Übungen');
    await expect(top(page)).toContainText(total + ' Übungen');
    // Abschnitte in der Reihenfolge der Körperteile, die Zahlen ergeben zusammen alle Übungen
    const expected = await page.evaluate(() => Builder.allByGroup(null).filter((g) => g.list.length).map((g) => [GROUPS.find((x) => x.id === g.id).label, g.list.length]));
    const heads = await page.locator('h3.sec').allInnerTexts();
    expect(heads).toEqual(expected.map(([l, n]) => l.toUpperCase() + ' · ' + n));
    expect(expected.reduce((n, [, c]) => n + c, 0)).toBe(total);
    // jede Übung genau einmal
    const names = await page.locator('[data-act="lib-open"] b').allInnerTexts();
    expect(names).toHaveLength(total);
    expect(new Set(names).size).toBe(total);
    // in jedem Abschnitt stehen die leichten zuerst
    const rank = { Einsteiger: 1, Geübt: 2, Fortgeschritten: 3 };
    for (const sec of await page.locator('section[aria-labelledby^="all-h-"]').all()) {
      const lv = (await sec.locator('.rn small').allInnerTexts()).map((t) => rank[t.split(' · ')[0]]);
      expect(lv.every((v, i) => i === 0 || lv[i - 1] <= v), lv.join()).toBe(true);
    }
    // Sprungleiste: ein Tipp bringt den Abschnitt an den oberen Rand
    const jump = page.getByRole('group', { name: 'Zu einem Körperteil springen' });
    await expect(jump.getByRole('button')).toHaveCount(expected.length);
    await jump.getByRole('button', { name: 'Bauch' }).click();
    await expect(page.locator('#all-h-bauch')).toBeInViewport();
    await expect.poll(async () => (await page.locator('#all-h-bauch').boundingBox()).y).toBeLessThan(260);
    await expect(page.locator('#all-h-bauch')).toContainText('Bauch');
    // eine Übung öffnen, zurück: wieder die Liste
    await page.locator('section[aria-labelledby="all-h-bauch"] [data-act="lib-open"]').first().click();
    await expect(page.getByRole('heading', { name: 'Darauf achten' })).toBeVisible();
    await page.goBack();
    await expect(top(page).locator('h2.mt')).toHaveText('Alle Übungen');
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(search(page)).toBeVisible();
    await expect(allBtn).toBeVisible();
  });

  test('Keine Ausrüstungs-Optionen: jede Übung ist da und sagt unter ihrem Namen, was sie braucht, nichts ist ausgegraut', async ({ page, site }) => {
    await openApp(page, site, { state: { schema: 3, prefs: { equip: [] } } });          // auch wer "ohne Ausrüstung" gewählt hat, bekommt keinen Filter und keine Frage
    await openLibrary(page);
    await expect(page.getByRole('button', { name: /Nur passende|Meine Ausrüstung|Ausrüstung/ })).toHaveCount(0);
    await expect(page.getByText(/Passende Übungen|Passt zu meiner|fehlt dir/)).toHaveCount(0);
    const n = await page.evaluate(() => LIB.length);
    // Kacheln zählen alle Übungen des Bereichs
    const groups = await page.evaluate(() => GROUPS.map((g) => [g.id, LIB.filter((e) => Builder.inGroup(e, g.id)).length]));
    for (const [id, c] of groups) await expect(page.locator('.gt[data-g="' + id + '"] small')).toHaveText(String(c));
    await page.getByRole('button', { name: 'Alle Übungen' }).click();
    await expect(page.locator('.row.dim')).toHaveCount(0);
    expect(await page.locator('[data-act="lib-open"]').count()).toBe(n);
    // unter jedem Namen steht die Stufe und was gebraucht wird
    const smalls = await page.locator('[data-act="lib-open"] .rn small').allInnerTexts();
    expect(smalls.every((t) => /^(Einsteiger|Geübt|Fortgeschritten) · .{3,}$/.test(t))).toBe(true);
    expect(smalls.some((t) => t.endsWith('Nur Körpergewicht'))).toBe(true);
    expect(smalls.some((t) => t.includes('Maschinen'))).toBe(true);
    await expect(top(page)).toContainText(n + ' Übungen');
    // die Sprungleiste hat einen Knopf je Abschnitt
    const sections = await page.locator('h3.sec').count();
    expect(sections).toBe(9);
    await expect(page.getByRole('group', { name: 'Zu einem Körperteil springen' }).getByRole('button')).toHaveCount(sections);
    // zurück: dieselbe Seite, ohne Filter
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(page.locator('.gt[data-g="arme"]')).toBeVisible();
    await expect(page.getByRole('button', { name: /Nur passende/ })).toHaveCount(0);
  });

  test('Die neuen Maschinen aus Fitness- und Reha-Zentren sind zu finden, mit Bild und Hinweisen', async ({ page, site }) => {
    await openApp(page, site);
    await openLibrary(page);
    const hits = page.locator('#lib-res .row');
    await search(page).fill('Maschine');
    expect(await hits.count()).toBeGreaterThanOrEqual(20);
    // Suche über den Gerätenamen
    await search(page).fill('Pec Deck');
    await expect(hits.filter({ hasText: 'Butterfly an der Maschine' })).toHaveCount(1);
    await search(page).fill('Hackenschmidt');
    await expect(hits).toHaveCount(1);
    await hits.first().locator('[data-act="lib-open"]').click();
    await expect(page.locator('h2.name')).toHaveText('Hackenschmidt-Kniebeuge');
    await expect(page.locator('.need')).toContainText('Maschinen');
    await expect(page.locator('.note', { hasText: 'Knie:' })).toBeVisible();
    await expect(page.locator('#fig-g > *').first()).toBeAttached();
    await expect(page.getByRole('heading', { name: 'Darauf achten' })).toBeVisible();
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    // Reha: Aussenrotation mit Band, Kniestrecken, Einbeinstand mit Haltezeit
    for (const [q, name] of [['Aussenrotation', 'Aussenrotation mit Band'], ['Kniestrecken', 'Kniestrecken mit Band'], ['Einbeinstand', 'Einbeinstand']]) {
      await search(page).fill(q);
      await hits.filter({ hasText: name }).first().locator('[data-act="lib-open"]').click();
      await expect(page.locator('h2.name')).toHaveText(name);
      await expect(page.locator('#fig-g > *').first()).toBeAttached();
      await page.getByRole('button', { name: 'Zurück' }).first().click();
    }
    await search(page).fill('Einbeinstand');
    await hits.first().locator('[data-act="lib-open"]').click();
    await expect(page.locator('.rx')).toContainText('3 × 30 s');
    await expect(page.locator('.rx')).toContainText('pro Seite halten');
  });

  test('Die Seiten der Übungen enthalten keine Platzhalter und kein scharfes S', async ({ page, site }) => {
    await openApp(page, site);
    await openLibrary(page);
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
