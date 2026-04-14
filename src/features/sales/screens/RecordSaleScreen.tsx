import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
} from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { useInventory } from '../../inventory/hooks/useInventory';
import { useSales } from '../hooks/useSales';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../core/theme';
import { formatCurrency } from '../../../shared/utils/formatters';
import { Product } from '../../../shared/types/product';
import { StackNavigationProp } from '@react-navigation/stack';
import { SalesStackParamList } from '../../../core/navigation/types';
import AppModal from '../../../shared/components/AppModal';

type Props = {
    navigation: StackNavigationProp<SalesStackParamList, 'RecordSale'>;
};

type ModalState = 'none' | 'confirm' | 'success' | 'error';

export default function RecordSaleScreen({ navigation }: Props) {
    const { products, fetchProducts } = useInventory();
    const { cart, cartTotal, cartItemCount, addProductToCart, removeFromCart, checkout } = useSales();
    const [query, setQuery] = useState('');
    const [modal, setModal] = useState<ModalState>('none');
    const [errorMsg, setErrorMsg] = useState('');
    const [isCheckingOut, setIsCheckingOut] = useState(false);

    useEffect(() => {
        fetchProducts();
    }, []);

    const filtered = query.trim()
        ? products.filter((p) => p.name.toLowerCase().includes(query.toLowerCase()))
        : products;

    const handleCheckout = () => {
        if (cart.length === 0) return;
        setModal('confirm');
    };

    const handleConfirm = async () => {
        setModal('none');
        setIsCheckingOut(true);
        try {
            await checkout();
            setModal('success');
        } catch (e: any) {
            console.error('[Checkout] failed:', e);
            setErrorMsg(e.message ?? 'Something went wrong.');
            setModal('error');
        } finally {
            setIsCheckingOut(false);
        }
    };

    const renderProduct = ({ item }: { item: Product }) => {
        const inCart = cart.find((c) => c.product.id === item.id);
        return (
            <View style={styles.productRow}>
                <View style={styles.productInfo}>
                    <Text style={styles.productName}>{item.name}</Text>
                    <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
                </View>
                <View style={styles.actions}>
                    {inCart && (
                        <TouchableOpacity style={styles.removeBtn} onPress={() => removeFromCart(item.id)}>
                            <Ionicons name="remove" size={18} color={Colors.danger} />
                        </TouchableOpacity>
                    )}
                    {inCart && <Text style={styles.qtyText}>{inCart.quantity}</Text>}
                    <TouchableOpacity
                        style={[styles.addBtn, item.quantity === 0 && styles.addBtnDisabled]}
                        onPress={() => addProductToCart(item)}
                        disabled={item.quantity === 0}
                    >
                        <Ionicons name="add" size={18} color={Colors.white} />
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            {/* ── Search bar ─────────────────────────────────────────────── */}
            <View style={styles.searchBar}>
                <Ionicons name="search-outline" size={16} color={Colors.textMuted} />
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search products..."
                    placeholderTextColor={Colors.textMuted}
                    value={query}
                    onChangeText={setQuery}
                    returnKeyType="search"
                />
                {query.length > 0 && (
                    <TouchableOpacity onPress={() => setQuery('')}>
                        <Ionicons name="close" size={16} color={Colors.textMuted} />
                    </TouchableOpacity>
                )}
            </View>

            {/* ── Product list ────────────────────────────────────────────── */}
            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderProduct}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <TouchableOpacity onPress={() => navigation.navigate('SalesHistory')} style={styles.historyLink}>
                        <Text style={styles.historyLinkText}>View Sales History →</Text>
                    </TouchableOpacity>
                }
            />

            {/* ── Cart bar ────────────────────────────────────────────────── */}
            {cartItemCount > 0 && (
                <View style={styles.cartBar}>
                    <Text style={styles.cartInfo}>{cartItemCount} items · {formatCurrency(cartTotal)}</Text>
                    <TouchableOpacity
                        style={[styles.checkoutBtn, isCheckingOut && styles.checkoutBtnLoading]}
                        onPress={handleCheckout}
                        disabled={isCheckingOut}
                    >
                        <Text style={styles.checkoutText}>
                            {isCheckingOut ? 'Processing…' : 'Checkout →'}
                        </Text>
                    </TouchableOpacity>
                </View>
            )}

            {/* ── Confirm modal ───────────────────────────────────────────── */}
            <AppModal
                visible={modal === 'confirm'}
                iconName="cart-outline"
                title="Confirm Sale"
                message={`${cartItemCount} item(s)  ·  ${formatCurrency(cartTotal)}\n\nThis will deduct stock for all items.`}
                confirmLabel="Confirm Sale"
                onConfirm={handleConfirm}
                cancelLabel="Cancel"
                onCancel={() => setModal('none')}
            />

            {/* ── Success modal ───────────────────────────────────────────── */}
            <AppModal
                visible={modal === 'success'}
                iconName="checkmark-circle-outline"
                iconColor={Colors.secondary}
                iconBg={Colors.secondaryLight}
                title="Sale Recorded!"
                message="Stock has been updated and the sale has been saved."
                confirmLabel="Done"
                onConfirm={() => setModal('none')}
            />

            {/* ── Error modal ─────────────────────────────────────────────── */}
            <AppModal
                visible={modal === 'error'}
                iconName="close-circle-outline"
                title="Checkout Failed"
                message={errorMsg}
                confirmLabel="OK"
                confirmVariant="danger"
                onConfirm={() => setModal('none')}
            />
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.surface,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm,
        gap: Spacing.sm,
    },
    searchIcon: { fontSize: 16 },
    searchInput: {
        flex: 1,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        height: 36,
        paddingVertical: 0,
    },
    clearBtn: { fontSize: 14, color: Colors.textMuted, padding: 4 },
    list: { padding: Spacing.md },
    historyLink: { alignSelf: 'flex-end', marginBottom: Spacing.sm },
    historyLinkText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '600' },
    productRow: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.md,
        padding: Spacing.md,
        marginBottom: Spacing.sm,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
    },
    productInfo: { flex: 1 },
    productName: { fontSize: FontSize.md, fontWeight: '600', color: Colors.textPrimary },
    productPrice: { fontSize: FontSize.sm, color: Colors.textSecondary, marginTop: 2 },
    actions: { flexDirection: 'row', alignItems: 'center' },
    addBtn: {
        backgroundColor: Colors.primary,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
    },
    addBtnDisabled: { backgroundColor: Colors.textMuted },
    addBtnText: { color: Colors.white, fontSize: 20, lineHeight: 24 },
    removeBtn: {
        backgroundColor: Colors.dangerLight,
        width: 32,
        height: 32,
        borderRadius: 16,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 4,
    },
    removeBtnText: { color: Colors.danger, fontSize: 20, lineHeight: 24 },
    qtyText: { fontSize: FontSize.md, fontWeight: 'bold', color: Colors.textPrimary, minWidth: 20, textAlign: 'center', marginRight: 4 },
    cartBar: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.md,
        paddingHorizontal: Spacing.lg,
    },
    cartInfo: { color: Colors.white, fontSize: FontSize.md, fontWeight: '600' },
    checkoutBtn: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.md,
        paddingHorizontal: Spacing.md,
        paddingVertical: Spacing.sm + 2,
        minWidth: 110,
        alignItems: 'center',
    },
    checkoutBtnLoading: {
        opacity: 0.7,
    },
    checkoutText: {
        color: Colors.primary,
        fontWeight: '700',
        fontSize: FontSize.md,
    },
});
