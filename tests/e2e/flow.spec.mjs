import { test, expect, openApp, stored, tab, startFromList, noSharpS, TODAY } from './fixtures.mjs';

const done = (page, n) => page.getByRole('button', { name: 'Satz ' + n + ' geschafft', exact: true });
const next = (page) => page.getByRole('button', { name: 'Weiter', exact: true });
const top = (page) => page.locator('header.top');

/* ticks off `n` sets of the current exercise; every set but the very last of the day shows the pause card first */
async function sets(page, n, { skipLast = true } = {}) {
  for (let i = 1; i <= n; i++) {
    await done(page, i).click();
    if (i < n || skipLast) await next(page).click();
  }
}

async function plank(page, secs = 45) {
  await page.getByRole('button', { name: 'Plank starten' }).click();
  await expect(page.locator('#plank-label')).toHaveText('Position einnehmen');
  await expect(page.locator('#plank-time')).toHaveText('5');
  await page.clock.runFor(5000 + 300);
  await expect(page.locator('#plank-label')).toHaveText('Halten');
  await page.clock.runFor(secs * 1000 / 2);
  const mid = Number(await page.locator('#plank-time').innerText());
  expect(mid).toBeGreaterThan(secs / 2 - 3);
  expect(mid).toBeLessThanOrEqual(Math.ceil(secs / 2));
  await page.clock.runFor(secs * 1000 / 2 + 500);
}

test.describe('Training', () => {
  test('Tag A komplett: Strichliste, Pause mit +30 s und Rückgängig, Gewicht, Plank, Fertig, Kalender', async ({ page, site }) => {
    await openApp(page, site);
    await startFromList(page, 'A');
    const head = top(page);
    await expect(head).toContainText('Tag A');
    await expect(head).toContainText('0 von 15 Sätzen');
    await expect(head).toContainText('0 von 5 Übungen');

    // 1 Box-Kniebeugen: Angaben, Satz abhaken, Pause, +30 s, Rückgängig
    await expect(page.locator('h2.name')).toHaveText('Box-Kniebeugen');
    await expect(page.locator('.rx')).toContainText('3 × 8–10');
    await expect(page.locator('.gear')).toHaveText('Langhantel');
    await expect(page.locator('.note', { hasText: 'Knie:' })).toBeVisible();
    await done(page, 1).click();
    await expect(page.locator('.card.rest')).toBeVisible();
    await expect(page.locator('#rest-title')).toHaveText('Pause');
    await expect(page.locator('#rest-clock')).toHaveText(/^1:(30|29)$/);
    await expect(page.locator('.next')).toContainText('Satz 2 von 3');
    await page.getByRole('button', { name: '+ 30 s' }).click();
    await expect(page.locator('#rest-clock')).toHaveText(/^(1:59|2:00)$/);
    await page.getByRole('button', { name: 'Rückgängig' }).click();
    await expect(done(page, 1)).toBeVisible();
    await expect(head).toContainText('0 von 15 Sätzen');
    // Pause läuft ab: mit der Uhr vorspulen
    await done(page, 1).click();
    await page.clock.runFor(91_000);
    await expect(page.locator('#rest-title')).toHaveText('Pause vorbei');
    await next(page).click();
    await done(page, 2).click();
    await next(page).click();
    await done(page, 3).click();
    await expect(page.locator('#rest-title')).toHaveText('Übung geschafft · Pause');
    await expect(page.locator('.next')).toContainText('Hip Thrust');
    await expect(page.locator('.next')).toContainText('3 × 8–12');
    await next(page).click();

    // 2 Hip Thrust: neue Übung mit Gewichtsfeld, Knie- und Zusatzhinweis
    await expect(page.locator('h2.name')).toHaveText('Hip Thrust');
    await expect(page.locator('.gear')).toHaveText('Langhantel mit Polster oder Kurzhantel');
    await expect(page.locator('.note', { hasText: 'Knie:' })).toBeVisible();
    await expect(page.locator('.note', { hasText: '6 Sätze' })).toContainText('Physio oder MTT');
    await page.getByLabel('Gewicht (kg)').fill('60');
    expect((await stored(page)).weights['a-hip']).toBe('60');
    await sets(page, 3);

    // 3 Liegestütze, 4 TRX-Trizepsstrecken
    await expect(page.locator('h2.name')).toHaveText('Liegestütze');
    await expect(page.locator('.rx')).toContainText('3 × max.');
    await sets(page, 3);
    await expect(page.locator('h2.name')).toHaveText('TRX-Trizepsstrecken');
    await expect(page.locator('.gear')).toHaveText('TRX');
    await sets(page, 3);

    // 5 Plank: 60 s wählen, dreimal mit Vorlauf und Haltezeit
    await expect(page.locator('h2.name')).toHaveText('Plank');
    await page.getByRole('button', { name: '60 s' }).click();
    await expect(page.locator('.rx')).toContainText('3 × 60 s');
    expect((await stored(page)).holdSecs['a-plank']).toBe(60);
    await plank(page, 60);
    await expect(page.locator('#rest-title')).toHaveText('Pause');
    await next(page).click();
    await plank(page, 60);
    await next(page).click();
    await plank(page, 60);

    // Fertig
    await expect(page.locator('h2.name')).toHaveText('Fertig für heute');
    await expect(page.locator('.rx')).toContainText('15 von 15');
    await expect(head).toContainText('erledigt');
    await expect(page.locator('.note', { hasText: 'Knie-Check' })).toBeVisible();
    await page.getByRole('button', { name: 'Training in Kalender eintragen' }).click();
    await expect(page.locator('#cal-date')).toHaveValue(TODAY);
    await expect(page.locator('#cal-date')).toHaveAttribute('max', TODAY);
    // ein Datum in der Zukunft wird abgelehnt
    await page.locator('#cal-date').fill('2026-10-06');
    await page.getByRole('button', { name: 'Eintragen', exact: true }).click();
    await expect(page.locator('#cal-msg')).toHaveText('Bitte ein Datum bis heute wählen.');
    await page.locator('#cal-date').fill(TODAY);
    await page.getByRole('button', { name: 'Eintragen', exact: true }).click();
    await expect(page.locator('.note', { hasText: 'Eingetragen:' })).toHaveText('Eingetragen: Tag A am Montag, 5. Oktober 2026.');

    const s = await stored(page);
    expect(s.schema).toBe(3);
    expect(s.log[TODAY]).toHaveLength(1);
    expect(s.log[TODAY][0]).toMatchObject({ day: 'A', title: 'Tag A', sets: { 'a-box': 3, 'a-hip': 3, 'a-push': 3, 'a-tri': 3, 'a-plank': 3 }, weights: { 'a-hip': '60' }, note: '' });
    expect(s.log[TODAY][0].targets).toEqual({ 'a-box': 3, 'a-hip': 3, 'a-push': 3, 'a-tri': 3, 'a-plank': 3 });

    await page.getByRole('button', { name: 'Kalender ansehen' }).click();
    await expect(page.locator('h2.mt')).toHaveText('Oktober 2026');
    await expect(page.locator('.entry-head')).toContainText('15 von 15 Sätzen');
    await expect(page.locator('button.cd.today .tg')).toHaveText('A');
  });

  test('Tag B komplett, Wechsel zwischen den Trainings und Zurücksetzen', async ({ page, site }) => {
    await openApp(page, site);
    await startFromList(page, 'B');
    await expect(top(page)).toContainText('Tag B');
    await expect(top(page)).toContainText('0 von 15 Sätzen');
    const names = ['Rumänisches Kreuzheben', 'TRX-Rudern', 'TRX-Ausfallschritte rückwärts', 'Bizeps-Curls', 'TRX-Crunches'];
    for (let i = 0; i < names.length; i++) {
      await expect(page.locator('h2.name')).toHaveText(names[i]);
      await expect(page.locator('.eyebrow').first()).toContainText('Übung ' + (i + 1) + ' von 5');
      if (i === 0) await page.getByLabel('Gewicht (kg)').fill('40');
      await sets(page, 3, { skipLast: i < names.length - 1 });
    }
    await expect(page.locator('h2.name')).toHaveText('Fertig für heute');
    // Tag A ist unberührt, die Haken von Tag B bleiben erhalten: zurück zur Liste, Tag A starten
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(page.locator('h2.mt')).toHaveText('Meine Trainings');
    await startFromList(page, 'A');
    await expect(top(page)).toContainText('0 von 15 Sätzen');
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await startFromList(page, 'B');
    await expect(page.locator('h2.name')).toHaveText('Fertig für heute');
    // ein einzelner Satz lässt sich per Tipp auf die Strichliste wieder zurücknehmen
    await page.getByRole('button', { name: 'Neu starten' }).click();
    await expect(top(page)).toContainText('0 von 15 Sätzen');
    await done(page, 1).click();
    await next(page).click();
    await page.getByRole('button', { name: 'Satz 1 zurücknehmen' }).click();
    await expect(top(page)).toContainText('0 von 15 Sätzen');
    // Zurücksetzen mit Rückfrage
    await done(page, 1).click();
    await next(page).click();
    await page.getByRole('button', { name: 'Tag B zurücksetzen' }).click();
    await page.getByRole('button', { name: 'Abbrechen' }).click();
    await expect(top(page)).toContainText('1 von 15 Sätzen');
    await page.getByRole('button', { name: 'Tag B zurücksetzen' }).click();
    await page.getByRole('button', { name: 'Löschen' }).click();
    await expect(top(page)).toContainText('0 von 15 Sätzen');
  });

  test('Übung antippen springt hin; Haken verfallen am nächsten Tag', async ({ page, site }) => {
    await openApp(page, site);
    await startFromList(page, 'A');
    await page.locator('.list').getByRole('button', { name: /TRX-Trizepsstrecken/ }).click();
    await expect(page.locator('h2.name')).toHaveText('TRX-Trizepsstrecken');
    await done(page, 1).click();
    await next(page).click();
    expect((await stored(page)).stamp.A).toBe(TODAY);
    // am nächsten Tag beginnt das Training von vorn, Kalender und Essen bleiben
    await page.clock.setSystemTime(new Date('2026-10-06T08:00:00'));
    await page.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
    await expect(top(page)).toContainText('0 von 15 Sätzen');
    expect((await stored(page)).sets.A ?? {}).toEqual({});
  });

  test('Meine Trainings: angefangenes Training wird angeboten, nach der Rückkehr geht es weiter', async ({ page, site }) => {
    await openApp(page, site);
    await startFromList(page, 'A');
    await done(page, 1).click();
    await next(page).click();
    await page.getByRole('button', { name: 'Zurück' }).first().click();
    await expect(page.locator('h2.mt')).toHaveText('Meine Trainings');
    await expect(page.locator('.card.go')).toContainText('Du bist mittendrin');
    await expect(page.locator('.card.go')).toContainText('Tag A');
    await expect(page.locator('.card.go')).toContainText('1 von 15');
    await page.getByRole('button', { name: 'Weitermachen' }).click();
    await expect(top(page)).toContainText('1 von 15 Sätzen');
    await expect(done(page, 2)).toBeVisible();
    // App neu laden: das angefangene Training ist wieder da
    await page.reload();
    await expect(page.locator('nav.nav')).toBeVisible();
    await expect(top(page)).toContainText('1 von 15 Sätzen');
  });
});

test.describe('Kalender', () => {
  const seed = () => ({
    schema: 2,
    log: {
      '2026-10-01': [
        { day: 'A', sets: { 'a-box': 3, 'a-hip': 2 }, weights: { 'a-hip': '50' }, note: '' },
        { day: 'B', sets: {}, weights: {}, note: '' }
      ]
    }
  });
  const day = (page, key) => page.locator('button.cd[data-key="' + key + '"]');

  test('Eintrag aufklappen, Sätze ändern, Gewicht, Notiz, Datum verschieben, löschen und zurückholen', async ({ page, site }) => {
    await openApp(page, site, { state: seed() });
    await tab(page, 'Kalender').click();
    await expect(day(page, '2026-10-01')).toHaveAttribute('aria-label', /Training: Tag A und Tag B/);
    await day(page, '2026-10-01').click();
    await expect(page.locator('.card h3.name')).toHaveText('Donnerstag, 1. Oktober 2026');
    const entryA = page.locator('.entry', { has: page.locator('.entry-head[data-day="A"]') });
    const entryB = page.locator('.entry', { has: page.locator('.entry-head[data-day="B"]') });
    await expect(entryA.locator('.entry-head')).toContainText('5 von 15 Sätzen');
    await expect(entryB.locator('.entry-head')).toContainText('ohne Details');
    await expect(entryA.locator('.entry-head')).toHaveAttribute('aria-expanded', 'false');

    await entryA.locator('.entry-head').click();
    await expect(entryA.locator('.entry-head')).toHaveAttribute('aria-expanded', 'true');
    const row = (id) => entryA.locator('.xrow', { has: page.locator('[data-ex="' + id + '"]') });
    const plus = (id) => entryA.locator('button[data-act="entry-sets"][data-ex="' + id + '"][data-d="1"]');
    const minus = (id) => entryA.locator('button[data-act="entry-sets"][data-ex="' + id + '"][data-d="-1"]');
    await expect(row('a-box').locator('.cnt')).toContainText('3 von 3 Sätzen');
    await expect(row('a-hip').locator('.cnt')).toContainText('2 von 3 Sätzen');
    await expect(minus('a-push')).toBeDisabled();
    // Sätze: Hip Thrust +1 (jetzt 3, Plus gesperrt), Liegestütze +2, Box-Kniebeugen -1
    await plus('a-hip').click();
    await expect(plus('a-hip')).toBeDisabled();
    await plus('a-push').click(); await plus('a-push').click();
    await minus('a-box').click();
    await expect(entryA.locator('.entry-head')).toContainText('7 von 15 Sätzen');
    let s = await stored(page);
    expect(s.log['2026-10-01'][0].sets).toEqual({ 'a-box': 2, 'a-hip': 3, 'a-push': 2 });
    // Gewicht (nur bei Übungen mit Gewichtsfeld) und Notiz
    await expect(row('a-push').getByLabel('Gewicht (kg)')).toHaveCount(0);
    await expect(row('a-hip').getByLabel('Gewicht (kg)')).toHaveValue('50');
    await row('a-hip').getByLabel('Gewicht (kg)').fill('55,5');
    await entryA.getByLabel('Notiz').fill('Knie war gut');
    s = await stored(page);
    expect(s.log['2026-10-01'][0].weights).toEqual({ 'a-hip': '55,5' });
    expect(s.log['2026-10-01'][0].note).toBe('Knie war gut');
    // Datum verschieben: Zukunft wird abgelehnt, der Eintrag bleibt unverändert
    await entryA.locator('#e-date').fill('2026-10-06');
    await entryA.getByRole('button', { name: 'Auf dieses Datum verschieben' }).click();
    await expect(entryA.locator('#e-msg')).toHaveText('Bitte ein Datum bis heute wählen.');
    // gleicher Typ am Zieltag: abgelehnt, nichts geht verloren
    await tab(page, 'Kalender').click();
    await day(page, '2026-10-04').click();
    await page.getByRole('button', { name: 'Training eintragen' }).click();
    await page.locator('#cal-pick').selectOption('A');
    await page.getByRole('button', { name: 'Eintragen', exact: true }).click();
    await expect(page.locator('.entry-head[data-day="A"]')).toContainText('ohne Details');
    await day(page, '2026-10-01').click();
    await page.locator('.entry-head[data-day="A"]').click();
    await page.locator('#e-date').fill('2026-10-04');
    await page.getByRole('button', { name: 'Auf dieses Datum verschieben' }).click();
    await expect(page.locator('#e-msg')).toContainText('Am Sonntag, 4. Oktober 2026 ist Tag A schon eingetragen');
    s = await stored(page);
    expect(s.log['2026-10-01'][0].sets).toEqual({ 'a-box': 2, 'a-hip': 3, 'a-push': 2 });
    // auf einen freien Tag verschieben
    await page.locator('#e-date').fill('2026-10-03');
    await page.getByRole('button', { name: 'Auf dieses Datum verschieben' }).click();
    await expect(page.locator('.card h3.name')).toHaveText('Samstag, 3. Oktober 2026');
    await expect(page.locator('.entry-head[data-day="A"]')).toHaveAttribute('aria-expanded', 'true');
    s = await stored(page);
    expect(s.log['2026-10-03']).toEqual([{ day: 'A', sets: { 'a-box': 2, 'a-hip': 3, 'a-push': 2 }, weights: { 'a-hip': '55,5' }, note: 'Knie war gut' }]);
    expect(s.log['2026-10-01'].map((e) => e.day)).toEqual(['B']);
    await day(page, '2026-10-01').click();
    await expect(page.locator('.entry-head')).toHaveCount(1);
    await expect(day(page, '2026-10-01')).toHaveAttribute('aria-label', /Training: Tag B$/);
    // löschen und zurückholen
    await day(page, '2026-10-03').click();
    await page.locator('.entry-head[data-day="A"]').click();
    await page.getByRole('button', { name: 'Eintrag löschen' }).click();
    await expect(page.locator('.note.undo')).toContainText('Eintrag gelöscht.');
    expect((await stored(page)).log['2026-10-03']).toBeUndefined();
    await page.getByRole('button', { name: 'Rückgängig' }).click();
    await expect(page.locator('.entry-head[data-day="A"]')).toContainText('7 von 15 Sätzen');
    expect((await stored(page)).log['2026-10-03'][0].note).toBe('Knie war gut');
  });

  test('Eintrag ohne Details (Altformat) lässt sich nachtragen; Monatswechsel; Zukunft', async ({ page, site }) => {
    await openApp(page, site, { state: seed() });
    await tab(page, 'Kalender').click();
    await expect(page.locator('.top .prog')).toContainText('2 Trainings in diesem Monat');
    await expect(page.locator('.top .prog')).toContainText(/an 1 Tag/);
    await day(page, '2026-10-01').click();
    await page.locator('.entry-head[data-day="B"]').click();
    await expect(page.locator('.entry-body .hint')).toContainText('keine Sätze gespeichert');
    await page.locator('button[data-act="entry-sets"][data-ex="b-row"][data-d="1"]').click();
    await expect(page.locator('.entry-head[data-day="B"]')).toContainText('1 von 15 Sätzen');
    // Monat zurück und vor
    await page.getByRole('button', { name: 'Vorheriger Monat' }).click();
    await expect(page.locator('h2.mt')).toHaveText('September 2026');
    await page.getByRole('button', { name: 'Nächster Monat' }).click();
    await page.getByRole('button', { name: 'Nächster Monat' }).click();
    await expect(page.locator('h2.mt')).toHaveText('November 2026');
    await day(page, '2026-11-10').click();
    await expect(page.locator('p.empty')).toHaveText('Dieser Tag liegt in der Zukunft.');
    await expect(page.getByRole('button', { name: /eintragen/ })).toHaveCount(0);
  });
});

test.describe('Essen', () => {
  const field = (page, id) => page.locator('#f-' + id);
  async function fill(page, { name, g, kcal, p }) {
    if (name != null) await field(page, 'name').fill(name);
    if (g != null) await field(page, 'g').fill(g);
    if (kcal != null) await field(page, 'kcal').fill(kcal);
    if (p != null) await field(page, 'p').fill(p);
  }
  const entry = (page, name) => page.locator('.fe', { has: page.getByRole('button', { name: name + ' bearbeiten' }) });

  test('Magerquark 250 g mit 67 kcal / 12 g Protein pro 100 g ergibt 168 kcal und 30 g Protein', async ({ page, site }) => {
    await openApp(page, site);
    await tab(page, 'Essen').click();
    await expect(page.locator('#food-preview')).toHaveText('Alle Felder sind freiwillig. Es wird eingetragen, was du ausfüllst.');
    await page.getByRole('button', { name: 'Hinzufügen' }).click();
    await expect(page.locator('#food-msg')).toHaveText('Trage mindestens etwas ein. Alle Felder sind freiwillig.');
    await fill(page, { name: 'Magerquark', g: '250', kcal: '67', p: '12' });
    await expect(page.locator('#food-preview')).toHaveText('Bei 250 g: 168 kcal · 30 g Protein');
    await page.getByRole('button', { name: 'Hinzufügen' }).click();
    const e = entry(page, 'Magerquark');
    await expect(e.locator('.nchip').nth(0)).toHaveText('168 kcal');
    await expect(e.locator('.nchip').nth(1)).toHaveText('30 g Protein');
    await expect(page.locator('.prot-num:not(.kc-num) b')).toHaveText('30');
    await expect(page.locator('.tile', { hasText: 'Kalorien' }).locator('b')).toContainText('168');
    // Protein-Ziel
    await page.getByRole('button', { name: 'Ziele festlegen' }).click();
    await page.locator('#goal-w').fill('60');
    await expect(page.locator('#goal-hint')).toContainText('84 bis 120 g');
    await page.getByRole('button', { name: /1,6 g pro kg übernehmen \(96 g\)/ }).click();
    await expect(page.locator('.prot-num:not(.kc-num)')).toContainText('von 96 g');
    await expect(page.locator('.prot-sub:not(.kc-sub)')).toHaveText('Noch 66 g bis zum Ziel');
    await expect(page.locator('header.top .prog')).toContainText('30 von 96 g');
    // Kalorien-Ziel: gleiche Bedienung wie beim Protein, die Kachel "Kalorien" wird zur Zielanzeige
    await page.locator('#goal-k').fill('2000');
    await page.locator('#goal-k').blur();
    await expect(page.locator('.kc-num')).toContainText('168');
    await expect(page.locator('.kc-num')).toContainText('von 2000 kcal');
    await expect(page.locator('.kc-sub')).toHaveText('Noch 1832 kcal bis zum Ziel');
    await expect(page.locator('header.top .prog').nth(1)).toContainText('168 von 2000 kcal');
    await expect(page.locator('.tile', { hasText: 'Kalorien' })).toHaveCount(0);
    expect((await stored(page)).goalK).toBe(2000);
    await page.locator('#goal-k').fill('100');
    await page.locator('#goal-k').blur();
    await expect(page.locator('.kc-sub')).toHaveText('Über dem Ziel: 68 kcal');
    await page.locator('#goal-k').fill('');
    await page.locator('#goal-k').blur();
    await expect(page.locator('.kc-num')).toHaveCount(0);
    expect((await stored(page)).goalK).toBeNull();
    await expect(page.locator('.tile', { hasText: 'Kalorien' }).locator('b')).toContainText('168');
    // ganze Menge ohne Gramm wird mit eingerechnet, pro 100 g ohne Gramm nicht
    await page.getByRole('button', { name: 'ganze Menge' }).click();
    await fill(page, { name: 'Riegel', kcal: '210', p: '20' });
    await expect(page.locator('#food-preview')).toHaveText('Gesamt: 210 kcal · 20 g Protein');
    await field(page, 'p').press('Enter');
    await expect(page.locator('.prot-num:not(.kc-num) b')).toHaveText('50');
    await page.getByRole('button', { name: 'pro 100 g' }).click();
    await fill(page, { name: 'Haferflocken', kcal: '370' });
    await expect(page.locator('#food-preview')).toContainText('Ohne Menge werden die Werte nur pro 100 g gespeichert');
    await page.getByRole('button', { name: 'Hinzufügen' }).click();
    await expect(page.locator('section.card').first()).toContainText('1 Eintrag hat keine Menge und ist nicht eingerechnet');
    await expect(page.locator('.fe')).toHaveCount(3);
    // zuletzt gegessen füllt das Formular
    await page.getByRole('button', { name: 'Magerquark', exact: true }).click();
    await expect(field(page, 'name')).toHaveValue('Magerquark');
    await expect(field(page, 'g')).toHaveValue('250');
    await expect(field(page, 'p')).toHaveValue('12');
  });

  test('Getränke: "pro 100 ml" rechnet wie "pro 100 g", benennt Menge und Einheit richtig und lässt sich zurückschalten', async ({ page, site }) => {
    await openApp(page, site);
    await tab(page, 'Essen').click();
    // drei Bezugsgrössen zur Wahl, "pro 100 g" ist vorgewählt
    const chips = page.locator('.seg.three .chip');
    await expect(chips).toHaveText(['pro 100 g', 'pro 100 ml', 'ganze Menge']);
    await expect(page.getByRole('button', { name: 'pro 100 g' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('label[for="f-g"]')).toHaveText('Menge in Gramm');
    await page.getByRole('button', { name: 'pro 100 ml' }).click();
    await expect(page.getByRole('button', { name: 'pro 100 ml' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('label[for="f-g"]')).toHaveText('Menge in Millilitern');
    // Hafermilch: 200 ml mit 45 kcal und 1,2 g Protein pro 100 ml ergeben 90 kcal und 2,4 g Protein
    await fill(page, { name: 'Hafermilch', g: '200', kcal: '45', p: '1,2' });
    await expect(page.locator('#food-preview')).toHaveText('Bei 200 ml: 90 kcal · 2,4 g Protein');
    await page.getByRole('button', { name: 'Hinzufügen' }).click();
    const e = entry(page, 'Hafermilch');
    await expect(e.locator('.fe-name small')).toHaveText('200 ml');
    await expect(e.locator('.nchip').nth(0)).toHaveText('90 kcal');
    await expect(e.locator('.nchip').nth(1)).toHaveText('2,4 g Protein');
    await expect(e.locator('.fe-src')).toHaveText('Eingegeben pro 100 ml: 45 kcal · 1,2 g Protein.');
    const s = await stored(page);
    expect(s.food[TODAY][0]).toMatchObject({ name: 'Hafermilch', g: 200, mode: 'ml', v: { kcal: 45, p: 1.2 } });
    // ohne Menge wird nichts eingerechnet und es steht "ml" da
    await fill(page, { name: 'Cola', g: '', kcal: '42' });
    await expect(page.locator('#food-preview')).toContainText('nur pro 100 ml gespeichert');
    // Zuletzt gegessen übernimmt auch die Einheit
    await page.getByRole('button', { name: 'pro 100 g' }).click();
    await page.getByRole('button', { name: 'Hafermilch', exact: true }).click();
    await expect(page.getByRole('button', { name: 'pro 100 ml' })).toHaveAttribute('aria-pressed', 'true');
    await expect(field(page, 'g')).toHaveValue('200');
    // Bearbeiten: von ml auf g umschalten ändert die Beschriftung und rechnet neu
    await entry(page, 'Hafermilch').getByRole('button', { name: 'Hafermilch bearbeiten' }).click();
    await expect(page.getByRole('button', { name: 'pro 100 ml' })).toHaveAttribute('aria-pressed', 'true');
    await page.getByRole('button', { name: 'pro 100 g' }).click();
    await expect(page.locator('label[for="f-g"]')).toHaveText('Menge in Gramm');
    await expect(page.locator('#food-preview')).toHaveText('Bei 200 g: 90 kcal · 2,4 g Protein');
    await page.getByRole('button', { name: 'Speichern' }).click();
    expect((await stored(page)).food[TODAY][0].mode).toBe('100');
    await expect(entry(page, 'Hafermilch').locator('.fe-name small')).toHaveText('200 g');
    // Tagesbilanz zählt ml wie g
    await expect(page.locator('.prot-num:not(.kc-num) b')).toHaveText('2,4');
  });

  test('Eintrag bearbeiten: Formular füllt sich, Speichern, Abbrechen, nichts geht verloren', async ({ page, site }) => {
    const food = { id: 'q1', name: 'Magerquark', g: 250, mode: '100', v: { kcal: 67, p: 12, s: 4 } };
    await openApp(page, site, { state: { schema: 2, food: { [TODAY]: [food, { id: 'q2', name: 'Apfel', g: 150, mode: '100', v: { kcal: 52 } }] } } });
    await tab(page, 'Essen').click();
    await expect(page.locator('.fe-hint')).toBeVisible();
    await entry(page, 'Magerquark').getByRole('button', { name: 'Magerquark bearbeiten' }).click();
    await expect(page.locator('#fh')).toHaveText('Eintrag bearbeiten');
    await expect(field(page, 'name')).toHaveValue('Magerquark');
    await expect(field(page, 'g')).toHaveValue('250');
    await expect(field(page, 'kcal')).toHaveValue('67');
    await expect(field(page, 'p')).toHaveValue('12');
    await expect(field(page, 's')).toHaveValue('4');
    await expect(entry(page, 'Magerquark')).toHaveClass(/editing/);
    await expect(page.getByRole('button', { name: 'Hinzufügen' })).toHaveCount(0);
    // Abbrechen verwirft die Änderung
    await field(page, 'name').fill('Etwas anderes');
    await page.getByRole('button', { name: 'Abbrechen' }).click();
    await expect(page.locator('#fh')).toHaveText('Essen eintragen');
    await expect(entry(page, 'Magerquark')).toBeVisible();
    expect((await stored(page)).food[TODAY][0].name).toBe('Magerquark');
    // Speichern: 200 g statt 250 g -> 134 kcal, 24 g Protein
    await entry(page, 'Magerquark').getByRole('button', { name: 'Magerquark bearbeiten' }).click();
    await field(page, 'g').fill('200');
    await expect(page.locator('#food-preview')).toContainText('Bei 200 g: 134 kcal · 24 g Protein');
    await page.getByRole('button', { name: 'Speichern' }).click();
    await expect(page.locator('#food-msg')).toHaveText('Gespeichert.');
    await expect(entry(page, 'Magerquark').locator('.nchip').nth(0)).toHaveText('134 kcal');
    let s = await stored(page);
    expect(s.food[TODAY].map((e) => [e.id, e.name, e.g])).toEqual([['q1', 'Magerquark', 200], ['q2', 'Apfel', 150]]);
    expect(s.food[TODAY][0].v).toEqual({ kcal: 67, p: 12, s: 4 });
    // leeres Formular lässt sich nicht speichern, der Eintrag bleibt
    await entry(page, 'Apfel').getByRole('button', { name: 'Apfel bearbeiten' }).click();
    await field(page, 'name').fill(''); await field(page, 'g').fill(''); await field(page, 'kcal').fill('');
    await page.getByRole('button', { name: 'Speichern' }).click();
    await expect(page.locator('#food-msg')).toHaveText('Trage mindestens etwas ein. Alle Felder sind freiwillig.');
    await page.getByRole('button', { name: 'Abbrechen' }).click();
    expect((await stored(page)).food[TODAY][1].name).toBe('Apfel');
    // Löschen mit Rückgängig, auch mitten im Bearbeiten
    await entry(page, 'Magerquark').getByRole('button', { name: 'Magerquark bearbeiten' }).click();
    await entry(page, 'Magerquark').getByRole('button', { name: 'Eintrag löschen' }).click();
    await expect(page.locator('#fh')).toHaveText('Essen eintragen');
    await expect(page.locator('.fe')).toHaveCount(1);
    await expect(page.locator('.note.undo')).toContainText('Eintrag gelöscht.');
    await page.getByRole('button', { name: 'Rückgängig' }).click();
    await expect(page.locator('.fe')).toHaveCount(2);
    s = await stored(page);
    expect(s.food[TODAY].map((e) => e.id)).toEqual(['q1', 'q2']);
  });

  test('Kopieren: auf heute, auf anderen Tag, mit geänderter Menge; das Original bleibt', async ({ page, site }) => {
    const y = '2026-10-04';
    await openApp(page, site, { state: { schema: 2, food: { [y]: [{ id: 'q1', name: 'Magerquark', g: 250, mode: '100', v: { kcal: 67, p: 12 } }] } } });
    await tab(page, 'Essen').click();
    await page.getByRole('button', { name: 'Vorheriger Tag' }).click();
    await expect(page.locator('header.top h2.mt')).toHaveText('Sonntag');
    // Auf heute kopieren
    await entry(page, 'Magerquark').getByRole('button', { name: 'Magerquark bearbeiten' }).click();
    await page.getByRole('button', { name: 'Auf heute kopieren' }).click();
    await expect(page.locator('#food-msg')).toHaveText('Auf heute kopiert.');
    await expect(page.locator('.note.undo')).toContainText('Zum Tag wechseln?');
    let s = await stored(page);
    expect(s.food[TODAY]).toHaveLength(1);
    expect(s.food[TODAY][0]).toMatchObject({ name: 'Magerquark', g: 250, mode: '100', v: { kcal: 67, p: 12 } });
    expect(s.food[TODAY][0].id).not.toBe('q1');
    expect(s.food[y]).toHaveLength(1);
    // Auf anderen Tag kopieren, dabei Menge ändern; das Original bleibt bei 250 g
    await entry(page, 'Magerquark').getByRole('button', { name: 'Magerquark bearbeiten' }).click();
    await field(page, 'g').fill('100');
    await page.getByRole('button', { name: 'Auf anderen Tag kopieren' }).click();
    await expect(page.locator('#copy-date')).toHaveAttribute('max', TODAY);
    await page.locator('#copy-date').fill('2026-10-06');
    await page.getByRole('button', { name: 'Kopieren', exact: true }).click();
    await expect(page.locator('#food-msg')).toHaveText('Bitte ein Datum bis heute wählen.');
    await page.locator('#copy-date').fill('2026-10-02');
    await page.getByRole('button', { name: 'Kopieren', exact: true }).click();
    await expect(page.locator('#food-msg')).toHaveText('Kopiert auf Freitag, 2. Oktober 2026.');
    s = await stored(page);
    expect(s.food['2026-10-02']).toHaveLength(1);
    expect(s.food['2026-10-02'][0].g).toBe(100);
    expect(s.food[y][0].g).toBe(250);
    // zum Zieltag wechseln
    await page.getByRole('button', { name: 'Ansehen' }).click();
    await expect(page.locator('header.top h2.mt')).toHaveText('Freitag');
    await expect(entry(page, 'Magerquark').locator('.nchip').nth(0)).toHaveText('67 kcal');
  });

  test('Tage durchblättern: nicht in die Zukunft; im Kalender sieht man die Essenssumme', async ({ page, site }) => {
    await openApp(page, site, { state: { schema: 2, food: { [TODAY]: [{ id: 'a', name: 'Quark', g: 100, mode: '100', v: { kcal: 67, p: 12 } }] } } });
    await tab(page, 'Essen').click();
    await expect(page.getByRole('button', { name: 'Nächster Tag' })).toBeDisabled();
    await page.getByRole('button', { name: 'Vorheriger Tag' }).click();
    await expect(page.getByRole('button', { name: 'Nächster Tag' })).toBeEnabled();
    await expect(page.locator('p.empty')).toContainText('Noch nichts eingetragen');
    await page.getByRole('button', { name: 'Nächster Tag' }).click();
    await tab(page, 'Kalender').click();
    await expect(page.locator('.note', { hasText: 'Essen:' })).toContainText('67 kcal · 12 g Protein · 1 Eintrag');
    await page.getByRole('button', { name: 'Essen ansehen' }).click();
    await expect(page.locator('.fe')).toHaveCount(1);
  });
  test('Bisherige Lebensmittel: alles, was je eingetragen wurde, A bis Z, mit Suche; ein Tipp füllt das Formular', async ({ page, site }) => {
    const names = ['Magerquark', 'Äpfel', 'Haferflocken', 'Banane', 'Reis', 'Zimt', 'Joghurt natur', 'Hähnchenbrust', 'Olivenöl', 'Mandeln', 'Linsen', 'Ei'];
    const mk = (n, i) => ({ id: 'f' + i, name: n, g: 100 + i, mode: n === 'Olivenöl' ? 'ml' : '100', v: { kcal: 50 + i, p: 3 + i } });
    const all = names.map(mk);
    const state = { schema: 3, food: { '2026-10-03': all.slice(0, 6), '2026-10-04': all.slice(6) }, recent: all.slice(4).reverse() };
    await openApp(page, site, { state });
    await tab(page, 'Essen').click();
    const chips = page.getByRole('group', { name: 'Zuletzt gegessen' }).getByRole('button');
    await expect(chips).toHaveCount(8);                                           // "zuletzt gegessen" zeigt höchstens acht
    const add = page.getByRole('button', { name: 'Hinzufügen' }), book = page.getByRole('button', { name: 'Bisherige Lebensmittel' });
    await expect(book).toBeVisible();
    await expect(book).toHaveAttribute('aria-expanded', 'false');
    // der Knopf steht gleich unter "Hinzufügen"
    const a = await add.boundingBox(), b = await book.boundingBox();
    expect(b.y).toBeGreaterThanOrEqual(a.y + a.height);
    expect(b.y - (a.y + a.height)).toBeLessThan(40);
    await expect(page.locator('#book')).toHaveCount(0);
    await book.click();
    await expect(book).toHaveAttribute('aria-expanded', 'true');
    // alle zwölf, nicht nur acht, von A bis Z (Ä unter A)
    const rows = page.locator('[data-act="book-pick"]');
    await expect(rows).toHaveCount(12);
    await expect(rows.locator('b')).toHaveText(['Äpfel', 'Banane', 'Ei', 'Haferflocken', 'Hähnchenbrust', 'Joghurt natur', 'Linsen', 'Magerquark', 'Mandeln', 'Olivenöl', 'Reis', 'Zimt']);
    await expect(page.locator('#book h4')).toHaveText(['A', 'B', 'E', 'H', 'J', 'L', 'M', 'O', 'R', 'Z']);
    await expect(page.locator('#book-list .hint')).toHaveText('12 Lebensmittel');
    await expect(rows.filter({ hasText: 'Magerquark' })).toContainText('50 kcal · 3 g Protein pro 100 g');
    await expect(rows.filter({ hasText: 'Olivenöl' })).toContainText('pro 100 ml');
    // Suche: tippt man, bleibt das Feld offen und die Liste folgt
    const q = page.locator('#book-q');
    await q.click();
    await q.pressSequentially('ä');
    await expect(rows.locator('b')).toHaveText(['Äpfel', 'Hähnchenbrust']);
    await expect(q).toBeFocused();
    await q.fill('QUARK');
    await expect(rows).toHaveCount(1);
    await expect(page.locator('#book-list .hint')).toHaveText('1 Lebensmittel');
    await q.fill('xyz');
    await expect(page.locator('#book-list')).toContainText('Kein Lebensmittel gefunden.');
    await q.fill('');
    await expect(rows).toHaveCount(12);
    // ein Tipp füllt das Formular und schliesst die Liste
    await rows.filter({ hasText: 'Olivenöl' }).click();
    await expect(page.locator('#book')).toHaveCount(0);
    await expect(book).toHaveAttribute('aria-expanded', 'false');
    await expect(field(page, 'name')).toHaveValue('Olivenöl');
    await expect(field(page, 'g')).toHaveValue('108');
    await expect(field(page, 'kcal')).toHaveValue('58');
    await expect(field(page, 'p')).toHaveValue('11');
    await expect(page.getByRole('button', { name: 'pro 100 ml' })).toHaveAttribute('aria-pressed', 'true');
    await expect(page.locator('#food-msg')).toContainText('Übernommen');
    await expect(page.locator('#food-preview')).toHaveText('Bei 108 ml: 63 kcal · 11,9 g Protein');
    await field(page, 'g').fill('15');
    await add.click();
    await expect(entry(page, 'Olivenöl').locator('.fe-name small')).toHaveText('15 ml');
    expect((await stored(page)).food[TODAY][0]).toMatchObject({ name: 'Olivenöl', g: 15, mode: 'ml', v: { kcal: 58, p: 11 } });
    // ein neues Lebensmittel: die Liste "zuletzt gegessen" bleibt bei acht, die Liste der bisherigen wächst
    await page.getByRole('button', { name: 'pro 100 g' }).click();
    await fill(page, { name: 'Skyr', g: '150', kcal: '63', p: '11' });
    await add.click();
    await expect(chips).toHaveCount(8);
    await expect(chips.first()).toHaveText('Skyr');
    await book.click();
    await expect(rows).toHaveCount(13);
    await expect(rows.locator('b').nth(10)).toHaveText('Reis');
    await expect(page.locator('#book h4')).toHaveText(['A', 'B', 'E', 'H', 'J', 'L', 'M', 'O', 'R', 'S', 'Z']);
    // beim Bearbeiten eines Eintrags gibt es den Knopf nicht
    await book.click();
    await entry(page, 'Skyr').getByRole('button', { name: 'Skyr bearbeiten' }).click();
    await expect(book).toHaveCount(0);
    await page.getByRole('button', { name: 'Abbrechen' }).click();
    await expect(book).toBeVisible();
    // nach dem Neuladen ist alles noch da
    await page.reload();
    await tab(page, 'Essen').click();
    await page.getByRole('button', { name: 'Bisherige Lebensmittel' }).click();
    await expect(page.locator('[data-act="book-pick"]')).toHaveCount(13);
  });

  test('Bisherige Lebensmittel ohne Einträge: ein ruhiger Hinweis, nichts zum Antippen', async ({ page, site }) => {
    await openApp(page, site);
    await tab(page, 'Essen').click();
    await expect(page.getByRole('group', { name: 'Zuletzt gegessen' })).toHaveCount(0);
    await page.getByRole('button', { name: 'Bisherige Lebensmittel' }).click();
    await expect(page.locator('#book-list')).toContainText('Hier erscheinen alle Lebensmittel, die du einträgst.');
    await expect(page.locator('[data-act="book-pick"]')).toHaveCount(0);
    // das erste eingetragene Lebensmittel taucht danach auf
    await fill(page, { name: 'Magerquark', g: '250', kcal: '67', p: '12' });
    await page.getByRole('button', { name: 'Hinzufügen' }).click();
    await page.getByRole('button', { name: 'Bisherige Lebensmittel' }).click();
    await expect(page.locator('[data-act="book-pick"]')).toHaveCount(1);
    // eine andere Seite und zurück schliesst die Liste
    await tab(page, 'Kalender').click();
    await tab(page, 'Essen').click();
    await expect(page.locator('#book')).toHaveCount(0);
  });
});
