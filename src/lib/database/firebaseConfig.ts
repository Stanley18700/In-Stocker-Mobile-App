import { initializeApp, getApps, getApp } from "firebase/app";
import { initializeAuth, getReactNativePersistence, browserLocalPersistence, getAuth } from "@firebase/auth";
import { getFirestore } from "firebase/firestore";
import { Platform } from "react-native";
import AsyncStorage from "@react-native-async-storage/async-storage";

// ---------------------------------------------------------------------------
// Firebase config — EXPO_PUBLIC_* variables are inlined at build time by Metro.
// They must be accessed with DIRECT property names (not bracket/variable notation)
// so Metro can statically replace them. Do NOT use process.env[variable].
// ---------------------------------------------------------------------------

const firebaseConfig = {
    apiKey:            process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain:        process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId:         process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket:     process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId:             process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId:     process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID, // optional
};

// ---------------------------------------------------------------------------
// Singleton guard — prevents "Firebase App named '[DEFAULT]' already exists"
// and "initializeAuth() has already been called" errors on Expo hot reloads.
// Capture BEFORE calling initializeApp so the flag is accurate.
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

