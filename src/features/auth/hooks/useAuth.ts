import { useCallback } from 'react';
import { authService } from '../services/authService';
import { useAuthStore } from '../store/authStore';

export function useAuth() {
    const { user, isLoading, setUser, setLoading, reset, initializeAuth } =
        useAuthStore();

    const signIn = useCallback(
        async (email: string, password: string) => {
            setLoading(true);
            try {
                const data = await authService.signIn(email, password);
                setUser(data.user);
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setUser]
    );

    const signUp = useCallback(
        async (
            email: string,
            password: string,
            shopName: string,
            ownerName: string
        ) => {
            setLoading(true);
            try {
                const data = await authService.signUp(email, password, shopName, ownerName);
                setUser(data.user);
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setUser]
    );

    const signOut = useCallback(async () => {
        await authService.signOut();
        reset();
    }, [reset]);

    return { user, isLoading, signIn, signUp, signOut, initializeAuth };
}
