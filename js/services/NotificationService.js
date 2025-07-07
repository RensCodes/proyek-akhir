// File: services/NotificationService.js

const VAPID_PUBLIC_KEY = 'BCCs2eonMI-6H2ctvFaWg-UYdDv387Vno_bzUzALpB442r2lCnsHmtrx8biyPi_E-1fSGABK_Qs_GlvPoJJqxbk'; 
const NotificationService = {
  async isSubscribed() {
    if (!('serviceWorker' in navigator)) return false;

    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    return !!subscription;
  },

  async subscribeUser() {
    if (!('serviceWorker' in navigator)) throw new Error("Service Worker tidak didukung.");
    if (!('PushManager' in window)) throw new Error("Push API tidak didukung di browser ini.");

    const registration = await navigator.serviceWorker.ready;

    const existingSubscription = await registration.pushManager.getSubscription();
    if (existingSubscription) return existingSubscription;

    const convertedVapidKey = this._urlBase64ToUint8Array(VAPID_PUBLIC_KEY);

    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey: convertedVapidKey
    });

    // Kirim subscription ke backend (jika backend mendukung)
    await this._sendSubscriptionToServer(subscription);

    return subscription;
  },

  async unsubscribeUser() {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();
    if (subscription) {
      // Kirim info ke backend kalau mau unsubscribe (opsional)
      await this._removeSubscriptionFromServer(subscription);

      return await subscription.unsubscribe();
    }
    return false;
  },

  async _sendSubscriptionToServer(subscription) {
    try {
      await fetch('/api/subscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('[NotificationService] Gagal kirim subscription ke server:', error);
    }
  },

  async _removeSubscriptionFromServer(subscription) {
    try {
      await fetch('/api/unsubscribe', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(subscription)
      });
    } catch (error) {
      console.error('[NotificationService] Gagal hapus subscription dari server:', error);
    }
  },

  _urlBase64ToUint8Array(base64String) {
    const padding = '='.repeat((4 - base64String.length % 4) % 4);
    const base64 = (base64String + padding)
      .replace(/\-/g, '+')
      .replace(/_/g, '/');

    const rawData = atob(base64);
    const outputArray = new Uint8Array(rawData.length);

    for (let i = 0; i < rawData.length; ++i) {
      outputArray[i] = rawData.charCodeAt(i);
    }
    return outputArray;
  }
};

export default NotificationService;
