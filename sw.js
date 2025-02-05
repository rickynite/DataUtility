var GHPATH = '/DataUtility';
var APP_PREFIX = 'dupwa_';
var VERSION = 'version_001';
var URLS = [    
  `${GHPATH}/`,
  `${GHPATH}/index.html`,
  `${GHPATH}/offline.html`,
  `${GHPATH}/manifest.webmanifest`,
  `${GHPATH}/css/styles.css`,
  `${GHPATH}/img/icon-192x192.png`,
  `${GHPATH}/img/icon-512x512.png`,
  `${GHPATH}/js/main.js`,
  `${GHPATH}/js/plotting.js`,
  `${GHPATH}/sample.json`,
  `${GHPATH}/sample2.json`,
  `${GHPATH}/sample.csv`,
  'https://cdn.plot.ly/plotly-latest.min.js',
  'https://cdnjs.cloudflare.com/ajax/libs/PapaParse/5.3.0/papaparse.min.js'
];

var CACHE_NAME = APP_PREFIX + VERSION;

self.addEventListener('fetch', function (e) {
  console.log('Fetch request : ' + e.request.url);
  e.respondWith(
    caches.match(e.request).then(function (request) {
      if (request) { 
        console.log('Responding with cache : ' + e.request.url);
        return request;
      } else {       
        console.log('File is not cached, fetching : ' + e.request.url);
        return fetch(e.request);
      }
    })
  );
});

self.addEventListener('install', function (e) {
  e.waitUntil(
    caches.open(CACHE_NAME).then(function (cache) {
      console.log('Installing cache : ' + CACHE_NAME);
      return cache.addAll(URLS);
    })
  );
});

self.addEventListener('activate', function (e) {
  e.waitUntil(
    caches.keys().then(function (keyList) {
      var cacheWhitelist = keyList.filter(function (key) {
        return key.indexOf(APP_PREFIX) === 0;
      });
      cacheWhitelist.push(CACHE_NAME);
      return Promise.all(keyList.map(function (key, i) {
        if (cacheWhitelist.indexOf(key) === -1) {
          console.log('Deleting cache : ' + keyList[i]);
          return caches.delete(keyList[i]);
        }
      }));
    })
  );
});