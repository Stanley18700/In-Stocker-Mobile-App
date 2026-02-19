import { create } from 'zustand';
import { Product } from '../../../shared/types/product';

interface InventoryState {
    products: Product[];
    selectedProduct: Product | null;
    isLoading: boolean;
    error: string | null;
    setProducts: (products: Product[]) => void;
    addProduct: (product: Product) => void;
    updateProduct: (product: Product) => void;
    deleteProduct: (id: string) => void;
    setSelectedProduct: (product: Product | null) => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useInventoryStore = create<InventoryState>((set) => ({
    products: [],
    selectedProduct: null,
    isLoading: false,
    error: null,
    setProducts: (products) => set({ products }),
    addProduct: (product) =>
        set((state) => ({ products: [product, ...state.products] })),
    updateProduct: (product) =>
        set((state) => ({
            products: state.products.map((p) => (p.id === product.id ? product : p)),
        })),
    deleteProduct: (id) =>
        set((state) => ({
            products: state.products.filter((p) => p.id !== id),
        })),
    setSelectedProduct: (selectedProduct) => set({ selectedProduct }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
}));
