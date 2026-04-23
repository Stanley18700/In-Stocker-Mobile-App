import { useCallback } from 'react';
import { inventoryService } from '../services/inventoryService';
import { useInventoryStore } from '../store/inventoryStore';
import { CreateProductInput, UpdateProductInput } from '../../../shared/types/product';
import { useAuthStore } from '../../auth/store/authStore';

export function useInventory() {
    const { user } = useAuthStore();
    const {
        products,
        selectedProduct,
        isLoading,
        error,
        setProducts,
        updateProduct,
        deleteProduct,
        setSelectedProduct,
        setLoading,
        setError,
    } = useInventoryStore();

    const fetchProducts = useCallback(async () => {
        if (!user?.id) return;
        setLoading(true);
        setError(null);
        try {
            const data = await inventoryService.getAll(user.id);
            setProducts(data);
        } catch (e: any) {
            setError(e.message);
        } finally {
            setLoading(false);
        }
    }, [user?.id, setLoading, setError, setProducts]);

    const createProduct = useCallback(
        async (input: CreateProductInput) => {
            setLoading(true);
            setError(null);
            try {
                const product = await inventoryService.create(input, user?.id ?? '');
                // NOTE: Do NOT call addProduct here. The real-time subscribeAll listener
                // in AppNavigator already calls setProducts with the full fresh list
                // whenever Firestore changes. Calling addProduct here would cause the
                // new product to appear twice (once optimistically, once from the snapshot).
                return product;
            } catch (e: any) {
                setError(e.message);
                throw e;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setError]
    );

    const editProduct = useCallback(
        async (id: string, input: UpdateProductInput) => {
            setLoading(true);
            setError(null);
            try {
                const product = await inventoryService.update(id, input);
                updateProduct(product);
                return product;
            } catch (e: any) {
                setError(e.message);
                throw e;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setError, updateProduct]
    );

    const removeProduct = useCallback(
        async (id: string) => {
            setLoading(true);
            setError(null);
            try {
                await inventoryService.delete(id);
                deleteProduct(id);
            } catch (e: any) {
                setError(e.message);
                throw e;
            } finally {
                setLoading(false);
            }
        },
        [setLoading, setError, deleteProduct]
    );

    return {
        products,
        selectedProduct,
        isLoading,
        error,
        fetchProducts,
        createProduct,
        editProduct,
        removeProduct,
        setSelectedProduct,
    };
}
