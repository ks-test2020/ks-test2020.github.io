var CACHE_NAME  = 'test-cache-v8-10';
var urlsToCache = [
    '/',
    'p.html',
    'adpDSC_7090-760x507-1.jpg',
    'icons/freeicon-192x192.png',
    'icons/freeicon-512x512.png',
//    'offline.html'
];
// 残したいキャッシュのバージョン
const CACHE_KEYS = [
  CACHE_NAME
];

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME)
        .then(
            function(cache) {
                // 指定したリソースをキャッシュへ追加
                return cache.addAll(urlsToCache.map(url => new Request(url, {credentials: 'same-origin'})));
            })
        );
    console.log('[ServiceWorker] Install');
});

// 新しいバージョンのService Workerが有効化されたとき
self.addEventListener('activate', e => {
    e.waitUntil(
        caches.keys().then(keys => {
            return Promise.all(
                keys.filter(key => {
                    return !CACHE_KEYS.includes(key);
                }).map(key => {
                    return caches.delete(key);
                })
            );
        })
    );
    console.log('[ServiceWorker] Activate');
});

// 現状では、この処理を書かないとService Workerが有効と判定されないようです
self.addEventListener('fetch', function(event) {
    // window.navifator（ユーザーエージェントの状態や身元情報を表します）
    var online = navigator.onLine;

    // ファイルパス ~/test.htmlにアクセスすると、このファイル自体は無いがServiceWorkerがResponseを作成して表示してくれる
    if (event.request.url.indexOf('test.html') != -1) {
        return event.respondWith(new Response('任意のURLの内容をここで自由に返却できる'));
    }

    if (online) {
        console.log('ONLINE');
        //このパターンの処理では、Responseだけクローンすれば問題ない
        //cloneEventRequest = event.request.clone();
        event.respondWith(
            caches.match(event.request)
            .then(
                function(response) {
                    if (response) {
                        //オンラインでもローカルにキャッシュでリソースがあればそれを返す
                        //ここを無効にすればオンラインのときは常にオンラインリソースを取りに行き、その最新版をキャッシュにPUTする
                        return response;
                    }
                    //request streem 1
                    return fetch(event.request)
                        .then(function(response) {
                            //ローカルキャッシュになかったからネットワークから落とす
                            //ネットワークから落とせてればここでリソースが返される

                            // Responseはストリームなのでキャッシュで使用してしまうと、ブラウザの表示で不具合が起こる(っぽい)ので、複製したものを使う
                            cloneResponse = response.clone();

                            if (response) {
                                if (response || response.status == 200) {
                                    console.log('正常にリソースを取得');
                                    caches.open(CACHE_NAME)
                                        .then(function(cache) {
                                            console.log('キャッシュへ保存');
                                            //初回表示でエラー起きているが致命的でないので保留
                                            cache.put(event.request, cloneResponse)
                                                .then(function() {
                                                    console.log('保存完了');
                                                });
                                        });
                                } else {
                                    return event.respondWith(new Response('200以外のエラー'));
                                }
                                return response;
                            }
                        }).catch(function(error) {
                            return console.log(error);
                        });
                })
        );
    } else {
        console.log('OFFLINE');
        event.respondWith(
            caches.match(event.request)
            .then(function(response) {
                // キャッシュがあったのでそのレスポンスを返す
                if (response) {
                    return response;
                }
                //オフラインでキャッシュもなかったパターン
                return caches.match('p.html')
                    .then(function(responseNodata) {
                        return responseNodata;
                    });
            })
        );
    }
});
 self.addEventListener('push', (event) => {
    const options = {
        body: 'This notification was generated from a push!',
        icon: '',
        data: {
            dateOfArrival: Date.now(),
            primaryKey: '2'
        },
        actions: [
            {
                action: 'explore', title: 'Explore this new world',
                icon: ''
            },
            {
                action: 'close', title: 'Close',
                icon: ''
            },
        ]
    };
    event.waitUntil(
        self.registration.showNotification('Title', options)
    )
    });