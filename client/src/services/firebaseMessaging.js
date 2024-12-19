// src/services/firebaseMessaging.js
import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging'; // onMessage toegevoegd

const firebaseConfig = {
  apiKey: "AIzaSyCLTALToV8k2jljxc4lFyqmDxJwJtvpXYo",
  authDomain: "hair2-bookings.firebaseapp.com",
  projectId: "hair2-bookings",
  messagingSenderId: "907150250664",
  appId: "1:907150250664:web:0a9a2a0e280a6491e1a89d"
};

// Initialiseer Firebase
const app = initializeApp(firebaseConfig);
const messaging = getMessaging(app);

// Voeg error afhandeling toe voor messaging initialisatie
try {
  messaging.getToken();
} catch (err) {
  console.error('Messaging initialization error:', err);
}

export const requestNotificationPermission = async () => {
  try {
    if (!('Notification' in window)) {
      console.log('Deze browser ondersteunt geen notificaties');
      return null;
    }

    const permission = await Notification.requestPermission();
    console.log('Notification permission status:', permission);

    if (permission === 'granted') {
      try {
        const token = await getToken(messaging, {
          vapidKey: 'BC8VzGcrgeM8Fx58HmrhJLDr8yMvpqo9mJZdnppKoGkkBD-9nIqVDLXeuDIfxQXFFxp8zikASRmdzfOwLU7CGUU'
        });
        console.log('Firebase token:', token);
        return token;
      } catch (tokenError) {
        console.error('Error getting token:', tokenError);
        return null;
      }
    }
    
    console.log('Geen toestemming voor notificaties');
    return null;
  } catch (error) {
    console.error('Error requesting permission:', error);
    return null;
  }
};

// Verbeterde message listener met error afhandeling
export const onMessageListener = () =>
  new Promise((resolve, reject) => {
    try {
      onMessage(messaging, (payload) => {
        console.log('Received foreground message:', payload);
        resolve(payload);
      });
    } catch (err) {
      reject(err);
    }
  });

// Helper functie om te checken of notificaties mogelijk zijn
export const isNotificationSupported = () => {
  return 'Notification' in window && 
         'serviceWorker' in navigator && 
         'PushManager' in window;
};