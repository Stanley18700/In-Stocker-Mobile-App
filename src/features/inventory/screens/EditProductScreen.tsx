import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useInventory } from '../hooks/useInventory';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../core/theme';
import { APP_CONFIG } from '../../../constants/config';
import { StackNavigationProp } from '@react-navigation/stack';
import { InventoryStackParamList } from '../../../core/navigation/types';

type Props = {
    navigation: StackNavigationProp<InventoryStackParamList, 'EditProduct'>;
};

export default function EditProductScreen({ navigation }: Props) {
    const { selectedProduct, editProduct, isLoading } = useInventory();

    if (!selectedProduct) {
        navigation.goBack();
        return null;
    }

    const [name, setName] = useState(selectedProduct.name);
    const [sku, setSku] = useState(selectedProduct.sku);
    const [quantity, setQuantity] = useState(String(selectedProduct.quantity));
    const [price, setPrice] = useState(String(selectedProduct.price));
    const [threshold, setThreshold] = useState(String(selectedProduct.lowStockThreshold));
    const [category, setCategory] = useState(selectedProduct.category ?? '');

    const handleSave = async () => {
        if (!name || !quantity || !price) {
            Alert.alert('Error', 'Name, quantity, and price are required.');
            return;
        }
        try {
            await editProduct(selectedProduct.id, {
                name,
                quantity: parseInt(quantity, 10),
                price: parseFloat(price),
                lowStockThreshold: parseInt(threshold, 10),
                category: category || undefined,
            });
            navigation.goBack();
        } catch (e: any) {
            Alert.alert('Error', e.message);
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
                style={styles.button}
                onPress={handleSave}
                disabled={isLoading}
            >
                {isLoading ? (
                    <ActivityIndicator color={Colors.white} />
                ) : (
                    <Text style={styles.buttonText}>Save Changes</Text>
                )}
            </TouchableOpacity>
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
    buttonText: { color: Colors.white, fontSize: FontSize.md, fontWeight: 'bold' },
});
