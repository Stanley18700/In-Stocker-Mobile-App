import * as Crypto from 'expo-crypto';
import { db } from '../../../lib/database/db';
import { Product, CreateProductInput, UpdateProductInput } from '../../../shared/types/product';

const mapRow = (row: any): Product => ({
    id: row.id,
    userId: row.user_id,
    name: row.name,
    sku: row.sku,
    quantity: row.quantity,
    price: row.price,
    lowStockThreshold: row.low_stock_threshold,
    category: row.category,
    imageUrl: row.image_url,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
});

export const inventoryService = {
    getAll(): Product[] {
        const rows = db.getAllSync<any>(
            `SELECT * FROM products WHERE is_active = 1 ORDER BY created_at DESC`
        );
        return rows.map(mapRow);
    },

    getById(id: string): Product {
        const row = db.getFirstSync<any>('SELECT * FROM products WHERE id = ?', [id]);
        if (!row) throw new Error('Product not found.');
        return mapRow(row);
    },

    create(input: CreateProductInput, userId: string): Product {
        const id = Crypto.randomUUID();
        const sku = input.sku ?? id.slice(0, 8).toUpperCase();
        db.runSync(
            `INSERT INTO products (id, user_id, name, sku, price, quantity, low_stock_threshold, category)
       VALUES (?, ?, ?, ?, ?, ?, ?, ?)`,
            [id, userId, input.name, sku, input.price,
                input.quantity, input.lowStockThreshold, input.category ?? null]
        );
        return this.getById(id);
    },

    update(id: string, input: UpdateProductInput): Product {
        const fields: string[] = [];
        const values: any[] = [];

        if (input.name !== undefined) { fields.push('name = ?'); values.push(input.name); }
        if (input.quantity !== undefined) { fields.push('quantity = ?'); values.push(input.quantity); }
        if (input.price !== undefined) { fields.push('price = ?'); values.push(input.price); }
        if (input.lowStockThreshold !== undefined) { fields.push('low_stock_threshold = ?'); values.push(input.lowStockThreshold); }
        if (input.category !== undefined) { fields.push('category = ?'); values.push(input.category); }

        if (fields.length > 0) {
            fields.push("updated_at = datetime('now')");
            values.push(id);
            db.runSync(`UPDATE products SET ${fields.join(', ')} WHERE id = ?`, values);
        }
        return this.getById(id);
    },

    delete(id: string): void {
        db.runSync(
            `UPDATE products SET is_active = 0, updated_at = datetime('now') WHERE id = ?`, [id]
        );
    },

    getLowStock(threshold: number): Product[] {
        const rows = db.getAllSync<any>(
            `SELECT * FROM products WHERE is_active = 1 AND quantity <= ? ORDER BY quantity ASC`,
            [threshold]
        );
        return rows.map(mapRow);
    },

    adjustStock(id: string, delta: number): void {
        db.withTransactionSync(() => {
            const product = db.getFirstSync<{ quantity: number }>(
                'SELECT quantity FROM products WHERE id = ?', [id]
            );
            if (!product) throw new Error('Product not found.');
            const newQty = product.quantity + delta;
            if (newQty < 0) throw new Error('Insufficient stock.');
            db.runSync(
                `UPDATE products SET quantity = ?, updated_at = datetime('now') WHERE id = ?`,
                [newQty, id]
            );
        });
    },
};
