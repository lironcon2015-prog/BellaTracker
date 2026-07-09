/**
 * GymStart — Service Worker
 * Version: 2.8.0-1
 * Cache First strategy — עבודה אופליין מלאה.
 * העלה את CACHE_VERSION בכל עדכון קוד.
 */

const CACHE_VERSION = 'gymstart-v2.8.0-1';

const FILES_TO_CACHE = [
    './index.html',
    './style.css',
    './script.js',
    './insights.js',
    './nutrition-core.js',
    './version.json',
    './manifest.json',
    './icon.png',
    './icon-male.png'
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
    // ספריות/דאטה גדולים (ZXing עתידי וכו') — runtime-cache (stale-while-revalidate),
    // לא pre-cache. נכנס לקאש בפעם הראשונה שנטען, ואז זמין offline.
    if (event.request.url.includes('/vendor/') || event.request.url.includes('/data/')) {
        event.respondWith(
            caches.open(CACHE_VERSION).then(cache =>
                cache.match(event.request).then(cached => {
                    const network = fetch(event.request).then(res => {
                        if (res && res.ok) cache.put(event.request, res.clone());
                        return res;
                    }).catch(() => cached);
                    return cached || network;
                })
            )
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
