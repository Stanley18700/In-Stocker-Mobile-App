import { collection, doc, query, where, getDocs, runTransaction, onSnapshot } from 'firebase/firestore';
import { db } from '../../../lib/database/firebaseConfig';
import { Sale, CartItem, SaleFilters, SaleItem } from '../../../shared/types/sale';
import * as Crypto from 'expo-crypto';

const salesCollection = collection(db, 'sales');
const productsCollection = collection(db, 'products');

function mapSaleDoc(d: any): Sale {
    const data = d.data();
    return {
        id: d.id,
        userId: data.user_id,
        totalAmount: data.total_amount,
        createdAt: data.created_at,
        items: (data.items || []).map((i: any) => ({
            id: i.id,
            saleId: d.id,
            productId: i.product_id,
            productName: i.product_name,
            quantity: i.quantity,
            unitPrice: i.unit_price,
        })),
    } as Sale;
}

function sortByCreatedAtDesc(items: Sale[]): Sale[] {
    return [...items].sort((a, b) => b.createdAt.localeCompare(a.createdAt));
}

export const salesService = {
    subscribeHistory(userId: string, onData: (sales: Sale[]) => void, onError?: (error: unknown) => void) {
        const q = query(salesCollection, where('user_id', '==', userId));

        return onSnapshot(
            q,
            (snapshot) => {
                onData(sortByCreatedAtDesc(snapshot.docs.map(mapSaleDoc)));
            },
            (error) => {
                if (onError) onError(error);
            }
        );
    },

    async recordSale(cart: CartItem[], userId: string): Promise<Sale> {
        if (cart.length === 0) throw new Error('Cart is empty.');

        const totalAmount = cart.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity, 0
        );
        const saleId = Crypto.randomUUID();
        const now = new Date().toISOString();
        const saleItems = cart.map(item => ({
            id: Crypto.randomUUID(),
            product_id: item.product.id,
            product_name: item.product.name,
            quantity: item.quantity,
            unit_price: item.unitPrice,
            subtotal: item.quantity * item.unitPrice
        }));

        await runTransaction(db, async (transaction) => {
            // 1. Read all product snapshots and validate stock
            const productSnaps = new Map<string, any>();

            for (const item of cart) {
                const productRef = doc(productsCollection, item.product.id);
                const productSnap = await transaction.get(productRef);

                if (!productSnap.exists()) {
                    throw new Error(`Product "${item.product.name}" not found.`);
                }
                const productData = productSnap.data();
                if (productData.is_active !== 1) {
                    throw new Error(`Product "${item.product.name}" is not active.`);
                }
                if (productData.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for "${item.product.name}".`);
                }
                productSnaps.set(item.product.id, { ref: productRef, data: productData });
            }

            // 2. Insert sale header
            const saleRef = doc(salesCollection, saleId);
            transaction.set(saleRef, {
                user_id: userId,
                total_amount: totalAmount,
                created_at: now,
                items: saleItems
            });

            // 3. Deduct stock (reuse snapshots from step 1 — no extra reads)
            for (const item of cart) {
                const { ref, data } = productSnaps.get(item.product.id)!;
                transaction.update(ref, {
                    quantity: data.quantity - item.quantity,
                    updated_at: now
                });
            }
        });


        const createdItems: SaleItem[] = saleItems.map(item => ({
            id: item.id,
            saleId: saleId,
            productId: item.product_id,
            productName: item.product_name,
            quantity: item.quantity,
            unitPrice: item.unit_price,
        }));

        return {
            id: saleId,
            userId,
            totalAmount,
            items: createdItems,
            createdAt: now,
        };
    },

    async getHistory(userId: string, filters?: SaleFilters): Promise<Sale[]> {
        const q = query(salesCollection, where('user_id', '==', userId));
        const snapshot = await getDocs(q);

        let sales = sortByCreatedAtDesc(snapshot.docs.map(mapSaleDoc));

        if (filters?.startDate) {
            sales = sales.filter(s => s.createdAt >= filters.startDate!);
        }
        if (filters?.endDate) {
            sales = sales.filter(s => s.createdAt <= filters.endDate!);
        }

        return sales;
    },
};
