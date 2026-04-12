import React, { useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity } from 'react-native';
import { useInventory } from '../hooks/useInventory';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../core/theme';
import { formatCurrency } from '../../../shared/utils/formatters';
import { StackNavigationProp } from '@react-navigation/stack';
import { InventoryStackParamList } from '../../../core/navigation/types';
import AppModal from '../../../shared/components/AppModal';

type Props = {
    navigation: StackNavigationProp<InventoryStackParamList, 'ProductDetail'>;
};


export default function ProductDetailScreen({ navigation }: Props) {
    const { selectedProduct, removeProduct } = useInventory();
    const [showDeleteModal, setShowDeleteModal] = useState(false);

    if (!selectedProduct) return null;

    const isLow = selectedProduct.quantity <= selectedProduct.lowStockThreshold;

    const handleDelete = async () => {
        setShowDeleteModal(false);
        await removeProduct(selectedProduct.id);
        navigation.goBack();
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

            <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('EditProduct', { productId: selectedProduct.id })}
            >
                <Text style={styles.editBtnText}>Edit Product</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowDeleteModal(true)}>
                <Text style={styles.deleteBtnText}>Delete Product</Text>
            </TouchableOpacity>

            <AppModal
                visible={showDeleteModal}
                icon="🗑️"
                title="Delete Product"
                message={`Are you sure you want to delete "${selectedProduct.name}"? This cannot be undone.`}
                confirmLabel="Delete"
                confirmVariant="danger"
                onConfirm={handleDelete}
                cancelLabel="Cancel"
                onCancel={() => setShowDeleteModal(false)}
            />
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
    editBtn: {
        backgroundColor: Colors.primaryLight,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    editBtnText: { color: Colors.primary, fontWeight: 'bold', fontSize: FontSize.md },
    deleteBtn: {
        backgroundColor: Colors.dangerLight,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.xs,
    },
    deleteBtnText: { color: Colors.danger, fontWeight: 'bold', fontSize: FontSize.md },
});
