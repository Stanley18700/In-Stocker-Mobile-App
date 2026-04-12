import { inventoryService } from '../../inventory/services/inventoryService';
import { Product } from '../../../shared/types/product';

export const alertsService = {
    /**
     * Returns all active products whose current quantity is at or below
     * their individual lowStockThreshold — ignoring the global threshold.
     */
    async getLowStockProducts(userId: string): Promise<Product[]> {
        const all = await inventoryService.getAll(userId);
        return all.filter((p) => p.quantity <= p.lowStockThreshold);
    },
};
