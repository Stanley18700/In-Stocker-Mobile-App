import React, { useEffect, useMemo, useState } from 'react';
import { View, Text, ScrollView, StyleSheet, TouchableOpacity, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../hooks/useInventory';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../core/theme';
import { formatCurrency } from '../../../shared/utils/formatters';
import { StackNavigationProp } from '@react-navigation/stack';
import { InventoryStackParamList } from '../../../core/navigation/types';
import AppModal from '../../../shared/components/AppModal';
import { RouteProp } from '@react-navigation/native';
import { inventoryService } from '../services/inventoryService';
import { Product } from '../../../shared/types/product';
import { usePreferencesStore } from '../../settings/store/preferencesStore';

type Props = {
    navigation: StackNavigationProp<InventoryStackParamList, 'ProductDetail'>;
    route: RouteProp<InventoryStackParamList, 'ProductDetail'>;
};


export default function ProductDetailScreen({ navigation, route }: Props) {
    const { selectedProduct, removeProduct, setSelectedProduct } = useInventory();
    const { currency } = usePreferencesStore();
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [fallbackProduct, setFallbackProduct] = useState<Product | null>(null);
    const [isFetchingProduct, setIsFetchingProduct] = useState(false);
    const [loadError, setLoadError] = useState<string | null>(null);
    const { productId } = route.params;

    const product = useMemo(() => {
        if (selectedProduct?.id === productId) {
            return selectedProduct;
        }
        return fallbackProduct;
    }, [fallbackProduct, productId, selectedProduct]);

    useEffect(() => {
        if (selectedProduct?.id === productId) {
            setFallbackProduct(selectedProduct);
            return;
        }

        let isMounted = true;
        setIsFetchingProduct(true);
        setLoadError(null);

        void inventoryService
            .getById(productId)
            .then((fetchedProduct) => {
                if (!isMounted) return;
                setFallbackProduct(fetchedProduct);
                setSelectedProduct(fetchedProduct);
            })
            .catch(() => {
                if (!isMounted) return;
                setLoadError('Could not load this product right now.');
            })
            .finally(() => {
                if (!isMounted) return;
                setIsFetchingProduct(false);
            });

        return () => {
            isMounted = false;
        };
    }, [productId, selectedProduct, setSelectedProduct]);

    if (isFetchingProduct && !product) {
        return (
            <View style={styles.loadingWrap}>
                <ActivityIndicator size="large" color={Colors.primary} />
            </View>
        );
    }

    if (!product) {
        return (
            <View style={styles.loadingWrap}>
                <Text style={styles.errorText}>{loadError ?? 'Product not found.'}</Text>
            </View>
        );
    }

    const isLow = product.quantity <= product.lowStockThreshold;

    const handleDelete = async () => {
        setShowDeleteModal(false);
        await removeProduct(product.id);
        navigation.goBack();
    };

    return (
        <ScrollView style={styles.container} contentContainerStyle={styles.inner}>
            <View style={styles.header}>
                <Text style={styles.name}>{product.name}</Text>
                <Text style={styles.sku}>SKU: {product.sku}</Text>
                {product.category && (
                    <Text style={styles.category}>{product.category}</Text>
                )}
            </View>

            <View style={styles.row}>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Price</Text>
                    <Text style={styles.statValue}>{formatCurrency(product.price, currency)}</Text>
                </View>
                <View style={[styles.statCard, isLow && styles.statCardDanger]}>
                    <Text style={styles.statLabel}>In Stock</Text>
                    <Text style={[styles.statValue, isLow && { color: Colors.danger }]}>
                        {product.quantity}
                    </Text>
                </View>
                <View style={styles.statCard}>
                    <Text style={styles.statLabel}>Alert At</Text>
                    <Text style={styles.statValue}>{product.lowStockThreshold}</Text>
                </View>
            </View>

            {isLow && (
                <View style={styles.alertBanner}>
                    <View style={styles.alertRow}>
                        <Ionicons name="warning-outline" size={16} color={Colors.warning} />
                        <Text style={styles.alertText}>Low stock! Reorder soon.</Text>
                    </View>
                </View>
            )}

            <TouchableOpacity
                style={styles.editBtn}
                onPress={() => navigation.navigate('EditProduct', { productId: product.id })}
            >
                <Text style={styles.editBtnText}>Edit Product</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.deleteBtn} onPress={() => setShowDeleteModal(true)}>
                <Text style={styles.deleteBtnText}>Delete Product</Text>
            </TouchableOpacity>

            <AppModal
                visible={showDeleteModal}
                iconName="trash-outline"
                title="Delete Product"
                message={`Are you sure you want to delete "${product.name}"? This cannot be undone.`}
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
    loadingWrap: {
        flex: 1,
        backgroundColor: Colors.background,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: Spacing.lg,
    },
    errorText: {
        color: Colors.danger,
        fontSize: FontSize.md,
        textAlign: 'center',
    },
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
    alertRow: { flexDirection: 'row', alignItems: 'center', gap: Spacing.xs },
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
