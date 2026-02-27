import { collection, doc, query, orderBy, getDocs, runTransaction } from 'firebase/firestore';
import { db } from '../../../lib/database/firebaseConfig';
import { Sale, CartItem, SaleFilters, SaleItem } from '../../../shared/types/sale';
import * as Crypto from 'expo-crypto';

const salesCollection = collection(db, 'sales');
const productsCollection = collection(db, 'products');

export const salesService = {
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
            // 1. Check stock for all items first
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
            }

            // 2. Insert sale header
            const saleRef = doc(salesCollection, saleId);
            transaction.set(saleRef, {
                user_id: userId,
                total_amount: totalAmount,
                created_at: now,
                items: saleItems
            });

            // 3. Deduct stock
            for (const item of cart) {
                const productRef = doc(productsCollection, item.product.id);
                const productSnap = await transaction.get(productRef);
                const newQuantity = productSnap.data()!.quantity - item.quantity;

                transaction.update(productRef, {
                    quantity: newQuantity,
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

    async getHistory(filters?: SaleFilters): Promise<Sale[]> {
        const q = query(salesCollection, orderBy('created_at', 'desc'));
        const snapshot = await getDocs(q);

        let sales = snapshot.docs.map(d => {
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
                }))
            } as Sale;
        });

        if (filters?.startDate) {
            sales = sales.filter(s => s.createdAt >= filters.startDate!);
        }
        if (filters?.endDate) {
            sales = sales.filter(s => s.createdAt <= filters.endDate!);
        }

        return sales;
    },
};
