// public/firebase-messaging-sw.js
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/9.0.0/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyCLTALToV8k2jljxc4lFyqmDxJwJtvpXYo",
  authDomain: "hair2-bookings.firebaseapp.com",
  projectId: "hair2-bookings",
  messagingSenderId: "907150250664",
  appId: "1:907150250664:web:0a9a2a0e280a6491e1a89d"
});

const messaging = firebase.messaging();

messaging.onBackgroundMessage((payload) => {
  console.log('Received background message:', payload);

  const notificationOptions = {
    body: payload.notification.body,
    icon: '/favicon.ico' // Zorg dat dit icoon bestaat in je public folder
  };

  self.registration.showNotification(
    payload.notification.title,
    notificationOptions
  );
});