import { create } from 'zustand';
import { User } from '../../../shared/types/user';
import { authService } from '../services/authService';

interface AuthState {
    user: User | null;
    isLoading: boolean;
    setUser: (user: User | null) => void;
    setLoading: (loading: boolean) => void;
    initializeAuth: () => Promise<void>;
    reset: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
    user: null,
    isLoading: true,

    setUser: (user) => set({ user }),
    setLoading: (isLoading) => set({ isLoading }),
    reset: () => set({ user: null, isLoading: false }),

    initializeAuth: async () => {
        set({ isLoading: true });
        const userId = await authService.getCurrentUserId();
        if (userId) {
            const profile = await authService.getProfile(userId);
            set({ user: profile, isLoading: false });
        } else {
            set({ user: null, isLoading: false });
        }
    },
}));
