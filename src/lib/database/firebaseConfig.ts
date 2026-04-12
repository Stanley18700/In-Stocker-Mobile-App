import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, browserLocalPersistence, getAuth } from "@firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ---------------------------------------------------------------------------
// Validate required environment variables at startup.
// If any are missing, throw a clear error rather than a cryptic Firebase one.
// ---------------------------------------------------------------------------

const REQUIRED_VARS = [
    'EXPO_PUBLIC_FIREBASE_API_KEY',
    'EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN',
    'EXPO_PUBLIC_FIREBASE_PROJECT_ID',
    'EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET',
    'EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID',
    'EXPO_PUBLIC_FIREBASE_APP_ID',
] as const;

const missing = REQUIRED_VARS.filter((key) => !process.env[key]);
if (missing.length > 0) {
    throw new Error(
        `[firebaseConfig] Missing environment variables:\n${missing.join('\n')}\n` +
        'Make sure your .env file exists and all EXPO_PUBLIC_FIREBASE_* values are set.'
    );
}

const firebaseConfig = {
    apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY!,
    authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN!,
    projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID!,
    storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET!,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID!,
    appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID!,
    measurementId:     process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID, // optional
};

// ---------------------------------------------------------------------------
// Singleton guard — prevents "Firebase App named '[DEFAULT]' already exists"
// and "initializeAuth() has already been called" errors on Expo hot reloads.
// We must capture this BEFORE calling initializeApp.
// ---------------------------------------------------------------------------

const wasAlreadyInitialized = getApps().length > 0;
const app = wasAlreadyInitialized ? getApp() : initializeApp(firebaseConfig);

// ---------------------------------------------------------------------------
// Auth — use the correct persistence adapter per platform.
// On hot reload the auth instance already exists, so we just retrieve it.
// ---------------------------------------------------------------------------

export const auth = wasAlreadyInitialized
    ? getAuth(app)
    : initializeAuth(app, {
        persistence: Platform.OS === 'web'
            ? browserLocalPersistence
            : getReactNativePersistence(AsyncStorage),
    });

// ---------------------------------------------------------------------------
// Firestore
// ---------------------------------------------------------------------------

export const db = getFirestore(app);

