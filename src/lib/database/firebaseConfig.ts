import { initializeApp, getApps, getApp } from "firebase/app";
import {
    initializeAuth,
    browserLocalPersistence,
    getAuth,
    type Persistence,
} from "firebase/auth";
import { getFirestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ---------------------------------------------------------------------------
// Custom AsyncStorage-backed persistence for React Native.
// Firebase v11+ removed getReactNativePersistence from the JS SDK entirely.
// This minimal adapter fulfils the Persistence interface Firebase requires.
// ---------------------------------------------------------------------------
const asyncStoragePersistence = {
    type: "LOCAL" as const,
    async _isAvailable() {
        try {
            await AsyncStorage.setItem("__firebase_check__", "1");
            await AsyncStorage.removeItem("__firebase_check__");
            return true;
        } catch {
            return false;
        }
    },
    async _set(key: string, value: unknown) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    },
    async _get<T>(key: string): Promise<T | null> {
        const item = await AsyncStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : null;
    },
    async _remove(key: string) {
        await AsyncStorage.removeItem(key);
    },
    _addListener(_key: string, _listener: unknown) {
        // no-op: AsyncStorage does not support change listeners
    },
    _removeListener(_key: string, _listener: unknown) {
        // no-op
    },
} as unknown as Persistence;

// ---------------------------------------------------------------------------
// Firebase config — EXPO_PUBLIC_* variables are inlined at build time by Metro.
// Use DIRECT property access only (not bracket notation) so Metro can replace them.
// ---------------------------------------------------------------------------

const firebaseConfig = {
    apiKey: process.env.EXPO_PUBLIC_FIREBASE_API_KEY,
    authDomain: process.env.EXPO_PUBLIC_FIREBASE_AUTH_DOMAIN,
    projectId: process.env.EXPO_PUBLIC_FIREBASE_PROJECT_ID,
    storageBucket: process.env.EXPO_PUBLIC_FIREBASE_STORAGE_BUCKET,
    messagingSenderId: process.env.EXPO_PUBLIC_FIREBASE_MESSAGING_SENDER_ID,
    appId: process.env.EXPO_PUBLIC_FIREBASE_APP_ID,
    measurementId: process.env.EXPO_PUBLIC_FIREBASE_MEASUREMENT_ID,
};

// ---------------------------------------------------------------------------
// Singleton guard — must capture BEFORE initializeApp so the flag is accurate.
// Prevents "already exists" / "already called" crashes on hot reload.
// ---------------------------------------------------------------------------

const wasAlreadyInitialized = getApps().length > 0;
const app = wasAlreadyInitialized ? getApp() : initializeApp(firebaseConfig);

// ---------------------------------------------------------------------------
// Auth persistence:
//   - Native (iOS / Android): AsyncStorage so the token survives app restarts.
//   - Web: localStorage via browserLocalPersistence.
// ---------------------------------------------------------------------------

const persistence =
    Platform.OS === "web"
        ? browserLocalPersistence
        : asyncStoragePersistence;

export const auth = wasAlreadyInitialized
    ? getAuth(app)
    : initializeAuth(app, { persistence });

// ---------------------------------------------------------------------------
// Firestore
// ---------------------------------------------------------------------------

export const db = getFirestore(app);


