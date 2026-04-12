import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, browserLocalPersistence, getAuth } from "firebase/auth";
import { getFirestore } from "firebase/firestore";

// ---------------------------------------------------------------------------
// Firebase config — EXPO_PUBLIC_* variables are inlined at build time by Metro.
// Use DIRECT property access only (not bracket notation) so Metro can replace them.
// ---------------------------------------------------------------------------

const firebaseConfig = {
    apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId:     process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ---------------------------------------------------------------------------
// Singleton guard — must capture BEFORE initializeApp so the flag is accurate.
// Prevents "already exists" / "already called" crashes on hot reload.
// ---------------------------------------------------------------------------

const wasAlreadyInitialized = getApps().length > 0;
const app = wasAlreadyInitialized ? getApp() : initializeApp(firebaseConfig);

// ---------------------------------------------------------------------------
// Auth — browserLocalPersistence keeps the user logged in across page refreshes
// (stored in localStorage). getReactNativePersistence is a mobile-only concept
// and is not needed for web deployments.
// ---------------------------------------------------------------------------

export const auth = wasAlreadyInitialized
    ? getAuth(app)
    : initializeAuth(app, { persistence: browserLocalPersistence });

// ---------------------------------------------------------------------------
// Firestore
// ---------------------------------------------------------------------------

export const db = getFirestore(app);


