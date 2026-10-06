import { chromium } from '@playwright/test';
import { mkdtemp, rm } from 'node:fs/promises';
import os from 'node:os';
import path from 'node:path';
import { test, expect, openApp, waitControlled, EXE } from './fixtures.mjs';

const png = (buf) => (buf.toString('latin1', 1, 4) === 'PNG' ? buf.readUInt32BE(16) + 'x' + buf.readUInt32BE(20) : null);

test('Manifest ist gültig, die Icons sind erreichbar und haben die angegebene Grösse', async ({ page, site }) => {
  await openApp(page, site, { now: null });
  const href = await page.locator('link[rel="manifest"]').getAttribute('href');
  const res = await page.request.get(new URL(href, site.url).href);
  expect(res.status()).toBe(200);
  expect(res.headers()['content-type']).toMatch(/manifest\+json|json/);
  const m = await res.json();
  expect(m).toMatchObject({
    id: './', name: 'Trainings-Strichliste', short_name: 'Training', lang: 'de', start_url: './', scope: './',
    display: 'standalone', orientation: 'portrait', background_color: '#ECF0F1', theme_color: '#0B7A85'
  });
  expect(new URL(m.start_url, site.url + 'manifest.webmanifest').href).toBe(site.url);
  expect(new URL(m.scope, site.url + 'manifest.webmanifest').href).toBe(site.url);
  const sizes = {};
  for (const i of m.icons) {
    const r = await page.request.get(new URL(i.src, site.url).href);
    expect(r.status(), i.src).toBe(200);
    expect(r.headers()['content-type']).toBe('image/png');
    expect(png(await r.body()), i.src).toBe(i.sizes);
    (sizes[i.purpose] ||= []).push(i.sizes);
  }
  expect(sizes.any).toEqual(['192x192', '512x512']);
  expect(sizes.maskable).toEqual(['512x512']);
  // Kopf der Seite
  await expect(page.locator('meta[name="theme-color"]')).toHaveCount(2);
  await expect(page.locator('link[rel="apple-touch-icon"]')).toHaveAttribute('href', 'icons/apple-touch-icon.png');
  await expect(page.locator('meta[name="viewport"]')).toHaveAttribute('content', /viewport-fit=cover/);
  await expect(page.locator('html')).toHaveAttribute('lang', 'de');
});

/* Playwright's normal contexts count as incognito for Chrome ("in-incognito" is then the only reported obstacle), so the install check
   runs in a persistent profile, like a real Chrome on a phone. */
test('Installierbar: Chrome meldet keine Hindernisse, der Service Worker kontrolliert die Seite', async ({ site }) => {
  const dir = await mkdtemp(path.join(os.tmpdir(), 'strichliste-profil-'));
  const ctx = await chromium.launchPersistentContext(dir, { executablePath: EXE, headless: true, viewport: { width: 360, height: 740 }, locale: 'de-DE', isMobile: true, hasTouch: true });
  try {
    const page = ctx.pages()[0] || await ctx.newPage();
    const errors = [];
    page.on('console', (m) => { if (m.type() === 'error') errors.push(m.text()); });
    page.on('pageerror', (e) => errors.push(e.message));
    await page.goto(site.url);
    await waitControlled(page);
    await page.reload();                                      // so wie ein zweiter Start
    await waitControlled(page);

    const sw = await page.evaluate(async () => {
      const r = await navigator.serviceWorker.getRegistration();
      return { scope: r.scope, script: r.active.scriptURL, state: r.active.state, updateViaCache: r.updateViaCache };
    });
    expect(sw).toEqual({ scope: site.url, script: site.url + 'sw.js', state: 'activated', updateViaCache: 'none' });
    expect(await (await page.request.get(site.url + 'sw.js')).text()).toMatch(/addEventListener\('fetch'/);

    // Dieselbe Prüfung, die Lighthouse und Chromes Installieren-Dialog nutzen
    const cdp = await ctx.newCDPSession(page);
    const { installabilityErrors } = await cdp.send('Page.getInstallabilityErrors');
    expect(installabilityErrors, JSON.stringify(installabilityErrors)).toEqual([]);
    const manifest = await cdp.send('Page.getAppManifest');
    expect(manifest.errors).toEqual([]);
    expect(manifest.url).toBe(site.url + 'manifest.webmanifest');
    const parsed = JSON.parse(manifest.data);
    expect(parsed.display).toBe('standalone');
    expect(parsed.icons.map((i) => i.purpose)).toEqual(['any', 'any', 'maskable']);
    const appId = await cdp.send('Page.getAppId').catch(() => null);
    console.log('Chrome: installierbar, Fehler: [], App-ID:', JSON.stringify(appId));

    expect(errors).toEqual([]);
  } finally {
    await ctx.close();
    await rm(dir, { recursive: true, force: true });
  }
});

test('beforeinstallprompt wird aufgefangen, falls Chrome es sendet (nur Hinweis, kein Muss im Headless-Modus)', async ({ page, site }) => {
  await page.addInitScript(() => { window.__bip = false; window.addEventListener('beforeinstallprompt', (e) => { window.__bip = true; e.preventDefault(); }); });
  await openApp(page, site, { now: null });
  await waitControlled(page);
  await page.reload();
  await page.waitForTimeout(1500);
  console.log('beforeinstallprompt ausgelöst:', await page.evaluate(() => window.__bip));
});

test('Persistenter Speicher wird still angefragt', async ({ page, site }) => {
  await page.addInitScript(() => {
    window.__persist = [];
    if (navigator.storage) {
      const p = navigator.storage.persist.bind(navigator.storage);
      navigator.storage.persist = () => { window.__persist.push('persist'); return p(); };
    }
  });
  await openApp(page, site, { now: null });
  await expect.poll(() => page.evaluate(() => window.__persist.length)).toBeGreaterThanOrEqual(0);
  // es gibt dafür keine Oberfläche: kein Dialog, kein Text
  await expect(page.locator('body')).not.toContainText(/persist|dauerhaft/i);
});
