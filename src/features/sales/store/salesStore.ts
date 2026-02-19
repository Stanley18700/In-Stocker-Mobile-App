import { create } from 'zustand';
import { Sale, CartItem } from '../../../shared/types/sale';

interface SalesState {
    sales: Sale[];
    cart: CartItem[];
    isLoading: boolean;
    error: string | null;
    setSales: (sales: Sale[]) => void;
    addSale: (sale: Sale) => void;
    addToCart: (item: CartItem) => void;
    updateCartItemQty: (productId: string, quantity: number) => void;
    removeFromCart: (productId: string) => void;
    clearCart: () => void;
    setLoading: (loading: boolean) => void;
    setError: (error: string | null) => void;
}

export const useSalesStore = create<SalesState>((set) => ({
    sales: [],
    cart: [],
    isLoading: false,
    error: null,
    setSales: (sales) => set({ sales }),
    addSale: (sale) => set((state) => ({ sales: [sale, ...state.sales] })),
    addToCart: (item) =>
        set((state) => {
            const existing = state.cart.find((c) => c.product.id === item.product.id);
            if (existing) {
                return {
                    cart: state.cart.map((c) =>
                        c.product.id === item.product.id
                            ? { ...c, quantity: c.quantity + item.quantity }
                            : c
                    ),
                };
            }
            return { cart: [...state.cart, item] };
        }),
    updateCartItemQty: (productId, quantity) =>
        set((state) => ({
            cart: state.cart.map((c) =>
                c.product.id === productId ? { ...c, quantity } : c
            ),
        })),
    removeFromCart: (productId) =>
        set((state) => ({
            cart: state.cart.filter((c) => c.product.id !== productId),
        })),
    clearCart: () => set({ cart: [] }),
    setLoading: (isLoading) => set({ isLoading }),
    setError: (error) => set({ error }),
}));
