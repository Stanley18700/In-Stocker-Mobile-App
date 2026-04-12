import { useCallback, useState } from 'react';
import { alertsService } from '../services/alertsService';
import { useAlertsStore } from '../store/alertsStore';
import { useAuthStore } from '../../auth/store/authStore';

export function useAlerts() {
    const { user } = useAuthStore();
    const { lowStockProducts, setLowStockProducts } = useAlertsStore();
    const [isLoading, setIsLoading] = useState(false);

    const fetchLowStockAlerts = useCallback(async () => {
        if (!user?.id) return;
        setIsLoading(true);
        try {
            const products = await alertsService.getLowStockProducts(user.id);
            setLowStockProducts(products);
        } catch (e) {
            console.error('Failed to fetch low stock alerts', e);
        } finally {
            setIsLoading(false);
        }
    }, [user?.id, setLowStockProducts]);

    return {
        lowStockProducts,
        isLoading,
        fetchLowStockAlerts,
        alertCount: lowStockProducts.length,
    };
}
