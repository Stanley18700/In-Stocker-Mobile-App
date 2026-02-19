import * as Crypto from 'expo-crypto';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { db } from '../lib/database/db';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

export interface LocalUser {
    id: string;
    email: string;
    shopName: string;
    ownerName: string;
    createdAt: string;
}

interface AuthResult<T> {
    data: T | null;
    error: string | null;
}

const SESSION_KEY = 'instocker_user_id';

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

async function hashPassword(password: string): Promise<string> {
    return Crypto.digestStringAsync(
        Crypto.CryptoDigestAlgorithm.SHA256,
        password
    );
}

function mapRow(row: any): LocalUser {
    return {
        id: row.id,
        email: row.email,
        shopName: row.shop_name,
        ownerName: row.owner_name,
        createdAt: row.created_at,
    };
}

// ---------------------------------------------------------------------------
// signUp
// ---------------------------------------------------------------------------

export async function signUp(
    email: string,
    password: string,
    shopName = 'My Shop',
    ownerName = 'Owner'
): Promise<AuthResult<LocalUser>> {
    try {
        const existing = db.getFirstSync(
            'SELECT id FROM users WHERE email = ?', [email.toLowerCase()]
        );
        if (existing) return { data: null, error: 'An account with this email already exists.' };

        const id = Crypto.randomUUID();
        const hashed = await hashPassword(password);

        db.runSync(
            `INSERT INTO users (id, email, password, shop_name, owner_name)
       VALUES (?, ?, ?, ?, ?)`,
            [id, email.toLowerCase(), hashed, shopName, ownerName]
        );

        const user = db.getFirstSync<any>('SELECT * FROM users WHERE id = ?', [id]);
        await AsyncStorage.setItem(SESSION_KEY, id);
        return { data: mapRow(user), error: null };
    } catch (e: any) {
        return { data: null, error: e.message ?? 'Sign up failed.' };
    }
}

// ---------------------------------------------------------------------------
// signIn
// ---------------------------------------------------------------------------

export async function signIn(
    email: string,
    password: string
): Promise<AuthResult<LocalUser>> {
    try {
        const hashed = await hashPassword(password);
        const user = db.getFirstSync<any>(
            'SELECT * FROM users WHERE email = ? AND password = ?',
            [email.toLowerCase(), hashed]
        );
        if (!user) return { data: null, error: 'Invalid email or password.' };

        await AsyncStorage.setItem(SESSION_KEY, user.id);
        return { data: mapRow(user), error: null };
    } catch (e: any) {
        return { data: null, error: e.message ?? 'Sign in failed.' };
    }
}

// ---------------------------------------------------------------------------
// signOut
// ---------------------------------------------------------------------------

export async function signOut(): Promise<AuthResult<null>> {
    await AsyncStorage.removeItem(SESSION_KEY);
    return { data: null, error: null };
}

// ---------------------------------------------------------------------------
// getCurrentUser
// ---------------------------------------------------------------------------

export async function getCurrentUser(): Promise<AuthResult<LocalUser>> {
    try {
        const id = await AsyncStorage.getItem(SESSION_KEY);
        if (!id) return { data: null, error: null };

        const user = db.getFirstSync<any>('SELECT * FROM users WHERE id = ?', [id]);
        if (!user) return { data: null, error: null };

        return { data: mapRow(user), error: null };
    } catch (e: any) {
        return { data: null, error: e.message ?? 'Failed to restore session.' };
    }
}
