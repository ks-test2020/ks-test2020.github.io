  // Your web app's Firebase configuration
  // For Firebase JS SDK v7.20.0 and later, measurementId is optional
  var firebaseConfig = {
    apiKey: "AIzaSyAY_WM17RYD1wqdsOI77xC-8_jaS4Kx7uc",
    authDomain: "test-webpush-ae575.firebaseapp.com",
    databaseURL: "https://test-webpush-ae575.firebaseio.com",
    projectId: "test-webpush-ae575",
    storageBucket: "test-webpush-ae575.appspot.com",
    messagingSenderId: "855008810220",
    appId: "1:855008810220:web:2835eb7f3799bcb98081c9",
    measurementId: "G-JFQ3H8J4L2"
  };
  // Initialize Firebase
  firebase.initializeApp(firebaseConfig);
  const messaging = firebase.messaging();
  messaging.usePublicVapidKey("BCdd5izfiIH5187pj6xbN5Deo-u-jLaahZ3bXqHT_NCiIwbCc5lhvo5i9FufXynJaEixMUoIEu4uZpvB45kfq7I");

var db = firebase.firestore();
var usersRef = db.collection("users");

// 購読確認を行う
//checkSubscription();
 
// 購読確認処理
function checkSubscription() {
    //通知の承認を確認
    messaging.requestPermission().then(function() {
        //トークンを確認
        messaging.getToken().then(function(token) {
            //トークン発行
            if (token) {
                //トークンがDBに入っているか確認
                usersRef.where('token', '==', token).get().then(function(oldLog){
                    if(oldLog.empty){
                    //入っていなければ購読ボタン表示
                        console.log('トークンは登録されていません。');
                        $('#notification p.caution').text('通知を購読していません。');
                        ShowEntryButton();
                    } else {
                    //入っていれば購読状況確認
                        console.log('トークンはすでに登録されています。');
                        oldLog.forEach(function(doc){
                            var data = doc.data();
                            if(data.subscribe == true){
                            //購読している（＝停止ボタン表示）
                                $('#notification p.caution').text('通知を購読しています。');
                                ShowRemoveButton();
                            } else {
                            //購読していない（＝開始ボタン表示）
                                $('#notification p.caution').text('購読を解除しました。');
                                ShowEntryButton();
                            }
                        });
                    }
                });
            } else {
                    console.log('通知の承認が得られませんでした。');
                    $('#notification p.caution').text('購読を開始できませんでした。');
                    ShowEntryButton();
            }
        }).catch(function(err) {
                console.log('トークンを取得できませんでした。', err);
                $('#notification p.caution').text('購読を開始できませんでした。');
                ShowEntryButton();
        });
    }).catch(function (err) {
        //プッシュ通知未対応
            console.log('通知の承認が得られませんでした。', err);
            $('#notification p.caution').text('プッシュ通知が許可されていません。ブラウザの設定を確認してください。');
            ShowEntryButton();
    });
}
 
// 購読処理
function getSubscription() {
    //通知の承認を確認
  messaging.requestPermission().then(function() {
console.log(messaging.getToken());
        //トークンを確認
        messaging.getToken().then(function(token) {
            //トークン発行
            if (token) {
                //トークンがDBに入っているか確認
                usersRef.where('token', '==', token).get().then(function(oldLog){
                    if(oldLog.empty){
                    //トークン登録がなければトークン登録・購読設定
                        usersRef.add({
                            token: token,
                            subscribe: true
                        });
                        console.log('トークン新規登録しました。');
                    } else {
                    //トークン登録があれば購読に設定変更
                        oldLog.forEach(function(doc){
                            console.log('トークンはすでに登録されています。');
                            usersRef.doc(doc.id).update({
                                subscribe: true
                            })
                        });
                    }
                    //購読解除ボタン表示
                    ShowRemoveButton();
                });
                //購読状況表示更新
                $('#notification p.caution').text('通知を購読しています。');
            } else {
                console.log('通知の承認が得られませんでした。');
                $('#notification p.caution').text('購読を開始できませんでした。');
                ShowEntryButton();
            }
        }).catch(function(err) {
            console.log('トークンを取得できませんでした。', err);
            $('#notification p.caution').text('購読を開始できませんでした。');
            ShowEntryButton();
        });
  }).catch(function (err) {
        console.log('通知の承認が得られませんでした。', err);
        $('#notification p.caution').text('プッシュ通知が許可されていません。ブラウザの設定を確認してください。');
        ShowEntryButton();
    });
}
 
// 購読解除処理
function removeSubscription() {
    //通知の承認を確認
    messaging.requestPermission().then(function() {
        //トークンを確認
        messaging.getToken().then(function(token) {
            //トークン発行
            if (token) {
                //トークンがDBに入っているか確認
                usersRef.where('token', '==', token).get().then(function(oldLog){
                    if(oldLog.empty){
                    //トークン登録がなければ購読ボタン表示
                        console.log('トークンは登録されていません。');
                        ShowEntryButton();
                    } else {
                    //トークン登録があれば購読解除を行う
                        oldLog.forEach(function(doc){
                            usersRef.doc(doc.id).update({
                                subscribe: false
                            })
                            .then(function() {
                                console.log("購読を解除しました。");
                                ShowEntryButton();
                            }).catch(function(error) {
                                console.error("Error removing document: ", error);
                            });
                        });
                    }
                });
                //購読状況表示更新
                $('#notification p.caution').text('購読を解除しました。');
            } else {
                console.log('トークンを取得できませんでした。');
                $('#notification p.caution').text('購読を開始できませんでした。');
            }
        }).catch(function(err) {
            console.log('トークンを取得できませんでした。', err);
            $('#notification p.caution').text('購読を開始できませんでした。');
        });
    }).catch(function (err) {
        console.log('通知の承認が得られませんでした。', err);
        $('#notification p.caution').text('プッシュ通知が許可されていません。ブラウザの設定を確認してください。');
        ShowEntryButton();
    });
}
 
//　トークン表示
function displayToken() {
  messaging.getToken().then(token => {
        if (token) {
            console.log(token);
        } else {
            console.log('トークンを取得できませんでした。');
        }
  }).catch(function (err) {
    console.log('トークンの取得時にエラーが発生しました。', err);
  });
}
 
 
//購読ボタン表示
function ShowEntryButton() {
    $('#EntryButton').show();
    $('#RemoveButton').hide();
}
 
//購読取消ボタン表示
function ShowRemoveButton() {
    $('#EntryButton').hide();
    $('#RemoveButton').show();
}

// フォアグラウンドでのプッシュ通知受信
messaging.onMessage(function(payload) {
    var notificationTitle = payload.data.title; // タイトル
    var notificationOptions = {
      body: payload.data.body, // 本文
      icon: 'https://ks-test2020.github.io/adpDSC_7090-760x507-1.jpg', // アイコン
      click_action: 'https://ks-test2020.github.io/p.html' // 飛び先URL
    };
 
    if (!("Notification" in window)) {
       console.log("通知機能に対応していません");
        // ブラウザが通知機能に対応しているかを判定
    } else if (Notification.permission === "granted") {
        // 通知許可されていたら通知する
        var notification = new Notification(notificationTitle,notificationOptions);
    }
});