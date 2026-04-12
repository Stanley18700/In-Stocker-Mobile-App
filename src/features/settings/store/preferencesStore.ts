// ---------------------------------------------------------------------------
// preferencesStore — persists app-level user preferences via AsyncStorage.
// Stores: currency symbol, default low-stock threshold.
// ---------------------------------------------------------------------------

import { create } from 'zustand';
import AsyncStorage from '@react-native-async-storage/async-storage';

const PREFS_KEY = 'instocker_prefs';

export interface Preferences {
    currency: string;
    threshold: number;
}

interface PreferencesState extends Preferences {
    hydrated: boolean;
    setCurrency: (currency: string) => void;
    setThreshold: (threshold: number) => void;
    hydrate: () => Promise<void>;
    persist: () => Promise<void>;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
    currency: 'K',
    threshold: 5,
    hydrated: false,

    setCurrency: (currency) => {
        set({ currency });
        get().persist();
    },

    setThreshold: (threshold) => {
        set({ threshold });
        get().persist();
    },

    // Load saved prefs from AsyncStorage (call once on app startup)
    hydrate: async () => {
        try {
            const raw = await AsyncStorage.getItem(PREFS_KEY);
            if (raw) {
                const saved: Partial<Preferences> = JSON.parse(raw);
                set({ ...saved, hydrated: true });
            } else {
                set({ hydrated: true });
            }
        } catch {
            set({ hydrated: true });
        }
    },

    // Write current prefs back to AsyncStorage
    persist: async () => {
        try {
            const { currency, threshold } = get();
            await AsyncStorage.setItem(PREFS_KEY, JSON.stringify({ currency, threshold }));
        } catch {
            // silently ignore write errors
        }
    },
}));
