import { useCallback } from 'react';
import { alertsService } from '../services/alertsService';
import { useAlertsStore } from '../store/alertsStore';
import { useAuthStore } from '../../auth/store/authStore';

export function useAlerts() {
    const { user } = useAuthStore();
    const { lowStockProducts, threshold, setLowStockProducts, setThreshold } =
        useAlertsStore();

    const fetchLowStockAlerts = useCallback(async () => {
        if (!user?.id) return;
        try {
            const products = await alertsService.getLowStockProducts(user.id, threshold);
            setLowStockProducts(products);
        } catch (e) {
            console.error('Failed to fetch low stock alerts', e);
        }
    }, [user?.id, threshold, setLowStockProducts]);

    return {
        lowStockProducts,
        threshold,
        fetchLowStockAlerts,
        setThreshold,
        alertCount: lowStockProducts.length,
    };
}
