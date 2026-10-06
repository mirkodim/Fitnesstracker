import { defineConfig } from '@playwright/test';
import { existsSync } from 'node:fs';

/* Uses the Chromium that is already installed (no "playwright install"): set CHROMIUM_PATH, or it looks at the usual place. */
const exe = process.env.CHROMIUM_PATH || (existsSync('/opt/pw-browsers/chromium') ? '/opt/pw-browsers/chromium' : undefined);

const phone = (name, width, height, colorScheme, testMatch) => ({
  name,
  testMatch,
  use: { viewport: { width, height }, colorScheme, isMobile: true, hasTouch: true, deviceScaleFactor: 2 }
});
const MATRIX = ['smoke', 'flow', 'builder', 'library', 'layout'].map((n) => `**/${n}.spec.mjs`);
const SINGLE = ['pwa', 'offline', 'update', 'backup', 'anim'].map((n) => `**/${n}.spec.mjs`);

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: './test-results',
  globalSetup: './tests/e2e/global-setup.mjs',
  timeout: 60_000,
  expect: { timeout: 8_000 },
  fullyParallel: true,
  workers: process.env.CI ? 2 : 4,
  retries: 0,
  reporter: [['list']],
  use: {
    locale: 'de-DE',
    timezoneId: 'Europe/Zurich',
    launchOptions: exe ? { executablePath: exe } : {},
    actionTimeout: 10_000,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure'
  },
  projects: [
    phone('360-hell', 360, 740, 'light', MATRIX),
    phone('360-dunkel', 360, 740, 'dark', MATRIX),
    phone('320-hell', 320, 640, 'light', MATRIX),
    phone('320-dunkel', 320, 640, 'dark', MATRIX),
    phone('einzeln', 360, 740, 'light', SINGLE)
  ]
});
