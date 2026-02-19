import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator, RefreshControl } from 'react-native';
import { useSales } from '../hooks/useSales';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../constants/theme';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { Sale } from '../../../shared/types/sale';

export default function SalesHistoryScreen() {
    const { sales, isLoading, fetchSalesHistory } = useSales();

    useEffect(() => {
        fetchSalesHistory();
    }, []);

    const renderItem = ({ item }: { item: Sale }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
                <Text style={styles.total}>{formatCurrency(item.totalAmount)}</Text>
            </View>
            {item.items.map((si) => (
                <Text key={si.id} style={styles.itemLine}>
                    {si.productName} × {si.quantity} @ {formatCurrency(si.unitPrice)}
                </Text>
            ))}
        </View>
    );

    return (
        <View style={styles.container}>
            {isLoading && sales.length === 0 ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
            ) : (
                <FlatList
                    data={sales}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    contentContainerStyle={styles.list}
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchSalesHistory()} />}
                    ListEmptyComponent={<Text style={styles.empty}>No sales recorded yet.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    list: { padding: Spacing.md },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
    date: { fontSize: FontSize.sm, color: Colors.textSecondary },
    total: { fontSize: FontSize.md, fontWeight: 'bold', color: Colors.primary },
    itemLine: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
    empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 60, fontSize: FontSize.md },
});
