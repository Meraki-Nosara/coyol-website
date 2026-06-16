// Firebase Messaging Service Worker
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-app-compat.js');
importScripts('https://www.gstatic.com/firebasejs/10.7.1/firebase-messaging-compat.js');

firebase.initializeApp({
  apiKey: "AIzaSyBuQrhJqCwVrcY9dS4ds9Fh_V44qAl5Kxs",
  authDomain: "mibahutz-6fe32.firebaseapp.com",
  projectId: "mibahutz-6fe32",
  storageBucket: "mibahutz-6fe32.firebasestorage.app",
  messagingSenderId: "888948498498",
  appId: "1:888948498498:web:1735dc9b58dc73bf00f81a"
});

const messaging = firebase.messaging();

// Handle background messages
messaging.onBackgroundMessage((payload) => {
  console.log('Background message:', payload);
  
  const notificationTitle = payload.notification?.title || 'מיבחוץ';
  const notificationOptions = {
    body: payload.notification?.body || 'יש לך הודעה חדשה',
    icon: '/logo.svg',
    badge: '/logo.svg',
    tag: payload.data?.tag || 'mibachutz-notification',
    data: payload.data,
    vibrate: [200, 100, 200],
    actions: [
      { action: 'open', title: 'פתח' },
      { action: 'dismiss', title: 'סגור' }
    ]
  };

  self.registration.showNotification(notificationTitle, notificationOptions);
});

// Handle notification click
self.addEventListener('notificationclick', (event) => {
  event.notification.close();
  
  if (event.action === 'dismiss') return;
  
  const urlToOpen = event.notification.data?.url || '/chat';
  
  event.waitUntil(
    clients.matchAll({ type: 'window', includeUncontrolled: true }).then((windowClients) => {
      // If app is already open, focus it
      for (const client of windowClients) {
        if (client.url.includes('mibahutz.com') && 'focus' in client) {
          return client.focus();
        }
      }
      // Otherwise open new window
      if (clients.openWindow) {
        return clients.openWindow(urlToOpen);
      }
    })
  );
});
