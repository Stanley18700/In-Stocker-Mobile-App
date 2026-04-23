// ---------------------------------------------------------------------------
// preferencesStore — user preferences persisted in Firestore.
// Stores: currency symbol, default low-stock threshold.
// ---------------------------------------------------------------------------

import { create } from 'zustand';
import { preferencesService } from '../services/preferencesService';

export interface Preferences {
    currency: string;
    threshold: number;
}

interface PreferencesState extends Preferences {
    hydrated: boolean;
    isSaving: boolean;
    setCurrency: (currency: string) => void;
    setThreshold: (threshold: number) => void;
    hydrate: (userId: string) => Promise<void>;
    savePreferences: (userId: string) => Promise<void>;
    resetToDefaults: () => void;
}

export const usePreferencesStore = create<PreferencesState>((set, get) => ({
    currency: preferencesService.defaults().currency,
    threshold: preferencesService.defaults().threshold,
    hydrated: false,
    isSaving: false,

    setCurrency: (currency) => {
        set({ currency });
    },

    setThreshold: (threshold) => {
        set({ threshold });
    },

    // Load saved prefs from Firestore after auth user is available
    hydrate: async (userId: string) => {
        try {
            const saved = await preferencesService.getPreferences(userId);
            set({ ...saved, hydrated: true });
        } catch {
            set({ hydrated: true });
        }
    },

    savePreferences: async (userId: string) => {
        set({ isSaving: true });
        try {
            const { currency, threshold } = get();
            await preferencesService.savePreferences(userId, { currency, threshold });
        } catch {
            throw new Error('Failed to save preferences.');
        } finally {
            set({ isSaving: false });
        }
    },

    resetToDefaults: () =>
        set({
            ...preferencesService.defaults(),
            hydrated: false,
        }),
}));
