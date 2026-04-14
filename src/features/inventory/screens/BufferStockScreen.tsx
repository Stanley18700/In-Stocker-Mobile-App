// ---------------------------------------------------------------------------
// BufferStockScreen — Shows the app's core value proposition:
// "When and how much buffer stock should I buy?"
// ---------------------------------------------------------------------------

import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    StyleSheet,
    RefreshControl,
    TouchableOpacity,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useBufferStock, BufferRecommendation } from '../hooks/useBufferStock';
import { useInventory } from '../hooks/useInventory';
import { useSales } from '../../sales/hooks/useSales';
import { Colors, Spacing, FontSize, FontWeight, BorderRadius, Shadow } from '../../../core/theme';
import { formatCurrency } from '../../../shared/utils/formatters';
import { usePreferencesStore } from '../../settings/store/preferencesStore';

// ── Status colour helpers ─────────────────────────────────────────────────────

function statusColor(rec: BufferRecommendation): string {
    if (rec.isOutOfStock)     return Colors.danger;
    if (rec.shouldReorderNow) return Colors.warning;
    if (rec.daysUntilStockout < 14) return Colors.warningDark;
    if (rec.avgDailySales === 0)    return Colors.textMuted;
    return Colors.secondary;
}

function statusBg(rec: BufferRecommendation): string {
    if (rec.isOutOfStock)     return Colors.dangerLight;
    if (rec.shouldReorderNow) return Colors.warningLight;
    if (rec.daysUntilStockout < 14) return Colors.warningLight;
    if (rec.avgDailySales === 0)    return Colors.surfaceAlt ?? Colors.border;
    return Colors.secondaryLight;
}

// ── RecommendationCard ────────────────────────────────────────────────────────

function RecommendationCard({ rec, currency }: { rec: BufferRecommendation; currency: string }) {
    const badgeColor = statusColor(rec);
    const badgeBg    = statusBg(rec);

    const daysText =
        rec.avgDailySales === 0
            ? 'No recent sales'
            : rec.isOutOfStock
            ? 'Out of stock!'
            : rec.daysUntilStockout === Infinity
            ? '∞ days remaining'
            : `~${Math.floor(rec.daysUntilStockout)} day${Math.floor(rec.daysUntilStockout) !== 1 ? 's' : ''} remaining`;

    return (
        <View style={[styles.card, Shadow.sm, rec.shouldReorderNow && styles.cardUrgent]}>
            {/* Row 1: Product name + status badge */}
            <View style={styles.cardTop}>
                <Text style={styles.productName} numberOfLines={1}>
                    {rec.product.name}
                </Text>
                <View style={[styles.badge, { backgroundColor: badgeBg }]}>
                    <Text style={[styles.badgeText, { color: badgeColor }]}>
                        {rec.statusLabel}
                    </Text>
                </View>
            </View>

            {/* Row 2: Stats */}
            <View style={styles.statsRow}>
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{rec.product.quantity}</Text>
                    <Text style={styles.statLabel}>In Stock</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={styles.statValue}>{rec.avgDailySales.toFixed(1)}</Text>
                    <Text style={styles.statLabel}>Units/Day</Text>
                </View>
                <View style={styles.statDivider} />
                <View style={styles.statBox}>
                    <Text style={[styles.statValue, { color: badgeColor }]}>
                        {rec.recommendedReorderQty > 0 ? rec.recommendedReorderQty : '—'}
                    </Text>
                    <Text style={styles.statLabel}>Buy Now</Text>
                </View>
            </View>

            {/* Row 3: Days remaining + estimated cost */}
            <View style={styles.cardBottom}>
                <View style={styles.daysRow}>
                    <Ionicons name="time-outline" size={14} color={badgeColor} />
                    <Text style={[styles.daysText, { color: badgeColor }]}>{daysText}</Text>
                </View>
                {rec.recommendedReorderQty > 0 && (
                    <Text style={styles.costText}>
                        Est. cost: {formatCurrency(rec.product.price * rec.recommendedReorderQty, currency)}
                    </Text>
                )}
            </View>
        </View>
    );
}

// ── BufferStockScreen ──────────────────────────────────────────────────────────

export default function BufferStockScreen() {
    const { fetchProducts, isLoading: inventoryLoading } = useInventory();
    const { fetchSalesHistory, isLoading: salesLoading } = useSales();
    const { currency } = usePreferencesStore();
    const recommendations = useBufferStock();

    const isLoading = inventoryLoading || salesLoading;

    const refresh = async () => {
        await Promise.all([fetchProducts(), fetchSalesHistory()]);
    };

    useEffect(() => {
        refresh();
    }, []);

    // Sort: urgent first, then by fewest days remaining
    const sorted = [...recommendations].sort((a, b) => {
        if (a.shouldReorderNow !== b.shouldReorderNow)
            return a.shouldReorderNow ? -1 : 1;
        if (a.daysUntilStockout === Infinity && b.daysUntilStockout === Infinity) return 0;
        if (a.daysUntilStockout === Infinity) return 1;
        if (b.daysUntilStockout === Infinity) return -1;
        return a.daysUntilStockout - b.daysUntilStockout;
    });

    const urgentCount = sorted.filter((r) => r.shouldReorderNow).length;

    return (
        <View style={styles.container}>
            {/* Header summary banner */}
            <View style={[styles.banner, urgentCount > 0 ? styles.bannerUrgent : styles.bannerOk]}>
                <View style={styles.bannerIcon}>
                    <Ionicons
                        name={urgentCount > 0 ? 'cart-outline' : 'checkmark-circle-outline'}
                        size={26}
                        color={urgentCount > 0 ? Colors.warning : Colors.secondary}
                    />
                </View>
                <View style={styles.bannerText}>
                    <Text style={styles.bannerTitle}>
                        {urgentCount > 0
                            ? `${urgentCount} item${urgentCount > 1 ? 's' : ''} to reorder`
                            : 'Stock levels look good'}
                    </Text>
                    <Text style={styles.bannerSub}>
                        Based on last 30 days of sales · 14-day buffer
                    </Text>
                </View>
            </View>

            <FlatList
                data={sorted}
                keyExtractor={(item) => item.product.id}
                renderItem={({ item }) => (
                    <RecommendationCard rec={item} currency={currency} />
                )}
                contentContainerStyle={styles.list}
                refreshControl={
                    <RefreshControl
                        refreshing={isLoading}
                        onRefresh={refresh}
                        tintColor={Colors.primary}
                    />
                }
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Ionicons name="cube-outline" size={44} color={Colors.textMuted} style={styles.emptyIcon} />
                        <Text style={styles.emptyText}>Add products and record sales</Text>
                        <Text style={styles.emptySub}>Recommendations appear after your first sale</Text>
                    </View>
                }
                ListHeaderComponent={
                    sorted.length > 0 ? (
                        <View style={styles.legend}>
                            <View style={styles.legendRow}>
                                <Ionicons name="stats-chart-outline" size={14} color={Colors.primary} />
                                <Text style={styles.legendText}>
                                    "Buy Now" = average daily sales × 14 days buffer
                                </Text>
                            </View>
                        </View>
                    ) : null
                }
            />
        </View>
    );
}

// ── Styles ────────────────────────────────────────────────────────────────────

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    list: { padding: Spacing.md, paddingBottom: Spacing.xxl },

    // Banner
    banner: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        gap: Spacing.md,
    },
    bannerUrgent: { backgroundColor: Colors.warningLight },
    bannerOk:     { backgroundColor: Colors.secondaryLight },
    bannerIcon:   { width: 32, alignItems: 'center', justifyContent: 'center' },
    bannerText:   { flex: 1 },
    bannerTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
    },
    bannerSub: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
        marginTop: 2,
    },

    // Legend
    legend: {
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.sm,
        padding: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    legendRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    legendText: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: FontWeight.medium,
    },

    // Card
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardUrgent: {
        borderColor: Colors.warning,
        borderWidth: 1.5,
    },
    cardTop: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    productName: {
        flex: 1,
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginRight: Spacing.sm,
    },
    badge: {
        borderRadius: BorderRadius.full,
        paddingHorizontal: 10,
        paddingVertical: 3,
    },
    badgeText: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
    },

    // Stats row
    statsRow: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.md,
        padding: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    statBox: {
        flex: 1,
        alignItems: 'center',
    },
    statDivider: {
        width: 1,
        height: 30,
        backgroundColor: Colors.border,
    },
    statValue: {
        fontSize: FontSize.lg,
        fontWeight: FontWeight.extrabold,
        color: Colors.textPrimary,
    },
    statLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginTop: 2,
    },

    // Bottom row
    cardBottom: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    daysRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
    daysText: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
    },
    costText: {
        fontSize: FontSize.xs,
        color: Colors.textSecondary,
    },

    // Empty state
    emptyContainer: { alignItems: 'center', marginTop: 80 },
    emptyIcon: { marginBottom: Spacing.sm },
    emptyText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.textSecondary,
        marginBottom: 4,
    },
    emptySub: { fontSize: FontSize.sm, color: Colors.textMuted, textAlign: 'center' },
});
