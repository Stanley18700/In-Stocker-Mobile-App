import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    ScrollView,
    TouchableOpacity,
    ActivityIndicator,
    useWindowDimensions,
} from 'react-native';

import { BarChart } from 'react-native-gifted-charts';
import { useSales } from '../hooks/useSales';
import { useReports, Period } from '../hooks/useReports';
import { usePreferencesStore } from '../../settings/store/preferencesStore';
import { formatCurrency } from '../../../shared/utils/formatters';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius } from '../../../core/theme';

const PERIODS: { label: string; value: Period }[] = [
    { label: '7 days', value: 7 },
    { label: '30 days', value: 30 },
    { label: '90 days', value: 90 },
    { label: 'This Month', value: 'month' },
    { label: 'This Year', value: 'year' },
];

export default function ReportsScreen() {
    const { width } = useWindowDimensions();
    const { sales, isLoading, fetchSalesHistory } = useSales();
    const { currency } = usePreferencesStore();
    const [period, setPeriod] = useState<Period>(7);

    const report = useReports(period);

    useEffect(() => {
        // Ensure sales data is loaded
        if (sales.length === 0) fetchSalesHistory();
    }, []);

    const chartWidth = width - Spacing.lg * 2 - 40;

    const barData = report.dailyBars.map((bar) => ({
        value: bar.value,
        label: bar.label,
        frontColor: bar.value > 0 ? Colors.primary : Colors.border,
        topLabelComponent: () =>
            bar.value > 0 ? (
                <Text style={styles.barTopLabel}>
                    {bar.value >= 1000
                        ? `${(bar.value / 1000).toFixed(1)}k`
                        : Math.round(bar.value).toString()}
                </Text>
            ) : null,
    }));

    const maxBar = Math.max(...report.dailyBars.map((b) => b.value), 1);
    const yAxisMax = Math.ceil(maxBar / 100) * 100 || 100;

    // Dynamic bar sizing based on the number of bars
    const barCount = report.dailyBars.length;
    const barWidth = barCount <= 7 ? 32 : barCount <= 14 ? 20 : barCount <= 31 ? 10 : 8;
    const barSpacing = barCount <= 7 ? 20 : barCount <= 14 ? 10 : barCount <= 31 ? 4 : 3;

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
            {/* Period picker */}
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.periodRow} contentContainerStyle={styles.periodRowContent}>
                {PERIODS.map((p) => (
                    <TouchableOpacity
                        key={String(p.value)}
                        style={[
                            styles.periodChip,
                            period === p.value && styles.periodChipActive,
                        ]}
                        onPress={() => setPeriod(p.value)}
                    >
                        <Text
                            style={[
                                styles.periodChipText,
                                period === p.value && styles.periodChipTextActive,
                            ]}
                        >
                            {p.label}
                        </Text>
                    </TouchableOpacity>
                ))}
            </ScrollView>


            {/* Revenue chart */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>
                    Revenue — {report.periodLabel}
                </Text>

                {isLoading ? (
                    <ActivityIndicator
                        color={Colors.primary}
                        style={{ marginVertical: Spacing.xl }}
                    />
                ) : report.totalOrders === 0 ? (
                    <View style={styles.emptyChart}>
                        <Text style={styles.emptyText}>No sales in this period</Text>
                    </View>
                ) : (
                    <BarChart
                        data={barData}
                        width={chartWidth}
                        height={200}
                        barWidth={barWidth}
                        spacing={barSpacing}
                        noOfSections={4}
                        maxValue={yAxisMax}
                        yAxisTextStyle={styles.axisText}
                        xAxisLabelTextStyle={styles.axisText}
                        showReferenceLine1
                        referenceLine1Position={yAxisMax / 2}
                        referenceLine1Config={{ color: Colors.border, dashWidth: 4, dashGap: 4 }}
                        yAxisThickness={0}
                        xAxisThickness={1}
                        xAxisColor={Colors.border}
                        isAnimated
                        animationDuration={500}
                        hideRules
                        showGradient
                        gradientColor={Colors.primary + '55'}
                        frontColor={Colors.primary}
                    />
                )}
            </View>

            {/* Summary stats */}
            <View style={styles.statsRow}>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {formatCurrency(report.totalRevenue, currency)}
                    </Text>
                    <Text style={styles.statLabel}>Total Revenue</Text>
                </View>
                <View style={[styles.statCard, styles.statCardMiddle]}>
                    <Text style={styles.statValue}>{report.totalOrders}</Text>
                    <Text style={styles.statLabel}>Orders</Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statValue}>
                        {formatCurrency(report.avgOrderValue, currency)}
                    </Text>
                    <Text style={styles.statLabel}>Avg Order</Text>
                </View>
            </View>

            {/* Top products */}
            <View style={styles.card}>
                <Text style={styles.cardTitle}>Top Products by Revenue</Text>

                {report.topProducts.length === 0 ? (
                    <Text style={styles.emptyText}>No products sold in this period</Text>
                ) : (
                    report.topProducts.map((product, index) => {
                        const pct =
                            report.totalRevenue > 0
                                ? product.revenue / report.totalRevenue
                                : 0;
                        return (
                            <View
                                key={product.name}
                                style={[
                                    styles.productRow,
                                    index < report.topProducts.length - 1 && styles.productRowBorder,
                                ]}
                            >
                                <View style={styles.productRank}>
                                    <Text style={styles.rankText}>#{index + 1}</Text>
                                </View>
                                <View style={styles.productInfo}>
                                    <View style={styles.productNameRow}>
                                        <Text style={styles.productName} numberOfLines={1}>
                                            {product.name}
                                        </Text>
                                        <Text style={styles.productRevenue}>
                                            {formatCurrency(product.revenue, currency)}
                                        </Text>
                                    </View>
                                    <View style={styles.barTrack}>
                                        <View
                                            style={[
                                                styles.barFill,
                                                { width: `${Math.round(pct * 100)}%` },
                                            ]}
                                        />
                                    </View>
                                    <Text style={styles.productUnits}>
                                        {product.unitsSold} units · {Math.round(pct * 100)}% of revenue
                                    </Text>
                                </View>
                            </View>
                        );
                    })
                )}
            </View>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    inner: { padding: Spacing.lg, paddingBottom: Spacing.xl * 2 },

    // Period chips
    periodRow: {
        marginBottom: Spacing.md,
    },
    periodRowContent: {
        flexDirection: 'row',
        gap: Spacing.sm,
        paddingRight: Spacing.sm,
    },
    periodChip: {
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        borderRadius: BorderRadius.md,
        borderWidth: 1.5,
        borderColor: Colors.border,
        backgroundColor: Colors.surface,
        alignItems: 'center',
    },
    periodChipActive: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '18',
    },
    periodChipText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        color: Colors.textSecondary,
    },
    periodChipTextActive: {
        color: Colors.primary,
        fontWeight: FontWeight.bold,
    },

    // Card
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        marginBottom: Spacing.md,
        overflow: 'hidden',
    },
    cardTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },

    // Chart
    barTopLabel: {
        fontSize: 9,
        color: Colors.primary,
        fontWeight: FontWeight.bold,
        marginBottom: 2,
    },
    axisText: {
        fontSize: 10,
        color: Colors.textMuted,
    },
    emptyChart: {
        height: 120,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        color: Colors.textMuted,
        fontSize: FontSize.sm,
        textAlign: 'center',
        paddingVertical: Spacing.lg,
    },

    // Stats row
    statsRow: {
        flexDirection: 'row',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    statCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        alignItems: 'center',
    },
    statCardMiddle: {
        borderColor: Colors.primary,
        backgroundColor: Colors.primary + '10',
    },
    statValue: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        textAlign: 'center',
    },

    // Top products
    productRow: {
        flexDirection: 'row',
        alignItems: 'center',
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
    },
    productRowBorder: {
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    productRank: {
        width: 28,
        height: 28,
        borderRadius: 14,
        backgroundColor: Colors.background,
        borderWidth: 1,
        borderColor: Colors.border,
        alignItems: 'center',
        justifyContent: 'center',
    },
    rankText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        color: Colors.textSecondary,
    },
    productInfo: { flex: 1 },
    productNameRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 4,
    },
    productName: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.medium,
        color: Colors.textPrimary,
        flex: 1,
        marginRight: Spacing.sm,
    },
    productRevenue: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
    },
    barTrack: {
        height: 4,
        backgroundColor: Colors.background,
        borderRadius: 2,
        marginBottom: 4,
        overflow: 'hidden',
    },
    barFill: {
        height: 4,
        backgroundColor: Colors.primary,
        borderRadius: 2,
    },
    productUnits: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
    },
});
