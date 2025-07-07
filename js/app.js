import Router from './router.js';
import Config from './config.js';

async function registerServiceWorker() {
  if ('serviceWorker' in navigator) {
    try {
      const registration = await navigator.serviceWorker.register('/proyek-akhir/service-worker.js', {
        scope: '/proyek-akhir/',
      });
      console.log('✅ Service Worker registered:', registration.scope);

      if (registration.active) {
        setupPushNotifications(registration);
        setupPushButtons(registration);
      }
    } catch (err) {
      console.error('❌ Failed to register Service Worker:', err);
    }
  }
}

async function setupPushNotifications(registration) {
  if (!('PushManager' in window)) return;

  const permission = await Notification.requestPermission();
  if (permission !== 'granted') return;

  const vapidPublicKey = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk';
  const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

  try {
    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) {
      const existingKey = existingSubscription.options?.applicationServerKey;
      const sameKey = existingKey && applicationServerKey &&
        arraysAreEqual(new Uint8Array(existingKey), new Uint8Array(applicationServerKey));

      if (!sameKey) {
        console.log('🔁 Unsubscribing old push subscription...');
        await existingSubscription.unsubscribe();
      }
    }

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey,
    });

    console.log('✅ User subscribed to push:', subscription);

    const token = localStorage.getItem('storyAppToken');
    if (!token) {
      console.warn('❗ Token tidak ditemukan, tidak bisa subscribe ke server.');
      return;
    }

    const response = await fetch('https://story-api.dicoding.dev/v1/notifications/subscribe', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        endpoint: subscription.endpoint,
        keys: {
          p256dh: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('p256dh')))),
          auth: btoa(String.fromCharCode(...new Uint8Array(subscription.getKey('auth'))))
        }
      })
    });

    const result = await response.json();
    if (!response.ok) throw new Error(result.message || 'Gagal simpan subscription');

    console.log('📡 Subscription berhasil dikirim ke server:', result);

  } catch (err) {
    console.error('❌ Gagal subscribe user:', err);
  }
}

function setupPushButtons(registration) {
  const subscribeBtn = document.getElementById('subscribePushBtn');
  const unsubscribeBtn = document.getElementById('unsubscribePushBtn');
  const pushControls = document.getElementById('push-controls');

  const token = localStorage.getItem('token');
  if (!token || !pushControls) {
    pushControls?.classList.add('hidden');
    return;
  }

  pushControls.classList.remove('hidden');

  subscribeBtn?.addEventListener('click', async () => {
    await setupPushNotifications(registration);
    subscribeBtn.classList.add('hidden');
    unsubscribeBtn.classList.remove('hidden');
  });

  unsubscribeBtn?.addEventListener('click', async () => {
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      await subscription.unsubscribe();
      console.log('🔕 Berhasil unsubscribe');
    }
    unsubscribeBtn.classList.add('hidden');
    subscribeBtn.classList.remove('hidden');
  });
}

function arraysAreEqual(arr1, arr2) {
  if (!arr1 || !arr2 || arr1.length !== arr2.length) return false;
  return arr1.every((v, i) => v === arr2[i]);
}

function urlBase64ToUint8Array(base64String) {
  const padding = '='.repeat((4 - base64String.length % 4) % 4);
  const base64 = (base64String + padding).replace(/-/g, '+').replace(/_/g, '/');
  const rawData = window.atob(base64);
  return Uint8Array.from([...rawData].map(char => char.charCodeAt(0)));
}

document.addEventListener('DOMContentLoaded', () => {
  Router.init('main-content');
  registerServiceWorker();
});
