import { test, expect, openApp, stored, tab, startFromList, noSharpS, noTimes } from './fixtures.mjs';

const top = (page) => page.locator('header.top');
const weiter = (page) => page.getByRole('button', { name: 'Weiter', exact: true });
const done = (page, n) => page.getByRole('button', { name: 'Satz ' + n + ' geschafft', exact: true });
const tile = (page, g) => page.locator('.gt[data-g="' + g + '"]');
const rowNames = (page) => page.locator('.brow .brow-head b').allInnerTexts();
const place = (page, p) => page.locator('[data-act="wiz-place"][data-p="' + p + '"]');

/* what the app itself knows (the browser has the same Builder, library and equipment as the tests) */
const fits = (page, ids, equip) => page.evaluate(([i, e]) => i.every((id) => Builder.eqOK(EX[id], Builder.haveSet(e))), [ids, equip]);

/* the tab Erstellen, part "Training": choose areas and press "Neues Training erstellen" */
async function startAssistant(page, areas) {
  await tab(page, 'Erstellen').click();
  for (const a of areas) await tile(page, a).click();
  await page.locator('[data-act="mk-new"]').click();
  await expect(page.getByRole('heading', { name: 'Wo trainierst du?' })).toBeVisible();
}

test.describe('Meine Trainings', () => {
  test('Der erste Reiter zeigt Tag A, Tag B und nur selbst gemachte Trainings, jedes mit einem Tipp zu starten', async ({ page, site }) => {
    const items = [{ ex: 'x-squat', sets: 2 }, { ex: 'x-bridge', sets: 2 }, { ex: 'x-crunch', sets: 3 }];
    await openApp(page, site, { state: { schema: 3, trainings: [{ id: 'u1', name: 'Mein Test', items }, { id: 'u2', name: 'Zweites', items }] } });
    await expect(top(page).locator('h2.mt')).toHaveText('Meine Trainings');
    await expect(tab(page, 'Meine Trainings')).toHaveAttribute('aria-current', 'page');
    const names = await page.locator('.mrow .rn b').allInnerTexts();
    expect(names).toEqual(['Tag A', 'Tag B', 'Zweites', 'Mein Test']);                       // Tag A und B zuerst, dann die eigenen, neueste zuerst
    // keine Vorschläge der App in diesem Reiter
    expect(await page.locator('.tcard').count()).toBe(0);
    await expect(page.getByText('Vorschläge der App')).toHaveCount(0);
    // jede Zeile sagt, was sie trainiert und wie viele Übungen sie hat; keine Zeit
    await expect(page.locator('.mrow', { hasText: 'Tag A' })).toContainText('Kniebeuge + Hüfte + Push');
    await expect(page.locator('.mrow', { hasText: 'Tag A' })).toContainText('5 Übungen');
    await expect(page.locator('.mrow', { hasText: 'Mein Test' })).toContainText('3 Übungen');
    expect(await noTimes(page)).toEqual([]);
    // ein Tipp auf die Zeile startet
    await page.locator('.mrow', { hasText: 'Mein Test' }).locator('[data-act="flow-start"]').click();
    await expect(top(page)).toContainText('Mein Test');
    await expect(top(page)).toContainText('0 von 7 Sätzen');
    // das Auge zeigt die Übungen, dort lässt es sich ändern
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await page.locator('[data-act="tr-open"][data-id="u2"]').click();
    await expect(page.locator('h2.name')).toHaveText('Zweites');
    await expect(page.getByRole('button', { name: 'Bearbeiten' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Los geht’s' })).toBeVisible();
  });

  test('Ohne eigene Trainings steht ein Hinweis da, "Neues Training erstellen" führt zum Reiter Erstellen', async ({ page, site }) => {
    await openApp(page, site);
    await expect(page.locator('.mrow')).toHaveCount(2);
    await expect(page.locator('p.hint').first()).toContainText('Deine eigenen Trainings erscheinen hier');
    await page.getByRole('button', { name: 'Neues Training erstellen' }).click();
    await expect(tab(page, 'Erstellen')).toHaveAttribute('aria-current', 'page');
    await expect(page.getByRole('heading', { name: 'Was möchtest du heute trainieren?' })).toBeVisible();
  });
});

test.describe('Erstellen: Training und Übungen in einem Reiter', () => {
  test('Zwei Teile, ein Wechsel; der Reiter öffnet beim Training, merkt sich aber den letzten Teil', async ({ page, site }) => {
    await openApp(page, site);
    await tab(page, 'Erstellen').click();
    const seg = page.locator('.seg .chip');
    await expect(seg).toHaveText(['Training', 'Übungen']);
    await expect(page.getByRole('button', { name: 'Training', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.getByRole('heading', { name: 'Was möchtest du heute trainieren?' })).toBeVisible();
    await page.getByRole('button', { name: 'Übungen', exact: true }).click();
    await expect(page.locator('#lib-q')).toBeVisible();
    await expect(page.getByRole('button', { name: 'Alle Übungen' })).toBeVisible();
    await expect(page.getByRole('button', { name: 'Übungen', exact: true })).toHaveAttribute('aria-pressed', 'true');
    // anderer Reiter und zurück: wieder bei den Übungen
    await tab(page, 'Kalender').click();
    await tab(page, 'Erstellen').click();
    await expect(page.locator('#lib-q')).toBeVisible();
    // noch einmal auf den Reiter tippen: zurück zum Anfang des Teils
    await page.locator('[data-act="lib-all"]').click();
    await expect(top(page).locator('h2.mt')).toHaveText('Alle Übungen');
    await tab(page, 'Erstellen').click();
    await expect(page.locator('#lib-q')).toBeVisible();
    await page.getByRole('button', { name: 'Training', exact: true }).click();
    await expect(page.getByRole('heading', { name: 'Was möchtest du heute trainieren?' })).toBeVisible();
  });
});

test.describe('Neues Training', () => {
  test('Von der Frage bis zum Start: Bereiche, ein Tipp auf den Ort, Anpassen, Wiederholungen, Entfernen, Speichern, Training läuft', async ({ page, site }) => {
    await openApp(page, site);
    await tab(page, 'Erstellen').click();
    await expect(page.getByRole('heading', { name: 'Was möchtest du heute trainieren?' })).toBeVisible();
    // ohne Auswahl geht es nicht weiter, mehrere Bereiche gehen
    const create = page.locator('[data-act="mk-new"]');
    await expect(create).toBeDisabled();
    await tile(page, 'beine').click();
    await tile(page, 'gesaess').click();
    await expect(tile(page, 'beine')).toHaveAttribute('aria-pressed', 'true');
    await expect(tile(page, 'arme')).toHaveAttribute('aria-pressed', 'false');
    await expect(create).toBeEnabled();
    await create.click();

    // eine einzige Frage: wo trainierst du? Weder Zeit noch Stufe.
    await expect(page.getByRole('heading', { name: 'Wo trainierst du?' })).toBeVisible();
    await expect(top(page)).toContainText('Beine und Gesäss');
    await expect(page.locator('[data-act="wiz-place"]')).toHaveText([/Fitnessstudio/, /Homegym/, /Ohne Ausrüstung/]);
    await expect(page.getByText(/Schritt \d von/)).toHaveCount(0);
    expect(await noTimes(page)).toEqual([]);
    await place(page, 'homegym').click();

    // der Vorschlag steht sofort da: zwei Bereiche ergeben sechs Übungen, jede mit drei Sätzen
    await expect(top(page)).toContainText('Dein Vorschlag');
    await expect(top(page)).toContainText('6 Übungen · 18 Sätze');
    expect(await noTimes(page)).toEqual([]);
    const rows = page.locator('.brow');
    const n0 = await rows.count();
    expect(n0).toBe(6);

    // 1. Zeile öffnen: Sätze, Wiederholungen (drei Bereiche, plus und minus), Pause
    await rows.first().locator('.brow-head').click();
    await expect(rows.first()).toHaveClass(/open/);
    await rows.first().getByRole('button', { name: /Sätze mehr/ }).click();
    await expect(rows.first().locator('.brow-head small')).toContainText('4 ×');
    await expect(rows.first().getByRole('group', { name: 'Übliche Bereiche' }).getByRole('button')).toHaveText(['6–8', '8–10', '8–12']);
    await rows.first().getByRole('button', { name: '6–8', exact: true }).click();
    await expect(rows.first().locator('.brow-head small')).toContainText('4 × 6–8');
    await expect(rows.first().getByRole('button', { name: '6–8', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await rows.first().getByRole('button', { name: 'Wiederholungen mehr' }).click();
    await expect(rows.first().locator('.brow-head small')).toContainText('4 × 7–9');
    await expect(rows.first().locator('.step .cnt').nth(1)).toContainText('7–9');
    await expect(rows.first().getByRole('button', { name: '6–8', exact: true })).toHaveAttribute('aria-pressed', 'false');     // 7–9 ist keiner der drei Bereiche
    await rows.first().getByRole('button', { name: 'Wiederholungen weniger' }).click();
    await rows.first().getByRole('button', { name: 'Wiederholungen weniger' }).click();
    await expect(rows.first().locator('.brow-head small')).toContainText('4 × 5–7');
    await rows.first().getByRole('button', { name: /Pause mehr/ }).click();

    // 2. Zeile tauschen
    await rows.nth(1).locator('.brow-head').click();
    const second = (await rows.nth(1).locator('.brow-head b').innerText());
    await rows.nth(1).getByRole('button', { name: 'Tauschen' }).click();
    await expect(top(page)).toContainText('Übung tauschen');
    await page.locator('[data-act="pick-add"]').first().click();
    await expect(top(page)).toContainText('Dein Vorschlag');
    expect(await rows.count()).toBe(n0);
    expect(await rows.nth(1).locator('.brow-head b').innerText()).not.toBe(second);

    // eine Übung mit dem Papierkorb entfernen, "Rückgängig" holt sie zurück
    const lastName = await rows.last().locator('.brow-head b').innerText();
    await rows.last().getByRole('button', { name: lastName + ' entfernen' }).click();
    expect(await rows.count()).toBe(n0 - 1);
    await expect(page.locator('.note.undo')).toContainText('Übung entfernt.');
    await expect(top(page)).toContainText(`${n0 - 1} Übungen`);
    await page.getByRole('button', { name: 'Rückgängig' }).click();
    expect(await rows.count()).toBe(n0);
    expect(await rows.last().locator('.brow-head b').innerText()).toBe(lastName);
    // jetzt wirklich entfernen und eine aus dem Bauch-Bereich hinzufügen
    await rows.last().getByRole('button', { name: lastName + ' entfernen' }).click();
    expect(await rows.count()).toBe(n0 - 1);
    await page.getByRole('button', { name: 'Übung hinzufügen' }).click();
    await page.locator('[data-act="pick-group"][data-g="bauch"]').click();
    await expect(page.locator('[data-act="pick-group"][data-g="bauch"]')).toHaveAttribute('aria-pressed', 'true');
    await page.locator('[data-act="pick-add"]').first().click();
    expect(await rows.count()).toBe(n0);

    // weiter: Namen vergeben, speichern und starten
    await weiter(page).click();
    await expect(page.getByRole('heading', { name: 'Wie soll dein Training heissen?' })).toBeVisible();
    const name = page.getByLabel('Name');
    await expect(name).toHaveValue('Beine & Gesäss');                         // der Vorschlag nennt die Bereiche, keine Zeit
    await expect(page.getByText('Du findest es danach unter „Meine Trainings“.')).toBeVisible();
    await name.fill('Mein Beintag');
    await page.getByRole('button', { name: 'Speichern und starten' }).click();
    await expect(top(page)).toContainText('Mein Beintag');
    await expect(top(page)).toContainText('0 von ' + (await page.locator('.list .row').count()) + ' Übungen');
    await expect(tab(page, 'Meine Trainings')).toHaveAttribute('aria-current', 'page');

    const s = await stored(page);
    expect(s.schema).toBe(3);
    expect(s.trainings).toHaveLength(1);
    expect(s.trainings[0].name).toBe('Mein Beintag');
    expect(s.trainings[0].items).toHaveLength(n0);
    expect(s.trainings[0].items[0].sets).toBe(4);
    expect(s.trainings[0].items[0].reps).toBe('5–7');
    expect(s.cur).toBe(s.trainings[0].id);
    expect(s.prefs).toEqual({ equip: ['kh', 'lh', 'kb', 'bank', 'box', 'stange', 'trx', 'band'] });         // nur der Ort wird gemerkt, keine Zeit, keine Stufe
    expect(await fits(page, s.trainings[0].items.map((i) => i.ex), s.prefs.equip)).toBe(true);
    expect(s.trainings[0].items.every((i) => (i.reps === undefined) || /^\d+–\d+$/.test(i.reps))).toBe(true);
    // die Laufansicht zeigt die eigene Wiederholungszahl
    await expect(page.locator('.rx')).toContainText('4 × 5–7');

    // ein Satz, dann zurück: das angefangene Training wird angeboten und steht unter "Meine Trainings"
    await done(page, 1).click();
    await weiter(page).click();
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(page.locator('.card.go')).toContainText('Mein Beintag');
    await page.getByRole('button', { name: 'Weitermachen' }).click();
    await expect(top(page)).toContainText('1 von');
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(page.locator('.mrow', { hasText: 'Mein Beintag' })).toBeVisible();
    expect(await page.locator('.mrow .rn b').allInnerTexts()).toEqual(['Tag A', 'Tag B', 'Mein Beintag']);
  });

  test('Einzelne Geräte wählen: kein Ort angetippt, nur die gewählten Geräte kommen vor', async ({ page, site }) => {
    await openApp(page, site);
    await startAssistant(page, ['brust', 'schultern']);
    await expect(page.getByRole('button', { name: 'Training vorschlagen' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Einzelne Geräte wählen' }).click();
    await expect(page.getByRole('button', { name: 'Körpergewicht', exact: true })).toBeDisabled();
    await page.getByRole('button', { name: 'Kurzhanteln' }).click();
    await page.getByRole('button', { name: 'Bank', exact: true }).click();
    await expect(page.getByRole('button', { name: 'Kurzhanteln' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'Training vorschlagen' }).click();
    await expect(top(page)).toContainText('Dein Vorschlag');
    const s0 = await stored(page);
    expect([...s0.prefs.equip].sort()).toEqual(['bank', 'kh']);
    await page.getByRole('button', { name: 'Weiter', exact: true }).click();
    await page.getByRole('button', { name: 'Nur speichern' }).click();
    const s = await stored(page);
    expect(await fits(page, s.trainings[0].items.map((i) => i.ex), ['kh', 'bank'])).toBe(true);
    expect(s.trainings[0].items.length).toBeGreaterThanOrEqual(5);
    // der Ort steht beim nächsten Mal als zuletzt gewählt da? Nein: Kurzhanteln + Bank ist keiner der drei Orte, also ist keiner markiert
    await startAssistant(page, ['arme']);
    for (const p of ['gym', 'homegym', 'none']) await expect(place(page, p)).toHaveAttribute('aria-pressed', 'false');
    await place(page, 'gym').click();
    await page.goBack();
    await expect(place(page, 'gym')).toHaveAttribute('aria-pressed', 'true');                  // der zuletzt gewählte Ort ist markiert
  });

  test('Wiederholungen: drei Bereiche, Minus und Plus mit Grenzen, auch für Trainings mit einer einzelnen Zahl', async ({ page, site }) => {
    const items = [{ ex: 'x-squat', sets: 2, reps: '10' }, { ex: 'x-pike', sets: 2 }, { ex: 'a-plank', sets: 2 }, { ex: 'x-lunge', sets: 2, reps: '1–3' }];
    await openApp(page, site, { state: { schema: 3, trainings: [{ id: 'u1', name: 'Zahlen', items }] } });
    await page.locator('[data-act="tr-open"][data-id="u1"]').click();
    await page.getByRole('button', { name: 'Bearbeiten' }).click();
    const rows = page.locator('.brow');
    const meta = (i) => rows.nth(i).locator('.brow-head small');
    const less = (i) => rows.nth(i).getByRole('button', { name: 'Wiederholungen weniger' });
    const more = (i) => rows.nth(i).getByRole('button', { name: 'Wiederholungen mehr' });
    // einzelne Zahl bleibt eine Zahl
    await rows.nth(0).locator('.brow-head').click();
    await expect(meta(0)).toContainText('2 × 10');
    await more(0).click();
    await expect(meta(0)).toContainText('2 × 11 ');
    await less(0).click(); await less(0).click();
    await expect(meta(0)).toContainText('2 × 9 ');
    // Übung mit eigenem Standard: Pike-Liegestütze beginnen bei 6–8, die Taste 6–8 ist gedrückt
    await rows.nth(1).locator('.brow-head').click();
    await expect(meta(1)).toContainText('2 × 6–8');
    await expect(rows.nth(1).getByRole('button', { name: '6–8', exact: true })).toHaveAttribute('aria-pressed', 'true');
    await rows.nth(1).getByRole('button', { name: '8–12', exact: true }).click();
    await expect(meta(1)).toContainText('2 × 8–12');
    // eine Haltezeit-Übung hat keine Wiederholungen, dafür die Haltezeit
    await rows.nth(2).locator('.brow-head').click();
    await expect(rows.nth(2).getByRole('button', { name: 'Wiederholungen mehr' })).toHaveCount(0);
    await expect(rows.nth(2).getByRole('group', { name: 'Haltezeit' })).toBeVisible();
    // untere Grenze: 1–3 lässt sich nicht weiter senken
    await rows.nth(3).locator('.brow-head').click();
    await expect(less(3)).toBeDisabled();
    await expect(more(3)).toBeEnabled();
    await more(3).click();
    await expect(meta(3)).toContainText('2 × 2–4');
    await less(3).click();
    await expect(meta(3)).toContainText('2 × 1–3');
    await expect(less(3)).toBeDisabled();
    // speichern, die Zahlen bleiben
    await page.getByRole('button', { name: 'Speichern', exact: true }).click();
    const s = await stored(page);
    expect(s.trainings[0].items.map((i) => i.reps)).toEqual(['9', '8–12', undefined, '1–3']);
    await page.locator('[data-act="pv-start"]').click();
    await expect(page.locator('.rx')).toContainText('2 × 9');
  });

  test('Eigene Trainings bearbeiten: Namen mit Sonderzeichen, Löschen und Zurückholen, der Kalender behält den alten Namen', async ({ page, site }) => {
    const items = [{ ex: 'x-squat', sets: 2 }, { ex: 'x-bridge', sets: 2 }, { ex: 'x-crunch', sets: 3 }];
    await openApp(page, site, { state: { schema: 3, trainings: [{ id: 'u1', name: 'Mein Test', items }], log: { '2026-10-01': [{ day: 'u1', title: 'Mein Test', targets: { 'x-squat': 2, 'x-bridge': 2, 'x-crunch': 3 }, sets: { 'x-squat': 2 }, weights: {}, note: '' }] } } });
    await expect(page.locator('.mrow', { hasText: 'Mein Test' })).toBeVisible();
    await page.locator('[data-act="tr-open"][data-id="u1"]').click();
    await expect(page.locator('.eyebrow').first()).toHaveText(/Mein Training/i);
    await expect(page.locator('.need')).toContainText('nur dein Körpergewicht');
    // Bearbeiten mit einem Namen, der nichts anrichten darf
    await page.getByRole('button', { name: 'Bearbeiten' }).click();
    await expect(top(page)).toContainText('Training bearbeiten');
    await page.getByLabel('Name des Trainings').fill('<img src=x onerror="window.pwned=1"> Beine & "Po"');
    await page.getByRole('button', { name: 'Speichern', exact: true }).click();
    await expect(page.locator('h2.name')).toContainText('Beine & "Po"');
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(page.locator('.mrow', { hasText: 'Beine & "Po"' })).toBeVisible();
    await expect(page.locator('main img')).toHaveCount(0);
    expect(await page.evaluate(() => window.pwned)).toBeUndefined();
    expect((await stored(page)).trainings[0].name).toContain('<img src=x');
    // Löschen mit Rückgängig
    await page.locator('[data-act="tr-open"][data-id="u1"]').click();
    await page.getByRole('button', { name: 'Löschen' }).click();
    await expect(page.locator('.note.undo')).toContainText('Training gelöscht.');
    expect((await stored(page)).trainings).toHaveLength(0);
    await expect(page.locator('.mrow')).toHaveCount(2);
    await page.getByRole('button', { name: 'Rückgängig' }).click();
    await expect(page.locator('.mrow', { has: page.locator('[data-id="u1"]') })).toBeVisible();
    expect((await stored(page)).trainings).toHaveLength(1);
    // endgültig löschen: der Kalender behält seinen Eintrag mit dem alten Namen
    await page.locator('[data-act="tr-open"][data-id="u1"]').click();
    await page.getByRole('button', { name: 'Löschen' }).click();
    await tab(page, 'Kalender').click();
    await page.locator('button.cd[data-key="2026-10-01"]').click();
    await expect(page.locator('.entry-head')).toContainText('Mein Test');
    await expect(page.locator('.entry-head')).toContainText('2 von 7 Sätzen');
  });

  test('Kleiner Start und "Überrasch mich": nur ein paar Übungen, ohne Zeitangabe', async ({ page, site }) => {
    await openApp(page, site);
    await tab(page, 'Erstellen').click();
    await page.locator('[data-act="flow-quick"]').click();
    // beim ersten Mal wird nach dem Ort gefragt
    await expect(top(page)).toContainText('Kleiner Start');
    await place(page, 'none').click();
    await expect(top(page)).toContainText('Dein Vorschlag');
    await expect(top(page)).toContainText('4 Übungen · 8 Sätze');
    expect(await noTimes(page)).toEqual([]);
    expect(await page.locator('.brow').count()).toBe(4);
    await weiter(page).click();
    await expect(page.getByLabel('Name')).toHaveValue('Ganzkörper');
    await page.getByRole('button', { name: 'Speichern und starten' }).click();
    await expect(page.locator('h2.name').first()).toBeVisible();
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    // der Ort ist bekannt: "Überrasch mich" zeigt den Vorschlag sofort
    await tab(page, 'Erstellen').click();
    await page.locator('[data-act="flow-surprise"]').click();
    await expect(top(page)).toContainText('Dein Vorschlag');
    expect(await page.locator('.brow').count()).toBeGreaterThanOrEqual(2);
    const ids = await page.locator('.brow-head').evaluateAll((els) => els.map((e) => e.getAttribute('data-ex')));
    expect(await fits(page, ids, [])).toBe(true);                                // ohne Ausrüstung nur Übungen ohne Ausrüstung
    expect((await stored(page)).prefs.equip).toEqual([]);
    // Name: Ganzkörper gibt es schon, also kommt eine Zahl dazu
    await tab(page, 'Erstellen').click();
    await page.locator('[data-act="flow-quick"]').click();
    await weiter(page).click();
    await expect(page.getByLabel('Name')).toHaveValue('Ganzkörper 2');
  });
});

test.describe('Vorschläge der App', () => {
  test('Bereich wählen, Vorschläge ansehen: Filter, Vorschau, ohne Zeitangaben', async ({ page, site }) => {
    await openApp(page, site);
    await tab(page, 'Erstellen').click();
    await tile(page, 'ruecken').click();
    await page.locator('[data-act="mk-existing"]').click();
    await expect(top(page)).toContainText('Vorschläge der App');
    await expect(top(page)).toContainText('Rücken');
    const sel = page.locator('.rc', { hasText: 'Nur Rücken' });
    await expect(sel).toHaveAttribute('aria-pressed', 'true');
    const cards = page.locator('.tcard');
    const n = await cards.count();
    expect(n).toBeGreaterThanOrEqual(4);
    for (const t of await cards.locator('.tc-top small').allInnerTexts()) expect(t).toMatch(/^\d+ Übungen/);
    expect(await noTimes(page)).toEqual([]);
    // Tag A und Tag B sind keine Vorschläge der App, sie stehen unter "Meine Trainings"
    await expect(page.locator('.tcard[data-id="A"], .tcard[data-id="B"]')).toHaveCount(0);
    await expect(page.locator('p.hint', { hasText: 'Ein Vorschlag lässt sich als Kopie anpassen' })).toBeVisible();
    // alle zeigen
    await sel.click();
    await expect(page.locator('.rc', { hasText: 'Alle Bereiche zeigen' })).toHaveAttribute('aria-pressed', 'false');
    expect(await cards.count()).toBeGreaterThan(n);
    // "passt zu meiner Ausrüstung": ohne Angabe nur Körpergewicht
    await page.locator('.rc', { hasText: 'Passt zu meiner Ausrüstung' }).click();
    await expect(page.locator('.hint').first()).toContainText('noch keine Ausrüstung gewählt');
    for (const t of await cards.locator('.tc-need').allInnerTexts()) expect(t).toBe('Nur Körpergewicht');
    await page.locator('.rc', { hasText: 'Passt zu meiner Ausrüstung' }).click();
    // Vorschau eines Vorschlags
    await page.locator('.tcard', { hasText: 'Rücken und Haltung' }).click();
    await expect(page.locator('h2.name')).toHaveText('Rücken und Haltung');
    await expect(page.locator('.eyebrow').first()).toContainText('Vorschlag der App');
    await expect(page.locator('.need')).toContainText('Widerstandsband');
    await expect(page.locator('.rx')).toContainText(/^\d+\s*Übungen · \d+ Sätze$/);
    expect(await noTimes(page)).toEqual([]);
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
    await openApp(page, site, { state: { schema: 3, prefs: { equip: [] } } });
    await tab(page, 'Erstellen').click();
    await page.locator('[data-act="mk-existing"]').click();
    await page.locator('.tcard[data-id="p-kraft"]').click();
    await expect(page.locator('.note', { hasText: 'Dir fehlt:' })).toContainText('Langhantel');
    await page.getByRole('button', { name: 'An meine Ausrüstung anpassen' }).click();
    await expect(top(page)).toContainText('Dein Vorschlag');
    await expect(page.locator('.note').first()).toContainText(/ersetzt|angepasst|entfernt/i);
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
    await tab(page, 'Erstellen').click();
    await page.locator('[data-act="mk-existing"]').click();
    await page.locator('.tcard[data-id="p-kraft"]').click();
    await expect(page.locator('.list .row').first()).toContainText('Langhantel-Kniebeuge');
  });

  test('Tag A als Kopie anpassen: das Original bleibt, die Kopie steht unter "Meine Trainings"', async ({ page, site }) => {
    await openApp(page, site);
    await page.locator('[data-act="tr-open"][data-id="A"]').click();
    await expect(page.locator('.eyebrow').first()).toContainText('Mein Training');
    await page.getByRole('button', { name: 'Als Kopie anpassen' }).click();
    await expect(top(page)).toContainText('Dein Vorschlag');
    const lastName = await page.locator('.brow').last().locator('.brow-head b').innerText();
    await page.locator('.brow').last().getByRole('button', { name: lastName + ' entfernen' }).click();
    await weiter(page).click();
    await expect(page.getByLabel('Name')).toHaveValue('Tag A (angepasst)');
    await page.getByRole('button', { name: 'Nur speichern' }).click();
    await expect(page.locator('h2.name')).toHaveText('Tag A (angepasst)');
    const s = await stored(page);
    expect(s.trainings).toHaveLength(1);
    expect(s.trainings[0].items).toHaveLength(4);
    expect(s.trainings[0].items.find((i) => i.ex === 'a-tri').reps).toBe('10–15');           // Tag A behält seine Zahlen aus dem ersten Plan
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(page.locator('.mrow .rn b')).toHaveText(['Tag A', 'Tag B', 'Tag A (angepasst)']);
    await page.locator('[data-act="tr-open"][data-id="A"]').click();
    expect(await page.locator('.list .row').count()).toBe(5);
  });
});

test.describe('Zurück-Taste', () => {
  test('Die Zurück-Taste des Handys geht einen Schritt zurück, auch im Assistenten', async ({ page, site }) => {
    await openApp(page, site);
    await tab(page, 'Erstellen').click();
    await tile(page, 'beine').click();
    await page.locator('[data-act="mk-new"]').click();
    await expect(page.getByRole('heading', { name: 'Wo trainierst du?' })).toBeVisible();
    await place(page, 'gym').click();
    await expect(top(page)).toContainText('Dein Vorschlag');
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Wo trainierst du?' })).toBeVisible();
    await expect(place(page, 'gym')).toHaveAttribute('aria-pressed', 'true');
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Was möchtest du heute trainieren?' })).toBeVisible();
    await expect(tile(page, 'beine')).toHaveAttribute('aria-pressed', 'true');
    // der Pfeil oben links tut dasselbe
    await page.locator('[data-act="mk-new"]').click();
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(page.getByRole('heading', { name: 'Was möchtest du heute trainieren?' })).toBeVisible();
    // Vorschläge ansehen und zurück
    await page.locator('[data-act="mk-existing"]').click();
    await expect(top(page)).toContainText('Vorschläge der App');
    await page.goBack();
    await expect(page.getByRole('heading', { name: 'Was möchtest du heute trainieren?' })).toBeVisible();
    // Übungen: Alle Übungen, eine Übung, und zurück
    await page.getByRole('button', { name: 'Übungen', exact: true }).click();
    await page.locator('[data-act="lib-all"]').click();
    await page.locator('[data-act="lib-open"]').first().click();
    await expect(page.getByRole('heading', { name: 'Darauf achten' })).toBeVisible();
    await page.goBack();
    await expect(top(page).locator('h2.mt')).toHaveText('Alle Übungen');
    await page.goBack();
    await expect(page.locator('#lib-q')).toBeVisible();
  });

  test('Im Training: Pfeil zurück führt zur Liste, die Reiter wechseln ohne Verlust', async ({ page, site }) => {
    await openApp(page, site);
    await startFromList(page, 'B');
    await done(page, 1).click();
    await weiter(page).click();
    await tab(page, 'Essen').click();
    await expect(page.getByRole('button', { name: 'Hinzufügen' })).toBeVisible();
    await tab(page, 'Meine Trainings').click();
    await expect(top(page)).toContainText('1 von 15 Sätzen');
    // auch ein Blick in die Übungen mitten im Training: danach geht es an derselben Stelle weiter
    await tab(page, 'Erstellen').click();
    await page.getByRole('button', { name: 'Übungen', exact: true }).click();
    await expect(page.locator('#lib-q')).toBeVisible();
    await tab(page, 'Meine Trainings').click();
    await expect(top(page)).toContainText('1 von 15 Sätzen');
    await expect(done(page, 2)).toBeVisible();
    // Pfeil oben links: zurück zur Liste
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(page.locator('.mrow')).toHaveCount(2);
    await expect(page.locator('.card.go')).toContainText('Tag B');
    // ein erneuter Tipp auf den Reiter bleibt in der Liste
    await tab(page, 'Meine Trainings').click();
    await expect(page.locator('.mrow')).toHaveCount(2);
  });
});

test.describe('Rechtschreibung und Zeitangaben', () => {
  test('Überall steht "ss", nirgends ein scharfes S, nirgends eine Zeitangabe', async ({ page, site }) => {
    await openApp(page, site);
    const bad = [], times = [];
    const look = async (where) => {
      for (const l of await noSharpS(page)) bad.push(where + ': ' + l);
      for (const l of await noTimes(page)) times.push(where + ': ' + l);
    };
    await look('Meine Trainings');
    await tab(page, 'Erstellen').click(); await look('Erstellen');
    await tile(page, 'gesaess').click(); await page.locator('[data-act="mk-existing"]').click(); await look('Vorschläge');
    await page.locator('.tcard').first().click(); await look('Vorschau');
    await page.goBack(); await page.goBack();
    await page.locator('[data-act="mk-new"]').click(); await look('Ort');
    await page.getByRole('button', { name: 'Einzelne Geräte wählen' }).click(); await look('Geräte');
    await page.getByRole('button', { name: 'Einzelne Geräte schliessen' }).click();
    await place(page, 'gym').click(); await look('Vorschlag');
    await page.locator('.brow').first().locator('.brow-head').click(); await look('Zeile offen');
    await page.getByRole('button', { name: 'Übung hinzufügen' }).click(); await look('Übung wählen');
    await page.goBack();
    await weiter(page).click(); await look('Name');
    await page.getByRole('button', { name: 'Speichern und starten' }).click(); await look('Training');
    await page.getByRole('button', { name: 'So geht die Übung' }).click(); await look('Hinweise');
    await tab(page, 'Erstellen').click(); await page.getByRole('button', { name: 'Übungen', exact: true }).click(); await look('Übungen');
    await page.locator('[data-act="lib-all"]').click(); await look('Alle Übungen');
    await tab(page, 'Kalender').click(); await look('Kalender');
    await tab(page, 'Essen').click(); await look('Essen');
    await page.getByRole('button', { name: 'pro 100 ml' }).click(); await look('Essen ml');
    await page.getByRole('button', { name: 'Bisherige Lebensmittel' }).click(); await look('Bisherige Lebensmittel');
    expect(bad).toEqual([]);
    expect(times).toEqual([]);
  });
});
