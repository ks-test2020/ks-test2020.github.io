var CACHE_KEY  = 'test-cache-v8-10';
const VERSION = "1";
const ORIGIN = location.protocol + '//' + location.hostname;

var urlsToCache = [
    ORIGIN + '/',
    ORIGIN + 'p.html',
    ORIGIN + 'adpDSC_7090-760x507-1.jpg',
    ORIGIN + 'icons/freeicon-192x192.png',
    ORIGIN + 'icons/freeicon-512x512.png',
];
// 残したいキャッシュのバージョン
const CACHE_KEYS = [
  CACHE_KEY
];

importScripts('https://www.gstatic.com/firebasejs/8.0.0/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/8.0.0/firebase-messaging.js');

  // Initialize Firebase
firebase.initializeApp({
    'apiKey': 'AIzaSyAY_WM17RYD1wqdsOI77xC-8_jaS4Kx7uc',
    'authDomain': 'test-webpush-ae575.firebaseapp.com',
    'databaseURL': 'https://test-webpush-ae575.firebaseio.com',
    'projectId': 'test-webpush-ae575',
    'storageBucket': 'test-webpush-ae575.appspot.com',
    'messagingSenderId': '855008810220',
    'appId': '1:855008810220:web:2835eb7f3799bcb98081c9',
    'measurementId': 'G-JFQ3H8J4L2'
});

const messaging = firebase.messaging();

self.addEventListener('install', event => {
    event.waitUntil(
        caches.open(CACHE_KEY).then(cache => {
            return Promise.all(
                STATIC_FILES.map(url => {
                    return fetch(new Request(url, { cache: 'no-cache', mode: 'no-cors' })).then(response => {
                    return cache.put(url, response);
                    });
                })
            );
        })
    );
});
 
self.addEventListener('activate', event => {
    event.waitUntil(
        caches.keys().then((cacheNames) => {
            return cacheNames.filter((cacheName) => {
                // CACHE_KEYではないキャッシュを探す
                return cacheName !== CACHE_KEY;
            });
            }).then((cachesToDelete) => {
            return Promise.all(cachesToDelete.map((cacheName) => {
                // いらないキャッシュを削除する
                return caches.delete(cacheName);
            }));
        })
    );
});
 
self.addEventListener('fetch', event => {
    // POSTの場合はキャッシュを使用しない
    if ('POST' === event.request.method) {
        return;
    }
 
    event.respondWith(
        caches.match(event.request)
        .then((response) => {
            // キャッシュ内に該当レスポンスがあれば、それを返す
            if (response) {
                return response;
            }
 
          // 重要：リクエストを clone する。リクエストは Stream なので
          // 一度しか処理できない。ここではキャッシュ用、fetch 用と2回
          // 必要なので、リクエストは clone しないといけない
            let fetchRequest = event.request.clone();
 
            return fetch(fetchRequest)
            .then((response) => {
                if (!response || response.status !== 200 || response.type !== 'basic') {
                    // キャッシュする必要のないタイプのレスポンスならそのまま返す
                    return response;
                }
 
                // 重要：レスポンスを clone する。レスポンスは Stream で
                // ブラウザ用とキャッシュ用の2回必要。なので clone して
                // 2つの Stream があるようにする
                let responseToCache = response.clone();
 
                caches.open(CACHE_KEY)
                .then((cache) => {
                    cache.put(event.request, responseToCache);
                });
 
                return response;
            });
        })
    );
});

// バックグラウンドでのプッシュ通知受信
messaging.setBackgroundMessageHandler(function(payload) {
    console.log('[firebase-messaging-sw.js] Received background message ', payload);
    // Customize notification here
    var notificationTitle = payload.notification.title; // タイトル
    var notificationOptions = {
            body: payload.notification.body, // 本文
            icon: payload.notification.icon, // アイコン
    };
 
    self.registration.showNotification(notificationTitle,
    notificationOptions);
});