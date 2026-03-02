import { useCallback } from 'react';
import { useAuthStore } from '../../auth/store/authStore';
import { useInventoryStore } from '../../inventory/store/inventoryStore';
import { useSalesStore } from '../../sales/store/salesStore';
import { useAlertsStore } from '../../alerts/store/alertsStore';
import { useInventory } from '../../inventory/hooks/useInventory';
import { useSales } from '../../sales/hooks/useSales';
import { useAlerts } from '../../alerts/hooks/useAlerts';

// ---------------------------------------------------------------------------
// useDashboard — aggregates data from multiple stores/hooks for HomeScreen.
// ---------------------------------------------------------------------------

export function useDashboard() {
    const { user } = useAuthStore();
    const { products } = useInventoryStore();
    const { sales } = useSalesStore();
    const { lowStockProducts } = useAlertsStore();

    const { fetchProducts } = useInventory();
    const { fetchSalesHistory } = useSales();
    const { fetchLowStockAlerts } = useAlerts();

    // Fetch all data in parallel
    const refresh = useCallback(async () => {
        await Promise.all([
            fetchProducts(),
            fetchSalesHistory(),
            fetchLowStockAlerts(),
        ]);
    }, [fetchProducts, fetchSalesHistory, fetchLowStockAlerts]);

    // Today's ISO date prefix e.g. "2026-03-02"
    const todayPrefix = new Date().toISOString().slice(0, 10);
    const todaySales = sales.filter((s) => s.createdAt.startsWith(todayPrefix));

    const stats = {
        totalProducts: products.length,
        lowStockCount: lowStockProducts.length,
        todaySalesCount: todaySales.length,
        todayRevenue: todaySales.reduce((sum, s) => sum + s.totalAmount, 0),
        totalInventoryValue: products.reduce(
            (sum, p) => sum + p.price * p.quantity,
            0
        ),
    };

    // Most recent 5 sales for the "Recent Sales" section
    const recentSales = sales.slice(0, 5);

    return { user, stats, recentSales, refresh };
}
