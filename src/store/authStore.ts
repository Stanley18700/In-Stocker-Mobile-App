import { create } from 'zustand';
import { LocalUser, signIn, signOut, getCurrentUser } from '../services/authService';

// ---------------------------------------------------------------------------
// State shape
// ---------------------------------------------------------------------------

interface AuthState {
    user: LocalUser | null;
    isLoading: boolean;

    login: (email: string, password: string) => Promise<string | null>;
    logout: () => Promise<void>;
    initializeAuth: () => Promise<void>;
}

// ---------------------------------------------------------------------------
// Store
// ---------------------------------------------------------------------------

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,

    // ── login ──────────────────────────────────────────────────────────────────
    login: async (email, password) => {
        set({ isLoading: true });
        const { data: user, error } = await signIn(email, password);
        set({ isLoading: false });

        if (error || !user) return error ?? 'Login failed. Please try again.';
        set({ user });
        return null; // null = success
    },

    // ── logout ─────────────────────────────────────────────────────────────────
    logout: async () => {
        set({ isLoading: true });
        await signOut();
        set({ user: null, isLoading: false });
    },

    // ── initializeAuth ─────────────────────────────────────────────────────────
    initializeAuth: async () => {
        set({ isLoading: true });
        const { data: user } = await getCurrentUser();
        set({ user, isLoading: false });
    },
}));
