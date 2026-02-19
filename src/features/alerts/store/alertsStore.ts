import { create } from 'zustand';
import { Product } from '../../../shared/types/product';

interface AlertsState {
    lowStockProducts: Product[];
    threshold: number;
    setLowStockProducts: (products: Product[]) => void;
    setThreshold: (threshold: number) => void;
}

export const useAlertsStore = create<AlertsState>((set) => ({
    lowStockProducts: [],
    threshold: 5,
    setLowStockProducts: (lowStockProducts) => set({ lowStockProducts }),
    setThreshold: (threshold) => set({ threshold }),
}));
