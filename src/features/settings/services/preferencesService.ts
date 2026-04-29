import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getFirestoreDb } from '../../../lib/database/firebaseConfig';

export interface UserPreferences {
    currency: string;
    threshold: number;
    appLanguage: string;
}

const DEFAULT_PREFERENCES: UserPreferences = {
    currency: 'K',
    threshold: 5,
    appLanguage: 'en',
};

export const preferencesService = {
    async getPreferences(userId: string): Promise<UserPreferences> {
        const db = getFirestoreDb();
        const userRef = doc(db, 'users', userId);
        const snapshot = await getDoc(userRef);

        if (!snapshot.exists()) {
            return DEFAULT_PREFERENCES;
        }

        const data = snapshot.data();

        return {
            currency:
                typeof data.currency === 'string' && data.currency.trim().length > 0
                    ? data.currency
                    : DEFAULT_PREFERENCES.currency,
            threshold:
                typeof data.threshold === 'number' && Number.isFinite(data.threshold)
                    ? data.threshold
                    : DEFAULT_PREFERENCES.threshold,
            appLanguage:
                typeof data.appLanguage === 'string' && data.appLanguage.trim().length > 0
                    ? data.appLanguage
                    : DEFAULT_PREFERENCES.appLanguage,
        };
    },

    async savePreferences(userId: string, preferences: UserPreferences): Promise<void> {
        const db = getFirestoreDb();
        const userRef = doc(db, 'users', userId);
        const snapshot = await getDoc(userRef);

        if (snapshot.exists()) {
            await updateDoc(userRef, {
                currency: preferences.currency,
                threshold: preferences.threshold,
                appLanguage: preferences.appLanguage,
            });
            return;
        }

        await setDoc(
            userRef,
            {
                ...preferences,
                created_at: new Date().toISOString(),
            },
            { merge: true }
        );
    },

    defaults(): UserPreferences {
        return DEFAULT_PREFERENCES;
    },
};
