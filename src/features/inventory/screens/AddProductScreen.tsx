import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    ActivityIndicator,
} from 'react-native';
import { useInventory } from '../hooks/useInventory';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../core/theme';
import { generateSKU } from '../../../shared/utils/formatters';
import { APP_CONFIG } from '../../../constants/config';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { InventoryStackParamList } from '../../../core/navigation/types';
import AppModal from '../../../shared/components/AppModal';

type Props = {
    navigation: StackNavigationProp<InventoryStackParamList, 'AddProduct'>;
    route: RouteProp<InventoryStackParamList, 'AddProduct'>;
};

export default function AddProductScreen({ navigation, route }: Props) {
    const { createProduct, isLoading } = useInventory();
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [threshold, setThreshold] = useState(String(APP_CONFIG.defaultLowStockThreshold));
    const [category, setCategory] = useState('');

    const [errorModal, setErrorModal] = useState(false);
    const [errorMsg, setErrorMsg] = useState('');

    // Populate SKU when returning from the barcode scanner
    useEffect(() => {
        if (route.params?.scannedSku) {
            setSku(route.params.scannedSku);
        }
    }, [route.params?.scannedSku]);

    const handleAutoSKU = () => {
        if (name) setSku(generateSKU(name));
    };

    const showError = (msg: string) => {
        setErrorMsg(msg);
        setErrorModal(true);
    };

    const handleSave = async () => {
        if (!name.trim() || !sku.trim() || !quantity.trim() || !price.trim()) {
            showError('Name, SKU, quantity, and price are required.');
            return;
        }
        const parsedQty = parseInt(quantity, 10);
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedQty) || parsedQty < 0) {
            showError('Please enter a valid quantity (0 or more).');
            return;
        }
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            showError('Please enter a valid price (must be greater than 0).');
            return;
        }
        try {
            await createProduct({
                name: name.trim(),
                sku: sku.trim(),
                quantity: parsedQty,
                price: parsedPrice,
                lowStockThreshold: parseInt(threshold, 10) || APP_CONFIG.defaultLowStockThreshold,
                category: category.trim() || undefined,
            });
            navigation.goBack();
        } catch (e: any) {
            showError(e.message ?? 'Could not save product. Please try again.');
        }
    };

    return (
        <ScrollView
            style={styles.container}
            contentContainerStyle={styles.inner}
            keyboardShouldPersistTaps="handled"
        >
            <Text style={styles.label}>Product Name *</Text>
            <TextInput
                style={styles.input}
                value={name}
                onChangeText={setName}
                placeholder="e.g. Rice 5kg"
                placeholderTextColor={Colors.textMuted}
                onBlur={handleAutoSKU}
            />

            <Text style={styles.label}>SKU *</Text>
            <View style={styles.skuRow}>
                <TextInput
                    style={[styles.input, styles.skuInput]}
                    value={sku}
                    onChangeText={setSku}
                    placeholder="Auto-generated or scan barcode"
                    placeholderTextColor={Colors.textMuted}
                />
                <TouchableOpacity
                    style={styles.scanBtn}
                    onPress={() => navigation.navigate('BarcodeScanner', { returnTo: 'AddProduct' })}
                >
                    <Text style={styles.scanBtnText}>📷 Scan</Text>
                </TouchableOpacity>
            </View>

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

            <Text style={styles.label}>Price ({APP_CONFIG.currencySymbol}) *</Text>
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
                {isLoading
                    ? <ActivityIndicator color={Colors.white} />
                    : <Text style={styles.buttonText}>Save Product</Text>}
            </TouchableOpacity>

            {/* Validation / Save Error Modal */}
            <AppModal
                visible={errorModal}
                icon="⚠️"
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
    button: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.md,
        alignItems: 'center',
        marginTop: Spacing.sm,
    },
    buttonDisabled: {
        backgroundColor: Colors.textMuted,
    },
    buttonText: { color: Colors.white, fontSize: FontSize.md, fontWeight: 'bold' },
    skuRow: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.sm,
        marginBottom: Spacing.md,
    },
    skuInput: {
        flex: 1,
        marginBottom: 0,
    },
    scanBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        paddingVertical: Spacing.sm + 4,
        paddingHorizontal: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
    },
    scanBtnText: {
        color: Colors.white,
        fontSize: FontSize.sm,
        fontWeight: 'bold',
    },
});
