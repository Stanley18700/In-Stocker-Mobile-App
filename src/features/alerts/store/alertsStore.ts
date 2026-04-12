import { create } from 'zustand';
import { Product } from '../../../shared/types/product';

interface AlertsState {
    lowStockProducts: Product[];
    setLowStockProducts: (products: Product[]) => void;
}

export const useAlertsStore = create<AlertsState>((set) => ({
    lowStockProducts: [],
    setLowStockProducts: (lowStockProducts) => set({ lowStockProducts }),
}));

