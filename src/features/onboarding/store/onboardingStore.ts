import AsyncStorage from '@react-native-async-storage/async-storage';
import { create } from 'zustand';

const ONBOARDING_KEY = 'instocker_onboarding_completed_v1';

interface OnboardingState {
    completed: boolean;
    hydrated: boolean;
    hydrate: () => Promise<void>;
    markCompleted: () => Promise<void>;
}

export const useOnboardingStore = create<OnboardingState>((set) => ({
    completed: false,
    hydrated: false,

    hydrate: async () => {
        try {
            const raw = await AsyncStorage.getItem(ONBOARDING_KEY);
            set({ completed: raw === 'true', hydrated: true });
        } catch {
            set({ hydrated: true });
        }
    },

    markCompleted: async () => {
        set({ completed: true });
        try {
            await AsyncStorage.setItem(ONBOARDING_KEY, 'true');
        } catch {
            // Non-blocking: user can continue even if persistence fails.
        }
    },
}));
