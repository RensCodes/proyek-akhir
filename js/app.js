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

    const vapidPublicKey = Config.VAPID_PUBLIC_KEY;
    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    try {
        const subscription = await registration.pushManager.subscribe({
            userVisibleOnly: true,
            applicationServerKey,
        });
        console.log('✅ User subscribed to push:', subscription);
    } catch (err) {
        console.error('❌ Failed to subscribe user:', err);
    }
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
