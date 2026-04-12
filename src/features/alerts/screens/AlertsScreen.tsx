import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useAlerts } from '../hooks/useAlerts';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../core/theme';
import { Product } from '../../../shared/types/product';

export default function AlertsScreen() {
    const { lowStockProducts, isLoading, fetchLowStockAlerts } = useAlerts();

    useEffect(() => {
        fetchLowStockAlerts();
    }, []);

    const renderItem = ({ item }: { item: Product }) => {
        const urgency = item.quantity === 0 ? 'out' : item.quantity <= Math.floor(item.lowStockThreshold / 2) ? 'critical' : 'low';
        return (
            <View style={[styles.card, urgency === 'out' && styles.cardOut, urgency === 'critical' && styles.cardCritical]}>
                <View style={styles.cardLeft}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.sku}>SKU: {item.sku}  ·  Threshold: {item.lowStockThreshold} units</Text>
                </View>
                <View style={[styles.badge, urgency === 'out' ? styles.badgeOut : urgency === 'critical' ? styles.badgeCritical : styles.badgeLow]}>
                    <Text style={[styles.badgeText, urgency === 'out' ? styles.badgeTextOut : urgency === 'critical' ? styles.badgeTextCritical : styles.badgeTextLow]}>
                        {item.quantity === 0 ? 'OUT' : `${item.quantity} left`}
                    </Text>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>⚠️ Low Stock Alerts</Text>
                <Text style={styles.headerSub}>
                    {lowStockProducts.length === 0
                        ? 'All products are within safe levels'
                        : `${lowStockProducts.length} product${lowStockProducts.length > 1 ? 's' : ''} need attention`}
                </Text>
            </View>
            <FlatList
                data={lowStockProducts}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={isLoading} onRefresh={fetchLowStockAlerts} tintColor={Colors.warning} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>✅</Text>
                        <Text style={styles.empty}>All products are well-stocked!</Text>
                        <Text style={styles.emptySub}>Pull down to refresh</Text>
                    </View>
                }
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    header: {
        backgroundColor: Colors.warningLight,
        padding: Spacing.lg,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
    },
    headerTitle: { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.warning },
    headerSub: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
    list: { padding: Spacing.md },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.dangerLight,
    },
    cardCritical: { borderColor: Colors.danger },
    cardOut: { borderColor: Colors.danger, backgroundColor: Colors.dangerLight },
    cardLeft: { flex: 1 },
    productName: { fontSize: FontSize.md, fontWeight: 'bold', color: Colors.textPrimary },
    sku: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
    badge: {
        borderRadius: BorderRadius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeLow: { backgroundColor: Colors.warningLight },
    badgeCritical: { backgroundColor: Colors.dangerLight },
    badgeOut: { backgroundColor: Colors.danger },
    badgeText: { fontWeight: 'bold', fontSize: FontSize.sm },
    badgeTextLow: { color: Colors.warning },
    badgeTextCritical: { color: Colors.danger },
    badgeTextOut: { color: Colors.white },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
    empty: { color: Colors.textMuted, fontSize: FontSize.md },
    emptySub: { color: Colors.textMuted, fontSize: FontSize.sm, marginTop: 4 },
});

