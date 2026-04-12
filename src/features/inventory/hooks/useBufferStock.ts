// ---------------------------------------------------------------------------
// useBufferStock — calculates buffer stock recommendations per product.
//
// Algorithm (simple, explainable, no ML):
//   1. avgDailySales  = units sold in the last 30 days ÷ 30
//   2. daysUntilStockout = currentQuantity ÷ avgDailySales
//   3. recommendedQty = avgDailySales × BUFFER_DAYS (default 14-day buffer)
//   4. shouldReorder = daysUntilStockout < REORDER_DAYS (default 7)
// ---------------------------------------------------------------------------

import { useMemo } from 'react';
import { useSalesStore } from '../../sales/store/salesStore';
import { useInventoryStore } from '../store/inventoryStore';
import { Product } from '../../../shared/types/product';

const ANALYSIS_DAYS = 30;   // look at last 30 days of sales
const BUFFER_DAYS  = 14;    // suggest 14-day buffer stock
const REORDER_DAYS = 7;     // flag if stock runs out within 7 days

export interface BufferRecommendation {
    product: Product;
    avgDailySales: number;         // units per day over last 30 days
    daysUntilStockout: number;     // currentQty / avgDailySales (Infinity if no sales)
    recommendedReorderQty: number; // avgDailySales * BUFFER_DAYS, rounded up
    shouldReorderNow: boolean;     // daysUntilStockout < REORDER_DAYS
    isOutOfStock: boolean;
    statusLabel: string;           // human-readable status
}

function computeRecommendations(
    products: Product[],
    sales: ReturnType<typeof useSalesStore.getState>['sales']
): BufferRecommendation[] {
    // Filter sales to last 30 days
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - ANALYSIS_DAYS);
    cutoff.setHours(0, 0, 0, 0);

    const recentSales = sales.filter((s) => new Date(s.createdAt) >= cutoff);

    // Build a map: productId -> total units sold in period
    const unitsSoldMap = new Map<string, number>();
    for (const sale of recentSales) {
        for (const item of sale.items) {
            unitsSoldMap.set(
                item.productId,
                (unitsSoldMap.get(item.productId) ?? 0) + item.quantity
            );
        }
    }

    return products.map((product): BufferRecommendation => {
        const totalSold = unitsSoldMap.get(product.id) ?? 0;
        const avgDailySales = totalSold / ANALYSIS_DAYS;

        const isOutOfStock = product.quantity === 0;

        let daysUntilStockout: number;
        if (avgDailySales === 0) {
            daysUntilStockout = Infinity; // not selling: no urgency
        } else {
            daysUntilStockout = product.quantity / avgDailySales;
        }

        const recommendedReorderQty = Math.ceil(avgDailySales * BUFFER_DAYS);
        const shouldReorderNow = isOutOfStock || daysUntilStockout < REORDER_DAYS;

        let statusLabel: string;
        if (isOutOfStock) {
            statusLabel = 'Out of Stock';
        } else if (shouldReorderNow) {
            statusLabel = 'Reorder Now';
        } else if (daysUntilStockout < BUFFER_DAYS) {
            statusLabel = 'Low — Plan Ahead';
        } else if (avgDailySales === 0) {
            statusLabel = 'No Sales Data';
        } else {
            statusLabel = 'Stock OK';
        }

        return {
            product,
            avgDailySales,
            daysUntilStockout,
            recommendedReorderQty,
            shouldReorderNow,
            isOutOfStock,
            statusLabel,
        };
    });
}

export function useBufferStock(): BufferRecommendation[] {
    const products = useInventoryStore((s) => s.products);
    const sales    = useSalesStore((s) => s.sales);

    return useMemo(
        () => computeRecommendations(products, sales),
        [products, sales]
    );
}
