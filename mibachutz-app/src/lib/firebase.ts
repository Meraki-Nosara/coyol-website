import { initializeApp } from 'firebase/app';
import { getMessaging, getToken, onMessage } from 'firebase/messaging';

const firebaseConfig = {
  apiKey: "AIzaSyBuQrhJqCwVrcY9dS4ds9Fh_V44qAl5Kxs",
  authDomain: "mibahutz-6fe32.firebaseapp.com",
  projectId: "mibahutz-6fe32",
  storageBucket: "mibahutz-6fe32.firebasestorage.app",
  messagingSenderId: "888948498498",
  appId: "1:888948498498:web:1735dc9b58dc73bf00f81a"
};

const VAPID_KEY = 'BKThwKsVpMRGIV1OAPaxaERqyzewVWxuLMkfIPXaRyvsUSGEMtLBKonsGc5ojqKJGK9iH2mEd-kOgEQUg21aTsY';

let app: any = null;
let messaging: any = null;

export function initFirebase() {
  if (typeof window === 'undefined') return null;
  
  if (!app) {
    app = initializeApp(firebaseConfig);
  }
  
  if (!messaging && 'Notification' in window) {
    try {
      messaging = getMessaging(app);
    } catch (e) {
      console.error('Failed to init messaging:', e);
    }
  }
  
  return { app, messaging };
}

export async function requestNotificationPermission(): Promise<string | null> {
  if (typeof window === 'undefined') return null;
  
  try {
    const permission = await Notification.requestPermission();
    if (permission !== 'granted') {
      console.log('Notification permission denied');
      return null;
    }
    
    const { messaging } = initFirebase() || {};
    if (!messaging) return null;
    
    const token = await getToken(messaging, { vapidKey: VAPID_KEY });
    console.log('FCM Token:', token);
    return token;
  } catch (error) {
    console.error('Error getting notification permission:', error);
    return null;
  }
}

export function onForegroundMessage(callback: (payload: any) => void) {
  const { messaging } = initFirebase() || {};
  if (!messaging) return;
  
  onMessage(messaging, (payload) => {
    console.log('Foreground message:', payload);
    callback(payload);
  });
}
