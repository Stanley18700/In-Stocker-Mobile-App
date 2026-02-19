import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, RefreshControl } from 'react-native';
import { useAlerts } from '../hooks/useAlerts';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../constants/theme';
import { Product } from '../../../shared/types/product';

export default function AlertsScreen() {
    const { lowStockProducts, threshold, fetchLowStockAlerts } = useAlerts();

    useEffect(() => {
        fetchLowStockAlerts();
    }, []);

    const renderItem = ({ item }: { item: Product }) => (
        <View style={styles.card}>
            <View style={styles.cardLeft}>
                <Text style={styles.productName}>{item.name}</Text>
                <Text style={styles.sku}>SKU: {item.sku}</Text>
            </View>
            <View style={styles.badge}>
                <Text style={styles.badgeText}>{item.quantity} left</Text>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>⚠️ Low Stock Alerts</Text>
                <Text style={styles.headerSub}>Products at or below {threshold} units</Text>
            </View>
            <FlatList
                data={lowStockProducts}
                keyExtractor={(item) => item.id}
                renderItem={renderItem}
                contentContainerStyle={styles.list}
                refreshControl={<RefreshControl refreshing={false} onRefresh={fetchLowStockAlerts} />}
                ListEmptyComponent={
                    <View style={styles.emptyContainer}>
                        <Text style={styles.emptyIcon}>✅</Text>
                        <Text style={styles.empty}>All products are well-stocked!</Text>
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
    cardLeft: { flex: 1 },
    productName: { fontSize: FontSize.md, fontWeight: 'bold', color: Colors.textPrimary },
    sku: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
    badge: {
        backgroundColor: Colors.dangerLight,
        borderRadius: BorderRadius.full,
        paddingHorizontal: 10,
        paddingVertical: 4,
    },
    badgeText: { color: Colors.danger, fontWeight: 'bold', fontSize: FontSize.sm },
    emptyContainer: { alignItems: 'center', marginTop: 60 },
    emptyIcon: { fontSize: 48, marginBottom: Spacing.md },
    empty: { color: Colors.textMuted, fontSize: FontSize.md },
});
