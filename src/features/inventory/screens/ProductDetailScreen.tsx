import React from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, Alert } from 'react-native';
import { useInventory } from '../hooks/useInventory';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../constants/theme';
import { formatCurrency } from '../../../shared/utils/formatters';
import { StackNavigationProp } from '@react-navigation/stack';
import { InventoryStackParamList } from '../../../core/navigation/types';

type Props = {
    navigation: StackNavigationProp<InventoryStackParamList, 'ProductDetail'>;
};

export default function ProductDetailScreen({ navigation }: Props) {
    const { selectedProduct, removeProduct } = useInventory();

    if (!selectedProduct) return null;

    const isLow = selectedProduct.quantity <= selectedProduct.lowStockThreshold;

    const handleDelete = () => {
        Alert.alert('Delete Product', `Delete "${selectedProduct.name}"?`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Delete',
                style: 'destructive',
                onPress: async () => {
                    await removeProduct(selectedProduct.id);
                    navigation.goBack();
                },
            },
        ]);
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
            <View style={styles.header}>
                <Text style={styles.name}>{selectedProduct.name}</Text>
                <Text style={styles.sku}>SKU: {selectedProduct.sku}</Text>
                {selectedProduct.category && (
                    <Text style={styles.category}>{selectedProduct.category}</Text>
                )}
            </View>

            <View style={styles.row}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Price</Text>
                    <Text style={styles.statValue}>{formatCurrency(selectedProduct.price)}</Text>
                </View>
                <View style={[styles.statCard, isLow && styles.statCardDanger]}>
                    <Text style={styles.statLabel}>In Stock</Text>
                    <Text style={[styles.statValue, isLow && { color: Colors.danger }]}>
                        {selectedProduct.quantity}
                    </Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Alert At</Text>
                    <Text style={styles.statValue}>{selectedProduct.lowStockThreshold}</Text>
                </View>
            </View>

            {isLow && (
                <View style={styles.alertBanner}>
                    <Text style={styles.alertText}>⚠️ Low stock! Reorder soon.</Text>
                </View>
            )}

            <TouchableOpacity style={styles.deleteBtn} onPress={handleDelete}>
                <Text style={styles.deleteBtnText}>Delete Product</Text>
            </TouchableOpacity>
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    inner: { padding: Spacing.lg },
    header: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    name: { fontSize: FontSize.xl, fontWeight: 'bold', color: Colors.textPrimary },
    sku: { fontSize: FontSize.sm, color: Colors.textMuted, marginTop: 4 },
    category: {
        marginTop: 6,
        alignSelf: 'flex-start',
        backgroundColor: Colors.primaryLight,
        color: Colors.primary,
        paddingHorizontal: 10,
        paddingVertical: 2,
        borderRadius: BorderRadius.full,
        fontSize: FontSize.xs,
        fontWeight: 'bold',
    },
    row: { flexDirection: 'row', marginBottom: Spacing.md },
    statCard: {
        flex: 1,
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        marginRight: Spacing.sm,
    },
    statCardDanger: { borderColor: Colors.danger, backgroundColor: Colors.dangerLight },
    statLabel: { fontSize: FontSize.xs, color: Colors.textMuted, marginBottom: 4 },
    statValue: { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.textPrimary },
    alertBanner: {
        backgroundColor: Colors.warningLight,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.md,
    },
    alertText: { color: Colors.warning, fontWeight: '600', fontSize: FontSize.sm },
    deleteBtn: {
        backgroundColor: Colors.dangerLight,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    deleteBtnText: { color: Colors.danger, fontWeight: 'bold', fontSize: FontSize.md },
});
