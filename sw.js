/* Service worker: stores the whole app on first visit, then serves it cache-first, so the app starts without a network.
   VERSION is set by the deploy (tools/build.mjs). Every deploy changes this file, so the browser installs a fresh cache next to the old one.
   The new worker then waits. It only takes over when the page sends SKIP_WAITING, i.e. after a tap on "Neu laden". */
var VERSION = 'dev';
var CACHE = 'strichliste-' + VERSION;
var PRECACHE = [
  './',
  'index.html',
  'styles.css',
  'version.js',
  'plan.js',
  'fig.js',
  'store.js',
  'app.js',
  'manifest.webmanifest',
  'icons/favicon.svg',
  'icons/icon-192.png',
  'icons/icon-512.png',
  'icons/maskable-512.png',
  'icons/apple-touch-icon.png',
  'fonts/barlow-latin-400-normal.woff2',
  'fonts/barlow-latin-500-normal.woff2',
  'fonts/barlow-latin-600-normal.woff2',
  'fonts/barlow-condensed-latin-500-normal.woff2',
  'fonts/barlow-condensed-latin-600-normal.woff2',
  'fonts/barlow-condensed-latin-700-normal.woff2'
];

/* cache: 'reload' skips the browser's HTTP cache (GitHub Pages sends max-age=600), so a new version never stores stale files. */
self.addEventListener('install', function (event) {
  event.waitUntil(caches.open(CACHE).then(function (cache) {
    return Promise.all(PRECACHE.map(function (url) {
      return fetch(new Request(url, { cache: 'reload' })).then(function (res) {
        if (!res.ok) throw new Error(url + ' ' + res.status);
        return cache.put(url, res);
      });
    }));
  }));
});

self.addEventListener('activate', function (event) {
  event.waitUntil(
    caches.keys().then(function (keys) {
      return Promise.all(keys.filter(function (k) { return k.indexOf('strichliste-') === 0 && k !== CACHE; }).map(function (k) { return caches.delete(k); }));
    }).then(function () { return self.clients.claim(); })
  );
});

self.addEventListener('message', function (event) {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('fetch', function (event) {
  var req = event.request;
  if (req.method !== 'GET') return;
  if (new URL(req.url).origin !== self.location.origin) return;
  event.respondWith(
    caches.open(CACHE).then(function (cache) {
      return cache.match(req, { ignoreSearch: true }).then(function (hit) {
        if (hit) return hit;
        return fetch(req).catch(function (err) {
          if (req.mode === 'navigate') return cache.match('./').then(function (shell) { if (shell) return shell; throw err; });
          throw err;
        });
      });
    })
  );
});
