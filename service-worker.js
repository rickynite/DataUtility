const CACHE_NAME = 'data-utility-cache-v1';
const urlsToCache = [
    '/',
    '/index.html',
    '/main.js',
    '/manifest.json',
    'https://cdn.plot.ly/plotly-latest.min.js',
    'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js',
    '/sample.json',
    '/icons/icon-192x192.png',
    '/icons/icon-512x512.png',
    '/offline.html'
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
    if (event.request.url.startsWith('http') && !event.request.url.startsWith(self.location.origin)) {
        // For external URLs, cache and serve
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(response => {
                    return response || fetch(event.request).then(response => {
                        cache.put(event.request, response.clone());
                        return response;
                    });
                });
            })
        );
    } else {
        // For local resources, use the existing strategy
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
                    // If both cache and network fail, show the offline page
                    return caches.match('/offline.html');
                })
        );
    }
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