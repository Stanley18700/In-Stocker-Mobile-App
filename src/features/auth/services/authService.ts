import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged, deleteUser } from 'firebase/auth';
import { doc, getDoc, setDoc, updateDoc } from 'firebase/firestore';
import { getFirebaseAuth, getFirestoreDb } from '../../../lib/database/firebaseConfig';
import { User } from '../../../shared/types/user';

export const authService = {
    async signIn(email: string, password: string) {
        const auth = getFirebaseAuth();
        const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);

        const db = getFirestoreDb();
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

        if (!userDoc.exists()) {
            const err: any = new Error('User profile not found.');
            err.code = 'profile-not-found';
            throw err;
        }
        const data = userDoc.data();

        const user: User = {
            id: userCredential.user.uid,
            email: userCredential.user.email!,
            shopName: data.shop_name,
            ownerName: data.owner_name,
            createdAt: data.created_at,
        };

        return { user };
    },

    async signUp(email: string, password: string, shopName: string, ownerName: string) {
        const auth = getFirebaseAuth();
        const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);

        const db = getFirestoreDb();
        const uid = userCredential.user.uid;
        const now = new Date().toISOString();

        const data = {
            email: email.toLowerCase(),
            shop_name: shopName,
            owner_name: ownerName,
            created_at: now,
            currency: 'K',
            threshold: 5,
        };

        try {
            await setDoc(doc(db, 'users', uid), data);
        } catch (e: any) {
            // Avoid leaving an auth account without its paired Firestore profile.
            try {
                await deleteUser(userCredential.user);
            } catch {
                // Best effort rollback only; keep original Firestore error below.
            }
            throw e;
        }

        const user: User = {
            id: uid,
            email: email.toLowerCase(),
            shopName,
            ownerName,
            createdAt: now,
        };

        return { user };
    },

    async signOut() {
        const auth = getFirebaseAuth();
        await firebaseSignOut(auth);
    },

    async getProfile(userId: string): Promise<User | null> {
        const db = getFirestoreDb();
        const userDoc = await getDoc(doc(db, 'users', userId));
        if (!userDoc.exists()) return null;

        const data = userDoc.data();
        return {
            id: userId,
            email: data.email,
            shopName: data.shop_name,
            ownerName: data.owner_name,
            createdAt: data.created_at,
        };
    },

    async getCurrentUserId(): Promise<string | null> {
        const auth = getFirebaseAuth();
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user ? user.uid : null);
            });
        });
    },

    // ── Update profile (shop name + owner name) ───────────────────────────────
    async updateProfile(
        userId: string,
        updates: { shopName?: string; ownerName?: string }
    ): Promise<void> {
        const db = getFirestoreDb();
        const docRef = doc(db, 'users', userId);
        const payload: Record<string, string> = {};
        if (updates.shopName !== undefined) payload.shop_name = updates.shopName;
        if (updates.ownerName !== undefined) payload.owner_name = updates.ownerName;
        if (Object.keys(payload).length > 0) {
            await updateDoc(docRef, payload);
        }
    },
};
