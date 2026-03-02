// ---------------------------------------------------------------------------
// Unified Auth Store — single source of truth for authentication state.
// Backend: Firebase Auth + Firestore user profiles.
// ---------------------------------------------------------------------------

import { create } from 'zustand';
import { User } from '../../../shared/types/user';
import { authService } from '../services/authService';

interface AuthState {
    user: User | null;
    isLoading: boolean;

    // Granular setters (used by useAuth hook)
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    reset: () => void;
    updateUser: (updates: Partial<Pick<User, 'shopName' | 'ownerName'>>) => void;

    // High-level actions (used by screens directly)
    login: (email: string, password: string) => Promise<string | null>;
    logout: () => Promise<void>;
    initializeAuth: () => Promise<void>;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,

    // ── granular setters ───────────────────────────────────────────────────
    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
    reset: () => set({ user: null, isLoading: false }),    updateUser: (updates) =>
        set((state) =>
            state.user ? { user: { ...state.user, ...updates } } : {}
        ),
    // ── login ──────────────────────────────────────────────────────────────
    login: async (email, password) => {
        set({ isLoading: true });
        try {
            const { user } = await authService.signIn(email, password);
            set({ user, isLoading: false });
            return null; // null = success
        } catch (e: any) {
            set({ isLoading: false });
            const code: string = e?.code ?? '';
            const friendly: Record<string, string> = {
                'auth/invalid-credential': 'Incorrect email or password.',
                'auth/user-not-found': 'No account found with this email.',
                'auth/wrong-password': 'Incorrect password.',
                'auth/invalid-email': 'Please enter a valid email address.',
                'auth/user-disabled': 'This account has been disabled.',
                'auth/too-many-requests': 'Too many attempts. Please try again later.',
                'auth/network-request-failed': 'Network error. Check your connection.',
                'auth/configuration-not-found': 'Authentication is not configured. Contact support.',
                'auth/operation-not-allowed': 'Email/Password sign-in is not enabled.',
            };
            return friendly[code] ?? 'Login failed. Please try again.';
        }
    },

    // ── logout ─────────────────────────────────────────────────────────────
    logout: async () => {
        set({ isLoading: true });
        await authService.signOut();
        set({ user: null, isLoading: false });
    },

    // ── initializeAuth ─────────────────────────────────────────────────────
    initializeAuth: async () => {
        set({ isLoading: true });
        try {
            const userId = await authService.getCurrentUserId();
            if (userId) {
                const profile = await authService.getProfile(userId);
                set({ user: profile, isLoading: false });
            } else {
                set({ user: null, isLoading: false });
            }
        } catch {
            set({ user: null, isLoading: false });
        }
    },
}));
