import { test as base, expect } from '@playwright/test';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { existsSync } from 'node:fs';
import { startServer } from '../../tools/serve.mjs';

export const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..', '..');
export const SITE = path.join(ROOT, 'tests', 'out', 'site');
export const KEY = 'strichliste.v1';
export const EXE = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);
export const TODAY = '2026-10-05';          // the fixed "today" of most tests (a Monday)
export { expect };

/* Per test: a server like GitHub Pages (below /Fitnesstracker/, max-age=600) and a log of everything that must stay empty:
   console errors, uncaught exceptions, failed requests, and any request that leaves the site's own origin. */
export const test = base.extend({
  site: [async ({}, use) => {
    const s = await startServer({ root: SITE, base: '/Fitnesstracker/' });
    await use(s);
    await s.close();
  }, { scope: 'worker' }],

  diag: async ({ context, page, site }, use) => {
    const d = { errors: [], external: [], failed: [], warnings: [], requests: [], own: [] };       // own: further origins of the app itself (a test's own server)
    page.on('console', (m) => {
      if (m.type() === 'error') d.errors.push('console.error: ' + m.text());
      if (m.type() === 'warning') d.warnings.push(m.text());
    });
    page.on('pageerror', (e) => d.errors.push('pageerror: ' + e.message));
    context.on('request', (r) => {
      const u = r.url();
      d.requests.push(u);
      if (!u.startsWith(site.origin + '/') && !d.own.some((o) => u.startsWith(o + '/')) && !/^(data|blob|about):/.test(u)) d.external.push(u);
    });
    context.on('requestfailed', (r) => { if (!/net::ERR_ABORTED/.test(r.failure()?.errorText || '')) d.failed.push(r.url() + ' ' + (r.failure()?.errorText || '')); });
    await use(d);
    expect(d.errors, 'Konsolenfehler').toEqual([]);
    expect(d.external, 'Anfragen an fremde Hosts').toEqual([]);
    if (!d.allowFailed) expect(d.failed, 'fehlgeschlagene Anfragen').toEqual([]);
  }
});

/* Opens the app. `now` fixes the date the app sees (time keeps running); `state` seeds localStorage once, before the app starts. */
export async function openApp(page, site, { now = TODAY + 'T10:00:00', state = null, url = site.url } = {}) {
  if (now) await page.clock.install({ time: new Date(now) });
  if (state) {
    await page.addInitScript(([k, v]) => { if (!localStorage.getItem(k)) localStorage.setItem(k, v); }, [KEY, JSON.stringify(state)]);
  }
  await page.goto(url);
  await expect(page.locator('nav.nav')).toBeVisible();
}

export const stored = (page) => page.evaluate((k) => JSON.parse(localStorage.getItem(k) || 'null'), KEY);
export const tab = (page, name) => page.locator('nav.nav').getByRole('button', { name });

/* Waits until the service worker controls the page (first visit: it installs, activates and claims). */
export async function waitControlled(page) {
  await page.evaluate(() => navigator.serviceWorker.ready);
  await expect.poll(() => page.evaluate(() => !!navigator.serviceWorker.controller), { timeout: 15_000 }).toBe(true);
}

/* Starts a training from "Meine Trainings" (Tag A, Tag B or an own one) with one tap on its row, the way a person would. Not for use while a training runs. */
export async function startFromList(page, id) {
  await tab(page, 'Meine Trainings').click();
  await page.locator('[data-act="flow-start"][data-id="' + id + '"]').click();
  await expect(page.locator('header.top .prog')).toContainText('Sätzen');
}

/* Opens a suggestion of the app (p-...) in "Erstellen" and starts it. */
export async function startSuggestion(page, id) {
  await tab(page, 'Erstellen').click();
  await page.getByRole('button', { name: 'Training', exact: true }).click();
  await page.locator('[data-act="mk-existing"]').click();
  await page.locator('.tcard[data-id="' + id + '"]').click();
  await page.getByRole('button', { name: 'Los geht’s' }).click();
  await expect(page.locator('header.top .prog')).toContainText('Sätzen');
}

/* Words that must not appear anywhere: times and levels are gone from the app. Looks at what is on screen right now. */
export const noTimes = (page) => page.evaluate(() => document.body.innerText.split('\n').filter((l) => /\d+\s*Min\b|\bMin\.|Minuten|ca\.\s*\d|Wie viel Zeit|Erfahrung|Ich bin Einsteiger/.test(l)));

/* Every German word with a sharp s would be a mistake: the app uses the Swiss "ss". Looks at what is on screen right now. */
export const noSharpS = (page) => page.evaluate(() => document.body.innerText.includes('ß') ? document.body.innerText.split('\n').filter((l) => l.includes('ß')) : []);

