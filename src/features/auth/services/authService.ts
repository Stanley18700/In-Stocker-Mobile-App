import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../../../lib/database/db';
import { User } from '../../../shared/types/user';

const SESSION_KEY = 'instocker_user_id';

async function hashPassword(password: string): Promise<string> {
    return Crypto.digestStringAsync(Crypto.CryptoDigestAlgorithm.SHA256, password);
}

function mapRow(row: any): User {
    return {
        id: row.id,
        email: row.email,
        shopName: row.shop_name,
        ownerName: row.owner_name,
        createdAt: row.created_at,
    };
}

export const authService = {
    async signIn(email: string, password: string) {
        const hashed = await hashPassword(password);
        const user = db.getFirstSync<any>(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [email.toLowerCase(), hashed]
        );
        if (!user) throw new Error('Invalid email or password.');
        await AsyncStorage.setItem(SESSION_KEY, user.id);
        return { user: mapRow(user) };
    },

    async signUp(email: string, password: string, shopName: string, ownerName: string) {
        const existing = db.getFirstSync(
            'SELECT id FROM users WHERE email = ?', [email.toLowerCase()]
        );
        if (existing) throw new Error('An account with this email already exists.');

        const id = Crypto.randomUUID();
        const hashed = await hashPassword(password);
        db.runSync(
            `INSERT INTO users (id, email, password, shop_name, owner_name) VALUES (?, ?, ?, ?, ?)`,
            [id, email.toLowerCase(), hashed, shopName, ownerName]
        );
        const user = db.getFirstSync<any>('SELECT * FROM users WHERE id = ?', [id]);
        await AsyncStorage.setItem(SESSION_KEY, id);
        return { user: mapRow(user) };
    },

    async signOut() {
        await AsyncStorage.removeItem(SESSION_KEY);
    },

    async getProfile(userId: string): Promise<User | null> {
        const user = db.getFirstSync<any>('SELECT * FROM users WHERE id = ?', [userId]);
        return user ? mapRow(user) : null;
    },

    async getCurrentUserId(): Promise<string | null> {
        return AsyncStorage.getItem(SESSION_KEY);
    },
};
