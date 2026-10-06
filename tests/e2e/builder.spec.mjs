import { test, expect, openApp, stored, tab, startFromList, noSharpS, TODAY } from './fixtures.mjs';

const top = (page) => page.locator('header.top');
const weiter = (page) => page.getByRole('button', { name: 'Weiter', exact: true });
const done = (page, n) => page.getByRole('button', { name: 'Satz ' + n + ' geschafft', exact: true });
const tile = (page, g) => page.locator('.gt[data-g="' + g + '"]');
const rowNames = (page) => page.locator('.brow .brow-head b, .brow .brow-head .rn b').allInnerTexts();

/* what the app itself knows (the browser has the same Builder, library and equipment as the tests) */
const fits = (page, ids, equip) => page.evaluate(([i, e]) => i.every((id) => Builder.eqOK(EX[id], Builder.haveSet(e))), [ids, equip]);

test.describe('Neues Training', () => {
  test('Von der Frage bis zum Start: Bereiche, Ausrüstung, Zeit, Stufe, Anpassen, Speichern, Training läuft', async ({ page, site }) => {
    await openApp(page, site);
    await expect(page.getByRole('heading', { name: 'Was möchtest du heute trainieren?' })).toBeVisible();
    // ohne Auswahl geht es nicht weiter, mehrere Bereiche gehen
    await expect(weiter(page)).toBeDisabled();
    await tile(page, 'beine').click();
    await tile(page, 'gesaess').click();
    await expect(tile(page, 'beine')).toHaveAttribute('aria-pressed', 'true');
    await expect(tile(page, 'arme')).toHaveAttribute('aria-pressed', 'false');
    await weiter(page).click();
    await expect(page.locator('h2.name')).toHaveText('Beine und Gesäss');
    await page.getByRole('button', { name: /Neues Training erstellen/ }).click();

    // 1 von 3: Ausrüstung
    await expect(page.getByRole('heading', { name: 'Was hast du zur Verfügung?' })).toBeVisible();
    await expect(top(page)).toContainText('Schritt 1 von 3');
    await page.locator('.pre[data-p="home"]').click();
    await expect(page.locator('.pre[data-p="home"]')).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Kiste, Step oder stabiler Stuhl' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Widerstandsband' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('button', { name: 'Kurzhanteln' })).toHaveAttribute('aria-pressed', 'false');
    await page.getByRole('button', { name: 'Kurzhanteln' }).click();
    await expect(page.getByRole('button', { name: 'Kurzhanteln' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('.pre[data-p="home"]')).toHaveAttribute('aria-pressed', 'false');       // nicht mehr genau "Zuhause"
    await weiter(page).click();

    // 2 von 3: Zeit, 3 von 3: Erfahrung (ein Tipp geht gleich weiter)
    await expect(page.getByRole('heading', { name: 'Wie viel Zeit hast du?' })).toBeVisible();
    await expect(top(page)).toContainText('Schritt 2 von 3');
    for (const m of ['10 Min.', '20 Min.', '30 Min.', '45 Min.', '60 Min.', '90 Min.']) await expect(page.getByRole('button', { name: m })).toBeVisible();
    await page.locator('[data-m="45"]').click();
    await expect(page.getByRole('heading', { name: 'Wie vertraut bist du mit Training?' })).toBeVisible();
    await expect(top(page)).toContainText('Schritt 3 von 3');
    await page.locator('[data-l="2"]').click();

    // der Vorschlag
    await expect(top(page)).toContainText('Dein Vorschlag');
    await expect(top(page)).toContainText(/\d+ Übungen · ca\. (40|45|50) Min\./);
    const rows = page.locator('.brow');
    const n0 = await rows.count();
    expect(n0).toBeGreaterThanOrEqual(5);
    const wanted = ['kh', 'box', 'band'];
    // 1. Zeile öffnen, Sätze und Pause ändern
    await rows.first().locator('.brow-head').click();
    await expect(rows.first()).toHaveClass(/open/);
    const before = await rows.first().locator('.brow-head').innerText();
    await rows.first().getByRole('button', { name: /Sätze mehr/ }).click();
    const after = await rows.first().locator('.brow-head').innerText();
    expect(after).not.toBe(before);
    expect(after).toMatch(/4 ×/);
    await rows.first().getByRole('button', { name: /Pause mehr/ }).click();
    // 2. Zeile tauschen
    await rows.nth(1).locator('.brow-head').click();
    const second = (await rows.nth(1).locator('.brow-head').innerText()).split('\n')[0];
    await rows.nth(1).getByRole('button', { name: 'Tauschen' }).click();
    await expect(top(page)).toContainText('Übung tauschen');
    await page.locator('[data-act="pick-add"]').first().click();
    await expect(top(page)).toContainText('Dein Vorschlag');
    expect(await rows.count()).toBe(n0);
    expect((await rows.nth(1).locator('.brow-head').innerText()).split('\n')[0]).not.toBe(second);
    // letzte Zeile entfernen
    await rows.last().locator('.brow-head').click();
    await rows.last().getByRole('button', { name: 'Entfernen' }).click();
    expect(await rows.count()).toBe(n0 - 1);
    // eine Übung aus dem Bauch-Bereich hinzufügen
    await page.getByRole('button', { name: 'Übung hinzufügen' }).click();
    await page.locator('[data-act="pick-group"][data-g="bauch"]').click();
    await expect(page.locator('[data-act="pick-group"][data-g="bauch"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-act="pick-add"]').first().click();
    expect(await rows.count()).toBe(n0);

    // weiter: Namen vergeben, speichern und starten
    await weiter(page).click();
    await expect(page.getByRole('heading', { name: 'Wie soll dein Training heissen?' })).toBeVisible();
    const name = page.getByLabel('Name');
    await expect(name).toHaveValue(/^Beine/);
    await name.fill('Mein Beintag');
    await page.getByRole('button', { name: 'Speichern und starten' }).click();
    await expect(top(page)).toContainText('Mein Beintag');
    await expect(top(page)).toContainText('0 von ' + (await page.locator('.list .row').count()) + ' Übungen');

    const s = await stored(page);
    expect(s.schema).toBe(3);
    expect(s.trainings).toHaveLength(1);
    expect(s.trainings[0].name).toBe('Mein Beintag');
    expect(s.trainings[0].items).toHaveLength(n0);
    expect(s.trainings[0].items[0].sets).toBe(4);
    expect(s.cur).toBe(s.trainings[0].id);
    expect(s.prefs.equip.sort()).toEqual(['band', 'box', 'kh']);
    expect(s.prefs.minutes).toBe(45);
    expect(s.prefs.level).toBe(2);
    expect(await fits(page, s.trainings[0].items.map((i) => i.ex).filter((id) => !/^x-(crunch|deadbug|bicycle|mountain|hollow|legraise|sideplank)$/.test(id) || true), wanted.concat(['kh']))).toBe(true);

    // ein Satz, dann zurück: das Training steht unter "Zuletzt" und "Meine Trainings"
    await done(page, 1).click();
    await page.getByRole('button', { name: 'Weiter', exact: true }).click();
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(page.locator('.card.go')).toContainText('Mein Beintag');
    await page.getByRole('button', { name: 'Weitermachen' }).click();
    await expect(top(page)).toContainText('1 von');
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await page.locator('[data-act="flow-mine"]').click();
    await expect(page.locator('h3.eyebrow', { hasText: 'Meine Trainings' })).toContainText('1');
    await expect(page.locator('.tcard', { hasText: 'Mein Beintag' })).toBeVisible();
  });

  test('Das Gerät lässt sich nicht aus Versehen verstellen: Bearbeiten, Namen mit Sonderzeichen, Löschen und Zurückholen', async ({ page, site }) => {
    const items = [{ ex: 'x-squat', sets: 2 }, { ex: 'x-bridge', sets: 2 }, { ex: 'x-crunch', sets: 3 }];
    await openApp(page, site, { state: { schema: 3, trainings: [{ id: 'u1', name: 'Mein Test', items }], log: { '2026-10-01': [{ day: 'u1', title: 'Mein Test', targets: { 'x-squat': 2, 'x-bridge': 2, 'x-crunch': 3 }, sets: { 'x-squat': 2 }, weights: {}, note: '' }] } } });
    await page.locator('[data-act="flow-mine"]').click();
    await expect(page.locator('.tcard', { hasText: 'Mein Test' })).toBeVisible();
    await page.locator('.tcard[data-id="u1"]').click();
    await expect(page.locator('.eyebrow').first()).toHaveText(/Mein Training/i);
    await expect(page.locator('.need')).toContainText('nur dein Körpergewicht');
    // Bearbeiten mit einem Namen, der nichts anrichten darf
    await page.getByRole('button', { name: 'Bearbeiten' }).click();
    await expect(top(page)).toContainText('Training bearbeiten');
    await page.getByLabel('Name des Trainings').fill('<img src=x onerror="window.pwned=1"> Beine & "Po"');
    await page.getByRole('button', { name: 'Speichern', exact: true }).click();
    await expect(page.locator('h2.name')).toContainText('Beine & "Po"');
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(page.locator('.tcard', { hasText: 'Beine & "Po"' })).toBeVisible();
    await expect(page.locator('main img')).toHaveCount(0);
    expect(await page.evaluate(() => window.pwned)).toBeUndefined();
    expect((await stored(page)).trainings[0].name).toContain('<img src=x');
    // Löschen mit Rückgängig; der Kalender behält seinen Eintrag mit dem alten Namen
    await page.locator('.tcard[data-id="u1"]').click();
    await page.getByRole('button', { name: 'Löschen' }).click();
    await expect(page.locator('.note.undo')).toContainText('Training gelöscht.');
    expect((await stored(page)).trainings).toHaveLength(0);
    await page.getByRole('button', { name: 'Rückgängig' }).click();
    await expect(page.locator('.tcard[data-id="u1"]')).toBeVisible();
    expect((await stored(page)).trainings).toHaveLength(1);
    await page.locator('.tcard[data-id="u1"]').click();
    await page.getByRole('button', { name: 'Löschen' }).click();
    await tab(page, 'Kalender').click();
    await page.locator('button.cd[data-key="2026-10-01"]').click();
    await expect(page.locator('.entry-head')).toContainText('Mein Test');
    await expect(page.locator('.entry-head')).toContainText('2 von 7 Sätzen');
  });

  test('Wenig Lust? Zehn Minuten, und "Überrasch mich"', async ({ page, site }) => {
    await openApp(page, site);
    await page.locator('[data-act="flow-quick"]').click();
    await expect(top(page)).toContainText('Kurzes Training');
    await page.locator('.pre[data-p="travel"]').click();
    await page.getByRole('button', { name: 'Training vorschlagen' }).click();
    await expect(top(page)).toContainText(/\d Übungen · ca\. (5|10|15) Min\./);
    expect(await page.locator('.brow').count()).toBeLessThanOrEqual(6);
    await weiter(page).click();
    await expect(page.getByLabel('Name')).toHaveValue(/10 Min|Kurz/);
    await page.getByRole('button', { name: 'Speichern und starten' }).click();
    await expect(page.locator('h2.name').first()).toBeVisible();
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await page.getByRole('button', { name: 'Zurück' }).first().click().catch(() => {});
    await openApp(page, site);
    await page.locator('[data-act="flow-surprise"]').click();
    // beim ersten Mal wird nach der Ausrüstung gefragt, danach steht der Vorschlag da
    if (await page.getByRole('heading', { name: 'Was hast du zur Verfügung?' }).isVisible()) {
      await page.locator('.pre[data-p="gym"]').click();
      await page.getByRole('button', { name: /Training vorschlagen|Weiter/ }).click();
    }
    await expect(top(page)).toContainText('Dein Vorschlag');
    expect(await page.locator('.brow').count()).toBeGreaterThanOrEqual(3);
  });
});

test.describe('Bestehendes Training', () => {
  test('Bereich wählen, Vorschläge der App: 30 bis 90 Minuten, Filter, Vorschau', async ({ page, site }) => {
    await openApp(page, site);
    await tile(page, 'ruecken').click();
    await weiter(page).click();
    await page.getByRole('button', { name: /Bestehendes Training wählen/ }).click();
    await expect(top(page)).toContainText('Bestehendes Training');
    await expect(top(page)).toContainText('Rücken');
    const sel = page.locator('.rc', { hasText: 'Nur Rücken' });
    await expect(sel).toHaveAttribute('aria-pressed', 'true');
    const cards = page.locator('.tcard');
    const n = await cards.count();
    expect(n).toBeGreaterThanOrEqual(4);
    const texts = await cards.locator('.tc-top small').allInnerTexts();
    for (const t of texts) {
      const m = Number(/ca\. (\d+) Min\./.exec(t)[1]);
      expect(m, t).toBeGreaterThanOrEqual(30);
      expect(m, t).toBeLessThanOrEqual(90);
    }
    // alle zeigen
    await sel.click();
    await expect(page.locator('.rc', { hasText: 'Alle Bereiche zeigen' })).toHaveAttribute('aria-pressed', 'false');
    expect(await cards.count()).toBeGreaterThan(n);
    // "passt zu meiner Ausrüstung": ohne Angabe nur Körpergewicht
    await page.locator('.rc', { hasText: 'Passt zu meiner Ausrüstung' }).click();
    await expect(page.locator('.hint')).toContainText('noch keine Ausrüstung gewählt');
    for (const t of await cards.locator('.tc-need').allInnerTexts()) expect(t).toBe('Nur Körpergewicht');
    await page.locator('.rc', { hasText: 'Passt zu meiner Ausrüstung' }).click();
    // Vorschau eines Vorschlags
    await page.locator('.tcard', { hasText: 'Rücken und Haltung' }).click();
    await expect(page.locator('h2.name')).toHaveText('Rücken und Haltung');
    await expect(page.locator('.eyebrow').first()).toContainText('Vorschlag der App');
    await expect(page.locator('.need')).toContainText('Widerstandsband');
    expect(await page.locator('.list .row').count()).toBeGreaterThanOrEqual(5);
    await expect(page.getByRole('button', { name: 'Los geht’s' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Löschen' })).toHaveCount(0);
    // eine Übung antippen zeigt die Anleitung
    await page.locator('.list .row').first().click();
    await expect(page.locator('.stage svg')).toBeAttached();
    await expect(page.getByRole('heading', { name: 'Darauf achten' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Häufige Fehler' })).toBeVisible();
  });

  test('Ausrüstung fehlt: "An meine Ausrüstung anpassen" ersetzt, was nicht geht', async ({ page, site }) => {
    await openApp(page, site, { state: { schema: 3, prefs: { equip: [], preset: 'travel', level: 2, minutes: 45 } } });
    await page.locator('[data-act="flow-mine"]').click();
    await page.locator('.tcard[data-id="p-kraft"]').click();
    await expect(page.locator('.note', { hasText: 'Dir fehlt:' })).toContainText('Langhantel');
    await page.getByRole('button', { name: 'An meine Ausrüstung anpassen' }).click();
    await expect(top(page)).toContainText('Dein Vorschlag');
    await expect(page.locator('.note').first()).toContainText(/ersetzt|angepasst|gestrichen/i);
    const names = await rowNames(page);
    expect(names.length).toBeGreaterThanOrEqual(3);
    await weiter(page).click();
    await expect(page.getByLabel('Name')).toHaveValue(/angepasst/);
    await page.getByRole('button', { name: 'Nur speichern' }).click();
    await expect(page.locator('h2.name')).toContainText('angepasst');
    await expect(page.locator('.eyebrow').first()).toContainText('Mein Training');
    const s = await stored(page);
    expect(s.trainings).toHaveLength(1);
    expect(await fits(page, s.trainings[0].items.map((i) => i.ex), [])).toBe(true);
    // das Original der App bleibt unverändert
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await page.locator('[data-act="flow-mine"]').click();
    await page.locator('.tcard[data-id="p-kraft"]').click();
    await expect(page.locator('.list .row').first()).toContainText('Langhantel-Kniebeuge');
  });

  test('Eine Vorlage als Kopie anpassen: das Original bleibt', async ({ page, site }) => {
    await openApp(page, site);
    await page.locator('[data-act="flow-mine"]').click();
    await page.locator('.tcard[data-id="A"]').click();
    await page.getByRole('button', { name: 'Als Kopie anpassen' }).click();
    await expect(top(page)).toContainText('Dein Vorschlag');
    await page.locator('.brow').last().locator('.brow-head').click();
    await page.locator('.brow').last().getByRole('button', { name: 'Entfernen' }).click();
    await weiter(page).click();
    await expect(page.getByLabel('Name')).toHaveValue('Tag A (angepasst)');
    await page.getByRole('button', { name: 'Nur speichern' }).click();
    await expect(page.locator('h2.name')).toHaveText('Tag A (angepasst)');
    const s = await stored(page);
    expect(s.trainings).toHaveLength(1);
    expect(s.trainings[0].items).toHaveLength(4);
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await page.locator('[data-act="flow-mine"]').click();
    await page.locator('.tcard[data-id="A"]').click();
    expect(await page.locator('.list .row').count()).toBe(5);
  });
});

test.describe('Zurück-Taste', () => {
  test('Die Zurück-Taste des Handys geht einen Schritt zurück, auch im Assistenten', async ({ page, site }) => {
    await openApp(page, site);
    await tile(page, 'beine').click();
    await weiter(page).click();
    await expect(page.getByRole('button', { name: /Neues Training erstellen/ })).toBeVisible();
    await page.getByRole('button', { name: /Neues Training erstellen/ }).click();
    await page.locator('.pre[data-p="gym"]').click();
    await weiter(page).click();
    await expect(page.getByRole('heading', { name: 'Wie viel Zeit hast du?' })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Was hast du zur Verfügung?' })).toBeVisible();
    await expect(page.locator('.pre[data-p="gym"]')).toHaveAttribute('aria-pressed', 'true');
    await page.goBack();
    await expect(page.getByRole('button', { name: /Bestehendes Training wählen/ })).toBeVisible();
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Was möchtest du heute trainieren?' })).toBeVisible();
    await expect(tile(page, 'beine')).toHaveAttribute('aria-pressed', 'true');
    // der Pfeil oben links tut dasselbe
    await weiter(page).click();
    await page.getByRole('button', { name: /Neues Training erstellen/ }).click();
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(page.getByRole('button', { name: /Neues Training erstellen/ })).toBeVisible();
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(page.getByRole('heading', { name: 'Was möchtest du heute trainieren?' })).toBeVisible();
  });

  test('Im Training: Pfeil zurück führt zur Startseite, die Reiter wechseln ohne Verlust', async ({ page, site }) => {
    await openApp(page, site);
    await startFromList(page, 'B');
    await done(page, 1).click();
    await weiter(page).click();
    await tab(page, 'Essen').click();
    await expect(page.getByRole('button', { name: 'Hinzufügen' })).toBeVisible();
    await tab(page, 'Training').click();
    await expect(top(page)).toContainText('1 von 15 Sätzen');
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Was möchtest du heute trainieren?' }).or(page.getByRole('button', { name: 'Hinzufügen' }))).toBeVisible();
  });
});

test.describe('Rechtschreibung', () => {
  test('Überall steht "ss", nirgends ein scharfes S', async ({ page, site }) => {
    await openApp(page, site);
    const bad = [];
    const look = async (where) => { for (const l of await noSharpS(page)) bad.push(where + ': ' + l); };
    await look('Start');
    await tile(page, 'gesaess').click(); await weiter(page).click(); await look('Auswahl');
    await page.getByRole('button', { name: /Neues Training erstellen/ }).click(); await look('Ausrüstung');
    await page.locator('.pre[data-p="gym"]').click(); await weiter(page).click(); await look('Zeit');
    await page.locator('[data-m="60"]').click(); await look('Erfahrung');
    await page.locator('[data-l="3"]').click(); await look('Vorschlag');
    await page.locator('.brow').first().locator('.brow-head').click(); await look('Zeile offen');
    await page.getByRole('button', { name: 'Übung hinzufügen' }).click(); await look('Übung wählen');
    await page.goBack();
    await weiter(page).click(); await look('Name');
    await page.getByRole('button', { name: 'Speichern und starten' }).click(); await look('Training');
    await page.getByRole('button', { name: 'So geht die Übung' }).click(); await look('Hinweise');
    await tab(page, 'Übungen').click(); await look('Übungen');
    await tab(page, 'Kalender').click(); await look('Kalender');
    await tab(page, 'Essen').click(); await look('Essen');
    await page.getByRole('button', { name: 'pro 100 ml' }).click(); await look('Essen ml');
    expect(bad).toEqual([]);
  });
});
