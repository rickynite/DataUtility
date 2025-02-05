const CACHE_NAME = 'data-utility-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/main.js',
    '/manifest.json',
    '/node_modules/plotly.js/dist/plotly.min.js',
    '/node_modules/papaparse/papaparse.min.js',
    '/sample.json',
    '/icons/icon-192x192.png', // Ensure this path is correct
    '/icons/icon-512x512.png'  // Ensure this path is correct
    // '/offline.html' // Uncomment if you have an offline fallback page
];

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                return cache.addAll(urlsToCache);
            })
    );
});

self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request)
            .then(response => {
                return response || fetch(event.request).then(response => {
                    return caches.open(CACHE_NAME).then(cache => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                });
            }).catch(() => {
                // return caches.match('/offline.html'); // Uncomment if you have an offline fallback page
            })
    );
});

self.addEventListener('activate', event => {
    const cacheWhitelist = [CACHE_NAME];
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    if (cacheWhitelist.indexOf(cacheName) === -1) {
                        return caches.delete(cacheName);
                    }
                })
            );
        })
    );
});