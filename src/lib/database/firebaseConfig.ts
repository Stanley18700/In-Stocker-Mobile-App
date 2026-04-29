import { initializeApp, getApps, getApp, type FirebaseApp } from "firebase/app";
import {
    initializeAuth,
    browserLocalPersistence,
    getAuth,
    type Auth,
    type Persistence,
} from "firebase/auth";
import { getFirestore, type Firestore } from "firebase/firestore";
import AsyncStorage from "@react-native-async-storage/async-storage";
import { Platform } from "react-native";

// ---------------------------------------------------------------------------
// Custom AsyncStorage-backed persistence for React Native.
// IMPORTANT: Firebase Auth expects a *class* definition for persistence
// (it internally instantiates it via a singleton cache). Passing a plain
// object causes: "INTERNAL ASSERTION FAILED: Expected a class definition".
// ---------------------------------------------------------------------------

class AsyncStoragePersistence implements Persistence {
    static type: Persistence['type'] = 'LOCAL';
    type: Persistence['type'] = 'LOCAL';

    async _isAvailable() {
        try {
            await AsyncStorage.setItem('__firebase_check__', '1');
            await AsyncStorage.removeItem('__firebase_check__');
            return true;
        } catch {
            return false;
        }
    }

    async _set(key: string, value: unknown) {
        await AsyncStorage.setItem(key, JSON.stringify(value));
    }

    async _get<T>(key: string): Promise<T | null> {
        const item = await AsyncStorage.getItem(key);
        return item ? (JSON.parse(item) as T) : null;
    }

    async _remove(key: string) {
        await AsyncStorage.removeItem(key);
    }

    _addListener(_key: string, _listener: unknown) {
        // no-op: AsyncStorage does not support change listeners
    }

    _removeListener(_key: string, _listener: unknown) {
        // no-op
    }
}

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

let cachedApp: FirebaseApp | null = null;
let cachedAuth: Auth | null = null;
let cachedDb: Firestore | null = null;
let initError: Error | null = null;

function ensureErrorCode(err: unknown, code: string): Error {
    const error = err instanceof Error ? err : new Error(String(err));
    const anyError = error as any;
    if (typeof anyError.code !== 'string' || anyError.code.length === 0) {
        anyError.code = code;
    }
    return error;
}

export function getFirebaseInitError(): Error | null {
    // Ensure we try once so callers get a deterministic result.
    ensureInitialized();
    return initError;
}

function ensureInitialized() {
    if (cachedApp || initError) return;

    // Validate config early to avoid hard-crashing RN runtime.
    const apiKey = firebaseConfig.apiKey;
    if (!apiKey || typeof apiKey !== 'string') {
        initError = ensureErrorCode(new Error('Firebase not configured: missing apiKey'), 'auth/configuration-not-found');
        return;
    }

    try {
        const wasAlreadyInitialized = getApps().length > 0;
        cachedApp = wasAlreadyInitialized ? getApp() : initializeApp(firebaseConfig);

        const persistence =
            Platform.OS === 'web'
                ? browserLocalPersistence
                : AsyncStoragePersistence;

        cachedAuth = wasAlreadyInitialized
            ? getAuth(cachedApp)
            : initializeAuth(cachedApp, { persistence });

        cachedDb = getFirestore(cachedApp);
    } catch (e: any) {
        initError = e instanceof Error ? e : new Error(String(e));
    }
}

// ---------------------------------------------------------------------------
// Singleton guard — must capture BEFORE initializeApp so the flag is accurate.
// Prevents "already exists" / "already called" crashes on hot reload.
// ---------------------------------------------------------------------------

export function getFirebaseAuth(): Auth {
    ensureInitialized();
    if (cachedAuth) return cachedAuth;
    throw ensureErrorCode(initError ?? new Error('Firebase Auth is unavailable'), 'auth/configuration-not-found');
}

export function getFirestoreDb(): Firestore {
    ensureInitialized();
    if (cachedDb) return cachedDb;
    throw ensureErrorCode(initError ?? new Error('Firestore is unavailable'), 'auth/configuration-not-found');
}


