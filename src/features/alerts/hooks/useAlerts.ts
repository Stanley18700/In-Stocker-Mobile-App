import { useCallback } from 'react';
import { alertsService } from '../services/alertsService';
import { useAlertsStore } from '../store/alertsStore';

export function useAlerts() {
    const { lowStockProducts, threshold, setLowStockProducts, setThreshold } =
        useAlertsStore();

    const fetchLowStockAlerts = useCallback(async () => {
        try {
            const products = await alertsService.getLowStockProducts(threshold);
            setLowStockProducts(products);
        } catch (e) {
            console.error('Failed to fetch low stock alerts', e);
        }
    }, [threshold, setLowStockProducts]);

    return {
        lowStockProducts,
        threshold,
        fetchLowStockAlerts,
        setThreshold,
        alertCount: lowStockProducts.length,
    };
}
