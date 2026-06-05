import { supabase } from './supabaseClient';

// Helper to convert VAPID key to Uint8Array
const urlBase64ToUint8Array = (base64String: string) => {
  const padding = '='.repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding)
    .replace(/-/g, '+')
    .replace(/_/g, '/');

  const rawData = window.atob(base64);
  const outputArray = new Uint8Array(rawData.length);

  for (let i = 0; i < rawData.length; ++i) {
    outputArray[i] = rawData.charCodeAt(i);
  }
  return outputArray;
};

export const isPushSupported = (): boolean => {
  return 'serviceWorker' in navigator && 'PushManager' in window;
};

export const getNotificationPermissionState = (): NotificationPermission => {
  if (!('Notification' in window)) return 'denied';
  return Notification.permission;
};

export const requestNotificationPermission = async (): Promise<NotificationPermission> => {
  if (!('Notification' in window)) return 'denied';
  return await Notification.requestPermission();
};

export const subscribeUserToPush = async (userId: string): Promise<boolean> => {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    
    // Retrieve public VAPID key
    const vapidPublicKey = import.meta.env.VITE_VAPID_PUBLIC_KEY;
    if (!vapidPublicKey) {
      console.error('VITE_VAPID_PUBLIC_KEY is not defined in environment variables.');
      return false;
    }

    const applicationServerKey = urlBase64ToUint8Array(vapidPublicKey);

    // Subscribe
    const subscription = await registration.pushManager.subscribe({
      userVisibleOnly: true,
      applicationServerKey
    });

    // Parse keys
    const subJson = subscription.toJSON();
    if (!subJson.endpoint || !subJson.keys?.p256dh || !subJson.keys?.auth) {
      console.error('Invalid subscription payload.');
      return false;
    }

    // Save to Supabase DB
    const { error } = await supabase.from('push_subscriptions').upsert({
      user_id: userId,
      endpoint: subJson.endpoint,
      p256dh: subJson.keys.p256dh,
      auth: subJson.keys.auth
    });

    if (error) {
      console.error('Error saving push subscription to DB:', error);
      return false;
    }

    return true;
  } catch (error) {
    console.error('Failed to subscribe user to push:', error);
    return false;
  }
};

export const unsubscribeUserFromPush = async (userId: string): Promise<boolean> => {
  if (!isPushSupported()) return false;

  try {
    const registration = await navigator.serviceWorker.ready;
    const subscription = await registration.pushManager.getSubscription();

    if (subscription) {
      const endpoint = subscription.endpoint;
      await subscription.unsubscribe();

      // Delete from Supabase DB
      const { error } = await supabase
        .from('push_subscriptions')
        .delete()
        .eq('user_id', userId)
        .eq('endpoint', endpoint);

      if (error) {
        console.error('Error deleting push subscription from DB:', error);
        return false;
      }
    }
    return true;
  } catch (error) {
    console.error('Failed to unsubscribe user from push:', error);
    return false;
  }
};
