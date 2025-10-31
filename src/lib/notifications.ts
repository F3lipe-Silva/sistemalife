import { getMessaging, getToken, onMessage } from 'firebase/messaging';
import { app } from './firebase';

// Initialize Firebase Messaging
let messaging: any = null;
try {
  messaging = typeof window !== 'undefined' ? getMessaging(app) : null;
} catch (error) {
  console.warn('Firebase Messaging not available:', error);
}

// Request permission for push notifications
export async function requestNotificationPermission(): Promise<boolean> {
  if (typeof window === 'undefined' || !messaging) {
    return false;
  }

  // Verificar se as notificações são suportadas e não estão bloqueadas
  if (!('Notification' in window)) {
    console.warn('This browser does not support notifications');
    return false;
  }

  try {
    const permission = await Notification.requestPermission();
    if (permission === 'granted') {
      console.log('Notification permission granted.');
      return true;
    } else {
      console.log('Unable to get permission to notify.');
      return false;
    }
  } catch (error) {
    console.error('Error requesting notification permission:', error);
    return false;
  }
}

// Get FCM token for the device
export async function getFCMToken(): Promise<string | null> {
  if (typeof window === 'undefined' || !messaging) {
    return null;
  }

  try {
    // Verificar se o service worker está registrado antes de tentar obter o token
    if ('serviceWorker' in navigator) {
      const registration = await navigator.serviceWorker.ready;
      if (!registration) {
        console.warn('Service worker is not ready');
        return null;
      }
    }

    // Using Firebase's default VAPID key by not specifying one
    // This avoids encoding issues with custom keys
    const currentToken = await getToken(messaging);
    
    if (currentToken) {
      console.log('Current FCM token:', currentToken);
      return currentToken;
    } else {
      console.log('No registration token available. Request permission to generate one.');
      return null;
    }
  } catch (error: any) {
    // Tratamento específico para AbortError
    if (error?.code === 'messaging/token-unsubscribe-failed') {
      console.warn('Failed to unsubscribe token, but this is not critical:', error);
      return null;
    }
    
    if (error?.message?.includes('AbortError') || error?.message?.includes('Registration failed')) {
      console.warn('Push notification registration failed. This might be due to browser settings or missing configuration:', error);
      return null;
    }
    
    console.error('An error occurred while retrieving token: ', error);
    return null;
  }
}

// Listen for messages when the app is in foreground
export function onForegroundMessage(callback: (payload: any) => void) {
  if (typeof window === 'undefined' || !messaging) {
    return () => {};
  }

  try {
    const unsubscribe = onMessage(messaging, (payload) => {
      console.log('Message received in foreground:', payload);
      callback(payload);
    });

    return unsubscribe;
  } catch (error) {
    console.error('Error setting up foreground message listener:', error);
    return () => {};
  }
}

// Save FCM token to user profile
export async function saveFCMTokenToProfile(userId: string, token: string): Promise<void> {
  try {
    if (!userId || !token) {
      throw new Error('User ID and token are required');
    }
    
    // Import Firestore from Firebase Admin
    // Note: In a client-side environment, you'll need to call an API endpoint
    // instead of directly accessing Firestore
    const response = await fetch('/api/save-fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, token }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to save FCM token');
    }
    
    console.log(`FCM token saved for user ${userId}`);
  } catch (error) {
    console.error('Error saving FCM token to profile:', error);
    throw error;
  }
}

// Remove FCM token from user profile
export async function removeFCMTokenFromProfile(userId: string, token: string): Promise<void> {
  try {
    if (!userId || !token) {
      throw new Error('User ID and token are required');
    }
    
    const response = await fetch('/api/remove-fcm-token', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ userId, token }),
    });
    
    if (!response.ok) {
      const errorData = await response.json();
      throw new Error(errorData.message || 'Failed to remove FCM token');
    }
    
    console.log(`FCM token removed for user ${userId}`);
  } catch (error) {
    console.error('Error removing FCM token from profile:', error);
    throw error;
  }
}

export { messaging };