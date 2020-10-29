'use strict';
importScripts('https://www.gstatic.com/firebasejs/5.5.2/firebase-app.js');
importScripts('https://www.gstatic.com/firebasejs/5.5.2/firebase-messaging.js');

var CACHE_NAME  = 'test-cache-v8-10';
var urlsToCache = [
    '/',
    'p.html',
    'adpDSC_7090-760x507-1.jpg',
    'icons/freeicon-192x192.png',
    'icons/freeicon-512x512.png',
//    'offline.html'
];
// �c�������L���b�V���̃o�[�W����
const CACHE_KEYS = [
  CACHE_NAME
];

firebase.initializeApp({
  'messagingSenderId': '855008810220'
});

const messaging = firebase.messaging();

self.addEventListener('install', function(e) {
    e.waitUntil(
        caches.open(CACHE_NAME)
        .then(
            function(cache) {
                // �w�肵�����\�[�X���L���b�V���֒ǉ��i�ȉ���AMP�ɂ��Ή��j
                return cache.addAll(urlsToCache.map(url => new Request(url, {credentials: 'same-origin'})));
            })
        );
    console.log('[ServiceWorker] Install');
});

// �V�����o�[�W������Service Worker���L�������ꂽ�Ƃ�
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

// ����ł́A���̏����������Ȃ���Service Worker���L���Ɣ��肳��Ȃ��悤�ł�
self.addEventListener('fetch', function(event) {
    // window.navifator�i���[�U�[�G�[�W�F���g�̏�Ԃ�g������\���܂��j
    var online = navigator.onLine;

    // �t�@�C���p�X ~/test.html�ɃA�N�Z�X����ƁA���̃t�@�C�����͖̂�����ServiceWorker��Response���쐬���ĕ\�����Ă����
    if (event.request.url.indexOf('test.html') != -1) {
        return event.respondWith(new Response('�C�ӂ�URL�̓��e�������Ŏ��R�ɕԋp�ł���'));
    }

    if (online) {
        console.log('ONLINE');
        //���̃p�^�[���̏����ł́AResponse�����N���[������Ζ��Ȃ�
        //cloneEventRequest = event.request.clone();
        event.respondWith(
            caches.match(event.request)
            .then(
                function(response) {
                    if (response) {
                        //�I�����C���ł����[�J���ɃL���b�V���Ń��\�[�X������΂����Ԃ�
                        //�����𖳌��ɂ���΃I�����C���̂Ƃ��͏�ɃI�����C�����\�[�X�����ɍs���A���̍ŐV�ł��L���b�V����PUT����
                        return response;
                    }
                    //request streem 1
                    return fetch(event.request)
                        .then(function(response) {
                            //���[�J���L���b�V���ɂȂ���������l�b�g���[�N���痎�Ƃ�
                            //�l�b�g���[�N���痎�Ƃ��Ă�΂����Ń��\�[�X���Ԃ����

                            // Response�̓X�g���[���Ȃ̂ŃL���b�V���Ŏg�p���Ă��܂��ƁA�u���E�U�̕\���ŕs����N����(���ۂ�)�̂ŁA�����������̂��g��
                            cloneResponse = response.clone();

                            if (response) {
                                if (response || response.status == 200) {
                                    console.log('����Ƀ��\�[�X���擾');
                                    caches.open(CACHE_NAME)
                                        .then(function(cache) {
                                            console.log('�L���b�V���֕ۑ�');
                                            //����\���ŃG���[�N���Ă��邪�v���I�łȂ��̂ŕۗ�
                                            cache.put(event.request, cloneResponse)
                                                .then(function() {
                                                    console.log('�ۑ�����');
                                                });
                                        });
                                } else {
                                    return event.respondWith(new Response('200�ȊO�̃G���['));
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
                // �L���b�V�����������̂ł��̃��X�|���X��Ԃ�
                if (response) {
                    return response;
                }
                //�I�t���C���ŃL���b�V�����Ȃ������p�^�[��
                return caches.match('p.html')
                    .then(function(responseNodata) {
                        return responseNodata;
                    });
            })
        );
    }
});
// 4 firebase(https://qiita.com/TakeshiNickOsanai/items/cbb0247cd9a893dc0a6b)
messaging.setBackgroundMessageHandler(function (payload) {
  console.log('[firebase-messaging-sw.js] Received background message ', payload);
  // Customize notification here
  let notificationTitle = 'Background Message Title';
  let notificationOptions = {
    body: 'Background Message body.',
  };

  return self.registration.showNotification(notificationTitle,
    notificationOptions);
});