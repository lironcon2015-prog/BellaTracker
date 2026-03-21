/**
 * GymStart Service Worker
 * Cache-first strategy with version-based invalidation.
 * When version.json changes on the server, the cache is cleared and rebuilt.
 */

const CACHE_NAME = 'gymstart-cache';
const VERSION_URL = '/version.json';
const FILES_TO_CACHE = [
    './',
    './index.html',
    './script.js',
    './style.css',
    './sw.js',
    './version.json',
    './icon.svg'
];

// ── Install: cache all static files ──────────────────────────────────────────
self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

// ── Activate: claim clients immediately ──────────────────────────────────────
self.addEventListener('activate', event => {
    event.waitUntil(self.clients.claim());
});

// ── Fetch: cache-first, network fallback ─────────────────────────────────────
self.addEventListener('fetch', event => {
    // Skip non-GET and cross-origin requests
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith(self.location.origin)) return;

    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(response => {
                // Cache new resources on the fly
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_NAME).then(cache => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});

// ── Message: CHECK_VERSION from the page ─────────────────────────────────────
self.addEventListener('message', async event => {
    if (event.data !== 'CHECK_VERSION') return;

    try {
        // Fetch remote version bypassing cache
        const remoteResp = await fetch(VERSION_URL + '?t=' + Date.now(), { cache: 'no-store' });
        const remoteData = await remoteResp.json();
        const remoteVersion = remoteData.version;

        // Get cached version
        const cache = await caches.open(CACHE_NAME);
        const cachedResp = await cache.match(VERSION_URL);
        let cachedVersion = null;
        if (cachedResp) {
            const cachedData = await cachedResp.json();
            cachedVersion = cachedData.version;
        }

        if (remoteVersion && remoteVersion !== cachedVersion) {
            // Clear cache and re-fetch everything
            await caches.delete(CACHE_NAME);
            const newCache = await caches.open(CACHE_NAME);
            await newCache.addAll(FILES_TO_CACHE);

            // Notify all clients
            const clients = await self.clients.matchAll({ includeUncontrolled: true });
            clients.forEach(client => {
                client.postMessage({ type: 'UPDATE_AVAILABLE', version: remoteVersion });
            });
        }
    } catch (e) {
        // Silently ignore — network may be offline
        console.warn('SW version check failed:', e);
    }
});
