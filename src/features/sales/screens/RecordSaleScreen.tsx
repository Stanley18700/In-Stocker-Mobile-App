import React, { useEffect } from 'react';
import {
    View,
    Text,
    FlatList,
    TouchableOpacity,
    StyleSheet,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { useInventory } from '../../inventory/hooks/useInventory';
import { useSales } from '../hooks/useSales';
import { Colors, Spacing, FontSize, BorderRadius } from '../../../constants/theme';
import { formatCurrency } from '../../../shared/utils/formatters';
import { Product } from '../../../shared/types/product';
import { StackNavigationProp } from '@react-navigation/stack';
import { SalesStackParamList } from '../../../core/navigation/types';

type Props = {
    navigation: StackNavigationProp<SalesStackParamList, 'RecordSale'>;
};

export default function RecordSaleScreen({ navigation }: Props) {
    const { products, fetchProducts } = useInventory();
    const { cart, cartTotal, cartItemCount, addProductToCart, removeFromCart, checkout, isLoading } = useSales();

    useEffect(() => {
        fetchProducts();
    }, []);

    const handleCheckout = async () => {
        if (cart.length === 0) {
            Alert.alert('Empty Cart', 'Add products to the cart first.');
            return;
        }
        Alert.alert('Confirm Sale', `Total: ${formatCurrency(cartTotal)}`, [
            { text: 'Cancel', style: 'cancel' },
            {
                text: 'Confirm',
                onPress: async () => {
                    try {
                        await checkout();
                        Alert.alert('Success', 'Sale recorded!');
                    } catch (e: any) {
                        Alert.alert('Error', e.message);
                    }
                },
            },
        ]);
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
                            <Text style={styles.removeBtnText}>−</Text>
                        </TouchableOpacity>
                    )}
                    {inCart && <Text style={styles.qtyText}>{inCart.quantity}</Text>}
                    <TouchableOpacity
                        style={[styles.addBtn, item.quantity === 0 && styles.addBtnDisabled]}
                        onPress={() => addProductToCart(item)}
                        disabled={item.quantity === 0}
                    >
                        <Text style={styles.addBtnText}>+</Text>
                    </TouchableOpacity>
                </View>
            </View>
        );
    };

    return (
        <View style={styles.container}>
            <FlatList
                data={products}
                keyExtractor={(item) => item.id}
                renderItem={renderProduct}
                contentContainerStyle={styles.list}
                ListHeaderComponent={
                    <TouchableOpacity onPress={() => navigation.navigate('SalesHistory')} style={styles.historyLink}>
                        <Text style={styles.historyLinkText}>View Sales History →</Text>
                    </TouchableOpacity>
                }
            />
            {cartItemCount > 0 && (
                <View style={styles.cartBar}>
                    <Text style={styles.cartInfo}>{cartItemCount} items · {formatCurrency(cartTotal)}</Text>
                    <TouchableOpacity style={styles.checkoutBtn} onPress={handleCheckout} disabled={isLoading}>
                        {isLoading ? <ActivityIndicator color={Colors.white} /> : <Text style={styles.checkoutText}>Checkout</Text>}
                    </TouchableOpacity>
                </View>
            )}
        </View>
    );
}

const styles = StyleSheet.create({
    container: { flex: 1, backgroundColor: Colors.background },
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
        paddingVertical: Spacing.sm,
    },
    checkoutText: { color: Colors.primary, fontWeight: '700', fontSize: FontSize.sm },
});
