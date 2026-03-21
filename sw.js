/**
 * GymStart Service Worker
 * לעדכון גרסה: שנה את CACHE_VERSION ודחוף לגיטהאב.
 * הדפדפן מזהה שינוי ב-sw.js, מתקין גרסה חדשה, מוחק קאש ישן.
 */

const CACHE_VERSION = 'gymstart-v1.8.2';

const FILES_TO_CACHE = [
    './',
    './index.html',
    './script.js',
    './style.css',
    './manifest.json',
    './icon.png'
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_VERSION)
            .then(cache => cache.addAll(FILES_TO_CACHE))
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys =>
            Promise.all(
                keys.filter(k => k !== CACHE_VERSION).map(k => caches.delete(k))
            )
        ).then(() => self.clients.claim())
    );
});

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET') return;
    if (!event.request.url.startsWith(self.location.origin)) return;
    event.respondWith(
        caches.match(event.request).then(cached => {
            return cached || fetch(event.request).then(response => {
                if (response.ok) {
                    const clone = response.clone();
                    caches.open(CACHE_VERSION).then(cache => cache.put(event.request, clone));
                }
                return response;
            });
        })
    );
});
