import React, { useEffect, useMemo, useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import AppModal from '../../../shared/components/AppModal';
import { useInventory } from '../hooks/useInventory';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../core/theme';
import { APP_CONFIG } from '../../../constants/config';
import { StackNavigationProp } from '@react-navigation/stack';
import { InventoryStackParamList } from '../../../core/navigation/types';
import { RouteProp } from '@react-navigation/native';
import { inventoryService } from '../services/inventoryService';
import { Product } from '../../../shared/types/product';
import { usePreferencesStore } from '../../settings/store/preferencesStore';

type Props = {
    navigation: StackNavigationProp<InventoryStackParamList, 'EditProduct'>;
    route: RouteProp<InventoryStackParamList, 'EditProduct'>;
};

export default function EditProductScreen({ navigation, route }: Props) {
    const { selectedProduct, editProduct, isLoading, setSelectedProduct } = useInventory();
    const { currency } = usePreferencesStore();
    const { productId } = route.params;
    const [fallbackProduct, setFallbackProduct] = useState<Product | null>(null);
    const [isFetchingProduct, setIsFetchingProduct] = useState(false);
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [threshold, setThreshold] = useState('');
    const [category, setCategory] = useState('');
    const [errorModal, setErrorModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

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

        void inventoryService
            .getById(productId)
            .then((fetchedProduct) => {
                if (!isMounted) return;
                setFallbackProduct(fetchedProduct);
                setSelectedProduct(fetchedProduct);
            })
            .catch(() => {
                if (!isMounted) return;
                showError('Could not load this product.');
            })
            .finally(() => {
                if (!isMounted) return;
                setIsFetchingProduct(false);
            });

        return () => {
            isMounted = false;
        };
    }, [productId, selectedProduct, setSelectedProduct]);

    useEffect(() => {
        if (!product) return;
        setName(product.name);
        setSku(product.sku);
        setQuantity(String(product.quantity));
        setPrice(String(product.price));
        setThreshold(String(product.lowStockThreshold));
        setCategory(product.category ?? '');
    }, [product]);

    const showError = (msg: string) => { setErrorMsg(msg); setErrorModal(true); };

    const handleSave = async () => {
        if (!product) return;
        if (!name.trim() || !quantity.trim() || !price.trim()) {
            showError('Name, quantity, and price are required.');
            return;
        }
        const parsedQuantity = Number.parseInt(quantity, 10);
        const parsedPrice = Number.parseFloat(price);
        const parsedThreshold = Number.parseInt(threshold, 10);

        if (Number.isNaN(parsedQuantity) || parsedQuantity < 0) {
            showError('Please enter a valid quantity (0 or more).');
            return;
        }
        if (Number.isNaN(parsedPrice) || parsedPrice <= 0) {
            showError('Please enter a valid price (greater than 0).');
            return;
        }
        if (Number.isNaN(parsedThreshold) || parsedThreshold < 1) {
            showError('Please enter a valid low stock threshold (1 or more).');
            return;
        }

        try {
            await editProduct(product.id, {
                name: name.trim(),
                quantity: parsedQuantity,
                price: parsedPrice,
                lowStockThreshold: parsedThreshold,
                category: category.trim() || undefined,
            });
            navigation.goBack();
        } catch (e: any) {
            showError(e.message ?? 'Could not save changes.');
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.inner}
            keyboardShouldPersistTaps="handled"
        >
            {isFetchingProduct && !product ? (
                <View style={styles.loadingWrap}>
                    <ActivityIndicator color={Colors.primary} />
                    <Text style={styles.loadingText}>Loading product...</Text>
                </View>
            ) : (
                <>
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Rice 5kg"
                placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>SKU</Text>
            <TextInput
                style={[styles.input, styles.inputReadonly]}
                value={sku}
                editable={false}
            />
            <Text style={styles.hint}>SKU cannot be changed after creation.</Text>

            <Text style={styles.label}>Category</Text>
            <TextInput
                style={styles.input}
                value={category}
                onChangeText={setCategory}
                placeholder="e.g. Food, Beverage"
                placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Quantity *</Text>
            <TextInput
                style={styles.input}
                value={quantity}
                onChangeText={setQuantity}
                keyboardType="numeric"
                placeholder="0"
                placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Price ({currency || APP_CONFIG.currencySymbol}) *</Text>
            <TextInput
                style={styles.input}
                value={price}
                onChangeText={setPrice}
                keyboardType="decimal-pad"
                placeholder="0.00"
                placeholderTextColor={Colors.textMuted}
            />

            <Text style={styles.label}>Low Stock Alert Threshold</Text>
            <TextInput
                style={styles.input}
                value={threshold}
                onChangeText={setThreshold}
                keyboardType="numeric"
                placeholder="5"
                placeholderTextColor={Colors.textMuted}
            />

            <TouchableOpacity
                style={[styles.button, isLoading && styles.buttonDisabled]}
                onPress={handleSave}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color={Colors.white} />
                ) : (
                    <Text style={styles.buttonText}>Save Changes</Text>
                )}
            </TouchableOpacity>
                </>
            )}

            <AppModal
                visible={errorModal}
                iconName="alert-circle-outline"
                iconColor={Colors.warning}
                iconBg={Colors.warningLight}
                title="Cannot Save"
                message={errorMsg}
                confirmLabel="OK"
                onConfirm={() => setErrorModal(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    inner: { padding: Spacing.lg },
    label: {
        fontSize: FontSize.sm,
        fontWeight: 'bold',
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    loadingWrap: {
        paddingVertical: Spacing.xl,
        alignItems: 'center',
        justifyContent: 'center',
        gap: Spacing.sm,
    },
    loadingText: {
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    input: {
        backgroundColor: Colors.surface,
        borderWidth: 1,
        borderColor: Colors.border,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 4,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        marginBottom: Spacing.md,
    },
    inputReadonly: {
        backgroundColor: Colors.surfaceAlt ?? '#F1F5F9',
        color: Colors.textMuted,
        marginBottom: Spacing.xs,
    },
    hint: {
        fontSize: FontSize.xs,
        color: Colors.textMuted,
        marginBottom: Spacing.md,
        marginTop: -Spacing.xs,
    },
    button: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    buttonDisabled: { backgroundColor: Colors.textMuted },
    buttonText: { color: Colors.white, fontSize: FontSize.md, fontWeight: 'bold' },
});
