// Import the functions you need from the SDKs you need
import { initializeApp, getApps, getApp } from "firebase/app";
import { getAuth, initializeAuth, getReactNativePersistence } from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from '@react-native-async-storage/async-storage';

// Your web app's Firebase configuration
const firebaseConfig = {
  "projectId": "systemlife",
  "appId": "1:128818391760:web:273fc92c29be4eec870cd5",
  "storageBucket": "systemlife.firebasestorage.app",
  "apiKey": "AIzaSyDR0CxFNgPu7cdYC5Lz8ck--XZc5uUWkYQ",
  "authDomain": "systemlife.firebaseapp.com",
  "measurementId": "",
  "messagingSenderId": "128818391760"
};

// Initialize Firebase
console.log('🔥 Inicializando Firebase...');
const app = !getApps().length ? initializeApp(firebaseConfig) : getApp();
console.log('🔥 Firebase inicializado com sucesso!');

// Initialize Auth with persistence
// We need to check if auth is already initialized to avoid errors in hot reload
let auth;
try {
  auth = initializeAuth(app, {
    persistence: getReactNativePersistence(AsyncStorage)
  });
} catch (e) {
  auth = getAuth(app);
}

const db = getFirestore(app);

export { app, auth, db };
