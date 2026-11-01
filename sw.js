const CACHE_NAME = 'clinic-app-v4';
const ASSETS = [
  './',
  './index.html',
  './manifest.json'
];

// حفظ الملفات عند التثبيت
self.addEventListener('install', event => {
  event.waitUntil(
    caches.open(CACHE_NAME).then(cache => {
      return cache.addAll(ASSETS);
    })
  );
});

// استرجاع الملفات من الذاكرة عند انقطاع النت
self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request).then(response => {
      return response || fetch(event.request);
    })
  );
});
