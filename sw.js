const CACHE_NAME = 'clinic-app-v8'; // كل ما تعدل التطبيق، ارفع هذا الرقم
const ASSETS = [
    './',
    './index.html',
    './manifest.json',
    './logo.png' // تأكد من اسم صورة الشعار عندك
];

// 1. التثبيت وتخطي الانتظار
self.addEventListener('install', event => {
    self.skipWaiting(); // أمر إجباري لتخطي مرحلة الانتظار واستلام التحديث فوراً
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
                    // إذا كان اسم الكاش لا يطابق الإصدار الحالي، احذفه
                    if (key !== CACHE_NAME) {
                        return caches.delete(key);
                    }
                })
            );
        }).then(() => self.clients.claim()) // أمر إجباري للسيطرة على كل الصفحات المفتوحة فوراً
    );
});

// 3. جلب البيانات (العمل أوفلاين)
self.addEventListener('fetch', event => {
    event.respondWith(
        caches.match(event.request).then(response => {
            return response || fetch(event.request);
        })
    );
});
