// Firebase Admin SDK initialization
import { initializeApp, getApps, getApp } from 'firebase-admin/app';
import { getFirestore } from 'firebase-admin/firestore';
import { getMessaging } from 'firebase-admin/messaging';

// Only initialize if not already initialized
let adminApp: any;
try {
  if (getApps().length === 0) {
    adminApp = initializeApp();
    console.log('Firebase Admin initialized');
  } else {
    adminApp = getApp();
    console.log('Firebase Admin already initialized');
  }
} catch (error) {
  console.error('Firebase Admin initialization failed:', error);
  adminApp = null;
}

// Initialize Firestore
let firestore: any = null;
try {
  if (adminApp) {
    firestore = getFirestore(adminApp);
  }
} catch (error) {
  console.error('Firestore initialization failed:', error);
}

// Initialize Firebase Messaging
let messaging: any = null;
try {
  if (adminApp) {
    messaging = getMessaging(adminApp);
  }
} catch (error) {
  console.error('Firebase Messaging initialization failed:', error);
}

export { adminApp as admin, firestore, messaging };