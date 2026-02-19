// ---------------------------------------------------------------------------
// Product — core domain model
// ---------------------------------------------------------------------------

export interface Product {
    /** UUID primary key */
    id: string;

    /** Display name of the product */
    name: string;

    /** Current quantity available in stock */
    stockQuantity: number;

    /** Minimum quantity before a low-stock alert is triggered */
    reorderLevel: number;

    /** Selling price (in shop's local currency) */
    price: number;

    /** ISO 8601 timestamp — set by the database on insert */
    createdAt: string;
}

// ---------------------------------------------------------------------------
// Derived / utility types
// ---------------------------------------------------------------------------

/** Used when creating a new product — id and createdAt are DB-generated */
export type CreateProductInput = Omit<Product, 'id' | 'createdAt'>;

/** Used when editing an existing product — all fields optional except id */
export type UpdateProductInput = Partial<CreateProductInput>;

/** Convenience type for list views that only need summary info */
export type ProductSummary = Pick<
    Product,
    'id' | 'name' | 'stockQuantity' | 'reorderLevel' | 'price'
>;

/** True when the product needs reordering */
export const isLowStock = (product: Product): boolean =>
    product.stockQuantity <= product.reorderLevel;
