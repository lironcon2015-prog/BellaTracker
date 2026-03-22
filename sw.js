/**
 * GymStart — Service Worker
 * Version: 1.8.2
 * Cache First strategy — עבודה אופליין מלאה.
 * העלה את CACHE_VERSION בכל עדכון קוד.
 */

const CACHE_VERSION = 'gymstart-v1.8.2-2';

const FILES_TO_CACHE = [
    './index.html',
    './style.css',
    './script.js',
    './version.json',
    './manifest.json',
    './icon.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_VERSION).then(cache => {
            return cache.addAll(FILES_TO_CACHE);
        })
    );
    self.skipWaiting();
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys
                    .filter(key => key !== CACHE_VERSION)
                    .map(key => caches.delete(key))
            )
        )
    );
    self.clients.claim();
});

self.addEventListener('fetch', event => {
    // version.json — תמיד מהרשת (לצורך בדיקת עדכונים)
    if (event.request.url.includes('version.json')) {
        event.respondWith(
            fetch(event.request).catch(() => caches.match(event.request))
        );
        return;
    }
    // שאר הקבצים — Cache First
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request);
        })
    );
});
