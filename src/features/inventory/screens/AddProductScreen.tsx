import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    TouchableOpacity,
    StyleSheet,
    ScrollView,
} from 'react-native';
import { useTranslation } from 'react-i18next';
import { useInventory } from '../hooks/useInventory';
import {
    Colors,
    Spacing,
    FontSize,
    BorderRadius,
    FontWeight,
    Shadow,
} from '../../../core/theme';
import { generateSKU } from '../../../shared/utils/formatters';
import { APP_CONFIG } from '../../../constants/config';
import { StackNavigationProp } from '@react-navigation/stack';
import { RouteProp } from '@react-navigation/native';
import { InventoryStackParamList } from '../../../core/navigation/types';
import AppModal from '../../../shared/components/AppModal';
import InputField from '../../../shared/components/InputField';
import PrimaryButton from '../../../shared/components/PrimaryButton';
import { usePreferencesStore } from '../../settings/store/preferencesStore';

type Props = {
    navigation: StackNavigationProp<InventoryStackParamList, 'AddProduct'>;
    route: RouteProp<InventoryStackParamList, 'AddProduct'>;
};

export default function AddProductScreen({ navigation, route }: Props) {
    const { t } = useTranslation();
    const { createProduct, isLoading } = useInventory();
    const { currency, threshold: defaultThreshold } = usePreferencesStore();
    const [name, setName] = useState('');
    const [sku, setSku] = useState('');
    const [quantity, setQuantity] = useState('');
    const [price, setPrice] = useState('');
    const [threshold, setThreshold] = useState(String(defaultThreshold));
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
            showError(t('inventory.errReq'));
            return;
        }
        const parsedQty = parseInt(quantity, 10);
        const parsedPrice = parseFloat(price);
        if (isNaN(parsedQty) || parsedQty < 0) {
            showError(t('inventory.errQty'));
            return;
        }
        if (isNaN(parsedPrice) || parsedPrice <= 0) {
            showError(t('inventory.errPrice'));
            return;
        }
        try {
            await createProduct({
                name: name.trim(),
                sku: sku.trim(),
                quantity: parsedQty,
                price: parsedPrice,
                lowStockThreshold: parseInt(threshold, 10) || defaultThreshold,
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
            <View style={styles.header}>
                <Text style={styles.title}>{t('inventory.addTitle')}</Text>
                <Text style={styles.subtitle}>
                    {t('inventory.addSubtitle')}
                </Text>
            </View>

            <View style={styles.formCard}>
                <InputField
                    label={t('inventory.productName')}
                    value={name}
                    onChangeText={setName}
                    placeholder={t('inventory.productNameHint')}
                    onBlur={handleAutoSKU}
                />

                <Text style={styles.label}>{t('inventory.sku')}</Text>
                <View style={styles.skuRow}>
                    <View style={styles.skuInput}>
                        <InputField
                            value={sku}
                            onChangeText={setSku}
                            placeholder={t('inventory.skuHint')}
                        />
                    </View>
                    <TouchableOpacity
                        style={styles.scanBtn}
                        onPress={() =>
                            navigation.navigate('BarcodeScanner', { returnTo: 'AddProduct' })
                        }
                    >
                        <Text style={styles.scanBtnText}>{t('inventory.scan')}</Text>
                    </TouchableOpacity>
                </View>

                <InputField
                    label={t('inventory.category')}
                    value={category}
                    onChangeText={setCategory}
                    placeholder={t('inventory.categoryHint')}
                />

                <InputField
                    label={t('inventory.quantity')}
                    value={quantity}
                    onChangeText={setQuantity}
                    keyboardType="numeric"
                    placeholder="0"
                />

                <InputField
                    label={t('inventory.price', { currency: currency || APP_CONFIG.currencySymbol })}
                    value={price}
                    onChangeText={setPrice}
                    keyboardType="decimal-pad"
                    placeholder="0.00"
                />

                <InputField
                    label={t('inventory.threshold')}
                    value={threshold}
                    onChangeText={setThreshold}
                    keyboardType="numeric"
                    placeholder="5"
                />

                <PrimaryButton
                    title={t('inventory.saveProduct')}
                    onPress={handleSave}
                    loading={isLoading}
                    style={styles.button}
                />
            </View>

            {/* Validation / Save Error Modal */}
            <AppModal
                visible={errorModal}
                iconName="alert-circle-outline"
                iconColor={Colors.warning}
                iconBg={Colors.warningLight}
                title={t('common.error')}
                message={errorMsg}
                confirmLabel={t('common.ok')}
                onConfirm={() => setErrorModal(false)}
            />
        </ScrollView>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    inner: { padding: Spacing.lg, paddingBottom: Spacing.xxl },
    header: {
        marginBottom: Spacing.md,
    },
    title: {
        fontSize: FontSize.xxl,
        fontWeight: FontWeight.extrabold,
        color: Colors.textPrimary,
    },
    subtitle: {
        marginTop: Spacing.xs,
        fontSize: FontSize.sm,
        color: Colors.textSecondary,
    },
    formCard: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        borderWidth: 1,
        borderColor: Colors.border,
        padding: Spacing.md,
        ...Shadow.sm,
    },
    label: {
        fontSize: FontSize.sm,
        fontWeight: FontWeight.semibold,
        color: Colors.textSecondary,
        marginBottom: Spacing.xs,
    },
    button: { marginTop: Spacing.sm },
    skuRow: {
        flexDirection: 'row',
        alignItems: 'flex-start',
        gap: Spacing.sm,
        marginBottom: Spacing.sm,
    },
    skuInput: {
        flex: 1,
    },
    scanBtn: {
        backgroundColor: Colors.primary,
        borderRadius: BorderRadius.md,
        minHeight: 52,
        paddingVertical: Spacing.md,
        paddingHorizontal: Spacing.md,
        alignItems: 'center',
        justifyContent: 'center',
        ...Shadow.sm,
    },
    scanBtnText: {
        color: Colors.white,
        fontSize: FontSize.sm,
        fontWeight: FontWeight.bold,
    },
});
