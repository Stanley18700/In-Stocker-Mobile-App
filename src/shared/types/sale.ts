import { Product } from './product';

export interface CartItem {
    product: Product;
    quantity: number;
    unitPrice: number;
}

export interface SaleItem {
    id: string;
    saleId: string;
    productId: string;
    productName: string;
    quantity: number;
    unitPrice: number;
}

export interface Sale {
    id: string;
    userId: string;
    totalAmount: number;
    items: SaleItem[];
    createdAt: string;
}

export interface SaleFilters {
    startDate?: string;
    endDate?: string;
}
