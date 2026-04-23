import { collection, doc, query, where, orderBy, getDocs, getDoc, setDoc, updateDoc, runTransaction, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/database/firebaseConfig';
import { Product, CreateProductInput, UpdateProductInput } from '../../../shared/types/product';
import * as Crypto from 'expo-crypto';

const productsCollection = collection(db, 'products');

// ---------------------------------------------------------------------------
// Helper: map a Firestore document snapshot → Product
// ---------------------------------------------------------------------------
function mapDoc(doc: any): Product {
    const data = doc.data();
    return {
        id: doc.id,
        userId: data.user_id,
        name: data.name,
        sku: data.sku,
        quantity: data.quantity,
        price: data.price,
        lowStockThreshold: data.low_stock_threshold,
        category: data.category,
        imageUrl: data.image_url,
        createdAt: data.created_at,
        updatedAt: data.updated_at,
    } as Product;
}

export const inventoryService = {
    subscribeAll(userId: string, onData: (products: Product[]) => void, onError?: (error: unknown) => void) {
        const q = query(
            productsCollection,
            where('user_id', '==', userId),
            where('is_active', '==', 1),
            orderBy('created_at', 'desc')
        );

        return onSnapshot(
            q,
            (snapshot) => {
                onData(snapshot.docs.map(mapDoc));
            },
            (error) => {
                if (onError) onError(error);
            }
        );
    },

    async getAll(userId: string): Promise<Product[]> {
        const q = query(
            productsCollection,
            where('user_id', '==', userId),
            where('is_active', '==', 1),
            orderBy('created_at', 'desc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(mapDoc);
    },

    async getById(id: string): Promise<Product> {
        const docRef = doc(productsCollection, id);
        const docSnap = await getDoc(docRef);
        if (!docSnap.exists()) throw new Error('Product not found.');
        return mapDoc(docSnap);
    },

    async create(input: CreateProductInput, userId: string): Promise<Product> {
        if (!userId) throw new Error("User ID is required to create a product.");
        const id = Crypto.randomUUID();
        const sku = input.sku ?? id.slice(0, 8).toUpperCase();
        const now = new Date().toISOString();

        const docRef = doc(productsCollection, id);
        const data = {
            user_id: userId,
            name: input.name,
            sku: sku,
            price: input.price,
            quantity: input.quantity,
            low_stock_threshold: input.lowStockThreshold,
            category: input.category ?? null,
            is_active: 1,
            created_at: now,
            updated_at: now
        };
        await setDoc(docRef, data);

        return {
            id: id,
            userId: userId,
            name: input.name,
            sku: sku,
            quantity: input.quantity,
            price: input.price,
            lowStockThreshold: input.lowStockThreshold,
            category: input.category,
            imageUrl: undefined,
            createdAt: now,
            updatedAt: now,
        };
    },

    async update(id: string, input: UpdateProductInput): Promise<Product> {
        const docRef = doc(productsCollection, id);
        const updates: Record<string, any> = {};

        if (input.name !== undefined) updates.name = input.name;
        if (input.quantity !== undefined) updates.quantity = input.quantity;
        if (input.price !== undefined) updates.price = input.price;
        if (input.lowStockThreshold !== undefined) updates.low_stock_threshold = input.lowStockThreshold;
        if (input.category !== undefined) updates.category = input.category;

        if (Object.keys(updates).length > 0) {
            updates.updated_at = new Date().toISOString();
            await updateDoc(docRef, updates);
        }
        return this.getById(id);
    },

    async delete(id: string): Promise<void> {
        const docRef = doc(productsCollection, id);
        await updateDoc(docRef, {
            is_active: 0,
            updated_at: new Date().toISOString()
        });
    },

    async getLowStock(userId: string, threshold: number): Promise<Product[]> {
        const q = query(
            productsCollection,
            where('user_id', '==', userId),
            where('is_active', '==', 1),
            where('quantity', '<=', threshold),
            orderBy('quantity', 'asc')
        );
        const snapshot = await getDocs(q);
        return snapshot.docs.map(mapDoc);
    },

    async adjustStock(id: string, delta: number): Promise<void> {
        const docRef = doc(productsCollection, id);
        await runTransaction(db, async (transaction) => {
            const docSnap = await transaction.get(docRef);
            if (!docSnap.exists()) throw new Error('Product not found.');
            const newQty = docSnap.data().quantity + delta;
            if (newQty < 0) throw new Error('Insufficient stock.');
            transaction.update(docRef, {
                quantity: newQty,
                updated_at: new Date().toISOString()
            });
        });
    },
};
