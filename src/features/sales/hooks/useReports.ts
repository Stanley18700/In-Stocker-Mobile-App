import { useMemo } from 'react';
import { useSalesStore } from '../store/salesStore';
import { Sale } from '../../../shared/types/sale';

export type Period = 7 | 30 | 90 | 'month' | 'year';

export interface DailyBar {
    label: string;   // e.g. "Mon", "03/02", "Jan"
    value: number;   // revenue
    date: string;    // ISO date or "YYYY-MM" key
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
    periodLabel: string;
}

const SHORT_DAYS = ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'];
const SHORT_MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

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

function buildMonthMap(months: number): Map<string, DailyBar> {
    const map = new Map<string, DailyBar>();
    const now = new Date();
    for (let i = months - 1; i >= 0; i--) {
        const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
        const key = `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, '0')}`;
        const label = SHORT_MONTHS[d.getMonth()];
        map.set(key, { label, value: 0, date: key });
    }
    return map;
}

function computeTopProducts(filtered: Sale[]): TopProduct[] {
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
    return Array.from(productMap.values())
        .sort((a, b) => b.revenue - a.revenue)
        .slice(0, 5);
}

function computeReport(sales: Sale[], period: Period): ReportData {
    let filtered: Sale[];
    let periodLabel: string;
    let dailyBars: DailyBar[];

    if (period === 'month') {
        // Current calendar month
        const now = new Date();
        const start = new Date(now.getFullYear(), now.getMonth(), 1);
        filtered = sales.filter((s) => new Date(s.createdAt) >= start);
        periodLabel = `${SHORT_MONTHS[now.getMonth()]} ${now.getFullYear()}`;

        // Day-by-day within this month
        const daysInMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
        const dayMap = new Map<string, DailyBar>();
        for (let i = 1; i <= daysInMonth; i++) {
            const d = new Date(now.getFullYear(), now.getMonth(), i);
            const ymd = toYMD(d);
            dayMap.set(ymd, { label: String(i), value: 0, date: ymd });
        }
        for (const sale of filtered) {
            const ymd = sale.createdAt.slice(0, 10);
            const bar = dayMap.get(ymd);
            if (bar) bar.value += sale.totalAmount;
        }
        dailyBars = Array.from(dayMap.values());
    } else if (period === 'year') {
        // Last 12 months
        const cutoff = new Date();
        cutoff.setMonth(cutoff.getMonth() - 11);
        cutoff.setDate(1);
        cutoff.setHours(0, 0, 0, 0);
        filtered = sales.filter((s) => new Date(s.createdAt) >= cutoff);
        periodLabel = 'Last 12 Months';

        const monthMap = buildMonthMap(12);
        for (const sale of filtered) {
            const key = sale.createdAt.slice(0, 7); // "YYYY-MM"
            const bar = monthMap.get(key);
            if (bar) bar.value += sale.totalAmount;
        }
        dailyBars = Array.from(monthMap.values());
    } else {
        // Numeric: 7 | 30 | 90 days
        const days = period as number;
        const cutoff = new Date();
        cutoff.setDate(cutoff.getDate() - days);
        cutoff.setHours(0, 0, 0, 0);
        filtered = sales.filter((s) => new Date(s.createdAt) >= cutoff);
        periodLabel = `Last ${days} days`;

        const dayMap = buildDayMap(days);
        for (const sale of filtered) {
            const ymd = sale.createdAt.slice(0, 10);
            const bar = dayMap.get(ymd);
            if (bar) bar.value += sale.totalAmount;
        }
        dailyBars = Array.from(dayMap.values());
    }

    const totalRevenue = filtered.reduce((s, x) => s + x.totalAmount, 0);
    const totalOrders = filtered.length;
    const avgOrderValue = totalOrders > 0 ? totalRevenue / totalOrders : 0;
    const topProducts = computeTopProducts(filtered);

    return { dailyBars, totalRevenue, totalOrders, avgOrderValue, topProducts, periodLabel };
}

export function useReports(period: Period): ReportData {
    const sales = useSalesStore((s) => s.sales);
    return useMemo(() => computeReport(sales, period), [sales, period]);
}

