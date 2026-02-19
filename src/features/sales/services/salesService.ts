import * as Crypto from 'expo-crypto';
import { db } from '../../../lib/database/db';
import { Sale, CartItem, SaleFilters, SaleItem } from '../../../shared/types/sale';

const mapItemRow = (row: any): SaleItem => ({
    id: row.id,
    saleId: row.sale_id,
    productId: row.product_id,
    productName: row.product_name,
    quantity: row.quantity,
    unitPrice: row.unit_price,
});

export const salesService = {
    recordSale(cart: CartItem[], userId: string): Sale {
        if (cart.length === 0) throw new Error('Cart is empty.');

        const totalAmount = cart.reduce(
            (sum, item) => sum + item.unitPrice * item.quantity, 0
        );
        const saleId = Crypto.randomUUID();
        let createdItems: SaleItem[] = [];

        db.withTransactionSync(() => {
            // 1. Check stock for all items first
            for (const item of cart) {
                const product = db.getFirstSync<{ quantity: number }>(
                    'SELECT quantity FROM products WHERE id = ? AND is_active = 1',
                    [item.product.id]
                );
                if (!product) throw new Error(`Product "${item.product.name}" not found.`);
                if (product.quantity < item.quantity) {
                    throw new Error(`Insufficient stock for "${item.product.name}".`);
                }
            }

            // 2. Insert sale header
            db.runSync(
                `INSERT INTO sales (id, user_id, total_amount) VALUES (?, ?, ?)`,
                [saleId, userId, totalAmount]
            );

            // 3. Insert items and deduct stock
            for (const item of cart) {
                const itemId = Crypto.randomUUID();
                const subtotal = item.quantity * item.unitPrice;

                db.runSync(
                    `INSERT INTO sale_items
             (id, sale_id, product_id, product_name, quantity, unit_price, subtotal)
           VALUES (?, ?, ?, ?, ?, ?, ?)`,
                    [itemId, saleId, item.product.id, item.product.name,
                        item.quantity, item.unitPrice, subtotal]
                );

                db.runSync(
                    `UPDATE products SET quantity = quantity - ?, updated_at = datetime('now') WHERE id = ?`,
                    [item.quantity, item.product.id]
                );

                createdItems.push({
                    id: itemId,
                    saleId,
                    productId: item.product.id,
                    productName: item.product.name,
                    quantity: item.quantity,
                    unitPrice: item.unitPrice,
                });
            }
        });

        return {
            id: saleId,
            userId,
            totalAmount,
            items: createdItems,
            createdAt: new Date().toISOString(),
        };
    },

    getHistory(filters?: SaleFilters): Sale[] {
        let query = `
      SELECT s.id, s.user_id, s.total_amount, s.created_at,
             si.id as item_id, si.product_id, si.product_name,
             si.quantity, si.unit_price, si.sale_id
      FROM sales s
      LEFT JOIN sale_items si ON si.sale_id = s.id
      WHERE 1=1
    `;
        const params: any[] = [];

        if (filters?.startDate) { query += ` AND s.created_at >= ?`; params.push(filters.startDate); }
        if (filters?.endDate) { query += ` AND s.created_at <= ?`; params.push(filters.endDate); }
        query += ` ORDER BY s.created_at DESC`;

        const rows = db.getAllSync<any>(query, params);

        // Group rows by sale id
        const saleMap = new Map<string, Sale>();
        for (const row of rows) {
            if (!saleMap.has(row.id)) {
                saleMap.set(row.id, {
                    id: row.id,
                    userId: row.user_id,
                    totalAmount: row.total_amount,
                    createdAt: row.created_at,
                    items: [],
                });
            }
            if (row.item_id) {
                saleMap.get(row.id)!.items.push(mapItemRow({
                    id: row.item_id,
                    sale_id: row.sale_id,
                    product_id: row.product_id,
                    product_name: row.product_name,
                    quantity: row.quantity,
                    unit_price: row.unit_price,
                }));
            }
        }

        return Array.from(saleMap.values());
    },
};
