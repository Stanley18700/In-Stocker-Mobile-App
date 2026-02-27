import { signInWithEmailAndPassword, createUserWithEmailAndPassword, signOut as firebaseSignOut, onAuthStateChanged } from 'firebase/auth';
import { doc, getDoc, setDoc } from 'firebase/firestore';
import { auth, db } from '../../../lib/database/firebaseConfig';
import { User } from '../../../shared/types/user';

export const authService = {
    async signIn(email: string, password: string) {
        const userCredential = await signInWithEmailAndPassword(auth, email.toLowerCase(), password);
        const userDoc = await getDoc(doc(db, 'users', userCredential.user.uid));

        if (!userDoc.exists()) throw new Error('User profile not found.');
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
        const userCredential = await createUserWithEmailAndPassword(auth, email.toLowerCase(), password);
        const uid = userCredential.user.uid;
        const now = new Date().toISOString();

        const data = {
            email: email.toLowerCase(),
            shop_name: shopName,
            owner_name: ownerName,
            created_at: now
        };

        await setDoc(doc(db, 'users', uid), data);

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
        await firebaseSignOut(auth);
    },

    async getProfile(userId: string): Promise<User | null> {
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
        return new Promise((resolve) => {
            const unsubscribe = onAuthStateChanged(auth, (user) => {
                unsubscribe();
                resolve(user ? user.uid : null);
            });
        });
    },
};
