import { useCallback } from 'react';
import { salesService } from '../services/salesService';
import { useSalesStore } from '../store/salesStore';
import { CartItem, SaleFilters } from '../../../shared/types/sale';
import { Product } from '../../../shared/types/product';
import { useAuthStore } from '../../auth/store/authStore';

export function useSales() {
    const { user } = useAuthStore();
    const {
        sales,
        cart,
        isLoading,
        error,
        setSales,
        addSale,
        addToCart,
        updateCartItemQty,
        removeFromCart,
        clearCart,
        setLoading,
        setError,
    } = useSalesStore();

    const fetchSalesHistory = useCallback(
        (filters?: SaleFilters) => {
            setLoading(true);
            setError(null);
            try {
                const data = salesService.getHistory(filters);
                setSales(data);
            } catch (e: any) {
                setError(e.message);
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setError, setSales]
    );

    const checkout = useCallback(() => {
        if (cart.length === 0) return;
        setLoading(true);
        setError(null);
        try {
            const sale = salesService.recordSale(cart, user?.id ?? '');
            addSale(sale);
            clearCart();
            return sale;
        } catch (e: any) {
            setError(e.message);
            throw e;
        } finally {
            setLoading(false);
        }
    }, [cart, user, setLoading, setError, addSale, clearCart]);

    const addProductToCart = useCallback(
        (product: Product, quantity: number = 1) => {
            const item: CartItem = {
                product,
                quantity,
                unitPrice: product.price,
            };
            addToCart(item);
        },
        [addToCart]
    );

    const cartTotal = cart.reduce(
        (sum, item) => sum + item.unitPrice * item.quantity,
        0
    );

    const cartItemCount = cart.reduce((sum, item) => sum + item.quantity, 0);

    return {
        sales,
        cart,
        cartTotal,
        cartItemCount,
        isLoading,
        error,
        fetchSalesHistory,
        checkout,
        addProductToCart,
        updateCartItemQty,
        removeFromCart,
        clearCart,
    };
}
