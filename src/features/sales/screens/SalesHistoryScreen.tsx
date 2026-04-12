import React, { useEffect } from 'react';
import { View, Text, SectionList, StyleSheet, ActivityIndicator, RefreshControl, TouchableOpacity } from 'react-native';
import { useSales } from '../hooks/useSales';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../core/theme';
import { formatCurrency, formatDate } from '../../../shared/utils/formatters';
import { Sale } from '../../../shared/types/sale';
import { StackNavigationProp } from '@react-navigation/stack';
import { SalesStackParamList } from '../../../core/navigation/types';

type Props = {
    navigation: StackNavigationProp<SalesStackParamList, 'SalesHistory'>;
};

// ── Helpers ──────────────────────────────────────────────────────────────────

function toDateKey(isoString: string): string {
    return isoString.slice(0, 10); // "YYYY-MM-DD"
}

function dateLabel(key: string): string {
    const today = new Date().toISOString().slice(0, 10);
    const yesterday = new Date(Date.now() - 86400000).toISOString().slice(0, 10);
    if (key === today) return 'Today';
    if (key === yesterday) return 'Yesterday';
    // reformat YYYY-MM-DD → DD/MM/YYYY
    const [y, m, d] = key.split('-');
    return `${d}/${m}/${y}`;
}

function groupByDate(sales: Sale[]): { title: string; data: Sale[] }[] {
    const map = new Map<string, Sale[]>();
    for (const sale of sales) {
        const key = toDateKey(sale.createdAt);
        const arr = map.get(key) ?? [];
        arr.push(sale);
        map.set(key, arr);
    }
    return Array.from(map.entries()).map(([key, data]) => ({
        title: dateLabel(key),
        data,
    }));
}

// ── Component ─────────────────────────────────────────────────────────────────

export default function SalesHistoryScreen({ navigation }: Props) {
    const { sales, isLoading, fetchSalesHistory } = useSales();

    useEffect(() => {
        fetchSalesHistory();
    }, []);

    const sections = groupByDate(sales);

    const renderItem = ({ item }: { item: Sale }) => (
        <View style={styles.card}>
            <View style={styles.cardHeader}>
                <Text style={styles.time}>{item.createdAt.slice(11, 16)}</Text>
                <Text style={styles.total}>{formatCurrency(item.totalAmount)}</Text>
            </View>
            {item.items.map((si) => (
                <Text key={si.id} style={styles.itemLine}>
                    {si.productName} × {si.quantity} @ {formatCurrency(si.unitPrice)}
                </Text>
            ))}
        </View>
    );

    const renderSectionHeader = ({ section }: { section: { title: string } }) => (
        <View style={styles.sectionHeader}>
            <Text style={styles.sectionTitle}>{section.title}</Text>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.reportsBtn}
                onPress={() => navigation.navigate('Reports')}
            >
                <Text style={styles.reportsBtnText}>📊  View Reports</Text>
            </TouchableOpacity>
            {isLoading && sales.length === 0 ? (
                <ActivityIndicator style={{ marginTop: 40 }} color={Colors.primary} />
            ) : (
                <SectionList
                    sections={sections}
                    keyExtractor={(item) => item.id}
                    renderItem={renderItem}
                    renderSectionHeader={renderSectionHeader}
                    contentContainerStyle={styles.list}
                    stickySectionHeadersEnabled
                    refreshControl={<RefreshControl refreshing={isLoading} onRefresh={() => fetchSalesHistory()} />}
                    ListEmptyComponent={<Text style={styles.empty}>No sales recorded yet.</Text>}
                />
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    list: { padding: Spacing.md, paddingTop: 0 },
    sectionHeader: {
        backgroundColor: Colors.background,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.xs,
        marginTop: Spacing.sm,
    },
    sectionTitle: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        textTransform: 'uppercase',
        letterSpacing: 0.5,
    },
    card: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    cardHeader: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: Spacing.xs },
    time: { fontSize: FontSize.sm, color: Colors.textMuted },
    total: { fontSize: FontSize.md, fontWeight: 'bold', color: Colors.primary },
    itemLine: { fontSize: FontSize.xs, color: Colors.textMuted, marginTop: 2 },
    empty: { textAlign: 'center', color: Colors.textMuted, marginTop: 60, fontSize: FontSize.md },
    reportsBtn: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        margin: Spacing.md,
        marginBottom: 0,
        paddingVertical: Spacing.sm,
        paddingHorizontal: Spacing.md,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    reportsBtnText: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: Colors.primary,
    },
});

