import { useMemo } from 'react';
import { useSalesStore } from '../store/salesStore';
import { Sale } from '../../../shared/types/sale';

export type Period = 7 | 30 | 90;

export interface DailyBar {
    label: string;   // e.g. "Mon", "03/02"
    value: number;   // revenue that day
    date: string;    // ISO date string YYYY-MM-DD
}

export interface TopProduct {
    name: string;
    revenue: number;
    unitsSold: number;
}

export interface ReportData {
    dailyBars: DailyBar[];
    totalRevenue: number;
    totalOrders: number;
    avgOrderValue: number;
    topProducts: TopProduct[];
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];

function toYMD(date: Date): string {
    return date.toISOString().slice(0, 10);
}

function buildDayMap(days: number): Map<string, DailyBar> {
    const map = new Map<string, DailyBar>();
    const now = new Date();
    for (let i = days - 1; i >= 0; i--) {
        const d = new Date(now);
        d.setDate(now.getDate() - i);
        const ymd = toYMD(d);
        const label =
            days <= 7
                ? SHORT_DAYS[d.getDay()]
                : `${String(d.getMonth() + 1).padStart(2, '0')}/${String(d.getDate()).padStart(2, '0')}`;
        map.set(ymd, { label, value: 0, date: ymd });
    }
    return map;
}

function computeReport(sales: Sale[], days: number): ReportData {
    const cutoff = new Date();
    cutoff.setDate(cutoff.getDate() - days);
    cutoff.setHours(0, 0, 0, 0);

    const filtered = sales.filter((s) => new Date(s.createdAt) >= cutoff);

    // Daily bars
    const dayMap = buildDayMap(days);
    for (const sale of filtered) {
        const ymd = sale.createdAt.slice(0, 10);
        const bar = dayMap.get(ymd);
        if (bar) bar.value += sale.totalAmount;
    }
    const dailyBars = Array.from(dayMap.values());

    // Summary stats
    const totalRevenue = filtered.reduce((s, x) => s + x.totalAmount, 0);
    const totalOrders = filtered.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;

    // Top products
    const productMap = new Map<string, TopProduct>();
    for (const sale of filtered) {
        for (const item of sale.items) {
            const existing = productMap.get(item.productName);
            if (existing) {
                existing.revenue += item.unitPrice * item.quantity;
                existing.unitsSold += item.quantity;
            } else {
                productMap.set(item.productName, {
                    name: item.productName,
                    revenue: item.unitPrice * item.quantity,
                    unitsSold: item.quantity,
                });
            }
        }
    }
    const topProducts = Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);

    return { dailyBars, totalRevenue, totalOrders, avgOrderValue, topProducts };
}

export function useReports(period: Period): ReportData {
    const sales = useSalesStore((s) => s.sales);
    return useMemo(() => computeReport(sales, period), [sales, period]);
}
