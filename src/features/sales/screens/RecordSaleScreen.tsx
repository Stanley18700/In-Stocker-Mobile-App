import React, { useEffect, useState } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    TextInput,
    useWindowDimensions,
    Platform,
} from 'react-native';
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
    const { width } = useWindowDimensions();
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
                    <Text style={styles.productName} numberOfLines={2}>{item.name}</Text>
                    <Text style={styles.productPrice}>{formatCurrency(item.price)}</Text>
                    <Text style={styles.stockLabel}>
                        Stock: <Text style={{ color: item.quantity === 0 ? Colors.danger : Colors.textPrimary }}>{item.quantity}</Text>
                    </Text>
                </View>
                <View style={styles.actions}>
                    {inCart && (
                        <TouchableOpacity style={styles.qtyControlBtn} onPress={() => removeFromCart(item.id)}>
                            <Text style={styles.qtyControlBtnText}>−</Text>
                        </TouchableOpacity>
                    )}
                    {inCart && <Text style={styles.qtyText}>{inCart.quantity}</Text>}
                    <TouchableOpacity
                        style={[styles.qtyControlBtn, styles.qtyControlAdd, item.quantity === 0 && styles.qtyControlDisabled]}
                        onPress={() => addProductToCart(item)}
                        disabled={item.quantity === 0}
                    >
                        <Text style={styles.qtyControlAddText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    const isWebWide = Platform.OS === 'web' && width > 768;

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View style={styles.searchBar}>
                    <Text style={styles.searchIcon}>🔍</Text>
                    <TextInput
                        style={styles.searchInput}
                        placeholder="Search products..."
                        placeholderTextColor={Colors.textMuted}
                        value={query}
                        onChangeText={setQuery}
                        returnKeyType="search"
                    />
                    {query.length > 0 && (
                        <TouchableOpacity onPress={() => setQuery('')} style={styles.clearBtnWrap}>
                            <Text style={styles.clearBtn}>✕</Text>
                        </TouchableOpacity>
                    )}
                </View>
            </View>

            <FlatList
                data={filtered}
                keyExtractor={(item) => item.id}
                renderItem={renderProduct}
                contentContainerStyle={[styles.list, isWebWide && styles.listWebWide, { paddingBottom: cartItemCount > 0 ? 100 : Spacing.xl }]}
                numColumns={isWebWide ? 2 : 1}
                key={isWebWide ? 'grid' : 'list'}
                columnWrapperStyle={isWebWide ? styles.columnWrapper : undefined}
                ListHeaderComponent={
                    <View style={styles.listHeader}>
                        <Text style={styles.listTitle}>Available Products</Text>
                        <TouchableOpacity onPress={() => navigation.navigate('SalesHistory')} style={styles.historyLink}>
                            <Text style={styles.historyLinkText}>View History →</Text>
                        </TouchableOpacity>
                    </View>
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No products found.</Text>
                }
            />

            {cartItemCount > 0 && (
                <View style={styles.cartBarWrapper}>
                    <View style={[styles.cartBar, isWebWide && styles.cartBarWebWide]}>
                        <View style={styles.cartBarLeft}>
                            <Text style={styles.cartInfoCount}>{cartItemCount} item{cartItemCount > 1 ? 's' : ''}</Text>
                            <Text style={styles.cartInfoTotal}>{formatCurrency(cartTotal)}</Text>
                        </View>
                        <TouchableOpacity
                            style={[styles.checkoutBtn, isCheckingOut && styles.checkoutBtnLoading]}
                            onPress={handleCheckout}
                            disabled={isCheckingOut}
                            activeOpacity={0.8}
                        >
                            <Text style={styles.checkoutText}>
                                {isCheckingOut ? 'Processing…' : 'Checkout'}
                            </Text>
                            {!isCheckingOut && <Text style={styles.checkoutIcon}>→</Text>}
                        </TouchableOpacity>
                    </View>
                </View>
            )}

            {/* ── Confirm modal ───────────────────────────────────────────── */}
            <AppModal
                visible={modal === 'confirm'}
                icon="🛒"
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
                icon="✅"
                title="Sale Recorded!"
                message="Stock has been updated and the sale has been saved."
                confirmLabel="Done"
                onConfirm={() => setModal('none')}
            />

            {/* ── Error modal ─────────────────────────────────────────────── */}
            <AppModal
                visible={modal === 'error'}
                icon="❌"
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
    header: {
        backgroundColor: Colors.surface,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.md,
        borderBottomWidth: 1,
        borderBottomColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.03,
        shadowRadius: 4,
        elevation: 2,
        zIndex: 10,
    },
    searchBar: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: Colors.background,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.md,
        paddingVertical: 6,
        borderWidth: 1,
        borderColor: Colors.border,
    },
    searchIcon: { fontSize: 16, marginRight: Spacing.sm },
    searchInput: {
        flex: 1,
        fontSize: FontSize.md,
        color: Colors.textPrimary,
        height: 38,
        paddingVertical: 0,
    },
    clearBtnWrap: {
        padding: 4,
        justifyContent: 'center',
        alignItems: 'center',
    },
    clearBtn: { fontSize: 14, color: Colors.textMuted },
    list: { padding: Spacing.lg },
    listWebWide: { maxWidth: 1000, alignSelf: 'center', width: '100%' },
    columnWrapper: { gap: Spacing.md },
    listHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: Spacing.lg,
    },
    listTitle: { fontSize: FontSize.lg, fontWeight: 'bold', color: Colors.textPrimary },
    historyLinkText: { color: Colors.primary, fontSize: FontSize.sm, fontWeight: '700' },
    productRow: {
        backgroundColor: Colors.surface,
        borderRadius: BorderRadius.lg,
        padding: Spacing.lg,
        marginBottom: Spacing.md,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        borderWidth: 1,
        borderColor: Colors.border,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 3,
        elevation: 1,
        flex: 1,
    },
    productInfo: { flex: 1, paddingRight: Spacing.md },
    productName: { fontSize: FontSize.md, fontWeight: '700', color: Colors.textPrimary, marginBottom: 4 },
    productPrice: { fontSize: FontSize.md, color: Colors.primary, fontWeight: '600', marginBottom: 6 },
    stockLabel: { fontSize: FontSize.xs, color: Colors.textMuted, fontWeight: '500' },
    actions: { flexDirection: 'row', alignItems: 'center', gap: Spacing.sm },
    qtyControlBtn: {
        width: 36,
        height: 36,
        borderRadius: 18,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: Colors.dangerLight,
    },
    qtyControlAdd: {
        backgroundColor: Colors.primaryLight,
    },
    qtyControlDisabled: { backgroundColor: Colors.border, opacity: 0.5 },
    qtyControlBtnText: { color: Colors.danger, fontSize: 22, lineHeight: 26, fontWeight: '600' },
    qtyControlAddText: { color: Colors.primary, fontSize: 22, lineHeight: 26, fontWeight: '600' },
    qtyText: { fontSize: FontSize.md, fontWeight: 'bold', color: Colors.textPrimary, minWidth: 28, textAlign: 'center' },
    emptyText: { textAlign: 'center', color: Colors.textMuted, marginTop: Spacing.xl, fontSize: FontSize.md },
    cartBarWrapper: {
        position: 'absolute',
        bottom: 24,
        left: 0,
        right: 0,
        alignItems: 'center',
        paddingHorizontal: Spacing.md,
    },
    cartBar: {
        backgroundColor: Colors.primary,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: Spacing.sm + 4,
        paddingHorizontal: Spacing.lg,
        borderRadius: BorderRadius.full,
        width: '100%',
        maxWidth: 600,
        shadowColor: '#2563EB',
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.25,
        shadowRadius: 16,
        elevation: 8,
    },
    cartBarWebWide: {
        maxWidth: 800,
    },
    cartBarLeft: {
        flexDirection: 'column',
    },
    cartInfoCount: { color: Colors.blue100, fontSize: FontSize.xs, fontWeight: '600', textTransform: 'uppercase', letterSpacing: 0.5, marginBottom: 2 },
    cartInfoTotal: { color: Colors.white, fontSize: FontSize.lg, fontWeight: 'bold' },
    checkoutBtn: {
        backgroundColor: Colors.white,
        borderRadius: BorderRadius.full,
        paddingHorizontal: Spacing.lg,
        paddingVertical: Spacing.sm + 4,
        flexDirection: 'row',
        alignItems: 'center',
        gap: Spacing.xs,
        minWidth: 120,
        justifyContent: 'center',
    },
    checkoutBtnLoading: {
        opacity: 0.8,
        transform: [{ scale: 0.98 }],
    },
    checkoutText: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: FontSize.md,
    },
    checkoutIcon: {
        color: Colors.primary,
        fontWeight: 'bold',
        fontSize: 16,
        marginLeft: 4,
    },
});
