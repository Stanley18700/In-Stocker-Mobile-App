import { inventoryService } from '../../inventory/services/inventoryService';
import { Product } from '../../../shared/types/product';

export const alertsService = {
    async getLowStockProducts(threshold: number): Promise<Product[]> {
        return inventoryService.getLowStock(threshold);
    },
};
