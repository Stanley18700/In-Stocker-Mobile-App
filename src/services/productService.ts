import * as Crypto from 'expo-crypto';
import { db } from '../lib/database/db';
import { Product, CreateProductInput, UpdateProductInput } from '../models/Product';

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

function mapRow(row: any): Product {
    return {
        id: row.id,
        name: row.name,
        stockQuantity: row.quantity,
        reorderLevel: row.low_stock_threshold,
        price: row.price,
        createdAt: row.created_at,
    };
}

// ---------------------------------------------------------------------------
// fetchProducts
// ---------------------------------------------------------------------------

export function fetchProducts(userId: string): ServiceResult<Product[]> {
    try {
        const rows = db.getAllSync<any>(
            `SELECT * FROM products
       WHERE user_id = ? AND is_active = 1
       ORDER BY created_at DESC`,
            [userId]
        );
        return { data: rows.map(mapRow), error: null };
    } catch (e: any) {
        return { data: null, error: e.message ?? 'Failed to fetch products.' };
    }
}

// ---------------------------------------------------------------------------
// addProduct
// ---------------------------------------------------------------------------

export function addProduct(
    product: CreateProductInput & { userId: string; sku?: string }
): ServiceResult<Product> {
    try {
        const id = Crypto.randomUUID();
        const sku = product.sku ?? id.slice(0, 8).toUpperCase();

        db.runSync(
            `INSERT INTO products (id, user_id, name, sku, price, quantity, low_stock_threshold)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [id, product.userId, product.name, sku, product.price,
                product.stockQuantity, product.reorderLevel]
        );

        const row = db.getFirstSync<any>('SELECT * FROM products WHERE id = ?', [id]);
        return { data: mapRow(row), error: null };
    } catch (e: any) {
        return { data: null, error: e.message ?? 'Failed to add product.' };
    }
}

// ---------------------------------------------------------------------------
// updateProduct
// ---------------------------------------------------------------------------

export function updateProduct(
    productId: string,
    updates: UpdateProductInput
): ServiceResult<Product> {
    try {
        const fields: string[] = [];
        const values: any[] = [];

        if (updates.name !== undefined) { fields.push('name = ?'); values.push(updates.name); }
        if (updates.stockQuantity !== undefined) { fields.push('quantity = ?'); values.push(updates.stockQuantity); }
        if (updates.reorderLevel !== undefined) { fields.push('low_stock_threshold = ?'); values.push(updates.reorderLevel); }
        if (updates.price !== undefined) { fields.push('price = ?'); values.push(updates.price); }

        if (fields.length === 0) {
            const row = db.getFirstSync<any>('SELECT * FROM products WHERE id = ?', [productId]);
            return { data: row ? mapRow(row) : null, error: null };
        }

        fields.push("updated_at = datetime('now')");
        values.push(productId);

        db.runSync(
            `UPDATE products SET ${fields.join(', ')} WHERE id = ?`,
            values
        );

        const row = db.getFirstSync<any>('SELECT * FROM products WHERE id = ?', [productId]);
        return { data: row ? mapRow(row) : null, error: null };
    } catch (e: any) {
        return { data: null, error: e.message ?? 'Failed to update product.' };
    }
}

// ---------------------------------------------------------------------------
// deleteProduct (soft delete)
// ---------------------------------------------------------------------------

export function deleteProduct(productId: string): ServiceResult<null> {
    try {
        db.runSync(
            `UPDATE products SET is_active = 0, updated_at = datetime('now') WHERE id = ?`,
            [productId]
        );
        return { data: null, error: null };
    } catch (e: any) {
        return { data: null, error: e.message ?? 'Failed to delete product.' };
    }
}
