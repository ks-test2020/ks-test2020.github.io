self.addEventListener("push", function (event) {
  if (event.data) {
     console.log(event.data.text());
  } else {
     console.log('No Data');
  }

  const title ="test";
  const options = {
    body: "body",
    icon: './icons/freeicon-192.png',
    badge: '',
  };
  event.waitUntil(self.registration.showNotification(title, options));
  });