export interface Product {
    id: string;
    userId: string;
    name: string;
    sku: string;
    quantity: number;
    price: number;
    lowStockThreshold: number;
    category?: string;
    imageUrl?: string;
    createdAt: string;
    updatedAt: string;
}

export type CreateProductInput = Omit<Product, 'id' | 'userId' | 'createdAt' | 'updatedAt'>;
export type UpdateProductInput = Partial<CreateProductInput>;
