import * as Crypto from 'expo-crypto';
import { db } from '../lib/database/db';

export interface Sale {
    id: string;
    userId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
    totalAmount: number;
    createdAt: string;
}

// ---------------------------------------------------------------------------
// Result wrapper
// ---------------------------------------------------------------------------

interface ServiceResult<T> {
    data: T | null;
    error: string | null;
}

// ---------------------------------------------------------------------------
// Row mapper
// ---------------------------------------------------------------------------

function mapRow(row: any): Sale {
    return {
        id: row.id,
        userId: row.user_id,
        productId: row.product_id,
        productName: row.product_name,
        quantity: row.quantity,
        unitPrice: row.unit_price,
        totalAmount: row.total_amount,
        createdAt: row.created_at,
    };
}

// ---------------------------------------------------------------------------
// recordSale — atomic stock deduction inside a SQLite transaction
// ---------------------------------------------------------------------------

export function recordSale(
    productId: string,
    quantity: number,
    unitPrice: number,
    userId: string,
): ServiceResult<Sale> {
    if (quantity <= 0) {
        return { data: null, error: 'Quantity must be greater than zero.' };
    }

    try {
        let createdSale: Sale | null = null;

        // db.withTransactionSync ensures all statements succeed or all roll back
        db.withTransactionSync(() => {
            // 1. Check current stock
            const product = db.getFirstSync<{ quantity: number; name: string }>(
                'SELECT quantity, name FROM products WHERE id = ? AND is_active = 1',
                [productId]
            );

            if (!product) throw new Error('Product not found.');
            if (product.quantity < quantity) {
                throw new Error('Not enough stock to complete this sale.');
            }

            // 2. Deduct stock
            db.runSync(
                `UPDATE products
         SET quantity = quantity - ?, updated_at = datetime('now')
         WHERE id = ?`,
                [quantity, productId]
            );

            // 3. Insert sale header
            const saleId = Crypto.randomUUID();
            const totalAmount = quantity * unitPrice;

            db.runSync(
                `INSERT INTO sales (id, user_id, total_amount) VALUES (?, ?, ?)`,
                [saleId, userId, totalAmount]
            );

            // 4. Insert sale item
            const itemId = Crypto.randomUUID();
            db.runSync(
                `INSERT INTO sale_items
           (id, sale_id, product_id, product_name, quantity, unit_price, subtotal)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
                [itemId, saleId, productId, product.name, quantity, unitPrice, totalAmount]
            );

            // 5. Build return object
            createdSale = {
                id: saleId,
                userId,
                productId,
                productName: product.name,
                quantity,
                unitPrice,
                totalAmount,
                createdAt: new Date().toISOString(),
            };
        });

        return { data: createdSale, error: null };
    } catch (e: any) {
        return { data: null, error: e.message ?? 'Failed to record sale.' };
    }
}

// ---------------------------------------------------------------------------
// fetchSales
// ---------------------------------------------------------------------------

export function fetchSales(userId: string): ServiceResult<Sale[]> {
    try {
        const rows = db.getAllSync<any>(
            `SELECT s.id, s.user_id, s.total_amount, s.created_at,
              si.product_id, si.product_name, si.quantity, si.unit_price
       FROM sales s
       JOIN sale_items si ON si.sale_id = s.id
       WHERE s.user_id = ?
       ORDER BY s.created_at DESC`,
            [userId]
        );
        return { data: rows.map(mapRow), error: null };
    } catch (e: any) {
        return { data: null, error: e.message ?? 'Failed to fetch sales.' };
    }
}
