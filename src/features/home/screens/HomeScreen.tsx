import React from 'react';
import {
    View,
    Text,
    ScrollView,
    TouchableOpacity,
    StyleSheet,
    RefreshControl,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { Ionicons } from '@expo/vector-icons';
import {
    Colors,
    Spacing,
    FontSize,
    FontWeight,
    BorderRadius,
    Shadow,
} from '../../../core/theme';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { useDashboard } from '../hooks/useDashboard';
import { Sale } from '../../../shared/types/sale';

// ---------------------------------------------------------------------------
// Helper: time-based greeting
// ---------------------------------------------------------------------------

function getGreeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    if (h < 21) return 'Good evening';
    return 'Good night';
}

// ---------------------------------------------------------------------------
// StatCard sub-component
// ---------------------------------------------------------------------------

interface StatCardProps {
    iconName: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    value: string;
    accent?: string;
    bg?: string;
    half?: boolean;
}

function StatCard({ iconName, label, value, accent, bg, half }: StatCardProps) {
    return (
        <View
            style={[
                styles.statCard,
                half && styles.statCardHalf,
                bg ? { backgroundColor: bg } : undefined,
                Shadow.sm,
            ]}
        >
            <Ionicons
                name={iconName}
                size={22}
                color={accent ?? Colors.textSecondary}
                style={styles.statIcon}
            />
            <Text style={[styles.statValue, accent ? { color: accent } : undefined]}>
                {value}
            </Text>
            <Text style={styles.statLabel}>{label}</Text>
        </View>
    );
}

// ---------------------------------------------------------------------------
// QuickAction button
// ---------------------------------------------------------------------------

interface QuickActionProps {
    iconName: React.ComponentProps<typeof Ionicons>['name'];
    label: string;
    color: string;
    bg: string;
    onPress: () => void;
}

function QuickAction({ iconName, label, color, bg, onPress }: QuickActionProps) {
    return (
        <TouchableOpacity
            style={[styles.quickAction, { backgroundColor: bg }, Shadow.sm]}
            onPress={onPress}
            activeOpacity={0.75}
        >
            <Ionicons name={iconName} size={22} color={color} style={styles.quickActionIcon} />
            <Text style={[styles.quickActionLabel, { color }]}>{label}</Text>
        </TouchableOpacity>
    );
}

// ---------------------------------------------------------------------------
// RecentSaleRow
// ---------------------------------------------------------------------------

function RecentSaleRow({ sale }: { sale: Sale }) {
    return (
        <View style={styles.saleRow}>
            <View style={styles.saleRowLeft}>
                <Text style={styles.saleDate}>{formatDate(sale.createdAt)}</Text>
                <Text style={styles.saleItems} numberOfLines={1}>
                    {sale.items.map((i) => `${i.productName} ×${i.quantity}`).join(', ')}
                </Text>
            </View>
            <Text style={styles.saleAmount}>{formatCurrency(sale.totalAmount)}</Text>
        </View>
    );
}

// ---------------------------------------------------------------------------
// HomeScreen — Dashboard
// ---------------------------------------------------------------------------

export default function HomeScreen() {
    const navigation = useNavigation<any>();
    const { user, stats, recentSales, refresh } = useDashboard();
    const [refreshing, setRefreshing] = React.useState(false);

    const handleRefresh = async () => {
        setRefreshing(true);
        await refresh();
        setRefreshing(false);
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.inner}
            showsVerticalScrollIndicator={false}
            refreshControl={
                <RefreshControl
                    refreshing={refreshing}
                    onRefresh={handleRefresh}
                    tintColor={Colors.primary}
                />
            }
        >
            {/* ── Greeting header ────────────────────────────────────────── */}
            <View style={styles.header}
            >
                <View style={styles.headerText}>
                    <Text style={styles.greeting}>{getGreeting()},</Text>
                    <Text style={styles.ownerName}>{user?.ownerName ?? 'there'}</Text>
                </View>
                <View style={styles.shopBadge}>
                    <Text style={styles.shopBadgeText}>{user?.shopName ?? 'Your Shop'}</Text>
                </View>
            </View>

            {/* ── Stat cards (2 × 2 grid) ─────────────────────────────────── */}
            <View style={styles.statsGrid}>
                <StatCard
                    iconName="cube-outline"
                    label="Total Products"
                    value={String(stats.totalProducts)}
                    half
                />
                <StatCard
                    iconName="alert-circle-outline"
                    label="Low Stock"
                    value={String(stats.lowStockCount)}
                    accent={stats.lowStockCount > 0 ? Colors.danger : Colors.secondary}
                    bg={stats.lowStockCount > 0 ? Colors.dangerLight : Colors.secondaryLight}
                    half
                />
                <StatCard
                    iconName="cart-outline"
                    label="Sales Today"
                    value={String(stats.todaySalesCount)}
                    half
                />
                <StatCard
                    iconName="cash-outline"
                    label="Revenue Today"
                    value={formatCurrency(stats.todayRevenue)}
                    accent={Colors.primary}
                    half
                />
            </View>

            {/* ── Inventory value banner ──────────────────────────────────── */}
            <View style={[styles.inventoryBanner, Shadow.sm]}>
                <View>
                    <Text style={styles.inventoryBannerLabel}>Total Inventory Value</Text>
                    <Text style={styles.inventoryBannerValue}>
                        {formatCurrency(stats.totalInventoryValue)}
                    </Text>
                </View>
                <Ionicons
                    name="pricetag-outline"
                    size={28}
                    color={Colors.white}
                    style={{ opacity: 0.9 }}
                />
            </View>

            {/* ── Quick actions ───────────────────────────────────────────── */}
            <Text style={styles.sectionTitle}>Quick Actions</Text>
            <View style={styles.quickActionsRow}>
                <QuickAction
                    iconName="add-circle-outline"
                    label="Add Product"
                    color={Colors.primary}
                    bg={Colors.primaryLight}
                    onPress={() =>
                        navigation.navigate('Inventory', {
                            screen: 'AddProduct',
                        })
                    }
                />
                <QuickAction
                    iconName="receipt-outline"
                    label="Record Sale"
                    color={Colors.secondary}
                    bg={Colors.secondaryLight}
                    onPress={() =>
                        navigation.navigate('Sales', {
                            screen: 'RecordSale',
                        })
                    }
                />
                <QuickAction
                    iconName="clipboard-outline"
                    label="Restock Plan"
                    color={Colors.primary}
                    bg={Colors.primaryLight}
                    onPress={() =>
                        navigation.navigate('Inventory', {
                            screen: 'BufferStock',
                        })
                    }
                />
                <QuickAction
                    iconName="notifications-outline"
                    label="Alerts"
                    color={stats.lowStockCount > 0 ? Colors.danger : Colors.textSecondary}
                    bg={stats.lowStockCount > 0 ? Colors.dangerLight : Colors.surfaceAlt}
                    onPress={() => navigation.navigate('Alerts')}
                />
            </View>

            {/* ── Recent sales ────────────────────────────────────────────── */}
            <View style={styles.sectionHeader}>
                <Text style={styles.sectionTitle}>Recent Sales</Text>
                <TouchableOpacity
                    onPress={() => navigation.navigate('Sales', { screen: 'SalesHistory' })}
                >
                    <Text style={styles.seeAll}>See all →</Text>
                </TouchableOpacity>
            </View>

            {recentSales.length === 0 ? (
                <View style={[styles.emptyCard, Shadow.sm]}>
                    <Ionicons name="cart-outline" size={34} color={Colors.textMuted} style={styles.emptyIcon} />
                    <Text style={styles.emptyText}>No sales recorded yet.</Text>
                    <Text style={styles.emptySubtext}>
                        Tap "Record Sale" to add your first transaction.
                    </Text>
                </View>
            ) : (
                <View style={[styles.salesCard, Shadow.sm]}>
                    {recentSales.map((sale, i) => (
                        <View key={sale.id}>
                            <RecentSaleRow sale={sale} />
                            {i < recentSales.length - 1 && <View style={styles.divider} />}
                        </View>
                    ))}
                </View>
            )}
        </ScrollView>
    );
}

// ---------------------------------------------------------------------------
// Styles
// ---------------------------------------------------------------------------

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    inner: { padding: Spacing.lg, paddingBottom: Spacing.xxl },

    // Header
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'flex-start',
        marginBottom: Spacing.lg,
    },
    headerText: { flex: 1 },
    greeting: {
        fontSize: FontSize.md,
        color: Colors.textSecondary,
    },
    ownerName: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.extrabold,
        color: Colors.textPrimary,
    },
    shopBadge: {
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.xs,
        marginLeft: Spacing.sm,
        marginTop: Spacing.xs,
    },
    shopBadgeText: {
        fontSize: FontSize.xs,
        color: Colors.primary,
        fontWeight: FontWeight.semibold,
    },

    // Stats grid
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        marginHorizontal: -Spacing.xs,
        marginBottom: Spacing.md,
    },
    statCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        alignItems: 'flex-start',
        margin: Spacing.xs,
        flex: 1,
        minWidth: 140,
    },
    statCardHalf: {
        flexBasis: '45%',
        flexGrow: 1,
    },
    statIcon: { marginBottom: Spacing.xs },
    statValue: {
        fontSize: FontSize.xl,
        fontWeight: FontWeight.extrabold,
        color: Colors.textPrimary,
        marginBottom: 2,
    },
    statLabel: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        fontWeight: FontWeight.medium,
    },

    // Inventory banner
    inventoryBanner: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    inventoryBannerLabel: {
        fontSize: FontSize.sm,
        color: Colors.white,
        opacity: 0.8,
        marginBottom: 4,
        fontWeight: FontWeight.medium,
    },
    inventoryBannerValue: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.extrabold,
        color: Colors.white,
    },

    // Section titles
    sectionTitle: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.textPrimary,
        marginBottom: Spacing.sm,
    },
    sectionHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.sm,
    },
    seeAll: {
        fontSize: FontSize.sm,
        color: Colors.primary,
        fontWeight: FontWeight.semibold,
    },

    // Quick actions
    quickActionsRow: {
        flexDirection: 'row',
        marginHorizontal: -Spacing.xs,
        marginBottom: Spacing.lg,
    },
    quickAction: {
        flex: 1,
        alignItems: 'center',
        justifyContent: 'center',
        borderRadius: BorderRadius.lg,
        paddingVertical: Spacing.md,
        margin: Spacing.xs,
    },
    quickActionIcon: { marginBottom: Spacing.xs },
    quickActionLabel: {
        fontSize: FontSize.xs,
        fontWeight: FontWeight.bold,
        textAlign: 'center',
    },

    // Recent sales
    salesCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        overflow: 'hidden',
    },
    saleRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
    },
    saleRowLeft: { flex: 1, marginRight: Spacing.md },
    saleDate: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginBottom: 2,
    },
    saleItems: {
        fontSize: FontSize.sm,
        color: Colors.textPrimary,
        fontWeight: FontWeight.medium,
    },
    saleAmount: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.bold,
        color: Colors.primary,
    },
    divider: {
        height: 1,
        backgroundColor: Colors.border,
        marginHorizontal: Spacing.md,
    },

    // Empty state
    emptyCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.xl,
        alignItems: 'center',
    },
    emptyIcon: { marginBottom: Spacing.sm },
    emptyText: {
        fontSize: FontSize.md,
        fontWeight: FontWeight.semibold,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    emptySubtext: {
        fontSize: FontSize.sm,
        color: Colors.textMuted,
        textAlign: 'center',
    },
});
