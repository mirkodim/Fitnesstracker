import { test, expect, openApp, tab } from './fixtures.mjs';

const cap = (page) => page.locator('#fig-cap');
const badge = (page) => page.locator('#fig-badge');

async function pick(page, id) {
  const name = await page.evaluate((i) => EX[i].name, id);
  if (!(await page.locator('#lib-q').isVisible().catch(() => false))) {                // die Bibliothek ist der Teil "Übungen" des Reiters "Erstellen"
    await tab(page, 'Erstellen').click();
    await page.getByRole('button', { name: 'Übungen', exact: true }).click();
  }
  await page.locator('#lib-q').fill(name);
  await page.locator('#lib-res .row').filter({ has: page.getByText(name, { exact: true }) }).first().click();
  await expect(page.locator('h2.name')).toHaveText(name);
}
async function leave(page) { await page.getByRole('button', { name: 'Zurück' }).first().click(); }

for (const part of [0, 1, 2, 3]) test('Jede Übung: Seite mit Hinweisen, die Figur wird gezeichnet und spielt von Anfang bis Ende ab (Teil ' + (part + 1) + ' von 4)', async ({ page, site }) => {
  test.setTimeout(180_000);
  await openApp(page, site);
  const all = (await page.evaluate(() => LIB.map((e) => e.id))).sort();
  expect(all.length).toBeGreaterThanOrEqual(80);
  expect(all).toEqual((await page.evaluate(() => Object.keys(FIG.ANIM))).sort());
  for (const id of all.filter((_, i) => i % 4 === part)) {
    await pick(page, id);
    await expect(page.getByRole('heading', { name: 'Darauf achten' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Häufige Fehler' })).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Hier spürst du es' })).toBeVisible();
    await expect(cap(page)).toHaveText('Tippe auf das Bild, um die Bewegung abzuspielen.');
    await expect(badge(page)).toHaveText('Abspielen');
    const still = await page.locator('#fig-g').innerHTML();
    expect(still).toContain('class="fl"');
    expect(still).toContain('class="hd');                         // Kopf
    const info = await page.evaluate((i) => {
      const A = FIG.ANIM[i], n = A.steps.length; let total = 0;
      for (let r = 0; r < (A.reps || 3); r++) for (let k = 1; k <= n; k++) total += A.steps[k % n].ms + A.steps[k % n].hold;
      return { total, labels: A.steps.map((s) => s.label), hasBad: A.steps.some((s) => s.bad) };
    }, id);

    await page.locator('.stage').click();
    await expect(badge(page)).toHaveText('Stopp');
    const seen = new Set(), frames = new Set();
    let sawBad = false;
    const step = 700;                                    // jede Beschriftung steht mindestens 0,9 s (fastForward statt runFor: ein Bild pro Sprung, das geht viel schneller)
    for (let t = 0; t < info.total; t += step) {
      await page.clock.fastForward(step);
      const r = await page.evaluate(() => ({ cap: document.getElementById('fig-cap').innerText, html: document.getElementById('fig-g').innerHTML, bad: document.getElementById('fig-cap').classList.contains('bad') }));
      seen.add(r.cap); frames.add(r.html);
      if (r.bad) sawBad = true;
    }
    for (const c of seen) if (!/^Fertig/.test(c)) expect(info.labels, id + ': ' + c).toContain(c);
    expect(frames.size, id + ' bewegt sich').toBeGreaterThan(5);
    expect(sawBad, id + ' Falsch-Schritt in Orange').toBe(info.hasBad);
    await page.clock.runFor(600);
    await expect(badge(page)).toHaveText('Nochmal');
    await expect(cap(page)).toHaveText('Fertig. Tippe auf das Bild, um es nochmal zu sehen.');
    await expect(cap(page)).not.toHaveClass(/bad/);
    // erneut tippen startet von vorn und lässt sich mittendrin stoppen
    await page.locator('.stage').click();
    await page.clock.runFor(700);
    await page.locator('.stage').click();
    await expect(badge(page)).toHaveText('Abspielen');
    await leave(page);
  }
});

test('Hip Thrust und TRX-Trizepsstrecken: Texte, Muskelmarkierung und Bildinhalt', async ({ page, site }) => {
  await openApp(page, site);
  await pick(page, 'a-hip');
  await expect(page.locator('.demo-body ul:not(.bad)').first().locator('li')).toHaveCount(6);
  await expect(page.locator('.demo-body ul:not(.bad)').first()).toContainText('Bank an Wand oder Rack stellen');
  await expect(page.locator('.demo-body ul.bad li')).toHaveCount(4);
  await expect(page.locator('.demo-body .feel').first()).toContainText('Gesäss (Gluteus)');
  // Bank (zwei Teile), Hantelscheibe, Muskel am Oberschenkel markiert
  await expect(page.locator('#fig-g rect.pp')).toHaveCount(2);
  await expect(page.locator('#fig-g circle.pl')).toHaveCount(1);
  await expect(page.locator('#fig-g line.sg.hl')).toHaveCount(1);
  await leave(page);

  await pick(page, 'a-tri');
  await expect(page.locator('.demo-body ul:not(.bad)').first().locator('li')).toHaveCount(4);
  await expect(page.locator('.demo-body ul:not(.bad)').first()).toContainText('TRX hoch am Rack einhängen');
  await expect(page.locator('.demo-body ul:not(.bad)').first()).toContainText('Schwerer: Füsse weiter nach hinten');
  await expect(page.locator('.demo-body ul.bad li').first()).toContainText('Hüfte hängt durch');
  // Anker und Gurt, kein Pfosten und kein Band (Standing-Pushdown ist weg), Oberarm markiert
  await expect(page.locator('#fig-g line.an')).toHaveCount(1);
  await expect(page.locator('#fig-g line.st')).toHaveCount(1);
  await expect(page.locator('#fig-g line.st.bd')).toHaveCount(0);
  await expect(page.locator('#fig-g rect.pp')).toHaveCount(0);
  await expect(page.locator('#fig-g line.sg.hl')).toHaveCount(1);
  await expect(page.locator('body')).not.toContainText(/Pushdown|Elastikband|Trizeps-Drücken/);
});

test('Bewegung reduzieren: Tippen schaltet Bild für Bild weiter, nichts läuft von selbst', async ({ page, site }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' });
  await openApp(page, site);
  await pick(page, 'a-tri');
  await page.locator('.stage').click();
  await expect(badge(page)).toHaveText('Weiter');
  const steps = await page.evaluate(() => FIG.ANIM['a-tri'].steps.map((s) => s.label));
  await expect(cap(page)).toHaveText(steps[1]);
  const frame1 = await page.locator('#fig-g').innerHTML();
  await page.clock.runFor(3000);
  expect(await page.locator('#fig-g').innerHTML()).toBe(frame1);
  await page.locator('.stage').click();
  await expect(cap(page)).toHaveText(steps[2]);
  await page.locator('.stage').click();
  await expect(cap(page)).toHaveText(steps[3]);
  await expect(cap(page)).toHaveClass(/bad/);
});
