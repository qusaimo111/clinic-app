const CACHE_NAME = 'clinic-app-v10';
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './logo.png'
];

// 1. التثبيت
self.addEventListener('install', event => {
    self.skipWaiting();
    event.waitUntil(
        caches.open(CACHE_NAME).then(cache => {
            return cache.addAll(ASSETS);
        })
    );
});

// 2. التفعيل ومسح الكاش القديم
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.map(key => {
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// 3. جلب البيانات (الذكاء هنا: Cache First, then Network Dynamic Caching)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(cachedResponse => {
            // إذا الملف موجود بالكاش (مثل تيلويند والخطوط)، اعرضه فوراً
            if (cachedResponse) {
                return cachedResponse;
            }
            
            // إذا مو موجود، جيبه من النت، واحفظ نسخة منه بالكاش للمرات الجاية
            return fetch(event.request).then(networkResponse => {
                // التأكد من أن الاستجابة صحيحة قبل تخزينها
                if (!networkResponse || networkResponse.status !== 200 || networkResponse.type === 'error') {
                    return networkResponse;
                }
                
                // نأخذ نسخة من الملف لأن الاستجابة تُقرأ مرة واحدة فقط
                const responseToCache = networkResponse.clone();
                
                caches.open(CACHE_NAME).then(cache => {
                    // استثناء طلبات إضافات المتصفح من التخزين لتجنب الأخطاء
                    if (event.request.url.startsWith('http')) {
                        cache.put(event.request, responseToCache);
                    }
                });
                
                return networkResponse;
            }).catch(() => {
                console.log('أنت أوفلاين والملف غير موجود بالكاش:', event.request.url);
            });
        })
    );
});
